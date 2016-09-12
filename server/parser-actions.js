'use strict'

import http from 'http'
import https from 'https'
import urlParser from 'url'
import zlib from 'zlib'
import trumpet from 'trumpet'
import { trumpetInnerText } from 'myfox-wrapper-api/dist/html-parsers'

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
      const rerParser = trumpet()
      rerParser.rerLines = []
      rerParser.rerMessages = []
      rerParser.rerRefresh = '' // FIXME !0: default to now() -> format '12h34' !
      rerParser.selectAll('div#prochains_passages > fieldset > table > tbody > tr > td.name > a', trumpetInnerText((name) => {
        rerParser.rerLines.push({name: name})
      })) // To retrieve train name
      rerParser.selectAll('div#prochains_passages > fieldset > table > tbody > tr > td.terminus', trumpetInnerText((terminus) => {
        rerParser.rerLines[rerParser.rerLines.length -1].terminus = terminus
      })) // To retrieve train terminus
      rerParser.selectAll('div#prochains_passages > fieldset > table > tbody > tr > td.passing_time', trumpetInnerText((time) => {
        rerParser.rerLines[rerParser.rerLines.length -1].time = time
      })) // To retrieve train time
      rerParser.selectAll('div#prochains_passages > fieldset > div.message', trumpetInnerText((message) => {
        rerParser.rerMessages.push(message)
      })) // To retrieve error messages
      rerParser.select('div#prochains_passages > fieldset > div.date_time > span.time', trumpetInnerText((time) => {
        rerParser.rerRefresh = time
      })) // To retrieve error messages
      rerParser.selectAll('span.copyright', () => {
        rerParser.data = {lines: rerParser.rerLines, messages: rerParser.rerMessages, refresh: rerParser.rerRefresh}
        rerParser.end()
      })

      // FIXME !0: si pas configuré, pas .url ! retour propre a faire !
      httpParse(configuration.url, rerParser, (err, parser) => {
        if (err) {
          console.log(err)
          reply(err).code(500)
        }
        reply(parser.data)
      })
      break

    case 511:
      // 511: Meteo Blue parser
      // TODO !5
      break

    default:
      // Action not (yet) supported
      reply({}).code(418)
  }
}

// exports
export default actions
