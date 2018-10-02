import DataLoader from 'dataloader'
import { sq } from '../../db/sqorn'
import { db } from '../../db'
const { format } = db.$config.pgp.as
const { helpers } = db.$config.pgp

const pgpLoadBatch = keys => {
  return format(
    `
    select
            j.activity_id,
            c.id,
            c.category,
            c.category_details,
            j.created_at
          from activity_categories as j
            inner join categories as c on j.category_id = c.id
          where j.activity_id in ($/keys:csv/)
  `,
    { keys }
  )
}

// create a single input
export const create = async ({ table, data }) => {
  const insert = helpers.insert(data, Object.keys[0], table) + ' returning *'
  console.log(insert)
  return db.one(insert)
}

// const batchLoadCategory = async keys => {
//   const inSql = keys.reduce((prev, curr) => sq.l`${prev}, ${curr}`)
//   const sql = sq.l`
//         select
//             j.activity_id,
//             c.id,
//             c.category,
//             c.category_details,
//             j.created_at
//           from activity_categories as j
//             inner join categories as c on j.category_id = c.id
//           where activity_categories.activity_id in (${inSql})
//   `
//   console.log(sql.query)
//   return sql
// }

export const CategoryLoader = new DataLoader(keys =>
  db
    .many(pgpLoadBatch(keys))
    .then(data => keys.map(k => data.filter(o => o.activityId === k)))
)
