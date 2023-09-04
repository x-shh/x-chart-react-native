window.infChart = window.infChart || {};

infChart.elliotWaveDrawing = function () {
    infChart.drawingObject.apply(this, arguments);
};

infChart.elliotWaveDrawing.prototype = Object.create(infChart.drawingObject.prototype);

infChart.elliotWaveDrawing.prototype.afterRedrawXAxisWithoutSetExtremes = function () { };


infChart.elliotWaveDrawing.prototype.onChangeSnapToHighLow = function (checked, isPropertyChange) {
    var self = this,
        ann = self.annotation,
        options = ann.options,
        chart = ann.chart;

    options.isSnapTopHighLow = checked;
    if (options.isSnapTopHighLow) {
        var nearestDataForXValue = infChart.math.findNearestDataPoint(chart, options.xValue, undefined, true);
        options.nearestYValue = infChart.drawingUtils.common.getYValue.call(this, 
            this.getNearestYValue(options.yValue, nearestDataForXValue, chart, options.isSnapTopHighLow));
        var nearestDataForXValueEnd = infChart.math.findNearestDataPoint(chart, options.xValueEnd, undefined, true);
        options.nearestYValueEnd =infChart.drawingUtils.common.getYValue.call(this, 
            this.getNearestYValue(options.yValueEnd, nearestDataForXValueEnd, chart, options.isSnapTopHighLow));
        options.nearestYValue = options.yValue;
        options.nearestXValueEnd = nearestDataForXValueEnd.xData;
    }

    var line = self.getBasePatternLine(true);

    ann.update({
        shape: {
            params: {
                d: line
            }
        }
    });

    self.scale(true);
    self.selectAndBindResize();
    chart.selectedAnnotation = ann;
    isPropertyChange && self.onPropertyChange();

    if (this.settingsPopup) {
        this.settingsPopup.data("infUndoRedo", false);
    }
};

infChart.elliotWaveDrawing.prototype.bindSettingsEvents = function () {
    var onChangeSnapToHighLow = function (checked, isPropertyChange) {
        self.onChangeSnapToHighLow.call(self, checked, isPropertyChange);
    };
    infChart.drawingUtils.common.bindElliotWaveSettingsEvents.call(this,onChangeSnapToHighLow);
};

infChart.elliotWaveDrawing.prototype.beforeDestroy = function () {
    var self = this,
        ann = self.annotation;

    var chartId = infChart.drawingsManager.getChartIdFromHighchartInstance(ann.chart);
    infChart.drawingsManager.positionElliotWaveDrawingLabels(chartId);
};

infChart.elliotWaveDrawing.prototype.deselect = function () {
    this.annotation.selectionMarker = [];
    this.additionalDrawings.circles = {};
    this.additionalDrawings.labels["oLabel"].hide();
    var chartId = infChart.drawingsManager.getChartIdFromHighchartInstance(this.annotation.chart);
    infChart.drawingsManager.positionElliotWaveDrawingLabels(chartId, true);
};

/**
* Returns the maximum offset of the axis labels
* @param {Highstock.Axis} axis axis object
* @returns {number} max width
*/
infChart.elliotWaveDrawing.prototype.getAxisOffset = function (axis) {
    return 0;
};

