window.infChart = window.infChart || {};

infChart.abcdPatternDrawing = function () {
    infChart.drawingObject.apply(this, arguments);
};

infChart.abcdPatternDrawing.prototype = Object.create(infChart.drawingObject.prototype);

/**
* set additional drawings of the tool
*/
infChart.abcdPatternDrawing.prototype.additionalDrawingsFunction = function () {
    var self = this,
        ann = self.annotation,
        chart = ann.chart,
        options = ann.options,
        yAxis = chart.yAxis[options.yAxis],
        lineShapes = self.getPatternShapes(),
        additionalDrawingsArr = self.additionalDrawings,
        theme = infChart.drawingUtils.common.getTheme(),
        shapeTheme = theme["abcdPattern"],
        pointNamesArr = ["a", "b", "c", "d"];

    additionalDrawingsArr.lines = {};
    additionalDrawingsArr.fill = {};
    additionalDrawingsArr.labels = {};
    additionalDrawingsArr.circles = {};
    additionalDrawingsArr.axisLabels = {};
    additionalDrawingsArr.rect = {};

    ann.selectionMarker = [];

    var drawingLineAttr = {
        'stroke-width': 1,
        'stroke': options.shape.params.stroke || shapeTheme && shapeTheme.stroke || infChart.drawingUtils.common.baseBorderColor,
        'stroke-dasharray': "2 2"
    };

    additionalDrawingsArr.lines["ac"] = chart.renderer.path(lineShapes.ac).attr(drawingLineAttr).add(ann.group);
    additionalDrawingsArr.lines["bd"] = chart.renderer.path(lineShapes.bd).attr(drawingLineAttr).add(ann.group);

    self.setSelectionMarkers();
    infChart.util.forEach(pointNamesArr, function (index, value) {
        var labelPosition = lineShapes.positions["pointLabels"][value];
        labelPosition && (additionalDrawingsArr.labels[value + "Label"] = self.getLabel(labelPosition.label, labelPosition.x, labelPosition.y));
    });
    additionalDrawingsArr.labels["ACFib"] = self.getLabel("ACFib", 0, 0).hide();
    additionalDrawingsArr.labels["BDFib"] = self.getLabel("BDFib", 0, 0).hide();

    yAxis.isDirty = true; // need to change the axis offset in the chart
    self.chartRedrawRequired = true;
};

/**
* Get xAxis labels to front when there is an real-time update which is to redraw the chart without extrem changes
*/
infChart.abcdPatternDrawing.prototype.afterRedrawXAxisWithoutSetExtremes = function () { };

infChart.abcdPatternDrawing.prototype.bindSettingsEvents = function () {
    infChart.drawingUtils.common.bindAbcdSettingsEvents.call(this);
};

infChart.abcdPatternDrawing.prototype.deselect = function () {
    this.annotation.selectionMarker = [];
    this.additionalDrawings.axisLabels = {};
    this.additionalDrawings.rect = {};
    this.additionalDrawings.circles = {};
};

/**
* Returns the maximum offset of the axis labels
* @param {Highstock.Axis} axis axis object
* @returns {number} max width
*/
infChart.abcdPatternDrawing.prototype.getAxisOffset = function (axis) {
    return 0;
};

