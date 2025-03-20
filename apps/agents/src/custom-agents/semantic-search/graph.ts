import { Annotation, LangGraphRunnableConfig, MessagesAnnotation, StateGraph } from "@langchain/langgraph";
import { InMemoryStore, START, END } from "@langchain/langgraph";
import { initializeTools } from "./tools.js";
import "@tensorflow/tfjs-backend-cpu";
import { TensorFlowEmbeddings } from "@langchain/community/embeddings/tensorflow";
import { ConfigurationSchema, ensureAgentConfiguration } from "./configuration.js";
import { loadChatModel } from "./utils.js";
import { ToolNode } from "@langchain/langgraph/prebuilt";

const StateAnnotation = Annotation.Root({
  ...MessagesAnnotation.spec,
});

const embeddings = new TensorFlowEmbeddings();

const store = new InMemoryStore({
  index: {
    embeddings,
    dims: 1536,
  }
});

await store.put(
  ["user_123", "memories"],
  "italian_food",
  { "text": "I prefer Italian food" }
)
await store.put(
  ["user_123", "memories"],
  "spicy_food",
  { "text": "I don't like spicy food" }
)
await store.put(
  ["user_123", "memories"],
  "occupation",
  { "text": "I am a tunnel engineer" }
)

// now let's check that our occupation memory was overwritten
const occupation = await store.get(["user_123", "memories"], "occupation")
console.log(occupation?.value.text)

const memories = await store.search(["user_123", "memories"], {
  query: "What is my occupation?",
  limit: 3,
});

for (const memory of memories) {
  console.log(`Memory: ${memory.value.text} (similarity: ${memory.score})`);
}

async function callModel(
  state: typeof MessagesAnnotation.State,
  config: LangGraphRunnableConfig
) {
  const store = config.store as InMemoryStore;
  if (!store) {
    throw new Error("No store provided to state modifier.");
  }

  // Search based on user's last message
  const items = await store.search(
    ["user_123", "memories"],
    {
      // Assume it's not a complex message
      query: state.messages[state.messages.length - 1].content as string,
      limit: 4
    }
  );

  const memories = items.length
    ? `## Memories of user\n${items.map(item => `${item.value.text} (similarity: ${item.score})`).join("\n")
    }`
    : "";

  // Create messages array with system message containing memories
  const messages = [
    { role: "system", content: `You are a helpful assistant.\n${memories}` },
    ...state.messages
  ];
  const configuration = ensureAgentConfiguration(config);
  const llm = await loadChatModel(configuration.model);
  const response = await llm.invoke(messages);
  return { messages: [response] };
}

const toolsNode = new ToolNode(initializeTools());

export const builder = new StateGraph(
  StateAnnotation,
  ConfigurationSchema,
)
  .addNode("callModel", callModel)
  .addNode("tools", toolsNode)
  .addEdge(START, "callModel")
  .addConditionalEdges(
    "callModel",
    (state) => {
      const lastMessage = state.messages[state.messages.length - 1];
      return (lastMessage as any)?.tool_calls?.length ? "tools" : END;
    },
    {
      tools: "tools",
      [END]: END,
    }
  )
  .addEdge("tools", "callModel");

// Finally, we compile it!
// This compiles it into a graph you can invoke and deploy.
export const graph = builder.compile({
  store,
  interruptBefore: [], // if you want to update the state before calling the tools
  interruptAfter: [],
});
