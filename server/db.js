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
  db.serialize(function() {
    db.run("CREATE TABLE Accounts (thing TEXT)");
  });
}

// exports
export default db
