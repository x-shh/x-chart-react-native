/**
 * All the trading related functions goes here
 * Created by dushani on 7/19/17.
 */
var infChart = window.infChart || {};

/**
 * Stock chart trading functions handled by this class
 * @param chartId
 * @param dataManager
 * @param options
 * @param settingsContainer
 * @param drawingSettingsContainer
 * @constructor
 */
infChart.StockTrader = function(chartId, dataManager, options, settingsContainer, drawingSettingsContainer) {

    /**
     * id of the chart
     */
    this.chartId = chartId;

    this.tradingOptions = options;

    /**
     * data manager
     * @see infChart.tradingDataManager
     */
    this.tradeDataManager = dataManager;

    this.tradeDataManager.cleanCache(); // TODO :: remove after proper cache management is done

    /**
     * contains the popups
     */
    this.settingsContainer = settingsContainer;

    /**
     * drawing settings container
     */
    this.drawingSettingsContainer = drawingSettingsContainer;

    /**
     * confirmation pop up
     * only shown if hideConfirmation is false
     * @see infChart.StockTrader.hideConfirmation
     * @type {html}
     */
    this.orderConfirmationPopup = undefined;

    /**
     * market order window
     * @type {html}
     */
    this.markeOrderWindow = undefined;

    /**
     * hide confirmation till js is reloaded
     * @type {boolean}
     */
    this.hideConfirmation = false;

    this.symbol = undefined;

    /**
     * ltp for symbol
     * @type {number}
     */
    this.lastPrice = 0;

    /**
     * holdings for symbol
     * @type {number}
     */
    this.holdingsQty = 100;

    this.buyingPower = 0;

    /**
     * order list data
     * @see infChart.tradingDataManager.getOrderList
     * @type {object} { columns: [], colMap: {}, categoryData: {keys: [], map: {}}, mapData: []}
     */
    this.orderList = undefined;

    /**
     * holdings data
     * @see infChart.tradingDataManager.getPositions
     * @type {object} columns: [], colMap: {}, categoryData: {keys: [], map: {}}, mapData: []
     */
    this.positions = undefined;

    /**
     * trade history data
     * @see infChart.tradingDataManager.getTradeHistory
     * @type {object} columns: [], colMap: {}, categoryData: {keys: [], map: {}}, mapData: []
     */
    this.trades = undefined;

    /**
     * order drawings
     * @type {object} orders: [], filledOrders: [], drawings: {}
     */
    this.ordersDrawings = undefined;

    /**
     * trade drawings
     * @type {object} holdings: [], drawings: {}
     */
    this.positionsDrawings = undefined;

    /**
     * trading enabled for the symbol
     * @type {boolean}
     */
    this.isTradingEnable = false;

    /**
     * is chart data load
     * @type {boolean}
     */
    this.isDataLoaded = false;

    /**
     * last defined quantity
     * @type {number}
     */
    this.lastDefinedQty = 0;
};

//region ==================== Public Methods ===============================

infChart.StockTrader.prototype.getOptions = function() {
    return this.tradingOptions;
};

infChart.StockTrader.prototype.onTradeAction = function (action) {
    this._closeAllWindows();
    var validation = this._validateTradeAction(action);
    if (validation.valid) {
        switch (action) {
            case 'mkt-order':
                this._displayMarketOrderWindow();
                break;
            case 'buy-order':
            case 'cover-order':
                this._addLimitOrder(true);
                break;
            case 'sell-order':
            case 'short-order':
                this._addLimitOrder(false);
                break;
            case 'buy-algo-order':
                this._addAlgoLimitOrder(true);
                break;
            case 'sell-algo-order':
                this._addAlgoLimitOrder(false);
                break;
            default:
                break;
        }
    } else {
        this.showMessage(validation.errorTitle, validation.errorMsg, 3000, 400);
    }
};

infChart.StockTrader.prototype.createPanel = function(container, panelConfig) {
    this.panel = container;
    this.panelConfig = panelConfig;

    /**
     * switch displaying summary and detail
     * @see infChart.StockTrader._setView
     * @type {boolean}
     */
    this.summaryView = panelConfig.active !== 'detail';

    /**
     * dictates how the positions table is displayed
     * @see infChart.StockTrader._getOpenPositionsHeaders table headers
     * @see infChart.StockTrader._getOpenPositionsRow table rows
     * @see infChart.StockTrader._updateOpenPositionsRow table rows
     * @type {string}
     */
    this.positionsView = (panelConfig.positions && panelConfig.positions.active) ? panelConfig.positions.active : 'summary';

    /**
     * sort field to sort orders and positions
     * @see infChart.StockTrader._setOrderList
     * @see infChart.StockTrader._setOpenPositions
     * @type {string}
     */
    this.orderListSortField = 'id';

    this.panel.html(infChart.structureManager.trading.getHTML());
    this._bindEvents();
};

/**
 * Set Data and enable functions on displaying Trading panel
 * @param show
 */
infChart.StockTrader.prototype.showTradingView = function (show) {
    if (show) {
        this.container.html(infChart.structureManager.trading.getHTML());
        this._setActionButtons();
        this._setView();
        this._setData();
        this._bindEvents();
        //this._initializeDrawings();
    } else {
        this._onReload();
    }

};

/**
 * Triggers when updating realtime data
 * @param type
 * @param data
 */
infChart.StockTrader.prototype.updateData = function(type, data) {
    switch (type) {
        case 'LP':
            this._onLastPriceChange(data);
            if (!this.isDataLoaded) {
                this._setData();
                this._setTradingToolbarSizeValue();
                this.isDataLoaded = true;
            }
            break;
        case 'OLT':
            if (data) {
                this._onOrderListUpdate(data);
            } else {
                this._setOrderList();
            }
            //this._reloadBreakevenData();
            break;
        case 'HLD':
            if (data) {
                this._onPositionsUpdate(data);
            }
            this._setHoldingsQty();
            break;
        case 'TRD':
            this._onTradeHistoryUpdate(data);
            break;
        case 'BRKE':
            //this._setBreakevenPoint(data);
            break;
        case 'ACS':
            this._setBuyingPower();
            break;
    }
};

/**
 * To be executes when chart symbol changes
 */
infChart.StockTrader.prototype.onResetChartSymbol = function(symbol) {
    var trader = this;
    this.isTradingEnable = trader.tradeDataManager.isTradingEnabled(symbol);

    this.symbol = symbol;
    this.lastPrice = 0;
    this.lastPriceData = [];
    this.holdingsQty = undefined;
    this.buyingPower = undefined;

    this.orderList = undefined;
    this.positions = undefined;
    this.trades = undefined;

    this.isDataLoaded = false;

    if (this.breakEvenPointDrawingId) {
        infChart.drawingUtils.common.tradingUtils.removeDrawing(this.breakEvenPointDrawingId, false);
        this.breakEvenPointDrawingId = undefined;
    }

    this._resetOrders(false);
    this._resetPositions();
    this._showHideTradingToolBar();
    this._onReload();
    //this._setData();
};

infChart.StockTrader.prototype.placeOrder = function(orderId, price, qty, side, type, status, orderObj) {
    var trader = this;
    //chartObj = trader._getChartInstance(), formattedPrice = trader.getFormattedVal(price, 2), thousandSep = infChart.util.getThousandSeparator();
    //price = parseFloat(formattedPrice.replaceAll(thousandSep, ""));
    var order = trader._getOrderObj(trader.symbol, trader.lastPrice, price, qty, side, type, status, orderId, orderObj.tif, orderObj.stopLoss, orderObj.takeProfit, orderObj.algo, orderObj.trigger);

    if (trader.tradingOptions.disableConfirmation) {
        if (!trader._isLocalOrder(order)) {
            trader.tradeDataManager.amendOrder({
                id: trader.chartId,
                orderId: orderId,
                order: order
            }, function(response) {
                trader._onAmend.call(trader, response, order);
            });
        } else {
            trader.tradeDataManager.createOrder({
                id: trader.chartId,
                order: order
            }, function(response) {
                trader._onCreate.call(trader, response, order);
            });
        }
    } else {
        var onConfirm, title;

        if (!trader._isLocalOrder(order)) {
            title = 'Amend Your Order';
            onConfirm = function() {
                trader.tradeDataManager.amendOrder({
                    id: trader.chartId,
                    orderId: orderId,
                    order: order
                }, function(response) {
                    trader._onAmend.call(trader, response, order, true);
                });
            };
        } else {
            title = 'Confirm Your Order';
            onConfirm = function() {
                trader.tradeDataManager.createOrder({
                    id: trader.chartId,
                    order: order
                }, function(response) {
                    trader._onCreate.call(trader, response, order, true);
                });
            };
        }

        trader._loadConfirmationWindow(order, title, onConfirm);
    }
};

/**
 * cancel order
 * @param order
 * @param callback
 */
infChart.StockTrader.prototype.cancelOrder = function(order, callback) {
    var trader = this;
    if (trader.tradingOptions.disableConfirmation || trader._isLocalOrder(order)) {
        trader.tradeDataManager.cancelOrder({
            id: trader.chartId,
            orderId: order.orderId,
            order: order
        }, function(response) {
            trader._onCancel.call(trader, response, order, callback);
        });
    } else {
        var onConfirm = function() {
            trader.tradeDataManager.cancelOrder({
                id: trader.chartId,
                orderId: order.orderId,
                order: order
            }, function(response) {
                trader._onCancel.call(trader, response, order, callback, true);
            });
        };
        trader._loadConfirmationWindow(order, 'Cancel Your Order', onConfirm, undefined, true);
    }
};

infChart.StockTrader.prototype.revertOrder = function(order) {
    if (typeof this.tradingOptions.onOrderRevert === 'function') {
        var orderChanges = this.tradingOptions.onOrderRevert(order.orderId);
        if (orderChanges) {
            this.showOrderOnChart(order, orderChanges, true);
        }
    }
};

infChart.StockTrader.prototype.onOrderChanges = function(orderId, changes) {
    var type;
    if (!orderId) {
        type = infChart.constants.chartTrading.changeType.create;
    } else {
        type = changes ? infChart.constants.chartTrading.changeType.update : infChart.constants.chartTrading.changeType.remove;
    }
    if (typeof this.tradingOptions.onOrderChanges === 'function') {
        orderId = this.tradingOptions.onOrderChanges({
            id: this.chartId,
            orderId: orderId,
            type: type,
            changes: changes
        });
    }
    return orderId;
};

infChart.StockTrader.prototype.updateOrderDrawing = function(orderId, drawingObj) {
    this.ordersDrawings.drawings[orderId] = drawingObj;
};

infChart.StockTrader.prototype.getHoldingsQty = function(isBuy) {
    var holdingsQty;
    if (isBuy || typeof this.holdingsQty === 'undefined') {
        holdingsQty = 100;
    } else {
        holdingsQty = this.holdingsQty;
    }
    return holdingsQty;
};

infChart.StockTrader.prototype.onAnnotationRelease = function() {
    if (this.setDataRequiredAfterUserInteraction) {
        this._setData();
    }
};

/**
 * Display message with given data
 * @param title
 * @param msg
 * @param timeout
 * @param width
 * @returns {*}
 * @private
 */
infChart.StockTrader.prototype.showMessage = function(title, msg, timeout, width) {
    infChart.util.showMessage(this.chartId, msg, timeout, title, width);
};

