window.infChart = window.infChart || {};

infChart.labelDrawing = function () {
    infChart.drawingObject.apply(this, arguments);
    this.borderColor = '#000000';
    this.backgroundColor = '#FFFFFF';
};

infChart.labelDrawing.prototype = Object.create(infChart.drawingObject.prototype);

infChart.labelDrawing.prototype.additionalDrawingsFunction = function (isOnSelect) {
    if (!isOnSelect) {
        return;
    }

    var self = this,
        ann = self.annotation,
        options = ann.options,
        chart = ann.chart,
        index = chart.annotationInputIndex = chart.annotationInputIndex ? chart.annotationInputIndex : 1,
        input = document.createElement('span'),
        text = options.textValue || '',
        $input = $(input),
        container = infChart.structureManager.getContainer(this.stockChart.getContainer(), "drawing"),
        inputBox;

    input.innerHTML = '<textarea type="text" wrap="off" maxlength="100" rows="3" x-enable-drawing-copy class="form-control is-label annotation-' + index + '" placeholder="Add text"></textarea>';
    input.style.position = 'absolute';
    container.appendChild(input);
    input.xAddClass("label-input-container");

    inputBox = input.querySelectorAll("textarea")[0];
    inputBox.focus();
    inputBox.value = text;

    inputBox.onkeypress = function (event) {
        if (event.keyCode === 13) {
            self.onTextChange(this);
        }
    };
    self.additionalDrawings[0] = $input;
    $input.hide();
    self.positionInput();
    chart.annotationInputIndex++;
};

infChart.labelDrawing.prototype.bindSettingsEvents = function () {
    var self = this;

    function onColorChange(rgb, value) {
        var isPropertyChange = true;
        if (self.settingsPopup) {
            isPropertyChange = self.isSettingsPropertyChange();
        }
        self.onColorChange.call(self, rgb, value, isPropertyChange);
    }

    function onBorderColorChange(rgb, value, opacity, checked) {
        var isPropertyChange = true;
        if (self.settingsPopup) {
            isPropertyChange = self.isSettingsPropertyChange();
        }
        self.onBorderColorChange.call(self, rgb, value, opacity, checked, isPropertyChange);
    }

    function onBackgroundColorChange(rgb, value, opacity, checked) {
        var isPropertyChange = true;
        if (self.settingsPopup) {
            isPropertyChange = self.isSettingsPropertyChange();
        }
        self.onBackgroundColorChange.call(self, rgb, value, opacity, checked, isPropertyChange);
    }

    function onApplyBackgroundColor(propertyValue, color) {
        var isPropertyChange = true;
        if (self.settingsPopup) {
            isPropertyChange = self.isSettingsPropertyChange();

        }
        self.onApplyBackgroundColor.call(self, propertyValue, color, isPropertyChange);
    }

    function onApplyBorderColor(propertyValue, color) {
        var isPropertyChange = true;
        if (self.settingsPopup) {
            isPropertyChange = self.isSettingsPropertyChange();

        }
        self.onApplyBorderColor.call(self, propertyValue, color, isPropertyChange);
    }

    function onFontSizeChange(newFontSize) {
        var isPropertyChange = true;
        if (self.settingsPopup) {
            isPropertyChange = self.isSettingsPropertyChange();

        }
        self.onFontSizeChange.call(self, newFontSize, isPropertyChange);
    }

    function onFontStyleChange(style, isSelected) {
        var isPropertyChange = true;
        if (self.settingsPopup) {
            isPropertyChange = self.isSettingsPropertyChange();
        }
        self.onFontStyleChange.call(self, style, isSelected, isPropertyChange);
    }

    function onTextChange(text) {
        var isPropertyChange = true;
        if (self.settingsPopup) {
            isPropertyChange = self.isSettingsPropertyChange();
        }
        return self.onSettingsTextChange.call(self, text, isPropertyChange);
    }

    function onResetToDefault () {
        self.updateSavedDrawingProperties(true);
    }

    infChart.structureManager.drawingTools.bindLabelSettings(self.settingsPopup, onColorChange, onFontSizeChange, onFontStyleChange, onTextChange, onBorderColorChange, onBackgroundColorChange, onApplyBorderColor, onApplyBackgroundColor, onResetToDefault);
};

/**
 * actions to take on deselecting the drawing tool
 */
infChart.labelDrawing.prototype.deselect = function () {
    var $input = this.additionalDrawings[0];
    if ($input) {
        this.onTextChange($input.find("input")[0]);
    }
};

