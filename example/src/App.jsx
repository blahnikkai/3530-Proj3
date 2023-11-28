import { Cartesian2, Cartesian3, Color } from 'cesium'
import { Viewer, Entity, PolylineGraphics} from "resium";
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
  const [num, setNum] = useState(5);
  const [intervalId, setIntervalId] = useState();
  const [animationSpeed, setAnimationSpeed] = useState(3);
  const [userSelection, setUserSelection] = useState([])
  const [cityHover, setCityHover] = useState(-1);
  const colors = [Color.ORANGERED, Color.GREENYELLOW];
  const [focusedMethod, setFocusedMethod] = useState(-1); //0 - nn, 1 - hk, 2 - user




  //HELD-KARP ALGO

  function makeArray(rows, cols, value) {
    let arr = [];
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
    clearInterval(intervalId);
    let workingEdges = clearEdges();
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
    function update() {
      console.log('updated');
      let nxtNode = nxt[visited][cur];
  
      updateEdge(workingEdges, cur, nxtNode, 1);

      if(nxtNode === 0) {
        clearInterval(newIntervalId);
        return;
      }
      visited |= (1 << nxtNode);
      cur = nxtNode;    
    }
    const newIntervalId = setInterval(() => update(), 1500/animationSpeed);
    setIntervalId(newIntervalId);
    return dp[1][0];
  }

  async function nearestNeighbor() {
    clearInterval(intervalId);
    let workingEdges = clearEdges();
    let cur = 0;
    let visited = new Set([0]);
    let totalDist = 0;
    let i = 0;
    function update() {
      if(i >= curCities.length - 1) {
        // go back to start
        updateEdge(workingEdges, cur, 0, 0);
        totalDist += adjMat[cur][0];
        clearInterval(newIntervalId);
        return;
      }
      let nearest = -1;
      let nearestDist = INF;
      for(let j = 0; j < curCities.length; ++j) {
        if(!visited.has(j) && adjMat[cur][j] < nearestDist) {
          nearest = j;
          nearestDist = adjMat[cur][j];
        }
      }
      updateEdge(workingEdges, cur, nearest, 0);
      visited.add(nearest);
      cur = nearest;
      totalDist += adjMat[cur][nearest];
      ++i;
    }
    const newIntervalId = setInterval(() => update(), 1500/animationSpeed);
    setIntervalId(newIntervalId);
    return totalDist;
  }

  function updateEdge(workingEdges, from, to, state) {
    workingEdges[from][to] = state;
    workingEdges[to][from] = state;
    setEdges([...workingEdges]);
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
    clearEdges();
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
    for(let i = 0; i < curCities.length; ++i) {
        for(let j = i; j < curCities.length; ++j) {
            const dist = distance(curCities[i].lat, curCities[i].lng, 
              curCities[j].lat, curCities[j].lng);
            mat[i][j] = dist;
            mat[j][i] = dist;
        }
    }
    console.log(mat)
    setAdjMat(mat)
  }

  function clearEdges() {
    let e = makeArray(curCities.length, curCities.length, -1);
    console.log(e);
    setEdges(e);
    return e;
  }

  async function sampleCities() {
    clearEdges();
    setUserSelection([]);
    setCityHover(-1);
    clearInterval(intervalId);
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

  function addToSelection(i) {
      setFocusedMethod(2);
      if (userSelection.length > num) {
        return;
      }

      if (userSelection.find((x) => x == i) == undefined || (userSelection.length == num && i == userSelection[0])) {
        setUserSelection(userSelection.concat([i]));
      } else if (userSelection[userSelection.length - 1] == i) {
        setUserSelection(userSelection.slice(0, -1));
      }

      console.log(userSelection)
      console.log(userSelection[userSelection.length - 1])
      
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

          <button className='guiBut' onClick={() => {heldKarp(); setFocusedMethod(1); console.log(edges)}}>Run Held-Karp algorithm</button>
          <button className='guiBut' onClick={() => {nearestNeighbor(); setFocusedMethod(0); console.log(edges)}}>Nearest Neighbor</button>
          <button className='guiBut' onClick={() => {setUserSelection([]); setFocusedMethod(2)}}>Reset user path</button>

          <div className='arrow-down'></div>
          <div className='gray-box-of-doom-2'>
            <div className='knobLabel'>Animation <br/> speed:</div>
            <Donut
              diameter={80}
              min={0}
              max={10}
              step={1}
              value={animationSpeed}
              theme={{
                  donutColor: '#303336',
                  bgrColor: '#444',
                  maxedBgrColor: '#444',
                  centerColor: 'rgba(84, 84, 84, 1)',
                  centerFocusedColor: 'rgba(84, 84, 84, 1)',
                  donutThickness: 10,   
              }}
              onValueChange={setAnimationSpeed}
            >
            </Donut>

          </div>
        </div>
      <Viewer className='viewer'>
        {allCities && curCities && adjMat && edges ?

        <div>
          {curCities.map((c, ind) => 
            <div key={c.city}>
              <Entity
                name={c.city}
                position={Cartesian3.fromDegrees(c.lng, c.lat)}
                point={{ pixelSize: 20, color: cityHover == ind ? Color.SKYBLUE : Color.WHITE}}
                label={{ text: `${c.city}, ${c.iso3}`, 
                  font: cityHover == ind ? '16px Victor Mono, monospace' : '12px Victor Mono', 
                  pixelOffset: new Cartesian2(20, 20) 
                }}
                onClick={() => addToSelection(ind)}
                onMouseEnter={() => setCityHover(ind)}
                onMouseLeave={() => setCityHover(-1)}
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
                        material={focusedMethod == e ? colors[e] : Color.fromAlpha(colors[e], .5)}
                        onClick={() => {setFocusedMethod(e);console.log(e);}}
                      />
                    </Entity>
                  </div>
                : <></>}
              )}
            </div>
          )}

          {userSelection.map((val, ind) => 
            <div key={ind}>
              {ind != 0 ? 
                <Entity>
                <PolylineGraphics
                  show
                  width={5}
                  positions={ 
                    Cartesian3.fromDegreesArray(
                      [curCities[val].lng, curCities[val].lat,
                      curCities[userSelection[ind - 1]].lng, curCities[userSelection[ind - 1]].lat]
                    )
                  }
                  material={userSelection.length > num ? Color.fromAlpha(Color.SKYBLUE, focusedMethod == 2 ? 1.0 : 0.5) : Color.fromAlpha(Color.LIGHTBLUE, focusedMethod == 2 ? 1.0 : 0.5)}
                  onClick={() => setFocusedMethod(2)}
                />
              </Entity>  
              : <></>
            }
            </div>
          )}

        </div>
        : <>Loading...</>}
      </Viewer>
    </div>
  );
}

export default App;




