import { db } from '../../db'
const format = require('pg-promise/lib/formatting').as.format

export default {
  Query: {
    activities: async (root, args, ctx, info) => {
      let edgesSql

      // build the sql string
      if (args.paginationInput) {
        const { first, after: cursor } = args.paginationInput

        // build the where clause
        const where = cursor
          ? format(
              `
                WHERE created_at < (
                  SELECT created_at FROM activities WHERE id = $/cursor/
                )
              `,
              { cursor }
            )
          : ''

        edgesSql = format(
          `
            SELECT * 
            FROM activities
            $/where:raw/
            ORDER BY created_at DESC
            LIMIT $/first/
          `,
          { first, where }
        )
      } else {
        edgesSql = 'SELECT * FROM activities ORDER BY created_at DESC'
      }

      // run the queries as a task
      const response = await db.task(async t => {
        const totalCount = await t.one(
          'select count(*) as "totalCount" from activities'
        )
        const edges = await t.manyOrNone(edgesSql)

        // if last page, end cursor is null
        const endCursor = edges.length !== 0 ? edges[edges.length - 1].id : null

        return {
          ...totalCount,
          edges,
          pageInfo: {
            endCursor,
            hasNextPage: false
          }
        }
      })

      return { ...response }
    }
  },

  Mutation: {
    createActivity: async (root, args, ctx, info) => {
      const data = args.input

      return db.one(
        `
          insert into activities 
            (activity_name, activity_type, activity_details)
          values
            ($/activity_name/, $/activity_type/, $/activity_details/)
          returning *
        `,
        data
      )
    }
  }
}
