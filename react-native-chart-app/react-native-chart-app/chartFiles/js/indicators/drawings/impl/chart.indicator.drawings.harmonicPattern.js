window.infChart = window.infChart || {};

infChart.harmonicPatternDrawing = function () {
    infChart.drawingObject.apply(this, arguments);
};

infChart.harmonicPatternDrawing.prototype = Object.create(infChart.drawingObject.prototype);

/**
* set additional drawings of the tool
*/
infChart.harmonicPatternDrawing.prototype.additionalDrawingsFunction = function () {
    var self = this,
        ann = self.annotation,
        chart = ann.chart,
        options = ann.options,
        yAxis = chart.yAxis[options.yAxis],
        lineShapes = self.getPatternShapes(),
        additionalDrawingsArr = self.additionalDrawings,
        theme = infChart.drawingUtils.common.getTheme(),
        shapeTheme = theme["harmonicPattern"],
        pointNamesArr = ["x", "a", "b", "c", "d"];

    additionalDrawingsArr.lines = {};
    additionalDrawingsArr.fill = {};
    additionalDrawingsArr.labels = {};
    additionalDrawingsArr.circles = {};
    additionalDrawingsArr.axisLabels = {};
    additionalDrawingsArr.rect = {};

    ann.selectionMarker = [];

    var drawingLineAttr = {
        'stroke-width': 1,
        'fill': 'none',
        'stroke': options.shape.params.stroke || shapeTheme && shapeTheme.stroke || infChart.drawingUtils.common.baseBorderColor,
        'stroke-dasharray': "2 2"
    };
    additionalDrawingsArr.lines["xbd"] = chart.renderer.path(lineShapes.xbd).attr(drawingLineAttr).add(ann.group);
    additionalDrawingsArr.lines["ac"] = chart.renderer.path(lineShapes.ac).attr(drawingLineAttr).add(ann.group);

    var drawingFillAttr = {
        'stroke-width': 0,
        'fill': options.fillColorValue || shapeTheme && shapeTheme.fillColor || infChart.drawingUtils.common.baseFillColor,
        'fill-opacity':  options.fillOpacityValue || shapeTheme && shapeTheme.fillOpacity || infChart.drawingUtils.common.baseFillOpacity,
        'stroke': ann.options.shape.params.stroke
    };

    additionalDrawingsArr.fill["xabFill"] = chart.renderer.path(lineShapes.xabFill).attr(drawingFillAttr).add(ann.group);
    additionalDrawingsArr.fill["bcdFill"] = chart.renderer.path(lineShapes.bcdFill).attr(drawingFillAttr).add(ann.group);

    // lineShapes.namePosition && (additionalDrawingsArr.labels["nameLabel"] = self.getLabel(options.name, lineShapes.namePosition.x, lineShapes.namePosition.y));

    /**
     * Create a circle and add to the group
     * @param {number} x x position
     * @param {number} y y position
     * @returns {SVGElement} The generated circle
     */
    function addCircle(x, y) {
        var padding = 10;
        var selectPointStyles = {
            'stroke-width': 2,
            stroke: options.shape.params.stroke,
            fill: '#141414',
            dashstyle: 'solid',
            'shape-rendering': 'crispEdges',
            'z-index': 10,
            cursor: 'crosshair'
        };
        return chart.renderer.circle(x, y, padding / 2).attr(selectPointStyles).add(ann.group);
    }

    var clipPosX = lineShapes.positions.axisClips.x;
    var clipPosY = lineShapes.positions.axisClips.y;

    self.setSelectionMarkers();
    infChart.util.forEach(pointNamesArr, function (index, value) {
        var values = lineShapes.values[value];

        // point Labels
        var labelPosition = lineShapes.positions["pointLabels"][value];
        labelPosition && (additionalDrawingsArr.labels[value + "Label"] = self.getLabel(labelPosition.label, labelPosition.x, labelPosition.y));

        var circlePosition = lineShapes.positions["circles"][value];
        var xlabelPosition = lineShapes.positions["xAxisLabels"][value];
        var ylabelPosition = lineShapes.positions["yAxisLabels"][value];
        if (options.isIndicator) {
            //TODO :: indicator specific things
            // circles
            circlePosition && (additionalDrawingsArr.circles[value] = addCircle(circlePosition.x, circlePosition.y));
            // x axis labels
            xlabelPosition && (additionalDrawingsArr.axisLabels["xLabel_" + value] = infChart.drawingUtils.common.getAxisLabel.call(self, xlabelPosition.x, xlabelPosition.y, values.xValue, values.optionXValue, true, shapeTheme && shapeTheme.label));
            // y axis labels
            ylabelPosition && (additionalDrawingsArr.axisLabels["yLabel_" + value] = infChart.drawingUtils.common.getAxisLabel.call(self, ylabelPosition.x, ylabelPosition.y, values.yValue, values.optionYValue, false, shapeTheme && shapeTheme.label));

            clipPosX && !additionalDrawingsArr.rect.x && (additionalDrawingsArr.rect.x = chart.renderer.rect(clipPosX.x, clipPosX.y, clipPosX.w, clipPosX.h).attr(drawingFillAttr).add(ann.group));
            clipPosY && !additionalDrawingsArr.rect.y && (additionalDrawingsArr.rect.y = chart.renderer.rect(clipPosY.x, clipPosY.y, clipPosY.w, clipPosY.h).attr(drawingFillAttr).add(ann.group));
        }
    });
    additionalDrawingsArr.labels["XBFib"] = self.getLabel("XBFib", 0, 0).hide();
    additionalDrawingsArr.labels["ACFib"] = self.getLabel("ACFib", 0, 0).hide();
    additionalDrawingsArr.labels["BDFib"] = self.getLabel("BDFib", 0, 0).hide();
    additionalDrawingsArr.labels["XDFib"] = self.getLabel("XDFib", 0, 0).hide();

    yAxis.isDirty = true; // need to change the axis offset in the chart
    self.chartRedrawRequired = false;

    if(options.intermediatePoints.length > 0) {
        this.scale();
    }
};

/**
* Get xAxis labels to front when there is an real-time update which is to redraw the chart without extrem changes
*/
infChart.harmonicPatternDrawing.prototype.afterRedrawXAxisWithoutSetExtremes = function () {
    var self = this;
    infChart.util.forEach(["x", "a", "b", "c", "d"], function (key, value) {
        var label = self.additionalDrawings.axisLabels["xLabel_" + value];
        label && infChart.drawingUtils.common.getAxisLabelToFront.call(self, label, true);
    });
};

infChart.harmonicPatternDrawing.prototype.bindSettingsEvents = function () {
    infChart.drawingUtils.common.bindXabcdSettingsEvents.call(this);
};

