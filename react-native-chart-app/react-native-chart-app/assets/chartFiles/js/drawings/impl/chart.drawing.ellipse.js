window.infChart = window.infChart || {};

infChart.ellipseDrawing = function () {
    infChart.drawingObject.apply(this, arguments);
    this.ellipseText = "";
    this.ellipseTextChecked = true;
    this.fontSize = "12px";
    this.fillColor = "#fff";
};

infChart.ellipseDrawing.prototype = Object.create(infChart.drawingObject.prototype);

infChart.ellipseDrawing.prototype.additionalDrawingsFunction = function () {
    infChart.drawingUtils.common.symbol.additionalDrawings.call(this);
    var additionalDrawingsArr = this.additionalDrawings;
    additionalDrawingsArr.labels = {};
    additionalDrawingsArr.labels["ellipseText"] = this.getTextLabel("", 0, 0);
    
    
};

infChart.ellipseDrawing.prototype.calculateAndUpdateTextLabel = function () {
    var ann = this.annotation,
        options = ann.options,
        textData = options.ellipseText,
        additionalDrawingsArr = this.additionalDrawings;
        var textLabel = additionalDrawingsArr.labels["ellipseText"];
    
    if (textData && options.ellipseTextChecked && ann.shape) {
        
        ellipse = ann.shape.d.split(' ');
        textData = options.ellipseText.replace(/\n/g, "<br>");
        var labelHtml = "<div rel = 'ellipseText' style='display: flex; justify-content: center; align-items: center;' >" + textData + "</div>";
        textLabel.hide();
        textLabel.element.innerHTML = labelHtml;

        x = parseInt (ellipse[1]);
        y = parseInt(ellipse[2]);
        horizontalRadius = ellipse[4];
        verticalRadius = ellipse[5];
        
        xLabelPosition = horizontalRadius - (horizontalRadius * 1 / Math.sqrt(2));
        yLabelPosition = verticalRadius - verticalRadius * 1 / Math.sqrt(2);

        if (x < 0) {
            xLabelPosition = -2 * horizontalRadius + xLabelPosition;
        } 

        if (y < 0) {
            yLabelPosition = -2 * verticalRadius + yLabelPosition;
        } 
        
        var width = horizontalRadius * Math.sqrt(2);
        var height = verticalRadius * Math.sqrt(2);
        padding = Number(textLabel.styles.padding.substring(0, textLabel.styles.padding.length - 2));
        this.additionalDrawings.labels.ellipseText.element.querySelectorAll('[rel=ellipseText]')[0].style.height = height - padding + "px";

        textLabel.attr({ x: xLabelPosition, y: yLabelPosition, width : width, height : height }).css({ 'text-align': 'center', 'word-break' : 'break-all' }).show();
    } else {
        textLabel.hide();
    }

        

}

infChart.ellipseDrawing.prototype.getLabelHeight =  function  () {
    return this.additionalDrawings.labels.ellipseText.element.querySelectorAll('[rel=ellipseText]')[0].clientHeight;
}

infChart.ellipseDrawing.prototype.getTextLabel = function (lineText, x, y) {

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
                fontSize: options.textFontSize || shapeTheme.fontSize || '12px',
                cursor: 'move',
                fontWeight: '500',
                fontStyle: 'normal',
                textDecoration: 'inherit',
                padding: '5px',
                borderRadius: '5px'
            });
};

infChart.ellipseDrawing.prototype.bindSettingsEvents = function () {
    var common = infChart.drawingUtils.common;
    common.bindBasicDrawingSettingsEvents.call(this, common.baseBorderColor, common.baseFillColor);
};

infChart.ellipseDrawing.prototype.getConfig = function () {
    var annotation = this.annotation;
    return {
        shape: 'ellipse',
        borderColor: infChart.themeManager.getDrawingsBorderColor(annotation.options.shape.params.stroke, 'ellipse'),
        fillColor: infChart.themeManager.getDrawingsFillColor(annotation.options.shape.params.fill, 'ellipse'),
        fillOpacity: annotation.options.shape.params['fill-opacity'],
        strokeWidth: annotation.options.shape.params['stroke-width'],
        xValue: annotation.options.xValue,
        yValue: annotation.options.yValue,
        xValueEnd: annotation.options.xValueEnd,
        yValueEnd: annotation.options.yValueEnd,
        ellipseText: annotation.options.ellipseText,
        ellipseTextChecked: annotation.options.ellipseTextChecked,
        textFontSize: annotation.options.textFontSize,
        textColor: annotation.options.textColor,
        isLocked : annotation.options.isLocked
    };
};

