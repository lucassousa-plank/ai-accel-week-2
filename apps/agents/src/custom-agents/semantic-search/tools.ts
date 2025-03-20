/**
 * This file defines the tools available to the ReAct agent.
 * Tools are functions that the agent can use to interact with external systems or perform specific tasks.
 */
import { z } from "zod";
import { tool } from "@langchain/core/tools";
import { v4 as uuidv4 } from "uuid";
import { InMemoryStore } from "@langchain/langgraph";
import { LangGraphRunnableConfig } from "@langchain/langgraph";

export function initializeTools(config?: LangGraphRunnableConfig) {
  /**
   * Upsert a memory in the database.
   * @param input The content of the memory to store.
   * @returns A string confirming the memory storage.
   */
  async function upsertMemory(
    input: { content: string }): Promise<string> {
    const store = config?.store as InMemoryStore;
    if (!store) {
      throw new Error("No store provided to tool.");
    }
    await store.put(
      ["user_123", "memories"],
      uuidv4(), // give each memory its own unique ID
      { text: input.content }
    );
    return "Stored memory.";
  }

  const upsertMemoryTool = tool(upsertMemory, {
    name: "upsert_memory",
    schema: z.object({
      content: z.string().describe("The content of the memory to store."),
    }),
    description: "Upsert long-term memories.",
  });

  return [upsertMemoryTool];
}