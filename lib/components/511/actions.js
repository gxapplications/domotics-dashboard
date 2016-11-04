'use strict'

import http from 'http'
import https from 'https'
import urlParser from 'url'
import zlib from 'zlib'
import meteoBlue from '../../parsers/meteo-blue'

const httpParse = function (url, parser, callback) {
  const requestData = urlParser.parse(url)
  const protocol = (requestData.protocol === 'http:') ? http : https

  const req = protocol.request({method: 'GET', ...requestData}, (res) => {
    if (res.statusCode !== 200) {
      const error = new Error('Error status code returned by distant parsed web site.')
      error.status = res.statusCode
      return callback(error)
    }

    let unzippedRes
    let encoding = res.headers['content-encoding']
    if (encoding === 'gzip') {
      unzippedRes = res.pipe(zlib.createGunzip())
    } else if (encoding === 'deflate') {
      unzippedRes = res.pipe(zlib.createInflate())
    } else {
      unzippedRes = res
    }

    unzippedRes.pipe(parser)
    parser.on('end', () => {
      callback(null, parser)
    })
  })

  parser.on('error', callback)
  req.on('error', callback)
  req.end()
}

const actions = function (api, reply, page, component) {
  const configuration = JSON.parse(component.configuration)

  if (!configuration.url) {
    reply('URL not configured for component ' + component.id + '.').code(400)
    return
  }

  httpParse(configuration.url, meteoBlue(), (err, parser) => {
    if (err) {
      console.log(err)
      reply(err).code(500)
    }
    reply(parser.data)
  })
}

// exports
export default actions
