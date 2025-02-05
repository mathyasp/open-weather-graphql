import { useState } from 'react'
import { gql } from '@apollo/client'
import { client } from './index'

function Weather() {
  const [ zip, setZip ] = useState('')
  const [ weather, setWeather ] = useState(null)
  const [error, setError] = useState(null)

  async function getWeather() {
    if (!zip) return
    setError(null)
      
    try {
      const json = await client.query({
        query: gql`
          query GetWeather($zip: Int!) {
            getWeather(zip: $zip) {
              temperature
              description
              humidity
              temp_min
              temp_max
              feels_like
              cod
              message
            }
          }
        `,
        variables: {
          zip: parseInt(zip, 10)
        }
      })
      
      if (json.data.getWeather.cod !== "200") {
        setError(json.data.getWeather.message)
        setWeather(null)
      } else {
        setWeather(json)
        setError(null)
      }
    } catch(err) {
      setError(err.message)
      setWeather(null)
    }
  }

  return (
    <div className="Weather">
      {error && (
        <div className="weather-error" style={{color: 'red'}}>
          Error: {error}
        </div>
      )}

      {weather && !error && (
        <div className="weather-info">
          <h2>Current Weather</h2>
          <div className="weather-details">
            <p>Temperature: {weather.data.getWeather.temperature}</p>
            <p>Description: {weather.data.getWeather.description}</p>
            <p>Humidity: {weather.data.getWeather.humidity}</p>
            <p>Minimum Temp: {weather.data.getWeather.temp_min}</p>
            <p>Maximum Temp: {weather.data.getWeather.temp_max}</p>
            <p>Feels Like: {weather.data.getWeather.feels_like}</p>
          </div>
        </div>
      )}
      
      <form onSubmit={(e) => {
        e.preventDefault()
        getWeather()
      }}>
        <input 
          value={zip}
          onChange={(e) => setZip(e.target.value)}
          placeholder="Enter ZIP code"
        />
        <button type="submit">Get Weather</button>
      </form>
    </div>
  )
}

export default Weather