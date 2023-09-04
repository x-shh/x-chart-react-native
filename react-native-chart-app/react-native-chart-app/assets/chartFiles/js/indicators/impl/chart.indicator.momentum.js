//region ************************************** Momentum (MOM) Indicator******************************************

/***
 * Cunstructor for Momentum (MOM) Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
 infChart.MomentumIndicator = function (id, chartId, type, chartInstance) {

    infChart.Indicator.apply(this, arguments);

    this.params.period = 28;
    this.axisId = "#MOM_" + id;

    var colors = infChart.util.getSeriesColors();

    this.addAxis({
        id: this.axisId,
        startOnTick: false,
        endOnTick: false
    });


    this.series[0] = chartInstance.addSeries({
        id: id,
        name: "MOM",
        infIndType: "MOM",
        infIndSubType: "MOM",
        /* data: [],*/
        infType: "indicator",
        yAxis: this.axisId,
        showInLegend: false,
        color: colors[1],
        lineColor: colors[1]
    }, false);

    this.series[1] = chartInstance.addSeries({
        "id": id + "_MOM2",
        infIndType: "MOM",
        infIndSubType: "MOM2",
        "yAxis": this.axisId,
        showInLegend: false,
        /* data: [],*/
        infType: "indicator",
        "name": "MOM2",
        "color": colors[2],
        "lineColor": colors[2]
    }, true);


};

infChart.util.extend(infChart.Indicator, infChart.MomentumIndicator);

infChart.MomentumIndicator.prototype.calculate = function (ohlc, data, redraw) {
    var high = ohlc.h,
        low = ohlc.l,
        close = ohlc.c,
        open = ohlc.o;
    var that = this;

    if (data && data.length > 0) {
        infChart.util.forEach(this.series, function (i, series) {
            switch (series.options.infIndSubType) {
                case 'MOM':
                    var mom = that.getSeries(high, low, close, open, infChart.indicatorDefaults.ULCLOSEPRICE, infChart.indicatorDefaults.EXPONENTIALMOVINGAVERAGE, that.params.period, 1);
                    var _mom = that.merge(data, mom);
                    series.setData(_mom, false, false, false);
                    break;
                case 'MOM2':
                    var mom2 = that.getSeries(high, low, close, open, infChart.indicatorDefaults.ULCLOSEPRICE, infChart.indicatorDefaults.EXPONENTIALMOVINGAVERAGE, that.params.period, 28);
                    var _mom2 = that.merge(data, mom2);
                    series.setData(_mom2, redraw, false, false);
                    break;
                default :
                    break;
            }
        });

        if (redraw) {
            var chart = this.chart;
            chart.redraw();
        }
    }
};

infChart.MomentumIndicator.prototype.getSeries = function (hts, lts, cts, ots, ul, ma, nocp1, nocp2) {
    var ts, mom, k, nocp1mone;
    ts = this.movul(hts, lts, cts, ots, ul);
    nocp1mone = (0 | Math.min(nocp1 - 1, ts.length));
    mom = new Array(cts.length);
    for (k = 0; k < nocp1mone; k++)
        mom[k] = ts[k] - ts[0];
    for (k = nocp1mone; k < mom.length; k++)
        mom[k] = ts[k] - ts[k - nocp1mone];
    if (nocp2 == 1)
        return mom;
    return this.movmean(mom, ma, nocp2);
};

//endregion **************************************Momentum (MOM) Indicator******************************************
