window.infChart = window.infChart || {};

infChart.highLowRegressionChannelDrawing = function () {
    infChart.drawingObject.apply(this, arguments);
    this.levels = {
        upper: { id: "upper", fillColor: '#726a6f', fillOpacity: 0.5, label: "label.upperFillColor" },
        lower: { id: "lower", fillColor: '#835974', fillOpacity: 0.5, label: "label.lowerFillColor" }
    };
};

infChart.highLowRegressionChannelDrawing.prototype = Object.create(infChart.drawingObject.prototype);

infChart.highLowRegressionChannelDrawing.prototype.additionalDrawingsFunction = function () {
    var ann = this.annotation,
        chart = ann.chart,
        options = ann.options,
        padding = 8,
        additionalDrawingsArr = this.additionalDrawings,
        levels = this.levels,
        drawingFillAttr;

    additionalDrawingsArr.lines = {};
    additionalDrawingsArr.fill = {};

    var regOptions,
        common = infChart.drawingUtils.common;

    $.each(levels, function (indx, value) {
        regOptions = options.levels && options.levels[indx];
        drawingFillAttr = {
            'stroke-width': 0,
            fill: regOptions && regOptions.fillColor ? regOptions.fillColor : value && value.fillColor ? value.fillColor : common.baseFillColor,
            'fill-opacity': regOptions && regOptions.fillOpacity ? regOptions.fillOpacity : value.fillOpacity != undefined ? value.fillOpacity : common.baseFillOpacity,
            stroke: ann.options.shape.params.stroke,
            'z-index': 2,
            cursor: 'move'
        };
        additionalDrawingsArr.fill[value.id] = chart.renderer.path(['M', 0, 0, 'L', 0, 0, 'L', 0, 0, 'L', 0, 0]).attr(drawingFillAttr).add(ann.group);
    });


    ann.selectionMarker = [];
    // ann.selectionMarker.push(chart.renderer.rect(-padding / 2, -padding / 2, padding, padding).attr(infChart.drawingUtils.common.selectPointStyles).add(ann.group));
};

infChart.highLowRegressionChannelDrawing.prototype.afterDrag = function () {
    var ann = this.annotation,
        options = ann.options,
        data = options && options.data && options.data.avg,
        xVal = options && options.xValue,
        periodEndXValue = options && options.xValueEnd < xVal ? xVal : options.xValueEnd,
        periodStartXValue = options && options.xValueEnd > xVal ? xVal : options.xValueEnd;


    if (data && periodEndXValue < data[data.length - 1][0]) {
        if (options.drawingUpdateType == "expandWithUpdate") {
            options.drawingUpdateType = "fixed";
            infChart.drawingUtils.common.indicatorUtils.updateIndicatorOptions(this, ["drawingUpdateType"]);
        } else if (options.drawingUpdateType == "moveWithUpdate") {
            options.timeLag = data[data.length - 1][0] - periodEndXValue;
            options.timeDiff = periodEndXValue - periodStartXValue;
        }
    }

    this.calculatePeriodInRange(periodStartXValue, periodEndXValue);
};

infChart.highLowRegressionChannelDrawing.prototype.bindSettingsEvents = function () {
    var self = this;

    function onColorChange(rgb, value) {
        var isPropertyChange = true;
        if (self.settingsPopup) {
            isPropertyChange = self.isSettingsPropertyChange();
        }
        infChart.drawingUtils.common.settings.onLineColorChange.call(self, rgb, value, isPropertyChange, "[inf-ctrl='lineColorPicker']");
    }

    function onFillColorChange(rgb, value, opacity, level) {
        var isPropertyChange = true;
        if (self.settingsPopup) {
            isPropertyChange = self.isSettingsPropertyChange();
        }
        self.onFillColorChange(rgb, value, opacity, level, isPropertyChange);
    }

    function onLineWidthChange(strokeWidth) {
        var isPropertyChange = true;
        if (self.settingsPopup) {
            isPropertyChange = self.isSettingsPropertyChange();
        }
        infChart.drawingUtils.common.settings.onLineWidthChange.call(self, strokeWidth, isPropertyChange);
    }

    function onResetToDefault () {
        self.updateSavedDrawingProperties(true);
    }

    infChart.structureManager.drawingTools.bindRegressionChannelSettings(self.settingsPopup, onColorChange, onFillColorChange, onLineWidthChange, onResetToDefault);
};

