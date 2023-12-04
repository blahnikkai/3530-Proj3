/* eslint-disable react/prop-types */
import { useState } from 'react';
import '../App.css'

function makeCityString(city) {
  return city.city_ascii + ", " + city.admin_name + ", " + city.country;
}

// The container and dropdown for parsing search input and displaying output results
export default function SearchBar({allCities, curCities, setCurCities, search, setSearch}) {
  const [extraCities, setExtraCities] = useState([]);
  return (
    <div className='searchContainer'>
      <input 
        className='searchBar' 
        type='text'
        value={search}
        placeholder='Search cities to add...'
        onChange={(e) => {
          e.preventDefault();
          const newSearch = e.target.value;
          setSearch(newSearch);
          let newExtraCities = [];
          if(newSearch.length >= 2) {
            newExtraCities = allCities.filter(((city) => {
              const cityString = makeCityString(city);
              return cityString.toLowerCase().startsWith(newSearch.toLowerCase());
            }));
          }
          setExtraCities(newExtraCities.sort((cityA, cityB) => cityB.population - cityA.population));
        }}
      />
      <ul className='searchDropdown'>
        {extraCities.map((city, index) =>
          <li 
            key={index} 
            className='searchDropdownItem'
            onClick={() => {
              if(!curCities.includes(city)) {
                const newCities = curCities.concat([city]);
                setCurCities(newCities);
              }
            }}
          >
            {makeCityString(city)}
          </li>
        )}
      </ul>
    </div>
  )
}