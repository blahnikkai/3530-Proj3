import { Cartesian3, Color, Material } from 'cesium'
import { Viewer, Entity, PolylineGraphics } from "resium";
import { useState, useEffect } from "react";
import Papa from 'papaparse';
import "./App.css"


function App() {
  const [array, setArray] = useState();
  const [subset, setSubset] = useState();
  const [index, setIndex] = useState(0);
  const [num, setNum] = useState(5);


  useEffect(() => {
    getData();
  }, [])

  useEffect(() => {
    console.log(array);
    createSubarray();
  }, [array])

  async function createSubarray() {
    setSubset(array.slice(index, index + num));
    setIndex(index + num + 1);
    console.log(subset);
  }

  //https://stackoverflow.com/questions/61419710/how-to-import-a-csv-file-in-reactjs
  async function getData() {
    const data = Papa.parse(await fetchCsv(), {
      skipEmptyLines: true,
      header: true,
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

  const positions = Cartesian3.fromDegreesArrayHeights([0, 0, 1000, 100, 100, 1000]);

  return (
    <div>
      <div className='gui'>
          <button className='guiBut' onClick={() => createSubarray()}></button>
      </div>
      <Viewer className='viewer'>
        {array && subset ?

        <div>
          {subset.map((c) => 
            <div key={c.admin_name}>
              <Entity
                name= {c.admin_name}
                position={Cartesian3.fromDegrees(parseFloat(c.lng), parseFloat(c.lat))}
                point={{ pixelSize: 20, color: Color.WHITE }}
              />
              {subset.map((d) => {
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
                      material= {Color.RED}
                    />
                  </Entity> 
                </div>

              })}
            </div>

          )}

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