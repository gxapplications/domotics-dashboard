/* eslint-disable no-undef */
'use strict'

import {dialogController as resizerController, dialogTemplate as resizerTemplate} from './resizer-dialog'
import states from './states'
import icons from './icons'

// import Nes from 'nes'

window.app.controller('PageControls', function ($rootScope, $scope, $document, $http, $window, $mdToast, $mdDialog) {
  $rootScope.states = states
  $scope.states = $rootScope.states

  $rootScope.edition = {
    active: false,
    close: () => {
      $rootScope.edition.active = false
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
          $mdToast.show(
            $mdToast.simple()
              .textContent('New position saved!')
              .position('bottom right').hideDelay(3000)
          )
        }).fail(() => {
          $mdToast.show(
            $mdToast.simple()
              .textContent('Positions NOT saved!')
              .theme('errorToast').action('RELOAD').highlightAction(true).highlightClass('md-accent')
              .position('bottom right').hideDelay(6000)
          ).then(function (response) {
            if (response === 'ok') {
              window.location.reload()
            }
          })
        })
      }).fail(function () {
        $mdToast.show(
          $mdToast.simple()
            .textContent('Component NOT added!')
            .theme('errorToast').action('RELOAD').highlightAction(true).highlightClass('md-accent')
            .position('bottom right').hideDelay(6000)
        ).then(function (response) {
          if (response === 'ok') {
            window.location.reload()
          }
        })
      })
    },
    removeComponent: (id) => {
      // remove component from matrix
      $scope.grid.positions = $scope.grid.positions.filter((item) => {
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
          $mdToast.show(
            $mdToast.simple()
              .textContent('Component removed!')
              .position('bottom right').hideDelay(3000)
          )
        }).fail(() => {
          $mdToast.show(
            $mdToast.simple()
              .textContent('Positions NOT saved!')
              .theme('errorToast').action('RELOAD').highlightAction(true).highlightClass('md-accent')
              .position('bottom right').hideDelay(6000)
          ).then(function (response) {
            if (response === 'ok') {
              window.location.reload()
            }
          })
        })
      }).fail(() => {
        $scope.toolbar.notifications.postError('Error removing component!')
      })
    },
    resizeComponentDialog: (id, event) => {
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
        $mdToast.show(
          $mdToast.simple()
            .textContent('Component NOT refreshed!')
            .theme('errorToast').action('RELOAD').highlightAction(true).highlightClass('md-accent')
            .position('bottom right').hideDelay(6000)
        ).then(function (response) {
          if (response === 'ok') {
            window.location.reload()
          }
        })
      })
    },
    tools: {
      assignDeep: require('assign-deep'),
      icons: Object.keys(icons)
    }
  }
  $scope.edition = $rootScope.edition

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
            $mdToast.show(
              $mdToast.simple()
                .textContent('Positions saved!')
                .position('bottom right').hideDelay(3000)
            )
          }).fail(() => {
            $mdToast.show(
              $mdToast.simple()
                .textContent('Positions NOT saved!')
                .theme('errorToast').action('RELOAD').highlightAction(true).highlightClass('md-accent')
                .position('bottom right').hideDelay(6000)
            ).then(function (response) {
              if (response === 'ok') {
                window.location.reload()
              }
            })
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

  $document.ready(() => {
    $($scope.grid.init())
    $scope.states.init()
    window.setTimeout(function () {
      $scope.grid.gridStack.gridList('reflow')
    }, 800)
  })
})
