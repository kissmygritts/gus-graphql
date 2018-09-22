import { db } from '../../db'

export default {
  Query: {
    categories: async (root, args, ctx, info) => {
      return db.manyOrNone('select * from categories')
    }
  }
}
