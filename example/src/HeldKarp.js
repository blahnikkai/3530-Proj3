import { makeArray } from './MakeArray';

export const INF = 1e12;

function inMask(mask, ind) {
  return (mask & (1 << ind)) !== 0;
}

export function heldKarp(adjMat) { 
  const n = adjMat.length;
  let workingEdges = makeArray(n, n, -1);
  let states = [structuredClone(workingEdges)];
  let dp = makeArray(1 << n, n, INF);
  let nxt = makeArray(1 << n, n, -1);
  for(let i = (1 << n) - 1; i >= 0; --i) {
    for(let j = 0; j < n; ++j) {
      if(i == (1 << n) - 1) {
        dp[i][j] = adjMat[j][0];
        nxt[i][j] = 0;
        continue;
      }
      if(!inMask(i, j))
        continue;
      for(let k = 0; k < n; ++k) {
        if(inMask(i, k))
          continue;
        const alt = adjMat[j][k] + dp[i | (1 << k)][k];
        if(alt < dp[i][j]) {
          dp[i][j] = alt;
          nxt[i][j] = k;
        }
      }
    }
  }
  let visited = 1;
  let cur = 0;
  while(true) {
    let nxtNode = nxt[visited][cur];

    workingEdges[cur][nxtNode] = 1;
    workingEdges[nxtNode][cur] = 1;
    states.push(structuredClone(workingEdges));

    if(nxtNode === 0) {
      break;
    }
    visited |= (1 << nxtNode);
    cur = nxtNode;    
  }
  return [dp[1][0], states];
}