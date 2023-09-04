/**
 * Drawing utils for trading
 * drawing utils communicate with infChart.tradingManager and infChart.drawingsManager
 */

window.infChart = window.infChart || {};
infChart.drawingUtils = infChart.drawingUtils || {};
infChart.drawingUtils.common = infChart.drawingUtils.common || {};

infChart.drawingUtils.common.tradingUtils = {
    constants: {
        stopLoss: 'stopLoss',
        takeProfit: 'takeProfit',
        algo: 'algo'
    },
    tradingDragSupporterStyles: {
        'stroke-width': 20,
        stroke: 'transparent',
        fill: 'transparent',
        'z-index': 1,
        cursor: 'move'
    },
    /**
     * add filled order drawing - not used yet
     * @param order
     * @param chart
     * @param settingsContainer
     */
    addFilledOrderDrawing: function (order, chart) {
        infChart.util.console.log("chart.drawingUtils => addFilledOrderDrawing Order => " + JSON.stringify(order));

        var updated = false;
        chart.annotations.allItems.forEach(function (annotation) {
            if (annotation.options.drawingType == infChart.constants.drawingTypes.trading) {
                if (order.orderId === annotation.options.orderId) {
                    updated = true;
                }
            }
        });

        if (!updated) {
            var orderDrawing = {
                "shape": "tradingLabel",
                "xValue": new Date(order.time).getTime(),
                "yValue": parseFloat(order.price),
                "text": order.qty + '</br>' + order.type,
                "width": chart.plotWidth,
                "subType": order.drawingSubType,
                "orderId": order.orderId,
                "qty": order.qty,
                "account": order.account
            };

            infChart.tradingManager.createTradingDrawing(chart, orderDrawing);
        }
    },
    onRevert: function () {
        var drawingObj = this,
            annotation = drawingObj.annotation,
            originalOrder = annotation.options.originalOrder,
            isAlgoOrder = infChart.drawingUtils.common.tradingUtils.isAlgoOrder(originalOrder),
            originalAlgoOrder;

        if (isAlgoOrder) {
            originalAlgoOrder = annotation.options.originalOrder.algo;
        }

        drawingObj.yValue = originalOrder.price;

        annotation.options.amend = false;
        annotation.options.order.price = originalOrder.price;
        annotation.options.order.qty = originalOrder.qty;

        if (isAlgoOrder) {
            annotation.options.order.algo = originalAlgoOrder;
        }

        if (drawingObj.shape === 'tradingLine') {

            var priceLabel = drawingObj.additionalDrawings['priceLabel'];
            priceLabel.attr({
                text: infChart.drawingUtils.common.tradingUtils.formatOrderPrice(drawingObj.stockChartId, originalOrder)
            });

            drawingObj.additionalDrawings['ctrlLabels'][0].attr({
                text: infChart.drawingUtils.common.tradingUtils.formatOrderQuantity(drawingObj.stockChartId, originalOrder)
            });

            infChart.drawingUtils.common.tradingUtils.updateControlLabelsVisibility(drawingObj.additionalDrawings['ctrlLabels'], false);
            //when price changes update the x of ctrl labels
            infChart.drawingUtils.common.tradingUtils.adjustControlLabelsPositions(drawingObj.additionalDrawings['ctrlLabels'], 0, priceLabel.x + priceLabel.width);

            //update algo-regression line to original order 
            //original order removeDrawing will set extremes so no need to set extremes in here.
            if (isAlgoOrder && drawingObj.additionalDrawings['algo']) {
                infChart.drawingUtils.common.tradingUtils.updateAlgoLimits.call(drawingObj);
            }

            if (drawingObj.additionalDrawings['original']) {
                infChart.drawingUtils.common.tradingUtils.removeDrawing(drawingObj.additionalDrawings['original']);
                drawingObj.additionalDrawings['original'] = undefined;
            }
        } else if (drawingObj.shape === 'limitOrder') {
            infChart.drawingUtils.common.tradingUtils.initializeLimitOrder.call(drawingObj, annotation.options.order, annotation.options.subType);
        }

        drawingObj.scaleDrawing.call(drawingObj, true);
    },
    updateTradeLineDrawing: function (hasPriceChanged, hasQuantityChanged, hasSideChanged, isSentOrder, amend) {
        var drawingObj = this,
            annotation = drawingObj.annotation;
        if (hasSideChanged) {
            annotation.options.subType = annotation.options.order.side;
            drawingObj.subType = annotation.options.subType;

            var color = (annotation.options.subType == infChart.constants.chartTrading.orderSide.buy ?
                infChart.constants.chartTrading.theme.buyColor : infChart.constants.chartTrading.theme.sellColor);

            annotation.update({
                shape: {
                    params: {
                        fill: color,
                        stroke: color
                    }
                }
            });
        }
        if (hasQuantityChanged) {
            var qtyLabel = drawingObj.additionalDrawings['ctrlLabels'][0];
            if(qtyLabel){
                qtyLabel.attr({
                    text: infChart.drawingUtils.common.tradingUtils.formatOrderQuantity(drawingObj.stockChartId, annotation.options.order)
                });

                if (!hasPriceChanged) {
                    //when qty changes update the x of ctrl labels
                    infChart.drawingUtils.common.tradingUtils.adjustControlLabelsPositions(drawingObj.additionalDrawings['ctrlLabels'], 1, qtyLabel.x + qtyLabel.width);
                    drawingObj.scaleDrawing.call(drawingObj);
                }
            }
        }
        if (hasPriceChanged) {
            var priceLabel = drawingObj.additionalDrawings['priceLabel'];
            priceLabel.attr({
                text: infChart.drawingUtils.common.tradingUtils.formatOrderPrice(drawingObj.stockChartId, annotation.options.order)
            });
            //when price changes update the x of ctrl labels
            infChart.drawingUtils.common.tradingUtils.adjustControlLabelsPositions(drawingObj.additionalDrawings['ctrlLabels'], 0, priceLabel.x + priceLabel.width);

            drawingObj.scaleDrawing.call(drawingObj);
        }
        if (isSentOrder) {
            if (!drawingObj.additionalDrawings['original']) {
                if (annotation.options.order.price !== annotation.options.originalOrder.price) {
                    drawingObj.additionalDrawings['original'] = infChart.drawingUtils.common.tradingUtils.addOrderDrawing(
                        annotation.options.originalOrder, annotation.chart, drawingObj.drawingSettingsContainer, true, false);
                }
            } else {
                if (annotation.options.order.price === annotation.options.originalOrder.price) {
                    infChart.drawingUtils.common.tradingUtils.removeDrawing(drawingObj.additionalDrawings['original']);
                    drawingObj.additionalDrawings['original'] = undefined;
                }
            }
            infChart.drawingUtils.common.tradingUtils.updateControlLabelsVisibility(drawingObj.additionalDrawings['ctrlLabels'], amend);
        }
    },
    updateTradeLimitDrawing: function (hasPriceChanged, hasQuantityChanged, hasSideChanged, hasStopLossChanged, hasTakeProfitChanged, isSentOrder, amend) {
        var drawingObj = this,
            annotation = drawingObj.annotation,
            order = annotation.options.order,
            subType = annotation.options.subType,
            orderAD = drawingObj.additionalDrawings["order"];
        if (hasSideChanged) {
            annotation.options.subType = annotation.options.order.side == infChart.constants.chartTrading.orderSide.buy;
            drawingObj.subType = annotation.options.subType;

            var color = (annotation.options.subType ? infChart.constants.chartTrading.theme.buyColor : infChart.constants.chartTrading.theme.sellColor);

            annotation.update({
                shape: {
                    params: {
                        fill: color,
                        stroke: color
                    }
                }
            });
        }
        if (hasPriceChanged) {
            drawingObj.scaleDrawing.call(drawingObj);
        }
        if (hasStopLossChanged) {
            var dependentDrawingObj = drawingObj.additionalDrawings[infChart.drawingUtils.common.tradingUtils.constants.stopLoss];
            if (annotation.options.order.stopLossPrice) {
                var st = parseFloat(annotation.options.order.stopLossPrice);
                if (!dependentDrawingObj) {
                    infChart.drawingUtils.common.tradingUtils.onStopLoss(drawingObj, st);
                } else {
                    dependentDrawingObj.yValue = st;
                    dependentDrawingObj.scaleDrawing.call(dependentDrawingObj);
                }
            } else {
                if (dependentDrawingObj) {
                    delete drawingObj.additionalDrawings[dependentDrawingObj.subType];
                    infChart.drawingUtils.common.tradingUtils.removeDrawing(dependentDrawingObj);
                }
            }
        }
        if (hasTakeProfitChanged) {
            dependentDrawingObj = drawingObj.additionalDrawings[infChart.drawingUtils.common.tradingUtils.constants.takeProfit];
            if (annotation.options.order.takeProfitPrice) {
                var tp = parseFloat(annotation.options.order.takeProfitPrice);
                if (!dependentDrawingObj) {
                    infChart.drawingUtils.common.tradingUtils.onTakeProfit(drawingObj, tp);
                } else {
                    dependentDrawingObj.yValue = tp;
                    dependentDrawingObj.scaleDrawing.call(dependentDrawingObj);
                }
            } else {
                if (dependentDrawingObj) {
                    delete drawingObj.additionalDrawings[dependentDrawingObj.subType];
                    infChart.drawingUtils.common.tradingUtils.removeDrawing(dependentDrawingObj);
                }
            }
        }
        if (hasPriceChanged || hasQuantityChanged || hasSideChanged || hasStopLossChanged || hasTakeProfitChanged) {
            infChart.drawingUtils.common.tradingUtils.initializeLimitOrder.call(drawingObj, order, subType);
        }
    },
    updateOriginalOrderDrawing: function () {
        var drawingObj = this,
            originalOrderDrawing = drawingObj.additionalDrawings['original'],
            annotation = drawingObj.annotation;

        //change quantity
        var qtyLabel = originalOrderDrawing.additionalDrawings['ctrlLabels'][0];
        qtyLabel.attr({
            text: infChart.drawingUtils.common.tradingUtils.formatOrderQuantity(drawingObj.stockChartId, annotation.options.originalOrder)
        });
        //when qty changes update the x of ctrl labels
        infChart.drawingUtils.common.tradingUtils.adjustControlLabelsPositions(originalOrderDrawing.additionalDrawings['ctrlLabels'], 1, qtyLabel.x + qtyLabel.width);

        //change price 
        var priceLabel = originalOrderDrawing.additionalDrawings['priceLabel'];
        priceLabel.attr({
            text: infChart.drawingUtils.common.tradingUtils.formatOrderPrice(drawingObj.stockChartId, annotation.options.originalOrder)
        });
        //when price changes update the x of ctrl labels
        infChart.drawingUtils.common.tradingUtils.adjustControlLabelsPositions(originalOrderDrawing.additionalDrawings['ctrlLabels'], 0, priceLabel.x + priceLabel.width);

        drawingObj.scaleDrawing.call(originalOrderDrawing);
    },
    /**
     * update order drawing
     * should invoke with drawing object
     * @param changes
     * @param revert
     * @param order
     */
    updateOrderDrawing: function (changes, revert, order) {
        var drawingObj = this,
            annotation = drawingObj.annotation,
            originalOrder = annotation.options.originalOrder;
        if (revert) {
            infChart.drawingUtils.common.tradingUtils.onRevert.call(drawingObj, changes);
        } else {
            //updates from oms
            if (order.status) {
                annotation.options.order.status = parseInt(order.status, 10);
            }
            if (order.fillQty) {
                annotation.options.order.fillQty = parseFloat(order.fillQty);
            }
            if (order.remainingQty) {
                annotation.options.order.remainingQty = parseFloat(order.remainingQty);
            }

            var isSentOrder = infChart.drawingUtils.common.tradingUtils.isSentOrder(order);

            var amend = annotation.options.amend,
                hasPriceChanged = false,
                hasQuantityChanged = false,
                hasSideChanged = false,
                hasStopLossChanged = false,
                hasTakeProfitChanged = false,
                originalOrderUpdated = false,
                algoUpdated = false;

            if (changes && changes.type) {
                annotation.options.order.type = parseInt(changes.type, 10);
            } else {
                if (order.type != annotation.options.order.type) {
                    annotation.options.order.type = order.type;
                }
            }

            if (changes && changes.tif) {
                annotation.options.order.tif = parseInt(changes.tif, 10);
            } else {
                if (order.tif != annotation.options.order.tif) {
                    annotation.options.order.tif = order.tif;
                }
            }

            if (changes && changes.hasOwnProperty('stopLossPrice')) {
                annotation.options.order.stopLoss = parseFloat(changes.stopLossPrice);
            } else {
                if (order.hasOwnProperty('stopLossPrice') && order.stopLossPrice > 0 && order.stopLossPrice != annotation.options.order.stopLoss) {
                    annotation.options.order.stopLoss = order.stopLossPrice;
                }
            }

            if (changes && changes.hasOwnProperty('takeProfitPrice')) {
                annotation.options.order.takeProfit = parseFloat(changes.takeProfitPrice);
            } else {
                if (order.hasOwnProperty('takeProfitPrice') && order.takeProfitPrice > 0 && order.takeProfitPrice != annotation.options.order.takeProfit) {
                    annotation.options.order.takeProfit = order.takeProfitPrice;
                }
            }

            if (changes && changes.qty) {
                var qty = infChart.drawingUtils.common.tradingUtils.getQuantity.call(drawingObj, changes.qty);
                if (annotation.options.order.qty !== qty) {
                    annotation.options.order.qty = qty;
                }
                hasQuantityChanged = true;//https://xinfiit.atlassian.net/browse/CCA-4624
                if (!isSentOrder || originalOrder.qty !== qty) {
                    amend = true;
                }
            } else {
                if (isSentOrder) {
                    if (amend) {
                        if (order.hasOwnProperty('originalQty') && (order.originalQty !== annotation.options.originalOrder.qty)) {
                            annotation.options.originalOrder.qty = order.qty;
                            originalOrderUpdated = true;
                        }
                    } else {
                        if (order.qty != annotation.options.order.qty) {
                            annotation.options.order.qty = order.qty;
                            annotation.options.originalOrder.qty = order.qty;
                            hasQuantityChanged = true;
                            // originalOrderUpdated = true;
                        }
                    }
                }
            }

            if (changes && changes.price) {
                var price = parseFloat(changes.price);
                if (annotation.options.order.price !== price) {
                    annotation.options.order.price = price;
                    drawingObj.yValue = price;
                    hasPriceChanged = true;
                }
                if (!isSentOrder || originalOrder.price !== price) {
                    amend = true;
                }
            } else {
                if (isSentOrder) {
                    if (amend) {
                        if (order.hasOwnProperty('originalPrice') && (order.originalPrice !== annotation.options.originalOrder.price)) {
                            annotation.options.originalOrder.price = order.originalPrice;
                            originalOrderUpdated = true;
                        }
                    } else {
                        if (order.price != annotation.options.order.price) {
                            annotation.options.order.price = order.price;
                            annotation.options.originalOrder.price = order.price;
                            drawingObj.yValue = order.price;
                            hasPriceChanged = true;
                            // originalOrderUpdated = true;
                        }
                    }
                }
            }

            if (changes && changes.side) {
                annotation.options.order.side = parseInt(changes.side, 10);
                hasSideChanged = true;
            } else {
                if (order.side != annotation.options.order.side) {
                    annotation.options.order.side = order.side;
                    hasSideChanged = true;
                }
            }

            if (changes && changes.algo) {
                annotation.options.order.algo = changes.algo;
                algoUpdated = true;
            }

            if (isSentOrder) {
                annotation.options.amend = amend;
            }

            if (drawingObj.shape === 'tradingLine') {
                infChart.drawingUtils.common.tradingUtils.updateTradeLineDrawing.call(drawingObj, hasPriceChanged, hasQuantityChanged,
                    hasSideChanged, isSentOrder, amend);
                if (isSentOrder && originalOrderUpdated) {
                    var originalOrderDrawing = drawingObj.additionalDrawings['original'];
                    if (originalOrderDrawing) {
                        infChart.drawingUtils.common.tradingUtils.updateOriginalOrderDrawing.call(drawingObj);
                    }
                }
                if (algoUpdated) {
                    infChart.drawingUtils.common.tradingUtils.updateAlgoLimits.call(drawingObj);
                }
            } else if (drawingObj.shape === 'limitOrder') {
                infChart.drawingUtils.common.tradingUtils.updateTradeLimitDrawing.call(drawingObj, hasPriceChanged, hasQuantityChanged,
                    hasSideChanged, hasStopLossChanged, hasTakeProfitChanged, isSentOrder, amend);
            }
        }
    },
    /**
     * add order drawing
     * @param order
     * @param chart
     * @param settingsContainer
     * @param isDisplayOnly
     * @param amend
     * @param originalOrder
     * @returns {*}
     */
    addOrderDrawing: function (order, chart, settingsContainer, isDisplayOnly, amend, originalOrder) {
        infChart.util.console.log("chart.drawingUtils => addOrderDrawing Order => " + JSON.stringify(order));
        var xAxis = chart.xAxis[0],
            yAxis = chart.yAxis[0],
            price = parseFloat(order.price);

        var isSentOrder = infChart.drawingUtils.common.tradingUtils.isSentOrder(order);
        if (isSentOrder) {
            if(!amend){
                originalOrder = order;
                order.originalPrice = price;
            }
        }

        var orderDrawing = {
            "shape": "tradingLine",
            "xValue": xAxis.toValue(chart.plotLeft),
            "yValue": price,
            "subType": order.side,
            "order": order,
            "width": chart.plotWidth,
            "borderColor": (order.side == infChart.constants.chartTrading.orderSide.buy ? infChart.constants.chartTrading.theme.buyColor : infChart.constants.chartTrading.theme.sellColor),
            "fillColor": (order.side == infChart.constants.chartTrading.orderSide.buy ? infChart.constants.chartTrading.theme.buyColor : infChart.constants.chartTrading.theme.sellColor),
            "strokeWidth": 2,
            "dashStyle": "solid",
            "isDisplayOnly": isDisplayOnly,
            "amend": amend,
            "originalOrder": originalOrder,
            "clickCords": {
                "x": chart.plotLeft,
                "y": yAxis.toPixels(price)
            },
            "isIdea":order.isIdea
        };

        var drawingObject = infChart.tradingManager.createTradingDrawing(chart, orderDrawing);
        if (isSentOrder) {
            if (amend) {
                if (originalOrder && price !== order.originalPrice) {
                    drawingObject.additionalDrawings['original'] = infChart.drawingUtils.common.tradingUtils.addOrderDrawing(originalOrder, chart, settingsContainer, true, false);
                }
            }
        }
        return drawingObject;
    },
    /**
     * add holding drawing
     * @param holding
     * @param chart
     * @param settingsContainer
     * @param isDisplayOnly
     * @returns {*}
     */
    addHoldingDrawing: function (holding, chart, isDisplayOnly) {
        infChart.util.console.log("chart.drawingUtils => addHoldingDrawing Order => " + JSON.stringify(holding));
        var xAxis = chart.xAxis[0],
            yAxis = chart.yAxis[0],
            price = parseFloat(holding.price);

        var orderDrawing = {
            "shape": "holdingLine",
            "xValue": holding.time,
            "yValue": price,
            "subType": holding.drawingSubType,
            "orderId": holding.orderId,
            "qty": holding.qty,
            "price": holding.price,
            "time": holding.time,
            "account": holding.account,
            "width": chart.plotWidth,
            "borderColor": infChart.constants.chartTrading.theme.buyColor,
            "fillColor": infChart.constants.chartTrading.theme.buyColor,
            "strokeWidth": 2,
            "dashStyle": "dash",
            "isDisplayOnly": isDisplayOnly,
            "clickCords": {
                "x": xAxis.toPixels(holding.time),
                "y": yAxis.toPixels(price)
            }
        };

        return infChart.tradingManager.createTradingDrawing(chart, orderDrawing);
    },
    updateHoldingDrawing: function (holding) {
        //todo : implement
    },
    /**
     * remove drawing from chart
     * @param drawingObj
     * @param setExtremes
     */
    removeDrawing: function (drawingObj, setExtremes) {
        infChart.drawingsManager.removeDrawing(drawingObj.stockChartId, drawingObj.drawingId, setExtremes);
    },
    /**
     * is order sent to server
     * @param order
     * @returns {*|boolean}
     */
    isSentOrder: function (order) {
        return order && order.status != infChart.constants.chartTrading.orderStatus.local;
    },
    formatValue: function (id, val, dp) {
        return infChart.drawingUtils.common.tradingUtils.getTraderInstance(id).getFormattedVal(val, dp ? dp : 2);
    },
    formatOrderPrice: function (id, order) {
        return infChart.drawingUtils.common.tradingUtils.getTraderInstance(id).formatOrderPrice(order.price);
    },
    formatOrderLimitPrice: function (id, limitPrice, order) {
        return infChart.drawingUtils.common.tradingUtils.getTraderInstance(id).formatOrderLimitPrice(limitPrice);
    },
    formatOrderValue: function (id, price, orderValue) {
        return infChart.drawingUtils.common.tradingUtils.getTraderInstance(id).formatOrderValue(price, orderValue);
    },
    /**
     * format order quantity
     * @param {string} id - chart id
     * @param {object} order - order object
     * @returns {string} - formatted quantity
     */
    formatOrderQuantity: function (id, order) {
        return infChart.drawingUtils.common.tradingUtils.getTraderInstance(id).formatOrderQuantity(order.qty, order);
    },
    hasMinimumOrderQuantity: function (id, qty, order) {
        var returnVal = {
            isValidQty: true,
            minQty: 0
        }
        if(!infChart.drawingUtils.common.tradingUtils.isSubOrder(order)) {
            returnVal = infChart.drawingUtils.common.tradingUtils.getTraderInstance(id).hasMinimumOrderQuantity(qty)
        }
        return returnVal;
    },
    getCurrencies: function (id, symbol) {
        return infChart.drawingUtils.common.tradingUtils.getTraderInstance(id).getCurrencies(symbol);
    },
    getQuantity: function (qty) {
        var trader = infChart.drawingUtils.common.tradingUtils.getTraderInstance(this.stockChartId);
        return trader && trader.getOptions().qtyInDecimals ? parseFloat(qty) : parseInt(qty, 10);
    },
    /**
     * get holdings price
     * should invoke with drawing object
     * @returns {*}
     */
    getHoldingDisplayText: function () {
        var options = this.annotation.options;
        return (options.isDisplayOnly && options.price ? (infChart.drawingUtils.common.tradingUtils.formatOrderLimitPrice(this.stockChartId, options.price)) : "");
    },
    /**
     * on adding stop loss order
     * @param drawingObject
     * @param yValue
     */
    onStopLoss: function (drawingObject, yValue) {
        var chart = drawingObject.chart;
        var annotation = drawingObject.annotation;

        var buy = annotation.options.subType;
        var shape = buy ? "lowerLimit" : "upperLimit";

        var drawingObj = infChart.tradingManager.createTradingDrawing(chart, {
            "shape": shape,
            "xValue": chart.xAxis[0].toValue(chart.plotWidth * 0.25),
            "yValue": yValue,
            "width": chart.plotWidth,
            "borderColor": buy ? infChart.constants.chartTrading.theme.sellColor : infChart.constants.chartTrading.theme.buyColor,
            "fillColor": buy ? infChart.constants.chartTrading.theme.sellColor : infChart.constants.chartTrading.theme.buyColor,
            "strokeWidth": 2,
            "dashStyle": "solid",
            isRealTimeTranslation: true,
            "clickCords": {
                "x": chart.plotWidth * 0.25,
                "y": chart.yAxis[0].toPixels(yValue)
            },
            parent: annotation.options.id,
            subType: infChart.drawingUtils.common.tradingUtils.constants.stopLoss
        });
        drawingObject.additionalDrawings[drawingObj.annotation.options.subType] = drawingObj;
    },
    /**
     * on adding take profit order
     * @param drawingObject
     * @param yValue
     */
    onTakeProfit: function (drawingObject, yValue) {
        var chart = drawingObject.chart;
        var annotation = drawingObject.annotation;

        var buy = annotation.options.subType;
        var shape = buy ? "upperLimit" : "lowerLimit";

        var drawingObj = infChart.tradingManager.createTradingDrawing(chart, {
            "shape": shape,
            "xValue": chart.xAxis[0].toValue(chart.plotWidth * 0.25),
            "yValue": yValue,
            "width": chart.plotWidth,
            "borderColor": buy ? infChart.constants.chartTrading.theme.sellColor : infChart.constants.chartTrading.theme.buyColor,
            "fillColor": buy ? infChart.constants.chartTrading.theme.sellColor : infChart.constants.chartTrading.theme.buyColor,
            "strokeWidth": 2,
            "dashStyle": "solid",
            isRealTimeTranslation: true,
            "clickCords": {
                "x": chart.plotWidth * 0.25,
                "y": chart.yAxis[0].toPixels(yValue)
            },
            parent: annotation.options.id,
            subType: infChart.drawingUtils.common.tradingUtils.constants.takeProfit
        });
        drawingObject.additionalDrawings[drawingObj.annotation.options.subType] = drawingObj;
    },
    /**
     * on placing order
     * @param chartId
     * @param orderObj
     * @param drawingObject
     */
    placeOrder: function (chartId, orderObj) {
        var trader = infChart.drawingUtils.common.tradingUtils.getTraderInstance(chartId);
        if (orderObj.hasOwnProperty('fillQty') && orderObj.fillQty > orderObj.qty) {
            trader.showMessage('Invalid Quantity', 'Size entered is less than Filled Size.', 3000);
        } else {
            var hasMinQuantity = infChart.drawingUtils.common.tradingUtils.hasMinimumOrderQuantity(chartId, orderObj.qty, orderObj);
            if (hasMinQuantity.isValidQty) {
                if(!trader.isOrderExceeded(orderObj)){
                    //format l1, l2 values
                    if (infChart.drawingUtils.common.tradingUtils.isAlgoOrder(orderObj)) {
                        if (infChart.drawingUtils.common.tradingUtils.isAlgoTrendOrder(orderObj)) {
                            orderObj.algo.l1 = parseFloat(infChart.drawingUtils.common.tradingUtils.formatValue(chartId, orderObj.algo.l1).replace(/\,/g, ''));
                            orderObj.algo.l2 = parseFloat(infChart.drawingUtils.common.tradingUtils.formatValue(chartId, orderObj.algo.l2).replace(/\,/g, ''));
                        }
                    }
                    trader.placeOrder(orderObj.orderId, orderObj.price, orderObj.qty, orderObj.side, orderObj.type, orderObj.status, orderObj);
                } else {
                    var exceededMsg = "Buying Power exceeded.";
                    if(infChart.constants.chartTrading.orderSide.sell === orderObj.side) {
                        exceededMsg = "Available Quantity exceeded.";
                    }
                    trader.showMessage('Invalid Order Value', exceededMsg, 3000);
                }
            } else {
                var currencies = infChart.drawingUtils.common.tradingUtils.getCurrencies(chartId, orderObj.symbol);
                var warMsg = 'Minimum ' + hasMinQuantity.minQty + ' ' + currencies.primary + ' required.';
                trader.showMessage('Invalid Quantity', warMsg, 3000);
            }
        }
    },
    /**
     * on cancel order
     * @param chartId
     * @param order
     * @param drawingObject
     */
    cancelOrder: function (chartId, order) {
        infChart.drawingUtils.common.tradingUtils.getTraderInstance(chartId).cancelOrder(order);
    },
    revertOrder: function (chartId, order) {
        infChart.drawingUtils.common.tradingUtils.getTraderInstance(chartId).revertOrder(order);
    },
    /**
     * update risk reward valued
     * @param parentDrawing
     */
    updateRiskReward: function (parentDrawing) {
        var takeProfitDrawing = parentDrawing.additionalDrawings[infChart.drawingUtils.common.tradingUtils.constants.takeProfit];
        var stopLossDrawing = parentDrawing.additionalDrawings[infChart.drawingUtils.common.tradingUtils.constants.stopLoss];
        if (stopLossDrawing && takeProfitDrawing) {
            var stopLoss = stopLossDrawing.yValue;
            var takeProfit = takeProfitDrawing.yValue;
            var limitPrice = parentDrawing.yValue;
            var ratio = infChart.drawingUtils.common.tradingUtils.getRiskReward(parentDrawing.stockChartId, parentDrawing.subType, limitPrice, stopLoss, takeProfit);
            parentDrawing.additionalDrawings['order'].find('span[data-inf="riskReward"]').text(ratio);
        }
    },
    /**
     * calculate risk reward
     * @param id chart id
     * @param isBuy
     * @param orderPrice
     * @param stopLossPrice
     * @param takeProfitPrice
     * @returns {*}
     */
    getRiskReward: function (id, isBuy, orderPrice, stopLossPrice, takeProfitPrice) {
        var ratio;
        if (stopLossPrice === orderPrice) {
            ratio = '0.00';
        } else {
            var reward = (isBuy ? 1 : -1) * ((takeProfitPrice - orderPrice) / orderPrice);
            var risk = (isBuy ? -1 : 1) * ((stopLossPrice - orderPrice) / orderPrice);
            ratio = infChart.drawingUtils.common.tradingUtils.formatValue(id, reward / risk, 2);
        }
        return ratio;
    },
    /**
     * update stop loss or take profit limit values
     * @param id chart id
     * @param order
     * @param drawingObject
     */
    updateLimitValues: function (id, order, drawingObject) {
        var limitPrice = drawingObject.yValue,
            factor = (drawingObject.annotation.options.subType ? -1 : 1);

        var pct = infChart.drawingUtils.common.tradingUtils.formatValue(id, limitPrice / order.price, 2) + '%';
        var value = infChart.drawingUtils.common.tradingUtils.formatValue(id, (limitPrice - order.price) * order.qty * factor, 2);
        var orderTicket = drawingObject.additionalDrawings['order'];

        orderTicket.find('span[data-rel="pct"]').text(pct);
        orderTicket.find('span[data-rel="value"]').text(value);
    },
    /**
     * update stop loss or take profit values in the order obj
     * @param isStopLoss
     * @param order
     * @param price
     */
    updateOrderLimitValues: function (isStopLoss, order, price) {
        if (order) {
            if (isStopLoss) {
                order.stopLoss = price;
            } else {
                order.takeProfit = price;
            }
            infChart.drawingUtils.common.tradingUtils.onOrderChanges.call(this, order.orderId, isStopLoss ? {
                stopLossPrice: price
            } : {
                takeProfitPrice: price
            });
        } else {
            console.warn('order cannot be undefined or null');
        }
    },
    /**
     * validate moving stop loss or take profit orders with the parent order
     * called from annotations => translateAnnotation
     * should invoke with drawing object
     * @param x
     * @param y
     * @returns {boolean}
     */
    validateTranslationFn: function (x, y) {
        var parentDrawing = infChart.drawingsManager.getDrawingObject(this.stockChartId, this.annotation.options.parent);
        var type = this.annotation.options.subType;
        if ((type === infChart.drawingUtils.common.tradingUtils.constants.stopLoss && parentDrawing.subType) ||
            (type === infChart.drawingUtils.common.tradingUtils.constants.takeProfit && !parentDrawing.subType)) {
            return y < parentDrawing.annotation.options.yValue;
        } else {
            return y > parentDrawing.annotation.options.yValue;
        }
    },
    /**
     * get the min and max value for the limit order drawing
     * should invoke with drawing object
     * @returns {{max: *, min: *, y: *}}
     */
    getLimitOrderExtremesFn: function () {
        var drawing = this,
            id = drawing.drawingId,
            ann = drawing.annotation,
            height = drawing.additionalDrawings['order'].outerHeight(true);

        var yAxis = ann.chart.yAxis[ann.options.yAxis],
            y = yAxis.toPixels(ann.options.yValue),
            yValue = this.yValue,
            belowY = yAxis.toValue(y + height / 2),
            yValueBelow = infChart.drawingUtils.common.getBaseYValue.call(this, belowY),
            yZero = infChart.drawingUtils.common.getYValue.call(drawing, 0);
        var padingPx = yAxis.height * yAxis.options.minPadding,
            lower = height / 2,
            upper = height / 2,
            minPaddingUtilized = false;

        if (yValueBelow < 0) {
            minPaddingUtilized = true;
            if (yAxis.infMinAnnotation == id) {
                if (yValue > 0 && height / 2 > padingPx) {
                    lower = Math.max(yAxis.toPixels(yZero) - y, padingPx);
                } else if (height / 2 > padingPx) {
                    lower = padingPx;
                }
            } else if (height / 2 > (yAxis.height - y) && y < yAxis.height) {
                lower = yAxis.height - y;
            }
            //lower = y - yAxis.toPixels(infChart.drawingUtils.common.getYValue.call(this, 0));
            if (lower < 0) {
                lower = 0;
            }
            upper = height - lower;
        } else {
            if (height / 2 > (yAxis.height - y) && y < yAxis.height) {
                lower = yAxis.height - y;
                minPaddingUtilized = true;
            } else {
                lower = height / 2;
            }
            upper = height - lower;
        }

        var extremes = infChart.drawingUtils.common.tradingUtils.getLineLimitExtremesFn.call(this, upper, lower);
        extremes.minPaddingUtilized = minPaddingUtilized;
        extremes.upperPx = upper;
        extremes.lowerPx = lower;

        return extremes;

    },
    /**
     * position the limit order window
     * should invoke with drawing object
     */
    positionLimitOrderWindow: function () {

        var ann = this.annotation,
            chart = ann.chart,
            options = ann.options,
            yAxis = chart.yAxis[options.yAxis],
            orderTicket = this.additionalDrawings["order"],
            arrowEl;

        if (orderTicket) {
            arrowEl = orderTicket.find("[data-inf-ref=arrow]");
            var y = yAxis.toPixels(options.yValue);
            var userExtremes = ann.options.getExtremesFn.call(this);
            var upperPx = userExtremes.upperPx || (orderTicket.outerHeight(true) / 2);
            //,left = chart.infScaleX ? (bbox.left - containerBox.left ) / chart.infScaleX : (bbox.left - containerBox.left
            orderTicket.css({
                //left: left,
                top: y - upperPx,
                zIndex: 3 //CCA-3751
            });
            arrowEl.css({
                //left: left,
                top: upperPx - arrowEl.outerHeight() / 2,
                zIndex: 3 //CCA-3751
            });
        } else {
            console.warn('orderTicket additionalDrawings undefined');
        }
    },
    /**
     * position stop loss or take profit order drawings
     * should invoke with drawing object
     * @param below
     */
    positionLimit: function (below) {
        var drawing = this,
            ann = this.annotation,
            chart = ann.chart,
            options = ann.options,
            yAxis = chart.yAxis[options.yAxis],
            orderTicket = this.additionalDrawings["order"],
            y = yAxis.toPixels(options.yValue),
            parentDrawing = infChart.drawingsManager.getDrawingObject(drawing.stockChartId, options.parent),
            parentWindow = parentDrawing.additionalDrawings["order"],
            parentY = yAxis.toPixels(parentDrawing.annotation.options.yValue),
            top;
        //,left = chart.infScaleX ? (bbox.left - containerBox.left ) / chart.infScaleX : (bbox.left - containerBox.left);

        if (below) {
            if ((parentY + parentWindow.outerHeight(true) / 2) > y) {
                top = parentY + parentWindow.outerHeight(true) / 2;
            } else {
                top = y;
            }
        } else {
            if ((parentY - parentWindow.outerHeight(true) / 2) < y) {
                top = parentY - parentWindow.outerHeight(true) / 2;
            } else {
                top = y;
            }
            top = top - orderTicket.outerHeight(true);
        }
        orderTicket.css({
            //left: left,
            top: top,
            zIndex: 1
        });
    },
    /**
     * position top limit for limit order
     * should invoke with drawing object
     */
    positionTopLimitWindow: function () {
        infChart.drawingUtils.common.tradingUtils.positionLimit.call(this, false);
    },
    /**
     * position bottom limit for limit order
     * should invoke with drawing object
     */
    positionBottomLimitWindow: function () {
        infChart.drawingUtils.common.tradingUtils.positionLimit.call(this, true);
    },
    /**
     * get stop loss or take profit limit extremes
     * should invoke with drawing object
     * @returns {{max: *, min: *, y: *}}
     */
    getLimitExtremesFn: function () {
        var drawing = this,
            drawingObjParent = infChart.drawingsManager.getDrawingObject(drawing.stockChartId, this.annotation.options.parent),
            height = drawing.additionalDrawings['order'].outerHeight(true),
            below = false;

        if (drawingObjParent.subType) {
            below = drawing.subType === infChart.drawingUtils.common.tradingUtils.constants.stopLoss;
        } else {
            below = drawing.subType !== infChart.drawingUtils.common.tradingUtils.constants.stopLoss;
        }

        if (below) {
            return infChart.drawingUtils.common.tradingUtils.getLineLimitExtremesFn.call(this, 0, (height / 2));
        } else {
            return infChart.drawingUtils.common.tradingUtils.getLineLimitExtremesFn.call(this, (height / 2), 0);
        }
    },
    /**
     * get trading line extremes
     * should invoke with drawing object
     * @returns {{max: *, min: *, y: *}}
     */
    getLineExtremesFn: function () {
        var drawing = this,
            height = drawing.additionalDrawings.priceLabel.box.element.height.baseVal.value;

        //if (drawing.additionalDrawings['algo']) {
        //    var algoDrawing = drawing.additionalDrawings['algo'];
        //    return infChart.drawingUtils.common.tradingUtils.getAlgoLineExtremeFn.call(this, algoDrawing.yValue, algoDrawing.yValueEnd);
        //} else {
        return infChart.drawingUtils.common.tradingUtils.getLineLimitExtremesFn.call(this, (height / 2), (height / 2));
        //}
    },
    /**
     * get trading line, limit order, limit extremes
     * @param upperHeight
     * @param lowerHeight
     * @returns {{max: *, min: *, y: *, height: *}}
     */
    getLineLimitExtremesFn: function (upperHeight, lowerHeight) {
        var drawing = this,
            y = infChart.drawingUtils.common.getYValue.call(drawing, drawing.yValue),
            ann = drawing.annotation,
            yAxis = ann.chart.yAxis[ann.options.yAxis],
            maxY = y,
            minY = y,
            dataMax = (yAxis.userMax) || yAxis.dataMax,
            dataMin = yAxis.userMin || yAxis.dataMin;
        var newMin = y < dataMin ? y : null,
            newMax = y > dataMax ? y : null;
        var dataPadMax = yAxis.height * infChart.config.plotOptions.yAxis.maxPadding,
            dataPadMin = yAxis.height * infChart.config.plotOptions.yAxis.minPadding,
            newDataMin,
            newDataMax,
            currentPxv = (yAxis.max - yAxis.min) / yAxis.height,
            currentDataMax = yAxis.userMax ? yAxis.userMax - currentPxv * infChart.config.plotOptions.yAxis.maxPadding : yAxis.dataMax,
            currentDataMin = yAxis.userMin ? yAxis.userMin + currentPxv * infChart.config.plotOptions.yAxis.minPadding : yAxis.dataMin;
        var pxv,
            newPxv,
            minDrawing,
            maxDrawing;

        if (yAxis.height /*&& yAxis.height > ( ( upperHeight || 0 ) + ( lowerHeight || 0 ) ) */) {

            //if (yAxis.infMinAnnotation ) {
            //    if( yAxis.infMinAnnotation !== ann.id ) {
            //        minDrawing = infChart.drawingsManager.getDrawingObject(this.stockChartId, yAxis.infMinAnnotation);
            //        dataMin = minDrawing && infChart.drawingUtils.common.getYValue.call(minDrawing, minDrawing.yValue) || yAxis.dataMin;
            //    } else {
            //        dataMin = y;
            //    }
            //} else {
            //    dataMin = Math.min(yAxis.dataMin, y);
            //}
            //
            //if (yAxis.infMaxAnnotation ) {
            //    if( yAxis.infMaxAnnotation !== ann.id ) {
            //        maxDrawing = infChart.drawingsManager.getDrawingObject(this.stockChartId, yAxis.infMaxAnnotation);
            //        dataMax = minDrawing && infChart.drawingUtils.common.getYValue.call(maxDrawing, maxDrawing.yValue) || yAxis.dataMin;
            //    } else {
            //        dataMax = y;
            //    }
            //} else {
            //    dataMax = Math.max(yAxis.dataMax, y);
            //}
            //
            //if (ann.id === yAxis.infMinAnnotation )
            if (newMax || newMin) {

                var min = newMin ? newMin : currentDataMin,
                    max = newMax ? newMax : currentDataMax;

                pxv = (max - min) / (yAxis.height - (dataPadMax + dataPadMin));
                maxY = y + (dataPadMax + upperHeight) * pxv;
                minY = y - (dataPadMin + lowerHeight) * pxv;

                newDataMax = maxY - dataPadMax * pxv;
                newDataMin = minY + dataPadMin * pxv;

            } else {
                pxv = (yAxis.max - yAxis.min) / yAxis.height;
                maxY = y + (upperHeight) * pxv;
                minY = y - (lowerHeight) * pxv;
                newPxv = (Math.max(maxY, yAxis.max) - Math.min(minY, yAxis.min)) / yAxis.height;

                newDataMax = maxY - newPxv * dataPadMax;
                newDataMin = minY + newPxv * dataPadMin;
            }

            return {
                max: maxY,
                min: minY,
                y: y,
                height: (upperHeight + lowerHeight),
                dataMax: Math.max(yAxis.dataMax, newDataMax),
                dataMin: Math.min(yAxis.dataMin, newDataMin)
            };
        }
    },
    /**
     * get algo line extremes
     * @returns {{max: *, min: *, y: *}}
     */
    getAlgoLineExtremeFn: function () {
        var drawing = this,
            ann = drawing.annotation,
            yAxis = ann.chart.yAxis[ann.options.yAxis],
            yStart = ann.options.yValue,
            yEnd = ann.options.yValueEnd,
            dataMax = yAxis.userMax || yAxis.dataMax,
            dataMin = yAxis.userMin || yAxis.dataMin;
        var maxY = Math.max(yStart, yEnd);
        var minY = Math.min(yStart, yEnd);

        var newMin = minY < dataMin ? minY : null,
            newMax = maxY > dataMax ? maxY : null;

        if (newMax || newMin) {
            minY = newMin ? newMin : dataMin;
            maxY = newMax ? newMax : dataMax;
        }

        return {
            max: maxY,
            min: minY
        };
    },
    isLocalChangesAvailable: function (drawingObj) {
        return drawingObj.annotation.options.amend;
    },
    /**
     * when the chart changes an order
     * @param id
     * @param changes
     */
    onOrderChanges: function (id, changes) {
        if (changes) {
            this.annotation.options.amend = true;
        }
        infChart.drawingUtils.common.tradingUtils.getTraderInstance(this.stockChartId).onOrderChanges(id, changes);
    },
    /**
     * get limit order window html
     * @returns {string}
     */
    getLimitOrderTicket: function () {
        return infChart.structureManager.trading.getOrderTicketHTML();
    },
    handleExceededWarning: function (id, orderTicket, order) {
        var trader = infChart.drawingUtils.common.tradingUtils.getTraderInstance(id);
        var exceeded = trader.isOrderExceeded(order),
            ele = orderTicket.find('[data-rel="warningMsg"]');
        if (exceeded) {
            ele.show();
            if (order.side === infChart.constants.chartTrading.orderSide.buy) {
                ele.find('[data-rel="sell"]').hide();
                ele.find('[data-rel="buy"]').show();
            } else if (order.side === infChart.constants.chartTrading.orderSide.sell) {
                ele.find('[data-rel="sell"]').show();
                ele.find('[data-rel="buy"]').hide();
            }
        } else {
            ele.hide();
        }
    },
    /**
     * set initial values to limit order window
     * @param id - chart id
     * @param orderTicket
     * @param subType
     * @param order
     */
    initializeLimitOrder: function (order, subType) {
        var isSentOrder = infChart.drawingUtils.common.tradingUtils.isSentOrder(order),
            id = this.stockChartId,
            orderTicket = this.additionalDrawings["order"],
            ann = this.annotation,
            annOptions = ann && ann.options,
            enableLimits = annOptions && annOptions.enableLimits,
            trader = infChart.drawingUtils.common.tradingUtils.getTraderInstance(id);
        /*if (order) {
         orderTicket.find("[data-rel='tif']").val(order.tif);
         if (isSentOrder) {
         orderTicket.find("[data-rel='tif']").prop('disabled', true);
         } else {
         orderTicket.find("[data-rel='tif']").prop('disabled', false);
         }
         }*/

        if (enableLimits) {

            var slBtn = orderTicket.find("[data-inf-action='" + infChart.drawingUtils.common.tradingUtils.constants.stopLoss + "']"),
                cancelBtn = orderTicket.find("[data-inf-action='cancelStopLoss']"),
                slCtrl = orderTicket.find("[data-rel='stopPriceCtrl']");

            slBtn.removeClass('label-warning label-primary').addClass(subType ? 'label-warning' : 'label-primary');

            if (order.stopLoss) {
                slBtn.hide();
                cancelBtn.show();
                slCtrl.show();
                //orderTicket.find("[data-rel='valueCtrl']").removeClass('wide-item');
                orderTicket.find("[data-rel='stopPrice']").val(infChart.drawingUtils.common.tradingUtils.formatOrderLimitPrice(id, order.stopLoss, order));
            } else {
                slBtn.show();
                cancelBtn.hide();
                slCtrl.hide();
                //orderTicket.find("[data-rel='valueCtrl']").addClass('wide-item');
            }


            var tpBtn = orderTicket.find("[data-inf-action='" + infChart.drawingUtils.common.tradingUtils.constants.takeProfit + "']");
            tpBtn.removeClass('label-warning label-primary').addClass(subType ? 'label-warning' : 'label-primary');
            if (order.takeProfit) {
                tpBtn.hide();
            } else {
                tpBtn.show();
            }

            if (order.takeProfit && order.stopLoss) {
                orderTicket.find("span[data-inf='riskReward']").parent('label').show();
                var ratio = infChart.drawingUtils.common.tradingUtils.getRiskReward(id, subType, order.price, order.stopLoss, order.takeProfit);
                orderTicket.find('span[data-inf="riskReward"]').text(ratio);
            } else {
                orderTicket.find("span[data-inf='riskReward']").parent('label').hide();
            }
        }

        orderTicket.find("[data-rel='price']").val(infChart.drawingUtils.common.tradingUtils.formatOrderPrice(id, order));
        orderTicket.find("[data-rel='qty']").val(infChart.drawingUtils.common.tradingUtils.formatOrderQuantity(id, order));

        var orderValue = infChart.drawingUtils.common.tradingUtils.getOrderValueFromOrder(order.price, order.qty, order.side, trader.tradingOptions);
        orderTicket.find("[data-rel='value']").val(infChart.drawingUtils.common.tradingUtils.formatOrderValue(id, order.price, orderValue));

        //infChart.drawingUtils.common.tradingUtils.handleExceededWarning(id, orderTicket, order);

        var currencies = infChart.drawingUtils.common.tradingUtils.getCurrencies(id, order.symbol);
        orderTicket.find("[data-rel='secondaryCurrency']").text(currencies.currency);
        orderTicket.find("[data-rel='primaryCurrency']").text(currencies.primary ? currencies.primary : currencies.currency);

        var placeOrderBtn = orderTicket.find("[data-inf-action='placeOrder']");
        //var switchOrderSideBtn = orderTicket.find("[data-inf-action='switchSide']");
        //var cancelOrderBtn = orderTicket.find("[data-inf-action='cancelOrder']");

        //switchOrderSideBtn.removeClass('btn-warning btn-primary').addClass(subType ? 'btn-warning' : 'btn-primary');

        if (isSentOrder) {
            placeOrderBtn.text('Transmit');
            placeOrderBtn.removeClass('v-buy v-sell').addClass('v-transmit');
            //cancelOrderBtn.show();
            //switchOrderSideBtn.hide();
        } else {
            var buyLabel = trader.tradingOptions.buttonLabels && trader.tradingOptions.buttonLabels.Buy ? trader.tradingOptions.buttonLabels.Buy : 'Buy';
            var sellLabel = trader.tradingOptions.buttonLabels && trader.tradingOptions.buttonLabels.Sell ? trader.tradingOptions.buttonLabels.Sell : 'Sell';
            placeOrderBtn.text(subType ? buyLabel : sellLabel);
            placeOrderBtn.addClass(subType ? 'v-buy' : 'v-sell');
            //cancelOrderBtn.hide();
            //switchOrderSideBtn.show();
        }
        infChart.drawingUtils.common.tradingUtils.validateBuySellForm(orderTicket, this, order);
    },
    /**
     * convert text box value to row value
     * @param {string} id - chart id
     * @param {string | number} value - text box value
     * @param {boolean} removeScientificNotation - remove e
     * @returns {string | number} - string if e and removeScientificNotation
     */
    getRawValue: function (id, value, removeScientificNotation) {
        return infChart.drawingUtils.common.tradingUtils.getTraderInstance(id).getRawValue(value, removeScientificNotation);
    },
    /**
     * get value with fee - CCA-3938
     * @param {number} price
     * @param {number} qty
     * @param {boolean} side
     * @param {object} options
     */
    getOrderValueFromOrder: function (price, qty, side, options) {
        var currentOrderValue;
        if (options && typeof options.getValueWithFee === 'function') {
            currentOrderValue = options.getValueWithFee(price, qty, (side === 1));
        } else {
            currentOrderValue = price * qty;
        }
        return currentOrderValue;
    },
    /**
     * get quantity for ordervalue - CCA-3938
     * @param {number} price
     * @param {number} orderValue
     * @param {object} options
     */
    getOrderQtyFromValue: function (price, orderValue, options) {
        var qty;
        if (options && typeof options.getQtyWithFee === 'function') {
            qty = options.getQtyWithFee(price, orderValue);
        } else {
            qty = orderValue / price;
        }
        return qty;
    },
    bindValueInputEvents: function (drawingObject, ann, container, tradingOptions) {
        container.find("[data-rel='value']").on('blur', function () {
            var val = $(this).val();
            var order = ann.options.order;
            if (val !== "") {
                if (!isNaN(val)) {
                    var orderValue = infChart.drawingUtils.common.tradingUtils.getRawValue(drawingObject.stockChartId, val, false);
                    var fomOdrVal = infChart.drawingUtils.common.tradingUtils.formatOrderValue(drawingObject.stockChartId, order.price, orderValue);
                    var rFomOdrVal = infChart.drawingUtils.common.tradingUtils.getRawValue(drawingObject.stockChartId, fomOdrVal, false);
                    if(orderValue > 0 && orderValue !== rFomOdrVal) {
                        var qty = order.qty;
                        var hasMinimumOrderQuantity = infChart.drawingUtils.common.tradingUtils.hasMinimumOrderQuantity(drawingObject.stockChartId, qty, order);
                        if (!hasMinimumOrderQuantity.isValidQty) {
                            qty = hasMinimumOrderQuantity.minQty;
                            order.qty = qty;
                            var formattedQty = infChart.drawingUtils.common.tradingUtils.formatOrderQuantity(drawingObject.stockChartId, order);
                            var rQty = infChart.drawingUtils.common.tradingUtils.getRawValue(drawingObject.stockChartId, formattedQty, false);
                            order.qty = rQty;
                            drawingObject.additionalDrawings["order"].find("[data-rel='qty']").val(formattedQty);
                        }
                        orderValue = infChart.drawingUtils.common.tradingUtils.getOrderValueFromOrder(order.price, qty, order.side, tradingOptions);
                        var formattedVal = infChart.drawingUtils.common.tradingUtils.formatOrderValue(drawingObject.stockChartId, order.price, orderValue);
                        drawingObject.additionalDrawings["order"].find("[data-rel='value']").val(formattedVal);
                        infChart.drawingUtils.common.tradingUtils.onOrderChanges.call(drawingObject, order.orderId, {'qty': qty});
    
                        //infChart.drawingUtils.common.tradingUtils.handleExceededWarning(drawingObject.stockChartId, container, order);
                        var takeProfitDrawing = drawingObject.additionalDrawings[infChart.drawingUtils.common.tradingUtils.constants.takeProfit];
                        var stopLossDrawing = drawingObject.additionalDrawings[infChart.drawingUtils.common.tradingUtils.constants.stopLoss];
    
                        if (takeProfitDrawing) {
                            infChart.drawingUtils.common.tradingUtils.updateLimitValues(drawingObject.stockChartId, order, takeProfitDrawing);
                        }
                        if (stopLossDrawing) {
                            infChart.drawingUtils.common.tradingUtils.updateLimitValues(drawingObject.stockChartId, order, stopLossDrawing);
                        }
                    }
                }
            }
        });

        container.find("[data-rel='value']").on('click', function () {
            $(this).val(infChart.drawingUtils.common.tradingUtils.getRawValue(drawingObject.stockChartId, $(this).val(), true));
        });

        container.find("[data-rel='value']").on('keyup', function (event) {
            if (event.keyCode === 13) { //enter button click event
                container.find("[data-rel='value']").trigger('blur');
            } else {
                var orderValue = $(this).val();
                var order = ann.options.order;
                if (orderValue !== "") {
                    if (!isNaN(orderValue)) {
                        orderValue = infChart.drawingUtils.common.tradingUtils.getRawValue(drawingObject.stockChartId, orderValue, false);
                        var currentOrderValue = infChart.drawingUtils.common.tradingUtils.getOrderValueFromOrder(order.price, order.qty, order.side, tradingOptions);
                        var fomOdrVal = infChart.drawingUtils.common.tradingUtils.formatOrderValue(drawingObject.stockChartId, order.price, currentOrderValue);
                        var rFomOdrVal = infChart.drawingUtils.common.tradingUtils.getRawValue(drawingObject.stockChartId, fomOdrVal, false);
                        if (orderValue > 0 && orderValue !== rFomOdrVal) {
                            // order.orderValue = orderValue;
                            var qty = infChart.drawingUtils.common.tradingUtils.getOrderQtyFromValue(order.price, orderValue, tradingOptions);
                            order.qty = qty;
                            var formattedQty = infChart.drawingUtils.common.tradingUtils.formatOrderQuantity(drawingObject.stockChartId, order);
                            var rQty = infChart.drawingUtils.common.tradingUtils.getRawValue(drawingObject.stockChartId, formattedQty, false);
                            order.qty = rQty;
                            drawingObject.additionalDrawings["order"].find("[data-rel='qty']").val(formattedQty);
                            infChart.drawingUtils.common.tradingUtils.onOrderChanges.call(drawingObject, order.orderId, {'qty': formattedQty});
                        }
                    }
                }
                infChart.drawingUtils.common.tradingUtils.validateBuySellForm(container, drawingObject, ann.options.order);
            }
        });
    },
    bindQtyInputEvents: function (drawingObject, ann, container, tradingOptions) {
        container.find("[data-rel='qty']").on('blur', function () {
            var qty = $(this).val();
            var isLessThanFillQty = false;
            var order = ann.options.order;
            if (qty !== "") {
                if (!isNaN(qty)) {
                    var rawQuantity = infChart.drawingUtils.common.tradingUtils.getRawValue(drawingObject.stockChartId, qty, false);
                    if (rawQuantity > 0 && rawQuantity !== order.qty) {
                        if (order.hasOwnProperty('fillQty') && order.fillQty > rawQuantity) {
                            isLessThanFillQty = true;
                            // $(this).val(infChart.drawingUtils.common.tradingUtils.formatOrderQuantity(drawingObject.stockChartId, order));
                            trader.showMessage('Invalid Quantity', 'Size entered is less than Filled Size.', 3000, 400);
                        } else {
                            //order.qty = val;
                            var hasMinimumOrderQuantity = infChart.drawingUtils.common.tradingUtils.hasMinimumOrderQuantity(drawingObject.stockChartId, rawQuantity, order);
                            if (hasMinimumOrderQuantity.isValidQty) {
                                order.qty = rawQuantity;
                                var formattedQty = infChart.drawingUtils.common.tradingUtils.formatOrderQuantity(drawingObject.stockChartId, order);
                                rawQuantity = infChart.drawingUtils.common.tradingUtils.getRawValue(drawingObject.stockChartId, formattedQty, false);
                                infChart.drawingUtils.common.tradingUtils.updateOrderDrawing.call(drawingObject, {'qty': rawQuantity}, false, order);
                                //get value with fee - CCA-3938
                                var orderValue = infChart.drawingUtils.common.tradingUtils.getOrderValueFromOrder(order.price, rawQuantity, order.side, tradingOptions);
                                container.find("[data-rel='value']").val(infChart.drawingUtils.common.tradingUtils.formatOrderValue(drawingObject.stockChartId, order.price, orderValue));

                                infChart.drawingUtils.common.tradingUtils.onOrderChanges.call(drawingObject, order.orderId, {'qty': rawQuantity});
                            }
                        }
                        // container.find("[data-rel='value']").val(infChart.drawingUtils.common.tradingUtils.formatOrderValue(drawingObject.stockChartId, order));
                        var takeProfitDrawing = drawingObject.additionalDrawings[infChart.drawingUtils.common.tradingUtils.constants.takeProfit];
                        var stopLossDrawing = drawingObject.additionalDrawings[infChart.drawingUtils.common.tradingUtils.constants.stopLoss];

                        if (takeProfitDrawing) {
                            infChart.drawingUtils.common.tradingUtils.updateLimitValues(drawingObject.stockChartId, order, takeProfitDrawing);
                        }
                        if (stopLossDrawing) {
                            infChart.drawingUtils.common.tradingUtils.updateLimitValues(drawingObject.stockChartId, order, stopLossDrawing);
                        }
                    }
                }
            }
            $(this).val(infChart.drawingUtils.common.tradingUtils.formatOrderQuantity(drawingObject.stockChartId, order));
            infChart.drawingUtils.common.tradingUtils.validateBuySellForm(container, drawingObject, order, isLessThanFillQty);
        });

        container.find("[data-rel='qty']").on('click', function () {
            $(this).val(infChart.drawingUtils.common.tradingUtils.getRawValue(drawingObject.stockChartId, $(this).val(), true));
        });

        container.find("[data-rel='qty']").on('keyup', function (event) {
            if (event.keyCode === 13) {//enter button click event
                container.find("[data-rel='qty']").trigger('blur');
            } else {
                var val = $(this).val();
                var order = ann.options.order;
                if (val !== "") {
                    if (!isNaN(val)) {
                        var hasMinimumOrderQuantity = infChart.drawingUtils.common.tradingUtils.hasMinimumOrderQuantity(drawingObject.stockChartId, val, order);
                        if (hasMinimumOrderQuantity.isValidQty) {
                            var rawQuantity = infChart.drawingUtils.common.tradingUtils.getRawValue(drawingObject.stockChartId, val, false);
                            if (rawQuantity > 0 && rawQuantity !== order.qty) {
                                var orderValue = infChart.drawingUtils.common.tradingUtils.getOrderValueFromOrder(order.price, val, order.side, tradingOptions);
                                container.find("[data-rel='value']").val(infChart.drawingUtils.common.tradingUtils.formatOrderValue(drawingObject.stockChartId, order.price, orderValue));
                                infChart.drawingUtils.common.tradingUtils.onOrderChanges.call(drawingObject, ann.options.order.orderId, {'qty': val});
                                $(this).val(val).focus();
                            }
                        }
                    }
                }
                infChart.drawingUtils.common.tradingUtils.validateBuySellForm(container, drawingObject, ann.options.order);
            }
        });
    },
    bindPriceInputEvents: function (drawingObject, ann, container, trader) {
        container.find("[data-rel='price']").on('keyup', function (event) {
            //just check enter button then move then update the drawing.
            if (event.keyCode === 13) {
                //enter button click event
                container.find("[data-rel='price']").trigger('blur');
            }
            infChart.drawingUtils.common.tradingUtils.validateBuySellForm(container, drawingObject, ann.options.order);
        });

        container.find("[data-rel='price']").on('blur', function () {
            var val = parseFloat($(this).val().replace(/\,/g, ''));
            if (val !== "") {
                if (!isNaN(val) && val > 0) {
                    var formattedOrderPrice = parseFloat(infChart.drawingUtils.common.tradingUtils.formatOrderPrice(drawingObject.stockChartId, ann.options.order).replace(/\,/g, ''));
                    if (formattedOrderPrice !== val) {
                        var price = parseFloat(val);
                        infChart.drawingUtils.common.tradingUtils.updateOrderDrawing.call(drawingObject, {'price': price}, false, ann.options.order);
                        infChart.drawingUtils.common.tradingUtils.onOrderChanges.call(drawingObject, ann.options.order.orderId, {'price': price});
                        trader.setYAxisExtremes(drawingObject);
                    }
                }
            }
            $(this).val(infChart.drawingUtils.common.tradingUtils.formatOrderPrice(drawingObject.stockChartId, ann.options.order));
            infChart.drawingUtils.common.tradingUtils.validateBuySellForm(container, drawingObject, ann.options.order);
        });

        container.find("[data-rel='price']").on('click', function () {
            $(this).val(infChart.drawingUtils.common.tradingUtils.getRawValue(drawingObject.stockChartId, $(this).val(), true));
        });
    },
    /**
     * bind limit order window events
     * should invoke with drawing object
     */
    bindLimitOrderSettingsEvents: function () {
        var drawingObject = this;
        var ann = drawingObject.annotation;
        var chart = ann.chart;
        //var order = ann.options.order;
        var yAxis = chart.yAxis[ann.options.yAxis];
        var trader = infChart.drawingUtils.common.tradingUtils.getTraderInstance(drawingObject.stockChartId);

        var container = drawingObject.additionalDrawings["order"];
        container.find(".modal-dialog").draggable({
            handle: ".modal-body"
        });

        container.find("[data-inf-action='" + infChart.drawingUtils.common.tradingUtils.constants.stopLoss + "']").on('click', function () {
            // $(this).hide();
            var yInPixels = yAxis.toPixels(ann.options.yValue) + (ann.options.subType ? 1 : -1) * container.outerHeight(true) / 2;
            var stopLoss = infChart.drawingUtils.common.getBaseYValue.call(drawingObject, yAxis.toValue(yInPixels));
            infChart.drawingUtils.common.tradingUtils.onStopLoss(drawingObject, stopLoss);
            infChart.drawingUtils.common.tradingUtils.updateOrderLimitValues.call(drawingObject, true, ann.options.order, stopLoss);
            ann.options.amend = true;
            if (drawingObject.additionalDrawings[infChart.drawingUtils.common.tradingUtils.constants.takeProfit]) {
                container.find("span[data-inf='riskReward']").parent('label').show();
                infChart.drawingUtils.common.tradingUtils.updateRiskReward(drawingObject);
            } else {
                container.find("span[data-inf='riskReward']").parent('label').hide();
            }

            container.find("[data-rel=stopPrice]").val(stopLoss);
            container.find("[data-rel=stopPriceCtrl]").show();
            container.find("[data-inf-action=cancelStopLoss]").show();
            container.find("[data-rel=valueCtrl]").removeClass('wide-item');
            $(this).hide();
        });

        container.find("[data-inf-action='" + infChart.drawingUtils.common.tradingUtils.constants.takeProfit + "']").on('click', function () {
            $(this).hide();
            var yInPixels = yAxis.toPixels(ann.options.yValue) + (ann.options.subType ? -1 : 1) * container.outerHeight(true) / 2;
            var takeProfit = infChart.drawingUtils.common.getBaseYValue.call(drawingObject, yAxis.toValue(yInPixels));
            infChart.drawingUtils.common.tradingUtils.onTakeProfit(drawingObject, takeProfit);
            infChart.drawingUtils.common.tradingUtils.updateOrderLimitValues.call(drawingObject, false, ann.options.order, takeProfit);
            ann.options.amend = true;
            if (drawingObject.additionalDrawings[infChart.drawingUtils.common.tradingUtils.constants.stopLoss]) {
                container.find("span[data-inf='riskReward']").parent('label').show();
                infChart.drawingUtils.common.tradingUtils.updateRiskReward(drawingObject);
            } else {
                container.find("span[data-inf='riskReward']").parent('label').hide();
            }
        });

        container.find("[data-inf-action='close']").one('click', function () {
            var chartId = drawingObject.stockChartId;
            var order = ann.options.order;
            var chart = ann.chart;
            var dsc = drawingObject.drawingSettingsContainer;
            var isAmend = ann.options.amend;
            var oriOrder = ann.options.originalOrder;

            infChart.drawingUtils.common.tradingUtils.removeDrawing(drawingObject);

            var newDrawingObject = infChart.drawingUtils.common.tradingUtils.addOrderDrawing(order, chart, dsc, false, isAmend, oriOrder);
            infChart.drawingUtils.common.tradingUtils.selectAndBindResize.call(newDrawingObject, (newDrawingObject.annotation.chart.plotWidth * 0.9));
            infChart.drawingUtils.common.tradingUtils.getTraderInstance(chartId).updateOrderDrawing(order.orderId, newDrawingObject);
        });

        container.find("[data-inf-action='cancelStopLoss']").on('click', function () {
            var stopLossDrawing = drawingObject.additionalDrawings[infChart.drawingUtils.common.tradingUtils.constants.stopLoss];
            stopLossDrawing.additionalDrawings['order'].find("[data-inf-action='close']").trigger('click');
        });

        infChart.drawingUtils.common.tradingUtils.bindPriceInputEvents(drawingObject, ann, container, trader);

        infChart.drawingUtils.common.tradingUtils.bindQtyInputEvents(drawingObject, ann, container, trader.tradingOptions);

        infChart.drawingUtils.common.tradingUtils.bindValueInputEvents(drawingObject, ann, container, trader.tradingOptions);

        container.find("[data-rel='stopPrice']").on('blur', function () {
            $(this).val(infChart.drawingUtils.common.tradingUtils.formatOrderLimitPrice(drawingObject.stockChartId, ann.options.order.stopLoss, ann.options.order));
        });

        container.find("[data-rel='stopPrice']").on('click', function () {
            $(this).val(ann.options.order.stopLoss);
        });

        container.find("[data-rel='stopPrice']").on('keyup', function () {
            var val = $(this).val();
            if (!isNaN(val)) {
                var stopLossPrice = parseFloat(val);
                if (stopLossPrice > 0) {
                    var st = drawingObject.additionalDrawings[infChart.drawingUtils.common.tradingUtils.constants.stopLoss];
                    st.yValue = stopLossPrice;
                    infChart.drawingUtils.common.tradingUtils.updateLimitValues(drawingObject.stockChartId, ann.options.order, st);
                    infChart.drawingUtils.common.tradingUtils.updateRiskReward(drawingObject);
                    infChart.drawingUtils.common.tradingUtils.updateOrderLimitValues.call(drawingObject, false, ann.options.order, stopLossPrice);
                    st.scaleDrawing.call(st);
                } else {
                    trader.showMessage('Invalid Limit Value', 'Please enter valid Limit Value!', 3000, 400);
                }
            } else {
                trader.showMessage('Invalid Limit Value', 'Please enter valid Limit Value!', 3000, 400);
            }
        });

        /*container.find("[data-rel='tif']").on('change', function () {
         var val = $(this).val();
         infChart.drawingUtils.common.tradingUtils.onOrderChanges.call(drawingObject, ann.options.order.orderId, {tif: val});
         });*/

        container.find("[data-inf-action='placeOrder']").on('click', function () {
            // var qty = ann.options.order.qty;
            // if (qty > 0) {
                //var tif = infChart.constants.chartTrading.tifTypes.GTC;
                ///*= parseInt(container.find("[data-rel='tif']").val(), 10);*/
                ////var side = ann.options.subType ? infChart.constants.chartTrading.orderSide.buy : infChart.constants.chartTrading.orderSide.sell;
                //
                //var takeProfit = -1, stopLoss = -1;
                //var takeProfitDrawing = drawingObject.additionalDrawings[infChart.drawingUtils.common.tradingUtils.constants.takeProfit];
                //var stopLossDrawing = drawingObject.additionalDrawings[infChart.drawingUtils.common.tradingUtils.constants.stopLoss];
                //if (takeProfitDrawing) {
                //    takeProfit = takeProfitDrawing.yValue;
                //}
                //if (stopLossDrawing) {
                //    stopLoss = stopLossDrawing.yValue;
                //}
                infChart.drawingUtils.common.tradingUtils.placeOrder(drawingObject.stockChartId, ann.options.order);
            // } else {
                //trader.showMessage('Invalid Quantity', 'Please enter valid Order Quantity!', 3000, 400);
            // }
        });

        container.find("[data-inf-action='cancelOrder']").on('click', function () {
            infChart.drawingUtils.common.tradingUtils.cancelOrder(drawingObject.stockChartId, ann.options.order);
        });

        container.find("[data-inf-action='switchSide']").on('click', function () {
            drawingObject.subType = !drawingObject.subType;
            ann.options.subType = !ann.options.subType;

            var qty, holdingsQty = trader.getHoldingsQty(ann.options.subType);
            if ((holdingsQty < 0 && ann.options.subType) || (holdingsQty > 0 && !ann.options.subType)) {
                qty = holdingsQty;
            } else {
                qty = 100;
            }

            ann.options.order.qty = qty;
            ann.options.order.side = ann.options.subType ? infChart.constants.chartTrading.orderSide.buy : infChart.constants.chartTrading.orderSide.sell;

            infChart.drawingUtils.common.tradingUtils.onOrderChanges.call(drawingObject, ann.options.order.orderId, {
                side: ann.options.order.side,
                qty: ann.options.order.qty
            });

            ann.update({
                shape: {
                    params: {
                        fill: (ann.options.subType ? infChart.constants.chartTrading.theme.buyColor : infChart.constants.chartTrading.theme.sellColor),
                        stroke: (ann.options.subType ? infChart.constants.chartTrading.theme.buyColor : infChart.constants.chartTrading.theme.sellColor)
                    }
                }
            });

            var takeProfitDrawing = drawingObject.additionalDrawings[infChart.drawingUtils.common.tradingUtils.constants.takeProfit];
            var stopLossDrawing = drawingObject.additionalDrawings[infChart.drawingUtils.common.tradingUtils.constants.stopLoss];

            var slY, tpY;
            if (takeProfitDrawing) {
                tpY = takeProfitDrawing.yValue;
                if (stopLossDrawing) {
                    slY = stopLossDrawing.yValue;

                    /**
                     * remove both drawings
                     */
                    takeProfitDrawing.additionalDrawings['order'].find('[data-inf-action="close"]').trigger('click');
                    stopLossDrawing.additionalDrawings['order'].find('[data-inf-action="close"]').trigger('click');

                    /**
                     * add stop loss
                     */
                    container.find("[data-inf-action='" + infChart.drawingUtils.common.tradingUtils.constants.stopLoss + "']").hide();
                    infChart.drawingUtils.common.tradingUtils.onStopLoss(drawingObject, tpY);
                    infChart.drawingUtils.common.tradingUtils.updateOrderLimitValues.call(drawingObject, true, ann.options.order, tpY);

                    /**
                     * add take profit
                     */
                    container.find("[data-inf-action='" + infChart.drawingUtils.common.tradingUtils.constants.takeProfit + "']").hide();
                    infChart.drawingUtils.common.tradingUtils.onTakeProfit(drawingObject, slY);
                    infChart.drawingUtils.common.tradingUtils.updateOrderLimitValues.call(drawingObject, false, ann.options.order, slY);

                    infChart.drawingUtils.common.tradingUtils.updateRiskReward(drawingObject);
                } else {
                    /**
                     * remove take profit drawing
                     */
                    takeProfitDrawing.additionalDrawings['order'].find('[data-inf-action="close"]').trigger('click');

                    /**
                     * add stop loss drawing with same limit
                     */
                    container.find("[data-inf-action='" + infChart.drawingUtils.common.tradingUtils.constants.stopLoss + "']").hide();
                    infChart.drawingUtils.common.tradingUtils.onStopLoss(drawingObject, tpY);
                    infChart.drawingUtils.common.tradingUtils.updateOrderLimitValues.call(drawingObject, true, ann.options.order, tpY);
                }
            } else {
                if (stopLossDrawing) {
                    slY = stopLossDrawing.yValue;

                    /**
                     * remove stop loss drawing
                     */
                    stopLossDrawing.additionalDrawings['order'].find('[data-inf-action="close"]').trigger('click');

                    /**
                     * add take profit drawing with same limit
                     */
                    container.find("[data-inf-action='" + infChart.drawingUtils.common.tradingUtils.constants.takeProfit + "']").hide();
                    infChart.drawingUtils.common.tradingUtils.onTakeProfit(drawingObject, slY);
                    infChart.drawingUtils.common.tradingUtils.updateOrderLimitValues.call(drawingObject, false, ann.options.order, slY);
                }
            }

            infChart.drawingUtils.common.tradingUtils.initializeLimitOrder.call(drawingObject, ann.options.order, ann.options.subType);
        });

        var yMax = yAxis.toPixels(yAxis.max),
            yMin = yAxis.toPixels(yAxis.min);
        container.draggable({
            axis: "y",
            containment: [0, yMax, 0, yMin],
            start: function (event) {
                ann.events.storeAnnotation(event, ann, chart);
            },
            stop: function (event) {
                ann.events.releaseAnnotation(event, chart);
            }
        });
    },
    /**
     * validate buy sell from
     * @param container
     * @param drawingObject
     * @param order
     * @param isLessThanFillQty
     */
    validateBuySellForm: function (container, drawingObject, order, isLessThanFillQty) {
        var valueObj = container.find("[data-rel='value']");
        var priceObj = container.find("[data-rel='price']");
        var qtyObj = container.find("[data-rel='qty']");
        var buttonObj = container.find("[data-inf-action='placeOrder']");
        var exceedElement = container.find('[data-rel="warningMsg"]');
        var qtyVal = infChart.drawingUtils.common.tradingUtils.getQuantity.call(drawingObject, infChart.drawingUtils.common.tradingUtils.getRawValue(drawingObject.stockChartId, qtyObj.val(), false));
        var hasMinimumOrderQuantity = infChart.drawingUtils.common.tradingUtils.hasMinimumOrderQuantity(drawingObject.stockChartId, qtyVal, order);
        
        var trader = infChart.drawingUtils.common.tradingUtils.getTraderInstance(drawingObject.stockChartId);
        //duplicate order object //CCA-3532
        var tempOrder = JSON.parse(JSON.stringify(order));
        tempOrder.qty = qtyVal;

        var exceeded = trader.isOrderExceeded(tempOrder);
        var errorFound = false;
        var disableTransmit = infChart.drawingUtils.common.tradingUtils.isSentOrder(tempOrder) && !drawingObject.annotation.options.amend;

        //check value input
        if (valueObj.val() !== "") {
            if (!isNaN(parseFloat(valueObj.val()))) {
                var valNum = parseFloat(valueObj.val().replace(/\,/g, ''));
                if (valNum > 0 || (qtyVal === 0 && hasMinimumOrderQuantity.minQty === 0)) {
                    valueObj.parent().removeClass('has-error');
                } else {
                    valueObj.parent().addClass('has-error');
                    errorFound = true;
                }
            } else {
                valueObj.parent().addClass('has-error');
                errorFound = true;
            }
        } else {
            valueObj.parent().addClass('has-error');
            errorFound = true;
        }

        //check price input
        if (priceObj.val() !== "") {
            if (!isNaN(parseFloat(priceObj.val()))) {
                var priceNum = parseFloat(priceObj.val().replace(/\,/g, ''));
                if (priceNum > 0) {
                    priceObj.parent().removeClass('has-error');
                } else {
                    priceObj.parent().addClass('has-error');
                    errorFound = true;
                }
            } else {
                priceObj.parent().addClass('has-error');
                errorFound = true;
            }
        } else {
            priceObj.parent().addClass('has-error');
            errorFound = true;
        }

        //check qty input
        if (qtyVal !== "") {
            if (!isNaN(qtyVal)) {
                if (qtyVal >= hasMinimumOrderQuantity.minQty) {
                    qtyObj.parent().removeClass('has-error');
                } else {
                    qtyObj.parent().addClass('has-error');
                    errorFound = true;
                }
            } else {
                qtyObj.parent().addClass('has-error');
                errorFound = true;
            }
        } else {
            qtyObj.parent().addClass('has-error');
            errorFound = true;
        }

        //hide and show exceed order messages
        if (exceeded) {
            if (!order.inValidOrder) {
                order.inValidOrder = true;
            }
            exceedElement.show();
            if (order.side === infChart.constants.chartTrading.orderSide.buy) {
                exceedElement.find('[data-rel="sell"]').hide();
                exceedElement.find('[data-rel="buy"]').show();
            } else if (order.side === infChart.constants.chartTrading.orderSide.sell) {
                exceedElement.find('[data-rel="sell"]').show();
                exceedElement.find('[data-rel="buy"]').hide();
            }
            exceedElement.find('[data-rel="qtyWarMsg"]').hide();
        } else {
            if (order.inValidOrder) {
                order.inValidOrder = false;
                exceedElement.hide();
            }
        }

        //show minimum quantity warning message
        if (!hasMinimumOrderQuantity.isValidQty) {
            if (!$(exceedElement).is(":visible")) {
                exceedElement.show();
                exceedElement.find('[data-rel="sell"]').hide();
                exceedElement.find('[data-rel="buy"]').hide();
            }
            var currencies = infChart.drawingUtils.common.tradingUtils.getCurrencies(drawingObject.stockChartId, order.symbol);
            var qtyWarMsgElement = exceedElement.find('[data-rel="qtyWarMsg"]');
            var warMsg = 'Minimum ' + hasMinimumOrderQuantity.minQty + ' ' + currencies.primary + ' required.';
            qtyWarMsgElement.text(warMsg);
            qtyWarMsgElement.show();
        } else {
            exceedElement.find('[data-rel="qtyWarMsg"]').hide();
        }

        //drawing object height change so need to scale CCA-3541
        infChart.drawingUtils.common.tradingUtils.positionLimitOrderWindow.call(drawingObject);

        //enable and disable buy/sell button
        if (errorFound || exceeded || disableTransmit || isLessThanFillQty) {
            buttonObj.attr('disabled', true);
            buttonObj.addClass('disabled');
        } else {
            buttonObj.attr('disabled', false);
            buttonObj.removeClass('disabled');
        }
    },
    /**
     * get stop loss or take profit window html
     * @returns {string}
     */
    getLimitWindow: function () {
        return infChart.structureManager.trading.getOrderTicketLimitHTML();
    },
    /**
     * bind stop loss or take profit window events
     * @param drawingObject
     * @param parentDrawing
     */
    bindLimitWindowSettingsEvents: function (drawingObject, parentDrawing) {
        var ann = drawingObject.annotation;
        var chart = drawingObject.chart;
        var subType = drawingObject.subType;

        var container = drawingObject.additionalDrawings["order"],
            mainOrderWindow = parentDrawing.additionalDrawings["order"];

        container.find('[data-inf-action="close"]').on('click', function () {
            var isStopLoss = subType === infChart.drawingUtils.common.tradingUtils.constants.stopLoss;
            infChart.drawingUtils.common.tradingUtils.updateOrderLimitValues.call(drawingObject, isStopLoss, parentDrawing.annotation.options.order);

            delete parentDrawing.additionalDrawings[subType];
            infChart.drawingUtils.common.tradingUtils.removeDrawing(drawingObject);

            if (isStopLoss) {
                mainOrderWindow.find("[data-inf-action='cancelStopLoss']").hide();
                mainOrderWindow.find("[data-rel='stopPriceCtrl']").hide();
                mainOrderWindow.find("[data-rel='valueCtrl']").addClass('wide-item');
            }

            mainOrderWindow.find("[data-inf-action='" + subType + "']").show();
            mainOrderWindow.find("span[data-inf='riskReward']").parent('label').hide();
        });

        var top = $(chart.container).offset().top,
            bottom,
            mainOrderWindowTop = mainOrderWindow.offset().top;
        if (subType === infChart.drawingUtils.common.tradingUtils.constants.stopLoss && parentDrawing.subType) {
            top = mainOrderWindowTop + mainOrderWindow.outerHeight(true);
            bottom = top + chart.plotHeight;
        } else {
            bottom = mainOrderWindowTop;
        }

        container.draggable({
            axis: "y",
            containment: [0, top, 0, bottom],
            start: function (event) {
                ann.events.storeAnnotation(event, ann, chart);
            },
            stop: function (event) {
                ann.events.releaseAnnotation(event, chart);
            }
        });
    },
    /**
     * move stop loss and take profit window if the main window exceeds the limits
     * @param drawingObj
     * @param dependentDrawingObj
     */
    moveDependentDrawing: function (drawingObj, dependentDrawingObj) {
        var chart = drawingObj.annotation.chart,
            yAxis = chart.yAxis[drawingObj.annotation.options.yAxis],
            orderTicket = drawingObj.additionalDrawings['order'],
            below;

        if (drawingObj.subType) {
            below = dependentDrawingObj.subType === infChart.drawingUtils.common.tradingUtils.constants.stopLoss;
        } else {
            below = dependentDrawingObj.subType !== infChart.drawingUtils.common.tradingUtils.constants.stopLoss;
        }

        var limitValue = drawingObj.yValue,
            dependentValue = dependentDrawingObj.yValue,
            adjustment = orderTicket.outerHeight(true) / 2,
            marginValue;
        if (below) {
            if (dependentValue > limitValue) {
                dependentDrawingObj.yValue = limitValue;
                dependentDrawingObj.scaleDrawing.call(dependentDrawingObj);
            } else {
                marginValue = yAxis.toValue(yAxis.toPixels(limitValue) + adjustment);
                if (dependentValue > marginValue) {
                    dependentDrawingObj.scaleDrawing.call(dependentDrawingObj);
                } else {
                    infChart.drawingUtils.common.tradingUtils.positionBottomLimitWindow.call(dependentDrawingObj);
                }
            }
        } else {
            if (dependentValue < limitValue) {
                dependentDrawingObj.yValue = limitValue;
                dependentDrawingObj.scaleDrawing.call(dependentDrawingObj);
            } else {
                marginValue = yAxis.toValue(yAxis.toPixels(limitValue) - adjustment);
                if (dependentValue < marginValue) {
                    dependentDrawingObj.scaleDrawing.call(dependentDrawingObj);
                } else {
                    if (dependentValue != dependentDrawingObj.annotation.options.yValue) {
                        dependentDrawingObj.scaleDrawing.call(dependentDrawingObj);
                    }
                    infChart.drawingUtils.common.tradingUtils.positionTopLimitWindow.call(dependentDrawingObj);
                }
            }
        }
    },
    /**
     * show both amend & revert buttons if there is a local order amendment in a sent order
     * this is called only if the order is a sent order
     * @param {array} labelsArray
     * @param {boolean} amend
     */
    updateControlLabelsVisibility: function (labelsArray, amend) {
        labelsArray[2].attr({
            visibility: (amend === true) ? 'visible' : 'hidden'
        });
        labelsArray[3].attr({
            visibility: (amend === true) ? 'visible' : 'hidden'
        });
    },
    /**
     * adjust x position of labels(excluding price label)
     * called when price or qty changes
     * @param {object} labelsObj
     * @param {number} index
     * @param {number} startPosition - x position to use if adjusting all labels
     */
    adjustControlLabelsPositions: function (labelsObj, index, startPosition) {
        var lastX = startPosition,
            i = index,
            len = Object.keys(labelsObj).length;
        for (i; i < len; i++) {
            if (labelsObj[i]) {
                if (i === 0) {
                    labelsObj[0].attr({
                        x: startPosition
                    });
                } else {
                    labelsObj[i].attr({
                        x: labelsObj[i - 1].x + labelsObj[i - 1].width
                    });
                }
                if (labelsObj[i].visibility !== 'hidden') {
                    lastX += labelsObj[i].width;
                }
            }
        }
        return lastX;
    },
    onLimitPriceClick: function () {
        var drawingObject = this;
        var container = drawingObject.additionalDrawings["order"];
        container.find("[data-rel='price']").focus().select();
    },
    onQtyClick: function () {
        var drawingObject = this;
        var container = drawingObject.additionalDrawings["order"];
        container.find("[data-rel='qty']").focus().select();
    },
    changeDrawingToOrderLimit: function () {
        var drawingObject = this,
            ann = drawingObject.annotation,
            chart = ann.chart,
            yAxis = chart.yAxis[ann.options.yAxis];
        order = ann.options.order;
        var orderDrawingObject = null;
        var trader = infChart.drawingUtils.common.tradingUtils.getTraderInstance(drawingObject.stockChartId);

        //check the drawing object height with chart height
        var orderTicket = infChart.drawingUtils.common.tradingUtils.getLimitOrderTicket();
        orderTicket = $(orderTicket).appendTo(drawingObject.drawingSettingsContainer);
        var orderTicketHeight = orderTicket.outerHeight(true);
        var chartHeight = yAxis.height;
        $(orderTicket).remove();

        if (chartHeight > orderTicketHeight) {
            //remove other limit order drawings
            if (drawingObject.drawingSettingsContainer.find('div[data-rel="limit-order"]').length > 0) {
                drawingObject.drawingSettingsContainer.find('div[data-rel="limit-order"]').each(function (i, container) {
                    $(container).find("[data-inf-action='close']").trigger('click');
                });
            }
            //remove market order window

            if (trader.markeOrderWindow) {
                trader.markeOrderWindow.hide();
            }

            var buy = (ann.options.subType === infChart.constants.chartTrading.orderSide.buy);
            var orderDrawingObject = infChart.tradingManager.createTradingDrawing(chart, {
                "shape": "limitOrder",
                "xValue": null,
                "x": chart.plotLeft,
                "yValue": drawingObject.yValue,
                "width": chart.plotWidth,
                "borderColor": buy ? infChart.constants.chartTrading.theme.tradingLine.buyColor : infChart.constants.chartTrading.theme.tradingLine.sellColor,
                "fillColor": buy ? infChart.constants.chartTrading.theme.tradingLine.buyColor : infChart.constants.chartTrading.theme.tradingLine.sellColor,
                "strokeWidth": 2,
                "dashStyle": "solid",
                isRealTimeTranslation: true,
                "clickCords": {
                    "x": chart.plotLeft,
                    "y": yAxis.toPixels(drawingObject.yValue)
                },
                amend: ann.options.amend,
                subType: buy,
                order: ann.options.order,
                originalOrder: ann.options.originalOrder
            });

            var orderWindow = orderDrawingObject.additionalDrawings['order'];
            orderWindow.find("[data-rel='qty']").val(infChart.drawingUtils.common.tradingUtils.formatOrderQuantity(drawingObject.stockChartId, order));
            //get value with fee - CCA-3938
            var orderValue = infChart.drawingUtils.common.tradingUtils.getOrderValueFromOrder(order.price, order.qty, order.side, trader.tradingOptions);
            orderWindow.find("[data-rel='value']").val(infChart.drawingUtils.common.tradingUtils.formatOrderValue(drawingObject.stockChartId, order.price, orderValue));

            if (order.stopLoss > 0) {
                infChart.drawingUtils.common.tradingUtils.onStopLoss(orderDrawingObject, order.stopLoss);
                orderWindow.find("[data-inf-action='" + infChart.drawingUtils.common.tradingUtils.constants.stopLoss + "']").hide();
            }
            if (order.takeProfit > 0) {
                infChart.drawingUtils.common.tradingUtils.onTakeProfit(orderDrawingObject, order.takeProfit);
                orderWindow.find("[data-inf-action='" + infChart.drawingUtils.common.tradingUtils.constants.takeProfit + "']").hide();
            }
            if (order.stopLoss > 0 && order.takeProfit > 0) {
                orderWindow.find("span[data-inf='riskReward']").parent('label').show();
                infChart.drawingUtils.common.tradingUtils.updateRiskReward(orderDrawingObject);
            } else {
                orderWindow.find("span[data-inf='riskReward']").parent('label').hide();
            }
            infChart.drawingUtils.common.tradingUtils.validateBuySellForm(orderWindow, drawingObject, order);

            infChart.drawingUtils.common.tradingUtils.getTraderInstance(drawingObject.stockChartId).updateOrderDrawing(order.orderId, orderDrawingObject);

            infChart.drawingUtils.common.tradingUtils.selectAndBindResize.call(orderDrawingObject, (orderDrawingObject.annotation.chart.plotWidth * 0.9));

            infChart.drawingUtils.common.tradingUtils.removeDrawing(drawingObject);
        } else {
            trader.showMessage('Display Error', 'Cannot open Order Amend view.', 3000);
        }

        return orderDrawingObject;
    },
    selectAndBindResize: function (x, y, selectPointStyles) {
        var ann = this.annotation;

        if (ann.selectionMarker) {

        } else {
            /*if (!w) {
             w = 8;
             }
             if (!h) {
             h = 8;
             }*/
            if (!x) {
                x = ann.options.clickCords.x;
            }
            if (!y) {
                y = 0;
            }

            if (!selectPointStyles) {
                selectPointStyles = {stroke: ann.options.shape.params.stroke};
            }

            ann.selectionMarker = [];
            infChart.drawingUtils.common.addSelectionMarker.call(this, ann, x, y, selectPointStyles);
        }

        //infChart.drawingUtils.common.tradingUtils.getTraderInstance(this.stockChartId).onOrderSelect(this);
    },
    isStopLossOrder: function(order){
        return order.type === infChart.constants.chartTrading.orderTypes.stopLoss;
    },
    isSubOrder: function(order){
        var status = false;
        switch(order.type){
            case infChart.constants.chartTrading.orderTypes.stopLoss:
            case infChart.constants.chartTrading.orderTypes.takeProfit:
                status = true;
                break;
            default:
                break;
        }
        return status;
    },
    getSubOrderLabel: function(order) {
        return (infChart.drawingUtils.common.tradingUtils.isStopLossOrder(order) ? 'SL' : 'TP') + (order.subOrderIndex && order.subOrderIndex > 1 ? order.subOrderIndex : '');
    },
    getSubOrderTypeLabelFillColor: function(order, tradeLineTheme) {
        return infChart.drawingUtils.common.tradingUtils.isStopLossOrder(order) ? tradeLineTheme.label.slFillColor : tradeLineTheme.label.tpFillColor;
    },
    getOrderTicketTitle: function (order) {
        var titleObject = {};

        switch (order.type) {
            case  infChart.constants.chartTrading.orderTypes.stopLoss:
                titleObject.title = "Stop Loss";
                titleObject.titleClass = "label-sl";
                break;
            case  infChart.constants.chartTrading.orderTypes.takeProfit:
                titleObject.title = "Take Profit";
                titleObject.titleClass = "label-tp";
                break;
            default:
                break;
        }

        return titleObject;
    },
    isAlgoOrder: function (order) {
        var status = false;
        switch (order.type) {
            case infChart.constants.chartTrading.orderTypes.AlgoTrailing:
            case infChart.constants.chartTrading.orderTypes.AlgoTrend:
                status = true;
                break;
            default:
                break;
        }
        return status;
    },
    isAlgoTrendOrder: function (order) {
        return order.type === infChart.constants.chartTrading.orderTypes.AlgoTrend;
    },
    addAlgoLimits: function () {
        var drawing = this,
            order = drawing.annotation.options.order,
            algo = order.algo;
        if (infChart.drawingUtils.common.tradingUtils.isAlgoTrendOrder(order)) {
            if (algo.l1 && algo.l2 && algo.t1 && algo.t2) {
                var options = {
                    shape: 'algoLine',
                    parentId: drawing.drawingId,
                    order: {
                        'orderId': order.orderId,
                        'side': order.side,
                        'algo': {
                            'type': algo.type,
                            'l1': algo.l1,
                            'l2': algo.l2,
                            't1': algo.t1,
                            't2': algo.t2
                        }
                    }
                };
                drawing.additionalDrawings['algo'] = infChart.tradingManager.createTradingDrawing(drawing.annotation.chart, options);
            }
        }
    },
    //scaleAlgoLimits: function () {
    //    var drawing = this, algoDrawing = drawing.additionalDrawings['algo'];
    //    if (algoDrawing) {
    //        algoDrawing.scale();
    //    }
    //},
    updateAlgoLimits: function () {
        var drawing = this,
            order = drawing.annotation.options.order,
            algo = order.algo,
            algoDrawing = drawing.additionalDrawings['algo'];
        if (infChart.drawingUtils.common.tradingUtils.isAlgoTrendOrder(order)) {
            if (algo.l1 && algo.l2 && algo.t1 && algo.t2) {
                algoDrawing.annotation.update({
                    xValue: algo.t1,
                    xValueEnd: algo.t2
                });
                algoDrawing.yValue = algo.l1;
                algoDrawing.yValueEnd = algo.l2;
                algoDrawing.scaleDrawing();
                //algoDrawing.scale();
                //algoDrawing.selectAndBindResize();
            }
        }
    },
    removeAlgoLimits: function () {
        var drawing = this,
            algoDrawing = drawing.additionalDrawings['algo'];
        if (algoDrawing) {
            infChart.drawingUtils.common.tradingUtils.removeDrawing(algoDrawing);
        }
    },
    onAlgoOrderChanges: function () {
        var drawing = this,
            options = drawing.annotation.options;
        var parentDrawing = infChart.drawingsManager.getDrawingObject(drawing.stockChartId, options.parentId),
            order = parentDrawing.annotation.options.order;
        if (parentDrawing && infChart.drawingUtils.common.tradingUtils.isAlgoTrendOrder(order)) {
            //updating parent order algo properties
            order.algo.t1 = Math.round(options.xValue);
            order.algo.t2 = Math.round(options.xValueEnd);
            order.algo.l1 = options.yValue;
            order.algo.l2 = options.yValueEnd;
            var trader = infChart.drawingUtils.common.tradingUtils.getTraderInstance(drawing.stockChartId);
            var changes = trader.getChangesOnAlgoOrderUpdates(order);
            order.algo.l1 = drawing.yValue;
            order.algo.l2 = drawing.yValueEnd; //price has to be the actual price always
            //updating only price
            infChart.drawingUtils.common.tradingUtils.updateOrderDrawing.call(parentDrawing, {
                'price': changes.price
            }, false, order);
            infChart.drawingsManager.setYExtremesOnExternalChanges(drawing.stockChartId, parentDrawing.annotation);
            infChart.drawingUtils.common.tradingUtils.onOrderChanges.call(parentDrawing, options.orderId, changes);
        }
    },
    getTraderInstance: function (chartId) {
        return infChart.tradingManager.getTrader(chartId);
    }
};

