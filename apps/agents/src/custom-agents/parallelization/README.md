# Parallelization Agent

This agent demonstrates the use of parallel processing to handle multiple tasks simultaneously, improving efficiency and response time.

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
          "description": "The name of the language model to use for processing tasks in parallel. Should be in the form: provider/model-name.",
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

The agent processes tasks in parallel to improve efficiency:

1. Receives multiple tasks or requests
2. Distributes them across parallel processing nodes
3. Aggregates results from all parallel processes
4. Returns a combined response

To use the agent:
1. Select it from the agent dropdown in the LangGraph studio interface
2. Send your tasks or requests
3. The agent will process them in parallel and return the combined results

## Development

The agent's behavior can be customized by:
1. Modifying the parallel processing logic
2. Adjusting the number of parallel nodes
3. Changing the aggregation strategy
4. Updating the model used for processing
