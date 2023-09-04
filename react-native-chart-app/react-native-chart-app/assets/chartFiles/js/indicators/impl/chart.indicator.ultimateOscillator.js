//region ************************************** Ultimate Oscillator (UO) Indicator******************************************

/***
 * Constructor for Ultimate Oscillator (UO)  Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
 infChart.UltimateOscillatorIndicator = function (id, chartId, type, chartInstance) {

    infChart.Indicator.apply(this, arguments);

    this.params.period1 = 7;
    this.params.period2 = 14;
    this.params.period3 = 28;
    this.titleParams = ["period1", "period2", "period3"];
    this.axisId = "#UO_" + id;

    var colors = infChart.util.getSeriesColors();

    this.addAxis({
        id: this.axisId,
        min: 0,
        max: 1,
        plotLines: [{
            "value": 1,
            "color": "#888888",
            "dashStyle": "shortdash",
            "width": 1,
            "zIndex": 3
        }, {
            "value": 0.5,
            "color": "#888888",
            "dashStyle": "shortdash",
            "width": 1,
            "zIndex": 3
        }, {
            "value": 0,
            "color": "#888888",
            "dashStyle": "shortdash",
            "width": 1,
            "zIndex": 3
        }],
        startOnTick: false,
        endOnTick: false
    });


    this.series[0] = chartInstance.addSeries({
        id: id,
        infIndType: "UO",
        infIndSubType: "UO",
        name: "UO",
        /* data: [],*/
        infType: "indicator",
        yAxis: this.axisId,
        showInLegend: false,
        color: colors[1],
        lineColor: colors[1]
    }, true);


};

infChart.util.extend(infChart.Indicator, infChart.UltimateOscillatorIndicator);

infChart.UltimateOscillatorIndicator.prototype.calculate = function (ohlc, data, redraw) {
    var high = ohlc.h,
        low = ohlc.l,
        close = ohlc.c;
    if (data && data.length > 0) {
        var chart = this.chart;
        var uo = this.getSeries(high, low, close, infChart.indicatorDefaults.ARITHMETICMOVINGAVERAGE, this.params.period1, this.params.period2, this.params.period3);
        var _uo = this.merge(data, uo);
        chart.get(this.id).setData(_uo, redraw, false, false);
    }
};

infChart.UltimateOscillatorIndicator.prototype.getSeries = function (hts, lts, cts, ma, nocp1, nocp2, nocp3) {
    var mbp, mtr, abp1, abp2, abp3, atr1, atr2, atr3, uo, k;
    mbp = this.bp(lts, cts);
    mtr = this.tr(hts, lts, cts);
    abp1 = this.movmean(mbp, ma, nocp1);
    abp2 = this.movmean(mbp, ma, nocp2);
    abp3 = this.movmean(mbp, ma, nocp3);
    atr1 = this.movmean(mtr, ma, nocp1);
    atr2 = this.movmean(mtr, ma, nocp2);
    atr3 = this.movmean(mtr, ma, nocp3);
    uo = new Array(mbp.length);
    for (k = 0; k < uo.length; k++)
        if (atr1[k] < infChart.indicatorConst._EPSDENOM_) {
            uo[k] = 1.0;
        } else {
            uo[k] = (4 * abp1[k] / atr1[k] + 2.0 * abp2[k] / atr2[k] + abp3[k] / atr3[k]) * infChart.indicatorConst.ONEOSEVEN;
        }
    return uo;
};

//endregion **************************************Ultimate Oscillator (UO) Indicator******************************************