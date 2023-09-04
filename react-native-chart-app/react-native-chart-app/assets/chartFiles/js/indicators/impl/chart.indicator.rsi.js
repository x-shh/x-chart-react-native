//region ************************************** Relative Strength (RSI) Indicator******************************************

/***
 * Cunstructor for Relative Strength (RSI) Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
infChart.RSIIndicator = function (id, chartId, type, chartInstance) {

    infChart.Indicator.apply(this, arguments);

    this.params.period = 14;
    this.params.upperLevel = 0.8;
    this.params.lowerLevel = 0.2;
    this.params.n = 1.0;
    this.params.base = infChart.indicatorDefaults.ULCLOSEPRICE;
    this.titleParams = ["period", "upperLevel", "lowerLevel", "n"];
    this.titleParamsDec = [0, 1, 1, 1];

    this.axisId = "#RSI_" + id;

    var colors = infChart.util.getSeriesColors(),
        upColor = infChart.util.getDefaultUpColor(),
        downColor = infChart.util.getDefaultDownColor();

    var theme = {
        fillOpacity: 0.3
    };

    if (Highcharts.theme && Highcharts.theme.indicator && Highcharts.theme.indicator.RSI) {
        theme = infChart.util.merge(theme, Highcharts.theme.indicator.RSI);
    }

    this.addAxis({
        id: this.axisId,
        min: 0,
        max: 1,
        startOnTick: false,
        endOnTick: false
    });


    this.series[1] = chartInstance.addSeries({
        "id": id + "_RSI2",
        infIndType: "RSI",
        infIndSubType: "RSI2",
        /* data: [],*/
        infType: "indicator",
        "yAxis": this.axisId,
        "name": "Upper",
        "color": upColor,
        "lineColor": upColor,
        "type": "arearange",
        fillOpacity: theme.fillOpacity,
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
        "id": id + "_RSI3",
        infIndType: "RSI",
        infIndSubType: "RSI3",
        /* data: [],*/
        infType: "indicator",
        "yAxis": this.axisId,
        "name": "Lower",
        "color": downColor,
        "lineColor": downColor,
        "type": "arearange",
        fillOpacity: theme.fillOpacity,
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
        infIndType: "RSI",
        infIndSubType: "RSI",
        name: "RSI",
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

infChart.util.extend(infChart.Indicator, infChart.RSIIndicator);

infChart.RSIIndicator.prototype.calculate = function (ohlc, data, redraw, seriesId) {
    var high = ohlc.h,
        low = ohlc.l,
        close = ohlc.c,
        open = ohlc.o;

    if (data && data.length > 0) {
        var chart = this.chart;


        if (!seriesId) {
            var rsi = this.getSeries(high, low, close, open, this.params.base, infChart.indicatorDefaults.EXPONENTIALMOVINGAVERAGE, this.params.period, parseFloat(this.params.n));
            var _rsi = this.merge(data, rsi);
            chart.get(this.id).setData(_rsi, redraw);

        }
        if (!seriesId || seriesId == (this.id + '_RSI2')) {
            var series = chart.get(this.id + '_RSI2');
            if (series.options.type === "line") {
                series.setData(this.getBand(data, series.options.type, this.params.upperLevel, this.params.upperLevel), redraw, false, false);
            } else {
                series.setData(this.getBand(data, series.options.type, 1, this.params.upperLevel), redraw, false, false);
            }
        }
        if (!seriesId || seriesId == (this.id + '_RSI3')) {
            var series4 = chart.get(this.id + '_RSI3');
            if (series4.options.type === "line") {
                series4.setData(this.getBand(data, series4.options.type, this.params.lowerLevel, this.params.lowerLevel), redraw, false, false);
            } else {
                series4.setData(this.getBand(data, series4.options.type, this.params.lowerLevel, 0), redraw, false, false);
            }
        }
    }
};

infChart.RSIIndicator.prototype.getSeries = function (hts, lts, cts, ots, ul, ma, nocp, n) {
    var ts = this.movul(hts, lts, cts, ots, ul);
    return this.rsi(ts, ul, ma, nocp, n);
};

/**
 * hide indicator
 */
infChart.RSIIndicator.prototype.hideIndicator = function (seriesId) {
    infChart.Indicator.prototype.hideIndicator.apply(this, [seriesId, true]);
};

/**
 * show indicator
 */
infChart.RSIIndicator.prototype.showIndicator = function (seriesId) {
    infChart.Indicator.prototype.showIndicator.apply(this, [seriesId, true]);
};

//endregion **************************************Relative Strength (RSI) Indicator******************************************