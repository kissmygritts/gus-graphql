import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { AuthenticationError, UserInputError } from 'apollo-server'
import { combineResolvers } from 'graphql-resolvers'

import { db } from '../../db'
import { isAuthenticated } from '../../lib/authorization'

const createToken = async (user, expiresIn) => {
  const { id, email, username } = user
  return jwt.sign({ id, email, username }, process.env.JWT_SECRET, {
    expiresIn
  })
}

const validatePassword = async (loginPassword, dbPassword) => {
  return bcrypt.compare(loginPassword, dbPassword)
}

export default {
  Query: {
    // async getUsers (root, args, ctx, info) {
    //   return db.any('SELECT * FROM users')
    // },

    getUsers: combineResolvers(isAuthenticated, async (root, args, ctx, info) =>
      db.any('select * from users')
    ),

    async me(root, args, ctx, info) {
      const { me } = ctx

      if (!me) {
        throw new Error(`You aren't authenticated!`)
      }

      return db.one(
        'select id, username, email, password from users where id = $/id/',
        me
      )
    }
  },

  Mutation: {
    async signup(root, args, ctx, info) {
      const { username, email, password } = args

      // create user in database
      const user = await db.one(
        'insert into users (username, email, password) values ($/username/, $/email/, $/password/) returning *',
        {
          username,
          email,
          password: await bcrypt.hash(password, 10)
        }
      )

      // sign and return JWT
      return { token: createToken(user, '30m') }
    },

    async signin(root, args, ctx, info) {
      const user = await db.one(
        'select id, email, username, password from users where email = $/email/',
        args
      )
      console.log(user)
      if (!user) {
        throw new UserInputError('No user found with this emaill address.')
      }

      // validate password
      const isValid = await validatePassword(args.password, user.password)

      if (!isValid) {
        throw new AuthenticationError('Invalid password')
      }

      return { token: createToken(user, '5m') }
    }
  }
}
