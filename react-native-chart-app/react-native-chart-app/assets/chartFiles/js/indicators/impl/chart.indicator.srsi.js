//region ************************************** Stochastic RSI (SRSI) Indicator******************************************

/***
 * Cunstructor for Stochastic RSI (SRSI) Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
 infChart.SRSIIndicator = function (id, chartId, type, chartInstance) {

    infChart.Indicator.apply(this, arguments);

    this.params.period = 14;
    this.params.upperLevel = 0.8;
    this.params.lowerLevel = 0.2;
    this.params.n = 1.0;
    this.params.base = infChart.indicatorDefaults.ULCLOSEPRICE;
    this.titleParams = ["period", "upperLevel", "lowerLevel", "n"];
    this.titleParamsDec = [0, 1, 1, 1];
    this.axisId = "#SRSI_" + id;

    var upColor = infChart.util.getDefaultUpColor(), downColor = infChart.util.getDefaultDownColor();

    this.addAxis({
        id: this.axisId,
        min: 0,
        max: 1,
        startOnTick: false,
        endOnTick: false
    });


    this.series[1] = chartInstance.addSeries({
        "id": id + "_SRSI2",
        infIndType: "SRSI",
        infIndSubType: "SRSI2",
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
        "id": id + "_SRSI3",
        infIndType: "SRSI",
        infIndSubType: "SRSI3",
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
        infIndType: "SRSI",
        infIndSubType: "SRSI",
        name: "SRSI",
        /* data: [],*/
        infType: "indicator",
        yAxis: this.axisId,
        showInLegend: false,
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

infChart.util.extend(infChart.Indicator, infChart.SRSIIndicator);

infChart.SRSIIndicator.prototype.calculate = function (ohlc, data, redraw, seriesId) {
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
        if (!seriesId || seriesId == (this.id + '_SRSI2')) {
            var series = chart.get(this.id + '_SRSI2');
            if (series.options.type === "line") {
                series.setData(this.getBand(data, series.options.type, this.params.upperLevel, this.params.upperLevel), redraw, false, false);
            } else {
                series.setData(this.getBand(data, series.options.type, 1, this.params.upperLevel), redraw, false, false);
            }
        }
        if (!seriesId || seriesId == (this.id + '_SRSI3')) {
            var series4 = chart.get(this.id + '_SRSI3');
            if (series4.options.type === "line") {
                series4.setData(this.getBand(data, series4.options.type, this.params.lowerLevel, this.params.lowerLevel), redraw, false, false);
            } else {
                series4.setData(this.getBand(data, series4.options.type, this.params.lowerLevel, 0), redraw, false, false);
            }
        }
    }
};

infChart.SRSIIndicator.prototype.getSeries = function (hts, lts, cts, ots, ul, ma, nocp, n) {

    var k, srsi,
        ts = this.movul(hts, lts, cts, ots, ul),
        rsi = this.rsi(ts, ul, ma, nocp, n),
        hrsi = this.movmax(rsi, nocp),
        lrsi = this.movmin(rsi, nocp);

    srsi = new Array(rsi.length);

    for (k = 0; k < srsi.length; k++) {
        if (hrsi[k] != lrsi[k])
            srsi[k] = (rsi[k] - lrsi[k]) / (hrsi[k] - lrsi[k]);
    }

    return srsi;
};

/**
 * hide indicator
 */
infChart.SRSIIndicator.prototype.hideIndicator = function (seriesId) {
    infChart.Indicator.prototype.hideIndicator.apply(this, [seriesId, true]);
};

/**
 * show indicator
 */
infChart.SRSIIndicator.prototype.showIndicator = function (seriesId) {
    infChart.Indicator.prototype.showIndicator.apply(this, [seriesId, true]);
};

//endregion **************************************Stochastic RSI (SRSI) Indicator******************************************
