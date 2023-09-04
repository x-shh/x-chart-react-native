//region ************************************** Keltner (KELT) Indicator******************************************

/***
 * Constructor for Keltner (KELT) Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
 infChart.KeltnerIndicator = function (id, chartId, type, chartInstance) {

    infChart.Indicator.apply(this, arguments);
    this.params.period1 = 20;
    this.params.period2 = 10;
    this.params.multiplier = 1;
    this.params.base = infChart.indicatorDefaults.ULCLOSEPRICE;

    this.titleParams = ["period1", "period2", "multiplier"];

    var color = infChart.util.getNextSeriesColor(chartId);

    this.series[0] = chartInstance.addSeries({
        id: id,
        name: "KELTUpper",
        infIndType: "KELT",
        infIndSubType: "KELTUpper",
        data: [],
        type: "line",
        infType: "indicator",
        yAxis: "#0",
        legendKey: "KELT",
        showInLegend: true,
        lineColor: color,
        color: color
    }, false);

    this.series[1] = chartInstance.addSeries({
        id: id + "_KELTM",
        name: "KELTMiddle",
        infIndType: "KELT",
        infIndSubType: "KELTMiddle",
        data: [],
        type: "line",
        dashStyle: "dot",
        infType: "indicator",
        yAxis: "#0",
        showInLegend: false,
        hideLegend: true,
        lineColor: color,
        color: color
    }, false);

    this.series[2] = chartInstance.addSeries({
        id: id + "_KELTL",
        name: "KELTLower",
        infIndType: "KELT",
        infIndSubType: "KELTLower",
        data: [],
        type: "line",
        infType: "indicator",
        yAxis: "#0",
        showInLegend: false,
        hideLegend: true,
        lineColor: color,
        color: color
    }, true);

};

infChart.util.extend(infChart.Indicator, infChart.KeltnerIndicator);

infChart.KeltnerIndicator.prototype.calculate = function (ohlc, data, redraw) {
    var high = ohlc.h,
        low = ohlc.l,
        close = ohlc.c,
        open = ohlc.o;

    if (data && data.length > 0) {
        var that = this;
        var kelt = this.getSeries(high, low, close, open, this.params.base, infChart.indicatorDefaults.EXPONENTIALMOVINGAVERAGE, infChart.indicatorDefaults.ARITHMETICMOVINGAVERAGE, this.params.period1, this.params.period2, this.params.multiplier);

        var _keltm = this.merge(data, kelt.middle, undefined, true);
        var _kelth = this.merge(data, kelt.upper, undefined, true);
        var _keltl = this.merge(data, kelt.lower, undefined, true);


        infChart.util.forEach(this.series, function (i, series) {
            switch (series.options.infIndSubType) {
                case 'KELTMiddle' :
                    series.setData(_keltm, false, false, false);
                    break;
                case 'KELTUpper' :
                    series.setData(_kelth, false, false, false);
                    break;
                case 'KELTLower' :
                    series.setData(_keltl, false, false, false);
                    break;
                default :
                    break;
            }

        });

        if (redraw) {
            var chart = this.chart;
            chart.redraw();
        }

    }
};

infChart.KeltnerIndicator.prototype.getSeries = function (hts, lts, cts, ots, ul, ma1, ma2, nop1, nop2, multiplier) {
    var ts, upper = new Array(hts.length), lower = new Array(hts.length), ema, atr, k, len;
    ts = this.movul(hts, lts, cts, ots, ul);
    ema = this.movmeanNew(ts, ma1, nop1);
    atr = this.movmeanNew(this.trNew(hts, lts, cts), ma2, nop2);

    var maxnop = Math.max(nop1, nop2);

    for (k = maxnop - 1, len = ts.length; k < len; k++) {
        if (this.isNumber(ema[k]) && this.isNumber(atr[k])) {
            upper[k] = ema[k] + multiplier * atr[k];
            lower[k] = ema[k] - multiplier * atr[k];
        }
    }
    return {middle: ema, upper: upper, lower: lower};
};

//endregion ************************************** Keltner (KELT) Indicator******************************************