/**
 * represents an order
 * order data are stored in options.order
 * by clicking on qty label drawing is changed to limit order
 * if order id present it is an amendable order, otherwise a new order {@link infChart.drawingUtils.common.tradingUtils.isSentOrder}
 * @type {{getOptions: Function, getConfig: Function, step: Function, stop: Function, scale: Function, additionalDrawings: Function, selectAndBindResize: Function, translate: Function, destroy: Function, updateSettings: Function, getSettingsPopup: Function, bindSettingsEvents: Function}}
 */
// infChart.drawingUtils.tradingLine = {
//     getOptions: function (properties) {
//         var options = {
//             xValue: properties.xValue,
//             x: properties.x,
//             yValue: properties.yValue,
//             subType: properties.subType,
//             order: properties.order,
//             originalOrder: properties.originalOrder,
//             isDisplayOnly: false,
//             allowDragX: false,
//             allowDragY: true,
//             drawingType: infChart.constants.drawingTypes.trading,
//             cls: "order-line " + (properties.subType == infChart.constants.chartTrading.orderSide.buy ? "buy" : "sell"),
//             shape: {
//                 params: {
//                     d: ['M', 0, 0, 'L', 0, 0],
//                     dashstyle: 'solid',
//                     opacity: infChart.constants.chartTrading.theme.tradingLine.opacity,
//                     fill: (properties.subType == infChart.constants.chartTrading.orderSide.buy ? infChart.constants.chartTrading.theme.tradingLine.buyColor : infChart.constants.chartTrading.theme.tradingLine.sellColor),
//                     stroke: (properties.subType == infChart.constants.chartTrading.orderSide.buy ? infChart.constants.chartTrading.theme.tradingLine.buyColor : infChart.constants.chartTrading.theme.tradingLine.sellColor),
//                     'class': 'line',
//                     'stroke-width': 1
//                 }
//             },
//             enableLimits: !!properties.enableLimits,
//             isIdea: !!properties.isIdea
//         };

