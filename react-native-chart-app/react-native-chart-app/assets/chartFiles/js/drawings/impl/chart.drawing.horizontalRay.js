window.infChart = window.infChart || {};

infChart.horizontalRayDrawing = function () {
    infChart.drawingObject.apply(this, arguments);
};

infChart.horizontalRayDrawing.prototype = Object.create(infChart.drawingObject.prototype);

infChart.horizontalRayDrawing.prototype.additionalDrawingsFunction = function () {
    var drawingObject = this,
        ann = drawingObject.annotation,
        chart = ann.chart,
        options = ann.options,
        xAxis = chart.xAxis[options.xAxis],
        height = 14,
        padding = 6,
        top,
        theme = {
            fill: "#191919",
            stroke: "#2a2a2b",
            opacity: 1,
            fontColor: "#ffffff",
            'zIndex': 20,
            'padding': padding,
            'r': 1,
            'stroke-width': 1,
            'stroke-linecap': 'butt',
            'stroke-linejoin': 'miter',
            'stroke-opacity': 1,
            'hAlign': 'center',
            'height': height,
            'class': 'drawing-line-axis-lbl',
            'fontWeight': 100,
            'x': xAxis.width
        };

    if (infChart.drawingUtils.common.theme && infChart.drawingUtils.common.theme.horizontalRay) {
        theme = infChart.util.merge(theme, infChart.drawingUtils.common.theme.horizontalRay);
    }

    top = -(theme.height / 2 + theme.padding);
    ann.options.xLabelPadding = theme.padding;

    var value = this.getLabelFormattedValue();
    var lineLabel = chart.renderer.label(infChart.drawingUtils.common.getYValue.call(this, value), 0, top).attr(theme).add(ann.group);

    lineLabel.css({ //to color text
        'fontWeight': theme.fontWeight,
        'color': theme.fontColor
    });

    drawingObject.additionalDrawings['lineLabel'] = lineLabel;
    
    var yAxis = chart.yAxis[ann.options.yAxis];
    if (chart.axisOffset[yAxis.side] < lineLabel.width) {
        yAxis.isDirty = true; // need to change the axis offset in the chart
        this.chartRedrawRequired = true;
    }
    ann.group.addClass("line-drawing");
    // bringing the label's group front to avoid overlapping with the axis labels
    infChart.drawingUtils.common.getAxisLabelToFront.call(this, lineLabel);
    if (!ann.selectionMarker) {
        ann.selectionMarker = [];
        infChart.drawingUtils.common.addSelectionMarker.call(this, ann, 0, 0);
    }
};

infChart.horizontalRayDrawing.prototype.beforeDestroy = function () {
    var drawingObject = this,
        ann = drawingObject.annotation,
        chart = ann.chart,
        yAxis = chart.yAxis[ann.options.yAxis];

    // need to reset the yAxis offset which is utilzed by this drawing
    yAxis.isDirty = true;
    this.chartRedrawRequired = true;
};

