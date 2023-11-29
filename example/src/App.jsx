import { Cartesian2, Cartesian3, Color } from 'cesium'
import { Viewer, Entity, PolylineGraphics} from 'resium';
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
  const [intervalId, setIntervalId] = useState(undefined);
  const [heldKarpDist, setHeldKarpDist] = useState(undefined);
  // const [heldKarpTime, setHeldKarpTime] = useState(undefined);
  const [nearestNeighborDist, setNearestNeighborDist] = useState(undefined);
  //const [nearestNeighborTime, setNearestNeighborTime] = useState(undefined);
  const [animationSpeed, setAnimationSpeed] = useState(3);
  const [userSelection, setUserSelection] = useState([])
  const [cityHover, setCityHover] = useState(-1);
  const colors = [Color.ORANGERED, Color.GREENYELLOW];
  const [focusedMethod, setFocusedMethod] = useState(-1); //0 - nn, 1 - hk, 2 - user




  // HELD-KARP ALGO

  function makeArray(rows, cols, value) {
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
  
  function inMask(mask, ind) {
    return (mask & (1 << ind)) !== 0;
  }
  
  async function heldKarp() { 
    clearInterval(intervalId);
    let workingEdges = clearEdges(1);
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
    let workingEdges = clearEdges(0);
    let cur = 0;
    let visited = new Set([0]);
    let totalDist = 0;
    let i = 0;
    async function make_path() {
      return new Promise((resolve) => {
        const newIntervalId = setInterval(() => {
          if(i >= curCities.length - 1) {
            // go back to start
            updateEdge(workingEdges, cur, 0, 0);
            totalDist += adjMat[cur][0];
            clearInterval(newIntervalId);
            resolve();
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
          totalDist += adjMat[cur][nearest];
          cur = nearest;
          ++i;
        }, 1500/animationSpeed);
      setIntervalId(newIntervalId);
    })}
    await make_path();
    return totalDist;
  }

  function updateEdge(workingEdges, from, to, state) { //0 - nn, 1 - hk
    // console.log(`setting [${from}][${to}][${state}] to [${state}]`);
    workingEdges[state][from][to] = state;
    workingEdges[state][to][from] = state;
    // console.log("LOOK HERE", copy3dArray(workingEdges))
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
    clearEdges();
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
    for(let i = 0; i < curCities.length; ++i) {
      for(let j = i; j < curCities.length; ++j) {
        const dist = distance(curCities[i].lat, curCities[i].lng, 
          curCities[j].lat, curCities[j].lng);
        mat[i][j] = dist;
        mat[j][i] = dist;
      }
    }
    setAdjMat(mat);
  }

  function clearEdges(index) {
    let newEdges = edges;
    if(index === undefined)
      newEdges = [[], []];
    if(index === undefined || index === 0)
      newEdges[0] = makeArray(curCities.length, curCities.length, -1);
    if(index === undefined || index === 1)
      newEdges[1] = makeArray(curCities.length, curCities.length, -1);
    setEdges(newEdges);
    return newEdges;
  }

  async function sampleCities() {
    setUserSelection([]);
    setCityHover(-1);
    clearInterval(intervalId);
    setIntervalId(null);
    setHeldKarpDist(undefined);
    setNearestNeighborDist(undefined);
    let sample = allCities.slice(index, index + num);
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
        setUserSelection(userSelection.push(i));
      } else if (userSelection[userSelection.length - 1] == i) {
        setUserSelection(userSelection.slice(0, -1));
      }
  }

  function calcUserDist() {
    let sum = 0;
    userSelection.map((val, ind) => {
      if(ind != 0) {
        sum += adjMat[val][userSelection[ind - 1]]
      }
    })
    return sum.toFixed(2);
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
          />
          <button className='nestedBut' onClick={() => sampleCities()}>Generate Cities</button>
        </div>
        <div className='arrow-up'></div>
        <button className='guiBut'
          onClick={async () => {
            setFocusedMethod(1);
            const dist = await heldKarp();
            setHeldKarpDist(dist); 
            console.log(edges);
          }}
          style={{color: '#ADFF2F'}}
          >
            Run Held-Karp algorithm
        </button>
        <button className='guiBut' 
        onClick={async () => {
          setFocusedMethod(0);
          const dist = await nearestNeighbor();
          setNearestNeighborDist(dist);
          console.log(edges)
        }}
        style={{color: '#FF4500'}}
        >
          Nearest Neighbor
        </button>
        <button className='guiBut' onClick={() => {
          setUserSelection([]); 
          setFocusedMethod(2)
        }}
        style={{color: '#87CEEB'}}
        >
          Reset user path
        </button>

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
          />
        </div>
        <div className='pathDisplay'>
          {userSelection.map((val, ind) => {
            return ind == num ? 
            <div>
              <div className='mini-arrow-up'></div>
              <div className='minier-arrow-up'></div>
              <div className='pathDisplayTop'>Complete user path:</div>
            </div>
            :
            <div key={ind} className='pathCity'>
              {curCities[userSelection[ind]].city}
            </div>
          }
          )}
        </div>
      </div>
      <div className='resultsGrid'>
        <div>Algorithm</div>
        <div>Distance (km)</div>
        <div>Time (sec)</div>
        <div style={{color: '#ADFF2F'}}>Held-Karp</div>
        <div>{heldKarpDist ? heldKarpDist.toFixed(2) : ''}</div>
        <div>Slower</div>
        <div style={{color: '#FF4500'}}>Nearest Neighbor</div>
        <div>{nearestNeighborDist ? nearestNeighborDist.toFixed(2) : ''}</div>
        <div>Faster</div>        
        <div style={{color: '#87CEEB'}}>Your path</div>
        <div style={userSelection.length > num ? {color: '#c2c9d6'} : {color: '#838383'}}>{userSelection.length > 0 ? calcUserDist() : ''}</div>
        <div>Slowest</div>
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

          {edges.map((algoEdges, ind1) => 
            <div key={ind1}>
              {algoEdges.map((row, ind2) =>
                <div key={[ind1, ind2]}>
                  {row && row.map && row.map((e, ind3) => {
                    {return e != -1 ?                 
                      <div key={[ind1, ind2, ind3]}>
                        <Entity
                          polyline={{
                            show: true,
                            width: 5,
                            positions: 
                              Cartesian3.fromDegreesArray(
                                [curCities[ind2].lng, curCities[ind2].lat,
                                curCities[ind3].lng, curCities[ind3].lat]
                              ),
                            material: focusedMethod == e ? colors[e] : Color.fromAlpha(colors[e], .5),
                            onClick: () => {setFocusedMethod(e); console.log(e);}
                          }}
                        />
                      </div> : <></>
                    }
                  })}
                  </div>
                )}
            </div>
          )}

          {userSelection.map((val, ind) => 
            <div key={ind}>
              {ind != 0 ? 
                <Entity
                  polyline={{
                    show: true,
                    width: 5,
                    positions: 
                      Cartesian3.fromDegreesArray(
                        [curCities[val].lng, curCities[val].lat,
                        curCities[userSelection[ind - 1]].lng, curCities[userSelection[ind - 1]].lat]
                      ),
                    material: userSelection.length > num ? Color.fromAlpha(Color.SKYBLUE, focusedMethod == 2 ? 1.0 : 0.5) : Color.fromAlpha(Color.LIGHTBLUE, focusedMethod == 2 ? 1.0 : 0.5),
                    onClick: () => setFocusedMethod(2)
                  }}
                />
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
