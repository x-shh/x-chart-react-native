window.infChart = window.infChart || {};

infChart.fibArcsDrawing = function () {
    infChart.drawingObject.apply(this, arguments);
    this.fibLevels = [
        {
            id: 'level_0',
            value: 38.2,
            enable: true,
            drawingPosX: -35,
            drawingPosY: 7,
            fillColor: '#4b0832',
            lineColor: '#959595',
            lineWidth: 1,
            fontColor: '#959595',
            fontSize: '10',
            fontWeight : 'normal'
        },
        {
            id: 'level_1',
            value: 50,
            enable: true,
            drawingPosX: -35,
            drawingPosY: 7,
            fillColor: '#f075c3',
            lineColor: '#959595',
            lineWidth: 1,
            fontColor: '#959595',
            fontSize: '10',
            fontWeight : 'normal'
        },
        {
            id: 'level_2',
            value: 61.8,
            enable: true,
            drawingPosX: -35,
            drawingPosY: 7,
            fillColor: '#f6aada',
            lineColor: '#959595',
            lineWidth: 1,
            fontColor: '#959595',
            fontSize: '10',
            fontWeight : 'normal'
        }
    ];
};

infChart.fibArcsDrawing.prototype = Object.create(infChart.drawingObject.prototype);

infChart.fibArcsDrawing.prototype.additionalDrawingsFunction = function () {
    var self = this,
        ann = self.annotation,
        options = ann.options,
        chart = ann.chart,
        fibLevels = options.fibLevels ? options.fibLevels : this.fibLevels,
        additionalDrawingsArr = self.additionalDrawings,
        fibonacciDrawingsArr = self.fibonacciDrawings,
        theme = infChart.drawingUtils.common.getTheme.call(this),
        drawingFillAttr,
        drawingAttr,
        labelAttr,
        baseFillOpacity = (theme.fibArcs && typeof theme.fibArcs.fillOpacity !== "undefined") ? theme.fibArcs.fillOpacity : infChart.drawingUtils.common.baseFillOpacity,
        baseFontColor = (theme.fibArcs && typeof theme.fibArcs.fontColor !== "undefined") ? theme.fibArcs.fontColor : infChart.drawingUtils.common.baseFontColor,
        baseFontSize = (theme.fibArcs && typeof theme.fibArcs.fontSize !== "undefined") ? theme.fibArcs.fontSize : infChart.drawingUtils.common.baseFontSize,
        baseFontWeight = (theme.fibArcs && typeof theme.fibArcs.fontWeight !== "undefined") ? theme.fibArcs.fontWeight : infChart.drawingUtils.common.baseFontWeight,

        labelStyles = {
            'color': baseFontColor,
            fontSize: baseFontSize,
        };

    additionalDrawingsArr.lines = {};
    fibonacciDrawingsArr.lines = {};
    fibonacciDrawingsArr.fill = {};

    var hiddenLevels = [];

    // add fill objects first to avoid overlapping lines with and texts with them
    fibLevels = infChart.drawingUtils.common.sortFibLevelsByValue(fibLevels);
    fibLevels.forEach(function (fibLevel) {

        var themeFillColor = theme.fibArcs && theme.fibArcs.fibLevelFillColors && theme.fibArcs.fibLevelFillColors[fibLevel.id];
        if (!fibLevel.enable) {
            hiddenLevels.push(fibLevel.id);
        }

        drawingFillAttr = {
            'stroke-width': 0,
            fill: options.isSingleColor && options.fillColor ? options.fillColor : fibLevel && fibLevel.fillColor ? fibLevel.fillColor : themeFillColor,
            'fill-opacity': options.isSingleColor && options.fillOpacity ? options.fillOpacity : fibLevel && fibLevel.fillOpacity ? fibLevel.fillOpacity : baseFillOpacity,
            stroke: ann.options.shape.params.stroke,
            'z-index': 2,
            cursor: 'default',
            'level': fibLevel.id,
            'pointer-events':'none'
        };
        drawingAttr = {
            'stroke-width': options.isSingleColor && options.lineWidth ? options.lineWidth : fibLevel && fibLevel.lineWidth ? fibLevel.lineWidth : ann.options.shape.params['stroke-width'],
            fill: ann.options.shape.params.fill,
            stroke: options.isSingleColor && options.lineColor ? options.lineColor : fibLevel && fibLevel.lineColor ? fibLevel.lineColor : ann.options.shape.params.stroke,
            'z-index': 2,
            cursor: 'move',
            'level': fibLevel.id
        };

        var fontColor = options.isSingleColor && options.fontColor ? options.fontColor : fibLevel && fibLevel.fontColor ? fibLevel.fontColor : baseFontColor;
        var fontSize = options.isSingleColor && options.fontSize ? options.fontSize :fibLevel && fibLevel.fontSize ? fibLevel.fontSize : baseFontSize;
        var fontWeight = options.isSingleColor && options.fontWeight ? options.fontWeight : fibLevel && fibLevel.fontWeight ? fibLevel.fontWeight : baseFontWeight;

        labelStyles = {
            'color': fontColor,
            fontSize: fontSize + 'px',
            'font-weight': fontWeight
        };
        labelAttr = {
            'level': fibLevel.id,
            'font-color': fontColor,
            'font-size': fontSize,
            'font-weight': fontWeight
        };
        fibonacciDrawingsArr.fill[fibLevel.id] = chart.renderer.path(['M', 0, 0, 'L', 0, 0, 'L', 0, 0, 'L', 0, 0]).attr(drawingFillAttr).add(ann.group);
        additionalDrawingsArr.lines[fibLevel.id] = chart.renderer.arc(0, 0, 0, 0, 0, Math.PI).attr(drawingAttr).add(ann.group);
        fibonacciDrawingsArr.lines[fibLevel.id] = chart.renderer.label(infChart.drawingUtils.common.formatValue(fibLevel.value, 1), fibLevel.drawingPosX, fibLevel.drawingPosY).css(labelStyles).attr(labelAttr).add(ann.group);
    });

    hiddenLevels.forEach(function (id) {
        self.onFibArcsLevelChange(id, false, false);
    });
    ann.selectionMarker = [];
    infChart.drawingUtils.common.addSelectionMarker.call(this, ann, 0, 0);
};

