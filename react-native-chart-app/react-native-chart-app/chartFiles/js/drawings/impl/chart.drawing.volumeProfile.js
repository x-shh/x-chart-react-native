window.infChart = window.infChart || {};

infChart.volumeProfileDrawing = function () {
    infChart.drawingObject.apply(this, arguments);
    this.settingTypes = {
        volume: "v",
        valueAreaVolume: "va",
        barCount: "bc"
    };

    this.defaultStyles = {
        volumeProfileUpVolumeColor: '#0066FF',
        volumeProfileUpVolumeOpacity: 0.25,
        volumeProfileDownVolumeColor: '#FFCC00',
        volumeProfileDownVolumeOpacity: 0.25,
        volumeProfileAreaUpVolumeColor: '#0066FF',
        volumeProfileAreaUpVolumeOpacity: 0.7,
        volumeProfileAreaDownVolumeColor: '#FFCC00',
        volumeProfileAreaDownVolumeOpacity: 0.7,
        valueAreaHighColor: '#33CC00',
        valueAreaHighOpacity: 100,
        valueAreaLowColor: '#FF9933',
        valueAreaLowOpacity: 100,
        pointOfControlColor: '#FF4D4D',
        pointOfControlOpacity: 100,
        valuesColor: '#FFFFFF',
        valuesOpacity: 100,
        histogramBoxColor: '#0099FF',
        histogramBoxOpacity: 0.1
    };
    this.volumeTypes = {
        total: {id: "total", displayName: "Total"},
        upDown: {id: "upDown", displayName: "Up/Down"}
        // ,
        // delta: {id: "delta", displayName: "Delta"}
    };

    this.intervalsArray = ['I_1', 'I_3', 'I_5', 'I_10', 'I_15', 'I_30', 'I_60', 'I_120', 'I_240', 'D', 'W', 'M'];
    this.defaultSettings = {
        barGapPixelWidth: 1,
        minApproximatedPoints: 1000,
        maxApproximatedPoints: 5000
    };

    var theme = infChart.drawingUtils.common.getTheme.call(this);
    var shapeTheme = theme[this.shape];
    this.settings = {
        volume: this.volumeTypes.total.id,
        valueAreaVolume: 70,
        barCount: 10,
        extendToRight: false,
        volumeProfile: {
            enabled: true,
            profileWidth: 50,
            flipChart: false,
            upVolumeColor: (shapeTheme && shapeTheme.upVolumeColor) ? shapeTheme.upVolumeColor : this.defaultStyles.volumeProfileUpVolumeColor,
            upVolumeOpacity: (shapeTheme && shapeTheme.upVolumeOpacity) ? shapeTheme.upVolumeOpacity : this.defaultStyles.volumeProfileUpVolumeOpacity,
            downVolumeColor: (shapeTheme && shapeTheme.downVolumeColor) ? shapeTheme.downVolumeColor : this.defaultStyles.volumeProfileDownVolumeColor,
            downVolumeOpacity: (shapeTheme && shapeTheme.downVolumeOpacity) ? shapeTheme.downVolumeOpacity : this.defaultStyles.volumeProfileDownVolumeOpacity,
            volumeAreaUpColor: (shapeTheme && shapeTheme.volumeAreaUpColor) ? shapeTheme.volumeAreaUpColor : this.defaultStyles.volumeProfileAreaUpVolumeColor,
            volumeAreaUpOpacity: (shapeTheme && shapeTheme.volumeAreaUpOpacity) ? shapeTheme.volumeAreaUpOpacity : this.defaultStyles.volumeProfileAreaUpVolumeOpacity,
            volumeAreaDownColor: (shapeTheme && shapeTheme.volumeAreaDownColor) ? shapeTheme.volumeAreaDownColor : this.defaultStyles.volumeProfileAreaDownVolumeColor,
            volumeAreaDownOpacity: (shapeTheme && shapeTheme.volumeAreaDownOpacity) ? shapeTheme.volumeAreaDownOpacity : this.defaultStyles.volumeProfileAreaDownVolumeOpacity
        },
        valueAreaHigh: {
            enabled: false,
            color: (shapeTheme && shapeTheme.valueAreaHighColor) ? shapeTheme.valueAreaHighColor : this.defaultStyles.valueAreaHighColor,
            opacity: (shapeTheme && shapeTheme.valueAreaHighOpacity) ? shapeTheme.valueAreaHighOpacity : this.defaultStyles.valueAreaHighOpacity,
            lineWidth: 1,
            lineStyle: 'solid'
        },
        valueAreaLow: {
            enabled: false,
            color: (shapeTheme && shapeTheme.valueAreaLowColor) ? shapeTheme.valueAreaLowColor : this.defaultStyles.valueAreaLowColor,
            opacity: (shapeTheme && shapeTheme.valueAreaLowOpacity) ? shapeTheme.valueAreaLowOpacity : this.defaultStyles.valueAreaLowOpacity,
            lineWidth: 1,
            lineStyle: 'solid'
        },
        pointOfControl: {
            enabled: false,
            color: (shapeTheme && shapeTheme.pointOfControlColor) ? shapeTheme.pointOfControlColor : this.defaultStyles.pointOfControlColor,
            opacity: (shapeTheme && shapeTheme.pointOfControlOpacity) ? shapeTheme.pointOfControlOpacity : this.defaultStyles.pointOfControlOpacity,
            lineWidth: 1,
            lineStyle: 'solid'
        },
        values: {
            enabled: false,
            color: (shapeTheme && shapeTheme.valuesColor) ? shapeTheme.valuesColor : this.defaultStyles.valuesColor,
            opacity: (shapeTheme && shapeTheme.valuesOpacity) ? shapeTheme.valuesOpacity : this.defaultStyles.valuesOpacity
        },
        histogramBox: {
            color: (shapeTheme && shapeTheme.histogramBoxColor) ? shapeTheme.histogramBoxColor : this.defaultStyles.histogramBoxColor,
            opacity: (shapeTheme && shapeTheme.histogramBoxOpacity) ? shapeTheme.histogramBoxOpacity : this.defaultStyles.histogramBoxOpacity
        }
    };
};

infChart.volumeProfileDrawing.prototype = Object.create(infChart.drawingObject.prototype);

infChart.volumeProfileDrawing.prototype.getConfig = function () {
    var annotation = this.annotation;
    return {
        shape: 'volumeProfile',
        xValue: annotation.options.xValue,
        yValue: annotation.options.yValue,
        xValueEnd: annotation.options.xValueEnd,
        yValueEnd: annotation.options.yValueEnd,
        settings: annotation.options.settings,
        from: annotation.options.from,
        to: annotation.options.to,
        isLocked : annotation.options.isLocked

    };
};

infChart.volumeProfileDrawing.prototype.getOptions = function (properties, chart) {
    var nearestDataPointForXValue = infChart.math.findNearestDataPoint(chart, properties.xValue, undefined, true);
    var options = {
        xValue: properties.xValue,
        yValue: properties.yValue,
        allowDragX: false,
        allowDragY: false,
        allowDragByHandle: true,
        settings: properties.settings ? properties.settings : this.settings,
        shape: {
            params: {
                d: ['M', 0, 0, 'L', 0, 0],
                dashstyle: 'solid',
                stroke: '#959595',
                'stroke-width': 1,
                opacity: 100
            }
        },
        disableCopyPaste: true
    };

    if (properties.from) {
        options.from = properties.from;
    }

    if (properties.to) {
        options.to = properties.to;
    }

    if (properties.xValueEnd) {
        options.xValueEnd = properties.xValueEnd;
        options.yValueEnd = properties.yValueEnd;
    }

    options = infChart.Drawing.prototype.getOptions(properties,options);

    return options;
};

