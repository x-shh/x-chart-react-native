//region ************************************** Average Direction Index (ADX) Indicator******************************************

/***
 * Constructor for Average Direction Index (ADX) Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
 infChart.AverageDirectionIndexIndicator = function (id, chartId, type, chartInstance) {

    infChart.Indicator.apply(this, arguments);

    this.params.period = 14;
    this.axisId = "#ADX_" + id;

    var colors = infChart.util.getSeriesColors();

    this.addAxis({
        id: this.axisId,
        startOnTick: false,
        endOnTick: false
    });

    this.series[0] = chartInstance.addSeries({
        id: id,
        infIndType: "ADX",
        infIndSubType: "ADX",
        name: "ADX",
        /* data: [],*/
        infType: "indicator",
        yAxis: this.axisId,
        showInLegend: false,
        color: colors[0],
        lineColor: colors[0]
    }, true);


};

infChart.util.extend(infChart.Indicator, infChart.AverageDirectionIndexIndicator);

infChart.AverageDirectionIndexIndicator.prototype.calculate = function (ohlc, data, redraw) {
    var high = ohlc.h,
        low = ohlc.l,
        close = ohlc.c;
    if (data && data.length > 0) {
        var chart = this.chart;
        var adx = this.getSeries(high, low, close, infChart.indicatorDefaults.EXPONENTIALMOVINGAVERAGE, this.params.period, this.params.period);
        var _adx = this.merge(data, adx);
        chart.get(this.id).setData(_adx, redraw, false, false);
    }
};

infChart.AverageDirectionIndexIndicator.prototype.getSeries = function (hts, lts, cts, ma, nocp1, nocp2) {
    return this.movmean(this.dmi(hts, lts, cts, 3, ma, nocp1), ma, nocp2);
};

//endregion **************************************Average Direction Index (ADX) Indicator******************************************