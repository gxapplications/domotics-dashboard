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

	'use strict';

	// import Nes from 'nes'

	window.app.controller('PageControls', function ($rootScope, $scope, $document, $http, $window, $mdToast) {
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
	      // eslint-disable-next-line no-undef
	      $.post(window.gridComponentLoaderUrl, {
	        'type': type,
	        'position': position,
	        'dimensions': { 'w': width, 'h': height }
	      }).done(function (data) {
	        $scope.grid.positions.push({ 'id': data, 'w': width, 'h': height, 'x': position['x'], 'y': position['y'] });
	        // eslint-disable-next-line no-undef
	        $($scope.grid.init()); // reinit gridStack

	        // eslint-disable-next-line no-undef
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
	      alert(id);
	      // TODO !1
	      /*
	       // remove component from matrix
	       var newMatrix = [];
	       for (var i = 0; i < matrix.length; i++) {
	       if (matrix[i]['id'] != componentId) {
	       newMatrix.push(matrix[i]);
	       }
	       }
	       matrix = newMatrix;
	       // update DB (remove component and update page)
	       $.post(
	       '{{ path("_component_remove", {'page_id': page.id}) }}',
	       {
	       'matrix': matrix,
	       'id': componentId
	       }
	       ).done(function(data) {
	       $(init()); // reinit gridStack
	       $scope.toolbar.notifications.postSuccess('Component removed with success!');
	       }).fail(function() {
	       $scope.toolbar.notifications.postError('Error removing component!');
	       });
	       */
	    }
	  };
	  $scope.edition = $rootScope.edition;

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
	      // eslint-disable-next-line no-undef
	      $scope.grid.gridStack = $('#grid').gridStack({
	        matrix: $scope.grid.positions,
	        onChange: function onChange(changedItems, mx) {
	          // eslint-disable-next-line no-undef
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
	    // eslint-disable-next-line no-undef
	    $($scope.grid.init());
	    window.setTimeout(function () {
	      $scope.grid.gridStack.gridList('reflow');
	    }, 800);
	  });

	  // TODO !7: register here with a socket, and listen to update $scope.states :)
	});

/***/ }
/******/ ]);