//region ************************************** Standard Deviation (StdDev)Indicator******************************************

/***
 * Cunstructor for Standard Deviation (StdDev) Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
 infChart.StandardDeviationIndicator = function (id, chartId, type, chartInstance) {

    infChart.Indicator.apply(this, arguments);

    this.params.period = 5;
    this.titleParams = ["period"];

    this.axisId = "#StdDev_" + id;

    this.addAxis({
        id: this.axisId,
        startOnTick: false,
        endOnTick: false
    });


    this.series[0] = chartInstance.addSeries({
        "id": id,
        infIndType: "StdDev",
        infIndSubType: "StdDev",
        "type": "line",
        "yAxis": this.axisId,
        showInLegend: false,
        "name": "StdDev",
        /* data: [],*/
        infType: "indicator"
    }, true);

};

infChart.util.extend(infChart.Indicator, infChart.StandardDeviationIndicator);

infChart.StandardDeviationIndicator.prototype.calculate = function (ohlc, data, redraw) {
    var
        close = ohlc.c;
    if (data && data.length > 0) {
        var chart = this.chart;

        var stdDev = this.getSeries(close, infChart.indicatorDefaults.MOVINGSTANDARDDEVIATION, this.params.period);
        var _stdDev = this.merge(data, stdDev);
        chart.get(this.id).setData(_stdDev, redraw, false, false);

    }
};

infChart.StandardDeviationIndicator.prototype.getSeries = function (cts, md, nocp) {
    var dev;
    dev = this.movdev(cts, md, nocp);
    return dev;
};

//endregion **************************************Standard Deviation Indicator******************************************