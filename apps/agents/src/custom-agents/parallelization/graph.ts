import { StateGraph, Annotation } from "@langchain/langgraph";
import { loadChatModel } from "./utils.js";
import { AgentConfigurationAnnotation, ensureAgentConfiguration } from "./configuration.js";
import { RunnableConfig } from "@langchain/core/runnables";

// Graph state
const StateAnnotation = Annotation.Root({
    topic: Annotation<string>,
    joke: Annotation<string>,
    story: Annotation<string>,
    poem: Annotation<string>,
    combinedOutput: Annotation<string>,
});

// Define node functions

// Nodes
// First LLM call to generate initial joke
async function callLlm1(state: typeof StateAnnotation.State, config: RunnableConfig) {
    const configuration = ensureAgentConfiguration(config);
    const llm = await loadChatModel(configuration.modelName);
    const msg = await llm.invoke(`Write a joke about ${state.topic}`);
    return { joke: msg.content };
}

// Second LLM call to generate story
async function callLlm2(state: typeof StateAnnotation.State, config: RunnableConfig) {
    const configuration = ensureAgentConfiguration(config);
    const llm = await loadChatModel(configuration.modelName);
    const msg = await llm.invoke(`Write a story about ${state.topic}`);
    return { story: msg.content };
}

// Third LLM call to generate poem
async function callLlm3(state: typeof StateAnnotation.State, config: RunnableConfig) {
    const configuration = ensureAgentConfiguration(config);
    const llm = await loadChatModel(configuration.modelName);
    const msg = await llm.invoke(`Write a poem about ${state.topic}`);
    return { poem: msg.content };
}

// Combine the joke, story and poem into a single output
async function aggregator(state: typeof StateAnnotation.State) {
    const combined = `Here's a story, joke, and poem about ${state.topic}!\n\n` +
        `STORY:\n${state.story}\n\n` +
        `JOKE:\n${state.joke}\n\n` +
        `POEM:\n${state.poem}`;
    return { combinedOutput: combined };
}

// Build workflow
const parallelWorkflow = new StateGraph(StateAnnotation, AgentConfigurationAnnotation)
    .addNode("callLlm1", callLlm1)
    .addNode("callLlm2", callLlm2)
    .addNode("callLlm3", callLlm3)
    .addNode("aggregator", aggregator)
    .addEdge("__start__", "callLlm1")
    .addEdge("__start__", "callLlm2")
    .addEdge("__start__", "callLlm3")
    .addEdge("callLlm1", "aggregator")
    .addEdge("callLlm2", "aggregator")
    .addEdge("callLlm3", "aggregator")
    .addEdge("aggregator", "__end__");

// Finally, we compile it!
// This compiles it into a graph you can invoke and deploy.
export const graph = parallelWorkflow.compile({
    interruptBefore: [], // if you want to update the state before calling the tools
    interruptAfter: [],
});

// Invoke
const state = await graph.invoke({ topic: "cats" });
