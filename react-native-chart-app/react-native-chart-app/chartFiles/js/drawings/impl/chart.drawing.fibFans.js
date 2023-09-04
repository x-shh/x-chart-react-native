window.infChart = window.infChart || {};

infChart.fibFansDrawing = function () {
    infChart.drawingObject.apply(this, arguments);
    this.fibLevels = [
        {
            id: 'level_0',
            value: 38.2,
            enable: true,
            drawingPosX: -20,
            drawingPosY: 7,
            fillColor: "#FFB6C1",
            lineColor: '#959595',
            lineWidth: 1,
            fontColor: '#959595',
            fontSize: '10',
            fontWeight: 'normal'
        },
        {
            id: 'level_1',
            value: 50,
            enable: true,
            drawingPosX: -20,
            drawingPosY: 7,
            fillColor: "#ADD8E6",
            lineColor: '#959595',
            lineWidth: 1,
            fontColor: '#959595',
            fontSize: '10',
            fontWeight: 'normal'
        },
        {
            id: 'level_2',
            value: 61.8,
            enable: true,
            drawingPosX: -20,
            drawingPosY: 7,
            fillColor: "#D3D3D3",
            lineColor: '#959595',
            lineWidth: 1,
            fontColor: '#959595',
            fontSize: '10',
            fontWeight: 'normal'
        }
    ];
};

infChart.fibFansDrawing.prototype = Object.create(infChart.drawingObject.prototype);

infChart.fibFansDrawing.prototype.additionalDrawingsFunction = function () {
    var self = this,
        ann = self.annotation,
        options = ann.options,
        chart = ann.chart,
        drawingAttr = {
            'stroke-width': ann.options.shape.params['stroke-width'],
            fill: ann.options.shape.params.fill,
            stroke: ann.options.shape.params.stroke,
            'z-index': 2,
            cursor: 'move'
        },
        drawingFillAttr = {
            'stroke-width': 0,
            fill: ann.options.shape.params.fill,
            stroke: ann.options.shape.params.stroke,
            'z-index': 2,
            cursor: 'move'
        },
        labelAttr,
        fibLevels = options.fibLevels ? options.fibLevels : this.fibLevels,
        additionalDrawingsArr = self.additionalDrawings,
        fibonacciDrawingsArr = self.fibonacciDrawings,
        theme = infChart.drawingUtils.common.getTheme.call(self),
        baseFillOpacity = (theme.fibFans && typeof theme.fibFans.fillOpacity !== "undefined") ? theme.fibFans.fillOpacity : infChart.drawingUtils.common.baseFillOpacity,
        baseFontColor = (theme.fibFans && typeof theme.fibFans.fontColor !== "undefined") ? theme.fibFans.fontColor : infChart.drawingUtils.common.baseFontColor,
        baseFontSize = (theme.fibFans && typeof theme.fibFans.fontSize !== "undefined") ? theme.fibFans.fontSize : infChart.drawingUtils.common.baseFontSize,
        baseFontWeight = (theme.fibFans && typeof theme.fibFans.fontWeight !== "undefined") ? theme.fibFans.fontWeight : infChart.drawingUtils.common.baseFontWeight,
        labelStyles = {
            'color': baseFontColor,
            fontSize: baseFontSize + 'px',
            'font-weight' : baseFontWeight
        };

    additionalDrawingsArr.lines = {};
    fibonacciDrawingsArr.lines = {};
    fibonacciDrawingsArr.fill = {};

    var hiddenLevels = [];

    // add fill objects first to avoid overlapping lines with and texts with them
    fibLevels = infChart.drawingUtils.common.sortFibLevelsByValue(fibLevels);
    fibLevels.forEach(function (fibLevel) {
        var themeFillColor = theme.fibFans && theme.fibFans.fibLevelFillColors && theme.fibFans.fibLevelFillColors[fibLevel.id];
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
            stroke: options.isSingleColor && options.lineColor ? options.lineColor :  fibLevel && fibLevel.lineColor ? fibLevel.lineColor : ann.options.shape.params.stroke,
            'z-index': 2,
            cursor: 'move',
            'level': fibLevel.id
        };

        var fontColor = options.isSingleColor && options.fontColor ? options.fontColor : fibLevel && fibLevel.fontColor ? fibLevel.fontColor : baseFontColor;
        var fontSize = options.isSingleColor && options.fontSize ? options.fontSize : fibLevel && fibLevel.fontSize ? fibLevel.fontSize : baseFontSize;
        var fontWeight = options.isSingleColor && options.fontWeight ? options.fontWeight : fibLevel && fibLevel.fontWeight ? fibLevel.fontWeight : baseFontWeight;

        labelStyles = {
            'color': fontColor,
            fontSize: fontSize + 'px',
            'font-weight' : fontWeight
        };
        labelAttr ={
            'level': fibLevel.id,
            'font-color': fontColor,
            'font-size': fontSize,
            'font-weight' : fontWeight
        };
        fibonacciDrawingsArr.fill[fibLevel.id] = chart.renderer.path(['M', 0, 0, 'L', 0, 0, 'L', 0, 0, 'L', 0, 0]).attr(drawingFillAttr).add(ann.group);
        // adding lines and texts after fill objects
        additionalDrawingsArr.lines[fibLevel.id] = chart.renderer.path(['M', 0, 0, 'L', 0, 0]).attr(drawingAttr).add(ann.group);
        fibonacciDrawingsArr.lines[fibLevel.id] = chart.renderer.label(infChart.drawingUtils.common.formatValue(fibLevel.value, 1) + "%", fibLevel.drawingPosX, fibLevel.drawingPosY).css(labelStyles).attr(labelAttr).add(ann.group);
    });

    hiddenLevels.forEach(function (id) {
        self.onFibFansLevelChange(id, false, false);
    });

    ann.selectionMarker = [];
    infChart.drawingUtils.common.addSelectionMarker.call(self, ann, 0, 0);
};

