import { StateGraph, Annotation, START, END } from "@langchain/langgraph";
import { AgentConfigurationAnnotation } from "./configuration.js";

// Graph state
// Define the state with a reducer
type ScoredValue = {
    nodeName: string;
    score: number;
};

const reduceFanouts = (left?: ScoredValue[], right?: ScoredValue[]) => {
    if (!left) {
        left = [];
    }
    if (!right || right?.length === 0) {
        // Overwrite. Similar to redux.
        return [];
    }
    return left.concat(right);
};

const ConditionalBranchingAnnotation = Annotation.Root({
    aggregate: Annotation<string[]>({
        reducer: (x, y) => x.concat(y),
        default: () => [],
    }),
    which: Annotation<string>({
        reducer: (x: string, y: string) => (y ?? x),
        default: () => "",
    }),
    fanoutValues: Annotation<ScoredValue[]>({
        reducer: reduceFanouts,
        default: () => [],
    }),
});

// Define node functions
// Nodes

class ParallelReturnNodeValue {
    private _nodeName: string;
    private _score: number;

    constructor(nodeName: string, score: number) {
        this._nodeName = nodeName;  
        this._score = score;
    }

    public call(state: typeof ConditionalBranchingAnnotation.State) {
        console.log(`Adding ${this._nodeName} to ${state.aggregate}`);
        return { fanoutValues: [{ nodeName: this._nodeName, score: this._score }] };
    }
}

const nodeFactory = (nodeName: string, score: number) => {
    const node = new ParallelReturnNodeValue(nodeName, score);
    return (state: typeof ConditionalBranchingAnnotation.State) => node.call(state);
};

// Create the graph
const nodeA = (state: typeof ConditionalBranchingAnnotation.State) => {
    console.log(`Adding Node A to ${state.aggregate}`);
    return { aggregate: ["Node A"] };
};
const nodeB = nodeFactory("Node B", 1); // This node has the lowest score, so it will be the last to be called
const nodeC = nodeFactory("Node C", 2);
const nodeD = nodeFactory("Node D", 3); // This node has the highest score

// Define the route function
function routeCDorBC(state: typeof ConditionalBranchingAnnotation.State): string[] {
    if (state.which?.replace(/['"]/g, "") === "cd") {
        return ["c", "d"];
    }
    return ["b", "c"];
}

const fanoutSink = (state: typeof ConditionalBranchingAnnotation.State) => {
    // Sort by score (reversed)
    console.log("Aggregate in Node E", state.aggregate);
    state.fanoutValues.sort((a, b) => b.score - a.score);
    const fanoutResult = state.fanoutValues.map((node) => node.nodeName).concat(["Node E"]);
    console.log("Fanout result", fanoutResult);
    return {
        aggregate: state.aggregate.concat(fanoutResult),
        fanoutValues: [],
    };
};
  

const branchingGraph = new StateGraph(ConditionalBranchingAnnotation, AgentConfigurationAnnotation)
    .addNode("a", nodeA)
    .addNode("b", nodeB)
    .addNode("c", nodeC)
    .addNode("d", nodeD)
    .addNode("e", fanoutSink)
    .addEdge(START, "a")
    // Add conditional edges
    // Third parameter is to support visualizing the graph
    .addConditionalEdges("a", routeCDorBC, ["b", "c", "d"])
    .addEdge("b", "e")
    .addEdge("c", "e")
    .addEdge("d", "e")
    .addEdge("e", END);

// Finally, we compile it!
// This compiles it into a graph you can invoke and deploy.
export const graph = branchingGraph.compile({
    interruptBefore: [], // if you want to update the state before calling the tools
    interruptAfter: [],
});

try {
    graph.invoke({});
} catch (error) {
    throw error;
}
