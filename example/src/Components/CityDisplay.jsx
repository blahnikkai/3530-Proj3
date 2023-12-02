/* eslint-disable react/prop-types */
import { Cartesian2, Cartesian3, Color } from 'cesium';
import { Entity } from 'resium';

export default function CityDisplay({curCities, addToSelection, cityHover, setCityHover}) {
  return (
    <>
      {curCities.map((c, ind) => 
        <div key={c.id}>
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
    </>
  )
}
