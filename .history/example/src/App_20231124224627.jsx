import { Cartesian2, Cartesian3, Color } from 'cesium'
import { Viewer, Entity, PolylineGraphics } from "resium";
import { useState, useEffect } from "react";
import Papa from 'papaparse';
import "./App.css"

const INF = 1e12;

function makeArray(rows, cols, value) {
  let arr = []
  for(let i = 0; i < rows; ++i) {
    let row = [];
    for(let j = 0; j < cols; ++j) {
      row.push(value)
    }
    arr.push(row);
  }
  return arr;
}

function inMask(mask, ind) {
  return (mask & (1 << ind)) !== 0;
}

function heldKarp(adjMat) {
  const n = adjMat.length;
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
  let edges = [];
  let visited = 1;
  let cur = 0;
  while(true) {
    let nxtNode = nxt[visited][cur];
    edges.push([cur, nxtNode]);
    if(nxtNode === 0) {
      break;
    }
    visited |= (1 << nxtNode);
    cur = nxtNode;
  }
  return [dp[1][0], edges];
}

function App() {
  const [array, setArray] = useState([]);
  const [subset, setSubset] = useState([]);
  const [edges, setEdges] = useState([]);
  const [adjMat, setAdjMat] = useState([[]]);
  const [index, setIndex] = useState(0);
  const [num, setNum] = useState(10);

  useEffect(() => { //on page load
    getData();
  }, [])

  useEffect(() => {
    if(array.length === 0)
      return;
    console.log(array);
    createSubarray();
  }, [array])

  useEffect(() => {
    if(subset.length === 0) {
      return;
    }
    buildAdjMat();
  }, [subset])

  useEffect(() => {
    if(subset.length === 0) {
      return;
    }
    const result = heldKarp(adjMat);
    setEdges(result[1]);
  }, [adjMat])

  function distance(lat1, lon1, lat2, lon2) {
    const r = 6371; // km
    const p = Math.PI / 180;
  
    const a = 0.5 - Math.cos((lat2 - lat1) * p) / 2
                  + Math.cos(lat1 * p) * Math.cos(lat2 * p) *
                    (1 - Math.cos((lon2 - lon1) * p)) / 2;
  
    return 2 * r * Math.asin(Math.sqrt(a));
  }

  function buildAdjMat() {
    let mat = Array.from(Array(subset.length), () => new Array(subset.length))
    for(let i = 0; i < subset.length; ++i) {
        for(let j = i + 1; j < subset.length; ++j) {
            const dist = distance(subset[i].lat, subset[i].lng, 
              subset[j].lat, subset[j].lng);
            mat[i][j] = dist;
            mat[j][i] = dist;
        }
    }
    console.log(mat)
    setAdjMat(mat)
  }

  async function createSubarray() {
    setSubset(array.slice(index, index + num));
    setIndex(index + num + 1);
    console.log(subset);
  }

  //https://stackoverflow.com/questions/61419710/how-to-import-a-csv-file-in-reactjs
  async function getData() {
    const data = Papa.parse(await fetchCsv(), {
      skipEmptyLines: true,
      header: true,
      dynamicTyping: true,
      complete: function(results) {
        // setArray(results.data.sort(() => 0.5 - Math.random())); //shuffles data
        setArray(results.data); //shuffles data
      }
    });
    return data;
  }
  
  async function fetchCsv() {
    const response = await fetch('data/worldcities.csv');
    const reader = response.body.getReader();
    const result = await reader.read();
    const decoder = new TextDecoder('utf-8');
    const csv = await decoder.decode(result.value);
    return csv;
  }

  const positions = Cartesian3.fromDegreesArrayHeights([0, 0, 1000, 100, 100, 1000]);

  return (
    <div>
      <div className='gui'>
        <button className='guiBut' onClick={() => createSubarray()}></button>
      </div>
      <Viewer className='viewer'>
        {array && subset ?

        <div>
          {subset.map((c) => 
            <div key={c.admin_name}>
              <Entity
                name={c.city}
                position={Cartesian3.fromDegrees(c.lng, c.lat)}
                point={{ pixelSize: 20, color: Color.WHITE }}
                label={{ text: `${c.city}, ${c.iso3} (${ind})`, 
                  font: '10px sans-serif', 
                  pixelOffset: new Cartesian2(20, 20) 
                }}
              />
              {subset.map((d) => {
                return <div key={d.admin_name}>                
                  <Entity>
                    <PolylineGraphics
                      show
                      width={2}
                      positions={ 
                        Cartesian3.fromDegreesArray(
                          [parseFloat(c.lng), parseFloat(c.lat), parseFloat(d.lng), parseFloat(d.lat)]
                        )
                      }
                      material= {Color.RED}
                    />
                  </Entity> 
                </div>

              })} */}
            </div>
          )}
          {edges.map((edge, ind) =>
            <div key={ind}>
              <Entity>
                <PolylineGraphics
                  show
                  width={5}
                  positions={ 
                    Cartesian3.fromDegreesArray(
                      [subset[edge[0]].lng, subset[edge[0]].lat,
                      subset[edge[1]].lng, subset[edge[1]].lat]
                    )
                  }
                  material={Color.RED}
                />
              </Entity>
            </div>
          )}
        </div>
        : <>Loading...</>}
      </Viewer>

    </div>
  );
}

export default App;




