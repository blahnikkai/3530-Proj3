/* eslint-disable react/prop-types */
import { Viewer } from 'resium'
import CityDisplay from './CityDisplay'
import AlgoEdges from './AlgoEdges'
import UserEdges from './UserEdges'

// GUI container containing cities and edges
export default function GlobeDisplay({
  curCities,
  edges, 
  userSelection, 
  addToSelection, 
  removeFromSubset,
  cityHover, setCityHover, 
  focusedMethod, setFocusedMethod
}) {
  return (
    <Viewer className='viewer' timeline={false} selectionIndicator={true} geocoder={true}>
      {curCities && edges.length > 0 ?
      <div>
        <CityDisplay
          curCities={curCities}
          addToSelection={addToSelection}
          removeFromSubset={removeFromSubset}
          cityHover={cityHover}
          setCityHover={setCityHover}
        />
        <AlgoEdges
          edges={edges}
          curCities={curCities}
          focusedMethod={focusedMethod}
          setFocusedMethod={setFocusedMethod}
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
