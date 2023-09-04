//region ************************************** Chaikin Oscillator (CHO) Indicator******************************************

/***
 * Constructor for Chaikin Oscillator (CHO)  Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
 infChart.ChaikinOscillatorIndicator = function (id, chartId, type, chartInstance) {

    infChart.Indicator.apply(this, arguments);

    this.axisId = "#CHO_" + id;

    var colors = infChart.util.getSeriesColors();

    this.addAxis({
        id: this.axisId,
        startOnTick: false,
        endOnTick: false
    });


    this.series[0] = chartInstance.addSeries({
        id: id,
        infIndType: "CHO",
        infIndSubType: "CHO",
        name: "CHO",
        /* data: [],*/
        infType: "indicator",
        yAxis: this.axisId,
        showInLegend: false,
        color: colors[0],
        lineColor: colors[0]
    }, true);


};

infChart.util.extend(infChart.Indicator, infChart.ChaikinOscillatorIndicator);

infChart.ChaikinOscillatorIndicator.prototype.calculate = function (ohlc, data, redraw) {
    var open = ohlc.o,
        high = ohlc.h,
        low = ohlc.l,
        close = ohlc.c,
        volume = ohlc.v;
    if (data && data.length > 0) {
        var chart = this.chart;
        var cho = this.getSeries(open, high, low, close, volume, infChart.indicatorDefaults.ADL_COEFF_WITH_CLOSE_PRICES, infChart.indicatorDefaults.EXPONENTIALMOVINGAVERAGE, 10,
            3);
        var _cho = this.merge(data, cho);
        chart.get(this.id).setData(_cho, redraw, false, false);
    }
};

infChart.ChaikinOscillatorIndicator.prototype.getSeries = function (ots, hts, lts, cts, vts, coeff, ma, nocp1, nocp2) {
    var adl, cho, aadl2, k;
    adl = this.adl(ots, hts, lts, cts, vts, 1, coeff, infChart.indicatorDefaults.ARITHMETICMOVINGAVERAGE, 1);
    cho = this.movmean(adl, ma, nocp1);
    aadl2 = this.movmean(adl, ma, nocp2);
    for (k = 0; k < cho.length; k++)
        cho[k] = cho[k] - aadl2[k];
    return cho;
};

//endregion **************************************Chaikin Oscillator (CHO) Indicator******************************************
