export function makeArray(rows, cols, value) {
  let arr = [];
  for(let i = 0; i < rows; ++i) {
    let row = [];
    for(let j = 0; j < cols; ++j) {
      if(value instanceof Array) {
        row.push(value.slice());
      }
      else {
        row.push(value)
      }
    }
    arr.push(row);
  }
  return arr;
}