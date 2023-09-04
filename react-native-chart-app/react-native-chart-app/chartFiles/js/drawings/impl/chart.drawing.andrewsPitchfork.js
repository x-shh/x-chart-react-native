window.infChart = window.infChart || {};

infChart.andrewsPitchforkDrawing = function () {
    infChart.drawingObject.apply(this, arguments);
    this.fibLevels = [{
            id: 'level_0',
            value: 25,
            enable: false,
            fillColor: '#726a6f',
            lineColor: '#959595',
            lineWidth: 1
        },
        {
            id: 'level_1',
            value: 38.2,
            enable: false,
            fillColor: '#835974',
            lineColor: '#959595',
            lineWidth: 1
        },
        {
            id: 'level_2',
            value: 50,
            enable: false,
            fillColor: '#7b6171',
            lineColor: '#959595',
            lineWidth: 1
        },
        {
            id: 'level_3',
            value: 100,
            enable: true,
            fillColor: '#f8bce2',
            lineColor: '#959595',
            lineWidth: 1
        },
        {
            id: 'level_4',
            value: 100,
            enable: false,
            fillColor: '#f075c3',
            lineColor: '#959595',
            lineWidth: 1
        },
        {
            id: 'level_5',
            value: 150,
            enable: false,
            fillColor: '#eb40ab',
            lineColor: '#959595',
            lineWidth: 1
        },
        {
            id: 'level_6',
            value: 175,
            enable: false,
            fillColor: '#c71585',
            lineColor: '#959595',
            lineWidth: 1
        },
        {
            id: 'level_7',
            value: 200,
            enable: false,
            fillColor: '#800e56',
            lineColor: '#959595',
            lineWidth: 1
        }
    ];
    this.fibLevelDragSupporterStyles = Object.assign({}, infChart.drawingUtils.common.dragSupporterStyles, {cursor: 'pointer', type:'additionalDrawing'});
};

infChart.andrewsPitchforkDrawing.prototype = Object.create(infChart.drawingObject.prototype);

infChart.andrewsPitchforkDrawing.prototype.additionalDrawingsFunction = function () {
    var self = this;
    var ann = self.annotation;
    var chart = ann.chart;
    var options = ann.options;
    var additionalDrawingsObj = self.additionalDrawings;
    var fibonacciDrawings = self.fibonacciDrawings;
    var fibLevels = options.fibLevels ? options.fibLevels : self.fibLevels;
    var theme = infChart.drawingUtils.common.getTheme.call(self);
    var hiddenLevels = [];

    ann.selectionMarker = [];
    additionalDrawingsObj.fill = {};
    additionalDrawingsObj.lines = {};
    fibonacciDrawings.fill = {};
    fibonacciDrawings.lines = {};

    //if base point don't add fork, but add selection pointer
    if (ann.options.trendXValue !== Number.MIN_SAFE_INTEGER && ann.options.trendYValue !== Number.MIN_SAFE_INTEGER) {
        var shapeParams = ann.options.shape.params;
        var drawingAttr = {
            'stroke-width': shapeParams['stroke-width'],
            stroke: shapeParams.stroke,
            'z-index': 4,
            cursor: 'move'
        };

        fibLevels.forEach(function (fibLevel) {
            var themeFillColor = theme.fibRetracements && theme.fibRetracements.fibLevelFillColors && theme.fibRetracements.fibLevelFillColors[fibLevel.id];
            var baseFillOpacity = (theme.andrewsPitchfork && typeof theme.andrewsPitchfork.fillOpacity !== "undefined") ? theme.andrewsPitchfork.fillOpacity : infChart.drawingUtils.common.baseFillOpacity;
            if (!fibLevel.enable) {
                hiddenLevels.push(fibLevel);
            }
            var drawingFillAttr = {
                'fill': options.isSingleColor && options.fillColor ? options.fillColor : fibLevel && fibLevel.fillColor ? fibLevel.fillColor : themeFillColor,
                'fill-opacity': options.isSingleColor && options.fillOpacity ? options.fillOpacity : fibLevel && fibLevel.fillOpacity ? fibLevel.fillOpacity : baseFillOpacity,
                'z-index': 2,
                'cursor': 'default',
                'level': fibLevel.id,
                'pointer-events': 'none'
            };
            var drawingAttr = {
                'stroke-width': options.isSingleColor && options.lineWidth ? options.lineWidth : fibLevel && fibLevel.lineWidth ? fibLevel.lineWidth : ann.options.shape.params['stroke-width'],
                'stroke': options.isSingleColor && options.lineColor ? options.lineColor : fibLevel && fibLevel.lineColor ? fibLevel.lineColor : ann.options.shape.params.stroke,
                'z-index': 3,
                'cursor': 'default',
                'level': fibLevel.id
            };

            var linePath = chart.renderer.path(['M', 0, 0, 'L', 0, 0, 'M', 0, 0, 'L', 0, 0]);
            var fillPath0 = chart.renderer.path(['M', 0, 0, 'L', 0, 0, 'L', 0, 0, 'L', 0, 0, 'L', 0, 0]);
            var fillPath1 = chart.renderer.path(['M', 0, 0, 'L', 0, 0, 'L', 0, 0, 'L', 0, 0, 'L', 0, 0]);

            fibonacciDrawings.lines[fibLevel.id] = linePath.attr(drawingAttr).add(ann.group);
            fibonacciDrawings.fill[fibLevel.id + '-0'] = fillPath0.attr(drawingFillAttr).add(ann.group);
            fibonacciDrawings.fill[fibLevel.id + '-1'] = fillPath1.attr(drawingFillAttr).add(ann.group);
        });

        hiddenLevels.forEach(function (fibLevel) {
            self.onFibLevelChange(fibLevel.id, false, false);
        });

        additionalDrawingsObj["lines"] = chart.renderer.path(['M', 0, 0, 'L', 0, 0, 'M', 0, 0, 'L', 0, 0, 'M', 0, 0, 'L', 0, 0]).attr(drawingAttr).add(ann.group);

        var xAxis = chart.xAxis[ann.options.xAxis],
            yAxis = chart.yAxis[ann.options.yAxis];
        var x = xAxis.toPixels(ann.options.trendXValue) - xAxis.toPixels(ann.options.xValue);
        var y = yAxis.toPixels(ann.options.trendYValue) - yAxis.toPixels(ann.options.yValue);
        if (!isNaN(x) && !isNaN(y)) {
            infChart.drawingUtils.common.addSelectionMarker.call(this, ann, x, y);
        }
    }

    infChart.drawingUtils.common.addSelectionMarker.call(this, ann, 0, 0);
};

