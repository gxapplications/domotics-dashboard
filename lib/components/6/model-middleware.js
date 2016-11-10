'use strict'

import db from '../../../server/db'

export function fixPayload (data) {
  ['temp_min_min', 'temp_min_value', 'temp_max_max', 'temp_max_value'].forEach((attributePath) => {
    data = db.typeFixer(data, attributePath, (n) => Number(n))
  })
  const boolPaths = [
    'scenarii.min_temp_control_{1,4}.controls.trigger_4.checked',
    'scenarii.max_temp_control_{1,4}.controls.trigger_4.checked',
    'scenarii.min_temp_control_{1,4}.controls.condition_4_1.checked',
    'scenarii.max_temp_control_{1,4}.controls.condition_4_1.checked',
    'scenarii.min_temp_control_{1,4}.controls.condition_4_2.checked',
    'scenarii.max_temp_control_{1,4}.controls.condition_4_2.checked'
  ]
  boolPaths.forEach((attributePath) => {
    data = db.typeFixer(data, attributePath, (n) => (n === 'true' || n === true))
  })

  if (data.planer && data.planer.length > 0) {
    data.planer = data.planer.map(Number)
  }

  return data
}
