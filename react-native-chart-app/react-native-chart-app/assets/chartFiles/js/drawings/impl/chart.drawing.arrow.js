window.infChart = window.infChart || {};

infChart.arrowDrawing = function () {
    infChart.drawingObject.apply(this, arguments);
};

infChart.arrowDrawing.prototype = Object.create(infChart.drawingObject.prototype);

infChart.arrowDrawing.prototype.additionalDrawingsFunction = function () {
    let self = this,
        ann = self.annotation,
        chart = ann.chart,
        arrow = _getArrow(self.shape, chart.renderer.symbols, 40, 40);

    self.additionalDrawings.arrow = chart.renderer.path(arrow).attr({
        'stroke-width': 1,
        stroke: 'transparent',
        opacity: 1,
        'z-index': 2,
        fill: ann.options.shape.params.fill,
        cursor: 'move'
    }).add(ann.group);
    self.additionalDrawings.label = self.getTextLabel();
};

var _getArrow = function(shape, symbols, width, height) {
    if (shape === 'upArrow') {
        return symbols.upArrow(-width/2, 0, width, height);
    } else if (shape === 'downArrow') {
        return symbols.downArrow(-width/2, -height, width, height);
    }
};

var _getLabelYValue = function(shape, arrowHeight, textLabelHeight) {
    if (shape === 'upArrow') {
        return arrowHeight;
    } else if (shape === 'downArrow') {
        return -arrowHeight - textLabelHeight;
    }
};

infChart.arrowDrawing.prototype.getTextLabel = function () {
    let self = this,
        ann = self.annotation,
        options = ann.options,
        chart = ann.chart,
        text = ann.options.label.text,
        formmattedText = text.replace(/\n/g, "<br>"),
        textLabel = "<div rel = 'arrowText'>" + formmattedText + "</div>",
        label = chart.renderer.createElement('foreignObject').add(ann.group).add(ann.group).css({
            color: options.label.fontColor,
            fontSize: options.label.fontSize + 'px' || '12px',
            cursor: 'move',
            fontWeight: '500',
            fontStyle: 'normal',
            textDecoration: 'inherit',
            'line-height': 1,
            'text-align': 'center',
        }),
        textDimension = infChart.drawingUtils.common.getTextDimensionsFromTempNode(formmattedText, label);
        
        label.attr({
            width: textDimension.width,
            height: textDimension.height,
            x: -textDimension.width/2,
            y: _getLabelYValue(self.annotation.options.shape.params.symbol, 40, textDimension.height)
        });
    label.element.innerHTML = textLabel;
    return label;
};

infChart.arrowDrawing.prototype.scale = function (isCalculateNewValueForScale) {
    let self = this,
        ann = self.annotation,
        chart = ann.chart,
        options = ann.options,
        nearestDataPointForXValue = infChart.math.findNearestDataPoint(chart, options.xValue, undefined, true, true);

    if (isCalculateNewValueForScale) {
        ann.update({
            xValue: nearestDataPointForXValue.xData
        });
    } else {
        ann.update();
    }
};

infChart.arrowDrawing.prototype.stop = function () {
    let self = this,
        ann = self.annotation,
        chart = ann.chart,
        options = ann.options,
        nearestDataPointForXValue = infChart.math.findNearestDataPoint(chart, options.xValue, undefined, true, true);
    ann.update({
        xValue: nearestDataPointForXValue.xData
    });
    infChart.drawingUtils.common.saveBaseYValues.call(self, ann.options.yValue);
    infChart.drawingUtils.common.onPropertyChange.call(self);
};

infChart.arrowDrawing.prototype.getConfig = function () {
    let annotation = this.annotation;
    return {
        shape: annotation.options.shape.params.symbol,
        fillColor: infChart.themeManager.getDrawingsFillColor(annotation.options.shape.params.fill, annotation.options.shape.params.symbol),
        strokeWidth: annotation.options.shape.params['stroke-width'],
        xValue: annotation.options.xValue,
        yValue: annotation.options.yValue,
        xValueEnd: annotation.options.xValueEnd,
        yValueEnd: annotation.options.yValueEnd,
        fontText: annotation.options.label.text,
        fontColor: annotation.options.label.fontColor,
        fontSize: annotation.options.label.fontSize,
        isLocked : annotation.options.isLocked
    };
};

