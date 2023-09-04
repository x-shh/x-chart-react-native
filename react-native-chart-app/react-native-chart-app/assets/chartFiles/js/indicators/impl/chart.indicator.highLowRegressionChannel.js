//region **************************************  High Low Regression Channel (HLRegChannel) Indicator******************************************

/***
 * Constructor for High Low Regression Channel (HLRegChannel) Indicator
 * @param id
 * @param chartId
 * @constructor
 */
 infChart.HighLowRegressionChannelIndicator = function (id, chartId, type) {

    infChart.AdvancedIndicator.apply(this, arguments);

    var self = this;

    self.params.highPeriod = 3;
    self.params.lowPeriod = 3;
    self.params.emaDeviationH = 0;
    self.params.emaDeviationL = 0;
    self.params.avgPeriod = 3;
    self.params.regPeriod = 10;
    self.params.drawingUpdateType = "expandWithUpdate";

    self.titleParams = ["highPeriod", "lowPeriod", "avgPeriod", "emaDeviationH", "emaDeviationL"];

    self.selectionOptions = {drawingUpdateType: ["expandWithUpdate", "moveWithUpdate", "fixed"]};

    self.axisId = "#0";

    var chart = infChart.manager.getChart(chartId).chart;

    var drawingObject = infChart.drawingUtils.common.indicatorUtils.addRegressionChannel(chart, undefined,
        {
            'indicatorId': id,
            'drawingUpdateType': self.params.drawingUpdateType,
            'regPeriod': +self.params.regPeriod,
            'drawingId': id + '_regDrawing'
        });

    // drawingObject.openDrawingSettings = function () {
    //     self.loadSettingWindow.call(self, false, {'drawingId': drawingObject.drawingId});
    // };

    self.drawings[0] = drawingObject;

    self.series[0] = chart.addSeries({
        id: id,
        infIndType: "HLRegChannel",
        infIndSubType: "HLRegH",
        name: "Upper",
        type: "line",
        /*data: [],*/
        color: "#00aeff",
        lineColor: "#00aeff",
        infType: "indicator",
        yAxis: "#0",
        zIndex: 3,
        fillOpacity: 0.5,
        hideLegend: false,
        showInLegend: true,
        showInNavigator: false
    }, false);

    self.series[1] = chart.addSeries({
        id: id + '_HLRegA',
        infIndType: "HLRegChannel",
        infIndSubType: "HLRegA",
        name: "Mid",
        type: "line",
        /*data: [],*/
        color: "#ffffff",
        lineColor: "#ffffff",
        infType: "indicator",
        yAxis: "#0",
        zIndex: 3,
        fillOpacity: 0.5,
        hideLegend: true,
        showInLegend: false,
        showInNavigator: false
    }, false);

    self.series[2] = chart.addSeries({
        id: id + '_HLRegL',
        infIndType: "HLRegChannel",
        infIndSubType: "HLRegL",
        name: "Lower",
        type: "line",
        /*data: [],*/
        color: "#ff15af",
        lineColor: "#ff15af",
        infType: "indicator",
        yAxis: "#0",
        zIndex: 3,
        fillOpacity: 0.5,
        hideLegend: true,
        showInLegend: false,
        showInNavigator: false
    }, true);

};

infChart.util.extend(infChart.AdvancedIndicator, infChart.HighLowRegressionChannelIndicator);

infChart.HighLowRegressionChannelIndicator.prototype.calculate = function (ohlc, data, redraw) {
    var open = ohlc.o,
        high = ohlc.h,
        low = ohlc.l,
        close = ohlc.c;

    if (data && data.length > 0) {
        var calData = this.getSeries(open, high, low, close, infChart.indicatorDefaults.ARITHMETICMOVINGAVERAGE, infChart.indicatorDefaults.EXPONENTIALMOVINGAVERAGE,
            this.params.highPeriod, this.params.lowPeriod, this.params.avgPeriod, this.params.emaDeviationH, this.params.emaDeviationL);
        var _high = this.merge(data, calData.high),
            _low = this.merge(data, calData.low),
            _avg = this.merge(data, calData.avg);

        $.each(this.series, function (i, series) {
            switch (series.options.infIndSubType) {
                case 'HLRegH' :
                    series.setData(_high, false, false, false);
                    break;
                case 'HLRegA' :
                    series.setData(_avg, false, false, false);
                    break;
                case 'HLRegL' :
                    series.setData(_low, false, false, false);
                    break;
                default :
                    break;
            }
        });

        this.drawings[0].setOptions({
            calData: {high: _high, low: _low, avg: _avg},
            drawingUpdateType: this.params.drawingUpdateType,
            regPeriod: +this.params.regPeriod
        }, redraw);

        if (!this.series[0].visible && this.drawings[0]) {
            this.drawings[0].annotation.group.hide();
        }

        if (redraw) {
            var chart = infChart.manager.getChart(this.chartId).chart;
            chart.redraw();
        }
    }
};

infChart.HighLowRegressionChannelIndicator.prototype.getSeries = function (ots, hts, lts, cts, ma, md, highPeriod, lowPeriod, avgPeriod, delta1, delta2) {

    var avg = this.average(ots, hts, lts, cts),
        highRetval = this.movmean(hts, ma, highPeriod),
        lowRetVal = this.movmean(lts, ma, lowPeriod),
        avgRetVal = this.movmean(avg, ma, avgPeriod);


    if (delta1 || delta2) {

        delta1 = delta1 || 0;
        delta2 = delta2 || 0;

        var k,
            devHigh = this.movdev(highRetval, md, highPeriod),
            devLow = this.movdev(lowRetVal, md, lowPeriod);

        for (k = 0; k < highRetval.length; k++) {
            highRetval[k] = highRetval[k] + 2 * delta1 * devHigh[k];
            lowRetVal[k] = lowRetVal[k] - 2 * delta2 * devLow[k];
        }
    }

    return {high: highRetval, low: lowRetVal, avg: avgRetVal};
};

infChart.HighLowRegressionChannelIndicator.prototype.onPropertyChange = function (options) {

    this.drawings[0].setOptions({
        drawingUpdateType: this.params.drawingUpdateType,
        regPeriod: +this.params.regPeriod
    }, true);

    infChart.AdvancedIndicator.prototype.onPropertyChange.apply(this, arguments);
};

infChart.HighLowRegressionChannelIndicator.prototype.getContextMenuOptions = function (chartId, series, options) {
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
infChart.HighLowRegressionChannelIndicator.prototype.hideIndicator = function (seriesId) {
    this.drawings[0].annotation.group.hide();
    infChart.Indicator.prototype.hideIndicator.apply(this, [seriesId, true]);
};

/**
 * show indicator
 */
infChart.HighLowRegressionChannelIndicator.prototype.showIndicator = function (seriesId) {
    this.drawings[0].annotation.group.show();
    infChart.Indicator.prototype.showIndicator.apply(this, [seriesId, true]);
};

//endregion ************************************** High Low Regression Channel (HLRegC)  Indicator******************************************

