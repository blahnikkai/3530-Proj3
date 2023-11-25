import { Cartesian2, Cartesian3, Color } from 'cesium'
import { Viewer, Entity, PolylineGraphics } from "resium";
import { useState, useEffect } from "react";
import Papa from 'papaparse';
import { Donut } from 'react-dial-knob'
import "./App.css"


const INF = 1e12;


//REACT CODE

function App() {

  //state vars

  const [array, setArray] = useState([]);
  const [subset, setSubset] = useState([]);
  const [edges, setEdges] = useState([]);
  const [adjMat, setAdjMat] = useState([]);
  const [index, setIndex] = useState(0);
  const [num, setNum] = useState(10);
  const colors = [Color.WHITE, Color.GREENYELLOW];




  //HELD-KARP ALGO

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
  
  async function heldKarp() {
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
    let temp = [];
    let visited = 1;
    let cur = 0;
    while(true) {
      let nxtNode = nxt[visited][cur];
      temp.push([cur, nxtNode]);
  
      updateEdge(cur, nxtNode, 1)
      await sleep(500)

      if(nxtNode === 0) {
        break;
      }
      visited |= (1 << nxtNode);
      cur = nxtNode;
    }
    return [dp[1][0], temp];
  }


  async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  

  function updateEdge(from, to, state) {
    setEdges([...edges, edges[from][to] = state, edges[to][from] = state]);
  }









  useEffect(() => { //on page load
    getData();
  }, [])

  //build subarray on load
  useEffect(() => {
    if(array.length === 0)
      return;
    console.log(array);
    createSubarray();
  }, [array])

  //build adj matrix on load
  useEffect(() => {
    if(subset.length === 0) {
      return;
    }
    buildAdjMat();
  }, [subset])

  //build edges on load
  // useEffect(() => {
  //   if(subset.length === 0) {
  //     return;
  //   }
  //   const result = heldKarp(adjMat);
  //   console.log(edges);
  //   // setEdges(result[1]);


  // }, [adjMat, edges])

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
    let e = Array.from(Array(subset.length), () => new Array(subset.length))
    for(let i = 0; i < subset.length; ++i) {
        for(let j = i; j < subset.length; ++j) {
            const dist = distance(subset[i].lat, subset[i].lng, 
              subset[j].lat, subset[j].lng);
            mat[i][j] = dist;
            mat[j][i] = dist;
            e[i][j] = -1;
            e[j][i] = -1;
        }
    }
    console.log(mat)
    console.log(e);
    setAdjMat(mat)
    setEdges(e);
  }

  async function createSubarray() {
    setEdges([]) //prevent program crash
    let newSubset = array.slice(index, index + num);
    console.log(newSubset);
    setSubset(newSubset); //cap num at 300?
    setIndex((index + num) % 41000);
    // why is array length only ~9000 instead of 44000
    // console.log(array.length);
  }

  //https://stackoverflow.com/questions/61419710/how-to-import-a-csv-file-in-reactjs
  async function getData() {
    const data = Papa.parse(await fetchCsv(), {
      skipEmptyLines: true,
      header: true,
      dynamicTyping: true,
      complete: function(results) {
        setArray(results.data.sort(() => 0.5 - Math.random())); //shuffles data
        // setArray(results.data); //non-shuffled data (debug only)
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


  return (
    <div>
    <div className='gui'>
        <div className='gray-box-of-doom'>
            
          <Donut
            diameter={80}
            min={0}
            max={20}
            step={1}
            value={num}
            theme={{
                donutColor: '#303336',
                bgrColor: '#444',
                maxedBgrColor: '#444',
                centerColor: 'rgba(84, 84, 84, 1)',
                centerFocusedColor: 'rgba(84, 84, 84, 1)',
                donutThickness: 10,   
            }}
            onValueChange={setNum}
          >
          </Donut>
          <button className='nestedBut' onClick={() => createSubarray()}>Generate Cities</button>

        </div>
        <div className='arrow-up'></div>

        <button className='guiBut' onClick={() => {heldKarp(); console.log(edges)}}>Run Held-Karp algorithm</button>
        <button className='guiBut' onClick={() => {}}>Temporary button</button>
        <button className='guiBut' onClick={() => {}}>Temporary button</button>
      </div>
      <Viewer className='viewer'>
        {array && subset && adjMat && edges ?

        <div>
          {
          subset.map((c, ind) => 
            <div key={c.city}>
              <Entity
                name={c.city}
                position={Cartesian3.fromDegrees(c.lng, c.lat)}
                point={{ pixelSize: 20, color: Color.WHITE }}
                label={{ text: `${c.city}, ${c.iso3} (${ind})`, 
                  font: '10px sans-serif', 
                  pixelOffset: new Cartesian2(20, 20) 
                }}
              />
              {/* {subset.map((d) => {
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
                      material={Color.RED}
                    />
                  </Entity> 
                </div>

              })} */}
            </div>
          )}

          {edges.map((edge, ind1) => 

            <div key={ind1}>
              {edge && edge.map && edge.map((e, ind2) => 
                {return ind1 > ind2 && e != -1 ? 
                    // console.log(edge)
                    // console.log(ind1, ind2, e, subset[ind1].lng, subset[ind2].lng);
                  <div key={ind1 * num + ind2}>
                    <Entity>
                      <PolylineGraphics
                        show
                        width={5}
                        positions={ 
                          Cartesian3.fromDegreesArray(
                            [subset[ind1].lng, subset[ind1].lat,
                            subset[ind2].lng, subset[ind2].lat]
                          )
                        }
                        material={colors[e]}
                      />
                    </Entity>
                  </div>
                : <></>}
              )}
            </div>

          )}
        </div>
        : <>Loading...</>}
      </Viewer>

    </div>
  );
}

export default App;




