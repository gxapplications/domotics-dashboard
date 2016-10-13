/*
jquery.percentageloader.js

Copyright (c) 2012, Better2Web
All rights reserved.

This jQuery plugin is licensed under the Simplified BSD License. Please
see the file license.txt that was included with the plugin bundle.

*/

/*global jQuery */

(function ($) {
    /* Strict mode for this plugin */
    "use strict";
    /*jslint browser: true */

    /* Our spiral gradient data */
    var imgdata = "data:image/png;base64,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",
        gradient = new Image();
    gradient.src = imgdata;

    /** Percentage loader
     * @param	params	Specify options in {}. May be on of width, height, progress or value.
     *
     * @example $("#myloader-container).percentageLoader({
		    width : 256,  // width in pixels
		    height : 256, // height in pixels
		    degress: 0,   // initialise degress bar position, within the range [0..1]
		    progress: 1,  // initialise progress bar position, within the range [0..1]
		    scaleOffset: 0.0,
            scaleAmplitude: 100.0,
		    value: 'Progress'  // initialise text label to this value
		    suffix: '',
            precision: 0,
		});
     */
    $.fn.percentageLoader = function (params) {
        var settings, canvas, percentageText, valueText, items, i, item, selectors, s, ctx, progress, degress,
            value, cX, cY, lingrad, innerGrad, knobgrad, tubeGrad, innerRadius, innerBarRadius, outerBarRadius, knobRadius,
            radius, startAngle, endAngle, counterClockwise, completeAngle1, completeAngle2, setProgress, setDegress, setValue,
            applyAngle, drawLoader, clipValue, outerDiv, innerBarRadius2, outerBarRadius2;

        /* Specify default settings */
        settings = {
            width: 256,
            height: 256,
            degress: 0,
            progress: 1,
            scaleOffset: 0.0,
            scaleAmplitude: 100.0,
            value: 'Progress',
            suffix: '',
            precision: 0,
            controllable: false
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
        $(outerDiv).addClass('temperatureShadow');

        $(this).append(outerDiv);

        /* Create our canvas object */
        canvas = document.createElement('canvas');
        canvas.setAttribute('width', settings.width);
        canvas.setAttribute('height', settings.height);
        outerDiv.appendChild(canvas);

        /* Create div elements we'll use for text. Drawing text is
         * possible with canvas but it is tricky working with custom
         * fonts as it is hard to guarantee when they become available
         * with differences between browsers. DOM is a safer bet here */
        percentageText = document.createElement('div');
        percentageText.style.width = (settings.width.toString() - 2) + 'px';
        percentageText.style.textAlign = 'center';
        percentageText.style.height = '50px';
        percentageText.style.left = 0;
        percentageText.style.position = 'absolute';

        valueText = document.createElement('div');
        valueText.style.width = (settings.width - 2).toString() + 'px';
        valueText.style.textAlign = 'center';
        valueText.style.height = '0px';
        valueText.style.overflow = 'hidden';
        valueText.style.left = 0;
        valueText.style.position = 'absolute';

        /* Force text items to not allow selection */
        items = [valueText, percentageText];
        for (i  = 0; i < items.length; i += 1) {
            item = items[i];
            selectors = [
                '-webkit-user-select',
                '-khtml-user-select',
                '-moz-user-select',
                '-o-user-select',
                'user-select'];

            for (s = 0; s < selectors.length; s += 1) {
                $(item).css(selectors[s], 'none');
            }
        }

        /* Add the new dom elements to the containing div */
        outerDiv.appendChild(percentageText);
        outerDiv.appendChild(valueText);

        /* Get a reference to the context of our canvas object */
        ctx = canvas.getContext("2d");


        /* Set various initial values */

        /* Centre point */
        cX = (canvas.width / 2) - 1;
        cY = (canvas.height / 2) - 1;

        /* Create our linear gradient for the outer ring */
        lingrad = ctx.createLinearGradient(cX, 0, cX, canvas.height);
        lingrad.addColorStop(0, '#9E9E9E'); // 500
        lingrad.addColorStop(1, '#616161'); // 700

        /* Create inner gradient for the outer ring */
        innerGrad = ctx.createLinearGradient(cX, cX * 0.133333, cX, canvas.height - cX * 0.133333);
        innerGrad.addColorStop(0, '#616161'); // 700
        innerGrad.addColorStop(1, '#323232'); // 850 ?

        /* Tube gradient (background, not the spiral gradient) */
        tubeGrad = ctx.createLinearGradient(cX, 0, cX, canvas.height);
        tubeGrad.addColorStop(0, '#616161'); // 700
        tubeGrad.addColorStop(1, '#323232'); // 850 ?

        /* knob gradient */
        knobgrad = ctx.createLinearGradient(cX, 0, cX, canvas.height);
        knobgrad.addColorStop(0, '#00796B'); // teal 700
        knobgrad.addColorStop(1, '#004D40'); // teal 900

        /* The inner circle is 2/3rds the size of the outer one */
        innerRadius = cX * 0.45;
        /* Outer radius is the same as the width / 2, same as the centre x
        * (but we leave a little room so the borders aren't truncated) */
        radius = cX;

        /* Calculate the radii of the inner tube */
        innerBarRadius = innerRadius + (cX * 0.07);
        outerBarRadius = (innerBarRadius + radius) / 2 - (cX * 0.07);
        knobRadius = (innerBarRadius+outerBarRadius)/2,

/* Second inner tube */
innerBarRadius2 = (innerBarRadius + radius) / 2 + (cX * 0.02);
outerBarRadius2 = radius - (cX * 0.07);

        /* Bottom left angle */
        startAngle = 2.1707963267949 + 0.9707963267949/3;
        /* Bottom right angle */
        endAngle = 0.9707963267949 - (0.9707963267949/3) + (Math.PI * 2.0);

        /* Nicer to pass counterClockwise / clockwise into canvas functions
        * than true / false */
        counterClockwise = false;

        /* Borders should be 1px */
        ctx.lineWidth = 1;

        /**
         * Little helper method for transforming points on a given
         * angle and distance for code clarity
         */
        applyAngle = function (point, angle, distance) {
            return {
                x : point.x + (Math.cos(angle) * distance),
                y : point.y + (Math.sin(angle) * distance)
            };
        };


        /**
         * render the widget in its entirety.
         */
        drawLoader = function () {
            /* Clear canvas entirely */
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            /*** IMAGERY ***/

            /* draw outer circle */
            ctx.fillStyle = lingrad;
            ctx.beginPath();
            ctx.strokeStyle = '#424242'; // 800
            ctx.arc(cX, cY, radius, 0, Math.PI * 2, counterClockwise);
            ctx.fill();
            ctx.stroke();

            /* draw inner circle */
            ctx.fillStyle = innerGrad;
            ctx.beginPath();
            ctx.arc(cX, cY, innerRadius, 0, Math.PI * 2, counterClockwise);
            ctx.fill();
            ctx.stroke();

            ctx.beginPath();

            /**
             * Helper function - adds a path (without calls to beginPath or closePath)
             * to the context which describes the inner tube. We use this for drawing
             * the background of the inner tube (which is always at 100%) and the
             * progress meter itself, which may vary from 0-100% */
            function makeInnerTubePath(startAngle, endAngle, innerBarRadius, outerBarRadius, capLength = 0) {
                var centrePoint, startPoint, controlAngle, c1, c2, point1, point2;
                centrePoint = {
                    x : cX,
                    y : cY
                };

                startPoint = applyAngle(centrePoint, startAngle, innerBarRadius);

                ctx.moveTo(startPoint.x, startPoint.y);

                point1 = applyAngle(centrePoint, endAngle, innerBarRadius);
                point2 = applyAngle(centrePoint, endAngle, outerBarRadius);

                controlAngle = endAngle + (3.142 / 2.0);
                /* Cap length - a fifth of the canvas size minus 4 pixels */
                capLength = capLength || (cX * 0.20) - 4;

                c1 = applyAngle(point1, controlAngle, capLength);
                c2 = applyAngle(point2, controlAngle, capLength);

                ctx.arc(cX, cY, innerBarRadius, startAngle, endAngle, false);
                ctx.bezierCurveTo(c1.x, c1.y, c2.x, c2.y, point2.x, point2.y);
                ctx.arc(cX, cY, outerBarRadius, endAngle, startAngle, true);

                point1 = applyAngle(centrePoint, startAngle, innerBarRadius);
                point2 = applyAngle(centrePoint, startAngle, outerBarRadius);

                controlAngle = startAngle - (3.142 / 2.0);

                c1 = applyAngle(point2, controlAngle, capLength);
                c2 = applyAngle(point1, controlAngle, capLength);

                ctx.bezierCurveTo(c1.x, c1.y, c2.x, c2.y, point1.x, point1.y);
            }

            /* Background tube */
            ctx.beginPath();
            ctx.strokeStyle = '#757575cc'; // 600 + alpha
            makeInnerTubePath(startAngle, endAngle, innerBarRadius, outerBarRadius);
            ctx.fillStyle = tubeGrad;
            ctx.fill();
            ctx.stroke();

/* Background tube 2 */
ctx.beginPath();
ctx.strokeStyle = '#757575cc'; // 600 + alpha
makeInnerTubePath(startAngle, endAngle, innerBarRadius2, outerBarRadius2, 4);
ctx.fillStyle = tubeGrad;
ctx.fill();
ctx.stroke();

            /* Calculate angles for the the progress metre */
            completeAngle2 = startAngle + (progress * (endAngle - startAngle));
            completeAngle1 = startAngle + (degress * (endAngle - startAngle));

            ctx.beginPath();
            makeInnerTubePath(completeAngle1, completeAngle2, innerBarRadius, outerBarRadius);

            /* We're going to apply a clip so save the current state */
            ctx.save();
            /* Clip so we can apply the image gradient */
            ctx.clip();

            /* Draw the spiral gradient over the clipped area */
            ctx.scale(-1, 1);
            ctx.drawImage(gradient, canvas.width*-1, 0, canvas.width, canvas.height);

            /* Undo the clip */
            ctx.restore();

            /* Draw the outline of the path */
            ctx.beginPath();
            makeInnerTubePath(completeAngle1, completeAngle2, innerBarRadius, outerBarRadius);
            ctx.stroke();

            // rajout des knobs.
            ctx.shadowColor = "rgba(21,21,21,0.4)";
            ctx.shadowBlur = 4;
            ctx.shadowOffsetY = 3;

			var knob2X = cX + Math.cos(completeAngle2)*knobRadius, knob2Y = cY + Math.sin(completeAngle2)*knobRadius,
			    knob1X = cX + Math.cos(completeAngle1)*knobRadius, knob1Y = cY + Math.sin(completeAngle1)*knobRadius;
			ctx.fillStyle = knobgrad;
            ctx.beginPath();
            ctx.arc(knob1X, knob1Y, (outerBarRadius - innerBarRadius)*0.8, 0, Math.PI * 2, counterClockwise);
            ctx.fill();
            ctx.fillStyle = knobgrad;
            ctx.beginPath();
            ctx.arc(knob2X, knob2Y, (outerBarRadius - innerBarRadius)*0.8, 0, Math.PI * 2, counterClockwise);
            ctx.fill();

            ctx.shadowColor = '#000000';
            ctx.shadowBlur = 0;
            ctx.shadowOffsetY = 0;

            /*** TEXT ***/
            (function () {
                var fontSize, string, smallSize, heightRemaining;
                /* Calculate the size of the font based on the canvas size */
                fontSize = cX / 4;

                percentageText.style.top = ((settings.height / 2.15) - (fontSize / 2)).toString() + 'px';
                percentageText.style.color = '#FFFFFF';
                percentageText.style.font = fontSize.toString() + 'px';
                percentageText.style.textShadow = '0 1px 1px #424242';

                /* Calculate the text for the progresses */
                string = (degress * settings.scaleAmplitude + settings.scaleOffset).toFixed(settings.precision) + ' ~ ' + (progress * settings.scaleAmplitude + settings.scaleOffset).toFixed(settings.precision) + '<br/><br/><small>' + settings.suffix + '</small>';

                percentageText.innerHTML = string;

                /* Calculate font and placement of small 'value' text */
                smallSize = cX / 5.5;
                valueText.style.color = '#E0E0E0'; // 300
                valueText.style.font = smallSize.toString() + 'px';
                valueText.style.height = smallSize.toString() + 'px';
                valueText.style.overflow = 'visible';
                valueText.style.textShadow = '0 1px 1px #424242';

                /* Ugly vertical align calculations - fit into bottom ring.
                 * The bottom ring occupes 1/6 of the diameter of the circle */
                heightRemaining = (settings.height * 0.15) - smallSize;
                valueText.style.top = ((settings.height * 0.85) + (heightRemaining / 4)).toString() + 'px';
            }());
        };

        /**
        * Check the progress value and ensure it is within the correct bounds [0..1]
        */
        clipValue = function (inverse) {
            if (progress < 0) {
                progress = 0;
            }
            if (progress > 1.0) {
                progress = 1.0;
            }
            if (degress < 0) {
                degress = 0;
            }
            if (degress > 1.0) {
                degress = 1.0;
            }
            if (degress > progress) {
            	if(inverse) progress = degress;
            	else degress = progress;
            }
        };

        /* Sets the current progress level of the loader
         *
         * @param value the progress value, from 0 to 1. Values outside this range
         * will be clipped
         */
        setProgress = function (value) {
            /* Clip values to the range [0..1] */
            progress = value;
            clipValue(false);
            drawLoader();
        };
        setDegress = function (value) {
            /* Clip values to the range [0..1] */
            degress = value;
            clipValue(true);
            drawLoader();
        };

        this.setProgress = setProgress;
        this.setDegress = setDegress;

        setValue = function (val) {
            value = val;
            valueText.innerHTML = value;
        };

        this.setValue = setValue;
        this.setValue(settings.value);

        progress = settings.progress;
        degress = settings.degress;
        clipValue(false);

        /* Do an initial draw */
        drawLoader();

        /* In controllable mode, add event handlers */
        if (params.controllable === true) {
            (function () {
                var mouseDown1, mouseDown2, getDistance, adjustProgressWithXY, adjustDegressWithXY;
                getDistance = function (x1, y1, x2, y2) {
                    return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
                };

                mouseDown1 = false; mouseDown2 = false;

                adjustProgressWithXY = function (x, y) {
                    /* within the bar, calculate angle of touch point */
                    var pX, pY, angle, startTouchAngle, range, posValue;
                    pX = x - cX;
                    pY = y - cY;

                    angle = Math.atan2(pY, pX);
                    if (angle > Math.PI / 2.0) {
                        angle -= (Math.PI * 2.0);
                    }

                    startTouchAngle = startAngle - (Math.PI * 2.0);
                    range = endAngle - startAngle;
                    posValue = (angle - startTouchAngle) / range;
                    var oldDegress = degress;
                    setProgress(posValue);

                    if (params.onProgressUpdate) {
                        /* use the progress value as this will have been clipped
                         * to the correct range [0..1] after the call to setProgress
                         */
                        params.onProgressUpdate(progress);
                    }
                    if (degress != oldDegress && params.onDegressUpdate) {
                        /* use the progress value as this will have been clipped
                         * to the correct range [0..1] after the call to setProgress
                         */
                        params.onDegressUpdate(degress);
                    }
                    degress = oldDegress;
                };

                adjustDegressWithXY = function (x, y) {
                    /* within the bar, calculate angle of touch point */
                    var pX, pY, angle, startTouchAngle, range, posValue;
                    pX = x - cX;
                    pY = y - cY;

                    angle = Math.atan2(pY, pX);
                    if (angle > Math.PI / 2.0) {
                        angle -= (Math.PI * 2.0);
                    }

                    startTouchAngle = startAngle - (Math.PI * 2.0);
                    range = endAngle - startAngle;
                    posValue = (angle - startTouchAngle) / range;
                    var oldProgress = progress;
                    setDegress(posValue);

                    if (params.onDegressUpdate) {
                        /* use the progress value as this will have been clipped
                         * to the correct range [0..1] after the call to setProgress
                         */
                        params.onDegressUpdate(degress);
                    }
                    if (progress != oldProgress && params.onProgressUpdate) {
                        /* use the progress value as this will have been clipped
                         * to the correct range [0..1] after the call to setProgress
                         */
                        params.onProgressUpdate(progress);
                    }
                    progress = oldProgress;
                };

                $(outerDiv).mousedown(function (e) {
                    var offset, x, y, distance;
                    offset = $(this).offset();
                    x = e.pageX - offset.left;
                    y = e.pageY - offset.top;

                    distance = getDistance(x, y, cX, cY);

                    if (distance > innerRadius*0.9 && distance < radius*1.1) { // TODO !0: scinder en deux le boudin, en 2 if() {}
                    	outerDiv.style.cursor = 'move';

                    	// search for nearest knob
                    	var centrePoint = { x : cX, y : cY };
                    	completeAngle2 = startAngle + (progress * (endAngle - startAngle));
                        completeAngle1 = startAngle + (degress * (endAngle - startAngle));
                    	var point2 = applyAngle(centrePoint, completeAngle2, knobRadius),
                    		point1 = applyAngle(centrePoint, completeAngle1, knobRadius);

                    	if (getDistance(x, y, point1.x, point1.y) >= getDistance(x, y, point2.x, point2.y)) {
                    		mouseDown2 = true;
                            adjustProgressWithXY(x, y);
                    	} else {
	                        mouseDown1 = true;
	                        adjustDegressWithXY(x, y);
                    	}
                    }
                    if (distance <= innerRadius*0.9) {
                    	if (params.onCenterClick) {
                            params.onCenterClick();
                        }
                    }
                }).mouseup(function () {
                    mouseDown1 = false; mouseDown2 = false;
                    outerDiv.style.cursor = 'default';
                    if (params.onKnobRelease) params.onKnobRelease();
                }).mousemove(function (e) {
                    var offset, x, y;
                    if (mouseDown1) {
                        offset = $(outerDiv).offset();
                        x = e.pageX - offset.left;
                        y = e.pageY - offset.top;
                        adjustDegressWithXY(x, y);
                    } else if (mouseDown2) {
                        offset = $(outerDiv).offset();
                        x = e.pageX - offset.left;
                        y = e.pageY - offset.top;
                        adjustProgressWithXY(x, y);
                    }
                }).mouseleave(function () {
                    mouseDown1 = false; mouseDown2 = false;
                    outerDiv.style.cursor = 'default';
                    if (params.onKnobRelease) params.onKnobRelease();
                });
            }());
        }
        return this;
    };



    /** Temperature loader
     * @param	params	Specify options in {}.
     *
     * @example $("#myloader-container).temperatureLoader({
		    minValue: 17,
		    maxValue: 25,
		    scaleOffset: 14.0,
            scaleAmplitude: 18.0,
		    title: 'Temperature'
		    suffix: '( °C )',
            precision: 1,
            onMinUpdate,
            onMaxUpdate
		});
     */
    $.fn.temperatureLoader = function (params) {
    	var settings, loader, thermostat, setMinValue, setMaxValue, setSize, setTitle, minChanged = false, maxChanged = false, oldMinValue, oldMaxValue;
    	thermostat = $(this);

	    /* Specify default settings */
	    settings = {
	        minValue: 17,
		    maxValue: 25,
		    scaleOffset: 14.0,
            scaleAmplitude: 18.0,
		    title: 'Temperature',
		    suffix: '( °C )',
            precision: 1,
            onMinUpdate: function(oldValue, newValue, componentData) {},
            onMaxUpdate: function(oldValue, newValue, componentData) {},
            onCenterClick: function(componentData) {},
            onUpdating: function() {},
            componentData: {}
	    };

	    /* Override default settings with provided params, if any */
	    if (params !== undefined) {
	        $.extend(settings, params);
	    } else {
	        params = settings;
	    }

	    oldMinValue = settings.minValue;
	    oldMaxValue = settings.maxValue;

	    setMinValue = function(val) {
	    	settings.minValue = (val - settings.scaleOffset) / settings.scaleAmplitude;
	    	loader.setDegress(settings.minValue);
        };
        thermostat.setMinValue = setMinValue;

        setMaxValue = function(val) {
        	settings.maxValue = (val - settings.scaleOffset) / settings.scaleAmplitude;
            loader.setProgress(settings.maxValue);
        };
        thermostat.setMaxValue = setMaxValue;

        setTitle = function(val) {
            settings.title = val;
            loader.setValue(val);
        };
        thermostat.setTitle = setTitle;

        setSize = function(size) {
        	if (thermostat.children().length > 0) {
        		thermostat.html('');
        	}
        	loader = thermostat.percentageLoader({
    	    	width: size,
                height: size,
                degress: (settings.minValue - settings.scaleOffset) / settings.scaleAmplitude,
                progress: (settings.maxValue - settings.scaleOffset) / settings.scaleAmplitude,
                scaleOffset: settings.scaleOffset,
                scaleAmplitude: settings.scaleAmplitude,
                value: settings.title,
                suffix: settings.suffix,
                precision: settings.precision,
                controllable: true,
                onProgressUpdate : function(value) {
                	var val2 = (settings.scaleOffset + value * settings.scaleAmplitude).toFixed(settings.precision);
                	if (!maxChanged) oldMaxValue = settings.maxValue;
                	if (settings.maxValue != val2) {
	                	settings.maxValue = val2;
	                	maxChanged = true;
                	}
                    settings.onUpdating();
                },
                onDegressUpdate : function(value) {
                	var val2 = (settings.scaleOffset + value * settings.scaleAmplitude).toFixed(settings.precision);
                	if (!minChanged) oldMinValue = settings.minValue;
                	if (settings.minValue != val2) {
                		settings.minValue = val2;
                		minChanged = true;
                	}
                    settings.onUpdating();
                },
                onCenterClick : function() {
                	settings.onCenterClick(settings.componentData);
                },
                onKnobRelease : function() {
                	if (maxChanged) {
                		settings.onMaxUpdate(oldMaxValue, settings.maxValue, settings.componentData);
                		maxChanged = false;
                	}
                	if (minChanged) {
                		settings.onMinUpdate(oldMinValue, settings.minValue, settings.componentData);
                		minChanged = false;
                	}
                }
    	    });
        }
        thermostat.setSize = setSize;

        this.resizer = function() {
            var size = Math.max(128, Math.min(thermostat.width(), thermostat.height()));
            thermostat.setSize(size);
            return true;
        };

        this.setTitle = thermostat.setTitle;

        $( window ).resize(this.resizer);
        thermostat.resize(this.resizer);

	    /* init */
        this.resizer(); // also instantiate the component for the first time.

    	return this;
    };

}(jQuery));
