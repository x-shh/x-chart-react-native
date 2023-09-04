var infChart = window.infChart || {};

/**
 * Drawing Constructor
 * @param drawingId generated unique id for chart drawing
 * @param chartObj high chart object
 * @param shapeId type of the drawing
 * @param drawingSettingsContainer drawing settings popup container
 * @constructor
 */
infChart.Drawing = function (drawingId, chartObj, shapeId, drawingSettingsContainer, quickDrawingSettingsContainer, isContinuousDrawing) {
    this.drawingId = drawingId;
    this.shape = shapeId;
    this.chart = chartObj;
    this.container = chartObj.container;
    this.annotations = chartObj.annotations.allItems;
    this.annotation = undefined;
    this.drawingSettingsContainer = drawingSettingsContainer;
    this.quickDrawingSettingsContainer = quickDrawingSettingsContainer;
    this.fontSize = 12; // Only used in label tool
    this.dragSupporters = [];
    this.fibonacciDrawings = {}; // only used in Fibonacci drawing types
    this.additionalDrawings = {};
    this.isContinuousDrawing = isContinuousDrawing ? isContinuousDrawing : false;

    this.stockChartId = infChart.manager.getContainerIdFromChart(this.chart.renderTo.id);
    this.stockChart = infChart.manager.getChart(this.stockChartId);

    // this.stepFunction = function() {
    //     var ann = this.annotation;
    //     if(ann && ann.options && ann.options.snapToCandle) {
    //         var chart = ann.chart;
    //         var e = arguments[0];
    //         var x = e.chartX
    //         var xAxis = chart.xAxis[ann.options.xAxis],
    //             nearestXValue = infChart.math.findNearestXDataPoint(chart, ann.options.xValue, undefined, ann.options.useAllXDataToFindNearestPoint),
    //             nearestXValueEnd = infChart.math.findNearestXDataPoint(chart, xAxis.toValue(x), undefined, ann.options.useAllXDataToFindNearestPoint);

    //         ann.update({
    //             xValue: nearestXValue,
    //             nearestXValueEnd: nearestXValueEnd
    //         });

    //         e.chartX = xAxis.toPixels(nearestXValueEnd);
    //     }

    //     if(infChart.drawingUtils[shapeId].step) {
    //         return infChart.drawingUtils[shapeId].step.apply(this, arguments);
    //     }
    // };
    // this.stopFunction = function () {
    //     // callthing this through wrapper since this need to be catched from cammands wrapper
    //     return this.wrapFunctionHelper.call(this, "stopFunction", infChart.drawingUtils[shapeId].stop, arguments);
    // };
    //this.scalableFunction = infChart.drawingUtils[shapeId].scale;
    //this.selectAndBindResizeFunction = infChart.drawingUtils[shapeId].selectAndBindResize;
    // this.deselectFunction = infChart.drawingUtils[shapeId].deselect || function () {
    //     infChart.drawingUtils.common.onDeselect.call(this);
    // // };
    // this.selectFunction = infChart.drawingUtils[shapeId].select || function () {
    // };
    //this.additionalDrawingFunction = infChart.drawingUtils[shapeId].additionalDrawings;
    // this.translateFunction = function() {
    //     var ann = this.annotation;
    //     if(ann && ann.options && ann.options.snapToCandle) {
    //         var chart = ann.chart;
    //         var xAxis = chart.xAxis[ann.options.xAxis],
    //             nearestXValue = infChart.math.findNearestXDataPoint(chart, ann.options.xValue, undefined, ann.options.useAllXDataToFindNearestPoint),
    //             nearestXValueEnd = infChart.math.findNearestXDataPoint(chart, ann.options.xValueEnd, undefined, ann.options.useAllXDataToFindNearestPoint);

    //         var line = ann.shape.d.split(' '),
    //             newX = xAxis.toPixels(nearestXValue) - xAxis.toPixels(ann.options.xValue),
    //             newLine = ["M", 0, 0, 'L', xAxis.toPixels(nearestXValueEnd) - xAxis.toPixels(nearestXValue), line[5]];

    //         ann.update({
    //             xValue: nearestXValue,
    //             xValueEnd: nearestXValueEnd,
    //             shape: {
    //                 params: {
    //                     d: newLine
    //                 }
    //             }
    //         });
    //     }

    //     if(infChart.drawingUtils[shapeId].translate) {
    //         return infChart.drawingUtils[shapeId].translate.apply(this, arguments);
    //     }
    // }
    // this.translateEndFunction = infChart.drawingUtils[shapeId].translateEnd && function () {
    //     // callthing this through wrapper since this need to be catched from cammands wrapper
    //     return this.wrapFunctionHelper.call(this, "translateEndFunction", infChart.drawingUtils[shapeId].translateEnd, arguments);
    // };
    // this.destroyFunction = infChart.drawingUtils[shapeId].destroy;
    // this.beforeDestroyFunction = infChart.drawingUtils[shapeId].beforeDestroy;
    this.onPropertyChange = infChart.drawingUtils.common.onPropertyChange;
    //this.afterRedrawXAxisWithoutSetExtremesFunction = infChart.drawingUtils[shapeId].afterRedrawXAxisWithoutSetExtremes;

    // this.getConfigFunction = infChart.drawingUtils[shapeId].getConfig;//used in saving drawings
    // this.getConfigToCopyFunction = infChart.drawingUtils[shapeId].getConfigToCopy;//used in copy/paste
    // this.getPropertiesFunction = infChart.drawingUtils[shapeId].getOptions;//get specific options
    // this.getSettingsHTMLFunction = infChart.drawingUtils[shapeId].getSettingsPopup;//returns the html of the settings of the drawing
    // this.bindSettingsEventsFunction = infChart.drawingUtils[shapeId].bindSettingsEvents;
    // this.updateSettingsFunction = infChart.drawingUtils[shapeId].updateSettings;//update settings according to loaded properties
    // this.getPlotXFunction = infChart.drawingUtils[shapeId].getPlotX;//update settings according to loaded properties
    // this.getPlotHeightFunction = infChart.drawingUtils[shapeId].getPlotHeight;//returns the height of the drawing
    // this.updateOptionsFunction = infChart.drawingUtils[shapeId].updateOptions;//used in trading break even drawing
    // this.setPropertiesFunction = infChart.drawingUtils[shapeId].setOptions;//returns the height of the drawing
    // this.afterDragFunction = infChart.drawingUtils[shapeId].afterDrag;//returns the height of the drawing
    // //this.openDrawingSettingsFunction = infChart.drawingUtils[shapeId].openDrawingSettings;//open settings container
    // this.onClickFunction = infChart.drawingUtils[shapeId].onClick || function () {
    // };//set onclick event for the shape
    // this.getAxisOffset = infChart.drawingUtils[shapeId].getAxisOffset || function () {
    //     return 0;
    // };//returns the space required from the given axis
    // this.getContextMenuOptions = infChart.drawingUtils[shapeId].getContextMenuOptions || infChart.drawingUtils.common.getContextMenuOptions;
    //this.getNextPointOptions = infChart.drawingUtils[shapeId].getNextPointOptions;
    //this.hasMoreIntermediateSteps = infChart.drawingUtils[shapeId].hasMoreIntermediateSteps;
    //this.getClickValuesFunction = infChart.drawingUtils[shapeId].getClickValues;

    this.yValue = undefined;
    this.yValueEnd = undefined;
    this.trendYValue = undefined; // used in trend channel and andrew's pitchfork,
    this.intermediatePoints = [];
    this.isQuickSetting = true;

    /*this.isPercent =  this.stockChart.isPercent;
     this.isLog = this.stockChart.isLog;
     this.isCompare = this.stockChart.isCompare;*/
};