infChart.fibArcsDrawing.prototype.bindSettingsEvents = function () {
    var self = this;
    var onFibArcsLevelChange = function (checked, value) {
        var isPropertyChange = true;
        if (self.settingsPopup) {
            isPropertyChange = self.isSettingsPropertyChange();
        }
        self.onFibArcsLevelChange.call(self, value, checked, isPropertyChange);
    };

    return infChart.drawingUtils.common.bindFibSettingsEvents.call(this, infChart.drawingUtils.common.baseBorderColor, infChart.drawingUtils.common.baseLineWidth, onFibArcsLevelChange);
};

infChart.fibArcsDrawing.prototype.getConfig = function () {
    var self = this,
        annotation = self.annotation,
        options = annotation.options,
        fibLevels = options.fibLevels ? options.fibLevels : self.fibLevels;
    fibLevels = infChart.drawingUtils.common.sortFibLevelsByValue(fibLevels);
    return {
        shape: 'fibArcs',
        fibLevels: fibLevels,
        borderColor: annotation.options.lineColor,
        fillColor: annotation.options.fillColor,
        fillOpacity: annotation.options.fillOpacity,
        strokeWidth: annotation.options.lineWidth,
        fontColor: annotation.options.fontColor,
        fontSize: annotation.options.fontSize,
        fontWeight: annotation.options.fontWeight,
        xValue: annotation.options.xValue,
        yValue: annotation.options.yValue,
        xValueEnd: annotation.options.xValueEnd,
        yValueEnd: annotation.options.yValueEnd,
        isSingleColor: annotation.options.isSingleColor,
        isLocked : annotation.options.isLocked

    };
};

infChart.fibArcsDrawing.prototype.getContextMenuOptions = function (chartId, drawingId, options, event) {
    var self = this;
    var level = event.target.getAttribute('level');
    var contextMenu = {};

    if (!self.isVisibleLastLevel()) {
        var eraseThis = {
            icon: options.erase.icon,
            displayText: options.erase.displayText,
            action: function () {
                if (level) {
                    self.onFibArcsLevelChange.call(self, level, false, true, true);
                }
            }
        }
        contextMenu["eraseThis"] = eraseThis;
    }

    if (level) {
        contextMenu = Object.assign(contextMenu, infChart.drawingUtils.common.getContextMenuOptions(chartId, drawingId, options));
        return infChart.drawingUtils.common.reorderContextMenu(contextMenu);
    } else {
        return infChart.drawingUtils.common.getContextMenuOptions(chartId, drawingId, options);
    }
};

