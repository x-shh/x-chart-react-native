//region ************************************** Williams´ %R (WPR) Indicator******************************************

/***
 * Constructor for Williams´ %R (WPR)  Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
 infChart.WilliamsPRIndicator = function (id, chartId, type, chartInstance) {

    infChart.Indicator.apply(this, arguments);

    this.axisId = "#WPR_" + id;
    this.params.lowerLevel = -0.8;
    this.params.upperLevel = -0.2;
    this.params.period = 14;
    this.titleParams = ["period", "lowerLevel", "upperLevel"];
    this.titleParamsDec = [0, 1, 1];

    var colors = infChart.util.getSeriesColors();
    var upColor = infChart.util.getDefaultUpColor();
    var downColor = infChart.util.getDefaultDownColor();

    this.addAxis({
        id: this.axisId,
        min: -1,
        max: 0,
        "plotLines": [
            {
                "value": -0.5,
                "color": "#888888",
                "dashStyle": "shortdash",
                "width": 1,
                "zIndex": 3
            }],
        startOnTick: false,
        endOnTick: false
    });


    this.series[1] = chartInstance.addSeries({
        "id": id + "_WPR3",
        infIndType: "WPR",
        infIndSubType: "WPR3",
        /* data: [],*/
        infType: "indicator",
        "yAxis": this.axisId,
        "name": "Upper",
        "color": upColor,
        "lineColor": upColor,
        "type": "arearange",
        hideLegend: true,
        hideToolTip: true,
        infRecal: true,
        showInLegend: false,
        enableMouseTracking: true,
        states: {
            hover: {
                enabled: false
            }
        }
    }, false);

    this.series[2] = chartInstance.addSeries({
        "id": id + "_WPR4",
        infIndType: "WPR4",
        infIndSubType: "WPR4",
        /* data: [],*/
        infType: "indicator",
        "yAxis": this.axisId,
        "name": "Lower",
        "color": downColor,
        "lineColor": downColor,
        "type": "arearange",
        hideLegend: true,
        hideToolTip: true,
        infRecal: true,
        showInLegend: false,
        enableMouseTracking: true,
        states: {
            hover: {
                enabled: false
            }
        }
    }, false);


    this.series[0] = chartInstance.addSeries({
        id: id,
        infIndType: "WPR",
        infIndSubType: "WPR",
        name: "WPR",
        /* data: [],*/
        infType: "indicator",
        yAxis: this.axisId,
        showInLegend: false,
        color: colors[1],
        lineColor: colors[1],
        enableMouseTracking: true,
        states: {
            hover: {
                enabled: false
            }
        }
    }, true);

    this.style[this.series[1].options.id] = ["line", "arearange"];
    this.style[this.series[2].options.id] = ["line", "arearange"];
};

infChart.util.extend(infChart.Indicator, infChart.WilliamsPRIndicator);

infChart.WilliamsPRIndicator.prototype.calculate = function (ohlc, data, redraw, seriesId) {
    var high = ohlc.h,
        low = ohlc.l,
        close = ohlc.c;

    if (data && data.length > 0) {
        var chart = this.chart;
        if (!seriesId) {
            var wpr = this.getSeries(high, low, close, infChart.indicatorDefaults.ULCLOSEPRICE, this.params.period);
            var _wpr = this.merge(data, wpr);
            chart.get(this.id).setData(_wpr, redraw, false, false);
        }
        if (!seriesId || seriesId == (this.id + '_WPR3')) {
            var series = chart.get(this.id + '_WPR3');
            if (series.options.type === "line") {
                series.setData(this.getBand(data, series.options.type, this.params.upperLevel, this.params.upperLevel), redraw, false, false);
            } else {
                series.setData(this.getBand(data, series.options.type, 0, this.params.upperLevel), redraw, false, false);
            }
        }
        if (!seriesId || seriesId == (this.id + '_WPR4')) {
            var series4 = chart.get(this.id + '_WPR4');
            if (series4.options.type === "line") {
                series4.setData(this.getBand(data, series4.options.type, this.params.lowerLevel, this.params.lowerLevel), redraw, false, false);
            } else {
                series4.setData(this.getBand(data, series4.options.type, this.params.lowerLevel, -1), redraw, false, false);
            }
        }
    }

};

infChart.WilliamsPRIndicator.prototype.getSeries = function (hts, lts, cts, ul, nocp) {
    var denom, wpr, mh, ml, k;
    wpr = this.movul(hts, lts, cts, undefined, ul).slice(0);
    mh = this.movmax(hts, nocp);
    ml = this.movmin(lts, nocp);
    for (k = 0; k < wpr.length; k++) {
        denom = mh[k] - ml[k];
        if (denom < infChart.indicatorConst._EPSDENOM_) {
            wpr[k] = -1.0;
        } else {
            wpr[k] = (wpr[k] - mh[k]) / denom;
        }
    }
    return wpr;
};

infChart.WilliamsPRIndicator.prototype.getContextMenuOptions = function (chartId, series, options) {
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

/**
 * hide indicator
 */
infChart.WilliamsPRIndicator.prototype.hideIndicator = function (seriesId) {
    infChart.Indicator.prototype.hideIndicator.apply(this, [seriesId, true]);
};

/**
 * show indicator
 */
infChart.WilliamsPRIndicator.prototype.showIndicator = function (seriesId) {
    infChart.Indicator.prototype.showIndicator.apply(this, [seriesId, true]);
};

//endregion **************************************Williams´ %R (WPR) Indicator******************************************