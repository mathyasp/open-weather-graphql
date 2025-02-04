// Import dependancies
const express = require('express')
const { graphqlHTTP } = require('express-graphql')
const { buildSchema } = require('graphql')
const fetch = require('node-fetch')

// require dotenv and call cofig
require('dotenv').config()
const apikey = process.env.OPENWEATHERMAP_API_KEY

const schema = buildSchema(`
  type Wind {
    speed: Float
    deg: Int
    gust: Float
  }

  type Coordinates {
    lat: Float
    lon: Float
  }

  type Clouds {
    all: Int
  }

  type System {
    type: Int
    country: String
    id: Int
    sunrise: Int
    sunset: Int
  }

  type Weather {
    temperature: Float
    description: String
    feels_like: Float
    temp_min: Float
    temp_max: Float
    pressure: Float
    humidity: Float
    cod: String
    message: String
    timezone: Int
    name: String
    id: Int
    visibility: Int
    wind: Wind
    coord: Coordinates
    clouds: Clouds
    dt: Int
    sys: System
    sea_level: Float
    grnd_level: Float
  }

  enum Units {
    standard
    metric
    imperial
  }

  type Query {
    getWeather(zip: Int!, units: Units): Weather!
  }
`)

const root = {
  getWeather: async ({ zip, units = 'imperial' }) => {
    const url = `https://api.openweathermap.org/data/2.5/weather?zip=${zip}&appid=${apikey}&units=${units}`
    const res = await fetch(url)
    const json = await res.json()
    if (json.cod !== 200) {
      return {
        temperature: null,
        description: null, 
        feels_like: null,
        temp_min: null,
        temp_max: null,
        pressure: null,
        humidity: null,
        cod: json.cod,
        message: json.message
      }
    }
    
    return { 
      temperature: json.main.temp,
      description: json.weather[0].description,
      feels_like: json.main.feels_like,
      temp_min: json.main.temp_min,
      temp_max: json.main.temp_max,
      pressure: json.main.pressure,
      humidity: json.main.humidity,
      timezone: json.timezone,
      name: json.name,
      id: json.id,
      visibility: json.visibility,
      wind: {
        speed: json.wind?.speed,
        deg: json.wind?.deg,
        gust: json.wind?.gust
      },
      coord: {
        lat: json.coord?.lat,
        lon: json.coord?.lon
      },
      clouds: {
        all: json.clouds?.all
      },
      dt: json.dt,
      sys: {
        type: json.sys?.type,
        country: json.sys?.country,
        id: json.sys?.id,
        sunrise: json.sys?.sunrise,
        sunset: json.sys?.sunset
      },
      sea_level: json.main?.sea_level,
      grnd_level: json.main?.grnd_level,
      cod: json.cod.toString(),
      message: null
    }
  }
}

// Create an express app
const app = express()

// Define a route for GraphQL
app.use('/graphql', graphqlHTTP({
  schema,
  rootValue: root,
  graphiql: true
}))

// Start this app
const port = 4000
app.listen(port, () => {
  console.log('Running on port:'+port)
})