//region **************************************  Moving Average Triple (MovTrip) Indicator******************************************

/***
 * Cunstructor for Moving Average Triple (MovTrip) Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
 infChart.MovTripIndicator = function (id, chartId, type, chartInstance) {

    infChart.Indicator.apply(this, arguments);

    this.params.period1 = 15;
    this.params.period2 = 30;
    this.params.period3 = 50;
    this.params.base = infChart.indicatorDefaults.ULCLOSEPRICE;
    this.titleParams = ["period1", "period2", "period3"];

    var color = infChart.util.getNextSeriesColor(chartId);

    this.series[0] = chartInstance.addSeries({
        id: id,
        name: "MovS1",
        infIndType: "MovTrip",
        infIndSubType: "MovS1",
        /* data: [],*/
        infType: "indicator",
        yAxis: "#0",
        color: color,
        lineColor: color
    }, false);

    color = infChart.util.getNextSeriesColor(chartId);
    this.series[1] = chartInstance.addSeries({
        id: id + "_MovS2",
        name: "MovS2",
        infIndType: "MovTrip",
        infIndSubType: "MovS2",
        /* data: [],*/
        infType: "indicator",
        yAxis: "#0",
        color: color,
        lineColor: color,
        hideLegend: true,
        showInLegend: false
    }, false);

    color = infChart.util.getNextSeriesColor(chartId);
    this.series[2] = chartInstance.addSeries({
        id: id + "_MovS3",
        name: "MovS3",
        infIndType: "MovTrip",
        infIndSubType: "MovS3",
        /* data: [],*/
        infType: "indicator",
        yAxis: "#0",
        color: color,
        lineColor: color,
        hideLegend: true,
        showInLegend: false
    }, true);


};

infChart.util.extend(infChart.Indicator, infChart.MovTripIndicator);

infChart.MovTripIndicator.prototype.calculate = function (ohlc, data, redraw) {
    var high = ohlc.h,
        low = ohlc.l,
        close = ohlc.c,
        open = ohlc.o;

    if (data && data.length > 0) {
        var chart = this.chart;
        var movtrip = this.getSeries(high, low, close, open, this.params.base, infChart.indicatorDefaults.ARITHMETICMOVINGAVERAGE, this.params.period1);
        var _movtrip = this.merge(data, movtrip);
        chart.get(this.id).setData(_movtrip, false, false, false);

        var movtrip2 = this.getSeries(high, low, close, open, this.params.base, infChart.indicatorDefaults.ARITHMETICMOVINGAVERAGE, this.params.period2);
        var _movtrip2 = this.merge(data, movtrip2);
        chart.get(this.id + "_MovS2").setData(_movtrip2, false, false, false);

        var movtrip3 = this.getSeries(high, low, close, open, this.params.base, infChart.indicatorDefaults.ARITHMETICMOVINGAVERAGE, this.params.period3);
        var _movtrip3 = this.merge(data, movtrip3);
        chart.get(this.id + "_MovS3").setData(_movtrip3, redraw, false, false);
    }
};

infChart.MovTripIndicator.prototype.getSeries = function (hts, lts, cts, ots, ul, ma, m) {
    var ts = this.movul(hts, lts, cts, ots, ul);
    var retval = this.movmean(ts, ma, m);

    return retval;
};

infChart.MovTripIndicator.prototype.getContextMenuOptions = function (chartId, series, options) {
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

//endregion **************************************Moving Average Triple (MovTrip)Indicator******************************************
