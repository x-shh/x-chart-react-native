window.infChart = window.infChart || {};

infChart.mobilelineDrawing = function () {
    infChart.lineDrawing.apply(this, arguments);
};

infChart.mobilelineDrawing.prototype = Object.create(infChart.lineDrawing.prototype);

infChart.mobilelineDrawing.prototype.getOptions = function(properties, chart){
    var nearestDataForXValue = infChart.math.findNearestDataPoint(chart, properties.xValue, undefined, true, true);
    var theme = infChart.drawingUtils.common.getTheme();
    var shapeTheme = theme["trendLine"];
    var options = {
        xValue: properties.xValue,
        yValue: properties.yValue,
        nearestXValue: nearestDataForXValue.xData,
        nearestXValueIndex: nearestDataForXValue.dataIndex,
        shape: {
            params: {
                d: ['M', 0, 0, 'L', 0, 0],
                dashstyle: 'solid',
                stroke: '#000000',
                'stroke-width': infChart.drawingUtils.common.baseLineWidth
            }
        },
        settings: {},
        labelDataItems: properties.labelDataItems ? properties.labelDataItems : this.labelDataItems,
    };
    if(properties.settings) {
        options.settings = properties.settings;

        if (properties.settings.lineColor) {
            options.shape.params.stroke = properties.settings.lineColor;
        }
        if (properties.settings.lineOpacity) {
            options.shape.params['stroke-opacity'] = properties.settings.lineOpacity;
        }

        if (properties.settings.lineWidth) {
            options.shape.params['stroke-width'] = properties.settings.lineWidth;
        }

        if (properties.settings.lineStyle) {
            options.shape.params.dashstyle = properties.settings.lineStyle;
        }
    } else {
        options.settings.lineColor = infChart.drawingUtils.common.baseBorderColor;
        options.settings.lineOpacity = infChart.drawingUtils.common.baseFillOpacity;
        options.settings.lineStyle = 'solid';
        options.settings.lineWidth = infChart.drawingUtils.common.baseLineWidth;
        options.settings.isExtendRight = false;
        options.settings.isExtendLeft = false;
        options.settings.isStartPoint = false;
        options.settings.isEndPoint = false;
        options.settings.textColor = shapeTheme.label.fontColor;
        options.settings.textOpacity = shapeTheme.label.fontOpacity;
        options.settings.lineTextChecked = this.lineTextChecked;
        options.settings.textFontSize = shapeTheme.label.fontSize;
        options.settings.textFontWeight = shapeTheme.label.fontWeight;
        options.settings.textFontStyle = shapeTheme.label.fontStyle;
        options.settings.textDecoration = shapeTheme.label.textDecoration;

    }

    if(properties.lineText){
        options.lineText = properties.lineText;
    } else {
        options.lineText = this.lineText;
    }

    if (properties.xValueEnd && properties.yValueEnd) {
        options.xValueEnd = properties.xValueEnd;
        options.yValueEnd = properties.yValueEnd;

        var nearestDataForXValueEnd = infChart.math.findNearestDataPoint(chart, properties.xValueEnd, undefined, true, true);
        options.nearestXValueEnd = nearestDataForXValueEnd.xData;
        options.nearestXValueEndIndex = nearestDataForXValueEnd.dataIndex;
    }
    if(properties.calculatedLabelData) {
        options.calculatedLabelData = properties.calculatedLabelData;
    }

    options.validateTranslationFn = this.validateTranslation;

    options = infChart.Drawing.prototype.getOptions(properties,options);

    return options;
};

infChart.mobilelineDrawing.prototype.getQuickSettingsPopup = function () {
    //return infChart.drawingUtils.common.getLineQuickSettings(infChart.drawingUtils.common.baseBorderColor, infChart.drawingUtils.common.baseFillOpacity);
};

