//region ************************************** Days Indicator******************************************

/***
 * Constructor for Days Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
infChart.DaysIndicator = function (id, chartId, type, chartInstance) {
    if (chartInstance) {
        var vm = this;
        infChart.AdvancedIndicator.apply(this, arguments);

        this.showFibLines = false;
        this.showHalfValueLines = true;
        this.params.showFibLines = this.showFibLines;
        this.params.showHalfValueLines = this.showHalfValueLines;
        this.checkOptions = ["showFibLines", "showHalfValueLines"];
        this.supportedIntervals = ["I_1", "I_2", "I_3", "I_5", "I_10", "I_15", "I_30", "I_60", "I_120", "I_240", "I_360", "I_480", "I_720", "D"];
        this.numberOfHalfValueLines = 4;
        this.fibDrawings = [];
        this.halfValueDrawings = [];
        this.lastHighlights = [];

        this.days.forEach(function (day) {
            vm.series.push(chartInstance.addSeries({
                id: id,
                name: day.name,
                infIndType: "DAY",
                infIndSubType: day.name,
                day: day.day,
                type: "plotrange",
                infType: "indicator",
                yAxis: "#0",
                legendKey: day.name,
                showInLegend: true,
                hideLegend: false,
                color: day.color,

            }, false));
        });
    }
};

infChart.util.extend(infChart.AdvancedIndicator, infChart.DaysIndicator);

/**
 * Overwrite calculate method for days indicator
 * @private
 */
infChart.DaysIndicator.prototype.calculate = function (ohlc, data, redraw) {
    var vm = this;
    if (data && data.length > 0) {
        var xChart = infChart.manager.getChart(this.chartId);
        var intervalOffset = xChart.getIntervalOption(xChart.interval).time / 2;

        if (this.interval !== xChart.interval) {
            vm.interval = xChart.interval;
            vm.removeDrawings();
            vm.fibDrawings = [];
            vm.halfValueDrawings = [];
            vm.lastHighlights = [];

            if (vm.supportedIntervals.indexOf(vm.interval) > -1) {
                vm.days.forEach(function (dayOptions) {
                    var dayHighlights = vm.getDays(data, dayOptions, intervalOffset);
                    dayHighlights.forEach(function (mondays) {
                        var dayDrawingObject = infChart.drawingUtils.common.indicatorUtils.addRectangle(vm.chart, undefined, {
                            indicatorId: vm.id,
                            drawingId: vm.id + '_MondaysDrawing_' + mondays.xValueEnd,
                            yValue: mondays.yValue,
                            xValue: mondays.xValue,
                            yValueEnd: mondays.yValueEnd,
                            xValueEnd: mondays.xValueEnd,
                            fillColor: dayOptions.color,
                            borderColor: dayOptions.color
                        });
                        dayDrawingObject.deselect.call(dayDrawingObject);
                        vm.drawings.push(dayDrawingObject);
                    });
                });
            }

            if (vm.showFibLines) {
                vm.addFibDrawings();
            }

            if (vm.showHalfValueLines) {
                vm.addHalfValueLines();
            }
        }

        if (this.params.showFibLines !== this.showFibLines) {
            this.showFibLines = this.params.showFibLines;
            this.removeDrawings(this.fibDrawings);
            this.fibDrawings = [];
            if (this.showFibLines) {
                this.addFibDrawings();
            } else {
                this.fibLineLabel = undefined;
                if (this.showHalfValueLines && this.lastHighlights.length > 0) {
                    this._addHalfValueLine(this.lastHighlights[this.lastHighlights.length - 1]);
                }
            }
        }

        if (this.params.showHalfValueLines !== this.showHalfValueLines) {
            this.showHalfValueLines = this.params.showHalfValueLines;
            this.removeDrawings(this.halfValueDrawings);
            this.halfValueDrawings = [];
            if (this.showHalfValueLines) {
                this.addHalfValueLines();
            } else if (this.fibLineLabel) {
                this.fibLineLabel.destroy();
                this.fibLineLabel = undefined;
            }
        }

        if (!this.series[0].visible) {
            this._hideDrawings();
        }

        if (redraw) {
            var chart = this.chart;
            chart.redraw();
        }
    }
};

/**
 * Overwrite the settings panel for days indicator
 * @private
 */
