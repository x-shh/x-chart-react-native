window.infChart = window.infChart || {};

(function (H, infChart) {

    var UNDEFINED,
        ALIGN_FACTOR,
        Chart = H.Chart,
        extend = H.extend,
        merge = H.merge;
        
    H.ALLOWED_SHAPES = ["path", "rect", "circle", "symbol", "label"];

    ALIGN_FACTOR = {
        top: 0,
        left: 0,
        center: 0.5,
        middle: 0.5,
        bottom: 1,
        right: 1
    };


    H.SVGRenderer.prototype.symbols.line = function (x, y, w, h) {
        var p = 2;
        return [
            'M', x + p, y + p, 'L', x + w - p, y + h - p
        ];
    };
// VML fallback
    if (H.VMLRenderer) {
        H.VMLRenderer.prototype.symbols.line = H.SVGRenderer.prototype.symbols.line;
    }

    /**
     * Draw ellipse symbol
     * @param x start x point of the bounding rectangle
     * @param y start y point of the bounding rectangle
     * @param w width of the bounding rectangle
     * @param h height of the bounding rectangle
     * @returns svg ellipse path
     */
    H.SVGRenderer.prototype.symbols.ellipse = function (x, y, w, h) {
        return [
            'M', x + w / 2, y,
            'A', w / 2, h / 2, 0, 0, 1, x + w, y + h / 2,
            'A', w / 2, h / 2, 0, 0, 1, x + w / 2, y + h,
            'A', w / 2, h / 2, 0, 0, 1, x, y + h / 2,
            'A', w / 2, h / 2, 0, 0, 1, x + w / 2, y
        ];
    };

    H.SVGRenderer.prototype.symbols.upArrow = function (x, y, w, h) {
        return [
            'M', x + w / 2, y, 'L', x + w, y + 0.375 * h, 'L', x + 0.75 * w, y + 0.375 * h, 'L', x + 0.75 * w, y + h,
            'L', x + w / 4, y + h,
            'L', x + w / 4, y + 0.375 * h, 'L', x, y + 0.375 * h,
            'Z'
        ];
    };

    H.SVGRenderer.prototype.symbols.downArrow = function (x, y, w, h) {
        return [
            'M', x + w / 2, y + h, 'L', x + w, y + 0.625 * h, 'L', x + 0.75 * w, y + 0.625 * h, 'L', x + 0.75 * w, y,
            'L', x + w / 4, y,
            'L', x + w / 4, y + 0.625 * h, 'L', x, y + 0.625 * h,
            'Z'
        ];
    };

    H.SVGRenderer.prototype.symbols.rectangle = function (x, y, w, h) {
        return [
            'M', x, y, 'L', x + w, y,
            'L', x + w, y + h,
            'L', x, y + h,
            'L', x, y
        ];
    };
// VML fallback
    if (H.VMLRenderer) {
        H.VMLRenderer.prototype.symbols.text = H.SVGRenderer.prototype.symbols.text;
    }


// when drawing annotation, don't zoom/select place
    H.wrap(H.Pointer.prototype, 'drag', function (c, e) {
        if (!this.chart.annotations || this.chart.annotations.allowZoom) {
            c.call(this, e);
        }
    });

    /*	H.wrap(H.Axis.prototype, 'drawCrosshair', function(proceed, e, point) {
     if(!this.chart.annotations || this.chart.annotations.allowZoom){
     proceed.call(this, e, point);
     }
     });*/

// deselect active annotation
    H.wrap(H.Pointer.prototype, 'onContainerMouseDown', function (c, e) {
        c.call(this, e);
        var stockChartId = infChart.drawingsManager.getChartIdFromHighchartInstance(this.chart);
        var chartInstance = infChart.manager.getChart(stockChartId);
        if(!chartInstance.throughTheDrawingClick){
            infChart.structureManager.settings.hideAllSettingsPopups(true);
            if (this.chart.selectedAnnotation) {
                this.chart.selectedAnnotation.events.deselect.call(this.chart.selectedAnnotation, e, true);
            }
        }
        chartInstance.throughTheDrawingClick = false;
    });

    H.wrap(H.Pointer.prototype, 'onContainerTouchStart', function (c, e) {
        c.call(this, e);
        infChart.structureManager.settings.hideAllSettingsPopups(true);
        if (this.chart.selectedAnnotation) {
            this.chart.selectedAnnotation.events.deselect.call(this.chart.selectedAnnotation, e, true);
        }
    });

// Highcharts helper methods

    var inArray = (typeof HighchartsAdapter == "undefined") ? H.inArray : HighchartsAdapter.inArray,
        addEvent = H.addEvent,
        isOldIE = H.VMLRenderer ? true : false;

// utils for buttons
    var utils = {
        getRadius: function (e) {
            var ann = this,
                chart = ann.chart,
                bbox = chart.container.getBoundingClientRect(),
                x = e.chartX,
                y = e.chartY,
                xAxis = chart.xAxis[ann.options.xAxis],
                yAxis = chart.yAxis[ann.options.yAxis],
                dx = Math.abs(x - xAxis.toPixels(ann.options.xValue)),
                dy = Math.abs(y - yAxis.toPixels(ann.options.yValue)),
                radius = parseInt(Math.sqrt(dx * dx + dy * dy), 10);
            ann.shape.attr({
                r: radius
            });
            return radius;
        },
        getRadiusAndUpdate: function (e) {
            var r = utils.getRadius.call(this, e);
            this.update({
                shape: {
                    params: {
                        r: r,
                        x: -r,
                        y: -r
                    }
                }
            });
        },
        getPath: function (e) {
            var ann = this,
                chart = ann.chart,
                bbox = chart.container.getBoundingClientRect(),
                x = e.chartX,
                y = e.chartY,
                xAxis = chart.xAxis[ann.options.xAxis],
                yAxis = chart.yAxis[ann.options.yAxis],
                dx = x - xAxis.toPixels(ann.options.xValue),
                dy = y - yAxis.toPixels(ann.options.yValue);

            var path = ['M', 0, 0, 'L', parseInt(dx, 10), parseInt(dy, 10)];
            ann.shape.attr({
                d: path
            });

            return path;
        },
        getPathAndUpdate: function (e) {
            var ann = this,
                chart = ann.chart,
                path = utils.getPath.call(ann, e),
                xAxis = chart.xAxis[ann.options.xAxis],
                yAxis = chart.yAxis[ann.options.yAxis],
                x = xAxis.toValue(path[4] + xAxis.toPixels(ann.options.xValue)),
                y = yAxis.toValue(path[5] + yAxis.toPixels(ann.options.yValue));

            this.update({
                xValueEnd: x,
                yValueEnd: y,
                shape: {
                    params: {
                        d: path
                    }
                }
            });
        },
        getRect: function (e) {
            var ann = this,
                chart = ann.chart,
                bbox = chart.container.getBoundingClientRect(),
                x = e.chartX,
                y = e.chartY,
                xAxis = chart.xAxis[ann.options.xAxis],
                yAxis = chart.yAxis[ann.options.yAxis],
                sx = xAxis.toPixels(ann.options.xValue),
                sy = yAxis.toPixels(ann.options.yValue),
                dx = x - sx,
                dy = y - sy,
                w = Math.round(dx) + 1,
                h = Math.round(dy) + 1,
                ret = {};

            ret.x = w < 0 ? w : 0;
            ret.width = Math.abs(w);
            ret.y = h < 0 ? h : 0;
            ret.height = Math.abs(h);

            ann.shape.attr({
                x: ret.x,
                y: ret.y,
                width: ret.width,
                height: ret.height
            });
            return ret;
        },
        getRectAndUpdate: function (e) {
            var rect = utils.getRect.call(this, e);
            this.update({
                shape: {
                    params: rect
                }
            });
        },
        getText: function (e) {
            // do nothing
        },
        showInput: function (e) {
            var ann = this,
                chart = ann.chart,
                index = chart.annotationInputIndex = chart.annotationInputIndex ? chart.annotationInputIndex : 1,
                input = document.createElement('span'),
                button;

            input.innerHTML = '<input type="text" class="annotation-' + index + '" placeholder="Add text"><button class=""> Done </button>';
            input.style.position = 'absolute';
            input.style.left = e.pageX + 'px';
            input.style.top = e.pageY + 'px';

            document.body.appendChild(input);
            input.querySelectorAll("input")[0].focus();
            button = input.querySelectorAll("button")[0];
            button.onclick = function () {
                var parent = this.parentNode;

                ann.update({
                    title: {
                        text: parent.querySelectorAll('input')[0].value
                    }
                });
                parent.parentNode.removeChild(parent);
            };
            chart.annotationInputIndex++;
        }
    };

    function defaultOptions(shapeType) {
        var shapeOptions,
            options;

        options = {
            xAxis: 0,
            yAxis: 0,
            shape: {
                params: {
                    stroke: "#000000",
                    fill: "rgba(0,0,0,0)",
                    'stroke-width': 2
                }
            }
        };

        shapeOptions = {
            circle: {
                params: {
                    x: 0,
                    y: 0
                }
            }
        };

        if (shapeOptions[shapeType]) {
            options.shape = merge(options.shape, shapeOptions[shapeType]);
        }

        return options;
    }


    function defatultMainOptions() {
        var buttons = [],
            shapes = ['circle', 'line', 'square', 'text'],
            types = ['circle', 'path', 'rect', null],
            params = [{
                r: 0,
                fill: 'rgba(255,0,0,0.4)',
                stroke: 'black'
            }, {
                d: ['M', 0, 0, 'L', 10, 10],
                fill: 'rgba(255,0,0,0.4)',
                stroke: 'black'
            }, {
                width: 10,
                height: 10,
                fill: 'rgba(255,0,0,0.4)',
                stroke: 'black'
            }],
            steps = [utils.getRadius, utils.getPath, utils.getRect, utils.getText],
            stops = [utils.getRadiusAndUpdate, utils.getPathAndUpdate, utils.getRectAndUpdate, utils.showInput];

            shapes.forEach(function (s, i) {
            buttons.push({
                annotationEvents: {
                    step: steps[i],
                    stop: stops[i]
                },
                annotation: {
                    anchorX: 'left',
                    anchorY: 'top',
                    xAxis: 0,
                    yAxis: 0,
                    shape: {
                        type: types[i],
                        params: params[i]
                    }
                },
                symbol: {
                    shape: s,
                    size: 12,
                    style: {
                        'stroke-width': 2,
                        'stroke': 'black',
                        fill: 'red',
                        zIndex: 121
                    }
                },
                style: {
                    fill: 'black',
                    stroke: 'blue',
                    strokeWidth: 2
                },
                size: 12,
                states: {
                    selected: {
                        fill: '#9BD'
                    },
                    hover: {
                        fill: '#9BD'
                    }
                }
            });
        });

        return {
            enabledButtons: false,
            buttons: buttons,
            buttonsOffsets: [0, 0]
        };
    }

    function isArray(obj) {
        return Object.prototype.toString.call(obj) === '[object Array]';
    }

    function isNumber(n) {
        return typeof n === 'number';
    }

    function defined(obj) {
        return obj !== UNDEFINED && obj !== null;
    }

    function translatePath(d, xAxis, yAxis, xOffset, yOffset) {
        var len = d.length,
            i = 0,
            path = [];

        while (i < len) {
            if (typeof d[i] === 'number' && typeof d[i + 1] === 'number') {
                path[i] = xAxis.toPixels(d[i]) - xOffset;
                path[i + 1] = yAxis.toPixels(d[i + 1]) - yOffset;
                i += 2;
            } else {
                path[i] = d[i];
                i += 1;
            }
        }

        return path;
    }

    function createGroup(chart, i, clipPath, isBehind) {
        var parentNode = chart.seriesGroup.element.parentNode,
            group = chart.renderer.g("annotations-group-" + i);
        group.attr({
            zIndex: 7
        });
        group.add();
        group.clip(clipPath);
        if (isBehind) {
            parentNode.insertBefore(group.element, chart.seriesGroup.element);
        }
        return group;
    }


    function createClipPath(chart, y, x, utilizeAxes) {
        var clipBox = {
                x: y.left,
                y: y.top,
                width: y.width,
                height: y.height
            },
            cp = chart.renderer.clipRect(clipBox),
            renderer = chart.renderer;

        if (typeof utilizeAxes !== "undefined") {
            cp.axisClipPaths = {};
            if (utilizeAxes === "x") {
                cp.axisClipPaths.x = renderer.rect(clipBox.x, x.top + x.height, clipBox.width, x.axisTitleMargin, 0).add(cp.clipPath);
            } else if (utilizeAxes === "y") {
                cp.axisClipPaths.y = renderer.rect(clipBox.x + clipBox.width, clipBox.y, y.chart.axisOffset[y.side], clipBox.height, 0).add(cp.clipPath);
            } else {
                cp.axisClipPaths.x = renderer.rect(clipBox.x, x.top + x.height, clipBox.width, x.axisTitleMargin, 0).add(cp.clipPath);
                cp.axisClipPaths.y = renderer.rect(clipBox.x + clipBox.width, clipBox.y, y.chart.axisOffset[y.side], clipBox.height, 0).add(cp.clipPath);
            }
        }
        return cp;
    }

    function adjustClipPath(cp, y, x) {
        if (cp && cp.axisClipPaths) {
            var clipBox = {
                x: y.left,
                y: y.top,
                width: y.width,
                height: y.height
            };

            cp.attr(clipBox);

            if (cp.axisClipPaths.x) {
                cp.axisClipPaths.x.attr({
                    x: clipBox.x,
                    y: x.top + x.height,
                    width: clipBox.width,
                    height: x.axisTitleMargin
                });
            }

            if (cp.axisClipPaths.y) {
                cp.axisClipPaths.y.attr({
                    x: clipBox.x + clipBox.width,
                    y: clipBox.y,
                    width: y.chart.axisOffset[y.side],
                    height: clipBox.height
                });
            }
        }
    }

    function attachEvents(chart) {
        function drag(e) {
            e = chart.pointer.normalize(e);
            var bbox = chart.container.getBoundingClientRect(),
                clickX = e.chartX,
                clickY = e.chartY;

            if (!chart.isInsidePlot(clickX - chart.plotLeft, clickY - chart.plotTop) || chart.annotations.allowZoom) {
                return;
            }

            var xAxis = chart.xAxis[0],
                yAxis = chart.yAxis[0],
                selected = chart.annotations.selected;

            var options = merge(chart.annotations.options.buttons[selected].annotation, {
                xValue: xAxis.toValue(clickX),
                yValue: yAxis.toValue(clickY),
                allowDragX: true,
                allowDragY: true
            });

            chart.addAnnotation(options);

            chart.drawAnnotation = chart.annotations.allItems[chart.annotations.allItems.length - 1];

            infChart.util.bindEvent(document, 'mousemove', step);
        }

        function step(e) {
            e = chart.pointer.normalize(e);
            var selected = chart.annotations.selected;
            chart.annotations.options.buttons[selected].annotationEvents.step.call(chart.drawAnnotation, e);
        }

        function drop(e) {
            e = chart.pointer.normalize(e);
            infChart.util.unbindEvent(document, 'mousemove', step, true);

            // store annotation details
            if (chart.drawAnnotation) {
                var selected = chart.annotations.selected;
                chart.annotations.options.buttons[selected].annotationEvents.stop.call(chart.drawAnnotation, e);
            }
            chart.drawAnnotation = null;
        }

        infChart.util.bindEvent(chart.container, 'mousedown', drag);
        infChart.util.bindEvent(document, 'mouseup', drop);
    }

    function renderButtons(chart) {
        var buttons = chart.annotations.options.buttons;

        chart.annotations.buttons = chart.annotations.buttons || [];
        buttons.forEach(function (button, i) {
            chart.annotations.buttons.push(renderButton(chart, button, i));
        });
    }

    function renderButton(chart, button, i) {
        var userOffset = chart.annotations.options.buttonsOffsets,
            xOffset = chart.rangeSelector ? chart.rangeSelector.inputGroup.offset : 0,
            renderer = chart.renderer,
            symbol = button.symbol,
            offset = 30,
            symbolSize = symbol.size,
            buttonSize = button.size,
            x = chart.plotWidth + chart.plotLeft - ((i + 1) * offset) - xOffset - userOffset[0],
            y = chart.plotTop - (chart.rangeSelector ? 23 + buttonSize : 0) + userOffset[1],
            callback = button.events && button.events.click ? button.events.click : getButtonCallback(i, chart),
            selected = button.states.selected,
            hovered = button.states.hover;

        var button = renderer.button('', x, y, callback, {}, hovered, selected).attr({
            width: buttonSize,
            height: buttonSize,
            zIndex: 10
        });

        var s = renderer.symbol(
            symbol.shape,
            buttonSize - symbolSize / 2,
            buttonSize - symbolSize / 2,
            symbolSize,
            symbolSize
        ).attr(symbol.style).add(button);

        button.attr(button.style).add();

        return [button, s];
    }

    function getButtonCallback(index, chart) {
        return function () {
            var self = chart.annotations.buttons[index][0];
            if (self.state == 2) {
                chart.annotations.selected = -1;
                chart.annotations.allowZoom = true;
                self.setState(0);
            } else {
                if (chart.annotations.selected >= 0) {
                    chart.annotations.buttons[chart.annotations.selected][0].setState(0);
                }
                chart.annotations.allowZoom = false;
                chart.annotations.selected = index;
                self.setState(2);
            }
        };
    }

    function normalize(e, chart, chartPosition) {
        var chartX,
            chartY,
            ePos;

        // IE normalizing
        e = e || window.event;
        if (!e.target) {
            e.target = e.srcElement;
        }

        // iOS (#2757)
        ePos = e.touches ? (e.touches.length ? e.touches.item(0) : e.changedTouches[0]) : e;

        // Get mouse position
        if (!chartPosition) {
            chartPosition = H.offset(chart.container);
        }

        // chartX and chartY
        if (ePos.pageX === undefined) { // IE < 9. #886.
            chartX = Math.max(e.x, e.clientX - chartPosition.left); // #2005, #2129: the second case is
            // for IE10 quirks mode within framesets
            chartY = e.y;
        } else {
            chartX = ePos.pageX - chartPosition.left;
            chartY = ePos.pageY - chartPosition.top;
        }

        var event = extend(e, {
            chartX: Math.round(chartX),
            chartY: Math.round(chartY)
        });

        if (chart.infScaleX) {
            event.chartX = event.chartX / chart.infScaleX;
        }

        if (chart.infScaleY) {
            event.chartY = event.chartY / chart.infScaleY;
        }
        return event;
    }


// Define annotation prototype
    var Annotation = function () {
        this.init.apply(this, arguments);
    };
    Annotation.prototype = {
        /*
         * Initialize the annotation
         */
        init: function (chart, options) {
            var shapeType = options.shape && options.shape.type;

            this.chart = chart;
            this.options = merge({}, defaultOptions(shapeType), options);
            this.xEvents = [];
        },

        /*
         * Render the annotation
         */
        render: function (redraw) {
            var annotation = this,
                chart = this.chart,
                renderer = annotation.chart.renderer,
                group = annotation.group,
                title = annotation.title,
                shape = annotation.shape,
                options = annotation.options,
                titleOptions = options.title,
                shapeOptions = options.shape,
                allowDragX = options.allowDragX,
                allowDragY = options.allowDragY,
                allowDragByHandle = options.allowDragByHandle,
                xAxis = chart.xAxis[options.xAxis],
                yAxis = chart.yAxis[options.yAxis],
                hasEvents = annotation.hasEvents;

            if (!group) {
                group = annotation.group = renderer.g();
                var cls = options.cls ? " " + options.cls : "";
                group.attr({'class': "highcharts-annotation" + cls});
            }

            if (!shape && shapeOptions && inArray(shapeOptions.type, H.ALLOWED_SHAPES) !== -1) {
                if (options.shape.type === "symbol") {
                    shape = annotation.shape = renderer.symbol(shapeOptions.params.symbol, shapeOptions.params.x, shapeOptions.params.y, shapeOptions.params.width, shapeOptions.params.height, shapeOptions.params);
                } else if (options.shape.type === "label") {
                    shape = annotation.shape = renderer.label(shapeOptions.params.text, shapeOptions.params.x, shapeOptions.params.y, 'rect', null, null, true);
                } else {
                    shape = annotation.shape = renderer[options.shape.type](shapeOptions.params);
                }

                shape.add(group);
            }
            if (!title && titleOptions) {
                // title = annotation.title = renderer.label(titleOptions);
                title = annotation.title = renderer.label(titleOptions.text, titleOptions.x, titleOptions.y, Object.keys(titleOptions).indexOf('labelShape') !== -1? titleOptions.labelShape :'rect', null, null, null)
                    .css(titleOptions.style)
                    .attr(titleOptions.borderAttributes);
                title.add(group);
            }

            var touchStartDestroyEventT;
            if ((allowDragX || allowDragY || allowDragByHandle) && !hasEvents) {

                touchStartDestroyEventT = infChart.util.bindEvent(group.element, 'mousedown', function (e) {
                    var chartId = infChart.drawingsManager.getChartIdFromHighchartInstance(chart);
                    if (!infChart.drawingsManager.isMultipleDrawingsEnabled(chartId) && !infChart.drawingsManager.getIsActiveDeleteTool(chartId) && !infChart.drawingsManager.getIsActiveDrawingInprogress() && !infChart.drawingsManager.getIsActiveEraseMode(chartId) && (!chart.activeAnnotation || chart.activeAnnotation.options.id != annotation.options.id)) {
                        annotation.events.storeAnnotation(e, annotation, chart);
                        annotation.events.select(e, annotation);
                        annotation.chart.isAnnotationSelected = true;
                    }
                });

                //var destroyEventT = infChart.util.bindEvent(chart.container, 'mouseup', function (e) {
                //    annotation.events.releaseAnnotation(e, chart);
                //});

                // annotation.xEvents = annotation.xEvents.concat(destroyEventT);
                annotation.xEvents = annotation.xEvents.concat(touchStartDestroyEventT);

                attachCustomEvents(group, options.events);

            } else if (!hasEvents) {

                touchStartDestroyEventT = infChart.util.bindEvent(group.element, 'mousedown', function (e) {
                    annotation.events.select(e, annotation);
                    //annotation.chart.isAnnotationSelected = true;
                });

                annotation.xEvents = annotation.xEvents.concat(touchStartDestroyEventT);
                /*$(group.element).on('touchstart', function (e) {
                 annotation.events.select(e, annotation);
                 });*/
                attachCustomEvents(group, options.events);
            }

            this.hasEvents = true;

            if (options.behindSeries) {
                if (!chart.annotations.groups[options.yAxis + "-behind-series"]) {
                    var c = createClipPath(chart, yAxis);
                    chart.annotations.clipPaths[options.yAxis + "-behind-series"] = c;
                    chart.annotations.groups[options.yAxis + "-behind-series"] = createGroup(chart, options.yAxis + "-behind-series", c, true);
                }
                group.add(chart.annotations.groups[options.yAxis + "-behind-series"]);
            } else if (options.utilizeAxes) {
                var axisToExtend = options.utilizeAxes === "x" ? options.xAxis : options.utilizeAxes === "y" ? options.yAxis : options.xAxis + "_" + options.yAxis,
                    groupName = options.utilizeAxes + "-" + axisToExtend + "-utilizeAxes";

                if (!chart.annotations.groups[groupName]) {
                    var ac = createClipPath(chart, yAxis, xAxis, options.utilizeAxes);
                    chart.annotations.axisClipPaths[groupName] = {
                        clipPath: ac,
                        utilizeAxes: options.utilizeAxes,
                        y: options.yAxis,
                        x: options.xAxis
                    };
                    chart.annotations.groups[groupName] = createGroup(chart, groupName, ac, true);
                }
                group.add(chart.annotations.groups[groupName]);
            } else {
                group.add(chart.annotations.groups[options.yAxis]);
            }

            // link annotations to point or series
            annotation.linkObjects();

            if (redraw !== false) {
                annotation.redraw();
            }

            function attachCustomEvents(element, events) {
                if (defined(events)) {
                    for (var name in events) {
                        if (events.hasOwnProperty(name)) {
                            (function (name) {
                                var customDestroyEvent = H.addEvent(element.element, name, function (e) {
                                    events[name].call(annotation, e);
                                });
                                annotation.xEvents.push(customDestroyEvent);
                            })(name);
                        }
                    }
                }
            }
        },

        /*
         * Redraw the annotation title or shape after options update
         */
        redraw: function (redraw) {
            var options = this.options,
                chart = this.chart,
                group = this.group,
                title = this.title,
                shape = this.shape,
                linkedTo = this.linkedObject,
                xAxis = chart.xAxis[options.xAxis],
                yAxis = chart.yAxis[options.yAxis],
                width = options.width,
                height = options.height,
                anchorY = ALIGN_FACTOR[options.anchorY],
                anchorX = ALIGN_FACTOR[options.anchorX],
                resetBBox = false,
                shapeParams,
                linkType,
                series,
                param,
                bbox,
                x,
                y;

            if (linkedTo) {
                linkType = (linkedTo instanceof H.Point) ? 'point' : (linkedTo instanceof H.Series) ? 'series' : null;

                if (linkType === 'point') {
                    options.xValue = linkedTo.x;
                    options.yValue = linkedTo.y;
                    series = linkedTo.series;
                } else if (linkType === 'series') {
                    series = linkedTo;
                }

                if (group.visibility !== series.group.visibility) {
                    group.attr({
                        visibility: series.group.visibility
                    });
                }
            }


            // Based on given options find annotation pixel position
            // what is minPointOffset? Doesn't work in 4.0+
            x = (defined(options.xValue) ? xAxis.toPixels(options.xValue /* + xAxis.minPointOffset */) : options.x);
            y = defined(options.yValue) ? yAxis.toPixels(options.yValue) : options.y;

            if (isNaN(x) || isNaN(y) || !isNumber(x) || !isNumber(y)) {
                return;
            }


            if (title) {
                var attrs = options.title;
                if (isOldIE) {
                    title.attr({
                        text: attrs.text
                    });
                } else {
                    title.attr(attrs);
                }
                title.css(options.title.style);
                title.attr(options.title.borderAttributes);
                resetBBox = true;
            }

            if (shape) {
                shapeParams = extend({}, options.shape.params);
                if (options.shape.units === 'values') {
                    // For ordinal axis, required are x&Y values - #22
                    if (defined(shapeParams.x) && shapeParams.width) {
                        shapeParams.width = xAxis.toPixels(shapeParams.width + shapeParams.x) - xAxis.toPixels(shapeParams.x);
                        shapeParams.x = xAxis.toPixels(shapeParams.x);
                    } else if (shapeParams.width) {
                        shapeParams.width = xAxis.toPixels(shapeParams.width) - xAxis.toPixels(0);
                    } else if (defined(shapeParams.x)) {
                        shapeParams.x = xAxis.toPixels(shapeParams.x);
                    }

                    if (defined(shapeParams.y) && shapeParams.height) {
                        shapeParams.height = -yAxis.toPixels(shapeParams.height + shapeParams.y) + yAxis.toPixels(shapeParams.y);
                        shapeParams.y = yAxis.toPixels(shapeParams.y);
                    } else if (shapeParams.height) {
                        shapeParams.height = -yAxis.toPixels(shapeParams.height) + yAxis.toPixels(0);
                    } else if (defined(shapeParams.y)) {
                        shapeParams.y = yAxis.toPixels(shapeParams.y);
                    }

                    if (options.shape.type === 'path') {
                        shapeParams.d = translatePath(shapeParams.d, xAxis, yAxis, x, y);
                    }
                }
                //if(defined(options.yValueEnd) && defined(options.xValueEnd)){
                //	shapeParams.d = shapeParams.d || options.shape.d || ['M', 0, 0, 'L', 0, 0];
                //	shapeParams.d[4] = xAxis.toPixels(options.xValueEnd) - xAxis.toPixels(options.xValue);
                //	shapeParams.d[5] = yAxis.toPixels(options.yValueEnd) - yAxis.toPixels(options.yValue);
                //}

                // move the center of the circle to shape x/y
                if (options.shape.type === 'circle') {
                    shapeParams.x += shapeParams.r;
                    shapeParams.y += shapeParams.r;
                }

                resetBBox = true;
                shape.attr(shapeParams);
            }

            group.bBox = null;

            // If annotation width or height is not defined in options use bounding box size
            if (!isNumber(width)) {
                bbox = group.getBBox();
                width = bbox.width;
            }

            if (!isNumber(height)) {
                // get bbox only if it wasn't set before
                if (!bbox) {
                    bbox = group.getBBox();
                }

                height = bbox.height;
            }
            // Calculate anchor point
            if (!isNumber(anchorX)) {
                anchorX = ALIGN_FACTOR.center;
            }

            if (!isNumber(anchorY)) {
                anchorY = ALIGN_FACTOR.center;
            }

            // Translate group according to its dimension and anchor point
            //console.log(width+'/'+height);
            x = x - width * anchorX;
            y = y - height * anchorY;

            if (this.selectionMarker && this.selectionMarker.length > 0) {
                this.events.select({}, this);
            }

            if (redraw && chart.animation && defined(group.translateX) && defined(group.translateY)) {
                group.animate({
                    translateX: x,
                    translateY: y
                });
            } else {
                group.translate(x, y);
            }
        },

        /*
         * Show annotation, only for non-linked annotations
         */
        show: function () {
            if (!this.linkedObject) {
                this.visible = true;
                this.group.attr({
                    visibility: 'visible'
                });
            }
        },

        /*
         * Hide annotation, only for non-linked annotations
         */
        hide: function () {
            if (!this.linkedObject) {
                this.visible = false;
                this.group.attr({
                    visibility: 'hidden'
                });
            }
        },

        /*
         * Destroy the annotation
         */
        destroy: function () {
            var annotation = this,
                chart = this.chart,
                allItems = chart && chart.annotations.allItems,
                index = allItems && allItems.indexOf(annotation);

            if (chart) {
                chart.activeAnnotation = null;

                if (index > -1) {
                    allItems.splice(index, 1);
                    chart.options.annotations.splice(index, 1); // #33
                }

                ['title', 'shape', 'group'].forEach(function (element) {
                    if (annotation[element] && annotation[element].destroy) {
                        annotation[element].destroy();
                        annotation[element] = null;
                    } else if (annotation[element]) {
                        annotation[element].remove();
                        annotation[element] = null;
                    }
                });

                annotation.removeXEvents();

                annotation.group = annotation.title = annotation.shape = annotation.chart = annotation.options = annotation.hasEvents = null;
            }
        },

        /*
         * Update the annotation with a given options
         */
        update: function (options, redraw) {
            var annotation = this,
                chart = this.chart,
                allItems = chart.annotations.allItems,
                index = allItems.indexOf(annotation),
                o = merge(this.options, options);

            if (index >= 0) {
                chart.options.annotations[index] = o; // #33
            }

            this.options = o;

            // update link to point or series
            this.linkObjects();

            this.render(redraw);
        },
        removeXEvents: function () {
            var annotation = this;
            annotation.hasEvents = false;
            annotation.xEvents.forEach(function (event) {
                event();
            });
        },

        linkObjects: function () {
            var annotation = this,
                chart = annotation.chart,
                linkedTo = annotation.linkedObject,
                linkedId = linkedTo && (linkedTo.id || linkedTo.options.id),
                options = annotation.options,
                id = options.linkedTo;

            if (!defined(id)) {
                annotation.linkedObject = null;
            } else if (!defined(linkedTo) || id !== linkedId) {
                annotation.linkedObject = chart.get(id);
            }
        },
        events: {
            select: function (e, ann, isClick) {
                var chart = ann.chart,
                    prevAnn = chart.selectedAnnotation,
                    box,
                    padding = 10;

                if (prevAnn && prevAnn.selectionMarker && prevAnn.selectionMarker.length > 0 && prevAnn !== ann) {
                    prevAnn.events.deselect.call(prevAnn, e, true);
                }

                //if(ann.selectionMarker) {
                //	//ann.selectionMarker.destroy(); <-- if we destroy marker, then event won't be propagated
                //	//ann.group.bBox = null;
                //} else {
                //	box = ann.group.getBBox();
                //
                //	ann.selectionMarker = chart.renderer.rect(box.x - padding / 2, box.y - padding / 2, box.width + padding, box.height + padding).attr({
                //		'stroke-width': 1,
                //		stroke: 'black',
                //		fill: 'transparent',
                //		dashstyle: 'ShortDash',
                //		'shape-rendering': 'crispEdges'
                //	});
                //	ann.selectionMarker.add(ann.group);
                //}

                var stockChartId = infChart.manager.getContainerIdFromChart(chart.renderTo.id),
                    drawingObj = infChart.drawingsManager.getDrawingObject(stockChartId, ann.options.id);
                if (drawingObj.select) {
                    drawingObj.select(e);
                }
                chart.selectedAnnotation = ann;
            },
            deselect: function (e, isMouseOut) {
                if (this.selectionMarker && this.selectionMarker.length > 0 && this.group) {
                    for (var i = 0; i < this.selectionMarker.length; i++) {
                        this.selectionMarker[i].destroy();
                    }

                    this.selectionMarker = false;
                    this.group.bBox = null;
                    infChart.drawingsManager.closeActiveDrawingSettings();

                    var stockChartId = infChart.manager.getContainerIdFromChart(this.chart.renderTo.id),
                        drawingObj = infChart.drawingsManager.getDrawingObject(stockChartId, this.options.id);
                    //drawingObj.deselectFunction();
                    if (drawingObj.deselect) {
                        drawingObj.deselect(isMouseOut);
                    } else {
                        infChart.drawingUtils.common.onDeselect.call(this);
                    }
                    //drawingObj.deselectFunction(isMouseOut);
                } 
                if (this.chart.selectedAnnotation && this.chart.selectedAnnotation.options && this.chart.selectedAnnotation.options.id == this.options.id) {
                    this.chart.selectedAnnotation = null;
                }
                this.chart.isAnnotationSelected = false;
            },
            destroyAnnotation: function (annotation) {
                annotation.destroy();
            },
            translateAnnotation: function (event, chart) {
                var stockChartId = infChart.drawingsManager.getChartIdFromHighchartInstance(chart);
                var chartInstance = infChart.manager.getChart(stockChartId);
                var isPropergateEvent = chart.activeAnnotation.options.isLocked || chartInstance.isGloballyLocked;

                if(!isPropergateEvent){
                    event.stopPropagation();
                    //event.preventDefault();
                }
                //var container = chart.container;

                var note = chart.activeAnnotation;

                if (note) {
                    var bbox = chart.container.getBoundingClientRect(),
                    /*clickX = event.clientX - bbox.left,
                     clickY = event.clientY - bbox.top,*/
                        chartY = event.chartY,
                        chartX = event.chartX/*,
                     xDiff = event.clientX - note.startX,
                     yDiff = event.clientY - note.startY*/;
                    /*if (chart.infScaleY) {
                     yDiff = yDiff / chart.infScaleY;
                     }
                     if (chart.infScaleX) {
                     xDiff = xDiff / chart.infScaleX;
                     }*/
                    console.debug("event.clientY : " + event.clientY + "event.pageY : " + event.pageY + " , bbox.top : " + bbox.top + ", event.chartY : " + event.chartY);
                    console.debug(H.offset(chart.renderTo));

                    if (note.options.adjustYAxisToViewAnnotation) {
                        this.expandChart(chart, chartY);
                    } else if (!this.isInsidePlot(chart, chartX, chartY)) {
                        return;
                    }

                    var stockChartId = infChart.manager.getContainerIdFromChart(chart.renderTo.id),
                        drawingObj = infChart.drawingsManager.getDrawingObject(stockChartId, note.options.id);
                    var xAxis = note.chart.xAxis[note.options.xAxis];
                    var yAxis = note.chart.yAxis[note.options.yAxis];

                    var x = note.options.allowDragX ? chartX - note.startXDiff : note.group.translateX;
                    var y = note.options.allowDragY ? chartY - note.startYDiff : note.group.translateY;

                    /*console.debug("y : " + y + ", note.startYDiff : " + note.startYDiff + " , note.group.translateY : " + note.group.translateY);
                     */
                    if (note.options.adjustYAxisToViewAnnotation) {
                        //x = note.options.allowDragX ? clickX - chart.plotLeft : note.group.translateX;
                        //y = note.options.allowDragY ? clickY /*- chart.plotTop */ : note.group.translateY;

                        var chartMinPixels = yAxis.toPixels(yAxis.getExtremes().min),
                            heightObj = drawingObj.getPlotHeight? drawingObj.getPlotHeight(y) : {height: 0},
                            belowH = heightObj.isBelow && !isNaN(heightObj.below) ? heightObj.below : heightObj.height / 2,
                            upperH = heightObj.isUpper && !isNaN(heightObj.upper) ? heightObj.upper : heightObj.height / 2;

                        if (y < chart.margin[0] + upperH) {
                            y = chart.margin[0] + upperH;
                        } else if (y > (chartMinPixels - belowH )) {
                            y = chartMinPixels - belowH;
                        }
                    }

                    if ((!chart.activeAnnotation.options.isLocked) && (!chartInstance.isGloballyLocked) && (typeof note.options.validateTranslationFn === 'undefined' || (typeof note.options.validateTranslationFn === 'function' && note.options.validateTranslationFn.call(drawingObj, xAxis.toValue(x), yAxis.toValue(y))))) {
                        //  console.error("Y Value After = " + yAxis.toValue(y));
                        note.transX = x;
                        note.transY = y;

                        note.group.attr({
                            transform: 'translate(' + x + ',' + y + ')'
                        });
                        note.hadMove = true;

                        if (note.options.isRealTimeTranslation && chart.activeAnnotation && (chart.activeAnnotation.transX !== 0 || chart.activeAnnotation.transY !== 0)) {
                            this.calculateAndTranslate(event, chart.activeAnnotation, chart);
                            note.transX = 0;
                            note.transY = 0;
                            note.group.translateX = x;
                            note.group.translateY = y;
                        }
                    }
                }
            },
            isInsidePlot: function (chart, x, y) {
                var note = chart.activeAnnotation;
                var xAxis = note.chart.xAxis[note.options.xAxis];
                var yAxis = note.chart.yAxis[note.options.yAxis];
                var pixelRepresentValue = yAxis.toValue(0) - yAxis.toValue(1);
                var xAxisExtreme = xAxis.getExtremes(), yAxisExtreme = yAxis.getExtremes(),
                    xValue = xAxis.toValue(x), yValue = yAxis.toValue(y);

                return xValue >= xAxisExtreme.min && x <= xAxisExtreme.max && yValue >= yAxisExtreme.min && yValue <= yAxisExtreme.max;
            },
            expandChart: function (chartObj, y) {
                var note = chartObj.activeAnnotation;
                var yAxis = note.chart.yAxis[note.options.yAxis];
                var extremeMin = null, extremeMax = null, extremeVal;
                var yAxisExtremes = yAxis.getExtremes();
                var pixelRepresentValue = yAxis.toValue(0) - yAxis.toValue(1);
                var chartMinPixels = yAxis.toPixels(yAxisExtremes.min),
                    stockChartId = infChart.manager.getContainerIdFromChart(note.chart.renderTo.id);
                var drawingObj = infChart.drawingsManager.getDrawingObject(stockChartId, note.options.id),
                    heightObj = drawingObj.getPlotHeight? drawingObj.getPlotHeight(y) : {height: 0},
                    belowH = heightObj.isBelow && !isNaN(heightObj.below) ? heightObj.below : heightObj.height / 2,
                    upperH = heightObj.isUpper && !isNaN(heightObj.upper) ? heightObj.upper : heightObj.height / 2;

                if (y < upperH) {
                    extremeMax = yAxisExtremes.max + pixelRepresentValue * heightObj.height;
                    extremeMin = yAxisExtremes.min;

                    if ((yAxis.infMaxAnnotation || !yAxis.prevMaxAnnotation) && yAxis.infMaxAnnotation != note.options.id) {
                        yAxis.prevMaxAnnotation = yAxis.infMaxAnnotation || note.options.id;
                    }
                    yAxis.infMaxAnnotation = note.options.id;
                    yAxis.setExtremes(extremeMin, extremeMax, true, false);
                    yAxis.options.infMinLimit = false;
                    note.infExpanded = true;
                } else if (/*y <= chartMinPixels + 20 &&*/ y > (chartMinPixels - belowH)) {
                    extremeMin = yAxis.toValue(y + belowH);//yAxisExtremes.min - pixelRepresentValue * belowH;
                    extremeMax = yAxisExtremes.max;
                    if ((yAxis.infMinAnnotation || !yAxis.infMinAnnotation) && yAxis.infMinAnnotation != note.options.id) {
                        yAxis.prevMinAnnotation = yAxis.infMinAnnotation || note.options.id;
                    }
                    yAxis.infMinAnnotation = note.options.id;
                    var stkChart = drawingObj.stockChart,
                        dp = stkChart.getDecimalPlaces(stkChart.symbol),
                        baseY = Math.round(stkChart.getYLabel(extremeMin, false, true, true) * Math.pow(10, dp)) / Math.pow(10, dp),
                        zeroY = stkChart.convertBaseYValue(0, stkChart.isLog, stkChart.isCompare, stkChart.isPercent),
                        pxv = (yAxis.max - zeroY) / (yAxis.height - belowH);
                    //pixelRepresentValue = (extremeMax * ( 1 + yAxis.options.maxPadding ) - Math.max(zeroY, extremeMin) * (1 + yAxis.options.maxPadding)) / (yAxis.height - belowH),
                    /*   pad = ( (belowH) * pixelRepresentValue) / (extremeMax - Math.max(zeroY, extremeMin));*/
                    extremeMin = baseY > 0 ? extremeMin : Math.round((zeroY - pxv * belowH ) * Math.pow(10, dp)) / Math.pow(10, dp);
                    note.infExpanded = true;
                    // yAxis.options.minPadding = pad;
                    // extremeMax = yAxisExtremes.max;.
                    if (!yAxis.options.infMinLimit && yAxis.min != extremeMin) {
                        if (baseY <= 0) {
                            yAxis.options.infMinLimit = {
                                val: extremeMin,
                                isLog: stkChart.isLog,
                                isCompare: stkChart.isCompare,
                                isPercent: stkChart.isPercent
                            };
                        }
                        yAxis.setExtremes(extremeMin, extremeMax, true, false);
                    } else {
                        yAxis.options.infMinLimit = false;
                    }
                }
            },
            getStockChartObj: function (annotation) {
                var stockChart;

                if (annotation && annotation.chart) {
                    var stockChartId = infChart.manager.getContainerIdFromChart(annotation.chart.renderTo.id);
                    var drawingObj = infChart.drawingsManager.getDrawingObject(stockChartId, annotation.options.id);
                    stockChart = drawingObj.stockChart;
                }

                return stockChart;
            },
            storeAnnotation: function (event, annotation, chart) {
                var stockChartId = infChart.drawingsManager.getChartIdFromHighchartInstance(chart);
                var chartInstance = infChart.manager.getChart(stockChartId);
                var isPropergateEvent = annotation.options.isLocked || chartInstance.isGloballyLocked;
                if (!chart.annotationDraging && !isPropergateEvent) {
                    event.stopPropagation();
                    //event.preventDefault();
                }
                chartInstance.throughTheDrawingClick = true;
                infChart.drawingsManager.setActiveAnnotationInprogress(annotation);
                if ((!isOldIE && !event.button) || (isOldIE && event.button === 1)) {
                    normalize(event, chart);
                    /*var posX = event.clientX,
                     posY = event.clientY;*/
                    chart.activeAnnotation = annotation;

                    chart.activeAnnotation.startXDiff = event.chartX - annotation.group.translateX;
                    chart.activeAnnotation.startYDiff = event.chartY - annotation.group.translateY;
                    chart.activeAnnotation.transX = 0;
                    chart.activeAnnotation.transY = 0;

                    annotation.options.yValueStore = annotation.options.yValue;
                    annotation.options.xValueStore = annotation.options.xValue;
                    if(annotation.options.nearestXValue){
                        annotation.options.nearestXValueStore = annotation.options.nearestXValue;
                    }
                    if(annotation.options.xValueEnd){
                        annotation.options.xValueEndStore = annotation.options.xValueEnd;
                    }
                    if(annotation.options.nearestXValueEnd){
                        annotation.options.nearestXValueEndStore = annotation.options.nearestXValueEnd;
                    }
                    if(annotation.options.trendXValue){
                        annotation.options.trendXValueStore = annotation.options.trendXValue;
                    }
                    if(annotation.options.nearestTrendXValue){
                        annotation.options.nearestTrendXValueStore = annotation.options.nearestTrendXValue;
                    }
                    if(annotation.options.intermediatePoints){
                        annotation.options.intermediatePointsStore = [];
                        infChart.util.forEach(annotation.options.intermediatePoints, function (index, value) {
                            var pointValues = {};
                            pointValues.xValue = value.xValue,
                            pointValues.yValue = value.yValue,
                            annotation.options.intermediatePointsStore[index] = pointValues;
                        });
                    }
                    if(annotation.options.linePointValues){
                        annotation.options.linePointValuesStore = [];
                        infChart.util.forEach(annotation.options.linePointValues, function (index, value) {
                            var pointValues = {};
                            pointValues.xValue = value.xValue,
                            pointValues.yValue = value.yValue,
                            annotation.options.linePointValuesStore[index] = pointValues;
                        });
                    }
                    if(annotation.options.nearestYValue){
                        annotation.options.nearestYValueStore = annotation.options.nearestYValue;
                    }
                    if(annotation.options.yValueEnd){
                        annotation.options.yValueEndStore = annotation.options.yValueEnd;
                    }
                    if(annotation.options.nearestYValueEnd){
                        annotation.options.nearestYValueEndStore = annotation.options.nearestYValueEnd;
                    }
                    if(annotation.options.trendYValue){
                        annotation.options.trendYValueStore = annotation.options.trendYValue;
                    }
                    if(annotation.options.nearestTrendYValue){
                        annotation.options.nearestTrendYValueStore = annotation.options.nearestTrendYValue;
                    }

                    if (annotation.options.adjustYAxisToViewAnnotation) {
                        chart.annotations.allowZoom = false;
                    }
                    //translateAnnotation(event);
                    if (!chart.activeAnnotation.options.removeMouseMove) {
                        annotation.options.removeMouseMove = infChart.util.bindEvent(chart.container, 'mousemove', function (e) {
                            normalize(e, chart);
                            annotation.options.mouseDownOnAnn = true;
                            chart.translateInProgress = true;
                            annotation.events.translateAnnotation(e, chart);
                        });
                    }
                    if (!chart.activeAnnotation.options.removeMouseUp) {
                        annotation.options.removeMouseUp = infChart.util.bindEvent(chart.container, 'mouseup', function (e) {
                            normalize(e, chart);
                            annotation.events.releaseAnnotation(e, chart);
                            annotation.options.mouseDownOnAnn = false;
                            chart.translateInProgress = false;
                        });
                    }

                    infChart.drawingsManager.onAnnotationStore(chart.activeAnnotation);
                    /*annotation.options.removeTouchMove = addEvent(document, 'touchmove', function (e) {
                     annotation.events.translateAnnotation(e, chart);
                     });*/
                    //addEvent(chart.container, 'mouseleave', releaseAnnotation); TO BE OR NOT TO BE?
                }
            },
            releaseAnnotation: function (event, chart) {
                var stockChartId = infChart.drawingsManager.getChartIdFromHighchartInstance(chart);
                var chartInstance = infChart.manager.getChart(stockChartId);
                var isPropergateEvent = chart.activeAnnotation && chart.activeAnnotation.options && chart.activeAnnotation.options.isLocked || chartInstance.isGloballyLocked;
                if(!isPropergateEvent){
                    event.stopPropagation();
                    //event.preventDefault();
                }
                infChart.drawingsManager.setActiveAnnotationInprogress(null);
                if (chart.activeAnnotation) {

                    if (chart.activeAnnotation.options.removeMouseMove) {
                        chart.activeAnnotation.options.removeMouseMove.forEach(function (removeFn) {
                            removeFn();
                        });
                        chart.activeAnnotation.options.removeMouseMove = undefined;
                    }

                    //IMPORTANT ::  Do not comment this section, it cause an issue with dragging drawing tools if commented,
                    if (chart.activeAnnotation.transX !== 0 || chart.activeAnnotation.transY !== 0) {
                        this.calculateAndTranslate(event, chart.activeAnnotation, chart);
                        chart.redraw(false);
                    }

                    chart.annotations.allowZoom = true;
                    if (chart.activeAnnotation.options.removeMouseUp) {
                        chart.activeAnnotation.options.removeMouseUp.forEach(function (removeFn) {
                            removeFn();
                        });
                        chart.activeAnnotation.options.removeMouseUp = undefined;
                    }
                    infChart.drawingsManager.onAnnotationRelease(chart.activeAnnotation);
                    chart.activeAnnotation.infExpanded = false;

                    var drawingObj = infChart.drawingsManager.getDrawingObject(infChart.manager.getContainerIdFromChart(chart.renderTo.id), chart.activeAnnotation.options.id);

                    if (drawingObj.translateEnd && drawingObj.wrapFunctionHelper && infChart.drawingsManager.hasPositionChanged(drawingObj.shape, drawingObj.annotation.options)) {
                        //drawingObj.translateEndFunction.call(drawingObj, event);
                        drawingObj.wrapFunctionHelper.call(drawingObj, "translateEndFunction",drawingObj.translateEnd, [event]);
                    }
                }

                chart.activeAnnotation = null;
            },
            calculateEndValue: function (xVal, xValEnd, newX, chart) {
                var nearDataPoint = infChart.math.findNearestDataPoint(chart, xVal, undefined, true, true);
                var percentageStart;
                var startIndex;
                var maxTimeValue = chart.series[0].xData[chart.series[0].xData.length - 1];
                var minTimeValue = chart.series[0].xData[0];
                var totalPoints = infChart.manager.getTotalPoints(chart);
                var isDrawinginDataRange = ((minTimeValue < xVal) && (minTimeValue < xValEnd) && (minTimeValue < newX));

                if (isDrawinginDataRange) {
                    if (nearDataPoint.xData > xVal) {
                        percentageStart = (nearDataPoint.xData - xVal) / (nearDataPoint.xData - totalPoints[nearDataPoint.dataIndex - 1]);
                        startIndex = nearDataPoint.dataIndex - percentageStart;
                    } else {
                        percentageStart = (xVal - nearDataPoint.xData) / (totalPoints[nearDataPoint.dataIndex + 1] - nearDataPoint.xData);
                        startIndex = nearDataPoint.dataIndex + percentageStart;
                    }

                    var nearEndDataPoint = infChart.math.findNearestDataPoint(chart, xValEnd, undefined, true, true);
                    var percentageEnd;
                    if (nearEndDataPoint.xData > xValEnd) {
                        percentageEnd = (nearEndDataPoint.xData - xValEnd) / (nearEndDataPoint.xData - totalPoints[nearEndDataPoint.dataIndex - 1]);
                        endIndex = nearEndDataPoint.dataIndex - percentageEnd;
                    } else {
                        percentageEnd = (xValEnd - nearEndDataPoint.xData) / (totalPoints[nearEndDataPoint.dataIndex + 1] - nearEndDataPoint.xData);
                        endIndex = nearEndDataPoint.dataIndex + percentageEnd;
                    }
                    candleGap = endIndex - startIndex;

                    var nearNewDataPoint = infChart.math.findNearestDataPoint(chart, newX, undefined, true, true);
                    if (nearNewDataPoint.xData > newX) {
                        percentageNewX = (nearNewDataPoint.xData - newX) / (nearNewDataPoint.xData - totalPoints[nearNewDataPoint.dataIndex - 1]);
                        newIndex = nearNewDataPoint.dataIndex - percentageNewX;
                    } else {
                        percentageNewX = (newX - nearNewDataPoint.xData) / (totalPoints[nearNewDataPoint.dataIndex + 1] - nearNewDataPoint.xData);
                        newIndex = nearNewDataPoint.dataIndex + percentageNewX;
                    }
                    finalIndex = newIndex + candleGap;

                    if (finalIndex < (totalPoints.length - 1) || finalIndex < 0) {
                        var floorIndex = Math.floor(finalIndex);
                        var floorValue = parseFloat(totalPoints[floorIndex]);
                        var partValue = finalIndex - floorIndex;
                        var newValue = floorValue + partValue * (totalPoints[floorIndex + 1] - floorValue);
                    } else {
                        var newValue = xValEnd - xVal + newX;
                    }
                } else {
                    var newValue = xValEnd - xVal + newX;
                }
                return newValue;
            },
            calculateAndTranslate: function (event, note, chart) {
                var self = this;
                var x = note.transX,
                    y = note.transY,
                    options = note.options,
                    xVal = options.xValue,
                    yVal = options.yValue,
                    xValEnd = options.xValueEnd,
                    yValEnd = options.yValueEnd,
                    trendYValue = options.trendYValue,
                    trendXValue = options.trendXValue,
                    allowDragX = options.allowDragX,
                    allowDragY = options.allowDragY,
                    xAxis = note.chart.xAxis[note.options.xAxis],
                    yAxis = note.chart.yAxis[note.options.yAxis],
                    newX = xAxis.toValue(x),
                    newY = yAxis.toValue(y),
                    stockChartId = infChart.manager.getContainerIdFromChart(note.chart.renderTo.id);
                    if(options.xValueEnd){
                        var xEnd = this.calculateEndValue(options.xValueStore, options.xValueEndStore, newX, chart);
                    }
                    if(options.trendXValue){
                        var xTrend = this.calculateEndValue(options.xValueStore, options.trendXValueStore, newX, chart);
                    }
                var newOptions;

                if (x !== 0 || y !== 0) {
                    if (allowDragX && allowDragY) {
                        newOptions = {
                            xValue: defined(xVal) ? newX : null,
                            yValue: defined(yVal) ? newY : null,
                            xValueEnd: defined(xValEnd) ? xEnd : null,
                            yValueEnd: defined(yValEnd) ? yValEnd - yVal + newY : null,
                            trendYValue: defined(trendYValue) ? trendYValue - yVal + newY : null,
                            trendXValue: defined(trendXValue) ? xTrend : null,
                            x: defined(xVal) ? null : x,
                            y: defined(yVal) ? null : y
                        };
                        if (options.intermediatePoints) {
                            newOptions.intermediatePoints = [];
                            infChart.util.forEach(options.intermediatePoints, function (index, value) {
                                xIntermediateValue = defined(value.xValue) ? self.calculateEndValue(options.xValueStore, options.intermediatePointsStore[index].xValue, newX, chart) : null;
                                value.xValue = defined(value.xValue) ? xIntermediateValue : null;
                                value.yValue = defined(value.yValue) ? value.yValue - yVal + newY : null;
                                newOptions.intermediatePoints[index] = value;
                            });
                        }
                        if(options.linePointValues){
                            newOptions.linePointValues = [];
                            infChart.util.forEach(options.linePointValues, function (index, pointValues) {
                                xpointValues = defined(pointValues.xValue) ? self.calculateEndValue(options.xValueStore, options.linePointValuesStore[index].xValue, newX, chart) : null;
                                pointValues.xValue = defined(pointValues.xValue) ? xpointValues : null;
                                pointValues.yValue = defined(pointValues.yValue) ? pointValues.yValue - yVal + newY : null;
                                newOptions.linePointValues[index] = pointValues;
                            });
                        }
                        note.update(newOptions, false);
                    } else if (allowDragX) {

                        newOptions = {
                            xValue: defined(xVal) ? newX : null,
                            yValue: defined(yVal) ? yVal : null,
                            xValueEnd: defined(xValEnd) ? xEnd : null,
                            yValueEnd: defined(yValEnd) ? yValEnd : null,
                            trendXValue: defined(trendXValue) ? xTrend : null,
                            x: defined(xVal) ? null : x,
                            y: defined(yVal) ? null : note.options.y
                        };

                        if (options.intermediatePoints) {
                            newOptions.intermediatePoints = [];
                            infChart.util.forEach(options.intermediatePoints, function (index, value) {
                                xIntermediateValue = defined(value.xValue) ? self.calculateEndValue(options.xValueStore, options.intermediatePointsStore[index].xValue, newX, chart) : null;
                                value.xValue = defined(value.xValue) ? xIntermediateValue : null;
                                newOptions.intermediatePoints[index] = value;
                            });
                        }
                        if(options.linePointValues){
                            newOptions.linePointValues = [];
                            infChart.util.forEach(options.linePointValues, function (index, pointValues) {
                                xpointValues = defined(pointValues.xValue) ? self.calculateEndValue(options.xValueStore, options.linePointValuesStore[index].xValue, newX, chart) : null;
                                pointValues.xValue = defined(pointValues.xValue) ? xpointValues : null;
                                pointValues.yValue = infChart.drawingUtils.common.getBaseYValues.call(self, yAxis.toValue(yAxis.toPixels(options.yValue) + pointValues.dy));
                                newOptions.linePointValues[index] = pointValues;
                            });
                        }
                        note.update(newOptions, false);
                    } else if (allowDragY) {
                        newOptions = {
                            xValue: defined(xVal) ? xVal : null,
                            yValue: defined(yVal) ? newY : null,
                            xValueEnd: defined(xValEnd) ? xValEnd : null,
                            yValueEnd: defined(yValEnd) ? yValEnd - yVal + newY : null,
                            trendYValue: defined(trendYValue) ? trendYValue - yVal + newY : null,
                            x: defined(xVal) ? null : note.options.x,
                            y: defined(yVal) ? null : y
                        };
                        if (note.options.intermediatePoints) {
                            newOptions.intermediatePoints = [];
                            infChart.util.forEach(options.intermediatePoints, function (index, value) {
                                value.yValue = defined(value.yValue) ? value.yValue - yVal + newY : null;
                                newOptions.intermediatePoints[index] = value;
                            });
                        }
                        note.update(newOptions, false);
                    }


                    var drawingObj = infChart.drawingsManager.getDrawingObject(stockChartId, note.options.id);
                    drawingObj.yValue = infChart.drawingUtils.common.getBaseYValue.call(drawingObj, note.options.yValue);
                    drawingObj.yValueEnd = infChart.drawingUtils.common.getBaseYValue.call(drawingObj, note.options.yValueEnd);
                    drawingObj.trendYValue = infChart.drawingUtils.common.getBaseYValue.call(drawingObj, note.options.trendYValue);

                    if(drawingObj.nearestYValue){
                        drawingObj.nearestYValue = infChart.drawingUtils.common.getBaseYValue.call(drawingObj, note.options.nearestYValue);
                    }
                    if(drawingObj.nearestYValueEnd){
                        drawingObj.nearestYValueEnd = infChart.drawingUtils.common.getBaseYValue.call(drawingObj, note.options.nearestYValueEnd);
                    }
                    if(drawingObj.nearestTrendYValue){
                        drawingObj.nearestTrendYValue = infChart.drawingUtils.common.getBaseYValue.call(drawingObj, note.options.nearestTrendYValue);
                    }

                    if (note.options.intermediatePoints) {
                        var intermediatePoints = [];
                        infChart.util.forEach(note.options.intermediatePoints, function(index, value){
                            intermediatePoints.push({
                                xValue: value.xValue,
                                yValue: infChart.drawingUtils.common.getBaseYValue.call(drawingObj, value.yValue)
                            });
                        });
                        drawingObj.intermediatePoints = intermediatePoints;
                    }

                    if (note.options.nearestIntermediatePoints) {
                        var nearestIntermediatePoints = [];
                        infChart.util.forEach(note.options.nearestIntermediatePoints, function(index, value){
                            nearestIntermediatePoints.push({
                                xValue: value.xValue,
                                yValue: infChart.drawingUtils.common.getBaseYValue.call(drawingObj, value.yValue)
                            });
                        });
                        drawingObj.nearestIntermediatePoints = nearestIntermediatePoints;
                    }

                    if (drawingObj.translateFunction) {
                        drawingObj.translateFunction(event);
                    }
                    if (options.mouseDownOnAnn && drawingObj.afterDrag) {
                        drawingObj.afterDrag(drawingObj, event);
                    }
                }
            }
        }
    };


// Add annotations methods to chart prototype
    extend(Chart.prototype, {
        /*
         * Unified method for adding annotations to the chart
         */
        addAnnotation: function (options, redraw) {
            var chart = this,
                annotations = chart.annotations.allItems,
                item,
                i,
                iter,
                len;

            if (!isArray(options)) {
                options = [options];
            }

            len = options.length;

            for (iter = 0; iter < len; iter++) {
                item = new Annotation(chart, options[iter]);
                i = annotations.push(item);
                if (i > chart.options.annotations.length) {
                    chart.options.annotations.push(options[iter]); // #33
                }
                item.render(redraw);
            }
        },

        /**
         * Redraw all annotations, method used in chart events
         */
        redrawAnnotations: function () {
            var chart = this,
                yAxes = chart.yAxis,
                xAxis = chart.xAxis,
                yLen = yAxes.length,
                ann = chart.annotations,
                userOffset = ann.options.buttonsOffsets,
                i = 0,
                axisClipPaths = ann.axisClipPaths;


            for (; i < yLen; i++) {
                var y = yAxes[i],
                    clip = ann.clipPaths[i],
                    behindSeries = ann.groups[i + '-behind-series'];

                if (clip) {
                    clip.attr({
                        x: y.left,
                        y: y.top,
                        width: y.width,
                        height: y.height
                    });
                } else {
                    var clipPath = createClipPath(chart, y);
                    ann.clipPaths[i] = clipPath;
                }
                if (behindSeries) {
                    var clipBehind = ann.clipPaths[i + '-behind-series'];
                    if (clipBehind) {
                        clipBehind.attr({
                            x: y.left,
                            y: y.top,
                            width: y.width,
                            height: y.height
                        });
                    } else {
                        clipPath = createClipPath(chart, y);
                        ann.clipPaths[i + '-behind-series'] = clipPath;
                        ann.groups[i + '-behind-series'] = createGroup(chart, i + '-behind-series', clipPath, true);
                    }
                }
            }

            for (var groupName in axisClipPaths) {
                if (axisClipPaths.hasOwnProperty(groupName)) {
                    var cpItem = axisClipPaths[groupName];
                    adjustClipPath(cpItem.clipPath, yAxes[cpItem.y], xAxis[cpItem.x]);
                }
            }

            chart.annotations.allItems.forEach(function (annotation) {
                annotation.redraw();
            });
            chart.annotations.buttons.forEach(function (button, i) {
                var xOffset = chart.rangeSelector ? chart.rangeSelector.inputGroup.offset : 0,
                    x = chart.plotWidth + chart.plotLeft - ((i + 1) * 30) - xOffset - userOffset[0];
                button[0].attr({
                    x: x
                });
            });
        }
    });


// Initialize on chart load
    Chart.prototype.callbacks.push(function (chart) {
        var options = chart.options.annotations,
            yAxes = chart.yAxis,
            yLen = yAxes.length,
            clipPaths = {},
            clipPath,
            groups = {},
            group,
            i = 0,
            clipBox;

        for (; i < yLen; i++) {
            var y = yAxes[i];
            var c = createClipPath(chart, y);
            clipPaths[i] = c;
            groups[i] = createGroup(chart, i, c);
            //groups[i + "-behind-series"] = createGroup(chart, i + "-behind-series", c);
        }


        if (!chart.annotations) chart.annotations = {};

        if (!chart.options.annotations) chart.options.annotations = [];

        // initialize empty array for annotations
        if (!chart.annotations.allItems) chart.annotations.allItems = [];

        // allow zoom or draw annotation
        chart.annotations.allowZoom = true;

        // link chart object to annotations
        chart.annotations.chart = chart;

        // link annotations group element to the chart
        chart.annotations.groups = groups;

        // add clip path to annotations
        chart.annotations.clipPaths = clipPaths;
        chart.annotations.axisClipPaths = {};

        if (isArray(options) && options.length > 0) {
            chart.addAnnotation(chart.options.annotations);
        }
        chart.annotations.options = merge(defatultMainOptions(), chart.options.annotationsOptions ? chart.options.annotationsOptions : {});

        if (chart.annotations.options.enabledButtons) {
            renderButtons(chart);
            attachEvents(chart);
        } else {
            chart.annotations.buttons = [];
        }

        // update annotations after chart redraw
        H.addEvent(chart, 'redraw', function () {
            if(!chart.isChartDragging && !chart.setExtremesByMouseWheel) {
                chart.redrawAnnotations();
            }
        });

    });

    if (!Array.prototype.indexOf) {
        Array.prototype.indexOf = function (searchElement /*, fromIndex */) {
            "use strict";
            if (this == null) {
                throw new TypeError();
            }
            var t = Object(this);
            var len = t.length >>> 0;
            if (len === 0) {
                return -1;
            }
            var n = 0;
            if (arguments.length > 1) {
                n = Number(arguments[1]);
                if (n != n) { // shortcut for verifying if it's NaN
                    n = 0;
                } else if (n != 0 && n != Infinity && n != -Infinity) {
                    n = (n > 0 || -1) * Math.floor(Math.abs(n));
                }
            }
            if (n >= len) {
                return -1;
            }
            var k = n >= 0 ? n : Math.max(len - Math.abs(n), 0);
            for (; k < len; k++) {
                if (k in t && t[k] === searchElement) {
                    return k;
                }
            }
            return -1;
        };
    }

}(Highcharts, infChart));