'use strict'

import Sqlite from 'sqlite3'
import fs from 'fs'
import Path from 'path'

const file = Path.join(__dirname, '..', 'var', 'data.db')
const exists = fs.existsSync(file)

if (!exists) {
  console.log("Creating DB file.")
  fs.openSync(file, "w")
}

const sql = Sqlite.verbose()
const db = new sql.Database(file)

// Script to init a new database
if (!exists) {
  db.serialize(() => {
    db.run("CREATE TABLE accounts (password TEXT)")
    db.run("CREATE TABLE pages (slug TEXT, name TEXT, last_access INTEGER)")
  })
}

db.storePassword = function(password) {
  db.serialize(() => {
    db.run("DELETE from accounts")
    db.run("INSERT INTO accounts (password) VALUES (?)", password)
  })
}

db.getPassword = function(callback) {
  db.get("SELECT password FROM accounts LIMIT 1", callback)
}

// exports
export default db
