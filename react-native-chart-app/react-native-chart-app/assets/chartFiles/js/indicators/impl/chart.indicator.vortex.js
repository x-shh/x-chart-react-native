//region **************************************  Vortex Indicator (VI) Indicator******************************************

/***
 * Constructor for Vortex Indicator (VI) Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
 infChart.VortexIndicator = function (id, chartId, type, chartInstance) {

    infChart.Indicator.apply(this, arguments);
    this.params.period = 14;

    this.titleParams = ["period"];
    this.axisId = "#VI_" + id;

    this.addAxis({
        id: this.axisId,
        startOnTick: false,
        endOnTick: false
    });

    var upColor = infChart.util.getDefaultUpColor(), downColor = infChart.util.getDefaultDownColor();

    this.series[0] = chartInstance.addSeries({
        id: id,
        name: "VI+",
        infIndType: "VI",
        infIndSubType: "VI",
        /* data: [],*/
        infType: "indicator",
        yAxis: this.axisId,
        showInLegend: false,
        lineColor: upColor,
        color: upColor
    }, false);

    this.series[1] = chartInstance.addSeries({
        id: id + "_VI2",
        name: "VI-",
        infIndType: "VI2",
        infIndSubType: "VI2",
        /* data: [],*/
        infType: "indicator",
        yAxis: this.axisId,
        showInLegend: false,
        lineColor: downColor,
        color: downColor
    }, true);
};

infChart.util.extend(infChart.Indicator, infChart.VortexIndicator);

infChart.VortexIndicator.prototype.calculate = function (ohlc, data, redraw) {
    var high = ohlc.h,
        low = ohlc.l,
        close = ohlc.c;

    if (data && data.length > 0) {
        var chart = this.chart;
        var vi = this.getSeries(high, low, close, this.params.period);

        var _vi = this.merge(data, vi.vip);
        var viSeries = chart.get(this.id);
        viSeries && viSeries.setData(_vi, redraw, false, false);

        var _vim = this.merge(data, vi.vim);
        var vimSeries = chart.get(this.id + "_VI2");
        vimSeries && vimSeries.setData(_vim, redraw, false, false);
    }
};

infChart.VortexIndicator.prototype.getSeries = function (hts, lts, cts, nop1) {
    var k, retval1, retval2, tr;

    retval1 = new Array(hts.length);
    retval2 = new Array(hts.length);
    retval1[0] = 0;
    retval2[0] = 0;
    for (k = 1; k < retval1.length; k++) {
        retval1[k] = Math.abs(hts[k] - lts[k - 1]);
        retval2[k] = Math.abs(lts[k] - hts[k - 1]);
    }

    retval1 = this.movsum(retval1, nop1);
    retval2 = this.movsum(retval2, nop1);

    tr = this.tr(hts, lts, cts);
    tr = this.movsum(tr, nop1);

    for (k = 1; k < retval1.length; k++) {
        if (tr[k]) {
            retval1[k] = retval1[k] / tr[k];
            retval2[k] = retval2[k] / tr[k];
        }
    }
    return {vip: retval1, vim: retval2};
};

//endregion ************************************** Vortex Indicator (VI)  Indicator******************************************