infChart.volumeProfileDrawing.prototype.additionalDrawingsFunction = function () {
    var self = this,
        ann = self.annotation,
        options = ann.options,
        styles = options.styles,
        chart = ann.chart,
        additionalDrawings = self.additionalDrawings

    additionalDrawings.startLine = chart.renderer.path(['M', 0, 0, 'L', 0, 0]).attr({
        'stroke-width': 1,
        stroke: '#959595',
        opacity: 100,
        'z-index': 2
    }).add(ann.group);

    additionalDrawings.endLine = chart.renderer.path(['M', 0, 0, 'L', 0, 0]).attr({
        'stroke-width': 1,
        stroke: '#959595',
        opacity: 100,
        'z-index': 2
    }).add(ann.group);

    additionalDrawings.volumeProfile = chart.renderer.createElement('foreignObject').add(ann.group).attr({
        "zIndex": 1,
        x: 0,
        y: 0
    });
};

infChart.volumeProfileDrawing.prototype.step = function (e, isStartPoint) {
    var ann = this.annotation,
        points = infChart.drawingUtils.common.calculateInitialPoints(e, ann, isStartPoint, 0, 0),
        options = ann.options,
        chart = ann.chart,
        additionalDrawings = this.additionalDrawings,
        xAxis = chart.xAxis[options.xAxis],
        yAxis = chart.yAxis[ann.options.yAxis],
        xValueEnd = xAxis.toValue(xAxis.toPixels(options.xValue) + points.dx),
        yValueEnd = yAxis.toValue(yAxis.toPixels(options.yValue) + points.dy),
        nearestDataPointForXValue = infChart.math.findNearestDataPoint(chart, options.xValue, undefined, true),
        nearestDataPointForXValueEnd = infChart.math.findNearestDataPoint(chart, xValueEnd, undefined, true),
        newX = xAxis.toPixels(nearestDataPointForXValue.xData) - xAxis.toPixels(ann.options.xValue),
        newXEnd = xAxis.toPixels(nearestDataPointForXValueEnd.xData) - xAxis.toPixels(ann.options.xValue);

    ann.shape.show();
    additionalDrawings.volumeProfile.css({
        display: 'none'
    });
    additionalDrawings.startLine.show();
    additionalDrawings.endLine.show();

    var line = ["M", newX, 0, 'L', parseInt(newXEnd, 10), parseInt(points.dy, 10)];
    ann.shape.attr({
        d: line
    });

    var newYPositions = this.updateStartAndEndLines(newX, newXEnd);

    return {
        line: line,
        nearestDataPointForXValue: nearestDataPointForXValue,
        nearestDataPointForXValueEnd: nearestDataPointForXValueEnd,
        newY: newYPositions.newY,
        newYEnd: newYPositions.newYEnd
    };
};

infChart.volumeProfileDrawing.prototype.stop = function (e, isStartPoint) {
    var self = this,
        ann = self.annotation,
        options = ann.options,
        chart = ann.chart,
        additionalDrawings = self.additionalDrawings,
        xAxis = chart.xAxis[options.xAxis],
        yAxis = chart.yAxis[options.yAxis],
        lineData = self.stepFunction(e, isStartPoint),
        line = lineData.line,
        x = xAxis.toValue(line[4] + xAxis.toPixels(ann.options.xValue)),
        y = yAxis.toValue(line[5] + yAxis.toPixels(ann.options.yValue)),
        currentFromData = {
            value: lineData.nearestDataPointForXValue.xData,
            index: lineData.nearestDataPointForXValue.dataIndex
        },
        currentToData = {
            value: lineData.nearestDataPointForXValueEnd.xData,
            index: lineData.nearestDataPointForXValueEnd.dataIndex
        },
        newFromData = currentFromData.index > currentToData.index ? currentToData : currentFromData,
        newToData = currentFromData.index > currentToData.index ? currentFromData : currentToData;

    line[1] = 0;
    line[4] = xAxis.toPixels(lineData.nearestDataPointForXValueEnd.xData) - xAxis.toPixels(lineData.nearestDataPointForXValue.xData);

    ann.update({
        xValue: lineData.nearestDataPointForXValue.xData,
        xValueEnd: lineData.nearestDataPointForXValueEnd.xData,
        yValueEnd: yAxis.toValue(line[5] + yAxis.toPixels(ann.options.yValue)),
        from: newFromData,
        to: newToData,
        shape: {
            params: {
                d: line
            }
        }
    });

    self.updateStartAndEndLines(0, line[4], lineData.newY, lineData.newYEnd);
    infChart.drawingUtils.common.saveBaseYValues.call(this, ann.options.yValue, y);

    this.getDataAndDrawVolumeProfile(function () {
        self.selectAndBindResize();
        chart.selectedAnnotation = ann;
        infChart.drawingUtils.common.fixSelectionMarker.call(self, ann);
        infChart.drawingUtils.common.onPropertyChange.call(self);
    });
};

infChart.volumeProfileDrawing.prototype.scale = function (isCalculateNewValueForScale) {
    var self = this,
        ann = self.annotation,
        chart = ann.chart,
        options = ann.options,
        xAxis = chart.xAxis[options.xAxis],
        yAxis = chart.yAxis[options.yAxis],
        additionalDrawings = self.additionalDrawings, newX, newXEnd,
        yEnd = yAxis.toPixels(options.yValueEnd) - yAxis.toPixels(options.yValue),
        yAxisExtremes, newY, newYEnd;

    if (isCalculateNewValueForScale) {
        var nearestDataPointForXValue = infChart.math.findNearestDataPoint(chart, options.xValue, undefined, true),
            nearestDataPointForXValueEnd = infChart.math.findNearestDataPoint(chart, options.xValueEnd, undefined, true);

        newX = xAxis.toPixels(nearestDataPointForXValue.xData) - xAxis.toPixels(options.xValue);
        newXEnd = xAxis.toPixels(nearestDataPointForXValueEnd.xData) - xAxis.toPixels(options.xValue);

        ann.update({
            xValue: nearestDataPointForXValue.xData,
            xValueEnd: nearestDataPointForXValueEnd.xData,
            from: {
                value: nearestDataPointForXValue.xData,
                index: nearestDataPointForXValue.dataIndex
            },
            to: {
                value: nearestDataPointForXValueEnd.xData,
                index: nearestDataPointForXValueEnd.dataIndex
            },
            shape: {
                params: {
                    d: ["M", newX, 0, 'L', newXEnd, yEnd]
                }
            }
        });

        self.updateStartAndEndLines(newX, newXEnd);
        self.getDataAndDrawVolumeProfile(function () {});

    } else {
        newXEnd = self.getVolumeProfileWidth(options.xValue, options.xValueEnd);//xAxis.toPixels(options.nearestXValueEnd) - xAxis.toPixels(ann.options.xValue);

        ann.update({
            shape: {
                params: {
                    d: ["M", 0, 0, 'L', newXEnd, yEnd]
                }
            }
        });

        if (options.currentDataSet && options.calculatedBars && options.calculatedBars.totalVolume > 0) {
            additionalDrawings.volumeProfile.attr({
                width: newXEnd,
                height: yEnd
            });

            $(additionalDrawings.volumeProfile.element).find("svg").css({
                width: "100%",
                height: "100%",
                display: "block"
            });
        } else {
            self.updateStartAndEndLines(newX, newXEnd);
        }
    }

};

