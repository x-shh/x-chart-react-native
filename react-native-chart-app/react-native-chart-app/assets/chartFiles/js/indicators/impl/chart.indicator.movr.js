//region ************************************** Rolling Moving Average (MOVR) Indicator******************************************
/***
 * Constructor for Rolling Moving Average (MOVR) Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
 infChart.MOVRIndicator = function (id, chartId, type, chartInstance) {

    infChart.Indicator.apply(this, arguments);

    this.params.period = 21;
    this.params.shift = 0;
    this.params.base = infChart.indicatorDefaults.ULCLOSEPRICE;
    this.titleParams = ["period", "shift"];

    var color = infChart.util.getNextSeriesColor(chartId);

    this.series[0] = chartInstance.addSeries({
        id: id,
        name: "MOVR",
        infIndType: "MOVR",
        infIndSubType: "MOVR",
        /* data: [],*/
        infType: "indicator",
        yAxis: "#0",
        color: color,
        lineColor: color
    }, true);


};

infChart.util.extend(infChart.Indicator, infChart.MOVRIndicator);

infChart.MOVRIndicator.prototype.calculate = function (ohlc, data, redraw) {
    var high = ohlc.h,
        low = ohlc.l,
        close = ohlc.c,
        open = ohlc.o;
    if (data && data.length > 0) {
        var chart = this.chart;
        var ema = this.getSeries(high, low, close, open, this.params.base, infChart.indicatorDefaults.ROLLINGMOVINGAVERAGE, this.params.period, this.params.shift);
        var _ema = this.merge(data, ema);
        chart.get(this.id).setData(_ema, redraw, false, false);
    }
};

infChart.MOVRIndicator.prototype.getSeries = function (hts, lts, cts, ots, ul, ma, m, shift) {

    var retval = this.movmean(this.movul(hts, lts, cts, ots, ul), ma, m);

    if (shift > 0) {
        var k = 0;
        for (k = 1; k < retval.length; k++) {
            retval[k] = +shift + retval[k];
        }
    }
    return retval;
};

//endregion **************************************Rolling Moving Average (MOVR) Indicator******************************************
