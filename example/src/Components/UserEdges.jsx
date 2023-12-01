import { Cartesian3, Color } from 'cesium';
import { Entity } from 'resium';

export default function UserEdges({userSelection, curCities, userSelectionComplete, focusedMethod, setFocusedMethod}) {
  return (
    <>
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
                material: userSelectionComplete ? Color.fromAlpha(Color.SKYBLUE, focusedMethod == 2 ? 1.0 : 0.5) : Color.fromAlpha(Color.LIGHTBLUE, focusedMethod == 2 ? 1.0 : 0.5),
                onClick: () => setFocusedMethod(2)
              }}
            />
          : <></>
        }
        </div>
      )}
    </>
  )
}