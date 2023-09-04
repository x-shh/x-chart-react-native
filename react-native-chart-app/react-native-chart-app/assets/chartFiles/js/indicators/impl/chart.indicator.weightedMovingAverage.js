//region ************************************** Weighted Moving Average (WMA) Indicator******************************************

/***
 * Constructor for Weighted Moving Average (WMA)  Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
 infChart.WeightedMovingAverageIndicator = function (id, chartId, type, chartInstance) {

    infChart.Indicator.apply(this, arguments);

    this.params.period = 21;
    this.params.shift = 0;
    this.titleParams = ["period", "shift"];

    var color = infChart.util.getNextSeriesColor(chartId);

    this.series[0] = chartInstance.addSeries({
        id: id,
        name: "WMA",
        infIndType: "WMA",
        infIndSubType: "WMA",
        /* data: [],*/
        infType: "indicator",
        yAxis: "#0",
        color: color,
        lineColor: color
    }, true);
};

infChart.util.extend(infChart.Indicator, infChart.WeightedMovingAverageIndicator);

infChart.WeightedMovingAverageIndicator.prototype.calculate = function (ohlc, data, redraw) {
    var close = ohlc.c;
    if (data && data.length > 0) {
        var chart = this.chart;
        var wma = this.getSeries(close, infChart.indicatorDefaults.WEIGHTEDMOVINGAVERAGE, this.params.period, this.params.shift);
        var _wma = this.merge(data, wma);
        chart.get(this.id).setData(_wma, redraw, false, false);
    }
};

infChart.WeightedMovingAverageIndicator.prototype.getSeries = function (ts, ma, m, shift) {
    var retval = this.movmean(ts, ma, m);

    if (shift > 0) {
        var k = 0;
        for (k = 1; k < retval.length; k++) {
            retval[k] = +shift + retval[k];
        }
    }
    return retval;
};

//endregion **************************************Weighted Moving Average (WMA) Indicator******************************************