infChart.mobilelineDrawing.prototype.selectAndBindResize = function () {
    var ann = this.annotation,
        chart = ann.chart,
         options = ann.options,
        width,
        height,
        pathDefinition,
        xAxis = chart.xAxis[options.xAxis],
        nearestXValue = infChart.math.findNearestXDataPoint(chart, options.xValue, undefined, true, true),
        nearestXValueEnd = infChart.math.findNearestXDataPoint(chart, options.xValueEnd, undefined, true, true),
        newX = xAxis.toPixels(nearestXValue) - xAxis.toPixels(ann.options.xValue),
        newXEnd = xAxis.toPixels(nearestXValueEnd) - xAxis.toPixels(ann.options.xValue);

    ann.events.deselect.call(ann);
    ann.selectionMarker = [];
    pathDefinition = ann.shape.d.split(' ');

    width = parseFloat(pathDefinition[4]);
    height = parseFloat(pathDefinition[5]);

    if (!isNaN(width) && !isNaN(height)) {
        infChart.drawingUtils.common.addAndBindSelectionMarker.call(this, ann, newX, 0, this.stepFunction, this.stop, true);
        infChart.drawingUtils.common.addAndBindSelectionMarker.call(this, ann, newXEnd, height, this.stepFunction, this.stop, false);
    }
    self.selectionMarkersBringToFront();
};

infChart.mobilelineDrawing.prototype.step = function (e, isStartPoint) {
    var ann = this.annotation,
        points = infChart.drawingUtils.common.calculateInitialPoints(e, ann, isStartPoint, 0, 0),
        options = ann.options,
        chart = ann.chart,
        additionalDrawingsArr = this.additionalDrawings,
        xAxis = chart.xAxis[options.xAxis],
        yAxis = chart.yAxis[ann.options.yAxis],
        xValueEnd = xAxis.toValue(xAxis.toPixels(options.xValue) + points.dx),
        yValueEnd = yAxis.toValue(yAxis.toPixels(options.yValue) + points.dy),
        nearestDataPointForXValue = infChart.math.findNearestDataPoint(chart, options.xValue, undefined, true, true),
        nearestDataPointForXValueEnd = infChart.math.findNearestDataPoint(chart, xValueEnd, undefined, true, true),
        newX = xAxis.toPixels(nearestDataPointForXValue.xData) - xAxis.toPixels(ann.options.xValue),
        newXEnd = xAxis.toPixels(nearestDataPointForXValueEnd.xData) - xAxis.toPixels(ann.options.xValue),
        newYEnd = parseInt(points.dy, 10),
        newY = 0;

    if (infChart.manager.shiftKeyPressed) {
        var cordinateData = this.snapLine(ann, newX, newY, newXEnd, newYEnd, xValueEnd, yValueEnd, nearestDataPointForXValue, nearestDataPointForXValueEnd, points, isStartPoint);
        newX = cordinateData.newX;
        newY = cordinateData.newY;
        newXEnd = cordinateData.newXEnd;
        newYEnd = cordinateData.newYEnd;
        nearestDataPointForXValue = cordinateData.nearestDataPointForXValue;
        nearestDataPointForXValueEnd = cordinateData.nearestDataPointForXValueEnd;
        yValueEnd = cordinateData.yValueEnd;
    } 

    var line = ["M", newX, newY, 'L', parseInt(newXEnd, 10), newYEnd ];
    ann.shape.attr({
        d: line
    });


    this.calculateAndUpdateLabel({
        nearestXValue: nearestDataPointForXValue.xData,
        nearestXValueIndex: nearestDataPointForXValue.dataIndex,
        nearestXValueEnd: nearestDataPointForXValueEnd.xData,
        nearestXValueEndIndex: nearestDataPointForXValueEnd.dataIndex,
        yValueEnd: yValueEnd
    });

    this.updateLineWithArrowHeadsAndPoints(line, ann, additionalDrawingsArr);
    this.calculateAndUpdateTextLabel();
    this.repositionSelectionMarkers();
    return {line: line, nearestDataPointForXValue: nearestDataPointForXValue, nearestDataPointForXValueEnd: nearestDataPointForXValueEnd};
};

