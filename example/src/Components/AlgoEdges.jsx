/* eslint-disable react/prop-types */
import { Cartesian3, Color } from 'cesium';
import { Entity } from 'resium';

export default function AlgoEdges({edges, curCities, focusedMethod, setFocusedMethod, colors}) {
  return (
    <>
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
    </>
  )
}