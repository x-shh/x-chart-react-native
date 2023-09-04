window.infChart = window.infChart || {};

infChart.drawingObject = function () {
    infChart.Drawing.apply(this, arguments);
};

infChart.drawingObject.prototype = Object.create(infChart.Drawing.prototype);

//used in adding additional drawings for a drawing
infChart.drawingObject.prototype.additionalDrawingsFunction = function () {};

infChart.drawingObject.prototype.afterRedrawXAxisWithoutSetExtremes = function () {};

//used in destroy additional drawings attached with drawing
infChart.drawingObject.prototype.beforeDestroy = function () {};

infChart.drawingObject.prototype.bindSettingsEvents = function () {};

infChart.drawingObject.prototype.deselect = function(){
    this.annotation && this.annotation.group.removeClass('active-drawing');
};

//used in destroy drawings
infChart.drawingObject.prototype.destroyDrawing = function () {};

//used in saving drawings
infChart.drawingObject.prototype.getConfig = function () {};

//used in copy/paste
infChart.drawingObject.prototype.getConfigToCopy = function () {
    var annotation = this.annotation;
    var chart = annotation.chart;
    var options = annotation.options;
    var xAxis = chart.xAxis[options.xAxis];
    var yAxis = chart.yAxis[options.yAxis];
    var shapeTheme = infChart.drawingUtils.common.theme[this.shape];
    var copyDistance = shapeTheme && shapeTheme.copyDistance;
    var defaultCopyDistance = infChart.drawingUtils.common.theme.defaultCopyDistance;
    var candleDistance = this.getCandleDistance();
    var copyDistanceX = candleDistance ? candleDistance : (copyDistance && (copyDistance.x || copyDistance.x == 0)) ? copyDistance.x : defaultCopyDistance;
    var copyDistanceY = (copyDistance && (copyDistance.y || copyDistance.y == 0)) ? copyDistance.y : defaultCopyDistance;

    var properties = this.getConfig();
    properties.xValue = xAxis.toValue(xAxis.toPixels(properties.xValue) + copyDistanceX);
    properties.xValueEnd = xAxis.toValue(xAxis.toPixels(properties.xValueEnd) + copyDistanceX);
    properties.trendXValue = xAxis.toValue(xAxis.toPixels(properties.trendXValue) + copyDistanceX);
    properties.yValue = yAxis.toValue(yAxis.toPixels(properties.yValue) + copyDistanceY);
    properties.yValueEnd = yAxis.toValue(yAxis.toPixels(properties.yValueEnd) + copyDistanceY);
    properties.trendYValue = yAxis.toValue(yAxis.toPixels(properties.trendYValue) + copyDistanceY);

    if (properties.intermediatePoints) {
        infChart.util.forEach(properties.intermediatePoints, function (index, value) {
            value.xValue = xAxis.toValue(xAxis.toPixels(value.xValue) + copyDistanceX);
            value.yValue = yAxis.toValue(yAxis.toPixels(value.yValue) + copyDistanceY);
        });
    }

    return properties;
};

infChart.drawingObject.prototype.getCandleDistance = function () {
    var self = this,
        ann = self.annotation,
        options = ann.options,
        chart = ann.chart,
        xAxis = chart.xAxis[options.xAxis];

    var candleDistance;
    if (chart.hoverSeries) {
        var firstPoint = chart.hoverSeries.processedXData[0];
        var secondPoint = chart.hoverSeries.processedXData[1];
        candleDistance = xAxis.toPixels(secondPoint) - xAxis.toPixels(firstPoint);
    }
    return candleDistance;
}

//get specific options
infChart.drawingObject.prototype.getOptions = function () {};

//returns the html of the settings of the drawing
infChart.drawingObject.prototype.getSettingsPopup = function () {};

infChart.drawingObject.prototype.getQuickSettingsPopup = function () {}

infChart.drawingObject.prototype.onClick = function () {};

//used in scale the drawing
infChart.drawingObject.prototype.scale = function () {};

//used in selection of each drawing
infChart.drawingObject.prototype.select = function () {};

infChart.drawingObject.prototype.selectAndBindResize = function () {};

//returns the height of the drawing
infChart.drawingObject.prototype.setOptions = function () {};

infChart.drawingObject.prototype.step = function () {};

infChart.drawingObject.prototype.stop = function () {};

infChart.drawingObject.prototype.translate = function () {};

infChart.drawingObject.prototype.translateEnd = function () {};

//used in trading break even drawing
infChart.drawingObject.prototype.updateOptions = function () {};

//update settings according to loaded properties
infChart.drawingObject.prototype.updateSettings = function () {};

//check whether the property is required when saving and resetting the drawing
infChart.drawingObject.prototype.isRequiredProperty = function () {};



