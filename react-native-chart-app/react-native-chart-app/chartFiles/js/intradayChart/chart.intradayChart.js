var infChart = window.infChart || {};

const POINT_INDICATOR_SHAPE = 'downArrowHead';

infChart.IntradayChart = function (id, stockChart, point, settings) {
    this.id = id
    this.dataManager = stockChart.dataManager;
    this.stockChart = stockChart;
    this.point = point;
    this.settings = settings;
};

infChart.IntradayChart.prototype.createHighchartInstance = function (chartId, chartContainer, options) {
    let config = options.config;
    this.container = chartContainer;
    config['chart'].renderTo = chartContainer[0];
    this.intradayChart = new Highcharts.chart(config);
};

infChart.IntradayChart.prototype.destroyIntradayChart = function () {
    let chartId = this && this.stockChart && this.stockChart.id;
    this.id = undefined;
    this.dataManager = undefined;
    this.stockChart = undefined;
    this.point = undefined;
    this.interval = undefined;
    this.currentX = undefined;
    
    this.intradayChart && this.intradayChart.destroy();
    
    if (this.drawinObj) {
        infChart.drawingsManager.removeDrawing(chartId, this.drawinObj.drawingId, true, true);
    }
};

infChart.IntradayChart.prototype.getHistoryData = function () {
    let self = this;
    let stockChart = self.stockChart;
    let dataManager = stockChart.dataManager;
    let symbol = self.stockChart.symbol;
    let mainChartInterval = self._getStockChartInterval();
    let intrachartInterval = self._getIntradayChartInterval(mainChartInterval.key);
    let toDate = dataManager.getGMTTime(self.currentX, dataManager.timeZoneOffset, intrachartInterval);
    let fromDate = dataManager.getGMTTime(self._getFromDate(), dataManager.timeZoneOffset, intrachartInterval);
    let properties = {
        symbol: symbol,
        interval: intrachartInterval,
        fromDate: fromDate,
        toDate: toDate,
        requestWithMinutes: self._isRequestWithMinutes(mainChartInterval.key),
        isIntradayChart: true
    }

    setTimeout(this.dataManager.readHistoryData(properties, self._onHistoryDataLoad, self), 0);
};

infChart.IntradayChart.prototype.hideNoData = function () {
    if (this.noDataLabel) {
        this.noDataLabel.destroy();
        this.noDataLabel = undefined;
    }
}

infChart.IntradayChart.prototype.setChartStyle = function (type) {
    let self = this;
    let stockChart = self.stockChart;
    let stockChartMainSeries = stockChart.getMainSeries();
    let intraChartMainSeries = self._getMainSeries();
    let colorCfg = stockChart.getSeriesOptionsOnChartTypeChange(stockChartMainSeries, type);
    let tempConfig = $.extend({}, colorCfg, {
        type: type
    });
    intraChartMainSeries.update(tempConfig, true);
};

infChart.IntradayChart.prototype.setInterval = function (interval) {
    let self = this;
    let stockChart = self.stockChart;
    let currentInterval = stockChart.getCurrentIntervalOptions(interval);
    self.interval = currentInterval;
    self.setLoading(true);
    self.getHistoryData();
};

infChart.IntradayChart.prototype.setLoading = function (isLoading) {
    let self = this;
    if (isLoading) {
        let loadingHTML = infChart.util.getLoadingMessage();
        $(self.container).mask(loadingHTML);
    } else {
        $(self.container).unmask();
    }
};

infChart.IntradayChart.prototype.showNoData = function () {
    let self = this;
    let stockChart = self.stockChart;
    let chart = self.intradayChart;
    let options = stockChart._getNoDataLabelOptions();
    if (!self.noDataLabel) {
        self.noDataLabel = chart.renderer.label(options.msg, chart.plotWidth / 2, chart.plotHeight / 2, null, null, null, options.useHTML, null, "no-data").attr({
            zIndex: chart.seriesGroup.zIndex - 1
        }).add();
    }
};

