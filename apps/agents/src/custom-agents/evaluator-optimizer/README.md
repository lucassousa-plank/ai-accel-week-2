# Evaluator-Optimizer Agent

This agent implements a feedback-driven optimization system where an evaluator agent assesses outputs and an optimizer agent iteratively improves them based on evaluation criteria, enabling continuous refinement and quality enhancement.

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
          "description": "The name of the language model to use for evaluation and optimization. Should be in the form: provider/model-name.",
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

The agent implements an iterative optimization system:

1. Evaluator receives an output to assess
2. Analyzes the output against defined criteria
3. Provides detailed feedback and scoring
4. Optimizer receives feedback and generates improvements
5. Process repeats until quality threshold is met

To use the agent:
1. Select it from the agent dropdown in the LangGraph studio interface
2. Send your content for optimization
3. The evaluator will assess and provide feedback
4. The optimizer will refine the content
5. You'll receive the optimized result

## Development

The agent's behavior can be customized by:
1. Modifying the evaluation criteria and metrics
2. Adjusting the optimization strategies
3. Setting quality thresholds and iteration limits
4. Updating the model used for evaluation and optimization
