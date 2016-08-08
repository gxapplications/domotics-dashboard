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

	/* global $, angular */
	'use strict';

	var _resizerDialog = __webpack_require__(1);

	var _states = __webpack_require__(2);

	var _states2 = _interopRequireDefault(_states);

	var _icons = __webpack_require__(5);

	var _icons2 = _interopRequireDefault(_icons);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	window.app.controller('PageControls', function ($rootScope, $scope, $document, $http, $window, $mdToast, $mdDialog) {
	  $rootScope.states = _states2.default;
	  $scope.states = $rootScope.states;

	  $rootScope.edition = {
	    active: false,
	    close: function close() {
	      $rootScope.edition.active = false;
	    },
	    open: function open() {
	      $rootScope.edition.active = true;
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
	        // eslint-disable-next-line eqeqeq
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
	      // eslint-disable-next-line eqeqeq
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
	    },
	    refreshComponent: function refreshComponent(id) {
	      var componentCard = $('li.position-card[data-id="' + id + '"] > .inner', $scope.grid.gridStack).first();
	      $.ajax({
	        url: window.gridComponentLoaderUrl,
	        method: 'POST',
	        data: {
	          id: id
	        }
	      }).done(function (data) {
	        componentCard.html(data);
	        $scope.grid.gridStack.compileAngularElement(componentCard);
	      }).fail(function () {
	        $mdToast.show($mdToast.simple().textContent('Component NOT refreshed!').theme('errorToast').action('RELOAD').highlightAction(true).highlightClass('md-accent').position('bottom right').hideDelay(6000)).then(function (response) {
	          if (response === 'ok') {
	            window.location.reload();
	          }
	        });
	      });
	    },
	    tools: {
	      assignDeep: __webpack_require__(6),
	      icons: Object.keys(_icons2.default)
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
	    $scope.states.init();
	    window.setTimeout(function () {
	      $scope.grid.gridStack.gridList('reflow');
	    }, 800);
	  });
	});

/***/ },
/* 1 */
/***/ function(module, exports) {

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

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	/* eslint-disable no-undef */
	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _nes = __webpack_require__(3);

	var _nes2 = _interopRequireDefault(_nes);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var states = window.initStates;

	// OnDemand scenarii, scenarii list, filtered by type
	states.onDemandScenarii = []; // void before initialization
	states.onDemandScenarii.load = function () {
	  if (states.onDemandScenarii.length > 0) {
	    return;
	  }
	  states.onDemandScenarii = Object.keys(states.scenarii.value).filter(function (id) {
	    return states.scenarii.value[id].type === 1;
	  }).map(function (id) {
	    return { id: id, label: states.scenarii.value[id].name };
	  });
	};

	// Socket
	states.socketClient = new _nes2.default.Client('ws://' + window.location.host);
	states.socketClient.updater = function (label) {
	  return function (update, flags) {
	    console.log('WS Update received for label ' + label + ': ', update);
	    states[label] = update;
	  };
	};
	states.socketClient.error = function (label) {
	  return function (err) {
	    if (err) {
	      console.error('Socket client transmission error: ' + err);
	    }
	  };
	};
	states.socketClient.onError = function (err) {
	  if (err) {
	    console.error('Socket client unknown error: ' + err);
	    // TODO !2: quand la socket est rompue coté serveur (Ctrl+C), on a des erreurs côté client:
	    // - il faut identifier l'erreur (err a identifier, 'Socket error' ?)
	    // - il faut laisser faire un retry 5 fois, puis
	    // - il faut fermer propre et faire apparaître un message sur l'UX
	  }
	};

	// Init step
	states.init = function () {
	  states.onDemandScenarii.load();
	  states.socketClient.connect(function (err) {
	    if (err) {
	      console.error('Socket client connection failure!');
	      return;
	    }
	    states.socketClient.subscribe('/socket/status', states.socketClient.updater('status'), states.socketClient.error('status'));
	    states.socketClient.subscribe('/socket/alarm', states.socketClient.updater('alarm'), states.socketClient.error('alarm'));
	    states.socketClient.subscribe('/socket/scenarii', states.socketClient.updater('scenarii'), states.socketClient.error('scenarii'));
	    states.socketClient.subscribe('/socket/data', states.socketClient.updater('data'), states.socketClient.error('data'));
	    states.socketClient.subscribe('/socket/heat', states.socketClient.updater('heat'), states.socketClient.error('heat'));
	    states.socketClient.subscribe('/socket/macro', states.socketClient.updater('macro'), states.socketClient.error('macro'));
	  });
	};

	exports.default = states;

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_RESULT__;/* WEBPACK VAR INJECTION */(function(global, module) {'use strict';

	/*
	    (hapi)nes WebSocket Client (https://github.com/hapijs/nes)
	    Copyright (c) 2015-2016, Eran Hammer <eran@hammer.io> and other contributors
	    BSD Licensed
	*/

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

	(function (root, factory) {

	    // $lab:coverage:off$

	    if (( false ? 'undefined' : _typeof(exports)) === 'object' && ( false ? 'undefined' : _typeof(module)) === 'object') {
	        module.exports = factory(); // Export if used as a module
	    } else if (true) {
	        !(__WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.call(exports, __webpack_require__, exports, module)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	    } else if ((typeof exports === 'undefined' ? 'undefined' : _typeof(exports)) === 'object') {
	        exports.nes = factory();
	    } else {
	        root.nes = factory();
	    }

	    // $lab:coverage:on$
	})( /* $lab:coverage:off$ */typeof window !== 'undefined' ? window : global /* $lab:coverage:on$ */, function () {

	    // Utilities

	    var version = '2';
	    var ignore = function ignore() {};

	    var parse = function parse(message, next) {

	        var obj = null;
	        var error = null;

	        try {
	            obj = JSON.parse(message);
	        } catch (err) {
	            error = new NesError(err, 'protocol');
	        }

	        return next(error, obj);
	    };

	    var stringify = function stringify(message, next) {

	        var string = null;
	        var error = null;

	        try {
	            string = JSON.stringify(message);
	        } catch (err) {
	            error = new NesError(err, 'user');
	        }

	        return next(error, string);
	    };

	    var nextTick = function nextTick(callback) {

	        return function (err) {

	            setTimeout(function () {
	                return callback(err);
	            }, 0);
	        };
	    };

	    var NesError = function NesError(err, type) {

	        if (typeof err === 'string') {
	            err = new Error(err);
	        }

	        err.type = type;
	        return err;
	    };

	    // Error codes

	    var errorCodes = {
	        1000: 'Normal closure',
	        1001: 'Going away',
	        1002: 'Protocol error',
	        1003: 'Unsupported data',
	        1004: 'Reserved',
	        1005: 'No status received',
	        1006: 'Abnormal closure',
	        1007: 'Invalid frame payload data',
	        1008: 'Policy violation',
	        1009: 'Message too big',
	        1010: 'Mandatory extension',
	        1011: 'Internal server error',
	        1015: 'TLS handshake'
	    };

	    // Client

	    var Client = function Client(url, options) {

	        options = options || {};

	        // Configuration

	        this._url = url;
	        this._settings = options;
	        this._heartbeatTimeout = false; // Server heartbeat configuration

	        // State

	        this._ws = null;
	        this._reconnection = null;
	        this._reconnectionTimer = null;
	        this._ids = 0; // Id counter
	        this._requests = {}; // id -> { callback, timeout }
	        this._subscriptions = {}; // path -> [callbacks]
	        this._heartbeat = null;
	        this._packets = [];
	        this._disconnectListeners = null;
	        this._disconnectRequested = false;

	        // Events

	        this.onError = function (err) {
	            return console.error(err);
	        }; // General error callback (only when an error cannot be associated with a request)
	        this.onConnect = ignore; // Called whenever a connection is established
	        this.onDisconnect = ignore; // Called whenever a connection is lost: function(willReconnect)
	        this.onUpdate = ignore;

	        // Public properties

	        this.id = null; // Assigned when hello response is received
	    };

	    Client.WebSocket = /* $lab:coverage:off$ */typeof WebSocket === 'undefined' ? null : WebSocket; /* $lab:coverage:on$ */

	    Client.prototype.connect = function (options, callback) {

	        if (typeof options === 'function') {
	            callback = arguments[0];
	            options = {};
	        }

	        if (this._reconnection) {
	            return nextTick(callback)(new Error('Cannot connect while client attempts to reconnect'));
	        }

	        if (this._ws) {
	            return nextTick(callback)(new Error('Already connected'));
	        }

	        if (options.reconnect !== false) {
	            // Defaults to true
	            this._reconnection = { // Options: reconnect, delay, maxDelay
	                wait: 0,
	                delay: options.delay || 1000, // 1 second
	                maxDelay: options.maxDelay || 5000, // 5 seconds
	                retries: options.retries || Infinity, // Unlimited
	                settings: {
	                    auth: options.auth,
	                    timeout: options.timeout
	                }
	            };
	        } else {
	            this._reconnection = null;
	        }

	        this._connect(options, true, callback);
	    };

	    Client.prototype._connect = function (options, initial, callback) {
	        var _this = this;

	        var ws = new Client.WebSocket(this._url, this._settings.ws); // Settings used by node.js only
	        this._ws = ws;

	        clearTimeout(this._reconnectionTimer);
	        this._reconnectionTimer = null;

	        var finalize = function finalize(err) {

	            if (callback) {
	                // Call only once when connect() is called
	                var cb = callback;
	                callback = null;
	                return cb(err);
	            }

	            return _this.onError(err);
	        };

	        var timeoutHandler = function timeoutHandler() {

	            _this._cleanup();

	            finalize(new NesError('Connection timed out', 'timeout'));

	            if (initial) {
	                return _this._reconnect();
	            }
	        };

	        var timeout = options.timeout ? setTimeout(timeoutHandler, options.timeout) : null;

	        ws.onopen = function () {

	            clearTimeout(timeout);
	            ws.onopen = null;

	            return _this._hello(options.auth, function (err) {

	                if (err) {
	                    if (err.path) {
	                        delete _this._subscriptions[err.path];
	                    }

	                    return _this._disconnect(function () {
	                        return finalize(err);
	                    }, true); // Stop reconnection when the hello message returns error
	                }

	                _this.onConnect();
	                return finalize();
	            });
	        };

	        ws.onerror = function (event) {

	            clearTimeout(timeout);
	            _this._cleanup();

	            var error = new NesError('Socket error', 'ws');
	            return finalize(error);
	        };

	        ws.onclose = function (event) {

	            if (ws.onopen) {
	                finalize(new Error('Connection terminated while while to connect'));
	            }

	            var wasRequested = _this._disconnectRequested; // Get value before _cleanup()

	            _this._cleanup();

	            var log = {
	                code: event.code,
	                explanation: errorCodes[event.code] || 'Unknown',
	                reason: event.reason,
	                wasClean: event.wasClean,
	                willReconnect: !!(_this._reconnection && _this._reconnection.retries >= 1),
	                wasRequested: wasRequested
	            };

	            _this.onDisconnect(log.willReconnect, log);
	            _this._reconnect();
	        };

	        ws.onmessage = function (message) {

	            return _this._onMessage(message);
	        };
	    };

	    Client.prototype.overrideReconnectionAuth = function (auth) {

	        if (!this._reconnection) {
	            return false;
	        }

	        this._reconnection.settings.auth = auth;
	        return true;
	    };

	    Client.prototype.disconnect = function (callback) {

	        callback = callback || ignore;
	        return this._disconnect(callback, false);
	    };

	    Client.prototype._disconnect = function (callback, isInternal) {

	        this._reconnection = null;
	        clearTimeout(this._reconnectionTimer);
	        this._reconnectionTimer = null;
	        var requested = this._disconnectRequested || !isInternal; // Retain true

	        if (this._disconnectListeners) {
	            this._disconnectRequested = requested;
	            this._disconnectListeners.push(callback);
	            return;
	        }

	        if (!this._ws || this._ws.readyState !== Client.WebSocket.OPEN && this._ws.readyState !== Client.WebSocket.CONNECTING) {

	            return nextTick(callback)();
	        }

	        this._disconnectRequested = requested;
	        this._disconnectListeners = [callback];
	        this._ws.close();
	    };

	    Client.prototype._cleanup = function () {

	        if (this._ws) {
	            if (this._ws.readyState === Client.WebSocket.OPEN || this._ws.readyState === Client.WebSocket.CONNECTING) {

	                this._ws.close();
	            }

	            this._ws.onopen = null;
	            this._ws.onclose = null;
	            this._ws.onerror = ignore;
	            this._ws.onmessage = null;
	            this._ws = null;
	        }

	        this._packets = [];
	        this.id = null;

	        clearTimeout(this._heartbeat);
	        this._heartbeat = null;

	        // Flush pending requests

	        var error = new NesError('Request failed - server disconnected', 'disconnect');

	        var ids = Object.keys(this._requests);
	        for (var i = 0; i < ids.length; ++i) {
	            var id = ids[i];
	            var request = this._requests[id];
	            var callback = request.callback;
	            clearTimeout(request.timeout);
	            delete this._requests[id];
	            callback(error);
	        }

	        if (this._disconnectListeners) {
	            var listeners = this._disconnectListeners;
	            this._disconnectListeners = null;
	            this._disconnectRequested = false;
	            listeners.forEach(function (listener) {
	                return listener();
	            });
	        }
	    };

	    Client.prototype._reconnect = function () {
	        var _this2 = this;

	        // Reconnect

	        if (!this._reconnection) {
	            return;
	        }

	        if (this._reconnection.retries < 1) {
	            return this._disconnect(ignore, true); // Clear _reconnection state
	        }

	        --this._reconnection.retries;
	        this._reconnection.wait = this._reconnection.wait + this._reconnection.delay;

	        var timeout = Math.min(this._reconnection.wait, this._reconnection.maxDelay);
	        this._reconnectionTimer = setTimeout(function () {

	            _this2._connect(_this2._reconnection.settings, false, function (err) {

	                if (err) {
	                    _this2.onError(err);
	                    return _this2._reconnect();
	                }
	            });
	        }, timeout);
	    };

	    Client.prototype.request = function (options, callback) {

	        if (typeof options === 'string') {
	            options = {
	                method: 'GET',
	                path: options
	            };
	        }

	        var request = {
	            type: 'request',
	            method: options.method || 'GET',
	            path: options.path,
	            headers: options.headers,
	            payload: options.payload
	        };

	        return this._send(request, true, callback);
	    };

	    Client.prototype.message = function (message, callback) {

	        var request = {
	            type: 'message',
	            message: message
	        };

	        return this._send(request, true, callback);
	    };

	    Client.prototype._send = function (request, track, callback) {
	        var _this3 = this;

	        callback = callback || ignore;

	        if (!this._ws || this._ws.readyState !== Client.WebSocket.OPEN) {

	            return nextTick(callback)(new NesError('Failed to send message - server disconnected', 'disconnect'));
	        }

	        request.id = ++this._ids;

	        stringify(request, function (err, encoded) {

	            if (err) {
	                return nextTick(callback)(err);
	            }

	            // Ignore errors

	            if (!track) {
	                try {
	                    return _this3._ws.send(encoded);
	                } catch (err) {
	                    return nextTick(callback)(new NesError(err, 'ws'));
	                }
	            }

	            // Track errors

	            var record = {
	                callback: callback,
	                timeout: null
	            };

	            if (_this3._settings.timeout) {
	                record.timeout = setTimeout(function () {

	                    record.callback = null;
	                    record.timeout = null;

	                    return callback(new NesError('Request timed out', 'timeout'));
	                }, _this3._settings.timeout);
	            }

	            _this3._requests[request.id] = record;

	            try {
	                _this3._ws.send(encoded);
	            } catch (err) {
	                clearTimeout(_this3._requests[request.id].timeout);
	                delete _this3._requests[request.id];
	                return nextTick(callback)(new NesError(err, 'ws'));
	            }
	        });
	    };

	    Client.prototype._hello = function (auth, callback) {

	        var request = {
	            type: 'hello',
	            version: version
	        };

	        if (auth) {
	            request.auth = auth;
	        }

	        var subs = this.subscriptions();
	        if (subs.length) {
	            request.subs = subs;
	        }

	        return this._send(request, true, callback);
	    };

	    Client.prototype.subscriptions = function () {

	        return Object.keys(this._subscriptions);
	    };

	    Client.prototype.subscribe = function (path, handler, callback) {
	        var _this4 = this;

	        if (!path || path[0] !== '/') {

	            return nextTick(callback)(new NesError('Invalid path', 'user'));
	        }

	        var subs = this._subscriptions[path];
	        if (subs) {

	            // Already subscribed

	            if (subs.indexOf(handler) === -1) {
	                subs.push(handler);
	            }

	            return nextTick(callback)();
	        }

	        this._subscriptions[path] = [handler];

	        if (!this._ws || this._ws.readyState !== Client.WebSocket.OPEN) {

	            // Queued subscription

	            return nextTick(callback)();
	        }

	        var request = {
	            type: 'sub',
	            path: path
	        };

	        return this._send(request, true, function (err) {

	            if (err) {
	                delete _this4._subscriptions[path];
	            }

	            return callback(err);
	        });
	    };

	    Client.prototype.unsubscribe = function (path, handler, callback) {

	        if (!path || path[0] !== '/') {

	            return nextTick(callback)(new NesError('Invalid path', 'user'));
	        }

	        var subs = this._subscriptions[path];
	        if (!subs) {
	            return nextTick(callback)();
	        }

	        var sync = false;
	        if (!handler) {
	            delete this._subscriptions[path];
	            sync = true;
	        } else {
	            var pos = subs.indexOf(handler);
	            if (pos === -1) {
	                return nextTick(callback)();
	            }

	            subs.splice(pos, 1);
	            if (!subs.length) {
	                delete this._subscriptions[path];
	                sync = true;
	            }
	        }

	        if (!sync || !this._ws || this._ws.readyState !== Client.WebSocket.OPEN) {

	            return nextTick(callback)();
	        }

	        var request = {
	            type: 'unsub',
	            path: path
	        };

	        return this._send(request, true, function (errIgnore) {
	            return callback();
	        }); // Ignoring errors as the subscription handlers are already removed
	    };

	    Client.prototype._onMessage = function (message) {
	        var _this5 = this;

	        this._beat();

	        var data = message.data;
	        var prefix = data[0];
	        if (prefix !== '{') {
	            this._packets.push(data.slice(1));
	            if (prefix !== '!') {
	                return;
	            }

	            data = this._packets.join('');
	            this._packets = [];
	        }

	        if (this._packets.length) {
	            this._packets = [];
	            this.onError(new NesError('Received an incomplete message', 'protocol'));
	        }

	        parse(data, function (err, update) {

	            if (err) {
	                return _this5.onError(err);
	            }

	            // Recreate error

	            var error = null;
	            if (update.statusCode && update.statusCode >= 400 && update.statusCode <= 599) {

	                error = new NesError(update.payload.message || update.payload.error, 'server');
	                error.statusCode = update.statusCode;
	                error.data = update.payload;
	                error.headers = update.headers;
	                error.path = update.path;
	            }

	            // Ping

	            if (update.type === 'ping') {
	                return _this5._send({ type: 'ping' }, false); // Ignore errors
	            }

	            // Broadcast and update

	            if (update.type === 'update') {
	                return _this5.onUpdate(update.message);
	            }

	            // Publish or Revoke

	            if (update.type === 'pub' || update.type === 'revoke') {

	                var handlers = _this5._subscriptions[update.path];
	                if (update.type === 'revoke') {
	                    delete _this5._subscriptions[update.path];
	                }

	                if (handlers && update.message !== undefined) {

	                    var flags = {};
	                    if (update.type === 'revoke') {
	                        flags.revoked = true;
	                    }

	                    for (var i = 0; i < handlers.length; ++i) {
	                        handlers[i](update.message, flags);
	                    }
	                }

	                return;
	            }

	            // Lookup callback (message must include an id from this point)

	            var request = _this5._requests[update.id];
	            if (!request) {
	                return _this5.onError(new NesError('Received response for unknown request', 'protocol'));
	            }

	            var callback = request.callback;
	            clearTimeout(request.timeout);
	            delete _this5._requests[update.id];

	            if (!callback) {
	                return; // Response received after timeout
	            }

	            // Response

	            if (update.type === 'request') {
	                return callback(error, update.payload, update.statusCode, update.headers);
	            }

	            // Custom message

	            if (update.type === 'message') {
	                return callback(error, update.message);
	            }

	            // Authentication

	            if (update.type === 'hello') {
	                _this5.id = update.socket;
	                if (update.heartbeat) {
	                    _this5._heartbeatTimeout = update.heartbeat.interval + update.heartbeat.timeout;
	                    _this5._beat(); // Call again once timeout is set
	                }

	                return callback(error);
	            }

	            // Subscriptions

	            if (update.type === 'sub' || update.type === 'unsub') {

	                return callback(error);
	            }

	            return _this5.onError(new NesError('Received unknown response type: ' + update.type, 'protocol'));
	        });
	    };

	    Client.prototype._beat = function () {
	        var _this6 = this;

	        if (!this._heartbeatTimeout) {
	            return;
	        }

	        clearTimeout(this._heartbeat);

	        this._heartbeat = setTimeout(function () {

	            _this6.onError(new NesError('Disconnecting due to heartbeat timeout', 'timeout'));
	            _this6._ws.close();
	        }, this._heartbeatTimeout);
	    };

	    // Expose interface

	    return { Client: Client };
	});

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }()), __webpack_require__(4)(module)))

