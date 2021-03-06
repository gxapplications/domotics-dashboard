'use strict'

import config from 'config'
import Hapi from 'hapi'
import HapiQs from 'hapi-qs'
import Vision from 'vision'
import Handlebars from 'handlebars'
import ExtendBlock from 'handlebars-extend-block'
import Hoek from 'hoek'
import Inert from 'inert'
import fs from 'fs'
import Path from 'path'
import CryptoJS from 'crypto-js'
import Nes from 'nes'

import myfoxWrapperApi from 'myfox-wrapper-api'
import db from './db'
import context from '../lib/middlewares/context'

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
    path: './',
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
  server.route({
    method: 'GET',
    path: '/favicon.ico',
    handler: {
      file: Path.join(__dirname, '..', 'public', 'images', 'home.png')
    }
  })
})

// Query string and Payload parsing
server.register({
  register: HapiQs
}, (err) => {
  Hoek.assert(!err, err)
})

// Nes socket service and Context middleware
server.register(Nes, (err) => {
  Hoek.assert(!err, err)
  server.subscription('/socket/{id}')
})
server.register(context, (err) => {
  Hoek.assert(!err, err)
})

// Login page
server.route({
  method: 'GET',
  path: '/',
  handler: function (request, reply) {
    db.getPassword((err, row) => {
      const opened = (err || !row || !row.password)
      reply.view(Path.join('templates', 'login'), {'md-primary': 'teal', 'auto-open-password': opened})
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
          return reply(err.toString()).code(errNbr)
        }
        if (callback) {
          callback()
        }
        // Login successful, store /home result, then reply with new location.
        request.context.subscribeToApiEvents(api)
        request.context.updateManyStates(data)

        // initializeComponent listener calls
        db.getComponents((err, component) => {
          if (err) {
            return reply(err.toString()).code(500)
          }

          const actionListenersFile = Path.join(__dirname, '..', 'lib', 'components', `${component.type}`, 'action-listeners.js')
          if (fs.existsSync(actionListenersFile)) {
            const listener = require(actionListenersFile).initializeComponent
            if (listener !== undefined) {
              listener(component, api)
            }
          }
        })

        db.getLastAccessedPageSlug((err, slug) => {
          if (err) {
            return reply(err.toString()).code(500)
          }
          reply({rdt: `${server.info.protocol}://${request.info.host}/${slug}`})
        }, true)
      }
    }

    if (pattern && password) {
      // Save the new password encrypted with pattern, once tested on Myfox service.
      api = myfoxWrapperApi(options, {'username': config.get('server.myfox.username'), 'password': password})
      api.callHome(afterHomeCalled(403, encryptPassword))
    } else if (pattern) {
      // Decrypt password from pattern, and use it to login.
      db.getPassword((err, row) => {
        if (err) {
          return reply(err.toString()).code(401)
        }

        try {
          let cryptedPassword = row.password
          if (!cryptedPassword) {
            return reply({}).code(404)
          }
          let passwordBytes = CryptoJS.AES.decrypt(cryptedPassword, 'azerty' + pattern)
          password = passwordBytes.toString(CryptoJS.enc.Utf8)
          if (!password) {
            return reply({}).code(401)
          }
        } catch (err) {
          return reply(err.toString()).code(401)
        }

        // instantiate with credentials, stateful
        api = myfoxWrapperApi(options, {'username': config.get('server.myfox.username'), 'password': password})
        // Call home once, this will schedule automated reloadings
        api.callHome(afterHomeCalled(401))
      })
    } else {
      return reply({}).code(412) // Malformed request: stops here
    }
  }
})

// Other pages: named pages
server.route({
  method: 'GET',
  path: '/{slug}',
  handler: function (request, reply) {
    if (!request.context.api) {
      return reply.redirect('/') // User is not connected yet!
    }

    db.getPageBySlug(request.params.slug, (err, page) => {
      Hoek.assert(!err, err)
      if (!page) {
        return reply.redirect('/')
      }
      reply.view(Path.join('templates', 'page'), {'page': page, 'md-primary': 'teal', 'states': request.context.states})
    })
  }
})
server.route({
  method: 'PATCH',
  path: '/{slug}',
  handler: function (request, reply) {
    if (!request.context.api) {
      return reply.redirect('/') // User is not connected yet!
    }

    db.updatePageBySlug(request.params.slug, request.payload, (err, page) => {
      Hoek.assert(!err, err)
      if (!page) {
        return reply.redirect('/')
      }
      reply(page)
    })
  }
})

// Components
server.route({
  method: 'POST',
  path: '/{slug}/component',
  handler: function (request, reply) {
    if (!request.context.api) {
      return reply({}).code(403) // User is not connected yet!
    }

    // Retrieve case (not a GET because we need complex data in the payload)
    if (request.payload.id) {
      db.getComponentById(request.params.slug, request.payload.id, (err, page, component) => {
        Hoek.assert(!err, err)
        if (!page || !component) {
          return reply({}).code(404)
        }
        return reply.view(Path.join('components', `${component.type}`, 'template'), {
          'page': page,
          'component': component
        }, {'layout': 'component'})
      })
    } else {
      // Creation case
      db.createComponent(request.params.slug, request.payload, (err, page, component) => {
        Hoek.assert(!err, err)
        if (!page) {
          return reply({}).code(404)
        }
        if (!component) {
          return reply({}).code(500)
        }
        return reply(component.id)
      })
    }
  }
})
server.route({
  method: 'PATCH',
  path: '/{slug}/component/{id}',
  handler: function (request, reply) {
    if (!request.context.api) {
      return reply({}).code(403) // User is not connected yet!
    }

    db.updateComponent(request.params.slug, request.params.id, request.payload, (err, page, component) => {
      Hoek.assert(!err, err)
      if (!page || !component) {
        return reply({}).code(404)
      }
      return reply.view(Path.join('components', `${component.type}`, 'template'), {
        'page': page,
        'component': component
      }, {'layout': 'component'})
    })
  }
})
server.route({
  method: 'DELETE',
  path: '/{slug}/component/{id}',
  handler: function (request, reply) {
    if (!request.context.api) {
      return reply.redirect('/') // User is not connected yet!
    }

    db.getComponentById(request.params.slug, request.params.id, (err, page, component) => {
      Hoek.assert(!err, err)
      if (!page) {
        return reply({}).code(404)
      }

      db.deleteComponent(request.params.id, (err) => {
        Hoek.assert(!err, err)

        // removeComponent listener call
        if (component) {
          const actionListenersFile = Path.join(__dirname, '..', 'lib', 'components', `${component.type}`, 'action-listeners.js')
          if (fs.existsSync(actionListenersFile)) {
            const listener = require(actionListenersFile).removeComponent
            if (listener !== undefined) {
              listener(component.id, api)
            }
          }
        }

        return reply({status: 'ok'})
      })
    })
  }
})

// Actions
server.route({
  method: 'POST',
  path: '/{slug}/component/{id}/action/{action?}',
  handler: function (request, reply) {
    if (!request.context.api) {
      return reply({}).code(403) // User is not connected yet!
    }

    // Retrieve component
    db.getComponentById(request.params.slug, request.params.id, (err, page, component) => {
      Hoek.assert(!err, err)
      if (!page || !component) {
        return reply({}).code(404)
      }

      // Call actions switch. Stateless required files
      const actionsFile = Path.join(__dirname, '..', 'lib', 'components', `${component.type}`, 'actions')
      const actionsToCall = require(actionsFile).default
      return actionsToCall(api, reply, page, component, request.params.action, request.payload || {})
    })
  }
})

// exports
export default server
