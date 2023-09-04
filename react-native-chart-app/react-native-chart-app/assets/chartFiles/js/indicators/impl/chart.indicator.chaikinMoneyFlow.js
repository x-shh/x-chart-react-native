//region **************************************  Chaikin Money Flow (CMF)******************************************

/***
 * Constructor for Chaikin Money Flow (CMF)  Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
 infChart.ChaikinMoneyFlowIndicator = function (id, chartId, type, chartInstance) {

    infChart.Indicator.apply(this, arguments);

    this.axisId = "#CMF_" + id;


    this.addAxis({
        id: this.axisId,
        startOnTick: false,
        endOnTick: false
    });

    this.series[0] = chartInstance.addSeries({
        id: id,
        name: "CMF",
        infIndType: "CMF",
        infIndSubType: "CMF",
        /* data: [],*/
        infType: "indicator",
        yAxis: this.axisId,
        showInLegend: false
    }, true);
};

infChart.util.extend(infChart.Indicator, infChart.ChaikinMoneyFlowIndicator);

infChart.ChaikinMoneyFlowIndicator.prototype.calculate = function (ohlc, data, redraw) {
    var high = ohlc.h,
        low = ohlc.l,
        close = ohlc.c,
        open = ohlc.o,
        volume = ohlc.v;
    if (data && data.length > 0) {
        var chart = this.chart;
        var trix = this.getSeries(high, low, close, open, volume, 20);
        var _vma = this.merge(data, trix);
        chart.get(this.id).setData(_vma, redraw, false, false);
    }
};

infChart.ChaikinMoneyFlowIndicator.prototype.getSeries = function (hts, lts, cts, ots, vts, m) {
    var k, retval, summfv, sumv, i, ts = new Array(hts.length);

    retval = new Array(ts.length);

    for (k = 0; k < ts.length; k++) {
        ts[k] = (((cts[k] - lts[k]) - (hts[k] - cts[k])) / (hts[k] - lts[k])) * vts[k];
    }

    m = Math.min(m, ts.length);

    for (k = 0; k < ts.length; k++) {
        summfv = 0;
        sumv = 0;
        for (i = 0; i < m; i++) {
            summfv += ts[k];
            sumv += vts[k];
        }
        retval[k] = summfv / sumv;
    }

    return retval;
};

//endregion **************************************Chaikin Money Flow (CMF) Indicator******************************************