/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports) {

	/* eslint-disable no-undef */
	'use strict';

	// import Nes from 'nes'

	function DialogController($scope, $mdDialog) {
	  $scope.hide = function () {
	    $mdDialog.hide();
	  };
	  $scope.cancel = function () {
	    $mdDialog.cancel();
	  };
	  $scope.answer = function (answer) {
	    alert('click'); // TODO !0 : la dialog precompilee ne declenche pas answer() !
	    $mdDialog.hide(answer);
	  };
	}

	window.app.controller('PageControls', function ($rootScope, $scope, $document, $http, $window, $mdToast, $mdDialog) {
	  $scope.states = window.initStates;

	  $rootScope.edition = {
	    active: false,
	    close: function close() {
	      $rootScope.edition.active = false;
	      // $rootScope.grid.gridStack.gridList('reflow')
	    },
	    open: function open() {
	      $rootScope.edition.active = true;
	      // $rootScope.grid.gridStack.gridList('reflow')
	    },
	    addComponent: function addComponent(type, width, height) {
	      var position = $scope.grid.gridStack.findFreeSpaceXY(width, height);
	      $.post(window.gridComponentLoaderUrl, {
	        'type': type,
	        'position': position,
	        'dimensions': { 'w': width, 'h': height }
	      }).done(function (data) {
	        $scope.grid.positions.push({ 'id': data, 'w': width, 'h': height, 'x': position['x'], 'y': position['y'] });
	        $($scope.grid.init()); // reinit gridStack

	        $.ajax({
	          url: window.gridPageUpdaterUrl,
	          method: 'PATCH',
	          data: {
	            positions: $scope.grid.positions
	          }
	        }).done(function () {
	          $mdToast.show($mdToast.simple().textContent('New position saved!').position('bottom right').hideDelay(3000));
	        }).fail(function () {
	          $mdToast.show($mdToast.simple().textContent('Positions NOT saved!').theme('errorToast').action('RELOAD').highlightAction(true).highlightClass('md-accent').position('bottom right').hideDelay(6000)).then(function (response) {
	            if (response === 'ok') {
	              window.location.reload();
	            }
	          });
	        });
	      }).fail(function () {
	        $mdToast.show($mdToast.simple().textContent('Component NOT added!').theme('errorToast').action('RELOAD').highlightAction(true).highlightClass('md-accent').position('bottom right').hideDelay(6000)).then(function (response) {
	          if (response === 'ok') {
	            window.location.reload();
	          }
	        });
	      });
	    },
	    removeComponent: function removeComponent(id) {
	      // remove component from matrix
	      $scope.grid.positions = $scope.grid.positions.filter(function (item) {
	        return item.id !== id;
	      });

	      // update DB (remove component and update page)
	      $.ajax({
	        url: window.gridComponentLoaderUrl + '/' + id,
	        method: 'DELETE',
	        data: {
	          id: id
	        }
	      }).done(function (data) {
	        $($scope.grid.init()); // reinit gridStack

	        $.ajax({
	          url: window.gridPageUpdaterUrl,
	          method: 'PATCH',
	          data: {
	            positions: $scope.grid.positions
	          }
	        }).done(function () {
	          $mdToast.show($mdToast.simple().textContent('Component removed!').position('bottom right').hideDelay(3000));
	        }).fail(function () {
	          $mdToast.show($mdToast.simple().textContent('Positions NOT saved!').theme('errorToast').action('RELOAD').highlightAction(true).highlightClass('md-accent').position('bottom right').hideDelay(6000)).then(function (response) {
	            if (response === 'ok') {
	              window.location.reload();
	            }
	          });
	        });
	      }).fail(function () {
	        $scope.toolbar.notifications.postError('Error removing component!');
	      });
	    },
	    resizeComponentDialog: function resizeComponentDialog(id, event) {
	      $mdDialog.show({
	        //controller: DialogController,
	        contentElement: '#componentSizes',
	        parent: angular.element(document.body),
	        targetEvent: event,
	        clickOutsideToClose: true,
	        locals: {
	          answer: function answer(toto) {
	            alert(toto);
	          }
	        }
	      }).then(function (result) {
	        alert('TODO You decided to name your dog ' + result + '. ANSWER case?');
	      }, function () {
	        alert('TODO You didn\'t name your dog. CANCEL case?');
	      });
	    }
	  };
	  $scope.edition = $rootScope.edition;
	  $scope.answer = function (toto) {
	    alert(toto);
	  };
	  $scope.grid = {
	    positions: window.initGridPositions,
	    layout: window.initGridLayout,
	    loaderUrl: window.gridComponentLoaderUrl,
	    onLayoutChange: function onLayoutChange() {
	      if ($scope.grid.gridStack !== null) {
	        $scope.grid.gridStack.setLanes($scope.grid.layout);
	      }
	    },
	    gridStack: null,
	    init: function init() {
	      $scope.grid.gridStack = $('#grid').gridStack({
	        matrix: $scope.grid.positions,
	        onChange: function onChange(changedItems, mx) {
	          $.ajax({
	            url: window.gridPageUpdaterUrl,
	            method: 'PATCH',
	            data: {
	              positions: mx
	            }
	          }).done(function () {
	            $scope.grid.positions = mx;
	            $mdToast.show($mdToast.simple().textContent('Positions saved!').position('bottom right').hideDelay(3000));
	          }).fail(function () {
	            $mdToast.show($mdToast.simple().textContent('Positions NOT saved!').theme('errorToast').action('RELOAD').highlightAction(true).highlightClass('md-accent').position('bottom right').hideDelay(6000)).then(function (response) {
	              if (response === 'ok') {
	                window.location.reload();
	              }
	            });
	          });
	        },
	        lanes: $scope.grid.layout,
	        elementPrototype: 'li.position-card',
	        elementLoaderUrl: $scope.grid.loaderUrl,
	        draggableParams: {
	          handle: '.handle',
	          helper: 'original'
	        },
	        getSizingCoefficient: function getSizingCoefficient() {
	          return $scope.edition.active ? 1 / 0.84 : 1;
	        }
	      });
	    }
	  };
	  $scope.$watch('grid.layout', $scope.grid.onLayoutChange);

	  $document.ready(function () {
	    $($scope.grid.init());
	    window.setTimeout(function () {
	      $scope.grid.gridStack.gridList('reflow');
	    }, 800);
	  });

	  // TODO !9: register here with a socket, and listen to update $scope.states :)
	});

/***/ }
/******/ ]);