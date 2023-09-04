//region ************************************** Highest High (HighestH) Indicator******************************************

/***
 * Constructor for Highest High (HighestH) Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
 infChart.HighestHighIndicator = function (id, chartId, type, chartInstance) {

    infChart.Indicator.apply(this, arguments);

    this.params.period = 21;
    this.params.base = infChart.indicatorDefaults.ULHIGHPRICE;

    var color = infChart.util.getNextSeriesColor(chartId);

    this.series[0] = chartInstance.addSeries({
        id: id,
        name: "HighestH",
        infIndType: "HighestH",
        infIndSubType: "HighestH",
        /* data: [],*/
        infType: "indicator",
        yAxis: "#0",
        color: color,
        lineColor: color
    }, true);
};

infChart.util.extend(infChart.Indicator, infChart.HighestHighIndicator);

infChart.HighestHighIndicator.prototype.calculate = function (ohlc, data, redraw) {
    var close = ohlc.c,
        high = ohlc.h,
        low = ohlc.l,
        open = ohlc.o;

    if (data && data.length > 0) {
        var chart = this.chart;
        var hh = this.getSeries(high, low, close, open, this.params.base, this.params.period);
        var _hh = this.merge(data, hh);
        chart.get(this.id).setData(_hh, redraw, false, false);
    }
};

infChart.HighestHighIndicator.prototype.getSeries = function (hts, lts, cts, ots, ul, m) {
    var ts = this.movul(hts, lts, cts, ots, ul);

    return this.movmax(ts, m);
};

//endregion **************************************Highest High (HighestH) Indicator******************************************