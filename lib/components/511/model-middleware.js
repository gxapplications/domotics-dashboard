'use strict'

export function fixPayload (data) {
  data.refresh = Number(data.refresh)

  return data
}
