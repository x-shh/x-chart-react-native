window.infChart = window.infChart || {};

infChart.fibRetracementsDrawing = function () {
    this.closeIcon = '<img style = "width : 15px; height : 15px;" src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDI3LjAuMCwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IgoJIHZpZXdCb3g9IjAgMCA1NzYgNTc2IiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA1NzYgNTc2OyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+CjxzdHlsZSB0eXBlPSJ0ZXh0L2NzcyI+Cgkuc3Qwe2ZpbGw6Izg2ODY4Njt9Cgkuc3Qxe2ZpbGw6I0ZGRkZGRjt9Cjwvc3R5bGU+CjxnPgoJPGcgaWQ9Imljb21vb24taWdub3JlIj4KCTwvZz4KCTxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik0yODgsMS41QzEyOS44LDEuNSwxLjUsMTI5LjgsMS41LDI4OFMxMjkuOCw1NzQuNSwyODgsNTc0LjVTNTc0LjUsNDQ2LjIsNTc0LjUsMjg4UzQ0Ni4yLDEuNSwyODgsMS41eiIvPgoJPHBhdGggY2xhc3M9InN0MSIgZD0iTTMzNC4yLDI4OGw3OS4xLTc5LjFjMTIuOC0xMi44LDEyLjgtMzMuNCwwLTQ2LjJsMCwwYy0xMi44LTEyLjgtMzMuNC0xMi44LTQ2LjIsMEwyODgsMjQxLjhsLTc5LjEtNzkuMQoJCWMtMTIuOC0xMi44LTMzLjQtMTIuOC00Ni4yLDBsMCwwYy0xMi44LDEyLjgtMTIuOCwzMy40LDAsNDYuMmw3OS4xLDc5LjFsLTc5LjEsNzkuMWMtMTIuOCwxMi44LTEyLjgsMzMuNCwwLDQ2LjJsMCwwCgkJYzEyLjgsMTIuOCwzMy40LDEyLjgsNDYuMiwwbDc5LjEtNzkuMWw3OS4xLDc5LjFjMTIuOCwxMi44LDMzLjQsMTIuOCw0Ni4yLDBsMCwwYzEyLjgtMTIuOCwxMi44LTMzLjQsMC00Ni4yTDMzNC4yLDI4OHoiLz4KPC9nPgo8L3N2Zz4K" alt="Close" />';
    infChart.drawingObject.apply(this, arguments);
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
    this.defaultDragSupporterStyles = Object.assign({}, infChart.drawingUtils.common.dragSupporterStyles, {cursor: 'pointer', type:'mainDrawing'});
    this.fibLevelDragSupporterStyles = Object.assign({}, infChart.drawingUtils.common.dragSupporterStyles, {cursor: 'pointer', type:'additionalDrawing'});
    // this.settings = {
    //    /**
    //     * on fib mode change
    //     * @param {boolean} checked - fib mode checked
    //     * @param {boolean} isPropertyChange - is propery changed
    //     */
    //    onFibModeChange: function (checked, isPropertyChange) {
    //       var self = this;
    //       var ann = self.annotation,
    //          options = ann.options;

    //       options.isContinuousMode = checked;

    //       self.scale();
    //       self.updateSettings(self.getConfig());
    //       isPropertyChange && self.onPropertyChange();
    //       if (this.settingsPopup) {
    //          this.settingsPopup.data("infUndoRedo", false);
    //       }
    //    }
    // };
};

infChart.fibRetracementsDrawing.prototype = Object.create(infChart.drawingObject.prototype);

infChart.fibRetracementsDrawing.prototype.getConfig = function () {
    var self = this,
        annotation = self.annotation,
        options = annotation.options,
        fibLevels = options.fibLevels ? options.fibLevels : self.fibLevels;
    fibLevels = infChart.drawingUtils.common.sortFibLevelsByValue(fibLevels);

    return {
        shape: 'fibRetracements',
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
        isContinuousMode: annotation.options.isContinuousMode,
        isSingleColor: annotation.options.isSingleColor,
        isSnapTopHighLow: annotation.options.isSnapTopHighLow,
        isTrendLineAlways: annotation.options.isTrendLineAlways,
        trendLineColor: annotation.options.trendLineColor,
        trendLineOpacity: annotation.options.trendLineOpacity,
        trendLineWidth: annotation.options.trendLineWidth,
        trendLineStyle: annotation.options.trendLineStyle,
        isLocked : annotation.options.isLocked

    };
};

infChart.fibRetracementsDrawing.prototype.getNearestYValue = function (isSnapTopHighLow, yValue, nearestDataPoint, chart) {
    var self = this;
    var nearestYValue = yValue;
    if(!chart){
        chart = this.annotation.chart;
    }
    var stockChartId = infChart.drawingsManager.getChartIdFromHighchartInstance(chart);
    var chartInstance = infChart.manager.getChart(stockChartId);

    var nearestYValueOpen, nearestYValueClose;
    if (chartInstance.isLog || chartInstance.isCompare) {
        nearestYValueOpen = infChart.drawingUtils.common.getYValue.call(self, nearestDataPoint.yData[1]);
        nearestYValueClose = infChart.drawingUtils.common.getYValue.call(self, nearestDataPoint.yData[2]);
    } else {
        nearestYValueOpen = nearestDataPoint.yData[1];
        nearestYValueClose = nearestDataPoint.yData[2];
    }

    if (yValue && isSnapTopHighLow) {
        if (Math.abs(yValue - nearestYValueOpen) < Math.abs(yValue - nearestYValueClose)) {
            nearestYValue = nearestDataPoint.yData[1];
        } else {
            nearestYValue = nearestDataPoint.yData[2];
        }
    }

    return nearestYValue;
};

