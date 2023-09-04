window.infChart = window.infChart || {};

infChart.brushDrawing = function () {
    infChart.drawingObject.apply(this, arguments);
};

infChart.brushDrawing.prototype = Object.create(infChart.drawingObject.prototype);

infChart.brushDrawing.prototype.additionalDrawingsFunction = function () {
    var ann = this.annotation;

    ann.selectionMarker = [];
    infChart.drawingUtils.common.addSelectionMarker.call(this, ann, 0, 0);
};

infChart.brushDrawing.prototype.getConfig = function () {
    var annotation = this.annotation;
    var linePointValues = [];

    annotation.options.linePointValues.forEach(function (pointValue) {
        linePointValues.push({
            xValue: pointValue.xValue,
            yValue: pointValue.yValue,
            dx: pointValue.dx,
            dy: pointValue.dy
        })
    });

    return {
        shape: 'brush',
        settings: {
            lineColor: infChart.themeManager.getDrawingsBorderColor(annotation.options.shape.params.stroke, 'brush'),
            lineOpacity: annotation.options.shape.params['stroke-opacity'],
            fillColor: infChart.themeManager.getDrawingsFillColor(annotation.options.shape.params.fill, 'brush'),
            lineWidth: annotation.options.shape.params['stroke-width'],
        },
        xValue: annotation.options.xValue,
        yValue: annotation.options.yValue,
        xValueEnd: annotation.options.xValueEnd,
        yValueEnd: annotation.options.yValueEnd,
        linePointValues: linePointValues,
        isLocked : annotation.options.isLocked
    };
};

/**
* Return the properties to set for copy object
* @returns {object} properties
*/
infChart.brushDrawing.prototype.getConfigToCopy = function () {
    var stockChartId = infChart.drawingsManager.getChartIdFromHighchartInstance(this.annotation.chart);
    var chartInstance = infChart.manager.getChart(stockChartId);
    var xAxis = chartInstance.getMainXAxis();
    var yAxis = chartInstance.getMainYAxis();
    var shapeTheme = infChart.drawingUtils.common.theme["line"];
    var copyDistance = shapeTheme && shapeTheme.copyDistance;
    var defaultCopyDistance = infChart.drawingUtils.common.theme.defaultCopyDistance;
    var copyDistanceX = (copyDistance && (copyDistance.x || copyDistance.x == 0)) ? copyDistance.x : defaultCopyDistance;
    var copyDistanceY = (copyDistance && (copyDistance.y || copyDistance.y == 0)) ? copyDistance.y : defaultCopyDistance;
    var properties = this.getConfig();
    var angle = infChart.drawingUtils.common.getAngle({
        x: xAxis.toPixels(properties.xValue),
        y: yAxis.toPixels(properties.yValue)
    }, { x: xAxis.toPixels(properties.xValueEnd), y: yAxis.toPixels(properties.yValueEnd) });
    var near45 = Math.abs(angle - 45) < 5;
    // var newlinePointValues = [], point;

    properties.xValue = xAxis.toValue(xAxis.toPixels(properties.xValue) + copyDistanceX);
    properties.xValueEnd = xAxis.toValue(xAxis.toPixels(properties.xValueEnd) + copyDistanceX);

    if (!near45) {
        properties.yValue = yAxis.toValue(yAxis.toPixels(properties.yValue) + copyDistanceY);
        properties.yValueEnd = yAxis.toValue(yAxis.toPixels(properties.yValueEnd) + copyDistanceY);
    }

    properties.linePointValues.forEach(function (pointValues) {
        pointValues.xValue = xAxis.toValue(xAxis.toPixels(pointValues.xValue) + copyDistanceX);

        if (!near45) {
            pointValues.yValue = yAxis.toValue(yAxis.toPixels(pointValues.yValue) + copyDistanceY);
        }
    });

    return properties;
};