infChart.andrewsPitchforkDrawing.prototype.bindSettingsEvents = function () {
    let self = this;
    let isPropertyChange = function () {
        let isPropertyChange = true;
        if (self.settingsPopup) {
            isPropertyChange = this.isSettingsPropertyChange();
        }
        return isPropertyChange;
    };
    let getFibLevelById = function (fibLevelId) {
        return self.annotation.options.fibLevels.find(function (fibLevel) {
            return fibLevel.id === fibLevelId;
        });
    };
    let bindingOptions = {
        onLineWidthChange: function (strokeWidth) {
            let isPropertyChange = true;
            if (self.settingsPopup) {
                isPropertyChange = self.isSettingsPropertyChange();
            }
            self.onLineWidthChange.call(self, strokeWidth, isPropertyChange);
        },
        onColorChange: function (rgb, color) {
            let isPropertyChange = true;
            if (self.settingsPopup) {
                isPropertyChange = self.isSettingsPropertyChange();
            }
            self.onLineColorChange.call(self, rgb, color, isPropertyChange);
        },
        onSingleOptionChange: function (fillColor, fillOpacity, lineColor, lineWidth, fontColor, fontSize, fontWeight, prevOptions, isSingleColor) {
            self.applyAllToFibLines(isSingleColor, fillColor, fillOpacity, lineColor, lineWidth, prevOptions, isPropertyChange.call(self));
        },
        onSingleLineColorChange: function (rgb, lineColor) {
            self.onChangeAllFibLines('lineColor', lineColor, isPropertyChange.call(self));
        },
        onSingleFillColorChange: function (rgb, value, opacity) {
            self.onChangeAllFibLines('fillColor', {
                fill: value,
                opacity: opacity
            }, isPropertyChange.call(self));
        },
        onSingleLineWidthChange: function (strokeWidth) {
            self.onChangeAllFibLines('lineWidth', parseInt(strokeWidth, 10), isPropertyChange.call(self));
        },
        onFibLevelFillColorChange: function (rgb, value, opacity, fibLevelId) {
            self.onChangeFibLines(getFibLevelById(fibLevelId), 'fillColor', {
                fill: value,
                opacity: opacity
            }, isPropertyChange.call(self));
        },
        onFibLevelLineColorChange: function (rgb, value, fibLevelId) {
            self.onChangeFibLines(getFibLevelById(fibLevelId), 'lineColor', value, isPropertyChange.call(self));
        },
        onFibLevelLineWidthChange: function (strokeWidth, fibLevelId) {
            self.onChangeFibLines(getFibLevelById(fibLevelId), 'lineWidth', parseInt(strokeWidth, 10), isPropertyChange.call(self));
        },
        onToggleFibLevel: function (checked, fibLevelId) {
            self.onChangeFibLines(getFibLevelById(fibLevelId), 'enable', checked, isPropertyChange.call(self));
        },
        onFibLvlValueChange: function (fibLevelId, value) {
            self.onChangeFibLines(getFibLevelById(fibLevelId), 'value', value, isPropertyChange.call(self));
        },
        onResetToDefault: function () {
            self.updateSavedDrawingProperties(true);
        },
        onFibApplyAllButtonClick: function (fillColor, fillOpacity, lineColor, lineWidth, fontColor, fontSize, fontWeight, prevOptions) {
            infChart.drawingUtils.common.settings.onFibApplyAllButtonClick.call(self, fillColor, fillOpacity, lineColor, lineWidth, fontColor, fontSize, fontWeight, prevOptions, true);
        }
    };

    // infChart.structureManager.drawingTools.bindRectangleSettings(self.settingsPopup, onColorChange, onLineWidthChange, onFillColorChange, onResetToDefault);
    infChart.structureManager.drawingTools.bindAndrewsPitchForkSettings(self.settingsPopup, bindingOptions);
};

