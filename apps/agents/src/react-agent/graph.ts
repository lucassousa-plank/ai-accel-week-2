import { AIMessage } from "@langchain/core/messages";
import { LangGraphRunnableConfig, MessagesAnnotation, StateGraph } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { v4 as uuidv4 } from "uuid";
import { MemorySaver } from "@langchain/langgraph-checkpoint";
import { InMemoryStore } from "@langchain/langgraph";
import { ConfigurationSchema, ensureConfiguration } from "./configuration.js";
import { TOOLS } from "./tools.js";
import { loadChatModel } from "./utils.js";

const inMemoryStore = new InMemoryStore();

// Define the function that calls the model
async function callModel(
  state: typeof MessagesAnnotation.State,
  config: LangGraphRunnableConfig,
): Promise<typeof MessagesAnnotation.Update> {
  /** Call the LLM powering our agent. **/
  const configuration = ensureConfiguration(config);
  const store = config.store;
  if (!store) {
    throw new Error("Store is required for this graph");
  }
  if (!configuration.userId) {
    throw new Error("User ID is required");
  }
  const namespace = ["memories", configuration.userId];
  const memories = await store.search(namespace);
  const info = memories.map((d) => d.value.data).join("\n");

  const lastMessage = state.messages[state.messages.length - 1];
  if (typeof lastMessage.content === "string" && lastMessage.content.toLowerCase().includes("remember")) {
    await store.put(namespace, uuidv4(), {
      data: lastMessage.content,
    });
  }

  // Feel free to customize the prompt, model, and other logic!
  const model = (await loadChatModel(configuration.model)).bindTools(TOOLS);

  const response = await model.invoke([
    {
      role: "system",
      content: configuration.systemPromptTemplate.replace(
        "{system_time}",
        new Date().toISOString(),
      ).replace("{user_info}", info),
    },
    ...state.messages,
  ]);

  // We return a list, because this will get added to the existing list
  return { messages: [response] };
}

// Define the function that determines whether to continue or not
function routeModelOutput(state: typeof MessagesAnnotation.State): string {
  const messages = state.messages;
  const lastMessage = messages[messages.length - 1];
  // If the LLM is invoking tools, route there.
  if ((lastMessage as AIMessage)?.tool_calls?.length || 0 > 0) {
    return "tools";
  }
  // Otherwise end the graph.
  else {
    return "__end__";
  }
}

// Define a new graph. We use the prebuilt MessagesAnnotation to define state:
// https://langchain-ai.github.io/langgraphjs/concepts/low_level/#messagesannotation
const workflow = new StateGraph(MessagesAnnotation, ConfigurationSchema)
  // Define the two nodes we will cycle between
  .addNode("callModel", callModel)
  .addNode("tools", new ToolNode(TOOLS))
  // Set the entrypoint as `callModel`
  // This means that this node is the first one called
  .addEdge("__start__", "callModel")
  .addConditionalEdges(
    // First, we define the edges' source node. We use `callModel`.
    // This means these are the edges taken after the `callModel` node is called.
    "callModel",
    // Next, we pass in the function that will determine the sink node(s), which
    // will be called after the source node is called.
    routeModelOutput,
  )
  // This means that after `tools` is called, `callModel` node is called next.
  .addEdge("tools", "callModel");

// Finally, we compile it!
// This compiles it into a graph you can invoke and deploy.
export const graph = workflow.compile({
  checkpointer: new MemorySaver(),
  store: inMemoryStore,
  interruptBefore: [], // if you want to update the state before calling the tools
  interruptAfter: [],
});