infChart.volumeProfileDrawing.prototype.updateStartAndEndLines = function (newX, newXEnd, newY, newYEnd) {
    var ann = this.annotation,
        chart = ann.chart,
        options = ann.options,
        yAxis = chart.yAxis[options.yAxis],
        additionalDrawings = this.additionalDrawings,
        yAxisExtremes;

    if (!newY && !newYEnd) {
        yAxisExtremes = yAxis.getExtremes();
        newY = yAxis.toPixels(yAxisExtremes.max) - yAxis.toPixels(options.yValue);
        newYEnd = yAxis.toPixels(yAxisExtremes.min) - yAxis.toPixels(options.yValue);
    }

    additionalDrawings.startLine.attr({
        d: ["M", newX, newY, "L", newX, newYEnd]
    });

    additionalDrawings.endLine.attr({
        d: ["M", newXEnd, newY, "L", newXEnd, newYEnd]
    });

    return {newY: newY, newYEnd: newYEnd};
}

infChart.volumeProfileDrawing.prototype.isRequiredProperty = function (propertyId) {
    var isPositionProperty = false;

    switch (propertyId) {
        case "yValue":
        case "yValueEnd":
        case "xValue":
        case "xValueEnd":
        case "from":
        case "to":
        case "isLocked":
            isPositionProperty = true;
            break;
        default :
            break;
    }

    return isPositionProperty;
};

//region Draw Volume Profile


//endregion

//region Request and calculations

infChart.volumeProfileDrawing.prototype.getMinutesOfSelectedInterval = function (interval) {
    var minutes = 0;

    if (interval.indexOf("I") !== -1) {
        minutes = parseInt(interval.split("_")[1], 10);
    } else {
        switch (interval) {
            case 'D':
                minutes = 1440;
                break;
            case 'W':
                minutes = 10080;
                break;
            case 'M':
                minutes = 43200;
                break;
        }
    }

    return minutes;
}

infChart.volumeProfileDrawing.prototype.getRequestInterval = function (currentInterval) {
    var self = this,
        ann = self.annotation,
        options = ann.options,
        requestInterval,
        currentIntervalIndex = self.intervalsArray.indexOf(currentInterval),
        rangeCandleCount = options.to.index - options.from.index + 1,
        currentIntervalMinutes = self.getMinutesOfSelectedInterval(currentInterval),
        currenSelectedInterval, selectedIntervalMinutes,
        previousInterval = currentInterval, calculatedCandles;

    if (currentIntervalIndex === 0) {
        requestInterval = currentInterval;
    } else {
        for (var i = currentIntervalIndex - 1; i >= 0; i--) {
            currenSelectedInterval = self.intervalsArray[i];
            selectedIntervalMinutes = self.getMinutesOfSelectedInterval(currenSelectedInterval);
            calculatedCandles = rangeCandleCount * (currentIntervalMinutes / selectedIntervalMinutes);

            if (calculatedCandles > self.defaultSettings.maxApproximatedPoints) {
                requestInterval = previousInterval;
                break;
            } else if (calculatedCandles >= self.defaultSettings.minApproximatedPoints) {
                requestInterval = currenSelectedInterval;
                break;
            } else if (i === 0) {
                requestInterval = currenSelectedInterval;
            }

            previousInterval = currenSelectedInterval;
        }
    }

    return requestInterval;
}

infChart.volumeProfileDrawing.prototype.getDataAndDrawVolumeProfile = function (successFn) {
    var self = this,
        ann = self.annotation,
        options = ann.options,
        chart = ann.chart,
        additionalDrawings = self.additionalDrawings,
        stockChartId = infChart.drawingsManager.getChartIdFromHighchartInstance(chart),
        chartInstance = infChart.manager.getChart(stockChartId),
        requestInterval = self.getRequestInterval(chartInstance.interval);

    chartInstance.dataManager.getHistoryData(chartInstance.symbol, requestInterval, new Date(options.from.value), new Date(options.to.value), function (dataObj) {
        if (dataObj.data.length > 0) {
            ann.options.currentDataSet = dataObj.data;
            self.calculatePriceRange();
            self.calculateAndSetNewXAndYValues();
            self.calculateBars(dataObj.data);

            if (ann.options.calculatedBars.totalVolume > 0) {
                self.calculateValueAreaVolumeBars();
                self.drawVolumeProfile();
                additionalDrawings.volumeProfile.css({
                    display: 'block'
                });
            } else {
                ann.shape.show();
                additionalDrawings.volumeProfile.css({
                    display: 'none'
                });
                additionalDrawings.startLine.show();
                additionalDrawings.endLine.show();
            }
        } else {
            ann.options.currentDataSet = null;
            ann.shape.show();
            additionalDrawings.volumeProfile.css({
                display: 'none'
            });
            additionalDrawings.startLine.show();
            additionalDrawings.endLine.show();
        }
        successFn.call(self);
    }, function () {

    }, chartInstance.regularIntervalsOnUpdate, "prcOpen,prcLast,volAcc", true);
};

infChart.volumeProfileDrawing.prototype.calculatePriceRange = function () {
    var self = this,
        ann = self.annotation,
        options = ann.options,
        chart = ann.chart,
        dataItem, maxPriceItem, minPriceItem,
        yDataOfFromIndex = infChart.util.getCandleData(chart, options.from.index),
        maxPrice = Math.max(...yDataOfFromIndex),
        minPrice = Math.min(...yDataOfFromIndex);

    for (var i = options.from.index; i <= options.to.index; i++) {
        dataItem = infChart.util.getCandleData(chart, i);
        maxPriceItem = Math.max(...dataItem);
        minPriceItem = Math.min(...dataItem);

        if (maxPrice < maxPriceItem) {
            maxPrice = maxPriceItem;
        } else if (minPrice > minPriceItem) {
            minPrice = minPriceItem;
        }
    }

    ann.options.priceRange = {min: minPrice, max: maxPrice};
};

infChart.volumeProfileDrawing.prototype.calculateAndSetNewXAndYValues = function () {
    var self = this,
        ann = self.annotation,
        options = ann.options,
        settings = options.settings,
        chart = ann.chart,
        xAxis = chart.xAxis[options.xAxis],
        yAxis = chart.yAxis[options.yAxis],
        additionalDrawings = self.additionalDrawings;

    var newXValue = options.xValue > options.xValueEnd ? options.xValueEnd : options.xValue;
    var newXValueEnd = options.xValue > options.xValueEnd ? options.xValue : options.xValueEnd;
    var newYValue = infChart.drawingUtils.common.getYValue.call(self, options.priceRange.max);
    var newYValueEnd = infChart.drawingUtils.common.getYValue.call(self, options.priceRange.min);
    var newXEnd = xAxis.toPixels(newXValueEnd) - xAxis.toPixels(newXValue);
    var newYEnd = yAxis.toPixels(newYValueEnd) - yAxis.toPixels(newYValue);
    var newLine = ['M', 0, 0, 'L', newXEnd, newYEnd];

    ann.update({
        xValue: newXValue,
        xValueEnd: newXValueEnd,
        yValue: newYValue,
        yValueEnd: newYValueEnd,
        shape: {
            params: {
                d: newLine
            }
        }
    });
    self.updateStartAndEndLines(0, newXEnd);
    ann.shape.hide();
    additionalDrawings.startLine.hide();
    additionalDrawings.endLine.hide();

    infChart.drawingUtils.common.saveBaseYValues.call(self, newYValue, newYValueEnd);
}

infChart.volumeProfileDrawing.prototype.calculateBarIdByPrice = function (barPriceRange, price) {
    var self = this,
        ann = self.annotation,
        options = ann.options,
        settings = options.settings,
        barId = "b_",
        rangeMin, rangeMax;

    if (options.priceRange.min === price) {
        rangeMin = price;
        rangeMax = price + barPriceRange;
    } else if (options.priceRange.max === price) {
        rangeMin = (price - barPriceRange);
        rangeMax = price;
    } else {
        rangeMin = options.priceRange.min + Math.floor((price - options.priceRange.min) / barPriceRange) * barPriceRange;
        rangeMax = rangeMin + barPriceRange;
    }

    barId += rangeMin.toFixed(4) + "_" + rangeMax.toFixed(4);

    return {barId: barId, rangeMin: rangeMin, rangeMax: rangeMax};
};

