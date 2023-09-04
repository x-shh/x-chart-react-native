window.infChart = window.infChart || {};

infChart.verticalLineDrawing = function () {
    infChart.drawingObject.apply(this, arguments);
};

infChart.verticalLineDrawing.prototype = Object.create(infChart.drawingObject.prototype);

infChart.verticalLineDrawing.prototype.additionalDrawingsFunction = function () {
    var drawingObject = this,
        ann = drawingObject.annotation,
        options = ann.options,
        chart = ann.chart,
        height = ann.chart.xAxis.height,
        padding = 3,
        theme = infChart.drawingUtils.common.getTheme.call(this),
        nearestXDataPoint = infChart.math.findNearestXDataPoint(chart, ann.options.xValue, undefined, options.useAllXDataToFindNearestPoint, options.useFutureDate),
        xAxis = chart.xAxis[options.xAxis],
        newX = xAxis.toPixels(nearestXDataPoint) - xAxis.toPixels(options.xValue);

    var lineLabel = chart.renderer.label(this.stockChart.getXAxisCrosshairLabel(nearestXDataPoint, this.stockChart.chart.xAxis[options.xAxis]), 0, 0).attr({
        'zIndex': 20,
        'padding': padding,
        'r': 1,
        'fill': theme.axisLabel.fill,
        'opacity': theme.axisLabel.opacity,
        'stroke': theme.axisLabel.stroke,
        'stroke-width': 1,
        'stroke-linecap': 'butt',
        'stroke-linejoin': 'miter',
        'stroke-opacity': 1,
        'hAlign': 'center',
        'height': height,
        'class': 'drawing-line-axis-lbl'
    }).add(ann.group);

    lineLabel.css({ //to color text
        'fontWeight': 700,
        'color': theme.axisLabel.fontColor
    });

    drawingObject.additionalDrawings['lineLabel'] = lineLabel;
    ann.group.addClass("line-drawing");
    // bringing the label's group front to avoid overlapping with the axis labels
    infChart.drawingUtils.common.getAxisLabelToFront.call(this, lineLabel);
    if (!ann.selectionMarker) {
        ann.selectionMarker = [];
        infChart.drawingUtils.common.addSelectionMarker.call(this, ann, newX, 0);
    }
};

infChart.verticalLineDrawing.prototype.afterRedrawXAxisWithoutSetExtremes = function () {
    infChart.drawingUtils.common.getAxisLabelToFront.call(this, this.additionalDrawings['lineLabel'], true);
};

infChart.verticalLineDrawing.prototype.bindSettingsEvents = function () {
    var self = this;

    var callBackFnLineSettingsEvents = {
        onLineColorChange: infChart.drawingSettings.getEventHandler(this, infChart.drawingSettings.eventTypes.lineColor, {
            isUpdateAnnotationStyles: true,
            settingsItem: 'line'
        }),
        onLineWidthChange: infChart.drawingSettings.getEventHandler(this, infChart.drawingSettings.eventTypes.lineWidth, {
            isUpdateAnnotationStyles: true,
            settingsItem: 'lineWidth'

        }),
        onLineStyleChange: infChart.drawingSettings.getEventHandler(this, infChart.drawingSettings.eventTypes.lineStyle, {
            isUpdateAnnotationStyles: true,
            settingsItem: 'lineStyle',
        }),
        onResetToDefault : function(){
            self.updateSavedDrawingProperties(true)
        }   
    }

    infChart.structureManager.drawingTools.bindLineSettings(self.settingsPopup, callBackFnLineSettingsEvents);
};

infChart.verticalLineDrawing.prototype.getConfig = function () {
    var annotation = this.annotation;
    return {
        shape: 'verticalLine',
        settings:{
            lineColor: infChart.themeManager.getDrawingsBorderColor(annotation.options.shape.params.stroke, 'verticalLine'),
            lineOpacity: annotation.options.shape.params.opacity,
            lineWidth: annotation.options.shape.params['stroke-width'],
            lineStyle: annotation.options.shape.params.dashstyle,
            fillColor: infChart.themeManager.getDrawingsFillColor(annotation.options.shape.params.fill, 'verticalLine')
        },
        xValue: annotation.options.xValue,
        yValue: annotation.options.yValue,
        clickCords: annotation.options.clickCords,
        height: annotation.chart.plotHeight,
        isLocked : annotation.options.isLocked

    };
};

/**
 * Returns the obj of properties to copy
 * @returns {object} properties
 */
infChart.verticalLineDrawing.prototype.getConfigToCopy = function () {
    var stockChartId = infChart.drawingsManager.getChartIdFromHighchartInstance(this.annotation.chart);
    var chartInstance = infChart.manager.getChart(stockChartId);
    var xAxis = chartInstance.getMainXAxis();
    var properties = this.getConfig();
    var shapeTheme = infChart.drawingUtils.common.theme.verticalLine;
    var copyDistance = shapeTheme && shapeTheme.copyDistance ? shapeTheme.copyDistance.x : infChart.drawingUtils.common.theme.defaultCopyDistance;

    properties.xValue = xAxis.toValue(xAxis.toPixels(properties.xValue) + copyDistance);
    return properties;
};