infChart.Drawing.prototype.translateFunction = function () {
    var ann = this.annotation;
    if (ann && ann.options && ann.options.snapToCandle) {
        var chart = ann.chart;
        var xAxis = chart.xAxis[ann.options.xAxis],
            nearestXValueData = infChart.math.findNearestDataPoint(chart, ann.options.xValue, undefined, ann.options.useAllXDataToFindNearestPoint, ann.options.useFutureDate),
            nearestXValueEndData = infChart.math.findNearestDataPoint(chart, ann.options.xValueEnd, undefined, ann.options.useAllXDataToFindNearestPoint, ann.options.useFutureDate);

        var line = ann.shape.d.split(' '),
            newX = xAxis.toPixels(nearestXValueData.xData) - xAxis.toPixels(ann.options.xValue),
            newLine = ["M", 0, 0, 'L', xAxis.toPixels(nearestXValueEndData.xData) - xAxis.toPixels(nearestXValueData.xData), line[5]];

        ann.update({
            xValue: nearestXValueData.xData,
            xValueDataIndex: nearestXValueData.dataIndex,
            xValueEnd: nearestXValueEndData.xData,
            xValueEndDataIndex: nearestXValueEndData.dataIndex,
            shape: {
                params: {
                    d: newLine
                }
            }
        });
    }

    if (this.translate) {
        return this.translate.apply(this, arguments);
    }
};

