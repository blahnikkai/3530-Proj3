import { Cartesian3, Color } from 'cesium'
import { Viewer, Entity} from "resium";
import { useState, useEffect } from "react";
import Papa from 'papaparse';
import "./App.css"


function App() {
  const [array, setArray] = useState();
  const [subset, setSubset] = useState();
  const [index, setIndex] = useState(0);
  const [num, setNum] = useState(10);

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


  return (
    <div>
      <div className='gui'>
          <button className='guiBut' onClick={() => createSubarray()}></button>
      </div>
      <Viewer className='viewer'>
        {array && subset ?
        subset.map(c => 
          <Entity
            name= {c.admin_name}
            position={Cartesian3.fromDegrees(parseFloat(c.lng), parseFloat(c.lat))}
            point={{ pixelSize: 20, color: Color.WHITE }}
          />
        )
        : <></>}
      </Viewer>

    </div>
  );
}

export default App;