window.infChart = window.infChart || {};
infChart.drawingUtils = infChart.drawingUtils || {};
infChart.drawingUtils.common = infChart.drawingUtils.common || {};

infChart.drawingUtils.common.indicatorUtils = {
    addRegressionChannel: function (chart, settingsContainer, options) {
        infChart.util.console.log("chart.drawingUtils => Regression Channel => ");
        var xAxis = chart.xAxis[0],
            yAxis = chart.yAxis[0],
            rangeOptions = infChart.drawingUtils.common.indicatorUtils.getRange(chart, xAxis.max, options.regPeriod);

        var regDrawing = {
            "name": options.name,
            "shape": "highLowRegressionChannel",
            "xValue": rangeOptions && rangeOptions.startVal,
            "yValue": yAxis.toValue(yAxis.top + yAxis.height),
            xValueEnd: rangeOptions && rangeOptions.endVal,
            yValueEnd: yAxis.toValue(yAxis.top),
            //"width": chart.plotWidth,
            "strokeWidth": 2,
            "dashStyle": "solid",
            "isDisplayOnly": false,
            "isIndicator": true,
            "drawingUpdateType": options.drawingUpdateType,
            "regPeriod": options.regPeriod,
            "indicatorId": options.indicatorId,
            "allowDragX": infChart.highLowRegressionChannelDrawing.prototype.getOptions(options),
            "drawingId": options.drawingId
        };
        return infChart.indicatorMgr.createIndicatorDrawing(chart, settingsContainer, regDrawing);
    },
    addHorizontalLine: function (chart, settingsContainer, options) {
        return infChart.indicatorMgr.createIndicatorDrawing(chart, settingsContainer, {
            "name": options.name,
            "shape": "horizontalRay",
            "xValue": options.xValue,
            "yValue": options.yValue,
            "strokeWidth": 1,
            "dashStyle": options.dashStyle,
            "isDisplayOnly": false,
            "isIndicator": true,
            "drawingUpdateType": options.drawingUpdateType,
            "drawingType": infChart.constants.drawingTypes.indicator,
            "indicatorId": options.indicatorId,
            "drawingId": options.drawingId,
            "subType": "shape",
            allowDragX: false,
            allowDragY: false
        });
    },
    addRectangle: function (chart, settingsContainer, options) {
        return infChart.indicatorMgr.createIndicatorDrawing(chart, settingsContainer, {
            "name": options.name,
            "shape": "rectangle",
            "xValue": options.xValue,
            "yValue": options.yValue,
            "xValueEnd": options.xValueEnd,
            "yValueEnd": options.yValueEnd,
            "strokeWidth": 0,
            // "dashStyle": "solid",
            "isDisplayOnly": true,
            "isIndicator": true,
            "drawingUpdateType": options.drawingUpdateType,
            "drawingType": infChart.constants.drawingTypes.indicator,
            "indicatorId": options.indicatorId,
            "drawingId": options.drawingId,
            "subType": "shape",
            allowDragX: false,
            allowDragY: false,
            fillColor: options.fillColor,
            borderColor: options.borderColor
        });
    },
    /**
     * Add a Harmonic pattern drawing tool for the given configuration
     * @param {infChart.StockChart} chart associated chart
     * @param {Element} settingsContainer settings container element
     * @param {object} options options to draw the tool
     * @returns {infChart.Drawing} new drawing
     */
    addHarmonicPattern: function (chart, settingsContainer, options) {
        infChart.util.console.debug("chart.indicator.drawingUtils => Harmonic Pattern");
        var xAxis = chart.xAxis[0],
            yAxis = chart.yAxis[0],
            data = options.data;
        var intermediatePoints = [];
        intermediatePoints.push({xValue: data.atime, yValue: data.aprice});
        intermediatePoints.push({xValue: data.btime, yValue: data.bprice});
        intermediatePoints.push({xValue: data.ctime, yValue: data.cprice});

        var regDrawing = {
            "name": options.name,
            "shape": "harmonicPattern",
            "xValue": data.xtime,
            "yValue": data.xprice,
            "xValueEnd": data.dtime,
            "yValueEnd": data.dprice,
            //"width": chart.plotWidth,
            "strokeWidth": 2,
            "dashStyle": "solid",
            "isDisplayOnly": false,
            "isIndicator": true,
            "indicatorId": options.indicatorId,
            "allowDragX": false,
            "drawingId": options.drawingId,
            "intermediatePoints": intermediatePoints,
            "borderColor": options.borderColor
        };

        return infChart.indicatorMgr.createIndicatorDrawing(chart, settingsContainer, regDrawing);
    },
    updateIndicatorOptions: function (drawingObject, optionKeys) {
        var ann = drawingObject.annotation,
            annOptions = ann && ann.options,
            ind = annOptions && infChart.indicatorMgr.getIndicatorById(drawingObject.stockChartId, annOptions.indicatorId),
            options = {};

        optionKeys = optionKeys || ["drawingUpdateType", "regPeriod"];

        optionKeys.forEach(function (val) {
            options[val] = annOptions[val];
        });

        ind && ind.updateOptions(options, false);
    },
    getRange: function (chart, endVal, regPeriod) {
        var mainSeries = chart && chart.series[0],
            data = mainSeries && mainSeries.options.data,
            length = data && data.length,
            count = 0,
            periodEndIdx;

        for (var i = length; i >= 0; i--) {
            if (data[i] && data[i][0] <= endVal) {
                periodEndIdx = i;
                break;
            }
        }
        if (periodEndIdx != undefined) {
            return {
                startVal: (data[periodEndIdx - regPeriod] && data[periodEndIdx - regPeriod][0]) || data[0][0],
                endVal: endVal,
                periodEndIdx: periodEndIdx
            }
        }

    }
};