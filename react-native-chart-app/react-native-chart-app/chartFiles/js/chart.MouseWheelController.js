infChart.MouseWheelController = function (highChartInstance) {
    this.chart = highChartInstance;
    this.container = highChartInstance.container;
    this.zoomPosMin = 100;
    this.zoomPosMax = 0;
    this.zoomMidPoint = 50;
    this.tickSize = .01; //TODO - need to pass this value as a setting
    this.linearXTickSize = .01;
    this.tickSizeY = .01;
    this.chartMin = 0;
    this.chartMax = 0;
    this.mouseWheelDirection = {
        horizontal: "h",
        vertical: "v"
    }
};

infChart.MouseWheelController.prototype.initialize = function () {
    var self = this,
        chart = self.chart,
        chartZoomingTimeout;
    if (!infChart.settings.config.isMobile) {
        $(self.container).bind('wheel', function (event) {
            event.preventDefault();
            if (chartZoomingTimeout) {
                clearTimeout(chartZoomingTimeout);
            }

            chartZoomingTimeout = setTimeout(function () {
                self.onMouseWheel.call(self, event);
            }, 0);
        });
    } else {
        var mc = new Hammer.Manager(self.container);
        mc.add(new Hammer.Pinch({event: "pinch", pointers: 2, threshold: 0}));
        mc.on("pinch", function (event) {
            if (chartZoomingTimeout) {
                console.debug("Zooming :: pinch clearTimeout");
                clearTimeout(chartZoomingTimeout);
            }
            chartZoomingTimeout = setTimeout(function () {
                event.layerX = event.center.x;
                event.layerY = event.center.y;
                self.onMouseWheel.call(self, event);
                console.debug("Zooming :: pinch ", event);
            }, 0);
        });
    }
};

infChart.MouseWheelController.prototype.cursorToScrollbarPosition = function(chart, chartX) {
    var scroller = chart.scrollbar,
        options = scroller.options,
        minWidthDifference = options.minWidth > scroller.calculatedWidth ? options.minWidth : 0; // minWidth distorts translation

    return (chartX - scroller.x - scroller.xOffset) / (scroller.barWidth - minWidthDifference);
};

infChart.MouseWheelController.prototype.xAxisHorizontalScrollEventHandler = function (originalEvent, deltaX) {
    var self = this,
        chart = self.chart,
        scroller = chart.scrollbar,
        normalizedEvent = scroller.chart.pointer.normalize(originalEvent),
        scrollStartChartX = normalizedEvent.chartX,
        mousePosition = self.cursorToScrollbarPosition(chart, scrollStartChartX);

    scroller.chartX = mousePosition;
    // scroller.chartY = mousePosition.chartY;
    scroller.initPositions = [scroller.from, scroller.to];

    var scrollPosition,
        chartPosition,
        change,
        direction = 'chartX',
        newChartX = scrollStartChartX - self.calculateWheelDeltaFactor(deltaX, self.mouseWheelDirection.horizontal);

    // In iOS, a mousemove event with e.pageX === 0 is fired when holding the finger
    // down in the center of the scrollbar. This should be ignored.
    if ((!normalizedEvent.touches || normalizedEvent.touches[0][direction] !== 0)) { // #4696, scrollbar failed on Android
        chartPosition = self.cursorToScrollbarPosition(chart, newChartX);
        scrollPosition = scroller[direction];

        change = chartPosition - scrollPosition;

        //scroller.hasDragged = true;
        scroller.updatePosition(scroller.initPositions[0] + change, scroller.initPositions[1] + change);

        //if (scroller.hasDragged) {
            Highcharts.fireEvent(scroller, 'changed', {
                from: scroller.from,
                to: scroller.to,
                trigger: 'scrollbar',
                DOMType: normalizedEvent.type,
                DOMEvent: normalizedEvent
            });
        //}
    }
}

