window.infChart = window.infChart || {};

infChart.polylineDrawing = function () {
    infChart.drawingObject.apply(this, arguments);
};

infChart.polylineDrawing.prototype = Object.create(infChart.drawingObject.prototype);

/**
* set additional drawings of the tool
*/
infChart.polylineDrawing.prototype.additionalDrawingsFunction = function () {
    var self = this,
        additionalDrawingsArr = self.additionalDrawings,
        ann = self.annotation;
    additionalDrawingsArr.circles = {};
    ann.selectionMarker = [];
    self.setSelectionMarkers();
    
};

/**
* Get xAxis labels to front when there is an real-time update which is to redraw the chart without extrem changes
*/
infChart.polylineDrawing.prototype.afterRedrawXAxisWithoutSetExtremes = function () { };

infChart.polylineDrawing.prototype.bindSettingsEvents = function () {
    infChart.drawingUtils.common.bindPolylineSettingsEvents.call(this);
};

infChart.polylineDrawing.prototype.deselect = function () {
    this.annotation.selectionMarker = [];
    this.additionalDrawings.circles = {};
};

/**
* Returns the maximum offset of the axis labels
* @param {Highstock.Axis} axis axis object
* @returns {number} max width
*/
infChart.polylineDrawing.prototype.getAxisOffset = function (axis) {
    return 0;
};

/**
* Returns the base line's path
* @returns Array path to draw base line
*/
infChart.polylineDrawing.prototype.getBasePatternLine = function () {
    var self = this,
        ann = self.annotation,
        options = ann.options,
        chart = ann.chart,
        xAxis = chart.xAxis[options.xAxis],
        yAxis = chart.yAxis[options.yAxis],
        x = xAxis.toPixels(options.xValue),
        y = yAxis.toPixels(options.yValue),
        nearestDataForXValue = infChart.math.findNearestDataPoint(chart, options.xValue, undefined, options.useAllXDataToFindNearestPoint, options.useFutureDate),
        newX = xAxis.toPixels(nearestDataForXValue.xData) - x,
        line = ['M', newX, 0];

    infChart.util.forEach(options.intermediatePoints, function (index, value) {
        nearestDataForIntermediateXValue = infChart.math.findNearestDataPoint(chart, value.xValue, undefined, options.useAllXDataToFindNearestPoint, options.useFutureDate),
        newIntermediateX = xAxis.toPixels(nearestDataForIntermediateXValue.xData) - x,
        line.push('L');
        line.push(newIntermediateX);
        line.push(yAxis.toPixels(value.yValue) - y);
    });

    if (options.xValueEnd) {
        var nearestDataForXValueEnd = infChart.math.findNearestDataPoint(chart, options.xValueEnd, undefined, options.useAllXDataToFindNearestPoint, options.useFutureDate);
        var newXEnd = xAxis.toPixels(nearestDataForXValueEnd.xData) - x;
        line.push('L');
        line.push(newXEnd);
        line.push(yAxis.toPixels(options.yValueEnd) - y);
    }
    return line;
};

infChart.polylineDrawing.prototype.getClickValues = function (clickX, clickY) {
    var ann = this.annotation;
        chart = ann.chart,
        options = ann.options,
        xAxis = chart.xAxis[options.xAxis],
        yAxis = chart.yAxis[options.yAxis];
    var coordinates = {
        xValue: options.xValue,
        yValue: options.yValue,
        intermediatePoints: options.intermediatePoints
    };

    if(coordinates.intermediatePoints[ann.options.completedSteps - 1]){
        coordinates.intermediatePoints[ann.options.completedSteps - 1].xValue = xAxis.toValue(clickX);
        coordinates.intermediatePoints[ann.options.completedSteps - 1].yValue = yAxis.toValue(clickY);
    }else{
        coordinates.intermediatePoints[ann.options.completedSteps - 1] = {};
        coordinates.intermediatePoints[ann.options.completedSteps - 1].xValue = xAxis.toValue(clickX);
        coordinates.intermediatePoints[ann.options.completedSteps - 1].yValue = yAxis.toValue(clickY);
    }
    return coordinates;
};

