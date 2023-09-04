//region **************************************  Bid/ Ask Indicator (BA) Indicator******************************************

/***
 * Constructor for Bid/ Ask Indicator (BA) Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
 infChart.BidAskIndicator = function (id, chartId, type, chartInstance) {

    infChart.Indicator.apply(this, arguments);

    var color = infChart.util.getNextSeriesColor(chartId);

    this.series[0] = chartInstance.addSeries({
        id: id,
        name: "BA",
        infIndType: "BA",
        infIndSubType: "BID",
        /* data: [],*/
        infType: "indicator",
        yAxis: "#0",
        color: color,
        lineColor: color
    }, false);

    color = infChart.util.getNextSeriesColor(chartId);
    this.series[1] = chartInstance.addSeries({
        id: id + "_BA2",
        name: "BA",
        infIndType: "BA",
        infIndSubType: "ASK",
        /* data: [],*/
        infType: "indicator",
        yAxis: "#0",
        color: color,
        lineColor: color
    }, true);


};

infChart.util.extend(infChart.Indicator, infChart.BidAskIndicator);

infChart.BidAskIndicator.prototype.calculate = function (ohlc, data, redraw, seriesId) {
    var bid = ohlc.b;
    var ask = ohlc.a;
    if (data && data.length > 0) {
        var chart = this.chart;
        var _bid = this.merge(data, bid);
        chart.get(this.id).setData(_bid, redraw, false, false);
        var _ask = this.merge(data, ask);
        chart.get(this.id + "_BA2").setData(_ask, redraw, false, false);
    }
};

//endregion ************************************** Moving Average Centered (CMA)  Indicator******************************************
