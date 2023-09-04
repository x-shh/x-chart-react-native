
//region ************************************** Moving Average Triangular (TRIMA) Indicator******************************************
/***
 * Constructor for Moving Average Triangular (TRIMA) Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
 infChart.TRIMAIndicator = function (id, chartId, type, chartInstance) {

    infChart.Indicator.apply(this, arguments);

    this.params.period = 21;
    this.params.base = infChart.indicatorDefaults.ULCLOSEPRICE;
    this.titleParams = ["period", "shift"];

    var color = infChart.util.getNextSeriesColor(chartId);

    this.series[0] = chartInstance.addSeries({
        id: id,
        name: "TRIMA",
        infIndType: "TRIMA",
        infIndSubType: "TRIMA",
        /* data: [],*/
        infType: "indicator",
        yAxis: "#0",
        color: color,
        lineColor: color
    }, true);


};

infChart.util.extend(infChart.Indicator, infChart.TRIMAIndicator);

infChart.TRIMAIndicator.prototype.calculate = function (ohlc, data, redraw) {
    var high = ohlc.h,
        low = ohlc.l,
        close = ohlc.c,
        open = ohlc.o;
    if (data && data.length > 0) {
        var chart = this.chart;
        var ema = this.getSeries(high, low, close, open, this.params.base, infChart.indicatorDefaults.ARITHMETICMOVINGAVERAGE, this.params.period, this.params.shift);
        var _ema = this.merge(data, ema);
        chart.get(this.id).setData(_ema, redraw, false, false);
    }
};

infChart.TRIMAIndicator.prototype.getSeries = function (hts, lts, cts, ots, ul, ma, m, shift) {

    var retval = this.movmean(this.movul(hts, lts, cts, ots, ul), ma, m);

    retval = this.movmean(retval, infChart.indicatorDefaults.WEIGHTEDMOVINGAVERAGE, m);
    return retval;
};

//endregion **************************************Moving Average Triangular (TRIMA) Indicator******************************************
