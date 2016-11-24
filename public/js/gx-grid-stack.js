
/*global jQuery */
(function ($) {
    /* Strict mode for this plugin */
    "use strict";
    /*jslint browser: true */

    $.fn.gridStack = function (params) {
        var settings, gridStack, getLanes, setLanes, resizeItem, compileAngularElement, findFreeSpaceXY, grid;
        gridStack = $(this);

        /* Specify default settings */
        settings = {
            matrix: [
                {id: 1, w: 1, h: 1, x: 0, y: 0},
                {id: 2, w: 1, h: 2, x: 0, y: 1},
                {id: 3, w: 2, h: 2, x: 1, y: 0},
                {id: 4, w: 1, h: 1, x: 1, y: 2},
                {id: 5, w: 2, h: 1, x: 2, y: 2},
                {id: 6, w: 1, h: 1, x: 3, y: 0}
            ],
            widthHeightRatio: 264 / 120,
            lanes: 3,
            elementPrototype: 'li.position-card',
            elementLoaderUrl: false,
            onChange: function(changedItems, matrix) {},
            getSizingCoefficient: function() { return 1; },
            draggableParams: {}
        };
        /* Override default settings with provided params, if any */
        if (params !== undefined) {
            $.extend(settings, params);
        }
        params = settings;

        /* Resize grid */
        getLanes = function() {
            return params.lanes;
        };
        gridStack.getLanes = getLanes;
        setLanes = function(size) {
            params.lanes = size;
            gridStack.gridList('resize', params.lanes);
            grid = gridStack.data('_gridList').gridList.grid;
        };
        gridStack.setLanes = setLanes;

        /* Resize item */
        resizeItem = function(itemElement, w, h) {
            gridStack.gridList('resizeItem', itemElement, { w: w, h: h });
            grid = gridStack.data('_gridList').gridList.grid;
        };
        gridStack.resizeItem = resizeItem;

        /* Compile angular element after insertion into DOM */
        compileAngularElement = function(elSelector) {
            //var elSelector = (typeof elSelector == 'string') ? elSelector : null ;
            // The new element to be added
            if (elSelector != null ) {
                var $div = $( elSelector );
                // The parent of the new element
                var $target = $("[ng-app]");
                angular.element($target).injector().invoke(['$compile', '$q', function ($compile, $q) {
                    var $scope = angular.element($target).scope();
                    var deferred = $q.defer();
                    $compile($div)($scope);
                    // Finally, refresh the watch expressions in the new element
                    $scope.$apply(function () {
                        deferred.resolve();
                    });
                }]);
            }
        };
        gridStack.compileAngularElement = compileAngularElement;

        /* search nearest space for given width and height. Returns X and Y positions */
        findFreeSpaceXY = function(w, h) {
            var searchX, searchY;
            for (searchY = 0; searchY < 64; searchY++) {
                next_search:
                for (searchX = 0; searchX < settings.lanes; searchX++) {
                    // cell occupied
                    if (typeof grid[searchY] != 'undefined' && typeof grid[searchY][searchX] != 'undefined' && grid[searchY][searchX] != null) continue;
                    // cell free and needed space is [1,1]. Found!
                    if (w == 1 && h == 1) return {x: searchX, y: searchY};
                    // cell free. Check for w overflow.
                    if (searchX + w - 1 >= settings.lanes) continue;
                    // cell free. Check for space
                    for (var j = searchY; j < searchY + h; j++) {
                        for (var i = searchX; i < searchX + w; i++) {
                            if (typeof grid[j] != 'undefined' && typeof grid[j][i] != 'undefined' &&  grid[j][i] != null) {
                                continue next_search;
                            } // continue on searchX loop
                        }
                    }
                    // cell free. Enough space
                    return {x: searchX, y: searchY};
                }
            }
        };
        gridStack.findFreeSpaceXY = findFreeSpaceXY;

        /* browser resized event */
        /* $( window ).resize(function() {
            gridStack.gridList('reflow');
            grid = gridStack.data('_gridList').gridList.grid;
        });*/

        /* init */
        $(params.elementPrototype + ':not(:first)', gridStack).remove(); // remove existing li (re-init case)
        var item, i, $item;
        for (i = 0; i < params.matrix.length; i++) {
            item = params.matrix[i];
            $item = $(params.elementPrototype, gridStack).first().clone();
            $item.attr({
                'data-w': item.w,
                'data-h': item.h,
                'data-x': item.x,
                'data-y': item.y,
                'data-id': item.id
            });
            $item.show();
            gridStack.append($item);
            // auto load inner content
            if (params.elementLoaderUrl != false) {
                $('li.position-card[data-id="' + item.id + '"] > .inner', gridStack).first().load(
                    params.elementLoaderUrl,
                    {id: item.id},
                    function (response, status, xhr) {
                        if ( status == "error" ) {
                            $('li.position-card[data-id="' + item.id + '"] > .inner md-progress-circular', gridStack).addClass('md-warn');
                            $('li.position-card[data-id="' + item.id + '"] > .inner button', gridStack).css('visibility', 'visible');
                        } else {
                            gridStack.compileAngularElement(this);
                        }
                    }
                );
            }
        }
        $(params.elementPrototype, gridStack).first().hide(); // hide prototype element
        gridStack.gridList({
            direction: 'vertical',
            lanes: params.lanes,
            widthHeightRatio: params.widthHeightRatio,
            heightToFontSizeRatio: true,
            onChange: function(changedItems) {
                grid = gridStack.data('_gridList').gridList.grid;
                var j, k;
                for (j = 0; j < changedItems.length; j++) {
                    for (k = 0; k < settings.matrix.length; k++) {
                        if (params.matrix[k].id == changedItems[j].id) {
                            params.matrix[k].w = changedItems[j].w;
                            params.matrix[k].h = changedItems[j].h;
                            params.matrix[k].x = changedItems[j].x;
                            params.matrix[k].y = changedItems[j].y;
                            break;
                        }
                    }
                }
                params.onChange(changedItems, params.matrix);
            },
            getSizingCoefficient: params.getSizingCoefficient
        }, settings.draggableParams );
        grid = gridStack.data('_gridList').gridList.grid;

        return gridStack;
    };

}(jQuery));
