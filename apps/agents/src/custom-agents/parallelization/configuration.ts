/**
 * Define the configurable parameters for the prompt chaining agent.
 */

import { Annotation } from "@langchain/langgraph";
import { RunnableConfig } from "@langchain/core/runnables";

/**
 * Configuration annotation for the prompt chaining agent.
 * 
 * This annotation defines the parameters needed for configuring the prompt chaining
 * process, including the model selection and chain-specific parameters.
 */
export const AgentConfigurationAnnotation = Annotation.Root({
    /**
     * The LLM model to use for generating and improving jokes.
     * Default is "openai/gpt-4o-mini"
     */
    modelName: Annotation<string>,
});

/**
 * Create a AgentConfigurationAnnotation.State instance from a RunnableConfig object.
 *
 * @param config - The configuration object to use.
 * @returns An instance of typeof AgentConfigurationAnnotation.State with the specified configuration.
 */
export function ensureAgentConfiguration(
    config: RunnableConfig,
): typeof AgentConfigurationAnnotation.State {
    const configurable = config.configurable ?? {};
    return {
        modelName: configurable.modelName || "openai/gpt-4o-mini",
    };
}