infChart.fibArcsDrawing.prototype.getOptions = function (properties) {
    var options = {
        xValue: properties.xValue,
        yValue: properties.yValue,
        shape: {
            params: {
                d: ['M', 0, 0, 'L', 0, 0]
            }
        }
    };
    var theme = infChart.drawingUtils.common.getTheme.call(this);
    var baseFillColor = (theme.fibArcs && theme.fibArcs.singleFillColor) ? theme.fibArcs.singleFillColor : (theme.fibonacci && theme.fibonacci.singleFillColor) ? theme.fibonacci.singleFillColor : infChart.drawingUtils.common.baseFillColor;
    var baseFillOpacity = (theme.fibArcs && typeof theme.fibArcs.fillOpacity !== "undefined") ? theme.fibArcs.fillOpacity : (theme.fibonacci && typeof theme.fibonacci.fillOpacity !== "undefined") ? theme.fibonacci.fillOpacity : infChart.drawingUtils.common.baseFillOpacity;
    var baseBorderColor = (theme.fibArcs && theme.fibArcs.borderColor) ? theme.fibArcs.borderColor : (theme.fibonacci && theme.fibonacci.borderColor) ? theme.fibonacci.borderColor : infChart.drawingUtils.common.baseBorderColor;
    var baseLineWidth = (theme.fibArcs && typeof theme.fibArcs.lineWidth !== "undefined") ? theme.fibArcs.lineWidth : (theme.fibonacci && theme.fibonacci.lineWidth) ? theme.fibonacci.lineWidth : infChart.drawingUtils.common.baseLineWidth;
    var baseFontColor = (theme.fibArcs && theme.fibArcs.fontColor) ? theme.fibArcs.fontColor: (theme.fibonacci && theme.fibonacci.fontColor) ? theme.fibonacci.fontColor : infChart.drawingUtils.common.baseFontColor;
    var baseFontSize = (theme.fibArcs && theme.fibArcs.fontSize) ? theme.fibArcs.fontSize: (theme.fibonacci && theme.fibonacci.fontSize) ? theme.fibonacci.fontSize : infChart.drawingUtils.common.baseFontSize;
    var baseFontWeight = (theme.fibArcs && theme.fibArcs.fontWeight) ? theme.fibArcs.fontWeight: (theme.fibonacci && theme.fibonacci.fontWeight) ? theme.fibonacci.fontWeight : infChart.drawingUtils.common.fontWeight;

    options.fillColor = properties.fillColor ? properties.fillColor : baseFillColor;
    options.fillOpacity = properties.fillOpacity ? properties.fillOpacity : baseFillOpacity;
    options.lineColor = properties.borderColor ? properties.borderColor : baseBorderColor;
    options.lineWidth = properties.strokeWidth ? properties.strokeWidth : baseLineWidth;
    options.fontColor = properties.fontColor ? properties.fontColor : baseFontColor;
    options.fontSize = properties.fontSize ? properties.fontSize : baseFontSize;
    options.fontWeight = properties.fontWeight ? properties.fontWeight : baseFontWeight;

    options.shape.params.fill = options.fillColor;
    options.shape.params['fill-opacity'] = options.fillOpacity;
    options.shape.params.stroke = options.lineColor;
    options.shape.params['stroke-width'] = options.lineWidth;
    options.shape.params['font-color'] = options.fontColor;
    options.shape.params['font-size'] = options.fontSize;

    if (properties.xValueEnd && properties.yValueEnd) {
        options.xValueEnd = properties.xValueEnd;
        options.yValueEnd = properties.yValueEnd;
    }
    if (properties.isSingleColor) {
        options.isSingleColor = properties.isSingleColor;
    }
    options.fibLevels = properties.fibLevels ? properties.fibLevels : this.fibLevels;
    options.fibLevels = infChart.drawingUtils.common.getFibLevelsWithOpacity(infChart.drawingUtils.common.sortFibLevelsByValue(options.fibLevels), baseFillOpacity);
    options.validateTranslationFn = this.validateTranslation;

    options = infChart.Drawing.prototype.getOptions(properties,options);

    return options;
};

infChart.fibArcsDrawing.prototype.validateTranslation = function (newXValue) {
    var self = this,
        ann = self.annotation,
        options = ann.options,
        chart = ann.chart,
        seriesData = chart.series[0].xData,
        dataMin = seriesData[0],
        xVal = options.xValue,
        xValEnd = options.xValueEnd,
        newXValueEnd = xValEnd - xVal + newXValue,
        totalPoints = infChart.drawingsManager.getTotalPoints(chart),
        dataMax = totalPoints[totalPoints.length - 1];

    return (newXValue >= dataMin && newXValue <= dataMax) && (newXValueEnd >= dataMin && newXValueEnd <= dataMax);
};

