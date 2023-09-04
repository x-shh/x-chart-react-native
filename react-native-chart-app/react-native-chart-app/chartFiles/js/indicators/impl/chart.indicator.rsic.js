//region ************************************** Cutler RSI (RSIC) Indicator******************************************

/***
 * Cunstructor for Cutler RSI (RSIC) Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
 infChart.RSICIndicator = function (id, chartId, type, chartInstance) {

    infChart.Indicator.apply(this, arguments);

    this.params.period = 10;
    this.params.upperLevel = 0.8;
    this.params.lowerLevel = 0.2;
    this.params.n = 1.0;
    this.params.base = infChart.indicatorDefaults.ULCLOSEPRICE;
    this.titleParams = ["period", "upperLevel", "lowerLevel", "n"];
    this.titleParamsDec = [0, 1, 1, 1];
    this.axisId = "#RSIC_" + id;

    var colors = infChart.util.getSeriesColors(), upColor = infChart.util.getDefaultUpColor(), downColor = infChart.util.getDefaultDownColor();

    this.addAxis({
        id: this.axisId,
        min: 0,
        max: 1,
        startOnTick: false,
        endOnTick: false
    });


    this.series[1] = chartInstance.addSeries({
        "id": id + "_RSIC2",
        infIndType: "RSIC",
        infIndSubType: "RSIC2",
        /* data: [],*/
        infType: "indicator",
        "yAxis": this.axisId,
        "name": "Upper",
        "color": upColor,
        "lineColor": upColor,
        "type": "arearange",
        hideLegend: true,
        hideToolTip: true,
        infRecal: true,
        showInLegend: false,
        enableMouseTracking: true,
        states: {
            hover: {
                enabled: false
            }
        }
    }, false);

    this.series[2] = chartInstance.addSeries({
        "id": id + "_RSIC3",
        infIndType: "RSIC",
        infIndSubType: "RSIC3",
        /* data: [],*/
        infType: "indicator",
        "yAxis": this.axisId,
        "name": "Lower",
        "color": downColor,
        "lineColor": downColor,
        "type": "arearange",
        hideLegend: true,
        hideToolTip: true,
        showInLegend: false,
        enableMouseTracking: true,
        states: {
            hover: {
                enabled: false
            }
        }
    }, false);

    this.series[0] = chartInstance.addSeries({
        id: id,
        infIndType: "RSIC",
        infIndSubType: "RSIC",
        name: "RSIC",
        /* data: [],*/
        infType: "indicator",
        yAxis: this.axisId,
        showInLegend: false,
        color: colors[1],
        lineColor: colors[1],
        enableMouseTracking: true,
        states: {
            hover: {
                enabled: false
            }
        }
    }, true);

    this.style[this.series[1].options.id] = ["line", "arearange"];
    this.style[this.series[2].options.id] = ["line", "arearange"];
};

infChart.util.extend(infChart.Indicator, infChart.RSICIndicator);

infChart.RSICIndicator.prototype.calculate = function (ohlc, data, redraw, seriesId) {
    var high = ohlc.h,
        low = ohlc.l,
        close = ohlc.c,
        open = ohlc.o;

    if (data && data.length > 0) {
        var chart = this.chart;


        if (!seriesId) {
            var rsi = this.getSeries(high, low, close, open, this.params.base, infChart.indicatorDefaults.EXPONENTIALMOVINGAVERAGE, this.params.period, parseFloat(this.params.n));
            var _rsi = this.merge(data, rsi);
            chart.get(this.id).setData(_rsi, redraw, false, false);

        }
        if (!seriesId || seriesId == (this.id + '_RSIC2')) {
            var series = chart.get(this.id + '_RSIC2');
            if (series.options.type === "line") {
                series.setData(this.getBand(data, series.options.type, this.params.upperLevel, this.params.upperLevel), redraw, false, false);
            } else {
                series.setData(this.getBand(data, series.options.type, 1, this.params.upperLevel), redraw, false, false);
            }
        }
        if (!seriesId || seriesId == (this.id + '_RSIC3')) {
            var series4 = chart.get(this.id + '_RSIC3');
            if (series4.options.type === "line") {
                series4.setData(this.getBand(data, series4.options.type, this.params.lowerLevel, this.params.lowerLevel), redraw, false, false);
            } else {
                series4.setData(this.getBand(data, series4.options.type, this.params.lowerLevel, 0), redraw, false, false);
            }
        }
    }
};

infChart.RSICIndicator.prototype.getSeries = function (hts, lts, cts, ots, ul, ma, nocp, n) {
    var ts = this.movul(hts, lts, cts, ots, ul);
    ts = this.movmean(ts, infChart.indicatorDefaults.ARITHMETICMOVINGAVERAGE, nocp);
    return this.rsi(ts, ul, ma, nocp, n);
};

infChart.RSICIndicator.prototype.getContextMenuOptions = function (chartId, series, options) {
    return {
        "removeIndicator": {
            icon : options.removeIndicator.icon,
            displayText :options.removeIndicator.displayText,
            action : function () {
                let indicator = infChart.indicatorMgr.getIndicatorBySeriesId(chartId, series.options.id);
                infChart.manager.removeSeries(series.chart.renderTo.id, indicator.id, series.options.infType);
            }
        }
    }
};

/**
 * hide indicator
 */
infChart.RSICIndicator.prototype.hideIndicator = function (seriesId) {
    infChart.Indicator.prototype.hideIndicator.apply(this, [seriesId, true]);
};

/**
 * show indicator
 */
infChart.RSICIndicator.prototype.showIndicator = function (seriesId) {
    infChart.Indicator.prototype.showIndicator.apply(this, [seriesId, true]);
};
//endregion **************************************Cutler RSI (RSIC) Indicator******************************************