infChart.andrewsPitchforkDrawing.prototype.drawFork = function (drawingObj, isMoveStartPoint) {
    let self = this;
    let ann = self.annotation;
    let chart = ann.chart;
    let options = ann.options;
    let line = ann.shape.d.split(' ');
    let startPointX = parseInt(line[1], 10);
    let startPointY = parseInt(line[2], 10);
    let endPointX = parseInt(line[4], 10);
    let endPointY = parseInt(line[5], 10);
    let plotWidth = chart.plotWidth * infChart.drawingUtils.common.correctionFactor;
    let plotHeight = chart.plotHeight * infChart.drawingUtils.common.correctionFactor;
    let xAxis = chart.xAxis[ann.options.xAxis];
    let yAxis = chart.yAxis[ann.options.yAxis];
    let fibLevels = infChart.drawingUtils.common.sortFibLevelsByValue(options.fibLevels ? options.fibLevels : self.fibLevels);
    let xS, yS;

    if (!isMoveStartPoint) {
        xS = xAxis.toPixels(ann.options.xValue) | 0;
        yS = yAxis.toPixels(ann.options.yValue) | 0;
    } else {
        xS = startPointX + (xAxis.toPixels(ann.options.xValue));
        yS = startPointY + (yAxis.toPixels(ann.options.yValue));
    }

    let dx = endPointX + startPointX;
    let dy = endPointY + startPointY;
    let xB = xAxis.toPixels(ann.options.trendXValue) | 0;
    let yB = yAxis.toPixels(ann.options.trendYValue) | 0;
    let lineD = drawingObj.additionalDrawings.lines
    let xC = xS + dx / 2;
    let yC = yS + dy / 2;
    var srLine;

    if (Object.getOwnPropertyNames(lineD).length > 0) {
        let m, c;

        if (xC < xB) {
            plotWidth = -1 * plotWidth;
        }

        if (!isMoveStartPoint) {
            xC = xS + dx / 2;
            yC = yS + dy / 2;
            m = (yC - yB) / (xC - xB);
            c = yB - (m * xB);
            srLine = ['M', xB - xS, yB - yS, 'L', plotWidth, plotWidth * m + c,
                'M', endPointX, endPointY, 'L', startPointX, startPointY
            ];
        } else {
            let xE = xAxis.toPixels(ann.options.xValueEnd);
            let yE = yAxis.toPixels(ann.options.yValueEnd);
            xC = (xS + xE) / 2;
            yC = (yS + yE) / 2;
            m = (yC - yB) / (xC - xB);
            c = yB - (m * xB);
            let adLine = lineD.d.split(' ');
            srLine = ['M', adLine[1], adLine[2], 'L', plotWidth, plotWidth * m + c,
                'M', endPointX, endPointY, 'L', startPointX, startPointY
            ]
        }

        lineD.attr({
            d: srLine
        });

        let lastEnableLevel;
        fibLevels.forEach(function (fibLevel) {
            let fibValue = fibLevel.value / 100;
            let fibLine = self.fibonacciDrawings.lines[fibLevel.id];
            let fibFill0 = self.fibonacciDrawings.fill[fibLevel.id + '-0'];
            let fibFill1 = self.fibonacciDrawings.fill[fibLevel.id + '-1'];
            let endX, endY, startX, startY, line, pfC1, pfC2, dfx, dfy;
            let fibFillD0, fibFillD1;
            let xm = (endPointX + startPointX) / 2;
            let ym = (startPointY + endPointY) / 2;

            dfx = (xS - xC) * fibValue;
            dfy = (yS - yC) * fibValue;

            if (!isMoveStartPoint) {
                endX = xC - dfx - xS;
                endY = yC - dfy - yS;
                startX = xC + dfx - xS;
                startY = yC + dfy - yS;
            } else {
                endX = xC - dfx - xAxis.toPixels(ann.options.xValue);
                endY = yC - dfy - yAxis.toPixels(ann.options.yValue);
                startX = xC + dfx - xAxis.toPixels(ann.options.xValue);
                startY = yC + dfy - yAxis.toPixels(ann.options.yValue);
            }
            pfC1 = (yC - dfy) - (m * (xC - dfx));
            pfC2 = (yC + dfy) - (m * (xC + dfx));

            line = ['M', startX, startY, 'L', plotWidth, plotWidth * m + pfC2, 'M', endX, endY, 'L', plotWidth, plotWidth * m + pfC1];

            if (lastEnableLevel) {
                let lastEnableLine = self.fibonacciDrawings.lines[lastEnableLevel.id].d.split(' ');

                fibFillD0 = ['M', endX, endY, 'L', plotWidth, plotWidth * m + pfC1, 'L', plotWidth, lastEnableLine[11],
                    'L', lastEnableLine[7], lastEnableLine[8], 'L', endX, endY
                ];
                fibFillD1 = ['M', startX, startY, 'L', plotWidth, plotWidth * m + pfC2, 'L', plotWidth, lastEnableLine[5],
                    'L', lastEnableLine[1], lastEnableLine[2], 'L', startX, startY
                ]
            } else {
                fibFillD0 = ['M', endX, endY, 'L', plotWidth, plotWidth * m + pfC1, 'L', plotWidth, plotWidth * m + c,
                    'L', xm, ym, 'L', endX, endY
                ];
                fibFillD1 = ['M', startX, startY, 'L', plotWidth, plotWidth * m + pfC2, 'L', plotWidth, plotWidth * m + c,
                    'L', xm, ym, 'L', startX, startY
                ]
            }

            if (fibLevel.enable) {
                lastEnableLevel = fibLevel;
            }

            fibFill1.attr({
                d: fibFillD1
            });

            fibFill0.attr({
                d: fibFillD0
            });

            fibLine.attr({
                d: line
            });

        });

    }
};

infChart.andrewsPitchforkDrawing.prototype.getConfig = function () {
    var self = this;
    var annotation = this.annotation;
    var options = annotation.options;
    var fibLevels = options.fibLevels ? infChart.drawingUtils.common.sortFibLevelsByValue(options.fibLevels) : self.fibLevels;
    return {
        shape: 'andrewsPitchfork',
        fibLevels: fibLevels,
        borderColor: options.lineColor,
        fillColor: options.fillColor,
        fillOpacity: options.fillOpacity,
        medianLineColor: options.medianLineColor,
        medianLineWidth: options.medianLineWidth,
        strokeWidth: options.lineWidth,
        trendXValue: options.trendXValue,
        trendYValue: options.trendYValue,
        xValue: options.xValue,
        yValue: options.yValue,
        xValueEnd: options.xValueEnd,
        yValueEnd: options.yValueEnd,
        isSingleColor: options.isSingleColor,
        isLocked : annotation.options.isLocked

    };
}

/**
 * Returns the obj of properties to copy
 * @returns {object} properties
 */
