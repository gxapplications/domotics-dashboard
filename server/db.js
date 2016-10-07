'use strict'

import Sqlite from 'sqlite3'
import fs from 'fs'
import Path from 'path'
import _ from 'lodash'
import slugify from 'slug'

const file = Path.join(__dirname, '..', 'var', 'data.db')
const exists = fs.existsSync(file)

const attributesToNumber = [
  '[*].delay', 'delay', 'reset_delay', 'refresh',
  'temp_min_min', 'temp_min_value', 'temp_max_max',
  'temp_max_value']
const attributesToBoolean = [
  'allow_none',
  'scenarii.min_temp_control_1.controls.trigger_4.checked',
  'scenarii.min_temp_control_2.controls.trigger_4.checked',
  'scenarii.min_temp_control_3.controls.trigger_4.checked',
  'scenarii.min_temp_control_4.controls.trigger_4.checked',
  'scenarii.max_temp_control_1.controls.trigger_4.checked',
  'scenarii.max_temp_control_2.controls.trigger_4.checked',
  'scenarii.max_temp_control_3.controls.trigger_4.checked',
  'scenarii.max_temp_control_4.controls.trigger_4.checked',
  'scenarii.min_temp_control_1.controls.condition_4_1.checked',
  'scenarii.min_temp_control_2.controls.condition_4_1.checked',
  'scenarii.min_temp_control_3.controls.condition_4_1.checked',
  'scenarii.min_temp_control_4.controls.condition_4_1.checked',
  'scenarii.max_temp_control_1.controls.condition_4_1.checked',
  'scenarii.max_temp_control_2.controls.condition_4_1.checked',
  'scenarii.max_temp_control_3.controls.condition_4_1.checked',
  'scenarii.max_temp_control_4.controls.condition_4_1.checked',
  'scenarii.min_temp_control_1.controls.condition_4_2.checked',
  'scenarii.min_temp_control_2.controls.condition_4_2.checked',
  'scenarii.min_temp_control_3.controls.condition_4_2.checked',
  'scenarii.min_temp_control_4.controls.condition_4_2.checked',
  'scenarii.max_temp_control_1.controls.condition_4_2.checked',
  'scenarii.max_temp_control_2.controls.condition_4_2.checked',
  'scenarii.max_temp_control_3.controls.condition_4_2.checked',
  'scenarii.max_temp_control_4.controls.condition_4_2.checked'] // FIXME !0: support of wildcards should be useful :)

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
    db.run('CREATE TABLE components (id INTEGER PRIMARY KEY, type INTEGER, configuration TEXT, extra_component TEXT)')
  })
}

// Tools
db.typeFixer = function (data, attributePath, transformer) {
  // Adding [*] wildcard support for arrays
  if (attributePath.match(/\[\*\]/)) {
    const matches = attributePath.match(/(^.*?\[\*\])(.*$)/)
    let idx = 0
    while (_.has(data, matches[1].replace('*', idx))) {
      data = db.typeFixer(data, matches[1].replace('*', idx) + matches[2], transformer)
      idx++
    }
  } else {
    if (_.has(data, attributePath)) {
      _.update(data, attributePath, transformer)
    }
  }
  return data
}
db.stringify = function (data, attributesToNumber = [], attributesToBoolean = []) {
  attributesToNumber.forEach((attributePath) => {
    data = db.typeFixer(data, attributePath, (n) => { return Number(n) })
  })
  attributesToBoolean.forEach((attributePath) => {
    data = db.typeFixer(data, attributePath, (n) => { return (n === 'true') })
  })
  return JSON.stringify(data)
}
db.findNewSlug = function (prefix, query, callback, suffix = 0) {
  db.get(query, prefix + (suffix || ''), (err, row) => {
    if (err) {
      return callback(err)
    }
    if (!row) {
      return callback(null, prefix + (suffix || ''))
    }
    return db.findNewSlug(prefix, query, callback, suffix + 1)
  })
}

// Accounts management
db.storePassword = function (password) {
  db.serialize(() => {
    db.run('DELETE from accounts')
    db.run('INSERT INTO accounts (password) VALUES (?)', password)
  })
}

db.getPassword = function (callback) {
  db.get('SELECT password FROM accounts LIMIT 1', callback)
}

// Pages
db.getLastAccessedPageSlug = function (callback, createIfNotFound = false) {
  db.get('SELECT slug FROM pages ORDER BY last_access DESC LIMIT 1', (err, row) => {
    if (err) {
      return callback(err)
    }
    if (!row && createIfNotFound) {
      const now = (new Date()).getTime()
      db.run('INSERT INTO pages (slug, name, last_access, positions, layout) VALUES (\"default\", \"Default Home\", ?, \"[]\", 4)',
        now, (err) => {
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
    let page = {slug: 'default', name: 'Default Home', positions: [], layout: 4}
    Object.assign(page, pageRow, payload, {now})

    // Compute new slug from page name, with unicity
    if (payload && payload.name && payload.name !== pageRow.name) {
      let newSlug = slugify(page.name)
      db.findNewSlug(newSlug, 'SELECT * FROM pages WHERE slug=? LIMIT 1', (err, suffixedSlug) => {
        if (err) {
          return callback(err, null)
        }

        db.run('UPDATE pages SET name=?, last_access=?, positions=?, layout=?, slug=? WHERE slug=?',
          page.name, page.now, JSON.stringify(page.positions), page.layout, suffixedSlug, slug, (err) => {
            page.slug = suffixedSlug
            return callback(err, page)
          })
      })
    } else {
      db.run('UPDATE pages SET name=?, last_access=?, positions=?, layout=? WHERE slug=?',
        page.name, page.now, JSON.stringify(page.positions), page.layout, slug, (err) => {
          return callback(err, page)
        })
    }
  })
}

// Components
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

    let component = {type: 1, configuration: {}, extra_component: {}}
    Object.assign(component, payload)
    db.run('INSERT INTO components (id, type, configuration, extra_component) VALUES (NULL, ?, ?, ?)',
      component.type,
      db.stringify(component.configuration,
          attributesToNumber,
          attributesToBoolean),
      db.stringify(component.extra_component), function (err) {
        return callback(err, pageRow, Object.assign({id: this.lastID}, component))
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

      let component = {type: 1, configuration: {}, extra_component: {}}
      Object.assign(component, componentRow, payload)
      db.run(
        'UPDATE components SET type=?, configuration=?, extra_component=? WHERE id=?',
        component.type,
        db.stringify(component.configuration,
            attributesToNumber,
            attributesToBoolean),
        db.stringify(component.extra_component),
        id,
        (err) => {
          return callback(err, pageRow, component)
        }
      )
    })
  })
}

// exports
export default db

