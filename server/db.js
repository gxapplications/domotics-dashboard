'use strict'

import Sqlite from 'sqlite3'
import fs from 'fs'
import Path from 'path'

const file = Path.join(__dirname, '..', 'var', 'data.db')
const exists = fs.existsSync(file)

if (!exists) {
  console.log('Creating DB file.')
  fs.openSync(file, 'w')
}

const sql = Sqlite.verbose()
const db = new sql.Database(file)

// Script to init a new database
if (!exists) {
  db.serialize(() => {
    db.run('CREATE TABLE accounts (password TEXT)')
    db.run('CREATE TABLE pages (slug TEXT, name TEXT, last_access INTEGER, positions TEXT, layout INTEGER)')
    db.run('CREATE TABLE components (id INTEGER PRIMARY KEY, type INTEGER)')
  })
}

db.storePassword = function (password) {
  db.serialize(() => {
    db.run('DELETE from accounts')
    db.run('INSERT INTO accounts (password) VALUES (?)', password)
  })
}

db.getPassword = function (callback) {
  db.get('SELECT password FROM accounts LIMIT 1', callback)
}

db.getLastAccessedPageSlug = function (callback, createIfNotFound = false) {
  db.get('SELECT slug FROM pages ORDER BY last_access DESC LIMIT 1', (err, row) => {
    if (err) {
      return callback(err)
    }
    if (!row && createIfNotFound) {
      const now = (new Date()).getTime()
      db.run('INSERT INTO pages (slug, name, last_access, positions, layout) VALUES (\"default\", \"Default Home\", ?, \"[]\", 4)', now, (err) => {
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

db.getPageBySlug = function (slug, callback) {
  db.get('SELECT * FROM pages WHERE slug=? LIMIT 1', slug, (err, pageRow) => {
    if (err || !pageRow) {
      return callback(err, null, null)
    }
    const now = (new Date()).getTime()
    db.run('UPDATE pages SET last_access=? WHERE slug=?', now, slug, (err) => {
      return callback(err, pageRow)
    })
  })
}

db.updatePageBySlug = function (slug, payload, callback) {
  db.get('SELECT * FROM pages WHERE slug=? LIMIT 1', slug, (err, pageRow) => {
    if (err || !pageRow) {
      return callback(err, null, null)
    }

    const now = (new Date()).getTime()
    Object.assign(pageRow, payload, {now})
    db.run('UPDATE pages SET name=?, last_access=?, positions=?, layout=? WHERE slug=?', pageRow.name, pageRow.now, JSON.stringify(pageRow.positions), pageRow.layout, slug, (err) => {
      return callback(err, pageRow)
    })
  })
}

db.getComponentById = function (slug, id, callback) {
  db.get('SELECT * FROM pages WHERE slug=? LIMIT 1', slug, (err, pageRow) => {
    if (err || !pageRow) {
      return callback(err, null, null)
    }
    db.get('SELECT * FROM components WHERE id=? LIMIT 1', id, (err, componentRow) => {
      if (err || !componentRow) {
        return callback(err, pageRow, null)
      }
      return callback(err, pageRow, componentRow)
    })
  })
}

db.createComponent = function (slug, payload, callback) {
  db.get('SELECT * FROM pages WHERE slug=? LIMIT 1', slug, (err, pageRow) => {
    if (err || !pageRow) {
      return callback(err, null, null)
    }
    db.run('INSERT INTO components (id, type) VALUES (NULL, ?)', payload.type, function (err) {
      return callback(err, pageRow, Object.assign({id: this.lastID}, payload))
    })
  })
}

db.deleteComponent = function (id, callback) {
  db.run('DELETE FROM components WHERE id=?', id, function (err) {
    return callback(err)
  })
}

db.updateComponent = function (slug, id, payload, callback) {
  db.get('SELECT * FROM pages WHERE slug=? LIMIT 1', slug, (err, pageRow) => {
    if (err || !pageRow) {
      return callback(err, null, null)
    }
    db.get('SELECT * FROM components WHERE id=? LIMIT 1', id, (err, componentRow) => {
      if (err || !componentRow) {
        return callback(err, pageRow, null)
      }

      Object.assign(componentRow, payload)
      db.run('UPDATE components SET type=? WHERE id=?', componentRow.type, id, (err) => {
        return callback(err, pageRow, componentRow)
      })
    })
  })
}

// exports
export default db