infChart.arrowDrawing.prototype.getOptions = function (properties) {
    let arrow = infChart.drawingUtils.common.getTheme()[properties.shape];
    let options = {
        xValue: properties.xValue,
        yValue: properties.yValue,
        shape: {
            type: 'symbol',
            params: {
                width: 0,
                height: 0,
                symbol: properties.shape,
                fill: _getFillDefaultColor(properties.shape),
                stroke: 'none'
            }
        },
        label: {
            text: '',
            fontSize: 12,
            fontColor: arrow && arrow.fontColor? arrow.fontColor: '#999999'
        }
    };

    if (properties.strokeWidth) {
        options.shape.params['stroke-width'] = properties.strokeWidth;
    }
    if (properties.xValueEnd && properties.yValueEnd) {
        options.xValueEnd = properties.xValueEnd;
        options.yValueEnd = properties.yValueEnd;
    }
    if (properties.fillColor) {
        options.shape.params.fill = properties.fillColor;
    }
    if (properties.fontText) {
        options.label.text = properties.fontText;
    }
    if (properties.fontColor) {
        options.label.fontColor = properties.fontColor;
    }
    if (properties.fontSize) {
        options.label.fontSize = properties.fontSize;
    }
    options.validateTranslationFn = this.validateTranslation;

    options = infChart.Drawing.prototype.getOptions(properties,options);
    return options;
};

infChart.arrowDrawing.prototype.translateEnd = function () {
    let self = this,
        ann = self.annotation,
        chart = ann.chart,
        options = ann.options,
        nearestDataPointForXValue = infChart.math.findNearestDataPoint(chart, options.xValue, undefined, true, true);
    ann.update({
        xValue: nearestDataPointForXValue.xData
    });
    infChart.drawingUtils.common.onPropertyChange.call(this);
};

infChart.arrowDrawing.prototype.updateSettings = function (properties) {
    infChart.structureManager.drawingTools.updateArrowSettings(this.settingsPopup, properties.fillColor, properties.fontText);
};

infChart.arrowDrawing.prototype.bindSettingsEvents = function () {
    let self = this;
    function onColorChange(rgb, value, opacity) {
        let isPropertyChange = true;
        if (self.settingsPopup) {
            isPropertyChange = self.isSettingsPropertyChange();
        }
        self.onFillColorChange(rgb, value, opacity, isPropertyChange);
    }

    function onTextChange(text) {
        let isPropertyChange = true;
        if (self.settingsPopup) {
            isPropertyChange = self.isSettingsPropertyChange();
        }
        self.onLabelTextChange(text, isPropertyChange);
    }

    function onFontSizeChange(fontSize) {
        let isPropertyChange = true;
        if (self.settingsPopup) {
            isPropertyChange = self.isSettingsPropertyChange();
        }
        self.onLabelFontSizeChange(fontSize, isPropertyChange);
    }

    function onFontColorChange(fontColor) {
        let isPropertyChange = true;
        if (self.settingsPopup) {
            isPropertyChange = self.isSettingsPropertyChange();
        }
        self.onLabelFontColorChange(fontColor, isPropertyChange);
    }

    function onResetToDefault () {
        self.updateSavedDrawingProperties(true);
    }

    let arowDrawingEvents = {
        onTextChange : onTextChange,
        onFontSizeChange : onFontSizeChange,
        onColorChange : onColorChange,
        onFontColorChange : onFontColorChange,
        onResetToDefault : onResetToDefault
    };

    infChart.structureManager.drawingTools.bindArrowSettings(self.settingsPopup, arowDrawingEvents);
};

infChart.arrowDrawing.prototype.onFillColorChange = function (rgb, value, opacity, isPropertyChange) {
    let self = this;
    self.annotation.update({
        shape: {
            params: {
                fill: value,
                'fill-opacity': opacity
            }
        }
    });
    self.additionalDrawings.arrow.attr({
        opacity: opacity,
        fill: value
    });

    self.annotation.options.fill = value;
    self.annotation.options['fill-opacity'] = opacity;
    
    isPropertyChange && self.onPropertyChange();
    if (self.settingsPopup) {
        self.settingsPopup.data("infUndoRedo", false);
    }
    infChart.drawingUtils.common.saveDrawingProperties.call(self);
};