infChart.fibRetracementsDrawing.prototype.getOptions = function (properties, chart) {
    var nearestDataForXValue = infChart.math.findNearestDataPoint(chart, properties.xValue, undefined, true, true);
    var futureValue = chart.series[0].xData[chart.series[0].xData.length-1];
    var options = {
        xValue: properties.xValue,
        yValue: properties.yValue,
        nearestXValue: nearestDataForXValue.xData,
        allowDragX: true,
        allowDragY: true,
        allowDragByHandle: true,
        shape: {
            params: {
                d: ['M', 0, 0, 'L', 0, 0]
            }
        }
    };
    var theme = infChart.drawingUtils.common.getTheme.call(this);
    var shapeTheme = theme["fibRetracements"];
    var baseFillColor = (theme.fibRetracements && theme.fibRetracements.singleFillColor) ? theme.fibRetracements.singleFillColor : (theme.fibonacci && theme.fibonacci.singleFillColor) ? theme.fibonacci.singleFillColor : infChart.drawingUtils.common.baseFillColor;
    var baseFillOpacity = (theme.fibRetracements && typeof theme.fibRetracements.fillOpacity !== "undefined") ? theme.fibRetracements.fillOpacity : (theme.fibonacci && typeof theme.fibonacci.fillOpacity !== "undefined") ? theme.fibonacci.fillOpacity : infChart.drawingUtils.common.baseFillOpacity;
    var baseBorderColor = (theme.fibRetracements && theme.fibRetracements.borderColor) ? theme.fibRetracements.borderColor : (theme.fibonacci && theme.fibonacci.borderColor) ? theme.fibonacci.borderColor : infChart.drawingUtils.common.baseBorderColor;
    var baseLineWidth = (theme.fibRetracements && typeof theme.fibRetracements.lineWidth !== "undefined") ? theme.fibRetracements.lineWidth : (theme.fibonacci && theme.fibonacci.lineWidth) ? theme.fibonacci.lineWidth : infChart.drawingUtils.common.baseLineWidth;
    var baseFontColor = (theme.fibRetracements && theme.fibRetracements.fontColor) ? theme.fibRetracements.fontColor : (theme.fibonacci && theme.fibonacci.fontColor) ? theme.fibonacci.fontColor : infChart.drawingUtils.common.baseFontColor;
    var baseFontSize = (theme.fibRetracements && theme.fibRetracements.fontSize) ? theme.fibRetracements.fontSize : (theme.fibonacci && theme.fibonacci.fontSize) ? theme.fibonacci.fontSize : infChart.drawingUtils.common.baseFontSize;
    var baseFontWeight = (theme.fibRetracements && theme.fibRetracements.fontWeight) ? theme.fibRetracements.fontWeight : (theme.fibonacci && theme.fibonacci.fontWeight) ? theme.fibonacci.fontWeight : infChart.drawingUtils.common.baseFontWeight;
    options.fillColor = properties.fillColor ? properties.fillColor : baseFillColor;
    options.fillOpacity = properties.fillOpacity ? properties.fillOpacity : baseFillOpacity;
    options.lineColor = properties.borderColor ? properties.borderColor : baseBorderColor;
    options.lineWidth = properties.strokeWidth ? properties.strokeWidth : baseLineWidth;
    options.fontColor = properties.fontColor ? properties.fontColor : baseFontColor;
    options.fontSize = properties.fontSize ? properties.fontSize : baseFontSize;
    options.fontWeight = properties.fontWeight ? properties.fontWeight : baseFontWeight;

    options.trendLineColor = properties.trendLineColor ? properties.trendLineColor : shapeTheme.stroke || "#959595";
    options.trendLineOpacity = properties.trendLineOpacity ? properties.trendLineOpacity : shapeTheme.opacity || 1;
    options.trendLineWidth = properties.trendLineWidth ? properties.trendLineWidth : baseLineWidth || 1;
    options.trendLineStyle = properties.trendLineStyle ? properties.trendLineStyle : shapeTheme.dashstyle || 'solid';

    options.shape.params.fill = options.fillColor;
    options.shape.params['fill-opacity'] = options.fillOpacity;
    options.shape.params.stroke = options.trendLineColor;
    options.shape.params.opacity =  options.trendLineOpacity;
    options.shape.params['stroke-width'] = options.trendLineWidth;
    options.shape.params.dashstyle = options.trendLineStyle;
    options.shape.params['font-color'] = options.fontColor;
    options.shape.params['font-size'] = options.fontSize;
    options.isSingleColor = typeof properties.isSingleColor !== "undefined" ? properties.isSingleColor : false;
    options.fibLevels = properties.fibLevels ? properties.fibLevels : this.fibLevels;
    options.fibLevels = infChart.drawingUtils.common.getFibLevelsWithOpacity(infChart.drawingUtils.common.sortFibLevelsByValue(options.fibLevels), baseFillOpacity);
    options.showFibModeToggle = true;
    options.isContinuousMode = typeof properties.isContinuousMode !== "undefined" ? properties.isContinuousMode : true;
    options.showSnapToHighLowToggle = true;
    options.showTrendLineAlwaysToggle = true;
    options.isSnapTopHighLow = typeof properties.isSnapTopHighLow !== "undefined" ? properties.isSnapTopHighLow : false;
    options.isTrendLineAlways = typeof properties.isTrendLineAlways !== "undefined" ? properties.isTrendLineAlways : true;
    if(futureValue >= nearestDataForXValue.xData){
        options.nearestYValue = infChart.drawingUtils.common.getYValue.call(this, this.getNearestYValue(options.isSnapTopHighLow, properties.yValue, nearestDataForXValue, chart));
    } else {
        options.nearestYValue = infChart.drawingUtils.common.getYValue.call(this, properties.yValue);
    }
    if(options.isSnapTopHighLow){
        options.yValue = options.nearestYValue;
    }

    if (properties.xValueEnd && properties.yValueEnd) {
        var nearestDataForXValueEnd = infChart.math.findNearestDataPoint(chart, properties.xValueEnd, undefined, true, true);
        options.xValueEnd = properties.xValueEnd;
        options.yValueEnd = properties.yValueEnd;
        options.nearestXValueEnd = nearestDataForXValueEnd.xData;
        if(futureValue >= nearestDataForXValueEnd.xData){
            options.nearestYValueEnd = infChart.drawingUtils.common.getYValue.call(this, this.getNearestYValue(options.isSnapTopHighLow, options.yValueEnd, nearestDataForXValueEnd, chart));
        } else {
            options.nearestYValueEnd = infChart.drawingUtils.common.getYValue.call(this, options.yValueEnd);
        }
        if(options.isSnapTopHighLow){
            options.yValueEnd = options.nearestYValueEnd;
        }
    }

    options.isRealTimeTranslation = true;
    options.validateTranslationFn = function (newXValue) {
        var annotation = this.annotation,
            chart = annotation.chart,
            options = annotation.options,
            xVal = options.xValue,
            xValEnd = options.xValueEnd,
            newXValueEnd = xValEnd - xVal + newXValue,
            xAxis = chart.xAxis[options.xAxis],
            seriesData = chart.series[0].xData,
            dataMin = seriesData[0],
            totalPoints = infChart.drawingsManager.getTotalPoints(chart),
            dataMax = totalPoints[totalPoints.length - 1];

        return (newXValue >= dataMin && newXValue <= dataMax) && (newXValueEnd >= dataMin && newXValueEnd <= dataMax) && (options.selectedDrawing == "mainDrawing");
    }

    options = infChart.Drawing.prototype.getOptions(properties,options);

    return options;
};

infChart.fibRetracementsDrawing.prototype.additionalDrawingsFunction = function () {
    var self = this,
        ann = self.annotation,
        options = ann.options,
        chart = ann.chart,
        xAxis = chart.xAxis[options.xAxis],
        yAxis = chart.yAxis[options.yAxis],
        fibLevels = options.fibLevels ? options.fibLevels : this.fibLevels,
        additionalDrawingsArr = self.additionalDrawings,
        fibonacciDrawingsArr = self.fibonacciDrawings,
        theme = infChart.drawingUtils.common.getTheme.call(this),
        drawingFillAttr,
        drawingAttr,
        labelAttribs,
        baseFillOpacity = (theme.fibRetracements && typeof theme.fibRetracements.fillOpacity !== "undefined") ? theme.fibRetracements.fillOpacity : infChart.drawingUtils.common.baseFillOpacity,
        nearestDataForXValue = infChart.math.findNearestDataPoint(chart, options.xValue, undefined, true, true),
        newX = xAxis.toPixels(nearestDataForXValue.xData) - xAxis.toPixels(options.xValue),
        futureValue = chart.series[0].xData[chart.series[0].xData.length - 1];
        var nearestYValue;
        if(futureValue >= nearestDataForXValue.xData){
            nearestYValue = infChart.drawingUtils.common.getYValue.call(this, this.getNearestYValue(options.isSnapTopHighLow, options.yValue, nearestDataForXValue));
        } else {
            nearestYValue = infChart.drawingUtils.common.getYValue.call(this, options.yValue);
        }
    var newY = yAxis.toPixels(nearestYValue) - yAxis.toPixels(options.yValue),
        baseFontColor = (theme.fibRetracements && typeof theme.fibRetracements.fontColor !== "undefined") ? theme.fibRetracements.fontColor : infChart.drawingUtils.common.baseFontColor,
        baseFontSize = (theme.fibRetracements && typeof theme.fibRetracements.fontSize !== "undefined") ? theme.fibRetracements.fontSize : infChart.drawingUtils.common.baseFontSize,
        baseFontWeight = (theme.fibRetracements && typeof theme.fibRetracements.fontWeight !== "undefined") ? theme.fibRetracements.fontWeight : infChart.drawingUtils.common.baseFontWeight,

        labelStyles = {
            'color': baseFontColor,
            fontSize: baseFontSize,
            'font-weight': baseFontWeight
        };

    additionalDrawingsArr.lines = {};
    fibonacciDrawingsArr.lines = {};
    fibonacciDrawingsArr.fill = {};
    additionalDrawingsArr.hideFibLevelButton = {};

    var hiddenLevels = [];

    // add fill objects first to avoid overlapping lines with and texts with them
    fibLevels = infChart.drawingUtils.common.sortFibLevelsByValue(fibLevels);
    fibLevels.forEach(function (fibLevel) {
        var themeFillColor = theme.fibRetracements && theme.fibRetracements.fibLevelFillColors && theme.fibRetracements.fibLevelFillColors[fibLevel.id];
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
            cursor: 'default',
            'level': fibLevel.id
        };
        var fontColor = options.isSingleColor && options.fontColor ? options.fontColor : fibLevel && fibLevel.fontColor ? fibLevel.fontColor : baseFontColor;
        var fontSize = options.isSingleColor && options.fontSize ? options.fontSize : fibLevel && fibLevel.fontSize ? fibLevel.fontSize : baseFontSize;
        var fontWeight = options.isSingleColor && options.fontWeight ? options.fontWeight : fibLevel && fibLevel.fontWeight ? fibLevel.fontWeight : baseFontWeight;

        labelStyles = {
            'color': fontColor,
            fontSize: fontSize + 'px',
            'font-weight': fontWeight
        };

        labelAttribs = {
            'level': fibLevel.id,
            'font-color': fontColor,
            'font-size': fontSize,
            'font-weight': fontWeight
        }

        fibonacciDrawingsArr.fill[fibLevel.id] = chart.renderer.path(['M', 0, 0, 'L', 0, 0, 'L', 0, 0, 'L', 0, 0]).attr(drawingFillAttr).add(ann.group);
        additionalDrawingsArr.lines[fibLevel.id] = chart.renderer.path(['M', 0, 0, 'L', 0, 0]).attr(drawingAttr).add(ann.group);
        fibonacciDrawingsArr.lines[fibLevel.id] = chart.renderer.label(infChart.drawingUtils.common.formatValue(fibLevel.value, 1), fibLevel.drawingPosX, fibLevel.drawingPosY).css(labelStyles).attr(labelAttribs).add(ann.group);
        additionalDrawingsArr.hideFibLevelButton[fibLevel.id] = chart.renderer.createElement('foreignObject').add(ann.group).attr({
            width: '20',
            height: '20',
            level: fibLevel.id,
            rel: 'hideFibLevelButton',
            cursor: 'pointer'
        });
        var labelHtml = "<div>" + self.closeIcon + "</div>";
        additionalDrawingsArr.hideFibLevelButton[fibLevel.id].element.innerHTML = labelHtml;

        $(additionalDrawingsArr.hideFibLevelButton[fibLevel.id].element).mousedown( function (event) {
            if (event.which == 1 || event.button == 0) {
                event.stopPropagation();
                setTimeout(function () {
                    var selectedLevel = event.currentTarget.getAttribute('level');
                    var chartId = infChart.drawingsManager.getChartIdFromHighchartInstance(self.annotation.chart);
                    if (selectedLevel) {
                        if (self.isVisibleLastLevel()) {
                            infChart.drawingsManager.removeDrawing(chartId, self.drawingId, undefined, true);
                        } else {
                            infChart.drawingUtils.common.settings.onFibLevelChange.call(self, selectedLevel, false, true, true);
                        }
                    }
                }, 0);
            }
        });

        additionalDrawingsArr.hideFibLevelButton[fibLevel.id].toFront();
    });

    hiddenLevels.forEach(function (id) {
        infChart.drawingUtils.common.settings.onFibLevelChange.call(self, id, false, false, true);
    });

    ann.selectionMarker = [];
    if (!options.isSnapTopHighLow) {
        newY = 0;
    }
    infChart.drawingUtils.common.addSelectionMarker.call(this, ann, newX, newY);
};

