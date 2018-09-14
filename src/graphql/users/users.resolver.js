import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { AuthenticationError, UserInputError } from 'apollo-server'
import { db } from '../../db'

const createToken = async (user, expiresIn) => {
  const { id, email, username } = user
  return jwt.sign(
    { id, email, username },
    process.env.JWT_SECRET,
    { expiresIn }
  )
}

const validatePassword = async (loginPassword, dbPassword) => {
  return bcrypt.compare(loginPassword, dbPassword)
}

export default {
  Query: {
    async getUsers (root, args, ctx, info) {
      return db.any('SELECT * FROM users')
    },

    async me (root, args, ctx, info) {
      const { user } = ctx

      if (!user) {
        throw new Error(`You aren't authenticated!`)
      }

      return db.one('select id, username, email, pass from users where id = $/id$', user)
    }
  },

  Mutation: {
    async signup (root, args, ctx, info) {
      const { username, email, pass } = args

      // create user in database
      const user = await db.one(
        'insert into users (username, email, pass) values ($/username/, $/email/, $/pass/) returning *',
        {
          username,
          email,
          pass: await bcrypt.hash(pass, 10)
        }
      )

      // sign and return JWT
      return { token: createToken(user, '30m') }
    },

    async login (root, args, ctx, info) {
      const user = await db.one('select id, email, username, pass from users where email = $/email/', args)
      console.log(user)
      if (!user) {
        throw new UserInputError('No user found with this emaill address.')
      }

      // validate password
      const isValid = await validatePassword(args.password, user.pass)

      if (!isValid) {
        throw new AuthenticationError('Invalid password')
      }

      return { token: createToken(user, '5m') }
    }
  }
}
