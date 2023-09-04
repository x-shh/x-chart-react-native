//region ************************************** Directional Movement System (DMS) Indicator******************************************

/***
 * Constructor for Directional Movement Indicator (DMS) Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
 infChart.DirectionalMovementIndicator = function (id, chartId, type, chartInstance) {

    infChart.Indicator.apply(this, arguments);

    this.params.period = 14;
    this.axisId = "#DMS_" + id;

    var colors = infChart.util.getSeriesColors();

    this.addAxis({
        id: this.axisId,
        startOnTick: false,
        endOnTick: false
    });


    this.series[0] = chartInstance.addSeries({
        id: id,
        infIndType: "DMS",
        infIndSubType: "DMS",
        name: "DMS",
        /*data: [],*/
        infType: "indicator",
        yAxis: this.axisId,
        showInLegend: false,
        color: colors[1],
        lineColor: colors[1]
    }, false);

    this.series[1] = chartInstance.addSeries({
        "id": id + "_DMS2",
        infIndType: "DMS",
        infIndSubType: "DMI2",
        /* data: [],*/
        infType: "indicator",
        "yAxis": this.axisId,
        showInLegend: false,
        "name": "DMI2",
        "color": "#00CC00",
        "lineColor": "#00CC00"
    }, false);

    this.series[2] = chartInstance.addSeries({
        "id": id + "_DMS3",
        infIndType: "DMS",
        infIndSubType: "DMI3",
        /* data: [],*/
        infType: "indicator",
        "yAxis": this.axisId,
        showInLegend: false,
        "name": "DMI3",
        "color": "#EE0000",
        "lineColor": "#EE0000"
    }, true);

};

infChart.util.extend(infChart.Indicator, infChart.DirectionalMovementIndicator);

infChart.DirectionalMovementIndicator.prototype.calculate = function (ohlc, data, redraw) {
    var high = ohlc.h,
        low = ohlc.l,
        close = ohlc.c;
    var that = this;

    if (data && data.length > 0) {
        infChart.util.forEach(this.series, function (i, series) {
            switch (series.options.infIndSubType) {
                case 'DMS':
                    var dmi = that.getSeries(high, low, close, 1, infChart.indicatorDefaults.EXPONENTIALMOVINGAVERAGE, that.params.period);
                    var _dmi = that.merge(data, dmi);
                    series.setData(_dmi, false, false, false);
                    break;
                case 'DMI2':
                    var dmi2 = that.getSeries(high, low, close, 2, infChart.indicatorDefaults.EXPONENTIALMOVINGAVERAGE, that.params.period);
                    var _dmi2 = that.merge(data, dmi2);
                    series.setData(_dmi2, false, false, false);
                    break;
                case 'DMI3':
                    var dmi3 = that.getSeries(high, low, close, 3, infChart.indicatorDefaults.EXPONENTIALMOVINGAVERAGE, that.params.period);
                    var _dmi3 = that.merge(data, dmi3);
                    series.setData(_dmi3, redraw, false, false);
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

infChart.DirectionalMovementIndicator.prototype.getSeries = function (hts, lts, cts, grn, ma, nocp) {

    return this.dmi(hts, lts, cts, grn, ma, nocp);
};

//endregion **************************************Directional Movement Indicator (DMS) Indicator******************************************