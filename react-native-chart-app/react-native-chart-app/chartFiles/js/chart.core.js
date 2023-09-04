/**
 * @typedef {object} symbol
 * @property {string} symbolId - unique key
 * @property {string} symbol - name
 * @property {string} symbolDesc - description
 * @property {string} symbolType - equ, cur
 * @property {string} exchange - exchange
 * @property {string} currency - currency
 * @property {string} provider - provider
 * @property {string} legendLabel - legend label
 * @property {number} dp - decimal places
 * @property lineDataField - ???
 */

/**
 * Created by dushani on 8/26/15.
 * Core features of the stock chart will be handled here.
 * Ex : change symbol, symbol comparison , interval change , zooming etc ..
 */

var infChart = window.infChart || {};
const NO_OF_LAST_PRICE_DECIMAL_POINTS = 2;
const NO_OF_PREVIOUS_PRICE_DECIMAL_POINTS = 2;
const NO_OF_SPECIFIC_DECIMAL_POINTS = 2;

/**
 * This class works as a wrapper to the Highchart's stock chart and it has a reference to the highchart object
 * @param {string} id
 * @param dataManager data manager instance
 * @param {object} settings chart settings
 * @constructor
 */
infChart.StockChart = function (id, dataManager, settings) {
    this.id = id;
    this.dataManager = dataManager;

    this.performanceCheck = {};

    this.updateTicksTimer = undefined;
    this.resizeTimer = undefined;

    this._setDefaultProperties(undefined, settings);

    this.settings = settings;
    this.mockData = settings.mockData;
    this.regularIntervalsOnUpdate = settings.config && settings.config.regularIntervalsOnUpdate || false;
    this.maxPeriodOnIntervalChange = settings.config && settings.config.maxPeriodOnIntervalChange || false;
    this.selfListeners = {};
    this.customGridLineColorEnabled = false;

    var toolbarConfig = settings.toolbar.config;
    if (toolbarConfig) {
        this._setChartTypeStyleOptions(toolbarConfig.chartType);
        this._setMinMaxOptions(toolbarConfig.minMax);
        this._setIntervalOptions(toolbarConfig.interval);
        this._setPeriodOptions(toolbarConfig.period);
        this._initNews(toolbarConfig.news);
    }
};

infChart.StockChart.prototype._printPerformance = function () {
    for (var i in this.performanceCheck) {
        if (this.performanceCheck.hasOwnProperty(i)) {
            console.debug("performance :: " + i + " :: " + this.performanceCheck[i].diff
                + ", startTime :" + this.performanceCheck[i].startTime +
                ", endTime : " + this.performanceCheck[i].endTime);
            delete this.performanceCheck[i];
        }

    }
};

infChart.StockChart.prototype.name = function () {
    return "infChart.StockChart >" + this.id;
};

infChart.StockChart.prototype.isFirstLoadInprogress = function () {
    return this.isfirstLoad;
};

infChart.StockChart.prototype._setDefaultProperties = function (isReset, settings) {
    this.chartId = undefined;
    this.chart = undefined;
    this.mouseWheelController = undefined;
    this.symbol = undefined;
    this.useGrouping = false;

    this.period = 'Y_1';
    this.candleCountEnable = true;
    this.customCandleCount = 40;
    this.interval = 'D';
    this.pinInterval = false;
    this.type = 'candlestick';
    this.prevChartStyle = 'candlestick';
    this.isStyleChangedByForce = false;
    this.isGloballyLocked = false;

    this.isCompare = false;
    this.isLog = false;
    this.isPercent = false;
    this.orderBookHistory = false;
    this.regularIntervalsOnUpdate = false;
    this.fixedIntervalOnPeriodChange = false;
    this.maxPeriodOnIntervalChange = true;

    this.volume = false;
    this.bidAskHistory = false;

    this.compareSymbols = {count: 0, symbols: {}, idMap: {}};
    this.indicatorSymbols = {count: 0, symbols: {}, idMap: {}};

    this.indicatorFrameHeight = 0;//total height of indicatorsDissimilerToBaseAxes axes

    this.data = {compare: {}, base: [], indicator: {}};
    this.dataMap = {compare: {}, base: {}, indicator: {}};
    this.rangeData = {data: [], ohlcv: {}, compareData: {}, compareOHLCV: {}, indicatorData:{}, indicatorOHLCV:{}};
    this.rawData = {base: {}, compare: {}, indicator: {}};
    this.seriesActualMinMax = {};

    this.processedData = {
        type: 'normal', // normal, log, percent
        data: [],
        isCompare: false,
        ohlcv: {o: [], h: [], l: [], c: [], v: [], b: [], a: [], ah: [], bl: []},
        compareSymbols: {},
        timeMap: {},
        pointPositions: []
    };

    this.rangeSelector = false;
    this.colorIndex = 0;
    this.crosshair = {enabled: true, type: "all"};
    this.ticks = {};
    this.loading = 0;
    this.tooltip = false;
    this.hasLastLine = false;
    this.enabledLastLine = false;
    this.enabledLastLabel = false;
    this.enableBarClosure = false;
    this.bidAskLineEnabled = false;
    this.bidAskLabelsEnabled = false;
    this.hasLastLineForCompareSymbols = false;
    this.lastLabelForCompareSymbols = {};
    this.settingsPopups = {};
    this.isFavoriteEnabled = true;

    this.minMax = {enabled: false, minField: 'low', maxField: 'high'};

    if (settings && settings.config) {
        this.sessionTimeBreakSettings = settings.config.sessionTimeBreakSettings;
    }

    if (!isReset) {

        this.styleTypes = {
            "default": ["candlestick", "ohlc", "line", "area", "column", "hlc"],
            compare: ["candlestick", "ohlc", "line", "area", "column", "hlc"]
        };
        this.chartStyleOptions = {};
        this.intervalOptions = {
            //"T": {grouping: false, maxPeriod: 'D_1', intraday: true},
            "I_1": {grouping: false, maxPeriod: 'M_1', intraday: true, time: 60000},
            "I_2": {grouping: false, maxPeriod: 'M_1', intraday: true, time: 60000 * 2},
            "I_3": {grouping: false, maxPeriod: 'M_1', intraday: true, time: 60000 * 3},
            "I_5": {grouping: false, maxPeriod: 'M_3', intraday: true, time: 60000 * 5},
            "I_10": {grouping: false, maxPeriod: 'M_3', intraday: true, time: 60000 * 10},
            "I_15": {grouping: false, maxPeriod: 'M_3', intraday: true, time: 60000 * 15},
            "I_30": {grouping: false, maxPeriod: 'M_3', intraday: true, time: 60000 * 30},
            "I_60": {grouping: false, maxPeriod: 'M_3', intraday: true, time: 60000 * 60},
            "I_120": {grouping: false, maxPeriod: 'M_3', intraday: true, time: 60000 * 120},
            "I_240": {grouping: false, maxPeriod: 'M_3', intraday: true, time: 60000 * 240},
            "I_360": {grouping: false, maxPeriod: 'M_3', intraday: true, time: 60000 * 360},
            "I_480": {grouping: false, maxPeriod: 'M_3', intraday: true, time: 60000 * 480},
            "I_720": {grouping: false, maxPeriod: 'M_3', intraday: true, time: 60000 * 720},
            "D": {grouping: false, time: 60000 * 60 * 24},
            "D_3": {grouping: false, time: 60000 * 60 * 24 * 3},
            "W": {grouping: false, time: 60000 * 60 * 24 * 7},
            "M": {grouping: false, time: 60000 * 60 * 24 * 30},
            "Y": {grouping: false, time: 60000 * 60 * 24 * 30 * 365}
        };
        this.periodOptions = {
            "I": {
                key: "I",
                desc: "Intraday",
                shortDesc: 'I',
                label: 'label.periods.I',
                shortLabel: 'label.periodShort.I',
                defaultInterval: "T" /*,
                 intervals: ["T", "I_1", "I_5", "I_15", "I_30", "I_60", "I_120", "I_240"] */
            },
            "I_H_1": {
                key: "I_H_1",
                desc: "1 Hour",
                shortDesc: '1H',
                label: 'label.periods.I_H_1',
                categoryDefault: true,
                shortLabel: 'label.periodShort.I_H_1',
                defaultInterval: "I_1"/*,
                 intervals : ["T", "I_1","I_5","I_15","I_30","I_60","I_120","I_240"]*/,
                category: "H"
            },
            "I_H_2": {
                key: "I_H_2",
                desc: "2 Hours",
                shortDesc: '2H',
                label: 'label.periods.I_H_2',
                shortLabel: 'label.periodShort.I_H_2',
                defaultInterval: "I_1"/*,
                 intervals : ["T", "I_1","I_5","I_15","I_30","I_60","I_120","I_240"]*/,
                category: "H"
            },
            "I_H_3": {
                key: "I_H_3",
                desc: "3 Hours",
                shortDesc: '3H',
                label: 'label.periods.I_H_3',
                shortLabel: 'label.periodShort.I_H_3',
                defaultInterval: "I_1"/*,
                 intervals : ["T", "I_1","I_5","I_15","I_30","I_60","I_120","I_240"]*/,
                category: "H"
            },
            "I_H_4": {
                key: "I_H_4",
                desc: "4 Hours",
                shortDesc: '4H',
                label: 'label.periods.I_H_4',
                shortLabel: 'label.periodShort.I_H_4',
                defaultInterval: "I_1"/*,
                 intervals : ["T", "I_1","I_5","I_15","I_30","I_60","I_120","I_240"]*/,
                category: "H"
            },
            "I_H_6": {
                key: "I_H_6",
                desc: "6 Hours ",
                shortDesc: '6H',
                label: 'label.periods.I_H_6',
                shortLabel: 'label.periodShort.I_H_6',
                defaultInterval: "I_3"/*,
                 intervals : ["T", "I_1","I_5","I_15","I_30","I_60","I_120","I_240"]*/,
                category: "H"
            },
            "I_H_8": {
                key: "I_H_8",
                desc: "8 Hours ",
                shortDesc: '8H',
                label: 'label.periods.I_H_8',
                shortLabel: 'label.periodShort.I_H_8',
                defaultInterval: "I_3"/*,
                 intervals : ["T", "I_1","I_5","I_15","I_30","I_60","I_120","I_240"]*/,
                category: "H"
            },
            "I_H_12": {
                key: "I_H_12",
                desc: "12 Hours",
                shortDesc: '12H',
                label: 'label.periods.I_H_12',
                shortLabel: 'label.periodShort.I_H_12',
                defaultInterval: "I_3"/*,
                 intervals : ["T", "I_1","I_5","I_15","I_30","I_60","I_120","I_240"]*/,
                category: "H"
            },
            "I_H_16": {
                key: "I_H_16",
                desc: "16 Hours",
                shortDesc: '16H',
                label: 'label.periods.I_H_16',
                shortLabel: 'label.periodShort.I_H_16',
                defaultInterval: "I_3"/*,
                 intervals : ["T", "I_1","I_5","I_15","I_30","I_60","I_120","I_240"]*/,
                category: "H"
            },
            "I_D_1": {
                key: "I_D_1",
                desc: "1 Day",
                shortDesc: '1D',
                label: 'label.periods.I_D_1',
                categoryDefault: true,
                shortLabel: 'label.periodShort.I_D_1',
                defaultInterval: "I_3"/*,
                 intervals : ["T", "I_1","I_5","I_15","I_30","I_60","I_120","I_240"]*/,
                category: "D"
            },
            "I_D_2": {
                key: "I_D_2",
                desc: "2 Days",
                shortDesc: '2D',
                label: 'label.periods.I_D_2',
                shortLabel: 'label.periodShort.I_D_2',
                defaultInterval: "I_5"/*,
                 intervals : ["T", "I_1","I_5","I_15","I_30","I_60","I_120","I_240"]*/,
                category: "D"
            },
            "I_D_3": {
                key: "I_D_3",
                desc: "3 Days",
                shortDesc: '3D',
                label: 'label.periods.I_D_3',
                shortLabel: 'label.periodShort.I_D_3',
                defaultInterval: "I_5"/*,
                 intervals : ["T", "I_1","I_5","I_15","I_30","I_60","I_120","I_240"]*/,
                category: "D"
            },
            "W_1": {
                key: "W_1",
                desc: "1 Week",
                shortDesc: '1W',
                label: 'label.periods.W_1',
                categoryDefault: true,
                shortLabel: 'label.periodShort.W_1',
                defaultInterval: "I_15"/*,
                 intervals : ["T", "I_1","I_5","I_15","I_30","I_60","I_120","I_240"]*/,
                category: "W"
            },
            "W_2": {
                key: "W_2",
                desc: "2 Weeks",
                shortDesc: '1W',
                label: 'label.periods.W_2',
                shortLabel: 'label.periodShort.W_2',
                defaultInterval: "I_30"/*,
                 intervals : ["T", "I_1","I_5","I_15","I_30","I_60","I_120","I_240"]*/,
                category: "W"
            },
            "W_3": {
                key: "W_3",
                desc: "3 Weeks",
                shortDesc: '3W',
                label: 'label.periods.W_3',
                shortLabel: 'label.periodShort.W_3',
                defaultInterval: "I_240"/*,
                 intervals : ["T", "I_1","I_5","I_15","I_30","I_60","I_120","I_240"]*/,
                category: "W"
            },
            "M_1": {
                key: "M_1",
                desc: "1 Month",
                shortDesc: '1M',
                shortLabel: 'label.periodShort.M_1',
                categoryDefault: true,
                label: 'label.periods.M_1',
                defaultInterval: "D"/*,
                 intervals : [ "I_1","I_5","I_15","I_30","I_60","I_120","I_240","D","W","M"]*/,
                category: "M"
            },
            "M_2": {
                key: "M_2",
                desc: "2 Month",
                shortDesc: '2M',
                shortLabel: 'label.periodShort.M_2',
                categoryDefault: false,
                label: 'label.periods.M_2',
                defaultInterval: "D"/*,
                 intervals : [ "I_1","I_5","I_15","I_30","I_60","I_120","I_240","D","W","M"]*/,
                category: "M"
            },
            "M_3": {
                key: "M_3",
                desc: "3 Months",
                shortDesc: '3M',
                label: 'label.periods.M_3',
                shortLabel: 'label.periodShort.M_3',
                defaultInterval: "D"/*,
                 intervals : [ "I_5","I_15","I_30","I_60","I_120","I_240","D","W","M"]*/,
                category: "M"
            },
            "M_6": {
                key: "M_6",
                desc: "6 Months",
                shortDesc: '6M',
                label: 'label.periods.M_6',
                shortLabel: 'label.periodShort.M_6',
                defaultInterval: "D"/*,
                 intervals : [  "I_5","D","W","M"]*/,
                category: "M"
            },
            "M_8": {
                key: "M_8",
                desc: "8 Months",
                shortDesc: '8M',
                label: 'label.periods.M_8',
                shortLabel: 'label.periodShort.M_8',
                defaultInterval: "D"/*,
                 intervals : [  "I_5","D","W","M"]*/,
                category: "M"
            },
            "M_10": {
                key: "M_10",
                desc: "10 Months",
                shortDesc: '10M',
                label: 'label.periods.M_10',
                shortLabel: 'label.periodShort.M_10',
                defaultInterval: "D"/*,
                 intervals : [  "I_5","D","W","M"]*/,
                category: "M"
            },
            "Y_1": {
                key: "Y_1",
                desc: "1 Year",
                shortDesc: '1Y',
                label: 'label.periods.Y_1',
                categoryDefault: true,
                shortLabel: 'label.periodShort.Y_1',
                defaultInterval: "D"/*,
                 intervals : [ "D","W","M"]*/,
                category: "Y"
            },
            "Y_2": {
                key: "Y_2",
                desc: "2 Years",
                shortDesc: '2Y',
                label: 'label.periods.Y_2',
                shortLabel: 'label.periodShort.Y_2',
                defaultInterval: "D"/*,
                 intervals : [ "D","W","M"]*/,
                category: "Y"
            },
            "Y_3": {
                key: "Y_3",
                desc: "3 Years",
                shortDesc: '3Y',
                label: 'label.periods.Y_3',
                shortLabel: 'label.periodShort.Y_3',
                defaultInterval: "D"/*,
                 intervals : [ "D","W","M"]*/,
                category: "Y"
            },
            "Y_5": {
                key: "Y_5",
                desc: "5 Years",
                shortDesc: '5Y',
                label: 'label.periods.Y_5',
                shortLabel: 'label.periodShort.Y_5',
                defaultInterval: "D"/*,
                 intervals : [ "D","W","M"]*/,
                category: "Y"
            },
            "Y_10": {
                key: "Y_10",
                desc: "10 Years",
                shortDesc: '10Y',
                label: 'label.periods.Y_10',
                shortLabel: 'label.periodShort.Y_10',
                defaultInterval: "D"/*,
                 intervals : [ "D","W","M"]*/,
                category: "Y"
            }

        };
        this.news = {enabled: false};
        this.flags = {enabled: [], types: {}};
        this.flagTypes = [];
        this.isfirstLoad = true;
    }

    //this.ohlcv = {o: [], h: [], l: [], c: [], v:[]};
    this.prevousClose = {};
    this.lastLabel = undefined;
    this.preCloseLabel = undefined;
    this.lastLine = undefined;
    this.preCloseLine = undefined;

    this.gridType = 'none';
    this.seriesColorOptions = {};
    //this.fsListeners = (this.fsListeners) ? this.fsListeners : { exit: [], enter: [] };

    this.recalStart = {}; // This is a hash map with the key of seriesId which keep the index to start recalculating of the series.
};

infChart.StockChart.prototype.getContainer = function () {
    this.container = this.container || document.body.querySelector("[inf-unique-id='" + this.id + "']");
    return this.container;
};

infChart.StockChart.prototype.createHighchartInstance = function (chartId, chartContainer, config, settings) {
    var hasEmpty = false, dummyIds = [];

    config.chart.renderTo = chartContainer;
    config.chart.infContainer = this.id;
    config.chart.infChart = true;
    config.chart.infScalable = settings.config.scalable;
    config.navigator.enabled = settings.config.navigator;
    var chartH = chartContainer.offsetHeight;
    config.navigator.height = (chartH) ? infChart.util.getNavigatorHeight(chartH, config) :
        settings.config.navigatorHeight ? settings.config.navigatorHeight : config.navigator.height;


    // copy the plot options of the main yAxis to all indicator yAxis
    infChart.util.forEach(config.yAxis, function (index, axis) {
        $.extend(axis, config.plotOptions.yAxis);
    });

    //// set empty data
    infChart.util.forEach(config.series, function (index, series) {

        if (series.infType == 'base') {
            series.infRefresh = settings.config.refreshBtn;
        } else if (series.infType == 'dummy') {
            hasEmpty = true;
            dummyIds.xPush(series.id);
        }

        if (!series.data) {
            $.extend(series, {data: []});
        }
        series.infHideClose = settings.config.hideClose;
        series.infHideSettings = typeof settings.config.hideSettings !== 'undefined' ? settings.config.hideSettings : false;
    });


    if (settings.config.displayAllIntervals && dummyIds.indexOf(infChart.constants.dummySeries.missingId) < 0) {
        config.series.xPush(infChart.util.getDummySeriesConfig(infChart.constants.dummySeries.missingId));
    }

    if (settings.config.panToFuture && dummyIds.indexOf(infChart.constants.dummySeries.forwardId) < 0) {
        config.series.xPush(infChart.util.getDummySeriesConfig(infChart.constants.dummySeries.forwardId));
    }

    if (settings.config.panToPast && dummyIds.indexOf(infChart.constants.dummySeries.backwardId) < 0) {
        config.series.xPush(infChart.util.getDummySeriesConfig(infChart.constants.dummySeries.backwardId));
    }

    this.chart = new Highcharts.StockChart(config);
    this.chartId = chartId;
    this.destroyed = false;
    this.chart.infScaleX = 1;
    this.chart.infScaleY = 1;

    this.setMouseWheel(settings.config.mouseWheelController);
};

infChart.StockChart.prototype.setMouseWheel = function (enable) {
    if (enable) {
        var mouseWheelController = new infChart.MouseWheelController(this.chart);
        mouseWheelController.initialize();
        this.mouseWheelController = mouseWheelController;
    } else {
        if (this.mouseWheelController) {
            this.mouseWheelController.destroy();
            this.mouseWheelController = undefined;
        }
    }
};

/**
 * @Deprecated
 * @returns {*}
 */
infChart.StockChart.prototype.getChartContainer = function () {
    return $("#" + this.chartId)[0];
};

infChart.StockChart.prototype._setIntervalOptions = function (config) {
    if (config && config.options) {
        var chart = this,
            displayIntervals = [],
            count = 0;

        infChart.util.forEach(config.options, function (key, val) {
            chart.intervalOptions[val.key] = $.extend({time: 0}, chart.intervalOptions[val.key], val);
            displayIntervals[count] = chart.intervalOptions[val.key];
            count++;
        });


        function compare(a, b) {
            if (a.time < b.time)
                return -1;
            if (a.time > b.time)
                return 1;
            return 0;
        }

        this.sortedIntervals = displayIntervals.sort(compare);
    } else {
        this.sortedIntervals = [];
    }
};

infChart.StockChart.prototype._setPeriodOptions = function (config) {
    if (config && config.options) {

        var chart = this,
            periodTime,
            displayIntervals = [],
            displayArr = config.display && config.display.split(","),
            count = 0;

        infChart.util.forEach(config.options, function (key, val) {
            if (!displayArr || displayArr.indexOf(val.key) >= 0) {
                periodTime = chart._getPeriodTime(val.key);
                chart.periodOptions[val.key] = $.extend({time: 0}, chart.periodOptions[val.key], val, {time: periodTime});
                displayIntervals[count] = chart.periodOptions[val.key];
                count++;
            }
        });

        function compare(a, b) {
            if (a.time < b.time)
                return -1;
            if (a.time > b.time)
                return 1;
            return 0;
        }

        this.sortedPeriods = displayIntervals.sort(compare);
    } else {
        this.sortedPeriods = [];
    }
};

infChart.StockChart.prototype._setMinMaxOptions = function (config) {
    if (config) {
        var chart = this;
        infChart.util.forEach(config, function (key, val) {
            chart.minMax[key] = val;
        });
    }
};

infChart.StockChart.prototype._setChartTypeStyleOptions = function (config) {
    var chartObj = this;
    if (config && config.options) {
        chartObj.styleTypes["default"] = $.map(config.options,
            function (value) {
                chartObj.chartStyleOptions[value["key"]] = value;
                return value["key"];
            }
        );
    }
};

infChart.StockChart.prototype.getCurrentIntervalOptions = function (interval) {
    return this.intervalOptions[interval];
};

infChart.StockChart.prototype._isIntraday = function (interval) {
    return (this.intervalOptions[interval] && this.intervalOptions[interval].intraday);
};

infChart.StockChart.prototype.isShortPeriod = function (period) {
    return (period == 'I' || period.indexOf("I_") == 0);
};

infChart.StockChart.prototype.getIntervalOption = function (interval) {
    return this.intervalOptions[interval];
};

infChart.StockChart.prototype.getMainSeries = function () {
    return this.chart && this.chart.series && this.chart.series[0];
};

infChart.StockChart.prototype.getSeriesCompareValue = function (series) {
    return series.compareValue ? series.compareValue : series.dataModify && series.dataModify.compareValue ? series.dataModify.compareValue : 0;
};

infChart.StockChart.prototype.getMainYAxis = function () {
    var mainSeries = this.getMainSeries();
    return mainSeries && mainSeries.yAxis;
};

infChart.StockChart.prototype.getMainXAxis = function () {
    var mainSeries = this.getMainSeries();
    return mainSeries && mainSeries.xAxis;
};

infChart.StockChart.prototype.isIndicatorAxis = function (axis) {
    return axis && axis.options && axis.options.infAxisType && axis.options.infAxisType === "indicator";
};

infChart.StockChart.prototype.isMainSeries = function (series) {
    var mainSeries = this.getMainSeries();
    return series && mainSeries && series.options.id === mainSeries.options.id;
};

infChart.StockChart.prototype.getSeriesData = function (series, isProcessed) {
    var data;
    switch (series.options.infType) {
        case 'base':
            if (isProcessed) {
                data = this.processedData.data;
            } else {
                data = this.rangeData.data;
            }
            break;
        case 'compare':
            if (isProcessed) {
                data = this.processedData.compareSymbols[series.options.id];
            } else {
                data = this.rangeData.compareData[series.options.id];
            }
            break;
        default:
            break;
    }
    return data;
};

infChart.StockChart.prototype.getCompareSeriesFromId = function (seriesId) {
    return this.chart.get(seriesId);
};

/**
 * check data is available in given range
 * @param  {Number} dataMin
 * @param  {Number} dataMax
 * @private
 */
infChart.StockChart.prototype._isDataAvailableInRange = function (dataMin, dataMax) {
    var _d = this.data.base;
    var rangeData = [];
    var dataRangeMin = parseInt(dataMin);
    var dataRangeMax = parseInt(dataMax);
    var isDataAvailable = false;

    if (dataRangeMin != 0 && dataRangeMax != 0) {
        infChart.util.forEach(_d, function (i, val) {
            if (val[0] >= dataRangeMin || val[0] <= dataRangeMax) {
                isDataAvailable = true;
                return;
            }
        });
    }

    return isDataAvailable;
};

/**
 * Method to set base chart symbol
 * @param {object} symbolProperties symbol properties object
 * @param {boolean} load get history
 * @param {boolean} redraw redraw
 * @param config compareSymbols - comparison symbols, indicators - indicator series, drawings - drawing items
 */
infChart.StockChart.prototype.setSymbol = function (symbolProperties, load, redraw, config, setDefaultChartSettings) {
    let yAxis = this.getMainYAxis();

    if (yAxis.crossLabel) {
        yAxis.crossLabel.destroy();
    }
    if (yAxis.crossAlertLabel) {
        yAxis.crossAlertLabel.destroy();
    }

    if (this.symbol && this.checkEquivalentSymbols(this.symbol, symbolProperties)) {
        console.log("Same symbol is sent to 'setSymbol'");
        return;
    }

    var previousSymbol, hChart = this.chart, mainSeries = this.getMainSeries();

    //remove all popups
    infChart.structureManager.common.closeAllPopups(this.id);
    infChart.structureManager.settings.hideAllSettingsPopups(true);

    if (this.symbol) {
        previousSymbol = $.extend({}, this.symbol);
        this.removeSeriesFromTimeMap(mainSeries.options.id);
    }
    //initialize private properties
    this.symbol = symbolProperties;
    this.dp = !isNaN(symbolProperties.dp) ? symbolProperties.dp : this.settings.config.defaultDp;
    this.marketOpenDetails = this.dataManager.getMarketOpenTimes(symbolProperties);

    if (typeof redraw == 'undefined') {
        redraw = false;
    }

    /**
     * clear last line & previous close
     */
    if (this.hasLastLine) {
        this._removeLastLine(true);
        this.hasLastLine = config ? !!config.last : true;
    }

    if(this.enableBarClosure){
        this._removeBarClosureLabel();
        this.enableBarClosure = config ? !!config.enableBarClosure : true;
    }

    if (this.bidAskLineEnabled) {
        this._removeBidAskLines();
        this.bidAskLineEnabled = true;
    }

    if (this.bidAskLabelsEnabled) {
        this._removeBidAskLabels();
        this.bidAskLabelsEnabled = true;
    }

    if (this.hasPreviousCloseLine) {
        this._removePreviousCloseLine(false, true);
        this.hasPreviousCloseLine = config ? !!config.preClose : true;
    }

    /**
     * clear navigator series
     */
    this._cleanNavigatorSeries(false, []);

    config = config || {};

    if (infChart.indicatorMgr && !config.setProperties) {
        infChart.indicatorMgr.resetIndicators(this.id, false);
    }

    if (config.setProperties) {
        var that = this;

        that.removeAllIndicators(false);

        infChart.util.forEach(that.compareSymbols.idMap, function (id, symbol) {
            that.removeCompareSymbol(symbol);
        });


        if (!config.isManualInterval) {

            //overwritten the config to set the best fitting interval for the period
            if(config.period == "C") {
                this.range = config.range ? config.range : {};
            }
            var interval = config.interval ? config.interval : this.getMinInterval(config.period);

            if (interval) {
                var intervalOptions = this.intervalOptions[interval],
                    settingsIntervalOptions = this.intervalOptions[config.interval];
                if (!settingsIntervalOptions || (config.fixedIntervalOnPeriodChange && settingsIntervalOptions.time < intervalOptions.time) ||
                    (!config.fixedIntervalOnPeriodChange && settingsIntervalOptions.time != intervalOptions.time)) {
                    config.interval = interval;
                }
            }
        } else {
            //overwritten the config to set the best fitting period for the interval
            config.period = this._getBestPeriod(config.interval, config.period);
        }
        that.seriesColorOptions = {};
        that._setProperties(config, setDefaultChartSettings);
    }

    this.getMainXAxis().update({
        ordinal: !this.isLinearData()
    }, false);

    mainSeries.update({
        data: [],
        name: symbolProperties.symbol,
        title: symbolProperties.symbolDesc,
        infLegendLabel: this._getSymbolDisplayName(symbolProperties),
        symbolType: symbolProperties.symbolType,
        infLineDataField: symbolProperties.lineDataField,
        dp: !isNaN(symbolProperties.dp) ? symbolProperties.dp : this.settings.config.defaultDp,
        type: this.type,
        hasColumnNegative: false,
        showInNavigator: true
    }, redraw); // clear

    //redraw water mark before set properties : CCA-2794
    hChart.options.watermark = this.getWatermarkContent();

    //this is fired before data is loaded
    this._fireEventListeners('setSymbol', [this.symbol, previousSymbol, config]);

    if (load) {
        if (config.userExtremes && (config.userExtremes.xAxis || config.userExtremes.yAxis)) {
            if (config.userExtremes.xAxis && config.userExtremes.xAxis.userMin && config.userExtremes.xAxis.userMax) {
                this.setXAxisExtremes(config.userExtremes.xAxis.userMin, config.userExtremes.xAxis.userMax, false, true);
            }

            if (config.userExtremes.yAxis && config.userExtremes.yAxis.userMin && config.userExtremes.yAxis.userMax) {
                this.setUserDefinedYAxisExtremes(config.userExtremes.yAxis.userMin, config.userExtremes.yAxis.userMax, false);
            }
        } else {
            //reset user extremes
            this.defaultXAxisExtremes = undefined;
            this.resetXAxisExtremesToDefault(false);
            this.resetYAxisExtremes(false);
        }

        //this.isManualPeriod = true;
        if (config.mainSeriesOptions) {
            this._setSeriesProperties(mainSeries, config.mainSeriesOptions, redraw);
        }

        this._loadHistory(config.compareSymbols, config.indicators, config.drawings, config.flags, undefined, config.range, undefined, config.noData, config.compareSeriesOptions, config.requestColums);
    }

    if(this.settingsPopups[mainSeries.options.id]){
        this.settingsPopups[mainSeries.options.id].remove();
        delete this.settingsPopups[mainSeries.options.id];
    }

    this._loadSettingWindow(!this.isRightPanelOpen(), {'seriesId': mainSeries.options.id});
    if (config.selectedSettingTabOptions && config.selectedSettingTabOptions.tabId) {
        this.showRightPanelWithTab(config.selectedSettingTabOptions.tabId);
        this.showActiveSctionInRightPanel(config.selectedSettingTabOptions.tabId, config.selectedSettingTabOptions.activeTabPaneIndex);
    }
};

///**
// * @Deprecated
// * with the new highcharts api, multiple navigator series available.
// * so chart.series[i].name.toLowerCase() == 'navigator' logic is not valid
// * use _cleanNavigatorSeries
// * Reset navigator series when setting new symbol to chart.
// * @param redraw
// */
//infChart.StockChart.prototype.resetNavigator = function (redraw) {
//    var chart = this.chart;
//    var seriesLength = chart.series.length;
//    var navigatorSeries;
//
//    for (var i = 0; i < seriesLength; i++) {
//        if (chart.series[i].name.toLowerCase() == 'navigator') {
//            navigatorSeries = chart.series[i];
//            break;
//        }
//    }
//
//    if (navigatorSeries) {
//        navigatorSeries.setData([], redraw, false, false);
//    }
//};

/**
 * Get history data from data manager ( Asynchronous data loading )
 */
infChart.StockChart.prototype._loadHistory = function (compareSymbols, indicators, drawings, flags, isReload, range, data, noData, compareSeriesOptions, requestColums, isIntervalChange) {

    if (this._isCustomPeriod() && range) {
        range.toDate = undefined;
    } else {
        range = undefined;
    }
    var intervalOptions = this.getCurrentIntervalOptions(this.interval);

    var properties = {
        symbol: this.symbol,
        interval: this.interval,
        reload: isReload,
        mockData: this.mockData,
        fromDate: range && range.fromDate,
        maxPeriod: intervalOptions ? intervalOptions.maxPeriod : undefined,
        toDate: range && range.toDate,
        data: data || this.symbol.data,
        noData: noData,
        regularIntervalsOnUpdate: this.regularIntervalsOnUpdate,
        requestColums: requestColums,
        isIntervalChange: isIntervalChange
    };

    this.range = range || {};
    this.cleanBaseSymbolData();

    if (compareSymbols) {
        properties.compareSymbols = compareSymbols;
        properties.compareSeriesOptions = compareSeriesOptions;
    }
    if (indicators) {
        properties.indicators = indicators;
    }
    if (drawings) {
        properties.drawings = drawings;
    }
    if (flags) {
        properties.flags = flags;
        if (this.flags.enabled.length > 0) {
            this.toggleFlags();
        }
    }
    this.setLoading(true);
    //this.chart.redraw();
    setTimeout(this.dataManager.readHistoryData(properties, this._onReadHistoryDataLoad, this), 0);
};

infChart.StockChart.prototype.cleanBaseSymbolData = function () {
    this.data.base = [];
    this.dataMap.base = {};
    this.symbol.data = undefined;
    this.rawData.base = {};

    //clean processed data to recalculate again and set fresh data set
    this.rangeData.data = [];
    this.rangeData.ohlcv = {};
    this.processedData.data = [];
    this.processedData.ohlcv = {};
    this.recalStart = {};
};

/**
 * Update the chart with given set of data
 * works as a callback function which executes after retrieving data
 * @param data
 * @param properties
 */
infChart.StockChart.prototype._onReadHistoryDataLoad = function (data, properties) {
    var onReadHistoryDataLoad = (new Date()).getTime();
    //todo : should we check destroyed property instead of chart??
    if (this.chart && !this.destroying && data.data && this.checkEquivalentSymbols(this.symbol, properties.symbol) && data.interval == this.interval) {
        try {

            if (data.data.length > 0) {
                console.debug("chart :: onReadHistoryDataLoad : start time - " + new Date(data.data[0][0]) + ", end time - " + new Date(data.data[data.data.length - 1][0]));
                console.debug(data);
            }
            this.cleanBaseSymbolData();
            this.data.base = data.data;
            this.dataMap.base = data.dataMap;
            this.symbol.data = undefined;

            this.rawData.base = data;


            //var manual = this.isManualPeriod;
            //this.chart.infManualExtreme = false; // Extremes need to be reset since a new data set is set to the chart.
            var cType = this.type;
            if(this.isStyleChangedByForce) {
                this.isStyleChangedByForce = false;
                this.setChartStyle(this.prevChartStyle, false, false);
                this.prevChartStyle = undefined;
            }
            if (this._isOHLCRequired() && data.hasOpenHighLow === false) {
                this.prevChartStyle = this.type;
                this.isManualChartType = false;
                cType = 'line';
                this.isStyleChangedByForce = true;
                this.setChartStyle('line', false, false); // in here isPropertyChange value sends as false to prevent adding changes to the undo/redo stack.
            }
            this._onPropertyChange("onHistoryDataLoad_type", {
                type: cType,
                interval: this.interval
            }); // fire a property change manually to avoid the issue IT-2185

            infChart.structureManager.legend.cleanSeriesData(this.id, this.getMainSeries().options.id, "base");

            this.setPeriod(this.period, this.isManualPeriod, false, undefined, false, false, properties.isIntervalChange);
            this.isManualPeriod = false;
            this.isManualInterval = false;

            var that = this;

            if (properties) {
                if (properties.compareSymbols && properties.compareSymbols.length > 0) {
                    var i = 0, len = properties.compareSymbols.length;
                    for (i; i < len; i++) {
                        var symbol = properties.compareSymbols[i];
                        if (symbol.symbolId) {
                            var compareSeriesOptions = {};
                            if (properties.compareSeriesOptions && properties.compareSeriesOptions.length > 0) {
                                compareSeriesOptions = properties.compareSeriesOptions[i];
                            }
                            that.addCompareSymbol(symbol, { 'seriesOptions': compareSeriesOptions, 'range': that.range }, false);
                        }
                    }
                }

                var iCount = properties && properties.indicators ? properties.indicators.length : 0;
                if (iCount > 0) {
                    var redrawOnIndicator = !this.volume;
                    infChart.util.forEach(properties.indicators, function (i, val) {
                        iCount--;
                        if (!that._isSingletonIndicator(val.type)) {
                            // since volume property of the config handles the volume,
                            // removed the code changing that property dynamically if not can't off the volume from config when it is saved in indicators
                            try {
                                that.addIndicator(val.type, val, (iCount === 0 && redrawOnIndicator), false);
                            }
                            catch (x) {
                                infChart.util.console.error('error in adding indicator : ' + x);
                            }
                        }
                    });
                }
                if(properties.isIntervalChange){
                    var indicators = infChart.indicatorMgr.getIndicators(infChart.manager.getContainerIdFromChart(this.chartId));
                    infChart.util.forEach(indicators, function (i, val) {
                        if(infChart.indicatorMgr.isBlockFromMainSeriesUpdateIndicator(val)){
                            var indData = that.getDataForIndicators(val),
                            baseData = indData.base && indData.base.ohlcv && indData.base;
                            that.updateIndicatorData(baseData, val, undefined, indData);
                        }
                    });
                }

                if (properties.flags) {
                    this.flagTypes = properties.flags;
                    this.toggleFlags();
                }
            }

            this.setVolume(!!this.volume, false, false);
            this.setBidAskHistory(!!this.bidAskHistory, false, false);
            this.setSpread(!!this.spread, false, false);

            if (this.extremes) {//todo : check with below if loop
                // this.setRange(this.extremes.min, this.extremes.max);
                this.setXAxisExtremes(this.extremes.min, this.extremes.max);
                this.extremes = null;
                delete this.extremes;
            } else {
                this.chart.redraw();
            }
            if (this.chart.redrawWaterMark) {
                this.chart.redrawWaterMark();
            }

            if (this.isUserDefinedXAxisExtremes()) {
                var mainXAxis = this.getMainXAxis(),
                    zoomRangeMin = mainXAxis.userMin,
                    zoomRangeMax = mainXAxis.userMax;

                if (typeof this.data.base === 'undefined' || this.data.base.length === 0) { // chart has no data
                    this.resetXAxisExtremesToDefault();
                } else { //has data check zoom range has data
                    if (!this._isDataAvailableInRange(zoomRangeMin, zoomRangeMax)) {
                        this.resetXAxisExtremesToDefault();
                    }
                }

            }

            if (this.isUserDefinedYAxisExtremes()) {
                var mainYAxis = this.getMainYAxis();
                if (mainYAxis.dataMax < mainYAxis.min || mainYAxis.dataMin > mainYAxis.max) {
                    this.resetYAxisExtremes(true);
                }
            }
        }
        catch (ex) {
            infChart.util.console.error(this.id + ": Error in onReadHistoryDataLoad", ex);
        }
    } else {
        this.setSpread(!!this.spread, false, false);
    }

    this.setLoading(false);
    if (this.tooltip) {
        this.updateTooltipToLastPoint(true);
        if (this.isResizeRequired()) {
            this.resizeChart();
        }
    }
    this._showNoData(!this.isLoading() && (typeof this.data.base === 'undefined' || this.data.base.length === 0));
    if (this.isFirstLoadInprogress()) {
        this.loaded = true;
        this.isfirstLoad = false;
        // this.resizeChart();
        if (this.isResizeRequired()) {
            this.resizeChart();
        }
        //if (this.settings.events && this.settings.events.afterDataLoad) {
        //    this.settings.events.afterDataLoad.call(this);
        //}
        this._fireEventListeners('afterDataLoad');
    }

    this._fireEventListeners("onReadHistoryDataLoad", [this.rangeData.data, properties]);
    this._fireEventListeners('onBaseSymbolDataLoad', [this.rangeData.data]);

    var endTime = (new Date()).getTime();
    this.performanceCheck['onReadHistoryDataLoad'] = {
        diff: endTime - onReadHistoryDataLoad,
        startTime: onReadHistoryDataLoad,
        endTime: endTime
    };
    if(this.enableBarClosure){
        this.enableBarClosure = false;
        infChart.manager.toggleBarClosureTime(infChart.manager.getContainerIdFromChart(this.chartId));
    }
    this._printPerformance();
    //chart.redraw();
};

/**
 * Method to update chart data
 */
infChart.StockChart.prototype._update = function () {//redraw
    //
    //if (typeof redraw == "undefined") {
    //    redraw = true;
    //}

    // if(!this.isUserDefinedYAxisExtremes()) {
    //     this.resetYAxisExtremes(false);
    // }

    this._setPeriodData();
    this._recalculateAll(false);
    this._clearPlotLines(false);
};

/**
 * Update data when streaming
 */
infChart.StockChart.prototype._updateFromTicks = function () {
    this._updatePeriodData();
    this._recalculateAll(false, true);
    this._clearPlotLines(false);
};

infChart.StockChart.prototype.getCompareSeriesId = function (symbol) {
    return "c_" + symbol.symbolId.replace(/[!"#$%&'()*+,.\/:;<=>?@[\\\]^`{|}~]/g, "_");
};

infChart.StockChart.prototype.getCompareSymbolFromSeriesId = function (seriesId) {
    return this.compareSymbols.idMap[seriesId];
};

/**
 * Method to add a comparison series to chart
 * @param symbol
 * @param config
 * @param {boolean} isPropertyChange
 */
infChart.StockChart.prototype.addCompareSymbol = function (symbol, config, isPropertyChange) {

    if (this.chart && !this.compareSymbols.symbols[symbol.symbolId]) { // add series if not added before
        var range = symbol.range || config && config.range,
            id = this.getCompareSeriesId(symbol),
            compareValue;

        this.compareSymbols.count++;
        this.compareSymbols.symbols[symbol.symbolId] = symbol;
        this.compareSymbols.idMap[id] = symbol;

        compareValue = (this.compareSymbols.count >= 1 && this.isPercent) || (this.compareSymbols.count == 1 && !this.isFirstLoadInprogress()) ? "percent" : undefined

        var properties = {
                "symbol": symbol,
                "seriesColor": infChart.util.getNextSeriesColor(),
                "compare": compareValue,
                "styleTypes": this.styleTypes.compare,
                "hideClose": this.settings.config.hideClose,
                "visible": config && config.seriesOptions && config.seriesOptions.visible !== undefined ? config.seriesOptions.visible : true
            },
            series = this.addSeries(id, "compare", properties, false, config && config.seriesOptions);

        if (this.compareSymbols.count === 1) {
            this.setChartDataMode("compare", false, false);
            if (this._isToolbarEnabled()) {
                infChart.toolbar.setVisibility(this.id, 'spread', true);
            }
        }
        // if (isPropertyChange) {
        //     this.setChartDataMode("compare", false, isPropertyChange);
        // }
        this._loadCompareHistory(symbol, range, undefined, undefined, isPropertyChange);
        //this.scaleDrawings(this.id);

        if (this.compareSymbols.count === 1) {
            infChart.toolbar.setSelectedControls(this.id, "comparison", true);
        }

        this._loadSettingWindow(true, {'seriesId': series.options.id});
        infChart.manager.showHideCompareSymbol(this.id, series, properties.visible, false);

        this._fireEventListeners("onAddCompareSymbol", [symbol, this._getSeriesProperties(series)]);

        if (!this.isFirstLoadInprogress() && this.isResizeRequired()) {
            this.resizeChart();
        }
    }
};

/**
 * Remove given series of the given type from the chart
 * @param seriesId
 * @param type
 */
infChart.StockChart.prototype.removeSeriesFromChart = function (seriesId, type) {
    var self = this;
    switch (type) {
        case "compare":
            self.removeCompareSymbol(self.getCompareSymbolFromSeriesId(seriesId), true);
            break;
        default:
            self.removeSeries(seriesId, true);
            break;
    }
};

/**
 * Remove compare symbol Externally
 * @param {object} symbol
 * @param {boolean} isPropertyChange
 */
infChart.StockChart.prototype.removeCompareSymbol = function (symbol, isPropertyChange) {
    var id = this.getCompareSeriesId(symbol),
        series = this.chart.get(id);

    if (series) {
        this.compareSymbols.count--;
        delete this.compareSymbols.symbols[symbol.symbolId];
        delete this.data.compare[symbol.symbolId];
        delete this.dataMap.compare[symbol.symbolId];
        delete this.rawData.compare[symbol.symbolId];
        delete this.compareSymbols.idMap[id];
        delete this.rangeData.compareData[id];
        delete this.processedData.compareSymbols[id];
        this.removeSeries(id);
        if (this.compareSymbols.count <= 0) {
            if (this.spread) {
                this.toggleSingletonIndicatorByType('SPREAD', false, false, true);
            }
            if (this._isToolbarEnabled()) {
                infChart.toolbar.setVisibility(this.id, 'spread', false);
            }
            this.setChartDataMode("compareToNormal", true, isPropertyChange !== false);
            this.maxRangeVal = this.getMaxDisplayTime();
            this._setChartToMaxPossiblePeriod(true);
            infChart.toolbar.setSelectedControls(this.id, "comparison", false);
        }
        if (this.hasLastLineForCompareSymbols) {
            this._removeLastLineForCompareSymbol(id);
        }
        if (isPropertyChange !== false) {
            this._onPropertyChange("compareSymbols", {symbol: symbol, action: "remove"});
        }
        this._fireEventListeners("onRemoveCompareSymbol", [symbol]);
    }
};

/**
 * Method to load history data of a compare symbol
 * @param symbol
 * @param range
 * @param data
 * @param isReload whether to reload data or get from cache if available
 */
infChart.StockChart.prototype._loadCompareHistory = function (symbol, range, data, isReload, isPropertyChange) {

    range = !this._isCustomPeriod() ? undefined : range;

    var intervalOptions = this.getCurrentIntervalOptions(this.interval),
        properties = {
            symbol: symbol,
            interval: this.interval,
            reload: isReload,
            maxPeriod: intervalOptions ? intervalOptions.maxPeriod : undefined,
            fromDate: range && range.fromDate,
            toDate: range && range.toDate,
            data: data || symbol.data,
            regularIntervalsOnUpdate: this.regularIntervalsOnUpdate,
            isPropertyChange: isPropertyChange
        };
    this.cleanCompareData(symbol);
    this.setLoading(true);
    //this.chart.redraw();
    this.dataManager.readHistoryData(properties, this._onCompareDataLoad, this);
};

infChart.StockChart.prototype.cleanCompareData = function (symbol) {
    var symbolId = symbol.symbolId;
    this.data.compare[symbolId] = [];
    this.dataMap.compare[symbolId] = {};
    this.rawData.compare[symbolId] = {};

    var seriesId = this.getCompareSeriesId(symbol),
        series = this.chart.get(seriesId);

    // reset particular series data to set fresh data
    this.processedData.compareSymbols[seriesId] = [];
    this.recalStart[seriesId] = 0;
};

/**
 * callback method when loading history of a compare symbol
 * @param data
 * @param properties
 */
infChart.StockChart.prototype._onCompareDataLoad = function (data, properties) {
    var symbol = properties.symbol.symbolId;
    var hasException = false;
    try {
        if (data.interval == this.interval) {
            data = this.filterCompareData(data);
            var chart = this.chart,
                dataObj;
            this.data.compare[symbol] = data.data;
            this.dataMap.compare[symbol] = data.dataMap;
            this.rawData.compare[symbol] = data;

            var seriesId = this.getCompareSeriesId(properties.symbol),
                series = chart.get(seriesId);

            // reset particular series data to set fresh data
            this.processedData.compareSymbols[seriesId] = [];
            this.recalStart[seriesId] = 0;

            properties.symbol.data = undefined;

            infChart.structureManager.legend.cleanSeriesData(this.id, seriesId, "compare");

            if (data.data && data.data.length) {
                var newMinRangeVal = this.getPossibleMinRangeValue();
                if (newMinRangeVal != this.minRangeVal) {
                    this.minRangeVal = newMinRangeVal;
                }
            }

            this._setPeriodData(symbol);
            dataObj = this._processData(this.rangeData.compareData[seriesId],
                this.isCompare, this.isLog, this.isPercent, false, seriesId);
            this.processedData.compareSymbols[seriesId] = dataObj.data;

            var seriesData = this._getSeriesDataByChartType(series.options.type, this.processedData.compareSymbols[seriesId].slice(), series.options.infLineDataField);
            series.setData(seriesData, false, false, false);
            series.userOptions.data = this.rangeData.compareData[seriesId];

            this._setDummyData(false);
            this._recalculateIndicators(false, 0, ["compare"]);
            //this._setFullRange();

            //chart.redraw();
            this._setChartToMaxPossiblePeriod(true);

            this.prevousClose = {};
            this.updatePriceLines();

            //this.setLegendValue(seriesId);

            if (dataObj && dataObj.data && dataObj.data.length) {
                this._destroyNoDataLabel();
            }
            if (properties.isPropertyChange) {
                var value = {};
                value.symbol = properties.symbol;
                value.action = "add";
                this._onPropertyChange("compareSymbols", value);
            }
        }
    }
    catch (ex) {
        var hasException = true;
        infChart.util.console.error("Error on onCompareDataLoad:" + ex);
    }

    if (!hasException && properties && properties.isPropertyChange && (typeof this.data.compare[symbol] === 'undefined' || this.data.compare[symbol].length === 0)) {
        infChart.util.showMessage(this.id, infChart.manager.getLabel("msg.compareNoData").replace("{0}", this._getSymbolDisplayName(properties.symbol)));
    }

    this.setLoading(false);
    if (data.interval == this.interval) {
        this.updateMinMax();


        if (this.tooltip) {
            this.updateTooltipToLastPoint(true);
        }
        this._fireRegisteredMethod('onCompareSymbolLoad', [this.rangeData.compareData[seriesId], properties.symbol]);
        this._fireEventListeners("onCompareSymbolLoad", [properties.symbol, this.rangeData.compareData[seriesId]], true);
    }
};

infChart.StockChart.prototype.filterCompareData = function (data) {
    var chart = this.chart;
    var xData = chart.series[0].xData;
    var newData = {};
    var newDataArray = [];
    var newDataMap = {};
    var mainSeriesDataMap = {};
    var compareSymbolData = data.data;
    newData.cacheKey = data.cacheKey;
    newData.hasOpenHighLow = data.hasOpenHighLow;
    newData.interval = data.interval;
    newData.symbol = data.symbol;

    xData.forEach(function (val) {
        mainSeriesDataMap[val] = val;
    });

    compareSymbolData.forEach(function (dataValue) {
        if (mainSeriesDataMap[dataValue[0]]) {
            newDataArray.push(dataValue);
            newDataMap[dataValue[0]] = dataValue;
        }
    });

    newData.data = newDataArray;
    newData.dataMap = newDataMap;
    return newData;
};

infChart.StockChart.prototype.setTimeLagOnCompare = function (symbol, time, redraw) {
    var compSym = symbol && symbol.symbolId && this.compareSymbols.symbols[symbol.symbolId];
    if (compSym) {
        var seriesId = this.getCompareSeriesId(symbol),
            series = this.chart.get(seriesId),
            symbolId = symbol.symbolId,
            dataObj;
        compSym.timeLag = time;
        this._setPeriodData(symbolId);
        dataObj = this._processData(this.rangeData.compareData[seriesId],
            this.isCompare, this.isLog, this.isPercent, false, seriesId);

        this.seriesActualMinMax[seriesId] = {dataMin: dataObj.dataMin, dataMax: dataObj.dataMax};
        this.processedData.compareSymbols[seriesId] = dataObj.data;

        var seriesData = this._getSeriesDataByChartType(series.options.type, this.processedData.compareSymbols[seriesId].slice(), series.options.infLineDataField);
        series.setData(seriesData, redraw, false, false);
        series.userOptions.data = this.rangeData.compareData[seriesId];


        this._setFullRange();

        this.prevousClose = {};
        this.updatePriceLines();
    }

};

infChart.StockChart.prototype.setTimeLagOnBaseSymbol = function (time, redraw) {
    var series = this.getMainSeries(),
        symbol = this.symbol.symbolId,
        dataObj,
        seriesData;

    this.symbol.timeLag = time;
    this._setPeriodData();
    dataObj = this._processData(this.rangeData.data,
        this.isCompare, this.isLog, this.isPercent, true, series.options.id);

    this.processedData.data = dataObj.data;
    this.processedData.ohlcv = this.dataManager.getOHLCV(dataObj.data);

    seriesData = this._getSeriesDataByChartType(series.options.type, this.processedData.data.slice(), series.options.infLineDataField);
    series.setData(seriesData, redraw, false, false);
    series.userOptions.data = this.rangeData.data;


    this._setFullRange();

    this.prevousClose = {};
    this.updatePriceLines();

};

/**
 * filter chart data according to selected period
 * @param symbol
 * @private
 */
infChart.StockChart.prototype._setPeriodData = function (symbol) {
    // Todo : try to simplify this method more
    var _d = this.data.base,
        croppedData = [],
        mainSeriesData = [],
        mainSeriesMinMax = {},
        that = this,
        minRangeVal,
        min,
        max,
        count = 0;

    if (this.minRangeVal && this.maxRangeVal) {

        var rangDataFirst;
        if (!symbol) {

            infChart.util.forEach(_d, function (i, val) {
                minRangeVal = (that.symbol.timeLag && !isNaN(that.symbol.timeLag)) ? that.minRangeVal + that.symbol.timeLag : that.minRangeVal;
                if (val[0] >= minRangeVal) {
                    //if (val[0] <= that.maxRangeVal) {
                    max = (isNaN(max) || max < val[2]) ? val[2] : max;
                    min = (isNaN(min) || min > val[2]) ? val[2] : min;
                    croppedData[count] = val;
                    count++;
                    //} else {
                    //    return;
                    //}
                }
            });


            //this.getMainSeries().setData([], false); // clear
            mainSeriesData = croppedData;

        }
        var minMaxValues = this.getMinMaxRangeValues();
        rangDataFirst = minMaxValues && minMaxValues.min || mainSeriesData[0] || this.rangeData.data[0];

        infChart.util.forEach(this.compareSymbols.symbols, function (key, symbolObj) {
            if (symbol == key || !symbol) {
                croppedData = [];
                count = 0;
                if (that.data.compare[key]) {
                    min = undefined;
                    max = undefined;
                    minRangeVal = (symbolObj.timeLag && !isNaN(symbolObj.timeLag) && rangDataFirst) ? rangDataFirst[0] + symbolObj.timeLag : that.minRangeVal;
                    infChart.util.forEach(that.data.compare[key], function (i, val) {
                        if (val[0] >= minRangeVal) {
                            // if (val[0] <= that.maxRangeVal) {
                            croppedData[count] = val;
                            count++;
                            max = (isNaN(max) || max < val[2]) ? val[2] : max;
                            min = (isNaN(min) || min > val[2]) ? val[2] : min;
                            // } else {
                            //     return;
                            // }
                        }
                    });
                }
                var seriesId = that.getCompareSeriesId(symbolObj);
                that.rangeData.compareData[seriesId] = croppedData;
            }
        });
    } else {
        if (!symbol) {
            croppedData = _d;
            mainSeriesData = croppedData;
        }
        // TODO :: check whether this logic is required or not
        infChart.util.forEach(this.compareSymbols.symbols, function (key, symbolObj) {
            if (symbol == key || !symbol) {
                var seriesId = that.getCompareSeriesId(symbolObj);
                croppedData = that.data.compare[key];
                that.rangeData.compareData[seriesId] = croppedData;
            }
        });
    }

    if (mainSeriesData.length > 0) {
        this.rangeData.data = mainSeriesData;
        this.rangeData.ohlcv = this.dataManager.getOHLCV(mainSeriesData);
        //this.rangeData.compareData = compareData;
    } else {
        // this.rangeData.data = [];
        // this.rangeData.ohlcv = {};
    }
};

/**
 * Process and update new ticks to the series
 * this is triggered from update ticks method
 * To keep _setPeriodData more simple implemented updating in a new method.
 * @param symbol
 * @private
 */
infChart.StockChart.prototype._updatePeriodData = function (symbol) {

    var _d = this.data.base,
        croppedData = [],
        mainSeriesData = [],
        iChart = this,
        minRangeVal,
        min,
        max,
        count = 0,
        mainSeries = this.getMainSeries(),
        mainSeriesOldData = this.rangeData.data,
        recalStartIdx = Math.min((_d.length && (_d.length - 1)) || 0, (mainSeriesOldData.length && (mainSeriesOldData.length - 1)) || 0),
        i,
        val,
        removeLastFromBase = false;

    if (this.minRangeVal && this.maxRangeVal) {

        var rangDataFirst,
            oldLastTime = (mainSeriesOldData && mainSeriesOldData[recalStartIdx] && mainSeriesOldData[recalStartIdx][0]) || 0;
        if (!symbol && mainSeries) {

            // if symbol is not specified update the

            minRangeVal = (iChart.symbol.timeLag && !isNaN(iChart.symbol.timeLag)) ? iChart.minRangeVal + iChart.symbol.timeLag : iChart.minRangeVal;

            for (i = _d.length - 1; i >= 0; i--) {
                val = _d[i];

                if (val[0] >= minRangeVal) {
                    if (/*val[0] <= iChart.maxRangeVal &&*/ oldLastTime <= val[0]) {
                        max = (isNaN(max) || max < val[2]) ? val[2] : max;
                        min = (isNaN(min) || min > val[2]) ? val[2] : min;
                        croppedData.unshift(val);
                        count++;
                    } else {
                        break;
                    }
                }
            }

            if (croppedData.length > 0) {
                //this.getMainSeries().setData([], false); // clear
                if (oldLastTime >= croppedData[0][0]) {
                    removeLastFromBase = true;

                    // removes the all the main series data which are before the new ticks
                    for (i = mainSeriesOldData.length - 1; i >= 0; i--) {
                        if (mainSeriesOldData[i][0] >= croppedData[0][0] || _d.length <= mainSeriesOldData.length) {
                            mainSeriesOldData.splice(i
                                , mainSeriesOldData.length - i);
                        } else {
                            recalStartIdx = i + 1;// recalculats should start from the index of the first new tick
                            break;
                        }
                    }
                    //mainSeriesOldData.splice(mainSeriesOldData.length - 1, 1);
                } else if (_d.length <= mainSeriesOldData.length) {
                    mainSeriesOldData.splice(_d.length - 1, mainSeriesOldData.length - _d.length - 1);
                }
                iChart.recalStart[mainSeries.options.id] = mainSeriesOldData.length;
                mainSeriesData = mainSeriesOldData.concat(croppedData);
            }
        }

        var minMaxValues = this.getMinMaxRangeValues();
        rangDataFirst = minMaxValues && minMaxValues.min || mainSeriesData[0] || this.rangeData.data[0];

        infChart.util.forEach(this.compareSymbols.symbols, function (key, symbolObj) {
            if (symbol == key || !symbol) {
                croppedData = [];
                count = 0;
                if (iChart.data.compare[key]) {
                    min = undefined;
                    max = undefined;
                    minRangeVal = (symbolObj.timeLag && !isNaN(symbolObj.timeLag) && rangDataFirst) ? rangDataFirst + symbolObj.timeLag : rangDataFirst;

                    _d = iChart.data.compare[key];

                    var seriesId = iChart.getCompareSeriesId(symbolObj),
                        series = iChart.chart.get(seriesId),
                        seriesData = iChart.rangeData.compareData[seriesId];

                    if (seriesData && seriesData.length > 0) { //series && series.options.data,
                        var lastTimeIdx = Math.min((_d.length > 0 ? _d.length - 1 : 0), seriesData.length - 1),
                            seriesLastTime = seriesData[lastTimeIdx][0];

                        if (series) {
                            for (i = _d.length - 1; i >= 0; i--) {
                                val = _d[i];
                                if (val[0] >= minRangeVal) {
                                    if (/*val[0] <= iChart.maxRangeVal &&*/ seriesLastTime <= val[0]) {
                                        croppedData.unshift(val);
                                        count++;
                                        max = (isNaN(max) || max < val[2]) ? val[2] : max;
                                        min = (isNaN(min) || min > val[2]) ? val[2] : min;
                                    } else {
                                        break;
                                    }
                                }
                            }
                        }

                        if (croppedData.length > 0) {
                            if (seriesLastTime >= croppedData[0][0]) {
                                seriesData.splice(seriesData.length - 1, 1);

                                // removes the all the compare series data which are before the new ticks
                                for (i = seriesData.length - 1; i >= 0; i--) {
                                    if (seriesData[i][0] >= croppedData[0][0] || _d.length < seriesData.length) {
                                        seriesData.splice(i
                                            , seriesData.length - i);
                                    } else {
                                        //  recalStartIdx = i + 1;// re-calculates should start from the index of the first new tick
                                        break;
                                    }
                                }
                            } else if (_d.length < seriesData.length) {
                                seriesData.splice(_d.length - 1, seriesData.length - _d.length - 1);
                            }

                            iChart.recalStart[seriesId] = seriesData.length;
                            seriesData = seriesData.concat(croppedData);
                            iChart.rangeData.compareData[seriesId] = seriesData;
                        }
                    }
                }

            }
        });
    } else {
        if (!symbol) {
            croppedData = _d;
            mainSeriesData = croppedData;
        }
        // TODO :: check whether this logic is required or not
        infChart.util.forEach(this.compareSymbols.symbols, function (key, symbolObj) {
            if (symbol == key || !symbol) {
                var seriesId = iChart.getCompareSeriesId(symbolObj);
                croppedData = iChart.data.compare[key];
                iChart.rangeData.compareData[seriesId] = croppedData;
            }
        });
    }

    if (mainSeriesData.length > 0) {

        this.rangeData.data = mainSeriesData;
        // get data for the indicator
        var ohlcv = this.dataManager.getOHLCV(mainSeriesData, recalStartIdx);

        infChart.util.forEach(ohlcv, function (i, val) {

            if (iChart.rangeData.ohlcv[i]) {
                // remove the elements after the recalStartIdx from  Chart.rangeData.ohlcv
                if (recalStartIdx <= (iChart.rangeData.ohlcv[i].length - 1)) {
                    iChart.rangeData.ohlcv[i].splice(recalStartIdx, iChart.rangeData.ohlcv[i].length - recalStartIdx);
                }
                iChart.rangeData.ohlcv[i] = iChart.rangeData.ohlcv[i].concat(val);
            } else {
                iChart.rangeData.ohlcv[i] = val;
            }
        });

        //this.rangeData.compareData = compareData;

    }

};

/**
 * Recalculate all the data and set them to the series.
 * If only update is required user should set the recalStart number of the series
 * @param redraw
 * @private
 */
infChart.StockChart.prototype._recalculateAll = function (redraw, isTickUpdate) {
    var cCount = this.compareSymbols.count,
        dataObj;
    this._setMainSeriesData(cCount === 0 && redraw, isTickUpdate);
    //todo :: set user options ??

    if (cCount > 0) {
        var xChart = this;
        infChart.util.forEach(this.compareSymbols.symbols, function (k, val) {
            var seriesId = xChart.getCompareSeriesId(val),
                series = xChart.chart.get(seriesId),
                oldProcessedData = xChart.processedData.compareSymbols[seriesId],
                newProcessedData,
                oldData = series.options.data,
                newData,
                recalStart = xChart.recalStart[seriesId] || 0, // data processing starts from this number if specified
                isUpdate = (recalStart != 0),
                i,
                iLen;

            if (xChart.rangeData.compareData[seriesId]) {

                // remove all the prev data which are after the recalStart Index of the series
                if (isUpdate && oldData.length >= recalStart) {
                    for (i = recalStart, iLen = oldData.length; i < iLen; i++) {
                        var lastIdx = oldData.length - 1,
                            time = oldData[lastIdx];
                        oldData.splice(lastIdx, 1);
                        xChart.processedData.compareSymbols[seriesId].splice(lastIdx, 1);
                        if (xChart.processedData.timeMap[time] && xChart.processedData.timeMap[time].indexOf(seriesId) >= 0) {
                            xChart.processedData.timeMap[time].splice(xChart.processedData.timeMap[time].indexOf(seriesId), 1);
                            if (!xChart.processedData.timeMap[time].length) {
                                delete xChart.processedData.timeMap[time];
                            }
                        }
                    }
                }

                // ammend new data if availble and set them to the series
                dataObj = xChart._processData(xChart.rangeData.compareData[seriesId], xChart.isCompare, xChart.isLog, xChart.isPercent, false, seriesId, xChart.processedData.timeMap);
                newProcessedData = dataObj.data;
                xChart.processedData.compareSymbols[seriesId] = isUpdate ? oldProcessedData.concat(newProcessedData) : newProcessedData;
                cCount--;

                var data = xChart._getSeriesDataByChartType(series.options.type, dataObj.data, series.options.infLineDataField);
                newData = isUpdate ? oldData.concat(data) : data;
                series.setData(newData, cCount === 0 && redraw, false, false);
                series.userOptions.data = xChart.rangeData.compareData[seriesId];

            } else {
                infChart.util.console.log('range data not loaded yet for : ' + k);
            }
        });
    }
    // keep track of each time to be used when scaling (zooming and dragging)
    // convert these times to an array to avoid conversion on demand
    var pointPositions = [];
    infChart.util.forEach(this.processedData.timeMap, function (k, val) {
        pointPositions.push(k);
    });
    this.processedData.pointPositions = pointPositions;

    this.updatePriceLines();
};

/**
 * Returns relavent the series data for the given chart type
 * @param chartType
 * @param data
 * @param lineDataField
 * @returns {*}
 * @private
 */
infChart.StockChart.prototype._getSeriesDataByChartType = function (chartType, data, lineDataField) {
    var result = data;
    if (chartType === 'line' || chartType === 'area' || chartType === 'column' || chartType == 'step') {
        var index = 4;
        lineDataField = lineDataField || this.settings.config.lineDataField;
        if (lineDataField) {
            switch (lineDataField) {
                case "open":
                    index = 1;
                    break;
                case "high":
                    index = 2;
                    break;
                case "low":
                    index = 3;
                    break;
                case "close":
                    index = 4;
                    break;
                case "volume":
                    index = 5;
                    break;
            }
        }
        result = this.dataManager.merge(data, [0, index]); // set close value for data
    }
    return result;
};

infChart.StockChart.prototype._getSymbolDisplayName = function (symbol){
    var chartObj = this;
    var result;
    if(chartObj && chartObj.settings.registeredMethods && chartObj.settings.registeredMethods.getSymbolDisplayName) {
        result = chartObj.settings.registeredMethods.getSymbolDisplayName(symbol);
    } else {
        result = infChart.util.getSymbolDisplayName(symbol);
    }
    return result;
}

infChart.StockChart.prototype._getDummySeries = function (isForward) {
    var seriesId = isForward? infChart.constants.dummySeries.forwardId: infChart.constants.dummySeries.backwardId;
    var series;

    for(var i = 0; i < this.chart.series.length; i++) {
        if(this.chart.series[i].name === seriesId) {
            series = this.chart.series[i];
        }
    }

    return series;
};

/**
 * calculate and set main series data
 * @private
 */
infChart.StockChart.prototype._setDummyData = function (redraw) {
    var
    //dummySeries = this.chart.get(infChart.constants.dummySeries.missingId),
        xAxis = this.getMainXAxis(),
        dummySeries2,
        processedData = this.processedData.data,
        min = (processedData[0] && processedData[0][0]) || 0,
        max = (processedData[processedData.length - 1] && processedData[processedData.length - 1][0]) || 0,
        periodMin = this._getMinDate(this.period, max),
        compareSymbols = this.processedData.compareSymbols,
        tempMin,
        tempMax,
        count = processedData.length /*+ (dummySeries && dummySeries.options.data && dummySeries.options.data.length) || 0*/,
        i,
        iLen,
        dummyData = [],
        softMinArr = [],
        softMaxArr = [],
        tempSoftMinArr = [],
        tempSoftMaxArr = [],
        lastVal = (processedData[processedData.length - 1] && processedData[processedData.length - 1]);

    if (processedData.length > 5) {
        for (i = processedData.length - 6, iLen = processedData.length; i < iLen; i++) {
            if (periodMin <= processedData[i][0]) {
                softMinArr.xPush(processedData[i][0]);
            }
        }

        if (processedData.length > 10) {
            for (i = 0, iLen = 5; i < iLen; i++) {
                softMaxArr.xPush(processedData[i][0]);
            }
        }
    }

    for (var sym in compareSymbols) {

        if (compareSymbols.hasOwnProperty(sym)) {
            tempSoftMinArr = [];
            tempSoftMaxArr = [];
            processedData = compareSymbols[sym];
            tempMin = (processedData[0] && processedData[0][0]);
            tempMax = (processedData[processedData.length - 1] && processedData[processedData.length - 1][0]);

            if (tempMin && tempMin < min) {
                for (i = 0; processedData[i] && processedData[i][0] < min; i++) {
                    count++;
                    tempSoftMaxArr.xPush(processedData[i][0]);
                }
                min = tempMin;

                if (tempSoftMaxArr.length > 0) {
                    for (i = 0, iLen = tempSoftMaxArr.length; i < iLen; i++) {
                        softMaxArr.unshift(tempSoftMaxArr[i]);
                    }
                    softMaxArr = softMaxArr.slice(5);
                }
            }

            if (tempMax && tempMax > max) {
                for (i = processedData.length; processedData[i] && processedData[i][0] > max; i--) {
                    count++;
                    tempSoftMinArr.unshift(processedData[i][0]);
                }
                max = tempMax;

                if (tempSoftMinArr.length > 0) {
                    softMinArr = softMinArr.slice(tempSoftMinArr.length);
                    for (i = 0, iLen = tempSoftMinArr.length; i < iLen; i++) {
                        softMinArr.xPush(tempSoftMinArr[i]);
                    }
                }
            }

        }
    }

    var prevTime = max,
        dummyCount = Math.min(200, Math.floor(count / 4)),
        tempTimeStart,
        tickInterval = this.intervalOptions[this.interval] && this.intervalOptions[this.interval].time,
        backwardSeries,
        foarwardSeries,
        minT = this._getMinDate(this.period, min, true),
        maxT = this._getMaxDate(this.period, max);

    if (dummyCount > 0 || minT < min) {

        if (this.interval == 'T') {
            //tempTimeStart = min + (max - min)/4;
            tickInterval = (max - min) / (4 * dummyCount);
        }

        if (this.settings.config.panToFuture) {

            var o = lastVal && lastVal[1] || null,
                h = lastVal && lastVal[2] || null,
                l = lastVal && lastVal[3] || null,
                c = lastVal && lastVal[4] || null,
                v = lastVal && lastVal[5] || null;

            this.removeSeriesFromTimeMap(infChart.constants.dummySeries.forwardId, false);
            prevTime = max;
            dummyCount = maxT > max ? Math.floor((maxT - max) / tickInterval) : dummyCount;
            for (i = 0; i < dummyCount; i++) {
                var tempTime = this.interval == 'T' ? prevTime + tickInterval : this.getNextTickTime(prevTime, this.interval);

                if(this._isValidCandleTime(tempTime)) {
                    dummyData.xPush([tempTime, o, h, l, c, v]);
                    this.addValueToTimeMap(tempTime, infChart.constants.dummySeries.forwardId, this.processedData.timeMap);
                }

                prevTime = tempTime;
            }

            dummySeries2 = this.settings.config.panToFuture && this.chart.get(infChart.constants.dummySeries.forwardId);
            dummySeries2.setData(dummyData, false, false, false);
        }

        if (this.settings.config.panToPast) {
            this.removeSeriesFromTimeMap(infChart.constants.dummySeries.backwardId, false);
            prevTime = min;
            dummyData = [];
            dummyCount = min > minT ? Math.floor((min - minT) / tickInterval) : dummyCount;
            for (i = 0; i < dummyCount; i++) {
                var tempTime = this.interval == 'T' ? prevTime - tickInterval : this.getNextTickTime(prevTime, this.interval, true);
                dummyData.unshift([tempTime, null, null, null, null, null]);
                this.addValueToTimeMap(tempTime, infChart.constants.dummySeries.backwardId, this.processedData.timeMap);
                prevTime = tempTime;
            }

            dummySeries2 = this.settings.config.panToPast && this.chart.get(infChart.constants.dummySeries.backwardId);
            dummySeries2.setData(dummyData, false, false, false);
        }

    } else {
        backwardSeries = this.settings.config.panToPast && this.chart.get(infChart.constants.dummySeries.backwardId);
        foarwardSeries = this.settings.config.panToFuture && this.chart.get(infChart.constants.dummySeries.backwardId);
        if (backwardSeries && backwardSeries.options.data && backwardSeries.options.data.length > 0) {
            backwardSeries.setData([], false, false, false);
        }
        if (foarwardSeries && foarwardSeries.options.data && foarwardSeries.options.data.length > 0) {
            foarwardSeries.setData([], false, false, false);
        }
    }

    if (softMinArr.length > 0 && xAxis.options.softMin != softMinArr[softMinArr.length - 1]) {
        xAxis.update({
            softMin: softMinArr[0]
        }, false);
    } else if (softMinArr.length == 0) {
        xAxis.update({
            softMin: undefined
        }, false);
    }

    if (softMaxArr.length > 0 && xAxis.options.softMax != softMaxArr[softMaxArr.length - 1]) {
        xAxis.update({
            softMax: softMaxArr[0]
        }, false);
    } else if (softMaxArr.length == 0) {
        xAxis.update({
            softMax: undefined
        }, false);
    }

    if (redraw) {
        this.chart.redraw(false);
    }
};

/**
 *
 * @param timeStamp
 * @returns {boolean}
 * @private
 */
infChart.StockChart.prototype._isValidCandleTime = function (timeStamp) {
    var isValid = true;

    if(!this.isLinearData()) {
        if (this.settings.config.ignoreWeekEndFromFutureDates && new Date(timeStamp).getUTCDay() % 6 === 0) {
            isValid = false;
        }

        if (isValid && this._hasRegisteredMethod('getHolidaysList')) {
            var holidaysList = this.settings.registeredMethods.getHolidaysList.call(this);
            var futureDate = new Date(timeStamp);
            var month = futureDate.getUTCMonth() + 1;
            var date = futureDate.getUTCDate();
            var convertedTimeStamp = futureDate.getUTCFullYear() + (month < 10? "0" : "") + month + (date < 10? "0" : "") + date;

            isValid = holidaysList.indexOf(convertedTimeStamp) === -1;
        }
    }

    return isValid;
}

/**
 * calculate and set main series data
 * @private
 */
infChart.StockChart.prototype._setMainSeriesData = function (redraw, isTickUpdate) {

    var mainSeries = this.getMainSeries(),
        seriesId = mainSeries.options.id,
        recalStart = this.recalStart[mainSeries.options.id] || 0,
        isUpdate = (recalStart != 0),
        dataObj = this._processData(this.rangeData.data, this.isCompare, this.isLog, this.isPercent, this.settings.config.displayAllIntervals, mainSeries.options.id, isUpdate && this.processedData.timeMap),
        newData,
        oldData = mainSeries.options.data,
        oldProcessedData = this.processedData.data,
        data,
        i,
        iLen;

    // Remove old data which are after the the recalStart index since they will be set with the new updates
    if (isUpdate && oldData.length >= recalStart) {
        for (i = recalStart, iLen = oldData.length; i < iLen; i++) {
            var lastIdx = oldData.length - 1, time = oldData[lastIdx][0];
            oldData.splice(lastIdx, 1);
            this.processedData.data.splice(lastIdx, 1);
            // delete old time references
            if (this.processedData.timeMap[time] && this.processedData.timeMap[time].indexOf(seriesId) >= 0) {
                this.processedData.timeMap[time].splice(this.processedData.timeMap[time].indexOf(seriesId), 1);
                if (!this.processedData.timeMap[time].length) {
                    delete this.processedData.timeMap[time];
                }
            }
        }
    }

    // amend new data if available and set them to the chart.
    this.processedData.data = isUpdate ? this.processedData.data.concat(dataObj.data) : dataObj.data;
    // keep track of each time to be used when scaling (zooming and dragging)
    if (isUpdate) {
        $.extend(this.processedData.timeMap, dataObj.timeMap);
    } else {
        this.processedData.timeMap = dataObj.timeMap;
    }

    // processd ohlcv data available
    if (isUpdate) {
        // processed new data and return all
        var iChart = this, tempOhlcv = this.dataManager.getOHLCV(this.processedData.data, recalStart);
        infChart.util.forEach(tempOhlcv, function (i, val) {
            if (iChart.processedData.ohlcv[i]) {
                if (recalStart <= (iChart.processedData.ohlcv[i].length - 1)) {
                    iChart.processedData.ohlcv[i].splice(recalStart, iChart.processedData.ohlcv[i].length - recalStart);
                }
                iChart.processedData.ohlcv[i] = iChart.processedData.ohlcv[i].concat(val);
            } else {
                iChart.processedData.ohlcv[i] = val;
            }
        });
    } else {
        this.processedData.ohlcv = this.dataManager.getOHLCV(this.processedData.data);
    }

    data = this._getSeriesDataByChartType(this.type, dataObj.data.slice(), this.symbol.lineDataField);
    newData = isUpdate ? oldData.concat(data) : data;

    /*var dummySeries = this.settings.config.displayAllIntervals && this.chart.get(infChart.constants.dummySeries.missingId);
     if (dummySeries) {
     if (dataObj.dummyData && dataObj.dummyData.length > 0) {
     // update new dummy data for the updates if availble
     newData = isUpdate ? dummySeries.options.data.concat(dataObj.dummyData) : dataObj.dummyData;
     dummySeries.setData(newData);
     } else {
     dummySeries.setData([]);
     }
     }*/

    this._setDummyData(false);

    if (this.settings.config.unGroupedDataOnLoad) {
        this._setUnGroupedRange(this.processedData.data);
    }

    //recalculate indicators if processing is required only for the updates send the index
    this._recalculateIndicators(false, isUpdate && this.recalStart[mainSeries.options.id], undefined, isTickUpdate);

    this._setMainSeriesDataToChart(newData, redraw);
};

//region ===================== Period/Interval =========================================================================

/**
 * get current time from the service if provided
 * @returns Date
 */
infChart.StockChart.prototype.getCurrentTime = function() {
    if (this._hasRegisteredMethod('getUTCTimeDifference')) {
        var timeDiff = this.settings.registeredMethods.getUTCTimeDifference();
        var timeStamp = new Date().getTime() + timeDiff;
        return new Date(timeStamp);
    } else {
        return new Date();
    }
};

/**
 * Method to change chart period
 * @param period
 * @param isManually
 * @param setControl
 * @param range
 * @param {boolean} isPropertyChange
 * @param redraw
 */
infChart.StockChart.prototype.setPeriod = function (period, isManually, setControl, range, isPropertyChange, redraw, isIntervalChange) {
    infChart.util.console.log('calling onPeriodChange : ' + period);
    setControl = typeof setControl == "undefined" ? true : setControl;
    try {

        if (typeof redraw == "undefined") {
            redraw = true;
        }

        if (isPropertyChange) {
            this._onBeforePropertyChange("period", period);
        }

        this.period = period;
        this.recalStart = {};
        if (infChart.indicatorMgr) {
            infChart.indicatorMgr.resetIndicators(this.id, false);
        }

        this.isManualPeriod = isManually;
        /* Keep redraw true for _symbolSeries method to avoid https://xinfiit.atlassian.net/browse/CG-20
         *  Issue Desc :: The chart is getting empty, once after selected any period from Intraday (after changing a chart type into different one)*/
        this._symbolSeries(redraw);
        if (!this.isManualInterval) {
            this.isManualPeriod = false;
            this._setBestIntervalOfPeriod(period, isManually, range);
        }

        if (isManually) {
            this.chart.infManualExtreme = false;  // Extremes need to be reset since a new data set is set to the chart.
            this.isManualInterval = false;
            this.resetYAxisExtremes(false);
        }

        if (this.data.base) {
            var l = this.data.base.length;
            if (l > 0) {
                //set x-axis min/max
                var currentEx = this.getRange(),
                    minMaxValues = this.getMinMaxRangeValues(),
                    max = this.getMaxDisplayTime(),
                    extremeMax = (this.chart.infManualExtreme && currentEx && (currentEx.max || currentEx.userMax)) || max,
                    extremeMin = (this.chart.infManualExtreme && currentEx && (currentEx.min || currentEx.userMin)) || this._getMinDate(period, extremeMax);

                this.maxRangeVal = minMaxValues.max || max;
                this.minRangeVal = (this.settings && this.settings.config.showAllHistory && this.data.base[0][0]) || extremeMin;//this._getMinDate(period);
                this.exMinVal = extremeMin;
                var defaultExtremesForCustomCandleCount = this.getDefaultExtremesFromCustomCandleCount();
                if(isIntervalChange && !this.intervalChangeInDefaultExtremes && this.candleCountEnable){
                    var extremesAccordingToCurrentCandles = this.getExtremesAccordingToCurrentCandleCount();
                }

                //update data for period
                this._update();

                var min = /*isManually ||*/ this.chart.infManualExtreme ? extremeMin : (!this.minExVal && Math.max(extremeMin, this.minExVal)) || isManually ? Math.max(extremeMin, this.minRangeVal) : Math.max(extremeMin, this.minExVal) || extremeMin;
                if (max > 0) {
                    if (this.setMaxAvailablePeriod && !this.chart.infManualExtreme && min < minMaxValues.min) {
                        min = minMaxValues.min;
                    }

                    for (var i = 0, len = this.chart.xAxis.length; i < len; i++) {
                        var redrawOnExt = (i == len - 1) && redraw;
                        //this._setDefaultXAxisExtremes(min, max); // Saving default xAxis extremes to show hide reset xAxis button
                        if (this.candleCountEnable) {
                            this._setDefaultXAxisExtremes(defaultExtremesForCustomCandleCount.min, defaultExtremesForCustomCandleCount.max);
                            if(isIntervalChange && !this.intervalChangeInDefaultExtremes){
                                infChart.manager.setUserDefinedXAxisExtremes(this.chartId, extremesAccordingToCurrentCandles.min, extremesAccordingToCurrentCandles.max, false, true);
                            } else {
                                this.chart.xAxis[i].setExtremes(defaultExtremesForCustomCandleCount.min, defaultExtremesForCustomCandleCount.max, redrawOnExt, false);
                            }
                        } else {
                            this._setDefaultXAxisExtremes(min, max);
                            this.chart.xAxis[i].setExtremes(min, extremeMax, redrawOnExt, false);
                        }
                    }
                }

                //this._setFullRange();
                this._adjustRangeSelectorMinMax();
                this.updateMinMax();
                this.isManualPeriod = false;

            } else {
                this._hideMinMaxLabels();
                this._removePreviousCloseLineElements();
                this._removeLastLineElements();
            }

            if (redraw) {
                this.chart.redraw();
                if (this.isUserDefinedYAxisExtremes() && l > 0) {
                    var mainYAxis = this.getMainYAxis();
                    if (mainYAxis.dataMax < mainYAxis.min || mainYAxis.dataMin > mainYAxis.max) {
                        this.resetYAxisExtremes(true);
                    }
                }
            }
        } else {
            infChart.util.console.log('calling onPeriodChange : data not available');
        }

        if (setControl && this._isToolbarEnabled()) {
            infChart.toolbar.setSelectedControls(this.id, "period", this.period, "interval", this.interval);
        }

        if (isPropertyChange) {
            this._onPropertyChange("period");
        }
    }
    catch (x) {
        if (window.logMode == 'error') {
            infChart.util.console.error(x);
        }
    }
};

infChart.StockChart.prototype.getDefaultExtremesFromCustomCandleCount = function () {
    var baseData = this.data.base;
    var customCandleCount = this.customCandleCount;

    if (baseData) {
        var lastCandle = baseData[baseData.length - 1];
        var leftSideCandle = baseData[baseData.length >= customCandleCount ? baseData.length - customCandleCount - 1 : 0];
        return { max: lastCandle[0], min: leftSideCandle[0] };
    }
};

infChart.StockChart.prototype.getExtremesAccordingToCurrentCandleCount = function () {
    var baseData = this.data.base;
    var previousCandleCount = this.currentCandleCount;
    var previousMiddlePointValue = this.middlePointValue;

    if (baseData) {
        var totalPoints = this.getBaseTimePoints(baseData);
        var nearestDataForMiddlePoint = (infChart.util.binaryIndexOf(totalPoints, undefined, previousMiddlePointValue));
        nearestDataForMiddlePoint = nearestDataForMiddlePoint < 0 ? (nearestDataForMiddlePoint)*(-1) : nearestDataForMiddlePoint;
        if (previousCandleCount % 2 != 0) {
            previousCandleCount = previousCandleCount + 1;
        }
        var candleForOneSide = previousCandleCount / 2;
        var minExtremeIndex = nearestDataForMiddlePoint - candleForOneSide;
        var maxExtremeIndex = nearestDataForMiddlePoint + candleForOneSide;

        var minExtremes, maxExtremes;
        if(minExtremeIndex < 0){
            minExtremeIndex = 0;
            if(maxExtremeIndex > (totalPoints.length - 1)){
                maxExtremeIndex = totalPoints.length - 1;
            } else {
                maxExtremeIndex = previousCandleCount - 1;
            }
        } else if (maxExtremeIndex > (totalPoints.length - 1)) {
            maxExtremeIndex = totalPoints.length - 1;
            if(minExtremeIndex < 0){
                minExtremeIndex = 0;
            } else {
                minExtremeIndex = maxExtremeIndex - previousCandleCount;
            }
        }
        minExtremes = totalPoints[minExtremeIndex];
        maxExtremes = totalPoints[maxExtremeIndex];

        return { min: minExtremes, max: maxExtremes };
    }
};

infChart.StockChart.prototype.getBaseTimePoints = function (baseData) {
    var dataArray = [];
    infChart.util.forEach(baseData, function (index, data) {
        dataArray[index] = data[0];
    });
    return dataArray;
};

/**
 *  Retursn the maximum time to display by default
 * 1. When selecting 1D if Exchange is not open yet, then should show previous days chart.
 * 2. If Exchange is open then should show current days chart. The X axis should span the period for which the Exchange is open on the day.
 * 3. If 2D is selected and the Exchange is open it should show the previous days data and the current days data.
 * 4. If 1Week is selected it should show the last 5 trading days data. If the Exchange is open then it should show the current day and the previous 4 days.
 * 5. The X axis should not be linear. Periods with no data should be omitted from the X axis.
 * @returns {*}
 */
infChart.StockChart.prototype.getMaxDisplayTime = function () {

    var marketOpenDetails = this.marketOpenDetails,
        isMarketOpen = marketOpenDetails && marketOpenDetails.isOpenNow,
        lastOpenTime = marketOpenDetails && this.dataManager.getChartTime(marketOpenDetails.lastOpenTime, marketOpenDetails.timeZoneOffset, this.interval),
        newUtcDate,
        minMaxValues = this.getMinMaxRangeValues();

    if (!this.isLinearData() && isMarketOpen && lastOpenTime) {

        var periodAsArray = this.period.split("_"),
            periodType = periodAsArray[0],
            periodTypeSub = periodAsArray[1],
            units = (periodAsArray.length > 2) ? +periodAsArray[2] : periodAsArray.length > 1 ? +periodAsArray[1] : 1,
            useMarketTime;

        switch (periodType) {
            case 'I':
                useMarketTime = periodTypeSub == 'H' || (periodTypeSub == 'D' && units < 3);
                break;
            case 'D':
                useMarketTime = units < 3;
                break;
            case 'W':
                useMarketTime = units < 2;
                break;
            default:
                break;

        }

        if (useMarketTime) {

            var marketOpenTime = marketOpenDetails && marketOpenDetails.openHours,
                marketOpenHours = (marketOpenTime && Math.floor(marketOpenTime)) || 0,
                marketOpenMinutes = (marketOpenTime && (marketOpenTime % marketOpenHours) * 60) || 0,
                date = new Date(lastOpenTime),
                openTimePeriod = (marketOpenHours * 60 + marketOpenMinutes) * 60 * 1000,
                periodTime = this.periodOptions[this.period].time;

            newUtcDate = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours() + marketOpenHours, date.getUTCMinutes() + marketOpenMinutes, date.getUTCSeconds());

            if (periodTypeSub == 'H' && periodTime < openTimePeriod) {
                if ((lastOpenTime + periodTime) < minMaxValues.max) {
                    newUtcDate = minMaxValues.max;
                }
                else {
                    newUtcDate = lastOpenTime + periodTime;
                }
            }
        }
    }

    if (!newUtcDate) {
        newUtcDate = minMaxValues.max || ( this.data.base.length && this.data.base[this.data.base.length - 1][0]);
    }

    return newUtcDate;
};

/**
 * Change chart data interval
 * @param {string} interval
 * @param subInterval
 * @param {boolean} redraw
 * @param {boolean} isFixedPeriod
 * @param period
 * @param range
 * @param {boolean} isPropertyChange
 */
infChart.StockChart.prototype.setInterval = function (interval, subInterval, redraw, isFixedPeriod, period, range, isPropertyChange, isIntervalChange) {

    if (((!this.period || this.period == period && period == 'C' /*|| (!period && this.period == 'C')*/) &&
        range && range.fromDate == this.range.fromDate && range.toDate == this.range.toDate && this.interval == interval) ||
        (((period && period != 'C') || (!period && this.period && !this._isCustomPeriod())) &&
        (period && this.period == period && this.interval == interval) || (!period && this.interval == interval))) {
        return;
    }

    if(isIntervalChange && this.candleCountEnable){
        this._setCurrentCandleCountAndMiddlePoint();
        if(this.isDefaultXAxisExtremes()){
            this.intervalChangeInDefaultExtremes = true;
        } else {
            this.intervalChangeInDefaultExtremes = false;
        }
    }

    if (isPropertyChange) {
        this._onBeforePropertyChange("interval", interval);
    }

    //todo :: further check performance issue
    if (typeof redraw === 'undefined') {
        redraw = true;
    }
    var chart = this.chart;

    range = (period && period != 'C') || (!period && !this._isCustomPeriod()) ? undefined : range;

    /*var period;*/
    var allowedMultiples = undefined;
    var unitName = undefined;

    var isDataAvailable = this.interval === interval && !this._isCustomPeriod();

    switch (interval) {
        case 'T':
            /*if (!isFixedPeriod && this.period !== 'I') {
             period = 'I';
             }*/
            unitName = 'second';
            allowedMultiples = [1];
            break;
        case 'I_1':
        case 'I_3':
        case 'I_5':
        case 'I_15':
        case 'I_30':
        case 'I_60':
        case 'I_120':
        case 'I_240':
        case 'I_360':
            /* if (!isFixedPeriod && this.period !== 'I') {
             period = 'I';
             }*/
            unitName = 'minute';
            allowedMultiples = [1];
            break;
        case 'D':
            if (!isFixedPeriod && this.isShortPeriod(this.period)) {
                period = 'M_3';
            }
            break;
        case 'W':
            if (!isFixedPeriod && this.isShortPeriod(this.period)) {
                period = 'M_6';
            }
            unitName = 'week';
            allowedMultiples = [1];
            break;
        case 'M':
            if (!isFixedPeriod && (this.isShortPeriod(this.period) || this.period === 'M_1')) {
                period = 'Y_3';
            }
            unitName = 'month';
            allowedMultiples = [1];
            break;
        case 'Y':
            if (!isFixedPeriod && !(this.period === 'Y_1' || this.period === 'Y_3' || this.period === 'Y_5' || this.period === 'Y_10')) {
                period = 'Y_5';
            }
            unitName = 'year';
            allowedMultiples = [1];
            break;
        default:
            break;
    }

    if (this.useGrouping && unitName && allowedMultiples) {
        infChart.util.forEach(chart.series, function (idx, series) {
            series.update({
                dataGrouping: {
                    units: [[
                        unitName,
                        allowedMultiples
                    ]]
                }
            }, isDataAvailable);
        });
    }

    //var mainSeries = this.getMainSeries();
    if (interval === 'T') {
        /*if(mainSeries.options.dataGrouping && mainSeries.options.dataGrouping.enabled) {
         $.each(chart.series, function (idx, series) {
         series.update({dataGrouping: {enabled: false}}, false);
         });
         }*/

        /*if (this.type !== 'line') {
         this.prevChartType = this.type;
         this.setChartStyle('line', false);
         if (this._isToolbarEnabled()) {
         infChart.toolbar.setSelectedControls(this.id, 'chartType', 'line');
         }
         }*/
    } else {
        if (this.prevChartType && this.prevChartType != this.type) {

            this.setChartStyle(this.prevChartType, false);
            if (this._isToolbarEnabled()) {
                infChart.toolbar.setSelectedControls(this.id, 'chartType', this.prevChartType);
            }
            this.prevChartType = undefined;
        }

        /* if(!mainSeries.options.dataGrouping || !mainSeries.options.dataGrouping.enabled) {
         $.each(chart.series, function (idx, series) {
         series.update({dataGrouping: {enabled: true}}, false);
         });
         }*/
    }

    this._cleanNavigatorSeries(redraw);

    if (!isDataAvailable) {
        this.interval = interval;

        if (period) {
            this.period = period;
            if (isFixedPeriod) {
                this.isManualPeriod = true;
            }
        }
        if (range) {
            this.range = range;
        }
        if (this._isToolbarEnabled()) {
            infChart.toolbar.setSelectedControls(this.id, 'period', this.period, 'interval', this.interval);
        }
        var that = this, compRange, isManualInterval = this.isManualInterval;
        this.data.base = [];
        if (this.compareSymbols.count > 0) {
            infChart.util.forEach(this.compareSymbols.symbols, function (key, val) {
                that.data.compare[key] = [];
            });
        }
        this.minExVal = undefined;
        this.minRangeVal = undefined;
        this.maxRangeVal = undefined;
        this._loadHistory(undefined, undefined, undefined, this.flags.enabled, undefined, range, undefined, undefined, undefined, undefined, true);


        if (this.compareSymbols.count > 0) {
            infChart.util.forEach(this.compareSymbols.symbols, function (key, val) {
                that.data.compare[key] = [];
                compRange = val.range || that.range;
                that._loadCompareHistory(val, compRange);
            });
        }
    } else {
        this.setPeriod(period, true, true);
    }

    //this.setDataGrouping(undefined, true);
    let container = $(infChart.structureManager.getContainer(this.getContainer(), "symbolSettingsPanelView"));
    let chartSettingPanel = container.find('div[rel="panel_'+ this.chartId +'"]');
    infChart.structureManager.settings.onIntervalChanged(chartSettingPanel, interval, this.chartId);

    if (isPropertyChange) {
        this._onPropertyChange("interval");
    }
};

infChart.StockChart.prototype._setCurrentCandleCountAndMiddlePoint = function () {
    if (this.chart && this.chart.series && this.chart.series[0]) {
        if (this.chart.series[0].points) {
            var points = this.chart.series[0].points;
            this.currentCandleCount = points.length - 1;
            middlePointIndex = (points.length + 1) / 2;
            this.middlePointValue = middlePointIndex % 1 == 0 ? (points[middlePointIndex - 1]).x : (points[Math.floor(middlePointIndex)].x + points[Math.ceil(middlePointIndex)].x) / 2;
        }
    }
};

/**
 *
 * Returns the min/max values of all the series data (base and compare)
 *
 * @returns {{min: *, max: *}}
 */
infChart.StockChart.prototype.getMinMaxRangeValues = function () {
    var min,
        max,
        compareData = this.data.compare;

    if (this.data.base.length) {
        min = this.data.base[0][0];
        max = this.data.base[this.data.base.length - 1][0];
    }

    if (this.compareSymbols.count > 0) {
        for (var key in compareData) {
            if (compareData.hasOwnProperty(key) && compareData[key] && compareData[key].length) {
                var cData = compareData[key];
                min = (min == undefined) ? cData[0][0] : Math.min(min, cData[0][0]);
                max = (max == undefined) ? cData[cData.length - 1][0] : Math.max(max, cData[cData.length - 1][0]);

            }
        }
    }
    return {min: min, max: max};

};

/**
 * get the best fitting period id given period is not fitting for the given interval
 * @param interval
 * @param currentPeriod
 * @returns {*}
 * @private
 */
infChart.StockChart.prototype._getBestPeriod = function (interval, currentPeriod, isIntervalChange) {
    var maxPeriod = this.getMaxPeriod(interval),
        minPeriod = this.getMinPeriod(interval),
        currentPeriodOptions = this.periodOptions[currentPeriod],
        currentPeriodTime = currentPeriodOptions.time,
        newPeriod = currentPeriod,
        shortestPeriodTime = this.sortedPeriods[0] && this.sortedPeriods[0].time,
        minIntervalTime = this.sortedIntervals[0] && this.sortedIntervals[0].time,
        currentIntervalTime = this.intervalOptions[interval] && this.intervalOptions[interval].time;

    if (this.maxPeriodOnIntervalChange && isIntervalChange) {
        newPeriod = maxPeriod.key;
    }

    // set the nearest possible period if current period is insufficient
    else if (!(currentPeriodTime >= minPeriod.time && currentPeriodTime <= maxPeriod.time)) {
        if (shortestPeriodTime && currentPeriodTime <= shortestPeriodTime && currentIntervalTime <= minIntervalTime) {
            newPeriod = this.sortedPeriods[0].key;
        } else {
            newPeriod = currentPeriodTime <= minPeriod.time ? minPeriod.key : maxPeriod.key;
        }
    }
    return newPeriod;
};

/**
 * change chart data interval manually (not from a result of actions like period change)
 * If current period is insufficient to show the requested interval, period will be changed to nearest possible period.
 * @param {string} interval
 * @param subInterval
 * @param {boolean} redraw
 * @param range
 * @param {boolean} isPropertyChange
 */
infChart.StockChart.prototype.setIntervalManually = function (interval, subInterval, redraw, range, isPropertyChange) {
    var newPeriod = (this.period !== "C") ? this._getBestPeriod(interval, this.period, true) : this.period;
    if (newPeriod) {
        this.isManualPeriod = true;
        this.isManualInterval = true;
        var manualIntervalChange = true;
        this.setInterval(interval, subInterval, redraw, true, newPeriod, range, isPropertyChange, manualIntervalChange);
    }
};

/**
 * Priority is given to the period
 * @param period
 * @param interval
 * @param redraw
 * @param range
 * @param isPropertyChange
 */
infChart.StockChart.prototype.setPeriodAndIntervalManually = function (period, interval, redraw, range, isPropertyChange) {
    var currentInterval = interval,
        currentIntervalOptions = this.intervalOptions[currentInterval],
        currentIntervalTime = currentIntervalOptions && currentIntervalOptions.time,
        options = this.periodOptions[period],
        minInterval = this.getMinInterval(period),
        minIntervalOptions = this.intervalOptions[minInterval],
        minIntervalTime = minIntervalOptions && minIntervalOptions.time,
        maxInterval,
        maxIntervalOptions,
        maxIntervalTime,
        newInterval = currentInterval;

    minInterval = minInterval || options.defaultInterval;
    maxInterval = this.getMaxInterval(period);
    maxIntervalOptions = this.intervalOptions[maxInterval];
    maxIntervalTime = maxIntervalOptions && maxIntervalOptions.time;

    if (!(minIntervalTime <= currentIntervalTime && currentIntervalTime <= maxIntervalTime)) {

        // since current interval goes beyond the supported range of intervals apply the nearest possible interval for the period
        newInterval = currentIntervalTime < minIntervalTime ? minInterval : maxInterval;

    }

    this.isManualPeriod = true;
    this.isManualInterval = true;
    this.setInterval(newInterval, undefined, redraw, true, period, range, isPropertyChange);
};

/**
 * Private method to set default interval for the given period if interval is too small to cater with period
 * @param period
 * @param isManually
 * @param range
 * @returns {number}
 * @private
 */
infChart.StockChart.prototype._setBestIntervalOfPeriod = function (period, isManually, range) {

    if (isManually && this.periodOptions[period]) {

        var currentInterval = this.interval,
            currentIntervalOptions = this.intervalOptions[currentInterval],
            currentIntervalTime = currentIntervalOptions && currentIntervalOptions.time,
            options = this.periodOptions[period],
            minInterval = this.getMinInterval(period),
            minIntervalOptions = this.intervalOptions[minInterval],
            minIntervalTime = minIntervalOptions && minIntervalOptions.time,
            maxInterval,
            maxIntervalOptions,
            maxIntervalTime,
            newInterval,
            defaultInterval = options.defaultInterval,
            defaultIntervalOptions = this.intervalOptions[defaultInterval],
            defaultIntervalTime = defaultIntervalOptions && defaultIntervalOptions.time;

        minInterval = minInterval || defaultInterval;
        maxInterval = this.getMaxInterval(period);
        maxIntervalOptions = this.intervalOptions[maxInterval];
        maxIntervalTime = maxIntervalOptions && maxIntervalOptions.time;

        if (this.fixedIntervalOnPeriodChange) { // if current interval is applicable to the new period keep it as it is, if not calculated best interval is used
            if (!(minIntervalTime <= currentIntervalTime && currentIntervalTime <= maxIntervalTime)) {

                if (defaultIntervalTime >= minIntervalTime && defaultIntervalTime <= maxIntervalTime) {
                    // set the default interval if the default interval is in the possible range
                    newInterval = defaultInterval;
                } else {
                    // since current interval goes beyond the supported range of intervals apply the nearest possible interval for the period
                    newInterval = currentIntervalTime < minIntervalTime ? minInterval : maxInterval;
                }

            }
        } else if ((defaultInterval && currentInterval != defaultInterval)) {
            if (defaultIntervalTime > minIntervalTime && defaultIntervalTime < maxIntervalTime) {
                // old - set the default interval if the default interval is in the possible range
                // new - set the min interval if the default interval is in the possible range
                if (minInterval && currentInterval != minInterval) {
                    newInterval = minInterval;
                } else {
                    // newInterval = defaultInterval;
                }
            } else if ((minInterval && currentInterval != minInterval)) {
                newInterval = minInterval;
            }
        } else if ((minInterval && currentInterval != minInterval)) {
            // Set the calculated minInterval as the interval always. Doesn't keep the current interval even if it is applicable to the new period.
            newInterval = minInterval;
        }

        if (newInterval) {
            // reset all the properties since a new interval will be set
            this.data = {compare: {}, base: []};
            this.dataMap = {compare: {}, base: {}};
            this.rawData = {compare: {}, base: {}};
            this.processedData.data = [];
            this.processedData.ohlcv = undefined;
            this.recalStart = {};
            this.processedData.compareSymbols = {};
            this.setInterval(newInterval, undefined, false, true);
            if (this._isToolbarEnabled()) {
                infChart.toolbar.setSelectedControls(this.id, "interval", newInterval);
            }
        }

    } else if (period === 'C') {
        if (isManually) {
            // reset all the properties since a new interval will be set
            this.data = {compare: {}, base: []};
            this.dataMap = {compare: {}, base: {}};
            this.rawData = {compare: {}, base: {}};
            this.processedData.data = [];
            this.processedData.ohlcv = undefined;
            this.recalStart = {};
            this.processedData.compareSymbols = {};
            this.setInterval(this.interval, undefined, false, true, undefined, range);
        }
    }
    //this.setDataGrouping();
};

/**
 * Returns the count of the minimum possible data points for the current width
 * @returns {number}
 * @private
 */
infChart.StockChart.prototype._getMinPointCount = function () {

    var groupedPixelWidth = infChart.settings.defaults.maxGroupPixelWidth || 10,
        minDataCount = Math.floor(this._getChartPlotSizeXForPointCount() / groupedPixelWidth);

    return minDataCount;
};

/**
 * Returns the count of the maximum possible data points for the current width
 * @returns {number}
 * @private
 */
infChart.StockChart.prototype._getMaxPointCount = function () {

    var groupedPixelWidth = infChart.settings.defaults.minGroupPixelWidth || 1,
        maxDataCount = Math.floor(this._getChartPlotSizeXForPointCount() / groupedPixelWidth);

    return maxDataCount;
};

/**
 * Returns the adjusted plot size x since chart does not have the correct width when loading before displaying data (yAxis width is not set)
 * So the yAxis width is saved with the config and used that when loading untile data is displayed
 * (That saved y Axis width is used only if current chart's width is same as the chart's width by the time of saving y Axis width )
 * @returns {*}
 * @private
 */
infChart.StockChart.prototype._getChartPlotSizeXForPointCount = function () {

    var plotSizeX = this.chart.plotSizeX;
    if (this.isFirstLoadInprogress() && this.settings && this.settings.config.marginRight && this.settings.config.chartWidth &&
        this.settings.config.chartWidth == this.chart.chartWidth) {
        plotSizeX -= this.settings.config.marginRight;
    }

    return plotSizeX;
};

/**
 * Returns the maximum time interval that can be zoomed in milliseconds
 * @returns {number}
 */
infChart.StockChart.prototype.getMaxZoomRange = function () {

    if (this.chart.plotSizeX) {

        var data = this.processedData.data,
            maxDataCount = this._getMaxPointCount(),
            dataMax = data && data[data.length - 1] && data[data.length - 1][0],
            extStart;

        if(data && data.length > 0) {
            if(data.length >= maxDataCount) {
                extStart = data[data.length - maxDataCount][0];
            } else {
                extStart = data[0][0];
            }
        } else {
            extStart = dataMax && this.getShiftedTime(dataMax, this.interval, maxDataCount);
        }

        if (dataMax && extStart == dataMax) {
            var minIdx = Math.max(data.length - 1 - maxDataCount, 0);
            extStart = data[minIdx] && data[minIdx][0];
        }

        if (extStart) {
            // var minExVal = Math.max(this.minRangeVal, extStart);
            return (dataMax - extStart);
        }
    }
};

/**
 * Returns the maximums zoom range in pixels which will be benifitted in non-linear axes
 * @returns {undefined|number} range in pixels
 */
infChart.StockChart.prototype.getMaxZoomRangePx = function () {
    var scroller = this.chart && this.chart.scroller;
    return scroller && (scroller.size / scroller.baseSeries[0].options.data.length ) * this._getMaxPointCount();
};

/**
 * Returns the number of points that can be drawn in the current space
 * @returns {number} number of points
 */
infChart.StockChart.prototype.getPointsCountForCurrentDisplaySpace = function () {
    var xAxis = this.getMainXAxis();
    if (!this.isLinearData()) {
        var xTimeMap = this.getAllTimeTicks();
        var xData = Object.keys(xTimeMap);
        if (xData.length) {
            var minIndex = Math.abs(infChart.util.binaryIndexOf(xData, undefined, xAxis.min));
            var maxIndex = Math.abs(infChart.util.binaryIndexOf(xData, undefined, xAxis.max));
            return maxIndex - minIndex + 1;
        }
    } else {
        var intervalTime = this.intervalOptions[this.interval] && this.intervalOptions[this.interval].time;
        return (xAxis.max - xAxis.min) / intervalTime;
    }
};

/**
 * Returns total points
 * @returns {object} all points
 */
infChart.StockChart.prototype.calculateTotalPoints = function (chart) {
    var xTimeMap = infChart.manager.getAllTimeTicks(chart);
    var points = Object.keys(xTimeMap).sort();
    if(chart){
        var seriesPoints = JSON.parse(JSON.stringify(chart.series[0].xData));
        for (let i = seriesPoints.length; i < points.length; i++) {
            seriesPoints.push(parseFloat(points[i]));
        }
        return seriesPoints;
    }else{
        return points;
    }
};

/**
 * Returns the maximum possible interval for the given period
 * @param period
 * @returns {*}
 */
infChart.StockChart.prototype.getMaxInterval = function (period) {

    if (this.chart.plotSizeX && this.sortedIntervals && this.sortedIntervals.length > 0) {

        var currentTime = (new Date()).getTime(),
            minTime = this._getMinDate(period, currentTime, true),
            maxDataCount = this._getMinPointCount(),
            calculatedInterval = (currentTime - minTime) / maxDataCount,
            interval,
            prevInterval;

        for (var i = this.sortedIntervals.length - 1; i >= 0; i--) {
            prevInterval = this.sortedIntervals[i + 1];
            interval = this.sortedIntervals[i];
            if (calculatedInterval > interval.time) {
                break;
            }
        }

        /*if (prevInterval && (prevInterval.time - calculatedInterval) < (calculatedInterval - interval.time) && calculatedInterval > prevInterval.time / 2) {
         interval = prevInterval;
         }*/

        return interval && interval.key;
    }
};

/**
 * Returns the maximum possible interval for the given period
 * @param period
 * @returns {*}
 */
infChart.StockChart.prototype.getMinInterval = function (period) {

    if (this.chart.plotSizeX && this.sortedIntervals && this.sortedIntervals.length > 0) {

        var currentTime = (new Date()).getTime(),
            minTime = this._getMinDate(period, currentTime, true),
            maxDataCount = this._getMaxPointCount(),
            calculatedInterval = (currentTime - minTime) / maxDataCount,
            interval,
            prevInterval;

        for (var i = 0, iLen = this.sortedIntervals.length; i < iLen; i++) {
            prevInterval = this.sortedIntervals[i - 1];
            interval = this.sortedIntervals[i];
            if (calculatedInterval < interval.time) {
                break;
            }
        }

        /*if (prevInterval && (calculatedInterval - prevInterval.time) < (interval.time - calculatedInterval) && calculatedInterval / 2 < prevInterval.time) {
         interval = prevInterval;
         }*/

        return interval && interval.key;
    }
};

/**
 * Returns the maximum possible period for the given interval
 * @param interval
 * @returns {*}
 */
infChart.StockChart.prototype.getMaxPeriod = function (interval) {

    if (this.chart.plotSizeX && this.sortedPeriods && this.sortedPeriods.length > 0) {

        var maxDataCount = this._getMaxPointCount(),
            calculatedInterval = this.intervalOptions[interval] && this.intervalOptions[interval].time,
            calculatedPeriod = maxDataCount * calculatedInterval,
            period,
            prevPeriod;

        for (var i = this.sortedPeriods.length - 1; i >= 0; i--) {
            prevPeriod = this.sortedPeriods[i + 1];
            period = this.sortedPeriods[i];
            if (calculatedPeriod > period.time) {
                break;
            }
        }

        if(!prevPeriod){
            prevPeriod = period;
        }

        /*if (prevPeriod /!*&&  (period.time -  calculatedPeriod ) > (calculatedPeriod - prevPeriod.time)*!/) {
         period = prevPeriod;
         }*/

        return prevPeriod && prevPeriod;
    }
};

/**
 * Returns the minimum possible period for the given interval
 * @param interval
 * @returns {*}
 */
infChart.StockChart.prototype.getMinPeriod = function (interval) {

    if (this.chart.plotSizeX && this.sortedPeriods && this.sortedPeriods.length > 0) {

        var maxDataCount = this._getMinPointCount(),
            calculatedInterval = this.intervalOptions[interval] && this.intervalOptions[interval].time,
            calculatedPeriod = maxDataCount * calculatedInterval,
            period,
            prevPeriod;

        for (var i = 0, iLen = this.sortedPeriods.length; i < iLen; i++) {
            prevPeriod = this.sortedPeriods[i - 1];
            period = this.sortedPeriods[i];
            if (calculatedPeriod < period.time) {
                break;
            }
        }

        if(!prevPeriod){
            prevPeriod = period;
        }

        /*if (prevPeriod /!*&&  (period.time -  calculatedPeriod ) > (calculatedPeriod - prevPeriod.time)*!/) {
         period = prevPeriod;
         }*/

        return prevPeriod && prevPeriod;
    }
};

/**
 * Set the min value where data grouping is not required
 * @param data
 * @private
 */
infChart.StockChart.prototype._setUnGroupedRange = function (data) {

    if (this.chart.plotSizeX) {
        var maxDataCount = this._getMaxPointCount(),
            dataMax = data && data[data.length - 1] && data[data.length - 1][0],
            extStart = dataMax && this.getShiftedTime(dataMax, this.interval, maxDataCount);
        if (dataMax && extStart == dataMax) {
            var minIdx = Math.max(data.length - 1 - maxDataCount, 0);
            extStart = data[minIdx] && data[minIdx][0];
        }
        if (extStart && this.minRangeVal < extStart) {
            this.minExVal = extStart;
        }
    }

};

/**
 * Shift the given time to givin no of points and interval
 * @param time
 * @param interval
 * @param count
 * @returns {*}
 */
infChart.StockChart.prototype.getShiftedTime = function (time, interval, count) {
    var dt;

    switch (interval) {
        case 'T':
            return time;
        case 'I_1':
            return time - count * 60000;
        case 'I_2':
            return time - count * 2 * 60000;
        case 'I_3':
            return time - count * 3 * 60000;
        case 'I_5':
            return time - count * 5 * 60000;
        case 'I_10':
            return time - count * 10 * 60000;
        case 'I_15':
            return time - count * 15 * 60000;
        case 'I_30':
            return time - count * 30 * 60000;
        case 'I_60':
            return time - count * 60 * 60000;
        case 'I_120':
            return time - count * 120 * 60000;
        case 'I_240':
            return time - count * 240 * 60000;
        case 'I_360':
            return time - count * 360 * 60000;

        case 'D':
            dt = infChart.util.getDerivedDate(time);
            return Date.UTC(dt.year, dt.month, dt.day - count, dt.hour, dt.minute, dt.second, dt.milliSecond);
        //TODO get last day of week , month or year;

        case 'W':
            dt = infChart.util.getDerivedDate(time);
            return Date.UTC(dt.year, dt.month, dt.day - 7 * count, dt.hour, dt.minute, dt.second, dt.milliSecond);
        case 'M':
            dt = infChart.util.getDerivedDate(time);
            return Date.UTC(dt.year, dt.month - count, dt.day, dt.hour, dt.minute, dt.second, dt.milliSecond);
        case 'Y':
            dt = infChart.util.getDerivedDate(time);
            return Date.UTC(dt.year - count, dt.month, dt.day, dt.hour, dt.minute, dt.second, dt.milliSecond);
    }

};

infChart.StockChart.prototype.getNextTickTime = function (currentTickTime, interval, isBackward) {
    var dt, direction = isBackward ? -1 : 1, tickTime;

    switch (interval) {
        case 'T':
            tickTime = 0;
            break;
        case 'I_1':
            tickTime = currentTickTime + (direction * 60000);
            break;
        case 'I_2':
            tickTime = currentTickTime + (direction * 2 * 60000);
            break;
        case 'I_3':
            tickTime = currentTickTime + (direction * 3 * 60000);
            break;
        case 'I_5':
            tickTime = currentTickTime + (direction * 5 * 60000);
            break;
        case 'I_10':
            tickTime = currentTickTime + (direction * 10 * 60000);
            break;
        case 'I_15':
            tickTime = currentTickTime + (direction * 15 * 60000);
            break;
        case 'I_30':
            tickTime = currentTickTime + (direction * 30 * 60000);
            break;
        case 'I_60':
            tickTime = currentTickTime + (direction * 60 * 60000);
            break;
        case 'I_120':
            tickTime = currentTickTime + (direction * 120 * 60000);
            break;
        case 'I_240':
            tickTime = currentTickTime + (direction * 240 * 60000);
            break;
        case 'I_360':
            tickTime = currentTickTime + (direction * 360 * 60000);
            break;
        case 'D':
            dt = infChart.util.getDerivedDate(currentTickTime);
            tickTime = Date.UTC(dt.year, dt.month, dt.day + direction, dt.hour, dt.minute, dt.second, dt.milliSecond);
            //return currentTickTime + 24 * 60 * 60000;
            //TODO get last day of week , month or year;
            break;
        case 'W':
            dt = infChart.util.getDerivedDate(currentTickTime);
            tickTime = Date.UTC(dt.year, dt.month, dt.day + direction * 7, dt.hour, dt.minute, dt.second, dt.milliSecond);
            //return currentTickTime + 7 * 24 * 60 * 60000;
            break;
        case 'M':
            dt = infChart.util.getDerivedDate(currentTickTime);
            tickTime = Date.UTC(dt.year, dt.month + direction, dt.day, dt.hour, dt.minute, dt.second, dt.milliSecond);
            //return currentTickTime + 30 * 24 * 60 * 60000;
            break;
        case 'Y':
            dt = infChart.util.getDerivedDate(currentTickTime);
            tickTime = Date.UTC(dt.year + direction, dt.month, dt.day, dt.hour, dt.minute, dt.second, dt.milliSecond);
            //return currentTickTime + 30 * 24 * 60 * 60000;
            break;
        default:
            break;
    }
    return tickTime;
};

///**
// * Check whether the current extremes of x axis is similar to default extremes
// */
//infChart.StockChart.prototype.isDefaultXAxisExtremes = function (currentXAxisExtremes) {
//    return this.defaultXAxisExtremes ? (currentXAxisExtremes.min === this.defaultXAxisExtremes.min && currentXAxisExtremes.max === this.defaultXAxisExtremes.max) : true;
//};

infChart.StockChart.prototype._setChartToMaxPossiblePeriod = function (redraw) {

    var extremes = this.getRange(),
        extremestMin = extremes.min || extremes.userMin,
        extremestMax = extremes.max || extremes.userMax,
        max = (this.chart.infManualExtreme) ? extremestMax : this.maxRangeVal,
        minFromCustomCandleCount = this._getMinDateFromCustomCandleCount(),
        minEx = (minFromCustomCandleCount && this.candleCountEnable) ? minFromCustomCandleCount : (this._getMinDate(this.period, max) || this.minExVal) || this.minRangeVal,
    //min = (this.chart.infManualExtreme) ? /*(minEx > extremes.min) ? minEx :*/ extremes.min : ( minEx > this.minRangeVal ) ? minEx : this.minRangeVal,
        min = this.chart.infManualExtreme ? extremestMin : (minEx > this.minRangeVal || !this.setMaxAvailablePeriod) ? minEx : this.minRangeVal || minEx,
        minMaxValues,
        defaultMin = min;

    if (!this.chart.infManualExtreme && (this.setMaxAvailablePeriod)) {
        minMaxValues = this.getMinMaxRangeValues();
        min = Math.min(minMaxValues.min, minEx); // TODO :: need to set minRange or set all the data  in the compare load
    }

    if (this.chart.infManualExtreme) {
        var defaultEx = this.defaultXAxisExtremes,
            defaultMinTemp = this._getMinDate(this.period, this.maxRangeVal) || (defaultEx && defaultEx.min) || minEx;
        defaultMin = minFromCustomCandleCount && this.candleCountEnable ? minFromCustomCandleCount : (defaultMinTemp > this.minRangeVal || !this.setMaxAvailablePeriod) ? defaultMinTemp : this.minRangeVal || defaultMinTemp
    }

    this._setDefaultXAxisExtremes(defaultMin, this.maxRangeVal); // Saving default xAxis extremes to show hide reset xAxis button

    var fireAfterRedrawXAxisWithoutSetExtremes = false;
    if (min != extremestMin || max != extremestMax) {
        // this.setRange(min, max);
        this.setXAxisExtremes(min, max, false, false);
    } else {
        fireAfterRedrawXAxisWithoutSetExtremes = true;
    }

    if (redraw) {
        this.chart.redraw();
    }
    if(fireAfterRedrawXAxisWithoutSetExtremes) {
        this._fireEventListeners('afterRedrawXAxisWithoutSetExtremes');
    }
};

infChart.StockChart.prototype._getMinDateFromCustomCandleCount = function () {
    var baseData = this.data.base;
    var customCandleCount = this.customCandleCount;

    if (baseData) {
        var minCanlde = baseData[baseData.length - customCandleCount];
        return minCanlde[0];
    }
};

/**
 * Returns the possible min range value for the chart
 * @returns {*|newMinRangeVal}
 */
infChart.StockChart.prototype.getPossibleMinRangeValue = function () {
    var currentEx = this.getRange(),
        max = this.getMaxDisplayTime(),
        extremeMax = (this.chart.infManualExtreme && currentEx && (currentEx.max || currentEx.userMax)) || max,
        extremeMin = this._getMinDate(this.period, extremeMax),
        minRangeVal = this.minRangeVal || extremeMin;

    if (this.settings && this.settings.config.showAllHistory && this.setMaxAvailablePeriod) {

        var minMaxValues = this.getMinMaxRangeValues();
        minRangeVal = minMaxValues.min;

    }
    return minRangeVal;

};

//endregion ================== end of Period/Interval ==================================================================

/**
 * calculate and set main series data
 * @private
 */
infChart.StockChart.prototype._setMainSeriesDataToChart = function (data, redraw) {
    this.getMainSeries().setData(data, false, false, false);

    if (this.chart.scroller && this.chart.scroller.series) {
        var seriesArr = (Array.isArray(this.chart.scroller.series)) ? this.chart.scroller.series.length > 0 ? this.chart.scroller.series : [] : [this.chart.scroller.series];
        if (seriesArr.length > 0) {
            for (var i = 0; i < seriesArr.length - 1; i++) {
                if(seriesArr[i].hasGroupedData && seriesArr[i].groupedData) {
                    /*When navigator height is zero highcharts assign empty points to series's groupedData object. When removing those series
                    * highcharts call destroy method of those point which cause exceptions in highcharts library. Hence we are removing those
                    * series data from here to avoid exceptions
                    * */

			        seriesArr[i].hasGroupedData = false;
			        seriesArr[i].groupedData = undefined;
			    }
                seriesArr[i].remove(redraw);
            }

            if (seriesArr[seriesArr.length - 1] && seriesArr[seriesArr.length - 1].setData) {
                seriesArr[seriesArr.length - 1].setData(data, false, false, false);
            }

            seriesArr.splice(0, seriesArr.length - 1);
        }
    }
    if (redraw) {
        this.chart.redraw();
    }
};

/**
 * _cleanNavigatorSeries
 * @param redraw
 * @param data
 * @private
 */
infChart.StockChart.prototype._cleanNavigatorSeries = function (redraw, data) {
    if (this.chart.scroller && this.chart.scroller.series) {
        var seriesArr = (Array.isArray(this.chart.scroller.series)) ? this.chart.scroller.series.length > 0 ? this.chart.scroller.series : [] : [this.chart.scroller.series];
        if (seriesArr.length > 0) {
            var i = 0, len = seriesArr.length - 1;
            for (i; i < len; i++) {
                if (seriesArr[i]) {
                    if(seriesArr[i].hasGroupedData && seriesArr[i].groupedData) {
                        /*When navigator height is zero highcharts assign empty points to series's groupedData object. When removing those series
                        * highcharts call destroy method of those point which cause exceptions in highcharts library. Hence we are removing those
                        * series data from here to avoid exceptions
                        * */
    			        seriesArr[i].hasGroupedData = false;
    			        seriesArr[i].groupedData = undefined;
    			    }
                    seriesArr[i].remove(false);
                }
            }

            if (data && seriesArr[len]) {
                seriesArr[len].setData(data, false, false, false);
            }
            seriesArr.splice(0, len);
        }
    }
    if (redraw) {
        this.chart.redraw();
    }
};

/**
 * _cleanNavigatorSeries
 * @param redraw
 * @param data
 * @private
 */
infChart.StockChart.prototype._symbolSeries = function (redraw) {
    if (this.chart.series) {
        var seriesArr = (this.chart.series && this.chart.series.length > 0) ? this.chart.series : [];
        if (seriesArr.length > 0) {
            var i = 0, len = seriesArr.length;
            for (i; i < len; i++) {
                if (seriesArr[i].options.data && seriesArr[i].options.data.length &&
                    (seriesArr[i].options.infType == "compare" || seriesArr[i].options.infType == "base" || seriesArr[i].options.infType == "dummy")) {
                    seriesArr[i].setData([], false, false, false);
                }
            }
        }
    }
    if (redraw) {
        this.chart.redraw();
    }
};

infChart.StockChart.prototype._getInitialValue = function (data, index) {
    var value;
    infChart.util.forEach(data, function (i, val) {
        if (val && val[index] != null && val[index] != undefined) {
            value = val;
            return true;
        }
    });
    return value;
};

infChart.StockChart.prototype._processData = function (data, isCompare, isLog, isPercent, setDummy, seriesId, timeMap) {

    // this.processedData.ohlcv = undefined;

    var initialClose = 0,
        o, h, l, c, v, a, b, ah, bl,
        tempData = [],
        dummyData = [],
        self = this,
        prevTime,
        currentTime,
        min,
        max,
        count = 0,
        dummyCount = 0,
        recalStart = this.recalStart[seriesId] || 0, // When updating chart real-time there is no need to process the data from the beiginning so it starts the calculation from the recalStart value for the given series which is set when updating ticks
        initialVal;

    timeMap = timeMap || {};

    infChart.util.forEach(data, function (i, val) {

        if (val) {
            currentTime = undefined;
            /*if (isPercent) {

             if (initialVal) {

             o = val[1] == null || !initialClose ? null : (val[1] / initialClose - 1) * 100;
             h = val[2] == null || !initialClose ? null : (val[2] / initialClose - 1) * 100;
             l = val[3] == null || !initialClose ? null : (val[3] / initialClose - 1) * 100;
             c = val[4] == null || !initialClose ? null : (val[4] / initialClose - 1) * 100;
             v = val[5] == null || !initialClose ? null : val[5] <= 0 ? 0 : (val[5] / initialClose - 1) * 100;
             b = val[6] == null || !initialClose ? null : (val[6] / initialClose - 1) * 100;
             a = val[7] == null || !initialClose ? null : (val[7] / initialClose - 1) * 100;
             ah = val[8] == null || !initialClose ? null : (val[8] / initialClose - 1) * 100;
             bl = val[9] == null || !initialClose ? null : (val[9] / initialClose - 1) * 100;
             tempData[count] = [val[0], o, h, l, c, v, b, a, ah, bl];
             count++;

             } else if (!initialVal) { // Initial value is yet to be set for this loop

             if (!recalStart && val[4] > 0) { // processing data from the beginning and this is the first value
             initialVal = val

             } else { // processing data from the middle(from updateTicks) and setting the first value as the initial value
             // TODO :: get the first data available item
             initialVal = self._getInitialValue(data,4);
             }

             if (initialVal && initialVal[4]) {
             initialClose = isLog ? self._num2Log(initialVal[4]) : initialVal[4];
             o = val[1] == null ? null : isLog ? (self._num2Log(val[1]) / initialClose - 1) * 100 : (val[1] / initialClose - 1) * 100;
             h = val[2] == null ? null : isLog ? (self._num2Log(val[2]) / initialClose - 1) * 100 : (val[2] / initialClose - 1) * 100;
             l = val[3] == null ? null : isLog ? (self._num2Log(val[3]) / initialClose - 1) * 100 : (val[3] / initialClose - 1) * 100;
             c = val[4] == null ? null : isLog ? (self._num2Log(val[4]) / initialClose - 1) * 100 : (val[4] / initialClose - 1) * 100;
             v = val[5] == null ? null : val[5] <= 0 ? 0 : isLog ? (self._num2Log(val[5]) / initialClose - 1) * 100 : (val[5] / initialClose - 1) * 100;
             b = val[6] == null ? null : isLog ? (self._num2Log(val[6]) / initialClose - 1) * 100 : (val[6] / initialClose - 1) * 100;
             a = val[7] == null ? null : isLog ? (self._num2Log(val[7]) / initialClose - 1) * 100 : (val[7] / initialClose - 1) * 100;
             ah = val[8] == null ? null : isLog ? (self._num2Log(val[8]) / initialClose - 1) * 100 : (val[8] / initialClose - 1) * 100;
             bl = val[9] == null ? null : isLog ? (self._num2Log(val[9]) / initialClose - 1) * 100 : (val[9] / initialClose - 1) * 100;
             tempData[count] = [val[0], o, h, l, c, v, b, a, ah, bl];
             count++
             }
             }

             max = (isNaN(max) || max < h) ? h : max;
             min = (isNaN(min) || min > h) ? h : min;


             }
             /!*else if (isCompare) {
             if (tempData.length > 0) {
             o = isLog ? that._num2Log(val[1]) - initialClose : val[1] - initialClose;
             h = isLog ? that._num2Log(val[2]) - initialClose : val[2] - initialClose;
             l = isLog ? that._num2Log(val[3]) - initialClose : val[3] - initialClose;
             c = isLog ? that._num2Log(val[4]) - initialClose : val[4] - initialClose;
             v = isLog ? that._num2Log(val[5]) - initialClose : val[5] - initialClose;
             tempData.push([val[0], o, h, l, c, v]);
             } else {
             initialClose = isLog ? that._num2Log(val[4]) : val[4];
             tempData.push([val[0], 0, 0, 0, 0, 0]);
             }
             }*!/
             else*/
            if (isLog) {

                o = val[1] == null ? null : self._num2Log(val[1]);
                h = val[2] == null ? null : self._num2Log(val[2]);
                l = val[3] == null ? null : self._num2Log(val[3]);
                c = val[4] == null ? null : self._num2Log(val[4]);
                v = val[5] == null ? null : val[5] <= 0 ? 0 : self._num2Log(val[5]);
                b = val[6] == null ? null : self._num2Log(val[6]);
                a = val[7] == null ? null : self._num2Log(val[7]);
                ah = val[8] == null ? null : self._num2Log(val[8]);
                bl = val[9] == null ? null : self._num2Log(val[9]);
                tempData[count] = [val[0], o, h, l, c, v, b, a, ah, bl];
                count++;

                max = (isNaN(max) || max < h) ? h : max;
                min = (isNaN(min) || min > h) ? h : min;
            } else {
                tempData[count] = val;
                count++;
                h = (!isNaN(val[2]) && val[2]) || val[4];
                max = (isNaN(max) || max < h) ? h : max;
                min = (isNaN(min) || min > h) ? h : min;
            }

            self.addValueToTimeMap(val[0], seriesId, timeMap);

            if (setDummy && prevTime != val[0] && prevTime && self.interval != 'T') {

                for (var tempTime = self.getNextTickTime(prevTime, self.interval);
                     tempTime < val[0];
                     tempTime = self.getNextTickTime(tempTime, self.interval)) {
                    dummyData[dummyCount] = [tempTime, null, null, null, null, null];
                    dummyCount++;
                }
            }
            prevTime = val[0];
        }
    }, recalStart); // Process updated points only if invoked from updateTicks
    //}

    if (!recalStart || !this.seriesActualMinMax[seriesId]) {
        this.seriesActualMinMax[seriesId] = {dataMin: min, dataMax: max};
    } else {
        var seriesMinMax = this.seriesActualMinMax[seriesId];
        seriesMinMax.dataMin = Math.min(min, seriesMinMax.dataMin);
        seriesMinMax.dataMax = Math.max(max, seriesMinMax.dataMax);
    }
    return {
        data: tempData, dummyData: dummyData,
        dataMin: this.seriesActualMinMax[seriesId].dataMin,
        dataMax: this.seriesActualMinMax[seriesId].dataMax,
        timeMap: timeMap
    };
};

infChart.StockChart.prototype.getSeriesProcessedValue = function (series, val) {

    var returnVal = this.getProcessedValue(series, val);

    /* Apply the correction with the compareValue for the proccessed value
     since actual value used in the highchart object is derived using compareValue*/
    if (returnVal != undefined) {
        var compareValue = this.getSeriesCompareValue(series),
            sign,
            chart = this.chart;


        if (this.isCompare) {
            /*var mainSeries = this.getMainSeries(),
             cropStart = mainSeries.cropStart,
             diff = compareValue,
             baseInitRow = this._getInitialValue(this.processedData.data, 4),
             initialClose = baseInitRow && baseInitRow[4];

             if (this.processedData.data.length > 0 && cropStart && this.compareSymbols.count > 0) {
             if (mainSeries.groupedData && mainSeries.currentDataGrouping) {
             diff = this.processedData.data[cropStart][4] - initialClose;
             }
             else {
             diff = this.processedData.data[cropStart][4] - initialClose;
             }
             }*/
            if (this.isLog) {
                //sign = (returnVal < 0) ? -1 : 1;
                //returnVal -= (compareValue * sign);
                if (this.isPercent) {
                    returnVal = (returnVal / compareValue - 1) * 100;
                }
            } else {
                if (this.isPercent && compareValue) {
                    //sign = (returnVal < 0) ? -1 : 1;
                    returnVal = (returnVal / compareValue - 1) * 100;
                }
                /*
                 else {
                 // returnVal -= diff;
                 }*/
            }
        }
    }
    return returnVal;
};

/**
 * Returns the actual data min/max of the series regardless of the displayed data
 * @param seriesId
 * @returns {*}
 */
infChart.StockChart.prototype.getSeriesActualExtremes = function (seriesId) {
    var chart = this.chart,
        series = chart && chart.get(seriesId),
        compareValue = this.getSeriesCompareValue(series);

    if (seriesId) {
        if (compareValue && this.isPercent && this.isCompare) {
            return {
                dataMax: (this.seriesActualMinMax[seriesId].dataMax / compareValue - 1) * 100,
                dataMin: (this.seriesActualMinMax[seriesId].dataMin / compareValue - 1) * 100
            }
        } else {
            return this.seriesActualMinMax[seriesId];
        }
    } else if (this.chart.options.navigator.enabled && this.chart.options.navigator.series && this.chart.options.navigator.length) {
        var nav = this.chart.options.navigator.series[0];
        return {dataMax: nav.dataMax, dataMin: nav.dataMin};
    } else {
        // TODO :: need to go through all the compare series and base series. Since base series implementation is
        // enough for the time being this section is not omplemented
    }
};

/**
 * set x axis values based on selected chart type
 * if not tick by tick time component from date will be removed
 * @param dateTime value
 */
infChart.StockChart.prototype.getDateTime = function (dateTime) {
    switch (this.interval) {
        case 'D':
        case 'W':
        case 'M':
            var d = new Date(dateTime);
            //d.setHours(0, 0, 0, 0);
            dateTime = d.getTime();
            break;
        default:
            break;
    }
    return dateTime;
};

infChart.StockChart.prototype._num2Log = function (num) {
    if (num !== 0) {
        return Math.log(num) / Math.LN10;
    }
    return 0;
};

infChart.StockChart.prototype._log2Num = function (num) {
    return Math.pow(10, num);
};

infChart.StockChart.prototype._plotter = function (ind) {
    try {
        var axis = ind.getAxisId(),
            iChart = this,
            hChart = this.chart,
            yAxis = hChart.get(axis),
            x, y,
            resizeTheme = Highcharts.theme && Highcharts.theme.resizeHandler || {
                    backgroundColor: '#383E4C',
                    color: '#9C9C9C',
                    height: 4
                };

        if (yAxis && !isNaN(yAxis.left) && yAxis.left != null && !isNaN(yAxis.top) && yAxis.left != null) {
            x = yAxis.left;
            y = yAxis.top /*- 6*/;

            if (!hChart.axisTitles)
                hChart.axisTitles = {};

            if (!hChart.axisTitles[axis + '_bg']) {
                //  chart.axisTitles[axis + '_bg'] = chart.renderer.rect(x, y - 14, 5000, 20, 0).add();
                //chart.axisTitles[axis] = chart.renderer.text(text, x, y).add();
            }
            //chart.axisTitles[axis + '_bg'].attr({
            //    x: x,
            //    y: y - 14,
            //    fill: Highcharts.theme.indicator.axisBackgroundColor // TODO : get from theme
            //});

            if (!hChart.axisTitles[axis + '_resize']) {

                hChart.axisTitles[axis + '_resize'] = hChart.renderer.rect(x, y /*- 14*/ - resizeTheme.height, hChart.plotWidth, resizeTheme.height, 0).attr({
                    fill: resizeTheme.backgroundColor, cursor: "row-resize"
                }).add();

                hChart.axisTitles[axis + '_resizeH'] = hChart.renderer.text('=', hChart.plotWidth / 2, y /*- 14*/ - resizeTheme.height).attr({
                    fill: resizeTheme.color, cursor: "row-resize"
                }).add();

                var _dragFunction = function (event) {
                    this.crosshairType = (!iChart.resizing) ? iChart.crosshair.enabled : this.crosshairType;
                    //this.crosshairType = that.crosshair.enabled;
                    iChart.resizing = true;
                    iChart.crosshair.enabled = false;
                    if (event.chartY > 20) {
                        var currentY = yAxis.top/* - 6 - 14*/ - resizeTheme.height;
                        var targetY = event.chartY;

                        yAxis = hChart.get(axis);

                        var prevInd = iChart._getPreviousIndicator(ind.id);

                        var prevIndAxis = iChart._getPreviousPanelY(ind.id);

                        if (currentY > targetY) {
                            var maxY = prevIndAxis.top + 10;
                            if ((maxY) > targetY) {
                                targetY = maxY;
                            }
                        } else {
                            var minY = yAxis.top + yAxis.height /*- 20 */ - resizeTheme.height - 10;
                            if (minY < targetY) {
                                targetY = minY
                            }
                        }

                        var newHeight = yAxis.height /*+ 20*/ + resizeTheme.height + (currentY - targetY);
                        ind.heightPercent = (newHeight / iChart.indicatorFrameHeight) * 100;

                        var prevIndNewHeight = prevIndAxis.height - (currentY - targetY);
                        var newAxisHieght = yAxis.height + (currentY - targetY);

                        if (newHeight > 0 && prevIndNewHeight > 0 && newAxisHieght > 0) {

                            yAxis.update({
                                top: yAxis.top - (currentY - targetY), // 20 - indicator title height, 4- indicator resize handler
                                height: newAxisHieght
                            }, false);


                            prevIndAxis.update({
                                top: prevIndAxis.top, // 20 - indicator title height, 4- indicator resize handler
                                height: prevIndNewHeight
                            }, true);

                            iChart._plotter(ind);

                            if (prevInd) {
                                var prevInHeight = prevIndAxis.height /*+ 20*/ + resizeTheme.height - (currentY - targetY);
                                prevInd.heightPercent = (prevInHeight / iChart.indicatorFrameHeight) * 100;
                                iChart._plotter(prevInd);
                            } else {
                                var parallelToBaseAxes = infChart.indicatorMgr.getParallelToBaseAxes(iChart.id);
                                for (var i = 0, iLen = parallelToBaseAxes.length; i < iLen; i++) {
                                    /*hChart.get(parallelToBaseAxes[i]).update({
                                     /!*top: prevIndAxis.top,*!/
                                     height: prevIndNewHeight
                                     }, false);*/
                                    var parallelAxis = hChart.get(parallelToBaseAxes[i]),
                                        parallelAxisHeight = prevIndNewHeight * (parallelAxis.options.infHeightPercent || 0.3),
                                        topCorr = 1,
                                        parallelAxisTop = (hChart.yAxis[0].top || 0) + prevIndNewHeight - parallelAxisHeight - topCorr;
                                    hChart.get(parallelToBaseAxes[i]).update({
                                        top: parallelAxisTop,
                                        //bottom: mainHeight,
                                        height: parallelAxisHeight
                                    }, false);
                                }
                                //iChart.updateYAxis(hChart.get('#1'), {
                                //    top: prevIndAxis.top,
                                //    height: prevIndNewHeight
                                //}, false);
                                iChart.updateMinMax();
                                iChart.adjustPriceLineLabels();
                                iChart.onBaseAxisResize();
                            }
                        } else {
                            infChart.util.console.log("newHeight:" + newHeight + " prevIndNewHeight:" + prevIndNewHeight + " newAxisHieght:" + newAxisHieght);
                        }
                    }
                };

                var _stopFunction = function () {
                    iChart.crosshair.enabled = this.crosshairType;
                    iChart.resizing = false;
                    setTimeout(function () {
                        var prevInd = iChart._getPreviousIndicator(ind.id),
                            i, len,
                            isBaseResized;
                        if (prevInd) {
                            for (i = 0, len = prevInd.series.length; i < len; i++) {
                                prevInd.series[0].update({}, false);
                            }
                        } else {
                            isBaseResized = true;
                        }

                        for (i = 0, len = ind.series.length - 1; i < len; i++) {
                            ind.series[0].update({}, false);
                        }

                        ind.series[len].update({}, true);

                        //iChart.scaleDrawings(iChart.id);

                        if (isBaseResized) {
                            iChart.onBaseAxisResize();
                        }
                    }, 1);

                };

                // bind events for both handler and bar
                //infChart.util.bindDragEvents(hChart.axisTitles[axis + '_resize'], _dragFunction, _stopFunction);
                //infChart.util.bindDragEvents(hChart.axisTitles[axis + '_resizeH'], _dragFunction, _stopFunction);
                infChart.util.bindDragEvents(hChart, hChart.axisTitles[axis + '_resize'], _dragFunction, _stopFunction);
                infChart.util.bindDragEvents(hChart, hChart.axisTitles[axis + '_resizeH'], _dragFunction, _stopFunction);

            } else {
                hChart.axisTitles[axis + '_resize'].attr({
                    width: hChart.plotWidth
                });

                hChart.axisTitles[axis + '_resizeH'].attr({
                    width: hChart.plotWidth
                });
            }

            hChart.axisTitles[axis + '_resize'].attr({
                x: x,
                y: y/* - 14 */ - resizeTheme.height,
                zIndex: 20
            });

            var resizeElH = resizeTheme.height;
            var resizeHandleY = y - resizeTheme.height / 2 + 2;

            hChart.axisTitles[axis + '_resizeH'].attr({
                x: hChart.plotWidth / 2,
                y: (resizeHandleY == y) ? y + 2 : resizeHandleY,
                zIndex: 21
            });

            ind.setTitle(ind.getAxisId(), x, y, 20);
        }
    }
    catch (e) {
        infChart.util.console.error(e);
    }
};

infChart.StockChart.prototype._getPreviousIndicator = function (indicatorId) {
    var indicatorsDissimilerToBaseAxes = infChart.indicatorMgr.getIndicatorsDissimilarToBaseAxes(this.id);
    var idx = indicatorsDissimilerToBaseAxes.indexOf(indicatorId);
    var previousInd;
    if (idx > 0) {
        previousInd = infChart.indicatorMgr.getIndicatorById(this.id, indicatorsDissimilerToBaseAxes[idx - 1]);
    }
    return previousInd;
};

infChart.StockChart.prototype._getPreviousPanelY = function (indicatorId) {
    var previousIndicator = this._getPreviousIndicator(indicatorId);
    var previousAxis;
    if (previousIndicator) {
        previousAxis = this.chart.get(previousIndicator.getAxisId());
    } else {
        previousAxis = this.getMainYAxis();
    }
    return previousAxis;
};

infChart.StockChart.prototype.setCompareMode = function (compareValue, redraw) {
    var compareSymbols = this.compareSymbols.symbols,
        seriesId,
        compareSeries,
        hChart = this.chart;

    for (var symId in compareSymbols) {
        if (compareSymbols.hasOwnProperty(symId)) {
            seriesId = this.getCompareSeriesId(compareSymbols[symId]);
            compareSeries = hChart.get(seriesId);
            if (compareSeries) {
                // compareSeries.update({
                //     compare: compareValue
                // }, false);
                compareSeries.setCompare(compareValue, false);
            }
        }
    }

    if (redraw) {
        this.chart.redraw(false);
    }
};

/**
 * Method to set basic chart properties
 * @param value
 * @param redraw
 * @param {boolean} isPropertyChange
 */
infChart.StockChart.prototype.setChartDataMode = function (value, redraw, isPropertyChange) {
    var chart = this.chart;
    var disableEventFireModeChange = false,
        changedProperties = {};
    if (typeof redraw === 'undefined') {
        redraw = true;
    }
    infChart.util.console.log('chart data mode : ' + value + " redraw : " + redraw);

    this.resetYAxisExtremes(false);

    //if (typeof infChart.drawingsManager !== 'undefined' && chart.annotations && chart.annotations.allItems.length > 0) {
    //    this.convertYAxisUserExtremes(value, redraw);
    //}

    var mainSeries = this.getMainSeries();
    var dummySeries = this._getDummySeries(true);
    switch (value) {
        case 'percent':
            this.isPercent = true;
            changedProperties.isPercent = true;
            if (this.isCompare) {
                // mainSeries.update({
                //     compare: "percent"
                // }, false);

                // this.chart.update({ plotOptions: {series: {compare: "percent"}}}, false);
                // dummySeries.update({
                //     compare: "percent"
                // }, false);
                mainSeries.setCompare("percent", false);
                // mainSeries.yAxis.setCompare("percent", false);
                this.setCompareMode("percent", false);
            }
            break;
        case 'compare':
            disableEventFireModeChange = true;
            this.isCompare = true;
            changedProperties.isCompare = true;
            if (!this.isFirstLoadInprogress()) {
                this.isPercent = true;
                changedProperties.isPercent = true;
            }
            var compareType = this.isPercent ? "percent" : undefined;
            if (this.isLog) {
                if (this.isFirstLoadInprogress()) {
                    // if log mode is saved in the templated loaded or given config, we need to keep it as it is.
                    // So avoided changing data mode
                    this.isPercent = false;
                    changedProperties.isPercent = false;
                    compareType = undefined;
                } else {
                    this.isLog = false;
                    changedProperties.isLog = false;
                }
            }
            if (this._isToolbarEnabled()) {
                infChart.toolbar.setSelectedControls(this.id, 'value', this.isLog, 'log');
                infChart.toolbar.setSelectedControls(this.id, 'value', this.isPercent, 'percent');
            }
            // mainSeries.update({
            //     compare: compareType
            // }, false);
            // this.chart.update({ plotOptions: {series: {compare: compareType}}}, false);
            // dummySeries.update({
            //     compare: compareType
            // }, false);
            mainSeries.setCompare(compareType, false);
            // mainSeries.yAxis.setCompare(compareType, false);
            break;
        case 'normal':
            this.isLog = false;
            this.isPercent = false;
            changedProperties.isLog = false;
            changedProperties.isPercent = false;
            break;
        case 'log':
            this.isLog = true;
            changedProperties.isLog = true;
            break;
        case 'logToNormal':
            this.isLog = false;
            changedProperties.isLog = false;
            this._clearPlotLines(redraw);
            break;
        case 'percentToNormal':
            this.isPercent = false;
            changedProperties.isPercent = false;
            if (this.isCompare) {
                // mainSeries.update({
                //     compare: undefined
                // }, false);
                // this.chart.update({ plotOptions: {series: {compare: undefined}}}, false);
                // dummySeries.update({
                //     compare: undefined
                // }, false);
                mainSeries.setCompare(undefined, false);
                // mainSeries.yAxis.setCompare(undefined, false);
                this.setCompareMode(undefined, false);
            }
            break;
        case 'percentToLog':
            // when mode has been changed to  percentage from log,
            // disabled the log mode since both cannot be shown same time
            this.isPercent = false;
            changedProperties.isPercent = false;
            this.isLog = true;
            changedProperties.isLog = true;
            if (this.isCompare) {
                // mainSeries.update({
                //     compare: undefined
                // }, false);
                // this.chart.update({ plotOptions: {series: {compare: undefined}}}, false);
                // dummySeries.update({
                //     compare: undefined
                // }, false);
                mainSeries.setCompare(undefined, false);
                // mainSeries.yAxis.setCompare(undefined, false);
                this.setCompareMode(undefined, false);
            }

            if (this._isToolbarEnabled()) {
                infChart.toolbar.setSelectedControls(this.id, 'value', this.isPercent, 'percent');
            }
            break;
        case 'logToPercent':

            // when mode has been changed to log from percentage,
            // disabled the log mode since both cannot be shown same time
            this.isPercent = true;
            changedProperties.isPercent = true;
            this.isLog = false;
            changedProperties.isLog = false;
            if (this.isCompare) {
                // mainSeries.update({
                //     compare: "percent"
                // }, false);
                // this.chart.update({ plotOptions: {series: {compare: "percent"}}}, false);
                // dummySeries.update({
                //     compare: "percent"
                // }, false);
                mainSeries.setCompare("percent", false);
                // mainSeries.yAxis.setCompare("percent", false);
                this.setCompareMode("percent", false);
            }
            if (this._isToolbarEnabled()) {
                infChart.toolbar.setSelectedControls(this.id, 'value', this.isLog, 'log');
            }
            break;
        case 'compareToNormal':
            disableEventFireModeChange = true;
            this.isCompare = false;
            changedProperties.isCompare = false;
            this.isPercent = false;
            changedProperties.isPercent = false;
            if (this._isToolbarEnabled()) {
                infChart.toolbar.setSelectedControls(this.id, 'value', this.isPercent, 'percent');
            }
            // mainSeries.update({
            //     compare: undefined
            // }, false);
            // this.chart.update({ plotOptions: {series: {compare: undefined}}}, true);
            // dummySeries.update({
            //     compare: undefined
            // }, true);
            mainSeries.setCompare(undefined, false);
            // mainSeries.yAxis.setCompare(undefined, false);
            this._clearPlotLines(redraw);
            break;
        default:
            break;
    }

    this.prevousClose = {};
    /* Since Data need to be re processed for the new mode need to start calculations from the beginning.
     So clear all the flags and processed data */
    this.recalStart = {};
    this.processedData.ohlcv = undefined;
    this._recalculateAll(redraw);
    this.updateMinMax();
    if(!disableEventFireModeChange){
        this._fireEventListeners('modeChange', [value]);
    }

    //if (value !== "compare" && value !== "compareToNormal") {
    //    this.scaleDrawings(this.id);
    //}
    if (isPropertyChange) {
        this._onPropertyChange("mode", changedProperties);
    }
};

/**
 * when chart data mode is changed we are setting the y axis extremes
 * this is called before data mode is set
 * get the base price value and then convert it to corresponding value
 * @param mode
 * @param redraw
 */
infChart.StockChart.prototype._convertYAxisUserExtremes = function (mode, redraw) {
    var yAxis = this.getMainYAxis(), min = /*yAxis.userMin || */yAxis.dataMin, max = /*yAxis.userMax || */yAxis.dataMax, baseYValue;
    switch (mode) {
        case 'log':
            if (!isNaN(min)) {
                baseYValue = this.getBaseValue(min, false, this.isCompare, this.isPercent);
                min = this.convertBaseYValue(baseYValue, true, this.isCompare, this.isPercent);
            }
            if (!isNaN(max)) {
                baseYValue = this.getBaseValue(max, false, this.isCompare, this.isPercent);
                max = this.convertBaseYValue(baseYValue, true, this.isCompare, this.isPercent);
            }
            break;
        case 'percent':
            if (!isNaN(min)) {
                baseYValue = this.getBaseValue(min, this.isLog, this.isCompare, false);
                min = this.convertBaseYValue(baseYValue, this.isLog, this.isCompare, true);
            }
            if (!isNaN(max)) {
                baseYValue = this.getBaseValue(max, this.isLog, this.isCompare, false);
                max = this.convertBaseYValue(baseYValue, this.isLog, this.isCompare, true);
            }
            break;
        case 'compare':
            if (!isNaN(min)) {
                baseYValue = this.getBaseValue(min, this.isLog, this.isCompare, this.isPercent);
                //compare is set to false because we are setting the chart x-scale to full range - so crop start should not be used
                min = this.convertBaseYValue(baseYValue, this.isLog, false, true);
            }
            if (!isNaN(max)) {
                baseYValue = this.getBaseValue(max, this.isLog, this.isCompare, this.isPercent);
                //compare is set to false because we are setting the chart x-scale to full range - so crop start should not be used
                max = this.convertBaseYValue(baseYValue, this.isLog, false, true);
            }
            break;
        case 'logToNormal':
            if (!isNaN(min)) {
                baseYValue = this.getBaseValue(min, true, this.isCompare, this.isPercent);
                min = this.convertBaseYValue(baseYValue, false, this.isCompare, this.isPercent);
            }
            if (!isNaN(max)) {
                baseYValue = this.getBaseValue(max, true, this.isCompare, this.isPercent);
                max = this.convertBaseYValue(baseYValue, false, this.isCompare, this.isPercent);
            }
            break;
        case 'percentToNormal':
            if (!isNaN(min)) {
                baseYValue = this.getBaseValue(min, this.isLog, this.isCompare, true);
                min = this.convertBaseYValue(baseYValue, this.isLog, this.isCompare, false);
            }
            if (!isNaN(max)) {
                baseYValue = this.getBaseValue(max, this.isLog, this.isCompare, true);
                max = this.convertBaseYValue(baseYValue, this.isLog, this.isCompare, false);
            }
            break;
        case 'compareToNormal':
            if (!isNaN(min)) {
                baseYValue = this.getBaseValue(min, this.isLog, true, this.isPercent);
                min = this.convertBaseYValue(baseYValue, this.isLog, false, false);
            }
            if (!isNaN(max)) {
                baseYValue = this.getBaseValue(max, this.isLog, true, this.isPercent);
                max = this.convertBaseYValue(baseYValue, this.isLog, false, false);
            }
            break;
        default:
            break;
    }
    if (!isNaN(min) || !isNaN(max)) {
        console.log('convertYAxisUserExtremes => userMin : ' + yAxis.userMin + ", userMax : " + yAxis.userMax);
        console.log('convertYAxisUserExtremes => min : ' + min + ", max : " + max);
        yAxis.setExtremes(min, max, true, false);
    }
};

/**
 * remove grid lines
 * @param redraw to redraw chart
 */
infChart.StockChart.prototype._clearPlotLines = function (redraw) {
    /*this.chart.get("#1").update({
     plotLines: [],
     gridLineWidth: this.yGridLineWidth
     }, redraw);*/
};

/**
 * change chart style
 * @param {string} type
 * @param {boolean} redraw
 * @param {boolean} isPropertyChange
 */
infChart.StockChart.prototype.setChartStyle = function (type, redraw, isPropertyChange) {
    var mainSeries = this.getMainSeries();
    if (typeof redraw === 'undefined') {
        redraw = true;
    }

    if(this.isManualType && this.isStyleChangedByForce){
        this.isStyleChangedByForce = false;
    }

    var settingPanel = this.settingsPopups[mainSeries.options.id];
    if(settingPanel) {
        if(isPropertyChange) {
            settingPanel.find("[ind-ind-type=" + type + "]").trigger('click');
        }
        else{
            infChart.structureManager.toolbar.setChartTypeTabActive(settingPanel, type);
        }
    }
    if(!settingPanel || !isPropertyChange){
        this._changeSeriesType(mainSeries, type, redraw, isPropertyChange);
    }


    this._fireEventListeners("onSeriesTypeChange");
};

/**
 * Returns the series options to set to the new chart type
 * @param series
 * @param type
 * @returns {*}
 */
infChart.StockChart.prototype.getSeriesOptionsOnChartTypeChange = function (series, type) {

    var seriesColorOption = this.seriesColorOptions[series.options.id],
        colorCfg = (seriesColorOption && seriesColorOption[type]) ? seriesColorOption[type] :
            this.chart.options.plotOptions[type] ? this._getColorPropertiesFromOptions($.extend(Highcharts.theme.plotOptions[type], this.chart.options.plotOptions[type]), type, series) : undefined;

    return colorCfg;
};

infChart.StockChart.prototype._changeSeriesType = function (series, type, redraw, isPropertyChange) {
    var isMainSeries = this.isMainSeries(series);
    if (isMainSeries) {
        if(!this.isStyleChangedByForce) {
            this.type = type;
        }
        /*To fix the issue with onKey value of the flag indicator series */
        if (infChart.indicatorMgr) {
            infChart.util.forEach(infChart.indicatorMgr.getIndicators(this.id), function (i, ind) {
                ind.resetSeriesOptions(type);
            });
        }
        if (this._isToolbarEnabled()) {
            infChart.toolbar.setSelectedControls(this.id, 'chartType', this.type);
        }
    }

    var colorCfg = this.getSeriesOptionsOnChartTypeChange(series, type);
    var data = this.getSeriesData(series, true);

    var tempConfig = $.extend({}, colorCfg, {
        type: type
    });

    if (data && data.length > 0) {
        tempConfig.data = this._getSeriesDataByChartType(type, data, series.options.infLineDataField);
        series.update(tempConfig, false);
        //this._setMainSeriesDataToChart(data, redraw);
        this._cleanNavigatorSeries(redraw);
        this.adjustPriceLineLabels();
        this.updateMinMax();
    } else {
        series.update(tempConfig, redraw);
    }

    this.updateTakeOrdinalPosition(isMainSeries, type);
    if (isPropertyChange && isMainSeries) {
        this._onPropertyChange("type", [type]);
    }
};

infChart.StockChart.prototype.updateTakeOrdinalPosition = function (isMainSeries, type) {
    if(isMainSeries){
        if(type == "line"){
            Highcharts.seriesTypes.line.prototype.takeOrdinalPosition = true;
        } else if (type == "area"){
            Highcharts.seriesTypes.area.prototype.takeOrdinalPosition = true;
        } else {
            Highcharts.seriesTypes.line.prototype.takeOrdinalPosition = false;
            Highcharts.seriesTypes.area.prototype.takeOrdinalPosition = false;
        }
    }
};

infChart.StockChart.prototype.setDataGrouping = function (series, redraw) {
    var intervalOpt = this.intervalOptions[this.interval];
    var isEnable = !(intervalOpt && intervalOpt.grouping == false);
    redraw = !!(redraw);
    if (series) {
        series.update({dataGrouping: {enabled: isEnable}}, false);
    }
    else {
        infChart.util.forEach(this.chart.series, function (idx, seriesC) {
            seriesC.update({dataGrouping: {enabled: isEnable}}, false);
        });

    }
    this._cleanNavigatorSeries(redraw);
};

infChart.StockChart.prototype._getPeriodTime = function (period) {
    var currentTime = (new Date).getTime();
    return (currentTime - this._getMinDate(period, currentTime, true));
};

/**
 * Util method to get min date  for a period
 *
 * 1. When selecting 1D if Exchange is not open yet, then should show previous days chart.
 * 2. If Exchange is open then should show current days chart. The X axis should span the period for which the Exchange is open on the day.
 * 3. If 2D is selected and the Exchange is open it should show the previous days data and the current days data.
 * 4. If 1Week is selected it should show the last 5 trading days data. If the Exchange is open then it should show the current day and the previous 4 days.
 * 5. The X axis should not be linear. Periods with no data should be omitted from the X axis.
 * @param period
 * @param lastDate
 * @returns {*}
 * @private
 */
infChart.StockChart.prototype._getMinDate = function (period, lastDate, isLinearTime) {
    var l = this.data.base.length;
    if (l > 0 || lastDate) {
        //set x-axis min/max
        var max = lastDate || this.data.base[l - 1][0],
            min = lastDate ? (new Date(0)).getTime() : this.data.base[0][0],
            date = new Date(max),
            periodAsArray = period.split("_"),
            periodType = periodAsArray[0],
            periodTypeSub = periodAsArray[1],
            units = (periodAsArray.length > 2) ? +periodAsArray[2] : periodAsArray.length > 1 ? +periodAsArray[1] : 1,
            marketOpenDetails = this.marketOpenDetails,
            isMarketOpen = marketOpenDetails && marketOpenDetails.isOpenNow,
            lastOpenTime = marketOpenDetails && this.dataManager.getChartTime(marketOpenDetails.lastOpenTime, marketOpenDetails.timeZoneOffset, periodType);

        switch (periodType) {
            case 'I':
                var newUTCDate;
                if (periodTypeSub == "H") {
                    newUTCDate = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours() - units, date.getUTCMinutes(), date.getUTCSeconds());
                } else {
                    newUTCDate = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() - units, date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
                }
                var periodTime = this.periodOptions[period].time;
                if (!this.isLinearData() && !isLinearTime && isMarketOpen && newUTCDate < lastOpenTime &&
                    (!periodTime || !lastDate || periodTypeSub != "H" || (periodTime >= (lastDate - lastOpenTime)))) {
                    newUTCDate = lastOpenTime;
                }
                return newUTCDate;
                break;
            case 'D':
                if (!this.isLinearData() && !isLinearTime && isMarketOpen) {
                    date = new Date(lastOpenTime);
                    units--;
                }
                return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() - units, date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
            case 'W':
                var daysPerWeek = 7;
                if (!this.isLinearData() && !isLinearTime && isMarketOpen && lastOpenTime) {
                    date = new Date(lastOpenTime);
                    daysPerWeek--;
                }
                return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() - units * daysPerWeek, date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
            case 'M':
                return Date.UTC(date.getUTCFullYear(), date.getUTCMonth() - units, date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
            case 'Y':
                return Date.UTC(date.getUTCFullYear() - units, date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
            case 'YTD':
                var date1 = new Date();
                var date2 = new Date(date1.getUTCFullYear(), 0, 1);
                return date2.getTime();
            case 'C':
                return this.range && this.range.fromDate ? this.range.fromDate : min;
            /*var timeDiff = Math.abs(date2.getTime() - date1.getTime());
             return Math.ceil(timeDiff / (1000 * 3600 * 24))git ;*/
            default:
                return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() - 1);
        }
    }
};

/**
 *
 * 1. When selecting 1D if Exchange is not open yet, then should show previous days chart.
 * 2. If Exchange is open then should show current days chart. The X axis should span the period for which the Exchange is open on the day.
 * 3. If 2D is selected and the Exchange is open it should show the previous days data and the current days data.
 * 4. If 1Week is selected it should show the last 5 trading days data. If the Exchange is open then it should show the current day and the previous 4 days.
 * 5. The X axis should not be linear. Periods with no data should be omitted from the X axis.
 * @param period
 * @param latestDate
 * @param isLinearTime
 * @returns {*}
 * @private
 */
infChart.StockChart.prototype._getMaxDate = function (period, latestDate, isLinearTime) {
    var l = this.data.base.length;
    if (l > 0) {
        //set x-axis min/max
        var max = latestDate || this.data.base[0][0],
            date = new Date(max),
            periodAsArray = period.split("_"),
            periodType = periodAsArray[0],
            periodTypeSub = periodAsArray[1],
            units = (periodAsArray.length > 2) ? +periodAsArray[2] : periodAsArray.length > 1 ? +periodAsArray[1] : 1,
            marketOpenDetails = this.marketOpenDetails,
            isMarketOpen = marketOpenDetails && marketOpenDetails.isOpenNow,
            lastOpenTime = marketOpenDetails && this.dataManager.getChartTime(marketOpenDetails.lastOpenTime, marketOpenDetails.timeZoneOffset, periodType),
            marketOpenTime = marketOpenDetails && marketOpenDetails.openHours,
            marketOpenHours = (marketOpenTime && Math.floor(marketOpenTime)) || 0,
            marketOpenMinutes = (marketOpenTime && (marketOpenTime % marketOpenHours) * 60) || 0;

        switch (periodType) {
            case 'I':
                var newUTCDate;
                if (periodTypeSub == "H") {
                    newUTCDate = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours() + units, date.getUTCMinutes(), date.getUTCSeconds());
                } else {
                    newUTCDate = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + units, date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
                }

                if (!this.isLinearData() && !isLinearTime && isMarketOpen) {
                    date = new Date(lastOpenTime);
                    newUTCDate = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours() + marketOpenHours, date.getUTCMinutes() + marketOpenMinutes, date.getUTCSeconds());
                }
                return newUTCDate;
                break;
            case 'D':
                newUTCDate = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + units, date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());

                if (!this.isLinearData() && !isLinearTime && isMarketOpen) {
                    date = new Date(lastOpenTime);
                    newUTCDate = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours() + marketOpenHours, date.getUTCMinutes() + marketOpenMinutes, date.getUTCSeconds());
                }
                return newUTCDate;
            case 'W':
                return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + units * 7, date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
            case 'M':
                return Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + units, date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
            case 'Y':
                return Date.UTC(date.getUTCFullYear() + units, date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
            case 'YTD':
                var date1 = new Date();
                var date2 = new Date(date1.getUTCFullYear(), 0, 1);
                return date2.getTime();
            case 'C':
                var maxDate = this.range ? this.range.toDate ? this.range.toDate : Date.now() : max
                return maxDate;
            /*var timeDiff = Math.abs(date2.getTime() - date1.getTime());
             return Math.ceil(timeDiff / (1000 * 3600 * 24));*/
            default:
                return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() - 1);
        }
    }
};

/**
 * add series to the chart
 * @param {string} id - series id
 * @param {string} type - series type
 * @param {object} properties - series properties
 * @param {boolean} redraw - need to redraw or not
 * @param {object} options - series properties
 * @returns {object} series
 */
infChart.StockChart.prototype.addSeries = function (id, type, properties, redraw, options) {
    if (this.chart) {
        var seriesOptions, series;
        switch (type) {
            case "compare":
                seriesOptions = {
                    id: id,
                    name: properties.symbol.symbol,
                    title: properties.symbol.symbolDesc,
                    dp: properties.symbol.dp,
                    symbolType: properties.symbol.symbolType,
                    type: options && options.type ? options.type : "line",
                    data: [],
                    color: properties.seriesColor,
                    lineColor: properties.seriesColor,
                    infType: "compare",
                    compare: properties.compare,
                    infLineDataField: properties.symbol.lineDataField,
                    styleTypes: properties.styleTypes,
                    hasColumnNegative: false,
                    showInNavigator: false,
                    showInLegend: false,
                    infHideClose: properties.hideClose,
                    infLegendLabel: this._getSymbolDisplayName(properties.symbol)
                };
                break;
            case "indicator":
                break;
            case "news":
                seriesOptions = {
                    id: id,
                    name: "news",
                    title: "N",
                    type: "flags",
                    data: [],
                    infType: "news",
                    compare: "value",
                    onSeries: properties.onSeries,
                    shape: "circlepin",
                    fillColor: '#9258b3',
                    style: {
                        color: "#ffffff"
                    },
                    states: {
                        hover: {
                            fillColor: "#009e91"
                        }
                    },
                    point: {
                        events: {
                            click: properties.onClick
                        }

                    }
                };
                break;
            case "flags":
                seriesOptions = {
                    id: id,
                    name: "flags",
                    title: properties.symbol,
                    type: "flags",
                    data: [],
                    infType: "flags",
                    infFlagType: properties.flagType,
                    compare: "value",
                    onSeries: properties.onSeries,
                    shape: properties.shape,
                    fillColor: properties.fillColor,
                    color: "#ffffff",
                    lineColor: properties.lineColor,
                    style: {
                        color: "#ffffff"
                    },
                    states: {
                        hover: {
                            fillColor: "#009e91"
                        }
                    },
                    point: {
                        events: {
                            click: properties.onClick
                        }
                    }
                };
                break;
            default:
                break;
        }
        series = this.chart.addSeries(seriesOptions, redraw);
        if (options) {
            this._setSeriesProperties(series, options);
        }
        infChart.manager.setLegend(series);
        return series;
    }
};

/**
 * Remove a given series from the chart
 * @param seriesId
 * @param isPropertyChange
 */
infChart.StockChart.prototype.removeSeries = function (seriesId, isPropertyChange) {

    var chart = this.chart,
        propertyName = "",
        value = {},
        series = chart.get(seriesId),
        checkNoData;

    if (!series) {
        return;
    }

    var heightChange = true,
        parallelToBase,
        contId = this.id;

    this.prevousClose = {};

    if (infChart.util.isLegendAvailable(series.options)) {
        infChart.structureManager.legend.removeLegendItem(this.id, seriesId, series.options.infType);
    }

    if (this.settingsPopups[seriesId]) {
        this.settingsPopups[seriesId].remove();
        delete this.settingsPopups[seriesId];
    }

    switch (series.options.infType) {
        case "compare":
            //var legendComp = containerEl.querySelector("[inf-legend] [inf-legend-comp-symbol]"),
            //    legendLiEl = legendComp && legendComp.querySelector("[inf-comp-legend-li]");
            //
            //if (legendLiEl && legendLiEl.children.length == 1) {
            //    legendComp.querySelector("div[rel='legend-comp-dropdown']").style.display = 'none';
            //}
            heightChange = false;
            this.removeSeriesFromTimeMap(seriesId);
            // series.xAxis.setCompare(undefined, false);
            // series.yAxis.setCompare(undefined, false);
            series.remove(false);
            checkNoData = true;
            break;
        case "indicator":
            //var legendInd = containerEl.querySelector("[inf-legend] [inf-legend-ind]"),
            //    legendLiEl = legendInd && legendInd.querySelector("[inf-comp-legend-li]");
            //
            //if (legendLiEl && legendLiEl.children.length == 1) {
            //    legendInd.find("div[rel='legend-ind-dropdown']").hide();
            //}

            var indicator = infChart.indicatorMgr.getIndicatorBySeriesId(contId, seriesId);
            parallelToBase = infChart.util.isSeriesInBaseAxis(indicator.getAxisId()) || infChart.indicatorMgr.isParallelToBaseAxes(this.id, indicator);
            infChart.indicatorMgr.removeIndicatorSeries(contId, seriesId, isPropertyChange);

            if (indicator.series.length === 0) {
                propertyName = "indicators";
                value.id = indicator.id;
                value.type = indicator.type;
                value.action = "remove";
            }
            if (infChart.indicatorMgr.getNotSingletonIndicatorCount(this.id) <= 0) {
                infChart.toolbar.setSelectedControls(this.id, "indicator", false);
            }
            break;
        case "news":
            series.remove(false);
            heightChange = false;
            break;
        case "flags":
            series.remove(false);
            heightChange = false;
            break;
        default:
            break;
    }
    if (heightChange) {
        // this.setYAxisExtremes(false);
        this._setIndicatorFrames(true);
        this._setLabels();
    }

    this.updateMinMax();
    //this.scaleDrawings(this.id);


    if (this.isResizeRequired()) {
        this.resizeChart();
    }

    if (checkNoData && !this._hasData()) {
        this._showNoData(true)
    }

    if (isPropertyChange && propertyName) {
        this._onPropertyChange(propertyName, value);
    }
    if (parallelToBase != undefined && !parallelToBase) {
        this.onBaseAxisResize();
    } else {
        this.onBaseAxisScaled();
    }
};

/**
 * Reload a given series in the chart
 * @param seriesId
 */
infChart.StockChart.prototype.refreshSeries = function (seriesId) {

    var chart = this.chart;
    var series = chart.get(seriesId);
    var heightChange = true;
    switch (series.options.infType) {
        case "compare":
            break;
        case "indicator":
            break;
        case "base":
            this._loadHistory(undefined, undefined, undefined, undefined, true);
            break;
        default:
            break;
    }
    if (heightChange) {
        // this.setYAxisExtremes(false);
        this._setIndicatorFrames(true);
        this._setLabels();
    }
    this.updateMinMax();
    //this.scaleDrawings();
};

infChart.StockChart.prototype.reloadData = function () {

    var iChart = this;

    iChart._loadHistory(undefined, undefined, undefined, this.flags.enabled, true);

    if (iChart.compareSymbols.count > 0) {
        infChart.util.forEach(this.compareSymbols.symbols, function (key, val) {
            iChart.data.compare[key] = [];
            iChart._loadCompareHistory(val, undefined, undefined, true);
        });
    }
};

infChart.StockChart.prototype.setSize = function (width, hieght) {
    var chart = this.chart;
    chart.setSize(width, hieght);
    this.updateMinMax();
};

infChart.StockChart.prototype._clearToolbarControls = function (type, applyFading) {
    if (this._isToolbarEnabled()) {
        infChart.toolbar.clearSelectedControls(this.id, type, applyFading);
    }
};

//region===================Zooming and Rage Select======================================================================

infChart.StockChart.prototype.getZoomExtremes = function (isZoomIn) {
    var newExtremes = {}, extremes = this.getRange(), mainSeries = this.getMainSeries(),
        noOfPoints = mainSeries.points && mainSeries.points.length;
    if (noOfPoints) {
        if (isZoomIn) {
            if ((extremes.max - extremes.min) > mainSeries.closestPointRange * 5) {
                var startIndex = (noOfPoints > 3) ? Math.floor(noOfPoints / 3) : (noOfPoints > 1) ? 1 : 0;
                var endValue = extremes.dataMax;
                if (extremes.dataMax != extremes.max) {
                    var endIndex = (extremes.dataMax == extremes.max) ? noOfPoints - 1 : (noOfPoints > startIndex) ? noOfPoints - startIndex : noOfPoints - 1;
                    endValue = mainSeries.points[endIndex].x;
                }
                newExtremes.min = mainSeries.points[startIndex].x;
                newExtremes.max = endValue;
            }
        } else {
            var maxZoom = this.getMaxZoomRange();
            if (extremes.max - extremes.min != maxZoom) {
                var allPoints = this.rangeData.data.length, startIndexOnRange = infChart.util.binaryIndexOf(this.rangeData.data, 0, extremes.min);

                startIndexOnRange = startIndexOnRange < 0 ? startIndexOnRange * -1 : startIndexOnRange;

                var pointsOnRight = allPoints - startIndexOnRange - noOfPoints;
                var pointsOnLeft = startIndexOnRange;

                // var divFactor = 2;
                var minAdjustmentPoints = 20;

                var rightAdjustment = (pointsOnRight > 0) ? Math.floor((allPoints / pointsOnRight) * 10) : 0;//Math.floor(pointsOnRight / divFactor);
                var leftAdjustment = (pointsOnLeft > 0) ? Math.floor((allPoints / pointsOnLeft) * 10) : 0; // Math.floor(pointsOnLeft / divFactor);

                rightAdjustment = (pointsOnRight > minAdjustmentPoints || rightAdjustment > minAdjustmentPoints) ? rightAdjustment : (pointsOnRight > 0) ? pointsOnRight : 0;
                leftAdjustment = (pointsOnLeft > minAdjustmentPoints || leftAdjustment > minAdjustmentPoints) ? leftAdjustment : (pointsOnLeft > 0) ? pointsOnLeft : 0;

                var maxIndex = startIndexOnRange + noOfPoints - 1 + rightAdjustment;
                maxIndex = (maxIndex < allPoints) ? maxIndex : allPoints - 1;

                var minIndex = startIndexOnRange - leftAdjustment;
                minIndex = (minIndex >= 0) ? minIndex : 0;

                var startTime = this.rangeData.data[minIndex][0],
                    endTime = this.rangeData.data[maxIndex][0],
                    diff = endTime - startTime;

                if (maxZoom && maxZoom < diff) {
                    var prevMid = extremes.min + (extremes.max - extremes.min) / 2,
                        nextMid = startTime + (endTime - startTime) / 2;

                    if (prevMid == nextMid) {
                        startTime = prevMid - maxZoom / 2;
                        endTime = prevMid + maxZoom / 2;
                    } else {
                        startTime = endTime == extremes.dataMax ? endTime - maxZoom : Math.max(nextMid - maxZoom / 2, extremes.dataMin);
                        endTime = startTime == extremes.dataMin ? startTime + maxZoom : Math.min(nextMid + maxZoom / 2, extremes.dataMax);
                    }
                }
                newExtremes.min = startTime;
                newExtremes.max = endTime;
            }
        }
    }
    return newExtremes;
};

infChart.StockChart.prototype.getZoomExtremesOnCtrlClick = function (event) {
    var newExtremes = {}, mainSeries = this.getMainSeries(), extremes = this.getRange();
    if ((extremes.max - extremes.min) > mainSeries.closestPointRange * 5) {
        var point, clickedTime;
        if (event.point) {

            point = event.point;

        } else if (event.xAxis && event.xAxis.length > 0) {

            clickedTime = event.xAxis[0].value;
            point = infChart.util.getSeriesPointByTime(mainSeries, clickedTime);
        }

        if (point) {
            var series = point.series;
            var startIdx = 0,
                endIdx = series.points.length - 1,
                pointIndex = point.index - series.cropStart,
                noOfLeftPoints = pointIndex - startIdx,
                noOfRightPoints = endIdx - pointIndex,
                noOfPointsToShow = (mainSeries.points.length) * 0.9,
                startIndex = pointIndex - Math.floor(noOfPointsToShow * (noOfLeftPoints / (series.points.length))),// startIdx + ((noOfLeftPoints > 3) ? Math.floor(noOfLeftPoints / 3) : (noOfLeftPoints > 1) ? 1 : 0);
                endIndex = pointIndex + Math.floor(noOfPointsToShow * (noOfRightPoints / (series.points.length)));//((noOfRightPoints > 3) ? Math.floor(noOfRightPoints / 3) : (noOfRightPoints > 1) ? 1 : 0);

            endIndex = endIndex >= mainSeries.points.length ? series.points.length - 1 : endIndex;
            startIndex = startIndex > pointIndex ? pointIndex : startIdx < 0 ? 0 : startIndex;

            newExtremes.min = series.points[startIndex].x;
            newExtremes.max = series.points[endIndex].x;
        } else {
            newExtremes = this.getZoomExtremes(true)
        }
    }
    return newExtremes;
};

/**
 * Zoom in current range
 */
// infChart.StockChart.prototype.zoomIn = function () {
//     var extremes = this.getRange(), mainSeries = this.getMainSeries(),
//         noOfPoints = mainSeries.points && mainSeries.points.length,
//         startIndex = (noOfPoints > 3) ? Math.floor(noOfPoints / 3) : (noOfPoints > 1) ? 1 : 0;

//     if (noOfPoints) {
//         var endValue = extremes.dataMax;
//         if (extremes.dataMax != extremes.max) {
//             var endIndex = (extremes.dataMax == extremes.max) ? noOfPoints - 1 : (noOfPoints > startIndex) ? noOfPoints - startIndex : noOfPoints - 1;
//             endValue = mainSeries.points[endIndex].x;
//         }
//          this.setXAxisExtremes(mainSeries.points[startIndex].x, endValue, true);
//         // this.clearToolbarControls("period", true);
//     }

//     // infChart.manager.afterScalingAxis(this.chartId, {
//     //     xAxis: true,
//     //     yAxis: false
//     // });
// };

/**
 * Zoom out chart from current range
 */
// infChart.StockChart.prototype.zoomOut = function () {

//     var extremes = this.getRange(),
//         maxZoom = this.getMaxZoomRange(),
//         allPoints = this.rangeData.data.length,
//         mainSeries = this.getMainSeries(),
//         noOfPoints = mainSeries.points && mainSeries.points.length;

//     if (extremes.max - extremes.min == maxZoom || !noOfPoints) {
//         return;
//     }

//     var startIndexOnRange = infChart.util.binaryIndexOf(this.rangeData.data, 0, extremes.min);
//     startIndexOnRange = startIndexOnRange < 0 ? startIndexOnRange * -1 : startIndexOnRange;

//     var pointsOnRight = allPoints - startIndexOnRange - noOfPoints;
//     var pointsOnLeft = startIndexOnRange;

//     var divFactor = 2;
//     var minAdjustmentPoints = 20;

//     var rightAdjustment = (pointsOnRight > 0) ? Math.floor((allPoints / pointsOnRight) * 10) : 0;//Math.floor(pointsOnRight / divFactor);
//     var leftAdjustment = (pointsOnLeft > 0) ? Math.floor((allPoints / pointsOnLeft) * 10) : 0; // Math.floor(pointsOnLeft / divFactor);

//     rightAdjustment = (pointsOnRight > minAdjustmentPoints || rightAdjustment > minAdjustmentPoints) ? rightAdjustment : (pointsOnRight > 0) ? pointsOnRight : 0;
//     leftAdjustment = (pointsOnLeft > minAdjustmentPoints || leftAdjustment > minAdjustmentPoints) ? leftAdjustment : (pointsOnLeft > 0) ? pointsOnLeft : 0;

//     var maxIndex = startIndexOnRange + noOfPoints - 1 + rightAdjustment;
//     maxIndex = (maxIndex < allPoints) ? maxIndex : allPoints - 1;

//     var minIndex = startIndexOnRange - leftAdjustment;
//     minIndex = (minIndex >= 0) ? minIndex : 0;

//     var startTime = this.rangeData.data[minIndex][0],
//         endTime = this.rangeData.data[maxIndex][0],
//         diff = endTime - startTime;

//     if (maxZoom && maxZoom < diff) {
//         var prevMid = extremes.min + (extremes.max - extremes.min) / 2,
//             nextMid = startTime + (endTime - startTime) / 2;

//         if (prevMid == nextMid) {
//             startTime = prevMid - maxZoom / 2;
//             endTime = prevMid + maxZoom / 2;
//         } else {
//             startTime = endTime == extremes.dataMax ? endTime - maxZoom : Math.max(nextMid - maxZoom / 2, extremes.dataMin);
//             endTime = startTime == extremes.dataMin ? startTime + maxZoom : Math.min(nextMid + maxZoom / 2, extremes.dataMax);
//         }
//     }

//     var args = {xAxis: true, yAxis: false};
//     infChart.manager.setUserDefinedXAxisExtremes(this.chartId, startTime, endTime, true, args);
//     // this.setXAxisExtremes(startTime, endTime, true);
//     // this.clearToolbarControls("period", true);

//     // infChart.manager.afterScalingAxis(this.chartId, {
//     //     xAxis: true,
//     //     yAxis: false
//     // });
// };

/**
 * Zoom out on alt and mouse click chart from current range
 */
// infChart.StockChart.prototype.zoomOutOnAltlClick = function (event) {
//     this.zoomOut();
// };

/**
 * Zoom in on ctrl and mouse click chart from current range
 */
// infChart.StockChart.prototype.zoomOnCtrlClick = function (event) {
//     var point,
//         series,
//         clickedTime,
//         mainSeries = this.getMainSeries(),
//         extremes = this.getRange();

//     if (!extremes || (extremes.max - extremes.min) <= mainSeries.closestPointRange * 5) {
//         return; // skip if minimum zooming limit has been reached
//     }

//     if (event.point) {
//         point = event.point;
//     } else if (event.xAxis && event.xAxis.length > 0) {
//         clickedTime = event.xAxis[0].value;
//         point = infChart.util.getSeriesPointByTime(mainSeries, clickedTime);
//     }

//     if (point) {
//         series = point.series;
//         var startIdx = 0,
//             endIdx = series.points.length - 1,
//             pointIndex = point.index - series.cropStart,
//             noOfLeftPoints = pointIndex - startIdx,
//             noOfRightPoints = endIdx - pointIndex,
//             noOfPointsToShow = (mainSeries.points.length) * 0.9,
//             startIndex = pointIndex - Math.floor(noOfPointsToShow * (noOfLeftPoints / (series.points.length))),// startIdx + ((noOfLeftPoints > 3) ? Math.floor(noOfLeftPoints / 3) : (noOfLeftPoints > 1) ? 1 : 0);
//             endIndex = pointIndex + Math.floor(noOfPointsToShow * (noOfRightPoints / (series.points.length)));//((noOfRightPoints > 3) ? Math.floor(noOfRightPoints / 3) : (noOfRightPoints > 1) ? 1 : 0);

//         endIndex = endIndex >= mainSeries.points.length ? series.points.length - 1 : endIndex;
//         startIndex = startIndex > pointIndex ? pointIndex : startIdx < 0 ? 0 : startIndex;

//         // this.setRange(series.points[startIndex].x, series.points[endIndex].x);
//         var args = {xAxis: true, yAxis: false};
//         infChart.manager.setUserDefinedXAxisExtremes(this.chartId, series.points[startIndex].x, series.points[endIndex].x, true, args);

//     } else {
//         infChart.manager.zoomIn(infChart.manager.getContainerIdFromChart(this.chartId));
//         // this.zoomIn();
//     }

// };

// infChart.StockChart.prototype.setRange = function (startTime, endTime, redraw) {
//     this.getMainXAxis().setExtremes(startTime, endTime, redraw);
// };

infChart.StockChart.prototype._setFullRange = function () {
    var extremes = this.getRange();
    /*this.setRange(extremes.dataMin, extremes.dataMax);*/
    // this.setRange(extremes.min + 1, extremes.max);
    /*This is done for fixing issue of displaying same data point of compare symbols and base symbol in two x axis positions */
    // this.setRange(extremes.dataMin, extremes.dataMax);
    this.setXAxisExtremes(extremes.dataMin, extremes.dataMax, true, true);
};

infChart.StockChart.prototype.getRange = function () {
    return this.getMainXAxis().getExtremes();
};

/**
 * returns the min/max values to be shown in the navigator
 * @returns {{min: *, max: *}}
 */
infChart.StockChart.prototype.getExtremesForNavigator = function () {
    var data = this.processedData.data;
    if (data && data.length > 1) {
        return {min: data[0][0], max: data[data.length - 1][0]};
    }
};

/**
 * Create initialize range selector if not created before
 */
infChart.StockChart.prototype._setRangeSelector = function () {

    this.rangeSelector = true;

    var yHeight = this.chart.series[1].yAxis.height;
    var that = this;

    var div = this.rangeSelectorEl = $(document.createElement('div'));
    div.insertAfter($('#' + this.chartId));
    div.addClass("range-selector");
    div.html('<input type="text" id="dpFrom_' + this.chartId + '"/><input type="text" id="dpTo_' + this.chartId + '"/>' +
        '<div type="button" class="icon ico-arrow-horizontal full-range" id="fullRange_' + this.chartId + '" >' + '</div>');

    this.fromDatePicker = $('#dpFrom_' + this.chartId).datepicker({
        dateFormat: 'yy-mm-dd',
        onSelect: function () {
            var toDt = $('#dpTo_' + that.chartId).datepicker('getDate');
            var fromDate = $(this).datepicker('getDate');
            var UTCFromDate = Date.UTC(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate(), 0, 0, 0, 0);
            var UTCToDate = Date.UTC(toDt.getFullYear(), toDt.getMonth(), toDt.getDate(), 23, 59, 0, 0);
            // that.setRange(UTCFromDate, UTCToDate);
            that.setXAxisExtremes(UTCFromDate, UTCToDate, true, true);
        },
        beforeShow: function (textbox, instance) {

            setTimeout(function () {
                if (that.chart.infScaleX && that.chart.infScaleY) {
                    var el = $('#ui-datepicker-div'),
                        pos = el.position(),
                        hz = el.width() * (1 - that.chart.infScaleX),
                        vl = el.height() * (1 - that.chart.infScaleY);
                    el.css({
                        "transform": "scale(" + that.chart.infScaleX + ", " + that.chart.infScaleY + ")",
                        "-ms-transform": "scale(" + that.chart.infScaleX + "," + that.chart.infScaleY + ")",
                        "-webkit-transform": "scale(" + that.chart.infScaleX + "," + that.chart.infScaleY + ")",
                        "margin-top": vl / 2,
                        "margin-left": -1 * hz / 2

                    });
                }
            });
        },
        onClose: function () {
            $('#ui-datepicker-div').appendTo(document.body);
        }
    });

    this.toDatePicker = $('#dpTo_' + this.chartId).datepicker({

        dateFormat: 'yy-mm-dd',
        onSelect: function () {
            var toDt = $(this).datepicker('getDate');
            var fromDate = $('#dpFrom_' + that.chartId).datepicker('getDate');
            var UTCFromDate = Date.UTC(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate(), 0, 0, 0, 0);
            var UTCToDate = Date.UTC(toDt.getFullYear(), toDt.getMonth(), toDt.getDate(), 23, 59, 0, 0);
            // that.setRange(UTCFromDate, UTCToDate);
            that.setXAxisExtremes(UTCFromDate, UTCToDate, true, true);
        },
        beforeShow: function (textbox, instance) {
            //var pos = $( "#" + that.id).position()
            setTimeout(function () {
                if (that.chart.infScaleX && that.chart.infScaleY) {
                    var el = $('#ui-datepicker-div'),
                        pos = el.position(),
                        hz = el.width() * (1 - that.chart.infScaleX),
                        vl = el.height() * (1 - that.chart.infScaleY);
                    el.css({
                        "transform": "scale(" + that.chart.infScaleX + ", " + that.chart.infScaleY + ")",
                        "-ms-transform": "scale(" + that.chart.infScaleX + "," + that.chart.infScaleY + ")",
                        "-webkit-transform": "scale(" + that.chart.infScaleX + "," + that.chart.infScaleY + ")",
                        "margin-top": vl / 2,
                        "margin-left": -1 * hz / 2

                    });
                }
            });
            //$('#ui-datepicker-div').appendTo("#" + that.id);

        },
        onClose: function () {
            $('#ui-datepicker-div').removeAttr("style");
        }

    });

    $('#fullRange_' + this.chartId).on('click', function () {
        that._setFullRange();
    });

    this._adjustRangeSelectorPosition();

};

/**
 * Set the position of the range selector
 */
infChart.StockChart.prototype._adjustRangeSelectorPosition = function () {

    var div = this.rangeSelectorEl;
    if (div && div.length > 0 && this.chart && this.chart.navigator) {
        var yHeight = this.chart.navigator.height,
            containerHeight = div.height(),
            chartCont = div.parent(),
            chartEl = chartCont.find("[inf-container='chart']"),
            chartBottom = chartCont.height() - chartEl.height();

        div.css({
            bottom: (yHeight + chartBottom - containerHeight) + 'px'

        });
    }
};

/**
 * Adjust min/max values of range selector
 */
infChart.StockChart.prototype._adjustRangeSelectorMinMax = function () {
    if (this.chart.options.navigator.enabled === true) {
        var extremes = this.getRange();
        var from = $('#dpFrom_' + this.chartId);
        var to = $('#dpTo_' + this.chartId);
        try {
            var minDate = new Date(infChart.util.getDateStringFromTime(extremes.dataMin));
            var maxDate = new Date(infChart.util.getDateStringFromTime(extremes.dataMax));

            from.datepicker('option', 'minDate', minDate);
            from.datepicker('option', 'maxDate', maxDate);
            to.datepicker('option', 'minDate', minDate);
            to.datepicker('option', 'maxDate', maxDate);
            this._setRangeSelectorValues();
        }
        catch (e) {
            infChart.util.console.error(e);
        }
    }
};

/**
 * Set current values of from, to inputs of range selector
 */
infChart.StockChart.prototype._setRangeSelectorValues = function () {
    if (!this.settings.config || !this.settings.config.disableRangeSelector) {
        if (!this.rangeSelector) {
            this._setRangeSelector();
        }
        var extremes = this.getRange();
        this.fromDatePicker.datepicker("disable");
        this.fromDatePicker.datepicker('setDate', new Date(infChart.util.formatDate(extremes.min, '%Y-%m-%d')));
        this.fromDatePicker.datepicker("enable");

        this.toDatePicker.datepicker("disable");
        this.toDatePicker.datepicker('setDate', new Date(infChart.util.formatDate(extremes.max, '%Y-%m-%d')));
        this.toDatePicker.datepicker("enable");
    }
};

/**
 * Executes after changing the x axis extremes
 */
infChart.StockChart.prototype.afterSetExtremes = function () {

    var navigator = this.chart.navigator;
    if (navigator && this.chart.options.navigator.enabled === true && !navigator.infHasDragged) {
        this._setRangeSelectorValues();
    }

    this.updateMinMax();
    this.updatePriceLines(true);

    this._fireEventListeners('afterSetExtremes');
    this._fireEventListeners('afterXSetExtremes', [this.getRange()]);

    //if (this.chart && this.chart.annotations) {
    //    this.scaleDrawings();
    //}
};

/**
 * afterYSetExtremes
 */
infChart.StockChart.prototype.afterYSetExtremes = function () {
    if (this.hasLastLine || this.hasPreviousCloseLine) {
        this.adjustPriceLineLabels();
    }
    if(this.enableBarClosure){
        this.adjustBarClosure();
    }
    if (this.bidAskLabelsEnabled) {
        this._updateBidAskLabels();
    }

    this.updateMinMax();

    this._fireEventListeners('afterYSetExtremes');
    this._fireEventListeners('afteYSetExtremes', [this.getMainYAxis().getExtremes()]);
};

/**
 * beforeScalingAxis
 */
infChart.StockChart.prototype._beforeScalingAxis = function (args) {
    this._fireEventListeners('beforeScalingAxis', args);
    //this._fireRegisteredMethod('beforeScalingAxis', args);
};

/**
 * afterScalingAxis
 */
infChart.StockChart.prototype._afterScalingAxis = function (args) {
    this._fireEventListeners('afterScalingAxis', args);
    //this._fireRegisteredMethod('afterScalingAxis', args);
};

/**
 * Return the x axis labels
 */
infChart.StockChart.prototype.getXAxisCrosshairLabel = function (value, axis) {
    var minuteData = this.interval && this.interval.split('_')[0] === 'I' ? " " + axis.options.dateTimeLabelFormats.minute : "";

    return infChart.util.formatDate(value, axis.options.dateTimeLabelFormats.day + minuteData);
};

/**
 * reset y axis extremes
 * need to reset whenever data set changes
 * 1. when chart mode changes
 * 2. when chart period changes
 * 3. when chart symbol changes
 * @param redraw
 */
infChart.StockChart.prototype.resetYAxisExtremes = function (redraw) {
    if (this.chart) {
        this.chart.infIsUserYExt = false;
        this.getMainYAxis().setExtremes(undefined, undefined, redraw, false);
    }
};

/**
 * set y axis extremes by zooming
 * mouse wheel or scalable axis
 * @param {number} userMin new min
 * @param {number} userMax new max
 * @param {boolean} redraw redraw required or not
 * @param {boolean|undefined} isUserInteraction user interacted action or not
 */
infChart.StockChart.prototype.setUserDefinedYAxisExtremes = function (userMin, userMax, redraw, isUserInteraction) {
    if (typeof isUserInteraction === "undefined") {
        isUserInteraction = true;
    }
    this.chart.infIsUserYExt = isUserInteraction;
    this.getMainYAxis().setExtremes(userMin, userMax, redraw, false);
};

/**
 * has user set the extremes
 * @returns {boolean}
 */
infChart.StockChart.prototype.isUserDefinedYAxisExtremes = function () {
    return this.chart.infIsUserYExt === true;
};

/**
 * Set new default extremes when max value changed
 * @param newMin new min value of the series
 * @param newMax new max value of the series
 */
infChart.StockChart.prototype._setDefaultXAxisExtremes = function (newMin, newMax) {
    this.defaultXAxisExtremes = {min: newMin, max: newMax};
};

/**
 * has user set the extremes
 * @returns {boolean}
 */
infChart.StockChart.prototype.isUserDefinedXAxisExtremes = function () {
    return this.chart.infManualExtreme === true;
};

infChart.StockChart.prototype.resetXAxisExtremesToDefault = function () {
    this.chart.infManualExtreme = false;
    if (this.defaultXAxisExtremes) {
        this.getMainXAxis().setExtremes(this.defaultXAxisExtremes.min, this.defaultXAxisExtremes.max, true);
    }
};

infChart.StockChart.prototype.isDefaultXAxisExtremes = function () {
    var xAxis = this.getMainXAxis();
    return (this.defaultXAxisExtremes && xAxis.min == this.defaultXAxisExtremes.min && xAxis.max == this.defaultXAxisExtremes.max);
};

infChart.StockChart.prototype.setXAxisExtremes = function (userMin, userMax, redraw, isUserInteraction) {
    this._beforeScalingAxis({xAxis: true, yAxis: false});
    this.chart.infManualExtreme = isUserInteraction;
    this.getMainXAxis().setExtremes(userMin, userMax, redraw);
    this._clearToolbarControls("period", true);
    this._afterScalingAxis({xAxis: true, yAxis: false});
};

/**
 * Method to convert given value of the given types to the base value
 * @param value
 * @param isLog
 * @param isCompare
 * @param isPercent
 * @returns {*}
 */
infChart.StockChart.prototype.convertBaseYValue = function (value, isLog, isCompare, isPercent) {
    var convertedValue;

    if (isLog) {
        value = infChart.util.num2Log(Math.abs(value));
    }

    if (isPercent) {
        if (isCompare) {
            var mainSeries = this.getMainSeries(),
                compareValue = this.getSeriesCompareValue(mainSeries);

            convertedValue = compareValue ? (value / compareValue - 1) * 100 : value;
        } else {
            convertedValue = value;
        }
    } else {
        convertedValue = value;
    }
    return convertedValue;
};

infChart.StockChart.prototype.onNavigatorScrollStart = function (navigator) {
    if (this.rangeSelectorEl) {
        this.rangeSelectorEl.hide();
    }
    if (this.mouseWheelController) {
        this.mouseWheelController.destroy();
    }
    this._fireEventListeners('onNavigatorScrollStart', []);
    this._afterScalingAxis({xAxis: true, yAxis: false});
};

infChart.StockChart.prototype.onNavigatorScrollStop = function (navigator) {
    if (this.rangeSelectorEl) {
        this.rangeSelectorEl.show();
    }
    if (this.mouseWheelController) {
        this.mouseWheelController.initialize();
    }

    if (navigator.infHasDragged) {
        this._setRangeSelectorValues();
    }

    /*if (self.config.events.onNavigatorScrollStop && basexAxis && !isNaN(basexAxis.min) && !isNaN(basexAxis.max)) {
     self.config.events.onNavigatorScrollStop.apply(this, [basexAxis.min, basexAxis.max]);
     }*/
    var extremes = this.getRange(),
        resultObj = {timeZoneOffset: this.dataManager.getTimeZone(this.interval)};
    if (extremes.dataMax != extremes.max) {
        resultObj.max = extremes.max;
    }
    if (extremes.dataMin != extremes.min) {
        resultObj.min = extremes.min;
    }

    this._fireEventListeners('onNavigatorScrollStop', [resultObj], true);
    this._fireRegisteredMethod('onNavigatorScrollStop', [resultObj]);
};

//endregion===================End of Zooming and Rage Select============================================================

infChart.StockChart.prototype.redrawChart = function (avoidHighChartRedraw) {
    //this.setYAxisExtremes(false);
    var hchart = this.chart;

    if (hchart.redraw && !avoidHighChartRedraw) {
        this._setIndicatorFrames(false);
        hchart.redraw();
    }
    this._setLabels();
    this.updateMinMax();
    //this.setLegendValue();
    //this.scaleDrawings(this.id);

    if (hchart.redrawWaterMark) {
        hchart.redrawWaterMark();
    }
    this._fireEventListeners("resize");
};

//infChart.StockChart.prototype.hideAllIndicatorSettingsPopups = function () {
//    $.each(infChart.indicatorMgr.getAllIndicators(this.id), function (key, indicator) {
//        indicator.hideSettingsPopup();
//    });
//};

//infChart.StockChart.prototype.hideAllSettingsPopups = function () {
//    $.each(this.settingsPopups, function (key, settingsPopup) {
//        if (settingsPopup) {
//            settingsPopup.hide();
//        }
//    });
//    this.hideAllIndicatorSettingsPopups();
//};

/**
 * use infChart.indicatorMgr.indicatorLegendClick
 * @Deprecated
 * @param seriesId
 */
//infChart.StockChart.prototype.indicatorLegendClick = function (seriesId) {
//    infChart.indicatorMgr.getIndicatorBySeriesId(this.id, seriesId).loadSettingWindow(false);
//};

infChart.StockChart.prototype.seriesLegendClick = function (seriesId) {
    this._loadSettingWindow(false, {'seriesId': seriesId});
};

infChart.StockChart.prototype._hasSeriesColorOptions = function (seriesId, type) {
    return this.seriesColorOptions[seriesId] && this.seriesColorOptions[seriesId][type];
};

infChart.StockChart.prototype._getSeriesColorOptions = function (seriesId, type) {
    return this.seriesColorOptions[seriesId] && this.seriesColorOptions[seriesId][type] ? this.seriesColorOptions[seriesId][type] : this.chart.options.plotOptions[type];
};

/**
 * todo : support popup??
 * load settings window
 * @param {boolean} hide
 * @param options
 */
infChart.StockChart.prototype._loadSettingWindow = function (hide, options) {
    var self = this, container = $(infChart.structureManager.getContainer(self.getContainer(), "symbolSettingsPanelView")),
    seriesId = options.seriesId, series = self.chart.get(seriesId),
    chartSettingPanel = infChart.structureManager.settings.getChartSettingPanel(self.chartId);

    if (container && container.length) {

        if(chartSettingPanel.length){
            chartSettingPanel.remove();
        }

        var settingContent = infChart.structureManager.settings.getPanelBodyHTML([infChart.structureManager.settings.getChartStyleSection(self)]);
        var settingHTML = infChart.structureManager.settings.getPanelHTML(self.chartId + "-chart-settings-panel", self.chartId, undefined, settingContent, true, 'label.chartSettings')
        $(settingHTML).prependTo(container);

        self._bindChartSettingsWindow();
        self.toggleGridSettingPanel();

        if (!self.settingsPopups[seriesId]) {
            var styleTypes = (self.styleTypes[seriesId]) ? self.styleTypes[seriesId] : (series.options.styleTypes) ? series.options.styleTypes : self.styleTypes["default"];

            var chartTypes = [];
            infChart.util.forEach(styleTypes, function (i, chartType) {
                var cls = self.chartStyleOptions[chartType] && self.chartStyleOptions[chartType].ico ? self.chartStyleOptions[chartType].ico : 'ico-chart-' + chartType;
                chartTypes.xPush({
                    'type': chartType,
                    'icon': cls,
                    'colors': self.getColorsForChartType(series, chartType)
                });
            });

            var content = infChart.structureManager.settings.getPanelBodyHTML([infChart.structureManager.settings.getSeriesStyleSection(seriesId, chartTypes)]);
            var html = infChart.structureManager.settings.getPanelHTML(self.id + "-symbol-settings-panel", seriesId, series.options.infLegendLabel, content, self.isMainSeries(series));

            self.settingsPopups[seriesId] = $(html).appendTo(container);

            self._bindSettingsWindow(self.settingsPopups[seriesId], series);
        } else {
            //if main symbol has changed
            self.settingsPopups[seriesId].find('[rel="panelTitle"]').html(series.options.infLegendLabel);
        }

        if (!hide) {
            self.showRightPanelWithTab(self.id + "_" + "symbolSettingsPanelView");
        }

        //if panel is visible
        if (!self.settingsPopups[seriesId].find('div.panel-collapse').is(":visible")) {
            self.settingsPopups[seriesId].find('div.panel-collapse').collapse("show");
            //self.settingsPopups[seriesId].find('div.panel-heading a').trigger('click');
        }

        var xGridLineWidth = self.chart.xAxis[0].options.gridLineWidth;
        var yGridLineWidth = self.chart.yAxis[0].options.gridLineWidth;
        var gridLineWidth = xGridLineWidth > yGridLineWidth ? xGridLineWidth: yGridLineWidth;
        var backgroundType = this.chart.options.chart.backgroundColor && typeof this.chart.options.chart.backgroundColor !== 'string' ? "gradient" : "solid";
        chartSettingPanel = container.find('div[rel="panel_'+ self.chartId +'"]');

        infChart.structureManager.settings.initializeStylePanel(self.settingsPopups[seriesId], seriesId, series.type, series.options.lineWidth);
        infChart.structureManager.settings.initializeChartStylePanel(gridLineWidth, chartSettingPanel, self.chartId, backgroundType);
    }
};

infChart.StockChart.prototype._bindChartSettingsWindow = function () {
    var self = this,
    container = $(infChart.structureManager.getContainer(self.getContainer(), "symbolSettingsPanelView")),
    chartSettingPanel = container.find('div[rel="panel_'+ self.chartId +'"]');

    function onGridLineWidthChange(strokeWidth) {
        var redraw = !self.isFirstLoadInprogress();
        var xGridLineWidth = self.chart.xAxis[0].options.gridLineWidth > 0 ? strokeWidth : undefined;
        var yGridLineWidth = self.chart.yAxis[0].options.gridLineWidth > 0 ? strokeWidth : undefined;

        self.setGridLineWidth(xGridLineWidth, yGridLineWidth, redraw, true);
    }

    function onGridLineColorChange(xGridLineColor, yGridLineColor) {
        self.setGridLineColor(xGridLineColor, yGridLineColor, true);
    }

    function onBackgroundColorChange(color, opacity, rgb) {
        self.setChartBackgroundColor(color, opacity, true,);
    }

    function onGradientBackgroundColorChange(topColor, bottomColor, topOpacity, bottomOpacity, rgb) {
        self.setGradientChartBackgroundColor(topColor, bottomColor, topOpacity, bottomOpacity, true);
    }

    function onCustomCandleCountChange(element, value, isPropertyChange) {
        self.setCustomCandleCount(element, value, isPropertyChange);
    }

    var callbacks = {
        onGridLineWidthChange: onGridLineWidthChange,
        onGridLineColorChange: onGridLineColorChange,
        onBackgroundColorChange: onBackgroundColorChange,
        onGradientBackgroundColorChange: onGradientBackgroundColorChange,
        onCustomCandleCountChange: onCustomCandleCountChange
    }
    infChart.structureManager.settings.bindChartStyleElements( self.chartId, chartSettingPanel, callbacks);
    infChart.structureManager.settings.bindPanel(chartSettingPanel);

};

infChart.StockChart.prototype._bindSettingsWindow = function (settingsContainer, series) {
    var self = this, seriesId = series.options.id;
    function onChartTypeChange(seriesId, chartType, colorObj) {
        var redraw = !self.isFirstLoadInprogress();
        var isUndoRedo = settingsContainer.data("infUndoRedo");

        self._changeSeriesType(series, chartType, false, !isUndoRedo);
        var theme = infChart.themeManager.getTheme();
        var lineWidth = (theme.plotOptions[series.type].lineWidth) ? theme.plotOptions[series.type].lineWidth : series.options.lineWidth;
        if(lineWidth){
            self.setLineWidth(series, lineWidth, false);
        }
        if (colorObj.color) {
            self.setColor(series, colorObj.hexColor, colorObj.color, undefined, redraw);
        } else {
            self.setColor(series, colorObj.hexColor, colorObj.upColor, colorObj.downColor, redraw);
        }
        if(self.hasLastLine){
            self._drawLastLine();
        }
        if(self.enableBarClosure){
            self._drawBarClosureLabel();
        }

        if (self.bidAskLabelsEnabled){
            self._drawBidAskLabels();
        }

        if (self.bidAskLineEnabled) {
            self._drawBidAskLines();
        }
        settingsContainer.data("infUndoRedo", false);
    }

    function onColorChange(seriesId, colorObj) {
        var redraw = !self.isFirstLoadInprogress();
        if (colorObj.color) {
            self.setColor(series, colorObj.hexColor, colorObj.color, undefined, redraw, true);
        } else {
            self.setColor(series, colorObj.hexColor, colorObj.upColor, colorObj.downColor, redraw, true);
        }
        if(self.hasLastLine){
            self._drawLastLine();
        }
        if(self.enableBarClosure){
            self._drawBarClosureLabel();
        }
    }

    function onLineWidthChange(seriesId, strokeWidth) {
        var redraw = !self.isFirstLoadInprogress();
        self.setLineWidth(series, strokeWidth, redraw, true);
        //series.update({
        //        lineWidth: strokeWidth
        //    }, redraw
        //);
        //if (self.seriesColorOptions[series.options.id] && self.seriesColorOptions[series.options.id][series.options.type]) {
        //    self.seriesColorOptions[series.options.id][series.options.type].lineWidth = strokeWidth;
        //}
    }

    // bind style type tabs
    infChart.structureManager.settings.bindStyleElements(settingsContainer, seriesId, series.color, onChartTypeChange, onColorChange, onLineWidthChange);
    if (self.isMainSeries(series)) {
        infChart.structureManager.settings.bindPanel(settingsContainer);
    } else {
        infChart.structureManager.settings.bindPanel(settingsContainer, function (seriesId) {
            self.removeSeriesFromChart(seriesId, series.options.infType)
        });
    }
};

infChart.StockChart.prototype._getLineColor = function (series, type) {
    var typeLineColor = (this.seriesColorOptions[series.options.id] && this.seriesColorOptions[series.options.id][type] && this.seriesColorOptions[series.options.id][type].lineColor) ? this.seriesColorOptions[series.options.id][type].lineColor : undefined;
    var seriesOptionLineColor = (this.seriesColorOptions[series.options.id] && this.seriesColorOptions[series.options.id]["line"] && this.seriesColorOptions[series.options.id]["line"].lineColor) ? this.seriesColorOptions[series.options.id]["line"].lineColor : undefined;
    return typeLineColor ? typeLineColor : seriesOptionLineColor ? seriesOptionLineColor :
        this.chart.options.plotOptions[type] && this.chart.options.plotOptions[type].lineColor ? this.chart.options.plotOptions[type].lineColor :
            (this.chart.options.plotOptions["line"].lineColor) ? this.chart.options.plotOptions["line"].lineColor : series.options.lineColor;
};

/**
 * set series color
 * @param series - highchart series
 * @param hexColor - color code in hex
 * @param upColor - rgb up color
 * @param downColor - rgb down color
 * @param redraw redraw or not
 * @param isPropertyChange isPropertyChange
 * @param useSeriesLineColor - true if use series line color - used in area chart
 */
infChart.StockChart.prototype.setColor = function (series, hexColor, upColor, downColor, redraw, isPropertyChange, useSeriesLineColor) {

    if (typeof redraw == "undefined") {
        redraw = true;
    }

    var theme = infChart.themeManager.getTheme();
    var type = series.type;
    var cfg = {color: hexColor};
    var propertyType = "seriesColor";
    switch (type) {
        case 'area':
            cfg.lineColor = useSeriesLineColor ? hexColor : this._getLineColor(series, type);
            cfg.color = cfg.lineColor;
            //cfg.lineColor = hexColor;
            cfg.negativeColor = series.options.negativeColor;
            if (series.options.hasAreaNegative) {
                cfg.fillColor = upColor;
                cfg.negativeFillColor = downColor;
            } else {
                cfg.fillColor = {
                    linearGradient: {x1: 0, y1: 0, x2: 0, y2: 1},
                    stops: [
                        [0, upColor],
                        [1, downColor]
                    ]
                };
            }
            break;
        case 'line':
        case 'dash':
        case 'step':
            cfg.lineColor = hexColor;
            cfg.negativeColor = null;
            break;
        case 'arearange':
            cfg.lineColor = hexColor;
            cfg.fillOpacity = infChart.util.getOpacityFromRGBA(upColor);
            cfg.negativeColor = null;
            break;
        case 'column':
            if (series.options.hasColumnNegative) {
                cfg.color = upColor;
                cfg.negativeColor = downColor;
            } else {
                cfg.color = hexColor;
                cfg.negativeColor = hexColor;
            }
            break;
        case 'volume':
            if (series.options.hasColumnNegative) {
                cfg.upColor = upColor;
                cfg.upLineColor = upColor;
                cfg.color = downColor;
                cfg.lineColor = downColor;
            } else {
                cfg.color = hexColor;
                cfg.lineColor = downColor;
                cfg.upColor = downColor;
            }
            break;
        case 'candlestick':
        case 'ohlc':
        case 'hlc':
        case 'heikinashi':
        case 'equivolume':
        case 'point':
        case 'customCandle':
        case 'engulfingCandles':
            cfg.color = downColor;
            cfg.lineColor = downColor;
            cfg.upColor = upColor;
            cfg.upLineColor = upColor;
            cfg.negativeColor = null;
            break;
        case 'flags':
            cfg.fillColor = upColor;
            break;
        case 'infUDSignal':
            cfg.fillColor = upColor;
            cfg.lineColor = upColor;
            break;
        case 'infsignal':
            cfg.fillColor = upColor;
            cfg.lineColor = upColor;
            cfg.style = {color: upColor};
            break;
        case 'plotrange':
            cfg.color = upColor;
            cfg.fillColor = upColor;
            break;
        default:
            break;
    }
    //cfg.lineWidth = (theme.plotOptions[type].lineWidth) ? theme.plotOptions[type].lineWidth : series.options.lineWidth;
    var obj = {};
    obj[type] = cfg;
    this.seriesColorOptions[series.options.id] = $.extend({}, this.seriesColorOptions[series.options.id], obj);
    series.update(cfg, false);
    if(this.hasLastLine){
        this._drawLastLine();
    }
    if(this.enableBarClosure){
        this._drawBarClosureLabel();
    }

    if (this.bidAskLabelsEnabled) {
        this._drawBidAskLabels();
    }

    if (this.bidAskLineEnabled) {
        this._drawBidAskLines();
    }

    this._cleanNavigatorSeries(redraw);


     if(isPropertyChange){
        this._onPropertyChange("onChartColorChange", propertyType);
    }

};

// infChart.StockChart.prototype.getColors = function () {
//     return Highcharts.theme.seriesColorMap || ["#fbf201", "#00aeff", "#ff15af", "#8aff00", "#9f37ff"];
// };

/**
 * set series line Width
 * @param {Highcharts.series} series series to update
 * @param {number} width width to update
 * @param {boolean} redraw redraw or not
 * @param {boolean} isPropertyChange property change or not (used in wrappers)
 */
infChart.StockChart.prototype.setLineWidth = function (series, width, redraw, isPropertyChange) {

    series.update({
            lineWidth: width
        }, redraw
    );

    if (this.seriesColorOptions && this.seriesColorOptions[series.options.id] && this.seriesColorOptions[series.options.id][series.type]) {
        this.seriesColorOptions[series.options.id][series.type].lineWidth = width;
    }
};

infChart.StockChart.prototype.setGridLineWidth = function (xAxisGridLineWidth, yAxisGridLineWidth, redraw, isPropertyChange) {

    if (xAxisGridLineWidth) {
        this.chart.xAxis[0].update({
            gridLineWidth: xAxisGridLineWidth,
        }, false);
        this.xGridLineWidth = xAxisGridLineWidth;
    }
    if (yAxisGridLineWidth) {
        this.chart.yAxis[0].update({
            gridLineWidth: yAxisGridLineWidth,
        }, false);
        this.yGridLineWidth = yAxisGridLineWidth;
    }

    this.chart.redraw();

    if(isPropertyChange){
        this._onPropertyChange("gridSettings");
    }
};

infChart.StockChart.prototype.setGridLineColor = function (xGridColor, yGridColor, isPropertyChange) {

    if(xGridColor){
        this.chart.xAxis[0].update({
            gridLineColor: xGridColor
        }, false);
    }

    if(yGridColor){
        this.chart.yAxis[0].update({
            gridLineColor: yGridColor,
        }, false);
    }

    if(isPropertyChange){
        this.customGridLineColorEnabled = true;
    }

    this.chart.redraw();

    if(isPropertyChange) {
        this._onPropertyChange("onChartColorChange", "gridLineColor");
    }
};

infChart.StockChart.prototype.setChartBackgroundColor = function (color, opacity, isPropertyChange) {

    this.chart.update({
        chart: {
            backgroundColor: Highcharts.color(color).setOpacity(opacity).get(),
          }
    }, false);

    this.chartBackgroundColor = color;
    this.backgroundColorOpacity = opacity;
    this.chart.redraw();

    if(isPropertyChange) {
        this._onPropertyChange("onChartColorChange", "backgroundColor");
    }
};

infChart.StockChart.prototype.setCustomCandleCount = function (element, value, isPropertyChange, ignoreSetCandleCount, blockCirculerNotify) {
    this.chart.update({
        chart: {
            customCandleCount: value
        }
    }, false);

    this.customCandleCount = value;
    if(typeof infChart.globalSettingsManager !== 'undefined' && !ignoreSetCandleCount){
        infChart.globalSettingsManager.setFavouriteCandleCount(value);
    }
    this._setChartToMaxPossiblePeriod(true);
    this.chart.redraw();

    if(this._getSettingsPanel() && ignoreSetCandleCount){
        this._getSettingsPanel().find('input[inf-ctrl="customCandleCount"]').attr({value:value, 'data-value':value, 'inf-value':value});
    }

    if (isPropertyChange) {
        this._onPropertyChange("customCandleCount", undefined, value, blockCirculerNotify);
    }
};

infChart.StockChart.prototype.setGradientChartBackgroundColor = function (topColor, bottomColor, topColorOpacity, bottomColorOpacity, isPropertyChange) {

    var topGradientColor = this.chartBgTopGradientColor;
    var bottomGradientColor = this.chartBgBottomGradientColor;

    topGradientColor = topColor ? topColor : topGradientColor;
    bottomGradientColor = bottomColor ? bottomColor : bottomGradientColor;

    this.chart.update({
        chart: {
            backgroundColor: {
              linearGradient: [0, 0, 0, 500],
              stops: [
                [0, Highcharts.color(topGradientColor).setOpacity(topColorOpacity).get()],
                [1,  Highcharts.color(bottomGradientColor).setOpacity(bottomColorOpacity).get()]
              ]
            }
          },
    }, false);

    if(topColor){
        this.chartBgTopGradientColor = topColor;
        this.chartBgTopGradientColorOpacity = topColorOpacity;

    }
    if(bottomColor){
        this.chartBgBottomGradientColor = bottomColor;
        this.chartBgBottomGradientColorOpacity = bottomColorOpacity;
    }
    this.chart.redraw();

    if(isPropertyChange) {
        this._onPropertyChange("onChartColorChange", "backgroundColor");
    }
};


infChart.StockChart.prototype.updateSeriesOptions = function (series, options) {

    for (var i = 0; i < options.length; i++) {
        var redraw = (i === options.length - 1), option = options[i];
        switch (option.type) {
            case 'lineWidth':
                this.setLineWidth(series, option.values.width, redraw);
                break;
            case 'zIndex':
                series.update({
                        zIndex: option.values.zIndex
                    }, redraw
                );
                break;
            case 'color':
                this.setColor(series, option.values.hexColor, option.values.upColor, option.values.downColor, redraw, false, true);
                break;
            default:
                break;
        }
    }
};

// infChart.StockChart.prototype.getTheme = function () {
//     return Highcharts.theme;
// };

infChart.StockChart.prototype.isAfterRedrawRequired = function () {
    return !!this.plotHeight;
};

infChart.StockChart.prototype.afterRedraw = function () {

    if (this.chart && this.plotHeight != this.chart.plotHeight) {
        this.redrawChart(); //#CCA-2972 - remove this and call resizeChart to scale drawings
        //this._setIndicatorFrames(false); //#CCA-2972 - resizeChart did not set indicator frames
        //this.resizeChart();
    } else if (this.chart && this.chart.infPrevAxisOffset) {
        var mainYAxis = this.getMainYAxis(),
            side = mainYAxis.side;
        if (this.chart.axisOffset[side] != this.chart.infPrevAxisOffset[side]) {
            this.redrawChart(true);
        }
    }

    var mainseries = this.getMainSeries();
    mainseries && mainseries.group && mainseries.group.toFront && mainseries.group.toFront();
};

infChart.StockChart.prototype.updatePriceLines = function (redraw) {
    redraw = (redraw == true);
    if (this.hasLastLine) {
        this._drawLastLine();
    }
    if(this.enableBarClosure){
        this._drawBarClosureLabel();
    }
    if (this.hasPreviousCloseLine) {
        this._enablePreviousCloseLine(redraw);
    }
    if (this.hasLastLineForCompareSymbols) {
        this._drawLastLineForCompareSymbols();
    }
    if (this.bidAskLabelsEnabled) {
        this._drawBidAskLabels();
    }
    if (this.bidAskLineEnabled) {
        this._drawBidAskLines();
    }
};

/**
 * Adjust the last and pre close labels when y axis changes
 */
infChart.StockChart.prototype.adjustPriceLineLabels = function () {
    var yAxis = this.getMainYAxis(), lineIds = [], labels = [], preservedCount = 0, lineIdx,
        prevCloseLineIds = [];

    if (yAxis) {
        if (this.hasLastLine && this.lastLabel && this.lastLine) {
            lineIds.xPush(this.lastLine);
            labels.xPush(this.lastLabel);
        }

        this._updateBidAskLabels();

        if (this.hasPreviousCloseLine && this.preCloseLabel && this.preCloseLine) {
            lineIds.xPush(this.preCloseLine);
            labels.xPush(this.preCloseLabel);
            prevCloseLineIds.xPush(this.preCloseLine);
        }

        if (this.hasLastLineForCompareSymbols) {
            for (var lineId in this.lastLabelForCompareSymbols) {
                if (this.lastLabelForCompareSymbols.hasOwnProperty(lineId)) {
                    lineIds.xPush(lineId);
                    labels.xPush(this.lastLabelForCompareSymbols[lineId]);
                }
            }
        }

        var plotLines = yAxis.plotLinesAndBands,
            labelAlign,
            isPrevClose;

        if (lineIds.length > 0 && plotLines.length > 0) {

            for (var i = 0, iLen = plotLines.length; i < iLen; i++) {
                lineIdx = lineIds.indexOf(plotLines[i].options.id);
                isPrevClose = prevCloseLineIds.indexOf(plotLines[i].options.id) >= 0;
                labelAlign = isPrevClose ? this.settings.config.previousCloseLabelAlign : this.settings.config.lastLabelAlign;

                if (lineIdx >= 0) {
                    var anchorx = (labelAlign == "right") ? undefined : this.chart.chartWidth;
                    var xPix = (labelAlign == "right") ? undefined : yAxis.left;
                    this._setPositionsForCalloutLabel(labels[lineIdx], labels[lineIdx].text.textStr, yAxis, yAxis.toPixels(plotLines[i].options.value), xPix, anchorx);
                    preservedCount++;

                    if (preservedCount == lineIds.length) {
                        break;
                    }
                }
            }
        }
    }
};

infChart.StockChart.prototype.adjustBarClosure = function () {
    var chart = this.chart,
        series = this.getMainSeries(),
        yAxis = this.getMainYAxis();

    if(this.rangeData && this.rangeData.data && this.rangeData.data.length && series.yData && series.yData.length > 0){
        var lastValue = this.getLastLineValue();
        var pointYValue = this.getSeriesProcessedValue(series, lastValue);
        if (this.enableBarClosure) {
            lastLineColor = this._getLastCandleColor();
            labelValue = this.barClosureTimeRemaining;

            if (this.barClosureLabel) {
                this._setPositionsForBarClosureLabel(this.barClosureLabel, labelValue, yAxis, yAxis.toPixels(pointYValue));
            }
        }
    }
};

infChart.StockChart.prototype.getLastLineValue = function () {
    return this.type == "heikinashi" && this.chart && this.chart.series[0] && this.chart.series[0].prevPoint && this.chart.series[0].prevPoint[this.chart.series[0].prevPoint.length - 1] && this.chart.series[0].prevPoint[this.chart.series[0].prevPoint.length - 1].xPoint ? this.chart.series[0].prevPoint[this.chart.series[0].prevPoint.length - 1].xPoint.close : this.rangeData.data[this.rangeData.data.length - 1][4];
};

//region =====================last line=================================================================================

/**
 * Returns the processed last value of the series
 * @returns {number}
 */
infChart.StockChart.prototype.getLastValue = function () {

    var series = this.getMainSeries(), diff = 0, pointYValue = 0;

    if (series && series.yData && series.yData.length > 0) {

        if (this.rangeData.data.length > 0) {
            pointYValue = this.rangeData.data[this.rangeData.data.length - 1][4];

        }
        pointYValue = this.getSeriesProcessedValue(series, pointYValue);
    }
    return pointYValue;
};

/**
 * Returns the processed last value of the series
 * @returns {number}
 */
infChart.StockChart.prototype.getLastPrice = function (callback) {
    var series = this.getMainSeries(), diff = 0, pointYValue = 0;

    if (this._hasRegisteredMethod('lastPrice')) {
        this._fireEventListeners('lastPrice', [callback]);
    } else if (this.data.base && this.data.base.length > 0) {
        callback.call(this, this.data.base[this.data.base.length - 1][4], this.data.base[this.data.base.length - 1]);
    } else {
        callback.call(this, undefined);
    }

};

/**
 * Returns the current data which chart is drawn for given symbol
 * @returns {number}
 */
infChart.StockChart.prototype.getCurrentData = function (symbol) {
    var data;
    if (this.chart) {
        if (this.checkEquivalentSymbols(this.symbol, symbol)) {
            data = this.data.base;
        } else if (this._isCompareSymbol(symbol)) {
            data = this.data.compare[symbol.symbolId];
        }
    }
    return data;
};

/**
 * get max label width from last and previous close
 * only when labels align to right
 */
infChart.StockChart.prototype.getMaxLastLabelWidth = function () {
    var llLabelWidth = 0;
    var pclLabelWidth = 0;
    if(this.hasLastLine && this.settings.config.lastLabelAlign == "right") {
        llLabelWidth = this.lastLabel && this.lastLabel.width;
    }
    if(this.hasPreviousCloseLine && this.settings.config.previousCloseLabelAlign == "right") {
        pclLabelWidth = this.preCloseLabel && this.preCloseLabel.width;
    }
    return Math.max(llLabelWidth, pclLabelWidth);
};

/**
 * add last line as a plot line
 */
infChart.StockChart.prototype._drawLastLine = function () {
    var chart = this.chart,
        series = this.getMainSeries(),
        redrawYLabels = !this.hasLastLine;

    if (this.rangeData.data && this.rangeData.data.length && series.yData && series.yData.length > 0) {

        var pointYValue,
            lastValue = this.getLastLineValue(),
            mainSeries = this.getMainSeries(),
            lastlineTheme = this._getLastLineTheme(),
            yAxis = this.getMainYAxis(),
            labelTx;

        pointYValue = this.getSeriesProcessedValue(series, lastValue);

        if (this.hasLastLine) {
            this._removeLastLine(true);
        }

        this.lastLine = this.chartId + "_last";

        var useSeriesColor = this.hasLastLineForCompareSymbols;

        if (!isNaN(pointYValue)) {
            var anchorx, xPix, shape;
            labelTx = this.formatValue(lastValue, mainSeries.options.dp, undefined, true, false, NO_OF_LAST_PRICE_DECIMAL_POINTS);
            if(this.settings.config.lastLabelAlign === "right") {
                shape = 'rect';
            } else {
                anchorx = chart.chartWidth;
                xPix = yAxis.left;
                shape = "callout";
            }

            lastLineColor = this._getLastCandleColor();
            this.lastPriceLine = yAxis.addPlotLine(
                {
                    /*"label": {
                    text: infChart.manager.getLabel('L'),
                    style: {
                    color: lastlineTheme.color
                    }
                    },*/
                    //useHTML:true,
                    id: this.lastLine,
                    "value": pointYValue,
                    "color": this.enabledLastLine ? (useSeriesColor ? series.options.color : (lastLineColor ? lastLineColor : lastlineTheme.color)) : 'transparent',
                    "dashStyle": "shortdash",
                    "width": 1,
                    "zIndex": 3
                }
            );

            if (!this.lastLabel) {
                if(this.enabledLastLabel){
                    this.lastLabel = this.chart.renderer.label(labelTx, null, null, shape).attr({
                        align: "right",
                        "zIndex": 20,
                        padding: 3,
                        r: 1,
                        fill: useSeriesColor ? series.options.color : lastLineColor ? lastLineColor : lastlineTheme.label.fill,
                    }).css({
                        color: lastlineTheme.label.color,
                        "font-size": lastlineTheme.label.fontSize
                    }).add();
                }
            }

            if(this.lastLabel){
                this._setPositionsForCalloutLabel(this.lastLabel, labelTx, yAxis, yAxis.toPixels(pointYValue), xPix, anchorx);
            }

            this.hasLastLine = true;

            //if (redrawYLabels) {
            //
            //    // this._setYAxisWidth(true);
            //    this._setPositionsForCalloutLabel(this.lastLabel, labelTx, yAxis, yAxis.toPixels(pointYValue), xPix, anchorx);
            //
            //}
        }
    }
};

/**
 * add bid/ask line as a plot line
 */
infChart.StockChart.prototype._drawBidAskLines = function () {
    let series = this.getMainSeries();

    if (this.rangeData.data && this.rangeData.data.length && series.yData && series.yData.length > 0) {
        let bidValue;
        let askValue;
        let yAxis = this.getMainYAxis();

        if (this.bidAskLineEnabled) {
            this._removeBidAskLines();
        }

        bidValue = this.rangeData.data[this.rangeData.data.length - 1][6];
        askValue = this.rangeData.data[this.rangeData.data.length - 1][7];

        let pointYBidValue = this.getSeriesProcessedValue(series, bidValue);
        let pointYAskValue = this.getSeriesProcessedValue(series, askValue);

        this.bidLineId = this.chartId + "_bid";
        this.askLineId = this.chartId + "_ask";

        if (!isNaN(bidValue) && !isNaN(askValue)) {
            yAxis.addPlotLine(
                {
                    id: this.bidLineId,
                    "value": pointYBidValue,
                    "color": series.options.upColor,
                    "dashStyle": "shortdash",
                    "width": 1,
                    "zIndex": 3
                }
            );

            yAxis.addPlotLine(
                {
                    id: this.askLineId,
                    "value": pointYAskValue,
                    "color": series.options.color,
                    "dashStyle": "shortdash",
                    "width": 1,
                    "zIndex": 3
                }
            );
        }
    }

    this.bidAskLineEnabled = true;
};

infChart.StockChart.prototype._removeBidAskLines = function () {
    let yAxis = this.getMainYAxis();
    yAxis.removePlotLine(this.bidLineId);
    yAxis.removePlotLine(this.askLineId);

    this.bidAskLineEnabled = false;
};

infChart.StockChart.prototype._drawBidAskLabels= function (isUpdate) {
    let series = this.getMainSeries(),
        lastlineTheme = this._getLastLineTheme(),
        yAxis = this.getMainYAxis();

    if (this.rangeData.data && this.rangeData.data.length && series.yData && series.yData.length > 0) {
        let bidValue;
        let askValue;

        if (this.bidAskLabelsEnabled && !isUpdate) {
            this._removeBidAskLabels();
        }

        bidValue = this.rangeData.data[this.rangeData.data.length - 1][6];
        askValue = this.rangeData.data[this.rangeData.data.length - 1][7];

        this.bidValue = bidValue;
        this.askValue = askValue;

        if (bidValue && askValue) {
            let pointYBidValue = this.getSeriesProcessedValue(series, bidValue);
            let pointYAskValue = this.getSeriesProcessedValue(series, askValue);

            let bidLabelTx = "<div class='yaxis-bidask-label'><span class='yaxis-bidask-label__title'>Bid</span><span class='yaxis-bidask-label__separator'></span><span class='yaxis-bidask-label__value'>" + this.formatValue(bidValue, series.options.dp, undefined, true, false, NO_OF_LAST_PRICE_DECIMAL_POINTS) + "</span></div>";
            let askLabelTx = "<div class='yaxis-bidask-label'><span class='yaxis-bidask-label__title'>Ask</span><span class='yaxis-bidask-label__separator'></span><span class='yaxis-bidask-label__value'>" + this.formatValue(askValue, series.options.dp, undefined, true, false, NO_OF_LAST_PRICE_DECIMAL_POINTS) + "</span></div>";

            if (!isUpdate) {
                let bidLabel = this.chart.renderer.label(bidLabelTx, null, null, 'rect', undefined, undefined, true).attr({
                    align: "right",
                    "zIndex": 10,
                    padding: 3,
                    r: 1,
                    fill: series.options.upColor,
                }).css({
                    color: lastlineTheme.label.color,
                    "font-size": lastlineTheme.label.fontSize
                }).add();

                let askLabel = this.chart.renderer.label(askLabelTx, null, null, 'rect', undefined, undefined, true).attr({
                    align: "right",
                    "zIndex": 10,
                    padding: 3,
                    r: 1,
                    fill: series.options.color,
                }).css({
                    color: lastlineTheme.label.color,
                    "font-size": lastlineTheme.label.fontSize
                }).add();

                this.bidAskLabels = [bidLabel, askLabel];
            }

            if (this.bidAskLabels && this.bidAskLabels.length > 0){
                this._setPositionsForBidAskLabels(this.bidAskLabels, bidLabelTx, askLabelTx, yAxis.toPixels(pointYBidValue), yAxis.toPixels(pointYAskValue), yAxis);
            }
        }
    }

    this.bidAskLabelsEnabled = true;
};

infChart.StockChart.prototype._setPositionsForBidAskLabels = function (bidAskLabels, bidText, askText, bidYPix, askYPix, yAxis, xPix, anchorX) {
    const bidLabel = bidAskLabels[0];
    const askLabel = bidAskLabels[1];
    const bidCrossBox = bidLabel.getBBox();
    const askCrossBox = askLabel.getBBox();
    const lastLabel = this.lastLabel;
    const halfLineWidth = 0.5;
    const yBottom = yAxis.top + yAxis.height - halfLineWidth;
    const yTop = yAxis.top - halfLineWidth;
    const posx = !isNaN(xPix) ? xPix : (yAxis.opposite ? yAxis.width + yAxis.left : 0);

    const lastLabelHeight = lastLabel ? lastLabel.getBBox().height : 0;
    const barClosureHeight = this.barClosureLabel ? this.barClosureLabel.getBBox().height : 0;

    const upperPartDiff = lastLabelHeight || barClosureHeight;
    const lowerPartDiff = lastLabelHeight + barClosureHeight;

    const diffLesser = Math.abs(bidYPix - askYPix) < 15;
    const lastValue = this.type == "heikinashi" && this.chart && this.chart.series[0] && this.chart.series[0].prevPoint && this.chart.series[0].prevPoint[this.chart.series[0].prevPoint.length - 1] && this.chart.series[0].prevPoint[this.chart.series[0].prevPoint.length - 1].xPoint ? this.chart.series[0].prevPoint[this.chart.series[0].prevPoint.length - 1].xPoint.close : this.rangeData.data[this.rangeData.data.length - 1][4];
    const lastYValue = this.getSeriesProcessedValue(this.getMainSeries(), lastValue);
    const lastPix = yAxis.toPixels(lastYValue);
    const askAndLastLabelYDiff = (lastLabel && Math.abs(askYPix - lastPix) < 18) || (this.barClosureLabel && Math.abs(askYPix - (lastPix + lastLabelHeight)) < 18);
    const bidAndLastLabelYDiff = (lastLabel && Math.abs(bidYPix - lastPix) < 18) || (this.barClosureLabel && Math.abs(bidYPix - (lastPix + lastLabelHeight)) < 18);

    let bidDiff = 0;
    let askDiff = 0;
    let isBidAskMiddleLine = false;

    if (askAndLastLabelYDiff || bidAndLastLabelYDiff) {
        if (lastPix >= bidYPix && lastPix >= askYPix) {
            bidDiff = bidYPix >= askYPix ? -upperPartDiff : -(upperPartDiff + this.bidAskLabels[1].getBBox().height);
            askDiff = bidYPix >= askYPix ? -(upperPartDiff + this.bidAskLabels[0].getBBox().height) : -upperPartDiff;
        } else if (lastPix < bidYPix && lastPix < askYPix) {
            bidDiff = bidYPix >= askYPix ? lowerPartDiff + this.bidAskLabels[1].getBBox().height : lowerPartDiff;
            askDiff = bidYPix >= askYPix ? lowerPartDiff : lowerPartDiff + this.bidAskLabels[0].getBBox().height;
        } else if (lastPix >= bidYPix && lastPix < askYPix) {
            bidDiff = -upperPartDiff;
            askDiff = +lowerPartDiff;
        } else if (lastPix < bidYPix && lastPix >= askYPix) {
            bidDiff = +lowerPartDiff;
            askDiff = -upperPartDiff;
        }

        if (!bidAndLastLabelYDiff && Math.abs(lastPix - bidYPix) >= Math.abs(bidDiff)) {
            bidDiff = 0;
        }

        if (!askAndLastLabelYDiff && Math.abs(lastPix - askYPix) >= Math.abs(askDiff)) {
            askDiff = 0;
        }
    } else if (diffLesser) {
        const diff = (this.bidAskLabels[0].getBBox().height - Math.abs(bidYPix - askYPix))/ 2;
        bidDiff = bidYPix >= askYPix ? diff : -diff;
        askDiff = bidYPix >= askYPix ? -diff : diff;
        isBidAskMiddleLine = true;
    }

    const adjustedBidY = (yTop > bidYPix - bidCrossBox.height / 2 && yTop < bidYPix) ? yTop :
        (yBottom < bidYPix + bidCrossBox.height / 2 && yBottom > bidYPix) ? yBottom - bidCrossBox.height : undefined;
    const adjustedAskY = (yTop > askYPix - askCrossBox.height / 2 && yTop < askYPix) ? yTop :
        (yBottom < askYPix + askCrossBox.height / 2 && yBottom > askYPix) ? yBottom - askCrossBox.height : undefined;

    this._showBidAskLabels(adjustedBidY, bidYPix, xPix, bidLabel, bidText, bidCrossBox, yTop, yBottom, posx, bidDiff, anchorX, yAxis, lastPix, isBidAskMiddleLine);
    this._showBidAskLabels(adjustedAskY, askYPix, xPix, askLabel, askText, askCrossBox, yTop, yBottom, posx, askDiff, anchorX, yAxis, lastPix, isBidAskMiddleLine);
};

infChart.StockChart.prototype._showBidAskLabels = function (adjustedY, yPix, xPix, label, text, crossBox, yTop, yBottom, posx, diff, anchorX, yAxis, lastPix, isBidAskMiddleLine) {
    let diffPixels;
    if (diff === 0) {
        diffPixels = yPix;
    } else {
        if (isBidAskMiddleLine) {
            diffPixels = diff + yPix;
        } else {
            diffPixels = diff + lastPix;
        }
    }

    if (!adjustedY && (yPix < yTop || yPix > yBottom)) {
        label.hide();
    } else {
        label.show().attr({
            text: text,
            x: posx,
            y: adjustedY != undefined ? adjustedY : diffPixels - crossBox.height / 2,
            visibility: 'visible'
        }).toFront();
    }

    if (label.visibility !== "hidden") {
        label.attr({
            x: xPix != undefined ? posx + crossBox.width : posx + this.chart.marginRight,
            y: adjustedY != undefined ? adjustedY : diffPixels - crossBox.height / 2,
            anchorY: yPix,
            showHalfAnchor: adjustedY != undefined,
            anchorX: anchorX ? anchorX : (yAxis.opposite ? 0 : this.chart.chartWidth)
        });
    }
};

infChart.StockChart.prototype._updateBidAskLabels = function () {
    if (this.bidAskLabelsEnabled && this.bidAskLabels && this.bidAskLabels.length === 2) {
        let yAxis = this.getMainYAxis();
        let series = this.getMainSeries();
        let bidValue = this.getSeriesProcessedValue(series, this.bidValue);
        let askValue = this.getSeriesProcessedValue(series, this.askValue);
        this._setPositionsForBidAskLabels(this.bidAskLabels, this.bidAskLabels[0].text.textStr, this.bidAskLabels[1].text.textStr, yAxis.toPixels(bidValue), yAxis.toPixels(askValue), yAxis)
    }
};

infChart.StockChart.prototype._removeBidAskLabels = function () {
    if (this.bidAskLabels && this.bidAskLabels.length > 0) {
        this.bidAskLabels.forEach(function (bidAskLabel) {
            bidAskLabel.destroy();
        });
        this.bidAskLabels = undefined;
    }
    this.bidAskLabelsEnabled = false;
};

infChart.StockChart.prototype._drawBarClosureLabel = function () {
    var chart = this.chart,
        series = this.getMainSeries(),
        lastlineTheme = this._getLastLineTheme(),
        yAxis = this.getMainYAxis();

    if (this.rangeData.data && this.rangeData.data.length && series.yData && series.yData.length > 0) {
        var lastValue = this.type == "heikinashi" && this.chart && this.chart.series[0] && this.chart.series[0].prevPoint && this.chart.series[0].prevPoint[this.chart.series[0].prevPoint.length - 1] && this.chart.series[0].prevPoint[this.chart.series[0].prevPoint.length - 1].xPoint ? this.chart.series[0].prevPoint[this.chart.series[0].prevPoint.length - 1].xPoint.close : this.rangeData.data[this.rangeData.data.length - 1][4];
        var pointYValue = this.getSeriesProcessedValue(series, lastValue);
        if(this.enableBarClosure){
            if (this.barClosureLabel) {
                this._removeBarClosureLabel(true);
            }
            lastLineColor = this._getLastCandleColor();
            labelValue = this.barClosureTimeRemaining;
            this.barClosureLabel = this.chart.renderer.label(labelValue, null, null, 'rect').attr({
                align: "right",
                "zIndex": 20,
                padding: 3,
                r: 1,
                fill: lastLineColor ? lastLineColor : lastlineTheme.label.fill,
            }).css({
                color: lastlineTheme.label.color,
                "font-size": lastlineTheme.label.fontSize
            }).add();

            if(this.barClosureLabel){
                this._setPositionsForBarClosureLabel(this.barClosureLabel, labelValue, yAxis, yAxis.toPixels(pointYValue));
            }
            this.enableBarClosure = true;
        }
    }
};

infChart.StockChart.prototype._removeBarClosureLabel = function () {
    if (this.barClosureLabel) {
        this.barClosureLabel.destroy();
        this.barClosureLabel = undefined;
    }
    this.enableBarClosure = false;
};

infChart.StockChart.prototype._getLastCandleColor = function(){
    let self = this;
    let chartType = self.type;
    let color;
    if(self.chart){
        let mainSeries = self.chart.series[0];
        if(mainSeries && mainSeries.userOptions){
            let settings = mainSeries.userOptions;
            switch (chartType) {
                case 'area':
                case 'line':
                case 'step':
                    color = settings.lineColor;
                    break;
                case 'column':
                    color = settings.color;
                    break;
                case 'candlestick':
                case 'ohlc':
                case 'hlc':
                case 'equivolume':
                case 'point':
                case 'customCandle':
                case 'engulfingCandles':
                    if(mainSeries && mainSeries.yData){
                        let yData = mainSeries.yData;
                        let lastCandle = yData[yData.length - 1];
                        let lastCandleOpen = lastCandle[0];
                        let lastCandleClose = lastCandle[3];
                        if(lastCandleOpen >= lastCandleClose){
                            color = settings.lineColor;
                        } else {
                            color = settings.upLineColor;
                        }
                    }
                    break;
                case 'heikinashi':
                    if(mainSeries && mainSeries.prevPoint && mainSeries.prevPoint > 0){
                        let yData = mainSeries.prevPoint;
                        let lastCandle = yData[yData.length - 1];
                        let lastCandleXPoint = lastCandle.xPoint;
                        let lastCandleOpen = lastCandleXPoint.open;
                        let lastCandleClose = lastCandleXPoint.close;
                        if(lastCandleOpen >= lastCandleClose){
                            color = settings.lineColor;
                        } else {
                            color = settings.upLineColor;
                        }
                    }
                    break;
                default:
                    break;
            }
        }
    }

    return color;
};

infChart.StockChart.prototype._drawLastLineForCompareSymbol = function (seriesId) {
    var stockChart = this, chart = stockChart.chart;
    var series = chart.get(seriesId);
    if (series.yData && series.yData.length > 0) {
        var pointYValue,
            lastLineTheme = stockChart._getLastLineTheme(),
            yAxis = stockChart.getMainYAxis(),
            lineId = stockChart.chartId + "_" + seriesId + "_last",
            rangeData = stockChart.rangeData.compareData[seriesId],
            lastValue = rangeData[rangeData.length - 1][4],
            symbol = stockChart.getCompareSymbolFromSeriesId(seriesId);

        pointYValue = this.getSeriesProcessedValue(series, lastValue);
        var labelTx = this.formatValue(lastValue, series.options.dp, symbol);

        if (stockChart.lastLabelForCompareSymbols[lineId]) {
            yAxis.removePlotLine(lineId);
        }

        yAxis.addPlotLine(
            {
                'id': lineId,
                'value': pointYValue,
                'color': series.options.lineColor,
                'dashStyle': "shortdash",
                'width': 1,
                'zIndex': 3
            }
        );

        if (!stockChart.lastLabelForCompareSymbols[lineId]) {
            stockChart.lastLabelForCompareSymbols[lineId] = chart.renderer.label(labelTx, null, null, "callout").attr({
                align: "right",
                "zIndex": 20,
                padding: 3,
                r: 1,
                fill: series.options.lineColor
            }).css({
                color: lastLineTheme.label.color,
                "font-size": lastLineTheme.label.fontSize
            }).add();
        }

        var anchorx = (stockChart.settings.config.lastLabelAlign == "right") ? undefined : chart.chartWidth;
        var xPix = (stockChart.settings.config.lastLabelAlign == "right") ? undefined : yAxis.left;

        stockChart._setPositionsForCalloutLabel(stockChart.lastLabelForCompareSymbols[lineId], labelTx, yAxis, yAxis.toPixels(pointYValue), xPix, anchorx);
    }
};

infChart.StockChart.prototype._removeLastLineForCompareSymbol = function (seriesId) {
    var stockChart = this;
    var lineId = stockChart.chartId + "_" + seriesId + "_last";
    stockChart.getMainYAxis().removePlotLine(lineId);
    if (stockChart.lastLabelForCompareSymbols[lineId]) {
        stockChart.lastLabelForCompareSymbols[lineId].destroy();
        delete stockChart.lastLabelForCompareSymbols[lineId];
    }
};

infChart.StockChart.prototype._drawLastLineForCompareSymbols = function () {
    var stockChart = this;
    if (stockChart.compareSymbols.count > 0) {
        for (var seriesId in stockChart.compareSymbols.idMap) {
            if (stockChart.compareSymbols.idMap.hasOwnProperty(seriesId)) {
                stockChart._drawLastLineForCompareSymbol(seriesId);
            }
        }
    }
};

infChart.StockChart.prototype._setPositionsForCalloutLabel = function (label, text, yAxis, yPix, xPix, anchorX) {
    var crossBox = label.getBBox(),
        hchart = this.chart,
        offset = 0,
        halfLineWidth = 0.5,
        yBottom = yAxis.top + yAxis.height - halfLineWidth,
        yTop = yAxis.top - halfLineWidth,
        posx = !isNaN(xPix) ? xPix : yAxis.opposite ? yAxis.width + yAxis.left : 0,
        adjustedY = (yTop > yPix - crossBox.height / 2 && yTop < yPix) ? yTop :
            (yBottom < yPix + crossBox.height / 2 && yBottom > yPix) ? yBottom - crossBox.height : undefined;

    if (!adjustedY && (yPix < yTop || yPix > yBottom)) {
        label.hide()
    } else {
        label.show().attr({
            text: text,
            x: posx,
            y: adjustedY != undefined ? adjustedY : yPix - crossBox.height / 2,
            visibility: 'visible'
        }).toFront();
    }

    //var limit = {
    //    left: yAxis.labelAlign === 'left' ? yAxis.left : 0,
    //    right: yAxis.labelAlign === 'right' ? yAxis.left + yAxis.width + crossBox.height / 4 : hchart.chartWidth
    //};

    // left edge
    //if (label.translateX < limit.left) {
    //    offset = limit.left - label.translateX;
    //}
    //
    //if (label.translateX + crossBox.width >= limit.right) {
    //    offset = -(label.translateX + crossBox.width - limit.right);
    //}

    label.attr({
        x: xPix != undefined ? posx + crossBox.width : posx + hchart.marginRight,
        y: adjustedY != undefined ? adjustedY : yPix - crossBox.height / 2,
        anchorY: yPix,
        showHalfAnchor: adjustedY != undefined,
        anchorX: anchorX ? anchorX : yAxis.opposite ? 0 : hchart.chartWidth
    });

};

infChart.StockChart.prototype._setPositionsForBarClosureLabel = function (label, text, yAxis, yPix, xPix, anchorX) {
    var crossBox = label.getBBox(),
        lastLabel = this.lastLabel,
        hchart = this.chart,
        offset = 0,
        halfLineWidth = 0.5,
        yBottom = yAxis.top + yAxis.height - halfLineWidth,
        yTop = yAxis.top - halfLineWidth,
        posx = !isNaN(xPix) ? xPix : yAxis.opposite ? yAxis.width + yAxis.left : 0,
        adjustedY = (yTop > yPix - crossBox.height / 2 && yTop < yPix) ? yTop :
            (yBottom < yPix + crossBox.height / 2 && yBottom > yPix) ? yBottom - crossBox.height : undefined;

    var lastLabelHeight = 0
    if(lastLabel){
        lastLabelHeight = lastLabel.getBBox().height;
    }

    if (!adjustedY && (yPix < yTop || yPix > yBottom)) {
        label.hide()
    } else {
        label.show().attr({
            text: text,
            x: posx,
            y: adjustedY != undefined ? adjustedY : yPix + lastLabelHeight - crossBox.height / 2,
            visibility: 'visible'
        }).toFront();
    }

    if (label.visibility !== "hidden") {
        label.attr({
            x: xPix != undefined ? posx + crossBox.width : posx + hchart.marginRight,
            y: adjustedY != undefined ? adjustedY : yPix + lastLabelHeight - crossBox.height / 2,
            anchorY: yPix,
            showHalfAnchor: adjustedY != undefined,
            anchorX: anchorX ? anchorX : yAxis.opposite ? 0 : hchart.chartWidth
        });
    }

};

/**
 * Returns the theme for las line
 * @private
 */
infChart.StockChart.prototype._getLastLineTheme = function () {
    return $.extend({
        color: "#505050",
        label: {fontSize: "11px", color: "#000000", fill: "rgba(255,255,255,0.3)"}
    }, Highcharts.theme && Highcharts.theme.lastLine);
};

/**
 * Returns the theme for pre close line
 * @private
 */
infChart.StockChart.prototype._getPreCloseLineTheme = function () {
    return $.extend({
        color: "#505050",
        label: {fontSize: "11px", color: "#000000", fill: "rgba(255,255,255,0.3)"}
    }, Highcharts.theme && Highcharts.theme.preCloseLine);
};

infChart.StockChart.prototype._removeLastLineElements = function () {
    this.getMainYAxis().removePlotLine(this.lastLine);
    if (this.lastLabel) {
        this.lastLabel.destroy();
        this.lastLabel = undefined;
    }
    this.lastLine = undefined;
};

/**
 * remove last line
 */
infChart.StockChart.prototype._removeLastLine = function () {
    this._removeLastLineElements();
    this.hasLastLine = false;
    //if (!fromDrawing) {
    //    this._setYAxisWidth(true);
    //}

};

infChart.StockChart.prototype._removeLastLabel = function(){
    if (this.lastLabel) {
        this.lastLabel.destroy();
        this.lastLabel = undefined;
    }
};

infChart.StockChart.prototype._removeLastPriceLine = function(){
    this.getMainYAxis().removePlotLine(this.lastLine);
    this.lastLine = undefined;
}

///**
// * set last line
// * @Deprecated
// */
//infChart.StockChart.prototype.setLastLine = function (enabled) {
//    if (enabled && !this.hasLastLine) {
//        this._drawLastLine();
//        if (this._isToolbarEnabled()) {
//            infChart.toolbar.setSelectedControls(this.id, 'last', true);
//        }
//    } else if (!enabled && this.hasLastLine) {
//        this._removeLastLine();
//        if (this._isToolbarEnabled()) {
//            infChart.toolbar.setSelectedControls(this.id, 'last', false);
//        }
//    }
//
//};

//endregion

//region =====================previous Close line=======================================================================

//infChart.StockChart.prototype.updatePreviousCloseLine = function (redraw) {
//    if (this.hasPreviousCloseLine) {
//        redraw = (redraw == true) ? true : false;
//        this._enablePreviousCloseLine(redraw);
//    }
//};

/**
 * add last line as a plot line
 */
infChart.StockChart.prototype._enablePreviousCloseLine = function (redraw) {
    var chart = this.chart,
        series = this.getMainSeries(),
        extrems = this.getRange();

    if (!(this.rangeData.data && this.rangeData.data.length) || (this.prevousClose && this.prevousClose.extremes && this.prevousClose.extremes.min == extrems.min && this.prevousClose.extremes.max == extrems.max)) {
        return;
    }
    this.prevousClose.extremes = extrems;
    if (!this.isShortPeriod(this.period) && !this._isIntraday(this.interval)) {
        if (this.processedData && this.processedData.data && this.processedData.data.length > 0) {
            var preCloseDataObj = this.dataManager.getPreviousClose(this.processedData.data),
                pointYValue = preCloseDataObj.value,
                lastValue = this.rangeData.data[preCloseDataObj.idx][4];
            pointYValue = this.getSeriesProcessedValue(series, lastValue);
            this._drawPreviousCloseLine(pointYValue, lastValue, redraw);
        }
    } else {
        var intervalOptions = this.getCurrentIntervalOptions('D'),
            properties = {
                symbol: this.symbol,
                interval: 'D',
                maxPeriod: intervalOptions ? intervalOptions.maxPeriod : undefined,
                regularIntervalsOnUpdate: this.regularIntervalsOnUpdate
            };
        this.setLoading(true);
        this.dataManager.readHistoryData(properties, function (data, properties) {
            var dataList = data.data;
            if (dataList && dataList.length > 0 && this.data && this.data.base && this.data.base.length > 0) {
                var preCloseDataObj = this.dataManager.getPreviousClose(dataList);
                lastValue = preCloseDataObj.value;
                pointYValue = this.getSeriesProcessedValue(series, lastValue);
                this._drawPreviousCloseLine(pointYValue, lastValue, redraw);
            } else {
                this.setLoading(false);
                this.hasPreviousCloseLine = false;
                var containerId = infChart.manager.getContainerIdFromChart(this.chartId);
                infChart.toolbar.setSelectedControls(containerId, "preclose", this.hasPreviousCloseLine);
                /*this.prevousClose = {};*/
            }
        }, this);
    }
    this.hasPreviousCloseLine = true;
};

infChart.StockChart.prototype._drawPreviousCloseLine = function (pointYValue, lastValue, redraw) {
    if (!isNaN(pointYValue) && !isNaN(lastValue)) {

        var redrawYLabels = !this.hasPreviousCloseLine,
            labelTx;

        if (this.hasPreviousCloseLine) {
            this._removePreviousCloseLine(false, true);
        }
        this.prevousClose.extremes = this.getRange();
        var mainSeries = this.getMainSeries(), preCloseTheme = this._getPreCloseLineTheme();
        this.preCloseLine = this.chartId + "_preclose";

        var yAxis = this.getMainYAxis();

        yAxis.addPlotLine(
            {
                /*"label": {
                 text: infChart.manager.getLabel('label.preClose'),
                 y: 10,
                 style: {
                 color: preCloseTheme.color
                 }
                 },*/
                id: this.preCloseLine,
                "value": pointYValue,
                "color": preCloseTheme.color,
                "dashStyle": "shortdash",
                "width": 1,
                "zIndex": 3
            }
        );
        /*this.setThresholdColors(pointYValue, redraw);*/
        labelTx = this.formatValue(lastValue, mainSeries.options.dp, undefined, undefined, undefined, NO_OF_PREVIOUS_PRICE_DECIMAL_POINTS);

        if (!this.preCloseLabel) {
            this.preCloseLabel = this.chart.renderer.label(labelTx, null, null,this.settings.config.previousCloseLabelAlign === "right" ? "rect": "callout").attr({
                align: "right",
                "zIndex": 20,
                padding: 3,
                r: 1,
                fill: preCloseTheme.label.fill
            }).css({
                color: preCloseTheme.label.color,
                "font-size": preCloseTheme.label.fontSize
            }).add();
        }

        var anchorx = (this.settings.config.previousCloseLabelAlign == "right") ? undefined : this.chart.chartWidth;
        var xPix = (this.settings.config.previousCloseLabelAlign == "right") ? undefined : yAxis.left;

        this._setPositionsForCalloutLabel(this.preCloseLabel, labelTx, yAxis, yAxis.toPixels(pointYValue), xPix, anchorx);

        this.hasPreviousCloseLine = true;


        if (this.settings.config.previousCloseLabelAlign === "right") {
            if (!this.hasPreviousCloseLine || this.getMaxLastLabelWidth() > this.getMainYAxis().maxLabelLength) {
                this.getMainYAxis().isDirty = true;
                this.chart.redraw();
            }
        }

        //if (redrawYLabels) {
        //
        //    //this._setYAxisWidth(true);
        //    this._setPositionsForCalloutLabel(this.preCloseLabel, labelTx, yAxis, yAxis.toPixels(pointYValue), xPix, anchorx);
        //
        //}

    }
    this.setLoading(false);
};

infChart.StockChart.prototype._removePreviousCloseLineElements = function () {
    this.getMainYAxis().removePlotLine(this.preCloseLine);
    this.preCloseLine = undefined;
    if (this.preCloseLabel) {
        this.preCloseLabel.hide();
    }
};

/**
 * remove last line
 */
infChart.StockChart.prototype._removePreviousCloseLine = function (redraw, fromDrawing) {
    this._removePreviousCloseLineElements();
    this.hasPreviousCloseLine = false;
    var mainSeries = this.getMainSeries();
    /*if (mainSeries.groupedData) {
     mainSeries.redraw();
     }*/
    if (mainSeries.zones && mainSeries.zones.length > 0 && mainSeries.points) {
        redraw = !!redraw;
        mainSeries.update({zones: []}, false);
        if (redraw) {
            mainSeries.redraw();
        }
    }

    //if (!fromDrawing) {
    //    this._setYAxisWidth(true);
    //}
    this.prevousClose = {};
};

///**
// * set last line
// * @Deprecated
// */
//infChart.StockChart.prototype.setPreviousCloseLine = function (enabled) {
//    if (enabled && !this.hasPreviousCloseLine) {
//        this._enablePreviousCloseLine(true);
//        if (this._isToolbarEnabled()) {
//            infChart.toolbar.setSelectedControls(this.id, 'preclose', true);
//        }
//    } else if (!enabled && this.hasPreviousCloseLine) {
//        this._removePreviousCloseLine(false);
//        if (this._isToolbarEnabled()) {
//            infChart.toolbar.setSelectedControls(this.id, 'preclose', false);
//        }
//    }
//
//};

//endregion

infChart.StockChart.prototype.setThresholdColors = function (threshold, redraw) {
    // var mainSeries = this.chart.get('c0');
    var mainSeries = this.getMainSeries();
    var currentTrend;
    var zones = [];
    redraw = (redraw == true) ? true : false;
    try {
        if ((this.isShortPeriod(this.period) || this._isIntraday(this.interval)) && /*this.hasPreviousCloseLine &&*/ !(mainSeries.zones.length > 0) && (this.type === 'line' || this.type === 'area' || this.type === 'column')) {

            if (mainSeries.zones.length == 0) {
                mainSeries.update({
                    zones: [{
                        value: threshold,
                        color: 'red'
                    }, {
                        color: 'green'
                    }]
                }, false);
                if (redraw) {
                    mainSeries.redraw();
                }
            }
        }
        /* else if (mainSeries.zones.length > 0) {
         mainSeries.update({zones: [{color: mainSeries.color}]}, redraw);

         }*/
    }
    catch (x) {
        infChart.util.console.error(x);
    }
};

//region =====================tooltip===================================================================================

/**
 * Get Values for tooltip of given series for given index
 * @param {number} time time
 * @returns {string}
 */
infChart.StockChart.prototype.getTooltipTime = function (time) {
    var format;
    switch (this.interval) {
        case 'T':
            format = '%d.%m.%Y %H:%M:%S';
            break;
        case 'I_1':
        case 'I_2':
        case 'I_5':
        case 'I_3':
        case 'I_10':
        case 'I_15':
        case 'I_30':
        case 'I_60':
        case 'I_120':
        case 'I_240':
        case 'I_360':
            format = '%d.%m.%Y %H:%M';
            break;
        case 'M':
            format = '%d.%b.%Y';
            break;
        case 'Y':
            format = '%Y';
            break;
        case 'D':
            format = '%d.%m.%Y %H:%M';
            break;
        default:
            format = '%d.%m.%Y';
            break;
    }
    return infChart.util.formatDate(time, format);
};

/**
 * @typedef {Object} tooltipData
 * @property {string} [label]
 * @property {string} [color]
 * @property {object} raw
 * @property {object} formatted
 * @property {array<string>} [displayItems] - we show only these
 */

/**
 * get tooltip value
 * @param point
 * @param isBase
 * @returns {tooltipData}
 */
infChart.StockChart.prototype.getTooltipValue = function (point, isBase) {
    var dp = point.series.options.dp, index = point.index, data, tooltipData = {}, formattedTooltipData = {}, displayItems = [],
        cropStart = point.series.cropStart,
        startData,
        grpVolIdx,
        compSym = !isBase && point && point.series && point.series.options && this.getCompareSymbolFromSeriesId(point.series.options.id);

    if (isBase) {
        if (point.series.groupedData && point.series.options.dataGrouping && point.series.options.dataGrouping.enabled) {
            data = point.series.groupedData[index];
            grpVolIdx = this.getGroupedVolumeIndex(point, this.rangeData.data);
            var dataR = this.rangeData.data[grpVolIdx];
            var hasData = false;
            if (dataR) {
                hasData = true;
                tooltipData.time = dataR[0];
                tooltipData.close = dataR[4];
                tooltipData.open = dataR[1];
                tooltipData.high = dataR[2];
                tooltipData.low = dataR[3];
            } else if (data.xPoint) {
                hasData = true;
                tooltipData.close = this.getYLabel(data.xPoint.close, false, true, true);
                tooltipData.open = this.getYLabel(data.xPoint.open, false, true, true);
                tooltipData.high = this.getYLabel(data.xPoint.high, false, true, true);
                tooltipData.low = this.getYLabel(data.xPoint.low, false, true, true);
            } else if (data.close == undefined) {
                if (dataR) {
                    hasData = true;
                    tooltipData.time = dataR[0];
                    tooltipData.close = dataR[4];
                    tooltipData.open = dataR[1];
                    tooltipData.high = dataR[2];
                    tooltipData.low = dataR[3];
                }
            } else {
                hasData = true;
                tooltipData.close = this.getYLabel(data.close, false, true, true);
                tooltipData.open = this.getYLabel(data.open, false, true, true);
                tooltipData.high = this.getYLabel(data.high, false, true, true);
                tooltipData.low = this.getYLabel(data.low, false, true, true);
            }

            if (hasData) {
                tooltipData.volume = dataR ? dataR[5] : undefined;

                if (this.isCompare) {
                    tooltipData.pchg = point.change;
                    formattedTooltipData.pchg = this.formatValue(tooltipData.pchg, dp);
                } else /*if (this.interval !== 'T')*/ {
                    formattedTooltipData.high = this.formatValue(tooltipData.high, dp);
                    formattedTooltipData.low = this.formatValue(tooltipData.low, dp);
                    formattedTooltipData.open = this.formatValue(tooltipData.open, dp);
                    displayItems.xPush('open');
                    displayItems.xPush('high');
                    displayItems.xPush('low');
                }
            }
        } else {
            data = this.rangeData.data[index];
            startData = this.rangeData.data[cropStart];
            if (point.xPoint) {
                data = $.extend([], data, [data[0], point.xPoint.open, point.xPoint.high, point.xPoint.low, point.xPoint.close, data[5]]);
                tooltipData.close = this.getYLabel(point.xPoint.close, false, true, true);
                tooltipData.open = this.getYLabel(point.xPoint.open, false, true, true);
                tooltipData.high = this.getYLabel(point.xPoint.high, false, true, true);
                tooltipData.low = this.getYLabel(point.xPoint.low, false, true, true);
            } else if (data) {
                tooltipData.close = data[4];
                tooltipData.open = data[1];
                tooltipData.high = data[2];
                tooltipData.low = data[3];
            }

            if (this.isCompare) {
                tooltipData.pchg = point.change;
                tooltipData.chg = startData && (tooltipData.close - startData[4]);
                //formattedTooltipData.pchg = this.formatValue(point.y, dp);
            } else if (!(this.interval === 'T' && tooltipData.open == tooltipData.close && data && data[2] == data[3] && tooltipData.open == data[2])) {
                formattedTooltipData.high = tooltipData.high ? this.formatValue(tooltipData.high, dp, undefined, undefined, undefined, NO_OF_SPECIFIC_DECIMAL_POINTS) : '--';
                formattedTooltipData.low = tooltipData.low ? this.formatValue(tooltipData.low, dp, undefined, undefined, undefined, NO_OF_SPECIFIC_DECIMAL_POINTS) : '--';
                formattedTooltipData.open = tooltipData.open ? this.formatValue(tooltipData.open, dp, undefined, undefined, undefined, NO_OF_SPECIFIC_DECIMAL_POINTS) : '--';
                displayItems.xPush('open');
                displayItems.xPush('high');
                displayItems.xPush('low');
            }
            tooltipData.volume = data && data[5];

            if (this.bidAskHistory && data) {
                tooltipData.bidAskHistory = {
                    bidLast: data[6],
                    askLast: data[7],
                    askHigh: data[8],
                    bidLow: data[9]
                };

                formattedTooltipData.bidAskHistory = {
                    bidLast: data[6] ? this.formatValue(data[6], dp) : '--',
                    askLast: data[7] ? this.formatValue(data[7], dp) : '--',
                    askHigh: data[8] ? this.formatValue(data[8], dp) : '--',
                    bidLow: data[9] ? this.formatValue(data[9], dp) : '--'
                }
            } else {
                tooltipData.bidAskHistory = null;
            }

            displayItems.xPush('bidAskHistory');
        }
    } else {

        if (point.series.groupedData && point.series.options.dataGrouping && point.series.options.dataGrouping.enabled) {
            var compareSeries = this.rangeData.compareData[point.series.options.id];
            var compareIndx = this.getGroupedVolumeIndex(point, compareSeries);
            if (compareSeries[compareIndx]) {
                var compYVal = (compareIndx == 0) ? 0 : point.change;
                tooltipData.volume = compareSeries[compareIndx][5];
                tooltipData.close = compareSeries[compareIndx][4];
                tooltipData.open = compareSeries[compareIndx][1];
                tooltipData.pchg = compYVal;
                formattedTooltipData.pchg = this.formatValue(tooltipData.pchg, dp, compSym);
            }
        } else {
            data = this.rangeData.compareData[point.series.options.id][index];
            startData = this.rangeData.compareData[point.series.options.id][cropStart];
            if (data) {
                tooltipData.volume = data[5];
                tooltipData.close = data[4];
                tooltipData.open = data[1];
            }
            tooltipData.pchg = point.change;
            tooltipData.chg = startData && (tooltipData.close - startData[4]);
            formattedTooltipData.pchg = this.formatValue(tooltipData.pchg, dp, compSym);
            formattedTooltipData.chg = this.formatValue(tooltipData.chg, dp, compSym);
        }
    }

    if (typeof tooltipData.close !== 'undefined') {
        formattedTooltipData.close = tooltipData.close ? this.formatValue(tooltipData.close, dp, compSym, undefined, undefined, NO_OF_SPECIFIC_DECIMAL_POINTS) : '--';
        displayItems.xPush('close');
    }

    if (typeof tooltipData.volume !== 'undefined') {
        formattedTooltipData.volume = this.formatVolume(tooltipData.volume, compSym);
        displayItems.xPush('volume');
    }

    var time;

    if (grpVolIdx && grpVolIdx >= 0 && this.rangeData.data[grpVolIdx]) {
        time = this.rangeData.data[grpVolIdx][0];
    } else {
        time = point.x;
    }

    this.ttgrpVolIdx = grpVolIdx;
    this.ttTime = time;

    tooltipData.time = time;
    formattedTooltipData.time = this.getTooltipTime(time);
    if (isBase) {
        displayItems.xPush('time');
    }

    return {
        'raw': tooltipData,
        'formatted': formattedTooltipData,
        'color': point.series.color,
        'label': point.series.name,
        'displayItems': displayItems
    };
};

/**
 * Get Values for tooltip of given series for given index
 * @param point tooltip point
 * @returns {tooltipData}
 */
infChart.StockChart.prototype.getIndicatorTooltipValue = function (point) {
    var tooltipData, indicator = infChart.indicatorMgr.getIndicatorBySeriesId(this.id, point.series.options.id);
    if (indicator) {
        if (point.series.groupedData && point.series.options.dataGrouping && point.series.options.dataGrouping.enabled) {
            var grpVolIdx = this.getGroupedVolumeIndex(point, point.series.options.data);
            tooltipData = indicator.getTooltipValueByBaseRow(point, point.series.options.data[grpVolIdx], grpVolIdx);
        } else {
            tooltipData = indicator.getTooltipValue(point);
        }
    }

    return tooltipData;
};

infChart.StockChart.prototype.getGroupedVolumeIndex = function (point, actualValues) {

    var corpStart = point.series && point.series.cropStart || 0,
        startIdx = point.dataGroup.start + corpStart,
        volume,
        i;

    if (point.dataGroup) {

        for (i = startIdx; i < (startIdx + point.dataGroup.length); i++) {
            if (actualValues[i][0] == point.x) {
                volume = i;
                break;
            }
            else if (actualValues[i][0] > point.x) {
                volume = Math.max(0, point.dataGroup.start, i - 1);
                break;
            }
        }
    }
    return volume;
};

infChart.StockChart.prototype.getOHLCfromPoint = function (point) {
    var series = point.series;

    if (series) {
        var seriesOptions = series.options,
            isBase = (seriesOptions.infType !== 'compare' && seriesOptions.infType !== 'indicator'),
            index = point.index, dataPoint = {}, gropedDataPoint;

        if (isBase) {
            if (series.groupedData && seriesOptions.dataGrouping && seriesOptions.dataGrouping.enabled) {
                gropedDataPoint = point;//.series.groupedData[index];
                var j,
                    row,
                    startMapIdx,
                    stopMapIdx,
                    corpStart = series && series.cropStart || 0,
                    pointGroup = gropedDataPoint.dataGroup,
                    groupStart = pointGroup.start + corpStart,
                    dataR = this.rangeData.data[this.getGroupedVolumeIndex(point, this.rangeData.data)];

                if (gropedDataPoint.close == undefined || this.isCompare) {

                    if (pointGroup) {

                        if (dataR) {

                            dataPoint.close = dataR[4];
                            dataPoint.open = dataR[1];
                            dataPoint.high = dataR[2];
                            dataPoint.low = dataR[3];

                        } else {

                            dataPoint.close = this.getYLabel(gropedDataPoint.y, false, true, true);
                            dataPoint.open = this.getYLabel(gropedDataPoint.y, false, true, true);
                            dataPoint.high = 0;
                            dataPoint.low = this.getYLabel(gropedDataPoint.y, false, true, true);
                        }

                        if (this.rangeData.data[groupStart]) {

                            startMapIdx = groupStart;
                            stopMapIdx = groupStart + pointGroup.length - 1;
                        }
                    }
                    if (startMapIdx != undefined && stopMapIdx != undefined) {

                        for (j = startMapIdx; j <= stopMapIdx && j < this.rangeData.data.length; j++) {

                            row = this.rangeData.data[j];

                            if (row[2] > dataPoint.high) {
                                dataPoint.high = row[2];
                            }

                            if (row[3] < dataPoint.low) {
                                dataPoint.low = row[3];
                            }
                        }
                    }
                } else {

                    dataPoint.close = this.getYLabel(gropedDataPoint.close, false, true, true);
                    dataPoint.open = this.getYLabel(gropedDataPoint.open, false, true, true);
                    dataPoint.high = this.getYLabel(gropedDataPoint.high, false, true, true);
                    dataPoint.low = this.getYLabel(gropedDataPoint.low, false, true, true);
                }

            } else {

                gropedDataPoint = this.rangeData.data[index];
                dataPoint.close = gropedDataPoint[4];
                dataPoint.open = gropedDataPoint[1];
                dataPoint.high = gropedDataPoint[2];
                dataPoint.low = gropedDataPoint[3];

            }
        } else {
            // TODO : for compare
        }
        return dataPoint;
    }
};

/**
 * update tooltip of given series
 * @param seriesId
 * @param x
 */
infChart.StockChart.prototype.updateToolTip = function (seriesId, x) {
    var chart = this.chart;
    var series = chart.get(seriesId);

    switch (series.options.infType) {
        case "indicator":
            if (!infChart.util.isSeriesInBaseAxis(series.options.yAxis) && !infChart.util.isSeriesParallelToBaseAxis(chart.get(series.options.yAxis))) {
                infChart.indicatorMgr.getIndicatorBySeriesId(this.id, seriesId).updateToolTip(seriesId, x);
            }
            break;
        default:
            break;
    }
};

/**
 * Show/hide chart tooltip
 * @returns {boolean|*}
 * @Deprecated
 */
infChart.StockChart.prototype.setTooltip = function (enabled) {
    if (enabled && !this.tooltip) {
        this.toggleToolTip();
        if (this._isToolbarEnabled()) {
            infChart.toolbar.setSelectedControls(this.id, 'tooltip', true);
        }
    } else if (!enabled && this.tooltip) {
        this.toggleToolTip();
        if (this._isToolbarEnabled()) {
            infChart.toolbar.setSelectedControls(this.id, 'tooltip', false);
        }
    }
};

/**
 * updating tootip to last value
 * @param force
 */
infChart.StockChart.prototype.updateTooltipToLastPoint = function (force, isReApply) {
    var self = this;

    if (self.tooltip && ((self.chart && !self.chart.infMouseIn) || force)) {

        var mainSeries = self.getMainSeries(),
            lastPoint = mainSeries && mainSeries.points && mainSeries.points.length > 0 && mainSeries.points[mainSeries.points.length - 1],
            tooltipObj = lastPoint && infChart.manager.getTooltipValue({point: lastPoint, x: lastPoint.x});

        if (tooltipObj) {

            var tooltipHtml = infChart.manager.getTooltipHTML(tooltipObj);

            infChart.structureManager.legend.updateSymbolDataInLegend($(infChart.structureManager.getContainer(self.getContainer(), 'chart_top')), tooltipHtml.baseHTML, tooltipHtml.compareSymHTML);
            self._fireRegisteredMethod('updateTooltipToLastPoint', [tooltipObj]);

            if (!isReApply && !self.selfListeners['updateTooltipToLastPoint_onReApplyFormatters']) {
                var lsnIdx = self.registerForEvents('onReApplyFormatters', self.updateTooltipToLastPoint, [true, true]);
                self.selfListeners['updateTooltipToLastPoint_onReApplyFormatters'] = {
                    id: lsnIdx,
                    method: 'onReApplyFormatters'
                };
            }
        }
    }
};

infChart.StockChart.prototype.unRegisterLastPointTooltipEvents = function () {
    var self = this,
        listener = self.selfListeners['updateTooltipToLastPoint_onReApplyFormatters'];

    if (listener) {
        self.removeRegisteredEvent(listener.method, listener.id);
        delete self.selfListeners['updateTooltipToLastPoint_onReApplyFormatters'];
    }
};

/**
 * Returns the last point of the base series
 */
infChart.StockChart.prototype.getLastPoint = function () {
    var self = this,
        mainSeries = self.getMainSeries(),
        lastPoint = mainSeries && mainSeries.points && mainSeries.points.length > 0 && mainSeries.points[mainSeries.points.length - 1];
    return lastPoint;

};

//endregion ===================== end of tooltip========================================================================

//region =====================legend====================================================================================

infChart.StockChart.prototype.getLegendTitle = function (series) {
    var title;
    if (series.options.infType === 'indicator') {
        title = infChart.indicatorMgr.getLegendTitle(this.id, series);
    } else {
        title = series.options.infLegendLabel;
    }
    return title;
};

//endregion

//region ========================== Axis ===============================================================================

//region ++++++++++++++++++++++++++ Axis value converters+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

/**
 * Return y axis label for given actual y Value
 * @param yValue
 * @param axis
 * @param isAxisLabel
 * @param isValue
 * @returns {*}
 */
infChart.StockChart.prototype.getYLabel = function (yValue, isAxisLabel, isBaseValue, isValue) {
    var mainSeries = this.getMainSeries(),
        rangeData = this.rangeData && this.rangeData.data,
        retVal,
        baseInitVal,
        yLabel,
        baseValueCropStart,
        processedValueCropEnd,
        baseValueCropEnd;

    if (rangeData.length > 0) {
        if (this.isLog) {
            retVal = this._log2Num(yValue);
        } else if (this.isCompare) {
            var compareValue = this.getSeriesCompareValue(mainSeries);
            if (this.isPercent && isBaseValue) {
                retVal = (yValue / 100 + 1) * compareValue;
            } else {
                retVal = yValue;
            }
        } else if (this.isPercent) {
            if (isBaseValue) {
                retVal = yValue;
            } else {
                baseInitVal = this._getInitialValue(rangeData, 4);
                baseInitVal = baseInitVal && baseInitVal[4];
                // baseValueCropStart = mainSeries.cropStart ? mainSeries.compareValue : baseInitVal;
                processedValueCropEnd = yValue;// - (mSeriesCompareValue || 0),
                retVal = ((processedValueCropEnd / baseInitVal) - 1) * 100;
            }
        } else {
            retVal = yValue;
        }
    } else {
        retVal = yValue;
    }

    if (isNaN(retVal)) {
        return '';
    }

    if (isValue) {
        yLabel = retVal;
    } else {
        yLabel = this.formatYValue(retVal, (this.isPercent && !isBaseValue), isAxisLabel);
    }

    return yLabel;
};

/**
 * Returns whether numeric symbol should be shown for the given value
 * @param retVal
 * @private
 */
infChart.StockChart.prototype._useNumericSymbol = function (retVal) {
    return !this.disableNumericSymbols && !this.temperoryDisableNumericSymbols && (retVal >= 10000 || this.useNumericSymbolsAlways);
};

infChart.StockChart.prototype.formatYValue = function (retVal, isPercent, isAxisLabel, dp) {
    var retArr, intVal,
        iChart = this,
        formatValue = function (retVal1, useNumericSym, isAxisLabel, customDP) {
            var decimalPlaces;
            if (!useNumericSym) {
                decimalPlaces = (customDP != undefined) ? customDP : iChart.decimalDigits;
            } else {
                decimalPlaces = (customDP != undefined) ? customDP : 0;
            }

            if (decimalPlaces >= 0) {
                if (retVal1.toString().indexOf("e") >= 0) {
                    var ex = retVal1.toString().split("e")[1];
                    if (parseInt(ex) < 0 && Math.abs(parseInt(ex)) > decimalPlaces) {
                        retVal1 = 0;
                    }
                }
                if (typeof isAxisLabel !== 'undefined' && !isAxisLabel) {
                    retVal1 = infChart.util.formatNumber(retVal1, (decimalPlaces + 1));
                } else {
                    retVal1 = infChart.util.formatNumber(retVal1, decimalPlaces);
                }
            }
            return retVal1;
        };

    if (this._useNumericSymbol(retVal)) {
        var numericSymbols = ['k', 'M', 'G', 'T', 'P', 'E'],
            hasNumeric = false;
        // Decide whether we should add a numeric symbol like k (thousands) or M (millions).
        // If we are to enable this in tooltip or other places as well, we can move this
        // logic to the numberFormatter and enable it by a parameter.
        var i = numericSymbols.length, ret, multi;
        while (i-- && ret === undefined) {
            multi = Math.pow(1000, i + 1);
            if (/*numericSymbolDetector >= multi &&*/ (retVal) / multi > 1 && numericSymbols[i] !== null) {
                ret = retVal / multi;
                /* dp = ret<100?4 : 0;*/
                ret = infChart.util.formatNumber(ret, this.decimalDigits);
                //ret = infChart.util.formatNumber(ret);
                /*retArr = ret.split('.');*/

                /*if (retArr.length > 1) {
                 intVal = parseInt(retArr[1]);
                 if (intVal > 0) {
                 ret = ret.replace(/[0]+$/, '');
                 } else {
                 ret = retArr[0];
                 }
                 }*/
                ret = ret + numericSymbols[i];
                hasNumeric = true;
            }
        }

        if (!hasNumeric) {
            ret = formatValue(retVal, this.useNumericSymbols);
        }

    } else {
        ret = formatValue(retVal, this.useNumericSymbols, isAxisLabel, dp);
    }

    var postFix = (isPercent) ? '%' : '';

    ret = (ret == undefined) ? retVal : ret;
    /* var retNumArr = ret.toString().split('.');
     if (retNumArr.length > 1 && !this.useNumericSymbolsAlways && this.decimalDigits>1) {
     ret = ret.replace(/.[0]+$/, '');
     //ret = retNumArr[0]+'.'+ parseFloat(retNumArr[1]);
     }*/
    // retNumArr[1].replace(/^0+|0+$/g, "");
    // yLabel = (infChart.util.formatNumber(retVal, dp, '.', infChart.util.getThousandSeparator()) + postFix);
    var yLabel = (ret + postFix);
    return yLabel;
};

infChart.StockChart.prototype.getBaseValue = function (yValue, isLog, isCompare, isPercent) {
    return this.getSeriesBaseValue(this.getMainSeries(), yValue, isLog, isCompare, isPercent);
};

infChart.StockChart.prototype.getSeriesBaseValue = function (series, yValue, isLog, isCompare, isPercent) {

    var retVal,
        baseInitRow = this._getInitialValue(this.rangeData.data, 4),
        baseInitVal = baseInitRow && baseInitRow[4];
    if (isLog) {

        /*if (isCompare) {
         if (baseInitVal == 0 || baseInitVal) {
         retVal = (this._log2Num(((yValue + series.compareValue) / 100 + 1) * this._num2Log(baseInitVal)));
         }
         } else {*/
        retVal = this._log2Num(yValue);
        //}
    } else if (isCompare) {
        var compareValue = this.getSeriesCompareValue(series);
        if (isPercent && compareValue) {
            retVal = (yValue / 100 + 1) * compareValue;
        } else {
            retVal = yValue;
        }
        //return '';
    } else /*if (isPercent) {
     retVal = baseInitVal && ((yValue * baseInitVal / 100) + baseInitVal);
     } else*/ {
        retVal = yValue;
    }

    return retVal;
};

infChart.StockChart.prototype.getsBaseValueFromProcessedValue = function (yValue) {

    var retVal;
    if (this.isLog) {
        retVal = this._log2Num(yValue);
    } else {
        retVal = yValue;
    }

    return retVal;
};

/**
 * Returns the Base min/max values and relavant properties
 * @param yAxis
 * @param yMin
 * @param yMax
 * @returns {{maxVal: *, minVal: *, baseInitVal: *, baseRangeFirst: *}}
 * @private
 */
infChart.StockChart.prototype.getYMinMaxBaseValue = function (yAxis, yMin, yMax) {
    var mainSeries = this.getMainSeries(),
        maxVal,
        minVal,
        baseRangeFirst,
        rangeData = this.rangeData.data,
        mSeriesCompareValue = this.getSeriesCompareValue(mainSeries),
        baseInitRow = this._getInitialValue(rangeData, 4),
        baseInitVal = baseInitRow && baseInitRow[4];

    yMin = !isNaN(yMin) ? yMin : yAxis.min;
    yMax = !isNaN(yMax) ? yMax : yAxis.max;

    if (rangeData.length > 0 && (this.isLog || this.isCompare)) {

        if (this.isLog) {

            if (this.isCompare && this.isPercent) {

                maxVal = this._log2Num((yMax / 100 + 1) * mSeriesCompareValue);
                minVal = this._log2Num((yMin / 100 + 1) * mSeriesCompareValue);

            } else {
                maxVal = this._log2Num(yMax);
                minVal = this._log2Num(yMin);
            }

        } else if (this.isCompare) {

            maxVal = yMax;
            minVal = yMin;
        }
    } else {
        if (this.isPercent) {
            maxVal = ((yMax / mSeriesCompareValue) - 1) * 100;
            minVal = ((yMin / mSeriesCompareValue) - 1) * 100;
        } else {
            maxVal = yMax;
            minVal = yMin;
        }

    }

    return {
        maxVal: Math.max(maxVal || minVal),
        minVal: Math.min(minVal || maxVal),
        baseInitVal: baseInitVal,
        baseRangeFirst: baseRangeFirst
    }
};


/**
 * Returns the processed value (which is sending to highcharts) of the given display value
 * @param series
 * @param val
 * @returns {number}
 */
infChart.StockChart.prototype.getProcessedValueFromDisplayValue = function (series, val) {

    var returnVal;
    if (this.isLog) {

        returnVal = this._num2Log(val);

    } else if (!this.isCompare && this.isPercent) {

        var mainSeries = this.getMainSeries(),
            mSeriesCompareValue = this.getSeriesCompareValue(mainSeries),
            rangeData = this.rangeData && this.rangeData.data,
            baseInitValRow = rangeData && this._getInitialValue(rangeData, 4),
            baseInitVal = baseInitValRow && baseInitValRow[4],
            baseValueCropStart = mSeriesCompareValue || baseInitVal;

        returnVal = baseValueCropStart ? ((val / 100) + 1) * baseValueCropStart : undefined;
    }
    // TODO :: need to implement for 'isCompare' if used for comparison mode
    return returnVal;
};
/**
 * Returns the processed value (which is sending to highcharts) of the given base value
 * @param series
 * @param val
 * @returns {number}
 */
infChart.StockChart.prototype.getProcessedValue = function (series, val) {

    var returnVal = 0;
    /*, initialClose;
     if (series.options.infType == 'compare') {
     var symbol = series.options.id.slice(2, series.options.id.length),
     baseInitRow = this._getInitialValue(this.rangeData.compareData[symbol], 4);
     initialClose = baseInitRow && baseInitRow[4];
     }
     else if (series.options.infType == "base") {
     baseInitRow = this._getInitialValue(this.rangeData.data, 4);
     initialClose = baseInitRow && baseInitRow[4];
     }
     else {
     return;
     }*/
    /*if (this.isPercent) {

     returnVal = (val / initialClose - 1) * 100;

     }
     else*/
    if (this.isLog) {

        returnVal = this._num2Log(val);
    } else {
        returnVal = val;
    }
    return returnVal;
};

/**
 * Returns the highcharts' yAxis value of the given base value
 * @param series series refered to the value
 * @param val base value
 */

//endregion ++++++++++++++++++++++++++ Axis value converters++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

/**
 * Set decimal digits from settings if specified
 * @param axis
 * @private
 */
infChart.StockChart.prototype._setMinYDecimalPlaces = function (axis) {

    var minYDecimalPlaces = this.settings.config.minYDecimalPlaces;

    if (minYDecimalPlaces != undefined) {

        this.decimalDigits = Math.max((
            minYDecimalPlaces == 'symbol' ? (this.symbol && this.symbol.dp) || (!this.symbol && this.settings.config.defaultDp) : minYDecimalPlaces
        ), this.decimalDigits);
    }
};

///**
// * Change yAxis width according to the label widths when redrawing chart
// * @param axis
// * @private
// */
//infChart.StockChart.prototype.setYAxisWidthOnRedraw = function (axis) {
//
//    if (axis.options.id != '#1') {
//        return;
//    }
//
//    var maxLength = 0, tickPositions = axis.tickPositions.length;
//
//    if (tickPositions > 0) {
//
//        //infChart.util.forEach(axis.ticks, function (k, val) {
//        //    if (maxLength < val.labelLength) {
//        //        maxLength = val.labelLength;
//        //        maxTickPositions = val.label.textStr && val.label.textStr.length;
//        //    }
//        //});
//        //
//        //maxLength = Math.ceil(maxLength) + 6;
//        //
//        //infChart.util.forEach(this.chart.axes, function (i, e) {
//        //
//        //    if (!e.isXAxis && e.options.labels.x != maxLength) {
//        //        if (!maxTickPositions || !e.infMaxLabelSize || maxTickPositions == e.infMaxLabelSize) {
//        //            e.infMaxLabelSize = maxTickPositions;
//        //            e.isDirty = true;
//        //        }
//        //        e.options.labels.x = maxLength;
//        //    }
//        //    /* e.right = maxLength+26 ; showFirstLabel*/
//        //});
//
//        //add 2 to increase space between last number and the margin.
//        maxLength = Math.ceil(axis.maxLabelLength) + (axis.options.labels.x + 2);
//
//        if ((this.lastLabel && this.hasLastLine) || (this.hasPreviousCloseLine && this.preCloseLabel)) {
//
//            var maxWidth = Math.max((this.hasLastLine && this.settings.config.lastLabelAlign == "right" ? this.lastLabel.width : 0), (this.hasPreviousCloseLine && this.settings.config.previousCloseLabelAlign == "right" ? this.preCloseLabel.width : 0));
//            maxLength = (maxLength > maxWidth) ? maxLength : maxWidth;
//        }
//        this.chart.margin[1] = maxLength;
//        this.chart.marginRight = maxLength;
//
//        //this.chart.margin[1] = maxLength + 3;
//        //axis.options.offset = -1*(maxLength + 3);
//        //this.chart.options.marginRight =  maxLength + 3;
//        //this.chart.marginRight = maxLength + 3;
//        /*this.chart.update({
//         chart: {
//         marginRight: maxLength + 3
//         }
//         }, false);
//
//         if (redraw) {
//         this.chart.redraw();
//         }*/
//    }
//};

///**
// * Change yAxis width according to the label widths forcefully
// * @param redraw
// * @private
// */
//infChart.StockChart.prototype._setYAxisWidth = function (redraw) {
//
//    var hchart = this.chart,
//        axis = hchart.get("#1");
//
//    if (axis && axis.ticks) {
//
//        var prevMargin = hchart.marginRight;
//
//        this._setYAxisWidthOnRedraw(hchart.get("#1"));
//
//        if (prevMargin != hchart.marginRight) {
//
//            hchart.update({
//                chart: {
//                    marginRight: hchart.marginRight
//                }
//            }, false);
//
//            if (redraw) {
//                hchart.redraw();
//            }
//        }
//    }
//};

/**
 * Method to update y Axis configs
 * @param yAxis
 * @param config
 * @param redraw
 */
infChart.StockChart.prototype.updateYAxis = function (yAxis, config, redraw) {
    //config.labels = {x: yAxis.options.labels.x};
    yAxis.update(config, redraw);
};

infChart.StockChart.prototype._getXAxisLabelFormat = function (axisFormats, tickValue, prevTickValue, isFirst) {

    var tickDate = new Date(tickValue),
        tickMonth = tickDate.getUTCMonth(),
        prevTickDate = new Date(prevTickValue),
        prevTickMonth = prevTickDate.getUTCMonth(),
        labelFormat;

    if (this.period == "M_1" && this.interval == "D") {

        labelFormat = "%e";

        if (isFirst) {

            labelFormat = " " + axisFormats.month;

        } else if (tickMonth != prevTickMonth) {

            labelFormat = (tickDate.getUTCFullYear() != prevTickDate.getUTCFullYear()) ? "%Y" : "%b";
        }
    }
    return labelFormat;
};

/**
 * Return the x axis labels
 */
infChart.StockChart.prototype.getXAxisLabel = function (label) {

    var tickValue = label.value,
        axis = label.axis,
        axisOptions = axis.options,
        axisFormats = axisOptions.dateTimeLabelFormats,
        labelFormat = label.dateTimeLabelFormat;

    if (axisFormats && labelFormat == axisFormats.month && this.interval != 'M') {
        // To avoid displaying only month in non-month intervals
        labelFormat = axisFormats.day;

    } else if (!labelFormat && this.period == "M_1" && this.interval == "D") {
        var tickPositions = axis.tickPositions,
            tickIndex = tickPositions.indexOf(tickValue);

        labelFormat = this._getXAxisLabelFormat(axisFormats, tickValue, tickPositions[tickIndex - 1], label.isFirst);
    }

    return infChart.util.formatDate(tickValue, labelFormat);
};

/**
 * Return the y axis labels
 */
infChart.StockChart.prototype.getYAxisLabel = function (labelObj, isAxis) {

    var value = labelObj.value;

    if (isAxis) {

        var axisId = labelObj.axis && labelObj.axis.options && labelObj.axis.options.id,
            mainYAxis = this.getMainYAxis();

        if (axisId === mainYAxis.options.id) {
            return this.getYLabel(value, isAxis);
        } else {
            return value;
        }
    } else {
        return this.getYLabel(value, isAxis);
    }

};

/**
 * final check after rendering the axis labels goes here.
 * For xAxis, remove the first label if it crops
 * @param axis
 */
infChart.StockChart.prototype.afterRenderAxisLabels = function (axis) {

    /**
     *
     * For fixing issue of cropping first and last x labels checked the positions of first and last values after rendering
     * and hide those label if cropped and show all hidden labels before this logic.
     *
     * TODO ::  Need to find out a proper solution for this. Followings are the failed attempts
     * 1. Changing the positions of the cropping label - label position didn't changed
     * 2. Hide over flown labels and just showing all the labels(without keeping previous position as xPositions) before hiding cropped labels
     * - if label is previously hidden its position was (0,0) so it didn't appear in the x axis
     * 3. Set textOverflow as hidden - it didn't hide the label
     *
     * After all above failed attempts previous position of hidden labels are kept in xPosition of the tick and set those positions when showing them again.
     * IMPORTANT :: Issue(2.) of hiding labels forever happens only in zoomed charts
     */

    for (var i in axis.ticks) {
        var lbl = axis.ticks[i];
        if (lbl.xPosition) {
            lbl.label.element.style.x = lbl.xPosition.x;
            lbl.label.element.style.y = lbl.xPosition.y;
            lbl.label.show();
            lbl.xPosition = undefined;
            lbl.gridLine && lbl.gridLine.show();
        }
    }
    var tickPositions = axis.tickPositions,
        ticks = axis.ticks,
        firstLabelTime = tickPositions && tickPositions[0],
        firstTick = ticks && ticks[firstLabelTime] && ticks[firstLabelTime],
        firstTickPos = axis.toPixels(firstLabelTime),
        firstLabelSize = firstTick && firstTick.label && firstTick.label.getBBox(),
        lastLabelTime = tickPositions && tickPositions[tickPositions.length - 1],
        lastTickPos = axis.toPixels(lastLabelTime),
        lastTick = ticks && ticks[lastLabelTime] && ticks[lastLabelTime],
        lastLabelSize = lastTick && lastTick.label && lastTick.label.getBBox();

    if (axis.isXAxis) {


        var firstLabelX = firstLabelSize && (axis.labelAlign === 'center' ? firstTickPos - firstLabelSize.width / 2 :
                    axis.labelAlign === 'left' ? firstTickPos - firstLabelSize.width : firstTickPos),
            lastLabelX = lastLabelSize && (axis.labelAlign === 'center' ? lastTickPos - lastLabelSize.width / 2 :
                    axis.labelAlign === 'left' ? lastTickPos - lastLabelSize.width :
                        lastTickPos),
            labelPos;

        // Remove the first label if it crops
        if (firstTick && firstLabelX < axis.left) {

            labelPos = firstTick.label.getBBox();
            firstTick.xPosition = {
                x: labelPos.x,
                y: labelPos.y
            };

            firstTick.label && firstTick.label.hide();

        }

        // Remove the last label if it crops
        if (lastTick && lastLabelX != null && !isNaN(lastLabelX) && (lastLabelX + lastLabelSize.width) > (axis.left + axis.width)) {

            labelPos = lastTick.label.getBBox();
            lastTick.xPosition = {
                x: labelPos.x,
                y: labelPos.y
            };
            lastTick.label && lastTick.label.hide();
        }
    } else if (tickPositions.length > 1) {
        var lastLabelY = lastLabelSize && (lastTickPos - lastLabelSize.height / 2),
            firstHidden = false,
            labelY = axis.options.labels && axis.options.labels.y || 0;

        // Remove the first label if it crops
        if (firstTick && firstTick.label && firstTickPos != null && !isNaN(firstTickPos) && (firstTickPos + labelY) > axis.top + axis.height) {

            labelPos = firstTick.label.getBBox();
            firstTick.xPosition = {
                x: labelPos.x,
                y: labelPos.y
            };

            firstTick.label && firstTick.label.hide();
            firstTick.gridLine && firstTick.gridLine.hide();
            firstHidden = true;
        }

        // Remove the last label if it crops
        if ((tickPositions.length > 2 || !firstHidden) && lastTick && lastTick.label && lastLabelY < axis.top) {

            labelPos = lastTick.label.getBBox();
            lastTick.xPosition = {
                x: labelPos.x,
                y: labelPos.y
            };
            lastTick.label && lastTick.label.hide();
            lastTick.gridLine && lastTick.gridLine.hide();
        }
    }
};

//region +++++++++++++++++++++Grid Lines++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

/**
 * Set pixel interval for the normal axis (!log || !compare)
 * @param axis
 */
infChart.StockChart.prototype.setAxisPixelInterval = function (axis) {
    var iChart = this,
        mainYAxis = this.getMainYAxis();
    if (!axis.isXAxis && mainYAxis && axis.options.id == mainYAxis.options.id) {

        if (this.isLog || this.isCompare || this.isPercent) {
            // TODO ::
        } else {
            var yMin = axis.min || axis.dataMin,
                yMax = axis.max || axis.dataMax,
                maxVal = yMax,
                minVal = yMin;
            if (!isNaN(yMin) && !isNaN(yMax) && yMin != null && yMax != null) {

                var displayMin = iChart.getYLabel(yMin, false, false, true),
                    displayMax = iChart.getYLabel(yMax, false, false, true),
                    gapProp = this._getYGaps(displayMin, displayMax),
                    calculatedGap = gapProp.calculatedGap;

                this._setUseNumericSymbols(displayMin, displayMax);
                this._setDecimalDigits(displayMin, displayMax);

                if (calculatedGap != 0) {
                    this._setMinYDecimalPlaces();
                    axis.options.tickPixelInterval = calculatedGap;
                    axis.options.tickPositions = undefined; // TODO remove if necessary
                }
            }
        }
    } else if (!axis.isXAxis && axis.options.infAxisType == "indicator") {
        gapProp = infChart.indicatorMgr.getYGap(this.id, axis);
        if (gapProp && gapProp.calculatedGap != 0) {
            axis.options.tickPixelInterval = gapProp.calculatedGap;
            axis.options.tickPositions = undefined; // TODO remove if necessary
        }
    }
};

/**
 * Returns the tick positions for log and compare axis .
 * Returns undefined if normal axis since normal axis is catered from 'setAxisPixelInterval' method.
 * @param axis
 * @param min
 * @param max
 * @returns {Array.<T>}
 */
infChart.StockChart.prototype.yAxisTickPositioner = function (axis, min, max) {

    if (!axis.isXAxis && min != null && max != null) {

        var iChart = this,
            mainYAxis = this.getMainYAxis();

        if (mainYAxis && axis.options.id == mainYAxis.options.id && !isNaN(min) && !isNaN(max)) {

            var minMaxProp = this.isLog ? this.getYMinMaxBaseValue(axis, min, max) : {maxVal: max, minVal: min},
            //displayMax = minMaxProp.maxVal,
            //baseMinVal = minMaxProp.minVal,
                displayMax = iChart.getYLabel(max, false, false, true),
                displayMin = iChart.getYLabel(min, false, false, true);

            this._setUseNumericSymbols(displayMin, displayMax);
            this._setDecimalDigits(displayMin, displayMax);

            if (this.isLog || (!this.isCompare && this.isPercent)) {
                var gapProp = this._getYGaps(displayMin, displayMax),
                    avgGaps = gapProp.avgGaps,
                    mainSeries = this.getMainSeries(),
                    gap = (displayMax - displayMin) / avgGaps;

                if (gap !== 0) {
                    var gapLog = Math.floor(infChart.util.num2Log(Math.abs(gap))),
                        gapLogVal = Math.pow(10, gapLog),
                        factor = Math.round(gap / gapLogVal),
                        minMultiFactor = (gapLog < 0) ? Math.pow(10, Math.abs(gapLog)) : 1,
                        minMultiFactorLog = (gapLog < 0) ? Math.abs(gapLog) : 0,
                        minLog = Math.floor(infChart.util.num2Log(Math.abs(displayMin * minMultiFactor)) * minMultiFactor) / minMultiFactor - minMultiFactorLog,
                        minLogVal = Math.pow(10, minLog),
                        minfactor = Math.floor(displayMin / minLogVal),
                        i = 0,
                        adjustedMin,
                        tickPositions = [],
                        remainder,
                        actualGap, actualMin;

                    actualGap = gapLogVal * factor;
                    actualMin = minLogVal * minfactor;


                    remainder = (Math.floor(Math.abs(actualMin)) == 0) ? 0 : Math.abs(actualMin) % Math.floor(Math.abs(actualMin));

                    if (!this.useNumericSymbolsAlways && remainder == 0 && actualGap > 1) {
                        this.decimalDigits = 0;
                    }

                    var gridValue = actualMin;
                    adjustedMin = (actualMin < 0 && displayMax > 0) ? 0 : actualMin;

                    while (gridValue <= displayMax) {
                        i++;
                        gridValue = Math.round((adjustedMin + actualGap * i) * minMultiFactor) / minMultiFactor;
                        if (gridValue >= displayMin && (axis.height / (displayMax - displayMin)) * (displayMax - gridValue) > 10) {
                            // plotLine = this._getGridLine(gridValue, baseInitVal, baseRangeFirst);
                            // plotLines.push(plotLine);
                            tickPositions.xPush(this.getProcessedValueFromDisplayValue(mainSeries, gridValue));
                        }

                    }

                    if (adjustedMin > displayMin) {

                        i = -1;
                        actualGap = actualGap * -1;
                        gridValue = adjustedMin;

                        while (displayMin <= gridValue) {

                            i++;
                            gridValue = Math.round((adjustedMin + actualGap * i) * minMultiFactor) / minMultiFactor;

                            if (displayMin <= gridValue && (axis.height / (displayMax - displayMin)) * (displayMax - gridValue ) > 10) {
                                // plotLine = this._getGridLine(gridValue, baseInitVal, baseRangeFirst);
                                // plotLines.push(plotLine);
                                tickPositions.xPush(this.getProcessedValueFromDisplayValue(mainSeries, gridValue));
                            }
                        }
                    }

                    if (!tickPositions.length) {
                        // when there is no tick possitions add middle value as the tick position
                        gridValue = Math.round((displayMin + (displayMax - displayMin) / 2) * minMultiFactor) / minMultiFactor;
                        //plotLine = this._getGridLine(gridValue, baseInitVal, baseRangeFirst);
                        //tickPositions.xPush(plotLine.value);
                        tickPositions.xPush(this.getProcessedValueFromDisplayValue(mainSeries, gridValue));
                    }

                    this._setMinYDecimalPlaces(axis);

                    return tickPositions.sort().reverse();
                }
            }
        }
    }
};

/**
 * Returns the average gap count and calculated gap between grid lines and set decimal places related properties
 * update decimalDigits & useNumericSymbolsAlways
 * @param axis
 * @param minVal
 * @param maxVal
 * @returns {{avgGaps: number, calculatedGap: number}}
 * @private
 */
infChart.StockChart.prototype._getYGaps = function (minVal, maxVal) {
    var plotHeight = this.chart.plotBox.height, //axis.height,
        avgGaps = 10,
        calculatedGap = 0,
        maxGap = 80,
        minGap = Math.max(15, Math.ceil(plotHeight / 10)),
        initialAvgGapsCount = 10,
        initialAvgGap = Math.round(plotHeight / initialAvgGapsCount),
        minGapsCount = Math.floor(plotHeight / minGap);

    var avgGapValue;
    //calculate avgGaps and avgGapValue
    if (maxVal > 10000) {
        avgGaps = Math.floor(plotHeight / ((maxGap + minGap) / 2));
        avgGapValue = (maxVal - minVal) / avgGaps;
    } else {
        avgGapValue = (maxVal - minVal) / avgGaps;
        if (avgGapValue < 1) {
            avgGaps = Math.floor((maxVal - minVal) / (1 / (this._log2Num(this.decimalDigits)))) || 1;
        }
    }

    //calculate calculatedGap
    if (avgGaps < 10) {
        if (initialAvgGap > minGap) {
            calculatedGap = initialAvgGap;
            avgGaps = initialAvgGapsCount;
        } else {
            calculatedGap = minGap;
            avgGaps = minGapsCount
        }
    } else if (plotHeight >= (avgGaps * maxGap)) {
        calculatedGap = maxGap;
        avgGaps = Math.floor(plotHeight / maxGap);
    } else if (plotHeight >= (avgGaps * minGap)) {
        calculatedGap = Math.floor(plotHeight / avgGaps);
    } else {
        calculatedGap = minGap;
        avgGaps = minGapsCount;
    }

    return {avgGaps: avgGaps, calculatedGap: calculatedGap};
};

/**
 * set/update useNumericSymbolsAlways and useNumericSymbols
 * @param  {Number} minVal
 * @param  {Number} maxVal
 */
infChart.StockChart.prototype._setUseNumericSymbols = function (minVal, maxVal) {
    this.useNumericSymbolsAlways = false;
    this.useNumericSymbols = false;

    if (maxVal > 10000 && minVal > 10000) {
        this.useNumericSymbolsAlways = true;
    } else if (maxVal > 10000) {
        this.useNumericSymbolsAlways = false;
    }

    this.useNumericSymbols = maxVal >= 10000;
};

/**
 * set/update decimal digits
 * @param  {Number} minVal
 * @param  {Number} maxVal
 */
infChart.StockChart.prototype._setDecimalDigits = function (minVal, maxVal) {
    var plotHeight = this.chart.plotBox.height,
        avgGaps = 10,
        maxGap = 80,
        minGap = 30;
    var avgGapValue;

    if (maxVal > 10000) {
        // This is a temperory solution need to get actual gaps set by highcharts for a correct solution
        avgGaps = this._getYGaps(minVal, maxVal).avgGaps; // IMPORTANT :: do not use this for max values under 10000 since decimalDigits are used there
        // avgGaps = Math.floor(plotHeight / (maxGap - minGap));
    }

    this.temperoryDisableNumericSymbols = false;
    avgGapValue = (maxVal - minVal) / avgGaps;

    if (avgGapValue < 1) {
        if (avgGapValue < 0.0000000001) {
            this.decimalDigits = Math.ceil(Math.abs(this._num2Log(Math.abs(minVal)))) + 5;
        } else {
            this.decimalDigits = Math.ceil(Math.abs(this._num2Log(Math.abs(avgGapValue))));
        }
    } else {
        var maxLog = Math.floor(this._num2Log(maxVal)),
            gapLog = Math.floor(this._num2Log(avgGapValue));
        if (maxVal > 10000 && minVal > 10000) {

            if (avgGapValue < 100) {
                this.temperoryDisableNumericSymbols = true;
            } else {
                this.decimalDigits = maxLog - gapLog;
            }
        } else {
            if (maxVal > 10000) {
                if (avgGapValue < 100) {
                    this.temperoryDisableNumericSymbols = true;
                } else {
                    this.decimalDigits = maxLog - gapLog;
                }
            } else {
                this.decimalDigits = 0;
            }
        }
    }


};

/**
 * Get plot line config for given grid value with given initial base value and initial base value of current range
 * @param gridValue
 * @param baseInitVal
 * @param baseRangeFirst
 * @returns {{label: {align: string, text: string, style: {font-size: string, fill: string, color: string}, x: number, y: number}, value: *, color: string, width: number, zIndex: number}}
 * @private
 */
infChart.StockChart.prototype._getGridLine = function (gridValue, baseInitVal, baseRangeFirst) {
    var gridLog, actualYValue, sign;
    var mainSeries = this.getMainSeries(),
        compareValue = this.getSeriesCompareValue(mainSeries);

    /* if (this.isCompare) {
     if (this.isLog) {
     gridLog = this._num2Log(gridValue) - compareValue;
     } else {
     if (this.isPercent) {
     /!*actualYValue = ((gridValue + baseRangeFirst) / 100 + 1) * baseInitVal;
     sign = (actualYValue < 0) ? -1 : 1;*!/
     gridLog = gridValue; ///((Math.abs(actualYValue) / baseInitVal - 1) * 100) - mainSeries.compareValue * sign;
     }
     else {
     gridLog = gridValue;
     }
     }
     }
     else if (this.isPercent) {
     //actualYValue = ((gridValue + baseRangeFirst) / 100 + 1) * baseInitVal;
     gridLog = gridValue; //(this._num2Log(actualYValue) / this._num2Log(baseInitVal) - 1) * 100;
     }
     else {
     gridLog = this._num2Log(gridValue);
     }*/

    gridLog = this.getSeriesProcessedValue(mainSeries, gridValue);

    /* var postFix = (this.isPercent) ? '%' : '';
     var dp = (gridValue > 1000) ? 0 : 4;
     var numArr = gridValue.toFixed(dp).split('.');
     dp = ( numArr.length > 1) ? (parseInt(numArr[1]) == 0) ? 0 : dp : dp;
     var ret = infChart.util.formatNumber(gridValue, dp, '.', infChart.util.getThousandSeparator());
     ret = numArr[0].replace(/[0]+$/, '');*/
    var label = this.formatYValue(gridValue, this.isPercent);
    var gridLineWidth = (this.yGridLineWidth == 0) ? 0.00001 : 1;

    return {
        "label": {
            align: "right",
            text: label,
            style: {

                "font-size": "11px",
                "fill": Highcharts.theme && Highcharts.theme.yAxis.labels.style.color,
                "color": Highcharts.theme && Highcharts.theme.yAxis.labels.style.color
            },
            x: 28,
            y: 4
        },
        "value": gridLog,
        "color": Highcharts.theme && Highcharts.theme.yAxis.gridLineColor,
        "width": gridLineWidth,
        "zIndex": 1,
        "infType": "gridLine"
    };
};

/**
 * set grid type
 * @param {('all'|'horizontal'|'vertical'|'none'} type
 * @param {boolean} redraw
 * @param {boolean} isPropertyChange
 */
infChart.StockChart.prototype.setGridType = function (type, redraw, isPropertyChange) {

    if (typeof redraw === 'undefined') {
        redraw = true;
    }

    this.gridType = type;
    var xgridLineWidth = 1,
        ygridLineWidth = 1,
        gridLineWidth = 1;

    if (this.xGridLineWidth || this.yGridLineWidth) {
        gridLineWidth = this.xGridLineWidth ? this.xGridLineWidth : this.yGridLineWidth;
    }

    switch (type) {
        case "all":
            xgridLineWidth = gridLineWidth;
            ygridLineWidth = gridLineWidth;
            break;
        case "horizontal":
            xgridLineWidth = 0;
            ygridLineWidth = gridLineWidth;
            break;
        case "vertical":
            xgridLineWidth = gridLineWidth;
            ygridLineWidth = 0;
            break;
        case "none":
            xgridLineWidth = 0;
            ygridLineWidth = 0;
            break;
        default:
            break;
    }

    this.yGridLineWidth = ygridLineWidth;
    this.xGridLineWidth = xgridLineWidth;

    var mainSeries = this.getMainSeries();

    if (mainSeries && mainSeries.xAxis) {

        var seriesId = mainSeries.options.id;
        var rightPanel = this._getSettingsPanel();
        var activeGridLineWidth;

        if(type == "none") {
            activeGridLineWidth = 0;
        } else {
            activeGridLineWidth = gridLineWidth;
        }

        if(rightPanel){
            infChart.structureManager.settings.setActiveGridLineWidth(rightPanel, this.chartId, activeGridLineWidth);
        }

        mainSeries.xAxis.update({
            gridLineWidth: this.xGridLineWidth
        }, false);
        var yAxis = this.getMainYAxis();
        this.updateYAxis(yAxis, {
            gridLineWidth: this.yGridLineWidth
        }, !this.isFirstLoadInprogress() && redraw);
    }
    if (isPropertyChange) {
        this._onPropertyChange("grid");
    }

    this.toggleGridSettingPanel();
};

/**
 * xAxis Tick positioner
 * @param xAxis
 * @param min
 * @param max
 * @returns {Array}
 */
infChart.StockChart.prototype.xAxisTickPositioner = function (xAxis, min, max) {

    var ordinalPositions = xAxis.ordinalPositions,
        tickPositions = [],
        i,
        iLen;

    if (this.period == "M_1" && this.interval == "D") {

        if (ordinalPositions && ordinalPositions.length > 1 && (max - min) > Highcharts.timeUnits.day) {
            var labelOptions = xAxis.options.labels,
                axisOptions = xAxis.options,
                axisFormats = axisOptions.dateTimeLabelFormats,
                tickVal,
                labelVal,
                tickWidth = Math.floor(xAxis.width / (ordinalPositions.length - 1)),
                labelWidth = 0,
                accumilatedWidth = 0,
                label,
                prevTick;

            for (i = 0, iLen = ordinalPositions.length; i < iLen && accumilatedWidth < xAxis.width; i++) {

                tickVal = ordinalPositions[i];
                prevTick = tickPositions.length == 0 ? undefined : tickPositions[tickPositions.length - 1];
                if (!prevTick || (tickVal - prevTick) >= Highcharts.timeUnits.day) {
                    labelVal = infChart.util.formatDate(tickVal, this._getXAxisLabelFormat(axisFormats, tickVal, prevTick, !prevTick));

                    /* Create a label to calculate the width for the text and destroy it afterwards */
                    label = xAxis.chart.renderer.text(
                        labelVal,
                        0,
                        0,
                        false
                    ).css(labelOptions.style).add(xAxis.labelGroup);

                    labelWidth = label.element.clientWidth + 2;
                    label.destroy();

                    if (accumilatedWidth == 0 || accumilatedWidth < (tickWidth * (i) - labelWidth / 2)) {

                        if (accumilatedWidth && tickPositions.length > 1 && accumilatedWidth > tickWidth * i - labelWidth / 2) {
                            tickPositions[tickPositions.length - 1] = tickVal;
                        } else {
                            tickPositions.xPush(tickVal);
                        }

                        accumilatedWidth = (i == 0) ? labelWidth : tickWidth * i + labelWidth / 2;
                    }
                }
            }
            if (tickPositions.length <= 2) {
                tickPositions = undefined;
            }
            return tickPositions;
        }

    } else if (ordinalPositions && this.interval == "D") {
        /* TODO :: implement on request
         if( xAxis.width/( ordinalPositions.length - 1 ) >  60 ) {
         return ordinalPositions;
         } else {
         var factor = Math.ceil(60/(xAxis.width/( ordinalPositions.length - 1 )));
         for(i=0, iLen = ordinalPositions.length; i< iLen; i += factor) {
         tickPositions.push(ordinalPositions[i]);
         }
         return tickPositions;
         }*/

    }
};

//endregion +++++++++++++++++++++++ end of Grid Line +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

//endregion ========================== end of Axis =====================================================================

//region =====================Template Saving===========================================================================

infChart.StockChart.prototype.destroy = function (properties) {
    this.destroying = true;
    this._destroyNoDataLabel();

    if (this.rangeSelector) {
        this.fromDatePicker.remove();
        this.toDatePicker.remove();
        if (this.rangeSelectorEl) {
            this.rangeSelectorEl.remove();
        }
    }
    infChart.util.forEach(this.settingsPopups, function (i, popup) {
        popup.remove();
    });

    this.removeAllIndicators(false);
    // legend of the series(compare symbols and indicators need to be removed  if destroy is called for loading another template.
    infChart.structureManager.legend.cleanLegendContainer(this.id);
    if (this.mouseWheelController) {
        this.mouseWheelController.destroy();
    }

    if (this.updateTicksTimer) {
        clearTimeout(this.updateTicksTimer);
    }
    if (this.resizeTimer) {
        clearTimeout(this.resizeTimer);
    }
    if(this.updateTickTimeValue){
        clearTimeout(this.updateTickTimeValue);
    }
    if(this.updateBarClosureLabelTimer){
        clearTimeout(this.updateBarClosureLabelTimer);
    }

    this._fireEventListeners("destroy", []);

    this.chart && this.chart.destroy();

    this.destroyed = true;
    this.chart = null;
    this.container = undefined;
    this.symbol = null;
    this.chartId = null;
    //infChart.manager.removeChart(this.id);
    this.destroying = false;
};

/**
 * set volume
 * @param {boolean} enabled - enable/disable
 * @param {boolean} propertyChange - fire property change
 * @param {boolean | undefined} redraw - redraw chart
 */
infChart.StockChart.prototype.setVolume = function (enabled, propertyChange, redraw) {
    if (typeof redraw === 'undefined') {
        redraw = true;
    }
    var toolbarConfig = this.settings.toolbar.config;
    var indicatorType = toolbarConfig && toolbarConfig.volume && toolbarConfig.volume.type ? toolbarConfig.volume.type : "VOLUME";
    return this.toggleSingletonIndicatorByType(indicatorType, propertyChange, enabled, redraw);
};

/**
 * set bid ask history
 * @param {boolean} enabled - enable/disable
 * @param {boolean} propertyChange - fire property change
 * @param {boolean | undefined} redraw - redraw chart
 */
infChart.StockChart.prototype.setBidAskHistory = function (enabled, propertyChange, redraw) {
    if (typeof redraw === 'undefined') {
        redraw = true;
    }
    var toolbarConfig = this.settings.toolbar.config;
    var indicatorType = toolbarConfig && toolbarConfig.bidAskHistory && toolbarConfig.bidAskHistory.type ? toolbarConfig.bidAskHistory.type : "BAH";
    return this.toggleSingletonIndicatorByType(indicatorType, propertyChange, enabled, redraw);
};

/**
 * set spread
 * @param {boolean} enabled - enable/disable
 * @param {boolean} propertyChange - fire property change
 * @param {boolean | undefined} redraw - redraw chart
 */
infChart.StockChart.prototype.setSpread = function (enabled, propertyChange, redraw) {
    var isSpreadEnabel = false;
    if (typeof redraw === 'undefined') {
        redraw = true;
    }
    var toolbarConfig = this.settings.toolbar.config;
    var indicatorType = toolbarConfig && toolbarConfig.spread && toolbarConfig.spread.type ? toolbarConfig.spread.type : "SPREAD";
    isSpreadEnabel = this.toggleSingletonIndicatorByType(indicatorType, propertyChange, enabled, redraw);
    if (this._isToolbarEnabled()) {
        infChart.toolbar.setVisibility(this.id, 'spread', this.compareSymbols.count > 0);
    }
    return isSpreadEnabel;
};

//infChart.StockChart.prototype.isBidAskEnabled = function () {
//    return this.bidAskHistory;
//};

infChart.StockChart.prototype._isSingletonIndicator = function (indicatorType) {
    return infChart.indicatorMgr.isSingletonIndicator(indicatorType);
};

/**
 * toggle singleton indicator
 * @param {string} indicatorType - type
 * @param {boolean} enabled - enable/disable
 * @param {object} config - config object
 * @param {boolean} redraw - redraw chart
 * @param {boolean} propertyChange - fire property change
 * @param {string} controlName - set toolbar
 */
infChart.StockChart.prototype._toggleSingletonIndicator = function (indicatorType, enabled, config, redraw, propertyChange, controlName) {
    var indicator = undefined;
    if (infChart.indicatorMgr) {
        indicator = infChart.indicatorMgr.getSingletonIndicator(this.id, indicatorType);
    }

    if (enabled) {
        if (controlName && this._isToolbarEnabled()) {
            infChart.toolbar.setSelectedControls(this.id, controlName, true);
        }
        if (!indicator) {
            this.addIndicator(indicatorType, config, redraw, propertyChange);
            if(indicatorType === 'BAH') {
                if (this.tooltip) {
                    this.updateTooltipToLastPoint(true);
                    this.resizeChart();
                }
            }
        }
    } else {
        if (controlName && this._isToolbarEnabled()) {
            infChart.toolbar.setSelectedControls(this.id, controlName, false);
        }
        if (indicator) {
            this.removeIndicator(indicator, propertyChange);
            if(indicatorType === 'BAH') {
                if (this.tooltip) {
                    this.updateTooltipToLastPoint(true);
                    this.resizeChart();
                }
            }
        }
    }
};

/**
 * Enable / disable history
 * @param enabled
 */
infChart.StockChart.prototype._setHistory = function (enabled) {
    if (!enabled && this.chart.options.navigator.enabled) {
        this.chart.options.navigator.height = this.settings.config.navigatorHeight ? this.settings.config.navigatorHeight : infChart.util.getNavigatorHeight(this.chart.chartHeight, this.chart.options);
        this._toggleNavigator(false);
    } else if(enabled && !this.chart.options.navigator.enabled) {
        this.chart.options.navigator.enabled = true;
        this._toggleNavigator(false);
    } else if(!enabled && !this.chart.options.navigator.enabled) {
        this.chart.options.navigator.enabled = true;
        this._toggleNavigator(false);
    }
};

/**
 * Enable / disable history
 * @param enabled
 * @deprecated
 */
infChart.StockChart.prototype.setChartMode = function (type, enabled) {

    if (enabled) {
        if (type == 'log') {
            if (this.isPercent) {
                this.isPercent = false;
                type = "percentToLog";
                if (this._isToolbarEnabled()) {
                    infChart.toolbar.setSelectedControls(this.id, 'value', this.isPercent, 'percent');
                }
            }
        } else if (type == 'percent') {
            if (this.isLog) {
                this.isLog = false;
                type = "logToPercent";
                if (infChart.toolbar) {
                    infChart.toolbar.setSelectedControls(this.id, 'value', this.isLog, 'log');
                }
            }
        }
        this.setChartDataMode(type, true);
        if (this._isToolbarEnabled()) {
            infChart.toolbar.setSelectedControls(this.id, 'value', true, type);
        }

    } else {
        //when chart mode is normal, no need to set chart data mode.
        if (this.isCompare || this.isLog || this.isPercent) {
            if (type == 'log') {
                this.setChartDataMode("logToNormal", true);
            } else if (type == 'percent') {
                this.setChartDataMode("percentToNormal", true);
            } else {
                this.setChartDataMode("normal", true);
            }
        }
        if (this._isToolbarEnabled()) {
            infChart.toolbar.setSelectedControls(this.id, 'value', false, type);
        }

    }
};

infChart.StockChart.prototype.setProviderProperties = function (providerProperties) {
    this.provider = providerProperties;
    if (providerProperties.type === 'WEBFG') {
        this.useGrouping = false;
    }
};

infChart.StockChart.prototype.updateProperties = function (properties, setDefaultChartSettings) {
    var that = this;
    var mainSeries = that.getMainSeries();
    var mainSeriesId = mainSeries.options.id;

    if (that.hasLastLine) {
        that._removeLastLine(true);
    }

    if (that.hasPreviousCloseLine) {
        that._removePreviousCloseLine(false, true);
    }
    if(that.enableBarClosure){
        infChart.manager.toggleBarClosureTime(infChart.manager.getContainerIdFromChart(this.chartId));
    }

    if (that.bidAskLabelsEnabled){
        that._removeBidAskLabels();
    }

    if (that.bidAskLineEnabled) {
        that._removeBidAskLines();
    }

    infChart.util.forEach(that.compareSymbols.idMap, function (id, symbol) {
        that.removeCompareSymbol(symbol, false);
    });

    that.removeAllIndicators(false);

    infChart.themeManager.resetMainSeriesColors(that._getSeriesProperties(mainSeries));

    if (this.settingsPopups[mainSeriesId]) {
        this.settingsPopups[mainSeriesId].remove();
        delete this.settingsPopups[mainSeriesId];
    }
    that.seriesColorOptions = {};
    that._setProperties(properties, setDefaultChartSettings);
    if (properties.mainSeriesOptions) {
        that._setSeriesProperties(mainSeries, properties.mainSeriesOptions);
    }
    that._loadSettingWindow(!that.isRightPanelOpen(), {'seriesId': mainSeriesId});

    //reset user extremes
    that.defaultXAxisExtremes = undefined;
    that.resetXAxisExtremesToDefault(false);
    that.resetYAxisExtremes(false);

    that._loadHistory(properties.compareSymbols, properties.indicators, properties.drawings, properties.flags, undefined, properties.range, undefined, properties.noData, properties.compareSeriesOptions);
};

infChart.StockChart.prototype._setProperties = function (chartProperties, setDefaultChartSettings) {
  this.interval = chartProperties.interval;
  this.pinInterval = chartProperties.pinInterval;
  this.period = chartProperties.period;
  this.customCandleCount = chartProperties.customCandleCount;
  this.candleCountEnable = chartProperties.candleCountEnable != undefined ? chartProperties.candleCountEnable : true;
  this.customGridLineColorEnabled = chartProperties.customGridLineColorEnabled;
  this.backgroundColor = chartProperties.backgroundColor;
  this.chartBackgroundColor = chartProperties.chartBackgroundColor;
  this.chartBgTopGradientColor = chartProperties.chartBgTopGradientColor;
  this.chartBgBottomGradientColor = chartProperties.chartBgBottomGradientColor;
  this.backgroundType = chartProperties.backgroundType;
  this.backgroundColorOpacity = chartProperties.backgroundColorOpacity;
  this.chartBgTopGradientColorOpacity = chartProperties.chartBgTopGradientColorOpacity;
  this.chartBgBottomGradientColorOpacity = chartProperties.chartBgBottomGradientColorOpacity;
  this.grid = chartProperties.grid;
  this.isGloballyLocked = chartProperties.isGloballyLocked;

  if (chartProperties.sessionTimeBreakSettings) {
      this.sessionTimeBreakSettings = chartProperties.sessionTimeBreakSettings;
  }

  if (setDefaultChartSettings) {
    var theme = infChart.themeManager.getTheme();
    infChart.commandsManager.clearFromCommandStacks(this.id, undefined, "undo");
    infChart.commandsManager.clearFromCommandStacks(this.id, undefined, "redo");
    this.customGridLineColorEnabled = false;
    this.chartBackgroundColor = theme.chart.backgroundColor;
    this.chartBgTopGradientColor = theme.chart.chartBgTopGradientColor;
    this.chartBgBottomGradientColor = theme.chart.chartBgBottomGradientColor;
    this.setGridLineColor(theme.xAxis.gridLineColor, theme.yAxis.gridLineColor);
    this.grid = "none";
    this._onPropertyChange("gridType", this.grid, true);
  } else {
    if (chartProperties.gridSettings) {
      this.setGridLineColor(chartProperties.gridSettings.xGridLineColor, chartProperties.gridSettings.yGridLineColor);
      this.setGridLineWidth(chartProperties.gridSettings.xGridLineWidth, chartProperties.gridSettings.yGridLineWidth);
    }
  }

  if (this.backgroundType == "gradient") {
    this.setGradientChartBackgroundColor(
      this.chartBgTopGradientColor,
      this.chartBgBottomGradientColor,
      this.chartBgTopGradientColorOpacity,
      this.chartBgBottomGradientColorOpacity
    );
  } else {
    this.setChartBackgroundColor(this.chartBackgroundColor, this.backgroundColorOpacity);
  }
  this.setGridType(this.grid, true);

  this.isManualPeriod = true;
  this.isManualInterval = true;

  this.type = chartProperties.type;
  this.setChartStyle(chartProperties.type, false, false);

  this.isLog = chartProperties.isLog;
  this.isPercent = chartProperties.isPercent;

  this._setMinMax(chartProperties.minMax);
  //    this.minMax.enabled = chartProperties.minMax;

  this.hasLastLine = chartProperties.last;
  this.hasLastLineForCompareSymbols = chartProperties.lastLineForCompareSymbols;
  this.enableBarClosure = chartProperties.enableBarClosure;
  this.enabledLastLabel = chartProperties.enabledLastLabel;
  this.enabledLastLine = chartProperties.enabledLastLine;
  this.bidAskLineEnabled = chartProperties.bidAskLineEnabled;
  this.bidAskLabelsEnabled = chartProperties.bidAskLabelsEnabled;
  this.hasPreviousCloseLine = chartProperties.preClose;
  this.disableNumericSymbols = chartProperties.disableNumericSymbols;

    if (chartProperties.crosshair !== this.crosshair.type) {
        this.setCrosshair(chartProperties.crosshair);
    }

    if (this.tooltip != chartProperties.tooltip) {
        this.toggleToolTip();
    } else {
        this.setToolTipOptions();
    }

    if (chartProperties.news) {
        this.toggleNews();
    }
    if (chartProperties.flags) {
        this.flagTypes = chartProperties.flags;
        this.toggleFlags();
    }

  if (chartProperties.extremes) {
    this.extremes = chartProperties.extremes;
  }

  this._setHistory(chartProperties.navigator);

  this.volume = chartProperties.volume;
  this.orderBookHistory = chartProperties.orderBookHistory;
  this.regularIntervalsOnUpdate = chartProperties.regularIntervalsOnUpdate;
  this.fixedIntervalOnPeriodChange = chartProperties.fixedIntervalOnPeriodChange;
  //this.maxPeriodOnIntervalChange = chartProperties.maxPeriodOnIntervalChange;
  this.setMaxAvailablePeriod = chartProperties.setMaxAvailablePeriod;
  // used to calculate the max data count for the first time since there is no data to show the yAxis(yAxis width (margin right od the chart )) needed in the calculation
  //this.marginRight = chartProperties.marginRight;
  //this.setGridType(chartProperties.grid, false);

  //if (infChart.depthManager) {
  //    var resizeRequired = infChart.depthManager.setProperties(this.id, infChart.structureManager.getContainer(this.getContainer(), 'chartContainer'), chartProperties.depth);
  //    if (resizeRequired) { //&& !this.isFirstLoadInprogress()
  //        this.resizeChart();
  //    }
  //}

  this.bidAskHistory = chartProperties.bidAskHistory;
  this.spread = chartProperties.spread && chartProperties.compareSymbols && chartProperties.compareSymbols.length > 0;

  if (this._isToolbarEnabled()) {
    infChart.toolbar.setDefaultValues($(this.getContainer()), chartProperties);
  }

  var isRightPanelOpened = this.isRightPanelOpen();
  if ((chartProperties.rightPanel && !isRightPanelOpened) || (!chartProperties.rightPanel && isRightPanelOpened)) {
    this.toggleRightPanel(this.getContainer, false);
  }
};

infChart.StockChart.prototype.getProperties = function () {
    var indicators = [], compareSymbols = [], compareSeriesOptions = [], iChart = this, drawings = [], properties, series;

    //if (infChart.indicatorMgr) {
    //    infChart.util.forEach(infChart.indicatorMgr.getIndicators(that.id), function (i, ind) {
    //        indicators.xPush(ind.getProperties());
    //    });
    //}

    infChart.util.forEach(this.compareSymbols.symbols, function (i, symbol) {
        series = iChart.chart && iChart.chart.get(iChart.getCompareSeriesId(symbol));
        compareSymbols.xPush(symbol);
        compareSeriesOptions.xPush(iChart._getSeriesProperties(series));
    });

    properties = {
        period: this.period,
        interval: this.interval,
        pinInterval: this.pinInterval,
        type: this.type,
        isCompare: this.isCompare,
        isLog: this.isLog,
        isPercent: this.isPercent,
        volume: this.volume,
        indicators: indicators,
        compareSymbols: compareSymbols,
        compareSeriesOptions: compareSeriesOptions,
        mainSymbol: this.symbol,
        mainSeriesOptions: infChart.themeManager.getChangedSeriesThemeColors(iChart._getSeriesProperties(this.getMainSeries()), this.getMainSeries().type),
        crosshair: (this.crosshair.enabled) ? this.crosshair.type : 'none',
        minMax: this.minMax.enabled,
        navigator: this.isHistoryEnabled(),
        last: this.hasLastLine,
        enabledLastLabel: this.enabledLastLabel,
        enabledLastLine: this.enabledLastLine,
        enableBarClosure: this.enableBarClosure,
        bidAskLineEnabled: this.bidAskLineEnabled,
        bidAskLabelsEnabled: this.bidAskLabelsEnabled,
        lastLineForCompareSymbols: this.hasLastLineForCompareSymbols,
        preClose: this.hasPreviousCloseLine,
        tooltip: this.tooltip,
        news: this.news.enabled,
        flags: this.flags.enabled,
        grid: this.gridType,
        customGridLineColorEnabled: this.customGridLineColorEnabled,
        gridSettings: {
            xGridLineColor: this.chart.xAxis[0].options.gridLineColor,
            yGridLineColor: this.chart.yAxis[0].options.gridLineColor,
            gridLineWidth: this.chart.yAxis[0].options.gridLineWidth > this.chart.xAxis[0].options.gridLineWidth  ? this.chart.yAxis[0].options.gridLineWidth : this.chart.xAxis[0].options.gridLineWidth,
            xGridLineWidth: this.chart.xAxis[0].options.gridLineWidth,
            yGridLineWidth: this.chart.yAxis[0].options.gridLineWidth
        },
        chartBackgroundColor: this.chartBackgroundColor,
        backgroundColor: this.chart.options.chart.backgroundColor,
        chartBgTopGradientColor:  this.chartBgTopGradientColor,
        chartBgBottomGradientColor: this.chartBgBottomGradientColor,
        backgroundType: typeof this.chart.options.chart.backgroundColor === 'string' ? "solid" : "gradient",
        backgroundColorOpacity: this.backgroundColorOpacity,
        chartBgTopGradientColorOpacity: this.chartBgTopGradientColorOpacity,
        chartBgBottomGradientColorOpacity: this.chartBgBottomGradientColorOpacity,

        //refreshBtn: this.settings.config.refreshBtn,
        //hideClose: this.settings.config.hideClose,
        //displayAllIntervals: this.settings.config.displayAllIntervals, // Used this property to determine whether dummy points are needed or not in place of missing intervals
        //unGroupedDataOnLoad: this.settings.config.unGroupedDataOnLoad || 0.5,
        //panToFuture: this.settings.config.panToFuture,
        //panToPast: this.settings.config.panToPast,
        //disableRangeSelector: this.settings.config.disableRangeSelector || false,
        //maxIndicatorCount: this.settings.config.maxIndicatorCount,
        //showAllHistory: this.settings.config.showAllHistory, // Used to determine whether to display all history or max zoom when changing the period
        //scalable: this.settings.config.scalable,
        //previousCloseLabelAlign: this.settings.config.previousCloseLabelAlign,
        //lastLabelAlign: this.settings.config.lastLabelAlign,
        //minYDecimalPlaces: this.settings.config.minYDecimalPlaces,
        //defaultDp: this.settings.config.defaultDp,
        //tickUpdateDelay: this.settings.config.tickUpdateDelay,
        //maxResizeDelay: this.settings.maxResizeDelay,
        //navigatorHeight: this.settings.config.navigatorHeight,
        //lineDataField: this.settings.config.lineDataField,
        isManualInterval: this.isManualInterval,
        orderBookHistory: this.orderBookHistory,
        bidAskHistory: this.bidAskHistory,
        regularIntervalsOnUpdate: this.regularIntervalsOnUpdate,
        fixedIntervalOnPeriodChange: this.fixedIntervalOnPeriodChange,  // Flag to keep the current interval fixed on period change when it is applicable
        //maxPeriodOnIntervalChange: this.maxPeriodOnIntervalChange,
        setMaxAvailablePeriod: this.setMaxAvailablePeriod,
        spread: this.spread,
        // marginRight & plotSizeX are used to calculate the max data count for the first time since there is no data to show the yAxis(yAxis width (margin right od the chart )) needed in the calculation
        marginRight: this.chart && this.chart.marginRight,
        chartWidth: this.chart && this.chart.chartWidth,
        rightPanel: this.isRightPanelOpen(),
        customCandleCount: this.customCandleCount,
        isGloballyLocked : this.isGloballyLocked
    };

    //if (infChart.depthManager) {
    //    properties.depth = infChart.depthManager.getProperties(this.id);
    //}
    //if (type == "all") {
    //    properties.drawings = drawings;
    //}

    return properties;
};

//infChart.StockChart.prototype.getTemplate = function (type) {
//    return this.getProperties(type);
//};

infChart.StockChart.prototype._getSeriesProperties = function (series) {
    if (series) {
        var cfg = this._getColorPropertiesFromOptions(series.options, series.type, series);
        cfg.infColor = this.seriesColorOptions[series.options.id];
        if (series.options.hideLegend) {
            cfg.hideLegend = series.options.hideLegend;
        }
        if(series.options.visible !== undefined){
            cfg.visible = series.options.visible;
        }
        cfg["type"] = series.type;
        return cfg;
    }
};

/**
 * get series color properties from options
 * @param {object} options - series option
 * @param {string} type - series type
 * @param {object} series - the series
 * @param {boolean} useSeriesLineColor - use series line color if true
 * @returns {object} - color option
 */
infChart.StockChart.prototype._getColorPropertiesFromOptions = function (options, type, series, useSeriesLineColor) {
    var cfg = {
        color: options.color
    };
    cfg.lineWidth = infChart.util.isDefined(options.lineWidth) ? options.lineWidth : series.options.lineWidth;

    switch (type) {
        case 'area':
            cfg.lineColor = (useSeriesLineColor && series.options.lineColor) ? series.options.lineColor : this._getLineColor(series, type);
            //cfg.lineColor = hexColor;
            cfg.negativeColor = options.negativeColor;
            if (options.negativeFillColor) {
                cfg.negativeFillColor = options.negativeFillColor;
            }
            cfg.fillColor = options.fillColor;
            break;
        case 'line':
        case 'dash':
        case 'arearange':
        case 'step':
            cfg.lineColor = options.lineColor;
            cfg.negativeColor = options.negativeColor;
            cfg.fillOpacity = options.fillOpacity;
            break;
        case 'column':
            cfg.color = options.color;
            if (options.negativeColor) {
                cfg.negativeColor = options.negativeColor;
            }
            break;
        case 'volume':
            if (series.options.hasColumnNegative) {
                cfg.upColor = options.upColor;
                cfg.upLineColor = options.upColor;
                cfg.color = options.color;
                cfg.lineColor = options.color;
            } else {
                cfg.color = options.color;
                cfg.lineColor = options.color;
                cfg.upColor = options.color;
            }
            break;
        case 'heikinashi':
        case 'equivolume':
        case 'point':
        case 'candlestick':
        case 'ohlc':
        case 'hlc':
        case 'customCandle':
        case 'engulfingCandles':
            cfg.color = options.color;
            cfg.lineColor = options.lineColor;
            cfg.upColor = options.upColor;
            cfg.upLineColor = options.upLineColor;
            break;
        default:
            break;
    }
    return cfg;
};

infChart.StockChart.prototype._setSeriesProperties = function (series, options, redraw) {
    if (typeof redraw === 'undefined') {
        redraw = false;
    }
    this.seriesColorOptions[series.options.id] = $.extend({}, this.seriesColorOptions[series.options.id], options.infColor);
    series.update(options, redraw);
    if(this.hasLastLine){
        this._drawLastLine();
    }
    if(this.enableBarClosure){
        this._drawBarClosureLabel();
    }
    if (this.bidAskLabelsEnabled) {
        this._drawBidAskLabels();
    }
    if (this.bidAskLineEnabled) {
        this._drawBidAskLines();
    }
};

///**
// * @deprecated
// * @param name
// * @param type
// * @param template
// */
//infChart.StockChart.prototype.loadTemplate = function (name, type, template) {
//    infChart.manager.loadTemplate(this.id, name, type, template);
//};

//endregion =====================end of Template Saving=================================================================

//region =====================Show Min/Max==============================================================================

/**
 * Enable / disable minmax
 * @param enabled
 */
infChart.StockChart.prototype._setMinMax = function (enabled, isPropertyChange) {
    if (enabled && !this.minMax.enabled) {
        this.toggleShowMinMax(isPropertyChange);
        if (this._isToolbarEnabled()) {
            infChart.toolbar.setSelectedControls(this.id, 'minMax', true);
        }
    } else if (!enabled && this.minMax.enabled) {
        this.toggleShowMinMax(isPropertyChange);
        if (this._isToolbarEnabled()) {
            infChart.toolbar.setSelectedControls(this.id, 'minMax', false);
        }
    }
};

infChart.StockChart.prototype.updateMinMax = function () {
    if (this.minMax.enabled) {
        this._showMinMax();
    }
};

infChart.StockChart.prototype._hideMinMaxLabels = function () {
    if (this.minMax.min) {
        this.minMax.min.hide();
    }
    if (this.minMax.max) {
        this.minMax.max.hide();
    }
};

infChart.StockChart.prototype._hideMinMax = function () {
    this.minMax.enabled = false;
    this._hideMinMaxLabels();
};

infChart.StockChart.prototype._showMinMax = function () {

    var mainSeries = this.getMainSeries();
    if (!this.minMax.axisAdjusted) {
        /*mainSeries.yAxis.update({
         "startOnTick": true,
         "endOnTick": true
         }, true);*/
        this.minMax.axisAdjusted = true;
    }
    this.minMax.enabled = true;
    var minField = this.minMax.minField;
    var maxField = this.minMax.maxField;

    if (!this.minMax.min) {
        var red = infChart.util.getDefaultDownColor();
        var green = infChart.util.getDefaultUpColor();
        this.minMax.min = this.chart.renderer.label('').attr({
            "zIndex": 20,
            padding: 3,
            r: 1
        }).css({
            color: red,
            "font-size": '11px'
        }).add();

        this.minMax.max = this.chart.renderer.label('').attr({
            "zIndex": 20,
            padding: 3,
            r: 1
        }).css({
            color: green,
            "font-size": '11px'
        }).add();
    }


    var points = mainSeries.points;
    if (points && points.length > 0) {
        var dataPoint;
        /*if(this.interval == 'T'){

         var pointHValue = (points[0].high != undefined)?points[0].high : (points[0].close != undefined) ? points[0].close : points[0].y;
         var pointLValue = (points[0].low != undefined)?points[0].low : (points[0].close != undefined) ? points[0].close : points[0].y;
         if(pointHValue != undefined && pointLValue != undefined ) {
         dataPoint = {};
         dataPoint.low = this.getYLabel(pointHValue);
         dataPoint.high = this.getYLabel(pointLValue);
         }
         } else {*/
        dataPoint = this.getOHLCfromPoint(points[0]);
        //}

        if (dataPoint && dataPoint[minField] != undefined && dataPoint[maxField] != undefined) {
            var yMin = dataPoint[minField] + 1; // (points[0].close != undefined) ? points[0].close : points[0].y;
            var yMax = dataPoint[maxField] - 1; //(points[0].close != undefined) ? points[0].close : points[0].y;
            var xMin, plotXmin, plotYmin, minClose;
            var xMax, plotXmax, plotYmax, maxClose;
            var yPointValMin, minPontIndex, maxPointIndex;
            var shapeHMin, shapeHMax, shapeWidth = 0;
            var that = this;

            infChart.util.forEach(
                points, function (i, point) {
                    /*if(that.interval == 'T'){
                     var pointHValue = (point.high != undefined)?point.high : (point.close != undefined) ? point.close : point.y;
                     var pointLValue = (point.low != undefined)?point.low : (point.close != undefined) ? point.close : point.y;

                     dataPoint.low = that.getYLabel(pointHValue);
                     dataPoint.high = that.getYLabel(pointLValue);
                     }else {*/
                    dataPoint = that.getOHLCfromPoint(point);
                    //var close = (point.close != undefined) ? point.close : point.y;
                    //}
                    if (dataPoint[minField] <= yMin) {

                        minPontIndex = i;
                        yMin = dataPoint[minField];
                        xMin = point.x;
                        plotXmin = point.plotX;
                        plotYmin = (point.xPlotMin) ? point.xPlotMin : point.plotLow ? point.plotLow : point.plotY;
                        yPointValMin = plotYmin;
                        shapeHMin = (point.shapeArgs && !point.xPlotMin) ? point.shapeArgs.height : 0;
                        minClose = (point.xMinMaxKey) ? point[point.xMinMaxKey] : (point.low != undefined) ? point.low : point.y;
                        shapeWidth = point.pointWidth ? point.pointWidth : 0;
                    }
                    if (dataPoint[maxField] >= yMax) {
                        maxPointIndex = i;
                        yMax = dataPoint[maxField];
                        xMax = point.x;
                        plotXmax = point.plotX;
                        plotYmax = (point.yPlotMax) ? point.yPlotMax : (point.plotHigh) ? point.plotHigh : point.plotY;
                        shapeHMax = 15;
                        shapeWidth = point.pointWidth ? point.pointWidth : 0;
                        maxClose = (point.xMinMaxKey) ? point[point.xMinMaxKey] : (point.high != undefined) ? point.high : point.y;
                    }
                }
            );

            var y, x;
            if (xMin) {
                var minValue = infChart.util.formatNumber(yMin, mainSeries.options.dp); // this.formatYValue(yMin);//this.getYLabel(yMin);
                y = yPointValMin + shapeHMin;
                var yAxisMinPos = mainSeries.yAxis.top + mainSeries.yAxis.height - 15;
                y = (y > yAxisMinPos) ? yAxisMinPos : y;
                this.minMax.min.show().attr({
                    hAlign: 'left',
                    x: plotXmin - shapeWidth / 2,
                    y: y,
                    text: '' + minValue
                });

                x = (plotXmin < 20) ? (plotXmin < (this.chart.plotLeft - shapeWidth / 2)) ? this.chart.plotLeft : plotXmin - shapeWidth / 2 :
                    ((plotXmin + this.minMax.min.width) > (this.chart.plotLeft + this.chart.plotWidth)) ? this.chart.plotLeft + this.chart.plotWidth - this.minMax.min.width : plotXmin - this.minMax.min.width / 2;

                this.minMax.min.show().attr({
                    x: x
                });
                if (mainSeries.dataMin < minClose) {
                    var labelY = this._getLabelPosition(this.minMax.min, mainSeries, minPontIndex, false);
                    if (labelY > y) {
                        this.minMax.min.show().attr({
                            y: labelY
                        })
                    }
                }


            }

            if (xMax) {
                var maxValue = infChart.util.formatNumber(yMax, mainSeries.options.dp);// this.formatYValue(yMax);//this.getYLabel(yMax);
                y = (plotYmax < shapeHMax) ? 0 : plotYmax - shapeHMax;
                this.minMax.max.show().attr({
                    hAlign: 'left',
                    x: plotXmax - shapeWidth / 2,
                    y: y,
                    text: '' + maxValue
                });
                x = (plotXmax < 20) ? (plotXmax < (this.chart.plotLeft - shapeWidth / 2)) ? this.chart.plotLeft : plotXmax - shapeWidth / 2 :
                    ((this.minMax.max.x + this.minMax.max.width) > (this.chart.plotLeft + this.chart.plotWidth)) ? this.chart.plotLeft + this.chart.plotWidth - this.minMax.max.width : plotXmax - this.minMax.max.width / 2;

                this.minMax.max.show().attr({
                    x: x
                });
                if (mainSeries.dataMax > maxClose) {
                    var labelY = this._getLabelPosition(this.minMax.max, mainSeries, maxPointIndex, true);
                    if (labelY < y) {
                        this.minMax.max.show().attr({
                            y: labelY
                        });
                    }
                }
            }
        }
    }
};

/**
 * Return Y position of the label as label not overlap with series
 * @param label
 * @param series
 * @param xposition
 * @param isAbove
 * @returns {*}
 */
infChart.StockChart.prototype._getLabelPosition = function (label, series, xposition, isAbove) {

    function getLabelYPosition(labelDirection, searchDirection, labelWidth, labely, labelx, seriesLast) {
        var i = xposition;
        while (i != seriesLast) {
            var previousPoint = series.points[i];
            i += searchDirection;
            var point = series.points[i];
            if ((Math.abs(i - xposition) > 1 && ((labelx - point.plotX - labelWidth) * searchDirection) < 0) || ((previousPoint.plotX - labelx) * searchDirection > 0)) {
                break;
            } else if (((labely - point.plotY) * labelDirection) < 0) {
                //continue;
            } else {
                var slopeToPoint = (previousPoint.plotY - point.plotY) / (previousPoint.plotX - point.plotX);
                var slopeToLabel = (previousPoint.plotY - labely) / (previousPoint.plotX - labelx);

                if (Math.abs(slopeToLabel) > Math.abs(slopeToPoint)) {
                    //continue;
                } else {
                    if ((point.plotX - labelx) * searchDirection <= 0) {
                        labely = point.plotY;
                    } else {
                        labely = point.plotY + slopeToPoint * (labelx - point.plotX);
                    }
                }
            }
        }

        return labely;
    }

    var labely = label.y + label.height;

    if (isAbove) {
        labely = label.y + label.height;
        /*Backward search for overlaps */
        labely = getLabelYPosition(1, -1, label.width, labely, label.x, 0);
        /*Forward search for overlaps */
        labely = getLabelYPosition(1, 1, label.width, labely, label.x + label.width, series.points.length - 1);
        labely = labely - label.height;

    } else {

        labely = label.y;
        /*Backward search for overlaps */
        labely = getLabelYPosition(-1, -1, label.width, labely, label.x, 0);
        /*Forward search for overlaps */
        labely = getLabelYPosition(-1, 1, label.width, labely, label.x + label.width, series.points.length - 1);
    }
    return labely;
};

//endregion =====================end of TShow Min/Max===================================================================

//region =====================Crosshair=================================================================================

infChart.StockChart.prototype.setCrosshair = function (type) {
    if (type == "none") {
        this.crosshair.enabled = false;
        this.crosshair.type = 'none';
    } else {
        type = (type) ? type : 'all';
        this.crosshair.type = type;
        this.crosshair.enabled = true;
    }
    if (this._isToolbarEnabled()) {
        infChart.drawingsManager.setActiveSelectOption($(this.getContainer())[0], this.crosshair);
    }
};

infChart.StockChart.prototype.isDefaultCrosshairEnabled = function (axis) {
    return this.crosshair.enabled && axis && (axis.isXAxis || (!axis.isXAxis && this.crosshair.type != 'last'));
};

infChart.StockChart.prototype.isCrosshairEnabled = function (axis) {
    return (this.chart && ((this.chart.annotations && this.chart.annotations.tradingMode) || (!this.chart.annotations || this.chart.annotations.allowZoom))) && this.crosshair.enabled;
};

infChart.StockChart.prototype.isLastCrosshair = function () {
    return this.crosshair.enabled && this.crosshair.type == 'last';
};

infChart.StockChart.prototype.updateCrosshair = function (x, y, point, yAxis, event) {
    var that = this;
    var crosshairTheme = Highcharts.theme && Highcharts.theme.crosshair || {
            lineColor: "#ffffff",
            label: {
                color: "#ffffff",
                fill: "rgba(80, 80, 80, 1.00)"
            }
        };

    if (!(y <= this.chart.plotSizeY && y >= 0 /*&& x <= this.chart.plotSizeX && x>=0*/)) {
        this.showCrosshair(false);
        return;
    }
    if (this.crosshair.type == 'all' && !(yAxis.top <= y && (yAxis.top + yAxis.height) >= y)) {
        return; // To avoid replacing main axis' crosshair label from indicator axis values
    }

    if (!that.chart.annotations.tradingMode && this.crosshair.type == 'last') {
        try {
            if (!point || point.series.options.id != "c0") {
                if (this.chart.hoverPoints && this.chart.hoverPoints.length > 0) {
                    infChart.util.forEach(this.chart.hoverPoints, function (i, val) {
                        if (val.series.options.id == "c0") {
                            point = val;
                        }
                    });
                }
                if (!point) {
                    point = this.chart.pointer.findNearestKDPoint([this.getMainSeries()], false, event);
                }
            }

            if (point && point.series.options.id == "c0") {
                var plotVal = (point.plotClose != undefined) ? point.plotClose : point.plotY;
                var labelVal = that.formatValue((( point.close != undefined ) ? point.close : point.y), that.getMainSeries().options.dp, undefined, true, false);
                if (!that.crosshair.y) {
                    that.crosshair.y = that.chart.renderer.path(['M', 0, plotVal, 'H', yAxis.width + yAxis.left])
                        .attr({
                            'stroke-width': 0.5,
                            "zIndex": 3,
                            stroke: crosshairTheme.lineColor
                        }).add();
                    that.crosshair.yLabel = that.chart.renderer.label(labelVal, null, null, "callout", undefined, undefined, true)
                            .addClass('highcharts-crosshair-label-container')
                        .attr({
                            align: "right",
                            zIndex: 20,
                            padding: 3,
                            r: 1,
                            fill: crosshairTheme.label.fill
                        })
                        .css({
                            color: crosshairTheme.label.color,
                            "font-size": '11px'
                        }).add();
                } else {
                    that.crosshair.y.show().attr({
                        d: ['M', 0, plotVal, 'H', yAxis.width + yAxis.left]
                    });
                    // that.crosshair.yLabel.show();
                }
                //var posx = yAxis.opposite ? yAxis.width + yAxis.left : 0,
                //    posy = plotVal - 10;

                this._setPositionsForCalloutLabel(that.crosshair.yLabel, labelVal, yAxis, plotVal);

            }
        }
        catch (x) {
            infChart.util.console.error(x);
        }
    }
    /* else {
     var yPx = y;
     if (!that.crosshair.yLabel) {

     /!*that.crosshair.y = that.chart.renderer.path(
     ['M', 0, yPx, 'H', that.chart.chartWidth]
     ).attr({
     "zIndex": 3,
     'stroke-width': 0.5,
     stroke: crosshairTheme.lineColor
     }).add();
     *!/
     that.crosshair.yLabel = that.chart.renderer.label('').attr({
     "zIndex": 20,
     padding: 5,
     paddingTop: 10,
     r: 1,
     fill: crosshairTheme.label.fill
     }).css({
     color: crosshairTheme.label.color,
     "font-size": '11px'
     }).add();

     } else {

     /!*that.crosshair.y.attr({
     d: ['M', 0, yPx, 'H', that.chart.chartWidth/!*, yPx*!/]
     });*!/

     var yValue = (that.chart.annotations.tradingMode) ? this.getYLabel(yAxis.toValue(y, true), false, true, true) :
     (infChart.util.isSeriesInBaseAxis(yAxis.options.id)) ? this.getYLabel(yAxis.toValue(y, true)) : this.formatYValue(yAxis.toValue(y, false), false);

     that.crosshair.yLabel.show().attr({
     hAlign: 'right',
     vAlign: 'bottom',
     x: yAxis.left + yAxis.width,
     y: y - 10,
     text: '' + yValue
     });
     }
     this.crosshair.yLabel.show().attr({
     x: yAxis.right + yAxis.width - this.crosshair.yLabel.width
     });
     }*/


};

infChart.StockChart.prototype.updateCrosshairFromToolTip = function (x, y, pointArr) {
    var that = this;
    if (this.crosshair.enabled && this.crosshair.type == 'last') {
        infChart.util.forEach(pointArr, function (i, point) {
            if (point && point.series.options.id == "c0") {
                that.updateCrosshair(x, y, point.point, point.series.yAxis);
                return;
            }
        });
    }
};

/**
 * Display/hide crosshair
 * @param {boolean} visibility - crosshair visibility to set
 */
infChart.StockChart.prototype.showCrosshair = function (visibility) {
    if (this.crosshair.y) {
        if (visibility) {
            this.crosshair.y.show();
            this.crosshair.yLabel.show();
        } else {
            this.crosshair.y.hide();
            this.crosshair.yLabel.hide();

        }
    }
};

//endregion =====================end of Crosshair===================================================================

//region ==========================Print===================================================================
///**
// * print or save chart as an image according to requested type
// * @param type
// * @param afterPrint
// */
//infChart.StockChart.prototype.exportChart = function (type, afterPrint) {
//    var _self = this;
//
//    function _exportChart() {
//        switch (type) {
//            case 'print':
//                //this.chart.print();
//                _self.printChart(afterPrint);
//                break;
//            default:
//                _self.exportChartToImage(type);
//                break;
//        }
//    }
//
//    if (infChart.util.isSafari() && infChart.util.isFullscreenMode()) {
//        _self._addFullscreenListeners("exit", _exportChart);
//        document.cancelFullScreen();
//    } else {
//        _exportChart();
//    }
//};

/**
 * export Chart as an image
 * ***since highchart's exporting doesn't work properly we use a custom method to export chart as a png***
 * @param afterPrint
 */
infChart.StockChart.prototype.printChart = function (afterPrint) {

    var chart = this.chart,
        container = chart.container,
        origDisplay = [],
        origParent = container.parentNode,
        body = document.body,
        childNodes = body.childNodes;

    if (chart.isPrinting) { // block the button while in printing mode
        return;
    }
    this.printEl = [];
    this._setElementsToChartBeforePrint();
    chart.isPrinting = true;

    //fireEvent(chart, 'beforePrint');

    // hide all body content
    infChart.util.forEach(childNodes, function (i, node) {
        if (node.nodeType === 1) {
            origDisplay[i] = node.style.display;
            node.style.display = 'none';
        }
    });

    // pull out the chart
    body.appendChild(container);

    // print
    window.focus(); // #1510
    window.print();
    var chartObj = this;

    var onClosePrintWindow = function () {
        // put the chart back in
        origParent.appendChild(container);

        // restore all body content
        infChart.util.forEach(childNodes, function (i, node) {
            if (node.nodeType === 1) {
                node.style.display = origDisplay[i];
            }
        });

        chartObj._removeElementsFromChartAfterPrint();

        if (afterPrint) {
            afterPrint.apply(chart, []);
        }

        chart.isPrinting = false;
    };
    var ua = navigator.userAgent.toLowerCase();
    var isSafari = (ua.indexOf("safari") != -1 && ua.indexOf('chrome') == -1);

    if (isSafari) {
        /* To fix the issue of printing everything in the Safari.*/
        // allow the browser to prepare before reverting
        setTimeout(function () {
            onClosePrintWindow();
        }, 1000);
    }
    else {
        onClosePrintWindow();
    }
};

/**
 * get svg without right panel
 * @returns {object} svg
 */
infChart.StockChart.prototype._getSVG = function () {
    var container = $(this.getContainer());
    var svg = container.find("svg")[0];

    if (this.isRightPanelOpen()) {
        this.toggleRightPanel();
        svg = container.find("svg")[0];
        this.toggleRightPanel();
    }

    return svg;
};

/**
 * Set HTML elements to svg before printing
 * @private
 */
infChart.StockChart.prototype._setElementsToChartBeforePrint = function () {
    var container = $(this.getContainer()),
        svg = this._getSVG(),
        svgSize = svg.getBoundingClientRect(),
        chart = this,
        y,
        x = 10;

    this.printEl = [];

    this.attachCssToSvg(svg);

    $.each(container.find("[inf-legend] [inf-series]"), function (i, ele) {
        var series = chart.chart.get($(ele).attr("inf-series"));
        if (!y) {
            y = chart.chart.legend.itemY;
        }
        if ((x + $(ele).width()) > svgSize.width) {
            x = 10;
            y += $(ele).height();
        }
        var rect = chart.chart.renderer.rect(x, 0, 5, parseInt($(ele).css('font-size')), 0).attr({
            zIndex: 10,
            fill: series.options.color
        }).add();
        var text = chart.chart.renderer.text('<span style="color:' + $(ele).css('color') + '; font-weight:lighter; padding-left:5px; "> ' + series.options.name + '</span>', x + 6, (parseInt($(ele).css('font-size')) - y)).
        attr({zIndex: 10}).add();

        chart.printEl.xPush(rect);
        chart.printEl.xPush(text);

        x += (rect.getBBox().width + text.getBBox().width + 2);
    });
    /* Set range */
    if (chart.isHistoryEnabled() && chart.chart.options.navigator.series) {
        var navigator = chart.chart.get(chart.chart.options.navigator.series.id);
        if (navigator && chart.rangeSelectorEl) {
            var textY = svgSize.height - navigator.clipBox.height + chart.fromDatePicker.height();

            var color = chart.fromDatePicker.css('color');

            chart.printEl.xPush(chart.chart.renderer.text('<span style="color:' + color + '; font-weight:lighter; padding-left:5px; "> ' + chart.fromDatePicker.val() + '</span>', 10, textY).
                attr({zIndex: 10}).add());
            chart.printEl.xPush(chart.chart.renderer.text('<span style="color:' + color + '; font-weight:lighter; padding-left:5px; "> ' + chart.toDatePicker.val() + '</span>', 10 + chart.toDatePicker.width(), textY).
                attr({zIndex: 10}).add());

        }
    }
    //add background #CCA-2968
    if (this._hasRegisteredMethod('getCustomElementsForPrint')) {
        var customElements = this.settings.registeredMethods.getCustomElementsForPrint.call(chart);
        $.each(customElements, function (i, element) {
            chart.printEl.xPush(element);
        });
    }

    this.chart.xOnUrlChange && this.chart.xOnUrlChange("");
};

/**
 * Remove attached elements and css from the chart after printing
 * @private
 */
infChart.StockChart.prototype._removeElementsFromChartAfterPrint = function () {
    var chart = this,
        container = $(this.getContainer()),
        svg = container.find("svg")[0],
        style = svg.getElementById(this.id + "svgStyle");

    /* remove elements added for image */
    infChart.util.forEach(chart.printEl, function (key, renderedObj) {
        renderedObj.destroy();
    });

    chart.printEl = [];

    chart.chart.xOnUrlChange && chart.chart.xOnUrlChange(infChart.util.getBaseURL() || "");

    if (style) {
        style.parentNode.xRemoveChild(style);
    }

};

/**
 * Attach css needed to the svg in a seperatefile
 * @param svg
 */
infChart.StockChart.prototype.attachCssToSvg = function (svg) {
    var style = document.createElement('style'),
        cssMap = infChart.util.getStylesWithCls(["inf-chart", "highcharts"]),
        cssStr = '';

    style.type = 'text/css';
    style.id = this.id + "svgStyle";

    for (var cls in cssMap) {
        if (cssMap.hasOwnProperty(cls)) {
            cssStr += " " + cssMap[cls];
        }
    }
    //region computed styles
    //uncomment this section if computed styles of the element need to be attached
    /*
     function getNodeStyle(sourceNode) {
     var computedStyle = window.getComputedStyle(sourceNode),
     styleStr = "";

     Array.from(computedStyle).forEach(function (key) {
     styleStr += ";" + key + ":" + computedStyle.getPropertyValue(key);
     });
     return styleStr;
     }

     cssStr += " svg {" + getNodeStyle(svg) + "}";*/
    //endregion
    style.innerHTML = cssStr;
    var defs = svg.getElementsByTagName("defs");

    defs && defs[0].appendChild(style);

};

/**
 * repace annotation clip-path attribute
 * @param {object} svg - svg object
 */
infChart.StockChart.prototype._replaceAnnotationClipPath = function(svg) {
    var clipPathElements = $(svg).find('g[clip-path]');
    $.each(clipPathElements, function (id, item) {
        if ($(item).attr('clip-path') !== 'none') {
            var clipPath = $(item).attr('clip-path').replace('url(','').replace(')','').replace(/\"/gi, "").split("#")[1];
            $(item)[0].setAttribute('clip-path', "url(#" + clipPath + ")");
        }
    });
};

/**
 * export the chart as binary data
 * @returns {string} - binary data
 */
infChart.StockChart.prototype.exportChartAsBinaryData = function(){
    var chart = this;

    chart.printEl = [];
    chart._setElementsToChartBeforePrint();
    var source = chart._getSVGData();
    chart._removeElementsFromChartAfterPrint();

    return window.btoa(unescape(encodeURIComponent(source)));
};

/**
 * get svg data
 * @returns {string} svg data
 */
infChart.StockChart.prototype._getSVGData = function () {
    var svg = this._getSVG();

    this._replaceAnnotationClipPath(svg);
    //get svg source.
    var serializer = new XMLSerializer();
    var source = serializer.serializeToString(svg);
    //add name spaces.
    if (!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
        source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
    }
    if (!source.match(/^<svg[^>]+"http\:\/\/www\.w3\.org\/1999\/xlink"/)) {
        source = source.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
    }
    //add xml declaration
    source = '<?xml version="1.0" standalone="no"?>\r\n' + source;

    //convert svg source to URI data scheme.
    return source;
};

infChart.StockChart.prototype.exportChartToImage = function (type) {
    var chart = this;

    this.printEl = [];
    this._setElementsToChartBeforePrint();
    function removePrintEl() {
        chart._removeElementsFromChartAfterPrint();
    }

    var source, url, dataUrl, svgData, canvas, ctx, img;
    switch (type) {
        case 'svg':
            source = chart._getSVGData();
            url = dataUrl = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(source);
            break;
        default:
            var container = $(this.getContainer());
            var svg = this._getSVG();
            var svgSize = svg.getBoundingClientRect();

            svgData = chart._getSVGData();
            canvas = document.createElement("canvas");
            canvas.width = svgSize.width * 1/(this.chart.infScaleX ? this.chart.infScaleX : 1);
            canvas.height = svgSize.height * 1/(this.chart.infScaleY ? this.chart.infScaleY : 1);

            ctx = canvas.getContext("2d");
            break;
    }

    if (infChart.util.isIE()) {
        if (!infChart.util.isIEBelow10()) {
            if (type == 'svg') {
                var blobObject = new Blob([source]);
                window.navigator.msSaveBlob(blobObject, 'chart.svg'); // The user only has the option of clicking the Save button.
            } else {
                canvg(canvas, svgData);
                infChart.util.saveCanvasAsBlob(canvas, type);
            }
            removePrintEl();
        } else {
            canvg(canvas, svgData);
            img = document.createElement("img");
            url = (type != 'svg') ? canvas.toDataURL("image/" + type) : url;
            img.onload = function () {

                if (type != 'svg') {
                    dataUrl = canvas.toDataURL("image/" + type);
                }
                removePrintEl();
                var a = $("<a>")
                    .attr("href", dataUrl).attr("target", "_blank")
                    .attr("download", "img." + type)
                    .appendTo("body");

                a[0].click();
            };
            img.setAttribute("src", url);
            /* alert('Please upgrade you browser to IE10 or above');*/
        }
    } else {

        img = document.createElement("img");
        img.onload = function () {
            if (type != 'svg') {
                ctx.drawImage(img, 0, 0);
                dataUrl = canvas.toDataURL("image/" + type);
            }
            removePrintEl();
            var a = $("<a>")
                .attr("href", dataUrl).attr("target", "_blank")
                .attr("download", "img." + type)
                .appendTo("body");

            a[0].click();
            //a.remove();
        };

        url = (type != 'svg') ? "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData))) : url;

        img.setAttribute("src", url);
    }
};


//endregion===================end of Print===================================================================

//region =====================Streaming=================================================================================

/**
 * Check whether given tick has valid data
 * @param tickData
 * @returns {boolean|Array}
 * @private
 */
infChart.StockChart.prototype._isValidTick = function (tickData) {
    var data = [], chartSym;
    if (this.checkEquivalentSymbols(this.symbol, tickData)) {
        data = this.data.base;
        chartSym = this.symbol;
    } else if (this._isCompareSymbol(tickData)) {
        data = this.data.compare[tickData.symbolId];
        chartSym = this.compareSymbols.symbols[tickData.symbolId];
        if(chartSym){
            chartSym = this._validateComapareTick(tickData);
        }
    } else if (this._isIndicatorSymbol(tickData)){
        data = this.data.indicator[tickData.symbolId];
        chartSym = this.indicatorSymbols.symbols[tickData.symbolId];
    }

    if (!chartSym) {
        return false;
    }

    /* if (this.dataManager.isRequestInProgress(chartSym, this.interval, this.regularIntervalsOnUpdate)) {
     return false;
     }*/

    var regularIntervalsOnUpdate = this.regularIntervalsOnUpdate,
        chartTime = this.dataManager.getChartTime(tickData.dateTime, tickData.timeZoneOffset, this.interval),
        currentTickTime = (data && data[data.length - 1] && data[data.length - 1][0]) || 0,
        prevTickTime = currentTickTime && this.dataManager.getNextTickTime(currentTickTime, this.interval, true);

    return (tickData && !isNaN(tickData.close) && !isNaN(chartTime) &&
    ((currentTickTime && currentTickTime <= chartTime) || (
        !data || data.length == 0
    ) || (regularIntervalsOnUpdate && chartTime > prevTickTime)));
};

infChart.StockChart.prototype._validateComapareTick = function (tickData) {
    return this.chart.series[0].xData[this.chart.series[0].xData.length - 1] >= tickData.dateTime;
};

/**
 * To Update chart realtime
 * @param data format is as follows
 * {
    symbol : 'IBEX35', // symbol name
    symbolId : 'ES0SI0000005_indices_55_df', // symbol id
    close : 9500,
    dateTime : Date.UTC(2017,1,7,17,10,10),
    volume : 100
   }
 */
infChart.StockChart.prototype.addTick = function (data) {
    if (!this._isValidTick(data)) {
        console.log("Invalid Tick");
        return;
    }

    var rawData;
    if (this.checkEquivalentSymbols(this.symbol, data)) {
        rawData = this.rawData.base;
    } else if (this._isCompareSymbol(data)) {
        rawData = this.rawData.compare[data.symbolId];
    } else if (this._isIndicatorSymbol(data)) {
        rawData = this.rawData.indicator[data.symbolId];
    }

    var from, to;
    if(this.period === 'C' && typeof this.range !== 'undefined'){
        from = this.range.fromDate;
        to = this.range.toDate;
    }

    this.dataManager.addTick(data, from, to, this.interval, this.regularIntervalsOnUpdate, rawData, this.id);

    infChart.util.console.debug(this, " addTick >>" + data.symbolId);

    var chartObj = this;
    if (!chartObj.updateTicksTimer) {
        //if (chartObj.data.base.length > 0) {
        if (chartObj.chart && !chartObj.isUserInteractionInprogress()) {
            chartObj.updateTicksTimer = setTimeout(function () {
                if (!chartObj.isUserInteractionInprogress()) {
                    try {
                        chartObj._updateTicks();
                    }
                    catch (err) {
                        infChart.util.console.error("_updateTicks", err, chartObj.chart.renderTo.id);
                    }
                    finally {
                        chartObj.updateTicksTimer = undefined;
                    }
                } else {
                    chartObj.updateTicksRequiredAfterUserInteraction = true;
                }

            }, chartObj.settings.config.tickUpdateDelay);
        } else {
            chartObj.updateTicksRequiredAfterUserInteraction = true;
        }
        //}
        // chartObj.updateTicksTimer = setTimeout(function () {
        //     if (chartObj.data.base.length > 0) {
        //         if (chartObj.chart && !chartObj.isUserInteractionInprogress()) {
        //             console.debug("chartObj.chart.mouseIsDown :" + chartObj.chart.mouseIsDown + " , chartObj.chart.activeAnnotation :" + chartObj.chart.activeAnnotation);
        //             chartObj._updateTicks();
        //         } else {
        //             chartObj.updateTicksRequiredAfterUserInteraction = true;
        //         }
        //     }
        //     chartObj.updateTicksTimer = undefined;
        // }, chartObj.settings.config.tickUpdateDelay);
    }
};



infChart.StockChart.prototype.isUserInteractionInprogress = function () {
    return (this.chart && this.chart.activeAnnotation && this.chart.mouseIsDown != "mousedown") || this.chart.annotationChangeInProgress || this.chart.isChartDragging;
};

infChart.StockChart.prototype.onAnnotationRelease = function () {
    if (this.updateTicksRequiredAfterUserInteraction) {
        this._updateTicks();
        this.updateTicksTimer = undefined;
    }
};

infChart.StockChart.prototype.onDocumentMouseUp = function () {
    if (this.updateTicksRequiredAfterUserInteraction) {
        this._updateTicks();
        this.updateTicksTimer = undefined;
    }
};

/**
 * Check whether given two symbols are equivalent
 * @param {symbol} symbol1
 * @param {symbol} symbol2
 * @returns {boolean}
 */
infChart.StockChart.prototype.checkEquivalentSymbols = function (symbol1, symbol2) {
    return symbol1 && symbol2 && symbol1.symbolId === symbol2.symbolId;
};

/**
 * check if symbol is a compare symbol
 * @param {symbol} symbol
 * @returns {boolean}
 */
infChart.StockChart.prototype._isCompareSymbol = function (symbol) {
    var status = false, self = this;
    for (var symbolId in self.compareSymbols.symbols) {
        if (self.compareSymbols.symbols.hasOwnProperty(symbolId) && self.checkEquivalentSymbols(self.compareSymbols.symbols[symbolId], symbol)) {
            status = true;
            break;
        }
    }
    return status;
};

infChart.StockChart.prototype._isIndicatorSymbol = function(symbol){
    var status = false, self = this;
    for (var symbolId in self.indicatorSymbols.symbols) {
        if (self.indicatorSymbols.symbols.hasOwnProperty(symbolId) && self.checkEquivalentSymbols(self.indicatorSymbols.symbols[symbolId], symbol)) {
            status = true;
            break;
        }
    }
    return status;
}

infChart.StockChart.prototype._getSymbols = function (addLastTime) {
    var that = this,
        sym,
        symbols = [this.symbol],
        compareSyms = this.compareSymbols.symbols,
        symbolData,
        symbolDataMap,
        lastIdx,
        lastTick,
        prevLast,
        prevLastTime
        ;
    for (var sk in compareSyms) {
        if (compareSyms.hasOwnProperty(sk)) {
            sym = compareSyms[sk];
            symbolData = that.data.compare[sym.symbolId] || [];
            symbolDataMap = that.dataMap.compare[sym.symbolId];
            lastIdx = symbolData.length - 1;
            lastTick = symbolData[lastIdx];
            prevLast = symbolData[lastIdx - 1];
            prevLastTime = prevLast && prevLast[0];

            symbols.push($.extend(compareSyms[sk], {lastTime: lastTick && lastTick[0], prevLastTime: prevLastTime}));
        }
    }
    return symbols;
};

/**
 * Update Recently added ticks to the chart
 */
infChart.StockChart.prototype._updateTicks = function () {
    this.updateTicksRequired = false;
    this.updateTicksRequiredAfterUserInteraction = false;

    var that = this,
        lastIdx = that.data.base.length - 1,
        lastTick = that.data.base[lastIdx],
        prevLast = that.data.base[lastIdx - 1],
        prevLastTime = prevLast && prevLast[0],
        ticks = this.dataManager.getNewTicks(prevLastTime || lastTick && lastTick[0], this.interval, this._getSymbols(true), this.regularIntervalsOnUpdate),
        baseSymbolTicks = [],
        compareSymbolTicks = {},
    // extremes = this.getRange(),
        i,
        iLen,
        temptick,
        lastTime = lastTick && lastTick[0] || 0,
        hasUpdates = false,
        tickInterval = this.intervalOptions[this.interval] && this.intervalOptions[this.interval].time,
        symbolData,
        symbolDataMap,
        redrawRequired,
        startingLength,
        prevSeriesLast;

    console.debug(this.id + "update ticks : prevLastTime || lastTick && lastTick[0] ::" + new Date(prevLastTime || lastTick && lastTick[0]));

    if (ticks) {
        var isBaseSymbolUpdated = false,
            updatedTimes = {},
            oneAdded = false;

        infChart.util.forEach(ticks, function (symbol, val) {
            var data = val.data,
                isBase = false;
            symbolData = undefined;
            symbolDataMap = undefined;
            oneAdded = false;

            if (that.symbol.symbolId == data.symbol) {
                isBase = true;
                if (that.data.base) {

                    symbolData = that.data.base;
                    symbolDataMap = that.dataMap.base;

                }
            }
            else {
                symbolData = that.data.compare[data.symbol];
                symbolDataMap = that.dataMap.compare[data.symbol];
                if (symbolData) {
                    lastIdx = symbolData.length - 1;
                    lastTick = symbolData[lastIdx];
                    prevLast = symbolData[lastIdx - 1];
                    prevLastTime = prevLast && prevLast[0];

                    compareSymbolTicks[data.symbol] = [];
                }
            }

            if (symbolData) {

                startingLength = symbolData.length;

                prevSeriesLast = lastTime = lastTick && lastTick[0] || 0;

                for (i = 0, iLen = val.newTicks.length; i < iLen; i++) {

                    //oneAdded = false;
                    if (prevLastTime == val.newTicks[i] || !isBase && !that.filterCurrentCompareTicks(val.newTicks[i])) {
                        continue;
                    }

                    redrawRequired = true;

                    var lastTimeNextTick = that.dataManager.getNextTickTime(lastTime, that.interval);
                    console.debug(that.id + "update ticks : symbol :: " + data.symbol + ", val.newTicks[i] ::" + new Date(val.newTicks[i]) + "  lastTime::" + new Date(lastTime) + "  lastTimeNextTick :: " + new Date(lastTimeNextTick) + "  tickInterval : " + tickInterval + "  (lastTime - val.newTicks[i])::" + (lastTime - val.newTicks[i]));

                    if (!that.regularIntervalsOnUpdate /*&& !that.dataMap.base[val.newTicks[i]]*/ &&
                        ((lastTime >= val.newTicks[i] && (lastTime - val.newTicks[i]) < tickInterval) ||
                        (lastTime < val.newTicks[i] && (val.newTicks[i] - lastTimeNextTick) < tickInterval) ||
                        (val.newTicks[i] == lastTimeNextTick))) {

                        console.debug(that.id + "update ticks :replaced");
                        symbolData.splice(lastIdx, 1);
                        delete symbolDataMap[lastTime];
                        lastIdx--;
                        lastTick = symbolData[lastIdx];
                        lastTime = lastTick && lastTick[0] || 0;
                    }

                    if (!data.dataMap[val.newTicks[i]]) {
                        continue; // TODO :: check why this is undefined.
                    }

                    if (!symbolDataMap[val.newTicks[i]] && lastTime < val.newTicks[i]) {

                        isBaseSymbolUpdated = true;
                        hasUpdates = true;
                        temptick = data.dataMap[val.newTicks[i]].slice();
                        symbolData.xPush(temptick);
                        if (isBase) {
                            baseSymbolTicks.xPush(temptick);
                        } else {
                            compareSymbolTicks[data.symbol].push(temptick);
                        }
                        symbolDataMap[val.newTicks[i]] = temptick;
                        lastTime = val.newTicks[i];
                        lastIdx = symbolData.length - 1;
                        //lastIdx = baseSymbolTicks.length - 1; //TODO :: check why?
                        oneAdded = true;
                        updatedTimes[lastTime] = {isUpdated: false};

                    } else if (lastTime == val.newTicks[i]) {
                        isBaseSymbolUpdated = true;
                        updatedTimes[lastTime] = {isUpdated: !oneAdded};
                        temptick = data.dataMap[val.newTicks[i]].slice();

                        symbolData[lastIdx] = temptick;
                        if (isBase) {
                            baseSymbolTicks.xPush(temptick);
                        } else {
                            compareSymbolTicks[data.symbol].push(temptick);
                        }
                        symbolDataMap[val.newTicks[i]] = temptick;
                    } else {
                        console.debug(that.id + "update ticks : symbol :: " + data.symbol + ", symbolData last item removed")
                    }

                }
            }
        });

        if (/*that.data.base && that.data.base.length > 0 &&*/ redrawRequired) {

            if (!lastTick) {
                that._showNoData(false);
            }
            that.maxRangeVal = this.getMaxDisplayTime();

            console.debug(this.id + "update ticks : that.maxRangeVal ::" + new Date(that.maxRangeVal));

            this._updateFromTicks(true); // update new ticks only

            this._setChartToMaxPossiblePeriod(true);

            if (isBaseSymbolUpdated) {
                this._fireEventListeners("onUpdateChartTick", [baseSymbolTicks, compareSymbolTicks], true);
                this._fireRegisteredMethod('onUpdateChartTick', [baseSymbolTicks, updatedTimes]);
            }
            if (this.tooltip || this.crosshair.enabled) {
                if (this.chart.infMouseIn && this.chart.infLastMouseMoveEvent) {
                    this.chart.container.dispatchEvent.call(this.chart.container, this.chart.infLastMouseMoveEvent);
                } else {
                    this.tooltip && this.updateTooltipToLastPoint(true);
                }
            }
        }
    }
};

infChart.StockChart.prototype.filterCurrentCompareTicks = function (tickTime) {
    var that = this,
        chart = that.chart,
        series = chart.series[0],
        xData = series.xData,
        isValid = false;

    for (i = 0, iLen = xData.length; i < iLen; i++) {
        var val = xData[i];
        if (val === tickTime){
            isValid = true;
            break;
        }
    }

    return isValid;
};

/**
 * If price formatters need to be re-apply use this method from outside. Which ever the listeners listen on this (onReApplyFormatters)
 * will get executed once this is called
 * Applied a wait time since this is called from real-time updates of chart widget in xinfinit app
 */
infChart.StockChart.prototype.reApplyFormatters = function () {

    var self = this,
        applyListeners = function () {
            self._fireEventListeners('onReApplyFormatters');
            self.reApplyFormattersRequired = false;
        };

    if (!self.waitForReApplyFormatters) {
        applyListeners();
        self.waitForReApplyFormatters = true;
        setTimeout(function () {
            if (self.reApplyFormattersRequired) {
                applyListeners();
            }
            self.waitForReApplyFormatters = false;
        }, 1000);
    } else {
        self.reApplyFormattersRequired = true;
    }
};


//endregion =====================end of Streaming===================================================================

//region =====================Indicator=================================================================================

/**
 * Method to add new Indicator
 * @param {string} type indicator type
 * @param {object} config indicator config
 * @param {boolean} redraw indicate redrow or not
 * @param {boolean} isNewConfig is property change
 * @param {string} indicatorId specific id if needed
 * @param {number|undefined} index - specific place to position the indicator if needed (used in _indicatorsDissimilerToBaseAxes)
 * @returns {infChart.Indicator} new indicator
 */
infChart.StockChart.prototype.addIndicator = function (type, config, redraw, isNewConfig, indicatorId, index) {

    if (typeof redraw == "undefined") {
        redraw = true;
    }

    var iChart = this, maxCount = (this.settings && this.settings.config.maxIndicatorCount);

    if (infChart.indicatorMgr.hasMaxIndicatorCountReached(this.id, maxCount, type)) {
        infChart.util.showMessage(this.id, infChart.manager.getLabel("msg.indicatorLimitExceeded").replace("{0}", maxCount));
        return;
    }

    var indicator = infChart.indicatorMgr.createIndicator(this.id, type, config, indicatorId, index);
    var parallelToBase = infChart.util.isSeriesInBaseAxis(indicator.getAxisId()) || infChart.indicatorMgr.isParallelToBaseAxes(this.id, indicator);

    if (indicator && indicator.includeSymbol) {
        if (indicator.symbol) {
            this.indicatorSymbols.count++;
            this.indicatorSymbols.symbols[indicator.symbol.symbolId] = indicator.symbol;
            this.indicatorSymbols.idMap[indicator.id] = indicator.symbol;
        }
    }
    // this.setYAxisExtremes(false);
    this._setIndicatorFrames(false);

    //if (this.interval === 'T') {
    /*$.each(indicator.series, function (idx, series) {
     series.update({dataGrouping: {enabled: false}}, false);
     });*/

    //}

    var indData = this.getDataForIndicators(indicator),
        baseData = indData.base && indData.base.ohlcv && indData.base;

    this.updateIndicatorData(baseData, indicator, config, indData);


    indicator.loadSettingWindow(true);

    indicator.setIndicatorReady(true);

    if (infChart.indicatorMgr.getNotSingletonIndicatorCount(this.id) === 1) {
        infChart.toolbar.setSelectedControls(this.id, "indicator", true);
    }
    indicator.updateLegendColor();

    if (redraw) {
        this.chart.redraw();
    }

    if (isNewConfig) {
        this._onPropertyChange("indicators", {id: indicator.id, type: indicator.type, action: 'add'});
    }

    function afterChartRedraw() {

        iChart._setLabels();
        iChart.updateMinMax();//todo : required?????
        //iChart.scaleDrawings(iChart.id);

        if (!parallelToBase) {
            iChart.onBaseAxisResize();
        } else if (redraw) {
            iChart.onBaseAxisScaled();
        }

        if (!iChart.isFirstLoadInprogress() && iChart.isResizeRequired()) {
            iChart.resizeChart();
        }
    }
    if (indicator && indicator.includeSymbol) {
        this._fireEventListeners("onAddIndicator", this.symbol);
    }

    if (redraw) {
        afterChartRedraw();
    } else {
        this.registerForEvents("onReadHistoryDataLoad", afterChartRedraw);
    }
    return indicator;
};

infChart.StockChart.prototype.updateIndicatorData = function(baseData, indicator, config, indData){
    if (baseData && baseData.ohlcv && baseData.data && baseData.data.length && !indicator.blockUpdateForMainSymbol) {
        indicator.calculate(baseData.ohlcv, baseData.data, false, undefined, indData);
    } else if(indicator.blockUpdateForMainSymbol){
        if(config && config.symbol){
            if(infChart.manager.getChart(infChart.manager.getContainerIdFromChart(this.chartId)).symbol && indicator.symbol && infChart.manager.getChart(infChart.manager.getContainerIdFromChart(this.chartId)).symbol.symbolId == indicator.symbol.symbolId){
                indicator.calculate(baseData.ohlcv, baseData.data, false, undefined, indData);
            } else {
                indicator.loadIndicatorHistoryData(config.symbol, false);
            }
        } else if(indicator && indicator.symbol){
            indicator.loadIndicatorHistoryData(indicator.symbol, false);
        } else if (baseData && baseData.ohlcv && baseData.data){
            indicator.calculate(baseData.ohlcv, baseData.data);
        }
    }
};

infChart.StockChart.prototype.removeIndicator = function (indicator, isPropertyChange) {
    var si = indicator.series.length - 1;
    for (si; si >= 0; si--) {//doing this backwards as we splice the series array - https://stackoverflow.com/questions/9882284/looping-through-array-and-removing-items-without-breaking-for-loop
        var s = indicator.series[si];
        if (s && s.options.id !== indicator.id) {
            if (this.destroying) {
                infChart.indicatorMgr.removeIndicatorSeries(this.id, s.options.id);
            } else {
                this.removeSeries(s.options.id, false);
            }
        }
    }

    if (this.destroying && indicator.series.length > 0) {
        // there are unnecessary stuffs going on in the 'removeSeries' which are not needed when destroying the chart
        infChart.indicatorMgr.removeIndicatorSeries(this.id, indicator.id);
    } else if (indicator.series.length) {
        this.removeSeries(indicator.series[0].options.id, isPropertyChange);
    }
};

infChart.StockChart.prototype._setIndicatorFrames = function (redraw) {

    var iChart = this, chart = this.chart,
        y = chart.plotTop,
        height = chart.plotHeight,
        pos,
        indicatorHeight,
        mainHeight = height,
        defaultIndHPercent = 20,
        maxIndicatorPercent = 70,
        resizeHandlerHeight = Highcharts.theme && Highcharts.theme.resizeHandler.height || 4,
        yAxis = iChart.getMainYAxis();

    this.plotHeight = chart.plotHeight;

    var indicatorsDissimilerToBaseAxes = infChart.indicatorMgr.getIndicatorsDissimilarToBaseAxes(iChart.id),
        indicatorsCount = indicatorsDissimilerToBaseAxes.length, heightPercent = 0;

    infChart.util.forEach(indicatorsDissimilerToBaseAxes, function (i, indicatorId) {
        var indicator = infChart.indicatorMgr.getIndicatorById(iChart.id, indicatorId);
        if (indicator.heightPercent) {
            heightPercent += (indicator.heightPercent - 100);
        }
    });

    if (indicatorsCount > 0 || (yAxis && yAxis.height != chart.plotHeight)) {
        var tempHeightPercent = (heightPercent > defaultIndHPercent / 2) ? defaultIndHPercent / 2 : defaultIndHPercent - indicatorsCount;
        tempHeightPercent = (tempHeightPercent * indicatorsCount > maxIndicatorPercent) ? maxIndicatorPercent / indicatorsCount : tempHeightPercent;

        indicatorHeight = tempHeightPercent * height / 100;

        this.indicatorFrameHeight = indicatorHeight;
        mainHeight = height - indicatorHeight * indicatorsCount - indicatorHeight * heightPercent / 100;// - (indicatorsCount > 0 ? 20 : 0);
        pos = 0;
        var heightTotal = 0;

        infChart.util.forEach(indicatorsDissimilerToBaseAxes, function (i, indicatorId) {
            var indicator = infChart.indicatorMgr.getIndicatorById(iChart.id, indicatorId), indicatorYAxis = chart.get(indicator.getAxisId());
            var actualIndHeight = (indicator.heightPercent) ? indicatorHeight * indicator.heightPercent / 100 : indicatorHeight;
            if (indicatorYAxis) {
                indicatorYAxis.update({
                    top: mainHeight /*+ 20 */ + resizeHandlerHeight + heightTotal + chart.margin[0], // 20 - indicator title height, 4- indicator resize handler
                    height: actualIndHeight /*- 20*/ - resizeHandlerHeight
                }, false);
                heightTotal += actualIndHeight;
                pos++;
                infChart.util.forEach(indicator.series, function (i, series) {
                    series.update({}, false);
                });
            }
        });

        if (typeof redraw == 'undefined')
            redraw = false;

        yAxis.update({
            // top: 0,
            height: mainHeight
        }, false);

        //this.updateYAxis(chart.get('#1'), {
        //    // top: 0,
        //    height: mainHeight
        //}, false);


    }
    var parallelToBaseAxes = infChart.indicatorMgr.getParallelToBaseAxes(this.id);

    if (parallelToBaseAxes && parallelToBaseAxes.length > 0) {

        for (var i = 0, iLen = parallelToBaseAxes.length; i < iLen; i++) {

            var parallelAxis = chart.get(parallelToBaseAxes[i]),
                parallelAxisHeight = mainHeight * (parallelAxis.options.infHeightPercent || 0.3),
                topCorr = 1,
                parallelAxisTop = (chart.yAxis[0].top || 0) + mainHeight - parallelAxisHeight - topCorr;
            chart.get(parallelToBaseAxes[i]).update({
                top: parallelAxisTop,
                //bottom: mainHeight,
                height: parallelAxisHeight
            }, false);
        }
    }

    if (redraw) {
        chart.redraw();
    }

    this._onPropertyChange("indicatorFrames", true);

};

infChart.StockChart.prototype.removeAllIndicators = function (isPropertyChange) {
    if (infChart.indicatorMgr && this.chart) {
        var chart = this, indicators = infChart.indicatorMgr.getIndicators(chart.id);
        infChart.util.forEach(indicators, function (i, indicator) {
            chart.removeIndicator(indicator, isPropertyChange);
        });
    }
};

/**
 * Set axis labels
 */
infChart.StockChart.prototype._setLabels = function () {
    var that = this;
    if (infChart.indicatorMgr) {
        var indicatorsDissimilerToBaseAxes = infChart.indicatorMgr.getIndicatorsDissimilarToBaseAxes(this.id);
        infChart.util.forEach(indicatorsDissimilerToBaseAxes, function (key, indicatorId) {
            var indicator = infChart.indicatorMgr.getIndicatorById(that.id, indicatorId);
            var axis = that.chart && that.chart.get(indicator.getAxisId());
            if (axis) {
                that._plotter(indicator);
            }
        });
    }
    this.adjustPriceLineLabels();
    this.adjustBarClosure();
};

/**
 * Re calculate indicator values from the given index or all.
 * @param redraw
 * @param startIdx if specified, processing starts from this number
 * @param {array} recalculateTypes
 * @private
 */
infChart.StockChart.prototype._recalculateIndicators = function (redraw, startIdx, recalculateTypes, isTickUpdate) {
    if (infChart.indicatorMgr) {
        var that = this, indicators = infChart.indicatorMgr.getIndicators(that.id);
        infChart.util.forEach(indicators, function (key, indicator) {
            if (!infChart.indicatorMgr.isBlockFromMainSeriesUpdateIndicator(indicator)){
                var indData = that.getDataForIndicators(indicator, startIdx, recalculateTypes),
                    baseData = indData.base && indData.base.ohlcv && indData.base,
                    hasRecalData = false;

                recalculateTypes && recalculateTypes.forEach(function (type) {
                    if (indData.hasOwnProperty(type)) {
                        hasRecalData = true;
                    }
                });

                if ((!recalculateTypes || hasRecalData) && baseData && baseData.ohlcv && baseData.data && baseData.data.length) {
                    indicator.calculate(baseData.ohlcv, baseData.data, redraw, undefined, indData);
                }
            } else if(isTickUpdate) {
                var data = that._getUpdatedDataForSymbol(indicator.symbol);
                indicator.calculate(undefined, data, redraw);
            }
        });
    }
};

infChart.StockChart.prototype._getUpdatedDataForSymbol = function(symbol){
    var key = this.dataManager.getKeyToGetData(symbol, this.interval, this.regularIntervalsOnUpdate);
    var data = this.dataManager.getData(key, this.interval);
    return data.data;
};

/**
 * Re calculate indicator values from the given index or all.
 * @param redraw
 * @param startIdx if specified, processing starts from this number
 * @private
 */
infChart.StockChart.prototype._recalculateDynamicIndicators = function (redraw, startIdx, recalculateTypes, extremes) {
    if (infChart.indicatorMgr) {
        var that = this, indicators = infChart.indicatorMgr.getIndicators(that.id);
        infChart.util.forEach(indicators, function (key, indicator) {

            if (indicator.isDynamic) {
                var indData = that.getDataForIndicators(indicator, startIdx, recalculateTypes),
                    baseData = indData.base && indData.base.ohlcv && indData.base,
                    hasRecalData = false;

                recalculateTypes && recalculateTypes.forEach(function (type) {
                    if (indData.hasOwnProperty(type)) {
                        hasRecalData = true;
                    }
                });

                if ((!recalculateTypes || hasRecalData) && baseData && baseData.ohlcv && baseData.data && baseData.data.length)
                    indicator.calculate(baseData.ohlcv, baseData.data, redraw, undefined, indData, extremes);
            }
        });
    }
};

/**
 * Returns the ohlcv data for the given indicator (if it is in the base axis proceed data will be provided)
 * @param indicator
 * @param recalStartIdx Process data from the given index if previous data available
 * @returns {{ohlcv: *, data: Array}}
 */
infChart.StockChart.prototype.getDataForIndicators = function (indicator, recalStartIdx, recalculateTypes) {
    var iChart = this,
        ohlcvOrg = iChart.rangeData.ohlcv,
        rangeData = iChart.rangeData.data,
        compareRangeData = iChart.rangeData.compareData,
        ohlcv,
        isNormal = !(iChart.isLog || iChart.isCompare || iChart.isPercent),
        axisId = indicator.getAxisId(),
        requiredDataTypes = indicator.getRequiredDataTypes(),
        data = {},
        recalBase = !recalculateTypes || !!(recalculateTypes.length),
        recalCompare = !recalculateTypes || recalculateTypes.indexOf("compare") >= 0;

    infChart.util.forEach(requiredDataTypes, function (i, type) {
        if (type == "base" && recalBase) {
            if (!isNormal && infChart.util.isSeriesInBaseAxis(axisId)) {// && !infChart.util.isSeriesParallelToBaseAxis(iChart.chart.get(axisId))
                //if (!iChart.processedData.ohlcv) {
                //    // no ohlcv data available and process from the beginning
                //    ohlcv = iChart.processedData.ohlcv = iChart.dataManager.getOHLCV(iChart.processedData.data);
                //} else {
                //    // processd ohlcv data available
                //    if (recalStartIdx) {
                //        // processed new data and return all
                //        var tempOhlcv = iChart.dataManager.getOHLCV(iChart.processedData.data, recalStartIdx);
                //        infChart.util.forEach(tempOhlcv, function (i, val) {
                //            if (iChart.processedData.ohlcv[i]) {
                //                if (recalStartIdx <= (iChart.processedData.ohlcv[i].length - 1)) {
                //                    iChart.processedData.ohlcv[i].splice(recalStartIdx, iChart.processedData.ohlcv[i].length - recalStartIdx);
                //                }
                //                iChart.processedData.ohlcv[i] = iChart.processedData.ohlcv[i].concat(val);
                //            } else {
                //                iChart.processedData.ohlcv[i] = val;
                //            }
                //        });
                //    }
                //    ohlcv = iChart.processedData.ohlcv;
                //}
                ohlcv = iChart.processedData.ohlcv;
            } else {
                ohlcv = ohlcvOrg;
            }
            data[type] = {ohlcv: ohlcv, data: rangeData};
        } else if (type == "compare" && recalCompare) {
            if (!isNormal && infChart.util.isSeriesInBaseAxis(axisId) && !infChart.util.isSeriesParallelToBaseAxis(iChart.chart.get(axisId))) {
                //TODO :: set processed ohlcv data
            } else {
                // TODO  :: set ohlcv
                //ohlcv = ohlcvOrg;
            }
            data[type] = {data: compareRangeData};
        }
    });

    return data;
};

//endregion===

//region =====================loading icon==============================================================================

infChart.StockChart.prototype.setLoading = function (isLoading) {
    infChart.manager.setLoadingStatus(this.chartId, isLoading);
    if (isLoading) {
        //this.chart.showLoading();
        var loadingHTML = infChart.util.getLoadingMessage();
        $(this.getContainer()).mask(loadingHTML);
    } else {
            //this.chart.hideLoading();
            $(this.getContainer()).unmask();


    }
};

infChart.StockChart.prototype.isLoading = function () {
    return infChart.manager.getLoadingStatus(this.chartId);
};

//endregion

//region =====================no data===================================================================================

infChart.StockChart.prototype._hasData = function () {
    var hasData = false;
    if (!this.rangeData.data || !this.rangeData.data.length) {
        infChart.util.forEach(this.rangeData.compareData, function (i, val) {
            if (val && val.length) {
                hasData = true;
                return true;
            }
        });
    } else {
        hasData = true;
    }
    return hasData;
};

/**
 * show no data msg
 * based on highcharts no data plugin : http://code.highcharts.com/modules/no-data-to-display.js
 * to customize add noData section to {@link infChart.config}
 * @param noData
 */
infChart.StockChart.prototype._showNoData = function (noData) {
    if (noData && !this._hasData()) {
        var chart = this.chart;
        if (chart) {
            this._setDepthVisibility(false);
            var options = this._getNoDataLabelOptions();
            if (!this.noDataLabel) {
                this.noDataLabel = chart.renderer.label(options.msg, chart.plotWidth / 2, chart.plotHeight / 2, null, null, null, options.useHTML, null, "no-data").attr({
                    zIndex: chart.seriesGroup.zIndex - 1
                }).add();
            }
            this._resizeNoDataLabel(options);

            infChart.structureManager.settings.hideAllSettingsPopups(true);
        }
    } else {
        this._setDepthVisibility(true);
        this._destroyNoDataLabel();
    }
};

infChart.StockChart.prototype._setDepthVisibility = function (dataAvailable) {
    if (infChart.depthManager && !(this.destroying === true || this.destroyed === true)) {
        infChart.depthManager.onNoData(this.id, infChart.structureManager.getContainer(this.getContainer(), 'chartContainer'), !dataAvailable);
        if (!dataAvailable) {
            this.resizeChart();
        }
    }
};

/**
 * get no data label options
 * @returns {Object} noData options
 */
infChart.StockChart.prototype._getNoDataLabelOptions = function () {
    var noDataTheme = infChart.themeManager.getTheme().noData;
    var backgroundColorFromConfig = this.chart.options.chart.noDataBackgroundColor;
    var options = {
        msg: 'Data Not Available',
        useHTML: false,
        position: {align: 'center', verticalAlign: 'bottom'},
        style: {color: '#4572A7', fontWeight: 'bold', fontSize: 16, backgroundColor: '#121212'}
    };

    options = $.extend(options, this.chart && this.chart.options.noData || {});

    options.msg = infChart.structureManager.common.getNoDataMsg(options.msg);

    options.style = $.extend(options.style, noDataTheme || {});
    options.style.backgroundColor = backgroundColorFromConfig ? backgroundColorFromConfig : options.style.backgroundColor;
    return options;
};

/**
 * resize nodata label. set x and y
 * @param {Object} options - no data label config/options object
 */
infChart.StockChart.prototype._resizeNoDataLabel = function (options) {
    var chart = this.chart, noDataLabel = this.noDataLabel;
    if (chart && noDataLabel) {
        var width = noDataLabel.element.getBBox().width, text = noDataLabel.text.textStr;
        var axisHeight = this.getMainYAxis().height || chart.plotHeight;
        var fontsize = chart.plotWidth > width && ((axisHeight / 4) * text.length) < chart.plotWidth ?
        axisHeight / 4 : chart.plotWidth / (text.length);

        fontsize = Math.min(fontsize, options.style.fontSize);
        noDataLabel.css($.extend(options.style, {
            "fontSize": fontsize && Math.floor(fontsize) || options.style.fontSize
        }));

        noDataLabel.attr({
            zIndex: chart.seriesGroup.zIndex - 1,
            x: 0,
            y: 0,
            text: text
        });
        infChart.structureManager.common.resizeAndSetColour(this.getContainer(), options.style.backgroundColor);
    }
};

infChart.StockChart.prototype._destroyNoDataLabel = function () {
    if (this.noDataLabel) {
        this.noDataLabel.destroy();
        this.noDataLabel = undefined;
    }
};

infChart.StockChart.prototype.resizeNoData = function () {
    if (this.chart && this.noDataLabel) {
        var options = this._getNoDataLabelOptions();
        this._resizeNoDataLabel(options);
    }
};

//endregion=============================================================================================================

//region News

infChart.StockChart.prototype._initNews = function (config) {
    this.news.click = (config) ? config.click : undefined;

};

infChart.StockChart.prototype.showNews = function () {
    var mainSeries = this.getMainSeries(),
        id = mainSeries.options.id + "_news",
        seriesProperties = {
            "onSeries": mainSeries.options.id,
            "onClick": this.news.click
        };
    var properties = {
        symbol: this.symbol,
        interval: this.interval,
        period: this.period
    };
    this.addSeries(id, "news", seriesProperties, false);
    this.setLoading(true);
    this.dataManager.getNews(properties, this.onLoadNews, this)
};

infChart.StockChart.prototype.onLoadNews = function (data, properties) {
    var mainSeries = this.getMainSeries();
    var newsData = data;
    var series = this.chart.get(mainSeries.options.id + "_news");
    series.setData(newsData, true, false, false);
    this.setLoading(false);
};

/**
 * news tooltip
 * @param point
 * @returns {tooltipData}
 */
infChart.StockChart.prototype.getNewsTooltipValue = function (point) {
    return {
        'raw': point.options.infItem.headline,
        'formatted': point.options.infItem.headline,
        'label': 'news'
    };
};

//endregion

//region ===========Flags=================

/*infChart.StockChart.prototype.initFlags = function(config){
 this.news.click = (config)? config.click: undefined;

 };*/

infChart.StockChart.prototype.setFlags = function (flagType, enabled) {
    var flagIndex = this.flags.enabled.indexOf(flagType);

    if (enabled && flagIndex < 0) {
        this.toggleFlags(flagType);
    } else if (!enabled && flagIndex >= 0) {
        this.toggleFlags(flagType);
    }

    if (this._isToolbarEnabled()) {
        infChart.toolbar.setSelectedControls(this.id, 'flags', this.flags.enabled);
    }
};

infChart.StockChart.prototype.showFlags = function (flagType) {
    if (!this.symbol) {
        return;
    }
    var properties = {
        symbol: this.symbol,
        interval: this.interval,
        period: this.period,
        flagType: flagType
    };
    var chart = this;
    if (flagType) {
        this.addFlags(flagType, properties);
    } else {
        infChart.util.forEach(this.flags.enabled, function (i, flag) {
            properties = {
                symbol: chart.symbol,
                interval: chart.interval,
                period: chart.period,
                flagType: flag
            };
            chart.addFlags(flag, properties);
        });
    }

};

infChart.StockChart.prototype.addFlags = function (flagType, properties) {
    var serviceConfig = this.dataManager.getFlagService(flagType),
        mainSeries = this.getMainSeries(),
        id = mainSeries.options.id + "_" + flagType,
        seriesProperties = {
            "title": serviceConfig.symbol,
            "flagType": flagType,
            "onSeries": mainSeries.options.id,
            "shape": serviceConfig.shape ? serviceConfig.shape : "circlepin",
            "fillColor": serviceConfig.fillColor ? serviceConfig.fillColor : '#9258b3',
            "lineColor": serviceConfig.lineColor ? serviceConfig.lineColor : "#000000"
        };
    if (typeof serviceConfig.onclick === 'function') {
        seriesProperties.onClick = function (event) {
            serviceConfig.onclick.apply(this, [event, event.currentTarget.infItem]);
        };
    }
    this.addSeries(id, "flags", seriesProperties, false);
    this.setLoading(true);
    this.dataManager.getFlagsData(properties, this.onLoadFlags, this)
};

infChart.StockChart.prototype.onLoadFlags = function (data, properties) {
    var mainSeries = this.getMainSeries();
    var flagData = data;
    var series = this.chart.get(mainSeries.options.id + "_" + properties.flagType);
    series.setData(flagData, true, false, false);
    this.setLoading(false);
};

/**
 * flag tooltip
 * @param point
 * @returns {tooltipData}
 */
infChart.StockChart.prototype.getFlagToolTipValue = function (point) {
    var series = point.series, data = point.options.infItem;
    var flagService = this.dataManager.getFlagService(series.options.infFlagType);
    var label = flagService.symbol;
    if (flagService.tooltipFormatter) {
        label = flagService.tooltipFormatter(data);
    }
    return {
        'raw': label,
        'formatted': label,
        'color': series.options.fillColor,
        'label': 'flags'
    };
};

//endregion

/**
 * Set the scale factors that applies on the chart parent considering its all parents' scaling
 * These factors will be used to track mouse positions
 *
 */
infChart.StockChart.prototype.setScaleFactors = function () {
    var scaleFactorX = 1, scaleFactorY = 1, transform, matrix;
    var scalers = $("#" + this.chartId).parents().filter(function () {
        transform = $(this).css('transform');
        if (transform != "none") {
            matrix = transform.match(/-?[\d\.]+/g);
            if (matrix.length >= 4) {
                scaleFactorX = scaleFactorX * Math.sqrt(parseFloat(matrix[0]) * parseFloat(matrix[0]) + parseFloat(matrix[1]) * parseFloat(matrix[1]));
                scaleFactorY = scaleFactorY * Math.sqrt(parseFloat(matrix[2]) * parseFloat(matrix[2]) + parseFloat(matrix[3]) * parseFloat(matrix[3]));
            }
            return true;
        } else {
            return false;
        }
    });

    if (this.chart) {
        this.chart.infScaleX = scaleFactorX;
        this.chart.infScaleY = scaleFactorY;
    }
};

/**
 * retuns scale Factors
 *
 */
infChart.StockChart.prototype.getScaleFactors = function () {
    return {
        infScaleX: this && this.chart && this.chart.infScaleX,
        infScaleY: this && this.chart && this.chart.infScaleY
    };
};

/**
 *
 */
infChart.StockChart.prototype.setMaxZoom = function (resetControls) {
    var extremes = this.getRange(),
        maxZoom = this.getMaxZoomRange(),
        diff = extremes.max - extremes.min;
    if (maxZoom && maxZoom < diff) {
        var prevMid = extremes.min + (extremes.max - extremes.min) / 2;

        var startTime = extremes.max == extremes.dataMax ? extremes.max - maxZoom : Math.max(prevMid - maxZoom / 2, extremes.dataMin),
            endTime = extremes.min == extremes.dataMin ? startTime + maxZoom : Math.min(prevMid + maxZoom / 2, extremes.dataMax);

        this.setXAxisExtremes(startTime, endTime, true, false);
        // this.setRange(startTime, endTime);
        // if (resetControls) {
        //     this.clearToolbarControls("period", true);
        // }
    }
};

/**
 * Resize chart to fix it to the container dimensions
 */
infChart.StockChart.prototype.resizeChart = function () {
    console.debug("chart Resize :: from core");
    this.adjustChartSize(undefined, undefined, true);
};

/**
 * Returns true if chart size is no set properly
 * @returns {*}
 */
infChart.StockChart.prototype.isResizeRequired = function () {
    return (!this.destroying && !this.destroyed) && infChart.structureManager.isResizeRequired(this.id, this.getContainer());
};

infChart.StockChart.prototype.adjustChartSize = function (advChartEnablingWidth, advChartEnablingHeight, isAdvcht, callback, onDisplay) {
    var _self = this;

    if (this.isResizeRequired() || onDisplay) {
        console.debug("chart Resize :: adjustChartSize called");

        function adjustSize() {
            if (_self.chart) {
                var startTime = (new Date()).getTime();
                var conternerEl = _self.getContainer();
                // $container = $(conternerEl);
                var size = infChart.structureManager.rearrangeStructure(_self.id, conternerEl),
                    prevWidth = _self.chart.chartWidth;

                //this was
                // var chartHeight = size.height - 5, legendHeight = $container.find("[inf-legend]").outerHeight(true);

                //if (legendHeight && _self.chart.series != undefined && _self.chart.series.length > 0) {
                //    var yPadding = 2 * legendHeight / chartHeight;
                //    _self.getMainYAxis().update({maxPadding: yPadding}, true);
                //}
                //var adjustDrawings = !this.getMainYAxis().height;
                var adjustDrawings = !_self.getMainYAxis().height;


                console.debug("chart Resize :: adjustChartSize : reflow");
                _self.chart.reflow();

                if (!_self._isCustomPeriod() && size && prevWidth > size.width) {
                    _self.setMaxZoom(true);
                }

                //if (_self.chart && _self.chart.annotations) {
                //    _self.scaleDrawings(_self.id);
                //}

                _self.updateMinMax();

                _self._setLabels();
                if (_self.chart.redrawWaterMark) {
                    _self.chart.redrawWaterMark();
                }

                if (_self.loaded) {
                    //_self.loaded = false;
                    _self._updateNavigatorHeight();
                    clearTimeout(_self.resizeTimer);
                    _self.resizeTimer = undefined;
                }

                _self.setScaleFactors();
                // _self._adjustRangeSelectorPosition();
                _self.resizeNoData();

                //if (infChart.depthManager) {
                //    infChart.depthManager.resize(_self.id);
                //}
                if (callback && typeof callback == "function") {
                    callback.call(_self);
                }

                if (adjustDrawings) {
                    _self._fireEventListeners('afterYSetExtremes');
                }
                if(_self.chart.selectedAnnotation && _self.chart.selectedAnnotation.options && typeof infChart.drawingsManager !== 'undefined'){
                    var drawingId = _self.chart.selectedAnnotation.options.id;
                    var drawingObject = infChart.drawingsManager.getDrawingObject(_self.id, drawingId);
                    if(!drawingObject.isQuickSetting){
                        infChart.drawingsManager.toggleSettings(drawingObject, false);
                    }
                }
                _self._fireEventListeners("resize");
                console.debug("performance :: adjustSize : " + ((new Date()).getTime() - startTime) + ", startTime : " + startTime);
            }
            _self.adjustOnResizeTimeout = false;
        }

        if (_self.resizeTimer) {
            _self.adjustOnResizeTimeout = true;
        } else {
            adjustSize();
            _self.resizeTimer = setTimeout(function () {
                if (_self.adjustOnResizeTimeout) {
                    adjustSize();
                }
                _self.resizeTimer = undefined;
            }, _self.settings.config.maxResizeDelay);
        }
    }
};

infChart.StockChart.prototype.enableToolbarPanels = function (options) {
    var containerElem = $(this.getContainer());
    if (options.upper == false) {
        containerElem.find('[inf-pnl=tb-upper]').hide();
    } else if (options.upper) {
        containerElem.find('[inf-pnl=tb-upper]').show();
    }

    if (options.left == false) {
        containerElem.find('div[inf-pnl=tb-left]').hide();
    } else if (options.left) {
        containerElem.find('div[inf-pnl=tb-left]').show();
    }

    if (options.top == false) {
        containerElem.find('nav[inf-pnl=tb-top]').hide();
    } else if (options.top) {
        containerElem.find('nav[inf-pnl=tb-top]').show();
    }
};

// /**
//  * Get color for a new series
//  * @param index
//  * @returns {*}
//  * @private
//  */
// infChart.StockChart.prototype._getSeriesColor = function (index) {
//     var colors = Highcharts.theme && Highcharts.theme.seriesColorMap || ["#fbf201", "#00aeff", "#ff15af", "#8aff00", "#9f37ff"];
//     var colorMapLength = colors.length;
//     var indexOfColorMap = this.colorIndex % colorMapLength;
//     this.colorIndex++;
//     return colors && colors[indexOfColorMap] || "#FFFFFF";
// };

///**
// * Add listners for full screen state changes
// * @param type
// * @param listener
// * @private
// */
//infChart.StockChart.prototype._addFullscreenListeners = function (type, listener) {
//    this.fsListeners[type].xPush(listener);
//};

///**
// * executes the fullscreen listeners
// * @param type
// * @returns {*}
// * @private
// */
//infChart.StockChart.prototype.executeFullscreenListeners = function (type) {
//    var listeners = this.fsListeners[type];
//    this.fsListeners[type] = [];
//    infChart.util.forEach(listeners, function (i, fn) {
//        fn();
//    });
//};

infChart.StockChart.prototype.getDecimalPlaces = function (symbol) {
    return symbol && !isNaN(symbol.dp) ? symbol.dp : (this.settings && this.settings.config && !isNaN(this.settings.config.defaultDp)) ? this.settings.config.defaultDp : 2;
};

//region ========================== performance check ==================================================================

infChart.StockChart.prototype._checkPerformance = function (noOfcalls) {
    var stime = Date.now(),
        chart = this;
    for (var i = 0; i < noOfcalls; i++) {
        chart.chart.redraw();
    }
    var etime = Date.now();
    console.debug("### chart redraw time " + (etime - stime) + " no of redraws " + i);
};

infChart.StockChart.prototype._resetPerformance = function () {
    this.chart.userOptions.redrawAvg = 0;
    this.chart.userOptions.redrawcount = 0;
};

//endregion ========================== end of performance check ========================================================

infChart.StockChart.prototype._onPropertyChange = function (propertyName, value) {
    var config = infChart.manager.getProperties(this.id, infChart.constants.fileTemplateTypes.all);
    this._fireEventListeners('onPropertyChange', [propertyName, config, value ? value : config[propertyName]]);
};

/**
 * notify before changing any property
 * for now called before period or interval changes
 * @param propertyName
 * @param newValue
 * @private
 */
infChart.StockChart.prototype._onBeforePropertyChange = function (propertyName, newValue) {
    var config = infChart.manager.getProperties(this.id);
    this._fireEventListeners('onBeforePropertyChange', [propertyName, config[propertyName], newValue]);
};

/**
 * fire registered method
 * does not return anything(void fn) - should be replaced with event listeners
 * @param eventName
 * @param args
 * @private
 * @deprecated
 */
infChart.StockChart.prototype._fireRegisteredMethod = function (eventName, args) {
    if (this._hasRegisteredMethod(eventName)) {
        this.settings.registeredMethods[eventName].apply(this, args);
    }
};

infChart.StockChart.prototype._hasRegisteredMethod = function (eventName) {
    return this.settings && this.settings.registeredMethods && typeof this.settings.registeredMethods[eventName] === 'function';
};

infChart.StockChart.prototype.registerForEvents = function (methodName, callback, initialArgs) {
    var eventListeners = this.eventListeners || {},
        methodOptions = eventListeners[methodName] || {count: 0, callbacks: {}};
    eventListeners[methodName] = methodOptions;
    methodOptions.count++;
    methodOptions.callbacks[methodOptions.count] = {callback: callback, initialArgs: initialArgs};
    this.eventListeners = eventListeners;
    return methodOptions.count;
};

infChart.StockChart.prototype.removeRegisteredEvent = function (methodName, id) {
    var eventListeners = this.eventListeners || {},
        methodOptions = eventListeners && eventListeners[methodName];

    if (methodOptions && methodOptions.callbacks[id]) {
        delete methodOptions.callbacks[id];
    }
};

infChart.StockChart.prototype._fireEventListeners = function (methodName, args, skipRegeistered) {
    var iChart = this;
    if (iChart.eventListeners && iChart.eventListeners[methodName]) {
        infChart.util.forEach(iChart.eventListeners[methodName].callbacks, function (key, val) {
            var argsToSet = val.initialArgs || [],
                eventArgs = args ? Array.isArray(args) ? args : [args] : [];
            val.callback && val.callback.apply(iChart, eventArgs.concat(argsToSet));
        });
    }
    if (!skipRegeistered) {
        iChart._fireRegisteredMethod(methodName, args);
    }
};

infChart.StockChart.prototype.pointClick = function (point) {
    if (point) {
        this._fireEventListeners('pointClick');
        if (this._hasRegisteredMethod('pointClick')) {
            this._fireRegisteredMethod('pointClick', [point, this.dataManager.getTimeZone(this.interval)]);
        } else {
            return true;
        }
    } else {
        return true;
    }
};

/**
 * Executes when mouse pointer is over the given series and doing following things
 * 1.highlights the legend of the series
 * @param series
 */
infChart.StockChart.prototype.onSeriesMouseOver = function (series) {
    if (series) {
        infChart.structureManager.legend.onSeriesMouseOver(this.id, series.options.id, series.options.infType, this.isTooltipEnabled());
    }
};

/**
 * Executes when mouse  is leaving the given series and doing following things
 * 1. de-highlights the legend of the series
 * @param series
 */
infChart.StockChart.prototype.onSeriesMouseOut = function (series) {
    if (series) {
        infChart.structureManager.legend.onSeriesMouseOut(this.id, series.options.id, series.options.infType, this.isTooltipEnabled());
    }
};

infChart.StockChart.prototype.onBaseAxisResize = function () {
    var hchart = this.chart;
    if (hchart.redrawWaterMark) {
        hchart.redrawWaterMark();
    }
    this._fireEventListeners('onBaseAxisResize');
    //this._fireRegisteredMethod('onBaseAxisResize');
};

infChart.StockChart.prototype.onBaseAxisScaled = function () {
    this._fireEventListeners('onBaseAxisScaled');
    //this._fireRegisteredMethod('onBaseAxisScaled');
};

infChart.StockChart.prototype.onBeforeResetYAxis = function () {
    this._fireEventListeners('onBeforeResetYAxis');
    //this._fireRegisteredMethod('onBeforeResetYAxis');
};

/**
 * Set tooltip options of the highcharts object
 */
infChart.StockChart.prototype.setToolTipOptions = function () {
    this.chart.tooltip.options.enabled = !!this.tooltip;
};

/**
 * Show/ hide navigator
 * @param {boolean} isPropertyChange
 * @returns {boolean}
 * @private
 */
infChart.StockChart.prototype._toggleNavigator = function (isPropertyChange) {
    var chart = this.chart, enabled = !(chart.options.navigator.height > 0),
        baseSeries = ( chart.navigator && chart.navigator.baseSeries && chart.navigator.baseSeries[0] ) || this.getMainSeries(),
        baseData = baseSeries && baseSeries.options && baseSeries.options.data,
        xAxisUpdate = {},
        conternerEl = this.getContainer();


    var navigatorHeight = this.settings.config.navigatorHeight ? this.settings.config.navigatorHeight : infChart.util.getNavigatorHeight(chart.chartHeight, chart.options);

    navigatorHeight = enabled? navigatorHeight : 0;

    if (baseData && baseData.length > 1) {
        xAxisUpdate.min = baseData[0][0];
        xAxisUpdate.max = baseData[baseData.length - 1][0];
    }

    chart.update({navigator: {height: navigatorHeight, xAxis: xAxisUpdate}}, true);

    if(enabled) {
        $(conternerEl).removeClass("hide-navigator");
    } else {
        $(conternerEl).addClass("hide-navigator");
    }

    // hide-navigator

    if (this.rangeSelectorEl) {
        if (enabled) {
            this.rangeSelectorEl.show();
            this._adjustRangeSelectorMinMax();
            this._setRangeSelectorValues();
        } else {
            this.rangeSelectorEl.hide();
        }
    } else {
        this._setRangeSelectorValues();
    }

    if (isPropertyChange) {
        this._onPropertyChange("navigator");
    }
    if (this._isToolbarEnabled()) {
        infChart.toolbar.setSelectedControls(this.id, 'navigator', enabled);
    }
    return enabled;
};

infChart.StockChart.prototype._updateNavigatorHeight = function () {
    var chart = this.chart, enabled = this.isHistoryEnabled();
    if (enabled) {
        if ((chart.scroller.height < chart.options.navigator.infMaxHeight && (chart.scroller.height / chart.chartHeight) < 0.1) ||
            (chart.scroller.height > chart.options.navigator.infMinHeight && (chart.scroller.height / chart.chartHeight) > 0.1)) {
            var navigatorHeight = infChart.util.getNavigatorHeight(chart.chartHeight, chart.options);
            chart.update({navigator: {height: navigatorHeight}}, true);
        }
        if (this.rangeSelectorEl) {//from _setRangeSelectorValues
            this._adjustRangeSelectorPosition();
        }
    }
};

//region Chart-core-api - integration with toolbar

/**
 * toggle flags
 * @param {string} flagType
 * @param {boolean} isPropertyChange
 * @returns {Array<string>}
 */
infChart.StockChart.prototype.toggleFlags = function (flagType, isPropertyChange) {
    var mainSeries = this.getMainSeries();
    if (flagType) {
        var flagIndex = this.flags.enabled.indexOf(flagType);
        if (flagIndex >= 0) {
            this.flags.enabled.splice(flagIndex, 1);
            // remove series
            if (mainSeries) {
                this.removeSeries(mainSeries.options.id + "_" + flagType);
            }
        }
        else {
            this.flags.enabled.xPush(flagType);
            this.showFlags(flagType);
        }

    } else {
        if (this.flags.enabled.length == 0) {
            this.flags.enabled = $.extend([], this.flagTypes);
            this.showFlags();
        } else {
            var flags = this.flags.enabled;
            this.flags.enabled = [];
            var chart = this;
            if (mainSeries) {
                infChart.util.forEach(flags, function (i, type) {
                    chart.removeSeries(mainSeries.options.id + "_" + type);
                });
            }
        }

    }
    return this.flags.enabled;
};

/**
 * change chart data mode
 * @param {('percent'|'log')} type
 * @param {true} isPropertyChange
 * @returns {boolean}
 */
infChart.StockChart.prototype.toggleChartDataMode = function (type, isPropertyChange) {
    var enabled = false;
    switch (type) {
        case 'percent':
            if (this.isPercent) {
                type = 'percentToNormal';
            } else if (this.isLog) {
                type = 'logToPercent';
                enabled = true;
            } else {
                enabled = true;
            }
            this.setChartDataMode(type, true, isPropertyChange);
            break;
        case 'log':
            if (this.isLog) {
                type = 'logToNormal';
            } else if (this.isPercent) {
                type = 'percentToLog';
                enabled = true;
            } else {
                enabled = true;
            }
            this.setChartDataMode(type, true, isPropertyChange);
            break;
        default:
            break;
    }
    return enabled;
};

/**
 * toggle crosshair
 * @param {('last'|'all')} type
 * @param {boolean} isPropertyChange
 * @returns {boolean}
 */
infChart.StockChart.prototype.toggleCrosshair = function (type, isPropertyChange) {

    if (this.crosshair.type === type) {
        this.crosshair.enabled = !this.crosshair.enabled;
    } else if (type === 'none') {
        this.crosshair.enabled = false;
    } else {
        this.crosshair.enabled = true;
        if (this.crosshair.type === 'last') {
            this.crosshair.type = 'all';
        } else if (this.crosshair.type === 'all') {
            this.crosshair.type = 'last';
        } else {
            this.crosshair.type = type;
        }
    }
    if (isPropertyChange) {
        this._onPropertyChange("crosshair");
    }
    return this.crosshair.enabled;
};

/**
 * change chart depth side
 * @param {('right'|'bottom')} side
 * @param {boolean}isPropertyChange
 * @returns {boolean}
 */
infChart.StockChart.prototype.changeDepthSide = function (side, isPropertyChange) {
    var enabled = false;
    if (infChart.depthManager) {
        var depthProperties = infChart.depthManager.changeSide(this.id, infChart.structureManager.getContainer(this.getContainer(), 'chartContainer'), side);
        enabled = {
            value: depthProperties.side,
            enabled: depthProperties.show
        };

        if (!this.noData) {
            if (isPropertyChange) {
                this._onPropertyChange('depth', depthProperties);
            }

            this.resizeChart();

        }
        }
    return enabled;
};

/**
 * show hide last line
 * @param {boolean} isPropertyChange
 * @returns {boolean}
 */
infChart.StockChart.prototype.toggleLastLine = function (isPropertyChange) {
    if (!this.hasLastLine) {
        this.enabledLastLabel = true;
        this.enabledLastLine = true;
        this._drawLastLine();
    } else if (this.hasLastLine) {
        this._removeLastLine();
        this.enabledLastLabel = false;
        this.enabledLastLine = false;
    }
    if (isPropertyChange) {
        this._onPropertyChange("last", this.hasLastLine);
    }
    if(this.settings.config.lastLabelAlign == "right") {
        if(!this.hasLastLine || this.getMaxLastLabelWidth() > this.getMainYAxis().maxLabelLength) {
            this.getMainYAxis().isDirty = true;
            this.chart.redraw();
        }
    }
    return this.hasLastLine;
};

/**
 * show hide previous close line
 * @param {boolean} isPropertyChange
 * @returns {boolean}
 */
infChart.StockChart.prototype.togglePreviousCloseLine = function (isPropertyChange) {
    if (!this.hasPreviousCloseLine) {
        this._enablePreviousCloseLine(true);
    } else if (this.hasPreviousCloseLine) {
        this._removePreviousCloseLine(false);
        if(this.settings.config.previousCloseLabelAlign === "right") {
            if(!this.hasPreviousCloseLine || this.getMaxLastLabelWidth() > this.getMainYAxis().maxLabelLength) {
                this.getMainYAxis().isDirty = true;
                this.chart.redraw();
            }
        }
    }
    if (isPropertyChange) {
        this._onPropertyChange("preClose", this.hasPreviousCloseLine);
    }

    return this.hasPreviousCloseLine;
};

infChart.StockChart.prototype.toggleSingletonIndicatorByType = function (indicatorType, isPropertyChange, isEnable, redraw) {
    if(typeof redraw === 'undefined') {
        redraw = true;
    }
    var controlName;
    switch(indicatorType){
        case 'VOLUME':
        case 'VOLUME_PNL':
            controlName = "volume";
            if (typeof isEnable === 'undefined') {
                isEnable = !this.volume;
            }
            this.volume = isEnable;
            break;
        case 'SPREAD':
            controlName = "spread";
            if (typeof isEnable === 'undefined') {
                isEnable = !this.spread;
            }
            this.spread = isEnable;
            break;
        case 'BAH':
            controlName = "bidAskHistory";
            if (typeof isEnable === 'undefined') {
                isEnable = !this.bidAskHistory;
            }
            this.bidAskHistory = isEnable;
            break;
    }
    this._toggleSingletonIndicator(indicatorType, isEnable, undefined, redraw, isPropertyChange, controlName);
    return isEnable;
};

/**
 * Show/hide chart tooltip
 * @param {boolean} isPropertyChange
 * @returns {boolean}
 */
infChart.StockChart.prototype.toggleToolTip = function (isPropertyChange) {
    var container = $(this.getContainer());

    if (this.tooltip) {
        this.tooltip = false;
        this.chart.tooltip.hide();
        container.find("[inf-tt-date]").hide();
        container.find("[inf-tooltip]").hide();
        this.setToolTipOptions();
    }
    else {
        this.tooltip = true;
        container.find("[inf-tt-date]").show();
        container.find("[inf-tooltip]").show();
        this.setToolTipOptions();
        this.updateTooltipToLastPoint(true);

    }

    infChart.structureManager.tooltip.toggleTooltip(this.id, this.tooltip);

    if (isPropertyChange) {
        this._onPropertyChange("tooltip");
    }

    this.resizeChart();
    return this.tooltip;

};

infChart.StockChart.prototype.isTooltipEnabled = function () {
    return this.tooltip && !this.settings.config.hideSymbolTooltip;
};

/**
 * toggle display of navigator
 * @param {boolean} isPropertyChange
 * @returns {boolean}
 */
infChart.StockChart.prototype.toggleHistory = function (isPropertyChange) {
    this._toggleNavigator(isPropertyChange);
    //if (infChart.depthManager) {
    //    infChart.depthManager.onPlotHeightChange(this.id);
    //}
    return this.isHistoryEnabled();
};

infChart.StockChart.prototype.isHistoryEnabled = function () {
    return this.chart.options.navigator.height > 0;
}

/**
 * toggle display of min max labels
 * @param {boolean} isPropertyChange
 * @returns {boolean}
 */
infChart.StockChart.prototype.toggleShowMinMax = function (isPropertyChange) {

    var mainSeries = this.getMainSeries();
    if (this.minMax.enabled) {
        this.minMax.axisAdjusted = false;
        /* mainSeries.yAxis.update({
         "startOnTick": false,
         "endOnTick": false
         }, true);*/
        this._hideMinMax();
    } else {
        this.minMax.axisAdjusted = true;
        /*mainSeries.yAxis.update({
         "startOnTick": true,
         "endOnTick": true
         }, true);*/
        this._showMinMax();
    }
    //this.scaleDrawings(this.id);
    this.adjustPriceLineLabels();

    if (isPropertyChange) {
        this._onPropertyChange("minMax");
    }
    return this.minMax.enabled;

};

/**
 * toggle news
 * @param {boolean} isPropertyChange
 * @returns {boolean}
 */
infChart.StockChart.prototype.toggleNews = function (isPropertyChange) {
    if (this.news.enabled) {
        var mainSeries = this.getMainSeries();
        this.news.enabled = false;
        // remove series
        this.removeSeries(mainSeries.options.id + "_news");
    } else {
        this.news.enabled = true;
        this.showNews();
    }
    return this.news.enabled;
};

/**
 * toggle display of order book history
 * @param {boolean} isPropertyChange
 * @returns {boolean}
 */
infChart.StockChart.prototype.toggleOrderBookHistory = function (isPropertyChange) {

    var mainSeries = this.getMainSeries();
    this.orderBookHistory = !this.orderBookHistory;
    this.regularIntervalsOnUpdate = this.orderBookHistory;

    if (isPropertyChange) {
        this._onPropertyChange("orderBookHistory", this.orderBookHistory);
    }

    this.refreshSeries(mainSeries.options.id);

    return this.orderBookHistory;
};

infChart.StockChart.prototype._getSettingsPanel = function () {
    return $(infChart.structureManager.getContainer(this.getContainer(), 'settingsPanel'));
};

/**
 * toggle right panel
 * @param container
 * @param {Boolean} isPropertyChange
 * @returns {Boolean}
 */
infChart.StockChart.prototype.toggleRightPanel = function (container, isPropertyChange) {
    var isVisible, rightPanel = this._getSettingsPanel();
    isVisible = this._togglePanel(rightPanel, isPropertyChange);
    this.toggleGridSettingPanel();
    return isVisible;
};

infChart.StockChart.prototype.toggleGridSettingPanel = function () {
    var chartId = this.chartId;
    var rightPanel = this._getSettingsPanel();
    var gridSettingPanel = rightPanel.find('[inf-row-item-rel="' + chartId + '"] ').find("[inf-ref=grid-settings]");
    var xGridlineColorPicker = gridSettingPanel.find("[inf-ctrl-val='xgridLine']").closest("[inf-col-pick-container]");
    var yGridlineColorPicker = gridSettingPanel.find("[inf-ctrl-val='ygridLine']").closest("[inf-col-pick-container]");

    if (this.gridType === "none") {
        gridSettingPanel.hide();
    } else {
        gridSettingPanel.show();

        if (this.gridType === "vertical") {
            yGridlineColorPicker.hide();
            xGridlineColorPicker.show();
        }
        if (this.gridType === "horizontal") {
            xGridlineColorPicker.hide();
            yGridlineColorPicker.show();
        }
        if (this.gridType === "all"){
            xGridlineColorPicker.show();
            yGridlineColorPicker.show();
        }
    }

}

/**
 * Hiding the right panel
 * @param container
 * @param setControl
 * @param isPropertyChange
 * @returns {*}
 */
infChart.StockChart.prototype.hideRightPanel = function (container, setControl, isPropertyChange) {
    var isVisible, rightPanel = this._getSettingsPanel();

    if (this.isRightPanelOpen()) {
        isVisible = this._togglePanel(rightPanel, isPropertyChange);
        if (setControl && this._isToolbarEnabled()) {
            infChart.toolbar.setSelectedControls(this.id, "rightPanel", false);
        }
    }
    return isVisible;
};

/**
 * Toggle the panel and resize the chart
 * @param panel
 * @isPropertyChange isPropertyChange
 * @private
 */
infChart.StockChart.prototype._togglePanel = function (panel, isPropertyChange) {
    panel.toggle();
    var isVisible = panel.is(":visible");
    if (isVisible) {
        this.container.xAddClass("right-panel-opened");
    } else {
        this.container.xRemoveClass("right-panel-opened");
    }
    this.adjustChartSize();

    if (isPropertyChange) {
        this._onPropertyChange("rightPanel", this.isRightPanelOpen());
    }
    return isVisible;
};

/**
 * returns true if right panel is visible
 * @returns {Boolean}
 */
infChart.StockChart.prototype.isRightPanelOpen = function () {
    var rightPanel = this._getSettingsPanel();
    return rightPanel.is(":visible");
};

/**
 * Display right panel and open given tab
 * @param tabId
 */
infChart.StockChart.prototype.showRightPanelWithTab = function (tabId) {
    var rightPanel = this._getSettingsPanel();
    if (!this.isRightPanelOpen()) {
        this._togglePanel(rightPanel, true);
    }
    rightPanel.find("li[tab-id=" + tabId + "] a").tab("show");
};

/**
 * get active settings tab options in right panel
 * @returns {object} active settings tab options
 */
infChart.StockChart.prototype.getActiveSettingsTabOptions = function () {
    var rightPanel = this._getSettingsPanel();
    var tabId = rightPanel.find("ul.nav.nav-tabs li.active").attr("tab-id");
    var activeTabPane = rightPanel.find("div[rel=" + tabId + "]");
    var activeTabPaneIndex = -1;
    activeTabPane.children().children().each(function(i){
        if($(this).is('.active')) activeTabPaneIndex = i;
    });

    return {
        tabId: tabId,
        activeTabPaneIndex: activeTabPaneIndex
    }
};

/**
 * show active section in right panel
 * @param {string} tabId - selected tab id
 * @param {number} sectionIndex - selected section index
 */
infChart.StockChart.prototype.showActiveSctionInRightPanel = function (tabId, sectionIndex) {
    var rightPanel = this._getSettingsPanel();
    var activeTabPane = rightPanel.find("div[rel=" + tabId + "]");
    var item;
    var currentActiveIndex = -1;
    activeTabPane.children().children().each(function(i){
        if($(this).is('.active')) currentActiveIndex = i;
    });
    if (sectionIndex === -1) {
        item = activeTabPane.children().find("div.panel.panel-default.active a");
        setTimeout(function(){ $(item).trigger('click')}, 250);
    } else {
        if (activeTabPane.children().children().length > 1 && sectionIndex !== currentActiveIndex) {
            item = activeTabPane.children().children().eq(sectionIndex).find('div.panel-heading a');
            setTimeout(function(){ $(item).trigger('click')}, 250);
        }
    }
};

//infChart.StockChart.prototype.toggleFullScreen = function (container) {
//    infChart.manager.handleFullscreen(container);
//};

/**
 * toggle pin/unpin of the selected interval
 */
infChart.StockChart.prototype.togglePinInterval = function (isPropertyChange) {
    if (this.pinInterval) {
        this.pinInterval = false;
    } else {
        this.pinInterval = true;
    }

    if (isPropertyChange) {
        this._onPropertyChange("pinInterval");
    }
    return this.pinInterval;
};

//endregion

infChart.StockChart.prototype.getColorsForChartType = function (series, chartType) {
    var self = this, colors = {}, seriesId = series.options.id;
    var seriesSavedColorOptions = self.getSeriesOptionsOnChartTypeChange(series, chartType);
    switch (chartType) {
        case 'hlc':
        case 'ohlc':
        case 'candlestick':
        case 'heikinashi':
        case 'point':
        case 'equivolume':
        case 'customCandle':
        case 'engulfingCandles':
            var upColor = (series.type == chartType && series.options.upColor) ? series.options.upColor :
                          seriesSavedColorOptions.upColor || seriesSavedColorOptions.color || series.color;
            var downColor = (series.type == chartType && series.options.color) ? series.options.color :
                            seriesSavedColorOptions.color || series.color;

            colors = {'colUp': upColor, 'colDown': downColor};
            break;
        case 'area':
            var areaUpColor, areaDownColor, areaUpFillColor, areaDownColorFillColor;
            if (series.options.negativeFillColor || seriesSavedColorOptions.negativeFillColor) {
                //area up color should be seriesTemp.options.color
                areaUpFillColor = series.type === chartType && series.options.fillColor ?
                                  series.options.fillColor : seriesSavedColorOptions.fillColor || series.options.fillColor;
                areaUpColor = areaUpFillColor ?
                              infChart.util.getColorFromColorObj(areaUpFillColor, "up") : series.type === chartType ? series.options.color : seriesSavedColorOptions.color || series.options.color;

                areaDownColor = series.type === chartType && series.options.negativeFillColor ? series.options.negativeFillColor : seriesSavedColorOptions.negativeFillColor || series.options.negativeFillColor;
                colors = {'colUp': areaUpColor, 'colDown': areaDownColor};
            } else {
                if (series.type == chartType && series.options.fillColor) {
                    areaUpColor = infChart.util.getColorFromColorObj(series.options.fillColor, "up");
                    areaDownColor = infChart.util.getColorFromColorObj(series.options.fillColor, "down");
                } else if (seriesSavedColorOptions.fillColor) {
                    areaUpColor = infChart.util.getColorFromColorObj(seriesSavedColorOptions.fillColor, "up");
                    areaDownColor = infChart.util.getColorFromColorObj(seriesSavedColorOptions.fillColor, "down");
                } else {
                    areaUpColor = seriesSavedColorOptions.color || series.color || series.options.color;
                    areaDownColor = seriesSavedColorOptions.color || series.color || series.options.color;
                }
                colors = {'up': areaUpColor, 'down': areaDownColor};
            }
            break;
        case 'line':
        case 'step':
            colors = {'color': (series.type == chartType) ? series.color : seriesSavedColorOptions.lineColor || seriesSavedColorOptions.color || series.color};
            // colors = {'color': (series.type == chartType) ? series.color : (seriesColorOptions && seriesColorOptions.color) ? seriesColorOptions.color : series.color};
            break;
        case 'dash':
            colors = {'color': (series.type == chartType) ? series.color : seriesSavedColorOptions.lineColor || seriesSavedColorOptions.color || series.chart.options.plotOptions.line.lineColor || series.chart.options.plotOptions.line.color};
            break;
        case 'column':
            if (series.options.hasColumnNegative && (series.options.negativeColor || seriesSavedColorOptions.negativeColor)) {
                var colUpColor = series.type == chartType ? series.options.color : seriesSavedColorOptions.color || series.options.color;
                var colDownColor = (series.type == chartType && series.options.negativeColor) ? series.options.negativeColor :
                                   seriesSavedColorOptions.negativeColor || seriesSavedColorOptions.color || series.color;
                colors = {'colUp': colUpColor, 'colDown': colDownColor};
            } else {
                colors = {'color': (series.type == chartType) ? series.color : seriesSavedColorOptions.color || series.color};
                // colors = {'color': (series.type == chartType) ? series.color : (seriesColorOptions && seriesColorOptions.color) ? seriesColorOptions.color : series.color};
                colors.opacity = seriesSavedColorOptions.fillOpacity ? seriesSavedColorOptions.fillOpacity : infChart.util.getOpacityFromRGBA(colors.color);
            }
            break;
        case 'volume':
            if (series.options.hasColumnNegative && (series.options.upColor || seriesSavedColorOptions.upColor)) {
                var volUpColor = (series.type == chartType && series.options.upColor) ? series.options.upColor :
                                 seriesSavedColorOptions.upColor || seriesSavedColorOptions.color || series.color;
                var volDownColor = (series.type == chartType && series.options.color) ? series.options.color :
                                   seriesSavedColorOptions.color || series.color;

                colors = {'colUp': volUpColor, 'colDown': volDownColor};
                colors.opacity = (seriesSavedColorOptions && seriesSavedColorOptions.fillOpacity) ? seriesSavedColorOptions.fillOpacity : infChart.util.getOpacityFromRGBA(colors.color);

            } else {
                colors = {'color': (series.type == chartType) ? series.color : self._hasSeriesColorOptions(seriesId, "column") ? self.getSeriesOptionsOnChartTypeChange(series, "column").color : seriesSavedColorOptions.color || series.color};
                // colors = {'color': (series.type == chartType) ? series.color : (seriesColorOptions && seriesColorOptions.color) ? seriesColorOptions.color : series.color};
                colors.opacity = (seriesSavedColorOptions && seriesSavedColorOptions.fillOpacity) ? seriesSavedColorOptions.fillOpacity : infChart.util.getOpacityFromRGBA(colors.color);
            }
            break;
        case 'arearange':
            colors = {'color': (series.type == chartType) ? series.color : seriesSavedColorOptions.color || series.color};
            colors.opacity = (seriesSavedColorOptions && seriesSavedColorOptions.fillOpacity) ? seriesSavedColorOptions.fillOpacity : (infChart.util.getOpacityFromRGBA(colors.color) == null) ? series.options.fillOpacity : infChart.util.getOpacityFromRGBA(colors.color);
            break;
        case 'flags':
        case 'infsignal':
        case 'infUDSignal':
        case 'plotrange':
            colors = {'color': seriesSavedColorOptions.color || series.color};
            // colors = {'color': (seriesColorOptions && seriesColorOptions.color) ? seriesColorOptions.color : series.color};
            colors.opacity = (seriesSavedColorOptions && seriesSavedColorOptions.fillOpacity) ? seriesSavedColorOptions.fillOpacity : infChart.util.getOpacityFromRGBA(colors.color);
            break;
        default:
            break;
    }
    return colors;
};

infChart.StockChart.prototype.openSymbolSearch = function (isIndicaterSelect, callBackFunction) {
   if (this.settings && this.settings.registeredMethods && this.settings.registeredMethods.onClickLegendSymbolTitle)
   this.settings.registeredMethods.onClickLegendSymbolTitle(undefined, isIndicaterSelect, callBackFunction);
};

infChart.StockChart.prototype.formatValue = function (value, dp, symbol, isYvalue, isAxisLabel, specificDp) {
    var formatted;
    if (this.settings && this.settings.registeredMethods && this.settings.registeredMethods.fixedDigitsFormatter) {
        formatted = this.settings.registeredMethods.fixedDigitsFormatter(value, 'number', dp, undefined, symbol || this.symbol, specificDp);
    } else {
        if(isYvalue) {
            formatted = this.getYLabel(value, isAxisLabel);
        } else {
            formatted = infChart.util.formatNumber(value, dp);
        }
    }
    return formatted;
};

infChart.StockChart.prototype.formatVolume = function (value, symbol) {
    var formatted;
    if (this.settings && this.settings.registeredMethods && this.settings.registeredMethods.volumeFormatter) {
        formatted = this.settings.registeredMethods.volumeFormatter(value, symbol || this.symbol);
    } else {
        formatted = infChart.util.formatWithNumericSymbols(value, infChart.settings.defaults.volumeDp || 0);
    }
    return formatted;
};

//region ===================== Watermark ===============================================================================

infChart.StockChart.prototype.getWatermarkContent = function () {
    var chart = this.chart,
        currentWatermark = chart.options.watermark ? chart.options.watermark : {type: "text"};

    var externalWatermark;
    if (this.settings && this.settings.registeredMethods && this.settings.registeredMethods.getWatermark) {
        externalWatermark = this.settings.registeredMethods.getWatermark(this.symbol);
    }
    return $.extend(currentWatermark, {text: this.symbol.symbol}, externalWatermark);
};

//endregion ===================== end of Watermark =====================================================================

infChart.StockChart.prototype.onUrlChange = function (newUrl) {
    this.chart && this.chart.xOnUrlChange && this.chart.xOnUrlChange(newUrl);
};

/**
 * Returns an array of times which has a point on the chart
 * @returns {Array}
 */
infChart.StockChart.prototype.getPointPositions = function () {
    return this.processedData.pointPositions;
};

/**
 * Removing reference to given series in the time map and remove record if there is no references
 * @param seriesId
 */
infChart.StockChart.prototype.removeSeriesFromTimeMap = function (seriesId) {
    var timeMap = this.processedData.timeMap;

    infChart.util.forEach(timeMap, function (k, val) {
        if (val && val.indexOf(seriesId) >= 0) {
            val.splice(val.indexOf(seriesId), 1);
            if (!val.length) {
                delete timeMap[k];
            }
        }
    })

};

/**
 * Add given time to the map of time which keeps track of points added
 * @param time
 * @param seriesId
 * @param timeMap
 */
infChart.StockChart.prototype.addValueToTimeMap = function (time, seriesId, timeMap) {

    timeMap = timeMap || this.processedData.timeMap;

    if (!timeMap[time]) {
        timeMap[time] = [seriesId];
    } else if (timeMap[time].indexOf(seriesId) < 0) {
        timeMap[time].push(seriesId);
    }

};
/**
 * Retruns the time map
 * @returns {infChart.StockChart.processedData.timeMap|{}} time map
 */
infChart.StockChart.prototype.getAllTimeTicks = function () {
    return this.processedData.timeMap;
};

/**
 * Returns true if market of the main symbol is open 24 hours
 * @returns {boolean} linearity
 */
infChart.StockChart.prototype.isLinearData = function () {
    return !this.symbol || this.dataManager.isLinearData(this.symbol);
};

infChart.StockChart.prototype._isToolbarEnabled = function () {
    return this.settings.toolbar && this.settings.toolbar.enable && typeof infChart.toolbar === 'object';
};

infChart.StockChart.prototype._isOHLCRequired = function () {
    var required = false;
    switch (this.type) {
        case 'candlestick':
        case 'ohlc':
        case 'hlc':
        case 'heikinashi':
        case 'customCandle':
        case 'engulfingCandles':
            required = true;
            break;
        default :
            break;
    }
    return required;
};

/**
 * check chart period is custom
 * @returns {boolean}
 */
infChart.StockChart.prototype._isCustomPeriod = function () {
    return this.period == "C";
};

