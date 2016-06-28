'use strict'

import config from 'config'
import Hapi from 'hapi'
import Vision from 'vision'
import Handlebars from 'handlebars'
import ExtendBlock from 'handlebars-extend-block'
import Hoek from 'hoek'
import Inert from 'inert'
import Path from 'path'

import myfoxWrapperApi from 'myfox-wrapper-api'
import db from './db'

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
    reply.view('login', {'md-primary': 'teal', 'auto-open-password': true}) // TODO: si aucun password en DB, alors true... sinon false
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
        const password = request.payload.password || null

        if (pattern && password) {
            // Save the new password encrypted with pattern, and use it to login.

            // TODO : appeler myfox sur /home (error 403 si fail, sans mémo des password et pattern). Si OK alors mémo password crypté par le pattern en DB. Pas de return! on continue plus loin
        } else if (pattern) {
            // Decrypt password from pattern, and use it to login.

            // TODO : decrypter password avec pattern (error 401 si mauvais pattern, ou 404 si pas de donnee cryptee en db), appeler myfox sur /home (error 403 si fail). Pas de return! on continue plus loin
        } else {
            return reply({}).code(412) // Malformed request: stops here
        }

        // Login successful, store /home result, then reply with new location.
        // TODO : apres success du login, alors mémo info du /home en session, puis retour avec 'location' pour indiquer vers quelle url reloader.
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



// let api = myfoxWrapperApi({'apiStrategy': 'htmlOnly', 'myfoxSiteIds': [4567]})

// exports
export default server
