import { Cartesian3, Color } from 'cesium'
import { Viewer, Entity} from "resium";
import { useState, useEffect } from "react";
import Papa from 'papaparse';


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

  const data = [
    {
      type: "Feature",
      properties: {
        name: "Coors Field",
        amenity: "Baseball Stadium",
        popupContent: "This is where the Rockies play!",
      },
      geometry: {
        type: "Point",
        coordinates: [-104.99404, 39.75621],
      },
    },
    {
      type: "Feature",
      properties: {
        name: "Tokyo",
      },
      geometry: {
        type: "Point",
        coordinates: [139.69, 35.69],
      },
    },
    ];
    
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
      <Viewer full>
        {data.map(d => 
          <Entity
            name="Tokyo"
            position={Cartesian3.fromDegrees(139.69, 35.69)}
            point={{ pixelSize: 10, color: Color.WHITE }}
          />
        )}
      </Viewer>
    </div>
  );
}

export default App;