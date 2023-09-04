//region ************************************** Exponential Moving Average (EMA) Indicator******************************************
/***
 * Constructor for Exponential Moving Average (EMA) Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
 infChart.EMAIndicator = function (id, chartId, type, chartInstance) {

    infChart.Indicator.apply(this, arguments);

    this.params.period = 21;
    this.params.shift = 0;
    this.titleParams = ["period", "shift"];

    var color = infChart.util.getNextSeriesColor(chartId);

    this.series[0] = chartInstance.addSeries({
        id: id,
        name: "EMA",
        infIndType: "EMA",
        infIndSubType: "EMA",
        /* data: [],*/
        infType: "indicator",
        yAxis: "#0",
        color: color,
        lineColor: color
    }, true);


};

infChart.util.extend(infChart.Indicator, infChart.EMAIndicator);

infChart.EMAIndicator.prototype.calculate = function (ohlc, data, redraw) {
    var close = ohlc.c;
    if (data && data.length > 0) {
        var chart = this.chart;
        var ema = this.getSeries(close, infChart.indicatorDefaults.EXPONENTIALMOVINGAVERAGE, this.params.period, this.params.shift);
        var _ema = this.merge(data, ema);
        chart.get(this.id).setData(_ema, redraw, false, false);
    }
};

infChart.EMAIndicator.prototype.getSeries = function (ts, ma, m, shift) {

    var retval = this.movmeanNew(ts, ma, m);

    if (shift > 0) {
        var k = 0;
        for (k = m - 1; k < retval.length; k++) {
            retval[k] = +shift + retval[k];
        }
    }
    return retval;
};

//endregion **************************************Exponential Moving Average (EMA) Indicator******************************************
