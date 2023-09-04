//region ************************************** Spread (SPREAD) Indicator******************************************

/***
 * Constructor for Spread (SPREAD)  Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
 infChart.SpreadIndicator = function (id, chartId, type, chartInstance) {

    var _self = this;
    infChart.Indicator.apply(this, arguments);

    this.axisId = "#SPREAD_" + id;
    this.heightPercent = 800;
    this.isDynamic = true;

    var chart = infChart.manager.getChart(chartId);

    this.addAxis({
        "id": this.axisId,
        "startOnTick": false,
        "endOnTick": false,
        "labels": {
            formatter: function (labelObj) {
                labelObj = labelObj || this;
                if (labelObj && labelObj.value != undefined) {
                    var value = labelObj.value;
                    return value + '%'
                }
            }
        }
    });

    this.seriesMap = {};

    this.removeEventIdx = chart.registerForEvents("onRemoveCompareSymbol", function (symbol) {
        // remove series
        var compareSeriesId = chart.getCompareSeriesId(symbol),
            indId = id + "_SPREAD" + compareSeriesId;
        if (_self.seriesMap[compareSeriesId]) {
            chart.removeSeries(indId, false);
            delete _self.seriesMap[compareSeriesId];
        }

    });

    this.addEventIdx = chart.registerForEvents("onAddCompareSymbol", function (symbol) {
        _self._addCompareSeries(symbol);
    });

    this.baseSetEventIdx = chart.registerForEvents("setSymbol", function (symbol) {
        if (JSON.stringify(this.seriesMap) != JSON.stringify({})) {
            _self.updateTitle();
        }
    });

};

infChart.util.extend(infChart.Indicator, infChart.SpreadIndicator);

infChart.SpreadIndicator.prototype.getRequiredDataTypes = function () {
    return ['base', 'compare'];
};

infChart.SpreadIndicator.prototype.calculate = function (ohlc, data, redraw, seriesId, allData, extremes) {
    var _self = this,
        chartObj = infChart.manager.getChart(this.chartId),
        doCalculate = true;

    if (extremes) {
        doCalculate = !_self.lastExtremes || !(_self.lastExtremes.interval == chartObj.interval && _self.lastExtremes.extremes.min == extremes.min);
    }

    if (doCalculate && data && data.length > 0 && allData && allData.compare) {
        _self.baseData = data;


        var chart = chartObj && chartObj.chart;
        var compareData = allData.compare && allData.compare.data,
            chartExtremes = chartObj.getRange(),
            seriesData;

        extremes = !extremes ? chartExtremes : extremes;

        if (extremes.min == null && (extremes.userMin || extremes.dataMin)) {
            extremes.min = extremes.userMin || extremes.dataMin;
        }

        _self.lastExtremes = {interval: chartObj.interval, extremes: extremes};
        seriesData = this.getSeries(data, compareData, extremes);

        for (var compSeriesId in seriesData) {
            if (seriesData.hasOwnProperty(compSeriesId)) {
                if (!_self.seriesMap[compSeriesId]) {
                    var symbolObj = chartObj.getCompareSymbolFromSeriesId(compSeriesId);
                    _self._addCompareSeries(symbolObj);
                }
                var series = _self.seriesMap[compSeriesId],
                    seriesDataTemp = seriesData[compSeriesId];
                series.setData(seriesDataTemp, false, false, false);
            }
        }
        // chart.get(this.id).setData(_rsl, redraw, false, false);

    }
    if (redraw) {
        chart.redraw();
    }
};

infChart.SpreadIndicator.prototype.getSeries = function (base, compareData, extremes) {
    var ts, retVal1 = {},
        startIdx = extremes && this.getDataExtremesIndices(extremes, base) || 0;
    ts = this.percentageChange(base, 4, startIdx);

    for (var compSeriesId in compareData) {
        if (compareData.hasOwnProperty(compSeriesId)) {
            var seriesData = compareData[compSeriesId],
                compStarIdx = extremes && this.getDataExtremesIndices(extremes, seriesData) || 0,
                seriesChange = this.percentageChange(seriesData, 4, compStarIdx);
            retVal1[compSeriesId] = this._mergeUnevenSeries(base, ts, seriesData, seriesChange, 'substract');

        }
    }
    return retVal1;
};

infChart.SpreadIndicator.prototype._getSeriesName = function (symbol) {

    var _self = this,
        chart = infChart.manager.getChart(_self.chartId),
        mainSymbol = chart.symbol;

    return chart._getSymbolDisplayName(symbol) + " - " + chart._getSymbolDisplayName(mainSymbol);
};

infChart.SpreadIndicator.prototype._addCompareSeries = function (symbol) {
    // add series
    var _self = this,
        chart = infChart.manager.getChart(_self.chartId),
        hChart = this.chart;
    var compareSeriesId = chart.getCompareSeriesId(symbol),
        indId = _self.id + "_SPREAD" + compareSeriesId,
        compSeries = hChart && hChart.get(compareSeriesId),
        color = (compSeries && compSeries.color) || infChart.util.getNextSeriesColor(chartId);

    if (!_self.seriesMap[compareSeriesId]) {
        _self.seriesMap[compareSeriesId] = chart.chart.addSeries({
            id: indId,
            name: "SPREAD - " + chart._getSymbolDisplayName(symbol),
            infIndType: "SPREAD",
            infIndSubType: "SPREAD",
            type: "line",
            infType: "indicator",
            yAxis: _self.axisId,
            showInLegend: false,
            lineColor: color,
            color: color,
            infCompSymbol: symbol,
            //compare : "infCustom",
            hideClose: true/*,
             customModifyValue : function(value, point) {
             var series = this,
             compareValue = this.compareValue,
             infCompareStart = series.infCompareStart;

             if (value !== undefined && compareValue !== undefined && point) { // #2601, #5814

             value = 100 * ((value / compareValue) - 1);

             // record for tooltip etc.
             if (point) {
             point.change = value;
             }

             return value;
             }
             }*/

        }, true);
        _self.series.push(_self.seriesMap[compareSeriesId]);
        chart._plotter(_self);
    }
};

