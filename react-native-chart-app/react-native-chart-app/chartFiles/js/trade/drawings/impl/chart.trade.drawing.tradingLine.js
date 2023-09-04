window.infChart = window.infChart || {};

infChart.tradingLineDrawing = function () {
    infChart.drawingObject.apply(this, arguments);
};

infChart.tradingLineDrawing.prototype = Object.create(infChart.drawingObject.prototype);

infChart.tradingLineDrawing.prototype.additionalDrawingsFunction = function () {
    var drawingObject = this,
        ann = drawingObject.annotation,
        chart = ann.chart,
        options = ann.options,
        order = options.order,
        tradeLineTheme = infChart.constants.chartTrading.theme.tradingLine,
        height = tradeLineTheme.height,
        padding = tradeLineTheme.padding,
        top = -(height / 2 + padding),
        labelFill = tradeLineTheme.label.fill,
        stroke = tradeLineTheme.label.stroke,
        opacity = tradeLineTheme.opacity,
        labelFontColor = tradeLineTheme.label.fontColor,
        subLabelFontColor = tradeLineTheme.subLabel.fontColor,
        labelFontWeight = tradeLineTheme.label.fontWeight ? tradeLineTheme.label.fontWeight : 100;

    var tradingUtils = infChart.drawingUtils.common.tradingUtils;

    var labelX = 0;
    var isSubOrder = tradingUtils.isSubOrder(order);
    if (isSubOrder) {
        var labelText = tradingUtils.getSubOrderLabel(order);
        var labelFillColor = tradingUtils.getSubOrderTypeLabelFillColor(order, tradeLineTheme);
        var subTypeLabel = chart.renderer.label(labelText, labelX, top).attr({
            'zIndex': 20,
            'padding': padding,
            'r': 1,
            'fill': labelFillColor,
            'opacity': opacity,
            'stroke': stroke,
            'stroke-width': 1,
            'stroke-linecap': 'butt',
            'stroke-linejoin': 'miter',
            'stroke-opacity': 1,
            'hAlign': 'center',
            'height': height,
            'class': 'price-lbl'
        }).add(ann.group);

        subTypeLabel.css({ //to color text
            'fontWeight': labelFontWeight,
            'color': subLabelFontColor
        });

        drawingObject.additionalDrawings['subTypeLabel'] = subTypeLabel;
        labelX += subTypeLabel.width;
    }

    /**
     * price label
     * @type {*|SVGElement}
     */
    var priceLabel = chart.renderer.label(tradingUtils.formatOrderPrice(drawingObject.stockChartId, order), labelX, top).attr({
        'zIndex': 20,
        'padding': padding,
        'r': 1,
        'fill': labelFill,
        'opacity': opacity,
        'stroke': stroke,
        'stroke-width': 1,
        'stroke-linecap': 'butt',
        'stroke-linejoin': 'miter',
        'stroke-opacity': 1,
        'hAlign': 'center',
        'height': height,
        'class': 'price-lbl'
    }).add(ann.group);

    //textProps: ['direction', 'fontSize', 'fontWeight', 'fontFamily','fontStyle', 'color', 'lineHeight', 'width', 'textAlign','textDecoration', 'textOverflow', 'textOutline']
    priceLabel.css({ //to color text
        'fontWeight': labelFontWeight,
        'color': labelFontColor
    });

    drawingObject.additionalDrawings['priceLabel'] = priceLabel;
    labelX += priceLabel.width;

    drawingObject.additionalDrawings['ctrlLabels'] = {};
    var isSentOrder = tradingUtils.isSentOrder(options.order);

    if (!options.isIdea && (!isSubOrder || isSentOrder)) {
        /**
         * qty label
         * @type {*|SVGElement}
         */
        var drawingLabel = chart.renderer.label(tradingUtils.formatOrderQuantity(drawingObject.stockChartId, order), labelX, top).attr({
            'zIndex': options.isDisplayOnly ? 1 : 20,
            'padding': padding,
            'r': 1,
            'fill': labelFill,
            'opacity': opacity,
            'stroke': stroke,
            'stroke-width': 1,
            'stroke-linecap': 'butt',
            'stroke-linejoin': 'miter',
            'stroke-opacity': 1,
            'hAlign': 'center',
            'height': height,
            'class': 'qty-lbl'
        }).add(ann.group);

        drawingLabel.css({ //to color text
            'fontWeight': labelFontWeight,
            'fill': labelFontColor
        });

        drawingObject.additionalDrawings['ctrlLabels'][0] = drawingLabel;
        labelX += drawingLabel.width;
    }

    /**
     * draw cancelLabel & transmitLabel, bind events
     */
    if (!options.isIdea && !options.isDisplayOnly) {
        var trader = tradingUtils.getTraderInstance(this.stockChartId);
        if (trader) {
            drawingLabel.attr({
                cursor: 'pointer'
            });

            priceLabel.attr({
                cursor: 'pointer'
            });

            infChart.util.bindEvent(drawingLabel.element, 'mousedown', function (e) {
                e.stopPropagation();
                e.preventDefault();
                trader.onOrderSelect(order);
                if (trader.getOptions().enableOrderWindow) {
                    var newDrawingObj = tradingUtils.changeDrawingToOrderLimit.call(drawingObject);
                    if (newDrawingObj != null) {
                        tradingUtils.onQtyClick.call(newDrawingObj);
                    }
                }
            });

            infChart.util.bindEvent(priceLabel.element, 'mousedown', function (e) {
                e.stopPropagation();
                e.preventDefault();
                trader.onOrderSelect(order);
                if (trader.getOptions().enableOrderWindow) {
                    var newDrawingObj = tradingUtils.changeDrawingToOrderLimit.call(drawingObject);
                    if (newDrawingObj != null) {
                        tradingUtils.onLimitPriceClick.call(newDrawingObj);
                    }
                }
            });
        }
        /**
         * cancel btn
         * @type {*|SVGElement}
         */
        var cancelLabel = chart.renderer.label('X', labelX, top).attr({
            'zIndex': 20,
            // 'paddingLeft': 3,
            'padding': padding,
            'r': 1,
            'fill': tradeLineTheme.cancelColor,
            'opacity': opacity,
            'stroke': stroke,
            'stroke-width': 1,
            'stroke-linecap': 'butt',
            'stroke-linejoin': 'miter',
            'stroke-opacity': 1,
            'hAlign': 'center',
            'class': 'cancel-lbl',
            // 'width': 12,
            'height': height,
            'cursor': 'pointer'
            /*,
             "text-anchor":"middle"*/
        }).add(ann.group);

        cancelLabel.css({ //to color text
            'fontWeight': tradeLineTheme.cancelFontWeight ? tradeLineTheme.cancelFontWeight : 100,
            'color': tradeLineTheme.cancelFontColor
        });

        // cancelLabel.paddingLeftSetter((cancelLabel.height - cancelLabel.element.children[1].clientWidth) / 2);

        drawingObject.additionalDrawings['ctrlLabels'][1] = cancelLabel;
        labelX += cancelLabel.width;

        /**
         * send/amend button
         */
        var transmitLabel = chart.renderer.label('T', labelX, top).attr({
            'zIndex': 20,
            // 'paddingLeft': 3,
            'padding': padding,
            'r': 1,
            'fill': tradeLineTheme.transmitColor,
            'opacity': opacity,
            'stroke': stroke,
            'stroke-width': 1,
            'stroke-linecap': 'butt',
            'stroke-linejoin': 'miter',
            'stroke-opacity': 1,
            'hAlign': 'center',
            'class': (isSentOrder ? 'resend-lbl' : 'transmit-lbl'),
            // 'width': 12,
            'height': height,
            'cursor': 'pointer',
            'visibility': !isSentOrder || options.amend ? 'visible' : 'hidden'
        }).add(ann.group);

        transmitLabel.css({ //to color text
            'fontWeight': tradeLineTheme.transmitFontWeight ? tradeLineTheme.transmitFontWeight : 100,
            'color': tradeLineTheme.transmitFontColor
        });

        // transmitLabel.paddingLeftSetter(( transmitLabel.height - transmitLabel.element.children[1].clientWidth) / 2);


        if (isSentOrder && !options.amend) {
            transmitLabel.attr({
                'visibility': 'hidden'
            });
        }

        drawingObject.additionalDrawings['ctrlLabels'][2] = transmitLabel;
        labelX += transmitLabel.width;

        var revertLabel = chart.renderer.label("\uf112", labelX, top).attr({
            'zIndex': 20,
            // 'paddingLeft': 3,
            'padding': padding,
            'r': 1,
            'fill': tradeLineTheme.revertColor,
            'opacity': opacity,
            'stroke': stroke,
            'stroke-width': 1,
            'stroke-linecap': 'butt',
            'stroke-linejoin': 'miter',
            'stroke-opacity': 1,
            'hAlign': 'center',
            'class': 'revert-lbl icon-label-fa',
            // 'width': 12,
            'height': height,
            'cursor': 'pointer',
            'visibility': isSentOrder && options.amend ? 'visible' : 'hidden'
        }).add(ann.group);

        revertLabel.css({ //to color text
            'fontWeight': tradeLineTheme.revertFontWeight ? tradeLineTheme.revertFontWeight : 100,
            'color': tradeLineTheme.revertFontColor
        });

        // revertLabel.paddingLeftSetter((revertLabel.height - revertLabel.element.children[1].clientWidth) / 2);

        drawingObject.additionalDrawings['ctrlLabels'][3] = revertLabel;

        infChart.util.bindEvent(cancelLabel.element, 'mousedown', function (e) {
            e.stopPropagation();
            e.preventDefault();
            tradingUtils.cancelOrder(drawingObject.stockChartId, ann.options.order);
        });

        infChart.util.bindEvent(transmitLabel.element, 'mousedown', function (e) {
            e.stopPropagation();
            e.preventDefault();
            tradingUtils.placeOrder(drawingObject.stockChartId, ann.options.order);
        });

        infChart.util.bindEvent(revertLabel.element, 'mousedown', function (e) {
            e.stopPropagation();
            e.preventDefault();
            ann.options.amend = false;
            tradingUtils.revertOrder(drawingObject.stockChartId, ann.options.order);
        });

        if (tradingUtils.isAlgoOrder(order)) {
            tradingUtils.addAlgoLimits.call(drawingObject);
        }
    }
};

