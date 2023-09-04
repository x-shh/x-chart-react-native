//region ************************************** Parabolic Stops and Reversals (SAR) Indicator******************************************

/***
 * Constructor for Parabolic Stops and Reversals (SAR)  Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
 infChart.SARIndicator = function (id, chartId, type, chartInstance) {

    infChart.Indicator.apply(this, arguments);

    this.params.af = 0.02;
    this.params.maxaf = 0.2;
    this.titleParams = ["af", "maxaf"];
    this.titleParamsDec = [2, 1];

    var color = infChart.util.getNextSeriesColor(chartId);

    this.series[0] = chartInstance.addSeries({
        id: id,
        name: "SAR",
        infIndType: "SAR",
        infIndSubType: "SAR",
        /* data: [],*/
        infType: "indicator",
        yAxis: "#0",
        type: "dash",
        //dashStyle:"dot",
        //lineWidth : 0,
        //marker : {
        //    enabled : true,
        //    radius : 1
        //},
        color: color,
        lineColor: color
    }, true);
};

infChart.util.extend(infChart.Indicator, infChart.SARIndicator);

infChart.SARIndicator.prototype.calculate = function (ohlc, data, redraw) {
    var high = ohlc.h,
        low = ohlc.l,
        close = ohlc.c;

    if (data && data.length > 1) {
        var chart = this.chart;
        var sar = this.getSeries(high, low, close, +this.params.af, +this.params.maxaf);
        var _sar = this.merge(data, sar);
        chart.get(this.id).setData(_sar, redraw, false, false);
    }
};

infChart.SARIndicator.prototype.getSeries = function (hts, lts, cts, af, maxaf) {
    var retval, k, upTrend, prevAF = af, currentAF = af, prevSAR, initialPSAR, ep, prevTrendUp;

    upTrend = false;

    initialPSAR = new Array(hts.length);
    initialPSAR[0] = hts[0];

    ep = new Array(hts.length);
    ep[0] = lts[0];

    retval = new Array(hts.length);
    prevSAR = retval[0] = hts[0];

    prevTrendUp = upTrend;

    for (k = 1; k < retval.length; k++) {

        prevSAR = retval[k - 1];

        // set current extreme point and initial PSAR
        if (upTrend) {
            ep[k] = Math.max(ep[k - 1], hts[k]);
            initialPSAR[k] = Math.min(prevSAR - prevAF * (prevSAR - ep[k - 1] ), lts[k - 1]);

        } else {
            ep[k] = Math.min(ep[k - 1], lts[k]);
            initialPSAR[k] = Math.max(prevSAR - prevAF * (prevSAR - ep[k - 1]), hts[k - 1]);
        }

        // set current PSAR value
        if (!prevTrendUp && hts[k] < initialPSAR[k]) {
            retval[k] = initialPSAR[k];
        }
        else if (prevTrendUp && lts[k] > initialPSAR[k]) {
            retval[k] = initialPSAR[k];
        }
        else if (!prevTrendUp && hts[k] >= initialPSAR[k]) {
            retval[k] = ep[k - 1];
        }
        else if (prevTrendUp && lts[k] <= initialPSAR[k]) {
            retval[k] = ep[k - 1];
        }

        prevTrendUp = upTrend; // set previous Trend
        upTrend = !(retval[k] > cts[k]); // set current Trend

        // set current acceleration factor
        if (upTrend == prevTrendUp && ep[k] != ep[k - 1] && prevAF < maxaf) {
            currentAF = prevAF + af;
        }
        else if (upTrend == prevTrendUp && ep[k] == ep[k - 1]) {
            currentAF = prevAF;
        }
        else if (upTrend != prevTrendUp) {
            currentAF = af;
        }

        prevAF = currentAF;
    }
    return retval;
};

//endregion **************************************Parabolic Stops and Reversals (SAR) Indicator******************************************