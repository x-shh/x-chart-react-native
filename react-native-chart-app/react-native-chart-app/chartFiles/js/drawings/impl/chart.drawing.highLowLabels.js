window.infChart = window.infChart || {};

infChart.highLowLabels = function () {
    infChart.drawingObject.apply(this, arguments);
    this.borderColor = '#959595';
    this.labelDataItems = [
        {id: "date", displayName: "Date / Time", enabled: true},
        {id: "price", displayName: "Price", enabled: true},
        {id: "change", displayName: "Change", enabled: true},
        {id: "pChange", displayName: "%Change", enabled: true},
        {id: "bars", displayName: "Bars", enabled: true}
    ];
    this.destroyByStopPropagation = false;
    this.disableQuickSettingPanel = true;
};

infChart.highLowLabels.prototype = Object.create(infChart.drawingObject.prototype);

infChart.highLowLabels.prototype.checkOverlaps = function () {

}

infChart.highLowLabels.prototype.additionalDrawingsFunction = function () {
    var self = this,
        ann = self.annotation,
        chart = ann.chart,
        labelText = ann.options.isHighLabel? "&#8595;" : "&#8593;";

    self.additionalDrawings.pointerLabel = chart.renderer.createElement('foreignObject').add(ann.group).attr({
        width: '15px',
        height: '30px',
        rel: 'pointerLabel'
    }).css({
        color: ann.options.title.style.color,
        fontSize: '22px'
    }).add(ann.group);
    var labelHtml = "<div>" + labelText + "</div>";
    self.additionalDrawings.pointerLabel.element.innerHTML = labelHtml;
};

infChart.highLowLabels.prototype.bindSettingsEvents = function () {
    var self = this,
        ann = self.annotation;

    function onColorChange(rgb, value) {
        var isPropertyChange = true;
        if (self.settingsPopup) {
            isPropertyChange = self.isSettingsPropertyChange();
        }
        self.onColorChange.call(self, rgb, value, isPropertyChange);
    }

    function onLabelItemsChange(labelItemId, value) {
        var isPropertyChange = true;
        if (self.settingsPopup) {
            isPropertyChange = self.isSettingsPropertyChange();
        }
        self.onLabelItemsChange.call(self, labelItemId, value, isPropertyChange);
    }

    function onResetToDefault () {
        self.updateSavedDrawingProperties(true);
    }

    infChart.structureManager.drawingTools.bindHighLowLabelsSettings(self.settingsPopup, onColorChange, onLabelItemsChange, onResetToDefault);
};

/**
 * Change the color of the annotation from the given params
 * IMPORTANT :: this method is used in commands.wrappers to set undo/redo actions
 * @param {object} rgb rgb value of the color
 * @param {string} value
 * @param {boolean|undefined} isPropertyChange property change
 */
infChart.highLowLabels.prototype.onColorChange = function (rgb, value, isPropertyChange) {
    var self = this;
    self.annotation.update({
        title: {
            style: {
                color: value
            },
            borderAttributes: {
                stroke: value
            }
        }
    });
    self.additionalDrawings.pointerLabel.css({
        color: value
    });

    isPropertyChange && self.onPropertyChange();

    if (self.settingsPopup) {
        self.settingsPopup.data("infUndoRedo", false);
    }
    infChart.drawingUtils.common.saveDrawingProperties.call(self);
};

/**
 * Change the color of the annotation from the given params
 * IMPORTANT :: this method is used in commands.wrappers to set undo/redo actions
 * @param {object} labelItemId changed label item id
 * @param {string} value
 * @param {boolean|undefined} isPropertyChange property change
 */
infChart.highLowLabels.prototype.onLabelItemsChange = function (labelItemId, value, isPropertyChange) {
    var self = this;
    var ann = self.annotation;
    var options = ann.options;

    for(var i = 0; i < options.labelDataItems.length; i++) {
        if(options.labelDataItems[i].id === labelItemId) {
            options.labelDataItems[i].enabled = value;
            break;
        }
    }

    ann.update({
        title: {
            text: infChart.drawingUtils.highLowLabels.getLabelData(ann, self.stockChart, options.calculatedLabelData)
        }
    });

    self.scale.call(self);

    isPropertyChange && self.onPropertyChange();

    if (self.settingsPopup) {
        self.settingsPopup.data("infUndoRedo", false);
    }
    infChart.drawingUtils.common.saveDrawingProperties.call(self);
};