infChart.harmonicPatternDrawing.prototype.deselect = function () {
    this.annotation.selectionMarker = [];
    if(!this.annotation.options.isIndicator){
        this.additionalDrawings.axisLabels = {};
        this.additionalDrawings.rect = {};
        this.additionalDrawings.circles = {};
    }
};

/**
* Returns the maximum offset of the axis labels
* @param {Highstock.Axis} axis axis object
* @returns {number} max width
*/
infChart.harmonicPatternDrawing.prototype.getAxisOffset = function (axis) {
    var drawingObject = this,
        ann = drawingObject.annotation,
        options = ann.options,
        padding = infChart.util.isDefined(ann.options.xLabelPadding) || 3,
        maxWidth = 0,
        pointNamesArr = ["x", "a", "b", "c", "d"],
        lineShapes = this.getPatternShapes();

    if (!axis.isXAxis && options.yAxis === axis.options.index) {

        infChart.util.forEach(pointNamesArr, function (key, value) {
            var values = lineShapes.values[value];
            if (values) {
                var optionValue = values.optionYValue;
                var yValue = values.yValue;
                var label = drawingObject.additionalDrawings.axisLabels["yLabel_" + value];
                if (label) {
                    label.attr({
                        text: drawingObject.getLabelFormattedYValue(yValue, optionValue)
                    });
                    maxWidth = Math.max(maxWidth, label.width + padding);
                }
            }
        });
    }
    return maxWidth;
};

/**
* Returns the base line's path
* @returns Array path to draw base line
*/
infChart.harmonicPatternDrawing.prototype.getBasePatternLine = function () {
    var self = this,
        ann = self.annotation,
        options = ann.options,
        chart = ann.chart,
        xAxis = chart.xAxis[options.xAxis],
        yAxis = chart.yAxis[options.yAxis],
        x = xAxis.toPixels(options.xValue),
        y = yAxis.toPixels(options.yValue),
        line = ['M', 0, 0];

    infChart.util.forEach(options.intermediatePoints, function (index, value) {
        line.push('L');
        line.push(xAxis.toPixels(value.xValue) - x);
        line.push(yAxis.toPixels(value.yValue) - y);
    });

    if (options.xValueEnd) {
        line.push('L');
        line.push(xAxis.toPixels(options.xValueEnd) - x);
        line.push(yAxis.toPixels(options.yValueEnd) - y);
    }
    return line;
};

infChart.harmonicPatternDrawing.prototype.getClickValues = function (clickX, clickY) {
    var ann = this.annotation;
    var chart = ann.chart;
    var options = ann.options;
    var xAxis = chart.xAxis[options.xAxis];
    var yAxis = chart.yAxis[options.yAxis];
    var completedSteps = this.annotation.options.completedSteps;
    var coordinates = {
        xValue: options.xValue,
        yValue: options.yValue,
        intermediatePoints: options.intermediatePoints
    };
    switch (completedSteps) {
        case 1:

            coordinates.intermediatePoints[0].xValue = xAxis.toValue(clickX);
            coordinates.intermediatePoints[0].yValue = yAxis.toValue(clickY);
            break;
        case 2:
            coordinates.intermediatePoints[1].xValue = xAxis.toValue(clickX);
            coordinates.intermediatePoints[1].yValue = yAxis.toValue(clickY);
            break;
        case 3:
            coordinates.intermediatePoints[2].xValue = xAxis.toValue(clickX);
            coordinates.intermediatePoints[2].yValue = yAxis.toValue(clickY);
            break;
        case 4:
            coordinates.xValueEnd = xAxis.toValue(clickX);
            coordinates.yValueEnd = yAxis.toValue(clickY);
            break;

    }
    return coordinates;
};

/**
* Returns the config to save
* @returns {{shape: string, borderColor: *, strokeWidth: *, xValue: *, yValue: *, xValueEnd: *, yValueEnd: *, intermediatePoints: Array}} config object
*/
infChart.harmonicPatternDrawing.prototype.getConfig = function () {
    var annotation = this.annotation, levels = {};
    var intermediatePoints = [];
    for (var i = 0; i < annotation.options.intermediatePoints.length; i++) {
        intermediatePoints.push({
            xValue: annotation.options.intermediatePoints[i].xValue,
            yValue: annotation.options.intermediatePoints[i].yValue
        });
    }

    return {
        shape: 'harmonicPattern',
        borderColor: annotation.options.shape.params.stroke,
        strokeWidth: annotation.options.shape.params['stroke-width'],
        xValue: annotation.options.xValue,
        yValue: annotation.options.yValue,
        xValueEnd: annotation.options.xValueEnd,
        yValueEnd: annotation.options.yValueEnd,
        intermediatePoints: intermediatePoints,
        fillColor: annotation.options.shape.params.fill,
        fillOpacity: annotation.options.shape.params['fill-opacity'],
        fillColorValue: annotation.options.fillColorValue,
        fillOpacityValue: annotation.options.fillOpacityValue,
        textColor: annotation.options.textColor,
        textFontSize: annotation.options.textFontSize,
    };
};

/**
 * Create a label and add to the group
 * @param {String} name label text
 * @param {number} x x position
 * @param {number} y y position
 * @returns {SVGElement} the generated label
 */
infChart.harmonicPatternDrawing.prototype.getLabel = function (name, x, y) {
    var self = this,
        ann = self.annotation,
        options = ann.options,
        chart = ann.chart,
        theme = infChart.drawingUtils.common.getTheme(),
        shapeTheme = theme["harmonicPattern"];

    return chart.renderer.label(name, x, y).attr({
        'zIndex': 20,
        'r': 3,
        'fill': options.shape.params.stroke || shapeTheme && shapeTheme.label && shapeTheme.label.fill || "#2f2e33",
        'opacity': shapeTheme && shapeTheme.label && shapeTheme.label.opacity || 1,
        'stroke': shapeTheme && shapeTheme.label && shapeTheme.label.stroke || "#858587",
        'stroke-width': 0,
        'hAlign': 'center',
        'class': 'harmonic-lbl'
    }).add(ann.group).css(
        {
            color: options.textColor ||shapeTheme && shapeTheme.label && shapeTheme.label.stroke || "#000000",
            fontSize: options.textFontSize || shapeTheme.fontSize || '16px',
            cursor: 'move',
            fontWeight: '500',
            fontStyle: 'normal',
            textDecoration: 'inherit'
        });
};

infChart.harmonicPatternDrawing.prototype.getLabelFormattedXValue = function (value, axis) {
    var interval = infChart.manager.getChart(infChart.manager.getContainerIdFromChart(this.chart.renderTo.id)).interval;
    var format = axis.options.dateTimeLabelFormats.day + " " + axis.options.dateTimeLabelFormats.minute;
    if (interval === 'D' || interval === 'W' || interval === 'M' || interval === 'Y') {
        format = axis.options.dateTimeLabelFormats.day;
    }
    return infChart.util.formatDate(value, format);
};

