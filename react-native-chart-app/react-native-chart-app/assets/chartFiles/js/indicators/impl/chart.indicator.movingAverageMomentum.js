//region **************************************  Moving Average Momentum (MomMA) Indicator******************************************

/***
 * Constructor for Moving Average Momentum (MomMA) Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
 infChart.MovingAverageMomentumIndicator = function (id, chartId, type, chartInstance) {

    infChart.Indicator.apply(this, arguments);

    this.params.period = 21;
    this.params.shift = 0;
    this.params.period_mom = 20;
    this.params.base = infChart.indicatorDefaults.ULCLOSEPRICE;

    this.titleParams = ["period", "shift", "period_mom"];

    this.axisId = "#MomMA_" + id;

    this.addAxis({
        id: this.axisId,
        startOnTick: false,
        endOnTick: false
    });


    this.series[0] = chartInstance.addSeries({
        id: id,
        name: "MomMA",
        infIndType: "MomMA",
        infIndSubType: "MomMA",
        /* data: [],*/
        infType: "indicator",
        yAxis: this.axisId,
        showInLegend: false
    }, true);
};

infChart.util.extend(infChart.Indicator, infChart.MovingAverageMomentumIndicator);

infChart.MovingAverageMomentumIndicator.prototype.calculate = function (ohlc, data, redraw) {
    var high = ohlc.h,
        low = ohlc.l,
        close = ohlc.c,
        open = ohlc.o;

    if (data && data.length > 0) {
        var chart = this.chart;
        var vhf = this.getSeries(high, low, close, open, this.params.base, +this.params.period, +this.params.shift, +this.params.period_mom);
        var _vhf = this.merge(data, vhf);
        chart.get(this.id).setData(_vhf, redraw, false, false);
    }
};

infChart.MovingAverageMomentumIndicator.prototype.getSeries = function (hts, lts, cts, ots, ul, nop1, shift, periodMom) {
    var k, retval1, retval2, ts, stdD;

    ts = this.movul(hts, lts, cts, ots, ul);

    retval1 = this.movmean(ts, infChart.indicatorDefaults.ARITHMETICMOVINGAVERAGE, nop1);

    stdD = this.movdev(ts, infChart.indicatorDefaults.MOVINGMEANDEVIATION, nop1);

    retval2 = new Array(retval1.length);
    for (k = periodMom; k < retval1.length; k++) {
        retval2[k] = (retval1[k] - retval1[k - periodMom]) + shift * stdD[k] / 100;
    }

    return retval2;
};

//endregion **************************************Moving Average Momentum (MomMA)  Indicator******************************************