infChart.labelDrawing.prototype.destroyDrawing = function () {
    var $input = this.additionalDrawings[0];

    if ($input) {
        $input.remove();
        delete this.additionalDrawings[0];
    }
};

infChart.labelDrawing.prototype.getConfig = function () {
    var annotation = this.annotation;
    return {
        shape: 'label',
        text: annotation.options.title.text,
        textValue: annotation.options.textValue,
        color: annotation.options.title.style.color,
        fontSize: this.fontSize,
        fontWeight: annotation.options.title.style.fontWeight,
        fontStyle: annotation.options.title.style.fontStyle,
        textDecoration: annotation.options.title.style.textDecoration,
        xValue: annotation.options.xValue,
        yValue: annotation.options.yValue,
        xValueEnd: annotation.options.xValueEnd,
        yValueEnd: annotation.options.yValueEnd,
        stroke: annotation.options.title.borderAttributes.stroke,
        backgroundColor: annotation.options.title.borderAttributes.fill,
        strokeWidth: annotation.options.title.borderAttributes['stroke-width'],
        isBackgroundEnabled: annotation.options.isBackgroundEnabled,
        isBorderEnabled: annotation.options.isBorderEnabled,
        borderColorPicker: annotation.options.borderColorPicker,
        backgroundColorPicker: annotation.options.backgroundColorPicker,
        isLocked : annotation.options.isLocked

    };
};

infChart.labelDrawing.prototype.getOptions = function (properties) {
    var theme = {
        style: {
            color: this.borderColor,
            fontSize: '12',
            cursor: 'move',
            fontWeight: 'normal',
            fontStyle: 'normal',
            textDecoration: 'inherit'
        },
        borderAttributes: {
            stroke: this.backgroundColor,
            'stroke-width': 1,
            padding: 4,
            r: 0,
            fill: this.backgroundColor
        }
    };

    if (infChart.drawingUtils.common.theme && infChart.drawingUtils.common.theme.label) {
        theme = infChart.util.merge(theme, infChart.drawingUtils.common.theme.label);
    }

    var options = {
        xValue: properties.xValue,
        yValue: properties.yValue,
        title: {
            text: 'Label',
            style: theme.style,
            borderAttributes: theme.borderAttributes
        },
        shape: {
            type: null,
            params: null
        }
    };
    if (properties.text) {
        options.title.text = properties.text;
    }
    if (properties.textValue) {
        options.textValue = properties.textValue;
    }else{
        options.textValue = '';
    }
    if (properties.color) {
        options.title.style.color = properties.color;
    }
    if (properties.fontSize) {
        options.title.style.fontSize = properties.fontSize + 'px'
        this.fontSize = properties.fontSize;
    }
    if (properties.fontWeight) {
        options.title.style.fontWeight = properties.fontWeight;
    }
    if (properties.fontStyle) {
        options.title.style.fontStyle = properties.fontStyle;
    }
    if (properties.textDecoration) {
        options.title.style.textDecoration = properties.textDecoration;
    }
    if (properties.backgroundColor) {
        options.title.borderAttributes.fill = properties.backgroundColor;
    }
    if (properties.stroke) {
        options.title.borderAttributes.stroke = properties.stroke;
    }
    if(typeof properties.strokeWidth !== "undefined"){
        options.title.borderAttributes['stroke-width'] = properties.strokeWidth;
    }
    if(properties.borderColorPicker){
        options.borderColorPicker = properties.borderColorPicker;
    }else{
        options.borderColorPicker = this.backgroundColor;
    }
    if(properties.backgroundColorPicker){
        options.backgroundColorPicker = properties.backgroundColorPicker;
    }else{
        options.backgroundColorPicker = this.backgroundColor;
    }
    if(typeof properties.isBackgroundEnabled !== "undefined"){
        options.isBackgroundEnabled = properties.isBackgroundEnabled;
    } else {
        options.isBackgroundEnabled = true;
    }
    if(typeof properties.isBorderEnabled !== "undefined"){
        options.isBorderEnabled = properties.isBorderEnabled;
    } else {
        options.isBorderEnabled = true;
    }
    if (properties.xValueEnd && properties.yValueEnd) {
        options.xValueEnd = properties.xValueEnd;
        options.yValueEnd = properties.yValueEnd;
    }
    options.validateTranslationFn = this.validateTranslation;
    options.isRealTimeTranslation = true;

    options = infChart.Drawing.prototype.getOptions(properties,options);

    return options;
};

