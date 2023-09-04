//region **************************************Breakout Finder Indicator******************************************

/***
 * Constructor for Breakout FInder Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */

infChart.BreakoutFinder = function (id, chartId, type, chartInstance) {
    this.chartId = chartId;
    this.drawings = [];
    this.stockChart = infChart.manager.getChart(chartId);
    this.type = type;
    this.defaultRequestData = {};
    infChart.AdvancedIndicator.apply(this, arguments);
    this.series.push(chartInstance.addSeries({
        id: id,
        name: "label.indicatorDesc.Breakout",
        infIndType: "BREAKOUT",
        infIndSubType: "BREAKOUT",
        type: "plotrange",
        infType: "indicator",
        yAxis: "#0",
        legendKey: "Breakout Finder",
        showInLegend: true,
        hideLegend: false,
    }, false));
};

infChart.util.extend(infChart.AdvancedIndicator, infChart.BreakoutFinder);

infChart.BreakoutFinder.prototype.calculate = function (ohlc, data, redraw) {
    let self = this,
        chart = infChart.manager.getChart(self.chartId).chart;
    if (self.interval !== infChart.manager.getChart(self.chartId).interval) {
        self.interval = infChart.manager.getChart(self.chartId).interval;
        self.defaultRequestData = _getRequestData(this.stockChart, data[0][0]);
        self.loadIndicatorData(self.defaultRequestData, function(data) {
            self.updateDrawings(chart, data, redraw);
        });
    }
};

infChart.BreakoutFinder.prototype.updateDrawings = function(chart, data, redraw) {
    let self = this;
    self.removeDrawings(self.drawings);
    if (self.series && self.series[0] && data.values && data.values != null) {
        infChart.util.forEach(data.values, function (index, indicatorData) {
            let indicatorProps = self.getIndicatorProps(chart, indicatorData);
            let breakoutLine = self.getBreakoutLine(chart, indicatorData, indicatorProps.color);
            breakoutLine.deselect.call(breakoutLine);
            self.drawings.push(breakoutLine);
            let arrowHead = self.getArrowHead(chart, indicatorData, indicatorProps);
            arrowHead.deselect.call(arrowHead);
            self.drawings.push(arrowHead);
        });

        if (!self.series[0].visible) {
            self.hideIndicator(self.series[0].options.id);
        }

        if (redraw) {
            this.chart.redraw();
        }
    }
};

infChart.BreakoutFinder.prototype.getBreakoutLine = function(chart, indicatorData, color) {
    return infChart.drawingUtils.common.indicatorUtils.addRectangle(chart, undefined, {
        indicatorId: this.id,
        drawingId: this.id + '_breakoutRectangle_' + indicatorData.startTs + indicatorData.endTs,
        yValue: indicatorData.startValue,
        xValue: infChart.math.findNearestDataPoint(chart, this.getTimestamp(indicatorData.startTs), undefined, true, true).xData,
        yValueEnd: indicatorData.endValue,
        xValueEnd: infChart.math.findNearestDataPoint(chart, this.getTimestamp(indicatorData.endTs), undefined, true, true).xData,
        fillColor: 'transparent',
        borderColor: color
    });
};

infChart.BreakoutFinder.prototype.getArrowHead = function(chart, indicatorData, indicatorProps) {
    return infChart.indicatorMgr.createIndicatorDrawing(chart, undefined, {
        "shape": indicatorProps.arrowHeadShape,
        "xValue": this.getTimestamp(indicatorData.endTs),
        "yValue": indicatorProps.yValueForArrowHead,
        "isDisplayOnly": true,
        "isIndicator": true,
        "drawingType": infChart.constants.drawingTypes.indicator,
        "indicatorId": this.id,
        "drawingId": this.id + indicatorProps.arrowHeadShape + indicatorData.startTs + indicatorData.endTs,
        "subType": "shape",
        allowDragX: false,
        allowDragY: false,
        fillColor: indicatorProps.color,
        borderColor: indicatorProps.colo
    })
};

