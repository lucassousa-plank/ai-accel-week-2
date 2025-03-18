import { StateGraph, Annotation } from "@langchain/langgraph";
import { Command } from "@langchain/langgraph";

// Graph state
// Define the state with a reducer
const StateAnnotation = Annotation.Root({
    foo: Annotation<string>,
});


// Define node functions
// Nodes
const nodeASubgraph = async (_state: typeof StateAnnotation.State) => {
    // this is a replacement for a real conditional edge function
    const goto = Math.random() > .5 ? "nodeB" : "nodeC";
    // note how Command allows you to BOTH update the graph state AND route to the next node
    return new Command({
        update: {
            foo: "a",
        },
        goto,
        // this tells LangGraph to navigate to node_b or node_c in the parent graph
        // NOTE: this will navigate to the closest parent graph relative to the subgraph
        graph: Command.PARENT,
    });
};

// Nodes B and C are unchanged
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


const subgraph = new StateGraph(StateAnnotation)
    .addNode("nodeA", nodeASubgraph)
    .addEdge("__start__", "nodeA")
    .compile();

// Build workflow
// NOTE: there are no edges between nodes A, B and C!
const commandGraph = new StateGraph(StateAnnotation)
    .addNode("subgraph", subgraph, {
        ends: ["nodeB", "nodeC"],
    })
    .addNode("nodeB", nodeB)
    .addNode("nodeC", nodeC)
    .addEdge("__start__", "subgraph");

// Finally, we compile it!
// This compiles it into a graph you can invoke and deploy.
export const graph = commandGraph.compile({
    interruptBefore: [], // if you want to update the state before calling the tools
    interruptAfter: [],
});

try {
    graph.invoke({});
} catch (error) {
    throw error;
}
