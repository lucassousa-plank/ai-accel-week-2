# Map-Reduce Example

This example demonstrates how to implement a map-reduce pattern in LangGraph for parallel processing of tasks. The graph generates jokes about a given topic by first mapping the topic to subjects, then generating jokes for each subject in parallel, and finally reducing them to select the best joke.

## Graph Structure

The graph consists of three main nodes and uses conditional edges for mapping:

### Nodes
1. `generateTopics`: Generates a list of subjects related to the input topic
2. `generateJoke`: Generates a joke for each subject (runs in parallel)
3. `bestJoke`: Selects the best joke from all generated jokes

### State Management
The graph maintains state through:
- `topic`: The input topic for joke generation
- `subjects`: Array of subjects generated from the topic
- `jokes`: Array of generated jokes (uses reducer to combine parallel results)
- `bestSelectedJoke`: The final selected best joke

## Usage

```typescript
// Invoke the graph with a topic
graph.invoke({
    topic: "programming",  // Your desired topic
});
```

## Example Output

With topic "programming":
```json
{
    "topic": "programming",
    "subjects": ["debugging", "coffee", "syntax errors"],
    "jokes": [
        "Why do programmers prefer dark mode? Because light attracts bugs!",
        "What's a programmer's favorite time? Coffee o'clock!",
        "Why do programmers hate syntax errors? Because they're not very punny!"
    ],
    "bestSelectedJoke": "Why do programmers prefer dark mode? Because light attracts bugs!"
}
```

## Key Features

1. **Parallel Processing**: Uses map-reduce pattern for parallel joke generation
2. **Structured Output**: Uses Zod schemas for type-safe LLM outputs
3. **State Management**: Demonstrates complex state handling with reducers
4. **Dynamic Model Loading**: Supports different LLM models through configuration

## Implementation Details

### State Definition
```typescript
const OverallState = Annotation.Root({
    topic: Annotation<string>,
    subjects: Annotation<string[]>,
    jokes: Annotation<string[]>({
        reducer: (state, update) => state.concat(update),
    }),
    bestSelectedJoke: Annotation<string>,
});
```

### Graph Definition
```typescript
const mapReduceGraph = new StateGraph(OverallState, AgentConfigurationAnnotation)
    .addNode("generateTopics", generateTopics)
    .addNode("generateJoke", generateJoke)
    .addNode("bestJoke", bestJoke)
    .addEdge(START, "generateTopics")
    .addConditionalEdges("generateTopics", continueToJokes)
    .addEdge("generateJoke", "bestJoke")
    .addEdge("bestJoke", END);
```

## Error Handling

The graph includes error handling for LLM calls and state management:
```typescript
try {
    graph.invoke({
        topic: "programming"
    });
} catch (error) {
    console.error("Error in map-reduce execution:", error);
}
```

This map-reduce example demonstrates how to effectively parallelize tasks in LangGraph while maintaining structured outputs and proper state management.