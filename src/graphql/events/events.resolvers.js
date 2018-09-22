import { db } from '../../db'

export default {
  Query: {
    events: async (root, args, ctx, info) => {
      return db.manyOrNone('select * from events')
    }
  }
}