/**
* Returns the base line's path
* @returns Array path to draw base line
*/
infChart.elliotWaveDrawing.prototype.getBasePatternLine = function (updateNearestValues) {
    var self = this,
        ann = self.annotation,
        options = ann.options,
        chart = ann.chart,
        xAxis = chart.xAxis[options.xAxis],
        yAxis = chart.yAxis[options.yAxis],
        x = xAxis.toPixels(options.xValue),
        y = yAxis.toPixels(options.yValue);
        if(updateNearestValues){
            var futureValue = chart.series[0].xData[chart.series[0].xData.length-1];
            var nearestDataForXValue = infChart.math.findNearestDataPoint(chart, options.xValue, undefined, true, true);
            if(futureValue >= nearestDataForXValue.xData){
                options.nearestXValue = nearestDataForXValue.xData;
                var nearestYPoint = self.getNearestYValue(options.yValue, nearestDataForXValue, undefined , options.isSnapTopHighLow);
                options.nearestYValue = nearestYPoint.nearestYValue;
                options.startTopOfthePoint = nearestYPoint.topOfThePoint;
            } else {
                options.nearestXValue = nearestDataForXValue.xData;
                options.nearestYValue = options.yValue;
                options.startTopOfthePoint = true;
            }
        }
        var newX = xAxis.toPixels(options.nearestXValue) - x;
        var newY = yAxis.toPixels(options.nearestYValue) - y;
        line = ['M', newX, newY];

    infChart.util.forEach(options.intermediatePoints, function (index, value) {
        line.push('L');
        if(updateNearestValues){
            var futureValue = chart.series[0].xData[chart.series[0].xData.length-1];
            var nearestDataForXValue = infChart.math.findNearestDataPoint(chart, value.xValue, undefined, true, true);
            if(futureValue >= nearestDataForXValue.xData){
                var nearestYInterPoint = self.getNearestYValue(value.yValue, nearestDataForXValue, undefined , options.isSnapTopHighLow);
                var nearestYValue = nearestYInterPoint.nearestYValue;
                var topOfThePoint = nearestYInterPoint.topOfThePoint;
                options.nearestIntermediatePoints[index] = {xValue: nearestDataForXValue.xData, yValue: nearestYValue, topOfThePoint: topOfThePoint};
            } else {
                options.nearestIntermediatePoints[index] = {xValue: nearestDataForXValue.xData, yValue: value.yValue, topOfThePoint: true};
            }
        }
        line.push(xAxis.toPixels(options.nearestIntermediatePoints[index].xValue) - x);
        line.push(yAxis.toPixels(options.nearestIntermediatePoints[index].yValue) - y);
    });

    if (options.xValueEnd) {
        line.push('L');
        if(updateNearestValues){
            var futureValue = chart.series[0].xData[chart.series[0].xData.length-1];
            var nearestDataForXValueEnd = infChart.math.findNearestDataPoint(chart, options.xValueEnd, undefined, true, true);
            if(futureValue >= nearestDataForXValueEnd.xData){
                options.nearestXValueEnd = nearestDataForXValueEnd.xData;
                var nearestYEndPoint = self.getNearestYValue(options.yValueEnd, nearestDataForXValueEnd, undefined , options.isSnapTopHighLow);
                options.nearestYValueEnd = nearestYEndPoint.nearestYValue;
                options.endTopOfthePoint = nearestYEndPoint.topOfThePoint;
            } else {
                options.nearestXValueEnd = nearestDataForXValueEnd.xData;
                options.nearestYValueEnd = options.yValueEnd;
                options.endTopOfthePoint = true;
            }
        }
        line.push(xAxis.toPixels(options.nearestXValueEnd) - x);
        line.push(yAxis.toPixels(options.nearestYValueEnd) - y);
    }
    return line;
};

infChart.elliotWaveDrawing.prototype.getInfoLabel = function (name, x, y) {
    var self = this,
        ann = self.annotation,
        chart = ann.chart,
        theme = infChart.drawingUtils.common.getTheme(),
        shapeTheme = theme["elliotWave"];;
    var basicText = "";
    basicText = basicText !== "" ? '<br>' : '--';
    var label = chart.renderer.label('--', x, y).attr({
        'zIndex': 30,
        'r': 3,
        'opacity': shapeTheme && shapeTheme.label && shapeTheme.label.opacity || 1,
        'stroke': shapeTheme && shapeTheme.label && shapeTheme.label.stroke || "#858587",
        'stroke-width': 0,
        'hAlign': 'center',
        'class': 'line-lbl',
        'fill': shapeTheme && shapeTheme.label && shapeTheme.label.fill || "#858587",
        'padding': 5,
        'min-width' : 80
    }).css({
        color: shapeTheme && shapeTheme.label && shapeTheme.label.fontColor || "#fff",
        fontSize: '12px',
        cursor: 'move',
        fontWeight: '700',
        fontStyle: 'normal',
        textDecoration: 'inherit'
    }).add(ann.group).hide();
    return label;
};