infChart.andrewsPitchforkDrawing.prototype.getConfigToCopy = function () {
    var stockChartId = infChart.drawingsManager.getChartIdFromHighchartInstance(this.annotation.chart);
    var chartInstance = infChart.manager.getChart(stockChartId);
    var xAxis = chartInstance.getMainXAxis();
    var yAxis = chartInstance.getMainYAxis();
    var properties = this.getConfig();
    var shapeTheme = infChart.drawingUtils.common.theme.andrewsPitchfork;
    var copyDistance = shapeTheme && shapeTheme.copyDistance;
    var defaultCopyDistance = infChart.drawingUtils.common.theme.defaultCopyDistance;
    var copyDistanceX = (copyDistance && (copyDistance.x || copyDistance.x == 0)) ? copyDistance.x : defaultCopyDistance;
    var copyDistanceY = (copyDistance && (copyDistance.y || copyDistance.y == 0)) ? copyDistance.y : defaultCopyDistance;

    properties.xValue = xAxis.toValue(xAxis.toPixels(properties.xValue) + copyDistanceX);
    properties.yValue = yAxis.toValue(yAxis.toPixels(properties.yValue) + copyDistanceY);
    properties.trendXValue = xAxis.toValue(xAxis.toPixels(properties.trendXValue) + copyDistanceX);
    properties.trendYValue = yAxis.toValue(yAxis.toPixels(properties.trendYValue) + copyDistanceY);
    if (properties.xValueEnd) {
        properties.xValueEnd = xAxis.toValue(xAxis.toPixels(properties.xValueEnd) + copyDistanceX);
    }
    if (properties.yValueEnd) {
        properties.yValueEnd = yAxis.toValue(yAxis.toPixels(properties.yValueEnd) + copyDistanceY);
    }
    return properties;
};

infChart.andrewsPitchforkDrawing.prototype.getOptions = function (properties) {
    var options = {
        xValue: properties.xValue,
        yValue: properties.yValue,
        trendXValue: Number.MIN_SAFE_INTEGER,
        trendYValue: Number.MIN_SAFE_INTEGER,
        shape: {
            params: {
                d: ['M', 0, 0, 'L', 0, 0]
            }
        }
    };

    var theme = infChart.drawingUtils.common.getTheme.call(this);
    var baseFillColor = (theme.andrewsPitchfork && theme.andrewsPitchfork.singleFillColor) ? theme.andrewsPitchfork.singleFillColor : infChart.drawingUtils.common.baseFillColor;
    var baseFillOpacity = (theme.andrewsPitchfork && typeof theme.andrewsPitchfork.fillOpacity !== "undefined") ? theme.andrewsPitchfork.fillOpacity : infChart.drawingUtils.common.baseFillOpacity;
    var baseBorderColor = (theme.andrewsPitchfork && theme.andrewsPitchfork.borderColor) ? theme.fibRetracements.borderColor : infChart.drawingUtils.common.baseBorderColor;
    var baseLineWidth = (theme.andrewsPitchfork && typeof theme.andrewsPitchfork.lineWidth !== "undefined") ? theme.fibRetracements.lineWidth : infChart.drawingUtils.common.baseLineWidth;

    options.fillColor = properties.fillColor ? properties.fillColor : baseFillColor;
    options.fillOpacity = properties.fillOpacity ? properties.fillOpacity : baseFillOpacity;
    options.lineColor = properties.borderColor ? properties.borderColor : baseBorderColor;
    options.lineWidth = properties.strokeWidth ? properties.strokeWidth : baseLineWidth;
    options.medianLineColor = properties.medianLineColor ? properties.medianLineColor : baseBorderColor;
    options.medianLineWidth = properties.medianLineWidth ? properties.medianLineWidth : baseLineWidth;
    options.shape.params['fill'] = options.fillColor;
    options.shape.params['fill-opacity'] = options.fillOpacity;
    options.shape.params['stroke'] = options.medianLineColor;
    options.shape.params['stroke-width'] = options.medianLineWidth;

    if (properties.xValueEnd && properties.yValueEnd) {
        options.xValueEnd = properties.xValueEnd;
        options.yValueEnd = properties.yValueEnd;
    }
    if (properties.trendXValue && properties.trendYValue) {
        options.trendXValue = properties.trendXValue;
        options.trendYValue = properties.trendYValue;
    } else {
        options.events = null;
    }
    options.disableIntermediateScale = true;
    options.validateTranslationFn = this.validateTranslation;

    options.isSingleColor = typeof properties.isSingleColor !== "undefined" ? properties.isSingleColor : false;
    var fibLevels = properties.fibLevels ? properties.fibLevels : this.fibLevels;
    options.fibLevels = infChart.drawingUtils.common.getFibLevelsWithOpacity(infChart.drawingUtils.common.sortFibLevelsByValue(fibLevels), baseFillOpacity);

    options = infChart.Drawing.prototype.getOptions(properties,options);

    return options;
}

infChart.andrewsPitchforkDrawing.prototype.validateTranslation = function (newXValue) {
    var self = this,
        ann = self.annotation,
        options = ann.options,
        chart = ann.chart,
        seriesData = chart.series[0].xData,
        dataMin = seriesData[0],
        xVal = options.xValue,
        xValEnd = options.xValueEnd,
        trendXVal = options.trendXValue,
        newXValueEnd = xValEnd - xVal + newXValue,
        newTrendXValue = trendXVal - xVal + newXValue,
        totalPoints = infChart.drawingsManager.getTotalPoints(chart),
        dataMax = totalPoints[totalPoints.length - 1];

    return (newXValue >= dataMin && newXValue <= dataMax) && (newXValueEnd >= dataMin && newXValueEnd <= dataMax) && (newTrendXValue >= dataMin && newTrendXValue <= dataMax);
};

infChart.andrewsPitchforkDrawing.prototype.getQuickSettingsPopup = function () {
    var common = infChart.drawingUtils.common;
    return common.getRectangleQuickSettings(common.baseBorderColor);
};

