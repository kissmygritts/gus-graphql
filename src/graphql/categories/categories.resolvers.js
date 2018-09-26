import { sq } from '../../db/sqorn'

export default {
  Query: {
    categories: async (root, args, ctx, info) => {
      // console.log(JSON.stringify(ctx, null, 2))
      const categories = sq.from`categories`
      console.log(categories.query)
      return categories.all()
      // return db.manyOrNone('select * from categories')
    }
  },

  Mutation: {
    createCategory: async (root, args, ctx, info) => {
      const create = sq.from`categories`.insert({ ...args.input }).return`*`
      const newCategory = await create.one()
      console.log(newCategory)

      return newCategory
      // return db.one(
      //   'insert into categories (category, category_details) values ($/category/, $/category_details/) returning *',
      //   { ...args.input }
      // )
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
