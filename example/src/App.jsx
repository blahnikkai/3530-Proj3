import { Ion } from 'cesium';
import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';

import { shuffle } from './functions/Shuffle'
import { makeArray } from './functions/MakeArray';
import { parseCSV } from './functions/ParseCSV';
import ResultsGrid from './Components/ResultsGrid';
import GlobeDisplay from './Components/GlobeDisplay';
import Toolbar from './Components/Toolbar';
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
  const [focusedMethod, setFocusedMethod] = useState(-1); //0 - nn, 1 - hk, 2 - user
  const [search, setSearch] = useState('');

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
        <link rel='icon' href='https://avatars.githubusercontent.com/u/83978042?v=4'></link>
      </Helmet>

      <form 
        onSubmit={(e) => {
          e.preventDefault();
          const addedCities = allCities.filter((city => city.city_ascii == search));
          const newCities = curCities.concat(addedCities);
          setCurCities(newCities);
        }}
      >
        <input 
          className='searchBar' 
          type='text'
          value={search}
          onChange={(e) => {
            e.preventDefault();
            setSearch(e.target.value);
          }}
        />
      </form>

      <Toolbar
        num={num}
        setNum={setNum}
        setFocusedMethod={setFocusedMethod}
        animateStates={animateStates}
        setHeldKarpDist={setHeldKarpDist}
        setHeldKarpTime={setHeldKarpTime}
        setNearestNeighborDist={setNearestNeighborDist}
        setNearestNeighborTime={setNearestNeighborTime}
        edges={edges}
        clearEdges={clearEdges}
        sampleCities={sampleCities}
        adjMat={adjMat}
        animationSpeed={animationSpeed}
        setAnimationSpeed={setAnimationSpeed}
        curCities={curCities}
        userSelection={userSelection}
        setUserSelection={setUserSelection}
      />
      
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
