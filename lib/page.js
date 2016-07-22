'use strict'

// import Nes from 'nes'

window.app.controller('PageControls', function ($scope, $document, $http, $window, $mdToast) {
  $scope.states = window.initStates

  $scope.edition = {
    active: false,
    close: () => {
      $scope.edition.active = false
      // $scope.grid.gridStack.gridList('reflow')
    },
    open: () => {
      $scope.edition.active = true
      // $scope.grid.gridStack.gridList('reflow')
    }
  }

  $scope.grid = {
    // positions: window.initGridPositions, // TODO !1: retablir une data depuis la DB quand la sauvegarde sera OK
    positions: [
		{id: 1, w: 1, h: 1, x: 0, y: 0},
		{id: 2, w: 1, h: 2, x: 0, y: 1},
		{id: 3, w: 2, h: 2, x: 1, y: 0},
		{id: 4, w: 1, h: 1, x: 1, y: 2},
		{id: 5, w: 2, h: 1, x: 2, y: 2}
    ],
    layout: window.initGridLayout,
    loaderUrl: window.gridComponentLoaderUrl,
    gridStack: null,
    init: function () {
      // eslint-disable-next-line no-undef
      $scope.grid.gridStack = $('#grid').gridStack({
        matrix: $scope.grid.positions,
        onChange: function (changedItems, mx) {
          // TODO !1
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

  $document.ready(() => {
    // eslint-disable-next-line no-undef
    $($scope.grid.init())
    window.setTimeout(function () {
      $scope.grid.gridStack.gridList('reflow')
    }, 900)
  })

  // TODO !1: register here with a socket, and listen to update $scope.states :)
})

