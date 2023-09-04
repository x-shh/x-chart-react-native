//region **************************************  True Strength Index (TSI) Indicator******************************************

/***
 * Constructor for True Strength Index (TSI) Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
 infChart.TrueStrengthIndexIndicator = function (id, chartId, type, chartInstance) {

    infChart.Indicator.apply(this, arguments);
    this.params.period1 = 11;
    this.params.period2 = 10;
    this.params.base = infChart.indicatorDefaults.ULCLOSEPRICE;

    this.titleParams = ["period1", "period2"];
    this.axisId = "#TSI_" + id;

    this.addAxis({
        id: this.axisId,
        startOnTick: false,
        endOnTick: false
    });

    this.series[0] = chartInstance.addSeries({
        id: id,
        name: "TSI",
        infIndType: "TSI",
        infIndSubType: "TSI",
        /* data: [],*/
        infType: "indicator",
        yAxis: this.axisId,
        showInLegend: false
    }, true);
};

infChart.util.extend(infChart.Indicator, infChart.TrueStrengthIndexIndicator);

infChart.TrueStrengthIndexIndicator.prototype.calculate = function (ohlc, data, redraw) {
    var high = ohlc.h,
        low = ohlc.l,
        close = ohlc.c,
        open = ohlc.o;

    if (data && data.length > 0) {
        var chart = this.chart;
        var cc = this.getSeries(high, low, close, open, this.params.base, this.params.period1, this.params.period2);
        var _cc = this.merge(data, cc);
        chart.get(this.id).setData(_cc, redraw, false, false);
    }
};

infChart.TrueStrengthIndexIndicator.prototype.getSeries = function (hts, lts, cts, ots, ul, nop1, nop2) {
    var k, retval1, retval2, retval, ts, ds, dsa;
    ts = this.movul(hts, lts, cts, ots, ul);

    retval1 = new Array(ts.length);
    retval2 = new Array(ts.length);
    retval1[0] = 0;
    retval2[0] = 0;
    for (k = 1; k < retval1.length; k++) {
        retval1[k] = (ts[k] - ts[k - 1]);
        retval2[k] = Math.abs(ts[k] - ts[k - 1]);
    }
    ds = this.movmean(retval1, infChart.indicatorDefaults.EXPONENTIALMOVINGAVERAGE, nop1);
    ds = this.movmean(ds, infChart.indicatorDefaults.EXPONENTIALMOVINGAVERAGE, nop2);

    dsa = this.movmean(retval2, infChart.indicatorDefaults.EXPONENTIALMOVINGAVERAGE, nop1);
    dsa = this.movmean(dsa, infChart.indicatorDefaults.EXPONENTIALMOVINGAVERAGE, nop2);

    retval = new Array(ts.length);
    for (k = 1; k < retval.length; k++) {
        retval[k] = (ds[k] / dsa[k]);
    }
    return retval;
};

//endregion ************************************** True Strength Index (TSI)  Indicator******************************************

