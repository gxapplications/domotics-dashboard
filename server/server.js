'use strict'

import config from 'config'
import Hapi from 'hapi'

import myfoxWrapperApi from 'myfox-wrapper-api'

const server = new Hapi.Server()
server.connection({ port: config.get('server.port') })

server.route({
    method: 'GET',
    path: '/',
    handler: function (request, reply) {
        reply('Hello, world!')
    }
})



let api = myfoxWrapperApi({'apiStrategy': 'htmlOnly', 'myfoxSiteIds': [4567]})

// exports
export default server
