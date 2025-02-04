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

  type Query {
    getWeather(zip: Int!): Weather!
  }
`)

const root = {
  // resolvers here
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