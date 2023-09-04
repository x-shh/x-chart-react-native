//region ************************************** On Balance Volume (OBV) Indicator******************************************

/***
 * Constructor for On Balance Volume (OBV) Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
 infChart.OnBalanceVolumeIndicator = function (id, chartId, type, chartInstance) {

    infChart.Indicator.apply(this, arguments);

    this.axisId = "#OBV_" + id;

    var colors = infChart.util.getSeriesColors();

    this.addAxis({
        id: this.axisId,
        startOnTick: false,
        endOnTick: false
    });

    this.series[0] = chartInstance.addSeries({
        id: id,
        infIndType: "OBV",
        infIndSubType: "OBV",
        name: "OBV",
        /* data: [],*/
        infType: "indicator",
        yAxis: this.axisId,
        showInLegend: false,
        color: colors[0],
        lineColor: colors[0]
    }, false);

    this.series[1] = chartInstance.addSeries({
        "id": id + "_OBV2",
        infIndType: "OBV",
        infIndSubType: "OBV2",
        /* data: [],*/
        infType: "indicator",
        "yAxis": this.axisId,
        showInLegend: false,
        "name": "OBV2",
        color: colors[1],
        lineColor: colors[1]
    }, true);

};

infChart.util.extend(infChart.Indicator, infChart.OnBalanceVolumeIndicator);

infChart.OnBalanceVolumeIndicator.prototype.calculate = function (ohlc, data, redraw) {
    var high = ohlc.h,
        low = ohlc.l,
        close = ohlc.c,
        volume = ohlc.v;
    var that = this;

    if (data && data.length > 0) {
        infChart.util.forEach(this.series, function (i, series) {
            switch (series.options.infIndSubType) {
                case 'OBV':
                    var obv = that.getSeries(high, low, close, volume, 1, infChart.indicatorDefaults.ULCLOSEPRICE, infChart.indicatorDefaults.EXPONENTIALMOVINGAVERAGE, 14);
                    var _obv = that.merge(data, obv);
                    series.setData(_obv, false, false, false);
                    break;
                case 'OBV2':
                    var obv2 = that.getSeries(high, low, close, volume, 2, infChart.indicatorDefaults.ULCLOSEPRICE, infChart.indicatorDefaults.EXPONENTIALMOVINGAVERAGE, 14);
                    var _obv2 = that.merge(data, obv2);
                    series.setData(_obv2, redraw, false, false);
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

infChart.OnBalanceVolumeIndicator.prototype.getSeries = function (hts, lts, cts, vts, grn, ul, ma, nocp) {
    var ts, obv, k;
    ts = this.movul(hts, lts, cts, undefined, ul);
    obv = new Array(ts.length);
    obv[0] = 0;
    for (k = 1; k < obv.length; k++) {
        if (ts[k - 1] < ts[k])
            obv[k] = obv[k - 1] + vts[k];
        else if (ts[k] < ts[k - 1])
            obv[k] = obv[k - 1] - vts[k];
        else
            obv[k] = obv[k - 1];
    }
    if (grn == 1)
        return obv;
    return this.movmean(obv, ma, nocp);
};

//endregion **************************************On Balance Volume (OBV) Indicator******************************************