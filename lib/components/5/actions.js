'use strict'

import db from '../../server/db'
import CryptoJS from 'crypto-js'

const actions = function (api, reply, page, component, action = null, payload = {}) {
  let firstAction = null
  let password
  if (payload.pattern) {
    // Decrypt password from pattern, and use it to login.
    try {
      db.getPassword((err, row) => {
        if (err) {
          return reply(err.toString()).code(401)
        }

        try {
          let cryptedPassword = row.password
          if (!cryptedPassword) {
            return reply({}).code(401)
          }
          let passwordBytes = CryptoJS.AES.decrypt(cryptedPassword, 'azerty' + payload.pattern)
          password = passwordBytes.toString(CryptoJS.enc.Utf8)
          if (!password) {
            return reply({}).code(401)
          }
        } catch (err) {
          return reply(err.toString()).code(401)
        }

        firstAction = {
          action: action,
          password: password
        }
        api.callAlarmLevelAction(firstAction, (err, data) => {
          if (err) {
            console.log(err)
            reply(err).code(500)
          }
          reply(data)
        })
      })
    } catch (err) {
      return reply(err.toString()).code(401)
    }
  } else {
    firstAction = {
      action: action
    }
    api.callAlarmLevelAction(firstAction, (err, data) => {
      if (err) {
        console.log(err)
        return reply(err).code(500)
      }
      reply(data)
    })
  }
}

// exports
export default actions
