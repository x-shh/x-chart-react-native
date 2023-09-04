window.infChart = window.infChart || {};

infChart.fib3PointPriceProjectionDrawing = function () {
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
    this.settings = {};
    this.defaultDragSupporterStyles = Object.assign({}, infChart.drawingUtils.common.dragSupporterStyles, {cursor: 'pointer', type:'mainDrawing'});
    this.fibLevelDragSupporterStyles = Object.assign({}, infChart.drawingUtils.common.dragSupporterStyles, {cursor: 'pointer', type:'additionalDrawing'});
};

infChart.fib3PointPriceProjectionDrawing.prototype = Object.create(infChart.drawingObject.prototype);

infChart.fib3PointPriceProjectionDrawing.prototype.additionalDrawingsFunction = function () {
    var self = this,
        ann = self.annotation,
        options = ann.options,
        chart = ann.chart,
        xAxis = chart.xAxis[options.xAxis],
        yAxis = chart.yAxis[options.yAxis],
        futureValue = chart.series[0].xData[chart.series[0].xData.length - 1];

        var nearestDataPointForXValue = infChart.math.findNearestDataPoint(chart, options.xValue, undefined, true, true),
            newX = xAxis.toPixels(nearestDataPointForXValue.xData) - xAxis.toPixels(options.xValue);
        var nearestYValue, newY;
        if(futureValue >= nearestDataPointForXValue.xData){
            nearestYValue = infChart.drawingUtils.common.getYValue.call(this, self.getNearestYValue(options.isHLH, true, options.yValue, nearestDataPointForXValue, options.trendXValue,  options.isSnapTopHighLow));
        } else {
            nearestYValue = infChart.drawingUtils.common.getYValue.call(this, infChart.drawingUtils.common.getBaseYValues.call(this, options.yValue));
        }
        newY = yAxis.toPixels(nearestYValue) - yAxis.toPixels(options.yValue);

    ann.selectionMarker = [];
    infChart.drawingUtils.common.addSelectionMarker.call(this, ann, newX, newY);

    if (options.trendXValue !== Number.MIN_SAFE_INTEGER && options.trendYValue !== Number.MIN_SAFE_INTEGER) {
        var labelAttr = {
                'color': ann.options.shape.params.stroke,
                fontSize: "12px"
            },
            fibLevels = options.fibLevels ? options.fibLevels : this.fibLevels,
            additionalDrawingsArr = self.additionalDrawings,
            fibonacciDrawingsArr = self.fibonacciDrawings,
            theme = infChart.drawingUtils.common.getTheme.call(this),
            drawingFillAttr,
            drawingAttr,
            baseFillOpacity = (theme.fib3PointPriceProjection && typeof theme.fib3PointPriceProjection.fillOpacity !== "undefined") ? theme.fib3PointPriceProjection.fillOpacity : infChart.drawingUtils.common.baseFillOpacity,
            baseFontColor = (theme.fib3PointPriceProjection && typeof theme.fib3PointPriceProjection.fontColor !== "undefined") ? theme.fib3PointPriceProjection.fontColor : infChart.drawingUtils.common.baseFontColor,
            baseFontSize = (theme.fib3PointPriceProjection && typeof theme.fib3PointPriceProjection.fontSize !== "undefined") ? theme.fib3PointPriceProjection.fontSize : infChart.drawingUtils.common.baseFontSize,
            baseFontWeight = (theme.fib3PointPriceProjection && typeof theme.fib3PointPriceProjection.fontWeight !== "undefined") ? theme.fib3PointPriceProjection.fontWeight : infChart.drawingUtils.common.fontWeight;


        additionalDrawingsArr.lines = {};
        fibonacciDrawingsArr.lines = {};
        fibonacciDrawingsArr.fill = {};
        additionalDrawingsArr.hideFibLevelButton = {};

        var nearestDataPointForTrendXValue = infChart.math.findNearestDataPoint(chart, options.trendXValue, undefined, true, true);
        var nearestTrendYValue;
        if(futureValue >= nearestDataPointForTrendXValue.xData){
            nearestTrendYValue = infChart.drawingUtils.common.getYValue.call(this, this.getNearestYValue(options.isHLH, false, options.trendYValue, nearestDataPointForTrendXValue, options.trendXValue,  options.isSnapTopHighLow));
        } else {
            nearestTrendYValue = infChart.drawingUtils.common.getYValue.call(this, infChart.drawingUtils.common.getBaseYValues.call(this, options.trendYValue));
        }
        additionalDrawingsArr.referenceLine = chart.renderer.path(["M", xAxis.toPixels(nearestDataPointForTrendXValue.xData) - xAxis.toPixels(options.xValue), yAxis.toPixels(nearestTrendYValue) - yAxis.toPixels(options.yValue), 'L', newX, newY]).attr({
            'stroke-width': options.trendLineWidth,
            fill: ann.options.shape.params.fill,
            stroke: ann.options.shape.params.stroke,
            'z-index': 2,
            cursor: 'default',
            opacity: options.trendLineOpacity,
            dashstyle: options.trendLineStyle                                                                                                                        
        }).add(ann.group);

        var hiddenLevels = [];

        // add fill objects first to avoid overlapping lines with and texts with them
        fibLevels = infChart.drawingUtils.common.sortFibLevelsByValue(fibLevels);
        fibLevels.forEach(function (fibLevel) {
            var themeFillColor = theme.fib3PointPriceProjection && theme.fib3PointPriceProjection.fibLevelFillColors && theme.fib3PointPriceProjection.fibLevelFillColors[fibLevel.id];
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
            var fontSize = options.isSingleColor && options.fontSize ? options.fontSize :  fibLevel && fibLevel.fontSize ? fibLevel.fontSize : baseFontSize;
            var fontWeight = options.isSingleColor && options.fontWeight ? options.fontWeight : fibLevel && fibLevel.fontWeight ? fibLevel.fontWeight : baseFontWeight;

            labelCSSAttr = {
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
            additionalDrawingsArr.lines[fibLevel.id] = chart.renderer.path(['M', 0, 0, 'L', 0, 0]).attr(drawingAttr).add(ann.group);
            fibonacciDrawingsArr.lines[fibLevel.id] = chart.renderer.label(infChart.drawingUtils.common.formatValue(fibLevel.value, 1), fibLevel.drawingPosX, fibLevel.drawingPosY).css(labelCSSAttr).attr(labelAttr).add(ann.group);
            additionalDrawingsArr.hideFibLevelButton[fibLevel.id] = chart.renderer.createElement('foreignObject').add(ann.group).attr({
                width: '20',
                height: '20',
                level: fibLevel.id,
                rel: 'hideFibLevelButton',
                cursor: 'pointer'
            });
            var labelHtml = "<div>" + self.closeIcon + "</div>";
            additionalDrawingsArr.hideFibLevelButton[fibLevel.id].element.innerHTML = labelHtml;
            $(additionalDrawingsArr.hideFibLevelButton[fibLevel.id].element).mousedown(function (event) {
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
    }
};

infChart.fib3PointPriceProjectionDrawing.prototype.bindSettingsEvents = function () {
    var self = this;

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

    return infChart.drawingUtils.common.bindFibSettingsEvents.call(this, infChart.drawingUtils.common.baseBorderColor, infChart.drawingUtils.common.baseLineWidth, undefined, undefined, onChangeSnapToHighLow, onTrendLineToggleShow);
};

infChart.fib3PointPriceProjectionDrawing.prototype.deselect = function (isMouseOut) {
    infChart.drawingUtils.common.onDeselect.call(this);
    this.annotation.options.selectedDrawing = undefined;
    if (isMouseOut) {
        if (this.annotation) {
            if (this.annotation.options && !this.annotation.options.isTrendLineAlways) {
                this.annotation.shape.hide();
            }
            if (this.additionalDrawings && this.additionalDrawings.referenceLine) {
                if (this.annotation.options && !this.annotation.options.isTrendLineAlways) {
                    this.additionalDrawings.referenceLine.hide();
                    this.resetDragSupporters();
                }
            }
            this.toggleFibLevelEraseIcon(true);
        }
    }
};

infChart.fib3PointPriceProjectionDrawing.prototype.toggleFibLevelEraseIcon = function (hide) {
    var self = this,
        ann = self.annotation,
        options = ann.options,
        fibonacciDrawings = self.fibonacciDrawings.lines,
        chart = ann.chart,
        line = ann.shape.d.split(' '),
        dx = line[4],
        xAxis = chart.xAxis[options.xAxis];

    if (hide) {
        if(self.additionalDrawings.hideFibLevelButton){
            $.each(self.additionalDrawings.hideFibLevelButton, function (key, value) {
                var hideFibLevelButton = self.additionalDrawings.hideFibLevelButton[key];
                hideFibLevelButton.hide();
            });
        }
    } else {
        $.each(self.additionalDrawings.lines, function (key, value) {
            if (self.additionalDrawings.lines[key].visibility !== "hidden") {
                var hideFibLevelButton = self.additionalDrawings.hideFibLevelButton[key];
                var drawingLabel = fibonacciDrawings[key];
                var labelStartPosition = xAxis.toValue(xAxis.width) > Math.min(options.xValue, options.xValueEnd) ? (xAxis.width - xAxis.toPixels(ann.options.xValue)) : dx > 0 ? dx : 0;
                self.positionHideIcon(hideFibLevelButton, labelStartPosition, drawingLabel, value.d.split(' ')[5]);
                hideFibLevelButton.show();
            }
        });
    }
};

infChart.fib3PointPriceProjectionDrawing.prototype.getConfig = function (shape) {
    var self = this,
        shape = self.shape,
        annotation = self.annotation,
        options = annotation.options,
        fibLevels = options.fibLevels ? options.fibLevels : self.fibLevels;
    fibLevels = infChart.drawingUtils.common.sortFibLevelsByValue(fibLevels);

    return {
        shape: shape,
        fibLevels: fibLevels,
        borderColor: annotation.options.lineColor,
        fillColor: annotation.options.fillColor,
        fillOpacity: annotation.options.fillOpacity,
        strokeWidth: annotation.options.lineWidth,
        fontColor: annotation.options.fontColor,
        fontSize: annotation.options.fontSize,
        fontWeight: annotation.options.fontWeight,
        trendXValue: annotation.options.trendXValue,
        trendYValue: annotation.options.trendYValue,
        xValue: annotation.options.xValue,
        yValue: annotation.options.yValue,
        xValueEnd: annotation.options.xValueEnd,
        yValueEnd: annotation.options.yValueEnd,
        isSingleColor: annotation.options.isSingleColor,
        isHLH: annotation.options.isHLH,
        isSnapTopHighLow: annotation.options.isSnapTopHighLow,
        isTrendLineAlways: annotation.options.isTrendLineAlways,
        trendLineColor: annotation.options.trendLineColor,
        trendLineOpacity: annotation.options.trendLineOpacity,
        trendLineWidth: annotation.options.trendLineWidth,
        trendLineStyle: annotation.options.trendLineStyle,
        isLocked : annotation.options.isLocked

    };
};

infChart.fib3PointPriceProjectionDrawing.prototype.getContextMenuOptions = function (chartId, drawingId, options , event) {
    var self = this;
    var level = event.target.getAttribute('level');
    if(!level && event.target.parentElement){
        level = event.target.parentElement.getAttribute('level');
        if(!level && event.target.parentElement.parentElement){
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
        }
    };

    if (!self.isVisibleLastLevel()) {
        var eraseThis = {
            icon: options.erase.icon,
            displayText: options.erase.displayText,
            action: function () {
                if (level) {
                    infChart.drawingUtils.common.settings.onFibLevelChange.call(self, level, false, true, true);
                }
            }
        }
        contextMenu["eraseThis"] = eraseThis;
    }
    if(level) {
        contextMenu = Object.assign(contextMenu, infChart.drawingUtils.common.getContextMenuOptions(chartId, drawingId, options));
        return infChart.drawingUtils.common.reorderContextMenu(contextMenu);
    }else{
        return  infChart.drawingUtils.common.getContextMenuOptions(chartId, drawingId, options)
    }
};

infChart.fib3PointPriceProjectionDrawing.prototype.getFormattedLabel = function (yAxis, yValue, trendYValue, yValueEnd, percentage, stockChart) {
    var percentageValue = percentage/100;
    var labelYValue = yValue > trendYValue ? yValueEnd + (yValue - trendYValue) * percentageValue : yValueEnd - (trendYValue - yValue) * percentageValue;
    var formatedLabelYValue = stockChart.formatValue(labelYValue, stockChart.getMainSeries().options.dp, undefined, false, false, NO_OF_SPECIFIC_DECIMAL_POINTS);
    return formatedLabelYValue + (percentageValue === 0 ? " ": "PP") + " " + infChart.drawingUtils.common.formatValue(percentageValue, 3);
};

infChart.fib3PointPriceProjectionDrawing.prototype.getNearestYValue = function (isHLH, isLineStartYValue, referredYValue, nearestDataPoint, trendYValue, isSnapTopHighLow, chart) {
    var nearestYValue = referredYValue;
    if(!chart){
        chart = this.annotation.chart;
    }
    if (!isSnapTopHighLow) {
        var nearestReturnYValue = nearestYValue;
        var stockChartId = infChart.drawingsManager.getChartIdFromHighchartInstance(chart);
        var chartInstance = infChart.manager.getChart(stockChartId);
        if (chartInstance.isCompare || chartInstance.isLog) {
            nearestReturnYValue = infChart.drawingUtils.common.getBaseYValue.call(this, nearestYValue);
        }
        return nearestReturnYValue;
    }

    if (trendYValue && trendYValue !== Number.MIN_SAFE_INTEGER) {
        if (isHLH) {
            if (isLineStartYValue) {
                nearestYValue = nearestDataPoint.yData[2];
            } else {
                nearestYValue = nearestDataPoint.yData[1];
            }
        } else {
            if (isLineStartYValue) {
                nearestYValue = nearestDataPoint.yData[1];
            } else {
                nearestYValue = nearestDataPoint.yData[2];
            }
        }
    } else {
        if (isHLH) {
            if (isLineStartYValue) {
                nearestYValue = nearestDataPoint.yData[1];
            } else {
                nearestYValue = nearestDataPoint.yData[2];
            }
        } else {
            if (isLineStartYValue) {
                nearestYValue = nearestDataPoint.yData[2];
            } else {
                nearestYValue = nearestDataPoint.yData[1];
            }
        }
    }

    return nearestYValue;
};

infChart.fib3PointPriceProjectionDrawing.prototype.getOptions = function (properties, chart, isHLH) {
    var isHLH = (this.shape == 'fib3PointPriceProjectionHLH') ? true : false ;
    var futureValue = chart.series[0].xData[chart.series[0].xData.length - 1];
    var nearestDataForXValue = infChart.math.findNearestDataPoint(chart, properties.xValue, undefined, true, true);
    var options = {
        xValue: properties.xValue,
        yValue: properties.yValue,
        nearestXValue: nearestDataForXValue.xData,
        trendXValue: Number.MIN_SAFE_INTEGER,
        trendYValue: Number.MIN_SAFE_INTEGER,
        allowDragX: true,
        allowDragY: true,
        allowDragByHandle: true,
        shape: {
            params: {
                d: ['M', 0, 0, 'L', 0, 0]
            }
        },
        isHLH: isHLH
    };

    var theme = infChart.drawingUtils.common.getTheme.call(this);
    var shapeTheme = theme["fib3PointPriceProjection"];
    var baseFillColor = (theme.fib3PointPriceProjection && theme.fib3PointPriceProjection.singleFillColor) ? theme.fib3PointPriceProjection.singleFillColor : (theme.fibonacci && theme.fibonacci.singleFillColor) ? theme.fibonacci.singleFillColor : infChart.drawingUtils.common.baseFillColor;
    var baseFillOpacity = (theme.fib3PointPriceProjection && typeof theme.fib3PointPriceProjection.fillOpacity !== "undefined") ? theme.fib3PointPriceProjection.fillOpacity : (theme.fibonacci && typeof theme.fibonacci.fillOpacity !== "undefined") ? theme.fibonacci.fillOpacity : infChart.drawingUtils.common.baseFillOpacity;
    var baseBorderColor = (theme.fib3PointPriceProjection && theme.fib3PointPriceProjection.borderColor) ? theme.fib3PointPriceProjection.borderColor : (theme.fibonacci && theme.fibonacci.borderColor) ? theme.fibonacci.borderColor : infChart.drawingUtils.common.baseBorderColor;
    var baseLineWidth = (theme.fib3PointPriceProjection && typeof theme.fib3PointPriceProjection.lineWidth !== "undefined") ? theme.fib3PointPriceProjection.lineWidth : (theme.fibonacci && theme.fibonacci.lineWidth) ? theme.fibonacci.lineWidth : infChart.drawingUtils.common.baseLineWidth;
    var baseFontColor = (theme.fib3PointPriceProjection && theme.fib3PointPriceProjection.fontColor) ? theme.fib3PointPriceProjection.fontColor: (theme.fibonacci && theme.fibonacci.fontColor) ? theme.fibonacci.fontColor : infChart.drawingUtils.common.baseFontColor;
    var baseFontSize = (theme.fib3PointPriceProjection && theme.fib3PointPriceProjection.fontSize) ? theme.fib3PointPriceProjection.fontSize: (theme.fibonacci && theme.fibonacci.fontSize) ? theme.fibonacci.fontSize : infChart.drawingUtils.common.baseFontSize;
    var baseFontWeight = (theme.fib3PointPriceProjection && theme.fib3PointPriceProjection.fontWeight) ? theme.fib3PointPriceProjection.fontWeight: (theme.fibonacci && theme.fibonacci.fontWeight) ? theme.fibonacci.fontWeight : infChart.drawingUtils.common.baseFontWeight;

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
    options.showSnapToHighLowToggle = true;
    options.showTrendLineAlwaysToggle = true;
    options.isSnapTopHighLow = typeof properties.isSnapTopHighLow !== "undefined" ? properties.isSnapTopHighLow : false;
    options.isTrendLineAlways = typeof properties.isTrendLineAlways !== "undefined" ? properties.isTrendLineAlways : true;
    if(futureValue >= options.nearestXValue){
        options.nearestYValue = infChart.drawingUtils.common.getYValue.call(this, this.getNearestYValue(isHLH, true, properties.yValue, nearestDataForXValue, properties.trendYValue,  properties.isSnapTopHighLow, chart));
    } else {
        options.nearestYValue = infChart.drawingUtils.common.getYValue.call(this, infChart.drawingUtils.common.getBaseYValues.call(this, properties.yValue));
    }
    options.yValue = options.nearestYValue;

    if (properties.xValueEnd && properties.yValueEnd) {
        options.xValueEnd = properties.xValueEnd;
        options.yValueEnd = properties.yValueEnd;
        var nearestDataForXValueEnd = infChart.math.findNearestDataPoint(chart, properties.xValueEnd, undefined, true, true);
        options.nearestXValueEnd = nearestDataForXValueEnd.xData;
        if(futureValue >= options.nearestXValueEnd){
            options.nearestYValueEnd = infChart.drawingUtils.common.getYValue.call(this, this.getNearestYValue(isHLH, false, properties.yValueEnd, nearestDataForXValueEnd, properties.trendYValue, properties.isSnapTopHighLow, chart));
        } else {
            options.nearestYValueEnd = infChart.drawingUtils.common.getYValue.call(this, infChart.drawingUtils.common.getBaseYValues.call(this, properties.yValueEnd));
        }
        options.yValueEnd = options.nearestYValueEnd;
    }

    if (properties.trendXValue && properties.trendYValue) {
        options.trendXValue = properties.trendXValue;
        options.trendYValue = properties.trendYValue;

        var nearestDataForTrendXValue = infChart.math.findNearestDataPoint(chart, properties.trendXValue, undefined, true, true);
        options.nearestTrendXValue = nearestDataForTrendXValue.xData;
        if(futureValue >= options.nearestTrendXValue){
            options.nearestTrendYValue = infChart.drawingUtils.common.getYValue.call(this,this.getNearestYValue(options.isHLH, false, options.trendYValue, nearestDataForTrendXValue, options.trendXValue, properties.isSnapTopHighLow, chart));
        } else {
            options.nearestTrendYValue = infChart.drawingUtils.common.getYValue.call(this, infChart.drawingUtils.common.getBaseYValues.call(this, options.trendYValue));
        }
        options.trendYValue = options.nearestTrendYValue;
    } else {
        options.events = null;
    }

    options.isSingleColor = typeof properties.isSingleColor !== "undefined" ? properties.isSingleColor : false;
    options.fibLevels = properties.fibLevels ? properties.fibLevels : this.fibLevels;
    options.fibLevels = infChart.drawingUtils.common.getFibLevelsWithOpacity(infChart.drawingUtils.common.sortFibLevelsByValue(options.fibLevels), baseFillOpacity);
    options.isRealTimeTranslation = true;
    options.disableIntermediateScale = true;
    options.validateTranslationFn = function (newXValue) {
        var annotation = this.annotation,
            chart = annotation.chart,
            options = annotation.options,
            xVal = options.xValue,
            xValEnd = options.xValueEnd,
            newXValueEnd = xValEnd - xVal + newXValue,
            newTrendXValueEnd = options.trendXValue - xVal + newXValue,
            xAxis = chart.xAxis[options.xAxis],
            seriesData = chart.series[0].xData,
            dataMin = seriesData[0],
            totalPoints = infChart.drawingsManager.getTotalPoints(chart),
            dataMax = totalPoints[totalPoints.length - 1];

        return (newXValue >= dataMin && newXValue <= dataMax) && (newXValueEnd >= dataMin && newXValueEnd <= dataMax) && (newTrendXValueEnd >= dataMin && newTrendXValueEnd <= dataMax) && (options.selectedDrawing == "mainDrawing");
    }

    options = infChart.Drawing.prototype.getOptions(properties,options);

    return options;
};

infChart.fib3PointPriceProjectionDrawing.prototype.getQuickSettingsPopup = function () {
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

infChart.fib3PointPriceProjectionDrawing.prototype.getSettingsPopup = function () {
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
        templates: self.getDrawingTemplates(),
        userDefaultSettings: self.getUserDefaultSettings(),
        showSnapToHighLowToggle: options.showSnapToHighLowToggle,
        showTrendLineAlwaysToggle: options.showTrendLineAlwaysToggle,
        trendLineColor: options.trendLineColor,
        trendLineOpacity: options.trendLineOpacity,
        trendLineWidth: options.trendLineWidth,
        trendLineStyle: options.trendLineStyle
    }

    return infChart.drawingUtils.common.getFibSettings(properties);
};

/**
 * on snap to high/low change
 * @param {boolean} checked - snap to high/low checked
 * @param {boolean} isPropertyChange - is propery changed
 * @param {boolean} ignoreSettingsSave - this is to indicate to this change does not affect to subsequent drawing
 */
infChart.fib3PointPriceProjectionDrawing.prototype.onChangeSnapToHighLow = function (checked, isPropertyChange, ignoreSettingsSave) {
    var self = this,
        ann = self.annotation,
        options = ann.options,
        chart = ann.chart;

    options.isSnapTopHighLow = checked;
    // var futureValue = chart.series[0].xData[chart.series[0].xData.length - 1];
    // if (options.isSnapTopHighLow) {
    //     var nearestDataForXValue = infChart.math.findNearestDataPoint(chart, options.xValue, undefined, true, true);
    //     var nearestDataForXValueEnd = infChart.math.findNearestDataPoint(chart, options.xValueEnd, undefined, true, true);
    //     var nearestDataPointForTrendXValue = infChart.math.findNearestDataPoint(chart, options.trendXValue, undefined, true, true);
    //     if(futureValue >= nearestDataPointForTrendXValue.xData){
    //         options.nearestTrendYValue = infChart.drawingUtils.common.getYValue.call(this, this.getNearestYValue(options.isHLH, false, options.trendYValue, nearestDataPointForTrendXValue, options.trendXValue,  options.isSnapTopHighLow));
    //     } else {
    //         options.nearestTrendYValue = infChart.drawingUtils.common.getYValue.call(this, infChart.drawingUtils.common.getBaseYValues.call(this, options.nearestTrendYValue));
    //     }
    //     if(futureValue >= nearestDataForXValue.xData){
    //         options.nearestYValue = infChart.drawingUtils.common.getYValue.call(this, this.getNearestYValue(options.isHLH, true, self.nearestYValue, nearestDataForXValue, options.trendXValue, options.isSnapTopHighLow));
    //     } else {
    //         options.nearestYValue = infChart.drawingUtils.common.getYValue.call(this, infChart.drawingUtils.common.getBaseYValues.call(this, options.nearestYValue));
    //     }
    //     if(futureValue >= nearestDataForXValueEnd.xData){
    //         options.nearestYValueEnd = infChart.drawingUtils.common.getYValue.call(this, this.getNearestYValue(options.isHLH, false, self.nearestYValueEnd, nearestDataForXValueEnd, options.trendXValue, options.isSnapTopHighLow));
    //     } else {
    //         options.nearestYValueEnd = infChart.drawingUtils.common.getYValue.call(this, infChart.drawingUtils.common.getBaseYValues.call(this, options.nearestYValueEnd));
    //     }
    // } else {
    //     options.nearestYValue = options.yValue;
    //     options.nearestYValueEnd = options.yValueEnd;
    //     options.nearestTrendYValue = options.trendYValue;
    // }

    // infChart.drawingUtils.common.saveNearestBaseYValues.call(this, ann.options.nearestYValue, ann.options.nearestYValueEnd);

    // self.scale();
    // self.selectAndBindResize();
    // chart.selectedAnnotation = ann;
    // self.updateSettings( self.getConfig());
    isPropertyChange && self.onPropertyChange();

    if (this.settingsPopup) {
        this.settingsPopup.data("infUndoRedo", false);
    }
};

infChart.fib3PointPriceProjectionDrawing.prototype.moveStartPoint = function (e) {
    var self = this,
        ann = self.annotation,
        chart = ann.chart,
        stockChart = infChart.manager.getChart(infChart.manager.getContainerIdFromChart(chart.renderTo.id)),
        options = ann.options,
        x = e.chartX,
        y = e.chartY,
        xAxis = chart.xAxis[options.xAxis],
        yAxis = chart.yAxis[options.yAxis],
        fibonacciDrawings = self.fibonacciDrawings.lines,
        fibonacciDrawingsFill = self.fibonacciDrawings.fill,
        lineDrawings = self.additionalDrawings.lines,
        fibLevels = ann.options.fibLevels ? ann.options.fibLevels : this.fibLevels,
        fibLevels = infChart.drawingUtils.common.sortFibLevelsByValue(fibLevels),
        pathDefinition = ann.shape.d.split(' '),
        dx = parseFloat(pathDefinition[4]),
        dy = parseFloat(pathDefinition[5]),
        futureValue = chart.series[0].xData[chart.series[0].xData.length - 1],
        nearestDataPointForTrendXValue = infChart.math.findNearestDataPoint(chart, options.trendXValue, undefined, true, true);
        var nearestTrendYValue;

        if(options.isSnapTopHighLow) {
            if(futureValue >= nearestDataPointForTrendXValue.xData){
                nearestTrendYValue = infChart.drawingUtils.common.getYValue.call(this,this.getNearestYValue(options.isHLH, false, options.trendYValue, nearestDataPointForTrendXValue, options.trendXValue,  options.isSnapTopHighLow));
            } else {
                nearestTrendYValue = infChart.drawingUtils.common.getYValue.call(this, infChart.drawingUtils.common.getBaseYValues.call(this, options.trendYValue));
            }
        } else {
            nearestTrendYValue = yAxis.toValue(y);
        }

    ann.update({
        trendXValue: xAxis.toValue(x),
        trendYValue: nearestTrendYValue,
        nearestTrendXValue: nearestDataPointForTrendXValue.xData
    });

    self.additionalDrawings.referenceLine.attr({
        d: ["M", xAxis.toPixels(nearestDataPointForTrendXValue.xData) - xAxis.toPixels(options.xValue), yAxis.toPixels(nearestTrendYValue) - yAxis.toPixels(options.yValue), 'L', pathDefinition[1], pathDefinition[2]]
    });

    $.each(lineDrawings, function (key, value) {
        var fibLevel = fibLevels.find(function (level) {
            return level.id === key;
        });
        var percentage = parseFloat(fibLevel.value);
        var percentageY = -((yAxis.toPixels(nearestTrendYValue) - yAxis.toPixels(options.nearestYValue)) * percentage / 100) + dy;
        var lineEndPosition = (xAxis.width - xAxis.toPixels(ann.options.xValue));
        var drawingLabel = fibonacciDrawings[key];
        var hideFibLevelButton = self.additionalDrawings.hideFibLevelButton[key];
        var line = ["M", dx, percentageY, 'L', lineEndPosition, percentageY];

        value.attr({
            d: line
        });

        drawingLabel.textSetter(self.getFormattedLabel(yAxis, options.nearestYValue, nearestTrendYValue, options.nearestYValueEnd, percentage, stockChart));

        drawingLabel.attr({
            x: lineEndPosition - drawingLabel.width,
            y: percentageY - drawingLabel.height
        });

        self.positionHideIcon(hideFibLevelButton, lineEndPosition, drawingLabel, percentageY);
    });

    fibLevels.forEach(function (value, index, arr) {
        fill = fibonacciDrawingsFill && fibonacciDrawingsFill[value.id];
        currentLine = lineDrawings[value.id];
        currentLineP = currentLine && currentLine.d.split(' ');

        for (var i = index + 1; i < arr.length; i++) {
            var lineTemp = lineDrawings[arr[i].id];
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

    return {line: pathDefinition, nearestTrendYValue: nearestTrendYValue};
};

infChart.fib3PointPriceProjectionDrawing.prototype.scale = function (isCalculateNewValueForScale) {
    var self = this,
        ann = self.annotation,
        chart = ann.chart,
        options = ann.options,
        stockChart,
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
        futureValue = chart.series[0].xData[chart.series[0].xData.length - 1],
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

        if (isCalculateNewValueForScale) {
            nearestDataForXValue = infChart.math.findNearestDataPoint(chart, options.xValue, undefined, true, true);
            options.nearestXValue = nearestDataForXValue.xData;
            nearestDataForXValueEnd = infChart.math.findNearestDataPoint(chart, options.xValueEnd, undefined, true, true);
            options.nearestXValueEnd = nearestDataForXValueEnd.xData;
            nearestDataPointForTrendXValue = infChart.math.findNearestDataPoint(chart, options.trendXValue, undefined, true, true);
            options.nearestTrendXValue = nearestDataPointForTrendXValue.xData;

        if(futureValue >= options.nearestXValue){
            options.nearestYValue = infChart.drawingUtils.common.getYValue.call(this, this.getNearestYValue(options.isHLH, true, options.yValue, nearestDataForXValue, options.trendXValue, false));
        } else {
            options.nearestYValue = infChart.drawingUtils.common.getYValue.call(this, infChart.drawingUtils.common.getBaseYValue.call(this, options.nearestYValue));
        }
        if(futureValue >= options.nearestXValueEnd){
            options.nearestYValueEnd = infChart.drawingUtils.common.getYValue.call(this, this.getNearestYValue(options.isHLH, false, options.yValueEnd, nearestDataForXValueEnd, options.trendXValue, false));
        } else {
            options.nearestYValueEnd = infChart.drawingUtils.common.getYValue.call(this, infChart.drawingUtils.common.getBaseYValue.call(self, options.nearestYValueEnd));
        }
        if(futureValue >= options.nearestTrendXValue){
            options.nearestTrendYValue = infChart.drawingUtils.common.getYValue.call(this,this.getNearestYValue(options.isHLH, false, options.trendYValue, nearestDataPointForTrendXValue, options.trendXValue,  false));
        } else {
            options.nearestTrendYValue = infChart.drawingUtils.common.getYValue.call(this, infChart.drawingUtils.common.getBaseYValue.call(self, options.trendYValue));
        }

        if (chartInstance.isLog || chartInstance.isCompare) {
            self.nearestYValue = infChart.drawingUtils.common.getBaseYValue.call(self, options.nearestYValue);
            self.nearestYValueEnd = infChart.drawingUtils.common.getBaseYValue.call(self, options.nearestYValueEnd);
                self.nearestTrendYValue = infChart.drawingUtils.common.getBaseYValue.call(self, options.nearestTrendYValue);
        } else {
            self.nearestYValue = options.nearestYValue;
            self.nearestYValueEnd = options.nearestYValueEnd;
            self.nearestTrendYValue = options.nearestTrendYValue;
        }
    }

    var newX = xAxis.toPixels(options.nearestXValue) - xValueInPixels,
        newXEnd = xAxis.toPixels(options.nearestXValueEnd) - xValueInPixels,
        newY = yAxis.toPixels(options.yValue) - yValueInPixels,
        newYEnd = yAxis.toPixels(options.yValueEnd) - yValueInPixels;

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
        infChart.drawingUtils.common.addDragSupporters.call(self, ann, chart, ['M', line[1], line[2], 'L', line[4], line[5]], self.dragSupporters, undefined, self.defaultDragSupporterStyles);
    }
    if(self.additionalDrawings && self.additionalDrawings.referenceLine){
        var referenceLine = self.additionalDrawings.referenceLine.d.split(' ');
        if(self.additionalDrawings.referenceLine.visibility !== "hidden"){
            infChart.drawingUtils.common.addDragSupporters.call(self, ann, chart, ['M', referenceLine[1], referenceLine[2], 'L', referenceLine[4], referenceLine[5]], self.dragSupporters, undefined, self.defaultDragSupporterStyles);
        }
    }

    var dx = line[4], dy = line[5];

    if (lineDrawings) {
        self.additionalDrawings.referenceLine.attr({
            d: ["M", xAxis.toPixels(options.nearestTrendXValue) - xValueInPixels, yAxis.toPixels(options.trendYValue) - yValueInPixels, 'L', newX, newY]
        });
        var lineStartPosition = newXEnd;
        var lineEndPosition = xAxis.toValue(xAxis.width) > Math.min(options.xValue, options.xValueEnd) ? (xAxis.width - xAxis.toPixels(ann.options.xValue)) : dx > 0 ? dx : 0;
        var lineWidthInPixels = (yAxis.toPixels(options.trendYValue) - yAxis.toPixels(options.yValue));

        $.each(lineDrawings, function (key, value) {
            var fibLevel = fibLevels.find(function (level) {
                return level.id === key;
            });
            var percentage = parseFloat(fibLevel.value);
            var percentageY = -(lineWidthInPixels * percentage / 100) + dy;
            var drawingLabel = fibonacciDrawings[key];
            var line = ["M", lineStartPosition, percentageY, 'L', lineEndPosition, percentageY];
            fibLevelLines[key] = line;

            value.attr({
                d: line
            });

            drawingLabel.textSetter(self.getFormattedLabel(yAxis, options.yValue, options.trendYValue, options.yValueEnd, percentage, stockChart));

            drawingLabel.attr({
                x: lineEndPosition - drawingLabel.width,
                y: percentageY - drawingLabel.height
            });

            if(chart.selectedAnnotation && chart.selectedAnnotation.options.id === options.id) {
                self.positionHideIcon(self.additionalDrawings.hideFibLevelButton[key], lineEndPosition, drawingLabel, percentageY);
            }

            if(value.visibility !== 'hidden'){
                var customAttributes = {
                    'level' : key,
                    'visibility':lineDrawings[key].visibility,
                    'stroke-width': 10
                }
                infChart.drawingUtils.common.addDragSupporters.call(self, ann, chart, ['M', line[1], line[2], 'L', line[4], line[5]], self.dragSupporters, customAttributes, self.fibLevelDragSupporterStyles);
            }
        });

        self.highlightEachLine();

        fibLevels.forEach(function (value, index, arr) {
            fill = fibonacciDrawingsFill && fibonacciDrawingsFill[value.id];
            currentLine = lineDrawings[value.id];
            currentLineP = currentLine && fibLevelLines[value.id];

            for (var i = index + 1; i < arr.length; i++) {
                var lineTemp = lineDrawings[arr[i].id];
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
    }
};

infChart.fib3PointPriceProjectionDrawing.prototype.selectAndBindResize = function () {
    var ann = this.annotation,
        pathDefinition, width, height, referenceLine = this.additionalDrawings.referenceLine;

    ann.events.deselect.call(ann);
    ann.shape.show();
    if(referenceLine){
        referenceLine.show();
    }
    this.toggleFibLevelEraseIcon(false);
    ann.selectionMarker = [];
    pathDefinition = ann.shape.d.split(' ');
    width = parseFloat(pathDefinition[4]);
    height = parseFloat(pathDefinition[5]);

    var chart = ann.chart,
        options = ann.options,
        xAxis = chart.xAxis[options.xAxis],
        yAxis = chart.yAxis[options.yAxis];

    this.resetDragSupporters();
    if (!isNaN(width) && !isNaN(height)) {
        infChart.drawingUtils.common.addAndBindSelectionMarker.call(this, ann, parseFloat(pathDefinition[1]), parseFloat(pathDefinition[2]), this.stepFunction, this.stop, true);
        infChart.drawingUtils.common.addAndBindSelectionMarker.call(this, ann, width, height, this.stepFunction, this.stop, false);
        infChart.drawingUtils.common.addAndBindSelectionMarker.call(this, ann, xAxis.toPixels(options.nearestTrendXValue) - xAxis.toPixels(options.xValue), yAxis.toPixels(options.trendYValue) - yAxis.toPixels(options.yValue), this.moveStartPoint, this.updateMoveStartPoint, true);
    }
};

infChart.fib3PointPriceProjectionDrawing.prototype.setNearestYValues = function (options, chart) {
    var self = this;
    var isHLH = (self.shape === 'fib3PointPriceProjectionHLH');
    var futureValue = chart.series[0].xData[chart.series[0].xData.length - 1];
    var nearestDataForXValue = infChart.math.findNearestDataPoint(chart, options.xValue, undefined, true, true);
    if(futureValue >= nearestDataForXValue.xData){
        self.nearestYValue = self.getNearestYValue(isHLH, true, options.yValue, nearestDataForXValue, options.trendYValue, options.isSnapTopHighLow, chart);
    } else {
        self.nearestYValue = options.yValue;
    }

    var nearestDataForXValueEnd = infChart.math.findNearestDataPoint(chart, options.xValueEnd, undefined, true, true);
    if(futureValue >= nearestDataForXValueEnd.xData){
        self.nearestYValueEnd = self.getNearestYValue(isHLH, false, options.yValueEnd, nearestDataForXValueEnd, options.trendYValue, options.isSnapTopHighLow, chart);
    } else {
        self.nearestYValueEnd = options.yValueEnd;
    }

    var nearestDataPointForTrendXValue = infChart.math.findNearestDataPoint(chart, options.trendXValue, undefined, true, true);
    if(futureValue >= nearestDataPointForTrendXValue.xData){
        self.nearestTrendYValue = this.getNearestYValue(options.isHLH, false, options.trendYValue, nearestDataPointForTrendXValue, options.trendXValue,  options.isSnapTopHighLow, chart);
    } else {
        self.nearestYValueEnd = options.trendYValue;
    }
};

infChart.fib3PointPriceProjectionDrawing.prototype.resetDragSupporters = function(){
    var self = this,
        ann = self.annotation,
        chart = ann.chart,
        line = ann.shape.d.split(' ');
    infChart.drawingUtils.common.removeDragSupporters.call(self, self.dragSupporters);
    if (ann.shape.visibility !== "hidden") {
        infChart.drawingUtils.common.addDragSupporters.call(self, ann, chart, ['M', line[1], line[2], 'L', line[4], line[5]], self.dragSupporters, undefined, self.defaultDragSupporterStyles);
    }
    if (self.additionalDrawings && self.additionalDrawings.referenceLine && self.additionalDrawings.referenceLine.visibility !== "hidden") {
        var referenceLine = self.additionalDrawings.referenceLine.d.split(' ');
        infChart.drawingUtils.common.addDragSupporters.call(self, ann, chart, ['M', referenceLine[1], referenceLine[2], 'L', referenceLine[4], referenceLine[5]], self.dragSupporters, undefined, self.defaultDragSupporterStyles);
    }

    $.each(self.additionalDrawings.lines, function (key, value) {
        if(value.visibility !== 'hidden'){
            var line = value.d.split(' ');
            var customAttributes = {
                'level' : key,
                'visibility':self.additionalDrawings.lines[key].visibility,
                'stroke-width': 10
            }
            infChart.drawingUtils.common.addDragSupporters.call(self, ann, chart, ['M', line[1], line[2], 'L', line[4], line[5]], self.dragSupporters, customAttributes, self.fibLevelDragSupporterStyles);
        }
    });
    self.highlightEachLine();
};

infChart.fib3PointPriceProjectionDrawing.prototype.positionHideIcon = function (hideFibLevelButton, lineEndPosition, drawingLabel, percentageY) {
    hideFibLevelButton.attr({
        x: lineEndPosition - drawingLabel.width - hideFibLevelButton.getBBox().width - 5,
        y: percentageY - hideFibLevelButton.getBBox().height
    });
};

infChart.fib3PointPriceProjectionDrawing.prototype.step = function (e, isStartPoint) {
    var self = this,
        ann = self.annotation,
        chart = ann.chart,
        stockChart = infChart.manager.getChart(infChart.manager.getContainerIdFromChart(chart.renderTo.id)),
        points = infChart.drawingUtils.common.calculateInitialPoints(e, ann, isStartPoint, 0, 0),
        options = ann.options,
        plotWidth = chart.plotWidth * infChart.drawingUtils.common.correctionFactor,
        fibonacciDrawings = self.fibonacciDrawings.lines,
        fibLevels = options.fibLevels ? options.fibLevels : this.fibLevels,
        fibLevels = infChart.drawingUtils.common.sortFibLevelsByValue(fibLevels),
        fibonacciDrawingsFill = self.fibonacciDrawings.fill,
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
        nearestDataPointForXValue = infChart.math.findNearestDataPoint(chart, options.xValue, undefined, true, true),
        nearestXValue = nearestDataPointForXValue.xData,
        nearestDataPointForXValueEnd = infChart.math.findNearestDataPoint(chart, xValueEnd, undefined, true, true),
        nearestXValueEnd = nearestDataPointForXValueEnd.xData,
        newX = xAxis.toPixels(nearestXValue) - xAxis.toPixels(options.xValue),
        newXEnd = xAxis.toPixels(nearestXValueEnd) - xAxis.toPixels(options.xValue);
        var futureValue = chart.series[0].xData[chart.series[0].xData.length - 1];
        var nearestYValue, nearestYValueEnd;

        if(options.isSnapTopHighLow){
            if (isStartPoint) {
                if(futureValue >= nearestXValue){
                    nearestYValue = infChart.drawingUtils.common.getYValue.call(this, this.getNearestYValue(options.isHLH, true, options.yValue, nearestDataPointForXValue, options.trendXValue,  options.isSnapTopHighLow));
                } else {
                    nearestYValue = infChart.drawingUtils.common.getYValue.call(this, infChart.drawingUtils.common.getBaseYValues.call(self, options.yValue));
                }
                ann.update({
                    yValue: nearestYValue
                });
                nearestYValueEnd = yValueEnd;
            } else {
                if(futureValue >= nearestXValueEnd){
                    nearestYValueEnd = infChart.drawingUtils.common.getYValue.call(this, this.getNearestYValue(options.isHLH, false, yValueEnd, nearestDataPointForXValueEnd, options.trendXValue,  options.isSnapTopHighLow));
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
        // var newY = yAxis.toPixels(nearestYValue) - yAxis.toPixels(options.yValue),
        var newYEnd = yAxis.toPixels(nearestYValueEnd) - yAxis.toPixels(nearestYValue),
            nearestDataPointForTrendXValue,
            nearestTrendYValue;

    var drawingLine = ["M", newX, 0, 'L', parseInt(newXEnd, 10), parseInt(newYEnd, 10)];

    ann.shape.attr({
        d: drawingLine
    });

    if (lineDrawings) {
        nearestDataPointForTrendXValue = infChart.math.findNearestDataPoint(chart, options.trendXValue, undefined, true, true);
        if (!isStartPoint) {
            if(futureValue >= nearestDataPointForTrendXValue.xData){
                nearestTrendYValue = infChart.drawingUtils.common.getYValue.call(this, this.getNearestYValue(options.isHLH, false, options.trendYValue, nearestDataPointForTrendXValue, options.trendXValue,  options.isSnapTopHighLow));
            } else {
                nearestTrendYValue = infChart.drawingUtils.common.getYValue.call(this, infChart.drawingUtils.common.getBaseYValues.call(self, options.trendYValue));
            }
        } else {
            nearestTrendYValue = options.trendYValue
        }

        self.additionalDrawings.referenceLine.attr({
            d: ["M", xAxis.toPixels(nearestDataPointForTrendXValue.xData) - xAxis.toPixels(options.xValue), yAxis.toPixels(self.annotation.options.trendYValue) - yAxis.toPixels(self.annotation.options.yValue), 'L', newX, 0]
        });

        $.each(lineDrawings, function (key, value) {
            var fibLevel = fibLevels.find(function (level) {
                return level.id === key;
            });
            var percentage = parseFloat(fibLevel.value);
            var percentageY = -((yAxis.toPixels(nearestTrendYValue) - yAxis.toPixels(nearestYValue)) * percentage / 100) + drawingLine[5];
            var lineStartPosition = newXEnd;
            var lineEndPosition = (xAxis.width - xAxis.toPixels(ann.options.xValue));
            var drawingLabel = fibonacciDrawings[key];
            var hideFibLevelButton = self.additionalDrawings.hideFibLevelButton[key];
            var line = ["M", lineStartPosition, percentageY, 'L', lineEndPosition, percentageY];

            value.attr({
                d: line
            });

            drawingLabel.textSetter(self.getFormattedLabel(yAxis, nearestYValue, nearestTrendYValue, nearestYValueEnd, percentage, stockChart));

            drawingLabel.attr({
                x: lineEndPosition - drawingLabel.width,
                y: percentageY - drawingLabel.height
            });

            self.positionHideIcon(hideFibLevelButton, lineEndPosition, drawingLabel, percentageY);
        });

        fibLevels.forEach(function (value, index, arr) {
            fill = fibonacciDrawingsFill && fibonacciDrawingsFill[value.id];
            currentLine = lineDrawings[value.id];
            currentLineP = currentLine && currentLine.d.split(' ');

            for (var i = index + 1; i < arr.length; i++) {
                var lineTemp = lineDrawings[arr[i].id];
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
    }

    return {
        line: drawingLine,
        points: points,
        nearestXValue: nearestXValue,
        nearestXValueEnd: nearestXValueEnd,
        nearestTrendXValue: nearestDataPointForTrendXValue ? nearestDataPointForTrendXValue.xData : Number.MIN_SAFE_INTEGER,
        nearestYValue: nearestYValue,
        nearestYValueEnd: nearestYValueEnd,
        nearestTrendYValue: nearestTrendYValue
    };
};

infChart.fib3PointPriceProjectionDrawing.prototype.stop = function (e, isStartPoint) {
    var self = this,
        ann = self.annotation,
        options = ann.options,
        chart = ann.chart,
        lineData = this.stepFunction(e, isStartPoint),
        line = lineData.line,
        xAxis = chart.xAxis[ann.options.xAxis],
        yAxis = chart.yAxis[ann.options.yAxis],
        x = xAxis.toValue(lineData.points.dx + xAxis.toPixels(ann.options.xValue)),
        y = yAxis.toValue(lineData.points.dy + yAxis.toPixels(ann.options.yValue));

    // if (options.isSnapTopHighLow) {
        line[2] = 0;
        line[5] = yAxis.toPixels(lineData.nearestYValueEnd) - yAxis.toPixels(lineData.nearestYValue);
        referenceLine = self.additionalDrawings.referenceLine.d.split(' ');
        referenceLine[2] =  yAxis.toPixels(options.trendYValue) - yAxis.toPixels(lineData.nearestYValue);
        referenceLine[5] =  0;
        self.additionalDrawings.referenceLine.attr({
            d: ["M", referenceLine[1], yAxis.toPixels(options.trendYValue) - yAxis.toPixels(lineData.nearestYValue), 'L', referenceLine[4], "0"]
        });
    //     ann.update({
    //         xValueEnd: x,
    //         yValue: lineData.nearestYValue,
    //         trendYValue: lineData.nearestTrendYValue,
    //         yValueEnd: lineData.nearestYValueEnd,
    //         nearestXValue: lineData.nearestXValue,
    //         nearestXValueEnd: lineData.nearestXValueEnd,
    //         nearestTrendXValue: lineData.nearestTrendXValue,
    //         nearestYValue: lineData.nearestYValue,
    //         nearestYValueEnd: lineData.nearestYValueEnd,
    //         nearestTrendYValue: lineData.nearestTrendYValue,
    //         shape: {
    //             params: {
    //                 d: line
    //             }
    //         }
    //     });
    //     //self.scale();
    // } else {
        ann.update({
            xValueEnd: x,
            yValue: lineData.nearestYValue,
            yValueEnd: lineData.nearestYValueEnd,
            // trendYValue: lineData.nearestTrendYValue,
            nearestXValue: lineData.nearestXValue,
            nearestXValueEnd: lineData.nearestXValueEnd,
            nearestTrendXValue: lineData.nearestTrendXValue,
            // nearestYValue: lineData.nearestYValue,
            // nearestYValueEnd: lineData.nearestYValueEnd,
            // nearestTrendYValue: lineData.nearestTrendYValue,
            shape: {
                params: {
                    d: line
                }
            }
        });
    // }

    infChart.drawingUtils.common.saveBaseYValues.call(this, ann.options.yValue, ann.options.yValueEnd, ann.options.trendYValue);
    // infChart.drawingUtils.common.saveNearestBaseYValues.call(this, ann.options.nearestYValue, ann.options.nearestYValueEnd, ann.options.nearestTrendYValue);
    infChart.drawingUtils.common.removeDragSupporters.call(self, self.dragSupporters);
    var dragSupporterStyles = Object.assign({}, infChart.drawingUtils.common.dragSupporterStyles, {cursor: 'default'});
    infChart.drawingUtils.common.addDragSupporters.call(self, ann, chart, ['M', line[1], line[2], 'L', line[4], line[5]], self.dragSupporters, undefined, self.defaultDragSupporterStyles);
    var referenceLine = self.additionalDrawings.referenceLine.d.split(' ');
    infChart.drawingUtils.common.addDragSupporters.call(self, ann, chart, ['M', referenceLine[1], referenceLine[2], 'L', referenceLine[4], referenceLine[5]], self.dragSupporters, undefined, self.defaultDragSupporterStyles);

    if (self.additionalDrawings && self.additionalDrawings.lines) {
        $.each(self.additionalDrawings.lines, function (key, value) {
            if(value.visibility !== 'hidden'){
                var line = value.d.split(' ');
                var customAttributes = {
                    'level': key,
                    'visibility':self.additionalDrawings.lines[key].visibility,
                    'stroke-width': 10
                }
                infChart.drawingUtils.common.addDragSupporters.call(self, ann, chart, ['M', line[1], line[2], 'L', line[4], line[5]], self.dragSupporters, customAttributes, self.fibLevelDragSupporterStyles);
            }
        });
    } else {
        console.error("3 point price projection error");
    }
    self.highlightEachLine();

    infChart.drawingUtils.common.fixSelectionMarker.call(self, ann);
    infChart.drawingUtils.common.onPropertyChange.call(this);
};

infChart.fib3PointPriceProjectionDrawing.prototype.select = function(event){
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

infChart.fib3PointPriceProjectionDrawing.prototype.translate = function (e) {
    var self = this,
        ann = self.annotation,
        chart = ann.chart,
        options = ann.options,
        stockChart = infChart.manager.getChart(infChart.manager.getContainerIdFromChart(chart.renderTo.id)),
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
        var lineEndPosition = xAxis.width - xAxis.toPixels(ann.options.xValue);
        var drawingLabel = fibonacciDrawings[key];
        var hideFibLevelButton = self.additionalDrawings.hideFibLevelButton[key];
        var newLine = ["M", line[1], line[2], 'L', lineEndPosition, line[5]];

        value.attr({
            d: newLine
        });

        drawingLabel.textSetter(self.getFormattedLabel(yAxis, options.yValue, options.trendYValue, options.yValueEnd, percentage, stockChart));

        drawingLabel.attr({
            x: lineEndPosition - drawingLabel.width,
            y: line[2] - drawingLabel.height
        });

        self.positionHideIcon(hideFibLevelButton, lineEndPosition, drawingLabel, line[2]);

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
    this.toggleFibLevelEraseIcon(true);
};

infChart.fib3PointPriceProjectionDrawing.prototype.translateEnd = function () {
    var self = this,
        ann = self.annotation,
        chart = ann.chart,
        stockChart = infChart.manager.getChart(infChart.manager.getContainerIdFromChart(chart.renderTo.id)),
        options = ann.options,
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
        nearestDataPointForXValue = infChart.math.findNearestDataPoint(chart, options.xValue, undefined, true, true),
        nearestDataPointForXValueEnd = infChart.math.findNearestDataPoint(chart, options.xValueEnd, undefined, true, true),
        nearestDataPointForTrendXValue = infChart.math.findNearestDataPoint(chart, options.trendXValue, undefined, true, true),
        futureValue = chart.series[0].xData[chart.series[0].xData.length - 1];

    var nearestYValue;
    if(futureValue >= nearestDataPointForXValue.xData) {
        nearestYValue = infChart.drawingUtils.common.getYValue.call(this, this.getNearestYValue(options.isHLH, true, options.yValue, nearestDataPointForXValue, options.trendXValue,  false));
    } else {
        nearestYValue = infChart.drawingUtils.common.getYValue.call(this, infChart.drawingUtils.common.getBaseYValues.call(this, options.yValue));
    }

    var nearestYValueEnd;
    if(futureValue >= nearestDataPointForXValueEnd.xData){
        nearestYValueEnd = infChart.drawingUtils.common.getYValue.call(this, this.getNearestYValue(options.isHLH, false, options.yValueEnd, nearestDataPointForXValueEnd, options.trendXValue,  false));
    } else {
        nearestYValueEnd = infChart.drawingUtils.common.getYValue.call(this, infChart.drawingUtils.common.getBaseYValues.call(this, options.yValueEnd));
    }

    var nearestTrendYValue;
    if(futureValue >= nearestDataPointForTrendXValue.xData){
        nearestTrendYValue = infChart.drawingUtils.common.getYValue.call(this,this.getNearestYValue(options.isHLH, false, options.trendYValue, nearestDataPointForTrendXValue, options.trendXValue,  false));
    } else {
        nearestTrendYValue = infChart.drawingUtils.common.getYValue.call(this, infChart.drawingUtils.common.getBaseYValues.call(this, options.trendYValue));
    }

    // if(options.isSnapTopHighLow){
    //     var newX = xAxis.toPixels(nearestDataPointForXValue.xData) - xAxis.toPixels(nearestDataPointForXValue.xData),
    //         newXEnd = xAxis.toPixels(nearestDataPointForXValueEnd.xData) - xAxis.toPixels(nearestDataPointForXValue.xData),
    //         newY = yAxis.toPixels(nearestYValue) - yAxis.toPixels(nearestYValue),
    //         newYEnd = yAxis.toPixels(nearestYValueEnd) - yAxis.toPixels(nearestYValue);

    //     var line = ["M", newX, newY, 'L', parseInt(newXEnd, 10), parseInt(newYEnd, 10)];

    //     ann.update({
    //         xValue: nearestDataPointForXValue.xData,
    //         xValueEnd: nearestDataPointForXValueEnd.xData,
    //         trendXValue: nearestDataPointForTrendXValue.xData,
    //         yValue: nearestYValue,
    //         yValueEnd: nearestYValueEnd,
    //         trendYValue: nearestTrendYValue,
    //         nearestXValue: nearestDataPointForXValue.xData,
    //         nearestXValueEnd: nearestDataPointForXValueEnd.xData,
    //         nearestTrendXValue: nearestDataPointForTrendXValue.xData,
    //         nearestYValue: nearestYValue,
    //         nearestYValueEnd: nearestYValueEnd,
    //         nearestTrendYValue: nearestTrendYValue,
    //         shape: {
    //             params: {
    //                 d: line
    //             }
    //         }
    //     });

    //     var newReferenceLine = ["M", xAxis.toPixels(nearestDataPointForTrendXValue.xData) - xAxis.toPixels(nearestDataPointForXValue.xData), yAxis.toPixels(nearestTrendYValue) - yAxis.toPixels(nearestYValue), 'L', newX, newY];
    //     self.additionalDrawings.referenceLine.attr({
    //         d: newReferenceLine
    //     });
    // } else {
        var newX = xAxis.toPixels(nearestDataPointForXValue.xData) - xAxis.toPixels(nearestDataPointForXValue.xData),
            newXEnd = xAxis.toPixels(nearestDataPointForXValueEnd.xData) - xAxis.toPixels(nearestDataPointForXValue.xData),
            newY = yAxis.toPixels(nearestYValue) - yAxis.toPixels(options.yValue),
            newYEnd = yAxis.toPixels(nearestYValueEnd) - yAxis.toPixels(options.yValue);

        var line = ["M", newX, newY, 'L', parseInt(newXEnd, 10), parseInt(newYEnd, 10)];

        ann.update({
            xValue: nearestDataPointForXValue.xData,
            xValueEnd: nearestDataPointForXValueEnd.xData,
            trendXValue: nearestDataPointForTrendXValue.xData,
            nearestXValue: nearestDataPointForXValue.xData,
            nearestXValueEnd: nearestDataPointForXValueEnd.xData,
            nearestTrendXValue: nearestDataPointForTrendXValue.xData,
            nearestYValue: nearestYValue,
            nearestYValueEnd: nearestYValueEnd,
            nearestTrendYValue: nearestTrendYValue,
            shape: {
                params: {
                    d: line
                }
            }
        });
        var newReferenceLine = ["M", xAxis.toPixels(nearestDataPointForTrendXValue.xData) - xAxis.toPixels(nearestDataPointForXValue.xData), yAxis.toPixels(nearestTrendYValue) - yAxis.toPixels(options.yValue), 'L', newX, newY];
        self.additionalDrawings.referenceLine.attr({
            d: newReferenceLine
        });
    //}

    infChart.drawingUtils.common.removeDragSupporters.call(self, self.dragSupporters);
    infChart.drawingUtils.common.addDragSupporters.call(self, ann, chart, line, self.dragSupporters, undefined, self.defaultDragSupporterStyles);
    infChart.drawingUtils.common.addDragSupporters.call(self, ann, chart, newReferenceLine, self.dragSupporters, undefined, self.defaultDragSupporterStyles);

    $.each(this.additionalDrawings.lines, function (key, value) {
        var fibLevel = fibLevels.find(function (level) {
            return level.id === key;
        });
        var percentage = parseFloat(fibLevel.value);
        var percentageY = -((yAxis.toPixels(nearestTrendYValue) - yAxis.toPixels(nearestYValue)) * percentage / 100) + line[5];
        var lineStartPosition = newXEnd;
        var lineEndPosition = xAxis.width - xAxis.toPixels(ann.options.xValue);
        var drawingLabel = fibonacciDrawings[key];
        var hideFibLevelButton = self.additionalDrawings.hideFibLevelButton[key];
        var newLine = ["M", lineStartPosition, percentageY, 'L', lineEndPosition, percentageY];

        value.attr({
            d: newLine
        });

        drawingLabel.textSetter(self.getFormattedLabel(yAxis, nearestYValue, nearestTrendYValue, nearestYValueEnd, percentage, stockChart));

        drawingLabel.attr({
            x: lineEndPosition - drawingLabel.width,
            y: percentageY - drawingLabel.height
        });

        self.positionHideIcon(hideFibLevelButton, lineEndPosition, drawingLabel, percentageY);

        if(value.visibility !== 'hidden'){
            var customAttributes = {
                'level': key,
                'visibility':lineDrawings[key].visibility,
                'stroke-width': 10
            }
            infChart.drawingUtils.common.addDragSupporters.call(self, ann, chart, newLine, self.dragSupporters, customAttributes, self.fibLevelDragSupporterStyles);
        }
    });
    self.highlightEachLine();

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

    self.selectAndBindResize();
    chart.selectedAnnotation = ann;
    if (!ann.chart.isContextMenuOpen) {
        self.showQuickDrawingSettings();
    }
    options.selectedDrawing = undefined;
    infChart.drawingUtils.common.onPropertyChange.call(this);
};

infChart.fib3PointPriceProjectionDrawing.prototype.updateMoveStartPoint = function (e) {
    var self = this,
        ann = self.annotation,
        options = ann.options,
        chart = ann.chart,
        lineData = this.moveStartPoint(e),
        line = lineData.line,
        xAxis = chart.xAxis[ann.options.xAxis],
        yAxis = chart.yAxis[ann.options.yAxis],
        y = yAxis.toValue(lineData[5] + yAxis.toPixels(ann.options.yValue));

        // if (options.isSnapTopHighLow) {
        //     line[2] = 0;
        //     line[5] = yAxis.toPixels(options.nearestYValueEnd) - yAxis.toPixels(options.nearestYValue);
        //     referenceLine = self.additionalDrawings.referenceLine.d.split(' ');
        //     referenceLine[2] =  yAxis.toPixels(options.trendYValue) - yAxis.toPixels(options.nearestYValue);
        //     referenceLine[5] =  0;
        //     self.additionalDrawings.referenceLine.attr({
        //         d: ["M", referenceLine[1], yAxis.toPixels(options.trendYValue) - yAxis.toPixels(options.nearestYValue), 'L', referenceLine[4], "0"]
        //     });
        //     ann.update({
        //         yValue: options.nearestYValue,
        //         // trendYValue: options.nearestTrendYValue,
        //         yValueEnd: options.nearestYValueEnd,
        //         shape: {
        //             params: {
        //                 d: line
        //             }
        //         }
        //     });
        //     self.scale();
        // }

        ann.update({
            // yValue: options.nearestYValue,
            trendYValue: lineData.nearestTrendYValue
            // yValueEnd: options.nearestYValueEnd,
            // shape: {
            //     params: {
            //         d: lineData.line
            //     }
            // }
        });

    infChart.drawingUtils.common.saveBaseYValues.call(this, ann.options.yValue, ann.options.yValueEnd, ann.options.trendYValue);
    // infChart.drawingUtils.common.saveNearestBaseYValues.call(this, ann.options.nearestYValue, ann.options.nearestYValueEnd, ann.options.trendYValue);
    infChart.drawingUtils.common.removeDragSupporters.call(self, self.dragSupporters);
    infChart.drawingUtils.common.addDragSupporters.call(self, ann, chart, ['M', line[1], line[2], 'L', line[4], line[5]], self.dragSupporters, undefined, self.defaultDragSupporterStyles);
    var referenceLine = self.additionalDrawings.referenceLine.d.split(' ');
    infChart.drawingUtils.common.addDragSupporters.call(self, ann, chart, ['M', referenceLine[1], referenceLine[2], 'L', referenceLine[4], referenceLine[5]], self.dragSupporters, undefined, self.defaultDragSupporterStyles);

    $.each(self.additionalDrawings.lines, function (key, value) {
        if(value.visibility !== 'hidden'){
            var line = value.d.split(' ');
            var customAttributes = {
                'level' : key,
                'visibility':self.additionalDrawings.lines[key].visibility,
                'stroke-width': 10
            }
            infChart.drawingUtils.common.addDragSupporters.call(self, ann, chart, ['M', line[1], line[2], 'L', line[4], line[5]], self.dragSupporters, customAttributes, self.fibLevelDragSupporterStyles);
        }
    });
    self.highlightEachLine();

    infChart.drawingUtils.common.fixSelectionMarker.call(self, ann);
    infChart.drawingUtils.common.onPropertyChange.call(self);
};

infChart.fib3PointPriceProjectionDrawing.prototype.updateSettings = function (properties) {
    var updateProperties = {
        fillColor: properties.fillColor,
        fillOpacity: properties.fillOpacity,
        lineColor: properties.borderColor,
        lineWidth: properties.strokeWidth,
        fontSize: properties.fontSize,
        fontColor: properties.fontColor,
        isSingleColor: properties.isSingleColor,
        fibLevels: properties.fibLevels,
        isSnapTopHighLowEnabled: properties.isSnapTopHighLow,
        isTrendLineAlwaysEnabled: properties.isTrendLineAlways,
        trendLineColor: properties.trendLineColor,
        trendLineOpacity: properties.trendLineOpacity,
        trendLineWidth: properties.trendLineWidth,
        trendLineStyle: properties.trendLineStyle
    }
    infChart.structureManager.drawingTools.updateFibSettings(this.settingsPopup, updateProperties);
};

infChart.fib3PointPriceProjectionDrawing.prototype.highlightEachLine = function(){
    let self = this,
        ann = self.annotation,
        options = ann.options,
        chart = ann.chart,
        container = chart.container,
        dragSupporters = self.dragSupporters,
        selectedLevel,
        additionalDrawings = self.additionalDrawings,
        fibonacciDrawings = self.fibonacciDrawings,
        fibLabels = self.fibonacciDrawings.lines;

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
                var lines = additionalDrawings.lines;
                var fibLabels = fibonacciDrawings.lines;
                if(selectedLevel){
                    var selectedLine = lines[selectedLevel];
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

infChart.fib3PointPriceProjectionDrawing.prototype.onTrendLineColorChange = function (rgb, color, opacity, isPropertyChange){
    var self = this;
    self.annotation.update({
        shape: {
            params: {
                stroke: color,
                opacity: opacity
            }
        }
    });

    if (self.additionalDrawings.referenceLine){
        self.additionalDrawings.referenceLine.attr({
            stroke: color,
            opacity: opacity
        });
    }

    self.annotation.options.trendLineColor = color;
    self.annotation.options.trendLineOpacity = opacity;

    isPropertyChange && self.onPropertyChange();
    if (this.settingsPopup) {
        this.settingsPopup.data("infUndoRedo", false);
    }
    infChart.drawingUtils.common.saveDrawingProperties.call(self);
};

infChart.fib3PointPriceProjectionDrawing.prototype.onTrendLineWidthChange =  function (strokeWidth, isPropertyChange) {
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

    if (self.additionalDrawings.referenceLine){
        self.additionalDrawings.referenceLine.attr({
            'stroke-width': strokeWidth,
            'stroke-dasharray': strokeDashArray
        });
    }

    self.annotation.options.trendLineWidth = strokeWidth;

    isPropertyChange && self.onPropertyChange();
    if (this.settingsPopup) {
        this.settingsPopup.data("infUndoRedo", false);
    }
    infChart.drawingUtils.common.saveDrawingProperties.call(self);
};



infChart.fib3PointPriceProjectionDrawing.prototype.onTrendLineStyleChange = function (dashStyle, isPropertyChange) {
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

    if (self.additionalDrawings.referenceLine){
        self.additionalDrawings.referenceLine.attr({
            dashstyle: dashStyle,
            'stroke-dasharray': strokeDashArray
        });
    }

    self.annotation.options.trendLineStyle = dashStyle;

    isPropertyChange && self.onPropertyChange();
    if (this.settingsPopup) {
        this.settingsPopup.data("infUndoRedo", false);
    }
    infChart.drawingUtils.common.saveDrawingProperties.call(self);
};

infChart.fib3PointPriceProjectionDrawing.prototype.onTrendLineToggleShow = function(checked, isPropertyChange){
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
            self.resetDragSupporters();
        }
    }

    isPropertyChange && self.onPropertyChange();
    if (this.settingsPopup) {
        this.settingsPopup.data("infUndoRedo", false);
    }

};