infChart.mobilelineDrawing.prototype.stop = function (e, isStartPoint) {
    var ann = this.annotation,
        options = ann.options,
        chart = ann.chart,
        additionalDrawingsArr = this.additionalDrawings,
        lineData = this.stepFunction(e, isStartPoint),
        line = lineData.line,
        xAxis = chart.xAxis[ann.options.xAxis],
        yAxis = chart.yAxis[ann.options.yAxis],
        x = xAxis.toValue(line[4] + xAxis.toPixels(ann.options.xValue)),
        y = yAxis.toValue(line[5] + yAxis.toPixels(ann.options.yValue)),
        startY = yAxis.toValue(line[2] + yAxis.toPixels(ann.options.yValue));

    line[1] = 0;
    line[4] = xAxis.toPixels(lineData.nearestDataPointForXValueEnd.xData) - xAxis.toPixels(lineData.nearestDataPointForXValue.xData);
    line[5] = line[5] - line [2];
    line[2] = 0;

    ann.update({
        xValue: lineData.nearestDataPointForXValue.xData,
        xValueEnd: lineData.nearestDataPointForXValueEnd.xData,
        yValue: startY,
        yValueEnd: y,
        nearestXValue: lineData.nearestDataPointForXValue.xData,
        nearestXValueIndex: lineData.nearestDataPointForXValue.dataIndex,
        nearestXValueEnd: lineData.nearestDataPointForXValueEnd.xData,
        nearestXValueEndIndex: lineData.nearestDataPointForXValueEnd.dataIndex,
        shape: {
            params: {
                d: line
            }
        }
    });

    this.updateLineWithArrowHeadsAndPoints();
    infChart.drawingUtils.common.saveBaseYValues.call(this, ann.options.yValue, y);
    self.resetDragSUpporters();
    self.selectionMarkersBringToFront();
    self.selectAndBindResize();
    infChart.drawingUtils.common.fixSelectionMarker.call(self, ann);
    infChart.drawingUtils.common.onPropertyChange.call(this);
};

infChart.mobilelineDrawing.prototype.translate = function () {}

infChart.mobilelineDrawing.prototype.translateEnd = function () {
    var self = this,
        ann = self.annotation,
        chart = ann.chart,
        options = ann.options,
        additionalDrawingsArr = this.additionalDrawings,
        line = ann.shape.d.split(' '),
        xAxis = chart.xAxis[options.xAxis],
        nearestDataPointForXValue = infChart.math.findNearestDataPoint(chart, options.xValue, undefined, true, true),
        nearestDataPointForXValueEnd = infChart.math.findNearestDataPoint(chart, options.xValueEnd, undefined, true, true);

    var xValueDiff = xAxis.toPixels(nearestDataPointForXValueEnd.xData) - xAxis.toPixels(nearestDataPointForXValue.xData);
    var newLine = ["M", 0, 0, 'L', xValueDiff, line[5]];

    ann.update({
        xValue: nearestDataPointForXValue.xData,
        xValueEnd: nearestDataPointForXValueEnd.xData,
        nearestXValue: nearestDataPointForXValue.xData,
        nearestXValueIndex: nearestDataPointForXValue.dataIndex,
        nearestXValueEnd: nearestDataPointForXValueEnd.xData,
        nearestXValueEndIndex: nearestDataPointForXValueEnd.dataIndex,
        shape: {
            params: {
                d: newLine
            }
        }
    });

    this.calculateAndUpdateLabel({
        nearestXValue: nearestDataPointForXValue.xData,
        nearestXValueIndex: nearestDataPointForXValue.dataIndex,
        nearestXValueEnd: nearestDataPointForXValueEnd.xData,
        nearestXValueEndIndex: nearestDataPointForXValueEnd.dataIndex,
        yValueEnd: options.yValueEnd
    });

    this.calculateAndUpdateTextLabel();
    var newXEnd = xAxis.toPixels(options.xValueEnd) - xAxis.toPixels(options.xValue);
    // Update new position of the selection marker when scaling the chart while line is selected
    if (ann.selectionMarker && ann.selectionMarker.length > 1) {
        ann.selectionMarker[0].attr({
            x: 0
        });  
        ann.selectionMarker[1].attr({
            x: newXEnd
        });
    } 

    this.updateLineWithArrowHeadsAndPoints();
    self.selectAndBindResize();
    chart.selectedAnnotation = ann;  
    self.resetDragSUpporters();
    self.selectionMarkersBringToFront();
}

