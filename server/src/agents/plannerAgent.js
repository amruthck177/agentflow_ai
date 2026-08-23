/**
 * Planner Agent
 * Decides node ordering from graph topology and emits a plan with a confidence score.
 */
class PlannerAgent {
  /**
   * Analyze workflow nodes and edges to determine optimal execution order.
   * @param {object} workflowSnapshot - The workflow graph
   * @param {object} inputs - Initial execution inputs
   * @returns {Promise<{ plan: Array<object>, confidence: number, reasoning: string }>}
   */
  async plan(workflowSnapshot, inputs = {}) {
    const { nodes = [], edges = [] } = workflowSnapshot;

    if (!nodes.length) {
      return {
        plan: [],
        confidence: 0,
        reasoning: 'Empty workflow graph — no nodes to schedule.',
      };
    }

    // Build adjacency list & in-degree map for topological sort
    const inDegree = {};
    const adjList = {};
    nodes.forEach((n) => {
      inDegree[n.id] = 0;
      adjList[n.id] = [];
    });

    edges.forEach((e) => {
      if (adjList[e.source] && inDegree[e.target] !== undefined) {
        adjList[e.source].push(e.target);
        inDegree[e.target] += 1;
      }
    });

    // Topological Sort (Kahn's algorithm)
    const queue = nodes.filter((n) => inDegree[n.id] === 0).map((n) => n.id);
    const sortedNodeIds = [];

    while (queue.length > 0) {
      const currId = queue.shift();
      sortedNodeIds.push(currId);

      for (const neighbor of adjList[currId] || []) {
        inDegree[neighbor] -= 1;
        if (inDegree[neighbor] === 0) {
          queue.push(neighbor);
        }
      }
    }

    // Check for cycles or unvisited nodes
    const nodeMap = new Map(nodes.map((n) => [n.id, n]));
    const plannedNodes = sortedNodeIds.map((id) => nodeMap.get(id)).filter(Boolean);

    // If topological sort missed nodes due to disconnection/cycles, append remainder
    if (plannedNodes.length < nodes.length) {
      const plannedSet = new Set(sortedNodeIds);
      nodes.forEach((n) => {
        if (!plannedSet.has(n.id)) {
          plannedNodes.push(n);
        }
      });
    }

    // Calculate confidence score based on graph completeness and trigger presence
    const hasTrigger = nodes.some((n) => n.type === 'trigger');
    const hasEnd = nodes.some((n) => n.type === 'end');
    let confidence = 0.85;

    if (hasTrigger && hasEnd && edges.length >= nodes.length - 1) {
      confidence = 0.98;
    } else if (!hasTrigger) {
      confidence = 0.70;
    }

    return {
      plan: plannedNodes,
      confidence,
      reasoning: `Planned ${plannedNodes.length} sequential execution steps based on graph topology.`,
    };
  }
}

module.exports = new PlannerAgent();
