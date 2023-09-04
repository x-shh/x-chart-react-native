//region ************************************** MACD Indicator******************************************

/***
 * Cunstructor for MACD Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
 infChart.MACDIndicator = function (id, chartId, type, chartInstance) {

    infChart.Indicator.apply(this, arguments);

    this.params.mov1 = 12;
    this.params.mov2 = 26;
    this.params.trigger = 9;
    this.params.base = infChart.indicatorDefaults.ULCLOSEPRICE;
    this.titleParams = ["mov1", "mov2", "trigger"];

    this.axisId = "#MACD_" + id;

    var colors = infChart.util.getSeriesColors(), upColor = infChart.util.getDefaultUpColor(), downColor = infChart.util.getDefaultDownColor();

    this.addAxis({
        id: this.axisId,
        labels: {enabled: true},
        startOnTick: true,
        endOnTick: false
    });

    this.series[0] = chartInstance.addSeries({
        id: id,
        infIndType: "MACD",
        infIndSubType: "MACD",
        name: "MACD",
        /*data: [],*/
        infType: "indicator",
        yAxis: this.axisId,
        showInLegend: false,
        "color": colors[4],
        "lineColor": colors[4]

    }, false);

    this.series[1] = chartInstance.addSeries({
        "id": id + "_MACD2",
        infIndType: "MACD",
        infIndSubType: "MACD2",
        "yAxis": this.axisId,
        showInLegend: false,
        "name": "MACD2",
        /*data: [],*/
        infType: "indicator",
        "color": colors[1],
        "lineColor": colors[1]
    }, false);

    this.series[2] = chartInstance.addSeries({
        "id": id + "_MACD3",
        infIndType: "MACD",
        infIndSubType: "MACD3",
        "type": "column",
        "yAxis": this.axisId,
        showInLegend: false,
        "name": "MACD3",
        /*data: [],*/
        infType: "indicator",
        negativeColor: downColor,
        hasColumnNegative: true,
        hasAreaNegative: true,
        color: upColor,
        threshold: 0,
        fillColor: upColor
    }, true);

};

infChart.util.extend(infChart.Indicator, infChart.MACDIndicator);

infChart.MACDIndicator.prototype.calculate = function (ohlc, data, redraw) {
    var high = ohlc.h,
        low = ohlc.l,
        close = ohlc.c,
        open = ohlc.o;
    var that = this;

    if (data && data.length > 0) {
        infChart.util.forEach(this.series, function (i, series) {
            switch (series.options.infIndSubType) {
                case 'MACD':
                    var macd = that.getSeries(high, low, close, open, 1, that.params.base, infChart.indicatorDefaults.EXPONENTIALMOVINGAVERAGE, that.params.mov1, that.params.mov2, that.params.trigger);
                    var _macd = that.merge(data, macd);
                    series.setData(_macd, false, false, false);
                    break;
                case 'MACD2':
                    var macd2 = that.getSeries(high, low, close, open, 2, that.params.base, infChart.indicatorDefaults.EXPONENTIALMOVINGAVERAGE, that.params.mov1, that.params.mov2, that.params.trigger);
                    var _macd2 = that.merge(data, macd2);
                    series.setData(_macd2, false, false, false);
                    break;
                case 'MACD3':
                    var macd3 = that.getSeries(high, low, close, open, 3, that.params.base, infChart.indicatorDefaults.EXPONENTIALMOVINGAVERAGE, that.params.mov1, that.params.mov2, that.params.trigger);
                    var _macd3 = that.merge(data, macd3);
                    series.setData(_macd3, false, false, false);
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

infChart.MACDIndicator.prototype.getSeries = function (hts, lts, cts, ots, grn, ul, ma, nocp1, nocp2, nocp3) {
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
    if (grn == 1)
        return resultN1;

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

//endregion **************************************MACD Indicator******************************************
