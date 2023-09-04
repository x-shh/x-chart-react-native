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
        return infChart.manager.getChart(chartContainerId);
    };

    //region=====================Indicator General Wrappers=========================================================

    /**
     * Wrapping up the infChart.StockChart.prototype.addIndicator to catch the adding indicator  and set the cammands(undo/redo) accordingly
     */
    infChart.util.wrap(infChart.StockChart.prototype, 'addIndicator', function (proceed, type, config, redraw, isNewConfig, indicatorId, index) {
        var indicator = proceed.call(this, type, config, redraw, isNewConfig, indicatorId, index);
        if (isNewConfig && indicator && !infChart.indicatorMgr.isSingletonIndicator(type)) {
            var xChart = this;
            indicatorId = indicator.id;

            infChart.commandsManager.registerCommand(xChart.id, function () {
                indicator = proceed.call(xChart, type, config, true, false, indicatorId);
                xChart._onPropertyChange("indicators", {id: indicator.id, type: indicator.type, action: 'add'});
            }, function () {
                indicator = infChart.indicatorMgr.getIndicatorById(xChart.id, indicatorId);
                xChart.removeIndicator(indicator, false);
                xChart._onPropertyChange("indicators", {id: indicator.id, type: indicator.type, action: 'remove'});
            }, undefined, false, 'addIndicator');
        }
        return indicator;

    });

    /**
     * Wrapping up the infChart.Indicator.prototype.removeSeries to catch the removing indicator  and set the cammands(undo/redo) accordingly
     */
    infChart.util.wrap(infChart.Indicator.prototype, 'removeSeries', function (proceed, seriesId, isPropertyChange) {
        if (isPropertyChange && !infChart.indicatorMgr.isSingletonIndicator(this.type)) {
            var indicator = this;
            var indicatorId = indicator.id;
            var xChartId = _getChartIdFromHighchartInstance(indicator.chart);
            var xChart = _getChartObj(xChartId);
            var type = indicator.type;
            var indicatorProperties = indicator.getProperties();
            var seriesOptions = xChart.chart.get(seriesId).options;
            var index = infChart.indicatorMgr.getIndicatorOrder(xChart.id, indicatorId);

            proceed.call(this, seriesId, isPropertyChange);

            if (indicator.series.length == 0) {
                infChart.commandsManager.registerCommand(xChart.id, function () {
                    indicator = infChart.indicatorMgr.getIndicatorById(xChartId, indicatorId);
                    xChart.removeIndicator(indicator, false);
                    xChart._onPropertyChange("indicators", {id: indicator.id, type: indicator.type, action: 'remove'});

                }, function () {

                    indicator = infChart.indicatorMgr.getIndicatorById(xChartId, indicatorId);
                    if (!indicator) {
                        indicator = xChart.addIndicator(type, indicatorProperties, true, false, indicatorId, index);
                        xChart._onPropertyChange("indicators", {id: indicator.id, type: indicator.type, action: 'add'});
                    }
                }, undefined, false, 'removeIndicator');
            } else {

                infChart.commandsManager.registerCommand(xChart.id, function () {
                    indicator = infChart.indicatorMgr.getIndicatorById(xChartId, indicatorId);
                    xChart.removeSeries(seriesId, false);
                    xChart._onPropertyChange("indicators", {id: indicator.id, type: indicator.type, action: 'add'});

                }, function () {

                    indicator = infChart.indicatorMgr.getIndicatorById(xChartId, indicatorId);
                    if (indicator) {
                        indicator.addSeries(seriesOptions);
                        xChart._onPropertyChange("indicators", {id: indicator.id, type: indicator.type, action: 'add'});
                    }
                }, undefined, false, 'removeIndicator_removeSeries');
            }
        } else {
            proceed.call(this, seriesId, isPropertyChange);
        }
    });

    //endregion=====================end of Indicator General Wrappers=========================================================

    //region =================================indicator settings========================================================

    /**
     * Wrapping up the infChart.Indicator.prototype.onBaseChange to catch the cheching setting of base of the indicator  and set the cammands(undo/redo) accordingly
     */
    infChart.util.wrap(infChart.Indicator.prototype, 'onBaseChange', function (proceed, value, isPropertyChange) {
        var indicator = this;
        if (isPropertyChange) {
            var indicatorId = indicator.id;
            var xChartId = _getChartIdFromHighchartInstance(indicator.chart);
            var xChart = _getChartObj(xChartId);
            var currentBase = indicator.params.base;

            proceed.apply(indicator, Array.prototype.slice.call(arguments, 1));

            /**
             * Execute the undo/redo with the new properties
             * @param {string} newBase new base type
             */
            function undoRedo(newBase) {
                indicator = infChart.indicatorMgr.getIndicatorById(xChartId, indicatorId);
                var settingPanel = indicator.panel;
                if (settingPanel) {
                    settingPanel.data("infUndoRedo", true);
                    settingPanel.find("[inf-type-base='" + newBase + "']").trigger("click");
                } else {
                    proceed.call(indicator, newBase, false);
                }
                indicator.onPropertyChange();
            }

            infChart.commandsManager.registerCommand(xChart.id, function () {
                undoRedo(value);
            }, function () {
                undoRedo(currentBase);
            }, undefined, false, 'indicator_onBaseChange');
        } else {
            proceed.apply(indicator, Array.prototype.slice.call(arguments, 1));
        }
    });

    /**
     * Wrapping up the infChart.Indicator.prototype.onSelectionChange to catch the changinf the options of a param selection of the indicator  and set the cammands(undo/redo) accordingly
     */
    infChart.util.wrap(infChart.Indicator.prototype, 'onSelectionChange', function (proceed, param, value, isPropertyChange) {
        var indicator = this;
        if (isPropertyChange) {
            var indicatorId = indicator.id;
            var xChartId = _getChartIdFromHighchartInstance(indicator.chart);
            var xChart = _getChartObj(xChartId);
            var currentValue = indicator.params[param];

            proceed.apply(indicator, Array.prototype.slice.call(arguments, 1));

            /**
             * Execute the undo/redo with the new properties
             * @param {string} newValue new value
             */
            function undoRedo(newValue) {
                indicator = infChart.indicatorMgr.getIndicatorById(xChartId, indicatorId);
                var settingPanel = indicator.panel;
                if (settingPanel) {
                    settingPanel.data("infUndoRedo", true);
                    settingPanel.find("[inf-ind-sel='" + param + "'][value='" + newValue + "']").trigger("click");
                } else {
                    proceed.call(indicator, param, newValue, false);
                }
                indicator.onPropertyChange();
            }

            infChart.commandsManager.registerCommand(xChart.id, function () {
                undoRedo(value);
            }, function () {
                undoRedo(currentValue);
            }, undefined, false, 'indicator_onSelectionChange');
        } else {
            proceed.apply(indicator, Array.prototype.slice.call(arguments, 1));
        }
    });

    /**
     * Wrapping up the infChart.Indicator.prototype.onSelectionChange to catch the changinf the options of a param selection of the indicator  and set the cammands(undo/redo) accordingly
     */
    infChart.util.wrap(infChart.Indicator.prototype, 'onInputParamChange', function (proceed, param, value, isPropertyChange) {
        var indicator = this;
        var currentValue = indicator.params[param];
        if (isPropertyChange && currentValue !== value) {
            var indicatorId = indicator.id;
            var xChartId = _getChartIdFromHighchartInstance(indicator.chart);
            var xChart = _getChartObj(xChartId);
            proceed.apply(indicator, Array.prototype.slice.call(arguments, 1));

            /**
             * Execute the undo/redo with the new properties
             * @param {string} newValue new value
             */
            function undoRedo(newValue) {
                indicator = infChart.indicatorMgr.getIndicatorById(xChartId, indicatorId);
                var settingPanel = indicator.panel;
                if (settingPanel) {
                    settingPanel.data("infUndoRedo", true);
                    settingPanel.find("[inf-ind-param='" + param + "']").val(newValue);
                }
                proceed.call(indicator, param, newValue, false);
                indicator.onPropertyChange();
            }

            infChart.commandsManager.registerCommand(xChart.id, function () {
                undoRedo(value);
            }, function () {
                undoRedo(currentValue);
            }, undefined, false, 'indicator_onInputParamChange');
        } else {
            proceed.apply(indicator, Array.prototype.slice.call(arguments, 1));
        }
    });

    infChart.util.wrap(infChart.Indicator.prototype, 'onCheckItemChange', function(proceed, param, value, isPropertyChange) {
        var indicator = this;
        if(isPropertyChange) {
            var indicatorId = indicator.id;
            var xChartId = _getChartIdFromHighchartInstance(indicator.chart);
            var xChart = _getChartObj(xChartId);
            var currentValue = indicator.params[param];
            proceed.apply(indicator, Array.prototype.slice.call(arguments, 1));

            function undoRedo(newValue) {
                indicator = infChart.indicatorMgr.getIndicatorById(xChartId, indicatorId);
                var settingPanel = indicator.panel;
                if (settingPanel) {
                    settingPanel.data("infUndoRedo", true);
                    settingPanel.find("[inf-ind-checkbox='" + param + "']").trigger("click");
                }
                proceed.call(indicator, param, newValue, false);
                indicator.onPropertyChange();
            }

            infChart.commandsManager.registerCommand(xChart.id, function () {
                undoRedo(value);
            }, function () {
                undoRedo(currentValue);
            }, undefined, false, 'indicator_onCheckItemChange');
        } else {
            proceed.apply(indicator, Array.prototype.slice.call(arguments, 1));
        }
    });

    /**
     * Wrapping up the infChart.Indicator.prototype.onOnOffChange to catch the changing the visibility of a series  of the indicator  and set the cammands(undo/redo) accordingly
     */
    infChart.util.wrap(infChart.Indicator.prototype, 'onOnOffChange', function (proceed, seriesId, isOn, isPropertyChange) {
        var indicator = this;
        var retVal;
        if (isPropertyChange) {
            var indicatorId = indicator.id;
            var xChartId = _getChartIdFromHighchartInstance(indicator.chart);
            var xChart = _getChartObj(xChartId);
            var currentValue = !isOn;

            retVal = proceed.apply(indicator, Array.prototype.slice.call(arguments, 1));

            /**
             * Execute the undo/redo with the new properties
             * @param {string} newValue new value
             */
            function undoRedo(newValue) {
                indicator = infChart.indicatorMgr.getIndicatorById(xChartId, indicatorId);
                var settingPanel = indicator.panel;
                if (settingPanel) {
                    settingPanel.data("infUndoRedo", true);
                    settingPanel.find("[inf-ind-series='" + seriesId + "']").trigger("click");
                }
                proceed.call(indicator, seriesId, newValue, false);
                indicator.onPropertyChange();
            }

            infChart.commandsManager.registerCommand(xChart.id, function () {
                undoRedo(isOn);
            }, function () {
                undoRedo(currentValue);
            }, undefined, false, 'indicator_onOnOffChange');
        } else {
            retVal = proceed.apply(indicator, Array.prototype.slice.call(arguments, 1));
        }
        return retVal;
    });

    /**
     * Wrapping up the infChart.Indicator.prototype.onColorChange to catch the changing the color of the series of the indicator  and set the cammands(undo/redo) accordingly
     */
    infChart.util.wrap(infChart.Indicator.prototype, 'onColorChange', function (proceed, seriesId, colorObj, isPropertyChange, colorPickerRef) {
        if (isPropertyChange) {
            var indicator = this;
            var indicatorId = indicator.id;
            var xChartId = _getChartIdFromHighchartInstance(indicator.chart);
            var xChart = _getChartObj(xChartId);
            var series = xChart.chart.get(seriesId);
            var colorProperties = xChart._getColorPropertiesFromOptions(series.options, series.type, series);
            var currentColor;
            var newColor;
            var currentOpacity = colorProperties.fillOpacity;
            var newOpacity;
            var lastAction = infChart.commandsManager.getLastAction(xChartId);
            var colorPickerEl = indicator.panel.find(colorPickerRef || "[inf-ctrl=colorPicker]");
            var colorPickerType = colorPickerEl.attr("inf-ctrl-val");

            if (colorPickerType === "up") {
                currentColor = colorProperties.upColor || colorProperties.fillColor || colorProperties.color;
                newColor = colorObj.hexColor;
                newOpacity = infChart.util.getOpacityFromRGBA(colorObj.upColor);
            } else if (colorPickerType === "down") {
                currentColor = colorProperties.negativeFillColor || (colorProperties.fillColor && colorProperties.fillColor.stops && colorProperties.fillColor.stops[1][1])
                    || colorProperties.negativeColor || colorProperties.color;
                newColor = colorObj.hexColor;
                newOpacity = infChart.util.getOpacityFromRGBA(colorObj.downColor);
            } else {
                currentColor = colorProperties.color;
                newColor = colorObj.hexColor;
                newOpacity = infChart.util.getOpacityFromRGBA(colorObj.color);
            }

            /**
             * Execute the undo/redo with the new properties
             * @param {string} newColor color code
             * @param {float} newOpacity opacity
             */
            function undoRedo(newColor, newOpacity) {
                indicator = infChart.indicatorMgr.getIndicatorById(xChartId, indicatorId);
                var settingPanel = indicator.panel;
                if (settingPanel) {
                    settingPanel.data("infUndoRedo", true);
                    settingPanel.find(colorPickerRef || "[inf-ctrl=colorPicker]").mainColorPanel("value", {
                        color: newColor,
                        opacity: newOpacity
                    })
                } else {
                    proceed.call(indicator, seriesId, {color: newColor}, false);
                }
                indicator.onPropertyChange();
            }

            if (lastAction && lastAction.actionType === 'indicator_onColorChange' && !lastAction.freezeUpdatingSame) {
                lastAction.action = function () {
                    undoRedo(newColor, newOpacity);
                }
            } else {
                infChart.commandsManager.registerCommand(xChartId, function () {
                    undoRedo(newColor, newOpacity);
                }, function () {
                    undoRedo(currentColor, currentOpacity);
                }, undefined, false, 'indicator_onColorChange');
            }
        }
        proceed.call(this, seriesId, colorObj, isPropertyChange, colorPickerRef);
    });

    /**
     * Wrapping up the infChart.Indicator.prototype.onLineWidthChange to catch the changing the line width of the series of the indicator  and set the cammands(undo/redo) accordingly
     */
    infChart.util.wrap(infChart.Indicator.prototype, 'onLineWidthChange', function (proceed, seriesId, strokeWidth, isPropertyChange, colorPickerRef) {
        if (isPropertyChange) {
            var indicator = this;
            var indicatorId = indicator.id;
            var xChartId = _getChartIdFromHighchartInstance(indicator.chart);
            var xChart = _getChartObj(xChartId);
            var series = xChart.chart.get(seriesId);
            var colorProperties = xChart._getColorPropertiesFromOptions(series.options, series.type, series);
            var currentWidth = colorProperties.lineWidth;

            /**
             * Execute the undo/redo with the new properties
             * @param {string} newSize new width
             */
            function undoRedo(newSize) {
                indicator = infChart.indicatorMgr.getIndicatorById(xChartId, indicatorId);
                var settingPanel = indicator.panel;
                var settingsContainer = colorPickerRef && settingPanel.find(colorPickerRef) || settingPanel;

                if (settingsContainer) {
                    settingPanel.data("infUndoRedo", true);

                    settingsContainer.find("[inf-ctrl=lineWidth][inf-size=" + newSize + "]").trigger('click');
                } else {
                    proceed.call(indicator, seriesId, newSize, false);
                }
                indicator.onPropertyChange();
            }

            infChart.commandsManager.registerCommand(xChartId, function () {
                undoRedo(strokeWidth);
            }, function () {
                undoRedo(currentWidth);
            }, undefined, false, 'indicator_onLineWidthChange');
        }
        proceed.call(this, seriesId, strokeWidth, isPropertyChange, colorPickerRef);
    });

    /**
     * Wrapping up the infChart.Indicator.prototype.onChartTypeChange to catch the changing the type of the series of the indicator  and set the cammands(undo/redo) accordingly
     */
    infChart.util.wrap(infChart.Indicator.prototype, 'onChartTypeChange', function (proceed, seriesId, chartType, colorObj, isPropertyChange) {
        if (isPropertyChange) {
            var indicator = this;
            var indicatorId = indicator.id;
            var xChartId = _getChartIdFromHighchartInstance(indicator.chart);
            var xChart = _getChartObj(xChartId);
            var series = xChart.chart.get(seriesId);
            var currentColorsObj = infChart.structureManager.settings.getSeriesColorsForChartType(indicator.panel, seriesId, series.type);
            var currentType = series.type;
            var newColorsObj = infChart.structureManager.settings.getSeriesColorsForChartType(indicator.panel, seriesId, chartType);

            /**
             * Execute the undo/redo with the new properties
             * @param {string} newType new type
             * @param {object} colors of the new type
             */
            function undoRedo(newType, colors) {
                indicator = infChart.indicatorMgr.getIndicatorById(xChartId, indicatorId);
                var settingPanel = indicator.panel;
                if (settingPanel) {
                    settingPanel.data("infUndoRedo", true);
                    var settingsContainer = settingPanel.find("[inf-row-item-rel='" + seriesId + "']");
                    settingsContainer.find("li [ind-ind-type=" + newType + "]").trigger('click');
                } else {
                    proceed.call(indicator, seriesId, newType, colors, false);
                }
                indicator.onPropertyChange();
            }

            infChart.commandsManager.registerCommand(xChartId, function () {
                undoRedo(chartType, newColorsObj);
            }, function () {
                undoRedo(currentType, currentColorsObj);
            }, undefined, false, 'indicator_onChartTypeChange');

        }
        proceed.call(this, seriesId, chartType, colorObj, isPropertyChange);
    });

    //endregion ============================end of indicator settings====================================================

    //region ============================Advanced indicator settings====================================================
    /**
     * Wrapping up the infChart.drawingUtils.common.settings.onFillColorChange to catch the color settings change
     */
    infChart.util.wrap(infChart.highLowRegressionChannelDrawing.prototype, 'onFillColorChange', function (proceed, rgb, color, opacity, level, isPropertyChange) {
        if (isPropertyChange && !infChart.drawingsManager.getIsActiveDrawingInprogress()) {
            var drawingId = this.drawingId;
            var ann = this.annotation;
            var xChartId = _getChartIdFromHighchartInstance(ann.chart);
            var additionalDrawingsFill = this.additionalDrawings.fill[level];
            var currentColor = additionalDrawingsFill.element.getAttribute("fill");
            var currentOpacity = additionalDrawingsFill.element.getAttribute("fill-opacity");
            var lastAction = infChart.commandsManager.getLastAction(xChartId);

            /**
             * Execute the undo/redo with the new properties
             * @param {string} newColor color code
             * @param {float} newOpacity opacity
             */
            function undoRedo(newColor, newOpacity) {
                var drawingObj = infChart.drawingsManager.getDrawingObject(xChartId, drawingId);
                var settingPanel = drawingObj.settingsPopup;
                if (settingPanel) {
                    settingPanel.data("infUndoRedo", true);
                    settingPanel.find("[inf-ctrl=fillColorPicker][inf-ctrl-val='" + level + "']").mainColorPanel("value", {
                        color: newColor,
                        opacity: newOpacity
                    })
                } else {
                    proceed.call(drawingObj, rgb, newColor, newOpacity, level, false);
                }
                drawingObj.onPropertyChange();
            }

            if (lastAction && lastAction.actionType === 'indicator_highLowRegressionChannel_onFillColorChange' && !lastAction.freezeUpdatingSame) {
                lastAction.action = function () {
                    undoRedo(color, opacity);
                }
            } else {
                infChart.commandsManager.registerCommand(xChartId, function () {
                    undoRedo(color, opacity);
                }, function () {
                    undoRedo(currentColor, currentOpacity);
                }, undefined, false, 'indicator_highLowRegressionChannel_onFillColorChange');
            }
        }
        proceed.call(this, rgb, color, opacity, level, isPropertyChange);
    });

    //endregion ============================end of Andcvanced indicator settings====================================================
})(jQuery, infChart);