infChart.mobilelineDrawing.prototype.repositionSelectionMarkers = function () {
    var self = this,
        ann = self.annotation,
        options = self.options,
        selectionMarker = ann.selectionMarker,
        line = ann.shape.d.split(' ');

        if(selectionMarker && selectionMarker[0]){
            selectionMarker[0].attr({
                x: line[1],
                y: line[2]
            });
        }

        if(selectionMarker && selectionMarker[1]){
            selectionMarker[1].attr({
                x: line[4],
                y: line[5]
            })
        }

};

infChart.mobilelineDrawing.prototype.selectionMarkersBringToFront = function (){
    if(this.annotation.selectionMarker && this.annotation.selectionMarker.length > 0){
        for (var i = 0; i < this.annotation.selectionMarker.length; i++) {
            this.annotation.selectionMarker[i].toFront();
        }
    }
}

infChart.mobilelineDrawing.prototype.updateConfigFromSettings = function (drawingObj, config){
    var properties = drawingObj.getConfig();
    infChart.util.forEach(config.options, function (index, option) {
        switch (option.name) {
            case 'lineColor':
                option.callBackMethod = "onLineColorChange";
                currentValue = {},
                currentValue.color = currentValue.lineColor;
                currentValue.opacity = currentValue.lineOpacity;
                break;
            case 'lineWidth':
                option.callBackMethod = "onLineWidthChange";
                option.currentValue = properties.settings.lineWidth;
                break;
            case 'lineStyle' :
                option.callBackMethod = "onLineStyleChange";
                option.currentValue = properties.settings.lineStyle;
                break;
            case 'isExtendLeft':
                option.callBackMethod = "onLineExtendToLeft";
                option.currentValue = properties.settings.isExtendLeft;
                break;
            case 'isExtendRight':
                option.callBackMethod = "onLineExtendToRight";
                option.currentValue = properties.settings.isExtendRight;
                break;
            case 'isStartPoint' :
                option.callBackMethod = "onStartArrowHeadTypeChange";
                option.currentValue = properties.settings.isStartPoint;
                break;
            case 'isEndPoint':
                option.callBackMethod = "onEndArrowHeadTypeChange";
                option.currentValue = properties.settings.isEndPoint;
                break;
            case 'lineText':
                option.callBackMethod = "onLineTextChange";
                option.currentValue = properties.settings.lineText;
                break;
            case 'lineTextChecked' :
                option.callBackMethod = "onToggleLineText";
                option.currentValue = properties.settings.lineTextChecked;
                break;
            case 'textColor':
                option.callBackMethod = "onTextColorChange";
                currentValue = {},
                currentValue.color = currentValue.textColor;
                currentValue.opacity = currentValue.textOpacity;
                break;
            case 'textFontSize':
                option.callBackMethod = "onTextSizeChange";
                option.currentValue = properties.settings.textFontSize;
                break;
            case 'textFontStyle' :
                option.callBackMethod = "onTextFontStyleChange";
                option.currentValue = properties.settings.textFontStyle;
                break;
            case 'textFontWeight':
                option.callBackMethod = "onTextFontWeightChange";
                option.currentValue = properties.settings.textFontWeight;
                break;
            case 'textDecoration':
                option.callBackMethod = "onTextFontDecorationChange";
                option.currentValue = properties.settings.textDecoration;
                break;
            case 'priceRange':
                option.callBackMethod = "onLabelItemsChangeValues";
                option.currentValue = properties.labelDataItems[0].enabled;
                break;
            case 'barsRange':
                option.callBackMethod = "onLabelItemsChangeValues";
                option.currentValue = properties.labelDataItems[1].enabled;
                break;
            case 'angle':
                option.callBackMethod = "onLabelItemsChangeValues";
                option.currentValue = properties.labelDataItems[2].enabled;
                break;
            case 'duration':
                option.callBackMethod = "onLabelItemsChangeValues";
                option.currentValue = properties.labelDataItems[3].enabled;
                break;      
        }
    });

    return config;
};

