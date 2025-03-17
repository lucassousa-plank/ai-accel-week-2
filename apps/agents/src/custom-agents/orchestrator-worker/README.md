# Orchestrator-Worker Agent

This agent demonstrates a hierarchical architecture where an orchestrator agent coordinates and delegates tasks to specialized worker agents, enabling complex task decomposition and parallel execution.

## Configuration

The agent can be configured with the following parameters:

```json
{
  "config_schemas": {
    "agent": {
      "type": "object",
      "properties": {
        "modelName": {
          "type": "string",
          "default": "openai/gpt-4o-mini",
          "description": "The name of the language model to use for orchestration and task management. Should be in the form: provider/model-name.",
          "environment": [
            {
              "value": "anthropic/claude-1.2",
              "variables": "ANTHROPIC_API_KEY"
            },
            {
              "value": "anthropic/claude-2.0",
              "variables": "ANTHROPIC_API_KEY"
            },
            {
              "value": "anthropic/claude-2.1",
              "variables": "ANTHROPIC_API_KEY"
            },
            {
              "value": "anthropic/claude-3-7-sonnet-latest",
              "variables": "ANTHROPIC_API_KEY"
            },
            {
              "value": "anthropic/claude-3-5-haiku-latest",
              "variables": "ANTHROPIC_API_KEY"
            },
            {
              "value": "anthropic/claude-3-opus-20240229",
              "variables": "ANTHROPIC_API_KEY"
            },
            {
              "value": "anthropic/claude-3-sonnet-20240229",
              "variables": "ANTHROPIC_API_KEY"
            },
            {
              "value": "anthropic/claude-instant-1.2",
              "variables": "ANTHROPIC_API_KEY"
            },
            {
              "value": "openai/gpt-3.5-turbo",
              "variables": "OPENAI_API_KEY"
            },
            {
              "value": "openai/gpt-3.5-turbo-0125",
              "variables": "OPENAI_API_KEY"
            },
            {
              "value": "openai/gpt-3.5-turbo-0301",
              "variables": "OPENAI_API_KEY"
            },
            {
              "value": "openai/gpt-3.5-turbo-0613",
              "variables": "OPENAI_API_KEY"
            },
            {
              "value": "openai/gpt-4o-mini",
              "variables": "OPENAI_API_KEY"
            }
          ]
        }
      }
    }
  }
}
```

## Usage

The agent implements a hierarchical task management system:

1. Orchestrator receives a complex task
2. Analyzes and decomposes the task into subtasks
3. Assigns subtasks to specialized worker agents
4. Coordinates execution and collects results
5. Synthesizes final output from worker results

To use the agent:
1. Select it from the agent dropdown in the LangGraph studio interface
2. Send your complex task or project
3. The orchestrator will break it down and coordinate with workers
4. You'll receive the final synthesized result

## Development

The agent's behavior can be customized by:
1. Modifying the orchestrator's task decomposition logic
2. Adding or removing specialized worker agents
3. Adjusting coordination and communication patterns
4. Updating the model used for orchestration
