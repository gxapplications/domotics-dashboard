/* global $, angular */
'use strict'

import _ from 'lodash'
import {dialogController as resizerController, dialogTemplate as resizerTemplate} from './resizer-dialog'
import states from './states'
import icons from './icons'
import Events from './events'

window.app.controller('PageControls', function ($rootScope, $scope, $document, $http, $window, $mdToast, $mdDialog) {
  $rootScope.events = new Events($mdToast)
  $scope.events = $rootScope.events
  $rootScope.cleaners = {}

  // States
  $rootScope.states = states
  $scope.states = $rootScope.states
  $scope.$watch('states.socketClient.errorCount', (newValue, oldValue) => {
    if (newValue >= 4) {
      $scope.events.errorEvent('Web socket connection error!')
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
      }
    }
  }
  $scope.edition.tools.addAutoRescaler.listeners = []
  $scope.edition.tools.addAutoRescaler.trigger = function () {
    $scope.edition.tools.addAutoRescaler.listeners = $scope.edition.tools.addAutoRescaler.listeners.filter((listener) => {
      try {
        return listener()
      } catch (e) {
        return false
      }
    })
  }
  $scope.edition = $rootScope.edition

  // Grid object
  $scope.grid = {
    positions: _.uniqWith(window.initGridPositions, (a, b) => { return a.id === b.id }), // unicity filtering
    loaderUrl: window.gridComponentLoaderUrl,
    onLayoutChange: () => {
      if ($scope.grid.gridStack !== null) {
        $scope.grid.gridStack.setLanes($scope.page.layout)
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
        }
      })
    }
  }
  $scope.edition.tools.addAutoRescaler(function () {
    $scope.grid.gridStack.gridList('reflow')
    return true
  })

  // Init
  $document.ready(() => {
    $($scope.grid.init())
    $scope.states.init()
    window.setTimeout($scope.edition.tools.addAutoRescaler.trigger, 600)
    window.setTimeout($scope.edition.tools.addAutoRescaler.trigger, 900) // TODO !0 tester la valeur de cela...
  })
})
