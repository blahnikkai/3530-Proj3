import Papa from 'papaparse';

// parse the CSV file using papaparse library
// template provided by gdh on geeks4geeks:
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
      }
    });
  });
}