infChart.MouseWheelController.prototype.calculateWheelDeltaFactor = function (delta, direction) {
    var self = this,
        calculatedDelta, dividingFactor, absDelta = Math.abs(delta);
    switch (direction) {
        case self.mouseWheelDirection.vertical:
            dividingFactor = window.navigator.userAgent.toLowerCase().indexOf("chrome") !== -1 ? 20 : 5;
            calculatedDelta = absDelta / dividingFactor < 100 ? absDelta / dividingFactor : 100;
            calculatedDelta = calculatedDelta < 5 ? 5 : calculatedDelta;
            break;
        case self.mouseWheelDirection.horizontal:
            dividingFactor = window.navigator.userAgent.toLowerCase().indexOf("chrome") !== -1 ? 15 : 5;
            calculatedDelta = absDelta / dividingFactor <= 50 ? absDelta / dividingFactor : 50;
            break;
    }

    return delta < 0 ? -1 * calculatedDelta : calculatedDelta;
}

/**
 * Hide marker when mousewheel action fires
 * @private
 */
infChart.MouseWheelController.prototype._hideTracker = function () {
    var self = this, chart = self.chart;
    $(chart.renderTo).find(".highcharts-markers.highcharts-tracker").hide();
    chart.infTrackerHidden = true;
};
/**
 * Get executes on mousewheel action
 * @param {Event} e event object
 */