infChart.andrewsPitchforkDrawing.prototype.getSettingsPopup = function () {
    let self = this;
    let options = self.annotation.options;
    let andrewsPitchforkOptions = {};
    andrewsPitchforkOptions['fibLevels'] = options.fibLevels ? options.fibLevels : self.fibLevels;
    andrewsPitchforkOptions['medianLineColor'] = options.medianLineColor;
    andrewsPitchforkOptions['medianLineWidth'] = options.medianLineWidth;
    andrewsPitchforkOptions['fillColor'] = options.fillColor;
    andrewsPitchforkOptions['fillOpacity'] = options.fillOpacity;
    andrewsPitchforkOptions['lineColor'] = options.lineColor;
    andrewsPitchforkOptions['lineWidth'] = options.lineWidth;
    return infChart.drawingUtils.common.getAndrewsPitchForkSettings(andrewsPitchforkOptions);
};

infChart.andrewsPitchforkDrawing.prototype.moveCenterPoint = function (e) {
    var ann = this.annotation,
        chart = ann.chart,
        //bbox = chart.container.getBoundingClientRect(),
        xAxis = chart.xAxis[ann.options.xAxis],
        yAxis = chart.yAxis[ann.options.yAxis],
        x = e.chartX,
        y = e.chartY;
    /* x = e.clientX - bbox.left,
     y = e.clientY - bbox.top;
     if (chart.infScaleX) {
     x = x / chart.infScaleX;
     }
     if (chart.infScaleY) {
     y = y / chart.infScaleY;
     }*/
    //this.basePoint = {xValue : xAxis.toValue(x), yValue : yAxis.toValue(y)};
    ann.update({
        trendXValue: xAxis.toValue(x),
        trendYValue: yAxis.toValue(y)
    });

    this.drawFork(this);

    return ann.shape.d.split(' ');
};

infChart.andrewsPitchforkDrawing.prototype.moveStartPoint = function (e) {
    var ann = this.annotation,
        chart = ann.chart,
        pathDefinition = ann.shape.d.split(' '),
        x = e.chartX,
        y = e.chartY;
    var xAxis = chart.xAxis[ann.options.xAxis],
        yAxis = chart.yAxis[ann.options.yAxis],
        xS = xAxis.toPixels(ann.options.xValue) | 0,
        yS = yAxis.toPixels(ann.options.yValue) | 0,
        dx = x - xS,
        dy = y - yS;

    var line = ["M", parseInt(dx, 10), parseInt(dy, 10), 'L', parseInt(pathDefinition[4], 10), parseInt(pathDefinition[5], 10)];
    ann.shape.attr({
        d: line
    });

    this.drawFork(this, true);

    return line;
};

/**
 * change the fillColor of annotation by given params
 * IMPORTANT :: this method is uesed in commands.wrappers to set undo/redo actions
 * @param {object} rgb rgb value of the color
 * @param {string} value hash value of the color
 * @param {string} opacity
 * @param {boolean|undefined} isPropertyChange property change 
 */
infChart.andrewsPitchforkDrawing.prototype.onFillColorChange = function (rgb, value, opacity, isPropertyChange) {
    var self = this;
    var fillD = self.additionalDrawings.fill;
    if (fillD && fillD.length > 0) {
        fillD.forEach(function (val) {
            val.attr({
                fill: value,
                'fill-opacity': opacity
            })
        });
    }
    self.annotation.update({
        shape: {
            params: {
                fill: value,
                'fill-opacity': opacity
            }
        }
    });

    isPropertyChange && self.onPropertyChange();
    if (this.settingsPopup) {
        this.settingsPopup.data("infUndoRedo", false);
    }
    infChart.drawingUtils.common.saveDrawingProperties.call(self);
};

/**
 * Change the line color of the annotation from the given params
 * IMPORTANT :: this method is uesed in commands.wrappers to set undo/redo actions
 * @param {object} rgb rgb value of the color
 * @param {string} value hash value of the color
 * @param {boolean|undefined} isPropertyChange property change
 */
infChart.andrewsPitchforkDrawing.prototype.onLineColorChange = function (rgb, value, isPropertyChange) {
    let self = this;
    let ann = self.annotation;
    let options = ann.options;

    options.medianLineColor = value;

    if (self.additionalDrawings.lines) {
        self.additionalDrawings.lines.attr({
            stroke: value
        });
    }
    ann.update({
        shape: {
            params: {
                stroke: value
            }
        }
    });

    isPropertyChange && self.onPropertyChange();
    if (this.settingsPopup) {
        this.settingsPopup.data("infUndoRedo", false);
    }
    infChart.drawingUtils.common.saveDrawingProperties.call(self);
};

/**
 * change the line width of annotation by given params
 * IMPORTANT :: this method is uesed in commands.wrappers to set undo/redo actions
 * @param {string} strokeWidth 
 */
infChart.andrewsPitchforkDrawing.prototype.onLineWidthChange = function (strokeWidth, isPropertyChange) {
    let self = this;
    let ann = self.annotation;
    let options = ann.options;

    options.medianLineWidth = strokeWidth;

    if (self.additionalDrawings.lines) {
        self.additionalDrawings.lines.attr({
            'stroke-width': strokeWidth
        });
    }

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
};

infChart.andrewsPitchforkDrawing.prototype.scale = function () {
    var self = this,
        ann = self.annotation,
        chart = ann.chart,
        options = ann.options,
        line = ann.shape.d.split(' '),
        xAxis = chart.xAxis[options.xAxis],
        yAxis = chart.yAxis[options.yAxis],
        x = xAxis.toPixels(options.xValueEnd) | 0,
        y = yAxis.toPixels(options.yValueEnd) | 0,
        xS = xAxis.toPixels(options.xValue) | 0,
        yS = yAxis.toPixels(options.yValue) | 0;

    line[4] = x - xS;
    line[5] = y - yS;

    ann.update({
        shape: {
            params: {
                d: line
            }
        }
    });

    var additionalDrawings = self.additionalDrawings;
    infChart.drawingUtils.common.removeDragSupporters.call(self, self.dragSupporters);
    infChart.drawingUtils.common.addDragSupporters.call(self, ann, chart, ['M', 0, 0, 'L', line[4], line[5]], self.dragSupporters);
    self.drawFork(self);
    if(additionalDrawings.lines && additionalDrawings.lines.d){
        var additionalLine = additionalDrawings.lines.d.split(' ');
        infChart.drawingUtils.common.addDragSupporters.call(self, ann, chart, ['M', additionalLine[1], additionalLine[2], 'L', additionalLine[4], additionalLine[5]], self.dragSupporters);
        self.addFibLevlDragSupporters();
    }
};