infChart.fibRetracementsDrawing.prototype.setNearestYValues = function (options, chart) {
    var self = this;
    var futureValue = chart.series[0].xData[chart.series[0].xData.length-1];

    var nearestDataForXValue = infChart.math.findNearestDataPoint(chart, options.xValue, undefined, true, true);
    if(futureValue >= nearestDataForXValue.xData){
        self.nearestYValue = self.getNearestYValue(options.isSnapTopHighLow, options.yValue, nearestDataForXValue, chart);
    } else {
        self.nearestYValue =  options.yValue;
    }

    var nearestDataForXValueEnd = infChart.math.findNearestDataPoint(chart, options.xValueEnd, undefined, true, true);
    if(futureValue >= nearestDataForXValueEnd.xData){
        self.nearestYValueEnd = self.getNearestYValue(options.isSnapTopHighLow, options.yValueEnd, nearestDataForXValueEnd, chart);
    } else {
        self.nearestYValueEnd = options.yValueEnd;
    }
};

infChart.fibRetracementsDrawing.prototype.step = function (e, isStartPoint) {
    var self = this,
        ann = self.annotation,
        options = ann.options,
        chart = ann.chart,
        stockChart = infChart.manager.getChart(infChart.manager.getContainerIdFromChart(chart.renderTo.id)),
        points = infChart.drawingUtils.common.calculateInitialPoints(e, ann, isStartPoint, 0, 0),
        plotWidth = chart.plotWidth * infChart.drawingUtils.common.correctionFactor,
        fibonacciDrawings = self.fibonacciDrawings.lines,
        fibLevels = options.fibLevels ? options.fibLevels : this.fibLevels,
        fibLevels = infChart.drawingUtils.common.sortFibLevelsByValue(fibLevels),
        fibonacciDrawingsFill = self.fibonacciDrawings.fill,
        options = ann && ann.options,
        lineDrawings = self.additionalDrawings.lines,
        fill,
        currentLine,
        currentLineP,
        nextLine,
        nextLineP,
        xAxis = chart.xAxis[options.xAxis],
        yAxis = chart.yAxis[options.yAxis],
        xValueEnd = xAxis.toValue(xAxis.toPixels(options.xValue) + points.dx),
        yValueEnd = yAxis.toValue(yAxis.toPixels(options.yValue) + points.dy),
        nearestDataForXValue = infChart.math.findNearestDataPoint(chart, options.xValue, undefined, true, true),
        nearestDataForXValueEnd = infChart.math.findNearestDataPoint(chart, xValueEnd, undefined, true, true),
        nearestXValue = nearestDataForXValue.xData,
        nearestXValueEnd = nearestDataForXValueEnd.xData,
        newX = xAxis.toPixels(nearestXValue) - xAxis.toPixels(ann.options.xValue),
        newXEnd = xAxis.toPixels(nearestXValueEnd) - xAxis.toPixels(ann.options.xValue);
        var futureValue = chart.series[0].xData[chart.series[0].xData.length-1];
        var nearestYValue, nearestYValueEnd, newY, newYEnd;

        if(options.isSnapTopHighLow){
            if(isStartPoint) {
                if(futureValue >= nearestXValue){
                    nearestYValue = infChart.drawingUtils.common.getYValue.call(this, this.getNearestYValue(options.isSnapTopHighLow, options.yValue, nearestDataForXValue));
                } else {
                    nearestYValue = infChart.drawingUtils.common.getYValue.call(this, infChart.drawingUtils.common.getBaseYValues.call(self, options.yValue));
                }
                ann.update({
                    yValue: nearestYValue
                });
                nearestYValueEnd = yValueEnd;
            } else {
                if(futureValue >= nearestXValueEnd){
                    nearestYValueEnd = infChart.drawingUtils.common.getYValue.call(this, this.getNearestYValue(options.isSnapTopHighLow, yValueEnd, nearestDataForXValueEnd));
                } else {
                    nearestYValueEnd = infChart.drawingUtils.common.getYValue.call(this, infChart.drawingUtils.common.getBaseYValues.call(self, yValueEnd));
                }
                ann.update({
                    yValueEnd: nearestYValueEnd
                });
                nearestYValue = options.yValue;
            }
        } else {
            nearestYValue = options.yValue;
            nearestYValueEnd = yValueEnd;
        }

        newYEnd = yAxis.toPixels(nearestYValueEnd) - yAxis.toPixels(nearestYValue);
        var line = ["M", newX, 0, 'L', parseInt(newXEnd, 10), parseInt(newYEnd, 10)];

    ann.shape.attr({
        d: line
    });

    $.each(this.additionalDrawings.lines, function (key, value) {
        var fibLevel = fibLevels.find(function (level) {
            return level.id === key;
        });
        var percentage = parseFloat(fibLevel.value);
        var percentageY = -((yAxis.toPixels(nearestYValueEnd) - yAxis.toPixels(nearestYValue)) * percentage / 100) + newYEnd;
        var lineStartPosition = points.dx > 0 && !options.isContinuousMode ? newX : newXEnd;
        //var lineEndPosition = options.isContinuousMode ? (xAxis.width - xAxis.toPixels(ann.options.xValue)) : points.dx > 0 ? newXEnd : newX;
        var lineEndPosition = xAxis.width - xAxis.toPixels(ann.options.xValue);
        var drawingLabel = fibonacciDrawings[key];
        var hideFibLevelButton = self.additionalDrawings.hideFibLevelButton[key];
        var labelStartPosition = lineEndPosition;
        var line = ["M", lineStartPosition, percentageY, 'L', lineEndPosition, percentageY];

        value.attr({
            d: line
        });

        var percentageValue = percentage / 100;
        var labelYValue = nearestYValueEnd > nearestYValue ? nearestYValueEnd - (nearestYValueEnd - nearestYValue) * percentageValue : nearestYValueEnd + (nearestYValue - nearestYValueEnd) * percentageValue;
        fibLevel.labelYValue = labelYValue;

        if (options.isContinuousMode) {
            drawingLabel.textSetter(self.getFormattedLabel(yAxis, nearestYValue, nearestYValueEnd, percentage, stockChart));
        }

        self.positionHideIcon(hideFibLevelButton, labelStartPosition, drawingLabel, percentageY);

        drawingLabel.attr({
            x: labelStartPosition - drawingLabel.width ,
            y: percentageY - drawingLabel.height
        });
    });

    fibLevels.forEach(function (value, index, arr) {
        fill = fibonacciDrawingsFill && fibonacciDrawingsFill[value.id];
        currentLine = lineDrawings[value.id];
        currentLineP = currentLine && currentLine.d.split(' ');

        for (var i = index + 1; i < arr.length; i++) {
            var lineTemp = self.additionalDrawings.lines[arr[i].id];
            if (lineTemp && lineTemp.visibility != "hidden") {
                nextLine = lineTemp;
                break;
            }
        }
        nextLineP = nextLine && nextLine.d.split(' ');
        if (currentLine && nextLine) {
            fill.attr({
                d: ['M', currentLineP[1], currentLineP[2], 'L', currentLineP[4], currentLineP[5], 'L', nextLineP[4], nextLineP[5], 'L', nextLineP[1], nextLineP[2], 'L', currentLineP[1], currentLineP[2]]
            });
        }
        nextLine = undefined;
    });

    return {
        line: line,
        points: points,
        nearestXValue: nearestXValue,
        nearestXValueEnd: nearestXValueEnd,
        nearestYValue: nearestYValue,
        nearestYValueEnd: nearestYValueEnd
    };
};

