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
    temperature: Float!
    description: String!
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
    const temperature = json.main.temp
    const description = json.weather[0].description
    return { temperature, description }
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