//region **************************************Volume******************************************

/***
 * Constructor for Volume
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
 infChart.VolumeIndicator = function (id, chartId, type, chartInstance) {

    infChart.Indicator.apply(this, arguments);

    if (chartInstance) {
        var upColor = infChart.util.getDefaultUpColor(), downColor = infChart.util.getDefaultDownColor(),
            chartOptions = chartInstance.options,
            plotOptions = chartOptions.plotOptions,
            typeOptions = plotOptions["volume"];

        this.axisId = "#VOLUME_" + id;
        this.addAxis({
            infType: "parallelToBase",
            id: this.axisId,
            startOnTick: false,
            endOnTick: false,
            infHeightPercent: 0.2,
            //maxPadding: 0.99,
            /*top:150,
             bottom:280,
             height:280-150,*/
            crosshair: false,
            softThreshold: false
        });

        this.series[0] = chartInstance.addSeries({
            id: id,
            name: "VOLUME",
            infIndType: "VOLUME",
            infIndSubType: "VOLUME",
            /* data: [],*/
            infType: "indicator",
            "type": "volume",
            upColor: upColor,
            color: downColor,
            hasColumnNegative: true,
            lineWidth: typeOptions.lineWidth, // this is done bcz line width specified for the series type is overiddedn by series line width in the high charts code
            "yAxis": this.axisId,
            showInLegend: false,
            dp: 0,
            hideToolTip: true
        }, false);
        this.style[this.series[0].options.id] = ["line", "volume", "area", "dash"];
        this.icons["volume"] = "icon ico-chart-column";
    }
};

infChart.util.extend(infChart.Indicator, infChart.VolumeIndicator);

infChart.VolumeIndicator.prototype.calculate = function (ohlc, data, redraw) {
    if (data && data.length > 0) {
        var volume = ohlc.v,
            open = ohlc.o,
            close = ohlc.c;

        var chart = this.chart;

        var v = this.getSeries(volume, open, close, data, ohlc);
        //var _v = this.mergeObject(data, v);

        chart.get(this.id).setData(v, redraw, false, false);
    }
};

infChart.VolumeIndicator.prototype.getSeries = function (vts, ots, cts, data, ohlc) {

    var k, retval = new Array(vts.length);

    if (data.length && data.length == vts.length) {
        for (k = 0; k < vts.length; k++) {
            //https://xinfiit.atlassian.net/browse/CCA-2763
            if (cts[k] === ots[k] && cts[k] === ohlc.h[k] && cts[k] === ohlc.l[k] && k > 0) {
                ots[k] = cts[k - 1];
            }
            retval[k] = [data[k][0], vts[k], ots[k], cts[k]];
        }
    } else {
        console.debug("Volume getSeries :: data inconsistency");
    }
    return retval;
    //return vts.slice(0)
};

infChart.VolumeIndicator.prototype.getLegendValue = function (x) {

    var decimalPoint = '.', sep = infChart.util.getThousandSeparator();
    return Highcharts.numberFormat(this.series[0].yData[x][0], 0);
};

infChart.VolumeIndicator.prototype._isAxisParallelToBase = function () {
    return true;
};

//endregion **************************************Volume Indicator******************************************