/* global $, angular, alert */
'use strict'

import _ from 'lodash'
import screenfull from 'screenfull'
import {dialogController as resizerController, dialogTemplate as resizerTemplate} from './resizer-dialog'
import states from './states'
import icons from './icons'
import Events from './events'
import plugSpeech from './speech'

window.app.controller('PageControls', function ($rootScope, $scope, $document, $http, $window, $mdToast, $mdDialog) {
  $rootScope.events = new Events($mdToast)
  $scope.events = $rootScope.events
  $rootScope.cleaners = {}

  // States
  $rootScope.states = states
  $scope.states = $rootScope.states
  $scope.$watch('states.socketClient.errorCount', (newValue, oldValue) => {
    if (newValue >= 6) {
      $scope.events.errorEvent('Web socket connection error!', 'RECONNECT', $scope.states.socketClient.reconnectNow)
    }
  })

  // Page entity
  $scope.page = window.initPage
  $scope.$watch('page.layout', () => {
    if ($scope.grid.gridStack !== null) { // cancel effect at init
      $scope.grid.gridStack.setLanes($scope.page.layout)
    }
  })

  // Edition mode
  $rootScope.edition = {
    active: false,
    close: () => {
      $rootScope.edition.active = false
      window.setTimeout($scope.edition.tools.addAutoRescaler.trigger, 1100)

      // Saving page data
      $.ajax({
        url: window.gridPageUpdaterUrl,
        method: 'PATCH',
        data: {
          positions: $scope.grid.positions,
          layout: $scope.grid.layout,
          name: $scope.page.name
        }
      }).done((updatedPage) => {
        if ($scope.page.slug !== updatedPage.slug) {
          $scope.events.warningEvent('Changes saved! Needs redirection...')
          window.location = '/' + updatedPage.slug
        } else {
          $scope.events.successEvent('Changes saved!')
        }
      }).fail(() => {
        $scope.events.errorEvent('Changes NOT saved!')
      })
    },
    open: () => {
      $rootScope.edition.active = true
      window.setTimeout($scope.edition.tools.addAutoRescaler.trigger, 900)
    },
    addComponent: (type, width, height) => {
      let position = $scope.grid.gridStack.findFreeSpaceXY(width, height)
      $.post(window.gridComponentLoaderUrl, {
        'type': type,
        'position': position,
        'dimensions': {'w': width, 'h': height}
      }).done(function (data) {
        $scope.grid.positions.push({ 'id': data, 'w': width, 'h': height, 'x': position['x'], 'y': position['y'] })
        $($scope.grid.init()) // reinit gridStack

        $.ajax({
          url: window.gridPageUpdaterUrl,
          method: 'PATCH',
          data: {
            positions: $scope.grid.positions
          }
        }).done(() => {
          $scope.events.successEvent('New position saved!')
        }).fail(() => {
          $scope.events.errorEvent('Positions NOT saved!')
        })
      }).fail(function () {
        $scope.events.errorEvent('Component NOT added!')
      })
    },
    removeComponent: (id) => {
      // remove component from matrix
      $scope.grid.positions = $scope.grid.positions.filter((item) => {
        // eslint-disable-next-line eqeqeq
        return (item.id != id) // !!! no "===" here !!!
      })

      // update DB (remove component and update page)
      $.ajax({
        url: window.gridComponentLoaderUrl + '/' + id,
        method: 'DELETE',
        data: {
          id: id
        }
      }).done(function (data) {
        // Run cleaners before to remove controllers
        for (let cleaners in $rootScope.cleaners) {
          if (Array.isArray(cleaners)) {
            cleaners.forEach((cleaner) => {
              cleaner()
            })
          }
        }
        // This removes the controller from the DOM, but not on Angular app side
        $($scope.grid.init()) // reinit gridStack

        $.ajax({
          url: window.gridPageUpdaterUrl,
          method: 'PATCH',
          data: {
            positions: $scope.grid.positions
          }
        }).done(() => {
          $scope.events.successEvent('Component removed!')
        }).fail(() => {
          $scope.events.errorEvent('Positions NOT saved!')
        })
      }).fail(() => {
        $scope.events.errorEvent('Error removing component!')
      })
    },
    removeBroken: (button) => {
      const id = $(button).closest('li').data('id')

      // remove component from matrix
      $scope.grid.positions = $scope.grid.positions.filter((item) => {
        // eslint-disable-next-line eqeqeq
        return (item.id != id) // !!! no "===" here !!!
      })

      // update DB (remove component and update page)
      $.ajax({
        url: window.gridComponentLoaderUrl + '/' + id,
        method: 'DELETE',
        data: {
          id: id
        }
      }).done(function (data) {
        // This removes the controller from the DOM, but not on Angular app side
        $($scope.grid.init()) // reinit gridStack

        $.ajax({
          url: window.gridPageUpdaterUrl,
          method: 'PATCH',
          data: {
            positions: $scope.grid.positions
          }
        }).done(() => {
          $scope.events.successEvent('Component removed!')
        }).fail(() => {
          $scope.events.errorEvent('Positions NOT saved!')
        })
      }).fail(() => { /* Do nothing, most of the cases will get 404, because removeBroken is used when GET gives 404 */ })
    },
    resizeComponentDialog: (id, event) => {
      // eslint-disable-next-line eqeqeq
      const component = $scope.grid.positions.find((c) => { return c.id == id }) // !!! no "===" here !!!
      $mdDialog.show({
        controller: resizerController,
        template: resizerTemplate(component),
        parent: angular.element(document.body),
        targetEvent: event,
        clickOutsideToClose: true
      }).then((result) => {
        $scope.grid.gridStack.resizeItem($(`#grid li[data-id="${id}"]`), result.w, result.h)
      })
    },
    refreshComponent: (id) => {
      const componentCard = $(`li.position-card[data-id="${id}"] > .inner`, $scope.grid.gridStack).first()
      $.ajax({
        url: window.gridComponentLoaderUrl,
        method: 'POST',
        data: {
          id: id
        }
      }).done((data) => {
        // Run cleaners before to remove controller
        const cleaners = $rootScope.cleaners['CardCtrl-' + id] || []
        if (Array.isArray(cleaners)) {
          cleaners.forEach((cleaner) => { cleaner() })
        }
        // This removes the controller from the DOM, but not on Angular app side
        componentCard.html(data)
        $scope.grid.gridStack.compileAngularElement(componentCard)
      }).fail(() => {
        $scope.events.errorEvent('Component NOT refreshed!')
      })
    },
    tools: {
      assignDeep: require('assign-deep'),
      icons: Object.keys(icons),
      addAutoRescaler: (listener) => {
        $scope.edition.tools.addAutoRescaler.listeners.push(listener)
      },
      crypto: require('crypto-js'),
      debounce: function (func, wait, immediate) {
        var timeout
        return function () {
          var context = this
          var args = arguments
          var later = function () {
            timeout = null
            if (!immediate) func.apply(context, args)
          }
          var callNow = immediate && !timeout
          clearTimeout(timeout)
          timeout = setTimeout(later, wait)
          if (callNow) {
            func.apply(context, args)
          }
        }
      }
    }
  }
  { // tools setup
    const tools = $scope.edition.tools
    tools.addAutoRescaler.listeners = []
    tools.addAutoRescaler.triggerNow = function () {
      tools.addAutoRescaler.listeners = tools.addAutoRescaler.listeners.filter((listener) => {
        try {
          return listener()
        } catch (e) {
          return false
        }
      })
    }
    tools.addAutoRescaler.trigger = tools.debounce(tools.addAutoRescaler.triggerNow, 300)
  }
  $scope.edition = $rootScope.edition

  // Grid object
  $scope.grid = {
    positions: _.uniqWith(window.initGridPositions, (a, b) => { return a.id === b.id }), // unicity filtering
    loaderUrl: window.gridComponentLoaderUrl,
    onLayoutChange: () => {
      if ($scope.grid.gridStack !== null) {
        $scope.grid.gridStack.setLanes($scope.page.layout)
        // $scope.edition.tools.addAutoRescaler.trigger()
      }
    },
    gridStack: null,
    init: function () {
      $scope.grid.gridStack = $('#grid').gridStack({
        matrix: $scope.grid.positions,
        onChange: (changedItems, mx) => {
          $.ajax({
            url: window.gridPageUpdaterUrl,
            method: 'PATCH',
            data: {
              positions: mx,
              layout: $scope.page.layout
            }
          }).done(() => {
            $scope.grid.positions = mx
            $scope.events.successEvent('Positions saved!')
            // $scope.edition.tools.addAutoRescaler.trigger()
          }).fail(() => {
            $scope.events.errorEvent('Positions NOT saved!')
          })
        },
        lanes: $scope.page.layout,
        elementPrototype: 'li.position-card',
        elementLoaderUrl: $scope.grid.loaderUrl,
        draggableParams: {
          handle: '.handle',
          helper: 'original'
        },
        getSizingCoefficient: () => {
          return $scope.edition.active ? (1 / 0.84) : 1
        },
        minHeight: 100
      })
    }
  }
  $scope.edition.tools.addAutoRescaler(function () {
    $scope.grid.gridStack.gridList('reflow')
    return true
  })

  // Speech service
  plugSpeech($rootScope)

  // Fullscreen service
  $scope.fullscreen = {
    state: () => { return screenfull.isFullscreen },
    available: () => { return screenfull.enabled },
    switchState: function (newState) {
      if (newState) {
        screenfull.request()
      } else {
        screenfull.exit()
      }
    }
  }

  // Init
  $document.ready(() => {
    $($scope.grid.init())
    $scope.states.init()
    window.setTimeout($scope.edition.tools.addAutoRescaler.trigger, 600)
    window.setTimeout($scope.edition.tools.addAutoRescaler.trigger, 2000)
    window.setTimeout($scope.edition.tools.addAutoRescaler.trigger, 15000)
    $(window).resize($scope.edition.tools.addAutoRescaler.trigger)
    $rootScope.speech.init('fr-FR') // TODO !3: language depending on the user or a spoken keyword ?

    // TODO !0: Tests, to ensure, then to remove
    window.addEventListener('online', (event) => { alert('online event!') })
    window.addEventListener('devicelight', (event) => { alert('devicelight event!') })
    window.addEventListener('userproximity', (event) => { alert('userproximity event!') })
  })
})
