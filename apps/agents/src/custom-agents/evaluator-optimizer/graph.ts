import { StateGraph, Annotation } from "@langchain/langgraph";
import { loadChatModel } from "./utils.js";
import { AgentConfigurationAnnotation, ensureAgentConfiguration } from "./configuration.js";
import { RunnableConfig } from "@langchain/core/runnables";
import { z } from "zod";

// Graph state
const StateAnnotation = Annotation.Root({
    topic: Annotation<string>,
    joke: Annotation<string>,
    feedback: Annotation<string>,
    funnyOrNot: Annotation<string>,
});

// Schema for structured output to use in evaluation
const feedbackSchema = z.object({
    grade: z.enum(["funny", "not funny"]).describe(
        "Decide if the joke is funny or not."
    ),
    feedback: z.string().describe(
        "If the joke is not funny, provide feedback on how to improve it."
    ),
});

// Define node functions

// Nodes
// Nodes
async function llmCallGenerator(state: typeof StateAnnotation.State, config: RunnableConfig) {
    const configuration = ensureAgentConfiguration(config);
    const llm = await loadChatModel(configuration.modelName);
    // LLM generates a joke
    let msg;
    if (state.feedback) {
        msg = await llm.invoke(
            `Write a joke about ${state.topic} but take into account the feedback: ${state.feedback}`
        );
    } else {
        msg = await llm.invoke(`Write a joke about ${state.topic}`);
    }
    return { joke: msg.content };
}

async function llmCallEvaluator(state: typeof StateAnnotation.State, config: RunnableConfig) {
    const configuration = ensureAgentConfiguration(config);
    const llm = await loadChatModel(configuration.modelName);
    const evaluator = llm.withStructuredOutput(feedbackSchema);
    // LLM evaluates the joke
    const grade = await evaluator.invoke(`Grade the joke ${state.joke}`);
    return { funnyOrNot: grade.grade, feedback: grade.feedback };
}

// Conditional edge function to route back to joke generator or end based upon feedback from the evaluator
function routeJoke(state: typeof StateAnnotation.State) {
    // Route back to joke generator or end based upon feedback from the evaluator
    if (state.funnyOrNot === "funny") {
        return "Accepted";
    } else if (state.funnyOrNot === "not funny") {
        return "Rejected + Feedback";
    }
    return "Rejected + Feedback"
}

// Build workflow
const optimizerWorkflow = new StateGraph(StateAnnotation, AgentConfigurationAnnotation)
    .addNode("llmCallGenerator", llmCallGenerator)
    .addNode("llmCallEvaluator", llmCallEvaluator)
    .addEdge("__start__", "llmCallGenerator")
    .addEdge("llmCallGenerator", "llmCallEvaluator")
    .addConditionalEdges(
        "llmCallEvaluator",
        routeJoke,
        {
            // Name returned by routeJoke : Name of next node to visit
            "Accepted": "__end__",
            "Rejected + Feedback": "llmCallGenerator",
        }
    )
// Finally, we compile it!
// This compiles it into a graph you can invoke and deploy.
export const graph = optimizerWorkflow.compile({
    interruptBefore: [], // if you want to update the state before calling the tools
    interruptAfter: [],
});