infChart.labelDrawing.prototype.validateTranslation = function (newXValue) {
    var self = this,
        ann = self.annotation,
        options = ann.options,
        chart = ann.chart,
        xAxis = chart.xAxis[options.xAxis],
        seriesData = chart.series[0].xData,
        dataMin = seriesData[0],
        totalPoints = infChart.drawingsManager.getTotalPoints(chart),
        dataMax = totalPoints[totalPoints.length - 1],
        xValue = xAxis.toValue(xAxis.toPixels(newXValue) + ann.title.width);

    return (newXValue >= dataMin && xValue <= dataMax);
};

infChart.labelDrawing.prototype.getQuickSettingsPopup = function () {
    return infChart.structureManager.drawingTools.getLabelQuickSettings(this.fontSize);
};

infChart.labelDrawing.prototype.getSettingsPopup = function () {
    return infChart.structureManager.drawingTools.getLabelSettings(this.fontSize);
};

infChart.labelDrawing.prototype.isRequiredProperty = function (propertyId, reset) {
    var isPositionProperty = false;

    switch (propertyId) {
        case "yValue":
        case "yValueEnd":
        case "xValue":
        case "xValueEnd":
        case "trendYValue":
        case "trendXValue":
        case "intermediatePoints":
        case "linePointValues":
        case "clickCords" :
            isPositionProperty = true;
            break;
        case "text":
        case "textValue":
        case "isLocked":
            if(reset){
                isPositionProperty = false;
            }else{
                isPositionProperty = true;
            }
        default :
            break;
    }

    return isPositionProperty;
};

// infChart.labelDrawing.prototype.onClick = function (e) {
//     this.showInput();
// };

infChart.labelDrawing.prototype.openSettingPanel = function () {
    var drawingObj = this;
    if (drawingObj.isQuickSetting) {
        infChart.drawingUtils.common.toggleSettings.call(drawingObj);
        drawingObj.settingsPopup.find("textarea[inf-ctrl=text]").focus().select();
    }
};

infChart.labelDrawing.prototype.focusAndSelectInput  = function () {
    this.settingsPopup.find("textarea[inf-ctrl=text]").focus().select();
}

/**
 * Change the color of the annotation from the given params
 * IMPORTANT :: this method is uesed in commands.wrappers to set undo/redo actions
 * @param {object} rgb rgb value of the color 
 * @param {string} value 
 * @param {boolean|undefined} isPropertyChange property change 
 */
infChart.labelDrawing.prototype.onColorChange = function (rgb, value, isPropertyChange) {
    var self = this;
    self.annotation.update({
        title: {
            style: {
                color: value
            }
        }
    });
    isPropertyChange && self.onPropertyChange();
    if (this.settingsPopup) {
        this.settingsPopup.data("infUndoRedo", false);
    }
    infChart.drawingUtils.common.saveDrawingProperties.call(self);
};

infChart.labelDrawing.prototype.onApplyBackgroundColor = function(propertyValue, color, isPropertyChange){
    var self = this,
        ann = self.annotation,
        options = ann.options;
    var theme = infChart.drawingUtils.common.getTheme(),
        shapeTheme = theme[self.shape];

        options.isBackgroundEnabled = propertyValue;
        if(propertyValue){
            self.annotation.update({
                title: {
                    borderAttributes: {
                        fill: color
                    }
                }
            });
        }else{
            self.annotation.update({
                title: {
                    borderAttributes: {
                        fill: 'transparent'
                    }
                }
            });
        }

    isPropertyChange && self.onPropertyChange();
    if (this.settingsPopup) {
        this.settingsPopup.data("infUndoRedo", false);
    }
    infChart.drawingUtils.common.saveDrawingProperties.call(self);
};

infChart.labelDrawing.prototype.onApplyBorderColor = function(propertyValue, color, isPropertyChange){
    var self = this,
        ann = self.annotation,
        options = ann.options;
    var theme = infChart.drawingUtils.common.getTheme(),
        shapeTheme = theme[self.shape];

    options.isBorderEnabled = propertyValue;
    if(propertyValue){
        self.annotation.update({
            title: {
                borderAttributes: {
                    stroke: color,
                    'stroke-width': 1
                }
            }
        });
    }else{
        self.annotation.update({
            title: {
                borderAttributes: {
                    // stroke: shapeTheme.borderAttributes.stroke,
                    'stroke-width': 0
                }
            }
        });
    }

    isPropertyChange && self.onPropertyChange();
    if (this.settingsPopup) {
        this.settingsPopup.data("infUndoRedo", false);
    }
    infChart.drawingUtils.common.saveDrawingProperties.call(self);
};

