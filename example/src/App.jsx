import { Color, Ion } from 'cesium';
import { useState, useEffect } from 'react';
import { Helmet } from "react-helmet";
import { Donut } from 'react-dial-knob';

import { heldKarp } from './functions/HeldKarp';
import { shuffle } from './functions/Shuffle'
import { makeArray } from './functions/MakeArray';
import { nearestNeighbor } from './functions/NearestNeighbor';
import { parseCSV } from './functions/ParseCSV';
import ResultsGrid from './Components/ResultsGrid';
import GlobeDisplay from './Components/GlobeDisplay';
import './App.css';

Ion.defaultAccessToken = import.meta.env.VITE_API_KEY;


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
    async function loadAllCities() {
      setAllCities(shuffle(await parseCSV()));
    }
    loadAllCities();
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
  }
  
  function addToSelection(i) {
    setFocusedMethod(2);
    if (userSelection.length > curCities.length) {
      return;
    }

    if (userSelection.find((x) => x == i) == undefined || (userSelection.length == curCities.length && i == userSelection[0])) {
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
            min={2}
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
            return ind == curCities.length ? 
            <div>
              <div className='mini-arrow-up'></div>
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
        userDist={calcUserDist()}
        userPathStarted={userSelection.length > 0}
        userPathComplete={userSelection.length > curCities.length}
      />

      <GlobeDisplay
        curCities={curCities}
        edges={edges} 
        colors={colors}
        userSelection={userSelection} 
        addToSelection={addToSelection} 
        cityHover={cityHover}
        setCityHover={setCityHover}
        focusedMethod={focusedMethod}
        setFocusedMethod={setFocusedMethod}
      />
    </div>
  );
}

export default App;