infChart.arrowDrawing.prototype.onLabelTextChange = function (text, isPropertyChange) {
    let self = this,
        label = self.additionalDrawings.label,
        formmattedText = text;
        
    formmattedText = text.replace(/\n/g, "<br>");
    let textDimension = infChart.drawingUtils.common.getTextDimensionsFromTempNode(formmattedText, label),
        textLabel = "<div rel = 'arrowText'>" + formmattedText + "</div>";

    self.annotation.update({
        label: {
            text: text
        }
    });
    this.annotation.options.label.text = text;
    
    label.attr({
        width: textDimension.width,
        height: textDimension.height,
        x: -textDimension.width/2,
        y: _getLabelYValue(self.annotation.options.shape.params.symbol, 40, textDimension.height)
    }).css({
        'text-align': 'center'
    });

    label.element.innerHTML = textLabel;

    isPropertyChange && self.onPropertyChange();
    if (self.settingsPopup) {
        self.settingsPopup.data("infUndoRedo", false);
    }
    infChart.drawingUtils.common.saveDrawingProperties.call(self);
};

infChart.arrowDrawing.prototype.onLabelFontSizeChange = function (fontSize, isPropertyChange) {
    let self = this,
        label = self.additionalDrawings.label,
        formmattedText = self.annotation.options.label.text.replace(/\n/g, "<br>"),
        textLabel = "<div rel = 'arrowText'>" + formmattedText + "</div>";

    self.annotation.update({
        label: {
            fontSize: fontSize
        }
    });

    this.annotation.options.label.fontSize = fontSize;

    label.css({
        'text-align': 'center',
        fontSize: fontSize + 'px'
    })

    let textDimension = infChart.drawingUtils.common.getTextDimensionsFromTempNode(formmattedText, label);

    label.attr({
        width: textDimension.width,
        height: textDimension.height,
        x: -textDimension.width/2,
        y: _getLabelYValue(self.annotation.options.shape.params.symbol, 40, textDimension.height)
    });
    
    label.element.innerHTML = textLabel;

    isPropertyChange && self.onPropertyChange();
    if (self.settingsPopup) {
        self.settingsPopup.data("infUndoRedo", false);
    }
    infChart.drawingUtils.common.saveDrawingProperties.call(self);
};

infChart.arrowDrawing.prototype.onLabelFontColorChange = function (fontColor, isPropertyChange) {
    let self = this;
    self.annotation.update({
        label: {
            fontColor: fontColor
        }
    });
    self.additionalDrawings.label.css({
        color: fontColor
    });
    this.annotation.options.label.fontColor = fontColor;
   
    isPropertyChange && self.onPropertyChange();
    if (self.settingsPopup) {
        self.settingsPopup.data("infUndoRedo", false);
    }
    infChart.drawingUtils.common.saveDrawingProperties.call(self);
};

infChart.arrowDrawing.prototype.getQuickSettingsPopup = function () {
     let self = this;
        shape = self.shape;
     return infChart.structureManager.drawingTools.getArrowQuickSettings(_getFillDefaultColor(shape));
};

infChart.arrowDrawing.prototype.getSettingsPopup = function () {
    let self = this;
        shape = self.shape;
        label = self.annotation.options.label
    return infChart.drawingUtils.common.getArrowSettings(_getArrowShape(shape), _getFillDefaultColor(shape), 40, label.fontColor, label.fontSize);
};

var _getFillDefaultColor = function(shape) {
    let arrow = infChart.drawingUtils.common.getTheme()[shape];
    return arrow && arrow.fillColor ? arrow.fillColor : _getFillColor(shape);
};

var _getFillColor = function(shape) {
    if (shape === 'upArrow') {
        return '#336699';
    } else if (shape === 'downArrow') {
        return '#FF4D4D';
    }
};

var _getArrowShape = function(shape) {
    if (shape === 'upArrow') {
        return 'Arrow Up';
    } else if (shape === 'downArrow') {
        return 'Arrow Down';
    } 
};