/**
 * show order object on chart
 * @param orderObj
 * @param changes
 * @param {boolean} revert
 * @param {boolean} preventExtremes
 */
infChart.StockTrader.prototype.showOrderOnChart = function(orderObj, changes, revert, preventExtremes) {
    var self = this,
        chartObj = self._getChartInstance(),
        drawingObj;

    if (chartObj) {
        var chart = chartObj.chart;
        if (chart && chart.activeAnnotation) {
            console.debug("*************################updating on draging################*********************");
        }
        var order = self._getDrawingOrder(orderObj);
        if (self._enableOrderInChart(order)) {
            var orderId = order.orderId,
                index = self.ordersDrawings.orders.indexOf(orderId);
            if (index >= 0) {
                if (!order.isIdea && self._isMarketOrder(order)) { //todo : should we hide/disable or remove(handle amend??)
                    self._removeOrderDrawing(orderId, index);
                } else {
                    if (self._isFilledOrder(order) || self._isCancelledOrder(order)) {
                        self._removeOrderDrawing(orderId, index);
                    } else {
                        drawingObj = self.ordersDrawings.drawings[orderId];
                        if(self._enableOrder(order)) {
                            //order is updated
                            if (self._isNewOrder(order) && typeof orderObj.originalQty === 'undefined' && typeof orderObj.originalPrice === 'undefined' &&
                                infChart.drawingUtils.common.tradingUtils.isLocalChangesAvailable(drawingObj)) {
                                infChart.drawingUtils.common.tradingUtils.removeDrawing(drawingObj);
                                self.ordersDrawings.drawings[orderId] = infChart.drawingUtils.common.tradingUtils.addOrderDrawing(order, chart, self.drawingSettingsContainer, !!order.readOnly, false, order);
                            } else {
                                infChart.drawingUtils.common.tradingUtils.updateOrderDrawing.call(drawingObj, changes, revert, order);
                            }
                        }else{
                            self._removeOrderDrawing(orderId, index);
                        }
                    }
                }
            } else {
                if (order.isIdea || !self._isMarketOrder(order)) {
                    if (self._isLocalOrder(order)) {
                        self._addOrderDrawing(order, false);
                    } else if (self._isNewOrder(order)) {
                        var amend = false,
                            originalOrder = {};
                        if (orderObj.originalPrice) {
                            originalOrder.price = orderObj.originalPrice;
                            amend = true;
                        }
                        if (orderObj.originalQty) {
                            originalOrder.qty = orderObj.originalQty;
                            amend = true;
                        }
                        self._addOrderDrawing(order, amend, (amend ? $.extend({}, order, originalOrder) : order));
                    }
                }
            }

            /**
             * show orders if the order price is outside of the chart y axis
             */
            if (!preventExtremes && order.price && self.ordersDrawings.drawings[orderId]) {
                drawingObj = self.ordersDrawings.drawings[orderId];
                // self.setYAxisExtremes(drawingObj);
                infChart.drawingsManager.setYExtremesOnExternalChanges(drawingObj.stockChartId, drawingObj.annotation);
            }
        }
    }
};

/**
 * Common method to format values
 * @param val
 * @param dp decimal places
 * @returns {*}
 * @private
 */
infChart.StockTrader.prototype.getFormattedVal = function(val, dp) {
    var chartInstance = this._getChartInstance(),
        formatValue;
    
    if(chartInstance) {
        formatValue = this._getChartInstance().formatValue(val, dp);
    } else {
        formatValue = val;
    }
    
    return formatValue;
};

infChart.StockTrader.prototype.getFormattedQuantity = function(val) {
    var dp = this.tradingOptions.qtyInDecimals ? 2 : 0;
    return this.getFormattedVal(val, dp);
};

infChart.StockTrader.prototype.getCurrencies = function(sym) {
    var symbol = sym ? sym : this.symbol;
    var currencyObj;
    if (this.tradingOptions && typeof this.tradingOptions.getCurrencies === 'function') {
        currencyObj = this.tradingOptions.getCurrencies(symbol);
    } else {
        currencyObj = { 'currency': symbol.currency };
        if (symbol.symbolType === "CUR") {
            currencyObj.primary = symbol.symbol.split(symbol.currency)[0].replace(/[^a-zA-Z0-9]/g, '');
        }
    }
    return currencyObj;
};

infChart.StockTrader.prototype.onAnnotationStore = function(drawing) {
    if ((drawing.shape === 'limitOrder' || drawing.shape === 'tradingLine') && !drawing.annotation.options.isIdea) {
        this.onOrderSelect(drawing.annotation.options.order);
    }
};

/**
 * on order select event handler
 * @param {object} order - order object
 */
infChart.StockTrader.prototype.onOrderSelect = function(order) {
    if (this.tradingOptions && typeof this.tradingOptions.onOrderSelect === 'function') {
        this.tradingOptions.onOrderSelect(order);
    }
};

infChart.StockTrader.prototype.setYAxisExtremes = function(drawing) {
    infChart.drawingsManager.setYExtremesOnExternalChanges(this.chartId, drawing.annotation);
};

//infChart.StockTrader.prototype.setYExtremesWhenCloseDrawing = function(drawingObj) {
//    var ann = drawingObj.annotation;
//    var chart = this._getChartInstance();
//    var yAxis = ann.chart.yAxis[ann.options.yAxis];
//    var extremes = ann.options.getExtremesFn.call(drawingObj);
//
//    if (extremes && drawingObj.drawingId == yAxis.infMaxAnnotation ) {
//        if (!chart.isUserDefinedYAxisExtremes()) {
//            yAxis.setExtremes(yAxis.dataMin, extremes.max, true, false);
//        } else {
//            yAxis.setExtremes(yAxis.userMin, extremes.max, true, false);
//        }
//    } else if (extremes && drawingObj.drawingId == yAxis.infMinAnnotation) {
//        if (!chart.isUserDefinedYAxisExtremes()) {
//            yAxis.setExtremes(extremes.min, yAxis.dataMax, true, false);
//        } else {
//            yAxis.setExtremes(extremes.min, yAxis.userMax, true, false);
//        }
//    } else {
//        if (!chart.isUserDefinedYAxisExtremes()) {
//            chart.resetYAxisExtremes(true);
//        }
//    }
//};

/**
 * on size input click
 * @param {object} event - click event
 * @param {HTMLElement} container - trading buy sell container
 */
infChart.StockTrader.prototype.onSizePanelClickEvent = function (event, container) {
    var _self = this;
    var sizeInput = container.find("[inf-ctrl='size']");
    var sizeVal = _self.getRawValue(sizeInput.val(), false); //parseFloat(sizeInput.val().replace(/\,/g, ''));
    container.addClass('edit-size');
    var hasMinOrderQuantity = _self.hasMinimumOrderQuantity(sizeVal);
    if(!hasMinOrderQuantity.isValidQty) {
        sizeVal = hasMinOrderQuantity.minQty;
    } else{
        sizeVal = _self.getRawValue(sizeVal, true);
    }
    sizeInput.val(sizeVal);
};

infChart.StockTrader.prototype.onSizeInputBlurEvent = function (event, container) {
    var _self = this;
    var sizeInput = container.find("[inf-ctrl='size']");
    var sizeVal = sizeInput.val();

    if (sizeVal !== "") {
        if (!isNaN(sizeVal)) {
            sizeVal = _self.getRawValue(sizeVal, false);
            var hasMinOrderQty = _self.hasMinimumOrderQuantity(sizeVal);
            if(hasMinOrderQty.isValidQty) {
                _self.lastDefinedQty = _self.formatOrderQuantity(sizeVal);
            } else {
                _self.lastDefinedQty = hasMinOrderQty.minQty;
            }
            _self.tradeDataManager.saveLastDefineQuantityForPair(_self.symbol, _self.getRawValue(_self.lastDefinedQty, false));
        }
    }
    sizeInput.val(_self.lastDefinedQty);
    container.removeClass('edit-size');
};

infChart.StockTrader.prototype.onSizeInputKeyUPEvent = function (event, container) {
    if (event.keyCode === 13) {
        var sizeInput = container.find("[inf-ctrl='size']");
        sizeInput.blur();
    }
};

infChart.StockTrader.prototype.getChangesOnAlgoOrderUpdates = function(order) {
    var price = this._getAlgoTrendOrderLimitPrice(order.algo.t1, order.algo.t2, order.algo.l1, order.algo.l2);
    var algo = this._convertAlgoOrderObject(order);
    return {
        'price': price,
        'algo': algo
    };
};

infChart.StockTrader.prototype.isOrderExceeded = function(order) {
    var exceeded = false;
    var remainingQty = 0;
    var originalPrice = 0;
    if (order.hasOwnProperty('remainingQty')) {
        remainingQty = order.remainingQty;
    }
    if (order.hasOwnProperty('originalPrice')) {
        originalPrice = order.originalPrice;
    }
    switch (order.side) {
        case infChart.constants.chartTrading.orderSide.buy:
            //exceeded = order.price * order.qty > this.buyingPower;
            exceeded = infChart.drawingUtils.common.tradingUtils.getOrderValueFromOrder(order.price, order.qty, order.side, this.tradingOptions) > this.buyingPower + (remainingQty * originalPrice);
            break;
        case infChart.constants.chartTrading.orderSide.sell:
            //exceeded = order.qty > this.holdingsQty;
            exceeded = order.qty > this.holdingsQty + remainingQty;
            break;
    }
    return exceeded;
};

infChart.StockTrader.prototype.destroy = function() {
    this.orderList = undefined;
    this.positions = undefined;
    this.trades = undefined;

    this._resetOrders(false);
    this._resetPositions();

    if (this.breakEvenPointDrawingId) {
        infChart.drawingUtils.common.tradingUtils.removeDrawing(this.breakEvenPointDrawingId, false);
        this.breakEvenPointDrawingId = undefined;
    }

    this._onReload();

    if (this.orderConfirmationPopup) {
        this.orderConfirmationPopup.remove();
        this.orderConfirmationPopup = undefined;
    }
};

infChart.StockTrader.prototype.formatOrderPrice = function (price) {
    if (this.tradingOptions && typeof this.tradingOptions.formatOrderPrice === 'function') {
        return this.tradingOptions.formatOrderPrice(price);
    } else {
        return this.getFormattedVal(price);
    }
};

infChart.StockTrader.prototype.formatOrderLimitPrice = function (limitPrice) {
    if (this.tradingOptions && typeof this.tradingOptions.formatOrderLimitPrice === 'function') {
        return this.tradingOptions.formatOrderLimitPrice(limitPrice);
    } else {
        return this.getFormattedVal(limitPrice);
    }
};

infChart.StockTrader.prototype.formatOrderValue = function (price, value) {
    if (this.tradingOptions && typeof this.tradingOptions.formatOrderValue === 'function') {
        return this.tradingOptions.formatOrderValue(price, value);
    } else {
        return this.getFormattedVal(value);
    }
};

/**
 * format order quantity
 * @param {number} qty - order size
 * @param {object} order - order obj
 * @returns {string} - formatted quantity
 */
infChart.StockTrader.prototype.formatOrderQuantity = function (qty, order) {
    if (this.tradingOptions && typeof this.tradingOptions.formatOrderQuantity === 'function') {
        return this.tradingOptions.formatOrderQuantity(qty, order);
    } else {
        return this.getFormattedQuantity(qty);
    }
};