infChart.highLowRegressionChannelDrawing.prototype.calculatePeriodInRange = function (startVal, endVal) {
    var self = this,
        ann = self.annotation,
        chart = ann.chart,
        mainSeries = chart && chart.series[0],
        data = mainSeries && mainSeries.options.data,
        length = data && data.length,
        count = 0;

    for (var i = length; i >= 0; i--) {
        if (data[i] && data[i][0] <= endVal) {
            if (data[i] && data[i][0] >= startVal) {
                if (count == 0) {
                    // This index is used to find out end value when drawing tool is not aligned with the last value.
                    self.periodEndIdx = i;
                }
                count++;
            } else {
                break;
            }
        }
    }
    return count;
};

infChart.highLowRegressionChannelDrawing.prototype.calculateRegressionChannel = function (periodStartXValue, periodEndXValue) {
    var self = this,
        ann = self.annotation,
        options = ann && ann.options,
        chart = ann.chart,
        compareValue = chart && chart.series[0] && chart.series[0].userOptions.compare && chart.series[0].compareValue || 0,
        n = 0,
        data = options && options.data,
        length = data && data.avg && data.avg.length,
        dataLength = 0,
        xAxis = chart.xAxis[ann.options.xAxis],
        yAxis = chart.yAxis[ann.options.yAxis],
        point, x, y,
        refX = xAxis.toPixels(ann.options.xValue),
        refY = yAxis.toPixels(ann.options.yValue),
        periodDataPoints = {},
        regPoints = {},
        sigmaX = {},
        sigmaY = {},
        sigmaXX = {},
        sigmaXY = {},
        sigmaYY = {},
        calPoints;

    for (; n < length; n++) {
        for (var key in data) {
            if (data.hasOwnProperty(key) && data[key][n]) {
                point = data[key][n];

                if (point[0] && !isNaN(point[1]) && point[0] >= periodStartXValue && point[0] <= periodEndXValue) {
                    x = xAxis.toPixels(point[0]) - refX;
                    y = yAxis.toPixels(point[1] - compareValue) - refY;
                    sigmaX[key] = (sigmaX[key] || 0) + x; //Σ(X)
                    sigmaY[key] = (sigmaY[key] || 0) + y; //Σ(Y)
                    sigmaXX[key] = (sigmaXX[key] || 0) + x * x; //Σ(X^2)
                    sigmaXY[key] = (sigmaXY[key] || 0) + x * y; //Σ(XY)
                    sigmaYY[key] = (sigmaYY[key] || 0) + y * y; //Σ(Y^2)

                    if (!periodDataPoints[key]) {
                        periodDataPoints[key] = [];
                    }

                    periodDataPoints[key].push(point);
                }
            }
        }

    }


    for (key in periodDataPoints) {
        if (periodDataPoints.hasOwnProperty(key)) {

            calPoints = periodDataPoints[key];
            dataLength = calPoints.length;

            var intercept = (sigmaY[key] * sigmaXX[key] - sigmaX[key] * sigmaXY[key]) / ((dataLength) * sigmaXX[key] - sigmaX[key] * sigmaX[key]); ///(dataLength * sum[3] - sum[0] * sum[1]) / (dataLength * sum[2] - sum[0] * sum[0]);
            var gradient = ((dataLength) * sigmaXY[key] - sigmaX[key] * sigmaY[key]) / (((dataLength) * sigmaXX[key] - sigmaX[key] * sigmaX[key]));//(sum[1] / dataLength) - (gradient * sum[0]) / dataLength;

            //TODO :: There is an issue with the move with update after dragging it backwards
            //gradient = sigmaX[key] <0 ? (-1) * gradient : gradient;
            //intercept = sigmaX[key] <0 ? intercept - refY : intercept;
            regPoints[key] = [];

            for (n = 0; n < dataLength; n++) {
                point = calPoints[n];
                x = xAxis.toPixels(point[0]) - refX;
                //y = yAxis.toPixels(point[1]) - refY;
                regPoints[key][n] = (intercept + (gradient * x));//- compareValue;// - refY;
            }
        }
    }
    return {
        calcData: { periodData: periodDataPoints },
        regPoints: regPoints
    };
};

