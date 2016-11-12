'use strict'

import Planer from './planer'

export function initializeComponent (component, api) {
  const planer = JSON.parse(component.configuration).planer || []
  if (planer.length === 0) {
    return // component not configured.
  }

  api.component6Planers = api.component6Planers || []

  // planer is self launched at construction.
  api.component6Planers.push(new Planer(component.id, planer, api))
}

export function removeComponent (id, api) {
  api.component6Planers = api.component6Planers || []
  api.component6Planers.filter((planer) => { return planer.id === id }).forEach((planer) => {
    planer.remove()
  })
  api.component6Planers = api.component6Planers.filter((planer) => { return planer.id !== id })
}