infChart.fibRetracementsDrawing.prototype.stop = function (e, isStartPoint) {
    var self = this,
        ann = self.annotation,
        options = ann.options,
        chart = ann.chart,
        lineData = this.stepFunction(e, isStartPoint),
        line = lineData.line,
        xAxis = chart.xAxis[ann.options.xAxis],
        yAxis = chart.yAxis[ann.options.yAxis],
        x = xAxis.toValue(lineData.points.dx + xAxis.toPixels(ann.options.xValue)),
        y = yAxis.toValue(line[5] + yAxis.toPixels(ann.options.yValue));

        // if (options.isSnapTopHighLow) {
        //     //line[2] = 0;
        //     if (!isStartPoint) {
        //         line[5] = yAxis.toPixels(lineData.nearestYValueEnd) - yAxis.toPixels(options.yValue);
        //     } else {
        //         line[5] = yAxis.toPixels(lineData.nearestYValueEnd) - yAxis.toPixels(lineData.nearestYValue);
        //     }

        //     ann.update({
        //         xValueEnd: x,
        //         yValue:  (!isStartPoint) ? (options.yValue) : lineData.nearestYValue,
        //         yValueEnd: (!isStartPoint) ? lineData.nearestYValueEnd : (options.yValueEnd),
        //         nearestXValue: lineData.nearestXValue,
        //         nearestXValueEnd: lineData.nearestXValueEnd,
        //         nearestYValue: (!isStartPoint) ? (options.yValue) : lineData.nearestYValue,
        //         nearestYValueEnd: (!isStartPoint) ? lineData.nearestYValueEnd : (options.yValueEnd),
        //         shape: {
        //             params: {
        //                 d: line
        //             }
        //         }
        //     });
        //     self.scale();
        // } else {
            ann.update({
                xValueEnd: x,
                yValue:  lineData.nearestYValue,
                yValueEnd: lineData.nearestYValueEnd,
                nearestXValue: lineData.nearestXValue,
                nearestXValueEnd: lineData.nearestXValueEnd,
                shape: {
                    params: {
                        d: line
                    }
                }
            });
        // }

    infChart.drawingUtils.common.saveBaseYValues.call(this, ann.options.yValue, ann.options.yValueEnd);
    // infChart.drawingUtils.common.saveNearestBaseYValues.call(this, ann.options.nearestYValue, ann.options.nearestYValueEnd);
    infChart.drawingUtils.common.removeDragSupporters.call(self, self.dragSupporters);
    infChart.drawingUtils.common.addDragSupporters.call(self, ann, chart, line, self.dragSupporters, undefined, self.defaultDragSupporterStyles);

    $.each(self.additionalDrawings.lines, function (key, value) {
        if(value.visibility !== 'hidden'){
            var line = value.d.split(' ');
            var customAttributes = {
                'level' : key,
                'stroke-width': 10
            }            
            infChart.drawingUtils.common.addDragSupporters.call(self, ann, chart, ['M', line[1], line[2], 'L', line[4], line[5]], self.dragSupporters, customAttributes, self.fibLevelDragSupporterStyles);
        }
    });
    self.highlightEachLine();

    infChart.drawingUtils.common.fixSelectionMarker.call(self, ann);
    infChart.drawingUtils.common.onPropertyChange.call(this);
};

