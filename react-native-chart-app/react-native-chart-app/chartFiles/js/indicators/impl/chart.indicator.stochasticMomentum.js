//region **************************************  Stochastic Momentum (SM) Indicator******************************************

/***
 * Constructor for Stochastic Momentum (SM) Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
 infChart.StochasticMomentumIndicator = function (id, chartId, type, chartInstance) {

    infChart.Indicator.apply(this, arguments);

    this.params.period1 = 13;
    this.params.period2 = 25;
    this.params.period3 = 2;
    this.titleParams = ["period1", "period2", "period3"];

    this.axisId = "#SM_" + id;

    this.addAxis({
        id: this.axisId,
        startOnTick: false,
        endOnTick: false
    });


    this.series[0] = chartInstance.addSeries({
        id: id,
        name: "SM",
        infIndType: "SM",
        infIndSubType: "SM",
        /* data: [],*/
        infType: "indicator",
        yAxis: this.axisId,
        showInLegend: false
    }, true);
};

infChart.util.extend(infChart.Indicator, infChart.StochasticMomentumIndicator);

infChart.StochasticMomentumIndicator.prototype.calculate = function (ohlc, data, redraw) {
    var high = ohlc.h,
        low = ohlc.l,
        close = ohlc.c;

    if (data && data.length > 0) {
        var chart = this.chart;
        var vhf = this.getSeries(high, low, close, +this.params.period1, +this.params.period2, +this.params.period3);
        var _vhf = this.merge(data, vhf);
        chart.get(this.id).setData(_vhf, redraw, false, false);
    }
};

infChart.StochasticMomentumIndicator.prototype.getSeries = function (hts, lts, cts, nop1, nop2, nop3) {
    var k, retval, dis, ds, dhl, diff,
        hhts = this.movmax(hts, nop1),
        llts = this.movmin(lts, nop1);

    dis = new Array(hhts.length);

    for (k = 0; k < dis.length; k++) {
        dis[k] = cts[k] - (hhts[k] + llts[k]) / 2;
    }

    ds = this.movmean(dis, infChart.indicatorDefaults.EXPONENTIALMOVINGAVERAGE, nop2);
    ds = this.movmean(ds, infChart.indicatorDefaults.EXPONENTIALMOVINGAVERAGE, nop2);

    diff = new Array(hhts.length);
    for (k = 0; k < diff.length; k++) {
        diff[k] = hhts[k] - llts[k];
    }
    dhl = this.movmean(diff, infChart.indicatorDefaults.EXPONENTIALMOVINGAVERAGE, nop3);
    dhl = this.movmean(dhl, infChart.indicatorDefaults.EXPONENTIALMOVINGAVERAGE, nop3);

    retval = new Array(dhl.length);

    for (k = 0; k < retval.length; k++) {
        retval[k] = (ds[k] / dhl[k]) * 100;
    }

    return retval;
};

//endregion **************************************Stochastic Momentum (SM)  Indicator******************************************