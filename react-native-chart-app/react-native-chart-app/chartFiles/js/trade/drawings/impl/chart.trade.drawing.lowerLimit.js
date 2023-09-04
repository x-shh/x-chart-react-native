window.infChart = window.infChart || {};

infChart.lowerLimitDrawing = function () {
    infChart.drawingObject.apply(this, arguments);
};

infChart.lowerLimitDrawing.prototype = Object.create(infChart.drawingObject.prototype);

infChart.lowerLimitDrawing.prototype.additionalDrawingsFunction = function () {
    var self = this,
        ann = this.annotation,
        chart = ann.chart,
        //bbox = chart.container.getBoundingClientRect(),
        yAxis = chart.yAxis[ann.options.yAxis],
        y = yAxis.toPixels(ann.options.yValue);

    if (chart.infScaleY) {
        y = y / chart.infScaleY;
    }

    var orderTicket = infChart.drawingUtils.common.tradingUtils.getLimitWindow();
    orderTicket = $(orderTicket).appendTo(this.drawingSettingsContainer);
    orderTicket.attr('data-rel', ann.options.subType);
    orderTicket.css({
        //left: (bbox.right - bbox.left) - 50 - orderTicket.outerWidth(true),
        top: y,
        display: "block"
    });
    orderTicket.find('label[data-rel="type"]').text(ann.options.subType === infChart.drawingUtils.common.tradingUtils.constants.stopLoss ? 'Stop Loss' : 'Take Profit');

    self.additionalDrawings["order"] = orderTicket;

    var parentDrawing = infChart.drawingsManager.getDrawingObject(self.stockChartId, ann.options.parent);

    infChart.drawingUtils.common.tradingUtils.updateLimitValues(self.stockChartId, parentDrawing.annotation.options.order, self);

    infChart.drawingUtils.common.tradingUtils.bindLimitWindowSettingsEvents(self, parentDrawing);
};

infChart.lowerLimitDrawing.prototype.bindSettingsEvents = function () { };

infChart.lowerLimitDrawing.prototype.destroyDrawing = function () {
    this.additionalDrawings['order'].remove();
};

infChart.lowerLimitDrawing.prototype.getConfig = function () { };

infChart.lowerLimitDrawing.prototype.getOptions = function (properties) {
    var options = {
        xValue: properties.xValue,
        x: properties.x,
        yValue: properties.yValue,
        drawingType: infChart.constants.drawingTypes.trading,
        allowDragX: false,
        shape: {
            params: {
                d: ['M', 0, 0, 'L', 0, 0],
                dashstyle: 'solid'
            }
        }
    };
    if (properties.width) {
        options.shape.params.d = ['M', 0, 0, 'L', properties.width * 1.5, 0];
    }
    if (properties.clickCords) {
        options.clickCords = properties.clickCords;
    }
    if (properties.fillColor) {
        options.shape.params.fill = properties.fillColor;
    }
    if (properties.borderColor) {
        options.shape.params.stroke = properties.borderColor;
    }
    if (properties.dashStyle) {
        options.shape.params.dashstyle = properties.dashStyle;
    }
    if (properties.strokeWidth) {
        options.shape.params['stroke-width'] = properties.strokeWidth;
    }
    if (properties.isRealTimeTranslation) {
        options.isRealTimeTranslation = properties.isRealTimeTranslation;
    }
    if (properties.parent) {
        options.parent = properties.parent;
    }
    if (properties.subType) {
        options.subType = properties.subType;
    }
    options.validateTranslationFn = infChart.drawingUtils.common.tradingUtils.validateTranslationFn;
    options.adjustYAxisToViewAnnotation = true;
    options.getExtremesFn = infChart.drawingUtils.common.tradingUtils.getLimitExtremesFn;
    options.afterSetExtremesFn = infChart.drawingUtils.common.tradingUtils.positionBottomLimitWindow;
    return options;
};

infChart.lowerLimitDrawing.prototype.getPlotHeight = function () {
    var drawing = this,
        drawingObjParent = infChart.drawingsManager.getDrawingObject(drawing.stockChartId, this.annotation.options.parent),
        below, upper;
    if (drawingObjParent.subType) {
        below = drawing.subType === infChart.drawingUtils.common.tradingUtils.constants.stopLoss;
    } else {
        below = drawing.subType !== infChart.drawingUtils.common.tradingUtils.constants.stopLoss;
    }
    upper = !below;
    return {
        height: this.additionalDrawings['order'].outerHeight(true),
        isBelow: below,
        isUpper: upper
    };
};

infChart.lowerLimitDrawing.prototype.getSettingsPopup = function () {
    return $("<div></div>");
};

infChart.lowerLimitDrawing.prototype.scale = function () {
    var ann = this.annotation,
        chart = ann.chart,
        line = ann.shape.d.split(' ');

    line[4] = chart.plotWidth;

    ann.update({
        xValue: null,
        x: chart.plotLeft,
        shape: {
            params: {
                d: line
            }
        }
    });

    infChart.drawingUtils.common.removeDragSupporters.call(this, this.dragSupporters);
    infChart.drawingUtils.common.addDragSupporters.call(this, ann, chart, ["M", 0, 0, 'L', line[4], line[5]], this.dragSupporters);

    infChart.drawingUtils.common.tradingUtils.positionBottomLimitWindow.call(this);
};

infChart.lowerLimitDrawing.prototype.selectAndBindResize = function () {
    infChart.drawingUtils.common.tradingUtils.selectAndBindResize.call(this);
};

infChart.lowerLimitDrawing.prototype.step = function () { };

infChart.lowerLimitDrawing.prototype.stop = function (e) { };

infChart.lowerLimitDrawing.prototype.translate = function () {
    var self = this,
        ann = self.annotation,
        chart = ann.chart;

    //if (chart.infScaleY) {
    //    y = y / chart.infScaleY;
    //}

    infChart.drawingUtils.common.tradingUtils.positionBottomLimitWindow.call(this);

    var parentDrawing = infChart.drawingsManager.getDrawingObject(self.stockChartId, ann.options.parent);

    infChart.drawingUtils.common.tradingUtils.updateLimitValues(self.stockChartId, parentDrawing.annotation.options.order, self);

    infChart.drawingUtils.common.tradingUtils.updateRiskReward(parentDrawing);

    var isStopLoss = ann.options.subType === infChart.drawingUtils.common.tradingUtils.constants.stopLoss;
    if (isStopLoss) {
        parentDrawing.additionalDrawings['order'].find("[data-rel='stopPrice']").val(
            infChart.drawingUtils.common.tradingUtils.formatOrderLimitPrice(self.stockChartId, self.yValue, parentDrawing.annotation.options.order)
        );
    }
    infChart.drawingUtils.common.tradingUtils.updateOrderLimitValues.call(self, isStopLoss, parentDrawing.annotation.options.order, self.yValue);

    self.selectAndBindResize();
    chart.selectedAnnotation = ann;
};

infChart.lowerLimitDrawing.prototype.updateSettings = function (properties) { };