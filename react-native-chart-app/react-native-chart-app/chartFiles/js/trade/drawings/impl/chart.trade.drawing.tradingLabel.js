window.infChart = window.infChart || {};

infChart.tradingLabelDrawing = function () {
    infChart.drawingObject.apply(this, arguments);
};

infChart.tradingLabelDrawing.prototype = Object.create(infChart.drawingObject.prototype);

infChart.tradingLabelDrawing.prototype.additionalDrawingsFunction = function () {
    var ann = this.annotation;
    var chart = ann.chart;
    var padding = 8;

    infChart.drawingUtils.common.addSelectionMarker.call(this, ann, 0, 0);
};

infChart.tradingLabelDrawing.prototype.bindSettingsEvents = function () { };

infChart.tradingLabelDrawing.prototype.getConfig = function () {
    var annotation = this.annotation;
    return {
        shape: 'tradingLabel',
        text: annotation.options.shape.params.text,
        xValue: annotation.options.xValue,
        yValue: annotation.options.yValue,
        xValueEnd: annotation.options.xValueEnd,
        yValueEnd: annotation.options.yValueEnd
    };
};

infChart.tradingLabelDrawing.prototype.getOptions = function (properties) {
    var options = {
        xValue: properties.xValue,
        yValue: properties.yValue,
        allowDragX: false,
        allowDragY: false,
        drawingType: infChart.constants.drawingTypes.trading,
        shape: {
            type: 'label',
            params: {
                text: '',
                fill: 'transparent',
                stroke: 'transparent',
                style: {
                    color: (properties.subType == infChart.constants.chartTrading.orderSide.buy ? infChart.constants.chartTrading.theme.buyColor : infChart.constants.chartTrading.theme.sellColor),
                    fontSize: '12px',
                    fontWeight: 'normal',
                    fontStyle: 'normal',
                    textDecoration: 'inherit'
                }
            }
        }
    };
    if (properties.text) {
        options.shape.params.text = properties.text;
    }
    if (properties.xValueEnd && properties.yValueEnd) {
        options.xValueEnd = properties.xValueEnd;
        options.yValueEnd = properties.yValueEnd;
    }
    return options;
};

infChart.tradingLabelDrawing.prototype.getSettingsPopup = function () {
    return '';
};

infChart.tradingLabelDrawing.prototype.scale = function () { };

infChart.tradingLabelDrawing.prototype.selectAndBindResize = function () { };

infChart.tradingLabelDrawing.prototype.step = function () { };

infChart.tradingLabelDrawing.prototype.stop = function () {
    infChart.drawingUtils.common.saveBaseYValues.call(this, this.annotation.options.yValue);
};

infChart.tradingLabelDrawing.prototype.updateSettings = function (properties) { };