window.infChart = window.infChart || {};

infChart.limitOrderDrawing = function () {
    infChart.drawingObject.apply(this, arguments);
};

infChart.limitOrderDrawing.prototype = Object.create(infChart.drawingObject.prototype);

infChart.limitOrderDrawing.prototype.additionalDrawingsFunction = function () {
    var self = this,
        ann = self.annotation,
        chart = ann.chart,
        //bbox = chart.container.getBoundingClientRect(),
        yAxis = chart.yAxis[ann.options.yAxis],
        y = yAxis.toPixels(ann.options.yValue),
        options = ann.options,
        order = options.order,
        isAlgoOrder = infChart.drawingUtils.common.tradingUtils.isAlgoOrder(order),
        orderTicketTitle = infChart.drawingUtils.common.tradingUtils.getOrderTicketTitle(order);

    if (chart.infScaleY) {
        y = y / chart.infScaleY;
    }

    var orderTicket = infChart.drawingUtils.common.tradingUtils.getLimitOrderTicket();
    orderTicket = $(orderTicket).appendTo(this.drawingSettingsContainer);

    if (orderTicketTitle.title) {
        var titleElement = orderTicket.find("span[rel=title]");

        titleElement.html(orderTicketTitle.title);

        if (orderTicketTitle.titleClass) {
            titleElement.addClass(orderTicketTitle.titleClass);
        }

        titleElement.removeClass("d-none");
    }

    //infChart.drawingUtils.common.tradingUtils.initializeLimitOrder.call(self, ann.options.order, ann.options.subType);

    //var w = orderTicket.outerWidth(true);
    var h = orderTicket.outerHeight(true);
    //var x = (bbox.right - bbox.left) - w;
    orderTicket.css({
        //left: x - 50,
        top: y - (h / 2),
        display: "block"
    });

    if (isAlgoOrder) {
        orderTicket.find("[data-rel='value']").attr({
            'readOnly': true,
            'disabled': true
        });
        orderTicket.find("[data-rel='price']").attr({
            'readOnly': true,
            'disabled': true
        });
    }

    self.additionalDrawings["order"] = orderTicket;

    if (isAlgoOrder) {
        infChart.drawingUtils.common.tradingUtils.addAlgoLimits.call(self);
    }

    infChart.drawingUtils.common.tradingUtils.initializeLimitOrder.call(self, order, options.subType);

    infChart.drawingUtils.common.tradingUtils.bindLimitOrderSettingsEvents.call(self);
};

infChart.limitOrderDrawing.prototype.bindSettingsEvents = function () { };

infChart.limitOrderDrawing.prototype.getConfig = function () {
    var annotation = this.annotation;
    return {
        shape: 'limitOrder',
        borderColor: annotation.options.shape.params.stroke,
        fillColor: annotation.options.shape.params.fill,
        strokeWidth: annotation.options.shape.params['stroke-width'],
        dashStyle: annotation.options.shape.params.dashstyle,
        xValue: annotation.options.xValue,
        yValue: annotation.options.yValue,
        clickCords: annotation.options.clickCords,
        width: annotation.chart.plotWidth,
        isDisplayOnly: annotation.options.isDisplayOnly,
        isRealTimeTranslation: annotation.options.isRealTimeTranslation,
        subType: annotation.options.subType,
        order: annotation.options.order
    };
};

infChart.limitOrderDrawing.prototype.destroyDrawing = function () {
    this.additionalDrawings['order'].remove();

    infChart.drawingUtils.common.tradingUtils.removeAlgoLimits.call(this);

    var stopLossDrawing = this.additionalDrawings[infChart.drawingUtils.common.tradingUtils.constants.stopLoss];
    if (stopLossDrawing) {
        infChart.drawingUtils.common.tradingUtils.removeDrawing(stopLossDrawing);
    }

    var takeProfitDrawing = this.additionalDrawings[infChart.drawingUtils.common.tradingUtils.constants.takeProfit];
    if (takeProfitDrawing) {
        infChart.drawingUtils.common.tradingUtils.removeDrawing(takeProfitDrawing);
    }
};