infChart.mobilelineDrawing.prototype.onLineColorChange = function (values){
    var self = this;
    infChart.drawingSettings.getEventHandler(this, infChart.drawingSettings.eventTypes.lineColor, {
        isUpdateAnnotationStyles: true,
        settingsItem: 'line',
        otherLineElements: [
            self.additionalDrawings.lines["left"],
            self.additionalDrawings.lines["right"],
            self.additionalDrawings.lineArrow["startPointHead"],
            self.additionalDrawings.lineArrow["endPointHead"]
        ]
    })(values.rgb, values.color, values.opacity);
};

infChart.mobilelineDrawing.prototype.onLineWidthChange = function (values){
    var self = this;
    infChart.drawingSettings.getEventHandler(this, infChart.drawingSettings.eventTypes.lineWidth, {
        isUpdateAnnotationStyles: true,
        settingsItem: 'lineWidth',
        otherLineElements: [
            self.additionalDrawings.lines["left"],
            self.additionalDrawings.lines["right"],
            self.additionalDrawings.lineArrow["startPointHead"],
            self.additionalDrawings.lineArrow["endPointHead"]
        ],
        callBackFunction : function(settingsParams, isPropertyChange, strokeWidth){
            var dashArrayValues = infChart.drawingUtils.common.settings.getStrokeDashArray(self.annotation.options.shape.params.dashstyle, strokeWidth);
            if (settingsParams.otherLineElements) {
                settingsParams.otherLineElements.forEach(function (element) {
                    if(element !== self.additionalDrawings.lineArrow["startPointHead"] && element !== self.additionalDrawings.lineArrow["endPointHead"]){
                    element.attr({
                        'stroke-dasharray': dashArrayValues
                    });
                }
                });
            }
        }
    })(values.lineWidth);
};

infChart.mobilelineDrawing.prototype.onLineStyleChange = function (values){
    var self = this;
    infChart.drawingSettings.getEventHandler(this, infChart.drawingSettings.eventTypes.lineStyle, {
        isUpdateAnnotationStyles: true,
        settingsItem: 'lineStyle',
        otherLineElements: [
            self.additionalDrawings.lines["left"],
            self.additionalDrawings.lines["right"],
        ]
    })(values.lineStyle);
};

infChart.mobilelineDrawing.prototype.onLineExtendToLeft = function (values){
    var self = this;
    infChart.drawingSettings.getEventHandler(this, infChart.drawingSettings.eventTypes.checkBox, {
        isUpdateAnnotationStyles: false,
        settingsItem: 'isExtendLeft',
        callBackFunction : function(settingsParams, isPropertyChange, value){
            self.onLineExtend.call(self, value, "left", isPropertyChange);
    },
        ctrlSelector: "[inf-ctrl=extendToLeft]"
    })(values.isChecked);
};

infChart.mobilelineDrawing.prototype.onLineExtendToRight = function (values){
    var self = this;
    infChart.drawingSettings.getEventHandler(this, infChart.drawingSettings.eventTypes.checkBox, {
        isUpdateAnnotationStyles: false,
        settingsItem: 'isExtendRight',
        callBackFunction : function(settingsParams, isPropertyChange, value){
            self.onLineExtend.call(self, value, "right", isPropertyChange);
    },
        ctrlSelector: "[inf-ctrl=extendToRight]"
    })(values.isChecked);
};

infChart.mobilelineDrawing.prototype.onStartArrowHeadTypeChange = function (values){
    var self = this;
    infChart.drawingSettings.getEventHandler(this, infChart.drawingSettings.eventTypes.value, {
        isUpdateAnnotationStyles: false,
        settingsItem: 'isStartPoint',
        callBackFunction : function(settingsParams, isPropertyChange, value){
            self.onChangeArrowHead.call(self, value, "startPointHead", isPropertyChange);
        },
        ctrlSelector: "[inf-ctrl= startArrowHeadType]"
    })(values.value);
};

infChart.mobilelineDrawing.prototype.onEndArrowHeadTypeChange = function (values){
    var self = this;
    infChart.drawingSettings.getEventHandler(this, infChart.drawingSettings.eventTypes.value, {
        isUpdateAnnotationStyles: false,
        settingsItem: 'isEndPoint',
        callBackFunction : function(settingsParams, isPropertyChange, value){
            self.onChangeArrowHead.call(self, value, "endPointHead", isPropertyChange);
        },
        ctrlSelector: "[inf-ctrl= endArrowHeadType]"
    })(values.value);
};

