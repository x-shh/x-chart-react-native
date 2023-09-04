//region ************************************** MACD Forest Indicator******************************************

/***
 * Cunstructor for MACDF Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
 infChart.MACDFIndicator = function (id, chartId, type, chartInstance) {

    infChart.Indicator.apply(this, arguments);

    this.params.mov1 = 12;
    this.params.mov2 = 26;
    this.params.trigger = 9;
    this.params.base = infChart.indicatorDefaults.ULCLOSEPRICE;
    this.titleParams = ["mov1", "mov2", "trigger"];

    this.axisId = "#MACDF_" + id;

    var upColor = infChart.util.getDefaultUpColor(), downColor = infChart.util.getDefaultDownColor();

    this.addAxis({
        id: this.axisId,
        startOnTick: false,
        endOnTick: false
    });


    this.series[0] = chartInstance.addSeries({
        "id": id,
        infIndType: "MACDF",
        infIndSubType: "MACDF",
        "type": "column",
        "yAxis": this.axisId,
        showInLegend: false,
        "name": "MACDF",
        /*data: [],*/
        infType: "indicator",
        negativeColor: downColor,
        hasColumnNegative: true,
        hasAreaNegative: true,
        color: upColor,
        threshold: 0
    }, true);

};

infChart.util.extend(infChart.Indicator, infChart.MACDFIndicator);

infChart.MACDFIndicator.prototype.calculate = function (ohlc, data, redraw) {
    var high = ohlc.h,
        low = ohlc.l,
        close = ohlc.c,
        open = ohlc.o;
    var that = this;

    if (data && data.length > 0) {

        var macd3 = that.getSeries(high, low, close, open, 3, that.params.base, infChart.indicatorDefaults.EXPONENTIALMOVINGAVERAGE, that.params.mov1, that.params.mov2, that.params.trigger);
        var _macd3 = that.merge(data, macd3);
        this.series[0].setData(_macd3, false, false, false);

        if (redraw) {
            var chart = this.chart;
            chart.redraw();
        }
    }
};

infChart.MACDFIndicator.prototype.getSeries = function (hts, lts, cts, ots, grn, ul, ma, nocp1, nocp2, nocp3) {

    var ts, result1, result2, k;
    ts = this.movul(hts, lts, cts, ots, ul);
    result1 = this.movmeanNew(ts, ma, nocp1);
    result2 = this.movmeanNew(ts, ma, nocp2);

    var maxnocp = Math.max(nocp1, nocp2), resultN1 = new Array(ts.length), resultN3 = new Array(ts.length);

    for (k = maxnocp - 1; k < result1.length; k++) {
        if (this.isNumber(result1[k]) && this.isNumber(result2[k])) {
            resultN1[k] = result1[k] - result2[k];
        }
    }

    result2 = this.movmeanNew(resultN1, ma, nocp3);

    if (grn == 2)
        return result2;

    for (k = maxnocp + nocp3 - 2; k < resultN1.length; k++) {
        if (this.isNumber(resultN1[k]) && this.isNumber(result2[k])) {
            resultN3[k] = resultN1[k] - result2[k];
        }
    }

    return resultN3;
};

//endregion **************************************MACD Forest Indicator******************************************
