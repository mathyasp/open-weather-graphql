// Import dependancies
const express = require('express')
const { graphqlHTTP } = require('express-graphql')
const { buildSchema } = require('graphql')
const fetch = require('node-fetch')

// require dotenv and call cofig
require('dotenv').config()
const apikey = process.env.OPENWEATHERMAP_API_KEY

const schema = buildSchema(`
# schema here
  type Weather {
    temperature: Float
    description: String
    feels_like: Float
    temp_min: Float
    temp_max: Float
    pressure: Float
    humidity: Float
    cod: Int
    message: String
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
    const temperature = json.main.temp
    const description = json.weather[0].description
    const feels_like = json.main.feels_like
    const temp_min = json.main.temp_min
    const temp_max = json.main.temp_max
    const pressure = json.main.pressure
    const humidity = json.main.humidity
    return { 
      temperature, 
      description,
      feels_like,
      temp_min,
      temp_max,
      pressure,
      humidity,
      cod: json.cod,
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