infChart.MouseWheelController.prototype.onMouseWheel = function (e) {
    var self = this, chart = self.chart;
    // Since firefox has the pageX only inside the originalEvent, originalEvent is taken into account always.
    var originalEvent = e.originalEvent || e;
    chart.pointer.normalize(originalEvent);

    this._hideTracker();

    var xAxis = chart.xAxis && chart.xAxis[0],
        isXZoom = (originalEvent.chartX ? originalEvent.chartX : originalEvent.layerX) < (xAxis.left + xAxis.width),
        deltaX = originalEvent.wheelDeltaX,
        deltaY = originalEvent.wheelDeltaY;

    if(isXZoom && Math.abs(deltaX) > Math.abs(deltaY)) {
        self.xAxisHorizontalScrollEventHandler.call(self, originalEvent, deltaX);
    } else {
        var axis = isXZoom ? xAxis : chart.yAxis && chart.yAxis[0],
            extremes = axis.getExtremes(),
            actualExRange = extremes.dataMax - extremes.dataMin,
            actualSeriesExtremes = !isXZoom && infChart.manager.getSeriesActualExtremes(chart.renderTo.id, chart.series[0].options.id),
            exDataMin = actualSeriesExtremes && actualSeriesExtremes.dataMin || extremes.dataMin,
            exDataMax = actualSeriesExtremes && actualSeriesExtremes.dataMax || extremes.dataMax,
            actualRange = !isXZoom && actualSeriesExtremes ? actualSeriesExtremes.dataMax - actualSeriesExtremes.dataMin : exDataMax - exDataMin,
            min = extremes.min,
            max = extremes.max,
            dataMin = isXZoom ? extremes.dataMin : exDataMin - actualRange,
            dataMax = isXZoom ? extremes.dataMax : exDataMax + actualRange,
            delta = originalEvent.detail ? originalEvent.detail * (-1) : deltaY / 120,
            timeLineChange,
            midPoint = originalEvent && originalEvent.target.point,
            midTime,
            totalTimeChange,
            currentRange = max - min,
            newRange,
            newMin,
            newMax,
            difference = dataMax - dataMin,
            infMouseMoved = chart.infMouseMoved,
            isLinearAxis = infChart.manager.isLinearData(chart),
            tickSize = isXZoom ? isLinearAxis ? self.linearXTickSize : self.tickSize : self.tickSizeY,
            midTimeIndex,
            totalPoints = self._getTotalPoints(),
            totalPointsLen = totalPoints.length,
            currentMinIndex = self._getIndexOfTime(min),
            currentMaxIndex = self._getIndexOfTime(max),
            currentRangePointsLen = currentMaxIndex - currentMinIndex,
            minZoomIndexChange = 5,
            doZoom = false,
            newRangeLen,
            minAdditional = 0,
            maxAdditional = 0,
            minIndexCorrection,
            maxIndexCorrection,
            midAdditional,
            midIndexCorrection;

        if (infChart.settings.config.isMobile && !isXZoom) {
            return;
        }

        if (!delta) {
            const isPositive = originalEvent.additionalEvent === 'pinchout' ? 1 : -1;
            delta = originalEvent.scale * isPositive;
        }

        if (!midPoint) {
            chart.pointer.normalize(originalEvent);
            if (e.center) {
                originalEvent.chartX = e.center.x;
                originalEvent.chartY = e.center.y;
            }
            midTime = isXZoom ? axis.toValue(originalEvent.chartX) : axis.toValue(originalEvent.chartY);
        } else {
            midTime = isXZoom ? midPoint.x : midPoint.y;
        }

        self.isXZoom = isXZoom;
        self.midTime = infMouseMoved ? midTime : self.midTime || midTime;
        midTimeIndex = Math.min(Math.max(currentMinIndex, self._getIndexOfTime(midTime)), currentMaxIndex);

        if (isXZoom && !isLinearAxis) {
            var currentMaxIndexTime = +totalPoints[currentMaxIndex];
            var currentMinIndexTime = +totalPoints[currentMinIndex];
            var currentMidIndexTime = +totalPoints[midTimeIndex];
            if (currentMinIndex >= 0) {
                if (currentMinIndexTime > min) {
                    minAdditional = currentMinIndex === 0 ? 0 : (currentMinIndexTime - min) / (currentMinIndexTime - (+totalPoints[currentMinIndex - 1]));
                    minIndexCorrection = currentMinIndex === 0 ? currentMinIndex : currentMinIndex - minAdditional;
                } else {
                    minAdditional = (min - currentMinIndexTime) / ((+totalPoints[currentMinIndex + 1]) - currentMinIndexTime);
                    minIndexCorrection = currentMinIndex + minAdditional;
                }
            }

            if (currentMaxIndex <= (totalPointsLen - 1)) {
                if (currentMaxIndexTime > max) {
                    maxAdditional = (currentMaxIndexTime - max) / (currentMaxIndexTime - (+totalPoints[currentMaxIndex - 1]));
                    maxIndexCorrection = currentMaxIndex - maxAdditional;
                } else {
                    maxAdditional = (currentMaxIndex === (totalPointsLen - 1)) ? 0 : (max - currentMaxIndexTime) / ((+totalPoints[currentMaxIndex + 1]) - currentMaxIndexTime);
                    maxIndexCorrection = (currentMaxIndex === (totalPointsLen - 1)) ? currentMaxIndex : currentMaxIndex + maxAdditional;
                }
            }

            if (midTimeIndex <= (totalPointsLen - 1) && midTimeIndex > 0) {
                if (currentMidIndexTime > midTime) {
                    midAdditional = (currentMidIndexTime - midTime) / (currentMidIndexTime - (+totalPoints[midTimeIndex - 1]));
                    midIndexCorrection = midTimeIndex - midAdditional;
                } else {
                    midAdditional = (midTime - currentMidIndexTime) / ((+totalPoints[midTimeIndex + 1]) - currentMidIndexTime);
                    midIndexCorrection = midTimeIndex + midAdditional;
                }
            }
            currentRangePointsLen = maxIndexCorrection - minIndexCorrection;
            midTimeIndex = midIndexCorrection;
        }

        if (delta > 0) {
            if (infChart.settings.config.isMobile) {
                timeLineChange = tickSize * delta;
            } else {
                timeLineChange = tickSize * (delta > 1 ? delta > 50 ? 23 : 8 : 4);
            }
            if (isXZoom && !isLinearAxis) { // zooming using number of differnet points(times) since axis is non-linear
                totalTimeChange = Math.max(minZoomIndexChange, timeLineChange * 2 * (currentRangePointsLen));
                newRangeLen = currentRangePointsLen - totalTimeChange;
                doZoom = newRangeLen > 0;
                if (doZoom) { // to keep minimum points to be 5
                    var newMaxPx = Math.min(totalPointsLen, midTimeIndex + (newRangeLen * ((maxIndexCorrection - midTimeIndex) / (currentRangePointsLen))));
                    var newMinPx = newMaxPx - newRangeLen;
                    self.setZoomPos(newMinPx, newMaxPx, 0, totalPointsLen);
                    self.setZoom(originalEvent);
                }

            } else {
                totalTimeChange = timeLineChange * 2 * (max - min);
                newRange = currentRange - totalTimeChange;
                doZoom = newRange > 0;

                if (doZoom) { // to keep minimum points to be 5
                    newMax = Math.min(dataMax, midTime + (newRange * ((max - midTime) / currentRange)));
                    newMin = newMax - newRange; //midTime - ( newRange * ((midTime - min) / currentRange));
                    self.setZoomPos(newMin, newMax, dataMin, difference);
                    self.setZoom(originalEvent);
                }
            }

        } else if (!(dataMin >= min && dataMax <= max)) {
            if(infChart.settings.config.isMobile){
                timeLineChange = tickSize * delta;
            } else {
                timeLineChange = tickSize * (delta < -1 ? delta < -50 ? 23 : 8 : 4);
            }

            if (isXZoom && !isLinearAxis) {
                minZoomIndexChange = 2;
                totalTimeChange = Math.max(minZoomIndexChange, timeLineChange * 2 * (currentRangePointsLen));
                newRangeLen = currentRangePointsLen + totalTimeChange;
                var maxZoomPointLen = infChart.manager.getMaxPointCount(chart);
                if (newRangeLen > maxZoomPointLen) {
                    newRangeLen = maxZoomPointLen;
                }

                if (currentRangePointsLen != newRangeLen) {
                    newMaxPx = Math.min(totalPointsLen, midTimeIndex + (newRangeLen * ((maxIndexCorrection - midTimeIndex) / (currentRangePointsLen))));
                    newMinPx = newMaxPx - newRangeLen;
                    self.setZoomPos(newMinPx, newMaxPx, 0, totalPointsLen);
                    self.setZoom(originalEvent);
                }
            } else {
                var maxZoom = infChart.manager.getMaxZoomRange(chart);

                totalTimeChange = timeLineChange * 2 * (max - min);
                newRange = currentRange + totalTimeChange;
                if (newRange > maxZoom) {
                    newRange = maxZoom;
                }

                if (currentRange < maxZoom && currentRange != newRange) {
                    newMax = Math.min(dataMax, midTime + (newRange * ((max - midTime) / currentRange)));
                    newMin = newMax - newRange;
                    self.setZoomPos(newMin, newMax, dataMin, difference);
                    self.setZoom(originalEvent);
                }
            }
            chart.infMouseMoved = false;
        }
    }

    /**
     * Stop the event
     * @param {Event} e event
     */
    function stopEvent(e) {
        if (e) {
            if (e.preventDefault) {
                e.preventDefault();
            }
            if (e.stopPropagation) {
                e.stopPropagation();
            }
            e.cancelBubble = true;
        }
    }

    stopEvent(originalEvent);
};