infChart.limitOrderDrawing.prototype.getOptions = function (properties) {
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
    if (properties.subType) {
        options.subType = properties.subType;
    }
    if (properties.order) {
        options.order = properties.order;
        options.originalOrder = properties.originalOrder;
    }
    if (infChart.drawingUtils.common.tradingUtils.isAlgoTrendOrder(properties.order)) {
        options.allowDragY = false;
        options.shape.params.dashstyle = 'dot';
    }
    options.amend = properties.amend;
    options.adjustYAxisToViewAnnotation = true;
    //get annotation extremes and show without any crop areas when chart has user defined yAxis
    options.viewAnnotionWhenAdjustedYAxis = true;
    options.getExtremesFn = infChart.drawingUtils.common.tradingUtils.getLimitOrderExtremesFn;
    options.afterSetExtremesFn = infChart.drawingUtils.common.tradingUtils.positionLimitOrderWindow;
    options.validateTranslationFn = this.validateTranslation;
    return options;
};

infChart.limitOrderDrawing.prototype.getPlotHeight = function (y) {
    var orderH = this.additionalDrawings['order'].outerHeight(true),
        stopLoss = this.additionalDrawings[infChart.drawingUtils.common.tradingUtils.constants.stopLoss],
        takeProfit = this.additionalDrawings[infChart.drawingUtils.common.tradingUtils.constants.takeProfit],
        stopLossH = (stopLoss && stopLoss.getPlotHeight) ? stopLoss.getPlotHeight().height : 0,
        takeProfitH = (takeProfit && takeProfit.getPlotHeight) ? takeProfit.getPlotHeight().height : 0,
        upper, lower,
        ann = this.annotation,
        id = this.drawingId;


    //todo : consider  stopLoss and takeProfit when it is used
    /*if (this.subType) {
     lower = stopLossH;
     upper = takeProfitH;
     } else {
     lower = takeProfitH;
     upper = stopLossH;
     }*/
    var yAxis = ann.chart.yAxis[ann.options.yAxis],
        belowY = yAxis.toValue(y + orderH / 2),
        yValue = infChart.drawingUtils.common.getBaseYValue.call(this, belowY);
    var padingPx = yAxis.height * yAxis.options.minPadding;

    if (yValue < 0) {
        if (yAxis.infMinAnnotation == id) {
            if (orderH / 2 > padingPx) {
                lower = padingPx;
            }
        } else if (orderH / 2 > (yAxis.height - y) && y < yAxis.height) {
            lower = yAxis.height - y;
        } else {
            lower = 0;
        }
        //lower = y - yAxis.toPixels(infChart.drawingUtils.common.getYValue.call(this, 0));
        if (lower < 0) {
            lower = 0;
        }
        upper = orderH - lower;
    } else {
        lower = upper = orderH / 2;
    }
    return {
        height: orderH,
        isBelow: true,
        upper: upper,
        below: lower
    };
};

infChart.limitOrderDrawing.prototype.getSettingsPopup = function () {
    return $("<div></div>");
};

infChart.limitOrderDrawing.prototype.scale = function () {
    var self = this,
        ann = self.annotation,
        chart = ann.chart,
        line = ann.shape.d.split(' '),
        options = ann.options,
        order = options.order;

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

    infChart.drawingUtils.common.removeDragSupporters.call(self, self.dragSupporters);
    infChart.drawingUtils.common.addDragSupporters.call(self, ann, chart, ["M", 0, 0, 'L', line[4], line[5]], self.dragSupporters);
    //if (infChart.drawingUtils.common.tradingUtils.isAlgoOrder(order)) {
    //    infChart.drawingUtils.common.tradingUtils.scaleAlgoLimits.call(self);
    //}
    infChart.drawingUtils.common.tradingUtils.positionLimitOrderWindow.call(self);
};

infChart.limitOrderDrawing.prototype.selectAndBindResize = function () {
    infChart.drawingUtils.common.tradingUtils.selectAndBindResize.call(this);
};

infChart.limitOrderDrawing.prototype.step = function () { };

infChart.limitOrderDrawing.prototype.stop = function (e) { };

