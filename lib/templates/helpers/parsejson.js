'use strict'

import Handlebars from 'handlebars'

const resolve = function(path, obj) {
    return path.split('.').reduce(function(prev, curr) {
        return prev ? prev[curr] : ''
    }, obj || self)
}

module.exports = function (o, path) {
  return new Handlebars.SafeString(resolve(path, (typeof o === 'string') ? JSON.parse(o) : o))
}