infChart.highLowRegressionChannelDrawing.prototype.getConfig = function () {
    var annotation = this.annotation, levels = {};

    $.each(this.additionalDrawings.fill, function (id, val) {
        levels[id] = {
            fillColor: val.attr('fill'),
            fillOpacity: val.attr('fill-opacity')
        }
    });
    return {
        shape: 'highLowRegressionChannel',
        levels: levels,
        borderColor: annotation.options.shape.params.stroke,
        fillColor: annotation.options.shape.params.fill,
        strokeWidth: annotation.options.shape.params['stroke-width'],
        xValue: annotation.options.xValue,
        yValue: annotation.options.yValue,
        xValueEnd: annotation.options.xValueEnd,
        yValueEnd: annotation.options.yValueEnd,
        //indicatorId : annotation.options.indicatorId,
        drawingUpdateType: annotation.options.drawingUpdateType,
        regPeriod: annotation.options.regPeriod
    };
};

infChart.highLowRegressionChannelDrawing.prototype.getOptions = function (properties) {
    var options = {
        name: "Regression Channel",
        indicatorId: properties.indicatorId,
        xValue: properties.xValue,
        yValue: properties.yValue,
        xValueEnd: properties.xValueEnd,
        yValueEnd: properties.yValueEnd,
        allowDragY: false,
        shape: {
            params: {
                d: ['M', 0, 0, 'L', 0, 0]
            }
        },
        isIndicator: true,
        drawingUpdateType: properties.drawingUpdateType,
        drawingType: infChart.constants.drawingTypes.indicator,
        regPeriod: properties.regPeriod,
        allowDragX: this.isAllowDragX(properties.drawingUpdateType)
    };
    if (properties.fillColor) {
        options.shape.params.fill = properties.fillColor;
    }
    if (properties.borderColor) {
        options.shape.params.stroke = properties.borderColor;
    }
    if (properties.strokeWidth) {
        options.shape.params['stroke-width'] = properties.strokeWidth;
    }
    if (properties.levels) {
        options.levels = properties.levels;
    }
    return options;
};

infChart.highLowRegressionChannelDrawing.prototype.getPeriodRange = function (periodStartXValue, periodEndXValue) {
    var ann = this.annotation,
        options = ann.options,
        chart = ann.chart,
        data = chart.series[0] && chart.series[0].options.data;

    if (data && data.length > 0 && !options.mouseDownOnAnn) {
        switch (options.drawingUpdateType) {
            case "expandWithUpdate":
                periodEndXValue = data[data.length - 1][0];
                break;
            case "moveWithUpdate":
                periodEndXValue = data[data.length - 1][0] - (options.timeLag || 0);
                periodStartXValue = ((data.length > options.regPeriod && data[data.length - options.regPeriod][0]) || data[0][0]) - (options.timeLag || 0);
                break;
            case "fixed":
                if (!this.periodEndIdx) {
                    this.periodEndIdx = data.length - 1;
                }
                periodStartXValue = data[this.periodEndIdx - options.regPeriod][0];
                break;
            default:
                break;
        }
    }
    return { periodStartXValue: periodStartXValue, periodEndXValue: periodEndXValue };
};

infChart.highLowRegressionChannelDrawing.prototype.getSettingsPopup = function () {
    var currentConfig = this.getConfig();
    var levels = infChart.util.merge({}, this.levels, currentConfig.levels);
    return infChart.structureManager.drawingTools.getRegressionChannelSettings(levels, currentConfig.borderColor, currentConfig.strokeWidth);
};

