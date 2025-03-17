import { StateGraph, Annotation, Send} from "@langchain/langgraph";
import { loadChatModel } from "./utils.js";
import { AgentConfigurationAnnotation, ensureAgentConfiguration } from "./configuration.js";
import { RunnableConfig } from "@langchain/core/runnables";
import { z } from "zod";

// Graph state
const StateAnnotation = Annotation.Root({
    topic: Annotation<string>,
    sections: Annotation<Array<z.infer<typeof sectionSchema>>>,
    completedSections: Annotation<string[]>({
        default: () => [],
        reducer: (a, b) => a.concat(b),
    }),
    finalReport: Annotation<string>,
});

// Worker state
const WorkerStateAnnotation = Annotation.Root({
    section: Annotation<z.infer<typeof sectionSchema>>,
    completedSections: Annotation<string[]>({
        default: () => [],
        reducer: (a, b) => a.concat(b),
    }),
});

// Schema for structured output to use in planning
const sectionSchema = z.object({
    name: z.string().describe("Name for this section of the report."),
    description: z.string().describe(
        "Brief overview of the main topics and concepts to be covered in this section."
    ),
});

const sectionsSchema = z.object({
    sections: z.array(sectionSchema).describe("Sections of the report."),
});

// Define node functions

// Nodes
async function orchestrator(state: typeof StateAnnotation.State, config: RunnableConfig) {
    const configuration = ensureAgentConfiguration(config);
    const llm = await loadChatModel(configuration.modelName);
    const planner = llm.withStructuredOutput(sectionsSchema);
    // Generate queries
    const reportSections = await planner.invoke([
        { role: "system", content: "Generate a plan for the report." },
        { role: "user", content: `Here is the report topic: ${state.topic}` },
    ]);

    return { sections: reportSections.sections };
}

async function llmCall(state: typeof WorkerStateAnnotation.State, config: RunnableConfig) {
    const configuration = ensureAgentConfiguration(config);
    const llm = await loadChatModel(configuration.modelName);
    // Generate section
    const section = await llm.invoke([
        {
            role: "system",
            content: "Write a report section following the provided name and description. Include no preamble for each section. Use markdown formatting.",
        },
        {
            role: "user",
            content: `Here is the section name: ${state.section.name} and description: ${state.section.description}`,
        },
    ]);

    // Write the updated section to completed sections
    return { completedSections: [section.content] };
}

async function synthesizer(state: typeof StateAnnotation.State) {
    // List of completed sections
    const completedSections = state.completedSections;

    // Format completed section to str to use as context for final sections
    const completedReportSections = completedSections.join("\n\n---\n\n");

    return { finalReport: completedReportSections };
}

// Conditional edge function to create llm_call workers that each write a section of the report
function assignWorkers(state: typeof StateAnnotation.State) {
    // Kick off section writing in parallel via Send() API
    return state.sections.map((section) =>
        new Send("llmCall", { section })
    );
}

// Build workflow
const orchestratorWorker = new StateGraph(StateAnnotation, AgentConfigurationAnnotation)
    .addNode("orchestrator", orchestrator)
    .addNode("llmCall", llmCall)
    .addNode("synthesizer", synthesizer)
    .addEdge("__start__", "orchestrator")
    .addConditionalEdges(
        "orchestrator",
        assignWorkers,
        ["llmCall"]
    )
    .addEdge("llmCall", "synthesizer")
    .addEdge("synthesizer", "__end__");

// Finally, we compile it!
// This compiles it into a graph you can invoke and deploy.
export const graph = orchestratorWorker.compile({
    interruptBefore: [], // if you want to update the state before calling the tools
    interruptAfter: [],
});