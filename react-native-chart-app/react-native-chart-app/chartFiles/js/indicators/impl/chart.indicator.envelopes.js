//region ************************************** Envelopes (ENV) Indicator******************************************

/***
 * Constructor for Envelopes (ENV)  Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
 infChart.EnvelopesIndicator = function (id, chartId, type, chartInstance) {

    infChart.Indicator.apply(this, arguments);

    this.params.period = 21;
    this.params.shift1 = 2.5;
    this.params.shift2 = -2.5;
    this.titleParams = ["period", "shift1", "shift2"];
    this.titleParamsDec = [0, 1, 1];

    var color = infChart.util.getNextSeriesColor(chartId);


    this.series[1] = chartInstance.addSeries({
        id: id + '_ENVU',
        infIndType: "ENV",
        infIndSubType: "ENVU",
        name: "Upper",
        type: "line",
        /* data: [],*/
        color: color,
        lineColor: color,
        infType: "indicator",
        yAxis: "#0",
        zIndex: 3,
        fillOpacity: 0.5,
        hideLegend: true,
        showInLegend: false,
        enableMouseTracking: true,
        states: {
            hover: {
                enabled: false
            }
        }
    }, false);


    this.series[2] = chartInstance.addSeries({
        id: id + '_ENVL',
        infIndType: "ENV",
        infIndSubType: "ENVL",
        name: "Lower",
        type: "line",
        /* data: [],*/
        color: color,
        lineColor: color,
        infType: "indicator",
        yAxis: "#0",
        zIndex: 3,
        fillOpacity: 0.5,
        hideLegend: true,
        showInLegend: false,
        enableMouseTracking: true,
        states: {
            hover: {
                enabled: false
            }
        }
    }, false);

    this.series[0] = chartInstance.addSeries({
        id: id,
        infIndType: "ENV",
        infIndSubType: "ENV",
        name: "ENV",
        type: "arearange",
        /* data: [],*/
        infType: "indicator",
        yAxis: "#0",
        zIndex: 3,
        fillOpacity: 0.5,
        color: color,
        lineColor: color,
        hideToolTip: true,
        enableMouseTracking: true,
        states: {
            hover: {
                enabled: false
            }
        }
    }, true);
    this.style[this.series[0].options.id] = ["arearange"];

};

infChart.util.extend(infChart.Indicator, infChart.EnvelopesIndicator);

infChart.EnvelopesIndicator.prototype.calculate = function (ohlc, data, redraw) {
    var close = ohlc.c;
    if (data && data.length > 0) {
        var chart = this.chart;
        var env = this.getSeries(close, infChart.indicatorDefaults.ARITHMETICMOVINGAVERAGE, this.params.period, this.params.shift1, this.params.shift2);
        var _env = this.merge(data, env.upper, env.lower);
        chart.get(this.id).setData(_env, redraw, false, false);

        var _envU = this.merge(data, env.upper);
        chart.get(this.id + "_ENVU").setData(_envU, redraw, false, false);

        var _envL = this.merge(data, env.lower);
        chart.get(this.id + "_ENVL").setData(_envL, redraw, false, false);
    }
};

infChart.EnvelopesIndicator.prototype.getSeries = function (ts, ma, m, shift1, shift2) {
    var retval = this.movmean(ts, ma, m), upper = new Array(retval.length), lower = new Array(retval.length);

    var k = 0;
    for (k = 0; k < retval.length; k++) {
        upper[k] = retval[k] + (retval[k] * (+shift1) / 100);
        lower[k] = retval[k] + (retval[k] * (+shift2) / 100);
    }
    return {upper: upper, lower: lower};
};

//endregion **************************************Envelopes (ENV) Indicator******************************************