/**
 * Returns the formatted label
 * @param {number} yValue actual value
 * @param {number} optionsyValue value in the options
 * @returns {string} formatted value to be set
 */
infChart.harmonicPatternDrawing.prototype.getLabelFormattedYValue = function (yValue, optionsyValue) {
    var stockChart = this.stockChart;
    var value;
    if (stockChart.isPercent) {
        value = stockChart.getYLabel(optionsyValue, true, false, false);
    } else {
        value = stockChart.formatValue(yValue, stockChart.getMainSeries().options.dp);
    }
    return value;
};

infChart.harmonicPatternDrawing.prototype.getNextPointOptions = function () {
    var ann = this.annotation;
    var intermediatePointCount = this.intermediatePoints.length;
    var completedSteps = ann.options.completedSteps;
    var pointOptions = { name: "x" };
    switch (completedSteps) {
        case 1:
            pointOptions.name = "a";
            break;
        case 2:
            pointOptions.name = "b";
            break;
        case 3:
            pointOptions.name = "c";
            break;
        case 4:
            pointOptions.name = "d";
            break;

    }
    return pointOptions;
};

/**
* Returns the the drawing options from saved|initial properties
* @param {object} properties drawing properties
* @returns {{name: *, indicatorId: *, utilizeAxes: string, xValue: *, yValue: *, xValueEnd: *, yValueEnd: *, intermediatePoints: Array, allowDragY: boolean, shape: {params: {fill: string, d: *[]}}, isIndicator: boolean, drawingType: string, allowDragX: boolean}} options to set
*/
infChart.harmonicPatternDrawing.prototype.getOptions = function (properties) {
    var theme = infChart.drawingUtils.common.getTheme();
    var shapeTheme = theme["harmonicPattern"];
    var options = {
        name: properties.name,
        xValue: properties.xValue,
        yValue: properties.yValue,
        xValueEnd: properties.xValueEnd,
        yValueEnd: properties.yValueEnd,
        intermediatePoints: [],
        shape: {
            params: {
                fill: "none",
                d: ['M', 0, 0, 'L', 0, 0],
                'stroke-width': 3
            }
        }
    };

    if (properties.isIndicator) {
        options.drawingType = infChart.constants.drawingTypes.indicator;
        options.isIndicator = true;
        options.indicatorId = properties.indicatorId;
        options.allowDragY = false;
        options.allowDragX = false;
    }

    if (properties.borderColor) {
        options.shape.params.stroke = properties.color || properties.borderColor;
    }
    if (properties.strokeWidth) {
        options.shape.params['stroke-width'] = properties.strokeWidth;
    }
    if (properties.levels) {
        options.levels = properties.levels;
    }
    if (properties.intermediatePoints) {
        for (var i = 0; i < properties.intermediatePoints.length; i++) {
            options.intermediatePoints.push({
                xValue: properties.intermediatePoints[i].xValue,
                yValue: properties.intermediatePoints[i].yValue
            });
        }
    }
    if (properties.completedSteps) {
        options.completedSteps = properties.completedSteps;
    }

    if (properties.fillColorValue) {
        options.fillColorValue = properties.fillColorValue;
    } else {
        options.fillColorValue = "none";
    }

    if (properties.fillOpacityValue) {
        options.fillOpacityValue = properties.fillOpacityValue;
    } else {
        options.fillOpacityValue = "0.5";
    }

    if(properties.textColor) {
        options.textColor = properties.textColor;
    } else {
        options.textColor = shapeTheme.label.fontColor || "#000000";
    }

    if(properties.textFontSize) {
        options.textFontSize = properties.textFontSize;
    } else {
        options.textFontSize = shapeTheme.label.fontSize || 16;
    }

    options.validateTranslationFn = this.validateTranslation;
    return options;
};

infChart.harmonicPatternDrawing.prototype.validateTranslation = function (newXValue) {
    var self = this,
        ann = self.annotation,
        options = ann.options,
        chart = ann.chart,
        seriesData = chart.series[0].xData,
        dataMin = seriesData[0],
        xVal = options.xValue,
        xValEnd = options.xValueEnd,
        intermediate = options.intermediatePoints,
        newXValueEnd = xValEnd - xVal + newXValue,
        newIntermediateStart = intermediate[0].xValue - xVal + newXValue,
        newIntermediateMiddle = intermediate[1].xValue - xVal + newXValue,
        newIntermediateEnd = intermediate[2].xValue - xVal + newXValue,
        totalPoints = infChart.drawingsManager.getTotalPoints(chart),
        dataMax = totalPoints[totalPoints.length - 1];

    return (newXValue >= dataMin && newXValue <= dataMax) && (newXValueEnd >= dataMin && newXValueEnd <= dataMax) && (newIntermediateStart >= dataMin && newIntermediateStart <= dataMax) && (newIntermediateMiddle >= dataMin && newIntermediateMiddle <= dataMax) && (newIntermediateEnd >= dataMin && newIntermediateEnd <= dataMax);
};