infChart.andrewsPitchforkDrawing.prototype.addFibLevlDragSupporters = function(){
    var self = this,
        ann = self.annotation,
        options = ann.options,
        chart = ann.chart,
        fibonacciDrawings = self.fibonacciDrawings;

    if(fibonacciDrawings.lines){
        $.each(fibonacciDrawings.lines, function (key, value) {
            if(value.visibility !== "hidden"){
                var line = value.d.split(' ');
                var customAttributes = {
                    'level' : key,
                    'stroke-width': 15
                }   
                infChart.drawingUtils.common.addDragSupporters.call(self, ann, chart, ['M', line[1], line[2], 'L', line[4], line[5]], self.dragSupporters, customAttributes, self.fibLevelDragSupporterStyles);
                infChart.drawingUtils.common.addDragSupporters.call(self, ann, chart, ['M', line[7], line[8], 'L', line[10], line[11]], self.dragSupporters, customAttributes, self.fibLevelDragSupporterStyles);
            }
        });
    }    
};

infChart.andrewsPitchforkDrawing.prototype.selectAndBindResize = function () {
    var self = this,
        ann = self.annotation,
        pathDefinition;

    ann.events.deselect.call(ann);
    ann.selectionMarker = [];

    var value = self.additionalDrawings.lines;
    if(value && value.d){
        pathDefinition = value.d.split(' ');

        infChart.drawingUtils.common.addAndBindSelectionMarker.call(self, ann, pathDefinition[7], pathDefinition[8], self.stepFunction, self.stop);
        infChart.drawingUtils.common.addAndBindSelectionMarker.call(self, ann, pathDefinition[10], pathDefinition[11], self.moveStartPoint, self.updateMoveStartPoint);
        infChart.drawingUtils.common.addAndBindSelectionMarker.call(self, ann, pathDefinition[1], pathDefinition[2], self.moveCenterPoint, self.updateMoveCenterPoint);
    }

};

infChart.andrewsPitchforkDrawing.prototype.step = function (e) {
    var ann = this.annotation,
        points = infChart.drawingUtils.common.calculateInitialPoints(e, ann, false, 4, 4);

    var line = ["M", 0, 0, 'L', parseInt(points.dx, 10), parseInt(points.dy, 10)];

    ann.shape.attr({
        d: line
    });

    this.drawFork(this);

    return line;
};

infChart.andrewsPitchforkDrawing.prototype.stop = function (e) {
    var ann = this.annotation,
        chart = ann.chart,
        line = this.stepFunction(e),
        xAxis = chart.xAxis[ann.options.xAxis],
        yAxis = chart.yAxis[ann.options.yAxis],
        x = xAxis.toValue(line[4] + xAxis.toPixels(ann.options.xValue)),
        y = yAxis.toValue(line[5] + yAxis.toPixels(ann.options.yValue)),
        self = this;

    ann.update({
        xValueEnd: x,
        yValueEnd: y,
        shape: {
            params: {
                d: line
            }
        }
    });

    infChart.drawingUtils.common.saveBaseYValues.call(this, ann.options.yValue, y, ann.options.trendYValue);
    infChart.drawingUtils.common.removeDragSupporters.call(self, self.dragSupporters);
    infChart.drawingUtils.common.addDragSupporters.call(self, ann, chart, line, self.dragSupporters);

    //$.each(self.additionalDrawings, function (key, value) {

    var value = self.additionalDrawings.lines,
        lineD = value.d.split(' ');

    infChart.drawingUtils.common.addDragSupporters.call(self, ann, chart, [
        'M', lineD[1], lineD[2], 'L', lineD[4], lineD[5],
        'M', lineD[7], lineD[8], 'L', lineD[10], lineD[11]
        //'M', lineD[10], lineD[11], 'L', lineD[16], lineD[17]
    ], self.dragSupporters);
    //  });

    var additionalDrawings = self.additionalDrawings;
    if(additionalDrawings.lines && additionalDrawings.lines.d){
        var additionalLine = additionalDrawings.lines.d.split(' ');
        infChart.drawingUtils.common.addDragSupporters.call(self, ann, chart, ['M', additionalLine[1], additionalLine[2], 'L', additionalLine[4], additionalLine[5]], self.dragSupporters);
        this.addFibLevlDragSupporters();
    }

    infChart.drawingUtils.common.fixSelectionMarker.call(self, ann);
    infChart.drawingUtils.common.onPropertyChange.call(this);
};

infChart.andrewsPitchforkDrawing.prototype.translateEnd = function () {
    infChart.drawingUtils.common.onPropertyChange.call(this);
};

infChart.andrewsPitchforkDrawing.prototype.updateMoveCenterPoint = function (e) {
    var ann = this.annotation,
        chart = ann.chart,
        line = this.moveCenterPoint(e),
        self = this;

    infChart.drawingUtils.common.removeDragSupporters.call(self, self.dragSupporters);
    infChart.drawingUtils.common.addDragSupporters.call(self, ann, chart, line, self.dragSupporters);

    // $.each(self.additionalDrawings, function (key, value) {

    var value = self.additionalDrawings.lines,
        lineD = value.d.split(' ');

    infChart.drawingUtils.common.addDragSupporters.call(self, ann, chart, [
        'M', lineD[1], lineD[2], 'L', lineD[4], lineD[5],
        'M', lineD[7], lineD[8], 'L', lineD[10], lineD[11]
        //'M', lineD[10], lineD[11], 'L', lineD[16], lineD[17]
    ], self.dragSupporters);
    // });
    this.addFibLevlDragSupporters();

    infChart.drawingUtils.common.fixSelectionMarker.call(self, ann);
};