infChart.highLowLabels.prototype.getConfig = function () {
    var annotation = this.annotation;
    return {
        shape: 'highLowLabels',
        text: annotation.options.title.text,
        color: annotation.options.title.style.color,
        xValue: annotation.options.xValue,
        yValue: annotation.options.yValue,
        xValueEnd: annotation.options.xValueEnd,
        yValueEnd: annotation.options.yValueEnd,
        price: annotation.options.price,
        dataIndex: annotation.options.dataIndex,
        isHighLabel: annotation.options.isHighLabel,
        calculatedLabelData: annotation.options.calculatedLabelData,
        labelDataItems: annotation.options.labelDataItems,
        pointerLabelDimensions: annotation.options.pointerLabelDimensions
    };
};

infChart.highLowLabels.prototype.getOptions = function (properties, chart) {
    var theme = {
        style: {
            color: this.borderColor,
            fontSize: '12px',
            cursor: 'move'
        },
        borderAttributes: {
            stroke: this.borderColor,
            'stroke-width': 1,
            padding: 4,
            r: 0
        }
    };

    if (infChart.drawingUtils.common.theme && infChart.drawingUtils.common.theme.highLowLabels) {
        theme = infChart.util.merge(theme, infChart.drawingUtils.common.theme.highLowLabels);
    }

    var nearestDataPointForXValue = infChart.math.findNearestDataPoint(chart, properties.xValue, undefined, true);
    var options = {
        xValue: properties.xValue,
        yValue: properties.yValue,
        nearestXDataPoint: nearestDataPointForXValue.xData,
        allowDragY: false,
        allowDragX: false,
        price: 0,
        labelDataItems: properties.labelDataItems ? properties.labelDataItems : this.labelDataItems,
        title: {
            text: 'Label',
            style: theme.style
        },
        shape: {
            type: null,
            params: null
        },
        disableCopyPaste: true
    };

    if (properties.text) {
        options.title.text = properties.text;
    }
    if (properties.color) {
        options.title.style.color = properties.color;
    }

    if (properties.xValueEnd && properties.yValueEnd) {
        options.xValueEnd = properties.xValueEnd;
        options.yValueEnd = properties.yValueEnd;
    }

    if(properties.price) {
        options.price = properties.price;
    }

    if(properties.dataIndex) {
        options.dataIndex = properties.dataIndex;
    }

    if(properties.isHighLabel) {
        options.isHighLabel = properties.isHighLabel;
    }

    if(properties.calculatedLabelData) {
        options.calculatedLabelData = properties.calculatedLabelData;
    }

    if(properties.pointerLabelDimensions) {
        options.pointerLabelDimensions = properties.pointerLabelDimensions;
    }

    return options;
};

infChart.highLowLabels.prototype.getQuickSettingsPopup = function () {
    return infChart.structureManager.drawingTools.getHighLowLabelsQuickSettings();
};

infChart.highLowLabels.prototype.getSettingsPopup = function () {
    return infChart.structureManager.drawingTools.getHighLowLabelsSettings(this.labelDataItems);
};

infChart.highLowLabels.prototype.step = function () { };

