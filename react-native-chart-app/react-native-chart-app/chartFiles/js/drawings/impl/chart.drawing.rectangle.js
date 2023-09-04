window.infChart = window.infChart || {};

infChart.rectangleDrawing = function () {
    infChart.drawingObject.apply(this, arguments);
    this.rectText = "";
    this.rectTextChecked = true;
    this.verticalPosition = "Top";
    this.horizontalPosition = "Left";
    this.fontSize = "12px";
    this.fillColor = "#fff";
};

infChart.rectangleDrawing.prototype = Object.create(infChart.drawingObject.prototype);

infChart.rectangleDrawing.prototype.additionalDrawingsFunction = function () {
    infChart.drawingUtils.common.symbol.additionalDrawings.call(this);
    var additionalDrawingsArr = this.additionalDrawings;
    var ann = this.annotation;
    var options = ann.options;
    var chart = ann.chart;

    drawingFillAttr = {
        'stroke-width': 0,
        fill: options.shape.params.fill ? options.shape.params.fill : '#959595',
        'fill-opacity': options.shape.params['fill-opacity'] ? options.shape.params['fill-opacity'] : 0.5,
        stroke: options.shape.params.stroke ? options.shape.params.stroke: '#959595',
        'z-index': 2,
        cursor: 'move'
    };
    drawingAttr = {
        'stroke-width': options.shape.params['stroke-width'] ? options.shape.params['stroke-width'] : 1,
        fill: options.shape.params.fill ? options.shape.params.fill : '#959595',
        stroke: options.shape.params.stroke ? options.shape.params.stroke: '#959595',
        'z-index': 2,
        cursor: 'move'
    };

    additionalDrawingsArr.labels = {};
    additionalDrawingsArr.lines = {};
    additionalDrawingsArr.fill = {};

    additionalDrawingsArr.labels["rectText"] = this.getTextLabel(this.rectText, 0, 0);
    additionalDrawingsArr.lines[0] = chart.renderer.path(['M', 0, 0, 'L', 0, 0]).attr(drawingAttr).add(ann.group);
    additionalDrawingsArr.lines[1] = chart.renderer.path(['M', 0, 0, 'L', 0, 0]).attr(drawingAttr).add(ann.group);
    additionalDrawingsArr.lines[2] = chart.renderer.path(['M', 0, 0, 'L', 0, 0]).attr(drawingAttr).add(ann.group);
    additionalDrawingsArr.lines[3] = chart.renderer.path(['M', 0, 0, 'L', 0, 0]).attr(drawingAttr).add(ann.group);

    additionalDrawingsArr.fill[0] = chart.renderer.path(['M', 0, 0, 'L', 0, 0, 'L', 0, 0, 'L', 0, 0]).attr(drawingFillAttr).add(ann.group);
    additionalDrawingsArr.fill[1] = chart.renderer.path(['M', 0, 0, 'L', 0, 0, 'L', 0, 0, 'L', 0, 0]).attr(drawingFillAttr).add(ann.group);

    if(!options.isExtendToLeft){
        additionalDrawingsArr.lines[2].hide();
        additionalDrawingsArr.lines[3].hide();
        additionalDrawingsArr.fill[1].hide();
    }
    if(!options.isExtendToRight){
        additionalDrawingsArr.lines[0].hide();
        additionalDrawingsArr.lines[1].hide();
        additionalDrawingsArr.fill[0].hide();
    }
};

infChart.rectangleDrawing.prototype.getTextLabel = function (rectText, x, y) {

    var self = this,
        ann = self.annotation,
        options = ann.options,
        chart = ann.chart,
        theme = infChart.drawingUtils.common.getTheme(),
        shapeTheme = theme["trendLine"];

    return chart.renderer.createElement('foreignObject').add(ann.group).attr({
        width: '150',
        height: '120'
    
    }).css(
            {
                color: options.textColor ||shapeTheme && shapeTheme.label && shapeTheme.label.fontColor || "#ffffff !important",
                fontSize: options.textFontSize + 'px' || shapeTheme.fontSize || '12px',
                cursor: 'move',
                fontWeight: '500',
                fontStyle: 'normal',
                textDecoration: 'inherit',
                padding: '5px',
                borderRadius: '5px'
            });
};


