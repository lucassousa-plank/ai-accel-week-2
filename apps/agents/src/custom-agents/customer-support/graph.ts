import { AIMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";
import { Annotation, END, LangGraphRunnableConfig, MessagesAnnotation, NodeInterrupt, START, StateGraph } from "@langchain/langgraph";
import { MemorySaver } from "@langchain/langgraph-checkpoint";
import { ConfigurationSchema, ensureConfiguration } from "./configuration.js";
import { loadChatModel } from "./utils.js";
import { z } from "zod";

const StateAnnotation = Annotation.Root({
  ...MessagesAnnotation.spec,
  nextNode: Annotation<string>,
  authorizedRefund: Annotation<boolean>
})

async function initialSupport(
  state: typeof StateAnnotation.State,
  config: LangGraphRunnableConfig,
): Promise<typeof StateAnnotation.Update> {
  /** Call the LLM powering our agent. **/
  const configuration = ensureConfiguration(config);
  const model = await loadChatModel(configuration.model)

  const supportSystemMessage = new SystemMessage(configuration.initialSupportPromptTemplate);
  const supportResponse = await model.invoke([
    supportSystemMessage,
    ...state.messages,
  ]);

  const routingSchema = z.object({
    nextNode: z.enum(["billing", "technical", "conversation"]).describe("The next node to route the user to.")
  });

  const structuredModel = model.withStructuredOutput(routingSchema);
  const routingResponse = await structuredModel.invoke([
    new SystemMessage(configuration.chooseSupportPromptTemplate),
    ...state.messages,
    new HumanMessage(configuration.chooseSupportHumanPromptTemplate),
  ]);
  
  console.log("--- ROUTING RESPONSE ---");
  console.log(routingResponse);
  return { messages: [supportResponse], nextNode: routingResponse.nextNode };
}

async function technicalSupport(
  state: typeof StateAnnotation.State,
  config: LangGraphRunnableConfig,
): Promise<typeof StateAnnotation.Update> {
  /** Call the LLM powering our agent. **/
  const configuration = ensureConfiguration(config);
  const model = await loadChatModel(configuration.model);

  let trimmedHistory = state.messages.slice(0, -1);

  const supportSystemMessage = new SystemMessage(configuration.technicalSupportPromptTemplate);
  const supportResponse = await model.invoke([
    supportSystemMessage,
    ...trimmedHistory,
  ]);

  return { messages: [supportResponse] };
}

async function billingSupport(
  state: typeof StateAnnotation.State,
  config: LangGraphRunnableConfig,
): Promise<typeof StateAnnotation.Update> {
  /** Call the LLM powering our agent. **/
  const configuration = ensureConfiguration(config);
  const model = await loadChatModel(configuration.model);

  let trimmedHistory = state.messages.slice(0, -1);
  const billingExpertSystemMessage = new SystemMessage(configuration.billingSupportPromptTemplate);
  const billingExpertResponse = await model.invoke([
    billingExpertSystemMessage,
    ...trimmedHistory,
  ]);

  const routingSchema = z.object({
    nextNode: z.enum(["accept", "refuse"]).describe("The next node to route the user to.")
  })

  const structuredModel = model.withStructuredOutput(routingSchema);
  const routingResponse = await structuredModel.invoke([
    new SystemMessage(configuration.refundChoicePromptTemplate),
    billingExpertResponse,
    new HumanMessage(configuration.refundChoiceHumanPromptTemplate),
  ]);

  return { messages: [billingExpertResponse], nextNode: routingResponse.nextNode };
}

async function refundTool(
  state: typeof StateAnnotation.State
): Promise<typeof StateAnnotation.Update> {
  if (!state.authorizedRefund) {
    console.log("--- HUMAN AUTHORIZATION REQUIRED FOR REFUND ---");
    throw new NodeInterrupt("Human authorization required.")
  }

  const response = new AIMessage("Refund approved!")
  return { messages: [response] };
}


// Define the function that determines whether to continue or not
function routeInitialSupport(state: typeof StateAnnotation.State): string {
  if (state.nextNode.includes("billing")) {
    return "billing";
  } else if (state.nextNode.includes("technical")) {
    return "technical";
  } else {
    return "conversation";
  }
}

function routeBillingSupport(state: typeof StateAnnotation.State): string {
  if (state.nextNode.includes("accept")) {
    return "accept";
  } else {
    return "refuse"
  }
}

const workflow = new StateGraph(StateAnnotation, ConfigurationSchema)
  .addNode("initialSupport", initialSupport)
  .addNode("technicalSupport", technicalSupport)
  .addNode("billingSupport", billingSupport)
  .addNode("refundTool", refundTool)
  .addEdge(START, "initialSupport")
  .addConditionalEdges("initialSupport",
    routeInitialSupport,
    {
      "technical": "technicalSupport",
      "billing": "billingSupport",
      "conversation": END
    })
  .addConditionalEdges("billingSupport",
    routeBillingSupport,
    {
      "accept": "refundTool",
      "refuse": END
    })
  .addEdge("refundTool", END)
  .addEdge("technicalSupport", END)
  .addEdge("billingSupport", END)
// Finally, we compile it!
// This compiles it into a graph you can invoke and deploy.
export const graph = workflow.compile({
  checkpointer: new MemorySaver(),
  interruptBefore: [], // if you want to update the state before calling the tools
  interruptAfter: [],
});
