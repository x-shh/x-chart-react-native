//region ************************************** GMMA (GMMA) Indicator******************************************
/***
 * Constructor for GMMA Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
 infChart.GMMAIndicator = function (id, chartId, type, chartInstance) {

    infChart.Indicator.apply(this, arguments);

    this.params.period1 = 3;
    this.params.period2 = 5;
    this.params.period3 = 8;
    this.params.period4 = 10;
    this.params.period5 = 12;
    this.params.period6 = 15;
    this.params.period7 = 30;
    this.params.period8 = 35;
    this.params.period9 = 40;
    this.params.period10 = 45;
    this.params.period11 = 50;
    this.params.period12 = 60;
    this.params.base = infChart.indicatorDefaults.ULCLOSEPRICE;
    this.titleParams = ["period1", "period2", "period3", "period4", "period5", "period6", "period7", "period8", "period9", "period10", "period11", "period12"];

    var colorGradients = infChart.util.getColorGradients();

    this.series[0] = chartInstance.addSeries({
        id: id,
        name: "GMMA",
        infIndType: "GMMA",
        infIndSubType: "GMMA",
        /* data: [],*/
        infType: "indicator",
        yAxis: "#0",
        color: colorGradients[0][0],
        lineColor: colorGradients[0][0]
    }, false);

    this.series[1] = chartInstance.addSeries({
        id: id + "_GMMA2",
        name: "GMMA2",
        infIndType: "GMMA",
        infIndSubType: "GMMA2",
        /* data: [],*/
        infType: "indicator",
        yAxis: "#0",
        color: colorGradients[0][1],
        lineColor: colorGradients[0][1],
        hideLegend: true,
        showInLegend: false
    }, false);

    this.series[2] = chartInstance.addSeries({
        id: id + "_GMMA3",
        name: "GMMA3",
        infIndType: "GMMA",
        infIndSubType: "GMMA3",
        /* data: [],*/
        infType: "indicator",
        yAxis: "#0",
        color: colorGradients[0][2],
        lineColor: colorGradients[0][2],
        hideLegend: true,
        showInLegend: false
    }, false);
    this.series[3] = chartInstance.addSeries({
        id: id + "_GMMA4",
        name: "GMMA4",
        infIndType: "GMMA",
        infIndSubType: "GMMA4",
        /* data: [],*/
        infType: "indicator",
        yAxis: "#0",
        color: colorGradients[0][3],
        lineColor: colorGradients[0][3],
        hideLegend: true,
        showInLegend: false
    }, false);
    this.series[4] = chartInstance.addSeries({
        id: id + "_GMMA5",
        name: "GMMA5",
        infIndType: "GMMA",
        infIndSubType: "GMMA5",
        /* data: [],*/
        infType: "indicator",
        yAxis: "#0",
        color: colorGradients[0][4],
        lineColor: colorGradients[0][4],
        hideLegend: true,
        showInLegend: false
    }, false);
    this.series[5] = chartInstance.addSeries({
        id: id + "_GMMA6",
        name: "GMMA6",
        infIndType: "GMMA",
        infIndSubType: "GMMA6",
        /* data: [],*/
        infType: "indicator",
        yAxis: "#0",
        color: colorGradients[0][5],
        lineColor: colorGradients[0][5],
        hideLegend: true,
        showInLegend: false
    }, false);
    this.series[6] = chartInstance.addSeries({
        id: id + "_GMMA7",
        name: "GMMA7",
        infIndType: "GMMA",
        infIndSubType: "GMMA7",
        /* data: [],*/
        infType: "indicator",
        yAxis: "#0",
        color: colorGradients[1][0],
        lineColor: colorGradients[1][0],
        hideLegend: true,
        showInLegend: false
    }, false);
    this.series[7] = chartInstance.addSeries({
        id: id + "_GMMA8",
        name: "GMMA8",
        infIndType: "GMMA",
        infIndSubType: "GMMA8",
        /* data: [],*/
        infType: "indicator",
        yAxis: "#0",
        color: colorGradients[1][1],
        lineColor: colorGradients[1][1],
        hideLegend: true,
        showInLegend: false
    }, false);
    this.series[8] = chartInstance.addSeries({
        id: id + "_GMMA9",
        name: "GMMA9",
        infIndType: "GMMA",
        infIndSubType: "GMMA9",
        /* data: [],*/
        infType: "indicator",
        yAxis: "#0",
        color: colorGradients[1][2],
        lineColor: colorGradients[1][2],
        hideLegend: true,
        showInLegend: false
    }, false);
    this.series[9] = chartInstance.addSeries({
        id: id + "_GMMA10",
        name: "GMMA10",
        infIndType: "GMMA",
        infIndSubType: "GMMA10",
        /* data: [],*/
        infType: "indicator",
        yAxis: "#0",
        color: colorGradients[1][3],
        lineColor: colorGradients[1][3],
        hideLegend: true,
        showInLegend: false
    }, false);
    this.series[10] = chartInstance.addSeries({
        id: id + "_GMMA11",
        name: "GMMA11",
        infIndType: "GMMA",
        infIndSubType: "GMMA11",
        /* data: [],*/
        infType: "indicator",
        yAxis: "#0",
        color: colorGradients[1][4],
        lineColor: colorGradients[1][4],
        hideLegend: true,
        showInLegend: false
    }, false);
    this.series[11] = chartInstance.addSeries({
        id: id + "_GMMA12",
        name: "GMMA12",
        infIndType: "GMMA",
        infIndSubType: "GMMA12",
        /* data: [],*/
        infType: "indicator",
        yAxis: "#0",
        color: colorGradients[1][5],
        lineColor: colorGradients[1][5],
        hideLegend: true,
        showInLegend: false
    }, true);


};

