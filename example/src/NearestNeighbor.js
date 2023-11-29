import { makeArray } from './MakeArray';
import { INF } from './HeldKarp'

export function nearestNeighbor(adjMat) {
  const n = adjMat.length;
  let workingEdges = makeArray(n, n, -1);
  let cur = 0;
  let visited = new Set([0]);
  let totalDist = 0;
  let states = [structuredClone(workingEdges)];
  for(let i = 0; i < n - 1; ++i) {
    let nearest = -1;
    let nearestDist = INF;
    for(let j = 0; j < n; ++j) {
      if(!visited.has(j) && adjMat[cur][j] < nearestDist) {
        nearest = j;
        nearestDist = adjMat[cur][j];
      }
    }
    visited.add(nearest);
    totalDist += adjMat[cur][nearest];

    workingEdges[cur][nearest] = 0;
    workingEdges[nearest][cur] = 0;
    states.push(structuredClone(workingEdges));
    
    cur = nearest;
  }
  // go back to start
  totalDist += adjMat[cur][0];
  workingEdges[cur][0] = 0;
  workingEdges[0][cur] = 0;
  states.push(structuredClone(workingEdges));
  return [totalDist, states];
}