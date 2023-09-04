//region ************************************** AROON Up / Down(ARUD) Indicator******************************************

/***
 * Constructor for AROON Up (ARUD)  Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
 infChart.AROONUpDownIndicator = function (id, chartId, type, chartInstance) {

    infChart.Indicator.apply(this, arguments);

    this.params.period = 25;
    this.axisId = "#ARUD_" + id;

    var colors = infChart.util.getSeriesColors();

    this.addAxis({
        id: this.axisId,
        startOnTick: false,
        endOnTick: false
    });

    this.series[0] = chartInstance.addSeries({
        id: id,
        infIndType: "ARUD",
        infIndSubType: "ARUD",
        name: "ARUD",
        /* data: [],*/
        infType: "indicator",
        yAxis: this.axisId,
        showInLegend: false,
        color: colors[0],
        lineColor: colors[0]
    }, false);

    this.series[1] = chartInstance.addSeries({
        "id": id + "_ARUD2",
        infIndType: "ARUD",
        infIndSubType: "ARUD2",
        /* data: [],*/
        infType: "indicator",
        "yAxis": this.axisId,
        showInLegend: false,
        "name": "ARUD2",
        "color": colors[1],
        "lineColor": colors[1]
    }, true);
};

infChart.util.extend(infChart.Indicator, infChart.AROONUpDownIndicator);

infChart.AROONUpDownIndicator.prototype.calculate = function (ohlc, data, redraw) {
    var high = ohlc.h,
        low = ohlc.l;
    var that = this;

    if (data && data.length > 0) {
        infChart.util.forEach(this.series, function (i, series) {
            switch (series.options.infIndSubType) {
                case 'ARUD':
                    var arud = that.arud(high, low, 1, that.params.period);
                    var _arud = that.merge(data, arud);
                    series.setData(_arud, false, false, false);
                    break;
                case 'ARUD2':
                    var arud2 = that.arud(high, low, 0, that.params.period);
                    var _arud2 = that.merge(data, arud2);
                    series.setData(_arud2, redraw, false, false);
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

infChart.AROONUpDownIndicator.prototype.getSeries = function (hts, lts, cts, grn, ul, ma, nocp1, nocp2, nocp3) {
    var pd = this.pk(hts, lts, cts, undefined, 2, ul, ma, nocp1, nocp2);
    if (grn == 1)
        return pd;
    return this.movmean(pd, ma, nocp3);
};

//endregion **************************************Slow AROON Up (ARUP) Indicator******************************************