infChart.fibRetracementsDrawing.prototype.scale = function (isCalculateNewValueForScale) {
    var self = this,
        ann = self.annotation,
        chart = ann.chart,
        stockChart,
        options = ann.options,
        line = ann.shape.d.split(' '),
        xAxis = chart.xAxis[options.xAxis],
        yAxis = chart.yAxis[options.yAxis],
        plotWidth = chart.plotWidth * infChart.drawingUtils.common.correctionFactor,
        fibonacciDrawings = self.fibonacciDrawings.lines,
        fibLevels = options.fibLevels ? options.fibLevels : this.fibLevels,
        fibLevels = infChart.drawingUtils.common.sortFibLevelsByValue(fibLevels),
        fibonacciDrawingsFill = self.fibonacciDrawings.fill,
        lineDrawings = self.additionalDrawings.lines,
        stockChartId = infChart.drawingsManager.getChartIdFromHighchartInstance(chart),
        chartInstance = infChart.manager.getChart(stockChartId),
        fill,
        currentLine,
        currentLineP,
        nextLine,
        nextLineId,
        nextLineP,
        xValueInPixels = xAxis.toPixels(options.xValue),
        yValueInPixels = yAxis.toPixels(options.yValue),
        stockChart = infChart.manager.getChart(infChart.manager.getContainerIdFromChart(chart.renderTo.id)),
        fibLevelLines = {};

    if(isCalculateNewValueForScale){
        var futureValue = chart.series[0].xData[chart.series[0].xData.length - 1];
        var nearestDataForXValue = infChart.math.findNearestDataPoint(chart, options.xValue, undefined, true, true);
        var nearestDataForXValueEnd = infChart.math.findNearestDataPoint(chart, options.xValueEnd, undefined, true, true);
        
        options.nearestXValue = nearestDataForXValue.xData;
        options.nearestXValueEnd = nearestDataForXValueEnd.xData;

        // if (options.isSnapTopHighLow) {
        //     if(futureValue >= options.nearestXValue){
        //         options.nearestYValue = infChart.drawingUtils.common.getYValue.call(self, self.getNearestYValue(options.isSnapTopHighLow, options.yValue, nearestDataForXValue));
        //     } else {
        //         options.nearestYValue = infChart.drawingUtils.common.getYValue.call(self, infChart.drawingUtils.common.getBaseYValues.call(self, options.yValue));
        //     }
        //     if(futureValue >= options.nearestXValueEnd){
        //         options.nearestYValueEnd = infChart.drawingUtils.common.getYValue.call(self, self.getNearestYValue(options.isSnapTopHighLow, options.yValueEnd, nearestDataForXValueEnd));
        //     } else {
        //         options.nearestYValueEnd = infChart.drawingUtils.common.getYValue.call(self, infChart.drawingUtils.common.getBaseYValues.call(self, options.yValueEnd));
        //     }
        // } else {
        //     if(futureValue >= options.nearestXValue){
        //         options.nearestYValue =  this.getNearestYValue(options.isSnapTopHighLow, options.yValue, nearestDataForXValue);
        //     } else {
        //         options.nearestYValue = options.yValue;
        //     }

        //     if(futureValue >= options.nearestXValue){
        //         options.nearestYValueEnd = this.getNearestYValue(options.isSnapTopHighLow, options.yValueEnd, nearestDataForXValueEnd);
        //     } else {
        //         options.nearestYValueEnd = options.yValueEnd;
        //     }
        // }

        // if (chartInstance.isLog || chartInstance.isCompare) {
        //     self.nearestYValue = infChart.drawingUtils.common.getBaseYValue.call(self, options.nearestYValue);
        //     self.nearestYValueEnd = infChart.drawingUtils.common.getBaseYValue.call(self, options.nearestYValueEnd);
        // } else {
        //     self.nearestYValue = options.nearestYValue;
        //     self.nearestYValueEnd = options.nearestYValueEnd;
        // }

        ann.update({
            nearestXValue: nearestDataForXValue.xData,
            nearestXValueEnd: nearestDataForXValueEnd.xData
            // nearestYValue : options.nearestYValue,
            // nearestYValueEnd: options.nearestYValueEnd
        });
    } 

    var yValueEndInPixels = yAxis.toPixels(options.yValueEnd),
        newX = xAxis.toPixels(options.nearestXValue) - xValueInPixels,
        newXEnd = xAxis.toPixels(options.nearestXValueEnd) - xValueInPixels,
        newY = yAxis.toPixels(options.yValue) - yValueInPixels,
        newYEnd = yValueEndInPixels - yValueInPixels;

    line[1] = (!isNaN(newX) && newX) || 0;
    line[2] = (!isNaN(newY) && newY) || 0;
    line[4] = (!isNaN(newXEnd) && newXEnd) || 0;
    line[5] = (!isNaN(newYEnd) && newYEnd) || 0;

    ann.update({
        shape: {
            params: {
                d: line
            }
        }
    });

    infChart.drawingUtils.common.removeDragSupporters.call(self, self.dragSupporters);
    if (ann.shape.visibility !== "hidden") {
        infChart.drawingUtils.common.addDragSupporters.call(self, ann, chart, line, self.dragSupporters, undefined, self.defaultDragSupporterStyles);
    }

    var dx = line[4], dy = line[5];
    var lineStartPosition = dx > 0 && !options.isContinuousMode ? newX : newXEnd;
    var lineEndPosition = xAxis.width - xValueInPixels,
        lineWidthInPixels = yValueEndInPixels - yAxis.toPixels(options.yValue);

    $.each(this.additionalDrawings.lines, function (key, value) {
        var fibLevel = fibLevels.find(function (level) {
            return level.id === key;
        });
        var percentage = parseFloat(fibLevel.value);
        var percentageY = -(lineWidthInPixels * percentage / 100) + dy;
        //var lineEndPosition = options.isContinuousMode && xAxis.toValue(xAxis.width) > Math.min(options.xValue, options.xValueEnd) ? (xAxis.width - xAxis.toPixels(ann.options.xValue)) : dx > 0 ? newXEnd : newX;
        var drawingLabel = fibonacciDrawings[key];
        //var labelBBox = drawingLabel.getBBox();
        var labelStartPosition = lineEndPosition;
        var line = ["M", lineStartPosition, percentageY, 'L', lineEndPosition, percentageY];
        fibLevelLines[key] = line;

        value.attr({
            d: line
        });

        var percentageValue = percentage / 100;
        var labelYValue = options.yValueEnd > options.yValue ? options.yValueEnd - (options.yValueEnd - options.yValue) * percentageValue : options.yValueEnd + (options.yValue - options.yValueEnd) * percentageValue;
        fibLevel.labelYValue = labelYValue;

        if (options.isContinuousMode) {
            drawingLabel.textSetter(self.getFormattedLabel(yAxis, options.yValue, options.yValueEnd, percentage, stockChart));
        } else {
            drawingLabel.textSetter(infChart.drawingUtils.common.formatValue(fibLevel.value, 1));
        }

        drawingLabel.attr({
            x: labelStartPosition - drawingLabel.width,
            y: percentageY - drawingLabel.height
        });

        if(chart.selectedAnnotation && chart.selectedAnnotation.options.id === options.id) {
            self.positionHideIcon(self.additionalDrawings.hideFibLevelButton[key], labelStartPosition, drawingLabel, percentageY);
        }

        if(value.visibility !== 'hidden'){
            var customAttributes = {
                'level' : key,
                'stroke-width': 10
            }
            infChart.drawingUtils.common.addDragSupporters.call(self, ann, chart, ['M', line[1], line[2], 'L', line[4], line[5]], self.dragSupporters, customAttributes, self.fibLevelDragSupporterStyles);
        }
    });
    self.highlightEachLine();

    options.fibLevels = fibLevels;

    fibLevels.forEach(function (value, index, arr) {
        fill = fibonacciDrawingsFill && fibonacciDrawingsFill[value.id];
        currentLine = lineDrawings[value.id];
        currentLineP = currentLine && fibLevelLines[value.id];

        for (var i = index + 1; i < arr.length; i++) {
            var lineTemp = self.additionalDrawings.lines[arr[i].id];
            if (lineTemp && lineTemp.visibility != "hidden") {
                nextLine = lineTemp;
                nextLineId = arr[i].id;
                break;
            }
        }
        nextLineP = nextLine && fibLevelLines[nextLineId];
        if (currentLine && nextLine) {
            fill.attr({
                d: ['M', currentLineP[1], currentLineP[2], 'L', currentLineP[4], currentLineP[5], 'L', nextLineP[4], nextLineP[5], 'L', nextLineP[1], nextLineP[2], 'L', currentLineP[1], currentLineP[2]]
            });
        }
        nextLine = undefined;
    });
};

