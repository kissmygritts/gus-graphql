import { db } from '../src/db'

export const initDatabase = async () => {
  // first teardown
  // second, create users
  return db.none(`
    INSERT INTO users (username, email, password) VALUES 
    ('tim', 'tim@email.com', 'password'),
    ('mitch', 'mitch@email.com', 'password')
  `)
}

export const clearDatabase = () => {
  return db.none(`TRUNCATE users RESTART IDENTITY CASCADE`)
}
