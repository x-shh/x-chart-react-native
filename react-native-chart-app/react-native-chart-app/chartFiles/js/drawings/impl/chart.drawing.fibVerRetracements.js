window.infChart = window.infChart || {};

infChart.fibVerRetracementsDrawing = function () {
    infChart.drawingObject.apply(this, arguments);
    this.fibLevels = [
        {
            id: 'level_0',
            value: 0.0,
            enable: true,
            drawingPosX: -41,
            drawingPosY: 7,
            fillColor: '#726a6f',
            lineColor: '#959595',
            lineWidth: 1,
            fontColor: '#959595',
            fontSize: '10',
            fontWeight: 'normal'
        },
        {
            id: 'level_1',
            value: 23.6,
            enable: true,
            drawingPosX: -41,
            drawingPosY: 7,
            fillColor: '#835974',
            lineColor: '#959595',
            lineWidth: 1,
            fontColor: '#959595',
            fontSize: '10',
            fontWeight: 'normal'
        },
        {
            id: 'level_2',
            value: 38.2,
            enable: true,
            drawingPosX: -41,
            drawingPosY: 7,
            fillColor: '#7b6171',
            lineColor: '#959595',
            lineWidth: 1,
            fontColor: '#959595',
            fontSize: '10',
            fontWeight: 'normal'
        },
        {
            id: 'level_3',
            value: 50,
            enable: true,
            drawingPosX: -41,
            drawingPosY: 7,
            fillColor: '#f8bce2',
            lineColor: '#959595',
            lineWidth: 1,
            fontColor: '#959595',
            fontSize: '10',
            fontWeight: 'normal'
        },
        {
            id: 'level_4',
            value: 61.8,
            enable: true,
            drawingPosX: -41,
            drawingPosY: 7,
            fillColor: '#f075c3',
            lineColor: '#959595',
            lineWidth: 1,
            fontColor: '#959595',
            fontSize: '10',
            fontWeight: 'normal'
        },
        {
            id: 'level_5',
            value: 78.6,
            enable: true,
            drawingPosX: -41,
            drawingPosY: 7,
            fillColor: '#eb40ab',
            lineColor: '#959595',
            lineWidth: 1,
            fontColor: '#959595',
            fontSize: '10',
            fontWeight: 'normal'
        },
        {
            id: 'level_6',
            value: 100,
            enable: false,
            drawingPosX: -41,
            drawingPosY: 7,
            fillColor: '#c71585',
            lineColor: '#959595',
            lineWidth: 1,
            fontColor: '#959595',
            fontSize: '10',
            fontWeight: 'normal'
        },
        {
            id: 'level_7',
            value: 127.2,
            enable: true,
            drawingPosX: -41,
            drawingPosY: 7,
            fillColor: '#800e56',
            lineColor: '#959595',
            lineWidth: 1,
            fontColor: '#959595',
            fontSize: '10',
            fontWeight: 'normal'
        },
        {
            id: 'level_8',
            value: 161.8,
            enable: true,
            drawingPosX: -41,
            drawingPosY: 7,
            fillColor: '#4b0832',
            lineColor: '#959595',
            lineWidth: 1,
            fontColor: '#959595',
            fontSize: '10',
            fontWeight: 'normal'
        },
        {
            id: 'level_9',
            value: 200,
            enable: false,
            drawingPosX: -41,
            drawingPosY: 7,
            fillColor: '#726a6f',
            lineColor: '#959595',
            lineWidth: 1,
            fontColor: '#959595',
            fontSize: '10',
            fontWeight: 'normal'
        },
        {
            id: 'level_10',
            value: 261.8,
            enable: true,
            drawingPosX: -41,
            drawingPosY: 7,
            fillColor: '#835974',
            lineColor: '#959595',
            lineWidth: 1,
            fontColor: '#959595',
            fontSize: '10',
            fontWeight: 'normal'
        },
        {
            id: 'level_11',
            value: 0,
            enable: false,
            drawingPosX: -41,
            drawingPosY: 7,
            fillColor: '#7b6171',
            lineColor: '#959595',
            lineWidth: 1,
            fontColor: '#959595',
            fontSize: '10',
            fontWeight: 'normal'
        },
        {
            id: 'level_12',
            value: 0,
            enable: false,
            drawingPosX: -41,
            drawingPosY: 7,
            fillColor: '#f8bce2',
            lineColor: '#959595',
            lineWidth: 1,
            fontColor: '#959595',
            fontSize: '10',
            fontWeight: 'normal'
        },
        {
            id: 'level_13',
            value: 0,
            enable: false,
            drawingPosX: -41,
            drawingPosY: 7,
            fillColor: '#f075c3',
            lineColor: '#959595',
            lineWidth: 1,
            fontColor: '#959595',
            fontSize: '10',
            fontWeight: 'normal'
        }
    ];
    this.mainDrawingDragSupporterStyles = Object.assign({}, infChart.drawingUtils.common.dragSupporterStyles, {'type': 'mainDrawing'});
    this.additionalDrawingDragSupporterStyles = Object.assign({}, infChart.drawingUtils.common.dragSupporterStyles, {'type': 'additionalDrawing'});
};

infChart.fibVerRetracementsDrawing.prototype = Object.create(infChart.drawingObject.prototype);

infChart.fibVerRetracementsDrawing.prototype.additionalDrawingsFunction = function () {
    var self = this,
        ann = self.annotation,
        chart = ann.chart,
        options = ann.options,
        xAxis = chart.xAxis[options.xAxis];

    if (options.xValueEnd) {
        options.distance = options.xValueEndDataIndex - options.xValueDataIndex;
    } else {
        options.distance = 0;
    }
    options.adjustment = 0;
    self.createAdditionalDrawings();
};

infChart.fibVerRetracementsDrawing.prototype.applyAllToFibLines = function (enabled, fillColor, fillOpacity, lineColor, lineWidth, fontColor, fontSize, fontWeight, prevOptions, isPropertyChange) {
    var self = this;
    var options = self.annotation.options;
    options.isSingleColor = enabled;
    if (enabled) {
        self.changeAllFibLines('fillColor', { fill: fillColor, opacity: fillOpacity }, false);
        self.changeAllFibLines('lineColor', lineColor, false);
        self.changeAllFibLines('lineWidth', parseInt(lineWidth, 10), false);
        self.changeAllFibLabels('fontColor', fontColor, false);
        self.changeAllFibLabels('fontSize', fontSize, false);
        self.changeAllFibLabels('fontWeight', fontWeight, false);
    } else {
        var fibLevels = options.fibLevels;
        for (i = 0; i < fibLevels.length; i++) {
            var fibLevel = fibLevels[i];
            var fibLevelId = fibLevel.id;
            var preFibOption = prevOptions[fibLevelId];
            self.changeFibLine(fibLevelId, 'fillColor', { fill: preFibOption.fillColor, opacity: fibLevel.fillOpacity }, true, false);
            self.changeFibLine(fibLevelId, 'lineColor', preFibOption.lineColor, true, false);
            self.changeFibLine(fibLevelId, 'lineWidth', parseInt(preFibOption.lineWidth, 10), true, false);
            self.changeFibLabel(fibLevelId, 'fontColor', preFibOption.fontColor, true, false);
            self.changeFibLabel(fibLevelId, 'fontSize', preFibOption.fontSize, true, false);
            self.changeFibLabel(fibLevelId, 'fontWeight', preFibOption.fontWeight, true, false);
        }
        self.additionalDrawingBackToDefault();
        var shape = self.shape;
        var drawingTheme = infChart.drawingUtils.common.getTheme()[shape];
    }

    if (isPropertyChange) {
        self.onPropertyChange();
    }
};

infChart.fibVerRetracementsDrawing.prototype.shapeBackToDefault = function (property, propertyValue) {
    var self = this;
    var options = self.annotation.options;
    switch (property) {
        case 'lineColor':
            options.shape.params['stroke'] = propertyValue;
            self.annotation.shape.attr({
                'stroke': propertyValue
            });
            break;
        case 'lineWidth':
            options.shape.params['stroke-width'] = propertyValue;
            self.annotation.shape.attr({
                'stroke-width': propertyValue
            });
            break;
    }
}

infChart.fibVerRetracementsDrawing.prototype.beforeDestroy = function () {
    this.destroyAdditionalDrawings();
};

