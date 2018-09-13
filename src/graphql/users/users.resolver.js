import { db } from '../../db'

export default {
  Query: {
    async getUsers (root, args, ctx, info) {
      return db.any('SELECT * FROM users')
    }
  },

  Mutation: {
    async signup (root, args, ctx, info) {
      console.log(args)
      await db.one('insert into users (username, email, pass) values ($/username/, $/email/, $/pass/) returning *', args)
      return 'signed up!'
    },
    login (root, args, ctx, info) {
      console.log(args)
      return 'logged in'
    }
  }
}