infChart.elliotWaveDrawing.prototype.getLabelFormattedXValue = function (value, axis) {
    var interval = infChart.manager.getChart(infChart.manager.getContainerIdFromChart(this.chart.renderTo.id)).interval;
    var format = axis.options.dateTimeLabelFormats.day + " " + axis.options.dateTimeLabelFormats.minute;
    if (interval === 'D' || interval === 'W' || interval === 'M' || interval === 'Y') {
        format = axis.options.dateTimeLabelFormats.day;
    }
    return infChart.util.formatDate(value, format);
};

/**
 * Returns the formatted label
 * @param {number} yValue actual value
 * @param {number} optionsyValue value in the options
 * @returns {string} formatted value to be set
 */
 infChart.elliotWaveDrawing.prototype.getLabelFormattedYValue = function (yValue, optionsyValue) {
    var stockChart = this.stockChart;
    var value;
    if (stockChart.isPercent) {
        value = stockChart.getYLabel(optionsyValue, true, false, false);
    } else {
        value = stockChart.formatValue(yValue, stockChart.getMainSeries().options.dp);
    }
    return value;
};

/**
* Returns the the drawing options from saved|initial properties
* @param {object} properties drawing properties
* @returns {{name: *, indicatorId: *, utilizeAxes: string, xValue: *, yValue: *, xValueEnd: *, yValueEnd: *, intermediatePoints: Array, allowDragY: boolean, shape: {params: {fill: string, d: *[]}}, isIndicator: boolean, drawingType: string, allowDragX: boolean}} options to set
*/
infChart.elliotWaveDrawing.prototype.getOptions = function (properties, chart) {
    var self = this;
    var nearestDataForXValue = infChart.math.findNearestDataPoint(chart, properties.xValue, undefined, true, true);
    var futureValue = chart.series[0].xData[chart.series[0].xData.length-1];
    var options = {
        name: properties.name,
        xValue: properties.xValue,
        yValue: properties.yValue,
        xValueEnd: properties.xValueEnd,
        yValueEnd: properties.yValueEnd,
        nearestXValue: nearestDataForXValue.xData,
        allowDragX: false,
        allowDragY: false,
        allowDragByHandle: true,
        intermediatePoints: [],
        nearestIntermediatePoints: [],
        shape: {
            params: {
                d: ['M', 0, 0, 'L', 0, 0]
            }
        }
    };

    var nearestStartValues = {};
    if(futureValue >= nearestDataForXValue.xData){
        nearestStartValues = this.getNearestYValue(properties.yValue, nearestDataForXValue, chart , options.isSnapTopHighLow);
    } else {
        nearestStartValues.nearestYValue = properties.yValue;
        nearestStartValues.topOfThePoint = true;
    }
    options.nearestYValue = infChart.drawingUtils.common.getYValue.call(this, nearestStartValues.nearestYValue);
    options.startTopOfthePoint = nearestStartValues.topOfThePoint;

    if (properties.xValueEnd && properties.yValueEnd) {
        var nearestDataForXValueEnd = infChart.math.findNearestDataPoint(chart, properties.xValueEnd, undefined, true, true);
        var nearestEndValues =  {};
        if(futureValue >= nearestDataForXValue.xData){
            var nearestEndValues = this.getNearestYValue(properties.yValueEnd, nearestDataForXValueEnd, chart , options.isSnapTopHighLow);
        } else {
            nearestEndValues.nearestYValue = properties.yValueEnd;
            nearestEndValues.topOfThePoint = true;
        }
        options.nearestXValueEnd = nearestDataForXValueEnd.xData;
        options.nearestYValueEnd = infChart.drawingUtils.common.getYValue.call(this, nearestEndValues.nearestYValue);
        options.endTopOfthePoint = nearestEndValues.topOfThePoint;
    }

    options.shape.params["fill-opacity"] = 0;

    if (properties.currentWaveDegree) {
        options.currentWaveDegree = properties.currentWaveDegree;
    } else {
        options.currentWaveDegree = this.currentWaveDegree;
    }

    if (properties.borderColor || properties.color) {
        options.shape.params.stroke = properties.color || properties.borderColor;
    }else{
        var waveDegreeSelected;
        this.waveDegrees.forEach(function(value, index){
            if(value.name === options.currentWaveDegree){
                waveDegreeSelected = value;
            }
        });
        options.shape.params.stroke = waveDegreeSelected.color;
    }

    if (properties.strokeWidth) {
        options.shape.params['stroke-width'] = properties.strokeWidth;
    }

    if (properties.intermediatePoints) {
        infChart.util.forEach(properties.intermediatePoints, function(index , value){
            options.intermediatePoints.push({
                xValue: value.xValue,
                yValue: value.yValue,
                topOfThePoint: value.topOfThePoint
            });
        });
    }

    if (properties.intermediatePoints) {
        infChart.util.forEach(properties.intermediatePoints, function(index , value){
            var nearestDataForIntermediateValue = infChart.math.findNearestDataPoint(chart, value.xValue, undefined, true, true);
            options.nearestIntermediatePoints.push({
                xValue: nearestDataForIntermediateValue.xData,
                yValue: infChart.drawingUtils.common.getYValue.call(self, self.getNearestYValue(value.yValue, nearestDataForIntermediateValue, chart , options.isSnapTopHighLow).nearestYValue),
                topOfThePoint: value.topOfThePoint
            });
        });
    }

    if (properties.completedSteps) {
        options.completedSteps = properties.completedSteps;
    }

    options.textFontSize = properties.textFontSize ? properties.textFontSize : 16;

    options.isRealTimeTranslation = true; // since label value is needed to be changed
    options.isSnapTopHighLow = typeof properties.isSnapTopHighLow !== "undefined" ? properties.isSnapTopHighLow : false;

    options = infChart.Drawing.prototype.getOptions(properties,options);

    return options;
};