/**
* Returns the paths, values and positions of the shapes under this drawing
* @returns {object} pattern shapes
*/
infChart.harmonicPatternDrawing.prototype.getPatternShapes = function () {
    var ann = this.annotation,
        chart = ann.chart,
        options = ann.options,
        intermediatePoints = options.intermediatePoints,
        intermediatePointsRaw = this.intermediatePoints,
        xAxis = chart.xAxis[options.xAxis],
        yAxis = chart.yAxis[options.yAxis],
        x = xAxis.toPixels(options.xValue),
        y = yAxis.toPixels(options.yValue),
        ax = intermediatePoints && intermediatePoints[0] && (xAxis.toPixels(intermediatePoints[0].xValue) - x),
        ay = intermediatePoints && intermediatePoints[0] && (yAxis.toPixels(intermediatePoints[0].yValue) - y),
        bx = intermediatePoints && intermediatePoints[1] && (xAxis.toPixels(intermediatePoints[1].xValue) - x),
        by = intermediatePoints && intermediatePoints[1] && (yAxis.toPixels(intermediatePoints[1].yValue) - y),
        cx = intermediatePoints && intermediatePoints[2] && (xAxis.toPixels(intermediatePoints[2].xValue) - x),
        cy = intermediatePoints && intermediatePoints[2] && (yAxis.toPixels(intermediatePoints[2].yValue) - y),
        dx = options.xValueEnd && (xAxis.toPixels(options.xValueEnd) - x),
        dy = options.yValueEnd && (yAxis.toPixels(options.yValueEnd) - y),
        patternPaths = {};

    patternPaths.xbd = dx !== undefined ? ['M', 0, 0, 'L', bx, by, 'L', dx, dy, 'L', 0, 0] : bx !== undefined ? ['M', 0, 0, 'L', bx, by] : ['M', 0, 0];
    patternPaths.ac = cx !== undefined ? ['M', ax, ay, 'L', cx, cy] : ax !== undefined ? ['M', ax, ay] : [];
    patternPaths.xabFill = bx !== undefined ? ['M', 0, 0, 'L', ax, ay, 'L', bx, by] : ax !== undefined ? ['M', 0, 0, 'L', ax, ay, 'L', 0, 0] : ['M', 0, 0, 'L', 0, 0, 'L', 0, 0];
    patternPaths.bcdFill = dx !== undefined ? ['M', bx, by, 'L', cx, cy, 'L', dx, dy] : bx !== undefined ? ['M', bx, by, 'L', cx, cy, 'L', bx, by] : cx !== undefined ? ['M', cx, cy, 'L', cx, cy, 'L', cx, cy] : [];

    var nameAdditionalY = 25;
    if (dx !== undefined) {
        if (ay < 0) {
            patternPaths.namePosition = { x: (dx) / 2, y: (dy) / 2 + nameAdditionalY };
        } else {
            patternPaths.namePosition = { x: (ax + cx) / 2, y: (ay + cy) / 2 + nameAdditionalY };
        }
    }

    patternPaths.xCirclePosition = { x: 0, y: 0 };

    patternPaths.positions = {
        pointLabels: {
            x: { x: -5, y: ay < 0 ? 5 : -25, label: "X" }
        },
        xAxisLabels: {
            x: { x: 0, y: chart.plotHeight - y },
            a: { x: ax, y: chart.plotHeight - y },
            b: { x: bx, y: chart.plotHeight - y },
            c: { x: cx, y: chart.plotHeight - y },
            d: { x: dx, y: chart.plotHeight - y }
        },
        yAxisLabels: {
            x: { x: xAxis.width - x, y: 0 },
            a: { x: xAxis.width - x, y: ay },
            b: { x: xAxis.width - x, y: by },
            c: { x: xAxis.width - x, y: cy },
            d: { x: xAxis.width - x, y: dy }
        },
        circles: {
            x: { x: 0, y: 0 },
            a: { x: ax, y: ay },
            b: { x: bx, y: by },
            c: { x: cx, y: cy },
            d: { x: dx, y: dy }
        }
    };

    if (ax !== undefined) {
        var rectMax = Math.min(0, ay, by || 0, cy || 0, dy || 0);
        var rectMin = Math.max(0, ay, by || 0, cy || 0, dy || 0);

        patternPaths.positions.axisClips = {
            x: {
                x: 0,
                y: patternPaths.positions["xAxisLabels"].x.y,
                w: dx || cx || bx || ax,
                h: chart.axisOffset[2]
            },
            // y: {
            //     x: patternPaths.positions.yAxisLabels.x.x,
            //     y: rectMax,
            //     w: chart.axisOffset[1],
            //     h: rectMin - rectMax
            // }
        };
    } else {
        patternPaths.positions.axisClips = {};
    }
    patternPaths.values = {
        x: {
            xValue: options.xValue,
            yValue: this.yValue,
            optionXValue: options.xValue,
            optionYValue: options.yValue
        }
    };

    if (ax !== undefined) {
        patternPaths.aCirclePosition = { x: ax, y: ay };
        patternPaths.positions.pointLabels.a = { x: ax - 5, y: ay < 0 ? ay - 25 : ay + 5, label: "A" };
        patternPaths.values.a = {
            xValue: intermediatePoints[0].xValue,
            yValue: intermediatePointsRaw[0] ? intermediatePointsRaw[0].yValue : infChart.drawingUtils.common.getBaseYValue.call(this, intermediatePoints[0].yValue),
            optionXValue: intermediatePoints[0].xValue,
            optionYValue: intermediatePoints[0].yValue
        };

    }
    if (bx !== undefined) {
        patternPaths.bCirclePosition = { x: bx, y: by };
        patternPaths.positions.pointLabels.b = { x: bx - 5, y: ay < by ? by + 5 : by - 25, label: "B" };
        patternPaths.values.b = {
            xValue: intermediatePoints[1].xValue,
            yValue: intermediatePointsRaw[1] ? intermediatePointsRaw[1].yValue : infChart.drawingUtils.common.getBaseYValue.call(this, intermediatePoints[1].yValue),
            optionXValue: intermediatePoints[1].xValue,
            optionYValue: intermediatePoints[1].yValue
        };

    }
    if (cx !== undefined) {
        patternPaths.cCirclePosition = { x: cx, y: cy };
        patternPaths.positions.pointLabels.c = { x: cx - 5, y: cy < dy ? cy - 25 : cy + 5, label: "C" };
        patternPaths.values.c = {
            xValue: intermediatePoints[2].xValue,
            yValue: intermediatePointsRaw[2] ? intermediatePointsRaw[2].yValue : infChart.drawingUtils.common.getBaseYValue.call(this, intermediatePoints[2].yValue),
            optionXValue: intermediatePoints[2].xValue,
            optionYValue: intermediatePoints[2].yValue
        };

    }
    if (dx !== undefined) {
        patternPaths.dCirclePosition = { x: dx, y: dy };
        patternPaths.positions.pointLabels.d = { x: dx - 5, y: cy < dy ? dy + 5 : dy - 25, label: "D" };
        patternPaths.values.d = {
            xValue: options.xValueEnd,
            yValue: this.yValueEnd !== undefined ? this.yValueEnd : infChart.drawingUtils.common.getBaseYValue.call(this, options.yValueEnd),
            optionXValue: options.xValueEnd,
            optionYValue: options.yValueEnd
        };

    }
    return patternPaths;
};

infChart.harmonicPatternDrawing.prototype.getQuickSettingsPopup = function () {
    var common = infChart.drawingUtils.common;
    var shapeTheme = infChart.drawingUtils.common.getTheme()["harmonicPattern"];
    var opacity = shapeTheme && shapeTheme.fillOpacity || infChart.drawingUtils.common.baseFillOpacity;
    var fill = shapeTheme && shapeTheme.fillColor || common.baseFillColor;
    return infChart.structureManager.drawingTools.getXabcdQuickSettings(common.baseBorderColor, fill, opacity);
};