//         if (properties.width && !isNaN(properties.plotLeft)) {
//             options.shape.params.d = ['M', properties.plotLeft, 0, 'L', properties.width + properties.plotLeft, 0];
//         }

//         if (properties.clickCords) {
//             options.clickCords = properties.clickCords;
//         }

//         if (properties.isDisplayOnly) {
//             options.isDisplayOnly = properties.isDisplayOnly;
//             options.allowDragY = !properties.isDisplayOnly;
//             options.shape.params.dashstyle = 'dot';
//             options.shape.params.cursor = 'default';
//             options.shape.params['z-index'] = 1;
//         } else {
//             options.shape.params['z-index'] = 10;
//         }

//         if (infChart.drawingUtils.common.tradingUtils.isAlgoTrendOrder(properties.order)) {
//             options.allowDragY = false;
//             options.shape.params.dashstyle = 'dot';
//         }

//         if (infChart.drawingUtils.common.tradingUtils.isSubOrder(properties.order)) {
//             if (!options.isIdea && !infChart.drawingUtils.common.tradingUtils.isSentOrder(properties.order)) {
//                 options.isDisplayOnly = true;
//             }
//             options.shape.params.dashstyle = 'dot';
//             options.shape.params.fill = (properties.subType === infChart.constants.chartTrading.orderSide.buy ? infChart.constants.chartTrading.theme.tradingLine.buyColor : infChart.constants.chartTrading.theme.tradingLine.sellColor);
//             options.shape.params.stroke = (properties.subType === infChart.constants.chartTrading.orderSide.buy ? infChart.constants.chartTrading.theme.tradingLine.buyColor : infChart.constants.chartTrading.theme.tradingLine.sellColor);
//         }

