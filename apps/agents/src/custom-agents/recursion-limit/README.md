# Recursion Limit Example

This example demonstrates how to implement a graph with recursion limits and parallel execution paths. The graph counts up to a specified maximum value while alternating between different counting patterns and parallel execution.

## Graph Structure

The graph consists of four nodes and three routers:

### Nodes
1. `countMod1`: Counts in Mississippi increments
2. `countMod2`: Counts in Mississippi increments
3. `countMod3`: Counts in Mississippi increments
4. `countPenn`: Counts in Pennsylvania increments (count/3)

### Routers
1. `endRouterMod1`: Routes to countMod2 or END
2. `endRouterMod2`: Routes to countMod3 and countPenn in parallel, or END
3. `endRouterMod3`: Routes to countMod1 or END

## State Management

The graph maintains state through:
- `count`: Tracks the current count (increments by 1)
- `maxCount`: Maximum count before ending
- `aggregate`: Collects all messages generated

## Usage

```typescript
// Invoke the graph with a maximum count
graph.invoke({
    maxCount: 10  // Set your desired maximum count
}, {
    recursionLimit: 4  // Optional: Set maximum recursion depth
});
```

## Example Output

With `maxCount: 10`, the graph will produce output like:
```
1 Mississippi
2 Mississippi
3 Mississippi
1 Pennsylvania
4 Mississippi
...
```

## Key Features

1. **Recursion Control**: The graph should be configured with a recursion limit to prevent infinite loops
2. **Parallel Execution**: Demonstrates running multiple nodes simultaneously (countMod3 and countPenn) and how that counts for the recursion limit

## Error Handling

The graph includes error handling for recursion limits:
```typescript
try {
    graph.invoke({
        maxCount: 10
    }, {
        recursionLimit: 4
    });
} catch (error) {
    if (error instanceof GraphRecursionError) {
        console.log("Recursion Error:", error);
    } else {
        throw error;
    }
}
```
