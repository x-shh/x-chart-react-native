window.infChart = window.infChart || {};

infChart.shortLineDrawing = function () {
    this.correctionFactor = 500;
    infChart.drawingObject.apply(this, arguments);

    this.linetheme = {
        fill: '#336699',
        stroke: '#ffffff',
        fontColor: "#ffffff"
    };

    this.labelProperties = {
        'stroke-linecap': 'butt',
        'stroke-linejoin': 'miter',
        'stroke-opacity': 1,
        'hAlign': 'center',
        'height': 14,
        'class': 'drawing-line-axis-lbl',
        'padding': 6,
    };

    this.mainIcon = "<img style = 'width : 12px; height : 12px;' src='data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDI3LjEuMSwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IgoJIHZpZXdCb3g9IjAgMCAxMjAwIDEyMDAiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDEyMDAgMTIwMDsiIHhtbDpzcGFjZT0icHJlc2VydmUiPgo8c3R5bGUgdHlwZT0idGV4dC9jc3MiPgoJLnN0MHtmaWxsOiM2QUJBNUU7fQoJLnN0MXtmaWxsOiNGRjRENEQ7fQo8L3N0eWxlPgo8cGF0aCBjbGFzcz0ic3QwIiBkPSJNMTAyMS45LDUzMS43djAuNVY1MzEuN3oiLz4KPHBvbHlnb24gY2xhc3M9InN0MSIgcG9pbnRzPSIxMTYuMSwxMTk1IDg5NC4xLDExOTUgODk0LjEsOTcyLjcgMzg0LjQsOTcyLjcgMTE5NSwxNjIuMiAxMDM3LjgsNSAyMjcuMyw4MTUuNiAyMjcuMywxOTQuNyA1LDE5NC43IAoJNSwxMDcxLjkgNSwxMDgzLjkgNSwxMTk1ICIvPgo8L3N2Zz4K'/>";
    this.slThemeNameLabel = {
        fill: '#e62051',
        stroke: '#ffffff',
        fontColor: "#ffffff"
    };
    
    this.takeProfit = [
        {
            id: 'tp1',
            type: 'tp',
            displayName: 'TP 1',
            priceLineDiff: -0.03,
            lineWidth: 1,
            lineStyle: 'solid',
            theme: this.tpTheme,
            enable: false,
            lineColor: "#336699"
            
        },
        {
            id: 'tp2',
            type: 'tp',
            displayName: 'TP 2',
            priceLineDiff: -0.06,
            lineWidth: 1,
            lineStyle: 'solid',
            theme: this.tpTheme,
            enable: false,
            lineColor: "#336699"
           
        },
        {
            id: 'tp3',
            type: 'tp',
            displayName: 'TP 3',
            priceLineDiff: -0.09,
            lineWidth: 1,
            lineStyle: 'solid',
            theme: this.tpTheme,
            enable: false,
            lineColor: "#336699"
            
        }
    ],
    this.stopLoss = [
        {
            id: 'sl1',
            type: 'sl',
            displayName: 'SL 1',
            priceLineDiff: 0.03,
            lineWidth: 1,
            lineStyle: 'solid',
            theme: this.slTheme,
            enable: false,
            lineColor: "#336699"
            
        },
        {
            id: 'sl2',
            type: 'sl',
            displayName: 'SL 2',
            priceLineDiff: 0.06,
            lineWidth: 1,
            lineStyle: 'solid',
            theme: this.slTheme,
            enable: false,
            lineColor: "#336699"
            
        },
        {
            id: 'sl3',
            type: 'sl',
            displayName: 'SL 3',
            priceLineDiff: 0.09,
            lineWidth: 1,
            lineStyle: 'solid',
            theme: this.slTheme,
            enable: false,
            lineColor: "#336699"
        }

    ];
    this.deselectAllDrawingsInAdditionalDrawingSelect = true;
};

