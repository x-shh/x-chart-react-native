window.infChart = window.infChart || {};

infChart.breakEvenLineDrawing = function () {
    infChart.drawingObject.apply(this, arguments);
};

infChart.breakEvenLineDrawing.prototype = Object.create(infChart.drawingObject.prototype);

infChart.breakEvenLineDrawing.prototype.additionalDrawingsFunction = function () { };

infChart.breakEvenLineDrawing.prototype.bindSettingsEvents = function () { };

infChart.breakEvenLineDrawing.prototype.destroyDrawing = function () { };

infChart.breakEvenLineDrawing.prototype.getConfig = function () { };

infChart.breakEvenLineDrawing.prototype.getOptions = function (properties) {
    var options = {
        xValue: properties.xValue,
        x: properties.x,
        yValue: properties.yValue,
        drawingType: infChart.constants.drawingTypes.trading,
        allowDragX: false,
        allowDragY: false,
        behindSeries: true,
        shape: {
            type: 'symbol',
            params: {
                'stroke-width': 0,
                width: 0,
                height: 0,
                symbol: 'rectangle',
                fill: {
                    linearGradient: {
                        x1: 0,
                        y1: 0,
                        x2: 0,
                        y2: 1
                    },
                    stops: [
                        [0, 'rgba(49, 175, 76,0)'],
                        [1, 'rgba(49, 175, 76,0.4)']
                    ]
                }
            }
        }
    };

    if (properties.width) {
        options.shape.params.width = properties.width;
    }
    if (properties.clickCords) {
        options.clickCords = properties.clickCords;
    }
    if (properties.fillColor) {
        options.shape.params.fill = properties.fillColor;
    }
    if (properties.isRealTimeTranslation) {
        options.isRealTimeTranslation = properties.isRealTimeTranslation;
    }
    if (properties.parent) {
        options.parent = properties.parent;
    }
    if (properties.subType) {
        options.subType = properties.subType;
        if (options.subType == "down") {
            options.shape.params.fill.linearGradient = {
                x1: 0,
                y1: 1,
                x2: 0,
                y2: 0
            };
        } else {
            options.shape.params.fill.linearGradient = {
                x1: 0,
                y1: 0,
                x2: 0,
                y2: 1
            };
        }
    }
    if (properties.xValueEnd && properties.yValueEnd) {
        options.xValueEnd = properties.xValueEnd;
        options.yValueEnd = properties.yValueEnd;
    }
    options.adjustYAxisToViewAnnotation = true;

    /**
     * @important : yAxis extremes should not be adjusted to show break even line
     * https://xinfiit.atlassian.net/browse/CCA-2156
     */
    /*options.getExtremesFn = function () {
     var yValue = infChart.drawingUtils.common.getYValue.call(this, this.yValue),
     options = this.annotation.options,
     isDown = options.subType === "down",
     yAxis = this.annotation.chart.yAxis[options.yAxis],
     min,
     max,
     dataMax = yAxis.infActualDataMax || yAxis.dataMax,
     dataMin = yAxis.infActualDataMin || yAxis.dataMin,
     extremes;

     if (dataMin > yValue) {
     min = yValue;
     if (isDown) {
     min -= (dataMax - yValue) * .05;
     }
     extremes = {
     'min': min
     }
     }

     if (dataMax < yValue) {
     max = yValue;
     if (!isDown) {
     max += (yValue - dataMin) * .05;
     }
     if (!extremes) {
     extremes = {};
     }
     extremes.max = max;
     }

     return extremes;
     };*/
    return options;
};

infChart.breakEvenLineDrawing.prototype.getPlotHeight = function () { };

infChart.breakEvenLineDrawing.prototype.getSettingsPopup = function () {
    return $("<div></div>");
};

infChart.breakEvenLineDrawing.scale = function () {
    var ann = this.annotation,
        chart = ann.chart,
        options = ann.options,
        //xAxis = chart.xAxis[options.xAxis],
        yAxis = chart.yAxis[options.yAxis],
        dx = chart.plotWidth,
        dy = yAxis.toPixels(options.yValue),
        w = Math.round(dx) + 1 + chart.plotLeft,
        h = Math.round(dy) + 1,
        symbol = {
            symbol: options.shape.params.symbol,
            zIndex: chart.seriesGroup.zIndex - 1
        },
        xPx = 0,
        yPx = 0;

    if (options.subType == "down") {
        if (dy > yAxis.height) {
            h = 0;
        } else {
            yPx = dy;
            h = yAxis.height - h + 1 + chart.margin[2];
        }
    } else if (dy <= 1) {
        h = 0;
    }

    symbol.x = 0;
    symbol.y = 0;
    symbol.width = Math.abs(w);
    symbol.height = Math.abs(h);

    ann.update({
        xValue: null,
        yValue: null,
        xValueEnd: null,
        yValueEnd: null,
        x: xPx,
        y: yPx,
        shape: {
            params: symbol
        }
    });
};

infChart.breakEvenLineDrawing.prototype.selectAndBindResize = function () { };

infChart.breakEvenLineDrawing.prototype.step = function () { };

infChart.breakEvenLineDrawing.prototype.stop = function (e) { };

infChart.breakEvenLineDrawing.prototype.translate = function () { };

infChart.breakEvenLineDrawing.prototype.updateOptions = function (properties, redraw) {
    var drawing = this,
        ann = drawing.annotation;
    if (properties.yValue) {
        drawing.yValue = properties.yValue;
    }
    if (properties.subType) {
        ann.options.subType = properties.subType;
        if (ann.options.subType == "down") {
            ann.options.shape.params.fill.linearGradient = {
                x1: 0,
                y1: 1,
                x2: 0,
                y2: 0
            };
        } else {
            ann.options.shape.params.fill.linearGradient = {
                x1: 0,
                y1: 0,
                x2: 0,
                y2: 1
            };
        }
    }
    if (redraw) {
        this.scaleDrawing();
    }
};

infChart.breakEvenLineDrawing.prototype.updateSettings = function (properties) {
    //this
};