/**
 * get raw value
 * @param {string | number} value - formatted
 * @param {boolean} removeScientificNotation - remove e
 * @returns {string | number} - string if removeScientificNotation and has e
 */
infChart.StockTrader.prototype.getRawValue = function (value, removeScientificNotation) {
    var returnVal;
    if(this.tradingOptions && typeof this.tradingOptions.getRawValue === 'function') {
        returnVal = this.tradingOptions.getRawValue(value, removeScientificNotation);
    } else {
        value = value + "";
        if (value.indexOf('M') > 0) {
            returnVal = parseFloat(value.replaceAll(',', '')) * 1000000;
        } else {
            returnVal = value.replaceAll(',', '');
        }
        returnVal = parseFloat(returnVal);
    }
    return returnVal;
};

infChart.StockTrader.prototype.hasMinimumOrderQuantity = function (qty) {
    var returnVal = {
        isValidQty: true,
        minQty: 0
    };
    if (this.tradingOptions && typeof this.tradingOptions.getMinimumOrderQuantity === 'function') {
        var minQty = this.tradingOptions.getMinimumOrderQuantity();
        returnVal = {
            isValidQty: (qty >= minQty),
            minQty: minQty
        }
    } 
    return returnVal;
};


//endregion

//region ==================== HTML structures ==========================

/**
 * Create a Popup with given congiguarations and html
 * @param popupId
 * @param body
 * @param draggableOptions
 * @returns {*|jQuery}
 * @private
 */
infChart.StockTrader.prototype._createPopup = function(popupId, body, draggableOptions) {
    var popup = $("#" + popupId);
    if (popup && popup.length == 0) {
        var html = '<div inf-popup="' + this.chartId + '" class="ts-popup" id="' + popupId + '">' + body + '</div>';
        popup = $(html).appendTo(this.settingsContainer);
        popup.css({ top: 50, left: 200 }).show();

        if (draggableOptions) {
            popup.draggable(draggableOptions);
        }
    } else {
        popup.show();
    }
    return popup;
};

/**
 * Create confirmation Popup
 * @param popupId
 * @param body
 * @param title
 * @param btns
 * @param draggableOptions
 * @param timeout
 * @param width
 * @returns {*}
 * @private
 */
infChart.StockTrader.prototype._createConfirmationPopup = function(popupId, body, title, btns, draggableOptions, timeout, width) {

    var bodyHtml =
        '<div class="modal-dialog"  style="width:' + width + 'px;">' +
        '<div class="modal-content chart-message-pop-up ts-pop-msx pop-formx">' +
        '<div class="modal-header">' +
        '<button type="button" class="close" inf-action="close-popup" data-dismiss="modal">&times;</button>' +
        '<h4 class="modal-title">' + title + '</h4>' +
        '</div>' +
        '<div class="modal-body pop-ms-body">' + body + '</div>' +
        '<div class="modal-footer">';

    if (btns && btns.length > 0) {
        btns.forEach(function(val) {
            bodyHtml += val;
        });
    }
    bodyHtml += '</div></div></div>';

    var popup = this._createPopup(popupId, bodyHtml, draggableOptions);
    var chartCenter = this._getChartCenter();
    var newTop = Math.max(0, chartCenter.top - popup.outerHeight(true) / 2);
    var newLeft = Math.max(0, chartCenter.left - popup.outerWidth(true) / 2);
    popup.css({
        top: newTop,
        left: newLeft
    });
    return popup;
};

//endregion

/**
 * Clear data and views when reload
 */
infChart.StockTrader.prototype._onReload = function() {
    if (this.markeOrderWindow) {
        this.markeOrderWindow.remove();
        this.markeOrderWindow = undefined;
    }
};

/**
 * Retrieve and Set Data of the components
 */
infChart.StockTrader.prototype._setData = function() {
    var self = this,
        chartObj = self._getChartInstance();
    if (chartObj.isUserInteractionInprogress()) {
        self.setDataRequiredAfterUserInteraction = true;
    } else {
        self.setDataRequiredAfterUserInteraction = false;

        self._setOrderList();
        self._setOpenPositionsData(self.symbol);
        self._setHoldingsQty();
        self._setBuyingPower();
        //self._reloadBreakevenData();
    }
};

infChart.StockTrader.prototype._reloadBreakevenData = function(symbol) {
    var self = this;

    this.tradeDataManager.getBreakevenPoint({ 'symbol': self.symbol }, function(brkEvnPoint) {
        self._setBreakevenPoint(brkEvnPoint);
    }, this);
};

infChart.StockTrader.prototype._setBreakevenPoint = function(brkevnPoint) {
    var _self = this;
    if (brkevnPoint) {
        if (!_self.breakevenPoint || !(brkevnPoint.point == _self.breakevenPoint.point && brkevnPoint.type == _self.breakevenPoint.type)) {

            var chartObj = _self._getChartInstance(),
                addDrawing = function(brkevnPoint) {
                    var orderDrawing = {
                        "shape": "breakEvenLine",
                        "x": 3,
                        "yValue": brkevnPoint.point,
                        "text": "",
                        "subType": brkevnPoint.type,
                        "width": chartObj.chart.plotWidth
                    };

                    var drawing = infChart.tradingManager.createTradingDrawing(chartObj.chart, orderDrawing);
                    _self.breakEvenPointDrawingId = drawing.drawingId;
                    return drawing;
                };

            _self.breakevenPoint = brkevnPoint;
            if (!_self.breakEvenPointDrawingId) {
                drawing = addDrawing(brkevnPoint);
            } else {
                var drawing = infChart.drawingsManager.getDrawingObject(_self.chartId, _self.breakEvenPointDrawingId);
                if (drawing) {
                    drawing.updateOptions({ "yValue": brkevnPoint.point, "subType": brkevnPoint.type }, true);
                } else {
                    drawing = addDrawing(brkevnPoint);
                }
            }
            _self.setYAxisExtremes(drawing);
        }
    } else {
        _self.breakevenPoint = undefined;
        if (_self.breakEvenPointDrawingId) {
            infChart.drawingUtils.common.tradingUtils.removeDrawing(_self.breakEvenPointDrawingId, true);
            _self.breakEvenPointDrawingId = undefined;
        }
    }
};

/**
 * Set the Trading view
 */
infChart.StockTrader.prototype._setView = function() {
    if (this.summaryView) {
        this.panel.find("[inf-cont='trade-summary']").show();
        this.panel.find("[inf-cont='trade-detail']").hide();
    } else {
        this.panel.find("[inf-cont='trade-summary']").hide();
        this.panel.find("[inf-cont='trade-detail']").show();
    }
};

infChart.StockTrader.prototype._bindEvents = function() {
    var _self = this;
    //this.panel.find("[inf-cont=action-btns] [inf-action]").off('click');
    infChart.util.bindEvent(this.panel.find("[inf-cont=action-btns] [inf-action]"), 'click', function() {
        _self.onTradeAction($(this).attr("inf-action"));
    }, true, true);
};

/**
 * Close all the windows created for this chart.
 * @private
 */
infChart.StockTrader.prototype._closeAllWindows = function() {
    if(this.markeOrderWindow) {
        this.markeOrderWindow.hide();
    }
    if (this.drawingSettingsContainer.find('div[data-rel="limit-order"]').length > 0) {
        this.drawingSettingsContainer.find('div[data-rel="limit-order"]').each(function(i, container) {
            $(container).find("[data-inf-action='close']").trigger('click');
        });
    }
};

infChart.StockTrader.prototype._setActionButtons = function() {
    var _self = this;

    this.panel.find("[inf-cont=action-btns] [inf-action]").hide();
    var chartSymbolKey = _self.symbol.symbolId;
    var actionBtnContainer = _self.panel.find("[inf-cont=action-btns]");

    var holdingsQty = 0;
    if (this.positions && this.positions.categoryData && this.positions.categoryData[chartSymbolKey]) {
        holdingsQty = this.positions.categoryData[chartSymbolKey].netQty;
    }

    actionBtnContainer.find("[inf-action=mkt-order]").show();
    if (holdingsQty > 0) {
        actionBtnContainer.find("[inf-action=buy-order]").show();
        actionBtnContainer.find("[inf-action=sell-order]").show();
        actionBtnContainer.find("[inf-action=brkt-order]").show();
        actionBtnContainer.find("[inf-action=cover-order]").hide();
        actionBtnContainer.find("[inf-action=short-order]").hide();
    } else {
        actionBtnContainer.find("[inf-action=short-order]").show();
        actionBtnContainer.find("[inf-action=sell-order]").hide();
        if (holdingsQty < 0) {
            actionBtnContainer.find("[inf-action=cover-order]").show();
            actionBtnContainer.find("[inf-action=brkt-order]").show();
            actionBtnContainer.find("[inf-action=buy-order]").hide();
            actionBtnContainer.find("[inf-action=staddle-order]").hide();
            actionBtnContainer.find("[inf-action=strangle-order]").hide();
        } else {
            actionBtnContainer.find("[inf-action=buy-order]").show();
            actionBtnContainer.find("[inf-action=staddle-order]").show();
            actionBtnContainer.find("[inf-action=strangle-order]").show();
            actionBtnContainer.find("[inf-action=cover-order]").hide();
            actionBtnContainer.find("[inf-action=brkt-order]").hide();
        }
    }

};

//region ==================== Real-time updates================================

/**
 * Changes on realtime price updates
 * @private
 */
infChart.StockTrader.prototype._onLastPriceChange = function(data) {
    var _self = this;
    var chartObj = _self._getChartInstance();
    var dp = chartObj.getDecimalPlaces(_self.symbol);

    _self.lastPrice = data[4];

    _self.lastPriceData = data;
    if (_self.markeOrderWindow) {
        _self.markeOrderWindow.find("[inf-ref=last-val]").html(_self.getFormattedVal(_self.lastPrice, dp));

        var mktValue = _self.markeOrderWindow.find("[inf-action=mkt-value]").val();
        if (mktValue && mktValue.trim() != "") {
            _self._setMarketValueOnMarketOrder();
        }
    }
    _self._setTradingToolbarValues();
};

/**
 * Update Orders on Real-time orderlist updates
 * @private
 */
infChart.StockTrader.prototype._onOrderListUpdate = function(data) {
    if (data) {
        var result = this.tradeDataManager.updateOrderList({}, data);
        this._updateOrderList(result);
    }
};

/**
 * Update positions on Real-time updates
 * @private
 */
infChart.StockTrader.prototype._onPositionsUpdate = function(data) {
    if (data) {
        var result = this.tradeDataManager.updatePositions({}, data);
        this._updatePositions(result);
    }

};

/**
 * Update positions on Real-time updates
 * @private
 */
infChart.StockTrader.prototype._onTradeHistoryUpdate = function(data) {
    if (data) {
        var result = this.tradeDataManager.updateTradeHistory({}, data);
        this._updateTradeHistory(result);
    }

};

//endregion ==================== Real-time updates================================

//region ==================== Market orders===============================

