import { db } from '../../db'
const format = require('pg-promise/lib/formatting').as.format

export default {
  Query: {
    events: async (root, args, ctx, info) => {
      let edgesSql

      if (args.paginationInput) {
        const { first, after: cursor } = args.paginationInput

        const where = cursor
          ? format(
              `
                WHERE created_at < (
                  SELECT created_at FROM events WHERE id = $/cursor/
                )
              `,
              {
                cursor
              }
            )
          : ''

        edgesSql = format(
          `
            SELECT *
            FROM events
            $/where:raw/
            ORDER BY created_at DESC
            LIMIT $/first/
          `,
          {
            first,
            where
          }
        )
      } else {
        edgesSql = 'SELECT * FROM events ORDER BY created_at DESC'
      }

      const response = await db.task(async t => {
        const totalCount = await t.one(
          'SELECT count(*) AS "totalCount" FROM events'
        )
        const edges = await t.manyOrNone(edgesSql)
        const lastCursor = await t.one(
          'SELECT id FROM events ORDER BY created_at LIMIT 1'
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
          node: {
            ...m
          }
        }
      })

      return {
        totalCount: response.totalCount.totalCount,
        edges: activityNode,
        pageInfo: { endCursor, hasNextPage }
      }
    } // end bracket
  },

  Mutation: {
    createEvent: async (root, args, ctx, info) => {
      const data = args.input

      return db.one(
        `
          INSERT INTO events
            (activity_id, x, y, datum)
          VALUES
            ($/activity_id/, $/x/, $/y/, $/datum/)
          RETURNING *
        `,
        data
      )
    }
  }
}
