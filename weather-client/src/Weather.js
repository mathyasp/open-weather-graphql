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

  async function getLocation() {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported')
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const formData = new FormData(formRef.current)
          const unit = formData.get('unit')

          const json = await client.query({
            query: gql`
              query GetWeatherByCoords($lat: Float!, $lon: Float!, $units: Units!) {
                getWeatherByCoords(lat: $lat, lon: $lon, units: $units) {
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
              lat: position.coords.latitude,
              lon: position.coords.longitude,
              units: unit || 'imperial'
            },
            fetchPolicy: 'network-only'
          })

          if (json.data.getWeatherByCoords.cod !== "200") {
            setError(json.data.getWeatherByCoords.message)
            setWeather(null)
          } else {
            setWeather(json)
            setError(null)
          }
        } catch(err) {
          setError(err.message)
          setWeather(null)
        }
      },
      (err) => {
        setError('Unable to retrieve location: ' + err.message)
      }
    )
  }

  const weatherData = weather?.data?.getWeather || weather?.data?.getWeatherByCoords;

  return (
    <div className="Weather">
      <form ref={formRef} className="weather-form" onSubmit={getWeather}>
        <div className="location-inputs">
          <input 
            className="zip-input"
            value={zip}
            onChange={(e) => setZip(e.target.value)}
            placeholder="Enter ZIP code"
          />
          <button 
            type="button" 
            className="location-button"
            onClick={getLocation}
          >
            📍 Use My Location
          </button>
        </div>
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
            <h2>{weatherData.temperature}°{formRef.current?.unit?.value === 'metric' ? 'C' : 'F'}</h2>
            <p className="description">{weatherData.description}</p>
          </div>
          <div className="weather-details">
            <div className="detail-item">
              <span>Feels Like</span>
              <strong>{weatherData.feels_like}°{formRef.current?.unit?.value === 'metric' ? 'C' : 'F'}</strong>
            </div>
            <div className="detail-item">
              <span>Humidity</span>
              <strong>{weatherData.humidity}%</strong>
            </div>
            <div className="detail-item">
              <span>Min/Max</span>
              <strong>{weatherData.temp_min}°{formRef.current?.unit?.value === 'metric' ? 'C' : 'F'} / {weatherData.temp_max}°{formRef.current?.unit?.value === 'metric' ? 'C' : 'F'}</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Weather