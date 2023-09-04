//region ************************************** Simple Moving Average (SMA) Indicator******************************************

/***
 * Constructor for Simple Moving Average (SMA)  Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
 infChart.SimpleMovingAverageIndicator = function (id, chartId, type, chartInstance) {

    infChart.Indicator.apply(this, arguments);

    this.params.period = 21;
    this.params.shift = 0;
    this.titleParams = ["period", "shift"];

    var color = infChart.util.getNextSeriesColor(chartId);

    this.series[0] = chartInstance.addSeries({
        id: id,
        infIndType: "SMA",
        infIndSubType: "SMA",
        name: "SMA",
        /* data: [],*/
        infType: "indicator",
        yAxis: "#0",
        color: color,
        lineColor: color,
        showInNavigator: false
    }, true);


};

infChart.util.extend(infChart.Indicator, infChart.SimpleMovingAverageIndicator);

infChart.SimpleMovingAverageIndicator.prototype.calculate = function (ohlc, data, redraw) {
    var close = ohlc.c;
    if (data && data.length > 0) {
        var chart = this.chart;
        var sma = this.getSeries(close, infChart.indicatorDefaults.ARITHMETICMOVINGAVERAGE, this.params.period, this.params.shift);
        var _sma = this.merge(data, sma);
        chart.get(this.id).setData(_sma, redraw, false, false);
    }
};

infChart.SimpleMovingAverageIndicator.prototype.getSeries = function (ts, ma, m, shift) {
    var retval = this.movmean(ts, ma, m);

    if (shift > 0) {
        var k = 0;
        for (k = 1; k < retval.length; k++) {
            retval[k] = +shift + retval[k];
        }
    }
    return retval;
};

//endregion **************************************Simple Moving Average (SMA) Indicator******************************************