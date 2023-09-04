//region ************************************** GMMA Oscillator (GMMAOsci) Indicator******************************************

/***
 * Cunstructor for GMMA Oscillator (GMMAOsci) Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
infChart.GMMAOscillatorIndicator = function (id, chartId, type, chartInstance) {

    infChart.Indicator.apply(this, arguments);

    this.params.period1 = 3;
    this.params.period2 = 15;
    this.params.period3 = 30;
    this.params.period4 = 60;
    this.params.base = infChart.indicatorDefaults.ULCLOSEPRICE;
    this.titleParams = ["period1", "period2", "period3", "period4"];

    this.axisId = "#GMMAOsci_" + id;

    var colors = infChart.util.getSeriesColors(), upColor = infChart.util.getDefaultUpColor(), downColor = infChart.util.getDefaultDownColor();

    this.addAxis({
        id: this.axisId,
        startOnTick: false,
        endOnTick: false
    });

    this.series[0] = chartInstance.addSeries({
        id: id,
        infIndType: "GMMAOsci",
        infIndSubType: "GMMAOsci",
        name: "GMMAOsci",
        /* data: [],*/
        infType: "indicator",
        yAxis: this.axisId,
        showInLegend: false

    }, false);

    this.series[1] = chartInstance.addSeries({
        "id": id + "_GMMAOsci2",
        infIndType: "GMMAOsci",
        infIndSubType: "GMMAOsci2",
        "yAxis": this.axisId,
        showInLegend: false,
        "name": "GMMAOsci2",
        /* data: [],*/
        infType: "indicator",
        "color": colors[1],
        "lineColor": colors[1]
    }, false);

    this.series[2] = chartInstance.addSeries({
        "id": id + "_GMMAOsci3",
        infIndType: "GMMAOsci",
        infIndSubType: "GMMAOsci3",
        "type": "column",
        "yAxis": this.axisId,
        showInLegend: false,
        "name": "GMMAOsci3",
        /* data: [],*/
        infType: "indicator",
        negativeFillColor: downColor,
        negativeColor: downColor,
        hasColumnNegative: true,
        hasAreaNegative: true,
        color: upColor,
        threshold: 0,
        fillColor: upColor,
        fillOpacity: 0.5
    }, true);

};

infChart.util.extend(infChart.Indicator, infChart.GMMAOscillatorIndicator);

infChart.GMMAOscillatorIndicator.prototype.calculate = function (ohlc, data, redraw) {
    var high = ohlc.h,
        low = ohlc.l,
        close = ohlc.c,
        open = ohlc.o;
    var that = this;

    if (data && data.length > 0) {
        infChart.util.forEach(this.series, function (i, series) {
            switch (series.options.infIndSubType) {
                case 'GMMAOsci':
                    var macd = that.getSeries(high, low, close, open, that.params.base, infChart.indicatorDefaults.EXPONENTIALMOVINGAVERAGE, that.params.period1, that.params.period2);
                    var _macd = that.merge(data, macd);
                    series.setData(_macd, false, false, false);
                    break;
                case 'GMMAOsci2':
                    var macd2 = that.getSeries(high, low, close, open, that.params.base, infChart.indicatorDefaults.EXPONENTIALMOVINGAVERAGE, that.params.period3, that.params.period4);
                    var _macd2 = that.merge(data, macd2);
                    series.setData(_macd2, false, false, false);
                    break;
                case 'GMMAOsci3':
                    var macd3 = that.getSeries(high, low, close, open, that.params.base, infChart.indicatorDefaults.EXPONENTIALMOVINGAVERAGE, that.params.period2, that.params.period4);
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

infChart.GMMAOscillatorIndicator.prototype.getSeries = function (hts, lts, cts, ots, ul, ma, nocp1, nocp2) {
    var ts, result1, result2, k;
    ts = this.movul(hts, lts, cts, ots, ul);
    result1 = this.movmean(ts, ma, nocp1);
    result2 = this.movmean(ts, ma, nocp2);

    for (k = 0; k < result1.length; k++)
        result1[k] = result1[k] - result2[k];

    return result1;
};

//endregion **************************************GMMA Oscillator (GMMAOsci)******************************************