infChart.tradingLineDrawing.prototype.bindSettingsEvents = function () { };

infChart.tradingLineDrawing.prototype.destroyDrawing = function () {
    this.additionalDrawings['priceLabel'].destroy();
    if (this.additionalDrawings['subTypeLabel']) {
        this.additionalDrawings['subTypeLabel'].destroy();
    }
    if (this.additionalDrawings['ctrlLabels'][0]) {
        this.additionalDrawings['ctrlLabels'][0].destroy();
    }
    if (this.additionalDrawings['ctrlLabels'][1]) {
        this.additionalDrawings['ctrlLabels'][1].destroy();
    }
    if (this.additionalDrawings['ctrlLabels'][2]) {
        this.additionalDrawings['ctrlLabels'][2].destroy();
    }
    if (this.additionalDrawings['ctrlLabels'][3]) {
        this.additionalDrawings['ctrlLabels'][3].destroy();
    }
    if (this.additionalDrawings['original']) {
        infChart.drawingUtils.common.tradingUtils.removeDrawing(this.additionalDrawings['original']);
    }
    infChart.drawingUtils.common.tradingUtils.removeAlgoLimits.call(this);
};

infChart.tradingLineDrawing.prototype.getConfig = function () { };

infChart.tradingLineDrawing.prototype.getOptions = function (properties) {
    var options = {
        xValue: properties.xValue,
        x: properties.x,
        yValue: properties.yValue,
        subType: properties.subType,
        order: properties.order,
        originalOrder: properties.originalOrder,
        isDisplayOnly: false,
        allowDragX: false,
        allowDragY: true,
        drawingType: infChart.constants.drawingTypes.trading,
        cls: "order-line " + (properties.subType == infChart.constants.chartTrading.orderSide.buy ? "buy" : "sell"),
        shape: {
            params: {
                d: ['M', 0, 0, 'L', 0, 0],
                dashstyle: 'solid',
                opacity: infChart.constants.chartTrading.theme.tradingLine.opacity,
                fill: (properties.subType == infChart.constants.chartTrading.orderSide.buy ? infChart.constants.chartTrading.theme.tradingLine.buyColor : infChart.constants.chartTrading.theme.tradingLine.sellColor),
                stroke: (properties.subType == infChart.constants.chartTrading.orderSide.buy ? infChart.constants.chartTrading.theme.tradingLine.buyColor : infChart.constants.chartTrading.theme.tradingLine.sellColor),
                'class': 'line',
                'stroke-width': 1
            }
        },
        enableLimits: !!properties.enableLimits,
        isIdea: !!properties.isIdea
    };

    if (properties.width && !isNaN(properties.plotLeft)) {
        options.shape.params.d = ['M', properties.plotLeft, 0, 'L', properties.width + properties.plotLeft, 0];
    }

    if (properties.clickCords) {
        options.clickCords = properties.clickCords;
    }

    if (properties.isDisplayOnly) {
        options.isDisplayOnly = properties.isDisplayOnly;
        options.allowDragY = !properties.isDisplayOnly;
        if (!options.isIdea) {
            options.shape.params.dashstyle = 'dot';
        }
        options.shape.params.cursor = 'default';
        options.shape.params['z-index'] = 1;
    } else {
        options.shape.params['z-index'] = 10;
    }

    if (infChart.drawingUtils.common.tradingUtils.isAlgoTrendOrder(properties.order)) {
        options.allowDragY = false;
        options.shape.params.dashstyle = 'dot';
    }

    if (infChart.drawingUtils.common.tradingUtils.isSubOrder(properties.order)) {
        if (!options.isIdea && !infChart.drawingUtils.common.tradingUtils.isSentOrder(properties.order)) {
            options.isDisplayOnly = true;
        }
        options.shape.params.dashstyle = 'dot';
        options.shape.params.fill = (properties.subType === infChart.constants.chartTrading.orderSide.buy ? infChart.constants.chartTrading.theme.tradingLine.buyColor : infChart.constants.chartTrading.theme.tradingLine.sellColor);
        options.shape.params.stroke = (properties.subType === infChart.constants.chartTrading.orderSide.buy ? infChart.constants.chartTrading.theme.tradingLine.buyColor : infChart.constants.chartTrading.theme.tradingLine.sellColor);
    }

    options.amend = properties.amend;
    options.adjustYAxisToViewAnnotation = true;
    options.getExtremesFn = infChart.drawingUtils.common.tradingUtils.getLineExtremesFn;
    options.validateTranslationFn = this.validateTranslation;
    options.isRealTimeTranslation = true;

    return options;
};

