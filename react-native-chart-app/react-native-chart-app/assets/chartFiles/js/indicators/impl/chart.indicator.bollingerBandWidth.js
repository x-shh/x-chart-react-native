//region **************************************Bollinger Band Width (BBW)Indicator******************************************

/***
 * constructor for Bollinger Band Width (BBW) Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
 infChart.BollingerBandWidthIndicator = function (id, chartId, type, chartInstance) {

    infChart.Indicator.apply(this, arguments);

    this.params.period = 20;
    this.params.deviation1 = 2;
    this.params.deviation2 = -2;
    this.params.base = infChart.indicatorDefaults.ULCLOSEPRICE;
    this.titleParams = ["period", "deviation1", "deviation2"];

    this.axisId = "#BBW_" + id;

    this.addAxis({
        id: this.axisId,
        startOnTick: false,
        endOnTick: false
    });

    var colors = infChart.util.getSeriesColors();

    this.series[0] = chartInstance.addSeries({
        id: id,
        name: "BBW",
        infIndType: "BBW",
        infIndSubType: "BBW",
        /*data: [],*/
        infType: "indicator",
        yAxis: this.axisId,
        showInLegend: false,
        color: colors[0],
        lineColor: colors[0]
    }, true);


};

infChart.util.extend(infChart.Indicator, infChart.BollingerBandWidthIndicator);

infChart.BollingerBandWidthIndicator.prototype.calculate = function (ohlc, data, redraw) {
    var high = ohlc.h,
        low = ohlc.l,
        close = ohlc.c;
    if (data && data.length > 0) {
        var chart = this.chart;
        var bbw = this.getSeries(high, low, close, open, this.params.base, infChart.indicatorDefaults.ARITHMETICMOVINGAVERAGE,
            infChart.indicatorDefaults.EXPONENTIALMOVINGAVERAGE, this.params.period, this.params.deviation1, this.params.deviation2);
        var _bbw = this.merge(data, bbw);
        chart.get(this.id).setData(_bbw, redraw, false, false);
    }
};

infChart.BollingerBandWidthIndicator.prototype.getSeries = function (hts, lts, cts, ots, ul, ma, md, nocp, delta1, delta2) {
    var ts, bb, dev, k, ubb, lbb;
    ts = this.movul(hts, lts, cts, ots, ul);
    bb = this.movmean(ts, ma, nocp);
    var bbw = new Array(bb.length);

    dev = this.movdev(ts, md, nocp);
    for (k = 0; k < bb.length; k++) {
        ubb = bb[k] + delta1 * dev[k];
        lbb = bb[k] + delta2 * dev[k];
        bbw[k] = ((ubb - lbb) / bb[k]) * 100;
    }
    return bbw
};


//endregion **************************************Bollinger Band Width(BBW) Indicator******************************************
