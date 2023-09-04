//region ************************************** Directional Movement Minus Indicator (DMI-) Indicator******************************************

/***
 * Constructor for Directional Movement Minus Indicator (DMI-) Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
 infChart.DirectionalMovementMinusIndicator = function (id, chartId, type, chartInstance) {

    infChart.Indicator.apply(this, arguments);

    this.params.period = 14;
    this.axisId = "#DMIM_" + id;

    this.addAxis({
        id: this.axisId,
        startOnTick: false,
        endOnTick: false
    });


    this.series[0] = chartInstance.addSeries({
        "id": id,
        infIndType: "DMIM",
        infIndSubType: "DMIM",
        /* data: [],*/
        infType: "indicator",
        "yAxis": this.axisId,
        showInLegend: false,
        "name": "DMIM"
    }, true);

};

infChart.util.extend(infChart.Indicator, infChart.DirectionalMovementMinusIndicator);

infChart.DirectionalMovementMinusIndicator.prototype.calculate = function (ohlc, data, redraw) {
    var high = ohlc.h,
        low = ohlc.l,
        close = ohlc.c;
    var that = this;

    if (data && data.length > 0) {

        var dmi = that.getSeries(high, low, close, 2, infChart.indicatorDefaults.EXPONENTIALMOVINGAVERAGE, that.params.period);
        var _dmi = that.merge(data, dmi);
        this.series[0].setData(_dmi, false, false, false);

        if (redraw) {
            var chart = this.chart;
            chart.redraw();
        }
    }
};

infChart.DirectionalMovementMinusIndicator.prototype.getSeries = function (hts, lts, cts, grn, ma, nocp) {

    return this.dmi(hts, lts, cts, grn, ma, nocp);
};

//endregion **************************************Directional Movement Minus Indicator (DMI-) Indicator******************************************