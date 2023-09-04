
//region ************************************** Accumulation Distribution Line (ADL) Indicator******************************************

/***
 * Cunstructor for Accumulation Distribution Line (ADL) Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
 infChart.AccumulationDistLineIndicator = function (id, chartId, type, chartInstance) {

    infChart.Indicator.apply(this, arguments);

    this.params.period = 38;
    this.axisId = "#ADL_" + id;

    var colors = infChart.util.getSeriesColors();

    this.addAxis({
        id: this.axisId,
        labels: {enabled: true},
        startOnTick: false,
        endOnTick: false
    });

    this.series[0] = chartInstance.addSeries({
        id: id,
        infIndType: "ADL",
        infIndSubType: "ADL",
        name: "ADL",
        /*data: [],*/
        infType: "indicator",
        color: colors[0],
        lineColor: colors[0],
        yAxis: this.axisId,
        showInLegend: false
    }, false);

    this.series[1] = chartInstance.addSeries({
        "id": id + "_ADL2",
        infIndType: "ADL",
        infIndSubType: "ADL2",
        "yAxis": this.axisId,
        showInLegend: false,
        "name": "ADL2",
        "color": colors[1],
        /* data: [],*/
        infType: "indicator",
        "lineColor": colors[1]
    }, true);


};

infChart.util.extend(infChart.Indicator, infChart.AccumulationDistLineIndicator);

infChart.AccumulationDistLineIndicator.prototype.calculate = function (ohlc, data, redraw) {
    var high = ohlc.h,
        low = ohlc.l,
        close = ohlc.c,
        volume = ohlc.v,
        open = ohlc.o;
    var that = this;

    if (data && data.length > 0) {
        infChart.util.forEach(this.series, function (i, series) {
            switch (series.options.infIndSubType) {
                case 'ADL':
                    var adl = that.getSeries(open, high, low, close, volume, 1, infChart.indicatorDefaults.ADL_COEFF_WITH_CLOSE_PRICES, infChart.indicatorDefaults.EXPONENTIALMOVINGAVERAGE,
                        0);
                    var _adl = that.merge(data, adl);
                    series.setData(_adl, false, false, false);
                    break;
                case 'ADL2':
                    var adl2 = that.getSeries(open, high, low, close, volume, 0, infChart.indicatorDefaults.ADL_COEFF_WITH_CLOSE_PRICES, infChart.indicatorDefaults.EXPONENTIALMOVINGAVERAGE,
                        that.params.period);
                    var _adl2 = that.merge(data, adl2);
                    series.setData(_adl2, false, false, false);
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

infChart.AccumulationDistLineIndicator.prototype.getSeries = function (ots, hts, lts, cts, vts, grn, coeff, ma, nocp) {
    var retval, denom, k;
    retval = new Array(cts.length);
    retval[0] = 0;
    if (coeff == infChart.indicatorDefaults.ADL_COEFF_WITH_OPEN_PRICES) {
        for (k = 1; k < retval.length; k++) {
            denom = hts[k] - lts[k];
            if (denom < infChart.indicatorConst._EPSDENOM_) {
                retval[k] = retval[k - 1];
            } else {
                retval[k] = retval[k - 1] + (cts[k] - ots[k]) * vts[k] / denom;
            }
        }
    } else {
        for (k = 1; k < retval.length; k++) {
            denom = hts[k] - lts[k];
            if (denom < infChart.indicatorConst._EPSDENOM_) {
                retval[k] = retval[k - 1];
            } else {
                retval[k] = retval[k - 1] + (2.0 * cts[k] - hts[k] - lts[k]) * vts[k] / denom;
            }
        }
    }
    if (grn == 1) {
        // console.log(retval);
        return retval;
    }
    return this.movmean(retval, ma, nocp);
};

//endregion **************************************Accumulation Distribution Line (ADL) Indicator******************************************