infChart.volumeProfileDrawing.prototype.calculateBars = function (data) {
    var self = this,
        ann = self.annotation,
        options = ann.options,
        settings = options.settings,
        chart = ann.chart,
        priceRangeDifference = options.priceRange.max - options.priceRange.min,
        barPriceRange = Math.round((priceRangeDifference / settings.barCount) * 100000000) / 100000000, // rounding to 8 decimal places
        pocBar = {
            rangeMin: 0,
            rangeMax: 0,
            up: 0,
            down: 0,
            total: 0,
            priceArray: []
        },
        bars = {}, totalVolume = 0, openPrice, closePrice, volume, barDetails, currentItem;

    data.forEach(function (dataItem) {
        openPrice = dataItem[1]
        closePrice = dataItem[4];
        volume = dataItem[5];

        if (volume > 0 && options.priceRange.min <= closePrice && options.priceRange.max >= closePrice) {
            barDetails = self.calculateBarIdByPrice(barPriceRange, closePrice);
            currentItem = bars[barDetails.barId];

            if (!currentItem) {
                currentItem = {
                    id: barDetails.barId,
                    rangeMin: barDetails.rangeMin,
                    rangeMax: barDetails.rangeMax,
                    up: 0,
                    down: 0,
                    total: 0,
                    priceArray: []
                };
            }

            currentItem.total += volume;
            totalVolume += volume;
            currentItem.priceArray.push(closePrice);

            if (closePrice > openPrice) {
                currentItem.up += volume;
            } else if (closePrice < openPrice) {
                currentItem.down += volume;
            }

            if (pocBar.total < currentItem.total) {
                pocBar = currentItem;
            }

            bars[barDetails.barId] = currentItem;
        }
    });

    ann.options.calculatedBars = {bars: bars, pocBar: pocBar, totalVolume: totalVolume};
};

infChart.volumeProfileDrawing.prototype.calculateValueAreaVolumeBars = function () {
    var self = this,
        ann = self.annotation,
        options = ann.options,
        settings = options.settings,
        chart = ann.chart,
        bars = options.calculatedBars.bars,
        sortedBarRanges = Object.keys(bars).sort(),
        pocBarIndex = sortedBarRanges.indexOf(options.calculatedBars.pocBar.id),
        valueAreaVolume = options.calculatedBars.totalVolume * (settings.valueAreaVolume / 100),
        cumulativeValueAreaVolume = options.calculatedBars.pocBar.total,
        minBarIndex = pocBarIndex,
        maxBarIndex = pocBarIndex,
        valueAreaBars = {}, estimatedMinBarIndex, estimatedMinBarVolume, estimatedMaxBarIndex, estimatedMaxBarVolume,
        selectedBarIndex, isMinBarSelected;

    valueAreaBars[options.calculatedBars.pocBar.id] = true;

    while (valueAreaVolume > cumulativeValueAreaVolume) {
        estimatedMinBarIndex = minBarIndex > 0 ? minBarIndex - 1 : null;
        estimatedMinBarVolume = estimatedMinBarIndex ? options.calculatedBars.bars[sortedBarRanges[estimatedMinBarIndex]].total : 0;
        estimatedMaxBarIndex = maxBarIndex < sortedBarRanges.length - 1 ? maxBarIndex + 1 : null;
        estimatedMaxBarVolume = estimatedMaxBarIndex ? options.calculatedBars.bars[sortedBarRanges[estimatedMaxBarIndex]].total : 0;

        if (estimatedMinBarIndex !== null && estimatedMaxBarIndex !== null) {
            isMinBarSelected = estimatedMinBarVolume > estimatedMaxBarVolume;
            selectedBarIndex = isMinBarSelected ? estimatedMinBarIndex : estimatedMaxBarIndex;
            cumulativeValueAreaVolume += (selectedBarIndex === estimatedMinBarIndex ? estimatedMinBarVolume : estimatedMaxBarVolume);
        } else if (estimatedMinBarIndex !== null) {
            isMinBarSelected = true;
            selectedBarIndex = estimatedMinBarIndex;
            cumulativeValueAreaVolume += estimatedMinBarVolume;
        } else {
            isMinBarSelected = false;
            selectedBarIndex = estimatedMaxBarIndex;
            cumulativeValueAreaVolume += estimatedMaxBarVolume;
        }

        valueAreaBars[sortedBarRanges[selectedBarIndex]] = true;

        if (isMinBarSelected) {
            minBarIndex = selectedBarIndex;
        } else {
            maxBarIndex = selectedBarIndex;
        }
    }

    ann.options.calculatedBars.valueAreaBars = {
        bars: valueAreaBars,
        minBarId: sortedBarRanges[minBarIndex],
        maxBarId: sortedBarRanges[maxBarIndex]
    };
}

infChart.volumeProfileDrawing.prototype.getVolumeProfileWidth = function (xValue, xValueEnd) {
    var self = this,
        ann = self.annotation,
        options = ann.options,
        chart = ann.chart,
        xAxis = chart.xAxis[options.xAxis],
        xAxisExtremes = xAxis.getExtremes(),
        candlePixelDifference,
        volumeProfileWidth;

    if (xValue >= xAxis.min && xValue <= xAxis.max && xValueEnd >= xAxis.min && xValueEnd <= xAxis.max) {
        volumeProfileWidth = xAxis.toPixels(xValueEnd) - xAxis.toPixels(xValue)
    } else {
        volumeProfileWidth = infChart.math.getPixelDistanceBetweenCandles(chart, 0, options.from.index, options.to.index);
    }

    return volumeProfileWidth;
}

infChart.volumeProfileDrawing.prototype.drawVolumeProfile = function () {
    var self = this,
        ann = self.annotation,
        options = ann.options,
        settings = options.settings,
        chart = ann.chart,
        xAxis = chart.xAxis[options.xAxis],
        yAxis = chart.yAxis[options.yAxis],
        stockChartId = infChart.drawingsManager.getChartIdFromHighchartInstance(chart),
        volumeProfileElement = document.createElement("div"),
        yValuePixels = yAxis.toPixels(options.yValue),
        newValues, renderer;

    var volumeProfileWidth = self.getVolumeProfileWidth(options.xValue, options.xValueEnd)//xAxis.toPixels(options.xValueEnd) - xAxis.toPixels(options.xValue);
    var volumeProfileHeight = yAxis.toPixels(options.yValueEnd) - yValuePixels;

    self.additionalDrawings.volumeProfile.attr({
        width: volumeProfileWidth,
        height: volumeProfileHeight
    });

    renderer = new Highcharts.Renderer(
        volumeProfileElement,
        volumeProfileWidth,
        volumeProfileHeight
    );

    self.additionalDrawings.histogramBox = renderer.rect(0, 0, volumeProfileWidth, volumeProfileHeight).attr({
        fill: settings.histogramBox.color,
        'stroke-width': 0,
        'fill-opacity': settings.histogramBox.opacity
    }).add();

    self.drawVolumeProfileBars(renderer, volumeProfileWidth, volumeProfileHeight, yValuePixels);
    self.convertAndSetVolumeProfileImage(volumeProfileElement);
    self.setToggleButtonsInitialSettings();
}