infChart.ellipseDrawing.prototype.getOptions = function (properties) {
    var theme = infChart.drawingUtils.common.getTheme();
    var shapeTheme = theme["trendLine"];
    var options = {
        xValue: properties.xValue,
        yValue: properties.yValue,
        shape: {
            type: 'symbol',
            params: {
                w: 0,
                h: 0,
                symbol: 'ellipse'
            }
        },
        ellipseText: properties.ellipseText ? properties.ellipseText : this.ellipseText,
        ellipseTextChecked: (properties.ellipseTextChecked !== undefined) ? properties.ellipseTextChecked : this.ellipseTextChecked,
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
    //options.isRealTimeTranslation = true;
    options.validateTranslationFn = this.validateTranslation;

    options = infChart.Drawing.prototype.getOptions(properties,options);

    return options;
};

infChart.ellipseDrawing.prototype.validateTranslation = function (newXValue) {
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

infChart.ellipseDrawing.prototype.getQuickSettingsPopup = function () {
    var common = infChart.drawingUtils.common;
    return common.getRectangleQuickSettings(common.baseBorderColor, common.baseFillColor, common.baseFillOpacity);
};

infChart.ellipseDrawing.prototype.getSettingsPopup = function () {
    var common = infChart.drawingUtils.common;
    return common.getBasicDrawingSettings(infChart.manager.getLabel('label.ellipse'), common.baseBorderColor, common.baseFillColor, common.baseFillOpacity, this.shape, this.fontSize, this.fontColor);
};

infChart.ellipseDrawing.prototype.scale = function () {
    infChart.drawingUtils.common.symbol.scale.call(this);
    this.calculateAndUpdateTextLabel();
};

infChart.ellipseDrawing.prototype.selectAndBindResize = function () {
    infChart.drawingUtils.common.symbol.selectAndBindResize.call(this);
};

infChart.ellipseDrawing.prototype.step = function (e, isStartPoint) {
    this.calculateAndUpdateTextLabel();
    return infChart.drawingUtils.common.symbol.step.call(this, e, isStartPoint);
};

infChart.ellipseDrawing.prototype.stop = function (e, isStartPoint) {
    infChart.drawingUtils.common.symbol.stop.call(this, e, isStartPoint);
};

infChart.ellipseDrawing.prototype.getShapeWidth = function(){
    var self = this,
        ann = self.annotation;
    
    return ann.shape.width;
};

infChart.ellipseDrawing.prototype.translateEnd = function () {
    var self = this,
        ann = self.annotation,
        options = ann.options,
        chart = ann.chart,
        xAxis = chart.xAxis[options.xAxis];
    var futureValue = chart.series[0].xData[chart.series[0].xData.length - 1];
    if(futureValue < options.xValue || futureValue < options.xValueEnd || (futureValue < options.xValueStore) || (futureValue < options.xValueEndStore)){
        var ellipse = self.annotation.shape.d.split(' ');
        var value = ellipse[1] > 0 ? ellipse[4] * 2: ellipse[4] * 2 * (-1);
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
};

infChart.ellipseDrawing.prototype.updateSettings = function (properties) {
    infChart.structureManager.drawingTools.updateBasicDrawingSettings(this.settingsPopup, properties.borderColor, properties.strokeWidth, properties.fillColor, properties.fillOpacity,  properties.ellipseText, properties.ellipseTextChecked, undefined, undefined, this.shape, undefined, undefined,undefined,properties.textColor, properties.textFontSize);
};


infChart.ellipseDrawing.prototype.isRequiredProperty = function (propertyId, reset) {
    var isPositionProperty = false;

    switch (propertyId) {
        case "yValue":
        case "yValueEnd":
        case "xValue":
        case "xValueEnd":
            isPositionProperty = true;
            break
        case "ellipseText":
        case "isLocked":
            isPositionProperty = !reset
            break;
        default:
            break;
    }

    return isPositionProperty;
};