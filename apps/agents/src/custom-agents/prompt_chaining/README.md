# Prompt Chaining Agent

This agent demonstrates the use of prompt chaining to generate and improve jokes through multiple stages.

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
          "description": "The name of the language model to use for generating and improving jokes. Should be in the form: provider/model-name.",
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

The agent follows a chain of operations:
1. Generates an initial joke based on the given topic
2. Checks for a proper punchline
3. Improves the joke with wordplay
4. Adds a final polish with a surprising twist

To use the agent:
1. Select it from the agent dropdown in LangGraph studio
2. Enter a topic for the joke
3. The agent will generate and improve the joke through its chain of operations

## Development

The agent's behavior can be customized by:
1. Modifying the system prompts in the configuration
2. Adjusting the quality gate checks
3. Adding more stages to the chain
4. Changing the model used for generation