infChart.fibVerRetracementsDrawing.prototype.bindSettingsEvents = function () {
    var self = this,
        ann = self.annotation,
        options = ann.options,
        chartId = ann.chart.renderTo.id,
        shape = self.shape,
        stockChart = infChart.manager.getChart(infChart.manager.getContainerIdFromChart(chartId));

    var isPropertyChange = function () {
        self.annotation.options.enabledMyDefaultButton = true;
        var isPropertyChange = true;
        if (this.settingsPopup) {
            isPropertyChange = this.isSettingsPropertyChange();
        }
        return isPropertyChange;
    };

    var onTrendLineToggleShow = function (show) {
        self.onTrendLineToggleShow.call(self, show, isPropertyChange.call(self));
    };

    // var onClose = function () {
    //     infChart.drawingUtils.common.removeDrawing.call(self);
    // }

    /**
     * fib level line color change event
     * @param {object} rgb - color rgb
     * @param {string} lineColor - hash color
     */
    var onSingleLineColorChange = function (rgb, lineColor) {
        self.changeAllFibLines('lineColor', lineColor, isPropertyChange.call(self));
    }

    /**
     * change fibonacci drawing to single color or apply settings panle colors
     * @param {object} rgb color rgb
     * @param {string} value color hex
     * @param {number} opacity opacity
     * @param {boolean} isSingleColor is single color or not
     * @param {object} fibLevelColors fib level colors in settings panel
     */
    var onSingleFillColorChange = function (value, opacity) {
        self.changeAllFibLines('fillColor', { fill: value, opacity: opacity }, isPropertyChange.call(self));
    };

    /**
     * change fibonacci single line width change
     * @param {number} strokeWidth - strock size
     * @param {boolean} isSingleColor - is single color or not
     * @param {object} fibLevelWidths - fib level widths in settings panel
     */
    var onSingleLineWidthChange = function (strokeWidth) {
        self.changeAllFibLines('lineWidth', parseInt(strokeWidth, 10), isPropertyChange.call(self));
    };

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
    var onSingleOptionChange = function (fillColor, fillOpacity, lineColor, lineWidth, fontColor, fontSize, fontWeight, prevOptions, isSingleColor) {
        self.applyAllToFibLines(isSingleColor, fillColor, fillOpacity, lineColor, lineWidth, fontColor, fontSize, fontWeight, prevOptions, isPropertyChange.call(self));
    }

    /**
     * on fill color change event
     * @param {object} rgb - color rgb
     * @param {string} value - color hex
     * @param {number} opacity - opacity 0 - 1
     * @param {string} fibLevelId - fib level id
     * @param {boolean} isPropertyChange - is property change
     */
    var onFibLevelFillColorChange = function (rgb, value, opacity, fibLevelId) {
        self.changeFibLine(fibLevelId, 'fillColor', { fill: value, opacity: opacity }, false, isPropertyChange.call(self));
    };

    /**
     * fib level line color change event
     * @param {object} rgb - color rgb
     * @param {string} value - hash color
     * @param {string} fibLevelId - fib level id
     * @param {boolean} isPropertyChange - is property change
     */
    var onFibLevelLineColorChange = function (rgb, value, fibLevelId) {
        self.changeFibLine(fibLevelId, 'lineColor', value, false, isPropertyChange.call(self));
    };

    /**
     * line width change event used for both single level and all level
     * @param {number} strokeWidth - stroke width
     * @param {string} fibLevelId - fib level id
     */
    var onFibLevelLineWidthChange = function (strokeWidth, fibLevelId) {
        self.changeFibLine(fibLevelId, 'lineWidth', parseInt(strokeWidth, 10), false, isPropertyChange.call(self));
    };

    var onFibLevelChange = function (checked, fibLevelId) {
        self.changeFibLine(fibLevelId, 'enabled', checked, false, isPropertyChange.call(self));
    };

    var onFibLvlValueChange = function (fibLevelId, value) {
        self.changeFibLine(fibLevelId, 'value', value, false, isPropertyChange.call(self));
    };

    var onFibModeChange = function (checked) {
        self.changeMode(checked, isPropertyChange.call(self));
    };

    var onFibSingleFontColorChange = function (rgb, value) {
        self.changeAllFibLabels('fontColor', value, isPropertyChange.call(self));
    };

    var onFibSingleFontSizeChange = function (fontSize) {
        self.changeAllFibLabels('fontSize', fontSize, isPropertyChange.call(self));
    };

    var onFibLevelFontColorChange = function (rgb, value, fibLevelId) {
        self.changeFibLabel(fibLevelId, 'fontColor', value, false, isPropertyChange.call(self));
    };

    var onFibLevelFontSizeChange = function (fontSize, fibLevelId) {
        self.changeFibLabel(fibLevelId, 'fontSize', fontSize, false, isPropertyChange.call(self));
    };

    var onFibLevelFontWeightChange = function (fibLevelId, value) {
        self.changeFibLabel(fibLevelId, 'fontWeight', value, false, isPropertyChange.call(self));
    };

    var onFibSingleFontWeightChange = function (value) {
        self.changeAllFibLabels('fontWeight', value, isPropertyChange.call(self));
    };

    var onFibApplyAllButtonClick = function (fillColor, fillOpacity, lineColor, lineWidth, fontColor, fontSize, fontWeight, prevOptions) {
        infChart.drawingUtils.common.settings.onFibApplyAllButtonClick.call(self, fillColor, fillOpacity, lineColor, lineWidth, fontColor, fontSize, fontWeight, prevOptions, true);
        self.annotation.options.enabledMyDefaultButton = true;
    };

    var onToggleSnapToHighLow = function (checked) { };

    var onSaveTemplate = function (templateName) {
        self.saveDrawingTemplate(templateName);
    };

    var onApplyTemplate = function (templateName) {
        self.applyDrawingTemplate(templateName);
    };

    var onDeleteTemplate = function (templateName) {
        self.deleteDrawingTemplate(templateName);
    };

    function onSetAsMyDefaultSettings() {
        infChart.drawingUtils.common.saveDrawingProperties.call(self);
        options.enabledMyDefaultButton = false;
    }

    function onResetToAppDefaultSettings() {
        self.updateSavedDrawingProperties(true);
    }

    function onResetToMyDefaultSettings() {
        self.resetToUserDefaultDrawingProperties();
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
        onToggleFibLevel: onFibLevelChange,
        onFibLvlValueChange: onFibLvlValueChange,
        onToggleFibMode: onFibModeChange,
        onSingleFontColorChange: onFibSingleFontColorChange,
        onFibLevelFontColorChange: onFibLevelFontColorChange,
        onSingleFontSizeChange: onFibSingleFontSizeChange,
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
        onTrendLineWidthChange:onTrendLineWidthChange,
        onTrendLineStyleChange: onTrendLineStyleChange
    }

    infChart.structureManager.drawingTools.bindFibSettings(self.settingsPopup, callBackFnFibSettings);
};

infChart.fibVerRetracementsDrawing.prototype.changeAdditionalDrawings = function (property, propertyValue) {
    var self = this;
    var additionalDrawingTypes = ['start', 'end', 'trend'];
    additionalDrawingTypes.forEach(function (type) {
        if (property == 'lineColor') {
            if (self.additionalDrawings.lines[type]) {
                self.additionalDrawings.lines[type].attr({
                    'stroke': propertyValue
                });
            }
        }
        if (property == 'lineWidth') {
            if (self.additionalDrawings.lines[type]) {
                self.additionalDrawings.lines[type].attr({
                    'stroke-width': propertyValue
                });
            }
        }
    });
    // additionalDrawingTypes.forEach(function (type) {
    //     if (property == 'lineColor') {
    //         if (self.additionalDrawings.labels[type]) {
    //             self.additionalDrawings.labels[type].css({
    //                 'color': propertyValue
    //             });
    //         }
    //     }
    // });
}

infChart.fibVerRetracementsDrawing.prototype.additionalDrawingBackToDefault = function () {
    var self = this;
    var additionalDrawingTypes = ['start', 'end', 'trend'];
    var shape = self.shape;
    var drawingTheme = infChart.drawingUtils.common.getTheme()[shape];
    additionalDrawingTypes.forEach(function (type) {
        if (self.additionalDrawings.lines[type]) {
            self.additionalDrawings.lines[type].attr({
                'stroke': '#959595',
                'stroke-width': 1
            });
        }
        if (self.additionalDrawings.labels[type]) {
            self.additionalDrawings.labels[type].attr({
                'font-color': '#959595',
                'font-size': 10
            }).css({
                'color': '#959595',
                'fontSize': 10 + 'px'
            });
        }
    });
    if (self.additionalDrawings.jointLine) {
        self.additionalDrawings.jointLine.attr({
            'stroke': '#959595',
            'stroke-width': 1
        });
    }
}

infChart.fibVerRetracementsDrawing.prototype.calculateLineStartPosition = function (fibLevel, isMain) {
    var self = this,
        ann = self.annotation,
        chart = ann.chart,
        options = ann.options,
        yAxis = chart.yAxis[options.yAxis];

    var lineStartPosition;
    var stockChartId = infChart.drawingsManager.getChartIdFromHighchartInstance(chart);
    var chartInstance = infChart.manager.getChart(stockChartId);
    if (self.additionalDrawings.lines['start'].d == ["M 0 0 L 0 0"]) {
        if (options.jointLineValue) {
            if (chartInstance.isLog || chartInstance.isCompare) {
                var yValueDiff = yAxis.toPixels(infChart.drawingUtils.common.getYValue.call(this, options.jointLineValue)) - yAxis.toPixels(options.yValue);
            } else {
                var yValueDiff = yAxis.toPixels(options.jointLineValue) - yAxis.toPixels(options.yValue);
            }
            lineStartPosition = yValueDiff;
        } else {
            lineStartPosition = 0 - yAxis.toPixels(options.yValue);
            options.lineStartPosition = lineStartPosition;
            var value = yAxis.toValue(0);
            options.jointLineValue = infChart.drawingUtils.common.getBaseYValue.call(this, value);
        }
    } else if (isMain) {
        if (chartInstance.isLog || chartInstance.isCompare) {
            var yValueDiff = yAxis.toPixels(infChart.drawingUtils.common.getYValue.call(this, options.jointLineValue)) - yAxis.toPixels(options.yValue);
        } else {
            var yValueDiff = yAxis.toPixels(options.jointLineValue) - yAxis.toPixels(options.yValue);
        }
        lineStartPosition = yValueDiff;
        options.jointLineValue = infChart.drawingUtils.common.getBaseYValue.call(this, yAxis.toValue(lineStartPosition + yAxis.toPixels(options.yValue)));
    } else if (isMain !== undefined) {
        var yValueDiff = yAxis.toPixels(options.chartY) - yAxis.toPixels(options.yValue);
        lineStartPosition = yValueDiff;
        options.jointLineValue = infChart.drawingUtils.common.getBaseYValue.call(this, yAxis.toValue(lineStartPosition + yAxis.toPixels(options.yValue)));
    } else {
        if (chartInstance.isLog || chartInstance.isCompare) {
            var yValueDiff = yAxis.toPixels(infChart.drawingUtils.common.getYValue.call(this, options.jointLineValue)) - yAxis.toPixels(options.yValue);
        } else {
            var yValueDiff = yAxis.toPixels(options.jointLineValue) - yAxis.toPixels(options.yValue);
        }
        lineStartPosition = yValueDiff;
    }
    return lineStartPosition;
};

