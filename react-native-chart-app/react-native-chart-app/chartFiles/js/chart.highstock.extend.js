window.infChart = window.infChart || {};

(function (infChart, $, H) {

    var UNDEFINED,
        Point = H.Point,
        seriesType = H.seriesType,
        seriesTypes = H.seriesTypes;

    //region ===============================================  Util =====================================================

    /**
     * Returns the StockChart object of the given container
     * @param chartContainerId
     * @returns {*}
     * @private
     */
    var _getChartObj = function (chartContainerId) {
        return infChart.manager.getChart(infChart.manager.getContainerIdFromChart(chartContainerId));
    };

    /**
     * Returns the compare value of the main series when comparison symbols are added.
     * @param chart
     * @returns {number}
     * @private
     */
    var _getMainSeriesCompareValue = function (chart) {

        var chartObj = _getChartObj(chart.renderTo.id),
            mainseries = (chartObj && chartObj.getMainSeries()) || chart.series[0],
            diff = 0;

        if (mainseries) {
            // diff = mainseries.compareValue;
            diff = chartObj.getSeriesCompareValue(mainseries);
        }

        return diff;
    };

    /**
     * Check whether series is an indicator with in the base axis with a comparison symbol
     * @param series
     * @returns {*|boolean}
     * @private
     */
    var _isIndicatorWithComparison = function (series) {
        var chart = series.chart;

        return ( _getModifyValueMethod(chart.series[0]) && series.options.infType == 'indicator' && infChart.util.isSeriesInBaseAxis(series.yAxis.options.id));
    };

    /**
     * Check whether series is a dummy series  in the base axis with a comparison symbol
     * @param series
     * @returns {*|boolean}
     * @private
     */
    var _isDummyWithComparison = function (series) {
        var chart = series.chart;

        return ( _getModifyValueMethod(chart.series[0]) && series.options.infType == 'dummy' && infChart.util.isSeriesInBaseAxis(series.yAxis.options.id));
    };

    var _getModifyValueMethod = function (series) {
        return series.dataModify? series.dataModify.modifyValue: null;
    }

    /**
     * Check whether the chart is a x-chart
     * @param chart
     * @returns {*}
     * @private
     */
    var _isXChart = function (chart) {
        return chart && chart.userOptions.chart && chart.userOptions.chart.infChart;
        // return chart && chart.userOptions.chart.infChart;
    };

    /**
     * Returns the actual pixel width which a point need to be drawn without overlapping.
     * @param series
     * @returns {*|number}
     * @private
     */
    var _getPointWidthByType = function (series) {
        var type = series && series.type,
            minPointGap = 0;
        switch (type) {
            case 'candlestick' :
            case 'hlc' :
            case 'heikinashi' :
            case 'equivolume' :
            case 'volume' :
            case 'engulfingCandles' :
            case 'customCandle' :
                var graphic = series && series.chart.renderer.path(),
                    crispCorr = (graphic && (graphic.strokeWidth() % 2) / 2) || .5, // adding the max possible corr
                    // series.barW is not taken into account to fix https://xinfiit.atlassian.net/projects/CCA/issues/CCA-3638
                    pointWidth = series.options.dataGrouping.groupPixelWidth,//(series.barW && Math.ceil(series.barW))||3, // since highcharts takes the half width from the rounded value of a point width need a correction to that
                    pointWidthCorr = Math.ceil(pointWidth /*+ crispCorr + .5*/);

                return pointWidthCorr + minPointGap * 2;
            default :
                return (series && series.options.dataGrouping.groupPixelWidth + minPointGap * 2 ) || 5;
        }
    };

    /**
     * Determine whether the given series should display points in compacted shape or not
     * @param series
     * @returns {*}
     * @private
     */
    var _isCompactedShape = function (series) {
        var points = series.points,
            chart = series.chart,
            navigator = chart.navigator,
            iChart = chart && _getChartObj(chart.renderTo.id),
            groupedPixelWidth = _getPointWidthByType(series),
            maxPointsCount = Math.floor(chart.plotSizeX / groupedPixelWidth),
            pointCountForCurrentDisplaySpace = iChart && iChart.getPointsCountForCurrentDisplaySpace(),
            isCompactedShape,
            isIntradaySeries = infChart.intradayChartManager && infChart.intradayChartManager.isIntradaySeries(series);

        if (isIntradaySeries) {
            return false;
        } 

        if (pointCountForCurrentDisplaySpace && (chart.mouseIsDown == "mousedown" && !chart.onXAxisLabelsDrag) && (( navigator && !navigator.hasDragged ) || !navigator ) && typeof series.xIsCompactedShape != "undefined"){
            isCompactedShape = series.xIsCompactedShape;
        } else {
            isCompactedShape = (maxPointsCount < points.length || maxPointsCount < pointCountForCurrentDisplaySpace);
        }

        series.xIsCompactedShape = isCompactedShape;

        return isCompactedShape;
    };

    //endregion ========================================= end of Util ==================================================

    /**
     * Inside this method overwrite Highcharts' default functionality
     * @private
     */
    var _extendHighCharts = function () {

        // Wrappers for Highcharts
        var H = Highcharts,
            NUMBER = 'number',
            UNDEFINED,
            NORMAL_STATE = '';

        H.wrap(H, 'numberFormat', function (proceed, number, decimals, decimalPoint, thousandsSep) {

            var val = proceed.call(this, number, decimals, decimalPoint, thousandsSep);
            if (val.split("e-")[1]) {
                var decimal = decimals < 0 ? parseInt(val.split("e-")[1]) : decimals;
                val = number.toFixed(decimal);
            }
            return val;
        });

        /**
         * Wrapped SVGElement's destroy event to fix the issue occurs when destroying lowerStateMarkerGraphic property of arearange chart
         */
        H.wrap(H.SVGElement.prototype, 'destroy', function (proceed) {
            if (this.renderer) {
                return proceed.call(this);
            } else {
                return null;
            }
        });

        //region ======================================Wrapping up the Chart============================================

        /**
         * Wrapped this method to change the reset button UI
         */
        H.wrap(H.Chart.prototype, 'showResetZoom', function (proceed, e) {

            if (!_isXChart(this.chart)) {
                return proceed.call(this, e);
            }

            if (!this.infHasDragged && this.hasDragged) {

                var iChart = _getChartObj(this.chart.renderTo.id);

                if (typeof iChart !== "undefined") {
                    iChart.onNavigatorScrollStart(this);
                }

                this.infHasDragged = true;
            }

            return proceed.call(this, e);

        });

        /**
         * Wrapping up the Chart.redraw method to keep previous offset before changing from Axis.getOffset.
         * This is used to determine whether plot area is resized or not
         */
        H.wrap(H.Chart.prototype, 'redraw', function (proceed, e) {

            if (_isXChart(this)) {
                this.infPrevAxisOffset = this.axisOffset;
            }

            return proceed.call(this, e);

        });

        /**
         * Wrappping up this method to set the axesOffsets when there are labels that need more space than axis width.
         *
         * When margin is initially defined axesOffsets are not taken into account in the library. so manually set those to null
         * to use axesOffsets calculated considering all the labels (Check 'getAxisOffset' method which is wrapped up in the axis section)
         */
        H.wrap(H.Chart.prototype, 'getAxisMargins', function (proceed) {

            if (_isXChart(this)) {

                var iChart = _getChartObj(this.renderTo.id),
                    yAxis = iChart.getMainYAxis(),
                    hChart = this,
                    offset = infChart.manager.getAxisLabelOffset(iChart.id, yAxis);

                if (offset) {

                    if (typeof hChart.infInitialMargin == "undefined") {
                        hChart.infInitialMargin = this.margin[yAxis.side];
                    }

                    this.margin[yAxis.side] = undefined;
                    this[H.marginNames[yAxis.side]] = 0;

                } else if (typeof hChart.infInitialMargin != "undefined") {
                    //clear the margin which is set for axis labels
                    this.margin[yAxis.side] = hChart.infInitialMargin;
                    this[H.marginNames[yAxis.side]] = hChart.infInitialMargin || 0;
                    delete hChart.infInitialMargin;
                }
            }

            return proceed.call(this);

        });

        //endregion =================================end of Wrapping up the Chart=======================================

        //region ======================================Wrapping up the Axis=============================================

        /**
         * Wrapped this method to fix the issue with dragging
         */
        H.wrap(H.Axis.prototype, 'setExtremes', function (proceed, newMin, newMax, redraw, animation, eventArguments) {

            var chart = this.chart,
                iChart = chart && _getChartObj(chart.renderTo.id),
                prevMin = chart && chart.prevMin,
                prevMax = chart && chart.prevMax
            ;

            if (prevMin && prevMax && prevMin == newMin && prevMax == newMax) {
                return;
            }

            if (iChart && eventArguments && eventArguments["trigger"] == "navigator") {
                chart.infManualExtreme = true;
            }

            if (iChart && prevMin != newMin && this.isXAxis) {
                iChart._recalculateDynamicIndicators(false, undefined, ["compare", "base"], {
                    min: newMin,
                    max: newMax || prevMax
                });
            }
            // if (chartX > plotLeft) {
            proceed.call(this, newMin, newMax, redraw, animation, eventArguments);
            //  }
            chart.prevMin = newMin;
            chart.prevMax = newMax;
        });

        H.wrap(H.Axis.prototype, 'drawCrosshair', function (proceed, e, point) {

            proceed.call(this, e, point);

            var chart = _getChartObj(this.chart.renderTo.id);

            if ("undefined" === typeof chart || !chart.chart) {
                // proceed.call(this, e, point);
                return;
            }

            if (e && (this.chart.mouseIsDown != "mousedown" || this.chart.infManualCrosshair) && ("undefined" === typeof chart || chart.isCrosshairEnabled())) {
                if (this.crossLabel) {
                    //if (this.crossLabel.parentGroup) {
                    //    //https://xinfiit.atlassian.net/browse/CCA-2544
                    //    // this.crossLabel.parentGroup.toFront();
                    //    this.crossLabel.toFront(); // TODO : check in dev with saved settings
                    //} else {
                    this.crossLabel.toFront();
                    this.crossLabel.show();
                    //}
                }
                if (chart && chart.isDefaultCrosshairEnabled(this) && (this.isXAxis || (!this.isXAxis && this.top < e.chartY && (this.top + this.height) > e.chartY))) {
                    // proceed.call(this, e, point);
                    if (e && !this.isXAxis && this.crossLabel && this.crossLabel.attr) {
                        // this.crossLabel.attr({
                        //     y: e.chartY - this.crossLabel.height / 2,
                        //     x: this.left + this.width + this.crossLabel.width + this.crossLabel.height / 4 - 1,
                        //     hAlign: 'right'
                        // });
                    }
                } else {
                    this.hideCrosshair();
                    // if (this.crossLabel) {//hide crosshair internally hides the label
                    //     this.crossLabel.hide();
                    // }
                }
                var yAxis = chart.getMainYAxis();
                if(!this.isXAxis && this.options.id === yAxis.options.id){
                    if (chart.isLastCrosshair()) {
                        if(e){
                            chart.updateCrosshair(e.offsetX, e.offsetY, point, this, e);
                        }
                    } else {
                        chart.showCrosshair(false);
                    }
                }
            } else {
                this.hideCrosshair();
                // if (this.crossLabel) {//hide crosshair internally hides the label
                //     this.crossLabel.hide();
                // }
            }
        });

        //endregion ======================================end of Wrapping up the Axis===================================

        //region ======================================Wrapping up Pointer==============================================

        /**
         * Set custom dom events
         */
        H.wrap(H.Pointer.prototype, 'setDOMEvents', function (proceed, mouseEvent) {
            proceed.call(this, mouseEvent);

            let vm = this;
            let chart = this.chart;

            function _onContainerClick (e) {
                let hoverPoint = chart.hoverPoint;
                let plotLeft = chart.plotLeft;
                let plotTop = chart.plotTop;

                e = vm.normalize(e);

                if (!chart.cancelClick) {
                    // On tracker right click, fire the series and point events.
                    let isMainChart = hoverPoint && hoverPoint.series.options.id === "c0";
                    let isCompare = hoverPoint && hoverPoint.series.options.infType === "compare";

                    if (!isCompare && (!isMainChart || vm.inClass(e.target, "highcharts-markers")) && vm.inClass(e.target, 'highcharts-series-group')) {
                        // the series right click event
                        if (hoverPoint) {
                            H.fireEvent(hoverPoint.series, 'contextmenu', H.extend(e, {
                                seriesPoint: hoverPoint
                            }));
                        } 
                    } else {
                        H.extend(e, vm.getCoordinates(e));

                        // fire a right click event in the chart
                        if (chart.isInsidePlot(e.chartX - plotLeft, e.chartY - plotTop)) {
                            H.fireEvent(chart, 'contextmenu', e);
                        } else {
                            let downYPixels = chart.pointer.normalize(e).chartY,
                                downXPixels = chart.pointer.normalize(e).chartX;
                            if (downYPixels > chart.xAxis[0].height && downYPixels < chart.navigator.top) {
                                H.fireEvent(chart.xAxis[0], 'contextmenu', H.extend(e,{
                                    chart: chart
                                }));
                            }
                            if(downXPixels > (chart.xAxis[0].left + chart.xAxis[0].width)){
                                H.fireEvent(chart.yAxis[0], 'contextmenu', H.extend(e,{
                                    chart: chart
                                }));
                            }
                        }
                    }
                }
            }

            function _onContainerDoubleClick (e) {
                let hoverPoint = chart.hoverPoint;
                let pEvt = vm.normalize(e);
                if (!chart.cancelClick) {
                    if (hoverPoint &&
                        vm.inClass(pEvt.target, 'highcharts-tracker')) {
                        // the series click event
                        H.fireEvent(hoverPoint.series, 'doubleClick', H.extend(pEvt, {
                            seriesPoint: hoverPoint
                        }));
                    }
                }
            }

            chart.container.oncontextmenu = function (e) {
                _onContainerClick(e);
            }

            chart.container.ondblclick = function (e) {
                _onContainerDoubleClick(e)
            }
        });

        /**
         * Wrapped this method to catch the event on mouse up for navigator drag handle
         */
        H.wrap(H.Pointer.prototype, 'onDocumentMouseUp', function (proceed, e) {

            var retrunObj = proceed.call(this, e);
            // var iChart = H.charts && H.charts[H.hoverChartIndex] && _getChartObj(H.charts[H.hoverChartIndex].renderTo.id);
            var iChart = H.charts && H.chart.length > 0 && _getChartObj(H.charts[H.charts.length - 1].renderTo.id);

            if (typeof iChart !== "undefined") {
                iChart.onDocumentMouseUp(this);
            }
            return retrunObj;
        });

        H.wrap(H.Pointer.prototype, 'onContainerMouseDown', function (proceed, e) {

            var retrunObj = proceed.call(this, e);
            this.chart.infDragE = e;
            this.chart.infDragExtremes = this.chart.xAxis[0].getExtremes();
            return retrunObj;
        });

        H.wrap(H.Pointer.prototype, 'drag', function (proceed, e) {

            var chart = this.chart;

            // This property is used when used to keep the current extremes on tick updates after user manually changed the extremes.
            // Need to be reset when changing the data set of the chart
            chart.infManualExtreme = true;
            //chart.infDragE = e;
            //chart.infDragExtremes = chart.xAxis[0].getExtremes();
            proceed.call(this, e);
        });

        /**
         * To fix the issues having with the pointer position when one of the patent div is scaled
         */
        H.wrap(H.Pointer.prototype, 'normalize', function (proceed, points, e, selected, accumulate) {
            var chart = this.chart;
            var event = proceed.call(this, points, e);

            if (typeof chart === "undefined") {
                return;
            }

            if (chart.infScaleX) {
                event.chartX = event.chartX / chart.infScaleX;
            }

            if (chart.infScaleY) {
                event.chartY = event.chartY / chart.infScaleY; 
            }
            return event;
        });

        H.wrap(H.Pointer.prototype, 'runPointActions', function (proceed, e, p, force) {
            var pointer = this,
                chart = pointer.chart,
                series = chart.series,
                tooltip = chart.tooltip,
                shared = (tooltip ?
                    tooltip.shared :
                    false);
            var hoverPoint = p || chart.hoverPoint,
                hoverSeries = hoverPoint && hoverPoint.series || chart.hoverSeries;
            var // onMouseOver or already hovering a series with directTouch
                isDirectTouch = (!e || e.type !== 'touchmove') && (!!p || ((hoverSeries && hoverSeries.directTouch) &&
                    pointer.isDirectTouch)),
                hoverData = this.getHoverData(hoverPoint,
                hoverSeries,
                series,
                isDirectTouch,
                shared,
                e);
            // Update variables from hoverData.
            hoverPoint = hoverData.hoverPoint;
            hoverSeries = hoverData.hoverSeries;
            var points = hoverData.hoverPoints,
                followPointer = hoverSeries &&
                    hoverSeries.tooltipOptions.followPointer &&
                    !hoverSeries.tooltipOptions.split,
                useSharedTooltip = (shared &&
                    hoverSeries &&
                    !hoverSeries.noSharedTooltip);
            var iChart = _getChartObj(chart.renderTo.id);
            // Refresh tooltip for kdpoint if new hover point or tooltip was hidden
            // #3926, #4200
            if (!this.chart.isChartDragging && hoverPoint &&
                (force ||
                    hoverPoint !== chart.hoverPoint ||
                    (tooltip && tooltip.isHidden))) {
                (chart.hoverPoints || []).forEach(function (p) {
                    if (points.indexOf(p) === -1) {
                        p.setState();
                    }
                });
                // Set normal state to previous series
                if (chart.hoverSeries !== hoverSeries) {
                    hoverSeries.onMouseOver();
                }
                pointer.applyInactiveState(points);
                // Do mouseover on all points (#3919, #3985, #4410, #5622)
                (points || []).forEach(function (p) {
                    p.setState('hover');
                });
                // If tracking is on series in stead of on each point,
                // fire mouseOver on hover point. // #4448
                if (chart.hoverPoint) {
                    chart.hoverPoint.firePointEvent('mouseOut');
                }
                // Hover point may have been destroyed in the event handlers (#7127)
                if (!hoverPoint.series) {
                    return;
                }
                /**
                 * Contains all hovered points.
                 *
                 * @name Highcharts.Chart#hoverPoints
                 * @type {Array<Highcharts.Point>|null}
                 */
                chart.hoverPoints = points;
                /**
                 * Contains the original hovered point.
                 *
                 * @name Highcharts.Chart#hoverPoint
                 * @type {Highcharts.Point|null}
                 */
                chart.hoverPoint = hoverPoint;
                /**
                 * Hover state should not be lost when axis is updated (#12569)
                 * Axis.update runs pointer.reset which uses chart.hoverPoint.state
                 * to apply state which does not exist in hoverPoint yet.
                 * The mouseOver event should be triggered when hoverPoint
                 * is correct.
                 */
                hoverPoint.firePointEvent('mouseOver', void 0, function () {
                    // Draw tooltip if necessary
                    if (tooltip && hoverPoint) {
                        tooltip.refresh(useSharedTooltip ? points : hoverPoint, e);
                    }
                });
                // Update positions (regardless of kdpoint or hoverPoint)
            }
            else if (followPointer && tooltip && !tooltip.isHidden) {
                var anchor = tooltip.getAnchor([{}],
                    e);
                if (chart.isInsidePlot(anchor[0], anchor[1], {
                    visiblePlotOnly: true
                })) {
                    tooltip.updatePosition({ plotX: anchor[0], plotY: anchor[1] });
                }
            }
            // Start the event listener to pick up the tooltip and crosshairs
            if (!pointer.unDocMouseMove) {
                pointer.unDocMouseMove = H.addEvent(chart.container.ownerDocument, 'mousemove', function (e) {
                    var chart = H.charts[H.Pointer.hoverChartIndex];
                    if (chart) {
                        chart.pointer.onDocumentMouseMove(e);
                    }
                });
                pointer.eventsToUnbind.push(pointer.unDocMouseMove);
            }
            // Issues related to crosshair #4927, #5269 #5066, #5658
            chart.axes.forEach(function drawAxisCrosshair(axis) {
                var snap = H.pick((axis.crosshair || {}).snap,
                    true);
                var point;
                if (snap) {
                    point = chart.hoverPoint; // #13002
                    if (!point || point.series[axis.coll] !== axis) {
                        point = find(points, function (p) {
                            return p.series && p.series[axis.coll] === axis;
                        });
                    }
                }
                // Axis has snapping crosshairs, and one of the hover points belongs
                // to axis. Always call drawCrosshair when it is not snap.
                if (point || !snap) {
                    if (iChart && !iChart.crosshair.enabled) {
                        axis.hideCrosshair();
                        iChart.showCrosshair(false);
                    } else {
                        axis.drawCrosshair(e, point);
                    }
                    // Axis has snapping crosshairs, but no hover point belongs to axis
                }
                else {
                    axis.hideCrosshair();
                }
            });
        });

        //endregion ======================================Wrapping up Pointer===========================================

        //region ======================================Wrapping up Series===============================================


        H.wrap(H.Series.prototype, 'setCompare', function (proceed, compare) {

            proceed.call(this, compare);

            // if (!_isXChart(this.chart)) {
            //     return;
            // }
            //
            // var series = this,
            //     options = series.options,
            //     customModifyValue = series.options.customModifyValue;
            //
            // // Set or unset the modifyValue method
            // series.modifyValue = (compare === 'infCustom' && customModifyValue) ? customModifyValue : series.dataModify? series.dataModify.modifyValue: null;
        });

        // modify yBottom (low) value before translate
        H.wrap(H.Series.prototype, 'translate', function (proceed) {

            proceed.call(this);

            if (!_isXChart(this.chart)) {
                return;
            }

            var series = this,
                options = series.options,
                points = series.points,
                dataLength = points && points.length || 0, i,
                modifyValueMethod = _getModifyValueMethod(series),
                hasModifyValue = !!modifyValueMethod,
                parallelToBaseWithComparision = _isIndicatorWithComparison(series) || _isDummyWithComparison(series),
                yAxis = series.yAxis,
                diff = 0,
                xAxis = series.xAxis,
                threshold = options.threshold,
                mainSeriesCompareValue = _getMainSeriesCompareValue(series.chart);


            if (hasModifyValue || parallelToBaseWithComparision) {
                for (i = 0; i < dataLength; i++) {
                    var point = points[i],
                        yBottom = point.low;

                    // general hook, used for Highstock compare mode
                    /*if (hasModifyValue && defined(yBottom)) {
                     yBottom = series.modifyValue(yBottom, point);
                     // Set translated yBottom or remove it
                     point.yBottom = defined(yBottom) ?
                     yAxis.translate(yBottom, 0, 1, 0, 1) :
                     null;
                     }
                     else */
                    if (parallelToBaseWithComparision && H.defined(point.y)) {
                        if (series.type != 'arearange' && series.type != 'plotrange') {
                            //diff = relatedBaseVal.y - relatedBaseVal.change;

                            //yBottom = yBottom - diff;
                            yBottom = (yBottom / mainSeriesCompareValue - 1 ) * 100;
                            point.yBottom = H.defined(yBottom) ?
                                yAxis.translate(yBottom, 0, 1, 0, 1) :
                                null;
                            // record for tooltip etc.

                            var yValue = point.y, plotY;

                            //yValue = yValue - diff;
                            yValue = (yValue / mainSeriesCompareValue - 1 ) * 100;
                            if (point) {
                                point.change = yBottom || yValue;
                            }
                            // Set the the plotY value, reset it for redraws
                            point.plotY = plotY = (typeof yValue === 'number' && yValue !== Infinity) ?
                                Math.min(Math.max(-1e5, yAxis.translate(yValue, 0, 1, 0, 1)), 1e5) : // #3201
                                UNDEFINED;
                            point.isInside = plotY !== UNDEFINED && plotY >= 0 && plotY <= yAxis.len && // #3519
                                point.plotX >= 0 && point.plotX <= xAxis.len;


                            point.negative = yValue < (threshold || 0);

                        }
                    } else if (!H.defined(point.y)) {
                        point.plotY = UNDEFINED;
                        //point.y = UNDEFINED;
                    }

                }
            }
        });

        /**
         * Apply same modifications done when translating to scale the y Axis to the used range
         */
        H.wrap(H.Series.prototype, 'getExtremes', function (proceed, yData) {
// todo :: check the posibility of seperate logic for spread
            var data = proceed.apply(this, [].slice.call(arguments, 1));


            if (_isXChart(this.chart)) {
                let series = this;
                let seriesName = series.name;
                let compareValue = _getMainSeriesCompareValue(series.chart);
                let modifyValueMethod = _getModifyValueMethod(series);

                if (_isIndicatorWithComparison(this) || _isDummyWithComparison(series)) {
                    if (compareValue && (series.dataMin != undefined || series.dataMax != undefined ) && !series.alreadyChanged  && seriesName !== 'dummy_fw') { 
                        let extremes;
                        if (modifyValueMethod) {
                            // TODO :: change the logic if there is an indicator with modify value. modifyValue has been applied to curren min.max once in proceed.apply
                            extremes = [modifyValueMethod((series.dataMin / compareValue - 1 ) * 100), modifyValueMethod((series.dataMax / compareValue - 1 ) * 100)];
                        } else {
                            extremes = [(series.dataMin / compareValue - 1 ) * 100, (series.dataMax / compareValue - 1 ) * 100];
                        }

                        series.dataMin = series.dataMin != undefined ? H.arrayMin(extremes) : series.dataMin;
                        series.dataMax = series.dataMin != undefined ? H.arrayMax(extremes) : series.dataMin;

                        data.dataMin = series.dataMin;
                        data.dataMax = series.dataMax;
                        if(series.userOptions && series.userOptions.infType == "indicator"){
                            series.alreadyChanged = true;
                            var seriesList = this.chart.series;
                            infChart.util.forEach(seriesList, function (index, seriesSet) {
                                if(seriesName == seriesSet.name){
                                    seriesSet.alreadyChanged = true;
                                }
                            });
                            this.chart.series = seriesList;
                        }
                    } else if(compareValue && (data.dataMin != undefined || data.dataMax != undefined)){
                        if (modifyValueMethod) {
                            extremes = [modifyValueMethod((data.dataMin / compareValue - 1 ) * 100), modifyValueMethod((data.dataMax / compareValue - 1 ) * 100)];
                        } else {
                            extremes = [(data.dataMin / compareValue - 1 ) * 100, (data.dataMax / compareValue - 1 ) * 100];
                        }

                        series.dataMin = series.dataMin != undefined ? H.arrayMin(extremes) : series.dataMin;
                        series.dataMax = series.dataMax != undefined ? H.arrayMax(extremes) : series.dataMax;

                        data.dataMin = series.dataMin;
                        data.dataMax = series.dataMax;
                        if(series.userOptions && series.userOptions.infType == "indicator"){
                            series.alreadyChanged = true;
                            var seriesList = this.chart.series;
                            infChart.util.forEach(seriesList, function (index, seriesSet) {
                                if(seriesName == seriesSet.name){
                                    seriesSet.alreadyChanged = true;
                                }
                            });
                            this.chart.series = seriesList;
                        }
                    }
                } else if (series.options.compare == 'infCustom') {
                    let points = series.points,
                        min, max;
                    if (points) {
                        for (var k = 0, length = points.length; k < length - 1; k++) {
                            if (points[k] && points[k].change != null) {
                                if (min == undefined || min > points[k].change) {
                                    min = points[k].change;
                                }
                                if (max == undefined || max < points[k].change) {
                                    max = points[k].change;
                                }
                            }
                        }
                        if (min != undefined && max != undefined) {
                            series.dataMin = min;
                            series.dataMax = max;

                            data.dataMin = series.dataMin;
                            data.dataMax = series.dataMax;
                        }
                    } else {
                        console.error(series.yData)
                    }
                } else {
                    if (series.type === 'volume') {
                        var xAxis = series.xAxis, yAxis = series.yAxis, xData = series.processedXData, yDataLength, activeYData = [], activeCounter = 0, // #2117, need to compensate for log X axis
                            xExtremes = xAxis.getExtremes(), xMin = xExtremes.min, xMax = xExtremes.max, validValue, withinRange, x, y, i, j;

                        yData = yData || this.stackedYData || this.processedYData || [];
                        yDataLength = yData.length;

                        for (i = 0; i < yDataLength; i++) {

                            x = xData[i];
                            y = yData[i];

                            // For points within the visible range, including the first point
                            // outside the visible range, consider y extremes
                            validValue = (H.isNumber(y, true) || H.isArray(y)) && (!yAxis.positiveValuesOnly || (y.length || y > 0));
                            withinRange = series.getExtremesFromAll || series.options.getExtremesFromAll || series.cropped || ((xData[i] || x) >= xMin && (xData[i] || x) <= xMax);

                            if (validValue && withinRange) {

                                j = y.length;
                                if (j) {
                                    // array, like ohlc or range data
                                    if (y[0] && y[0] != null) {
                                        activeYData[activeCounter++] = y[0];
                                    }
                                } else {
                                    activeYData[activeCounter++] = y;
                                }
                            }
                        }

                        series.dataMin = H.arrayMin(activeYData);
                        series.dataMax = H.arrayMax(activeYData);

                        data.dataMin = series.dataMin;
                        data.dataMax = series.dataMax;
                        data.activeYData = activeYData;
                    }
                }
            }

            return data;
        });

        /**
         * Wrapping up 'processData' to fix the error occured when there is only one point for compare symbols
         */
        H.wrap(H.Series.prototype, 'processData', function (proceed) {


            proceed.apply(this, [].slice.call(arguments, 1));

            if (_isXChart(this.chart) && !H.isNumber(this.compareValue) && this.processedYData && this.processedYData.length == 1) {

                var series = this,
                    i,
                    keyIndex = -1,
                    processedXData,
                    processedYData,
                    length,
                    compareValue;

                processedXData = series.processedXData;
                processedYData = series.processedYData;
                length = processedYData.length;

                // For series with more than one value (range, OHLC etc), compare against
                // close or the pointValKey (#4922, #3112)
                if (series.pointArrayMap) {
                    // Use close if present (#3112)
                    keyIndex = H.inArray('close', series.pointArrayMap);
                    if (keyIndex === -1) {
                        keyIndex = H.inArray(series.pointValKey || 'y', series.pointArrayMap);
                    }
                }

                // find the first value for comparison
                for (i = 0; i <= (length - 1); i++) {
                    compareValue = processedYData[i] && keyIndex > -1 ?
                        processedYData[i][keyIndex] :
                        processedYData[i];

                    if (H.isNumber(compareValue) &&
                        ((processedXData[i + 1] && processedXData[i + 1] >= series.xAxis.min) || (processedXData[i] && processedXData[i] >= series.xAxis.min) )
                        && compareValue !== 0) {
                        series.compareValue = compareValue;
                        break;
                    }
                }
            }
        });

        /**
         * Wrapped up this to fix the issue of not displaying cross hair when chart is moved away from the series data
         * https://xinfiit.atlassian.net/browse/CCA-3574
         */
        H.wrap(H.Series.prototype, 'init', function (proceed) {
            proceed.apply(this, [].slice.call(arguments, 1));
            var series = this,
                hChart = series.chart,
                iChart = hChart && _getChartObj(hChart.renderTo.id);

            if (typeof iChart != "undefined") {
                series.directTouch = true;
            }
        });

        //endregion ======================================end of Wrapping up Series========================================

        //region ======================================wrapping up Navigator ===========================================

        /**
         * Wrapped this method to catch the event on mouse up for navigator drag handle
         */
        H.wrap(H.Navigator.prototype, 'onMouseUp', function (proceed, e) {

            var navigator = this,
                retrunObj = proceed.call(this, e),
                chart = this.chart;

            if (navigator.infHasDragged && !chart.hasDragged && e.type === "mouseup") {

                var iChart = _getChartObj(this.chart.renderTo.id);

                if (typeof iChart !== "undefined") {
                    iChart.onNavigatorScrollStop(this);
                }
                if (this.xAxis && this.xAxis.options.infEvents && this.xAxis.options.infEvents.onNavigatorScrollStop) {
                    this.xAxis.options.infEvents.onNavigatorScrollStop(this);
                }

                navigator.infHasDragged = false;
            }
            return retrunObj;
        });


        /**
         * Wrapped navigator to restrict the zooming not to overlap the points. Aborted the mouse move event when maximum zoom range is reached
         */
        H.wrap(H.Navigator.prototype, 'onMouseMove', function (proceed, e) {

            var navigator = this,
                chart = navigator.chart,
                inverted = chart.inverted,
                chartX,
                proceedEvent = true,
                iChart = _getChartObj(this.chart.renderTo.id);

            if (!navigator.infHasDragged && navigator.hasDragged) {
                if (typeof iChart !== "undefined") {
                    iChart.onNavigatorScrollStart(this);
                    // infChart.manager.afterScalingAxis(this.chart.renderTo.id, {
                    //     xAxis: true,
                    //     yAxis: false
                    // });
                }

                navigator.infHasDragged = true;
            }

            // In iOS, a mousemove event with e.pageX === 0 is fired when holding the finger
            // down in the center of the scrollbar. This should be ignored.
            if ((navigator.grabbedLeft || navigator.grabbedRight || navigator.grabbedCenter) && chart.userOptions.chart.infChart && (!e.touches || e.touches[0].pageX !== 0)) { // #4696, scrollbar failed on Android
                var maxZoom = infChart.manager.getMaxZoomRange(chart),
                    maxZoomPx = infChart.manager.getMaxZoomRangePx(chart);

                e = chart.pointer.normalize(e);
                chartX = e.chartX;

                // Swap some options for inverted chart
                if (inverted) {
                    chartX = e.chartY;
                }

                chart.infDragE = e;
                var currentX = navigator.xAxis.toValue(chartX),
                    currentZoom = Math.abs(navigator.fixedExtreme - currentX),
                    currentZoomPx = Math.abs(navigator.xAxis.toPixels(navigator.fixedExtreme) - chartX),
                    baseXAxis = chart.xAxis[0],
                    // For reversed axes, min and max are chagned,
                    // so the other extreme should be stored
                    reverse = (chart.inverted && !baseXAxis.reversed) ||
                        (!chart.inverted && baseXAxis.reversed),
                    xAxis = navigator.xAxis,
                    isLinearData = iChart.isLinearData(),
                    isNonLinearMax = !isLinearData && (maxZoomPx && maxZoomPx < currentZoomPx);

                if ((isLinearData && maxZoom && maxZoom < currentZoom) || isNonLinearMax) {

                    if (navigator.fixedExtreme > currentX) {
                        // grabbed left is not used since when handles are crossed other end should be the left
                        // Grab the left handle and set the extreme limit that chart can be zoomed without exceeding the max zoom
                        navigator.fixedExtreme = reverse ? isNonLinearMax ? navigator.xAxis.toValue(chartX - maxZoomPx) : currentX - maxZoom : isNonLinearMax ? navigator.xAxis.toValue(chartX + maxZoomPx) : currentX + maxZoom;
                        navigator.otherHandlePos = xAxis.toPixels(navigator.fixedExtreme, true);

                    } else {
                        // Grab the right handle and set the extreme limit that chart can be zoomed without exceeding the max zoom
                        navigator.fixedExtreme = reverse ? isNonLinearMax ? navigator.xAxis.toValue(chartX + maxZoomPx) : currentX + maxZoom : isNonLinearMax ? navigator.xAxis.toValue(chartX - maxZoomPx) : currentX - maxZoom;
                        navigator.otherHandlePos = xAxis.toPixels(navigator.fixedExtreme, true);
                    }

                }

                if (proceedEvent) {
                    proceed.call(this, e);
                }
            }else{
                proceed.call(this, e);
            }

        });

        /**
         * Extending to avoid the empty spaces shown for future times(dummy series)
         * https://xinfiit.atlassian.net/browse/CCA-3722
         */
        H.wrap(H.Navigator.prototype, 'modifyNavigatorAxisExtremes', function (proceed) {

            var iChart = _getChartObj(this.chart.renderTo.id),
                xAxis = this.xAxis,
                proceedEvent = true;

            if (xAxis.getExtremes) {

                if (typeof iChart !== "undefined") {

                    var extremes = iChart.getExtremesForNavigator();
                    if (extremes) {
                        if (extremes && (extremes.min !== xAxis.min || extremes.max !== xAxis.max)) {
                            xAxis.min = extremes.min;
                            xAxis.max = extremes.max;
                        }
                        proceedEvent = false;
                    }
                }
            }
            proceedEvent && proceed.call(this);
        });

        //endregion =====================================end of wrapping up Navigator ==================================

    };

    /**
     * Adds custom chart types for highcharts by extending Highcharts.seriesTypes
     * @private
     */
    var _extendHighChartsForCustomChartTypes = function () {


        // 1 - Set default options
        var defaultPlotOptions = H.getOptions().plotOptions;

        //region ************** hlc type *********************************

        seriesType('hlc', 'ohlc', H.merge(defaultPlotOptions.ohlc, defaultPlotOptions.hlc, {
                dataGrouping: {

                    approximation: 'ohlc'
                }
            }), /** @lends seriesTypes.hlc */ {
            /**
             * Draw the data points
             */
            drawPoints: function () {
                var series = this,
                    points = series.points,
                    chart = series.chart,
                    isCompactedShape = _isCompactedShape(series);


                points.forEach(function (point) {
                    var plotClose,
                        crispCorr,
                        halfWidth,
                        path,
                        graphic = point.graphic,
                        crispX,
                        isNew = !graphic;

                    if (point.plotY !== undefined) {

                        // Create and/or update the graphic
                        if (!graphic) {
                            point.graphic = graphic = chart.renderer.path()
                                .add(series.group);
                        }


                        graphic.attr(series.pointAttribs(point, point.selected && 'select')).shadow(series.options.shadow); // #3897


                        // crisp vector coordinates
                        crispCorr = (graphic.strokeWidth() % 2) / 2;
                        crispX = Math.round(point.plotX) - crispCorr; // #2596
                        halfWidth = Math.round(point.shapeArgs.width / 2);

                        var bottom = Math.round(point.yBottom),
                            top = Math.round(point.plotHigh);


                        // the vertical stem
                        path = [
                            'M',
                            crispX, bottom,
                            'L',
                            crispX, bottom == top ? top - crispCorr : top
                        ];

                        if (!isCompactedShape) {

                            // close
                            if (point.close !== null) {
                                plotClose = Math.round(point.plotClose) + crispCorr;
                                path.push(
                                    'M',
                                    crispX,
                                    plotClose,
                                    'L',
                                    crispX + halfWidth,
                                    plotClose
                                );
                            }
                        }

                        graphic[isNew ? 'attr' : 'animate']({
                            d: path
                        })
                            .addClass(point.getClassName(), true);

                    }


                });

            },

            animate: null // Disable animation

        }, /** @lends seriesTypes.hlc.prototype.pointClass.prototype */ {
            /**
             * Extend the parent method by adding up or down to the class name.
             */
            getClassName: function () {
                return Point.prototype.getClassName.call(this) +
                    (this.open < this.close ? ' highcharts-point-up' : ' highcharts-point-down');
            }
        });
        //endregion ************** end of hlc type *********************************

        //region ************** dash type *********************************

        seriesType('dash', 'column', H.merge(defaultPlotOptions.column, defaultPlotOptions.dash, {
            states: {
                hover: {
                    lineWidth: 2
                }
            },
            dataGrouping: {

                approximation: 'average'
            },
            threshold: null
            //upColor: undefined
        }), /** @lends seriesTypes.ohlc */ {
            pointAttrToOptions: { // mapping between SVG attributes and the corresponding options
                stroke: 'color',
                'stroke-width': 'lineWidth'
            },

            /**
             * Draw the data points
             */
            drawPoints: function () {
                var series = this,
                    points = series.points,
                    chart = series.chart;


                points.forEach(function (point) {
                    var crispCorr,
                        halfWidth,
                        path,
                        graphic = point.graphic,
                        crispX,
                        isNew = !graphic;

                    if (point.plotY !== undefined) {

                        // Create and/or update the graphic
                        if (!graphic) {
                            point.graphic = graphic = chart.renderer.path()
                                .add(series.group);
                        }


                        graphic.attr(series.pointAttribs(point, point.selected && 'select')); // #3897


                        // crisp vector coordinates
                        crispCorr = (graphic.strokeWidth() % 2) / 2;
                        crispX = Math.round(point.plotX) - crispCorr; // #2596
                        halfWidth = Math.round(point.shapeArgs.width / 2);

                        path = [];
                        path.push(
                            'M',
                            crispX - halfWidth,
                            Math.round(point.plotY),
                            'L',
                            crispX + halfWidth,
                            Math.round(point.plotY)
                        );


                        graphic[isNew ? 'attr' : 'animate']({
                            d: path
                        })
                            .addClass(point.getClassName(), true);

                    }


                });

            },

            animate: null // Disable animation

            /**
             * @constructor seriesTypes.ohlc.prototype.pointClass
             * @extends {Point}
             */
        }, /** @lends seriesTypes.ohlc.prototype.pointClass.prototype */ {});
        //endregion  ****************end of dash type************************

        //region *********************volume type***************************

        seriesType('volume', 'column', H.merge(defaultPlotOptions.column, defaultPlotOptions.volume, {
            lineWidth: 0,
            states: {
                hover: {
                    lineWidth: 1
                }
            },
            dataGrouping: {
                approximation: function (volume, open, close) {

                    var NUMBER = 'number';

                    var approximations = {
                        sum: function (arr) {
                            var len = arr.length,
                                ret;

                            // 1. it consists of nulls exclusively
                            if (!len && arr.hasNulls) {
                                ret = null;
                                // 2. it has a length and real values
                            } else if (len) {
                                ret = 0;
                                while (len--) {
                                    ret += arr[len];
                                }
                            }
                            // 3. it has zero length, so just return undefined
                            // => doNothing()

                            return ret;
                        },
                        average: function (arr) {
                            var len = arr.length,
                                ret = approximations.sum(arr);

                            // If we have a number, return it divided by the length. If not, return
                            // null or undefined based on what the sum method finds.
                            if (typeof ret === NUMBER && len) {
                                ret = ret / len;
                            }

                            return ret;
                        },
                        open: function (arr) {
                            return arr.length ? arr[0] : (arr.hasNulls ? null : UNDEFINED);
                        },
                        close: function (arr) {
                            return arr.length ? arr[arr.length - 1] : (arr.hasNulls ? null : UNDEFINED);
                        }
                    };

                    open = approximations.open(open);
                    close = approximations.close(close);
                    volume = approximations.average(volume);
                    if (typeof open === NUMBER || typeof close === NUMBER || typeof volume == NUMBER) {
                        return [volume, open, close];
                    }

                },

                // the first one is the point or start value, the second is the start value if we're dealing with range,
                // the third one is the end value if dealing with a range
                dateTimeLabelFormats: {
                    millisecond: ['%A, %b %e, %H:%M:%S.%L', '%A, %b %e, %H:%M:%S.%L', '-%H:%M:%S.%L'],
                    second: ['%A, %b %e, %H:%M:%S', '%A, %b %e, %H:%M:%S', '-%H:%M:%S'],
                    minute: ['%A, %b %e, %H:%M', '%A, %b %e, %H:%M', '-%H:%M'],
                    hour: ['%A, %b %e, %H:%M', '%A, %b %e, %H:%M', '-%H:%M'],
                    day: ['%A, %b %e, %Y', '%A, %b %e', '-%A, %b %e, %Y'],
                    week: ['Week from %A, %b %e, %Y', '%A, %b %e', '-%A, %b %e, %Y'],
                    month: ['%B %Y', '%B', '-%B %Y'],
                    year: ['%Y', '%Y', '-%Y']
                }
                // smoothed = false, // enable this for navigator series only
            }
        }), /** @lends seriesTypes.volume */ {
            directTouch: false,
            pointArrayMap: ['volume', 'open', 'close'], // array point configs are mapped to this
            toYData: function (point) { // return a plain array for speedy calculation
                return [point.volume];
            },
            pointValKey: 'volume',

            pointAttrToOptions: { // mapping between SVG attributes and the corresponding options
                fill: 'color',
                stroke: 'lineColor',
                'stroke-width': 'lineWidth'
            },
            upColorProp: 'fill',

            /**
             * Postprocess mapping between options and SVG attributes
             */
            pointAttribs: function (point, state) {
                var attribs = seriesTypes.column.prototype.pointAttribs.call(
                    this,
                    point,
                    state
                );
                if(this.chart.isChartDragging) {
                    return attribs;
                }

                var options = this.options, stateOptions = options.states,
                    upLineColor = options.upColor || options.color,
                    hoverStroke = stateOptions.hover.upColor || upLineColor,
                    selectStroke = stateOptions.select.upColor || upLineColor;

                if (point.open < point.close) {

                    // If an individual line color is set, we need to merge the
                    // point attributes, because they are shared between all up
                    // points by inheritance from OHCLSeries.
                    if (point.lineColor) {
                        //point.pointAttr = H.merge(point.pointAttr);
                        upLineColor = point.lineColor;
                    }

                    attribs.stroke = upLineColor;
                    attribs.fill = upLineColor;
                }

                return attribs;
            },
            // uncomment this section if there is a borderWidth for the volume bars
            /*
             drawPoints: function() {
             var series = this,
             points = series.points,
             chart = this.chart,
             options = series.options,
             renderer = chart.renderer,
             animationLimit = options.animationLimit || 250,
             shapeArgs,
             groupedPixelWidth = this.options.dataGrouping.groupPixelWidth || 3,
             maxDataCount = Math.floor(this.chart.plotSizeX / groupedPixelWidth),
             isCompactedShape = (maxDataCount < points.length);

             if(isCompactedShape) {
             // draw the columns
             each(series.points, function (point) {
             var plotY = point.plotY,
             graphic = point.graphic;

             if (H.isNumber(plotY) && point.y !== null) {
             shapeArgs = point.shapeArgs;

             shapeArgs.width = 1;

             if (graphic) { // update
             graphic[chart.pointCount < animationLimit ? 'animate' : 'attr'](
             H.merge(shapeArgs)
             );

             } else {
             point.graphic = graphic = renderer[point.shapeType](shapeArgs)
             .add(point.group || series.group);
             }

             // Border radius is not stylable (#6900)
             if (options.borderRadius) {
             graphic.attr({
             r: options.borderRadius
             });
             }


             // Presentational
             graphic
             .attr(series.pointAttribs(point, point.selected && 'select'))
             .shadow(options.shadow, null, options.stacking && !options.borderRadius);


             graphic.addClass(point.getClassName(), true);


             } else if (graphic) {
             point.graphic = graphic.destroy(); // #1269
             }
             });
             } else {
             seriesTypes.column.prototype.drawPoints.call(this);
             }
             },*/
            animate: null // Disable animation

            /**
             * @constructor seriesTypes.ohlc.prototype.pointClass
             * @extends {Point}
             */
        }, /** @lends seriesTypes.ohlc.prototype.pointClass.prototype */ {
            /**
             * Extend the parent method by adding up or down to the class name.
             */
            /*getClassName: function() {
             return Point.prototype.getClassName.call(this) +
             (this.open < this.close ? ' highcharts-point-up' : ' highcharts-point-down');
             }*/
        });

        //endregion ************volume type******************************************

        //region ************** Heikin Ashi type *********************************
        seriesType('heikinashi', 'candlestick', H.merge(defaultPlotOptions.candlestick, defaultPlotOptions.heikinashi,
            {
                dataGrouping: {

                    approximation: 'ohlc'
                }
            }), /** @lends seriesTypes.ohlc */ {
            directTouch: false,
            pointArrayMap: ['open', 'high', 'low', 'close'], // array point configs are mapped to this
            toYData: function (point) { // return a plain array for speedy calculation
                return [point.open, point.high, point.low, point.close];
            },
            pointValKey: 'close',

            /**
             * Postprocess mapping between options and SVG attributes
             */
            pointAttribs: function (point, state) {
                var attribs = seriesTypes.column.prototype.pointAttribs.call(
                        this,
                        point,
                        state
                    ),
                    options = this.options,
                    upColor = options.upColor || options.color,
                    upColorProp = options.upColorProp,
                    upLineColor = options.upLineColor || options.lineColor,
                    stateOptions;

                attribs[upColorProp] = upColor;

                if (!point.options.color &&
                    options.upColor &&
                    point.open < point.close
                ) {
                    attribs.fill = options.upColor;
                    attribs.stroke = options.upColor;
                }

                var prevPoint = this.prevPoint[point.index];
                var pointOpen = prevPoint.xPoint.open,
                    pointClose = prevPoint.xPoint.close

                if (pointOpen < pointClose) {

                    /* If an individual line color is set, we need to merge the
                     point attributes, because they are shared between all up
                     points by inheritance from OHCLSeries.*/
                    if (point.lineColor) {
                        upLineColor = point.lineColor;
                    }

                    attribs.stroke = upLineColor;
                    attribs.fill = upColor;
                }
                point.infData = { xOpen: pointOpen, close: pointClose };

                if(state) {
                    stateOptions = options.states[state];
                    attribs.fill = stateOptions.color || attribs.fill;
                    attribs.stroke = stateOptions.lineColor || attribs.stroke;
                    attribs['stroke-width'] = stateOptions.lineWidth || attribs['stroke-width'];
                }
                return attribs;
            },
            /**
             * Calculate the open, close, high, low values for a single point
             */
            calculateSingleDataPoint: function (i) {
                var series = this,
                    chart = series.chart,
                    chartObj = _getChartObj(chart.renderTo.id),
                    prevPointOpen,
                    prevPointClose;
                var dataArray = series.yData[i];
                var currentPoint = { open: dataArray[0], close: dataArray[3], high: dataArray[1], low: dataArray[2] };

                rawOpen = (i == 0) ? (chartObj.getsBaseValueFromProcessedValue(currentPoint.open) + chartObj.getsBaseValueFromProcessedValue(currentPoint.close)) / 2 :
                    (chartObj.getsBaseValueFromProcessedValue(series.prevPoint[i - 1].xPoint.open) + chartObj.getsBaseValueFromProcessedValue(series.prevPoint[i - 1].xPoint.close)) / 2;
                prevPointOpen = chartObj.getProcessedValue(series, rawOpen);

                rawClose = (chartObj.getsBaseValueFromProcessedValue(currentPoint.close) + chartObj.getsBaseValueFromProcessedValue(currentPoint.open) +
                    chartObj.getsBaseValueFromProcessedValue(currentPoint.high) + chartObj.getsBaseValueFromProcessedValue(currentPoint.low)) / 4;
                prevPointClose = chartObj.getProcessedValue(series, rawClose);

                currentPoint.xPoint = {
                    open: prevPointOpen, close: prevPointClose,
                    high: Math.max(currentPoint.high, prevPointOpen, prevPointClose),
                    low: Math.min(currentPoint.low, prevPointOpen, prevPointClose)
                };

                series.prevPoint[i] = currentPoint;
            },
            /**
             * calculate open, close, high, low values for the series
             */
            calculateDataPoints: function () {
                var series = this;

                series.prevPoint = [];
                for (var i = 0; i < series.yData.length; i++) {
                    this.calculateSingleDataPoint(i);
                }
            },
            /**
             * Translate the actual values into plot values
             */
            translate: function () {
                var series = this,
                    yAxis = series.yAxis,
                    modifyValueMethod = _getModifyValueMethod(series),
                    hasModifyValue = !!modifyValueMethod,
                    translated = ['plotOpen', 'plotHigh', 'plotLow', 'plotClose', 'yBottom'], // translate OHLC for
                    translatedRaw = ['infRawPlotOpen', 'infRawPlotHigh', 'infRawPlotLow', 'infRawPlotClose', 'infRawYbottom'], // translate actual OHLC for
                    points,
                    chart = series.chart,
                    chartObj = _getChartObj(chart.renderTo.id),
                    rawPlotY,
                    rawPlotYBottom,
                    pointOpen,
                    plotOpen,
                    plotClose,
                    pointClose;

                seriesTypes.column.prototype.translate.apply(series);
                points = series.points;
                this.calculateDataPoints();

                // Do the translation
                points.forEach(function (point) {
                    if (!series.prevPoint[point.index]) {
                        series.calculateSingleDataPoint(point.index);
                    }
                    [point.open, point.high, point.low, point.close, point.low].forEach(function (value, i) {
                        if (value !== null) {
                            if (hasModifyValue) {
                                value = modifyValueMethod(value);
                            }
                            point[translated[i]] = yAxis.toPixels(value, true);
                            point[translatedRaw[i]] = point[translated[i]]; // keep actual plot values here to be used in calculations even if plot values changes due to boundaries
                        }

                    });

                    rawPlotY = H.isNumber(point.infRawPlotY) ? point.infRawPlotY : point.plotY;
                    rawPlotYBottom = H.isNumber(point.infRawYbottom) ? point.infRawYbottom : point.yBottom;

                    var j = point.index;
                    pointOpen = series.prevPoint[j].xPoint.open;
                    pointClose = series.prevPoint[j].xPoint.close;
                    pointHigh = series.prevPoint[j].xPoint.high;
                    pointLow = series.prevPoint[j].xPoint.low;

                    if (typeof chartObj !== "undefined" && chartObj.isPercent && chartObj.isCompare) {
                        pointOpen = chartObj.convertBaseYValue(pointOpen, chartObj.isLog, chartObj.isPercent, chartObj.isPercent);
                        pointClose = chartObj.convertBaseYValue(pointClose, chartObj.isLog, chartObj.isPercent, chartObj.isPercent);
                        pointHigh = chartObj.convertBaseYValue(pointHigh, chartObj.isLog, chartObj.isPercent, chartObj.isPercent);
                        pointLow = chartObj.convertBaseYValue(pointLow, chartObj.isLog, chartObj.isPercent, chartObj.isPercent);
                    }

                    point.plotOpen = point.xOpen = plotOpen = yAxis.toPixels(pointOpen);
                    point.plotClose = plotClose = yAxis.toPixels(pointClose);
                    point.plotY = point.plotHigh = yAxis.toPixels(pointHigh);
                    point.yBottom = point.plotLow = yAxis.toPixels(pointLow);

                    point.isInside =
                        point.plotY !== undefined &&
                        point.plotHigh >= 0 &&
                        point.plotLow <= yAxis.len && // #3519
                        point.plotX >= 0 &&
                        point.plotX <= series.xAxis.len;


                    /**
                     * If point is not inside the clip box change the plot values accordingly
                     */
                    if (!point.isInside) {

                        if (point.plotLow > yAxis.len && point.plotHigh < yAxis.len) {
                            point.plotLow = yAxis.len;
                            point.plotClose = Math.min(point.plotClose, yAxis.len);
                            point.plotOpen = Math.min(point.plotOpen, yAxis.len);
                            //point.plotY = point.plotClose;
                            point.yBottom = yAxis.len;
                        } else if (point.plotHigh < 0 && point.plotLow > 0) {
                            point.plotHigh = 0;
                            point.plotClose = point.plotClose < 0 ? (point.plotClose < point.plotOpen && point.plotOpen > 0) ? 0 : undefined : point.plotClose;
                            point.plotOpen = point.plotOpen < 0 ? (point.plotClose > point.plotOpen && point.plotClose > 0) ? 0 : undefined : point.plotOpen;
                            point.plotY = 0;
                        } else {
                            point.plotY = undefined;
                            point.graphic && point.graphic.destroy && point.graphic.destroy();
                            point.graphic = undefined;
                        }
                    }

                    point.xPoint = series.prevPoint[j].xPoint;

                    // Align the tooltip to the high value to avoid covering the point
                    point.tooltipPos[1] =
                        point.plotHigh + yAxis.pos - series.chart.plotTop;
                });
            },
            /**
             * Draw the data points
             */
            drawPoints: function () {

                var series = this,
                    points = series.points,
                    chart = series.chart,
                    prevPoint,
                    isCompactedShape = _isCompactedShape(series);

                points.forEach(function (point) {

                    var graphic = point.graphic,
                        plotOpen = point.plotOpen,
                        plotClose = point.plotClose,
                        plotHigh = point.plotHigh,
                        plotLow = point.plotLow,
                        topBox,
                        bottomBox,
                        hasTopWhisker,
                        hasBottomWhisker,
                        crispCorr,
                        crispX,
                        path,
                        halfWidth,
                        isNew = !graphic;


                    if (point.plotY !== undefined) {

                        if (!graphic) {
                            point.graphic = graphic = chart.renderer.path()
                                .add(series.group);
                        }
                        graphic
                            .attr(series.pointAttribs(point, point.selected && 'select')) // #3897
                            .shadow(series.options.shadow);


                        // Crisp vector coordinates
                        crispCorr = (graphic.strokeWidth() % 2) / 2;
                        crispX = Math.round(point.plotX) - crispCorr; // #2596

                        // Create the path. Due to a bug in Chrome 49, the path is first instanciated
                        // with no values, then the values pushed. For unknown reasons, instanciated
                        // the path array with all the values would lead to a crash when updating
                        // frequently (#5193).
                        path = [];

                        if (!isCompactedShape && plotOpen != undefined && plotClose != undefined) {
                            topBox = Math.min(plotOpen, plotClose);
                            bottomBox = Math.max(plotOpen, plotClose);
                            halfWidth = Math.round(point.shapeArgs.width / 2);
                            hasTopWhisker = Math.round(topBox) !== Math.round(point.plotY);
                            hasBottomWhisker = bottomBox !== point.yBottom;
                            topBox = Math.round(topBox) + crispCorr;
                            bottomBox = Math.round(bottomBox) + crispCorr;
                            path.push('M',
                                crispX - halfWidth, bottomBox,
                                'L',
                                crispX - halfWidth, topBox,
                                'L',
                                crispX + halfWidth, topBox,
                                'L',
                                crispX + halfWidth, bottomBox,
                                'Z',
                                // Use a close statement to ensure a nice rectangle #2602
                                'M',
                                crispX, topBox,
                                'L',
                                crispX, hasTopWhisker ? Math.round(point.plotHigh) : topBox, // #460, #2094
                                'M',
                                crispX, bottomBox,
                                'L',
                                crispX, hasBottomWhisker ? Math.round(point.yBottom) : bottomBox // #460, #2094
                            );
                        } else {
                            // drawing a line only when plot open and plot close is not available
                            topBox = plotHigh;
                            bottomBox = plotLow;
                            topBox = Math.round(topBox) + crispCorr;
                            bottomBox = Math.round(bottomBox) + crispCorr;
                            path.push(
                                'M',
                                crispX, topBox,
                                'L',
                                crispX, topBox == bottomBox ? topBox + crispCorr : bottomBox
                            );
                        }

                        graphic[isNew ? 'attr' : 'animate']({
                            d: path
                        })
                            .addClass(point.getClassName(), true);
                    }
                    prevPoint = point;
                });

            },

            animate: null // Disable animation

            /**
             * @constructor seriesTypes.ohlc.prototype.pointClass
             * @extends {Point}
             */
        }, /** @lends seriesTypes.ohlc.prototype.pointClass.prototype */ {});

        //endregion ************** end of Heikin Ashi type *********************************

        // region ************** dummy series *********************************
        seriesType('dummySeries', 'line', H.merge(defaultPlotOptions.line, defaultPlotOptions.dummySeries,
            ), {takeOrdinalPosition : true});
        //endregion ************** end of dummy series type *********************************

        // region ************** Engulfing Candles type *********************************
        seriesType('engulfingCandles', 'candlestick', H.merge(defaultPlotOptions.candlestick, defaultPlotOptions.engulfingCandles),
            /** @lends seriesTypes.ohlc */
            {
                /**
                 * Postprocess mapping between options and SVG attributes
                 */
                pointAttribs: function (point, state) {
                    var attribs = seriesTypes.column.prototype.pointAttribs.call(
                            this,
                            point,
                            state
                        ),
                        options = this.options,
                        upColorProp = options.upColorProp,
                        stateOptions;

                    attribs[upColorProp] = options.upColor || options.color;

                    if (!point.options.color &&
                        options.upColor &&
                        point.open < point.close
                    ) {
                        attribs.fill = options.upColor;
                        attribs.stroke = options.upColor;
                    }

                    var prevPoint = point.series.data[point.index -1];

                    if (prevPoint) {
                        if (point.open < point.close && prevPoint.open > prevPoint.close && point.close > prevPoint.open && point.open < prevPoint.close) {
                            // bullish engulfing
                            attribs.fill = options.bullish;
                            attribs.stroke = options.bullish;
                        }

                        if (point.open > point.close && prevPoint.open < prevPoint.close && point.close < prevPoint.open && point.open > prevPoint.close) {
                            // bearish engulfing
                            attribs.fill = options.bearish;
                            attribs.stroke = options.bearish;
                        }
                    }

                    if(state) {
                        stateOptions = options.states[state];
                        attribs.fill = stateOptions.color || attribs.fill;
                        attribs.stroke = stateOptions.lineColor || attribs.stroke;
                        attribs['stroke-width'] = stateOptions.lineWidth || attribs['stroke-width'];
                    }
                    return attribs;
                }

                /**
                 * @constructor seriesTypes.ohlc.prototype.pointClass
                 * @extends {Point}
                 */
            }, /** @lends seriesTypes.ohlc.prototype.pointClass.prototype */ {});

        //endregion ************** end of Heikin Ashi type *********************************

        //region ************** Custom Candle type *********************************
        seriesType('customCandle', 'candlestick', H.merge(defaultPlotOptions.candlestick, defaultPlotOptions.customCandle, {
                dataGrouping: {

                    approximation: 'ohlc'
                }
            }),
            {
                /**
                 * Postprocess mapping between options and SVG attributes
                 */
                pointAttribs: function (proceed, point, state) {
                    var attribs = seriesTypes.column.prototype.pointAttribs.call(this, point, state),
                        options = this.options,
                        // isUp = point.open < point.close,
                        isUp = point.open < point.close ,
                        stroke = options.lineColor || this.color,
                        stateOptions;

                    attribs['stroke-width'] = options.lineWidth;

                    attribs.fill = point.options.color || (isUp ? (options.upColor || this.color) : this.color);
                    attribs.stroke = point.lineColor || (isUp ? (options.upLineColor || stroke) : stroke);

                    // Select or hover states
                    if (state) {
                        stateOptions = options.states[state];
                        attribs.fill = stateOptions.color || attribs.fill;
                        attribs.stroke = stateOptions.lineColor || attribs.stroke;
                        attribs['stroke-width'] =
                            stateOptions.lineWidth || attribs['stroke-width'];
                    }

                    return attribs;
                }
                /**
                 * @constructor seriesTypes.ohlc.prototype.pointClass
                 * @extends {Point}
                 */
            }, /** @lends seriesTypes.ohlc.prototype.pointClass.prototype */ {});

        //endregion ************** end of Custom Candle type *********************************

        //region ************** step type *********************************

        seriesType('step', 'line', H.merge(defaultPlotOptions.line, defaultPlotOptions.step, {
            dataGrouping: {

                approximation: 'average'
            }
        }), /** @lends seriesTypes.step.prototype */ {
            /**
             * Get the spline segment from a given point's previous neighbour to the given point
             */
            getPointSpline: function (points, point, i) {
                var
                    plotX = point.plotX,
                    plotY = point.plotY,
                    lastPoint = points[i - 1],
                    ret;

                // find control points
                if (lastPoint) {

                    var lastX = lastPoint.plotX,
                        lastY = lastPoint.plotY,
                        currentX = point.plotX,
                        currentY = point.plotY,
                        midX = (lastX + currentX) / 2;


                }

                // moveTo or lineTo
                if (!i) {
                    ret = ['M', plotX, plotY];
                } else { // curve from last point to this
                    ret = [
                        'M',
                        lastX, lastY,
                        'L',
                        midX, lastY,
                        'L',
                        midX, currentY,
                        'L',
                        currentX, currentY
                    ];
                }
                return ret;
            }
        });


        //endregion  ****************end of step type************************

        //region ************** Point type *********************************

        seriesType('point', 'candlestick', H.merge(defaultPlotOptions.candlestick, defaultPlotOptions.point,
            {
                dataGrouping: {

                    approximation: 'ohlc'
                }
            }), /** @lends seriesTypes.point */ {

            translate: function () {
                var series = this,
                    yAxis = series.yAxis,
                    points,
                    chart = series.chart,
                    rawPlotY,
                    rawPlotYBottom,
                    halfWidth,
                    value,
                    modifyValueMethod = _getModifyValueMethod(series),
                    hasModifyValue = !!modifyValueMethod;

                seriesTypes.column.prototype.translate.apply(series);

                points = series.points;

                // Do the translation
                points.forEach(function (point) {

                    halfWidth = Math.round(point.shapeArgs.width);

                    if (point.close != null) {
                        value = point.close;
                        if (hasModifyValue) {
                            value = modifyValueMethod(value);
                        }
                        point.plotClose = yAxis.toPixels(value, true);
                        point.infRawPlotClose = point.plotClose;

                    }
                    rawPlotY = H.isNumber(point.infRawPlotY) ? point.infRawPlotY : point.plotY;
                    rawPlotYBottom = H.isNumber(point.infRawYbottom) ? point.infRawYbottom : point.yBottom;

                    point.isInside =
                        point.plotY !== undefined &&
                        (point.plotClose - halfWidth) >= 0 &&
                        (point.plotClose + halfWidth) <= yAxis.len && // #3519
                        point.plotX >= 0 &&
                        point.plotX <= series.xAxis.len;


                    /**
                     * If point is not inside the clip box change the plot values accordingly
                     */
                    if (!point.isInside) {
                        if (!((point.plotClose - halfWidth) < yAxis.len || (point.plotClose + halfWidth) >= 0)) {
                            point.plotY = undefined;
                            point.graphic && point.graphic.destroy && point.graphic.destroy();
                            point.graphic = undefined;
                        }
                    }

                    // Align the tooltip to the high value to avoid covering the point
                    point.tooltipPos[1] =
                        point.plotHigh + yAxis.pos - series.chart.plotTop;
                });
            },
            /**
             * Draw the data points
             */
            drawPoints: function () {
                var series = this,
                    points = series.points,
                    chart = series.chart,
                    yAxis = series.yAxis,
                    graphic,
                    fullWidth,
                    halfWidth,
                    isNew;


                points.forEach(function (point) {

                    graphic = point.graphic;
                    isNew = !graphic;

                    if (point.plotY !== undefined) {

                        if (!graphic) {
                            point.graphic = graphic = chart.renderer.path()
                                .add(series.group);
                        }

                        graphic
                            .attr(series.pointAttribs(point, point.selected && 'select')) // #3897
                            .shadow(series.options.shadow);


                        fullWidth = Math.round(point.shapeArgs.width);
                        halfWidth = fullWidth / 2;

                        point.xMinMaxKey = 'close';
                        point.xPlotMax = point.plotClose - halfWidth;
                        point.xPlotMin = point.plotClose + halfWidth;
                        point.plotHigh = point.xPlotMax;
                        point.plotLow = point.xPlotMin;
                        var plotClose = point.plotClose,
                            path = [],
                            xWidth;

                        if (plotClose < 0) {
                            // center of the point is above the zero
                            xWidth = Math.sin(Math.acos((((-1) * plotClose ) / (halfWidth)))) * (halfWidth);
                            path.push('M', point.plotX - xWidth, 0,
                                'A', halfWidth, halfWidth, 0, 0, 0, point.plotX + xWidth, 0,
                                'Z');

                        } else if ((plotClose - halfWidth) < 0) {
                            // center of the point is below zero but upper edge of the point is above the zero
                            xWidth = Math.sin(Math.acos((( plotClose ) / (halfWidth)))) * (halfWidth);
                            path.push('M', point.plotX - xWidth, 0,
                                'A', halfWidth, halfWidth, 0, 1, 0, point.plotX + xWidth, 0,
                                'Z');

                        } else if (plotClose > yAxis.len) {
                            // center of the point is below the yAxis
                            xWidth = Math.sin(Math.acos(((plotClose - yAxis.len  ) / (halfWidth)))) * (halfWidth);
                            path.push('M', point.plotX - xWidth, yAxis.len,
                                'A', halfWidth, halfWidth, 0, 0, 1, point.plotX + xWidth, yAxis.len,
                                'Z');

                        } else if (( plotClose + halfWidth ) > yAxis.len) {
                            // center of the point is in side the yAxis but lower edge is below the y Axis
                            xWidth = Math.sin(Math.acos(((yAxis.len - plotClose) / (halfWidth)))) * (halfWidth);
                            path.push('M', point.plotX - xWidth, yAxis.len,
                                'A', halfWidth, halfWidth, 0, 1, 1, point.plotX + xWidth, yAxis.len,
                                'Z');
                        } else {
                            // pint is inside the y Axis
                            path = chart.renderer.symbols.circle(point.plotX - halfWidth, point.plotClose - halfWidth, fullWidth, fullWidth);
                        }


                        graphic[isNew ? 'attr' : 'animate']({
                            d: path
                        }).addClass(point.getClassName(), true);

                    }
                });

            },

            animate: null // Disable animation

            /**
             * @constructor seriesTypes.point.prototype.pointClass
             * @extends {Point}
             */
        }, /** @lends seriesTypes.point.prototype.pointClass.prototype */ {});
        //endregion ************** end of Point type *********************************

        //region **************  Equi Volume type *********************************

        seriesType('equivolume', 'candlestick', H.merge(defaultPlotOptions.candlestick,
            {
                dataGrouping: {

                    approximation: 'ohlc'
                }
            }), /** @lends seriesTypes.equivolume */ {

            pointAttrToOptions: {
                'stroke': 'color',
                'stroke-width': 'lineWidth'
            },

            /**
             * Postprocess mapping between options and SVG attributes
             */
            pointAttribs: function (point, state) {
                var attribs = seriesTypes.candlestick.prototype.pointAttribs.call(
                    this,
                    point,
                    state
                );
                /*,
                 options = this.options;
                 var upColor = options.upColor || options.color ,
                 upColorProp = options.upColorProp,
                 upLineColor = options.upLineColor || options.lineColor;
                 if(upColorProp)
                 attribs[upColorProp] = upColor;*/

                delete attribs.fill;

                /* var prevPoint = (point.index>0)? point.series.hasGroupedData ? point.series.groupedData[point.index -1] : point.series.data[point.index -1 ] : undefined;
                 var prevClose  = (prevPoint)?prevPoint.close: point.close;
                 if (point.close >= prevClose && !point.options.color) {
                 /!* If an individual line color is set, we need to merge the
                 point attributes, because they are shared between all up
                 points by inheritance from OHCLSeries.*!/
                 if (point.lineColor) {
                 upLineColor = point.lineColor;
                 }

                 attribs.stroke = upLineColor;
                 }*/
                return attribs;
            },
            /**
             * Translate the actual values into plot values
             */
            translate: function () {
                var series = this,
                    yAxis = series.yAxis,
                    points,
                    modifyValueMethod = _getModifyValueMethod(series),
                    hasModifyValue = !!modifyValueMethod,
                    chartObj = _getChartObj(this.chart.renderTo.id),
                    prevPoint,
                    translated = ['plotOpen', 'plotHigh', 'plotLow', 'plotClose', 'yBottom'], // translate OHLC for
                    pointVolume,
                    volumeMax,
                    seriesData,
                    count = 0;

                seriesTypes.column.prototype.translate.apply(series);

                points = series.points;


                if (series.groupedData && series.infVolume && series.infVolume.length > 0) {
                    volumeMax = series.infVolume.infMax();
                } else {

                    if ("undefined" !== typeof chartObj) {
                        seriesData = chartObj.getSeriesData(series, true);
                        if (seriesData) {
                            seriesData = seriesData.slice(series.cropStart, series.cropStart + points.length);
                            if (seriesData.length > 0)
                                volumeMax = seriesData.infMax(5);
                        }
                    }

                }

                points.forEach(function (point) {
                    [point.open, point.high, point.low, point.close, point.low].forEach(function (value, i) {

                        if (value !== null) {
                            if (hasModifyValue) {
                                value = modifyValueMethod(value);
                            }
                            point[translated[i]] = yAxis.toPixels(value, true);
                        }

                    });

                    point.plotOpen = point.xOpen = (prevPoint) ? (prevPoint.xOpen + point.plotClose) / 2 : point.plotOpen;
                    point.plotClose = (point.plotClose + point.plotOpen + point.plotHigh + point.plotLow) / 4;
                    point.plotHigh = Math.min(point.plotHigh, point.plotOpen, point.plotClose);
                    point.plotLow = Math.max(point.plotLow, point.plotOpen, point.plotClose);

                    if ("undefined" !== typeof chartObj && chartObj.isLog) {
                        pointVolume = (series.groupedData && series.infVolume) ? chartObj.getYLabel(series.infVolume[count], false, true, true) : chartObj.getYLabel(seriesData[count][5], false, true, true);
                        point.xpointWidth = (point.shapeArgs.width / chartObj.getYLabel(volumeMax, false, true, true)) * pointVolume;
                    }
                    else {
                        pointVolume = (series.groupedData && series.infVolume) ? series.infVolume[count] : seriesData[count][5];
                        point.xpointWidth = (point.shapeArgs.width / volumeMax) * pointVolume;
                    }

                    point.isInside =
                        point.plotY !== undefined &&
                        point.plotHigh >= 0 &&
                        point.plotLow <= yAxis.len && // #3519
                        point.plotX >= 0 &&
                        point.plotX <= series.xAxis.len;


                    /**
                     * If point is not inside the clip box change the plot values accordingly
                     */
                    if (!point.isInside) {
                        if (!((point.plotLow > yAxis.len && point.plotHigh < yAxis.len) || (point.plotHigh < 0 && point.plotLow > 0) )) {
                            point.plotY = undefined;
                            point.graphic && point.graphic.destroy && point.graphic.destroy();
                            point.graphic = undefined;
                        }
                    }

                    prevPoint = point;
                    count++;

                });

            },
            /**
             * Draw the data points
             */
            drawPoints: function () {
                var series = this,
                    points = series.points,
                    chart = series.chart,
                    yAxis = series.yAxis,
                    yAxisLen = yAxis.len,
                    pointWidth,
                    topBox,
                    bottomBox,
                    crispCorr,
                    crispX,
                    path,
                    halfWidth,
                    isNew,
                    plotHigh,
                    plotLow,
                    graphic,
                    isCompactedShape = _isCompactedShape(series);

                points.forEach(function (point) {

                    graphic = point.graphic;
                    isNew = !graphic;

                    if (point.plotY !== undefined) {

                        if (!graphic) {
                            point.graphic = graphic = chart.renderer.path()
                                .add(series.group);
                        }

                        graphic
                            .attr(series.pointAttribs(point, point.selected && 'select')) // #3897
                            .shadow(series.options.shadow);

                        pointWidth = point.xpointWidth;
                        plotLow = point.plotLow;
                        plotHigh = point.plotHigh;

                        // Crisp vector coordinates
                        crispCorr = (graphic.strokeWidth() % 2) / 2;
                        crispX = Math.round(point.plotX) - crispCorr; // #2596

                        topBox = Math.min(plotLow, plotHigh);
                        bottomBox = Math.max(plotLow, plotHigh);

                        halfWidth = Math.round(pointWidth / 2);
                        topBox = Math.round(topBox) + crispCorr;
                        bottomBox = Math.round(bottomBox) + crispCorr;
                        point.shapeArgs.height = halfWidth * 2;

                        if (bottomBox > yAxisLen) {
                            bottomBox = yAxisLen;
                        } else if (topBox < 0) {
                            topBox = 0;
                        }

                        if (isCompactedShape) {
                            path = [
                                'M',
                                crispX, bottomBox,
                                'L',
                                crispX, topBox,
                                'Z' // Use a close statement to ensure a nice rectangle #2602

                            ];
                        } else {
                            path = [
                                'M',
                                crispX - halfWidth, bottomBox,
                                'L',
                                crispX - halfWidth, topBox,
                                'L',
                                crispX + halfWidth, topBox,
                                'L',
                                crispX + halfWidth, bottomBox,
                                'Z' // Use a close statement to ensure a nice rectangle #2602

                            ];
                        }

                        graphic[isNew ? 'attr' : 'animate']({
                            d: path
                        }).addClass(point.getClassName(), true);
                    }
                });
            },

            animate: null // Disable animation

            /**
             * @constructor seriesTypes.ohlc.prototype.pointClass
             * @extends {Point}
             */
        }, /** @lends seriesTypes.ohlc.prototype.pointClass.prototype */ {});
        //endregion ************** end of Equi Volume type *********************************

        //region **************  Signal type *********************************

        seriesType('infUDSignal', 'flags', H.merge(defaultPlotOptions.flags, defaultPlotOptions.infUDSignal,
            {
                "dataGrouping": {
                    approximation: "average"
                }

            }), /** @lends seriesTypes.column */ {
            translate: function () {

                seriesTypes.column.prototype.translate.apply(this);

                var series = this,
                    options = series.options,
                    chart = series.chart,
                    points = series.points,
                    cursor = points.length - 1,
                    point,
                    lastPoint,
                    optionsOnSeries = options.onSeries,
                    onSeries = optionsOnSeries && chart.get(optionsOnSeries),
                    onKey = options.onKey || 'y',
                    step = onSeries && onSeries.options.step,
                    onData = onSeries && onSeries.points,
                    i = onData && onData.length,
                    xAxis = series.xAxis,
                    yAxis = series.yAxis,
                    xAxisExt = xAxis.getExtremes(),
                    xOffset = 0,
                    leftPoint,
                    lastX,
                    rightPoint,
                    currentDataGrouping;

                // relate to a master series
                if (onSeries && onSeries.visible && i) {
                    xOffset = (onSeries.pointXOffset || 0) + (onSeries.barW || 0) / 2;
                    currentDataGrouping = onSeries.currentDataGrouping;
                    lastX = onData[i - 1].x + (currentDataGrouping ? currentDataGrouping.totalRange : 0); // #2374

                    // sort the data points
                    H.stableSort(points, function (a, b) {
                        return (a.x - b.x);
                    });

                    onKey = 'plot' + onKey[0].toUpperCase() + onKey.substr(1);
                    while (i-- && points[cursor]) {
                        point = points[cursor];
                        leftPoint = onData[i];
                        if (leftPoint.x <= point.x && leftPoint[onKey] !== undefined) {
                            if (point.x <= lastX) { // #803

                                point.plotY = leftPoint[onKey];
                                point.plotX = leftPoint.plotX;
                                /* // interpolate between points, #666
                                 if (leftPoint.x < point.x && !step) {
                                 rightPoint = onData[i + 1];
                                 if (rightPoint && rightPoint[onKey] !== undefined) {
                                 point.plotY +=
                                 ((point.x - leftPoint.x) / (rightPoint.x - leftPoint.x)) * // the distance ratio, between 0 and 1
                                 (rightPoint[onKey] - leftPoint[onKey]); // the y distance
                                 }
                                 }*/
                            }
                            cursor--;
                            i++; // check again for points in the same x position
                            if (cursor < 0) {
                                break;
                            }
                        }
                    }
                }

                // Add plotY position and handle stacking
                points.forEach(function (point, i) {

                    var stackIndex;

                    // Undefined plotY means the point is either on axis, outside series
                    // range or hidden series. If the series is outside the range of the
                    // x axis it should fall through with an undefined plotY, but then
                    // we must remove the shapeArgs (#847).
                    if (point.plotY === undefined) {
                        if (point.x >= xAxisExt.min && point.x <= xAxisExt.max) {
                            // we're inside xAxis range
                            point.plotY = chart.chartHeight - xAxis.bottom -
                                (xAxis.opposite ? xAxis.height : 0) +
                                xAxis.offset - yAxis.top; // #3517
                        } else {
                            point.shapeArgs = {}; // 847
                        }
                    }
                    point.plotX += xOffset; // #2049
                    // if multiple flags appear at the same x, order them into a stack
                    lastPoint = points[i - 1];
                    if (lastPoint && lastPoint.plotX === point.plotX) {
                        if (lastPoint.stackIndex === undefined) {
                            lastPoint.stackIndex = 0;
                        }
                        stackIndex = lastPoint.stackIndex + 1;
                    }
                    point.stackIndex = stackIndex; // #3639
                });


            },

            sorted: false,
            noSharedTooltip: false,
            allowDG: false,
            takeOrdinalPosition: false, // #1074
            trackerGroups: ['markerGroup'],
            forceCrop: true,
            animate: null // Disable animation

            /**
             * @constructor seriesTypes.ohlc.prototype.pointClass
             * @extends {Point}
             */
        }, /** @lends seriesTypes.ohlc.prototype.pointClass.prototype */ {});
        //endregion ************** end of Signal type *********************************

        //region **************  Signal type *********************************

        seriesType('infsignal', 'flags', H.merge(defaultPlotOptions.flags, defaultPlotOptions.infsignal,
            {
                "dataGrouping": {
                    approximation: "average"
                }

            }), /** @lends seriesTypes.equivolume */ {

            sorted: false,
            noSharedTooltip: true,
            allowDG: false,
            takeOrdinalPosition: false, // #1074
            trackerGroups: ['markerGroup'],
            forceCrop: true,
            translate: function () {

                seriesTypes.column.prototype.translate.apply(this);

                var series = this,
                    options = series.options,
                    chart = series.chart,
                    points = series.points,
                    cursor = points.length - 1,
                    point,
                    lastPoint,
                    optionsOnSeries = options.onSeries,
                    onSeries = optionsOnSeries && chart.get(optionsOnSeries),
                    onKey = options.onKey || 'y',
                    step = onSeries && onSeries.options.step,
                    onData = onSeries && onSeries.points,
                    i = onData && onData.length,
                    xAxis = series.xAxis,
                    yAxis = series.yAxis,
                    xAxisExt = xAxis.getExtremes(),
                    xOffset = 0,
                    leftPoint,
                    lastX,
                    rightPoint,
                    currentDataGrouping;

                // relate to a master series
                if (onSeries && onSeries.visible && i) {
                    xOffset = (onSeries.pointXOffset || 0) + (onSeries.barW || 0) / 2;
                    currentDataGrouping = onSeries.currentDataGrouping;
                    lastX = onData[i - 1].x + (currentDataGrouping ? currentDataGrouping.totalRange : 0); // #2374

                    // sort the data points
                    H.stableSort(points, function (a, b) {
                        return (a.x - b.x);
                    });

                    onKey = 'plot' + onKey[0].toUpperCase() + onKey.substr(1);
                    while (i-- && points[cursor]) {
                        point = points[cursor];
                        leftPoint = onData[i];
                        if (leftPoint.x <= point.x && leftPoint[onKey] !== undefined) {
                            if (point.x <= lastX) { // #803

                                point.plotY = leftPoint[onKey];
                                point.plotX = leftPoint.plotX;
                                /* // interpolate between points, #666
                                 if (leftPoint.x < point.x && !step) {
                                 rightPoint = onData[i + 1];
                                 if (rightPoint && rightPoint[onKey] !== undefined) {
                                 point.plotY +=
                                 ((point.x - leftPoint.x) / (rightPoint.x - leftPoint.x)) * // the distance ratio, between 0 and 1
                                 (rightPoint[onKey] - leftPoint[onKey]); // the y distance
                                 }
                                 }*/
                            }
                            cursor--;
                            i++; // check again for points in the same x position
                            if (cursor < 0) {
                                break;
                            }
                        }
                    }
                }

                // Add plotY position and handle stacking
                points.forEach(function (point, i) {

                    var stackIndex;

                    // Undefined plotY means the point is either on axis, outside series
                    // range or hidden series. If the series is outside the range of the
                    // x axis it should fall through with an undefined plotY, but then
                    // we must remove the shapeArgs (#847).
                    if (point.plotY === undefined) {
                        if (point.x >= xAxisExt.min && point.x <= xAxisExt.max) {
                            // we're inside xAxis range
                            point.plotY = chart.chartHeight - xAxis.bottom -
                                (xAxis.opposite ? xAxis.height : 0) +
                                xAxis.offset - yAxis.top; // #3517
                        } else {
                            point.shapeArgs = {}; // 847
                        }
                    }
                    // point.plotX += xOffset; // #2049
                    // if multiple flags appear at the same x, order them into a stack
                    /*lastPoint = points[i - 1];
                     if (lastPoint && lastPoint.plotX === point.plotX) {
                     if (lastPoint.stackIndex === undefined) {
                     lastPoint.stackIndex = 0;
                     }
                     stackIndex = lastPoint.stackIndex + 1;
                     }
                     point.stackIndex = stackIndex; // #3639*/
                });


            },

            drawPoints: function () {
                var series = this,
                    points = series.points,
                    chart = series.chart,
                    renderer = chart.renderer,
                    plotX,
                    plotY,
                    options = series.options,
                    optionsY = options.y,
                    shape,
                    i,
                    point,
                    graphic,
                    stackIndex,
                    anchorX,
                    anchorY,
                    outsideRight,
                    yAxis = series.yAxis;

                i = points.length;
                while (i--) {
                    point = points[i];
                    outsideRight = point.plotX > series.xAxis.len;
                    plotX = point.plotX;
                    stackIndex = point.stackIndex;
                    shape = point.options.shape || options.shape;
                    plotY = point.plotY;

                    if (plotY !== undefined) {
                        plotY = point.plotY + optionsY - (stackIndex !== undefined && stackIndex * options.stackDistance);
                    }
                    anchorX = stackIndex ? undefined : point.plotX; // skip connectors for higher level stacked points
                    anchorY = stackIndex ? undefined : point.plotY;

                    graphic = point.graphic;

                    // Only draw the point if y is defined and the flag is within the visible area
                    if (plotY !== undefined && plotX >= 0 && !outsideRight) {

                        // Create the flag
                        if (!graphic) {
                            graphic = point.graphic = renderer.label(
                                '',
                                plotX,
                                plotY,
                                shape,
                                anchorX,
                                anchorY,
                                options.useHTML, true
                            )

                                .attr(series.pointAttribs(point))
                                .css(H.merge(options.style, point.style))

                                .attr({
                                    align: shape === 'flag' ? 'left' : 'center',
                                    width: options.width,
                                    height: options.height,
                                    'text-align': 'bottom'
                                })
                                .addClass('highcharts-point')
                                .add(series.markerGroup);

                            // Add reference to the point for tracker (#6303)
                            if (point.graphic.div) {
                                point.graphic.div.point = point;
                            }


                            graphic.shadow(options.shadow);

                        }

                        if (plotX > 0) { // #3119
                            plotX -= graphic.strokeWidth() % 2; // #4285
                        }

                        // Plant the flag
                        graphic.attr({
                            text: point.options.title || options.title || 'A',
                            x: plotX,
                            y: plotY,
                            anchorX: anchorX,
                            anchorY: anchorY
                        });

                        // Set the tooltip anchor position
                        point.tooltipPos = chart.inverted ? [yAxis.len + yAxis.pos - chart.plotLeft - plotY, series.xAxis.len - plotX] : [plotX, plotY + yAxis.pos - chart.plotTop]; // #6327
                        if (series.options.shape == "uparw") {
                            graphic.text.attr("y", graphic.box.anchorY + graphic.box.height + parseInt(graphic.text.styles.fontSize));//$(graphic.element).position().top - anchorY); // To set y Label to the bottom
                        } else if (series.options.shape == "downarw") {
                            graphic.text.attr("y", graphic.box.anchorY - graphic.box.height - 1 /*+ parseInt(graphic.text.styles.fontSize)*/);//$(graphic.element).position().top - anchorY); // To set y Label to the bottom
                        }

                    } else if (graphic) {
                        point.graphic = graphic.destroy();
                    }

                }

                // Might be a mix of SVG and HTML and we need events for both (#6303)
                if (options.useHTML) {
                    H.wrap(series.markerGroup, 'on', function (proceed) {
                        return H.SVGElement.prototype.on.apply(
                            proceed.apply(this, [].slice.call(arguments, 1)), // for HTML
                            [].slice.call(arguments, 1)); // and for SVG
                    });
                }

            },
            animate: null // Disable animation

            /**
             * @constructor seriesTypes.ohlc.prototype.pointClass
             * @extends {Point}
             */
        }, /** @lends seriesTypes.ohlc.prototype.pointClass.prototype */ {});
        //endregion ************** end of Signal type *********************************

        //region **************  plot Range type *********************************
        var theme = Highcharts.theme && Highcharts.theme.plotOptions.plotrange || {};
        seriesType('plotarearange', 'arearange', H.merge(defaultPlotOptions.arearange, defaultPlotOptions.arearange, theme, {
            dataGrouping: {
                enabled: true,
                approximation: function (low, high) {

                    var NUMBER = 'number';

                    var sum = function (arr) {
                        var len = arr.length,
                            ret;

                        /* 1. it consists of nulls exclusively*/
                        if (!len && arr.hasNulls) {
                            ret = null;
                            /* 2. it has a length and real values*/
                        } else if (len) {
                            ret = 0;
                            while (len--) {
                                ret += arr[len];
                            }
                        }
                        /*3. it has zero length, so just return undefined
                         => doNothing()*/

                        return ret;
                    };

                    var len = low.length;
                    low = sum(low);

                    /*If we have a number, return it divided by the length. If not, return
                     null or undefined based on what the sum method finds.*/
                    if (typeof low === NUMBER && len) {
                        low = low / len;
                    }
                    len = high.length;
                    high = sum(high);

                    /*If we have a number, return it divided by the length. If not, return
                     null or undefined based on what the sum method finds.*/
                    if (typeof high === NUMBER && len) {
                        high = high / len;
                    }


                    if (typeof low === NUMBER || typeof high === NUMBER) {
                        return [low, high];
                    }
                    /* else, return is undefined*/
                }
            }
        }), /** @lends seriesTypes.equivolume */ {
            pointArrayMap: ['high', 'low'], // array point configs are mapped to this
            toYData: function (point) { // return a plain array for speedy calculation
                return [point.high, point.low];
            },
            pointValKey: 'high',
            /**
             * Extend the line series' getSegmentPath method by applying the segment
             * path to both lower and higher values of the range
             */
            getGraphPath: function (points) {

                var highPoints = [],
                    highAreaPoints = [],
                    i,
                    getGraphPath = seriesTypes.area.prototype.getGraphPath,
                    point,
                    pointShim,
                    linePath,
                    lowerPath,
                    options = this.options,
                    connectEnds = this.chart.polar && options.connectEnds !== false,
                    connectNulls = options.connectNulls,
                    step = options.step,
                    higherPath,
                    higherAreaPath,
                    keyIdx = H.inArray(this.pointValKey, this.pointArrayMap);

                points = points || this.points;
                i = points.length;

                // Create the top line and the top part of the area fill. The area fill compensates for
                // null points by drawing down to the lower graph, moving across the null gap and
                // starting again at the lower graph.
                i = points.length;
                var lowerPoints = (this.hasGroupedData) ? [] : points;
                while (i--) {
                    point = points[i];

                    var hasGrpNull = (point.dataGroup &&
                        (!options.data[point.dataGroup.start + point.dataGroup.length][keyIdx + 1] || !options.data[point.dataGroup.start + point.dataGroup.length + 1] || !options.data[point.dataGroup.start + point.dataGroup.length + 1][keyIdx + 1]));


                    if (this.hasGroupedData) {
                        lowerPoints.push(point);
                    }
                    if (!point.isNull && !connectEnds && !connectNulls &&
                        (!points[i + 1] || points[i + 1].isNull || hasGrpNull )
                    ) {
                        highAreaPoints.push({
                            plotX: point.plotX,
                            plotY: point.plotY,
                            doCurve: false // #5186, gaps in areasplinerange fill
                        });
                    }

                    pointShim = {
                        polarPlotY: point.polarPlotY,
                        rectPlotX: point.rectPlotX,
                        yBottom: point.yBottom,
                        plotX: H.pick(point.plotHighX, point.plotX), // plotHighX is for polar charts
                        plotY: point.plotHigh,
                        isNull: point.isNull
                    };

                    highAreaPoints.push(pointShim);

                    highPoints.push(pointShim);

                    hasGrpNull = (point.dataGroup &&
                        (!options.data[point.dataGroup.start][keyIdx + 1] || !options.data[point.dataGroup.start - 1] || !options.data[point.dataGroup.start - 1][keyIdx + 1]));
                    if (points[i - 1] && hasGrpNull) {
                        highAreaPoints.push({
                            plotX: point.plotX,
                            plotY: point.plotHigh,
                            doCurve: false // #5186, gaps in areasplinerange fill
                        });

                        pointShim = {
                            yBottom: null,
                            plotX: point.plotX - this.closestPointRangePx / 2, // plotHighX is for polar charts
                            plotY: null,
                            isNull: true
                        };

                        highAreaPoints.push(pointShim);

                        highPoints.push(pointShim);
                        lowerPoints.push(pointShim);
                    }

                    if (!hasGrpNull && !point.isNull && !connectEnds && !connectNulls &&
                        (!points[i - 1] || points[i - 1].isNull
                        )
                    ) {
                        highAreaPoints.push({
                            plotX: point.plotX,
                            plotY: point.plotY,
                            doCurve: false // #5186, gaps in areasplinerange fill
                        });
                    }
                }
                if (this.hasGroupedData) {
                    lowerPoints.reverse();
                }
                // Get the paths
                lowerPath = getGraphPath.call(this, lowerPoints);
                if (step) {
                    if (step === true) {
                        step = 'left';
                    }
                    options.step = {
                        left: 'right',
                        center: 'center',
                        right: 'left'
                    }[step]; // swap for reading in getGraphPath
                }
                higherPath = getGraphPath.call(this, highPoints);
                higherAreaPath = getGraphPath.call(this, highAreaPoints);
                options.step = step;

                // Create a line on both top and bottom of the range
                linePath = [].concat(lowerPath, higherPath);

                // For the area path, we need to change the 'move' statement into 'lineTo' or 'curveTo'
                if (!this.chart.polar && higherAreaPath[0] === 'M') {
                    higherAreaPath[0] = 'L'; // this probably doesn't work for spline
                }

                this.graphPath = linePath;
                this.areaPath = this.areaPath.concat(lowerPath, higherAreaPath);

                // Prepare for sideways animation
                linePath.isArea = true;
                linePath.xMap = lowerPath.xMap;
                this.areaPath.xMap = lowerPath.xMap;

                return linePath;
            },
            animate: null // Disable animation

            /**
             * @constructor seriesTypes.ohlc.prototype.pointClass
             * @extends {Point}
             */
        }, /** @lends seriesTypes.ohlc.prototype.pointClass.prototype */ {});
        //endregion ************** end of Plot Range type *********************************

        //region **************  plot Range type *********************************
        var theme = Highcharts.theme && Highcharts.theme.plotOptions.plotrange || {};
        seriesType('plotrange', 'columnrange', H.merge(defaultPlotOptions.columnrange, defaultPlotOptions.column, theme, {
            dataGrouping: {
                enabled: true,
                approximation: function (low, high) {

                    var NUMBER = 'number';

                    var sum = function (arr) {
                        var len = arr.length,
                            ret;

                        /* 1. it consists of nulls exclusively*/
                        if (!len && arr.hasNulls) {
                            ret = null;
                            /* 2. it has a length and real values*/
                        } else if (len) {
                            ret = 0;
                            while (len--) {
                                ret += arr[len];
                            }
                        }
                        /*3. it has zero length, so just return undefined
                         => doNothing()*/

                        return ret;
                    };

                    var len = low.length;
                    low = sum(low);

                    /*If we have a number, return it divided by the length. If not, return
                     null or undefined based on what the sum method finds.*/
                    if (typeof low === NUMBER && len) {
                        low = low / len;
                    }
                    len = high.length;
                    high = sum(high);

                    /*If we have a number, return it divided by the length. If not, return
                     null or undefined based on what the sum method finds.*/
                    if (typeof high === NUMBER && len) {
                        high = high / len;
                    }


                    if (typeof low === NUMBER || typeof high === NUMBER) {
                        return [low, high];
                    }
                    /* else, return is undefined*/
                }
            },
            states: {

                /**
                 */
                hover: {
                    enabled: false
                }
            }
        }), /** @lends seriesTypes.equivolume */ {
            pointArrayMap: ['high', 'low'], // array point configs are mapped to this
            toYData: function (point) { // return a plain array for speedy calculation
                return [point.high, point.low];
            },
            pointValKey: 'low',
            translate: function () {
                var series = this,
                    hchart = series.chart,
                    yAxis = series.yAxis,
                    colProto = seriesTypes.columnrange.prototype,
                    indWithComparision = (_getModifyValueMethod(this.chart.series[0]) && this.options.infType == 'indicator' && infChart.util.isSeriesInBaseAxis(series.yAxis.options.id)),
                    grpdiff = 0,
                    diff = 0,
                    safeDistance = Math.max(hchart.chartWidth, hchart.chartHeight) + 999;

                colProto.translate.apply(series);

                if (indWithComparision) {
                    var chart = _getChartObj(this.chart.renderTo.id);
                    var cropStart = this.chart.series[0].cropStart;

                    if (chart.processedData.data.length > 0 && cropStart && chart.compareSymbols.count > 0) {

                        diff = chart.processedData.data[cropStart][4] - chart.processedData.data[0][4];

                    }
                }

                // Don't draw too far outside plot area (#6835)
                function safeBounds(pixelPos) {
                    return Math.min(Math.max(-safeDistance,
                        pixelPos
                    ), safeDistance);
                }

                // Set plotLow and plotHigh
                series.points.forEach(function (point) {
                    var low = point.low,
                        high = point.high,
                        plotY = point.plotY,
                        shapeArgs = point.shapeArgs;
                    if (H.isNumber(point.high)) {
                        if (series.chart.series[0].currentDataGrouping) {
                            high = point.high - diff;
                        }
                        else {
                            high = point.high - diff;
                            // point.high
                            point.plotHigh = yAxis.translate(point.high, 0, 1, 0, 1);
                        }
                    }
                    if (H.isNumber(point.low)) {
                        if (series.chart.series[0].currentDataGrouping) {
                            low = point.low + grpdiff;
                        }
                        else {
                            low = point.options.low - diff;
                        }
                    }
                    var yValue = point.y;
                    if (series.chart.series[0].currentDataGrouping) {
                        yValue = yValue - diff;
                    }
                    else {
                        yValue = yValue - diff;
                    }

                    point.plotY = plotY = (typeof yValue === 'number' && yValue !== Infinity) ?
                        Math.min(Math.max(-1e5, yAxis.translate(yValue, 0, 1, 0, 1)), 1e5) : // #3201
                        UNDEFINED;
                    point.yBottom = point.plotY;

                    if (high === null && low === null) {
                        point.y = null;
                    } else if (low === null) {
                        point.plotLow = point.plotY = null;
                        point.plotHigh = safeBounds(
                            yAxis.translate(high, 0, 1, 0, 1)
                        );
                    } else if (high === null) {
                        point.plotLow = plotY;
                        point.plotHigh = null;
                    } else {
                        point.plotLow = plotY;
                        point.plotHigh = yAxis.translate(high, 0, 1, 0, 1);
                        shapeArgs.height = point.plotLow - point.plotHigh;
                        shapeArgs.y = point.plotHigh;
                    }

                });


            },
            drawPoints: function () {
                var series = this,
                    chart = this.chart,
                    options = series.options,
                    renderer = chart.renderer,
                    animationLimit = options.animationLimit || 250,
                    mainSeries = chart.series[0],
                    shapeArgs,
                    keyIdx = H.inArray(this.pointValKey, this.pointArrayMap),
                    prevPoint;

                // draw the columns
                series.points.forEach(function (point) {
                    var plotY = point.plotY,
                        graphic = point.graphic;

                    if (H.isNumber(plotY) && point.y !== null && H.isNumber(point.plotX) && point.x != null) {
                        shapeArgs = point.shapeArgs;

                        //if (Math.round(Math.abs(point.plotX - shapeArgs.x)) == shapeArgs.width) {
                        //shapeArgs.width = /*shapeArgs.width *2 - */Math.abs(point.plotX - shapeArgs.x) * 2;
                        var prevWidth = shapeArgs.width,
                            shapeMiddle = Math.min(series.xAxis.toPixels(point.x), point.plotX + prevWidth / 2);
                        shapeArgs.width = mainSeries.closestPointRangePx;
                        //}
                        //if (shapeArgs.x < point.plotX && ((!point.dataGroup && series.points[point.index + 1] && series.points[point.index + 1].isNull ) || (point.dataGroup &&point.dataGroup.length>1))) {
                        if (!point.dataGroup && prevPoint && !prevPoint.isNull) {
                            shapeArgs.x = prevPoint.shapeArgs.x + prevPoint.shapeArgs.width;
                        } else if (point.dataGroup && prevPoint && (point.dataGroup.start - (prevPoint.dataGroup.start + prevPoint.dataGroup.length) <= 1)) {
                            shapeArgs.x = prevPoint.shapeArgs.x + prevPoint.shapeArgs.width;
                        } else if ((shapeMiddle - shapeArgs.width / 2) < shapeArgs.x) {
                            shapeArgs.x = shapeMiddle - shapeArgs.width / 2;
                        }

                        //}
                        if (graphic) { // update
                            graphic[chart.pointCount < animationLimit ? 'animate' : 'attr'](
                                H.merge(shapeArgs)
                            );

                        } else {
                            point.graphic = graphic = renderer[point.shapeType](shapeArgs)
                                .add(point.group || series.group);
                        }


                        // Presentational
                        graphic
                            .attr(series.pointAttribs(point, point.selected && 'select'))
                            .shadow(options.shadow, null, options.stacking && !options.borderRadius);


                        graphic.addClass(point.getClassName(), true);

                    } else if (graphic) {
                        point.graphic = graphic.destroy(); // #1269
                    }
                    prevPoint = point;
                });
            },

            animate: null // Disable animation

            /**
             * @constructor seriesTypes.ohlc.prototype.pointClass
             * @extends {Point}
             */
        }, /** @lends seriesTypes.ohlc.prototype.pointClass.prototype */ {});
        //endregion ************** end of Plot Range type *********************************

        //region *************** Flag array symbol ***************

        Highcharts.SVGRenderer.prototype.symbols.arr = function (x, y, w, h, options) {
            var anchorX = options && options.anchorX || 0,
                anchorY = options && options.anchorY || 0,
                path;

            if (y > anchorY) {
                //points up
                path = ['M', anchorX, anchorY, 'L', anchorX + w / 2, anchorY + h, 'L', anchorX + w / 4, anchorY + h,
                    'L', anchorX + w / 4, y + h, 'L', anchorX - w / 4, y + h, 'L', anchorX - w / 4, anchorY + h, 'L', anchorX - w / 2, anchorY + h, 'L', anchorX, anchorY];

            } else {
                //points down
                y = Math.max(0, y);
                var maxWidth = Math.max(4, (anchorY - y) / 3);
                w = Math.min(maxWidth, w);
                path = ['M', anchorX - w / 2, anchorY - h, 'L', anchorX, anchorY, 'L', anchorX + w / 2, anchorY - h,
                    'L', anchorX + w / 4, anchorY - h, 'L', anchorX + w / 4, y, 'L', anchorX - w / 4, y,
                    'L', anchorX - w / 4, anchorY - h, 'L', anchorX - w / 2, anchorY - h];
            }

            return path;
        };
        if (Highcharts.VMLRenderer) {
            Highcharts.VMLRenderer.prototype.symbols.arr = Highcharts.SVGRenderer.prototype.symbols.arr;
        }

        Highcharts.SVGRenderer.prototype.symbols.uparw = function (x, y, w, h, options) {
            var anchorX = options && options.anchorX || 0,
                anchorY = options && options.anchorY || 0,
                path;

            //if (y > anchorY) {
            //points up
            //y = Math.min(0,y);
            var ytop = anchorY;
            //ytop = Math.max(ytop,0);
            var ybottom = Math.max(anchorY + h, y);
            var maxWidth = Math.max(4, (ybottom - ytop) / 2);
            w = Math.min(maxWidth, w);
            path = ['M', anchorX, ytop, 'L', anchorX + w / 2, ytop + h / 2, 'L', anchorX + w / 4, ytop + h / 2,
                'L', anchorX + w / 4, ybottom, 'L', anchorX - w / 4, ybottom, 'L', anchorX - w / 4, ytop + h / 2, 'L', anchorX - w / 2, ytop + h / 2, 'L', anchorX, ytop];
            //}

            return path;
        };

        if (Highcharts.VMLRenderer) {
            Highcharts.VMLRenderer.prototype.symbols.uparw = Highcharts.SVGRenderer.prototype.symbols.uparw;
        }
        Highcharts.SVGRenderer.prototype.symbols.downarw = function (x, y, w, h, options) {
            var anchorX = options && options.anchorX || 0,
                anchorY = options && options.anchorY || 0,
                path;

            //points down
            var yBottom = Math.max(anchorY, y + h);

            var ytop = Math.max(anchorY - h, 0, y);
            var maxWidth = Math.max(4, (yBottom - ytop) / 2);
            w = Math.min(maxWidth, w);
            path = ['M', anchorX - w / 2, yBottom - h / 2, 'L', anchorX, yBottom, 'L', anchorX + w / 2, yBottom - h / 2,
                'L', anchorX + w / 4, yBottom - h / 2, 'L', anchorX + w / 4, ytop, 'L', anchorX - w / 4, ytop,
                'L', anchorX - w / 4, yBottom - h / 2, 'L', anchorX - w / 2, yBottom - h / 2];
            return path;
        };

        if (Highcharts.VMLRenderer) {
            Highcharts.VMLRenderer.prototype.symbols.downarw = Highcharts.SVGRenderer.prototype.symbols.downarw;
        }

        //endregion *************** Flag array symbol ***************

    };

    var _extendDefaultCharTypes = function () {

        H.wrap(H.seriesTypes.column.prototype, 'pointAttribs', function (proceed, point, state) {
            let series = this;
            if (series.chart.isChartDragging) {
                let options = series.options;
                let p2o = series.pointAttrToOptions || {};
                let strokeWidthOption = p2o['stroke-width'] || 'borderWidth';
                let strokeOption = p2o.stroke || 'borderColor'
                return {
                    fill: point && point.color,
                    stroke: ((point && point[strokeOption]) || options[strokeOption] || fill),
                    'stroke-width': (point && point[strokeWidthOption]) || options[strokeWidthOption] || series[strokeWidthOption] || 0,
                    opacity: point.opacity
                }
            } else {
                return proceed.call(series, point, state);
            }
        });

        H.wrap(H.seriesTypes.candlestick.prototype, 'drawPoints', function (proceed) {
            var series = this, //state = series.state,
                points = series.points,
                chart = series.chart,
                reversedYAxis = series.yAxis.reversed,
                test,
                isCompactedShape = _isCompactedShape(series);

            if (isCompactedShape) {
                for (var _i = 0, points_1 = points; _i < points_1.length; _i++) {
                    var point = points_1[_i];
                    var graphic = point.graphic,
                        plotOpen = void 0,
                        plotClose = void 0,
                        topBox = void 0,
                        bottomBox = void 0,
                        hasTopWhisker = void 0,
                        hasBottomWhisker = void 0,
                        crispCorr = void 0,
                        crispX = void 0,
                        path = void 0,
                        halfWidth = void 0;
                    var isNew = !graphic;
                    if (typeof point.plotY !== 'undefined') {
                        if (!graphic) {
                            point.graphic = graphic = chart.renderer.path()
                                .add(series.group);
                        }
                        if (!series.chart.styledMode) {
                            graphic
                                .attr(series.pointAttribs(point, (point.selected && 'select'))) // #3897
                                .shadow(series.options.shadow);
                        }
                        // Crisp vector coordinates
                        crispCorr = (graphic.strokeWidth() % 2) / 2;
                        // #2596:
                        crispX = Math.round(point.plotX) - crispCorr;
                        plotOpen = point.plotOpen;
                        plotClose = point.plotClose;
                        topBox = Math.min(plotOpen, plotClose);
                        bottomBox = Math.max(plotOpen, plotClose);
                        halfWidth = Math.round(point.shapeArgs.width / 2);
                        hasTopWhisker = reversedYAxis ?
                            bottomBox !== point.yBottom :
                            Math.round(topBox) !==
                                Math.round(point.plotHigh);
                        hasBottomWhisker = reversedYAxis ?
                            Math.round(topBox) !==
                                Math.round(point.plotHigh) :
                            bottomBox !== point.yBottom;
                        topBox = Math.round(topBox) + crispCorr;
                        bottomBox = Math.round(bottomBox) + crispCorr;
                        // Create the path. Due to a bug in Chrome 49, the path is
                        // first instanciated with no values, then the values
                        // pushed. For unknown reasons, instanciating the path array
                        // with all the values would lead to a crash when updating
                        // frequently (#5193).
                        path = [];
                        var bottom = hasBottomWhisker ? Math.round(point.yBottom) : bottomBox,
                            top = hasTopWhisker ? Math.round(point.plotHigh) : topBox;

                        path.push(
                            'M',
                            crispX, bottom, // #460, #2094
                            'L',
                            crispX, bottom == top ? top - crispCorr : top, // #460, #2094
                            'Z' // Use a close statement to ensure a nice rectangle #260
                        );
                        graphic[isNew ? 'attr' : 'animate']({ d: path })
                            .addClass(point.getClassName(), true);
                    }
                }
            } else {
                proceed.call(this);
            }
        });

        H.wrap(H.seriesTypes.ohlc.prototype, 'pointAttribs', function (proceed, point, state) {
            var attribs = seriesTypes.column.prototype.pointAttribs.call(this, point, state),
                options = this.options,
                stateOptions;

            delete attribs.fill;
            if (!point.options.color && options.upColor && point.open < point.close) {
                attribs.stroke = options.upColor;
            }

            // Select or hover states
            if (state) {
                stateOptions = options.states[state];
                attribs.stroke = stateOptions.lineColor || attribs.stroke;
                attribs['stroke-width'] =
                    stateOptions.lineWidth || attribs['stroke-width'];
            }

            return attribs;
        });

        // modify arearange indicator plot values when there is a comparison since indicators are drawn below the main chart if not modified.
        H.wrap(H.seriesTypes.arearange.prototype, 'translate', function (proceed) {

            proceed.call(this);

            var series = this,
                yAxis = series.yAxis,
                modifyValueMethod = _getModifyValueMethod(series),
                hasModifyValue = !!modifyValueMethod,
                parallelToBaseWithComparision = _isIndicatorWithComparison(series),
                grpdiff = 0, diff = 0,

                mainSeriesCompareValue = _getMainSeriesCompareValue(series.chart);


            H.seriesTypes.area.prototype.translate.apply(series);

            if (parallelToBaseWithComparision) {
                diff = _getMainSeriesCompareValue(series.chart);


                // Set plotLow and plotHigh
                series.points.forEach(function (point) {
                    var low = point.low,
                        high = point.high,
                        plotY = point.plotY;
                    if (H.isNumber(point.high)) {
                        if (series.chart.series[0].currentDataGrouping) {
                            high = (point.high / mainSeriesCompareValue - 1 ) * 100;
                        }
                        else {
                            high = (point.high / mainSeriesCompareValue - 1 ) * 100;
                            // point.high
                            point.plotHigh = yAxis.translate(high, 0, 1, 0, 1);
                        }
                    }
                    if (H.isNumber(point.low)) {
                        if (series.chart.series[0].currentDataGrouping) {
                            low = (point.low / mainSeriesCompareValue - 1 ) * 100;
                        }
                        else {
                            low = (point.options.low / mainSeriesCompareValue - 1 ) * 100;
                        }
                    }
                    var yValue = point.y;

                    if (series.chart.series[0].currentDataGrouping) {
                        yValue = (yValue / mainSeriesCompareValue - 1 ) * 100;
                    }
                    else {
                        yValue = (yValue / mainSeriesCompareValue - 1 ) * 100;
                    }

                    point.plotY = plotY = (typeof yValue === 'number' && yValue !== Infinity) ?
                        Math.min(Math.max(-1e5, yAxis.translate(yValue, 0, 1, 0, 1)), 1e5) : // #3201
                        UNDEFINED;
                    point.yBottom = point.plotY;

                    if (high === null && low === null) {
                        point.y = null;
                    } else if (low === null) {
                        point.plotLow = point.plotY = null;
                        point.plotHigh = yAxis.translate(high, 0, 1, 0, 1);
                    } else if (high === null) {
                        yValue = low;
                        point.plotLow = yAxis.translate(low, 0, 1, 0, 1);
                        point.plotHigh = null;
                    } else {
                        yValue = low;
                        point.plotLow = yAxis.translate(low, 0, 1, 0, 1);
                        point.plotHigh = yAxis.translate(high, 0, 1, 0, 1);
                    }
                    point.negative = yValue < (series.options.threshold || 0);
                });

            }
            // Postprocess plotHigh
            if (this.chart.polar) {
                this.points.forEach(function (point) {
                    series.highToXY(point);
                });
            }
        });

        /**
         * Extended this to control the taking hidden points into account when calculating yAxis min/max
         * An issue occured in depth graph which half of the yAxis is empty due to
         * last hidden point which had a lager value was taken into account when calculating yAxis min/max.
         * However this fix kept on hold in the depth chart since it leads to line breaks inside the visible chart area (As per the requirement both lines should be drawn to both ends)
         */
        H.wrap(H.seriesTypes.line.prototype, 'init', function (proceed) {
            proceed.apply(this, [].slice.call(arguments, 1));
            if (this.options && !isNaN(this.options.cropShoulder)) {
                this.cropShoulder = this.options.cropShoulder;

            }
        });

    };

    var _extendHighChartsForAxisPositioning = function () {
        var H = Highcharts;

        /**
         * Wrapped up this method to set pixel interval of the y/x axis manually when needed
         */
        H.wrap(H.Axis.prototype, 'setTickInterval', function (proceed, secondPass) {

            var axis = this,
                ichart = _getChartObj(axis.chart.renderTo.id);

            if ("undefined" !== typeof ichart && ichart.chart) {
                ichart.setAxisPixelInterval(axis);
            }

            proceed.call(this, secondPass);


        });

        /**
         * Wrapped up this method to do things required to do before/after rendering axis labels
         */
        H.wrap(H.Axis.prototype, 'renderUnsquish', function (proceed) {
            var axis = this,
                ichart = _getChartObj(axis.chart.renderTo.id);

            //if (!axis.isXAxis && "undefined" !== typeof ichart && ichart.chart) {
            //    ichart._setYAxisWidthOnRedraw(axis);
            //}

            proceed.call(this);

            if ("undefined" !== typeof ichart && ichart.chart) {
                //if (!axis.isXAxis){
                //    ichart.setYAxisWidthOnRedraw(axis);
                //}
                ichart.afterRenderAxisLabels(axis);
            }

        });

        // Wrapping aup the Axis.getOffset method to adjust the axis labels width according to the drawing and other labels
        H.wrap(H.Axis.prototype, 'getOffset', function (proceed) {
            var axis = this,
                chart = axis.chart,
                side = axis.side,
                options = axis.options,
                xChart = _getChartObj(this.chart.renderTo.id),
                offset;
            proceed.call(this);

            if (!axis.isXAxis) {
                if (xChart && options.id === "#0") {
                    offset = infChart.manager.getAxisLabelOffset(xChart.id, this);
                    if (offset) {
                        chart.axisOffset[side] = offset;
                    }
                } else if (infChart.depthManager && infChart.depthManager.isDepthChart(chart)) {
                    offset = infChart.depthManager.getAxisLabelOffset(chart, this);
                    if (offset) {
                        chart.axisOffset[side] = offset;
                    }
                }
            }
        });
    };

    /**
     * Extend Highchart to show/hide tooltip according to xInfinit chart's tooltip property
     * @private
     */
    var _extendHighChartsForHideTooltip = function () {
        // Wrappers for Highcharts
        var H = Highcharts;
        H.wrap(H.Tooltip.prototype, 'refresh', function (proceed, pointOrPoints, mouseEvent) {
            var iChart = _getChartObj(this.chart.renderTo.id);
            if ("undefined" === typeof iChart || (pointOrPoints && pointOrPoints.length)) {
                proceed.call(this, pointOrPoints, mouseEvent);
            }
        });

        /**
         * Avoid mouse move functions when dragging an annotation
         */
        H.wrap(H.Pointer.prototype, 'onContainerMouseMove', function (proceed, mouseEvent) {
            var iChart = _getChartObj(this.chart.renderTo.id);
            var hChart = this.chart;

            hChart.infLastMouseMoveEvent = mouseEvent; // keep this to use in update ticks

            if (hChart.infTrackerHidden) {
                $(hChart.renderTo).find(".highcharts-tracker").show();
                hChart.infTrackerHidden = false;
            }
            // if ((!hChart.annotations || hChart.annotations.allowZoom) && ("undefined" === typeof iChart || !iChart.isLoading())) {
            //     proceed.call(this, mouseEvent);
            // }
            if (("undefined" === typeof iChart || !iChart.isLoading())) {
                proceed.call(this, mouseEvent);
            }
            hChart.infMouseIn = true;
            hChart.infMouseMoved = true;
        });

        /**
         * Set the mouse in false when leaving the mouse from the chart
         */
        H.wrap(H.Pointer.prototype, 'onContainerMouseLeave', function (proceed, mouseEvent) {
            var hChart = H.charts[H.hoverChartIndex];

            if (hChart) {
                delete hChart.infLastMouseMoveEvent; //  no need to keep this when mouse is left.
                hChart.infMouseIn = false;
                proceed.call(this, mouseEvent);

                if (_isXChart(hChart)) {
                    infChart.manager.chartMouseOutEvent(hChart);
                }
            } else {
                proceed.call(this, mouseEvent);
            }
        });

        /**
         * Set the touch move happens in the chart
         */
        H.wrap(H.Pointer.prototype, 'onContainerTouchMove', function (proceed, touchEvent) {
            //var hChart = H.charts[H.hoverChartIndex];
            var hChart = H.charts && H.chart.length > 0 && H.charts[H.charts.length - 1];

            if (hChart) {
                if(!hChart.annotationChangeInProgress && !hChart.translateInProgress){
                    delete hChart.infLastMouseMoveEvent; //  no need to keep this when mouse is left.
                    hChart.infMouseIn = false;
                    proceed.call(this, touchEvent);

                    if (_isXChart(hChart)) {
                        infChart.manager.chartMouseOutEvent(hChart);
                    }
                }
            } else {
                proceed.call(this, touchEvent);
            }
        });

        /**
         * Set the touch start happens in the chart
         */
        H.wrap(H.Pointer.prototype, 'onContainerTouchStart', function (proceed, touchEvent) {
            var hChart = H.charts && H.chart.length > 0 && H.charts[H.charts.length - 1];

            if (hChart) {
                if(!hChart.annotationChangeInProgress && !hChart.translateInProgress){        
                    if (this.touchSelect(touchEvent)) {
                        this.onContainerMouseDown(touchEvent);
                    }
                    else {
                        this.zoomOption(touchEvent);
                        this.touch(touchEvent, true);
                    }
                }
            } else {
                proceed.call(this, touchEvent);
            }   
        });

        /**
         * Set the touch end happens in the chart
         */
        H.wrap(H.Pointer.prototype, 'onDocumentTouchEnd', function (proceed, touchEvent) {
            var hChart = H.charts && H.chart.length > 0 && H.charts[H.charts.length - 1];

            if (hChart) {
                if(!hChart.annotationChangeInProgress && !hChart.translateInProgress){        
                    hChart.pointer.drop(touchEvent);
                }
            } else {
                proceed.call(this, touchEvent);
            }   
        });

        /**
         * To avoid incorrect tooltip time on some signals whose width is greater than the pixel width between two base points
         */
        H.wrap(H.Point.prototype, 'onMouseOver', function (proceed, e) {
            var point = this,
                series = point.series,
                ichart = _getChartObj(series.chart.renderTo.id),
                hchart = series.chart;

            if ("undefined" !== typeof ichart && ( series && series.options.infAvoidToolTipSel || ichart.isLoading())) {
                hchart.hoverPoint = undefined;
                hchart.hoverSeries = undefined;
            } else {
                proceed.call(this, e);
            }
        });
    };

    /**
     * Extends svg renderer which is extended by Highcharts
     * @private
     */
    var _extendSVGRenderer = function () {

        /**
         * Since last labels crops when value is at extremes of y axis, made adjustments from the code and anchors are adjusted here.
         */
        H.wrap(H.SVGRenderer.prototype.symbols, 'callout', function (proceed, x, y, w, h, options) {
            if (options.parentGroup && options.parentGroup.attr("showHalfAnchor") === "true") {
                var arrowLength = 6,
                    halfDistance = 6,
                    r = Math.min((options && options.r) || 0, w, h),
                    safeDistance = r + halfDistance,
                    anchorX = options && options.anchorX,
                    anchorY = options && options.anchorY,
                    path,
                    newTopY;

                path = [
                    'M', x + r, y,
                    'L', x + w - r, y, // top side
                    'C', x + w, y, x + w, y, x + w, y + r, // top-right corner
                    'L', x + w, y + h - r, // right side
                    'C', x + w, y + h, x + w, y + h, x + w - r, y + h, // bottom-right corner
                    'L', x + r, y + h, // bottom side
                    'C', x, y + h, x, y + h, x, y + h - r, // bottom-left corner
                    'L', x, y + r, // left side
                    'C', x, y, x, y, x + r, y // top-left corner
                ];

                // Anchor on left side
                if (anchorX && anchorX > w) {

                    newTopY = (anchorY + halfDistance) > h ? h : undefined;
                    if (newTopY) {

                        path.splice(13, 3,
                            'L', x + w, anchorY - halfDistance,
                            x + w + arrowLength, anchorY,
                            x + w + (anchorY + halfDistance - h) * arrowLength * 2 / h, newTopY,
                            x + w, newTopY,
                            x + w, y + h - r
                        );

                        /*path.splice(13, 3,
                         'L', x + w, newTopY,
                         x - (arrowLength/halfDistance) * (-1) * anchorY , newTopY,
                         x + w + arrowLength, anchorY,
                         x + w, anchorY + halfDistance,
                         x + w, y + h - r
                         );*/
                    } else {
                        path.splice(13, 3,
                            'L', x + w, anchorY - halfDistance,
                            x + w + arrowLength, anchorY,
                            x + w, anchorY + halfDistance,
                            x + w, y + h - r
                        );
                    }


                    // Anchor on right side
                } else if (anchorX && anchorX < 0) {

                    newTopY = (anchorY + halfDistance) > h ? h : undefined;

                    if (newTopY) {
                        // Chevron
                        path.splice(33, 3,
                            'L', x, newTopY,
                            x - (anchorY + halfDistance - h) * arrowLength * 2 / h, newTopY,
                            x - arrowLength, anchorY,
                            x, anchorY - halfDistance,
                            x, y + r
                        );
                    } else {
                        path.splice(33, 3,
                            'L', x, anchorY + halfDistance,
                            x - arrowLength, anchorY,
                            x, anchorY - halfDistance,
                            x, y + r
                        );
                    }

                } else if (anchorY && anchorY > h && anchorX > x + safeDistance && anchorX < x + w - safeDistance) { // replace bottom
                    path.splice(23, 3,
                        'L', anchorX + halfDistance, y + h,
                        anchorX, y + h + arrowLength,
                        anchorX - halfDistance, y + h,
                        x + r, y + h
                    );
                } else if (anchorY && anchorY < 0 && anchorX > x + safeDistance && anchorX < x + w - safeDistance) { // replace top
                    path.splice(3, 3,
                        'L', anchorX - halfDistance, y,
                        anchorX, y - arrowLength,
                        anchorX + halfDistance, y,
                        w - r, y
                    );
                }

                return path;
            } else {
                return proceed.call(this, x, y, w, h, options);
            }
        });
    };

    /**
     * This is a fix for the issue of chart area is getting black if a gradient is used and url changes after loading.
     * @private
     */
    var _applyPathFixForMobile = function () {

        //if(/iP(ad|hone|od).+Version\/[\d\.]+.*Safari/i.test(navigator.userAgent)) {
        H.Chart.prototype.callbacks.push(function (chart) {
            chart.xOnUrlChange = function (newUrl) {
                if (newUrl == undefined) {
                    newUrl = ((H.isFirefox || H.isWebKit) && H.doc.getElementsByTagName('base').length ?
                        H.win.location.href
                            .replace(/#.*?$/, '') // remove the hash
                            .replace(/<[^>]*>/g, '') // wing cut HTML
                            .replace(/([\('\)])/g, '\\$1') // escape parantheses and quotes
                            .replace(/ /g, '%20') : // replace spaces (needed for Safari only)
                        '');
                }

                var currentUrl = chart.renderer.url;
                chart.renderer.url = newUrl;
                $(chart.container).find("[fill^='url(" + currentUrl + "']").each(function (key, value) {
                    var element = $(value),
                        fill = element.attr('fill'),
                        temp = fill.split("url(" + currentUrl);

                    $(value).attr("fill", temp.join("url(" + newUrl));
                });
            };
        });

        window.addEventListener("onpopstate", function () {
            var newUrl = infChart.util.getBaseURL() || "";

            H.charts.forEach(function (chart, index) {
                if (chart && chart.xOnUrlChange) {
                    chart.xOnUrlChange(newUrl);
                }
            });

        });
        //}
    };

    _extendHighCharts();
    _extendDefaultCharTypes();
    _extendHighChartsForCustomChartTypes();
    _extendHighChartsForAxisPositioning();
    _extendHighChartsForHideTooltip();
    _extendSVGRenderer();
    _applyPathFixForMobile();

})(infChart, jQuery, Highcharts);