infChart.fibArcsDrawing.prototype.getQuickSettingsPopup = function () {
    var self = this;
    var options = self.annotation.options;
    var fillColor = options.fillColor;
    var fillOpacity = options.fillOpacity;
    var lineColor = options.lineColor;
    var fontColor = options.fontColor;
    var fontSize = options.fontSize;
    var fontWeight = options.fontWeight;
    return infChart.drawingUtils.common.getFibQuickSettings(fillColor, fillOpacity, lineColor, fontColor, fontSize);
};

infChart.fibArcsDrawing.prototype.getSettingsPopup = function () {
    var self = this;
    var options = self.annotation.options;
    var fibLevels = options.fibLevels ? options.fibLevels : self.fibLevels;

    var properties = {
        fillColor: options.fillColor,
        fillOpacity: options.fillOpacity,
        lineColor: options.lineColor,
        lineWidth: options.lineWidth,
        fontColor: options.fontColor,
        fontSize: options.fontSize,
        fontWeight: options.fontWeight,
        fibLevels: fibLevels,
        showFibModeToggle: false,
        showSnapToHighLowToggle: false,
        templates: self.getDrawingTemplates(),
        userDefaultSettings: self.getUserDefaultSettings()
    }
    return infChart.drawingUtils.common.getFibSettings(properties);
};

/**
 * Change the visibility of Fib arcs' levels
 * IMPORTANT :: this method is uesd in commands.wrappers to set undo/redo actions
 * @param {string} currentLevel level that is going to be changed
 * @param {boolean} checked visibility
 * @param  {boolean|undefined} isPropertyChange property change
 * @param {boolean} ignoreSettingsSave - this is to indicate to this change does not affect to subsequent drawing
 */
