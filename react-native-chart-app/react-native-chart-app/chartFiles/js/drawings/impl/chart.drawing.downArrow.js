window.infChart = window.infChart || {};

infChart.downArrowDrawing = function () {
    this.fillColor = '#FF4D4D';
    infChart.drawingObject.apply(this, arguments);
};

infChart.downArrowDrawing.prototype = Object.create(infChart.drawingObject.prototype);

infChart.downArrowDrawing.prototype.additionalDrawings = function () {
    infChart.drawingUtils.common.symbol.additionalDrawings.call(this);
};

infChart.downArrowDrawing.prototype.bindSettingsEvents = function () {
    var theme = infChart.drawingUtils.common.getTheme.call(this);
    var fillColor = theme.downArrow && theme.downArrow.fillColor ? theme.downArrow.fillColor : this.fillColor;
    infChart.drawingUtils.common.bindArrowSettingsEvents.call(this, fillColor);
};

infChart.downArrowDrawing.prototype.getConfig = function () {
    var annotation = this.annotation;
    return {
        shape: 'downArrow',
        fillColor: infChart.themeManager.getDrawingsFillColor(annotation.options.shape.params.fill, 'downArrow'),
        strokeWidth: annotation.options.shape.params['stroke-width'],
        xValue: annotation.options.xValue,
        yValue: annotation.options.yValue,
        xValueEnd: annotation.options.xValueEnd,
        yValueEnd: annotation.options.yValueEnd,
        isLocked : annotation.options.isLocked

    };
};

infChart.downArrowDrawing.prototype.getOptions = function (properties) {
    var theme = infChart.drawingUtils.common.getTheme.call(this);
    var options = {
        xValue: properties.xValue,
        yValue: properties.yValue,
        shape: {
            type: 'symbol',
            params: {
                width: 0,
                height: 0,
                symbol: 'downArrow',
                fill: theme.downArrow && theme.downArrow.fillColor ? theme.downArrow.fillColor : this.fillColor,
                stroke: 'none'
            }
        }
    };
    if (properties.fillColor) {
        options.shape.params.fill = properties.fillColor;
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

infChart.downArrowDrawing.prototype.validateTranslation = function (newXValue) {
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

    return (newXValue >= dataMin && newXValue <= dataMax) && (newXValueEnd >= dataMin && newXValueEnd <= dataMax);
};

infChart.downArrowDrawing.prototype.getQuickSettingsPopup = function () {
    var theme = infChart.drawingUtils.common.getTheme.call(this);
    var fillColor = theme.downArrow && theme.downArrow.fillColor ? theme.downArrow.fillColor : this.fillColor;
    return infChart.structureManager.drawingTools.getArrowQuickSettings(fillColor);
};

infChart.downArrowDrawing.prototype.getSettingsPopup = function () {
    var theme = infChart.drawingUtils.common.getTheme.call(this);
    var fillColor = theme.downArrow && theme.downArrow.fillColor ? theme.downArrow.fillColor : this.fillColor;
    return infChart.drawingUtils.common.getArrowSettings('Arrow Down', fillColor);
};

infChart.downArrowDrawing.prototype.scale = function () {
    infChart.drawingUtils.common.symbol.scale.call(this);
};

infChart.downArrowDrawing.prototype.selectAndBindResize = function () {
    infChart.drawingUtils.common.symbol.selectAndBindResize.call(this);
};

infChart.downArrowDrawing.prototype.step = function (e, isStartPoint) {
    return infChart.drawingUtils.common.symbol.step.call(this, e, isStartPoint);
};

infChart.downArrowDrawing.prototype.stop = function (e, isStartPoint) {
    infChart.drawingUtils.common.symbol.stop.call(this, e, isStartPoint);
};

infChart.downArrowDrawing.prototype.getShapeWidth = function(){
    var self = this,
        ann = self.annotation;
    
    return ann.shape.params.width;
};

infChart.downArrowDrawing.prototype.translateEnd = function () {
    var self = this,
        ann = self.annotation,
        options = ann.options,
        chart = ann.chart,
        xAxis = chart.xAxis[options.xAxis];

    var futureValue = chart.series[0].xData[chart.series[0].xData.length - 1];
    if(futureValue < options.xValue || futureValue < options.xValueEnd || (futureValue < options.xValueStore) || (futureValue < options.xValueEndStore)){
        var downArrow = self.annotation.shape.d.split(' ');
        var value;
        if (options.xValue <= options.xValueEnd) {
            value = downArrow[4];
        } else {
            value = downArrow[19];
        }
        var xValueEnd = xAxis.toValue(parseFloat(value) + xAxis.toPixels(options.xValue));
            ann.update({
                xValueEnd: xValueEnd
            });
    } else {
        width = Math.abs(xAxis.toPixels(options.xValueEnd) - xAxis.toPixels(options.xValue));
        var symbol = options.shape.params;
        symbol.width = width;
        ann.update({
            shape: {
                params: symbol
            }
        });
    }
    infChart.drawingUtils.common.symbol.translateEnd.call(this);
};

infChart.downArrowDrawing.prototype.updateSettings = function (properties) {
    infChart.structureManager.drawingTools.updateArrowSettings(this.settingsPopup, properties.fillColor);
};
