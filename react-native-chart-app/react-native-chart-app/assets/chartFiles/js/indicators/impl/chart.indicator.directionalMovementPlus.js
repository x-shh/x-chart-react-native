//region ************************************** Directional Movement Plus Indicator (DMI+) Indicator******************************************

/***
 * Constructor for Directional Movement Plus Indicator (DMI+) Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
 infChart.DirectionalMovementPlusIndicator = function (id, chartId, type, chartInstance) {

    infChart.Indicator.apply(this, arguments);

    this.params.period = 14;
    this.axisId = "#DMIP_" + id;

    this.addAxis({
        id: this.axisId,
        startOnTick: false,
        endOnTick: false
    });


    this.series[0] = chartInstance.addSeries({
        "id": id,
        infIndType: "DMIP",
        infIndSubType: "DMIP",
        /* data: [],*/
        infType: "indicator",
        "yAxis": this.axisId,
        showInLegend: false,
        "name": "DMIP"
    }, true);


};

infChart.util.extend(infChart.Indicator, infChart.DirectionalMovementPlusIndicator);

infChart.DirectionalMovementPlusIndicator.prototype.calculate = function (ohlc, data, redraw) {
    var high = ohlc.h,
        low = ohlc.l,
        close = ohlc.c;
    var that = this;

    if (data && data.length > 0) {

        var dmi = that.getSeries(high, low, close, 1, infChart.indicatorDefaults.EXPONENTIALMOVINGAVERAGE, that.params.period);
        var _dmi = that.merge(data, dmi);
        this.series[0].setData(_dmi, false, false, false);

        if (redraw) {
            var chart = this.chart;
            chart.redraw();
        }
    }
};

infChart.DirectionalMovementPlusIndicator.prototype.getSeries = function (hts, lts, cts, grn, ma, nocp) {

    return this.dmi(hts, lts, cts, grn, ma, nocp);
};

//endregion **************************************Directional Movement Plus Indicator (DMI+) Indicator******************************************

