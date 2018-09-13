import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import { ApolloServer } from 'apollo-server-express'
import 'dotenv/config'
import { typeDefs, resolvers } from './graphql'

const app = express()
app.use(cors())
app.use(bodyParser.json())

const server = new ApolloServer({
  typeDefs,
  resolvers
})

server.applyMiddleware({ app, path: '/graphql' })

app.listen({ port: 8000 }, () => {
  console.log('Apollo server on http://localhost:8000/graphql')
})