infChart.verticalLineDrawing.prototype.getOptions = function (properties, chart) {
    var options = {
        utilizeAxes: "x",
        xValue: properties.xValue,
        yValue: properties.yValue,
        nearestXDataPoint: infChart.math.findNearestXDataPoint(chart, properties.xValue, undefined, true, true),
        allowDragY: false,
        shape: {
            params: {
                d: ['M', 0, 0, 'L', 0, 0],
                dashstyle: 'solid',
                'class': 'vertical-line',
                'stroke-width': infChart.drawingUtils.common.baseLineWidth
            }
        },
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
            options.shape.params.opacity = properties.settings.lineOpacity;
        }
        if (properties.settings.lineStyle) {
            options.shape.params.dashstyle = properties.settings.lineStyle;
        }
        if (properties.settings.lineWidth) {
            options.shape.params['stroke-width'] = properties.settings.lineWidth;
        }
    } else {
        options.settings.lineColor = infChart.drawingUtils.common.baseBorderColor;
        options.settings.lineOpacity = infChart.drawingUtils.common.baseFillOpacity;
        options.settings.lineStyle = 'solid';
        options.settings.lineWidth = infChart.drawingUtils.common.baseLineWidth;
    }
    if (properties.height) {
        options.shape.params.d = ['M', 0, 0, 'L', 0, properties.height * 1.5];
    }
    if (properties.clickCords) {
        options.clickCords = properties.clickCords;
    }

    options.isRealTimeTranslation = true;
    options.useFutureDate = true;
    options.useAllXDataToFindNearestPoint = true;
    options.validateTranslationFn = this.validateTranslation;

    options = infChart.Drawing.prototype.getOptions(properties,options);

    return options;
};

infChart.verticalLineDrawing.prototype.validateTranslation = function (newXValue) {
    var self = this,
        ann = self.annotation,
        options = ann.options,
        chart = ann.chart,
        xAxis = chart.xAxis[options.xAxis],
        seriesData = chart.series[0].xData,
        dataMin = seriesData[0],
        totalPoints = infChart.drawingsManager.getTotalPoints(chart),
        dataMax = totalPoints[totalPoints.length - 1];

    return (newXValue >= dataMin && newXValue <= dataMax);
};

infChart.verticalLineDrawing.prototype.getQuickSettingsPopup = function () {
    return infChart.drawingUtils.common.getLineQuickSettings(infChart.drawingUtils.common.baseBorderColor, infChart.drawingUtils.common.baseFillOpacity);
};

infChart.verticalLineDrawing.prototype.getSettingsPopup = function () {
    return infChart.drawingUtils.common.getLineSettings('Vertical Line', infChart.drawingUtils.common.baseBorderColor, undefined, undefined, undefined, undefined, infChart.drawingUtils.common.baseFillOpacity, false, false);
};

infChart.verticalLineDrawing.prototype.scale = function (isCalculateNewValueForScale) {
    var ann = this.annotation,
        chart = ann.chart,
        options = ann.options,
        xAxis = chart.xAxis[options.xAxis],
        yAxis = chart.yAxis[options.yAxis],
        label = this.additionalDrawings['lineLabel'],
        nearestXDataPoint;

    if (isCalculateNewValueForScale) {
        nearestXDataPoint = infChart.math.findNearestXDataPoint(chart, options.xValue, undefined, options.useAllXDataToFindNearestPoint, options.useFutureDate);
        ann.update({
            nearestXDataPoint: nearestXDataPoint,
        });
        options.nearestXDataPoint = nearestXDataPoint;
    }

    var newX = xAxis.toPixels(options.nearestXDataPoint) - xAxis.toPixels(ann.options.xValue),
        line = ["M", newX, 0, 'L', newX, yAxis.height];
    ann.update({
        yValue: yAxis.toValue(chart.plotTop),
        shape: {
            params: {
                d: line
            }
        }
    });
    label.attr({
        x: newX - (label.width / 2),
        y: chart.plotHeight,
        zIndex: 20,
        text: this.stockChart.getXAxisCrosshairLabel(options.nearestXDataPoint, this.stockChart.chart.xAxis[this.annotation.options.xAxis])
    });

    infChart.drawingUtils.common.removeDragSupporters.call(this, this.dragSupporters);
    infChart.drawingUtils.common.addDragSupporters.call(this, ann, chart, ["M", line[1], 0, 'L', line[4], line[5]], this.dragSupporters);

    // Update new position of the selection marker when scaling the chart while vertical line is selected
    if (ann.selectionMarker && ann.selectionMarker.length > 0) {
        ann.selectionMarker[0].attr({
            x: newX
        });
    }
};

infChart.verticalLineDrawing.prototype.select = function () {
    infChart.drawingUtils.common.getAxisLabelToFront.call(this, this.additionalDrawings['lineLabel']);
};