infChart.fibVerRetracementsDrawing.prototype.changeAllFibLines = function (property, propertyValue, isPropertyChange) {
    var self = this;
    var options = self.annotation.options;
    if (isPropertyChange) {
        options.isSingleColor = true;
    }
    var fibLevels = options.fibLevels;
    switch (property) {
        case 'lineColor':
            options.lineColor = propertyValue;
            options.jointLineColor = propertyValue;
            self.changeAdditionalDrawings(property, propertyValue);
            if (self.additionalDrawings.jointLine) {
                self.additionalDrawings.jointLine.attr({
                    'stroke': propertyValue
                });
            }
            break;
        case 'fillColor':
            options.fillColor = propertyValue.fill;
            options.opacity = propertyValue.opacity;
            break;
        case 'lineWidth':
            options.lineWidth = propertyValue;
            options.jointLineWidth = propertyValue;
            self.changeAdditionalDrawings(property, propertyValue);
            if (self.additionalDrawings.jointLine) {
                self.additionalDrawings.jointLine.attr({
                    'stroke-width': propertyValue
                });
            }
            break;
    }
    fibLevels.forEach(function (fibLevel) {
        self.changeFibLine(fibLevel.id, property, propertyValue, true, false);
    });

    if (isPropertyChange) {
        self.onPropertyChange();
    }
};

infChart.fibVerRetracementsDrawing.prototype.changeAllFibLabels = function (property, propertyValue, isPropertyChange) {
    var self = this;
    var options = self.annotation.options;
    if (isPropertyChange) {
        options.isSingleColor = true;
    }
    var fibLevels = options.fibLevels;
    switch (property) {
        case 'fontColor':
            options.fontColor = propertyValue;
            if (self.additionalDrawings && self.additionalDrawings.labels['start']) {
                self.additionalDrawings.labels['start'].attr({
                    'font-color': propertyValue
                }).css({
                    'color': propertyValue
                });
            }
            if (self.additionalDrawings && self.additionalDrawings.labels['end']) {
                self.additionalDrawings.labels['end'].attr({
                    'font-color': propertyValue
                }).css({
                    'color': propertyValue
                });
            }
            if (self.additionalDrawings && self.additionalDrawings.labels['trend']) {
                self.additionalDrawings.labels['trend'].attr({
                    'font-color': propertyValue
                }).css({
                    'color': propertyValue
                });
            }
            break;
        case 'fontSize':
            options.fontSize = propertyValue;
            if (self.additionalDrawings && self.additionalDrawings.labels['start']) {
                self.additionalDrawings.labels['start'].attr({
                    'font-size': propertyValue
                }).css({
                    'fontSize': propertyValue + 'px'
                });
            }
            if (self.additionalDrawings && self.additionalDrawings.labels['end']) {
                self.additionalDrawings.labels['end'].attr({
                    'font-size': propertyValue
                }).css({
                    'fontSize': propertyValue + 'px'
                });
            }
            if (self.additionalDrawings && self.additionalDrawings.labels['trend']) {
                self.additionalDrawings.labels['trend'].attr({
                    'font-size': propertyValue
                }).css({
                    'fontSize': propertyValue + 'px'
                });
            }
            break;
        case 'fontWeight':
            options.fontWeight = propertyValue;
            if (self.additionalDrawings && self.additionalDrawings.labels['start']) {
                self.additionalDrawings.labels['start'].attr({
                    'font-weight': propertyValue
                }).css({
                    'font-weight': propertyValue
                });
            }
            if (self.additionalDrawings && self.additionalDrawings.labels['end']) {
                self.additionalDrawings.labels['end'].attr({
                    'font-weight': propertyValue
                }).css({
                    'font-weight': propertyValue
                });
            }
            if (self.additionalDrawings && self.additionalDrawings.labels['trend']) {
                self.additionalDrawings.labels['trend'].attr({
                    'font-weight': propertyValue
                }).css({
                    'font-weight': propertyValue
                });
            }
            break;
        default:
            break;
    }
    fibLevels.forEach(function (fibLevel) {
        self.changeFibLabel(fibLevel.id, property, propertyValue, true, false);
    });
    if (isPropertyChange) {
        self.onPropertyChange();
    }
};

infChart.fibVerRetracementsDrawing.prototype.changeFibLine = function (level, property, propertyValue, isAll, isPropertyChange, ignoreSettingsSave) {
    var self = this;
    var options = this.annotation.options;
    var fibLevels, fibLevel, fibIndex = -1;
    if (!isAll) {
        fibLevels = infChart.drawingUtils.common.sortFibLevelsByValue(options.fibLevels);
        for (var i = 0; i < fibLevels.length; i++) {
            if (level === fibLevels[i].id) {
                fibLevel = fibLevels[i];
                fibIndex = i;
                break;
            }
        }
    }

    var additionalDrawings = this.additionalDrawings;
    switch (property) {
        case 'enabled':
            if (propertyValue) {
                additionalDrawings.lines[level].show();
                additionalDrawings.labels[level].show();
                if (!options.isShort) {
                    additionalDrawings.fill[level].show();
                }
            } else {
                additionalDrawings.lines[level].hide();
                additionalDrawings.labels[level].hide();
                if (!options.isShort) {
                    additionalDrawings.fill[level].hide();
                }
            }
            fibLevel.enable = propertyValue;
            var isFirstLevelDisabled = true, k = fibIndex;
            for (k; k >= 0; k--) {
                if (fibLevels[k].enable) {
                    isFirstLevelDisabled = false;
                    break;
                }
            }
            var currentFibIndex = fibIndex;
            if (isFirstLevelDisabled) {
                for (currentFibIndex; currentFibIndex < fibLevels.length; currentFibIndex++) {
                    if (fibLevels[currentFibIndex].enable) {
                        break;
                    }
                }
                if (options.isShort) {
                    this.updateJointLine(parseFloat(this.additionalDrawings.lines[fibLevels[fibIndex].id].d.split(' ')[4]), fibIndex, fibLevels);
                }
            } else {
                if (options.isShort) {
                    this.updateJointLine(parseFloat(this.additionalDrawings.lines[fibLevels[k].id].d.split(' ')[4]), k, fibLevels);
                } else {
                    this.updateFill(fibLevels[k], k, fibLevels);
                }
            }
            break;
        case 'value':
            fibLevel.value = propertyValue;
            var x = this.updateFibLevel(fibLevel, fibIndex, fibLevels, this.annotation.options.distance, false, true);
            this.updateJointLine(x, fibIndex, fibLevels);
            break;
        case 'lineColor':
            additionalDrawings.lines[level].attr({
                'stroke': propertyValue
            });
            if (!isAll) {
                fibLevel.lineColor = propertyValue;
            }
            break;
        case 'fillColor':
            if (!options.isShort) {
                additionalDrawings.fill[level].attr({
                    'fill': propertyValue.fill,
                    'fill-opacity': propertyValue.opacity
                });
            } else {
                if (propertyValue.opacity === 0) {
                    propertyValue.fill = this.annotation.options.shape.params.fill;
                }
            }
            if (!isAll) {
                fibLevel.fillColor = propertyValue.fill;
                fibLevel.fillOpacity = propertyValue.opacity;
            }
            break;
        case 'lineWidth':
            additionalDrawings.lines[level].attr({
                'stroke-width': propertyValue
            });
            if (!isAll) {
                fibLevel.lineWidth = propertyValue;
            }
            break;
    }

    if (isPropertyChange) {
        this.onPropertyChange();
    }
};

infChart.fibVerRetracementsDrawing.prototype.changeFibLabel = function (level, property, propertyValue, isAll, isPropertyChange) {
    var self = this;
    var options = this.annotation.options;
    var fibLevels, fibLevel;
    if (!isAll) {
        fibLevels = infChart.drawingUtils.common.sortFibLevelsByValue(options.fibLevels);
        for (var i = 0; i < fibLevels.length; i++) {
            if (level === fibLevels[i].id) {
                fibLevel = fibLevels[i];
                break;
            }
        }
    }

    var additionalDrawings = this.additionalDrawings;
    switch (property) {
        case 'fontColor':
            if (options.isShort) {
                additionalDrawings.labels[level].attr({
                    'font-color': propertyValue
                }).css({
                    'color': propertyValue
                });
                if (!isAll) {
                    fibLevel.fontColor = propertyValue;
                }
            }
            break;
        case 'fontSize':
            if (options.isShort) {
                additionalDrawings.labels[level].attr({
                    'font-size': propertyValue
                }).css({
                    'fontSize': propertyValue + 'px'
                });
                if (!isAll) {
                    fibLevel.fontSize = propertyValue;
                }
            }
            break;
        case 'fontWeight':
            if (options.isShort) {
                additionalDrawings.labels[level].attr({
                    'font-size': propertyValue
                }).css({
                    'font-weight': propertyValue
                });
                if (!isAll) {
                    fibLevel.fontWeight = propertyValue;
                }
            }
            break;
        default:
            break;

    }
    if (isPropertyChange) {
        self.onPropertyChange();
    }
};

infChart.fibVerRetracementsDrawing.prototype.changeMode = function (enabled, isPropertyChange) {
    var self = this;
    var ann = self.annotation, options = ann.options;
    self.beforeDestroy();
    options.isShort = enabled;
    self.additionalDrawingsFunction();
    self.scale();
    self.updateSettings(self.getConfig());

    if (isPropertyChange) {
        self.onPropertyChange();
    }
};

