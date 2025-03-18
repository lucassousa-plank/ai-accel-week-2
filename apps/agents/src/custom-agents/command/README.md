# Command Example

This example demonstrates how to use Commands in LangGraph to control both state updates and graph navigation. The graph showcases how to use subgraphs and the Command class to create dynamic routing between nodes.

## Graph Structure

The graph consists of a subgraph and two main nodes:

### Nodes
1. `subgraph`: Contains `nodeA` which randomly routes to either nodeB or nodeC
2. `nodeB`: Appends "|b" to the state
3. `nodeC`: Appends "|c" to the state

### Command Usage
- `nodeASubgraph`: Uses Command to:
  - Update state with "a"
  - Randomly route to either nodeB or nodeC
  - Navigate to the parent graph

## State Management

The graph maintains state through:
- `foo`: String that accumulates the path taken through the nodes

## Usage

```typescript
// Invoke the graph with empty initial state
graph.invoke({});
```

## Example Output

The output will vary randomly between two paths:

Path 1 (A → B):
```
State: { foo: "a|b" }
```

Path 2 (A → C):
```
State: { foo: "a|c" }
```

## Key Features

1. **Command Usage**: Demonstrates how to use Command for state updates and routing
2. **Subgraph Integration**: Shows how to incorporate subgraphs into the main workflow
3. **Dynamic Routing**: Uses random selection to demonstrate dynamic path selection
4. **State Accumulation**: Shows how state changes accumulate through the graph
5. **Parent Graph Navigation**: Illustrates navigation between subgraph and parent graph

## Implementation Details

### Command Node
```typescript
const nodeASubgraph = async (_state: typeof StateAnnotation.State) => {
    const goto = Math.random() > .5 ? "nodeB" : "nodeC";
    return new Command({
        update: {
            foo: "a",
        },
        goto,
        graph: Command.PARENT,
    });
};
```

### State Update Nodes
```typescript
const nodeB = async (state: typeof StateAnnotation.State) => {
    return {
        foo: state.foo + "|b",
    };
}

const nodeC = async (state: typeof StateAnnotation.State) => {
    return {
        foo: state.foo + "|c",
    };
}
```

### Graph Definition
```typescript
const commandGraph = new StateGraph(StateAnnotation)
    .addNode("subgraph", subgraph, {
        ends: ["nodeB", "nodeC"],
    })
    .addNode("nodeB", nodeB)
    .addNode("nodeC", nodeC)
    .addEdge("__start__", "subgraph");
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

This command example demonstrates how to use LangGraph's Command class to create dynamic workflows with state management and flexible routing between subgraphs and parent graphs.