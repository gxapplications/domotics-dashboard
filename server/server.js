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
        console.log(request.payload)
        // 401: pattern seul, mais mauvaise decryption : pattern faux
        // 403: password rejected by myfox
        // 404: password non sauve cote serveur, doit en poster un nouveau
        // 412: password and pattern must be filled
        reply({}).code(401)
        // TODO: recup du pattern, ou password + pattern
        // SI password + pattern: appeler myfox, /home, si KO, rejet sans mémo des password et pattern. Si OK alors mémo password crypté par le pattern en DB, et info du /home en session.
        // SI pattern: decrypter password avec pattern, appeler myfox, /home, si KO, rejet. Si OK alors mémo info du /home en session.
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