infChart.harmonicPatternDrawing.prototype.getSettingsPopup = function () {
    var common = infChart.drawingUtils.common;
    var shapeTheme = infChart.drawingUtils.common.getTheme()["harmonicPattern"];
    var opacity = shapeTheme && shapeTheme.fillOpacity || infChart.drawingUtils.common.baseFillOpacity;
    var fill = shapeTheme && shapeTheme.fillColor || common.baseFillColor;
    return infChart.structureManager.drawingTools.getXabcdSettings(common.baseBorderColor, fill, opacity, this.fontColor, this.fontSize);
};

infChart.harmonicPatternDrawing.prototype.hasMoreIntermediateSteps = function () {
    return !(this.annotation.options.completedSteps === 4);
};

infChart.harmonicPatternDrawing.prototype.onclick = function () {
    infChart.drawingUtils.common.getAxisLabelToFront.call(this, this.additionalDrawings.axisLabels["xLabel_x"]);
}

/**
 * Change the fill and opacity of the annotation from the given params
 * IMPORTANT :: this method is uesd in commands.wrappers to set undo/redo actions
 * @param {object} rgb rgb value of the color
 * @param {string} value hash value of the color
 * @param {float} opacity opacity to be set
 * @param {string} level level that change should be applied
 * @param {boolean|undefined} isPropertyChange property change
 * @param {string} colorPickerRef filter to search for the specific color picker that change occured (used in wrappers)
*/
infChart.harmonicPatternDrawing.prototype.onFillColorChange = function (rgb, value, opacity, level, isPropertyChange, colorPickerRef) {
    var self = this;
    self.annotation.update({
        shape: {
            params: {
                fill: value,
                'fill-opacity': opacity
            }
        }
    });

    var drawingsFill = self.additionalDrawings.fill[level];
    drawingsFill.attr({
        'fill': value,
        'fill-opacity': opacity
    });
    isPropertyChange && self.onPropertyChange();
    if (self.settingsPopup) {
        self.settingsPopup.data("infUndoRedo", false);
    }
};

/**
* Scale function of the tool
*/
infChart.harmonicPatternDrawing.prototype.scale = function (isCalculateNewValueForScale) {
    var self = this,
        ann = self.annotation,
        line,
        additionalDrawingsArr = self.additionalDrawings,
        pointNamesArr = ["x", "a", "b", "c", "d"];

    line = self.getBasePatternLine();

    ann.update({
        shape: {
            params: {
                d: line
            }
        }
    });

    var lineShapes = self.getPatternShapes();
    additionalDrawingsArr.lines["xbd"].attr({ d: lineShapes.xbd });
    additionalDrawingsArr.lines["ac"].attr({ d: lineShapes.ac });
    additionalDrawingsArr.fill["xabFill"].attr({ d: lineShapes.xabFill });
    additionalDrawingsArr.fill["bcdFill"].attr({ d: lineShapes.bcdFill });
    lineShapes.namePosition && additionalDrawingsArr.labels["nameLabel"] && additionalDrawingsArr.labels["nameLabel"].attr({
        x: lineShapes.namePosition.x,
        y: lineShapes.namePosition.y
    });

    infChart.util.forEach(pointNamesArr, function (index, value) {
        // x axis labels
        if (additionalDrawingsArr.axisLabels["xLabel_" + value]) {
            var labelPosition = lineShapes.positions["xAxisLabels"][value];
            var label = additionalDrawingsArr.axisLabels["xLabel_" + value];
            label.attr({ x: labelPosition.x - label.width / 2, y: labelPosition.y });
        }

        // point labels
        labelPosition = lineShapes.positions["pointLabels"][value];
        label = additionalDrawingsArr.labels[value + "Label"];
        label && label.attr({ x: labelPosition.x, y: labelPosition.y });

        //y labels
        if (additionalDrawingsArr.axisLabels["yLabel_" + value]) {
            labelPosition = lineShapes.positions["yAxisLabels"][value];
            label = additionalDrawingsArr.axisLabels["yLabel_" + value];
            label.attr({ x: labelPosition.x, y: labelPosition.y });
        }

        // circles
        if (additionalDrawingsArr.circles[value]) {
            var circlePositions = lineShapes.positions["circles"][value];
            additionalDrawingsArr.circles[value].attr({ x: circlePositions.x, y: circlePositions.y });
        }
    });
    var clipPosX = lineShapes.positions.axisClips.x;
    var clipPosY = lineShapes.positions.axisClips.y;
    additionalDrawingsArr.rect.x && additionalDrawingsArr.rect.x.attr({
        x: clipPosX.x,
        y: clipPosX.y,
        width: clipPosX.w,
        height: clipPosX.h
    });
    additionalDrawingsArr.rect.y && additionalDrawingsArr.rect.y.attr({
        x: clipPosY.x,
        y: clipPosY.y,
        width: clipPosY.w,
        height: clipPosY.h
    });


    var xPoint, aPoint, bPoint, cPoint, dPoint;

    var XAVal, ABVal, BCVal, CDVal, ADVal;

    xPoint = [ann.options.xValue, ann.options.yValue];

    if (ann.options.intermediatePoints[0]) {
        aPoint = [ann.options.intermediatePoints[0].xValue, ann.options.intermediatePoints[0].yValue];
        XAVal = Math.abs(xPoint[1] - aPoint[1]);
    }
    if (ann.options.intermediatePoints[1]) {
        bPoint = [ann.options.intermediatePoints[1].xValue, ann.options.intermediatePoints[1].yValue];
        ABVal = Math.abs(bPoint[1] - aPoint[1]);
    }
    if (ann.options.intermediatePoints[2]) {
        cPoint = [ann.options.intermediatePoints[2].xValue, ann.options.intermediatePoints[2].yValue];
        BCVal = Math.abs(bPoint[1] - cPoint[1]);
    }
    if (ann.options.xValueEnd) {
        dPoint = [ann.options.xValueEnd, ann.options.yValueEnd];
        ADVal = Math.abs(dPoint[1] - aPoint[1]);
        CDVal = Math.abs(dPoint[1] - cPoint[1]);
    }

    var XBFib, ACFib, BDFib, XDFib = 0;

    if (ABVal > 0 && XAVal > 0) {
        XBFib = infChart.drawingUtils.common.formatValue(ABVal / XAVal, 3);
        var XBFibLabl = additionalDrawingsArr.labels["XBFib"];
        var XBFibLablX = (lineShapes.positions["pointLabels"]["b"].x - lineShapes.positions["pointLabels"]["x"].x) / 2 + lineShapes.positions["pointLabels"]["x"].x;
        var XBFibLablY = (lineShapes.positions["pointLabels"]["b"].y - lineShapes.positions["pointLabels"]["x"].y) / 2 + lineShapes.positions["pointLabels"]["x"].y;
        XBFibLabl.attr({
            x: XBFibLablX,
            y: XBFibLablY,
            text: XBFib
        }).show();

    }

    if (BCVal > 0 && ABVal > 0) {
        ACFib = infChart.drawingUtils.common.formatValue(BCVal / ABVal, 3);
        additionalDrawingsArr.labels["ACFib"].attr({
            x: (lineShapes.positions["pointLabels"]["c"].x - lineShapes.positions["pointLabels"]["a"].x) / 2 + lineShapes.positions["pointLabels"]["a"].x,
            y: (lineShapes.positions["pointLabels"]["c"].y - lineShapes.positions["pointLabels"]["a"].y) / 2 + lineShapes.positions["pointLabels"]["a"].y,
            text: ACFib
        }).show();
    }

    if (CDVal > 0 && BCVal > 0) {
        BDFib = infChart.drawingUtils.common.formatValue(CDVal / BCVal, 3);

        additionalDrawingsArr.labels["BDFib"].attr({
            x: (lineShapes.positions["pointLabels"]["d"].x - lineShapes.positions["pointLabels"]["b"].x) / 2 + lineShapes.positions["pointLabels"]["b"].x,
            y: (lineShapes.positions["pointLabels"]["d"].y - lineShapes.positions["pointLabels"]["b"].y) / 2 + lineShapes.positions["pointLabels"]["b"].y,
            text: BDFib
        }).show();
    }

    if (ADVal > 0 && XAVal > 0) {
        XDFib = infChart.drawingUtils.common.formatValue(ADVal / XAVal, 3);
        additionalDrawingsArr.labels["XDFib"].attr({
            x: (lineShapes.positions["pointLabels"]["d"].x - lineShapes.positions["pointLabels"]["x"].x) / 2 + lineShapes.positions["pointLabels"]["x"].x,
            y: (lineShapes.positions["pointLabels"]["d"].y - lineShapes.positions["pointLabels"]["x"].y) / 2 + lineShapes.positions["pointLabels"]["x"].y,
            text: XDFib
        }).show();
    }
};

