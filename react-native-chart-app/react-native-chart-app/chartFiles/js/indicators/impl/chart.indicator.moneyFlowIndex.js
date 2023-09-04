//region ************************************** Money Flow Index (MFI) Indicator******************************************

/***
 * Constructor for Money Flow Index (MFI)  Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
 infChart.MoneyFlowIndexIndicator = function (id, chartId, type, chartInstance) {

    infChart.Indicator.apply(this, arguments);

    this.axisId = "#MFI_" + id;

    var colors = infChart.util.getSeriesColors();
    var downColor = infChart.util.getDefaultDownColor();

    this.addAxis({
        id: this.axisId,
        plotLines: [{
            "value": 0.8,
            "color": downColor,
            "dashStyle": "shortdash",
            "width": 1,
            "zIndex": 3
        }, {
            "value": 0.2,
            "color": downColor,
            "dashStyle": "shortdash",
            "width": 1,
            "zIndex": 3
        }],
        min: 0,
        max: 1,
        startOnTick: false,
        endOnTick: false
    });

    this.series[0] = chartInstance.addSeries({
        id: id,
        infIndType: "MFI",
        infIndSubType: "MFI",
        name: "MFI",
        /* data: [],*/
        infType: "indicator",
        yAxis: this.axisId,
        showInLegend: false,
        color: colors[1],
        lineColor: colors[1]
    }, true);


};

infChart.util.extend(infChart.Indicator, infChart.MoneyFlowIndexIndicator);

infChart.MoneyFlowIndexIndicator.prototype.calculate = function (ohlc, data, redraw) {
    var high = ohlc.h,
        low = ohlc.l,
        close = ohlc.c,
        volume = ohlc.v;
    if (data && data.length > 0) {
        var chart = this.chart;
        var mfi = this.getSeries(high, low, close, volume, infChart.indicatorDefaults.ULCLOSEPRICE, infChart.indicatorDefaults.EXPONENTIALMOVINGAVERAGE, 14);
        var _mfi = this.merge(data, mfi);
        // chart.get(this.id).setData(_mfi, redraw, false, false);
        this.series[0].setData(_mfi, redraw, false, false);
    }
};

infChart.MoneyFlowIndexIndicator.prototype.getSeries = function (hts, lts, cts, vts, ul, ma, nocp) {
    var ts, apmf, anmf, mfi, k;
    ts = this.movul(hts, lts, cts, undefined, ul);
    apmf = new Array(ts.length);
    anmf = new Array(ts.length);
    mfi = new Array(ts.length);
    apmf[0] = anmf[0] = 0;
    for (k = 1; k < apmf.length; k++) {
        if (ts[k - 1] < ts[k]) {
            apmf[k] = ts[k] * vts[k];
            anmf[k] = 0;
        } else if (ts[k - 1] == ts[k]) {
            apmf[k] = 0;
            anmf[k] = 0;
        } else {
            apmf[k] = 0;
            anmf[k] = ts[k] * vts[k];
        }
    }
    apmf = this.movmean(apmf, ma, nocp);
    anmf = this.movmean(anmf, ma, nocp);
    for (k = 0; k < mfi.length; k++)
        if (anmf[k] < infChart.indicatorConst._EPSDENOM_) {
            mfi[k] = 1.0;
        } else {
            mfi[k] = 1.0 - 1.0 / (1.0 + apmf[k] / anmf[k]);
        }
    return mfi;
};

//endregion **************************************Money Flow Index (MFI) Indicator******************************************s