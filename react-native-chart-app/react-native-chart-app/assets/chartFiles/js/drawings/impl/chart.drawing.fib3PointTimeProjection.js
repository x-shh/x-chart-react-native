window.infChart = window.infChart || {};

infChart.fib3PointTimeProjection = function () {
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
            fillColor: '726a6f',
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
    this.mainDragSupporterStyles = Object.assign({}, infChart.drawingUtils.common.dragSupporterStyles, {'type': 'mainDrawing'});
};

infChart.fib3PointTimeProjection.prototype = Object.create(infChart.fibVerRetracementsDrawing.prototype);

infChart.fib3PointTimeProjection.prototype.additionalDrawingsFunction = function () {
    var self = this,
        ann = self.annotation,
        options = ann.options,
        chart = ann.chart,
        shapeParams = options.shape.params,
        xAxis = chart.xAxis[options.xAxis],
        yAxis = chart.yAxis[options.yAxis],
        fibLevels = options.fibLevels,
        theme = infChart.drawingUtils.common.getTheme.call(this);

    if (options.trendXValue !== Number.MIN_SAFE_INTEGER && options.trendYValue !== Number.MIN_SAFE_INTEGER) {
        var x = xAxis.toPixels(options.trendXValue) - xAxis.toPixels(options.xValue);
        var y = yAxis.toPixels(options.trendYValue) - yAxis.toPixels(options.yValue);

        options.distance = options.xValueDataIndex - options.trendXValueDataIndex;
        options.adjustment = parseFloat(ann.shape.d.split(' ')[4]);
        self.createAdditionalDrawings();

        var drawingAttr = {
            'z-index': 2,
            'stroke-width': options.trendLineWidth,
            fill: shapeParams.fill,
            cursor: 'move',
            stroke: shapeParams.stroke,
            opacity: options.trendLineOpacity,
            dashstyle: options.trendLineStyle
        };
        var baseFontColor = (theme.fib3PointTimeProjection && typeof theme.fib3PointTimeProjection.fontColor !== "undefined") ? theme.fib3PointTimeProjection.fontColor : infChart.drawingUtils.common.baseFontColor;
        var baseFontSize = (theme.fib3PointTimeProjection && typeof theme.fib3PointTimeProjection.fontSize !== "undefined") ? theme.fib3PointTimeProjection.fontSize : infChart.drawingUtils.common.baseFontSize;
        var baseFontWeight = (theme.fib3PointTimeProjection && typeof theme.fib3PointTimeProjection.fontWeight !== "undefined") ? theme.fib3PointTimeProjection.fontWeight : infChart.drawingUtils.common.baseFontWeight;

        var labelStyles = {
            'color': baseFontColor,
            fontSize: baseFontSize + 'px',
            'font-weight' : baseFontWeight
        };
        var labelAttr = {
            'font-color': baseFontColor,
            'font-size': baseFontSize,
            'font-weight' : baseFontWeight,
            'type': 'additionalDrawing',
            cursor: 'move'
        };
        var fixedLevelAttr = {
            'z-index': 2,
            'stroke-width': options.jointLineWidth,
            fill: shapeParams.fill,
            cursor: 'move',
            stroke: options.jointLineColor,
        };

        // var referenceLineDrawingAttr = drawingAttr;

        // referenceLineDrawingAttr['stroke-width'] = options.isSingleColor ? options.lineWidth : shapeParams['stroke-width'];
        // referenceLineDrawingAttr['stroke'] = options.isSingleColor ? options.lineColor : shapeParams.stroke;

        self.additionalDrawings.referenceLine = chart.renderer.path(["M", x, y, 'L', 0, 0]).attr(drawingAttr).add(ann.group);
        
        if (options.isShort) { 
            var startValue = self.formatDate(options.nearestXValue, self.stockChart.interval);
            self.additionalDrawings.lines['start'] = chart.renderer.path(['M', 0, 0, 'L', 0, 0]).attr(fixedLevelAttr).add(ann.group);
            self.additionalDrawings.labels['start'] = chart.renderer.label(startValue).css(labelStyles).attr(labelAttr).add(ann.group);
    
            var endValue = self.formatDate(options.nearestXValueEnd, self.stockChart.interval);
            self.additionalDrawings.lines['end'] = chart.renderer.path(['M', 0, 0, 'L', 0, 0]).attr(fixedLevelAttr).add(ann.group);
            self.additionalDrawings.labels['end'] = chart.renderer.label(endValue).css(labelStyles).attr(labelAttr).add(ann.group);
            if (!self.isEndLevelEnabled()) {
                self.additionalDrawings.lines['end'].hide();
                self.additionalDrawings.labels['end'].hide();
            }

            var trendValue = infChart.fibVerRetracementsDrawing.prototype.formatDate.call(self, options.nearestTrendXValue, self.stockChart.interval);
            self.additionalDrawings.lines['trend'] = chart.renderer.path(['M', 0, 0, 'L', 0, 0]).attr(fixedLevelAttr).add(ann.group);
            self.additionalDrawings.labels['trend'] = chart.renderer.label(trendValue).css(labelStyles).attr(labelAttr).add(ann.group);

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
    }
};

infChart.fib3PointTimeProjection.prototype.isEndLevelEnabled = function (){
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

infChart.fib3PointTimeProjection.prototype.beforeDestroy = function () {
    var options = this.annotation.options;
    if (options.trendXValue !== Number.MIN_SAFE_INTEGER && options.trendYValue !== Number.MIN_SAFE_INTEGER) {
        infChart.fibVerRetracementsDrawing.prototype.destroyAdditionalDrawings.call(this);
        if (this.additionalDrawings.referenceLine) {
            this.additionalDrawings.referenceLine.destroy();
        }
        if (this.additionalDrawings.labels['trend']) {
            this.additionalDrawings.labels['trend'].destroy();
            this.additionalDrawings.lines['trend'].destroy();
        }
    }
};

infChart.fib3PointTimeProjection.prototype.bindSettingsEvents = function () {
    infChart.fibVerRetracementsDrawing.prototype.bindSettingsEvents.call(this);
};

infChart.fib3PointTimeProjection.prototype.createAdditionalDrawings = function () {
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
        baseFontSize = (theme.fibVerRetracements && typeof theme.fibVerRetracements.fontSize !== "undefined") ? theme.fibVerRetracements.fontSize : infChart.drawingUtils.common.baseFontSize;
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

    var isEndEnabled = false;
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
            if (fibLevel.value === 0) {
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

    if (options.isShort && options.isSingleColor) {
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

        var trendValue = infChart.fibVerRetracementsDrawing.prototype.formatDate.call(self, options.nearestTrendXValue, self.stockChart.interval);
        self.additionalDrawings.lines['trend'] = chart.renderer.path(['M', 0, 0, 'L', 0, 0]).attr(dateDrawingAttr).add(ann.group);
        self.additionalDrawings.labels['trend'] = chart.renderer.label(trendValue).css(dateLabelCssAttr).attr(dateLabelAttr).add(ann.group);

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
};

infChart.fib3PointTimeProjection.prototype.changeFibLine = function (level, property, propertyValue, isAll, isPropertyChange, ignoreSettingsSave) {
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
            this.showHideLevels(level, propertyValue);
            fibLevel.enable = propertyValue;
            var isEndEnabled = self.isEndLevelEnabled();
            this.showHideLevels('end',isEndEnabled);
            var isFirstLevelDisabled = true, k = fibIndex;
            for (k; k >= 0; k--) {
                if (fibLevels[k].enable) {
                    isFirstLevelDisabled = false;
                    break;
                }
            }
            var changeFibLine = fibIndex;
            if (isFirstLevelDisabled) {
                for (changeFibLine; changeFibLine < fibLevels.length; changeFibLine++) {
                    if (fibLevels[changeFibLine].enable) {
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

infChart.fib3PointTimeProjection.prototype.deselect = function (isMouseOut) {
    var self = this;
    if(isMouseOut){
        if(self.annotation.options && !self.annotation.options.isTrendLineAlways){
            self.additionalDrawings.referenceLine.hide();
        }
    }
    infChart.fibVerRetracementsDrawing.prototype.deselect.call(self, isMouseOut);
};

infChart.fib3PointTimeProjection.prototype.getConfig = function () {
    var self = this,
        options = self.annotation.options;

    var config = infChart.fibVerRetracementsDrawing.prototype.getConfig.call(self);
    config.shape = 'fib3PointTimeProjection';
    config.trendXValue = options.trendXValue;
    config.trendYValue = options.trendYValue;
    return config;
};

infChart.fib3PointTimeProjection.prototype.getContextMenuOptions = function (chartId, drawingId, options, event) {
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
        "copyToClipboard" : {
            icon : options.copyToClipboard.icon,
            displayText : options.copyToClipboard.displayText,
            action : function () {
                if(level) {
                  infChart.drawingUtils.common.onFibLevelCopy.call(self, level); 
                }
            }
        },
        "eraseThis" : {
            icon : options.erase.icon,
            displayText : options.erase.displayText,
            action : function () {
                if(level) {
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

infChart.fib3PointTimeProjection.prototype.eraseFibLevel = function (level, checked, isPropertyChange, ignoreSettingsSave){
    var self = this;
    self.additionalDrawings.lines[level].hide();
    self.additionalDrawings.labels[level].hide();
    if (self.additionalDrawings.fill[level]) {
        self.additionalDrawings.fill[level].hide();
    }
    var propeties = self.getConfig();

    propeties.fibLevels.forEach(function (fibLevel) {
       if(fibLevel.id === level){
        fibLevel.enable = false;
       }
    });
    if(self.isEndLevelEnabled()){
        self.additionalDrawings.lines['end'].show();
        self.additionalDrawings.labels['end'].show();
    }
    self.changeFibLine(level, 'enabled', checked, false, false, ignoreSettingsSave);
};

infChart.fib3PointTimeProjection.prototype.getCurrentPropertyValue = function (level, property, isAll) {
    return infChart.fibVerRetracementsDrawing.prototype.getCurrentPropertyValue.call(this, level, property, isAll);
};

infChart.fib3PointTimeProjection.prototype.getOptions = function (properties, chart) {
    var options = infChart.fibVerRetracementsDrawing.prototype.getOptions.call(this, properties, chart);
    if (properties.trendXValue && properties.trendYValue) {
        options.trendXValue = properties.trendXValue;
        options.trendYValue = properties.trendYValue;

        var nearestDataForTrendXValue = infChart.math.findNearestDataPoint(chart, options.trendXValue, undefined, options.useAllXDataToFindNearestPoint, options.useFutureDate);
        options.trendXValueDataIndex = nearestDataForTrendXValue.trendXValueDataIndex;
        options.nearestTrendXValue = nearestDataForTrendXValue.xData;
    } else {
        options.trendXValue = Number.MIN_SAFE_INTEGER;
        options.trendYValue = Number.MIN_SAFE_INTEGER;
        options.events = null;
    }
    var nearestXValueData = infChart.math.findNearestDataPoint(chart, options.xValue, undefined, options.useAllXDataToFindNearestPoint, options.useFutureDate);
    options.nearestXValue = nearestXValueData.xData;
    options.xValueDataIndex = nearestXValueData.dataIndex;
    options.fibLevels = properties.fibLevels ? properties.fibLevels : this.fibLevels;
    options.fibLevels = infChart.drawingUtils.common.getFibLevelsWithOpacity(infChart.drawingUtils.common.sortFibLevelsByValue(options.fibLevels), options.opacity);
    options.showFibModeToggle = false;
    options.disableIntermediateScale = true;
    return options;
};

infChart.fib3PointTimeProjection.prototype.getQuickSettingsPopup = function () {
    return infChart.fibVerRetracementsDrawing.prototype.getQuickSettingsPopup.call(this);
};

infChart.fib3PointTimeProjection.prototype.getSettingsPopup = function () {
    return infChart.fibVerRetracementsDrawing.prototype.getSettingsPopup.call(this);
};

infChart.fib3PointTimeProjection.prototype.moveStartPoint = function (e) {
    var self = this,
        ann = self.annotation,
        chart = ann.chart,
        options = ann.options,
        x = e.chartX,
        y = e.chartY,
        xAxis = chart.xAxis[ann.options.xAxis],
        yAxis = chart.yAxis[ann.options.yAxis];

    var xValue = xAxis.toValue(x);
    var newXValueData = infChart.math.findNearestDataPoint(chart, xValue, undefined, options.useAllXDataToFindNearestPoint, options.useFutureDate);
    ann.update({
        trendXValue: newXValueData.xData,
        trendXValueDataIndex: newXValueData.dataIndex,
        trendYValue: yAxis.toValue(y)
    });

    self.updateReferenceLine();
    self.updateAdditionalDrawings(false, true);
    self.updateJointLines(false);
    self.updateJointLine();

    return ann.shape.d.split(' ');
};

infChart.fib3PointTimeProjection.prototype.scale = function (isCalculateNewValueForScale) {
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
        nearestDataForTrendXValue = infChart.math.findNearestDataPoint(chart, options.trendXValue, undefined, options.useAllXDataToFindNearestPoint, options.useFutureDate);
        options.nearestXValue = nearestDataForXValue.xData;
        options.nearestXValueEnd = nearestDataForXValueEnd.xData;
        options.nearestTrendXValue = nearestDataForTrendXValue.xData;
    }

    var newX = xAxis.toPixels(options.nearestXValue) - xAxis.toPixels(options.xValue),
        xEnd = xAxis.toPixels(options.nearestXValueEnd) - xAxis.toPixels(options.xValue),
        yEnd = yAxis.toPixels(options.yValueEnd) - yAxis.toPixels(options.yValue);

    line[1] = (!isNaN(newX) && newX) || 0;
    line[4] = (!isNaN(xEnd) && xEnd) || 0;
    line[5] = (!isNaN(yEnd) && yEnd) || 0;

    if(isCalculateNewValueForScale){
        ann.update({
            nearestXValue: nearestDataForXValue.xData,
            nearestXValueEnd: nearestDataForXValueEnd.xData,
            nearestTrendXValue: nearestDataForTrendXValue.xData,
            xValueDataIndex: nearestDataForXValue.dataIndex,
            xValueEndDataIndex: nearestDataForXValueEnd.dataIndex,
            trendXValueDataIndex: nearestDataForTrendXValue.dataIndex,
            shape: {
                params: {
                    d: line
                }
            }
        });
    } else {
        ann.update({
            shape: {
                params: {
                    d: line
                }
            }
        });
    }

    ann.options.adjustment = line[4];
    ann.options.distance = options.xValueDataIndex - options.trendXValueDataIndex;

    if (ann.selectionMarker && ann.selectionMarker.length > 1) {
        ann.selectionMarker[1].attr({
            x: line[4],
            y: line[5]
        });
    }

    if (options.trendXValue !== Number.MIN_SAFE_INTEGER && options.trendYValue !== Number.MIN_SAFE_INTEGER) {
        self.updateReferenceLine(isCalculateNewValueForScale);
        self.updateAdditionalDrawings(false);
        self.updateJointLines(false);
        self.updateJointLine();

        infChart.fibVerRetracementsDrawing.prototype.setDragSupporters.call(self);
        infChart.drawingUtils.common.addDragSupporters.call(self, ann, chart, self.additionalDrawings.referenceLine.d.split(' '), self.dragSupporters, undefined, self.mainDragSupporterStyles);
    }
    
    infChart.drawingUtils.common.fixSelectionMarker.call(self, ann);
};

infChart.fib3PointTimeProjection.prototype.selectAndBindResize = function () {
    var ann = this.annotation,
        options = ann.options,
        chart = ann.chart,
        xAxis = chart.xAxis[options.xAxis],
        yAxis = chart.yAxis[options.yAxis];


    infChart.fibVerRetracementsDrawing.prototype.selectAndBindResize.call(this);
    this.additionalDrawings.referenceLine.show();

    var x = xAxis.toPixels(options.nearestTrendXValue) - xAxis.toPixels(options.xValue);
    var y = yAxis.toPixels(options.trendYValue) - yAxis.toPixels(options.yValue);

    infChart.drawingUtils.common.addAndBindSelectionMarker.call(this, ann, x, y, this.moveStartPoint, this.updateMoveStartPoint, true);
};

infChart.fib3PointTimeProjection.prototype.showHideLevels = function (level, enabled) {
    var self = this;
    var options = self.annotation.options;
    var additionalDrawings = self.additionalDrawings;

    if (enabled) {
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
}

infChart.fib3PointTimeProjection.prototype.step = function (e, isStartPoint) {
    var self = this,
        ann = self.annotation,
        options = ann.options,
        chart = ann.chart,
        xAxis = chart.xAxis[ann.options.xAxis],
        yAxis = chart.yAxis[ann.options.yAxis],
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

    if (options.trendXValue !== Number.MIN_SAFE_INTEGER && options.trendYValue !== Number.MIN_SAFE_INTEGER) {
        ann.options.adjustment = line[4];
        self.updateReferenceLine();
        self.updateAdditionalDrawings(false, true);
        self.updateJointLines(false);
        self.updateJointLine();
    }
    return {line: line, points: points};
};

infChart.fib3PointTimeProjection.prototype.stop = function (e, isStartPoint) {
    var self = this,
        ann = self.annotation,
        options = ann.options,
        chart = ann.chart,
        lineData = self.stepFunction(e, isStartPoint),
        line = lineData.line,
        xAxis = chart.xAxis[options.xAxis],
        yAxis = chart.yAxis[options.yAxis],
        x = xAxis.toValue(line[4] + xAxis.toPixels(options.xValue)),
        y = yAxis.toValue(line[5] + yAxis.toPixels(options.yValue));

    ann.update({
        xValueEnd: x,
        yValueEnd: y,
        shape: {
            params: {
                d: line
            }
        }
    });

    infChart.drawingUtils.common.saveBaseYValues.call(self, options.yValue, y, options.trendYValue);

    infChart.fibVerRetracementsDrawing.prototype.setDragSupporters.call(self);
    infChart.drawingUtils.common.addDragSupporters.call(self, ann, chart, self.additionalDrawings.referenceLine.d.split(' '), self.dragSupporters, undefined, self.mainDragSupporterStyles);

    infChart.drawingUtils.common.fixSelectionMarker.call(self, ann);

    infChart.drawingUtils.common.onPropertyChange.call(self);
};

infChart.fib3PointTimeProjection.prototype.translate = function (event) {
    var self = this,
        ann = self.annotation,
        options = ann.options,
        chart = ann.chart,
        xAxis = chart.xAxis[options.xAxis],
        yAxis = chart.yAxis[options.yAxis],
        trendXValueData = infChart.math.findNearestDataPoint(chart, options.trendXValue, undefined, options.useAllXDataToFindNearestPoint, options.useFutureDate);

    options.trendXValue = trendXValueData.xData;
    options.trendXValueDataIndex = trendXValueData.dataIndex;
    var newX = xAxis.toPixels(options.trendXValue) - xAxis.toPixels(options.xValue);

    if (options.selectedDrawing === "mainDrawing") {
        ann.update({
            trendXValue: options.trendXValue
        });

        if (ann.selectionMarker && ann.selectionMarker.length > 1) {
            ann.selectionMarker[2].attr({
                x: newX
            });
        }

        this.updateAdditionalDrawings(false, true);
        this.scale();
    } else if (options.selectedDrawing === "additionalDrawing") {

        options.chartY = yAxis.toValue(event.chartY);

        ann.update({
            yValue: options.yValueStore,
            trendYValue: options.trendYValueStore,
            yValueEnd: options.yValueEndStore
        });

        this.updateAdditionalDrawings(false, false);
    }

    this.updateJointLines(false);
    this.updateJointLine();
};

infChart.fib3PointTimeProjection.prototype.translateEnd = function () {
    var self = this,
        ann = self.annotation,
        options = ann.options;
    options.selectedDrawing = undefined;
    self.scale();
    infChart.drawingUtils.common.saveBaseYValues.call(self, options.yValue, options.yValueEnd, options.trendYValue);
    infChart.drawingUtils.common.onPropertyChange.call(this);
};

infChart.fib3PointTimeProjection.prototype.updateAdditionalDrawings = function (isScale, isMain) {
    var self = this,
        ann = self.annotation,
        chart = ann.chart,
        options = ann.options,
        dx = options.distance,
        adjustment = options.adjustment,
        yAxis = chart.yAxis[options.yAxis],
        xAxis = chart.xAxis[options.xAxis],
        fibLevels = infChart.drawingUtils.common.sortFibLevelsByValue(options.fibLevels);

    var fibIndex = 0, fibLevelLength = fibLevels.length, lastX = 0, lastVal = 0, isStartEnabled = false, isEndEnabled = false, trendDistance;
    for (fibIndex; fibIndex < fibLevelLength; fibIndex++) {
        var fibLevel = fibLevels[fibIndex];
        var x = self.updateFibLevel(fibLevel, fibIndex, fibLevels, dx, isScale, false, isMain);
        if (fibLevel.value === 0) {
            trendDistance = x;
        }
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
        var endX = adjustment === 0 ? dx : adjustment;
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

infChart.fib3PointTimeProjection.prototype.updateFibLevel = function (fibLevel, fibIndex, fibLevels, dx, isScale, isValueUpdate, isMain) {
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

infChart.fib3PointTimeProjection.prototype.updateXValue = function (x, dx) {
    var self = this,
        ann = self.annotation,
        options = ann.options;

    if (dx >= 0) {
        return x;
    } else {
        if (options.adjustment >= 0) {
            var value = x - options.adjustment;
            var x = options.adjustment - value;
            return x;
        } else {
            var value = options.adjustment - x;
            var x = options.adjustment + value;
            return x;
        }
    }
}

infChart.fib3PointTimeProjection.prototype.updateJointLine = function (x, fibIndex, fibLevels) {
    var self = this, options = self.annotation.options;
    var fibLevels = infChart.drawingUtils.common.sortFibLevelsByValue(options.fibLevels);
    if(options.isShort){
        var fibLevels;
        var enabledFibLevels = [];
        for (var i = 0; i < fibLevels.length; i++) {
            if (fibLevels[i].enable) {
                enabledFibLevels.push(fibLevels[i]);
            }
        }
        var minLeft, maxLeft;
        for(var i=0; i< enabledFibLevels.length; i++){
            var drawing = self.additionalDrawings.lines[enabledFibLevels[i].id];
            if(typeof minLeft === 'undefined' && typeof maxLeft === 'undefined'){
                minLeft = drawing.d.split(' ')[1];
                maxLeft = drawing.d.split(' ')[4];
            }
            if(parseFloat(minLeft) > parseFloat(drawing.d.split(' ')[1])){
                minLeft = drawing.d.split(' ')[1];
            }
            if(parseFloat(maxLeft) < parseFloat(drawing.d.split(' ')[4])){
                maxLeft = drawing.d.split(' ')[4];
            }
        }

        if(enabledFibLevels.length == 0){
            minLeft = self.additionalDrawings.lines['end'].d.split(' ')[1];
            maxLeft = self.additionalDrawings.lines['end'].d.split(' ')[4];
        }

        if(parseFloat(minLeft) > parseFloat(self.additionalDrawings.lines['end'].d.split(' ')[1])){
            minLeft = self.additionalDrawings.lines['end'].d.split(' ')[1];
        }
        if(parseFloat(minLeft) > parseFloat(self.additionalDrawings.lines['start'].d.split(' ')[1])){
            minLeft = self.additionalDrawings.lines['start'].d.split(' ')[1];
        }
        if(parseFloat(minLeft) > parseFloat(self.additionalDrawings.lines['trend'].d.split(' ')[1])){
            minLeft = self.additionalDrawings.lines['trend'].d.split(' ')[1];
        }

        if(parseFloat(maxLeft) < parseFloat(self.additionalDrawings.lines['end'].d.split(' ')[4])){
            maxLeft = self.additionalDrawings.lines['end'].d.split(' ')[4];
        }
        if(parseFloat(maxLeft) < parseFloat(self.additionalDrawings.lines['start'].d.split(' ')[4])){
            maxLeft = self.additionalDrawings.lines['start'].d.split(' ')[4];
        }
        if(parseFloat(maxLeft) < parseFloat(self.additionalDrawings.lines['trend'].d.split(' ')[4])){
            maxLeft = self.additionalDrawings.lines['trend'].d.split(' ')[4];
        }

        var jointLine = self.additionalDrawings.jointLine, jointLineArray = jointLine.d.split(' ');
        jointLine.attr({
            d: ['M', minLeft, jointLineArray[2], 'L', maxLeft, jointLineArray[5]]
        });
    }
};

infChart.fib3PointTimeProjection.prototype.updateJointLines = function(isScale){
    var jointLine = this.additionalDrawings.jointLine;
    var trendLabel = this.additionalDrawings.labels['trend'];
    var jointLineAttr = jointLine.d.split(' ');
    var referenceLineAttr = this.additionalDrawings.referenceLine.d.split(' ');
    var x = referenceLineAttr[1];
    var y = jointLineAttr[2];
    var lineStartPosition = parseFloat(y) + 10;
    var lineEndPosition = lineStartPosition + 5;
    jointLine.attr({
        d: ["M", x, y, 'L', jointLineAttr[4], y]
    });
    this.additionalDrawings.lines['trend'].attr({
        d: ['M', x, y, 'L', x, lineStartPosition]
    });
    if(!isScale){
        var trendValue = infChart.fibVerRetracementsDrawing.prototype.formatDate.call(this, this.annotation.options.nearestTrendXValue, this.stockChart.interval);
        trendLabel.textSetter(trendValue);
    }
    trendLabel.attr({
        x: parseFloat(x) - trendLabel.width / 2,
        y: lineEndPosition
    });
};

infChart.fib3PointTimeProjection.prototype.updateMoveStartPoint = function (e) {
    var self = this,
        ann = self.annotation,
        chart = ann.chart,
        options = ann.options,
        line = this.moveStartPoint(e),
        yAxis = chart.yAxis[options.yAxis],
        y = yAxis.toValue(parseFloat(line[5]) + yAxis.toPixels(options.yValue));

    infChart.drawingUtils.common.saveBaseYValues.call(self, options.yValue, y, options.trendYValue);

    infChart.fibVerRetracementsDrawing.prototype.setDragSupporters.call(self);
    infChart.drawingUtils.common.addDragSupporters.call(self, ann, chart, self.additionalDrawings.referenceLine.d.split(' '), self.dragSupporters, undefined, self.mainDragSupporterStyles);

    infChart.drawingUtils.common.fixSelectionMarker.call(self, ann);
    infChart.drawingUtils.common.onPropertyChange.call(self);
};

infChart.fib3PointTimeProjection.prototype.updateReferenceLine = function (useOptionsNearestValue) {
    var self = this,
        ann = self.annotation,
        options = ann.options,
        chart = ann.chart,
        xAxis = chart.xAxis[options.xAxis],
        yAxis = chart.yAxis[options.yAxis];

    if (!useOptionsNearestValue) {
        var nearestDataForTrendXValue = infChart.math.findNearestDataPoint(chart, options.trendXValue, undefined, options.useAllXDataToFindNearestPoint, options.useFutureDate);
        options.nearestTrendXValue = nearestDataForTrendXValue.xData;
        if(!options.trendXValueDataIndex) {
            options.trendXValueDataIndex = nearestDataForTrendXValue.dataIndex;
        }
    }

    var x = xAxis.toPixels(options.nearestTrendXValue) - xAxis.toPixels(options.xValue);
    var y = yAxis.toPixels(options.trendYValue) - yAxis.toPixels(options.yValue);
    var x1 = xAxis.toPixels(options.nearestXValue) - xAxis.toPixels(options.xValue);
    self.additionalDrawings.referenceLine.attr({
        d: ["M", x, y, 'L', x1, 0]
    });
    ann.options.distance = options.xValueDataIndex - options.trendXValueDataIndex;
};

infChart.fib3PointTimeProjection.prototype.updateSettings = function (properties) {
    infChart.fibVerRetracementsDrawing.prototype.updateSettings.call(this, properties);
};

infChart.fib3PointTimeProjection.prototype.calculateFibLevelCandleValue = function (dx, fibValue) {
    var self = this,
        ann = self.annotation,
        chart = ann.chart,
        options = ann.options,
        xAxis = chart.xAxis[options.xAxis],
        candleValue,
        calculatedCandleIndex,
        seriesXData = chart.series[0].xData,
        distanceMultiplier = parseFloat(fibValue) / 100;

    calculatedCandleIndex = Math.round(dx * distanceMultiplier) + options.xValueDataIndex + (options.xValueEndDataIndex - options.xValueDataIndex);
    calculatedCandleIndex = calculatedCandleIndex >= 0 ? calculatedCandleIndex : 0;

    if (seriesXData.length > calculatedCandleIndex) {
        candleValue = seriesXData[calculatedCandleIndex];
    } else {
        candleValue = Math.round(infChart.math.getFutureXValueForGivenIndex(chart, calculatedCandleIndex));
    }

    return candleValue;
};

infChart.fib3PointTimeProjection.prototype.onTrendLineColorChange = function (rgb, color, opacity, isPropertyChange){
    var self = this;

    if (self.additionalDrawings.referenceLine){
        self.additionalDrawings.referenceLine.attr({
            stroke: color,
            opacity: opacity
        });
    }

    infChart.fibVerRetracementsDrawing.prototype.onTrendLineColorChange.call(self, rgb, color, opacity, isPropertyChange)

};

infChart.fib3PointTimeProjection.prototype.onTrendLineWidthChange =  function (strokeWidth, isPropertyChange) {
    var self = this;
    var strokeDashArray = infChart.drawingUtils.common.settings.getStrokeDashArray.call(self, self.annotation.options.trendLineStyle, strokeWidth);

    if (self.additionalDrawings.referenceLine){
        self.additionalDrawings.referenceLine.attr({
            'stroke-width': strokeWidth,
            'stroke-dasharray': strokeDashArray
        });
    }

    infChart.fibVerRetracementsDrawing.prototype.onTrendLineWidthChange.call(self, strokeWidth, isPropertyChange)

};

infChart.fib3PointTimeProjection.prototype.onTrendLineStyleChange = function (dashStyle, isPropertyChange) {
    var self = this;
    var strokeDashArray = infChart.drawingUtils.common.settings.getStrokeDashArray.call(self, dashStyle, self.annotation.options.trendLineWidth);

    if (self.additionalDrawings.referenceLine){
        self.additionalDrawings.referenceLine.attr({
            dashstyle: dashStyle,
            'stroke-dasharray': strokeDashArray
        });
    }

    infChart.fibVerRetracementsDrawing.prototype.onTrendLineStyleChange.call(self, dashStyle, isPropertyChange);
};

infChart.fib3PointTimeProjection.prototype.onTrendLineToggleShow = function(checked, isPropertyChange){
    var self = this,
        ann = self.annotation,
        options = ann.options,
        additionalDrawings = self.additionalDrawings;

    options.isTrendLineAlways = checked;
    if(checked){
        if(ann){
            ann.shape.show();
            if(additionalDrawings && additionalDrawings.referenceLine){
                additionalDrawings.referenceLine.show();
            }
            self.setDragSupporters();
        }
    }

    isPropertyChange && self.onPropertyChange();
    if (this.settingsPopup) {
        this.settingsPopup.data("infUndoRedo", false);
    }
};