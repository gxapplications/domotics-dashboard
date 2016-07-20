'use strict'

import Handlebars from 'handlebars'

module.exports = function (object) {
  return new Handlebars.SafeString(JSON.stringify(object))
}