/**
* Returns the config to save
* @returns {{shape: string, borderColor: *, strokeWidth: *, xValue: *, yValue: *, xValueEnd: *, yValueEnd: *, intermediatePoints: Array}} config object
*/
infChart.polylineDrawing.prototype.getConfig = function () {
    var annotation = this.annotation;
    var intermediatePoints = [];

    infChart.util.forEach(annotation.options.intermediatePoints, function(index , value){
        intermediatePoints.push({
            xValue: value.xValue,
            yValue: value.yValue
        });
    });

    return {
        shape: 'polyline',
        borderColor: annotation.options.shape.params.stroke,
        fillColor: annotation.options.shape.params.fill,
        fillOpacity: annotation.options.shape.params['fill-opacity'],
        strokeWidth: annotation.options.shape.params['stroke-width'],
        xValue: annotation.options.xValue,
        yValue: annotation.options.yValue,
        xValueEnd: annotation.options.xValueEnd,
        yValueEnd: annotation.options.yValueEnd,
        intermediatePoints: intermediatePoints,
        fillColorPicker: annotation.options.fillColorPicker,
        fillOpacityPicker: annotation.options.fillOpacityPicker,
        finalCompletedSteps: annotation.options.finalCompletedSteps,
        drawingIsFullFilled: annotation.options.drawingIsFullFilled,
        lineStyle: annotation.options.shape.params.dashstyle,
        isLocked : annotation.options.isLocked

    };
};

/**
* Returns the the drawing options from saved|initial properties
* @param {object} properties drawing properties
* @returns {{name: *, indicatorId: *, utilizeAxes: string, xValue: *, yValue: *, xValueEnd: *, yValueEnd: *, intermediatePoints: Array, allowDragY: boolean, shape: {params: {fill: string, d: *[]}}, isIndicator: boolean, drawingType: string, allowDragX: boolean}} options to set
*/
infChart.polylineDrawing.prototype.getOptions = function (properties) {
    var options = {
        name: properties.name,
        xValue: properties.xValue,
        yValue: properties.yValue,
        xValueEnd: properties.xValueEnd,
        yValueEnd: properties.yValueEnd,
        intermediatePoints: [],
        shape: {
            params: {
                d: ['M', 0, 0, 'L', 0, 0]
            }
        }
    };

    if(properties.fillOpacity){
        options.shape.params["fill-opacity"] = properties.fillOpacity;
    }else{
        options.shape.params["fill-opacity"] = 0;
    }

    if (properties.fillColor) {
        options.shape.params.fill = properties.fillColor;
    }

    if(properties.fillOpacityPicker){
        options.fillOpacityPicker = properties.fillOpacityPicker;
    }else{
        options.fillOpacityPicker = 0.5;
    }

    if (properties.fillColorPicker) {
        options.fillColorPicker = properties.fillColorPicker;
    }

    if (properties.borderColor) {
        options.shape.params.stroke = properties.color || properties.borderColor;
    }

    if (properties.lineStyle) {
        options.shape.params.dashstyle = properties.lineStyle;
    } else {
        options.shape.params.dashstyle = 'solid';
    }

    if (properties.strokeWidth) {
        options.shape.params['stroke-width'] = properties.strokeWidth;
    }

    if (properties.intermediatePoints) {
        infChart.util.forEach(properties.intermediatePoints, function(index , value){
            options.intermediatePoints.push({
                xValue: value.xValue,
                yValue: value.yValue
            });
        });
    }
    if (properties.completedSteps) {
        options.completedSteps = properties.completedSteps;
    }

    if(properties.drawingIsFullFilled){
        options.drawingIsFullFilled = properties.drawingIsFullFilled;
    }else{
        options.drawingIsFullFilled = false
    }

    if (properties.finalCompletedSteps) {
        options.finalCompletedSteps = properties.finalCompletedSteps;
    }
    options.useAllXDataToFindNearestPoint = true;
    options.useFutureDate = true;
    // options.isRealTimeTranslation = true; // since label value is needed to be changed
    options.validateTranslationFn = this.validateTranslation;

    options = infChart.Drawing.prototype.getOptions(properties,options);

    return options;
};

infChart.polylineDrawing.prototype.validateTranslation = function (newXValue) {
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

        for (intermediate of options.intermediatePoints){
            var intermediateXVal = intermediate.xValue;
            var newIntermediateVal = intermediateXVal - xVal + newXValue;
            if(newIntermediateVal < dataMin || newIntermediateVal > dataMax){
                return false;
            }
        }
  
    return (newXValue >= dataMin && newXValue <= dataMax) && (newXValueEnd >= dataMin && newXValueEnd <= dataMax);
}; 