infChart.fibRetracementsDrawing.prototype.select = function(event){
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

infChart.fibRetracementsDrawing.prototype.translate = function (e) {
    var self = this,
        ann = self.annotation,
        chart = ann.chart,
        stockChart = infChart.manager.getChart(infChart.manager.getContainerIdFromChart(chart.renderTo.id)),
        options = ann.options,
        line = ann.shape.d.split(' '),
        xAxis = chart.xAxis[options.xAxis],
        yAxis = chart.yAxis[options.yAxis],
        fibonacciDrawings = this.fibonacciDrawings.lines,
        fibLevels = options.fibLevels ? options.fibLevels : this.fibLevels,
        fibLevels = infChart.drawingUtils.common.sortFibLevelsByValue(fibLevels),
        fibonacciDrawingsFill = this.fibonacciDrawings.fill,
        lineDrawings = self.additionalDrawings.lines,
        fill,
        currentLine,
        currentLineP,
        nextLine,
        nextLineP;

    $.each(this.additionalDrawings.lines, function (key, value) {
        var fibLevel = fibLevels.find(function (level) {
            return level.id === key;
        });
        var percentage = parseFloat(fibLevel.value);
        var line = value.d.split(' ');
        var drawingLabel = fibonacciDrawings[key];
        var hideFibLevelButton = self.additionalDrawings.hideFibLevelButton[key];
        var lineEndPosition = xAxis.width - xAxis.toPixels(ann.options.xValue);
        var newLine = ["M", line[1], line[2], 'L', lineEndPosition, line[5]];

        value.attr({
            d: newLine
        });

        if (options.isContinuousMode) {
            drawingLabel.textSetter(self.getFormattedLabel(yAxis, options.yValue, options.yValueEnd, percentage, stockChart));
        }

        var labelStartPosition = lineEndPosition - drawingLabel.width;

        drawingLabel.attr({
            x: labelStartPosition,
            y: line[2] - drawingLabel.height
        });

        self.positionHideIcon(hideFibLevelButton, labelStartPosition, drawingLabel, line[2]);

    });

    fibLevels.forEach(function (value, index, arr) {
        fill = fibonacciDrawingsFill && fibonacciDrawingsFill[value.id];
        currentLine = lineDrawings[value.id];
        currentLineP = currentLine && currentLine.d.split(' ');

        for (var i = index + 1; i < arr.length; i++) {
            var lineTemp = self.additionalDrawings.lines[arr[i].id];
            if (lineTemp && lineTemp.visibility != "hidden") {
                nextLine = lineTemp;
                break;
            }
        }
        nextLineP = nextLine && nextLine.d.split(' ');
        if (currentLine && nextLine) {
            fill.attr({
                d: ['M', currentLineP[1], currentLineP[2], 'L', currentLineP[4], currentLineP[5], 'L', nextLineP[4], nextLineP[5], 'L', nextLineP[1], nextLineP[2], 'L', currentLineP[1], currentLineP[2]]
            });
        }
        nextLine = undefined;
    });
    self.toggleFibLevelEraseIcon(true);
};

infChart.fibRetracementsDrawing.prototype.translateEnd = function () {
    var self = this,
    ann = self.annotation,
    chart = ann.chart,
    stockChart = infChart.manager.getChart(infChart.manager.getContainerIdFromChart(chart.renderTo.id)),
    options = ann.options,
    line = ann.shape.d.split(' '),
    xAxis = chart.xAxis[options.xAxis],
    yAxis = chart.yAxis[options.yAxis],
    fibonacciDrawings = this.fibonacciDrawings.lines,
    fibLevels = options.fibLevels ? options.fibLevels : this.fibLevels,
    fibLevels = infChart.drawingUtils.common.sortFibLevelsByValue(fibLevels),
    fibonacciDrawingsFill = this.fibonacciDrawings.fill,
    lineDrawings = self.additionalDrawings.lines,
    fill,
    currentLine,
    currentLineP,
    nextLine,
    nextLineP,
    futureValue = chart.series[0].xData[chart.series[0].xData.length - 1],
    nearestDataForXValue = infChart.math.findNearestDataPoint(chart, options.xValue, undefined, true, true),
    nearestDataForXValueEnd = infChart.math.findNearestDataPoint(chart, options.xValueEnd, undefined, true, true),
    nearestXValue = nearestDataForXValue.xData,
    nearestXValueEnd = nearestDataForXValueEnd.xData;
    // newX = xAxis.toPixels(nearestXValue) - xAxis.toPixels(options.xValue),
    // newXEnd = xAxis.toPixels(nearestXValueEnd) - xAxis.toPixels(options.xValue);

    var nearestYValue = options.yValue,
        nearestYValueEnd = options.yValueEnd;
    // if(futureValue >= nearestXValue){
    //     nearestYValue = infChart.drawingUtils.common.getYValue.call(this, this.getNearestYValue(false, options.yValue, nearestDataForXValue));
    // } else {
    //     nearestYValue = infChart.drawingUtils.common.getYValue.call(this, infChart.drawingUtils.common.getBaseYValues.call(this, options.yValue));
    // }

    // if(futureValue >= nearestXValueEnd){
    //     nearestYValueEnd = infChart.drawingUtils.common.getYValue.call(this, this.getNearestYValue(false, options.yValueEnd, nearestDataForXValueEnd));
    // } else {
    //     nearestYValueEnd = infChart.drawingUtils.common.getYValue.call(this, infChart.drawingUtils.common.getBaseYValues.call(this, options.yValueEnd));
    // }

    // if(options.isSnapTopHighLow){
    //     var newX = xAxis.toPixels(nearestXValue) - xAxis.toPixels(nearestXValue),
    //         newXEnd = xAxis.toPixels(nearestXValueEnd) - xAxis.toPixels(nearestXValue),
    //         newY = yAxis.toPixels(nearestYValue) - yAxis.toPixels(nearestYValue),
    //         newYEnd = yAxis.toPixels(nearestYValueEnd) - yAxis.toPixels(nearestYValue);

    //     var mainLine = ["M", newX, newY, 'L', parseInt(newXEnd, 10), parseInt(newYEnd, 10)];

    //     ann.update({
    //         xValue: nearestXValue,
    //         xValueEnd: nearestXValueEnd,
    //         yValue: nearestYValue,
    //         yValueEnd: nearestYValueEnd,
    //         nearestXValue: nearestXValue,
    //         nearestXValueEnd: nearestXValueEnd,
    //         nearestYValue: nearestYValue,
    //         nearestYValueEnd: nearestYValueEnd,
    //         shape: {
    //             params: {
    //                 d: mainLine
    //             }
    //         }
    //     });
    // } else {

        var newX = xAxis.toPixels(nearestXValue) - xAxis.toPixels(nearestXValue),
            newXEnd = xAxis.toPixels(nearestXValueEnd) - xAxis.toPixels(nearestXValue),
            // newY = yAxis.toPixels(nearestYValue) - yAxis.toPixels(options.yValue),
            newYEnd = yAxis.toPixels(options.yValueEnd) - yAxis.toPixels(options.yValue);

        var mainLine = ["M", newX, 0, 'L', parseInt(newXEnd, 10), parseInt(newYEnd, 10)];

        ann.update({
            xValue: nearestXValue,
            xValueEnd: nearestXValueEnd,
            nearestXValue: nearestXValue,
            nearestXValueEnd: nearestXValueEnd,
            // nearestYValue: nearestYValue,
            // nearestYValueEnd: nearestYValueEnd,
            shape: {
                params: {
                    d: mainLine
                }
            }
        });
    //}

    infChart.drawingUtils.common.removeDragSupporters.call(self, self.dragSupporters);
    infChart.drawingUtils.common.addDragSupporters.call(self, ann, chart, mainLine, self.dragSupporters, undefined, self.defaultDragSupporterStyles);

    $.each(this.additionalDrawings.lines, function (key, value) {
        var fibLevel = fibLevels.find(function (level) {
            return level.id === key;
        });
        var percentage = parseFloat(fibLevel.value);
        var percentageY = -((yAxis.toPixels(nearestYValueEnd) - yAxis.toPixels(nearestYValue)) * percentage / 100) + mainLine[5];
        var drawingLabel = fibonacciDrawings[key];
        var hideFibLevelButton = self.additionalDrawings.hideFibLevelButton[key];
        var lineStartPosition = line[4] > 0 && !options.isContinuousMode ? newX : newXEnd;
        //var lineEndPosition = options.isContinuousMode ? xAxis.width - xAxis.toPixels(ann.options.xValue) : line[4] > 0 ? newXEnd : newX;
        var lineEndPosition = xAxis.width - xAxis.toPixels(ann.options.xValue);
        var newLine = ["M", lineStartPosition, percentageY, 'L', lineEndPosition, percentageY];

        value.attr({
            d: newLine
        });

        var percentageValue = percentage / 100;
        var labelYValue = nearestYValueEnd > nearestYValue ? nearestYValueEnd - (nearestYValueEnd - nearestYValue) * percentageValue : nearestYValueEnd + (nearestYValue - nearestYValueEnd) * percentageValue;
        fibLevel.labelYValue = labelYValue;

        if (options.isContinuousMode) {
            drawingLabel.textSetter(self.getFormattedLabel(yAxis, nearestYValue, nearestYValueEnd, percentage, stockChart));
        }

        var labelStartPosition = lineEndPosition - drawingLabel.width;

        drawingLabel.attr({
            x: labelStartPosition,
            y: percentageY - drawingLabel.height
        });

        self.positionHideIcon(hideFibLevelButton, labelStartPosition, drawingLabel, percentageY);

        if(value.visibility !== 'hidden'){
            var customAttributes = {
                'level' : key,
                'stroke-width': 10
            }
            infChart.drawingUtils.common.addDragSupporters.call(self, ann, chart, newLine, self.dragSupporters, customAttributes, self.fibLevelDragSupporterStyles);
        }
    });

    fibLevels.forEach(function (value, index, arr) {
        fill = fibonacciDrawingsFill && fibonacciDrawingsFill[value.id];
        currentLine = lineDrawings[value.id];
        currentLineP = currentLine && currentLine.d.split(' ');

        for (var i = index + 1; i < arr.length; i++) {
            var lineTemp = self.additionalDrawings.lines[arr[i].id];
            if (lineTemp && lineTemp.visibility != "hidden") {
                nextLine = lineTemp;
                break;
            }
        }
        nextLineP = nextLine && nextLine.d.split(' ');
        if (currentLine && nextLine) {
            fill.attr({
                d: ['M', currentLineP[1], currentLineP[2], 'L', currentLineP[4], currentLineP[5], 'L', nextLineP[4], nextLineP[5], 'L', nextLineP[1], nextLineP[2], 'L', currentLineP[1], currentLineP[2]]
            });
        }
        nextLine = undefined;
    });

    //self.scale();
    self.highlightEachLine();
    self.selectAndBindResize();
    chart.selectedAnnotation = ann;
    options.selectedDrawing = undefined;
    self.toggleFibLevelEraseIcon(false);
    // infChart.drawingUtils.common.saveNearestBaseYValues.call(this, ann.options.nearestYValue, ann.options.nearestYValueEnd);
    if (!ann.chart.isContextMenuOpen) {
        self.showQuickDrawingSettings();
    }
    infChart.drawingUtils.common.onPropertyChange.call(this);
};

// infChart.fibRetracementsDrawing.prototype.bindFibSettingsEvents = function () {
//     var self = this;
//     var onFibModeChange = function (checked, isPropertyChange) {
//         self.onFibModeChange.call(self, checked, isPropertyChange);
//     };

//     var onChangeSnapToHighLow = function (checked, isPropertyChange) {
//         self.onChangeSnapToHighLow.call(self, checked, isPropertyChange);
//     };

//     var onTrendLineToggleShow = function (show) {
//         var isPropertyChange = true;
//         if (self.settingsPopup) {
//             isPropertyChange = self.isSettingsPropertyChange();
//         }
//         self.onTrendLineToggleShow.call(self, show, isPropertyChange);
//     };

//     return infChart.drawingUtils.common.bindFibSettingsEvents.call(this, infChart.drawingUtils.common.baseBorderColor, infChart.drawingUtils.common.baseLineWidth,
//         undefined, onFibModeChange, onChangeSnapToHighLow, onTrendLineToggleShow);
// };

infChart.fibRetracementsDrawing.prototype.bindSettingsEvents = function () {
    var self = this;
    var onFibModeChange = function (checked, isPropertyChange) {
        this.onFibModeChange.call(self, checked, isPropertyChange);
    };
    var onChangeSnapToHighLow = function (checked, isPropertyChange) {
        self.onChangeSnapToHighLow.call(self, checked, isPropertyChange);
    };

    var onTrendLineToggleShow = function (show) {
        var isPropertyChange = true;
        if (self.settingsPopup) {
            isPropertyChange = self.isSettingsPropertyChange();
        }
        self.onTrendLineToggleShow.call(self, show, isPropertyChange);
    };

    return infChart.drawingUtils.common.bindFibSettingsEvents.call(this, infChart.drawingUtils.common.baseBorderColor, infChart.drawingUtils.common.baseLineWidth,
        undefined, onFibModeChange, onChangeSnapToHighLow, onTrendLineToggleShow);
};

infChart.fibRetracementsDrawing.prototype.deselect = function (isMouseOut) {
    infChart.drawingUtils.common.onDeselect.call(this);
    this.annotation.options.selectedDrawing = undefined;
    if (isMouseOut) {
        if(this.annotation.options && !this.annotation.options.isTrendLineAlways){
            this.annotation.shape.hide();
            this.resetDragSupporters();
        }
        this.toggleFibLevelEraseIcon(true);
    }
};

infChart.fibRetracementsDrawing.prototype.toggleFibLevelEraseIcon = function (hide) {
    var self = this,
        ann = self.annotation,
        options = ann.options,
        fibonacciDrawings = self.fibonacciDrawings.lines,
        chart = ann.chart,
        xAxis = chart.xAxis[options.xAxis];

    if (hide) {
        $.each(self.additionalDrawings.hideFibLevelButton, function (key, value) {
            var hideFibLevelButton = self.additionalDrawings.hideFibLevelButton[key];
            hideFibLevelButton.hide();
        });
    } else {
        $.each(self.additionalDrawings.lines, function (key, value) {
            if (self.additionalDrawings.lines[key].visibility !== "hidden") {
                var hideFibLevelButton = self.additionalDrawings.hideFibLevelButton[key];
                var drawingLabel = fibonacciDrawings[key];
                var labelStartPosition = (xAxis.width - xAxis.toPixels(ann.options.xValue));

                self.positionHideIcon(hideFibLevelButton, labelStartPosition, drawingLabel, value.d.split(' ')[5]);
                hideFibLevelButton.show();
            }
        });
    }
};

infChart.fibRetracementsDrawing.prototype.getContextMenuOptions = function (chartId, drawingId, options, event) {
    var self = this;
    var selectedLevel;

    selectedLevel = event.target.getAttribute('level');
    if(!selectedLevel && event.target.parentElement){
        selectedLevel = event.target.parentElement.getAttribute('level');
        if(!selectedLevel && event.target.parentElement.parentElement){
            selectedLevel = event.target.parentElement.parentElement.getAttribute('level');
        }
    }
    var contextMenu = {
        "copyToClipboard" : {
            icon : options.copyToClipboard.icon,
            displayText : options.copyToClipboard.displayText,
            action : function () {
                if(selectedLevel) {
                  infChart.drawingUtils.common.onFibLevelCopy.call(self, selectedLevel);
                }
            }
        }
    };

    if (!self.isVisibleLastLevel()) {
        var eraseThis = {
            icon: options.erase.icon,
            displayText: options.erase.displayText,
            action: function () {
                if (selectedLevel) {
                    infChart.drawingUtils.common.settings.onFibLevelChange.call(self, selectedLevel, false, true, true);
                }
            }
        }
        contextMenu["eraseThis"] = eraseThis;
    }
    if (selectedLevel) {
        contextMenu = Object.assign(contextMenu, infChart.drawingUtils.common.getContextMenuOptions(chartId, drawingId, options));
        return infChart.drawingUtils.common.reorderContextMenu(contextMenu);
     } else {
        return infChart.drawingUtils.common.getContextMenuOptions(chartId, drawingId, options);
     }
};

infChart.fibRetracementsDrawing.prototype.getFormattedLabel = function (yAxis, yValue, yValueEnd, percentage, stockChart) {
    var percentageValue = percentage / 100;
    var labelYValue = yValueEnd > yValue ? yValueEnd - (yValueEnd - yValue) * percentageValue : yValueEnd + (yValue - yValueEnd) * percentageValue;
    var formatedLabelYValue = stockChart.formatValue(labelYValue, stockChart.getMainSeries().options.dp, undefined, false, false, NO_OF_SPECIFIC_DECIMAL_POINTS);
    return formatedLabelYValue + ((percentageValue === 0 || percentageValue === 1) ? " " : percentageValue < 1 ? "Ret" : "EX") + " " + infChart.drawingUtils.common.formatValue(percentageValue, 3);
};

infChart.fibRetracementsDrawing.prototype.getQuickSettingsPopup = function () {
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

infChart.fibRetracementsDrawing.prototype.getSettingsPopup = function () {
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
        showFibModeToggle: options.showFibModeToggle,
        fibModeLabel: "Continuous Mode",
        showSnapToHighLowToggle: options.showSnapToHighLowToggle,
        templates: self.getDrawingTemplates(),
        userDefaultSettings: self.getUserDefaultSettings(),
        showTrendLineAlwaysToggle: options.showTrendLineAlwaysToggle,
        trendLineColor: options.trendLineColor,
        trendLineOpacity: options.trendLineOpacity,
        trendLineWidth: options.trendLineWidth,
        trendLineStyle: options.trendLineStyle
    }

    return infChart.drawingUtils.common.getFibSettings(properties);
};

/**
 * on fib mode change
 * @param {boolean} checked - fib mode checked
 * @param {boolean} isPropertyChange - is propery changed
 * @param {boolean} ignoreSettingsSave - this is to indicate to this change does not affect to subsequent drawing
 */
infChart.fibRetracementsDrawing.prototype.onFibModeChange = function (checked, isPropertyChange, ignoreSettingsSave) {
    var self = this;
    var ann = self.annotation,
        options = ann.options;

    options.isContinuousMode = checked;

    self.scale();
    self.updateSettings(self.getConfig());
    isPropertyChange && self.onPropertyChange();
    if (this.settingsPopup) {
        this.settingsPopup.data("infUndoRedo", false);
    }
};

/**
 * on snap to high/low change
 * @param {boolean} checked - snap to high/low checked
 * @param {boolean} isPropertyChange - is propery changed
 * @param {boolean} ignoreSettingsSave - this is to indicate to this change does not affect to subsequent drawing
 */
infChart.fibRetracementsDrawing.prototype.onChangeSnapToHighLow = function (checked, isPropertyChange, ignoreSettingsSave) {
    var self = this,
        ann = self.annotation,
        options = ann.options,
        chart = ann.chart;
        // xAxis = chart.xAxis[options.xAxis],
        // yAxis = chart.yAxis[options.yAxis],
        // futureValue = chart.series[0].xData[chart.series[0].xData.length - 1];

    options.isSnapTopHighLow = checked;

    // if (options.isSnapTopHighLow) {
    //     var nearestDataForXValue = infChart.math.findNearestDataPoint(chart, options.xValue, undefined, true, true),
    //         nearestDataForXValueEnd = infChart.math.findNearestDataPoint(chart, options.xValueEnd, undefined, true, true);

    //     if(futureValue >= nearestDataForXValue.xData){
    //         options.nearestYValue = infChart.drawingUtils.common.getYValue.call(this, self.getNearestYValue(options.isSnapTopHighLow, options.yValue, nearestDataForXValue));
    //     } else {
    //         options.nearestYValue = infChart.drawingUtils.common.getYValue.call(this, infChart.drawingUtils.common.getBaseYValues.call(self, options.yValue));
    //     }
    //     if(futureValue >= nearestDataForXValueEnd.xData){
    //         options.nearestYValueEnd = infChart.drawingUtils.common.getYValue.call(this, self.getNearestYValue(options.isSnapTopHighLow, options.yValueEnd, nearestDataForXValueEnd));
    //     } else {
    //         options.nearestYValueEnd = infChart.drawingUtils.common.getYValue.call(this, infChart.drawingUtils.common.getBaseYValues.call(self, options.yValueEnd));
    //     }
    // } else {
    //     options.nearestYValue = options.yValue;
    //     options.nearestYValueEnd = options.yValueEnd;
    // }

    //infChart.drawingUtils.common.saveNearestBaseYValues.call(this, ann.options.nearestYValue, ann.options.nearestYValueEnd);

    // self.scale();
    // self.selectAndBindResize();
    // chart.selectedAnnotation = ann;
    // self.updateSettings(self.getConfig());
    isPropertyChange && self.onPropertyChange();

    if (this.settingsPopup) {
        this.settingsPopup.data("infUndoRedo", false);
    }
};

infChart.fibRetracementsDrawing.prototype.selectAndBindResize = function () {
    var ann = this.annotation,
        pathDefinition, width, height;

    ann.events.deselect.call(ann);
    ann.shape.show();
    this.toggleFibLevelEraseIcon(false);
    ann.selectionMarker = [];
    pathDefinition = ann.shape.d.split(' ');
    width = parseFloat(pathDefinition[4]);
    height = parseFloat(pathDefinition[5]);

    this.resetDragSupporters();
    if (!isNaN(width) && !isNaN(height)) {
        infChart.drawingUtils.common.addAndBindSelectionMarker.call(this, ann, parseFloat(pathDefinition[1]), parseFloat(pathDefinition[2]), this.stepFunction, this.stop, true);
        infChart.drawingUtils.common.addAndBindSelectionMarker.call(this, ann, width, height, this.stepFunction, this.stop, false);
    }
};

infChart.fibRetracementsDrawing.prototype.positionHideIcon = function (hideFibLevelButton, labelStartPosition, drawingLabel, percentageY) {
    hideFibLevelButton.attr({
        x: labelStartPosition - drawingLabel.width - hideFibLevelButton.getBBox().width - 5,
        y: percentageY - hideFibLevelButton.getBBox().height
    });
};

infChart.fibRetracementsDrawing.prototype.resetDragSupporters = function(){
    var self = this,
        ann = self.annotation,
        chart = ann.chart,
        line = ann.shape.d.split(' ');
    infChart.drawingUtils.common.removeDragSupporters.call(self, self.dragSupporters);
    if (ann.shape.visibility !== "hidden") {
        infChart.drawingUtils.common.addDragSupporters.call(self, ann, chart, ['M', line[1], line[2], 'L', line[4], line[5]], self.dragSupporters, undefined, self.defaultDragSupporterStyles);
    }

    $.each(self.additionalDrawings.lines, function (key, value) {
        if(value.visibility !== 'hidden'){
            var line = value.d.split(' ');
            var customAttributes = {
                'level' : key,
                'stroke-width': 10
            }
            infChart.drawingUtils.common.addDragSupporters.call(self, ann, chart, ['M', line[1], line[2], 'L', line[4], line[5]], self.dragSupporters, customAttributes, self.fibLevelDragSupporterStyles);
        }
    });
    self.highlightEachLine();
};

infChart.fibRetracementsDrawing.prototype.updateSettings = function (properties) {
    var updateProperties = {
        fillColor: properties.fillColor,
        fillOpacity: properties.fillOpacity,
        lineColor: properties.borderColor,
        lineWidth: properties.strokeWidth,
        fontSize: properties.fontSize,
        fontColor: properties.fontColor,
        isSingleColor: properties.isSingleColor,
        fibLevels: properties.fibLevels,
        isFibModeEnabled: properties.isContinuousMode,
        isSnapTopHighLowEnabled: properties.isSnapTopHighLow,
        isTrendLineAlwaysEnabled: properties.isTrendLineAlways,
        trendLineColor: properties.trendLineColor,
        trendLineOpacity: properties.trendLineOpacity,
        trendLineWidth: properties.trendLineWidth,
        trendLineStyle: properties.trendLineStyle
    }
    infChart.structureManager.drawingTools.updateFibSettings(this.settingsPopup, updateProperties);
};

infChart.fibRetracementsDrawing.prototype.updateOptions = function (options) {
    this.setNearestYValues(options, this.annotation.chart);
};

infChart.fibRetracementsDrawing.prototype.highlightEachLine = function(){
    let self = this,
        ann = self.annotation,
        options = ann.options,
        chart = ann.chart,
        dragSupporters = self.dragSupporters,
        additionalDrawings = self.additionalDrawings,
        fibonacciDrawings = self.fibonacciDrawings,
        fibLabels = self.fibonacciDrawings.lines,
        container = chart.container,
        selectedLevel;

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
                    var lines = additionalDrawings.lines;
                    var fibLabels = fibonacciDrawings.lines;
                    var selectedLine = lines[selectedLevel];
                    var selectedLabel = fibLabels[selectedLevel];
                    $(container).find("path[class*='line-hover']").attr({class:''});
                    $(container).find("g[class*='label-hover']").attr({class:''});
                    if(selectedLine){
                        selectedLine.addClass('line-hover');
                    }
                    if(selectedLabel){
                        selectedLabel.addClass('label-hover');
                    }
                }
                event.stopPropagation();
            });

            $(dragSupporters.element).mouseleave( function (event) {
                selectedLevel = event.target.getAttribute('level');
                if (!selectedLevel && event.target.parentElement) {
                    if (event.target.parentElement.getAttribute('level')) {
                        selectedLevel = event.target.parentElement.getAttribute('level');
                    } else if (event.target.parentElement.parentElement && event.target.parentElement.parentElement.getAttribute('level')) {
                        selectedLevel = event.target.parentElement.parentElement.getAttribute('level');
                    }
                }
                if(selectedLevel){
                    var lines = additionalDrawings.lines;
                    var fibLabels = fibonacciDrawings.lines;
                    var selectedLine = lines[selectedLevel];
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

        $.each(fibLabels, function (key, fibonacciLabel) {
            $(fibonacciLabel.element).mouseenter( function (event) {
                selectedLevel = event.target.getAttribute('level');
                if (!selectedLevel && event.target.parentElement) {
                    if (event.target.parentElement.getAttribute('level')) {
                        selectedLevel = event.target.parentElement.getAttribute('level');
                    } else if (event.target.parentElement.parentElement && event.target.parentElement.parentElement.getAttribute('level')) {
                        selectedLevel = event.target.parentElement.parentElement.getAttribute('level');
                    }
                }
                var lines = additionalDrawings.lines;
                var fibLabels = fibonacciDrawings.lines;
                if(selectedLevel){
                    var selectedLine = lines[selectedLevel];
                    var selectedLabel = fibLabels[selectedLevel];
                    $(container).find("path[class*='line-hover']").attr({class:''});
                    $(container).find("g[class*='label-hover']").attr({class:''});
                    if(selectedLine){
                        selectedLine.addClass('line-hover');
                    }
                    if(selectedLabel){
                        selectedLabel.addClass('label-hover');
                    }
                }
                event.stopPropagation();
            });

            $(fibonacciLabel.element).mouseleave( function (event) {
                selectedLevel = event.target.getAttribute('level');
                if (!selectedLevel && event.target.parentElement) {
                    if (event.target.parentElement.getAttribute('level')) {
                        selectedLevel = event.target.parentElement.getAttribute('level');
                    } else if (event.target.parentElement.parentElement && event.target.parentElement.parentElement.getAttribute('level')) {
                        selectedLevel = event.target.parentElement.parentElement.getAttribute('level');
                    }
                }
                var lines = additionalDrawings.lines;
                var fibLabels = fibonacciDrawings.lines;
                if(selectedLevel){
                    var selectedLine = lines[selectedLevel];
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

infChart.fibRetracementsDrawing.prototype.onTrendLineColorChange = function (rgb, color, opacity, isPropertyChange){
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
};

infChart.fibRetracementsDrawing.prototype.onTrendLineWidthChange =  function (strokeWidth, isPropertyChange) {
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
};

infChart.fibRetracementsDrawing.prototype.onTrendLineStyleChange = function (dashStyle, isPropertyChange) {
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
};

infChart.fibRetracementsDrawing.prototype.onTrendLineToggleShow = function(checked, isPropertyChange){
    var self = this,
        ann = self.annotation,
        options = ann.options;

    options.isTrendLineAlways = checked;
    if(checked){
        if(ann){
            ann.shape.show();
            self.resetDragSupporters();
        }
    }

    isPropertyChange && self.onPropertyChange();
    if (self.settingsPopup) {
        self.settingsPopup.data("infUndoRedo", false);
    }
};
