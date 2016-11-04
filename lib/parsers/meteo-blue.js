'use strict'

import trumpet from 'trumpet'
import { trumpetInnerText, trumpetClasses } from 'myfox-wrapper-api/dist/html-parsers'

// TODO !6: deplacer dans le component approprié ?
export default function () {
  const meteoParser = trumpet()
  meteoParser.data = { daily: [], hourly: [] }
  let currentDaily = {}

  // To retrieve day by day general weather
  meteoParser.selectAll('li.tab.count-7 > div.day > div.tab-day-short', trumpetInnerText((dayName) => {
    currentDaily.day = dayName
  }))
  meteoParser.selectAll('li.tab.count-7 > div.weather > div.pictoicon > div', trumpetClasses((classes) => {
    currentDaily.classes = classes
  }))
  meteoParser.selectAll('li.tab.count-7 > div.tab-temp > div.tab-temp-max', trumpetInnerText((max) => {
    currentDaily.max = max
  }))
  meteoParser.selectAll('li.tab.count-7 > div.tab-temp > div.tab-temp-min', trumpetInnerText((min) => {
    currentDaily.min = min
    meteoParser.data.daily.push(currentDaily)
    currentDaily = {}
  }))

  meteoParser.select('ul#hourly > li:nth-child(1) > table > tbody', trumpetInnerText((html) => {
    meteoParser.data.hourly.push(html)
  })) // To retrieve today's details
  meteoParser.select('ul#hourly > li:nth-child(2) > table > tbody', trumpetInnerText((html) => {
    meteoParser.data.hourly.push(html)
  })) // To retrieve tomorrow's details

  return meteoParser
}
