//region **************************************  Median Price (MED) Indicator******************************************

/***
 * Constructor for Median Price (MP) Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
 infChart.MedianPriceIndicator = function (id, chartId, type, chartInstance) {

    infChart.Indicator.apply(this, arguments);

    var color = infChart.util.getNextSeriesColor(chartId);

    this.series[0] = chartInstance.addSeries({
        id: id,
        name: "MED",
        infIndType: "MED",
        infIndSubType: "MED",
        /* data: [],*/
        infType: "indicator",
        yAxis: "#0",
        lineColor: color,
        color: color
    }, true);

};

infChart.util.extend(infChart.Indicator, infChart.MedianPriceIndicator);

infChart.MedianPriceIndicator.prototype.calculate = function (ohlc, data, redraw) {
    var high = ohlc.h,
        low = ohlc.l;

    if (data && data.length > 0) {
        var chart = this.chart;
        var mp = this.getSeries(high, low);

        var _mp = this.merge(data, mp);
        chart.get(this.id).setData(_mp, redraw, false, false);

    }
};

infChart.MedianPriceIndicator.prototype.getSeries = function (hts, lts) {
    var k, retval;

    retval = new Array(hts.length);
    for (k = 0; k < retval.length; k++) {
        retval[k] = (hts[k] + lts[k]) / 2;
    }

    return retval;
};

//endregion ************************************** Median Price (MED)  Indicator******************************************