infChart.fibFansDrawing.prototype.bindSettingsEvents = function () {
    var self = this;
    var onFibFansLevelChange = function (checked, value) {
        var isPropertyChange = true;
        if (self.settingsPopup) {
            isPropertyChange = self.isSettingsPropertyChange();
        }
        self.onFibFansLevelChange.call(self, value, checked, isPropertyChange);
    };
    return infChart.drawingUtils.common.bindFibSettingsEvents.call(this, infChart.drawingUtils.common.baseBorderColor, infChart.drawingUtils.common.baseLineWidth, onFibFansLevelChange);
};

infChart.fibFansDrawing.prototype.getConfig = function () {
    var self = this,
        annotation = self.annotation,
        options = annotation.options,
        fibLevels = options.fibLevels ? options.fibLevels : self.fibLevels;
    fibLevels = infChart.drawingUtils.common.sortFibLevelsByValue(fibLevels);

    return {
        shape: 'fibFans',
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
        enabledMyDefaultButton:annotation.options.enabledMyDefaultButton,
        isLocked : annotation.options.isLocked

    };
};

infChart.fibFansDrawing.prototype.getContextMenuOptions = function (chartId, drawingId, options , event) {
    var self = this;
    var level = event.target.getAttribute('level');
     var contextMenu = {};
    if (!self.isVisibleLastLevel()) {
        var eraseThis = {
            icon: options.erase.icon,
            displayText: options.erase.displayText,
            action: function () {
                if (level) {
                    self.onFibFansLevelChange.call(self, level, false, true, true);
                }
            }
        }
        contextMenu["eraseThis"] = eraseThis;
    }
    if(level) {
        contextMenu = Object.assign(contextMenu, infChart.drawingUtils.common.getContextMenuOptions(chartId, drawingId, options));
        return infChart.drawingUtils.common.reorderContextMenu(contextMenu);
    } else {
        return infChart.drawingUtils.common.getContextMenuOptions(chartId, drawingId, options);
    }
};

