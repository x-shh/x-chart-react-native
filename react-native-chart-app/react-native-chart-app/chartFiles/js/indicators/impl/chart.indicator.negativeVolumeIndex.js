//region **************************************  Negative Volume Index (NVI) Indicator******************************************

/***
 * Constructor for Negative Volume Index (NVI) Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
 infChart.NegativeVolumeIndexIndicator = function (id, chartId, type, chartInstance) {

    infChart.Indicator.apply(this, arguments);

    this.axisId = "#NVI_" + id;

    this.addAxis({
        id: this.axisId,
        startOnTick: false,
        endOnTick: false
    });

    this.series[0] = chartInstance.addSeries({
        id: id,
        name: "NVI",
        infIndType: "NVI",
        infIndSubType: "NVI",
        /* data: [],*/
        infType: "indicator",
        yAxis: this.axisId,
        showInLegend: false
    }, true);
};

infChart.util.extend(infChart.Indicator, infChart.NegativeVolumeIndexIndicator);

infChart.NegativeVolumeIndexIndicator.prototype.calculate = function (ohlc, data, redraw) {
    var close = ohlc.c,
        volume = ohlc.v;
    if (data && data.length > 0) {
        var chart = this.chart;
        var trix = this.getSeries(close, volume, 1000);
        var _vma = this.merge(data, trix);
        chart.get(this.id).setData(_vma, redraw, false, false);
    }
};

infChart.NegativeVolumeIndexIndicator.prototype.getSeries = function (cts, vts, volumeStartsAt) {
    var k, volumeDiff, pchg, retval;

    retval = new Array(cts.length);
    retval[0] = volumeStartsAt;

    if (retval.length == 1) {
        return retval;
    }

    for (k = 1; k < retval.length; k++) {
        volumeDiff = vts[k] - vts[k - 1];
        if (volumeDiff < 0) {
            pchg = (cts[k] / cts[k - 1] - 1.0) * 100.0;
            retval[k] = retval[k - 1] + pchg;
        }
        else {
            retval[k] = retval[k - 1];
        }
    }

    return retval;
};

//endregion **************************************Negative Volume Index (NVI) Indicator******************************************