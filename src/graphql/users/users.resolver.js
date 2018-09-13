import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { db } from '../../db'

// const createToken = async (user, secret, expiresIn) => {
//   const { id, email, username } = user
//   return jwt.sign({ id, email, username }, secret, { expiresIn })
// }

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

      const user = await db.one(
        'insert into users (username, email, pass) values ($/username/, $/email/, $/pass/) returning *',
        {
          username,
          email,
          pass: await bcrypt.hash(pass, 10)
        }
      )

      return jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '1y' }
      )
    },
    login (root, args, ctx, info) {
      console.log(args)
      return 'logged in'
    }
  }
}
