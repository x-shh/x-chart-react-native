//region **************************************  Coppock Curve (CoppockCurve) Indicator******************************************

/***
 * Constructor for Coppock Curve (CoppockCurve) Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
 infChart.CoppockCurveIndicator = function (id, chartId, type, chartInstance) {

    infChart.Indicator.apply(this, arguments);
    this.params.roc_period1 = 11;
    this.params.roc_period2 = 10;
    this.params.wma_period = 14;
    this.params.base = infChart.indicatorDefaults.ULCLOSEPRICE;

    this.titleParams = ["roc_period1", "roc_period2", "wma_period"];
    this.axisId = "#CoppockCurve_" + id;

    this.addAxis({
        id: this.axisId,
        startOnTick: false,
        endOnTick: false
    });

    this.series[0] = chartInstance.addSeries({
        id: id,
        name: "CoppockCurve",
        infIndType: "CoppockCurve",
        infIndSubType: "CoppockCurve",
        /* data: [],*/
        infType: "indicator",
        yAxis: this.axisId,
        showInLegend: false,
        threshold: 0
    }, true);
};

infChart.util.extend(infChart.Indicator, infChart.CoppockCurveIndicator);

infChart.CoppockCurveIndicator.prototype.calculate = function (ohlc, data, redraw) {
    var high = ohlc.h,
        low = ohlc.l,
        close = ohlc.c,
        open = ohlc.o;

    if (data && data.length > 0) {
        var chart = this.chart;
        var cc = this.getSeries(high, low, close, open, this.params.base, this.params.roc_period1, this.params.roc_period2, this.params.wma_period);
        var _cc = this.merge(data, cc);
        chart.get(this.id).setData(_cc, redraw, false, false);
    }
};

infChart.CoppockCurveIndicator.prototype.getSeries = function (hts, lts, cts, ots, ul, nop1, nop2, nop3) {
    var k, retval1, retval2, retval, stdD;


    retval1 = this.roc(hts, lts, cts, ots, ul, nop1);
    retval2 = this.roc(hts, lts, cts, ots, ul, nop2);

    retval2 = this.movmean(retval2, infChart.indicatorDefaults.WEIGHTEDMOVINGAVERAGE, nop3);

    retval = new Array(retval1.length);
    for (k = 0; k < retval.length; k++) {
        retval[k] = (retval1[k] + retval2[k]);
    }

    return retval;
};

//endregion ************************************** Coppock Curve (CoppockCurve)  Indicator******************************************
