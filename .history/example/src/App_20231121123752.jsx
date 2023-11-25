import { Cartesian2, Cartesian3, Color } from 'cesium'
import { Viewer, Entity, PolylineGraphics } from "resium";
import { useState, useEffect } from "react";
import Papa from 'papaparse';
import "./App.css"
// Earth's radius in meters
const EARTH_R = 6378100;

function in_mask()

function heldKarp(adjMat) {
  const n = adjMat.length;
  let dp = Array.from(Array(1 << n), () => new Array(n));
  let nxt = Array.from(Array(1 << n), () => new Array(n));
  for(let i = (1 << n) - 1; i >= 0; --i) {
    for(let j = 0; j < n; ++j) {
      if()
    }
  }
}

function App() {
  const [array, setArray] = useState([]);
  const [subset, setSubset] = useState([]);
  const [edges, setEdges] = useState([]);
  const [adjMat, setAdjMat] = useState([[]]);
  const [index, setIndex] = useState(0);
  const [num, setNum] = useState(5);

  useEffect(() => {
    getData();
  }, [])

  useEffect(() => {
    createSubarray();
  }, [array])

  useEffect(() => {
    buildAdjMat();
    console.log(subset);
    if(subset.length !== 0) {
      setEdges([[0, 1], [1, 2], [2, 3], [3, 4], [4, 0]]);
    }
  }, [subset])

  function calcDistance(lat1, lng1, lat2, lng2) {
    let p1 = Cartesian3.fromDegrees(lng1, lat1)
    let p2 = Cartesian3.fromDegrees(lng2, lat2)
    // great circle distance in km
    return (1 / 1000) * (EARTH_R * Math.acos(Cartesian3.dot(p1, p2) / (EARTH_R ** 2)))
  }

  function buildAdjMat() {
    let mat = Array.from(Array(subset.length), () => new Array(subset.length))
    for(let i = 0; i < subset.length; ++i) {
        for(let j = i + 1; j < subset.length; ++j) {
            const dist = calcDistance(subset[i].lng, subset[i].lat, subset[j].lng, subset[j].lat)
            mat[i][j] = dist
            mat[j][i] = dist
        }
    }
    console.log(mat)
    setAdjMat(mat)
  }

  async function createSubarray() {
    let newSubset = array.slice(index, index + num);
    console.log(newSubset);
    setSubset(newSubset); //cap num at 300?
    setIndex((index + num) % 41000);
    // why is array length only ~9000 instead of 44000
    console.log(array.length)
  }

  //https://stackoverflow.com/questions/61419710/how-to-import-a-csv-file-in-reactjs
  async function getData() {
    const data = Papa.parse(await fetchCsv(), {
      skipEmptyLines: true,
      header: true,
      dynamicTyping: true,
      complete: function(results) {
        setArray(results.data.sort(() => 0.5 - Math.random()));
      }
    });
    return data;
  }
  
  async function fetchCsv() {
    const response = await fetch('data/worldcities.csv');
    const reader = response.body.getReader();
    const result = await reader.read();
    const decoder = new TextDecoder('utf-8');
    const csv = await decoder.decode(result.value);
    return csv;
  }

//   const positions = Cartesian3.fromDegreesArrayHeights([0, 0, 1000, 100, 100, 1000]);

  return (
    <div>
      <div className='gui'>
          <button className='guiBut' onClick={() => createSubarray()}></button>
      </div>
      <Viewer className='viewer'>
        {array && subset ?

        <div>
          {subset.map((c, ind) => 
            <div key={c.admin_name}>
              <Entity
                name={c.city}
                position={Cartesian3.fromDegrees(c.lng, c.lat)}
                point={{ pixelSize: 20, color: Color.WHITE }}
                label={{ text: `${c.city}, ${c.iso3} (${ind})`, 
                font: '10px sans-serif', 
                pixelOffset: new Cartesian2(20, 20) }}
              />
              {/* {subset.map((d) => {
                return <div key={d.admin_name}>                
                  <Entity>
                    <PolylineGraphics
                      show
                      width={5}
                      positions={ 
                        Cartesian3.fromDegreesArray(
                          [parseFloat(c.lng), parseFloat(c.lat), parseFloat(d.lng), parseFloat(d.lat)]
                        )
                      }
                      material={Color.RED}
                    />
                  </Entity> 
                </div>

              })} */}
            </div>
          )}
          {edges.map((edge, ind) =>
            {return <div key={ind}>
              <Entity>
                <PolylineGraphics
                  show
                  width={5}
                  positions={ 
                    Cartesian3.fromDegreesArray(
                      [subset[edge[0]].lng, subset[edge[0]].lat,
                      subset[edge[1]].lng, subset[edge[1]].lat]
                    )
                  }
                  material={Color.RED}
                />
              </Entity>
            </div>
          })}
        </div>
        : <>Loading...</>}
      </Viewer>

    </div>
  );
}

export default App;





// import React, { useState, useEffect } from "react";
// import { Cartesian3, Color } from "cesium";
// import { Viewer, Entity, PolylineGraphics } from "resium";

// const positions = Cartesian3.fromDegreesArrayHeights([0, 0, 1000, 100, 100, 1000]);

// const App = () => {


//   return (
//     <Viewer full>
//       <Entity>
//         <PolylineGraphics
//           show
//           width={3}
//           material={Color.RED}
//           positions={positions}
//         />
//       </Entity>
//       <div style={{ position: "absolute", left: "0", top: "0", color: "#fff" }}>{0}</div>
//     </Viewer>
//   );
// };

// export default App;