infChart.andrewsPitchforkDrawing.prototype.updateMoveStartPoint = function (e) {
    var ann = this.annotation,
        chart = ann.chart,
        line = this.moveStartPoint(e),
        dx = parseInt(line[4], 0) - parseInt(line[1], 10),
        dy = parseInt(line[5], 0) - parseInt(line[2], 10),
        xAxis = chart.xAxis[ann.options.xAxis],
        yAxis = chart.yAxis[ann.options.yAxis],
        x = xAxis.toValue(line[1] + xAxis.toPixels(ann.options.xValue)),
        y = yAxis.toValue(line[2] + yAxis.toPixels(ann.options.yValue)),
        self = this;

    var srLine = ["M", 0, 0, 'L', dx, dy];

    x = (!isNaN(x) && x) || 0;
    y = (!isNaN(y) && y) || 0;

    ann.update({
        xValue: x,
        yValue: y,
        shape: {
            params: {
                d: srLine
            }
        }
    });

    self.drawFork(self);
    ann.events.deselect.call(ann, e);
    self.selectAndBindResize();
    infChart.drawingUtils.common.removeDragSupporters.call(self, self.dragSupporters);
    infChart.drawingUtils.common.addDragSupporters.call(self, ann, chart, line, self.dragSupporters);

    // $.each(self.additionalDrawings, function (key, value) {
    var value = self.additionalDrawings.lines,
        lineD = value.d.split(' ');

    infChart.drawingUtils.common.addDragSupporters.call(self, ann, chart, [
        'M', lineD[1], lineD[2], 'L', lineD[4], lineD[5],
        'M', lineD[7], lineD[8], 'L', lineD[10], lineD[11],
        'M', lineD[13], lineD[14], 'L', lineD[16], lineD[17]
    ], self.dragSupporters);
    //});
    this.addFibLevlDragSupporters();

    infChart.drawingUtils.common.fixSelectionMarker.call(self, ann);
};

infChart.andrewsPitchforkDrawing.prototype.updateSettings = function (properties) {
    infChart.structureManager.drawingTools.updateAndrewsPitchForkSettings(this.settingsPopup, properties);
    // infChart.structureManager.drawingTools.updateRectangleSettings(this.settingsPopup, properties.borderColor, properties.strokeWidth, properties.fillColor, properties.fillOpacity);
};

infChart.andrewsPitchforkDrawing.prototype.onFibLevelChange = function (currentLevel, checked, isPropertyChange) {
    var self = this;
    var ann = self.annotation;
    var chart = ann.chart;
    var line = ann.shape.d.split(' ');
    var options = self.annotation.options;
    var fibLevels = infChart.drawingUtils.common.sortFibLevelsByValue(options.fibLevels);
    var currentOrderIdx;
    var currentFibLevel;

    fibLevels.some(function (fibLevel, i) {
        if (fibLevel.id === currentLevel) {
            currentOrderIdx = i;
            currentFibLevel = fibLevel;
            return true;
        }
    });
    fibLevels[currentOrderIdx].enable = checked;

    if (checked) {
        self.fibonacciDrawings.lines[currentFibLevel.id].show();
        self.fibonacciDrawings.fill[currentFibLevel.id + '-0'].show();
        self.fibonacciDrawings.fill[currentFibLevel.id + '-1'].show();
    } else {
        self.fibonacciDrawings.lines[currentFibLevel.id].hide();
        self.fibonacciDrawings.fill[currentFibLevel.id + '-0'].hide();
        self.fibonacciDrawings.fill[currentFibLevel.id + '-1'].hide();
    }
    infChart.drawingUtils.common.removeDragSupporters.call(self, self.dragSupporters);
    infChart.drawingUtils.common.addDragSupporters.call(self, ann, chart, line, self.dragSupporters);
    if(self.additionalDrawings.lines && self.additionalDrawings.lines.d){
        var additionalLine = self.additionalDrawings.lines.d.split(' ');
        infChart.drawingUtils.common.addDragSupporters.call(self, ann, chart, ['M', additionalLine[1], additionalLine[2], 'L', additionalLine[4], additionalLine[5]], self.dragSupporters);
        this.addFibLevlDragSupporters();
    }
    isPropertyChange && self.onPropertyChange();
    
    if (this.settingsPopup) {
        this.settingsPopup.data("infUndoRedo", false);
    }
};

infChart.andrewsPitchforkDrawing.prototype.onChangeAllFibLines = function (property, propertyValue, isPropertyChange) {
    let self = this;
    let options = self.annotation.options;
    let fibLevels = options.fibLevels;

    if (isPropertyChange) {
        options.isSingleColor = true;
    }
    switch (property) {
        case 'fillColor':
            options.fillColor = propertyValue.fill;
            options.fillOpacity = propertyValue.opacity;
            break;
        case 'lineColor':
            options.lineColor = propertyValue;
            break;
        case 'lineWidth':
            options.lineWidth = propertyValue;
            break;
        default:
            break;
    }

    fibLevels.forEach(function (fibLevel) {
        self.onChangeFibLines(fibLevel, property, propertyValue, false);
    });

    if (isPropertyChange) {
        self.onPropertyChange();
    }
};