infChart.fibArcsDrawing.prototype.onFibArcsLevelChange = function (currentLevel, checked, isPropertyChange, ignoreSettingsSave) {
    var self = this, 
        ann = self.annotation,
        chart = ann.chart,
        line = ann.shape.d.split(' '),
        drawing = self.additionalDrawings.lines[currentLevel];
    var label = self.fibonacciDrawings.lines[currentLevel];
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

    fibLevels.some(function (fibLevel, index) {
        if (fibLevel.id == currentLevel) {
            currentOrderIdx = index;
            return true;
        }
    });
    fibLevels[currentOrderIdx].enable = checked;

    if (checked) {

        drawing.show();
        label.show();
        fill.show();

        for (i = currentOrderIdx + 1; i < fibLevels.length; i++) {
            lineD = self.additionalDrawings.lines[fibLevels[i].id];
            if (lineD && lineD.visibility != "hidden") {
                next = lineD;
                nextFill = self.fibonacciDrawings.fill[fibLevels[i].id];
                break;
            }
        }
        for (i = currentOrderIdx - 1; i >= 0; i--) {
            lineD = self.additionalDrawings.lines[fibLevels[i].id];
            if (lineD && lineD.visibility != "hidden") {
                prevLine = lineD;
                prevFill = self.fibonacciDrawings.fill[fibLevels[i].id];
                break;
            }
        }

        currentLinePoints = drawing.d.split(' ');

        if (prevLine && prevFill) {

            prvLinePoints = prevLine && prevLine.d.split(' ');
            fill.attr({
                d: ['M', prvLinePoints[1], prvLinePoints[2],
                    'A', prvLinePoints[4], prvLinePoints[5], prvLinePoints[6], prvLinePoints[7], prvLinePoints[8], prvLinePoints[9], prvLinePoints[10],
                    'L', currentLinePoints[9], currentLinePoints[10],
                    'A', currentLinePoints[4], currentLinePoints[5], 360 - currentLinePoints[6], currentLinePoints[7], currentLinePoints[8] ? 0 : 1, currentLinePoints[1], currentLinePoints[2],
                    'L', prvLinePoints[1], prvLinePoints[2]
                ]
            });
        } else if (fill) {
            fill.attr({
                d: ['M', currentLinePoints[9], currentLinePoints[10],
                    'A', currentLinePoints[4], currentLinePoints[5], 360 - currentLinePoints[6], currentLinePoints[7], currentLinePoints[8] ? 0 : 1, currentLinePoints[1], currentLinePoints[2],
                    'L', currentLinePoints[9], currentLinePoints[10]
                ]
            });
        }

        if (next && nextFill) {
            nextLinePoints = next.d.split(' ');
            nextFill.attr({
                d: ['M', currentLinePoints[1], currentLinePoints[2],
                    'A', currentLinePoints[4], currentLinePoints[5], currentLinePoints[6], currentLinePoints[7], currentLinePoints[8], currentLinePoints[9], currentLinePoints[10],
                    'L', nextLinePoints[9], nextLinePoints[10],
                    'A', nextLinePoints[4], nextLinePoints[5], 360 - nextLinePoints[6], nextLinePoints[7], nextLinePoints[8] ? 0 : 1, nextLinePoints[1], nextLinePoints[2],
                    'L', currentLinePoints[1], currentLinePoints[2]
                ]
            });
        }

    } else {
        drawing.hide();
        label.hide();
        fill.hide();

        for (i = currentOrderIdx + 1; i < fibLevels.length; i++) {
            lineD = self.additionalDrawings.lines[fibLevels[i].id];
            if (lineD && lineD.visibility != "hidden") {
                next = lineD;
                nextFill = self.fibonacciDrawings.fill[fibLevels[i].id];
                break;
            }
        }

        for (i = currentOrderIdx - 1; i >= 0; i--) {
            lineD = self.additionalDrawings.lines[fibLevels[i].id];
            if (lineD && lineD.visibility != "hidden") {
                prevLine = lineD;
                prevFill = self.fibonacciDrawings.fill[fibLevels[i].id];
                break;
            }
        }
        if (prevLine && next) {
            prvLinePoints = prevLine.d.split(' ');
            nextLinePoints = next.d.split(' ');
            nextFill.attr({
                d: ['M', nextLinePoints[1], nextLinePoints[2],
                    'A', nextLinePoints[4], nextLinePoints[5], nextLinePoints[6], nextLinePoints[7], nextLinePoints[8], nextLinePoints[9], nextLinePoints[10],
                    'L', prvLinePoints[9], prvLinePoints[10],
                    'A', prvLinePoints[4], prvLinePoints[5], 360 - prvLinePoints[6], prvLinePoints[7], prvLinePoints[8] ? 0 : 1, prvLinePoints[1], prvLinePoints[2],
                    'L', nextLinePoints[1], nextLinePoints[2]
                ]
            });
        } else if (next) {
            nextLinePoints = next.d.split(' ');
            nextFill.attr({
                d: ['M', nextLinePoints[9], nextLinePoints[10],
                    'A', nextLinePoints[4], nextLinePoints[5], 360 - nextLinePoints[6], nextLinePoints[7], nextLinePoints[8] ? 0 : 1, nextLinePoints[1], nextLinePoints[2],
                    'L', nextLinePoints[9], nextLinePoints[10]
                ]
            });
        }

    }

    infChart.drawingUtils.common.removeDragSupporters.call(self, self.dragSupporters);
    infChart.drawingUtils.common.addDragSupporters.call(self, ann, chart, ['M', 0, 0, 'L', line[4], line[5]], self.dragSupporters);
    $.each(self.additionalDrawings.lines, function (key, value) {
        if (value.visibility !== 'hidden') {
            var radius = value.r;
            var arcStart = radius > 0 ? 0 : Math.PI,
                arcEnd = radius > 0 ? Math.PI : 0;

            var customAttributes = {
                'level': key,
                'type': "additionalDrawing"
            }

            var mergedragSupporterStyles = {};
            var dragSupporterStyles = Object.assign(mergedragSupporterStyles, infChart.drawingUtils.common.dragSupporterStyles, customAttributes);
            self.dragSupporters.push(chart.renderer.arc(0, 0, Math.abs(radius), Math.abs(radius), arcStart, arcEnd).attr(dragSupporterStyles).add(ann.group));
            infChart.drawingUtils.common.setDeleteCursor.call(self);
            infChart.drawingUtils.common.setDeleteModeCursor.call(self);
        }
    });
    self.highlightEachLine();
    isPropertyChange && self.onPropertyChange();
    if (this.settingsPopup) {
        this.settingsPopup.data("infUndoRedo", false);
    }   
};