infChart.StockTrader.prototype._setMarketValueOnMarketOrder = function() {
    if (this.markeOrderWindow) {
        var chartObj = this._getChartInstance();
        var dp = chartObj.getDecimalPlaces(this.symbol);
        var el = this.markeOrderWindow.find("[inf-action=mkt-value]");
        var thousandSep = infChart.util.getThousandSeparator();
        var shares = parseFloat(this.markeOrderWindow.find("[inf-action=mkt-shares]").val().replaceAll(thousandSep, ""));
        if (!isNaN(shares) && this.lastPrice) {
            $(el).val(this.getFormattedVal(this._getOrderValue(shares), dp));
        }
    }
};

/**
 * Market order window and features implementation
 * @private
 */
infChart.StockTrader.prototype._displayMarketOrderWindow = function() {
    var _self = this;
    var chartObj = _self._getChartInstance();

    if (!_self.markeOrderWindow) {

        _self.markeOrderWindow = _self._createPopup(_self.chartId + '_mktOrder', infChart.structureManager.trading.getMarketOrderHTML(), {
            handle: ".order-window",
            containment: "body"
        });

        var onValueChange = function(el) {
            var thousandSep = infChart.util.getThousandSeparator();
            var amount = parseFloat(_self.markeOrderWindow.find("[inf-action=mkt-value]").val().replaceAll(thousandSep, ""));
            if (!isNaN(amount) && _self.lastPrice) {
                //todo : fix this
                var shares = Math.floor(amount / _self.lastPrice);
                $(el).val(_self.getFormattedVal(shares, 0, true));
                _self._setMarketValueOnMarketOrder();
            }
        };

        var sharesInput = _self.markeOrderWindow.find("[inf-action=mkt-shares]");
        var valueInput = _self.markeOrderWindow.find("[inf-action=mkt-value]");

        infChart.util.bindEvent(sharesInput, 'click', function() {
            onValueChange(this);
        }, true, true);

        sharesInput.keyup(function(e) {
            _self._setMarketValueOnMarketOrder();
        });

        infChart.util.bindEvent(valueInput, 'click', function() {
            _self._setMarketValueOnMarketOrder();
        }, true, true);

        valueInput.keyup(function(e) {
            onValueChange(sharesInput[0]);
        });

        var orderBtn = _self.markeOrderWindow.find("[inf-action=order]");
        //orderBtn.off('click');
        infChart.util.bindEvent(orderBtn, 'click', function() {
            var side = $(this).attr("inf-order-side"),
                shares = _self.markeOrderWindow.find("[inf-action=mkt-shares]").val();
            var qty = _self.tradingOptions.qtyInDecimals ? parseFloat(shares) : parseInt(shares, 10);
            if (!isNaN(shares)) {
                var order = {
                    symbol: _self.symbol,
                    side: parseInt(side, 10),
                    qty: qty,
                    type: infChart.constants.chartTrading.orderTypes.Market,
                    tif: infChart.constants.chartTrading.tifTypes.GTD,
                    price: _self.lastPrice,
                    ltp: _self.lastPrice
                };

                var onConfirm = function() {
                    _self.tradeDataManager.createOrder({ id: _self.chartId, order: order }, function(response) {
                        var msg;
                        if (typeof response === 'undefined' || response.errorMsg) { //error
                            msg = "Order execution failed.";
                        } else {
                            msg = "Order successfully sent for execution";
                            order.id = response.orderId;
                            order.tradeTime = new Date(new Date().getTime() - (1000 * 60 * 60 * 6)); //temp fix to show executed order

                            var position = _self._getDrawingPosition(order);

                            _self.positionsDrawings.holdings.push(position);
                            _self.positionsDrawings.drawings[position.holdingId] = infChart.drawingUtils.common.tradingUtils.addHoldingDrawing(position, chartObj.chart, true);
                            _self.markeOrderWindow.hide();

                        }
                        _self.showMessage(chartObj, msg, _self._getOrderDescription(order), 3000, 400);
                    });
                };

                _self._loadConfirmationWindow(order, 'Confirm Your Order', onConfirm);
            }
        }, true, true);

        infChart.util.bindEvent(_self.markeOrderWindow.find("[inf-action='close-popup']"), "click", function(event) {
            popup.hide();
            event.preventDefault();
        }, true, true);
    } else {
        _self.markeOrderWindow.show();
    }

    var chartCenter = _self._getChartCenter();
    var newTop = Math.max(0, chartCenter.top - _self.markeOrderWindow.find('div[inf-cont="market-order"]').outerHeight(true) / 2);
    var newLeft = Math.max(0, chartCenter.left - _self.markeOrderWindow.find('div[inf-cont="market-order"]').outerWidth(true) / 2);
    _self.markeOrderWindow.css({
        top: newTop,
        left: newLeft
    });
    var dp = chartObj.getDecimalPlaces(_self.symbol);

    _self.markeOrderWindow.find("[inf-ref=last-val]").html(_self.getFormattedVal(_self.lastPrice, dp));
    _self.markeOrderWindow.find("[inf-action=mkt-shares]").val(_self.getHoldingsQty(true));
    _self._setMarketValueOnMarketOrder();

};

/**
 * Display Order Confirmation Window on Buy/Sell
 * @param order - {
                        symbol: chartObj.dataManager.getSymbol(chartObj.symbol),
                        side: parseInt(side),
                        qty: shares,
                        type: infChart.constants.chartTrading.orderTypes.Market,
                        tif: infChart.constants.chartTrading.tifTypes.GTD,
                        price: _self.lastPrice
                    }
 * @param title
 * @param onConfirm - <optional> function
 * @param onAbandon - <optional> function
 * @param isCancel
 * @private
 */
infChart.StockTrader.prototype._loadConfirmationWindow = function(order, title, onConfirm, onAbandon, isCancel) {
    var _self = this;
    var chartObj = _self._getChartInstance();
    if (_self.hideConfirmation) {
        if (typeof onConfirm == "function") {
            onConfirm.call(_self);
        }
    } else {
        var id = chartObj.id + "_orderConfirmation";

        var chartTemp = this._getChartInstance();
        var chartContainer = $("#" + chartTemp.id);

        var submitBtnText = isCancel ? 'Cancel Order' : 'Submit';
        var btns = [
            '<button inf-ref="abandon-order" class="btn btn-default" type="submit" data-dismiss="modal">Abandon</button>',
            '<button inf-ref="submit-order" class="btn btn-default" type="submit" data-dismiss="modal" >' + submitBtnText + '</button>'
        ];

        _self.orderConfirmationPopup = _self._createConfirmationPopup(id, infChart.structureManager.trading.getOrderConfirmationHTML(), title, btns, undefined, undefined, 300);

        chartContainer.mask();

        var disable = _self.orderConfirmationPopup.find("[inf-ref=disable]");
        infChart.util.bindEvent(disable, 'click', function() {
            _self.hideConfirmation = $(this).is(':checked');
        }, true, true);

        var abandonBtn = _self.orderConfirmationPopup.find("[inf-ref=abandon-order]");
        infChart.util.bindEvent(abandonBtn, 'click', function() {
            _self.settingsContainer.find('#' + chartObj.id + "_orderConfirmation").remove();
            chartContainer.unmask();
            if (typeof onAbandon === 'function') {
                onAbandon();
            }
        }, true, true);

        var submitBtn = _self.orderConfirmationPopup.find("[inf-ref=submit-order]");
        infChart.util.bindEvent(submitBtn, 'click', function() {
            _self.settingsContainer.find('#' + id).remove();
            chartContainer.unmask();
            if (typeof onConfirm === 'function') {
                onConfirm();
            }
        }, true, true);

        infChart.util.bindEvent(_self.orderConfirmationPopup.find("[inf-action=close-popup]"), "click", function(event) {
            _self.settingsContainer.find('#' + id).remove();
            chartContainer.unmask();
            event.preventDefault();
        }, true, true);

        _self._setOrderConfirmationData(order, title);
    }

};

/**
 * Return description to show on order placement
 * @param order
 * @returns {*}
 * @private
 */
infChart.StockTrader.prototype._getOrderDescription = function(order) {
    var desc = order.side == infChart.constants.chartTrading.orderSide.buy ? infChart.manager.getLabel("label.buy") : infChart.manager.getLabel("label.sell");
    desc += ' ' + this.getFormattedQuantity(order.qty) + ' ' + infChart.manager.getLabel("label.sharesOf") + ' ' + order.symbol.symbol;
    return desc;
};

/**
 * Set order data on confirmation window
 * @param order
 * @param title
 * @private
 */
infChart.StockTrader.prototype._setOrderConfirmationData = function(order, title) {
    var _self = this;
    if (_self.orderConfirmationPopup) {
        var chartObj = _self._getChartInstance();
        var dp = chartObj.getDecimalPlaces(_self.symbol);
        var desc = _self._getOrderDescription(order);

        _self.orderConfirmationPopup.find('div.modal-header .modal-title').text(title);

        var orderPrice = _self.getFormattedVal(order.price, dp),
            orderType = infChart.manager.getLabel("label.orderTypesShort." + order.type);

        _self.orderConfirmationPopup.find("[inf-ref=orderDesc]").html(desc);
        _self.orderConfirmationPopup.find("[inf-ref=orderPrice]").html(orderPrice + ' ' + orderType);
        //_self.orderConfirmationPopup.find("[inf-ref=tifType]").html(infChart.manager.getLabel("label.tifTypes." + order.tif));
        if (order.oto) {
            _self.orderConfirmationPopup.find("[inf-ref=oto]").parent('div').show();
            _self.orderConfirmationPopup.find("[inf-ref=oto]").html(order.oto);
        } else {
            _self.orderConfirmationPopup.find("[inf-ref=oto]").parent('div').hide();
        }
    }
};

//endregion ==================== Market orders===============================

infChart.StockTrader.prototype._setTradingToolbarValues = function() {
    var _self = this,
        data = this.lastPriceData,
        chartObj = _self._getChartInstance(),
        dp = chartObj.getDecimalPlaces(_self.symbol),
        bid = data && data[6] && _self.formatOrderPrice(data[6], dp) || '--',
        ask = data && data[7] && _self.formatOrderPrice(data[7], dp) || '--';

    var container = $('#' + _self.chartId);
    //if (this.toolbar && this.toolbar.length > 0) {
    if (bid) {
        container.find("[inf-ref='sell']").html(bid);
        container.find("[inf-ref='buy']").html(ask);
    }
    //}
};

infChart.StockTrader.prototype._setTradingToolbarSizeValue = function() {
    var _self = this,
        data = _self.lastPriceData,
        container = $('#' + _self.chartId),
        sizeInput = container.find("[inf-ref='size']");

        if (data && data[6]) {
            _self.tradeDataManager.getLastDefinedQuantityForPair(_self.symbol, data[6], function(response) {
                _self.lastDefinedQty = response;
                var formattedQty = _self.formatOrderQuantity(_self.lastDefinedQty);
                sizeInput.val(formattedQty);
            });
        } else {
            sizeInput.val('--');
        }
};

/**
 * Hide trading tool bar when trading is not available.
 * show trading toolbar and set trading toolbar values when trading available.
 */
