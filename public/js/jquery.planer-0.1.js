/*global jQuery */

(function ($) {
    /* Strict mode for this plugin */
    "use strict";
    /*jslint browser: true */


    /** Planer
     * @param	params	Specify options in {}.
     */
    $.fn.planer = function (params) {
        var settings, canvas, ctx, lingrad, insetgrad, ledOnGrad, ledOffGrad, outerDiv, draw, setSize, getLedCoords, coords;
        var planer = $(this);

        /* Specify default settings */
        settings = {
            width: 256,
            height: 30,
        };

        /* Override default settings with provided params, if any */
        if (params !== undefined) {
            $.extend(settings, params);
        } else {
            params = settings;
        }

        outerDiv = document.createElement('div');
        outerDiv.style.width = settings.width + 'px';
        outerDiv.style.height = settings.height + 'px';
        outerDiv.style.position = 'relative';
        outerDiv.style.cursor = 'default';
        $(outerDiv).addClass('planerShadow');

        $(this).append(outerDiv);

        /* Create our canvas object */
        canvas = document.createElement('canvas');
        canvas.setAttribute('width', settings.width);
        canvas.setAttribute('height', settings.height);
        outerDiv.appendChild(canvas);

        /* Get a reference to the context of our canvas object */
        ctx = canvas.getContext("2d");

        /* Create our linear gradient for the outer recf */
        lingrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
        lingrad.addColorStop(0, '#9E9E9E'); // 500
        lingrad.addColorStop(1, '#616161'); // 700
        insetgrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
        insetgrad.addColorStop(0, '#323232'); // 850
        insetgrad.addColorStop(1, '#616161'); // 700

        ledOnGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
        ledOnGrad.addColorStop(0, '#1DE9B6'); // A400
        ledOnGrad.addColorStop(1, '#00897B'); // 600
        ledOffGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
        ledOffGrad.addColorStop(0, '#00695C'); // 800
        ledOffGrad.addColorStop(1, '#004D40'); // 900

        /* Borders should be 1px */
        ctx.lineWidth = 1;

        getLedCoords = function(idx, total) {
            var availableWidth = canvas.width - 14;
            var margin = 7;
            var ledWidth = Math.floor(availableWidth / total);
            var delta = Math.floor((availableWidth - (ledWidth * total)) / 2);
            var ledMargin = Math.floor(ledWidth *0.14);
            return [
                margin + (idx*ledWidth) + ledMargin + delta,
                margin + ledMargin + Math.floor(delta / 2),
                ledWidth - (2*ledMargin),
                canvas.height - (2*margin) - (2*ledMargin) - delta
            ];
        };

        /**
         * render the widget in its entirety.
         */
        draw = function () {
            /* Clear canvas entirely */
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            /*** IMAGERY ***/

            /* draw outer rect */
            ctx.fillStyle = lingrad;
            ctx.beginPath();
            ctx.rect(0, 0, canvas.width, canvas.height);
            ctx.fill();
            ctx.fillStyle = insetgrad;
            ctx.beginPath();
            ctx.rect(5, 5, canvas.width-10, canvas.height-10);
            ctx.fill();

            // tests
            ctx.fillStyle = ledOnGrad;
            ctx.beginPath();
            coords = getLedCoords(0, 48);
            ctx.rect(coords[0], coords[1], coords[2], coords[3]);
            ctx.fill();

            ctx.fillStyle = ledOffGrad;
            ctx.beginPath();
            coords = getLedCoords(1, 48);
            ctx.rect(coords[0], coords[1], coords[2], coords[3]);
            ctx.fill();

            ctx.fillStyle = ledOffGrad;
            ctx.beginPath();
            coords = getLedCoords(47, 48);
            ctx.rect(coords[0], coords[1], coords[2], coords[3]);
            ctx.fill();
        };

        /* Do an initial draw */
        draw();

    	return this;
    };





    /** AutoSizedPlaner
     * @param	params	Specify options in {}.
     */
    $.fn.autoSizedPlaner = function (params) {
        var settings, setSize, innerPlaner;
        var planer = $(this);

        /* Specify default settings */
        settings = {
        	width: 256,
        	height: 30
        };

        /* Override default settings with provided params, if any */
        if (params !== undefined) {
            $.extend(settings, params);
        } else {
            params = settings;
        }

        setSize = function(size) {
        	if (planer.children().length > 0) {
        		planer.html('');
        	}
        	settings.width = size;
        	settings.height = planer.height();
        	innerPlaner = planer.planer(settings);
        };
        planer.setSize = setSize;

        /* auto resize management */
        this.resizer = function() {
            var size = Math.max(256, planer.width());
            planer.setSize(size);
            return true;
        };
        $( window ).resize(this.resizer);
        planer.resize(this.resizer);

	    /* init */
        this.resizer(); // also instantiate the component for the first time.
    	settings.height = planer.height();

    	return this;
    };


}(jQuery));
