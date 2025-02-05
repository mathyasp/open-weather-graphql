import { useState } from 'react'
import { gql } from '@apollo/client'
import { client } from './index'
import './Weather.css'

function Weather() {
  const [ zip, setZip ] = useState('')
  const [ weather, setWeather ] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  async function getWeather() {
    if (!zip) return
    setLoading(true)
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
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="Weather">
      <form className="weather-form" onSubmit={(e) => {
        e.preventDefault()
        getWeather()
      }}>
        <input 
          className="zip-input"
          value={zip}
          onChange={(e) => setZip(e.target.value)}
          placeholder="Enter ZIP code"
        />
        <button className="submit-button" type="submit" disabled={loading}>
          {loading ? 'Loading...' : 'Get Weather'}
        </button>
      </form>

      {error && (
        <div className="weather-error">
          <span className="error-icon">⚠️</span> {error}
        </div>
      )}

      {weather && !error && (
        <div className="weather-info">
          <div className="weather-main">
            <h2>{weather.data.getWeather.temperature}°F</h2>
            <p className="description">{weather.data.getWeather.description}</p>
          </div>
          <div className="weather-details">
            <div className="detail-item">
              <span>Feels Like</span>
              <strong>{weather.data.getWeather.feels_like}°F</strong>
            </div>
            <div className="detail-item">
              <span>Humidity</span>
              <strong>{weather.data.getWeather.humidity}%</strong>
            </div>
            <div className="detail-item">
              <span>Min/Max</span>
              <strong>{weather.data.getWeather.temp_min}°F / {weather.data.getWeather.temp_max}°F</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Weather