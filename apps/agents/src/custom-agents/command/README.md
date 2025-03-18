# LangGraph Command Example

This project demonstrates how to use the `Command` object in **LangGraph** to manage state updates and control flow within a graph that includes a subgraph. The example creates a simple workflow with a parent graph and a single-node subgraph, showcasing how `Command` can dynamically route execution between nodes in the parent graph.

## Overview

In this example:
- We define a graph with three nodes: `subgraph`, `nodeB`, and `nodeC`.
- The `subgraph` contains a single node (`nodeA`) that uses `Command` to update the state and route execution to either `nodeB` or `nodeC` in the parent graph.
- The `Command` object combines state updates and navigation, eliminating the need for explicit edges between certain nodes.

This approach highlights the flexibility of `Command` for dynamic control flow, especially in hierarchical graph structures.

## Code Explanation

### State Definition
The graph state is defined using `Annotation.Root`:
```typescript
const StateAnnotation = Annotation.Root({
    foo: Annotation<string>,
});
```
- `foo` is a string field that tracks state changes across nodes.

### Nodes
1. **`nodeASubgraph`** (in the subgraph):
   - Logs "Called A" and randomly chooses between `nodeB` or `nodeC`.
   - Uses `Command` to:
     - Update `foo` to `"a"`.
     - Route to either `nodeB` or `nodeC` in the parent graph using `goto` and `graph: Command.PARENT`.
   ```typescript
   const nodeASubgraph = async (_state) => {
       console.log("Called A");
       const goto = Math.random() > .5 ? "nodeB" : "nodeC";
       return new Command({
           update: { foo: "a" },
           goto,
           graph: Command.PARENT,
       });
   };
   ```

2. **`nodeB`** (in the parent graph):
   - Logs "Called B" and appends `"|b"` to `foo`.
   ```typescript
   const nodeB = async (state) => {
       console.log("Called B");
       return { foo: state.foo + "|b" };
   };
   ```

3. **`nodeC`** (in the parent graph):
   - Logs "Called C" and appends `"|c"` to `foo`.
   ```typescript
   const nodeC = async (state) => {
       console.log("Called C");
       return { foo: state.foo + "|c" };
   };
   ```

### Graph Structure
- **Subgraph**:
  - Contains only `nodeA`, starting from `__start__`.
  ```typescript
  const subgraph = new StateGraph(StateAnnotation)
      .addNode("nodeA", nodeASubgraph)
      .addEdge("__start__", "nodeA")
      .compile();
  ```

- **Parent Graph (`commandGraph`)**:
  - Includes the `subgraph`, `nodeB`, and `nodeC`.
  - Starts at `subgraph` and uses `Command` to route to `nodeB` or `nodeC`.
  - Specifies `ends: ["nodeB", "nodeC"]` to validate `Command` destinations.
  ```typescript
  const commandGraph = new StateGraph(StateAnnotation, AgentConfigurationAnnotation)
      .addNode("subgraph", subgraph, { ends: ["nodeB", "nodeC"] })
      .addNode("nodeB", nodeB)
      .addNode("nodeC", nodeC)
      .addEdge("__start__", "subgraph")
      .compile();
  ```

### Execution
- The graph is invoked with an empty initial state:
  ```typescript
  try {
      graph.invoke({});
  } catch (error) {
      throw error;
  }
  ```
- Expected output varies due to randomness:
  - `Called A` → `Called B` → `{ foo: "a|b" }`
  - OR `Called A` → `Called C` → `{ foo: "a|c" }`

## How It Works
1. **Start**: Execution begins at `__start__` and moves to `subgraph`.
2. **Subgraph**: `nodeA` runs, updates `foo` to `"a"`, and uses `Command` to route to either `nodeB` or `nodeC` in the parent graph.
3. **Parent Graph**: Depending on the `goto` value, either `nodeB` or `nodeC` executes, appending to `foo`.
4. **End**: Execution stops after `nodeB` or `nodeC` since no further edges or `Command`s are defined.

## Key Features Demonstrated
- **`Command` Utility**: Combines state updates (`foo: "a"`) and dynamic routing (`goto`) in one node, reducing the need for explicit edges.
- **Subgraph Navigation**: Uses `graph: Command.PARENT` to jump from a subgraph to a parent graph node.
- **Simplified Graph**: No edges are needed between `subgraph` and `nodeB`/`nodeC`—`Command` handles the transition.

## Debugging Tips
- **Logs**: The `console.log` statements in each node help trace execution.
- **LangSmith**: Integrate LangSmith to monitor the graph’s state and transitions (see LangGraph docs for setup).
- **Error Handling**: The `try/catch` block catches issues like `GraphRecursionError`.

## Running the Example
1. **Install Dependencies**:
   ```bash
   npm install
   ```
2. **Run the Script**:
   ```bash
   ts-node index.ts
   ```
   - Ensure TypeScript is set up (`npm install -g ts-node typescript` if needed).
3. **Observe Output**:
   - Check the console for the execution path (e.g., "Called A" followed by "Called B" or "Called C").

## Notes
- **Configuration**: The `AgentConfigurationAnnotation` is referenced but not defined here—ensure it’s implemented in `configuration.js` or remove it if unused.
- **Randomness**: The `goto` decision is random for demonstration; in a real application, it’d be based on logic or LLM output.

This example showcases `Command`’s power to streamline control flow in LangGraph while maintaining a modular structure with subgraphs.

--- 

Let me know if you’d like me to tweak this README further—e.g., add more setup details or tailor it to your chatbot context!