infChart.Drawing.prototype.stepFunction = function (e, isStartPoint) {
    var ann = this.annotation;
    if (ann && ann.options && ann.options.snapToCandle) {
        var chart = ann.chart;
        var x = e.chartX
        var xAxis = chart.xAxis[ann.options.xAxis],
            nearestXValueData = infChart.math.findNearestDataPoint(chart, ann.options.xValue, undefined, ann.options.useAllXDataToFindNearestPoint, ann.options.useFutureDate),
            nearestXValueEndData = infChart.math.findNearestDataPoint(chart, xAxis.toValue(x), undefined, ann.options.useAllXDataToFindNearestPoint, ann.options.useFutureDate);

        var options = {
            xValue: nearestXValueData.xData,
            xValueDataIndex: nearestXValueData.dataIndex
        };

        if(!isStartPoint) {
            options.nearestXValueEnd = nearestXValueEndData.xData;
            options.xValueEndDataIndex = nearestXValueEndData.dataIndex;
        }

        ann.update(options);

        e.chartX = xAxis.toPixels(nearestXValueEndData.xData);
    }

    if (this.step) {
        return this.step.apply(this, arguments);
    }
};

/**
 * This helps to wrap the above function since those are not defined as prototype functions
 * @param functionName
 * @param func
 * @param arguments
 * @returns {*}
 */
infChart.Drawing.prototype.wrapFunctionHelper = function (functionName, func, arguments) {
    if (func) {
        return func.apply(this, arguments);
    }
};

/**
 * This helps to open the setting panel when double click on the drawing.
 * @param {object} e
 */
infChart.Drawing.prototype.onDoubleClick = function (e) {
    this.openSettingPanel();
    e.stopPropagation();
};

infChart.Drawing.prototype.openSettingPanel = function () {
    var drawingObj = this;
    if (drawingObj.isQuickSetting) {
        infChart.drawingUtils.common.toggleSettings.call(drawingObj);
    } else if (drawingObj.shape === "highLowLabels" ) {
        infChart.drawingsManager.openSettings(drawingObj, false);
    }
};


infChart.Drawing.prototype.getTitle = function () {
    return infChart.manager.getLabel('label.' + this.shape);
};

