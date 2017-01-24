/* global jQuery */
/* jslint browser: true */
"use strict";

(function (factory) {
    // It does not try to register in a CommonJS environment since jQuery is not
    // likely to run in those environments.
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery', 'gridList', 'gxGridStack'], factory);
    } else {
        factory(jQuery, GridList);
    }
}(function($, GridList) {

    const DraggableGridList = function(element, options) {
        this.options = $.extend({}, this.defaults, options);
        this.$element = $(element);
        this._init();
        this._bindEvents();
    };

    DraggableGridList.prototype = {
        defaults: {
            lanes: 5,
            widthHeightRatio: 264 / 120,
            heightToFontSizeRatio: true,
            getSizingCoefficient: function() { return 1; },
            minHeight: 0
        },

        draggableOptions: {
            zIndex: 2,
            scroll: false,
            containment: "parent",
            distance: 50,
            snap: true,
            addClasses: false,
            opacity: 0.0001, // FIXME: hide element while dragging because zoom does not move the element properly
            handle: '.handle',
            helper: 'original'
        },

        destroy: function() {
            this._unbindEvents();
        },

        resize: function(lanes) {
            if (lanes) {
                this.options.lanes = lanes;
            }
            this._createGridSnapshot();
            this.gridList.resizeGrid(this.options.lanes);
            this._updateGridSnapshot();

            this.reflow();
        },

        resizeItem: function(element, size) {
            this._createGridSnapshot();
            this.gridList.resizeItem(this._getItemByElement(element), size);
            this._updateGridSnapshot();
            this.render();
        },

        reflow: function() {
            this._calculateCellSize();
            this.render();
        },

        render: function() {
            this._applySizeToItems();
            this._applyPositionToItems();
        },

        _bindMethod: function(fn) {
            var that = this;
            return function() {
                return fn.apply(that, arguments);
            };
        },

        _init: function() {
            // Read items and their meta data. Ignore other list elements (like the
            // position highlight)
            this.$items = this.$element.children('li[data-w]');
            this.items = this._generateItemsFromDOM();
            this._widestItem = Math.max.apply(
                null, this.items.map(function(item) { return item.w; }));
            this._tallestItem = Math.max.apply(
                null, this.items.map(function(item) { return item.h; }));

            // Used to highlight a position an element will land on upon drop
            this.$positionHighlight = this.$element.find('.position-highlight').hide();

            this._initGridList();
            this.reflow();

            // Init Draggable JQuery UI plugin for each of the list items
            // http://api.jqueryui.com/draggable/
            this.$items.draggable(this.draggableOptions);
        },

        _initGridList: function() {
            // Create instance of GridList (decoupled lib for handling the grid
            // positioning and sorting post-drag and dropping)
            this.gridList = new GridList(this.items, {
                lanes: this.options.lanes
            });
        },

        _bindEvents: function() {
            this._onStart = this._bindMethod(this._onStart);
            this._onDrag = this._bindMethod(this._onDrag);
            this._onStop = this._bindMethod(this._onStop);
            this.$items.on('dragstart', this._onStart);
            this.$items.on('drag', this._onDrag);
            this.$items.on('dragstop', this._onStop);
        },

        _unbindEvents: function() {
            this.$items.off('dragstart', this._onStart);
            this.$items.off('drag', this._onDrag);
            this.$items.off('dragstop', this._onStop);
        },

        _onStart: function(event, ui) {
            // Create a deep copy of the items; we use them to revert the item
            // positions after each drag change, making an entire drag operation less
            // distructable
            this._createGridSnapshot();

            // Since dragging actually alters the grid, we need to establish the number
            // of cols (+1 extra) before the drag starts
            this._maxGridCols = this.gridList.grid.length;
            this._drag_coefficient = this.options.getSizingCoefficient();
        },

        _onDrag: function(event, ui) {
            var item = this._getItemByElement(ui.helper),
                newPosition = this._snapItemPositionToGrid(item);

            if (this._dragPositionChanged(newPosition)) {
                this._previousDragPosition = newPosition;

                // Regenerate the grid with the positions from when the drag started
                GridList.cloneItems(this._items, this.items);
                this.gridList.generateGrid();

                // Since the items list is a deep copy, we need to fetch the item
                // corresponding to this drag action again
                item = this._getItemByElement(ui.helper);
                this.gridList.moveItemToPosition(item, newPosition);

                // Visually update item positions and highlight shape
                this._applyPositionToItems();
                this._highlightPositionForItem(item);
            }
        },

        _onStop: function(event, ui) {
            this._updateGridSnapshot();
            this._previousDragPosition = null;

            // HACK: jQuery.draggable removes this class after the dragstop callback,
            // and we need it removed before the drop, to re-enable CSS transitions
            $(ui.helper).removeClass('ui-draggable-dragging');

            this._applyPositionToItems();
            this._removePositionHighlight();
        },

        _generateItemsFromDOM: function() {
            /**
             * Generate the structure of items used by the GridList lib, using the DOM
             * data of the children of the targeted element. The items will have an
             * additional reference to the initial DOM element attached, in order to
             * trace back to it and re-render it once its properties are changed by the
             * GridList lib
             */
            var items = [];
            this.$items.each(function(i, element) {
                items.push({
                    $element: $(element),
                    x: Number($(element).attr('data-x')),
                    y: Number($(element).attr('data-y')),
                    w: Number($(element).attr('data-w')),
                    h: Number($(element).attr('data-h')),
                    id: Number($(element).attr('data-id'))
                });
            });
            return items;
        },

        _getItemByElement: function(element) {
            // XXX: this could be optimized by storing the item reference inside the
            // meta data of the DOM element
            for (var i = 0; i < this.items.length; i++) {
                if (this.items[i].$element.is(element)) {
                    return this.items[i];
                }
            }
        },

        _calculateCellSize: function() {
            var coefficient = this.options.getSizingCoefficient();
            this._cellWidth = Math.floor(coefficient * this.$element.width() / this.options.lanes);
            this._cellHeight = Math.max(this.options.minHeight, this._cellWidth / this.options.widthHeightRatio);
            this._fontSize = this._cellHeight * this.options.heightToFontSizeRatio;
        },

        _getItemWidth: function(item) {
            return item.w * this._cellWidth;
        },

        _getItemHeight: function(item) {
            return item.h * this._cellHeight;
        },

        _applySizeToItems: function() {
            for (var i = 0; i < this.items.length; i++) {
                this.items[i].$element.css({
                    width: this._getItemWidth(this.items[i]),
                    height: this._getItemHeight(this.items[i])
                });
            }
            this.$items.css('font-size', this._fontSize);
        },

        _applyPositionToItems: function() {
            for (var i = 0; i < this.items.length; i++) {
                // Don't interfere with the positions of the dragged items
                if (this.items[i].move) {
                    continue;
                }
                this.items[i].$element.css({
                    left: this.items[i].x * this._cellWidth,
                    top: this.items[i].y * this._cellHeight
                });
            }
            // Update the width of the entire grid container with enough room on the
            // right to allow dragging items to the end of the grid.
            this.$element.height((this.gridList.grid.length + this._tallestItem) * this._cellHeight);
        },

        _dragPositionChanged: function(newPosition) {
            if (!this._previousDragPosition) {
                return true;
            }
            return (newPosition[0] != this._previousDragPosition[0] ||
            newPosition[1] != this._previousDragPosition[1]);
        },

        _snapItemPositionToGrid: function(item) {
            var position = item.$element.position();

            position[0] -= this.$element.position().left;
            position.left = position.left * this._drag_coefficient;

            var col = Math.round(position.left / (this._cellWidth / this._drag_coefficient)),
                row = Math.round(position.top / (this._cellHeight / this._drag_coefficient));

            // Keep item position within the grid and don't let the item create more
            // than one extra column
            col = Math.max(col, 0);
            row = Math.max(row, 0);

            col = Math.min(col, this.options.lanes - item.w);
            row = Math.min(row, this._maxGridCols);

            return [col, row];
        },

        _highlightPositionForItem: function(item) {
            this.$positionHighlight.css({
                width: this._getItemWidth(item),
                height: this._getItemHeight(item),
                left: item.x * this._cellWidth,
                top: item.y * this._cellHeight
            }).show();
            this.$positionHighlight.css('font-size', this._fontSize);
        },

        _removePositionHighlight: function() {
            this.$positionHighlight.hide();
        },

        _createGridSnapshot: function() {
            this._items = GridList.cloneItems(this.items);
        },

        _updateGridSnapshot: function() {
            // Notify the user with the items that changed since the previous snapshot
            this._triggerOnChange();
            GridList.cloneItems(this.items, this._items);
        },

        _triggerOnChange: function() {
            if (typeof(this.options.onChange) != 'function') {
                return;
            }
            this.options.onChange.call(
                this, this.gridList.getChangedItems(this._items, '$element'));
        }
    };

    $.fn.gridList = function(options) {
        var instance, method, args;
        if (typeof(options) == 'string') {
            method = options;
            args =  Array.prototype.slice.call(arguments, 1);
        }
        this.each(function() {
            instance = $(this).data('_gridList');
            // The plugin call be called with no method on an existing GridList
            // instance to re-initialize it
            if (instance && !method) {
                instance.destroy();
                instance = null;
            }
            if (!instance) {
                instance = new DraggableGridList(this, options);
                $(this).data('_gridList', instance);
            }
            if (method) {
                instance[method].apply(instance, args);
            }
        });
        // Maintain jQuery chain
        return this;
    };

    $.fn.gxGridStack = function (params) {
        var grid;
        var gridStack = $(this);

        /* Specify default settings, and override with provided params, if any */
        var settings = {
            matrix: [
                {id: 1, w: 1, h: 1, x: 0, y: 0},
                {id: 2, w: 1, h: 2, x: 0, y: 1},
                {id: 3, w: 2, h: 2, x: 1, y: 0},
                {id: 4, w: 1, h: 1, x: 1, y: 2},
                {id: 5, w: 2, h: 1, x: 2, y: 2},
                {id: 6, w: 1, h: 1, x: 3, y: 0}
            ],
            minHeight: 80,
            lanes: 3,
            elementPrototype: 'li.position-card',
            elementLoaderUrl: false,
            onChange: function(changedItems, matrix) {},
            getSizingCoefficient: function() { return 1; }
        };
        if (params !== undefined) {
            $.extend(settings, params);
        }
        params = settings;

        /* Resize grid */
        gridStack.getLanes = function() {
            return params.lanes;
        };
        gridStack.setLanes = function(size) {
            params.lanes = size;
            gridStack.gridList('resize', params.lanes);
            grid = gridStack.data('_gridList').gridList.grid;
        };

        /* Resize item */
        gridStack.resizeItem = function(itemElement, w, h) {
            gridStack.gridList('resizeItem', itemElement, { w: w, h: h });
            grid = gridStack.data('_gridList').gridList.grid;
        };

        /* Compile angular element after insertion into DOM */
        gridStack.compileAngularElement = function(elSelector) {
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

        /* search nearest space for given width and height. Returns X and Y positions */
        gridStack.findFreeSpaceXY = function(w, h) {
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
            lanes: params.lanes,
            minHeight: params.minHeight,
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
        });
        grid = gridStack.data('_gridList').gridList.grid;

        return gridStack;
    };

}));