infChart.StockTrader.prototype._showHideTradingToolBar = function() {
    var _self = this;
    var container = $('#' + _self.chartId);
    var tradingCtrls = container.find("[inf-pnl='tb-trading']");
    var tradingCtrlsCompact = container.find("[inf-ctrl='tradeControlCompact']");
    var tradingCtrlsBuy = container.find("[inf-ctrl='buy']");
    var tradingCtrlsSell = container.find("[inf-ctrl='sell']");
    if (_self.isTradingEnable) {
        this._setTradingToolbarValues();
        tradingCtrls.removeClass('d-none');
        tradingCtrlsCompact.removeClass('d-none');
        tradingCtrlsBuy.removeClass('d-none');
        tradingCtrlsSell.removeClass('d-none');
    } else {
        tradingCtrls.addClass('d-none');
        tradingCtrlsCompact.addClass('d-none');
        tradingCtrlsBuy.addClass('d-none');
        tradingCtrlsSell.addClass('d-none');
    }
};

infChart.StockTrader.prototype._addLimitOrder = function(buy) {
    var _self = this;

    var price;
    if (buy) {
        price = _self.lastPriceData[7] ? _self.lastPriceData[7] : _self.lastPrice;
    } else {
        price = _self.lastPriceData[6] ? _self.lastPriceData[6] : _self.lastPrice;
    }

    var order = {
        symbol: _self.symbol,
        side: buy ? infChart.constants.chartTrading.orderSide.buy : infChart.constants.chartTrading.orderSide.sell,
        price: price,
        ltp: _self.lastPrice,
        type: infChart.constants.chartTrading.orderTypes.Limit
    };

    _self.tradeDataManager.createOrder({
        id: _self.chartId,
        order: order
    }, function(orderObj) {
        var rOrder = _self._getDrawingOrder(orderObj);
        this._addOrderDrawing(rOrder, false);
        // _self.setYAxisExtremes(drawingObject);
        if (typeof this.tradingOptions.onCreateLocalOrder === 'function') {
            this.tradingOptions.onCreateLocalOrder(orderObj);
        }
    }, _self);
};

/**
 * add algo trend order
 * t1, t2 is generated as below
 * if user set x-axis extremes > now time then
 * t1 = extremes.min + 10% of range
 * t2 = extremes.max - 10% of range
 * else
 * t1 = extremes.min + 20% of range
 * t2 = extremes.max + 10% of range
 * l1, l2 will be calculated using regression
 * @param {boolean} buy buy or sell order
 */
infChart.StockTrader.prototype._addAlgoLimitOrder = function(buy) {
    var _self = this;

    var chartObj = _self._getChartInstance(),
        chart = chartObj.chart,
        yAxis = chart.yAxis[0];

    var price;
    if (buy) {
        price = _self.lastPriceData[7] ? _self.lastPriceData[7] : _self.lastPrice;
    } else {
        price = _self.lastPriceData[6] ? _self.lastPriceData[6] : _self.lastPrice;
    }

    var extremes = chartObj.getRange(),
        now = this._changeTimeToMatchGMT(new Date().getTime(), true);
    var max = extremes.userMax || extremes.dataMax,
        min = extremes.userMin || extremes.dataMin;
    var t1, t2;
    if (max > now) {
        t1 = Math.round(min + (max - min) * 0.1);
        t2 = Math.round(max - (max - min) * 0.1);
        if (t2 < now) {
            t2 = Math.round(max);
        }
    } else {
        t1 = Math.round(min + (max - min) * 0.2);
        t2 = Math.round(max + (max - min) * 0.1);
        if (t2 < now) {
            t2 = Math.round(now + (now - max) * 0.1);
        }
    }
    var regressionData = infChart.math.calculateLinearRegression(chart, price, t1, t2);
    if (regressionData.calcData.points.length > 0) {
        //time period has data points and can proceed regression channel
        var regressionChannelData = infChart.math.calculateRegressionChannel(regressionData.calcData.points, regressionData.startPointY, regressionData.endPointY);
        var startPointY, endPointY;
        if (buy) {
            startPointY = regressionChannelData.lower.startPointY;
            endPointY = regressionChannelData.lower.endPointY;
        } else {
            startPointY = regressionChannelData.upper.startPointY;
            endPointY = regressionChannelData.upper.endPointY;
        }

        var refY = yAxis.toPixels(price);
        var l1 = yAxis.toValue(refY + startPointY),
            l2 = yAxis.toValue(refY + endPointY);

        var order = {
            symbol: _self.symbol,
            side: buy ? infChart.constants.chartTrading.orderSide.buy : infChart.constants.chartTrading.orderSide.sell,
            price: _self._getAlgoTrendOrderLimitPrice(t1, t2, l1, l2),
            ltp: _self.lastPrice,
            type: infChart.constants.chartTrading.orderTypes.AlgoTrend,
            algo: {
                type: 'trend',
                t1: t1,
                t2: t2,
                l1: _self._getYValue(l1, true),
                l2: _self._getYValue(l2, true)
            }
        };

        order.algo = _self._convertAlgoOrderObject(order);

        _self.tradeDataManager.createOrder({
            id: _self.chartId,
            order: order
        }, function(orderObj) {
            var rOrder = _self._getDrawingOrder(orderObj);
            this._addOrderDrawing(rOrder, false);
            // _self.setYAxisExtremes(drawingObject);
        }, _self);
    } else {
        //time period (t1-t2) has no data points, so need to show error message.
        this.showMessage("Error", "Invalid Time Period", 3000, 400);
    }

};

infChart.StockTrader.prototype._getAlgoTrendOrderLimitPrice = function(t1, t2, l1, l2) {
    var now = this._changeTimeToMatchGMT(new Date().getTime(), true);
    var a = Math.abs(t1 - t2);
    var b = Math.abs(l1 - l2);
    var c = Math.abs(t1 - now), price;
    if (a) {
        var d = (b / a) * c;
        if (l2 < l1) {
            price = l1 - d;
        } else {
            price = l1 + d;
        }
    }
    var chart = this._getChartInstance();
    return chart.getBaseValue(price, chart.isLog, chart.isCompare, chart.isPercent);
};

infChart.StockTrader.prototype._changeTimeToMatchGMT = function(time, isAdd) {
    var timeZoneDiff = 60 * 60 * 1000 * (+(this._getTimeZone()));
    return isAdd ? time + timeZoneDiff : time - timeZoneDiff;
};

infChart.StockTrader.prototype._getYValue = function(value, isBase) {
    var chart = this._getChartInstance(), rValue;
    if(isBase){
        rValue = chart.getBaseValue(value, chart.isLog, chart.isCompare, chart.isPercent)
    }else{
        rValue = chart.convertBaseYValue(value, chart.isLog, chart.isCompare, chart.isPercent);
    }
    return rValue;
};

infChart.StockTrader.prototype._getAlgoOrderObject = function(order) {
    var algoObj;
    if (order.type === infChart.constants.chartTrading.orderTypes.AlgoTrend) {
        algoObj = {
            type: 'trend',
            t1: this._changeTimeToMatchGMT(order.algo.t1, true),
            t2: this._changeTimeToMatchGMT(order.algo.t2, true),
            l1: order.algo.l1, //this._getYValue(order.algo.l1, false),
            l2: order.algo.l2 //this._getYValue(order.algo.l2, false)
        };
    } else {
        algoObj = order.algo;
    }
    return algoObj;
};

infChart.StockTrader.prototype._convertAlgoOrderObject = function(order) {
    var algoObj;
    if (order.type === infChart.constants.chartTrading.orderTypes.AlgoTrend) {
        algoObj = {
            type: 'trend',
            t1: this._changeTimeToMatchGMT(order.algo.t1, false),
            t2: this._changeTimeToMatchGMT(order.algo.t2, false),
            l1: order.algo.l1, //this._getYValue(order.algo.l1, true),
            l2: order.algo.l2 //this._getYValue(order.algo.l2, true)
        };
    } else {
        algoObj = order.algo;
    }
    return algoObj;
};

infChart.StockTrader.prototype._getTimeZone = function() {
    return this._getChartInstance().dataManager.getTimeZone();
};

/**
 * Set portfolio data
 * @param data
 */
infChart.StockTrader.prototype._setPortfolioData = function(data) {
    if (data && data.accountDetails) {
        this.buyingPower = data.accountDetails.availableMargin;
        if(this.panel) {
            var dataRow = data.accountDetails;
            this.panel.find("[inf-ref=netPortfolioVal]").html(this.getFormattedVal(dataRow.portfolioValuation, 2));
            this.panel.find("[inf-ref=availableMargin]").html(this.getFormattedVal(dataRow.availableMargin, 2));
            this.panel.find("[inf-ref=usedMargin]").html(this.getFormattedVal(dataRow.utilizedMargin, 2));
        }
    }
};

//region ==================== orderList ===============================

/**
 * Set orderlist data
 * @param data
 */
infChart.StockTrader.prototype._setOrderList = function(data) {
    //var table = this.panel.find("[inf-ref=orderList]");
    //var html = '', _self = this;

    var self = this;

    var onData = function(data) {
        if (data && data.columns && data.mapData) {

            //var colMap = data.colMap;
            //var sortField = _self.orderListSortField;
            //var chartObj = _self._getChartInstance();
            //
            //function compare(a, b) {
            //    if (a[sortField] < b[sortField])
            //        return -1;
            //    if (a[sortField] > b[sortField])
            //        return 1;
            //    return 0;
            //}
            //
            //data.mapData.sort(compare);

            this.orderList = data;

            //$.each(data.mapData, function (k, row) {
            //    if(_self._isNewOrder(row)) {
            //        html += _self._getOrderListRow(chartObj, row, colMap);
            //    }
            //});
            //
            //table.html(html);
            //
            //table.find("tr").off('click');
            //
            //table.find("tr").on('click', function () {
            //    if (_self.orderList.categoryData && _self.orderList.categoryData.map) {
            //        var orderId = $(this).attr("inf-order-id");
            //        var row = _self.orderList.categoryData.map[orderId][0];
            //        _self._setChartSymbol(row);
            //    }
            //});

            this._showOrdersOnChart(this.orderList, false);
        }
    };

    self.tradeDataManager.getOrderList({
        chartId: self.chartId,
        symbol: self.symbol,
        filter: {
            status: [infChart.constants.chartTrading.orderStatus.local, infChart.constants.chartTrading.orderStatus.open].join(',')
        }
    }, onData, self);

};

/**
 * Returns the HTML for order list row
 * @param chartObj
 * @param row
 * @param colMap
 * @returns {string}
 * @private
 */
infChart.StockTrader.prototype._getOrderListRow = function(chartObj, row, colMap) {
    var _self = this,
        html = '';
    var symbol = _self.tradeDataManager.getChartSymbol(row, colMap);
    var dp = chartObj.getDecimalPlaces(symbol);

    var sidecolor = (row.side == infChart.constants.chartTrading.orderSide.buy) ? "gd-color-1" : "bd-color-1";
    html += '<tr inf-order-id="' + row.id + '"><td ol-col="side" class="' + sidecolor + '">' + infChart.manager.getLabel("label.orderSide." + row.side) + '</td>';
    html += '<td ol-col="qty">' + _self.getFormattedQuantity(row.qty) + '</td>';
    html += '<td ol-col="symbol">' + row.symbol + '</td>';
    html += '<td ol-col="type"> @' + infChart.manager.getLabel("label.orderTypes." + row.type) + '</td>';
    html += '<td ol-col="price">' + _self.getFormattedVal(row.price, dp) + '</td>';
    html += '<td ol-col="tif">' + infChart.manager.getLabel("label.tifTypesShort." + row.tif) + '</td>';
    html += '<td ol-col="value">' + (colMap.currency ? row.currency : '') + _self.getFormattedVal(row.price * row.qty, 2) + '</td></tr>';

    return html;
};