infChart.labelDrawing.prototype.onBorderColorChange = function(rgb, value, opacity, checked, isPropertyChange){
    var self = this;
        ann = self.annotation,
        options = ann.options;
        options.borderColorPicker = value;
    if(checked){
        self.annotation.options.isBorderEnabled = true;
        self.annotation.update({
            title: {
                borderAttributes: {
                    stroke: value
                }
            }
        });
        isPropertyChange && self.onPropertyChange();
        if (this.settingsPopup) {
            this.settingsPopup.data("infUndoRedo", false);
        }
    }
    infChart.drawingUtils.common.saveDrawingProperties.call(self);
};

infChart.labelDrawing.prototype.onBackgroundColorChange = function(rgb, value, opacity, checked, isPropertyChange){
    var self = this;
        ann = self.annotation,
        options = ann.options;
        options.backgroundColorPicker = value;
    if(checked){
        self.annotation.options.isBackgroundEnabled = true;
        self.annotation.update({
            title: {
                borderAttributes: {
                    fill: value
                }
            }
        });
        isPropertyChange && self.onPropertyChange();
        if (this.settingsPopup) {
            this.settingsPopup.data("infUndoRedo", false);
        }
    }
    infChart.drawingUtils.common.saveDrawingProperties.call(self);
};

/**
 * Change the font size change of the annotation from the given params
 * IMPORTANT :: this method is uesed in commands.wrappers to set undo/redo actions
 * @param {boolean} isIncrease 
 * @param {boolean|undefined} isPropertyChange property change 
 * @returns 
 */
infChart.labelDrawing.prototype.onFontSizeChange = function(newFontSize, isPropertyChange){
    var self = this;
    var isUpdate = false;

    if (newFontSize !== self.fontSize) {
        self.fontSize = newFontSize;
        isUpdate = true;
        self.annotation.update({
            title: {
                style: {
                    fontSize: newFontSize + 'px'
                }
            }
        });

    isPropertyChange && self.onPropertyChange();
    if (this.settingsPopup) {
        this.settingsPopup.data("infUndoRedo", false);
    }
    infChart.drawingUtils.common.saveDrawingProperties.call(self);

    self.annotation.update({});
    }
    
    return isUpdate;
};

/**
 * Change the font style change of the annotation from the given params
 * IMPORTANT :: this method is uesed in commands.wrappers to set undo/redo actions
 * @param {object} style 
 * @param {boolean} isSelected 
 * @param {boolean|undefined} isPropertyChange property change 
 */
infChart.labelDrawing.prototype.onFontStyleChange = function (style, isSelected, isPropertyChange) {
    var self = this;
    switch (style) {
        case 'bold':
            var fontWeight;
            if (isSelected) {
                fontWeight = 'normal';
            } else {
                fontWeight = 'bold';
            }
            self.annotation.update({
                title: {
                    style: {
                        fontWeight: fontWeight
                    }
                }
            });
            self.onPropertyChange();
            break;
        case 'italic':
            var fontStyle;
            if (isSelected) {
                fontStyle = 'normal';
            } else {
                fontStyle = 'italic';
            }
            self.annotation.update({
                title: {
                    style: {
                        fontStyle: fontStyle
                    }
                }
            });
            self.onPropertyChange();
            break;
        case 'underline':
            var textDecoration;
            if (isSelected) {
                textDecoration = 'inherit';
            } else {
                textDecoration = 'underline';
            }
            self.annotation.update({
                title: {
                    style: {
                        textDecoration: textDecoration
                    }
                }
            });
            self.onPropertyChange();
            break;
    }
    isPropertyChange && self.onPropertyChange();
    if (this.settingsPopup) {
        this.settingsPopup.data("infUndoRedo", false);
    }
    infChart.drawingUtils.common.saveDrawingProperties.call(self);
};

/**
 * Change the text change of the annotation from the given params
 * IMPORTANT :: this method is uesed in commands.wrappers to set undo/redo actions
 * @param {string} text 
 * @param {boolean|undefined} isPropertyChange property change 
 * @returns 
 */
