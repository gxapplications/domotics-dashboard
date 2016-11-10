'use strict'

import db from '../../../server/db'

export function fixPayload (data) {
  ['delay', 'reset_delay'].forEach((attributePath) => {
    data = db.typeFixer(data, attributePath, (n) => Number(n))
  })

  return data
}