infChart.volumeProfileDrawing.prototype.drawVolumeProfileBars = function (renderer, volumeProfileWidth, volumeProfileHeight, yValuePixels) {
    var self = this,
        ann = self.annotation,
        options = ann.options,
        settings = options.settings,
        chart = ann.chart,
        xAxis = chart.xAxis[options.xAxis],
        yAxis = chart.yAxis[options.yAxis];

    var barPixelHeight = volumeProfileHeight / settings.barCount,
        upBarPixelWidth, downBarPixelWidth, barDataObj,
        barStartYPosition, upFillColor, upFillOpacity, downFillColor, downFillOpacity, isValueAreaBar;

    self.additionalDrawings.upBars = {};
    self.additionalDrawings.downBars = {};
    // self.additionalDrawings.deltaBars = {};

    Object.keys(options.calculatedBars.bars).forEach(function (barId) {
        barDataObj = options.calculatedBars.bars[barId];
        upBarPixelWidth = volumeProfileWidth * (settings.volumeProfile.profileWidth / 100) * ((settings.volume === self.volumeTypes.total.id ? barDataObj.total : barDataObj.up) / options.calculatedBars.pocBar.total);
        barStartYPosition = yAxis.toPixels(infChart.drawingUtils.common.getYValue.call(self, barDataObj.rangeMax)) - yValuePixels + (barDataObj.rangeMax !== options.priceRange.max ? 1 : 0);
        isValueAreaBar = options.calculatedBars.valueAreaBars.bars[barId];
        upFillColor = isValueAreaBar ? settings.volumeProfile.volumeAreaUpColor : settings.volumeProfile.upVolumeColor;
        upFillOpacity = isValueAreaBar ? settings.volumeProfile.volumeAreaUpOpacity : settings.volumeProfile.upVolumeOpacity;

        self.additionalDrawings.upBars[barId] = renderer.rect(0, barStartYPosition, upBarPixelWidth, barPixelHeight).attr({
            fill: upFillColor,
            'stroke-width': 0,
            'fill-opacity': upFillOpacity,
            isValueAreaBar: isValueAreaBar
        }).add();

        if (settings.volume === self.volumeTypes.upDown.id) {
            downBarPixelWidth = volumeProfileWidth * (settings.volumeProfile.profileWidth / 100) * (barDataObj.down / options.calculatedBars.pocBar.total);
            downFillColor = isValueAreaBar ? settings.volumeProfile.volumeAreaDownColor : settings.volumeProfile.downVolumeColor;
            downFillOpacity = isValueAreaBar ? settings.volumeProfile.volumeAreaDownOpacity : settings.volumeProfile.downVolumeOpacity;

            self.additionalDrawings.downBars[barId] = renderer.rect(upBarPixelWidth, barStartYPosition, downBarPixelWidth, barPixelHeight).attr({
                fill: downFillColor,
                'stroke-width': 0,
                'fill-opacity': downFillOpacity,
                isValueAreaBar: isValueAreaBar
            }).add();
        }
    });

    self.drawReferenceLines(renderer, volumeProfileWidth, volumeProfileHeight, barPixelHeight, yValuePixels);
}

infChart.volumeProfileDrawing.prototype.drawReferenceLines = function (renderer, volumeProfileWidth, volumeProfileHeight, barPixelHeight, yValuePixels) {
    var self = this,
        ann = self.annotation,
        options = ann.options,
        settings = options.settings,
        chart = ann.chart,
        xAxis = chart.xAxis[options.xAxis],
        yAxis = chart.yAxis[options.yAxis];

    var pocBarStartPosition = yAxis.toPixels(options.calculatedBars.pocBar.rangeMax) - yValuePixels + (options.calculatedBars.pocBar.rangeMax !== options.priceRange.max ? 1 : 0);
    var pocLineYPosition = pocBarStartPosition + barPixelHeight / 2;

    self.additionalDrawings.pointOfControl = renderer.path(['M', 0, pocLineYPosition, 'L', volumeProfileWidth, pocLineYPosition]).attr({
        stroke: settings.pointOfControl.color,
        'stroke-width': settings.pointOfControl.lineWidth,
        dashstyle: settings.pointOfControl.lineStyle
    }).add();

    var maxBarObj = options.calculatedBars.bars[options.calculatedBars.valueAreaBars.maxBarId];
    var vAHBarStartPosition = yAxis.toPixels(maxBarObj.rangeMax) - yValuePixels + (maxBarObj.rangeMax !== options.priceRange.max ? 1 : 0);

    self.additionalDrawings.valueAreaHigh = renderer.path(['M', 0, vAHBarStartPosition, 'L', volumeProfileWidth, vAHBarStartPosition]).attr({
        stroke: settings.valueAreaHigh.color,
        'stroke-width': settings.valueAreaHigh.lineWidth,
        dashstyle: settings.valueAreaHigh.lineStyle
    }).add();

    var minBarObj = options.calculatedBars.bars[options.calculatedBars.valueAreaBars.minBarId];
    var vALBarStartPosition = yAxis.toPixels(minBarObj.rangeMax) - yValuePixels + (minBarObj.rangeMax !== options.priceRange.max ? 1 : 0);
    var vALLineYPosition = vALBarStartPosition + barPixelHeight;

    self.additionalDrawings.valueAreaLow = renderer.path(['M', 0, vALLineYPosition, 'L', volumeProfileWidth, vALLineYPosition]).attr({
        stroke: settings.valueAreaLow.color,
        'stroke-width': settings.valueAreaLow.lineWidth,
        dashstyle: settings.valueAreaLow.lineStyle
    }).add();
}

infChart.volumeProfileDrawing.prototype.setToggleButtonsInitialSettings = function () {
    var self = this,
        ann = self.annotation,
        options = ann.options,
        settings = options.settings;

    if (settings.volumeProfile.enabled) {
        this.onToggleVolumeProfile(true, false);
    } else {
        this.onToggleVolumeProfile(false, false);
    }

    if (settings.pointOfControl.enabled) {
        this.additionalDrawings.pointOfControl.show();
    } else {
        this.additionalDrawings.pointOfControl.hide();
    }

    if (settings.valueAreaHigh.enabled) {
        this.additionalDrawings.valueAreaHigh.show();
    } else {
        this.additionalDrawings.valueAreaHigh.hide();
    }

    if (settings.valueAreaLow.enabled) {
        this.additionalDrawings.valueAreaLow.show();
    } else {
        this.additionalDrawings.valueAreaLow.hide();
    }
}

infChart.volumeProfileDrawing.prototype.convertAndSetVolumeProfileImage = function (volumeProfileElement) {
    var labelHtml = '<div style="height: 100%"></div>';
    this.additionalDrawings.volumeProfile.element.innerHTML = labelHtml;
    var svgElement = volumeProfileElement.getElementsByTagName('svg')[0];
    svgElement.setAttribute("preserveAspectRatio", "none");
    this.additionalDrawings.volumeProfile.element.getElementsByTagName('div')[0].appendChild(svgElement);
}

//endregion

//region Select and bind resize

infChart.volumeProfileDrawing.prototype.deselect = function (isMouseOut) {
    infChart.drawingUtils.common.onDeselect.call(this);
};

infChart.volumeProfileDrawing.prototype.selectAndBindResize = function () {
    var ann = this.annotation,
        pathDefinition = ann.shape.d.split(' ');

    ann.events.deselect.call(ann);
    ann.selectionMarker = [];

    infChart.drawingUtils.common.addAndBindSelectionMarker.call(this, ann, parseFloat(pathDefinition[1]), parseFloat(pathDefinition[2]), this.stepFunction, this.stop, true);
    infChart.drawingUtils.common.addAndBindSelectionMarker.call(this, ann, parseFloat(pathDefinition[4]), parseFloat(pathDefinition[5]), this.stepFunction, this.stop, false);
};

//endregion

//region Settings

infChart.volumeProfileDrawing.prototype.getSettingsPopup = function () {
    return infChart.structureManager.drawingTools.getVolumeProfileSettings(this.volumeTypes, this.annotation.options.settings);
};

/**
 * Update the annotations options specific to this tool from the given properties
 * @param options
 */