infChart.fibVerRetracementsDrawing.prototype.createAdditionalDrawings = function () {
    var self = this,
        ann = self.annotation,
        options = ann.options,
        chart = ann.chart,
        dx = options.distance,
        adjustment = options.adjustment,
        fibLevels = options.fibLevels,
        shapeParams = options.shape.params,
        theme = infChart.drawingUtils.common.getTheme.call(this),
        baseFillOpacity = (theme.fibVerRetracements && typeof theme.fibVerRetracements.fillOpacity !== "undefined") ? theme.fibVerRetracements.fillOpacity : infChart.drawingUtils.common.baseFillOpacity,
        baseFontColor = (theme.fibVerRetracements && typeof theme.fibVerRetracements.fontColor !== "undefined") ? theme.fibVerRetracements.fontColor : infChart.drawingUtils.common.baseFontColor,
        baseFontSize = (theme.fibVerRetracements && typeof theme.fibVerRetracements.fontSize !== "undefined") ? theme.fibVerRetracements.fontSize : infChart.drawingUtils.common.baseFontSize,
        baseFontWeight = (theme.fibVerRetracements && typeof theme.fibVerRetracements.fontWeight !== "undefined") ? theme.fibVerRetracements.fontWeight : infChart.drawingUtils.common.baseFontWeight;

    self.additionalDrawings = {
        labels: {},
        lines: {},
        fill: {}
    };

    var drawingFillAttr = {
        'stroke-width': 0,
        'z-index': 2,
        cursor: 'default',
        color: shapeParams.stroke,
        'pointer-events': 'none'
    };
    var drawingAttr = {
        'z-index': 2,
        'stroke-width': shapeParams['stroke-width'],
        fill: shapeParams.fill,
        cursor: 'move',
        stroke: shapeParams.stroke
    };
    var labelCssAttr = {
        fontSize: baseFontSize + 'px',
        color: baseFontColor,
        'font-weight': baseFontWeight
    };
    var labelAttr = {
        'font-color': baseFontColor,
        'font-size': baseFontSize,
        'font-weight': baseFontWeight,
        'type': 'additionalDrawing',
        cursor: 'move'
    };

    var dateLabelAttr = Object.assign({}, labelAttr);
    var dateLabelCssAttr = Object.assign({}, labelCssAttr);
    var dateDrawingAttr = Object.assign({}, drawingAttr);

    // add fill objects first to avoid overlapping lines with and texts with them
    fibLevels = infChart.drawingUtils.common.sortFibLevelsByValue(fibLevels);

    var isStartEnabled = false, isEndEnabled = false;
    fibLevels.forEach(function (fibLevel) {
        var distanceMultiplier = parseFloat(fibLevel.value) / 100;
        var x = adjustment + (dx > 0 ? dx : -dx) * distanceMultiplier;
        var themeFillColor = theme.fibVerRetracements && theme.fibVerRetracements.fibLevelFillColors && theme.fibVerRetracements.fibLevelFillColors[fibLevel.id];
        var lineWidth = options.isSingleColor ? options.lineWidth : (fibLevel.lineWidth ? fibLevel.lineWidth : shapeParams['stroke-width']);
        var lineColor = options.isSingleColor ? options.lineColor : (fibLevel.lineColor ? fibLevel.lineColor : shapeParams.stroke);
        var opacity = options.isSingleColor ? options.opacity : (fibLevel.fillOpacity ? fibLevel.fillOpacity : baseFillOpacity);
        var fontColor = options.isSingleColor ? options.fontColor : (fibLevel.fontColor ? fibLevel.fontColor : baseFontColor);
        var fontSize = options.isSingleColor ? options.fontSize : (fibLevel.fontSize ? fibLevel.fontSize : baseFontSize);
        var fontWeight = options.isSingleColor ? options.fontWeight : (fibLevel.fontWeight ? fibLevel.fontWeight : baseFontWeight);

        drawingFillAttr.fill = options.isSingleColor ? options.fillColor : (fibLevel.fillColor ? fibLevel.fillColor : themeFillColor);
        drawingFillAttr['fill-opacity'] = opacity;
        drawingFillAttr.stroke = lineColor;
        drawingFillAttr.level = fibLevel.id;

        drawingAttr['stroke-width'] = parseInt(lineWidth, 10);
        drawingAttr.stroke = lineColor;
        drawingAttr.level = fibLevel.id;

        labelCssAttr.color = fontColor;
        labelCssAttr.fontSize = fontSize + 'px';
        labelCssAttr['font-weight'] = fontWeight;

        labelAttr['level'] = fibLevel.id;
        labelAttr['font-color'] = fontColor;
        labelAttr['font-size'] = fontSize;
        labelCssAttr['font-weight'] = fontWeight;

        var labelValue = self.getLineLabelText(x, fibLevel);
        if (!options.isShort) {
            self.additionalDrawings.fill[fibLevel.id] = chart.renderer.path(['M', 0, 0, 'L', 0, 0, 'L', 0, 0, 'L', 0, 0]).attr(drawingFillAttr).add(ann.group);
        }
        self.additionalDrawings.lines[fibLevel.id] = chart.renderer.path(['M', 0, 0, 'L', 0, 0]).attr(drawingAttr).add(ann.group);
        self.additionalDrawings.labels[fibLevel.id] = chart.renderer.label(labelValue, fibLevel.drawingPosX, fibLevel.drawingPosY).css(labelCssAttr).attr(labelAttr).add(ann.group);
        if (!fibLevel.enable) {
            self.additionalDrawings.lines[fibLevel.id].hide();
            self.additionalDrawings.labels[fibLevel.id].hide();
            if (!options.isShort) {
                self.additionalDrawings.fill[fibLevel.id].hide();
            }
        } else {
            if (fibLevel.value === 0) {
                isStartEnabled = true;
            }
            if (fibLevel.value === 100) {
                isEndEnabled = true;
            }
        }
    });

    if (options.isSingleColor) {
        dateLabelAttr = labelAttr;
        dateLabelCssAttr = labelCssAttr;
        dateDrawingAttr = drawingAttr;
        delete dateDrawingAttr['level'];
        delete dateLabelAttr['level'];
    }

    dateDrawingAttr['stroke-width'] = options.jointLineWidth;
    dateDrawingAttr.stroke = options.jointLineColor

    if (options.isShort) {
        var startValue = self.formatDate(options.nearestXValue, self.stockChart.interval);
        self.additionalDrawings.lines['start'] = chart.renderer.path(['M', 0, 0, 'L', 0, 0]).attr(dateDrawingAttr).add(ann.group);
        self.additionalDrawings.labels['start'] = chart.renderer.label(startValue).css(dateLabelCssAttr).attr(dateLabelAttr).add(ann.group);
        if (!options.trendXValue && isStartEnabled) {
            self.additionalDrawings.lines['start'].hide();
            self.additionalDrawings.labels['start'].hide();
        }

        var endValue = self.formatDate(options.nearestXValueEnd, self.stockChart.interval);
        self.additionalDrawings.lines['end'] = chart.renderer.path(['M', 0, 0, 'L', 0, 0]).attr(dateDrawingAttr).add(ann.group);
        self.additionalDrawings.labels['end'] = chart.renderer.label(endValue).css(dateLabelCssAttr).attr(dateLabelAttr).add(ann.group);
        if (!options.trendXValue && isEndEnabled) {
            self.additionalDrawings.lines['end'].hide();
            self.additionalDrawings.labels['end'].hide();
        }

        var jointLineWidth = options.isSingleColor ? options.lineWidth : options.jointLineWidth;
        var jointLineColor = options.isSingleColor ? options.lineColor : options.jointLineColor;

        self.additionalDrawings.jointLine = chart.renderer.path(['M', 0, 0, 'L', 0, 0]).attr({
            'stroke-width': jointLineWidth,
            fill: ann.options.shape.params.fill,
            stroke: jointLineColor,
            'z-index': 2,
            cursor: 'move'
        }).add(ann.group);

        //options.shape.params['stroke'] = jointLineColor;
        //options.shape.params['stroke-width'] = jointLineWidth;
    }
};

infChart.fibVerRetracementsDrawing.prototype.deselect = function (isMouseOut) {
    var self = this;
    var options = self.annotation.options;
    infChart.drawingUtils.common.onDeselect.call(this);
    if (isMouseOut) {
        if(this.annotation.options && !this.annotation.options.isTrendLineAlways){
            this.annotation.shape.hide();
            self.setDragSupporters();
        }
    }
};

infChart.fibVerRetracementsDrawing.prototype.destroyAdditionalDrawings = function () {
    var self = this;
    var options = self.annotation.options;
    var fibLevels = options.fibLevels;
    fibLevels.forEach(function (fibLevel) {
        self.additionalDrawings.labels[fibLevel.id].destroy();
        self.additionalDrawings.lines[fibLevel.id].destroy();
        if (self.additionalDrawings.fill[fibLevel.id]) {
            self.additionalDrawings.fill[fibLevel.id].destroy();
        }
    });
    if (self.additionalDrawings.jointLine) {
        self.additionalDrawings.jointLine.destroy();
    }
    if (self.additionalDrawings.labels['start']) {
        self.additionalDrawings.labels['start'].destroy();
        self.additionalDrawings.lines['start'].destroy();
    }
    if (self.additionalDrawings.labels['end']) {
        self.additionalDrawings.labels['end'].destroy();
        self.additionalDrawings.lines['end'].destroy();
    }
};

infChart.fibVerRetracementsDrawing.prototype.formatDate = function (timeInMillis, chartInterval) {
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
};

