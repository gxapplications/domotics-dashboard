!function(e){function t(o){if(n[o])return n[o].exports;var s=n[o]={exports:{},id:o,loaded:!1};return e[o].call(s.exports,s,s.exports,t),s.loaded=!0,s.exports}var n={};return t.m=e,t.c=n,t.p="",t(0)}([function(e,t,n){"use strict";n(1);window.app.controller("PageControls",function(e,t,n,o){e.edition={active:!1,close:function(){e.edition.active=!1},open:function(){e.edition.active=!0}},e.shrinkable=!0,e.todos=[];for(var s=0;26>s;s++)e.todos.push({what:"Brunch this weekend?",who:"Min Li Chan",notes:"I'll be in your neighborhood doing errands."})})},function(e,t,n){var o,s;(function(e,i){"use strict";var r="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol?"symbol":typeof e};!function(e,c){"object"===r(t)&&"object"===r(i)?i.exports=c():(o=c,s="function"==typeof o?o.call(t,n,t,i):o,!(void 0!==s&&(i.exports=s)))}("undefined"!=typeof window?window:e,function(){var e="2",t=function(){},n=function(e,t){var n=null,o=null;try{n=JSON.parse(e)}catch(s){o=new i(s,"protocol")}return t(o,n)},o=function(e,t){var n=null,o=null;try{n=JSON.stringify(e)}catch(s){o=new i(s,"user")}return t(o,n)},s=function(e){return function(t){setTimeout(function(){return e(t)},0)}},i=function(e,t){return"string"==typeof e&&(e=new Error(e)),e.type=t,e},r={1e3:"Normal closure",1001:"Going away",1002:"Protocol error",1003:"Unsupported data",1004:"Reserved",1005:"No status received",1006:"Abnormal closure",1007:"Invalid frame payload data",1008:"Policy violation",1009:"Message too big",1010:"Mandatory extension",1011:"Internal server error",1015:"TLS handshake"},c=function(e,n){n=n||{},this._url=e,this._settings=n,this._heartbeatTimeout=!1,this._ws=null,this._reconnection=null,this._ids=0,this._requests={},this._subscriptions={},this._heartbeat=null,this._packets=[],this._disconnectListeners=null,this._disconnectRequested=!1,this.onError=function(e){return console.error(e)},this.onConnect=t,this.onDisconnect=t,this.onUpdate=t,this.id=null};return c.WebSocket="undefined"==typeof WebSocket?null:WebSocket,c.prototype.connect=function(e,t){return"function"==typeof e&&(t=arguments[0],e={}),this._reconnection?s(t)(new Error("Cannot connect while client attempts to reconnect")):this._ws?s(t)(new Error("Already connected")):(e.reconnect!==!1?this._reconnection={wait:0,delay:e.delay||1e3,maxDelay:e.maxDelay||5e3,retries:e.retries||1/0,settings:{auth:e.auth,timeout:e.timeout}}:this._reconnection=null,void this._connect(e,!0,t))},c.prototype._connect=function(e,t,n){var o=this,s=new c.WebSocket(this._url,this._settings.ws);this._ws=s;var u=function(e){if(n){var t=n;return n=null,t(e)}return o.onError(e)},a=function(){return o._cleanup(),u(new i("Connection timed out","timeout")),t?o._reconnect():void 0},h=e.timeout?setTimeout(a,e.timeout):null;s.onopen=function(){return clearTimeout(h),s.onopen=null,o._hello(e.auth,function(e){return e?(e.path&&delete o._subscriptions[e.path],o._disconnect(function(){return u(e)},!0)):(o.onConnect(),u())})},s.onerror=function(e){clearTimeout(h),o._cleanup();var t=new i("Socket error","ws");return u(t)},s.onclose=function(e){s.onopen&&u(new Error("Connection terminated while while to connect"));var t=o._disconnectRequested;o._cleanup();var n={code:e.code,explanation:r[e.code]||"Unknown",reason:e.reason,wasClean:e.wasClean,willReconnect:!!(o._reconnection&&o._reconnection.retries>=1),wasRequested:t};o.onDisconnect(n.willReconnect,n),o._reconnect()},s.onmessage=function(e){return o._onMessage(e)}},c.prototype.overrideReconnectionAuth=function(e){return this._reconnection?(this._reconnection.settings.auth=e,!0):!1},c.prototype.disconnect=function(e){return e=e||t,this._disconnect(e,!1)},c.prototype._disconnect=function(e,t){this._reconnection=null;var n=this._disconnectRequested||!t;return this._disconnectListeners?(this._disconnectRequested=n,void this._disconnectListeners.push(e)):!this._ws||this._ws.readyState!==c.WebSocket.OPEN&&this._ws.readyState!==c.WebSocket.CONNECTING?s(e)():(this._disconnectRequested=n,this._disconnectListeners=[e],void this._ws.close())},c.prototype._cleanup=function(){this._ws&&(this._ws.readyState!==c.WebSocket.OPEN&&this._ws.readyState!==c.WebSocket.CONNECTING||this._ws.close(),this._ws.onopen=null,this._ws.onclose=null,this._ws.onerror=t,this._ws.onmessage=null,this._ws=null),this._packets=[],this.id=null,clearTimeout(this._heartbeat),this._heartbeat=null;for(var e=new i("Request failed - server disconnected","disconnect"),n=Object.keys(this._requests),o=0;o<n.length;++o){var s=n[o],r=this._requests[s],u=r.callback;clearTimeout(r.timeout),delete this._requests[s],u(e)}if(this._disconnectListeners){var a=this._disconnectListeners;this._disconnectListeners=null,this._disconnectRequested=!1,a.forEach(function(e){return e()})}},c.prototype._reconnect=function(){var e=this;if(this._reconnection){if(this._reconnection.retries<1)return this._disconnect(t,!0);--this._reconnection.retries,this._reconnection.wait=this._reconnection.wait+this._reconnection.delay;var n=Math.min(this._reconnection.wait,this._reconnection.maxDelay);setTimeout(function(){e._reconnection&&e._connect(e._reconnection.settings,!1,function(t){return t?(e.onError(t),e._reconnect()):void 0})},n)}},c.prototype.request=function(e,t){"string"==typeof e&&(e={method:"GET",path:e});var n={type:"request",method:e.method||"GET",path:e.path,headers:e.headers,payload:e.payload};return this._send(n,!0,t)},c.prototype.message=function(e,t){var n={type:"message",message:e};return this._send(n,!0,t)},c.prototype._send=function(e,n,r){var u=this;return r=r||t,this._ws&&this._ws.readyState===c.WebSocket.OPEN?(e.id=++this._ids,void o(e,function(t,o){if(t)return s(r)(t);if(!n)try{return u._ws.send(o)}catch(t){return s(r)(new i(t,"ws"))}var c={callback:r,timeout:null};u._settings.timeout&&(c.timeout=setTimeout(function(){return c.callback=null,c.timeout=null,r(new i("Request timed out","timeout"))},u._settings.timeout)),u._requests[e.id]=c;try{u._ws.send(o)}catch(t){return clearTimeout(u._requests[e.id].timeout),delete u._requests[e.id],s(r)(new i(t,"ws"))}})):s(r)(new i("Failed to send message - server disconnected","disconnect"))},c.prototype._hello=function(t,n){var o={type:"hello",version:e};t&&(o.auth=t);var s=this.subscriptions();return s.length&&(o.subs=s),this._send(o,!0,n)},c.prototype.subscriptions=function(){return Object.keys(this._subscriptions)},c.prototype.subscribe=function(e,t,n){var o=this;if(!e||"/"!==e[0])return s(n)(new i("Invalid path","user"));var r=this._subscriptions[e];if(r)return-1===r.indexOf(t)&&r.push(t),s(n)();if(this._subscriptions[e]=[t],!this._ws||this._ws.readyState!==c.WebSocket.OPEN)return s(n)();var u={type:"sub",path:e};return this._send(u,!0,function(t){return t&&delete o._subscriptions[e],n(t)})},c.prototype.unsubscribe=function(e,t,n){if(!e||"/"!==e[0])return s(n)(new i("Invalid path","user"));var o=this._subscriptions[e];if(!o)return s(n)();var r=!1;if(t){var u=o.indexOf(t);if(-1===u)return s(n)();o.splice(u,1),o.length||(delete this._subscriptions[e],r=!0)}else delete this._subscriptions[e],r=!0;if(!r||!this._ws||this._ws.readyState!==c.WebSocket.OPEN)return s(n)();var a={type:"unsub",path:e};return this._send(a,!0,function(e){return n()})},c.prototype._onMessage=function(e){var t=this;this._beat();var o=e.data,s=o[0];if("{"!==s){if(this._packets.push(o.slice(1)),"!"!==s)return;o=this._packets.join(""),this._packets=[]}this._packets.length&&(this._packets=[],this.onError(new i("Received an incomplete message","protocol"))),n(o,function(e,n){if(e)return t.onError(e);var o=null;if(n.statusCode&&n.statusCode>=400&&n.statusCode<=599&&(o=new i(n.payload.message||n.payload.error,"server"),o.statusCode=n.statusCode,o.data=n.payload,o.headers=n.headers,o.path=n.path),"ping"===n.type)return t._send({type:"ping"},!1);if("update"===n.type)return t.onUpdate(n.message);if("pub"!==n.type&&"revoke"!==n.type){var s=t._requests[n.id];if(!s)return t.onError(new i("Received response for unknown request","protocol"));var r=s.callback;if(clearTimeout(s.timeout),delete t._requests[n.id],r)return"request"===n.type?r(o,n.payload,n.statusCode,n.headers):"message"===n.type?r(o,n.message):"hello"===n.type?(t.id=n.socket,n.heartbeat&&(t._heartbeatTimeout=n.heartbeat.interval+n.heartbeat.timeout,t._beat()),r(o)):"sub"===n.type||"unsub"===n.type?r(o):t.onError(new i("Received unknown response type: "+n.type,"protocol"))}else{var c=t._subscriptions[n.path];if("revoke"===n.type&&delete t._subscriptions[n.path],c&&void 0!==n.message){var u={};"revoke"===n.type&&(u.revoked=!0);for(var a=0;a<c.length;++a)c[a](n.message,u)}}})},c.prototype._beat=function(){var e=this;this._heartbeatTimeout&&(clearTimeout(this._heartbeat),this._heartbeat=setTimeout(function(){e.onError(new i("Disconnecting due to heartbeat timeout","timeout")),e._ws.close()},this._heartbeatTimeout))},{Client:c}})}).call(t,function(){return this}(),n(2)(e))},function(e,t){e.exports=function(e){return e.webpackPolyfill||(e.deprecate=function(){},e.paths=[],e.children=[],e.webpackPolyfill=1),e}}]);