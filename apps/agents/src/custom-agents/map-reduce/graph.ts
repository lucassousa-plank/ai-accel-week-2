import { StateGraph, Annotation, Send, END, START } from "@langchain/langgraph";
import { AgentConfigurationAnnotation, ensureAgentConfiguration } from "./configuration.js";
import { RunnableConfig } from "@langchain/core/runnables";
import { subjectsPrompt, jokePrompt, bestJokePrompt } from "./prompts.js";
import { loadChatModel } from "./utils.js";
import { z } from "zod";

// Graph state

// This will be the overall state of the main graph.
// It will contain a topic (which we expect the user to provide)
// and then will generate a list of subjects, and then a joke for
// each subject
const OverallState = Annotation.Root({
    topic: Annotation<string>,
    subjects: Annotation<string[]>,
    // Notice here we pass a reducer function.
    // This is because we want combine all the jokes we generate
    // from individual nodes back into one list.
    jokes: Annotation<string[]>({
        reducer: (state, update) => state.concat(update),
    }),
    bestSelectedJoke: Annotation<string>,
});

// This will be the state of the node that we will "map" all
// subjects to in order to generate a joke
interface JokeState {
    subject: string;
}

// Zod schemas for getting structured output from the LLM
const Subjects = z.object({
    subjects: z.array(z.string()),
});
const Joke = z.object({
    joke: z.string(),
});
const BestJoke = z.object({
    id: z.number(),
});

// Define node functions
// Nodes
// This is the function we will use to generate the subjects of the jokes
const generateTopics = async (
    state: typeof OverallState.State,
    config: RunnableConfig
): Promise<Partial<typeof OverallState.State>> => {
    const configuration = ensureAgentConfiguration(config);
    const llm = await loadChatModel(configuration.modelName);
    const prompt = subjectsPrompt.replace("topic", state.topic);
    const response = await llm
        .withStructuredOutput(Subjects, { name: "subjects" })
        .invoke(prompt);
    return { subjects: response.subjects };
};

// Function to generate a joke
const generateJoke = async (state: JokeState, config: RunnableConfig): Promise<{ jokes: string[] }> => {
    const configuration = ensureAgentConfiguration(config);
    const llm = await loadChatModel(configuration.modelName);
    const prompt = jokePrompt.replace("subject", state.subject);
    const response = await llm
        .withStructuredOutput(Joke, { name: "joke" })
        .invoke(prompt);
    return { jokes: [response.joke] };
};

// Here we define the logic to map out over the generated subjects
// We will use this an edge in the graph
const continueToJokes = (state: typeof OverallState.State) => {
    // We will return a list of `Send` objects
    // Each `Send` object consists of the name of a node in the graph
    // as well as the state to send to that node
    return state.subjects.map((subject) => new Send("generateJoke", { subject }));
};

// Here we will judge the best joke
const bestJoke = async (
    state: typeof OverallState.State,
    config: RunnableConfig
): Promise<Partial<typeof OverallState.State>> => {
    const configuration = ensureAgentConfiguration(config);
    const llm = await loadChatModel(configuration.modelName);
    const jokes = state.jokes.join("\n\n");
    const prompt = bestJokePrompt
        .replace("jokes", jokes)
        .replace("topic", state.topic);
    const response = await llm
        .withStructuredOutput(BestJoke, { name: "best_joke" })
        .invoke(prompt);
    return { bestSelectedJoke: state.jokes[response.id] };
};
  

// Build workflow
// NOTE: there are no edges between nodes A, B and C!
const mapReduceGraph = new StateGraph(OverallState, AgentConfigurationAnnotation)
    .addNode("generateTopics", generateTopics)
    .addNode("generateJoke", generateJoke)
    .addNode("bestJoke", bestJoke)
    .addEdge(START, "generateTopics")
    .addConditionalEdges("generateTopics", continueToJokes)
    .addEdge("generateJoke", "bestJoke")
    .addEdge("bestJoke", END);

// Finally, we compile it!
// This compiles it into a graph you can invoke and deploy.
export const graph = mapReduceGraph.compile({
    interruptBefore: [], // if you want to update the state before calling the tools
    interruptAfter: [],
});