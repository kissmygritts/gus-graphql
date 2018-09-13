import { db } from '../../db'

module.exports = {
  Query: {
    getUsers: (root, args, ctx, info) => {
      return db.any('SELECT * FROM users')
    }
  }
}
