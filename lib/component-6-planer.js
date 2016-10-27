'use strict'

class Planer {
  constructor (id, data, api) {
    this.id = id
    this.data = data
    this.api = api

    this.init()
  }

  init () {
    console.log(`Heating dashboard planer - Scheduler adding for #${this.id}...`)

    console.log(this.id, this.data, 'init, action to do...')
    // TODO !1: piloter les heures creuses...

    console.log(`Heating dashboard planer - Scheduler #${this.id} initialized.`)
  }

  updateData (newData) {
    this.data = newData
    console.log(`Heating dashboard planer - Scheduler #${this.id} data updated.`)

    // TODO !1: piloter les heures creuses...
    console.log('Updated, action to do...')
  }
}

export default Planer