infChart.harmonicPatternDrawing.prototype.finalizeEachPoint = function () {
    var self = this,
        ann = self.annotation,
        line,
        additionalDrawingsArr = self.additionalDrawings,
        pointNamesArr = ["x", "a", "b", "c", "d"];

    line = self.getBasePatternLine();

    ann.update({
        shape: {
            params: {
                d: line
            }
        }
    });

    var lineShapes = self.getPatternShapes();
    additionalDrawingsArr.lines["xbd"].attr({ d: lineShapes.xbd });
    additionalDrawingsArr.lines["ac"].attr({ d: lineShapes.ac });
    additionalDrawingsArr.fill["xabFill"].attr({ d: lineShapes.xabFill });
    additionalDrawingsArr.fill["bcdFill"].attr({ d: lineShapes.bcdFill });
    lineShapes.namePosition && additionalDrawingsArr.labels["nameLabel"] && additionalDrawingsArr.labels["nameLabel"].attr({
        x: lineShapes.namePosition.x,
        y: lineShapes.namePosition.y
    });

    infChart.util.forEach(pointNamesArr, function (index, value) {
        // x axis labels
        if (additionalDrawingsArr.axisLabels["xLabel_" + value]) {
            var labelPosition = lineShapes.positions["xAxisLabels"][value];
            var label = additionalDrawingsArr.axisLabels["xLabel_" + value];
            label.attr({ x: labelPosition.x - label.width / 2, y: labelPosition.y });
        }

        // point labels
        labelPosition = lineShapes.positions["pointLabels"][value];
        label = additionalDrawingsArr.labels[value + "Label"];
        label && label.attr({ x: labelPosition.x, y: labelPosition.y });

        //y labels
        if (additionalDrawingsArr.axisLabels["yLabel_" + value]) {
            labelPosition = lineShapes.positions["yAxisLabels"][value];
            label = additionalDrawingsArr.axisLabels["yLabel_" + value];
            label.attr({ x: labelPosition.x, y: labelPosition.y });
        }

        // circles
        if (additionalDrawingsArr.circles[value]) {
            var circlePositions = lineShapes.positions["circles"][value];
            additionalDrawingsArr.circles[value].attr({ x: circlePositions.x, y: circlePositions.y });
        }
    });
    var clipPosX = lineShapes.positions.axisClips.x;
    var clipPosY = lineShapes.positions.axisClips.y;
    additionalDrawingsArr.rect.x && additionalDrawingsArr.rect.x.attr({
        x: clipPosX.x,
        y: clipPosX.y,
        width: clipPosX.w,
        height: clipPosX.h
    });
    additionalDrawingsArr.rect.y && additionalDrawingsArr.rect.y.attr({
        x: clipPosY.x,
        y: clipPosY.y,
        width: clipPosY.w,
        height: clipPosY.h
    });


    var xPoint, aPoint, bPoint, cPoint, dPoint;

    var XAVal, ABVal, BCVal, CDVal, ADVal;

    xPoint = [ann.options.xValue, ann.options.yValue];

    if (ann.options.intermediatePoints[0]) {
        aPoint = [ann.options.intermediatePoints[0].xValue, ann.options.intermediatePoints[0].yValue];
        XAVal = Math.abs(xPoint[1] - aPoint[1]);
    }
    if (ann.options.intermediatePoints[1]) {
        bPoint = [ann.options.intermediatePoints[1].xValue, ann.options.intermediatePoints[1].yValue];
        ABVal = Math.abs(bPoint[1] - aPoint[1]);
    }
    if (ann.options.intermediatePoints[2]) {
        cPoint = [ann.options.intermediatePoints[2].xValue, ann.options.intermediatePoints[2].yValue];
        BCVal = Math.abs(bPoint[1] - cPoint[1]);
    }
    if (ann.options.xValueEnd) {
        dPoint = [ann.options.xValueEnd, ann.options.yValueEnd];
        ADVal = Math.abs(dPoint[1] - aPoint[1]);
        CDVal = Math.abs(dPoint[1] - cPoint[1]);
    }

    var XBFib, ACFib, BDFib, XDFib = 0;

    if (ABVal > 0 && XAVal > 0) {
        XBFib = infChart.drawingUtils.common.formatValue(ABVal / XAVal, 3);
        var XBFibLabl = additionalDrawingsArr.labels["XBFib"];
        var XBFibLablX = (lineShapes.positions["pointLabels"]["b"].x - lineShapes.positions["pointLabels"]["x"].x) / 2 + lineShapes.positions["pointLabels"]["x"].x;
        var XBFibLablY = (lineShapes.positions["pointLabels"]["b"].y - lineShapes.positions["pointLabels"]["x"].y) / 2 + lineShapes.positions["pointLabels"]["x"].y;
        XBFibLabl.attr({
            x: XBFibLablX,
            y: XBFibLablY,
            text: XBFib
        }).show();

    }

    if (BCVal > 0 && ABVal > 0) {
        ACFib = infChart.drawingUtils.common.formatValue(BCVal / ABVal, 3);
        additionalDrawingsArr.labels["ACFib"].attr({
            x: (lineShapes.positions["pointLabels"]["c"].x - lineShapes.positions["pointLabels"]["a"].x) / 2 + lineShapes.positions["pointLabels"]["a"].x,
            y: (lineShapes.positions["pointLabels"]["c"].y - lineShapes.positions["pointLabels"]["a"].y) / 2 + lineShapes.positions["pointLabels"]["a"].y,
            text: ACFib
        }).show();
    }

    if (CDVal > 0 && BCVal > 0) {
        BDFib = infChart.drawingUtils.common.formatValue(CDVal / BCVal, 3);

        additionalDrawingsArr.labels["BDFib"].attr({
            x: (lineShapes.positions["pointLabels"]["d"].x - lineShapes.positions["pointLabels"]["b"].x) / 2 + lineShapes.positions["pointLabels"]["b"].x,
            y: (lineShapes.positions["pointLabels"]["d"].y - lineShapes.positions["pointLabels"]["b"].y) / 2 + lineShapes.positions["pointLabels"]["b"].y,
            text: BDFib
        }).show();
    }

    if (ADVal > 0 && XAVal > 0) {
        XDFib = infChart.drawingUtils.common.formatValue(ADVal / XAVal, 3);
        additionalDrawingsArr.labels["XDFib"].attr({
            x: (lineShapes.positions["pointLabels"]["d"].x - lineShapes.positions["pointLabels"]["x"].x) / 2 + lineShapes.positions["pointLabels"]["x"].x,
            y: (lineShapes.positions["pointLabels"]["d"].y - lineShapes.positions["pointLabels"]["x"].y) / 2 + lineShapes.positions["pointLabels"]["x"].y,
            text: XDFib
        }).show();
    }
    infChart.drawingUtils.common.saveBaseYValues.call(self, ann.options.yValue, ann.options.yValueEnd, undefined, ann.options.intermediatePoints);
};