infChart.Drawing.prototype.selectPointEvents = function (dragItem, stepFunction, stopFunction, isStartPoint, itemProperties) {
    var self = this;
    var ann = self.annotation, chart = ann.chart;
    var stockChartId = infChart.drawingsManager.getChartIdFromHighchartInstance(chart);
    var chartInstance = infChart.manager.getChart(stockChartId);

    function drag(e) {
        if (e.button !== 2 && !(e.ctrlKey && e.button === 0)) { // ignore right click - cannot use an event since mousedown event is fired first , ignore ctrl + click
            var chartId = infChart.drawingsManager.getChartIdFromHighchartInstance(chart);
            if (!infChart.drawingsManager.isMultipleDrawingsEnabled(chartId) && !infChart.drawingsManager.getIsActiveDrawingInprogress()) {
                //e.preventDefault();
                e.stopPropagation();
                e = chart.pointer.normalize(e);
                //ann.events.deselect.call(ann, e);
                if(self.showSelectionMarkers){
                    self.showSelectionMarkers(itemProperties);
                }
                chart.annotationChangeInProgress = true;
                infChart.drawingsManager.onAnnotationStore(ann);

                if (!ann.options.isLocked && !chartInstance.isGloballyLocked){
                    infChart.util.bindEvent(dragItem.element, 'mousemove', step);
                    infChart.util.bindEvent(dragItem.element, 'mouseup', drop);
                };
            }
        }
    }

    function step(e) {
        e = chart.pointer.normalize(e);
        if(ann.options){
            ann.options.mouseDownOnAnn = false;
            if(self.toggleFibLevelEraseIcon){
                self.toggleFibLevelEraseIcon(true);
            }
            if (stepFunction) {
                stepFunction.call(self, e, isStartPoint, itemProperties);
            }
        }
    }

    function drop(e) {
        e = self.chart.pointer.normalize(e);
        infChart.util.unbindEvent(dragItem.element, 'mouseDown', step);
        infChart.util.unbindEvent(dragItem.element, 'mouseup', drop);
        if (self.annotation && self.stop) {
            stopFunction.call(self, e, isStartPoint, itemProperties);
        }
        //$(document).unbind('.dragItem');
        // self.openDrawingSettings.call(self);
        self.selectAndBindResize();
        chart.selectedAnnotation = ann;
        chart.annotationChangeInProgress = false;
        infChart.drawingsManager.onAnnotationRelease(ann);
        if(self.toggleFibLevelEraseIcon){
            self.toggleFibLevelEraseIcon(false);
        }
    }

    infChart.util.bindEvent(dragItem.element, 'mousedown', drag);
};

/**
 * Destroy the drawing object
 * @param {boolean} isPropertyChange isPropertyChange used in wrappers
 * @param {object} properties deleted drawing obj properties used in wrappers
 * @returns {boolean}
 */
infChart.Drawing.prototype.destroy = function (isPropertyChange, properties) {
    var annotation = this.annotation,
        options = annotation.options;

    if (this.settingsPopup) {
        this.settingsPopup.remove();
        this.settingsPopup = null;
    }

    if (options.removeMouseMove) {
        options.removeMouseMove.forEach(function (removeFn) {
            removeFn();
        });
        options.removeMouseMove = undefined;
    }

    if (options.removeMouseUp) {
        options.removeMouseUp.forEach(function (removeFn) {
            removeFn();
        });
        options.removeMouseUp = undefined;
    }
    // need to do this before destroying annotation since properties are used inside destroy functions
    if (this.beforeDestroy) {
        this.beforeDestroy();
    }

    annotation.events.destroyAnnotation(annotation);
    if (this.destroyDrawing) {
        this.destroyDrawing();
    }

    // should redraw from the callee function id this is true
    return this.chartRedrawRequired && isPropertyChange;
};

infChart.Drawing.prototype.getOptions = function(properties,options){

    if (properties.isLocked !== "undefined") {
        options.isLocked = properties.isLocked;
    } else {
        options.isLocked = false;
    }

    return options;
};

/**
 * load setting window or popup based on option
 * @param {boolean} hide - hide setting popup
 * @param {object} options - settings option from config
 */
infChart.Drawing.prototype.loadSettingWindow = function (hide, options) {
    var self = this, content;
    function onClose() {
        infChart.drawingUtils.common.removeDrawing.call(self);
    }
    function ontoggleSettings() {
        infChart.drawingUtils.common.toggleSettings.call(self);
    }
    infChart.drawingsManager.setActiveDrawing(self.annotation);
    if (!self.settingsPopup) {
        var content = self.getSettingsPopup();
        if (content) {
            var html;
            if (options && options.isDisableDrawingSettingsPanel) {
                html = infChart.structureManager.settings.getPopupHTML(self.getTitle(), content);
                self.settingsPopup = $(html).appendTo(self.drawingSettingsContainer);
                var container = $('#' + infChart.manager.getContainerIdFromChart(self.stockChartId))[0];
                infChart.structureManager.settings.bindPopup(container, self.settingsPopup, ontoggleSettings);
            } else {
                html = infChart.structureManager.settings.getPanelHTML(self.stockChartId + "-drawing-panel", self.drawingId, self.getTitle(), content);
                self.settingsPopup = $(html).appendTo(self.drawingSettingsContainer);
                infChart.structureManager.settings.bindPanel(self.settingsPopup, onClose);
            }
            self.isQuickSetting = false;
            self.bindSettingsEvents();
        }
    }
    self.settingsPopup.data("infLoadSettings", true);
    self.updateSettings(self.getConfig());
    self.settingsPopup.data("infLoadSettings", false);
    if (!hide) {
        var popupPosition = options ? options.popupPosition : undefined;
        infChart.drawingsManager.setActiveDrawingSettings(self, popupPosition);

        if(self.focusAndSelectInput){
            self.focusAndSelectInput();
        }
    }
};

