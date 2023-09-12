window.infChart = window.infChart || {};

(function (infChart, $) {

    /**
     * @typedef {Object} drawing
     * @property {function} getOptions - drawing options
     * @property {function} getConfig - drawing config
     * @property {function} step - start fn
     * @property {function} stop - end fn
     * @property {function} scale - scaling fn
     * @property {function} translate - translate fn
     * @property {function} additionalDrawings - draw additional drawings
     * @property {function} selectAndBindResize - resize fn
     * @property {function} updateSettings - settings update
     * @property {function} getSettingsPopup - settings popup
     * @property {function} bindSettingsEvents - bind settings events
     */

    infChart.drawingUtils = infChart.drawingUtils || {};

    infChart.drawingUtils.common = {
        baseBorderColor: '#959595',
        baseFillColor: '#959595',
        baseFillOpacity: 0.5,
        baseLineWidth: 1,
        baseLineStyle: 'solid',
        dragSupporterStyles: {
            'stroke-width': 15,
            stroke: 'transparent',
            fill: 'transparent',
            'z-index': 1,
            cursor: 'move'
        },
        correctionFactor: 100,
        baseFontWeight : 'normal',
        setTheme: function (forced) {
            var highChartTheme = infChart.themeManager.getTheme();
            if (forced || highChartTheme) {
                var defaultTheme = {
                    //TODO :: move other theme related default settings here and apply changes in the theme file if any
                    selectPointStyles: {
                        'stroke-width': 1,
                        stroke: '#959595',
                        fill: '#333',
                        dashstyle: 'solid',
                        'shape-rendering': 'crispEdges',
                        'z-index': 10,
                        cursor: 'crosshair',
                        'class': 'selection-marker'
                    },
                    upArrow: {
                        fillColor: "#52ac62"
                    },
                    downArrow: {
                        fillColor: "#d00a20"
                    },
                    defaultCopyDistance: 20,
                    fibonacci: {
                        singleFillColor: '#3A8DC9'
                    },
                    fibVerRetracements: {
                        fillOpacity: 0.5,
                        fibLevelFillColors: {
                            "level_0": "#726a6f",
                            "level_1": "#835974",
                            "level_2": "#7b6171",
                            "level_3": "#f8bce2",
                            "level_4": "#f075c3",
                            "level_5": "#eb40ab",
                            "level_6": "#c71585",
                            "level_7": "#800e56",
                            "level_8": "#4b0832",
                            "level_9": "#726a6f",
                            "level_10": "#835974",
                            "level_11": "#7b6171",
                            "level_12": "#f8bce2",
                            "level_13": "#f075c3",
                            "level_14": "#eb40ab",
                            "level_15": "#c71585"
                        }
                    },
                    fibArcs: {
                        fibLevelFillColors: {
                            "level_0": "#4b0832",
                            "level_1": "#f075c3",
                            "level_2": "#f6aada"
                        }
                    },
                    fibFans: {
                        fibLevelFillColors: {
                            "level_0": "#FFB6C1",
                            "level_1": "#ADD8E6",
                            "level_2": "#D3D3D3"
                        }
                    },
                    fibRetracements: {
                        fillOpacity: 0.5,
                        fibLevelFillColors: {
                            "level_0": "#726a6f",
                            "level_1": "#835974",
                            "level_2": "#7b6171",
                            "level_3": "#f8bce2",
                            "level_4": "#f075c3",
                            "level_5": "#eb40ab",
                            "level_6": "#c71585",
                            "level_7": "#800e56",
                            "level_8": "#4b0832",
                            "level_9": "#726a6f",
                            "level_10": "#835974",
                            "level_11": "#7b6171",
                            "level_12": "#f8bce2",
                            "level_13": "#f075c3",
                            "level_14": "#eb40ab",
                            "level_15": "#c71585"
                        }
                    },
                    regressionChannel: {
                        fillColors: {
                            "upper": "#726a6f",
                            "lower": "#835974"
                        }
                    }
                },
                theme;

                if (highChartTheme && highChartTheme.drawing) {
                    theme = infChart.util.merge({}, defaultTheme, highChartTheme.drawing);
                }

                if (theme && theme.base) {
                    if (theme.base.borderColor) {
                        infChart.drawingUtils.common.baseBorderColor = theme.base.borderColor;
                    }
                    if (theme.base.fillColor) {
                        infChart.drawingUtils.common.baseFillColor = theme.base.fillColor;
                    }
                    if (theme.base.fillOpacity) {
                        infChart.drawingUtils.common.baseFillOpacity = theme.base.fillOpacity;
                    }
                    if (!isNaN(theme.base.lineWidth)) {
                        infChart.drawingUtils.common.baseLineWidth = theme.base.lineWidth;
                    }
                    if (!isNaN(theme.base.dashstyle)) {
                        infChart.drawingUtils.common.baseLineStyle = theme.base.dashstyle;
                    }
                    if (theme.base.fontColor) {
                        infChart.drawingUtils.common.baseFontColor = theme.base.fontColor;
                    }
                    if (theme.base.fontSize) {
                        infChart.drawingUtils.common.baseFontSize = theme.base.fontSize;
                    }
                    if (theme.base.fontWeight) {
                        infChart.drawingUtils.common.baseFontWeight = theme.base.fontWeight;
                    }
                }
                infChart.drawingUtils.common.theme = theme || defaultTheme;
            }
        },
        getTheme: function () {
            if (!infChart.drawingUtils.common.theme) {
                infChart.drawingUtils.common.setTheme.call(this);
            }
            return infChart.drawingUtils.common.theme;
        },
        getDefaultOptions: function () {
            return {
                xValue: 0,
                yValue: 0,
                allowDragX: true,
                allowDragY: true,
                anchorX: 'left',
                anchorY: 'top',
                xAxis: 0,
                yAxis: 0,
                isSingleColor: false,
                //linkedTo : "c0",
                drawingType: infChart.constants.drawingTypes.shape,
                shape: {
                    type: 'path',
                    params: {
                        fill: infChart.drawingUtils.common.baseFillColor,
                        stroke: infChart.drawingUtils.common.baseBorderColor,
                        'fill-opacity': infChart.drawingUtils.common.baseFillOpacity,
                        'stroke-width': 1,
                        cursor: 'move',
                        'z-index': 2
                    }
                }
            }
        },
        removeDragSupporters: function (dragSupporters) {
            while (dragSupporters.length) {
                var supporter = dragSupporters.pop();
                supporter.destroy();
            }
        },
        /**
         * add drag supporters common method
         * @param {object} annotation - drawing annotation
         * @param {object} chart - chart object
         * @param {Array} path - path of svg
         * @param {Array} dragSupporters - existing drag supporters
         * @param {object} customAttributes
         * @param {object} dragSupporterStyles - drag supporters style properties
         */
        addDragSupporters: function (annotation, chart, path, dragSupporters, customAttributes, dragSupporterStyles) { //Todo: refactor add drag supporters
            var dragSupStyles = dragSupporterStyles ? dragSupporterStyles : infChart.drawingUtils.common.dragSupporterStyles;
            var dragSupportStyles = {};
            if(customAttributes){
                Object.assign(dragSupportStyles, dragSupStyles , customAttributes);
            }else{
                dragSupportStyles = dragSupStyles;
            }
            dragSupporters.push(chart.renderer.path(path).attr(dragSupportStyles).add(annotation.group));
            infChart.drawingUtils.common.setDeleteCursor.call(this); //#CCA-2958
            infChart.drawingUtils.common.setDeleteModeCursor.call(this);
        },
        addSelectionMarker: function (ann, x, y, selectPointStyles) {
            var padding = infChart.settings.config.isMobile ? 30 : 13,
                chart = ann.chart,
                point,
                themeSelP = infChart.drawingUtils.common.getTheme.call(this).selectPointStyles;

            selectPointStyles = selectPointStyles ? infChart.util.merge({}, themeSelP, selectPointStyles) : themeSelP;

            point = chart.renderer.circle(x, y, padding / 2).attr(selectPointStyles).add(ann.group);
            ann.selectionMarker.push(point);
            if(this.shape !== "shortLine" &&  this.shape !== "longLine"){
                ann.group.addClass('active-drawing');
            }

            return point;
        },
        addAdditionalDrawingSelectionMarker: function (ann, chart, x, y, selectPointStyles) {
            var padding = 13,
                chart = ann.chart,
                point,
                themeSelP = infChart.drawingUtils.common.getTheme.call(this).selectPointStyles;

            selectPointStyles = selectPointStyles ? infChart.util.merge({}, themeSelP, selectPointStyles) : themeSelP;

            point = chart.renderer.circle(x, y, padding / 2).attr(selectPointStyles).add(ann.group);
            return point;
        },
        addSelectionMarkerLabel: function (x, y, value, optionValue, isXAxis, labelTheme) {
            var ann = this.annotation;
            var label = infChart.drawingUtils.common.getAxisLabel.call(this, x, y, value, optionValue, isXAxis, labelTheme);
            ann.selectionMarker.push(label);
            return label;
        },
        onDeselect: function () {
            this.annotation && this.annotation.group.removeClass('active-drawing');
        },
        /**
             * Copy the text to clipboard from fib levels
             * * @param {string} currentLevel selected level of the fib level
             */
        onFibLevelCopy: function (currentLevel, subType) {
            var self = this;
            var shape = self.shape;
            switch (shape){
                case 'fibRetracements':
                case 'fib3PointPriceProjectionHLH':
                case 'fib3PointPriceProjectionLHL':
                    var label = self.fibonacciDrawings.lines[currentLevel].text.textStr;
                    break;
                case 'fibVerRetracements':
                case 'fib3PointTimeProjection':
                case 'fib2PointTimeProjection':
                    var label = self.additionalDrawings.labels[currentLevel].text.textStr.replace("<br/>", " ");
                    break;
                case 'fib3PointPriceProjectionGeneric':
                    if(subType == "fibExtention"){
                        var label = self.fibonacciDrawings.labels[currentLevel].text.textStr;
                    }
                    if(subType == "fibRetracement"){
                        var label = self.fibRetrancementAdditionalDrawing.labels[currentLevel].text.textStr;
                    }
                    break;
            }
            infChart.util.copyToClipBoard(label);
        },   
        addAndBindSelectionMarker: function (ann, x, y, stepFunction, stop, isStartPoint, selectPointStyles, properties) {
            var point = infChart.drawingUtils.common.addSelectionMarker(ann, x, y, selectPointStyles);
            this.selectPointEvents(point, stepFunction, stop, isStartPoint, properties);
            return point;
        },
        fixSelectionMarker: function (ann) {
            if (ann.selectionMarker) {
                for (var i = 0; i < ann.selectionMarker.length; i++) {
                    ann.selectionMarker[i].toFront();
                }
            }
        },
        saveBaseYValues: function (yValue, yValueEnd, trendYValue, intermediatePoints) {
            var self = this;
            this.yValue = yValue ? this.stockChart.getYLabel(yValue, false, true, true) : yValue;
            this.yValueEnd = yValueEnd ? this.stockChart.getYLabel(yValueEnd, false, true, true) : yValueEnd;
            this.trendYValue = trendYValue ? this.stockChart.getYLabel(trendYValue, false, true, true) : trendYValue;

            if (intermediatePoints) {
                var intermediatePointsNew = [];
                infChart.util.forEach(intermediatePoints, function (index, value) {
                    intermediatePointsNew.push({
                        xValue: value.xValue,
                        yValue: self.stockChart.getYLabel(value.yValue, false, true, true)
                    });
                });
                self.intermediatePoints = intermediatePointsNew;
            }

            this.isPercent = false;
            this.isLog = false;
            this.isCompare = false;
        },
        saveNearestBaseYValues: function (yValue, yValueEnd, trendYValue, nearestIntermediatePoints) {
            var self = this;
            this.nearestYValue = yValue ? this.stockChart.getYLabel(yValue, false, true, true) : yValue;
            this.nearestYValueEnd = yValueEnd ? this.stockChart.getYLabel(yValueEnd, false, true, true) : yValueEnd;
            this.nearestTrendYValue = trendYValue ? this.stockChart.getYLabel(trendYValue, false, true, true) : trendYValue; 

            if (nearestIntermediatePoints) {
                var nearestIntermediatePointsNew = [];
                infChart.util.forEach(nearestIntermediatePoints, function (index, value) {
                    nearestIntermediatePointsNew.push({
                        xValue: value.xValue,
                        yValue: self.stockChart.getYLabel(value.yValue, false, true, true),
                        topOfThePoint: value.topOfThePoint
                    });
                });
                self.nearestIntermediatePoints = nearestIntermediatePointsNew;
            }
        },
        getBaseYValues: function (yValue) {
            return yValue ? this.stockChart.getYLabel(yValue, false, true, true) : yValue;
        },
        getYValue: function (yValue) {
            var chartObj = this.stockChart,
                isPercent = chartObj.isPercent,
                isLog = chartObj.isLog,
                isCompare = chartObj.isCompare;

            if (this.isLog == isLog && this.isCompare == isCompare && this.isPercent == isPercent) {
                return yValue;
            }
            return chartObj.convertBaseYValue(yValue, isLog, isCompare, isPercent);
        },
        getBaseYValue: function (currentYValue) {
            var isPercent = this.stockChart.isPercent,
                isLog = this.stockChart.isLog,
                isCompare = this.stockChart.isCompare;

            return this.stockChart.getBaseValue(currentYValue, isLog, isCompare, isPercent);
        },
        formatValue: function (value, dp) {
            return infChart.util.formatNumber(value, dp);
        },
        calculateInitialPoints: function (e, ann, isStartPoint, correctionFactorX, correctionFactorY) {
            var chart = ann.chart,
                //bbox = chart.container.getBoundingClientRect(),
                x = e.chartX,
                y = e.chartY;
            /*x = e.clientX - bbox.left,
             y = e.clientY - bbox.top;
             if (chart.infScaleX) {
             x = x / chart.infScaleX;
             }
             if (chart.infScaleY) {
             y = y / chart.infScaleY;
             }*/
            var xAxis = chart.xAxis[ann.options.xAxis],
                yAxis = chart.yAxis[ann.options.yAxis],
                dx = x - xAxis.toPixels(ann.options.xValue),
                dy = y - yAxis.toPixels(ann.options.yValue);

            if (isStartPoint) {
                dx = xAxis.toPixels(ann.options.xValueEnd) - x;
                dy = yAxis.toPixels(ann.options.yValueEnd) - y;

                ann.update({
                    xValue: xAxis.toValue(x),
                    yValue: yAxis.toValue(y)
                });
            }

            correctionFactorX = dx > 0 ? correctionFactorX * -1 : correctionFactorX;
            correctionFactorY = dy > 0 ? correctionFactorY * -1 : correctionFactorY;

            return { xAxis: xAxis, x: x, dx: dx + correctionFactorX, yAxis: yAxis, y: y, dy: dy + correctionFactorY };
        },
        getLineSettings: function (title, color, labelDataItems, isLineText, textFontSize, textFontColor, opacity, isExtendAvailable, isArrowAvaialable) {
            return infChart.structureManager.drawingTools.getLineSettings(color, labelDataItems, isLineText, textFontSize, textFontColor, opacity, isExtendAvailable, isArrowAvaialable);
        },
        getLineQuickSettings: function (color, opacity) {
            return infChart.structureManager.drawingTools.getLineQuickSettings(color, opacity);
        },
        getPriceLineQuickSettings: function () {
            return infChart.structureManager.drawingTools.getPriceLineQuickSettings();
        },
        // common setting to rectangle, ellipse, regression line and andrew's pitchfork
        getBasicDrawingSettings: function (title, lineColor, fillColor, fillopacity, shape, textFontSize, textFontColor) {
            return infChart.structureManager.drawingTools.getBasicDrawingSettings(title, lineColor, fillColor, fillopacity, shape, textFontSize, textFontColor);
        },
        getRectangleQuickSettings: function (lineColor, fillColor, fillOpacity) {
            return infChart.structureManager.drawingTools.getRectangleQuickSettings(lineColor, fillColor, fillOpacity);
        },
        getArrowSettings: function (title, color, textMaxContent, textFontColor, textFontSize) {
            return infChart.structureManager.drawingTools.getArrowSettings(color, textMaxContent, textFontColor, textFontSize);
        },
        getFibSettings: function (properties) {
            return infChart.structureManager.drawingTools.getFibSettings(properties);
        },
        getGenericFibSettings: function (properties) {
            return infChart.structureManager.drawingTools.getGenericFibSettings(properties);
        },
        getGenericQuickFibSettings: function () {
            return infChart.structureManager.drawingTools.getGenericQuickFibSettings();
        },
        getFibQuickSettings: function (fillColor, fillOpacity, lineColor, fontColor, fontSize) {
            return infChart.structureManager.drawingTools.getFibQuickSettings('single', fillColor, fillOpacity, lineColor, fontColor, fontSize);
        },
        getPriceLineSettings: function (takeProfitLevels, stopLossLevels, yValue) {
            return infChart.structureManager.drawingTools.getPriceLineSettings(takeProfitLevels, stopLossLevels, yValue);
        },
        /**
         * sort fib level by the value
         * @param {Array} fibLevels - fib levels
         * @returns {Array} sorted fib levels
         */
        sortFibLevelsByValue: function (fibLevels) {
            fibLevels.sort(function (a, b) {
                return a.value >= b.value;
            });
            return fibLevels;
        },
        /**
         * add opacity to each fib level
         * @param {Array} fibLevels - fib levels
         * @param {number} baseFillOpacity - fill opacity
         * @returns
         */
        getFibLevelsWithOpacity: function (fibLevels, baseFillOpacity) {
            fibLevels.forEach(function (fibLevel) {
                if (!fibLevel.hasOwnProperty('fillOpacity')) {
                    fibLevel['fillOpacity'] = baseFillOpacity;
                }
            });
            return fibLevels;
        },
        getAndrewsPitchForkSettings: function(options) {
            return infChart.structureManager.drawingTools.getAndrewsPitchForkSettings(options);
        },
        removeDrawing: function () {
            var stockChart = this.stockChart;
            infChart.drawingsManager.removeDrawing(stockChart.id, this.drawingId, false, true);
            infChart.drawingsManager.updateIsGloballyLockInDelete(stockChart.id);
        },
        toggleSettings: function () {
            var stockChart = this.stockChart;
            infChart.drawingsManager.toggleSettings(infChart.drawingsManager.getDrawingObject(stockChart.id, this.drawingId), false);
        },
        saveDrawingProperties : function () {
            this.updateSavedDrawingProperties(false);
        },
        onPropertyChange: function (propertyName) {
            propertyName = propertyName || 'drawings';
            var drawingObj = this;
            if (drawingObj && drawingObj.annotation && drawingObj.annotation.options && drawingObj.annotation.options.drawingType == 'shape') {
                var stockChart = drawingObj.stockChart;
                stockChart._onPropertyChange(propertyName);
            }
        },
        bindLineSettingsEvents: function (onLabelItemsChange) {
            var self = this;
            if(self.annotation.options.lineTextChecked) {
                self.settingsPopup.find("input[inf-ctrl=line-text]").removeAttr("disabled");
            } else {
                self.settingsPopup.find("input[inf-ctrl=line-text]").attr("disabled","disabled");
            }
            function onLineWidthChange(strokeWidth) {
                var isPropertyChange = true;
                if (self.settingsPopup) {
                    isPropertyChange = self.isSettingsPropertyChange();
                }
                infChart.drawingUtils.common.settings.onLineWidthChange.call(self, strokeWidth, isPropertyChange);
            }
            function onColorChange(rgb, color) {
                var isPropertyChange = true;
                if (self.settingsPopup) {
                    isPropertyChange = self.isSettingsPropertyChange();
                }
                infChart.drawingUtils.common.settings.onLineColorChange.call(self, rgb, color, isPropertyChange);
            }
            function onTextColorChange(rgb, color) {
                var isPropertyChange = true;
                if (self.settingsPopup) {
                    isPropertyChange = self.isSettingsPropertyChange();
                }
                infChart.drawingUtils.common.settings.onTextColorChange.call(self, rgb, color, isPropertyChange);
            }
            function onTextSizeChange(newFontSize) {
                var isPropertyChange = true;
                if (self.settingsPopup) {
                    isPropertyChange = self.isSettingsPropertyChange();
                }
                infChart.drawingUtils.common.settings.onTextSizeChange.call(self, newFontSize, isPropertyChange);
            }
            function onLineStyleChange(dashStyle) {
                var isPropertyChange = true;
                if (self.settingsPopup) {
                    isPropertyChange = self.isSettingsPropertyChange();
                }
                infChart.drawingUtils.common.settings.onLineStyleChange.call(self, dashStyle, isPropertyChange);
            }

            function onLineTextChange(text) {
                var isPropertyChange = true;
                if (self.settingsPopup) {
                    isPropertyChange = self.isSettingsPropertyChange() && (text !== "" && self.annotation.options.lineText !== text);
                }
                infChart.drawingUtils.common.settings.onTextChange.call(self, text, isPropertyChange);
            }

            function onToggleLineText(checked) {
                var isPropertyChange = true;
                if (self.settingsPopup) {
                    isPropertyChange = self.isSettingsPropertyChange();
                }
                if (onToggleLineText) {
                    infChart.drawingUtils.common.settings.onToggleText.call(self, checked, isPropertyChange);
                }
            }

            function onResetToDefault () {
                self.updateSavedDrawingProperties(true);
            }

            var callBackFnLineSettingsEvents = {
                onColorChange: onColorChange,
                onLineWidthChange: onLineWidthChange,
                onLineStyleChange: onLineStyleChange,
                onResetToDefault: onResetToDefault,
                onLineTextChange: onLineTextChange,
                onToggleLineText: onToggleLineText,
                onTextColorChange: onTextColorChange,
                onTextSizeChange: onTextSizeChange,
                onLabelItemsChange: onLabelItemsChange
            }

            infChart.structureManager.drawingTools.bindLineSettings(self.settingsPopup, callBackFnLineSettingsEvents);
        },
        bindShortLongLineSettingsEvents: function (onLabelItemsChange) {
            var self = this;

            var priceLines = {
                takeProfits: this.takeProfit,
                stopLoss: this.stopLoss
            }

            function onEntryValueChange(element, value) {
                var isPropertyChange = true;
                if (self.settingsPopup) {
                    isPropertyChange = self.isSettingsPropertyChange();
                }
                infChart.drawingUtils.common.settings.onEntryValueChange.call(self, element, value, isPropertyChange);
            }

            function onApplyLine(checked, lineType) {
                var isPropertyChange = true;
                if (self.settingsPopup) {
                    isPropertyChange = self.isSettingsPropertyChange();
                }
                infChart.drawingUtils.common.settings.onApplyLine.call(self, checked, lineType, isPropertyChange);
            }


            function onPriceValueChange(element, priceValue, type) {
                var isPropertyChange = true;
                if (self.settingsPopup) {
                    isPropertyChange = self.isSettingsPropertyChange();
                }
                infChart.drawingUtils.common.settings.onPriceValueChange.call(self, element, priceValue, type, isPropertyChange);
            }

            function onPriceLineWidthChange(type, strokeWidth) {
                var isPropertyChange = true;
                if (self.settingsPopup) {
                    isPropertyChange = self.isSettingsPropertyChange();
                }
                infChart.drawingUtils.common.settings.onPriceLineWidthChange.call(self, type, strokeWidth, isPropertyChange);
            }

            function onPriceLineStyleChange(type, lineStyle) {
                var isPropertyChange = true;
                if (self.settingsPopup) {
                    isPropertyChange = self.isSettingsPropertyChange();
                }
                infChart.drawingUtils.common.settings.onPriceLineStyleChange.call(self, type, lineStyle, isPropertyChange);
            }

            function onResetToDefault () {
                self.updateSavedDrawingProperties(true);
            }

            function onColorChange(rgb, color, type) {
                var isPropertyChange = true;
                if (self.settingsPopup) {
                    isPropertyChange = self.isSettingsPropertyChange();
                }
                infChart.drawingUtils.common.settings.onPriceLineColorChange.call(self, color, type, isPropertyChange);
            }

            infChart.structureManager.drawingTools.bindPriceLineSettings(self.settingsPopup, onEntryValueChange, onApplyLine, onPriceValueChange, onPriceLineWidthChange, onPriceLineStyleChange, onResetToDefault, onColorChange, priceLines);
        },
        // common bind setting to rectangle, ellipse, regression line and andrew's pitchfork
        bindBasicDrawingSettingsEvents: function (lineColor, fillColor, onExtendToLeft, onExtendToRight) {
            var self = this;

            if (self.settingsPopup) {

                function onLineWidthChange(strokeWidth) {
                    var isPropertyChange = true;
                    if (self.settingsPopup) {
                        isPropertyChange = self.isSettingsPropertyChange();
                    }
                    infChart.drawingUtils.common.settings.onLineWidthChange.call(self, strokeWidth, isPropertyChange);
                }

                function onColorChange(rgb, color) {
                    var isPropertyChange = true;
                    if (self.settingsPopup) {
                        isPropertyChange = self.isSettingsPropertyChange();
                    }
                    infChart.drawingUtils.common.settings.onLineColorChange.call(self, rgb, color, isPropertyChange, "[inf-ctrl=lineColorPicker]");
                }

                function onFillColorChange(rgb, value, opacity) {
                    var isPropertyChange = true;
                    if (self.settingsPopup) {
                        isPropertyChange = self.isSettingsPropertyChange();
                    }
                    infChart.drawingUtils.common.settings.onFillColorChange.call(self, rgb, value, opacity, isPropertyChange, "[inf-ctrl=fillColorPicker]");
                }

                function onBasicDrawingTextChange(text) {
                    var isPropertyChange = true;
                    if (self.settingsPopup) {
                        var optionsText = self.shape === "rectangle" ?  self.annotation.options.rectText : self.annotation.options.ellipseText;
                        isPropertyChange = self.isSettingsPropertyChange() && (text !== "" && (optionsText !== text ));
                    }
                    infChart.drawingUtils.common.settings.onTextChange.call(self, text, isPropertyChange);
                }
    
                function onToggleBasicDrawingText(checked) {
                    var isPropertyChange = true;
                    if (self.settingsPopup) {
                        isPropertyChange = self.isSettingsPropertyChange();
                    }
                    if (onToggleBasicDrawingText) {
                        infChart.drawingUtils.common.settings.onToggleText.call(self, checked, isPropertyChange);
                    }
                }

                function onVerticalPositionSelect(position) {
                    var isPropertyChange = true;
                    if (self.settingsPopup) {
                        isPropertyChange = self.isSettingsPropertyChange() && (position !== "" && self.annotation.options.verticalPosition !== position);
                    }
                    infChart.drawingUtils.common.settings.onVerticalPositionSelect.call(self, position, isPropertyChange);
                }

                function onHorizontalPositionSelect(position) {
                    var isPropertyChange = true;
                    if (self.settingsPopup) {
                        isPropertyChange = self.isSettingsPropertyChange() && (position !== "" && self.annotation.options.horizontalPosition !== position);
                    }
                    infChart.drawingUtils.common.settings.onHorizontalPositionSelect.call(self, position, isPropertyChange);
                }

                function onResetToDefault () {
                    self.updateSavedDrawingProperties(true);
                }

                function onTextColorChange(rgb, color) {
                    var isPropertyChange = true;
                    if (self.settingsPopup) {
                        isPropertyChange = self.isSettingsPropertyChange();
                    }
                    infChart.drawingUtils.common.settings.onTextColorChange.call(self, rgb, color, isPropertyChange);
                }

                function onTextSizeChange(newFontSize) {
                    var isPropertyChange = true;
                    if (self.settingsPopup) {
                        isPropertyChange = self.isSettingsPropertyChange();
                    }
                    infChart.drawingUtils.common.settings.onTextSizeChange.call(self, newFontSize, isPropertyChange);
                }

                var callBackFnBasicDrawing = {
                    onColorChange : onColorChange,
                    onLineWidthChange : onLineWidthChange,
                    onBasicDrawingTextChange : onBasicDrawingTextChange,
                    onToggleBasicDrawingText : onToggleBasicDrawingText,
                    onVerticalPositionSelect : onVerticalPositionSelect,
                    onHorizontalPositionSelect : onHorizontalPositionSelect,
                    onResetToDefault : onResetToDefault,
                    onExtendToLeft : onExtendToLeft,
                    onExtendToRight : onExtendToRight,
                    onTextColorChange : onTextColorChange,
                    onTextSizeChange : onTextSizeChange
                }

                if (fillColor) {
                    callBackFnBasicDrawing.onFillColorChange = onFillColorChange;
                    infChart.structureManager.drawingTools.bindBasicDrawingSettings(self.settingsPopup, callBackFnBasicDrawing, this.shape);
                } else {
                    infChart.structureManager.drawingTools.bindBasicDrawingSettings(self.settingsPopup, callBackFnBasicDrawing, this.shape);
                }
            }
        },
        bindXabcdSettingsEvents: function () {
            var self = this;

            if (self.settingsPopup) {

                function onLineWidthChange(strokeWidth) {
                    var isPropertyChange = true;
                    if (self.settingsPopup) {
                        isPropertyChange = self.isSettingsPropertyChange();
                    }

                    infChart.drawingUtils.common.settings.onXabcdLineWidthChange.call(self, strokeWidth, isPropertyChange);

                }

                function onColorChange(rgb, color) {
                    var isPropertyChange = true;
                    if (self.settingsPopup) {
                        isPropertyChange = self.isSettingsPropertyChange();
                    }

                    infChart.drawingUtils.common.settings.onXabcdLineColorChange.call(self, color, isPropertyChange, "[inf-ctrl=lineColorPicker]");

                }

                function onLabelTextColorChange(rgb, color) {
                    var isPropertyChange = true;
                    if (self.settingsPopup) {
                        isPropertyChange = self.isSettingsPropertyChange();
                    }
                    infChart.drawingUtils.common.settings.onLabelTextColorChange.call(self, rgb, color, isPropertyChange);
                }

                function onLabelTextSizeChange(newFontSize) {
                    var isPropertyChange = true;
                    if (self.settingsPopup) {
                        isPropertyChange = self.isSettingsPropertyChange();
                    }
                    infChart.drawingUtils.common.settings.onLabelTextSizeChange.call(self, newFontSize, isPropertyChange);
                }

                function onFillColorChange(rgb, value, opacity) {
                    var shapeTheme = infChart.drawingUtils.common.getTheme()["harmonicPattern"];
                    var opacity = opacity || shapeTheme && shapeTheme.fillOpacity || infChart.drawingUtils.common.baseFillOpacity;
                    var isPropertyChange = true;
                    if (self.settingsPopup) {
                        isPropertyChange = self.isSettingsPropertyChange();
                    }

                    infChart.drawingUtils.common.settings.onXabcdFillColorChange.call(self, value, opacity, isPropertyChange);

                }

                function onClose() {
                    infChart.drawingUtils.common.removeDrawing.call(self);
                }

                function onResetToDefault () {
                    self.updateSavedDrawingProperties(true);
                }

                var callBackFnXabcdSettings = {
                    onClose: onClose,
                    onColorChange: onColorChange,
                    onLineWidthChange: onLineWidthChange,
                    onFillColorChange: onFillColorChange,
                    onResetToDefault: onResetToDefault,
                    onLabelTextColorChange: onLabelTextColorChange,
                    onLabelTextSizeChange: onLabelTextSizeChange
                }

                infChart.structureManager.drawingTools.bindXabcdSettings(self.settingsPopup, callBackFnXabcdSettings);
            }
        },
        bindAbcdSettingsEvents: function () {
            var self = this;

            if (self.settingsPopup) {

                function onLineWidthChange(strokeWidth) {
                    var isPropertyChange = true;
                    if (self.settingsPopup) {
                        isPropertyChange = self.isSettingsPropertyChange();
                    }

                    infChart.drawingUtils.common.settings.onAbcdLineWidthChange.call(self, strokeWidth, isPropertyChange);

                }

                function onColorChange(rgb, color) {
                    var isPropertyChange = true;
                    if (self.settingsPopup) {
                        isPropertyChange = self.isSettingsPropertyChange();
                    }

                    infChart.drawingUtils.common.settings.onAbcdLineColorChange.call(self, color, isPropertyChange, "[inf-ctrl=lineColorPicker]");

                }

                function onLabelTextColorChange(rgb, color) {
                    var isPropertyChange = true;
                    if (self.settingsPopup) {
                        isPropertyChange = self.isSettingsPropertyChange();
                    }
                    infChart.drawingUtils.common.settings.onLabelTextColorChange.call(self, rgb, color, isPropertyChange);
                }

                function onLabelTextSizeChange(newFontSize) {
                    var isPropertyChange = true;
                    if (self.settingsPopup) {
                        isPropertyChange = self.isSettingsPropertyChange();
                    }
                    infChart.drawingUtils.common.settings.onLabelTextSizeChange.call(self, newFontSize, isPropertyChange);
                }

                function onClose() {
                    infChart.drawingUtils.common.removeDrawing.call(self);
                }

                function onResetToDefault () {
                    self.updateSavedDrawingProperties(true);
                }

                var callBackFnAbcdSettings = {
                    onClose: onClose,
                    onColorChange: onColorChange,
                    onLineWidthChange: onLineWidthChange,
                    onResetToDefault: onResetToDefault,
                    onLabelTextColorChange: onLabelTextColorChange,
                    onLabelTextSizeChange: onLabelTextSizeChange
                }

                infChart.structureManager.drawingTools.bindAbcdSettings(self.settingsPopup, callBackFnAbcdSettings);
            }
        },
        bindPolylineSettingsEvents: function () {
            var self = this;

            if (self.settingsPopup) {

                function onLineWidthChange(strokeWidth) {
                    var isPropertyChange = true;
                    if (self.settingsPopup) {
                        isPropertyChange = self.isSettingsPropertyChange();
                    }

                    infChart.drawingUtils.common.settings.onPolylineWidthChange.call(self, strokeWidth, isPropertyChange);

                }

                function onColorChange(rgb, color) {
                    var isPropertyChange = true;
                    if (self.settingsPopup) {
                        isPropertyChange = self.isSettingsPropertyChange();
                    }

                    infChart.drawingUtils.common.settings.onPolylineColorChange.call(self, color, isPropertyChange, "[inf-ctrl=lineColorPicker]");

                }

                function onFillColorChange(rgb, value, opacity) {
                    var isPropertyChange = true;
                    if (self.settingsPopup) {
                        isPropertyChange = self.isSettingsPropertyChange();
                    }
                    infChart.drawingUtils.common.settings.onPolylineFillColorChange.call(self, rgb, value, opacity, isPropertyChange, "[inf-ctrl=fillColorPicker]");
                }

                function onLineStyleChange(dashStyle) {
                    var isPropertyChange = true;
                    if (self.settingsPopup) {
                        isPropertyChange = self.isSettingsPropertyChange();
                    }
                    infChart.drawingUtils.common.settings.onPolylineStyleChange.call(self, dashStyle, isPropertyChange);
                }

                function onClose() {
                    infChart.drawingUtils.common.removeDrawing.call(self);
                }

                function onResetToDefault () {
                    self.updateSavedDrawingProperties(true);
                }

                infChart.structureManager.drawingTools.bindPolylineSettings(self.settingsPopup, onClose, onColorChange, onLineWidthChange, onFillColorChange, onLineStyleChange, onResetToDefault);
            }
        },
        bindElliotWaveSettingsEvents: function (onChangeSnapToHighLow) {
            var self = this;

            if (self.settingsPopup) {

                function onLineWidthChange(strokeWidth) {
                    var isPropertyChange = true;
                    if (self.settingsPopup) {
                        isPropertyChange = self.isSettingsPropertyChange();
                    }

                    infChart.drawingUtils.common.settings.onElliotWaveLineWidthChange.call(self, strokeWidth, isPropertyChange);
                }

                function onColorChange(rgb, color) {
                    var isPropertyChange = true;
                    if (self.settingsPopup) {
                        isPropertyChange = self.isSettingsPropertyChange();
                    }

                    infChart.drawingUtils.common.settings.onElliotWaveLineColorChange.call(self, color, isPropertyChange, "[inf-ctrl=lineColorPicker]");
                }

                function onWaveDegreeChange(waveDegree, element) {
                    var isPropertyChange = true;
                    if (self.settingsPopup) {
                        isPropertyChange = self.isSettingsPropertyChange();
                    }

                    infChart.drawingUtils.common.settings.onElliotWaveDegreeChange.call(self, waveDegree, element, isPropertyChange, "[inf-ctrl=lineColorPicker]");
                }

                function onClose() {
                    infChart.drawingUtils.common.removeDrawing.call(self);
                }

                function onResetToDefault () {
                    self.updateSavedDrawingProperties(true);
                }

                function onToggleSnapToHighLow(checked) {
                    var isPropertyChange = true;
                    if (self.settingsPopup) {
                        isPropertyChange = self.isSettingsPropertyChange();
                    }
    
                    if (onChangeSnapToHighLow) {
                        onChangeSnapToHighLow.call(self, checked, isPropertyChange);
                    }
                }

                function onLabelTextSizeChange(newFontSize) {
                    var isPropertyChange = true;
                    if (self.settingsPopup) {
                        isPropertyChange = self.isSettingsPropertyChange();
                    }
                    infChart.drawingUtils.common.settings.onLabelTextSizeChange.call(self, newFontSize, isPropertyChange);
                }

            var callBackFnElliotWaveSettingsEvents = {
                onClose: onClose,
                onColorChange:onColorChange,
                onLineWidthChange:onLineWidthChange,
                onWaveDegreeChange:onWaveDegreeChange,
                onResetToDefault,onResetToDefault,
                onToggleSnapToHighLow:onToggleSnapToHighLow,
                onLabelTextSizeChange:onLabelTextSizeChange
            }
                
                infChart.structureManager.drawingTools.bindElliotWaveSettings(self.settingsPopup, callBackFnElliotWaveSettingsEvents);
            }
        },
        bindArrowSettingsEvents: function () {
            var self = this;

            function onColorChange(rgb, value, opacity) {
                var isPropertyChange = true;
                if (self.settingsPopup) {
                    isPropertyChange = self.isSettingsPropertyChange();
                }
                infChart.drawingUtils.common.settings.onFillColorChange.call(self, rgb, value, opacity, isPropertyChange);
            }

            function onResetToDefault () {
                self.updateSavedDrawingProperties(true);
            }

            infChart.structureManager.drawingTools.bindArrowSettings(self.settingsPopup, onColorChange, onResetToDefault);
        },
        bindFibSettingsEvents: function (color, lineWidth, onFibLevelChange, onFibModeChange, onChangeSnapToHighLow, onTrendLineToggleShow) {
            var self = this,
                ann = self.annotation,
                options = ann.options;
                chartId = ann.chart.renderTo.id,
                shape = self.shape,
                stockChart = infChart.manager.getChart(infChart.manager.getContainerIdFromChart(chartId));
           
            /**
             * single option change event
             * @param {string} fillColor - hex fill color
             * @param {number} fillOpacity - fill opacity
             * @param {string} lineColor - hex line color
             * @param {number} lineWidth - line width
             * @param {object} prevOptions - prev options object
             * @param {boolean} isSingleColor - is single color or not
             * @param {boolean} isPropertyChange - is property change or not
             */
            function onSingleOptionChange(fillColor, fillOpacity, lineColor, lineWidth, fontColor, fontSize, fontWeight, prevOptions, isSingleColor, isPropertyChange) {
                var isPropertyChange = true;
                if (self.settingsPopup) {
                    isPropertyChange = self.isSettingsPropertyChange();
                }
                self.annotation.options.enabledMyDefaultButton = true;
                infChart.drawingUtils.common.settings.onFibSingleOptionChange.call(self, fillColor, fillOpacity, lineColor, lineWidth, fontColor, fontSize, fontWeight, isSingleColor, prevOptions, isPropertyChange);
            }

            /**
             * fib level line color change event
             * @param {object} rgb - color rgb
             * @param {string} value - hash color
             * @param {boolean} isPropertyChange - is property change
             * @param {object} fibLevelLineColors fib level line colors in settings panel
             */
            function onSingleLineColorChange(rgb, value, isSingleColor, fibLevelLineColors, isPropertyChange) {
                var isPropertyChange = true;
                if (self.settingsPopup) {
                    isPropertyChange = self.isSettingsPropertyChange();
                }
                self.annotation.options.enabledMyDefaultButton = true;
                infChart.drawingUtils.common.settings.onFibSingleLineColorChange.call(self, rgb, value, isSingleColor, fibLevelLineColors, isPropertyChange);
            }

            /**
             * change fibonacci drawing to single color or apply settings panle colors
             * @param {object} rgb color rgb
             * @param {string} value color hex
             * @param {number} opacity opacity
             * @param {boolean} isSingleColor is single color or not
             * @param {object} fibLevelColors fib level colors in settings panel
             */
            function onSingleFillColorChange(rgb, value, opacity, isSingleColor, fibLevelColors) {
                var isPropertyChange = true;
                if (self.settingsPopup) {
                    isPropertyChange = self.isSettingsPropertyChange();
                }
                self.annotation.options.enabledMyDefaultButton = true;
                infChart.drawingUtils.common.settings.onFibSingleFillColorChange.call(self, rgb, value, opacity, isSingleColor, fibLevelColors, isPropertyChange);
            }

            /**
             * change fibonacci single line width change
             * @param {number} strokeWidth - strock size
             * @param {boolean} isSingleColor - is single color or not
             * @param {object} fibLevelWidths - fib level widths in settings panel
             */
            function onSingleLineWidthChange(strokeWidth, isSingleColor, fibLevelWidths) {
                var isPropertyChange = true;
                if (self.settingsPopup) {
                    isPropertyChange = self.isSettingsPropertyChange();
                }
                self.annotation.options.enabledMyDefaultButton = true;
                infChart.drawingUtils.common.settings.onFibSingleLineWidthChange.call(self, strokeWidth, isSingleColor, fibLevelWidths, isPropertyChange);
            }

            function onSingleFontColorChange(rgb, value, isSingleColor, fibLevelFontColors, isPropertyChange) {
                var isPropertyChange = true;
                if (self.settingsPopup) {
                    isPropertyChange = self.isSettingsPropertyChange();
                }
                self.annotation.options.enabledMyDefaultButton = true;
                infChart.drawingUtils.common.settings.onFibSingleFontColorChange.call(self, rgb, value, isSingleColor, fibLevelFontColors, isPropertyChange);
            }

            function onSingleFontSizeChange(fontSize, isSingleColor, fibLevelFontSizes) {
                var isPropertyChange = true;
                if (self.settingsPopup) {
                    isPropertyChange = self.isSettingsPropertyChange();
                }
                self.annotation.options.enabledMyDefaultButton = true;
                infChart.drawingUtils.common.settings.onFibSingleFontSizeChange.call(self, fontSize, isSingleColor, fibLevelFontSizes, isPropertyChange);
            }

            /**
             * fib level line color change event
             * @param {object} rgb - color rgb
             * @param {string} value - hash color
             * @param {string} fibLevelId - fib level id
             * @param {boolean} isPropertyChange - is property change
             */
            function onFibLevelLineColorChange(rgb, value, fibLevelId, isPropertyChange) {
                var isPropertyChange = true;
                if (self.settingsPopup) {
                    isPropertyChange = self.isSettingsPropertyChange();
                }
                self.annotation.options.enabledMyDefaultButton = true;
                infChart.drawingUtils.common.settings.onFibLevelLineColorChange.call(self, rgb, value, fibLevelId, false, isPropertyChange);
            }

            /**
             * on fill color change event
             * @param {object} rgb - color rgb
             * @param {string} value - color hex
             * @param {number} opacity - opacity 0 - 1
             * @param {string} fibLevelId - fib level id
             * @param {boolean} isPropertyChange - is property change
             */
            function onFibLevelFillColorChange(rgb, value, opacity, fibLevelId, isPropertyChange) {
                if (typeof isPropertyChange === "undefined" && self.settingsPopup) {
                    isPropertyChange = self.isSettingsPropertyChange();
                }
                var fibLevels = self.annotation.options.fibLevels;
                var fibLevel = fibLevels.find(function (level) {
                    return level.id === fibLevelId;
                });
                self.annotation.options.enabledMyDefaultButton = true;
                infChart.drawingUtils.common.settings.onFibFillColorChange.call(self, rgb, value, opacity, fibLevel, false, isPropertyChange);
            }

            /**
             * line width change event used for both single level and all level
             * @param {number} strokeWidth - stroke width
             * @param {string} fibLevelId - fib level id
             */
            function onFibLevelLineWidthChange(strokeWidth, fibLevelId) {
                var isPropertyChange = true;
                if (self.settingsPopup) {
                    isPropertyChange = self.isSettingsPropertyChange();
                }
                self.annotation.options.enabledMyDefaultButton = true;
                infChart.drawingUtils.common.settings.onFibLineWidthChange.call(self, strokeWidth, fibLevelId, false, isPropertyChange);
            }

            function onFibLevelFontColorChange(rgb, value, fibLevelId, isPropertyChange) {
                if (typeof isPropertyChange === "undefined" && self.settingsPopup) {
                    isPropertyChange = self.isSettingsPropertyChange();
                }
                var fibLevels = self.annotation.options.fibLevels;
                var fibLevel = fibLevels.find(function (level) {
                    return level.id === fibLevelId;
                });
                self.annotation.options.enabledMyDefaultButton = true;
                infChart.drawingUtils.common.settings.onFibLevelFontColorChange.call(self, rgb, value, fibLevel, false, isPropertyChange);
            }

            function onFibLevelFontSizeChange(fontSize, fibLevelId) {
                var isPropertyChange = true;
                if (self.settingsPopup) {
                    isPropertyChange = self.isSettingsPropertyChange();
                }
                self.annotation.options.enabledMyDefaultButton = true;
                infChart.drawingUtils.common.settings.onFibLevelFontSizeChange.call(self, fontSize, fibLevelId, false, isPropertyChange);
            }

            function onFibLvlValueChange(currentLevel, value) {
                var isPropertyChange = true;
                if (self.settingsPopup) {
                    isPropertyChange = self.isSettingsPropertyChange();
                }
                self.annotation.options.enabledMyDefaultButton = true;
                infChart.drawingUtils.common.settings.onFibLevelValueChange.call(self, currentLevel, value, isPropertyChange);
            }

            function onToggleFibLevel(checked, currentLevel) {
                var isPropertyChange = true;
                if (self.settingsPopup) {
                    isPropertyChange = self.isSettingsPropertyChange();
                }
                if (onFibLevelChange) {
                    onFibLevelChange.call(self, checked, currentLevel, isPropertyChange);
                } else {
                    infChart.drawingUtils.common.settings.onFibLevelChange.call(self, currentLevel, checked, isPropertyChange);
                }
                self.annotation.options.enabledMyDefaultButton = true;
            }

            function onToggleFibMode(checked) {
                var isPropertyChange = true;
                if (self.settingsPopup) {
                    isPropertyChange = self.isSettingsPropertyChange();
                }

                if (onFibModeChange) {
                    onFibModeChange.call(self, checked, isPropertyChange);
                }
                self.annotation.options.enabledMyDefaultButton = true;
            }

            function onToggleSnapToHighLow(checked) {
                var isPropertyChange = true;
                if (self.settingsPopup) {
                    isPropertyChange = self.isSettingsPropertyChange();
                }

                if (onChangeSnapToHighLow) {
                    onChangeSnapToHighLow.call(self, checked, isPropertyChange);
                }
                self.annotation.options.enabledMyDefaultButton = true;
            }

            function onSetAsMyDefaultSettings() {
                infChart.drawingUtils.common.saveDrawingProperties.call(self);
                options.enabledMyDefaultButton = false;
            }

            function onResetToAppDefaultSettings() {
                self.updateSavedDrawingProperties(true);
                options.enabledMyDefaultButton  = false;
                
            }

            function onResetToMyDefaultSettings() {
                self.resetToUserDefaultDrawingProperties();
                options.enabledMyDefaultButton = false;
            }

            function onFibLevelFontWeightChange(fibLevelId, value, isPropertyChange) {
                infChart.drawingUtils.common.settings.onFibLevelFontWeightChange.call(self, value, fibLevelId, false, isPropertyChange);
                self.annotation.options.enabledMyDefaultButton = true;
            }

            function onFibSingleFontWeightChange(value, isSingleColor, fibLevelOptions, isPropertyChange) {
                infChart.drawingUtils.common.settings.onFibSingleFontWeightChange.call(self, value, isSingleColor, fibLevelOptions, isPropertyChange);
                self.annotation.options.enabledMyDefaultButton = true;
            }

            function onFibApplyAllButtonClick(fillColor, fillOpacity, lineColor, lineWidth, fontColor, fontSize, fontWeight, prevOptions) {
                infChart.drawingUtils.common.settings.onFibApplyAllButtonClick.call(self, fillColor, fillOpacity, lineColor, lineWidth, fontColor, fontSize, fontWeight, prevOptions, true);
                self.annotation.options.enabledMyDefaultButton= true;
            }

            function onSaveTemplate (templateName) {
                self.saveDrawingTemplate(templateName);
            }

            function onApplyTemplate (templateName) {
                self.applyDrawingTemplate(templateName);
                options.enabledMyDefaultButton = true;
            }

            function onDeleteTemplate (templateName) {
                self.deleteDrawingTemplate(templateName);
            }

            function resetEnabledMyDefaultButton(chartId, shape, drawingId, value){
                infChart.drawingsManager.resetEnabledMyDefaultButton.call(self, chartId, shape, drawingId, value);
            }

            function getEnabledMyDefaultButton(){
                return self.annotation && self.annotation.options && self.annotation.options.enabledMyDefaultButton;
            }

            function onTrendLineColorChange(rgb, color, opacity) {
                var isPropertyChange = true;
                if (self.settingsPopup) {
                    isPropertyChange = self.isSettingsPropertyChange();
                }
                self.onTrendLineColorChange.call(self, rgb, color,opacity, isPropertyChange);
            }

            function onTrendLineWidthChange(strokeWidth) {
                var isPropertyChange = true;
                if (self.settingsPopup) {
                    isPropertyChange = self.isSettingsPropertyChange();
                }
                self.onTrendLineWidthChange.call(self, strokeWidth, isPropertyChange);
            }

            function onTrendLineStyleChange(dashStyle) {
                var isPropertyChange = true;
                if (self.settingsPopup) {
                    isPropertyChange = self.isSettingsPropertyChange();
                }
                self.onTrendLineStyleChange.call(self, dashStyle, isPropertyChange);
            }

            var enabledMyDefaultButton = {};
            enabledMyDefaultButton.shape = shape;
            enabledMyDefaultButton.chartId = stockChart.id;
            enabledMyDefaultButton.drawingId = self.drawingId;
            enabledMyDefaultButton.resetEnabledMyDefaultButton = resetEnabledMyDefaultButton;
            enabledMyDefaultButton.getEnabledMyDefaultButton = getEnabledMyDefaultButton;

            var callBackFnFibSettings = {
                onSingleLineColorChange: onSingleLineColorChange,
                onSingleFillColorChange: onSingleFillColorChange,
                onSingleLineWidthChange: onSingleLineWidthChange,
                onSingleOptionChange: onSingleOptionChange,
                onFibLevelFillColorChange: onFibLevelFillColorChange,
                onFibLevelLineColorChange: onFibLevelLineColorChange,
                onFibLevelLineWidthChange: onFibLevelLineWidthChange,
                onToggleFibLevel: onToggleFibLevel,
                onFibLvlValueChange: onFibLvlValueChange,
                onToggleFibMode: onToggleFibMode,
                onSingleFontColorChange: onSingleFontColorChange,
                onFibLevelFontColorChange: onFibLevelFontColorChange,
                onSingleFontSizeChange: onSingleFontSizeChange,
                onFibLevelFontSizeChange: onFibLevelFontSizeChange,
                onFibLevelFontWeightChange: onFibLevelFontWeightChange,
                onFibSingleFontWeightChange: onFibSingleFontWeightChange,
                onToggleSnapToHighLow: onToggleSnapToHighLow,
                onSaveTemplate: onSaveTemplate,
                onApplyTemplate: onApplyTemplate,
                onDeleteTemplate: onDeleteTemplate,
                onFibApplyAllButtonClick: onFibApplyAllButtonClick,
                onSetAsMyDefaultSettings: onSetAsMyDefaultSettings,
                onResetToAppDefaultSettings: onResetToAppDefaultSettings,
                onResetToMyDefaultSettings: onResetToMyDefaultSettings,
                onTrendLineToggleShow: onTrendLineToggleShow,
                enabledMyDefaultButton: enabledMyDefaultButton,
                onTrendLineColorChange: onTrendLineColorChange,
                onTrendLineWidthChange: onTrendLineWidthChange,
                onTrendLineStyleChange: onTrendLineStyleChange
            }

            infChart.structureManager.drawingTools.bindFibSettings(self.settingsPopup, callBackFnFibSettings);
        },
        bindFibGenericSettingsEvents: function (color, lineWidth, onFibLevelChange, onFibModeChange, onChangeSnapToHighLow, onTrendLineToggleShow) {
            var self = this,
                ann = self.annotation,
                options = ann.options,
                shape = self.shape,
                chartId = ann.chart.renderTo.id,
                stockChart = infChart.manager.getChart(infChart.manager.getContainerIdFromChart(chartId));
           
            /**
             * single option change event
             * @param {string} fillColor - hex fill color
             * @param {number} fillOpacity - fill opacity
             * @param {string} lineColor - hex line color
             * @param {number} lineWidth - line width
             * @param {object} prevOptions - prev options object
             * @param {boolean} isSingleColor - is single color or not
             * @param {boolean} isPropertyChange - is property change or not
             */
            function onSingleOptionChange(fillColor, fillOpacity, lineColor, lineWidth, fontColor, fontSize, fontWeight, prevOptions, isSingleColor, subType, isPropertyChange) {
                var isPropertyChange = true;
                if (self.settingsPopup) {
                    isPropertyChange = self.isSettingsPropertyChange();
                }
                self.annotation.options.enabledMyDefaultButton = true;
                self.onFibSingleOptionChange(fillColor, fillOpacity, lineColor, lineWidth, fontColor, fontSize, fontWeight, isSingleColor, prevOptions, subType, isPropertyChange);
            }

            /**
             * fib level line color change event
             * @param {object} rgb - color rgb
             * @param {string} value - hash color
             * @param {boolean} isPropertyChange - is property change
             * @param {object} fibLevelLineColors fib level line colors in settings panel
             */
            function onSingleLineColorChange(rgb, value, isSingleColor, fibLevelLineColors, subType, isPropertyChange) {
                var isPropertyChange = true;
                if (self.settingsPopup) {
                    isPropertyChange = self.isSettingsPropertyChange();
                }
                self.annotation.options.enabledMyDefaultButton = true;
                self.onFibSingleLineColorChange(rgb, value, isSingleColor, fibLevelLineColors, subType, isPropertyChange);
            }

            /**
             * change fibonacci drawing to single color or apply settings panle colors
             * @param {object} rgb color rgb
             * @param {string} value color hex
             * @param {number} opacity opacity
             * @param {boolean} isSingleColor is single color or not
             * @param {object} fibLevelColors fib level colors in settings panel
             */
            function onSingleFillColorChange(rgb, value, opacity, isSingleColor, fibLevelColors, subType) {
                var isPropertyChange = true;
                if (self.settingsPopup) {
                    isPropertyChange = self.isSettingsPropertyChange();
                }
                self.annotation.options.enabledMyDefaultButton = true;
                self.onFibSingleFillColorChange(rgb, value, opacity, isSingleColor, fibLevelColors, subType, isPropertyChange);
            }

            /**
             * change fibonacci single line width change
             * @param {number} strokeWidth - strock size
             * @param {boolean} isSingleColor - is single color or not
             * @param {object} fibLevelWidths - fib level widths in settings panel
             */
            function onSingleLineWidthChange(strokeWidth, isSingleColor, fibLevelWidths, subType) {
                var isPropertyChange = true;
                if (self.settingsPopup) {
                    isPropertyChange = self.isSettingsPropertyChange();
                }
                self.annotation.options.enabledMyDefaultButton = true;
                self.onFibSingleLineWidthChange(strokeWidth, isSingleColor, fibLevelWidths, subType, isPropertyChange);
            }

            function onSingleFontColorChange(rgb, value, isSingleColor, fibLevelFontColors, subType, isPropertyChange) {
                var isPropertyChange = true;
                if (self.settingsPopup) {
                    isPropertyChange = self.isSettingsPropertyChange();
                }
                self.annotation.options.enabledMyDefaultButton = true;
                self.onFibSingleFontColorChange(rgb, value, isSingleColor, fibLevelFontColors, subType, isPropertyChange);
            }

            function onSingleFontSizeChange(fontSize, isSingleColor, fibLevelFontSizes, subType) {
                var isPropertyChange = true;
                if (self.settingsPopup) {
                    isPropertyChange = self.isSettingsPropertyChange();
                }
                self.annotation.options.enabledMyDefaultButton = true;
                self.onFibSingleFontSizeChange(fontSize, isSingleColor, fibLevelFontSizes, subType, isPropertyChange);
            }

            /**
             * fib level line color change event
             * @param {object} rgb - color rgb
             * @param {string} value - hash color
             * @param {string} fibLevelId - fib level id
             * @param {boolean} isPropertyChange - is property change
             */
            function onFibLevelLineColorChange(rgb, value, fibLevelId, subType, isPropertyChange) {
                var isPropertyChange = true;
                if (self.settingsPopup) {
                    isPropertyChange = self.isSettingsPropertyChange();
                }
                self.annotation.options.enabledMyDefaultButton = true;
                self.onFibLevelLineColorChange(rgb, value, fibLevelId, false, subType, isPropertyChange);
            }

            /**
             * on fill color change event
             * @param {object} rgb - color rgb
             * @param {string} value - color hex
             * @param {number} opacity - opacity 0 - 1
             * @param {string} fibLevelId - fib level id
             * @param {boolean} isPropertyChange - is property change
             */
            function onFibLevelFillColorChange(rgb, value, opacity, fibLevelId, subType, isPropertyChange) {
                if (typeof isPropertyChange === "undefined" && self.settingsPopup) {
                    isPropertyChange = self.isSettingsPropertyChange();
                }
                var fibLevels = self.annotation.options.fibLevels;
                var fibLevel = fibLevels.find(function (level) {
                    return level.id === fibLevelId;
                });
                self.annotation.options.enabledMyDefaultButton = true;
                self.onFibFillColorChange(rgb, value, opacity, fibLevel, false, subType, isPropertyChange);
            }

            /**
             * line width change event used for both single level and all level
             * @param {number} strokeWidth - stroke width
             * @param {string} fibLevelId - fib level id
             */
            function onFibLevelLineWidthChange(strokeWidth, fibLevelId, subType) {
                var isPropertyChange = true;
                if (self.settingsPopup) {
                    isPropertyChange = self.isSettingsPropertyChange();
                }
                self.annotation.options.enabledMyDefaultButton = true;
                self.onFibLineWidthChange(strokeWidth, fibLevelId, false, subType, isPropertyChange);
            }

            function onFibLevelFontColorChange(rgb, value, fibLevelId, subType, isPropertyChange) {
                if (typeof isPropertyChange === "undefined" && self.settingsPopup) {
                    isPropertyChange = self.isSettingsPropertyChange();
                }
                var fibLevels = self.annotation.options.fibLevels;
                var fibLevel = fibLevels.find(function (level) {
                    return level.id === fibLevelId;
                });
                self.annotation.options.enabledMyDefaultButton = true;
                self.onFibLevelFontColorChange(rgb, value, fibLevel, false, subType, isPropertyChange);
            }

            function onFibLevelFontSizeChange(fontSize, fibLevelId, subType) {
                var isPropertyChange = true;
                if (self.settingsPopup) {
                    isPropertyChange = self.isSettingsPropertyChange();
                }
                self.annotation.options.enabledMyDefaultButton = true;
                self.onFibLevelFontSizeChange(fontSize, fibLevelId, false, subType, isPropertyChange);
            }

            function onFibLvlValueChange(currentLevel, value, subType) {
                var isPropertyChange = true;
                if (self.settingsPopup) {
                    isPropertyChange = self.isSettingsPropertyChange();
                }
                self.annotation.options.enabledMyDefaultButton = true;
                self.onFibLevelValueChange(currentLevel, value, subType, isPropertyChange);
            }

            function onToggleFibLevel(checked, currentLevel, subType) {
                var isPropertyChange = true;
                if (self.settingsPopup) {
                    isPropertyChange = self.isSettingsPropertyChange();
                }
                self.onFibLevelChange(currentLevel, checked, subType, isPropertyChange);
                self.annotation.options.enabledMyDefaultButton = true;
            }

            function onToggleFibMode(checked) {
                var isPropertyChange = true;
                if (self.settingsPopup) {
                    isPropertyChange = self.isSettingsPropertyChange();
                }

                if (onFibModeChange) {
                    onFibModeChange.call(self, checked, isPropertyChange);
                }
                self.annotation.options.enabledMyDefaultButton = true;
            }

            function onAlignStyleChange(linePosition, subType){
                var isPropertyChange = true;
                if (self.settingsPopup) {
                    isPropertyChange = self.isSettingsPropertyChange();
                }
                self.annotation.options.enabledMyDefaultButton = true;
                self.onAlignStyleChange(linePosition, subType, isPropertyChange);
            }

            function onToggleSnapToHighLow(checked) {
                var isPropertyChange = true;
                if (self.settingsPopup) {
                    isPropertyChange = self.isSettingsPropertyChange();
                }

                if (onChangeSnapToHighLow) {
                    onChangeSnapToHighLow.call(self, checked, isPropertyChange);
                }
                self.annotation.options.enabledMyDefaultButton = true;
            }

            function onSetAsMyDefaultSettings() {
                infChart.drawingUtils.common.saveDrawingProperties.call(self);
                options.enabledMyDefaultButton = false;
            }

            function onResetToAppDefaultSettings() {
                self.updateSavedDrawingProperties(true);
                options.enabledMyDefaultButton  = false;
                
            }

            function onResetToMyDefaultSettings() {
                self.resetToUserDefaultDrawingProperties();
                options.enabledMyDefaultButton = false;
            }

            function onFibLevelFontWeightChange(fibLevelId, value, subType, isPropertyChange) {
                self.onFibLevelFontWeightChange(value, fibLevelId, false, subType, isPropertyChange);
                self.annotation.options.enabledMyDefaultButton = true;
            }

            function onFibSingleFontWeightChange(value, isSingleColor, fibLevelOptions, subType, isPropertyChange) {
                self.onFibSingleFontWeightChange(value, isSingleColor, fibLevelOptions, subType, isPropertyChange);
                self.annotation.options.enabledMyDefaultButton = true;
            }

            function onFibApplyAllButtonClick(fillColor, fillOpacity, lineColor, lineWidth, fontColor, fontSize, fontWeight, prevOptions, subType) {
                self.onFibApplyAllButtonClick(fillColor, fillOpacity, lineColor, lineWidth, fontColor, fontSize, fontWeight, prevOptions, subType, true);
                self.annotation.options.enabledMyDefaultButton= true;
            }

            function onSaveTemplate (templateName) {
                self.saveDrawingTemplate(templateName);
            }

            function onApplyTemplate (templateName) {
                self.applyDrawingTemplate(templateName);
                options.enabledMyDefaultButton = true;
            }

            function onDeleteTemplate (templateName) {
                self.deleteDrawingTemplate(templateName);
            }

            function resetEnabledMyDefaultButton(chartId, shape, drawingId, value){
                infChart.drawingsManager.resetEnabledMyDefaultButton.call(self, chartId, shape, drawingId, value);
            }

            function getEnabledMyDefaultButton(){
                return self.annotation && self.annotation.options && self.annotation.options.enabledMyDefaultButton;
            }

            function onTrendLineColorChange(rgb, color, opacity) {
                var isPropertyChange = true;
                if (self.settingsPopup) {
                    isPropertyChange = self.isSettingsPropertyChange();
                }
                self.onTrendLineColorChange.call(self, rgb, color,opacity, isPropertyChange);
            }

            function onTrendLineWidthChange(strokeWidth) {
                var isPropertyChange = true;
                if (self.settingsPopup) {
                    isPropertyChange = self.isSettingsPropertyChange();
                }
                self.onTrendLineWidthChange.call(self, strokeWidth, isPropertyChange);
            }

            function onTrendLineStyleChange(dashStyle) {
                var isPropertyChange = true;
                if (self.settingsPopup) {
                    isPropertyChange = self.isSettingsPropertyChange();
                }
                self.onTrendLineStyleChange.call(self, dashStyle, isPropertyChange);
            }

            var enabledMyDefaultButton = {};
            enabledMyDefaultButton.shape = shape;
            enabledMyDefaultButton.chartId = stockChart.id;
            enabledMyDefaultButton.drawingId = self.drawingId;
            enabledMyDefaultButton.resetEnabledMyDefaultButton = resetEnabledMyDefaultButton;
            enabledMyDefaultButton.getEnabledMyDefaultButton = getEnabledMyDefaultButton;

            var callBackFnFibGenSettings = {
                onSingleLineColorChange: onSingleLineColorChange,
                onSingleFillColorChange: onSingleFillColorChange,
                onSingleLineWidthChange: onSingleLineWidthChange,
                onSingleOptionChange: onSingleOptionChange,
                onFibLevelFillColorChange: onFibLevelFillColorChange,
                onFibLevelLineColorChange: onFibLevelLineColorChange,
                onFibLevelLineWidthChange: onFibLevelLineWidthChange,
                onToggleFibLevel: onToggleFibLevel,
                onFibLvlValueChange: onFibLvlValueChange,
                onToggleFibMode: onToggleFibMode,
                onSingleFontColorChange: onSingleFontColorChange,
                onFibLevelFontColorChange: onFibLevelFontColorChange,
                onSingleFontSizeChange: onSingleFontSizeChange,
                onFibLevelFontSizeChange: onFibLevelFontSizeChange,
                onFibLevelFontWeightChange: onFibLevelFontWeightChange,
                onFibSingleFontWeightChange: onFibSingleFontWeightChange,
                onAlignStyleChange: onAlignStyleChange,
                onToggleSnapToHighLow: onToggleSnapToHighLow,
                onSaveTemplate: onSaveTemplate,
                onApplyTemplate: onApplyTemplate,
                onDeleteTemplate: onDeleteTemplate,
                onFibApplyAllButtonClick: onFibApplyAllButtonClick,
                onSetAsMyDefaultSettings: onSetAsMyDefaultSettings,
                onResetToAppDefaultSettings: onResetToAppDefaultSettings,
                onResetToMyDefaultSettings: onResetToMyDefaultSettings,
                onTrendLineToggleShow: onTrendLineToggleShow,
                enabledMyDefaultButton: enabledMyDefaultButton,
                onTrendLineColorChange: onTrendLineColorChange,
                onTrendLineWidthChange: onTrendLineWidthChange,
                onTrendLineStyleChange: onTrendLineStyleChange
            }

            infChart.structureManager.drawingTools.bindFibGenericSettings(self.settingsPopup, callBackFnFibGenSettings);
        },
        setDeleteCursor: function () { //#CCA-2958
            if (infChart.drawingsManager.getIsActiveDeleteTool(this.stockChartId)) {
                var ann = this.annotation;
                if (ann.options.drawingType == 'shape') {
                    var url = infChart.drawingsManager.getDeleteCursor(this.stockChartId);
                    if (ann.title) {
                        ann.title.attr({ 'cursor': 'url("' + url + '"), default' });
                    }
                    $.each(this.dragSupporters, function (id, value) {
                        value.css({ 'cursor': 'url("' + url + '"), default' });
                    });
                }
            }
        },
        setDeleteModeCursor: function () {
            if (infChart.drawingsManager.getIsActiveEraseMode(this.stockChartId)) {
                var ann = this.annotation;
                if (ann.options.drawingType == 'shape') {
                    var url = infChart.drawingsManager.getEraseModeCursor(this.stockChartId);
                    if (ann.title) {
                        ann.title.attr({ 'cursor': 'url("' + url + '"), default' });
                    }
                    $.each(this.dragSupporters, function (id, value) {
                        value.css({ 'cursor': 'url("' + url + '"), default' });
                    });
                }
            }
        },
        symbol: {
            additionalDrawings: function () {
                var ann = this.annotation;

                ann.selectionMarker = [];
                infChart.drawingUtils.common.addSelectionMarker.call(this, ann, 0, 0);
            },
            step: function (e, isStartPoint) {
                var ann = this.annotation,
                    points = infChart.drawingUtils.common.calculateInitialPoints(e, ann, isStartPoint, 1, 1);

                var w = Math.round(points.dx),// + 1,
                    h = Math.round(points.dy),// + 1,
                    ret = {};

                ret.x = w < 0 ? w : 0;
                ret.width = Math.abs(w);
                ret.y = h < 0 ? h : 0;
                ret.height = Math.abs(h);
                ret.symbol = this.shape;
                ret.xValueEnd = isStartPoint ? ann.options.xValueEnd : points.xAxis.toValue(points.x);
                ret.yValueEnd = isStartPoint ? ann.options.yValueEnd : points.yAxis.toValue(points.y);

                ann.shape.attr({
                    symbol: this.shape,
                    x: ret.x,
                    y: ret.y,
                    width: ret.width,
                    height: ret.height
                });

                return ret;
            },
            stop: function (e, isStartPoint) {
                var ann = this.annotation,
                    chart = ann.chart;

                var symbol = this.stepFunction(e, isStartPoint);

                this.annotation.update({
                    xValueEnd: symbol.xValueEnd,
                    yValueEnd: symbol.yValueEnd,
                    shape: {
                        params: symbol
                    }
                });

                infChart.drawingUtils.common.saveBaseYValues.call(this, ann.options.yValue, symbol.yValueEnd);
                infChart.drawingUtils.common.removeDragSupporters.call(this, this.dragSupporters);
                this.dragSupporters.push(chart.renderer.symbol(symbol.symbol, symbol.x, symbol.y, symbol.width, symbol.height, symbol).attr(infChart.drawingUtils.common.dragSupporterStyles).add(ann.group));
                infChart.drawingUtils.common.fixSelectionMarker.call(this, ann);
                infChart.drawingUtils.common.onPropertyChange.call(this);
            },
            scale: function () {
                var ann = this.annotation,
                    chart = ann.chart,
                    options = ann.options,
                    xAxis = chart.xAxis[options.xAxis],
                    yAxis = chart.yAxis[options.yAxis],
                    dx = xAxis.toPixels(options.xValueEnd) - xAxis.toPixels(options.xValue),
                    dy = yAxis.toPixels(options.yValueEnd) - yAxis.toPixels(options.yValue),
                    w = Math.round(dx),// + 1,
                    h = Math.round(dy),// + 1,
                    symbol = { symbol: options.shape.params.symbol };

                symbol.x = w < 0 ? w : 0;
                symbol.y = h < 0 ? h : 0;
                symbol.width = (!isNaN(w) && Math.abs(w)) || 0;
                symbol.height = (!isNaN(h) && Math.abs(h)) || 0;

                ann.update({
                    shape: {
                        params: symbol
                    }
                });

                infChart.drawingUtils.common.removeDragSupporters.call(this, this.dragSupporters);
                this.dragSupporters.push(chart.renderer.symbol(symbol.symbol, symbol.x, symbol.y, symbol.width, symbol.height, symbol).attr(infChart.drawingUtils.common.dragSupporterStyles).add(ann.group));
                //#CCA-2958
                infChart.drawingUtils.common.setDeleteCursor.call(this);
                infChart.drawingUtils.common.setDeleteModeCursor.call(this);
            },
            selectAndBindResize: function () {
                var ann = this.annotation;
                var chart = ann.chart;
                var options = ann.options,
                    xAxis = chart.xAxis[options.xAxis],
                    yAxis = chart.yAxis[options.yAxis];

                ann.events.deselect.call(ann);
                ann.selectionMarker = [];
                chart.selectedAnnotation = ann;

                var startX = xAxis.toPixels(options.xValue),
                    startY = yAxis.toPixels(options.yValue);

                    if(startX < 0 && this.getShapeWidth) { 
                        var endX = this.getShapeWidth();                       
                    } else { 
                        var endX = Math.round(xAxis.toPixels(options.xValueEnd) - startX);
                    }
                var endY = Math.round(yAxis.toPixels(options.yValueEnd) - startY);

                if (!isNaN(startX) && !isNaN(startY) && !isNaN(endX) && !isNaN(endY)) {
                    infChart.drawingUtils.common.addAndBindSelectionMarker.call(this, ann, 0, 0, this.stepFunction, this.stop, true);
                    infChart.drawingUtils.common.addAndBindSelectionMarker.call(this, ann, endX, endY, this.stepFunction, this.stop, false);
                }
            },
            translateEnd: function () {
                infChart.drawingUtils.common.symbol.selectAndBindResize.call(this);
                infChart.drawingUtils.common.onPropertyChange.call(this);
            }
        },
        /***
         * Create an axis label and add to the group
         * @param {number} x x position
         * @param {number} y y position
         * @param {number} value actual value
         * @param {number} optionValue value that is set to the options (convered to  mode)
         * @param {boolean} isXAxis x or y
         * @returns {SVGElement} The generated label
         */
        getAxisLabel: function (x, y, value, optionValue, isXAxis, labelTheme) {
            var self = this,
                ann = self.annotation,
                options = ann.options,
                chart = ann.chart,
                height = 14,
                padding = 3,
                top,
                labelDefaultTheme = {
                    fill: labelTheme && labelTheme.fill || "#2f2e33",
                    stroke: labelTheme && labelTheme.stroke || "#858587",
                    opacity: labelTheme && labelTheme.opacity || 1,
                    fontColor: "#ffffff",
                    'zIndex': 20,
                    'padding': padding,
                    'r': 1,
                    'stroke-width': 0,
                    'stroke-linecap': 'butt',
                    'stroke-linejoin': 'miter',
                    'stroke-opacity': 1,
                    'hAlign': 'center',
                    'height': height,
                    'fontWeight': 100,
                    'fontSize': '10px'
                };
            top = isXAxis ? 0 : -(labelDefaultTheme.height / 2 + labelDefaultTheme.padding);

            if (!isXAxis) {
                ann.options.xLabelPadding = labelDefaultTheme.padding;
                ann.options.xLabelTop = top;
            }

            value = isXAxis ? self.getLabelFormattedXValue(optionValue, self.stockChart.chart.xAxis[options.xAxis]) :
                    self.getLabelFormattedYValue(value, optionValue);


            var lineLabel = chart.renderer.label(infChart.drawingUtils.common.getYValue.call(self, value), x, y + top).attr(labelDefaultTheme).add(ann.group);
            if (isXAxis) {
                lineLabel.attr({x: x - lineLabel.width / 2});
            } else {
                lineLabel.attr({x: x + 4});
            }
            lineLabel.css({ //to color text
                'fontWeight': labelDefaultTheme.fontWeight,
                'color': labelDefaultTheme.fontColor,
                'fontSize': labelDefaultTheme.fontSize
            });
            infChart.drawingUtils.common.getAxisLabelToFront.call(this, lineLabel);
            lineLabel.hide();
            return lineLabel;
        },
        getAxisLabelToFront: function (label, isParentOnly) {
            label.parentGroup.parentGroup.toFront();// get the label group to front from the axis labels
            if (!isParentOnly) {
                label.parentGroup.toFront();// get the label to front from the other vertical labels
            }
        },
        /**
         * Returns the andle of given two points in degrees
         * @param {object} point1 point with x,y
         * @param {object} point2 point with x,y
         * @returns {number} angle in degrees
         */
        getAngle: function (point1, point2) {
            var deltaX = point2.x - point1.x,
                deltaY = point2.y - point1.y,
                rad = Math.atan2(deltaY, deltaX),
                deg = rad * (180 / Math.PI);
            return deg;
        },
        settings: {
            /**
             * Change the stroke width of the annotation from the given width
             * IMPORTANT :: this method is uesd in commands.wrappers to set undo/redo actions
             * @param {number} strokeWidth new size
             * @param {boolean|undefined} isPropertyChange property change
             */
            onLineWidthChange: function (strokeWidth, isPropertyChange) {
                var self = this;
                self.annotation.update({
                    shape: {
                        params: {
                            'stroke-width': strokeWidth
                        }
                    }
                });

                if(self.additionalDrawings && self.additionalDrawings.lines){
                    $.each(self.additionalDrawings.lines, function (key, value) {
                        value.attr({
                            'stroke-width': strokeWidth
                        })
                    });
                }

                isPropertyChange && self.onPropertyChange();
                if (this.settingsPopup) {
                    this.settingsPopup.data("infUndoRedo", false);
                }
                infChart.drawingUtils.common.saveDrawingProperties.call(self);
            },
            /**
             * Change the stroke color of the annotation from the given color
             * IMPORTANT :: this method is uesd in commands.wrappers to set undo/redo actions
             * @param {object} rgb rgb value of the color
             * @param {string} color hash value of the color
             * @param {boolean|undefined} isPropertyChange property change
             */
            onLineColorChange: function (rgb, color, isPropertyChange) {
                var self = this;
                self.annotation.update({
                    shape: {
                        params: {
                            stroke: color
                        }
                    }
                });

                if(self.additionalDrawings['lineText']){
                    self.additionalDrawings['lineText'].css({
                        color: color
                    })
                }

                if(self.additionalDrawings && self.additionalDrawings.lines){
                    $.each(self.additionalDrawings.lines, function (key, value) {
                        value.attr({
                            stroke: color,
                            fillColor: color
                        })
                    });
                }

                isPropertyChange && self.onPropertyChange();
                if (this.settingsPopup) {
                    this.settingsPopup.data("infUndoRedo", false);
                }
                infChart.drawingUtils.common.saveDrawingProperties.call(self);
            },

            onLabelTextColorChange: function (rgb, color, isPropertyChange) {
                var self = this;
                var shape = this.shape;

                switch (shape) {
                    case 'abcdPattern':

                        if (self.additionalDrawings && self.additionalDrawings.labels) {

                            if (self.additionalDrawings.labels.ACFib) {
                                self.additionalDrawings.labels.ACFib.css({ color: color });
                            }

                            if (self.additionalDrawings.labels.BDFib) {
                                self.additionalDrawings.labels.BDFib.css({ color: color });
                            }

                            if (self.additionalDrawings.labels.aLabel) {
                                self.additionalDrawings.labels.aLabel.css({ color: color });
                            }

                            if (self.additionalDrawings.labels.bLabel) {
                                self.additionalDrawings.labels.bLabel.css({ color: color });
                            }

                            if (self.additionalDrawings.labels.cLabel) {
                                self.additionalDrawings.labels.cLabel.css({ color: color });
                            }

                            if (self.additionalDrawings.labels.dLabel) {
                                self.additionalDrawings.labels.dLabel.css({ color: color });
                            }

                            self.annotation.options.textColor = color;
                        }
                        break;
                    case 'harmonicPattern':

                        if (self.additionalDrawings && self.additionalDrawings.labels) {

                            if (self.additionalDrawings.labels.ACFib) {
                                self.additionalDrawings.labels.ACFib.css({ color: color });
                            }

                            if (self.additionalDrawings.labels.BDFib) {
                                self.additionalDrawings.labels.BDFib.css({ color: color });
                            }

                            if (self.additionalDrawings.labels.XBFib) {
                                self.additionalDrawings.labels.XBFib.css({ color: color });
                            }

                            if (self.additionalDrawings.labels.XDFib) {
                                self.additionalDrawings.labels.XDFib.css({ color: color });
                            }

                            if (self.additionalDrawings.labels.aLabel) {
                                self.additionalDrawings.labels.aLabel.css({ color: color });
                            }

                            if (self.additionalDrawings.labels.bLabel) {
                                self.additionalDrawings.labels.bLabel.css({ color: color });
                            }

                            if (self.additionalDrawings.labels.cLabel) {
                                self.additionalDrawings.labels.cLabel.css({ color: color });
                            }

                            if (self.additionalDrawings.labels.dLabel) {
                                self.additionalDrawings.labels.dLabel.css({ color: color });
                            }

                            if (self.additionalDrawings.labels.xLabel) {
                                self.additionalDrawings.labels.xLabel.css({ color: color });
                            }

                            self.annotation.options.textColor = color;
                        }
                        break;
                }

                isPropertyChange && self.onPropertyChange();
                if (this.settingsPopup) {
                    this.settingsPopup.data("infUndoRedo", false);
                }
                infChart.drawingUtils.common.saveDrawingProperties.call(self);
            },

            onLabelTextSizeChange: function (newFontSize, isPropertyChange) {
                var self = this;
                var isUpdate = false;
                var shape = self.shape;

                if (newFontSize === self.fontSize) {
                    return isUpdate;
                } else {
                    self.fontSize = newFontSize;
                    isUpdate = true;

                    switch (shape) {
                        case 'abcdPattern':
                            if (self.additionalDrawings.labels.ACFib) {
                                self.additionalDrawings.labels.ACFib.css({ fontSize: newFontSize + 'px' });
                            }

                            if (self.additionalDrawings.labels.BDFib) {
                                self.additionalDrawings.labels.BDFib.css({ fontSize: newFontSize + 'px' });
                            }

                            if (self.additionalDrawings.labels.aLabel) {
                                self.additionalDrawings.labels.aLabel.css({ fontSize: newFontSize + 'px' });
                            }

                            if (self.additionalDrawings.labels.bLabel) {
                                self.additionalDrawings.labels.bLabel.css({ fontSize: newFontSize + 'px' });
                            }

                            if (self.additionalDrawings.labels.cLabel) {
                                self.additionalDrawings.labels.cLabel.css({ fontSize: newFontSize + 'px' });
                            }

                            if (self.additionalDrawings.labels.dLabel) {
                                self.additionalDrawings.labels.dLabel.css({ fontSize: newFontSize + 'px' });
                            }

                            self.annotation.options.textFontSize = newFontSize;

                            break;
                        case 'harmonicPattern':
                            if (self.additionalDrawings.labels.ACFib) {
                                self.additionalDrawings.labels.ACFib.css({ fontSize: newFontSize + 'px' });
                            }

                            if (self.additionalDrawings.labels.BDFib) {
                                self.additionalDrawings.labels.BDFib.css({ fontSize: newFontSize + 'px' });
                            }

                            if (self.additionalDrawings.labels.XBFib) {
                                self.additionalDrawings.labels.XBFib.css({ fontSize: newFontSize + 'px' });
                            }

                            if (self.additionalDrawings.labels.XDFib) {
                                self.additionalDrawings.labels.XDFib.css({ fontSize: newFontSize + 'px' });
                            }

                            if (self.additionalDrawings.labels.aLabel) {
                                self.additionalDrawings.labels.aLabel.css({ fontSize: newFontSize + 'px' });
                            }

                            if (self.additionalDrawings.labels.bLabel) {
                                self.additionalDrawings.labels.bLabel.css({ fontSize: newFontSize + 'px' });
                            }

                            if (self.additionalDrawings.labels.cLabel) {
                                self.additionalDrawings.labels.cLabel.css({ fontSize: newFontSize + 'px' });
                            }

                            if (self.additionalDrawings.labels.dLabel) {
                                self.additionalDrawings.labels.dLabel.css({ fontSize: newFontSize + 'px' });
                            }

                            if (self.additionalDrawings.labels.xLabel) {
                                self.additionalDrawings.labels.xLabel.css({ fontSize: newFontSize + 'px' });
                            }

                            self.annotation.options.textFontSize = newFontSize;

                            break;
                        case 'longPositions':
                        case 'shortPositions':
                            if (self.additionalDrawings.stopLoss.label) {
                                self.additionalDrawings.stopLoss.label.css({ fontSize: newFontSize + 'px' });
                            }

                            if (self.additionalDrawings.pAndL.label) {
                                self.additionalDrawings.pAndL.label.css({ fontSize: newFontSize + 'px' });
                            }

                            if (self.additionalDrawings.takeProfit.label) {
                                self.additionalDrawings.takeProfit.label.css({ fontSize: newFontSize + 'px' });
                            }

                            self.updateLabels();
                            self.annotation.options.styles.textFontSize = newFontSize;

                            break;
                        case 'elliotTriangleWave':
                            if (self.additionalDrawings.labels.aLabel) {
                                self.additionalDrawings.labels.aLabel.css({ fontSize: newFontSize + 'px' });
                            }

                            if (self.additionalDrawings.labels.bLabel) {
                                self.additionalDrawings.labels.bLabel.css({ fontSize: newFontSize + 'px' });
                            }

                            if (self.additionalDrawings.labels.cLabel) {
                                self.additionalDrawings.labels.cLabel.css({ fontSize: newFontSize + 'px' });
                            }

                            if (self.additionalDrawings.labels.dLabel) {
                                self.additionalDrawings.labels.dLabel.css({ fontSize: newFontSize + 'px' });
                            }

                            if (self.additionalDrawings.labels.eLabel) {
                                self.additionalDrawings.labels.eLabel.css({ fontSize: newFontSize + 'px' });
                            }

                            if (self.additionalDrawings.labels.oLabel) {
                                self.additionalDrawings.labels.oLabel.css({ fontSize: newFontSize + 'px' });
                            }

                            self.annotation.options.textFontSize = newFontSize;

                            break;
                        case 'elliotImpulseWave':
                            if (self.additionalDrawings.labels.no1Label) {
                                self.additionalDrawings.labels.no1Label.css({ fontSize: newFontSize + 'px' });
                            }

                            if (self.additionalDrawings.labels.no2Label) {
                                self.additionalDrawings.labels.no2Label.css({ fontSize: newFontSize + 'px' });
                            }

                            if (self.additionalDrawings.labels.no3Label) {
                                self.additionalDrawings.labels.no3Label.css({ fontSize: newFontSize + 'px' });
                            }

                            if (self.additionalDrawings.labels.no4Label) {
                                self.additionalDrawings.labels.no4Label.css({ fontSize: newFontSize + 'px' });
                            }

                            if (self.additionalDrawings.labels.no5Label) {
                                self.additionalDrawings.labels.no5Label.css({ fontSize: newFontSize + 'px' });
                            }

                            if (self.additionalDrawings.labels.oLabel) {
                                self.additionalDrawings.labels.oLabel.css({ fontSize: newFontSize + 'px' });
                            }

                            self.annotation.options.textFontSize = newFontSize;

                            break;
                        case 'elliotCorrectiveWave':
                            if (self.additionalDrawings.labels.aLabel) {
                                self.additionalDrawings.labels.aLabel.css({ fontSize: newFontSize + 'px' });
                            }

                            if (self.additionalDrawings.labels.bLabel) {
                                self.additionalDrawings.labels.bLabel.css({ fontSize: newFontSize + 'px' });
                            }

                            if (self.additionalDrawings.labels.cLabel) {
                                self.additionalDrawings.labels.cLabel.css({ fontSize: newFontSize + 'px' });
                            }

                            if (self.additionalDrawings.labels.oLabel) {
                                self.additionalDrawings.labels.oLabel.css({ fontSize: newFontSize + 'px' });
                            }

                            self.annotation.options.textFontSize = newFontSize;

                            break;
                        case 'elliotCorrectiveDoubleWave':
                            if (self.additionalDrawings.labels.wLabel) {
                                self.additionalDrawings.labels.wLabel.css({ fontSize: newFontSize + 'px' });
                            }

                            if (self.additionalDrawings.labels.xLabel) {
                                self.additionalDrawings.labels.xLabel.css({ fontSize: newFontSize + 'px' });
                            }

                            if (self.additionalDrawings.labels.yLabel) {
                                self.additionalDrawings.labels.yLabel.css({ fontSize: newFontSize + 'px' });
                            }

                            if (self.additionalDrawings.labels.oLabel) {
                                self.additionalDrawings.labels.oLabel.css({ fontSize: newFontSize + 'px' });
                            }

                            self.annotation.options.textFontSize = newFontSize;

                            break;
                        case 'correctiveTripleWave':
                            if (self.additionalDrawings.labels.wLabel) {
                                self.additionalDrawings.labels.wLabel.css({ fontSize: newFontSize + 'px' });
                            }

                            if (self.additionalDrawings.labels.xLabel) {
                                self.additionalDrawings.labels.xLabel.css({ fontSize: newFontSize + 'px' });
                            }

                            if (self.additionalDrawings.labels.xxLabel) {
                                self.additionalDrawings.labels.xxLabel.css({ fontSize: newFontSize + 'px' });
                            }

                            if (self.additionalDrawings.labels.yLabel) {
                                self.additionalDrawings.labels.yLabel.css({ fontSize: newFontSize + 'px' });
                            }

                            if (self.additionalDrawings.labels.zLabel) {
                                self.additionalDrawings.labels.zLabel.css({ fontSize: newFontSize + 'px' });
                            }

                            if (self.additionalDrawings.labels.oLabel) {
                                self.additionalDrawings.labels.oLabel.css({ fontSize: newFontSize + 'px' });
                            }

                            self.annotation.options.textFontSize = newFontSize;

                            break;

                        default:
                            break;
                    }

                    isPropertyChange && self.onPropertyChange();
                    if (this.settingsPopup) {
                        this.settingsPopup.data("infUndoRedo", false);
                    }
                    infChart.drawingUtils.common.saveDrawingProperties.call(self);
                    return isUpdate;
                }
            },

            onTextColorChange: function (rgb, color, isPropertyChange) {
                var self = this;
                var shape = self.shape;

                switch (shape) {
                    case 'rectangle':
                        if (self.additionalDrawings.labels['rectText']) {
                            self.additionalDrawings.labels['rectText'].css({
                                color: color
                            });
                            self.annotation.options.textColor = color;
                        }
                        break;
                    case 'ellipse':
                        if (self.additionalDrawings.labels['ellipseText']) {
                            self.additionalDrawings.labels['ellipseText'].css({
                                color: color
                            });
                            self.annotation.options.textColor = color;
                        }
                        break;
                    case 'line':
                        if (self.additionalDrawings.labels['lineText']) {
                            self.additionalDrawings.labels['lineText'].css({
                                color: color
                            });
                            self.annotation.options.textColor = color;
                        }
                        break;
                }
                isPropertyChange && self.onPropertyChange();
                if (this.settingsPopup) {
                    this.settingsPopup.data("infUndoRedo", false);
                }
                infChart.drawingUtils.common.saveDrawingProperties.call(self);
            },

            onTextSizeChange: function (newFontSize, isPropertyChange) {
                var self = this;
                var isUpdate = false;
                var shape = self.shape;

                switch (shape) {
                    case 'rectangle':
                        if (newFontSize !== self.fontSize) {
                            self.fontSize = newFontSize;
                            isUpdate = true;
                            self.additionalDrawings.labels['rectText'].css({
                                fontSize: newFontSize + 'px'
                            });
                            self.annotation.options.textFontSize = newFontSize;
                        }
                        break;
                    case 'ellipse':
                        if (newFontSize !== self.fontSize) {
                            self.fontSize = newFontSize;
                            isUpdate = true;
                            self.additionalDrawings.labels['ellipseText'].css({
                                fontSize: newFontSize + 'px'
                            });
                            self.annotation.options.textFontSize = newFontSize;
                        }
                        break;
                    case 'line':
                        if (newFontSize !== self.fontSize) {
                            self.fontSize = newFontSize;
                            isUpdate = true;
                            self.additionalDrawings.labels['lineText'].css({
                                fontSize: newFontSize + 'px'
                            });
                            self.annotation.options.textFontSize = newFontSize;
                        }
                        break;
                }

                self.calculateAndUpdateTextLabel();

                isPropertyChange && self.onPropertyChange();
                if (this.settingsPopup) {
                    this.settingsPopup.data("infUndoRedo", false);
                }
                infChart.drawingUtils.common.saveDrawingProperties.call(self);
                return isUpdate;
            },

            getStrokeDashArray: function (style, width){
                width = width.toString();
                var strokeDashArray;
                if (style === 'dash'){
                    switch (width){
                        case '1':
                            strokeDashArray = "4 3";
                            break;
                        case '2':
                            strokeDashArray = "8 6";
                            break;
                        case '3':
                            strokeDashArray = "12 9";
                            break;
                        default:
                            break;
                    }
                } else {
                        strokeDashArray = "none";
                }
                return  strokeDashArray; 
            },
            /**
             * Change the dashstyle of the annotation from the given type
             * IMPORTANT :: this method is uesd in commands.wrappers to set undo/redo actions
             * @param {string} dashStyle line type
             * @param {boolean|undefined} isPropertyChange property change
             */
            onLineStyleChange: function (dashStyle, isPropertyChange) {
                var self = this;
                self.annotation.update({
                    shape: {
                        params: {
                            dashstyle: dashStyle
                        }
                    }
                });
                isPropertyChange && self.onPropertyChange();
                if (this.settingsPopup) {
                    this.settingsPopup.data("infUndoRedo", false);
                }
                infChart.drawingUtils.common.saveDrawingProperties.call(self);
            },

            onTextChange: function (text, isPropertyChange) {
                var self = this;
                var textLabelUpdate;
                var shape = this.shape;
                switch (shape) {
                    case 'rectangle':
                        textLabelUpdate = self.calculateAndUpdateTextLabel;
                        self.annotation.options.rectText = text;
                        break;
                    case 'ellipse':
                        textLabelUpdate = self.calculateAndUpdateTextLabel;
                        self.annotation.options.ellipseText = text;
                        break;
                    case 'line':
                        textLabelUpdate = self.calculateAndUpdateTextLabel;
                        self.annotation.options.lineText = text;
                        break;
                }

                textLabelUpdate.call(self);
                isPropertyChange && self.onPropertyChange();      
                    
                if (this.settingsPopup) {
                    this.settingsPopup.data("infUndoRedo", false);
                }
                infChart.drawingUtils.common.saveDrawingProperties.call(self);
            },

            onToggleText: function (checked, isPropertyChange) {
                var self = this;
                var shape = this.shape;
                switch (shape) {
                    case 'rectangle':
                        if(self.annotation.options ){
                            self.annotation.options.rectTextChecked = checked;
                        }
                        if(self.settingsPopup) {
                            if(checked) {
                                self.settingsPopup.find("textarea[inf-ctrl=rect-text]").removeAttr("disabled");
                                self.settingsPopup.find("div[inf-ctrl=verticalType]").find('button').prop('disabled', false);
                                self.settingsPopup.find("div[inf-ctrl=horizontalType]").find('button').prop('disabled', false);
                                self.settingsPopup.find("input[inf-ctrl=textColorPicker]").removeAttr("disabled");
                                $(self.settingsPopup.find("span[inf-ctrl=singleSelectedFontSize]")[0]).parent().removeAttr("disabled");
                                self.calculateAndUpdateTextLabel.call(self);
                            } else {
                                self.settingsPopup.find("textarea[inf-ctrl=rect-text]").attr("disabled","disabled");
                                self.settingsPopup.find("div[inf-ctrl=verticalType]").find('button').prop('disabled', true);
                                self.settingsPopup.find("div[inf-ctrl=horizontalType]").find('button').prop('disabled', true);
                                self.settingsPopup.find("input[inf-ctrl=textColorPicker]").attr("disabled","disabled");
                                $(self.settingsPopup.find("span[inf-ctrl=singleSelectedFontSize]")[0]).parent().attr("disabled","disabled");
                                self.additionalDrawings.labels.rectText.hide();
                            }
                        }
                        break;
                    case 'line':
                        if(self.annotation.options ){
                            self.annotation.options.lineTextChecked = checked;
                        }
                        if(self.settingsPopup) {
                            if(checked) {
                                self.settingsPopup.find("input[inf-ctrl=line-text]").removeAttr("disabled");
                                self.settingsPopup.find("input[inf-ctrl=textColorPicker]").removeAttr("disabled");
                                $(self.settingsPopup.find("span[inf-ctrl=singleSelectedFontSize]")[0]).parent().removeAttr("disabled");
                                self.calculateAndUpdateTextLabel.call(self);
                            } else {
                                self.settingsPopup.find("input[inf-ctrl=line-text]").attr("disabled","disabled");
                                self.settingsPopup.find("input[inf-ctrl=textColorPicker]").attr("disabled","disabled");
                                $(self.settingsPopup.find("span[inf-ctrl=singleSelectedFontSize]")[0]).parent().attr("disabled","disabled");
                                self.additionalDrawings.labels.lineText.hide();
                            }
                        }
                        break;
                    case 'ellipse':
                        if (self.annotation.options) {
                            self.annotation.options.ellipseTextChecked = checked;
                        }
                        if (self.settingsPopup) {
                            if (checked) {
                                self.settingsPopup.find("textarea[inf-ctrl=ellipse-text]").removeAttr("disabled");
                                self.settingsPopup.find("input[inf-ctrl=textColorPicker]").removeAttr("disabled");
                                $(self.settingsPopup.find("span[inf-ctrl=singleSelectedFontSize]")[0]).parent().removeAttr("disabled");
                                self.calculateAndUpdateTextLabel.call(self);
                            } else {
                                self.settingsPopup.find("textarea[inf-ctrl=ellipse-text]").attr("disabled", "disabled");
                                self.settingsPopup.find("input[inf-ctrl=textColorPicker]").attr("disabled","disabled");
                                $(self.settingsPopup.find("span[inf-ctrl=singleSelectedFontSize]")[0]).parent().attr("disabled","disabled");
                                self.additionalDrawings.labels.ellipseText.hide();
                            }
                        }
                        break;
                }
                
                isPropertyChange && self.onPropertyChange();
                if (this.settingsPopup) {
                    this.settingsPopup.data("infUndoRedo", false);
                }
                infChart.drawingUtils.common.saveDrawingProperties.call(self);
            },

            

            onVerticalPositionSelect: function (position, isPropertyChange) {
                var self = this;
                self.annotation.options.verticalPosition = position;
                self.calculateAndUpdateTextLabel.call(self);
                isPropertyChange && self.onPropertyChange();            
                if (this.settingsPopup) {
                    this.settingsPopup.data("infUndoRedo", false);
                }
                infChart.drawingUtils.common.saveDrawingProperties.call(self);
            },

            onHorizontalPositionSelect: function (position, isPropertyChange) {
                var self = this;
                self.annotation.options.horizontalPosition = position;
                self.calculateAndUpdateTextLabel.call(self);
                isPropertyChange && self.onPropertyChange();            
                if (this.settingsPopup) {
                    this.settingsPopup.data("infUndoRedo", false);
                }
                infChart.drawingUtils.common.saveDrawingProperties.call(self);
            },

            /**
             * Change the stroke width of the annotation from the given width
             * IMPORTANT :: this method is uesd in commands.wrappers to set undo/redo actions
             * @param {number} strokeWidth new size
             * @param {boolean|undefined} isPropertyChange property change
             */
            onShortLongLineWidthChange: function (strokeWidth, isPropertyChange) {
                var self = this;
                self.annotation.update({
                    shape: {
                        params: {
                            'stroke-width': strokeWidth
                        }
                    }
                });
                isPropertyChange && self.onPropertyChange();
                if (this.settingsPopup) {
                    this.settingsPopup.data("infUndoRedo", false);
                }
                infChart.drawingUtils.common.saveDrawingProperties.call(self);
            },

            /**
             * Change the dashstyle of the annotation from the given type
             * IMPORTANT :: this method is uesd in commands.wrappers to set undo/redo actions
             * @param {string} dashStyle line type
             * @param {boolean|undefined} isPropertyChange property change
             * @param {string} colorPickerRef filter to search for the specific color picker that change occured (used in wrappers)
             */
            onShortLongLineStyleChange: function (dashStyle, isPropertyChange, colorPickerRef) {
                var self = this;
                self.annotation.update({
                    shape: {
                        params: {
                            dashstyle: dashStyle
                        }
                    }
                });
                isPropertyChange && self.onPropertyChange();
                if (this.settingsPopup) {
                    this.settingsPopup.data("infUndoRedo", false);
                }
                infChart.drawingUtils.common.saveDrawingProperties.call(self);
            },
            
            /**
             * Change the dashstyle of the annotation from the given type
             * IMPORTANT :: this method is uesd in commands.wrappers to set undo/redo actions
             * @param {string} value main line value
             * @param {boolean|undefined} isPropertyChange property change
             */
            onEntryValueChange: function (element, value, isPropertyChange) {
                var self = this;
                self.annotation.update({
                    yValue: value
                });
                self.annotation.options.yValue = value;
                self.yValue = value;
                self.scale();
                self.updateSettings(self.getConfig());
                
                isPropertyChange && self.onPropertyChange();
                if (this.settingsPopup) {
                    this.settingsPopup.data("infUndoRedo", false);
                }
                infChart.drawingUtils.common.saveDrawingProperties.call(self);
            },

            onApplyLine: function (checked, lineType, isPropertyChange) {
                var self = this,
                    ann = self.annotation,
                    options = ann.options,
                    chart = ann.chart,
                    stockChart = this.stockChart,
                    line = ann.shape.d.split(' ');

                var isStopLoss = (lineType === 'sl1' || lineType === 'sl2' || lineType === 'sl3');
                var additionalDrawingList = isStopLoss ? options.stopLoss : options.takeProfit;
                var level = additionalDrawingList.find(function (level) {
                    if (level.id === lineType) {
                        return level;
                    }
                });
                var priceline = isStopLoss ? self.additionalDrawings.slPriceLines[level.id] : self.additionalDrawings.tpPriceLines[level.id];
                var lineLabel = isStopLoss ? self.additionalDrawings.slPriceLineLabels[level.id] : self.additionalDrawings.tpPriceLineLabels[level.id];
                var lineTagLabel = isStopLoss ? self.additionalDrawings.slPriceLineTagLabels[level.id] : self.additionalDrawings.tpPriceLineTagLabels[level.id];

                if(checked){
                    priceline.show();
                    lineLabel.show();
                    lineTagLabel.show();
                    level.enable = true;
                }else{
                    priceline.hide();
                    lineLabel.hide();
                    lineTagLabel.hide();
                    level.enable = false;
                    level.yValue = infChart.drawingUtils.common.getBaseYValues.call(self, options.yValue) + infChart.drawingUtils.common.getBaseYValues.call(self, options.yValue) * level.priceLineDiff;
                    if (self.settingsPopup) {
                        var settingPopUp = self.settingsPopup;
                        var ele = settingPopUp.find("input[inf-ctrl=priceLevelValue][inf-value='"+ level.id +"']");
                        ele.val(stockChart.formatValue(parseFloat(level.yValue).toFixed(3)));  
                    }
                    self.scale();
                }

                infChart.drawingUtils.common.removeDragSupporters.call(self, self.dragSupporters);
                infChart.drawingUtils.common.addDragSupporters.call(self, ann, chart, ["M", 0, 0, 'L', line[4], line[5]], self.dragSupporters);
                var tpPriceLines = self.additionalDrawings.tpPriceLines;
                $.each(tpPriceLines, function (key, value) {
                    if(value.visibility !== 'hidden'){
                        var line = value.d.split(' ');
                        var customAttributes = {
                            'level' : key,
                            'type': "additionalDrawing",
                            'stroke-width': 5
                        }            
                        var dragSupporterStyles = Object.assign({}, infChart.drawingUtils.common.dragSupporterStyles, {cursor: 'pointer', 'z-index': 20});
                        infChart.drawingUtils.common.addDragSupporters.call(self, ann, chart, ['M', line[1], line[2], 'L', line[4], line[5]], self.dragSupporters, customAttributes, dragSupporterStyles);
                    }
                });
                
                var slPriceLines = self.additionalDrawings.slPriceLines;
                $.each(slPriceLines, function (key, value) {
                    if(value.visibility !== 'hidden'){
                        var line = value.d.split(' ');
                        var customAttributes = {
                            'level' : key,
                            'type': "additionalDrawing",
                            'stroke-width': 5
                        }            
                        var dragSupporterStyles = Object.assign({}, infChart.drawingUtils.common.dragSupporterStyles, {cursor: 'pointer', 'z-index': 20});
                        infChart.drawingUtils.common.addDragSupporters.call(self, ann, chart, ['M', line[1], line[2], 'L', line[4], line[5]], self.dragSupporters, customAttributes, dragSupporterStyles);
                    }
                });

                isPropertyChange && self.onPropertyChange();
                if (this.settingsPopup) {
                    this.settingsPopup.data("infUndoRedo", false);
                }
                infChart.drawingUtils.common.saveDrawingProperties.call(self);
            },

            onPriceValueChange: function (element, priceValue, type, isPropertyChange) {
                var self = this,
                    ann = self.annotation,
                    options = ann.options,
                    chart = ann.chart,
                    xAxis = chart.xAxis[options.xAxis],
                    yAxis = chart.yAxis[options.yAxis];

                if (type == 'tp1' || type == 'tp2' || type == 'tp3') {
                    level = options.takeProfit.find(function (level) {
                        if (level.id == type) {
                            level.yValue = infChart.drawingUtils.common.getBaseYValues.call(self, priceValue);
                            return level;
                        }
                    });
                }
                if (type == 'sl1' || type == 'sl2' || type == 'sl3') {
                    level = options.stopLoss.find(function (level) {
                        if (level.id == type) {
                            level.yValue = infChart.drawingUtils.common.getBaseYValues.call(self, priceValue);
                            return level;
                        }
                    });
                }
                if (level.id == 'tp1' || level.id == 'tp2' || level.id == 'tp3') {
                    var priceline = self.additionalDrawings.tpPriceLines[level.id];
                    var lineLabel = self.additionalDrawings.tpPriceLineLabels[level.id];
                    var lineTagLabel = self.additionalDrawings.tpPriceLineTagLabels[level.id];
                }
                if (level.id == 'sl1' || level.id == 'sl2' || level.id == 'sl3') {
                    var priceline = self.additionalDrawings.slPriceLines[level.id];
                    var lineLabel = self.additionalDrawings.slPriceLineLabels[level.id];
                    var lineTagLabel = self.additionalDrawings.slPriceLineTagLabels[level.id];
                }

                var line = priceline.d.split(' ');
                var newY = yAxis.toPixels(priceValue) - yAxis.toPixels(options.yValue);
                priceline.attr({
                    d: ['M', line[1], newY, 'L', line[4], newY]
                }); 
                lineLabel.attr({
                    text: self.getPriceLineLabelFormattedValue(priceValue),
                    y: newY - lineTagLabel.height/2,
                });
                lineTagLabel.attr({
                    y: newY - lineTagLabel.height/2,
                }); 
                self.updateSettings(self.getConfig());

                isPropertyChange && self.onPropertyChange();
                if (this.settingsPopup) {
                    this.settingsPopup.data("infUndoRedo", false);
                }
                infChart.drawingUtils.common.saveDrawingProperties.call(self);

            },

            onPriceLineWidthChange: function (type, strokeWidth, isPropertyChange) {
                var self = this,
                    ann = self.annotation,
                    options = ann.options;

                if (type == 'tp1' || type == 'tp2' || type == 'tp3') {
                    level = options.takeProfit.find(function (level) {
                        if (level.id == type) {
                            return level;
                        }
                    });
                }
                if (type == 'sl1' || type == 'sl2' || type == 'sl3') {
                    level = options.stopLoss.find(function (level) {
                        if (level.id == type) {
                            return level;
                        }
                    });
                }
                if (level.id == 'tp1' || level.id == 'tp2' || level.id == 'tp3') {
                    var priceline = self.additionalDrawings.tpPriceLines[level.id];
                }
                if (level.id == 'sl1' || level.id == 'sl2' || level.id == 'sl3') {
                    var priceline = self.additionalDrawings.slPriceLines[level.id];
                }

                priceline.attr({
                    'stroke-width': strokeWidth
                });
                level.lineWidth = strokeWidth;

                isPropertyChange && self.onPropertyChange();
                if (this.settingsPopup) {
                    this.settingsPopup.data("infUndoRedo", false);
                }
                infChart.drawingUtils.common.saveDrawingProperties.call(self);

            },

            onPriceLineColorChange: function (color, type, isPropertyChange) {
                var self = this,
                    ann = self.annotation,
                    options = ann.options;

                if (type == 'tp1' || type == 'tp2' || type == 'tp3') {
                    level = options.takeProfit.find(function (level) {
                        if (level.id == type) {
                            return level;
                        }
                    });
                }
                if (type == 'sl1' || type == 'sl2' || type == 'sl3') {
                    level = options.stopLoss.find(function (level) {
                        if (level.id == type) {
                            return level;
                        }
                    });
                }
                if (level.id == 'tp1' || level.id == 'tp2' || level.id == 'tp3') {
                    var priceline = self.additionalDrawings.tpPriceLines[level.id];
                }
                if (level.id == 'sl1' || level.id == 'sl2' || level.id == 'sl3') {
                    var priceline = self.additionalDrawings.slPriceLines[level.id];
                }

                priceline.attr({
                    stroke: color
                }); 
                level.lineColor = color;

                isPropertyChange && self.onPropertyChange();
                if (this.settingsPopup) {
                    this.settingsPopup.data("infUndoRedo", false);
                }

                infChart.drawingUtils.common.saveDrawingProperties.call(self);
            },

            onPriceLineStyleChange: function (type, lineStyle, isPropertyChange) {
                var self = this,
                    ann = self.annotation,
                    options = ann.options;

                if (type == 'tp1' || type == 'tp2' || type == 'tp3') {
                    level = options.takeProfit.find(function (level) {
                        if (level.id == type) {
                            return level;
                        }
                    });
                }
                if (type == 'sl1' || type == 'sl2' || type == 'sl3') {
                    level = options.stopLoss.find(function (level) {
                        if (level.id == type) {
                            return level;
                        }
                    });
                }
                if (level.id == 'tp1' || level.id == 'tp2' || level.id == 'tp3') {
                    var priceline = self.additionalDrawings.tpPriceLines[level.id];
                }
                if (level.id == 'sl1' || level.id == 'sl2' || level.id == 'sl3') {
                    var priceline = self.additionalDrawings.slPriceLines[level.id];
                }

                priceline.attr({
                    dashstyle: lineStyle
                }); 
                level.lineStyle = lineStyle;

                isPropertyChange && self.onPropertyChange();
                if (this.settingsPopup) {
                    this.settingsPopup.data("infUndoRedo", false);
                }
                infChart.drawingUtils.common.saveDrawingProperties.call(self);
            },

            /**
             * Change the fill and opacity of the annotation from the given params
             * IMPORTANT :: this method is uesd in commands.wrappers to set undo/redo actions
             * @param {object} rgb rgb value of the color
             * @param {string} value hash value of the color
             * @param {float} opacity opacity to be set
             * @param {boolean|undefined} isPropertyChange property change
             * @param {string} colorPickerRef filter to search for the specific color picker that change occured (used in wrappers)
             */
            onFillColorChange: function (rgb, value, opacity, isPropertyChange, colorPickerRef) {
                var self = this;
                self.annotation.update({
                    shape: {
                        params: {
                            fill: value,
                            'fill-opacity': opacity
                        }
                    }
                });
                if(self.additionalDrawings && self.additionalDrawings.fill){
                    $.each(self.additionalDrawings.fill, function (key, fillDrawing) {
                        fillDrawing.attr({
                            fill: value,
                            'fill-opacity': opacity
                        })
                    });
                }

                isPropertyChange && self.onPropertyChange();
                if (this.settingsPopup) {
                    this.settingsPopup.data("infUndoRedo", false);
                }
                infChart.drawingUtils.common.saveDrawingProperties.call(self);
            },
            /**
             * Change the visibility of Fib levels
             * IMPORTANT :: this method is uesd in commands.wrappers to set undo/redo actions
             * @param {string} currentLevel level that is going to be changed
             * @param {boolean} checked visibility
             * @param {boolean|undefined} isPropertyChange property change
             * @param {boolean} ignoreSettingsSave - this is to indicate to this change does not affect to subsequent drawing
             */
            onFibLevelChange: function (currentLevel, checked, isPropertyChange, ignoreSettingsSave) {
                var self = this, drawing = self.additionalDrawings.lines[currentLevel];
                var label = self.fibonacciDrawings.lines[currentLevel];
                var hideFibLevelButton = self.additionalDrawings.hideFibLevelButton[currentLevel];
                var fill = self.fibonacciDrawings.fill[currentLevel],
                    options = self.annotation.options,
                    fibLevels = infChart.drawingUtils.common.sortFibLevelsByValue(options.fibLevels),
                    currentOrderIdx,
                    prevLine, prevFill, nextFill,
                    currentLinePoints,
                    nextLinePoints,
                    prvLinePoints,
                    i,
                    lineD,
                    next;
                if(isPropertyChange){
                    self.annotation.options.enabledMyDefaultButton = true;
                }
                fibLevels.some(function (fibLevel, i) {
                    if (fibLevel.id == currentLevel) {
                        currentOrderIdx = i;
                        return true;
                    }
                });
                fibLevels[currentOrderIdx].enable = checked;

                if (checked) {
                    drawing.show();
                    label.show();
                    if(hideFibLevelButton && self.annotation.chart.selectedAnnotation == self.annotation){
                        hideFibLevelButton.show();
                    }

                    for (i = currentOrderIdx + 1; i < fibLevels.length; i++) {
                        lineD = self.additionalDrawings.lines[fibLevels[i].id];
                        if (lineD && lineD.visibility != "hidden") {
                            prevLine = lineD;
                            prevFill = self.fibonacciDrawings.fill[fibLevels[i].id];
                            break;
                        }
                    }
                    for (i = currentOrderIdx - 1; i >= 0; i--) {
                        lineD = self.additionalDrawings.lines[fibLevels[i].id];
                        if (lineD && lineD.visibility != "hidden") {
                            next = lineD;
                            nextFill = self.fibonacciDrawings.fill[fibLevels[i].id];
                            break;
                        }
                    }

                    currentLinePoints = drawing.d.split(' ');

                    if (next && nextFill) {
                        nextFill.show();
                        nextLinePoints = next.d.split(' ');
                        nextFill.attr({
                            d: ['M', nextLinePoints[1], nextLinePoints[2], 'L', nextLinePoints[4], nextLinePoints[5], 'L', currentLinePoints[4], currentLinePoints[5], 'L', currentLinePoints[1], currentLinePoints[2], 'L', currentLinePoints[1], currentLinePoints[2]]
                        });

                    }

                    if (fill && prevLine) {
                        fill.show();
                        prvLinePoints = prevLine.d.split(' ');
                        fill.attr({
                            d: ['M', prvLinePoints[1], prvLinePoints[2], 'L', prvLinePoints[4], prvLinePoints[5], 'L', currentLinePoints[4], currentLinePoints[5], 'L', currentLinePoints[1], currentLinePoints[2], 'L', prvLinePoints[1], prvLinePoints[2]]
                        });
                    }

                } else {
                    drawing.hide();
                    label.hide();
                    fill.hide();
                    if(hideFibLevelButton){
                        hideFibLevelButton.hide();
                    }

                    for (i = currentOrderIdx + 1; i < fibLevels.length; i++) {
                        lineD = self.additionalDrawings.lines[fibLevels[i].id];
                        if (lineD && lineD.visibility != "hidden") {
                            prevLine = lineD;
                            prevFill = self.fibonacciDrawings.fill[fibLevels[i].id];
                            break;
                        }
                    }

                    for (i = currentOrderIdx - 1; i >= 0; i--) {
                        lineD = self.additionalDrawings.lines[fibLevels[i].id];
                        if (lineD && lineD.visibility != "hidden") {
                            next = lineD;
                            nextFill = self.fibonacciDrawings.fill[fibLevels[i].id];
                            break;
                        }
                    }
                    if (prevLine && next) {
                        prvLinePoints = prevLine.d.split(' ');
                        nextLinePoints = next.d.split(' ');
                        nextFill.attr({
                            d: ['M', nextLinePoints[1], nextLinePoints[2], 'L', nextLinePoints[4], nextLinePoints[5], 'L', prvLinePoints[4], prvLinePoints[5], prvLinePoints[1], prvLinePoints[2], 'L', nextLinePoints[1], nextLinePoints[2]]
                        })
                    } else if (!prevLine && nextFill) {
                        nextFill.hide();
                    }
                }

                if(self.resetDragSupporters){
                    self.resetDragSupporters();
                }

                isPropertyChange && self.onPropertyChange();
                if (this.settingsPopup) {
                    this.settingsPopup.data("infUndoRedo", false);
                }
            },
            /**
             * change the fib level value and scale the fib drawing
             * IMPORTANT :: this method is uesd in commands.wrappers to set undo/redo actions
             * @param {string} currentLevel - fib level
             * @param {string} value - new value
             * @param {boolean|undefined} isPropertyChange property change
             */
            onFibLevelValueChange: function (currentLevel, value, isPropertyChange) {
                var self = this;
                var ann = self.annotation,
                    options = ann.options,
                    fibLevels = options.fibLevels;

                fibLevels.forEach(function (fibLevel) {
                    if (fibLevel.id === currentLevel) {
                        fibLevel.value = value;
                        return;
                    }
                });

                self.scale();
                self.updateSettings(self.getConfig());
                isPropertyChange && self.onPropertyChange();
                if (this.settingsPopup) {
                    this.settingsPopup.data("infUndoRedo", false);
                }
            },
            /**
             * Change the stroke of the annotation from the given params
             * IMPORTANT :: this method is uesd in commands.wrappers to set undo/redo actions
             * @param {object} rgb rgb value of the color
             * @param {string} value hash value of the color
             * @param {boolean|undefined} isPropertyChange property change
             */
            onFibSingleLineColorChange: function (rgb, value, isSingleColor, fibLevelColors, isPropertyChange) {
                var self = this;
                var fibLevels = self.annotation.options.fibLevels;
                self.isSingleColor = isSingleColor;
                if (isSingleColor) {
                    self.annotation.options.lineColor = value;

                    for (i = 0; i < fibLevels.length; i++) {
                        infChart.drawingUtils.common.settings.onFibLevelLineColorChange.call(self, rgb, value, fibLevels[i].id, true, false);
                    }
                } else {
                    for (i = 0; i < fibLevels.length; i++) {
                        var lineColor = fibLevelColors[fibLevels[i].id].lineColor;
                        infChart.drawingUtils.common.settings.onFibLevelLineColorChange.call(self, rgb, lineColor, fibLevels[i].id, false, false);
                    }
                }

                isPropertyChange && self.onPropertyChange();
                if (this.settingsPopup) {
                    this.settingsPopup.data("infUndoRedo", false);
                }
            },
            /**
             * fib level color change event
             * @param {object} rgb - color rgb
             * @param {string} value - color hex
             * @param {string} fibLevelId - fib level id
             * @param {boolean} isPropertyChange - is property change
             */
            onFibLevelLineColorChange: function (rgb, value, fibLevelId, isAll, isPropertyChange) {
                var self = this;

                self.fibonacciDrawings.lines[fibLevelId].css({
                    fill: value
                });

                self.additionalDrawings.lines[fibLevelId].attr({
                    'stroke': value
                });

                if (!isAll) {
                    var fibLevels = self.annotation.options.fibLevels;
                    var fibLevel = fibLevels.find(function (level) {
                        return level.id === fibLevelId;
                    });
                    fibLevel.lineColor = value;
                }

                isPropertyChange && self.onPropertyChange();
                if (this.settingsPopup) {
                    this.settingsPopup.data("infUndoRedo", false);
                }
            },
            /**
             * Change the fill and opacity of the annotation from the given params
             * IMPORTANT :: this method is uesd in commands.wrappers to set undo/redo actions
             * @param {object} rgb rgb value of the color
             * @param {string} value hash value of the color
             * @param {float} opacity opacity to be set
             * @param {string} fibLevel level that is going to be changed
             * @param {boolean|undefined} isPropertyChange property change
             */
            onFibFillColorChange: function (rgb, value, opacity, fibLevel, isAll, isPropertyChange) {
                var self = this;
                var fibonacciDrawingsFill = self.fibonacciDrawings.fill[fibLevel.id];

                if (fibonacciDrawingsFill) {
                    fibonacciDrawingsFill.attr({
                        'fill': value,
                        'fill-opacity': opacity
                    });
                    if (!isAll) {
                        fibLevel.fillColor = value;
                        fibLevel.fillOpacity = opacity;
                    }
                }
                isPropertyChange && self.onPropertyChange();
                if (this.settingsPopup) {
                    this.settingsPopup.data("infUndoRedo", false);
                }
            },
            /**
             * change fibonacci drawing to single color or apply settings panle colors
             * IMPORTANT :: this method is uesd in commands.wrappers to set undo/redo actions
             * @param {object} rgb color rgb
             * @param {string} value color hex
             * @param {number} opacity opacity
             * @param {boolean} isSingleColor is single color or not
             * @param {object} fibLevelColors fib level colors in settings panel
             * @param {boolean|undefined} isPropertyChange property change
             */
            onFibSingleFillColorChange: function (rgb, value, opacity, isSingleColor, fibLevelColors, isPropertyChange) {
                var self = this;
                var ann = self.annotation;
                var fibLevels = ann.options.fibLevels;
                var i;
                self.isSingleColor = isSingleColor;
                if (isSingleColor) {
                    ann.update({
                        shape: {
                            params: {
                                'fill': value,
                                'fill-opacity': opacity
                            }
                        }
                    });
                    ann.options.fillColor = value;
                    ann.options.fillOpacity = opacity;
                    for (i = 0; i < fibLevels.length; i++) {
                        infChart.drawingUtils.common.settings.onFibFillColorChange.call(self, rgb, value, opacity, fibLevels[i], true, false);
                    }
                } else {
                    for (i = 0; i < fibLevels.length; i++) {
                        var fibOption = fibLevelColors[fibLevels[i].id];
                        infChart.drawingUtils.common.settings.onFibFillColorChange.call(self, rgb, fibOption.fillColor, fibOption.fillOpacity, fibLevels[i], false, false);
                    }
                }
                isPropertyChange && self.onPropertyChange();
                if (self.settingsPopup) {
                    self.settingsPopup.data("infUndoRedo", false);
                }
            },
            onFibSingleFontColorChange: function (rgb, value, isSingleColor, fibLevelColors, isPropertyChange) {
                var self = this;
                var ann = self.annotation;
                var fibLevels = ann.options.fibLevels;
                var i;
                self.isSingleColor = isSingleColor;
                if (isSingleColor) {
                    ann.update({
                        shape: {
                            params: {
                                'font-color': value
                            }
                        }
                    });
                    ann.options.fontColor = value;
                    for (i = 0; i < fibLevels.length; i++) {
                        infChart.drawingUtils.common.settings.onFibLevelFontColorChange.call(self, rgb, value, fibLevels[i], true, false);
                    }
                } else {
                    for (i = 0; i < fibLevels.length; i++) {
                        var fibOption = fibLevelColors[fibLevels[i].id];
                        infChart.drawingUtils.common.settings.onFibLevelFontColorChange.call(self, rgb, fibOption.fontColor, fibLevels[i], false, false);
                    }
                }
                isPropertyChange && self.onPropertyChange();
                if (self.settingsPopup) {
                    self.settingsPopup.data("infUndoRedo", false);
                }
            },
            onFibLevelFontColorChange: function (rgb, value, fibLevel, isAll, isPropertyChange) {
                var self = this;
                var fibonacciDrawingsLabel = self.fibonacciDrawings.lines[fibLevel.id];
                if (fibonacciDrawingsLabel) {
                    fibonacciDrawingsLabel.attr({
                        'font-color': value
                    }).css({
                        'color': value
                    });
                }
                if (!isAll) {
                    fibLevel.fontColor = value;
                }
                isPropertyChange && self.onPropertyChange();
                if (this.settingsPopup) {
                    this.settingsPopup.data("infUndoRedo", false);
                }
            },

            /**
             * change font weight of given fib level
             * @param {string} value - font weight
             * @param {string} fibLevelId - fib level id
             * @param {boolean} isPropertyChange - is property chnage
             */
            onFibLevelFontWeightChange: function (value, fibLevelId, isAll, isPropertyChange) {
                var self = this;
                var fibonacciDrawingsLabel = self.fibonacciDrawings.lines[fibLevelId];
                if (fibonacciDrawingsLabel) {
                    fibonacciDrawingsLabel.attr({
                        'font-weight': value
                    }).css({
                        'font-weight': value
                    });
                }
                if (!isAll) {
                    var fibLevels = self.annotation.options.fibLevels;
                    var fibLevel = fibLevels.find(function (level) {
                        return level.id === fibLevelId;
                    });
                    fibLevel.fontWeight = value;
                }
                isPropertyChange && self.onPropertyChange();
                if (this.settingsPopup) {
                    this.settingsPopup.data("infUndoRedo", false);
                }
            },

            /**
             * fib single font weight change
             * @param {number} value - font weight
             * @param {boolean} isSingleColor - is single color
             * @param {object} fibLevelOptions - fib level options
             * @param {boolean} isPropertyChange - property change
             */
            onFibSingleFontWeightChange: function (value, isSingleColor, fibLevelOptions, isPropertyChange) {
                var self = this;
                var ann = self.annotation;
                var fibLevels = ann.options.fibLevels;
                var i;
                self.isSingleColor = isSingleColor;
                if (isSingleColor) {
                    ann.update({
                        shape: {
                            params: {
                                'font-weight': value
                            }
                        }
                    });
                    ann.options.fontWeight = value;
                    for (i = 0; i < fibLevels.length; i++) {
                        infChart.drawingUtils.common.settings.onFibLevelFontWeightChange.call(self, value, fibLevels[i].id, true, false);
                    }
                } else {
                    for (i = 0; i < fibLevels.length; i++) {
                        var fibOption = fibLevelOptions[fibLevels[i].id];
                        infChart.drawingUtils.common.settings.onFibLevelFontWeightChange.call(self, fibOption.fontWeight, fibLevels[i].id, false, false);
                    }
                }
                isPropertyChange && self.onPropertyChange();
                if (this.settingsPopup) {
                    this.settingsPopup.data("infUndoRedo", false);
                }
            },

            /**
             * fib single line width change
             * @param {number} strokeWidth - line width
             * @param {boolean} isSingleColor - is single color
             * @param {object} fibLevelWidths - fib level widths
             * @param {boolean} isPropertyChange - property change
             */
            onFibSingleLineWidthChange: function (strokeWidth, isSingleColor, fibLevelWidths, isPropertyChange) {
                var self = this;
                var fibLevels = self.annotation.options.fibLevels;
                self.isSingleColor = isSingleColor;
                if (isSingleColor) {
                    self.annotation.options.lineWidth = strokeWidth;

                    for (i = 0; i < fibLevels.length; i++) {
                        infChart.drawingUtils.common.settings.onFibLineWidthChange.call(self, strokeWidth, fibLevels[i].id, true, false);
                    }
                } else {
                    for (i = 0; i < fibLevels.length; i++) {
                        infChart.drawingUtils.common.settings.onFibLineWidthChange.call(self, fibLevelWidths[fibLevels[i].id].lineWidth, fibLevels[i].id, false, false);
                    }
                }

                isPropertyChange && self.onPropertyChange();
                if (this.settingsPopup) {
                    this.settingsPopup.data("infUndoRedo", false);
                }
            },
            onFibSingleFontSizeChange: function (fontSize, isSingleColor, fibLevelFontSizes, isPropertyChange) {
                var self = this;
                var fibLevels = self.annotation.options.fibLevels;
                self.isSingleColor = isSingleColor;
                if (isSingleColor) {
                    self.annotation.update({
                        shape: {
                            params: {
                                'font-size': fontSize
                            }
                        }
                    });
                    self.annotation.options.fontSize = fontSize;

                    $.each(self.fibonacciDrawings.lines, function (key, val) {
                        val.attr({
                            'font-size': fontSize
                        });
                        val.css({
                            'fontSize': fontSize + 'px'
                        });
                    });
                    self.scale();
                } else {
                    for (var i = 0; i < fibLevels.length; i++) {
                        infChart.drawingUtils.common.settings.onFibLevelFontSizeChange.call(self, fibLevelFontSizes[fibLevels[i].id].fontSize, fibLevels[i].id, false, false);
                    }
                }

                isPropertyChange && self.onPropertyChange();
                if (this.settingsPopup) {
                    this.settingsPopup.data("infUndoRedo", false);
                }
            },
            /**
             * fib single option change event
             * @param {stirng} fillColor - hex fill color
             * @param {number} fillOpacity - fill opacity
             * @param {string} lineColor - hex line color
             * @param {number} lineWidth - line width
             * @param {boolean} isSingleColor - is single option
             * @param {object} prevOptions - previous color, width options
             * @param {boolean} isPropertyChange -property change
             */
            onFibSingleOptionChange: function (fillColor, fillOpacity, lineColor, lineWidth, fontColor, fontSize, fontWeight, isSingleColor, prevOptions, isPropertyChange) {
                var self = this;
                var ann = self.annotation,
                    options = ann.options;

                options.isSingleColor = isSingleColor;
                infChart.drawingUtils.common.settings.onFibSingleFillColorChange.call(self, undefined, fillColor, fillOpacity, isSingleColor, prevOptions, false);
                infChart.drawingUtils.common.settings.onFibSingleLineColorChange.call(self, undefined, lineColor, isSingleColor, prevOptions, false);
                infChart.drawingUtils.common.settings.onFibSingleLineWidthChange.call(self, lineWidth, isSingleColor, prevOptions, false);
                infChart.drawingUtils.common.settings.onFibSingleFontColorChange.call(self, undefined, fontColor, isSingleColor, prevOptions, false);
                infChart.drawingUtils.common.settings.onFibSingleFontSizeChange.call(self, fontSize, isSingleColor, prevOptions, false);
                infChart.drawingUtils.common.settings.onFibSingleFontWeightChange.call(self, fontWeight, isSingleColor, prevOptions, false)

                isPropertyChange && self.onPropertyChange();
                if (this.settingsPopup) {
                    this.settingsPopup.data("infUndoRedo", false);
                }
            },
            /**
             * Change the stroke width of the annotation from the given width
             * IMPORTANT :: this method is uesd in commands.wrappers to set undo/redo actions
             * @param {number} strokeWidth new size
             * @param {boolean|undefined} isPropertyChange property change
             */
            onFibLineWidthChange: function (strokeWidth, fibLevelId, isAll, isPropertyChange) {
                var self = this;
                self.additionalDrawings.lines[fibLevelId].attr({
                    'stroke-width': strokeWidth
                });
                if (!isAll) {
                    var fibLevels = self.annotation.options.fibLevels;
                    var fibLevel = fibLevels.find(function (level) {
                        return level.id === fibLevelId;
                    });
                    fibLevel.lineWidth = strokeWidth;
                }
                isPropertyChange && self.onPropertyChange();
                if (this.settingsPopup) {
                    this.settingsPopup.data("infUndoRedo", false);
                }
            },
            onFibLevelFontSizeChange: function (fontSize, fibLevelId, isAll, isPropertyChange) {
                var self= this;
                self.fibonacciDrawings.lines[fibLevelId].attr({
                    'font-size': fontSize
                }).css({
                    'fontSize': fontSize + 'px'
                });
                if (!isAll) {
                    var fibLevels = self.annotation.options.fibLevels;
                    var fibLevel = fibLevels.find(function (level) {
                        return level.id === fibLevelId;
                    });
                    fibLevel.fontSize = fontSize;
                }
                self.scale();
                isPropertyChange && self.onPropertyChange();
                if (this.settingsPopup) {
                    this.settingsPopup.data("infUndoRedo", false);
                }
            },
            onXabcdLineWidthChange: function (strokeWidth, isPropertyChange) {
                var self = this;

                self.annotation.update({
                    shape: {
                        params: {
                            'stroke-width': strokeWidth
                        }
                    }
                });

                isPropertyChange && self.onPropertyChange();
                if (this.settingsPopup) {
                    this.settingsPopup.data("infUndoRedo", false);
                }
                infChart.drawingUtils.common.saveDrawingProperties.call(self);
            },
            onXabcdLineColorChange: function (color, isPropertyChange) {
                var self = this;
                var pointArray = ["a", "b", "c", "d", "x"];
                var lineArray = ["AC", "BD", "XB", "XD"];
                self.annotation.update({
                    shape: {
                        params: {
                            stroke: color
                        }
                    }
                });

                if(self.additionalDrawings.lines["xbd"]){
                    self.additionalDrawings.lines["xbd"].attr({
                        stroke: color
                    });
                }
                
                self.additionalDrawings.lines["ac"].attr({
                    stroke: color
                });

                infChart.util.forEach(lineArray, function (index, value) {
                    if (self.additionalDrawings.labels[value + "Fib"]) {
                        self.additionalDrawings.labels[value + "Fib"].attr({
                            fill: color
                        });
                    }
                }); 

                infChart.util.forEach(pointArray, function (index, value) {
                    if (self.additionalDrawings.labels[value + "Label"]) {
                        self.additionalDrawings.labels[value + "Label"].attr({
                            fill: color
                        });
                    }
                }); 

                isPropertyChange && self.onPropertyChange();
                if (this.settingsPopup) {
                    this.settingsPopup.data("infUndoRedo", false);
                }
                infChart.drawingUtils.common.saveDrawingProperties.call(self);
            },
            onXabcdFillColorChange: function (value, opacity, isPropertyChange) {
                var self = this,
                    ann = self.annotation,
                    options = ann.options;

                var drawingsFillXab = self.additionalDrawings.fill["xabFill"];

               if(drawingsFillXab) {
                    drawingsFillXab.attr({
                        'fill': value,
                        'fill-opacity': opacity
                    });
                }

                var drawingsFillBc = self.additionalDrawings.fill["bcdFill"];
               if(drawingsFillBc){
                    drawingsFillBc.attr({
                            'fill': value,
                            'fill-opacity': opacity
                    });
                }
                self.annotation.options.fillColorValue = value;
                self.annotation.options.fillOpacityValue = opacity;

                isPropertyChange && self.onPropertyChange();
                if (this.settingsPopup) {
                    this.settingsPopup.data("infUndoRedo", false);
                }
                infChart.drawingUtils.common.saveDrawingProperties.call(self);

            },
            onAbcdLineColorChange: function (color, isPropertyChange) {
                var self = this;
                var pointArray = ["a", "b", "c", "d"];
                var lineArray = ["AC", "BD"];
                self.annotation.update({
                    shape: {
                        params: {
                            stroke: color
                        }
                    }
                });

                self.additionalDrawings.lines["bd"].attr({
                    stroke: color
                });

                self.additionalDrawings.lines["ac"].attr({
                    stroke: color
                });

                infChart.util.forEach(lineArray, function (index, value) {
                    if (self.additionalDrawings.labels[value + "Fib"]) {
                        self.additionalDrawings.labels[value + "Fib"].attr({
                            fill: color
                        });
                    }
                }); 

                infChart.util.forEach(pointArray, function (index, value) {
                    if (self.additionalDrawings.labels[value + "Label"]) {
                        self.additionalDrawings.labels[value + "Label"].attr({
                            fill: color
                        });
                    }
                }); 
                
                isPropertyChange && self.onPropertyChange();
                if (this.settingsPopup) {
                    this.settingsPopup.data("infUndoRedo", false);
                }
                infChart.drawingUtils.common.saveDrawingProperties.call(self);
            },
            onAbcdLineWidthChange: function (strokeWidth, isPropertyChange) {
                var self = this;

                self.annotation.update({
                    shape: {
                        params: {
                            'stroke-width': strokeWidth
                        }
                    }
                });
                self.additionalDrawings.lines["bd"].attr({
                    'stroke-width': strokeWidth
                });

                self.additionalDrawings.lines["ac"].attr({
                    'stroke-width': strokeWidth
                });

                isPropertyChange && self.onPropertyChange();
                if (this.settingsPopup) {
                    this.settingsPopup.data("infUndoRedo", false);
                }
                infChart.drawingUtils.common.saveDrawingProperties.call(self);
            },
            onPolylineColorChange: function (color, isPropertyChange) {
                var self = this;
                self.annotation.update({
                    shape: {
                        params: {
                            stroke: color
                        }
                    }
                });

                isPropertyChange && self.onPropertyChange();
                if (this.settingsPopup) {
                    this.settingsPopup.data("infUndoRedo", false);
                }
                infChart.drawingUtils.common.saveDrawingProperties.call(self);
            },
            onPolylineFillColorChange: function (rgb, value, opacity, isPropertyChange) {
                var self = this;
                if(self.annotation.options.drawingIsFullFilled){
                    self.annotation.update({
                        shape: {
                            params: {
                                fill: value,
                                'fill-opacity': opacity
                            }
                        }
                    });
                }
                self.annotation.update({
                    fillColorPicker: value,
                    fillOpacityPicker: opacity
                });

                isPropertyChange && self.onPropertyChange();
                if (this.settingsPopup) {
                    this.settingsPopup.data("infUndoRedo", false);
                }
                infChart.drawingUtils.common.saveDrawingProperties.call(self);
            },
            onPolylineStyleChange: function (lineStyle, isPropertyChange){
                var self = this;
                self.annotation.update({
                    shape: {
                        params: {
                            dashstyle: lineStyle
                        }
                    }
                });
                isPropertyChange && self.onPropertyChange();
                if (this.settingsPopup) {
                    this.settingsPopup.data("infUndoRedo", false);
                }
                infChart.drawingUtils.common.saveDrawingProperties.call(self);
            },
            onPolylineWidthChange: function (strokeWidth, isPropertyChange) {
                var self = this;

                self.annotation.update({
                    shape: {
                        params: {
                            'stroke-width': strokeWidth
                        }
                    }
                });

                isPropertyChange && self.onPropertyChange();
                if (this.settingsPopup) {
                    this.settingsPopup.data("infUndoRedo", false);
                }
                infChart.drawingUtils.common.saveDrawingProperties.call(self);
            },
            onElliotWaveLineColorChange: function (color, isPropertyChange) {
                var self = this;
                self.annotation.update({
                    shape: {
                        params: {
                            stroke: color
                        }
                    }
                });

                self.labelValueNames.forEach(function(value, index){
                    if(self.additionalDrawings.labels[value]){
                        self.additionalDrawings.labels[value].attr({
                            'stroke': color,
                        }).css({
                            'color': color
                        });
                    }
                });


                isPropertyChange && self.onPropertyChange();
                if (this.settingsPopup) {
                    this.settingsPopup.data("infUndoRedo", false);
                }
                infChart.drawingUtils.common.saveDrawingProperties.call(self);
            },
            onElliotWaveLineWidthChange: function (strokeWidth, isPropertyChange) {
                var self = this;

                self.annotation.update({
                    shape: {
                        params: {
                            'stroke-width': strokeWidth
                        }
                    }
                });

                isPropertyChange && self.onPropertyChange();
                if (this.settingsPopup) {
                    this.settingsPopup.data("infUndoRedo", false);
                }
                infChart.drawingUtils.common.saveDrawingProperties.call(self);
            },
            onElliotWaveDegreeChange: function (waveDegree, element, isPropertyChange) {
                var self = this,
                    ann = self.annotation,
                    options = ann.options;
                var selectedDegree;
                var xChartId = infChart.drawingsManager.getChartIdFromHighchartInstance(ann.chart);
                var listElement = element.find("li[inf-ctrl=waveDegree][inf-type="+ options.currentWaveDegree +"]");
                listElement.removeClass('active');

                self.waveDegrees.forEach(function (value, index) {
                    if(value.name == waveDegree){
                        selectedDegree = value;
                    }
                });
                
                
                self.annotation.update({
                    shape: {
                        params: {
                            'stroke': selectedDegree.color
                        }
                    },
                    currentWaveDegree: waveDegree
                });
                self.labelValueNames.forEach(function(value, index){
                    if(self.additionalDrawings.labels[value]){
                        self.additionalDrawings.labels[value].attr({
                            'stroke': selectedDegree.color,
                            text: selectedDegree.options[index]
                        }).css({
                            'color': selectedDegree.color
                        });
                    }
                });

                self.calculateAndUpdateInfoLabel();

                var settingPanel = self.settingsPopup;
                if (settingPanel) {
                    var lineColorPickerElm = settingPanel.find("[inf-ctrl=lineColorPicker]");
                        lineColorPickerElm.mainColorPanel("value", {color: selectedDegree.color});
                }
                self.scale();
                if(isPropertyChange){
                    infChart.commandsManager.removeLastAction(xChartId);
                }

                isPropertyChange && self.onPropertyChange();
                if (this.settingsPopup) {
                    this.settingsPopup.data("infUndoRedo", false);
                }

                infChart.drawingUtils.common.saveDrawingProperties.call(self);
            },
            onFibApplyAllButtonClick: function (fillColor, fillOpacity, lineColor, lineWidth, fontColor, fontSize, fontWeight, prevOptions, isPropertyChange) {
                var self = this;
                var fibLevels = self.annotation.options.fibLevels;

                fibLevels.forEach(function (fibLevel) {
                    fibLevel.fillColor = fillColor;
                    fibLevel.fillOpacity = fillOpacity;
                    fibLevel.lineColor = lineColor;
                    fibLevel.lineWidth = lineWidth;
                    fibLevel.fontColor = fontColor;
                    fibLevel.fontSize = fontSize;
                    fibLevel.fontWeight = fontWeight;
                });
                self.fibLevels = fibLevels;

                self.updateSettings(self.getConfig());
                isPropertyChange && self.onPropertyChange();
            }
        },
        getContextMenuOptions : function (chartId, drawingId, options) {
            var drawingObject = infChart.drawingsManager.getDrawingObject(chartId, drawingId);
            var contextMenu =  {
                "eraseDrawing" : {
                    icon : options.eraseGroup.icon,
                    displayText : options.eraseGroup.displayText,
                    action : function () {
                        infChart.drawingsManager.removeDrawing(chartId, drawingId, undefined, true);
                        infChart.drawingsManager.updateIsGloballyLockInDelete(chartId);
                    }
                },
                "eraseAllDrawings" : {
                    icon : options.eraseAll.icon,
                    displayText : options.eraseAll.displayText,
                    action : function () {
                        var chartInstance = infChart.manager.getChart(chartId);
                        infChart.drawingsManager.removeAllDrawings(chartId, true);
                        infChart.drawingsManager.updateIsGloballyLockInDelete(chartId);
                        var leftPanel = $(chartInstance.container).find('div[inf-pnl=tb-drawing-nav-container]');
                        infChart.drawingsManager.setActiveDrawingToolOptions(chartId, leftPanel);
                    }
                },
                "showDrawingSettings" : {
                    icon : options.settings.icon,
                    displayText :options.settings.displayText,
                    action : function () {
                        var drawingObj = infChart.drawingsManager.getDrawingObject(chartId, drawingId);
                        if (drawingObj && !drawingObj.disableQuickSettingPanel) {
                            if (drawingObj.isQuickSetting) {
                                infChart.drawingUtils.common.toggleSettings.call(drawingObj);
                            } else {
                                infChart.drawingsManager.openSettings(drawingObj, false);
                            }
                        } else {
                            infChart.drawingsManager.openSettings(drawingObj, false);
                        }
                    }
                }
            };

            if (infChart.drawingsManager.getIsActiveEraseMode(chartId)) {
                var eraseModeOFF = {
                    icon: options.eraseModeOFF.icon,
                    displayText: options.eraseModeOFF.displayText,
                    disabled: !infChart.drawingsManager.isDrawnDrawingsAvailable(chartId),
                    action: function () {
                        infChart.drawingsManager.offDeleteMode(chartId);
                    }
                };
                contextMenu["eraseModeOFF"] = eraseModeOFF;
            } else {
                var eraseModeON = {
                    icon: options.eraseModeON.icon,
                    displayText: options.eraseModeON.displayText,
                    disabled: !infChart.drawingsManager.isDrawnDrawingsAvailable(chartId),
                    action: function () {
                        infChart.drawingsManager.setDeleteMode(chartId);
                    }
                };
                contextMenu["eraseModeON"] = eraseModeON;
            }

            if (drawingObject.annotation.options.isLocked) {
                var unlock = {
                    icon: options.lock.icon,
                    displayText: options.unlock.displayText,
                    disabled: !infChart.drawingsManager.isDrawnDrawingsAvailable(chartId),
                    action: function () {
                        var element = ($(drawingObject.settingsPopup[0]).find('a[inf-ctrl="quick-setting-lock"]'))
                        drawingObject.toggleLock(element);
                    }
                };
                contextMenu["unlock"] = unlock;
            } else {
                var lock = {
                    icon: options.unlock.icon,
                    displayText: options.lock.displayText,
                    disabled: !infChart.drawingsManager.isDrawnDrawingsAvailable(chartId),
                    action: function () {
                        var element = ($(drawingObject.settingsPopup[0]).find('a[inf-ctrl="quick-setting-lock"]'))
                        drawingObject.toggleLock(element);
                    }
                };
                contextMenu["lock"] = lock;
            }

            var newcontextMenu = infChart.drawingUtils.common.reorderContextMenu(contextMenu);
            return newcontextMenu;
        },
        reorderContextMenu: function(contextMenu){
            var newContextMenu = {};
            var contextMenuOrder = ["copyToClipboard", "eraseModeON", "eraseModeOFF", "eraseThis", "lock", "unlock", "eraseDrawing", "eraseAllDrawings", "showDrawingSettings"];
            $.each(contextMenuOrder, function (key, menuItem) {
                if(contextMenu[menuItem]){
                    newContextMenu[menuItem] = contextMenu[menuItem];
                }
            });
            return newContextMenu;
        },
        getTextDimensionsFromTempNode: function (textLabelData, textLabel) {
            let tempHtmlNode = document.createElement("span");
            document.body.appendChild(tempHtmlNode);
            
            tempHtmlNode.innerHTML = textLabelData;
            tempHtmlNode.style.fontWeight = textLabel.styles.fontWeight;
            tempHtmlNode.style.fontSize = textLabel.styles.fontSize;
            tempHtmlNode.style.fontStyle = textLabel.styles.fontStyle;
            tempHtmlNode.style.padding = textLabel.styles.padding;
            tempHtmlNode.style['line-height'] = 1;
            let width = tempHtmlNode.offsetWidth;
            let height = tempHtmlNode.offsetHeight;
            document.body.removeChild(tempHtmlNode);
            
            return {width :width, height : height};
        },

        globalLockToggle: function (element, isGloballyLocked) {
            if (isGloballyLocked) {
                $(element).addClass('active');
                $($(element)[0]).attr({ 'adv-chart-tooltip': infChart.manager.getLabel('label.globalUnlock') });
                $($(element).children()[0]).attr({ class: 'icom icom-lock' })
            } else {
                $(element).removeClass('active');
                $($(element)[0]).attr({ 'adv-chart-tooltip': infChart.manager.getLabel('label.globalLock') });
                $($(element).children()[0]).attr({ class: 'icom icom-unlock' })
            }
        },
        getExtendedLineCordinates: function (line, isExtendToRight, isExtendToLeft) {
            var self = this,
                ann = self.annotation,
                options = ann.options,
                chart = ann.chart,
                xAxis = chart.xAxis[options.xAxis],
                yAxis = chart.yAxis[options.yAxis];

            var lineFirstX = parseFloat(line[1]),
                lineFirstY = parseFloat(line[2]),
                lineSecondX = parseFloat(line[4]),
                lineSecondY = parseFloat(line[5]);
            //solving a linear equation of the  form y = mx + c
            var m = (lineSecondY - lineFirstY) / (lineSecondX - lineFirstX),
                c = lineFirstY - m * lineFirstX,
                plotLeft = chart.plotLeft,
                plotRight = plotLeft + chart.plotWidth,
                plotTop = chart.plotTop,
                plotBottom = plotTop + chart.plotHeight,
                rightX, rightY, leftX, leftY;

            if (isExtendToRight) {
                if (lineSecondX > lineFirstX) {
                    rightX = plotRight - xAxis.toPixels(options.xValue);
                    rightY = m * (rightX) + c;
                } else if (lineSecondX == lineFirstX) {
                    rightX = lineFirstX;
                    if (lineSecondY < lineFirstY) {
                        rightY = plotTop - yAxis.toPixels(options.yValue);
                    } else if (lineSecondY > lineFirstY){
                        rightY = plotBottom - yAxis.toPixels(options.yValue);
                    } else {
                        rightY = lineSecondY;
                    }
                } else {
                    rightX = plotLeft - xAxis.toPixels(options.xValue);
                    rightY = m * (rightX) + c;
                }
            }

            if (isExtendToLeft) {
                if (lineSecondX > lineFirstX) {
                    leftX = plotLeft - xAxis.toPixels(options.xValue);
                    leftY = m * (leftX) + c;
                } else if (lineSecondX == lineFirstX) {
                    leftX = lineFirstX;
                    if (lineSecondY > lineFirstY) {
                        leftY = plotTop - yAxis.toPixels(options.yValue);
                    } else if (lineSecondY < lineFirstY) {
                        leftY = plotBottom - yAxis.toPixels(options.yValue);
                    } else {
                        leftY = lineSecondY;
                    }
                } else {
                    leftX = plotRight - xAxis.toPixels(options.xValue);
                    leftY = m * (leftX) + c;
                }
            }

            return {lineRightX: rightX, lineRightY: rightY, lineLeftX: leftX, lineLeftY: leftY}
        },
        drawArrowHead : function (line, isStartPoint, isEndPoint){
            pathArray = line.split(' ');
            var k = Math.sqrt(2)
            var arrowHeadLength = 10*k 
            var startArrowHead, endArrowHead;
            if (isStartPoint){
                let x0, y0, x1, y1, x2, y2, x3, y3;
                x0 = pathArray[1],
                y0 = pathArray[2],
                x1 = pathArray[4],
                y1 = pathArray[5];
        
                if(parseFloat(x1) > parseFloat(x0) && parseFloat(y1) < parseFloat(y0)){
                    let tanTeta = (y1-y0)/(x1-x0);
                    let radAngle = Math.atan(tanTeta);
                    let pi = Math.PI;
                    let beta = 45 * (pi/180);
                    x2 = arrowHeadLength * Math.sin(beta - radAngle) + parseFloat(x0);
                    y2 = arrowHeadLength * Math.cos(beta - radAngle) + parseFloat(y0);
        
                    x3 = arrowHeadLength * Math.cos(beta - radAngle) + parseFloat(x0);
                    y3 = parseFloat(y0) - arrowHeadLength * Math.sin(beta - radAngle);
                } else if (parseFloat(x1) < parseFloat(x0) && parseFloat(y1) < parseFloat(y0)){
                    let tanTeta = (y1-y0)/(x1-x0);
                    let radAngle = Math.atan(tanTeta);
                    let pi = Math.PI;
                    let beta = 45 * (pi/180);
                    x2 = parseFloat(x0) - arrowHeadLength * Math.sin(beta - radAngle);
                    y2 = parseFloat(y0) - arrowHeadLength * Math.cos(beta - radAngle);
        
                    x3 = parseFloat(x0) - arrowHeadLength * Math.cos(beta - radAngle);
                    y3 = parseFloat(y0) + arrowHeadLength * Math.sin(beta - radAngle);
                } else if (parseFloat(x1) > parseFloat(x0) && parseFloat(y1) > parseFloat(y0)){
                    let tanTeta = (y1-y0)/(x1-x0);
                    let radAngle = Math.atan(tanTeta);
                    let pi = Math.PI;
                    let beta = 45 * (pi/180);
                    x2 = parseFloat(x0) + arrowHeadLength * Math.cos(beta - radAngle);
                    y2 = parseFloat(y0) - arrowHeadLength * Math.sin(beta - radAngle);
        
                    x3 = parseFloat(x0) + arrowHeadLength * Math.sin(beta - radAngle);
                    y3 = parseFloat(y0) + arrowHeadLength * Math.cos(beta - radAngle);
                } else if (parseFloat(x1) < parseFloat(x0) && parseFloat(y1) > parseFloat(y0)){
                    let tanTeta = (y1-y0)/(x1-x0);
                    let radAngle = Math.atan(tanTeta);
                    let pi = Math.PI;
                    let beta = 45 * (pi/180);
                    x2 = parseFloat(x0) - arrowHeadLength * Math.cos(beta - radAngle);
                    y2 = parseFloat(y0) + arrowHeadLength * Math.sin(beta - radAngle);
        
                    x3 = parseFloat(x0) - arrowHeadLength * Math.sin(beta - radAngle);
                    y3 = parseFloat(y0) - arrowHeadLength * Math.cos(beta - radAngle);
                } else if(parseFloat(x1) == parseFloat(x0) && parseFloat(y1) < parseFloat(y0)){
                    let pi = Math.PI;
                    let beta = 45 * (pi/180);
                    let lenArrow = Math.cos(beta)
                    x2 = parseFloat(x0) - arrowHeadLength * lenArrow;
                    y2 = parseFloat(y0) - arrowHeadLength * lenArrow;
        
                    x3 = parseFloat(x0) + arrowHeadLength * lenArrow;
                    y3 = parseFloat(y0) - arrowHeadLength * lenArrow;
                } else if(parseFloat(x1) == parseFloat(x0) && parseFloat(y1) > parseFloat(y0)){
                    let pi = Math.PI;
                    let beta = 45 * (pi/180);
                    let lenArrow = Math.cos(beta)
                    x2 = parseFloat(x0) - arrowHeadLength * lenArrow;
                    y2 = parseFloat(y0) + parseFloat(arrowHeadLength * lenArrow);
        
                    x3 = parseFloat(x0) + arrowHeadLength * lenArrow;
                    y3 = parseFloat(y0) + arrowHeadLength * lenArrow;
                }  else if(parseFloat(x1) < parseFloat(x0) && parseFloat(y1) == parseFloat(y0)){
                    let pi = Math.PI;
                    let beta = 45 * (pi/180);
                    let lenArrow = Math.cos(beta)
                    x2 = parseFloat(x0) - arrowHeadLength * lenArrow;
                    y2 = parseFloat(y0) + arrowHeadLength * lenArrow;
        
                    x3 = parseFloat(x0) - arrowHeadLength * lenArrow;
                    y3 = parseFloat(y0) - arrowHeadLength * lenArrow;
                }  else if(parseFloat(x1) > parseFloat(x0) && parseFloat(y1) == parseFloat(y0)){
                    let pi = Math.PI;
                    let beta = 45 * (pi/180);
                    let lenArrow = Math.cos(beta)
                    x2 = parseFloat(x0) + arrowHeadLength * lenArrow;
                    y2 = parseFloat(y0) + arrowHeadLength * lenArrow;
        
                    x3 = parseFloat(x0) + arrowHeadLength * lenArrow;
                    y3 = parseFloat(y0) - arrowHeadLength * lenArrow;
                } 
                startArrowHead = ['M', x2, y2, 'L', x0, y0, 'L', x3, y3];    
            } 
        
            if(isEndPoint) {
                let x0, y0, x1, y1, x2, y2, x3, y3;
                n = pathArray.length-1,
                x0 = pathArray[n-4],
                y0 = pathArray[n-3],
                x1 = pathArray[n-1],
                y1 = pathArray[n];
                        
                if (x0 === x1 && y0 === y1){
                    x0 = pathArray[n-7];
                    y0 = pathArray[n-6];
                }
        
                if(parseFloat(x1) < parseFloat(x0) && parseFloat(y1) < parseFloat(y0)){
                    let tanTeta = (y1-y0)/(x1-x0);
                    let radAngle = Math.atan(tanTeta);
                    let pi = Math.PI;
                    let beta = 45 * (pi/180);
                    x2 = arrowHeadLength * Math.sin(beta - radAngle) + parseFloat(x1);
                    y2 = arrowHeadLength * Math.cos(beta - radAngle) + parseFloat(y1);
        
                    x3 = arrowHeadLength * Math.cos(beta - radAngle) + parseFloat(x1);
                    y3 = parseFloat(y1) - arrowHeadLength * Math.sin(beta - radAngle);
                } else if (parseFloat(x1) > parseFloat(x0) && parseFloat(y1) < parseFloat(y0)){
                    let tanTeta = (y1-y0)/(x1-x0);
                    let radAngle = Math.atan(tanTeta);
                    let pi = Math.PI;
                    let beta = 45 * (pi/180);
                    x2 = parseFloat(x1) - arrowHeadLength * Math.sin(beta - radAngle);
                    y2 = parseFloat(y1) - arrowHeadLength * Math.cos(beta - radAngle);
        
                    x3 = parseFloat(x1) - arrowHeadLength * Math.cos(beta - radAngle);
                    y3 = parseFloat(y1) + arrowHeadLength * Math.sin(beta - radAngle);
                } else if (parseFloat(x1) < parseFloat(x0) && parseFloat(y1) > parseFloat(y0)){
                    let tanTeta = (y1-y0)/(x1-x0);
                    let radAngle = Math.atan(tanTeta);
                    let pi = Math.PI;
                    let beta = 45 * (pi/180);
                    x2 = parseFloat(x1) + arrowHeadLength * Math.cos(beta - radAngle);
                    y2 = parseFloat(y1) - arrowHeadLength * Math.sin(beta - radAngle);
        
                    x3 = parseFloat(x1) + arrowHeadLength * Math.sin(beta - radAngle);
                    y3 = parseFloat(y1) + arrowHeadLength * Math.cos(beta - radAngle);
                } else if (parseFloat(x1) > parseFloat(x0) && parseFloat(y1) > parseFloat(y0)){
                    let tanTeta = (y1-y0)/(x1-x0);
                    let radAngle = Math.atan(tanTeta);
                    let pi = Math.PI;
                    let beta = 45 * (pi/180);
                    x2 = parseFloat(x1) - arrowHeadLength * Math.cos(beta - radAngle);
                    y2 = parseFloat(y1) + arrowHeadLength * Math.sin(beta - radAngle);
        
                    x3 = parseFloat(x1) - arrowHeadLength * Math.sin(beta - radAngle);
                    y3 = parseFloat(y1) - arrowHeadLength * Math.cos(beta - radAngle);
                } else if(parseFloat(x1) == parseFloat(x0) && parseFloat(y1) > parseFloat(y0)){
                    let pi = Math.PI;
                    let beta = 45 * (pi/180);
                    let lenArrow = Math.cos(beta)
                    x2 = parseFloat(x1) - arrowHeadLength * lenArrow ;
                    y2 = parseFloat(y1) - arrowHeadLength * lenArrow;
        
                    x3 = parseFloat(x1) + arrowHeadLength * lenArrow;
                    y3 = parseFloat(y1) - arrowHeadLength * lenArrow;
                } else if(parseFloat(x1) == parseFloat(x0) && parseFloat(y1) < parseFloat(y0)){
                    let pi = Math.PI;
                    let beta = 45 * (pi/180);
                    let lenArrow = Math.cos(beta)
                    x2 = parseFloat(x1) - arrowHeadLength * lenArrow ;
                    y2 = parseFloat(y1) + arrowHeadLength * lenArrow;
        
                    x3 = parseFloat(x1) + arrowHeadLength * lenArrow;
                    y3 = parseFloat(y1) + arrowHeadLength * lenArrow;
                }  else if(parseFloat(x1) > parseFloat(x0) && parseFloat(y1) == parseFloat(y0)){
                    let pi = Math.PI;
                    let beta = 45 * (pi/180);
                    let lenArrow = Math.cos(beta)
                    x2 = parseFloat(x1) - arrowHeadLength * lenArrow ;
                    y2 = parseFloat(y1) + arrowHeadLength * lenArrow;
        
                    x3 = parseFloat(x1) - arrowHeadLength * lenArrow;
                    y3 = parseFloat(y1) - arrowHeadLength * lenArrow;
                }  else if(parseFloat(x1) < parseFloat(x0) && parseFloat(y1) == parseFloat(y0)){
                    let pi = Math.PI;
                    let beta = 45 * (pi/180);
                    let lenArrow = Math.cos(beta)
                    x2 = parseFloat(x1) + arrowHeadLength * lenArrow ;
                    y2 = parseFloat(y1) + arrowHeadLength * lenArrow;
        
                    x3 = parseFloat(x1) + arrowHeadLength * lenArrow;
                    y3 = parseFloat(y1) - arrowHeadLength * lenArrow;
                } 
                endArrowHead = ['M', x2, y2, 'L', x1, y1, 'L', x3, y3];
            }
        
            return {
                startArrowHead: startArrowHead,
                endArrowHead: endArrowHead
            }
        }
    };

    infChart.drawingUtils.common.setTheme();

    infChart.drawingUtils.highLowLabels = {
        checkOverlaps: function (annotation, nearestXDataPoint) {
            var overlappingDrawings = [];
            var allDrawings = infChart.drawingsManager.getAllDrawings(infChart.drawingsManager.getChartIdFromHighchartInstance(annotation.chart));

            if(allDrawings) {
                $.each(allDrawings, function (key, drawing) {
                    if (drawing.shape === "highLowLabels" && drawing.annotation.options.nearestXDataPoint === nearestXDataPoint) {
                        overlappingDrawings.push(drawing);
                    }
                });
            }

            return overlappingDrawings.length > 1;
        },
        updateLabels: function (annotation, stockChart) {
            var allDrawings = infChart.drawingsManager.getAllDrawings(infChart.drawingsManager.getChartIdFromHighchartInstance(annotation.chart));
            var highLowLabelDrawings = [];

            if(allDrawings) {
                $.each(allDrawings, function (key, drawing) {
                    if (drawing.shape === "highLowLabels") {
                        highLowLabelDrawings.push(drawing);
                    }
                });
            }

            highLowLabelDrawings.sort((a,b) => a.annotation.options.xValue - b.annotation.options.xValue);
            var labelValue,
                currentDrawing,
                previousDrawing,
                xAxis = annotation.chart.xAxis[annotation.options.xAxis],
                calculatedLabelData = {
                    change: 0,
                    percentageChange: 0,
                    bars: 0
                };

            for(var i = 0; i < highLowLabelDrawings.length; i++) {
                currentDrawing = highLowLabelDrawings[i];

                if(annotation.options.xValue <= currentDrawing.annotation.options.xValue) {
                    if (i === 0) {
                        calculatedLabelData.bars = 0;
                        calculatedLabelData.change = 0;
                        calculatedLabelData.percentageChange = 0;
                    } else {
                        previousDrawing = highLowLabelDrawings[i - 1];
                        calculatedLabelData.bars = currentDrawing.annotation.options.dataIndex - previousDrawing.annotation.options.dataIndex;
                        calculatedLabelData.change = currentDrawing.annotation.options.price - previousDrawing.annotation.options.price;
                        calculatedLabelData.percentageChange = ((calculatedLabelData.change/ previousDrawing.annotation.options.price) * 100);
                    }

                    currentDrawing.annotation.update({
                        title: {
                            text: infChart.drawingUtils.highLowLabels.getLabelData(currentDrawing.annotation, stockChart, calculatedLabelData)
                        },
                        calculatedLabelData: calculatedLabelData
                    });

                    currentDrawing.annotation.title.attr({
                        x: xAxis.toPixels(currentDrawing.annotation.options.nearestXDataPoint) - xAxis.toPixels(currentDrawing.annotation.options.xValue) - (currentDrawing.annotation.title.width / 2)
                    });

                    if(annotation.options.xValue < currentDrawing.annotation.options.xValue) {
                        break;
                    }
                }
            }
        },
        getLabelData: function (annotation, stockChart, calculatedLabelData) {
            var formattedLabels = [];

            $.each(annotation.options.labelDataItems, function (index, labelDataItem) {
                if(labelDataItem.enabled) {
                    switch (labelDataItem.id) {
                        case 'date':
                            formattedLabels.push(infChart.drawingUtils.highLowLabels.formatDate(annotation.options.nearestXDataPoint, stockChart.interval));
                            break;
                        case 'price':
                            formattedLabels.push(infChart.StockChart.prototype.formatValue.call(stockChart, annotation.options.price, undefined, undefined, undefined, undefined, NO_OF_SPECIFIC_DECIMAL_POINTS));
                            break;
                        case 'change':
                            var change = calculatedLabelData.change === 0 ? calculatedLabelData.change.toFixed(2) : infChart.StockChart.prototype.formatValue.call(stockChart, calculatedLabelData.change, undefined, undefined, undefined, undefined, NO_OF_SPECIFIC_DECIMAL_POINTS);
                            formattedLabels.push(change);
                            break;
                        case 'pChange':
                            formattedLabels.push(calculatedLabelData.percentageChange.toFixed(2) + '%');
                            break;
                        case 'bars':
                            formattedLabels.push(calculatedLabelData.bars + ' TB');
                            break;
                    }
                }
            });

            if(!annotation.options.isHighLabel) {
                formattedLabels = formattedLabels.reverse();
            }

            return formattedLabels.join('<br>');
        },
        formatDate: function (timeInMillis, chartInterval) {
            var _getMonth = function (val) {
                var shortFormat = "";
                switch (val) {
                    case 1:
                        shortFormat = "Ja";
                        break;
                    case 2:
                        shortFormat = "Fb";
                        break;
                    case 3:
                        shortFormat = "Ma";
                        break;
                    case 4:
                        shortFormat = "Ap";
                        break;
                    case 5:
                        shortFormat = "My";
                        break;
                    case 6:
                        shortFormat = "Jn";
                        break;
                    case 7:
                        shortFormat = "Jl";
                        break;
                    case 8:
                        shortFormat = "Au";
                        break;
                    case 9:
                        shortFormat = "Se";
                        break;
                    case 10:
                        shortFormat = "Oc";
                        break;
                    case 11:
                        shortFormat = "Nv";
                        break;
                    case 12:
                        shortFormat = "Dc";
                        break;
                }
                return shortFormat;
            };

            var _replaceMonth = function (val) {
                var parts = val.split(".");
                if (parts.length > 2) {
                    val = val.replace("." + parts[1] + ".", _getMonth(parseInt(parts[1], 10)));
                } else if (parts.length > 1) {
                    val = val.replace(parts[1] + ".", _getMonth(parseInt(parts[1], 10)));
                }
                return val;
            };

            var format;
            switch (chartInterval) {
                case 'T':
                    format = '%d.%m.%y %H:%M:%S';
                    break;
                case 'M':
                    format = '%b.%y';
                    break;
                case 'Y':
                    format = '%y';
                    break;
                case 'D':
                case 'W':
                    format = '%d.%m.%y';
                    break;
                default:
                    format = '%d.%m.%y %H:%M';
                    break;

            }
            return _replaceMonth(infChart.util.formatDate(timeInMillis, format));
        }
    }

})(infChart, jQuery);