infChart.fibVerRetracementsDrawing.prototype.getConfig = function () {
    var self = this,
        options = self.annotation.options,
        fibLevels = options.fibLevels;
    fibLevels = infChart.drawingUtils.common.sortFibLevelsByValue(options.fibLevels);
    return {
        shape: 'fibVerRetracements',
        fibLevels: fibLevels,
        lineColor: options.lineColor,
        fillColor: options.fillColor,
        opacity: options.opacity,
        lineWidth: options.lineWidth,
        fontColor: options.fontColor,
        fontSize: options.fontSize,
        fontWeight: options.fontWeight,
        xValue: options.xValue,
        xValueDataIndex: options.xValueDataIndex,
        yValue: options.yValue,
        xValueEnd: options.xValueEnd,
        xValueEndDataIndex: options.xValueEndDataIndex,
        yValueEnd: options.yValueEnd,
        isSingleColor: options.isSingleColor,
        isShort: options.isShort,
        borderColor: options.lineColor, //Todo : refactor this check getOptions method
        jointLineValue: options.jointLineValue,
        isTrendLineAlways: options.isTrendLineAlways,
        trendLineColor: options.trendLineColor,
        trendLineOpacity: options.trendLineOpacity,
        trendLineWidth: options.trendLineWidth,
        trendLineStyle: options.trendLineStyle,
        jointLineColor: options.jointLineColor,
        jointLineWidth: options.jointLineWidth,
        isLocked : options.isLocked

    };
};

infChart.fibVerRetracementsDrawing.prototype.getContextMenuOptions = function (chartId, drawingId, options, event) {
    var self = this;
    var level = event.target.getAttribute('level');
    if (!level && event.target.parentElement) {
        if (event.target.parentElement && event.target.parentElement.getAttribute('level')) {
            level = event.target.parentElement.getAttribute('level');
        } else if (event.target.parentElement.parentElement && event.target.parentElement.parentElement.getAttribute('level')) {
            level = event.target.parentElement.parentElement.getAttribute('level');
        }
    }

    var contextMenu = {
        "copyToClipboard": {
            icon: options.copyToClipboard.icon,
            displayText: options.copyToClipboard.displayText,
            action: function () {
                if (level) {
                    infChart.drawingUtils.common.onFibLevelCopy.call(self, level);
                }
            }
        },
        "eraseThis": {
            icon: options.erase.icon,
            displayText: options.erase.displayText,
            action: function () {
                if (level) {
                    self.eraseFibLevel(level, false, true, true);
                }
            }
        }
    };

    if (level) {
        contextMenu = Object.assign(contextMenu, infChart.drawingUtils.common.getContextMenuOptions(chartId, drawingId, options));
        return infChart.drawingUtils.common.reorderContextMenu(contextMenu);
    } else {
        return infChart.drawingUtils.common.getContextMenuOptions(chartId, drawingId, options)
    }
};

infChart.fibVerRetracementsDrawing.prototype.eraseFibLevel = function (level, checked, isPropertyChange, ignoreSettingsSave) {
    var self = this;
    self.additionalDrawings.lines[level].hide();
    self.additionalDrawings.labels[level].hide();
    if (self.additionalDrawings.fill[level]) {
        self.additionalDrawings.fill[level].hide();
    }
    var propeties = self.getConfig();

    propeties.fibLevels.forEach(function (fibLevel) {
        if (fibLevel.id === level) {
            fibLevel.enable = false;
        }
    });
    if (!self.isEndLevelEnabled()) {
        self.additionalDrawings.lines['end'].show();
        self.additionalDrawings.labels['end'].show();
    }
    if (!self.isStartLevelEnabled()) {
        self.additionalDrawings.lines['start'].show();
        self.additionalDrawings.labels['start'].show();
    }
    self.changeFibLine(level, 'enabled', checked, false, false, ignoreSettingsSave);
};

infChart.fibVerRetracementsDrawing.prototype.getCurrentPropertyValue = function (level, property, isAll) {
    var options = this.annotation.options;
    var fibLevel;
    if (!isAll) {
        var fibLevels = options.fibLevels;
        fibLevel = fibLevels.find(function (fibLevel) {
            return fibLevel.id === level;
        });
    }
    var propertyValue;
    if (fibLevel || (isAll && property !== 'enabled' && property !== 'value')) {
        switch (property) {
            case 'enabled':
                propertyValue = fibLevel.enable;
                break;
            case 'value':
                propertyValue = fibLevel.value;
                break;
            case 'lineColor':
                propertyValue = isAll ? options.lineColor : fibLevel.lineColor;
                break;
            case 'fillColor':
                propertyValue = {
                    fill: isAll ? options.fillColor : fibLevel.fillColor,
                    opacity: isAll ? options.opacity : fibLevel.fillOpacity
                }
                break;
            case 'lineWidth':
            case 'fontSize':
                propertyValue = isAll ? parseInt(options[property], 10) : parseInt(fibLevel[property], 10);
                break;
            default:
                propertyValue = isAll ? options[property] : fibLevel[property];
                break;
        }
    }
    return propertyValue;
};

infChart.fibVerRetracementsDrawing.prototype.getLineLabelText = function (x, fibLevel) {
    var self = this;
    var options = self.annotation.options;
    var chart = self.annotation.chart;
    var xAxis = chart.xAxis[options.xAxis];
    var labelValue;
    var fibLevelValue = infChart.drawingUtils.common.formatValue(fibLevel.value / 100, 3);
    if (options.isShort) {
        var time = xAxis.toValue(x + xAxis.toPixels(options.xValue));
        labelValue = self.formatDate(time, self.stockChart.interval) + '<br/>' + fibLevelValue;
    } else {
        labelValue = fibLevelValue;
    }
    return labelValue;
};

infChart.fibVerRetracementsDrawing.prototype.getOptions = function (properties, chart) {
    var nearestDataForXValue = infChart.math.findNearestDataPoint(chart, properties.xValue, undefined, true, true);
    var options = {
        xValue: properties.xValue,
        nearestXValue: nearestDataForXValue.xData,
        xValueDataIndex: properties.xValueDataIndex,
        yValue: properties.yValue,
        allowDragX: false,
        shape: {
            params: {
                d: ['M', 0, 0, 'L', 0, 0]
            }
        }
    };
    var theme = infChart.drawingUtils.common.getTheme.call(this);
    var shapeTheme = theme["fibVerRetracements"];
    var baseFillColor = (theme.fibVerRetracements && theme.fibVerRetracements.singleFillColor) ? theme.fibVerRetracements.singleFillColor : (theme.fibonacci && theme.fibonacci.singleFillColor) ? theme.fibonacci.singleFillColor : infChart.drawingUtils.common.baseFillColor;
    var baseFillOpacity = (theme.fibVerRetracements && typeof theme.fibVerRetracements.fillOpacity !== "undefined") ? theme.fibVerRetracements.fillOpacity : (theme.fibonacci && typeof theme.fibonacci.fillOpacity !== "undefined") ? theme.fibonacci.fillOpacity : infChart.drawingUtils.common.baseFillOpacity;
    var baseBorderColor = (theme.fibVerRetracements && theme.fibVerRetracements.borderColor) ? theme.fibVerRetracements.borderColor : (theme.fibonacci && theme.fibonacci.borderColor) ? theme.fibonacci.borderColor : infChart.drawingUtils.common.baseBorderColor;
    var baseLineWidth = (theme.fibVerRetracements && typeof theme.fibVerRetracements.lineWidth !== "undefined") ? theme.fibVerRetracements.lineWidth : (theme.fibonacci && theme.fibonacci.lineWidth) ? theme.fibonacci.lineWidth : infChart.drawingUtils.common.baseLineWidth;
    var baseFontColor = (theme.fibVerRetracements && theme.fibVerRetracements.fontColor) ? theme.fibVerRetracements.fontColor : (theme.fibonacci && theme.fibonacci.fontColor) ? theme.fibonacci.fontColor : infChart.drawingUtils.common.baseFontColor;
    var baseFontSize = (theme.fibVerRetracements && theme.fibVerRetracements.fontSize) ? theme.fibVerRetracements.fontSize : (theme.fibonacci && theme.fibonacci.fontSize) ? theme.fibonacci.fontSize : infChart.drawingUtils.common.baseFontSize;
    var baseFontWeight = (theme.fibVerRetracements && theme.fibVerRetracements.fontWeight) ? theme.fibVerRetracements.fontWeight : (theme.fibonacci && theme.fibonacci.fontWeight) ? theme.fibonacci.fontWeight : infChart.drawingUtils.common.baseFontWeight;

    options.trendLineColor = properties.trendLineColor ? properties.trendLineColor : shapeTheme.stroke || "#959595";
    options.trendLineOpacity = properties.trendLineOpacity ? properties.trendLineOpacity : shapeTheme.opacity || 1;
    options.trendLineWidth = properties.trendLineWidth ? properties.trendLineWidth : baseLineWidth || 1;
    options.trendLineStyle = properties.trendLineStyle ? properties.trendLineStyle : shapeTheme.dashstyle || 'solid';

    options.fillColor = properties.fillColor ? properties.fillColor : baseFillColor;
    options.opacity = properties.fillOpacity ? properties.fillOpacity : baseFillOpacity;
    options.lineColor = properties.borderColor ? properties.borderColor : baseBorderColor;
    options.lineWidth = properties.strokeWidth ? properties.strokeWidth : properties.lineWidth ? properties.lineWidth : baseLineWidth;
    options.fontColor = properties.fontColor ? properties.fontColor : baseFontColor;
    options.fontSize = properties.fontSize ? properties.fontSize : baseFontSize;
    options.fontWeight = properties.fontWeight ? properties.fontWeight : baseFontWeight;

    if (properties.xValueEnd && properties.yValueEnd) {
        var nearestDataForXValueEnd = infChart.math.findNearestDataPoint(chart, properties.xValueEnd, undefined, true, true);
        options.xValueEnd = properties.xValueEnd;
        options.xValueEndDataIndex = properties.xValueEndDataIndex;
        options.yValueEnd = properties.yValueEnd;
        options.nearestXValueEnd = nearestDataForXValueEnd.xData;
    }
    if (properties.isSingleColor) {
        options.isSingleColor = properties.isSingleColor;
    }
    options.fibLevels = properties.fibLevels ? properties.fibLevels : this.fibLevels;
    options.fibLevels = infChart.drawingUtils.common.getFibLevelsWithOpacity(infChart.drawingUtils.common.sortFibLevelsByValue(options.fibLevels), baseFillOpacity);
    options.showFibModeToggle = true;
    options.showTrendLineAlwaysToggle = true;
    options.isShort = typeof properties.isShort !== "undefined" ? properties.isShort : true;
    options.isTrendLineAlways = typeof properties.isTrendLineAlways !== "undefined" ? properties.isTrendLineAlways : true;
    options.isRealTimeTranslation = options.isShort;
    options.useAllXDataToFindNearestPoint = true;
    options.useFutureDate = true;
    options.jointLineValue = properties.jointLineValue;

    options.shape.params['stroke'] = options.trendLineColor;
    options.shape.params.opacity =  options.trendLineOpacity;
    options.shape.params['stroke-width'] = options.trendLineWidth;
    options.shape.params.dashstyle = options.trendLineStyle;
    if (properties.jointLineColor){
        options.jointLineColor = properties.jointLineColor;
    } else {
        options.jointLineColor = "#959595";
    }
    if (properties.jointLineWidth){
        options.jointLineWidth = properties.jointLineWidth;
    } else {
        options.jointLineWidth = 1;
    }

    options = infChart.Drawing.prototype.getOptions(properties,options);

    return options;
};