// infChart.tradingLineDrawing.prototype.getPlotX = function(){
//            var self = this,
//            ann = self.annotation,
//            chart = ann.chart,
//            options = ann.options,
//        //line = ann.shape.d.split(' '),
//            plotWidth = chart.plotWidth * 2,
//            xAxis = chart.xAxis[ann.options.xAxis],
//            yAxis = chart.yAxis[ann.options.yAxis];
//        var height = 0, labelWidth = 0;

//        var xValue = chart.plotWidth * 0.75;
//        $.each(self.additionalDrawings, function (key, value) {
//            height = (options.accumilatedHeight) ? height + value.height : (height < value.height) ? value.height : height;
//            labelWidth = (options.accumilatedWidth) ? labelWidth + value.width : (labelWidth < value.width) ? value.width : labelWidth;
//        });

//        height = height / 2;
//        var heightVal = yAxis.max - yAxis.toValue(height);

//        var yValue = options.price;
//        if (options.price > yAxis.max) {
//            yValue = yAxis.max - (yAxis.max - yAxis.toValue(height));
//        } else if (options.price < yAxis.min) {
//            yValue = yAxis.min + (yAxis.max - yAxis.toValue(height));
//        }
//        var currentDrawingObj = infChart.drawingsManager.getDrawingObject(options.id);
//        var widthCount = 0, lastWidth = 0;
//        $.each(chart.annotations.allItems, function (i, annotation) {
//            if (annotation.options.id != options.id && annotation.options.drawingType == infChart.constants.drawingTypes.trading) {
//                var drawingObj = infChart.drawingsManager.getDrawingObject(annotation.options.id);
//                var currentyValue = annotation.options.price;
//                if (annotation.options.price > yAxis.max) {
//                    currentyValue = yAxis.max - (yAxis.max - yAxis.toValue(height));
//                } else if (annotation.options.price < yAxis.min) {
//                    currentyValue = yAxis.min + (yAxis.max - yAxis.toValue(height));
//                }
//                if (Math.abs(currentyValue - yValue) < ( heightVal * 2) && drawingObj.shape == "tradingLine" && currentDrawingObj.idx < drawingObj.idx) {