infChart.andrewsPitchforkDrawing.prototype.onChangeFibLines = function (fibLevel, property, propertyValue, isPropertyChange) {
    var self = this,
        ann = self.annotation,
        options = ann.options,
        chart = ann.chart,
        line = ann.shape.d.split(' '),
        isSingleColor = options.isSingleColor;

    switch (property) {
        case 'enable':
            fibLevel.enable = propertyValue;
            if (propertyValue) {
                self.fibonacciDrawings.lines[fibLevel.id].show();
                self.fibonacciDrawings.fill[fibLevel.id + '-0'].show();
                self.fibonacciDrawings.fill[fibLevel.id + '-1'].show();
            } else {
                self.fibonacciDrawings.lines[fibLevel.id].hide();
                self.fibonacciDrawings.fill[fibLevel.id + '-0'].hide();
                self.fibonacciDrawings.fill[fibLevel.id + '-1'].hide();
            }
            self.drawFork(self);
            infChart.drawingUtils.common.removeDragSupporters.call(self, self.dragSupporters);
            infChart.drawingUtils.common.addDragSupporters.call(self, ann, chart, line, self.dragSupporters);
            if(self.additionalDrawings.lines && self.additionalDrawings.lines.d){
                var additionalLine = self.additionalDrawings.lines.d.split(' ');
                infChart.drawingUtils.common.addDragSupporters.call(self, ann, chart, ['M', additionalLine[1], additionalLine[2], 'L', additionalLine[4], additionalLine[5]], self.dragSupporters);
                this.addFibLevlDragSupporters();
            }
            break;
        case 'value':
            fibLevel.value = propertyValue;
            self.drawFork(self);
            infChart.drawingUtils.common.removeDragSupporters.call(self, self.dragSupporters);
            infChart.drawingUtils.common.addDragSupporters.call(self, ann, chart, line, self.dragSupporters);
            if(self.additionalDrawings.lines && self.additionalDrawings.lines.d){
                var additionalLine = self.additionalDrawings.lines.d.split(' ');
                infChart.drawingUtils.common.addDragSupporters.call(self, ann, chart, ['M', additionalLine[1], additionalLine[2], 'L', additionalLine[4], additionalLine[5]], self.dragSupporters);
                this.addFibLevlDragSupporters();
            }
            break;
        case 'lineColor':
            if(!isSingleColor){
                fibLevel.lineColor = propertyValue;
            }
            self.fibonacciDrawings.lines[fibLevel.id].attr({
                'stroke': propertyValue
            });
            break;
        case 'fillColor':
            if(!isSingleColor){
                fibLevel.fillColor = propertyValue.fill;
                fibLevel.fillOpacity = propertyValue.opacity;
            }
            self.fibonacciDrawings.fill[fibLevel.id + '-0'].attr({
                'fill': propertyValue.fill,
                'fill-opacity': propertyValue.opacity
            });
            self.fibonacciDrawings.fill[fibLevel.id + '-1'].attr({
                'fill': propertyValue.fill,
                'fill-opacity': propertyValue.opacity
            });
            break;
        case 'lineWidth':
            if(!isSingleColor){
                fibLevel.lineWidth = propertyValue;
            }    
            self.fibonacciDrawings.lines[fibLevel.id].attr({
                'stroke-width': propertyValue
            });
            break;
        default:
            break;
    }
    if (isPropertyChange) {
        if (this.settingsPopup) {
            this.settingsPopup.data("infUndoRedo", false);
        }
        self.onPropertyChange();
    }
};

infChart.andrewsPitchforkDrawing.prototype.applyAllToFibLines = function (enabled, fillColor, fillOpacity, lineColor, lineWidth, prevOptions, isPropertyChange) {
    let self = this;
    let options = self.annotation.options;
    options.isSingleColor = enabled;
    if (enabled) {
        self.onChangeAllFibLines('lineColor', lineColor, false);
        self.onChangeAllFibLines('lineWidth', parseInt(lineWidth, 10), false);
        self.onChangeAllFibLines('fillColor', {
            fill: fillColor,
            opacity: fillOpacity
        }, false);
    } else {
        options.fibLevels.forEach(fibLevel => {
            let prevFibOption = prevOptions[fibLevel.id];
            self.onChangeFibLines(fibLevel, 'lineColor', prevFibOption.lineColor, false);
            self.onChangeFibLines(fibLevel, 'lineWidth', prevFibOption.lineWidth, false);
            self.onChangeFibLines(fibLevel, 'fillColor', {
                fill: prevFibOption.fillColor,
                opacity: prevFibOption.fillOpacity
            }, false);
        });
    }
    if (isPropertyChange) {
        if (this.settingsPopup) {
            this.settingsPopup.data("infUndoRedo", false);
        }
        self.onPropertyChange();
    }
};

infChart.andrewsPitchforkDrawing.prototype.getContextMenuOptions = function (chartId, drawingId, options, event) {
    var self = this;
    var selectedLevel;
    var contextMenu = {};

    selectedLevel = event.target.getAttribute('level');
    if(!selectedLevel && event.target.parentElement){
        selectedLevel = event.target.parentElement.getAttribute('level');
        if(!selectedLevel && event.target.parentElement.parentElement){
            selectedLevel = event.target.parentElement.parentElement.getAttribute('level');
        }
    }
    if(selectedLevel){
        var levelSelected = self.annotation.options.fibLevels.find(function (fibLevel) {
            if(fibLevel.id === selectedLevel){
                return fibLevel;
            }
        });
    }

    if (!self.isVisibleLastLevel()) {
        var eraseThis = {
            icon: options.erase.icon,
            displayText: options.erase.displayText,
            action: function () {
                if (levelSelected) {
                    self.onChangeFibLines(levelSelected, 'enable', false, true);
                }
            }
        }
        contextMenu["eraseThis"] = eraseThis;
    }
    if (selectedLevel) {
        return Object.assign(contextMenu, infChart.drawingUtils.common.getContextMenuOptions(chartId, drawingId, options));
     } else {
        return infChart.drawingUtils.common.getContextMenuOptions(chartId, drawingId, options);
     }
};

infChart.andrewsPitchforkDrawing.prototype.isVisibleLastLevel = function () {
    return false;
}

infChart.andrewsPitchforkDrawing.prototype.getFibLevelById = function (fibLevelId) {
    var self = this,
        ann = self.annotation,
        options = ann.options;

        var fibLevelDetails = self.annotation.options.fibLevels.find(function (fibLevel) {
            if(fibLevel.id === fibLevelId){
                return fibLevelId;
            }
        });

    return fibLevelDetails;
};
