//region ************************************** TRIX Indicator******************************************

/***
 * Constructor for TRIX  Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
 infChart.TRIXIndicator = function (id, chartId, type, chartInstance) {

    infChart.Indicator.apply(this, arguments);

    this.params.period = 21;
    this.params.base = infChart.indicatorDefaults.ULCLOSEPRICE;
    this.titleParams = ["period"];

    this.axisId = "#TRIX_" + id;

    this.addAxis({
        id: this.axisId,
        startOnTick: false,
        endOnTick: false
    });


    this.series[0] = chartInstance.addSeries({
        id: id,
        name: "TRIX",
        infIndType: "TRIX",
        infIndSubType: "TRIX",
        /* data: [],*/
        infType: "indicator",
        yAxis: this.axisId,
        showInLegend: false
    }, false);

    var upColor = infChart.util.getDefaultUpColor(), downColor = infChart.util.getDefaultDownColor();

    this.series[1] = chartInstance.addSeries({
        id: id + "_TRIX2",
        name: "Area",
        infIndType: "TRIX",
        infIndSubType: "TRIX2",
        /* data: [],*/
        infType: "indicator",
        yAxis: this.axisId,
        type: "line",
        fillColor: upColor,
        negativeFillColor: downColor,
        lineWidth: 0,
        zIndex: 3,
        fillOpacity: 0.5,
        threshold: 0,
        hideLegend: true,
        visible: false,
        showInLegend: false
    }, true);

    this.onOff = [this.series[0].options.id, this.series[1].options.id];
};

infChart.util.extend(infChart.Indicator, infChart.TRIXIndicator);

infChart.TRIXIndicator.prototype.calculate = function (ohlc, data, redraw) {
    var high = ohlc.h,
        low = ohlc.l,
        close = ohlc.c,
        open = ohlc.o;
    if (data && data.length > 0) {
        var chart = this.chart;
        var trix = this.getSeries(high, low, close, open, this.params.base, infChart.indicatorDefaults.EXPONENTIALMOVINGAVERAGE, this.params.period);
        var _vma = this.merge(data, trix);
        chart.get(this.id).setData(_vma, redraw, false, false);
        var series2 = chart.get(this.id + "_TRIX2");
        series2.setData(_vma, redraw, false, false);
        if (series2.type != "area") {
            /* This is done for fixing an exepction thrown from highcharts when drawing area having negative colors without data */
            series2.update({type: "area"}, true);
        }
    }
};

infChart.TRIXIndicator.prototype.getSeries = function (hts, lts, cts, ots, ul, ma, m) {
    var k, retval, ts = this.movul(hts, lts, cts, ots, ul),
        ssema = this.movmean(ts, ma, m),
        dsema = this.movmean(ssema, ma, m),
        tsema = this.movmean(dsema, ma, m);

    retval = new Array(tsema.length);

    for (k = 1; k < tsema.length; k++) {
        retval[k] = (tsema[k] / tsema[k - 1] - 1) * 100;
    }

    return retval;
};

//endregion **************************************TRIX Indicator******************************************