/**
 * Update ordet list with given new data and reset order list data
 * @param allData
 */
infChart.StockTrader.prototype._updateOrderList = function(allData) {
    //var table = this.panel.find("[inf-ref=orderList]");
    //var html = '', _self = this;

    var data = allData.diff;

    if (data && data.columns && data.mapData) {

        //var colMap = data.colMap;
        //var sortField = colMap[_self.orderListSortField];
        //var chartObj = _self._getChartInstance();
        //
        //_self._sortData(data.mapData, sortField);
        //
        //$.each(data.mapData, function (k, row) {
        //    var symbol = _self.dataManager.getChartSymbol(row);
        //    var dp = chartObj.getDecimalPlaces(symbol);
        //    if (_self.orderList && _self.orderList.categoryData.map[row.id]) {
        //        // update
        //        var rowEl = table.find("[inf-order-id=" + row.id + "]");
        //        rowEl.find("[ol-col=qty]").html(_self.getFormattedVal(row.qty, 0, true));
        //        rowEl.find("[ol-col=price]").html(_self.getFormattedVal(row.price, dp, true));
        //        rowEl.find("[ol-col=tif]").html(infChart.manager.getLabel("label.tifTypesShort." + row.tif));
        //        rowEl.find("[ol-col=value]").html((colMap.currency ? row.currency : '') + _self.getFormattedVal(row.price * row.qty, 0, true));
        //    } else {
        //        if(_self._isNewOrder(row)) {
        //            $(_self._getOrderListRow(chartObj, row, colMap)).appendTo(table);
        //        }
        //    }
        //});
        //
        //table.find("tr").off('click');
        //table.find("tr").on('click', function () {
        //    if (_self.orderList.categoryData && _self.orderList.categoryData.map) {
        //        var orderId = $(this).attr("inf-order-id");
        //        var row = _self.orderList.categoryData.map[orderId][0];
        //        _self._setChartSymbol(row);
        //    }
        //});

        this._showOrdersOnChart(data, true);
        this.orderList = allData.all;
    }
};

//endregion ================== orderList ===============================

//region ==================== open positions ===============================

/**
 * Request position data and set
 */
infChart.StockTrader.prototype._setOpenPositionsData = function(symbol) {
    //if (this.positionsView == 'summary') {
    //    this.dataManager.getPositions({symbol: symbol}, this.setOpenPositions, this);
    //}
    if (this.tradingOptions && this.tradingOptions.showPositions == true) {
        this.tradeDataManager.getTradeHistory({ symbol: symbol }, this._setTradeHistory, this);
    }
};

/**
 * Set open position data
 * @param data
 */
infChart.StockTrader.prototype._setOpenPositions = function(data) {
    if (this.panel) {
        var table = this.panel.find("[inf-ref=positions]");
        var html = '',
            _self = this;
        if (data && data.columns && data.categoryData) {

            html = "<thead><tr>" + this._getOpenPositionsHeaders() + "<tr></thead><tbody>";
            var colMap = data.colMap;
            var sortField = colMap[_self.orderListSortField];

            var dataset = (this.positionsView == 'summary') ? data.mapData : data.categoryData;
            var category = (this.positionsView != 'summary');
            this._sortData(dataset, sortField, category);
            this.positions = data;

            $.each(dataset, function(k, row) {
                html += _self._getOpenPositionsRow(row);
            });

            html += '</tbody>';
            table.html(html);
            table.find("tr").off('click');
            table.find("tr").on('click', function() {
                if (_self.positions.categoryData && _self.positions.categoryData.map) {
                    var rowId = $(this).attr("inf-row-key-value");
                    var row = _self.positions.categoryData.map[rowId][0];
                    _self._setChartSymbol(row);
                }
            });
        }

        this._setActionButtons();
    }
};

/**
 * Update open positions real-time
 * @param allData
 */
infChart.StockTrader.prototype._updatePositions = function(allData) {
    if (this.panel) {
        var data = allData.diff,
            table = this.panel.find("[inf-ref=positions]");
        var html = '',
            _self = this;
        if (data.columns && data.categoryData) {
            var colMap = data.colMap;
            var sortField = _self.orderListSortField;

            var dataset = (this.positionsView == 'summary') ? data.mapData : data.categoryData;
            var category = (this.positionsView != 'summary');
            this._sortData(dataset, sortField, category);

            $.each(dataset, function(k, row) {
                var chartSymbol = _self.tradeDataManager.getChartSymbol(row, colMap);
                var key = "";
                if (chartSymbol) {
                    key = chartSymbol.symbolId;
                }


                if (_self.positions && _self.positions.categoryData.map[key]) {
                    _self._updateOpenPositionsRow(row, table);

                } else {
                    html += _self._getOpenPositionsRow(row);
                }
            });

            $(html).appendTo(table);
            table.find("tr").off('click');
            table.find("tr").on('click', function() {
                if (_self.positions.categoryData && _self.positions.categoryData.map) {
                    var rowId = $(this).attr("inf-row-key-value");
                    var row = _self.positions.categoryData.map[rowId][0];
                    _self._setChartSymbol(row);
                }
            });

            this.positions = allData.all;
            this._setActionButtons();
        }
    }
};

/**
 * returns the header html for open positions
 * @returns {string}
 * @private
 */
infChart.StockTrader.prototype._getOpenPositionsHeaders = function() {
    var html = '',
        _self = this;
    switch (this.positionsView) {
        case 'summary':
            html = '<th scope="col"><span original="SYM">SYM</span></th>' +
                '<th scope="col"><span original="QTY">QTY</span></th>' +
                '<th scope="col"><span original="Basis">Basis</span></th>' +
                '<th scope="col"><span original="G/L">G/L</span></th>' +
                '<th scope="col"><span original="% G/L">%G/L</span></th>';
            break;
        case 'lots':
            html = '<th scope="col" class="tfc-trade-date"><span original="Date">Date</span></th>' +
                '<th scope="col"><span original="QTY">QTY</span></th>' +
                '<th scope="col"><span original="Basis">Basis</span></th>' +
                '<th scope="col"><span original="G/L">G/L</span></th>' +
                '<th scope="col"><span original="% G/L">%G/L</span></th>';
            break;
        case 'performance':
            html = '<th scope="col"><span original="SYM">SYM</span></th>' +
                '<th scope="col"><span original="Cost">Cost</span></th>' +
                '<th scope="col"><span original="Value">Value</span></th>' +
                '<th scope="col"><span original="G/L">G/L</span></th>' +
                '<th scope="col"><span original="% G/L">%G/L</span></th>';
            break;
        case 'maintanace':
            html = '<th scope="col" class="tfc-col-qty"><span original="QTY">QTY</span></th>' +
                '<th scope="col"><span original="Basis">Basis</span></th>' +
                '<th scope="col" class="tfc-trade-actions" colspan="2"><span original="Protections">Protections</span></th>' +
                '<th scope="col"></th>';
            break;
        default:
            break;
    }
    return html;
};

/**
 * Returns the row html for open positions
 * @param data
 * @returns {string}
 * @private
 */
infChart.StockTrader.prototype._getOpenPositionsRow = function(data) {
    var html = '',
        _self = this;
    var qty = 0,
        basis = 0,
        gnl = 0,
        gnlPercent = 0;

    switch (this.positionsView) {
        case 'summary':
            var symbol = this.tradeDataManager.getChartSymbol(data);
            var chartObj = _self._getChartInstance();
            var dp = chartObj.getDecimalPlaces(symbol);
            var key = symbol.symbolId;

            qty = data.netQty;
            basis = 0; // TODO
            gnl = data.totalProfit;
            gnlPercent = 0; // TODO
            html = '<tr inf-row-key="' + infChart.util.escapeSpecialCharacters(key) + '" inf-row-key-value="' + key + '"><td ><span ps-col="symbol">' + data.symbol + '</span></td>' +
                '<td ><span ps-col="qty">' + _self.getFormattedQuantity(qty) + '</span></td>' +
                '<td ><span ps-col="basis">' + _self.getFormattedVal(basis, dp) + '</span></td>' +
                '<td ><span ps-col="gnl">' + _self.getFormattedVal(gnl, dp) + '</span></td>' +
                '<td ><span ps-col="gnlp">' + _self.getFormattedVal(gnlPercent, 2) + '</span></td></tr>';
            break;
        case 'lots':
            break;
        case 'performance':
            break;
        case 'maintanace':
            break;
        default:
            break;
    }
    return html;
};

/**
 * update the row of open positions
 * @param data
 * @param table
 * @returns {string}
 * @private
 */
infChart.StockTrader.prototype._updateOpenPositionsRow = function(data, table) {
    var html = '',
        _self = this;
    var qty = 0,
        basis = 0,
        gnl = 0,
        gnlPercent = 0;

    switch (this.positionsView) {
        case 'summary':
            var symbol = this.tradeDataManager.getChartSymbol(data);
            var chartObj = _self._getChartInstance();
            var dp = chartObj.getDecimalPlaces(symbol);
            var key = symbol.symbolId;

            var rowEl = table.find("[inf-row-key=" + key + "]");
            qty = data.netQty;
            basis = 0; // TODO
            gnl = data.totalProfit;
            gnlPercent = 0; // TODO
            rowEl.find("[ps-col=qty]").html(_self.getFormattedQuantity(qty));
            rowEl.find("[ps-col=basis]").html(_self.getFormattedVal(basis, dp));
            rowEl.find("[ps-col=gnl]").html(_self.getFormattedVal(gnl, dp));
            rowEl.find("[ps-col=gnlp]").html(_self.getFormattedVal(gnlPercent, 2));
            break;
        case 'lots':
            break;
        case 'performance':
            break;
        case 'maintanace':
            break;
        default:
            break;
    }
    return html;
};

//endregion ================== open positions ===============================

//region ==================== trades  ===============================

/**
 * Set open position data
 * @param data
 */
infChart.StockTrader.prototype._setTradeHistory = function(data) {
    this.trades = data;
    this._showPositionsOnChart(this.trades, true);
};

/**
 * Update open Trade History real-time
 * @param allData
 */
infChart.StockTrader.prototype._updateTradeHistory = function(allData) {
    // TODO ::

};

//endregion

//region ==================== Drawings ====================

//region ==================== order drawing =======================

/**
 * Reset order drawings
 */
infChart.StockTrader.prototype._resetOrders = function(setExtremes) {
    if (this.ordersDrawings) {
        var drawings = this.ordersDrawings.drawings;
        for (var key in drawings) {
            if (drawings.hasOwnProperty(key)) {
                infChart.drawingUtils.common.tradingUtils.removeDrawing(drawings[key], setExtremes);
            }
        }
    }

    this.ordersDrawings = {
        orders: [],
        filledOrders: [],
        drawings: {}
    }
};

/**
 * Get drawing sub type of the order
 * @param orderSide
 * @returns {number}
 * @private
 */
infChart.StockTrader.prototype._getDrawingSubType = function(orderSide) {
    return (orderSide == infChart.constants.chartTrading.orderSide.buy) ? infChart.constants.chartTrading.orderSide.buy : infChart.constants.chartTrading.orderSide.sell;
};

