//region **************************************Bid/Ask History Indicator******************************************

/***
 * Cunstructor for Bid/Ask History indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
 infChart.BidAskHistoryIndicator = function (id, chartId, type, chartInstance) {
    infChart.Indicator.apply(this, arguments);
    this.disableSettings = true;

    var theme =
    {
        bid: {
            lineColor: '#0074db',
            fillColor: '#0074db',
            fillOpacity: 0.2
        },
        ask: {
            lineColor: '#ff771b',
            fillColor: '#ff771b',
            fillOpacity: 0.2
        }
    };

    if (Highcharts.theme && Highcharts.theme.indicator && Highcharts.theme.indicator.BAH) {
        theme = infChart.util.merge(theme, Highcharts.theme.indicator.BAH);
    }

    this.series[0] = chartInstance.addSeries({
        id: id,
        name: "AHL",
        infIndType: "BAH",
        infIndSubType: "AHL",
        type: "line",
        color: theme.ask.lineColor,
        lineColor: theme.ask.lineColor,
        infType: "indicator",
        yAxis: "#0",
        zIndex: 3,
        step: "center",
        hideLegend: true,
        hideToolTip: true,
        showInLegend: false,
        showInNavigator: false
    }, false);

    this.series[1] = chartInstance.addSeries({
        id: id + '_AHR',
        name: "Ask",
        infIndType: "BAH",
        infIndSubType: "AHR",
        type: "arearange",
        color: theme.ask.fillColor,
        lineColor: theme.ask.fillColor,
        infType: "indicator",
        lineWidth: 0,
        yAxis: "#0",
        zIndex: 3,
        step: "center",
        fillOpacity: theme.ask.fillOpacity,
        hideLegend: true,
        hideToolTip: true,
        showInLegend: false,
        showInNavigator: false,
        states: {
            hover: {
                lineWidth: 0,
                lineWidthPlus: 0
            }
        }
    }, false);

    this.series[2] = chartInstance.addSeries({
        id: id + '_BLL',
        infIndType: "BAH",
        infIndSubType: "BLL",
        name: "BLL",
        type: "line",
        color: theme.bid.lineColor,
        lineColor: theme.bid.lineColor,
        infType: "indicator",
        yAxis: "#0",
        zIndex: 3,
        step: "center",
        hideLegend: true,
        hideToolTip: true,
        showInLegend: false,
        showInNavigator: false
    }, false);

    this.series[3] = chartInstance.addSeries({
        id: id + '_BLR',
        infIndType: "BAH",
        infIndSubType: "BLR",
        name: "Bid",
        type: "arearange",
        color: theme.bid.fillColor,
        lineColor: theme.ask.fillColor,
        lineWidth: 0,
        infType: "indicator",
        yAxis: "#0",
        zIndex: 3,
        step: "center",
        fillOpacity: theme.ask.fillOpacity,
        hideLegend: true,
        hideToolTip: true,
        showInLegend: false,
        showInNavigator: false,
        states: {
            hover: {
                lineWidth: 0,
                lineWidthPlus: 0
            }
        }
    }, false);
};

infChart.util.extend(infChart.Indicator, infChart.BidAskHistoryIndicator);

infChart.BidAskHistoryIndicator.prototype.calculate = function (ohlc, data, redraw) {
    var askHigh = ohlc.ah,
        askLast = ohlc.a,
        bidLast = ohlc.b,
        bidLow = ohlc.bl;

    if (data && data.length > 0) {
        var i = 0, dataLen = data.length, ahl = [], ahr = [], bll = [], blr = [];
        for (i; i < dataLen; i++) {
            if (askLast[i] != undefined && askLast[i] !== 0) {
                ahl.push([data[i][0], askLast[i]]);
                if (askHigh[i] != undefined && askHigh[i] !== 0) {
                    ahr.push([data[i][0], askHigh[i], askLast[i]]);
                } else {
                    ahr.push([data[i][0], askHigh[i], askHigh[i]]);
                }
            }
            if (bidLast[i] != undefined && bidLast[i] !== 0) {
                bll.push([data[i][0], bidLast[i]]);
                if (bidLow[i] != undefined && bidLow[i] !== 0) {
                    blr.push([data[i][0], bidLast[i], bidLow[i]]);
                } else {
                    blr.push([data[i][0], bidLast[i], bidLast[i]]);
                }
            }
        }

        //var ignoreZerosAndMerge = function (d1, s1, s2) {
        //    var retval = [],
        //        i,
        //        count = 0;
        //    if (s2) {
        //        for (i = 0; i < d1.length; i++) {
        //            if (s1[i] != undefined && s2[i] != undefined && (s1[i] !== 0 && s2[i] !== 0)) {
        //                retval[count] = [d1[i][0], s1[i], s2[i]];
        //                count++;
        //            }
        //        }
        //    } else {
        //        for (i = 0; i < d1.length; i++) {
        //            if (s1[i] != undefined && s1[i] !== 0) {
        //                retval[count] = [d1[i][0], s1[i]];
        //                count++;
        //            }
        //        }
        //    }
        //    return retval;
        //};
        //var ahl = ignoreZerosAndMerge(data, askLast),
        //    ahr = ignoreZerosAndMerge(data, askHigh, askLast),
        //    bll = ignoreZerosAndMerge(data, bidLast),
        //    blr = ignoreZerosAndMerge(data, bidLast, bidLow);

        infChart.util.forEach(this.series, function (i, series) {
            switch (series.options.infIndSubType) {
                case 'AHL' :
                    series.setData(ahl, false, false, false);
                    break;
                case 'AHR' :
                    series.setData(ahr, false, false, false);
                    break;
                case 'BLL' :
                    series.setData(bll, false, false, false);
                    break;
                case 'BLR' :
                    series.setData(blr, false, false, false);
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

infChart.BidAskHistoryIndicator.prototype.removeSeries = function (seriesId) {
    var index = -1;
    infChart.util.forEach(this.series, function (i, ind) {
        if (seriesId === ind.options.id) {
            index = i;
            ind.remove(false);
        }
    });

    this.series.splice(index, 1);

    if (this.series.length === 0) {
        this.destroy();
    }

};

//endregion **************************************Bid/Ask History Indicator******************************************