//                    var currentLabelWidth = 0;
//                    $.each(drawingObj.additionalDrawings['ctrlLabels'], function (key, value) {
//                        currentLabelWidth = (annotation.options.accumilatedWidth) ? currentLabelWidth + value.width : (currentLabelWidth < value.width) ? value.width : currentLabelWidth;
//                    });
//                    lastWidth = currentLabelWidth;
//                    widthCount += (currentLabelWidth + 2);
//                }
//            }
//        });
//        xValue = chart.plotWidth * 0.75 - widthCount - labelWidth;
//        return xValue;
// };

infChart.tradingLineDrawing.prototype.getPlotHeight = function () {
    return {
        height: this.additionalDrawings['priceLabel'] && this.additionalDrawings['priceLabel'].height
    };
};

infChart.tradingLineDrawing.prototype.getSettingsPopup = function () {
    return $("<div></div>");
};

infChart.tradingLineDrawing.prototype.scale = function () {
    var self = this,
        ann = self.annotation,
        chart = ann.chart,
        options = ann.options,
        plotWidth = chart.plotWidth,
        plotx = chart.plotLeft;

    var label = self.additionalDrawings['priceLabel'];

    /**
     * updating the annotation, setting the x value to 75% of plot width
     * so the line will start from the x value to the label
     */

    // label.attr({
    // x: 0,
    // zIndex: 20
    // });

    label.textSetter(label.text.textStr);

    /* to fix hidden tab's label issues in flax layout, https://xinfiit.atlassian.net/browse/TTW-249 */
    $.each(self.additionalDrawings['ctrlLabels'], function (key, value) {
        value.textSetter(value.text.textStr);
    });

    var lastX = infChart.drawingUtils.common.tradingUtils.adjustControlLabelsPositions(self.additionalDrawings['ctrlLabels'], 0, label.x + label.width);

    var line = ["M", lastX, 0, 'L', plotWidth, 0];

    ann.update({
        x: plotx, // since xValue is based on the actual time values on the series xAxis.min doesn't provide the exact coordinations of the plotLeft of the chart.
        xValue: null, // set xValue as null to position annotation to into x.
        shape: {
            params: {
                d: line
            }
        }
    });

    if (!options.isDisplayOnly || options.allowDragY) {
        infChart.drawingUtils.common.removeDragSupporters.call(this, this.dragSupporters);
        infChart.drawingUtils.common.addDragSupporters.call(this, ann, chart, line,
            this.dragSupporters, undefined, infChart.drawingUtils.common.tradingUtils.tradingDragSupporterStyles);

        //if (infChart.drawingUtils.common.tradingUtils.isAlgoOrder(options.order)) {
        //infChart.drawingUtils.common.tradingUtils.scaleAlgoLimits.call(self);
        //}
    }
};