infChart.labelDrawing.prototype.onSettingsTextChange = function (text, isPropertyChange) {
    var self = this,
        newText;
        self.annotation.options.textValue = text;
    if(text == ""){
        newText = "Label";
    }else{
        newText = text.replace("/n", "<br>");
        var textArray = [];
        textArray = text.match(/.{1,1000}/g);
        var newText = "";
        for (var i = 0; i < textArray.length; i++) {
            if (i == 0) {
                newText = newText + "" + textArray[i];
            } else {
                newText = newText + "<br>" + textArray[i];
            }
        }
    }

    self.annotation.update({
        title: {
            text: newText
        }
    });

    isPropertyChange && self.onPropertyChange();
    if (this.settingsPopup) {
        this.settingsPopup.data("infUndoRedo", false);
    }
    infChart.drawingUtils.common.saveDrawingProperties.call(self);
    return true;
};

infChart.labelDrawing.prototype.onTextChange = function (input) {
    var self = this,
        ann = self.annotation,
        parent = input.parentNode,
        value = input.value.trim() === "" ? "" : input.value;

    var isPropertyChange = value !== ann.options.title.text;

    self.onSettingsTextChange.call(self, value, isPropertyChange);

    infChart.structureManager.drawingTools.updateLabelSettings(self.settingsPopup, undefined, value || input.value, undefined, true);
    $(parent).remove();
    delete self.additionalDrawings[0];
};

infChart.labelDrawing.prototype.positionInput = function () {
    var ann = this.annotation,
        chart = ann.chart,
        options = ann.options,
        yAxis = chart.yAxis[options.yAxis],
        xAxis = chart.xAxis[options.xAxis],
        y = yAxis.toPixels(options.yValue),
        x = xAxis.toPixels(options.xValue),
        input = this.additionalDrawings[0];

    input && input.css({
        left: x,
        top: y,
        zIndex: 1
    });
};

infChart.labelDrawing.prototype.scale = function () {
    var self = this,
        ann = self.annotation;
    var yValue = infChart.drawingUtils.common.getYValue.call(self, self.yValue);
    ann.update(yValue);
    this.positionInput();
    infChart.drawingUtils.common.setDeleteCursor.call(this); //#CCA-2958
    infChart.drawingUtils.common.setDeleteModeCursor.call(this);
};

infChart.labelDrawing.prototype.selectAndBindResize = function () {
    var ann = this.annotation;

    if (ann.selectionMarker) {

    } else {
        ann.selectionMarker = [];
        infChart.drawingUtils.common.addSelectionMarker.call(this, ann, 0, 0);
    }
    infChart.drawingUtils.common.fixSelectionMarker.call(this, ann);
};

infChart.labelDrawing.prototype.showInput = function () {
    var self = this,
        ann = self.annotation,
        $input;

    //deselecting selection markerkers to fix https://xinfiit.atlassian.net/projects/CCA/issues/CCA-4010
    ann.events.deselect.call(ann);
    self.additionalDrawingsFunction(true);

    $input = self.additionalDrawings[0];
    $input && $input.show();
    $input.find("textarea").focus();

    //'blur' event is not used since it doesn't get fired when click on the chart
    $input && $input.xOutside('click', function (event) {

        if (ann && ann.title && ann.title.element && !$(ann.title.element).xIsInside(event.target, ".highcharts-label")) {
            self.onTextChange($input.find("textarea")[0]);
            return true;
        }
    });
};

infChart.labelDrawing.prototype.step = function () { };

infChart.labelDrawing.prototype.stop = function () {
    this.selectAndBindResize();
    //https://xinfiit.atlassian.net/browse/CCA-3735
    // saveBaseYValues should be exceute before openDrawingSettings since scaleDrawings get executed and a wrong yValue gets stored
    infChart.drawingUtils.common.saveBaseYValues.call(this, this.annotation.options.yValue);
    infChart.drawingsManager.openSettings(this, !!infChart.settings.config.disableDrawingSettingsPanel);
    if(infChart.drawingsManager.getIsActiveDrawingInprogress()){
        this.initialSettingPanelLoad = true;
    }
    infChart.drawingUtils.common.onPropertyChange.call(this);
};

infChart.labelDrawing.prototype.translateEnd = function () {
    infChart.drawingUtils.common.onPropertyChange.call(this);
};

infChart.labelDrawing.prototype.updateSettings = function (properties) {
    var styles = [];
    if (properties.fontWeight !== 'normal') {
        styles.push(properties.fontWeight);
    }
    if (properties.textDecoration !== 'inherit') {
        styles.push(properties.textDecoration);
    }
    if (properties.fontStyle !== 'normal') {
        styles.push(properties.fontStyle);
    }
    infChart.structureManager.drawingTools.updateLabelSettings(this.settingsPopup, properties.color, properties.textValue, properties.backgroundColorPicker, properties.borderColorPicker, properties.isBorderEnabled, properties.isBackgroundEnabled, styles);
};