//         options.amend = properties.amend;
//         options.adjustYAxisToViewAnnotation = true;
//         options.getExtremesFn = infChart.drawingUtils.common.tradingUtils.getLineExtremesFn;
//         options.validateTranslationFn = infChart.drawingUtils.tradingLine.validateTranslation;
//         options.isRealTimeTranslation = true;

//         return options;
//     },
//     getConfig: function () {
//     },
//     step: function () {
//     },
//     stop: function (e) {
//     },
//     scale: function () {
//         var self = this,
//             ann = self.annotation,
//             chart = ann.chart,
//             options = ann.options,
//             plotWidth = chart.plotWidth,
//             plotx = chart.plotLeft;

//         var label = self.additionalDrawings['priceLabel'];

//         /**
//          * updating the annotation, setting the x value to 75% of plot width
//          * so the line will start from the x value to the label
//          */

//         // label.attr({
//         // x: 0,
//         // zIndex: 20
//         // });

//         label.textSetter(label.text.textStr);

//         /* to fix hidden tab's label issues in flax layout, https://xinfiit.atlassian.net/browse/TTW-249 */
//         $.each(self.additionalDrawings['ctrlLabels'], function (key, value) {
//             value.textSetter(value.text.textStr);
//         });

//         var lastX = infChart.drawingUtils.common.tradingUtils.adjustControlLabelsPositions(self.additionalDrawings['ctrlLabels'], 0, label.x + label.width);