infChart.highLowRegressionChannelDrawing.prototype.isAllowDragX = function (drawingUpdateType) {
    return drawingUpdateType.toLowerCase() == "fixed";
};

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
infChart.highLowRegressionChannelDrawing.prototype.onFillColorChange = function (rgb, value, opacity, level, isPropertyChange, colorPickerRef) {
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

infChart.highLowRegressionChannelDrawing.prototype.setOptions = function (properties, redraw) {
    var self = this,
        ann = self.annotation,
        options = ann.options,
        hasTypeChange,
        hasPeriodChange;

    if (properties.calData) {
        options.data = properties.calData;
    }

    if (properties.drawingUpdateType && properties.drawingUpdateType != options.drawingUpdateType) {
        options.drawingUpdateType = properties.drawingUpdateType;
        hasTypeChange = true;
    }

    if (properties.regPeriod && properties.regPeriod != options.regPeriod) {
        options.regPeriod = properties.regPeriod;
        hasPeriodChange = true;
    }

    if (properties.calData || hasTypeChange) {
        var data = options.data.avg;

        options.allowDragX = this.isAllowDragX(properties.drawingUpdateType);

        switch (options.drawingUpdateType) {
            case "expandWithUpdate":
                options.xValueEnd = data[data.length - 1][0];
                if (hasPeriodChange) {
                    //when period is changed from out side change the start value also
                    options.xValue = (data.length > options.regPeriod && data[data.length - options.regPeriod][0]) || data[0][0];
                }
                break;
            case "moveWithUpdate":
                // always change the end and start values since drawing tool is moving
                options.xValueEnd = data[data.length - 1][0] - (options.timeLag || 0);
                options.xValue = (data.length > options.regPeriod && data[data.length - options.regPeriod][0]) || data[0][0] - (options.timeLag || 0);
                break;
            case 'fixed':
                var endIdx = data.length - 1;
                if (hasPeriodChange) {
                    if (!hasTypeChange) {
                        // When period is changed from the outside(with the same update type), keep end value fixed and change the start value according to the regPeriod.
                        self.calculatePeriodInRange(options.xValue, options.xValueEnd);
                        endIdx = this.periodEndIdx;
                    } else {
                        // When period both period and type are changed, set end value as last value and change the start value according to the regPeriod.
                        options.xValueEnd = data[data.length - 1][0];
                    }

                    options.xValue = (data.length > options.regPeriod && data[endIdx - options.regPeriod][0]) || data[0][0];
                }
                break;
            default:
                break;

        }
    }

    if (hasTypeChange && this.annotation) {
        // When type is changed drag feature also gets changed. So removing all the events which needs to be re-bind.
        ann.removeXEvents();
    }

    if (properties.levels) {
        $.each(properties.levels, function (id, val) {
            self.additionalDrawings.fill[id].attr({
                'fill': val.fillColor,
                'fill-opacity': val.fillOpacity
            });
        });
    }
    if (properties.shape && properties.shape.params) {
        ann.update(properties);
    }

    if (redraw) {
        self.scaleDrawing.call(self);
    }
};

infChart.highLowRegressionChannelDrawing.prototype.scale = function () {
    var self = this,
        ann = this.annotation,
        chart = ann.chart,
        options = ann.options,
        xAxis = chart.xAxis[options.xAxis],
        xVal = options.xValue,
        periodStartXValue = options.xValueEnd > xVal ? xVal : options.xValueEnd,
        periodEndXValue = options.xValueEnd < xVal ? xVal : options.xValueEnd,
        periodRange = self.getPeriodRange(periodStartXValue, periodEndXValue),
        refX = xAxis.toPixels(xVal),
        regressionChannelPoints = self.calculateRegressionChannel(periodRange.periodStartXValue, periodRange.periodEndXValue),
        regPoints = regressionChannelPoints.regPoints,

        periodPoints = regressionChannelPoints.calcData.periodData,
        regLevels = self.levels,
        //regLevels = infChart.drawingUtils.regressionChannel.levels,
        fillDrawings = self.additionalDrawings.fill,
        fill,
        currentLine,
        endRefX,
        levelPoints;

    options.timeDiff = periodRange.periodEndXValue - periodRange.periodStartXValue;

    var line = [],
        order = ["avg", "high", "low"];

    order.forEach(function (level) {
        if (regPoints.hasOwnProperty(level)) {
            levelPoints = regPoints[level];
            endRefX = xAxis.toPixels(periodPoints[level][periodPoints[level].length - 1][0]) - refX;
            line.push("M", 0, levelPoints[0], 'L', endRefX, levelPoints[levelPoints.length - 1])
        }
    });

    if (line.length != 0) {
        ann.update({
            shape: {
                params: {
                    d: line
                }
            }
        });
    }

    $.each(regLevels, (function (index, value, arr) {
        fill = fillDrawings && fillDrawings[index];
        currentLine = regressionChannelPoints[index];

        if (index == "upper") {
            fill.attr({
                d: ['M', line[1], line[2], 'L', line[4], line[5], 'L', line[10], line[11], 'L', line[7], line[8], 'L', line[1], line[2]]
            });
        } else {
            fill.attr({
                d: ['M', line[1], line[2], 'L', line[4], line[5], 'L', line[16], line[17], 'L', line[13], line[14], 'L', line[1], line[2]]
            });
        }
    }));

    infChart.drawingUtils.common.removeDragSupporters.call(this, this.dragSupporters);
    infChart.drawingUtils.common.addDragSupporters.call(this, ann, chart, line, this.dragSupporters);
};

infChart.highLowRegressionChannelDrawing.prototype.selectAndBindResize = function () {
    var ann = this.annotation,
        options = ann.options,
        width, height, endPoint, pathDefinition, startX, startY;

    ann.events.deselect.call(ann);
    ann.selectionMarker = [];
    pathDefinition = ann.shape.d.split(' ');
    startX = parseFloat(pathDefinition[1]);
    startY = parseFloat(pathDefinition[2]);
    width = parseFloat(pathDefinition[4]);
    height = parseFloat(pathDefinition[5]);
    infChart.drawingUtils.common.addAndBindSelectionMarker.call(this, ann, startX, startY, this.stepFunction, this.stop, true);
    endPoint = infChart.drawingUtils.common.addSelectionMarker.call(this, ann, width, height);
    if (options.drawingUpdateType == "fixed") {
        // other types should not be allowed to drag forward
        this.selectPointEvents(endPoint, this.stepFunction, this.stop, false);
    }
};

infChart.highLowRegressionChannelDrawing.prototype.step = function (e, isStartPoint) {
    var self = this,
        ann = self.annotation,
        options = ann.options,
        chart = ann.chart,
        points = infChart.drawingUtils.common.calculateInitialPoints(e, ann, isStartPoint, 0, 0),
        xAxis = chart.xAxis[options.xAxis],
        xVal = options.xValue,
        refX = xAxis.toPixels(xVal),
        xValueEnd = isStartPoint ? ann.options.xValueEnd : xAxis.toValue(points.x),
        periodStartXValue = xValueEnd > ann.options.xValue ? ann.options.xValue : xValueEnd,
        periodEndXValue = xValueEnd < ann.options.xValue ? ann.options.xValue : xValueEnd;

    if (!isStartPoint) {
        var timeDx = (periodEndXValue - periodStartXValue) - options.timeDiff; //xAxis.toValue(refX + points.dx) - xVal;
        options.timeLag = options.timeLag ? options.timeLag - timeDx : 0;
    }

    var periodCount = self.calculatePeriodInRange(periodStartXValue, periodEndXValue);

    ann.options.regPeriod = periodCount || options.regPeriod;
    infChart.drawingUtils.common.indicatorUtils.updateIndicatorOptions(self, ["regPeriod"]);

    //var periodRange = self.getPeriodRange(periodStartXValue, periodEndXValue),
    var regressionChannelPoints = self.calculateRegressionChannel(periodStartXValue, periodEndXValue),
        regPoints = regressionChannelPoints.regPoints,
        periodPoints = regressionChannelPoints.calcData.periodData,
        regLevels = self.levels,
        fillDrawings = self.additionalDrawings.fill,
        fill,
        levelPoints,
        endRefX;

    var line = [],
        order = ["avg", "high", "low"];


    options.timeDiff = periodEndXValue - periodStartXValue;

    order.forEach(function (level) {
        if (regPoints.hasOwnProperty(level)) {
            levelPoints = regPoints[level];
            endRefX = xAxis.toPixels(periodPoints[level][periodPoints[level].length - 1][0]) - refX;
            line.push("M", 0, levelPoints[0], 'L', endRefX, levelPoints[levelPoints.length - 1])
        }
    });

    ann.shape.attr({
        d: line
    });
    $.each(regLevels, (function (index, value, arr) {
        fill = fillDrawings && fillDrawings[index];

        if (index == "upper") {
            fill.attr({
                d: ['M', line[1], line[2], 'L', line[4], line[5], 'L', line[10], line[11], 'L', line[7], line[8], 'L', line[1], line[2]]
            });
        } else {
            fill.attr({
                d: ['M', line[1], line[2], 'L', line[4], line[5], 'L', line[16], line[17], 'L', line[13], line[14], 'L', line[1], line[2]]
            });
        }
    }));
    return line;
};

infChart.highLowRegressionChannelDrawing.prototype.stop = function (e, isStartPoint) {
    var ann = this.annotation,
        chart = ann.chart,
        line = this.stepFunction(e, isStartPoint),
        xAxis = chart.xAxis[ann.options.xAxis],
        yAxis = chart.yAxis[ann.options.yAxis],
        x = xAxis.toValue(line[4] + xAxis.toPixels(ann.options.xValue)),
        y = yAxis.toValue(line[5] + yAxis.toPixels(ann.options.yValue));

    ann.update({
        xValueEnd: x,
        yValueEnd: y,
        shape: {
            params: {
                d: line
            }
        }
    });

    infChart.drawingUtils.common.saveBaseYValues.call(this, ann.options.yValue, y);
    infChart.drawingUtils.common.removeDragSupporters.call(this, this.dragSupporters);
    infChart.drawingUtils.common.addDragSupporters.call(this, ann, chart, line, this.dragSupporters);
};

infChart.highLowRegressionChannelDrawing.prototype.translate = function () {
    var self = this,
        ann = this.annotation,
        chart = ann.chart,
        options = ann.options,
        xAxis = chart.xAxis[options.xAxis],
        xVal = options.xValue,
        refX = xAxis.toPixels(xVal),
        periodStartXValue = options.xValueEnd > xVal ? xVal : options.xValueEnd,
        periodEndXValue = options.xValueEnd < xVal ? xVal : options.xValueEnd,
        periodRange = self.getPeriodRange(self, periodStartXValue, periodEndXValue),
        dx = xAxis.toPixels(options.xValueEnd) - xAxis.toPixels(xVal),
        regressionChannelPoints = self.calculateRegressionChannel(periodRange.periodStartXValue, periodRange.periodEndXValue),
        regPoints = regressionChannelPoints.regPoints,
        periodPoints = regressionChannelPoints.calcData.periodData,
        regLevels = this.levels,
        fillDrawings = this.additionalDrawings.fill,
        fill,
        currentLine,
        endRefX,
        levelPoints;

    ann.events.deselect.call(ann);

    var line = [],
        order = ["avg", "high", "low"];

    order.forEach(function (level) {
        if (regPoints.hasOwnProperty(level)) {
            levelPoints = regPoints[level];
            endRefX = xAxis.toPixels(periodPoints[level][periodPoints[level].length - 1][0]) - refX;
            line.push("M", 0, levelPoints[0], 'L', endRefX, levelPoints[levelPoints.length - 1])
        }
    });

    ann.update({
        shape: {
            params: {
                d: line
            }
        }
    });

    $.each(regLevels, (function (index, value, arr) {
        fill = fillDrawings && fillDrawings[index];
        currentLine = regressionChannelPoints[index];

        if (index == "upper") {
            fill.attr({
                d: ['M', line[1], line[2], 'L', line[4], line[5], 'L', line[10], line[11], 'L', line[7], line[8], 'L', line[1], line[2]]
            });
        } else {
            fill.attr({
                d: ['M', line[1], line[2], 'L', line[4], line[5], 'L', line[16], line[17], 'L', line[13], line[14], 'L', line[1], line[2]]
            });
        }
    }));


    infChart.drawingUtils.common.removeDragSupporters.call(this, this.dragSupporters);
    infChart.drawingUtils.common.addDragSupporters.call(this, ann, chart, line, this.dragSupporters);
    // this.openDrawingSettings.call(this);
    this.selectAndBindResize();
    ann.chart.selectedAnnotation = ann;
};

infChart.highLowRegressionChannelDrawing.prototype.updateSettings = function (properties) {
    infChart.structureManager.drawingTools.updateRegressionChannelSettings(this.settingsPopup, properties.borderColor, properties.strokeWidth, properties.levels);
};