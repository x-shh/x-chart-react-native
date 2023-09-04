//region ************************************** Session / Time Breaks Indicator******************************************

/***
 * Constructor for Session Time Breaks Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
infChart.SessionTimeBreaksIndicator = function (id, chartId, type, chartInstance, config) {
    if (chartInstance) {
        var self = this;
        infChart.Indicator.apply(this, arguments);

        self.break = config.break;

        self.plotLines = [];
        self.plotLineValues = [];
        self.series.push(chartInstance.addSeries({
            id: id,
            name: "breaks",
            infIndType: type,
            infIndSubType: config.break,
            type: "plotrange",
            infType: "indicator",
            yAxis: "#0",
            showInLegend: false,
            hideLegend: false
        }, false));
    }
};

infChart.util.extend(infChart.Indicator, infChart.SessionTimeBreaksIndicator);

/**
 * Overwrite calculate method for days indicator
 * @private
 */
infChart.SessionTimeBreaksIndicator.prototype.calculate = function (ohlc, data, redraw) {
    var self = this;
    if (data && data.length > 0) {
        var xChart = infChart.manager.getChart(this.chartId);

        if (this.interval !== xChart.interval) {
            this.interval = xChart.interval;
            // Remove existing plot lines
            self.removePlotLines(true);
            self.plotLineValues = [];

            let startPoint = data[0][0];
            let endPoint = data[data.length - 1][0];

            if (self.break === "M" || self.break === "4M" || self.break === "Y") {
                let startDate = new Date(startPoint);
                startDate.setUTCMinutes(0);
                startDate.setUTCHours(0);
                startDate.setUTCDate(1);

                if (self.break === "Y" || self.break === "4M") {
                    startDate.setUTCMonth(0);
                }

                self._addIntervalDataForChangingValues(startDate, endPoint);
            } else {
                let mergedDataDurations = this._getMergedDataDurations(data, xChart.interval);
                let intervalData = self._getIntervalData(startPoint);
                startPoint = intervalData.startDate.getTime();

                let drawnBetweenMergedDuration = {};
                for (let i = startPoint; i < endPoint; i+= intervalData.plotInterval) {
                    if (self.break === "W" || !self._isPointBetweenMergedArea(i, mergedDataDurations, drawnBetweenMergedDuration)) {
                        self._createPlotLine(i);
                    }
                }
            }

            if (redraw) {
                var chart = self.chart;
                chart.redraw();
            }
        }
    }
};

/**
 * load settings
 * called in 2 instances
 * when indicator is created - this is for the panel - we do not want to show the popup
 * when indicator legend is clicked
 * @param {boolean} hide - we do not want to show the popup
 * @param {object} options - loading options
 */
infChart.SessionTimeBreaksIndicator.prototype.loadSettingWindow = function (hide, options) {

};

infChart.SessionTimeBreaksIndicator.prototype.removePlotLines = function () {
    var self = this;

    if (self.chart) {
        if (self.chart.xAxis[0].plotLinesAndBands.length === 0) {
             let plotLine = self.chart.xAxis[0].addPlotLine({
                value: 1,
                color: "#000000",
                width: 1,
                zIndex: 1,
                id: 'session-time-break-' + self.break + '-' + 0,
                dashStyle: "dash",
                acrossPanes: false
            });
        }

        let plotLines = self.chart.xAxis[0].plotLinesAndBands;
        let plotLineLength = plotLines.length;

        for (var i=0; i<plotLineLength; i++) {
            if (plotLines[0] && plotLines[0].id && plotLines[0].id.indexOf("session-time-break-") > -1) {
                self.chart.xAxis[0].removePlotLine(plotLines[0].id);
            }
        }

        self.chart.xAxis[0].plotLinesAndBands = [];
    }

    self.plotLines = [];
};

infChart.SessionTimeBreaksIndicator.prototype.updateColor = function (color) {
    let self = this;
    self.removePlotLines();

    self.plotLineValues.forEach(function (plotLineValue) {
        self._createPlotLine(plotLineValue.value);
    });

    self.color = color;
};

infChart.SessionTimeBreaksIndicator.prototype.updateLineType = function (type) {
    let self = this;
    self.removePlotLines();

    self.plotLineValues.forEach(function (plotLineValue) {
        self._createPlotLine(plotLineValue.value);
    });

    self.lineType = type;
};

infChart.SessionTimeBreaksIndicator.prototype.destroy = function () {
    this.removePlotLines();
    infChart.Indicator.prototype.destroy.apply(this, arguments);
};