infChart.fibArcsDrawing.prototype.scale = function () {
    var self = this,
        ann = self.annotation,
        chart = ann.chart,
        options = ann.options,
        line = ann.shape.d.split(' '),
        xAxis = chart.xAxis[options.xAxis],
        yAxis = chart.yAxis[options.yAxis],
        fibonacciDrawings = this.fibonacciDrawings.lines,
        fibonacciDrawingsFill = this.fibonacciDrawings.fill,
        fibLevels = options.fibLevels ? options.fibLevels : this.fibLevels,
        fibLevels = infChart.drawingUtils.common.sortFibLevelsByValue(fibLevels),
        lineDrawings = self.additionalDrawings.lines,
        fill,
        currentLine,
        currentLineP,
        prvLine,
        prvLineP;

    var xEnd = xAxis.toPixels(options.xValueEnd) - xAxis.toPixels(options.xValue),
        yEnd = yAxis.toPixels(options.yValueEnd) - yAxis.toPixels(options.yValue);

    line[4] = (!isNaN(xEnd) && xEnd) || 0;
    line[5] = (!isNaN(yEnd) && yEnd) || 0;

    ann.update({
        shape: {
            params: {
                d: line
            }
        }
    });

    infChart.drawingUtils.common.removeDragSupporters.call(self, self.dragSupporters);
    infChart.drawingUtils.common.addDragSupporters.call(self, ann, chart, ['M', 0, 0, 'L', line[4], line[5]], self.dragSupporters);

    var dx = line[4], dy = line[5],
        dxAbs = Math.abs(dx),
        dyAbs = Math.abs(dy),
        lineWidth = Math.sqrt(dxAbs * dxAbs + dyAbs * dyAbs);

    $.each(this.additionalDrawings.lines, function (key, value) {
        var fibLevel = fibLevels.find(function (level) {
            return level.id === key;
        });
        var percentage = parseFloat(fibLevel.value);
        var radius = (lineWidth * percentage / 100) * (dy > 0 ? 1 : -1);
        var drawingLabel = fibonacciDrawings[key];

        value.attr({
            r: radius,
            innerR: radius
        });

        drawingLabel.attr({
            y: radius
        });

        drawingLabel.textSetter(infChart.drawingUtils.common.formatValue(fibLevel.value, 1));

        var arcStart = radius > 0 ? 0 : Math.PI,
            arcEnd = radius > 0 ? Math.PI : 0;

        if (value.visibility !== 'hidden') {
            var customAttributes = {
                'level': key,
                'type': "additionalDrawing"
            }

            var mergedragSupporterStyles = {};
            var dragSupporterStyles = Object.assign(mergedragSupporterStyles, infChart.drawingUtils.common.dragSupporterStyles, customAttributes);
            self.dragSupporters.push(chart.renderer.arc(0, 0, Math.abs(radius), Math.abs(radius), arcStart, arcEnd).attr(dragSupporterStyles).add(ann.group));
            infChart.drawingUtils.common.setDeleteCursor.call(self);
            infChart.drawingUtils.common.setDeleteModeCursor.call(self);
        }
    });
    self.highlightEachLine();
    fibLevels.forEach(function (value, index, arr) {
        fill = fibonacciDrawingsFill && fibonacciDrawingsFill[value.id];
        currentLine = lineDrawings[value.id];
        currentLineP = currentLine && currentLine.d.split(' ');

        for (var i = index - 1; i >= 0; i--) {
            var lineTemp = self.additionalDrawings.lines[arr[i].id];
            if (lineTemp && lineTemp.visibility != "hidden") {
                prvLine = lineTemp;
                break;
            }
        }
        if (currentLine && fill && prvLine) {

            prvLineP = prvLine && prvLine.d.split(' ');
            fill.attr({
                d: ['M', prvLineP[1], prvLineP[2],
                    'A', prvLineP[4], prvLineP[5], prvLineP[6], prvLineP[7], prvLineP[8], prvLineP[9], prvLineP[10],
                    'L', currentLineP[9], currentLineP[10],
                    'A', currentLineP[4], currentLineP[5], 360 - currentLineP[6], currentLineP[7], currentLineP[8] ? 0 : 1, currentLineP[1], currentLineP[2],
                    'L', prvLineP[1], prvLineP[2]
                ]
            });
        } else if (currentLine && fill) {
            fill.attr({
                d: ['M', currentLineP[9], currentLineP[10],
                    'A', currentLineP[4], currentLineP[5], 360 - currentLineP[6], currentLineP[7], currentLineP[8] ? 0 : 1, currentLineP[1], currentLineP[2],
                    'L', currentLineP[9], currentLineP[10]
                ]
            });
        }
        prvLine = undefined;
    });
};

