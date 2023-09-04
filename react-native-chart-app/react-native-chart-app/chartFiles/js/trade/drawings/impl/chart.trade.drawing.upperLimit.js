window.infChart = window.infChart || {};

infChart.upperLimitDrawing = function () {
    infChart.drawingObject.apply(this, arguments);
};

infChart.upperLimitDrawing.prototype = Object.create(infChart.drawingObject.prototype);

infChart.upperLimitDrawing.prototype.additionalDrawingsFunction = function () {
    var self = this,
        ann = self.annotation,
        chart = ann.chart,
        //bbox = chart.container.getBoundingClientRect(),
        yAxis = chart.yAxis[ann.options.yAxis],
        y = yAxis.toPixels(ann.options.yValue);

    if (chart.infScaleY) {
        y = y / chart.infScaleY;
    }

    var orderTicket = infChart.drawingUtils.common.tradingUtils.getLimitWindow();
    orderTicket = $(orderTicket).appendTo(self.drawingSettingsContainer);
    orderTicket.attr('data-rel', ann.options.subType);

    var top = y - orderTicket.outerHeight(true);
    // if(top < 0){
    //     top = 0;
    // }

    orderTicket.css({
        //left: (bbox.right - bbox.left) - 50 - orderTicket.outerWidth(true),
        top: top,
        display: "block"
    });
    orderTicket.find('label[data-rel="type"]').text(ann.options.subType === infChart.drawingUtils.common.tradingUtils.constants.stopLoss ? 'Stop Loss' : 'Take Profit');

    self.additionalDrawings["order"] = orderTicket;

    var parentDrawing = infChart.drawingsManager.getDrawingObject(self.stockChartId, ann.options.parent);

    infChart.drawingUtils.common.tradingUtils.updateLimitValues(self.stockChartId, parentDrawing.annotation.options.order, self);
    infChart.drawingUtils.common.tradingUtils.bindLimitWindowSettingsEvents(self, parentDrawing);
};

infChart.upperLimitDrawing.prototype.bindSettingsEvents = function () { };

infChart.upperLimitDrawing.prototype.destroyDrawing = function () {
    this.additionalDrawings['order'].remove();
};

infChart.upperLimitDrawing.prototype.getConfig = function () { };

infChart.upperLimitDrawing.prototype.getOptions = function (properties) {
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
    options.afterSetExtremesFn = infChart.drawingUtils.common.tradingUtils.positionTopLimitWindow;
    return options;
};

infChart.upperLimitDrawing.prototype.getPlotHeight = function () {
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

infChart.upperLimitDrawing.prototype.getSettingsPopup = function () {
    return $("<div></div>");
};

infChart.upperLimitDrawing.prototype.scale = function () {
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

    infChart.drawingUtils.common.tradingUtils.positionTopLimitWindow.call(this);
};

infChart.upperLimitDrawing.prototype.selectAndBindResize = function () {
    infChart.drawingUtils.common.tradingUtils.selectAndBindResize.call(this);
};

infChart.upperLimitDrawing.prototype.step = function () { };

infChart.upperLimitDrawing.prototype.stop = function (e) { };

infChart.upperLimitDrawing.prototype.translate = function () {
    var self = this,
        ann = this.annotation,
        chart = ann.chart;

    //if (chart.infScaleY) {
    //    y = y / chart.infScaleY;
    //}

    infChart.drawingUtils.common.tradingUtils.positionTopLimitWindow.call(this);

    var parentDrawing = infChart.drawingsManager.getDrawingObject(self.stockChartId, ann.options.parent);

    infChart.drawingUtils.common.tradingUtils.updateLimitValues(self.stockChartId, parentDrawing.annotation.options.order, self);

    infChart.drawingUtils.common.tradingUtils.updateRiskReward(parentDrawing);

    var isStopLoss = ann.options.subType === infChart.drawingUtils.common.tradingUtils.constants.stopLoss;
    if (isStopLoss) {
        parentDrawing.additionalDrawings['order'].find("[data-rel='stopPrice']").val(
            infChart.drawingUtils.common.tradingUtils.formatOrderLimitPrice(self.stockChartId, self.yValue, parentDrawing.annotation.options.order)
        );
    }
    infChart.drawingUtils.common.tradingUtils.updateOrderLimitValues.call(this, isStopLoss, parentDrawing.annotation.options.order, this.yValue);

    self.selectAndBindResize();
    chart.selectedAnnotation = ann;
};

infChart.upperLimitDrawing.prototype.updateSettings = function (properties) { };