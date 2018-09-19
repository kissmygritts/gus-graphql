import 'dotenv/config'
import { graphql } from 'graphql'
import { makeExecutableSchema } from 'graphql-tools'
import { typeDefs, resolvers } from '..'
// import { db } from '../../db'
import { cleanDatabase } from '../../../test/helper.js'

const schema = makeExecutableSchema({
  typeDefs,
  resolvers
})

const signupMutation = /* GraphQL */ `
  mutation($input: SignUpInput) {
    signup(input: $input) {
      token
    }
  }
`

const signinMutation = /* GraphQL */ `
  mutation($input: SignInInput) {
    signin(input: $input) {
      token
    }
  }
`

const queryRunner = async (query, variables) => {
  return graphql(schema, query, null, {}, variables)
}

const username = 'mitch'
const email = 'mitch@email.com'
const password = 'password'

describe('Signup new users', () => {
  beforeAll(() => cleanDatabase())

  // afterAll(() => {
  //   cleanDatabase().then(() => db.$pool.end())
  // })

  it('return a token', async () => {
    const response = await queryRunner(signupMutation, {
      input: { username, email, password }
    })
    expect(typeof response.data.signup.token).toBe('string')
  })

  it("return error when password isn't a string", async () => {
    const response = await queryRunner(signupMutation, {
      input: { username, email, password: 1234 }
    })
    expect(response).toMatchSnapshot()
  })

  it("return error when email isn't a string", async () => {
    const response = await queryRunner(signupMutation, {
      input: { username, email: 1234, password }
    })
    expect(response).toMatchSnapshot()
  })

  it("return error when username isn't a string", async () => {
    const response = await queryRunner(signupMutation, {
      input: { username: 1234, email, password }
    })
    expect(response).toMatchSnapshot()
  })

  it('return duplicate entry error when same email is used', async () => {
    const response = await queryRunner(signupMutation, {
      input: { username: 'tim', email, password }
    })
    expect(response).toMatchSnapshot()
  })

  it('return duplicate entry error when same username is used', async () => {
    const response = await queryRunner(signupMutation, {
      input: { username, email: 'tim@email', password }
    })
    expect(response).toMatchSnapshot()
  })

  it('return null constraint error when a null value is used', async () => {
    // this validation isn't passing the graphql validation step because
    // it is an invalid query: https://graphql.org/learn/validation/
    const response = await queryRunner(signupMutation, {
      input: { username: null, email, password }
    })
    expect(response).toMatchSnapshot()
  })
})

describe('Signin a user', () => {
  beforeAll(() => {
    return queryRunner(signupMutation, {
      input: { username, email, password }
    })
  })

  it('return a token after successful signin', async () => {
    const response = await queryRunner(signinMutation, {
      input: { email, password }
    })
    expect(typeof response.data.signin.token).toBe('string')
  })

  it('return an error if user is not found', async () => {
    const response = await queryRunner(signinMutation, {
      input: { email: 'mike@email.com', password }
    })
    expect(response).toMatchSnapshot()
  })

  it('return an error if password is incorrect', async () => {
    const response = await queryRunner(signinMutation, {
      input: { email, password: 'pass' }
    })
    expect(response).toMatchSnapshot()
  })
})
