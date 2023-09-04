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

    var _isPropertyChanged = function (shapeId, lastOptions, properties) {
        var isChangeProperty = true;
        switch (shapeId) {
            case 'fibVerRetracements':
            case 'fib2PointTimeProjection':
            case 'fib3PointTimeProjection':
                if (lastOptions.xValue === properties.xValue && lastOptions.yValue === properties.yValue &&
                    lastOptions.xValueEnd === properties.xValueEnd && lastOptions.yValueEnd === properties.yValueEnd &&
                    lastOptions.trendXValue === properties.trendXValue && lastOptions.trendYValue === properties.trendYValue &&
                    lastOptions.jointLineValue === properties.jointLineValue) {
                    isChangeProperty = false;
                }
                break;
            case 'longPositions':
            case 'shortPositions':
                if (lastOptions.xValue === properties.xValue && lastOptions.yValue === properties.yValue &&
                    lastOptions.xValueEnd === properties.xValueEnd && lastOptions.yValueEnd === properties.yValueEnd &&
                    lastOptions.trendXValue === properties.trendXValue && lastOptions.trendYValue === properties.trendYValue &&
                    lastOptions.settings.stopLoss === properties.settings.stopLoss &&
                    lastOptions.settings.takeProfit === properties.settings.takeProfit) {
                    isChangeProperty = false;
                }
                break;
            case 'longLine':
            case 'shortLine':
                if (lastOptions.xValue === properties.xValue && lastOptions.yValue === properties.yValue &&
                    lastOptions.xValueEnd === properties.xValueEnd && lastOptions.yValueEnd === properties.yValueEnd &&
                    lastOptions.trendXValue === properties.trendXValue && lastOptions.trendYValue === properties.trendYValue &&
                    lastOptions.stopLoss[0].yValue === properties.stopLoss[0].yValue &&
                    lastOptions.stopLoss[1].yValue === properties.stopLoss[1].yValue &&
                    lastOptions.stopLoss[2].yValue === properties.stopLoss[2].yValue &&
                    lastOptions.takeProfit[0].yValue === properties.takeProfit[0].yValue &&
                    lastOptions.takeProfit[1].yValue === properties.takeProfit[1].yValue &&
                    lastOptions.takeProfit[2].yValue === properties.takeProfit[2].yValue) {
                    isChangeProperty = false;
                }
                break;
            case 'harmonicPattern':
            case 'abcdPattern':
            case 'polyline':
                if (lastOptions.xValue === properties.xValue && lastOptions.yValue === properties.yValue &&
                    lastOptions.xValueEnd === properties.xValueEnd && lastOptions.yValueEnd === properties.yValueEnd &&
                    lastOptions.trendXValue === properties.trendXValue && lastOptions.trendYValue === properties.trendYValue &&
                    lastOptions.intermediatePoints === properties.intermediatePoints) {
                    isChangeProperty = false;
                }
                break;
            case 'elliotTriangleWave':
            case 'elliotImpulseWave':
            case 'elliotCorrectiveWave':
            case 'correctiveTripleWave':
            case 'elliotCorrectiveDoubleWave':
                if (lastOptions.xValue === properties.xValue && lastOptions.yValue === properties.yValue &&
                    lastOptions.xValueEnd === properties.xValueEnd && lastOptions.yValueEnd === properties.yValueEnd &&
                    lastOptions.trendXValue === properties.trendXValue && lastOptions.trendYValue === properties.trendYValue &&
                    lastOptions.intermediatePoints === properties.intermediatePoints) {
                        isChangeProperty = false;
                    }
                    break;
            default:
                if (lastOptions.xValue === properties.xValue && lastOptions.yValue === properties.yValue &&
                    lastOptions.xValueEnd === properties.xValueEnd && lastOptions.yValueEnd === properties.yValueEnd &&
                    lastOptions.trendXValue === properties.trendXValue && lastOptions.trendYValue === properties.trendYValue) {
                    isChangeProperty = false;
                }
                break;
        }
        return isChangeProperty;
    }

    //region=====================Drawing Wrappers=========================================================

    /**
     * Wrapping up the infChart.Drawing.prototype.wrapFunctionHelper to catch the drawing functions and set the cammands(undo/redo) accordingly
     */
    infChart.util.wrap(infChart.Drawing.prototype, 'wrapFunctionHelper', function (proceed, functionName, func, arguments) {
        var returnVal;
        var drawingObj = this;
        var drawingId = drawingObj.drawingId;
        var ann = drawingObj.annotation;
        var drawingProperties;
        var xChartId = _getChartIdFromHighchartInstance(ann.chart);
        var xChart = _getChartObj(xChartId);

        if (_isTrackHistoryEnabledDrawing(ann)) {
            switch (functionName) {
                case "stopFunction":
                    // to catch the adding new drawing
                    returnVal = proceed.call(this, functionName, func, arguments);
                    drawingProperties = infChart.drawingsManager.getDrawingProperties(ann);
                    var isNewDrawing = arguments[2];

                    if (isNewDrawing === true && !(returnVal && returnVal.stopPropagation)) {
                        infChart.commandsManager.registerCommand(xChart.id, function () {
                            drawingObj = infChart.drawingsManager.drawDrawingFromProperties(drawingObj, xChart.chart, infChart.drawingsManager.getSettingsContainer(xChartId), drawingProperties);
                        }, function () {
                            infChart.drawingsManager.removeDrawing(xChartId, drawingId, false, false);
                        }, undefined, false, 'addDrawing');
                    }
                    break;
                case "translateEndFunction":
                    // to catch the translate end (used in vertical line)
                    returnVal = proceed.call(this, functionName, func, arguments);
                    drawingProperties = infChart.drawingsManager.getDrawingProperties(ann);

                    var lastAction = infChart.commandsManager.getLastAction(xChartId);
                    if (lastAction && lastAction.actionType === 'onAnnotationStore' && !lastAction.releasedAnnotation) {
                        var lastOptions = lastAction.callbackOptions.redoProperties;
                        if (!(lastOptions.xValue === drawingProperties.xValue && lastOptions.xValueEnd === drawingProperties.xValueEnd &&
                            lastOptions.yValue === drawingProperties.yValue && lastOptions.yValueEnd === drawingProperties.yValueEnd)) {
                            lastAction.callbackOptions.redoProperties = drawingProperties;
                        } else {
                            infChart.commandsManager.removeLastAction(xChartId);
                        }
                        lastAction.releasedAnnotation = true;
                    }
                    break;
                default :
                    returnVal = proceed.call(this, functionName, func, arguments);
                    break;
            }
        } else {
            returnVal = proceed.call(this, functionName, func, arguments);
        }
        return returnVal;
    });

    /**
     * Wrapping up the infChart.Drawing.prototype.destroy to catch the deleting drawing  and set the cammands(undo/redo) accordingly
     */
    infChart.util.wrap(infChart.Drawing.prototype, 'destroy', function (proceed, isPropertyChange, drawingProperties) {
        if (_isTrackHistoryEnabledDrawing(this.annotation) && isPropertyChange) {
            var drawingObj = this;
            var drawingId = drawingObj.drawingId;
            var ann = drawingObj.annotation;
            var xChartId = _getChartIdFromHighchartInstance(ann.chart);
            var xChart = _getChartObj(xChartId);

            infChart.commandsManager.registerCommand(xChart.id, function () {
                infChart.drawingsManager.removeDrawing(xChartId, drawingId, false, false);
            }, function () {
                var settingsContainer = infChart.drawingsManager.getSettingsContainer(xChartId);
                var quickSettingsContainer = infChart.drawingsManager.getQuickSettingsContainer(xChartId);
                var drawingObject = infChart.drawingsManager.createDrawing(xChart.chart, drawingProperties.shape, settingsContainer, quickSettingsContainer, drawingId);
                drawingObj = infChart.drawingsManager.drawDrawingFromProperties(drawingObject, xChart.chart, settingsContainer, drawingProperties, drawingObject.drawingId);
            }, undefined, false, 'removeDrawing');
        }
        return proceed.call(this, isPropertyChange);
    });

    /**
     * Wrapping up the infChart.drawingsManager.pasteNewItem to catch the paste drawing which is copied and set the cammands(undo/redo) accordingly
     */
    infChart.util.wrap(infChart.drawingsManager, 'pasteNewItem', function (proceed, annotation) {
        var returnVal = proceed.call(this, annotation);
        if (_isTrackHistoryEnabledDrawing(annotation)) {
            var xChartId = _getChartIdFromHighchartInstance(annotation.chart);
            var xChart = _getChartObj(xChartId);
            var drawingObj = returnVal;
            var drawingId = drawingObj.drawingId;
            var ann = drawingObj.annotation;
            var drawingProperties = infChart.drawingsManager.getDrawingProperties(ann);

            infChart.commandsManager.registerCommand(xChart.id, function () {
                var settingsContainer = infChart.drawingsManager.getSettingsContainer(xChartId);
                var quickSettingsContainer = infChart.drawingsManager.getQuickSettingsContainer(xChartId);
                var drawingObject = infChart.drawingsManager.createDrawing(xChart.chart, drawingProperties.shape, settingsContainer, quickSettingsContainer, drawingId);
                drawingObj = infChart.drawingsManager.drawDrawingFromProperties(drawingObject, xChart.chart,settingsContainer, drawingProperties, drawingObj.drawingId);
                drawingObj.annotation.events.deselect.call(drawingObj.annotation);
            }, function () {
                infChart.drawingsManager.removeDrawing(xChartId, drawingId, false, false);
            }, undefined, false, 'pasteDrawing');
        }
        return returnVal;
    });

    /**
     * Wrapping up the infChart.drawingsManager.resetDrawing to catch the resetting drawing  and set the cammands(undo/redo) accordingly
     */
    infChart.util.wrap(infChart.drawingsManager, 'resetDrawing', function (proceed, chartId, drawingId, currentDrawingProperties) {
        var drawingObject = infChart.drawingsManager.getDrawingObject(chartId, drawingId);
        var annotation = drawingObject.annotation;
        var previousDrawingProperties, newDrawingProperties;
        if (_isTrackHistoryEnabledDrawing(annotation)) {
            previousDrawingProperties = infChart.drawingsManager.getDrawingProperties(annotation);
            newDrawingProperties = proceed.call(this, chartId, drawingId, currentDrawingProperties);
            function undoRedo (properties) {
                infChart.drawingsManager.removeDrawing(chartId, drawingId);
                var settingsContainer = infChart.drawingsManager.getSettingsContainer(chartId);
                var quickSettingsContainer = infChart.drawingsManager.getQuickSettingsContainer(chartId);
                var drawingObject = infChart.drawingsManager.createDrawing(_getChartObj(chartId).chart, properties.shape, settingsContainer, quickSettingsContainer, drawingId);
                infChart.drawingsManager.drawDrawingFromProperties(drawingObject, _getChartObj(chartId).chart, settingsContainer, properties, drawingObject.drawingId);
            }
            infChart.commandsManager.registerCommand(chartId, function () {
                undoRedo(newDrawingProperties);
            }, function () {
                undoRedo(previousDrawingProperties);
            }, undefined, false, 'resetDrawing');
        } else {
            newDrawingProperties = proceed.call(this, chartId, drawingId, currentDrawingProperties);
        }
        return newDrawingProperties;
    });

    /**
     * Wrapping up the infChart.drawingsManager.applyTemplateProperties to catch the applyTemplateProperties and set the cammands(undo/redo) accordingly
     */
    infChart.util.wrap(infChart.drawingsManager, 'applyTemplateProperties', function (proceed, chartId, drawingId, currentDrawingProperties, templateProperties) {
        var drawingObject = infChart.drawingsManager.getDrawingObject(chartId, drawingId);
        var annotation = drawingObject.annotation;
        var previousDrawingProperties, newDrawingProperties;
        if (_isTrackHistoryEnabledDrawing(annotation)) {
            previousDrawingProperties = infChart.drawingsManager.getDrawingProperties(annotation);
            newDrawingProperties = proceed.call(this, chartId, drawingId, currentDrawingProperties, templateProperties);
            function undoRedo (properties) {
                infChart.drawingsManager.removeDrawing(chartId, drawingId);
                var settingsContainer = infChart.drawingsManager.getSettingsContainer(chartId);
                var quickSettingsContainer = infChart.drawingsManager.getQuickSettingsContainer(chartId);
                var drawingObject = infChart.drawingsManager.createDrawing(_getChartObj(chartId).chart, properties.shape, settingsContainer, quickSettingsContainer, drawingId);
                infChart.drawingsManager.drawDrawingFromProperties(drawingObject, _getChartObj(chartId).chart, settingsContainer, properties, drawingObject.drawingId);
            }
            infChart.commandsManager.registerCommand(chartId, function () {
                undoRedo(newDrawingProperties);
            }, function () {
                undoRedo(previousDrawingProperties);
            }, undefined, false, 'applyTemplateProperties');
        } else {
            newDrawingProperties = proceed.call(this, chartId, drawingId, currentDrawingProperties);
        }
        return newDrawingProperties;
    });

    /**
     * Wrapping up the infChart.drawingsManager.onAnnotationStore to catch the paste drawing which is going to be dragged or resized
     */
    infChart.util.wrap(infChart.drawingsManager, 'onAnnotationStore', function (proceed, annotation) {
        if (_isTrackHistoryEnabledDrawing(annotation)) {
            var xChartId = _getChartIdFromHighchartInstance(annotation.chart);
            var xChart = _getChartObj(xChartId);
            var drawingObj = infChart.drawingsManager.getDrawingObject(xChartId, annotation.options.id);
            var drawingId = drawingObj.drawingId;
            var firstDrawingProperties = infChart.drawingsManager.getDrawingProperties(annotation);
            var redoProperties = JSON.parse(JSON.stringify(firstDrawingProperties));

            infChart.commandsManager.registerCommand(xChart.id, function (options) {
                infChart.drawingsManager.updateDrawingProperties(xChartId, drawingId, options.redoProperties);
                infChart.drawingUtils.common.onPropertyChange.call(drawingObj);
            }, function () {
                infChart.drawingsManager.updateDrawingProperties(xChartId, drawingId, redoProperties);
                infChart.drawingUtils.common.onPropertyChange.call(drawingObj);
            }, undefined, false, 'onAnnotationStore', {redoProperties: redoProperties});
        }
        return proceed.call(this, annotation);
    });

    /**
     * Wrapping up the infChart.drawingsManager.onAnnotationRelease to catch the paste drawing which is dragged or resized
     */
    infChart.util.wrap(infChart.drawingsManager, 'onAnnotationRelease', function (proceed, annotation) {
        var xChartId = _getChartIdFromHighchartInstance(annotation.chart);
        var returnVal = proceed.call(this, annotation);
        if (_isTrackHistoryEnabledDrawing(annotation)) {
            var drawingProperties = infChart.drawingsManager.getDrawingProperties(annotation);
            var lastAction = infChart.commandsManager.getLastAction(xChartId);
            var drawingObj = infChart.drawingsManager.getDrawingObject(xChartId, annotation.options.id);

            if (lastAction && lastAction.actionType === 'onAnnotationStore' && !lastAction.releasedAnnotation) { // && !drawingObj.translateEnd
                var lastOptions = lastAction.callbackOptions.redoProperties;
                if (_isPropertyChanged(drawingObj.shape, lastOptions, drawingProperties)) {
                    lastAction.callbackOptions.redoProperties = drawingProperties;
                } else {
                    infChart.commandsManager.removeLastAction(xChartId);
                }
                lastAction.releasedAnnotation = true;
            }
        }
        return returnVal;
    });

    //region Drawing settings

    /**
     * Wrapping up the infChart.drawingUtils.common.settings.onLineWidthChange to catch the line width changes
     */
    infChart.util.wrap(infChart.drawingUtils.common.settings, 'onLineWidthChange', function (proceed, strokeWidth, isPropertyChange) {
        var ann = this.annotation;
        if ((_isTrackHistoryEnabledDrawing(ann) || _isIndicatorDrawing(ann)) && isPropertyChange) {
            var drawingId = this.drawingId;
            var xChartId = _getChartIdFromHighchartInstance(ann.chart);
            var currentWidth = ann.options.shape.params["stroke-width"];

            /**
             * Execute the undo/redo with the new properties
             * @param {number} newSize new width to set
             */
            function undoRedo(newSize) {
                var drawingObj = infChart.drawingsManager.getDrawingObject(xChartId, drawingId);
                var settingPanel = drawingObj.settingsPopup;
                if (settingPanel) {
                    var sizeSelectorElm = settingPanel.find("[inf-ctrl=lineWidth][inf-size=" + newSize + "]");
                    if (sizeSelectorElm.length > 0) {
                        settingPanel.data("infUndoRedo", true);
                        sizeSelectorElm.trigger('click');
                    } else {
                        proceed.call(drawingObj, newSize);
                    }
                } else {
                    proceed.call(drawingObj, newSize);
                }
                drawingObj.onPropertyChange();
            }

            infChart.commandsManager.registerCommand(xChartId, function () {
                undoRedo(strokeWidth);
            }, function () {
                undoRedo(currentWidth);
            }, undefined, false, 'onLineWidthChange');
        }
        proceed.call(this, strokeWidth, isPropertyChange);
    });

    /**
     * Wrapping up the infChart.drawingUtils.common.settings.onLineStyleChange to catch the settings change od dash style
     */
    infChart.util.wrap(infChart.drawingUtils.common.settings, 'onLineStyleChange', function (proceed, dashStyle, isPropertyChange) {
        var ann = this.annotation;
        if (_isTrackHistoryEnabledDrawing(ann) && isPropertyChange) {
            var drawingId = this.drawingId;
            var xChartId = _getChartIdFromHighchartInstance(ann.chart);
            var currentDashStyle = ann.options.shape.params["dashstyle"];

            /**
             * Execute the undo/redo with the new properties
             * @param {string} newDashStyle new style to set
             */
            function undoRedo(newDashStyle) {
                var drawingObj = infChart.drawingsManager.getDrawingObject(xChartId, drawingId);
                var settingPanel = drawingObj.settingsPopup;
                if (settingPanel) {
                    var lineStyleSelectorElm = settingPanel.find("[inf-ctrl=lineStyle][inf-style=" + newDashStyle + "]");
                    if (lineStyleSelectorElm.length > 0) {
                        settingPanel.data("infUndoRedo", true);
                        lineStyleSelectorElm.trigger('click');
                    } else {
                        proceed.call(drawingObj, newDashStyle);
                    }
                } else {
                    proceed.call(drawingObj, newDashStyle);
                }
                drawingObj.onPropertyChange();
            }

            infChart.commandsManager.registerCommand(xChartId, function () {
                undoRedo(dashStyle);
            }, function () {
                undoRedo(currentDashStyle);
            }, undefined, false, 'onLineStyleChange');
        }
        proceed.call(this, dashStyle, isPropertyChange);
    });

    /**
     * Wrapping up the infChart.drawingUtils.common.settings.onLineColorChange to catch the color settings change
     */
    infChart.util.wrap(infChart.drawingUtils.common.settings, 'onLineColorChange', function (proceed, rgb, color, isPropertyChange, colorPickerRef) {
        var ann = this.annotation;
        if ((_isTrackHistoryEnabledDrawing(ann) || _isIndicatorDrawing(ann)) && isPropertyChange && !infChart.drawingsManager.getIsActiveDrawingInprogress()) {
            var drawingId = this.drawingId;
            var xChartId = _getChartIdFromHighchartInstance(ann.chart);
            var currentColor = ann.options.shape.params["stroke"];
            var lastAction = infChart.commandsManager.getLastAction(xChartId);

            /**
             * Execute the undo/redo with the new properties
             * @param {string} newColor color code
             */
            function undoRedo(newColor) {
                var drawingObj = infChart.drawingsManager.getDrawingObject(xChartId, drawingId);
                var settingPanel = drawingObj.settingsPopup;
                if (settingPanel) {
                    var lineColorSelectorElm = settingPanel.find(colorPickerRef || "[inf-ctrl=colorPicker]");
                    if (lineColorSelectorElm.length > 0) {
                        settingPanel.data("infUndoRedo", true);
                        lineColorSelectorElm.mainColorPanel("value", {color: newColor})
                    } else {
                        proceed.call(drawingObj, rgb, newColor, false, colorPickerRef);
                    }
                } else {
                    proceed.call(drawingObj, rgb, newColor, false, colorPickerRef);
                }
                drawingObj.onPropertyChange();
            }

            if (lastAction && lastAction.actionType === 'onLineColorChange' && !lastAction.freezeUpdatingSame) {
                lastAction.action = function () {
                    undoRedo(color);
                }
            } else {
                infChart.commandsManager.registerCommand(xChartId, function () {
                    undoRedo(color);
                }, function () {
                    undoRedo(currentColor);
                }, undefined, false, 'onLineColorChange');
            }
        }
        proceed.call(this, rgb, color, isPropertyChange);
    });


    /**
     * Wrapping up the infChart.labelDrawing.prototype.onTextChange to catch the line text changes
     */
    infChart.util.wrap(infChart.drawingUtils.common.settings, 'onTextChange', function (proceed, text, isPropertyChange) {
        var drawingId = this.drawingId;
        var ann = this.annotation;
        var xChartId = _getChartIdFromHighchartInstance(ann.chart);
        var shape = this.shape;
        var currentText;
        switch (shape) {
            case 'line':
                currentText = ann.options.lineText;
                updateSettings = infChart.structureManager.drawingTools.updateLineSettings;
                break;
            case 'rectangle':
                currentText = ann.options.rectText;
                updateSettings = infChart.structureManager.drawingTools.updateBasicDrawingSettings;
                break;
            case 'ellipse':
                currentText = ann.options.ellipseText;
                updateSettings = infChart.structureManager.drawingTools.updateBasicDrawingSettings;
                break;
        }

        if (isPropertyChange && !infChart.drawingsManager.getIsActiveDrawingInprogress()) {
            /**
             * Execute the undo/redo with the new properties
             * @param {string} newText new text being set
             */
            function undoRedo(newText) {
                var drawingObj = infChart.drawingsManager.getDrawingObject(xChartId, drawingId);
                var settingPanel = drawingObj.settingsPopup;

                proceed.call(drawingObj, newText, false);
                if (settingPanel) {
                    newText = newText.replace(/<br\s*\/?>/gi, "");
                    updateSettings(settingPanel, undefined, undefined, undefined, undefined, newText, true, undefined, undefined, shape) ;
                }
                drawingObj.onPropertyChange();
            }

            infChart.commandsManager.registerCommand(xChartId, function () {
                undoRedo(text);
            }, function () {
                undoRedo(currentText);
            }, undefined, false, 'onTextChange_label');

        }
        return proceed.call(this, text, isPropertyChange);

    });

    /**
     * Wrapping up the infChart.fibRetracementsDrawing.prototype.onToggleText to catch the fib level value change
     */
    infChart.util.wrap(infChart.drawingUtils.common.settings, 'onToggleText', function (proceed, checked, isPropertyChange, ignoreSettingsSave) {
        if (isPropertyChange) {
            var drawingId = this.drawingId;
            var self = this;
            var ann = self.annotation;
            var xChartId = _getChartIdFromHighchartInstance(ann.chart);
            var currentMode = !checked;

            /**
             * Execute the undo/redo with the new properties
             * @param {boolean} checked - mode chaned
             */
            function undoRedo(checked) {
                var drawingObj = infChart.drawingsManager.getDrawingObject(xChartId, drawingId);
                var settingPanel = drawingObj.settingsPopup;
                proceed.call(self, checked, false);
                self.onPropertyChange();
                if (settingPanel) {
                    settingPanel.find('input[inf-ctrl="textToggle"]').prop('checked', checked);
                    if (drawingObj.shape === "line") {
                        settingPanel.find('input[inf-ctrl="line-text"]').focus();
                    } else {
                        textRef =  drawingObj.shape === "rectangle" ? 'rect-text' : 'ellipse-text';
                        settingPanel.find('textarea[inf-ctrl=' + textRef +']').focus();
                    }
                }
            }

            infChart.commandsManager.registerCommand(self.stockChartId, function () {
                undoRedo(checked);
            }, function () {
                undoRedo(currentMode);
            }, undefined, false, 'onToggleText');
        }
        proceed.call(this, checked, isPropertyChange, ignoreSettingsSave);
    });

    

    infChart.util.wrap(infChart.drawingUtils.common.settings, 'onVerticalPositionSelect', function (proceed, position, isPropertyChange, ignoreSettingsSave) {
        if (isPropertyChange) {
            var drawingId = this.drawingId;
            var self = this;
            var ann = self.annotation;
            var xChartId = _getChartIdFromHighchartInstance(ann.chart);
            var currentPosition = ann.options.verticalPosition;

            /**
             * Execute the undo/redo with the new properties
             * @param {boolean} checked - mode chaned
             */
            function undoRedo(position) {
                var drawingObj = infChart.drawingsManager.getDrawingObject(xChartId, drawingId);
                var settingPanel = drawingObj.settingsPopup;
                proceed.call(drawingObj, position, false);
                drawingObj.onPropertyChange();
                if (settingPanel) {
                    settingPanel.find("div[inf-ctrl=verticalType]").find("span[rel=selectItem]").text(position);
                }
            }

            infChart.commandsManager.registerCommand(self.stockChartId, function () {
                undoRedo(position);
            }, function () {
                undoRedo(currentPosition);
            }, undefined, false, 'onVerticalPositionSelect');
        }
        proceed.call(this, position, isPropertyChange, ignoreSettingsSave);
    });


    infChart.util.wrap(infChart.drawingUtils.common.settings, 'onHorizontalPositionSelect', function (proceed, position, isPropertyChange, ignoreSettingsSave) {
        if (isPropertyChange) {
            var drawingId = this.drawingId;
            var self = this;
            var ann = self.annotation;
            var xChartId = _getChartIdFromHighchartInstance(ann.chart);
            var currentPosition = ann.options.horizontalPosition;

            /**
             * Execute the undo/redo with the new properties
             * @param {boolean} checked - mode chaned
             */
            function undoRedo(position) {
                var drawingObj = infChart.drawingsManager.getDrawingObject(xChartId, drawingId);
                var settingPanel = drawingObj.settingsPopup;
                proceed.call(drawingObj, position, false);
                drawingObj.onPropertyChange();
                if (settingPanel) {
                    settingPanel.find("div[inf-ctrl=horizontalType]").find("span[rel=selectItem]").text(position);
                }
            }

            infChart.commandsManager.registerCommand(self.stockChartId, function () {
                undoRedo(position);
            }, function () {
                undoRedo(currentPosition);
            }, undefined, false, 'onHorizontalPositionSelect');
        }
        proceed.call(this, position, isPropertyChange, ignoreSettingsSave);
    });

    /**
     * Wrapping up the infChart.rectangleDrawing.prototype.onExtendToRight to catch the color settings change
     */
    infChart.util.wrap(infChart.rectangleDrawing.prototype, 'onExtendToRight', function (proceed, extended, isPropertyChange) {
        var self = this;
        if (isPropertyChange) {
            var drawingId = self.drawingId;
            var ann = self.annotation;
            var xChartId = _getChartIdFromHighchartInstance(ann.chart);
            var currentExtend = ann.options.isExtendToRight;

            /**
             * Execute the undo/redo with the new properties
             * @param {boolean} checked - mode chaned
             */
            function undoRedo(currentExtend) {
                var drawingObj = infChart.drawingsManager.getDrawingObject(xChartId, drawingId);
                var settingPanel = drawingObj.settingsPopup;
                if (settingPanel) {
                    var borderColorEnabledElm = settingPanel.find("[inf-ctrl=extendToRight]");
                    if (borderColorEnabledElm.length > 0) {
                        settingPanel.data("infUndoRedo", true);
                        borderColorEnabledElm.trigger("click");
                    } else {
                        proceed.call(drawingObj, currentExtend ,false);
                    }
                } else {
                    proceed.call(drawingObj, currentExtend ,false);
                }
                drawingObj.onPropertyChange();
            }

            infChart.commandsManager.registerCommand(self.stockChartId, function () {
                undoRedo(extended);
            }, function () {
                undoRedo(currentExtend);
            }, undefined, false, 'onExtendToRight');
        }
        proceed.call(self, extended, isPropertyChange);
    });

    /**
     * Wrapping up the infChart.rectangleDrawing.prototype.onExtendToLeft to catch the color settings change
     */
    infChart.util.wrap(infChart.rectangleDrawing.prototype, 'onExtendToLeft', function (proceed, extended, isPropertyChange) {
        var self = this;
        if (isPropertyChange) {
            var drawingId = self.drawingId;
            var ann = self.annotation;
            var xChartId = _getChartIdFromHighchartInstance(ann.chart);
            var currentExtend = ann.options.isExtendToLeft;

            /**
             * Execute the undo/redo with the new properties
             * @param {boolean} checked - mode chaned
             */
            function undoRedo(currentExtend) {
                var drawingObj = infChart.drawingsManager.getDrawingObject(xChartId, drawingId);
                var settingPanel = drawingObj.settingsPopup;
                if (settingPanel) {
                    var borderColorEnabledElm = settingPanel.find("[inf-ctrl=extendToLeft]");
                    if (borderColorEnabledElm.length > 0) {
                        settingPanel.data("infUndoRedo", true);
                        borderColorEnabledElm.trigger("click");
                    } else {
                        proceed.call(drawingObj, currentExtend ,false);
                    }
                } else {
                    proceed.call(drawingObj, currentExtend ,false);
                }
                drawingObj.onPropertyChange();
            }

            infChart.commandsManager.registerCommand(self.stockChartId, function () {
                undoRedo(extended);
            }, function () {
                undoRedo(currentExtend);
            }, undefined, false, 'onExtendToLeft');
        }
        proceed.call(self, extended, isPropertyChange);
    });

    /**
     * Wrapping up the infChart.drawingUtils.common.settings.onLineColorChange to catch the color settings change
     */
    infChart.util.wrap(infChart.drawingUtils.common.settings, 'onFillColorChange', function (proceed, rgb, color, opacity, isPropertyChange, colorPickerRef) {
        var ann = this.annotation;
        if (_isTrackHistoryEnabledDrawing(ann) && isPropertyChange && !infChart.drawingsManager.getIsActiveDrawingInprogress()) {
            var drawingId = this.drawingId;
            var xChartId = _getChartIdFromHighchartInstance(ann.chart);
            var currentColor = ann.options.shape.params["fill"];
            var currentOpacity = ann.options.shape.params["fill-opacity"];
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
                    var fillColorSelectorElm = settingPanel.find(colorPickerRef || "[inf-ctrl=colorPicker]");
                    if (fillColorSelectorElm.length > 0) {
                        settingPanel.data("infUndoRedo", true);
                        fillColorSelectorElm.mainColorPanel("value", {
                            color: newColor,
                            opacity: newOpacity
                        });
                    } else {
                        proceed.call(drawingObj, rgb, newColor, newOpacity, false, colorPickerRef);
                    }
                } else {
                    proceed.call(drawingObj, rgb, newColor, newOpacity, false, colorPickerRef);
                }
                drawingObj.onPropertyChange();
            }

            if (lastAction && lastAction.actionType === 'onFillColorChange' && !lastAction.freezeUpdatingSame) {
                lastAction.action = function () {
                    undoRedo(color, opacity);
                }
            } else {
                infChart.commandsManager.registerCommand(xChartId, function () {
                    undoRedo(color, opacity);
                }, function () {
                    undoRedo(currentColor, currentOpacity);
                }, undefined, false, 'onFillColorChange');
            }
        }
        proceed.call(this, rgb, color, opacity, isPropertyChange);
    });

    /**
     * Wrapping up the infChart.drawingUtils.common.settings.onFibApplyAllButtonClick to catch apply now to all level button click
     */
    infChart.util.wrap(infChart.drawingUtils.common.settings, 'onFibApplyAllButtonClick', function(proceed, fillColor, fillOpacity, lineColor, lineWidth, fontColor, fontSize, fontWeight, prevOptions, isPropertyChange) {
        var self = this;
        var ann = self.annotation;
        if ((_isTrackHistoryEnabledDrawing(ann) || _isIndicatorDrawing(ann)) && isPropertyChange) {
            var fibLevels = self.annotation.options.fibLevels;
            var xChartId = _getChartIdFromHighchartInstance(ann.chart);
            var currentOptions = prevOptions;

            function undoRedo(isSingleColor, newOptions) {
                fibLevels.forEach(function (fibLevel) {
                    fibLevel.fillColor = isSingleColor ? fillColor : newOptions[fibLevel.id].fillColor;
                    fibLevel.fillOpacity = isSingleColor ? fillOpacity : newOptions[fibLevel.id].fillOpacity;
                    fibLevel.lineColor = isSingleColor ? lineColor : newOptions[fibLevel.id].lineColor;
                    fibLevel.lineWidth = isSingleColor ? lineWidth : newOptions[fibLevel.id].lineWidth;
                    fibLevel.fontColor = isSingleColor ? fontColor : newOptions[fibLevel.id].fontColor;
                    fibLevel.fontSize = isSingleColor ? fontSize : newOptions[fibLevel.id].fontSize;
                    fibLevel.fontWeight = isSingleColor ? fontWeight : newOptions[fibLevel.id].fontWeight;
                });
                self.updateSettings(self.getConfig());
                self.onPropertyChange();
            }

            infChart.commandsManager.registerCommand(xChartId, function () {
                undoRedo(true);
            }, function () {
                undoRedo(false, currentOptions);
            }, undefined, false, 'onFibApplyAllButtonClick');
        }
        proceed.call(this, fillColor, fillOpacity, lineColor, lineWidth, fontColor, fontSize, fontWeight, prevOptions, isPropertyChange);
    });

    /**
     * Wrapping up the infChart.regressionChannelDrawing.prototype.onFillColorChange to catch the color settings change
     */
    infChart.util.wrap(infChart.regressionChannelDrawing.prototype, 'onFillColorChange', function (proceed, rgb, color, opacity, level, isPropertyChange) {
        if (isPropertyChange && !infChart.drawingsManager.getIsActiveDrawingInprogress()) {
            var drawingId = this.drawingId;
            var ann = this.annotation;
            var xChartId = _getChartIdFromHighchartInstance(ann.chart);
            var levelShape = this.additionalDrawings.fill[level];
            var currentColor = levelShape.element.getAttribute("fill");
            var currentOpacity = levelShape.element.getAttribute("fill-opacity");
            var lastAction = infChart.commandsManager.getLastAction(xChartId);
            var colorPickerRef = "[inf-ctrl=fillColorPicker][inf-ctrl-val=" + level + "]";

            /**
             * Execute the undo/redo with the new properties
             * @param {string} newColor color code
             * @param {float} newOpacity opacity
             */
            function undoRedo(newColor, newOpacity) {
                var drawingObj = infChart.drawingsManager.getDrawingObject(xChartId, drawingId);
                var settingPanel = drawingObj.settingsPopup;
                if (settingPanel) {
                    var fillColorSelectorElm = settingPanel.find(colorPickerRef);
                    if (fillColorSelectorElm.length > 0) {
                        settingPanel.data("infUndoRedo", true);
                        fillColorSelectorElm.mainColorPanel("value", {color: newColor, opacity: newOpacity});
                    } else {
                        proceed.call(drawingObj, rgb, newColor, newOpacity, level, false, colorPickerRef);
                    }
                } else {
                    proceed.call(drawingObj, rgb, newColor, newOpacity, level, false, colorPickerRef);
                }
                drawingObj.onPropertyChange();
            }

            if (lastAction && lastAction.actionType === 'onFillColorChange_regressionChannel' && !lastAction.freezeUpdatingSame) {
                lastAction.action = function () {
                    undoRedo(color, opacity);
                }
            } else {
                infChart.commandsManager.registerCommand(xChartId, function () {
                    undoRedo(color, opacity);
                }, function () {
                    undoRedo(currentColor, currentOpacity);
                }, undefined, false, 'onFillColorChange_regressionChannel');
            }
        }
        proceed.call(this, rgb, color, opacity, level, isPropertyChange);
    });

    /**
     * Wrapping up the infChart.andrewsPitchforkDrawing.prototype.onLineColorChange to catch the color settings change
     */
    infChart.util.wrap(infChart.andrewsPitchforkDrawing.prototype, 'onLineColorChange', function (proceed, rgb, color, isPropertyChange, colorPickerRef) {
        if (isPropertyChange && !infChart.drawingsManager.getIsActiveDrawingInprogress()) {
            var drawingId = this.drawingId;
            var ann = this.annotation;
            var xChartId = _getChartIdFromHighchartInstance(ann.chart);
            var currentColor = ann.options.shape.params["stroke"];
            var lastAction = infChart.commandsManager.getLastAction(xChartId);

            /**
             * Execute the undo/redo with the new properties
             * @param {string} newColor color code
             */
            function undoRedo(newColor) {
                var drawingObj = infChart.drawingsManager.getDrawingObject(xChartId, drawingId);
                var settingPanel = drawingObj.settingsPopup;
                if (settingPanel) {
                    var lineColorSelectorElm = settingPanel.find(colorPickerRef || "[inf-ctrl=lineColorPicker]");
                    if (lineColorSelectorElm.length > 0) {
                        settingPanel.data("infUndoRedo", true);
                        lineColorSelectorElm.mainColorPanel("value", {color: newColor})
                    } else {
                        proceed.call(drawingObj, rgb, newColor, false, colorPickerRef);
                    }
                } else {
                    proceed.call(drawingObj, rgb, newColor, false, colorPickerRef);
                }
                drawingObj.onPropertyChange();
            }

            if (lastAction && lastAction.actionType === 'onLineColorChange_andrewsPitchfork' && !lastAction.freezeUpdatingSame) {
                lastAction.action = function () {
                    undoRedo(color);
                }
            } else {
                infChart.commandsManager.registerCommand(xChartId, function () {
                    undoRedo(color);
                }, function () {
                    undoRedo(currentColor);
                }, undefined, false, 'onLineColorChange_andrewsPitchfork');
            }
        }
        proceed.call(this, rgb, color, isPropertyChange);
    });

    /**
     * Wrapping up the infChart.andrewsPitchforkDrawing.prototype.onFillColorChange to catch the color settings change
     */
    infChart.util.wrap(infChart.andrewsPitchforkDrawing.prototype, 'onFillColorChange', function (proceed, rgb, color, opacity, isPropertyChange) {
        if (isPropertyChange && !infChart.drawingsManager.getIsActiveDrawingInprogress()) {
            var drawingId = this.drawingId;
            var ann = this.annotation;
            var xChartId = _getChartIdFromHighchartInstance(ann.chart);
            var currentColor = ann.options.shape.params["fill"];
            var currentOpacity = ann.options.shape.params["fill-opacity"];
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
                    var fillColorSelectorElm = settingPanel.find("[inf-ctrl=fillColorPicker]");
                    if (fillColorSelectorElm.length > 0) {
                        settingPanel.data("infUndoRedo", true);
                        fillColorSelectorElm.mainColorPanel("value", {
                            color: newColor,
                            opacity: newOpacity
                        })
                    } else {
                        proceed.call(drawingObj, rgb, newColor, newOpacity, false);
                    }
                } else {
                    proceed.call(drawingObj, rgb, newColor, newOpacity, false);
                }
                drawingObj.onPropertyChange();
            }

            if (lastAction && lastAction.actionType === 'onFillColorChange_andrewsPitchfork' && !lastAction.freezeUpdatingSame) {
                lastAction.action = function () {
                    undoRedo(color, opacity);
                }
            } else {
                infChart.commandsManager.registerCommand(xChartId, function () {
                    undoRedo(color, opacity);
                }, function () {
                    undoRedo(currentColor, currentOpacity);
                }, undefined, false, 'onFillColorChange_andrewsPitchfork');
            }
        }
        proceed.call(this, rgb, color, opacity, isPropertyChange);
    });

    /**
     * Wrapping up the infChart.andrewsPitchforkDrawing.prototype.onLineWidthChange to catch the line width changes
     */
    infChart.util.wrap(infChart.andrewsPitchforkDrawing.prototype, 'onLineWidthChange', function (proceed, strokeWidth, isPropertyChange) {
        if (isPropertyChange) {
            var drawingId = this.drawingId;
            var ann = this.annotation;
            var xChartId = _getChartIdFromHighchartInstance(ann.chart);
            var currentWidth = ann.options.shape.params["stroke-width"];

            /**
             * Execute the undo/redo with the new properties
             * @param {number} newSize width to set
             */
            function undoRedo(newSize) {
                var drawingObj = infChart.drawingsManager.getDrawingObject(xChartId, drawingId);
                var settingPanel = drawingObj.settingsPopup;
                if (settingPanel) {
                    var lineWidthSelectorElm = settingPanel.find("[inf-ctrl=lineWidth][inf-size=" + newSize + "]");
                    if (lineWidthSelectorElm.length > 0) {
                        settingPanel.data("infUndoRedo", true);
                        lineWidthSelectorElm.trigger('click');
                    } else {
                        proceed.call(drawingObj, newSize);
                    }
                } else {
                    proceed.call(drawingObj, newSize);
                }
                drawingObj.onPropertyChange();
            }

            infChart.commandsManager.registerCommand(xChartId, function () {
                undoRedo(strokeWidth);
            }, function () {
                undoRedo(currentWidth);
            }, undefined, false, 'onLineWidthChange_andrewsPitchfork');
        }
        proceed.call(this, strokeWidth, isPropertyChange);
    });

    /**
     * Wrapping up all fib level changes in andrews Pitchfork Drawing
     */
    infChart.util.wrap(infChart.andrewsPitchforkDrawing.prototype, 'applyAllToFibLines', function (proceed, enabled, fillColor, fillOpacity, lineColor, lineWidth, prevOptions, isPropertyChange) {
        if (isPropertyChange) {
            let self = this;
            let drawingId = self.drawingId;
            let chartId = self.stockChartId;
            let fibLevels = self.annotation.options.fibLevels;
            let currentVisibility = !enabled;
            let currentFibOption = [];

            let currentFillColor = self.annotation.options.fillColor;
            let currentFillOpacity = self.annotation.options.fillOpacity;
            let currentLineColor = self.annotation.options.lineColor;
            let currentLineWidth = self.annotation.options.lineWidth;

            fibLevels.forEach(function (fibLevel) {
                if (typeof fibLevel === 'object' && fibLevel.hasOwnProperty('id')) {
                    var fibId = fibLevel.id;
                    currentFibOption.push({
                        id: fibId,
                        fillColor: fibLevel.fillColor,
                        fillOpacity: fibLevel.fillOpacity,
                        lineColor: fibLevel.lineColor,
                        lineWidth: fibLevel.lineWidth,
                        fontColor: fibLevel.fontColor,
                        fontSize: fibLevel.fontSize,
                        fontWeight: fibLevel.fontWeight
                    });
                }
            });

            function undoRedo(isSingleOptionEnabled, newFillColor, newFillOpacity, newLineColor, newLineWidth, newPrevOptions) {
                var drawingObj = infChart.drawingsManager.getDrawingObject(chartId, drawingId);
                if (isSingleOptionEnabled) {
                    proceed.call(drawingObj, isSingleOptionEnabled, newFillColor, newFillOpacity, newLineColor, newLineWidth, newPrevOptions, false);
                } else {
                    proceed.call(drawingObj, isSingleOptionEnabled, newFillColor, newFillOpacity, newLineColor, newLineWidth, newPrevOptions, false);
                }
                var settingPanel = drawingObj.settingsPopup;
                if (settingPanel) {
                    settingPanel.data("infUndoRedo", true);
                    drawingObj.updateSettings(drawingObj.getConfig());
                }
                drawingObj.onPropertyChange();
            }

            infChart.commandsManager.registerCommand(chartId, function () {
                undoRedo(enabled, fillColor, fillOpacity, lineColor, lineWidth, prevOptions);
            }, function () {
                undoRedo(currentVisibility, currentFillColor, currentFillOpacity, currentLineColor, currentLineWidth, currentFibOption);
            }, undefined, false, 'applyAllToFibLines');

        }
        proceed.call(this, enabled, fillColor, fillOpacity, lineColor, lineWidth, prevOptions, isPropertyChange);
    });

    /**
     * Wrapping up fib level changes in andrews Pitchfork Drawing
     */
    infChart.util.wrap(infChart.andrewsPitchforkDrawing.prototype, 'onChangeFibLines', function (proceed, fibLevel, property, propertyValue, isPropertyChange) {
        if (isPropertyChange) {
            var drawingId = this.drawingId;
            var xChartId = this.stockChartId;
            var lastAction = infChart.commandsManager.getLastAction(xChartId);
            var currentValue = property === 'fillColor' ? { fill: fibLevel['fillColor'], opacity: fibLevel['fillOpacity'] } : fibLevel[property];

            /**
             * Execute the undo/redo with the new properties
             * @param {string} property update property name
             * @param {*} propertyValue value of updated property
             */
            function undoRedo(fibLevel, property, propertyValue) {
                var drawingObj = infChart.drawingsManager.getDrawingObject(xChartId, drawingId);
                proceed.call(drawingObj, fibLevel, property, propertyValue, false);
                var settingPanel = drawingObj.settingsPopup;
                if (settingPanel) {
                    drawingObj.updateSettings(drawingObj.getConfig());
                }
                drawingObj.onPropertyChange();
            }

            if (lastAction && lastAction.actionType === 'changeAllFibLines' && !lastAction.freezeUpdatingSame) {
                lastAction.action = function () {
                    undoRedo(fibLevel, property, currentValue);
                }
            } else {
                infChart.commandsManager.registerCommand(xChartId, function () {
                    undoRedo(fibLevel, property, propertyValue);
                }, function () {
                    undoRedo(fibLevel, property, currentValue);
                }, undefined, false, 'changeAllFibLines');
            }
        }
        proceed.call(this, fibLevel, property, propertyValue, isPropertyChange);
    });

    infChart.util.wrap(infChart.drawingUtils.common.settings, 'onPriceLineStyleChange', function (proceed, type, lineStyle, isPropertyChange) {
        if (isPropertyChange) {
            var drawingId = this.drawingId;
            var ann = this.annotation;
            var options= ann.options;
            var xChartId = _getChartIdFromHighchartInstance(ann.chart);
            var isStopLoss = (type === 'sl1' || type === 'sl2' || type === 'sl3');
            var additionalDrawingList = isStopLoss ? options.stopLoss : options.takeProfit;
            var level = additionalDrawingList.find(function (level) {
                if (level.id === type) {
                    return level;
                }
            });

            var currentLineStyle = level.lineStyle;
            var currentType = type;

            /**
             * Execute the undo/redo with the new properties
             * @param {boolean|undefined} newVisibility indicate the visibility of the level
             */
            function undoRedo(type, lineStyle) {
                var drawingObj = infChart.drawingsManager.getDrawingObject(xChartId, drawingId);
                var settingPanel = drawingObj.settingsPopup;
                if (settingPanel) {
                    var LevelElm = settingPanel.find("[inf-ctrl=priceLineLevelSelectedLineStyle][inf-ctrl-val='" + type + "']");
                    if (LevelElm.length > 0) {
                        settingPanel.data("infUndoRedo", true);
                        var dropDownItem = LevelElm.parent().parent();
                        $(dropDownItem).find("li[inf-ctrl=lineStyle][inf-style='" + lineStyle + "']").trigger("click");
                    } else {
                        proceed.call(drawingObj, type, lineStyle, false);
                    }
                } else {
                    proceed.call(drawingObj, type, lineStyle, false);
                }
                drawingObj.onPropertyChange();
            }

            infChart.commandsManager.registerCommand(xChartId, function () {
                undoRedo(type, lineStyle);
            }, function () {
                undoRedo(currentType, currentLineStyle);
            }, undefined, false, 'onPriceLineStyleChange');
        }
        proceed.call(this, type, lineStyle, isPropertyChange);
    });

    infChart.util.wrap(infChart.drawingUtils.common.settings, 'onPriceLineWidthChange', function (proceed, type, strokeWidth, isPropertyChange) {
        if (isPropertyChange) {
            var drawingId = this.drawingId;
            var ann = this.annotation;
            var options= ann.options;
            var xChartId = _getChartIdFromHighchartInstance(ann.chart);
            var isStopLoss = (type === 'sl1' || type === 'sl2' || type === 'sl3');
            var priceline;
        
            var additionalDrawingList = isStopLoss ? options.stopLoss : options.takeProfit;
            var level = additionalDrawingList.find(function (level) {
                if (level.id === type) {
                    return level;
                }
            });
            
            if (isStopLoss) {
                priceline = this.additionalDrawings.slPriceLines[level.id];
            } else {
                priceline = this.additionalDrawings.tpPriceLines[level.id];
            }

            var currentLineWidth = priceline.attr('stroke-width');
            var currentType = type;

            /**
             * Execute the undo/redo with the new properties
             * @param {boolean|undefined} newVisibility indicate the visibility of the level
             */
            function undoRedo(type, strokeWidth) {
                var drawingObj = infChart.drawingsManager.getDrawingObject(xChartId, drawingId);
                var settingPanel = drawingObj.settingsPopup;
                if (settingPanel) {
                    var LevelElm = settingPanel.find("[inf-ctrl=priceLineLevelSelectedLineWidth][inf-ctrl-val='" + type + "']");
                    if (LevelElm.length > 0) {
                        settingPanel.data("infUndoRedo", true);
                        var dropDownItem = LevelElm.parent().parent();
                        $(dropDownItem).find("li[inf-ctrl=lineWidth][inf-size='" + strokeWidth + "']").trigger("click");
                    } else {
                        proceed.call(drawingObj, type, strokeWidth, false);
                    }
                } else {
                    proceed.call(drawingObj, type, strokeWidth, false);
                }
                drawingObj.onPropertyChange();
            }

            infChart.commandsManager.registerCommand(xChartId, function () {
                undoRedo(type, strokeWidth);
            }, function () {
                undoRedo(currentType, currentLineWidth);
            }, undefined, false, 'onPriceLineStyleChange');
        }
        proceed.call(this, type, strokeWidth, isPropertyChange);
    });

    infChart.util.wrap(infChart.drawingUtils.common.settings, 'onEntryValueChange', function (proceed, element, value, isPropertyChange) {
        if (isPropertyChange) {
            var drawingId = this.drawingId;
            var ann = this.annotation;
            var options= ann.options;
            var xChartId = _getChartIdFromHighchartInstance(ann.chart);
            var currentValue = options.yValue;

            /**
             * Execute the undo/redo with the new properties
             * @param {boolean|undefined} newVisibility indicate the visibility of the level
             */
            function undoRedo(element, value) {
                var drawingObj = infChart.drawingsManager.getDrawingObject(xChartId, drawingId);
                    proceed.call(drawingObj, element, value, false);
                drawingObj.onPropertyChange();
            }

            infChart.commandsManager.registerCommand(xChartId, function () {
                undoRedo(element, value);
            }, function () {
                undoRedo(element, currentValue);
            }, undefined, false, 'onEntryValueChange');
        }
        proceed.call(this, element, value, isPropertyChange);
    });

    infChart.util.wrap(infChart.drawingUtils.common.settings, 'onPriceValueChange', function (proceed, element, priceValue, type, isPropertyChange) {
        if (isPropertyChange) {
            var drawingId = this.drawingId;
            var ann = this.annotation;
            var options= ann.options;
            var xChartId = _getChartIdFromHighchartInstance(ann.chart);
            var isStopLoss = (type === 'sl1' || type === 'sl2' || type === 'sl3');
            var additionalDrawingList = isStopLoss ? options.stopLoss : options.takeProfit;
            var level = additionalDrawingList.find(function (level) {
                if (level.id === type) {
                    return level;
                }
            });

            var currentValue = level.yValue;

            /**
             * Execute the undo/redo with the new properties
             * @param {boolean|undefined} newVisibility indicate the visibility of the level
             */
            function undoRedo(element, priceValue, type) {
                var drawingObj = infChart.drawingsManager.getDrawingObject(xChartId, drawingId);
                    proceed.call(drawingObj, element, priceValue, type, false);
                drawingObj.onPropertyChange();
            }

            infChart.commandsManager.registerCommand(xChartId, function () {
                undoRedo(element, priceValue, type);
            }, function () {
                undoRedo(element, currentValue, type);
            }, undefined, false, 'onPriceValueChange');
        }
        proceed.call(this, element, priceValue, type, isPropertyChange);
    });


    infChart.util.wrap(infChart.drawingUtils.common.settings, 'onApplyLine', function (proceed, checked, lineType, isPropertyChange) {

        if (isPropertyChange && !infChart.drawingsManager.getIsActiveDrawingInprogress()) {
            var drawingId = this.drawingId;
            var ann = this.annotation;
            var xChartId = _getChartIdFromHighchartInstance(ann.chart);
            var lastAction = infChart.commandsManager.getLastAction(xChartId);
            var currentCheck = !checked;

            /**
             * Execute the undo/redo with the new properties
             * @param {string} newColor new color to set
             */
            function undoRedo(checked, lineType) {
                var drawingObj = infChart.drawingsManager.getDrawingObject(xChartId, drawingId);
                var settingPanel = drawingObj.settingsPopup;
                if (settingPanel) {
                    var levelEnabledElm = settingPanel.find("[inf-ctrl=applyPriceLine][inf-value=" + lineType + "]");
                    if (levelEnabledElm.length > 0) {
                        settingPanel.data("infUndoRedo", true);
                        levelEnabledElm.trigger("click");
                    } else {
                        proceed.call(drawingObj, checked, lineType, false);
                    }
                } else {
                    proceed.call(drawingObj, checked, lineType, false);
                }
                drawingObj.onPropertyChange();
            }

            if (lastAction && lastAction.actionType === 'onApplyLine' && !lastAction.freezeUpdatingSame) {
                lastAction.action = function () {
                    undoRedo(checked, lineType);
                }
            } else {
                infChart.commandsManager.registerCommand(xChartId, function () {
                    undoRedo(checked, lineType);
                }, function () {
                    undoRedo(currentCheck, lineType);
                }, undefined, false, 'onApplyLine');
            }
        }

        proceed.call(this, checked, lineType, isPropertyChange);
    });

    //region----------------------Fibonacci settings--------------------------------------------------------------------

    /**
     * Wrapping up the infChart.drawingUtils.common.settings.onFibLevelChange to catch the level changes
     */
    infChart.util.wrap(infChart.drawingUtils.common.settings, 'onFibLevelChange', function (proceed, currentLevel, checked, isPropertyChange, ignoreSettingsSave) {
        if (isPropertyChange) {
            var drawingId = this.drawingId;
            var ann = this.annotation;
            var xChartId = _getChartIdFromHighchartInstance(ann.chart);
            var currentVisibility = !checked;

            /**
             * Execute the undo/redo with the new properties
             * @param {boolean|undefined} newVisibility indicate the visibility of the level
             */
            function undoRedo(newVisibility) {
                var drawingObj = infChart.drawingsManager.getDrawingObject(xChartId, drawingId);
                var settingPanel = drawingObj.settingsPopup;
                if (settingPanel) {
                    var fibLevelElm = settingPanel.find("[inf-ctrl=fibLevel][data-value='" + currentLevel + "']");
                    if (fibLevelElm.length > 0) {
                        settingPanel.data("infUndoRedo", true);
                        fibLevelElm.trigger('click');
                    } else {
                        proceed.call(drawingObj, currentLevel, newVisibility);
                    }
                } else {
                    proceed.call(drawingObj, currentLevel, newVisibility);
                }
                drawingObj.onPropertyChange();
            }

            infChart.commandsManager.registerCommand(xChartId, function () {
                undoRedo(checked);
            }, function () {
                undoRedo(currentVisibility);
            }, undefined, false, 'onFibLevelChange');
        }
        proceed.call(this, currentLevel, checked, isPropertyChange, ignoreSettingsSave);
    });

    /**
     * Wrapping up the infChart.fibArcsDrawing.prototype.onFibArcsLevelChange to catch the level changes
     */
    infChart.util.wrap(infChart.fibArcsDrawing.prototype, 'onFibArcsLevelChange', function (proceed, currentLevel, checked, isPropertyChange, ignoreSettingsSave) {
        if (isPropertyChange) {
            var drawingId = this.drawingId;
            var ann = this.annotation;
            var xChartId = _getChartIdFromHighchartInstance(ann.chart);
            var currentVisibility = !checked;

            /**
             * Execute the undo/redo with the new properties
             * @param {boolean|undefined} newVisibility indicate the visibility of level
             */
            function undoRedo(newVisibility) {
                var drawingObj = infChart.drawingsManager.getDrawingObject(xChartId, drawingId);
                var settingPanel = drawingObj.settingsPopup;
                if (settingPanel) {
                    var fibLevelElm = settingPanel.find("[inf-ctrl=fibLevel][data-value='" + currentLevel + "']");
                    if (fibLevelElm.length > 0) {
                        settingPanel.data("infUndoRedo", true);
                        fibLevelElm.trigger('click');
                    } else {
                        proceed.call(drawingObj, currentLevel, newVisibility);
                    }
                } else {
                    proceed.call(drawingObj, currentLevel, newVisibility);
                }
                drawingObj.onPropertyChange();
            }

            infChart.commandsManager.registerCommand(xChartId, function () {
                undoRedo(checked);
            }, function () {
                undoRedo(currentVisibility);
            }, undefined, false, 'onFibArcsLevelChange');
        }
        proceed.call(this, currentLevel, checked, isPropertyChange, ignoreSettingsSave);
    });

    /**
     * Wrapping up the infChart.fibFansDrawing.prototype.onFibFansLevelChange to catch the level  changes
     */
    infChart.util.wrap(infChart.fibFansDrawing.prototype, 'onFibFansLevelChange', function (proceed, currentLevel, checked, isPropertyChange, ignoreSettingsSave) {
        if (isPropertyChange) {
            var drawingId = this.drawingId;
            var ann = this.annotation;
            var xChartId = _getChartIdFromHighchartInstance(ann.chart);
            var currentVisibility = !checked;

            /**
             * Execute the undo/redo with the new properties
             * @param {boolean|undefined} newVisibility indicate the visibility of level
             */
            function undoRedo(newVisibility) {
                var drawingObj = infChart.drawingsManager.getDrawingObject(xChartId, drawingId);
                var settingPanel = drawingObj.settingsPopup;
                if (settingPanel) {
                    var fibLevelElm = settingPanel.find("[inf-ctrl=fibLevel][data-value='" + currentLevel + "']");
                    if (fibLevelElm.length > 0) {
                        settingPanel.data("infUndoRedo", true);
                        fibLevelElm.trigger('click');
                    } else {
                        proceed.call(drawingObj, currentLevel, newVisibility);
                    }
                } else {
                    proceed.call(drawingObj, currentLevel, newVisibility);
                }
                drawingObj.onPropertyChange();
            }

            infChart.commandsManager.registerCommand(xChartId, function () {
                undoRedo(checked);
            }, function () {
                undoRedo(currentVisibility);
            }, undefined, false, 'onFibFansLevelChange');
        }
        proceed.call(this, currentLevel, checked, isPropertyChange, ignoreSettingsSave);
    });

    /**
     * Wrapping up the infChart.drawingUtils.common.settings.onFibLineColorChange to catch the color settings change
     */
    infChart.util.wrap(infChart.drawingUtils.common.settings, 'onFibFillColorChange', function (proceed, rgb, color, opacity, fibLevel, isAll, isPropertyChange) {
        if (isPropertyChange && !infChart.drawingsManager.getIsActiveDrawingInprogress()) {
            var drawingId = this.drawingId;
            var ann = this.annotation;
            var xChartId = _getChartIdFromHighchartInstance(ann.chart);
            var fibonacciDrawingsFill = this.fibonacciDrawings.fill[fibLevel.id];
            var currentColor = fibonacciDrawingsFill.element.getAttribute("fill");
            var currentOpacity = fibonacciDrawingsFill.element.getAttribute("fill-opacity");
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
                    var fibColorChangeElm = settingPanel.find("[inf-ctrl=fibLevelFillColorPicker][inf-ctrl-val='" + fibLevel.id + "']");
                    if (fibColorChangeElm.length > 0) {
                        settingPanel.data("infUndoRedo", true);
                        fibColorChangeElm.mainColorPanel("value", {
                            color: newColor,
                            opacity: newOpacity
                        });
                    } else {
                        proceed.call(drawingObj, rgb, newColor, newOpacity, fibLevel, isAll, false);
                    }
                } else {
                    proceed.call(drawingObj, rgb, newColor, newOpacity, fibLevel, isAll, false);
                }
                drawingObj.onPropertyChange();
            }

            if (lastAction && lastAction.actionType === 'onFibFillColorChange' && !lastAction.freezeUpdatingSame) {
                lastAction.action = function () {
                    undoRedo(color, opacity);
                }
            } else {
                infChart.commandsManager.registerCommand(xChartId, function () {
                    undoRedo(color, opacity);
                }, function () {
                    undoRedo(currentColor, currentOpacity);
                }, undefined, false, 'onFibFillColorChange');
            }
        }
        proceed.call(this, rgb, color, opacity, fibLevel, isAll, isPropertyChange);
    });

    /**
     * Wrapping up the infChart.drawingUtils.common.settings.onFibLevelLineColorChange to catch the color settings change
     */
    infChart.util.wrap(infChart.drawingUtils.common.settings, 'onFibLevelLineColorChange', function (proceed, rgb, color, fibLevelId, isAll, isPropertyChange) {
        if (isPropertyChange && !infChart.drawingsManager.getIsActiveDrawingInprogress()) {
            var self = this;
            var ann = self.annotation;
            var fibonacciDrawingsLines = self.additionalDrawings.lines[fibLevelId];
            var currentLineColor = fibonacciDrawingsLines.element.getAttribute("stroke");
            var lastAction = infChart.commandsManager.getLastAction(self.stockChartId);

            /**
             * Execute the undo/redo with the new properties
             * @param {string} newColor color code
             */
            function undoRedo(newColor) {
                var settingPanel = self.settingsPopup;
                if (settingPanel) {
                    var fibLineColorChangeElm = settingPanel.find("[inf-ctrl=fibLevelLineColorPicker][inf-ctrl-val='" + fibLevelId + "']");
                    if (fibLineColorChangeElm.length > 0) {
                        settingPanel.data("infUndoRedo", true);
                        fibLineColorChangeElm.mainColorPanel("value", {
                            color: newColor
                        });
                    } else {
                        proceed.call(self, rgb, newColor, fibLevelId, isAll, false);
                    }
                } else {
                    proceed.call(self, rgb, newColor, fibLevelId, isAll, false);
                }
                self.onPropertyChange();
            }

            if (lastAction && lastAction.actionType === 'onFibLevelLineColorChange' && !lastAction.freezeUpdatingSame) {
                lastAction.action = function () {
                    undoRedo(color);
                }
            } else {
                infChart.commandsManager.registerCommand(self.stockChartId, function () {
                    undoRedo(color);
                }, function () {
                    undoRedo(currentLineColor);
                }, undefined, false, 'onFibLevelLineColorChange');
            }
        }
        proceed.call(this, rgb, color, fibLevelId, isAll, isPropertyChange);
    });

    infChart.util.wrap(infChart.drawingUtils.common.settings, 'onFibLevelFontColorChange', function (proceed, rgb, color, fibLevel, isAll, isPropertyChange) {
        if (isPropertyChange && !infChart.drawingsManager.getIsActiveDrawingInprogress()) {
            var self = this;
            var ann = self.annotation;
            var fibLevelId = fibLevel && fibLevel.id;
            var fibonacciDrawingsLabel = self.fibonacciDrawings.lines[fibLevelId];
            var currentFontColor = fibonacciDrawingsLabel.element.getAttribute("font-color");
            var lastAction = infChart.commandsManager.getLastAction(self.stockChartId);

            /**
             * Execute the undo/redo with the new properties
             * @param {string} newColor color code
             */
             function undoRedo(newColor) {
                var settingPanel = self.settingsPopup;
                if (settingPanel) {
                    var fibFontColorChangeElm = settingPanel.find("[inf-ctrl=fibLevelFontColorPicker][inf-ctrl-val='" + fibLevelId + "']");
                    if (fibFontColorChangeElm.length > 0) {
                        settingPanel.data("infUndoRedo", true);
                        fibFontColorChangeElm.mainColorPanel("value", {
                            color: newColor
                        });
                    } else {
                        proceed.call(self, rgb, newColor, fibLevel, isAll, false);
                    }
                } else {
                    proceed.call(self, rgb, newColor, fibLevel, isAll, false);
                }
                self.onPropertyChange();
            }

            if (lastAction && lastAction.actionType === 'onFibLevelFontColorChange' && !lastAction.freezeUpdatingSame) {
                lastAction.action = function () {
                    undoRedo(color);
                }
            } else {
                infChart.commandsManager.registerCommand(self.stockChartId, function () {
                    undoRedo(color);
                }, function () {
                    undoRedo(currentFontColor);
                }, undefined, false, 'onFibLevelFontColorChange');
            }
        }
        proceed.call(this, rgb, color, fibLevel, isAll, isPropertyChange);
    });

    /**
    * Wrapping up the infChart.drawingUtils.common.settings.onFibSingleFontSizeChange to catch the all fib level font size change
    */
    infChart.util.wrap(infChart.drawingUtils.common.settings, 'onFibSingleFontSizeChange', function (proceed, fontSize, isSingleColor, fibLevelFontSizes, isPropertyChange) {
        if (isPropertyChange) {
            var self = this;
            var ann = self.annotation;
            var currentType = ann.options.isSingleColor;
            var currentFontSize = ann.options.fontSize;

            /**
             * Execute the undo/redo with the new properties
             * @param {number} newSize new font size to set
             */
            function undoRedo(newSize, isSingleColor) {
                var settingPanel = self.settingsPopup;

                if (settingPanel) {
                    var fibFontSizeChangeDropdownElm = $(settingPanel.find("span[inf-ctrl=singleSelectedFontSize][inf-ctrl-val=P_all]"));
                    if (fibFontSizeChangeDropdownElm.length > 0) {
                        settingPanel.data("infUndoRedo", true);
                        var dropDownItem = fibFontSizeChangeDropdownElm.parent().parent();
                        $(dropDownItem).find("li[inf-ctrl=fontSize][inf-size='" + newSize + "']").trigger("click");
                    } else {
                        proceed.call(self, newSize, isSingleColor, fibLevelFontSizes, false);
                    }
                } else {
                    proceed.call(self, newSize, isSingleColor, fibLevelFontSizes, false);
                }
                self.onPropertyChange();
            }

            infChart.commandsManager.registerCommand(self.stockChartId, function () {
                undoRedo(fontSize, isSingleColor);
            }, function () {
                undoRedo(currentFontSize, currentType);
            }, undefined, false, 'onFibSingleFontSizeChange');
        }
        proceed.call(this, fontSize, isSingleColor, fibLevelFontSizes, isPropertyChange);
    });

    /**
    * Wrapping up the infChart.drawingUtils.common.settings.onFibSingleLineWidthChange to catch the all fib level line width change
    */
    infChart.util.wrap(infChart.drawingUtils.common.settings, 'onFibSingleLineWidthChange', function (proceed, strokeWidth, isSingleColor, fibLevelWidths, isPropertyChange) {
        if (isPropertyChange) {
            var self = this;
            var ann = self.annotation;
            var currentType = ann.options.isSingleColor;
            var currentLineWidth = ann.options.lineWidth;

            /**
             * Execute the undo/redo with the new properties
             * @param {number} newSize new width to set
             */
            function undoRedo(newSize, isSingleColor) {
                var settingPanel = self.settingsPopup;
                if (settingPanel) {
                    var fibLineWidthChangeDropdownElm = $(settingPanel.find("span[inf-ctrl=singleSelectedLineWidth][inf-ctrl-val=P_all]"));
                    if (fibLineWidthChangeDropdownElm.length > 0) {
                        settingPanel.data("infUndoRedo", true);
                        var dropDownItem = fibLineWidthChangeDropdownElm.parent().parent();
                        $(dropDownItem).find("li[inf-ctrl=lineWidth][inf-size='" + newSize + "']").trigger("click");
                    } else {
                        proceed.call(self, newSize, isSingleColor, fibLevelWidths, false);
                    }
                } else {
                    proceed.call(self, newSize, isSingleColor, fibLevelWidths, false);
                }
                self.onPropertyChange();
            }

            infChart.commandsManager.registerCommand(self.stockChartId, function () {
                undoRedo(strokeWidth, isSingleColor);
            }, function () {
                undoRedo(currentLineWidth, currentType);
            }, undefined, false, 'onFibSingleLineWidthChange');
        }
        proceed.call(this, strokeWidth, isSingleColor, fibLevelWidths, isPropertyChange);
    });

    /**
    * Wrapping up the infChart.drawingUtils.common.settings.onFibSingleFontColorChange to catch the all fib level font color change
    */
    infChart.util.wrap(infChart.drawingUtils.common.settings, 'onFibSingleFontColorChange', function (proceed, rgb, value, isSingleColor, fibLevelFontColors, isPropertyChange) {
        if (isPropertyChange && !infChart.drawingsManager.getIsActiveDrawingInprogress()) {
            var self = this;
            var ann = self.annotation;
            var currentType = ann.options.isSingleColor;
            var currentFontColor = ann.options.fontColor;
            var lastAction = infChart.commandsManager.getLastAction(self.stockChartId);

            /**
             * Execute the undo/redo with the new properties
             * @param {number} newColor new color to set
             */
            function undoRedo(rgb, newColor, isSingleColor) {
                var settingPanel = self.settingsPopup;
                if (settingPanel) {
                    var fibFontColorChangeElm = settingPanel.find("[inf-ctrl=singleFontColorPicker][inf-ctrl-val=P_all]");
                    if (fibFontColorChangeElm.length > 0) {
                        settingPanel.data("infUndoRedo", true);
                        fibFontColorChangeElm.mainColorPanel("value", {
                            color: newColor
                        });
                    } else {
                        proceed.call(self, rgb, newColor, isSingleColor, fibLevelFontColors, false);
                    }
                } else {
                    proceed.call(self, rgb, newColor, isSingleColor, fibLevelFontColors, false);
                }
                self.onPropertyChange();
            }
            if (lastAction && lastAction.actionType === 'onFibSingleFontColorChange' && !lastAction.freezeUpdatingSame) {
                lastAction.action = function () {
                    undoRedo(rgb, value, isSingleColor);
                }
            } else {
                infChart.commandsManager.registerCommand(self.stockChartId, function () {
                    undoRedo(rgb, value, isSingleColor);
                }, function () {
                    undoRedo(rgb, currentFontColor, currentType);
                }, undefined, false, 'onFibSingleFontColorChange');
            }
        }
        proceed.call(this, rgb, value, isSingleColor, fibLevelFontColors, isPropertyChange);
    });

    /**
    * Wrapping up the infChart.drawingUtils.common.settings.onFibSingleLineColorChange to catch the all fib level line color change
    */
    infChart.util.wrap(infChart.drawingUtils.common.settings, 'onFibSingleLineColorChange', function (proceed, rgb, value, isSingleColor, fibLevelLineColors, isPropertyChange) {
        if (isPropertyChange && !infChart.drawingsManager.getIsActiveDrawingInprogress()) {
            var self = this;
            var ann = self.annotation;
            var currentLineColor = ann.options.lineColor;
            var currentType = ann.options.isSingleColor;
            var lastAction = infChart.commandsManager.getLastAction(self.stockChartId);

            /**
             * Execute the undo/redo with the new properties
             * @param {string} newColor color code
             */
            function undoRedo(rgb, newColor, isSingleColor) {
                var settingPanel = self.settingsPopup;
                if (settingPanel) {
                    var fibLineColorChangeElm = settingPanel.find("[inf-ctrl=singleLineColorPicker][inf-ctrl-val=P_all]");
                    if (fibLineColorChangeElm.length > 0) {
                        settingPanel.data("infUndoRedo", true);
                        fibLineColorChangeElm.mainColorPanel("value", {
                            color: newColor
                        });
                    } else {
                        proceed.call(self, rgb, newColor, isSingleColor, fibLevelLineColors, false);
                    }
                } else {
                    proceed.call(self, rgb, newColor, isSingleColor, fibLevelLineColors, false);
                }
                self.onPropertyChange();
            }

            if (lastAction && lastAction.actionType === 'onFibSingleLineColorChange' && !lastAction.freezeUpdatingSame) {
                lastAction.action = function () {
                    undoRedo(rgb, value, isSingleColor);
                }
            } else {
                infChart.commandsManager.registerCommand(self.stockChartId, function () {
                    undoRedo(rgb, value, isSingleColor);
                }, function () {
                    undoRedo(rgb, currentLineColor, currentType);
                }, undefined, false, 'onFibSingleLineColorChange');
            }
        }
        proceed.call(this, rgb, value, isSingleColor, fibLevelLineColors, isPropertyChange);
    });

    /**
    * Wrapping up the infChart.drawingUtils.common.settings.onFibSingleFontWeightChange to catch the all fib level font weight change
    */
    infChart.util.wrap(infChart.drawingUtils.common.settings, 'onFibSingleFontWeightChange', function (proceed, value, isSingleColor, fibLevelOptions, isPropertyChange) {
        if (isPropertyChange) {
            var self = this;
            var ann = self.annotation;
            var currentFontWeight = ann.options.fontWeight;
            var currentType = ann.options.isSingleColor;

            /**
             * Execute the undo/redo with the new properties
             * @param {number} newSize new weight to set
             */
            function undoRedo(newWeight, isSingleColor) {
                var settingPanel = self.settingsPopup;
                if (settingPanel) {
                    var fibFontWeightChangeElm = settingPanel.find("button[inf-ctrl=singleToggleFontWeight][inf-ctrl-val=P_all]");
                    if (fibFontWeightChangeElm.length > 0) {
                        settingPanel.data("infUndoRedo", true);
                        $(fibFontWeightChangeElm).trigger("click");
                    } else {
                        proceed.call(self, newWeight, isSingleColor, fibLevelOptions, false);
                    }
                } else {
                    proceed.call(self, newWeight, isSingleColor, fibLevelOptions, false);
                }
                self.onPropertyChange();
            }

            infChart.commandsManager.registerCommand(self.stockChartId, function () {
                undoRedo(value, isSingleColor);
            }, function () {
                undoRedo(currentFontWeight, currentType);
            }, undefined, false, 'onFibSingleFontWeightChange');
        }
        proceed.call(this, value, isSingleColor, fibLevelOptions, isPropertyChange);
    });

    /**
    * Wrapping up the infChart.drawingUtils.common.settings.onFibSingleFillColorChange to catch the all fib level fill color change
    */
    infChart.util.wrap(infChart.drawingUtils.common.settings, 'onFibSingleFillColorChange', function (proceed, rgb, value, opacity, isSingleColor, fibLevelColors, isPropertyChange) {
        if (isPropertyChange && !infChart.drawingsManager.getIsActiveDrawingInprogress()) {
            var self = this;
            var ann = self.annotation;
            var currentFillColor = ann.options.fillColor;
            var currentFillOpacity = ann.options.fillOpacity;
            var currentType = ann.options.isSingleColor;
            var lastAction = infChart.commandsManager.getLastAction(self.stockChartId);

            /**
             * Execute the undo/redo with the new properties
             * @param {string} newColor color code
             * @param {float} newOpacity opacity
             */
            function undoRedo(rgb, newColor, newOpacity, isSingleColor) {
                var settingPanel = self.settingsPopup;
                if (settingPanel) {
                    var fibColorChangeElm = settingPanel.find("[inf-ctrl=singleFillColorPicker][inf-ctrl-val=P_all]");
                    if (fibColorChangeElm.length > 0) {
                        settingPanel.data("infUndoRedo", true);
                        fibColorChangeElm.mainColorPanel("value", {
                            color: newColor,
                            opacity: newOpacity
                        });
                    } else {
                        proceed.call(self, rgb, newColor, newOpacity, isSingleColor, fibLevelColors, false);
                    }
                } else {
                    proceed.call(self, rgb, newColor, newOpacity, isSingleColor, fibLevelColors, false);
                }
                self.onPropertyChange();
            }

            if (lastAction && lastAction.actionType === 'onFibSingleFillColorChange' && !lastAction.freezeUpdatingSame) {
                lastAction.action = function () {
                    undoRedo(rgb, value, isSingleColor);
                }
            } else {
                infChart.commandsManager.registerCommand(self.stockChartId, function () {
                    undoRedo(rgb, value, opacity, isSingleColor);
                }, function () {
                    undoRedo(rgb, currentFillColor, currentFillOpacity, currentType);
                }, undefined, false, 'onFibSingleFillColorChange');
            }
        }
        proceed.call(this, rgb, value, opacity, isSingleColor, fibLevelColors, isPropertyChange);
    });

    /**
     * Wrapping up the infChart.drawingUtils.common.settings.onFibSingleOptionChange to catch the color settings change
     */
    infChart.util.wrap(infChart.drawingUtils.common.settings, 'onFibSingleOptionChange', function (proceed, fillColor, fillOpacity, lineColor, lineWidth, fontColor, fontSize, fontWeight, isSingleColor, prevOptions, isPropertyChange) {
        if (isPropertyChange && !infChart.drawingsManager.getIsActiveDrawingInprogress()) {
            var self = this;
            var drawingId = self.drawingId;
            var ann = self.annotation;
            var xChartId = _getChartIdFromHighchartInstance(ann.chart);
            var currentType = self.annotation.options.isSingleColor;
            var lastAction = infChart.commandsManager.getLastAction(self.stockChartId);

            var currentFillColor = self.annotation.options.fillColor;
            var currentFillOpacity = self.annotation.options.fillOpacity;
            var currentLineColor = self.annotation.options.lineColor;
            var currentLineWidth = self.annotation.options.lineWidth;
            var currentFontColor = self.annotation.options.fontColor;
            var currentFontSize = self.annotation.options.fontSize;
            var currentFontWeight = self.annotation.options.fontWeight;

            var currentFibLevelOptions = {};
            var fibLevels = self.annotation.options.fibLevels;
            fibLevels.forEach(function (fibLevel) {
                if (typeof fibLevel === 'object' && fibLevel.hasOwnProperty('id')) {
                    var fibId = fibLevel.id;
                    currentFibLevelOptions[fibId] = {
                        fillColor: fibLevel.fillColor,
                        fillOpacity: fibLevel.fillOpacity,
                        lineColor: fibLevel.lineColor,
                        lineWidth: fibLevel.lineWidth,
                        fontColor: fibLevel.fontColor,
                        fontSize: fibLevel.fontSize,
                        fontWeight: fibLevel.fontWeight
                    };
                }
            });

            /**
             * Execute the undo/redo with the new properties
             * @param isSingleOptionEnabled
             * @param newFillColor
             * @param newFillOpacity
             * @param newLineColor
             * @param newLineWidth
             * @param newFontColor
             * @param newFontSize
             * @param newFontWeight
             * @param newFibLevelOptions
             */
            function undoRedo(isSingleOptionEnabled, newFillColor, newFillOpacity, newLineColor, newLineWidth, newFontColor, newFontSize, newFontWeight, newFibLevelOptions) {
                var drawingObj = infChart.drawingsManager.getDrawingObject(xChartId, drawingId);
                var settingPanel = drawingObj.settingsPopup;
                if(settingPanel){
                    settingPanel.data("infUndoRedo", true);
                }
                if (isSingleOptionEnabled) {
                    proceed.call(drawingObj, newFillColor, newFillOpacity, newLineColor, newLineWidth, newFontColor, newFontSize, newFontWeight, isSingleOptionEnabled, newFibLevelOptions, false);
                } else {
                    proceed.call(drawingObj, newFillColor, newFillOpacity, newLineColor, newLineWidth, newFontColor, newFontSize, newFontWeight, true, newFibLevelOptions, false);
                    proceed.call(drawingObj, newFillColor, newFillOpacity, newLineColor, newLineWidth, newFontColor, newFontSize, newFontWeight, isSingleOptionEnabled, newFibLevelOptions, false);
                }
                if (settingPanel) {
                    drawingObj.updateSettings(drawingObj.getConfig());
                }
                drawingObj.onPropertyChange();
            }

            if (lastAction && lastAction.actionType === 'onFibSingleFillColorChange' && !lastAction.freezeUpdatingSame) {
                lastAction.action = function () {
                    undoRedo(isSingleColor, fillColor, fillOpacity, lineColor, lineWidth, fontColor, fontSize, fontWeight, prevOptions);
                }
            } else {
                infChart.commandsManager.registerCommand(xChartId, function () {
                    undoRedo(isSingleColor, fillColor, fillOpacity, lineColor, lineWidth, fontColor, fontSize, fontWeight, prevOptions);
                }, function () {
                    undoRedo(currentType, currentFillColor, currentFillOpacity, currentLineColor, currentLineWidth, currentFontColor, currentFontSize, currentFontWeight, currentFibLevelOptions);
                }, undefined, false, 'onFibSingleFillColorChange');
            }
        }
        proceed.call(this, fillColor, fillOpacity, lineColor, lineWidth, fontColor, fontSize, fontWeight, isSingleColor, prevOptions, isPropertyChange);
    });

    /**
     * Wrapping up the infChart.drawingUtils.common.settings.onFibLineWidthChange to catch the line width changes
     */
    infChart.util.wrap(infChart.drawingUtils.common.settings, 'onFibLineWidthChange', function (proceed, strokeWidth, fibLevelId, isAll, isPropertyChange) {
        if (isPropertyChange) {
            var self = this;
            var fibLevel = self.additionalDrawings.lines[fibLevelId];
            var currentWidth = fibLevel.element.getAttribute("stroke-width");

            /**
             * Execute the undo/redo with the new properties
             * @param {number} newSize new width to set
             */
            function undoRedo(newSize, fibLevelId) {
                // var drawingObj = infChart.drawingsManager.getDrawingObject(xChartId, drawingId);
                var settingPanel = self.settingsPopup;
                if (settingPanel) {
                    var fibLineWidthChangeDropdownElm = $(settingPanel.find("span[inf-ctrl=fibLevelSelectedLineWidth][inf-ctrl-val='" + fibLevelId + "']"));
                    if (fibLineWidthChangeDropdownElm.length > 0) {
                        settingPanel.data("infUndoRedo", true);
                        var dropDownItem = fibLineWidthChangeDropdownElm.parent().parent();
                        $(dropDownItem).find("li[inf-ctrl=lineWidth][inf-size='" + newSize + "']").trigger("click");
                    } else {
                        proceed.call(self, newSize, fibLevelId, isAll);
                    }
                } else {
                    proceed.call(self, newSize, fibLevelId, isAll);
                }
                self.onPropertyChange();
            }

            infChart.commandsManager.registerCommand(self.stockChartId, function () {
                undoRedo(strokeWidth, fibLevelId);
            }, function () {
                undoRedo(currentWidth, fibLevelId);
            }, undefined, false, 'onFibLineWidthChange');
        }
        proceed.call(this, strokeWidth, fibLevelId, isAll, isPropertyChange);
    });

    infChart.util.wrap(infChart.drawingUtils.common.settings, 'onFibLevelFontSizeChange', function (proceed, fontSize, fibLevelId, isAll, isPropertyChange) {
        if (isPropertyChange) {
            var self = this;
            var fibLevel = self.fibonacciDrawings.lines[fibLevelId];
            var currentFontSize = fibLevel.element.getAttribute("font-size");

            /**
             * Execute the undo/redo with the new properties
             * @param {number} newSize new width to set
             */
            function undoRedo(newSize, fibLevelId) {
                var settingPanel = self.settingsPopup;
                if (settingPanel) {
                    var fibFontSizeChangeDropdownElm = $(settingPanel.find("span[inf-ctrl=fibLevelSelectedFontSize][inf-ctrl-val='" + fibLevelId + "']"));
                    if (fibFontSizeChangeDropdownElm.length > 0) {
                        settingPanel.data("infUndoRedo", true);
                        var dropDownItem = fibFontSizeChangeDropdownElm.parent().parent();
                        $(dropDownItem).find("li[inf-ctrl=fontSize][inf-size='" + newSize + "']").trigger("click");
                    } else {
                        proceed.call(self, newSize, fibLevelId, isAll);
                    }
                } else {
                    proceed.call(self, newSize, fibLevelId, isAll);
                }
                self.onPropertyChange();
            }

            infChart.commandsManager.registerCommand(self.stockChartId, function () {
                undoRedo(fontSize, fibLevelId);
            }, function () {
                undoRedo(currentFontSize, fibLevelId);
            }, undefined, false, 'onFibLineWidthChange');
        }
        proceed.call(this, fontSize, fibLevelId, isAll, isPropertyChange);
    });

    /**
     * Wrapping up the infChart.drawingUtils.common.settings.onFibLevelFontWeightChange to catch the fib level font size change change
     */
    infChart.util.wrap(infChart.drawingUtils.common.settings, 'onFibLevelFontWeightChange', function (proceed, fontWeight, fibLevelId, isAll, isPropertyChange) {
        if (isPropertyChange) {
            var self = this;
            var fibLevel = self.fibonacciDrawings.lines[fibLevelId];
            var currentFontWeight = fibLevel.element.getAttribute("font-weight");

            /**
             * Execute the undo/redo with the new properties
             * @param {number} newSize new width to set
             */
            function undoRedo(newSize, fibLevelId) {
                var settingPanel = self.settingsPopup;
                if (settingPanel) {
                    var fibFontWeightChangeElm = settingPanel.find("button[inf-ctrl=fibLevelToggleFontWeight][inf-ctrl-val='" + fibLevelId + "']");
                    if (fibFontWeightChangeElm.length > 0) {
                        settingPanel.data("infUndoRedo", true);
                        $(fibFontWeightChangeElm).trigger("click");
                    } else {
                        proceed.call(self, newSize, fibLevelId, isAll);
                    }
                } else {
                    proceed.call(self, newSize, fibLevelId, isAll);
                }
                self.onPropertyChange();
            }

            infChart.commandsManager.registerCommand(self.stockChartId, function () {
                undoRedo(fontWeight, fibLevelId);
            }, function () {
                undoRedo(currentFontWeight, fibLevelId);
            }, undefined, false, 'onFibLevelFontWeightChange');
        }
        proceed.call(this, fontWeight, fibLevelId, isAll, isPropertyChange);
    });

    /**
     * Wrapping up the infChart.drawingUtils.common.settings.onFibLevelValueChange to catch the fib level value change
     */
    infChart.util.wrap(infChart.drawingUtils.common.settings, 'onFibLevelValueChange', function (proceed, currentLevel, value, isPropertyChange) {
        if (isPropertyChange) {
            var self = this;
            var ann = self.annotation;
            var options = ann.options;
            var fibLevel = options.fibLevels.find(function (level) {
                return level.id === currentLevel;
            });
            var currentValue = fibLevel.value;

            infChart.commandsManager.registerCommand(self.stockChartId, function () {
                proceed.call(self, currentLevel, value, false);
                self.onPropertyChange();
            }, function () {
                proceed.call(self, currentLevel, currentValue, false);
                self.onPropertyChange();
            }, undefined, false, 'onFibLevelValueChange');
        }
        proceed.call(self, currentLevel, value, isPropertyChange);
    });

    /**
     * Wrapping up the infChart.fibRetracementsDrawing.prototype.onFibModeChange to catch the fib level value change
     */
    infChart.util.wrap(infChart.fibRetracementsDrawing.prototype, 'onFibModeChange', function (proceed, checked, isPropertyChange, ignoreSettingsSave) {
        if (isPropertyChange) {
            var self = this;
            var ann = self.annotation;
            var currentMode = !checked;

            /**
             * Execute the undo/redo with the new properties
             * @param {boolean} checked - mode chaned
             */
            function undoRedo(checked) {
                proceed.call(self, checked, false);
                self.onPropertyChange();
            }

            infChart.commandsManager.registerCommand(self.stockChartId, function () {
                undoRedo(checked);
            }, function () {
                undoRedo(currentMode);
            }, undefined, false, 'onFibModeChange');
        }
        proceed.call(this, checked, isPropertyChange, ignoreSettingsSave);
    });

    /**
     * Wrapping up the infChart.fibRetracementsDrawing.prototype.onChangeSnapToHighLow to catch the fib level value change
     */
    infChart.util.wrap(infChart.fibRetracementsDrawing.prototype, 'onChangeSnapToHighLow', function (proceed, checked, isPropertyChange, ignoreSettingsSave) {
        if (isPropertyChange) {
            var self = this;
            var ann = self.annotation;
            var options = ann.options;
            var currentMode = !checked;

            /**
             * Execute the undo/redo with the new properties
             * @param {boolean} checked - mode chaned
             */
            function undoRedo(checked) {
                proceed.call(self, checked, false);
                self.onPropertyChange();
            }

            infChart.commandsManager.registerCommand(self.stockChartId, function () {
                undoRedo(checked);
            }, function () {
                undoRedo(currentMode);
            }, undefined, false, 'onChangeSnapToHighLow');
        }
        proceed.call(this, checked, isPropertyChange, ignoreSettingsSave);
    });

    /**
     * Wrapping up the infChart.fibRetracementsDrawing.prototype.onTrendLineToggleShow to catch the trend line always show
     */
    infChart.util.wrap(infChart.fibRetracementsDrawing.prototype, 'onTrendLineToggleShow', function (proceed, checked, isPropertyChange) {
        var self = this;
        if (isPropertyChange) {
            var ann = self.annotation;
            var options = ann.options;
            var currentMode = !checked;
            var drawingId = self.drawingId;
            var xChartId = _getChartIdFromHighchartInstance(ann.chart);

            /**
             * Execute the undo/redo with the new properties
             * @param {boolean} checked - mode chaned
             */
            function undoRedo(checked) {
                var drawingObj = infChart.drawingsManager.getDrawingObject(xChartId, drawingId);
                var settingPanel = drawingObj.settingsPopup;
                if (settingPanel) {
                    var toggleTrendLineAlwaysElm = settingPanel.find("[inf-ctrl=showTrendLineAlways]");
                    if (toggleTrendLineAlwaysElm.length > 0) {
                        settingPanel.data("infUndoRedo", true);
                        toggleTrendLineAlwaysElm.trigger("click");
                    } else {
                        proceed.call(drawingObj, checked, false);
                    }
                } else {
                    proceed.call(drawingObj, checked, false);
                }
                drawingObj.onPropertyChange();
            }

            infChart.commandsManager.registerCommand(self.stockChartId, function () {
                undoRedo(checked);
            }, function () {
                undoRedo(currentMode);
            }, undefined, false, 'onTrendLineToggleShow_fibRetracementsDrawing');
        }
        proceed.call(self, checked, isPropertyChange);
    });

    /**
     * Wrapping up the infChart.fib3PointPriceProjectionDrawing.prototype.onTrendLineToggleShow to catch the trend line always show
     */
    infChart.util.wrap(infChart.fib3PointPriceProjectionDrawing.prototype, 'onTrendLineToggleShow', function (proceed, checked, isPropertyChange) {
        var self = this;
        if (isPropertyChange) {
            var ann = self.annotation;
            var options = ann.options;
            var currentMode = !checked;
            var drawingId = self.drawingId;
            var xChartId = _getChartIdFromHighchartInstance(ann.chart);

            /**
             * Execute the undo/redo with the new properties
             * @param {boolean} checked - mode chaned
             */
            function undoRedo(checked) {
                var drawingObj = infChart.drawingsManager.getDrawingObject(xChartId, drawingId);
                var settingPanel = drawingObj.settingsPopup;
                if (settingPanel) {
                    var toggleTrendLineAlwaysElm = settingPanel.find("[inf-ctrl=showTrendLineAlways]");
                    if (toggleTrendLineAlwaysElm.length > 0) {
                        settingPanel.data("infUndoRedo", true);
                        toggleTrendLineAlwaysElm.trigger("click");
                    } else {
                        proceed.call(drawingObj, checked, false);
                    }
                } else {
                    proceed.call(drawingObj, checked, false);
                }
                drawingObj.onPropertyChange();
            }

            infChart.commandsManager.registerCommand(self.stockChartId, function () {
                undoRedo(checked);
            }, function () {
                undoRedo(currentMode);
            }, undefined, false, 'onTrendLineToggleShow_fib3PointPriceProjectionDrawing');
        }
        proceed.call(self, checked, isPropertyChange);
    });

    /**
     * Wrapping up the infChart.fib3PointPriceProjectionGenericDrawing.prototype.onTrendLineToggleShow to catch the trend line always show
     */
    infChart.util.wrap(infChart.fib3PointPriceProjectionGenericDrawing.prototype, 'onTrendLineToggleShow', function (proceed, checked, isPropertyChange) {
        var self = this;
        if (isPropertyChange) {
            var ann = self.annotation;
            var options = ann.options;
            var currentMode = !checked;
            var drawingId = self.drawingId;
            var xChartId = _getChartIdFromHighchartInstance(ann.chart);

            /**
             * Execute the undo/redo with the new properties
             * @param {boolean} checked - mode chaned
             */
            function undoRedo(checked) {
                var drawingObj = infChart.drawingsManager.getDrawingObject(xChartId, drawingId);
                var settingPanel = drawingObj.settingsPopup;
                if (settingPanel) {
                    var toggleTrendLineAlwaysElm = settingPanel.find("[inf-ctrl=showTrendLineAlways]");
                    if (toggleTrendLineAlwaysElm.length > 0) {
                        settingPanel.data("infUndoRedo", true);
                        toggleTrendLineAlwaysElm.trigger("click");
                    } else {
                        proceed.call(drawingObj, checked, false);
                    }
                } else {
                    proceed.call(drawingObj, checked, false);
                }
                drawingObj.onPropertyChange();
            }

            infChart.commandsManager.registerCommand(self.stockChartId, function () {
                undoRedo(checked);
            }, function () {
                undoRedo(currentMode);
            }, undefined, false, 'onTrendLineToggleShow_fib3PointPriceProjectionGenericDrawing');
        }
        proceed.call(self, checked, isPropertyChange);
    });

    /**
     * Wrapping up the infChart.fibVerRetracementsDrawing.prototype.onTrendLineToggleShow to catch the trend line always show
     */
    infChart.util.wrap(infChart.fibVerRetracementsDrawing.prototype, 'onTrendLineToggleShow', function (proceed, checked, isPropertyChange) {
        var self = this;
        if (isPropertyChange) {
            var ann = self.annotation;
            var options = ann.options;
            var currentMode = !checked;
            var drawingId = self.drawingId;
            var xChartId = _getChartIdFromHighchartInstance(ann.chart);

            /**
             * Execute the undo/redo with the new properties
             * @param {boolean} checked - mode chaned
             */
            function undoRedo(checked) {
                var drawingObj = infChart.drawingsManager.getDrawingObject(xChartId, drawingId);
                var settingPanel = drawingObj.settingsPopup;
                if (settingPanel) {
                    var toggleTrendLineAlwaysElm = settingPanel.find("[inf-ctrl=showTrendLineAlways]");
                    if (toggleTrendLineAlwaysElm.length > 0) {
                        settingPanel.data("infUndoRedo", true);
                        toggleTrendLineAlwaysElm.trigger("click");
                    } else {
                        proceed.call(drawingObj, checked, false);
                    }
                } else {
                    proceed.call(drawingObj, checked, false);
                }
                drawingObj.onPropertyChange();
            }

            infChart.commandsManager.registerCommand(self.stockChartId, function () {
                undoRedo(checked);
            }, function () {
                undoRedo(currentMode);
            }, undefined, false, 'onTrendLineToggleShow_fibVerRetracementsDrawing');
        }
        proceed.call(self, checked, isPropertyChange);
    });

    /**
     * Wrapping up the infChart.fib3PointTimeProjection.prototype.onTrendLineToggleShow to catch the trend line always show
     */
    infChart.util.wrap(infChart.fib3PointTimeProjection.prototype, 'onTrendLineToggleShow', function (proceed, checked, isPropertyChange) {
        var self = this;
        if (isPropertyChange) {
            var ann = self.annotation;
            var options = ann.options;
            var currentMode = !checked;
            var drawingId = self.drawingId;
            var xChartId = _getChartIdFromHighchartInstance(ann.chart);

            /**
             * Execute the undo/redo with the new properties
             * @param {boolean} checked - mode chaned
             */
            function undoRedo(checked) {
                var drawingObj = infChart.drawingsManager.getDrawingObject(xChartId, drawingId);
                var settingPanel = drawingObj.settingsPopup;
                if (settingPanel) {
                    var toggleTrendLineAlwaysElm = settingPanel.find("[inf-ctrl=showTrendLineAlways]");
                    if (toggleTrendLineAlwaysElm.length > 0) {
                        settingPanel.data("infUndoRedo", true);
                        toggleTrendLineAlwaysElm.trigger("click");
                    } else {
                        proceed.call(drawingObj, checked, false);
                    }
                } else {
                    proceed.call(drawingObj, checked, false);
                }
                drawingObj.onPropertyChange();
            }

            infChart.commandsManager.registerCommand(self.stockChartId, function () {
                undoRedo(checked);
            }, function () {
                undoRedo(currentMode);
            }, undefined, false, 'onTrendLineToggleShow_fib3PointTimeProjection');
        }
        proceed.call(self, checked, isPropertyChange);
    });

    /**
     * Wrapping up the infChart.fib3PointPriceProjectionGenericDrawing.prototype.onFibFillColorChange to catch the color settings change
     */
    infChart.util.wrap(infChart.fib3PointPriceProjectionGenericDrawing.prototype, 'onFibFillColorChange', function (proceed, rgb, value, opacity, level, isAll, subType, isPropertyChange) {
        if (isPropertyChange && !infChart.drawingsManager.getIsActiveDrawingInprogress()) {
            var drawingId = this.drawingId;
            var ann = this.annotation;
            var xChartId = _getChartIdFromHighchartInstance(ann.chart);
            if(subType == "fibExtention"){
                var fibonacciDrawingsFill = this.fibonacciDrawings.fill[level.id];
            }
            if(subType == "fibRetracement"){
                var fibonacciDrawingsFill = this.fibRetrancementAdditionalDrawing.fill[level.id];
            }
            var currentColor = fibonacciDrawingsFill.element.getAttribute("fill");
            var currentOpacity = fibonacciDrawingsFill.element.getAttribute("fill-opacity");
            var lastAction = infChart.commandsManager.getLastAction(xChartId);

            /**
             * Execute the undo/redo with the new properties
             * @param {string} newColor color code
             * @param {float} newOpacity opacity
             */
            function undoRedo(newColor, newOpacity, subType) {
                var drawingObj = infChart.drawingsManager.getDrawingObject(xChartId, drawingId);
                var settingPanel = drawingObj.settingsPopup;
                if (settingPanel) {
                    var fibColorChangeElm = settingPanel.find("[inf-ctrl=fibLevelFillColorPicker][inf-ctrl-val='" + level.id + "'][sub-type='" + subType + "']");
                    if (fibColorChangeElm.length > 0) {
                        settingPanel.data("infUndoRedo", true);
                        fibColorChangeElm.mainColorPanel("value", {
                            color: newColor,
                            opacity: newOpacity
                        });
                    } else {
                        proceed.call(drawingObj, rgb, newColor, newOpacity, fibLevel, isAll, subType, false);
                    }
                } else {
                    proceed.call(drawingObj, rgb, newColor, newOpacity, fibLevel, isAll, subType, false);
                }
                drawingObj.onPropertyChange();
            }

            if (lastAction && lastAction.actionType === 'genericTool_onFibFillColorChange' && !lastAction.freezeUpdatingSame) {
                lastAction.action = function () {
                    undoRedo(value, opacity);
                }
            } else {
                infChart.commandsManager.registerCommand(xChartId, function () {
                    undoRedo(value, opacity, subType);
                }, function () {
                    undoRedo(currentColor, currentOpacity, subType);
                }, undefined, false, 'genericTool_onFibFillColorChange');
            }
        }
        proceed.call(this, rgb, value, opacity, level, isAll, subType, isPropertyChange);
    });

    /**
     * Wrapping up the infChart.fib3PointPriceProjectionGenericDrawing.prototype.onFibLevelLineColorChange to catch the color settings change
     */
    infChart.util.wrap(infChart.fib3PointPriceProjectionGenericDrawing.prototype, 'onFibLevelLineColorChange', function (proceed, rgb, value, fibLevelId, isAll, subType, isPropertyChange) {
        if (isPropertyChange && !infChart.drawingsManager.getIsActiveDrawingInprogress()) {
            var self = this;
            var ann = self.annotation;
            if(subType == "fibExtention"){
                var fibonacciDrawingsLines = this.fibonacciDrawings.lines[fibLevelId];
            }
            if(subType == "fibRetracement"){
                var fibonacciDrawingsLines = this.fibRetrancementAdditionalDrawing.lines[fibLevelId];
            }
            var currentLineColor = fibonacciDrawingsLines.element.getAttribute("stroke");
            var lastAction = infChart.commandsManager.getLastAction(self.stockChartId);

            /**
             * Execute the undo/redo with the new properties
             * @param {string} newColor color code
             */
            function undoRedo(newColor, subType) {
                var settingPanel = self.settingsPopup;
                if (settingPanel) {
                    var fibLineColorChangeElm = settingPanel.find("[inf-ctrl=fibLevelLineColorPicker][inf-ctrl-val='" + fibLevelId + "'][sub-type='" + subType + "']");
                    if (fibLineColorChangeElm.length > 0) {
                        settingPanel.data("infUndoRedo", true);
                        fibLineColorChangeElm.mainColorPanel("value", {
                            color: newColor
                        });
                    } else {
                        proceed.call(self, rgb, newColor, fibLevelId, isAll, subType, false);
                    }
                } else {
                    proceed.call(self, rgb, newColor, fibLevelId, isAll, subType, false);
                }
                self.onPropertyChange();
            }

            if (lastAction && lastAction.actionType === 'genericTool_onFibLevelLineColorChange' && !lastAction.freezeUpdatingSame) {
                lastAction.action = function () {
                    undoRedo(value, subType);
                }
            } else {
                infChart.commandsManager.registerCommand(self.stockChartId, function () {
                    undoRedo(value, subType);
                }, function () {
                    undoRedo(currentLineColor, subType);
                }, undefined, false, 'genericTool_onFibLevelLineColorChange');
            }
        }
        proceed.call(this, rgb, value, fibLevelId, isAll, subType, isPropertyChange);
    });
    
    /**
     * Wrapping up the infChart.fib3PointPriceProjectionGenericDrawing.prototype.onFibLevelFontColorChange to catch the color settings change
     */
    infChart.util.wrap(infChart.fib3PointPriceProjectionGenericDrawing.prototype, 'onFibLevelFontColorChange', function (proceed, rgb, value, fibLevel, isAll, subType, isPropertyChange) {
        if (isPropertyChange && !infChart.drawingsManager.getIsActiveDrawingInprogress()) {
            var self = this;
            var ann = self.annotation;
            var fibLevelId = fibLevel && fibLevel.id;
            if(subType == "fibExtention"){
                var fibonacciDrawingsLabel = this.fibonacciDrawings.labels[fibLevelId];
            }
            if(subType == "fibRetracement"){
                var fibonacciDrawingsLabel = this.fibRetrancementAdditionalDrawing.labels[fibLevelId];
            }
            var currentFontColor = fibonacciDrawingsLabel.element.getAttribute("font-color");
            var lastAction = infChart.commandsManager.getLastAction(self.stockChartId);

            /**
             * Execute the undo/redo with the new properties
             * @param {string} newColor color code
             */
             function undoRedo(newColor, subType) {
                var settingPanel = self.settingsPopup;
                if (settingPanel) {
                    var fibFontColorChangeElm = settingPanel.find("[inf-ctrl=fibLevelFontColorPicker][inf-ctrl-val='" + fibLevelId + "'][subType='" + subType + "']");
                    if (fibFontColorChangeElm.length > 0) {
                        settingPanel.data("infUndoRedo", true);
                        fibFontColorChangeElm.mainColorPanel("value", {
                            color: newColor
                        });
                    } else {
                        proceed.call(self, rgb, newColor, fibLevel, isAll, subType, false);
                    }
                } else {
                    proceed.call(self, rgb, newColor, fibLevel, isAll, subType, false);
                }
                self.onPropertyChange();
            }

            if (lastAction && lastAction.actionType === 'genericTool_onFibLevelFontColorChange' && !lastAction.freezeUpdatingSame) {
                lastAction.action = function () {
                    undoRedo(value, subType);
                }
            } else {
                infChart.commandsManager.registerCommand(self.stockChartId, function () {
                    undoRedo(value, subType);
                }, function () {
                    undoRedo(currentFontColor, subType);
                }, undefined, false, 'genericTool_onFibLevelFontColorChange');
            }
        }
        proceed.call(this, rgb, value, fibLevel, isAll, subType, isPropertyChange);
    });

    /**
     * Wrapping up the infChart.fib3PointPriceProjectionGenericDrawing.prototype.onFibLevelFontSizeChange to catch the color settings change
     */
    infChart.util.wrap(infChart.fib3PointPriceProjectionGenericDrawing.prototype, 'onFibLevelFontSizeChange', function (proceed, fontSize, fibLevelId, isAll, subType, isPropertyChange) {
        if (isPropertyChange) {
            var self = this;
            if(subType == "fibExtention"){
                var fibLevel = this.fibonacciDrawings.labels[fibLevelId];
            }
            if(subType == "fibRetracement"){
                var fibLevel = this.fibRetrancementAdditionalDrawing.labels[fibLevelId];
            }
            var currentFontSize = fibLevel.element.getAttribute("font-size");

            /**
             * Execute the undo/redo with the new properties
             * @param {number} newSize new width to set
             */
            function undoRedo(newSize, fibLevelId, subType) {
                var settingPanel = self.settingsPopup;
                if (settingPanel) {
                    var fibFontSizeChangeDropdownElm = $(settingPanel.find("span[inf-ctrl=fibLevelSelectedFontSize][inf-ctrl-val='" + fibLevelId + "'][sub-type='" + subType + "']"));
                    if (fibFontSizeChangeDropdownElm.length > 0) {
                        settingPanel.data("infUndoRedo", true);
                        var dropDownItem = fibFontSizeChangeDropdownElm.parent().parent();
                        $(dropDownItem).find("li[inf-ctrl=fontSize][inf-size='" + newSize + "']").trigger("click");
                    } else {
                        proceed.call(self, newSize, fibLevelId, isAll, subType, false);
                    }
                } else {
                    proceed.call(self, newSize, fibLevelId, isAll, subType, false);
                }
                self.onPropertyChange();
            }

            infChart.commandsManager.registerCommand(self.stockChartId, function () {
                undoRedo(fontSize, fibLevelId, subType);
            }, function () {
                undoRedo(currentFontSize, fibLevelId, subType);
            }, undefined, false, 'genericTool_onFibLevelFontSizeChange');
        }
        proceed.call(this, fontSize, fibLevelId, isAll, subType, isPropertyChange);
    });
    
    /**
     * Wrapping up the infChart.drawingUtils.common.settings.onFibLineWidthChange to catch the line width changes
     */
    infChart.util.wrap(infChart.fib3PointPriceProjectionGenericDrawing.prototype, 'onFibLineWidthChange', function (proceed, strokeWidth, fibLevelId, isAll, subType, isPropertyChange) {
        if (isPropertyChange) {
            var self = this;
            if(subType == "fibExtention"){
                var fibLevel = this.fibonacciDrawings.lines[fibLevelId];
            }
            if(subType == "fibRetracement"){
                var fibLevel = this.fibRetrancementAdditionalDrawing.lines[fibLevelId];
            }
            var currentWidth = fibLevel.element.getAttribute("stroke-width");

            /**
             * Execute the undo/redo with the new properties
             * @param {number} newSize new width to set
             */
            function undoRedo(newSize, fibLevelId, subType) {
                // var drawingObj = infChart.drawingsManager.getDrawingObject(xChartId, drawingId);
                var settingPanel = self.settingsPopup;
                if (settingPanel) {
                    var fibLineWidthChangeDropdownElm = $(settingPanel.find("span[inf-ctrl=fibLevelSelectedLineWidth][inf-ctrl-val='" + fibLevelId + "'][sub-type='" + subType + "']"));
                    if (fibLineWidthChangeDropdownElm.length > 0) {
                        settingPanel.data("infUndoRedo", true);
                        var dropDownItem = fibLineWidthChangeDropdownElm.parent().parent();
                        $(dropDownItem).find("li[inf-ctrl=lineWidth][inf-size='" + newSize + "']").trigger("click");
                    } else {
                        proceed.call(self, newSize, fibLevelId, isAll, subType, false);
                    }
                } else {
                    proceed.call(self, newSize, fibLevelId, isAll, subType, false);
                }
                self.onPropertyChange();
            }

            infChart.commandsManager.registerCommand(self.stockChartId, function () {
                undoRedo(strokeWidth, fibLevelId, subType);
            }, function () {
                undoRedo(currentWidth, fibLevelId, subType);
            }, undefined, false, 'genericTool_onFibLineWidthChange');
        }
        proceed.call(this, strokeWidth, fibLevelId, isAll, subType, isPropertyChange);
    });

    /**
     * Wrapping up the infChart.fib3PointPriceProjectionGenericDrawing.prototype.onFibLevelFontWeightChange to catch the fib level font size change change
     */
    infChart.util.wrap(infChart.fib3PointPriceProjectionGenericDrawing.prototype, 'onFibLevelFontWeightChange', function (proceed, fontWeight, fibLevelId, isAll, subType, isPropertyChange) {
        if (isPropertyChange) {
            var self = this;
            if(subType == "fibExtention"){
                var fibLevel = this.fibonacciDrawings.labels[fibLevelId];
            }
            if(subType == "fibRetracement"){
                var fibLevel = this.fibRetrancementAdditionalDrawing.labels[fibLevelId];
            }
            var currentFontWeight = fibLevel.element.getAttribute("font-weight");

            /**
             * Execute the undo/redo with the new properties
             * @param {number} newSize new width to set
             */
            function undoRedo(newSize, fibLevelId, subType) {
                var settingPanel = self.settingsPopup;
                if (settingPanel) {
                    var fibFontWeightChangeElm = settingPanel.find("button[inf-ctrl=fibLevelToggleFontWeight][inf-ctrl-val='" + fibLevelId + "'][sub-type='" + subType + "']");
                    if (fibFontWeightChangeElm.length > 0) {
                        settingPanel.data("infUndoRedo", true);
                        $(fibFontWeightChangeElm).trigger("click");
                    } else {
                        proceed.call(self, newSize, fibLevelId, isAll, subType);
                    }
                } else {
                    proceed.call(self, newSize, fibLevelId, isAll, subType);
                }
                self.onPropertyChange();
            }

            infChart.commandsManager.registerCommand(self.stockChartId, function () {
                undoRedo(fontWeight, fibLevelId, subType);
            }, function () {
                undoRedo(currentFontWeight, fibLevelId, subType);
            }, undefined, false, 'genericTool_onFibLevelFontWeightChange');
        }
        proceed.call(this, fontWeight, fibLevelId, isAll, subType, isPropertyChange);
    });

    /**
     * Wrapping up the infChart.fib3PointPriceProjectionGenericDrawing.prototype.onFibLevelValueChange to catch the fib level value change
     */
    infChart.util.wrap(infChart.fib3PointPriceProjectionGenericDrawing.prototype, 'onFibLevelValueChange', function (proceed, currentLevel, value, subType, isPropertyChange) {
        if (isPropertyChange) {
            var self = this;
            var ann = self.annotation;
            var options = ann.options;
            if(subType == "fibExtention"){
                var fibLevel = options.fibExtentionLevels.find(function (level) {
                    return level.id === currentLevel;
                });
            }
            if(subType == "fibRetracement"){
                var fibLevel = options.fibRetrancementLevels.find(function (level) {
                    return level.id === currentLevel;
                });
            }
            var currentValue = fibLevel.value;

            infChart.commandsManager.registerCommand(self.stockChartId, function () {
                proceed.call(self, currentLevel, value, subType, false);
                self.onPropertyChange();
            }, function () {
                proceed.call(self, currentLevel, currentValue, subType, false);
                self.onPropertyChange();
            }, undefined, false, 'genericTool_onFibLevelValueChange');
        }
        proceed.call(self, currentLevel, value, subType, isPropertyChange);
    });

    /**
     * Wrapping up the infChart.fib3PointPriceProjectionGenericDrawing.prototype.onFibLevelChange to catch the level changes
     */
    infChart.util.wrap(infChart.fib3PointPriceProjectionGenericDrawing.prototype, 'onFibLevelChange', function (proceed, currentLevel, checked, subType, isPropertyChange, ignoreSettingsSave) {
        if (isPropertyChange) {
            var drawingId = this.drawingId;
            var ann = this.annotation;
            var xChartId = _getChartIdFromHighchartInstance(ann.chart);
            var currentVisibility = !checked;

            /**
             * Execute the undo/redo with the new properties
             * @param {boolean|undefined} newVisibility indicate the visibility of the level
             */
            function undoRedo(newVisibility, subType) {
                var drawingObj = infChart.drawingsManager.getDrawingObject(xChartId, drawingId);
                var settingPanel = drawingObj.settingsPopup;
                if (settingPanel) {
                    var fibLevelElm = settingPanel.find("[inf-ctrl=fibLevel][data-value='" + currentLevel + "'][sub-type='" + subType + "']");
                    if (fibLevelElm.length > 0) {
                        settingPanel.data("infUndoRedo", true);
                        fibLevelElm.trigger('click');
                    } else {
                        proceed.call(drawingObj, currentLevel, newVisibility, subType);
                    }
                } else {
                    proceed.call(drawingObj, currentLevel, newVisibility, subType);
                }
                drawingObj.onPropertyChange();
            }

            infChart.commandsManager.registerCommand(xChartId, function () {
                undoRedo(checked, subType);
            }, function () {
                undoRedo(currentVisibility, subType);
            }, undefined, false, 'genericTool_onFibLevelChange');
        }
        proceed.call(this, currentLevel, checked, subType, isPropertyChange, ignoreSettingsSave);
    });

    /**
    * Wrapping up the infChart.fib3PointPriceProjectionGenericDrawing.prototype.onFibSingleLineColorChange to catch the all fib level line color change
    */
    infChart.util.wrap(infChart.fib3PointPriceProjectionGenericDrawing.prototype, 'onFibSingleLineColorChange', function (proceed, rgb, value, isSingleColor, fibLevelLineColors, subType, isPropertyChange) {
        if (isPropertyChange && !infChart.drawingsManager.getIsActiveDrawingInprogress()) {
            var self = this;
            var ann = self.annotation;
            if(subType == "fibExtention"){
                var currentLineColor = ann.options.extentionLineColor;
                var currentType = ann.options.isSingleColorExtention;
            }
            if(subType == "fibRetracement"){
                var currentLineColor = ann.options.retrancementLineColor;
                var currentType = ann.options.isSingleColorRetracement;
            }
            var lastAction = infChart.commandsManager.getLastAction(self.stockChartId);

            /**
             * Execute the undo/redo with the new properties
             * @param {string} newColor color code
             */
            function undoRedo(rgb, newColor, isSingleColor, subType) {
                var settingPanel = self.settingsPopup;
                if (settingPanel) {
                    var fibLineColorChangeElm = settingPanel.find("[inf-ctrl=singleLineColorPicker][inf-ctrl-val=P_all][sub-type='" + subType + "']");
                    if (fibLineColorChangeElm.length > 0) {
                        settingPanel.data("infUndoRedo", true);
                        fibLineColorChangeElm.mainColorPanel("value", {
                            color: newColor
                        });
                    } else {
                        proceed.call(self, rgb, newColor, isSingleColor, fibLevelLineColors, subType, false);
                    }
                } else {
                    proceed.call(self, rgb, newColor, isSingleColor, fibLevelLineColors, subType, false);
                }
                self.onPropertyChange();
            }

            if (lastAction && lastAction.actionType === 'genericTool_onFibSingleLineColorChange' && !lastAction.freezeUpdatingSame) {
                lastAction.action = function () {
                    undoRedo(rgb, value, isSingleColor, subType);
                }
            } else {
                infChart.commandsManager.registerCommand(self.stockChartId, function () {
                    undoRedo(rgb, value, isSingleColor, subType);
                }, function () {
                    undoRedo(rgb, currentLineColor, currentType, subType);
                }, undefined, false, 'genericTool_onFibSingleLineColorChange');
            }
        }
        proceed.call(this, rgb, value, isSingleColor, fibLevelLineColors, subType, isPropertyChange);
    });

    /**
    * Wrapping up the infChart.fib3PointPriceProjectionGenericDrawing.prototype.onFibSingleFillColorChange to catch the all fib level fill color change
    */
    infChart.util.wrap(infChart.fib3PointPriceProjectionGenericDrawing.prototype, 'onFibSingleFillColorChange', function (proceed, rgb, value, opacity, isSingleColor, fibLevelColors, subType, isPropertyChange) {
        if (isPropertyChange && !infChart.drawingsManager.getIsActiveDrawingInprogress()) {
            var self = this;
            var ann = self.annotation;
            if(subType == "fibExtention"){
                var currentFillColor = ann.options.extentionFillColor;
                var currentFillOpacity = ann.options.extentionFillOpacity;
                var currentType = ann.options.isSingleColorExtention;
            }
            if(subType == "fibRetracement"){
                var currentFillColor = ann.options.retrancementFillColor ;
                var currentFillOpacity = ann.options.retrancementFillOpacity;
                var currentType = ann.options.isSingleColorRetracement;
            }
            var lastAction = infChart.commandsManager.getLastAction(self.stockChartId);

            /**
             * Execute the undo/redo with the new properties
             * @param {string} newColor color code
             * @param {float} newOpacity opacity
             */
            function undoRedo(rgb, newColor, newOpacity, isSingleColor, subType) {
                var settingPanel = self.settingsPopup;
                if (settingPanel) {
                    var fibColorChangeElm = settingPanel.find("[inf-ctrl=singleFillColorPicker][inf-ctrl-val=P_all][sub-type='" + subType + "']");
                    if (fibColorChangeElm.length > 0) {
                        settingPanel.data("infUndoRedo", true);
                        fibColorChangeElm.mainColorPanel("value", {
                            color: newColor,
                            opacity: newOpacity
                        });
                    } else {
                        proceed.call(self, rgb, newColor, newOpacity, isSingleColor, fibLevelColors, subType, false);
                    }
                } else {
                    proceed.call(self, rgb, newColor, newOpacity, isSingleColor, fibLevelColors, subType, false);
                }
                self.onPropertyChange();
            }

            if (lastAction && lastAction.actionType === 'genericTool_onFibSingleFillColorChange' && !lastAction.freezeUpdatingSame) {
                lastAction.action = function () {
                    undoRedo(rgb, value, opacity, isSingleColor, subType);
                }
            } else {
                infChart.commandsManager.registerCommand(self.stockChartId, function () {
                    undoRedo(rgb, value, opacity, isSingleColor, subType);
                }, function () {
                    undoRedo(rgb, currentFillColor, currentFillOpacity, currentType, subType);
                }, undefined, false, 'genericTool_onFibSingleFillColorChange');
            }
        }
        proceed.call(this, rgb, value, opacity, isSingleColor, fibLevelColors, subType, isPropertyChange);
    });

    /**
    * Wrapping up the infChart.fib3PointPriceProjectionGenericDrawing.prototype.onFibSingleFontColorChange to catch the all fib level font color change
    */
    infChart.util.wrap(infChart.fib3PointPriceProjectionGenericDrawing.prototype, 'onFibSingleFontColorChange', function (proceed, rgb, value, isSingleColor, fibLevelFontColors, subType, isPropertyChange) {
        if (isPropertyChange && !infChart.drawingsManager.getIsActiveDrawingInprogress()) {
            var self = this;
            var ann = self.annotation;
            var currentFontColor = ann.options.fontColor;
            if(subType == "fibExtention"){
                var currentFontColor = ann.options.extentionFontColor;
                var currentType = ann.options.isSingleColorExtention;
            }
            if(subType == "fibRetracement"){
                var currentFontColor = ann.options.retrancementFontColor;
                var currentType = ann.options.isSingleColorRetracement;
            }
            var lastAction = infChart.commandsManager.getLastAction(self.stockChartId);

            /**
             * Execute the undo/redo with the new properties
             * @param {number} newColor new color to set
             */
            function undoRedo(rgb, newColor, isSingleColor, subType) {
                var settingPanel = self.settingsPopup;
                if (settingPanel) {
                    var fibFontColorChangeElm = settingPanel.find("[inf-ctrl=singleFontColorPicker][inf-ctrl-val=P_all][sub-type='" + subType + "']");
                    if (fibFontColorChangeElm.length > 0) {
                        settingPanel.data("infUndoRedo", true);
                        fibFontColorChangeElm.mainColorPanel("value", {
                            color: newColor
                        });
                    } else {
                        proceed.call(self, rgb, newColor, isSingleColor, fibLevelFontColors, subType, false);
                    }
                } else {
                    proceed.call(self, rgb, newColor, isSingleColor, fibLevelFontColors, subType, false);
                }
                self.onPropertyChange();
            }
            if (lastAction && lastAction.actionType === 'genericTool_onFibSingleFontColorChange' && !lastAction.freezeUpdatingSame) {
                lastAction.action = function () {
                    undoRedo(rgb, value, isSingleColor);
                }
            } else {
                infChart.commandsManager.registerCommand(self.stockChartId, function () {
                    undoRedo(rgb, value, isSingleColor, subType);
                }, function () {
                    undoRedo(rgb, currentFontColor, currentType, subType);
                }, undefined, false, 'genericTool_onFibSingleFontColorChange');
            }
        }
        proceed.call(this, rgb, value, isSingleColor, fibLevelFontColors, subType, isPropertyChange);
    });

    /**
    * Wrapping up the infChart.fib3PointPriceProjectionGenericDrawing.prototype.onFibSingleLineWidthChange to catch the all fib level line width change
    */
    infChart.util.wrap(infChart.fib3PointPriceProjectionGenericDrawing.prototype, 'onFibSingleLineWidthChange', function (proceed, strokeWidth, isSingleColor, fibLevelWidths, subType, isPropertyChange) {
        if (isPropertyChange) {
            var self = this;
            var ann = self.annotation;
            if(subType == "fibExtention"){
                var currentLineWidth = ann.options.extentionLineWidth;
                var currentType = ann.options.isSingleColorExtention;
            }
            if(subType == "fibRetracement"){
                var currentLineWidth = ann.options.retrancementLineWidth;
                var currentType = ann.options.isSingleColorRetracement;
            }

            /**
             * Execute the undo/redo with the new properties
             * @param {number} newSize new width to set
             */
            function undoRedo(newSize, isSingleColor, subType) {
                var settingPanel = self.settingsPopup;
                if (settingPanel) {
                    var fibLineWidthChangeDropdownElm = $(settingPanel.find("span[inf-ctrl=singleSelectedLineWidth][inf-ctrl-val=P_all][sub-type='" + subType + "']"));
                    if (fibLineWidthChangeDropdownElm.length > 0) {
                        settingPanel.data("infUndoRedo", true);
                        var dropDownItem = fibLineWidthChangeDropdownElm.parent().parent();
                        $(dropDownItem).find("li[inf-ctrl=lineWidth][inf-size='" + newSize + "']").trigger("click");
                    } else {
                        proceed.call(self, newSize, isSingleColor, fibLevelWidths, subType, false);
                    }
                } else {
                    proceed.call(self, newSize, isSingleColor, fibLevelWidths, subType, false);
                }
                self.onPropertyChange();
            }

            infChart.commandsManager.registerCommand(self.stockChartId, function () {
                undoRedo(strokeWidth, isSingleColor, subType);
            }, function () {
                undoRedo(currentLineWidth, currentType, subType);
            }, undefined, false, 'genericTool_onFibSingleLineWidthChange');
        }
        proceed.call(this, strokeWidth, isSingleColor, fibLevelWidths, subType, isPropertyChange);
    });

    /**
    * Wrapping up the infChart.fib3PointPriceProjectionGenericDrawing.prototype.onFibSingleFontSizeChange to catch the all fib level font size change
    */
    infChart.util.wrap(infChart.fib3PointPriceProjectionGenericDrawing.prototype, 'onFibSingleFontSizeChange', function (proceed, fontSize, isSingleColor, fibLevelFontSizes, subType, isPropertyChange) {
        if (isPropertyChange) {
            var self = this;
            var ann = self.annotation;
            if(subType == "fibExtention"){
                var currentFontSize = ann.options.extentionFontSize;
                var currentType = ann.options.isSingleColorExtention;
            }
            if(subType == "fibRetracement"){
                var currentFontSize = ann.options.retrancementFontSize;
                var currentType = ann.options.isSingleColorRetracement;
            }

            /**
             * Execute the undo/redo with the new properties
             * @param {number} newSize new font size to set
             */
            function undoRedo(newSize, isSingleColor, subType) {
                var settingPanel = self.settingsPopup;

                if (settingPanel) {
                    var fibFontSizeChangeDropdownElm = $(settingPanel.find("span[inf-ctrl=singleSelectedFontSize][inf-ctrl-val=P_all][sub-type='" + subType + "']"));
                    if (fibFontSizeChangeDropdownElm.length > 0) {
                        settingPanel.data("infUndoRedo", true);
                        var dropDownItem = fibFontSizeChangeDropdownElm.parent().parent();
                        $(dropDownItem).find("li[inf-ctrl=fontSize][inf-size='" + newSize + "']").trigger("click");
                    } else {
                        proceed.call(self, newSize, isSingleColor, fibLevelFontSizes, subType, false);
                    }
                } else {
                    proceed.call(self, newSize, isSingleColor, fibLevelFontSizes, subType, false);
                }
                self.onPropertyChange();
            }

            infChart.commandsManager.registerCommand(self.stockChartId, function () {
                undoRedo(fontSize, isSingleColor, subType);
            }, function () {
                undoRedo(currentFontSize, currentType, subType);
            }, undefined, false, 'genericTool_onFibSingleFontSizeChange');
        }
        proceed.call(this, fontSize, isSingleColor, fibLevelFontSizes, subType, isPropertyChange);
    });

        /**
    * Wrapping up the infChart.fib3PointPriceProjectionGenericDrawing.prototype.onFibSingleFontWeightChange to catch the all fib level font weight change
    */
    infChart.util.wrap(infChart.fib3PointPriceProjectionGenericDrawing.prototype, 'onFibSingleFontWeightChange', function (proceed, value, isSingleColor, fibLevelOptions, subType, isPropertyChange) {
        if (isPropertyChange) {
            var self = this;
            var ann = self.annotation;
            if(subType == "fibExtention"){
                var currentFontWeight = ann.options.extentionFontWeight;
                var currentType = ann.options.isSingleColorExtention;
            }
            if(subType == "fibRetracement"){
                var currentFontWeight = ann.options.retrancementFontWeight;
                var currentType = ann.options.isSingleColorRetracement;
            }

            /**
             * Execute the undo/redo with the new properties
             * @param {number} newSize new weight to set
             */
            function undoRedo(newWeight, isSingleColor, subType) {
                var settingPanel = self.settingsPopup;
                if (settingPanel) {
                    var fibFontWeightChangeElm = settingPanel.find("button[inf-ctrl=singleToggleFontWeight][inf-ctrl-val=P_all][sub-type='" + subType + "']");
                    if (fibFontWeightChangeElm.length > 0) {
                        settingPanel.data("infUndoRedo", true);
                        $(fibFontWeightChangeElm).trigger("click");
                    } else {
                        proceed.call(self, newWeight, isSingleColor, fibLevelOptions, subType, false);
                    }
                } else {
                    proceed.call(self, newWeight, isSingleColor, fibLevelOptions, subType, false);
                }
                self.onPropertyChange();
            }

            infChart.commandsManager.registerCommand(self.stockChartId, function () {
                undoRedo(value, isSingleColor, subType);
            }, function () {
                undoRedo(currentFontWeight, currentType, subType);
            }, undefined, false, 'genericTool_onFibSingleFontWeightChange');
        }
        proceed.call(this, value, isSingleColor, fibLevelOptions, subType, isPropertyChange);
    });

    /**
     * Wrapping up the infChart.fib3PointPriceProjectionGenericDrawing.prototype.onFibSingleOptionChange to catch the color settings change
     */
    infChart.util.wrap(infChart.fib3PointPriceProjectionGenericDrawing.prototype, 'onFibSingleOptionChange', function (proceed, fillColor, fillOpacity, lineColor, lineWidth, fontColor, fontSize, fontWeight, isSingleColor, prevOptions, subType, isPropertyChange) {
        if (isPropertyChange && !infChart.drawingsManager.getIsActiveDrawingInprogress()) {
            var self = this;
            var drawingId = self.drawingId;
            var ann = self.annotation;
            var xChartId = _getChartIdFromHighchartInstance(ann.chart);
            //var currentType = self.annotation.options.isSingleColor;
            var lastAction = infChart.commandsManager.getLastAction(self.stockChartId);

            if(subType == "fibExtention"){
                var currentType = ann.options.isSingleColorExtention;
                var currentFontWeight = ann.options.extentionFontWeight;
                var currentFontSize = ann.options.extentionFontSize;
                var currentFontColor = ann.options.extentionFontColor; 
                var currentFillColor = ann.options.extentionFillColor;
                var currentFillOpacity = ann.options.extentionFillOpacity;
                var currentLineColor = ann.options.extentionLineColor;
                var currentLineWidth = ann.options.extentionLineWidth;
                var fibLevels = self.annotation.options.fibExtentionLevels;
            }
            if(subType == "fibRetracement"){
                var currentType = ann.options.isSingleColorRetracement;
                var currentFontWeight = ann.options.retrancementFontWeight;
                var currentFontSize = ann.options.retrancementFontSize;
                var currentFontColor = ann.options.retrancementFontColor; 
                var currentFillColor = ann.options.retrancementFillColor;
                var currentFillOpacity = ann.options.retrancementFillOpacity;
                var currentLineColor = ann.options.retrancementLineColor;
                var currentLineWidth = ann.options.retrancementLineWidth;
                var fibLevels = self.annotation.options.fibRetrancementLevels;
            }

            var currentFibLevelOptions = {};
            fibLevels.forEach(function (fibLevel) {
                if (typeof fibLevel === 'object' && fibLevel.hasOwnProperty('id')) {
                    var fibId = fibLevel.id;
                    currentFibLevelOptions[fibId] = {
                        fillColor: fibLevel.fillColor,
                        fillOpacity: fibLevel.fillOpacity,
                        lineColor: fibLevel.lineColor,
                        lineWidth: fibLevel.lineWidth,
                        fontColor: fibLevel.fontColor,
                        fontSize: fibLevel.fontSize,
                        fontWeight: fibLevel.fontWeight
                    };
                }
            });

            /**
             * Execute the undo/redo with the new properties
             * @param isSingleOptionEnabled
             * @param newFillColor
             * @param newFillOpacity
             * @param newLineColor
             * @param newLineWidth
             * @param newFontColor
             * @param newFontSize
             * @param newFontWeight
             * @param newFibLevelOptions
             */
            function undoRedo(isSingleOptionEnabled, newFillColor, newFillOpacity, newLineColor, newLineWidth, newFontColor, newFontSize, newFontWeight, newFibLevelOptions, subType) {
                var drawingObj = infChart.drawingsManager.getDrawingObject(xChartId, drawingId);
                var settingPanel = drawingObj.settingsPopup;
                if(settingPanel){
                    settingPanel.data("infUndoRedo", true);
                }
                if (isSingleOptionEnabled) {
                    proceed.call(drawingObj, newFillColor, newFillOpacity, newLineColor, newLineWidth, newFontColor, newFontSize, newFontWeight, isSingleOptionEnabled, newFibLevelOptions, subType, false);
                } else {
                    proceed.call(drawingObj, newFillColor, newFillOpacity, newLineColor, newLineWidth, newFontColor, newFontSize, newFontWeight, true, newFibLevelOptions, subType, false);
                    proceed.call(drawingObj, newFillColor, newFillOpacity, newLineColor, newLineWidth, newFontColor, newFontSize, newFontWeight, isSingleOptionEnabled, newFibLevelOptions, subType, false);
                }
                if (settingPanel) {
                    drawingObj.updateSettings(drawingObj.getConfig());
                }
                drawingObj.onPropertyChange();
            }

            if (lastAction && lastAction.actionType === 'genericTool_onFibSingleOptionChange' && !lastAction.freezeUpdatingSame) {
                lastAction.action = function () {
                    undoRedo(isSingleColor, fillColor, fillOpacity, lineColor, lineWidth, fontColor, fontSize, fontWeight, prevOptions, subType);
                }
            } else {
                infChart.commandsManager.registerCommand(xChartId, function () {
                    undoRedo(isSingleColor, fillColor, fillOpacity, lineColor, lineWidth, fontColor, fontSize, fontWeight, prevOptions, subType);
                }, function () {
                    undoRedo(currentType, currentFillColor, currentFillOpacity, currentLineColor, currentLineWidth, currentFontColor, currentFontSize, currentFontWeight, currentFibLevelOptions, subType);
                }, undefined, false, 'genericTool_onFibSingleOptionChange');
            }
        }
        proceed.call(this, fillColor, fillOpacity, lineColor, lineWidth, fontColor, fontSize, fontWeight, isSingleColor, prevOptions, subType, isPropertyChange);
    });

        /**
     * Wrapping up the infChart.fib3PointPriceProjectionGenericDrawing.prototype.onFibApplyAllButtonClick to catch apply now to all level button click
     */
    infChart.util.wrap(infChart.fib3PointPriceProjectionGenericDrawing.prototype, 'onFibApplyAllButtonClick', function(proceed, fillColor, fillOpacity, lineColor, lineWidth, fontColor, fontSize, fontWeight, prevOptions, subType, isPropertyChange) {
        var self = this;
        var ann = self.annotation;
        if ((_isTrackHistoryEnabledDrawing(ann) || _isIndicatorDrawing(ann)) && isPropertyChange) {
            if(subType == "fibExtention"){
                var fibLevels = self.annotation.options.fibExtentionLevels;
            }
            if(subType == "fibRetracement"){
                var fibLevels = self.annotation.options.fibRetrancementLevels;
            }
            var xChartId = _getChartIdFromHighchartInstance(ann.chart);
            var currentOptions = prevOptions;

            function undoRedo(isSingleColor, newOptions, subType) {
                fibLevels.forEach(function (fibLevel) {
                    fibLevel.fillColor = isSingleColor ? fillColor : newOptions[fibLevel.id].fillColor;
                    fibLevel.fillOpacity = isSingleColor ? fillOpacity : newOptions[fibLevel.id].fillOpacity;
                    fibLevel.lineColor = isSingleColor ? lineColor : newOptions[fibLevel.id].lineColor;
                    fibLevel.lineWidth = isSingleColor ? lineWidth : newOptions[fibLevel.id].lineWidth;
                    fibLevel.fontColor = isSingleColor ? fontColor : newOptions[fibLevel.id].fontColor;
                    fibLevel.fontSize = isSingleColor ? fontSize : newOptions[fibLevel.id].fontSize;
                    fibLevel.fontWeight = isSingleColor ? fontWeight : newOptions[fibLevel.id].fontWeight;
                });
                self.updateSettings(self.getConfig());
                self.onPropertyChange();
            }

            infChart.commandsManager.registerCommand(xChartId, function () {
                undoRedo(true, undefined, subType);
            }, function () {
                undoRedo(false, currentOptions, subType);
            }, undefined, false, 'genericTool_onFibApplyAllButtonClick');
        }
        proceed.call(this, fillColor, fillOpacity, lineColor, lineWidth, fontColor, fontSize, fontWeight, prevOptions, subType, isPropertyChange);
    });
    
    /**
    * Wrapping up the infChart.fib3PointPriceProjectionGenericDrawing.prototype.onAlignStyleChange to catch the all fib level font size change
    */
    infChart.util.wrap(infChart.fib3PointPriceProjectionGenericDrawing.prototype, 'onAlignStyleChange', function (proceed, linePosition, subType, isPropertyChange) {
        if (isPropertyChange) {
            var self = this;
            var ann = self.annotation;
            if(subType == "fibExtention"){
                var currentLabelPosition = ann.options.extentionLabelPosition;
            }
            if(subType == "fibRetracement"){
                var currentLabelPosition = ann.options.retracementLabelPosition;
            }

            /**
             * Execute the undo/redo with the new properties
             * @param {number} newSize new font size to set
             */
            function undoRedo(linePosition, subType) {
                var settingPanel = self.settingsPopup;

                if (settingPanel) {
                    if(subType == "fibExtention"){
                        var selectAlignStyleElm = $(settingPanel.find("ul[inf-ctrl=fibExtentionAlign]"));
                    }
                    if(subType == "fibRetracement"){
                        var selectAlignStyleElm = $(settingPanel.find("ul[inf-ctrl=fibRetracementAlign]"));
                    }
                    if (selectAlignStyleElm.length > 0) {
                        settingPanel.data("infUndoRedo", true);
                        var highlightedItem = selectAlignStyleElm.find("li[inf-ctrl=alignStyle][inf-style=" + linePosition + "]");
                        $(highlightedItem).trigger("click");
                    } else {
                        proceed.call(self, linePosition, subType, false);
                    }
                } else {
                    proceed.call(self, linePosition, subType, false);
                }
                self.onPropertyChange();
            }

            infChart.commandsManager.registerCommand(self.stockChartId, function () {
                undoRedo(linePosition, subType);
            }, function () {
                undoRedo(currentLabelPosition, subType);
            }, undefined, false, 'genericTool_onAlignStyleChange');
        }
        proceed.call(this, linePosition, subType, isPropertyChange);
    });

    infChart.util.wrap(infChart.fib3PointPriceProjectionDrawing.prototype, 'onChangeSnapToHighLow', function (proceed, checked, isPropertyChange, ignoreSettingsSave) {
        if (isPropertyChange) {
            var self = this;
            var ann = self.annotation;
            var options = ann.options;
            var currentMode = !checked;

            /**
             * Execute the undo/redo with the new properties
             * @param {boolean} checked - mode chaned
             */
            function undoRedo(checked) {
                proceed.call(self, checked, false);
                self.onPropertyChange();
            }

            infChart.commandsManager.registerCommand(self.stockChartId, function () {
                undoRedo(checked);
            }, function () {
                undoRedo(currentMode);
            }, undefined, false, 'onChangeSnapToHighLow');
        }
        proceed.call(this, checked, isPropertyChange, ignoreSettingsSave);
    });

    infChart.util.wrap(infChart.elliotWaveDrawing.prototype, 'onChangeSnapToHighLow', function (proceed, checked, isPropertyChange, ignoreSettingsSave) {
        if (isPropertyChange) {
            var self = this;
            var ann = self.annotation;
            var options = ann.options;
            var currentMode = !checked;

            /**
             * Execute the undo/redo with the new properties
             * @param {boolean} checked - mode chaned
             */
            function undoRedo(checked) {
                proceed.call(self, checked, false);
                self.onPropertyChange();
            }

            infChart.commandsManager.registerCommand(self.stockChartId, function () {
                undoRedo(checked);
            }, function () {
                undoRedo(currentMode);
            }, undefined, false, 'onChangeSnapToHighLow');
        }
        proceed.call(this, checked, isPropertyChange, ignoreSettingsSave);
    });
    /**
     * Wrapping up apply one style in fibonacci vertical retracements
     */
    infChart.util.wrap(infChart.fibVerRetracementsDrawing.prototype, 'applyAllToFibLines', function (proceed, enabled, fillColor, fillOpacity, lineColor, lineWidth, fontColor, fontSize, fontWeight, prevOptions, isPropertyChange) {
        if (isPropertyChange) {
            var self = this;
            var drawingId = self.drawingId;
            var xChartId = self.stockChartId;
            var currentVisibility = !enabled;

            var currentFillColor = self.annotation.options.fillColor;
            var currentFillOpacity = self.annotation.options.fillOpacity;
            var currentLineColor = self.annotation.options.lineColor;
            var currentLineWidth = self.annotation.options.lineWidth;
            var currentFontColor = self.annotation.options.fontColor;
            var currentFontSize = self.annotation.options.fontSize;
            var currentFontWeight = self.annotation.options.fontWeight;

            var currentFibOption = {};
            var fibLevels = self.annotation.options.fibLevels;
            fibLevels.forEach(function (fibLevel) {
                if (typeof fibLevel === 'object' && fibLevel.hasOwnProperty('id')) {
                    var fibId = fibLevel.id;
                    currentFibOption[fibId] = {
                        fillColor: fibLevel.fillColor,
                        fillOpacity: fibLevel.fillOpacity,
                        lineColor: fibLevel.lineColor,
                        lineWidth: fibLevel.lineWidth,
                        fontColor: fibLevel.fontColor,
                        fontSize: fibLevel.fontSize,
                        fontWeight: fibLevel.fontWeight
                    };
                }
            });

            /**
             * Execute the undo/redo with the new properties
             * @param newType
             * @param newFillColor
             * @param newFillOpacity
             * @param newLineColor
             * @param newLineWidth
             * @param newFontColor
             * @param newFontSize
             * @param newFontWeight
             * @param newFibLevelOptions
             */
            function undoRedo(isSingleOptionEnabled, newFillColor, newFillOpacity, newLineColor, newLineWidth, newFontColor, newFontSize, newFontWeight, newFibLevelOptions) {
                var drawingObj = infChart.drawingsManager.getDrawingObject(xChartId, drawingId);
                if (isSingleOptionEnabled) {
                    proceed.call(drawingObj, isSingleOptionEnabled, newFillColor, newFillOpacity, newLineColor, newLineWidth, newFontColor, newFontSize, newFontWeight, newFibLevelOptions, false);
                } else {
                    proceed.call(drawingObj, true, newFillColor, newFillOpacity, newLineColor, newLineWidth, newFontColor, newFontSize, newFontWeight, newFibLevelOptions, false);
                    proceed.call(drawingObj, isSingleOptionEnabled, newFillColor, newFillOpacity, newLineColor, newLineWidth, newFontColor, newFontSize, newFontWeight, newFibLevelOptions, false);
                }
                var settingPanel = drawingObj.settingsPopup;
                if (settingPanel) {
                    settingPanel.data("infUndoRedo", true);
                    drawingObj.updateSettings(drawingObj.getConfig());
                }
                drawingObj.onPropertyChange();
            }

            infChart.commandsManager.registerCommand(xChartId, function () {
                undoRedo(enabled, fillColor, fillOpacity, lineColor, lineWidth, fontColor, fontSize, fontWeight, prevOptions);
            }, function () {
                undoRedo(currentVisibility, currentFillColor, currentFillOpacity, currentLineColor, currentLineWidth, currentFontColor, currentFontSize, currentFontWeight, currentFibOption);
            }, undefined, false, 'applyAllToFibLines');
        }
        proceed.call(this, enabled, fillColor, fillOpacity, lineColor, lineWidth, fontColor, fontSize, fontWeight, prevOptions, isPropertyChange);
    });

    /**
     * Wrapping up all fib level changes in fibonacci vertical retracements
     */
    infChart.util.wrap(infChart.fibVerRetracementsDrawing.prototype, 'changeAllFibLines', function (proceed, property, propertyValue, isPropertyChange) {
        if (isPropertyChange) {
            var drawingId = this.drawingId;
            var xChartId = this.stockChartId;
            var lastAction = infChart.commandsManager.getLastAction(xChartId);
            var currentValue = this.getCurrentPropertyValue(undefined, property, true);

            /**
             * Execute the undo/redo with the new properties
             * @param {string} property update property name
             * @param {*} propertyValue value of updated property
             */
            function undoRedo(property, propertyValue) {
                var drawingObj = infChart.drawingsManager.getDrawingObject(xChartId, drawingId);
                proceed.call(drawingObj, property, propertyValue, false);
                var settingPanel = drawingObj.settingsPopup;
                if (settingPanel) {
                    drawingObj.updateSettings(drawingObj.getConfig());
                }
                drawingObj.onPropertyChange();
            }

            if (lastAction && lastAction.actionType === 'changeAllFibLines' && !lastAction.freezeUpdatingSame) {
                lastAction.action = function () {
                    undoRedo(property, currentValue);
                }
            } else {
                infChart.commandsManager.registerCommand(xChartId, function () {
                    undoRedo(property, propertyValue);
                }, function () {
                    undoRedo(property, currentValue);
                }, undefined, false, 'changeAllFibLines');
            }
        }
        proceed.call(this, property, propertyValue, isPropertyChange);
    });

    /**
    * Wrapping up all fib level changes in fibonacci vertical retracements
    */
    infChart.util.wrap(infChart.fib2PointTimeProjection.prototype, 'changeAllFibLines', function (proceed, property, propertyValue, isPropertyChange) {
        if (isPropertyChange) {
            var drawingId = this.drawingId;
            var xChartId = this.stockChartId;
            var lastAction = infChart.commandsManager.getLastAction(xChartId);
            var currentValue = this.getCurrentPropertyValue(undefined, property, true);

            /**
             * Execute the undo/redo with the new properties
             * @param {string} property update property name
             * @param {*} propertyValue value of updated property
             */
            function undoRedo(property, propertyValue) {
                var drawingObj = infChart.drawingsManager.getDrawingObject(xChartId, drawingId);
                proceed.call(drawingObj, property, propertyValue, false);
                var settingPanel = drawingObj.settingsPopup;
                if (settingPanel) {
                    drawingObj.updateSettings(drawingObj.getConfig());
                }
                drawingObj.onPropertyChange();
            }

            if (lastAction && lastAction.actionType === 'changeAllFibLines' && !lastAction.freezeUpdatingSame) {
                lastAction.action = function () {
                    undoRedo(property, currentValue);
                }
            } else {
                infChart.commandsManager.registerCommand(xChartId, function () {
                    undoRedo(property, propertyValue);
                }, function () {
                    undoRedo(property, currentValue);
                }, undefined, false, 'changeAllFibLines');
            }
        }
        proceed.call(this, property, propertyValue, isPropertyChange);
    });

    /**
     * Wrapping up fib level changes in fibonacci vertical retracements
     */
    infChart.util.wrap(infChart.fibVerRetracementsDrawing.prototype, 'changeFibLine', function (proceed, level, property, propertyValue, isAll, isPropertyChange) {
        if (isPropertyChange) {
            var drawingId = this.drawingId;
            var xChartId = this.stockChartId;
            var lastAction = infChart.commandsManager.getLastAction(xChartId);
            var currentValue = this.getCurrentPropertyValue(level, property, false);

            /**
             * Execute the undo/redo with the new properties
             * @param {string} level id of fib level
             * @param {string} property update property name
             * @param {*} propertyValue value of updated property
             */
            function undoRedo(level, property, propertyValue) {
                var drawingObj = infChart.drawingsManager.getDrawingObject(xChartId, drawingId);
                proceed.call(drawingObj, level, property, propertyValue, isAll, false);
                var settingPanel = drawingObj.settingsPopup;
                if (settingPanel) {
                    drawingObj.updateSettings(drawingObj.getConfig());
                }
                drawingObj.onPropertyChange();
            }

            if (lastAction && lastAction.actionType === 'changeFibLine' && !lastAction.freezeUpdatingSame) {
                lastAction.action = function () {
                    undoRedo(level, property, currentValue);
                }
            } else {
                infChart.commandsManager.registerCommand(xChartId, function () {
                    undoRedo(level, property, propertyValue);
                }, function () {
                    undoRedo(level, property, currentValue);
                }, undefined, false, 'changeFibLine');
            }
        }
        proceed.call(this, level, property, propertyValue, isAll, isPropertyChange);
    });

    /**
     * Wrapping up fib level changes in fibonacci 3 point time projection tool
     */
    infChart.util.wrap(infChart.fib3PointTimeProjection.prototype, 'changeFibLine', function (proceed, level, property, propertyValue, isAll, isPropertyChange) {
        if (isPropertyChange) {
            var drawingId = this.drawingId;
            var xChartId = this.stockChartId;
            var lastAction = infChart.commandsManager.getLastAction(xChartId);
            var currentValue = this.getCurrentPropertyValue(level, property, false);

            /**
             * Execute the undo/redo with the new properties
             * @param {string} level id of fib level
             * @param {string} property update property name
             * @param {*} propertyValue value of updated property
             */
            function undoRedo(level, property, propertyValue) {
                var drawingObj = infChart.drawingsManager.getDrawingObject(xChartId, drawingId);
                proceed.call(drawingObj, level, property, propertyValue, isAll, false);
                var settingPanel = drawingObj.settingsPopup;
                if (settingPanel) {
                    drawingObj.updateSettings(drawingObj.getConfig());
                }
                drawingObj.onPropertyChange();
            }

            if (lastAction && lastAction.actionType === 'changeFibLine' && !lastAction.freezeUpdatingSame) {
                lastAction.action = function () {
                    undoRedo(level, property, currentValue);
                }
            } else {
                infChart.commandsManager.registerCommand(xChartId, function () {
                    undoRedo(level, property, propertyValue);
                }, function () {
                    undoRedo(level, property, currentValue);
                }, undefined, false, 'changeFibLine');
            }
        }
        proceed.call(this, level, property, propertyValue, isAll, isPropertyChange);
    });

    /**
     * Wrapping up fib level changes in fibonacci 2 point time projection tool
     */
    infChart.util.wrap(infChart.fib2PointTimeProjection.prototype, 'changeFibLine', function (proceed, level, property, propertyValue, isAll, isPropertyChange) {
        if (isPropertyChange) {
            var drawingId = this.drawingId;
            var xChartId = this.stockChartId;
            var lastAction = infChart.commandsManager.getLastAction(xChartId);
            var currentValue = this.getCurrentPropertyValue(level, property, false);

            /**
             * Execute the undo/redo with the new properties
             * @param {string} level id of fib level
             * @param {string} property update property name
             * @param {*} propertyValue value of updated property
             */
            function undoRedo(level, property, propertyValue) {
                var drawingObj = infChart.drawingsManager.getDrawingObject(xChartId, drawingId);
                proceed.call(drawingObj, level, property, propertyValue, isAll, false);
                var settingPanel = drawingObj.settingsPopup;
                if (settingPanel) {
                    drawingObj.updateSettings(drawingObj.getConfig());
                }
                drawingObj.onPropertyChange();
            }

            if (lastAction && lastAction.actionType === 'changeFibLine' && !lastAction.freezeUpdatingSame) {
                lastAction.action = function () {
                    undoRedo(level, property, currentValue);
                }
            } else {
                infChart.commandsManager.registerCommand(xChartId, function () {
                    undoRedo(level, property, propertyValue);
                }, function () {
                    undoRedo(level, property, currentValue);
                }, undefined, false, 'changeFibLine');
            }
        }
        proceed.call(this, level, property, propertyValue, isAll, isPropertyChange);
    });

    /**
     * Wrapping up mode change in fibonacci vertical retracements
     */
    infChart.util.wrap(infChart.fibVerRetracementsDrawing.prototype, 'changeMode', function (proceed, enabled, isPropertyChange) {
        if (isPropertyChange) {
            var drawingId = this.drawingId;
            var xChartId = this.stockChartId;
            var currentVisibility = !enabled;

            function undoRedo(newVisibility) {
                var drawingObj = infChart.drawingsManager.getDrawingObject(xChartId, drawingId);
                proceed.call(drawingObj, newVisibility, false);
                var settingPanel = drawingObj.settingsPopup;
                if (settingPanel) {
                    drawingObj.updateSettings(drawingObj.getConfig());
                }
                drawingObj.onPropertyChange();
            }

            infChart.commandsManager.registerCommand(xChartId, function () {
                undoRedo(enabled);
            }, function () {
                undoRedo(currentVisibility);
            }, undefined, false, 'changeMode');
        }
        proceed.call(this, enabled, isPropertyChange);
    });

    infChart.util.wrap(infChart.fibVerRetracementsDrawing.prototype, 'changeAllFibLabels', function (proceed, property, propertyValue, isPropertyChange) {
        if (isPropertyChange) {
            var drawingId = this.drawingId;
            var xChartId = this.stockChartId;
            var lastAction = infChart.commandsManager.getLastAction(xChartId);
            var currentValue = this.getCurrentPropertyValue(undefined, property, true);

            /**
             * Execute the undo/redo with the new properties
             * @param {string} property update property name
             * @param {*} propertyValue value of updated property
             */
             function undoRedo(property, propertyValue) {
                var drawingObj = infChart.drawingsManager.getDrawingObject(xChartId, drawingId);
                proceed.call(drawingObj, property, propertyValue, false);
                var settingPanel = drawingObj.settingsPopup;
                if (settingPanel) {
                    drawingObj.updateSettings(drawingObj.getConfig());
                }
                drawingObj.onPropertyChange();
            }

            if (lastAction && lastAction.actionType === 'changeAllFibLabels' && !lastAction.freezeUpdatingSame) {
                lastAction.action = function () {
                    undoRedo(property, currentValue);
                }
            } else {
                infChart.commandsManager.registerCommand(xChartId, function () {
                    undoRedo(property, propertyValue);
                }, function () {
                    undoRedo(property, currentValue);
                }, undefined, false, 'changeAllFibLabels');
            }
        }
        proceed.call(this, property, propertyValue, isPropertyChange);
    });

    /**
     * Wrapping up the infChart.fibVerRetracementsDrawing.prototype.eraseFibLevel to catch the fib level erase
     */
    infChart.util.wrap(infChart.fibVerRetracementsDrawing.prototype, 'eraseFibLevel', function (proceed, level, checked, isPropertyChange, ignoreSettingsSave) {
        if (isPropertyChange) {
            var drawingId = this.drawingId;
            var xChartId = this.stockChartId;
            var lastAction = infChart.commandsManager.getLastAction(xChartId);
            var lastLevel = level;
            var lastchecked = !checked;

            /**
             * Execute the undo/redo with the new properties
             * @param {string} level id of fib level
             * @param {boolean} the checkbox value
             * @param {*} ignoreSettingsSave - ignore setting save
             */
            function undoRedo(level, checked, ignoreSettingsSave) {
                var drawingObj = infChart.drawingsManager.getDrawingObject(xChartId, drawingId);
                proceed.call(drawingObj, level, checked, false, ignoreSettingsSave);
                var settingPanel = drawingObj.settingsPopup;
                if (settingPanel) {
                    drawingObj.updateSettings(drawingObj.getConfig());
                }
                drawingObj.onPropertyChange();
            }

            if (lastAction && lastAction.actionType === 'eraseFibLevel_fibVerRetrancement' && !lastAction.freezeUpdatingSame) {
                lastAction.action = function () {
                    undoRedo(level, checked, ignoreSettingsSave);
                }
            } else {
                infChart.commandsManager.registerCommand(xChartId, function () {
                    undoRedo(level, checked, ignoreSettingsSave);
                }, function () {
                    undoRedo(lastLevel, lastchecked, ignoreSettingsSave);
                }, undefined, false, 'eraseFibLevel_fibVerRetrancement');
            }
        }
        proceed.call(this, level, checked, isPropertyChange, ignoreSettingsSave);
    });

    /**
     * Wrapping up the infChart.fib2PointTimeProjection.prototype.eraseFibLevel to catch the fib level erase
     */
    infChart.util.wrap(infChart.fib2PointTimeProjection.prototype, 'eraseFibLevel', function (proceed, level, checked, isPropertyChange, ignoreSettingsSave) {
        if (isPropertyChange) {
            var drawingId = this.drawingId;
            var xChartId = this.stockChartId;
            var lastAction = infChart.commandsManager.getLastAction(xChartId);
            var lastLevel = level;
            var lastchecked = !checked;

            /**
             * Execute the undo/redo with the new properties
             * @param {string} level id of fib level
             * @param {boolean} the checkbox value
             * @param {*} ignoreSettingsSave - ignore setting save
             */
            function undoRedo(level, checked, ignoreSettingsSave) {
                var drawingObj = infChart.drawingsManager.getDrawingObject(xChartId, drawingId);
                proceed.call(drawingObj, level, checked, false, ignoreSettingsSave);
                var settingPanel = drawingObj.settingsPopup;
                if (settingPanel) {
                    drawingObj.updateSettings(drawingObj.getConfig());
                }
                drawingObj.onPropertyChange();
            }

            if (lastAction && lastAction.actionType === 'eraseFibLevel_fib2PointTimeProjection' && !lastAction.freezeUpdatingSame) {
                lastAction.action = function () {
                    undoRedo(level, checked, ignoreSettingsSave);
                }
            } else {
                infChart.commandsManager.registerCommand(xChartId, function () {
                    undoRedo(level, checked, ignoreSettingsSave);
                }, function () {
                    undoRedo(lastLevel, lastchecked, ignoreSettingsSave);
                }, undefined, false, 'eraseFibLevel_fib2PointTimeProjection');
            }
        }
        proceed.call(this, level, checked, isPropertyChange, ignoreSettingsSave);
    });

    /**
     * Wrapping up the infChart.fib3PointTimeProjection.prototype.eraseFibLevel to catch the fib level erase
     */
    infChart.util.wrap(infChart.fib3PointTimeProjection.prototype, 'eraseFibLevel', function (proceed, level, checked, isPropertyChange, ignoreSettingsSave) {
        if (isPropertyChange) {
            var drawingId = this.drawingId;
            var xChartId = this.stockChartId;
            var lastAction = infChart.commandsManager.getLastAction(xChartId);
            var lastLevel = level;
            var lastchecked = !checked;

            /**
             * Execute the undo/redo with the new properties
             * @param {string} level id of fib level
             * @param {boolean} the checkbox value
             * @param {*} ignoreSettingsSave - ignore setting save
             */
            function undoRedo(level, checked, ignoreSettingsSave) {
                var drawingObj = infChart.drawingsManager.getDrawingObject(xChartId, drawingId);
                proceed.call(drawingObj, level, checked, false, ignoreSettingsSave);
                var settingPanel = drawingObj.settingsPopup;
                if (settingPanel) {
                    drawingObj.updateSettings(drawingObj.getConfig());
                }
                drawingObj.onPropertyChange();
            }

            if (lastAction && lastAction.actionType === 'eraseFibLevel_fib3PointTimeProjection' && !lastAction.freezeUpdatingSame) {
                lastAction.action = function () {
                    undoRedo(level, checked, ignoreSettingsSave);
                }
            } else {
                infChart.commandsManager.registerCommand(xChartId, function () {
                    undoRedo(level, checked, ignoreSettingsSave);
                }, function () {
                    undoRedo(lastLevel, lastchecked, ignoreSettingsSave);
                }, undefined, false, 'eraseFibLevel_fib3PointTimeProjection');
            }
        }
        proceed.call(this, level, checked, isPropertyChange, ignoreSettingsSave);
    });

    infChart.util.wrap(infChart.fibVerRetracementsDrawing.prototype, 'changeFibLabel', function (proceed, level, property, propertyValue, isAll, isPropertyChange) {
        if (isPropertyChange) {
            var drawingId = this.drawingId;
            var xChartId = this.stockChartId;
            var lastAction = infChart.commandsManager.getLastAction(xChartId);
            var currentValue = this.getCurrentPropertyValue(level, property, false);

            /**
             * Execute the undo/redo with the new properties
             * @param {string} level id of fib level
             * @param {string} property update property name
             * @param {*} propertyValue value of updated property
             */
            function undoRedo(level, property, propertyValue) {
                var drawingObj = infChart.drawingsManager.getDrawingObject(xChartId, drawingId);
                proceed.call(drawingObj, level, property, propertyValue, isAll, false);
                var settingPanel = drawingObj.settingsPopup;
                if (settingPanel) {
                    drawingObj.updateSettings(drawingObj.getConfig());
                }
                drawingObj.onPropertyChange();
            }

            if (lastAction && lastAction.actionType === 'changeFibLabel' && !lastAction.freezeUpdatingSame) {
                lastAction.action = function () {
                    undoRedo(level, property, currentValue);
                }
            } else {
                infChart.commandsManager.registerCommand(xChartId, function () {
                    undoRedo(level, property, propertyValue);
                }, function () {
                    undoRedo(level, property, currentValue);
                }, undefined, false, 'changeFibLabel');
            }
        }
        proceed.call(this, level, property, propertyValue, isAll, isPropertyChange);
    });

    //endregion---------------end of Fibonacci settings-----------------------------------------------------------------

    //region label settings
    /**
     * Wrapping up the infChart.drawingUtils.common.settings.onColorChange to catch the line width changes
     */
    infChart.util.wrap(infChart.labelDrawing.prototype, 'onColorChange', function (proceed, rgb, color, isPropertyChange) {

        if (isPropertyChange && !infChart.drawingsManager.getIsActiveDrawingInprogress()) {
            var drawingId = this.drawingId;
            var ann = this.annotation;
            var xChartId = _getChartIdFromHighchartInstance(ann.chart);
            var currentColor = ann.options.title.style["color"];
            var lastAction = infChart.commandsManager.getLastAction(xChartId);

            /**
             * Execute the undo/redo with the new properties
             * @param {string} newColor new color to set
             */
            function undoRedo(newColor) {
                var drawingObj = infChart.drawingsManager.getDrawingObject(xChartId, drawingId);
                var settingPanel = drawingObj.settingsPopup;
                if (settingPanel) {
                    var colorSelectorElm = settingPanel.find("[inf-ctrl=colorPicker]");
                    if (colorSelectorElm.length > 0) {
                        settingPanel.data("infUndoRedo", true);
                        colorSelectorElm.mainColorPanel("value", {color: newColor})
                    } else {
                        proceed.call(drawingObj, rgb, newColor, false);
                    }
                } else {
                    proceed.call(drawingObj, rgb, newColor, false);
                }
                drawingObj.onPropertyChange();
            }

            if (lastAction && lastAction.actionType === 'onColorChange_label' && !lastAction.freezeUpdatingSame) {
                lastAction.action = function () {
                    undoRedo(color);
                }
            } else {
                infChart.commandsManager.registerCommand(xChartId, function () {
                    undoRedo(color);
                }, function () {
                    undoRedo(currentColor);
                }, undefined, false, 'onColorChange_label');
            }
        }

        proceed.call(this, rgb, color, isPropertyChange);
    });

    infChart.util.wrap(infChart.labelDrawing.prototype, 'onBorderColorChange', function (proceed, rgb, color, opacity, checked, isPropertyChange) {

        if (isPropertyChange && !infChart.drawingsManager.getIsActiveDrawingInprogress()) {
            var drawingId = this.drawingId;
            var ann = this.annotation;
            var xChartId = _getChartIdFromHighchartInstance(ann.chart);
            var currentColor = ann.options.title.borderAttributes["stroke"];
            var lastChecked = checked;
            var lastAction = infChart.commandsManager.getLastAction(xChartId);

            /**
             * Execute the undo/redo with the new properties
             * @param {string} newColor new color to set
             */
            function undoRedo(newColor, checked) {
                var drawingObj = infChart.drawingsManager.getDrawingObject(xChartId, drawingId);
                var settingPanel = drawingObj.settingsPopup;
                if (settingPanel) {
                    var borderColorSelectorElm = settingPanel.find("[inf-ctrl=borderColorPicker]");
                    if (borderColorSelectorElm.length > 0) {
                        settingPanel.data("infUndoRedo", true);
                        borderColorSelectorElm.mainColorPanel("value", {color: newColor})
                    } else {
                        proceed.call(drawingObj, rgb, newColor, opacity, checked, false);
                    }
                } else {
                    proceed.call(drawingObj, rgb, newColor, opacity, checked, false);
                }
                drawingObj.onPropertyChange();
            }

            if (lastAction && lastAction.actionType === 'onBorderColorChange_label' && !lastAction.freezeUpdatingSame) {
                lastAction.action = function () {
                    undoRedo(color, checked);
                }
            } else {
                infChart.commandsManager.registerCommand(xChartId, function () {
                    undoRedo(color, checked);
                }, function () {
                    undoRedo(currentColor, lastChecked);
                }, undefined, false, 'onBorderColorChange_label');
            }
        }

        proceed.call(this, rgb, color, opacity, checked, isPropertyChange);
    });

    infChart.util.wrap(infChart.labelDrawing.prototype, 'onBackgroundColorChange', function (proceed, rgb, color, opacity, checked, isPropertyChange) {

        if (isPropertyChange && !infChart.drawingsManager.getIsActiveDrawingInprogress()) {
            var drawingId = this.drawingId;
            var ann = this.annotation;
            var xChartId = _getChartIdFromHighchartInstance(ann.chart);
            var currentColor = ann.options.title.borderAttributes["fill"];
            var lastChecked = checked;
            var lastAction = infChart.commandsManager.getLastAction(xChartId);

            /**
             * Execute the undo/redo with the new properties
             * @param {string} newColor new color to set
             */
            function undoRedo(newColor, checked) {
                var drawingObj = infChart.drawingsManager.getDrawingObject(xChartId, drawingId);
                var settingPanel = drawingObj.settingsPopup;
                if (settingPanel) {
                    var backgroundColorSelectorElm = settingPanel.find("[inf-ctrl=backgroundColorPicker]");
                    if (backgroundColorSelectorElm.length > 0) {
                        settingPanel.data("infUndoRedo", true);
                        backgroundColorSelectorElm.mainColorPanel("value", {color: newColor})
                    } else {
                        proceed.call(drawingObj, rgb, newColor, opacity, checked, false);
                    }
                } else {
                    proceed.call(drawingObj, rgb, newColor, opacity, checked, false);
                }
                drawingObj.onPropertyChange();
            }

            if (lastAction && lastAction.actionType === 'onBackgroundColorChange_label' && !lastAction.freezeUpdatingSame) {
                lastAction.action = function () {
                    undoRedo(color, checked);
                }
            } else {
                infChart.commandsManager.registerCommand(xChartId, function () {
                    undoRedo(color, checked);
                }, function () {
                    undoRedo(currentColor, lastChecked);
                }, undefined, false, 'onBackgroundColorChange_label');
            }
        }

        proceed.call(this, rgb, color, opacity, checked, isPropertyChange);
    });

    infChart.util.wrap(infChart.labelDrawing.prototype, 'onApplyBorderColor', function (proceed, propertyValue, color, isPropertyChange) {

        if (isPropertyChange && !infChart.drawingsManager.getIsActiveDrawingInprogress()) {
            var drawingId = this.drawingId;
            var ann = this.annotation;
            var xChartId = _getChartIdFromHighchartInstance(ann.chart);
            var currentColor = ann.options.title.borderAttributes["stroke"];
            var currentProperty = !propertyValue;
            var lastAction = infChart.commandsManager.getLastAction(xChartId);

            /**
             * Execute the undo/redo with the new properties
             * @param {string} newColor new color to set
             */
            function undoRedo(newPropertyValue ,newColor) {
                var drawingObj = infChart.drawingsManager.getDrawingObject(xChartId, drawingId);
                var settingPanel = drawingObj.settingsPopup;
                if (settingPanel) {
                    var borderColorEnabledElm = settingPanel.find("[inf-ctrl=borderColorEnabled]");
                    if (borderColorEnabledElm.length > 0) {
                        settingPanel.data("infUndoRedo", true);
                        borderColorEnabledElm.trigger("click");
                    } else {
                        proceed.call(drawingObj, newPropertyValue ,newColor, false);
                    }
                } else {
                    proceed.call(drawingObj, newPropertyValue ,newColor, false);
                }
                drawingObj.onPropertyChange();
            }

            if (lastAction && lastAction.actionType === 'onApplyBorderColor_label' && !lastAction.freezeUpdatingSame) {
                lastAction.action = function () {
                    undoRedo(propertyValue, color);
                }
            } else {
                infChart.commandsManager.registerCommand(xChartId, function () {
                    undoRedo(propertyValue, color);
                }, function () {
                    undoRedo(currentProperty, currentColor);
                }, undefined, false, 'onApplyBorderColor_label');
            }
        }

        proceed.call(this, propertyValue, color, isPropertyChange);
    });

    infChart.util.wrap(infChart.labelDrawing.prototype, 'onApplyBackgroundColor', function (proceed, propertyValue, color, isPropertyChange) {

        if (isPropertyChange && !infChart.drawingsManager.getIsActiveDrawingInprogress()) {
            var drawingId = this.drawingId;
            var ann = this.annotation;
            var xChartId = _getChartIdFromHighchartInstance(ann.chart);
            var currentColor = ann.options.title.borderAttributes["fill"];
            var currentProperty = !propertyValue;
            var lastAction = infChart.commandsManager.getLastAction(xChartId);

            /**
             * Execute the undo/redo with the new properties
             * @param {string} newColor new color to set
             */
            function undoRedo(newPropertyValue, newColor) {
                var drawingObj = infChart.drawingsManager.getDrawingObject(xChartId, drawingId);
                var settingPanel = drawingObj.settingsPopup;
                if (settingPanel) {
                    var backgroundColorEnableElm = settingPanel.find("[inf-ctrl=backgroundColorEnabled]");
                    if (backgroundColorEnableElm.length > 0) {
                        settingPanel.data("infUndoRedo", true);
                        backgroundColorEnableElm.trigger("click");
                    } else {
                        proceed.call(drawingObj, newPropertyValue, newColor, false);
                    }
                } else {
                    proceed.call(drawingObj, newPropertyValue, newColor, false);
                }
                drawingObj.onPropertyChange();
            }

            if (lastAction && lastAction.actionType === 'onApplyBackgroundColor_label' && !lastAction.freezeUpdatingSame) {
                lastAction.action = function () {
                    undoRedo(propertyValue, color);
                }
            } else {
                infChart.commandsManager.registerCommand(xChartId, function () {
                    undoRedo(propertyValue, color);
                }, function () {
                    undoRedo(currentProperty, currentColor);
                }, undefined, false, 'onApplyBackgroundColor_label');
            }
        }

        proceed.call(this, propertyValue, color, isPropertyChange);
    });

    /**
     * Wrapping up the infChart.labelDrawing.prototype.onFibLineWidthChange to catch the line width changes
     */
     infChart.util.wrap(infChart.labelDrawing.prototype, 'onFontSizeChange', function (proceed, fontSize, isPropertyChange) {

        if (isPropertyChange && !infChart.drawingsManager.getIsActiveDrawingInprogress()) {
            var drawingId = this.drawingId;
            var ann = this.annotation;
            var xChartId = _getChartIdFromHighchartInstance(ann.chart);
            var currentFontSize = this.fontSize;

            /**
             * Execute the undo/redo with the new properties
             * @param {string} control expression to find the related control
             * @param {number} newFontSize indicate new font size
             */
            function undoRedo(fontSize) {
                var drawingObj = infChart.drawingsManager.getDrawingObject(xChartId, drawingId);
                var settingPanel = drawingObj.settingsPopup;
                if (settingPanel) {
                    var fontSizeSelectorElm = settingPanel.find("[inf-ctrl=fontSize][inf-size='" + fontSize + "']");
                    if (fontSizeSelectorElm.length > 0) {
                        settingPanel.data("infUndoRedo", true);
                        fontSizeSelectorElm.trigger("click")
                    } else {
                        proceed.call(drawingObj, fontSize, false);
                    }
                } else {
                    proceed.call(drawingObj, fontSize, false);
                }
                drawingObj.onPropertyChange();
            }

            infChart.commandsManager.registerCommand(xChartId, function () {
                undoRedo(fontSize);
            }, function () {
                undoRedo(currentFontSize);
            }, undefined, false, 'onFontSizeChange_label');
        }

        proceed.call(this, fontSize, isPropertyChange);

    });

        /**
     * Wrapping up the infChart.drawingUtils.common.settings.onLabelTextColorChange to catch the line width changes
     */
        infChart.util.wrap(infChart.drawingUtils.common.settings, "onLabelTextColorChange", function (proceed, rgb, value, isPropertyChange) {
            if (isPropertyChange && !infChart.drawingsManager.getIsActiveDrawingInprogress()) {
                var drawingId = this.drawingId;
                var ann = this.annotation;
                var xChartId = _getChartIdFromHighchartInstance(ann.chart);
                var currentTextColor = ann.options.textColor;
                var lastAction = infChart.commandsManager.getLastAction(xChartId);

                function undoRedo(rgb, newColor) {
                    var drawingObj = infChart.drawingsManager.getDrawingObject(xChartId, drawingId);
                    var settingsPanel = drawingObj.settingsPopup;
                    if (settingsPanel) {
                        var textColorChangeElm = settingsPanel.find("[inf-ctrl=textColorPicker]");
                        if (textColorChangeElm.length > 0) {
                            settingsPanel.data("infUndoRedo", true);
                            settingsPanel.find("[inf-ctrl=textColorPicker]").mainColorPanel("value", {
                                color: newColor
                            });
                        } else {
                            proceed.call(drawingObj, rgb, newColor, false);
                        }
                    } else {
                        proceed.call(drawingObj, rgb, newColor, false);
                    }
                    drawingObj.onPropertyChange();
                }

                if (lastAction && lastAction.actionType === 'onLabelTextColorChange' && !lastAction.freezeUpdatingSame) {
                    lastAction.action = function () {
                        undoRedo(value);
                    }
                } else {
                    infChart.commandsManager.registerCommand(xChartId, function () {
                        undoRedo(rgb, value);
                    }, function () {
                        undoRedo(rgb, currentTextColor);
                    }, undefined, false, "onLabelTextColorChange");
                }
            }
            proceed.call(this, rgb, value, isPropertyChange);
        });

        /**
     * Wrapping up the infChart.drawingUtils.common.settings.onLabelTextSizeChange to catch the line width changes
     */
        infChart.util.wrap(infChart.drawingUtils.common.settings, 'onLabelTextSizeChange', function (proceed, fontSize, isPropertyChange) {

            if (isPropertyChange && !infChart.drawingsManager.getIsActiveDrawingInprogress()) {
                var drawingId = this.drawingId;
                var ann = this.annotation;
                var xChartId = _getChartIdFromHighchartInstance(ann.chart);
                var currentFontSize = ann.options.textFontSize;

                /**
                 * Execute the undo/redo with the new properties
                 * @param {string} control expression to find the related control
                 * @param {number} newFontSize indicate new font size
                 */
                function undoRedo(fontSize) {
                    var drawingObj = infChart.drawingsManager.getDrawingObject(xChartId, drawingId);
                    var settingPanel = drawingObj.settingsPopup;
                    if (settingPanel) {
                        var fontSizeSelectorElm = settingPanel.find("[inf-ctrl=fontSize][inf-size='" + fontSize + "']");
                        if (fontSizeSelectorElm.length > 0) {
                            settingPanel.data("infUndoRedo", true);
                            fontSizeSelectorElm.trigger("click")
                        } else {
                            proceed.call(drawingObj, fontSize, false);
                        }
                    } else {
                        proceed.call(drawingObj, fontSize, false);
                    }
                    drawingObj.onPropertyChange();
                }

                infChart.commandsManager.registerCommand(xChartId, function () {
                    undoRedo(fontSize);
                }, function () {
                    undoRedo(currentFontSize);
                }, undefined, false, 'onLabelTextSizeChange');
            }

            proceed.call(this, fontSize, isPropertyChange);

        });

        /**
     * Wrapping up the infChart.drawingUtils.common.settings.onTextSizeChange to catch the line width changes
     */
        infChart.util.wrap(infChart.drawingUtils.common.settings, 'onTextSizeChange', function (proceed, fontSize, isPropertyChange) {

            if (isPropertyChange && !infChart.drawingsManager.getIsActiveDrawingInprogress()) {
                var drawingId = this.drawingId;
                var ann = this.annotation;
                var xChartId = _getChartIdFromHighchartInstance(ann.chart);
                var currentFontSize = ann.options.textFontSize;

                /**
                 * Execute the undo/redo with the new properties
                 * @param {string} control expression to find the related control
                 * @param {number} newFontSize indicate new font size
                 */
                function undoRedo(fontSize) {
                    var drawingObj = infChart.drawingsManager.getDrawingObject(xChartId, drawingId);
                    var settingPanel = drawingObj.settingsPopup;
                    if (settingPanel) {
                        var fontSizeSelectorElm = settingPanel.find("[inf-ctrl=fontSize][inf-size='" + fontSize + "']");
                        if (fontSizeSelectorElm.length > 0) {
                            settingPanel.data("infUndoRedo", true);
                            fontSizeSelectorElm.trigger("click")
                        } else {
                            proceed.call(drawingObj, fontSize, false);
                        }
                    } else {
                        proceed.call(drawingObj, fontSize, false);
                    }
                    drawingObj.onPropertyChange();
                }

                infChart.commandsManager.registerCommand(xChartId, function () {
                    undoRedo(fontSize);
                }, function () {
                    undoRedo(currentFontSize);
                }, undefined, false, 'onTextSizeChange_basic');
            }

            proceed.call(this, fontSize, isPropertyChange);

        });

        /**
     * Wrapping up the infChart.drawingUtils.common.settings.onTextColorChange to catch the line width changes
     */
        infChart.util.wrap(infChart.drawingUtils.common.settings, "onTextColorChange", function (proceed, rgb, value, isPropertyChange) {
            if (isPropertyChange && !infChart.drawingsManager.getIsActiveDrawingInprogress()) {
                var drawingId = this.drawingId;
                var ann = this.annotation;
                var xChartId = _getChartIdFromHighchartInstance(ann.chart);
                var currentTextColor = ann.options.textColor;
                var lastAction = infChart.commandsManager.getLastAction(xChartId);

                function undoRedo(rgb, newColor) {
                    var drawingObj = infChart.drawingsManager.getDrawingObject(xChartId, drawingId);
                    var settingsPanel = drawingObj.settingsPopup;
                    if (settingsPanel) {
                        var textColorChangeElm = settingsPanel.find("[inf-ctrl=textColorPicker]");
                        if (textColorChangeElm.length > 0) {
                            settingsPanel.data("infUndoRedo", true);
                            settingsPanel.find("[inf-ctrl=textColorPicker]").mainColorPanel("value", {
                                color: newColor
                            });
                        } else {
                            proceed.call(drawingObj, rgb, newColor, false);
                        }
                    } else {
                        proceed.call(drawingObj, rgb, newColor, false);
                    }
                    drawingObj.onPropertyChange();
                }

                if (lastAction && lastAction.actionType === 'onTextColorChange_basic' && !lastAction.freezeUpdatingSame) {
                    lastAction.action = function () {
                        undoRedo(rgb, value);
                    }
                } else {
                    infChart.commandsManager.registerCommand(xChartId, function () {
                        undoRedo(rgb, value);
                    }, function () {
                        undoRedo(rgb, currentTextColor);
                    }, undefined, false, "onTextColorChange_basic");
                }
            }
            proceed.call(this, rgb, value, isPropertyChange);
        });

    /**
     * Wrapping up the infChart.labelDrawing.prototype.onFontStyleChange to catch the line width changes
     */
    infChart.util.wrap(infChart.labelDrawing.prototype, 'onFontStyleChange', function (proceed, style, isSelected, isPropertyChange) {
        proceed.call(this, style, isSelected, isPropertyChange);
        if (isPropertyChange && !infChart.drawingsManager.getIsActiveDrawingInprogress()) {
            var drawingId = this.drawingId;
            var ann = this.annotation;
            var xChartId = _getChartIdFromHighchartInstance(ann.chart);

            /**
             * Execute the undo/redo with the new properties
             * @param {boolean} newIsSelected if font type is selected or not
             */
            function undoRedo(newIsSelected) {
                var drawingObj = infChart.drawingsManager.getDrawingObject(xChartId, drawingId);
                var settingPanel = drawingObj.settingsPopup;
                if (settingPanel) {
                    var fontStyleSelectorElm = settingPanel.find("[inf-ctrl=fontStyle][inf-style='" + style + "']");
                    if (fontStyleSelectorElm.length > 0) {
                        settingPanel.data("infUndoRedo", true);
                        fontStyleSelectorElm.trigger("click");
                    } else {
                        proceed.call(drawingObj, style, newIsSelected, false);
                    }
                } else {
                    proceed.call(drawingObj, style, newIsSelected, false);
                }
                drawingObj.onPropertyChange();
            }

            infChart.commandsManager.registerCommand(xChartId, function () {
                undoRedo(isSelected);
            }, function () {
                undoRedo(!isSelected);
            }, undefined, false, 'onFontStyleChange_label');

        }

    });

    /**
     * Wrapping up the infChart.labelDrawing.prototype.onFontStyleChange to catch the line width changes
     */
    infChart.util.wrap(infChart.labelDrawing.prototype, 'onSettingsTextChange', function (proceed, text, isPropertyChange) {
        var drawingId = this.drawingId;
        var ann = this.annotation;
        var xChartId = _getChartIdFromHighchartInstance(ann.chart);
        var currentText = ann.options.textValue;
        isPropertyChange = text !== "" && currentText !== text;
        
        if (isPropertyChange && !infChart.drawingsManager.getIsActiveDrawingInprogress()) {
            /**
             * Execute the undo/redo with the new properties
             * @param {string} newText new text being set
             */
            function undoRedo(newText) {
                var drawingObj = infChart.drawingsManager.getDrawingObject(xChartId, drawingId);
                var settingPanel = drawingObj.settingsPopup;

                proceed.call(drawingObj, newText, false);
                if (settingPanel) {
                    infChart.structureManager.drawingTools.updateLabelSettings(settingPanel, undefined, newText, undefined, undefined, undefined, undefined, undefined, true);
                }
                drawingObj.onPropertyChange();
            }

            infChart.commandsManager.registerCommand(xChartId, function () {
                undoRedo(text);
            }, function () {
                undoRedo(currentText);
            }, undefined, false, 'onTextChange_label');

        }
        return proceed.call(this, text, isPropertyChange);

    });
    //endregion

    //region high low labels settings
    /**
     * Wrapping up the infChart.drawingUtils.common.settings.onColorChange to catch the line width changes
     */
    infChart.util.wrap(infChart.highLowLabels.prototype, 'onColorChange', function (proceed, rgb, color, isPropertyChange) {

        if (isPropertyChange && !infChart.drawingsManager.getIsActiveDrawingInprogress()) {
            var drawingId = this.drawingId;
            var ann = this.annotation;
            var xChartId = _getChartIdFromHighchartInstance(ann.chart);
            var currentColor = ann.options.title.style["color"];
            var lastAction = infChart.commandsManager.getLastAction(xChartId);

            /**
             * Execute the undo/redo with the new properties
             * @param {string} newColor new color to set
             */
            function undoRedo(newColor) {
                var drawingObj = infChart.drawingsManager.getDrawingObject(xChartId, drawingId);
                var settingPanel = drawingObj.settingsPopup;
                if (settingPanel) {
                    var colorSelectorElm = settingPanel.find("[inf-ctrl=colorPicker]");
                    if (colorSelectorElm.length > 0) {
                        settingPanel.data("infUndoRedo", true);
                        colorSelectorElm.mainColorPanel("value", {color: newColor})
                    } else {
                        proceed.call(drawingObj, rgb, newColor, false);
                    }
                } else {
                    proceed.call(drawingObj, rgb, newColor, false);
                }
                drawingObj.onPropertyChange();
            }

            if (lastAction && lastAction.actionType === 'onColorChange_label' && !lastAction.freezeUpdatingSame) {
                lastAction.action = function () {
                    undoRedo(color);
                }
            } else {
                infChart.commandsManager.registerCommand(xChartId, function () {
                    undoRedo(color);
                }, function () {
                    undoRedo(currentColor);
                }, undefined, false, 'onColorChange_label');
            }
        }

        proceed.call(this, rgb, color, isPropertyChange);
    });

    infChart.util.wrap(infChart.highLowLabels.prototype, 'onLabelItemsChange', function (proceed, labelItemId, value, isPropertyChange) {
        if (isPropertyChange) {
            var self = this;
            var ann = self.annotation;
            var options = ann.options;
            var labelDataItem = options.labelDataItems.find(function (labelDataItem) {
                return labelDataItem.id === labelItemId;
            });
            var currentValue = labelDataItem.enabled;

            /**
             * Execute the undo/redo with the new properties
             * @param {string} labelItemId label id
             * @param {string} value 
             */
            function undoRedo(labelItemId, value) {
                var settingPanel = self.settingsPopup;
                if (settingPanel) {
                    var labelEnabledElm = settingPanel.find("[inf-ctrl=labelDataItem][data-value=" + labelItemId + "]");
                    if (labelEnabledElm.length > 0) {
                        settingPanel.data("infUndoRedo", true);
                        labelEnabledElm.trigger("click");
                    } else {
                        proceed.call(self, labelItemId, value, false);
                    }
                } else {
                    proceed.call(self, labelItemId, value, false);
                }
                self.onPropertyChange();
            }

            infChart.commandsManager.registerCommand(self.stockChartId, function () {
                undoRedo(labelItemId, value);
            }, function () {
                undoRedo(labelItemId, currentValue);
            }, undefined, false, 'onLabelItemsChange');
        }
        proceed.call(this, labelItemId, value, isPropertyChange);
    });

    //endregion

    //endregion end of Drawing settings


    infChart.util.wrap(infChart.drawingUtils.common.settings, 'onXabcdLineWidthChange', function (proceed, strokeWidth, isPropertyChange) {
        var ann = this.annotation;
        if ((_isTrackHistoryEnabledDrawing(ann) || _isIndicatorDrawing(ann)) && isPropertyChange) {
            var drawingId = this.drawingId;
            var xChartId = _getChartIdFromHighchartInstance(ann.chart);
            var currentWidth = ann.options.shape.params["stroke-width"];

            /**
             * Execute the undo/redo with the new properties
             * @param {number} newSize new width to set
             */
            function undoRedo(newSize) {
                var drawingObj = infChart.drawingsManager.getDrawingObject(xChartId, drawingId);
                var settingPanel = drawingObj.settingsPopup;
                if (settingPanel) {
                    var lineWidthChangeElm = settingPanel.find("[inf-ctrl=lineWidth][inf-size=" + newSize + "]");
                    if (lineWidthChangeElm.length > 0) {
                        settingPanel.data("infUndoRedo", true);
                        lineWidthChangeElm.trigger('click');
                    } else {
                        proceed.call(drawingObj, newSize);
                    }
                } else {
                    proceed.call(drawingObj, newSize);
                }
                drawingObj.onPropertyChange();
            }

            infChart.commandsManager.registerCommand(xChartId, function () {
                undoRedo(strokeWidth);
            }, function () {
                undoRedo(currentWidth);
            }, undefined, false, 'onXabcdLineWidthChange');
        }
        proceed.call(this, strokeWidth, isPropertyChange);
    });

    infChart.util.wrap(infChart.drawingUtils.common.settings, 'onXabcdFillColorChange', function (proceed, color, opacity, isPropertyChange, colorPickerRef) {
        var ann = this.annotation;
        if (_isTrackHistoryEnabledDrawing(ann) && isPropertyChange && !infChart.drawingsManager.getIsActiveDrawingInprogress()) {
            var drawingId = this.drawingId;
            var xChartId = _getChartIdFromHighchartInstance(ann.chart);
            var currentColor = ann.options.shape.params["fill"];
            var currentOpacity = ann.options.shape.params["fill-opacity"];
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
                    var fillColorChangeElm = settingPanel.find(colorPickerRef || "[inf-ctrl=fillColorPicker]");
                    if (fillColorChangeElm.length > 0) {
                        settingPanel.data("infUndoRedo", true);
                        fillColorChangeElm.mainColorPanel("value", {
                            color: newColor,
                            opacity: newOpacity
                        });
                    } else {
                        proceed.call(drawingObj, newColor, newOpacity, false, colorPickerRef);
                    }
                } else {
                    proceed.call(drawingObj, newColor, newOpacity, false, colorPickerRef);
                }
                drawingObj.onPropertyChange();
            }

            if (lastAction && lastAction.actionType === 'onXabcdFillColorChange' && !lastAction.freezeUpdatingSame) {
                lastAction.action = function () {
                    undoRedo(color, opacity);
                }
            } else {
                infChart.commandsManager.registerCommand(xChartId, function () {
                    undoRedo(color, opacity);
                }, function () {
                    undoRedo(currentColor, currentOpacity);
                }, undefined, false, 'onXabcdFillColorChange');
            }
        }
        proceed.call(this, color, opacity, isPropertyChange);
    });

    infChart.util.wrap(infChart.drawingUtils.common.settings, 'onXabcdLineColorChange', function (proceed, color, isPropertyChange, colorPickerRef) {
        var ann = this.annotation;
        if ((_isTrackHistoryEnabledDrawing(ann) || _isIndicatorDrawing(ann)) && isPropertyChange && !infChart.drawingsManager.getIsActiveDrawingInprogress()) {
            var drawingId = this.drawingId;
            var xChartId = _getChartIdFromHighchartInstance(ann.chart);
            var currentColor = ann.options.shape.params["stroke"];
            var lastAction = infChart.commandsManager.getLastAction(xChartId);

            /**
             * Execute the undo/redo with the new properties
             * @param {string} newColor color code
             */
            function undoRedo(newColor) {
                var drawingObj = infChart.drawingsManager.getDrawingObject(xChartId, drawingId);
                var settingPanel = drawingObj.settingsPopup;
                if (settingPanel) {
                    var lineColorChangeElm = settingPanel.find(colorPickerRef || "[inf-ctrl=colorPicker]");
                    if (lineColorChangeElm.length > 0) {
                        settingPanel.data("infUndoRedo", true);
                        lineColorChangeElm.mainColorPanel("value", {color: newColor});
                    } else {
                        proceed.call(drawingObj, newColor, false, colorPickerRef);
                    }
                } else {
                    proceed.call(drawingObj, newColor, false, colorPickerRef);
                }
                drawingObj.onPropertyChange();
            }

            if (lastAction && lastAction.actionType === 'onXabcdLineColorChange' && !lastAction.freezeUpdatingSame) {
                lastAction.action = function () {
                    undoRedo(color);
                }
            } else {
                infChart.commandsManager.registerCommand(xChartId, function () {
                    undoRedo(color);
                }, function () {
                    undoRedo(currentColor);
                }, undefined, false, 'onXabcdLineColorChange');
            }
        }
        proceed.call(this, color, isPropertyChange);
    });

    infChart.util.wrap(infChart.drawingUtils.common.settings, 'onAbcdLineWidthChange', function (proceed, strokeWidth, isPropertyChange) {
        var ann = this.annotation;
        if ((_isTrackHistoryEnabledDrawing(ann) || _isIndicatorDrawing(ann)) && isPropertyChange) {
            var drawingId = this.drawingId;
            var xChartId = _getChartIdFromHighchartInstance(ann.chart);
            var currentWidth = ann.options.shape.params["stroke-width"];

            /**
             * Execute the undo/redo with the new properties
             * @param {number} newSize new width to set
             */
            function undoRedo(newSize) {
                var drawingObj = infChart.drawingsManager.getDrawingObject(xChartId, drawingId);
                var settingPanel = drawingObj.settingsPopup;
                if (settingPanel) {
                    var lineWidthChangeElm = settingPanel.find("[inf-ctrl=lineWidth][inf-size=" + newSize + "]");
                    if (lineWidthChangeElm.length > 0) {
                        settingPanel.data("infUndoRedo", true);
                        lineWidthChangeElm.trigger('click');
                    } else {
                        proceed.call(drawingObj, newSize);
                    }
                } else {
                    proceed.call(drawingObj, newSize);
                }
                drawingObj.onPropertyChange();
            }

            infChart.commandsManager.registerCommand(xChartId, function () {
                undoRedo(strokeWidth);
            }, function () {
                undoRedo(currentWidth);
            }, undefined, false, 'onAbcdLineWidthChange');
        }
        proceed.call(this, strokeWidth, isPropertyChange);
    });

    infChart.util.wrap(infChart.drawingUtils.common.settings, 'onAbcdLineColorChange', function (proceed, color, isPropertyChange, colorPickerRef) {
        var ann = this.annotation;
        if ((_isTrackHistoryEnabledDrawing(ann) || _isIndicatorDrawing(ann)) && isPropertyChange && !infChart.drawingsManager.getIsActiveDrawingInprogress()) {
            var drawingId = this.drawingId;
            var xChartId = _getChartIdFromHighchartInstance(ann.chart);
            var currentColor = ann.options.shape.params["stroke"];
            var lastAction = infChart.commandsManager.getLastAction(xChartId);

            /**
             * Execute the undo/redo with the new properties
             * @param {string} newColor color code
             */
            function undoRedo(newColor) {
                var drawingObj = infChart.drawingsManager.getDrawingObject(xChartId, drawingId);
                var settingPanel = drawingObj.settingsPopup;
                if (settingPanel) {
                    var lineColorPickerElm = settingPanel.find(colorPickerRef || "[inf-ctrl=colorPicker]");
                    if (lineColorPickerElm.length > 0) {
                        settingPanel.data("infUndoRedo", true);
                        lineColorPickerElm.mainColorPanel("value", {color: newColor});
                    } else {
                        proceed.call(drawingObj, newColor, false, colorPickerRef);
                    }
                } else {
                    proceed.call(drawingObj, newColor, false, colorPickerRef);
                }
                drawingObj.onPropertyChange();
            }

            if (lastAction && lastAction.actionType === 'onAbcdLineColorChange' && !lastAction.freezeUpdatingSame) {
                lastAction.action = function () {
                    undoRedo(color);
                }
            } else {
                infChart.commandsManager.registerCommand(xChartId, function () {
                    undoRedo(color);
                }, function () {
                    undoRedo(currentColor);
                }, undefined, false, 'onAbcdLineColorChange');
            }
        }
        proceed.call(this, color, isPropertyChange);
    });

    infChart.util.wrap(infChart.drawingUtils.common.settings, 'onPolylineColorChange', function (proceed, color, isPropertyChange, colorPickerRef) {
        var ann = this.annotation;
        if ((_isTrackHistoryEnabledDrawing(ann) || _isIndicatorDrawing(ann)) && isPropertyChange && !infChart.drawingsManager.getIsActiveDrawingInprogress()) {
            var drawingId = this.drawingId;
            var xChartId = _getChartIdFromHighchartInstance(ann.chart);
            var currentColor = ann.options.shape.params["stroke"];
            var lastAction = infChart.commandsManager.getLastAction(xChartId);

            /**
             * Execute the undo/redo with the new properties
             * @param {string} newColor color code
             */
            function undoRedo(newColor) {
                var drawingObj = infChart.drawingsManager.getDrawingObject(xChartId, drawingId);
                var settingPanel = drawingObj.settingsPopup;
                if (settingPanel) {
                    var lineColorPickerElm = settingPanel.find(colorPickerRef || "[inf-ctrl=colorPicker]");
                    if (lineColorPickerElm.length > 0) {
                        settingPanel.data("infUndoRedo", true);
                        lineColorPickerElm.mainColorPanel("value", {color: newColor});
                    } else {
                        proceed.call(drawingObj, newColor, false, colorPickerRef);
                    }
                } else {
                    proceed.call(drawingObj, newColor, false, colorPickerRef);
                }
                drawingObj.onPropertyChange();
            }

            if (lastAction && lastAction.actionType === 'onPolylineColorChange' && !lastAction.freezeUpdatingSame) {
                lastAction.action = function () {
                    undoRedo(color);
                }
            } else {
                infChart.commandsManager.registerCommand(xChartId, function () {
                    undoRedo(color);
                }, function () {
                    undoRedo(currentColor);
                }, undefined, false, 'onPolylineColorChange');
            }
        }
        proceed.call(this, color, isPropertyChange);
    });

    /**
    * Wrapping up the infChart.drawingUtils.common.settings.onLineStyleChange to catch the settings change od dash style
    */
    infChart.util.wrap(infChart.drawingUtils.common.settings, 'onPolylineStyleChange', function (proceed, dashStyle, isPropertyChange) {
        var ann = this.annotation;
        if (_isTrackHistoryEnabledDrawing(ann) && isPropertyChange) {
            var drawingId = this.drawingId;
            var xChartId = _getChartIdFromHighchartInstance(ann.chart);
            var currentDashStyle = ann.options.shape.params["dashstyle"];

            /**
             * Execute the undo/redo with the new properties
             * @param {string} newDashStyle new style to set
             */
            function undoRedo(newDashStyle) {
                var drawingObj = infChart.drawingsManager.getDrawingObject(xChartId, drawingId);
                var settingPanel = drawingObj.settingsPopup;
                if (settingPanel) {
                    var lineStyleSelectorElm = settingPanel.find("[inf-ctrl=lineStyle][inf-style=" + newDashStyle + "]");
                    if (lineStyleSelectorElm.length > 0) {
                        settingPanel.data("infUndoRedo", true);
                        lineStyleSelectorElm.trigger('click');
                    } else {
                        proceed.call(drawingObj, newDashStyle);
                    }
                } else {
                    proceed.call(drawingObj, newDashStyle);
                }
                drawingObj.onPropertyChange();
            }

            infChart.commandsManager.registerCommand(xChartId, function () {
                undoRedo(dashStyle);
            }, function () {
                undoRedo(currentDashStyle);
            }, undefined, false, 'onLineStyleChange');
        }
        proceed.call(this, dashStyle, isPropertyChange);
    });

    infChart.util.wrap(infChart.drawingUtils.common.settings, 'onPolylineWidthChange', function (proceed, strokeWidth, isPropertyChange) {
        var ann = this.annotation;
        if ((_isTrackHistoryEnabledDrawing(ann) || _isIndicatorDrawing(ann)) && isPropertyChange) {
            var drawingId = this.drawingId;
            var xChartId = _getChartIdFromHighchartInstance(ann.chart);
            var currentWidth = ann.options.shape.params["stroke-width"];

            /**
             * Execute the undo/redo with the new properties
             * @param {number} newSize new width to set
             */
            function undoRedo(newSize) {
                var drawingObj = infChart.drawingsManager.getDrawingObject(xChartId, drawingId);
                var settingPanel = drawingObj.settingsPopup;
                if (settingPanel) {
                    var lineWidthChangeElm = settingPanel.find("[inf-ctrl=lineWidth][inf-size=" + newSize + "]");
                    if (lineWidthChangeElm.length > 0) {
                        settingPanel.data("infUndoRedo", true);
                        lineWidthChangeElm.trigger('click');
                    } else {
                        proceed.call(drawingObj, newSize);
                    }
                } else {
                    proceed.call(drawingObj, newSize);
                }
                drawingObj.onPropertyChange();
            }

            infChart.commandsManager.registerCommand(xChartId, function () {
                undoRedo(strokeWidth);
            }, function () {
                undoRedo(currentWidth);
            }, undefined, false, 'onPolylineWidthChange');
        }
        proceed.call(this, strokeWidth, isPropertyChange);
    });

    infChart.util.wrap(infChart.drawingUtils.common.settings, 'onPolylineFillColorChange', function (proceed, rgb, color, opacity, isPropertyChange, colorPickerRef) {
        var ann = this.annotation;
        if (_isTrackHistoryEnabledDrawing(ann) && isPropertyChange && !infChart.drawingsManager.getIsActiveDrawingInprogress()) {
            var drawingId = this.drawingId;
            var xChartId = _getChartIdFromHighchartInstance(ann.chart);
            var currentColor = ann.options.shape.params["fill"];
            var currentOpacity = ann.options.shape.params["fill-opacity"];
            var lastAction = infChart.commandsManager.getLastAction(xChartId);

            /**
             * Execute the undo/redo with the new properties
             * @param {string} newColor color code
             * @param {float} newOpacity opacity
             */
            function undoRedo(rgb, newColor, newOpacity) {
                var drawingObj = infChart.drawingsManager.getDrawingObject(xChartId, drawingId);
                var settingPanel = drawingObj.settingsPopup;
                if (settingPanel) {
                    var fillColorChangeElm = settingPanel.find(colorPickerRef || "[inf-ctrl=fillColorPicker]");
                    if (fillColorChangeElm.length > 0) {
                        settingPanel.data("infUndoRedo", true);
                        fillColorChangeElm.mainColorPanel("value", {
                            color: newColor,
                            opacity: newOpacity
                        });
                    } else {
                        proceed.call(drawingObj, rgb, newColor, newOpacity, false, colorPickerRef);
                    }
                } else {
                    proceed.call(drawingObj, rgb, newColor, newOpacity, false, colorPickerRef);
                }
                drawingObj.onPropertyChange();
            }

            if (lastAction && lastAction.actionType === 'onPolylineFillColorChange' && !lastAction.freezeUpdatingSame) {
                lastAction.action = function () {
                    undoRedo(rgb, color, opacity);
                }
            } else {
                infChart.commandsManager.registerCommand(xChartId, function () {
                    undoRedo(rgb, color, opacity);
                }, function () {
                    undoRedo(rgb, currentColor, currentOpacity);
                }, undefined, false, 'onPolylineFillColorChange');
            }
        }
        proceed.call(this, rgb, color, opacity, isPropertyChange);
    });

    infChart.util.wrap(infChart.drawingUtils.common.settings, 'onElliotWaveLineWidthChange', function (proceed, strokeWidth, isPropertyChange) {
        var ann = this.annotation;
        if ((_isTrackHistoryEnabledDrawing(ann) || _isIndicatorDrawing(ann)) && isPropertyChange) {
            var drawingId = this.drawingId;
            var xChartId = _getChartIdFromHighchartInstance(ann.chart);
            var currentWidth = ann.options.shape.params["stroke-width"];

            /**
             * Execute the undo/redo with the new properties
             * @param {number} newSize new width to set
             */
            function undoRedo(newSize) {
                var drawingObj = infChart.drawingsManager.getDrawingObject(xChartId, drawingId);
                var settingPanel = drawingObj.settingsPopup;
                if (settingPanel) {
                    var lineWidthChangeElm = settingPanel.find("[inf-ctrl=lineWidth][inf-size=" + newSize + "]");
                    if (lineWidthChangeElm.length > 0) {
                        settingPanel.data("infUndoRedo", true);
                        lineWidthChangeElm.trigger('click');
                    } else {
                        proceed.call(drawingObj, newSize);
                    }
                } else {
                    proceed.call(drawingObj, newSize);
                }
                drawingObj.onPropertyChange();
            }

            infChart.commandsManager.registerCommand(xChartId, function () {
                undoRedo(strokeWidth);
            }, function () {
                undoRedo(currentWidth);
            }, undefined, false, 'onElliotWaveLineWidthChange');
        }
        proceed.call(this, strokeWidth, isPropertyChange);
    });

    infChart.util.wrap(infChart.drawingUtils.common.settings, 'onElliotWaveLineColorChange', function (proceed, color, isPropertyChange, colorPickerRef) {
        var ann = this.annotation;
        if ((_isTrackHistoryEnabledDrawing(ann) || _isIndicatorDrawing(ann)) && isPropertyChange && !infChart.drawingsManager.getIsActiveDrawingInprogress()) {
            var drawingId = this.drawingId;
            var xChartId = _getChartIdFromHighchartInstance(ann.chart);
            var currentColor = ann.options.shape.params["stroke"];
            var lastAction = infChart.commandsManager.getLastAction(xChartId);

            /**
             * Execute the undo/redo with the new properties
             * @param {string} newColor color code
             */
            function undoRedo(newColor) {
                var drawingObj = infChart.drawingsManager.getDrawingObject(xChartId, drawingId);
                var settingPanel = drawingObj.settingsPopup;
                if (settingPanel) {
                    var lineColorPickerElm = settingPanel.find(colorPickerRef || "[inf-ctrl=colorPicker]");
                    if (lineColorPickerElm.length > 0) {
                        settingPanel.data("infUndoRedo", true);
                        lineColorPickerElm.mainColorPanel("value", {color: newColor});
                    } else {
                        proceed.call(drawingObj, newColor, false, colorPickerRef);
                    }
                } else {
                    proceed.call(drawingObj, newColor, false, colorPickerRef);
                }
                drawingObj.onPropertyChange();
            }

            if (lastAction && lastAction.actionType === 'onElliotWaveLineColorChange' && !lastAction.freezeUpdatingSame) {
                lastAction.action = function () {
                    undoRedo(color);
                }
            } else {
                infChart.commandsManager.registerCommand(xChartId, function () {
                    undoRedo(color);
                }, function () {
                    undoRedo(currentColor);
                }, undefined, false, 'onElliotWaveLineColorChange');
            }
        }
        proceed.call(this, color, isPropertyChange);
    });

    infChart.util.wrap(infChart.drawingUtils.common.settings, 'onElliotWaveDegreeChange', function (proceed, waveDegree, element, isPropertyChange) {
        var ann = this.annotation;
        if (isPropertyChange && !infChart.drawingsManager.getIsActiveDrawingInprogress()) {
            var drawingId = this.drawingId;
            var ann = this.annotation;
            var options = ann.options;
            var xChartId = _getChartIdFromHighchartInstance(ann.chart);
            var currentWaveDegree = ann.options.currentWaveDegree;

            /**
             * Execute the undo/redo with the new properties
             * @param {string} control expression to find the related control
             * @param {number} newFontSize indicate new font size
             */
            function undoRedo(waveDegree) {
                var drawingObj = infChart.drawingsManager.getDrawingObject(xChartId, drawingId);
                var settingPanel = drawingObj.settingsPopup;
                if (settingPanel) {
                    var fontSizeSelectorElm = settingPanel.find("[inf-ctrl= waveDegree][inf-type='" + waveDegree + "']");
                    var lastActiveElement = settingPanel.find("[inf-ctrl= waveDegree][inf-type='" + options.currentWaveDegree + "']");
                    if (fontSizeSelectorElm.length > 0) {
                        settingPanel.data("infUndoRedo", true);
                        fontSizeSelectorElm.trigger("click")
                    } else {
                        proceed.call(drawingObj, waveDegree, lastActiveElement, false);
                    }
                } else {
                    proceed.call(drawingObj, waveDegree, lastActiveElement, false);
                }
                drawingObj.onPropertyChange();
            }

            infChart.commandsManager.registerCommand(xChartId, function () {
                undoRedo(waveDegree);
            }, function () {
                undoRedo(currentWaveDegree);
            }, undefined, false, 'onElliotWaveDegreeChange');
        }
        proceed.call(this, waveDegree, element, isPropertyChange);
    });

    infChart.util.wrap(infChart.lineDrawing.prototype, 'onLabelItemsChange', function (proceed, labelItemId, value, isPropertyChange) {
        var self = this;
        if (isPropertyChange) {
            var ann = self.annotation;
            var options = ann.options;
            var labelDataItem = options.labelDataItems.find(function (labelDataItem) {
                return labelDataItem.id === labelItemId;
            });
            var currentValue = labelDataItem.enabled;

            /**
             * Execute the undo/redo with the new properties
             * @param {string} newColor new color to set
             */
            function undoRedo(labelItemId, value) {
                var settingPanel = self.settingsPopup;
                if (settingPanel) {
                    var labelEnabledElm = settingPanel.find("[inf-ctrl=labelDataItem][data-value=" + labelItemId + "]");
                    if (labelEnabledElm.length > 0) {
                        settingPanel.data("infUndoRedo", true);
                        labelEnabledElm.trigger("click");
                    } else {
                        proceed.call(self, labelItemId, value, false);
                    }
                } else {
                    proceed.call(self, labelItemId, value, false);
                }
                self.onPropertyChange();
            }

            infChart.commandsManager.registerCommand(self.stockChartId, function () {
                undoRedo(labelItemId, value);
            }, function () {
                undoRedo(labelItemId, currentValue);
            }, undefined, false, 'onLabelItemsChange');
        }
        proceed.call(self, labelItemId, value, isPropertyChange);
    });

    //endregion=====================end of Drawing Wrappers=========================================================

    //region ---------- start of positions drawing wrappers ----------
    infChart.util.wrap(infChart.positionsDrawing.prototype, "onLabelDataChange", function (proceed, type, value, isPropertyChange) {
        if (isPropertyChange && !infChart.drawingsManager.getIsActiveDrawingInprogress()) {
            var drawingId = this.drawingId;
            var ann = this.annotation;
            var xChartId = _getChartIdFromHighchartInstance(ann.chart);
            var currentValue = ann.options.settings[type];

            function undoRedo(newType, newValue) {
                var drawingObj = infChart.drawingsManager.getDrawingObject(xChartId, drawingId);
                var settingsPanel = drawingObj.settingsPopup;
                if (settingsPanel) {
                    var labelElm = settingsPanel.find("input[inf-ctrl=" + newType + "]");
                    if (labelElm.length > 0) {
                        settingsPanel.data("infUndoRedo", true);
                        labelElm.val(newValue).trigger("blur");
                    } else {
                        proceed.call(drawingObj, newType, newValue, false);
                    }
                } else {
                    proceed.call(drawingObj, newType, newValue, false);
                }
                drawingObj.onPropertyChange();
            }

            infChart.commandsManager.registerCommand(xChartId, function () {
                undoRedo(type, value);
            }, function () {
                undoRedo(type, currentValue);
            }, undefined, false, "onLabelDataChange");
        }
        proceed.call(this, type, value, isPropertyChange);
    });

    infChart.util.wrap(infChart.positionsDrawing.prototype, "onRiskChange", function (proceed, value, isPropertyChange) {
        if (isPropertyChange && !infChart.drawingsManager.getIsActiveDrawingInprogress()) {
            var drawingId = this.drawingId;
            var ann = this.annotation;
            var xChartId = _getChartIdFromHighchartInstance(ann.chart);
            var currentRiskType = ann.options.settings.risk['selectedItem'];
            var currentRiskValue = currentRiskType === "size" ? ann.options.settings.risk["size"] : ann.options.settings.risk["percentage"];

            function undoRedo(newValue) {
                var drawingObj = infChart.drawingsManager.getDrawingObject(xChartId, drawingId);
                var settingsPanel = drawingObj.settingsPopup;
                if (settingsPanel) {
                    var riskChangeElm = settingsPanel.find("input[inf-ctrl=risk]");
                    if (riskChangeElm.length > 0) {
                        settingsPanel.data("infUndoRedo", true);
                        riskChangeElm.val(newValue).trigger("blur");
                    } else {
                        proceed.call(drawingObj, newValue, false);
                    }
                } else {
                    proceed.call(drawingObj, newValue, false);
                }
                drawingObj.onPropertyChange();
            }

            infChart.commandsManager.registerCommand(xChartId, function () {
                undoRedo(value);
            }, function () {
                undoRedo(currentRiskValue);
            }, undefined, false, "onRiskChange");
        }
        proceed.call(this, value, isPropertyChange);
    });

    infChart.util.wrap(infChart.positionsDrawing.prototype, "onEntryPriceChange", function (proceed, entryPrice, isPropertyChange) {
        if (isPropertyChange && !infChart.drawingsManager.getIsActiveDrawingInprogress()) {
            var drawingId = this.drawingId;
            var ann = this.annotation;
            var xChartId = _getChartIdFromHighchartInstance(ann.chart);
            var currentEntryPrice = ann.options.settings["entryPrice"];

            function undoRedo(newEntryPrice) {
                var drawingObj = infChart.drawingsManager.getDrawingObject(xChartId, drawingId);
                var settingsPanel = drawingObj.settingsPopup;
                if (settingsPanel) {
                    var entryPriceChangeElm = settingsPanel.find("input[inf-ctrl=entryPrice]");
                    if (entryPriceChangeElm.length > 0) {
                        settingsPanel.data("infUndoRedo", true);
                        settingsPanel.find("input[inf-ctrl=entryPrice]").val(newEntryPrice).trigger("blur");
                    } else {
                        proceed.call(drawingObj, newEntryPrice, false);
                    }
                } else {
                    proceed.call(drawingObj, newEntryPrice, false);
                }
                drawingObj.onPropertyChange();
            }

            infChart.commandsManager.registerCommand(xChartId, function () {
                undoRedo(entryPrice);
            }, function () {
                undoRedo(currentEntryPrice);
            }, undefined, false, "onPriceTicksChange");
        }
        proceed.call(this, entryPrice, isPropertyChange);
    });

    infChart.util.wrap(infChart.positionsDrawing.prototype, "onPriceTicksChange", function (proceed, isTakeProfit, tickSize, isPropertyChange) {
        if (isPropertyChange && !infChart.drawingsManager.getIsActiveDrawingInprogress()) {
            var drawingId = this.drawingId;
            var ann = this.annotation;
            var xChartId = _getChartIdFromHighchartInstance(ann.chart);
            var currentTickSize = isTakeProfit ? ann.options.settings.takeProfit['tickSize'] : ann.options.settings.stopLoss['tickSize'];
            var currentCtrlName = isTakeProfit ? "takeProfitTicks" : "stopLossTicks";

            function undoRedo(ctrlName, newTickSize) {
                var drawingObj = infChart.drawingsManager.getDrawingObject(xChartId, drawingId);
                var settingsPanel = drawingObj.settingsPopup;
                if (settingsPanel) {
                    var priceTickElm = settingsPanel.find("input[inf-ctrl=" + ctrlName + "]");
                    if (priceTickElm.length > 0) {
                        settingsPanel.data("infUndoRedo", true);
                        priceTickElm.val(newTickSize).trigger("blur");
                    } else {
                        proceed.call(drawingObj, (ctrlName === "takeProfitTicks"), newTickSize, false);
                    }
                } else {
                    proceed.call(drawingObj, (ctrlName === "takeProfitTicks"), newTickSize, false);
                }
                drawingObj.onPropertyChange();
            }

            infChart.commandsManager.registerCommand(xChartId, function () {
                undoRedo(isTakeProfit ? "takeProfitTicks" : "stopLossTicks", tickSize);
            }, function () {
                undoRedo(currentCtrlName, currentTickSize);
            }, undefined, false, "onPriceTicksChange");
        }
        proceed.call(this, isTakeProfit, tickSize, isPropertyChange);
    });

    infChart.util.wrap(infChart.positionsDrawing.prototype, "onPriceChange", function (proceed, isTakeProfit, price, isPropertyChange) {
        if (isPropertyChange && !infChart.drawingsManager.getIsActiveDrawingInprogress()) {
            var drawingId = this.drawingId;
            var ann = this.annotation;
            var xChartId = _getChartIdFromHighchartInstance(ann.chart);
            var currentPrice = isTakeProfit ? ann.options.settings.takeProfit['price'] : ann.options.settings.stopLoss['price'];
            var currentCtrlName = isTakeProfit ? "takeProfitPrice" : "stopLossPrice";

            function undoRedo(ctrlName, newPrice) {
                var drawingObj = infChart.drawingsManager.getDrawingObject(xChartId, drawingId);
                var settingsPanel = drawingObj.settingsPopup;
                if (settingsPanel) {
                    var priceChangeElm = settingsPanel.find("input[inf-ctrl=" + ctrlName + "]");
                    if (priceChangeElm.length > 0) {
                        settingsPanel.data("infUndoRedo", true);
                        settingsPanel.find("input[inf-ctrl=" + ctrlName + "]").val(newPrice).trigger("blur");
                    } else {
                        proceed.call(drawingObj, (ctrlName === "takeProfitPrice"), newPrice, false);
                    }
                } else {
                    proceed.call(drawingObj, (ctrlName === "takeProfitPrice"), newPrice, false);
                }
                drawingObj.onPropertyChange();
            }

            infChart.commandsManager.registerCommand(xChartId, function () {
                undoRedo(isTakeProfit ? "takeProfitPrice" : "stopLossPrice", price);
            }, function () {
                undoRedo(currentCtrlName, currentPrice);
            }, undefined, false, "onPriceChange");
        }
        proceed.call(this, isTakeProfit, price, isPropertyChange);
    });

    infChart.util.wrap(infChart.positionsDrawing.prototype, "onLineColorChange", function (proceed, value, opacity, isPropertyChange) {
        if (isPropertyChange && !infChart.drawingsManager.getIsActiveDrawingInprogress()) {
            var drawingId = this.drawingId;
            var ann = this.annotation;
            var xChartId = _getChartIdFromHighchartInstance(ann.chart);
            var currentLineColor = ann.options.styles['lineColor'];
            var currentLineOpacity = ann.options.styles['lineOpacity'];
            var lastAction = infChart.commandsManager.getLastAction(xChartId);

            function undoRedo(newLineColor, newLineOpacity) {
                var drawingObj = infChart.drawingsManager.getDrawingObject(xChartId, drawingId);
                var settingsPanel = drawingObj.settingsPopup;
                if (settingsPanel) {
                    var lineColorChangeElm = settingsPanel.find("[inf-ctrl=lineColorPicker]");
                    if (lineColorChangeElm.length > 0) {
                        settingsPanel.data("infUndoRedo", true);
                        lineColorChangeElm.mainColorPanel("value", {color: newLineColor, opacity: newLineOpacity});
                    } else {
                        proceed.call(drawingObj, newLineColor, newLineOpacity, false);
                    }
                } else {
                    proceed.call(drawingObj, newLineColor, newLineOpacity, false);
                }
                drawingObj.onPropertyChange();
            }

            if (lastAction && lastAction.actionType === 'onLineColorChange' && !lastAction.freezeUpdatingSame) {
                lastAction.action = function () {
                    undoRedo(value, opacity);
                }
            } else {
                infChart.commandsManager.registerCommand(xChartId, function () {
                    undoRedo(value, opacity);
                }, function () {
                    undoRedo(currentLineColor, currentLineOpacity);
                }, undefined, false, "onLineColorChange");
            }

        }
        proceed.call(this, value, opacity, isPropertyChange);
    });

    infChart.util.wrap(infChart.positionsDrawing.prototype, "onLineWidthChange", function (proceed, strokeWidth, isPropertyChange) {
        if (isPropertyChange && !infChart.drawingsManager.getIsActiveDrawingInprogress()) {
            var drawingId = this.drawingId;
            var ann = this.annotation;
            var xChartId = _getChartIdFromHighchartInstance(ann.chart);
            var currentStrokeWidth = ann.options.styles['lineWidth'];

            function undoRedo(newStrokeWidth) {
                var drawingObj = infChart.drawingsManager.getDrawingObject(xChartId, drawingId);
                var settingsPanel = drawingObj.settingsPopup;
                if (settingsPanel) {
                    var lineWidthChangeElm = settingsPanel.find("[inf-ctrl=lineWidth][inf-size=" + newStrokeWidth + "]");
                    if (lineWidthChangeElm.length > 0) {
                        settingsPanel.data("infUndoRedo", true);
                        lineWidthChangeElm.trigger('click');
                    } else {
                        proceed.call(drawingObj, newStrokeWidth, false);
                    }
                } else {
                    proceed.call(drawingObj, newStrokeWidth, false);
                }
                drawingObj.onPropertyChange();
            }

            infChart.commandsManager.registerCommand(xChartId, function () {
                undoRedo(strokeWidth);
            }, function () {
                undoRedo(currentStrokeWidth);
            }, undefined, false, "onLineWidthChange");

        }
        proceed.call(this, strokeWidth, isPropertyChange);
    });

    infChart.util.wrap(infChart.positionsDrawing.prototype, "onStopLossColorChange", function (proceed, value, opacity, isPropertyChange) {
        if (isPropertyChange && !infChart.drawingsManager.getIsActiveDrawingInprogress()) {
            var drawingId = this.drawingId;
            var ann = this.annotation;
            var xChartId = _getChartIdFromHighchartInstance(ann.chart);
            var currentLineColor = ann.options.styles['stopLossColor'];
            var currentFillOpacity = ann.options.styles['stopLossFillOpacity'];
            var lastAction = infChart.commandsManager.getLastAction(xChartId);


            function undoRedo(newLineColor, newLineOpacity) {
                var drawingObj = infChart.drawingsManager.getDrawingObject(xChartId, drawingId);
                var settingsPanel = drawingObj.settingsPopup;
                if (settingsPanel) {
                    var slColorChangeElm = settingsPanel.find("[inf-ctrl=stopLossColorPicker]");
                    if (slColorChangeElm.length > 0) {
                        settingsPanel.data("infUndoRedo", true);
                        slColorChangeElm.mainColorPanel("value", {color: newLineColor, opacity: newLineOpacity});
                    } else {
                        proceed.call(drawingObj, newLineColor, newLineOpacity, false);
                    }
                } else {
                    proceed.call(drawingObj, newLineColor, newLineOpacity, false);
                }
                drawingObj.onPropertyChange();
            }

            if (lastAction && lastAction.actionType === 'onStopLossColorChange' && !lastAction.freezeUpdatingSame) {
                lastAction.action = function () {
                    undoRedo(value, opacity);
                }
            } else {
                infChart.commandsManager.registerCommand(xChartId, function () {
                    undoRedo(value, opacity);
                }, function () {
                    undoRedo(currentLineColor, currentFillOpacity);
                }, undefined, false, "onStopLossColorChange");
            }

        }
        proceed.call(this, value, opacity, isPropertyChange);
    });

    infChart.util.wrap(infChart.positionsDrawing.prototype, "onTakeProfitColorChange", function (proceed, value, opacity, isPropertyChange) {
        if (isPropertyChange && !infChart.drawingsManager.getIsActiveDrawingInprogress()) {
            var drawingId = this.drawingId;
            var ann = this.annotation;
            var xChartId = _getChartIdFromHighchartInstance(ann.chart);
            var currentLineColor = ann.options.styles['takeProfitColor'];
            var currentFillOpacity = ann.options.styles['takeProfitFillOpacity'];
            var lastAction = infChart.commandsManager.getLastAction(xChartId);

            function undoRedo(newLineColor, newLineOpacity) {
                var drawingObj = infChart.drawingsManager.getDrawingObject(xChartId, drawingId);
                var settingsPanel = drawingObj.settingsPopup;
                if (settingsPanel) {
                    var tpColorChangeElm = settingsPanel.find("[inf-ctrl=takeProfitColorPicker]");
                    if (tpColorChangeElm.length > 0) {
                        settingsPanel.data("infUndoRedo", true);
                        tpColorChangeElm.mainColorPanel("value", {color: newLineColor, opacity: newLineOpacity});
                    } else {
                        proceed.call(drawingObj, newLineColor, newLineOpacity, false);
                    }
                } else {
                    proceed.call(drawingObj, newLineColor, newLineOpacity, false);
                }
                drawingObj.onPropertyChange();
            }

            if (lastAction && lastAction.actionType === 'onTakeProfitColorChange' && !lastAction.freezeUpdatingSame) {
                lastAction.action = function () {
                    undoRedo(value, opacity);
                }
            } else {
                infChart.commandsManager.registerCommand(xChartId, function () {
                    undoRedo(value, opacity);
                }, function () {
                    undoRedo(currentLineColor, currentFillOpacity);
                }, undefined, false, "onTakeProfitColorChange");
            }

        }

        proceed.call(this, value, opacity, isPropertyChange);
    });

    infChart.util.wrap(infChart.positionsDrawing.prototype, "onTextColorChange", function (proceed, value, opacity, isPropertyChange) {
        if (isPropertyChange && !infChart.drawingsManager.getIsActiveDrawingInprogress()) {
            var drawingId = this.drawingId;
            var ann = this.annotation;
            var xChartId = _getChartIdFromHighchartInstance(ann.chart);
            var currentTextColor = ann.options.styles['textColor'];
            var currentTextOpacity = ann.options.styles['textOpacity'];
            var lastAction = infChart.commandsManager.getLastAction(xChartId);

            function undoRedo(newColor, newOpacity) {
                var drawingObj = infChart.drawingsManager.getDrawingObject(xChartId, drawingId);
                var settingsPanel = drawingObj.settingsPopup;
                if (settingsPanel) {
                    var textColorChangeElm = settingsPanel.find("[inf-ctrl=textColorPicker]");
                    if (textColorChangeElm.length > 0) {
                        settingsPanel.data("infUndoRedo", true);
                        settingsPanel.find("[inf-ctrl=textColorPicker]").mainColorPanel("value", {
                            color: newColor,
                            opacity: newOpacity
                        });
                    } else {
                        proceed.call(drawingObj, newColor, newOpacity, false);
                    }
                } else {
                    proceed.call(drawingObj, newColor, newOpacity, false);
                }
                drawingObj.onPropertyChange();
            }

            if (lastAction && lastAction.actionType === 'onTextColorChange' && !lastAction.freezeUpdatingSame) {
                lastAction.action = function () {
                    undoRedo(value, opacity);
                }
            } else {
                infChart.commandsManager.registerCommand(xChartId, function () {
                    undoRedo(value, opacity);
                }, function () {
                    undoRedo(currentTextColor, currentTextOpacity);
                }, undefined, false, "onTextColorChange");
            }
        }
        proceed.call(this, value, opacity, isPropertyChange);
    });

    infChart.util.wrap(infChart.positionsDrawing.prototype, "onCompactStatsModeChange", function (proceed, value, isPropertyChange) {
        if (isPropertyChange) {
            var self = this;
            var ann = self.annotation;
            var options = ann.options;
            var currentValue = ann.options.styles['isCompactStats'];

            infChart.commandsManager.registerCommand(self.stockChartId, function () {
                proceed.call(self, value, false);
                self.onPropertyChange();
            }, function () {
                proceed.call(self, currentValue, false);
                self.onPropertyChange();
            }, undefined, false, 'onFibLevelValueChange');
        }
        proceed.call(self, value, isPropertyChange);
    });

    //endregion ---------- end of positions drawing wrappers ----------

    //-----------region start of trend channel drawing wrappers--------

    infChart.util.wrap(infChart.trendChannelDrawing.prototype, 'onFillColorChange', function (proceed, rgb, color, opacity, isPropertyChange) {
        var ann = this.annotation;
        if (_isTrackHistoryEnabledDrawing(ann) && isPropertyChange && !infChart.drawingsManager.getIsActiveDrawingInprogress()) {
            var drawingId = this.drawingId;
            var xChartId = _getChartIdFromHighchartInstance(ann.chart);
            var currentColor = ann.options.shape.params["fill"];
            var currentOpacity = ann.options.shape.params["fill-opacity"];
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
                    var fillColorChangeElm = settingPanel.find("[inf-ctrl=fillColorPicker]");
                    if (fillColorChangeElm.length > 0) {
                        settingPanel.data("infUndoRedo", true);
                        fillColorChangeElm.mainColorPanel("value", {
                            color: newColor,
                            opacity: newOpacity
                        });
                    } else {
                        proceed.call(drawingObj, rgb, newColor, newOpacity, false);
                    }
                } else {
                    proceed.call(drawingObj, rgb, newColor, newOpacity, false);
                }
                drawingObj.onPropertyChange();
            }

            if (lastAction && lastAction.actionType === 'onFillColorChange' && !lastAction.freezeUpdatingSame) {
                lastAction.action = function () {
                    undoRedo(color, opacity);
                }
            } else {
                infChart.commandsManager.registerCommand(xChartId, function () {
                    undoRedo(color, opacity);
                }, function () {
                    undoRedo(currentColor, currentOpacity);
                }, undefined, false, 'onFillColorChange');
            }
        }
        proceed.call(this, rgb, color, opacity, isPropertyChange);
    });

    infChart.util.wrap(infChart.trendChannelDrawing.prototype, 'onMiddleLineColorChange', function (proceed, rgb, color, isPropertyChange) {
        var ann = this.annotation;
        if ((_isTrackHistoryEnabledDrawing(ann) || _isIndicatorDrawing(ann)) && isPropertyChange && !infChart.drawingsManager.getIsActiveDrawingInprogress()) {
            var drawingId = this.drawingId;
            var xChartId = _getChartIdFromHighchartInstance(ann.chart);
            var currentColor = ann.options.middleLineColor;
            var lastAction = infChart.commandsManager.getLastAction(xChartId);

            /**
             * Execute the undo/redo with the new properties
             * @param {string} newColor color code
             */
            function undoRedo(newColor) {
                var drawingObj = infChart.drawingsManager.getDrawingObject(xChartId, drawingId);
                var settingPanel = drawingObj.settingsPopup;
                if (settingPanel) {
                    var lineColorSelectorElm = settingPanel.find("input[inf-ctrl=middleLineColorPicker]");
                    if (lineColorSelectorElm.length > 0) {
                        settingPanel.data("infUndoRedo", true);
                        lineColorSelectorElm.mainColorPanel("value", {color: newColor})
                    } else {
                        proceed.call(drawingObj, rgb, newColor, false);
                    }
                } else {
                    proceed.call(drawingObj, rgb, newColor, false);
                }
                drawingObj.onPropertyChange();
            }

            if (lastAction && lastAction.actionType === 'onMiddleLineColorChange' && !lastAction.freezeUpdatingSame) {
                lastAction.action = function () {
                    undoRedo(color);
                }
            } else {
                infChart.commandsManager.registerCommand(xChartId, function () {
                    undoRedo(color);
                }, function () {
                    undoRedo(currentColor);
                }, undefined, false, 'onMiddleLineColorChange');
            }
        }
        proceed.call(this, rgb, color, isPropertyChange);
    });

    infChart.util.wrap(infChart.trendChannelDrawing.prototype, 'onMiddleLineWidthChange', function (proceed, strokeWidth, isPropertyChange) {
        var ann = this.annotation;
        if ((_isTrackHistoryEnabledDrawing(ann) || _isIndicatorDrawing(ann)) && isPropertyChange) {
            var drawingId = this.drawingId;
            var xChartId = _getChartIdFromHighchartInstance(ann.chart);
            var currentWidth = ann.options.middleLineWidth;

            /**
             * Execute the undo/redo with the new properties
             * @param {number} newSize new width to set
             */
            function undoRedo(newSize) {
                var drawingObj = infChart.drawingsManager.getDrawingObject(xChartId, drawingId);
                var settingPanel = drawingObj.settingsPopup;
                if (settingPanel) {
                    var lineWidthChangeElm = settingPanel.find(".middle-line-styles").find("[inf-ctrl=lineWidth][inf-size=" + newSize + "]");
                    if (lineWidthChangeElm.length > 0) {
                        settingPanel.data("infUndoRedo", true);
                        lineWidthChangeElm.trigger('click');
                    } else {
                        proceed.call(drawingObj, newSize);
                    }
                } else {
                    proceed.call(drawingObj, newSize);
                }
                drawingObj.onPropertyChange();
            }

            infChart.commandsManager.registerCommand(xChartId, function () {
                undoRedo(strokeWidth);
            }, function () {
                undoRedo(currentWidth);
            }, undefined, false, 'onMiddleLineWidthChange');
        }
        proceed.call(this, strokeWidth, isPropertyChange);
    });

    infChart.util.wrap(infChart.trendChannelDrawing.prototype, 'onMiddleLineStyleChange', function (proceed, dashStyle, isPropertyChange) {
        var ann = this.annotation;
        if (_isTrackHistoryEnabledDrawing(ann) && isPropertyChange) {
            var drawingId = this.drawingId;
            var xChartId = _getChartIdFromHighchartInstance(ann.chart);
            var currentDashStyle = ann.options.middleLineStyle;

            /**
             * Execute the undo/redo with the new properties
             * @param {string} newDashStyle new style to set
             */
            function undoRedo(newDashStyle) {
                var drawingObj = infChart.drawingsManager.getDrawingObject(xChartId, drawingId);
                var settingPanel = drawingObj.settingsPopup;
                if (settingPanel) {
                    var lineStyleSelectorElm = settingPanel.find(".middle-line-styles").find("[inf-ctrl=lineStyle][inf-style=" + newDashStyle + "]");
                    if (lineStyleSelectorElm.length > 0) {
                        settingPanel.data("infUndoRedo", true);
                        lineStyleSelectorElm.trigger('click');
                    } else {
                        proceed.call(drawingObj, newDashStyle);
                    }
                } else {
                    proceed.call(drawingObj, newDashStyle);
                }
                drawingObj.onPropertyChange();
            }

            infChart.commandsManager.registerCommand(xChartId, function () {
                undoRedo(dashStyle);
            }, function () {
                undoRedo(currentDashStyle);
            }, undefined, false, 'onMiddleLineStyleChange');
        }
        proceed.call(this, dashStyle, isPropertyChange);
    });

    /**
     * region start of arrow drawing wrapper
     */
    infChart.util.wrap(infChart.arrowDrawing.prototype, 'onFillColorChange', function(proceed, rgb, color, opacity, isPropertyChange) {
        if (isPropertyChange && !infChart.drawingsManager.getIsActiveDrawingInprogress()) {
            let ann = this.annotation;
                drawingId = this.drawingId,
                xChartId = _getChartIdFromHighchartInstance(ann.chart),
                currentColor = ann.options.shape.params.fill,
                lastAction = infChart.commandsManager.getLastAction(xChartId),
                colorPickerRef = "[inf-ctrl=colorPicker]";
            
            /**
             * Execute the undo/redo with the new properties
             * @param {string} newColor color code
             */
            function undoRedo(newColor) {
                let drawingObj = infChart.drawingsManager.getDrawingObject(xChartId, drawingId);
                let settingPanel = drawingObj.settingsPopup;
                if (settingPanel) {
                    let arrowColorSelectorElm = settingPanel.find(colorPickerRef);
                    if (arrowColorSelectorElm.length > 0) {
                        settingPanel.data("infUndoRedo", true);
                        arrowColorSelectorElm.minicolors("value", {color: newColor})
                    } else {
                        proceed.call(drawingObj, rgb, newColor, false, colorPickerRef);
                    }
                } else {
                    proceed.call(drawingObj, rgb, newColor, false, colorPickerRef);
                }
                drawingObj.onPropertyChange();
            }

            if (lastAction && lastAction.actionType === 'onColorChange' && !lastAction.freezeUpdatingSame) {
                lastAction.action = function () {
                    undoRedo(color);
                }
            } else {
                infChart.commandsManager.registerCommand(xChartId, function () {
                    undoRedo(color);
                }, function () {
                    undoRedo(currentColor);
                }, undefined, false, 'onColorChange');
            }
        }
        proceed.call(this, rgb, color, opacity, isPropertyChange);
    });

    infChart.util.wrap(infChart.arrowDrawing.prototype, 'onLabelTextChange', function(proceed, text, isPropertyChange) {
        if (isPropertyChange && !infChart.drawingsManager.getIsActiveDrawingInprogress()) {
            let self = this,
                ann = self.annotation,
                drawingId = self.drawingId,
                xChartId = _getChartIdFromHighchartInstance(ann.chart),
                currentText = ann.options.label.text;

            /**
             * Execute the undo/redo with the new properties
             * @param {string} newColor color code
             */
            function undoRedo(newText) {
                let drawingObj = infChart.drawingsManager.getDrawingObject(xChartId, drawingId),
                    settingPanel = drawingObj.settingsPopup;

                proceed.call(drawingObj, newText, false);
                if (settingPanel) {
                    newText = newText.replace(/<br\s*\/?>/gi, "");
                    drawingObj.updateSettings(settingPanel, undefined, newText);
                }
                drawingObj.onPropertyChange();
            }

            infChart.commandsManager.registerCommand(self.stockChartId, function () {
                undoRedo(text);
            }, function () {
                undoRedo(currentText);
            }, undefined, false, 'onTextChange_arrow');
        }
        proceed.call(this, text, isPropertyChange);
    });

    infChart.util.wrap(infChart.arrowDrawing.prototype, 'onLabelFontSizeChange', function(proceed, fontSize, isPropertyChange) {
        if (isPropertyChange) {
            let self = this,
                currentFontSize = self.annotation.options.label.fontSize;

             /**
              * Execute the undo/redo with the new properties
              * @param {number} newSize new font size to set
              */
            function undoRedo(newSize) {
                let settingPanel = self.settingsPopup;

                if (settingPanel) {
                    let fontSizeChangeDropdownElm = $(settingPanel.find("span[inf-ctrl=singleSelectedFontSize][inf-ctrl-val=P_all]"));
                    if (fontSizeChangeDropdownElm.length > 0) {
                        settingPanel.data("infUndoRedo", true);
                        var dropDownItem = fontSizeChangeDropdownElm.parent().parent();
                        $(dropDownItem).find("li[inf-ctrl=fontSize][inf-size='" + newSize + "']").trigger("click");
                    } else {
                        proceed.call(self, newSize, false);
                    }
                } else {
                    proceed.call(self, newSize, false);
                }
                self.onPropertyChange();
            }

            infChart.commandsManager.registerCommand(self.stockChartId, function () {
                undoRedo(fontSize);
            }, function () {
                undoRedo(currentFontSize);
            }, undefined, false, 'onArrowLabelFontSizeChange');
        }
        proceed.call(this, fontSize, isPropertyChange);
    });

    infChart.util.wrap(infChart.arrowDrawing.prototype, 'onLabelFontColorChange', function(proceed, fontColor, isPropertyChange) {
        if (isPropertyChange && !infChart.drawingsManager.getIsActiveDrawingInprogress()) {
            let self = this;
                currentFontColor = self.annotation.options.label.fontColor,
                lastAction = infChart.commandsManager.getLastAction(self.stockChartId);

            /**
             * Execute the undo/redo with the new properties
             * @param {string} newColor color code
             */
             function undoRedo(newColor) {
                let settingPanel = self.settingsPopup;
                if (settingPanel) {
                    let fontColorChangeElm = settingPanel.find("[inf-ctrl=textColorPicker]");
                    if (fontColorChangeElm.length > 0) {
                        settingPanel.data("infUndoRedo", true);
                        fontColorChangeElm.minicolors("value", {
                            color: newColor
                        });
                    } else {
                        proceed.call(self, newColor, false);
                    }
                } else {
                    proceed.call(self, newColor, false);
                }
                self.onPropertyChange();
            }

            if (lastAction && lastAction.actionType === 'onArrowLabelFontColorChange' && !lastAction.freezeUpdatingSame) {
                lastAction.action = function () {
                    undoRedo(fontColor);
                }
            } else {
                infChart.commandsManager.registerCommand(self.stockChartId, function () {
                    undoRedo(fontColor);
                }, function () {
                    undoRedo(currentFontColor);
                }, undefined, false, 'onArrowLabelFontColorChange');
            }
        }
        proceed.call(this, fontColor, isPropertyChange);
    });
    //endregion

    //region ------------------------Start of common settings wrappers -----------------------------------------
    infChart.util.wrap(infChart.drawingSettings.eventHandlers, "onLineColorChange", function (proceed, drawingInstance, settingsParams, isPropertyChange, rgb, value, opacity) {
        const ann = drawingInstance.annotation;

        if ((_isTrackHistoryEnabledDrawing(ann) || _isIndicatorDrawing(ann)) && isPropertyChange && !infChart.drawingsManager.getIsActiveDrawingInprogress()) {
            const xChartId = _getChartIdFromHighchartInstance(ann.chart);
            const currentLineColor = ann.options.settings[settingsParams.settingsItem + 'Color'];
            const currentLineOpacity = ann.options.settings[settingsParams.settingsItem + 'Opacity'];
            const lastAction = infChart.commandsManager.getLastAction(xChartId);

            function undoRedo(rgb, newLineColor, newLineOpacity) {
                const settingsPanel = drawingInstance.settingsPopup;
                if (settingsPanel) {
                    const lineColorChangeElm = settingsPanel.find(settingsParams.ctrlSelector? settingsParams.ctrlSelector: "[inf-ctrl=lineColorPicker]");
                    if (lineColorChangeElm.length > 0) {
                        settingsPanel.data("infUndoRedo", true);
                        lineColorChangeElm.mainColorPanel("value", {color: newLineColor, opacity: newLineOpacity});
                    } else {
                        proceed(drawingInstance, settingsParams, isPropertyChange, rgb, newLineColor, newLineOpacity);
                    }
                } else {
                    proceed(drawingInstance, settingsParams, isPropertyChange, rgb, newLineColor, newLineOpacity);
                }
                drawingInstance.onPropertyChange();
            }

            if (lastAction && lastAction.actionType === 'onLineColorChange' && !lastAction.freezeUpdatingSame) {
                lastAction.action = function () {
                    undoRedo(rgb, value, opacity);
                }
            } else {
                infChart.commandsManager.registerCommand(xChartId, function () {
                    undoRedo(rgb, value, opacity);
                }, function () {
                    undoRedo(rgb, currentLineColor, currentLineOpacity);
                }, undefined, false, "onLineColorChange");
            }

        }
        proceed(drawingInstance, settingsParams, isPropertyChange, rgb, value, opacity);
    });

    infChart.util.wrap(infChart.drawingSettings.eventHandlers, 'onLineWidthChange', function (proceed, drawingInstance, settingsParams, isPropertyChange, strokeWidth) {
        const ann = drawingInstance.annotation;
        if ((_isTrackHistoryEnabledDrawing(ann) || _isIndicatorDrawing(ann)) && isPropertyChange) {
            const xChartId = _getChartIdFromHighchartInstance(ann.chart);
            const currentWidth = ann.options.settings[settingsParams.settingsItem];

            /**
             * Execute the undo/redo with the new properties
             * @param {number} newSize new width to set
             */
            function undoRedo(newSize) {
                const settingPanel = drawingInstance.settingsPopup;
                if (settingPanel) {
                    const sizeSelectorElm = settingPanel.find((settingsParams.ctrlSelector? settingsParams.ctrlSelector: "[inf-ctrl=lineWidth]") + "[inf-size=" + newSize + "]");
                    if (sizeSelectorElm.length > 0) {
                        settingPanel.data("infUndoRedo", true);
                        sizeSelectorElm.trigger('click');
                    } else {
                        proceed(drawingInstance, settingsParams, isPropertyChange, newSize);
                    }
                } else {
                    proceed(drawingInstance, settingsParams, isPropertyChange, newSize);
                }
                drawingInstance.onPropertyChange();
            }

            infChart.commandsManager.registerCommand(xChartId, function () {
                undoRedo(strokeWidth);
            }, function () {
                undoRedo(currentWidth);
            }, undefined, false, 'onLineWidthChange');
        }
        proceed(drawingInstance, settingsParams, isPropertyChange, strokeWidth);
    });

    infChart.util.wrap(infChart.drawingSettings.eventHandlers, 'onLineStyleChange', function (proceed, drawingInstance, settingsParams, isPropertyChange, dashStyle) {
        const ann = drawingInstance.annotation;
        if (_isTrackHistoryEnabledDrawing(ann) && isPropertyChange) {
            const xChartId = _getChartIdFromHighchartInstance(ann.chart);
            const currentDashStyle = ann.options.settings[settingsParams.settingsItem];

            /**
             * Execute the undo/redo with the new properties
             * @param {string} newDashStyle new style to set
             */
            function undoRedo(newDashStyle) {
                const settingPanel = drawingInstance.settingsPopup;
                if (settingPanel) {
                    const lineStyleSelectorElm = settingPanel.find((settingsParams.ctrlSelector? settingsParams.ctrlSelector: "[inf-ctrl=lineStyle]") + "[inf-style=" + newDashStyle + "]");
                    if (lineStyleSelectorElm.length > 0) {
                        settingPanel.data("infUndoRedo", true);
                        lineStyleSelectorElm.trigger('click');
                    } else {
                        proceed(drawingInstance, settingsParams, isPropertyChange, newDashStyle);
                    }
                } else {
                    proceed(drawingInstance, settingsParams, isPropertyChange, newDashStyle);
                }
                drawingInstance.onPropertyChange();
            }

            infChart.commandsManager.registerCommand(xChartId, function () {
                undoRedo(dashStyle);
            }, function () {
                undoRedo(currentDashStyle);
            }, undefined, false, 'onLineStyleChange');
        }
        proceed(drawingInstance, settingsParams, isPropertyChange, dashStyle);
    });

    /**
     * Wrapping up the infChart.drawingSettings.eventHandlers.onFillColorChange to catch the color settings change
     */
    infChart.util.wrap(infChart.drawingSettings.eventHandlers, 'onFillColorChange', function (proceed, drawingInstance, settingsParams, isPropertyChange, rgb, value, opacity) {
        const ann = drawingInstance.annotation;

        if ((_isTrackHistoryEnabledDrawing(ann) || _isIndicatorDrawing(ann)) && isPropertyChange && !infChart.drawingsManager.getIsActiveDrawingInprogress()) {
            const xChartId = _getChartIdFromHighchartInstance(ann.chart);
            const currentFillColor = ann.options.settings[settingsParams.settingsItem + 'Color'];
            const currentFillOpacity = ann.options.settings[settingsParams.settingsItem + 'Opacity'];
            const lastAction = infChart.commandsManager.getLastAction(xChartId);

            function undoRedo(rgb, newFillColor, newFillOpacity) {
                const settingsPanel = drawingInstance.settingsPopup;
                if (settingsPanel) {
                    const fillColorChangeElm = settingsPanel.find(settingsParams.ctrlSelector? settingsParams.ctrlSelector: "[inf-ctrl=fillColorPicker]");
                    if (fillColorChangeElm.length > 0) {
                        settingsPanel.data("infUndoRedo", true);
                        fillColorChangeElm.mainColorPanel("value", {color: newFillColor, opacity: newFillOpacity});
                    } else {
                        proceed(drawingInstance, settingsParams, isPropertyChange, rgb, newFillColor, newFillOpacity);
                    }
                } else {
                    proceed(drawingInstance, settingsParams, isPropertyChange, rgb, newFillColor, newFillOpacity);
                }
                drawingInstance.onPropertyChange();
            }

            if (lastAction && lastAction.actionType === 'onFillColorChange' && !lastAction.freezeUpdatingSame) {
                lastAction.action = function () {
                    undoRedo(rgb, value, opacity);
                }
            } else {
                infChart.commandsManager.registerCommand(xChartId, function () {
                    undoRedo(rgb, value, opacity);
                }, function () {
                    undoRedo(rgb, currentFillColor, currentFillOpacity);
                }, undefined, false, "onFillColorChange");
            }

        }
        proceed(drawingInstance, settingsParams, isPropertyChange, rgb, value, opacity);
    });

    /**
     * Wrapping up the infChart.drawingSettings.eventHandlers.onFillColorChange to catch the color settings change
     */
    infChart.util.wrap(infChart.drawingSettings.eventHandlers, 'onFontColorChange', function (proceed, drawingInstance, settingsParams, isPropertyChange, rgb, value, opacity) {
        const ann = drawingInstance.annotation;
            if ((_isTrackHistoryEnabledDrawing(ann) || _isIndicatorDrawing(ann)) && isPropertyChange && !infChart.drawingsManager.getIsActiveDrawingInprogress()) {
                const xChartId = _getChartIdFromHighchartInstance(ann.chart);
                const currentFontColor = ann.options.settings[settingsParams.settingsItem + 'Color'];
                const currentFontOpacity = ann.options.settings[settingsParams.settingsItem + 'Opacity'];
                const lastAction = infChart.commandsManager.getLastAction(xChartId);

                function undoRedo(rgb, newFontColor, newFontOpacity) {
                    const settingsPanel = drawingInstance.settingsPopup;
                    if (settingsPanel) {
                        const fontColorChangeElm = settingsPanel.find(settingsParams.ctrlSelector? settingsParams.ctrlSelector: "[inf-ctrl=fontColorPicker]");
                        if (fontColorChangeElm.length > 0) {
                            settingsPanel.data("infUndoRedo", true);
                            fontColorChangeElm.mainColorPanel("value", {color: newFontColor, opacity: newFontOpacity});
                        } else {
                            proceed(drawingInstance, settingsParams, isPropertyChange, rgb, newFontColor, newFontOpacity);
                        }
                    } else {
                        proceed(drawingInstance, settingsParams, isPropertyChange, rgb, newFontColor, newFontOpacity);
                    }
                    drawingInstance.onPropertyChange();
                }

                if (lastAction && lastAction.actionType === 'onFontColorChange' && !lastAction.freezeUpdatingSame) {
                    lastAction.action = function () {
                        undoRedo(rgb, value, opacity);
                    }
                } else {
                    infChart.commandsManager.registerCommand(xChartId, function () {
                        undoRedo(rgb, value, opacity);
                    }, function () {
                        undoRedo(rgb, currentFontColor, currentFontOpacity);
                    }, undefined, false, "onFontColorChange");
                }

            }
            proceed(drawingInstance, settingsParams, isPropertyChange, rgb, value, opacity);
        });

    /**
     * Wrapping up the infChart.drawingSettings.eventHandlers.onFontSizeChange to catch the line width changes
     */
    infChart.util.wrap(infChart.drawingSettings.eventHandlers, 'onFontSizeChange', function (proceed, drawingInstance, settingsParams, isPropertyChange, fontSize) {
        const ann = drawingInstance.annotation;
        if ((_isTrackHistoryEnabledDrawing(ann) || _isIndicatorDrawing(ann)) && isPropertyChange) {
            const xChartId = _getChartIdFromHighchartInstance(ann.chart);
            const currentFontSize = ann.options.settings[settingsParams.settingsItem];

            /**
             * Execute the undo/redo with the new properties
             * @param {number} newSize new width to set
             */
            function undoRedo(fontSize) {
                const settingPanel = drawingInstance.settingsPopup;
                if (settingPanel) {
                    const sizeSelectorElm = settingPanel.find((settingsParams.ctrlSelector? settingsParams.ctrlSelector: "[inf-ctrl=fontSize]") + "[inf-size=" + fontSize + "]");
                    if (sizeSelectorElm.length > 0) {
                        settingPanel.data("infUndoRedo", true);
                        sizeSelectorElm.trigger('click');
                    } else {
                        proceed(drawingInstance, settingsParams, isPropertyChange, fontSize);
                    }
                } else {
                    proceed(drawingInstance, settingsParams, isPropertyChange, fontSize);
                }
                drawingInstance.onPropertyChange();
            }

            infChart.commandsManager.registerCommand(xChartId, function () {
                undoRedo(fontSize);
            }, function () {
                undoRedo(currentFontSize);
            }, undefined, false, 'onFontSizeChange');
        }
        proceed(drawingInstance, settingsParams, isPropertyChange, fontSize);

    });

    infChart.util.wrap(infChart.drawingSettings.eventHandlers, 'onFontStyleChange', function (proceed, drawingInstance, settingsParams, isPropertyChange, style, isSelected) {
        const ann = drawingInstance.annotation;
        if (_isTrackHistoryEnabledDrawing(ann) && isPropertyChange) {
            const xChartId = _getChartIdFromHighchartInstance(ann.chart);
            const currentIsSelected = !isSelected;

            /**
             * Execute the undo/redo with the new properties
             * @param {string} newDashStyle new style to set
             */
            function undoRedo(style, isSelected) {
                const settingPanel = drawingInstance.settingsPopup;
                if (settingPanel) {
                    const fontStyleSelectorElm = settingPanel.find((settingsParams.ctrlSelector? settingsParams.ctrlSelector: "[inf-ctrl=fontStyle]") + "[inf-style=" + style + "]");
                    if (fontStyleSelectorElm.length > 0) {
                        settingPanel.data("infUndoRedo", true);
                        fontStyleSelectorElm.trigger('click');
                    } else {
                        proceed(drawingInstance, settingsParams, isPropertyChange, style, isSelected);
                    }
                } else {
                    proceed(drawingInstance, settingsParams, isPropertyChange, style, isSelected);
                }
                drawingInstance.onPropertyChange();
            }

            infChart.commandsManager.registerCommand(xChartId, function () {
                undoRedo(style, isSelected);
            }, function () {
                undoRedo(style, currentIsSelected);
            }, undefined, false, 'onFontStyleChange');
        }
        proceed(drawingInstance, settingsParams, isPropertyChange, style, isSelected);
    });

    infChart.util.wrap(infChart.drawingSettings.eventHandlers, 'onValueChange', function (proceed, drawingInstance, settingsParams, isPropertyChange, value) {
        const ann = drawingInstance.annotation;
        if (_isTrackHistoryEnabledDrawing(ann) && isPropertyChange) {
            const xChartId = _getChartIdFromHighchartInstance(ann.chart);
            const currentValue = ann.options.settings[settingsParams.settingsItem];

            /**
             * Execute the undo/redo with the new properties
             * @param {string} newDashStyle new style to set
             */
            function undoRedo(value) {
                const settingPanel = drawingInstance.settingsPopup;
                if (settingPanel) {
                    const valueSelectorElm = settingPanel.find((settingsParams.ctrlSelector? settingsParams.ctrlSelector: "[inf-ctrl = value]") + "[inf-ctrl-val=" + value + "]");
                    if (valueSelectorElm.length > 0) {
                        settingPanel.data("infUndoRedo", true);
                        valueSelectorElm.trigger('click');
                    } else {
                        proceed(drawingInstance, settingsParams, isPropertyChange, value);
                    }
                } else {
                    proceed(drawingInstance, settingsParams, isPropertyChange, value);
                }
                drawingInstance.onPropertyChange();
            }

            infChart.commandsManager.registerCommand(xChartId, function () {
                undoRedo(value);
            }, function () {
                undoRedo(currentValue);
            }, undefined, false, 'onValueChange');
        }
        proceed(drawingInstance, settingsParams, isPropertyChange, value);
    });

    infChart.util.wrap(infChart.drawingSettings.eventHandlers, 'onCheckBoxValueChange', function (proceed, drawingInstance, settingsParams, isPropertyChange, value) {
        const ann = drawingInstance.annotation;
        if (_isTrackHistoryEnabledDrawing(ann) && isPropertyChange) {
            const xChartId = _getChartIdFromHighchartInstance(ann.chart);
            const currentValue = ann.options.settings[settingsParams.settingsItem];

            /**
             * Execute the undo/redo with the new properties
             * @param {string} newDashStyle new style to set
             */
            function undoRedo(value) {
                const settingPanel = drawingInstance.settingsPopup;
                if (settingPanel) {
                    const valueSelectorElm = settingPanel.find((settingsParams.ctrlSelector? settingsParams.ctrlSelector: "[inf-ctrl=value]"));
                    if (valueSelectorElm.length > 0) {
                        settingPanel.data("infUndoRedo", true);
                        valueSelectorElm.trigger('click');
                    } else {
                        proceed(drawingInstance, settingsParams, isPropertyChange, value);
                    }
                } else {
                    proceed(drawingInstance, settingsParams, isPropertyChange, value);
                }
                drawingInstance.onPropertyChange();
            }

            infChart.commandsManager.registerCommand(xChartId, function () {
                undoRedo(value);
            }, function () {
                undoRedo(currentValue);
            }, undefined, false, 'onCheckBoxValueChange');
        }
        proceed(drawingInstance, settingsParams, isPropertyChange, value);
    });

    /**
     * Wrapping up the infChart.drawingSettings.eventHandlers.onTextChange to catch the line text changes
     */
    infChart.util.wrap(infChart.drawingSettings.eventHandlers, 'onTextChange', function (proceed, drawingInstance, settingsParams, isPropertyChange, text) {
        const ann = drawingInstance.annotation;
        if (isPropertyChange && !infChart.drawingsManager.getIsActiveDrawingInprogress()) {
            const xChartId = _getChartIdFromHighchartInstance(ann.chart);
            const currentText = ann.options[settingsParams.settingsItem];
            const isAddToStack = text !== "" && currentText !== text;
            /**
             * Execute the undo/redo with the new properties
             * @param {string} newText new text being set
             */
            if(isAddToStack){
                function undoRedo(newText) {
                    var settingPanel = drawingInstance.settingsPopup;

                    proceed(drawingInstance, settingsParams, isPropertyChange, newText);
                    if (settingPanel) {
                        newText = newText.replace(/<br\s*\/?>/gi, "");
                        const textChangeElm = settingPanel.find((settingsParams.ctrlSelector? settingsParams.ctrlSelector: "[inf-ctrl=text]"));
                        textChangeElm.val(newText);
                    }
                    drawingInstance.onPropertyChange();
                }

                infChart.commandsManager.registerCommand(xChartId, function () {
                    undoRedo(text);
                }, function () {
                    undoRedo(currentText);
                }, undefined, false, 'onTextChange');
            }

        }
        return proceed(drawingInstance, settingsParams, isPropertyChange, text);

    });
    //endregion
})(jQuery, infChart);
