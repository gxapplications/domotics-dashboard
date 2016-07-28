'use strict'

// import Nes from 'nes'

window.app.controller('PageControls', function ($rootScope, $scope, $document, $http, $window, $mdToast) {
  $scope.states = window.initStates

  $rootScope.edition = {
    active: false,
    close: () => {
      $rootScope.edition.active = false
      // $rootScope.grid.gridStack.gridList('reflow')
    },
    open: () => {
      $rootScope.edition.active = true
      // $rootScope.grid.gridStack.gridList('reflow')
    }
  }
  $scope.edition = $rootScope.edition

  $scope.grid = {
    positions: window.initGridPositions.length ? window.initGridPositions : [
      {id: 1, w: 1, h: 1, x: 0, y: 0},
      {id: 2, w: 1, h: 2, x: 0, y: 1},
      {id: 3, w: 2, h: 2, x: 1, y: 0},
      {id: 4, w: 1, h: 1, x: 1, y: 2},
      {id: 5, w: 2, h: 1, x: 2, y: 2}
    ], // TODO !5: remove fake data when CRUD will be OK
    layout: window.initGridLayout,
    loaderUrl: window.gridComponentLoaderUrl,
    onLayoutChange: () => {
      if ($scope.grid.gridStack !== null) {
        $scope.grid.gridStack.setLanes($scope.grid.layout)
      }
    },
    gridStack: null,
    init: function () {
      // eslint-disable-next-line no-undef
      $scope.grid.gridStack = $('#grid').gridStack({
        matrix: $scope.grid.positions,
        onChange: (changedItems, mx) => {
          // eslint-disable-next-line no-undef
          $.ajax({
            url: window.gridPageUpdaterUrl,
            method: 'PATCH',
            data: {
              'positions': mx
            }
          }).done(() => {
            $scope.grid.positions = mx
            $mdToast.show(
              $mdToast.simple()
                .textContent('Positions saved!')
                .position('bottom right')
                .hideDelay(3000)
            )
          }).fail(() => {
            $mdToast.show(
              $mdToast.simple()
                .textContent('Positions NOT saved!')
                .theme('errorToast')
                .action('RELOAD')
                .highlightAction(true)
                .highlightClass('md-accent')
                .position('bottom right')
                .hideDelay(6000)
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
    // eslint-disable-next-line no-undef
    $($scope.grid.init())
    window.setTimeout(function () {
      $scope.grid.gridStack.gridList('reflow')
    }, 900)
  })

  // TODO !7: register here with a socket, and listen to update $scope.states :)
})

