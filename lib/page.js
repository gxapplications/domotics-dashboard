/* global $, angular */
'use strict'

import {dialogController as resizerController, dialogTemplate as resizerTemplate} from './resizer-dialog'
import states from './states'
import icons from './icons'
import Events from './events'

window.app.controller('PageControls', function ($rootScope, $scope, $document, $http, $window, $mdToast, $mdDialog) {
  $rootScope.events = new Events($mdToast)
  $scope.events = $rootScope.events

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
        componentCard.html(data)
        $scope.grid.gridStack.compileAngularElement(componentCard)
      }).fail(() => {
        $scope.events.errorEvent('Component NOT refreshed!')
      })
    },
    tools: {
      assignDeep: require('assign-deep'),
      icons: Object.keys(icons)
    }
  }
  $scope.edition = $rootScope.edition

  // Grid object
  $scope.grid = {
    positions: window.initGridPositions,
    layout: window.initGridLayout,
    loaderUrl: window.gridComponentLoaderUrl,
    onLayoutChange: () => {
      if ($scope.grid.gridStack !== null) {
        $scope.grid.gridStack.setLanes($scope.grid.layout)
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
              positions: mx
            }
          }).done(() => {
            $scope.grid.positions = mx
            $scope.events.successEvent('Positions saved!')
          }).fail(() => {
            $scope.events.errorEvent('Positions NOT saved!')
          })
        },
        lanes: $scope.grid.layout,
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
  $scope.$watch('grid.layout', $scope.grid.onLayoutChange)

  // Init
  $document.ready(() => {
    $($scope.grid.init())
    $scope.states.init()
    window.setTimeout(function () {
      $scope.grid.gridStack.gridList('reflow')
    }, 800)
  })
})