/**
* Returns the paths, values and positions of the shapes under this drawing
* @returns {object} pattern shapes
*/
infChart.polylineDrawing.prototype.getPatternShapes = function () {
    var nameAdditionalY = 25;
    var patternPaths = {};

    var ann = this.annotation;
    var chart = ann.chart;
    var options = ann.options;
    var intermediatePoints = options.intermediatePoints;
    var intermediatePointsRaw = this.intermediatePoints;
    var xAxis = chart.xAxis[options.xAxis];
    var yAxis = chart.yAxis[options.yAxis];

    var x = xAxis.toPixels(options.xValue);
    var y = yAxis.toPixels(options.yValue);
    var nearestDataForXValue = infChart.math.findNearestDataPoint(chart, options.xValue, undefined, options.useAllXDataToFindNearestPoint, options.useFutureDate);
    var newX = xAxis.toPixels(nearestDataForXValue.xData) - x;
    
    var points = {
        circles :  [
            { x: newX, y: 0 }
        ]
    }

    infChart.util.forEach(intermediatePoints, function (index, value) {
        var nearestDataForIntermediateXValue = infChart.math.findNearestDataPoint(chart, intermediatePoints[index].xValue, undefined, options.useAllXDataToFindNearestPoint, options.useFutureDate);
        var newX = xAxis.toPixels(nearestDataForIntermediateXValue.xData) - x;
        points.circles[index+1] = {x: newX, y: yAxis.toPixels(intermediatePoints[index].yValue) - y};
    });
    if(!options.drawingIsFullFilled){
        if(options.xValueEnd && options.yValueEnd){
            var nearestDataForXValueEnd = infChart.math.findNearestDataPoint(chart, options.xValueEnd, undefined, options.useAllXDataToFindNearestPoint, options.useFutureDate);
            var newXEnd = xAxis.toPixels(nearestDataForXValueEnd.xData) - x;
            points.circles[intermediatePoints.length+1] = {x: newXEnd, y: yAxis.toPixels(options.yValueEnd) - y}
        };
    }

    patternPaths.positions =  points;
    return patternPaths;
};

infChart.polylineDrawing.prototype.getQuickSettingsPopup = function () {
    var common = infChart.drawingUtils.common;
    return infChart.structureManager.drawingTools.getPolylineQuickSettings(common.baseBorderColor, common.baseFillColor, common.baseFillOpacity);
};

infChart.polylineDrawing.prototype.getSettingsPopup = function () {
    var common = infChart.drawingUtils.common;
    return infChart.structureManager.drawingTools.getPolylineSettings(common.baseBorderColor, common.baseFillColor, common.baseFillOpacity);
};

/**
* Scale function of the tool
*/
infChart.polylineDrawing.prototype.scale = function () {
    var self = this,
        ann = self.annotation,
        line,
        additionalDrawingsArr = self.additionalDrawings;

    line = self.getBasePatternLine();

    ann.update({
        shape: {
            params: {
                d: line
            }
        }
    });

    var lineShapes = self.getPatternShapes();

    infChart.util.forEach(lineShapes.positions["circles"], function (index, value) {
        if (additionalDrawingsArr.circles[index]) {
            var circlePositions = lineShapes.positions["circles"][index];
            additionalDrawingsArr.circles[index].attr({ x: circlePositions.x, y: circlePositions.y });
        }
    });
};