// infChart.volumeProfileDrawing.prototype.updateOptions = function (options) {
//     var ann = this.annotation;
//     ann && ann.options && (ann.options.nearestXDataPoint = infChart.math.findNearestXDataPoint(ann.chart, options.xValue));
//     if (options.settings && options.settings.stopLoss) {
//         ann.options.settings.stopLoss = options.settings.stopLoss;
//     }
//     if (options.settings && options.settings.takeProfit) {
//         ann.options.settings.takeProfit = options.settings.takeProfit;
//     }
// };

infChart.volumeProfileDrawing.prototype.updateSettings = function (properties) {
    infChart.structureManager.drawingTools.updateVolumeProfileSettings($(this.settingsPopup), this.volumeTypes, properties.settings);
};

infChart.volumeProfileDrawing.prototype.bindSettingsEvents = function () {
    var self = this,
        ann = self.annotation;

    function getIsPropertyChange() {
        var isPropertyChange = true;
        if (self.settingsPopup) {
            isPropertyChange = self.isSettingsPropertyChange();
        }

        return isPropertyChange;
    }

    function onVolumeTypeChange(valueAreaVolume) {
        self.onVolumeTypeChange.call(self, valueAreaVolume, getIsPropertyChange());
    }

    function onValueAreaVolumeChange(valueAreaVolume) {
        self.onValueAreaVolumeChange.call(self, valueAreaVolume, getIsPropertyChange());
    }

    function onBarCountChange(barCount) {
        self.onBarCountChange.call(self, barCount, getIsPropertyChange());
    }

    function onProfileWidthChange(profileWidth) {
        self.onProfileWidthChange.call(self, profileWidth, getIsPropertyChange());
    }

    function onUpVolumeColorChange(rgb, value, opacity) {
        self.onUpVolumeColorChange.call(self, value, opacity, getIsPropertyChange());
    }

    function onDownVolumeColorChange(rgb, value, opacity) {
        self.onDownVolumeColorChange.call(self, value, opacity, getIsPropertyChange());
    }

    function onVolumeAreaUpColorChange(rgb, value, opacity) {
        self.onVolumeAreaUpColorChange.call(self, value, opacity, getIsPropertyChange());
    }

    function onVolumeAreaDownColorChange(rgb, value, opacity) {
        self.onVolumeAreaDownColorChange.call(self, value, opacity, getIsPropertyChange());
    }

    function onValueAreaHighColorChange(rgb, value, opacity) {
        self.onValueAreaHighColorChange.call(self, value, opacity, getIsPropertyChange());
    }

    function onValueAreaLowColorChange(rgb, value, opacity) {
        self.onValueAreaLowColorChange.call(self, value, opacity, getIsPropertyChange());
    }

    function onPointOfControlColorChange(rgb, value, opacity) {
        self.onPointOfControlColorChange.call(self, value, opacity, getIsPropertyChange());
    }

    function onValuesColorChange(rgb, value, opacity) {
        self.onValuesColorChange.call(self, value, opacity, getIsPropertyChange());
    }

    function onHistogramBoxColorChange(rgb, value, opacity) {
        self.onHistogramBoxColorChange.call(self, value, opacity, getIsPropertyChange());
    }

    function onValueAreaHighLineWidthChange(lineWidth) {
        self.onValueAreaHighLineWidthChange.call(self, lineWidth, getIsPropertyChange());
    }

    function onValueAreaHighLineStyleChange(lineStyle) {
        self.onValueAreaHighLineStyleChange.call(self, lineStyle, getIsPropertyChange());
    }

    function onValueAreaLowLineWidthChange(lineWidth) {
        self.onValueAreaLowLineWidthChange.call(self, lineWidth, getIsPropertyChange());
    }

    function onValueAreaLowLineStyleChange(lineStyle) {
        self.onValueAreaLowLineStyleChange.call(self, lineStyle, getIsPropertyChange());
    }

    function onPointOfControlLineWidthChange(lineWidth) {
        self.onPointOfControlLineWidthChange.call(self, lineWidth, getIsPropertyChange());
    }

    function onPointOfControlLineStyleChange(lineStyle) {
        self.onPointOfControlLineStyleChange.call(self, lineStyle, getIsPropertyChange());
    }

    function onToggleVolumeProfile(isEnabled) {
        self.onToggleVolumeProfile.call(self, isEnabled, getIsPropertyChange());
    }

    function onToggleFlipChart(isEnabled) {
        self.onToggleFlipChart.call(self, isEnabled, getIsPropertyChange());
    }

    function onToggleValueAreaHigh(isEnabled) {
        self.onToggleValueAreaHigh.call(self, isEnabled, getIsPropertyChange());
    }

    function onToggleValueAreaLow(isEnabled) {
        self.onToggleValueAreaLow.call(self, isEnabled, getIsPropertyChange());
    }

    function onTogglePointOfControl(isEnabled) {
        self.onTogglePointOfControl.call(self, isEnabled, getIsPropertyChange());
    }

    function onResetToDefault() {
        self.updateSavedDrawingProperties(true);
    }

    infChart.structureManager.drawingTools.bindVolumeProfileSettings(self.settingsPopup, {
        onVolumeTypeChange: onVolumeTypeChange,
        onValueAreaVolumeChange: onValueAreaVolumeChange,
        onBarCountChange: onBarCountChange,
        onProfileWidthChange: onProfileWidthChange,
        onUpVolumeColorChange: onUpVolumeColorChange,
        onDownVolumeColorChange: onDownVolumeColorChange,
        onVolumeAreaUpColorChange: onVolumeAreaUpColorChange,
        onVolumeAreaDownColorChange: onVolumeAreaDownColorChange,
        onValueAreaHighColorChange: onValueAreaHighColorChange,
        onValueAreaLowColorChange: onValueAreaLowColorChange,
        onPointOfControlColorChange: onPointOfControlColorChange,
        onValuesColorChange: onValuesColorChange,
        onHistogramBoxColorChange: onHistogramBoxColorChange,
        onValueAreaHighLineWidthChange: onValueAreaHighLineWidthChange,
        onValueAreaHighLineStyleChange: onValueAreaHighLineStyleChange,
        onValueAreaLowLineWidthChange: onValueAreaLowLineWidthChange,
        onValueAreaLowLineStyleChange: onValueAreaLowLineStyleChange,
        onPointOfControlLineWidthChange: onPointOfControlLineWidthChange,
        onPointOfControlLineStyleChange: onPointOfControlLineStyleChange,
        onToggleVolumeProfile: onToggleVolumeProfile,
        onToggleFlipChart: onToggleFlipChart,
        onToggleValueAreaHigh: onToggleValueAreaHigh,
        onToggleValueAreaLow: onToggleValueAreaLow,
        onTogglePointOfControl: onTogglePointOfControl,
        onResetToDefault: onResetToDefault
    });
};

infChart.volumeProfileDrawing.prototype.onVolumeTypeChange = function (volumeType, isPropertyChange) {
    this.annotation.options.settings.volume = volumeType;
    this.drawVolumeProfile();

    isPropertyChange && this.onPropertyChange();

    if (this.settingsPopup) {
        this.settingsPopup.data("infUndoRedo", false);
    }
    infChart.drawingUtils.common.saveDrawingProperties.call(this);
}

infChart.volumeProfileDrawing.prototype.onToggleVolumeProfile = function (isEnabled, isPropertyChange) {
    var self = this;
    self.annotation.options.settings.volumeProfile.enabled = isEnabled;

    var upBar, downBar;

    if (self.additionalDrawings.upBars) {
        Object.keys(self.additionalDrawings.upBars).forEach(function (barId) {
            upBar = self.additionalDrawings.upBars[barId];

            if (isEnabled) {
                upBar.show();
            } else {
                upBar.hide();
            }
        });
    }

    if (self.additionalDrawings.downBars) {
        Object.keys(self.additionalDrawings.downBars).forEach(function (barId) {
            downBar = self.additionalDrawings.downBars[barId];

            if (isEnabled) {
                downBar.show();
            } else {
                downBar.hide();
            }
        });
    }

    isPropertyChange && this.onPropertyChange();

    if (this.settingsPopup) {
        this.settingsPopup.data("infUndoRedo", false);
    }
    infChart.drawingUtils.common.saveDrawingProperties.call(this);
};

