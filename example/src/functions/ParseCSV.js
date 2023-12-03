import Papa from 'papaparse';

// https://stackoverflow.com/questions/61419710/how-to-import-a-csv-file-in-reactjs
export async function parseCSV() {
  return new Promise(resolve => {
    Papa.parse('data/worldcities.csv', {
      skipEmptyLines: true,
      header: true,
      dynamicTyping: true,
      download: true,
      complete: function(results) {
        resolve(results.data);
        // setAllCities(results.data.sort(() => 0.5 - Math.random())); //shuffles data
        // setArray(results.data); //non-shuffled data (debug only)
        // console.log(results.data.length);
      }
    });
  });
}