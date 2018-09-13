import promise from 'bluebird'
const initOptions = { promiseLib: promise }
const pgp = require('pg-promise')(initOptions)

console.log(process.env.DB_USER)

const config = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  database: process.env.DB_NAME
}

export const db = pgp(config)