infChart.fibArcsDrawing.prototype.selectAndBindResize = function () {
    var ann = this.annotation,
        pathDefinition, width, height;

    ann.events.deselect.call(ann);
    ann.selectionMarker = [];
    pathDefinition = ann.shape.d.split(' ');
    width = parseFloat(pathDefinition[4]);
    height = parseFloat(pathDefinition[5]);
    if (!isNaN(width) && !isNaN(height)) {
        infChart.drawingUtils.common.addAndBindSelectionMarker.call(this, ann, 0, 0, this.stepFunction, this.stop, true);
        infChart.drawingUtils.common.addAndBindSelectionMarker.call(this, ann, width, height, this.stepFunction, this.stop, false);
    }
};

infChart.fibArcsDrawing.prototype.step = function (e, isStartPoint) {
    var self = this,
        ann = this.annotation,
        options = ann.options,
        points = infChart.drawingUtils.common.calculateInitialPoints(e, ann, isStartPoint, 0, 0),
        dxAbs = Math.abs(points.dx),
        dyAbs = Math.abs(points.dy),
        lineWidth = Math.sqrt(dxAbs * dxAbs + dyAbs * dyAbs),
        fibonacciDrawings = this.fibonacciDrawings.lines,
        fibonacciDrawingsFill = this.fibonacciDrawings.fill,
        fibLevels = options.fibLevels ? options.fibLevels : this.fibLevels,
        fibLevels = infChart.drawingUtils.common.sortFibLevelsByValue(fibLevels),
        lineDrawings = self.additionalDrawings.lines,
        fill,
        currentLine,
        currentLineP,
        prvLine,
        prvLineP;

    var line = ["M", 0, 0, 'L', parseInt(points.dx, 10), parseInt(points.dy, 10)];
    ann.shape.attr({
        d: line
    });

    $.each(this.additionalDrawings.lines, function (key, value) {
        var fibLevel = fibLevels.find(function (level) {
            return level.id === key;
        });
        var percentage = parseFloat(fibLevel.value);
        var radius = (lineWidth * percentage / 100) * (points.dy > 0 ? 1 : -1);
        var drawingLabel = fibonacciDrawings[key];

        value.attr({
            r: radius,
            innerR: radius
        });

        drawingLabel.attr({
            y: radius
        });
    });

    fibLevels.forEach(function (value, index, arr) {
        fill = fibonacciDrawingsFill && fibonacciDrawingsFill[value.id];
        currentLine = lineDrawings[value.id];
        currentLineP = currentLine && currentLine.d.split(' ');

        for (var i = index - 1; i >= 0; i--) {
            var lineTemp = self.additionalDrawings.lines[arr[i].id];
            if (lineTemp && lineTemp.visibility != "hidden") {
                prvLine = lineTemp;
                break;
            }
        }
        if (currentLine && fill && prvLine) {

            prvLineP = prvLine && prvLine.d.split(' ');
            fill.attr({
                d: ['M', prvLineP[1], prvLineP[2],
                    'A', prvLineP[4], prvLineP[5], prvLineP[6], prvLineP[7], prvLineP[8], prvLineP[9], prvLineP[10],
                    'L', currentLineP[9], currentLineP[10],
                    'A', currentLineP[4], currentLineP[5], 360 - currentLineP[6], currentLineP[7], currentLineP[8] ? 0 : 1, currentLineP[1], currentLineP[2],
                    'L', prvLineP[1], prvLineP[2]
                ]
            });
        } else if (currentLine && fill) {
            fill.attr({
                d: ['M', currentLineP[9], currentLineP[10],
                    'A', currentLineP[4], currentLineP[5], 360 - currentLineP[6], currentLineP[7], currentLineP[8] ? 0 : 1, currentLineP[1], currentLineP[2],
                    'L', currentLineP[9], currentLineP[10]
                ]
            });
        }
        prvLine = undefined;
    });

    return line;
};