infChart.DaysIndicator.prototype.getSettingWindowHTML = function () {
    var self = this, config = self.getConfig(), chart = infChart.manager.getChart(self.chartId);
    var checkParameters = [];
    $.each(config.params, function (key) {
        checkParameters.xPush({'key': key, label: infChart.manager.getLabel("label.indicatorParam." + key),  value: self.params[key]});
    });

    var paramSection = infChart.structureManager.indicator.getSeriesParameterSection({}, [], [], {}, undefined, checkParameters);

    return infChart.structureManager.settings.getPanelHTML(this.chartId + '-indicator-panel', this.getUniqueId(),
        infChart.manager.getLabel('label.indicatorDesc.' + self.type),
        infChart.structureManager.settings.getPanelBodyHTML([paramSection]));
};

infChart.DaysIndicator.prototype.removeDrawings = function (drawings) {
    var vm = this;
    var drawingItems = drawings ? drawings : this.drawings;
    drawingItems.forEach(function (drawing) {
        infChart.drawingsManager.removeDrawing(vm.chartId, drawing.drawingId, true, true);

        var drawingIndex = vm.drawings.indexOf(drawing);
        if (drawings && drawingIndex > -1) {
            vm.drawings.splice(drawingIndex, 1);
        }
    });

    if (!drawings) {
        this.drawings = [];
    }
};

infChart.DaysIndicator.prototype.getDays = function (data, dayOptions, intervalOffset) {
    var pendingData = {};
    var vm = this;
    var beforeDay;

    data.forEach(function (point, index) {
        var date = new Date(point[0]);

        if (date.getUTCDay() === dayOptions.day) {
            var highlightDay = vm._getDay(date, dayOptions.day);

            if (!pendingData[highlightDay]) {
                pendingData[highlightDay] = [];

                if (index !== 0) {
                    beforeDay = data[index - 1][0];
                }
            }

            pendingData[highlightDay].push({
                beforeDay: beforeDay,
                afterDay: data[index + 1] ? data[index + 1][0] : undefined,
                index: index,
                high: point[2],
                low: point[3],
                xValue: point[0]
            })
        }
    });

    return this.updateDataWithHighlightDays(pendingData, intervalOffset);
};

infChart.DaysIndicator.prototype.updateDataWithHighlightDays = function (pendingData, intervalOffset) {
    let drawingsData = [];
    let lastHighlightedKeys = Object.keys(pendingData).slice(-this.numberOfHalfValueLines);

    for (let highlightDay in pendingData) {
        if (pendingData.hasOwnProperty(highlightDay)) {
            var groupData = pendingData[highlightDay];

            var highVal = undefined;
            var lowVal = undefined;
            groupData.forEach(function (pendData) {
                if (!highVal || pendData.high > highVal) {
                    highVal = pendData.high
                }

                if (!lowVal || pendData.low < lowVal) {
                    lowVal = pendData.low
                }
            });

            var xValDiff = groupData[0].beforeDay ? (groupData[0].xValue - groupData[0].beforeDay) / 2 : intervalOffset;
            var xVal = groupData[0].xValue - xValDiff;
            var xValEndDiff = groupData[groupData.length - 1].afterDay  ? (groupData[groupData.length - 1].afterDay - groupData[groupData.length - 1].xValue) / 2 : intervalOffset;
            var xValEnd = groupData[groupData.length - 1].xValue + xValEndDiff;

            drawingsData.push({
                xValue: xVal,
                yValue: highVal,
                xValueEnd: xValEnd,
                yValueEnd: lowVal
            });

            if (lastHighlightedKeys.indexOf(highlightDay) > -1) {
                this.lastHighlights.push({
                    index: groupData[0].index,
                    high: highVal,
                    low: lowVal,
                    xValue: xVal
                });
            }
        }
    }

    return drawingsData;
};

