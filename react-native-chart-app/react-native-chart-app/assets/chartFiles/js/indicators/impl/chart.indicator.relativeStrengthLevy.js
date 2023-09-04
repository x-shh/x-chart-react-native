//region ************************************** Relative Strength Levy (RSL) Indicator******************************************

/***
 * Constructor for Relative Strength Levy (RSL) Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
 infChart.RelativeStrengthLevy = function (id, chartId, type, chartInstance) {

    infChart.Indicator.apply(this, arguments);
    this.params.period = 14;
    this.params.base = infChart.indicatorDefaults.ULCLOSEPRICE;

    this.titleParams = ["period"];
    this.axisId = "#RSL_" + id;

    this.addAxis({
        id: this.axisId,
        startOnTick: false,
        endOnTick: false
    });

    var color = infChart.util.getNextSeriesColor(chartId);

    this.series[0] = chartInstance.addSeries({
        id: id,
        name: "RSL",
        infIndType: "RSL",
        infIndSubType: "RSL",
        /* data: [],*/
        type: "line",
        infType: "indicator",
        yAxis: this.axisId,
        showInLegend: false,
        lineColor: color,
        color: color
    }, true);

};

infChart.util.extend(infChart.Indicator, infChart.RelativeStrengthLevy);

infChart.RelativeStrengthLevy.prototype.calculate = function (ohlc, data, redraw) {
    var high = ohlc.h,
        low = ohlc.l,
        close = ohlc.c,
        open = ohlc.o;

    if (data && data.length > 0) {
        var chart = this.chart;
        var rsl = this.getSeries(high, low, close, open, this.params.base, infChart.indicatorDefaults.ARITHMETICMOVINGAVERAGE, this.params.period);

        var _rsl = this.merge(data, rsl);
        chart.get(this.id).setData(_rsl, redraw, false, false);

    }
};

infChart.RelativeStrengthLevy.prototype.getSeries = function (hts, lts, cts, ots, ul, ma, nop) {
    var ts, retVal1, retVal2 = new Array(hts.length), k, len;
    ts = this.movul(hts, lts, cts, ots, ul);
    retVal1 = this.movmeanNew(ts, ma, nop);

    for (k = nop - 1, len = retVal1.length; k < len; k++) {
        if (retVal1[k] && this.isNumber(ts[k])) {
            retVal2[k] = ts[k] / retVal1[k];
        }
    }
    return retVal2;
};

//endregion ************************************** Relative Strength Levy (RSL) Indicator******************************************