infChart.limitOrderDrawing.prototype.translate = function () {
    var self = this,
        ann = self.annotation,
        chart = ann.chart,
        order = ann.options.order,
        orderTicket = self.additionalDrawings["order"],
        trader = infChart.drawingUtils.common.tradingUtils.getTraderInstance(self.stockChartId);
        orderTicket.find("[data-rel='qty']").blur();

    //if (chart.infScaleY) {
    //    y = y / chart.infScaleY;
    //}

    order.price = self.yValue;

    infChart.drawingUtils.common.tradingUtils.positionLimitOrderWindow.call(this);

    var shares = order.qty,
        value = order.orderValue;

    if (shares) {
        var orderValue = infChart.drawingUtils.common.tradingUtils.getOrderValueFromOrder(order.price, order.qty, order.side, trader.tradingOptions);
        orderTicket.find("[data-rel='value']").val(infChart.drawingUtils.common.tradingUtils.formatOrderValue(self.stockChartId, order.price, orderValue));
    } else if (value) {
        order.qty = value / order.price;
        orderTicket.find("[data-rel='qty']").val(infChart.drawingUtils.common.tradingUtils.formatOrderQuantity(self.stockChartId, order));
    }
    orderTicket.find("[data-rel='price']").val(infChart.drawingUtils.common.tradingUtils.formatOrderPrice(self.stockChartId, order));

    infChart.drawingUtils.common.tradingUtils.validateBuySellForm(orderTicket, self, order);

    infChart.drawingUtils.common.tradingUtils.onOrderChanges.call(self, ann.options.order.orderId, shares ? {
        'price': order.price
    } : {
        'price': order.price,
        'qty': order.qty
    });

    var stopLossWindow, takeProfitWindow;
    if (self.additionalDrawings[infChart.drawingUtils.common.tradingUtils.constants.stopLoss]) {
        var sl = self.additionalDrawings[infChart.drawingUtils.common.tradingUtils.constants.stopLoss];
        stopLossWindow = sl.additionalDrawings["order"];

        infChart.drawingUtils.common.tradingUtils.updateLimitValues(self.stockChartId, order, sl);
        infChart.drawingUtils.common.tradingUtils.moveDependentDrawing(self, sl);
    }
    if (self.additionalDrawings[infChart.drawingUtils.common.tradingUtils.constants.takeProfit]) {
        var tp = self.additionalDrawings[infChart.drawingUtils.common.tradingUtils.constants.takeProfit];
        takeProfitWindow = tp.additionalDrawings["order"];

        infChart.drawingUtils.common.tradingUtils.updateLimitValues(self.stockChartId, order, tp);
        infChart.drawingUtils.common.tradingUtils.moveDependentDrawing(self, tp);
    }

    if (stopLossWindow || takeProfitWindow) {
        var top = $(chart.container).offset().top,
            mainOrderWindowTop = orderTicket.offset().top,
            mainOrderWindowBottom = mainOrderWindowTop + orderTicket.outerHeight(true),
            bottom = top + chart.plotHeight;
        if (this.subType) {
            if (stopLossWindow) {
                stopLossWindow.draggable("option", "containment", [0, mainOrderWindowBottom, 0, bottom]);
            }
            if (takeProfitWindow) {
                takeProfitWindow.draggable("option", "containment", [0, top, 0, mainOrderWindowTop]);
            }
        } else {
            bottom = mainOrderWindowTop;
            if (stopLossWindow) {
                stopLossWindow.draggable("option", "containment", [0, top, 0, mainOrderWindowTop]);
            }
            if (takeProfitWindow) {
                takeProfitWindow.draggable("option", "containment", [0, mainOrderWindowBottom, 0, bottom]);
            }
        }
    }

    infChart.drawingUtils.common.tradingUtils.updateRiskReward(self);

    this.selectAndBindResize();
    chart.selectedAnnotation = ann;
};

infChart.limitOrderDrawing.prototype.updateSettings = function (properties) { };

/**
 * validate moving orders below zero
 * called from annotations => translateAnnotation
 * should invoke with drawing object
 * @param x
 * @param y
 * @returns {boolean}
 */
infChart.limitOrderDrawing.prototype.validateTranslation = function (x, y) {
    var annotation = this.annotation,
        yValue = annotation && annotation.options && infChart.drawingUtils.common.getBaseYValue.call(this, y);
    console.debug("validateTranslation : yValue : " + yValue);
    return (yValue && yValue >= 0);
};