infChart.volumeProfileDrawing.prototype.onValueAreaVolumeChange = function (valueAreaVolume, isPropertyChange) {
    this.annotation.options.settings.valueAreaVolume = valueAreaVolume;
    this.calculateValueAreaVolumeBars();
    this.drawVolumeProfile();

    isPropertyChange && this.onPropertyChange();

    if (this.settingsPopup) {
        this.settingsPopup.data("infUndoRedo", false);
    }
    infChart.drawingUtils.common.saveDrawingProperties.call(this);
}

infChart.volumeProfileDrawing.prototype.onBarCountChange = function (barCount, isPropertyChange) {
    this.annotation.options.settings.barCount = barCount;
    this.calculateBars(this.annotation.options.currentDataSet);

    if (this.annotation.options.calculatedBars.totalVolume > 0) {
        this.calculateValueAreaVolumeBars();
        this.drawVolumeProfile();
    } else {
        this.annotation.shape.show();
        this.additionalDrawings.volumeProfile.css({
            display: 'none'
        });
        this.additionalDrawings.startLine.show();
        this.additionalDrawings.endLine.show();
    }

    isPropertyChange && this.onPropertyChange();

    if (this.settingsPopup) {
        this.settingsPopup.data("infUndoRedo", false);
    }
    infChart.drawingUtils.common.saveDrawingProperties.call(this);
}

infChart.volumeProfileDrawing.prototype.onProfileWidthChange = function (profileWidth, isPropertyChange) {
    this.annotation.options.settings.volumeProfile.profileWidth = profileWidth;
    this.drawVolumeProfile();

    isPropertyChange && this.onPropertyChange();

    if (this.settingsPopup) {
        this.settingsPopup.data("infUndoRedo", false);
    }
    infChart.drawingUtils.common.saveDrawingProperties.call(this);
}

infChart.volumeProfileDrawing.prototype.onUpVolumeColorChange = function (value, opacity, isPropertyChange) {
    var self = this,
        upBar;

    self.annotation.options.settings.volumeProfile.upVolumeColor = value;
    self.annotation.options.settings.volumeProfile.upVolumeOpacity = opacity;

    if (self.additionalDrawings.upBars) {
        Object.keys(self.additionalDrawings.upBars).forEach(function (barId) {
            upBar = self.additionalDrawings.upBars[barId];

            if (upBar && upBar.attr("isValueAreaBar") !== 'true') {
                upBar.attr({
                    fill: value,
                    'fill-opacity': opacity
                });
            }
        });
    }

    isPropertyChange && this.onPropertyChange();

    if (this.settingsPopup) {
        this.settingsPopup.data("infUndoRedo", false);
    }
    infChart.drawingUtils.common.saveDrawingProperties.call(this);
}

infChart.volumeProfileDrawing.prototype.onDownVolumeColorChange = function (value, opacity, isPropertyChange) {
    var self = this,
        downBar;

    self.annotation.options.settings.volumeProfile.downVolumeColor = value;
    self.annotation.options.settings.volumeProfile.downVolumeOpacity = opacity;

    if (self.additionalDrawings.downBars) {
        Object.keys(self.additionalDrawings.downBars).forEach(function (barId) {
            downBar = self.additionalDrawings.downBars[barId];

            if (downBar && downBar.attr("isValueAreaBar") !== 'true') {
                downBar.attr({
                    fill: value,
                    'fill-opacity': opacity
                });
            }
        });
    }

    isPropertyChange && this.onPropertyChange();

    if (this.settingsPopup) {
        this.settingsPopup.data("infUndoRedo", false);
    }
    infChart.drawingUtils.common.saveDrawingProperties.call(this);
}

infChart.volumeProfileDrawing.prototype.onVolumeAreaUpColorChange = function (value, opacity, isPropertyChange) {
    var self = this,
        bar;

    self.annotation.options.settings.volumeProfile.volumeAreaUpColor = value;
    self.annotation.options.settings.volumeProfile.volumeAreaUpOpacity = opacity;

    if (self.annotation.options.calculatedBars && self.annotation.options.calculatedBars.valueAreaBars) {
        Object.keys(self.annotation.options.calculatedBars.valueAreaBars.bars).forEach(function (barId) {
            bar = self.additionalDrawings.upBars[barId];

            if (bar) {
                bar.attr({
                    fill: value,
                    'fill-opacity': opacity
                });
            }
        });
    }

    isPropertyChange && this.onPropertyChange();

    if (this.settingsPopup) {
        this.settingsPopup.data("infUndoRedo", false);
    }
    infChart.drawingUtils.common.saveDrawingProperties.call(this);
}

infChart.volumeProfileDrawing.prototype.onVolumeAreaDownColorChange = function (value, opacity, isPropertyChange) {
    var self = this,
        bar;

    self.annotation.options.settings.volumeProfile.volumeAreaDownColor = value;
    self.annotation.options.settings.volumeProfile.volumeAreaDownOpacity = opacity;

    if (self.annotation.options.calculatedBars && self.annotation.options.calculatedBars.valueAreaBars) {
        Object.keys(self.annotation.options.calculatedBars.valueAreaBars.bars).forEach(function (barId) {
            bar = self.additionalDrawings.downBars[barId];

            if (bar) {
                bar.attr({
                    fill: value,
                    'fill-opacity': opacity
                });
            }
        });
    }

    isPropertyChange && this.onPropertyChange();

    if (this.settingsPopup) {
        this.settingsPopup.data("infUndoRedo", false);
    }
    infChart.drawingUtils.common.saveDrawingProperties.call(this);
}

infChart.volumeProfileDrawing.prototype.onToggleValueAreaHigh = function (isEnabled, isPropertyChange) {
    this.annotation.options.settings.valueAreaHigh.enabled = isEnabled;

    if (this.additionalDrawings.valueAreaHigh) {
        if (isEnabled) {
            this.additionalDrawings.valueAreaHigh.show();
        } else {
            this.additionalDrawings.valueAreaHigh.hide();
        }
    }

    isPropertyChange && this.onPropertyChange();

    if (this.settingsPopup) {
        this.settingsPopup.data("infUndoRedo", false);
    }
    infChart.drawingUtils.common.saveDrawingProperties.call(this);
};

infChart.volumeProfileDrawing.prototype.onValueAreaHighColorChange = function (value, opacity, isPropertyChange) {
    this.annotation.options.settings.valueAreaHigh.color = value;
    this.annotation.options.settings.valueAreaHigh.opacity = opacity;

    if (this.additionalDrawings.valueAreaHigh) {
        this.additionalDrawings.valueAreaHigh.attr({
            stroke: value,
            opacity: opacity
        });
    }

    isPropertyChange && this.onPropertyChange();

    if (this.settingsPopup) {
        this.settingsPopup.data("infUndoRedo", false);
    }
    infChart.drawingUtils.common.saveDrawingProperties.call(this);

}

infChart.volumeProfileDrawing.prototype.onValueAreaHighLineWidthChange = function (lineWidth, isPropertyChange) {
    this.annotation.options.settings.valueAreaHigh.lineWidth = lineWidth;

    if (this.additionalDrawings.valueAreaHigh) {
        this.additionalDrawings.valueAreaHigh.attr({
            'stroke-width': lineWidth
        });
    }

    isPropertyChange && this.onPropertyChange();

    if (this.settingsPopup) {
        this.settingsPopup.data("infUndoRedo", false);
    }
    infChart.drawingUtils.common.saveDrawingProperties.call(this);
}

