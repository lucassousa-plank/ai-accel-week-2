# Routing Agent

This agent demonstrates the use of intelligent routing to direct tasks to the most appropriate specialized agent or handler based on the task's requirements and characteristics.

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
          "description": "The name of the language model to use for routing decisions. Should be in the form: provider/model-name.",
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

The agent intelligently routes tasks to appropriate handlers:

1. Receives a task or request
2. Analyzes the task's requirements and characteristics
3. Determines the most suitable specialized agent or handler
4. Routes the task to the selected handler
5. Returns the handler's response

To use the agent:
1. Select it from the agent dropdown in the LangGraph studio interface
2. Send your task or request
3. The agent will analyze the task and route it to the most appropriate handler
4. You'll receive the response from the specialized handler

## Development

The agent's behavior can be customized by:
1. Modifying the routing logic and decision criteria
2. Adding or removing available specialized handlers
3. Adjusting the routing rules and priorities
4. Updating the model used for routing decisions
