import { StateGraph, Annotation, END } from "@langchain/langgraph";

// Graph state
// Define the state with a reducer
const StateAnnotation = Annotation.Root({
    aggregate: Annotation<string[]>({
        reducer: (a, b) => a.concat(b),
        default: () => [],
    }),
    maxCount: Annotation<number>,
    count: Annotation<number>({
        reducer: (a, b) => a + b,
        default: () => 0,
    }),
});
// Define node functions

// Nodes
async function countMod1(state: typeof StateAnnotation.State) {
    const msg = `${state.count + 1} Mississippi`;
    console.log("Node: countMod1 - Generated message:", msg);
    return { aggregate: [msg], count: 1 };
}

async function countMod2(state: typeof StateAnnotation.State) {
    const msg = `${state.count + 1} Mississippi`;
    console.log("Node: countMod2 - Generated message:", msg);
    return { aggregate: [msg], count: 1 };
}

async function countMod3(state: typeof StateAnnotation.State) {
    const msg = `${state.count + 1} Mississippi`;
    console.log("Node: countMod3 - Generated message:", msg);
    return { aggregate: [msg], count: 1 };
}

async function countPenn(state: typeof StateAnnotation.State) {
    const msg = `${(state.count + 1) / 3} Pennsylvania`;
    console.log("Node: countPenn - Generated message:", msg);
    return { aggregate: [msg] };
}

// Define edges
const endRouterMod1 = async function (state: typeof StateAnnotation.State) {
    console.log("Router: endRouterMod1 - Current count:", state.count, "/", state.maxCount);
    const next = state.count >= state.maxCount ? END : "countMod2";
    console.log("Router: endRouterMod1 - Next node:", next);
    return next;
}

const endRouterMod2 = async function (state: typeof StateAnnotation.State) {
    console.log("Router: endRouterMod2 - Current count:", state.count, "/", state.maxCount);
    const next = state.count >= state.maxCount ? END : ["countMod3", "countPenn"];
    console.log("Router: endRouterMod2 - Next nodes:", next);
    return next;
}

const endRouterMod3 = async function (state: typeof StateAnnotation.State) {
    console.log("Router: endRouterMod3 - Current count:", state.count, "/", state.maxCount);
    const next = state.count >= state.maxCount ? END : "countMod1";
    console.log("Router: endRouterMod3 - Next node:", next);
    return next;
}

// Build workflow
const graphWithLoops = new StateGraph(StateAnnotation)
    .addNode("countMod1", countMod1)
    .addNode("countMod2", countMod2)
    .addNode("countMod3", countMod3)
    .addNode("countPenn", countPenn)
    .addEdge("__start__", "countMod1")
    .addConditionalEdges("countMod1", endRouterMod1)
    .addConditionalEdges("countMod2", endRouterMod2)
    .addConditionalEdges("countMod3", endRouterMod3)
    .addConditionalEdges("countPenn", endRouterMod3);
// Finally, we compile it!
// This compiles it into a graph you can invoke and deploy.
export const graph = graphWithLoops.compile({
    interruptBefore: [], // if you want to update the state before calling the tools
    interruptAfter: [],
});

// import { GraphRecursionError } from "@langchain/langgraph";
// try {
//     graph.invoke({
//         maxCount: 10,
//     },
//         {
//             recursionLimit: 4
//         });
// } catch (error) {
//     if (error instanceof GraphRecursionError) {
//         console.log("Recursion Error:", error);
//     } else {
//         throw error;
//     }
// }
