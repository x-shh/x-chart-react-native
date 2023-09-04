window.infChart = window.infChart || {};

infChart.horizontalLineDrawing = function () {
    this.correctionFactor = 500;
    infChart.drawingObject.apply(this, arguments);
};

infChart.horizontalLineDrawing.prototype = Object.create(infChart.drawingObject.prototype);

infChart.horizontalLineDrawing.prototype.additionalDrawingsFunction = function () {
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

    if (infChart.drawingUtils.common.theme && infChart.drawingUtils.common.theme.axisLabel) {
        theme = infChart.util.merge(theme, infChart.drawingUtils.common.theme.axisLabel);
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

    if(options.lineText){
        drawingObject.additionalDrawings.lineText = chart.renderer.label(options.lineText).css({
            color: options.shape.params.stroke,
            fontSize: infChart.drawingUtils.common.getTheme()['lineText'].fontSize
        }).add(ann.group);
    }
    
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

infChart.horizontalLineDrawing.prototype.beforeDestroy = function () {
    var drawingObject = this,
        ann = drawingObject.annotation,
        chart = ann.chart,
        yAxis = chart.yAxis[ann.options.yAxis];

    // need to reset the yAxis offset which is utilzed by this drawing
    yAxis.isDirty = true;
    this.chartRedrawRequired = true;
    if(drawingObject.additionalDrawings['lineText']){
        drawingObject.additionalDrawings['lineText'].destroy();
    }
};

infChart.horizontalLineDrawing.prototype.bindSettingsEvents = function () {
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

infChart.horizontalLineDrawing.prototype.getAxisOffset = function (axis) {
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

infChart.horizontalLineDrawing.prototype.getConfig = function () {
    var annotation = this.annotation;
    return {
        shape: 'horizontalLine',
        settings: {
            lineColor: infChart.themeManager.getDrawingsBorderColor(annotation.options.shape.params.stroke, 'horizontalLine'),
            lineOpacity: annotation.options.settings.lineOpacity,
            lineWidth: annotation.options.shape.params['stroke-width'],
            lineStyle: annotation.options.shape.params.dashstyle
        },
        xValue: annotation.options.xValue,
        yValue: annotation.options.yValue,
        clickCords: annotation.options.clickCords,
        width: annotation.chart.plotWidth,
        text: annotation.options.lineText,
        isLocked : annotation.options.isLocked
    };
};

/**
 * Returns the obj of properties to copy
 * @returns {object} properties
 */
infChart.horizontalLineDrawing.prototype.getConfigToCopy = function () {
    var stockChartId = infChart.drawingsManager.getChartIdFromHighchartInstance(this.annotation.chart);
    var chartInstance = infChart.manager.getChart(stockChartId);
    var yAxis = chartInstance.getMainYAxis();
    var properties = this.getConfig();
    var shapeTheme = infChart.drawingUtils.common.theme.horizontalLine;
    var copyDistance = shapeTheme && shapeTheme.copyDistance ? shapeTheme.copyDistance.y : infChart.drawingUtils.common.theme.defaultCopyDistance;

    properties.yValue = yAxis.toValue(yAxis.toPixels(properties.yValue) + copyDistance);
    return properties;
};

infChart.horizontalLineDrawing.prototype.getLabelFormattedValue = function () {
    var stockChart = this.stockChart;
    var value;
    if (stockChart.isPercent) {
        value = stockChart.getYLabel(this.annotation.options.yValue, true, false, false);
    } else {
        value = stockChart.formatValue(this.yValue, stockChart.getMainSeries().options.dp);
    }
    return value;
};

infChart.horizontalLineDrawing.prototype.getOptions = function (properties) {
    var options = {
        utilizeAxes: "y", // since label is drawn in the yAxis
        xValue: properties.xValue,
        yValue: properties.yValue,
        allowDragX: false,
        shape: {
            params: {
                d: ['M', 0, 0, 'L', 0, 0],
                dashstyle: 'solid',
                'class': "horizontal-line",
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

    if(properties.text){
        options.lineText = properties.text;
        options.allowDragY = properties.allowDragY || false;
        options.disableCopyPaste = true;
        this.disableQuickSettingPanel = true;
    }

    if (properties.width) {
        options.shape.params.d = ['M', 0, 0, 'L', properties.width * 1.5, 0];
    }
    if (properties.clickCords) {
        options.clickCords = properties.clickCords;
    }
    options.isRealTimeTranslation = true; // since label value is needed to be changed

    options = infChart.Drawing.prototype.getOptions(properties,options);

    return options;
};

infChart.horizontalLineDrawing.prototype.getQuickSettingsPopup = function () {
    return infChart.drawingUtils.common.getLineQuickSettings(infChart.drawingUtils.common.baseBorderColor, infChart.drawingUtils.common.baseFillOpacity);
};

infChart.horizontalLineDrawing.prototype.getSettingsPopup = function () {
    return infChart.drawingUtils.common.getLineSettings('Horizontal Line', infChart.drawingUtils.common.baseBorderColor, undefined, undefined, undefined, undefined, infChart.drawingUtils.common.baseFillOpacity, false, false);
};

infChart.horizontalLineDrawing.prototype.isRequiredProperty = function (propertyId) {
    var isPositionProperty = false;

    switch (propertyId) {
        case "yValue":
        case "yValueEnd":
        case "xValue":
        case "xValueEnd":
        case "text":
        case "isLocked":
            isPositionProperty = true;
            break;
        default :
            break;
    }

    return isPositionProperty;
};

infChart.horizontalLineDrawing.prototype.scale = function () {
    var ann = this.annotation,
        chart = ann.chart,
        options = ann.options,
        line = ann.shape.d.split(' '),
        xAxis = chart.xAxis[options.xAxis];
    var label = this.additionalDrawings['lineLabel'],
        lineText = this.additionalDrawings['lineText'];

    line[1] = - this.correctionFactor; 
    var firstCandle = xAxis.toPixels(chart.series[0].points[0].x); //distance to the first candle from chart start
    line[4] = xAxis.width - firstCandle; // line should be ended inside the plot area. Otherwise it will be shown in the yAxis some times
    
    ann.update({
        xValue: chart.series[0].points[0].x,
        shape: {
            params: {
                d: line
            }
        }
    });

    var value = this.getLabelFormattedValue();
    label.attr({
        text: value,
        x: xAxis.width - firstCandle,
        zIndex: 20
    });

    if(options.lineText){
        lineText.attr({
            x: xAxis.width - lineText.width - firstCandle - 50,
            y: - lineText.height
        });
    }

    infChart.drawingUtils.common.getAxisLabelToFront.call(this, label);
    infChart.drawingUtils.common.removeDragSupporters.call(this, this.dragSupporters);
    infChart.drawingUtils.common.addDragSupporters.call(this, ann, chart, ["M", 0, 0, 'L', line[4], line[5]], this.dragSupporters);
};

infChart.horizontalLineDrawing.prototype.select = function () {
    infChart.drawingUtils.common.getAxisLabelToFront.call(this, this.additionalDrawings['lineLabel']);
};

infChart.horizontalLineDrawing.prototype.selectAndBindResize = function () {
    var ann = this.annotation;
    if (!ann.selectionMarker) {
        ann.selectionMarker = [];
        infChart.drawingUtils.common.addSelectionMarker.call(this, ann, 0, 0);
    }
};

infChart.horizontalLineDrawing.prototype.step = function () { };

infChart.horizontalLineDrawing.prototype.stop = function (e) {
    var ann = this.annotation,
        options = ann.options,
        chart = ann.chart,
        x = e.chartX,
        y = e.chartY,
        plotWidth = chart.plotWidth * 1.5,
        xAxis = chart.xAxis[options.xAxis],
        label = this.additionalDrawings['lineLabel'],
        lineText = this.additionalDrawings['lineText'],
        line = ["M", 0, 0, 'L', xAxis.width, 0];
        line[1] = - this.correctionFactor;
        var firstCandle = xAxis.toPixels(chart.series[0].points[0].x);
        line[4] = xAxis.width - firstCandle;

    ann.update({
        clickCords: { x: x, y: y },
        xValue: chart.series[0].points[0].x,
        shape: {
            params: {
                d: line
            }
        }
    });

    if(options.lineText){
        lineText.attr({
            x: xAxis.width - firstCandle - lineText.width - 50,
            y: - lineText.height
        });
    }

    label.attr({
        text: label.text.textStr, //https://www.highcharts.com/forum/viewtopic.php?t=39232
        x: xAxis.width - firstCandle,
        zIndex: 20
    });

    ann.group.addClass("line-drawing");

    infChart.drawingUtils.common.saveBaseYValues.call(this, ann.options.yValue);
    infChart.drawingUtils.common.removeDragSupporters.call(this, this.dragSupporters);
    infChart.drawingUtils.common.addDragSupporters.call(this, ann, chart, ["M", 0, 0, 'L', line[4], line[5]], this.dragSupporters);
    infChart.drawingUtils.common.onPropertyChange.call(this);
    return line;
};

infChart.horizontalLineDrawing.prototype.translate = function () {
    var value = this.getLabelFormattedValue(),
        lineLabel = this.additionalDrawings['lineLabel'];

    lineLabel.attr({
        text: value
    });
    infChart.drawingUtils.common.getAxisLabelToFront.call(this, lineLabel);
};

infChart.horizontalLineDrawing.prototype.translateEnd = function () {
    infChart.drawingUtils.common.onPropertyChange.call(this);
};

infChart.horizontalLineDrawing.prototype.updateSettings = function (properties) {
    infChart.structureManager.drawingTools.updateLineSettings(this.settingsPopup, properties.settings);
};
