//region **************************************  Elliot Wave Oscillator (EWO) Indicator******************************************

/***
 * Constructor for Elliot Wave Oscillator (EWO) Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
 infChart.ElliotWaveOscillator = function (id, chartId, type, chartInstance) {

    infChart.Indicator.apply(this, arguments);
    this.params.period1 = 5;
    this.params.period2 = 35;

    this.titleParams = ["period1", "period2"];
    this.axisId = "#EWO_" + id;

    this.addAxis({
        id: this.axisId,
        startOnTick: false,
        endOnTick: false
    });

    var color = infChart.util.getNextSeriesColor(chartId);

    this.series[0] = chartInstance.addSeries({
        id: id,
        name: "EWO",
        infIndType: "EWO",
        infIndSubType: "EWO",
        /* data: [],*/
        type: "column",
        infType: "indicator",
        yAxis: this.axisId,
        showInLegend: false,
        threshold: 0,
        lineColor: color,
        color: color
    }, true);

};

infChart.util.extend(infChart.Indicator, infChart.ElliotWaveOscillator);

infChart.ElliotWaveOscillator.prototype.calculate = function (ohlc, data, redraw) {
    var close = ohlc.c;

    if (data && data.length > 0) {
        var chart = this.chart;
        var ewo = this.getSeries(close, infChart.indicatorDefaults.ARITHMETICMOVINGAVERAGE, this.params.period1, this.params.period2);

        var _ewo = this.merge(data, ewo);
        chart.get(this.id).setData(_ewo, redraw, false, false);

    }
};

infChart.ElliotWaveOscillator.prototype.getSeries = function (cts, ma, nop1, nop2) {
    var retVal1, retVal2, k, len;
    retVal1 = this.movmean(cts, ma, nop1);
    retVal2 = this.movmean(cts, ma, nop2);

    for (k = 0, len = retVal1.length; k < len; k++) {
        if (retVal1[k] != undefined && retVal2[k] != undefined) {
            retVal1[k] = retVal1[k] - retVal2[k];
        }
    }
    return retVal1;
};

//endregion ************************************** Elliot Wave Oscillator (EWO) Indicator******************************************
