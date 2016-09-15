'use strict'

import http from 'http'
import https from 'https'
import urlParser from 'url'
import zlib from 'zlib'
import ratpRer from '../lib/parsers/ratp-rer'
import meteoBlue from '../lib/parsers/meteo-blue'

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

const actions = function (api, reply, page, component, action = null, payload = {}) {
  const configuration = JSON.parse(component.configuration)

  switch (component.type) {
    case 501:
      // 501: RATP RER timetable parser
      if (!configuration.url) {
        reply('URL not configured for component ' + component.id + '.').code(400)
        return
      }

      httpParse(configuration.url, ratpRer(), (err, parser) => {
        if (err) {
          console.log(err)
          reply(err).code(500)
        }
        reply(parser.data)
      })
      break

    case 511:
      // 511: Meteo Blue parser
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
      break

    default:
      // Action not (yet) supported
      reply({}).code(418)
  }
}

// exports
export default actions