infChart.horizontalRayDrawing.prototype.bindSettingsEvents = function () {
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

infChart.horizontalRayDrawing.prototype.getAxisOffset = function (axis) {
    var drawingObject = this,
        ann = drawingObject.annotation,
        options = ann.options,
        label = drawingObject.additionalDrawings['lineLabel'],
        padding = infChart.util.isDefined(ann.options.xLabelPadding) || 3;

    if (!axis.isXAxis && options.yAxis === axis.options.index) {

        var value = this.getLabelFormattedValue();
        label.attr({
            text: value
        });
        return label.width + padding;
    }
    return 0;
};

infChart.horizontalRayDrawing.prototype.getConfig = function () {
    var annotation = this.annotation;
    return {
        shape: 'horizontalRay',
        settings: {
            lineColor: infChart.themeManager.getDrawingsBorderColor(annotation.options.shape.params.stroke, 'horizontalRay'),
            lineOpacity: annotation.options.shape.params.opacity,
            fillColor: infChart.themeManager.getDrawingsFillColor(annotation.options.shape.params.fill, 'horizontalRay'),
            lineWidth: annotation.options.shape.params['stroke-width'],
            lineStyle: annotation.options.shape.params.dashstyle,
        },
        xValue: annotation.options.xValue,
        yValue: annotation.options.yValue,
        clickCords: annotation.options.clickCords,
        width: annotation.chart.plotWidth,
        isLocked : annotation.options.isLocked

    };
};

/**
 * Returns the obj of properties to copy
 * @returns {object} properties
 */
infChart.horizontalRayDrawing.prototype.getConfigToCopy = function () {
    var stockChartId = infChart.drawingsManager.getChartIdFromHighchartInstance(this.annotation.chart);
    var chartInstance = infChart.manager.getChart(stockChartId);
    var yAxis = chartInstance.getMainYAxis();
    var properties = this.getConfig();
    var shapeTheme = infChart.drawingUtils.common.theme.horizontalRay;
    var copyDistance = shapeTheme && shapeTheme.copyDistance ? shapeTheme.copyDistance.y : infChart.drawingUtils.common.theme.defaultCopyDistance;

    properties.yValue = yAxis.toValue(yAxis.toPixels(properties.yValue) + copyDistance);
    return properties;
};

infChart.horizontalRayDrawing.prototype.getLabelFormattedValue = function () {
    var stockChart = this.stockChart;
    var value;
    if (stockChart.isPercent) {
        value = stockChart.getYLabel(this.annotation.options.yValue, true, false, false);
    } else {
        value = stockChart.formatValue(this.yValue, stockChart.getMainSeries().options.dp);
    }
    return value;
};

infChart.horizontalRayDrawing.prototype.getOptions = function (properties) {
    var options = {
        utilizeAxes: "y", // since label is drawn in the yAxis
        xValue: properties.xValue,
        yValue: properties.yValue,
        shape: {
            params: {
                d: ['M', 0, 0, 'L', 0, 0],
                dashstyle: 'solid',
                'class': "horizontal-line",
                'stroke-width': infChart.drawingUtils.common.baseLineWidth
            }
        },
        settings : {},
        isIndicator: properties.isIndicator
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
    if (properties.width) {
        options.shape.params.d = ['M', 0, 0, 'L', properties.width * 1.5, 0];
    }
    if (properties.clickCords) {
        options.clickCords = properties.clickCords;
    }

    if (properties.allowDragX !== undefined) {
        options.allowDragX = properties.allowDragX;
    }

    if (properties.allowDragY !== undefined) {
        options.allowDragY = properties.allowDragY;
    }

    if (properties.drawingType !== undefined) {
        options.drawingType = properties.drawingType;
    }

    if (properties.indicatorId) {
        options.indicatorId = properties.indicatorId;
    }

    options.isRealTimeTranslation = true; // since label value is needed to be changed

    options = infChart.Drawing.prototype.getOptions(properties,options);

    return options;
};

infChart.horizontalRayDrawing.prototype.getQuickSettingsPopup = function () {
    return infChart.drawingUtils.common.getLineQuickSettings(infChart.drawingUtils.common.baseBorderColor, infChart.drawingUtils.common.baseFillOpacity);
};

infChart.horizontalRayDrawing.prototype.getSettingsPopup = function () {
    return infChart.drawingUtils.common.getLineSettings('Horizontal Ray', infChart.drawingUtils.common.baseBorderColor, undefined, undefined, undefined, undefined, infChart.drawingUtils.common.baseFillOpacity, false, false);
};

infChart.horizontalRayDrawing.prototype.scale = function () {
    var ann = this.annotation,
        chart = ann.chart,
        options = ann.options,
        xAxis = chart.xAxis[options.xAxis];
    var label = this.additionalDrawings['lineLabel'];

    var nearestXData = options.isIndicator ? options.xValue : infChart.math.findNearestXDataPoint(chart, (options.saveXValue) ? options.saveXValue: options.xValue, undefined, true, true);

    if(chart.series[0].xData[0] > options.saveXValue){
        options.saveXValue = options.xValue;
    }else{
        options.saveXValue = nearestXData;
    }
    var newX = xAxis.width - xAxis.toPixels(options.saveXValue);    
    var line = ['M', 0, 0, 'L', newX , 0];
    
    ann.update({
        xValue: (chart.series[0].xData[0] <= options.saveXValue) ? options.saveXValue: options.xValue,
        shape: {
            params: {
                d: line
            }
        }
    });
    var value = this.getLabelFormattedValue();
    label.attr({
        text: value,
        x: newX,
        zIndex: 20
    });
    
    infChart.drawingUtils.common.getAxisLabelToFront.call(this, label);
    infChart.drawingUtils.common.removeDragSupporters.call(this, this.dragSupporters);
    infChart.drawingUtils.common.addDragSupporters.call(this, ann, chart, ["M", 0, 0, 'L', line[4], line[5]], this.dragSupporters);
};

infChart.horizontalRayDrawing.prototype.select = function () {
    infChart.drawingUtils.common.getAxisLabelToFront.call(this, this.additionalDrawings['lineLabel']);
};

infChart.horizontalRayDrawing.prototype.selectAndBindResize = function () {
    var ann = this.annotation;
    if (!ann.selectionMarker) {
        ann.selectionMarker = [];
        infChart.drawingUtils.common.addSelectionMarker.call(this, ann, 0, 0);
    }
};

infChart.horizontalRayDrawing.prototype.step = function () { };

infChart.horizontalRayDrawing.prototype.stop = function (e) {
    var ann = this.annotation,
        options = ann.options,
        chart = ann.chart,
        x = e.chartX,
        y = e.chartY,
        xAxis = chart.xAxis[options.xAxis],
        label = this.additionalDrawings['lineLabel'];

    if (!options.isIndicator) {
        options.xValue = infChart.math.findNearestXDataPoint(chart, options.xValue, undefined, true, true);
    }

    var newX  = xAxis.width - xAxis.toPixels(options.xValue);
    var line = ['M', 0, 0, 'L', newX , 0];
    options.saveXValue = options.xValue;

    ann.update({
        clickCords: { x: x, y: y },
        shape: {
            params: {
                d: line
            }
        }
    });
    
    label.attr({
        text: label.text.textStr,
        x: newX,
        zIndex: 20
    });

    ann.group.addClass("line-drawing");

    infChart.drawingUtils.common.saveBaseYValues.call(this, ann.options.yValue);
    infChart.drawingUtils.common.removeDragSupporters.call(this, this.dragSupporters);
    infChart.drawingUtils.common.addDragSupporters.call(this, ann, chart, ["M", 0, 0, 'L', line[4], line[5]], this.dragSupporters);
    infChart.drawingUtils.common.onPropertyChange.call(this);
    return line;
};

infChart.horizontalRayDrawing.prototype.translate = function () {
    var self = this,
        ann = self.annotation,
        options = ann.options,
        chart = ann.chart,
        xAxis = chart.xAxis[options.xAxis],
        lineLabel = this.additionalDrawings['lineLabel'];

    var value = this.getLabelFormattedValue();

    options.xValue = options.isIndicator ? options.xValue : infChart.math.findNearestXDataPoint(chart, options.xValue, undefined, true, true);
    var newX  = xAxis.width - xAxis.toPixels(options.xValue);
    var line = ['M', 0, 0, 'L', newX , 0];
    options.saveXValue = options.xValue;

    ann.update({
        xValue: options.xValue,
        shape: {
            params: {
                d: line
            }
        }
    });

    lineLabel.attr({
        x: newX,
        text: value
    });
    infChart.drawingUtils.common.getAxisLabelToFront.call(this, lineLabel);
};

infChart.horizontalRayDrawing.prototype.translateEnd = function () {
    infChart.drawingUtils.common.onPropertyChange.call(this);
};

infChart.horizontalRayDrawing.prototype.updateSettings = function (properties) {
    infChart.structureManager.drawingTools.updateLineSettings(this.settingsPopup, properties.settings);
};
