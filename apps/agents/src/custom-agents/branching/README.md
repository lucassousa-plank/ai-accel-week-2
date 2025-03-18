# Branching Example

This example demonstrates how to implement conditional branching and parallel execution in LangGraph. The graph uses a combination of conditional edges and parallel execution paths to showcase different routing patterns.

## Graph Structure

The graph consists of several nodes and a conditional router:

### Nodes
1. `nodeA`: Initial node that adds "Node A" to the aggregate state
2. `nodeB`: Node with score 1 (lowest priority)
3. `nodeC`: Node with score 2 (medium priority)
4. `nodeD`: Node with score 3 (highest priority)
5. `fanoutSink` (Node E): Final node that processes and sorts results

### Router
- `routeCDorBC`: Routes to either:
  - Nodes C and D if state.which is "cd"
  - Nodes B and C otherwise

## State Management

The graph maintains state through:
- `aggregate`: Array collecting messages from all nodes
- `which`: String determining routing path ("cd" or other)
- `fanoutValues`: Array of scored values for parallel execution

## Usage

```typescript
// Invoke the graph with routing preference
graph.invoke({
    which: "cd"  // Routes to C and D
    // or
    which: "bc"  // Routes to B and C
});
```

## Example Output

With `which: "cd"`:
```
Adding Node A to []
Adding Node C to [Node A]
Adding Node D to [Node A]
Aggregate in Node E [Node A]
Fanout result [Node D, Node C, Node E]
Final aggregate: [Node A, Node D, Node C, Node E]
```

With `which: "bc"`:
```
Adding Node A to []
Adding Node B to [Node A]
Adding Node C to [Node A]
Aggregate in Node E [Node A]
Fanout result [Node C, Node B, Node E]
Final aggregate: [Node A, Node C, Node B, Node E]
```

## Key Features

1. **Conditional Routing**: Uses `routeCDorBC` to dynamically choose execution paths
2. **Parallel Execution**: Nodes can execute in parallel based on routing
3. **Priority Scoring**: Nodes have scores that determine their execution order in the final result
4. **State Aggregation**: Maintains an aggregate of all node outputs
5. **Fanout Processing**: Final node (`fanoutSink`) processes and sorts parallel execution results

## Implementation Details

### Node Factory
```typescript
const nodeFactory = (nodeName: string, score: number) => {
    const node = new ParallelReturnNodeValue(nodeName, score);
    return (state) => node.call(state);
};
```

### Conditional Router
```typescript
function routeCDorBC(state): string[] {
    if (state.which?.replace(/['"]/g, "") === "cd") {
        return ["c", "d"];
    }
    return ["b", "c"];
}
```

### Graph Definition
```typescript
const branchingGraph = new StateGraph(ConditionalBranchingAnnotation)
    .addNode("a", nodeA)
    .addNode("b", nodeB)
    .addNode("c", nodeC)
    .addNode("d", nodeD)
    .addNode("e", fanoutSink)
    .addEdge(START, "a")
    .addConditionalEdges("a", routeCDorBC, ["b", "c", "d"])
    .addEdge("b", "e")
    .addEdge("c", "e")
    .addEdge("d", "e")
    .addEdge("e", END);
```

## Error Handling

The graph includes basic error handling:
```typescript
try {
    graph.invoke({});
} catch (error) {
    throw error;
}
```

This branching example demonstrates how to create complex execution flows in LangGraph using conditional routing, parallel execution, and state management.