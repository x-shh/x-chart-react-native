//region **************************************  Mass Index (MASS) Indicator******************************************

/***
 * Constructor for Mass Index (MASS) Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
 infChart.MassIndexIndicator = function (id, chartId, type, chartInstance) {

    infChart.Indicator.apply(this, arguments);
    this.params.period = 25;
    this.params.setup = 27;
    this.params.trigg = 26.5;

    this.titleParams = ["period", "setup", "trigg"];
    this.titleParamsDec = [0, 0, 1];
    this.axisId = "#MASS_" + id;

    this.addAxis({
        id: this.axisId,
        startOnTick: false,
        endOnTick: false
    });

    this.series[0] = chartInstance.addSeries({
        id: id,
        name: "MASS",
        infIndType: "MASS",
        infIndSubType: "MASS",
        /* data: [],*/
        infType: "indicator",
        yAxis: this.axisId,
        showInLegend: false
    }, false);

    var color = infChart.util.getNextSeriesColor(chartId);
    this.series[1] = chartInstance.addSeries({
        "id": id + "_MASS_SET",
        infIndType: "MASS",
        infIndSubType: "MASS_SET",
        /* data: [],*/
        infType: "indicator",
        "yAxis": this.axisId,
        "name": "SET",
        "color": color,
        "lineColor": color,
        "type": "line",
        lineWidth: 1,
        hideLegend: true,
        infRecal: true,
        hideToolTip: true,
        showInLegend: false
    }, false);

    color = infChart.util.getNextSeriesColor(chartId);
    this.series[2] = chartInstance.addSeries({
        "id": id + "_MASS_TRIGG",
        infIndType: "MASS",
        infIndSubType: "MASS_TRIGG",
        /* data: [],*/
        infType: "indicator",
        "yAxis": this.axisId,
        "name": "TRIGG",
        "color": color,
        "lineColor": color,
        "type": "line",
        lineWidth: 1,
        hideLegend: true,
        hideToolTip: true,
        showInLegend: false
    }, true);

    this.style[this.series[1].options.id] = ["line", "dash"];
    this.style[this.series[2].options.id] = ["line", "dash"];
};

infChart.util.extend(infChart.Indicator, infChart.MassIndexIndicator);

infChart.MassIndexIndicator.prototype.calculate = function (ohlc, data, redraw, seriesId) {
    var high = ohlc.h,
        low = ohlc.l,
        close = ohlc.c;
    if (data && data.length > 0) {
        var chart = this.chart;
        if (!seriesId) {
            var mass = this.getSeries(high, low, infChart.indicatorDefaults.EXPONENTIALMOVINGAVERAGE, 9, this.params.period);
            var _mass = this.merge(data, mass);
            chart.get(this.id).setData(_mass, false, false, false);

        }
        if (!seriesId || seriesId == (this.id + '_MASS_SET')) {
            var series = chart.get(this.id + '_MASS_SET');
            if (series.options.type != "arearange") {
                series.setData(this.getBand(data, series.options.type, this.params.setup, this.params.setup), redraw, false, false);
            }
        }
        if (!seriesId || seriesId == (this.id + '_MASS_TRIGG')) {
            var series4 = chart.get(this.id + '_MASS_TRIGG');
            if (series4.options.type != "arearange") {
                series4.setData(this.getBand(data, series4.options.type, this.params.trigg, this.params.trigg), redraw, false, false);
            } else {
                series4.setData(this.getBand(data, series4.options.type, this.params.lowerLevel, 0), redraw, false, false);
            }
        }
    }
};

infChart.MassIndexIndicator.prototype.getSeries = function (hts, lts, ma, nop1, nop2) {
    var k, retval1, retval2, ts, tr;

    ts = new Array(hts.length);
    retval1 = new Array(hts.length);
    retval2 = new Array(hts.length);

    for (k = 0; k < ts.length; k++) {
        ts[k] = hts[k] - lts[k];
    }

    retval1 = this.movmean(ts, ma, nop1);
    retval2 = this.movmean(retval1, ma, nop1);


    for (k = 0; k < retval1.length; k++) {
        if (retval2[k]) {
            retval1[k] = retval1[k] / retval2[k];
        }
    }
    retval1 = this.movsum(retval1, nop2, true);

    return retval1;
};

/**
 * hide indicator
 */
infChart.MassIndexIndicator.prototype.hideIndicator = function (seriesId) {
    infChart.Indicator.prototype.hideIndicator.apply(this, [seriesId, true]);
};

/**
 * show indicator
 */
infChart.MassIndexIndicator.prototype.showIndicator = function (seriesId) {
    infChart.Indicator.prototype.showIndicator.apply(this, [seriesId, true]);
};

//endregion ************************************** Mass Index (MASS)  Indicator******************************************
