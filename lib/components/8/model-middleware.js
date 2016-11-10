'use strict'

export function fixPayload (data) {
  data.allow_none = (data.allow_none === 'true' || data.allow_none === true)

  return data
}