infChart.BreakoutFinder.prototype.getTimestamp = function (timestamp) {
    let chart = infChart.manager.getChart(this.chartId),
        interval = chart.interval,
        dataManager = chart.dataManager;
    return dataManager.getChartTime(timestamp, dataManager.getTimeZone(interval), interval);
};

infChart.BreakoutFinder.prototype.loadIndicatorData = function(data, callback) {
    if (_validateRequest(data)) {
        this.stockChart.dataManager.loadBreakoutIndicatorData(data, callback);
    }
};

var _getRequestData = function(chart, from) {
    let data = {
        indicator: {
            type: 'BREAKOUT',
            period : 5,
            maxBreakoutLength : 200,
            minTests : 2,
            thresholdRate : 3
        }
    };
    data.interval = infChart.util.convertIntervalToTimePeriod(chart.interval);
    let instrument = chart.symbol;
    if (instrument && instrument != null) {
        data.instrument = {
            vendor: instrument.provider,
            exchange: instrument.exchange,
            name: instrument.symbol,
            type: instrument.symbolType,
            currency: instrument.currency
        }
    }
    if (_validateXdata(chart)) {
        data.from = new Date(from).toISOString();
    }
    return data;
};

var _validateXdata = function(chart) {
    return chart.chart && chart.chart != null 
        && chart.chart.series && chart.chart.series != null && chart.chart.series.length != 0 
        && chart.chart.series[0].xData && chart.chart.series[0].xData != null;
};

var _validateRequest = function(request) {
    return request && request != null;
};

infChart.BreakoutFinder.prototype.getIndicatorProps = function(chart, indicatorData) {
    let nearestCandleData = infChart.util.getCandleData(chart, 
        infChart.math.findNearestXDataPointIndex(infChart.manager.getTotalPoints(chart), this.getTimestamp(indicatorData.endTs)));
    if (indicatorData.type === 'BULLISH') {
        return {
            color: '#336699',
            arrowHeadShape: 'upArrowHead',
            yValueForArrowHead: nearestCandleData[2]
        };
    } else if (indicatorData.type === 'BEARISH') {
        return {
            color: '#FF4D4D',
            arrowHeadShape: 'downArrowHead',
            yValueForArrowHead: nearestCandleData[1]
        };
    }
};

infChart.BreakoutFinder.prototype.removeDrawings = function (drawings) {
    let self = this,
        drawingItems = drawings,
        drawingCount = drawingItems.length;
    if (drawingCount > 0) {
        for (var i = 0; i <= drawingCount - 1; i++) {
            let drawing = drawingItems[i];
            infChart.drawingsManager.removeDrawing(self.chartId, drawing.drawingId, true, true);
        }
        self.drawings = [];
    }
};

infChart.BreakoutFinder.prototype.getSettingWindowHTML = function () {
    let self = this;
    let inputParams = [];
    inputParams.push({
        key: 'period',
        value: self.defaultRequestData.indicator.period,
        label: infChart.manager.getLabel('label.indicatorParam.period'),
        type: 'number',
        min: 1
    });
    inputParams.push({
        key: 'maxBreakoutLength',
        value: self.defaultRequestData.indicator.maxBreakoutLength,
        label: infChart.manager.getLabel('label.indicatorParam.maxBreakoutLength'),
        type: 'number',
        min: 30,
        max: 300
    });
    inputParams.push({
        key: 'thresholdRate',
        value: self.defaultRequestData.indicator.thresholdRate,
        label: infChart.manager.getLabel('label.indicatorParam.thresholdRate'),
        type: 'number',
        min: 1,
        max: 10
    });
    inputParams.push({
        key: 'minTests',
        value: self.defaultRequestData.indicator.minTests,
        label: infChart.manager.getLabel('label.indicatorParam.minimumNumOfTests'),
        type: 'number',
        min: 1
    });

    let paramSection = infChart.structureManager.indicator.getSeriesParameterSection({}, [], inputParams);

    return infChart.structureManager.settings.getPanelHTML(this.chartId + '-indicator-panel', this.getUniqueId(),
        infChart.manager.getLabel('label.indicatorDesc.Breakout'),
        infChart.structureManager.settings.getPanelBodyHTML([paramSection]));
};