infChart.rectangleDrawing.prototype.calculateAndUpdateTextLabel  = function () {

    var ann = this.annotation,
        options = ann.options,
        
        additionalDrawingsArr = this.additionalDrawings;

    var textLabelData = options.rectText.replace(/\n/g, "<br>");
    var textLabel = additionalDrawingsArr.labels["rectText"];
    if (textLabelData && options.rectTextChecked && options.shape) {

        var rectangle = ann.shape.d.split(' ');
        var xStart = parseInt(rectangle[1], 10);
        var xEnd = parseInt(rectangle[4], 10);
        var yStart = parseInt(rectangle[2], 10);
        var yEnd = parseInt(rectangle[11], 10);
        var rectHeight = Math.abs(yStart - yEnd);
        var rectWidth = Math.abs(xEnd - xStart);
        var alignStyleClass = 'left';
        var yLabelPosition, xLabelPosition, labelHeight, labelWidth;


        var textDimensionsFromTempNode = this.getTextDimensionsFromTempNode(textLabelData, textLabel);
        var tempNodeTextWidth = labelWidth = textDimensionsFromTempNode.width;
        var tempNodeTextHeight = textDimensionsFromTempNode.height;
        textLabel.attr({ width: labelWidth, height: tempNodeTextHeight });


        var labelHtml = "<div rel = 'rectangleText'>" + textLabelData + "</div>";
        textLabel.element.innerHTML = labelHtml;
        labelHeight = this.getLabelHeight(textLabel);

        switch (options.verticalPosition) {
            case "Top":
                yLabelPosition = yStart - labelHeight;
                break;
            case "Inside":
                labelWidth = (rectWidth < tempNodeTextWidth) ? rectWidth : tempNodeTextWidth;
                textLabel.attr({width: labelWidth, height: rectHeight}).css({'word-break' : 'break-all'});    
                labelHeight = (rectHeight < this.getLabelHeight(textLabel)) ? rectHeight : this.getLabelHeight(textLabel);
                yLabelPosition = (yStart === 0 ? yStart + yEnd / 2 : yEnd + yStart / 2) - labelHeight / 2;
                break;
            case "Bottom":
                yLabelPosition = yEnd;
                break;
        }

        switch (options.horizontalPosition) {
            case "Left":
                xLabelPosition = (xStart > xEnd) ? xEnd : xStart;
                break;
            case "Center":
                xLabelPosition = (xStart === 0 ? xEnd / 2 : xStart / 2) - labelWidth/2 ;
                alignStyleClass = 'center';

                break;
            case "Right":
                xLabelPosition = ((xStart > xEnd) ? xStart : xEnd) - labelWidth;
                var alignStyleClass = 'right';
                break;
        }

        textLabel.attr({
            x: xLabelPosition,
            y: yLabelPosition,
            width: labelWidth
        }).css({ 'text-align': alignStyleClass }).show();
    } else {
        textLabel.attr({
        }).hide();
    }
};

infChart.rectangleDrawing.prototype.getLabelHeight  =  function  (textLabel) {
    padding = Number(textLabel.styles.padding.substring(0, textLabel.styles.padding.length - 2));
    return this.additionalDrawings.labels.rectText.element.querySelectorAll('[rel=rectangleText]')[0].clientHeight + padding * 2;
}

infChart.rectangleDrawing.prototype.getTextDimensionsFromTempNode =  function (textLabelData, textLabel) {
    var tempHtmlNode = document.createElement("span");
    document.body.appendChild(tempHtmlNode);
    
    tempHtmlNode.innerHTML = textLabelData;
    tempHtmlNode.style.fontWeight = textLabel.styles.fontWeight;
    tempHtmlNode.style.fontSize = textLabel.styles.fontSize;
    tempHtmlNode.style.fontStyle = textLabel.styles.fontStyle;
    tempHtmlNode.style.padding = textLabel.styles.padding;
    var width = tempHtmlNode.offsetWidth + 20;
    var height = tempHtmlNode.offsetHeight + (parseInt(textLabel.styles.fontSize) * 2);
    document.body.removeChild(tempHtmlNode);
    
    return {width :width, height : height};
};


infChart.rectangleDrawing.prototype.bindSettingsEvents  = function () {
    var self = this;
    var common = infChart.drawingUtils.common;

    function onExtendToLeft(value) {
        var isPropertyChange = true;
        if (self.settingsPopup) {
            isPropertyChange = self.isSettingsPropertyChange();
        }
        self.onExtendToLeft(value, isPropertyChange);
    }

    function onExtendToRight(value) {
        var isPropertyChange = true;
        if (self.settingsPopup) {
            isPropertyChange = self.isSettingsPropertyChange();
        }
        self.onExtendToRight(value, isPropertyChange);
    }

    infChart.drawingUtils.common.bindBasicDrawingSettingsEvents.call(this, common.baseBorderColor, common.baseFillColor, onExtendToLeft, onExtendToRight);
};

