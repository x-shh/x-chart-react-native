//region ************************************** Directional Movement Index (DMI) Indicator******************************************

/***
 * Constructor for Directional Movement Indicator (DMI) Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
 infChart.DirectionalMovementIndexIndicator = function (id, chartId, type, chartInstance) {

    infChart.Indicator.apply(this, arguments);

    this.params.period = 14;
    this.axisId = "#DMI_" + id;

    var colors = infChart.util.getSeriesColors();

    this.addAxis({
        id: this.axisId,
        startOnTick: false,
        endOnTick: false
    });


    this.series[0] = chartInstance.addSeries({
        id: id,
        infIndType: "DMI",
        infIndSubType: "DMI",
        name: "DMI",
        data: [],
        infType: "indicator",
        yAxis: this.axisId,
        showInLegend: false,
        color: colors[1],
        lineColor: colors[1]
    }, true);

};

infChart.util.extend(infChart.Indicator, infChart.DirectionalMovementIndexIndicator);

infChart.DirectionalMovementIndexIndicator.prototype.calculate = function (ohlc, data, redraw) {
    var high = ohlc.h,
        low = ohlc.l,
        close = ohlc.c;
    var that = this;

    if (data && data.length > 0) {
        infChart.util.forEach(this.series, function (i, series) {
            switch (series.options.infIndSubType) {
                case 'DMI':
                    var dmi = that.getSeries(high, low, close, 1, infChart.indicatorDefaults.EXPONENTIALMOVINGAVERAGE, that.params.period);
                    var _dmi = that.merge(data, dmi);
                    series.setData(_dmi, false, false, false);
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

infChart.DirectionalMovementIndexIndicator.prototype.getSeries = function (hts, lts, cts, grn, ma, nocp) {

    return this.dmi(hts, lts, cts, grn, ma, nocp);
};

//endregion **************************************Directional Movement Index Indicator (DMI) Indicator******************************************