infChart.mobilelineDrawing.prototype.onTextColorChange = function (values){
    var self = this;
    infChart.drawingSettings.getEventHandler(this, infChart.drawingSettings.eventTypes.fontColor, {
        isUpdateAnnotationStyles: false,
        settingsItem: 'text',
        otherTextElements: [
            self.additionalDrawings.labels["lineText"]
        ],
        ctrlSelector: "[inf-ctrl= textColorPicker]"
    })(values.rgb, values.color, values.opacity);
};

infChart.mobilelineDrawing.prototype.onToggleLineText = function (values){
    var self = this;
    infChart.drawingSettings.getEventHandler(this, infChart.drawingSettings.eventTypes.checkBox, {
        isUpdateAnnotationStyles: false,
        settingsItem: 'lineTextChecked',
        callBackFunction: function(settingsParams, isPropertyChange, value){
            self.onToggleLineText(value, isPropertyChange)
        },
        ctrlSelector: "[inf-ctrl=textToggle]"
    })(values.isChecked);
};

infChart.mobilelineDrawing.prototype.onLineTextChange = function (values){
    var self = this;
    infChart.drawingSettings.getEventHandler(this, infChart.drawingSettings.eventTypes.text, {
        isUpdateAnnotationStyles: false,
        settingsItem: 'lineText',
        callBackFunction: function(){
            self.calculateAndUpdateTextLabel()
        },
        ctrlSelector: "[inf-ctrl=line-text]"
    })(values.text);
};

infChart.mobilelineDrawing.prototype.onTextSizeChange = function (values){
    var self = this;
    infChart.drawingSettings.getEventHandler(this, infChart.drawingSettings.eventTypes.fontSize, {
        isUpdateAnnotationStyles: false,
        settingsItem: 'textFontSize',
        otherTextElements: [
            self.additionalDrawings.labels["lineText"]
        ],
        callBackFunction: function(){
            self.calculateAndUpdateTextLabel()
        }
    })(values.fontSize);
};

infChart.mobilelineDrawing.prototype.onTextFontStyleChange = function (values){
    var self = this;
    infChart.drawingSettings.getEventHandler(this, infChart.drawingSettings.eventTypes.fontStyle, {
        isUpdateAnnotationStyles: false,
        settingsItem: 'textFontStyle',
        otherTextElements: [
            self.additionalDrawings.labels["lineText"]
        ],
        callBackFunction: function(){
            self.calculateAndUpdateTextLabel()
        }
    })(values.fontStyle);
};

infChart.mobilelineDrawing.prototype.onTextFontWeightChange = function (values){
    var self = this;
    infChart.drawingSettings.getEventHandler(this, infChart.drawingSettings.eventTypes.fontStyle,{
        isUpdateAnnotationStyles: false,
        otherTextElements: [
            self.additionalDrawings.labels["lineText"]
        ],
        settingsItem: 'textFontWeight',
        callBackFunction: function(){
            self.calculateAndUpdateTextLabel()
        }
    })(values.fontWeight);
};

infChart.mobilelineDrawing.prototype.onTextFontDecorationChange = function (values){
    var self = this;
    infChart.drawingSettings.getEventHandler(this, infChart.drawingSettings.eventTypes.fontStyle, {
        isUpdateAnnotationStyles: false,
        settingsItem: 'textDecoration',
        otherTextElements: [
            self.additionalDrawings.labels["lineText"]
        ],
        callBackFunction: function(){
            self.calculateAndUpdateTextLabel()
        }
    })(values.textDecoration);
};

infChart.lineDrawing.prototype.onLabelItemsChangeValues = function(values){
    var self = this;
    var isPropertyChange = true;
    if (self.settingsPopup) {
        isPropertyChange = self.isSettingsPropertyChange();
    }
    self.onLabelItemsChange(values.labelItemId, values.value, isPropertyChange);
}