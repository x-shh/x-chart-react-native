window.infChart = window.infChart || {};

infChart.regressionLineDrawing = function () {
    infChart.drawingObject.apply(this, arguments);
};

infChart.regressionLineDrawing.prototype = Object.create(infChart.drawingObject.prototype);

infChart.regressionLineDrawing.prototype.additionalDrawingsFunction = function () {
    var ann = this.annotation;

    ann.selectionMarker = [];

    infChart.drawingUtils.common.addSelectionMarker.call(this, ann, 0, 0);
};

infChart.regressionLineDrawing.prototype.bindSettingsEvents = function () {
    infChart.drawingUtils.common.bindBasicDrawingSettingsEvents.call(this, infChart.drawingUtils.common.baseBorderColor);
};

infChart.regressionLineDrawing.prototype.getConfig = function () {
    var annotation = this.annotation;
    return {
        shape: 'regressionLine',
        borderColor: annotation.options.shape.params.stroke,
        fillColor: annotation.options.shape.params.fill,
        strokeWidth: annotation.options.shape.params['stroke-width'],
        xValue: annotation.options.xValue,
        yValue: annotation.options.yValue,
        xValueEnd: annotation.options.xValueEnd,
        yValueEnd: annotation.options.yValueEnd,
        isLocked : annotation.options.isLocked

    };
};

