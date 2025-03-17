import { StateGraph, Annotation } from "@langchain/langgraph";
import { loadChatModel } from "./utils.js";
import { AgentConfigurationAnnotation, ensureAgentConfiguration } from "./configuration.js";
import { RunnableConfig } from "@langchain/core/runnables";
import { z } from "zod";

// Graph state
const StateAnnotation = Annotation.Root({
    input: Annotation<string>,
    decision: Annotation<string>,
    output: Annotation<string>,
});

// Schema for structured output to use as routing logic
const routeSchema = z.object({
    step: z.enum(["poem", "story", "joke", "error"]).describe(
        "The next step in the routing process"
    ),
});

// Define node functions

// Nodes
// Write a story
async function callStoryLlm(state: typeof StateAnnotation.State, config: RunnableConfig) {
    const configuration = ensureAgentConfiguration(config);
    const llm = await loadChatModel(configuration.modelName);
    const result = await llm.invoke([{
        role: "system",
        content: "You are an expert storyteller.",
    }, {
        role: "user",
        content: state.input
    }]);
    return { output: result.content };
}

// Write a joke
async function callJokeLlm(state: typeof StateAnnotation.State, config: RunnableConfig) {
    const configuration = ensureAgentConfiguration(config);
    const llm = await loadChatModel(configuration.modelName);
    const result = await llm.invoke([{
        role: "system",
        content: "You are an expert comedian.",
    }, {
        role: "user",
        content: state.input
    }]);
    return { output: result.content };
}

// Write a poem
async function callPoemLlm(state: typeof StateAnnotation.State, config: RunnableConfig) {
    const configuration = ensureAgentConfiguration(config);
    const llm = await loadChatModel(configuration.modelName);
    const result = await llm.invoke([{
        role: "system",
        content: "You are an expert poet.",
    }, {
        role: "user",
        content: state.input
    }]);
    return { output: result.content };
}

function callDecisionError() {
    return { output: `Error: the input is not related to story, joke, or poem. Sorry, please try again.` };
}

async function callLlmRouter(state: typeof StateAnnotation.State, config: RunnableConfig) {    // Route the input to the appropriate node
    const configuration = ensureAgentConfiguration(config);
    const llm = await loadChatModel(configuration.modelName);
    const router = llm.withStructuredOutput(routeSchema);
    const decision = await router.invoke([
        {
            role: "system",
            content: "Route the input to story, joke, or poem based on the user's request. If the user's request is not related to story, joke, or poem, return 'error'."
        },
        {
            role: "user",
            content: state.input
        },
    ]);

    return { decision: decision.step };
}

// Conditional edge function to route to the appropriate node
function routeDecision(state: typeof StateAnnotation.State) {
    // Return the node name you want to visit next
    if (state.decision === "story") {
        return "callStoryLlm";
    } else if (state.decision === "joke") {
        return "callJokeLlm";
    } else if (state.decision === "poem") {
        return "callPoemLlm";
    }
    return "callDecisionError";
}


// Build workflow
const routerWorkflow = new StateGraph(StateAnnotation, AgentConfigurationAnnotation)
    .addNode("callStoryLlm", callStoryLlm)
    .addNode("callJokeLlm", callJokeLlm)
    .addNode("callPoemLlm", callPoemLlm)
    .addNode("callDecisionError", callDecisionError)
    .addNode("callLlmRouter", callLlmRouter)
    .addEdge("__start__", "callLlmRouter")
    .addConditionalEdges(
        "callLlmRouter",
        routeDecision,
        ["callStoryLlm", "callJokeLlm", "callPoemLlm", "callDecisionError"],
    )
    .addEdge("callStoryLlm", "__end__")
    .addEdge("callJokeLlm", "__end__")
    .addEdge("callPoemLlm", "__end__")
    .addEdge("callDecisionError", "__end__");

// Finally, we compile it!
// This compiles it into a graph you can invoke and deploy.
export const graph = routerWorkflow.compile({
    interruptBefore: [], // if you want to update the state before calling the tools
    interruptAfter: [],
});