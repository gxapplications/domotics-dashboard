'use strict'

import Handlebars from 'handlebars'

const resolve = function (path, obj, defaultValue) {
  if (typeof defaultValue !== 'string') {
    defaultValue = ''
  }
  return path.split('.').reduce(function (prev, curr) {
    return prev ? prev[curr] : defaultValue
  }, obj || false)
}

module.exports = function (o, path, defaultValue) {
  return new Handlebars.SafeString(resolve(path, (typeof o === 'string') ? JSON.parse(o) : o, defaultValue))
}
