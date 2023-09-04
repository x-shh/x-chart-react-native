//region ************************************** Historical Volatility Indicator******************************************

/***
 * Constructor for Historical Volatility  Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
 infChart.HistoricalVolatilityIndicator = function (id, chartId, type, chartInstance) {

    infChart.Indicator.apply(this, arguments);

    //this.params.period = 25; // TODO : check the logic again
    this.axisId = "#HV_" + id;

    var colors = infChart.util.getSeriesColors();

    this.addAxis({
        id: this.axisId,
        startOnTick: false,
        endOnTick: false
    });

    this.series[0] = chartInstance.addSeries({
        id: id,
        infIndType: "HV",
        infIndSubType: "HV",
        name: "HV",
        /* data: [],*/
        infType: "indicator",
        yAxis: this.axisId,
        showInLegend: false,
        color: colors[1],
        lineColor: colors[1]
    }, false);

    this.series[1] = chartInstance.addSeries({
        "id": id + "_HV2",
        infIndType: "HV",
        infIndSubType: "HV2",
        /* data: [],*/
        infType: "indicator",
        "yAxis": this.axisId,
        showInLegend: false,
        "name": "HV2",
        "color": colors[2],
        "lineColor": colors[2]
    }, true);
};

infChart.util.extend(infChart.Indicator, infChart.HistoricalVolatilityIndicator);

infChart.HistoricalVolatilityIndicator.prototype.calculate = function (ohlc, data, redraw) {
    var high = ohlc.h,
        low = ohlc.l,
        close = ohlc.c;
    var that = this;

    if (data && data.length > 0) {
        infChart.util.forEach(this.series, function (i, series) {
            switch (series.options.infIndSubType) {
                case 'HV':
                    var hv = that.getSeries(high, low, close, infChart.indicatorDefaults.ULCLOSEPRICE, 10, 200);
                    var _hv = that.merge(data, hv);
                    series.setData(_hv, false, false, false);
                    break;
                case 'HV2':
                    var hv2 = that.getSeries(high, low, close, infChart.indicatorDefaults.ULCLOSEPRICE, 100, 200);
                    var _hv2 = that.merge(data, hv2);
                    series.setData(_hv2, redraw, false, false);
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

infChart.HistoricalVolatilityIndicator.prototype.getSeries = function (hts, lts, cts, ul, nocp1, nocpn) {
    var norm, k, hv;
    norm = Math.sqrt(nocpn);
    hv = this.movdev(this.lr(this.movul(hts, lts, cts, undefined, ul)), infChart.indicatorDefaults.MOVINGSTANDARDDEVIATION, nocp1);
    for (k = 0; k < hv.length; k++)
        hv[k] = norm * hv[k];
    return hv;
};

//endregion **************************************Historical Volatility Indicator******************************************