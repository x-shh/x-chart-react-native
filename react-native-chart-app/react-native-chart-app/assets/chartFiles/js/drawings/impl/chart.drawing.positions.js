window.infChart = window.infChart || {};

infChart.positionsDrawing = function () {
    infChart.drawingObject.apply(this, arguments);
    this.priceDifferenceFactor = 0.01;
    this.defaultCandleCount = 10;
    this.defaultStyles = {
        isCompactStats: false,
        lineColor: '#959595',
        lineWidth: 1,
        lineOpacity: 1,
        stopLossColor: '#F54649',
        stopLossFillOpacity: 0.25,
        takeProfitColor: '#009D90',
        takeProfitFillOpacity: 0.25,
        textColor: '#ffffff',
        textOpacity: 1,
        textFontSize:'16'
    };
    this.settings = {
        accountSize: 1000,
        lotSize: 1,
        entryPrice: null,
        risk: {
            percentage: 25,
            size: null,
            selectedItem: "percentage"
        },
        stopLoss: {
            tickSize: null,
            price: null
        },
        takeProfit: {
            tickSize: null,
            price: null
        },
        pAndL: {
            projectionPrice: null,
            lineStartPrice: null,
            lineStartDate: null,
            lineEndPrice: null,
            lineEndDate: null
        }
    };
    this.additionalDrawingItems = ["takeProfit", "stopLoss", "pAndL"];
};

infChart.positionsDrawing.prototype = Object.create(infChart.drawingObject.prototype);

infChart.positionsDrawing.prototype.getConfig = function () {
    var annotation = this.annotation;
    return {
        shape: this.shape,
        xValue: annotation.options.xValue,
        yValue: annotation.options.yValue,
        xValueEnd: annotation.options.xValueEnd,
        isLongPositions: annotation.options.isLongPositions,
        settings: annotation.options.settings,
        styles: annotation.options.styles,
        isLocked : annotation.options.isLocked

    };
};

infChart.positionsDrawing.prototype.getOptions = function (properties, chart) {
    var nearestDataPointForXValue = infChart.math.findNearestDataPoint(chart, properties.xValue, undefined, true, true);
    var theme = infChart.drawingUtils.common.getTheme.call(this);
    var shapeTheme = theme[this.shape];
    var lineColor = properties.styles ? properties.styles.lineColor : (shapeTheme && shapeTheme.lineColor) ? shapeTheme.lineColor : this.defaultStyles.lineColor;
    var lineWidth = properties.styles ? properties.styles.lineWidth : (shapeTheme && shapeTheme.lineWidth) ? shapeTheme.lineWidth : this.defaultStyles.lineWidth;
    var lineOpacity = properties.styles ? properties.styles.lineOpacity : (shapeTheme && shapeTheme.lineOpacity) ? shapeTheme.lineOpacity : this.defaultStyles.lineOpacity;
    var stopLossColor = properties.styles ? properties.styles.stopLossColor : (shapeTheme && shapeTheme.stopLossColor) ? shapeTheme.stopLossColor : this.defaultStyles.stopLossColor;
    var stopLossFillOpacity = properties.styles ? properties.styles.stopLossFillOpacity : (shapeTheme && shapeTheme.stopLossFillOpacity) ? shapeTheme.stopLossFillOpacity : this.defaultStyles.stopLossFillOpacity;
    var takeProfitColor = properties.styles ? properties.styles.takeProfitColor : (shapeTheme && shapeTheme.takeProfitColor) ? shapeTheme.takeProfitColor : this.defaultStyles.takeProfitColor;
    var takeProfitFillOpacity = properties.styles ? properties.styles.takeProfitFillOpacity : (shapeTheme && shapeTheme.takeProfitFillOpacity) ? shapeTheme.takeProfitFillOpacity : this.defaultStyles.takeProfitFillOpacity;
    var textColor = properties.styles ? properties.styles.textColor : (shapeTheme && shapeTheme.textColor) ? shapeTheme.textColor : this.defaultStyles.textColor;
    var textOpacity = properties.styles ? properties.styles.textOpacity : (shapeTheme && shapeTheme.textOpacity) ? shapeTheme.textOpacity : this.defaultStyles.textOpacity;
    var isCompactStats = properties.styles ? properties.styles.isCompactStats : this.defaultStyles.isCompactStats;
    var textFontSize =  properties.styles ? properties.styles.textFontSize : '16' ;
    var options = {
        isLongPositions: this.shape === 'longPositions',
        xValue: properties.xValue,
        yValue: properties.yValue,
        nearestXDataPoint: nearestDataPointForXValue.xData,
        startDataPointIndex: nearestDataPointForXValue.dataIndex,
        settings: properties.settings? properties.settings : this.settings,
        styles: {
            isCompactStats: isCompactStats,
            lineColor: lineColor,
            lineWidth: lineWidth,
            lineOpacity: lineOpacity,
            stopLossColor: stopLossColor,
            stopLossFillOpacity: stopLossFillOpacity,
            takeProfitColor: takeProfitColor,
            takeProfitFillOpacity: takeProfitFillOpacity,
            textColor: textColor,
            textOpacity: textOpacity,
            textFontSize: textFontSize
        },
        shape: {
            params: {
                d: ['M', 0, 0, 'L', 0, 0],
                dashstyle: 'solid',
                stroke: lineColor,
                'stroke-width': lineWidth,
                opacity: lineOpacity
            }
        }
    };

    if (properties.xValueEnd) {
        options.xValueEnd = properties.xValueEnd;

        var nearestDataPointForXValueEnd = infChart.math.findNearestDataPoint(chart, properties.xValueEnd, undefined, true, true);
        options.endDataPointIndex = nearestDataPointForXValueEnd.dataIndex;
    } else {
        var seriesXData = chart.series[0].xData;
        options.endDataPointIndex = options.startDataPointIndex + this.defaultCandleCount;

        if (seriesXData.length > options.endDataPointIndex) {
            options.xValueEnd = seriesXData[options.endDataPointIndex];
        } else {
            options.xValueEnd = infChart.math.getFutureXValueForGivenIndex(chart, options.endDataPointIndex);
        }
    }

    if (properties.settings) {
        options.settings = properties.settings;
    } else {
        var entryPrice = properties.yValue;
        var yAxis = chart.yAxis[0],
            yAxisExtremes = yAxis.getExtremes(),
            priceFactor = (yAxisExtremes.max - yAxisExtremes.min) / 4;
        options.settings.takeProfit.price = options.isLongPositions ? entryPrice + priceFactor : entryPrice - priceFactor;
        options.settings.stopLoss.price = options.isLongPositions ? entryPrice - priceFactor : entryPrice + priceFactor;
        this.entryPriceChangeCalculation(entryPrice, options);
    }

    options.isRealTimeTranslation = true;
    options.validateTranslationFn = this.validateTranslation;

    options = infChart.Drawing.prototype.getOptions(properties,options);

    return options;
};