infChart.BreakoutFinder.prototype.bindSettingsContainerEvents = function ($container) {
    let self = this,
        chart = infChart.manager.getChart(self.chartId).chart,
        requestData = self.defaultRequestData;
    $container.find('input[inf-ind-param=period]').on('change', function (e) {
        let element = $container.find('input[inf-ind-param=period]'),
            min = element[0].min,
            max = element[0].max;
        if(self.validateRange(parseFloat(e.target.value), parseFloat(min), parseFloat(max))) {
            requestData.indicator.period = parseFloat(e.target.value);
            self.loadIndicatorData(requestData, function(data) {
                self.updateDrawings(chart, data);
            });
        } else {
            self.setValue(element, parseFloat(e.target.value), parseFloat(min), parseFloat(max));
        }
    });
    $container.find('input[inf-ind-param=maxBreakoutLength]').on('change', function (e) {
        let element = $container.find('input[inf-ind-param=maxBreakoutLength]'),   
            min = element[0].min,
            max = element[0].max;
        if(self.validateRange(parseFloat(e.target.value), parseFloat(min), parseFloat(max))) {
            self.loadIndicatorData(requestData, function(data) {
                requestData.indicator.maxBreakoutLength = parseFloat(e.target.value);
                self.updateDrawings(chart, data);
            });
        } else {
            self.setValue(element, parseFloat(e.target.value), parseFloat(min), parseFloat(max)); 
        }
    });
    $container.find('input[inf-ind-param=thresholdRate]').on('change', function (e) {
        let element = $container.find('input[inf-ind-param=thresholdRate]'),   
            min = element[0].min,
            max = element[0].max;
        if(self.validateRange(parseFloat(e.target.value), parseFloat(min), parseFloat(max))) {
            self.loadIndicatorData(requestData, function(data) {
                requestData.indicator.thresholdRate = parseFloat(e.target.value);
                self.updateDrawings(chart, data);
            });
        } else {
            self.setValue(element, parseFloat(e.target.value), parseFloat(min), parseFloat(max)); 
        }
    });
    $container.find('input[inf-ind-param=minTests]').on('change', function (e) {
        let element = $container.find('input[inf-ind-param=minTests]'),   
            min = element[0].min,
            max = element[0].max;
        if(self.validateRange(parseFloat(e.target.value), parseFloat(min), parseFloat(max))) {
            self.loadIndicatorData(requestData, function(data) {
                requestData.indicator.minTests = parseFloat(e.target.value);
                self.updateDrawings(chart, data);
            });
        } else {
            self.setValue(element, parseFloat(e.target.value), parseFloat(min), parseFloat(max)); 
        }
    });
    
    infChart.structureManager.settings.bindPanel($container, function () {
        infChart.indicatorMgr.removeIndicatorFromSettings(self.chartId, self.id);
    });
};

infChart.BreakoutFinder.prototype.validateRange = function(value, min, max) {
    if (min && max) {
        return value >= min && value <= max;
    } else if (min) {
        return value >= min;
    } else if (max) {
        return value <= max;
    } else {
        return true;
    }
};

infChart.BreakoutFinder.prototype.setValue = function(element, value, min, max) {
    if (value > max) {
        element[0].value = max;
    } else if (value < min ) {
        element[0].value = min;
    } 
};

infChart.BreakoutFinder.prototype.showIndicator = function (seriesId) {
    this.drawings.forEach(function (drawing) {
        drawing.annotation.group.show();
    });

    infChart.Indicator.prototype.showIndicator.apply(this, [seriesId, true]);
};

infChart.BreakoutFinder.prototype.hideIndicator = function (seriesId) {
    this.drawings.forEach(function (drawing) {
        drawing.annotation.group.hide();
    });
    infChart.Indicator.prototype.hideIndicator.apply(this, [seriesId, true]);
};
