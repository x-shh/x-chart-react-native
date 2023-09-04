//region **************************************  Moving Average Centered (CMA) Indicator******************************************

/***
 * Constructor for Moving Average Centered (CMA) Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
 infChart.MovingAverageCenteredIndicator = function (id, chartId, type, chartInstance) {

    infChart.Indicator.apply(this, arguments);
    this.params.period = 21;

    this.titleParams = ["period"];

    var color = infChart.util.getNextSeriesColor(chartId);

    this.series[0] = chartInstance.addSeries({
        id: id,
        name: "CMA",
        infIndType: "CMA",
        infIndSubType: "CMA",
        /* data: [],*/
        infType: "indicator",
        yAxis: "#0",
        color: color,
        lineColor: color
    }, true);

};

infChart.util.extend(infChart.Indicator, infChart.MovingAverageCenteredIndicator);

infChart.MovingAverageCenteredIndicator.prototype.calculate = function (ohlc, data, redraw, seriesId) {
    var close = ohlc.c;
    if (data && data.length > 0) {
        var chart = this.chart;
        var cma = this.getSeries(close, infChart.indicatorDefaults.ARITHMETICMOVINGAVERAGE, this.params.period);
        var _cma = this.merge(data, cma);
        chart.get(this.id).setData(_cma, redraw, false, false);
    }
};

infChart.MovingAverageCenteredIndicator.prototype.getSeries = function (cts, ma, nop1) {
    var k, retval1, retval2;

    retval1 = new Array(cts.length);
    retval2 = new Array(cts.length);

    retval1 = this.movmean(cts, ma, nop1);


    for (k = 1; k < retval1.length; k++) {
        if (retval1[k] != undefined && retval1[k - 1] != undefined) {
            retval2[k] = (retval1[k] + retval1[k - 1]) / 2;
        }
    }

    return retval2;
};

//endregion ************************************** Moving Average Centered (CMA)  Indicator******************************************s