//         var line = ["M", lastX, 0, 'L', plotWidth, 0];

//         ann.update({
//             x: plotx, // since xValue is based on the actual time values on the series xAxis.min doesn't provide the exact coordinations of the plotLeft of the chart.
//             xValue: null, // set xValue as null to position annotation to into x.
//             shape: {
//                 params: {
//                     d: line
//                 }
//             }
//         });

//         if (!options.isDisplayOnly || options.allowDragY) {
//             infChart.drawingUtils.common.removeDragSupporters.call(this, this.dragSupporters);
//             infChart.drawingUtils.common.addDragSupporters.call(this, ann, chart, line,
//                 this.dragSupporters, undefined, infChart.drawingUtils.common.tradingUtils.tradingDragSupporterStyles);

//             //if (infChart.drawingUtils.common.tradingUtils.isAlgoOrder(options.order)) {
//             //infChart.drawingUtils.common.tradingUtils.scaleAlgoLimits.call(self);
//             //}
//         }
//     },
//     //getPlotX: function () {
//     //    var self = this,
//     //        ann = self.annotation,
//     //        chart = ann.chart,
//     //        options = ann.options,
//     //    //line = ann.shape.d.split(' '),
//     //        plotWidth = chart.plotWidth * 2,
//     //        xAxis = chart.xAxis[ann.options.xAxis],
//     //        yAxis = chart.yAxis[ann.options.yAxis];
//     //    var height = 0, labelWidth = 0;
//     //
//     //    var xValue = chart.plotWidth * 0.75;
//     //    $.each(self.additionalDrawings, function (key, value) {
//     //        height = (options.accumilatedHeight) ? height + value.height : (height < value.height) ? value.height : height;
//     //        labelWidth = (options.accumilatedWidth) ? labelWidth + value.width : (labelWidth < value.width) ? value.width : labelWidth;
//     //    });
//     //
//     //    height = height / 2;
//     //    var heightVal = yAxis.max - yAxis.toValue(height);
//     //
//     //    var yValue = options.price;
//     //    if (options.price > yAxis.max) {
//     //        yValue = yAxis.max - (yAxis.max - yAxis.toValue(height));
//     //    } else if (options.price < yAxis.min) {
//     //        yValue = yAxis.min + (yAxis.max - yAxis.toValue(height));
//     //    }
//     //    var currentDrawingObj = infChart.drawingsManager.getDrawingObject(options.id);
//     //    var widthCount = 0, lastWidth = 0;
//     //    $.each(chart.annotations.allItems, function (i, annotation) {
//     //        if (annotation.options.id != options.id && annotation.options.drawingType == infChart.constants.drawingTypes.trading) {
//     //            var drawingObj = infChart.drawingsManager.getDrawingObject(annotation.options.id);
//     //            var currentyValue = annotation.options.price;
//     //            if (annotation.options.price > yAxis.max) {
//     //                currentyValue = yAxis.max - (yAxis.max - yAxis.toValue(height));
//     //            } else if (annotation.options.price < yAxis.min) {
//     //                currentyValue = yAxis.min + (yAxis.max - yAxis.toValue(height));
//     //            }
//     //            if (Math.abs(currentyValue - yValue) < ( heightVal * 2) && drawingObj.shape == "tradingLine" && currentDrawingObj.idx < drawingObj.idx) {
//     //
//     //                var currentLabelWidth = 0;
//     //                $.each(drawingObj.additionalDrawings['ctrlLabels'], function (key, value) {
//     //                    currentLabelWidth = (annotation.options.accumilatedWidth) ? currentLabelWidth + value.width : (currentLabelWidth < value.width) ? value.width : currentLabelWidth;
//     //                });
//     //                lastWidth = currentLabelWidth;
//     //                widthCount += (currentLabelWidth + 2);
//     //            }
//     //        }
//     //    });
//     //    xValue = chart.plotWidth * 0.75 - widthCount - labelWidth;
//     //    return xValue;
//     //
//     //},
//     getPlotHeight: function () {
//         return {
//             height: this.additionalDrawings['priceLabel'] && this.additionalDrawings['priceLabel'].height
//         };
//     },
//     additionalDrawings: function () {
//         var drawingObject = this,
//             ann = drawingObject.annotation,
//             chart = ann.chart,
//             options = ann.options,
//             order = options.order,
//             tradeLineTheme = infChart.constants.chartTrading.theme.tradingLine,
//             height = tradeLineTheme.height,
//             padding = tradeLineTheme.padding,
//             top = -(height / 2 + padding),
//             labelFill = tradeLineTheme.label.fill,
//             stroke = tradeLineTheme.label.stroke,
//             opacity = tradeLineTheme.opacity,
//             labelFontColor = tradeLineTheme.label.fontColor,
//             labelFontWeight = tradeLineTheme.label.fontWeight ? tradeLineTheme.label.fontWeight : 100;