infChart.regressionLineDrawing.prototype.getOptions = function (properties) {
    var options = {
        xValue: properties.xValue,
        yValue: properties.yValue,
        allowDragY: false,
        shape: {
            params: {
                d: ['M', 0, 0, 'L', 0, 0]
            }
        }
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
    if (properties.xValueEnd && properties.yValueEnd) {
        options.xValueEnd = properties.xValueEnd;
        options.yValueEnd = properties.yValueEnd;
    }
    options.validateTranslationFn = this.validateTranslation;

    options = infChart.Drawing.prototype.getOptions(properties,options);

    return options;
};

infChart.regressionLineDrawing.prototype.validateTranslation = function (newXValue) {
    var self = this,
        ann = self.annotation,
        options = ann.options,
        chart = ann.chart,
        seriesData = chart.series[0].xData,
        dataMin = seriesData[0],
        xVal = options.xValue,
        xValEnd = options.xValueEnd,
        newXValueEnd = xValEnd - xVal + newXValue,
        dataMax = seriesData[seriesData.length - 1];

    return (newXValue >= dataMin && newXValue <= dataMax) && (newXValueEnd >= dataMin && newXValueEnd <= dataMax);
};

infChart.regressionLineDrawing.prototype.getQuickSettingsPopup = function () {
    return infChart.drawingUtils.common.getRectangleQuickSettings(infChart.drawingUtils.common.baseBorderColor);
};

infChart.regressionLineDrawing.prototype.getSettingsPopup = function () {
    return infChart.drawingUtils.common.getBasicDrawingSettings(infChart.manager.getLabel('label.regressionLine'), infChart.drawingUtils.common.baseBorderColor);
};

infChart.regressionLineDrawing.prototype.scale = function () {
    var ann = this.annotation,
        chart = ann.chart,
        options = ann.options,
        xAxis = chart.xAxis[options.xAxis],
        //yAxis = chart.yAxis[options.yAxis],
        //x = ann.transX,
        //y = ann.transY,
        xVal = options.xValue,
        //yVal = options.yValue,
        periodStartXValue = options.xValueEnd > xVal ? xVal : options.xValueEnd,
        periodEndXValue = options.xValueEnd < xVal ? xVal : options.xValueEnd,
        dx = xAxis.toPixels(options.xValueEnd) - xAxis.toPixels(xVal),
        regressionLinePoints = infChart.math.calculateLinearRegression(chart, ann.options.yValue, periodStartXValue, periodEndXValue);

    var line = ["M", 0, regressionLinePoints.startPointY, 'L', parseInt(dx, 10), regressionLinePoints.endPointY];

    ann.update({
        shape: {
            params: {
                d: line
            }
        }
    });

    infChart.drawingUtils.common.removeDragSupporters.call(this, this.dragSupporters);
    infChart.drawingUtils.common.addDragSupporters.call(this, ann, chart, ["M", 0, line[2], 'L', line[4], line[5]], this.dragSupporters);
};

infChart.regressionLineDrawing.prototype.selectAndBindResize = function () {
    var ann = this.annotation,
        width, height, pathDefinition, startX, startY;

    ann.events.deselect.call(ann);
    ann.selectionMarker = [];
    pathDefinition = ann.shape.d.split(' ');
    startX = parseFloat(pathDefinition[1]);
    startY = parseFloat(pathDefinition[2]);
    width = parseFloat(pathDefinition[4]);
    height = parseFloat(pathDefinition[5]);
    infChart.drawingUtils.common.addAndBindSelectionMarker.call(this, ann, startX, startY, this.stepFunction, this.stop, true);
    infChart.drawingUtils.common.addAndBindSelectionMarker.call(this, ann, width, height, this.stepFunction, this.stop, false);
};

infChart.regressionLineDrawing.prototype.step = function (e, isStartPoint) {
    var ann = this.annotation,
        chart = ann.chart,
        points = infChart.drawingUtils.common.calculateInitialPoints(e, ann, isStartPoint, 0, 0),
        xValueEnd = isStartPoint ? ann.options.xValueEnd : points.xAxis.toValue(points.x),
        periodStartXValue = xValueEnd > ann.options.xValue ? ann.options.xValue : xValueEnd,
        periodEndXValue = xValueEnd < ann.options.xValue ? ann.options.xValue : xValueEnd,
        regressionLinePoints = infChart.math.calculateLinearRegression(chart, ann.options.yValue, periodStartXValue, periodEndXValue);

    var line = ["M", 0, regressionLinePoints.startPointY, 'L', parseInt(points.dx, 10), regressionLinePoints.endPointY];
    ann.shape.attr({
        d: line
    });

    return line;
};

infChart.regressionLineDrawing.prototype.stop = function (e, isStartPoint) {
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
    infChart.drawingUtils.common.addDragSupporters.call(this, ann, chart, ["M", 0, line[2], 'L', line[4], line[5]], this.dragSupporters);
    infChart.drawingUtils.common.onPropertyChange.call(this);
};

infChart.regressionLineDrawing.prototype.translate = function () {
    var ann = this.annotation,
        chart = ann.chart,
        options = ann.options,
        xAxis = chart.xAxis[options.xAxis],
        xVal = options.xValue,
        periodStartXValue = options.xValueEnd > xVal ? xVal : options.xValueEnd,
        periodEndXValue = options.xValueEnd < xVal ? xVal : options.xValueEnd,
        dx = xAxis.toPixels(options.xValueEnd) - xAxis.toPixels(xVal),
        regressionLinePoints = infChart.math.calculateLinearRegression(chart, ann.options.yValue, periodStartXValue, periodEndXValue);
    ann.events.deselect.call(ann);

    var line = ["M", 0, regressionLinePoints.startPointY, 'L', parseInt(dx, 10), regressionLinePoints.endPointY];

    ann.update({
        shape: {
            params: {
                d: line
            }
        }
    });

    infChart.drawingUtils.common.removeDragSupporters.call(this, this.dragSupporters);
    infChart.drawingUtils.common.addDragSupporters.call(this, ann, chart, ["M", 0, line[2], 'L', line[4], line[5]], this.dragSupporters);
    // this.openDrawingSettings.call(this);
    this.selectAndBindResize();
    ann.chart.selectedAnnotation = ann;
};

infChart.regressionLineDrawing.prototype.translateEnd = function () {
    infChart.drawingUtils.common.onPropertyChange.call(this);
};

infChart.regressionLineDrawing.prototype.updateSettings = function (properties) {
    infChart.structureManager.drawingTools.updateBasicDrawingSettings(this.settingsPopup, properties.borderColor, properties.strokeWidth);
};