infChart.rectangleDrawing.prototype.getConfig = function () {
    var annotation = this.annotation;
    return {
        shape: 'rectangle',
        borderColor: infChart.themeManager.getDrawingsBorderColor(annotation.options.shape.params.stroke, 'rectangle'),
        fillColor: infChart.themeManager.getDrawingsFillColor(annotation.options.shape.params.fill, 'rectangle'),
        fillOpacity: annotation.options.shape.params['fill-opacity'],
        strokeWidth: annotation.options.shape.params['stroke-width'],
        xValue: annotation.options.xValue,
        yValue: annotation.options.yValue,
        xValueEnd: annotation.options.xValueEnd,
        yValueEnd: annotation.options.yValueEnd,
        rectText: annotation.options.rectText,
        rectTextChecked: annotation.options.rectTextChecked,
        verticalPosition: annotation.options.verticalPosition,
        horizontalPosition: annotation.options.horizontalPosition,
        isExtendToLeft: annotation.options.isExtendToLeft,
        isExtendToRight: annotation.options.isExtendToRight,
        textFontSize: annotation.options.textFontSize,
        textColor: annotation.options.textColor,
        isLocked : annotation.options.isLocked
    };
};

infChart.rectangleDrawing.prototype.getOptions = function (properties) {
    var theme = infChart.drawingUtils.common.getTheme();
    var shapeTheme = theme["trendLine"];
    var options = {
        xValue: properties.xValue,
        yValue: properties.yValue,
        shape: {
            type: 'symbol',
            params: {
                width: 0,
                height: 0,
                symbol: 'rectangle'
            }
        },
        isIndicator: properties.isIndicator,
        isDisplayOnly: properties.isDisplayOnly,
        rectText: properties.rectText ? properties.rectText : this.rectText,
        rectTextChecked: (properties.rectTextChecked !== undefined) ? properties.rectTextChecked : this.rectTextChecked,
        verticalPosition: properties.verticalPosition ? properties.verticalPosition : this.verticalPosition,
        horizontalPosition: properties.horizontalPosition ? properties.horizontalPosition : this.horizontalPosition
    };
    if (properties.borderColor) {
        options.shape.params.stroke = properties.borderColor;
    }
    if (properties.fillColor) {
        options.shape.params.fill = properties.fillColor;
    }
    if (properties.fillOpacity) {
        options.shape.params['fill-opacity'] = properties.fillOpacity;
    }
    if (properties.strokeWidth) {
        options.shape.params['stroke-width'] = properties.strokeWidth;
    }
    if (properties.xValueEnd && properties.yValueEnd) {
        options.xValueEnd = properties.xValueEnd;
        options.yValueEnd = properties.yValueEnd;
    }

    if (properties.allowDragX !== undefined) {
        options.allowDragX = properties.allowDragX;
    }

    if (properties.allowDragY !== undefined) {
        options.allowDragY = properties.allowDragY;
    }

    if (properties.drawingType !== undefined) {
        options.drawingType = properties.drawingType;
    }

    if (properties.indicatorId) {
        options.indicatorId = properties.indicatorId;
    }

    if(properties.textColor) {
        options.textColor = properties.textColor;
    } else {
        options.textColor = shapeTheme.label.fontColor;
    }
    if(properties.textFontSize) {
        options.textFontSize = properties.textFontSize;
    } else {
        options.textFontSize = shapeTheme.label.fontSize;
    }

    if(properties.isExtendToRight !== "undefined"){
        options.isExtendToRight = properties.isExtendToRight;
    } else {
        options.isExtendToRight = false;
    }

    if(properties.isExtendToLeft !== "undefined"){
        options.isExtendToLeft = properties.isExtendToLeft;
    } else {
        options.isExtendToLeft = false;
    }

    options.validateTranslationFn = this.validateTranslation;

    options = infChart.Drawing.prototype.getOptions(properties,options);

    return options;
};