infChart.fibVerRetracementsDrawing.prototype.getQuickSettingsPopup = function () {
    var self = this;
    var options = self.annotation.options;
    var fillOpacity = (Object.hasOwnProperty(options, 'fillOpacity')) ? options.fillOpacity : (Object.hasOwnProperty(options, 'opacity')) ? options.opacity : 0;
    return infChart.drawingUtils.common.getFibQuickSettings(options.fillColor, fillOpacity, options.lineColor, options.fontColor, options.fontSize);
};

infChart.fibVerRetracementsDrawing.prototype.getSettingsPopup = function () {
    var self = this;
    var options = self.annotation.options;
    var userDefaultSettings = self.getUserDefaultSettings();
    var templates = self.getDrawingTemplates();

    var properties = {
        fillColor: options.fillColor,
        fillOpacity: options.opacity,
        lineColor: options.lineColor,
        lineWidth: options.lineWidth,
        fontColor: options.fontColor,
        fontSize: options.fontSize,
        fontWeight: options.fontWeight,
        fibLevels: options.fibLevels,
        showFibModeToggle: false,
        showSnapToHighLowToggle: false,
        templates: templates,
        userDefaultSettings: userDefaultSettings,
        showTrendLineAlwaysToggle: options.showTrendLineAlwaysToggle,
        trendLineColor: options.trendLineColor,
        trendLineOpacity: options.trendLineOpacity,
        trendLineWidth: options.trendLineWidth,
        trendLineStyle: options.trendLineStyle
    }
    return infChart.drawingUtils.common.getFibSettings(properties);
};

infChart.fibVerRetracementsDrawing.prototype.isEndLevelEnabled = function () {
    var self = this,
        ann = self.annotation,
        options = ann.options,
        fibLevels = options.fibLevels;

    fibLevels = infChart.drawingUtils.common.sortFibLevelsByValue(fibLevels);
    var isEndEnabled = false;
    fibLevels.forEach(function (fibLevel) {
        if (fibLevel.enable && fibLevel.value === 100) {
            isEndEnabled = true;
        }
    });
    return isEndEnabled;
};

infChart.fibVerRetracementsDrawing.prototype.isStartLevelEnabled = function () {
    var self = this,
        ann = self.annotation,
        options = ann.options,
        fibLevels = options.fibLevels;

    fibLevels = infChart.drawingUtils.common.sortFibLevelsByValue(fibLevels);
    var isStartEnabled = false;
    fibLevels.forEach(function (fibLevel) {
        if (fibLevel.enable && fibLevel.value === 0) {
            isStartEnabled = true;
        }
    });
    return isStartEnabled;
};

infChart.fibVerRetracementsDrawing.prototype.scale = function (isCalculateNewValueForScale) {
    var self = this,
        ann = self.annotation,
        chart = ann.chart,
        options = ann.options,
        line = ann.shape.d.split(' '),
        xAxis = chart.xAxis[options.xAxis],
        yAxis = chart.yAxis[options.yAxis];

    if (isCalculateNewValueForScale) {
        nearestDataForXValue = infChart.math.findNearestDataPoint(chart, options.xValue, undefined, options.useAllXDataToFindNearestPoint, options.useFutureDate);
        nearestDataForXValueEnd = infChart.math.findNearestDataPoint(chart, options.xValueEnd, undefined, options.useAllXDataToFindNearestPoint, options.useFutureDate);
        options.nearestXValue = nearestDataForXValue.xData;
        options.nearestXValueEnd = nearestDataForXValueEnd.xData;
    }

    var newX = xAxis.toPixels(options.nearestXValue) - xAxis.toPixels(options.xValue),
        xEnd = xAxis.toPixels(options.nearestXValueEnd) - xAxis.toPixels(options.xValue),
        yEnd = yAxis.toPixels(options.yValueEnd) - yAxis.toPixels(options.yValue);

    line[1] = (!isNaN(newX) && newX) || 0;
    line[4] = (!isNaN(xEnd) && xEnd) || 0;
    line[5] = (!isNaN(yEnd) && yEnd) || 0;

    if (isCalculateNewValueForScale) {
        ann.update({
            xValueDataIndex: nearestDataForXValue.dataIndex,
            xValueEndDataIndex: nearestDataForXValueEnd.dataIndex,
            shape: {
                params: {
                    d: line,
                },
            },
        });
        ann.options.distance = nearestDataForXValueEnd.dataIndex- nearestDataForXValue.dataIndex;
    } else {
        ann.update({
            shape: {
                params: {
                    d: line,
                },
            },
        });
    }

    if (ann.selectionMarker && ann.selectionMarker.length > 1) {
        ann.selectionMarker[1].attr({
            x: line[4],
            y: line[5]
        });
    }

    self.updateAdditionalDrawings(false);
    self.setDragSupporters();
};

infChart.fibVerRetracementsDrawing.prototype.select = function (event) {
    var self = this,
        ann = self.annotation,
        options = ann.options;

    if (event && event.target) {
        var drawingtype = event.target.getAttribute('type');
        if (drawingtype) {
            if (drawingtype == "mainDrawing") {
                options.selectedDrawing = "mainDrawing";
            }
            if (drawingtype == "additionalDrawing") {
                options.selectedDrawing = "additionalDrawing";
            }
        } else if (event.target.parentNode.getAttribute('type')) {
            //this used when clicked on levels of start, end, trend
            var drawingtype = event.target.parentNode.getAttribute('type');
            if (drawingtype == "additionalDrawing") {
                options.selectedDrawing = "additionalDrawing";
            }
        } else {
            //this used when clicked on fibbonacci levels
            if (event.target.parentNode.parentNode.getAttribute('type')) {
                var drawingtype = event.target.parentNode.parentNode.getAttribute('type');
                if (drawingtype == "additionalDrawing") {
                    options.selectedDrawing = "additionalDrawing";
                }
            }
        }
    }
};

infChart.fibVerRetracementsDrawing.prototype.selectAndBindResize = function () {
    var ann = this.annotation,
        options = ann.options,
        chart = ann.chart,
        xAxis = chart.xAxis[options.xAxis],
        pathDefinition, width, height;

    ann.events.deselect.call(ann);
    ann.shape.show();
    ann.selectionMarker = [];
    pathDefinition = ann.shape.d.split(' ');
    width = parseFloat(pathDefinition[4]);
    height = parseFloat(pathDefinition[5]);
    newX = xAxis.toPixels(options.nearestXValue) - xAxis.toPixels(options.xValue);

    if (!isNaN(width) && !isNaN(height)) {
        infChart.drawingUtils.common.addAndBindSelectionMarker.call(this, ann, newX, 0, this.stepFunction, this.stop, true);
        infChart.drawingUtils.common.addAndBindSelectionMarker.call(this, ann, width, height, this.stepFunction, this.stop, false);
    }
};

infChart.fibVerRetracementsDrawing.prototype.setDragSupporters = function () {
    var self = this,
        ann = self.annotation,
        chart = ann.chart,
        options = ann.options,
        line = ann.shape.d.split(' ');
    infChart.drawingUtils.common.removeDragSupporters.call(self, self.dragSupporters);
    if (ann.shape.visibility !== "hidden") {
        infChart.drawingUtils.common.addDragSupporters.call(self, ann, chart, line, self.dragSupporters, undefined, self.mainDrawingDragSupporterStyles);
    }
    if (options.isShort) {
        infChart.drawingUtils.common.addDragSupporters.call(self, ann, chart, self.additionalDrawings.jointLine.d.split(' '), self.dragSupporters, undefined, self.additionalDrawingDragSupporterStyles);
    }
    self.highlightEachLine();
};