infChart.polylineDrawing.prototype.scaleSelectionMarkers = function (lineShapes) {
    var self = this;
    var additionalDrawingsArr = self.additionalDrawings;
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

infChart.polylineDrawing.prototype.select = function () { };

infChart.polylineDrawing.prototype.selectAndBindResize = function () {
    this.setSelectionMarkers();
};

infChart.polylineDrawing.prototype.setSelectionMarkers = function () {
    var self = this;
    var ann = self.annotation;
    var options = ann.options;
    var lineShapes = self.getPatternShapes();
    var additionalDrawingsArr = self.additionalDrawings;

    if (!ann.selectionMarker.length) {
        infChart.util.forEach(lineShapes.positions["circles"], function (index, value) {
            var circlePosition = lineShapes.positions["circles"][index];
            if (circlePosition && circlePosition.x != undefined && circlePosition.y != undefined) {
                if(index == 0){
                    additionalDrawingsArr.circles[index] = infChart.drawingUtils.common.addAndBindSelectionMarker.call(self, ann, circlePosition.x, circlePosition.y, self.stepFunction, self.stop, true, {name: index, drawingId: self.drawingId}, { name: index });
                }else if(index == options.finalCompletedSteps) {
                    additionalDrawingsArr.circles[index] = infChart.drawingUtils.common.addAndBindSelectionMarker.call(self, ann, circlePosition.x, circlePosition.y, self.stepFunction, self.stop, true, {name: index, drawingId: self.drawingId}, { name: index });
                } else {
                    additionalDrawingsArr.circles[index] = infChart.drawingUtils.common.addAndBindSelectionMarker.call(self, ann, circlePosition.x, circlePosition.y, self.stepFunction, self.stop, true, undefined, { name: index });
                }
            }
        });
    }
};

/**
* Step function
* @param {Event} e event
* @param {boolean} isStartPoint indicate whether the start or not
*/
infChart.polylineDrawing.prototype.step = function (e, isStartPoint, itemProperties) {
    var ann = this.annotation,
        options = ann.options,
        chart = ann.chart,
        xAxis = chart.xAxis[options.xAxis],
        yAxis = chart.yAxis[options.yAxis],
        pointx = xAxis.toValue(e.chartX),
        pointy = yAxis.toValue(e.chartY),
        completedSteps = ann.options.completedSteps,
        intermediatePoints = options.intermediatePoints,
        newOtions = {};
    if(infChart.drawingsManager.getIsActiveDrawingInprogress()){
        if (completedSteps == 0) {
            newOtions.xValue = pointx;
            newOtions.yValue = pointy;
        } else if(completedSteps == options.finalCompletedSteps) {
            newOtions.xValueEnd = pointx;
            newOtions.yValueEnd = pointy;
        } else {
            if (!intermediatePoints[completedSteps - 1]) {
                intermediatePoints[completedSteps - 1] = {};
            }
            intermediatePoints[completedSteps - 1].xValue = pointx;
            intermediatePoints[completedSteps - 1].yValue = pointy;
        }
    } else {
        if (itemProperties.name == 0) {
            newOtions.xValue = pointx;
            newOtions.yValue = pointy;
            if(options.drawingIsFullFilled){
                newOtions.xValueEnd = pointx;
                newOtions.yValueEnd = pointy;
            }
        } else if(itemProperties.name == options.finalCompletedSteps) {
            newOtions.xValueEnd = pointx;
            newOtions.yValueEnd = pointy;
            if(options.drawingIsFullFilled){
                newOtions.xValue = pointx;
                newOtions.yValue = pointy;
            }
        } else {
            if (!intermediatePoints[itemProperties.name - 1]) {
                intermediatePoints[itemProperties.name - 1] = {};
            }
            intermediatePoints[itemProperties.name - 1].xValue = pointx;
            intermediatePoints[itemProperties.name - 1].yValue = pointy;
        }
    }
    newOtions.intermediatePoints = intermediatePoints;
    ann.update(newOtions);
    this.scale();
};

infChart.polylineDrawing.prototype.getNextPointOptions = function () {
    var ann = this.annotation;
    var completedSteps = ann.options.completedSteps;
    var pointOptions = { name: "1" };
    if(completedSteps > 0){
        pointOptions.name = completedSteps;
    }
    return pointOptions;
};

infChart.polylineDrawing.prototype.showSelectionMarkers = function (itemProperties) {
    var self = this,
        ann = self.annotation,
        options = ann.options,
        chart = ann.chart,
        additionalDrawingsArr = self.additionalDrawings;
        var lineShapes = self.getPatternShapes();

    if(!options.drawingIsFullFilled){
        if(itemProperties.name == '0'){
            var circlePosition = lineShapes.positions["circles"][options.finalCompletedSteps];
            additionalDrawingsArr.circles[options.finalCompletedSteps] = infChart.drawingUtils.common.addAndBindSelectionMarker.call(self, ann, circlePosition.x, circlePosition.y, self.stepFunction, self.stop, true, {name: options.finalCompletedSteps, drawingId: self.drawingId}, { name: options.finalCompletedSteps });
        } else if (itemProperties.name == options.finalCompletedSteps) {
            var circlePosition = lineShapes.positions["circles"][0];
            additionalDrawingsArr.circles[0] = infChart.drawingUtils.common.addAndBindSelectionMarker.call(self, ann, circlePosition.x, circlePosition.y, self.stepFunction, self.stop, true, {name: '0', drawingId: self.drawingId}, { name: '0' });
        }
    }
};

/**
 * Stop function
 * @param {Event} e event
 * @param {boolean} isStartPoint indicate whether the start or not
 */
infChart.polylineDrawing.prototype.stop = function (e, isStartPoint, itemProperties, abortDrawing) {
    var self = this,
        ann = self.annotation,
        options = ann.options,
        intermediatePoints = options.intermediatePoints,
        lineShapes = self.getPatternShapes(),
        additionalDrawingsArr = self.additionalDrawings,
        stopPropagation = false;
    if (infChart.drawingsManager.getIsActiveDrawingInprogress()) {
        if (options.drawingIsFullFilled) {
            intermediatePoints.pop();
            ann.update({
                xValueEnd: options.xValue,
                yValueEnd: options.yValue
            });
            self.intermediatePoints = intermediatePoints;
            self.yValueEnd = options.yValueEnd;
            ann.update({
                shape: {
                    params: {
                        fill: options.fillColorPicker,
                        'fill-opacity': options.fillOpacityPicker
                    }
                }
            });
        } else {
            if(abortDrawing) {
                if(intermediatePoints.length > 1) {
                    options.xValueEnd = intermediatePoints[intermediatePoints.length - 2].xValue;
                    options.yValueEnd = intermediatePoints[intermediatePoints.length - 2].yValue;
                    intermediatePoints.pop();
                    intermediatePoints.pop();
                } else {
                    stopPropagation = true;
                }
            } else {
                options.xValueEnd = intermediatePoints[intermediatePoints.length - 1].xValue;
                options.yValueEnd = intermediatePoints[intermediatePoints.length - 1].yValue;
                intermediatePoints.pop();
            }

            ann.update({
                xValueEnd: options.xValueEnd,
                yValueEnd: options.yValueEnd
            });
            self.intermediatePoints = intermediatePoints;
            self.yValueEnd = options.yValueEnd;
        }
    } else {
        if (!options.drawingIsFullFilled) {
            var name = e.target.getAttribute('name');
            var drawingId = e.target.getAttribute('drawingId');
            if (name == '0' && drawingId == self.drawingId) {
                ann.update({
                    xValueEnd: options.xValue,
                    yValueEnd: options.yValue,
                });
                self.annotation.options.drawingIsFullFilled = true;
                self.intermediatePoints = intermediatePoints;
                self.yValueEnd = options.yValueEnd;
                ann.update({
                    shape: {
                        params: {
                            fill: options.fillColorPicker,
                            'fill-opacity': options.fillOpacityPicker
                        }
                    }
                });
                self.annotation.options.drawingIsFullFilled = true;
            }
            if (name == options.finalCompletedSteps && drawingId == self.drawingId) {
                ann.update({
                    xValue: options.xValueEnd,
                    yValue: options.yValueEnd,
                });
                self.annotation.options.drawingIsFullFilled = true;
                self.intermediatePoints = intermediatePoints;
                self.yValue = options.yValue;
                ann.update({
                    shape: {
                        params: {
                            fill: options.fillColorPicker,
                            'fill-opacity': options.fillOpacityPicker
                        }
                    }
                });
                self.annotation.options.drawingIsFullFilled = true;
            }
        }
    }
    
    for (var i = 0; i < ann.selectionMarker.length; i++) {
        ann.selectionMarker[i].destroy();
    }
    ann.selectionMarker = [];
    self.setSelectionMarkers();
    self.setPoints();
    infChart.drawingUtils.common.saveBaseYValues.call(self, ann.options.yValue, ann.options.yValueEnd, undefined, ann.options.intermediatePoints);
    infChart.drawingUtils.common.fixSelectionMarker.call(self, ann);
    return {stopPropagation: stopPropagation};
};

infChart.polylineDrawing.prototype.setPoints = function () {
    var self = this,
        ann = self.annotation,
        options = ann.options,
        intermediatePoints = options.intermediatePoints,
        chart = ann.chart;
    var nearestDataForXValue = infChart.math.findNearestDataPoint(chart, options.xValue, undefined, options.useAllXDataToFindNearestPoint, options.useFutureDate);
    var nearestDataForXValueEnd = infChart.math.findNearestDataPoint(chart, options.xValueEnd, undefined, options.useAllXDataToFindNearestPoint, options.useFutureDate);
    var intermediatePoints = options.intermediatePoints;
    var intermediate = [];
    infChart.util.forEach(intermediatePoints, function (index, value) {
        var nearestDataForIntermediateXValue = infChart.math.findNearestDataPoint(chart, intermediatePoints[index].xValue, undefined, options.useAllXDataToFindNearestPoint, options.useFutureDate);
        intermediate.push({xValue: nearestDataForIntermediateXValue.xData, yValue: intermediatePoints[index].yValue});
    });

    ann.update({
        xValue: nearestDataForXValue.xData,
        xValueEnd: nearestDataForXValueEnd.xData,
        intermediatePoints:  intermediate
    });
    self.scale();
};

infChart.polylineDrawing.prototype.translateEnd = function () {
    var self = this,
        ann = self.annotation,
        options = ann.options,
        chart = ann.chart,
        line = ann.shape.d.split(' '),
        intermediatePoints = options.intermediatePoints,
        xAxis = chart.xAxis[options.xAxis];

        var nearestDataForXValue = infChart.math.findNearestDataPoint(chart, options.xValue, undefined, options.useAllXDataToFindNearestPoint, options.useFutureDate);
        var nearestDataForXValueEnd = infChart.math.findNearestDataPoint(chart, options.xValueEnd, undefined, options.useAllXDataToFindNearestPoint, options.useFutureDate);
        var intermediate = [];
        infChart.util.forEach(intermediatePoints, function (index, value) {
            var nearestDataForIntermediateXValue = infChart.math.findNearestDataPoint(chart, intermediatePoints[index].xValue, undefined, options.useAllXDataToFindNearestPoint, options.useFutureDate);
            intermediate.push({xValue: nearestDataForIntermediateXValue.xData, yValue: intermediatePoints[index].yValue});
        });

        ann.update({
            xValue: nearestDataForXValue.xData,
            xValueEnd: nearestDataForXValueEnd.xData,
            intermediatePoints:  intermediate
        });
        self.scale();
};

infChart.polylineDrawing.prototype.updateSettings = function (properties) {
    infChart.structureManager.drawingTools.updatePolylineSettings(this.settingsPopup, properties.borderColor, properties.strokeWidth, properties.fillColorPicker, properties.fillOpacityPicker, properties.lineStyle);
};

infChart.polylineDrawing.prototype.isRequiredProperty = function (propertyId) {
    var isPositionProperty = false;

    switch (propertyId) {
        case "yValue":
        case "yValueEnd":
        case "xValue":
        case "xValueEnd":
        case "intermediatePoints":
        case "fillOpacity":
        case "drawingIsFullFilled":
        case "finalCompletedSteps":
        case "isLocked":
            isPositionProperty = true;
            break;
        default :
            break;
    }

    return isPositionProperty;
};

infChart.polylineDrawing.prototype.beforeUpdateOptions = function(properties) {
    var options = this.annotation.options;
    var isRemoveFill = false;

    if(properties.xValue != properties.xValueEnd && properties.yValue != properties.yValueEnd && options.xValue == options.xValueEnd && options.yValue == options.yValueEnd){
        isRemoveFill = true;
        properties.isRemoveFill = isRemoveFill;
    }
    if(properties.xValue == properties.xValueEnd && properties.yValue == properties.yValueEnd && options.xValue != options.xValueEnd && options.yValue != options.yValueEnd && !isRemoveFill){
        isRemoveFill = false;
        properties.isRemoveFill = isRemoveFill;
    }
};

infChart.polylineDrawing.prototype.updateOptions = function(properties){
    var self = this,
        ann = self.annotation,
        options = ann.options,
        chart = ann.chart;
    if(properties.isRemoveFill){
        ann.update({
            shape: {
                params: {
                    fill: 'none',
                    'fill-opacity': 0
                }
            },
            drawingIsFullFilled: false
        });
        options.drawingIsFullFilled = false;
        self.drawingIsFullFilled = false;
        for (var i = 0; i < ann.selectionMarker.length; i++) {
            ann.selectionMarker[i].destroy();
        }
        ann.selectionMarker = [];
        self.setSelectionMarkers();
    }

    if(properties.isRemoveFill == false){
        ann.update({
            shape: {
                params: {
                    fill: options.fillColorPicker,
                    'fill-opacity': options.fillOpacityPicker
                }
            },
            drawingIsFullFilled: true
        });
        options.drawingIsFullFilled = true;
        self.drawingIsFullFilled = true;
        for (var i = 0; i < ann.selectionMarker.length; i++) {
            ann.selectionMarker[i].destroy();
        }
        ann.selectionMarker = [];
        self.setSelectionMarkers();
    }
};