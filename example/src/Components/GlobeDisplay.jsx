/* eslint-disable react/prop-types */
import { Viewer } from 'resium'
import CityDisplay from './CityDisplay'
import AlgoEdges from './AlgoEdges'
import UserEdges from './UserEdges'

export default function GlobeDisplay({
  curCities, 
  edges, 
  colors,
  userSelection, 
  addToSelection, 
  cityHover, setCityHover, 
  focusedMethod, setFocusedMethod
}) {
  return (
    <Viewer className='viewer'>
      {curCities && edges.length > 0 ?
      <div>
        <CityDisplay
          curCities={curCities}
          addToSelection={addToSelection}
          cityHover={cityHover}
          setCityHover={setCityHover}
        />
        <AlgoEdges
          edges={edges}
          curCities={curCities}
          focusedMethod={focusedMethod}
          setFocusedMethod={setFocusedMethod}
          colors={colors}
        />
        <UserEdges
          userSelection={userSelection}
          curCities={curCities}
          userSelectionComplete={userSelection.length > curCities.length}
          focusedMethod={focusedMethod}
          setFocusedMethod={setFocusedMethod}
        />
      </div>
      : <>Loading...</>}
    </Viewer>
  )
}