//         var tradingUtils = infChart.drawingUtils.common.tradingUtils;

//         var labelX = 0;
//         var isSubOrder = tradingUtils.isSubOrder(order);
//         if (isSubOrder) {
//             var labelText = tradingUtils.getSubOrderLabel(order);
//             var labelFillColor = tradingUtils.getSubOrderTypeLabelFillColor(order, tradeLineTheme);
//             var subTypeLabel = chart.renderer.label(labelText, labelX, top).attr({
//                 'zIndex': 20,
//                 'padding': padding,
//                 'r': 1,
//                 'fill': labelFillColor,
//                 'opacity': opacity,
//                 'stroke': stroke,
//                 'stroke-width': 1,
//                 'stroke-linecap': 'butt',
//                 'stroke-linejoin': 'miter',
//                 'stroke-opacity': 1,
//                 'hAlign': 'center',
//                 'height': height,
//                 'class': 'price-lbl'
//             }).add(ann.group);

//             subTypeLabel.css({ //to color text
//                 'fontWeight': labelFontWeight,
//                 'color': labelFontColor
//             });

//             drawingObject.additionalDrawings['subTypeLabel'] = subTypeLabel;
//             labelX += subTypeLabel.width;
//         }

//         /**
//          * price label
//          * @type {*|SVGElement}
//          */
//         var priceLabel = chart.renderer.label(tradingUtils.formatOrderPrice(drawingObject.stockChartId, order), labelX, top).attr({
//             'zIndex': 20,
//             'padding': padding,
//             'r': 1,
//             'fill': labelFill,
//             'opacity': opacity,
//             'stroke': stroke,
//             'stroke-width': 1,
//             'stroke-linecap': 'butt',
//             'stroke-linejoin': 'miter',
//             'stroke-opacity': 1,
//             'hAlign': 'center',
//             'height': height,
//             'class': 'price-lbl'
//         }).add(ann.group);

//         //textProps: ['direction', 'fontSize', 'fontWeight', 'fontFamily','fontStyle', 'color', 'lineHeight', 'width', 'textAlign','textDecoration', 'textOverflow', 'textOutline']
//         priceLabel.css({ //to color text
//             'fontWeight': labelFontWeight,
//             'color': labelFontColor
//         });

//         drawingObject.additionalDrawings['priceLabel'] = priceLabel;
//         labelX += priceLabel.width;

//         drawingObject.additionalDrawings['ctrlLabels'] = {};
//         var isSentOrder = tradingUtils.isSentOrder(options.order);

//         if (!options.isIdea && (!isSubOrder || isSentOrder)) {
//             /**
//              * qty label
//              * @type {*|SVGElement}
//              */
//             var drawingLabel = chart.renderer.label(tradingUtils.formatOrderQuantity(drawingObject.stockChartId, order), labelX, top).attr({
//                 'zIndex': options.isDisplayOnly ? 1 : 20,
//                 'padding': padding,
//                 'r': 1,
//                 'fill': labelFill,
//                 'opacity': opacity,
//                 'stroke': stroke,
//                 'stroke-width': 1,
//                 'stroke-linecap': 'butt',
//                 'stroke-linejoin': 'miter',
//                 'stroke-opacity': 1,
//                 'hAlign': 'center',
//                 'height': height,
//                 'class': 'qty-lbl'
//             }).add(ann.group);

//             drawingLabel.css({ //to color text
//                 'fontWeight': labelFontWeight,
//                 'fill': labelFontColor
//             });

//             drawingObject.additionalDrawings['ctrlLabels'][0] = drawingLabel;
//             labelX += drawingLabel.width;
//         }

//         /**
//          * draw cancelLabel & transmitLabel, bind events
//          */
//         if (!options.isIdea && !options.isDisplayOnly) {
//             var trader = tradingUtils.getTraderInstance(this.stockChartId);
//             if (trader) {
//                 drawingLabel.attr({
//                     cursor: 'pointer'
//                 });

//                 priceLabel.attr({
//                     cursor: 'pointer'
//                 });

//                 infChart.util.bindEvent(drawingLabel.element, 'mousedown', function (e) {
//                     e.stopPropagation();
//                     e.preventDefault();
//                     trader.onOrderSelect(order);
//                     if (trader.getOptions().enableOrderWindow) {
//                         var newDrawingObj = tradingUtils.changeDrawingToOrderLimit.call(drawingObject);
//                         if (newDrawingObj != null) {
//                             tradingUtils.onQtyClick.call(newDrawingObj);
//                         }
//                     }
//                 });

//                 infChart.util.bindEvent(priceLabel.element, 'mousedown', function (e) {
//                     e.stopPropagation();
//                     e.preventDefault();
//                     trader.onOrderSelect(order);
//                     if (trader.getOptions().enableOrderWindow) {
//                         var newDrawingObj = tradingUtils.changeDrawingToOrderLimit.call(drawingObject);
//                         if (newDrawingObj != null) {
//                             tradingUtils.onLimitPriceClick.call(newDrawingObj);
//                         }
//                     }
//                 });
//             }
//             /**
//              * cancel btn
//              * @type {*|SVGElement}
//              */
//             var cancelLabel = chart.renderer.label('X', labelX, top).attr({
//                 'zIndex': 20,
//                 'paddingLeft': 3,
//                 'padding': padding,
//                 'r': 1,
//                 'fill': tradeLineTheme.cancelColor,
//                 'opacity': opacity,
//                 'stroke': stroke,
//                 'stroke-width': 1,
//                 'stroke-linecap': 'butt',
//                 'stroke-linejoin': 'miter',
//                 'stroke-opacity': 1,
//                 'hAlign': 'center',
//                 'class': 'cancel-lbl',
//                 // 'width': 12,
//                 'height': height,
//                 'cursor': 'pointer'
//                 /*,
//                  "text-anchor":"middle"*/
//             }).add(ann.group);

//             cancelLabel.css({ //to color text
//                 'fontWeight': tradeLineTheme.cancelFontWeight ? tradeLineTheme.cancelFontWeight : 100,
//                 'color': tradeLineTheme.cancelFontColor
//             });

//             // cancelLabel.paddingLeftSetter((cancelLabel.height - cancelLabel.element.children[1].clientWidth) / 2);

//             drawingObject.additionalDrawings['ctrlLabels'][1] = cancelLabel;
//             labelX += cancelLabel.width;

//             /**
//              * send/amend button
//              */
//             var transmitLabel = chart.renderer.label('T', labelX, top).attr({
//                 'zIndex': 20,
//                 'paddingLeft': 3,
//                 'padding': padding,
//                 'r': 1,
//                 'fill': tradeLineTheme.transmitColor,
//                 'opacity': opacity,
//                 'stroke': stroke,
//                 'stroke-width': 1,
//                 'stroke-linecap': 'butt',
//                 'stroke-linejoin': 'miter',
//                 'stroke-opacity': 1,
//                 'hAlign': 'center',
//                 'class': (isSentOrder ? 'resend-lbl' : 'transmit-lbl'),
//                 // 'width': 12,
//                 'height': height,
//                 'cursor': 'pointer',
//                 'visibility': !isSentOrder || options.amend ? 'visible' : 'hidden'
//             }).add(ann.group);

//             transmitLabel.css({ //to color text
//                 'fontWeight': tradeLineTheme.transmitFontWeight ? tradeLineTheme.transmitFontWeight : 100,
//                 'color': tradeLineTheme.transmitFontColor
//             });

//             // transmitLabel.paddingLeftSetter(( transmitLabel.height - transmitLabel.element.children[1].clientWidth) / 2);


//             if (isSentOrder && !options.amend) {
//                 transmitLabel.attr({
//                     'visibility': 'hidden'
//                 });
//             }

//             drawingObject.additionalDrawings['ctrlLabels'][2] = transmitLabel;
//             labelX += transmitLabel.width;

//             var revertLabel = chart.renderer.label("\uf112", labelX, top).attr({
//                 'zIndex': 20,
//                 'paddingLeft': 3,
//                 'padding': padding,
//                 'r': 1,
//                 'fill': tradeLineTheme.revertColor,
//                 'opacity': opacity,
//                 'stroke': stroke,
//                 'stroke-width': 1,
//                 'stroke-linecap': 'butt',
//                 'stroke-linejoin': 'miter',
//                 'stroke-opacity': 1,
//                 'hAlign': 'center',
//                 'class': 'revert-lbl icon-label-fa',
//                 // 'width': 12,
//                 'height': height,
//                 'cursor': 'pointer',
//                 'visibility': isSentOrder && options.amend ? 'visible' : 'hidden'
//             }).add(ann.group);

//             revertLabel.css({ //to color text
//                 'fontWeight': tradeLineTheme.revertFontWeight ? tradeLineTheme.revertFontWeight : 100,
//                 'color': tradeLineTheme.revertFontColor
//             });

//             // revertLabel.paddingLeftSetter((revertLabel.height - revertLabel.element.children[1].clientWidth) / 2);

//             drawingObject.additionalDrawings['ctrlLabels'][3] = revertLabel;

//             infChart.util.bindEvent(cancelLabel.element, 'mousedown', function (e) {
//                 e.stopPropagation();
//                 e.preventDefault();
//                 tradingUtils.cancelOrder(drawingObject.stockChartId, ann.options.order);
//             });

//             infChart.util.bindEvent(transmitLabel.element, 'mousedown', function (e) {
//                 e.stopPropagation();
//                 e.preventDefault();
//                 tradingUtils.placeOrder(drawingObject.stockChartId, ann.options.order);
//             });

//             infChart.util.bindEvent(revertLabel.element, 'mousedown', function (e) {
//                 e.stopPropagation();
//                 e.preventDefault();
//                 ann.options.amend = false;
//                 tradingUtils.revertOrder(drawingObject.stockChartId, ann.options.order);
//             });

//             if (tradingUtils.isAlgoOrder(order)) {
//                 tradingUtils.addAlgoLimits.call(drawingObject);
//             }
//         }
//     },
//     selectAndBindResize: function () {
//         infChart.drawingUtils.common.tradingUtils.selectAndBindResize.call(this, (this.annotation.chart.plotWidth * 0.9));
//     },
//     translate: function () {
//         var self = this,
//             ann = this.annotation,
//             chart = ann.chart,
//             order = ann.options.order;

//         order.price = self.yValue;
//         var priceLabel = this.additionalDrawings['priceLabel'];
//         priceLabel.attr({
//             text: infChart.drawingUtils.common.tradingUtils.formatOrderPrice(this.stockChartId, order)
//         });
//         //when price changes update the x of ctrl labels
//         //todo : this can be optimized - can check length
//         infChart.drawingUtils.common.tradingUtils.adjustControlLabelsPositions(this.additionalDrawings['ctrlLabels'], 0, priceLabel.x + priceLabel.width);

//         var isSentOrder = infChart.drawingUtils.common.tradingUtils.isSentOrder(order);
//         if (isSentOrder) {
//             ann.options.amend = true;
//             var originalOrder = ann.options.originalOrder;
//             if (!this.additionalDrawings['original']) {
//                 if (order.price !== originalOrder.price) {
//                     this.additionalDrawings['original'] = infChart.drawingUtils.common.tradingUtils.addOrderDrawing(originalOrder, chart, this.drawingSettingsContainer, true, false);
//                     infChart.drawingUtils.common.tradingUtils.updateControlLabelsVisibility(this.additionalDrawings['ctrlLabels'], true);
//                 }
//             } else {
//                 //intentionally we are not removing original order when user is adjusting the order line
//                 //    if (order.price === originalOrder.price) {
//                 //        infChart.drawingUtils.common.tradingUtils.removeDrawing(this.additionalDrawings['original']);
//                 //        this.additionalDrawings['original'] = undefined;
//                 //    }
//             }
//         }

//         // infChart.drawingUtils.common.tradingUtils.updateOrderDrawing.call(self, { 'price': self.yValue }, false, order);
//         infChart.drawingUtils.common.tradingUtils.onOrderChanges.call(self, order.orderId, {
//             'price': self.yValue
//         });

//         this.selectAndBindResize();
//         chart.selectedAnnotation = ann;
//     },
//     destroy: function () {
//         this.additionalDrawings['priceLabel'].destroy();
//         if (this.additionalDrawings['subTypeLabel']) {
//             this.additionalDrawings['subTypeLabel'].destroy();
//         }
//         if (this.additionalDrawings['ctrlLabels'][0]) {
//             this.additionalDrawings['ctrlLabels'][0].destroy();
//         }
//         if (this.additionalDrawings['ctrlLabels'][1]) {
//             this.additionalDrawings['ctrlLabels'][1].destroy();
//         }
//         if (this.additionalDrawings['ctrlLabels'][2]) {
//             this.additionalDrawings['ctrlLabels'][2].destroy();
//         }
//         if (this.additionalDrawings['ctrlLabels'][3]) {
//             this.additionalDrawings['ctrlLabels'][3].destroy();
//         }
//         if (this.additionalDrawings['original']) {
//             infChart.drawingUtils.common.tradingUtils.removeDrawing(this.additionalDrawings['original']);
//         }
//         infChart.drawingUtils.common.tradingUtils.removeAlgoLimits.call(this);
//     },
//     updateSettings: function () {
//     },
//     getSettingsPopup: function () {
//         return $("<div></div>");
//     },
//     bindSettingsEvents: function () {
//     },
//     /**
//      * validate moving orders below zero
//      * called from annotations => translateAnnotation
//      * should invoke with drawing object
//      * @param x
//      * @param y
//      * @returns {boolean}
//      */
//     validateTranslation: function (x, y) {
//         var annotation = this.annotation,
//             yValue = annotation && annotation.options && infChart.drawingUtils.common.getBaseYValue.call(this, y);
//         console.debug("validateTranslation : yValue : " + yValue);
//         return (yValue && yValue >= 0);
//     }
// };

// infChart.drawingUtils.tradingLabel = {
//     getOptions: function (properties) {
//         var options = {
//             xValue: properties.xValue,
//             yValue: properties.yValue,
//             allowDragX: false,
//             allowDragY: false,
//             drawingType: infChart.constants.drawingTypes.trading,
//             shape: {
//                 type: 'label',
//                 params: {
//                     text: '',
//                     fill: 'transparent',
//                     stroke: 'transparent',
//                     style: {
//                         color: (properties.subType == infChart.constants.chartTrading.orderSide.buy ? infChart.constants.chartTrading.theme.buyColor : infChart.constants.chartTrading.theme.sellColor),
//                         fontSize: '12px',
//                         fontWeight: 'normal',
//                         fontStyle: 'normal',
//                         textDecoration: 'inherit'
//                     }
//                 }
//             }
//         };
//         if (properties.text) {
//             options.shape.params.text = properties.text;
//         }
//         if (properties.xValueEnd && properties.yValueEnd) {
//             options.xValueEnd = properties.xValueEnd;
//             options.yValueEnd = properties.yValueEnd;
//         }
//         return options;
//     },
//     getConfig: function () {
//         var annotation = this.annotation;
//         return {
//             shape: 'tradingLabel',
//             text: annotation.options.shape.params.text,
//             xValue: annotation.options.xValue,
//             yValue: annotation.options.yValue,
//             xValueEnd: annotation.options.xValueEnd,
//             yValueEnd: annotation.options.yValueEnd
//         };
//     },
//     step: function () {
//     },
//     stop: function () {
//         infChart.drawingUtils.common.saveBaseYValues.call(this, this.annotation.options.yValue);
//     },
//     scale: function () {
//     },
//     additionalDrawings: function () {
//         var ann = this.annotation;
//         var chart = ann.chart;
//         var padding = 8;

//         infChart.drawingUtils.common.addSelectionMarker.call(this, ann, 0, 0);
//     },
//     selectAndBindResize: function () {
//     },
//     updateSettings: function (properties) {
//     },
//     getSettingsPopup: function () {
//         return '';
//     },
//     bindSettingsEvents: function () {

//     }
// };

/**
 * represents a trade
 * is not draggable
 * displayed only if trade time is in the the x-axis range
 * @type {{getOptions: Function, getConfig: Function, step: Function, stop: Function, scale: Function, additionalDrawings: Function, destroy: Function, selectAndBindResize: Function, updateSettings: Function, getSettingsPopup: Function, bindSettingsEvents: Function}}
 */
// infChart.drawingUtils.holdingLine = {
//     getOptions: function (properties) {
//         var options = {
//             xValue: properties.xValue,
//             yValue: properties.yValue,
//             price: properties.price,
//             time: properties.time,
//             subType: properties.subType,
//             orderId: properties.orderId,
//             holdingId: properties.holdingId,
//             qty: properties.qty,
//             account: properties.account,
//             isDisplayOnly: false,
//             allowDragX: false,
//             allowDragY: true,
//             drawingType: infChart.constants.drawingTypes.trading,
//             shape: {
//                 params: {
//                     d: ['M', 0, 0, 'L', 0, 0],
//                     dashstyle: 'dot',
//                     fill: infChart.constants.chartTrading.theme.holdingLine.label.fill,
//                     stroke: infChart.constants.chartTrading.theme.holdingLine.upColor,
//                     'stroke-width': 1,
//                     'stroke-dasharray': 1.5
//                 }
//             }
//         };

//         if (properties.width) {
//             options.shape.params.d = ['M', properties.width * 0.75, 0, 'L', properties.width * 2, 0];
//         }
//         if (properties.clickCords) {
//             options.clickCords = properties.clickCords;
//         }

//         if (properties.isDisplayOnly) {
//             options.isDisplayOnly = properties.isDisplayOnly;
//             options.allowDragY = !properties.isDisplayOnly;
//             options.shape.params.cursor = 'default';
//         }
//         options.adjustYAxisToViewAnnotation = true;
//         options.getExtremesFn = infChart.drawingUtils.common.tradingUtils.getLineExtremesFn;
//         return options;
//     },
//     getConfig: function () {
//     },
//     step: function () {
//     },
//     stop: function (e) {
//     },
//     scale: function () {
//         var drawingObj = this,
//             ann = drawingObj.annotation,
//             chart = ann.chart,
//             options = ann.options,
//             plotWidth = chart.plotWidth,
//             xAxis = chart.xAxis[options.xAxis],
//             xVal = options.time,
//             plotx = xAxis.toPixels(xVal); //drawingObj.getPlotX();

//         if (xAxis.min > xVal || xAxis.max < xVal) {
//             ann.hide();
//             drawingObj.additionalDrawings[0].attr({
//                 visibility: 'hidden'
//             });
//             drawingObj.additionalDrawings[1].attr({
//                 visibility: 'hidden'
//             });
//         } else {
//             ann.show();
//             var label = drawingObj.additionalDrawings[0];

//             var x2 = plotWidth - label.width,
//                 lineWidth = x2 - plotx + 3;

//             /**
//              * updating the annotation, setting the x value to the trade time
//              * so the line will start from the x value to the label
//              */
//             var line = ["M", 0, 0, 'L', lineWidth, 0];

//             var color = options.subType === infChart.constants.chartTrading.orderSide.buy ? infChart.constants.chartTrading.theme.buyColor : infChart.constants.chartTrading.theme.sellColor;

//             label.attr({
//                 visibility: 'visible',
//                 x: lineWidth,
//                 zIndex: 20
//             }).css({
//                 "stroke": color
//             });

//             drawingObj.additionalDrawings[1].css({
//                 color: color
//             }).attr({
//                 visibility: 'visible',
//                 zIndex: 20
//             });

//             /**
//              * updating the annotation, setting the x value to the trade time
//              */
//             ann.update({
//                 xValue: xVal,
//                 shape: {
//                     params: {
//                         d: line,
//                         stroke: color
//                     }
//                 }
//             });

