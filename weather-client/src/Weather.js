import { useState, useRef } from 'react'
import { gql } from '@apollo/client'
import { client } from './index'
import './Weather.css'

function Weather() {
  const [ zip, setZip ] = useState('')
  const [ weather, setWeather ] = useState(null)
  const [error, setError] = useState(null)
  const formRef = useRef()

  async function getWeather(e) {
    e.preventDefault()
    if (!zip) return
    
    const formData = new FormData(formRef.current)
    const unit = formData.get('unit')
    setError(null)
      
    try {
      const json = await client.query({
        query: gql`
          query GetWeather($zip: Int!, $units: Units!) {
            getWeather(zip: $zip, units: $units) {
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
          zip: parseInt(zip, 10),
          units: unit
        },
        fetchPolicy: 'network-only'
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
      <form ref={formRef} className="weather-form" onSubmit={getWeather}>
        <input 
          className="zip-input"
          value={zip}
          onChange={(e) => setZip(e.target.value)}
          placeholder="Enter ZIP code"
        />
        <div className="unit-selector">
          <label>
            <input
              type="radio"
              name="unit"
              value="imperial"
              defaultChecked
            /> °F
          </label>
          <label>
            <input
              type="radio"
              name="unit"
              value="metric"
            /> °C
          </label>
        </div>
        <button className="submit-button" type="submit" >
          Get Weather
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
            <h2>{weather.data.getWeather.temperature}°{formRef.current?.unit?.value === 'metric' ? 'C' : 'F'}</h2>
            <p className="description">{weather.data.getWeather.description}</p>
          </div>
          <div className="weather-details">
            <div className="detail-item">
              <span>Feels Like</span>
              <strong>{weather.data.getWeather.feels_like}°{formRef.current?.unit?.value === 'metric' ? 'C' : 'F'}</strong>
            </div>
            <div className="detail-item">
              <span>Humidity</span>
              <strong>{weather.data.getWeather.humidity}%</strong>
            </div>
            <div className="detail-item">
              <span>Min/Max</span>
              <strong>{weather.data.getWeather.temp_min}°{formRef.current?.unit?.value === 'metric' ? 'C' : 'F'} / {weather.data.getWeather.temp_max}°{formRef.current?.unit?.value === 'metric' ? 'C' : 'F'}</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Weather