/**
 * Set the zoom position of the new values
 * This positions are set to the mousewheel object in the previous implementation that updated them from the axis' set extremes as well.
 * However those values are not used anywhere. Still keeping this in the object and used in setZoom to keep the room for changes in the future for
 * axis extreme changes.
 * @param {number} newMin new Min value or index that is going to be set
 * @param {number} newMax new Max value or index that is going to be set
 * @param {number} dataMin min data value of the data set
 * @param {number} difference diffrence of the range in (value, pixels or index :: other three params also should be in the same type)
 */
infChart.MouseWheelController.prototype.setZoomPos = function (newMin, newMax, dataMin, difference) {
    var self = this;
    self.zoomPosMax = 100 - (((newMax - dataMin) / difference) * 100);
    self.zoomPosMin = 100 - (((newMin - dataMin) / difference) * 100);
    if (self.zoomPosMin > 100) {
        self.zoomPosMin = 100;
    }
};

infChart.MouseWheelController.prototype.setExtremes = function (e, self) {
    //TODO : remove this method call from all the onfig files and then remove this method from here.
    //var min = e.min;
    //var max = e.max;
    //var difference = self.dataMax - self.dataMin;
    //
    //if (difference && self.dataMin != null && !isNaN(self.dataMin)) {
    //    this.zoomPosMax = 100 - (((max - self.dataMin) / difference) * 100);
    //    this.zoomPosMin = 100 - (((min - self.dataMin) / difference) * 100);
    //}
    //
    //if (this.zoomPosMin > 100) {
    //    this.zoomPosMin = 100;
    //}
    //
    //this.zoomMidPoint = this.zoomPosMax + (this.zoomPosMin - this.zoomPosMax) / 2;

    //console.log("Set Extreme -> Min : " + this.zoomPosMin + " Max : " + this.zoomPosMax + " midPoint :" + this.zoomMidPoint);
};

