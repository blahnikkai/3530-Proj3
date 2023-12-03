/* eslint-disable react/prop-types */
import { Donut } from 'react-dial-knob';
import { heldKarp } from '../functions/HeldKarp';
import { nearestNeighbor } from '../functions/NearestNeighbor';

export default function Toolbar({
  num, setNum,
  setFocusedMethod,
  animateStates,
  setHeldKarpDist,
  setHeldKarpTime,
  setNearestNeighborDist,
  setNearestNeighborTime,
  setUserTime,
  edges, clearEdges,
  sampleCities,
  adjMat,
  animationSpeed, setAnimationSpeed,
  curCities,
  userSelection, setUserSelection
}) {
  return (
    <div className='gui'>
        <div className='gray-box-of-doom'>
          <Donut
            diameter={70}
            min={0}
            max={25}
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
              if(curCities.length === 0)
                return;
              setFocusedMethod(1);
              const [dist, states, time] = heldKarp(adjMat);
              animateStates(states, 1);
              setHeldKarpDist(dist.toFixed(2)); 
              setHeldKarpTime(time.toFixed(2));
            }}
            style={{color: '#ADFF2F'}}
            >
              Run Held-Karp algorithm
          </button>
          <button className='focusBut' onClick={() => setFocusedMethod(1)}>
            <img src='/glass.svg' alt='F' className='image'/>
          </button>
          <button className='removeBut' onClick={() => {
            setHeldKarpDist(undefined)
            clearEdges(1)
          }}>
            <img src='/trash.svg' alt='R' className='image'/>
          </button>
        </div>

        <div className='buttonBox'>
          <button className='guiBut' 
          onClick={() => {
            if(curCities.length === 0)
              return;
            setFocusedMethod(0);
            const [dist, states, time] = nearestNeighbor(adjMat);
            animateStates(states, 0);
            setNearestNeighborDist(dist.toFixed(2));
            setNearestNeighborTime(time.toFixed(2));
          }}
          style={{color: '#FF4500'}}
          >
            Run Nearest Neighbor
          </button>
          <button className='focusBut' onClick={() => setFocusedMethod(0)}>
            <img src='/glass.svg' alt='F' className='image'/>
          </button>
          <button className='removeBut' onClick={() => {
            setNearestNeighborDist(undefined)
            clearEdges(0)
          }}>
            <img src='/trash.svg' alt='R' className='image'/>
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
            <img src='/glass.svg' alt='F' className='image'/>
          </button>
          <button className='removeBut' onClick={() => {setUserSelection([]); setUserTime(undefined)}}>
            <img src='/trash.svg' alt='R' className='image'/>
          </button>
        </div>

        <div className='arrow-down'></div>
        <div className='gray-box-of-doom-2'>
          <div className='knobLabel'>Animation <br/> speed:</div>
          <Donut
            diameter={70}
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
  )
}