infChart.fibVerRetracementsDrawing.prototype.step = function (e, isStartPoint) {
    var self = this,
        ann = self.annotation,
        chart = ann.chart,
        options = ann.options,
        xAxis = chart.xAxis[options.xAxis],
        yAxis = chart.yAxis[options.yAxis],
        points = infChart.drawingUtils.common.calculateInitialPoints(e, ann, isStartPoint, 0, 0),
        xValueEnd = xAxis.toValue(xAxis.toPixels(options.xValue) + points.dx),
        yValueEnd = yAxis.toValue(yAxis.toPixels(options.yValue) + points.dy),
        nearestDataForXValue = infChart.math.findNearestDataPoint(chart, options.xValue, undefined, options.useAllXDataToFindNearestPoint, options.useFutureDate),
        nearestDataForXValueEnd = infChart.math.findNearestDataPoint(chart, xValueEnd, undefined, options.useAllXDataToFindNearestPoint, options.useFutureDate),
        nearestXValue = nearestDataForXValue.xData,
        nearestXValueEnd = nearestDataForXValueEnd.xData,
        newX = xAxis.toPixels(nearestXValue) - xAxis.toPixels(ann.options.xValue),
        newXEnd = xAxis.toPixels(nearestXValueEnd) - xAxis.toPixels(ann.options.xValue);

    y = points.dy;
    var line = ["M", newX, 0, 'L', newXEnd, y];

    ann.update({
        xValueDataIndex: nearestDataForXValue.dataIndex,
        xValueEndDataIndex: nearestDataForXValueEnd.dataIndex,
        nearestXValue: nearestXValue,
        nearestXValueEnd: nearestXValueEnd,
        shape: {
            params: {
                d: line
            }
        }
    });

    ann.options.distance = options.xValueEndDataIndex - options.xValueDataIndex;
    self.updateAdditionalDrawings(false, true);
    return line;
};

infChart.fibVerRetracementsDrawing.prototype.stop = function (e, isStartPoint) {
    var self = this,
        ann = self.annotation,
        options = ann.options,
        chart = ann.chart,
        line = self.stepFunction(e, isStartPoint),
        xAxis = chart.xAxis[options.xAxis],
        yAxis = chart.yAxis[options.yAxis],
        x = xAxis.toValue(line[4] + xAxis.toPixels(options.xValue)),
        y = yAxis.toValue(line[5] + yAxis.toPixels(options.yValue));

    ann.update({
        xValueEnd: x,
        yValueEnd: y,
        nearestXValue: options.nearestXValue,
        nearestXValueEnd: options.nearestXValueEnd,
        shape: {
            params: {
                d: line
            }
        }
    });

    if (ann.selectionMarker && ann.selectionMarker.length > 1) {
        ann.selectionMarker[1].attr({
            x: line[4],
            y: line[5]
        });
    }

    infChart.drawingUtils.common.saveBaseYValues.call(self, options.yValue, y);

    self.setDragSupporters();
    infChart.drawingUtils.common.fixSelectionMarker.call(self, ann);
    infChart.drawingUtils.common.onPropertyChange.call(self);
};

infChart.fibVerRetracementsDrawing.prototype.translate = function (event) {
    var self = this,
        ann = self.annotation,
        options = ann.options,
        chart = ann.chart,
        xAxis = chart.xAxis[options.xAxis],
        yAxis = chart.yAxis[options.yAxis];

    if (options.selectedDrawing == "mainDrawing") {
        this.updateAdditionalDrawings(false, true);
        this.scale();
    }
    if (options.selectedDrawing == "additionalDrawing") {
        options.chartY = yAxis.toValue(event.chartY);

        ann.update({
            yValue: options.yValueStore,
            yValueEnd: options.yValueEndStore
        });

        this.updateAdditionalDrawings(false, false);
    }
};

infChart.fibVerRetracementsDrawing.prototype.translateEnd = function () {
    var self = this,
        ann = self.annotation,
        options = ann.options;
    options.selectedDrawing = undefined;
    self.scale();
    infChart.drawingUtils.common.saveBaseYValues.call(self, options.yValue, options.yValueEnd);
    infChart.drawingUtils.common.onPropertyChange.call(this);
};

infChart.fibVerRetracementsDrawing.prototype.updateAdditionalDrawings = function (isScale, isMain) {
    var self = this,
        ann = self.annotation,
        chart = ann.chart,
        options = ann.options,
        dx = options.distance,
        adjustment = options.adjustment,
        yAxis = chart.yAxis[options.yAxis],
        xAxis = chart.xAxis[options.xAxis],
        fibLevels = infChart.drawingUtils.common.sortFibLevelsByValue(options.fibLevels);

    var fibIndex = 0, fibLevelLength = fibLevels.length, lastX = 0, lastVal = 0, isStartEnabled = false, isEndEnabled = false;
    for (fibIndex; fibIndex < fibLevelLength; fibIndex++) {
        var fibLevel = fibLevels[fibIndex];
        var x = self.updateFibLevel(fibLevel, fibIndex, fibLevels, dx, isScale, false, isMain);
        if (fibLevel.enable) {
            if (fibLevel.value === 0) {
                isStartEnabled = true;
            }
            if (fibLevel.value === 100) {
                isEndEnabled = true;
            }
            lastVal = fibLevel.value;
            if ((dx < 0 && lastX > x) || (dx > 0 && lastX < x)) {
                lastX = x;
            }
        }
    }

    if (options.isShort) {
        var startDrawingLabel = self.additionalDrawings.labels['start'];
        var endDrawingLabel = self.additionalDrawings.labels['end'];
        var startDrawingLine = self.additionalDrawings.lines['start'];
        var endDrawingLine = self.additionalDrawings.lines['end'];
        newX = xAxis.toPixels(options.nearestXValue) - xAxis.toPixels(options.xValue);
        if (!isScale) {
            var startValue = self.formatDate(options.nearestXValue, self.stockChart.interval);
            startDrawingLabel.textSetter(startValue);
            var endValue = self.formatDate(this.calculateFibLevelCandleValue(dx, 100), self.stockChart.interval);
            endDrawingLabel.textSetter(endValue);
        }

        var lineStartPosition = this.calculateLineStartPosition(fibLevel, isMain);
        var lineEndPosition = lineStartPosition + 10;

        startDrawingLabel.attr({
            x: newX - startDrawingLabel.width / 2,
            y: lineEndPosition + 5
        });
        startDrawingLine.attr({
            d: ["M", newX, lineStartPosition, 'L', newX, lineEndPosition]
        });
        var endX = adjustment === 0 ? parseFloat(ann.shape.d.split(' ')[4]) : adjustment;
        endDrawingLabel.attr({
            x: endX - endDrawingLabel.width / 2,
            y: lineEndPosition + 5
        });
        endDrawingLine.attr({
            d: ["M", endX, lineStartPosition, 'L', endX, lineEndPosition]
        });

        if (adjustment === 0 && lastVal < 100) {
            lastX = ann.shape.d.split(' ')[4];
        }
        self.additionalDrawings.jointLine.attr({
            d: ['M', newX, lineStartPosition, 'L', lastX, lineStartPosition]
        });
    }
};

infChart.fibVerRetracementsDrawing.prototype.updateFibLevel = function (fibLevel, fibIndex, fibLevels, dx, isScale, isValueUpdate, isMain) {
    var self = this,
        ann = self.annotation,
        chart = ann.chart,
        correctionFactor = infChart.drawingUtils.common.correctionFactor,
        options = ann.options,
        xAxis = chart.xAxis[options.xAxis];

    var x = xAxis.toPixels(this.calculateFibLevelCandleValue(dx, fibLevel.value)) - xAxis.toPixels(options.xValue);
    var previousLineStart = self.calculateLineStartPosition(fibLevel, isMain);
    var y1, y2, lineStartPosition = previousLineStart,
        lineEndPosition;
    if (options.isShort) {
        lineEndPosition = lineStartPosition + 10;
        y1 = lineStartPosition;
        y2 = lineEndPosition;
    } else {
        lineEndPosition = chart.plotHeight + lineStartPosition;
        y1 = lineStartPosition - chart.plotHeight * correctionFactor;
        y2 = lineEndPosition + chart.plotHeight * correctionFactor;
    }

    self.additionalDrawings.lines[fibLevel.id].attr({
        d: ["M", x, y1, 'L', x, y2]
    });

    var drawingLabel = self.additionalDrawings.labels[fibLevel.id];

    if (options.isShort) {
        if (!isScale) {
            drawingLabel.textSetter(self.getLineLabelText(x, fibLevel));
        }
    } else {
        if (isValueUpdate) {
            self.updateFill(fibLevel, fibIndex, fibLevels);
        }
        var isFirstLevel = true;
        fibIndex--;
        for (fibIndex; fibIndex >= 0; fibIndex--) {
            if (fibLevels[fibIndex].enable) {
                isFirstLevel = false;
                break;
            }
        }
        if (!isFirstLevel) {
            self.updateFill(fibLevels[fibIndex], fibIndex, fibLevels);
        }
    }

    drawingLabel.attr({
        x: options.isShort ? x - drawingLabel.width / 2 : x + 5,
        y: options.isShort ? lineEndPosition + 5 : lineEndPosition - 25
    });
    return x;
};

infChart.fibVerRetracementsDrawing.prototype.updateFill = function (fibLevel, fibIndex, fibLevels) {
    var self = this;
    var currentLine = self.additionalDrawings.lines[fibLevel.id], nextLine;
    var currentLineP = currentLine.d.split(' ');
    for (var i = fibIndex + 1; i < fibLevels.length; i++) {
        if (fibLevels[i].enable) {
            nextLine = self.additionalDrawings.lines[fibLevels[i].id];
            break;
        }
    }
    if (nextLine) {
        var nextLineP = nextLine.d.split(' ');
        self.additionalDrawings.fill[fibLevel.id].attr({
            d: ['M', currentLineP[1], currentLineP[2], 'L', currentLineP[4], currentLineP[5], 'L', nextLineP[4], nextLineP[5], 'L', nextLineP[1], nextLineP[2], 'L', currentLineP[1], currentLineP[2]]
        });
    }
};