infChart.highLowLabels.prototype.stop = function () {
    var ann = this.annotation,
        options = ann.options,
        chart = ann.chart,
        xAxis = chart.xAxis[options.xAxis],
        yAxis = chart.yAxis[options.yAxis],
        pointerLabel = this.additionalDrawings['pointerLabel'],
        nearestDataPointForXValue = infChart.math.findNearestDataPoint(chart, options.xValue, undefined, true),
        newX = xAxis.toPixels(nearestDataPointForXValue.xData) - xAxis.toPixels(ann.options.xValue),
        stockChartId = infChart.drawingsManager.getChartIdFromHighchartInstance(chart),
        chartInstance = infChart.manager.getChart(stockChartId),
        basicText = "",
        stopPropagation = false;

    var yValue;
    if (!chartInstance.isLog && chartInstance.isCompare) {
        yValue = (infChart.drawingUtils.common.getYValue.call(this, nearestDataPointForXValue.yData[1]) + infChart.drawingUtils.common.getYValue.call(this, nearestDataPointForXValue.yData[2]))/2;
    } else {
        yValue = (nearestDataPointForXValue.yData[1] + nearestDataPointForXValue.yData[2]) / 2;
    }
    var isHighLabel = ann.options.yValue > yValue;

    if(infChart.drawingUtils.highLowLabels.checkOverlaps(ann, nearestDataPointForXValue.xData)) {
        stopPropagation = true;
        this.destroyByStopPropagation = true;
    } else {
        $.each(options.labelDataItems, function (index, labelDataItem) {
            if (labelDataItem.enabled) {
                basicText += (basicText !== "" ? '<br>' : '') + "--";
            }
        });

        ann.update({
            nearestXDataPoint: nearestDataPointForXValue.xData,
            price: isHighLabel ? nearestDataPointForXValue.yData[1] : nearestDataPointForXValue.yData[2],
            dataIndex: nearestDataPointForXValue.dataIndex,
            isHighLabel: isHighLabel,
            pointerLabelDimensions: {
                width: pointerLabel.width,
                height: pointerLabel.height
            },
            title: {
                text: basicText
            }
        });

        var newY = isHighLabel ? 0 - yAxis.toPixels(ann.options.yValue) : yAxis.height - yAxis.toPixels(ann.options.yValue) - ann.title.height;

        ann.title.attr({
            x: newX - (ann.title.width / 2),
            y: newY
        });

        var labelText = isHighLabel ? "&#8595;" : "&#8593;"
        var labelHtml = "<div>" + labelText + "</div>";
        pointerLabel.element.innerHTML = labelHtml;

        pointerLabel.attr({
            x: newX - (pointerLabel.getBBox().width / 2),
            y: isHighLabel ? newY + ann.title.height : newY - pointerLabel.getBBox().height
        });

        infChart.drawingUtils.common.saveBaseYValues.call(this, ann.options.yValue);
        infChart.drawingsManager.openSettings(this, !!infChart.settings.config.disableDrawingSettingsPanel);
        infChart.drawingUtils.common.onPropertyChange.call(this);
        infChart.drawingUtils.highLowLabels.updateLabels(ann, this.stockChart);
    }

    return {stopPropagation: stopPropagation};
};

infChart.highLowLabels.prototype.scale = function (isCalculateNewValueForScale) {
    var ann = this.annotation,
        options = ann.options,
        chart = ann.chart,
        xAxis = chart.xAxis[options.xAxis],
        yAxis = chart.yAxis[options.yAxis],
        pointerLabel = this.additionalDrawings['pointerLabel'];

    if(isCalculateNewValueForScale){
        var nearestDataPointForXValue = infChart.math.findNearestDataPoint(chart, options.xValue, undefined, true);
        ann.update({
            nearestXDataPoint : nearestDataPointForXValue.xData,
            price: options.isHighLabel ? nearestDataPointForXValue.yData[1] : nearestDataPointForXValue.yData[2],
            dataIndex: nearestDataPointForXValue.dataIndex
        });
    }

    var newX = xAxis.toPixels(this.annotation.options.nearestXDataPoint) - xAxis.toPixels(options.xValue);
    
    if(options.calculatedLabelData) {
        ann.update({
            title: {
                text: infChart.drawingUtils.highLowLabels.getLabelData(ann, this.stockChart, options.calculatedLabelData)
            }
        });
    }

    infChart.drawingUtils.highLowLabels.updateLabels(ann, this.stockChart);

    var newY = options.isHighLabel? 0 - yAxis.toPixels(options.yValue) : yAxis.height - yAxis.toPixels(options.yValue) - ann.title.height;

    ann.title.attr({
        x: newX - (ann.title.width / 2),
        y: newY
    });

    pointerLabel.attr({
        x: newX - (pointerLabel.getBBox().width / 2),
        y: options.isHighLabel? newY + ann.title.height : newY - pointerLabel.getBBox().height
    });
};

infChart.highLowLabels.prototype.translateEnd = function () {
    infChart.drawingUtils.common.onPropertyChange.call(this);
};

infChart.highLowLabels.prototype.updateSettings = function (properties) {
    infChart.structureManager.drawingTools.updateHighLowLabelsSettings(this.settingsPopup, properties.color, properties.labelDataItems);
};

infChart.highLowLabels.prototype.beforeDestroy = function () {
    this.additionalDrawings['pointerLabel'].destroy();

    if(!this.destroyByStopPropagation) {
        infChart.drawingUtils.highLowLabels.updateLabels(this.annotation, this.stockChart);
    }
};

infChart.highLowLabels.prototype.isRequiredProperty = function (propertyId) {
    var isPositionProperty = false;

    switch (propertyId) {
        case "yValue":
        case "yValueEnd":
        case "xValue":
        case "xValueEnd":
        case "price":
        case "dataIndex":
        case "isHighLabel" :
        case "calculatedLabelData" :
        case "pointerLabelDimensions":
        case "isLocked":
            isPositionProperty = true;
            break;
        default :
            break;
    }

    return isPositionProperty;
};

