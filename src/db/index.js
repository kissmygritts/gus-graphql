import promise from 'bluebird'
const initOptions = { promiseLib: promise }
const pgp = require('pg-promise')(initOptions)
const monitor = require('pg-monitor')

const config = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  database: process.env.DB_NAME
}

monitor.setTheme('matrix')
monitor.attach(initOptions)

export const db = pgp(config)
