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

  const [allCities, setAllCities] = useState([]);
  const [curCities, setCurCities] = useState([]);
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
    let visited = 1;
    let cur = 0;
    while(true) {
      let nxtNode = nxt[visited][cur];
  
      updateEdge(cur, nxtNode, 1)
      await sleep(500)

      if(nxtNode === 0) {
        break;
      }
      visited |= (1 << nxtNode);
      cur = nxtNode;
    }
    return dp[1][0];
  }


  async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  

  function updateEdge(from, to, state) {
    const newEdges = [...edges];
    newEdges[from][to] = state;
    newEdges[to][from] = state;
    setEdges(newEdges);
  }








  // load city data and build allCities on page load
  useEffect(() => {
    getData();
  }, [])

  // build curCities on allCities load
  useEffect(() => {
    if(allCities.length === 0)
      return;
    // console.log(allCities);
    sampleCities();
  }, [allCities])

  // build adj matrix on load
  useEffect(() => {
    if(curCities.length === 0) {
      return;
    }
    buildAdjMat();
  }, [curCities])

  // build edges on load
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
    let mat = makeArray(curCities.length, curCities.length, 0);
    let e = makeArray(curCities.length, curCities.length, 0);
    for(let i = 0; i < curCities.length; ++i) {
        for(let j = i; j < curCities.length; ++j) {
            const dist = distance(curCities[i].lat, curCities[i].lng, 
              curCities[j].lat, curCities[j].lng);
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

  async function sampleCities() {
    setEdges([]) //prevent program crash
    let sample = allCities.slice(index, index + num);
    console.log(sample);
    setCurCities(sample); //cap num at 300?
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
        setAllCities(results.data.sort(() => 0.5 - Math.random())); //shuffles data
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
    const csv = decoder.decode(result.value);
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
          <button className='nestedBut' onClick={() => sampleCities()}>Generate Cities</button>

        </div>
        <div className='arrow-up'></div>

        <button className='guiBut' onClick={() => {heldKarp(); console.log(edges)}}>Run Held-Karp algorithm</button>
        <button className='guiBut' onClick={() => {}}>Temporary button</button>
        <button className='guiBut' onClick={() => {}}>Temporary button</button>
      </div>
      <Viewer className='viewer'>
        {allCities && curCities && adjMat && edges ?

        <div>
          {curCities.map((c, ind) => 
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
                            [curCities[ind1].lng, curCities[ind1].lat,
                            curCities[ind2].lng, curCities[ind2].lat]
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




