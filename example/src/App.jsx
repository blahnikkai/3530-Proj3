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
  const [distances, setDistances] = useState()


  useEffect(() => { //on page load
    getData();
  }, [])

  useEffect(() => {
    console.log(array);
    createSubarray();
  }, [array])

  //https://stackoverflow.com/questions/27928/calculate-distance-between-two-latitude-longitude-points-haversine-formula
  function distance(lat1, lon1, lat2, lon2) {
    const r = 6371; // km
    const p = Math.PI / 180;
  
    const a = 0.5 - Math.cos((lat2 - lat1) * p) / 2
                  + Math.cos(lat1 * p) * Math.cos(lat2 * p) *
                    (1 - Math.cos((lon2 - lon1) * p)) / 2;
  
    return 2 * r * Math.asin(Math.sqrt(a));
  }


  async function createSubarray() {
    console.log(index);
    setSubset(array.slice(index, index + num)); //cap num at 300?
    setIndex((index + num + 1) % 41000); 
    console.log(subset);

    await createDistances();
  }

  async function createDistances() {
    var temp = [];
    for (var x = 0; x < num; x++) {
      var temp2 = []
      for (var y = 0; y < num; y++) {
        var dist = distance(subset[x].lat, subset[x].lng, subset[y].lat, subset[y].lng);
        temp2.push(dist);
      }
      temp.push(temp2);
    }
    console.log(temp);
    setDistances(temp);
  }

  //https://stackoverflow.com/questions/61419710/how-to-import-a-csv-file-in-reactjs
  async function getData() {
    const data = Papa.parse(await fetchCsv(), {
      skipEmptyLines: true,
      header: true,
      complete: function(results) {
        // setArray(results.data.sort(() => 0.5 - Math.random())); //shuffles data
        setArray(results.data); //shuffles data
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


  return (
    <div>
      <div className='gui'>
          <button className='guiBut' onClick={() => createSubarray()}></button>
      </div>
      <Viewer className='viewer'>
        {array && subset && distances?

        <div>
          {
          subset.map((c, i) => 
            <div key={c.admin_name}>
              <Entity
                name= {c.admin_name}
                position={Cartesian3.fromDegrees(parseFloat(c.lng), parseFloat(c.lat))}
                point={{ pixelSize: 20, color: Color.WHITE }}
              />
              {subset.map((d, j) => {
                return <div key={d.admin_name}>                
                  <Entity>
                    <PolylineGraphics
                      show
                      width={2}
                      positions={ 
                        Cartesian3.fromDegreesArray(
                          [parseFloat(c.lng), parseFloat(c.lat), parseFloat(d.lng), parseFloat(d.lat)]
                        )
                      }
                      material= {Color.fromBytes(0, 255*(distances[i][j]/20000), 255, 255)}
                      id= {"placeholder - doesn't work?"}
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




