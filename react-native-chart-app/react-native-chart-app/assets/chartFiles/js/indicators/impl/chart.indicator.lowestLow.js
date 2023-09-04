//region ************************************** Lowest Low (LowestL) Indicator******************************************

/***
 * Constructor for Highest High (HighestH) Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
 infChart.LowestLowIndicator = function (id, chartId, type, chartInstance) {

    infChart.Indicator.apply(this, arguments);

    this.params.period = 21;
    this.params.base = infChart.indicatorDefaults.ULLOWPRICE;

    var color = infChart.util.getNextSeriesColor(chartId);

    this.series[0] = chartInstance.addSeries({
        id: id,
        name: "LowestL",
        infIndType: "LowestL",
        infIndSubType: "LowestL",
        /* data: [],*/
        infType: "indicator",
        yAxis: "#0",
        color: color,
        lineColor: color
    }, true);
};

infChart.util.extend(infChart.Indicator, infChart.LowestLowIndicator);

infChart.LowestLowIndicator.prototype.calculate = function (ohlc, data, redraw) {
    var close = ohlc.c,
        high = ohlc.h,
        low = ohlc.l,
        open = ohlc.o;

    if (data && data.length > 0) {
        var chart = this.chart;
        var ll = this.getSeries(high, low, close, open, this.params.base, this.params.period);
        var _ll = this.merge(data, ll);
        chart.get(this.id).setData(_ll, redraw, false, false);
    }
};

infChart.LowestLowIndicator.prototype.getSeries = function (hts, lts, cts, ots, ul, m) {
    var ts = this.movul(hts, lts, cts, ots, ul);

    return this.movmin(ts, m);
};

//endregion **************************************Lowest Low (LowestL) Indicator******************************************