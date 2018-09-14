import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import jwt from 'jsonwebtoken'
import { ApolloServer, AuthenticationError } from 'apollo-server-express'

import 'dotenv/config'

import { typeDefs, resolvers } from './graphql'

// app middleware
const app = express()
app.use(cors())
app.use(bodyParser.json())

const getMe = async req => {
  // console.log(JSON.stringify(req.headers))
  const token = req.headers['x-token']
  if (token) {
    try {
      return await jwt.verify(token, process.env.JWT_SECRET)
    } catch (e) {
      throw new AuthenticationError('Your session expired')
    }
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    return {
      me: await getMe(req)
    }
  }
})

server.applyMiddleware({ app, path: '/graphql' })

app.listen({ port: 8000 }, () => {
  console.log('Apollo server on http://localhost:8000/graphql')
})
