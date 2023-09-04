//region ************************************** Aroon (AR) Indicator******************************************

/***
 * Cunstructor for Aroon (AR) Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
 infChart.AroonIndicator = function (id, chartId, type, chartInstance) {

    infChart.Indicator.apply(this, arguments);
    this.params.period = 25;
    this.axisId = "#AR_" + id;

    var colors = infChart.util.getSeriesColors();

    this.addAxis({
        id: this.axisId,
        startOnTick: false,
        endOnTick: false
    });

    this.series[0] = chartInstance.addSeries({
        id: id,
        infIndType: "AR",
        infIndSubType: "AR",
        name: "AR",
        /* data: [],*/
        infType: "indicator",
        yAxis: this.axisId,
        showInLegend: false,
        color: colors[0],
        lineColor: colors[0]
    }, true);


};

infChart.util.extend(infChart.Indicator, infChart.AroonIndicator);

infChart.AroonIndicator.prototype.calculate = function (ohlc, data, redraw) {
    var high = ohlc.h,
        low = ohlc.l;
    if (data && data.length > 0) {
        var chart = this.chart;
        var ar = this.getSeries(high, low, this.params.period);
        var _ar = this.merge(data, ar);
        chart.get(this.id).setData(_ar, redraw, false, false);
    }
};

infChart.AroonIndicator.prototype.getSeries = function (hts, lts, nocp) {
    var ar, ard, k;
    ar = this.arud(hts, lts, 1, nocp);
    ard = this.arud(hts, lts, 2, nocp);
    for (k = 0; k < ar.length; k++)
        ar[k] = ar[k] - ard[k];
    return ar;
};

//endregion **************************************Aroon (AR) Indicator******************************************