/***/ },
/* 4 */
/***/ function(module, exports) {

	module.exports = function(module) {
		if(!module.webpackPolyfill) {
			module.deprecate = function() {};
			module.paths = [];
			// module.parent = undefined by default
			module.children = [];
			module.webpackPolyfill = 1;
		}
		return module;
	}


/***/ },
/* 5 */
/***/ function(module, exports) {

	/* eslint-disable no-undef */
	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	var icons = {
	  '3d_rotation': 'e84d',
	  'ac_unit': 'eb3b',
	  'access_alarm': 'e190',
	  'access_alarms': 'e191',
	  'access_time': 'e192',
	  'accessibility': 'e84e',
	  'accessible': 'e914',
	  'account_balance': 'e84f',
	  'account_balance_wallet': 'e850',
	  'account_box': 'e851',
	  'account_circle': 'e853',
	  'adb': 'e60e',
	  'add': 'e145',
	  'add_a_photo': 'e439',
	  'add_alarm': 'e193',
	  'add_alert': 'e003',
	  'add_box': 'e146',
	  'add_circle': 'e147',
	  'add_circle_outline': 'e148',
	  'add_location': 'e567',
	  'add_shopping_cart': 'e854',
	  'add_to_photos': 'e39d',
	  'add_to_queue': 'e05c',
	  'adjust': 'e39e',
	  'airline_seat_flat': 'e630',
	  'airline_seat_flat_angled': 'e631',
	  'airline_seat_individual_suite': 'e632',
	  'airline_seat_legroom_extra': 'e633',
	  'airline_seat_legroom_normal': 'e634',
	  'airline_seat_legroom_reduced': 'e635',
	  'airline_seat_recline_extra': 'e636',
	  'airline_seat_recline_normal': 'e637',
	  'airplanemode_active': 'e195',
	  'airplanemode_inactive': 'e194',
	  'airplay': 'e055',
	  'airport_shuttle': 'eb3c',
	  'alarm': 'e855',
	  'alarm_add': 'e856',
	  'alarm_off': 'e857',
	  'alarm_on': 'e858',
	  'album': 'e019',
	  'all_inclusive': 'eb3d',
	  'all_out': 'e90b',
	  'android': 'e859',
	  'announcement': 'e85a',
	  'apps': 'e5c3',
	  'archive': 'e149',
	  'arrow_back': 'e5c4',
	  'arrow_downward': 'e5db',
	  'arrow_drop_down': 'e5c5',
	  'arrow_drop_down_circle': 'e5c6',
	  'arrow_drop_up': 'e5c7',
	  'arrow_forward': 'e5c8',
	  'arrow_upward': 'e5d8',
	  'art_track': 'e060',
	  'aspect_ratio': 'e85b',
	  'assessment': 'e85c',
	  'assignment': 'e85d',
	  'assignment_ind': 'e85e',
	  'assignment_late': 'e85f',
	  'assignment_return': 'e860',
	  'assignment_returned': 'e861',
	  'assignment_turned_in': 'e862',
	  'assistant': 'e39f',
	  'assistant_photo': 'e3a0',
	  'attach_file': 'e226',
	  'attach_money': 'e227',
	  'attachment': 'e2bc',
	  'audiotrack': 'e3a1',
	  'autorenew': 'e863',
	  'av_timer': 'e01b',
	  'backspace': 'e14a',
	  'backup': 'e864',
	  'battery_alert': 'e19c',
	  'battery_charging_full': 'e1a3',
	  'battery_full': 'e1a4',
	  'battery_std': 'e1a5',
	  'battery_unknown': 'e1a6',
	  'beach_access': 'eb3e',
	  'beenhere': 'e52d',
	  'block': 'e14b',
	  'bluetooth': 'e1a7',
	  'bluetooth_audio': 'e60f',
	  'bluetooth_connected': 'e1a8',
	  'bluetooth_disabled': 'e1a9',
	  'bluetooth_searching': 'e1aa',
	  'blur_circular': 'e3a2',
	  'blur_linear': 'e3a3',
	  'blur_off': 'e3a4',
	  'blur_on': 'e3a5',
	  'book': 'e865',
	  'bookmark': 'e866',
	  'bookmark_border': 'e867',
	  'border_all': 'e228',
	  'border_bottom': 'e229',
	  'border_clear': 'e22a',
	  'border_color': 'e22b',
	  'border_horizontal': 'e22c',
	  'border_inner': 'e22d',
	  'border_left': 'e22e',
	  'border_outer': 'e22f',
	  'border_right': 'e230',
	  'border_style': 'e231',
	  'border_top': 'e232',
	  'border_vertical': 'e233',
	  'branding_watermark': 'e06b',
	  'brightness_1': 'e3a6',
	  'brightness_2': 'e3a7',
	  'brightness_3': 'e3a8',
	  'brightness_4': 'e3a9',
	  'brightness_5': 'e3aa',
	  'brightness_6': 'e3ab',
	  'brightness_7': 'e3ac',
	  'brightness_auto': 'e1ab',
	  'brightness_high': 'e1ac',
	  'brightness_low': 'e1ad',
	  'brightness_medium': 'e1ae',
	  'broken_image': 'e3ad',
	  'brush': 'e3ae',
	  'bubble_chart': 'e6dd',
	  'bug_report': 'e868',
	  'build': 'e869',
	  'burst_mode': 'e43c',
	  'business': 'e0af',
	  'business_center': 'eb3f',
	  'cached': 'e86a',
	  'cake': 'e7e9',
	  'call': 'e0b0',
	  'call_end': 'e0b1',
	  'call_made': 'e0b2',
	  'call_merge': 'e0b3',
	  'call_missed': 'e0b4',
	  'call_missed_outgoing': 'e0e4',
	  'call_received': 'e0b5',
	  'call_split': 'e0b6',
	  'call_to_action': 'e06c',
	  'camera': 'e3af',
	  'camera_alt': 'e3b0',
	  'camera_enhance': 'e8fc',
	  'camera_front': 'e3b1',
	  'camera_rear': 'e3b2',
	  'camera_roll': 'e3b3',
	  'cancel': 'e5c9',
	  'card_giftcard': 'e8f6',
	  'card_membership': 'e8f7',
	  'card_travel': 'e8f8',
	  'casino': 'eb40',
	  'cast': 'e307',
	  'cast_connected': 'e308',
	  'center_focus_strong': 'e3b4',
	  'center_focus_weak': 'e3b5',
	  'change_history': 'e86b',
	  'chat': 'e0b7',
	  'chat_bubble': 'e0ca',
	  'chat_bubble_outline': 'e0cb',
	  'check': 'e5ca',
	  'check_box': 'e834',
	  'check_box_outline_blank': 'e835',
	  'check_circle': 'e86c',
	  'chevron_left': 'e5cb',
	  'chevron_right': 'e5cc',
	  'child_care': 'eb41',
	  'child_friendly': 'eb42',
	  'chrome_reader_mode': 'e86d',
	  'class': 'e86e',
	  'clear': 'e14c',
	  'clear_all': 'e0b8',
	  'close': 'e5cd',
	  'closed_caption': 'e01c',
	  'cloud': 'e2bd',
	  'cloud_circle': 'e2be',
	  'cloud_done': 'e2bf',
	  'cloud_download': 'e2c0',
	  'cloud_off': 'e2c1',
	  'cloud_queue': 'e2c2',
	  'cloud_upload': 'e2c3',
	  'code': 'e86f',
	  'collections': 'e3b6',
	  'collections_bookmark': 'e431',
	  'color_lens': 'e3b7',
	  'colorize': 'e3b8',
	  'comment': 'e0b9',
	  'compare': 'e3b9',
	  'compare_arrows': 'e915',
	  'computer': 'e30a',
	  'confirmation_number': 'e638',
	  'contact_mail': 'e0d0',
	  'contact_phone': 'e0cf',
	  'contacts': 'e0ba',
	  'content_copy': 'e14d',
	  'content_cut': 'e14e',
	  'content_paste': 'e14f',
	  'control_point': 'e3ba',
	  'control_point_duplicate': 'e3bb',
	  'copyright': 'e90c',
	  'create': 'e150',
	  'create_new_folder': 'e2cc',
	  'credit_card': 'e870',
	  'crop': 'e3be',
	  'crop_16_9': 'e3bc',
	  'crop_3_2': 'e3bd',
	  'crop_5_4': 'e3bf',
	  'crop_7_5': 'e3c0',
	  'crop_din': 'e3c1',
	  'crop_free': 'e3c2',
	  'crop_landscape': 'e3c3',
	  'crop_original': 'e3c4',
	  'crop_portrait': 'e3c5',
	  'crop_rotate': 'e437',
	  'crop_square': 'e3c6',
	  'dashboard': 'e871',
	  'data_usage': 'e1af',
	  'date_range': 'e916',
	  'dehaze': 'e3c7',
	  'delete': 'e872',
	  'delete_forever': 'e92b',
	  'delete_sweep': 'e16c',
	  'description': 'e873',
	  'desktop_mac': 'e30b',
	  'desktop_windows': 'e30c',
	  'details': 'e3c8',
	  'developer_board': 'e30d',
	  'developer_mode': 'e1b0',
	  'device_hub': 'e335',
	  'devices': 'e1b1',
	  'devices_other': 'e337',
	  'dialer_sip': 'e0bb',
	  'dialpad': 'e0bc',
	  'directions': 'e52e',
	  'directions_bike': 'e52f',
	  'directions_boat': 'e532',
	  'directions_bus': 'e530',
	  'directions_car': 'e531',
	  'directions_railway': 'e534',
	  'directions_run': 'e566',
	  'directions_subway': 'e533',
	  'directions_transit': 'e535',
	  'directions_walk': 'e536',
	  'disc_full': 'e610',
	  'dns': 'e875',
	  'do_not_disturb': 'e612',
	  'do_not_disturb_alt': 'e611',
	  'do_not_disturb_off': 'e643',
	  'do_not_disturb_on': 'e644',
	  'dock': 'e30e',
	  'domain': 'e7ee',
	  'done': 'e876',
	  'done_all': 'e877',
	  'donut_large': 'e917',
	  'donut_small': 'e918',
	  'drafts': 'e151',
	  'drag_handle': 'e25d',
	  'drive_eta': 'e613',
	  'dvr': 'e1b2',
	  'edit': 'e3c9',
	  'edit_location': 'e568',
	  'eject': 'e8fb',
	  'email': 'e0be',
	  'enhanced_encryption': 'e63f',
	  'equalizer': 'e01d',
	  'error': 'e000',
	  'error_outline': 'e001',
	  'euro_symbol': 'e926',
	  'ev_station': 'e56d',
	  'event': 'e878',
	  'event_available': 'e614',
	  'event_busy': 'e615',
	  'event_note': 'e616',
	  'event_seat': 'e903',
	  'exit_to_app': 'e879',
	  'expand_less': 'e5ce',
	  'expand_more': 'e5cf',
	  'explicit': 'e01e',
	  'explore': 'e87a',
	  'exposure': 'e3ca',
	  'exposure_neg_1': 'e3cb',
	  'exposure_neg_2': 'e3cc',
	  'exposure_plus_1': 'e3cd',
	  'exposure_plus_2': 'e3ce',
	  'exposure_zero': 'e3cf',
	  'extension': 'e87b',
	  'face': 'e87c',
	  'fast_forward': 'e01f',
	  'fast_rewind': 'e020',
	  'favorite': 'e87d',
	  'favorite_border': 'e87e',
	  'featured_play_list': 'e06d',
	  'featured_video': 'e06e',
	  'feedback': 'e87f',
	  'fiber_dvr': 'e05d',
	  'fiber_manual_record': 'e061',
	  'fiber_new': 'e05e',
	  'fiber_pin': 'e06a',
	  'fiber_smart_record': 'e062',
	  'file_download': 'e2c4',
	  'file_upload': 'e2c6',
	  'filter': 'e3d3',
	  'filter_1': 'e3d0',
	  'filter_2': 'e3d1',
	  'filter_3': 'e3d2',
	  'filter_4': 'e3d4',
	  'filter_5': 'e3d5',
	  'filter_6': 'e3d6',
	  'filter_7': 'e3d7',
	  'filter_8': 'e3d8',
	  'filter_9': 'e3d9',
	  'filter_9_plus': 'e3da',
	  'filter_b_and_w': 'e3db',
	  'filter_center_focus': 'e3dc',
	  'filter_drama': 'e3dd',
	  'filter_frames': 'e3de',
	  'filter_hdr': 'e3df',
	  'filter_list': 'e152',
	  'filter_none': 'e3e0',
	  'filter_tilt_shift': 'e3e2',
	  'filter_vintage': 'e3e3',
	  'find_in_page': 'e880',
	  'find_replace': 'e881',
	  'fingerprint': 'e90d',
	  'first_page': 'e5dc',
	  'fitness_center': 'eb43',
	  'flag': 'e153',
	  'flare': 'e3e4',
	  'flash_auto': 'e3e5',
	  'flash_off': 'e3e6',
	  'flash_on': 'e3e7',
	  'flight': 'e539',
	  'flight_land': 'e904',
	  'flight_takeoff': 'e905',
	  'flip': 'e3e8',
	  'flip_to_back': 'e882',
	  'flip_to_front': 'e883',
	  'folder': 'e2c7',
	  'folder_open': 'e2c8',
	  'folder_shared': 'e2c9',
	  'folder_special': 'e617',
	  'font_download': 'e167',
	  'format_align_center': 'e234',
	  'format_align_justify': 'e235',
	  'format_align_left': 'e236',
	  'format_align_right': 'e237',
	  'format_bold': 'e238',
	  'format_clear': 'e239',
	  'format_color_fill': 'e23a',
	  'format_color_reset': 'e23b',
	  'format_color_text': 'e23c',
	  'format_indent_decrease': 'e23d',
	  'format_indent_increase': 'e23e',
	  'format_italic': 'e23f',
	  'format_line_spacing': 'e240',
	  'format_list_bulleted': 'e241',
	  'format_list_numbered': 'e242',
	  'format_paint': 'e243',
	  'format_quote': 'e244',
	  'format_shapes': 'e25e',
	  'format_size': 'e245',
	  'format_strikethrough': 'e246',
	  'format_textdirection_l_to_r': 'e247',
	  'format_textdirection_r_to_l': 'e248',
	  'format_underlined': 'e249',
	  'forum': 'e0bf',
	  'forward': 'e154',
	  'forward_10': 'e056',
	  'forward_30': 'e057',
	  'forward_5': 'e058',
	  'free_breakfast': 'eb44',
	  'fullscreen': 'e5d0',
	  'fullscreen_exit': 'e5d1',
	  'functions': 'e24a',
	  'g_translate': 'e927',
	  'gamepad': 'e30f',
	  'games': 'e021',
	  'gavel': 'e90e',
	  'gesture': 'e155',
	  'get_app': 'e884',
	  'gif': 'e908',
	  'golf_course': 'eb45',
	  'gps_fixed': 'e1b3',
	  'gps_not_fixed': 'e1b4',
	  'gps_off': 'e1b5',
	  'grade': 'e885',
	  'gradient': 'e3e9',
	  'grain': 'e3ea',
	  'graphic_eq': 'e1b8',
	  'grid_off': 'e3eb',
	  'grid_on': 'e3ec',
	  'group': 'e7ef',
	  'group_add': 'e7f0',
	  'group_work': 'e886',
	  'hd': 'e052',
	  'hdr_off': 'e3ed',
	  'hdr_on': 'e3ee',
	  'hdr_strong': 'e3f1',
	  'hdr_weak': 'e3f2',
	  'headset': 'e310',
	  'headset_mic': 'e311',
	  'healing': 'e3f3',
	  'hearing': 'e023',
	  'help': 'e887',
	  'help_outline': 'e8fd',
	  'high_quality': 'e024',
	  'highlight': 'e25f',
	  'highlight_off': 'e888',
	  'history': 'e889',
	  'home': 'e88a',
	  'hot_tub': 'eb46',
	  'hotel': 'e53a',
	  'hourglass_empty': 'e88b',
	  'hourglass_full': 'e88c',
	  'http': 'e902',
	  'https': 'e88d',
	  'image': 'e3f4',
	  'image_aspect_ratio': 'e3f5',
	  'import_contacts': 'e0e0',
	  'import_export': 'e0c3',
	  'important_devices': 'e912',
	  'inbox': 'e156',
	  'indeterminate_check_box': 'e909',
	  'info': 'e88e',
	  'info_outline': 'e88f',
	  'input': 'e890',
	  'insert_chart': 'e24b',
	  'insert_comment': 'e24c',
	  'insert_drive_file': 'e24d',
	  'insert_emoticon': 'e24e',
	  'insert_invitation': 'e24f',
	  'insert_link': 'e250',
	  'insert_photo': 'e251',
	  'invert_colors': 'e891',
	  'invert_colors_off': 'e0c4',
	  'iso': 'e3f6',
	  'keyboard': 'e312',
	  'keyboard_arrow_down': 'e313',
	  'keyboard_arrow_left': 'e314',
	  'keyboard_arrow_right': 'e315',
	  'keyboard_arrow_up': 'e316',
	  'keyboard_backspace': 'e317',
	  'keyboard_capslock': 'e318',
	  'keyboard_hide': 'e31a',
	  'keyboard_return': 'e31b',
	  'keyboard_tab': 'e31c',
	  'keyboard_voice': 'e31d',
	  'kitchen': 'eb47',
	  'label': 'e892',
	  'label_outline': 'e893',
	  'landscape': 'e3f7',
	  'language': 'e894',
	  'laptop': 'e31e',
	  'laptop_chromebook': 'e31f',
	  'laptop_mac': 'e320',
	  'laptop_windows': 'e321',
	  'last_page': 'e5dd',
	  'launch': 'e895',
	  'layers': 'e53b',
	  'layers_clear': 'e53c',
	  'leak_add': 'e3f8',
	  'leak_remove': 'e3f9',
	  'lens': 'e3fa',
	  'library_add': 'e02e',
	  'library_books': 'e02f',
	  'library_music': 'e030',
	  'lightbulb_outline': 'e90f',
	  'line_style': 'e919',
	  'line_weight': 'e91a',
	  'linear_scale': 'e260',
	  'link': 'e157',
	  'linked_camera': 'e438',
	  'list': 'e896',
	  'live_help': 'e0c6',
	  'live_tv': 'e639',
	  'local_activity': 'e53f',
	  'local_airport': 'e53d',
	  'local_atm': 'e53e',
	  'local_bar': 'e540',
	  'local_cafe': 'e541',
	  'local_car_wash': 'e542',
	  'local_convenience_store': 'e543',
	  'local_dining': 'e556',
	  'local_drink': 'e544',
	  'local_florist': 'e545',
	  'local_gas_station': 'e546',
	  'local_grocery_store': 'e547',
	  'local_hospital': 'e548',
	  'local_hotel': 'e549',
	  'local_laundry_service': 'e54a',
	  'local_library': 'e54b',
	  'local_mall': 'e54c',
	  'local_movies': 'e54d',
	  'local_offer': 'e54e',
	  'local_parking': 'e54f',
	  'local_pharmacy': 'e550',
	  'local_phone': 'e551',
	  'local_pizza': 'e552',
	  'local_play': 'e553',
	  'local_post_office': 'e554',
	  'local_printshop': 'e555',
	  'local_see': 'e557',
	  'local_shipping': 'e558',
	  'local_taxi': 'e559',
	  'location_city': 'e7f1',
	  'location_disabled': 'e1b6',
	  'location_off': 'e0c7',
	  'location_on': 'e0c8',
	  'location_searching': 'e1b7',
	  'lock': 'e897',
	  'lock_open': 'e898',
	  'lock_outline': 'e899',
	  'looks': 'e3fc',
	  'looks_3': 'e3fb',
	  'looks_4': 'e3fd',
	  'looks_5': 'e3fe',
	  'looks_6': 'e3ff',
	  'looks_one': 'e400',
	  'looks_two': 'e401',
	  'loop': 'e028',
	  'loupe': 'e402',
	  'low_priority': 'e16d',
	  'loyalty': 'e89a',
	  'mail': 'e158',
	  'mail_outline': 'e0e1',
	  'map': 'e55b',
	  'markunread': 'e159',
	  'markunread_mailbox': 'e89b',
	  'memory': 'e322',
	  'menu': 'e5d2',
	  'merge_type': 'e252',
	  'message': 'e0c9',
	  'mic': 'e029',
	  'mic_none': 'e02a',
	  'mic_off': 'e02b',
	  'mms': 'e618',
	  'mode_comment': 'e253',
	  'mode_edit': 'e254',
	  'monetization_on': 'e263',
	  'money_off': 'e25c',
	  'monochrome_photos': 'e403',
	  'mood': 'e7f2',
	  'mood_bad': 'e7f3',
	  'more': 'e619',
	  'more_horiz': 'e5d3',
	  'more_vert': 'e5d4',
	  'motorcycle': 'e91b',
	  'mouse': 'e323',
	  'move_to_inbox': 'e168',
	  'movie': 'e02c',
	  'movie_creation': 'e404',
	  'movie_filter': 'e43a',
	  'multiline_chart': 'e6df',
	  'music_note': 'e405',
	  'music_video': 'e063',
	  'my_location': 'e55c',
	  'nature': 'e406',
	  'nature_people': 'e407',
	  'navigate_before': 'e408',
	  'navigate_next': 'e409',
	  'navigation': 'e55d',
	  'near_me': 'e569',
	  'network_cell': 'e1b9',
	  'network_check': 'e640',
	  'network_locked': 'e61a',
	  'network_wifi': 'e1ba',
	  'new_releases': 'e031',
	  'next_week': 'e16a',
	  'nfc': 'e1bb',
	  'no_encryption': 'e641',
	  'no_sim': 'e0cc',
	  'not_interested': 'e033',
	  'note': 'e06f',
	  'note_add': 'e89c',
	  'notifications': 'e7f4',
	  'notifications_active': 'e7f7',
	  'notifications_none': 'e7f5',
	  'notifications_off': 'e7f6',
	  'notifications_paused': 'e7f8',
	  'offline_pin': 'e90a',
	  'ondemand_video': 'e63a',
	  'opacity': 'e91c',
	  'open_in_browser': 'e89d',
	  'open_in_new': 'e89e',
	  'open_with': 'e89f',
	  'pages': 'e7f9',
	  'pageview': 'e8a0',
	  'palette': 'e40a',
	  'pan_tool': 'e925',
	  'panorama': 'e40b',
	  'panorama_fish_eye': 'e40c',
	  'panorama_horizontal': 'e40d',
	  'panorama_vertical': 'e40e',
	  'panorama_wide_angle': 'e40f',
	  'party_mode': 'e7fa',
	  'pause': 'e034',
	  'pause_circle_filled': 'e035',
	  'pause_circle_outline': 'e036',
	  'payment': 'e8a1',
	  'people': 'e7fb',
	  'people_outline': 'e7fc',
	  'perm_camera_mic': 'e8a2',
	  'perm_contact_calendar': 'e8a3',
	  'perm_data_setting': 'e8a4',
	  'perm_device_information': 'e8a5',
	  'perm_identity': 'e8a6',
	  'perm_media': 'e8a7',
	  'perm_phone_msg': 'e8a8',
	  'perm_scan_wifi': 'e8a9',
	  'person': 'e7fd',
	  'person_add': 'e7fe',
	  'person_outline': 'e7ff',
	  'person_pin': 'e55a',
	  'person_pin_circle': 'e56a',
	  'personal_video': 'e63b',
	  'pets': 'e91d',
	  'phone': 'e0cd',
	  'phone_android': 'e324',
	  'phone_bluetooth_speaker': 'e61b',
	  'phone_forwarded': 'e61c',
	  'phone_in_talk': 'e61d',
	  'phone_iphone': 'e325',
	  'phone_locked': 'e61e',
	  'phone_missed': 'e61f',
	  'phone_paused': 'e620',
	  'phonelink': 'e326',
	  'phonelink_erase': 'e0db',
	  'phonelink_lock': 'e0dc',
	  'phonelink_off': 'e327',
	  'phonelink_ring': 'e0dd',
	  'phonelink_setup': 'e0de',
	  'photo': 'e410',
	  'photo_album': 'e411',
	  'photo_camera': 'e412',
	  'photo_filter': 'e43b',
	  'photo_library': 'e413',
	  'photo_size_select_actual': 'e432',
	  'photo_size_select_large': 'e433',
	  'photo_size_select_small': 'e434',
	  'picture_as_pdf': 'e415',
	  'picture_in_picture': 'e8aa',
	  'picture_in_picture_alt': 'e911',
	  'pie_chart': 'e6c4',
	  'pie_chart_outlined': 'e6c5',
	  'pin_drop': 'e55e',
	  'place': 'e55f',
	  'play_arrow': 'e037',
	  'play_circle_filled': 'e038',
	  'play_circle_outline': 'e039',
	  'play_for_work': 'e906',
	  'playlist_add': 'e03b',
	  'playlist_add_check': 'e065',
	  'playlist_play': 'e05f',
	  'plus_one': 'e800',
	  'poll': 'e801',
	  'polymer': 'e8ab',
	  'pool': 'eb48',
	  'portable_wifi_off': 'e0ce',
	  'portrait': 'e416',
	  'power': 'e63c',
	  'power_input': 'e336',
	  'power_settings_new': 'e8ac',
	  'pregnant_woman': 'e91e',
	  'present_to_all': 'e0df',
	  'print': 'e8ad',
	  'priority_high': 'e645',
	  'public': 'e80b',
	  'publish': 'e255',
	  'query_builder': 'e8ae',
	  'question_answer': 'e8af',
	  'queue': 'e03c',
	  'queue_music': 'e03d',
	  'queue_play_next': 'e066',
	  'radio': 'e03e',
	  'radio_button_checked': 'e837',
	  'radio_button_unchecked': 'e836',
	  'rate_review': 'e560',
	  'receipt': 'e8b0',
	  'recent_actors': 'e03f',
	  'record_voice_over': 'e91f',
	  'redeem': 'e8b1',
	  'redo': 'e15a',
	  'refresh': 'e5d5',
	  'remove': 'e15b',
	  'remove_circle': 'e15c',
	  'remove_circle_outline': 'e15d',
	  'remove_from_queue': 'e067',
	  'remove_red_eye': 'e417',
	  'remove_shopping_cart': 'e928',
	  'reorder': 'e8fe',
	  'repeat': 'e040',
	  'repeat_one': 'e041',
	  'replay': 'e042',
	  'replay_10': 'e059',
	  'replay_30': 'e05a',
	  'replay_5': 'e05b',
	  'reply': 'e15e',
	  'reply_all': 'e15f',
	  'report': 'e160',
	  'report_problem': 'e8b2',
	  'restaurant': 'e56c',
	  'restaurant_menu': 'e561',
	  'restore': 'e8b3',
	  'restore_page': 'e929',
	  'ring_volume': 'e0d1',
	  'room': 'e8b4',
	  'room_service': 'eb49',
	  'rotate_90_degrees_ccw': 'e418',
	  'rotate_left': 'e419',
	  'rotate_right': 'e41a',
	  'rounded_corner': 'e920',
	  'router': 'e328',
	  'rowing': 'e921',
	  'rss_feed': 'e0e5',
	  'rv_hookup': 'e642',
	  'satellite': 'e562',
	  'save': 'e161',
	  'scanner': 'e329',
	  'schedule': 'e8b5',
	  'school': 'e80c',
	  'screen_lock_landscape': 'e1be',
	  'screen_lock_portrait': 'e1bf',
	  'screen_lock_rotation': 'e1c0',
	  'screen_rotation': 'e1c1',
	  'screen_share': 'e0e2',
	  'sd_card': 'e623',
	  'sd_storage': 'e1c2',
	  'search': 'e8b6',
	  'security': 'e32a',
	  'select_all': 'e162',
	  'send': 'e163',
	  'sentiment_dissatisfied': 'e811',
	  'sentiment_neutral': 'e812',
	  'sentiment_satisfied': 'e813',
	  'sentiment_very_dissatisfied': 'e814',
	  'sentiment_very_satisfied': 'e815',
	  'settings': 'e8b8',
	  'settings_applications': 'e8b9',
	  'settings_backup_restore': 'e8ba',
	  'settings_bluetooth': 'e8bb',
	  'settings_brightness': 'e8bd',
	  'settings_cell': 'e8bc',
	  'settings_ethernet': 'e8be',
	  'settings_input_antenna': 'e8bf',
	  'settings_input_component': 'e8c0',
	  'settings_input_composite': 'e8c1',
	  'settings_input_hdmi': 'e8c2',
	  'settings_input_svideo': 'e8c3',
	  'settings_overscan': 'e8c4',
	  'settings_phone': 'e8c5',
	  'settings_power': 'e8c6',
	  'settings_remote': 'e8c7',
	  'settings_system_daydream': 'e1c3',
	  'settings_voice': 'e8c8',
	  'share': 'e80d',
	  'shop': 'e8c9',
	  'shop_two': 'e8ca',
	  'shopping_basket': 'e8cb',
	  'shopping_cart': 'e8cc',
	  'short_text': 'e261',
	  'show_chart': 'e6e1',
	  'shuffle': 'e043',
	  'signal_cellular_4_bar': 'e1c8',
	  'signal_cellular_connected_no_internet_4_bar': 'e1cd',
	  'signal_cellular_no_sim': 'e1ce',
	  'signal_cellular_null': 'e1cf',
	  'signal_cellular_off': 'e1d0',
	  'signal_wifi_4_bar': 'e1d8',
	  'signal_wifi_4_bar_lock': 'e1d9',
	  'signal_wifi_off': 'e1da',
	  'sim_card': 'e32b',
	  'sim_card_alert': 'e624',
	  'skip_next': 'e044',
	  'skip_previous': 'e045',
	  'slideshow': 'e41b',
	  'slow_motion_video': 'e068',
	  'smartphone': 'e32c',
	  'smoke_free': 'eb4a',
	  'smoking_rooms': 'eb4b',
	  'sms': 'e625',
	  'sms_failed': 'e626',
	  'snooze': 'e046',
	  'sort': 'e164',
	  'sort_by_alpha': 'e053',
	  'spa': 'eb4c',
	  'space_bar': 'e256',
	  'speaker': 'e32d',
	  'speaker_group': 'e32e',
	  'speaker_notes': 'e8cd',
	  'speaker_notes_off': 'e92a',
	  'speaker_phone': 'e0d2',
	  'spellcheck': 'e8ce',
	  'star': 'e838',
	  'star_border': 'e83a',
	  'star_half': 'e839',
	  'stars': 'e8d0',
	  'stay_current_landscape': 'e0d3',
	  'stay_current_portrait': 'e0d4',
	  'stay_primary_landscape': 'e0d5',
	  'stay_primary_portrait': 'e0d6',
	  'stop': 'e047',
	  'stop_screen_share': 'e0e3',
	  'storage': 'e1db',
	  'store': 'e8d1',
	  'store_mall_directory': 'e563',
	  'straighten': 'e41c',
	  'streetview': 'e56e',
	  'strikethrough_s': 'e257',
	  'style': 'e41d',
	  'subdirectory_arrow_left': 'e5d9',
	  'subdirectory_arrow_right': 'e5da',
	  'subject': 'e8d2',
	  'subscriptions': 'e064',
	  'subtitles': 'e048',
	  'subway': 'e56f',
	  'supervisor_account': 'e8d3',
	  'surround_sound': 'e049',
	  'swap_calls': 'e0d7',
	  'swap_horiz': 'e8d4',
	  'swap_vert': 'e8d5',
	  'swap_vertical_circle': 'e8d6',
	  'switch_camera': 'e41e',
	  'switch_video': 'e41f',
	  'sync': 'e627',
	  'sync_disabled': 'e628',
	  'sync_problem': 'e629',
	  'system_update': 'e62a',
	  'system_update_alt': 'e8d7',
	  'tab': 'e8d8',
	  'tab_unselected': 'e8d9',
	  'tablet': 'e32f',
	  'tablet_android': 'e330',
	  'tablet_mac': 'e331',
	  'tag_faces': 'e420',
	  'tap_and_play': 'e62b',
	  'terrain': 'e564',
	  'text_fields': 'e262',
	  'text_format': 'e165',
	  'textsms': 'e0d8',
	  'texture': 'e421',
	  'theaters': 'e8da',
	  'thumb_down': 'e8db',
	  'thumb_up': 'e8dc',
	  'thumbs_up_down': 'e8dd',
	  'time_to_leave': 'e62c',
	  'timelapse': 'e422',
	  'timeline': 'e922',
	  'timer': 'e425',
	  'timer_10': 'e423',
	  'timer_3': 'e424',
	  'timer_off': 'e426',
	  'title': 'e264',
	  'toc': 'e8de',
	  'today': 'e8df',
	  'toll': 'e8e0',
	  'tonality': 'e427',
	  'touch_app': 'e913',
	  'toys': 'e332',
	  'track_changes': 'e8e1',
	  'traffic': 'e565',
	  'train': 'e570',
	  'tram': 'e571',
	  'transfer_within_a_station': 'e572',
	  'transform': 'e428',
	  'translate': 'e8e2',
	  'trending_down': 'e8e3',
	  'trending_flat': 'e8e4',
	  'trending_up': 'e8e5',
	  'tune': 'e429',
	  'turned_in': 'e8e6',
	  'turned_in_not': 'e8e7',
	  'tv': 'e333',
	  'unarchive': 'e169',
	  'undo': 'e166',
	  'unfold_less': 'e5d6',
	  'unfold_more': 'e5d7',
	  'update': 'e923',
	  'usb': 'e1e0',
	  'verified_user': 'e8e8',
	  'vertical_align_bottom': 'e258',
	  'vertical_align_center': 'e259',
	  'vertical_align_top': 'e25a',
	  'vibration': 'e62d',
	  'video_call': 'e070',
	  'video_label': 'e071',
	  'video_library': 'e04a',
	  'videocam': 'e04b',
	  'videocam_off': 'e04c',
	  'videogame_asset': 'e338',
	  'view_agenda': 'e8e9',
	  'view_array': 'e8ea',
	  'view_carousel': 'e8eb',
	  'view_column': 'e8ec',
	  'view_comfy': 'e42a',
	  'view_compact': 'e42b',
	  'view_day': 'e8ed',
	  'view_headline': 'e8ee',
	  'view_list': 'e8ef',
	  'view_module': 'e8f0',
	  'view_quilt': 'e8f1',
	  'view_stream': 'e8f2',
	  'view_week': 'e8f3',
	  'vignette': 'e435',
	  'visibility': 'e8f4',
	  'visibility_off': 'e8f5',
	  'voice_chat': 'e62e',
	  'voicemail': 'e0d9',
	  'volume_down': 'e04d',
	  'volume_mute': 'e04e',
	  'volume_off': 'e04f',
	  'volume_up': 'e050',
	  'vpn_key': 'e0da',
	  'vpn_lock': 'e62f',
	  'wallpaper': 'e1bc',
	  'warning': 'e002',
	  'watch': 'e334',
	  'watch_later': 'e924',
	  'wb_auto': 'e42c',
	  'wb_cloudy': 'e42d',
	  'wb_incandescent': 'e42e',
	  'wb_iridescent': 'e436',
	  'wb_sunny': 'e430',
	  'wc': 'e63d',
	  'web': 'e051',
	  'web_asset': 'e069',
	  'weekend': 'e16b',
	  'whatshot': 'e80e',
	  'widgets': 'e1bd',
	  'wifi': 'e63e',
	  'wifi_lock': 'e1e1',
	  'wifi_tethering': 'e1e2',
	  'work': 'e8f9',
	  'wrap_text': 'e25b',
	  'youtube_searched_for': 'e8fa',
	  'zoom_in': 'e8ff',
	  'zoom_out': 'e900',
	  'zoom_out_map': 'e56b'
	};

	exports.default = icons;

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * assign-deep <https://github.com/jonschlinkert/assign-deep>
	 *
	 * Copyright (c) 2015, Jon Schlinkert.
	 * Licensed under the MIT License.
	 */

	'use strict';

	var isPrimitive = __webpack_require__(7);
	var assignSymbols = __webpack_require__(8);
	var typeOf = __webpack_require__(9);

	function assign(target/*, objects*/) {
	  target = target || {};
	  var len = arguments.length, i = 0;
	  if (len === 1) {
	    return target;
	  }
	  while (++i < len) {
	    var val = arguments[i];
	    if (isPrimitive(target)) {
	      target = val;
	    }
	    if (isObject(val)) {
	      extend(target, val);
	    }
	  }
	  return target;
	}

	/**
	 * Shallow extend
	 */

	function extend(target, obj) {
	  assignSymbols(target, obj);

	  for (var key in obj) {
	    if (hasOwn(obj, key)) {
	      var val = obj[key];
	      if (isObject(val)) {
	        if (typeOf(target[key]) === 'undefined' && typeOf(val) === 'function') {
	          target[key] = val;
	        }
	        target[key] = assign(target[key] || {}, val);
	      } else {
	        target[key] = val;
	      }
	    }
	  }
	  return target;
	}

	/**
	 * Returns true if the object is a plain object or a function.
	 */

	function isObject(obj) {
	  return typeOf(obj) === 'object' || typeOf(obj) === 'function';
	}

	/**
	 * Returns true if the given `key` is an own property of `obj`.
	 */

	function hasOwn(obj, key) {
	  return Object.prototype.hasOwnProperty.call(obj, key);
	}

	/**
	 * Expose `assign`
	 */

	module.exports = assign;


/***/ },
/* 7 */
/***/ function(module, exports) {

	/*!
	 * is-primitive <https://github.com/jonschlinkert/is-primitive>
	 *
	 * Copyright (c) 2014-2015, Jon Schlinkert.
	 * Licensed under the MIT License.
	 */

	'use strict';

	// see http://jsperf.com/testing-value-is-primitive/7
	module.exports = function isPrimitive(value) {
	  return value == null || (typeof value !== 'function' && typeof value !== 'object');
	};


/***/ },
/* 8 */
/***/ function(module, exports) {

	/*!
	 * assign-symbols <https://github.com/jonschlinkert/assign-symbols>
	 *
	 * Copyright (c) 2015, Jon Schlinkert.
	 * Licensed under the MIT License.
	 */

	'use strict';

	module.exports = function(receiver, objects) {
	  if (receiver === null || typeof receiver === 'undefined') {
	    throw new TypeError('expected first argument to be an object.');
	  }

	  if (typeof objects === 'undefined' || typeof Symbol === 'undefined') {
	    return receiver;
	  }

	  if (typeof Object.getOwnPropertySymbols !== 'function') {
	    return receiver;
	  }

	  var isEnumerable = Object.prototype.propertyIsEnumerable;
	  var target = Object(receiver);
	  var len = arguments.length, i = 0;

	  while (++i < len) {
	    var provider = Object(arguments[i]);
	    var names = Object.getOwnPropertySymbols(provider);

	    for (var j = 0; j < names.length; j++) {
	      var key = names[j];

	      if (isEnumerable.call(provider, key)) {
	        target[key] = provider[key];
	      }
	    }
	  }
	  return target;
	};


/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(Buffer) {var isBuffer = __webpack_require__(14);
	var toString = Object.prototype.toString;

	/**
	 * Get the native `typeof` a value.
	 *
	 * @param  {*} `val`
	 * @return {*} Native javascript type
	 */

	module.exports = function kindOf(val) {
	  // primitivies
	  if (typeof val === 'undefined') {
	    return 'undefined';
	  }
	  if (val === null) {
	    return 'null';
	  }
	  if (val === true || val === false || val instanceof Boolean) {
	    return 'boolean';
	  }
	  if (typeof val === 'string' || val instanceof String) {
	    return 'string';
	  }
	  if (typeof val === 'number' || val instanceof Number) {
	    return 'number';
	  }

	  // functions
	  if (typeof val === 'function' || val instanceof Function) {
	    return 'function';
	  }

	  // array
	  if (typeof Array.isArray !== 'undefined' && Array.isArray(val)) {
	    return 'array';
	  }

	  // check for instances of RegExp and Date before calling `toString`
	  if (val instanceof RegExp) {
	    return 'regexp';
	  }
	  if (val instanceof Date) {
	    return 'date';
	  }

	  // other objects
	  var type = toString.call(val);

	  if (type === '[object RegExp]') {
	    return 'regexp';
	  }
	  if (type === '[object Date]') {
	    return 'date';
	  }
	  if (type === '[object Arguments]') {
	    return 'arguments';
	  }

	  // buffer
	  if (typeof Buffer !== 'undefined' && isBuffer(val)) {
	    return 'buffer';
	  }

	  // es6: Map, WeakMap, Set, WeakSet
	  if (type === '[object Set]') {
	    return 'set';
	  }
	  if (type === '[object WeakSet]') {
	    return 'weakset';
	  }
	  if (type === '[object Map]') {
	    return 'map';
	  }
	  if (type === '[object WeakMap]') {
	    return 'weakmap';
	  }
	  if (type === '[object Symbol]') {
	    return 'symbol';
	  }

	  // typed arrays
	  if (type === '[object Int8Array]') {
	    return 'int8array';
	  }
	  if (type === '[object Uint8Array]') {
	    return 'uint8array';
	  }
	  if (type === '[object Uint8ClampedArray]') {
	    return 'uint8clampedarray';
	  }
	  if (type === '[object Int16Array]') {
	    return 'int16array';
	  }
	  if (type === '[object Uint16Array]') {
	    return 'uint16array';
	  }
	  if (type === '[object Int32Array]') {
	    return 'int32array';
	  }
	  if (type === '[object Uint32Array]') {
	    return 'uint32array';
	  }
	  if (type === '[object Float32Array]') {
	    return 'float32array';
	  }
	  if (type === '[object Float64Array]') {
	    return 'float64array';
	  }

	  // must be a plain object
	  return 'object';
	};

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(10).Buffer))

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(Buffer, global) {/*!
	 * The buffer module from node.js, for the browser.
	 *
	 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
	 * @license  MIT
	 */
	/* eslint-disable no-proto */

	'use strict'

	var base64 = __webpack_require__(11)
	var ieee754 = __webpack_require__(12)
	var isArray = __webpack_require__(13)

	exports.Buffer = Buffer
	exports.SlowBuffer = SlowBuffer
	exports.INSPECT_MAX_BYTES = 50
	Buffer.poolSize = 8192 // not used by this implementation

	var rootParent = {}

	/**
	 * If `Buffer.TYPED_ARRAY_SUPPORT`:
	 *   === true    Use Uint8Array implementation (fastest)
	 *   === false   Use Object implementation (most compatible, even IE6)
	 *
	 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
	 * Opera 11.6+, iOS 4.2+.
	 *
	 * Due to various browser bugs, sometimes the Object implementation will be used even
	 * when the browser supports typed arrays.
	 *
	 * Note:
	 *
	 *   - Firefox 4-29 lacks support for adding new properties to `Uint8Array` instances,
	 *     See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
	 *
	 *   - Safari 5-7 lacks support for changing the `Object.prototype.constructor` property
	 *     on objects.
	 *
	 *   - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
	 *
	 *   - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
	 *     incorrect length in some situations.

	 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they
	 * get the Object implementation, which is slower but behaves correctly.
	 */
	Buffer.TYPED_ARRAY_SUPPORT = global.TYPED_ARRAY_SUPPORT !== undefined
	  ? global.TYPED_ARRAY_SUPPORT
	  : typedArraySupport()

	function typedArraySupport () {
	  function Bar () {}
	  try {
	    var arr = new Uint8Array(1)
	    arr.foo = function () { return 42 }
	    arr.constructor = Bar
	    return arr.foo() === 42 && // typed array instances can be augmented
	        arr.constructor === Bar && // constructor can be set
	        typeof arr.subarray === 'function' && // chrome 9-10 lack `subarray`
	        arr.subarray(1, 1).byteLength === 0 // ie10 has broken `subarray`
	  } catch (e) {
	    return false
	  }
	}

	function kMaxLength () {
	  return Buffer.TYPED_ARRAY_SUPPORT
	    ? 0x7fffffff
	    : 0x3fffffff
	}

	/**
	 * Class: Buffer
	 * =============
	 *
	 * The Buffer constructor returns instances of `Uint8Array` that are augmented
	 * with function properties for all the node `Buffer` API functions. We use
	 * `Uint8Array` so that square bracket notation works as expected -- it returns
	 * a single octet.
	 *
	 * By augmenting the instances, we can avoid modifying the `Uint8Array`
	 * prototype.
	 */
	function Buffer (arg) {
	  if (!(this instanceof Buffer)) {
	    // Avoid going through an ArgumentsAdaptorTrampoline in the common case.
	    if (arguments.length > 1) return new Buffer(arg, arguments[1])
	    return new Buffer(arg)
	  }

	  if (!Buffer.TYPED_ARRAY_SUPPORT) {
	    this.length = 0
	    this.parent = undefined
	  }

	  // Common case.
	  if (typeof arg === 'number') {
	    return fromNumber(this, arg)
	  }

	  // Slightly less common case.
	  if (typeof arg === 'string') {
	    return fromString(this, arg, arguments.length > 1 ? arguments[1] : 'utf8')
	  }

	  // Unusual.
	  return fromObject(this, arg)
	}

	function fromNumber (that, length) {
	  that = allocate(that, length < 0 ? 0 : checked(length) | 0)
	  if (!Buffer.TYPED_ARRAY_SUPPORT) {
	    for (var i = 0; i < length; i++) {
	      that[i] = 0
	    }
	  }
	  return that
	}

	function fromString (that, string, encoding) {
	  if (typeof encoding !== 'string' || encoding === '') encoding = 'utf8'

	  // Assumption: byteLength() return value is always < kMaxLength.
	  var length = byteLength(string, encoding) | 0
	  that = allocate(that, length)

	  that.write(string, encoding)
	  return that
	}

	function fromObject (that, object) {
	  if (Buffer.isBuffer(object)) return fromBuffer(that, object)

	  if (isArray(object)) return fromArray(that, object)

	  if (object == null) {
	    throw new TypeError('must start with number, buffer, array or string')
	  }

	  if (typeof ArrayBuffer !== 'undefined') {
	    if (object.buffer instanceof ArrayBuffer) {
	      return fromTypedArray(that, object)
	    }
	    if (object instanceof ArrayBuffer) {
	      return fromArrayBuffer(that, object)
	    }
	  }

	  if (object.length) return fromArrayLike(that, object)

	  return fromJsonObject(that, object)
	}

	function fromBuffer (that, buffer) {
	  var length = checked(buffer.length) | 0
	  that = allocate(that, length)
	  buffer.copy(that, 0, 0, length)
	  return that
	}

	function fromArray (that, array) {
	  var length = checked(array.length) | 0
	  that = allocate(that, length)
	  for (var i = 0; i < length; i += 1) {
	    that[i] = array[i] & 255
	  }
	  return that
	}

	// Duplicate of fromArray() to keep fromArray() monomorphic.
	function fromTypedArray (that, array) {
	  var length = checked(array.length) | 0
	  that = allocate(that, length)
	  // Truncating the elements is probably not what people expect from typed
	  // arrays with BYTES_PER_ELEMENT > 1 but it's compatible with the behavior
	  // of the old Buffer constructor.
	  for (var i = 0; i < length; i += 1) {
	    that[i] = array[i] & 255
	  }
	  return that
	}

	function fromArrayBuffer (that, array) {
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    // Return an augmented `Uint8Array` instance, for best performance
	    array.byteLength
	    that = Buffer._augment(new Uint8Array(array))
	  } else {
	    // Fallback: Return an object instance of the Buffer class
	    that = fromTypedArray(that, new Uint8Array(array))
	  }
	  return that
	}

	function fromArrayLike (that, array) {
	  var length = checked(array.length) | 0
	  that = allocate(that, length)
	  for (var i = 0; i < length; i += 1) {
	    that[i] = array[i] & 255
	  }
	  return that
	}

	// Deserialize { type: 'Buffer', data: [1,2,3,...] } into a Buffer object.
	// Returns a zero-length buffer for inputs that don't conform to the spec.
	function fromJsonObject (that, object) {
	  var array
	  var length = 0

	  if (object.type === 'Buffer' && isArray(object.data)) {
	    array = object.data
	    length = checked(array.length) | 0
	  }
	  that = allocate(that, length)

	  for (var i = 0; i < length; i += 1) {
	    that[i] = array[i] & 255
	  }
	  return that
	}

	if (Buffer.TYPED_ARRAY_SUPPORT) {
	  Buffer.prototype.__proto__ = Uint8Array.prototype
	  Buffer.__proto__ = Uint8Array
	} else {
	  // pre-set for values that may exist in the future
	  Buffer.prototype.length = undefined
	  Buffer.prototype.parent = undefined
	}

	function allocate (that, length) {
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    // Return an augmented `Uint8Array` instance, for best performance
	    that = Buffer._augment(new Uint8Array(length))
	    that.__proto__ = Buffer.prototype
	  } else {
	    // Fallback: Return an object instance of the Buffer class
	    that.length = length
	    that._isBuffer = true
	  }

	  var fromPool = length !== 0 && length <= Buffer.poolSize >>> 1
	  if (fromPool) that.parent = rootParent

	  return that
	}

	function checked (length) {
	  // Note: cannot use `length < kMaxLength` here because that fails when
	  // length is NaN (which is otherwise coerced to zero.)
	  if (length >= kMaxLength()) {
	    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
	                         'size: 0x' + kMaxLength().toString(16) + ' bytes')
	  }
	  return length | 0
	}

	function SlowBuffer (subject, encoding) {
	  if (!(this instanceof SlowBuffer)) return new SlowBuffer(subject, encoding)

	  var buf = new Buffer(subject, encoding)
	  delete buf.parent
	  return buf
	}

	Buffer.isBuffer = function isBuffer (b) {
	  return !!(b != null && b._isBuffer)
	}

	Buffer.compare = function compare (a, b) {
	  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
	    throw new TypeError('Arguments must be Buffers')
	  }

	  if (a === b) return 0

	  var x = a.length
	  var y = b.length

	  var i = 0
	  var len = Math.min(x, y)
	  while (i < len) {
	    if (a[i] !== b[i]) break

	    ++i
	  }

	  if (i !== len) {
	    x = a[i]
	    y = b[i]
	  }

	  if (x < y) return -1
	  if (y < x) return 1
	  return 0
	}

	Buffer.isEncoding = function isEncoding (encoding) {
	  switch (String(encoding).toLowerCase()) {
	    case 'hex':
	    case 'utf8':
	    case 'utf-8':
	    case 'ascii':
	    case 'binary':
	    case 'base64':
	    case 'raw':
	    case 'ucs2':
	    case 'ucs-2':
	    case 'utf16le':
	    case 'utf-16le':
	      return true
	    default:
	      return false
	  }
	}

	Buffer.concat = function concat (list, length) {
	  if (!isArray(list)) throw new TypeError('list argument must be an Array of Buffers.')

	  if (list.length === 0) {
	    return new Buffer(0)
	  }

	  var i
	  if (length === undefined) {
	    length = 0
	    for (i = 0; i < list.length; i++) {
	      length += list[i].length
	    }
	  }

	  var buf = new Buffer(length)
	  var pos = 0
	  for (i = 0; i < list.length; i++) {
	    var item = list[i]
	    item.copy(buf, pos)
	    pos += item.length
	  }
	  return buf
	}

	function byteLength (string, encoding) {
	  if (typeof string !== 'string') string = '' + string

	  var len = string.length
	  if (len === 0) return 0

	  // Use a for loop to avoid recursion
	  var loweredCase = false
	  for (;;) {
	    switch (encoding) {
	      case 'ascii':
	      case 'binary':
	      // Deprecated
	      case 'raw':
	      case 'raws':
	        return len
	      case 'utf8':
	      case 'utf-8':
	        return utf8ToBytes(string).length
	      case 'ucs2':
	      case 'ucs-2':
	      case 'utf16le':
	      case 'utf-16le':
	        return len * 2
	      case 'hex':
	        return len >>> 1
	      case 'base64':
	        return base64ToBytes(string).length
	      default:
	        if (loweredCase) return utf8ToBytes(string).length // assume utf8
	        encoding = ('' + encoding).toLowerCase()
	        loweredCase = true
	    }
	  }
	}
	Buffer.byteLength = byteLength

	function slowToString (encoding, start, end) {
	  var loweredCase = false

	  start = start | 0
	  end = end === undefined || end === Infinity ? this.length : end | 0

	  if (!encoding) encoding = 'utf8'
	  if (start < 0) start = 0
	  if (end > this.length) end = this.length
	  if (end <= start) return ''

	  while (true) {
	    switch (encoding) {
	      case 'hex':
	        return hexSlice(this, start, end)

	      case 'utf8':
	      case 'utf-8':
	        return utf8Slice(this, start, end)

	      case 'ascii':
	        return asciiSlice(this, start, end)

	      case 'binary':
	        return binarySlice(this, start, end)

	      case 'base64':
	        return base64Slice(this, start, end)

	      case 'ucs2':
	      case 'ucs-2':
	      case 'utf16le':
	      case 'utf-16le':
	        return utf16leSlice(this, start, end)

	      default:
	        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
	        encoding = (encoding + '').toLowerCase()
	        loweredCase = true
	    }
	  }
	}

	Buffer.prototype.toString = function toString () {
	  var length = this.length | 0
	  if (length === 0) return ''
	  if (arguments.length === 0) return utf8Slice(this, 0, length)
	  return slowToString.apply(this, arguments)
	}

	Buffer.prototype.equals = function equals (b) {
	  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
	  if (this === b) return true
	  return Buffer.compare(this, b) === 0
	}

	Buffer.prototype.inspect = function inspect () {
	  var str = ''
	  var max = exports.INSPECT_MAX_BYTES
	  if (this.length > 0) {
	    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
	    if (this.length > max) str += ' ... '
	  }
	  return '<Buffer ' + str + '>'
	}

	Buffer.prototype.compare = function compare (b) {
	  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
	  if (this === b) return 0
	  return Buffer.compare(this, b)
	}

	Buffer.prototype.indexOf = function indexOf (val, byteOffset) {
	  if (byteOffset > 0x7fffffff) byteOffset = 0x7fffffff
	  else if (byteOffset < -0x80000000) byteOffset = -0x80000000
	  byteOffset >>= 0

	  if (this.length === 0) return -1
	  if (byteOffset >= this.length) return -1

	  // Negative offsets start from the end of the buffer
	  if (byteOffset < 0) byteOffset = Math.max(this.length + byteOffset, 0)

	  if (typeof val === 'string') {
	    if (val.length === 0) return -1 // special case: looking for empty string always fails
	    return String.prototype.indexOf.call(this, val, byteOffset)
	  }
	  if (Buffer.isBuffer(val)) {
	    return arrayIndexOf(this, val, byteOffset)
	  }
	  if (typeof val === 'number') {
	    if (Buffer.TYPED_ARRAY_SUPPORT && Uint8Array.prototype.indexOf === 'function') {
	      return Uint8Array.prototype.indexOf.call(this, val, byteOffset)
	    }
	    return arrayIndexOf(this, [ val ], byteOffset)
	  }

	  function arrayIndexOf (arr, val, byteOffset) {
	    var foundIndex = -1
	    for (var i = 0; byteOffset + i < arr.length; i++) {
	      if (arr[byteOffset + i] === val[foundIndex === -1 ? 0 : i - foundIndex]) {
	        if (foundIndex === -1) foundIndex = i
	        if (i - foundIndex + 1 === val.length) return byteOffset + foundIndex
	      } else {
	        foundIndex = -1
	      }
	    }
	    return -1
	  }

	  throw new TypeError('val must be string, number or Buffer')
	}

	// `get` is deprecated
	Buffer.prototype.get = function get (offset) {
	  console.log('.get() is deprecated. Access using array indexes instead.')
	  return this.readUInt8(offset)
	}

	// `set` is deprecated
	Buffer.prototype.set = function set (v, offset) {
	  console.log('.set() is deprecated. Access using array indexes instead.')
	  return this.writeUInt8(v, offset)
	}

	function hexWrite (buf, string, offset, length) {
	  offset = Number(offset) || 0
	  var remaining = buf.length - offset
	  if (!length) {
	    length = remaining
	  } else {
	    length = Number(length)
	    if (length > remaining) {
	      length = remaining
	    }
	  }

	  // must be an even number of digits
	  var strLen = string.length
	  if (strLen % 2 !== 0) throw new Error('Invalid hex string')

	  if (length > strLen / 2) {
	    length = strLen / 2
	  }
	  for (var i = 0; i < length; i++) {
	    var parsed = parseInt(string.substr(i * 2, 2), 16)
	    if (isNaN(parsed)) throw new Error('Invalid hex string')
	    buf[offset + i] = parsed
	  }
	  return i
	}

	function utf8Write (buf, string, offset, length) {
	  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
	}

	function asciiWrite (buf, string, offset, length) {
	  return blitBuffer(asciiToBytes(string), buf, offset, length)
	}

	function binaryWrite (buf, string, offset, length) {
	  return asciiWrite(buf, string, offset, length)
	}

	function base64Write (buf, string, offset, length) {
	  return blitBuffer(base64ToBytes(string), buf, offset, length)
	}

	function ucs2Write (buf, string, offset, length) {
	  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
	}

	Buffer.prototype.write = function write (string, offset, length, encoding) {
	  // Buffer#write(string)
	  if (offset === undefined) {
	    encoding = 'utf8'
	    length = this.length
	    offset = 0
	  // Buffer#write(string, encoding)
	  } else if (length === undefined && typeof offset === 'string') {
	    encoding = offset
	    length = this.length
	    offset = 0
	  // Buffer#write(string, offset[, length][, encoding])
	  } else if (isFinite(offset)) {
	    offset = offset | 0
	    if (isFinite(length)) {
	      length = length | 0
	      if (encoding === undefined) encoding = 'utf8'
	    } else {
	      encoding = length
	      length = undefined
	    }
	  // legacy write(string, encoding, offset, length) - remove in v0.13
	  } else {
	    var swap = encoding
	    encoding = offset
	    offset = length | 0
	    length = swap
	  }

	  var remaining = this.length - offset
	  if (length === undefined || length > remaining) length = remaining

	  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
	    throw new RangeError('attempt to write outside buffer bounds')
	  }

	  if (!encoding) encoding = 'utf8'

	  var loweredCase = false
	  for (;;) {
	    switch (encoding) {
	      case 'hex':
	        return hexWrite(this, string, offset, length)

	      case 'utf8':
	      case 'utf-8':
	        return utf8Write(this, string, offset, length)

	      case 'ascii':
	        return asciiWrite(this, string, offset, length)

	      case 'binary':
	        return binaryWrite(this, string, offset, length)

	      case 'base64':
	        // Warning: maxLength not taken into account in base64Write
	        return base64Write(this, string, offset, length)

	      case 'ucs2':
	      case 'ucs-2':
	      case 'utf16le':
	      case 'utf-16le':
	        return ucs2Write(this, string, offset, length)

	      default:
	        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
	        encoding = ('' + encoding).toLowerCase()
	        loweredCase = true
	    }
	  }
	}

	Buffer.prototype.toJSON = function toJSON () {
	  return {
	    type: 'Buffer',
	    data: Array.prototype.slice.call(this._arr || this, 0)
	  }
	}

	function base64Slice (buf, start, end) {
	  if (start === 0 && end === buf.length) {
	    return base64.fromByteArray(buf)
	  } else {
	    return base64.fromByteArray(buf.slice(start, end))
	  }
	}

	function utf8Slice (buf, start, end) {
	  end = Math.min(buf.length, end)
	  var res = []

	  var i = start
	  while (i < end) {
	    var firstByte = buf[i]
	    var codePoint = null
	    var bytesPerSequence = (firstByte > 0xEF) ? 4
	      : (firstByte > 0xDF) ? 3
	      : (firstByte > 0xBF) ? 2
	      : 1

	    if (i + bytesPerSequence <= end) {
	      var secondByte, thirdByte, fourthByte, tempCodePoint

	      switch (bytesPerSequence) {
	        case 1:
	          if (firstByte < 0x80) {
	            codePoint = firstByte
	          }
	          break
	        case 2:
	          secondByte = buf[i + 1]
	          if ((secondByte & 0xC0) === 0x80) {
	            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
	            if (tempCodePoint > 0x7F) {
	              codePoint = tempCodePoint
	            }
	          }
	          break
	        case 3:
	          secondByte = buf[i + 1]
	          thirdByte = buf[i + 2]
	          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
	            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
	            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
	              codePoint = tempCodePoint
	            }
	          }
	          break
	        case 4:
	          secondByte = buf[i + 1]
	          thirdByte = buf[i + 2]
	          fourthByte = buf[i + 3]
	          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
	            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
	            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
	              codePoint = tempCodePoint
	            }
	          }
	      }
	    }

	    if (codePoint === null) {
	      // we did not generate a valid codePoint so insert a
	      // replacement char (U+FFFD) and advance only 1 byte
	      codePoint = 0xFFFD
	      bytesPerSequence = 1
	    } else if (codePoint > 0xFFFF) {
	      // encode to utf16 (surrogate pair dance)
	      codePoint -= 0x10000
	      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
	      codePoint = 0xDC00 | codePoint & 0x3FF
	    }

	    res.push(codePoint)
	    i += bytesPerSequence
	  }

	  return decodeCodePointsArray(res)
	}

	// Based on http://stackoverflow.com/a/22747272/680742, the browser with
	// the lowest limit is Chrome, with 0x10000 args.
	// We go 1 magnitude less, for safety
	var MAX_ARGUMENTS_LENGTH = 0x1000

	function decodeCodePointsArray (codePoints) {
	  var len = codePoints.length
	  if (len <= MAX_ARGUMENTS_LENGTH) {
	    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
	  }

	  // Decode in chunks to avoid "call stack size exceeded".
	  var res = ''
	  var i = 0
	  while (i < len) {
	    res += String.fromCharCode.apply(
	      String,
	      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
	    )
	  }
	  return res
	}

	function asciiSlice (buf, start, end) {
	  var ret = ''
	  end = Math.min(buf.length, end)

	  for (var i = start; i < end; i++) {
	    ret += String.fromCharCode(buf[i] & 0x7F)
	  }
	  return ret
	}

	function binarySlice (buf, start, end) {
	  var ret = ''
	  end = Math.min(buf.length, end)

	  for (var i = start; i < end; i++) {
	    ret += String.fromCharCode(buf[i])
	  }
	  return ret
	}

	function hexSlice (buf, start, end) {
	  var len = buf.length

	  if (!start || start < 0) start = 0
	  if (!end || end < 0 || end > len) end = len

	  var out = ''
	  for (var i = start; i < end; i++) {
	    out += toHex(buf[i])
	  }
	  return out
	}

	function utf16leSlice (buf, start, end) {
	  var bytes = buf.slice(start, end)
	  var res = ''
	  for (var i = 0; i < bytes.length; i += 2) {
	    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
	  }
	  return res
	}

	Buffer.prototype.slice = function slice (start, end) {
	  var len = this.length
	  start = ~~start
	  end = end === undefined ? len : ~~end

	  if (start < 0) {
	    start += len
	    if (start < 0) start = 0
	  } else if (start > len) {
	    start = len
	  }

	  if (end < 0) {
	    end += len
	    if (end < 0) end = 0
	  } else if (end > len) {
	    end = len
	  }

	  if (end < start) end = start

	  var newBuf
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    newBuf = Buffer._augment(this.subarray(start, end))
	  } else {
	    var sliceLen = end - start
	    newBuf = new Buffer(sliceLen, undefined)
	    for (var i = 0; i < sliceLen; i++) {
	      newBuf[i] = this[i + start]
	    }
	  }

	  if (newBuf.length) newBuf.parent = this.parent || this

	  return newBuf
	}

	/*
	 * Need to make sure that buffer isn't trying to write out of bounds.
	 */
	function checkOffset (offset, ext, length) {
	  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
	  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
	}

	Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) checkOffset(offset, byteLength, this.length)

	  var val = this[offset]
	  var mul = 1
	  var i = 0
	  while (++i < byteLength && (mul *= 0x100)) {
	    val += this[offset + i] * mul
	  }

	  return val
	}

	Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) {
	    checkOffset(offset, byteLength, this.length)
	  }

	  var val = this[offset + --byteLength]
	  var mul = 1
	  while (byteLength > 0 && (mul *= 0x100)) {
	    val += this[offset + --byteLength] * mul
	  }

	  return val
	}

	Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 1, this.length)
	  return this[offset]
	}

	Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 2, this.length)
	  return this[offset] | (this[offset + 1] << 8)
	}

	Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 2, this.length)
	  return (this[offset] << 8) | this[offset + 1]
	}

	Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)

	  return ((this[offset]) |
	      (this[offset + 1] << 8) |
	      (this[offset + 2] << 16)) +
	      (this[offset + 3] * 0x1000000)
	}

	Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)

	  return (this[offset] * 0x1000000) +
	    ((this[offset + 1] << 16) |
	    (this[offset + 2] << 8) |
	    this[offset + 3])
	}

	Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) checkOffset(offset, byteLength, this.length)

	  var val = this[offset]
	  var mul = 1
	  var i = 0
	  while (++i < byteLength && (mul *= 0x100)) {
	    val += this[offset + i] * mul
	  }
	  mul *= 0x80

	  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

	  return val
	}

	Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) checkOffset(offset, byteLength, this.length)

	  var i = byteLength
	  var mul = 1
	  var val = this[offset + --i]
	  while (i > 0 && (mul *= 0x100)) {
	    val += this[offset + --i] * mul
	  }
	  mul *= 0x80

	  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

	  return val
	}

	Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 1, this.length)
	  if (!(this[offset] & 0x80)) return (this[offset])
	  return ((0xff - this[offset] + 1) * -1)
	}

	Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 2, this.length)
	  var val = this[offset] | (this[offset + 1] << 8)
	  return (val & 0x8000) ? val | 0xFFFF0000 : val
	}

	Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 2, this.length)
	  var val = this[offset + 1] | (this[offset] << 8)
	  return (val & 0x8000) ? val | 0xFFFF0000 : val
	}

	Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)

	  return (this[offset]) |
	    (this[offset + 1] << 8) |
	    (this[offset + 2] << 16) |
	    (this[offset + 3] << 24)
	}

	Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)

	  return (this[offset] << 24) |
	    (this[offset + 1] << 16) |
	    (this[offset + 2] << 8) |
	    (this[offset + 3])
	}

	Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)
	  return ieee754.read(this, offset, true, 23, 4)
	}

	Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)
	  return ieee754.read(this, offset, false, 23, 4)
	}

	Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 8, this.length)
	  return ieee754.read(this, offset, true, 52, 8)
	}

	Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 8, this.length)
	  return ieee754.read(this, offset, false, 52, 8)
	}

	function checkInt (buf, value, offset, ext, max, min) {
	  if (!Buffer.isBuffer(buf)) throw new TypeError('buffer must be a Buffer instance')
	  if (value > max || value < min) throw new RangeError('value is out of bounds')
	  if (offset + ext > buf.length) throw new RangeError('index out of range')
	}

	Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
	  value = +value
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) checkInt(this, value, offset, byteLength, Math.pow(2, 8 * byteLength), 0)

	  var mul = 1
	  var i = 0
	  this[offset] = value & 0xFF
	  while (++i < byteLength && (mul *= 0x100)) {
	    this[offset + i] = (value / mul) & 0xFF
	  }

	  return offset + byteLength
	}

	Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
	  value = +value
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) checkInt(this, value, offset, byteLength, Math.pow(2, 8 * byteLength), 0)

	  var i = byteLength - 1
	  var mul = 1
	  this[offset + i] = value & 0xFF
	  while (--i >= 0 && (mul *= 0x100)) {
	    this[offset + i] = (value / mul) & 0xFF
	  }

	  return offset + byteLength
	}

	Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
	  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
	  this[offset] = (value & 0xff)
	  return offset + 1
	}

	function objectWriteUInt16 (buf, value, offset, littleEndian) {
	  if (value < 0) value = 0xffff + value + 1
	  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; i++) {
	    buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
	      (littleEndian ? i : 1 - i) * 8
	  }
	}

	Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value & 0xff)
	    this[offset + 1] = (value >>> 8)
	  } else {
	    objectWriteUInt16(this, value, offset, true)
	  }
	  return offset + 2
	}

	Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value >>> 8)
	    this[offset + 1] = (value & 0xff)
	  } else {
	    objectWriteUInt16(this, value, offset, false)
	  }
	  return offset + 2
	}

	function objectWriteUInt32 (buf, value, offset, littleEndian) {
	  if (value < 0) value = 0xffffffff + value + 1
	  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; i++) {
	    buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
	  }
	}

	Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset + 3] = (value >>> 24)
	    this[offset + 2] = (value >>> 16)
	    this[offset + 1] = (value >>> 8)
	    this[offset] = (value & 0xff)
	  } else {
	    objectWriteUInt32(this, value, offset, true)
	  }
	  return offset + 4
	}

	Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value >>> 24)
	    this[offset + 1] = (value >>> 16)
	    this[offset + 2] = (value >>> 8)
	    this[offset + 3] = (value & 0xff)
	  } else {
	    objectWriteUInt32(this, value, offset, false)
	  }
	  return offset + 4
	}

	Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) {
	    var limit = Math.pow(2, 8 * byteLength - 1)

	    checkInt(this, value, offset, byteLength, limit - 1, -limit)
	  }

	  var i = 0
	  var mul = 1
	  var sub = value < 0 ? 1 : 0
	  this[offset] = value & 0xFF
	  while (++i < byteLength && (mul *= 0x100)) {
	    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
	  }

	  return offset + byteLength
	}

	Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) {
	    var limit = Math.pow(2, 8 * byteLength - 1)

	    checkInt(this, value, offset, byteLength, limit - 1, -limit)
	  }

	  var i = byteLength - 1
	  var mul = 1
	  var sub = value < 0 ? 1 : 0
	  this[offset + i] = value & 0xFF
	  while (--i >= 0 && (mul *= 0x100)) {
	    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
	  }

	  return offset + byteLength
	}

	Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
	  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
	  if (value < 0) value = 0xff + value + 1
	  this[offset] = (value & 0xff)
	  return offset + 1
	}

	Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value & 0xff)
	    this[offset + 1] = (value >>> 8)
	  } else {
	    objectWriteUInt16(this, value, offset, true)
	  }
	  return offset + 2
	}

	Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value >>> 8)
	    this[offset + 1] = (value & 0xff)
	  } else {
	    objectWriteUInt16(this, value, offset, false)
	  }
	  return offset + 2
	}

	Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value & 0xff)
	    this[offset + 1] = (value >>> 8)
	    this[offset + 2] = (value >>> 16)
	    this[offset + 3] = (value >>> 24)
	  } else {
	    objectWriteUInt32(this, value, offset, true)
	  }
	  return offset + 4
	}

	Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
	  if (value < 0) value = 0xffffffff + value + 1
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value >>> 24)
	    this[offset + 1] = (value >>> 16)
	    this[offset + 2] = (value >>> 8)
	    this[offset + 3] = (value & 0xff)
	  } else {
	    objectWriteUInt32(this, value, offset, false)
	  }
	  return offset + 4
	}

	function checkIEEE754 (buf, value, offset, ext, max, min) {
	  if (value > max || value < min) throw new RangeError('value is out of bounds')
	  if (offset + ext > buf.length) throw new RangeError('index out of range')
	  if (offset < 0) throw new RangeError('index out of range')
	}

	function writeFloat (buf, value, offset, littleEndian, noAssert) {
	  if (!noAssert) {
	    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
	  }
	  ieee754.write(buf, value, offset, littleEndian, 23, 4)
	  return offset + 4
	}

	Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
	  return writeFloat(this, value, offset, true, noAssert)
	}

	Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
	  return writeFloat(this, value, offset, false, noAssert)
	}

	function writeDouble (buf, value, offset, littleEndian, noAssert) {
	  if (!noAssert) {
	    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
	  }
	  ieee754.write(buf, value, offset, littleEndian, 52, 8)
	  return offset + 8
	}

	Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
	  return writeDouble(this, value, offset, true, noAssert)
	}

	Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
	  return writeDouble(this, value, offset, false, noAssert)
	}

	// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
	Buffer.prototype.copy = function copy (target, targetStart, start, end) {
	  if (!start) start = 0
	  if (!end && end !== 0) end = this.length
	  if (targetStart >= target.length) targetStart = target.length
	  if (!targetStart) targetStart = 0
	  if (end > 0 && end < start) end = start

	  // Copy 0 bytes; we're done
	  if (end === start) return 0
	  if (target.length === 0 || this.length === 0) return 0

	  // Fatal error conditions
	  if (targetStart < 0) {
	    throw new RangeError('targetStart out of bounds')
	  }
	  if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
	  if (end < 0) throw new RangeError('sourceEnd out of bounds')

	  // Are we oob?
	  if (end > this.length) end = this.length
	  if (target.length - targetStart < end - start) {
	    end = target.length - targetStart + start
	  }

	  var len = end - start
	  var i

	  if (this === target && start < targetStart && targetStart < end) {
	    // descending copy from end
	    for (i = len - 1; i >= 0; i--) {
	      target[i + targetStart] = this[i + start]
	    }
	  } else if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
	    // ascending copy from start
	    for (i = 0; i < len; i++) {
	      target[i + targetStart] = this[i + start]
	    }
	  } else {
	    target._set(this.subarray(start, start + len), targetStart)
	  }

	  return len
	}

	// fill(value, start=0, end=buffer.length)
	Buffer.prototype.fill = function fill (value, start, end) {
	  if (!value) value = 0
	  if (!start) start = 0
	  if (!end) end = this.length

	  if (end < start) throw new RangeError('end < start')

	  // Fill 0 bytes; we're done
	  if (end === start) return
	  if (this.length === 0) return

	  if (start < 0 || start >= this.length) throw new RangeError('start out of bounds')
	  if (end < 0 || end > this.length) throw new RangeError('end out of bounds')

	  var i
	  if (typeof value === 'number') {
	    for (i = start; i < end; i++) {
	      this[i] = value
	    }
	  } else {
	    var bytes = utf8ToBytes(value.toString())
	    var len = bytes.length
	    for (i = start; i < end; i++) {
	      this[i] = bytes[i % len]
	    }
	  }

	  return this
	}

	/**
	 * Creates a new `ArrayBuffer` with the *copied* memory of the buffer instance.
	 * Added in Node 0.12. Only available in browsers that support ArrayBuffer.
	 */
	Buffer.prototype.toArrayBuffer = function toArrayBuffer () {
	  if (typeof Uint8Array !== 'undefined') {
	    if (Buffer.TYPED_ARRAY_SUPPORT) {
	      return (new Buffer(this)).buffer
	    } else {
	      var buf = new Uint8Array(this.length)
	      for (var i = 0, len = buf.length; i < len; i += 1) {
	        buf[i] = this[i]
	      }
	      return buf.buffer
	    }
	  } else {
	    throw new TypeError('Buffer.toArrayBuffer not supported in this browser')
	  }
	}

	// HELPER FUNCTIONS
	// ================

	var BP = Buffer.prototype

	/**
	 * Augment a Uint8Array *instance* (not the Uint8Array class!) with Buffer methods
	 */
	Buffer._augment = function _augment (arr) {
	  arr.constructor = Buffer
	  arr._isBuffer = true

	  // save reference to original Uint8Array set method before overwriting
	  arr._set = arr.set

	  // deprecated
	  arr.get = BP.get
	  arr.set = BP.set

	  arr.write = BP.write
	  arr.toString = BP.toString
	  arr.toLocaleString = BP.toString
	  arr.toJSON = BP.toJSON
	  arr.equals = BP.equals
	  arr.compare = BP.compare
	  arr.indexOf = BP.indexOf
	  arr.copy = BP.copy
	  arr.slice = BP.slice
	  arr.readUIntLE = BP.readUIntLE
	  arr.readUIntBE = BP.readUIntBE
	  arr.readUInt8 = BP.readUInt8
	  arr.readUInt16LE = BP.readUInt16LE
	  arr.readUInt16BE = BP.readUInt16BE
	  arr.readUInt32LE = BP.readUInt32LE
	  arr.readUInt32BE = BP.readUInt32BE
	  arr.readIntLE = BP.readIntLE
	  arr.readIntBE = BP.readIntBE
	  arr.readInt8 = BP.readInt8
	  arr.readInt16LE = BP.readInt16LE
	  arr.readInt16BE = BP.readInt16BE
	  arr.readInt32LE = BP.readInt32LE
	  arr.readInt32BE = BP.readInt32BE
	  arr.readFloatLE = BP.readFloatLE
	  arr.readFloatBE = BP.readFloatBE
	  arr.readDoubleLE = BP.readDoubleLE
	  arr.readDoubleBE = BP.readDoubleBE
	  arr.writeUInt8 = BP.writeUInt8
	  arr.writeUIntLE = BP.writeUIntLE
	  arr.writeUIntBE = BP.writeUIntBE
	  arr.writeUInt16LE = BP.writeUInt16LE
	  arr.writeUInt16BE = BP.writeUInt16BE
	  arr.writeUInt32LE = BP.writeUInt32LE
	  arr.writeUInt32BE = BP.writeUInt32BE
	  arr.writeIntLE = BP.writeIntLE
	  arr.writeIntBE = BP.writeIntBE
	  arr.writeInt8 = BP.writeInt8
	  arr.writeInt16LE = BP.writeInt16LE
	  arr.writeInt16BE = BP.writeInt16BE
	  arr.writeInt32LE = BP.writeInt32LE
	  arr.writeInt32BE = BP.writeInt32BE
	  arr.writeFloatLE = BP.writeFloatLE
	  arr.writeFloatBE = BP.writeFloatBE
	  arr.writeDoubleLE = BP.writeDoubleLE
	  arr.writeDoubleBE = BP.writeDoubleBE
	  arr.fill = BP.fill
	  arr.inspect = BP.inspect
	  arr.toArrayBuffer = BP.toArrayBuffer

	  return arr
	}

	var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g

	function base64clean (str) {
	  // Node strips out invalid characters like \n and \t from the string, base64-js does not
	  str = stringtrim(str).replace(INVALID_BASE64_RE, '')
	  // Node converts strings with length < 2 to ''
	  if (str.length < 2) return ''
	  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
	  while (str.length % 4 !== 0) {
	    str = str + '='
	  }
	  return str
	}

	function stringtrim (str) {
	  if (str.trim) return str.trim()
	  return str.replace(/^\s+|\s+$/g, '')
	}

	function toHex (n) {
	  if (n < 16) return '0' + n.toString(16)
	  return n.toString(16)
	}

	function utf8ToBytes (string, units) {
	  units = units || Infinity
	  var codePoint
	  var length = string.length
	  var leadSurrogate = null
	  var bytes = []

	  for (var i = 0; i < length; i++) {
	    codePoint = string.charCodeAt(i)

	    // is surrogate component
	    if (codePoint > 0xD7FF && codePoint < 0xE000) {
	      // last char was a lead
	      if (!leadSurrogate) {
	        // no lead yet
	        if (codePoint > 0xDBFF) {
	          // unexpected trail
	          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
	          continue
	        } else if (i + 1 === length) {
	          // unpaired lead
	          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
	          continue
	        }

	        // valid lead
	        leadSurrogate = codePoint

	        continue
	      }

	      // 2 leads in a row
	      if (codePoint < 0xDC00) {
	        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
	        leadSurrogate = codePoint
	        continue
	      }

	      // valid surrogate pair
	      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
	    } else if (leadSurrogate) {
	      // valid bmp char, but last char was a lead
	      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
	    }

	    leadSurrogate = null

	    // encode utf8
	    if (codePoint < 0x80) {
	      if ((units -= 1) < 0) break
	      bytes.push(codePoint)
	    } else if (codePoint < 0x800) {
	      if ((units -= 2) < 0) break
	      bytes.push(
	        codePoint >> 0x6 | 0xC0,
	        codePoint & 0x3F | 0x80
	      )
	    } else if (codePoint < 0x10000) {
	      if ((units -= 3) < 0) break
	      bytes.push(
	        codePoint >> 0xC | 0xE0,
	        codePoint >> 0x6 & 0x3F | 0x80,
	        codePoint & 0x3F | 0x80
	      )
	    } else if (codePoint < 0x110000) {
	      if ((units -= 4) < 0) break
	      bytes.push(
	        codePoint >> 0x12 | 0xF0,
	        codePoint >> 0xC & 0x3F | 0x80,
	        codePoint >> 0x6 & 0x3F | 0x80,
	        codePoint & 0x3F | 0x80
	      )
	    } else {
	      throw new Error('Invalid code point')
	    }
	  }

	  return bytes
	}

	function asciiToBytes (str) {
	  var byteArray = []
	  for (var i = 0; i < str.length; i++) {
	    // Node's code seems to be doing this and not & 0x7F..
	    byteArray.push(str.charCodeAt(i) & 0xFF)
	  }
	  return byteArray
	}

	function utf16leToBytes (str, units) {
	  var c, hi, lo
	  var byteArray = []
	  for (var i = 0; i < str.length; i++) {
	    if ((units -= 2) < 0) break

	    c = str.charCodeAt(i)
	    hi = c >> 8
	    lo = c % 256
	    byteArray.push(lo)
	    byteArray.push(hi)
	  }

	  return byteArray
	}

	function base64ToBytes (str) {
	  return base64.toByteArray(base64clean(str))
	}

	function blitBuffer (src, dst, offset, length) {
	  for (var i = 0; i < length; i++) {
	    if ((i + offset >= dst.length) || (i >= src.length)) break
	    dst[i + offset] = src[i]
	  }
	  return i
	}

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(10).Buffer, (function() { return this; }())))

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

	;(function (exports) {
		'use strict';

	  var Arr = (typeof Uint8Array !== 'undefined')
	    ? Uint8Array
	    : Array

		var PLUS   = '+'.charCodeAt(0)
		var SLASH  = '/'.charCodeAt(0)
		var NUMBER = '0'.charCodeAt(0)
		var LOWER  = 'a'.charCodeAt(0)
		var UPPER  = 'A'.charCodeAt(0)
		var PLUS_URL_SAFE = '-'.charCodeAt(0)
		var SLASH_URL_SAFE = '_'.charCodeAt(0)

		function decode (elt) {
			var code = elt.charCodeAt(0)
			if (code === PLUS ||
			    code === PLUS_URL_SAFE)
				return 62 // '+'
			if (code === SLASH ||
			    code === SLASH_URL_SAFE)
				return 63 // '/'
			if (code < NUMBER)
				return -1 //no match
			if (code < NUMBER + 10)
				return code - NUMBER + 26 + 26
			if (code < UPPER + 26)
				return code - UPPER
			if (code < LOWER + 26)
				return code - LOWER + 26
		}

		function b64ToByteArray (b64) {
			var i, j, l, tmp, placeHolders, arr

			if (b64.length % 4 > 0) {
				throw new Error('Invalid string. Length must be a multiple of 4')
			}

			// the number of equal signs (place holders)
			// if there are two placeholders, than the two characters before it
			// represent one byte
			// if there is only one, then the three characters before it represent 2 bytes
			// this is just a cheap hack to not do indexOf twice
			var len = b64.length
			placeHolders = '=' === b64.charAt(len - 2) ? 2 : '=' === b64.charAt(len - 1) ? 1 : 0

			// base64 is 4/3 + up to two characters of the original data
			arr = new Arr(b64.length * 3 / 4 - placeHolders)

			// if there are placeholders, only get up to the last complete 4 chars
			l = placeHolders > 0 ? b64.length - 4 : b64.length

			var L = 0

			function push (v) {
				arr[L++] = v
			}

			for (i = 0, j = 0; i < l; i += 4, j += 3) {
				tmp = (decode(b64.charAt(i)) << 18) | (decode(b64.charAt(i + 1)) << 12) | (decode(b64.charAt(i + 2)) << 6) | decode(b64.charAt(i + 3))
				push((tmp & 0xFF0000) >> 16)
				push((tmp & 0xFF00) >> 8)
				push(tmp & 0xFF)
			}

			if (placeHolders === 2) {
				tmp = (decode(b64.charAt(i)) << 2) | (decode(b64.charAt(i + 1)) >> 4)
				push(tmp & 0xFF)
			} else if (placeHolders === 1) {
				tmp = (decode(b64.charAt(i)) << 10) | (decode(b64.charAt(i + 1)) << 4) | (decode(b64.charAt(i + 2)) >> 2)
				push((tmp >> 8) & 0xFF)
				push(tmp & 0xFF)
			}

			return arr
		}

		function uint8ToBase64 (uint8) {
			var i,
				extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
				output = "",
				temp, length

			function encode (num) {
				return lookup.charAt(num)
			}

			function tripletToBase64 (num) {
				return encode(num >> 18 & 0x3F) + encode(num >> 12 & 0x3F) + encode(num >> 6 & 0x3F) + encode(num & 0x3F)
			}

			// go through the array every three bytes, we'll deal with trailing stuff later
			for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
				temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
				output += tripletToBase64(temp)
			}

			// pad the end with zeros, but make sure to not forget the extra bytes
			switch (extraBytes) {
				case 1:
					temp = uint8[uint8.length - 1]
					output += encode(temp >> 2)
					output += encode((temp << 4) & 0x3F)
					output += '=='
					break
				case 2:
					temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1])
					output += encode(temp >> 10)
					output += encode((temp >> 4) & 0x3F)
					output += encode((temp << 2) & 0x3F)
					output += '='
					break
			}

			return output
		}

		exports.toByteArray = b64ToByteArray
		exports.fromByteArray = uint8ToBase64
	}( false ? (this.base64js = {}) : exports))