infChart.SessionTimeBreaksIndicator.prototype._getMergedDataDurations = function (data, interval) {
    let mergedDataDurations = [];

    data.forEach(function (point, index) {
            let nextPoint = data[index + 1];
            if (nextPoint) {
                let diff = nextPoint[0] - point[0];
                let diffMins = Math.floor(diff/1000/60);
                let isDiffInMergedArea;

                switch (interval) {
                    case 'I_1':
                        isDiffInMergedArea = diffMins > 1;
                        break;
                    case 'I_2':
                        isDiffInMergedArea = diffMins > 2;
                        break;
                    case 'I_3':
                        isDiffInMergedArea = diffMins > 3;
                        break;
                    case 'I_5':
                        isDiffInMergedArea = diffMins > 5;
                        break;
                    case 'I_10':
                        isDiffInMergedArea = diffMins > 10;
                        break;
                    case 'I_15':
                        isDiffInMergedArea = diffMins > 15;
                        break;
                    case 'I_30':
                        isDiffInMergedArea = diffMins > 30;
                        break;
                    case 'I_60':
                        isDiffInMergedArea = diffMins > 60;
                        break;
                    case 'I_120':
                        isDiffInMergedArea = diffMins > 60*2;
                        break;
                    case 'I_240':
                        isDiffInMergedArea = diffMins > 60*4;
                        break;
                    case 'D':
                        isDiffInMergedArea = diffMins > 60*24;
                        break;
                    case 'W':
                        isDiffInMergedArea = diffMins > 60*24*7;
                        break;
                    case 'M':
                        isDiffInMergedArea = diffMins > 60*24*30;
                        break;
                    default:
                        break;
                }

                if (isDiffInMergedArea) {
                    mergedDataDurations.push([point[0], nextPoint[0]]);
                }
            }
        });

    return mergedDataDurations;
};

infChart.SessionTimeBreaksIndicator.prototype._isPointBetweenMergedArea = function (pointValue, mergedDataDurations, drawnBetweenMergedDuration) {
    for (let i = 0; i < mergedDataDurations.length; i++) {
        if (pointValue > mergedDataDurations[i][0] && pointValue < mergedDataDurations[i][1]) {
            let  key = mergedDataDurations[i][0] + "-" + mergedDataDurations[i][1];
            if (!drawnBetweenMergedDuration[key]) {
                drawnBetweenMergedDuration[key] = true;
                return false;
            } else {
                return true;
            }
        }
    }

    return false;
};

infChart.SessionTimeBreaksIndicator.prototype._createPlotLine = function (value) {
    let self = this;

    if (self.chart) {
        let xAxis = self.chart.xAxis[0];
        let plotLineSettings = infChart.manager.getChart(self.chartId).sessionTimeBreakSettings[self.break];
        let dashStyle = plotLineSettings.lineType === "dash" ? "12 9" : plotLineSettings.lineType;
        let plotLine = xAxis.addPlotLine({
            value: value,
            color: plotLineSettings.color,
            width: 1,
            zIndex: 3,
            id: 'session-time-break-' + self.break + '-' + value,
            dashStyle: dashStyle,
            acrossPanes: false
        });

        self.plotLineValues.push({
            value: value
        });
        self.plotLines.push(plotLine);
    }
};

infChart.SessionTimeBreaksIndicator.prototype._addIntervalDataForChangingValues = function (startDate, endPoint) {
    let time = startDate.getTime();
    if (time < endPoint) {
        this._createPlotLine(time);

        if (this.break === "M") {
            let month = startDate.getUTCMonth();
            startDate.setUTCMonth(month + 1);
        } else if (this.break === "4M") {
            let month = startDate.getUTCMonth();
            startDate.setUTCMonth(month + 3);
        } else if (this.break === "Y") {
            let year = startDate.getUTCFullYear();
            startDate.setUTCFullYear(year + 1);
        }

        this._addIntervalDataForChangingValues(startDate, endPoint);
    }
};

infChart.SessionTimeBreaksIndicator.prototype._getIntervalData = function (startPoint) {
    let startDate = new Date(startPoint);
    let plotInterval;

    switch (this.break) {
        case 'selectSession':
            // is point related to relevant session break
            break;
        case 'I_2':
            startDate.setUTCMinutes(0);
            plotInterval =  2 * 60 * 1000; // 2 mins in milliseconds
            break;
        case 'I_3':
            startDate.setUTCMinutes(0);
            plotInterval =  3 * 60 * 1000; // 3 mins in milliseconds
            break;
        case 'I_5':
            startDate.setUTCMinutes(0);
            plotInterval =  5 * 60 * 1000; // 5 mins in milliseconds
            break;
        case 'I_10':
            startDate.setUTCMinutes(0);
            plotInterval =  10 * 60 * 1000; // 10 mins in milliseconds
            break;
        case 'I_15':
            startDate.setUTCMinutes(0);
            plotInterval =  15 * 60 * 1000; // 15 mins in milliseconds
            break;
        case 'I_30':
            startDate.setUTCMinutes(0);
            plotInterval =  30 * 60 * 1000; // 30 mins in milliseconds
            break;
        case 'I_60':
            startDate.setUTCMinutes(0);
            plotInterval =  3600 * 1000; // 1 hour in milliseconds
            break;
        case 'I_120':
            startDate.setUTCMinutes(0);
            startDate.setUTCHours(0);
            plotInterval =  2 * 3600 * 1000; // 2 hour in milliseconds
            break;
        case 'I_240':
            startDate.setUTCMinutes(0);
            startDate.setUTCHours(0);
            plotInterval =  4 * 3600 * 1000; // 4 hour in milliseconds
            break;
        case 'D':
            startDate.setUTCMinutes(0);
            startDate.setUTCHours(0);
            plotInterval =  24 * 3600 * 1000;
            break;
        case 'W':
            startDate.setUTCMinutes(0);
            startDate.setUTCHours(0);
            startDate.setUTCDate(startDate.getUTCDate() - (startDate.getUTCDay() - 1));
            plotInterval =  7 * 24 * 3600 * 1000;
            break;
        default:
            break;
    }

    return {
        startDate: startDate,
        plotInterval: plotInterval
    };
};

//endregion ************************************** end of Session / Time Breaks Indicator******************************************