infChart.Drawing.prototype.loadQuickSettingPopup = function (isLocked) {
    var self = this;
    function onDelete() {
        infChart.drawingUtils.common.removeDrawing.call(self);
    }
    function ontoggleSettings() {
        infChart.drawingUtils.common.toggleSettings.call(self);
    }
    function toggleLock(element, isPropertyChange) {
        infChart.Drawing.prototype.toggleLock.call(self, element, isPropertyChange);
    }
    if (!self.settingsPopup) {
        var content = self.getQuickSettingsPopup();
        var html;
        if (content) {
            html = infChart.structureManager.drawingTools.getQuickSettingsPopupHTML(content,isLocked );
        } else {
            html = infChart.structureManager.drawingTools.getQuickSettingsPopupHTML("", isLocked);
        }
        this.settingsPopup = $(html).appendTo(self.quickDrawingSettingsContainer);
        infChart.toolbar.initializeTooltips($(this.settingsPopup));
        infChart.structureManager.drawingTools.bindQuickSettingsPopup(self.stockChartId, self.settingsPopup, onDelete, ontoggleSettings, toggleLock );
        self.bindSettingsEvents();
        self.isQuickSetting = true;
        self.settingsPopup.data("infLoadSettings", true);
        self.updateSettings(self.getConfig());
        self.settingsPopup.data("infLoadSettings", false);
    }
};

infChart.Drawing.prototype.updateSavedDrawingProperties = function (resetToDefault) {
    infChart.drawingsManager.updateSavedDrawingProperties(this.stockChartId, this.shape, this.drawingId, resetToDefault);
};

infChart.Drawing.prototype.resetToUserDefaultDrawingProperties = function () {
    infChart.drawingsManager.resetToUserDefaultDrawingProperties(this.stockChartId, this.shape, this.drawingId);
};

infChart.Drawing.prototype.reloadSettings = function () {
    infChart.drawingsManager.reloadSettings(this.stockChartId, this.drawingId);
};

infChart.Drawing.prototype.isSettingsPropertyChange = function () {
    return this.settingsPopup && !this.settingsPopup.data("infLoadSettings") && !this.settingsPopup.data("infUndoRedo");
};
/**
 * Open drawing settings or load settings and hide according to the request
 * @param {boolean|undefined} hide to hide panel
 * @param {object} options - settings option from config
 */
infChart.Drawing.prototype.openDrawingSettings = function (hide, options) {
    switch (this.annotation.options.drawingType) {
        case infChart.constants.drawingTypes.trading:
        case infChart.constants.drawingTypes.alert:
        case infChart.constants.drawingTypes.indicator:
            // this.loadSettingWindow(true);
            break;
        default:
            this.loadSettingWindow(!!hide, options);
            break;
    }
};

infChart.Drawing.prototype.showQuickDrawingSettings = function () {
    var self = this;
    infChart.structureManager.settings.hideAllSettingsPopups(true);
    if(!self.disableQuickSettingPanel){
        if (self.isQuickSetting) {
            if (!self.settingsPopup) {
                self.loadQuickSettingPopup(self.annotation.options.isLocked);
            } else {
                $(self.settingsPopup).show();
            }
        } else {
            infChart.drawingUtils.common.toggleSettings.call(self);
        }
    }
};

infChart.Drawing.prototype.isVisibleLastLevel = function () {
    var self = this;
    var count = 0;
    $.each(self.additionalDrawings.lines, function (key, value) {
        if (value.visibility !== 'hidden') {
            count = count + 1;
        }
    });

    return count === 1;
};



