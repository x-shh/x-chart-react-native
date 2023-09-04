//region ************************************** Bullish Engulfing (BullishEng) Indicator******************************************

/***
 * Constructor for Bullish Engulfing (BullishEng) Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
 infChart.BullishEngulfingIndicator = function (id, chartId, type, chartInstance) {

    infChart.Indicator.apply(this, arguments);
    this.params.period = 5;
    this.params.nBars = 1;
    this.titleParams = ["period", "nBars"];
    this.icons["infsignal"] = "icon ico-arrow-up";
    this.icons["plotrange"] = "icon ico-shape1";

    var upColor = infChart.util.getDefaultUpColor(), downColor = infChart.util.getDefaultDownColor();

    this.series[0] = chartInstance.addSeries({
        id: id,
        name: "BullishEng",
        infIndType: "BullishEng",
        infIndSubType: "BullishEngBar",
        type: "plotrange",
        infType: "indicator",
        yAxis: "#0",
        showInLegend: false,
        hideLegend: true,
        groupPadding: 0,
        pointPadding: 0,
        onSeries: chartInstance.series[0].options.id,
        borderWidth: 0,
        fillOpacity: 0.5,
        pointPlacement: 'on',
        title: "S"
    }, false);
    this.series[1] = chartInstance.addSeries({
        id: id + '_BullishEngSignal',
        name: "BullishEngSignal",
        infIndType: "BullishEng",
        infIndSubType: "BullishEngSignal",
        /* data: [],*/
        type: "infsignal",
        shape: "uparw",
        infType: "indicator",
        yAxis: "#0",
        showInLegend: true,
        hideLegend: false,
        hideToolTip: true,
        infAvoidToolTipSel: true,
        onKey: "low",
        onSeries: this.series[0].options.id,
        lineColor: upColor,
        fillColor: upColor,
        color: upColor,
        /*textAlign : "top",*/
        textAlign: "bottom",
        style: {fontWeight: "bold", fontSize: "10px", color: upColor},
        title: "BullEng"/*,
         y : 12*/
    }, true);


    this.style[this.series[0].options.id] = ["plotrange"];
    this.style[this.series[1].options.id] = ["infsignal"];
    this.onOff = [this.series[0].options.id, this.series[1].options.id];

};

infChart.util.extend(infChart.Indicator, infChart.BullishEngulfingIndicator);

infChart.BullishEngulfingIndicator.prototype.calculate = function (ohlc, data, redraw) {
    var high = ohlc.h,
        low = ohlc.l,
        close = ohlc.c,
        open = ohlc.o,
        that = this;

    if (data && data.length > 0) {
        var macdCross = that.getSeries(high, low, close, open, infChart.indicatorDefaults.EXPONENTIALMOVINGAVERAGE, parseInt(that.params.period), parseInt(this.params.nBars));
        infChart.util.forEach(this.series, function (i, series) {
            switch (series.options.infIndSubType) {
                case 'BullishEngBar':
                    var _macd = that.merge(data, macdCross.barh, macdCross.barl, true);
                    series.setData(_macd, true, false, false);
                    break;
                case 'BullishEngSignal':
                    var _macd2 = that.merge(data, macdCross.bar);
                    series.setData(_macd2, false, false, false);
                    break;
            }
        });

        if (redraw) {
            var chart = this.chart;
            chart.redraw();
        }
    }
};

infChart.BullishEngulfingIndicator.prototype.getSeries = function (hts, lts, cts, ots, ma, period, nBars) {
    var i,
        len = cts.length,
        k = Math.min(cts.length - 1, period - 1) + 4,
        resultb = new Array(cts.length),
        resultbh = new Array(cts.length),
        resultbl = new Array(cts.length),
        ema = this.movmeanNew(cts, ma, period),
        condition2,
        condition3,
        condition5,
        condition4,
        trend;

    if (cts.length >= k) {

        for (k; k < cts.length; k++) {

            trend = cts[k] > cts[k - 2] && cts[k - 2] < cts[k - 4] && cts[k - 1] < cts[k - 3];

            if (trend) {

                condition2 = (ema[k - 1] > cts[k - 1] && ema[k - 2] > cts[k - 2] && ema[k - 3] > cts[k - 3] && ema[k - 4] > cts[k - 4] );

                if (condition2) {

                    condition3 = cts[k - 1] < ots[k - 1] && cts[k] > ots[k];
                    condition4 = cts[k] > ots[k - 1] && cts[k - 1] > ots[k];

                    if (condition3 && condition4) {

                        condition5 = true;

                        for (i = k - 1; i < k - 1 + nBars && i < len; i++) {

                            if (!(ots[i] < ema[i] && cts[i] < ema[i])) {

                                condition5 = false;
                                break;
                            }
                        }

                        if (condition5) {

                            resultb[k] = hts[k];
                            resultbh[k - 1] = Math.max(hts[k], hts[k - 1]);
                            resultbh[k] = Math.max(hts[k], hts[k - 1]);
                            resultbl[k] = Math.min(lts[k], lts[k - 1]);
                            resultbl[k - 1] = Math.min(lts[k], lts[k - 1]);
                        }
                    }
                }
            }

        }
    }

    return {bar: resultb, barh: resultbh, barl: resultbl};
};

infChart.BullishEngulfingIndicator.prototype.getTooltipValue = function (point) {
    var tooltipData;
    if (!point.series.hideToolTip) {
        tooltipData = {
            'raw': {'value': '', 'time': point.x},
            'formatted': {'value': '', 'time': infChart.manager.getChart(this.chartId).getTooltipTime(point.x)},
            'label': this.getLabel(point.series.options.id, "indicatorShortDesc"),
            'color': this.getTooltipColor(point.series)
        };
    }
    return tooltipData;
};


infChart.BullishEngulfingIndicator.prototype.getTooltipValueByBaseRow = function (point, indRow, baseRowIdx) {
    return this.getTooltipValue(point);
};

infChart.BullishEngulfingIndicator.prototype.getTooltipColor = function (series) {
    return this.series[1].color;
};

infChart.BullishEngulfingIndicator.prototype.getContextMenuOptions = function (chartId, series, options) {
    return {
        "removeIndicator": {
            icon : options.removeIndicator.icon,
            displayText :options.removeIndicator.displayText,
            action : function () {
                infChart.indicatorMgr.removeIndicator(chartId, series.options.id);
            }
        }
    }
};



//endregion ************************************** end of Bullish Engulfing (BullishEng) Indicator******************************************
