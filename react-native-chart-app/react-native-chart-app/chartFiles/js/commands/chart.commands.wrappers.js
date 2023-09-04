var infChart = window.infChart || {};

(function ($, infChart) {

    /**
     * Returns the chart id of given highchart instance
     * @param {Highcharts} highchartInstance chart
     * @returns {string} chart id
     * @private
     */
    var _getChartIdFromHighchartInstance = function (highchartInstance) {
        return infChart.manager.getContainerIdFromChart(highchartInstance.renderTo.id);
    };

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
     * Check whether the given annotation is from a undo/redo enabled drawing
     * @param {object} annotation annotation being checked
     * @returns {*|boolean}
     * @private
     */
    var _isTrackHistoryEnabledDrawing = function (annotation) {
        return annotation && annotation.options && (annotation.options.drawingType === infChart.constants.drawingTypes.shape);
    };

    /**
     * Check whether the given annotation is from a undo/redo enabled indicator drawing
     * @param {object} annotation annotation being checked
     * @returns {*|boolean}
     * @private
     */
    var _isIndicatorDrawing = function (annotation) {
        return annotation && annotation.options && (annotation.options.drawingType === infChart.constants.drawingTypes.indicator);
    };

    /**
     * Wrapping up the infChart.manager.initChart to initialize commands fot the chart
     */
    infChart.util.wrap(infChart.manager, 'initChart', function (proceed, uniqueId, properties) {
        var xChart = proceed.call(this, uniqueId, properties);
        if (xChart.settings.config.enableUndoRedo) {
            infChart.commandsManager.initializeCommands(uniqueId);
        }
        return xChart;
    });

    /**
     * Wrapping up the infChart.manager.renderChart to initialize commands fot the chart
     */
    infChart.util.wrap(infChart.manager, 'renderChart', function (proceed, container, uniqueId, properties, setDefaultProperties) {
        var xChart = proceed.call(this, container, uniqueId, properties, setDefaultProperties);
        if (xChart.settings.config.enableUndoRedo) {
            infChart.commandsManager.initializeCommands(uniqueId);
        }
        return xChart;
    });

    /**
     * Wrapping up the loadTemplate to clear the history
     */
    infChart.util.wrap(infChart.manager, 'loadTemplate', function (proceed, chartId, name, type, template) {
        infChart.commandsManager.clearFromCommandStacks(chartId);
        return proceed.call(this, chartId, name, type, template);
    });

    /**
     * Wrapping up the resetUserDefinedXAxisExtremes to catch the reset buttons for x-axis
     */
    infChart.util.wrap(infChart.manager, 'resetUserDefinedXAxisExtremes', function (proceed, chartId, fromCommands) {
        if (!fromCommands) {
            var xChart = _getChartObj(chartId),
                extremes = xChart.getRange();

            infChart.commandsManager.registerCommand(xChart.id, function () {
                extremes = xChart.getRange();
                proceed.call(xChart, xChart.id, true);
            }, function () {
                xChart.setXAxisExtremes(extremes.min, extremes.max, true, false);
            }, undefined, false, 'resetUserDefinedXAxisExtremes');
        }
        return proceed.call(this, chartId);
    });

    /**
     * Wrapping up the resetUserDefinedYAxisExtremes to catch the reset buttons for y-axis
     */
    infChart.util.wrap(infChart.manager, 'resetUserDefinedYAxisExtremes', function (proceed, chartId, redraw, fromCommands) {
        if (!fromCommands) {
            var xChart = _getChartObj(chartId),
                extremes = xChart.getMainYAxis().getExtremes();

            infChart.commandsManager.registerCommand(xChart.id, function () {
                extremes = xChart.getRange();
                proceed.call(xChart, xChart.id, true);
            }, function () {
                xChart.setUserDefinedYAxisExtremes(extremes.min, extremes.max, true);
            }, undefined, false, 'resetUserDefinedYAxisExtremes');

        }

        return proceed.call(this, chartId, redraw);
    });

    /**
     * Wrapping up the setUserDefinedXAxisExtremes to catch the musewheel for x axis
     */
    infChart.util.wrap(infChart.manager, 'setUserDefinedXAxisExtremes', function (proceed, chartId, userMin, userMax, redraw, isUserInteraction, fromCommands) {
        if (!fromCommands) {
            var xChart = _getChartObj(chartId),
                extremes = xChart.getMainXAxis().getExtremes(),
                yExtremes = xChart.getMainYAxis().getExtremes();
            var lastAction = infChart.commandsManager.getLastAction(xChart.id);
            var infManualExtreme = xChart.chart.infManualExtreme;

            if (lastAction && (lastAction.actionType === 'setUserDefinedYAxisExtremes' || lastAction.actionType === 'setUserDefinedXAxisExtremes' ) && !lastAction.freezeUpdatingSame) {
                if (lastAction.actionType === 'setUserDefinedXAxisExtremes') {
                    lastAction.action = function (callbackOptions) {
                        proceed.call(xChart, chartId, userMin, userMax, !callbackOptions.otherRedoAction, isUserInteraction, true);
                        if (callbackOptions.otherRedoAction) { // y Axis is also changed in that action and redo that as well
                            callbackOptions.otherRedoAction.call(this);
                        }
                    }
                } else {
                    // To avoid dragging alone both the axis to be in separte actions,
                    // included the other axis' undo redo action to the last one and will execute it the main undo/redo actions if available.
                    lastAction.callbackOptions.otherRedoAction = function () {
                        infChart.manager.setUserDefinedXAxisExtremes.call(xChart, chartId, userMin, userMax, true, isUserInteraction, true);
                    };

                    if (!lastAction.callbackOptions.otherUndoAction) {
                        var otherUndoXExtremes = lastAction.callbackOptions.xExtremes;
                        lastAction.callbackOptions.otherUndoAction = function () {
                            infChart.manager.setUserDefinedXAxisExtremes.call(xChart, xChart.id, otherUndoXExtremes.min, otherUndoXExtremes.max, true, infManualExtreme, true);
                        };
                    }
                }
            } else {
                infChart.commandsManager.registerCommand(xChart.id, function (callbackOptions) {
                    extremes = xChart.getRange();
                    proceed.call(xChart, xChart.id, userMin, userMax, true, isUserInteraction, true);
                    if (callbackOptions.otherRedoAction) {  // y Axis is also changed in that action and redo that as well
                        callbackOptions.otherRedoAction.call(this);
                    }
                }, function (callbackOptions) {
                    proceed.call(xChart, xChart.id, extremes.min, extremes.max, !callbackOptions.otherUndoAction, infManualExtreme, true);
                    if (callbackOptions.otherUndoAction) {  // y Axis is also changed in that action and undo that as well
                        callbackOptions.otherUndoAction.call(this);
                    }
                }, undefined, false, 'setUserDefinedXAxisExtremes', {yExtremes: yExtremes});
            }
        }

        return proceed.call(this, chartId, userMin, userMax, redraw, isUserInteraction);
    });

    /**
     * Wrapping up the setUserDefinedYAxisExtremes to catch the mousewheel for y axis
     */
    infChart.util.wrap(infChart.manager, 'setUserDefinedYAxisExtremes', function (proceed, chartId, userMin, userMax, redraw, isUserInteraction, fromCommands) {
        if (!fromCommands) {
            var xChart = _getChartObj(chartId),
                extremes = xChart.getMainYAxis().getExtremes(),
                xExtremes = xChart.getMainXAxis().getExtremes();
            var lastAction = infChart.commandsManager.getLastAction(xChart.id);
            var infManualExtreme = xChart.chart.infIsUserYExt;

            if (lastAction && (lastAction.actionType === 'setUserDefinedYAxisExtremes' || lastAction.actionType === 'setUserDefinedXAxisExtremes' ) && !lastAction.freezeUpdatingSame) {
                if (lastAction.actionType === 'setUserDefinedYAxisExtremes') {
                    lastAction.action = function (callbackOptions) {
                        proceed.call(xChart, chartId, userMin, userMax, !callbackOptions.otherRedoAction, isUserInteraction);
                        if (callbackOptions.otherRedoAction) {  // x Axis is also changed in that action and redo that as well
                            callbackOptions.otherRedoAction.call(this);
                        }
                    }
                } else {
                    // To avoid dragging alone both the axis to be in separte actions,
                    // included the other axis' undo redo action to the last one and will execute it the main undo/redo actions if available.
                    lastAction.callbackOptions.otherRedoAction = function () {
                        infChart.manager.setUserDefinedYAxisExtremes.call(xChart, chartId, userMin, userMax, true, isUserInteraction, true);
                    };

                    if (!lastAction.callbackOptions.otherUndoAction) {
                        var otherUndoYExtremes = lastAction.callbackOptions.yExtremes;
                        lastAction.callbackOptions.otherUndoAction = function () {
                            infChart.manager.setUserDefinedYAxisExtremes.call(xChart, xChart.id, otherUndoYExtremes.min, otherUndoYExtremes.max, true, infManualExtreme, true);
                        };
                    }
                }
            } else {
                infChart.commandsManager.registerCommand(xChart.id, function (callbackOptions) {
                    extremes = xChart.getMainYAxis().getExtremes();
                    proceed.call(xChart, xChart.id, userMin, userMax, !callbackOptions.otherRedoAction, isUserInteraction, true);
                    if (callbackOptions.otherRedoAction) {  // x Axis is also changed in that action and redo that as well
                        callbackOptions.otherRedoAction.call(this);
                    }
                }, function (callbackOptions) {
                    proceed.call(xChart, xChart.id, extremes.min, extremes.max, !callbackOptions.otherUndoAction, infManualExtreme, true);
                    if (callbackOptions.otherUndoAction) {  // x Axis is also changed in that action and undo that as well
                        callbackOptions.otherUndoAction.call(this);
                    }
                }, undefined, false, 'setUserDefinedYAxisExtremes', {xExtremes: xExtremes});
            }
        }

        return proceed.call(this, chartId, userMin, userMax, redraw, isUserInteraction);
    });

    //region=======================mouseWheel=======================

    /**
     * Wrapping up the infChart.MouseWheelController.prototype to initialize mousewheel binding before the chart to avoid stop propagation
     */
    infChart.util.wrap(infChart.MouseWheelController.prototype, 'onMouseWheel', function (proceed, event) {
        var xChartId = _getChartIdFromHighchartInstance(this.chart);
        var xChart = _getChartObj(xChartId);
        if (xChart.settings.config.enableUndoRedo) {
            infChart.commandsManager.setMouseWheel();
        }
        return proceed.call(this, event);
    });
    //endregion===================end of mousewheel===============

    //region========================Stock Chart Wrappers================================================================

    /**
     * Wrapping up the infChart.StockChart.prototype.setSymbol to catch the symbol change and set the cammands(undo/redo) accordingly
     */
    infChart.util.wrap(infChart.StockChart.prototype, 'setSymbol', function (proceed, symbolProperties, load, redraw, config, setDefaultChartSettings) {
        if (!this.isFirstLoadInprogress()) {
            var xChart = this;
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'addDrawing');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'pasteDrawing');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'removeDrawing');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'onAnnotationStore');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'onLineWidthChange');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'onLineStyleChange');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'onLineColorChange');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'onFillColorChange');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'onFillColorChange_regressionChannel');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'onLineColorChange_andrewsPitchfork');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'onFillColorChange_andrewsPitchfork');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'onLineWidthChange_andrewsPitchfork');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'onFibLevelChange');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'onFibArcsLevelChange');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'onFibFansLevelChange');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'onFibFillColorChange');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'onFibLineWidthChange');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'onFibLevelFontColorChange');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'onFibLevelFontSizeChange');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'onColorChange_label');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'onFontSizeChange_label');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'onFontStyleChange_label');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'onTextChange_label');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'onToggleText');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'onTextChange');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'onVerticalPositionSelect');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'onHorizontalPositionSelect');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'onBackgroundColorChange_label');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'onBorderColorChange_label');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'onApplyBorderColor_label');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'onApplyBackgroundColor_label');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'onFibLevelValueChange');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'onFibLevelLineColorChange');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'onFibSingleOptionChange');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'onFibModeChange');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'onXabcdLineWidthChange');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'onXabcdFillColorChange');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'onXabcdLineColorChange');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'onAbcdLineColorChange');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'onAbcdLineWidthChange');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'onAbcdLineWidthChange');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'eraseFibLevel_fibVerRetrancement');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'eraseFibLevel_fib2PointTimeProjection');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'eraseFibLevel_fib3PointTimeProjection');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'onFibSingleFontSizeChange');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'onFibSingleLineWidthChange');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'onFibSingleFontColorChange');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'onFibSingleLineColorChange');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'onFibSingleFillColorChange');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'changeAllFibLines');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'onElliotWaveLineColorChange');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'onElliotWaveLineWidthChange');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'onElliotWaveDegreeChange');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'onChangeSnapToHighLow');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'onPriceLineStyleChange');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'onPriceLineWidthChange');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'onPolylineColorChange');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'onPolylineWidthChange');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'onPolylineStyleChange');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'onPolylineFillColorChange');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'genericTool_onFibFillColorChange');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'genericTool_onFibLevelLineColorChange');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'genericTool_onFibLevelFontColorChange');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'genericTool_onFibLevelFontSizeChange');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'genericTool_onFibLineWidthChange');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'genericTool_onFibLevelFontWeightChange');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'genericTool_onFibLevelValueChange');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'genericTool_onFibLevelChange');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'genericTool_onFibSingleLineColorChange');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'genericTool_onFibSingleFillColorChange');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'genericTool_onFibSingleFontColorChange');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'genericTool_onFibSingleLineWidthChange');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'genericTool_onFibSingleFontSizeChange');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'genericTool_onFibSingleFontWeightChange');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'genericTool_onFibSingleOptionChange');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'genericTool_onFibApplyAllButtonClick');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'genericTool_onAlignStyleChange');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'setGridLineWidth');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'setGridLineColor');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'setChartBackgroundColor');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'setGradientChartBackgroundColor');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'onExtendToRight');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'onExtendToLeft');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'onLabelTextColorChange');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'onTextColorChange_basic');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'onTextSizeChange_basic');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'onTrendLineToggleShow_fibRetracementsDrawing');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'onTrendLineToggleShow_fib3PointPriceProjectionDrawing');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'onTrendLineToggleShow_fib3PointPriceProjectionGenericDrawing');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'onTrendLineToggleShow_fibVerRetracementsDrawing');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'onTrendLineToggleShow_fib3PointTimeProjection');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'onLabelTextSizeChange');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'toggleLastPriceLabel');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'toggleLastPriceLine');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'toggleBarClosureTime');
        }
        return proceed.call(this, symbolProperties, load, redraw, config, true, setDefaultChartSettings);
    });

    /**
     * Wrapping up the infChart.StockChart.prototype.setPeriod to catch the period change and set the cammands(undo/redo) accordingly
     */
    infChart.util.wrap(infChart.StockChart.prototype, 'setPeriod', function (proceed, period, isManually, setControl, range, isPropertyChange, redraw, isIntervalChange) {
        if (isPropertyChange) {
            var currentPeriod = this.period;
            var xChart = this;

            infChart.commandsManager.registerCommand(xChart.id, function () {
                proceed.call(xChart, period, isManually, true, range, isPropertyChange, true);
                xChart._onPropertyChange("period"); // doing this manually since isPropertyChange is used to fill the command stack and it should not refill from the same action again
            }, function () {
                proceed.call(xChart, currentPeriod, isManually, true, range, isPropertyChange, true);
                xChart._onPropertyChange("period");
            }, undefined, false, 'setPeriod');
        }
        return proceed.call(this, period, isManually, setControl, range, isPropertyChange, redraw, isIntervalChange);
    });

    /**
     * Wrapping up the infChart.StockChart.prototype.setInterval to catch the interval change and set the cammands(undo/redo) accordingly
     */
    infChart.util.wrap(infChart.StockChart.prototype, 'setIntervalManually', function (proceed, interval, subInterval, redraw, range, isPropertyChange) {
        if (isPropertyChange) {
            var currentInterval = this.interval;
            var xChart = this;

            infChart.commandsManager.registerCommand(xChart.id, function () {
                proceed.call(xChart, interval, subInterval, true, undefined, false);
                xChart._onPropertyChange("interval");
            }, function () {
                proceed.call(xChart, currentInterval, undefined, true, undefined, false);
                xChart._onPropertyChange("interval");
            }, undefined, false, 'setIntervalManually');
        }
        return proceed.call(this, interval, subInterval, redraw, range, isPropertyChange);
    });

    /**
     * Wrapping up the infChart.StockChart.prototype.setChartStyle to catch the chart style change and set the cammands(undo/redo) accordingly
     */
    infChart.util.wrap(infChart.StockChart.prototype, '_changeSeriesType', function (proceed, series, type, redraw, isPropertyChange) {
        if (isPropertyChange) {
            var currentType = this.type;
            var xChart = this;
            var mainSeries = xChart.getMainSeries();
            var mainSeriesId = mainSeries.options.id;
            var seriesId = series.options.id;

            /**
             * Execute the undo/redo with the new properties
             * @param {string} newType new chart type
             */
            function undoRedo(newType) {
                var settingPanel = xChart.settingsPopups[mainSeriesId];
                if (settingPanel) {
                    settingPanel.data("infUndoRedo", true);
                    settingPanel.find("[ind-ind-type=" + newType + "]").trigger('click');
                } else {
                    var undoRedoSeries = xChart.chart.get(seriesId);
                    xChart._changeSeriesType(undoRedoSeries, newType, redraw, false);
                }
                xChart._onPropertyChange("type", [newType]);
            }

            infChart.commandsManager.registerCommand(xChart.id, function () {
                undoRedo(type);
            }, function () {
                undoRedo(currentType);
            }, undefined, false, '_changeSeriesType');
        }
        return proceed.call(this, series, type, redraw, isPropertyChange);
    });

    /**
     * Wrapping up the infChart.StockChart.prototype.setLineWidth to catch the line width change and set the cammands(undo/redo) accordingly
     */
    infChart.util.wrap(infChart.StockChart.prototype, 'setLineWidth', function (proceed, series, width, redraw, isPropertyChange) {
        if (isPropertyChange) {
            var xChart = this;
            var seriesProperties = xChart._getSeriesProperties(series);
            var lineWidth = seriesProperties.lineWidth;
            var seriesId = series.options.id;

            infChart.commandsManager.registerCommand(xChart.id, function () {
                proceed.call(xChart, xChart.chart.get(seriesId), width, true, false);
                //xChart._onPropertyChange("type", [type]);
            }, function () {
                proceed.call(xChart, xChart.chart.get(seriesId), lineWidth, true, false);
                //xChart._onPropertyChange("type", [currentType]);
            }, undefined, false, 'setLineWidth');
        }
        return proceed.call(this, series, width, redraw, isPropertyChange);
    });

    infChart.util.wrap(infChart.StockChart.prototype, 'setGridLineWidth', function (proceed, xGridLineWidth, yGridLineWidth, redraw, isPropertyChange) {
        if (isPropertyChange) {
            var xChart = this;
            var currentXGridLineWidth = this.chart.options.xAxis[0].gridLineWidth;
            var currentYGridLineWidth = this.chart.options.yAxis[0].gridLineWidth;

            infChart.commandsManager.registerCommand(xChart.id, function () {
                proceed.call(xChart, xGridLineWidth, yGridLineWidth, true, false);
            }, function () {
                proceed.call(xChart, currentXGridLineWidth, currentYGridLineWidth, true, false);
                //xChart._onPropertyChange("type", [currentType]);
            }, undefined, false, 'setGridLineWidth');
        }
        return proceed.call(this, xGridLineWidth, yGridLineWidth, redraw, isPropertyChange);
    });

    infChart.util.wrap(infChart.StockChart.prototype, 'setGridLineColor', function (proceed, xGridLineColor, yGridLineColor, isPropertyChange) {
        if (isPropertyChange) {
            var xChart = this;
            var currentXGridLineColor = this.chart.options.xAxis[0].gridLineColor;
            var currentYGridLineColor = this.chart.options.yAxis[0].gridLineColor;

            infChart.commandsManager.registerCommand(xChart.id, function () {
                proceed.call(xChart, xGridLineColor, yGridLineColor, false);
            }, function () {
                proceed.call(xChart, currentXGridLineColor, currentYGridLineColor, false);
            }, undefined, false, 'setGridLineColor');
        }
        return proceed.call(this, xGridLineColor, yGridLineColor, isPropertyChange);
    });

    infChart.util.wrap(infChart.StockChart.prototype, 'setChartBackgroundColor', function (proceed, color, opacity, isPropertyChange) {
        if (isPropertyChange) {
            var xChart = this;
            var currentBackgroundColor = typeof this.chart.options.chart.backgroundColor === 'string' ? this.chart.options.chart.backgroundColor : "transparent";
             var currentBackgroundColorOpacity = this.backgroundColorOpacity;

            infChart.commandsManager.registerCommand(xChart.id, function () {
                proceed.call(xChart, color, opacity, false);
            }, function () {
                proceed.call(xChart, currentBackgroundColor, currentBackgroundColorOpacity, false);
            }, undefined, false, 'setChartBackgroundColor');
        }
        return proceed.call(this, color, opacity, isPropertyChange);
    });

    infChart.util.wrap(infChart.StockChart.prototype, 'setGradientChartBackgroundColor', function (proceed, topColor, bottomColor, topColorOpacity, bottomColorOpacity, isPropertyChange) {
        if (isPropertyChange) {
            var xChart = this;
            var currentTopGradientColor = this.chart.options.chart.backgroundColor && this.chart.options.chart.backgroundColor.stops ? this.chart.options.chart.backgroundColor.stops[0][1] : "transparent";
            var currentBottomGradientColor = this.chart.options.chart.backgroundColor && this.chart.options.chart.backgroundColor.stops ? this.chart.options.chart.backgroundColor.stops[1][1] : "transparent";
            var currentTopOpacity = this.chartBgTopGradientColorOpacity;
            var currentBottomOpacity = this.chartBgBottomGradientColorOpacity;


            infChart.commandsManager.registerCommand(xChart.id, function () {
                proceed.call(xChart, topColor, bottomColor, topColorOpacity, bottomColorOpacity, false);
            }, function () {
                proceed.call(xChart, currentTopGradientColor, currentBottomGradientColor, currentTopOpacity, currentBottomOpacity,  false);
            }, undefined, false, 'setGradientChartBackgroundColor');
        }
        return proceed.call(this, topColor, bottomColor, topColorOpacity, bottomColorOpacity, isPropertyChange);
    });

    /**
     * Wrapping up the infChart.StockChart.prototype.setColor to catch the series color change and set the cammands(undo/redo) accordingly
     */
    infChart.util.wrap(infChart.StockChart.prototype, 'setColor', function (proceed, series, hexColor, upColor, downColor, redraw, isPropertyChange, useSeriesLineColor) {
        if (isPropertyChange) {
            var colorProperties = this._getColorPropertiesFromOptions(series.options, series.type, series, useSeriesLineColor);
            var xChart = this;
            var lastAction = infChart.commandsManager.getLastAction(xChart.id);
            var seriesId = series.options.id;

            if (lastAction && lastAction.actionType === 'setColor' && !lastAction.freezeUpdatingSame) {
                lastAction.action = function () {
                    proceed.call(xChart, series, hexColor, upColor, downColor, true, false, useSeriesLineColor);
                }
            } else {
                infChart.commandsManager.registerCommand(xChart.id, function () {
                    proceed.call(xChart, xChart.chart.get(seriesId), hexColor, upColor, downColor, true, false, useSeriesLineColor);
                }, function () {
                    xChart._setSeriesProperties(xChart.chart.get(seriesId), colorProperties, true);
                }, undefined, false, 'setColor', {undoColorProperties: colorProperties});
            }
        }
        return proceed.call(this, series, hexColor, upColor, downColor, redraw, isPropertyChange, useSeriesLineColor);
    });

    /**
     * Wrapping up the infChart.StockChart.prototype.onNavigatorScrollStart to catch the navigator scrollingand set the cammands(undo/redo) accordingly
     */
    infChart.util.wrap(infChart.StockChart.prototype, 'onNavigatorScrollStart', function (proceed, navigator) {
        var xChart = this;
        var extremes = $.extend({}, xChart.getRange());
        var userInteraction = xChart.chart.infManualExtreme;

        infChart.commandsManager.registerCommand(xChart.id, function (options) {
            if (options.redoExtremes) {
                xChart.setXAxisExtremes(options.redoExtremes.min, options.redoExtremes.max, true, true);
            }
        }, function () {
            xChart.setXAxisExtremes(extremes.min, extremes.max, true, userInteraction, true);
        }, undefined, false, 'onNavigatorScrollStart', {redoExtremes: extremes});

        return proceed.call(this, navigator);
    });

    /**
     * Wrapping up the infChart.StockChart.prototype.onNavigatorScrollStop to catch the navigator scrolling and set the cammands(undo/redo) accordingly
     */
    infChart.util.wrap(infChart.StockChart.prototype, 'onNavigatorScrollStop', function (proceed, navigator) {
        var xChart = this;
        var extremes = $.extend({}, xChart.getRange());
        var lastAction = infChart.commandsManager.getLastAction(xChart.id);

        if (lastAction && lastAction.actionType === 'onNavigatorScrollStart') {
            infChart.commandsManager.updateLastActionOptions(xChart.id, {redoExtremes: extremes});
        }
        return proceed.call(this, navigator);
    });

    /**
     * Wrapping up the setGridType to catch the function and set the cammands(undo/redo) accordingly
     */
    infChart.util.wrap(infChart.StockChart.prototype, 'setGridType', function (proceed, type, redraw, isPropertyChange) {
        if (isPropertyChange) {
            var currentType = this.gridType;
            var xChart = this;

            infChart.commandsManager.registerCommand(xChart.id, function () {
                proceed.call(xChart, type, true, false);
                xChart._onPropertyChange("grid");
            }, function () {
                proceed.call(xChart, currentType, true, false);
                xChart._onPropertyChange("grid");
            }, undefined, false, 'setGridType');
        }
        return proceed.call(this, type, redraw, isPropertyChange);
    });

    /**
     * Wrapping up the addCompareSymbol to catch the function and set the cammands(undo/redo) accordingly
     */
    infChart.util.wrap(infChart.StockChart.prototype, 'addCompareSymbol', function (proceed, symbol, config, isPropertyChange) {
        if (isPropertyChange) {
            var xChart = this;

            infChart.commandsManager.registerCommand(xChart.id, function () {
                proceed.call(xChart, symbol, config, false);
                xChart._onPropertyChange("compareSymbols", {symbol: symbol, action: "add"});
            }, function () {
                if (!config) {
                    var series = xChart.chart.get(xChart.getCompareSeriesId(symbol));
                    config = {'seriesOptions': xChart._getSeriesProperties(series)}; // to keep the same color config when adding also
                }
                xChart.removeCompareSymbol(symbol, false);
                xChart._onPropertyChange("compareSymbols", {symbol: symbol, action: "remove"});
            }, undefined, false, 'addCompareSymbol');
        }
        return proceed.call(this, symbol, config, isPropertyChange);
    });

    /**
     * Wrapping up the removeCompareSymbol to catch the function and set the cammands(undo/redo) accordingly
     */
    infChart.util.wrap(infChart.StockChart.prototype, 'removeCompareSymbol', function (proceed, symbol, isPropertyChange) {
        if (isPropertyChange !== false) {
            var xChart = this;
            var series = xChart.chart.get(xChart.getCompareSeriesId(symbol));
            var config = xChart._getSeriesProperties(series);
            var hasSpread = false;
            if (infChart.indicatorMgr) {
                var indicator = infChart.indicatorMgr.getSingletonIndicator(xChart.id, "SPREAD");
                hasSpread = !!indicator;
            }

            infChart.commandsManager.registerCommand(xChart.id, function () {
                proceed.call(xChart, symbol, false);
                xChart._onPropertyChange("compareSymbols", {symbol: symbol, action: "remove"});
            }, function () {
                xChart.addCompareSymbol(symbol, {'seriesOptions': config}, false);
                if (hasSpread) {
                    xChart._toggleSingletonIndicator('SPREAD', true, undefined, true, false, 'spread');
                }
                xChart._onPropertyChange("compareSymbols", {symbol: symbol, action: "add"});
            }, undefined, false, 'removeCompareSymbol');
        }
        return proceed.call(this, symbol, isPropertyChange);
    });

    /**
     * Wrapping up the _toggleSingletonIndicator to catch the function singleton indicator toggling and set the cammands(undo/redo) accordingly
     */
    infChart.util.wrap(infChart.StockChart.prototype, '_toggleSingletonIndicator', function (proceed, indicatorType, enabled, config, redraw, isPropertyChange, controlName) {
        if (isPropertyChange !== false) {
            var xChart = this;
            var indicator;

            if (infChart.indicatorMgr) {
                indicator = infChart.indicatorMgr.getSingletonIndicator(this.id, indicatorType);
            }
            /**
             * Execute the undo/redo with the new properties
             * @param {boolean} enabledInUndo enabled or not
             */
            function undoRedo(enabledInUndo) {
                if (!enabledInUndo) {
                    indicator = infChart.indicatorMgr.getSingletonIndicator(xChart.id, indicatorType);
                }
                proceed.call(xChart, indicatorType, enabledInUndo, config, true, false, controlName);
                if (enabledInUndo) {
                    indicator = infChart.indicatorMgr.getSingletonIndicator(xChart.id, indicatorType);
                }
                if (indicator) {
                    xChart._onPropertyChange("indicator", {
                        id: indicator.id,
                        type: indicator.type,
                        action: enabled ? "add" : "remove"
                    });
                }
            }

            infChart.commandsManager.registerCommand(xChart.id, function () {
                undoRedo(enabled);
            }, function () {
                undoRedo(!enabled);
            }, undefined, false, '_toggleSingletonIndicator');
        }
        return proceed.call(this, indicatorType, enabled, config, redraw, isPropertyChange, controlName);
    });

    /**
     * Wrapping up the _toggleNavigator to catch the function  navigator toggling
     */
    infChart.util.wrap(infChart.StockChart.prototype, '_toggleNavigator', function (proceed, isPropertyChange) {
        if (isPropertyChange !== false) {
            var xChart = this;

            /**
             * Execute the undo/redo with the new properties
             */
            function undoRedo() {
                proceed.call(xChart, false);
                xChart._onPropertyChange("navigator");
            }

            infChart.commandsManager.registerCommand(xChart.id, undoRedo, undoRedo, undefined, false, '_toggleNavigator');
        }
        return proceed.call(this, isPropertyChange);
    });

    /**
     * Wrapping up the toggleChartDataMode to catch the function  data mode toggling
     */
    infChart.util.wrap(infChart.StockChart.prototype, 'toggleChartDataMode', function (proceed, type, isPropertyChange) {
        if (isPropertyChange !== false) {
            var xChart = this;

            /**
             * Execute the undo/redo with the new properties
             */
            function undoRedo() {
                var properties = {isCompare: xChart.isCompare, isLog: xChart.isLog, isPercent: xChart.isPercent};
                var changedProperties = {};
                var isToolbarEnabled = xChart._isToolbarEnabled();

                proceed.call(xChart, type, false);

                if (xChart.isCompare !== properties.isCompare) {
                    changedProperties.isCompare = xChart.isCompare;
                }
                if (xChart.isLog !== properties.isLog) {
                    changedProperties.isLog = xChart.isLog;
                    isToolbarEnabled && infChart.toolbar.setSelectedControls(xChart.id, 'value', xChart.isLog, 'log');
                }
                if (xChart.isPercent !== properties.isPercent) {
                    changedProperties.isPercent = xChart.isPercent;
                    isToolbarEnabled && infChart.toolbar.setSelectedControls(xChart.id, 'value', xChart.isPercent, 'percent');
                }
                xChart._onPropertyChange("mode", changedProperties);
            }

            infChart.commandsManager.registerCommand(xChart.id, undoRedo, undoRedo, undefined, false, 'toggleChartDataMode');
        }
        return proceed.call(this, type, isPropertyChange);
    });

    /**
     * Wrapping up the _toggleNavigator to catch the function  last line toggling and set the cammands(undo/redo) accordingly
     */
    infChart.util.wrap(infChart.StockChart.prototype, 'toggleLastLine', function (proceed, isPropertyChange) {
        if (isPropertyChange !== false) {
            var xChart = this;

            /**
             * Execute the undo/redo with the new properties
             */
            function undoRedo() {
                proceed.call(xChart, false);
                if (xChart._isToolbarEnabled()) {
                    infChart.toolbar.setSelectedControls(xChart.id, "last", xChart.hasLastLine);
                }
                xChart._onPropertyChange("last", xChart.hasLastLine);
            }

            infChart.commandsManager.registerCommand(xChart.id, undoRedo, undoRedo, undefined, false, 'toggleLastLine');
        }
        return proceed.call(this, isPropertyChange);
    });

    /**
     * Wrapping up the togglePreviousCloseLine to catch the function  preclose toggling and set the cammands(undo/redo) accordingly
     */
    infChart.util.wrap(infChart.StockChart.prototype, 'togglePreviousCloseLine', function (proceed, isPropertyChange) {
        if (isPropertyChange !== false) {
            var xChart = this;

            /**
             * Execute the undo/redo with the new properties
             */
            function undoRedo() {
                proceed.call(xChart, false);
                if (xChart._isToolbarEnabled()) {
                    infChart.toolbar.setSelectedControls(xChart.id, "preclose", xChart.hasPreviousCloseLine);
                }
                xChart._onPropertyChange("preClose", xChart.hasPreviousCloseLine);
            }

            infChart.commandsManager.registerCommand(xChart.id, undoRedo, undoRedo, undefined, false, 'togglePreviousCloseLine');
        }
        return proceed.call(this, isPropertyChange);
    });

    /**
     * Wrapping up the toggleCrosshair to catch the function  crosshair toggling and set the cammands(undo/redo) accordingly
     */
    infChart.util.wrap(infChart.StockChart.prototype, 'toggleCrosshair', function (proceed, type, isPropertyChange) {
        if (isPropertyChange !== false) {
            var xChart = this;
            var prevType = xChart.crosshair.type;
            var prevEnabled = xChart.crosshair.enabled;

            /**
             * Execute the undo/redo with the new properties
             */
            function undoRedo() {
                if (xChart.crosshair.type != prevType) {
                    var newType = prevType;
                    var newEnabled = prevEnabled;
                    prevType = xChart.crosshair.type;
                    prevEnabled = xChart.crosshair.enabled;
                    proceed.call(xChart, newType, false);
                    if (!newEnabled) {
                        proceed.call(xChart, newType, false);// to make it disable
                    }
                } else if (xChart.crosshair.enabled !== prevEnabled) {
                    prevType = xChart.crosshair.type;
                    prevEnabled = xChart.crosshair.enabled;
                    proceed.call(xChart, prevType, false);
                }
                if (xChart._isToolbarEnabled()) {
                    infChart.toolbar.setSelectedControls(xChart.id, "crosshair", xChart.crosshair.type);
                }
                xChart._onPropertyChange("crosshair");
            }

            infChart.commandsManager.registerCommand(xChart.id, undoRedo, undoRedo, undefined, false, 'toggleCrosshair');
        }
        return proceed.call(this, type, isPropertyChange);
    });

    /**
     * Wrapping up the changeDepthSide to catch the function  depth toggling and set the cammands(undo/redo) accordingly
     */
    infChart.util.wrap(infChart.StockChart.prototype, 'changeDepthSide', function (proceed, side, isPropertyChange) {
        if (isPropertyChange !== false) {
            var xChart = this;
            var depth = infChart.depthManager.getProperties(xChart.id);
            var undoType = depth.side;
            var undoEnabled = depth.show;
            var redoType = side;
            var redoEnabled = side === depth.side ? !depth.show : true;

            function redo() {
                depth = infChart.depthManager.getProperties(xChart.id);
                if (depth.side != redoType) {
                    var newType = redoType;
                    var newEnabled = redoEnabled;
                    proceed.call(xChart, newType, false);
                    if (!newEnabled) {
                        proceed.call(xChart, newType, false);// to make it disable
                    }
                } else if (depth.show !== redoEnabled) {
                    proceed.call(xChart, redoType, false);
                }
                depth = infChart.depthManager.getProperties(xChart.id);
                if (xChart._isToolbarEnabled()) {
                    infChart.toolbar.setSelectedControls(xChart.id, "depth", {side: depth.side, show: depth.show});
                }
                xChart._onPropertyChange("depth", depth);
            }

            function undo() {
                depth = infChart.depthManager.getProperties(xChart.id);
                if (depth.side != undoType) {
                    var newType = undoType;
                    var newEnabled = undoEnabled;
                    proceed.call(xChart, newType, false);
                    if (!newEnabled) {
                        proceed.call(xChart, newType, false);// to make it disable
                    }
                } else if (depth.show !== undoEnabled) {
                    proceed.call(xChart, undoType, false);
                }
                depth = infChart.depthManager.getProperties(xChart.id);
                if (xChart._isToolbarEnabled()) {
                    infChart.toolbar.setSelectedControls(xChart.id, "depth", {side: depth.side, show: depth.show});
                }
                xChart._onPropertyChange("depth", depth);
            }

            infChart.commandsManager.registerCommand(xChart.id, redo, undo, undefined, false, 'changeDepthSide');
        }
        return proceed.call(this, side, isPropertyChange);
    });

    /**
     * Wrapping up the toggleShowMinMax to catch the function  min/max toggling and set the cammands(undo/redo) accordingly
     */
    infChart.util.wrap(infChart.StockChart.prototype, 'toggleShowMinMax', function (proceed, isPropertyChange) {
        if (isPropertyChange !== false) {
            var xChart = this;

            /**
             * Execute the undo/redo with the new properties
             */
            function undoRedo() {
                proceed.call(xChart, false);
                xChart._onPropertyChange("minMax");
                if (xChart._isToolbarEnabled()) {
                    infChart.toolbar.setSelectedControls(xChart.id, "minMax", xChart.minMax.enabled);
                }
            }

            infChart.commandsManager.registerCommand(xChart.id, undoRedo, undoRedo, undefined, false, 'toggleShowMinMax');
        }
        return proceed.call(this, isPropertyChange);
    });

    /**
     * Wrapping up the toggleToolTip to catch the function  tooltip toggling and set the cammands(undo/redo) accordingly
     */
    infChart.util.wrap(infChart.StockChart.prototype, 'toggleToolTip', function (proceed, isPropertyChange) {
        if (isPropertyChange !== false) {
            var xChart = this;

            /**
             * Execute the undo/redo with the new properties
             */
            function undoRedo() {
                proceed.call(xChart, false);
                infChart.toolbar.setSelectedControls(xChart.id, "tooltip", xChart.tooltip);
                xChart._onPropertyChange("tooltip");
            }

            infChart.commandsManager.registerCommand(xChart.id, undoRedo, undoRedo, undefined, false, 'toggleToolTip');
        }
        return proceed.call(this, isPropertyChange);
    });

    /**
     * Wrapping up the _togglePanel to catch the function single right toggling and set the cammands(undo/redo) accordingly
     */
    infChart.util.wrap(infChart.StockChart.prototype, '_togglePanel', function (proceed, panel, isPropertyChange) {
        if (isPropertyChange !== false) {
            var xChart = this;

            /**
             * Execute the undo/redo with the new properties
             */
            function undoRedo() {
                proceed.call(xChart, panel, false);
                var isRightPnlOpen = xChart.isRightPanelOpen();
                if (xChart._isToolbarEnabled()) {
                    infChart.toolbar.setSelectedControls(xChart.id, "tooltip", isRightPnlOpen);
                }
                xChart._onPropertyChange("rightPanel", isRightPnlOpen);
            }

            infChart.commandsManager.registerCommand(xChart.id, undoRedo, undoRedo, undefined, false, '_togglePanel');
        }
        return proceed.call(this, panel, isPropertyChange);
    });

    /**
     * Wrapping up the destroy to catch the chart destroy function to remove key bindings
     */
    infChart.util.wrap(infChart.StockChart.prototype, 'destroy', function (proceed, avoidDestroyCommands) {
        if (!avoidDestroyCommands) {
            infChart.commandsManager.destroyCommands(this.id);
        }
        
        return proceed.call(this);
    });

    /**
     * Wrapping up the infChart.manager.toggleLastPriceLabel to check the toggle of price label
     */
    infChart.util.wrap(infChart.manager, 'toggleLastPriceLabel', function (proceed, chartId, isPropertyChange) {
        if (isPropertyChange) {
            let iChart = infChart.manager.getChart(chartId);

            /**
             * Execute the undo/redo with the new properties
             * @param {string} newType new chart type
             */
            function undoRedo(chartId) {
                proceed.call(this, chartId, true);
            }

            infChart.commandsManager.registerCommand(iChart.id, function () {
                undoRedo(chartId);
            }, function () {
                undoRedo(chartId);
            }, undefined, false, 'toggleLastPriceLabel');
        }
        return proceed.call(this, chartId, isPropertyChange);
    });

    /**
     * Wrapping up the infChart.manager.toggleLastPriceLabel to check the toggle of price label
     */
    infChart.util.wrap(infChart.manager, 'toggleLastPriceLine', function (proceed, chartId, isPropertyChange) {
        if (isPropertyChange) {
            let iChart = infChart.manager.getChart(chartId);

            /**
             * Execute the undo/redo with the new properties
             * @param {string} newType new chart type
             */
            function undoRedo(chartId) {
                proceed.call(this, chartId, true);
            }

            infChart.commandsManager.registerCommand(iChart.id, function () {
                undoRedo(chartId);
            }, function () {
                undoRedo(chartId);
            }, undefined, false, 'toggleLastPriceLine');
        }
        return proceed.call(this, chartId, isPropertyChange);
    });

    /**
     * Wrapping up the infChart.manager.toggleLastPriceLabel to check the toggle of price label
     */
    infChart.util.wrap(infChart.manager, 'toggleBarClosureTime', function (proceed, chartId, isPropertyChange) {
        if (isPropertyChange) {
            let iChart = infChart.manager.getChart(chartId);

            /**
             * Execute the undo/redo with the new properties
             * @param {string} newType new chart type
             */
            function undoRedo(chartId) {
                proceed.call(this, chartId, true);
            }

            infChart.commandsManager.registerCommand(iChart.id, function () {
                undoRedo(chartId);
            }, function () {
                undoRedo(chartId);
            }, undefined, false, 'toggleBarClosureTime');
        }
        return proceed.call(this, chartId, isPropertyChange);
    });

    //endregion=====================end of Stock Chart Wrappers=========================================================
})(jQuery, infChart);