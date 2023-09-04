window.infChart = window.infChart || {};

infChart.algoLineDrawing = function () {
    infChart.drawingObject.apply(this, arguments);
};

infChart.algoLineDrawing.prototype = Object.create(infChart.drawingObject.prototype);

infChart.algoLineDrawing.prototype.additionalDrawingsFunction = function () {
    var ann = this.annotation;

    ann.selectionMarker = [];
    infChart.drawingUtils.common.addSelectionMarker.call(this, ann, 0, 0)
};

infChart.algoLineDrawing.prototype.bindSettingsEvents = function () {
    // return infChart.drawingUtils.common.bindLineSettingsEvents.call(this, infChart.drawingUtils.common.baseBorderColor, infChart.drawingUtils.common.baseLineWidth, infChart.drawingUtils.common.baseLineStyle);
};

infChart.algoLineDrawing.prototype.getConfig = function () {
    var annotation = this.annotation,
        options = annotation.options;
    return {
        shape: 'algoLine',
        borderColor: options.shape.params.stroke,
        fillColor: options.shape.params.fill,
        strokeWidth: options.shape.params['stroke-width'],
        dashStyle: options.shape.params.dashstyle,
        type: options.subType,
        t1: options.xValue,
        l1: options.yValue,
        t2: options.xValueEnd,
        l2: options.yValueEnd
    };
};

infChart.algoLineDrawing.prototype.getOptions = function (properties) {
    var order = properties.order,
        color, algo = order.algo;
    if (order.side == infChart.constants.chartTrading.orderSide.buy) {
        color = infChart.constants.chartTrading.theme.buyColor;
    } else {
        color = infChart.constants.chartTrading.theme.sellColor;
    }
    var options = {
        xValue: algo.t1,
        yValue: algo.l1,
        xValueEnd: algo.t2,
        yValueEnd: algo.l2,
        subType: algo.type,
        drawingType: infChart.constants.drawingTypes.trading,
        orderId: order.orderId,
        parentId: properties.parentId,
        shape: {
            params: {
                d: ['M', 0, 0, 'L', 0, 0],
                dashstyle: 'solid',
                'stroke-width': 2,
                fill: color,
                stroke: color
            }
        }
    };
    options.isRealTimeTranslation = true;
    //options.getExtremesFn = infChart.drawingUtils.common.tradingUtils.getAlgoLineExtremeFn;
    //options.adjustYAxisToViewAnnotation = true;
    return options;
};

infChart.algoLineDrawing.prototype.getSettingsPopup = function () {
    return $("<div></div>"); //infChart.drawingUtils.common.getLineSettings('Algo Line', infChart.drawingUtils.common.baseBorderColor);
};

infChart.algoLineDrawing.prototype.scale = function () {
    var ann = this.annotation,
        chart = ann.chart,
        options = ann.options,
        line = ['M', 0, 0, 'L'],
        xAxis = chart.xAxis[options.xAxis],
        yAxis = chart.yAxis[options.yAxis];

    var xEnd = xAxis.toPixels(options.xValueEnd) - xAxis.toPixels(options.xValue),
        yEnd = yAxis.toPixels(options.yValueEnd) - yAxis.toPixels(options.yValue);

    line[4] = (!isNaN(xEnd) && xEnd) || 0;
    line[5] = (!isNaN(yEnd) && yEnd) || 0;

    ann.update({
        shape: {
            params: {
                d: line
            }
        }
    });

    infChart.drawingUtils.common.removeDragSupporters.call(this, this.dragSupporters);
    infChart.drawingUtils.common.addDragSupporters.call(this, ann, chart, ["M", 0, 0, 'L', line[4], line[5]], this.dragSupporters);
};

infChart.algoLineDrawing.prototype.selectAndBindResize = function () {
    var ann = this.annotation,
        width, height, pathDefinition;

    ann.events.deselect.call(ann);
    ann.selectionMarker = [];
    pathDefinition = ann.shape.d.split(' ');
    width = parseFloat(pathDefinition[4]);
    height = parseFloat(pathDefinition[5]);

    if (!isNaN(width) && !isNaN(height)) {
        infChart.drawingUtils.common.addAndBindSelectionMarker.call(this, ann, 0, 0, this.stepFunction, this.stop, true);
        infChart.drawingUtils.common.addAndBindSelectionMarker.call(this, ann, width, height, this.stepFunction, this.stop, false);

        //var parent = infChart.drawingsManager.getDrawingObject(this.stockChartId, ann.options.parentId);
        //infChart.drawingUtils.common.tradingUtils.getTraderInstance(this.stockChartId).onOrderSelect(parent);
    }
};

infChart.algoLineDrawing.prototype.step = function (e, isStartPoint) {
    var ann = this.annotation,
        points = infChart.drawingUtils.common.calculateInitialPoints.call(this, e, ann, isStartPoint, 2, 2),
        line = ["M", 0, 0, 'L', parseInt(points.dx, 10), parseInt(points.dy, 10)];

    ann.shape.attr({
        d: line
    });

    return line;
};

infChart.algoLineDrawing.prototype.stop = function (e, isStartPoint) {
    var ann = this.annotation,
        chart = ann.chart,
        line = this.stepFunction(e, isStartPoint),
        xAxis = chart.xAxis[ann.options.xAxis],
        yAxis = chart.yAxis[ann.options.yAxis],
        x = xAxis.toValue(line[4] + xAxis.toPixels(ann.options.xValue)),
        y = yAxis.toValue(line[5] + yAxis.toPixels(ann.options.yValue));

    ann.update({
        xValueEnd: x,
        yValueEnd: y,
        shape: {
            params: {
                d: line
            }
        }
    });

    infChart.drawingUtils.common.saveBaseYValues.call(this, ann.options.yValue, y);

    infChart.drawingUtils.common.tradingUtils.onAlgoOrderChanges.call(this);

    infChart.drawingUtils.common.removeDragSupporters.call(this, this.dragSupporters);
    infChart.drawingUtils.common.addDragSupporters.call(this, ann, chart, ["M", 0, 0, 'L', line[4], line[5]], this.dragSupporters);
};

infChart.algoLineDrawing.prototype.translate = function () {
    var ann = this.annotation,
        chart = ann.chart;

    infChart.drawingUtils.common.tradingUtils.onAlgoOrderChanges.call(this);

    this.selectAndBindResize();
    chart.selectedAnnotation = ann;
};

infChart.algoLineDrawing.prototype.updateSettings = function (properties) {
    // infChart.structureManager.drawingTools.updateLineSettings(this.settingsPopup, properties.borderColor, properties.strokeWidth, properties.dashStyle);
};