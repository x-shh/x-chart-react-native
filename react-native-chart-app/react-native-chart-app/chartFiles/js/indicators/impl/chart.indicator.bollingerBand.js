//region **************************************Bollinger Band Indicator******************************************

/***
 * constructor for Bolinger Band indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
 infChart.BolingerBandIndicator = function (id, chartId, type, chartInstance) {

    infChart.Indicator.apply(this, arguments);

    this.params.period = 20;
    this.params.deviation1 = 2;
    this.params.deviation2 = -2;
    this.params.base = infChart.indicatorDefaults.ULCLOSEPRICE;
    this.titleParams = ["period", "deviation1", "deviation2"];

    var theme = {
        color: "#BBBBBB",
        lineColor: "#BBBBBB",
        areaFillOpacity: 0.3,
        lineFillOpacity: 0.5
    };

    if (Highcharts.theme && Highcharts.theme.indicator && Highcharts.theme.indicator.BB) {
        theme = infChart.util.merge(theme, Highcharts.theme.indicator.BB);
    }

    this.series[0] = chartInstance.addSeries({
        id: id,
        name: "BB",
        infIndType: "BB",
        infIndSubType: "BB",
        type: "arearange",
        /*data: [],*/
        color: theme.color,
        lineColor: theme.lineColor,
        infType: "indicator",
        yAxis: "#0",
        zIndex: 3,
        fillOpacity: theme.areaFillOpacity,
        hideToolTip: true,
        showInNavigator: false,
        enableMouseTracking: true,
        states: {
            hover: {
                enabled: false
            }
        }
    }, false);

    this.series[1] = chartInstance.addSeries({
        id: id + '_BBU',
        infIndType: "BB",
        infIndSubType: "BBU",
        name: "Upper",
        type: "line",
        /*data: [],*/
        color: theme.color,
        lineColor: theme.lineColor,
        infType: "indicator",
        yAxis: "#0",
        zIndex: 3,
        fillOpacity: theme.lineFillOpacity,
        hideLegend: true,
        showInLegend: false,
        showInNavigator: false,
        enableMouseTracking: true,
        states: {
            hover: {
                enabled: false
            }
        }
    }, false);

    this.series[2] = chartInstance.addSeries({
        id: id + '_BBM',
        infIndType: "BB",
        infIndSubType: "BBM",
        name: "Mid",
        type: "line",
        /*data: [],*/
        color: theme.color,
        lineColor: theme.lineColor,
        infType: "indicator",
        yAxis: "#0",
        zIndex: 3,
        fillOpacity: theme.lineFillOpacity,
        hideLegend: true,
        showInLegend: false,
        showInNavigator: false,
        enableMouseTracking: true,
        states: {
            hover: {
                enabled: false
            }
        }
    }, false);

    this.series[3] = chartInstance.addSeries({
        id: id + '_BBL',
        infIndType: "BB",
        infIndSubType: "BBL",
        name: "Lower",
        type: "line",
        /*data: [],*/
        color: theme.color,
        lineColor: theme.lineColor,
        infType: "indicator",
        yAxis: "#0",
        zIndex: 3,
        fillOpacity: theme.lineFillOpacity,
        hideLegend: true,
        showInLegend: false,
        showInNavigator: false,
        enableMouseTracking: true,
        states: {
            hover: {
                enabled: false
            }
        }
    }, true);

    this.style[this.series[0].options.id] = ["arearange"];
};

infChart.util.extend(infChart.Indicator, infChart.BolingerBandIndicator);

infChart.BolingerBandIndicator.prototype.calculate = function (ohlc, data, redraw) {
    var high = ohlc.h,
        low = ohlc.l,
        close = ohlc.c,
        open = ohlc.o;

    if (data && data.length > 0) {
        var that = this;
        var bbh = this.getSeries(high, low, close, open, this.params.base, infChart.indicatorDefaults.ARITHMETICMOVINGAVERAGE,
            infChart.indicatorDefaults.EXPONENTIALMOVINGAVERAGE, this.params.period, this.params.deviation1);
        var bbm = this.getSeries(high, low, close, open, this.params.base, infChart.indicatorDefaults.ARITHMETICMOVINGAVERAGE,
            infChart.indicatorDefaults.EXPONENTIALMOVINGAVERAGE, this.params.period, 0);
        var bbl = this.getSeries(high, low, close, open, this.params.base, infChart.indicatorDefaults.ARITHMETICMOVINGAVERAGE,
            infChart.indicatorDefaults.EXPONENTIALMOVINGAVERAGE, this.params.period, this.params.deviation2);
        var _bb = this.merge(data, bbl, bbh);

        var _bbm = this.merge(data, bbm);
        var _bbh = this.merge(data, bbh);
        var _bbl = this.merge(data, bbl);


        infChart.util.forEach(this.series, function (i, series) {
            switch (series.options.infIndSubType) {
                case 'BB' :
                    series.setData(_bb, false, false, false);
                    break;
                case 'BBM' :
                    series.setData(_bbm, false, false, false);
                    break;
                case 'BBU' :
                    series.setData(_bbh, false, false, false);
                    break;
                case 'BBL' :
                    series.setData(_bbl, false, false, false);
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

infChart.BolingerBandIndicator.prototype.getSeries = function (hts, lts, cts, ots, ul, ma, md, nocp, delta) {
    var ts, bb, dev, k;
    ts = this.movul(hts, lts, cts, ots, ul);
    bb = this.movmean(ts, ma, nocp);
    if (delta == 0)
        return bb;
    dev = this.movdev(ts, md, nocp);
    for (k = 0; k < bb.length; k++)
        bb[k] = bb[k] + delta * dev[k];
    return bb;
};

infChart.BolingerBandIndicator.prototype.getContextMenuOptions = function (chartId, series, options) {
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

//endregion **************************************Bollinger Band Indicator******************************************
