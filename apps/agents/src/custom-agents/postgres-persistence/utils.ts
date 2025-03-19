import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { initChatModel } from "langchain/chat_models/universal";

/**
 * Load a chat model from a fully specified name.
 * @param fullySpecifiedName - String in the format 'provider/model' or 'provider/account/provider/model'.
 * @returns A Promise that resolves to a BaseChatModel instance.
 */
export async function loadChatModel(fullySpecifiedName: string): Promise<BaseChatModel> {
  const index = fullySpecifiedName.indexOf("/");
  const model = index === -1
    ? await initChatModel(fullySpecifiedName)
    : await initChatModel(fullySpecifiedName.slice(index + 1), { modelProvider: fullySpecifiedName.slice(0, index) });
  
  if (!model) {
    throw new Error("Failed to initialize chat model");
  }
  return model;
}
