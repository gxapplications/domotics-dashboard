'use strict'

export function fixPayload (data) {
  // TODO !2: faire cette fonction,
  // A faire vers number: component. 'temp_min_min', 'temp_min_value', 'temp_max_max', 'temp_max_value'
  /* A faire vers boolean: component. 'scenarii.min_temp_control_{1,4}.controls.trigger_4.checked',
   'scenarii.max_temp_control_{1,4}.controls.trigger_4.checked',
   'scenarii.min_temp_control_{1,4}.controls.condition_4_1.checked',
   'scenarii.max_temp_control_{1,4}.controls.condition_4_1.checked',
   'scenarii.min_temp_control_{1,4}.controls.condition_4_2.checked',
   'scenarii.max_temp_control_{1,4}.controls.condition_4_2.checked' */

  if (data.planer && data.planer.length > 0) {
    data.planer = data.planer.map(Number)
  }
  // TODO !3: pareil pour tous les component types !
  // Dans chaque cas, ne rechercher que le strict necessaire, et faire efficace !
}