/**
 * drawing object yValue/yValueEnd/trendYValue are always the base y value
 * this will update the yValue/yValueEnd/trendYValue in annotation options according to the chart mode. eg : compare/log/percentage
 */
infChart.Drawing.prototype.scaleDrawing = function (isCalculateNewValueForScale) {
    var self = this,
        ann = self.annotation,
        yValues = {},
        stockChartId = infChart.drawingsManager.getChartIdFromHighchartInstance(ann.chart),
        chartInstance = infChart.manager.getChart(stockChartId);
    // TODO :: check why this method executes when changing pages in infinit app (Having trading tools in the chart with modified y min /max)
    if (ann && ann.chart) {

        if((chartInstance.isCompare || isCalculateNewValueForScale) && !(infChart.drawingsManager.getIsActiveDrawingInprogress())) {
            switch (self.shape) {
                case 'tradingLine':
                case 'holdingLine':
                case 'limitOrder':
                case 'upperLimit':
                case 'lowerLimit':
                case 'timestampMarker':
                    break;
                case 'trendChannel':
                case 'andrewsPitchfork':
                case 'fib3PointPriceProjectionHLH':
                case 'fib3PointPriceProjectionLHL':
                case 'fib3PointTimeProjection':
                case 'fib3PointPriceProjectionGeneric':
                    yValues["yValueEnd"] = infChart.drawingUtils.common.getYValue.call(self, self.yValueEnd);
                    yValues["trendYValue"] = infChart.drawingUtils.common.getYValue.call(self, self.trendYValue);
                    break;
                default:
                    yValues["yValueEnd"] = infChart.drawingUtils.common.getYValue.call(self, self.yValueEnd);
                    break;
            }
            if (self.intermediatePoints) {
                var intermediatePoints = [];
                infChart.util.forEach(self.intermediatePoints, function (index, value) {
                    intermediatePoints.push({
                        xValue: value.xValue,
                        yValue: infChart.drawingUtils.common.getYValue.call(self, value.yValue)
                    });
                });
                yValues["intermediatePoints"] = intermediatePoints;
            }

            if (self.nearestIntermediatePoints) {
                var nearestIntermediatePoints = [];
                infChart.util.forEach(self.nearestIntermediatePoints, function (index, value) {
                    nearestIntermediatePoints.push({
                        xValue: value.xValue,
                        yValue: infChart.drawingUtils.common.getYValue.call(self, value.yValue),
                        topOfThePoint: value.topOfThePoint
                    });
                });
                yValues["nearestIntermediatePoints"] = nearestIntermediatePoints;
            }

            yValues["yValue"] = infChart.drawingUtils.common.getYValue.call(self, self.yValue);
            if (self.nearestYValue) {
                yValues["nearestYValue"] = infChart.drawingUtils.common.getYValue.call(self, self.nearestYValue);
            }
            if (self.nearestYValueEnd) {
                yValues["nearestYValueEnd"] = infChart.drawingUtils.common.getYValue.call(self, self.nearestYValueEnd);
            }
            if (self.nearestTrendYValue) {
                yValues["nearestTrendYValue"] = infChart.drawingUtils.common.getYValue.call(self, self.nearestTrendYValue);
            }

            ann.update(yValues);
        }
        if(chartInstance.isCompare){
            self.scale(true);
        } else {
            if(ann && ann.chart && ann.chart.annotationChangeInProgress){
                self.scale(true);
            } else {
                self.scale(isCalculateNewValueForScale);
            }
        }
        // ann.events.deselect.call(ann);
        //ann.chart.seriesGroup.toFront();

        //If the annotation is already selected the selection markers should update
        if (ann.selectionMarker && ann.selectionMarker.length && self.stop && self.selectAndBindResize) {
            self.selectAndBindResize();
            ann.chart.selectedAnnotation = ann;
        }

        //When reload the drawings from properties those drawing needs to be deselected 
        if(isCalculateNewValueForScale){
            if(self.annotation.selectionMarker){
                for (var i = 0; i < self.annotation.selectionMarker.length; i++) {
                    self.annotation.selectionMarker[i].destroy();
                }
            }
            self.annotation.selectionMarker = false;
            self.deselect(true);
            self.annotation.chart.selectedAnnotation = null;
        }

        var chart = ann.chart,
            yAxes = chart.yAxis,
            yLen = yAxes.length,
            groups = chart.annotations.groups,
            parentNode = ann.chart.seriesGroup.element.parentNode,
            i = 0;

        /*for (; i < yLen; i++) {
         parentNode.insertBefore(groups[i + "-behind-series"].element, ann.chart.seriesGroup.element);
         }*/
    }
};

