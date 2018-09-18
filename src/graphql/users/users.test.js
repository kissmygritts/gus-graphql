import 'dotenv/config'
import { graphql } from 'graphql'
import { makeExecutableSchema } from 'graphql-tools'
import { typeDefs, resolvers } from '..'
import { db } from '../../db'

console.log(process.env.NODE_ENV)
console.log(process.env.DB_URI_TEST)

afterAll(() => {
  return db.$pool.end()
})

const schema = makeExecutableSchema({
  typeDefs,
  resolvers
})

const query = `
  mutation($input: SignUpInput) {
    signup(input: $input) {
      token
    }
  }
`

const signup = async variables => {
  return graphql(schema, query, null, {}, variables)
}

// signup({
//   input: {
//     username: 'mitch',
//     email: 'mitch@email.com',
//     password: 'password'
//   }
// }).then(result => console.log(Object.keys(result)))

describe('Signup new users', () => {
  it('return a token', async () => {
    const input = {
      input: {
        username: 'mitch',
        email: 'mitch@email.com',
        password: 'password'
      }
    }

    const response = await signup(input)
    expect(Object.keys(response.data.signup)).toContain('token')
  })

  it("return error when password isn't a string", async () => {
    const input = {
      input: {
        username: 'tim',
        email: 'tim@email.com',
        password: 1234
      }
    }

    const response = await signup(input)
    console.log(Object.keys(response))
    expect(Object.keys(response)).toContain('errors')
  })

  it("return error when email isn't a string", async () => {
    const input = {
      input: { username: 'tim', email: 1234, password: 'password' }
    }

    const response = await signup(input)
    expect(Object.keys(response)).toContain('errors')
  })

  it("return error when username isn't a string", async () => {
    const input = {
      input: { username: 1234, email: 'tim@email.com', password: 'password' }
    }

    const response = await signup(input)
    expect(Object.keys(response)).toContain('errors')
  })
})
