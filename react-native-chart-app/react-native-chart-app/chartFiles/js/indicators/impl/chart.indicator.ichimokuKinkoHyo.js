//region ************************************** Ichimoku Kinko Hyo (ICHI) Indicator******************************************

/***
 * Constructor for Ichimoku Kinko Hyo (ICHI) Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
 infChart.IchimokuKinkoHyoIndicator = function (id, chartId, type, chartInstance) {

    infChart.Indicator.apply(this, arguments);

    this.params.period1 = 9;
    this.params.period2 = 26;
    this.params.period3 = 52;

    this.titleParams = ["period1", "period2", "period3"];

    var color = infChart.util.getNextSeriesColor(chartId), upColor = infChart.util.getDefaultUpColor(), downColor = infChart.util.getDefaultDownColor();

    this.series[0] = chartInstance.addSeries({
        id: id,
        name: "ICHI",
        infIndType: "ICHI",
        infIndSubType: "ICHI",
        /* data: [],*/
        infType: "indicator",
        yAxis: "#0",
        color: color,
        lineColor: color,
        enableMouseTracking: true,
        states: {
            hover: {
                enabled: false
            }
        }
    }, false);

    color = infChart.util.getNextSeriesColor(chartId);

    this.series[1] = chartInstance.addSeries({
        id: id + "_ICHI2",
        name: "Kijun",
        infIndType: "ICHI",
        infIndSubType: "ICHI2",
        /* data: [],*/
        infType: "indicator",
        yAxis: "#0",
        color: color,
        lineColor: color,
        hideLegend: true,
        showInLegend: false,
        enableMouseTracking: true,
        states: {
            hover: {
                enabled: false
            }
        }
    }, false);

    color = infChart.util.getNextSeriesColor(chartId);
    this.series[2] = chartInstance.addSeries({
        id: id + "_ICHI3",
        name: "Senkou-span A",
        infIndType: "ICHI",
        infIndSubType: "ICHI3",
        /* data: [],*/
        infType: "indicator",
        yAxis: "#0",
        color: color,
        lineColor: color,
        hideLegend: true,
        showInLegend: false,
        enableMouseTracking: true,
        states: {
            hover: {
                enabled: false
            }
        }
    }, false);

    color = infChart.util.getNextSeriesColor(chartId);
    this.series[3] = chartInstance.addSeries({
        id: id + "_ICHI4",
        name: "Senkou-span B",
        infIndType: "ICHI",
        infIndSubType: "ICHI4",
        /* data: [],*/
        infType: "indicator",
        yAxis: "#0",
        color: color,
        lineColor: color,
        hideLegend: true,
        showInLegend: false,
        enableMouseTracking: true,
        states: {
            hover: {
                enabled: false
            }
        }
    }, false);

    color = infChart.util.getNextSeriesColor(chartId);
    this.series[4] = chartInstance.addSeries({
        id: id + "_ICHI5",
        name: "Chikou",
        infIndType: "ICHI",
        infIndSubType: "ICHI5",
        /* data: [],*/
        infType: "indicator",
        yAxis: "#0",
        color: color,
        lineColor: color,
        hideLegend: true,
        showInLegend: false,
        enableMouseTracking: true,
        states: {
            hover: {
                enabled: false
            }
        }
    }, false);

    this.series[5] = chartInstance.addSeries({
        id: id + "_ICHI6",
        name: "Senkou-span up",
        infIndType: "ICHI",
        infIndSubType: "ICHI6",
        type: "arearange",
        /* data: [],*/
        color: upColor,
        lineWidth: 0,
        infType: "indicator",
        yAxis: "#0",
        zIndex: 3,
        fillOpacity: 0.5,
        hideLegend: true,
        showInLegend: false,
        enableMouseTracking: true,
        states: {
            hover: {
                enabled: false
            }
        }
    }, false);

    this.series[6] = chartInstance.addSeries({
        id: id + "_ICHI7",
        name: "Senkou-span down",
        infIndType: "ICHI",
        infIndSubType: "ICHI7",
        type: "arearange",
        /* data: [],*/
        color: downColor,
        lineWidth: 0,
        infType: "indicator",
        yAxis: "#0",
        zIndex: 3,
        fillOpacity: 0.5,
        hideLegend: true,
        showInLegend: false,
        enableMouseTracking: true,
        states: {
            hover: {
                enabled: false
            }
        }
    }, true);

    this.style[this.series[5].options.id] = ["arearange"];
    this.style[this.series[6].options.id] = ["arearange"];
};

infChart.util.extend(infChart.Indicator, infChart.IchimokuKinkoHyoIndicator);