infChart.util.extend(infChart.Indicator, infChart.GMMAIndicator);

infChart.GMMAIndicator.prototype.calculate = function (ohlc, data, redraw) {
    var high = ohlc.h,
        low = ohlc.l,
        close = ohlc.c,
        open = ohlc.o;
    if (data && data.length > 0) {
        var chart = this.chart;
        var ema1 = this.getSeries(high, low, close, open, this.params.base, infChart.indicatorDefaults.EXPONENTIALMOVINGAVERAGE, this.params.period1);
        var _ema1 = this.merge(data, ema1);
        chart.get(this.id).setData(_ema1, redraw, false, false);

        var ema2 = this.getSeries(high, low, close, open, this.params.base, infChart.indicatorDefaults.EXPONENTIALMOVINGAVERAGE, this.params.period2);
        var _ema2 = this.merge(data, ema2);
        chart.get(this.id + "_GMMA2").setData(_ema2, redraw, false, false);

        var ema3 = this.getSeries(high, low, close, open, this.params.base, infChart.indicatorDefaults.EXPONENTIALMOVINGAVERAGE, this.params.period3);
        var _ema3 = this.merge(data, ema3);
        chart.get(this.id + "_GMMA3").setData(_ema3, redraw, false, false);

        var ema4 = this.getSeries(high, low, close, open, this.params.base, infChart.indicatorDefaults.EXPONENTIALMOVINGAVERAGE, this.params.period4);
        var _ema4 = this.merge(data, ema4);
        chart.get(this.id + "_GMMA4").setData(_ema4, redraw, false, false);

        var ema5 = this.getSeries(high, low, close, open, this.params.base, infChart.indicatorDefaults.EXPONENTIALMOVINGAVERAGE, this.params.period5);
        var _ema5 = this.merge(data, ema5);
        chart.get(this.id + "_GMMA5").setData(_ema5, redraw, false, false);

        var ema6 = this.getSeries(high, low, close, open, this.params.base, infChart.indicatorDefaults.EXPONENTIALMOVINGAVERAGE, this.params.period6);
        var _ema6 = this.merge(data, ema6);
        chart.get(this.id + "_GMMA6").setData(_ema6, redraw, false, false);

        var ema7 = this.getSeries(high, low, close, open, this.params.base, infChart.indicatorDefaults.EXPONENTIALMOVINGAVERAGE, this.params.period7);
        var _ema7 = this.merge(data, ema7);
        chart.get(this.id + "_GMMA7").setData(_ema7, redraw, false, false);

        var ema8 = this.getSeries(high, low, close, open, this.params.base, infChart.indicatorDefaults.EXPONENTIALMOVINGAVERAGE, this.params.period8);
        var _ema8 = this.merge(data, ema8);
        chart.get(this.id + "_GMMA8").setData(_ema8, redraw, false, false);

        var ema9 = this.getSeries(high, low, close, open, this.params.base, infChart.indicatorDefaults.EXPONENTIALMOVINGAVERAGE, this.params.period9);
        var _ema9 = this.merge(data, ema9);
        chart.get(this.id + "_GMMA9").setData(_ema9, redraw, false, false);

        var ema10 = this.getSeries(high, low, close, open, this.params.base, infChart.indicatorDefaults.EXPONENTIALMOVINGAVERAGE, this.params.period10);
        var _ema10 = this.merge(data, ema10);
        chart.get(this.id + "_GMMA10").setData(_ema10, redraw, false, false);

        var ema11 = this.getSeries(high, low, close, open, this.params.base, infChart.indicatorDefaults.EXPONENTIALMOVINGAVERAGE, this.params.period11);
        var _ema11 = this.merge(data, ema11);
        chart.get(this.id + "_GMMA11").setData(_ema11, redraw, false, false);

        var ema12 = this.getSeries(high, low, close, open, this.params.base, infChart.indicatorDefaults.EXPONENTIALMOVINGAVERAGE, this.params.period12);
        var _ema12 = this.merge(data, ema12);
        chart.get(this.id + "_GMMA12").setData(_ema12, redraw, false, false);
    }
};

infChart.GMMAIndicator.prototype.getSeries = function (hts, lts, cts, ots, ul, ma, m) {
    var ts = this.movul(hts, lts, cts, ots, ul);
    return this.movmean(ts, ma, m);

};

infChart.GMMAIndicator.prototype.getContextMenuOptions = function (chartId, series, options) {
    return {
        "removeIndicator": {
            icon : options.removeIndicator.icon,
            displayText :options.removeIndicator.displayText,
            action : function () {
                let indicator = infChart.indicatorMgr.getIndicatorBySeriesId(chartId, series.options.id);
                infChart.manager.removeSeries(series.chart.renderTo.id, indicator.id, series.options.infType);
            }
        }
    }
};

//endregion **************************************GMMA (GMMA) Indicator******************************************
