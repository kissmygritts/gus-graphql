import promise from 'bluebird'
const initOptions = { promiseLib: promise }
const pgp = require('pg-promise')(initOptions)

const config = {
  host: 'localhost',
  port: 5432,
  database: 'gus_dev',
  user: 'mitchellgritts'
}

export const db = pgp(config)
