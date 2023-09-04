//region **************************************  Vertical Horizontal Filter (VHF) Indicator******************************************

/***
 * Constructor for Vertical Horizontal Filter (VHF) Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
 infChart.VerticalHorizontalFilterIndicator = function (id, chartId, type, chartInstance) {

    infChart.Indicator.apply(this, arguments);

    this.params.period = 28;
    this.params.base = infChart.indicatorDefaults.ULCLOSEPRICE;
    this.titleParams = ["period"];

    this.axisId = "#VHF_" + id;

    this.addAxis({
        id: this.axisId,
        startOnTick: false,
        endOnTick: false
    });


    this.series[0] = chartInstance.addSeries({
        id: id,
        name: "VHF",
        infIndType: "VHF",
        infIndSubType: "VHF",
        /* data: [],*/
        infType: "indicator",
        yAxis: this.axisId,
        showInLegend: false
    }, true);
};

infChart.util.extend(infChart.Indicator, infChart.VerticalHorizontalFilterIndicator);

infChart.VerticalHorizontalFilterIndicator.prototype.calculate = function (ohlc, data, redraw) {
    var high = ohlc.h,
        low = ohlc.l,
        close = ohlc.c,
        open = ohlc.o;

    if (data && data.length > 0) {
        var chart = this.chart;
        var vhf = this.getSeries(high, low, close, open, this.params.base, +this.params.period);
        var _vhf = this.merge(data, vhf);
        chart.get(this.id).setData(_vhf, redraw, false, false);
    }
};

infChart.VerticalHorizontalFilterIndicator.prototype.getSeries = function (hts, lts, cts, ots, ul, m) {
    var k, retval, sumchg, mm = m,
        ts = this.movul(hts, lts, cts, ots, ul),
        hhts = this.movmax(hts, m),
        llts = this.movmin(lts, m);

    retval = new Array(cts.length);
    sumchg = new Array(retval.length);

    sumchg[0] = 0.0;
    for (k = 1; k < retval.length; k++) {
        sumchg[k] = Math.abs(ts[k] - ts[k - 1]);
    }

    sumchg = this.movsum(sumchg, m);

    for (k = m; k < retval.length; k++) {
        retval[k] = (hhts[k] - llts[k]) / sumchg[k];
    }

    return retval;
};

//endregion **************************************Vertical Horizontal Filter (VHF) Indicator******************************************s