infChart.IchimokuKinkoHyoIndicator.prototype.calculate = function (ohlc, data, redraw) {
    var close = ohlc.c,
        high = ohlc.h,
        low = ohlc.l,
        open = ohlc.o;

    if (data && data.length > 0) {
        var chart = this.chart;
        var seriesObj = this.getSeries(high, low, close, +this.params.period1, +this.params.period2, +this.params.period3);
        var _cl = this.merge(data, seriesObj.clts);
        var _bl = this.merge(data, seriesObj.blts);
        var _ssa = this.merge(data, seriesObj.ssats);
        var _ssb = this.merge(data, seriesObj.ssbts);
        var _clag = this.merge(data, seriesObj.clLagts);

        var spang = this.merge(data, seriesObj.spang1, seriesObj.spang2);
        var spanr = this.merge(data, seriesObj.spanr1, seriesObj.spanr2);

        chart.get(this.id).setData(_cl, false, false, false);
        chart.get(this.id + "_ICHI2").setData(_bl, false, false, false);
        chart.get(this.id + "_ICHI3").setData(_ssa, false, false, false);
        chart.get(this.id + "_ICHI4").setData(_ssb, false, false, false);
        chart.get(this.id + "_ICHI5").setData(_clag, false, false, false);
        chart.get(this.id + "_ICHI6").setData(spang, false, false, false);
        chart.get(this.id + "_ICHI7").setData(spanr, redraw, false, false);
    }
};

infChart.IchimokuKinkoHyoIndicator.prototype.getSeries = function (hts, lts, cts, period1, period2, period3) {
    var hh, ll, clts, blts, ssats, ssbts, csts, k;


    hh = this.movmax(hts, period1);
    ll = this.movmin(lts, period1);
    clts = new Array(hh.length);

    for (k = 0; k < clts.length; k++) {
        clts[k] = (hh[k] + ll[k]) / 2;
    }


    hh = this.movmax(hts, period2);
    ll = this.movmin(lts, period2);
    blts = new Array(hh.length);

    for (k = 0; k < blts.length; k++) {
        blts[k] = (hh[k] + ll[k]) / 2;
    }


    ssats = new Array(blts.length);
    for (k = 0; k < ssats.length; k++) {
        ssats[k] = (clts[k] + blts[k]) / 2;
    }

    hh = this.movmax(hts, period3);
    ll = this.movmin(lts, period3);
    ssbts = new Array(hh.length);

    for (k = 0; k < ssbts.length; k++) {
        ssbts[k] = (hh[k] + ll[k]) / 2;
    }

    var clLagts = this.movpos(cts, period2);

    var spang1, spang2, spanr1, spanr2;
    spang1 = new Array(ssats.length);
    spang2 = new Array(ssats.length);
    spanr1 = new Array(ssats.length);
    spanr2 = new Array(ssats.length);
    //spanr1 = spanr2 = new Array(ssats.length);
    var diff;

    for (k = 0; k < ssats.length; k++) {
        diff = ssats[k] - ssbts[k];
        if (diff > 0) {
            spang1[k] = ssats[k];
            spang2[k] = ssbts[k];
            spanr1[k] = ssats[k];
            spanr2[k] = ssats[k];
        }
        else {
            spang1[k] = ssats[k];
            spang2[k] = ssats[k];
            spanr1[k] = ssats[k];
            spanr2[k] = ssbts[k];
        }

    }

    return {
        clts: clts,
        blts: blts,
        ssats: ssats,
        ssbts: ssbts,
        clLagts: clLagts,
        spang1: spang1,
        spang2: spang2,
        spanr1: spanr1,
        spanr2: spanr2
    };

};

infChart.IchimokuKinkoHyoIndicator.prototype.movpos = function (ts, m) {
    var movmaxpos = new Array(ts.length), k, maxpos, max;

    for (k = 0; k < ts.length - m; k++) {
        movmaxpos[k] = ts[k + m];
    }

    return movmaxpos;
};

infChart.IchimokuKinkoHyoIndicator.prototype.getContextMenuOptions = function (chartId, series, options) {
    return {
        "removeIndicator": {
            icon : options.removeIndicator.icon,
            displayText :options.removeIndicator.displayText,
            action : function () {
                let indicator = infChart.indicatorMgr.getIndicatorBySeriesId(chartId, series.options.id);
                infChart.manager.removeSeries(series.chart.renderTo.id, indicator.id, series.options.infType);
            }
        }
    }
};
//endregion **************************************Ichimoku Kinko Hyo (ICHI) Indicator******************************************