infChart.IntradayChart.prototype.setPointIndicator = function (chartId, point) {
    let self = this;
    let stockChart = self.stockChart;
    let pointXvalue = point.x;
    let pointYValue = stockChart.type === 'heikinashi' ? point.xPoint.high : point.high;
    let drawingId =  chartId + '_point_ind';
    let highChart = stockChart.chart;
    let theme = infChart.themeManager.getTheme();
    let fillColor = theme && theme.intradayChart && theme.intradayChart.pointIndicator.fillColor || '#07A7FB';
    let borderColor = theme && theme.intradayChart && theme.intradayChart.pointIndicator.borderColor || '#07A7FB';
    let arrowHeadprops = {
        'shape': POINT_INDICATOR_SHAPE,
        'xValue': pointXvalue,
        'yValue': pointYValue,
        'isDisplayOnly': true,
        'drawingType': infChart.constants.drawingTypes.indicator,
        'drawingId': drawingId,
        'subType': "shape",
        'allowDragX': false,
        'allowDragY': false,
        'fillColor': fillColor,
        'borderColor': borderColor
    };

    self.currentX = pointXvalue;
    if (self.drawinObj) {
        self.drawinObj.update({
            'xValue': pointXvalue,
            'yValue': pointYValue,
        });
    } else {
        let drawing = new infChart.arrowHeadDrawing(drawingId, highChart, POINT_INDICATOR_SHAPE);
        self.drawinObj = infChart.drawingsManager.drawDrawingFromProperties(drawing, highChart, undefined, arrowHeadprops, drawingId);
    }
};

infChart.IntradayChart.prototype._getStockChartInterval = function () {
    let self = this;
    let stockChart = self.stockChart;
    return stockChart.getCurrentIntervalOptions(stockChart.interval);
};

infChart.IntradayChart.prototype._getFromDate = function () {
    let self = this;
    let stockChart = self.stockChart;
    let interval = stockChart.getCurrentIntervalOptions(stockChart.interval);
    let pointDate = self.currentX;
    let fromDate = pointDate - interval.time;
    switch (interval.key) {
        case 'D':
            fromDate = pointDate;
            break;
        default:
            fromDate = pointDate - interval.time;
            break;
    }
    return fromDate;
};

infChart.IntradayChart.prototype._getIntradayChartInterval = function (stockChartInterval) {
    let self = this;
    let interval;
    if (self.interval) {
        interval = self.interval.key;
    } else {
        interval = self._getIntradayChartInitialInterval(stockChartInterval);
    }
    return interval;
};

infChart.IntradayChart.prototype._getIntradayChartInitialInterval = function (mainInterval) {
    let interval = 'D';
    switch (mainInterval) {
        case 'I_2':
            interval = 'I_1';
            break;
        case 'I_3':
            interval = 'I_1';
            break;
        case 'I_5':
            interval = 'I_1';
            break;
        case 'I_10':
            interval = 'I_5';
            break;
        case 'I_15':
            interval = 'I_3';
            break;
        case 'I_30':
            interval = 'I_5';
            break;
        case 'I_60':
            interval = 'I_10';
            break;
        case 'I_120':
            interval = 'I_15';
            break;
        case 'I_240':
            interval = 'I_30';
            break;
        case 'D':
            interval = 'I_60';
            break;
        case 'W':
            interval = 'D';
            break;
        case 'M':
            interval = 'W';
            break;
        default:
            break;
    }
    return interval;
};

infChart.IntradayChart.prototype._getMainSeries = function () {
    return this.intradayChart && this.intradayChart.series && this.intradayChart.series[0];
}

infChart.IntradayChart.prototype._isRequestWithMinutes = function (interval) {
    let isReqWithMinutes = false;
    switch (interval) {
        case 'D':
        case 'W':
            isReqWithMinutes = false;
            break;

        default:
            isReqWithMinutes = true;
            break;
    }
    return isReqWithMinutes;
};

infChart.IntradayChart.prototype._onHistoryDataLoad = function (data, properties) {
    let self = this;
    self.hideNoData();
    if (data.data && data.data.length > 0) {
        self.intradayChart.series[0].visible = true;
        self.intradayChart.series[0].setData(data.data, true);
    } else {
        self.intradayChart.series[0].visible = false;
        self.showNoData();
    }
    self.setLoading(false);
};



