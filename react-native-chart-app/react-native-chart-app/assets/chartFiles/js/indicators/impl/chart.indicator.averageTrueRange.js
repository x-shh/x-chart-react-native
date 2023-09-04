//region ************************************** Average True Range (ATR) Indicator******************************************

/***
 * Constructor for Average True Range (ATR) Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
 infChart.AverageTrueRangeIndicator = function (id, chartId, type, chartInstance) {

    infChart.Indicator.apply(this, arguments);

    this.params.period = 14;
    this.axisId = "#ATR_" + id;

    var colors = infChart.util.getSeriesColors();

    this.addAxis({
        id: this.axisId,
        startOnTick: false,
        endOnTick: false
    });


    this.series[0] = chartInstance.addSeries({
        id: id,
        infIndType: "ATR",
        infIndSubType: "ATR",
        name: "ATR",
        /* data: [],*/
        infType: "indicator",
        yAxis: this.axisId,
        showInLegend: false,
        color: colors[0],
        lineColor: colors[0]
    }, true);


};

infChart.util.extend(infChart.Indicator, infChart.AverageTrueRangeIndicator);

infChart.AverageTrueRangeIndicator.prototype.calculate = function (ohlc, data, redraw) {
    var high = ohlc.h,
        low = ohlc.l,
        close = ohlc.c;
    if (data && data.length > 0) {
        var chart = this.chart;
        var atr = this.getSeries(high, low, close, infChart.indicatorDefaults.ARITHMETICMOVINGAVERAGE, this.params.period);
        var _atr = this.merge(data, atr);
        chart.get(this.id).setData(_atr, redraw, false, false);
    }
};

infChart.AverageTrueRangeIndicator.prototype.getSeries = function (hts, lts, cts, ma, nocp) {
    return this.movmeanNew(this.trNew(hts, lts, cts), ma, nocp);
};

//endregion **************************************Average True Range (ATR) Indicator******************************************s