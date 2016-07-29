/* eslint-disable no-undef */
'use strict'

// import Nes from 'nes'

function DialogController ($scope, $mdDialog) {
  $scope.hide = () => {
    $mdDialog.hide()
  }
  $scope.cancel = () => {
    $mdDialog.cancel()
  }
  $scope.answer = (answer) => {
    alert('click') // TODO !0 : la dialog precompilee ne declenche pas answer() !
    $mdDialog.hide(answer)
  }
}

window.app.controller('PageControls', function ($rootScope, $scope, $document, $http, $window, $mdToast, $mdDialog) {
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
        return (item.id !== id)
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
      $mdDialog.show({
        controller: DialogController,
        contentElement: '#componentSizes',
        parent: angular.element(document.body),
        targetEvent: event,
        clickOutsideToClose: true
      }).then((result) => {
        alert('TODO You decided to name your dog ' + result + '. ANSWER case?')
      }, function () {
        alert('TODO You didn\'t name your dog. CANCEL case?')
      })
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
    window.setTimeout(function () {
      $scope.grid.gridStack.gridList('reflow')
    }, 800)
  })

  // TODO !9: register here with a socket, and listen to update $scope.states :)
})

