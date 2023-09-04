/**
 * Created by dushani on 9/27/18.
 * HighCharts plugging to scale the x and y axis when user dragging the container
 * This is a modified version of Roland Banguiran's (banguiran@gmail.com) plugin for manually scaling Y-Axis range
 *
 *
 * Usage: Set infScalable:true in the chart options to enabble.
 * Default: false
 */

// JSLint options:
/*global Highcharts, document */

(function (H) {
    'use strict';
    var addEvent = H.addEvent,
        doc = document,
        body = doc.body,
        showRestToLastButton = {},
        showXAxisResetButton = {},
        showYAxisResetButton = {},
        minNumberOfDataCandlesToShowWhenFutureZooming = 5;

    /**
     * Change the y axis extremes when drag the container vertically
     * @param axis
     * @param downYValue
     * @param downYPixels
     * @param dragYPixels
     * @returns {*}
     */
    var onYAxisDrag = function (axis, downYValue, downYPixels, dragYPixels) {

        var extremes = axis.getExtremes(),
            yScalestartDef = infChart.settings.defaults && infChart.settings.defaults.scaleYStart || 60,
            scaleStartDiff = yScalestartDef / ((axis.chart && axis.chart.infScaleY) || 1);

        if ((dragYPixels > (axis.top + axis.height) || dragYPixels < axis.top) || (!extremes.userMax && !extremes.userMin && Math.abs(dragYPixels - downYPixels) < scaleStartDiff)) {
            return;
        }

        var currentMin = extremes.min,
            currentMax = extremes.max,
            dataMin = extremes.dataMin,
            dataMax = extremes.dataMax,
            maxPxRange,
            minPxRange,
            min = H.isNumber(currentMin) ? currentMin : undefined,
            max = H.isNumber(currentMax) ? currentMax : undefined,
            currentRange = max - min,
            currentRate = currentRange / axis.height,
            hasNewExtremes,
            newMin,
            newMax,
            redrawRequired;

        // update max extreme only if min/max are defined
        if (H.isNumber(min) && H.isNumber(max)) {

            if (downYPixels < dragYPixels) {

                // user dragged container downwards and chart should be moved down.
                maxPxRange = dragYPixels - axis.top;
                minPxRange = (axis.top + axis.height) - dragYPixels;

                /* To feel user dragged the same value downwards adjust the current value which represents the mouse pointer by
                 *  changing the min and max taking the current pixel positions into account*/
                newMax = downYValue + currentRate * (maxPxRange);
                newMin = downYValue - currentRate * (minPxRange);

                // console.debug("Y :: newMax : " + newMax + ", dataMax : " + dataMax + ", newMin : " + newMin + ", currentRate : " + currentRate);
                if (newMin < dataMax /*&& (newMin <= dataMin || newMax >= dataMax)*/) {
                    // console.debug("Y :: newMin : " + newMin + ",  dataMax : " + dataMax);
                    hasNewExtremes = true;
                    redrawRequired = true;
                }

            } else if (downYPixels > dragYPixels) {

                // user dragged container upwards and chart should be moved up
                maxPxRange = dragYPixels - axis.top;
                minPxRange = (axis.top + axis.height) - dragYPixels;

                /* To feel user dragged the same value downwards adjust the current value which represents the mouse pointer by
                 *  changing the min and max taking the current pixel positions into account*/

                newMax = downYValue + currentRate * (maxPxRange);
                newMin = downYValue - currentRate * (minPxRange);

                // console.debug("Y :: newMax : " + newMax + ", dataMax : " + dataMax + ", newMin : " + newMin + ", currentRate : " + currentRate);
                if (newMax > dataMin /*&& newMin <= dataMin || newMax >= dataMax*/) {
                    // console.debug("Y :: newMax : " + newMin + ",  dataMin : " + dataMax);
                    hasNewExtremes = true;
                    redrawRequired = true;
                }
            }

            if (hasNewExtremes) {
                infChart.manager.setUserDefinedYAxisExtremes(axis.chart.renderTo.id, newMin, newMax, false, true, false);
            }
        }
        return redrawRequired;

    };

    /**
     * Calculate and change y axis zoom when dragging event triggers on y axis labels
     * @param chart
     * @param axis
     * @param delta
     * @param chartCore
     */
    var onYAxisLabelsDrag = function (chart, axis, delta, chartCore) {
        var extremes = axis.getExtremes(),
            actualExRange = extremes.dataMax - extremes.dataMin,
            actualSeriesExtremes = infChart.manager.getSeriesActualExtremes(chart.renderTo.id, chart.series[0].options.id),
            exDataMin = actualSeriesExtremes ? actualSeriesExtremes.dataMin : extremes.dataMin,
            exDataMax = actualSeriesExtremes ? actualSeriesExtremes.dataMax : extremes.dataMax,
            actualRange = actualSeriesExtremes ? actualSeriesExtremes.dataMax - actualSeriesExtremes.dataMin : exDataMax - exDataMin,
            min = extremes.min,
            max = extremes.max,
            dataMin = exDataMin - actualRange,
            dataMax = exDataMax + actualRange,
            totalTimeChange,
            currentRange = max - min,
            midTime = max - (currentRange / 2),
            newRange,
            newMin,
            newMax,
            tickSize = 0.03,//Use this to change responsiveness of the axis label drag
            doZoom = false,
            tickChangeWeight = Math.abs(delta) > 20 ? 2 : 1;

        if (delta > 0) {
            totalTimeChange = tickSize * tickChangeWeight * (max - min);
            newRange = currentRange - totalTimeChange;
            doZoom = newRange > (actualExRange / 10);

            if (doZoom) { // to keep minimum points to be 5
                newMax = Math.min(dataMax, midTime + (newRange * ((max - midTime) / currentRange)));
                newMin = newMax - newRange;
                setAxisZoom(chart, axis, dataMin, dataMax, newMin, newMax, false, chartCore);
            }
        } else if (!(dataMin >= min && dataMax <= max)) {
            var maxZoom = infChart.manager.getMaxZoomRange(chart);

            totalTimeChange = tickSize * tickChangeWeight * (max - min);
            newRange = currentRange + totalTimeChange;
            if (newRange > maxZoom) {
                newRange = maxZoom;
            }

            if (currentRange < maxZoom && currentRange != newRange) {
                newMax = Math.min(dataMax, midTime + (newRange * ((max - midTime) / currentRange)));
                newMin = newMax - newRange;
                setAxisZoom(chart, axis, dataMin, dataMax, newMin, newMax, false, chartCore);
            }
        }
    };

    /**
     * Calculate and change x axis zoom when dragging event triggers on x axis labels
     * @param chart
     * @param axis
     * @param delta
     * @param chartCore
     */
    var onXAxisLabelsDrag = function (chart, axis, delta, chartCore) {
        var extremes = axis.getExtremes(),
            actualExRange = extremes.dataMax - extremes.dataMin,
            min = extremes.min,
            max = extremes.max,
            dataMin = extremes.dataMin,
            dataMax = extremes.dataMax,
            totalTimeChange,
            currentRange = max - min,
            midTime = max - (currentRange / 2),
            newRange,
            newMin,
            tickSize = 0.015,
            doZoom = false,
            tickChangeWeight = Math.abs(delta) > 20 ? 2 : 1,
            iChart = infChart.manager.getChart(infChart.manager.getContainerIdFromChart(axis.chart.renderTo.id));
            chart.onXAxisLabelsDrag = true;

        if (delta > 0) {
            totalTimeChange = tickSize * tickChangeWeight * (max - min);
            newRange = currentRange - totalTimeChange;
            doZoom = !chart.series[0].closestPointRange || chart.series[0].closestPointRange * 5 < newRange;

            if (doZoom) {
                newMin = max - newRange;
                newMin = limitFutureZooming(iChart, newMin);
                setAxisZoom(chart, axis, dataMin, dataMax, newMin, max, true, chartCore);
            }
        } else if (!(dataMin >= min && dataMax <= max)) {
            var maxZoom = infChart.manager.getMaxZoomRange(chart);

            totalTimeChange = tickSize * tickChangeWeight * (max - min);
            newRange = currentRange + totalTimeChange;
            if (newRange > maxZoom) {
                newRange = maxZoom;
            }

            if (currentRange < maxZoom && currentRange != newRange && dataMin <= (max - newRange)) {
                newMin = max - newRange;
                setAxisZoom(chart, axis, dataMin, dataMax, newMin, max, true, chartCore);
            }
        }
    };

    /**
     * Set calculated axis zoom
     * @param chart
     * @param axis
     * @param mainSeriesDataMin
     * @param mainSeriesDataMax
     * @param newMin
     * @param newMax
     * @param chartCore
     */
    var setAxisZoom = function (chart, axis, mainSeriesDataMin, mainSeriesDataMax, newMin, newMax, isXZoom, chartCore) {
        if (axis) {
            var isZoomUp = (newMax - newMin) <= (axis.max - axis.min),
                isRange = !isZoomUp ? ((axis.max >= newMin && axis.max <= newMax) || (axis.min >= newMin && axis.min <= newMax)) : (newMin >= axis.min && newMax <= axis.max);

            if ((!isNaN(newMin) && !isNaN(newMax)) && isRange
                && (!isZoomUp || (mainSeriesDataMax && mainSeriesDataMin && newMin < mainSeriesDataMax && newMax > mainSeriesDataMin))
            ) {

                if (isXZoom) {
                    infChart.manager.setUserDefinedXAxisExtremes(chart.renderTo.id, newMin, newMax, true);
                } else {
                    infChart.manager.setUserDefinedYAxisExtremes(chart.renderTo.id, newMin, newMax, true, true);
                }
                chartCore._fireEventListeners('setExtremesByDragging', isXZoom);
            }
        }
    }

    /**
     * Change the x axis extremes when drag the container horizontally
     * @param axis
     * @param downXValue
     * @param downXPixels
     * @param dragXPixels
     * @param downXextremes
     * @param isLinearAxis
     * @returns {*}
     */
    var onXAxisDrag = function (axis, downXValue, downXPixels, dragXPixels, downXextremes, isLinearAxis) {

        var extremes = axis.getExtremes(),
            currentMin = extremes.min,
            currentMax = extremes.max,
            dataMin = extremes.dataMin,
            dataMax = extremes.dataMax,
            maxPxRange,
            minPxRange,
            min = H.isNumber(currentMin) ? currentMin : undefined,
            max = H.isNumber(currentMax) ? currentMax : undefined,
            currentRange = max - min,
            currentRate = currentRange / axis.width,
            newMin,
            newMax,
            redrawRequired,
            iChart = infChart.manager.getChart(infChart.manager.getContainerIdFromChart(axis.chart.renderTo.id)),
            rangeMin = iChart && iChart.minRangeVal,
            chartExMin = iChart && iChart.exMinVal,
            currentPositions = !isLinearAxis && iChart.getPointPositions(),
            currentPointRate = !isLinearAxis && (downXextremes.maxIdx - downXextremes.minIdx + 1) / axis.width;


        // update max extreme only if min/max are defined
        if (H.isNumber(min) && H.isNumber(max)) {

            // user dragged container to the right and chart should be moved right.
            if (downXPixels < dragXPixels) {


                /* To feel user dragged the same value to the right adjust the current value which represents the mouse pointer by
                 *  changing the min and max taking the current pixel ratio into account*/

                if (isLinearAxis) {
                    maxPxRange = axis.left + axis.width - dragXPixels;
                    minPxRange = dragXPixels - axis.left;
                    newMax = downXValue + currentRate * (maxPxRange);
                    newMin = downXValue - currentRate * (minPxRange);

                    if (newMin < dataMin && extremes.min > dataMin) {
                        newMin = dataMin;
                    }

                    if (newMax > dataMax && extremes.max < dataMax) {
                        newMax = dataMax;
                    }
                } else {
                    /* Since axis is not linear adjust current value using no of points shifted instead of the axis value*/
                    var newMaxIdx = downXextremes.maxIdx - Math.floor((dragXPixels - downXPixels) * currentPointRate),
                        newMinIdx = downXextremes.minIdx - Math.floor((dragXPixels - downXPixels) * currentPointRate);
                    newMax = Math.min(axis.dataMax, currentPositions[newMaxIdx] || axis.dataMax);
                    newMin = Math.max(axis.dataMin, currentPositions[newMinIdx] || axis.dataMin);
                }
                //console.debug("X :: newMax : " + newMax + ", dataMax : " + dataMax + ", newMin : " + newMin + ", currentRate : " + currentRate);
                //  console.debug("X :: maxIdx : " + maxIdx + ", minIdx : " + minIdx + ", newMaxIdx : " + newMaxIdx + ", newMinIdx : " + newMinIdx);
                if ((newMin >= dataMin || (rangeMin && rangeMin < newMin) || (chartExMin && chartExMin < newMin)) && newMax <= dataMax) {
                    //console.debug("X :: newMax : " + newMin + ",  dataMin : " + dataMin + ", min/max range : " + (newMax - newMin));
                    // axis.setExtremes(newMin, newMax, false, false);
                    infChart.manager.setUserDefinedXAxisExtremes(axis.chart.renderTo.id, newMin, newMax, false, true, false);
                    redrawRequired = true;
                }

            } else if (downXPixels > dragXPixels) {
                // user dragged container to the left and chart should be moved left.

                /* To feel user dragged the same value to the left adjust the current value which represents the mouse pointer by
                 *  changing the min and max taking the current pixel ratio into account */

                if (isLinearAxis) {
                    maxPxRange = axis.left + axis.width - dragXPixels;
                    minPxRange = dragXPixels - axis.left;
                    newMax = downXValue + currentRate * (maxPxRange);
                    newMin = downXValue - currentRate * (minPxRange);

                } else {
                    /* Since axis is not linear adjust current value using no of points shifted instead of the axis value*/
                    newMax = Math.min(axis.dataMax, currentPositions[downXextremes.maxIdx + Math.floor((downXPixels - dragXPixels) * currentPointRate)] || axis.dataMax);
                    newMin = Math.max(axis.dataMin, currentPositions[downXextremes.minIdx + Math.floor((downXPixels - dragXPixels) * currentPointRate)] || axis.dataMin);
                }

                newMin = limitFutureZooming(iChart, newMin);

                //  console.debug("X :: newMax : " + newMax + ", dataMax : " + dataMax + ", newMin : " + newMin + ", currentRate : " + currentRate);
                if ((newMin >= dataMin || (rangeMin && rangeMin < newMin) || (chartExMin && chartExMin < newMin)) && newMax <= dataMax) {
                    // console.debug("X :: newMax : " + newMin + ",  newMax : " + newMax + ",  dataMax : " + dataMax + ", min/max range : " + (newMax - newMin) + ", currentRange : " + currentRange);
                    // axis.setExtremes(newMin, newMax, false, false);
                    infChart.manager.setUserDefinedXAxisExtremes(axis.chart.renderTo.id, newMin, newMax, false, true, false);
                    redrawRequired = true;

                }
            }
        }
        return redrawRequired;
    };

    /**
     * limit future zooming to avoid empty chart
     * @param iChart
     * @param calculatedMinValue
     */
    var limitFutureZooming = function (iChart, calculatedMinValue) {
        var dataCandles = iChart.processedData.data;
        var minCandleTimeStamp = dataCandles.length > minNumberOfDataCandlesToShowWhenFutureZooming? dataCandles[dataCandles.length - minNumberOfDataCandlesToShowWhenFutureZooming][0]:
            dataCandles.length > 0? dataCandles[0][0]: null;

        if(minCandleTimeStamp && calculatedMinValue > minCandleTimeStamp) {
            calculatedMinValue = minCandleTimeStamp;
        }

        return calculatedMinValue;
    }

    /**
     * Reset the y axis extremes
     * @param chart
     */
    var resetYZoom = function (chart) {
        infChart.manager.resetUserDefinedYAxisExtremes(chart.renderTo.id, true);
    };

    /**
     * Reset the x axis extremes
     * @param chart
     */
    var resetXZoom = function (chart) {
        infChart.manager.resetUserDefinedXAxisExtremes(chart.renderTo.id);
    };

    /**
     * Reset extremes to last point
     * @param chart
     */
    var resetToLastPoint = function (chart) {
        infChart.manager.resetToLastPointExtremes(chart.renderTo.id, true);
    };

    H.Chart.prototype.callbacks.push(function (chart) {
        var chartOptions = chart.userOptions,
            scalable = chartOptions && chartOptions.chart.infChart && chartOptions.chart.infScalable;

        // Enable dragging if specified.
        if (scalable) {

            var yAxis = chart.yAxis[0],
                xAxis = chart.xAxis[0],
                chartId = chart.renderTo.id,
                options = yAxis.options,
                labels = options.labels,
                pointer = chart.pointer,
                isDragging = false,
                isYAxisLabelDragging = false,
                previousDragYPixels,
                downYPixels,
                isXAxisLabelDragging = false,
                previousDragXPixels,
                downXPixels,
                downYValue,
                downXValue,
                downYPixelValue,
                downYPixelRate,
                downYrange,
                downXPixelValue,
                downXextremes,
                containerId = infChart.manager.getContainerIdFromChart(chartId),
                iChart,
                isLinearAxis = true;

            labels.style.cursor = 'ns-resize';

            infChart.util.bindEvent(chart.container, 'mousedown', function (e) {
                if (e.which == 1 || e.button == 0 || e.which == 0) {
                    downYPixels = chart.pointer.normalize(e).chartY;
                    downXPixels = pointer.normalize(e).chartX;
                    var extremes = yAxis.getExtremes(),
                        currentPositions;

                    iChart = infChart.manager.getChart(containerId);

                    downYValue = yAxis.toValue(downYPixels);
                    downYPixelValue = downYPixels;
                    downXPixelValue = downXPixels;
                    downYPixelRate = yAxis.toValue(0) - yAxis.toValue(1);
                    downYrange = extremes.max - extremes.min;
                    downXValue = chart.xAxis[0].toValue(downXPixels);

                    isLinearAxis = iChart.isLinearData();

                    downXextremes = chart.xAxis[0].getExtremes();

                    isDragging = true;

                    if (downXPixels > (xAxis.left + xAxis.width)) {
                        previousDragYPixels = downYPixels;
                        body.style.cursor = 'ns-resize';
                        isYAxisLabelDragging = true;
                    }

                    if (downYPixels > xAxis.height && downYPixels < chart.navigator.top) {
                        previousDragXPixels = downXPixels;
                        body.style.cursor = 'ew-resize';
                        isXAxisLabelDragging = true;
                    }

                    if (!isLinearAxis) {
                        /* current positions are used only in non-liniear axes*/
                        currentPositions = iChart.getPointPositions();
                        downXextremes.minIdx = downXextremes.min && Math.abs(infChart.util.binaryIndexOf(currentPositions, undefined, downXextremes.min));
                        downXextremes.maxIdx = downXextremes.max && Math.abs(infChart.util.binaryIndexOf(currentPositions, undefined, downXextremes.max));
                    }
                }
                if(e.detail == 2){
                    downYPixels = chart.pointer.normalize(e).chartY;
                    downXPixels = pointer.normalize(e).chartX;
                    if (downYPixels > xAxis.height && downYPixels < chart.navigator.top) {
                        resetXZoom(chart);
                    }
                    if(downXPixels > (xAxis.left + xAxis.width)){
                        resetYZoom(chart);
                    }
                }
            });

            infChart.util.bindEvent(chart.container, 'mousemove', function (e) {
                if(e.type === 'touchmove' && e.touches.length > 1){
                    return;       
                }

                if (isDragging && (!chart.annotations || chart.annotations.allowZoom || isYAxisLabelDragging || isXAxisLabelDragging) && !(chart.navigator && (chart.navigator.grabbedLeft || chart.navigator.grabbedRight || chart.navigator.grabbedCenter))) {
                    if (isYAxisLabelDragging) {
                        var delta = previousDragYPixels - chart.pointer.normalize(e).chartY;

                        if (Math.abs(previousDragYPixels - chart.pointer.normalize(e).chartY) > 1) {
                            previousDragYPixels = chart.pointer.normalize(e).chartY;
                            onYAxisLabelsDrag(chart, yAxis, delta, iChart)
                        }
                    } else if (isXAxisLabelDragging) {
                        var deltaX = previousDragXPixels - chart.pointer.normalize(e).chartX;

                        if (Math.abs(deltaX) > 1) {
                            previousDragXPixels = chart.pointer.normalize(e).chartX;
                            onXAxisLabelsDrag(chart, chart.xAxis[0], deltaX, iChart);
                        }
                    } else {
                        chart.isChartDragging = true;
                        body.style.cursor = 'move';

                        var xAxis = chart.xAxis[0],
                            // dragXPixels = chart.pointer.normalize(e).chartX,
                            // dragYPixels = chart.pointer.normalize(e).chartY,
                            dragXPixels = e.chartX,
                            dragYPixels = e.chartY,
                            navigatorHeight = chart.options.navigator.height;

                        if (((dragXPixels > (xAxis.left + xAxis.width + xAxis.right) || dragXPixels < xAxis.left)) ||
                            ((dragYPixels > (yAxis.top + yAxis.height + yAxis.bottom - navigatorHeight) || dragYPixels < yAxis.top)) /*|| Math.abs(dragYPixels - downYPixels)<50*/) {
                            return;
                        }

                        // TODO :: check the possibility of redrawing only once
                        var xUpdateRequired = onXAxisDrag(xAxis, downXValue, downXPixelValue, dragXPixels, downXextremes, isLinearAxis) || false,
                            yUpdateRequired = onYAxisDrag(yAxis, downYValue, downYPixelValue, dragYPixels) || false;

                        if (xUpdateRequired || yUpdateRequired) {
                            // console.debug("scalable Axis :: xUpdateRequired : " + xUpdateRequired + " && yUpdateRequired:" + xUpdateRequired);
                            // infChart.manager.beforeScalingAxis(chartId, {
                            //     xAxis: xUpdateRequired,
                            //     yAxis: yUpdateRequired
                            // });
                            // if (xUpdateRequired && yUpdateRequired) {
                            //     infChart.manager.pauseScaleDrawings(chart.renderTo.id);
                            // }
                            chart.redraw();
                            chart.infManualCrosshair = true;
                            chart.pointer.runPointActions(e);
                            chart.infManualCrosshair = false;
                            iChart._fireEventListeners('setExtremesByDragging', {});
                            // if (xUpdateRequired && yUpdateRequired) {
                            //     infChart.manager.unPauseScaleDrawings(chart.renderTo.id);
                            // }
                        }

                        // infChart.manager.afterScalingAxis(chartId, {
                        //     xAxis: xUpdateRequired,
                        //     yAxis: yUpdateRequired
                        // });
                    }
                }
            });

            infChart.util.bindEvent(document, 'mouseup', function () {
                body.style.cursor = 'default';
                chart.isChartDragging = false;
                if(isDragging) {
                    chart.isDirtyBox = true; // Changing this property to force fully redraw
                    chart.redraw();
                    chart.isDirtyBox = false;
                }
                isDragging = false;
                isYAxisLabelDragging = false;
                isXAxisLabelDragging = false;
                chart.onXAxisLabelsDrag = false;
                // chart.infContainerDragging = false;
            });

            addEvent(chart, 'destroy', function () {
                //remove axis-reset-container div
                infChart.structureManager.scalableAxis.removeButtonHTML(containerId);
            });

            addEvent(yAxis, 'afterSetExtremes', function () {
                var resizeRequired = false;
                if (infChart.manager.isDefaultYAxisExtremes(chartId)) {
                    resizeRequired = infChart.structureManager.scalableAxis.updateButtonView(containerId, false, false);
                    showYAxisResetButton[chartId] = false;
                } else if (!showYAxisResetButton[chartId]) {
                    resizeRequired = infChart.structureManager.scalableAxis.updateButtonView(containerId, false, true);
                    showYAxisResetButton[chartId] = true;
                }
                if (resizeRequired) {
                    infChart.manager.getChart(containerId).resizeChart();
                }
            });

            addEvent(xAxis, 'afterSetExtremes', function (e) {
                var resizeRequired = false;
                if (infChart.manager.isDefaultXAxisExtremes(chartId, e)) {
                    resizeRequired = infChart.structureManager.scalableAxis.updateButtonView(containerId, true, false);
                    showXAxisResetButton[chartId] = false;
                } else if (!showXAxisResetButton[chartId]) {
                    resizeRequired = infChart.structureManager.scalableAxis.updateButtonView(containerId, true, true);
                    showXAxisResetButton[chartId] = true;
                }

                if(infChart.manager.isLastPointExtremes(chartId, e)){
                    resizeRequired = infChart.structureManager.scalableAxis.updateResetButtonView(containerId, false);
                    showRestToLastButton[chartId] = false;
                } else if(!showRestToLastButton[chartId]) {
                    resizeRequired = infChart.structureManager.scalableAxis.updateResetButtonView(containerId, true);
                    showRestToLastButton[chartId] = true;
                }
                if (resizeRequired) {
                    infChart.manager.getChart(containerId).resizeChart();
                }
            });

            infChart.structureManager.scalableAxis.setButtons(containerId, function () {
                showXAxisResetButton[chartId] = false;
                var resizeRequired = infChart.structureManager.scalableAxis.updateButtonView(containerId, true, false);
                resetXZoom(chart);
                if(resizeRequired){
                    infChart.manager.getChart(containerId).resizeChart();
                }
            }, function () {
                showYAxisResetButton[chartId] = false;
                var resizeRequired = infChart.structureManager.scalableAxis.updateButtonView(containerId, false, false);
                resetYZoom(chart);
                if(resizeRequired){
                    infChart.manager.getChart(containerId).resizeChart();
                }
            }, function () {
                showRestToLastButton[chartId] = false;
                var resizeRequired = infChart.structureManager.scalableAxis.updateResetButtonView(containerId, false);
                resetToLastPoint(chart);
                if(resizeRequired){
                    infChart.manager.getChart(containerId).resizeChart();
                }
            });
        }
    });

}(Highcharts));