infChart.fibFansDrawing.prototype.getOptions = function (properties) {
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
    var baseFillColor = (theme.fibFans && theme.fibFans.singleFillColor) ? theme.fibFans.singleFillColor : (theme.fibonacci && theme.fibonacci.singleFillColor) ? theme.fibonacci.singleFillColor : infChart.drawingUtils.common.baseFillColor;
    var baseFillOpacity = (theme.fibFans && typeof theme.fibFans.fillOpacity !== "undefined") ? theme.fibFans.fillOpacity : (theme.fibonacci && typeof theme.fibonacci.fillOpacity !== "undefined") ? theme.fibonacci.fillOpacity : infChart.drawingUtils.common.baseFillOpacity;
    var baseBorderColor = (theme.fibFans && theme.fibFans.borderColor) ? theme.fibFans.borderColor : (theme.fibonacci && theme.fibonacci.borderColor) ? theme.fibonacci.borderColor : infChart.drawingUtils.common.baseBorderColor;
    var baseLineWidth = (theme.fibFans && typeof theme.fibFans.lineWidth !== "undefined") ? theme.fibFans.lineWidth : (theme.fibonacci && theme.fibonacci.lineWidth) ? theme.fibonacci.lineWidth : infChart.drawingUtils.common.baseLineWidth;
    var baseFontColor = (theme.fibFans && theme.fibFans.fontColor) ? theme.fibFans.fontColor: (theme.fibonacci && theme.fibonacci.fontColor) ? theme.fibonacci.fontColor : infChart.drawingUtils.common.baseFontColor;
    var baseFontSize = (theme.fibFans && theme.fibFans.fontSize) ? theme.fibFans.fontSize: (theme.fibonacci && theme.fibonacci.fontSize) ? theme.fibonacci.fontSize : infChart.drawingUtils.common.baseFontSize;
    var baseFontWeight = (theme.fibFans && theme.fibFans.fontWeight) ? theme.fibFans.fontWeight: (theme.fibonacci && theme.fibonacci.fontWeight) ? theme.fibonacci.fontWeight : infChart.drawingUtils.common.baseFontWeight;

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

infChart.fibFansDrawing.prototype.validateTranslation = function (newXValue) {
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

infChart.fibFansDrawing.prototype.getQuickSettingsPopup = function () {
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

infChart.fibFansDrawing.prototype.getSettingsPopup = function () {
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
 * Change the Fib fan levels
 * IMPORTANT :: this method is uesd in commands.wrappers to set undo/redo actions
 * @param {string} currentLevel 
 * @param {boolean} checked 
 * @param {boolean|undefined} isPropertyChange property change 
 */
infChart.fibFansDrawing.prototype.onFibFansLevelChange = function (currentLevel, checked, isPropertyChange, ignoreSettingsSave) {
    var self = this,
        ann = self.annotation,
        chart = ann.chart,
        line = ann.shape.d.split(' ');
    var drawing = self.additionalDrawings.lines[currentLevel];
    var label = self.fibonacciDrawings.lines[currentLevel];
    var fill = self.fibonacciDrawings.fill[currentLevel],
        options = self.annotation.options,
        fibLevels = infChart.drawingUtils.common.sortFibLevelsByValue(options.fibLevels),
        currentOrderIdx,
        prevLine, prevFill, nextFill,
        currentLinePoints,
        i,
        lineD,
        next;

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
        fill.show();

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

        if (prevLine && prevFill) {
            prvLinePoints = prevLine.d.split(' ');
            prevFill.attr({
                d: ['M', prvLinePoints[1], prvLinePoints[2], 'L', prvLinePoints[4], prvLinePoints[5], 'L', currentLinePoints[4], currentLinePoints[5], 'L', prvLinePoints[1], prvLinePoints[2]]
            });

        }

        if (fill && nextFill) {
            nextLinePoints = next.d.split(' ');
            fill.attr({
                d: ['M', nextLinePoints[1], nextLinePoints[2], 'L', nextLinePoints[4], nextLinePoints[5], 'L', currentLinePoints[4], currentLinePoints[5], 'L', nextLinePoints[1], nextLinePoints[2]]
            });
        } else if (fill){
            var annotationLine = self.annotation.shape.d.split(' ');
            if(annotationLine[1] === "0" && annotationLine[2] === "0" && currentLinePoints[1] !== "0" && currentLinePoints[2] !== "0"){
                fill.attr({
                    d: ['M',  annotationLine[1], annotationLine[2], 'L', currentLinePoints[1], currentLinePoints[2], 'L', currentLinePoints[4], currentLinePoints[5], 'L', annotationLine[1], annotationLine[2]]
                });
            } else {
                fill.attr({
                    d: ['M', currentLinePoints[1], currentLinePoints[2], 'L', currentLinePoints[4], currentLinePoints[5], 'L', annotationLine[4], annotationLine[5], 'L', currentLinePoints[1], currentLinePoints[2]]
                });
            }
        }

    } else {
        drawing.hide();
        label.hide();
        fill.hide();

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
            var prvLinePoints = prevLine.d.split(' '),
                nextLinePoints = next.d.split(' ');
            prevFill.attr({
                d: ['M', nextLinePoints[1], nextLinePoints[2], 'L', nextLinePoints[4], nextLinePoints[5], 'L', prvLinePoints[4], prvLinePoints[5], 'L', nextLinePoints[1], nextLinePoints[2]]
            })
        } else if (prevLine) {
            var prvLinePoints = prevLine.d.split(' ');
            var jointLinePoints = self.annotation.shape.d.split(' ');
            if(jointLinePoints[1] === "0" && jointLinePoints[2] === "0" && prvLinePoints[1] !== "0" && prvLinePoints[2] !== "0"){
                prevFill.attr({
                    d: ['M', jointLinePoints[1], jointLinePoints[2], 'L', prvLinePoints[1], prvLinePoints[2], 'L', prvLinePoints[4], prvLinePoints[5], 'L', jointLinePoints[1], jointLinePoints[2]]
                });
            } else {
                prevFill.attr({
                    d: ['M', prvLinePoints[1], prvLinePoints[2], 'L', prvLinePoints[4], prvLinePoints[5], 'L', jointLinePoints[4], jointLinePoints[5], 'L', prvLinePoints[1], prvLinePoints[2]]
                });
            }
        }
    }

    infChart.drawingUtils.common.removeDragSupporters.call(self, self.dragSupporters);
    infChart.drawingUtils.common.addDragSupporters.call(self, ann, chart, ['M', 0, 0, 'L', line[4], line[5]], self.dragSupporters);
    $.each(self.additionalDrawings.lines, function (key, value) {
        if (value.visibility !== 'hidden') {
            var line = value.d.split(' ');
            var customAttributes = {
                'level': key,
                'type': "additionalDrawing"
            }
            infChart.drawingUtils.common.addDragSupporters.call(self, ann, chart, ['M', line[1], line[2], 'L', line[4], line[5]], self.dragSupporters, customAttributes);
        }
    });
    self.highlightEachLine();

    isPropertyChange && self.onPropertyChange();
    if (this.settingsPopup) {
        this.settingsPopup.data("infUndoRedo", false);
    }    
};

infChart.fibFansDrawing.prototype.scale = function () {
    var self = this,
        ann = self.annotation,
        chart = ann.chart,
        options = ann.options,
        line = ann.shape.d.split(' '),
        xAxis = chart.xAxis[options.xAxis],
        yAxis = chart.yAxis[options.yAxis],
        plotWidth = chart.plotWidth * infChart.drawingUtils.common.correctionFactor,
        fibonacciDrawings = self.fibonacciDrawings.lines,
        fibonacciDrawingsFill = self.fibonacciDrawings.fill,
        fibLevels = options.fibLevels ? options.fibLevels : this.fibLevels,
        fibLevels = infChart.drawingUtils.common.sortFibLevelsByValue(fibLevels);

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

    var dx = line[4], dy = line[5];

    $.each(this.additionalDrawings.lines, function (key, value) {
        var fibLevel = fibLevels.find(function (level) {
            return level.id === key;
        });
        // var percentage = parseFloat(key.split("_")[1]);
        var percentage = parseFloat(fibLevel.value);
        var percentageY = (dx > 0 ? -dy : dy) * percentage / 100 + (dx > 0 ? dy : 0);
        var m = dx > 0 ? percentageY / dx : (percentageY - dy) / (0 - dx);
        var startPointX = dx > 0 ? 0 : dx;
        var startPointY = dx > 0 ? 0 : dy;
        var drawingLabel = fibonacciDrawings[key];
        var labelBBox = drawingLabel.getBBox();
        var labelStartPosition = dx > 0 ? labelBBox.x + parseInt(dx, 10) : labelBBox.x;
        var line = ["M", startPointX, startPointY, 'L', plotWidth, plotWidth * m + (dx > 0 ? 0 : percentageY)];

        value.attr({
            d: line
        });

        drawingLabel.attr({
            x: labelStartPosition,
            y: percentageY - 10
        });

        drawingLabel.textSetter(infChart.drawingUtils.common.formatValue(fibLevel.value, 1) + "%");
        if (value.visibility !== 'hidden') {
            var customAttributes = {
                'level': key,
                'type': "additionalDrawing"
            }

            infChart.drawingUtils.common.addDragSupporters.call(self, ann, chart, ['M', line[1], line[2], 'L', line[4], line[5]], self.dragSupporters, customAttributes);
        }
    });

    $.each(fibonacciDrawingsFill, function (key, value) {
        var lineD = self.additionalDrawings.lines[key],
            currentLineP = lineD && lineD.d.split(' '),
            currentOrderIdx,
            lineD_,
            lineD_P;

        fibLevels.some(function (fibLevel, i) {
            if (fibLevel.id == key) {
                currentOrderIdx = i;
                return true;
            }
        });

        for (var i = currentOrderIdx - 1; i >= 0; i--) {
            var lineTemp = self.additionalDrawings.lines[fibLevels[i].id];
            if (lineTemp && lineTemp.visibility != "hidden") {
                lineD_ = lineTemp;
                break;
            }
        }

        if (!lineD_) {
            lineD_ = ann.shape;
        }

        lineD_P = lineD_.d.split(' ');
        if (currentLineP && lineD_P) {
            if(lineD_P[1] === "0" && lineD_P[2] === "0" && currentLineP[1] !== "0" && currentLineP[2] !== "0"){
                value.attr({
                    d: ['M', lineD_P[1], lineD_P[2], 'L', currentLineP[1], currentLineP[2], 'L', currentLineP[4], currentLineP[5], 'L', lineD_P[1], lineD_P[2]]
                });
            } else {
                value.attr({
                    d: ['M', currentLineP[1], currentLineP[2], 'L', currentLineP[4], currentLineP[5], 'L', lineD_P[4], lineD_P[5], 'L', currentLineP[1], currentLineP[2]]
                });
            }

        }

    });
    self.highlightEachLine();
};

infChart.fibFansDrawing.prototype.selectAndBindResize = function () {
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

infChart.fibFansDrawing.prototype.step = function (e, isStartPoint) {
    var self = this,
        ann = self.annotation,
        options = ann.options,
        chart = ann.chart,
        plotWidth = chart.plotWidth * infChart.drawingUtils.common.correctionFactor,
        fibonacciDrawings = self.fibonacciDrawings.lines,
        points = infChart.drawingUtils.common.calculateInitialPoints(e, ann, isStartPoint, 0, 0),
        fibonacciDrawingsFill = self.fibonacciDrawings.fill,
        fibLevels = options.fibLevels ? options.fibLevels : this.fibLevels,
        fibLevels = infChart.drawingUtils.common.sortFibLevelsByValue(fibLevels);


    var line = ["M", 0, 0, 'L', parseInt(points.dx, 10), parseInt(points.dy, 10)];
    ann.shape.attr({
        d: line
    });

    var prevLine = line;

    $.each(self.additionalDrawings.lines, function (key, value) {
        var fibLevel = fibLevels.find(function (level) {
            return level.id === key;
        });
        var percentage = parseFloat(fibLevel.value);
        var percentageY = (points.dx > 0 ? -points.dy : points.dy) * percentage / 100 + (points.dx > 0 ? points.dy : 0);
        var m = points.dx > 0 ? percentageY / points.dx : (percentageY - points.dy) / (0 - points.dx);
        var startPointX = points.dx > 0 ? 0 : points.dx;
        var startPointY = points.dx > 0 ? 0 : points.dy;
        var drawingLabel = fibonacciDrawings[key];
        var labelBBox = drawingLabel.getBBox();
        var labelStartPosition = points.dx > 0 ? labelBBox.x + parseInt(points.dx, 10) : labelBBox.x;
        var line = ["M", startPointX, startPointY, 'L', plotWidth, plotWidth * m + (points.dx > 0 ? 0 : percentageY)];

        value.attr({
            d: line
        });

        drawingLabel.attr({
            x: labelStartPosition,
            y: percentageY - 10
        });

        var fill = fibonacciDrawingsFill[key];
        if (value.visibility != "hidden" && prevLine && line) {
            fill.attr({
                d: ['M', prevLine[1], prevLine[2], 'L', prevLine[4], prevLine[5], 'L', line[4], line[5], 'L', prevLine[1], prevLine[2]]
            });
            prevLine = line;
        }

    });

    return line;
};

infChart.fibFansDrawing.prototype.stop = function (e, isStartPoint) {
    var self = this,
        ann = self.annotation,
        chart = ann.chart,
        line = self.stepFunction(e, isStartPoint),
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

    infChart.drawingUtils.common.saveBaseYValues.call(self, ann.options.yValue, y);
    infChart.drawingUtils.common.removeDragSupporters.call(self, self.dragSupporters);
    infChart.drawingUtils.common.addDragSupporters.call(self, ann, chart, ['M', 0, 0, 'L', line[4], line[5]], self.dragSupporters);

    $.each(self.additionalDrawings.lines, function (key, value) {
        if (value.visibility !== 'hidden') {
            var line = value.d.split(' ');
            var customAttributes = {
                'level': key,
                'type': "additionalDrawing"
            }
            infChart.drawingUtils.common.addDragSupporters.call(self, ann, chart, ['M', line[1], line[2], 'L', line[4], line[5]], self.dragSupporters, customAttributes);
        }
    });
    self.highlightEachLine();

    infChart.drawingUtils.common.fixSelectionMarker.call(self, ann);
    infChart.drawingUtils.common.onPropertyChange.call(self);
};

infChart.fibFansDrawing.prototype.translateEnd = function () {
    var self = this,
        ann = self.annotation,
        chart = ann.chart,
        line = ann.shape.d.split(' ');
    infChart.drawingUtils.common.removeDragSupporters.call(self, self.dragSupporters);
    infChart.drawingUtils.common.addDragSupporters.call(self, ann, chart, ['M', 0, 0, 'L', line[4], line[5]], self.dragSupporters);
    $.each(self.additionalDrawings.lines, function (key, value) {
        if (value.visibility !== 'hidden') {
            var line = value.d.split(' ');
            var customAttributes = {
                'level': key,
                'type': "additionalDrawing"
            }
            infChart.drawingUtils.common.addDragSupporters.call(self, ann, chart, ['M', line[1], line[2], 'L', line[4], line[5]], self.dragSupporters, customAttributes);
        }
    });
    self.highlightEachLine();
    infChart.drawingUtils.common.onPropertyChange.call(this);
};

infChart.fibFansDrawing.prototype.updateSettings = function (properties) {
    var updateProperties = {
        fillColor: properties.fillColor,
        fillOpacity: properties.fillOpacity,
        lineColor: properties.borderColor,
        lineWidth: properties.strokeWidth,
        fontSize: properties.fontSize,
        fontColor: properties.fontColor,
        isSingleColor: properties.isSingleColor,
        fibLevels: properties.fibLevels
    }
    infChart.structureManager.drawingTools.updateFibSettings(this.settingsPopup, updateProperties);
};

infChart.fibFansDrawing.prototype.highlightEachLine = function(){
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