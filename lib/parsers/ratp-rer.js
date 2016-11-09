'use strict'

import trumpet from 'trumpet'
import { trumpetInnerText } from 'myfox-wrapper-api/dist/html-parsers'

// TODO !3: deplacer dans le component approprié ?
export default function () {
  const rerParser = trumpet()
  rerParser.rerLines = []
  rerParser.rerMessages = []
  rerParser.rerRefresh = new Date()
  rerParser.rerRefresh = rerParser.rerRefresh.getHours() + 'h' + rerParser.rerRefresh.getMinutes()

  rerParser.selectAll('div#prochains_passages > fieldset > table > tbody > tr > td.name > a', trumpetInnerText((name) => {
    rerParser.rerLines.push({name: name})
  })) // To retrieve train name

  rerParser.selectAll('div#prochains_passages > fieldset > table > tbody > tr > td.terminus', trumpetInnerText((terminus) => {
    rerParser.rerLines[rerParser.rerLines.length - 1].terminus = terminus
  })) // To retrieve train terminus

  rerParser.selectAll('div#prochains_passages > fieldset > table > tbody > tr > td.passing_time', trumpetInnerText((time) => {
    rerParser.rerLines[rerParser.rerLines.length - 1].time = time
  })) // To retrieve train time

  rerParser.selectAll('div#prochains_passages > fieldset > div.message', trumpetInnerText((message) => {
    rerParser.rerMessages.push(message)
  })) // To retrieve error messages

  rerParser.select('div#prochains_passages > fieldset > div.date_time > span.time', trumpetInnerText((time) => {
    rerParser.rerRefresh = time
  })) // To retrieve refresh time

  rerParser.selectAll('span.copyright', () => {
    rerParser.data = {lines: rerParser.rerLines, messages: rerParser.rerMessages, refresh: rerParser.rerRefresh}
    rerParser.end()
  })

  return rerParser
}