infChart.DaysIndicator.prototype.addFibDrawings = function () {
    let lastHighlightedDay = this.lastHighlights[this.lastHighlights.length - 1];

    if (this.showHalfValueLines && this.halfValueDrawings.length > 0) {
        let lastHalfValueDrawingIndex = this.halfValueDrawings.length - 1;
        this.removeDrawings([this.halfValueDrawings[lastHalfValueDrawingIndex]]);
        this.halfValueDrawings.splice(lastHalfValueDrawingIndex, 1);
    }

    if (lastHighlightedDay && lastHighlightedDay.high >= 0 && lastHighlightedDay.low >= 0) {
        var vm = this;
        vm.fibDrawings = [];

        var gap = (lastHighlightedDay.high - lastHighlightedDay.low)/4;
        var fibLines = [lastHighlightedDay.high, lastHighlightedDay.high - gap, lastHighlightedDay.low + gap * 2, lastHighlightedDay.low + gap, lastHighlightedDay.low];

        fibLines.forEach(function (yValue, index) {
            var drawingObject = infChart.drawingUtils.common.indicatorUtils.addHorizontalLine(vm.chart, undefined,
                {
                    indicatorId: vm.id,
                    drawingId: vm.id + "_HorLineDrawing_" + yValue,
                    yValue: yValue,
                    xValue: lastHighlightedDay.xValue,
                    dashStyle: "solid"
                });
            drawingObject.deselect.call(drawingObject);
            vm.fibDrawings.push(drawingObject);
            vm.drawings.push(drawingObject);

            if (index === 2 && vm.showHalfValueLines) {
                vm.fibLineLabel = vm._addLabel(drawingObject);
            }
        });
    }
};

infChart.DaysIndicator.prototype.addHalfValueLines = function () {
    let vm = this;
    vm.halfValueDrawings = [];
    this.lastHighlights.forEach(function (highlight, index) {
        if (!vm.showFibLines || index !== vm.lastHighlights.length - 1) {
            vm._addHalfValueLine(highlight);
        }
    });

    if (vm.showFibLines && !vm.fibLineLabel && vm.fibDrawings[2]) {
        vm.fibLineLabel = vm._addLabel(vm.fibDrawings[2]);
    }
};

infChart.DaysIndicator.prototype._addHalfValueLine = function (highlight) {
    let yValue = highlight.low + ((highlight.high - highlight.low) / 2);
    let drawingObject = infChart.drawingUtils.common.indicatorUtils.addHorizontalLine(this.chart, undefined,
        {
            indicatorId: this.id,
            drawingId: this.id + '_HorLineDrawing_' + yValue,
            yValue: yValue,
            xValue: highlight.xValue,
            dashStyle: "shortdash"
        });
    drawingObject.deselect.call(drawingObject);
    this.halfValueDrawings.push(drawingObject);
    this.drawings.push(drawingObject);
    this._addLabel(drawingObject);
};

infChart.DaysIndicator.prototype._addLabel = function (drawingObject) {
    let top = this.fiftyPercentLine.height + this.fiftyPercentLine.padding;
    let label = drawingObject.annotation.chart.renderer.label(this.fiftyPercentLine.label, 0, -top).attr({
        height: this.fiftyPercentLine.height,
        padding: this.fiftyPercentLine.padding,
        width: this.fiftyPercentLine.width,
        fill:"#000000"
    }).add(drawingObject.annotation.group);

    label.css({
        fontWeight: 150,
        opacity: 0.6,
        fontSize: "10px",
        color: this.fiftyPercentLine.color
    });

    return label;
};

infChart.DaysIndicator.prototype._getDay = function (date) {
    return [date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()].join("-");
};

/**
 * hide indicator
 */
infChart.DaysIndicator.prototype.hideIndicator = function (seriesId) {
    this._hideDrawings();
    infChart.Indicator.prototype.hideIndicator.apply(this, [seriesId, true]);
};

/**
 * show indicator
 */
infChart.DaysIndicator.prototype.showIndicator = function (seriesId) {
    this.drawings.forEach(function (drawing) {
        drawing.annotation.group.show();
    });

    this.fibDrawings.forEach(function (drawing) {
        drawing.annotation.group.show();
    });

    this.halfValueDrawings.forEach(function (drawing) {
        drawing.annotation.group.show();
    });

    infChart.Indicator.prototype.showIndicator.apply(this, [seriesId, true]);
};

/**
 * hide drawings
 */
infChart.DaysIndicator.prototype._hideDrawings = function () {
    this.drawings.forEach(function (drawing) {
        drawing.annotation.group.hide();
    });

    this.fibDrawings.forEach(function (drawing) {
        drawing.annotation.group.hide();
    });

    this.halfValueDrawings.forEach(function (drawing) {
        drawing.annotation.group.hide();
    });
};

//endregion ************************************** end of DaysIndicator Indicator******************************************