infChart.SpreadIndicator.prototype._mergeUnevenSeries = function (data, s1, compareData, s2, operation) {
    var i = 0, iLen = data && data.length, k = 0, kLen = s2 && s2.length,
        retVal = [];

    for (; i < iLen; i++) {
        for (; k < kLen && compareData[k] && data[i][0] >= compareData[k][0]; k++) {
            if (operation == 'substract') {
                if (s1[i] != null && s2[k] != null && s1[i] != undefined && s2[k] != undefined) {
                    retVal[i] = [data[i][0], s2[k] - s1[i]];
                }
            }
            else {
                retVal[i] = [data[i][0], s2[k]];
            }
        }

        if (!retVal[i]) {
            retVal[i] = [data[i][0], undefined];
        }
    }

    return retVal;
};

infChart.SpreadIndicator.prototype.getTitle = function (seriesId, isLegend) {

    var chart = this.chart, series = chart.get(seriesId);

    if (series) {
        return this._getSeriesName(series.options.infCompSymbol);
    }
    return 'SPREAD';
};

infChart.SpreadIndicator.prototype.getDataExtremesIndices = function (extremes, base) {
    var startIndexOnRange = infChart.util.binaryIndexOf(base, 0, extremes.min);
    startIndexOnRange = startIndexOnRange < 0 ? startIndexOnRange * -1 : startIndexOnRange;
    return startIndexOnRange;
};

infChart.SpreadIndicator.prototype.getTooltipValue = function (point) {
    var tooltipData;
    if (!point.series.hideToolTip) {
        var axis = this.getAxisId();
        var value = point.y;
        var chart = infChart.manager.getChart(this.chartId);
        var dp = (point.series.options.dp != undefined) ? point.series.options.dp : 3;

        tooltipData = {
            'raw': {'value': value, 'time': point.x},
            'formatted': {'value': chart.formatValue(value, dp), 'time': chart.getTooltipTime(point.x)},
            'label': this.getLabel(point.series.options.id, "indicatorShortDesc") + " | " + this._getSeriesName(point.series.options.infCompSymbol),
            'color': this.getTooltipColor(point.series)
        };
    }
    return tooltipData;
};

infChart.SpreadIndicator.prototype.destroy = function () {
    var chart = infChart.manager.getChart(this.chartId);
    chart.removeRegisteredEvent("onRemoveCompareSymbol", this.removeEventIdx);
    chart.removeRegisteredEvent("onAddCompareSymbol", this.addEventIdx);
    chart.removeRegisteredEvent("setSymbol", this.baseSetEventIdx);
    infChart.Indicator.prototype.destroy.apply(this, arguments);

};

//endregion ************************************** Spread (SPREAD)  Indicator******************************************
