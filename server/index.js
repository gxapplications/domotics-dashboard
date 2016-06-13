'use strict'

import 'colors'

import server from './server'

server.start((err) => {
  if (err) {
    console.error('ERROR: Failed to start Hapi server.'.red)
    throw err
  }
  console.log('✓ Server listening at'.green, String(server.info.uri).cyan)
})