infChart.elliotWaveDrawing.prototype.getQuickSettingsPopup = function () {
    var common = infChart.drawingUtils.common;
    return infChart.structureManager.drawingTools.getElliotWaveQuickSettings(common.baseBorderColor);
};

infChart.elliotWaveDrawing.prototype.onclick = function () {
    infChart.drawingUtils.common.getAxisLabelToFront.call(this, this.additionalDrawings.axisLabels["xLabel_x"]);
};

infChart.elliotWaveDrawing.prototype.scaleSelectionMarkers = function (lineShapes) {
    var self = this;
    var additionalDrawingsArr = self.additionalDrawings;
    var clipPosX = lineShapes.positions.axisClips.x;
    var clipPosY = lineShapes.positions.axisClips.y;
    additionalDrawingsArr.rect.x && additionalDrawingsArr.rect.x.attr({
        x: clipPosX.x,
        y: clipPosX.y,
        width: clipPosX.w,
        height: clipPosX.h
    });
    additionalDrawingsArr.rect.y && additionalDrawingsArr.rect.y.attr({
        x: clipPosY.x,
        y: clipPosY.y,
        width: clipPosY.w,
        height: clipPosY.h
    });
};

infChart.elliotWaveDrawing.prototype.select = function () {
    this.additionalDrawings.labels["oLabel"].show();
    var chartId = infChart.drawingsManager.getChartIdFromHighchartInstance(this.annotation.chart);
    infChart.drawingsManager.positionElliotWaveDrawingLabels(chartId, true);
 };

infChart.elliotWaveDrawing.prototype.selectAndBindResize = function () {
    this.setSelectionMarkers();
};

infChart.elliotWaveDrawing.prototype.translate = function () {
    this.scaleSelectionMarkers(this.getPatternShapes());
};

infChart.elliotWaveDrawing.prototype.updateSettings = function (properties) {
    infChart.structureManager.drawingTools.updateElliotWaveSettings(this.settingsPopup, properties.borderColor, properties.strokeWidth, properties.currentWaveDegree,properties.isSnapTopHighLow, properties.textFontSize);
};

