"use strict"

import Nes from 'nes'

window.app.controller("PageControls", function($scope, $document, $http, $window, $mdToast) {
  $scope.states = window.initStates

  $scope.edition = {
    active: false,
    close: () => {
      $scope.edition.active = false
    },
    open: () => {
      $scope.edition.active = true
    }
  }

  $scope.grid = {
    positions: window.initGridPositions, // TODO !0: exemple complet en attendant
    layout: window.initGridLayout,
    loaderUrl: window.gridComponentLoaderUrl, // TODO !0: URL qui rend des CARD a afficher ! l'envoyer depuis le template
    gridStack: null,
    init: function() {
      $scope.grid.gridStack = $('#grid').gridStack({
        matrix: $scope.grid.positions,
        onChange: function(changedItems, mx) {
          // TODO !0
        },
        lanes: $scope.grid.layout,
        elementPrototype: 'li.position-card',
        elementLoaderUrl: $scope.grid.loaderUrl,
        draggableParams: {
          handle: '.handle',
          helper: 'original'
        }
      })
      console.log('INIT!')
    }
  }

  $document.ready(() => {
    console.log('INIT...')
    $($scope.grid.init())
  })


  // TODO !1: register here with a socket, and listen to update $scope.states :)

})
