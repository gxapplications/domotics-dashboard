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
/***/ function(module, exports, __webpack_require__) {

	/* eslint-disable no-undef */
	'use strict';

	var _resizerDialog = __webpack_require__(1);

	// import Nes from 'nes'

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
	        return item.id != id; // !!! no "===" here !!!
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
	      var component = $scope.grid.positions.find(function (c) {
	        return c.id == id;
	      }); // !!! no "===" here !!!
	      $mdDialog.show({
	        controller: _resizerDialog.dialogController,
	        template: (0, _resizerDialog.dialogTemplate)(component),
	        parent: angular.element(document.body),
	        targetEvent: event,
	        clickOutsideToClose: true
	      }).then(function (result) {
	        $scope.grid.gridStack.resizeItem($('#grid li[data-id="' + id + '"]'), result.w, result.h);
	      });
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

/***/ },
/* 1 */
/***/ function(module, exports) {

	/* eslint-disable no-undef */
	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	var dialogController = exports.dialogController = function dialogController($scope, $mdDialog) {
	  $scope.hide = function () {
	    $mdDialog.hide();
	  };
	  $scope.cancel = function () {
	    $mdDialog.cancel();
	  };
	  $scope.answer = function (answer) {
	    $mdDialog.hide(answer);
	  };
	};

	var hue = function hue(component, x, y) {
	  return x <= component.w && y <= component.h ? 'md-hue-3' : 'md-hue-1';
	};

	var dialogTemplate = exports.dialogTemplate = function dialogTemplate(component) {
	  return '\n  <md-dialog layout-padding>\n    <h2>Choose width and height</h2>\n    <table>\n    <tr>\n      <td>\n        <md-button class="md-raised md-accent ' + hue(component, 1, 1) + '" ng-click="answer({w:1, h:1})">1x1</md-button>\n      </td>\n      <td>\n        <md-button class="md-raised md-accent ' + hue(component, 2, 1) + '" ng-click="answer({w:2, h:1})">2x1</md-button>\n      </td>\n      <td>\n        <md-button class="md-raised md-accent ' + hue(component, 3, 1) + '" ng-click="answer({w:3, h:1})">3x1</md-button>\n      </td>\n      <td>\n        <md-button class="md-raised md-accent ' + hue(component, 4, 1) + '" ng-click="answer({w:4, h:1})">4x1</md-button>\n      </td>\n      <td>\n        <md-button class="md-raised md-accent ' + hue(component, 5, 1) + '" ng-click="answer({w:5, h:1})">5x1</md-button>\n      </td>\n    </tr>\n    <tr>\n      <td>\n        <md-button class="md-raised md-accent ' + hue(component, 1, 2) + '" ng-click="answer({w:1, h:2})">1x2</md-button>\n      </td>\n      <td>\n        <md-button class="md-raised md-accent ' + hue(component, 2, 2) + '" ng-click="answer({w:2, h:2})">2x2</md-button>\n      </td>\n      <td>\n        <md-button class="md-raised md-accent ' + hue(component, 3, 2) + '" ng-click="answer({w:3, h:2})">3x2</md-button>\n      </td>\n      <td>\n        <md-button class="md-raised md-accent ' + hue(component, 4, 2) + '" ng-click="answer({w:4, h:2})">4x2</md-button>\n      </td>\n      <td>\n        <md-button class="md-raised md-accent ' + hue(component, 5, 2) + '" ng-click="answer({w:5, h:2})">5x2</md-button>\n      </td>\n    </tr>\n    <tr>\n      <td>\n        <md-button class="md-raised md-accent ' + hue(component, 1, 3) + '" ng-click="answer({w:1, h:3})">1x3</md-button>\n      </td>\n      <td>\n        <md-button class="md-raised md-accent ' + hue(component, 2, 3) + '" ng-click="answer({w:2, h:3})">2x3</md-button>\n      </td>\n      <td>\n        <md-button class="md-raised md-accent ' + hue(component, 3, 3) + '" ng-click="answer({w:3, h:3})">3x3</md-button>\n      </td>\n      <td>\n        <md-button class="md-raised md-accent ' + hue(component, 4, 3) + '" ng-click="answer({w:4, h:3})">4x3</md-button>\n      </td>\n      <td>\n        <md-button class="md-raised md-accent ' + hue(component, 5, 3) + '" ng-click="answer({w:5, h:3})">5x3</md-button>\n      </td>\n    </tr>\n    <tr>\n      <td>\n        <md-button class="md-raised md-accent ' + hue(component, 1, 4) + '" ng-click="answer({w:1, h:4})">1x4</md-button>\n      </td>\n      <td>\n        <md-button class="md-raised md-accent ' + hue(component, 2, 4) + '" ng-click="answer({w:2, h:4})">2x4</md-button>\n      </td>\n      <td>\n        <md-button class="md-raised md-accent ' + hue(component, 3, 4) + '" ng-click="answer({w:3, h:4})">3x4</md-button>\n      </td>\n      <td>\n        <md-button class="md-raised md-accent ' + hue(component, 4, 4) + '" ng-click="answer({w:4, h:4})">4x4</md-button>\n      </td>\n      <td>\n        <md-button class="md-raised md-accent ' + hue(component, 5, 4) + '" ng-click="answer({w:5, h:4})">5x4</md-button>\n      </td>\n    </tr>\n    </table>\n  </md-dialog>\n';
	};

/***/ }
/******/ ]);