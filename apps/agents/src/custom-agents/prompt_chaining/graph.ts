import { StateGraph, Annotation, MessagesAnnotation } from "@langchain/langgraph";
import { loadChatModel } from "./utils.js";
import { AgentConfigurationAnnotation, ensureAgentConfiguration } from "./configuration.js";
import { RunnableConfig } from "@langchain/core/runnables";
import { AIMessage } from "@langchain/core/messages";

// Graph state
const StateAnnotation = Annotation.Root({
    ...MessagesAnnotation.spec,
    topic: Annotation<string>,
    joke: Annotation<string>,
    improvedJoke: Annotation<string>,
    finalJoke: Annotation<string>,
});

// Define node functions

// First LLM call to generate initial joke
async function generateJoke(state: typeof StateAnnotation.State, config: RunnableConfig) {
    if (!state.topic) {
        state.topic = state.messages[state.messages.length - 1].content as string;
    }
    const configuration = ensureAgentConfiguration(config);
    const llm = await loadChatModel(configuration.modelName);
    const generatedJoke = await llm.invoke(`Write a short joke about ${state.topic}`);
    const msg = new AIMessage(`**Generated joke:** ${generatedJoke.content}`);
    return { messages: [msg], joke: generatedJoke.content };
}

// Gate function to check if the joke has a punchline
function checkPunchline(state: typeof StateAnnotation.State) {
    // Simple check - does the joke contain "?" or "!"
    if (state.joke?.includes("?") || state.joke?.includes("!")) {
        return "Pass";
    }
    return "Fail";
}

// Second LLM call to improve the joke
async function improveJoke(state: typeof StateAnnotation.State, config: RunnableConfig) {
    const configuration = ensureAgentConfiguration(config);
    const llm = await loadChatModel(configuration.modelName);
    const improvedJoke = await llm.invoke(
        `Make this joke funnier by adding wordplay: ${state.joke}`
    );
    const msg = new AIMessage(`**Improved joke:** ${improvedJoke.content}`);
    return { messages: [msg], improvedJoke: improvedJoke.content };
}

// Third LLM call for final polish
async function polishJoke(state: typeof StateAnnotation.State, config: RunnableConfig) {
    const configuration = ensureAgentConfiguration(config);
    const llm = await loadChatModel(configuration.modelName);
    const polishedJoke = await llm.invoke(
        `Add a surprising twist to this joke: ${state.improvedJoke}`
    );
    const msg = new AIMessage(`**Polished joke:** ${polishedJoke.content}`);
    return { messages: [msg], finalJoke: polishedJoke.content };
}

// Build workflow
const workflow = new StateGraph(StateAnnotation, AgentConfigurationAnnotation)
    .addNode("generateJoke", generateJoke)
    .addNode("improveJoke", improveJoke)
    .addNode("polishJoke", polishJoke)
    .addEdge("__start__", "generateJoke")
    .addConditionalEdges("generateJoke", checkPunchline, {
        Pass: "improveJoke",
        Fail: "__end__"
    })
    .addEdge("improveJoke", "polishJoke")
    .addEdge("polishJoke", "__end__");

// Finally, we compile it!
// This compiles it into a graph you can invoke and deploy.
export const graph = workflow.compile({
    interruptBefore: [], // if you want to update the state before calling the tools
    interruptAfter: [],
});