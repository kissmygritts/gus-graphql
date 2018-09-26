import { sq } from '../../db/sqorn'

export default {
  Query: {
    categories: async (root, args, ctx, info) => {
      const categories = sq.from`categories`
      console.log(categories.query)
      return categories.all()
    }
  },

  Mutation: {
    createCategory: async (root, args, ctx, info) => {
      const create = sq.from`categories`.insert({ ...args.input }).return`*`
      const newCategory = await create.one()
      console.log(newCategory)

      return newCategory
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
