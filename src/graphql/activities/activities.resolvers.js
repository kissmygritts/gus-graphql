import { db } from '../../db'
import { create, CategoryLoader } from './activities.model'
import { sq } from '../../db/sqorn'
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
        // get the count of all the records in the database
        const totalCount = await t.one(
          'select count(*) as "totalCount" from activities'
        )
        // get all the records from the database
        const edges = await t.manyOrNone(edgesSql)
        // get the very last records id
        const lastCursor = await t.one(
          'SELECT id FROM activities ORDER BY created_at LIMIT 1'
        )

        return {
          totalCount,
          edges,
          lastCursor
        }
      })

      // last cursor on the current page
      const endCursor =
        response.edges.length !== 0
          ? response.edges[response.edges.length - 1].id
          : null
      // is there another page, check if lastCursor is in the current page
      const hasNextPage =
        response.edges.map(m => m.id).indexOf(response.lastCursor.id) === -1
      // create ActivityNode
      const activityNode = response.edges.map(m => {
        return {
          cursor: m.id,
          node: { ...m }
        }
      })

      return {
        totalCount: response.totalCount.totalCount,
        edges: activityNode,
        pageInfo: {
          endCursor,
          hasNextPage
        }
      }
    }
  },

  Mutation: {
    createActivity: async (root, args, ctx, info) => {
      const data = args.input
      return create({ table: 'activities', data })
    },

    deleteActivity: async (root, args, ctx, info) => {
      const id = args.id
      return sq.l`delete from activities where id = ${id} returning *`.one()
    }
  },

  Activity: {
    categories: async (root, args, ctx, info) => {
      return CategoryLoader.load(root.id).then(data => {
        return data
      })
    }
  }
}
