//region **************************************Fast Stochastic Oscillator(STOF) Indicator******************************************

/***
 * Constructor for Fast Stochastic (STOF) Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
 infChart.FastStochasticOscillatorIndicator = function (id, chartId, type, chartInstance) {

    infChart.Indicator.apply(this, arguments);

    this.axisId = "#STOF_" + id;
    this.params.lowerLevel = 0.3;
    this.params.upperLevel = 0.7;
    this.params.kperiod = 14;
    this.params.dperiod = 3;
    this.titleParams = ["kperiod", "dperiod", "upperLevel", "lowerLevel"];
    this.titleParamsDec = [0, 0, 1, 1];

    var colors = infChart.util.getSeriesColors();
    var upColor = infChart.util.getDefaultUpColor();
    var downColor = infChart.util.getDefaultDownColor();

    this.addAxis({
        id: this.axisId,
        min: 0,
        max: 1,
        floor: 0,
        ceiling: 1,
        startOnTick: false,
        endOnTick: false
    });


    this.series[2] = chartInstance.addSeries({
        "id": id + "_STOF3",
        infIndType: "STOF",
        infIndSubType: "STOF3",
        /* data: [],*/
        infType: "indicator",
        "yAxis": this.axisId,
        "name": "Upper",
        "color": upColor,
        "lineColor": upColor,
        "type": "arearange",
        hideLegend: true,
        infRecal: true,
        hideToolTip: true,
        showInLegend: false,
        enableMouseTracking: true,
        states: {
            hover: {
                enabled: false
            }
        }
    }, false);

    this.series[3] = chartInstance.addSeries({
        "id": id + "_STOF4",
        infIndType: "STOF",
        infIndSubType: "STOF4",
        /* data: [],*/
        infType: "indicator",
        "yAxis": this.axisId,
        "name": "Lower",
        "color": downColor,
        "lineColor": downColor,
        "type": "arearange",
        hideLegend: true,
        infRecal: true,
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
        infIndType: "STOF",
        infIndSubType: "STOF",
        name: "STOF",
        /* data: [],*/
        infType: "indicator",
        yAxis: this.axisId,
        showInLegend: false,
        color: colors[5],
        lineColor: colors[5],
        enableMouseTracking: true,
        states: {
            hover: {
                enabled: false
            }
        }
    }, false);

    this.series[1] = chartInstance.addSeries({
        "id": id + "_STOF2",
        infIndType: "STOF",
        infIndSubType: "STOF2",
        /* data: [],*/
        infType: "indicator",
        "yAxis": this.axisId,
        showInLegend: false,
        "name": "STOF2",
        "color": colors[1],
        "lineColor": colors[1],
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

infChart.util.extend(infChart.Indicator, infChart.FastStochasticOscillatorIndicator);

infChart.FastStochasticOscillatorIndicator.prototype.calculate = function (ohlc, data, redraw, seriesId) {
    var high = ohlc.h,
        low = ohlc.l,
        close = ohlc.c;
    if (data && data.length > 0) {
        var chart = this.chart;
        if (!seriesId) {
            var stof = this.getSeries(high, low, close, 1, infChart.indicatorDefaults.ULCLOSEPRICE, infChart.indicatorDefaults.EXPONENTIALMOVINGAVERAGE, this.params.kperiod, this.params.dperiod);
            var stof2 = this.getSeries(high, low, close, 2, infChart.indicatorDefaults.ULCLOSEPRICE, infChart.indicatorDefaults.EXPONENTIALMOVINGAVERAGE, this.params.kperiod, this.params.dperiod);
            var _stof = this.merge(data, stof);
            var _stof2 = this.merge(data, stof2);
            var _stofSeries = chart.get(this.id);
            var _sto2fSeries = chart.get(this.id + '_STOF2');
            _stofSeries && _stofSeries.setData(_stof, false, false, false);
            _sto2fSeries && _sto2fSeries.setData(_stof2, false, false, false);
            //chart.get(this.id + '_STOF4').setData(this.getBand(data, this.params.lowerLevel, 0), false);
        }
        if (!seriesId || seriesId == (this.id + '_STOF3')) {
            var series = chart.get(this.id + '_STOF3');
            if (series.options.type === "line") {
                series.setData(this.getBand(data, series.options.type, this.params.upperLevel, this.params.upperLevel), redraw, false, false);
            } else {
                series.setData(this.getBand(data, series.options.type, 1, this.params.upperLevel), redraw, false, false);
            }
        }
        if (!seriesId || seriesId == (this.id + '_STOF4')) {
            var series4 = chart.get(this.id + '_STOF4');
            if (series4.options.type === "line") {
                series4.setData(this.getBand(data, series4.options.type, this.params.lowerLevel, this.params.lowerLevel), redraw, false, false);
            } else {
                series4.setData(this.getBand(data, series4.options.type, this.params.lowerLevel, 0), redraw, false, false);
            }
        }
    }


};

infChart.FastStochasticOscillatorIndicator.prototype.getSeries = function (hts, lts, cts, grn, ul, ma, nocp1, nocp2) {
    return this.pk(hts, lts, cts, undefined, grn, ul, ma, nocp1, nocp2)
};

infChart.FastStochasticOscillatorIndicator.prototype.removeSeries = function (seriesId, isPropertyChange) {
    this.hideIndicator(seriesId);
    infChart.Indicator.prototype.removeSeries.apply(this, arguments);
};

/**
 * hide indicator
 * @param {string} seriesId - series id
 */
infChart.FastStochasticOscillatorIndicator.prototype.hideIndicator = function (seriesId) {
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
infChart.FastStochasticOscillatorIndicator.prototype.showIndicator = function (seriesId) {
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
infChart.FastStochasticOscillatorIndicator.prototype._getRelevantSeries = function (seriesId) {
    let seriesList = {};

    let mainIndicator = this.series[0].name === "STOF" ? this.series[0] : undefined;
    let secondaryIndicator = this.series[1] && this.series[1].name === "STOF2" ? this.series[1] : this.series[0].name === "STOF2" ? this.series[0] : undefined;

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

//endregion **************************************Fast Stochastic Oscillator(STOF) Indicator******************************************
