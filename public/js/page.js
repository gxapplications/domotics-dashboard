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

	window.app.controller('PageControls', function ($scope, $document, $http, $window, $mdToast) {
	  $scope.states = window.initStates;

	  $scope.edition = {
	    active: false,
	    close: function close() {
	      $scope.edition.active = false;
	      // $scope.grid.gridStack.gridList('reflow')
	    },
	    open: function open() {
	      $scope.edition.active = true;
	      // $scope.grid.gridStack.gridList('reflow')
	    }
	  };

	  $scope.grid = {
	    // positions: window.initGridPositions, // TODO !1: retablir une data depuis la DB quand la sauvegarde sera OK
	    positions: [{ id: 1, w: 1, h: 1, x: 0, y: 0 }, { id: 2, w: 1, h: 2, x: 0, y: 1 }, { id: 3, w: 2, h: 2, x: 1, y: 0 }, { id: 4, w: 1, h: 1, x: 1, y: 2 }, { id: 5, w: 2, h: 1, x: 2, y: 2 }],
	    layout: window.initGridLayout,
	    loaderUrl: window.gridComponentLoaderUrl,
	    gridStack: null,
	    init: function init() {
	      // eslint-disable-next-line no-undef
	      $scope.grid.gridStack = $('#grid').gridStack({
	        matrix: $scope.grid.positions,
	        onChange: function onChange(changedItems, mx) {
	          // TODO !1
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

	  $document.ready(function () {
	    // eslint-disable-next-line no-undef
	    $($scope.grid.init());
	    window.setTimeout(function () {
	      $scope.grid.gridStack.gridList('reflow');
	    }, 900);
	  });

	  // TODO !1: register here with a socket, and listen to update $scope.states :)
	});

/***/ }
/******/ ]);