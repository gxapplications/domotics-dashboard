'use strict'

import config from 'config'
import Hapi from 'hapi'
import Vision from 'vision'
import Handlebars from 'handlebars'
import ExtendBlock from 'handlebars-extend-block'
import Hoek from 'hoek'
import Inert from 'inert'
import Path from 'path'
import CryptoJS from 'crypto-js'

import myfoxWrapperApi from 'myfox-wrapper-api'
import db from './db'

// Stateful instance
let api = null

const server = new Hapi.Server()
server.connection({
  port: config.get('server.port')
})

// Templating engine
server.register(Vision, (err) => {
  Hoek.assert(!err, err)
  server.views({
    engines: { html: ExtendBlock(Handlebars) },
    relativeTo: Path.join(__dirname, '..', 'lib'),
    path: './templates',
    layout: true,
    layoutPath: './templates/layout',
    helpersPath: './templates/helpers',
    isCached: (process.env.NODE_ENV === 'production')
  })
})

// Assets engine
server.register(Inert, (err) => {
  Hoek.assert(!err, err)
  server.route({
    method: 'GET',
    path: '/assets/module/{param*}',
    handler: {
      directory: {
        path: Path.join(__dirname, '..', 'node_modules')
      }
    }
  })
  server.route({
    method: 'GET',
    path: '/assets/{param*}',
    handler: {
      directory: {
        path: Path.join(__dirname, '..', 'public')
      }
    }
  })
})

// Login page
server.route({
  method: 'GET',
  path: '/',
  handler: function (request, reply) {
    db.getPassword((err, row) => {
      const opened = (err || !row || !row.password)
      reply.view('login', {'md-primary': 'teal', 'auto-open-password': opened})
    })
  }
})
server.route({
  method: 'POST',
  path: '/',
  handler: function (request, reply) {
    // Error codes to send:
    // 401: pattern is given to decrypt password from DB but seems to be wrong.
    // 403: password rejected by myfox.
    // 404: password not stored server side. Must post password & pattern to save.
    // 412: password and pattern must be filled.

    const pattern = request.payload.pattern || null
    let password = request.payload.password || null
    const options = {'apiStrategy': 'htmlOnly', 'myfoxSiteIds': config.get('server.myfox.myfoxSiteIds')}

    const encryptPassword = () => {
      let cryptedPassword = CryptoJS.AES.encrypt(password, 'azerty' + pattern).toString()
      db.storePassword(cryptedPassword)
    }
    const afterHomeCalled = (errNbr, callback = null) => {
      return (err, data) => {
        if (err) {
          return reply(err).code(errNbr) //FIXME !1: can also be another error (parsing of /home ? ...)
        }
        if (callback) {
          callback()
        }
        // Login successful, store /home result, then reply with new location.
        // TODO !0: store /home data, maybe elsewhere!
        // TODO !2: send location URL with default page to see
      }
    }

    if (pattern && password) {
      // Save the new password encrypted with pattern, once tested on Myfox service.
      api = myfoxWrapperApi(options, {'username': config.get('server.myfox.username'), 'password': password})
      api.callHome(afterHomeCalled(403, encryptPassword))
    } else if (pattern) {
      // Decrypt password from pattern, and use it to login.
      try {
        db.getPassword((err, row) => {
          if (err) {
            throw err
          }
          let cryptedPassword = row.password
          if (!cryptedPassword) {
            return reply({}).code(404)
          }
          let passwordBytes  = CryptoJS.AES.decrypt(cryptedPassword, 'azerty' + pattern)
          password = passwordBytes.toString(CryptoJS.enc.Utf8)
          if (!password) {
            return reply(err).code(401)
          }
          api = myfoxWrapperApi(options, {'username': config.get('server.myfox.username'), 'password': password})
          api.callHome(afterHomeCalled(401))
        })
      } catch (err) {
        return reply(err).code(401)
      }
    } else {
      return reply({}).code(412) // Malformed request: stops here
    }
  }
})

// Other pages: named pages
server.route({
    method: 'GET',
    path: '/{path*}',
    handler: function (request, reply) {
        reply.view('page', { path: path })
    }
})

// exports
export default server