infChart.volumeProfileDrawing.prototype.onValueAreaHighLineStyleChange = function (lineStyle, isPropertyChange) {
    this.annotation.options.settings.valueAreaHigh.lineStyle = lineStyle;

    if (this.additionalDrawings.valueAreaHigh) {
        this.additionalDrawings.valueAreaHigh.attr({
            dashstyle: lineStyle
        });
    }

    isPropertyChange && this.onPropertyChange();

    if (this.settingsPopup) {
        this.settingsPopup.data("infUndoRedo", false);
    }
    infChart.drawingUtils.common.saveDrawingProperties.call(this);
}

infChart.volumeProfileDrawing.prototype.onToggleValueAreaLow = function (isEnabled, isPropertyChange) {
    this.annotation.options.settings.valueAreaLow.enabled = isEnabled;

    if (this.additionalDrawings.valueAreaLow) {
        if (isEnabled) {
            this.additionalDrawings.valueAreaLow.show();
        } else {
            this.additionalDrawings.valueAreaLow.hide();
        }
    }

    isPropertyChange && this.onPropertyChange();

    if (this.settingsPopup) {
        this.settingsPopup.data("infUndoRedo", false);
    }
    infChart.drawingUtils.common.saveDrawingProperties.call(this);
};

infChart.volumeProfileDrawing.prototype.onValueAreaLowColorChange = function (value, opacity, isPropertyChange) {
    this.annotation.options.settings.valueAreaLow.color = value;
    this.annotation.options.settings.valueAreaLow.opacity = opacity;

    if (this.additionalDrawings.valueAreaLow) {
        this.additionalDrawings.valueAreaLow.attr({
            stroke: value,
            opacity: opacity
        });
    }

    isPropertyChange && this.onPropertyChange();

    if (this.settingsPopup) {
        this.settingsPopup.data("infUndoRedo", false);
    }
    infChart.drawingUtils.common.saveDrawingProperties.call(this);
}

infChart.volumeProfileDrawing.prototype.onValueAreaLowLineWidthChange = function (lineWidth, isPropertyChange) {
    this.annotation.options.settings.valueAreaLow.lineWidth = lineWidth;

    if (this.additionalDrawings.valueAreaLow) {
        this.additionalDrawings.valueAreaLow.attr({
            'stroke-width': lineWidth
        });
    }

    isPropertyChange && this.onPropertyChange();

    if (this.settingsPopup) {
        this.settingsPopup.data("infUndoRedo", false);
    }
    infChart.drawingUtils.common.saveDrawingProperties.call(this);
}

infChart.volumeProfileDrawing.prototype.onValueAreaLowLineStyleChange = function (lineStyle, isPropertyChange) {
    this.annotation.options.settings.valueAreaLow.lineStyle = lineStyle;

    if (this.additionalDrawings.valueAreaLow) {
        this.additionalDrawings.valueAreaLow.attr({
            dashstyle: lineStyle
        });
    }

    isPropertyChange && this.onPropertyChange();

    if (this.settingsPopup) {
        this.settingsPopup.data("infUndoRedo", false);
    }
    infChart.drawingUtils.common.saveDrawingProperties.call(this);
}

infChart.volumeProfileDrawing.prototype.onTogglePointOfControl = function (isEnabled, isPropertyChange) {
    this.annotation.options.settings.pointOfControl.enabled = isEnabled;

    if (this.additionalDrawings.pointOfControl) {
        if (isEnabled) {
            this.additionalDrawings.pointOfControl.show();
        } else {
            this.additionalDrawings.pointOfControl.hide();
        }
    }

    isPropertyChange && this.onPropertyChange();

    if (this.settingsPopup) {
        this.settingsPopup.data("infUndoRedo", false);
    }
    infChart.drawingUtils.common.saveDrawingProperties.call(this);
};

infChart.volumeProfileDrawing.prototype.onPointOfControlColorChange = function (value, opacity, isPropertyChange) {
    this.annotation.options.settings.pointOfControl.color = value;
    this.annotation.options.settings.pointOfControl.opacity = opacity;

    if (this.additionalDrawings.pointOfControl) {
        this.additionalDrawings.pointOfControl.attr({
            stroke: value,
            opacity: opacity
        });
    }

    isPropertyChange && this.onPropertyChange();

    if (this.settingsPopup) {
        this.settingsPopup.data("infUndoRedo", false);
    }
    infChart.drawingUtils.common.saveDrawingProperties.call(this);
}

infChart.volumeProfileDrawing.prototype.onPointOfControlLineWidthChange = function (lineWidth, isPropertyChange) {
    this.annotation.options.settings.pointOfControl.lineWidth = lineWidth;

    if (this.additionalDrawings.pointOfControl) {
        this.additionalDrawings.pointOfControl.attr({
            'stroke-width': lineWidth
        });
    }

    isPropertyChange && this.onPropertyChange();

    if (this.settingsPopup) {
        this.settingsPopup.data("infUndoRedo", false);
    }
    infChart.drawingUtils.common.saveDrawingProperties.call(this);
}

infChart.volumeProfileDrawing.prototype.onPointOfControlLineStyleChange = function (lineStyle, isPropertyChange) {
    this.annotation.options.settings.pointOfControl.lineStyle = lineStyle;

    if (this.additionalDrawings.pointOfControl) {
        this.additionalDrawings.pointOfControl.attr({
            dashstyle: lineStyle
        });
    }

    isPropertyChange && this.onPropertyChange();

    if (this.settingsPopup) {
        this.settingsPopup.data("infUndoRedo", false);
    }
    infChart.drawingUtils.common.saveDrawingProperties.call(this);
}

infChart.volumeProfileDrawing.prototype.onValuesColorChange = function (value, opacity, isPropertyChange) {
    this.annotation.options.settings.values.color = value;
    this.annotation.options.settings.values.opacity = opacity;

    //TODO change values color

    isPropertyChange && this.onPropertyChange();

    if (this.settingsPopup) {
        this.settingsPopup.data("infUndoRedo", false);
    }
    infChart.drawingUtils.common.saveDrawingProperties.call(this);
}

infChart.volumeProfileDrawing.prototype.onHistogramBoxColorChange = function (value, opacity, isPropertyChange) {
    this.annotation.options.settings.histogramBox.color = value;
    this.annotation.options.settings.histogramBox.opacity = opacity;

    if (this.additionalDrawings.histogramBox) {
        this.additionalDrawings.histogramBox.attr({
            fill: value,
            'fill-opacity': opacity
        });
    }

    isPropertyChange && this.onPropertyChange();

    if (this.settingsPopup) {
        this.settingsPopup.data("infUndoRedo", false);
    }
    infChart.drawingUtils.common.saveDrawingProperties.call(this);
}

infChart.volumeProfileDrawing.prototype.onToggleFlipChart = function (isEnabled, isPropertyChange) {
    this.annotation.options.settings.volumeProfile.flipChart = isEnabled;

    //TODO implement flip chart

    isPropertyChange && this.onPropertyChange();

    if (this.settingsPopup) {
        this.settingsPopup.data("infUndoRedo", false);
    }
    infChart.drawingUtils.common.saveDrawingProperties.call(this);
};

infChart.volumeProfileDrawing.prototype.specificCursorChange = function(url){
    var self = this,
        ann = self.annotation,
        options = ann.options,
        additionalDrawings = self.additionalDrawings;
    
    if(additionalDrawings.volumeProfile){
        var volumeProfile = additionalDrawings.volumeProfile;
        if(url){
            volumeProfile.css({'cursor': 'url("' + url + '"), default'});
        } else {
            infChart.util.setCursor(volumeProfile, 'move');
            volumeProfile.css({'cursor': 'move'});
        }
    }
};

//endregion