infChart.verticalLineDrawing.prototype.selectAndBindResize = function () {
    var ann = this.annotation,
        options = ann.options,
        chart = ann.chart,
        label = this.additionalDrawings['lineLabel'],
        xAxis = chart.xAxis[options.xAxis],
        newX = xAxis.toPixels(options.nearestXDataPoint) - xAxis.toPixels(options.xValue);

    if (!ann.selectionMarker) {
        ann.selectionMarker = [];
        infChart.drawingUtils.common.addSelectionMarker.call(this, ann, newX, ann.chart.yAxis[ann.options.yAxis].height / 2);
    }
    // infChart.drawingUtils.common.getAxisLabelToFront.call(this, label);
};

infChart.verticalLineDrawing.prototype.step = function () { };

infChart.verticalLineDrawing.prototype.stop = function (e) {
    var ann = this.annotation,
        options = ann.options,
        chart = ann.chart,
        xAxis = chart.xAxis[options.xAxis],
        yAxis = chart.yAxis[options.yAxis],
        label = this.additionalDrawings['lineLabel'],
        nearestXDataPoint = infChart.math.findNearestXDataPoint(chart, xAxis.toValue(e.chartX), undefined, options.useAllXDataToFindNearestPoint, options.useFutureDate),
        newX = xAxis.toPixels(nearestXDataPoint) - xAxis.toPixels(ann.options.xValue),
        line = ["M", newX, 0, 'L', newX, yAxis.height];

    ann.update({
        nearestXDataPoint: nearestXDataPoint,
        shape: {
            params: {
                d: line
            }
        }
    });
    label.attr({
        x: newX - (label.width / 2),
        y: chart.plotHeight,
        zIndex: 20,
        text: this.stockChart.getXAxisCrosshairLabel(nearestXDataPoint, this.stockChart.chart.xAxis[this.annotation.options.xAxis])
    });

    if (ann.selectionMarker && ann.selectionMarker.length > 0) {
        ann.selectionMarker[0].attr({
            x: newX
        });
    }

    ann.group.addClass("line-drawing");
    infChart.drawingUtils.common.removeDragSupporters.call(this, this.dragSupporters);
    infChart.drawingUtils.common.addDragSupporters.call(this, ann, chart, ["M", line[1], 0, 'L', line[4], line[5]], this.dragSupporters);
    infChart.drawingUtils.common.onPropertyChange.call(this);
    return line;
};

infChart.verticalLineDrawing.prototype.translate = function (e) {
    var ann = this.annotation,
        options = ann.options,
        chart = ann.chart,
        xAxis = chart.xAxis[options.xAxis],
        yAxis = chart.yAxis[options.yAxis],
        label = this.additionalDrawings['lineLabel'],
        nearestXDataPoint = infChart.math.findNearestXDataPoint(chart, xAxis.toValue(e.chartX), undefined, options.useAllXDataToFindNearestPoint, options.useFutureDate),
        newX = xAxis.toPixels(nearestXDataPoint) - xAxis.toPixels(ann.options.xValue),
        line = ["M", newX, 0, 'L', newX, yAxis.height];

    ann.update({
        nearestXDataPoint: nearestXDataPoint,
        shape: {
            params: {
                d: line
            }
        }
    });

    label.attr({
        x: newX - (label.width / 2),
        y: chart.plotHeight,
        text: this.stockChart.getXAxisCrosshairLabel(nearestXDataPoint, this.stockChart.chart.xAxis[this.annotation.options.xAxis])
    });
     // Update new position of the selection marker when scaling the chart while vertical line is selected
     if (ann.selectionMarker && ann.selectionMarker.length > 0) {
        ann.selectionMarker[0].attr({
            x: newX
        });
    }
    infChart.drawingUtils.common.removeDragSupporters.call(this, this.dragSupporters);
    infChart.drawingUtils.common.addDragSupporters.call(this, ann, chart, ["M", line[1], 0, 'L', line[4], line[5]], this.dragSupporters);
    infChart.drawingUtils.common.getAxisLabelToFront.call(this, label);
};

infChart.verticalLineDrawing.prototype.translateEnd = function () {
    var ann = this.annotation;
    this.selectAndBindResize();
    ann.chart.selectedAnnotation = ann;
    infChart.drawingUtils.common.onPropertyChange.call(this);
};

/**
 * Update the annotations options specific to this tool from the given properties
 * @param options
 */
infChart.verticalLineDrawing.prototype.updateOptions = function (options) {
    var ann = this.annotation,
        options = ann.options;
    ann && ann.options && (ann.options.nearestXDataPoint = infChart.math.findNearestXDataPoint(ann.chart, options.xValue, undefined, options.useAllXDataToFindNearestPoint, options.useFutureDate));
};

infChart.verticalLineDrawing.prototype.updateSettings = function (properties) {
    infChart.structureManager.drawingTools.updateLineSettings(this.settingsPopup, properties.settings);
};