/**
 * Zoom the axis according to given zoom factors
 * @param {Event} e event
 */
infChart.MouseWheelController.prototype.setZoom = function (e) {
    var self = this;
    var chart = self.chart;
    var isLinearAxis = infChart.manager.isLinearData(chart);
    var axis = self.isXZoom ? chart && chart.xAxis && chart.xAxis[0] : chart && chart.yAxis && chart.yAxis[0];
    var mainSeries = chart && chart.series && chart.series[0];
    if (axis) {
        var actualSeriesExtremes = !self.isXZoom && infChart.manager.getSeriesActualExtremes(chart.renderTo.id, chart.series[0].options.id),
            extremes = axis.getExtremes(),
            exDataMin = actualSeriesExtremes && actualSeriesExtremes.dataMin || extremes.dataMin,
            exDataMax = actualSeriesExtremes && actualSeriesExtremes.dataMax || extremes.dataMax,
            actualRange = !self.isXZoom && actualSeriesExtremes ? actualSeriesExtremes.dataMax - actualSeriesExtremes.dataMin : exDataMax - exDataMin,
            dataMin = self.isXZoom ? extremes.dataMin : exDataMin - (actualRange),
            dataMax = self.isXZoom ? extremes.dataMax : exDataMax + (actualRange),
            mainSeriesDataMax = this.isXZoom ? (mainSeries && mainSeries.points && mainSeries.points[mainSeries.points.length - 1] && mainSeries.points[mainSeries.points.length - 1].x) : dataMax,
            mainSeriesDataMinX = this.isXZoom ? (mainSeries && mainSeries.points && mainSeries.points[0] && mainSeries.points[0].x) : dataMin,
            newMax,
            newMin;

        if (self.isXZoom && !isLinearAxis) {
            var totalPoints = self._getTotalPoints(),
                totalPointsLen = totalPoints.length,
                maxIndexRaw = (100 - self.zoomPosMax) * (totalPointsLen) / 100,
                minIndexRaw = (100 - self.zoomPosMin) * (totalPointsLen) / 100,
                maxIndexAdjusted = Math.min(totalPointsLen - 1, Math.floor(maxIndexRaw)),
                minIndexAdjusted = Math.max(0, Math.ceil(minIndexRaw));

            newMax = +totalPoints[maxIndexAdjusted];
            newMin = +totalPoints[minIndexAdjusted];
            if (maxIndexAdjusted < maxIndexRaw && maxIndexAdjusted < (totalPointsLen - 1)) {
                var nextToMax = +totalPoints[maxIndexAdjusted + 1];
                newMax = newMax + (nextToMax - newMax) * (maxIndexRaw - maxIndexAdjusted);
            }

            if (minIndexAdjusted > minIndexRaw && minIndexAdjusted > 0) {
                var nextToMin = +totalPoints[minIndexAdjusted - 1];
                newMin = newMin - (newMin - nextToMin) * (minIndexAdjusted - minIndexRaw);
            }
        } else {
            newMax = Math.max(mainSeriesDataMinX, dataMax - self.zoomPosMax * (dataMax - dataMin) / 100);
            newMin = dataMin + (100 - this.zoomPosMin) * (dataMax - dataMin) / 100;

        }

        var isZoomUp = (newMax - newMin) <= (axis.max - axis.min),
            dummyBkWd = chart.get(infChart.constants.dummySeries.backwardId),
            mainSeriesDataMin = self.isXZoom ? (dummyBkWd && dummyBkWd.points && dummyBkWd.points[0]) || (mainSeries && mainSeries.points && mainSeries.points[0] && mainSeries.points[0].x) : dataMin,
            isRange = !isZoomUp ? ((axis.max >= newMin && axis.max <= newMax) || (axis.min >= newMin && axis.min <= newMax)) : (newMin >= axis.min && newMax <= axis.max);

        if ((!isNaN(newMin) && !isNaN(newMax)) && isRange && (!isZoomUp ||
                (mainSeriesDataMax && mainSeriesDataMin && newMin < mainSeriesDataMax && newMax > mainSeriesDataMin))
            && (newMin !== self.chartMin || newMax != self.chartMax)) {
            // chart.infManualExtreme = true; // This property is used when used to keep the current extremes on tick updates after user manually changed the extremes.
            chart.setExtremesByMouseWheel = true;
            if (self.isXZoom) {
                infChart.manager.setUserDefinedXAxisExtremes(chart.renderTo.id, newMin, newMax, true);
            } else {
                infChart.manager.setUserDefinedYAxisExtremes(chart.renderTo.id, newMin, newMax, true, true);
            }

            chart.setExtremesByMouseWheel = false;
            chart.infManualCrosshair = true;
            chart.pointer.normalize(e);

            //TODO :: find out a proper solution to get the point of initial position
            var point = chart.pointer.getPointFromEvent(e);

            if (point && point.x != null) {
                chart.pointer.runPointActions(e, point);
            }
            chart.infManualCrosshair = false;

            self.chartMin = newMin;
            self.chartMax = newMax;
        }

    }
};