infChart.brushDrawing.prototype.getOptions = function (properties) {
    var options = {
        xValue: properties.xValue,
        yValue: properties.yValue,
        shape: {
            params: {
                d: ['M' + 0, 0 + 'L' + 0, 0],
                dashstyle: 'solid',
                fill: 'none'
            }
        },
        linePointValues: [],
        intermediateLine: 'M0 0L0 0',
        settings: {}
    };
    if(properties.settings){
        options.settings = properties.settings;
        if (properties.settings.fillColor) {
            options.shape.params.fill = properties.settings.fillColor;
        }
        if (properties.settings.lineColor) {
            options.shape.params.stroke = properties.settings.lineColor;
        }
        if (properties.settings.lineOpacity) {
            options.shape.params['stroke-opacity'] = properties.settings.lineOpacity;
        }
        if (properties.settings.strokeWidth) {
            options.shape.params['stroke-width'] = properties.settings.lineWidth;
        }
    } else {
        options.settings.fillColor = infChart.drawingUtils.common.baseBorderColor;
        options.settings.lineColor = infChart.drawingUtils.common.baseBorderColor;
        options.settings.lineOpacity = infChart.drawingUtils.common.baseFillOpacity;
        options.settings.lineWidth = infChart.drawingUtils.common.baseLineWidth;
    }
    if (properties.xValueEnd && properties.yValueEnd) {
        options.xValueEnd = properties.xValueEnd;
        options.yValueEnd = properties.yValueEnd;
    }
    if (properties.linePointValues) {
        properties.linePointValues.forEach(function (point) {
            options.linePointValues.push({
                xValue: point.xValue,
                yValue: point.yValue,
                dx: point.dx,
                dy: point.dy
            });
        })
    }
    options.validateTranslationFn = this.validateTranslation;
    //options.isRealTimeTranslation = true;

    options = infChart.Drawing.prototype.getOptions(properties,options);

    return options;
};

infChart.brushDrawing.prototype.validateTranslation = function (newXValue) {
    var self = this,
        ann = self.annotation,
        options = ann.options,
        chart = ann.chart,
        seriesData = chart.series[0].xData,
        dataMin = seriesData[0],
        xVal = options.xValue,
        xValEnd = options.xValueEnd,
        newXValueEnd = xValEnd - xVal + newXValue,
        totalPoints = infChart.drawingsManager.getTotalPoints(chart),
        dataMax = totalPoints[totalPoints.length - 1];

        for (pointValues of options.linePointValues){
            var pointVal = pointValues.xValue;
            var newPointVal = pointVal - xVal + newXValue;
            if(newPointVal < dataMin || newPointVal > dataMax){
                return false;
            }
        }
  
    return (newXValue >= dataMin && newXValue <= dataMax) && (newXValueEnd >= dataMin && newXValueEnd <= dataMax);
};

infChart.brushDrawing.prototype.getQuickSettingsPopup = function () {
    return infChart.structureManager.drawingTools.getBrushQuickSettings(infChart.drawingUtils.common.baseBorderColor, infChart.drawingUtils.common.baseFillOpacity);
};

infChart.brushDrawing.prototype.getSettingsPopup = function () {
    return infChart.structureManager.drawingTools.getBrushSettings(infChart.drawingUtils.common.baseBorderColor, infChart.drawingUtils.common.baseFillOpacity);
};

infChart.brushDrawing.prototype.bindSettingsEvents = function () {
    var self = this;
    
    var callBackFnLineSettingsEvents = {
        onLineColorChange: infChart.drawingSettings.getEventHandler(this, infChart.drawingSettings.eventTypes.lineColor, {
            isUpdateAnnotationStyles: true,
            settingsItem: 'line',
        }),
        onLineWidthChange: infChart.drawingSettings.getEventHandler(this, infChart.drawingSettings.eventTypes.lineWidth, {
            isUpdateAnnotationStyles: true,
            settingsItem: 'lineWidth'
        }),

        onResetToDefault : function(){
            self.updateSavedDrawingProperties(true)
        }   
    }

    return infChart.structureManager.drawingTools.bindLineSettings(self.settingsPopup, callBackFnLineSettingsEvents);
};

infChart.brushDrawing.prototype.scale = function () {
    var self = this,
        ann = self.annotation,
        chart = ann.chart,
        options = ann.options,
        line = ['M' + 0, 0 + 'L' + 0, 0],
        xAxis = chart.xAxis[options.xAxis],
        yAxis = chart.yAxis[options.yAxis];

    options.linePointValues.forEach(function (pointValues) {
        pointValues.dx = xAxis.toPixels(pointValues.xValue) - xAxis.toPixels(options.xValue);
        pointValues.dy = yAxis.toPixels(infChart.drawingUtils.common.getYValue.call(self, pointValues.yValue)) - yAxis.toPixels(options.yValue);
        line.push(parseInt(pointValues.dx, 10));
        line.push(parseInt(pointValues.dy, 10));
    });

    ann.update({
        shape: {
            params: {
                d: line
            }
        }
    });

    infChart.drawingUtils.common.removeDragSupporters.call(self, self.dragSupporters);
    infChart.drawingUtils.common.addDragSupporters.call(self, ann, chart, line, self.dragSupporters);
};

