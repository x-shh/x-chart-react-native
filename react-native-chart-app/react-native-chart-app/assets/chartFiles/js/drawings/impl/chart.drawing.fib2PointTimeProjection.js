window.infChart = window.infChart || {};

infChart.fib2PointTimeProjection = function () {
    infChart.fibVerRetracementsDrawing.apply(this, arguments);
    this.fibLevels = [
        {
            id: 'level_0',
            value: 0.0,
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
            id: 'level_1',
            value: 23.6,
            enable: false,
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
            id: 'level_3',
            value: 50,
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
            id: 'level_4',
            value: 61.8,
            enable: false,
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
            enable: false,
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
            enable: true,
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
            enable: false,
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
            enable: false,
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
};

infChart.fib2PointTimeProjection.prototype = Object.create(infChart.fibVerRetracementsDrawing.prototype);

infChart.fib2PointTimeProjection.prototype.changeAllFibLines = function (property, propertyValue, isPropertyChange) {
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
            if (self.additionalDrawings && self.additionalDrawings.lines['start']) {
                self.additionalDrawings.lines['start'].attr({
                    'stroke': propertyValue
                });
            }
            if (self.additionalDrawings && self.additionalDrawings.lines['end']) {
                self.additionalDrawings.lines['end'].attr({
                    'stroke': propertyValue
                });
            }
            if(self.additionalDrawings.jointLine){
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
            if (self.additionalDrawings && self.additionalDrawings.lines['start']) {
                self.additionalDrawings.lines['start'].attr({
                    'stroke-width': propertyValue
                });
            }
            if(self.additionalDrawings.jointLine){
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

infChart.fib2PointTimeProjection.prototype.changeFibLine = function (level, property, propertyValue, isAll, isPropertyChange, ignoreSettingsSave) {
    var self = this;
    var options = this.annotation.options;
    var fibLevels, fibLevel, fibIndex = -1;
    if(!isAll) {
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
            fibLevel.enable = propertyValue;
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
                if(this.isEndLevelEnabled()){
                    additionalDrawings.lines['end'].show();
                    additionalDrawings.labels['end'].show();
                }
            }
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
            if (level === 'level_0' || level === 'level_13' || level === 'level_14' || level === 'level_15') {
                additionalDrawings.lines['end'].attr({
                    'stroke': propertyValue
                });
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
            if (level === 'level_0' || level === 'level_13' || level === 'level_14' || level === 'level_15') {
                additionalDrawings.lines['end'].attr({
                    'stroke-width': propertyValue
                });
            }
            break;
    }

    if (isPropertyChange) {
        this.onPropertyChange();
    }
    self.updateEndProperty();
};

infChart.fib2PointTimeProjection.prototype.createAdditionalDrawings = function () {
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
        'pointer-events':'none'
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
        'font-weight' : baseFontWeight
    };
    var labelAttr = {
        'font-color': baseFontColor,
        'font-size': baseFontSize,
        'font-weight' : baseFontWeight,
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
        var x = adjustment + (dx > 0 ? dx : -dx) + (dx > 0 ? dx : -dx) * distanceMultiplier;
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
        labelAttr['font-weight'] = fontWeight;

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
            if(fibLevel.value === 0){
                isEndEnabled = true;
            }
        }
    });

    if(options.isSingleColor){
        dateLabelAttr = labelAttr;
        dateLabelCssAttr = labelCssAttr;
        dateDrawingAttr = drawingAttr;
        delete dateDrawingAttr['level'];
        delete dateLabelAttr['level'];
    }

    dateDrawingAttr['stroke-width'] = options.jointLineWidth;
    dateDrawingAttr.stroke = options.jointLineColor;

    if (options.isShort) {
        var startValue = self.formatDate(options.nearestXValue, self.stockChart.interval);
        self.additionalDrawings.lines['start'] = chart.renderer.path(['M', 0, 0, 'L', 0, 0]).attr(dateDrawingAttr).add(ann.group);
        self.additionalDrawings.labels['start'] = chart.renderer.label(startValue).css(dateLabelCssAttr).attr(dateLabelAttr).add(ann.group);

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

    }
    self.updateEndProperty();
};

infChart.fib2PointTimeProjection.prototype.getConfig = function () {
    var self = this,
        options = self.annotation.options,
        fibLevels = options.fibLevels;
    fibLevels = infChart.drawingUtils.common.sortFibLevelsByValue(options.fibLevels);
    return {
        shape: 'fib2PointTimeProjection',
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
        jointLineWidth: options.jointLineWidth
    };
};

infChart.fib2PointTimeProjection.prototype.getContextMenuOptions = function (chartId, drawingId, options, event) {
    var self = this;
    var level = event.target.getAttribute('level');
    if (!level && event.target.parentElement) {
        if (event.target.parentElement.getAttribute('level')) {
            level = event.target.parentElement.getAttribute('level');
        } else if (event.target.parentElement.parentElement && event.target.parentElement.parentElement.getAttribute('level')) {
            level = event.target.parentElement.parentElement.getAttribute('level');
        }
    }
    var contextMenu = {
        "copyToClipboard" : {
            icon : options.copyToClipboard.icon,
            displayText : options.copyToClipboard.displayText,
            action : function () {
                if(level) {
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

infChart.fib2PointTimeProjection.prototype.eraseFibLevel = function (level, checked, isPropertyChange, ignoreSettingsSave){
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
    if(self.isEndLevelEnabled()){
        self.additionalDrawings.lines['end'].show();
        self.additionalDrawings.labels['end'].show();
    }
    self.changeFibLine(level, 'enabled', checked, false, false, ignoreSettingsSave);
    self.updateJointLine();
};

infChart.fib2PointTimeProjection.prototype.isEndLevelEnabled = function (){
    var self = this,
        ann = self.annotation,
        options = ann.options,
        fibLevels = options.fibLevels;

    fibLevels = infChart.drawingUtils.common.sortFibLevelsByValue(fibLevels);
    var isEndEnabled = true;
    fibLevels.forEach(function (fibLevel) {
        if(fibLevel.enable && fibLevel.value === 0){
                isEndEnabled = false;
        }
    });
    return isEndEnabled;
};

infChart.fib2PointTimeProjection.prototype.scale = function (isCalculateNewValueForScale) {
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
                    d: line
                }
            }
        });
        ann.options.distance = nearestDataForXValueEnd.dataIndex - nearestDataForXValue.dataIndex;
    } else {
        ann.update({
            shape: {
                params: {
                    d: line
                }
            }
        });
    }
    
    if (ann.selectionMarker && ann.selectionMarker.length > 1) {
        ann.selectionMarker[1].attr({
            x: line[4],
            y: line[5]
        });
    }

    self.updateAdditionalDrawings(false);
    self.updateJointLine();
    self.setDragSupporters();
};

infChart.fib2PointTimeProjection.prototype.step = function (e, isStartPoint) {
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

    var y = points.dy;
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
    self.updateEndProperty();
    self.updateJointLine();
    return line;
};

infChart.fib2PointTimeProjection.prototype.translate = function (event) {
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
    this.updateJointLine();
};

infChart.fib2PointTimeProjection.prototype.updateAdditionalDrawings = function (isScale, isMain) {
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
            var endValue = self.formatDate(this.calculateFibLevelCandleValue(dx, 0), self.stockChart.interval);
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

        self.additionalDrawings.jointLine.attr({
            d: ['M', newX, lineStartPosition, 'L', lastX, lineStartPosition]
        });
    }
};

infChart.fib2PointTimeProjection.prototype.updateEndProperty = function () {
    var self = this,
        ann = self.annotation,
        options = ann.options,
        fibLevels = infChart.drawingUtils.common.sortFibLevelsByValue(options.fibLevels);

    var fibIndex = 0, fibLevelLength = fibLevels.length, propertyColor, propertyWidth;
    for (fibIndex; fibIndex < fibLevelLength; fibIndex++) {
        var fibLevel = fibLevels[fibIndex];
        if (fibLevel.enable && fibLevel.value === 0) {
                propertyColor = fibLevel.lineColor;
                propertyWidth = fibLevel.lineWidth;
        }
    }
    properties = self.getConfig();

    if (!properties.isSingleColor) {
        if (propertyColor || propertyWidth) {
            if (propertyColor && self.additionalDrawings && self.additionalDrawings.labels['end']) {
                self.additionalDrawings.labels['end'].css({
                    'color': propertyColor
                });
            }
            if (propertyColor && self.additionalDrawings && self.additionalDrawings.lines['end']) {
                self.additionalDrawings.lines['end'].attr({
                    'stroke': propertyColor
                });
            }
            if (propertyWidth && self.additionalDrawings && self.additionalDrawings.lines['end']) {
                self.additionalDrawings.lines['end'].attr({
                    'stroke-width': propertyWidth
                });
            }
            if (self.additionalDrawings && self.additionalDrawings.lines['end']) {
                self.additionalDrawings.lines['end'].hide();
                self.additionalDrawings.labels['end'].hide();
            }
        } else {
            if (self.additionalDrawings && self.additionalDrawings.labels['end']) {
                self.additionalDrawings.labels['end'].css({
                    'color': '#959595'
                });
                self.additionalDrawings.lines['end'].attr({
                    'stroke': '#959595'
                });
            }
            if (self.additionalDrawings && self.additionalDrawings.lines['end']) {
                self.additionalDrawings.labels['end'].show();
                self.additionalDrawings.lines['end'].show();
            }
        }
    }
};

infChart.fib2PointTimeProjection.prototype.updateFibLevel = function (fibLevel, fibIndex, fibLevels, dx, isScale, isValueUpdate, isMain) {
    var self = this,
        ann = self.annotation,
        chart = ann.chart,
        correctionFactor = infChart.drawingUtils.common.correctionFactor,
        options = ann.options,
        xAxis = chart.xAxis[options.xAxis],
        yAxis = chart.yAxis[options.yAxis];

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

infChart.fib2PointTimeProjection.prototype.updateJointLine = function (x, fibIndex, fibLevels) {
    var self = this, options = self.annotation.options;
    if(!fibLevels){
        fibLevels = infChart.drawingUtils.common.sortFibLevelsByValue(options.fibLevels);
    }
    if (options.isShort) {
        var maxFibLevel, isStartEnabled = false, isEndEnabled = false;
        for (var i = 0; i < fibLevels.length; i++) {
            if (fibLevels[i].enable) {
                if (typeof maxFibLevel === 'undefined') {
                    maxFibLevel = fibLevels[i];
                }
                if (fibLevels[i].value === 0) {
                    isEndEnabled = true;
                }
                if (fibLevels[i].value > maxFibLevel.value) {
                    maxFibLevel = fibLevels[i];
                }
            }
        }

        var jointLineLastX;
        if (typeof maxFibLevel === 'undefined') {
            jointLineLastX = self.additionalDrawings.lines['end'].d.split(' ')[4];
        } else {
            jointLineLastX = self.additionalDrawings.lines[maxFibLevel.id].d.split(' ')[4];
        }
        var jointLine = self.additionalDrawings.jointLine, jointLineArray = jointLine.d.split(' ');
        jointLine.attr({
            d: ['M', jointLineArray[1], jointLineArray[2], 'L', jointLineLastX, jointLineArray[5]]
        });

        if (!options.trendXValue) {
            self.additionalDrawings.labels['start'].show();
            self.additionalDrawings.lines['start'].show();

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

infChart.fib2PointTimeProjection.prototype.calculateFibLevelCandleValue = function (dx, fibValue) {
    var self = this,
        ann = self.annotation,
        chart = ann.chart,
        options = ann.options,
        xAxis = chart.xAxis[options.xAxis],
        candleValue,
        calculatedCandleIndex,
        seriesXData = chart.series[0].xData,
        distanceMultiplier = parseFloat(fibValue) / 100;

    calculatedCandleIndex = Math.round(dx + (dx) * distanceMultiplier) + options.xValueDataIndex;
    calculatedCandleIndex = calculatedCandleIndex >= 0 ? calculatedCandleIndex : 0;

    if (seriesXData.length > calculatedCandleIndex) {
        candleValue = seriesXData[calculatedCandleIndex];
    } else {
        candleValue = Math.round(infChart.math.getFutureXValueForGivenIndex(chart, calculatedCandleIndex));
    }

    return candleValue;
};

// infChart.fib2PointTimeProjection.prototype.specificCursorChange = function(url){
//     var self = this,
//         ann = self.annotation,
//         options = ann.options,
//         additionalDrawings = self.additionalDrawings;

//         $.each(additionalDrawings.labels, function (key, value) {
//             if(url){
//                 value.css({'cursor': 'url("' + url + '"), default'});
//             } else {
//                 infChart.util.setCursor(value, 'move');
//                 value.css({'cursor': 'move'});
//             }
//         });
// };