infChart.shortLineDrawing.prototype = Object.create(infChart.drawingObject.prototype);
infChart.shortLineDrawing.prototype.additionalDrawingsFunction = function () {
    var drawingObject = this,
        ann = drawingObject.annotation,
        additionalDrawingsArr = drawingObject.additionalDrawings,
        chart = ann.chart,
        options = ann.options,
        xAxis = chart.xAxis[options.xAxis],
        yAxis = chart.yAxis[options.yAxis],
        height = 14,
        padding = 6,
        top,
        theme = {
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

    if (infChart.drawingUtils.common.theme && infChart.drawingUtils.common.theme.shortLineAxisLabel) {
        theme = infChart.util.merge(theme, infChart.drawingUtils.common.theme.shortLineAxisLabel);
    }

    top = - (theme.height / 2 + theme.padding);
    ann.options.xLabelPadding = theme.padding;

    var drawingLineAttr = {
        'stroke-width': 1,
        'fill': 'none',
        'stroke': options.shape.params.stroke || theme && theme.stroke || infChart.drawingUtils.common.baseBorderColor,
    };

    var value = this.getPriceLineLabelFormattedValue(options.yValue);
    var lineLabel = chart.renderer.label(infChart.drawingUtils.common.getYValue.call(this, value), 0, top).attr(theme).css({color: theme.fontColor}).add(ann.group);
    var hiddenLevels = [];

    additionalDrawingsArr.tpPriceLines = {};
    additionalDrawingsArr.tpPriceLineLabels = {};
    additionalDrawingsArr.slPriceLines = {};
    additionalDrawingsArr.slPriceLineLabels = {};
    additionalDrawingsArr.tpPriceLineTagLabels = {};
    additionalDrawingsArr.slPriceLineTagLabels = {};
    additionalDrawingsArr.mainTypeLabel = {};
    additionalDrawingsArr.tpSelectionMarkers = {};
    additionalDrawingsArr.slSelectionMarkers = {};

    options.takeProfit.forEach(function(priceLineLevel) {
        if(!priceLineLevel.enable){
            hiddenLevels.push(priceLineLevel.id);
        }
        drawingLineAttr.stroke = priceLineLevel.lineColor;
        drawingLineAttr.dashstyle = priceLineLevel.lineStyle;
        //drawingLineAttr.lineColor = priceLineLevel.lineColor;
        drawingLineAttr["stroke-width"] = priceLineLevel.lineWidth;

        var line = chart.renderer.path(['M', 0, 0, 'L', 0, 0]).attr(drawingLineAttr).add(ann.group);
        var selectionMarker = infChart.drawingUtils.common.addAdditionalDrawingSelectionMarker.call(drawingObject, ann, chart, 0, 0, {type:"additionalDrawing", level:priceLineLevel.id});
        additionalDrawingsArr.tpSelectionMarkers[priceLineLevel.id] = selectionMarker;
        line.priceLineDiff = priceLineLevel.priceLineDiff;
        
        var takeProfitTheme = infChart.util.merge({}, infChart.drawingUtils.common.theme.shortLineAxisLabel.takeProfit);
        var takeProfitLabelDrawingAttr = infChart.util.merge({}, drawingObject.labelProperties, {fill: takeProfitTheme.lineLabel.fill, 'stroke-width': takeProfitTheme.lineLabel['stroke-width'], stroke: takeProfitTheme.lineLabel.stroke });
        
        var lineLabel = chart.renderer.label(infChart.drawingUtils.common.getYValue.call(drawingObject, value), 0, top)
            .css({
                color: takeProfitTheme.lineLabel.color
            })    
            .attr(
                takeProfitLabelDrawingAttr
            )
            .add(ann.group);

        var takeProfitTagLabelDrawingAttr = infChart.util.merge({}, drawingObject.labelProperties, {fill: takeProfitTheme.lineTagLabel.fill, 'stroke-width': takeProfitTheme.lineTagLabel['stroke-width'], stroke: takeProfitTheme.lineTagLabel.stroke});
        var lineTagLabel = chart.renderer.label("TP", 0, top)
            .attr(
                takeProfitTagLabelDrawingAttr
            )
            .css({
                color: takeProfitTheme.lineTagLabel.color
            })
            .add(ann.group);
        lineLabel.priceLineDiff = priceLineLevel.priceLineDiff;
        lineLabel.id = priceLineLevel.id;
        line.attr({
            dashstyle: 'solid'
        });

        additionalDrawingsArr.tpPriceLines[priceLineLevel.id] = line;
        additionalDrawingsArr.tpPriceLineLabels[priceLineLevel.id] = lineLabel;
        additionalDrawingsArr.tpPriceLineTagLabels[priceLineLevel.id] = lineTagLabel;

        if(!priceLineLevel.enable){
            additionalDrawingsArr.tpPriceLines[priceLineLevel.id].hide();
            additionalDrawingsArr.tpPriceLineLabels[priceLineLevel.id].hide();
            additionalDrawingsArr.tpPriceLineTagLabels[priceLineLevel.id].hide();
            additionalDrawingsArr.tpSelectionMarkers[priceLineLevel.id].hide();
        }
    });

    options.stopLoss.forEach(function(priceLineLevel) {

        if(!priceLineLevel.enable){
            hiddenLevels.push(priceLineLevel.id);
        }
        drawingLineAttr.stroke = priceLineLevel.lineColor;
        drawingLineAttr.dashstyle = priceLineLevel.lineStyle;
        drawingLineAttr["stroke-width"] = priceLineLevel.lineWidth;

        var line = chart.renderer.path(['M', 0, 0, 'L', 0, 0]).attr(drawingLineAttr).add(ann.group);
        var selectionMarker = infChart.drawingUtils.common.addAdditionalDrawingSelectionMarker.call(drawingObject, ann, chart, 0, 0, {type:"additionalDrawing", level:priceLineLevel.id});
        additionalDrawingsArr.slSelectionMarkers[priceLineLevel.id] = selectionMarker;
        line.priceLineDiff = priceLineLevel.priceLineDiff;

        var stopLossTheme = infChart.util.merge({}, infChart.drawingUtils.common.theme.shortLineAxisLabel.stoploss);
        var stopLossLabelDrawingAttr = infChart.util.merge({}, drawingObject.labelProperties, {fill: stopLossTheme.lineLabel.fill, 'stroke-width': stopLossTheme.lineLabel['stroke-width'], stroke: stopLossTheme.lineLabel.stroke});
        var lineLabel = chart.renderer.label(infChart.drawingUtils.common.getYValue.call(drawingObject, value), 0, top)
        .css({
            color: stopLossTheme.lineLabel.color
        })    
        .attr(
            stopLossLabelDrawingAttr
        )
        .add(ann.group);

        var stopLossTagLabelDrawingAttr = infChart.util.merge({}, drawingObject.labelProperties, {fill: stopLossTheme.lineTagLabel.fill, 'stroke-width': stopLossTheme.lineTagLabel['stroke-width'], stroke: stopLossTheme.lineTagLabel.stroke});
        var lineTagLabel = chart.renderer.label("SL", 0, top)
        .attr(           
            stopLossTagLabelDrawingAttr
        )
        .css({
            color: stopLossTheme.lineTagLabel.color
        })
        .add(ann.group);
        lineLabel.priceLineDiff = priceLineLevel.priceLineDiff;
        lineLabel.id = priceLineLevel.id;

        additionalDrawingsArr.slPriceLines[priceLineLevel.id] = line;
        additionalDrawingsArr.slPriceLineLabels[priceLineLevel.id] = lineLabel;
        additionalDrawingsArr.slPriceLineTagLabels[priceLineLevel.id] = lineTagLabel;

        if(!priceLineLevel.enable){
            additionalDrawingsArr.slPriceLines[priceLineLevel.id].hide();
            additionalDrawingsArr.slPriceLineLabels[priceLineLevel.id].hide();
            additionalDrawingsArr.slPriceLineTagLabels[priceLineLevel.id].hide();
            additionalDrawingsArr.slSelectionMarkers[priceLineLevel.id].hide();
        }
    });

    var mainTypeLabelTheme = infChart.util.merge({}, infChart.drawingUtils.common.theme.shortLineAxisLabel.mainTypeLabel);

    additionalDrawingsArr.mainTypeLabel = chart.renderer.createElement('foreignObject').add(ann.group)
    .css(
        mainTypeLabelTheme.foreignObject
    )
    .attr({
        width: '26',
        height: '26',
        rel: 'mainType'
    })
    .add(ann.group);
    var labelHtml = "<div style='display: flex; align-items: center; justify-content: center; border-color:" + mainTypeLabelTheme.insideIcon.stroke + "; border-width:" + mainTypeLabelTheme.insideIcon['stroke-width'] + "; border-style:" + mainTypeLabelTheme.insideIcon['border-style'] + "; height: 100%;'>" + drawingObject.mainIcon + "</div>";
    additionalDrawingsArr.mainTypeLabel.element.innerHTML = labelHtml;

    drawingObject.additionalDrawings['lineLabel'] = lineLabel;

    if (chart.axisOffset[yAxis.side] < lineLabel.width) {
        yAxis.isDirty = true; // need to change the axis offset in the chart
        this.chartRedrawRequired = true;
    }
    ann.group.addClass("line-drawing");
    // bringing the label's group front to avoid overlapping with the axis labels
    infChart.drawingUtils.common.getAxisLabelToFront.call(this, lineLabel);
    if (!ann.selectionMarker) {
        ann.selectionMarker = [];
        infChart.drawingUtils.common.addSelectionMarker.call(this, ann, (xAxis.width) *3/4 - xAxis.toPixels(options.xValue), 0);
    }
};

infChart.shortLineDrawing.prototype.deselect = function () {
    var self = this,
        ann = self.annotation,
        options = ann.options,
        additionalDrawings = self.additionalDrawings;
    self.annotation.selectionMarker = [];
    infChart.util.forEach(additionalDrawings.tpSelectionMarkers, function(index , value){
            additionalDrawings.tpSelectionMarkers[index].hide();
    });

    infChart.util.forEach(additionalDrawings.slSelectionMarkers, function(index , value){
                additionalDrawings.slSelectionMarkers[index].hide();
    });
    self.additionalLevelSelected = undefined;
};

infChart.shortLineDrawing.prototype.bindSettingsEvents = function () {
    return infChart.drawingUtils.common.bindShortLongLineSettingsEvents.call(this, infChart.drawingUtils.common.baseBorderColor);
};

infChart.shortLineDrawing.prototype.getConfig = function () {
    var annotation = this.annotation;
    return {
        shape: 'shortLine',
        borderColor: infChart.themeManager.getDrawingsBorderColor(annotation.options.shape.params.stroke, 'shortLine'),
        fillColor: infChart.themeManager.getDrawingsFillColor(annotation.options.shape.params.fill, 'shortLine'),
        strokeWidth: annotation.options.shape.params['stroke-width'],
        dashStyle: annotation.options.shape.params.dashstyle,
        xValue: annotation.options.xValue,
        yValue: annotation.options.yValue,
        clickCords: annotation.options.clickCords,
        width: annotation.chart.plotWidth,
        text: annotation.options.lineText,
        takeProfit: annotation.options.takeProfit,
        stopLoss: annotation.options.stopLoss,
        isLocked : annotation.options.isLocked

    };
};

/**
 * Returns the obj of properties to copy
 * @returns {object} properties
 */
infChart.shortLineDrawing.prototype.getConfigToCopy = function () {
    var stockChartId = infChart.drawingsManager.getChartIdFromHighchartInstance(this.annotation.chart);
    var chartInstance = infChart.manager.getChart(stockChartId);
    var yAxis = chartInstance.getMainYAxis();
    var properties = this.getConfig();
    var shapeTheme = infChart.drawingUtils.common.theme.horizontalLine;
    var copyDistance = shapeTheme && shapeTheme.copyDistance ? shapeTheme.copyDistance.y : infChart.drawingUtils.common.theme.defaultCopyDistance;

    properties.yValue = yAxis.toValue(yAxis.toPixels(properties.yValue) + copyDistance);
    return properties;
};

infChart.shortLineDrawing.prototype.getPriceLineLabelFormattedValue = function (yValue) {
    var stockChart = this.stockChart;
    var value;
    if (stockChart.isPercent) {
        value = stockChart.getYLabel(yValue, true, false, false);
    } else {
        value = stockChart.formatValue(yValue, stockChart.getMainSeries().options.dp);
    }
    return value;
};

infChart.shortLineDrawing.prototype.getOptions = function (properties) {
    var self = this;
    var options = {
        utilizeAxes: "y", // since label is drawn in the yAxis
        xValue: properties.xValue,
        yValue: parseFloat(properties.yValue),
        allowDragX: false,
        shape: {
            params: {
                d: ['M', 0, 0, 'L', 0, 0],
                dashstyle: 'solid',
                stroke: '#FF4D4D',
                'class': "horizontal-line"
            }
        }
    };

    if (properties.takeProfit) {
        options.takeProfit = properties.takeProfit;
        infChart.util.forEach(options.takeProfit, function(index , value){
            value.yValue = infChart.drawingUtils.common.getBaseYValues.call(self, options.yValue + options.yValue * value.priceLineDiff)
        });
    } else {
        options.takeProfit = [];
        infChart.util.forEach(this.takeProfit, function(index , value){
            options.takeProfit.push({
                id: value.id,
                yValue: infChart.drawingUtils.common.getBaseYValues.call(self, options.yValue + options.yValue * value.priceLineDiff), //infChart.drawingUtils.common.getYValue.call(self, options.yValue + options.yValue * value.priceLineDiff),
                lineWidth: value.lineWidth,
                lineStyle: value.lineStyle,
                priceLineDiff: value.priceLineDiff,
                enable: value.enable,
                lineColor: value.lineColor
            });
        });
    }
    if (properties.stopLoss) {
        options.stopLoss = properties.stopLoss;
        infChart.util.forEach(options.stopLoss, function(index , value){
            value.yValue = infChart.drawingUtils.common.getBaseYValues.call(self, options.yValue + options.yValue * value.priceLineDiff)
        });
    } else{
        options.stopLoss = [];
        infChart.util.forEach(this.stopLoss, function(index , value){
            options.stopLoss.push({
                id: value.id,
                yValue: infChart.drawingUtils.common.getBaseYValues.call(self, options.yValue + options.yValue * value.priceLineDiff),//infChart.drawingUtils.common.getYValue.call(self, options.yValue + options.yValue * value.priceLineDiff),
                lineWidth: value.lineWidth,
                lineStyle: value.lineStyle,
                priceLineDiff: value.priceLineDiff,
                enable: value.enable,
                lineColor: value.lineColor
            });
        });
    }
    if(properties.text){
        options.lineText = properties.text;
        options.allowDragY = false;
        options.disableCopyPaste = true;
        this.disableQuickSettingPanel = true;
    }
    if (properties.width) {
        options.shape.params.d = ['M', 0, 0, 'L', properties.width * 1.5, 0];
    }
    if (properties.clickCords) {
        options.clickCords = properties.clickCords;
    }
    if (properties.fillColor) {
        options.shape.params.fill = properties.fillColor;
    }
    if (properties.borderColor) {
        options.shape.params.stroke = properties.borderColor;
    }
    if (properties.dashStyle) {
        options.shape.params.dashstyle = properties.dashStyle;
    }
    if (properties.strokeWidth) {
        options.shape.params['stroke-width'] = properties.strokeWidth;
    }
    options.isRealTimeTranslation = true; // since label value is needed to be changed

    options = infChart.Drawing.prototype.getOptions(properties,options);

    return options;
};

infChart.shortLineDrawing.prototype.getQuickSettingsPopup = function () {
    return infChart.drawingUtils.common.getPriceLineQuickSettings();
};

infChart.shortLineDrawing.prototype.getSettingsPopup = function () {
    return infChart.drawingUtils.common.getPriceLineSettings(this.annotation.options.takeProfit, this.annotation.options.stopLoss, this.annotation.options.yValue);
};

infChart.shortLineDrawing.prototype.isRequiredProperty = function (propertyId, reset) {
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

infChart.shortLineDrawing.prototype.scale = function () {
    var drawingObject = this,
        ann = this.annotation,
        chart = ann.chart,
        options = ann.options,
        line = ann.shape.d.split(' '),
        xAxis = chart.xAxis[options.xAxis],
        yAxis = chart.yAxis[options.yAxis],
        label = this.additionalDrawings['lineLabel'],
        tpPriceLines = this.additionalDrawings.tpPriceLines,
        tpPriceLineLabels = this.additionalDrawings.tpPriceLineLabels,
        tpPriceLineTagLabels = this.additionalDrawings.tpPriceLineTagLabels,
        slPriceLines = this.additionalDrawings.slPriceLines,
        slPriceLineLabels = this.additionalDrawings.slPriceLineLabels,
        slPriceLineTagLabels = this.additionalDrawings.slPriceLineTagLabels,
        tpSelectionMarkers = this.additionalDrawings.tpSelectionMarkers,
        slSelectionMarkers = this.additionalDrawings.slSelectionMarkers,
        stockChart = this.stockChart;

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

    drawingObject.additionalDrawings.mainTypeLabel.attr({
        x: chart.plotLeft - firstCandle,
        y: - drawingObject.additionalDrawings.mainTypeLabel.getBBox().height/2,// xAxis.width - firstCandle,
        zIndex: 20,
        'type': "mainDrawing"
    });

    label.attr({
        text: stockChart.formatValue(parseFloat(infChart.drawingUtils.common.getBaseYValues.call(drawingObject, options.yValue)).toFixed(3), stockChart.getMainSeries().options.dp),
        x: chart.plotLeft - firstCandle + drawingObject.additionalDrawings.mainTypeLabel.getBBox().width,
        zIndex: 20,
        'type': "mainDrawing"
    });

    $.each(tpPriceLines, function (id, priceLine) {

        var level = options.takeProfit.find(function(takeProfit) {
            return takeProfit.id == id
        });
        var newY = yAxis.toPixels(infChart.drawingUtils.common.getYValue.call(drawingObject, level.yValue)) - yAxis.toPixels(options.yValue);
        var newX = -drawingObject.correctionFactor;
        priceLine.attr({
            d: ['M', newX, newY, 'L', xAxis.width - firstCandle, newY]
        }); 
    });

    $.each(tpSelectionMarkers, function(id, selectionMarker){
        var level = options.takeProfit.find(function(takeProfit) {
            return takeProfit.id == id
        });
        var newY = yAxis.toPixels(infChart.drawingUtils.common.getYValue.call(drawingObject, level.yValue)) - yAxis.toPixels(options.yValue);
        var newX = (xAxis.width) * 3/4 - xAxis.toPixels(options.xValue);
        selectionMarker.attr({
            'cx': newX,
            'cy': newY
        });
    });

    $.each(tpPriceLineTagLabels, function (id, priceLineTagLabel) {

        var level = options.takeProfit.find(function(takeProfit) {
            return takeProfit.id == id
        });
        var newY = yAxis.toPixels(infChart.drawingUtils.common.getYValue.call(drawingObject, level.yValue)) - yAxis.toPixels(options.yValue);
        priceLineTagLabel.attr({
            text: infChart.manager.getLabel("label." + level.id + ""),
            x: chart.plotLeft - firstCandle,
            y: newY - priceLineTagLabel.height/2,
            zIndex: 20,
            'type': "additionalDrawing",
            'level': level.id
        });
    });

    var tagLabelWidth = Object.values(tpPriceLineTagLabels)[0].width;


    $.each(tpPriceLineLabels, function (id, priceLineLabel) {

        var level = options.takeProfit.find(function(takeProfit) {
            return takeProfit.id == id
        });
        var newY = yAxis.toPixels(infChart.drawingUtils.common.getYValue.call(drawingObject, level.yValue)) - yAxis.toPixels(options.yValue);
        priceLineLabel.attr({
            text: stockChart.formatValue((parseFloat(level.yValue)).toFixed(3), stockChart.getMainSeries().options.dp),
            x: (chart.plotLeft - firstCandle) + tagLabelWidth,
            y: newY - priceLineLabel.height/2,
            zIndex: 20,
            'type': "additionalDrawing",
            'level': level.id
        });
    });

    $.each(slPriceLines, function (id, priceLine) {
        
        var level = options.stopLoss.find(function(stopLoss) {
            return stopLoss.id == id
        });
        var newY = yAxis.toPixels(infChart.drawingUtils.common.getYValue.call(drawingObject, level.yValue)) - yAxis.toPixels(options.yValue);
        var newX = -drawingObject.correctionFactor;
        priceLine.attr({
            d: ['M', newX, newY, 'L', xAxis.width - firstCandle, newY]
        }); 
    });

    $.each(slSelectionMarkers, function(id, selectionMarker){
        var level = options.stopLoss.find(function(stopLoss) {
            return stopLoss.id == id
        });
        var newY = yAxis.toPixels(infChart.drawingUtils.common.getYValue.call(drawingObject, level.yValue)) - yAxis.toPixels(options.yValue);
        var newX = (xAxis.width) * 3/4 - xAxis.toPixels(options.xValue);
        selectionMarker.attr({
            'cx': newX,
            'cy': newY
        });
    });

    $.each(slPriceLineTagLabels, function (id, priceLineTagLabel) {

        var level = options.stopLoss.find(function(stopLoss) {
            return stopLoss.id == id
        });
        var newY = yAxis.toPixels(infChart.drawingUtils.common.getYValue.call(drawingObject, level.yValue)) - yAxis.toPixels(options.yValue);
        priceLineTagLabel.attr({
            text: infChart.manager.getLabel("label." + level.id + ""),
            x: chart.plotLeft - firstCandle,
            y: newY - priceLineTagLabel.height/2,
            zIndex: 20,
            'type': "additionalDrawing",
            'level': level.id
        });
    });

    var tagLabelWidth = Object.values(slPriceLineTagLabels)[0].width;

    $.each(slPriceLineLabels, function (id, priceLineLabel) {

        var level = options.stopLoss.find(function(stopLoss) {
            return stopLoss.id == id
        });

        var newY = yAxis.toPixels(infChart.drawingUtils.common.getYValue.call(drawingObject, level.yValue)) - yAxis.toPixels(options.yValue);
        priceLineLabel.attr({
            text: stockChart.formatValue((parseFloat(level.yValue)).toFixed(3), stockChart.getMainSeries().options.dp),
            x: (chart.plotLeft - firstCandle) + tagLabelWidth,
            y: newY - priceLineLabel.height/2,
            zIndex: 20,
            'type': "additionalDrawing",
            'level': level.id
        });
    });

    if(!drawingObject.additionalLevelSelected){
        if(ann.selectionMarker[0]){
            var newX = (xAxis.width) * 3/4 - xAxis.toPixels(options.xValue);
            ann.selectionMarker[0].attr({
                'cx': newX
            });
        }
    }

    infChart.drawingUtils.common.getAxisLabelToFront.call(this, label);
    infChart.drawingUtils.common.removeDragSupporters.call(this, this.dragSupporters);
    var customAttributes = {
        'type': "mainDrawing",
        'stroke-width': 10
    } 
    infChart.drawingUtils.common.addDragSupporters.call(this, ann, chart, ["M", 0, 0, 'L', line[4], line[5]], this.dragSupporters, customAttributes);

    $.each(tpPriceLines, function (key, value) {
        if(value.visibility !== 'hidden'){
            var line = value.d.split(' ');
            var customAttributes = {
                'level' : key,
                'type': "additionalDrawing",
                'stroke-width': 10
            }            
            var dragSupporterStyles = Object.assign({}, infChart.drawingUtils.common.dragSupporterStyles, {cursor: 'pointer', 'z-index': 20});
            infChart.drawingUtils.common.addDragSupporters.call(drawingObject, ann, chart, ['M', line[1], line[2], 'L', line[4], line[5]], drawingObject.dragSupporters, customAttributes, dragSupporterStyles);
        }
    });

    $.each(slPriceLines, function (key, value) {
        if(value.visibility !== 'hidden'){
            var line = value.d.split(' ');
            var customAttributes = {
                'level' : key,
                'type': "additionalDrawing",
                'stroke-width': 10
            }            
            var dragSupporterStyles = Object.assign({}, infChart.drawingUtils.common.dragSupporterStyles, {cursor: 'pointer', 'z-index': 20});
            infChart.drawingUtils.common.addDragSupporters.call(drawingObject, ann, chart, ['M', line[1], line[2], 'L', line[4], line[5]], drawingObject.dragSupporters, customAttributes, dragSupporterStyles);
        }
    });

};

infChart.shortLineDrawing.prototype.selectAndBindResize = function () {
    var ann = this.annotation,
        options = ann.options,
        chart = ann.chart,
        xAxis = chart.xAxis[options.xAxis];
    if (!ann.selectionMarker) {
        ann.selectionMarker = [];
        infChart.drawingUtils.common.addSelectionMarker.call(this, ann, (xAxis.width)*3/4 - xAxis.toPixels(options.xValue), 0);
    }
};

infChart.shortLineDrawing.prototype.step = function () { };

infChart.shortLineDrawing.prototype.stop = function (e) {
    var drawingObject = this,
        ann = this.annotation,
        options = ann.options,
        chart = ann.chart,
        x = e.chartX,
        y = e.chartY,
        plotWidth = chart.plotWidth * 1.5,
        xAxis = chart.xAxis[options.xAxis],
        yAxis = chart.yAxis[options.yAxis],
        label = this.additionalDrawings['lineLabel'],
        tpPriceLines = this.additionalDrawings.tpPriceLines,
        tpPriceLineLabels = this.additionalDrawings.tpPriceLineLabels,
        tpPriceLineTagLabels = this.additionalDrawings.tpPriceLineTagLabels,
        slPriceLines = this.additionalDrawings.slPriceLines,
        slPriceLineLabels = this.additionalDrawings.slPriceLineLabels,
        slPriceLineTagLabels = this.additionalDrawings.slPriceLineTagLabels,
        tpSelectionMarkers = this.additionalDrawings.tpSelectionMarkers,
        slSelectionMarkers = this.additionalDrawings.slSelectionMarkers,
        stockChart = this.stockChart,
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

    drawingObject.additionalDrawings.mainTypeLabel.attr({
        x: chart.plotLeft - firstCandle,
        y: - drawingObject.additionalDrawings.mainTypeLabel.getBBox().height/2,// xAxis.width - firstCandle,
        zIndex: 20,
        'type': "mainDrawing"
    });

    label.attr({
        text: stockChart.formatValue(parseFloat(infChart.drawingUtils.common.getBaseYValues.call(drawingObject, options.yValue)).toFixed(3), stockChart.getMainSeries().options.dp),
        x: chart.plotLeft - firstCandle + drawingObject.additionalDrawings.mainTypeLabel.getBBox().width,
        zIndex: 20,
        'type': "mainDrawing"
    });


    $.each(tpPriceLines, function (id, priceLine) {

        var level = options.takeProfit.find(function(takeProfit) {
            return takeProfit.id == id
        });
        var newY = yAxis.toPixels(infChart.drawingUtils.common.getYValue.call(drawingObject, level.yValue)) - yAxis.toPixels(options.yValue);
        var newX = -drawingObject.correctionFactor;
        priceLine.attr({
            d: ['M', newX, newY, 'L', xAxis.width - firstCandle, newY]
        }); 
    });

    $.each(tpSelectionMarkers, function(id, selectionMarker){
        var level = options.takeProfit.find(function(takeProfit) {
            return takeProfit.id == id
        });
        var newX = (xAxis.width) * 3/4 - xAxis.toPixels(options.xValue);
        var newY = yAxis.toPixels(infChart.drawingUtils.common.getYValue.call(drawingObject, level.yValue)) - yAxis.toPixels(options.yValue);
        selectionMarker.attr({
            'cx': newX,
            'cy': newY
        });
    });

    $.each(tpPriceLineTagLabels, function (id, priceLineTagLabel) {

        var level = options.takeProfit.find(function(takeProfit) {         
            return takeProfit.id == id
        });
        var newY = yAxis.toPixels(infChart.drawingUtils.common.getYValue.call(drawingObject, level.yValue)) - yAxis.toPixels(options.yValue);
        priceLineTagLabel.attr({
            text: infChart.manager.getLabel("label." + level.id + "") ,
            x: chart.plotLeft - firstCandle,
            y: newY - priceLineTagLabel.height/2,
            zIndex:20,
            'type': "additionalDrawing",
            'level': level.id
        });
    });

    var tagLabelWidth = Object.values(tpPriceLineTagLabels)[0].width;

    $.each(tpPriceLineLabels, function (id, priceLineLabel) {

        var level = options.takeProfit.find(function(takeProfit) {
            return takeProfit.id == id
        });
        var newY = yAxis.toPixels(infChart.drawingUtils.common.getYValue.call(drawingObject, level.yValue)) - yAxis.toPixels(options.yValue);
        priceLineLabel.attr({
            text: stockChart.formatValue((parseFloat(level.yValue)).toFixed(3), stockChart.getMainSeries().options.dp),
            x: (chart.plotLeft - firstCandle) + tagLabelWidth,
            y: newY - priceLineLabel.height/2,
            zIndex: 20,
            'type': "additionalDrawing",
            'level': level.id
        });
    });

    $.each(slPriceLines, function (id, priceLine) {
        
        var level = options.stopLoss.find(function(stopLoss) {
            return stopLoss.id == id
        });
        var newY = yAxis.toPixels(infChart.drawingUtils.common.getYValue.call(drawingObject, level.yValue)) - yAxis.toPixels(options.yValue);
        var newX = -drawingObject.correctionFactor;
        priceLine.attr({
            d: ['M', newX, newY, 'L', xAxis.width - firstCandle, newY]
        }); 
    });

    $.each(slSelectionMarkers, function(id, selectionMarker){
        var level = options.stopLoss.find(function(stopLoss) {
            return stopLoss.id == id
        });
        var newY = yAxis.toPixels(infChart.drawingUtils.common.getYValue.call(drawingObject, level.yValue)) - yAxis.toPixels(options.yValue);
        var newX = (xAxis.width) * 3/4 - xAxis.toPixels(options.xValue);
        selectionMarker.attr({
            'cx': newX,
            'cy': newY
        });
    });

    $.each(slPriceLineTagLabels, function (id, priceLineTagLabel) {

        var level = options.stopLoss.find(function(stopLoss) {
            return stopLoss.id == id
        });
        var newY = yAxis.toPixels(infChart.drawingUtils.common.getYValue.call(drawingObject, level.yValue)) - yAxis.toPixels(options.yValue);
        priceLineTagLabel.attr({
            text: infChart.manager.getLabel("label." + level.id + ""),
            x: chart.plotLeft - firstCandle,
            y: newY - priceLineTagLabel.height/2,
            zIndex: 20,
            'type': "additionalDrawing",
            'level': level.id
        });
    });

    var tagLabelWidth = Object.values(slPriceLineTagLabels)[0].width;

    $.each(slPriceLineLabels, function (id, priceLineLabel) {

        var level = options.stopLoss.find(function(stopLoss) {
            return stopLoss.id == id
        });

        var newY = yAxis.toPixels(infChart.drawingUtils.common.getYValue.call(drawingObject, level.yValue)) - yAxis.toPixels(options.yValue);
        priceLineLabel.attr({
            text: stockChart.formatValue((parseFloat(level.yValue)).toFixed(3), stockChart.getMainSeries().options.dp),
            x: (chart.plotLeft - firstCandle) + tagLabelWidth,
            y: newY - priceLineLabel.height/2,
            zIndex: 20,
            'type': "additionalDrawing",
            'level': level.id
        });
    });

    ann.group.addClass("line-drawing");

    infChart.drawingUtils.common.saveBaseYValues.call(this, ann.options.yValue);
    infChart.drawingUtils.common.removeDragSupporters.call(this, this.dragSupporters);
    var customAttributes = {
        'type': "mainDrawing",
        'stroke-width': 10
    } 
    infChart.drawingUtils.common.addDragSupporters.call(this, ann, chart, ["M", 0, 0, 'L', line[4], line[5]], this.dragSupporters, customAttributes);

    $.each(tpPriceLines, function (key, value) {
        if(value.visibility !== 'hidden'){
            var line = value.d.split(' ');
            var customAttributes = {
                'level': key,
                'type': "additionalDrawing",
                'stroke-width': 10
            }            
            var dragSupporterStyles = Object.assign({}, infChart.drawingUtils.common.dragSupporterStyles, {cursor: 'pointer', 'z-index': 20});
            infChart.drawingUtils.common.addDragSupporters.call(drawingObject, ann, chart, ['M', line[1], line[2], 'L', line[4], line[5]], drawingObject.dragSupporters, customAttributes, dragSupporterStyles);
        }
    });

    $.each(slPriceLines, function (key, value) {
        if(value.visibility !== 'hidden'){
            var line = value.d.split(' ');
            var customAttributes = {
                'level' : key,
                'type': "additionalDrawing",
                'stroke-width': 10
            }            
            var dragSupporterStyles = Object.assign({}, infChart.drawingUtils.common.dragSupporterStyles, {cursor: 'pointer', 'z-index': 20});
            infChart.drawingUtils.common.addDragSupporters.call(drawingObject, ann, chart, ['M', line[1], line[2], 'L', line[4], line[5]], drawingObject.dragSupporters, customAttributes, dragSupporterStyles);
        }
    });

    if(ann.selectionMarker[0]){
        var newX = (xAxis.width) * 3/4 - xAxis.toPixels(options.xValue);
        ann.selectionMarker[0].attr({
            'cx': newX
        });
    }
    infChart.drawingUtils.common.onPropertyChange.call(this);
    if(infChart.drawingsManager.getIsActiveDrawingInprogress()){
        drawingObject.initialSettingPanelLoad = true;
    }
    return line;
};

infChart.shortLineDrawing.prototype.openSettingPanel = function () {
    var drawingObj = this;
    if (drawingObj.isQuickSetting) {
        infChart.drawingUtils.common.toggleSettings.call(drawingObj);
    }
};

infChart.shortLineDrawing.prototype.translate = function (event) {
    var self = this,
        ann = self.annotation,
        options = ann.options,
        chart = ann.chart,
        line = ann.shape.d.split(' '),
        xAxis = chart.xAxis[options.xAxis],
        yAxis = chart.yAxis[options.yAxis],
        tpPriceLines = this.additionalDrawings.tpPriceLines,
        slPriceLines = this.additionalDrawings.slPriceLines;

    if (options.selectedDrawing == "mainDrawing" || options.selectedDrawing == undefined) {
        infChart.util.forEach(options.takeProfit, function(index , value){
            if(!value.enable){
                value.yValue = infChart.drawingUtils.common.getBaseYValues.call(self, options.yValue) + infChart.drawingUtils.common.getBaseYValues.call(self, options.yValue) * value.priceLineDiff;
            }
        });
        infChart.util.forEach(options.stopLoss, function(index , value){
            if(!value.enable){
                value.yValue = infChart.drawingUtils.common.getBaseYValues.call(self, options.yValue) + infChart.drawingUtils.common.getBaseYValues.call(self, options.yValue) * value.priceLineDiff;
            }
        });
        this.scale();
    }
    if (options.selectedDrawing == 'tp1'||options.selectedDrawing == 'tp2'||options.selectedDrawing == 'tp3'|| options.selectedDrawing == 'sl1'||options.selectedDrawing == 'sl2'||options.selectedDrawing == 'sl3') {

        var yValue = yAxis.toValue(event.chartY);

        ann.update({
            yValue: options.yValueStore
        });

        self.updateAdditionalDrawing(options.selectedDrawing, yValue);
    }

    infChart.drawingUtils.common.removeDragSupporters.call(self, self.dragSupporters);
    var customAttributes = {
        'type': "mainDrawing",
        'stroke-width': 10
    } 
    infChart.drawingUtils.common.addDragSupporters.call(self, ann, chart, ["M", line[1], line[2], 'L', line[4], line[5]], self.dragSupporters, customAttributes);

    $.each(tpPriceLines, function (key, value) {
        if(value.visibility !== 'hidden'){
            var line = value.d.split(' ');
            var customAttributes = {
                'level' : key,
                'type': "additionalDrawing",
                'stroke-width': 10
            }            
            var dragSupporterStyles = Object.assign({}, infChart.drawingUtils.common.dragSupporterStyles, {cursor: 'pointer', 'z-index': 20});
            infChart.drawingUtils.common.addDragSupporters.call(self, ann, chart, ['M', line[1], line[2], 'L', line[4], line[5]], self.dragSupporters, customAttributes, dragSupporterStyles);
        }
    });

    $.each(slPriceLines, function (key, value) {
        if(value.visibility !== 'hidden'){
            var line = value.d.split(' ');
            var customAttributes = {
                'level' : key,
                'type': "additionalDrawing",
                'stroke-width': 10
            }            
            var dragSupporterStyles = Object.assign({}, infChart.drawingUtils.common.dragSupporterStyles, {cursor: 'pointer', 'z-index': 20});
            infChart.drawingUtils.common.addDragSupporters.call(self, ann, chart, ['M', line[1], line[2], 'L', line[4], line[5]], self.dragSupporters, customAttributes, dragSupporterStyles);
        }
    });
};

infChart.shortLineDrawing.prototype.updateAdditionalDrawing = function(selectedDrawing, yValue){
    var self = this,
        ann = self.annotation,
        options = ann.options
        chart = ann.chart,
        stockChart = this.stockChart,
        xAxis = chart.xAxis[options.xAxis],
        yAxis = chart.yAxis[options.yAxis];
        if(selectedDrawing == 'tp1' || selectedDrawing == 'tp2' || selectedDrawing == 'tp3'){
            level = options.takeProfit.find( function(level) {
                if(level.id == selectedDrawing){
                    level.yValue = infChart.drawingUtils.common.getBaseYValues.call(self, yValue);//yValue;
                    return level;
                }
            });
        }
        if(selectedDrawing == 'sl1' || selectedDrawing == 'sl2' || selectedDrawing == 'sl3'){
            level = options.stopLoss.find( function(level) {
                if(level.id == selectedDrawing){
                    level.yValue = infChart.drawingUtils.common.getBaseYValues.call(self, yValue);
                    return level;
                }
            });
        }
        if(level.id == 'tp1' || level.id == 'tp2' || level.id == 'tp3'){
            var priceline = self.additionalDrawings.tpPriceLines[level.id];
            var lineLabel = self.additionalDrawings.tpPriceLineLabels[level.id];
            var lineTagLabel = self.additionalDrawings.tpPriceLineTagLabels[level.id];
            var selectionMarker = this.additionalDrawings.tpSelectionMarkers[level.id];
        }
        if(level.id == 'sl1' || level.id == 'sl2' || level.id == 'sl3'){
            var priceline = self.additionalDrawings.slPriceLines[level.id];
            var lineLabel = self.additionalDrawings.slPriceLineLabels[level.id];
            var lineTagLabel = self.additionalDrawings.slPriceLineTagLabels[level.id];
            var selectionMarker = this.additionalDrawings.slSelectionMarkers[level.id];
        }
    
        var line = priceline.d.split(' ');
        var newY = yAxis.toPixels(yValue) - yAxis.toPixels(options.yValue);
        priceline.attr({
            d: ['M', line[1], newY, 'L', line[4], newY]
        }); 
        lineLabel.attr({
            text: stockChart.formatValue((parseFloat(level.yValue)).toFixed(3), stockChart.getMainSeries().options.dp),
            y: newY - lineTagLabel.height/2,
        });
        lineTagLabel.attr({
            y: newY - lineTagLabel.height/2,
        }); 
        selectionMarker.attr({
            'cy': newY
        });
};

infChart.shortLineDrawing.prototype.translateEnd = function () {
    var self = this,
        ann = self.annotation
        options = ann.options;
    self.scale();
    self.annotation.options.selectedDrawing = undefined;
    infChart.drawingUtils.common.saveBaseYValues.call(self, options.yValue, options.yValueEnd);
    infChart.drawingUtils.common.onPropertyChange.call(this);
};

infChart.shortLineDrawing.prototype.updateSettings = function (properties) {
    var self = this,
        ann = self.annotation,
        options = ann. options;
        // var takeProfitValues = [];
        // infChart.util.forEach(properties.takeProfit, function(index , value){
        //     takeProfitValues.push({
        //         id: value.id,
        //         yValue: infChart.drawingUtils.common.getYValue.call(self, value.yValue),
        //         lineWidth: value.lineWidth,
        //         lineStyle: value.lineStyle,
        //         enable: value.enable
        //     });
        // });

        // var stopLossValues = [];
        // infChart.util.forEach(properties.stopLoss, function(index , value){
        //     stopLossValues.push({
        //         id: value.id,
        //         yValue: infChart.drawingUtils.common.getYValue.call(self, value.yValue),
        //         lineWidth: value.lineWidth,
        //         lineStyle: value.lineStyle,
        //         enable: value.enable
        //     });
        // });
    infChart.structureManager.drawingTools.updatePriceLineSettings(this.settingsPopup, properties.takeProfit, properties.stopLoss, infChart.drawingUtils.common.getBaseYValues.call(self, properties.yValue));
};

infChart.shortLineDrawing.prototype.select = function (event) {
    var self = this,
        ann = self.annotation,
        options = ann.options;

    if (event && event.target) {
        var drawingtype = event.target.getAttribute('type');
        if (drawingtype && drawingtype == "additionalDrawing") {
            var level = event.target.getAttribute('level');
            if(level){
                options.selectedDrawing = level;
            }
        } else if(drawingtype && drawingtype == "mainDrawing") {
            options.selectedDrawing = "mainDrawing"; 
        }else{
            var type = event.target.parentElement.getAttribute('type');
            if(type == "additionalDrawing"){
                var level = event.target.parentElement.getAttribute('level'); 
                if(level){
                    options.selectedDrawing = level;
                }
            }else if (type == "mainDrawing"){
                options.selectedDrawing = "mainDrawing";
            }else{
                var type = event.target.parentElement.parentElement.getAttribute('type');
                if(type == "additionalDrawing"){
                    var level = event.target.parentElement.parentElement.getAttribute('level'); 
                    if(level){
                        options.selectedDrawing = level;
                    }
                }else{
                    options.selectedDrawing = undefined;
                }
            }
        }
    }
    if(options.selectedDrawing){
        self.showSelectionMarker(options.selectedDrawing);
        self.getLineToFront(options.selectedDrawing);
        infChart.drawingsManager.deselectDrawingTools(self.stockChart.id ,self.drawingId);
    }
};

infChart.shortLineDrawing.prototype.showSelectionMarker = function(level){
    var self = this,
        ann = self.annotation,
        options = ann.options,
        chart = ann.chart,
        xAxis = chart.xAxis[options.xAxis],
        additionalDrawings = self.additionalDrawings;

    if (level == "tp1" || level == "tp2" || level == "tp3") {
        var newX = (xAxis.width) * 3/4 - xAxis.toPixels(options.xValue);
        additionalDrawings.tpSelectionMarkers[level].attr({
            'cx': newX
        });
        additionalDrawings.tpSelectionMarkers[level].show();
        self.additionalLevelSelected = true;
        if(ann.selectionMarker[0]){
            ann.selectionMarker[0].hide();
        }
    } else if (level == "sl1" || level == "sl2" || level == "sl3") {
        var newX = (xAxis.width) * 3/4 - xAxis.toPixels(options.xValue);
        additionalDrawings.slSelectionMarkers[level].attr({
            'cx': newX
        });
        additionalDrawings.slSelectionMarkers[level].show();
        self.additionalLevelSelected = true;
        if(ann.selectionMarker[0]){
            ann.selectionMarker[0].hide();
        }
    } else {
        self.additionalLevelSelected = false;
        if(ann.selectionMarker[0]){
            ann.selectionMarker[0].show();
        }
    }

    infChart.util.forEach(additionalDrawings.tpSelectionMarkers, function(index , value){
        if(level && level != index){
            if(additionalDrawings.tpSelectionMarkers[index]){
                additionalDrawings.tpSelectionMarkers[index].hide();
            }
        }
    });

    infChart.util.forEach(additionalDrawings.slSelectionMarkers, function(index , value){
        if(level && level != index){
            if(additionalDrawings.slSelectionMarkers[index]){
                additionalDrawings.slSelectionMarkers[index].hide();
            }
        }
    });
};

infChart.shortLineDrawing.prototype.getLineToFront = function(level){
    var self = this,
        ann = self.annotation,
        options = ann.options,
        additionalDrawings = self.additionalDrawings,
        chart = ann.chart,
        xAxis = chart.xAxis[options.xAxis];

    if (level == "tp1" || level == "tp2" || level == "tp3") {
        additionalDrawings.tpPriceLines[level].toFront();
        additionalDrawings.tpPriceLineTagLabels[level].toFront();
        additionalDrawings.tpPriceLineLabels[level].toFront();
        additionalDrawings.tpSelectionMarkers[level].toFront();
    } else if (level == "sl1" || level == "sl2" || level == "sl3") {
        additionalDrawings.slPriceLines[level].toFront();
        additionalDrawings.slPriceLineTagLabels[level].toFront();
        additionalDrawings.slPriceLineLabels[level].toFront();
        additionalDrawings.slSelectionMarkers[level].toFront();
    } else {
        ann.shape.toFront(); 
        if(ann.selectionMarker[0]){
            ann.selectionMarker[0].toFront();
        }else{
            ann.selectionMarker = [];
            infChart.drawingUtils.common.addSelectionMarker.call(this, ann, (xAxis.width)*3/4 - xAxis.toPixels(options.xValue), 0);
            ann.selectionMarker[0].toFront();
        }
        additionalDrawings.lineLabel.toFront();
        additionalDrawings.mainTypeLabel.toFront();
    }
};

// infChart.shortLineDrawing.prototype.select = function () {
//     infChart.drawingUtils.common.getAxisLabelToFront.call(this, this.additionalDrawings['lineLabel']);
// };

infChart.shortLineDrawing.prototype.updateOptions = function (options) {
    var ann = this.annotation;
    if (options.stopLoss) {
        ann.options.stopLoss = options.stopLoss;
    }
    if (options.takeProfit) {
        ann.options.takeProfit = options.takeProfit;
    }
    this.updateSettings(this.getConfig());
};

infChart.shortLineDrawing.prototype.isVisibleLastLevel = function(){
    return false;
};