infChart.fibVerRetracementsDrawing.prototype.updateJointLine = function (x, fibIndex, fibLevels) {
    var self = this, options = self.annotation.options;
    if (options.isShort) {
        var maxFibLevel, isStartEnabled = false, isEndEnabled = false;
        for (var i = 0; i < fibLevels.length; i++) {
            if (fibLevels[i].enable) {
                if (typeof maxFibLevel === 'undefined') {
                    maxFibLevel = fibLevels[i];
                }
                if (fibLevels[i].value === 0) {
                    isStartEnabled = true;
                }
                if (fibLevels[i].value > maxFibLevel.value) {
                    if (fibLevels[i].value === 100) {
                        isEndEnabled = true;
                    }
                    maxFibLevel = fibLevels[i];
                }
            }
        }

        var jointLineLastX;
        if (typeof maxFibLevel === 'undefined' || (maxFibLevel.value < 100 && !options.trendXValue)) {
            jointLineLastX = self.annotation.shape.d.split(' ')[4];
        } else {
            jointLineLastX = self.additionalDrawings.lines[maxFibLevel.id].d.split(' ')[4];
        }
        var jointLine = self.additionalDrawings.jointLine, jointLineArray = jointLine.d.split(' ');
        jointLine.attr({
            d: ['M', jointLineArray[1], jointLineArray[2], 'L', jointLineLastX, jointLineArray[5]]
        });

        if (!options.trendXValue) {
            if (!isStartEnabled) {
                self.additionalDrawings.labels['start'].show();
                self.additionalDrawings.lines['start'].show();
            } else {
                self.additionalDrawings.labels['start'].hide();
                self.additionalDrawings.lines['start'].hide();
            }

            if (!isEndEnabled) {
                self.additionalDrawings.labels['end'].show();
                self.additionalDrawings.lines['end'].show();
            } else {
                self.additionalDrawings.labels['end'].hide();
                self.additionalDrawings.lines['end'].hide();
            }
        }
    }
};

infChart.fibVerRetracementsDrawing.prototype.updateLineLabelText = function (x, fibLevel) {
    var self = this;
    var options = self.annotation.options;
    var chart = self.annotation.chart;
    var xAxis = chart.xAxis[options.xAxis];
    var labelValue;
    var fibLevelValue = infChart.drawingUtils.common.formatValue(fibLevel.value / 100, 3);
    if (options.isShort) {
        var time = xAxis.toValue(x + xAxis.toPixels(options.xValue));
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
        switch (self.stockChart.interval) {
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
        // time = infChart.math.findNearestXDataPoint(chart, time);
        labelValue = _replaceMonth(infChart.util.formatDate(time, format)) + '<br/>' + fibLevelValue;
    } else {
        labelValue = fibLevelValue;
    }
    return labelValue;
};

infChart.fibVerRetracementsDrawing.prototype.updateSettings = function (properties) {
    var updateProperties = {
        fillColor: properties.fillColor,
        fillOpacity: properties.opacity,
        lineColor: properties.lineColor,
        lineWidth: properties.lineWidth,
        fontSize: properties.fontSize,
        fontColor: properties.fontColor,
        isSingleColor: properties.isSingleColor,
        fibLevels: properties.fibLevels,
        isFibModeEnabled: properties.isShort,
        isTrendLineAlwaysEnabled: properties.isTrendLineAlways,
        trendLineColor: properties.trendLineColor,
        trendLineOpacity: properties.trendLineOpacity,
        trendLineWidth: properties.trendLineWidth,
        trendLineStyle: properties.trendLineStyle
    }
    infChart.structureManager.drawingTools.updateFibSettings(this.settingsPopup, updateProperties);
};

infChart.fibVerRetracementsDrawing.prototype.calculateFibLevelCandleValue = function (dx, fibValue) {
    var self = this,
        ann = self.annotation,
        chart = ann.chart,
        options = ann.options,
        xAxis = chart.xAxis[options.xAxis],
        candleValue,
        calculatedCandleIndex,
        seriesXData = chart.series[0].xData,
        distanceMultiplier = parseFloat(fibValue) / 100;

    calculatedCandleIndex = Math.round(dx * distanceMultiplier) + options.xValueDataIndex;
    calculatedCandleIndex = calculatedCandleIndex >= 0 ? calculatedCandleIndex : 0;

    if (seriesXData.length > calculatedCandleIndex) {
        candleValue = seriesXData[calculatedCandleIndex];
    } else {
        candleValue = Math.round(infChart.math.getFutureXValueForGivenIndex(chart, calculatedCandleIndex));
    }

    return candleValue;
}

infChart.fibVerRetracementsDrawing.prototype.specificCursorChange = function(url){
    var self = this,
        ann = self.annotation,
        options = ann.options,
        additionalDrawings = self.additionalDrawings;

        $.each(additionalDrawings.labels, function (key, value) {
                if(url){
                    value.css({'cursor': 'url("' + url + '"), default'});
                } else {
                    infChart.util.setCursor(value, 'move');
                    value.css({'cursor': 'move'});
                }
        });
};

infChart.fibVerRetracementsDrawing.prototype.highlightEachLine = function(){
    let self = this,
        ann = self.annotation,
        options = ann.options,
        chart = ann.chart,
        selectedLevel
        dragSupporters = self.dragSupporters,
        container = chart.container,
        additionalDrawings = self.additionalDrawings,
        fibLabels = additionalDrawings.labels,
        fibLines = additionalDrawings.lines;

        $.each(fibLabels, function (key, fibLabel) {
            $(fibLabel.element).mouseenter( function (event) {   
                selectedLevel = event.target.getAttribute('level');
                if (!selectedLevel && event.target.parentElement) {
                    if (event.target.parentElement.getAttribute('level')) {
                        selectedLevel = event.target.parentElement.getAttribute('level');
                    } else if (event.target.parentElement.parentElement && event.target.parentElement.parentElement.getAttribute('level')) {
                        selectedLevel = event.target.parentElement.parentElement.getAttribute('level');
                    }
                }
                if(selectedLevel){                
                    var selectedLine = fibLines[selectedLevel];
                    var selectedLabel = fibLabels[selectedLevel];
                    $(container).find("path[class*='line-hover']").attr({class:''});
                    $(container).find("g[class*='label-hover']").attr({class:'highcharts-label'});
                    if(selectedLine){
                        selectedLine.addClass('line-hover');
                    }
                    if(selectedLabel){
                        selectedLabel.addClass('label-hover');
                    }
                }
                event.stopPropagation();
            });

            $(fibLabel.element).mouseleave( function (event) {   
                selectedLevel = event.target.getAttribute('level');
                if (!selectedLevel && event.target.parentElement) {
                    if (event.target.parentElement.getAttribute('level')) {
                        selectedLevel = event.target.parentElement.getAttribute('level');
                    } else if (event.target.parentElement.parentElement && event.target.parentElement.parentElement.getAttribute('level')) {
                        selectedLevel = event.target.parentElement.parentElement.getAttribute('level');
                    }
                }
                if(selectedLevel){  
                    var selectedLine = fibLines[selectedLevel];
                    var selectedLabel = fibLabels[selectedLevel];
                    if(selectedLine){
                        selectedLine.removeClass('line-hover');
                    }
                    if(selectedLabel){
                        selectedLabel.removeClass('label-hover');
                    }
                }
                event.stopPropagation();
            });
        })
};

infChart.fibVerRetracementsDrawing.prototype.onTrendLineColorChange = function (rgb, color, opacity, isPropertyChange){
    var self = this;
    self.annotation.update({
        shape: {
            params: {
                stroke: color,
                opacity: opacity
            }
        }
    });

    self.annotation.options.trendLineColor = color;
    self.annotation.options.trendLineOpacity = opacity;

    isPropertyChange && self.onPropertyChange();
    if (this.settingsPopup) {
        this.settingsPopup.data("infUndoRedo", false);
    }
    infChart.drawingUtils.common.saveDrawingProperties.call(self);
};

infChart.fibVerRetracementsDrawing.prototype.onTrendLineWidthChange =  function (strokeWidth, isPropertyChange) {
    var self = this;
    var strokeDashArray = infChart.drawingUtils.common.settings.getStrokeDashArray.call(self, self.annotation.options.trendLineStyle, strokeWidth);
    self.annotation.update({
        shape: {
            params: {
                'stroke-width': strokeWidth,
                'stroke-dasharray': strokeDashArray
            }
        }
    });

    self.annotation.options.trendLineWidth = strokeWidth;

    isPropertyChange && self.onPropertyChange();
    if (this.settingsPopup) {
        this.settingsPopup.data("infUndoRedo", false);
    }
    infChart.drawingUtils.common.saveDrawingProperties.call(self);
};


infChart.fibVerRetracementsDrawing.prototype.onTrendLineStyleChange = function (dashStyle, isPropertyChange) {
    var self = this;
    var strokeDashArray = infChart.drawingUtils.common.settings.getStrokeDashArray.call(self, dashStyle, self.annotation.options.trendLineWidth);

    self.annotation.update({
        shape: {
            params: {
                dashstyle: dashStyle,
                'stroke-dasharray': strokeDashArray
            }
        }
    });

    self.annotation.options.trendLineStyle = dashStyle;

    isPropertyChange && self.onPropertyChange();
    if (this.settingsPopup) {
        this.settingsPopup.data("infUndoRedo", false);
    }
    infChart.drawingUtils.common.saveDrawingProperties.call(self);
};

infChart.fibVerRetracementsDrawing.prototype.onTrendLineToggleShow = function(checked, isPropertyChange){
    var self = this,
        ann = self.annotation,
        options = ann.options;

    options.isTrendLineAlways = checked;
    if(checked){
        if(ann){
            ann.shape.show();
            self.setDragSupporters();
        }
    }

    isPropertyChange && self.onPropertyChange();
    if (self.settingsPopup) {
        self.settingsPopup.data("infUndoRedo", false);
    }
};