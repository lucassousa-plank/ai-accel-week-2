/**
 * Define the configurable parameters for the agent.
 */
import { Annotation } from "@langchain/langgraph";
import { BILLING_SUPPORT_PROMPT_TEMPLATE, CHOOSE_SUPPORT_HUMAN_PROMPT_TEMPLATE, CHOOSE_SUPPORT_PROMPT_TEMPLATE, INITIAL_SUPPORT_PROMPT_TEMPLATE, REFUND_CHOICE_HUMAN_PROMPT_TEMPLATE, REFUND_CHOICE_PROMPT_TEMPLATE, TECHNICAL_SUPPORT_PROMPT_TEMPLATE } from "./prompts.js";
import { RunnableConfig } from "@langchain/core/runnables";

export const ConfigurationSchema = Annotation.Root({
  /**
   * The system prompt to be used by the agent.
   */
  initialSupportPromptTemplate: Annotation<string>,
  chooseSupportPromptTemplate: Annotation<string>,
  chooseSupportHumanPromptTemplate: Annotation<string>,
  technicalSupportPromptTemplate: Annotation<string>,
  billingSupportPromptTemplate: Annotation<string>,
  refundChoicePromptTemplate: Annotation<string>,
  refundChoiceHumanPromptTemplate: Annotation<string>,
  /**
   * The name of the language model to be used by the agent.
   */
  model: Annotation<string>,

  /**
   * The ID of the user interacting with the agent.
   */
  userId: Annotation<string>,
});

export function ensureConfiguration(
  config: RunnableConfig,
): typeof ConfigurationSchema.State {
  /**
   * Ensure the defaults are populated.
   */
  const configurable = config.configurable ?? {};
  return {
    initialSupportPromptTemplate:
      configurable.initialPromptTemplate ?? INITIAL_SUPPORT_PROMPT_TEMPLATE,
    chooseSupportPromptTemplate:
      configurable.chooseSupportPromptTemplate ?? CHOOSE_SUPPORT_PROMPT_TEMPLATE,
    chooseSupportHumanPromptTemplate:
      configurable.chooseSupportHumanPromptTemplate ?? CHOOSE_SUPPORT_HUMAN_PROMPT_TEMPLATE,
    technicalSupportPromptTemplate:
      configurable.technicalSupportPromptTemplate ?? TECHNICAL_SUPPORT_PROMPT_TEMPLATE,
    billingSupportPromptTemplate:
      configurable.billingSupportPromptTemplate ?? BILLING_SUPPORT_PROMPT_TEMPLATE,
    refundChoicePromptTemplate:
      configurable.refundChoicePromptTemplate ?? REFUND_CHOICE_PROMPT_TEMPLATE,
    refundChoiceHumanPromptTemplate:
      configurable.refundChoiceHumanPromptTemplate ?? REFUND_CHOICE_HUMAN_PROMPT_TEMPLATE,
    model: configurable.model ?? "openai/gpt-4o-mini",
    userId: configurable.userId ?? "defaultUser",
  };
}