//             if (!options.isDisplayOnly) {
//                 infChart.drawingUtils.common.removeDragSupporters.call(drawingObj, drawingObj.dragSupporters);
//                 infChart.drawingUtils.common.addDragSupporters.call(drawingObj, ann, chart, line, drawingObj.dragSupporters);
//             }
//         }
//     },
//     additionalDrawings: function () {
//         var ann = this.annotation,
//             chart = ann.chart,
//             options = ann.options,
//             xAxis = chart.xAxis[ann.options.xAxis],
//             xVal = options.time,
//             plotx = xAxis.toPixels(xVal),
//             drawingLabel, drawingCircle;

//         drawingLabel = chart.renderer.label(infChart.drawingUtils.common.tradingUtils.getHoldingDisplayText.call(this), 0, -10)
//             .attr({
//                 "zIndex": 20,
//                 padding: 3,
//                 r: 1,
//                 fill: options.shape.params.fill,
//                 hAlign: 'right'
//             }).css({
//                 stroke: options.shape.params.stroke,
//                 "stroke-width": 1,
//                 "stroke-linecap": "butt",
//                 "stroke-linejoin": "miter",
//                 "stroke-opacity": 1,
//                 /*color: '#ffffff',*/
//                 "font-weight": "lighter",
//                 "font-size": '11px'
//             }).add(ann.group);

//         drawingLabel.attr({
//             x: chart.plotWidth - plotx - drawingLabel.width
//         });

//         this.additionalDrawings[0] = drawingLabel;

//         drawingCircle = chart.renderer.circle(0, 0, 2).attr({
//             "zIndex": 20,
//             r: 4,
//             fill: options.shape.params.fill,
//             x: 0
//         }).css({
//             color: options.shape.params.fill
//         }).add(ann.group);

//         this.additionalDrawings[1] = drawingCircle;
//     },
//     destroy: function () {
//         this.additionalDrawings[0].destroy();
//         this.additionalDrawings[1].destroy();
//     },
//     selectAndBindResize: function () {
//         infChart.drawingUtils.common.tradingUtils.selectAndBindResize.call(this);
//     },
//     updateSettings: function (properties) {
//     },
//     getSettingsPopup: function () {
//     },
//     bindSettingsEvents: function () {
//     }
// };

/**
 * represents a detail view of the order
 * @type {{getOptions: Function, getConfig: Function, step: Function, stop: Function, scale: Function, translate: Function, additionalDrawings: Function, selectAndBindResize: Function, updateSettings: Function, getSettingsPopup: Function, bindSettingsEvents: Function, destroy: Function}}
 */
// infChart.drawingUtils.limitOrder = {
//     getOptions: function (properties) {
//         var options = {
//             xValue: properties.xValue,
//             x: properties.x,
//             yValue: properties.yValue,
//             drawingType: infChart.constants.drawingTypes.trading,
//             allowDragX: false,
//             shape: {
//                 params: {
//                     d: ['M', 0, 0, 'L', 0, 0],
//                     dashstyle: 'solid'
//                 }
//             }
//         };
//         if (properties.width) {
//             options.shape.params.d = ['M', 0, 0, 'L', properties.width * 1.5, 0];
//         }
//         if (properties.clickCords) {
//             options.clickCords = properties.clickCords;
//         }
//         if (properties.fillColor) {
//             options.shape.params.fill = properties.fillColor;
//         }
//         if (properties.borderColor) {
//             options.shape.params.stroke = properties.borderColor;
//         }
//         if (properties.dashStyle) {
//             options.shape.params.dashstyle = properties.dashStyle;
//         }
//         if (properties.strokeWidth) {
//             options.shape.params['stroke-width'] = properties.strokeWidth;
//         }
//         if (properties.isRealTimeTranslation) {
//             options.isRealTimeTranslation = properties.isRealTimeTranslation;
//         }
//         if (properties.subType) {
//             options.subType = properties.subType;
//         }
//         if (properties.order) {
//             options.order = properties.order;
//             options.originalOrder = properties.originalOrder;
//         }
//         if (infChart.drawingUtils.common.tradingUtils.isAlgoTrendOrder(properties.order)) {
//             options.allowDragY = false;
//             options.shape.params.dashstyle = 'dot';
//         }
//         options.amend = properties.amend;
//         options.adjustYAxisToViewAnnotation = true;
//         //get annotation extremes and show without any crop areas when chart has user defined yAxis
//         options.viewAnnotionWhenAdjustedYAxis = true;
//         options.getExtremesFn = infChart.drawingUtils.common.tradingUtils.getLimitOrderExtremesFn;
//         options.afterSetExtremesFn = infChart.drawingUtils.common.tradingUtils.positionLimitOrderWindow;
//         options.validateTranslationFn = infChart.drawingUtils.limitOrder.validateTranslation;
//         return options;
//     },
//     getConfig: function () {
//         var annotation = this.annotation;
//         return {
//             shape: 'limitOrder',
//             borderColor: annotation.options.shape.params.stroke,
//             fillColor: annotation.options.shape.params.fill,
//             strokeWidth: annotation.options.shape.params['stroke-width'],
//             dashStyle: annotation.options.shape.params.dashstyle,
//             xValue: annotation.options.xValue,
//             yValue: annotation.options.yValue,
//             clickCords: annotation.options.clickCords,
//             width: annotation.chart.plotWidth,
//             isDisplayOnly: annotation.options.isDisplayOnly,
//             isRealTimeTranslation: annotation.options.isRealTimeTranslation,
//             subType: annotation.options.subType,
//             order: annotation.options.order
//         };
//     },
//     step: function () {
//     },
//     stop: function (e) {
//     },
//     getPlotHeight: function (y) {
//         var orderH = this.additionalDrawings['order'].outerHeight(true),
//             stopLoss = this.additionalDrawings[infChart.drawingUtils.common.tradingUtils.constants.stopLoss],
//             takeProfit = this.additionalDrawings[infChart.drawingUtils.common.tradingUtils.constants.takeProfit],
//             stopLossH = (stopLoss && stopLoss.getPlotHeight) ? stopLoss.getPlotHeight().height : 0,
//             takeProfitH = (takeProfit && takeProfit.getPlotHeight) ? takeProfit.getPlotHeight().height : 0,
//             upper, lower,
//             ann = this.annotation,
//             id = this.drawingId;


//         //todo : consider  stopLoss and takeProfit when it is used
//         /*if (this.subType) {
//          lower = stopLossH;
//          upper = takeProfitH;
//          } else {
//          lower = takeProfitH;
//          upper = stopLossH;
//          }*/
//         var yAxis = ann.chart.yAxis[ann.options.yAxis],
//             belowY = yAxis.toValue(y + orderH / 2),
//             yValue = infChart.drawingUtils.common.getBaseYValue.call(this, belowY);
//         var padingPx = yAxis.height * yAxis.options.minPadding;

//         if (yValue < 0) {
//             if (yAxis.infMinAnnotation == id) {
//                 if (orderH / 2 > padingPx) {
//                     lower = padingPx;
//                 }
//             } else if (orderH / 2 > (yAxis.height - y) && y < yAxis.height) {
//                 lower = yAxis.height - y;
//             } else {
//                 lower = 0;
//             }
//             //lower = y - yAxis.toPixels(infChart.drawingUtils.common.getYValue.call(this, 0));
//             if (lower < 0) {
//                 lower = 0;
//             }
//             upper = orderH - lower;
//         } else {
//             lower = upper = orderH / 2;
//         }
//         return {
//             height: orderH,
//             isBelow: true,
//             upper: upper,
//             below: lower
//         };
//     },
//     scale: function () {
//         var self = this,
//             ann = self.annotation,
//             chart = ann.chart,
//             line = ann.shape.d.split(' '),
//             options = ann.options,
//             order = options.order;

//         line[4] = chart.plotWidth;

//         ann.update({
//             xValue: null,
//             x: chart.plotLeft,
//             shape: {
//                 params: {
//                     d: line
//                 }
//             }
//         });

//         infChart.drawingUtils.common.removeDragSupporters.call(self, self.dragSupporters);
//         infChart.drawingUtils.common.addDragSupporters.call(self, ann, chart, ["M", 0, 0, 'L', line[4], line[5]], self.dragSupporters);
//         //if (infChart.drawingUtils.common.tradingUtils.isAlgoOrder(order)) {
//         //    infChart.drawingUtils.common.tradingUtils.scaleAlgoLimits.call(self);
//         //}
//         infChart.drawingUtils.common.tradingUtils.positionLimitOrderWindow.call(self);
//     },
//     translate: function () {
//         var self = this,
//             ann = self.annotation,
//             chart = ann.chart,
//             order = ann.options.order,
//             orderTicket = self.additionalDrawings["order"],
//             trader = infChart.drawingUtils.common.tradingUtils.getTraderInstance(self.stockChartId);

//         //if (chart.infScaleY) {
//         //    y = y / chart.infScaleY;
//         //}

//         order.price = self.yValue;

//         infChart.drawingUtils.common.tradingUtils.positionLimitOrderWindow.call(this);

//         var shares = order.qty,
//             value = order.orderValue;

//         if (shares) {
//             var orderValue = infChart.drawingUtils.common.tradingUtils.getOrderValueFromOrder(order.price, order.qty, order.side, trader.tradingOptions);
//             orderTicket.find("[data-rel='value']").val(infChart.drawingUtils.common.tradingUtils.formatOrderValue(self.stockChartId, order.price, orderValue));
//         } else if (value) {
//             order.qty = value / order.price;
//             orderTicket.find("[data-rel='qty']").val(infChart.drawingUtils.common.tradingUtils.formatOrderQuantity(self.stockChartId, order));
//         }
//         orderTicket.find("[data-rel='price']").val(infChart.drawingUtils.common.tradingUtils.formatOrderPrice(self.stockChartId, order));

//         infChart.drawingUtils.common.tradingUtils.validateBuySellForm(orderTicket, self, order);

//         infChart.drawingUtils.common.tradingUtils.onOrderChanges.call(self, ann.options.order.orderId, shares ? {
//             'price': order.price
//         } : {
//             'price': order.price,
//             'qty': order.qty
//         });

//         var stopLossWindow, takeProfitWindow;
//         if (self.additionalDrawings[infChart.drawingUtils.common.tradingUtils.constants.stopLoss]) {
//             var sl = self.additionalDrawings[infChart.drawingUtils.common.tradingUtils.constants.stopLoss];
//             stopLossWindow = sl.additionalDrawings["order"];

//             infChart.drawingUtils.common.tradingUtils.updateLimitValues(self.stockChartId, order, sl);
//             infChart.drawingUtils.common.tradingUtils.moveDependentDrawing(self, sl);
//         }
//         if (self.additionalDrawings[infChart.drawingUtils.common.tradingUtils.constants.takeProfit]) {
//             var tp = self.additionalDrawings[infChart.drawingUtils.common.tradingUtils.constants.takeProfit];
//             takeProfitWindow = tp.additionalDrawings["order"];

//             infChart.drawingUtils.common.tradingUtils.updateLimitValues(self.stockChartId, order, tp);
//             infChart.drawingUtils.common.tradingUtils.moveDependentDrawing(self, tp);
//         }

//         if (stopLossWindow || takeProfitWindow) {
//             var top = $(chart.container).offset().top,
//                 mainOrderWindowTop = orderTicket.offset().top,
//                 mainOrderWindowBottom = mainOrderWindowTop + orderTicket.outerHeight(true),
//                 bottom = top + chart.plotHeight;
//             if (this.subType) {
//                 if (stopLossWindow) {
//                     stopLossWindow.draggable("option", "containment", [0, mainOrderWindowBottom, 0, bottom]);
//                 }
//                 if (takeProfitWindow) {
//                     takeProfitWindow.draggable("option", "containment", [0, top, 0, mainOrderWindowTop]);
//                 }
//             } else {
//                 bottom = mainOrderWindowTop;
//                 if (stopLossWindow) {
//                     stopLossWindow.draggable("option", "containment", [0, top, 0, mainOrderWindowTop]);
//                 }
//                 if (takeProfitWindow) {
//                     takeProfitWindow.draggable("option", "containment", [0, mainOrderWindowBottom, 0, bottom]);
//                 }
//             }
//         }

//         infChart.drawingUtils.common.tradingUtils.updateRiskReward(self);

//         this.selectAndBindResize();
//         chart.selectedAnnotation = ann;
//     },
//     additionalDrawings: function () {
//         var self = this,
//             ann = self.annotation,
//             chart = ann.chart,
//         //bbox = chart.container.getBoundingClientRect(),
//             yAxis = chart.yAxis[ann.options.yAxis],
//             y = yAxis.toPixels(ann.options.yValue),
//             options = ann.options,
//             order = options.order,
//             isAlgoOrder = infChart.drawingUtils.common.tradingUtils.isAlgoOrder(order),
//             orderTicketTitle = infChart.drawingUtils.common.tradingUtils.getOrderTicketTitle(order);

//         if (chart.infScaleY) {
//             y = y / chart.infScaleY;
//         }

//         var orderTicket = infChart.drawingUtils.common.tradingUtils.getLimitOrderTicket();
//         orderTicket = $(orderTicket).appendTo(this.drawingSettingsContainer);

//         if(orderTicketTitle.title) {
//             var titleElement = orderTicket.find("span[rel=title]");

//             titleElement.html(orderTicketTitle.title);

//             if(orderTicketTitle.titleClass) {
//                 titleElement.addClass(orderTicketTitle.titleClass);
//             }

//             titleElement.removeClass("d-none");
//         }

//         //infChart.drawingUtils.common.tradingUtils.initializeLimitOrder.call(self, ann.options.order, ann.options.subType);

//         //var w = orderTicket.outerWidth(true);
//         var h = orderTicket.outerHeight(true);
//         //var x = (bbox.right - bbox.left) - w;
//         orderTicket.css({
//             //left: x - 50,
//             top: y - (h / 2),
//             display: "block"
//         });

//         if (isAlgoOrder) {
//             orderTicket.find("[data-rel='value']").attr({
//                 'readOnly': true,
//                 'disabled': true
//             });
//             orderTicket.find("[data-rel='price']").attr({
//                 'readOnly': true,
//                 'disabled': true
//             });
//         }

//         self.additionalDrawings["order"] = orderTicket;

//         if (isAlgoOrder) {
//             infChart.drawingUtils.common.tradingUtils.addAlgoLimits.call(self);
//         }

//         infChart.drawingUtils.common.tradingUtils.initializeLimitOrder.call(self, order, options.subType);

//         infChart.drawingUtils.common.tradingUtils.bindLimitOrderSettingsEvents.call(self);
//     },
//     selectAndBindResize: function () {
//         infChart.drawingUtils.common.tradingUtils.selectAndBindResize.call(this);
//     },
//     updateSettings: function (properties) {
//     },
//     getSettingsPopup: function () {
//         return $("<div></div>");
//     },
//     bindSettingsEvents: function () {
//     },
//     destroy: function () {
//         this.additionalDrawings['order'].remove();

//         infChart.drawingUtils.common.tradingUtils.removeAlgoLimits.call(this);

//         var stopLossDrawing = this.additionalDrawings[infChart.drawingUtils.common.tradingUtils.constants.stopLoss];
//         if (stopLossDrawing) {
//             infChart.drawingUtils.common.tradingUtils.removeDrawing(stopLossDrawing);
//         }

//         var takeProfitDrawing = this.additionalDrawings[infChart.drawingUtils.common.tradingUtils.constants.takeProfit];
//         if (takeProfitDrawing) {
//             infChart.drawingUtils.common.tradingUtils.removeDrawing(takeProfitDrawing);
//         }
//     },
//     /**
//      * validate moving orders below zero
//      * called from annotations => translateAnnotation
//      * should invoke with drawing object
//      * @param x
//      * @param y
//      * @returns {boolean}
//      */
//     validateTranslation: function (x, y) {
//         var annotation = this.annotation,
//             yValue = annotation && annotation.options && infChart.drawingUtils.common.getBaseYValue.call(this, y);
//         console.debug("validateTranslation : yValue : " + yValue);
//         return (yValue && yValue >= 0);
//     }
// };

/**
 * represents a take profit order if the main order is buy or a stop loss order if the main order is a sell
 * dragging is restricted below the main order {@link infChart.drawingUtils.common.tradingUtils.validateTranslationFn}
 * @type {{getOptions: Function, getConfig: Function, step: Function, stop: Function, scale: Function, translate: Function, additionalDrawings: Function, selectAndBindResize: Function, updateSettings: Function, getSettingsPopup: Function, bindSettingsEvents: Function, destroy: Function}}
 */
// infChart.drawingUtils.upperLimit = {
//     getOptions: function (properties) {
//         var options = {
//             xValue: properties.xValue,
//             x: properties.x,
//             yValue: properties.yValue,
//             drawingType: infChart.constants.drawingTypes.trading,
//             allowDragX: false,
//             shape: {
//                 params: {
//                     d: ['M', 0, 0, 'L', 0, 0],
//                     dashstyle: 'solid'
//                 }
//             }
//         };
//         if (properties.width) {
//             options.shape.params.d = ['M', 0, 0, 'L', properties.width * 1.5, 0];
//         }
//         if (properties.clickCords) {
//             options.clickCords = properties.clickCords;
//         }
//         if (properties.fillColor) {
//             options.shape.params.fill = properties.fillColor;
//         }
//         if (properties.borderColor) {
//             options.shape.params.stroke = properties.borderColor;
//         }
//         if (properties.dashStyle) {
//             options.shape.params.dashstyle = properties.dashStyle;
//         }
//         if (properties.strokeWidth) {
//             options.shape.params['stroke-width'] = properties.strokeWidth;
//         }
//         if (properties.isRealTimeTranslation) {
//             options.isRealTimeTranslation = properties.isRealTimeTranslation;
//         }
//         if (properties.parent) {
//             options.parent = properties.parent;
//         }
//         if (properties.subType) {
//             options.subType = properties.subType;
//         }
//         options.validateTranslationFn = infChart.drawingUtils.common.tradingUtils.validateTranslationFn;
//         options.adjustYAxisToViewAnnotation = true;
//         options.getExtremesFn = infChart.drawingUtils.common.tradingUtils.getLimitExtremesFn;
//         options.afterSetExtremesFn = infChart.drawingUtils.common.tradingUtils.positionTopLimitWindow;
//         return options;
//     },
//     getConfig: function () {
//     },
//     step: function () {
//     },
//     stop: function (e) {
//     },
//     scale: function () {
//         var ann = this.annotation,
//             chart = ann.chart,
//             line = ann.shape.d.split(' ');

//         line[4] = chart.plotWidth;

//         ann.update({
//             xValue: null,
//             x: chart.plotLeft,
//             shape: {
//                 params: {
//                     d: line
//                 }
//             }
//         });

//         infChart.drawingUtils.common.removeDragSupporters.call(this, this.dragSupporters);
//         infChart.drawingUtils.common.addDragSupporters.call(this, ann, chart, ["M", 0, 0, 'L', line[4], line[5]], this.dragSupporters);

//         infChart.drawingUtils.common.tradingUtils.positionTopLimitWindow.call(this);
//     },
//     getPlotHeight: function () {
//         var drawing = this,
//             drawingObjParent = infChart.drawingsManager.getDrawingObject(drawing.stockChartId, this.annotation.options.parent),
//             below, upper;
//         if (drawingObjParent.subType) {
//             below = drawing.subType === infChart.drawingUtils.common.tradingUtils.constants.stopLoss;
//         } else {
//             below = drawing.subType !== infChart.drawingUtils.common.tradingUtils.constants.stopLoss;
//         }
//         upper = !below;
//         return {
//             height: this.additionalDrawings['order'].outerHeight(true),
//             isBelow: below,
//             isUpper: upper
//         };
//     },
//     translate: function () {
//         var self = this,
//             ann = this.annotation,
//             chart = ann.chart;

//         //if (chart.infScaleY) {
//         //    y = y / chart.infScaleY;
//         //}

//         infChart.drawingUtils.common.tradingUtils.positionTopLimitWindow.call(this);

//         var parentDrawing = infChart.drawingsManager.getDrawingObject(self.stockChartId, ann.options.parent);

//         infChart.drawingUtils.common.tradingUtils.updateLimitValues(self.stockChartId, parentDrawing.annotation.options.order, self);

//         infChart.drawingUtils.common.tradingUtils.updateRiskReward(parentDrawing);

//         var isStopLoss = ann.options.subType === infChart.drawingUtils.common.tradingUtils.constants.stopLoss;
//         if (isStopLoss) {
//             parentDrawing.additionalDrawings['order'].find("[data-rel='stopPrice']").val(
//                 infChart.drawingUtils.common.tradingUtils.formatOrderLimitPrice(self.stockChartId, self.yValue, parentDrawing.annotation.options.order)
//             );
//         }
//         infChart.drawingUtils.common.tradingUtils.updateOrderLimitValues.call(this, isStopLoss, parentDrawing.annotation.options.order, this.yValue);

