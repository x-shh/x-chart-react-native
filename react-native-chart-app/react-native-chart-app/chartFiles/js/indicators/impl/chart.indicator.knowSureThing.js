//region **************************************  Know Sure Thing (KST) Indicator******************************************

/***
 * Constructor for Know Sure Thing (KST) Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
 infChart.KnowSureThingIndicator = function (id, chartId, type, chartInstance) {

    infChart.Indicator.apply(this, arguments);
    this.params.roc_period1 = 10;
    this.params.roc_period2 = 15;
    this.params.roc_period3 = 20;
    this.params.roc_period4 = 30;
    this.params.sma_period1 = 10;
    this.params.sma_period2 = 10;
    this.params.sma_period3 = 10;
    this.params.sma_period4 = 15;
    this.params.weight1 = 1;
    this.params.weight2 = 2;
    this.params.weight3 = 3;
    this.params.weight4 = 4;
    this.params.signal_period = 9;
    this.params.base = infChart.indicatorDefaults.ULCLOSEPRICE;

    this.titleParams = ["roc_period1", "roc_period2", "roc_period4", "roc_period4", "sma_period1", "sma_period2", "sma_period3", "sma_period4", "weight1", "weight2", "weight3", "weight4", "signal_period"];
    this.axisId = "#KST_" + id;

    this.addAxis({
        id: this.axisId,
        startOnTick: false,
        endOnTick: false
    });

    var upColor = infChart.util.getDefaultUpColor(), downColor = infChart.util.getDefaultDownColor();

    this.series[0] = chartInstance.addSeries({
        id: id,
        name: "KST",
        infIndType: "KST",
        infIndSubType: "KST",
        /* data: [],*/
        infType: "indicator",
        yAxis: this.axisId,
        showInLegend: false,
        color: upColor,
        lineColor: upColor
    }, false);

    this.series[1] = chartInstance.addSeries({
        id: id + "_KST2",
        name: "Sig",
        infIndType: "KST",
        infIndSubType: "KST2",
        /* data: [],*/
        infType: "indicator",
        yAxis: this.axisId,
        showInLegend: false,
        color: downColor,
        lineColor: downColor
    }, true);

    this.onOff = [this.series[0].options.id, this.series[1].options.id];
};

infChart.util.extend(infChart.Indicator, infChart.KnowSureThingIndicator);

infChart.KnowSureThingIndicator.prototype.calculate = function (ohlc, data, redraw) {
    var high = ohlc.h,
        low = ohlc.l,
        close = ohlc.c,
        open = ohlc.o;

    if (data && data.length > 0) {
        var chart = this.chart;
        var kst = this.getSeries(high, low, close, open, this.params.base, this.params.roc_period1, this.params.roc_period2, this.params.roc_period3, this.params.roc_period4,
            this.params.sma_period1, this.params.sma_period2, this.params.sma_period3, this.params.sma_period4,
            this.params.weight1, this.params.weight2, this.params.weight3, this.params.weight4, this.params.signal_period);
        var _kst = this.merge(data, kst.kst);
        var _kstSeries = chart.get(this.id);
        _kstSeries && _kstSeries.setData(_kst, redraw, false, false);

        var _sig = this.merge(data, kst.sig);
        var _sigSeries = chart.get(this.id + "_KST2");
        _sigSeries && _sigSeries.setData(_sig, redraw, false, false);
    }
};

infChart.KnowSureThingIndicator.prototype.getSeries = function (hts, lts, cts, ots, ul, roc_period1, roc_period2, roc_period3, roc_period4,
                                                                sma_period1, sma_period2, sma_period3, sma_period4, weight1, weight2, weight3, weight4, signal_period) {
    var k, rcma1, rcma2, rcma3, retval, rcma4, sig;

    rcma1 = this.movmean(this.roc(hts, lts, cts, ots, ul, roc_period1), infChart.indicatorDefaults.ARITHMETICMOVINGAVERAGE, sma_period1);
    rcma2 = this.movmean(this.roc(hts, lts, cts, ots, ul, roc_period2), infChart.indicatorDefaults.ARITHMETICMOVINGAVERAGE, sma_period2);
    rcma3 = this.movmean(this.roc(hts, lts, cts, ots, ul, roc_period3), infChart.indicatorDefaults.ARITHMETICMOVINGAVERAGE, sma_period3);
    rcma4 = this.movmean(this.roc(hts, lts, cts, ots, ul, roc_period4), infChart.indicatorDefaults.ARITHMETICMOVINGAVERAGE, sma_period4);

    retval = new Array(rcma1.length);
    for (k = 0; k < retval.length; k++) {
        retval[k] = (rcma1[k] * weight1 + rcma2[k] * weight2 + rcma3[k] * weight3 + rcma4[k] * weight4);
    }

    sig = this.movmean(retval, infChart.indicatorDefaults.ARITHMETICMOVINGAVERAGE, signal_period);
    return {kst: retval, sig: sig};
};

//endregion ************************************** Know Sure Thing (KST) Indicator******************************************