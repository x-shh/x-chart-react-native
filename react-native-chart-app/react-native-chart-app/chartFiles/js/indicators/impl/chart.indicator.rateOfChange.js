//region ************************************** On Rate of Change (ROC) Indicator******************************************

/***
 * Constructor for Rate of Change (ROC) Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
 infChart.RateOfChangeIndicator = function (id, chartId, type, chartInstance) {

    infChart.Indicator.apply(this, arguments);

    this.params.period = 14;
    this.axisId = "#ROC_" + id;

    var colors = infChart.util.getSeriesColors();

    this.addAxis({
        id: this.axisId,
        startOnTick: false,
        endOnTick: false
    });


    this.series[0] = chartInstance.addSeries({
        id: id,
        name: "ROC",
        infIndType: "ROC",
        infIndSubType: "ROC",
        /* data: [],*/
        infType: "indicator",
        yAxis: this.axisId,
        showInLegend: false,
        color: colors[1],
        lineColor: colors[1]
    }, true);


};

infChart.util.extend(infChart.Indicator, infChart.RateOfChangeIndicator);

infChart.RateOfChangeIndicator.prototype.calculate = function (ohlc, data, redraw) {
    var high = ohlc.h,
        low = ohlc.l,
        close = ohlc.c,
        open = ohlc.o;
    if (data && data.length > 0) {
        var chart = this.chart;
        var roc = this.getSeries(high, low, close, open, infChart.indicatorDefaults.ULCLOSEPRICE, this.params.period);
        var _roc = this.merge(data, roc);
        chart.get(this.id).setData(_roc, redraw, false, false);
    }
};

infChart.RateOfChangeIndicator.prototype.getSeries = function (hts, lts, cts, ots, ul, nocp) {

    return this.roc(hts, lts, cts, ots, ul, nocp);
};

//endregion **************************************Rate of Change (ROC) Indicator******************************************

