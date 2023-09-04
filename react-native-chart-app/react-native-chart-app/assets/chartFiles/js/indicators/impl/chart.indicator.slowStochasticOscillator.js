//region ************************************** Slow Stochastic Oscillator(STOS) Indicator******************************************

/***
 * Constructor for Ultimate Oscillator (UO)  Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
 infChart.SlowStochasticOscillatorIndicator = function (id, chartId, type, chartInstance) {

    infChart.Indicator.apply(this, arguments);

    this.params.upperLevel = 0.8;
    this.params.lowerLevel = 0.2;

    this.params.kperiod = 14;
    this.params.dperiod = 3;
    this.titleParams = ["kperiod", "dperiod", "upperLevel", "lowerLevel"];
    this.titleParamsDec = [0, 0, 1, 1];
    this.axisId = "#STOS_" + id;

    var colors = infChart.util.getSeriesColors();
    var upColor = infChart.util.getDefaultUpColor();
    var downColor = infChart.util.getDefaultDownColor();

    this.addAxis({
        id: this.axisId,
        min: 0,
        max: 1,
        "plotLines": [{
            "value": 0.5,
            "color": "#888888",
            "dashStyle": "shortdash",
            "width": 1,
            "zIndex": 3
        }],
        startOnTick: false,
        endOnTick: false
    });


    this.series[2] = chartInstance.addSeries({
        "id": id + "_STOS3",
        infIndType: "STOS",
        infIndSubType: "STOS3",
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

    this.series[3] = chartInstance.addSeries({
        "id": id + "_STOS4",
        infIndType: "STOS",
        infIndSubType: "STOS4",
        /* data: [],*/
        infType: "indicator",
        "yAxis": this.axisId,
        "name": "Lower",
        "color": downColor,
        "lineColor": downColor,
        "type": "arearange",
        hideLegend: true,
        hideToolTip: true,
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
        infIndType: "STOS",
        infIndSubType: "STOS",
        name: "STOS",
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
    }, false);

    this.series[1] = chartInstance.addSeries({
        "id": id + "_STOS2",
        infIndType: "STOS",
        infIndSubType: "STOS2",
        /* data: [],*/
        infType: "indicator",
        "yAxis": this.axisId,
        showInLegend: false,
        "name": "STOS2",
        "color": colors[2],
        "lineColor": colors[2],
        enableMouseTracking: true,
        states: {
            hover: {
                enabled: false
            }
        }
    }, true);

    this.style[this.series[2].options.id] = ["line", "arearange"];
    this.style[this.series[3].options.id] = ["line", "arearange"];

};

infChart.util.extend(infChart.Indicator, infChart.SlowStochasticOscillatorIndicator);

infChart.SlowStochasticOscillatorIndicator.prototype.calculate = function (ohlc, data, redraw, seriesId) {
    var high = ohlc.h,
        low = ohlc.l,
        close = ohlc.c;
    if (data && data.length > 0) {
        var chart = this.chart;
        if (!seriesId) {
            var stos = this.getSeries(high, low, close, 0, infChart.indicatorDefaults.ULCLOSEPRICE, infChart.indicatorDefaults.EXPONENTIALMOVINGAVERAGE, this.params.kperiod, this.params.dperiod, 3);
            var stos2 = this.getSeries(high, low, close, 1, infChart.indicatorDefaults.ULCLOSEPRICE, infChart.indicatorDefaults.EXPONENTIALMOVINGAVERAGE, this.params.kperiod, this.params.dperiod, 3);
            var _stos = this.merge(data, stos);
            var _stos2 = this.merge(data, stos2);
            var _stosSeries = chart.get(this.id);
            var _stos2Series = chart.get(this.id + '_STOS2');

            _stosSeries && _stosSeries.setData(_stos, false, false, false);
            _stos2Series && _stos2Series.setData(_stos2, redraw, false, false);
        }
        if (!seriesId || seriesId == (this.id + '_STOS3')) {
            var series = chart.get(this.id + '_STOS3');
            if (series.options.type === "line") {
                series.setData(this.getBand(data, series.options.type, this.params.upperLevel, this.params.upperLevel), redraw, false, false);
            } else {
                series.setData(this.getBand(data, series.options.type, 1, this.params.upperLevel), redraw, false, false);
            }
        }
        if (!seriesId || seriesId == (this.id + '_STOS4')) {
            var series4 = chart.get(this.id + '_STOS4');
            if (series4.options.type === "line") {
                series4.setData(this.getBand(data, series4.options.type, this.params.lowerLevel, this.params.lowerLevel), redraw, false, false);
            } else {
                series4.setData(this.getBand(data, series4.options.type, this.params.lowerLevel, 0), redraw, false, false);
            }
        }
    }
};

infChart.SlowStochasticOscillatorIndicator.prototype.getSeries = function (hts, lts, cts, grn, ul, ma, nocp1, nocp2, nocp3) {
    var pd = this.pk(hts, lts, cts, undefined, 2, ul, ma, nocp1, nocp2);
    if (grn == 1)
        return pd;
    return this.movmean(pd, ma, nocp3);
};

infChart.SlowStochasticOscillatorIndicator.prototype.removeSeries = function (seriesId, isPropertyChange) {
    this.hideIndicator(seriesId);
    infChart.Indicator.prototype.removeSeries.apply(this, arguments);
};

/**
 * hide indicator
 * @param {string} seriesId - series id
 */
infChart.SlowStochasticOscillatorIndicator.prototype.hideIndicator = function (seriesId) {
    let seriesList = this._getRelevantSeries(seriesId);

    if (seriesList.remainingSeries && seriesList.remainingSeries.visible) {
        seriesList.selectedSeries.hide();
    } else {
        infChart.util.forEach(this.series, function (i, series) {
            series.hide();
        });
    }

    infChart.manager.getChart(this.chartId)._onPropertyChange("indicators");
};

/**
 * show indicator
 * @param {string} seriesId - series id
 */
infChart.SlowStochasticOscillatorIndicator.prototype.showIndicator = function (seriesId) {
    let seriesList = this._getRelevantSeries(seriesId);

    if (seriesList.remainingSeries && seriesList.remainingSeries.visible) {
        seriesList.selectedSeries.show();
    } else {
        infChart.util.forEach(this.series, function (i, series) {
            if (!seriesList.remainingSeries || seriesList.remainingSeries.options.id !== series.options.id) {
                series.show();
            }
        });
    }

    infChart.manager.getChart(this.chartId)._onPropertyChange("indicators");
};

/**
 * get relevant series
 * @param seriesId
 * @private
 */
infChart.SlowStochasticOscillatorIndicator.prototype._getRelevantSeries = function (seriesId) {
    let seriesList = {};

    let mainIndicator = this.series[0].name === "STOS" ? this.series[0] : undefined;
    let secondaryIndicator = this.series[1] && this.series[1].name === "STOS2" ? this.series[1] : this.series[0].name === "STOS2" ? this.series[0] : undefined;

    if (mainIndicator && mainIndicator.userOptions.id === seriesId) {
        seriesList = {
            selectedSeries: mainIndicator,
            remainingSeries: secondaryIndicator
        }
    } else {
        seriesList = {
            selectedSeries: secondaryIndicator,
            remainingSeries: mainIndicator
        }
    }

    return seriesList;
};


//endregion **************************************Slow Stochastic Oscillator(STOS) Indicator******************************************