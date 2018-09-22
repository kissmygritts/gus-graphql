import { db } from '../../db'

export default {
  Query: {
    categories: async (root, args, ctx, info) => {
      console.log(JSON.stringify(ctx, null, 2))
      return db.manyOrNone('select * from categories')
    }
  },

  Mutation: {
    createCategory: async (root, args, ctx, info) => {
      console.log(JSON.stringify(root, null, 2))
      return db.one(
        'insert into categories (category, category_details) values ($/category/, $/category_details/) returning *',
        { ...args.input }
      )
    }
  },
  Node: {
    __resolveType(root, ctx, info) {
      if (root.category) {
        return 'Category'
      }
    }
  }
}
