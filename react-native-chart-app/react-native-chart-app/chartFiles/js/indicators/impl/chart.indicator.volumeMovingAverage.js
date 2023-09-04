//region ************************************** Volume Moving Average (VMA) Indicator******************************************

/***
 * Constructor for Volume Moving Average (VMA)  Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
 infChart.VolumeMovingAverageIndicator = function (id, chartId, type, chartInstance) {

    infChart.Indicator.apply(this, arguments);

    this.params.period = 21;
    this.params.shift = 0;
    this.titleParams = ["period", "shift"];

    this.axisId = "#VMA_" + id;

    this.addAxis({
        id: this.axisId,
        startOnTick: false,
        endOnTick: false
    });


    this.series[0] = chartInstance.addSeries({
        id: id,
        name: "VMA",
        infIndType: "VMA",
        infIndSubType: "VMA",
        /* data: [],*/
        infType: "indicator",
        yAxis: this.axisId,
        showInLegend: false
    }, true);
};

infChart.util.extend(infChart.Indicator, infChart.VolumeMovingAverageIndicator);

infChart.VolumeMovingAverageIndicator.prototype.calculate = function (ohlc, data, redraw) {
    var volume = ohlc.v;
    if (data && data.length > 0) {
        var chart = this.chart;
        var vma = this.getSeries(volume, infChart.indicatorDefaults.ARITHMETICMOVINGAVERAGE, this.params.period, this.params.shift);
        var _vma = this.merge(data, vma);
        chart.get(this.id).setData(_vma, redraw, false, false);
    }
};

infChart.VolumeMovingAverageIndicator.prototype.getSeries = function (ts, ma, m, shift) {
    var retval = this.movmean(ts, ma, m);

    if (shift > 0) {
        var k = 0;
        for (k = 1; k < retval.length; k++) {
            retval[k] = +shift + retval[k];
        }
    }
    return retval;
};

//endregion **************************************Volume Moving Average (VMA) Indicator******************************************