infChart.harmonicPatternDrawing.prototype.scaleSelectionMarkers = function (lineShapes) {
    var self = this,
        ann = self.annotation,
        options = ann.options,
        line,
        additionalDrawingsArr = self.additionalDrawings,
        pointNamesArr = ["x", "a", "b", "c", "d"];

    infChart.util.forEach(pointNamesArr, function (index, value) {
        var values = lineShapes.values[value];

        // x axis labels
        if (additionalDrawingsArr.axisLabels["xLabel_" + value]) {
            var labelPosition = lineShapes.positions["xAxisLabels"][value];
            var label = additionalDrawingsArr.axisLabels["xLabel_" + value];
            label.attr({
                x: labelPosition.x - label.width / 2,
                y: labelPosition.y,
                text: self.stockChart.getXAxisCrosshairLabel(values.optionXValue, self.stockChart.chart.xAxis[options.xAxis])
            });
        }

        //y labels
        if (additionalDrawingsArr.axisLabels["yLabel_" + value]) {
            labelPosition = lineShapes.positions["yAxisLabels"][value];
            label = additionalDrawingsArr.axisLabels["yLabel_" + value];
            label.attr({
                x: labelPosition.x,
                y: labelPosition.y,
                text: self.getLabelFormattedYValue(values.yValue, values.optionYValue)
            });
        }
    });
    var clipPosX = lineShapes.positions.axisClips.x;
    var clipPosY = lineShapes.positions.axisClips.y;
    additionalDrawingsArr.rect.x && additionalDrawingsArr.rect.x.attr({
        x: clipPosX.x,
        y: clipPosX.y,
        width: clipPosX.w,
        height: clipPosX.h
    });
    additionalDrawingsArr.rect.y && additionalDrawingsArr.rect.y.attr({
        x: clipPosY.x,
        y: clipPosY.y,
        width: clipPosY.w,
        height: clipPosY.h
    });
};

infChart.harmonicPatternDrawing.prototype.select = function () { };

infChart.harmonicPatternDrawing.prototype.selectAndBindResize = function () {
    var self = this,
        ann = self.annotation;
    ann.events.deselect.call(ann);
    ann.selectionMarker = [];
    self.setSelectionMarkers();
};

infChart.harmonicPatternDrawing.prototype.setSelectionMarkers = function () {
    var self = this,
        ann = self.annotation,
        chart = ann.chart,
        options = ann.options,
        xAxis = chart.xAxis[options.xAxis],
        lineShapes = self.getPatternShapes(),
        theme = infChart.drawingUtils.common.getTheme(),
        shapeTheme = theme["harmonicPattern"],
        startX = xAxis.toPixels(options.xValue),
        additionalDrawingsArr = self.additionalDrawings;

    if (!options.isIndicator && !ann.selectionMarker.length) {
        if(startX > 0 ){
            infChart.util.forEach(["x", "a", "b", "c", "d"], function (index, value) {
                var circlePosition = lineShapes.positions["circles"][value];
                circlePosition && circlePosition.x != undefined && circlePosition.y != undefined &&
                    (additionalDrawingsArr.circles[value] = infChart.drawingUtils.common.addAndBindSelectionMarker.call(self, ann, circlePosition.x, circlePosition.y, self.stepFunction, self.stop, true, undefined, { name: value }));
            });
        } else {
            var selectionMarkerPoints = self.getSelectionMarkerPositionFromDrawing();
            infChart.util.forEach(["x", "a", "b", "c", "d"], function (index, value) {
                var circlePosition = lineShapes.positions["circles"][value];
                var selectionMarkerPosition = selectionMarkerPoints[value];
                circlePosition && selectionMarkerPosition && circlePosition.y != undefined &&
                    (additionalDrawingsArr.circles[value] = infChart.drawingUtils.common.addAndBindSelectionMarker.call(self, ann, selectionMarkerPosition, circlePosition.y, self.stepFunction, self.stop, true, undefined, { name: value }));
            });
        }

        infChart.util.forEach(["x", "a", "b", "c", "d"], function (index, value) {
            var values = lineShapes.values[value];
            var labelPosition = lineShapes.positions["xAxisLabels"][value];
            var ylabelPosition = lineShapes.positions["yAxisLabels"][value];
            labelPosition && labelPosition.x != undefined && labelPosition.y != undefined &&
                (additionalDrawingsArr.axisLabels["xLabel_" + value] = infChart.drawingUtils.common.addSelectionMarkerLabel.call(self, labelPosition.x, labelPosition.y, values.xValue, values.optionXValue, true, shapeTheme && shapeTheme.label));
            labelPosition && labelPosition.x != undefined && labelPosition.y != undefined &&
                (additionalDrawingsArr.axisLabels["yLabel_" + value] = infChart.drawingUtils.common.addSelectionMarkerLabel.call(self, ylabelPosition.x, ylabelPosition.y, values.yValue, values.optionYValue, false, shapeTheme && shapeTheme.label));
        });

        var drawingFillAttr = {
            'stroke-width': 0,
            'fill': options.shape.params.stroke || shapeTheme && shapeTheme.fillColor || infChart.drawingUtils.common.baseFillColor,
            'fill-opacity': shapeTheme && shapeTheme.fillOpacity || infChart.drawingUtils.common.baseFillOpacity,
            'stroke': ann.options.shape.params.stroke
        };

        var clipPosX = lineShapes.positions.axisClips.x;
        var clipPosY = lineShapes.positions.axisClips.y;
        if (clipPosY && !additionalDrawingsArr.rect.y && clipPosX && !additionalDrawingsArr.rect.x) {
            additionalDrawingsArr.rect.x = chart.renderer.rect(clipPosX.x, clipPosX.y, clipPosX.w, clipPosX.h).attr(drawingFillAttr).add(ann.group);
            additionalDrawingsArr.rect.y = chart.renderer.rect(clipPosY.x, clipPosY.y, clipPosY.w, clipPosY.h).attr(drawingFillAttr).add(ann.group);
            ann.selectionMarker.push(additionalDrawingsArr.rect.x);
            ann.selectionMarker.push(additionalDrawingsArr.rect.y);
        }

    }
};