/**
 * Returns the order object to be sent the drawing
 * @param order
 * @returns {{orderId: *, orderSide: (*|string|string|string), drawingSubType, qty: *, tif: (*|tif), type: *, status: *, time: *, account: *, price: *, trigger: *}}
 */
infChart.StockTrader.prototype._getDrawingOrder = function(order) {
    var orderObj = {
        orderId: order.id,
        symbol: order.symbol,
        side: order.side,
        qty: order.qty,
        price: order.price,
        type: order.type,
        tif: order.tif,
        status: order.status,
        time: order.orderTime,
        oto: order.oto,
        trigger: order.trigger
    };
    // if (order.hasOwnProperty('takeProfitPrice')) {
    //     orderObj.takeProfit = order.takeProfitPrice > 0 ? order.takeProfitPrice : 0;
    //     orderObj.takeProfitPrice = order.takeProfitPrice;
    // }
    // if (order.hasOwnProperty('stopLossPrice')) {
    //     orderObj.stopLoss = order.stopLossPrice > 0 ? order.stopLossPrice : 0;
    //     orderObj.stopLossPrice = order.stopLossPrice;
    // }
    if (order.hasOwnProperty('fillQty')) {
        orderObj.fillQty = order.fillQty;
    }
    if (order.hasOwnProperty('remainingQty')) {
        orderObj.remainingQty = order.remainingQty;
    }
    if (order.hasOwnProperty('algo')) {
        orderObj.algo = this._getAlgoOrderObject(order);
    }
    if (order.hasOwnProperty('locallyAmmended')) {
        orderObj.locallyAmmended = order.locallyAmmended;
    }
    if (order.hasOwnProperty('originalPrice')) {
        orderObj.originalPrice = order.originalPrice;
    }
    if (order.hasOwnProperty('originalQty')) {
        orderObj.originalQty = order.originalQty;
    }
    if (order.hasOwnProperty('parentId')) {
        orderObj.parentId = order.parentId;
    }
    if(order.hasOwnProperty('subOrders')){
        orderObj.subOrders = order.subOrders;
    }
    if (order.hasOwnProperty('isIdea')) {
        orderObj.isIdea = !!order.isIdea;
    }
    if (order.hasOwnProperty('readOnly')) {
        orderObj.readOnly = !!order.readOnly;
    }
    if (order.hasOwnProperty('subOrderIndex')) {
        orderObj.subOrderIndex = order.subOrderIndex;
    }
    return orderObj;
};

/**
 * To check whether given order is placed on the current symbol of the chart
 * @param order
 * @returns {boolean}
 */
infChart.StockTrader.prototype._enableOrderInChart = function(order) {
    var chart = this._getChartInstance();
    return chart.checkEquivalentSymbols(this.symbol, order.symbol);
};

/**
 * remove order drawing
 * @param {string|number} orderId
 * @param {number} index
 * @private
 */
infChart.StockTrader.prototype._removeOrderDrawing = function(orderId, index) {
    infChart.drawingUtils.common.tradingUtils.removeDrawing(this.ordersDrawings.drawings[orderId]);
    this.ordersDrawings.orders.splice(index, 1);
    delete this.ordersDrawings.drawings[orderId];
};

/**
 * add order drawing
 * @param {object} order
 * @param {boolean} amend
 * @param {object} originalOrder - only required if its an open order
 * @param {string} localOrderId
 * @private
 */
infChart.StockTrader.prototype._addOrderDrawing = function(order, amend, originalOrder, localOrderId) {
    if (this._enableOrder(order, localOrderId)) {
        this.ordersDrawings.orders.push(order.orderId);
        this.ordersDrawings.drawings[order.orderId] = infChart.drawingUtils.common.tradingUtils.addOrderDrawing(
            order, this._getChartInstance().chart, this.drawingSettingsContainer, (!!order.readOnly || this._isMarketOrder(order)), amend, originalOrder);
        this._addSubOrderDrawings(order, amend, originalOrder, localOrderId);
    }
};

/**
 * add sub order drawing
 * @param {object} order
 * @param {boolean} amend
 * @param {object} originalOrder - only required if its an open order
 * @param {string} localOrderId
 * @private
 */
infChart.StockTrader.prototype._addSubOrderDrawings = function(order, amend, originalOrder, localOrderId){
    if(order.subOrders){
        var self = this;
        order.subOrders.forEach(function(subOrder){
            switch(subOrder.type){
                case infChart.constants.chartTrading.orderTypes.stopLoss:
                case infChart.constants.chartTrading.orderTypes.takeProfit:
                    self._addOrderDrawing(self._getDrawingOrder(subOrder), amend, originalOrder, localOrderId);
                    break;
            }
        });
    }
}


/**
 * add order drawing
 * @param {object} order
 * @return {boolean}
 * @private
 */
infChart.StockTrader.prototype._enableOrder = function(order, localOrderId) {
    var show = true;
    if (this.tradingOptions && typeof this.tradingOptions.enableOrder === 'function') {
        show = this.tradingOptions.enableOrder(order, localOrderId);
    }
    return show;
};

/**
 * Display given orders on the chart and remove if filled orders are available on updates
 * @param data
 * @param isUpdate
 */
infChart.StockTrader.prototype._showOrdersOnChart = function(data, isUpdate) {
    if (!isUpdate || !this.ordersDrawings) {
        this._resetOrders(true);
    }
    var self = this;
    //todo : handle set y axis extremes which can be called multiple times
    data.mapData.forEach(function(orderObj) {
        self.showOrderOnChart(orderObj, undefined, false, true);
    });
    // TODO :: validate min/max ann and skip if they are not changed
    infChart.drawingsManager.resetYExtremes(this.chartId);
    //self._getChartInstance().setYAxisExtremes(true);
};

//endregion

//region ==================== positions drawing ===================

infChart.StockTrader.prototype._resetPositions = function(data) {
    if (this.positionsDrawings) {
        var drawings = this.positionsDrawings.drawings;
        for (var key in drawings) {
            if (drawings.hasOwnProperty(key)) {
                infChart.drawingUtils.common.tradingUtils.removeDrawing(drawings[key], false);
            }
        }
    }

    this.positionsDrawings = {
        holdings: [],
        drawings: {}
    }
};

infChart.StockTrader.prototype._getDrawingPosition = function(order) {
    return {
        tradeId: order.id,
        holdingId: order.orderId,
        orderSide: order.side,
        drawingSubType: this._getDrawingSubType(order.side),
        qty: order.quantity,
        tif: order.tifType,
        type: order.type,
        status: order.status,
        time: new Date(order.tradeTime).getTime(),
        account: order.clientId,
        price: order.price,
        cost: order.quantity * order.price
    };
};

infChart.StockTrader.prototype._showPositionsOnChart = function(data) {
    if (this.tradingOptions && this.tradingOptions.showPositions == true) {
        this._resetPositions();
        var self = this;

        var chartObj = this._getChartInstance();
        if (chartObj) {
            if (data) {

                var chart = chartObj.chart;
                var baseSymbolKey = self.symbol.symbolId;

                var basSymbolTrades = data.categoryData && data.categoryData.map && data.categoryData.map[baseSymbolKey];
                if (basSymbolTrades && basSymbolTrades.length > 0) {
                    var groupedTrades = {},
                        max, maxOrderId, min, minOrderId; //trades are grouped by order id - to limit no of drawings in chart
                    $.each(basSymbolTrades, function(i, orderObj) {

                        var position = self._getDrawingPosition(orderObj);
                        var orderId = position.holdingId;

                        if (groupedTrades[orderId]) {
                            groupedTrades[orderId].qty += position.qty;
                            groupedTrades[orderId].cost += position.cost;
                            groupedTrades[orderId].price = groupedTrades[orderId].cost / groupedTrades[orderId].qty;
                        } else {
                            groupedTrades[orderId] = position;
                        }

                        if (typeof max === 'undefined' || max < groupedTrades[orderId].price) {
                            max = groupedTrades[orderId].price;
                            maxOrderId = orderId;
                        }
                        if (typeof min === 'undefined' || min > groupedTrades[orderId].price) {
                            min = groupedTrades[orderId].price;
                            minOrderId = orderId;
                        }
                    });

                    for (var orderId in groupedTrades) {
                        if (groupedTrades.hasOwnProperty(orderId)) {
                            var index = self.positionsDrawings.holdings.indexOf(orderId);

                            if (index > -1) {
                                //position is updated
                                infChart.drawingUtils.common.tradingUtils.updateHoldingDrawing.call(self.positionsDrawings.drawings[orderId], groupedTrades[orderId]);
                            } else {
                                self.positionsDrawings.holdings.push(orderId);
                                self.positionsDrawings.drawings[orderId] = infChart.drawingUtils.common.tradingUtils.addHoldingDrawing(
                                    groupedTrades[orderId], chart, true);
                            }
                        }
                    }

                    if (minOrderId && maxOrderId) {
                        if (minOrderId === maxOrderId) {
                            self.setYAxisExtremes(self.positionsDrawings.drawings[minOrderId].annotation);
                        } else {
                            self.setYAxisExtremes(self.positionsDrawings.drawings[minOrderId].annotation);
                            self.setYAxisExtremes(self.positionsDrawings.drawings[maxOrderId].annotation);
                        }
                    }

                }
            } else {
                infChart.util.console.log("chart.core => tradingOptions undefined");
            }
        }
    }
};

//endregion

//endregion

/**
 * get order type using order price and ltp
 * @param type
 * @param side buy | sell
 * @param orderPrice price
 * @param lastPrice ltp
 * @returns {*} - stop or limit
 */
infChart.StockTrader.prototype._getOrderType = function(type, side, orderPrice, lastPrice) {
    //var orderType;
    //if ((side === infChart.constants.chartTrading.orderSide.buy && orderPrice > lastPrice) ||
    //    (side === infChart.constants.chartTrading.orderSide.sell && orderPrice < lastPrice)) {
    //    orderType = infChart.constants.chartTrading.orderTypes.Stop;
    //} else {
    //    orderType = infChart.constants.chartTrading.orderTypes.Limit;
    //}
    //return orderType;
    return type; //infChart.constants.chartTrading.orderTypes.Limit;
};

/**
 * create order object
 * @param symbol symbol uid
 * @param lastPrice ltp
 * @param price order price
 * @param qty order quantity
 * @param side order side
 * @param type type
 * @param status order status
 * @param orderId order id
 * @param tif
 * @param stopLoss
 * @param takeProfit
 * @param algo
 * @param {number} trigger - stop order trigger price
 * @returns {{orderId: *, symbol: *, side: *, qty: *, price: *, ltp: *, type: *, tif: *, takeProfitPrice: *, takeProfit: *, stopLoss: *, stopLossPrice: *, oto: string, depOrd: Array, status: *, trigger: *}}
 */