infChart.elliotWaveDrawing.prototype.getNearestYValue = function (yValue, nearestDataPoint, chart, isSnapTopHighLow) {
    var self = this,
        ann = self.annotation;

    if(ann){
        chart = ann.chart;
    }
    var nearestYValue = yValue;
    var topOfThePoint = true;

    if (isSnapTopHighLow) {
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
      var topOfThePoint;
      if (yValue) {
        if (Math.abs(yValue - nearestYValueOpen) < Math.abs(yValue - nearestYValueClose)) {
          topOfThePoint = true;
          nearestYValue = nearestYValueOpen;
        } else {
          topOfThePoint = false;
          nearestYValue = nearestYValueClose;
        }
      }
    }
    return {nearestYValue : nearestYValue, topOfThePoint: topOfThePoint};
}; 

infChart.elliotWaveDrawing.prototype.getIntermediatePointsSnappedValues = function(updateNearestValues){
    var self = this,
        ann = self.annotation,    
        options = ann.options,
        chart = ann.chart,
        xAxis = chart.xAxis[options.xAxis];
        yAxis = chart.yAxis[options.yAxis];
        intermediatePoints = options.intermediatePoints;

    var x = xAxis.toPixels(options.xValue);
    var y = yAxis.toPixels(options.yValue);
    var intermideate = [];
    
    if(intermediatePoints){
        infChart.util.forEach(options.intermediatePoints, function (index, value) {
            if(intermediatePoints[index]){
                if(updateNearestValues){
                    var futureValue = chart.series[0].xData[chart.series[0].xData.length-1];
                    var nearestDataForXValue = infChart.math.findNearestDataPoint(chart, intermediatePoints[index].xValue, undefined, true, true);
                    if(futureValue >= nearestDataForXValue.xData){
                        var nearestYInterPoints = self.getNearestYValue(intermediatePoints[index].yValue, nearestDataForXValue, undefined, options.isSnapTopHighLow);
                        options.nearestIntermediatePoints[index] = {xValue: nearestDataForXValue.xData, yValue: nearestYInterPoints.nearestYValue, topOfThePoint: nearestYInterPoints.topOfThePoint}
                    } else {
                        options.nearestIntermediatePoints[index] = {xValue: nearestDataForXValue.xData, yValue: intermediatePoints[index].yValue, topOfThePoint: true}
                    }
                }
                var newX = xAxis.toPixels(options.nearestIntermediatePoints[index].xValue) - x;
                var newY = yAxis.toPixels(options.nearestIntermediatePoints[index].yValue) - y;
                intermideate.push({x: newX, y: newY, xValue: options.nearestIntermediatePoints[index].xValue, yValue: options.nearestIntermediatePoints[index].yValue, topOfThePoint: options.nearestIntermediatePoints[index].topOfThePoint});
            }
        });
    }

    return intermideate;
};

infChart.elliotWaveDrawing.prototype.getLabelData = function (annotation, calculatedLabelData) {
    self = this;
    var labelHtml = '<div style = "display: grid; grid-row-gap: 5px; padding: 5px">';
    var options = annotation.options;
    var islabelItemAvailable = false;
    $.each(self.labelDataItems, function (index, labelDataItem) {
        switch (labelDataItem.id) {
            case 'price': {
                if(calculatedLabelData.price !== undefined){
                    labelHtml = labelHtml +
                        '<span class="drawing-lbl-box__label" style="color: #ffffff !important; font-weight: 500 !important">' + calculatedLabelData.price.toFixed(2) + '</span></span><br>';
                    islabelItemAvailable = true;
                }
            }
                break;
            case 'type': {
                if(calculatedLabelData.type !== undefined){
                    labelHtml = labelHtml +
                        '<span class="drawing-lbl-box__label" style="color: #ffffff !important; font-weight: 500 !important">' + calculatedLabelData.type + '</span></span><br>';
                    islabelItemAvailable = true;
                }
            }
                break;
            case 'priceDifference': {
                if(calculatedLabelData.priceDifference !== undefined){
                    labelHtml = labelHtml +
                        '<span class="drawing-lbl-box__label" style="color: #ffffff !important; font-weight: 500 !important">' + calculatedLabelData.priceDifference.toFixed(2) + '</span></span><span class="drawing-lbl-box__label" style="color: #ffffff !important; font-weight: 500 !important">, [' + calculatedLabelData.pricePercentage.toFixed(2) +'%]</span></span><br>';
                    islabelItemAvailable = true;
                }else{
                    labelHtml = labelHtml +
                    '<span class="drawing-lbl-box__label" style="color: #ffffff !important; font-weight: 500 !important">' + 'Starting Point' + '</span></span><br>';
                    islabelItemAvailable = true; 
                }
            }
                break;
            case 'waveDegree': {
                if(calculatedLabelData.waveDegree !== undefined){
                    labelHtml = labelHtml +
                        '<span class="drawing-lbl-box__label" style="color: #ffffff !important; font-weight: 500 !important">' + calculatedLabelData.waveDegree + '</span></span><br>';
                    islabelItemAvailable = true;
                }
            }
                break;
        }
    });

    labelHtml = labelHtml + "</div>";

    if (!islabelItemAvailable) {
        labelHtml = null;
    }

    return labelHtml;
}