/**
 * Event handler for afterRedrawXAxisWithoutSetExtremes
 */
// infChart.Drawing.prototype.afterRedrawXAxisWithoutSetExtremes = function () {
//     var ann = this.annotation;
//     if (ann && ann.chart && this.afterRedrawXAxisWithoutSetExtremes) {
//         this.afterRedrawXAxisWithoutSetExtremes();
//     }
// };

/**
 *  update drawing object from given properties
 * @param {object} properties new properties
 * @param {boolean|undefined} redraw indicate redraw
 */
infChart.Drawing.prototype.update = function (properties, redraw) {
    if (typeof redraw === "undefined") {
        redraw = true;
    }
    var ann = this.annotation;
    if (ann) {
        var options = this.annotation.options;

        if(this.beforeUpdateOptions) {
            this.beforeUpdateOptions(properties);
        }

        properties.yValue && (this.yValue = properties.yValue);
        properties.yValueEnd && (this.yValueEnd = properties.yValueEnd);
        properties.trendYValue && (this.trendYValue = properties.trendYValue);
        properties.xValue && (options.xValue = properties.xValue);
        properties.xValueEnd && (options.xValueEnd = properties.xValueEnd);
        properties.trendXValue && (options.trendXValue = properties.trendXValue);

        if(properties.jointLineValue){
            options.jointLineValue = properties.jointLineValue;
        }

        if (properties.intermediatePoints) {
            this.intermediatePoints = properties.intermediatePoints;
        }

        if (this.updateOptions) {
            this.updateOptions(properties);
        }
        if (redraw) {
            this.scaleDrawing(true);
        }
    }
};

infChart.Drawing.prototype.toggleLock = function (element, isPropertyChange) {

    var self = this;
    var ann = self.annotation;

    if (typeof isPropertyChange == 'undefined') {
        isPropertyChange = true;
    }

    if (ann.options.isLocked){
        $($(element).parent()[0]).attr({'adv-chart-tooltip' : infChart.manager.getLabel('label.lock')});
    } else {
        $($(element).parent()[0]).attr({'adv-chart-tooltip' : infChart.manager.getLabel('label.unlock')});
    };



    if (ann.options){
        ann.options.isLocked = !ann.options.isLocked ;

        if (ann.options.isLocked){
            $($(element).children()[0]).attr({class: 'icom icom-lock' })
        } else {
            $($(element).children()[0]).attr({class: 'icom icom-unlock' })
        };
    };

    isPropertyChange && self.onPropertyChange();
    if (this.settingsPopup) {
        this.settingsPopup.data("infUndoRedo", false);
    }
    infChart.drawingUtils.common.saveDrawingProperties.call(self);
};

infChart.Drawing.prototype.saveDrawingTemplate = function (templateName) {
    infChart.drawingsManager.saveDrawingTemplate(this.stockChartId,  this.drawingId, this.shape, templateName);
};

infChart.Drawing.prototype.applyDrawingTemplate = function (templateName) {
    infChart.drawingsManager.applyDrawingTemplate(this.stockChartId, this.drawingId, this.shape, templateName);
};

infChart.Drawing.prototype.deleteDrawingTemplate = function (templateName) {
    infChart.drawingsManager.deleteDrawingTemplate(this.stockChartId, this.drawingId, this.shape, templateName);
};

infChart.Drawing.prototype.getDrawingTemplates = function () {
    return infChart.drawingsManager.getDrawingTemplates(this.stockChartId, this.shape);
};

infChart.Drawing.prototype.getUserDefaultSettings = function () {
    return infChart.drawingsManager.getUserDefaultDrawingProperties(this.stockChartId, this.shape);
};