/**
* Returns the base line's path
* @returns Array path to draw base line
*/
infChart.abcdPatternDrawing.prototype.getBasePatternLine = function () {
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

infChart.abcdPatternDrawing.prototype.getClickValues = function (clickX, clickY) {
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
infChart.abcdPatternDrawing.prototype.getConfig = function () {
    var annotation = this.annotation;
    var intermediatePoints = [];

    infChart.util.forEach(annotation.options.intermediatePoints, function(index , value){
        intermediatePoints.push({
            xValue: value.xValue,
            yValue: value.yValue
        });
    });

    return {
        shape: 'abcdPattern',
        borderColor: annotation.options.shape.params.stroke,
        strokeWidth: annotation.options.shape.params['stroke-width'],
        xValue: annotation.options.xValue,
        yValue: annotation.options.yValue,
        xValueEnd: annotation.options.xValueEnd,
        yValueEnd: annotation.options.yValueEnd,
        intermediatePoints: intermediatePoints,
        fillColor: 'none',
        textColor: annotation.options.textColor,
        textFontSize: annotation.options.textFontSize,
        isLocked : annotation.options.isLocked
    };
};

/**
 * Create a label and add to the group
 * @param {String} name label text
 * @param {number} x x position
 * @param {number} y y position
 * @returns {SVGElement} the generated label
 */
infChart.abcdPatternDrawing.prototype.getLabel = function (name, x, y) {
    var self = this,
        ann = self.annotation,
        options = ann.options,
        chart = ann.chart,
        theme = infChart.drawingUtils.common.getTheme(),
        shapeTheme = theme["abcdPattern"];

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

infChart.abcdPatternDrawing.prototype.getLabelFormattedXValue = function (value, axis) {
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
infChart.abcdPatternDrawing.prototype.getLabelFormattedYValue = function (yValue, optionsyValue) {
    var stockChart = this.stockChart;
    var value;
    if (stockChart.isPercent) {
        value = stockChart.getYLabel(optionsyValue, true, false, false);
    } else {
        value = stockChart.formatValue(yValue, stockChart.getMainSeries().options.dp);
    }
    return value;
};

infChart.abcdPatternDrawing.prototype.getNextPointOptions = function () {
    var ann = this.annotation;
    var completedSteps = ann.options.completedSteps;
    var pointOptions = { name: "a" };
    switch (completedSteps) {
        case 1:
            pointOptions.name = "b";
            break;
        case 2:
            pointOptions.name = "c";
            break;
        case 3:
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
infChart.abcdPatternDrawing.prototype.getOptions = function (properties) {
    var theme = infChart.drawingUtils.common.getTheme();
    var shapeTheme = theme["abcdPattern"];
    var options = {
        name: properties.name,
        xValue: properties.xValue,
        yValue: properties.yValue,
        xValueEnd: properties.xValueEnd,
        yValueEnd: properties.yValueEnd,
        intermediatePoints: [],
        shape: {
            params: {
                d: ['M', 0, 0, 'L', 0, 0]
            }
        }
    };

    options.shape.params["fill-opacity"] = 0;

    if (properties.borderColor) {
        options.shape.params.stroke = properties.color || properties.borderColor;
    }
    if (properties.strokeWidth) {
        options.shape.params['stroke-width'] = properties.strokeWidth;
    }

    if (properties.intermediatePoints) {
        infChart.util.forEach(properties.intermediatePoints, function(index , value){
            options.intermediatePoints.push({
                xValue: value.xValue,
                yValue: value.yValue
            });
        });
    }
    if (properties.completedSteps) {
        options.completedSteps = properties.completedSteps;
    }

    if(properties.textColor) {
        options.textColor = properties.textColor;
    } else {
        options.textColor = shapeTheme.label.fontColor || "#000000";
    }

    options.textFontSize = properties.textFontSize ? properties.textFontSize : shapeTheme.label.fontSize || 16;

    //options.isRealTimeTranslation = true; // since label value is needed to be changed
    options.validateTranslationFn = this.validateTranslation;

    options = infChart.Drawing.prototype.getOptions(properties,options);

    return options;
};

infChart.abcdPatternDrawing.prototype.validateTranslation = function (newXValue) {
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
        newIntermediateEnd = intermediate[1].xValue - xVal + newXValue,
        totalPoints = infChart.drawingsManager.getTotalPoints(chart),
        dataMax = totalPoints[totalPoints.length - 1];

    return (newXValue >= dataMin && newXValue <= dataMax) && (newXValueEnd >= dataMin && newXValueEnd <= dataMax) && (newIntermediateStart >= dataMin && newIntermediateStart <= dataMax) && (newIntermediateEnd >= dataMin && newIntermediateEnd <= dataMax);
};

/**
* Returns the paths, values and positions of the shapes under this drawing
* @returns {object} pattern shapes
*/
infChart.abcdPatternDrawing.prototype.getPatternShapes = function () {
    var nameAdditionalY = 25;
    var patternPaths = {};

    var ann = this.annotation;
    var chart = ann.chart;
    var options = ann.options;
    var intermediatePoints = options.intermediatePoints;
    var intermediatePointsRaw = this.intermediatePoints;
    var xAxis = chart.xAxis[options.xAxis];
    var yAxis = chart.yAxis[options.yAxis];

    var x = xAxis.toPixels(options.xValue);
    var y = yAxis.toPixels(options.yValue);

    var bx = intermediatePoints && intermediatePoints[0] && (xAxis.toPixels(intermediatePoints[0].xValue) - x);
    var by = intermediatePoints && intermediatePoints[0] && (yAxis.toPixels(intermediatePoints[0].yValue) - y);
    var cx = intermediatePoints && intermediatePoints[1] && (xAxis.toPixels(intermediatePoints[1].xValue) - x);
    var cy = intermediatePoints && intermediatePoints[1] && (yAxis.toPixels(intermediatePoints[1].yValue) - y);
    var dx = options.xValueEnd && (xAxis.toPixels(options.xValueEnd) - x);
    var dy = options.yValueEnd && (yAxis.toPixels(options.yValueEnd) - y);

    patternPaths.ac = cx !== undefined ? ['M', 0, 0, 'L', cx, cy] : x !== undefined ? ['M', 0, 0] : [];
    patternPaths.bd = dx !== undefined ? ['M', bx, by, 'L', dx, dy] : bx !== undefined ? ['M', bx, by] : [];

    if (dx !== undefined) {
        if (y < 0) {
            patternPaths.namePosition = { x: (dx) / 2, y: (dy) / 2 + nameAdditionalY };
        } else {
            patternPaths.namePosition = { x: (x + cx) / 2, y: (y + cy) / 2 + nameAdditionalY };
        }
    }

    patternPaths.aCirclePosition = { x: 0, y: 0 };

    patternPaths.positions = {
        pointLabels: {
            a: { x: -5, y: y < 0 ? 5 : -25, label: "A" }
        },
        circles: {
            a: { x: 0, y: 0 },
            b: { x: bx, y: by },
            c: { x: cx, y: cy },
            d: { x: dx, y: dy }
        }
    };

    patternPaths.positions.axisClips = {};

    patternPaths.values = {
        a: {
            xValue: options.xValue,
            yValue: this.yValue,
            optionXValue: options.xValue,
            optionYValue: options.yValue
        }
    };

    if (bx !== undefined) {
        patternPaths.bCirclePosition = { x: bx, y: by };
        patternPaths.positions.pointLabels.b = { x: bx - 5, y: y < by ? by + 5 : by - 25, label: "B" };
        patternPaths.values.b = {
            xValue: intermediatePoints[0].xValue,
            yValue: intermediatePointsRaw[0] ? intermediatePointsRaw[0].yValue : infChart.drawingUtils.common.getBaseYValue.call(this, intermediatePoints[0].yValue),
            optionXValue: intermediatePoints[0].xValue,
            optionYValue: intermediatePoints[0].yValue
        };

    }
    if (cx !== undefined) {
        patternPaths.cCirclePosition = { x: cx, y: cy };
        patternPaths.positions.pointLabels.c = { x: cx - 5, y: cy < dy ? cy - 25 : cy + 5, label: "C" };
        patternPaths.values.c = {
            xValue: intermediatePoints[1].xValue,
            yValue: intermediatePointsRaw[1] ? intermediatePointsRaw[1].yValue : infChart.drawingUtils.common.getBaseYValue.call(this, intermediatePoints[1].yValue),
            optionXValue: intermediatePoints[1].xValue,
            optionYValue: intermediatePoints[1].yValue
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

infChart.abcdPatternDrawing.prototype.getQuickSettingsPopup = function () {
    var common = infChart.drawingUtils.common;
    return infChart.structureManager.drawingTools.getAbcdQuickSettings(common.baseBorderColor);
};

infChart.abcdPatternDrawing.prototype.getSettingsPopup = function () {
    var common = infChart.drawingUtils.common;
    return infChart.structureManager.drawingTools.getAbcdSettings(infChart.manager.getLabel('label.abcdPattern'), common.baseBorderColor, this.fontColor, this.fontSize);
};

infChart.abcdPatternDrawing.prototype.hasMoreIntermediateSteps = function () {
    return this.annotation.options.completedSteps !== 3;
};

infChart.abcdPatternDrawing.prototype.onclick = function () {
    infChart.drawingUtils.common.getAxisLabelToFront.call(this, this.additionalDrawings.axisLabels["xLabel_x"]);
}

/**
* Scale function of the tool
*/
infChart.abcdPatternDrawing.prototype.scale = function (isCalculateNewValueForScale) {
    var self = this,
        ann = self.annotation,
        line,
        additionalDrawingsArr = self.additionalDrawings,
        pointNamesArr = ["a", "b", "c", "d"];

    line = self.getBasePatternLine();

    ann.update({
        shape: {
            params: {
                d: line
            }
        }
    });

    var lineShapes = self.getPatternShapes();
    additionalDrawingsArr.lines["ac"].attr({ d: lineShapes.ac });
    additionalDrawingsArr.lines["bd"].attr({ d: lineShapes.bd });

    lineShapes.namePosition && additionalDrawingsArr.labels["nameLabel"] && additionalDrawingsArr.labels["nameLabel"].attr({
        x: lineShapes.namePosition.x,
        y: lineShapes.namePosition.y
    });

    infChart.util.forEach(pointNamesArr, function (index, value) {
        var labelPosition = lineShapes.positions["pointLabels"][value];
        var label = additionalDrawingsArr.labels[value + "Label"];
        label && label.attr({ x: labelPosition.x, y: labelPosition.y });
        // circles
        if (additionalDrawingsArr.circles[value]) {
            var circlePositions = lineShapes.positions["circles"][value];
            additionalDrawingsArr.circles[value].attr({ x: circlePositions.x, y: circlePositions.y });
        }
    });

    var aPoint, bPoint, cPoint, dPoint;

    var ABVal, BCVal, CDVal;

    aPoint = [ann.options.xValue, ann.options.yValue];

    if (ann.options.intermediatePoints[0]) {
        bPoint = [ann.options.intermediatePoints[0].xValue, ann.options.intermediatePoints[0].yValue];
        ABVal = Math.abs(bPoint[1] - aPoint[1]);
    }
    if (ann.options.intermediatePoints[1]) {
        cPoint = [ann.options.intermediatePoints[1].xValue, ann.options.intermediatePoints[1].yValue];
        BCVal = Math.abs(bPoint[1] - cPoint[1]);
    }

    if (ann.options.xValueEnd) {
        dPoint = [ann.options.xValueEnd, ann.options.yValueEnd];
        CDVal = Math.abs(dPoint[1] - cPoint[1]);
    }

    var ACFib, BDFib = 0;

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
};

infChart.abcdPatternDrawing.prototype.finalizeEachPoint = function () {
    var self = this,
        ann = self.annotation,
        line,
        additionalDrawingsArr = self.additionalDrawings,
        pointNamesArr = ["a", "b", "c", "d"];

    line = self.getBasePatternLine();

    ann.update({
        shape: {
            params: {
                d: line
            }
        }
    });

    var lineShapes = self.getPatternShapes();
    additionalDrawingsArr.lines["ac"].attr({ d: lineShapes.ac });
    additionalDrawingsArr.lines["bd"].attr({ d: lineShapes.bd });

    lineShapes.namePosition && additionalDrawingsArr.labels["nameLabel"] && additionalDrawingsArr.labels["nameLabel"].attr({
        x: lineShapes.namePosition.x,
        y: lineShapes.namePosition.y
    });

    infChart.util.forEach(pointNamesArr, function (index, value) {
        var labelPosition = lineShapes.positions["pointLabels"][value];
        var label = additionalDrawingsArr.labels[value + "Label"];
        label && label.attr({ x: labelPosition.x, y: labelPosition.y });
        // circles
        if (additionalDrawingsArr.circles[value]) {
            var circlePositions = lineShapes.positions["circles"][value];
            additionalDrawingsArr.circles[value].attr({ x: circlePositions.x, y: circlePositions.y });
        }
    });

    var aPoint, bPoint, cPoint, dPoint;

    var ABVal, BCVal, CDVal;

    aPoint = [ann.options.xValue, ann.options.yValue];

    if (ann.options.intermediatePoints[0]) {
        bPoint = [ann.options.intermediatePoints[0].xValue, ann.options.intermediatePoints[0].yValue];
        ABVal = Math.abs(bPoint[1] - aPoint[1]);
    }
    if (ann.options.intermediatePoints[1]) {
        cPoint = [ann.options.intermediatePoints[1].xValue, ann.options.intermediatePoints[1].yValue];
        BCVal = Math.abs(bPoint[1] - cPoint[1]);
    }

    if (ann.options.xValueEnd) {
        dPoint = [ann.options.xValueEnd, ann.options.yValueEnd];
        CDVal = Math.abs(dPoint[1] - cPoint[1]);
    }

    var ACFib, BDFib = 0;

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
    infChart.drawingUtils.common.saveBaseYValues.call(self, ann.options.yValue, ann.options.yValueEnd, undefined, ann.options.intermediatePoints);
};

infChart.abcdPatternDrawing.prototype.scaleSelectionMarkers = function (lineShapes) {
    var self = this;
    var additionalDrawingsArr = self.additionalDrawings;
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

infChart.abcdPatternDrawing.prototype.select = function () { };

infChart.abcdPatternDrawing.prototype.selectAndBindResize = function () {
    var self = this,
        ann = self.annotation;
    ann.events.deselect.call(ann);
    ann.selectionMarker = [];
    self.setSelectionMarkers();
};

infChart.abcdPatternDrawing.prototype.setSelectionMarkers = function () {
    var self = this,
        ann = self.annotation,
        options = ann.options,
        chart = ann.chart,
        xAxis = chart.xAxis[options.xAxis],
        yAxis = chart.yAxis[options.yAxis];
    var lineShapes = self.getPatternShapes();
    var additionalDrawingsArr = self.additionalDrawings;
    var startX = xAxis.toPixels(options.xValue);
    var futureValue = chart.series[0].xData[chart.series[0].xData.length - 1];

    if (!ann.selectionMarker.length) {
        if(startX > 0){
            infChart.util.forEach(["a", "b", "c", "d"], function (index, value) {
                var circlePosition = lineShapes.positions["circles"][value];
                if (circlePosition && circlePosition.x != undefined && circlePosition.y != undefined) {
                    additionalDrawingsArr.circles[value] = infChart.drawingUtils.common.addAndBindSelectionMarker.call(self, ann, circlePosition.x, circlePosition.y, self.stepFunction, self.stop, true, undefined, { name: value });
                }
            });
        } else {
            var selectionMarkerPoints = self.getSelectionMarkerPositionFromDrawing();
            infChart.util.forEach(["a", "b", "c", "d"], function (index, value) {
                var circlePosition = lineShapes.positions["circles"][value];
                var selectionMarkerPosition = selectionMarkerPoints[value];
                if (circlePosition && selectionMarkerPosition && circlePosition.y != undefined) {
                    additionalDrawingsArr.circles[value] = infChart.drawingUtils.common.addAndBindSelectionMarker.call(self, ann, selectionMarkerPosition, circlePosition.y, self.stepFunction, self.stop, true, undefined, { name: value });
                }
            });
        }

        var clipPosX = lineShapes.positions.axisClips.x;
        var clipPosY = lineShapes.positions.axisClips.y;
        if (clipPosY && !additionalDrawingsArr.rect.y && clipPosX && !additionalDrawingsArr.rect.x) {
            ann.selectionMarker.push(additionalDrawingsArr.rect.x);
            ann.selectionMarker.push(additionalDrawingsArr.rect.y);
        }

    }
};

infChart.abcdPatternDrawing.prototype.getSelectionMarkerPositionFromDrawing = function () {
    var self = this,
        ann = self.annotation,
        options = ann.options,
        shape = ann.shape.d.split(' ');

    return {
        a: shape[1],
        b: shape[4],
        c: shape[7],
        d: shape[10]
    }
};

/**
* Step function
* @param {Event} e event
* @param {boolean} isStartPoint indicate whether the start or not
*/
infChart.abcdPatternDrawing.prototype.step = function (e, isStartPoint, itemProperties) {
    var ann = this.annotation,
        options = ann.options,
        chart = ann.chart,
        xAxis = chart.xAxis[options.xAxis],
        yAxis = chart.yAxis[options.yAxis],
        pointx = xAxis.toValue(e.chartX),
        pointy = yAxis.toValue(e.chartY),
        intermediatePoints = options.intermediatePoints,
        newOtions = {};
    switch (itemProperties.name) {
        case 'b':
            if (!intermediatePoints[0]) {
                intermediatePoints[0] = {};
            }
            intermediatePoints[0].xValue = pointx;
            intermediatePoints[0].yValue = pointy;
            break;
        case 'c':
            if (!intermediatePoints[1]) {
                intermediatePoints[1] = {};
            }
            intermediatePoints[1].xValue = pointx;
            intermediatePoints[1].yValue = pointy;
            break;
        case 'd':
            newOtions.xValueEnd = pointx;
            newOtions.yValueEnd = pointy;
            break;
        case 'a':
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
infChart.abcdPatternDrawing.prototype.stop = function (e, isStartPoint) {
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

infChart.abcdPatternDrawing.prototype.translateEnd = function () {
    var self = this,
        ann = self.annotation,
        options = ann.options,
        chart = ann.chart,
        xAxis = chart.xAxis[options.xAxis];
    var futureValue = chart.series[0].xData[chart.series[0].xData.length - 1];
    if(futureValue < options.xValue || futureValue < options.xValueEnd || futureValue < options.intermediatePoints[0].xValue || futureValue < options.intermediatePoints[1].xValue || (futureValue < options.xValueStore) || (futureValue < options.xValueEndStore) || (futureValue < options.intermediatePointsStore[0].xValue) || (futureValue < options.intermediatePointsStore[1].xValue)){
        var shape = self.annotation.shape.d.split(' ');
        var firstIntermediate = shape[4];
        var secondIntermediate = shape[7];
        var xEnd = shape[10];
        var firstIntermediateXValue = xAxis.toValue(parseFloat(firstIntermediate) + xAxis.toPixels(options.xValue));
        var secondIntermediateXValue = xAxis.toValue(parseFloat(secondIntermediate) + xAxis.toPixels(options.xValue));
        var xValueEnd = xAxis.toValue(parseFloat(xEnd) + xAxis.toPixels(options.xValue));
        options.intermediatePoints[0].xValue = firstIntermediateXValue;
        options.intermediatePoints[1].xValue = secondIntermediateXValue;
        ann.update({
            intermediatePoints: options.intermediatePoints,
            xValueEnd: xValueEnd
        });
    }
    self.selectAndBindResize();
    self.scale();
};

infChart.abcdPatternDrawing.prototype.updateSettings = function (properties) {
    infChart.structureManager.drawingTools.updateAbcdSettings(this.settingsPopup, properties.borderColor, properties.strokeWidth, properties.textColor, properties.textFontSize);
};