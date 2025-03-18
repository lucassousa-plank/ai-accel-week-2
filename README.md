# LangGraph Examples Project

This project demonstrates various patterns and use cases for building applications with LangGraph. It includes both a web interface for chatting with agents and a studio interface for testing and debugging graphs.

## Project Structure

```
apps/
├── agents/             # Custom agent implementations
│   └── src/
│       └── custom-agents/
│           ├── branching/      # Branching pattern example
│           ├── command/        # Command pattern example
│           ├── map-reduce/     # Map-reduce pattern example
│           ├── recursion-limit/ # Recursion control example
│           ├── orchestrator-worker/ # Orchestrator-worker pattern example
│           ├── evaluator-optimizer/ # Evaluator-optimizer pattern example
│           ├── parallelization/ # Parallelization pattern example
│           ├── prompt_chaining/ # Prompt chaining pattern example
│           └── routing/        # Routing pattern example
└── web/               # Web interface implementation
```

## Available Custom Agents

1. **Branching Agent**: Demonstrates conditional routing and parallel execution
   - Uses scored nodes and dynamic path selection
   - Supports parallel execution of nodes

2. **Command Agent**: Shows how to use Commands for state and routing
   - Implements subgraph navigation
   - Demonstrates dynamic routing between nodes

3. **Map-Reduce Agent**: Implements parallel processing pattern
   - Generates jokes about topics using map-reduce
   - Shows parallel task execution and result aggregation

4. **Recursion-Limit Agent**: Shows how to control recursive flows
   - Implements counting with recursion limits
   - Demonstrates state management across iterations

5. **Orchestrator-Worker Agent**: Implements a workflow where an orchestrator manages multiple worker agents
   - Coordinates tasks and aggregates results from workers

6. **Evaluator-Optimizer Agent**: Implements a feedback-driven optimization system
   - Evaluates outputs and iteratively improves them based on defined criteria

7. **Parallelization Agent**: Demonstrates how to run multiple tasks in parallel
   - Efficiently manages concurrent executions to optimize performance

8. **Prompt Chaining Agent**: Shows how to chain multiple prompts together
   - Passes outputs from one prompt as inputs to the next for complex workflows

9. **Routing Agent**: Implements dynamic routing based on input conditions
   - Directs execution flow to different nodes based on user input or state

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

This will start:
- Web interface at http://localhost:3000
- LangGraph Studio at http://localhost:2024

## Using the Web Interface

The web interface provides two main ways to interact with agents:

1. **Chat Interface** (http://localhost:3000):
   - Select an agent from the dropdown
   - Currently supports basic chat functionality
   - Note: Custom model support is limited in the chat interface

2. **Studio Interface** (http://localhost:2024):
   - Full support for all custom agents
   - Provides visualization and debugging tools
   - Recommended for testing custom agents

### Available Models

The following models are supported:
- OpenAI models (requires OPENAI_API_KEY):
  - gpt-3.5-turbo
  - gpt-4
- Anthropic models (requires ANTHROPIC_API_KEY):
  - claude-2
  - claude-instant

### Environment Setup

Create a `.env` file with your API keys:
```env
OPENAI_API_KEY=your_key_here
ANTHROPIC_API_KEY=your_key_here
```

## Custom Agents in Studio

While the chat interface has limited support for custom models, all custom agents are available in the LangGraph Studio:

1. Open http://localhost:2024
2. Select an agent from the dropdown:
   - branching
   - command
   - map-reduce
   - recursion-limit
   - orchestrator-worker
   - evaluator-optimizer
   - parallelization
   - prompt_chaining
   - routing
3. Test the agent with different inputs
4. Use the visualization tools to debug and understand the flow

## Development

To add a new custom agent:

1. Create a new directory in `apps/agents/src/custom-agents/`
2. Implement the graph logic in `graph.ts`
3. Add configuration in `configuration.ts`
4. Create a README.md explaining the agent's functionality
5. Update `langgraph.json` to include the new agent

## Troubleshooting

- If agents don't appear in the dropdown, restart the LangGraph server
- Clear browser cache if you see outdated agent names
- Check the console for any API key or configuration errors

## Contributing

Feel free to contribute by:
1. Adding new custom agents
2. Improving existing implementations
3. Enhancing documentation
4. Adding tests

## License

MIT