/**
 * Returns the index of given time
 * @param {number} time time stamp
 * @returns {number} index of the time
 * @private
 */
infChart.MouseWheelController.prototype._getIndexOfTime = function (time) {
    var chart = this.chart;
    var xTimeMap = infChart.manager.getAllTimeTicks(chart);
    var xData = Object.keys(xTimeMap);
    var indexOfNearestXValue = infChart.util.binaryIndexOf(xData, undefined, time);

    if (indexOfNearestXValue < 0) {
        var absIndex = Math.abs(indexOfNearestXValue);

        if (absIndex >= xData.length) {
            absIndex = xData.length - 1;
        }

        var rangeMaxValue = parseInt(xData[absIndex], 10);
        var rangeMinValue = parseInt(xData[absIndex - 1], 10);

        if (time > (((rangeMaxValue - rangeMinValue) / 2) + rangeMinValue)) {
            indexOfNearestXValue = absIndex;
        } else {
            indexOfNearestXValue = absIndex - 1;
        }
    }
    return indexOfNearestXValue;
};

/**
 * Returns the array of time map
 * @returns {Array} all times in array
 * @private
 */
infChart.MouseWheelController.prototype._getTotalPoints = function () {
    var chart = this.chart;
    var stockChart = chart && infChart.manager.getChart(infChart.manager.getContainerIdFromChart(chart.renderTo.id));
    var totalPoints = stockChart.calculateTotalPoints(chart);
    return totalPoints;
};

/**
 * Unbind events on destroy
 */
infChart.MouseWheelController.prototype.destroy = function () {
    var self = this;
    $(self.container).unbind('wheel');
};