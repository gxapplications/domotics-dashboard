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

db.getLastAccessedPageSlug = function(callback, createIfNotFound = false) {
  db.get("SELECT slug FROM pages ORDER BY last_access DESC LIMIT 1", (err, row) => {
    if (err) {
      return callback(err)
    }
    if (!row && createIfNotFound) {
      const now = (new Date()).getTime()
      db.run("INSERT INTO pages (slug, name, last_access) VALUES (\"default\", \"Default Home\", ?)", now, (err) => {
        return callback(err, 'default')
      })
    } else {
      if (row) {
        return callback(null, row.slug)
      }
      callback(null, null)
    }
  })
  // No last_access update here
}

db.getPageBySlug = function(slug, callback) {
    db.get("SELECT * FROM pages WHERE slug=? LIMIT 1", slug, (err, row) => {
        if (err) {
            return callback(err)
        }
        const now = (new Date()).getTime()
        db.run("UPDATE pages SET last_access=? WHERE slug=?", now, slug, (err) => {
            return callback(err, row)
        })
    })
}

// exports
export default db
