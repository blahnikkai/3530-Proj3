import { Cartesian2, Cartesian3, Color } from 'cesium';
import { Viewer, Entity } from 'resium';
import { useState, useEffect } from 'react';
import {Helmet} from "react-helmet";
import Papa from 'papaparse';
import { Donut } from 'react-dial-knob';

import { heldKarp } from './HeldKarp';
import { makeArray } from './MakeArray';
import { nearestNeighbor } from './NearestNeighbor';
import ResultsGrid from './Components/ResultsGrid';
import './App.css';

// REACT CODE

function App() {

  // state vars

  const [allCities, setAllCities] = useState([]);
  const [curCities, setCurCities] = useState([]);
  const [edges, setEdges] = useState([]);
  const [adjMat, setAdjMat] = useState([]);
  const [index, setIndex] = useState(0);
  const [num, setNum] = useState(5);
  const [timeoutId, setTimeoutId] = useState(undefined);
  const [heldKarpDist, setHeldKarpDist] = useState(undefined);
  const [heldKarpTime, setHeldKarpTime] = useState(undefined);
  const [nearestNeighborDist, setNearestNeighborDist] = useState(undefined);
  const [nearestNeighborTime, setNearestNeighborTime] = useState(undefined);
  const [animationSpeed, setAnimationSpeed] = useState(3);
  const [userSelection, setUserSelection] = useState([])
  const [cityHover, setCityHover] = useState(-1);
  const colors = [Color.ORANGERED, Color.GREENYELLOW];
  const [focusedMethod, setFocusedMethod] = useState(-1); //0 - nn, 1 - hk, 2 - user

  function animateStates(states, algoIndex) {
    clearTimeout(timeoutId);
    let i = 0;
    let workingEdges = edges;
    function update() {
      if(i == states.length) {
        return;
      }
      workingEdges[algoIndex] = states[i];
      setEdges([...workingEdges]);
      ++i;
      setTimeoutId(setTimeout(() => update(), 1500 / animationSpeed));
    }
    update();
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
    setEdges([]); 
    setAdjMat([]);
    setUserSelection([]);
    setCityHover(-1);
    clearTimeout(timeoutId);
    setTimeoutId(null);
    setHeldKarpDist(undefined);
    setHeldKarpTime(undefined);
    setNearestNeighborDist(undefined);
    setNearestNeighborTime(undefined);
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
        setUserSelection(userSelection.concat([i]));
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
      <Helmet>
        <title>Optimal Odyssey</title>
        <link rel="icon" href='https://avatars.githubusercontent.com/u/83978042?v=4'></link>
      </Helmet>

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

        <div className='buttonBox'>
          <button className='guiBut'
            onClick={() => {
              setFocusedMethod(1);
              const [dist, states, time] = heldKarp(adjMat);
              animateStates(states, 1);
              setHeldKarpDist(dist.toFixed(2)); 
              setHeldKarpTime(time.toFixed(2));
              console.log(edges);
            }}
            style={{color: '#ADFF2F'}}
            >
              Run Held-Karp algorithm
          </button>
          <button className='focusBut' onClick={() => setFocusedMethod(1)}>
            <img src="/glass.svg" alt="F" className='image'/>
          </button>
          <button className='removeBut' onClick={() => {
            setHeldKarpDist(undefined)
            clearEdges(1)
          }}>
            <img src="/trash.svg" alt="R" className='image'/>
          </button>
        </div>

        <div className='buttonBox'>
          <button className='guiBut' 
          onClick={() => {
            setFocusedMethod(0);
            const [dist, states, time] = nearestNeighbor(adjMat);
            animateStates(states, 0);
            setNearestNeighborDist(dist.toFixed(2));
            setNearestNeighborTime(time.toFixed(2));
            console.log(edges)
          }}
          style={{color: '#FF4500'}}
          >
            Run Nearest Neighbor
          </button>
          <button className='focusBut' onClick={() => setFocusedMethod(0)}>
            <img src="/glass.svg" alt="F" className='image'/>
          </button>
          <button className='removeBut' onClick={() => {
            setNearestNeighborDist(undefined)
            clearEdges(0)
          }}>
            <img src="/trash.svg" alt="R" className='image'/>
          </button>
        </div>

        <div className='buttonBox'>
          <div 
          style={{color: '#87CEEB'}}
          className='pathText'
          >
            User Path
          </div>
          <button className='focusBut' onClick={() => setFocusedMethod(2)}>
            <img src="/glass.svg" alt="F" className='image'/>
          </button>
          <button className='removeBut' onClick={() => setUserSelection([])}>
            <img src="/trash.svg" alt="R" className='image'/>
          </button>
        </div>

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
      
      <ResultsGrid
        heldKarpDist={heldKarpDist}
        heldKarpTime={heldKarpTime}
        nearestNeighborDist={nearestNeighborDist}
        nearestNeighborTime={nearestNeighborTime}
        userDist={userSelection.length > 0 ? calcUserDist() : ''}
        userPathComplete={userSelection.length > num}
      />

      <Viewer className='viewer'>
        {allCities && curCities && adjMat.length > 0 && edges.length > 0 ?
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
                  {row && row.map && row.map((e, ind3) =>
                    e != -1 ?                 
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
                      </div> 
                    : <></>
                  )}
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
