window.infChart = window.infChart || {};

infChart.upArrowDrawing = function () {
    infChart.drawingObject.apply(this, arguments);
    this.fillColor = '#336699';
};

infChart.upArrowDrawing.prototype = Object.create(infChart.drawingObject.prototype);

infChart.upArrowDrawing.prototype.additionalDrawingsFunction = function () {
    infChart.drawingUtils.common.symbol.additionalDrawings.call(this);
};

infChart.upArrowDrawing.prototype.bindSettingsEvents = function () {
    var theme = infChart.drawingUtils.common.getTheme.call(this);
    var fillColor = theme.upArrow && theme.upArrow.fillColor ? theme.upArrow.fillColor : this.fillColor;
    infChart.drawingUtils.common.bindArrowSettingsEvents.call(this, fillColor);
};

infChart.upArrowDrawing.prototype.getConfig = function () {
    var annotation = this.annotation;
    return {
        shape: 'upArrow',
        fillColor: infChart.themeManager.getDrawingsFillColor(annotation.options.shape.params.fill, 'upArrow'),
        strokeWidth: annotation.options.shape.params['stroke-width'],
        xValue: annotation.options.xValue,
        yValue: annotation.options.yValue,
        xValueEnd: annotation.options.xValueEnd,
        yValueEnd: annotation.options.yValueEnd,
        isLocked : annotation.options.isLocked

    };
};

infChart.upArrowDrawing.prototype.getOptions = function (properties) {
    var theme = infChart.drawingUtils.common.getTheme.call(this);
    var options = {
        xValue: properties.xValue,
        yValue: properties.yValue,
        shape: {
            type: 'symbol',
            params: {
                width: 0,
                height: 0,
                symbol: 'upArrow',
                fill: theme.upArrow && theme.upArrow.fillColor ? theme.upArrow.fillColor : this.fillColor,
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

infChart.upArrowDrawing.prototype.validateTranslation = function (newXValue) {
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

infChart.upArrowDrawing.prototype.getQuickSettingsPopup = function () {
    var theme = infChart.drawingUtils.common.getTheme.call(this);
    var fillColor = theme.upArrow && theme.upArrow.fillColor ? theme.upArrow.fillColor : this.fillColor;
    return infChart.structureManager.drawingTools.getArrowQuickSettings(fillColor);
};

infChart.upArrowDrawing.prototype.getSettingsPopup = function () {
    var theme = infChart.drawingUtils.common.getTheme.call(this);
    var fillColor = theme.upArrow && theme.upArrow.fillColor ? theme.upArrow.fillColor : this.fillColor;
    return infChart.drawingUtils.common.getArrowSettings('Arrow Up', fillColor);
};

infChart.upArrowDrawing.prototype.selectAndBindResize = function () {
    infChart.drawingUtils.common.symbol.selectAndBindResize.call(this);
};

infChart.upArrowDrawing.prototype.scale = function () {
    infChart.drawingUtils.common.symbol.scale.call(this);
};

infChart.upArrowDrawing.prototype.step = function (e, isStartPoint) {
    return infChart.drawingUtils.common.symbol.step.call(this, e, isStartPoint);
};

infChart.upArrowDrawing.prototype.stop = function (e, isStartPoint) {
    infChart.drawingUtils.common.symbol.stop.call(this, e, isStartPoint);
};

infChart.upArrowDrawing.prototype.getShapeWidth = function(){
    var self = this,
        ann = self.annotation;
    
    return ann.options.shape.params.width;
};

infChart.upArrowDrawing.prototype.translateEnd = function () {
    var self = this,
        ann = self.annotation,
        options = ann.options,
        chart = ann.chart,
        xAxis = chart.xAxis[options.xAxis];

    var futureValue = chart.series[0].xData[chart.series[0].xData.length - 1];
    if(futureValue < options.xValue || futureValue < options.xValueEnd || (futureValue < options.xValueStore) || (futureValue < options.xValueEndStore)){
        var upArrow = self.annotation.shape.d.split(' ');
        var value;
        if (options.xValue <= options.xValueEnd) {
            value = upArrow[4];
        } else {
            value = upArrow[19];
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

infChart.upArrowDrawing.prototype.updateSettings = function (properties) {
    infChart.structureManager.drawingTools.updateArrowSettings(this.settingsPopup, properties.fillColor);
};