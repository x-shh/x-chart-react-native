//region ************************************** True Range (TrueR) Indicator******************************************

/***
 * Constructor for True Range (TrueR) Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
 infChart.TrueRangeIndicator = function (id, chartId, type, chartInstance) {

    infChart.Indicator.apply(this, arguments);

    this.axisId = "#TrueR_" + id;

    var colors = infChart.util.getSeriesColors();

    this.addAxis({
        id: this.axisId,
        startOnTick: false,
        endOnTick: false
    });


    this.series[0] = chartInstance.addSeries({
        id: id,
        infIndType: "TrueR",
        infIndSubType: "TrueR",
        name: "TrueR",
        /* data: [],*/
        infType: "indicator",
        yAxis: this.axisId,
        showInLegend: false,
        color: colors[0],
        lineColor: colors[0]
    }, true);


};

infChart.util.extend(infChart.Indicator, infChart.TrueRangeIndicator);

infChart.TrueRangeIndicator.prototype.calculate = function (ohlc, data, redraw) {
    var high = ohlc.h,
        low = ohlc.l,
        close = ohlc.c;
    if (data && data.length > 0) {
        var chart = this.chart;
        var tr = this.getSeries(high, low, close);
        var _tr = this.merge(data, tr);
        chart.get(this.id).setData(_tr, redraw, false, false);
    }
};

infChart.TrueRangeIndicator.prototype.getSeries = function (hts, lts, cts) {
    return this.trNew(hts, lts, cts);
};

//endregion **************************************True Range (TrueR) Indicator******************************************