infChart.elliotWaveDrawing.prototype.getSnappedValues = function (){
    var self = this,
        ann = self.annotation,    
        options = ann.options,
        chart = ann.chart,
        xAxis = chart.xAxis[options.xAxis];
        yAxis = chart.yAxis[options.yAxis];
        intermediatePoints = options.intermediatePoints;
        var snappedPoints = [];

    var futureValue = chart.series[0].xData[chart.series[0].xData.length-1];
    if(options.xValue && options.yValue){
        var nearestDataForXValue = infChart.math.findNearestDataPoint(chart, options.xValue, undefined, true);
        var xValue, yValue;
        if(futureValue >= nearestDataForXValue.xData){
            xValue = nearestDataForXValue.xData;
            yValue = self.getNearestYValue(options.yValue, nearestDataForXValue, undefined , options.isSnapTopHighLow).nearestYValue;
        } else {
            xValue = nearestDataForXValue.xData;
            yValue = options.yValue;
        }
        snappedPoints.push({xValue: xValue, yValue: yValue});
    }
    
    if(intermediatePoints){
        infChart.util.forEach(options.intermediatePoints, function (index, value) {
            if(intermediatePoints[index]){
                var nearestDataForXValue = infChart.math.findNearestDataPoint(chart, intermediatePoints[index].xValue, undefined, true);
                if(futureValue >= nearestDataForXValue.xData){
                    var intermediateXValue = nearestDataForXValue.xData;
                    var intermediateYValue = self.getNearestYValue(intermediatePoints[index].yValue, nearestDataForXValue, undefined , options.isSnapTopHighLow).nearestYValue;
                } else {
                    var intermediateXValue = nearestDataForXValue.xData;
                    var intermediateYValue = intermediatePoints[index].yValue;
                }
                snappedPoints.push({xValue: intermediateXValue, yValue: intermediateYValue});
            }
        });
    }

    if(options.xValueEnd && options.yValueEnd){
        var nearestDataForXValueEnd = infChart.math.findNearestDataPoint(chart, options.xValueEnd, undefined, true);
        if(futureValue >= nearestDataForXValueEnd.xData){
            var xValueEnd = nearestDataForXValueEnd.xData;
            var yValueEnd = self.getNearestYValue(options.yValueEnd, nearestDataForXValueEnd, undefined , options.isSnapTopHighLow).nearestYValue;
        } else {
            var xValueEnd = nearestDataForXValueEnd.xData;
            var yValueEnd = options.yValueEnd;
        }
        snappedPoints.push({xValue: xValueEnd, yValue: yValueEnd});
    }

    return snappedPoints;
};

infChart.elliotWaveDrawing.prototype.setNearestYValues = function(options, chart){
    var self = this;

    var nearestDataForXValue = infChart.math.findNearestDataPoint(chart, options.xValue, undefined, true);
    self.nearestYValue = self.getNearestYValue(options.yValue, nearestDataForXValue, chart, options.isSnapTopHighLow);

    var nearestDataForXValueEnd = infChart.math.findNearestDataPoint(chart, options.xValueEnd, undefined, true);
    self.nearestYValueEnd = self.getNearestYValue(options.yValueEnd, nearestDataForXValueEnd, chart , options.isSnapTopHighLow);
};