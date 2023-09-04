//region **************************************  Awesome Oscillator (AwesomeOsci) Indicator******************************************

/***
 * Constructor for Awesome Oscillator (AwesomeOsci) Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
 infChart.AwesomeOscillatorIndicator = function (id, chartId, type, chartInstance) {

    infChart.Indicator.apply(this, arguments);

    this.axisId = "#AwesomeOsci_" + id;


    this.addAxis({
        id: this.axisId,
        startOnTick: false,
        endOnTick: false
    });

    var upColor = infChart.util.getDefaultUpColor(), downColor = infChart.util.getDefaultDownColor();

    this.series[0] = chartInstance.addSeries({
        id: id,
        name: "AwesomeOsci",
        infIndType: "AwesomeOsci",
        infIndSubType: "AwesomeOsci",
        /* data: [],*/
        infType: "indicator",
        type: "line",
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

infChart.util.extend(infChart.Indicator, infChart.AwesomeOscillatorIndicator);

infChart.AwesomeOscillatorIndicator.prototype.calculate = function (ohlc, data, redraw) {
    var high = ohlc.h,
        low = ohlc.l;

    if (data && data.length > 0) {
        var chart = this.chart;
        var vhf = this.getSeries(high, low, infChart.indicatorDefaults.ARITHMETICMOVINGAVERAGE, 5, 34);
        var _vhf = this.merge(data, vhf);
        var series = chart.get(this.id);
        series.setData(_vhf, redraw, false, false);
        /*if (series.type != "area") {
         /!* This is done for fixing an exepction thrown from highcharts when drawing area having negative colors without data *!/
            series.update({type: "area"});
         }*/
    }
};

infChart.AwesomeOscillatorIndicator.prototype.getSeries = function (hts, lts, ma, nop1, nop2) {

    return this.awesomeOsi(hts, lts, ma, nop1, nop2);
};

//endregion **************************************Awesome Oscillator (AwesomeOsci)  Indicator******************************************