infChart.harmonicPatternDrawing.prototype.getSelectionMarkerPositionFromDrawing = function () {
    var self = this,
        ann = self.annotation,
        shape = ann.shape.d.split(' ');

    return {
        x: shape[1],
        a: shape[4],
        b: shape[7],
        c: shape[10],
        d: shape[13]
    }
};

/**
* Step function
* @param {Event} e event
* @param {boolean} isStartPoint indicate whether the start or not
*/
infChart.harmonicPatternDrawing.prototype.step = function (e, isStartPoint, itemProperties) {
    var ann = this.annotation,
        options = ann.options,
        chart = ann.chart,
        xAxis = chart.xAxis[options.xAxis],
        yAxis = chart.yAxis[options.yAxis],
        pathDefinition = ann.shape.d.split(' '),
        x = xAxis.toPixels(options.xValue),
        y = yAxis.toPixels(options.yValue),
        pointx = xAxis.toValue(e.chartX),
        pointy = yAxis.toValue(e.chartY),
        intermediatePoints = options.intermediatePoints,
        completedSteps = options.completedSteps,
        newOtions = {};
    switch (itemProperties.name) {
        case 'a':
            if (!intermediatePoints[0]) {
                intermediatePoints[0] = {};
            }
            intermediatePoints[0].xValue = pointx;
            intermediatePoints[0].yValue = pointy;

            break;
        case 'b':
            if (!intermediatePoints[1]) {
                intermediatePoints[1] = {};
            }
            intermediatePoints[1].xValue = pointx;
            intermediatePoints[1].yValue = pointy;
            break;
        case 'c':
            if (!intermediatePoints[2]) {
                intermediatePoints[2] = {};
            }
            intermediatePoints[2].xValue = pointx;
            intermediatePoints[2].yValue = pointy;
            break;
        case 'd':
            newOtions.xValueEnd = pointx;
            newOtions.yValueEnd = pointy;
            break;
        case 'x':
            newOtions.xValue = pointx;
            newOtions.yValue = pointy;
            break;
        default:
            break;
    }
    newOtions.intermediatePoints = intermediatePoints;

    ann.update(newOtions);
    this.finalizeEachPoint();
};

/**
 * Stop function
 * @param {Event} e event
 * @param {boolean} isStartPoint indicate whether the start or not
 */
infChart.harmonicPatternDrawing.prototype.stop = function (e, isStartPoint) {
    var self = this,
        ann = self.annotation,
        lineShapes = self.getPatternShapes(),
        additionalDrawingsArr = self.additionalDrawings;

    // point Labels
    if (!additionalDrawingsArr.labels["dLabel"]) {
        var labelPosition = lineShapes.positions["pointLabels"]["d"];
        labelPosition && (additionalDrawingsArr.labels["dLabel"] = self.getLabel(labelPosition.label, labelPosition.x, labelPosition.y));
    }

    infChart.drawingUtils.common.saveBaseYValues.call(self, ann.options.yValue, ann.options.yValueEnd, undefined, ann.options.intermediatePoints);
    infChart.drawingUtils.common.fixSelectionMarker.call(self, ann);
};

infChart.harmonicPatternDrawing.prototype.translateEnd = function () {
    var self = this,
        ann = self.annotation,
        options = ann.options,
        chart = ann.chart,
        xAxis = chart.xAxis[options.xAxis];

    var futureValue = chart.series[0].xData[chart.series[0].xData.length - 1];
    if(futureValue < options.xValue || futureValue < options.xValueEnd || futureValue < options.intermediatePoints[0].xValue || futureValue < options.intermediatePoints[1].xValue || futureValue < options.intermediatePoints[2].xValue || futureValue < options.intermediatePointsStore[0].xValue || futureValue < options.intermediatePointsStore[1].xValue || futureValue < options.intermediatePointsStore[2].xValue){
        var shape = self.annotation.shape.d.split(' ');
        var firstIntermediate = shape[4];
        var secondIntermediate = shape[7];
        var thirdIntermediate = shape[10];
        var xEnd = shape[13];
        var firstIntermediateXValue = xAxis.toValue(parseFloat(firstIntermediate) + xAxis.toPixels(options.xValue));
        var secondIntermediateXValue = xAxis.toValue(parseFloat(secondIntermediate) + xAxis.toPixels(options.xValue));
        var thirdIntermediateXValue = xAxis.toValue(parseFloat(thirdIntermediate) + xAxis.toPixels(options.xValue));
        var xValueEnd = xAxis.toValue(parseFloat(xEnd) + xAxis.toPixels(options.xValue));
        options.intermediatePoints[0].xValue = firstIntermediateXValue;
        options.intermediatePoints[1].xValue = secondIntermediateXValue;
        options.intermediatePoints[2].xValue = thirdIntermediateXValue;
        ann.update({
            intermediatePoints: options.intermediatePoints,
            xValueEnd: xValueEnd
        });
    }
    self.selectAndBindResize();
    self.scale();
};

infChart.harmonicPatternDrawing.prototype.updateSettings = function (properties) {
    infChart.structureManager.drawingTools.updateXabcdSettings(this.settingsPopup, properties.borderColor, properties.strokeWidth, properties.fillColorValue, properties.fillOpacityValue, properties.textColor, properties.textFontSize);
};