infChart.positionsDrawing.prototype.validateTranslation = function (newXValue) {
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

infChart.positionsDrawing.prototype.additionalDrawingsFunction = function () {
    var self = this,
        ann = self.annotation,
        options = ann.options,
        styles = options.styles,
        chart = ann.chart,
        additionalDrawings = self.additionalDrawings,
        additionalDrawingItems = self.additionalDrawingItems;

    for (var i = 0; i < additionalDrawingItems.length; i++) {
        var color = additionalDrawingItems[i] === 'takeProfit' ? styles.takeProfitColor : styles.stopLossColor;
        var fillOpacity = additionalDrawingItems[i] === 'takeProfit' ? styles.takeProfitFillOpacity : styles.stopLossFillOpacity;
        var textFillColor = additionalDrawingItems[i] === 'takeProfit' ? styles.takeProfitColor : additionalDrawingItems[i] === 'stopLoss' ? styles.stopLossColor : options.isLongPositions ? styles.stopLossColor : styles.takeProfitColor

        additionalDrawings[additionalDrawingItems[i]] = {
            line: chart.renderer.path(['M', 0, 0, 'L', 0, 0]).attr({
                'stroke-width': styles.lineWidth,
                stroke: color,
                opacity: fillOpacity,
                'z-index': 2,
                cursor: 'move'
            }).add(ann.group),
            fill: chart.renderer.path(['M', 0, 0, 'L', 0, 0, 'L', 0, 0, 'L', 0, 0]).attr({
                'stroke-width': 0,
                fill: color,
                'fill-opacity': fillOpacity,
                stroke: ann.options.shape.params.stroke,
                'z-index': 2,
                cursor: 'move'
            }).add(ann.group),
            label: chart.renderer.label("", 0, 0).css({
                'color': styles.textColor,
                fontSize: styles.textFontSize || '16px'
            }).attr({
                stroke: textFillColor,
                opacity: styles.textOpacity,
                'stroke-width': 0,
                padding: 4,
                r: 0,
                fill: textFillColor
            }).add(ann.group)
        };
    }
};

/**
 * Returns the obj of properties to copy
 * @returns {object} properties
 */
infChart.positionsDrawing.prototype.getConfigToCopy = function () {
    var stockChartId = infChart.drawingsManager.getChartIdFromHighchartInstance(this.annotation.chart);
    var chartInstance = infChart.manager.getChart(stockChartId);
    var xAxis = chartInstance.getMainXAxis();
    var yAxis = chartInstance.getMainYAxis();
    var properties = this.getConfig();
    var shapeTheme = infChart.drawingUtils.common.theme[this.shape];
    var copyDistance = shapeTheme && shapeTheme.copyDistance;
    var defaultCopyDistance = infChart.drawingUtils.common.theme.defaultCopyDistance;
    var copyDistanceX = (copyDistance && (copyDistance.x || copyDistance.x === 0)) ? copyDistance.x : defaultCopyDistance;
    var copyDistanceY = (copyDistance && (copyDistance.y || copyDistance.y === 0)) ? copyDistance.y : defaultCopyDistance;

    properties.yValue = yAxis.toValue(yAxis.toPixels(properties.yValue) + copyDistanceY);
    properties.xValue = xAxis.toValue(xAxis.toPixels(properties.xValue) + copyDistanceX);
    var nearestDataPointForXValue = infChart.math.findNearestDataPoint(chartInstance.chart, properties.xValue, undefined, true, true);
    properties.xValueEnd = nearestDataPointForXValue.xData + (properties.xValueEnd - properties.nearestXDataPoint);

    return properties;
};

infChart.positionsDrawing.prototype.stop = function (e) {
    var ann = this.annotation,
        options = ann.options,
        chart = ann.chart,
        xAxis = chart.xAxis[options.xAxis],
        yAxis = chart.yAxis[options.yAxis];

    this.calculateDrawingData(true);
    this.drawPositionsDrawing();
    this.updateLabels();

    infChart.drawingUtils.common.saveBaseYValues.call(this, ann.options.yValue, ann.options.yValueEnd);
    infChart.drawingUtils.common.fixSelectionMarker.call(self, ann);
    infChart.drawingUtils.common.onPropertyChange.call(this);
};

infChart.positionsDrawing.prototype.scale = function (isCalculateNewValueForScale) {
    var self = this,
        ann = self.annotation,
        chart = ann.chart,
        options = ann.options;

    if (isCalculateNewValueForScale) {
        var nearestDataPointForXValue = infChart.math.findNearestDataPoint(chart, options.xValue, undefined, true, true);
        var seriesXData = chart.series[0].xData;
        var nearestDataPointForXValueEnd = infChart.math.findNearestDataPoint(chart, options.xValueEnd, undefined, true, true);
        var endDataPointIndex = nearestDataPointForXValue.dataIndex + (nearestDataPointForXValueEnd.dataIndex - nearestDataPointForXValue.dataIndex);
        var newXValueEnd = seriesXData.length > endDataPointIndex? seriesXData[endDataPointIndex]: infChart.math.getFutureXValueForGivenIndex(chart, endDataPointIndex);
        ann.update({
            nearestXDataPoint: nearestDataPointForXValue.xData,
            startDataPointIndex: nearestDataPointForXValue.dataIndex,
            xValueEnd: newXValueEnd,
            endDataPointIndex: endDataPointIndex
        });
    }
        
    this.calculateDrawingData(true);
    this.drawPositionsDrawing();
    this.updateLabels();
};

infChart.positionsDrawing.prototype.translate = function (e) {
    var self = this,
        ann = self.annotation,
        chart = ann.chart,
        options = ann.options,
        nearestDataPointForXValue = infChart.math.findNearestDataPoint(chart, options.xValue, undefined, true, true),
        seriesXData = chart.series[0].xData,
        endDataPointIndex = nearestDataPointForXValue.dataIndex + (options.endDataPointIndex - options.startDataPointIndex),
        newXValueEnd = seriesXData.length > endDataPointIndex? seriesXData[endDataPointIndex]: infChart.math.getFutureXValueForGivenIndex(chart, endDataPointIndex);

    ann.update({
        nearestXDataPoint: nearestDataPointForXValue.xData,
        startDataPointIndex: nearestDataPointForXValue.dataIndex,
        xValueEnd: newXValueEnd,
        endDataPointIndex: endDataPointIndex
    });

    this.calculateDrawingData(true);
    this.drawPositionsDrawing();
    this.updateLabels();

    // infChart.drawingUtils.common.removeDragSupporters.call(this, this.dragSupporters);
    // infChart.drawingUtils.common.addDragSupporters.call(this, ann, chart, ["M", line[1], 0, 'L', line[4], line[5]], this.dragSupporters);
};

infChart.positionsDrawing.prototype.translateEnd = function () {
    // this.selectAndBindResize();
    infChart.drawingUtils.common.onPropertyChange.call(this);
};

infChart.positionsDrawing.prototype.isRequiredProperty = function (propertyId) {
    var isPositionProperty = false;

    switch (propertyId) {
        case "yValue":
        case "yValueEnd":
        case "xValue":
        case "xValueEnd":
        case "isLongPositions" :
        case "settings" :
        case "isLocked":
            isPositionProperty = true;
            break;
        default :
            break;
    }

    return isPositionProperty;
};

//region Draw positions

infChart.positionsDrawing.prototype.drawPositionsDrawing = function () {
    var ann = this.annotation,
        options = ann.options,
        settings = options.settings,
        styles = options.styles,
        chart = ann.chart,
        xAxis = chart.xAxis[options.xAxis],
        yAxis = chart.yAxis[options.yAxis],
        additionalDrawings = this.additionalDrawings,
        xValuePixels = xAxis.toPixels(options.xValue),
        yValuePixels = yAxis.toPixels(options.yValue),
        newX = xAxis.toPixels(options.nearestXDataPoint) - xValuePixels,
        newXEnd = xAxis.toPixels(options.xValueEnd) - xValuePixels,
        line = ["M", newX, 0, 'L', newXEnd, 0],
        takeProfitY = yAxis.toPixels(settings.takeProfit.price) - yValuePixels,
        stopLossY = yAxis.toPixels(settings.stopLoss.price) - yValuePixels,
        takeProfitLine = ["M", newX, takeProfitY, 'L', newXEnd, takeProfitY],
        stopLossLine = ["M", newX, stopLossY, 'L', newXEnd, stopLossY];

    ann.update({
        shape: {
            params: {
                d: line
            }
        }
    });

    additionalDrawings.takeProfit.line.attr({
        d: takeProfitLine
    });

    additionalDrawings.takeProfit.fill.attr({
        d: ['M', takeProfitLine[1], takeProfitLine[2], 'L', takeProfitLine[4], takeProfitLine[5], 'L', line[4], line[5], 'L', line[1], line[2], 'L', takeProfitLine[1], takeProfitLine[2]]
    });

    additionalDrawings.stopLoss.line.attr({
        d: stopLossLine
    });

    additionalDrawings.stopLoss.fill.attr({
        d: ['M', stopLossLine[1], stopLossLine[2], 'L', stopLossLine[4], stopLossLine[5], 'L', line[4], line[5], 'L', line[1], line[2], 'L', stopLossLine[1], stopLossLine[2]]
    });

    if (settings.pAndL.lineStartDate) {
        var pAndLLineX = xAxis.toPixels(settings.pAndL.lineStartDate) - xValuePixels,
            pAndLLineY = yAxis.toPixels(settings.pAndL.lineStartPrice) - yValuePixels,
            pAndLLineXEnd = xAxis.toPixels(settings.pAndL.lineEndDate) - xValuePixels,
            pAndLLineYEnd = yAxis.toPixels(settings.pAndL.lineEndPrice) - yValuePixels,
            pAndLLine = ["M", pAndLLineX, pAndLLineY, 'L', pAndLLineXEnd, pAndLLineYEnd],
            color = options.isLongPositions ? settings.pAndL.lineEndPrice > settings.entryPrice ? styles.takeProfitColor : styles.stopLossColor : settings.pAndL.lineEndPrice < settings.entryPrice ? styles.takeProfitColor : styles.stopLossColor,
            fillOpacity = options.isLongPositions ? settings.pAndL.lineEndPrice > settings.entryPrice ? styles.takeProfitFillOpacity : styles.stopLossFillOpacity : settings.pAndL.lineEndPrice < settings.entryPrice ? styles.takeProfitFillOpacity : styles.stopLossFillOpacity;

        additionalDrawings.pAndL.line.attr({
            d: pAndLLine,
            'stroke-dasharray': "2 2",
            stroke: styles.lineColor,
            opacity: styles.lineOpacity
        }).show();

        additionalDrawings.pAndL.fill.attr({
            d: ['M', pAndLLine[1], pAndLLine[2], 'L', pAndLLine[4], pAndLLine[2], 'L', pAndLLine[4], pAndLLine[5], 'L', pAndLLine[1], pAndLLine[5], 'L', pAndLLine[1], pAndLLine[2]],
            fill: color,
            'fill-opacity': fillOpacity
        }).show();
    } else {
        additionalDrawings.pAndL.line.hide();
        additionalDrawings.pAndL.fill.hide();
    }

    var pAndLLabelColor = options.labelData.pAndL.closedPAndLRawValue > 0 ? styles.takeProfitColor : styles.stopLossColor;
    additionalDrawings.pAndL.label.attr({
        stroke: pAndLLabelColor,
        fill: pAndLLabelColor
    });

    // infChart.drawingUtils.common.removeDragSupporters.call(this, this.dragSupporters);
    // infChart.drawingUtils.common.addDragSupporters.call(this, ann, chart, ["M", line[1], 0, 'L', line[4], line[5]], this.dragSupporters);
    //TODO draw drag supporters
}

infChart.positionsDrawing.prototype.updateLabels = function () {
    var ann = this.annotation,
        options = ann.options,
        settings = options.settings,
        additionalDrawings = this.additionalDrawings,
        mainLine = ann.shape.d.split(' '),
        takeProfitLine = additionalDrawings.takeProfit.line.d.split(' '),
        stopLossLine = additionalDrawings.stopLoss.line.d.split(' ');

    this.setLabel(options.styles.isCompactStats, options.isLongPositions, "takeProfit", additionalDrawings.takeProfit.label, takeProfitLine, options.labelData.takeProfit, settings.takeProfit);
    this.setLabel(options.styles.isCompactStats, options.isLongPositions, "stopLoss", additionalDrawings.stopLoss.label, stopLossLine, options.labelData.stopLoss, settings.stopLoss);
    this.setLabel(options.styles.isCompactStats, options.isLongPositions, "pAndL", additionalDrawings.pAndL.label, mainLine, options.labelData.pAndL);
};

infChart.positionsDrawing.prototype.setLabel = function (isCompactStats, isLongPositions, type, labelObj, line, labelData, settings) {
    var labelText = "",
        labelPosition = 0,
        y = parseFloat(line[2]),
        dx = parseFloat(line[4]);

    switch (type) {
        case "takeProfit":
            labelText = isCompactStats ? labelData.target + " (" + labelData.percentageTarget + "%) " + labelData.amount :
                "Target: " + labelData.target + " (" + labelData.percentageTarget + "%) " + settings.tickSize + ", Amount: " + labelData.amount;
            break;
        case "stopLoss":
            labelText = isCompactStats ? labelData.stop + " (" + labelData.percentageStop + "%) " + labelData.amount :
                "Stop: " + labelData.stop + " (" + labelData.percentageStop + "%) " + settings.tickSize + ", Amount: " + labelData.amount;
            break;
        case "pAndL" :
            labelText = isCompactStats ? labelData.closedPAndL + " ~ " + labelData.qty + "<br>" + labelData.riskRewardRatio :
                "Closed P&L: " + labelData.closedPAndL + ", Qty: " + labelData.qty + "<br>Risk/Reward Ratio: " + labelData.riskRewardRatio;
            break;
    }

    labelObj.textSetter(labelText);

    switch (type) {
        case "takeProfit":
            labelPosition = isLongPositions ? y - labelObj.height - 10 : y + 10;
            break;
        case "stopLoss":
        case "pAndL" :
            labelPosition = isLongPositions ? y + 10 : y - labelObj.height - 10;
            break;
    }

    labelObj.attr({
        x: dx / 2 - labelObj.width / 2,
        y: labelPosition
    });
};

//endregion

//region Calculations

infChart.positionsDrawing.prototype.calculateDrawingData = function (updateSettings) {
    var ann = this.annotation,
        options = ann.options,
        settings = options.settings,
        chart = ann.chart,
        xAxis = chart.xAxis[options.xAxis],
        yAxis = chart.yAxis[options.yAxis],
        decimalPoints = this.stockChart.getMainSeries().options.dp,
        takeProfitPriceFactor = settings.takeProfit.tickSize * (1 / Math.pow(10, decimalPoints)),
        stopLossPriceFactor = settings.stopLoss.tickSize * (1 / Math.pow(10, decimalPoints));

    settings.entryPrice = options.yValue;
    settings.takeProfit.price = options.isLongPositions ? settings.entryPrice + takeProfitPriceFactor : settings.entryPrice - takeProfitPriceFactor;
    settings.stopLoss.price = options.isLongPositions ? settings.entryPrice - stopLossPriceFactor : settings.entryPrice + stopLossPriceFactor;
    settings.risk.size = settings.accountSize * (settings.risk.percentage / 100);

    var target = options.isLongPositions ? settings.takeProfit.price - settings.entryPrice : settings.entryPrice - settings.takeProfit.price,
        stop = options.isLongPositions ? settings.entryPrice - settings.stopLoss.price : settings.stopLoss.price - settings.entryPrice,
        qty = (settings.risk.size / (settings.entryPrice - settings.stopLoss.price)) / settings.lotSize;

    this.calculatePAndLBoxPrices();

    var closedPAndL = options.isLongPositions ? settings.pAndL.projectionPrice - settings.entryPrice : settings.entryPrice - settings.pAndL.projectionPrice

    options.labelData = {
        takeProfit: {
            target: infChart.drawingUtils.common.formatValue(target, decimalPoints),
            percentageTarget: infChart.drawingUtils.common.formatValue((target / settings.entryPrice) * 100, 2),
            amount: infChart.drawingUtils.common.formatValue(settings.accountSize + (target * qty), 2)
        },
        stopLoss: {
            stop: infChart.drawingUtils.common.formatValue(stop, decimalPoints),
            percentageStop: infChart.drawingUtils.common.formatValue((stop / settings.entryPrice) * 100, 2),
            amount: infChart.drawingUtils.common.formatValue(settings.accountSize - (stop * qty), 2)
        },
        pAndL: {
            closedPAndLRawValue: closedPAndL,
            closedPAndL: infChart.drawingUtils.common.formatValue(closedPAndL, 2),
            qty: infChart.drawingUtils.common.formatValue(qty, 0),
            riskRewardRatio: infChart.drawingUtils.common.formatValue((settings.takeProfit.price - settings.entryPrice) / (settings.entryPrice - settings.stopLoss.price), 2)
        }
    }

    if (updateSettings) {
        this.updateSettings(options);
    }
};

infChart.positionsDrawing.prototype.calculatePAndLBoxPrices = function () {
    var ann = this.annotation,
        options = ann.options,
        settings = options.settings,
        chart = ann.chart,
        series = chart.series[0],
        seriesXData = series.xData,
        pAndLEntryIndex = -1,
        pAndLData = {
            projectionPrice: null,
            lineStartPrice: null,
            lineStartDate: null,
            lineEndPrice: null,
            lineEndDate: null
        },
        currentCandleData,
        lastCandleIndex = seriesXData.length > options.endDataPointIndex? options.endDataPointIndex : seriesXData.length - 1;

    for (var i = options.startDataPointIndex; i <= lastCandleIndex; i++) {
        currentCandleData = infChart.util.getCandleData(chart, i);

        if (settings.entryPrice >= currentCandleData[2] && settings.entryPrice <= currentCandleData[1]) {
            pAndLData.lineStartPrice = settings.entryPrice;
            pAndLData.lineStartDate = seriesXData[i];
            pAndLEntryIndex = i;
            break;
        }
    }

    if (pAndLEntryIndex !== -1) {
        for (var j = pAndLEntryIndex; j <= lastCandleIndex; j++) {
            currentCandleData = infChart.util.getCandleData(chart, j);

            if (currentCandleData[1] >= settings.stopLoss.price && currentCandleData[2] <= settings.stopLoss.price) {
                pAndLData.lineEndPrice = settings.stopLoss.price;
                pAndLData.lineEndDate = seriesXData[j];
                break;
            } else if (currentCandleData[1] >= settings.takeProfit.price && currentCandleData[2] <= settings.takeProfit.price) {
                pAndLData.lineEndPrice = settings.takeProfit.price;
                pAndLData.lineEndDate = seriesXData[j];
                break;
            } else if ((options.isLongPositions && currentCandleData[1] < settings.stopLoss.price && currentCandleData[2] < settings.stopLoss.price) ||
                (!options.isLongPositions && currentCandleData[1] > settings.stopLoss.price && currentCandleData[2] > settings.stopLoss.price)) {
                pAndLData.lineEndPrice = settings.stopLoss.price;
                pAndLData.lineEndDate = seriesXData[j];
                break;
            } else if ((options.isLongPositions && currentCandleData[1] > settings.takeProfit.price && currentCandleData[2] > settings.takeProfit.price) ||
                (!options.isLongPositions && currentCandleData[1] < settings.takeProfit.price && currentCandleData[2] < settings.takeProfit.price)) {
                pAndLData.lineEndPrice = settings.takeProfit.price;
                pAndLData.lineEndDate = seriesXData[j];
                break;
            } else if (j === lastCandleIndex) {
                if ((options.isLongPositions && ((currentCandleData[3] > settings.entryPrice && currentCandleData[3] <= settings.takeProfit.price) || (currentCandleData[3] < settings.entryPrice && currentCandleData[3] >= settings.stopLoss.price))) ||
                    (!options.isLongPositions && ((currentCandleData[3] < settings.entryPrice && currentCandleData[3] >= settings.takeProfit.price) || (currentCandleData[3] > settings.entryPrice && currentCandleData[3] <= settings.stopLoss.price)))) {
                    pAndLData.lineEndPrice = currentCandleData[3];
                    pAndLData.lineEndDate = seriesXData[j];
                    break;
                }
            }
        }
    }

    if (pAndLData.lineEndPrice) {
        pAndLData.projectionPrice = pAndLData.lineEndPrice;
    } else {
        pAndLData.projectionPrice = infChart.util.getCandleData(chart, lastCandleIndex)[3];
    }

    settings.pAndL = pAndLData;
}

infChart.positionsDrawing.prototype.entryPriceChangeCalculation = function (newEntryPrice, options) {
    var settings = options.settings,
        decimalPoints = this.stockChart.getMainSeries().options.dp,
        priceFactor = Math.pow(10, decimalPoints);

    settings.entryPrice = newEntryPrice;

    if (options.isLongPositions) {
        settings.takeProfit.tickSize = Math.floor((settings.takeProfit.price - settings.entryPrice) * priceFactor);
        settings.stopLoss.tickSize = Math.floor((settings.entryPrice - settings.stopLoss.price) * priceFactor);
    } else {
        settings.takeProfit.tickSize = Math.floor((settings.entryPrice - settings.takeProfit.price) * priceFactor);
        settings.stopLoss.tickSize = Math.floor((settings.stopLoss.price - settings.entryPrice) * priceFactor);
    }
};

infChart.positionsDrawing.prototype.priceChangeCalculation = function (newPrice, isTakeProfit) {
    var ann = this.annotation,
        options = ann.options,
        settings = options.settings,
        decimalPoints = this.stockChart.getMainSeries().options.dp,
        priceFactor = Math.pow(10, decimalPoints);

    if (isTakeProfit) {
        settings.takeProfit.price = newPrice;

        if (options.isLongPositions) {
            settings.takeProfit.tickSize = Math.floor((settings.takeProfit.price - settings.entryPrice) * priceFactor);

        } else {
            settings.takeProfit.tickSize = Math.floor((settings.entryPrice - settings.takeProfit.price) * priceFactor);

        }
    } else {
        settings.stopLoss.price = newPrice;

        if (options.isLongPositions) {
            settings.stopLoss.tickSize = Math.floor((settings.entryPrice - settings.stopLoss.price) * priceFactor);
        } else {
            settings.stopLoss.tickSize = Math.floor((settings.stopLoss.price - settings.entryPrice) * priceFactor);
        }
    }
};

//endregion

//region Select and bind resize

infChart.positionsDrawing.prototype.deselect = function (isMouseOut) {
    infChart.drawingUtils.common.onDeselect.call(this);
    if (isMouseOut) {
        this.additionalDrawings.takeProfit.label.hide();
        this.additionalDrawings.stopLoss.label.hide();
        this.additionalDrawings.pAndL.label.hide();
    }
};

infChart.positionsDrawing.prototype.selectAndBindResize = function () {
    var ann = this.annotation,
        additionalDrawings = this.additionalDrawings,
        mainLine = ann.shape.d.split(' '),
        takeProfitLine = additionalDrawings.takeProfit.line.d.split(' '),
        stopLossLine = additionalDrawings.stopLoss.line.d.split(' ');

    ann.events.deselect.call(ann);
    additionalDrawings.takeProfit.label.show();
    additionalDrawings.stopLoss.label.show();
    additionalDrawings.pAndL.label.show();
    ann.selectionMarker = [];
    infChart.drawingUtils.common.addAndBindSelectionMarker.call(this, ann, mainLine[1], mainLine[2], this.mainLineStep, this.mainLineStop, true);
    infChart.drawingUtils.common.addAndBindSelectionMarker.call(this, ann, mainLine[4], mainLine[5], this.mainLineStep, this.mainLineStop, false);
    infChart.drawingUtils.common.addAndBindSelectionMarker.call(this, ann, takeProfitLine[1], takeProfitLine[2], this.priceLineStep, this.priceLineStep, true);
    infChart.drawingUtils.common.addAndBindSelectionMarker.call(this, ann, stopLossLine[1], stopLossLine[2], this.priceLineStep, this.priceLineStep, false);
};

infChart.positionsDrawing.prototype.mainLineStep = function (e, isStartPoint) {
    var ann = this.annotation,
        options = ann.options,
        settings = options.settings,
        chart = ann.chart,
        xAxis = chart.xAxis[options.xAxis],
        yAxis = chart.yAxis[options.yAxis],
        x = e.chartX,
        y = e.chartY,
        xValue = xAxis.toValue(x),
        yValue = yAxis.toValue(y),
        updatedAttributes = {},
        nearestDataPointForXValue = infChart.math.findNearestDataPoint(chart, xValue, undefined, true, true);

    if (isStartPoint) {
        if (options.isLongPositions) {
            updatedAttributes.yValue = settings.takeProfit.price <= yValue ? settings.takeProfit.price - this.priceDifferenceFactor : settings.stopLoss.price >= yValue ? settings.stopLoss.price + this.priceDifferenceFactor : yValue;
        } else {
            updatedAttributes.yValue = settings.stopLoss.price <= yValue ? settings.stopLoss.price - this.priceDifferenceFactor : settings.takeProfit.price >= yValue ? settings.takeProfit.price + this.priceDifferenceFactor : yValue;
        }

        this.entryPriceChangeCalculation(updatedAttributes.yValue, options);

        updatedAttributes.xValue = xValue;
        updatedAttributes.nearestXDataPoint = nearestDataPointForXValue.xData;
        updatedAttributes.startDataPointIndex = nearestDataPointForXValue.dataIndex;
    } else {
        updatedAttributes.xValueEnd = nearestDataPointForXValue.xData;
        updatedAttributes.endDataPointIndex = nearestDataPointForXValue.dataIndex;
    }

    ann.update(updatedAttributes);

    this.calculateDrawingData(true);
    this.drawPositionsDrawing();
    this.updateLabels();

    infChart.drawingUtils.common.fixSelectionMarker.call(self, ann);
};

infChart.positionsDrawing.prototype.mainLineStop = function () {
    var ann = this.annotation;

    infChart.drawingUtils.common.saveBaseYValues.call(this, ann.options.yValue, ann.options.yValueEnd);
}

infChart.positionsDrawing.prototype.priceLineStep = function (e, isTakeProfit) {
    var ann = this.annotation,
        options = ann.options,
        settings = options.settings,
        chart = ann.chart,
        xAxis = chart.xAxis[options.xAxis],
        yAxis = chart.yAxis[options.yAxis],
        x = e.chartX,
        y = e.chartY,
        xValue = xAxis.toValue(x),
        yValue = yAxis.toValue(y),
        newPrice;

    if (options.isLongPositions) {
        if (isTakeProfit) {
            newPrice = settings.entryPrice <= yValue ? yValue : settings.entryPrice + this.priceDifferenceFactor;
        } else {
            newPrice = settings.entryPrice >= yValue ? yValue : settings.entryPrice - this.priceDifferenceFactor;
        }
    } else {
        if (isTakeProfit) {
            newPrice = settings.entryPrice >= yValue ? yValue : settings.entryPrice - this.priceDifferenceFactor;
        } else {
            newPrice = settings.entryPrice <= yValue ? yValue : settings.entryPrice + this.priceDifferenceFactor;
        }
    }

    this.priceChangeCalculation(newPrice, isTakeProfit);
    this.calculateDrawingData(true);
    this.drawPositionsDrawing();
    this.updateLabels();
};

//endregion

//region Settings

infChart.positionsDrawing.prototype.getQuickSettingsPopup = function () {
    return infChart.structureManager.drawingTools.getPositionsQuickSettings(this.stockChart.symbol.currency, this.annotation.options.styles);
};

infChart.positionsDrawing.prototype.getSettingsPopup = function () {
    return infChart.structureManager.drawingTools.getPositionsSettings(this.stockChart.symbol.currency, this.annotation.options.styles);
};

/**
 * Update the annotations options specific to this tool from the given properties
 * @param options
 */
infChart.positionsDrawing.prototype.updateOptions = function (options) {
    var ann = this.annotation;
    ann && ann.options && (ann.options.nearestXDataPoint = infChart.math.findNearestXDataPoint(ann.chart, options.xValue));
    if (options.settings && options.settings.stopLoss) {
        ann.options.settings.stopLoss = options.settings.stopLoss;
    }
    if (options.settings && options.settings.takeProfit) {
        ann.options.settings.takeProfit = options.settings.takeProfit;
    }
};

infChart.positionsDrawing.prototype.updateSettings = function (properties) {
    infChart.structureManager.drawingTools.updatePositionsSettings($(this.settingsPopup), properties.settings, properties.styles, this.stockChart.getMainSeries().options.dp);
};

infChart.positionsDrawing.prototype.bindSettingsEvents = function () {
    var self = this,
        ann = self.annotation;

    function onAccountSizeChange(accountSize) {
        var isPropertyChange = true;
        if (self.settingsPopup) {
            isPropertyChange = self.isSettingsPropertyChange();
        }
        self.onLabelDataChange.call(self, "accountSize", accountSize, isPropertyChange);
    }

    function onLotSizeChange(lotSize) {
        var isPropertyChange = true;
        if (self.settingsPopup) {
            isPropertyChange = self.isSettingsPropertyChange();
        }
        self.onLabelDataChange.call(self, "lotSize", lotSize, isPropertyChange);
    }

    function onRiskChange(riskValue) {
        var isPropertyChange = true;
        if (self.settingsPopup) {
            isPropertyChange = self.isSettingsPropertyChange();
        }

        self.onRiskChange.call(self, riskValue, isPropertyChange);
    }

    function onEntryPriceChange(entryPrice) {
        var isPropertyChange = true;
        if (self.settingsPopup) {
            isPropertyChange = self.isSettingsPropertyChange();
        }
        self.onEntryPriceChange.call(self, entryPrice, isPropertyChange);
    }

    function onTakeProfitTicksChange(ticks) {
        var isPropertyChange = true;
        if (self.settingsPopup) {
            isPropertyChange = self.isSettingsPropertyChange();
        }
        self.onPriceTicksChange.call(self, true, ticks, isPropertyChange);
    }

    function onTakeProfitPriceChange(takeProfit) {
        var isPropertyChange = true;
        if (self.settingsPopup) {
            isPropertyChange = self.isSettingsPropertyChange();
        }
        self.onPriceChange.call(self, true, takeProfit, isPropertyChange);
    }

    function onStopLossTicksChange(ticks) {
        var isPropertyChange = true;
        if (self.settingsPopup) {
            isPropertyChange = self.isSettingsPropertyChange();
        }
        self.onPriceTicksChange.call(self, false, ticks, isPropertyChange);
    }

    function onStopLossPriceChange(stopLoss) {
        var isPropertyChange = true;
        if (self.settingsPopup) {
            isPropertyChange = self.isSettingsPropertyChange();
        }
        self.onPriceChange.call(self, false, stopLoss, isPropertyChange);
    }

    function onLineColorChange(rgb, value, opacity) {
        var isPropertyChange = true;
        if (self.settingsPopup) {
            isPropertyChange = self.isSettingsPropertyChange();
        }
        self.onLineColorChange.call(self, value, opacity, isPropertyChange);
    }

    function onLineWidthChange(strokeWidth) {
        var isPropertyChange = true;
        if (self.settingsPopup) {
            isPropertyChange = self.isSettingsPropertyChange();
        }
        self.onLineWidthChange.call(self, strokeWidth, isPropertyChange);
    }

    function onStopLossColorChange(rgb, value, opacity) {
        var isPropertyChange = true;
        if (self.settingsPopup) {
            isPropertyChange = self.isSettingsPropertyChange();
        }
        self.onStopLossColorChange.call(self, value, opacity, isPropertyChange);
    }

    function onTakeProfitColorChange(rgb, value, opacity) {
        var isPropertyChange = true;
        if (self.settingsPopup) {
            isPropertyChange = self.isSettingsPropertyChange();
        }
        self.onTakeProfitColorChange.call(self, value, opacity, isPropertyChange);
    }

    function onTextColorChange(rgb, value, opacity) {
        var isPropertyChange = true;
        if (self.settingsPopup) {
            isPropertyChange = self.isSettingsPropertyChange();
        }
        self.onTextColorChange.call(self, value, opacity, isPropertyChange);
    }

    function onCompactStatsModeChange(value) {
        var isPropertyChange = true;
        if (self.settingsPopup) {
            isPropertyChange = self.isSettingsPropertyChange();
        }
        self.onCompactStatsModeChange.call(self, value, isPropertyChange);
    }

    function onLabelTextSizeChange(newFontSize) {
        var isPropertyChange = true;
        if (self.settingsPopup) {
            isPropertyChange = self.isSettingsPropertyChange();
        }
        infChart.drawingUtils.common.settings.onLabelTextSizeChange.call(self, newFontSize, isPropertyChange);
    }

    function onResetToDefault () {
        self.updateSavedDrawingProperties(true);
    }

    var CallBackFnPositionSettings = {
        onAccountSizeChange: onAccountSizeChange,
        onLotSizeChange:onLotSizeChange,
        onRiskChange:onRiskChange,
        onEntryPriceChange:onEntryPriceChange,
        onTakeProfitTicksChange:onTakeProfitTicksChange,
        onTakeProfitPriceChange:onTakeProfitPriceChange,
        onStopLossTicksChange:onStopLossTicksChange,
        onStopLossPriceChange:onStopLossPriceChange,
        onLineColorChange:onLineColorChange,
        onLineWidthChange:onLineWidthChange,
        onStopLossColorChange:onStopLossColorChange,
        onTakeProfitColorChange:onTakeProfitColorChange,
        onTextColorChange:onTextColorChange,
        onCompactStatsModeChange:onCompactStatsModeChange,
        onLabelTextSizeChange:onLabelTextSizeChange,
        onResetToDefault:onResetToDefault
    }

    infChart.structureManager.drawingTools.bindPositionsSettings(self.settingsPopup, ann, this.priceDifferenceFactor, CallBackFnPositionSettings);
};

infChart.positionsDrawing.prototype.onLabelDataChange = function (type, value, isPropertyChange) {
    this.annotation.options.settings[type] = parseFloat(value);
    this.calculateDrawingData(true);
    this.updateLabels();

    isPropertyChange && this.onPropertyChange();

    if (this.settingsPopup) {
        this.settingsPopup.data("infUndoRedo", false);
    }
    infChart.drawingUtils.common.saveDrawingProperties.call(this);
}

infChart.positionsDrawing.prototype.onRiskChange = function (value, isPropertyChange) {
    var ann = this.annotation,
        settings = ann.options.settings;

    if (settings.risk.selectedItem === "size") {
        settings.risk.size = parseFloat(value);
        settings.risk.percentage = (settings.risk.size / settings.accountSize) * 100;
    } else {
        settings.risk.percentage = parseFloat(value);
    }

    this.calculateDrawingData(true);
    this.updateLabels();

    isPropertyChange && this.onPropertyChange();

    if (this.settingsPopup) {
        this.settingsPopup.data("infUndoRedo", false);
    }
    infChart.drawingUtils.common.saveDrawingProperties.call(this);
}

infChart.positionsDrawing.prototype.onEntryPriceChange = function (entryPrice, isPropertyChange) {
    this.annotation.update({
        yValue: parseFloat(entryPrice)
    });

    this.entryPriceChangeCalculation(this.annotation.options.yValue, this.annotation.options);
    this.calculateDrawingData(true);
    this.drawPositionsDrawing();
    this.updateLabels();

    isPropertyChange && this.onPropertyChange();

    if (this.settingsPopup) {
        this.settingsPopup.data("infUndoRedo", false);
    }
    infChart.drawingUtils.common.saveDrawingProperties.call(this);
}

infChart.positionsDrawing.prototype.onPriceTicksChange = function (isTakeProfit, tickSize, isPropertyChange) {
    this.annotation.options.settings[isTakeProfit ? "takeProfit" : "stopLoss"].tickSize = parseInt(tickSize);
    this.calculateDrawingData(true);
    this.drawPositionsDrawing();
    this.updateLabels();

    isPropertyChange && this.onPropertyChange();

    if (this.settingsPopup) {
        this.settingsPopup.data("infUndoRedo", false);
    }
    infChart.drawingUtils.common.saveDrawingProperties.call(this);
}

infChart.positionsDrawing.prototype.onPriceChange = function (isTakeProfit, price, isPropertyChange) {
    this.priceChangeCalculation(price, isTakeProfit);
    this.calculateDrawingData(true);
    this.drawPositionsDrawing();
    this.updateLabels();

    isPropertyChange && this.onPropertyChange();

    if (this.settingsPopup) {
        this.settingsPopup.data("infUndoRedo", false);
    }
    infChart.drawingUtils.common.saveDrawingProperties.call(this);
}

infChart.positionsDrawing.prototype.onLineColorChange = function (value, opacity, isPropertyChange) {
    this.annotation.update({
        shape: {
            params: {
                stroke: value,
                opacity: opacity
            }
        },
        styles: {
            lineColor: value,
            lineOpacity: opacity
        }
    });
    this.additionalDrawings.pAndL.line.attr({
        stroke: value,
        opacity: opacity
    });

    isPropertyChange && this.onPropertyChange();

    if (this.settingsPopup) {
        this.settingsPopup.data("infUndoRedo", false);
    }
    infChart.drawingUtils.common.saveDrawingProperties.call(this);
}

infChart.positionsDrawing.prototype.onLineWidthChange = function (strokeWidth, isPropertyChange) {
    this.annotation.update({
        shape: {
            params: {
                'stroke-width': strokeWidth
            }
        },
        styles: {
            lineWidth: strokeWidth
        }
    });

    isPropertyChange && this.onPropertyChange();

    if (this.settingsPopup) {
        this.settingsPopup.data("infUndoRedo", false);
    }
    infChart.drawingUtils.common.saveDrawingProperties.call(this);

    this.selectAndBindResize();
}

infChart.positionsDrawing.prototype.onStopLossColorChange = function (value, opacity, isPropertyChange) {
    var elementType = this.additionalDrawings.stopLoss,
        options = this.annotation.options;

    elementType.line.attr({
        stroke: value,
        opacity: opacity
    });
    elementType.fill.attr({
        fill: value,
        'fill-opacity': opacity
    });
    elementType.label.attr({
        stroke: value,
        fill: value
    });

    options.styles.stopLossColor = value;
    options.styles.stopLossFillOpacity = opacity;

    if (options.labelData && options.labelData.pAndL.closedPAndLRawValue < 0) {
        this.additionalDrawings.pAndL.label.attr({
            stroke: value,
            fill: value
        });
    }

    if (options.settings && options.settings.pAndL.lineStartPrice && options.settings.pAndL.lineEndPrice &&
        ((options.isLongPositions && options.settings.pAndL.lineStartPrice > options.settings.pAndL.lineEndPrice) ||
            (!options.isLongPositions && options.settings.pAndL.lineStartPrice < options.settings.pAndL.lineEndPrice))) {
        this.additionalDrawings.pAndL.fill.attr({
            fill: value,
            'fill-opacity': opacity
        });
    }

    isPropertyChange && this.onPropertyChange();

    if (this.settingsPopup) {
        this.settingsPopup.data("infUndoRedo", false);
    }
    infChart.drawingUtils.common.saveDrawingProperties.call(this);
}

infChart.positionsDrawing.prototype.onTakeProfitColorChange = function (value, opacity, isPropertyChange) {
    var elementType = this.additionalDrawings.takeProfit,
        options = this.annotation.options;

    elementType.line.attr({
        stroke: value,
        opacity: opacity
    });
    elementType.fill.attr({
        fill: value,
        'fill-opacity': opacity
    });
    elementType.label.attr({
        stroke: value,
        fill: value
    });

    options.styles.takeProfitColor = value;
    options.styles.takeProfitFillOpacity = opacity;

    if (options.labelData && options.labelData.pAndL.closedPAndLRawValue > 0) {
        this.additionalDrawings.pAndL.label.attr({
            stroke: value,
            fill: value
        });
    }

    if (options.settings && options.settings.pAndL.lineStartPrice && options.settings.pAndL.lineEndPrice &&
        ((options.isLongPositions && options.settings.pAndL.lineStartPrice < options.settings.pAndL.lineEndPrice) ||
            (!options.isLongPositions && options.settings.pAndL.lineStartPrice > options.settings.pAndL.lineEndPrice))) {
        this.additionalDrawings.pAndL.fill.attr({
            fill: value,
            'fill-opacity': opacity
        });
    }

    isPropertyChange && this.onPropertyChange();

    if (this.settingsPopup) {
        this.settingsPopup.data("infUndoRedo", false);
    }
    infChart.drawingUtils.common.saveDrawingProperties.call(this);
}

infChart.positionsDrawing.prototype.onTextColorChange = function (value, opacity, isPropertyChange) {
    var additionalDrawings = this.additionalDrawings;
    var newColor = {opacity: opacity};
    var css = {color: value};

    additionalDrawings.takeProfit.label.css(css).attr(newColor);
    additionalDrawings.stopLoss.label.css(css).attr(newColor);
    additionalDrawings.pAndL.label.css(css).attr(newColor);

    this.annotation.options.styles.textColor = value;
    this.annotation.options.styles.textOpacity = opacity;

    isPropertyChange && this.onPropertyChange();

    if (this.settingsPopup) {
        this.settingsPopup.data("infUndoRedo", false);
    }
    infChart.drawingUtils.common.saveDrawingProperties.call(this);
}

infChart.positionsDrawing.prototype.onCompactStatsModeChange = function (value, isPropertyChange) {
    this.annotation.options.styles.isCompactStats = value;
    this.updateLabels();

    isPropertyChange && this.onPropertyChange();

    if (this.settingsPopup) {
        this.settingsPopup.data("infUndoRedo", false);
    }
    infChart.drawingUtils.common.saveDrawingProperties.call(this);
};

infChart.positionsDrawing.prototype.specificCursorChange = function(url){
    var self = this,
        ann = self.annotation,
        options = ann.options,
        additionalDrawings = self.additionalDrawings;
    
    if(additionalDrawings.pAndL){
        var pAndL = additionalDrawings.pAndL;
        if(pAndL.fill){
            if(url){
                pAndL.fill.css({'cursor': 'url("' + url + '"), default'});
            } else {
                infChart.util.setCursor(pAndL.fill, 'move');
                pAndL.fill.css({'cursor': 'move'});
            }
        }
        if(pAndL.line){
            if(url){
                pAndL.line.css({'cursor': 'url("' + url + '"), default'});
            } else {
                infChart.util.setCursor(pAndL.line, 'move');
                pAndL.line.css({'cursor': 'move'});
            }
        }
    }

    if(additionalDrawings.stopLoss){
        var stopLoss = additionalDrawings.stopLoss;
        if(stopLoss.fill){
            if(url){
                stopLoss.fill.css({'cursor': 'url("' + url + '"), default'});
            } else {
                infChart.util.setCursor(stopLoss.fill, 'move');
                stopLoss.fill.css({'cursor': 'move'});
            }
        }
        if(stopLoss.line){
            if(url){
                stopLoss.line.css({'cursor': 'url("' + url + '"), default'});
            } else {
                infChart.util.setCursor(stopLoss.line, 'move');
                stopLoss.line.css({'cursor': 'move'});
            }
        }
    }

    if(additionalDrawings.takeProfit){
        var takeProfit = additionalDrawings.takeProfit;
        if(takeProfit.fill){
            if(url){
                takeProfit.fill.css({'cursor': 'url("' + url + '"), default'});
            } else {
                infChart.util.setCursor(takeProfit.fill, 'move');
                takeProfit.fill.css({'cursor': 'move'});
            }
        }
        if(takeProfit.line){
            if(url){
                takeProfit.line.css({'cursor': 'url("' + url + '"), default'});
            } else {
                infChart.util.setCursor(takeProfit.line, 'move');
                takeProfit.line.css({'cursor': 'move'});
            }
        }
    }
};

//endregion