infChart.StockTrader.prototype._getOrderObj = function(symbol, lastPrice, price, qty, side, type, status, orderId, tif, stopLoss, takeProfit, algo, trigger) {
    var orderType = this._getOrderType(type, side, price, lastPrice);
    var formattedPrice = parseFloat(this.getFormattedVal(price, 2).replace(/\,/g, ''));

    var oto = '',
        depOrd = [],
        os, ot;
    if (takeProfit > 0) {
        if (side === infChart.constants.chartTrading.orderSide.buy) {
            oto += 'Sell ';
        } else {
            oto += 'Buy ';
        }
        os = side === infChart.constants.chartTrading.orderSide.buy ? infChart.constants.chartTrading.orderSide.sell : infChart.constants.chartTrading.orderSide.buy;
        ot = this._getOrderType(type, os, takeProfit, lastPrice);

        oto += this.getFormattedVal(takeProfit, 2) + ' ' + infChart.manager.getLabel("label.orderTypesShort." + ot);

        depOrd.push({
            symbol: symbol,
            side: os,
            qty: qty,
            price: takeProfit,
            ltp: lastPrice,
            type: ot,
            tif: tif,
            status: 0
        });
    }
    if (stopLoss > 0) {
        if (oto) {
            oto += ' / ';
        }
        if (side === infChart.constants.chartTrading.orderSide.buy) {
            oto += 'Sell ';
        } else {
            oto += 'Buy ';
        }
        os = side === infChart.constants.chartTrading.orderSide.buy ? infChart.constants.chartTrading.orderSide.sell : infChart.constants.chartTrading.orderSide.buy;
        ot = this._getOrderType(type, os, stopLoss, lastPrice);

        oto += this.getFormattedVal(stopLoss, 2) + ' ' + infChart.manager.getLabel("label.orderTypesShort." + ot);

        depOrd.push({
            symbol: symbol,
            side: os,
            qty: qty,
            price: stopLoss,
            ltp: lastPrice,
            type: ot,
            tif: tif,
            status: 0
        });
    }

    var order = {
        orderId: orderId,
        symbol: symbol,
        side: side,
        qty: qty,
        price: price,
        ltp: lastPrice,
        type: orderType,
        tif: tif,
        takeProfitPrice: takeProfit > 0 ? takeProfit : 0,
        takeProfit: takeProfit > 0 ? takeProfit : 0,
        stopLoss: stopLoss > 0 ? stopLoss : 0,
        stopLossPrice: stopLoss > 0 ? stopLoss : 0,
        algo: algo,
        oto: oto,
        depOrd: depOrd,
        status: status,
        trigger: trigger
    };

    var algoObj = this._convertAlgoOrderObject(order);
    order.algo = algoObj;
    return order;
};

/**
 * get order obj from response
 * @param response
 * @param lastPrice ltp
 * @returns {{symbol: *, orderId: *, side: *, qty: *, price: *, ltp: *, type: *, tif: *, status: *}}
 */
infChart.StockTrader.prototype._getOrderObjFromResponse = function(response, lastPrice) {
    var order = response.orderDetails;
    order.symbol = response.symbol;
    order.id = response.orderId;
    order.status = response.orderDetails.remainingQty > 0 ? infChart.constants.chartTrading.orderStatus.open : infChart.constants.chartTrading.orderStatus.completed;

    return this._getDrawingOrder(order);
};

//region ==================== Util Methods ====================

/**
 * True if order is market order
 * @param order
 * @returns {boolean}
 * @private
 */
infChart.StockTrader.prototype._isMarketOrder = function(order) {
    return order.type === infChart.constants.chartTrading.orderTypes.Market;
};

/**
 * True is order is completed
 * @param order
 * @returns {boolean}
 * @private
 */
infChart.StockTrader.prototype._isFilledOrder = function(order) {
    return order.status === infChart.constants.chartTrading.orderStatus.completed;
};

/**
 * True if order is cancelled
 * @param order
 * @returns {boolean}
 * @private
 */
infChart.StockTrader.prototype._isCancelledOrder = function(order) {
    return order.status === infChart.constants.chartTrading.orderStatus.cancelled || order.status === infChart.constants.chartTrading.orderStatus.rejected;
};

/**
 * True if order is open
 * @param order
 * @returns {boolean}
 * @private
 */
infChart.StockTrader.prototype._isLocalOrder = function(order) {
    return order.status === infChart.constants.chartTrading.orderStatus.local;
};

/**
 * True if order is open
 * @param order
 * @returns {boolean}
 * @private
 */
infChart.StockTrader.prototype._isNewOrder = function(order) {
    return order.status === infChart.constants.chartTrading.orderStatus.open;
};

/**
 * validate trader with lastPrice, buyingPower and holdingsQty
 * @param  {String} action
 * @returns {object}
 * @private
 */
infChart.StockTrader.prototype._validateTradeAction = function(action) {
    var isValid = false;
    var errorTitle = "Trading Disabled";
    var errorMsg = "Trading not supported!";
    if (this.isTradingEnable) {
        if (this.lastPrice > 0) {
            switch (action) {
                case 'buy-order':
                case 'buy-algo-order':
                case 'cover-order':
                    if (this.buyingPower <= 0) {
                        errorMsg = "Insufficient Funds";
                    } else {
                        isValid = true;
                    }
                    break;
                case 'sell-order':
                case 'sell-algo-order':
                case 'short-order':
                    if (this.holdingsQty <= 0) {
                        errorMsg = "Insufficient Holdings";
                    } else {
                        isValid = true;
                    }
                    break;
                default:
                    errorMsg = "Unsupported Action";
                    break;
            }
        } else {
            errorTitle = "Price Data Unavailable";
            errorMsg = "No price data received for " + this.symbol.symbol;
        }
    }
    return { valid: isValid, errorTitle: errorTitle, errorMsg: errorMsg };
};

/**
 * Common method to sort data
 * @param data
 * @param sortField
 * @param category
 * @private
 */
infChart.StockTrader.prototype._sortData = function(data, sortField, category) {
    function compare(a, b) {
        if (a[sortField] < b[sortField])
            return -1;
        if (a[sortField] > b[sortField])
            return 1;
        return 0;
    }

    if (category) {
        for (var val in data) {
            if (data.hasOwnProperty(val)) {
                data[val].sort(compare);
            }
        }
    } else {
        data.sort(compare);
    }
};

/**
 * Set chart symbol to the provided chart symbol
 * @param dataRow
 * @returns {*}
 * @private
 */
infChart.StockTrader.prototype._setChartSymbol = function(dataRow) {
    if (dataRow) {
        var chartTemp = this._getChartInstance();
        var symbol = this.tradeDataManager.getChartSymbol(dataRow);
        if (symbol) {
            chartTemp.setSymbol(symbol, true, true);
        }
    }
};

/***
 * Returns the top, left values of the center of chart
 * @returns {{top: number, left: number}}
 * @private
 */
infChart.StockTrader.prototype._getChartCenter = function() {
    var chartTemp = this._getChartInstance();
    var chartDiv = $(chartTemp.chart.container);
    var chartContainer = $(chartTemp.getContainer());
    var left = (chartContainer.width() - (this.panel ? this.panel.width() : 0)) - chartDiv.width() / 2;
    var top = chartDiv.height() / 2;
    return { top: top, left: left };
};

/**
 * Returns the value of the order given
 * @param qty
 * @returns {number}
 * @private
 */
infChart.StockTrader.prototype._getOrderValue = function(qty) {
    if (!isNaN(qty) && this.lastPrice) {
        return qty * this.lastPrice;
    }
};

infChart.StockTrader.prototype._setHoldingsQty = function() {
    var self = this;
    var onData = function(response) {
        if (response && response.rows && response.rows.length > 0) {
            var holdingsQty = response.rows[0][response.columns.indexOf('netQty')];
            if (holdingsQty < 0) {
                self.holdingsQty = -1 * holdingsQty;
            } else {
                self.holdingsQty = holdingsQty;
            }
        } else {
            self.holdingsQty = undefined;
        }
    };

    self.tradeDataManager.getHoldings(self.symbol, onData, self);
};

infChart.StockTrader.prototype._setBuyingPower = function() {
    this.tradeDataManager.getPortFolioSummary(this.symbol, this._setPortfolioData, this);
};

infChart.StockTrader.prototype._getChartInstance = function() {
    return infChart.manager.getChart(this.chartId);
};

//endregion

infChart.StockTrader.prototype._onCreate = function(response, order, showSuccessMsg) {
    if (typeof response === 'undefined' || response.errorMsg) { //error
        this.showMessage(response.errorMsg, this._getOrderDescription(order), 3000, 400);
    } else {
        var newOrder = this._getOrderObjFromResponse(response, this.lastPrice);
        if (response.orderDetails.stopLoss) {
            var slOrder = this._getOrderObjFromResponse(response.orderDetails.stopLoss, this.lastPrice);
            this._addOrderDrawing(slOrder, false, slOrder);
        }
        if (response.orderDetails.takeProfit) {
            var tpOrder = this._getOrderObjFromResponse(response.orderDetails.takeProfit, this.lastPrice);
            this._addOrderDrawing(tpOrder, false, tpOrder);
        }

        var orderId = order.orderId,
            index = this.ordersDrawings.orders.indexOf(orderId);
        if (index !== -1) { //order create update has been received, hence local order removed
            this._removeOrderDrawing(orderId, index);

            if (this.ordersDrawings.orders.indexOf(newOrder.orderId) === -1) {
                this._addOrderDrawing(newOrder, false, newOrder, orderId);
                // this.setYAxisExtremes(drawingObject);
            }
        }

        if (showSuccessMsg) {
            this.showMessage("Order successfully sent.", this._getOrderDescription(order), 3000, 400);
        }
    }
};

infChart.StockTrader.prototype._onAmend = function(response, order, showSuccessMsg) {
    if (typeof response === 'undefined' || response.errorMsg) {
        this.showMessage(response.errorMsg, this._getOrderDescription(order), 3000, 400);
    } else {
        var orderId = order.orderId;
        var index = this.ordersDrawings.orders.indexOf(orderId);
        if (index !== -1) { //else order already filled
            if (order.hasOwnProperty('algo')) {
                order.algo = this._getAlgoOrderObject(order);
            }
            if (orderId !== response.orderId) {
                this._removeOrderDrawing(orderId, index);
                order.orderId = response.orderId;
                this._addOrderDrawing(order, false, order);
            } else {
                var drawingObject = this.ordersDrawings.drawings[orderId];
                if(this._enableOrder(order)) {
                    infChart.drawingUtils.common.tradingUtils.removeDrawing(drawingObject, false);
                    this.ordersDrawings.drawings[order.orderId] = infChart.drawingUtils.common.tradingUtils.addOrderDrawing(order, this._getChartInstance().chart, this.drawingSettingsContainer, false, false, order);
                }else{
                    this._removeOrderDrawing(orderId, index);
                }
            }
            // this.setYAxisExtremes(drawingObj);
        }

        if (showSuccessMsg) {
            this.showMessage("Order successfully amended.", this._getOrderDescription(order), 3000, 400);
        }
        //trader._reloadBreakevenData();
    }
};

infChart.StockTrader.prototype._onCancel = function(response, order, showSuccessMsg) {
    if (typeof response === 'undefined' || response.errorMsg) { //success
        this.showMessage(response.errorMsg, this._getOrderDescription(order), 3000, 400);
    } else {
        var index = this.ordersDrawings.orders.indexOf(response.orderId);
        if (index !== -1) { //else order update received as cancelled
            this._removeOrderDrawing(response.orderId, index);
        }
        if (showSuccessMsg) {
            this.showMessage("Order successfully cancelled.", this._getOrderDescription(order), 3000, 400);
        }
        //trader._reloadBreakevenData();
    }
};