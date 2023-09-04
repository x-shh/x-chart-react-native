//region ************************************** MACD Cross and Over Zero Signal (MACDCrossOverZeroSignal) Indicator******************************************

/***
 * Constructor forMACD Cross Signal (MACDCrossOverZeroSignal) Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
 infChart.MACDCrossOverZeroSignal = function (id, chartId, type, chartInstance) {

    infChart.Indicator.apply(this, arguments);
    this.params.mov1 = 12;
    this.params.mov2 = 26;
    this.params.trigger = 9;
    this.params.base = infChart.indicatorDefaults.ULCLOSEPRICE;
    this.titleParams = ["mov1", "mov2", "trigger"];
    this.icons["infUDSignal"] = "icon ico-arrow-up";

    var upColor = infChart.util.getDefaultUpColor(), downColor = infChart.util.getDefaultDownColor();

    this.series[0] = chartInstance.addSeries({
        id: id,
        name: "MACDCrossOverZeroSignal",
        infIndType: "MACDCrossOverZeroSignal",
        infIndSubType: "MACDCrossOverZeroSignalBuy",
        /* data: [],*/
        type: "infUDSignal",
        shape: "arr",
        infType: "indicator",
        yAxis: "#0",
        showInLegend: true,
        onKey: "low",
        onSeries: "c0",
        infAvoidToolTipSel: true,
        lineColor: upColor,
        fillColor: upColor,
        /*textAlign : "top",*/
        style: {fontWeight: "bold", fontSize: "8px", color: "#fff"},
        title: "B",
        y: 12,
        color: upColor
    }, true);

    this.series[1] = chartInstance.addSeries({
        id: id + '_MACDCrossOverZeroSignalSell',
        name: "MACDCrossOverZeroSignal",
        infIndType: "MACDCrossOverZeroSignal",
        infIndSubType: "MACDCrossOverZeroSignalSell",
        /* data: [],*/
        type: "infUDSignal",
        infAvoidToolTipSel: true,
        shape: "arr",
        infType: "indicator",
        yAxis: "#0",
        onKey: "high",
        onSeries: "c0",
        hideLegend: true,
        showInLegend: false,
        style: {fontWeight: "bold", fontSize: "8px", color: "#fff"},
        lineColor: downColor,
        fillColor: downColor,

        title: "S",
        color: downColor
    }, true);

    this.style[this.series[0].options.id] = ["infUDSignal"];
    this.style[this.series[1].options.id] = ["infUDSignal"];
};

infChart.util.extend(infChart.Indicator, infChart.MACDCrossOverZeroSignal);

infChart.MACDCrossOverZeroSignal.prototype.calculate = function (ohlc, data, redraw) {
    var high = ohlc.h,
        low = ohlc.l,
        close = ohlc.c,
        open = ohlc.o;
    var that = this;

    if (data && data.length > 0) {
        var macdCross = that.getSeries(high, low, close, open, that.params.base, infChart.indicatorDefaults.EXPONENTIALMOVINGAVERAGE, that.params.mov1, that.params.mov2, that.params.trigger);
        infChart.util.forEach(this.series, function (i, series) {
            switch (series.options.infIndSubType) {
                case 'MACDCrossOverZeroSignalBuy':
                    var _macd = that.merge(data, macdCross.buy);
                    series.setData(_macd, false, false, false);
                    break;
                case 'MACDCrossOverZeroSignalSell':
                    var _macd2 = that.merge(data, macdCross.sell);
                    series.setData(_macd2, false, false, false);
                    break;
            }
        });

        var type = infChart.manager.getChart(that.chartId).type;
        that.resetSeriesOptions(type);
        if (redraw) {
            var chart = this.chart;
            chart.redraw();
        }
    }
};

infChart.MACDCrossOverZeroSignal.prototype.getSeries = function (hts, lts, cts, ots, ul, ma, nocp1, nocp2, nocp3) {
    var ts,
        result1,
        result2,
        k,
        result3,
        result12 = new Array(cts.length),
        resultb = new Array(cts.length),
        resultr = new Array(cts.length),
        maxnop;

    ts = this.movul(hts, lts, cts, ots, ul);
    result1 = this.movmeanNew(ts, ma, nocp1);
    result2 = this.movmeanNew(ts, ma, nocp2);

    maxnop = Math.max(nocp1, nocp2);

    for (k = maxnop - 1; k < result1.length; k++) {
        if (this.isNumber(result1[k]) && this.isNumber(result2[k]))
            result12[k] = result1[k] - result2[k];
    }

    result3 = this.movmeanNew(result12, ma, nocp3);

    for (k = maxnop + nocp3 - 2; k < result3.length; k++) {

        if (this.isNumber(result12[k - 1]) && this.isNumber(result3[k - 1]) && this.isNumber(result12[k]) && this.isNumber(result3[k])) {

            if (result12[k - 1] < result3[k - 1] && result12[k] > result3[k] && result12[k] > 0) {
                resultb[k] = cts[k];
            } else if (result12[k - 1] > result3[k - 1] && result12[k] < result3[k]) {
                resultr[k] = cts[k];
            }
        }
    }

    return {buy: resultb, sell: resultr};
};

infChart.MACDCrossOverZeroSignal.prototype.getTooltipValue = function (point) {
    var tooltipData;
    if (!point.series.hideToolTip) {
        var value = infChart.manager.getLabel("label.buy");
        if (point.series.options.infIndSubType == "MACDCrossOverZeroSignalSell") {
            value = infChart.manager.getLabel("label.sell");
        }

        tooltipData = {
            'raw': {'value': value, 'time': point.x},
            'formatted': {'value': value, 'time': infChart.manager.getChart(this.chartId).getTooltipTime(point.x)},
            'label': this.getLabel(point.series.options.id, "indicatorShortDesc"),
            'color': this.getTooltipColor(point.series)
        };
    }
    return tooltipData;
};

/**
 * Mathod To Reset the series options if required befor redraw the chart
 * @param type
 */
infChart.MACDCrossOverZeroSignal.prototype.resetSeriesOptions = function (type) {
    if (type == "line" || type == "area" || type == "column") {
        this.series[0].update({onKey: 'y'}, false);
        this.series[1].update({onKey: 'y'}, false);
    } else {
        this.series[0].update({onKey: 'low'}, false);
        this.series[1].update({onKey: 'high'}, false);
    }
};
//endregion ************************************** end of MACD Cross Signal (MACD Cross) Indicator******************************************