infChart.tradingLineDrawing.prototype.selectAndBindResize = function () {
    infChart.drawingUtils.common.tradingUtils.selectAndBindResize.call(this, (this.annotation.chart.plotWidth * 0.9));
};

infChart.tradingLineDrawing.prototype.step = function () { };

infChart.tradingLineDrawing.prototype.stop = function (e) { };

infChart.tradingLineDrawing.prototype.translate = function () {
    var self = this,
        ann = this.annotation,
        chart = ann.chart,
        order = ann.options.order;

    order.price = self.yValue;
    var priceLabel = this.additionalDrawings['priceLabel'];
    priceLabel.attr({
        text: infChart.drawingUtils.common.tradingUtils.formatOrderPrice(this.stockChartId, order)
    });
    //when price changes update the x of ctrl labels
    //todo : this can be optimized - can check length
    infChart.drawingUtils.common.tradingUtils.adjustControlLabelsPositions(this.additionalDrawings['ctrlLabels'], 0, priceLabel.x + priceLabel.width);

    var isSentOrder = infChart.drawingUtils.common.tradingUtils.isSentOrder(order);
    if (isSentOrder) {
        ann.options.amend = true;
        var originalOrder = ann.options.originalOrder;
        if (!this.additionalDrawings['original']) {
            if (order.price !== originalOrder.price) {
                this.additionalDrawings['original'] = infChart.drawingUtils.common.tradingUtils.addOrderDrawing(originalOrder, chart, this.drawingSettingsContainer, true, false);
                infChart.drawingUtils.common.tradingUtils.updateControlLabelsVisibility(this.additionalDrawings['ctrlLabels'], true);
            }
        } else {
            //intentionally we are not removing original order when user is adjusting the order line
            //    if (order.price === originalOrder.price) {
            //        infChart.drawingUtils.common.tradingUtils.removeDrawing(this.additionalDrawings['original']);
            //        this.additionalDrawings['original'] = undefined;
            //    }
        }
    }

    // infChart.drawingUtils.common.tradingUtils.updateOrderDrawing.call(self, { 'price': self.yValue }, false, order);
    infChart.drawingUtils.common.tradingUtils.onOrderChanges.call(self, order.orderId, {
        'price': self.yValue
    });

    this.selectAndBindResize();
    chart.selectedAnnotation = ann;
};

infChart.tradingLineDrawing.prototype.updateSettings = function () { };

infChart.tradingLineDrawing.prototype.validateTranslation = function (x, y) {
    var annotation = this.annotation,
        yValue = annotation && annotation.options && infChart.drawingUtils.common.getBaseYValue.call(this, y);
    console.debug("validateTranslation : yValue : " + yValue);
    return (yValue && yValue >= 0);
};