//         self.selectAndBindResize();
//         chart.selectedAnnotation = ann;
//     },
//     additionalDrawings: function () {
//         var self = this,
//             ann = self.annotation,
//             chart = ann.chart,
//         //bbox = chart.container.getBoundingClientRect(),
//             yAxis = chart.yAxis[ann.options.yAxis],
//             y = yAxis.toPixels(ann.options.yValue);

//         if (chart.infScaleY) {
//             y = y / chart.infScaleY;
//         }

//         var orderTicket = infChart.drawingUtils.common.tradingUtils.getLimitWindow();
//         orderTicket = $(orderTicket).appendTo(self.drawingSettingsContainer);
//         orderTicket.attr('data-rel', ann.options.subType);

//         var top = y - orderTicket.outerHeight(true);
//         // if(top < 0){
//         //     top = 0;
//         // }

//         orderTicket.css({
//             //left: (bbox.right - bbox.left) - 50 - orderTicket.outerWidth(true),
//             top: top,
//             display: "block"
//         });
//         orderTicket.find('label[data-rel="type"]').text(ann.options.subType === infChart.drawingUtils.common.tradingUtils.constants.stopLoss ? 'Stop Loss' : 'Take Profit');

//         self.additionalDrawings["order"] = orderTicket;

//         var parentDrawing = infChart.drawingsManager.getDrawingObject(self.stockChartId, ann.options.parent);

//         infChart.drawingUtils.common.tradingUtils.updateLimitValues(self.stockChartId, parentDrawing.annotation.options.order, self);
//         infChart.drawingUtils.common.tradingUtils.bindLimitWindowSettingsEvents(self, parentDrawing);

//     },
//     selectAndBindResize: function () {
//         infChart.drawingUtils.common.tradingUtils.selectAndBindResize.call(this);
//     },
//     updateSettings: function (properties) {
//     },
//     getSettingsPopup: function () {
//         return $("<div></div>");
//     },
//     bindSettingsEvents: function () {
//     },
//     destroy: function () {
//         this.additionalDrawings['order'].remove();
//     }
// };

/**
 * represents a stop loss order if the main order is buy or a take profit order if the main order is a sell
 * dragging is restricted above the main order {@link infChart.drawingUtils.common.tradingUtils.validateTranslationFn}
 * @type {{getOptions: Function, getConfig: Function, step: Function, stop: Function, scale: Function, translate: Function, additionalDrawings: Function, selectAndBindResize: Function, updateSettings: Function, getSettingsPopup: Function, bindSettingsEvents: Function, destroy: Function}}
 */
// infChart.drawingUtils.lowerLimit = {
//     getOptions: function (properties) {
//         var options = {
//             xValue: properties.xValue,
//             x: properties.x,
//             yValue: properties.yValue,
//             drawingType: infChart.constants.drawingTypes.trading,
//             allowDragX: false,
//             shape: {
//                 params: {
//                     d: ['M', 0, 0, 'L', 0, 0],
//                     dashstyle: 'solid'
//                 }
//             }
//         };
//         if (properties.width) {
//             options.shape.params.d = ['M', 0, 0, 'L', properties.width * 1.5, 0];
//         }
//         if (properties.clickCords) {
//             options.clickCords = properties.clickCords;
//         }
//         if (properties.fillColor) {
//             options.shape.params.fill = properties.fillColor;
//         }
//         if (properties.borderColor) {
//             options.shape.params.stroke = properties.borderColor;
//         }
//         if (properties.dashStyle) {
//             options.shape.params.dashstyle = properties.dashStyle;
//         }
//         if (properties.strokeWidth) {
//             options.shape.params['stroke-width'] = properties.strokeWidth;
//         }
//         if (properties.isRealTimeTranslation) {
//             options.isRealTimeTranslation = properties.isRealTimeTranslation;
//         }
//         if (properties.parent) {
//             options.parent = properties.parent;
//         }
//         if (properties.subType) {
//             options.subType = properties.subType;
//         }
//         options.validateTranslationFn = infChart.drawingUtils.common.tradingUtils.validateTranslationFn;
//         options.adjustYAxisToViewAnnotation = true;
//         options.getExtremesFn = infChart.drawingUtils.common.tradingUtils.getLimitExtremesFn;
//         options.afterSetExtremesFn = infChart.drawingUtils.common.tradingUtils.positionBottomLimitWindow;
//         return options;
//     },
//     getConfig: function () {
//     },
//     step: function () {
//     },
//     stop: function (e) {
//     },
//     scale: function () {
//         var ann = this.annotation,
//             chart = ann.chart,
//             line = ann.shape.d.split(' ');

//         line[4] = chart.plotWidth;

//         ann.update({
//             xValue: null,
//             x: chart.plotLeft,
//             shape: {
//                 params: {
//                     d: line
//                 }
//             }
//         });

//         infChart.drawingUtils.common.removeDragSupporters.call(this, this.dragSupporters);
//         infChart.drawingUtils.common.addDragSupporters.call(this, ann, chart, ["M", 0, 0, 'L', line[4], line[5]], this.dragSupporters);

//         infChart.drawingUtils.common.tradingUtils.positionBottomLimitWindow.call(this);
//     },
//     getPlotHeight: function () {
//         var drawing = this,
//             drawingObjParent = infChart.drawingsManager.getDrawingObject(drawing.stockChartId, this.annotation.options.parent),
//             below, upper;
//         if (drawingObjParent.subType) {
//             below = drawing.subType === infChart.drawingUtils.common.tradingUtils.constants.stopLoss;
//         } else {
//             below = drawing.subType !== infChart.drawingUtils.common.tradingUtils.constants.stopLoss;
//         }
//         upper = !below;
//         return {
//             height: this.additionalDrawings['order'].outerHeight(true),
//             isBelow: below,
//             isUpper: upper
//         };
//     },
//     translate: function () {
//         var self = this,
//             ann = self.annotation,
//             chart = ann.chart;

//         //if (chart.infScaleY) {
//         //    y = y / chart.infScaleY;
//         //}

//         infChart.drawingUtils.common.tradingUtils.positionBottomLimitWindow.call(this);

//         var parentDrawing = infChart.drawingsManager.getDrawingObject(self.stockChartId, ann.options.parent);

//         infChart.drawingUtils.common.tradingUtils.updateLimitValues(self.stockChartId, parentDrawing.annotation.options.order, self);

//         infChart.drawingUtils.common.tradingUtils.updateRiskReward(parentDrawing);

//         var isStopLoss = ann.options.subType === infChart.drawingUtils.common.tradingUtils.constants.stopLoss;
//         if (isStopLoss) {
//             parentDrawing.additionalDrawings['order'].find("[data-rel='stopPrice']").val(
//                 infChart.drawingUtils.common.tradingUtils.formatOrderLimitPrice(self.stockChartId, self.yValue, parentDrawing.annotation.options.order)
//             );
//         }
//         infChart.drawingUtils.common.tradingUtils.updateOrderLimitValues.call(self, isStopLoss, parentDrawing.annotation.options.order, self.yValue);

//         self.selectAndBindResize();
//         chart.selectedAnnotation = ann;
//     },
//     additionalDrawings: function () {
//         var self = this,
//             ann = this.annotation,
//             chart = ann.chart,
//         //bbox = chart.container.getBoundingClientRect(),
//             yAxis = chart.yAxis[ann.options.yAxis],
//             y = yAxis.toPixels(ann.options.yValue);

//         if (chart.infScaleY) {
//             y = y / chart.infScaleY;
//         }

//         var orderTicket = infChart.drawingUtils.common.tradingUtils.getLimitWindow();
//         orderTicket = $(orderTicket).appendTo(this.drawingSettingsContainer);
//         orderTicket.attr('data-rel', ann.options.subType);
//         orderTicket.css({
//             //left: (bbox.right - bbox.left) - 50 - orderTicket.outerWidth(true),
//             top: y,
//             display: "block"
//         });
//         orderTicket.find('label[data-rel="type"]').text(ann.options.subType === infChart.drawingUtils.common.tradingUtils.constants.stopLoss ? 'Stop Loss' : 'Take Profit');

//         self.additionalDrawings["order"] = orderTicket;

//         var parentDrawing = infChart.drawingsManager.getDrawingObject(self.stockChartId, ann.options.parent);

//         infChart.drawingUtils.common.tradingUtils.updateLimitValues(self.stockChartId, parentDrawing.annotation.options.order, self);

//         infChart.drawingUtils.common.tradingUtils.bindLimitWindowSettingsEvents(self, parentDrawing);
//     },
//     selectAndBindResize: function () {
//         infChart.drawingUtils.common.tradingUtils.selectAndBindResize.call(this);
//     },
//     updateSettings: function (properties) {
//     },
//     getSettingsPopup: function () {
//         return $("<div></div>");
//     },
//     bindSettingsEvents: function () {
//     },
//     destroy: function () {
//         this.additionalDrawings['order'].remove();
//     }
// };

/**
 *
 * @type {{getOptions: Function, getConfig: Function, step: Function, stop: Function, scale: Function, translate: Function, additionalDrawings: Function, selectAndBindResize: Function, updateSettings: Function, getSettingsPopup: Function, bindSettingsEvents: Function, destroy: Function}}
 */
// infChart.drawingUtils.breakEvenLine = {
//     getOptions: function (properties) {
//         var options = {
//             xValue: properties.xValue,
//             x: properties.x,
//             yValue: properties.yValue,
//             drawingType: infChart.constants.drawingTypes.trading,
//             allowDragX: false,
//             allowDragY: false,
//             behindSeries: true,
//             shape: {
//                 type: 'symbol',
//                 params: {
//                     'stroke-width': 0,
//                     width: 0,
//                     height: 0,
//                     symbol: 'rectangle',
//                     fill: {
//                         linearGradient: {
//                             x1: 0,
//                             y1: 0,
//                             x2: 0,
//                             y2: 1
//                         },
//                         stops: [
//                             [0, 'rgba(49, 175, 76,0)'],
//                             [1, 'rgba(49, 175, 76,0.4)']
//                         ]
//                     }
//                 }
//             }
//         };

//         if (properties.width) {
//             options.shape.params.width = properties.width;
//         }
//         if (properties.clickCords) {
//             options.clickCords = properties.clickCords;
//         }
//         if (properties.fillColor) {
//             options.shape.params.fill = properties.fillColor;
//         }
//         if (properties.isRealTimeTranslation) {
//             options.isRealTimeTranslation = properties.isRealTimeTranslation;
//         }
//         if (properties.parent) {
//             options.parent = properties.parent;
//         }
//         if (properties.subType) {
//             options.subType = properties.subType;
//             if (options.subType == "down") {
//                 options.shape.params.fill.linearGradient = {
//                     x1: 0,
//                     y1: 1,
//                     x2: 0,
//                     y2: 0
//                 };
//             } else {
//                 options.shape.params.fill.linearGradient = {
//                     x1: 0,
//                     y1: 0,
//                     x2: 0,
//                     y2: 1
//                 };
//             }
//         }
//         if (properties.xValueEnd && properties.yValueEnd) {
//             options.xValueEnd = properties.xValueEnd;
//             options.yValueEnd = properties.yValueEnd;
//         }
//         options.adjustYAxisToViewAnnotation = true;

//         /**
//          * @important : yAxis extremes should not be adjusted to show break even line
//          * https://xinfiit.atlassian.net/browse/CCA-2156
//          */
//         /*options.getExtremesFn = function () {
//          var yValue = infChart.drawingUtils.common.getYValue.call(this, this.yValue),
//          options = this.annotation.options,
//          isDown = options.subType === "down",
//          yAxis = this.annotation.chart.yAxis[options.yAxis],
//          min,
//          max,
//          dataMax = yAxis.infActualDataMax || yAxis.dataMax,
//          dataMin = yAxis.infActualDataMin || yAxis.dataMin,
//          extremes;

//          if (dataMin > yValue) {
//          min = yValue;
//          if (isDown) {
//          min -= (dataMax - yValue) * .05;
//          }
//          extremes = {
//          'min': min
//          }
//          }

//          if (dataMax < yValue) {
//          max = yValue;
//          if (!isDown) {
//          max += (yValue - dataMin) * .05;
//          }
//          if (!extremes) {
//          extremes = {};
//          }
//          extremes.max = max;
//          }

//          return extremes;
//          };*/
//         return options;
//     },
//     getConfig: function () {
//     },
//     step: function () {
//     },
//     stop: function (e) {
//     },
//     scale: function () {

//         var ann = this.annotation,
//             chart = ann.chart,
//             options = ann.options,
//         //xAxis = chart.xAxis[options.xAxis],
//             yAxis = chart.yAxis[options.yAxis],
//             dx = chart.plotWidth,
//             dy = yAxis.toPixels(options.yValue),
//             w = Math.round(dx) + 1 + chart.plotLeft,
//             h = Math.round(dy) + 1,
//             symbol = {
//                 symbol: options.shape.params.symbol,
//                 zIndex: chart.seriesGroup.zIndex - 1
//             },
//             xPx = 0,
//             yPx = 0;

//         if (options.subType == "down") {
//             if (dy > yAxis.height) {
//                 h = 0;
//             } else {
//                 yPx = dy;
//                 h = yAxis.height - h + 1 + chart.margin[2];
//             }
//         } else if (dy <= 1) {
//             h = 0;
//         }

//         symbol.x = 0;
//         symbol.y = 0;
//         symbol.width = Math.abs(w);
//         symbol.height = Math.abs(h);

//         ann.update({
//             xValue: null,
//             yValue: null,
//             xValueEnd: null,
//             yValueEnd: null,
//             x: xPx,
//             y: yPx,
//             shape: {
//                 params: symbol
//             }
//         });

//     },
//     getPlotHeight: function () {

//     },
//     translate: function () {

//     },
//     additionalDrawings: function () {

//     },
//     selectAndBindResize: function () {

//     },
//     updateSettings: function (properties) {
//         // this.
//     },
//     updateOptions: function (properties, redraw) {
//         var drawing = this,
//             ann = drawing.annotation;
//         if (properties.yValue) {
//             drawing.yValue = properties.yValue;
//         }
//         if (properties.subType) {
//             ann.options.subType = properties.subType;
//             if (ann.options.subType == "down") {
//                 ann.options.shape.params.fill.linearGradient = {
//                     x1: 0,
//                     y1: 1,
//                     x2: 0,
//                     y2: 0
//                 };
//             } else {
//                 ann.options.shape.params.fill.linearGradient = {
//                     x1: 0,
//                     y1: 0,
//                     x2: 0,
//                     y2: 1
//                 };
//             }
//         }
//         if (redraw) {
//             this.scaleDrawing();
//         }
//     },
//     getSettingsPopup: function () {
//         return $("<div></div>");
//     },
//     bindSettingsEvents: function () {
//     },
//     destroy: function () {

//     }
// };

// infChart.drawingUtils.algoLine = {
//     getOptions: function (properties) {
//         var order = properties.order,
//             color, algo = order.algo;
//         if (order.side == infChart.constants.chartTrading.orderSide.buy) {
//             color = infChart.constants.chartTrading.theme.buyColor;
//         } else {
//             color = infChart.constants.chartTrading.theme.sellColor;
//         }
//         var options = {
//             xValue: algo.t1,
//             yValue: algo.l1,
//             xValueEnd: algo.t2,
//             yValueEnd: algo.l2,
//             subType: algo.type,
//             drawingType: infChart.constants.drawingTypes.trading,
//             orderId: order.orderId,
//             parentId: properties.parentId,
//             shape: {
//                 params: {
//                     d: ['M', 0, 0, 'L', 0, 0],
//                     dashstyle: 'solid',
//                     'stroke-width': 2,
//                     fill: color,
//                     stroke: color
//                 }
//             }
//         };
//         options.isRealTimeTranslation = true;
//         //options.getExtremesFn = infChart.drawingUtils.common.tradingUtils.getAlgoLineExtremeFn;
//         //options.adjustYAxisToViewAnnotation = true;
//         return options;
//     },
//     getConfig: function () {
//         var annotation = this.annotation,
//             options = annotation.options;
//         return {
//             shape: 'algoLine',
//             borderColor: options.shape.params.stroke,
//             fillColor: options.shape.params.fill,
//             strokeWidth: options.shape.params['stroke-width'],
//             dashStyle: options.shape.params.dashstyle,
//             type: options.subType,
//             t1: options.xValue,
//             l1: options.yValue,
//             t2: options.xValueEnd,
//             l2: options.yValueEnd
//         };
//     },
//     step: function (e, isStartPoint) {
//         var ann = this.annotation,
//             points = infChart.drawingUtils.common.calculateInitialPoints.call(this, e, ann, isStartPoint, 2, 2),
//             line = ["M", 0, 0, 'L', parseInt(points.dx, 10), parseInt(points.dy, 10)];

//         ann.shape.attr({
//             d: line
//         });

//         return line;
//     },
//     stop: function (e, isStartPoint) {
//         var ann = this.annotation,
//             chart = ann.chart,
//             line = this.step(e, isStartPoint),
//             xAxis = chart.xAxis[ann.options.xAxis],
//             yAxis = chart.yAxis[ann.options.yAxis],
//             x = xAxis.toValue(line[4] + xAxis.toPixels(ann.options.xValue)),
//             y = yAxis.toValue(line[5] + yAxis.toPixels(ann.options.yValue));

//         ann.update({
//             xValueEnd: x,
//             yValueEnd: y,
//             shape: {
//                 params: {
//                     d: line
//                 }
//             }
//         });

//         infChart.drawingUtils.common.saveBaseYValues.call(this, ann.options.yValue, y);

//         infChart.drawingUtils.common.tradingUtils.onAlgoOrderChanges.call(this);

//         infChart.drawingUtils.common.removeDragSupporters.call(this, this.dragSupporters);
//         infChart.drawingUtils.common.addDragSupporters.call(this, ann, chart, ["M", 0, 0, 'L', line[4], line[5]], this.dragSupporters);
//     },
//     translate: function () {
//         var ann = this.annotation,
//             chart = ann.chart;

//         infChart.drawingUtils.common.tradingUtils.onAlgoOrderChanges.call(this);

//         this.selectAndBindResize();
//         chart.selectedAnnotation = ann;
//     },
//     scale: function () {
//         var ann = this.annotation,
//             chart = ann.chart,
//             options = ann.options,
//             line = ['M', 0, 0, 'L'],
//             xAxis = chart.xAxis[options.xAxis],
//             yAxis = chart.yAxis[options.yAxis];

//         var xEnd = xAxis.toPixels(options.xValueEnd) - xAxis.toPixels(options.xValue),
//             yEnd = yAxis.toPixels(options.yValueEnd) - yAxis.toPixels(options.yValue);

//         line[4] = (!isNaN(xEnd) && xEnd) || 0;
//         line[5] = (!isNaN(yEnd) && yEnd) || 0;

//         ann.update({
//             shape: {
//                 params: {
//                     d: line
//                 }
//             }
//         });

//         infChart.drawingUtils.common.removeDragSupporters.call(this, this.dragSupporters);
//         infChart.drawingUtils.common.addDragSupporters.call(this, ann, chart, ["M", 0, 0, 'L', line[4], line[5]], this.dragSupporters);
//     },
//     additionalDrawings: function () {
//         var ann = this.annotation;

//         ann.selectionMarker = [];
//         infChart.drawingUtils.common.addSelectionMarker.call(this, ann, 0, 0)
//     },
//     selectAndBindResize: function () {
//         var ann = this.annotation,
//             width, height, pathDefinition;

//         ann.events.deselect.call(ann);
//         ann.selectionMarker = [];
//         pathDefinition = ann.shape.d.split(' ');
//         width = parseFloat(pathDefinition[4]);
//         height = parseFloat(pathDefinition[5]);

//         if (!isNaN(width) && !isNaN(height)) {
//             infChart.drawingUtils.common.addAndBindSelectionMarker.call(this, ann, 0, 0, this.step, this.stop, true);
//             infChart.drawingUtils.common.addAndBindSelectionMarker.call(this, ann, width, height, this.step, this.stop, false);

//             //var parent = infChart.drawingsManager.getDrawingObject(this.stockChartId, ann.options.parentId);
//             //infChart.drawingUtils.common.tradingUtils.getTraderInstance(this.stockChartId).onOrderSelect(parent);
//         }
//     },
//     updateSettings: function (properties) {
//         // infChart.structureManager.drawingTools.updateLineSettings(this.settingsPopup, properties.borderColor, properties.strokeWidth, properties.dashStyle);
//     },
//     getSettingsPopup: function () {
//         return $("<div></div>"); //infChart.drawingUtils.common.getLineSettings('Algo Line', infChart.drawingUtils.common.baseBorderColor);
//     },
//     bindSettingsEvents: function () {
//         // return infChart.drawingUtils.common.bindLineSettingsEvents.call(this, infChart.drawingUtils.common.baseBorderColor, infChart.drawingUtils.common.baseLineWidth, infChart.drawingUtils.common.baseLineStyle);
//     }
// };
