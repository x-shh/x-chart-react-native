window.infChart = window.infChart || {};

infChart.holdingLineDrawing = function () {
    infChart.drawingObject.apply(this, arguments);
};

infChart.holdingLineDrawing.prototype = Object.create(infChart.drawingObject.prototype);

infChart.holdingLineDrawing.prototype.additionalDrawingsFunction = function () {
    var ann = this.annotation,
        chart = ann.chart,
        options = ann.options,
        xAxis = chart.xAxis[ann.options.xAxis],
        xVal = options.time,
        plotx = xAxis.toPixels(xVal),
        drawingLabel, drawingCircle;

    drawingLabel = chart.renderer.label(infChart.drawingUtils.common.tradingUtils.getHoldingDisplayText.call(this), 0, -10)
        .attr({
            "zIndex": 20,
            padding: 3,
            r: 1,
            fill: options.shape.params.fill,
            hAlign: 'right'
        }).css({
            stroke: options.shape.params.stroke,
            "stroke-width": 1,
            "stroke-linecap": "butt",
            "stroke-linejoin": "miter",
            "stroke-opacity": 1,
            /*color: '#ffffff',*/
            "font-weight": "lighter",
            "font-size": '11px'
        }).add(ann.group);

    drawingLabel.attr({
        x: chart.plotWidth - plotx - drawingLabel.width
    });

    this.additionalDrawings[0] = drawingLabel;

    drawingCircle = chart.renderer.circle(0, 0, 2).attr({
        "zIndex": 20,
        r: 4,
        fill: options.shape.params.fill,
        x: 0
    }).css({
        color: options.shape.params.fill
    }).add(ann.group);

    this.additionalDrawings[1] = drawingCircle;
};

infChart.holdingLineDrawing.prototype.bindSettingsEvents = function () { };

infChart.holdingLineDrawing.prototype.destroyDrawing = function () {
    this.additionalDrawings[0].destroy();
    this.additionalDrawings[1].destroy();
};

infChart.holdingLineDrawing.prototype.getConfig = function () { };

infChart.holdingLineDrawing.prototype.getOptions = function (properties) {
    var options = {
        xValue: properties.xValue,
        yValue: properties.yValue,
        price: properties.price,
        time: properties.time,
        subType: properties.subType,
        orderId: properties.orderId,
        holdingId: properties.holdingId,
        qty: properties.qty,
        account: properties.account,
        isDisplayOnly: false,
        allowDragX: false,
        allowDragY: true,
        drawingType: infChart.constants.drawingTypes.trading,
        shape: {
            params: {
                d: ['M', 0, 0, 'L', 0, 0],
                dashstyle: 'dot',
                fill: infChart.constants.chartTrading.theme.holdingLine.label.fill,
                stroke: infChart.constants.chartTrading.theme.holdingLine.upColor,
                'stroke-width': 1,
                'stroke-dasharray': 1.5
            }
        }
    };

    if (properties.width) {
        options.shape.params.d = ['M', properties.width * 0.75, 0, 'L', properties.width * 2, 0];
    }
    if (properties.clickCords) {
        options.clickCords = properties.clickCords;
    }

    if (properties.isDisplayOnly) {
        options.isDisplayOnly = properties.isDisplayOnly;
        options.allowDragY = !properties.isDisplayOnly;
        options.shape.params.cursor = 'default';
    }
    options.adjustYAxisToViewAnnotation = true;
    options.getExtremesFn = infChart.drawingUtils.common.tradingUtils.getLineExtremesFn;
    return options;
};

infChart.holdingLineDrawing.prototype.getSettingsPopup = function () { };

infChart.holdingLineDrawing.prototype.scale = function () {
    var drawingObj = this,
        ann = drawingObj.annotation,
        chart = ann.chart,
        options = ann.options,
        plotWidth = chart.plotWidth,
        xAxis = chart.xAxis[options.xAxis],
        xVal = options.time,
        plotx = xAxis.toPixels(xVal); //drawingObj.getPlotX();

    if (xAxis.min > xVal || xAxis.max < xVal) {
        ann.hide();
        drawingObj.additionalDrawings[0].attr({
            visibility: 'hidden'
        });
        drawingObj.additionalDrawings[1].attr({
            visibility: 'hidden'
        });
    } else {
        ann.show();
        var label = drawingObj.additionalDrawings[0];

        var x2 = plotWidth - label.width,
            lineWidth = x2 - plotx + 3;

        /**
         * updating the annotation, setting the x value to the trade time
         * so the line will start from the x value to the label
         */
        var line = ["M", 0, 0, 'L', lineWidth, 0];

        var color = options.subType === infChart.constants.chartTrading.orderSide.buy ? infChart.constants.chartTrading.theme.buyColor : infChart.constants.chartTrading.theme.sellColor;

        label.attr({
            visibility: 'visible',
            x: lineWidth,
            zIndex: 20
        }).css({
            "stroke": color
        });

        drawingObj.additionalDrawings[1].css({
            color: color
        }).attr({
            visibility: 'visible',
            zIndex: 20
        });

        /**
         * updating the annotation, setting the x value to the trade time
         */
        ann.update({
            xValue: xVal,
            shape: {
                params: {
                    d: line,
                    stroke: color
                }
            }
        });

        if (!options.isDisplayOnly) {
            infChart.drawingUtils.common.removeDragSupporters.call(drawingObj, drawingObj.dragSupporters);
            infChart.drawingUtils.common.addDragSupporters.call(drawingObj, ann, chart, line, drawingObj.dragSupporters);
        }
    }
};

infChart.holdingLineDrawing.prototype.selectAndBindResize = function () {
    infChart.drawingUtils.common.tradingUtils.selectAndBindResize.call(this);
};

infChart.holdingLineDrawing.prototype.step = function () { };

infChart.holdingLineDrawing.prototype.stop = function (e) { };

infChart.holdingLineDrawing.prototype.updateSettings = function (properties) { };