/***/ },
/* 12 */
/***/ function(module, exports) {

	exports.read = function (buffer, offset, isLE, mLen, nBytes) {
	  var e, m
	  var eLen = nBytes * 8 - mLen - 1
	  var eMax = (1 << eLen) - 1
	  var eBias = eMax >> 1
	  var nBits = -7
	  var i = isLE ? (nBytes - 1) : 0
	  var d = isLE ? -1 : 1
	  var s = buffer[offset + i]

	  i += d

	  e = s & ((1 << (-nBits)) - 1)
	  s >>= (-nBits)
	  nBits += eLen
	  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

	  m = e & ((1 << (-nBits)) - 1)
	  e >>= (-nBits)
	  nBits += mLen
	  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

	  if (e === 0) {
	    e = 1 - eBias
	  } else if (e === eMax) {
	    return m ? NaN : ((s ? -1 : 1) * Infinity)
	  } else {
	    m = m + Math.pow(2, mLen)
	    e = e - eBias
	  }
	  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
	}

	exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
	  var e, m, c
	  var eLen = nBytes * 8 - mLen - 1
	  var eMax = (1 << eLen) - 1
	  var eBias = eMax >> 1
	  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
	  var i = isLE ? 0 : (nBytes - 1)
	  var d = isLE ? 1 : -1
	  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

	  value = Math.abs(value)

	  if (isNaN(value) || value === Infinity) {
	    m = isNaN(value) ? 1 : 0
	    e = eMax
	  } else {
	    e = Math.floor(Math.log(value) / Math.LN2)
	    if (value * (c = Math.pow(2, -e)) < 1) {
	      e--
	      c *= 2
	    }
	    if (e + eBias >= 1) {
	      value += rt / c
	    } else {
	      value += rt * Math.pow(2, 1 - eBias)
	    }
	    if (value * c >= 2) {
	      e++
	      c /= 2
	    }

	    if (e + eBias >= eMax) {
	      m = 0
	      e = eMax
	    } else if (e + eBias >= 1) {
	      m = (value * c - 1) * Math.pow(2, mLen)
	      e = e + eBias
	    } else {
	      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
	      e = 0
	    }
	  }

	  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

	  e = (e << mLen) | m
	  eLen += mLen
	  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

	  buffer[offset + i - d] |= s * 128
	}


/***/ },
/* 13 */
/***/ function(module, exports) {

	var toString = {}.toString;

	module.exports = Array.isArray || function (arr) {
	  return toString.call(arr) == '[object Array]';
	};


/***/ },
/* 14 */
/***/ function(module, exports) {

	/**
	 * Determine if an object is Buffer
	 *
	 * Author:   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
	 * License:  MIT
	 *
	 * `npm install is-buffer`
	 */

	module.exports = function (obj) {
	  return !!(obj != null &&
	    (obj._isBuffer || // For Safari 5-7 (missing Object.prototype.constructor)
	      (obj.constructor &&
	      typeof obj.constructor.isBuffer === 'function' &&
	      obj.constructor.isBuffer(obj))
	    ))
	}


/***/ }
/******/ ]);