infChart.brushDrawing.prototype.selectAndBindResize = function () {
    var ann = this.annotation,
        chart = ann.chart,
        xAxis = chart.xAxis[ann.options.xAxis],
        yAxis = chart.yAxis[ann.options.yAxis],
        startX = xAxis.toPixels(ann.options.xValue);
        if(startX < 0){
            endX = this.getShapeWidth();
        }else{
            endX = xAxis.toPixels(ann.options.xValueEnd) - startX;
        }
        var endY = yAxis.toPixels(ann.options.yValueEnd) - yAxis.toPixels(ann.options.yValue);
    ann.events.deselect.call(ann);
    ann.selectionMarker = [];
    chart.selectedAnnotation = ann;

    if (!isNaN(endX) && !isNaN(endY)) {
        infChart.drawingUtils.common.addAndBindSelectionMarker.call(this, ann, 0, 0, function () { }, function () { }, true);
        infChart.drawingUtils.common.addAndBindSelectionMarker.call(this, ann, endX, endY, function () { }, function () { }, false);
    }
};

infChart.brushDrawing.prototype.step = function (e, isStartPoint) {
    var ann = this.annotation,
        chart = ann.chart,
        points = infChart.drawingUtils.common.calculateInitialPoints.call(this, e, ann, isStartPoint, 0, 0),
        line = [ann.options.intermediateLine + ' ' + parseInt(points.dx, 10), parseInt(points.dy, 10)],
        xAxis = chart.xAxis[ann.options.xAxis],
        yAxis = chart.yAxis[ann.options.yAxis];

    ann.shape.attr({
        d: line
    });

    ann.options.intermediateLine = ann.shape.d;
    ann.options.linePointValues.push({ xValue: xAxis.toValue(e.chartX), yValue: infChart.drawingUtils.common.getBaseYValues.call(this, yAxis.toValue(e.chartY)), dx: points.dx, dy: points.dy });

    return { line: line, points: points };
};

infChart.brushDrawing.prototype.stop = function (e, isStartPoint) {
    var ann = this.annotation,
        chart = ann.chart,
        lineData = this.stepFunction(e, isStartPoint),
        xAxis = chart.xAxis[ann.options.xAxis],
        yAxis = chart.yAxis[ann.options.yAxis],
        x = xAxis.toValue(lineData.points.dx + xAxis.toPixels(ann.options.xValue)),
        y = yAxis.toValue(lineData.points.dy + yAxis.toPixels(ann.options.yValue));

    ann.update({
        xValueEnd: x,
        yValueEnd: y,
        shape: {
            params: {
                d: lineData.line
            }
        }
    });

    infChart.drawingUtils.common.saveBaseYValues.call(this, ann.options.yValue, y);
    infChart.drawingUtils.common.removeDragSupporters.call(this, this.dragSupporters);
    infChart.drawingUtils.common.addDragSupporters.call(this, ann, chart, lineData.line, this.dragSupporters);
    infChart.drawingUtils.common.onPropertyChange.call(this);
};

infChart.brushDrawing.prototype.getShapeWidth = function(){
    var self = this,
        ann = self.annotation,
        shape = ann.shape.d.split(' ');
    
    return shape[shape.length - 2];
};

infChart.brushDrawing.prototype.translate = function () {
    var self = this,
        ann = self.annotation,
        options = ann.options,
        chart = ann.chart,
        xAxis = chart.xAxis[options.xAxis],
        yAxis = chart.yAxis[options.yAxis];

    // options.linePointValues.forEach(function (pointValues) {
    //     pointValues.xValue = xAxis.toValue(xAxis.toPixels(options.xValue) + pointValues.dx);
    //     pointValues.yValue = infChart.drawingUtils.common.getBaseYValues.call(self, yAxis.toValue(yAxis.toPixels(options.yValue) + pointValues.dy))
    // });
};

infChart.brushDrawing.prototype.translateEnd = function () {
    var self = this,
        ann = self.annotation,
        options = ann.options,
        chart = ann.chart,
        xAxis = chart.xAxis[options.xAxis];
    var futureValue = chart.series[0].xData[chart.series[0].xData.length - 1];

    if(futureValue < options.xValue || futureValue < options.xValueEnd || (futureValue < options.xValueStore) || (futureValue < options.xValueEndStore)){
        var line = self.annotation.shape.d.split(' ');
        var value = line[line.length - 2];
        var xValueEnd = xAxis.toValue(parseFloat(value) + xAxis.toPixels(options.xValue));
        ann.update({
            xValueEnd: xValueEnd
        });
    }
    this.selectAndBindResize();
    infChart.drawingUtils.common.onPropertyChange.call(this);
};

infChart.brushDrawing.prototype.updateOptions = function (options) {
    var ann = this.annotation;
    ann && ann.options && (ann.options.linePointValues = options.linePointValues);
};

infChart.brushDrawing.prototype.updateSettings = function (properties) {
    infChart.structureManager.drawingTools.updateBrushSettings(this.settingsPopup, properties.settings);
};