infChart.rectangleDrawing.prototype.validateTranslation = function (newXValue) {
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

infChart.rectangleDrawing.prototype.getQuickSettingsPopup = function () {
    var common = infChart.drawingUtils.common;
    return common.getRectangleQuickSettings(common.baseBorderColor, common.baseFillColor, common.baseFillOpacity);
};

infChart.rectangleDrawing.prototype.getSettingsPopup = function () {
    var common = infChart.drawingUtils.common;
    return common.getBasicDrawingSettings(infChart.manager.getLabel('label.rectangle'), common.baseBorderColor, common.baseFillColor, common.baseFillOpacity, this.shape, this.fontSize, this.fontColor);
};

infChart.rectangleDrawing.prototype.scale = function () {
    var self = this,
        ann = self.annotation,
        options = ann.options,
        isIndicator = options.isIndicator;
    infChart.drawingUtils.common.symbol.scale.call(self);
    if(!isIndicator){
        self.calculateAndUpdateTextLabel();
        self.calculateAndUpdateExtendLine();
    }
};

infChart.rectangleDrawing.prototype.selectAndBindResize = function () {
    infChart.drawingUtils.common.symbol.selectAndBindResize.call(this);
};

infChart.rectangleDrawing.prototype.step = function (e, isStartPoint) {
    var self = this,
        ann = self.annotation,
        options = ann.options,
        isIndicator = options.isIndicator;
    var rect = infChart.drawingUtils.common.symbol.step.call(self, e, isStartPoint);
    if (!isIndicator) {
        self.calculateAndUpdateTextLabel();
        self.calculateAndUpdateExtendLine();
    }
    return rect;
};

infChart.rectangleDrawing.prototype.calculateAndUpdateExtendLine = function(){
    var self = this,
        ann = self.annotation,
        options = ann.options,
        chart = ann.chart,
        xAxis = chart.xAxis[options.xAxis],
        additionalDrawings = self.additionalDrawings,
        lineDrawings = additionalDrawings.lines,
        fillDrawings = additionalDrawings.fill,
        firstCandle = chart.series[0].xData[0];

        if(ann.shape.d) {
            var box = ann.shape.d.split(' ');
            var distanceToFirstCandle = xAxis.toPixels(firstCandle) - xAxis.toPixels(options.xValue);
            var totalPoints = infChart.manager.getTotalPoints(chart);
            var distanceToLastCandle = xAxis.toPixels(totalPoints[totalPoints.length - 1]) - xAxis.toPixels(options.xValue);
            if(parseFloat(box[4]) > parseFloat(box[1])){
                rightLineStart = box[4];
                leftLineStart = box[1];
            } else {
                rightLineStart = box[1];
                leftLineStart = box[4];
            }
    
            if(parseFloat(box[2]) > parseFloat(box[8])){
                bottom = box[2];
                topValue = box[8];
            } else {
                bottom = box[8];
                topValue = box[2];
            }
            if(lineDrawings){
                $.each(lineDrawings, function (key, value) {
                    if(key == 0){
                        value.attr({
                            d: ["M", rightLineStart, topValue, "L", distanceToLastCandle + 500, topValue]
                        });
                    }
                    if(key == 1){
                        value.attr({
                            d: ["M", rightLineStart, bottom, "L", distanceToLastCandle + 500, bottom]
                        });
                    }
                    if(key == 2){
                        value.attr({
                            d: ["M", leftLineStart, topValue, "L", distanceToFirstCandle - 500, topValue]
                        });
                    }
                    if(key == 3){
                        value.attr({
                            d: ["M", leftLineStart, bottom, "L", distanceToFirstCandle - 500, bottom]
                        });
                    }
                });
            }

            if(fillDrawings){
                $.each(fillDrawings, function (key, value) {
                    if(key == 0){
                        value.attr({
                            d: ["M", rightLineStart, topValue, "L", distanceToLastCandle + 500, topValue, "L", distanceToLastCandle + 500, bottom, "L",  rightLineStart, bottom, "L", rightLineStart, topValue]
                        });
                    }
                    if(key == 1){
                        value.attr({
                            d: ["M", leftLineStart, topValue, "L", distanceToFirstCandle - 500, topValue, "L", distanceToFirstCandle - 500, bottom, "L", leftLineStart, bottom, "L", leftLineStart, topValue]
                        });
                    }
                });
            }
        }

};

infChart.rectangleDrawing.prototype.stop = function (e, isStartPoint) {
    infChart.drawingUtils.common.symbol.stop.call(this, e, isStartPoint);
};

infChart.rectangleDrawing.prototype.getShapeWidth = function () {
    var self = this,
        ann = self.annotation;

    return ann.options.shape.params.width;
};

infChart.rectangleDrawing.prototype.translateEnd = function () {
    var self = this,
        ann = self.annotation,
        options = ann.options,
        chart = ann.chart,
        isIndicator = options.isIndicator,
        xAxis = chart.xAxis[options.xAxis];
    var futureValue = chart.series[0].xData[chart.series[0].xData.length - 1];
    if (futureValue < options.xValue || futureValue < options.xValueEnd || (futureValue < options.xValueStore) || (futureValue < options.xValueEndStore)) {
        var line = ann.shape.d.split(' ');
        var value = (line[1] === '0') ? line[4] : line[1];
        var xValueEnd = xAxis.toValue(parseFloat(value) + xAxis.toPixels(options.xValue));
        ann.update({
            xValueEnd: xValueEnd
        });
    } else {
        width = Math.abs(xAxis.toPixels(options.xValueEnd) - xAxis.toPixels(options.xValue));
        var symbol = options.shape.params;
        symbol.width = width;
        ann.update({
            shape: {
                params: symbol
            }
        });
    }
    
    infChart.drawingUtils.common.symbol.translateEnd.call(this);
    if(isIndicator){
        this.calculateAndUpdateTextLabel();
        this.calculateAndUpdateExtendLine();
    }
};

infChart.rectangleDrawing.prototype.updateSettings = function (properties) {
    infChart.structureManager.drawingTools.updateBasicDrawingSettings(this.settingsPopup, properties.borderColor, properties.strokeWidth, properties.fillColor, properties.fillOpacity, 
        properties.rectText, properties.rectTextChecked, properties.verticalPosition, properties.horizontalPosition, this.shape, undefined, properties.isExtendToRight, properties.isExtendToLeft, properties.textColor, properties.textFontSize);
};

infChart.rectangleDrawing.prototype.isRequiredProperty = function (propertyId, reset) {
    var isPositionProperty = false;

    switch (propertyId) {
        case "yValue":
        case "yValueEnd":
        case "xValue":
        case "xValueEnd":
            isPositionProperty = true;
            break
        case "rectText":
        case "isLocked":
            isPositionProperty = !reset
            break;
        default:
            break;
    }

    return isPositionProperty;
};

/*
* @param {boolean} extended property ti extend the lines to left
* @param {boolean|undefined} isPropertyChange property change
*/
infChart.rectangleDrawing.prototype.onExtendToRight = function (extended, isPropertyChange) {
    var self = this,
        ann = self.annotation,
        options = ann.options,
        chart = ann.chart,
        xAxis = chart.xAxis[options.xAxis],
        additionalDrawings = self.additionalDrawings,
        lineDrawings = additionalDrawings.lines,
        fillDrawings = additionalDrawings.fill;

    if(lineDrawings){
        if(extended){
            lineDrawings[0].show();
            lineDrawings[1].show();
        } else {
            lineDrawings[0].hide();
            lineDrawings[1].hide();
        }
    }

    if(fillDrawings){
        if(extended){
            fillDrawings[0].show();
        } else {
            fillDrawings[0].hide();
        }
    }
    this.annotation.options.isExtendToRight = extended;
    isPropertyChange && self.onPropertyChange();
    if (this.settingsPopup) {
        this.settingsPopup.data("infUndoRedo", false);
    }
    infChart.drawingUtils.common.saveDrawingProperties.call(self);
};

/*
* @param {boolean} extended property ti extend the lines to right
* @param {boolean|undefined} isPropertyChange property change
*/
infChart.rectangleDrawing.prototype.onExtendToLeft = function (extended, isPropertyChange) {
    var self = this,
        ann = self.annotation,
        options = ann.options,
        chart = ann.chart,
        xAxis = chart.xAxis[options.xAxis],
        additionalDrawings = self.additionalDrawings,
        lineDrawings = additionalDrawings.lines,
        fillDrawings = additionalDrawings.fill;
    if(lineDrawings){
        if(extended){
            lineDrawings[2].show();
            lineDrawings[3].show();
        } else {
            lineDrawings[2].hide();
            lineDrawings[3].hide();
        }
    }

    if(fillDrawings){
        if(extended){
            fillDrawings[1].show();
        } else {
            fillDrawings[1].hide();
        }
    }
    this.annotation.options.isExtendToLeft = extended;
    isPropertyChange && self.onPropertyChange();
    if (this.settingsPopup) {
        this.settingsPopup.data("infUndoRedo", false);
    }
    infChart.drawingUtils.common.saveDrawingProperties.call(self);
};

infChart.rectangleDrawing.prototype.specificCursorChange = function(url){
    var self = this,
        ann = self.annotation,
        options = ann.options,
        additionalDrawings = self.additionalDrawings;

        $.each(additionalDrawings.lines, function (key, value) {
                if(url){
                    value.css({'cursor': 'url("' + url + '"), default'});
                } else {
                    infChart.util.setCursor(value, 'move');
                    value.css({'cursor': 'move'});
                }
        });

        $.each(additionalDrawings.fill, function (key, value) {
            if(url){
                value.css({'cursor': 'url("' + url + '"), default'});
            } else {
                infChart.util.setCursor(value, 'move');
                value.css({'cursor': 'move'});
            }
        });
};