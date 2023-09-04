//region **************************************  Acceleration Deceleration Oscillator (ADOsci) Indicator******************************************

/***
 * Constructor for Acceleration Deceleration Oscillator (ADOsci) Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
 infChart.AccelerationDecelerationOscillatorIndicator = function (id, chartId, type, chartInstance) {

    infChart.Indicator.apply(this, arguments);

    this.params.period = 5;

    this.titleParams = ["period"];

    this.axisId = "#ADOsci_" + id;

    this.addAxis({
        id: this.axisId,
        startOnTick: false,
        endOnTick: false
    });

    var upColor = infChart.util.getDefaultUpColor(), downColor = infChart.util.getDefaultDownColor();

    this.series[0] = chartInstance.addSeries({
        id: id,
        name: "ADOsci",
        infIndType: "ADOsci",
        infIndSubType: "ADOsci",
        infType: "indicator",
        type: "column",
        yAxis: this.axisId,
        showInLegend: false,
        negativeFillColor: downColor,
        negativeColor: downColor,
        hasColumnNegative: true,
        hasAreaNegative: true,
        color: upColor,
        threshold: 0,
        fillColor: upColor,
        fillOpacity: 0.5
    }, true);
};

infChart.util.extend(infChart.Indicator, infChart.AccelerationDecelerationOscillatorIndicator);

infChart.AccelerationDecelerationOscillatorIndicator.prototype.calculate = function (ohlc, data, redraw) {
    var high = ohlc.h,
        low = ohlc.l;

    if (data && data.length > 0) {
        var chart = this.chart;
        var vhf = this.getSeries(high, low, infChart.indicatorDefaults.ARITHMETICMOVINGAVERAGE, 5, 35, this.params.period);
        var _vhf = this.merge(data, vhf);
        chart.get(this.id).setData(_vhf, redraw, false, false);
    }
};

infChart.AccelerationDecelerationOscillatorIndicator.prototype.getSeries = function (hts, lts, ma, nop1, nop2, nop3) {
    var k, retval1, ao, ts;
    retval1 = new Array(hts.length);
    ao = this.awesomeOsi(hts, lts, ma, nop1, nop2);
    ts = this.movmean(ao, ma, nop3);

    for (k = 0; k < hts.length; k++) {
        if (ao[k] != undefined && ts[k] != undefined) {
            retval1[k] = ao[k] - ts[k];
        }
    }

    return retval1;
};

//endregion **************************************Acceleration Deceleration Oscillator (ADOsci)  Indicator******************************************


