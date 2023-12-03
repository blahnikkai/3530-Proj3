import { makeArray } from './MakeArray';
import { distance } from './Distance';

export function buildAdjMat(curCities) {
  let mat = makeArray(curCities.length, curCities.length, 0);
  for(let i = 0; i < curCities.length; ++i) {
    for(let j = i; j < curCities.length; ++j) {
      const dist = distance(curCities[i].lat, curCities[i].lng, 
        curCities[j].lat, curCities[j].lng);
      mat[i][j] = dist;
      mat[j][i] = dist;
    }
  }
  return mat;
}