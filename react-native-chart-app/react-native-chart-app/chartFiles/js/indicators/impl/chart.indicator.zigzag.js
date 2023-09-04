//region ************************************** Zig Zag Indicator ******************************************

/***
 * Constructor for Zig Zag  Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
infChart.ZigZagIndicator = function (id, chartId, type, chartInstance) {

    infChart.Indicator.apply(this, arguments);

    this.params.backstep = 3;
    this.params.depth = 12;
    this.params.deviation = 5;
    this.params.showReversal = true;
    this.params.showVolume = true;
    this.params.showReversalPriceChange = true;
    this.params.showReversalPrecentage = true;

    this.titleParams = ["backstep", "depth", "deviation"];
    this.checkOptions = ["showReversal", "showVolume", "showReversalPriceChange", "showReversalPrecentage"];
    this.candleCountUsedtoCalculateSwingPoint = 3;

    var color = infChart.util.getNextSeriesColor(chartId);

    this.series[0] = chartInstance.addSeries({
        id: id,
        name: "ZigZag",
        infIndType: "ZigZag",
        infIndSubType: "ZigZag",
        type: "line",
        infType: "indicator",
        yAxis: "#0",
        color: color,
        lineColor: color,
        dataLabels: {
            enabled: false,
        }
    }, false);
    this.series[1] = chartInstance.addSeries({
        id: id + '_zigZaglabel',
        name: "ZigZagLabel",
        infIndType: "ZZLabel",
        infIndSubType: "ZigZagLabel",
        lineWidth: 0,
        marker: {
            enabled: false
        },
        infType: "indicator",
        yAxis: "#0",
        hideLegend: true,
        showInLegend: false,
        hideToolTip: true,
        infAvoidToolTipSel: true,
        onSeries: this.series[0].options.id,
        color: color,
        states: {
            hover: false
        },
        dataLabels: {
            enabled: true,
            allowOverlap: true,
            style: {
                textOutline: 'none',
                fontWeight: '400'
            }
        }
    }, true);

    this.style[this.series[0].options.id] = ["line"];
};

infChart.util.extend(infChart.Indicator, infChart.ZigZagIndicator);

infChart.ZigZagIndicator.prototype.calculate = function (ohlc, data, redraw) {
    let high = ohlc.h;
    let low = ohlc.l;
    let zigzagSeries = {};
    if (data && data.length > 0) {
        let chart = this.chart;
        zigzagSeries = this.getSeries(high, low, data);
        infChart.util.forEach(this.series, function (i, series) {
            switch (series.options.infIndSubType) {
                case 'ZigZag':
                    series.setData(zigzagSeries.zzSeries, true, false, false); //  redraw since signal is depend on this series
                    break;
                case 'ZigZagLabel':
                    series.setData(zigzagSeries.labelSeries, false, false, false);
                    break;
            }
        });
        if (redraw) {
            this.chart.redraw();
        }
    }
};

infChart.ZigZagIndicator.prototype.getSeries = function (high, low, data) {
    if (this._validateUserInputs()) {
        return {
            zzSeries: [],
            labelSeries: []
        };
    }
    let d = this.params.deviation / 100;
    let lowDeviation = 1 - d;
    let highDeviation = 1 + d;
    let dataLength = data.length;
    let i;
    let isSwingHigh = true;
    let zzSeries = [];
    let tempZZSeries = [];
    let labelSeries = [];
    let swingPoint;
    let isFindSwingPoint = false;
    let isFirstPointSwingHigh = false;
    let isSwingPointChanged = false;
    let prevLastPoint;
    let firstHighPoint = high[dataLength - 1];
    let firstLowPoint = low[dataLength - 1];

    //get last swing high or swing low point
    for (i = dataLength - 2; i >= 0; i--) {
        if (high[i] >= firstHighPoint * highDeviation && this._isSwingHighPoint(high, i)) {
            swingPoint = [data[i][0], high[i], i, true];
            isSwingHigh = true;
            isFirstPointSwingHigh = true;
            break;
        } else if (low[i] <= firstLowPoint * lowDeviation && this._isSwingLowPoint(low, i)) {
            swingPoint = [data[i][0], low[i], i, false];
            isSwingHigh = false;
            break;
        }
    }

    tempZZSeries.push([data[dataLength - 1][0], isFirstPointSwingHigh ? low[dataLength - 1] : high[dataLength - 1], dataLength - 1, !isFirstPointSwingHigh]);
    tempZZSeries.push(swingPoint);

    //get other swing points
    for (i = i - 1; i >= 0; i--) {
        if (isSwingHigh) {
            if (low[i] <= swingPoint[1] * lowDeviation && this._isSwingLowPoint(low, i) && 
                this._isValidPointWithStepAndDepth(swingPoint, prevLastPoint, i)) {
                isFindSwingPoint = true;
                swingPoint = [data[i][0], low[i], i, !isSwingHigh];
                isSwingHigh = false;
            } else if (high[i] >= swingPoint[1] && this._isSwingHighPoint(high, i)) {
                swingPoint = [data[i][0], high[i], i, isSwingHigh];
                isSwingPointChanged = true;
            } else if (tempZZSeries.length > 4 && low[i] <= tempZZSeries[tempZZSeries.length - 2][1] && this._isSwingLowPoint(low, i)) {
                tempZZSeries = tempZZSeries.slice(0, -2);
                swingPoint = [data[i][0], low[i], i, !isSwingHigh];
                isSwingHigh = false;
                isFindSwingPoint = true;
            }
        } else {
            if (high[i] >= swingPoint[1] * highDeviation && this._isSwingHighPoint(high, i) && 
                this._isValidPointWithStepAndDepth(swingPoint, prevLastPoint, i)) {
                isFindSwingPoint = true;
                swingPoint = [data[i][0], high[i], i, !isSwingHigh];
                isSwingHigh = true;
            } else if (low[i] <= swingPoint[1] && this._isSwingLowPoint(low, i)) {
                swingPoint = [data[i][0], low[i], i, isSwingHigh];
                isSwingPointChanged = true;
            } else if (tempZZSeries.length > 4 && high[i] >= tempZZSeries[tempZZSeries.length - 2][1] && this._isSwingHighPoint(high, i)) {
                tempZZSeries = tempZZSeries.slice(0, -2);
                swingPoint = [data[i][0], high[i], i, !isSwingHigh];
                isSwingHigh = true;
                isFindSwingPoint = true;
            }
        }

        if (isFindSwingPoint) {
            prevLastPoint = tempZZSeries[tempZZSeries.length - 1];
            tempZZSeries.push(swingPoint);
            isFindSwingPoint = false;
        }

        //no need to change last 2 points - first zz point and main series last point
        if (isSwingPointChanged) { //&& tempZZSeries.length > 2
            tempZZSeries.pop();
            tempZZSeries.push(swingPoint);
            isSwingPointChanged = false;
        }
    }

    tempZZSeries = tempZZSeries.reverse();
    let series = this._getZZSeriesAndLabelSeries(tempZZSeries, data);
    zzSeries = series.zzSeries;
    labelSeries = series.labelSeries;
    return {
        zzSeries: zzSeries,
        labelSeries: labelSeries
    };
};

infChart.ZigZagIndicator.prototype._isSwingHighPoint = function (high, index, candleCount) {
    let candles = candleCount ? candleCount : this.candleCountUsedtoCalculateSwingPoint;
    let point = high[index];
    let point_1 = high[index + 1];
    let point_prv_1 = high[index - 1];
    let isSwingHighPoint = false;
    if (candles === 3) {
        isSwingHighPoint = point_1 && point_1 <= point && point_prv_1 && point_prv_1 <= point;
    } else {
        let point_2 = high[index + 2];
        let point_prv_2 = high[index - 2];
        isSwingHighPoint = point_1 && point_1 <= point && point_prv_1 && point_prv_1 <= point &&
            point_2 && point_2 <= point_1 && point_prv_2 && point_prv_2 <= point_prv_1;
    }
    return isSwingHighPoint;
};

infChart.ZigZagIndicator.prototype._isSwingLowPoint = function (low, index, candleCount) {
    let candles = candleCount ? candleCount : this.candleCountUsedtoCalculateSwingPoint;
    let point = low[index];
    let point_1 = low[index + 1];
    let point_prv_1 = low[index - 1];
    let isSwingLowPoint = false;
    if (candles === 3) {
        isSwingLowPoint = point_1 && point_1 >= point && point_prv_1 && point_prv_1 >= point;
    } else {
        let point_2 = low[index + 2];
        let point_prv_2 = low[index - 2];
        isSwingLowPoint = point_1 && point_1 >= point && point_prv_1 && point_prv_1 >= point &&
            point_2 && point_2 >= point_1 && point_prv_2 && point_prv_2 >= point_prv_1;
    }
    return isSwingLowPoint;
};

infChart.ZigZagIndicator.prototype._isValidPointWithStepAndDepth = function (lastPoint, prevlastPoint, index) {
    let isValid = false;
    if (prevlastPoint) {
        isValid = lastPoint[2] - index >= this.params.backstep && prevlastPoint[2] - index >= this.params.depth;
    } else {
        isValid = lastPoint[2] - index >= this.params.backstep;
    }
    return isValid;
};

infChart.ZigZagIndicator.prototype._validateUserInputs = function () {
    let isNotValid = false;
    let deviation = parseFloat(this.params.deviation);
    let backstep = parseFloat(this.params.backstep);
    let depth = parseFloat(this.params.depth);
    if (isNaN(deviation) || isNaN(backstep) || isNaN(depth)) {
        isNotValid = true;
    }
    if (!isNotValid && backstep > depth) {
        isNotValid = true;
    }
    return isNotValid;
};

infChart.ZigZagIndicator.prototype._getZZSeriesAndLabelSeries = function (zzSeries, data) {
    let fullZigzagSeries = [];
    let labelSeries = [];

    for (let i = 0; i < zzSeries.length; i++) { 
        let preX = i > 0 ? zzSeries[i - 1][0] : undefined;
        let preY = i > 0 ? zzSeries[i - 1][1] : undefined;
        labelSeries.push(this._getPointWithDataLabel(zzSeries[i][0], zzSeries[i][1], zzSeries[i][3], preX, preY));
        fullZigzagSeries.push([zzSeries[i][0], zzSeries[i][1]]);
        if (zzSeries[i + 1]) {
            let startIndex = zzSeries[i][2];
            let endIndex = zzSeries[i + 1][2];
            let k = endIndex - startIndex;
            let m = (zzSeries[i + 1][1] - zzSeries[i][1]) / k;
            let startY = zzSeries[i][1];
            for (let j = startIndex + 1; j < endIndex; j++) {
                let y = startY + m;
                fullZigzagSeries.push([data[j][0], y]);
                startY = y;
            }
        }
    }
    return {
        zzSeries: fullZigzagSeries,
        labelSeries: labelSeries
    };
};

infChart.ZigZagIndicator.prototype._getPointWithDataLabel = function (x, y, isHigh, preX, preY) {
    let point = {
        x: x,
        y: y,
        dataLabels: {
            x: 0,
            y: isHigh ? -5 : 50,
            format: this._labelFormatter(x, y, preX, preY)
        }
    }
    return point;
};

infChart.ZigZagIndicator.prototype._labelFormatter = function (x, y, preX, preY) {
    let stockChart = infChart.manager.getChart(this.chartId);

    let formattedPrevPointDiff = 0;
    let prevPointDiffPrecentage = 0;
    let formattedYvalue = 0;
    let formattedVolume = '--';
    let formattedLabel = '';
    let prevY = preY ? preY : y;

    // let actualIndex = chart.getMainSeries().xData.indexOf(x);
    // let actualPevIndex = preX ? chart.getMainSeries().xData.indexOf(preX) : 0;
    let actualIndex = this._getActualIndex(stockChart, x);
    let actualPevIndex = preX ? this._getActualIndex(stockChart, preX) : 0;

    let prevPointDiff = Math.abs(y - prevY);
    formattedPrevPointDiff = stockChart.formatValue(prevPointDiff, undefined, undefined, undefined, undefined, 2);
    formattedYvalue = stockChart.formatValue(y, undefined, undefined, undefined, undefined, 2);
    prevPointDiffPrecentage = ((y - prevY) / prevY * 100).toFixed(2);
    formattedVolume = stockChart.formatVolume(this._getCumulativeVolume(actualPevIndex, actualIndex));

    formattedLabel = (this.params.showReversal ? ('P ' + formattedYvalue + '<br>') : '') +
        (this.params.showVolume ? ('V ' + formattedVolume + '<br>') : '') +
        (this.params.showReversalPriceChange ? 'RPC ' + formattedPrevPointDiff + (this.params.showReversalPrecentage ? ' (' + prevPointDiffPrecentage + '%)' : '') : '');

    return formattedLabel;
};

infChart.ZigZagIndicator.prototype._getCumulativeVolume = function (startIndex, endIndex) {
    let chart = infChart.manager.getChart(this.chartId);
    let cumulativeVolume = 0;
    let i = startIndex === 0 ? 0 : startIndex;
    let volumeData = chart.processedData.ohlcv.v;
    for (i; i <= endIndex; i++) {
        cumulativeVolume += volumeData[i];
    }
    return cumulativeVolume;
};

infChart.ZigZagIndicator.prototype._getActualIndex = function (chart, xValue) {
    return chart.processedData.data.findIndex(function(element) {
        return element[0] === xValue;
    });
};

//endregion ************************************** Zig Zag Indicator ******************************************