infChart.fibArcsDrawing.prototype.stop = function (e, isStartPoint) {
    var self = this,
        ann = self.annotation,
        chart = ann.chart,
        line = this.stepFunction(e, isStartPoint),
        xAxis = chart.xAxis[ann.options.xAxis],
        yAxis = chart.yAxis[ann.options.yAxis],
        x = xAxis.toValue(line[4] + xAxis.toPixels(ann.options.xValue)),
        y = yAxis.toValue(line[5] + yAxis.toPixels(ann.options.yValue));

    ann.update({
        xValueEnd: x,
        yValueEnd: y,
        shape: {
            params: {
                d: line
            }
        }
    });

    infChart.drawingUtils.common.saveBaseYValues.call(this, ann.options.yValue, y);
    infChart.drawingUtils.common.removeDragSupporters.call(self, self.dragSupporters);
    infChart.drawingUtils.common.addDragSupporters.call(self, ann, chart, ['M', 0, 0, 'L', line[4], line[5]], self.dragSupporters);

    $.each(self.additionalDrawings.lines, function (key, value) {
        if (value.visibility !== 'hidden') {
            var radius = value.r;
            var arcStart = radius > 0 ? 0 : Math.PI,
                arcEnd = radius > 0 ? Math.PI : 0;

            var customAttributes = {
                'level': key,
                'type': "additionalDrawing"
            }

            var mergedragSupporterStyles = {};
            var dragSupporterStyles = Object.assign(mergedragSupporterStyles, infChart.drawingUtils.common.dragSupporterStyles, customAttributes);
            self.dragSupporters.push(chart.renderer.arc(0, 0, Math.abs(radius), Math.abs(radius), arcStart, arcEnd).attr(dragSupporterStyles).add(ann.group));
            infChart.drawingUtils.common.setDeleteCursor.call(self);
            infChart.drawingUtils.common.setDeleteModeCursor.call(self);
        }
    });
    self.highlightEachLine();
    infChart.drawingUtils.common.fixSelectionMarker.call(self, ann);
    infChart.drawingUtils.common.onPropertyChange.call(this);
};

infChart.fibArcsDrawing.prototype.translateEnd = function () {
    var self = this,
        ann = self.annotation,
        chart = ann.chart,
        line = ann.shape.d.split(' ');
    
    infChart.drawingUtils.common.removeDragSupporters.call(self, self.dragSupporters);
    infChart.drawingUtils.common.addDragSupporters.call(self, ann, chart, ['M', 0, 0, 'L', line[4], line[5]], self.dragSupporters);
    $.each(self.additionalDrawings.lines, function (key, value) {
        if (value.visibility !== 'hidden') {
            var radius = value.r;
            var arcStart = radius > 0 ? 0 : Math.PI,
                arcEnd = radius > 0 ? Math.PI : 0;

            var customAttributes = {
                'level': key,
                'type': "additionalDrawing"
            }

            var mergedragSupporterStyles = {};
            var dragSupporterStyles = Object.assign(mergedragSupporterStyles, infChart.drawingUtils.common.dragSupporterStyles, customAttributes);
            self.dragSupporters.push(chart.renderer.arc(0, 0, Math.abs(radius), Math.abs(radius), arcStart, arcEnd).attr(dragSupporterStyles).add(ann.group));
            infChart.drawingUtils.common.setDeleteCursor.call(self);
            infChart.drawingUtils.common.setDeleteModeCursor.call(self);
        }
    });
    self.highlightEachLine();
    infChart.drawingUtils.common.onPropertyChange.call(this);
};

infChart.fibArcsDrawing.prototype.updateSettings = function (properties) {
    var updateProperties = {
        fillColor: properties.fillColor,
        fillOpacity: properties.fillOpacity,
        lineColor: properties.borderColor,
        lineWidth: properties.strokeWidth,
        fontSize: properties.fontSize,
        fontColor: properties.fontColor,
        isSingleColor: properties.isSingleColor,
        fibLevels: properties.fibLevels,
        isTrendLineAlwaysEnabled: properties.isTrendLineAlways
    }
    infChart.structureManager.drawingTools.updateFibSettings(this.settingsPopup, updateProperties);
};

infChart.fibArcsDrawing.prototype.highlightEachLine = function(){
    let self = this,
        ann = self.annotation,
        options = ann.options,
        chart = ann.chart,
        dragSupporters = self.dragSupporters,
        additionalDrawings = self.additionalDrawings,
        fibonacciDrawings = self.fibonacciDrawings,
        container = chart.container,
        selectedLevel,
        fibLabels = fibonacciDrawings.lines,
        fibLines = additionalDrawings.lines;

        dragSupporters.forEach(function (dragSupporter) {
            $(dragSupporter.element).mouseenter( function (event) {   
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

            $(dragSupporter.element).mouseleave( function (event) {   
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
