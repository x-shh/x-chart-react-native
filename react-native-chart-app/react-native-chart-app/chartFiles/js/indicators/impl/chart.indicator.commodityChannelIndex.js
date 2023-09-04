//region **************************************Commodity Channel Index Indicator******************************************

/***
 * Cunstructor for Commodity Channel Index Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
 infChart.CommodityChannelIndexIndicator = function (id, chartId, type, chartInstance) {

    infChart.Indicator.apply(this, arguments);

    this.params.period = 20;
    this.params.upperLevel = 100;
    this.params.lowerLevel = -100;
    this.titleParams = ["period", "upperLevel", "lowerLevel"];

    this.axisId = "#CCI_" + id;

    this.addAxis({
        id: this.axisId,

        /*"plotLines": [{
         "id": this.axisId + "upperLevel",
         "value": this.params.upperLevel,
         "color": "green",
         "dashStyle": "shortdash",
         "width": 1,
         "zIndex": 3
         }, {
         "id": this.axisId + "lowerLevel",
         "value": this.params.lowerLevel,
         "color": "red",
         "dashStyle": "shortdash",
         "width": 1,
         "zIndex": 3
         }],*/
        startOnTick: false,
        endOnTick: false
    });

    var colors = infChart.util.getSeriesColors();

    this.series[0] = chartInstance.addSeries({
        id: id,
        name: "CCI",
        infIndType: "CCI",
        infIndSubType: "CCI",
        /*data: [],*/
        infType: "indicator",
        yAxis: this.axisId,
        showInLegend: false,
        color: colors[0],
        lineColor: colors[0]
    }, true);


};

infChart.util.extend(infChart.Indicator, infChart.CommodityChannelIndexIndicator);

infChart.CommodityChannelIndexIndicator.prototype.calculate = function (ohlc, data, redraw) {
    var high = ohlc.h,
        low = ohlc.l,
        close = ohlc.c;
    if (data && data.length > 0) {
        var chart = this.chart;

        var cci = this.getSeries(high, low, close, infChart.indicatorDefaults.ARITHMETICMOVINGAVERAGE, infChart.indicatorDefaults.MOVINGSTANDARDDEVIATION, this.params.period, 0.015);
        var _cci = this.merge(data, cci);
        chart.get(this.id).setData(_cci, redraw, false, false);
        var axis = chart.get(this.axisId);
        var upColor = infChart.util.getDefaultUpColor();
        var downColor = infChart.util.getDefaultDownColor();

        if (!this.hasPlotline) {
            axis.update({
                plotLines: [{
                    "id": this.axisId + "upperLevel",
                    "value": this.params.upperLevel,
                    "color": upColor,
                    "dashStyle": "shortdash",
                    "width": 1,
                    "zIndex": 3
                }, {
                    "id": this.axisId + "lowerLevel",
                    "value": this.params.lowerLevel,
                    "color": downColor,
                    "dashStyle": "shortdash",
                    "width": 1,
                    "zIndex": 3
                }]
            }, true);
            this.hasPlotline = true;
        }
        var upperPlot = axis.plotLinesAndBands[0];
        upperPlot.options.value = this.params.upperLevel;
        upperPlot.render();

        var lowerPlot = axis.plotLinesAndBands[1];
        lowerPlot.options.value = this.params.lowerLevel;
        lowerPlot.render();
    }
};

infChart.CommodityChannelIndexIndicator.prototype.getSeries = function (hts, lts, cts, ma, md, nocp, delta) {
    var denom, tp, mean, dev, cci, k;
    tp = this.tp(hts, lts, cts);
    mean = this.movmean(cts, ma, nocp);
    dev = this.movdev(cts, md, nocp);
    cci = new Array(tp.length);
    if (nocp == 1) {
        for (k = 0; k < cci.length; k++)
            cci[k] = 0;
        return cci;
    }
    for (k = 0; k < cci.length; k++) {
        denom = delta * dev[k];
        if (denom < infChart.indicatorConst._EPSDENOM_) {
            cci[k] = 0;
        } else {
            cci[k] = (tp[k] - mean[k]) / denom;
        }
    }
    return cci;
};

infChart.CommodityChannelIndexIndicator.prototype.getConfig = function () {
    return {params: {period: this.period, upperLevel: this.upperLevel, lowerLevel: this.lowerLevel}};
};

//endregion **************************************Commodity Channel Index Indicator******************************************
