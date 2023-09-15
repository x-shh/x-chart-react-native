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
infChart.tradingManager = (function() {

    var _traders = {},
        _listeners = {};

    var _createTrader = function(chartId, providerObj, options) {
        var stockTrader;
        if (_traders[chartId]) {
            stockTrader = _traders[chartId];
        } else {
            _setConstants();
            var dataManager = infChart.tradingDataManagerFactory.createTradingDataManager(providerObj);
            stockTrader = _createTraderInstance(chartId, dataManager, options);
            _traders[chartId] = stockTrader;
        }
        return stockTrader;
    };

    /**
    * @param {object} chartObj
    * @param {object} drawingSettingsContainer - chart container
    * @param {object} drawingProperties
    * @returns drawing object
    */
    var _createTradingDrawing = function (chartObj, drawingProperties) {

        var drawing;
        if (drawingProperties) {
            var shapeId = drawingProperties.shape;
        };
        var drawingId = infChart.util.generateUUID();

        var chartInstance = infChart.manager.getChart(infChart.manager.getContainerIdFromChart(chartObj.renderTo.id));
        var drawingSettingsContainer = $(infChart.structureManager.getContainer(chartInstance.getContainer(), "trade"));

        switch (shapeId) {
            case 'tradingLine':
                drawing = new infChart.tradingLineDrawing(drawingId, chartObj, shapeId, drawingSettingsContainer);
                break;
            case 'tradingLabel':
                drawing = new infChart.tradingLabelDrawing(drawingId, chartObj, shapeId, drawingSettingsContainer);
                break;
            case 'holdingLine':
                drawing = new infChart.holdingLineDrawing(drawingId, chartObj, shapeId, drawingSettingsContainer);
                break;
            case 'limitOrder':
                drawing = new infChart.limitOrderDrawing(drawingId, chartObj, shapeId, drawingSettingsContainer);
                break;
            case 'upperLimit':
                drawing = new infChart.upperLimitDrawing(drawingId, chartObj, shapeId, drawingSettingsContainer);
                break;
            case 'lowerLimit':
                drawing = new infChart.lowerLimitDrawing(drawingId, chartObj, shapeId, drawingSettingsContainer);
                break;
            case 'breakEvenLine':
                drawing = new infChart.breakEvenLineDrawing(drawingId, chartObj, shapeId, drawingSettingsContainer);
                break;
            case 'algoLine':
                drawing = new infChart.algoLineDrawing(drawingId, chartObj, shapeId, drawingSettingsContainer);
                break;
        }
        return infChart.drawingsManager.drawDrawingFromProperties(drawing, chartObj, drawingSettingsContainer, drawingProperties, drawing.drawingId);
    };

    var _createTraderInstance = function(chartId, dataManager, options) {
        var chartInstance = infChart.manager.getChart(chartId),
            container = chartInstance.getContainer(),
            settingsContainer = $(infChart.structureManager.getContainer(container, "trade"));

        var stockTrader = new infChart.StockTrader(chartId, dataManager, options, settingsContainer, settingsContainer);

        _listeners[chartId] = [];

        _listeners[chartId].push({
            method: 'setSymbol',
            id: chartInstance.registerForEvents('setSymbol', function(symbol) {
                stockTrader.onResetChartSymbol(symbol);
            })
        });

        _listeners[chartId].push({
            method: 'onReadHistoryDataLoad',
            id: chartInstance.registerForEvents('onReadHistoryDataLoad', function(data) {
                if (data && data.length > 0) {
                    //var lastPrice = data[data.length - 1][4];
                    stockTrader.updateData('LP', data[data.length - 1]);
                }
            })
        });

        _listeners[chartId].push({
            method: 'onUpdateChartTick',
            id: chartInstance.registerForEvents('onUpdateChartTick', function(data) {
                if (data && data.length > 0) {
                    //var lastPrice = data[data.length - 1][4];
                    stockTrader.updateData('LP', data[data.length - 1]);
                }
            })
        });

        _listeners[chartId].push({
            method: 'destroy',
            id: chartInstance.registerForEvents('destroy', function() {
                if (typeof stockTrader.destroy === 'function') {
                    stockTrader.destroy();
                }
            })
        });
        
        return stockTrader;
    };

    var _getTrader = function(chartId) {
        return _traders[chartId];
    };

    var _destroyTrader = function(chartId) {
        if (_traders[chartId]) {
            var stockTrader = _traders[chartId],
                chart = infChart.manager.getChart(chartId);
            _listeners[chartId].forEach(function(val) {
                chart.removeRegisteredEvent(val.method, val.id);
            });
            if (typeof stockTrader.destroy === 'function') {
                stockTrader.destroy();
            }
            delete _traders[chartId];
        }
    };

    var _setConstants = function() {
        infChart.constants.chartTrading = {};
        var highchartTheme = infChart.themeManager.getTheme();

        infChart.constants.chartTrading.orderSide = {
            buy: 1,
            sell: 2,
            BuyMinus: 3,
            SellPlus: 4,
            SellShort: 5,
            SellShortExempt: 6,
            Undisclosed: 7,
            Cross: 8,
            CrossShort: 9
        };

        infChart.constants.chartTrading.orderTypes = {
            Market: 1,
            Limit: 2,
            Stop: 3,
            StopLimit: 4,
            MarketOnClose: 5,
            WithOrWithout: 6,
            LimitOrBetter: 7,
            LimitWithOrWithout: 8,
            OnBasis: 9,
            AlgoTrailing: 10,
            AlgoTrend: 11,
            stopLoss: 14,
            takeProfit: 15
        };

        infChart.constants.chartTrading.tifTypes = {
            GTC: 1, //Good Til Cancel
            OPG: 2, //market-on-open (MOO) or limit-on-open(LOO)
            IOC: 3, //Immediate or Cancel
            FOK: 4, //Fill Or Kill
            GTX: 5,
            GTD: 6 //Good Til Date
        };

        infChart.constants.chartTrading.orderStatus = {
            local: 0,
            open: 1,
            completed: 2,
            cancelled: 3,
            rejected: 4
        };

        infChart.constants.chartTrading.changeType = {
            create: 1,
            update: 2,
            remove: 3
        };

        infChart.constants.chartTrading.theme = infChart.util.merge({
            buyColor: "#52ac62",
            sellColor: "#d00a20",
            holdingLine: {
                upColor: "#52ac62",
                downColor: "#d00a20",
                label: {
                    fill: "rgb(255,255,255)"
                }
            },
            tradingLine: {
                opacity: 1,
                buyColor: "#52ac62",
                sellColor: "#d00a20",
                padding: 3,
                height: 14,
                label: {
                    fill: "rgb(255,255,255)",
                    fontColor: "#ffffff",
                    stroke: "#ffffff",
                    slFillColor: "#E96B5E", // stop loss order label fill color
                    tpFillColor: "#6ABA5E" // take profit order label fill color
                },
                cancelColor: "#f0ad4e",
                cancelFontColor: "#ffffff",
                revertColor: "#f0ad4e",
                revertFontColor: "#ffffff",
                transmitColor: "#337ab7",
                transmitFontColor: "#ffffff"
            }
        }, highchartTheme && highchartTheme.chartTrading);

    };

    var _onOrderUpdates = function(chartId, order, changes, revert) {
        var trader = _getTrader(chartId);
        if(trader){
            if (!order) {
                trader.updateData('OLT');
            } else {
                trader.showOrderOnChart(order, changes, revert);
            }
        }
    };

    var _onHoldingUpdates = function(chartId) {
        var trader = _getTrader(chartId);
        trader.updateData('HLD');
    };

    var _onAccountSummaryUpdates = function(chartId) {
        var trader = _getTrader(chartId);
        trader.updateData('ACS');
    };

    var _onTradeControlUpdates = function (chartId, action) {
        _getTrader(chartId).onTradeAction(action);
    };

    var _onAnnotationStore = function(chartId, drawing) {
        var trader = _getTrader(chartId);
        trader.onAnnotationStore(drawing);
    };

    var _onAnnotationRelease = function(chartId, drawing) {
        var trader = _getTrader(chartId);
        trader.onAnnotationRelease(drawing);
    };

    /**
     * Set trading buttons in toolbar
     * @param {*} element
     * @param {*} settings
     */
    var _setTradingToolbarHTML = function (element, settings) {
        var container = $(infChart.structureManager.getContainer(element[0], 'tradingToolbar'));
        container.addClass('chart-buy-sell-button clearfix');

        if (settings.tradingTb && settings.tradingTb.length > 0) {
            settings.tradingTb.forEach(function (tradingKey) {
                if (settings.config[tradingKey]) {
                    var tradeControlOptions = settings.config[tradingKey].options;
                    var html = infChart.structureManager.trading.getTradingGridHTML(tradingKey, tradeControlOptions);
                    if(html != '') {
                        container.html(html);
                    }

                    // var html = '';
                    // infChart.util.forEach(tradeControlOptions, function (i, key) {
                    //     html += _getTradingOptionHTML(key);
                    // });

                    // switch (tradeControlOptions.length) {
                    //     case 2:
                    //         container.addClass('chart-buy-sell-button-inner-content items-2');
                    //         break;
                    //     case 3:
                    //         container.addClass('chart-buy-sell-button-inner-content items-3');
                    //         break;
                    //     case 5:
                    //         container.addClass('chart-buy-sell-button-inner-content items-5');
                    //         break;
                    //     default:
                    //         container.addClass('chart-buy-sell-button-inner-content items-3');
                    //         break;

                    // }
                    // container.html(html);
                }
            });
        }

        if (!settings.trading) {
            container.hide();
        }
    };

    // var _getTradingOptionHTML = function (config) {
    //     var html;
    //     switch (config.ctrl) {
    //         case "buy":
    //         case "sell":
    //             html = infChart.structureManager.trading.getTradingButtonHTML(config.ctrl, config.locLabel, config.btnText, config.key, config.btnClass, config.iconClass);
    //             break;
    //         case "algo-buy":
    //         case "algo-sell":
    //             html = infChart.structureManager.trading.getAlgoTradingButtonHTML(config.ctrl, config.locLabel, config.btnText, config.key, config.btnClass, config.textClass, config.title);
    //             break;
    //         case "size":
    //             html = infChart.structureManager.trading.getTradingSizeHTML(config.ctrl, config.btnText, config.key, config.divClass, config.titleCtrl);
    //             break;
    //         default:
    //             break;
    //     }
    //     return html;
    // };

    var _createTradingToolbar = function(container, uniqueId, settings) {
        _setTradingToolbarHTML(container, settings);
        var toolbarParent = container.find('div[inf-pnl="tb-trading-grid"]');
        var trader = _getTrader(uniqueId);
            if (settings.tradingTb && settings.tradingTb.length > 0) {
            settings.tradingTb.forEach(function (tradingKey) {
                if (settings.config[tradingKey]) {
                    var tradeControlOptions = settings.config[tradingKey].options;
                    tradeControlOptions.forEach(function (conf) {
                        switch (conf.ctrl) {
                            case "buy":
                            case "sell":
                            case "algo-buy":
                            case "algo-sell":
                                infChart.structureManager.common.setSingleOptionControlWithoutStatus(toolbarParent, conf.ctrl, function (value) {
                                    return _onTradeControlUpdates(uniqueId, value);
                                });
                        break;
                            case "size":
                                infChart.structureManager.common.setOptionControlsToChildWithoutStatus(toolbarParent, conf.ctrl,
                                    function (event, container) {
                                        return trader.onSizePanelClickEvent(event, container);
                                    },
                                    function (event, container) {
                                        return trader.onSizeInputBlurEvent(event, container);
                                    },
                                    function (event, container) {
                                        return trader.onSizeInputKeyUPEvent(event, container);
                                    });
                        break;
                    default:
                        break;
                }
            });
        }
            });
        }
    };

    return {
        createTrader: _createTrader,
        getTrader: _getTrader,
        destroyTrader: _destroyTrader,
        onOrderUpdates: _onOrderUpdates,
        onHoldingUpdates: _onHoldingUpdates,
        onAccountSummaryUpdates: _onAccountSummaryUpdates,
        onTradeControlUpdates: _onTradeControlUpdates,
        onAnnotationStore: _onAnnotationStore,
        onAnnotationRelease: _onAnnotationRelease,
        createTradingToolbar: _createTradingToolbar,
        createTradingDrawing: _createTradingDrawing
    }
})();
window.infChart = window.infChart || {};
infChart.structureManager = infChart.structureManager || {};

infChart.structureManager.trading = (function () {

    var getHTML = function () {
        return '<div>' +
            '<div inf-cont="trade-summary">' +
            '<ul inf-cont="action-btns">' + _getActionButtons() + '</ul>' +
            '<ul inf-cont="summary-data" class="stx-account">' + _getSummaryDataHTML() + '</ul>' +
            '</div>' +
            '<div inf-cont="trade-detail" class="trade-summary panel panel-default">' +
            '<div inf-cont="action-btns" class="panel-heading option-panel">' + _getActionButtons() + '</div>' +
            '<div class="panel-body">' +
            '<div inf-cont="account-summary" class="details-panel">' + _getAccountSummaryHTML() + '</div>' +
            '<div inf-cont="positions" class="ts-section">' + _getPositionsHTML() + '</div>' +
            '<div inf-cont="order-list" class="ts-section">' + _getOrderListHTML() + '</div>' +
            '</div>' +
            '</div>' +
            '</div>';
    };

    var getMarketOrderHTML = function () {
        return '<div class="order-window " inf-cont="market-order">' +
            '<span inf-action="close-popup" class="icon ico-close ow-close" data-dismiss="modal"></span>' +
            '<div class="sub-row">' +
            '<div class="form-group group1">' +
            '<label data-localize="label.shares">' + 'Quantity'/*infChart.manager.getLabel("label.shares")*/ + '</label>' +
            '<input class="form-control" inf-action="mkt-shares" value="">' +
            '</div>' +
            '<div class="form-group group2">' +
            '<label  data-localize="label.amount">' + 'Value'/* infChart.manager.getLabel("label.amount") */ + '</label>' +
            '<input class="form-control"  inf-action="mkt-value" value="">' +
            '</div>' +
            '</div>' +
            '<div class="sub-row">' +
            '<div class="form-group group1">' +
            '<label data-localize="label.stopLoss">' + infChart.manager.getLabel("label.stopLoss") + '</label>' +
            '<input class="form-control"  inf-ref="mkt-stp-loss" value="" disabled>' +
            '</div>' +
            '<div class="form-group group2">' +
            '<label data-localize="label.takeProfit">' + infChart.manager.getLabel("label.takeProfit") + '</label>' +
            '<input class="form-control"  inf-ref="mkt-take-profit" value="" disabled>' +
            '</div>' +
            '</div>' +
            '<div class="sub-row row3">' +
            '<div class="form-group group1">' +
            '<button class="btn btn-primary ow-buy-sell" type="submit" inf-action="order" inf-order-side="' + infChart.constants.chartTrading.orderSide.buy + '" data-localize="label.buy"><span>' + infChart.manager.getLabel("label.buy") + '</span><span inf-ref="last-val"></span></button>' +
            '</div>' +
            '<div class="form-group group2">' +
            '<button class="btn btn-warning ow-buy-sell" type="submit" inf-action="order" inf-order-side="' + infChart.constants.chartTrading.orderSide.sell + '" data-localize="label.sell"><span>' + infChart.manager.getLabel("label.sell") + '</span><span inf-ref="last-val"></span></button>' +
            '</div>' +
            '</div>' +

            '</div>';

    };

    var getOrderConfirmationHTML = function () {
        return '<div class="body">' +
            '<div class="body-raw">' +
            '<div>Description</div>' +
            '<div  inf-ref="orderDesc"></div>' +
            '</div>' +
            '<div class="body-raw">' +
            '<div>Price</div>' +
            '<div inf-ref="orderPrice"></div>' +
            '</div>' +
            '<div class="body-raw">' +
            '<div>Time-in-force</div>' +
            '<div inf-ref="tifType" ></div>' +
            '</div>' +
            '<div class="body-raw" style ="display:none">' +
            '<div>OTO</div>' +
            '<div inf-ref="oto" >Sell 156.29 / Sell 143.59 STP</div>' +
            '</div>' +
            '<div class="body-raw">' +
            '<label class="small"><input inf-ref="disable" type="checkbox"> Disable Confirmations For Session</label>' +
            '</div>' +
            '</div>';
    };

    var getOrderTicketLimitHTML = function(){
        return '<div class="order-window stopl-takep"> ' +
            '<span class="icon ico-close ow-close" data-inf-action="close"></span>' +
            '<div class="form-inline">' +
            '<div class="form-group"><label data-rel="type" class="label label-default"></label></div>' +
            '<div class="form-group">' +
            '<div><span data-rel="value"></span></div>' +
            '<div><span data-rel="pct"></span></div>' +
            '</div>' +
            '</div>' +
            '</div>';
    };

    var getOrderTicketHTML = function(){
            /*return '<div data-rel="limit-order" class="order-window trangle"> ' +
             '<span data-inf-action="close" class="icon ico-close ow-close"></span>' +
             '<div class="sub-row">' +
             '<div class="form-group group1">' +
             '<label data-rel="priceLabel">Price</label>' +
             '<input readonly="readonly" class="form-control" data-rel="price">' +
             '</div>' +
             '<div class="form-group group2">' +
             '<input data-rel="tif" value="6" readonly="readonly" type="hidden" class="form-control" >' +
             '<label data-rel="qtyLabel">Size</label>' +
             '<input class="form-control" data-rel="qty" value="100">' +
             '</div>' +
             '</div>' +
             '<div class="sub-row">' +
             '<div class="form-group group1">' +
             '<label data-rel="valueLabel">Value</label>' +
             '<input class="form-control" data-rel="value">' +
             '</div>' +
             '<div class="form-group group2" style="display:none;" data-rel="stopPriceCtrl">' +
             '<label data-rel="stopLabel">Stop</label>' +
             '<input class="form-control" data-rel="stopPrice">' +
             '</div>' +
             '</div>' +
             '<div class="sub-row row2 clearfix">' +
             '<div class="form-group group1 sl-bs-lr">' +
             '<label data-inf-action="stopLoss"><span><span class="icon ico-plus"></span>Stop &nbsp;Limit</span></label>' +
             '<label data-inf-action="cancelStopLoss" style="display: none;"><span><span class="icon ico-plus"></span>Limit</span></label>' +
             //'<label data-inf-action="takeProfit"><span><span class="icon ico-plus"></span>Take &nbsp;Profit</span></label>' +
             '<label style="display:none;">1 : <span data-inf="riskReward"></span>&nbsp;Rsk/Rwrd</label>' +
             '</div>' +
             '<div class="form-group group2 sl-bs-lr">' +
             '<button class="btn" type="submit" data-inf-action="placeOrder"></button>' +
             '<button class="btn trade-sm-btn" type="submit" data-inf-action="switchSide"><span class="icon ico-chevron-left"></span></button>' +
             '</div>' +
             '</div>' +
             '<div class="sub-row" style="margin-top:5px;"><button style="width:100%;" class="btn btn-default limit-order-btn-cancel" type="submit" data-inf-action="cancelOrder">Cancel</button></div>' +
             '</div>';*/

            return  '<div class="chart-order-window" data-rel="limit-order">' +
                        '<i class="fa fa-times close" data-inf-action="close"></i>' +
                        '<span rel="title" class="order-window-title d-none"></span>' +
                        '<div class="window-arrow" data-inf-ref="arrow"></div>' +
                        '<div class="row-item">' +
                            '<div class="item">' +
                                '<label class="item-label">Limit (<span class="currency" data-rel="secondaryCurrency" >usdt</span>)</label>' +
                                //'<span class="item-value" data-rel="price"></span>' +
                                '<input type="text" value="" data-rel="price">' +
                            '</div>' +
                            '<div class="item">' +
                                '<label class="item-label">Size (<span class="currency" data-rel="primaryCurrency">eth</span>)</label>' +
                                '<input type="text" value="" data-rel="qty">' +
                            '</div>' +
                            '<div class="item" data-rel="valueCtrl">' +
                                '<label class="item-label">Value (<span class="currency" data-rel="secondaryCurrency" >usdt</span>)</label>' +
                                '<input type="text" value="" data-rel="value">' +
                            '</div>' +
                            '<div class="item" style="display: none" data-rel="stopPriceCtrl">' +
                                '<label class="item-label">Stop (<span class="currency" data-rel="secondaryCurrency" >usdt</span>)</label>' +
                                '<input type="text" value="" data-rel="stopPrice">' +
                            '</div>' +
                            '<div class="item" style="display: none;">' +
                                '<button type="submit" class="btn btn-default" data-inf-action="stopLoss">+ Stop Limit</button>' +
                                '<button type="submit" class="btn btn-default" data-inf-action="cancelStopLoss">Limit</button>' +
                                '<button type="submit" class="btn btn-default" data-inf-action="cancelOrder">Cancel</button>' +
                                '<label>1 : <span data-inf="riskReward"></span>&nbsp;Rsk/Rwrd</label>'+
                            '</div>' +
                            '<div class="item item-wide" data-rel="warningMsg" style="display: none">' +
                                '<label data-rel="buy" class="item-label msg warning">Buying Power exceeded.</label>' +
                                '<label data-rel="sell" class="item-label msg warning">Available Quantity exceeded.</label>' +
                                '<label data-rel="qtyWarMsg" class="item-label msg warning"></label>' +
                            '</div>'+
                            '<div class="item">' +
                                '<button type="submit" class="btn v-cancel" data-inf-action="cancelOrder">Cancel</button>' +
                                '<button type="submit" class="btn" data-inf-action="placeOrder">Buy</button>' +
                            '</div>' +
                        '</div>' +
                    '</div>';
    };

    var _getActionButtons = function () {
        return '<div class="btn-group" role="group">' +
            '<button inf-action="mkt-order" type="button" class="btn btn-default">Market</button>' +
            '<button inf-action="buy-order" type="button" class="btn btn-default">Buy</button>' +
            '<button inf-action="cover-order" type="button" class="btn btn-default">Cover</button>' +
            '<button inf-action="sell-order" type="button" class="btn btn-default">Sell</button>' +
            '<button inf-action="short-order" type="button" class="btn btn-default">Short</button>' +
            '<button inf-action="brkt-order" type="button" class="btn btn-default">Bracket</button>' +
            '<button inf-action="strangle-order" type="button" class="btn btn-default">Strangle</button>' +
            '<button inf-action="straddle-order" type="button" class="btn btn-default">Straddle</button>' +
            '</div>';
    };

    var _getSummaryDataHTML = function () {
        return '<li>' +
            '<span><span original="Cash">Cash</span></span> ' +
            '<span class="tfc-current-cash">$100,000</span>' +
            '</li>' +
            '<li>' +
            '<span><span original="Funds Available">Funds Available</span></span> ' +
            '<span class="tfc-current-funds">$200,000</span>' +
            '</li>' +
            '<li>' +
            '<span><span original="Position">Position</span></span> ' +
            '<span class="tfc-current-position">0</span>' +
            '</li>';
    };

    var _getAccountSummaryHTML = function () {
        return '<div class="sub-panel">' +
            '<div class="" data-localize="label.netPortfolioVal">' + infChart.manager.getLabel("label.netPortfolioVal") + '</div>' +
            '<div inf-ref="netPortfolioVal"></div>' +
            '</div>' +
            '<div class="sub-panel">' +
            '<div class="" data-localize="label.availableMargin">' + infChart.manager.getLabel("label.availableMargin") + '</div>' +
            '<div inf-ref="availableMargin"></div>' +
            '</div>' +
            '<div class="sub-panel">' +
            '<div class="" data-localize="label.usedMargin">' + infChart.manager.getLabel("label.usedMargin") + '</div>' +
            '<div inf-ref="usedMargin"></div>' +
            '</div>';
    };

    var _getPositionsHTML = function () {
        return '<span class="table-heading" >Holdings</span>' +
            '<div class="holding-table"><table class="table table-striped table-hover" inf-ref="positions"></table></div>';
    };

    var _getOrderListHTML = function () {
        return '<span  class="table-heading" data-localize="label.openOrders">' + infChart.manager.getLabel("label.openOrders") + '</span>' +
            '<table class="orderlist-table table table-striped table-hover" inf-ref="orderList"></table>';
    };

    var _getTradingGridHTML = function(ctrlType, tradeControlOptions) {
        var html = '';
        if(ctrlType == "tradeControl") {
            var gridClass = 'chart-buy-sell-button-inner-content';
            switch (tradeControlOptions.length) {
                case 2:
                    gridClass += ' items-2';
                    break;
                case 3:
                    gridClass += ' items-3';
                    break;
                case 5:
                    gridClass += ' items-5';
                    break;
                default:
                    gridClass += ' items-3';
                    break;
            }
            html += '<div inf-pnl="tb-trading-grid"' + infChart.structureManager.common.getCtrlTypeHtml(ctrlType) +
                    ' class="' + gridClass + '" >';
            infChart.util.forEach(tradeControlOptions, function (i, key) {
                html += _getTradingOptionHTML(key);
            });
            html += '</div>'
        }
        return html;
    };

    var _getTradingOptionHTML = function (config) {
        var html;
        switch (config.ctrl) {
            case "buy":
            case "sell":
                html = _getTradingButtonHTML(config.ctrl, config.locLabel, config.btnText, config.key, config.btnClass, config.iconClass);
                break;
            case "algo-buy":
            case "algo-sell":
                html = _getAlgoTradingButtonHTML(config.ctrl, config.locLabel, config.btnText, config.key, config.btnClass, config.textClass, config.title);
                break;
            case "size":
                html = _getTradingSizeHTML(config.ctrl, config.btnText, config.key, config.divClass, config.titleCtrl);
                break;
            default:
                break;
        }
        return html;
    };

    var _getAlgoTradingButtonHTML = function (ctrlType, label, desc, value, btnClass, textClass, title) {
        return '<button class="' + btnClass + '"' + infChart.structureManager.common.getCtrlTypeHtml(ctrlType) + infChart.structureManager.common.getCtrlValueHtml(value) +
        'title="' + title + '" >' + label + '<span  class="' + textClass + '">'+ desc + '</span></button>';
    };

    var _getTradingButtonHTML = function (ctrlType, label, desc, value, btnClass, iconClass, hideValue) {
        return '<button class="' + btnClass + '"' + infChart.structureManager.common.getCtrlTypeHtml(ctrlType) + infChart.structureManager.common.getCtrlValueHtml(value) + '>' +
            (hideValue ? '' : '<div class="bs-value" inf-ref="' + ctrlType + '"></div>') +
            '<div class="bs-text"><i class="' + iconClass + '"></i data-localize="' + label + '">' + desc + '</div>' +
            '</button>';
    };

    var _getTradingSizeHTML = function (ctrlType, dec, value, divClass, titleCtrl) {
        return '<div class="' + divClass +'"' + infChart.structureManager.common.getCtrlTypeHtml(ctrlType) + infChart.structureManager.common.getCtrlValueHtml(value) + '>' +
            '<span class="title"' + infChart.structureManager.common.getCtrlTypeHtml(titleCtrl) +'>' + dec + '</span>' +
            '<input type="text" class="form-control"' + infChart.structureManager.common.getCtrlTypeHtml(ctrlType) + ' inf-ref="' + ctrlType + '">' +
            '</div>';
    };

    return {
        getHTML : getHTML,
        getMarketOrderHTML : getMarketOrderHTML,
        getOrderConfirmationHTML : getOrderConfirmationHTML,
        getOrderTicketLimitHTML : getOrderTicketLimitHTML,
        getOrderTicketHTML : getOrderTicketHTML,
        getTradingButtonHTML: _getTradingButtonHTML,
        // getTradingSizeHTML: _getTradingSizeHTML,
        // getAlgoTradingButtonHTML: _getAlgoTradingButtonHTML,
        getTradingGridHTML: _getTradingGridHTML
    }
})();

/**
 * Trading related data is managed by this script
 * Created by dushani on 7/19/17.
 */
var infChart = window.infChart || {};

infChart.tradingDataManagerFactory = (function () {

    var _managers = {};

    var _createTradingDataManager = function (providerObj) {
        var dataManager;
        var type = providerObj.type,
            source = providerObj.source;
        if (_managers[type]) {
            dataManager = _managers[type];
        } else {
            switch (type) {
                case 'infinit':
                    dataManager = new infChart.tradingDataManager(new infChart.xinTradeDataProvider(source));
                    break;
                default:
                    dataManager = new infChart.tradingDataManager(new infChart.mockTradeDataProvider(source));
                    break;
            }
            _managers[type] = dataManager;
            dataManager.cleanCache();
        }

        return dataManager;
    };

    return {
        createTradingDataManager: _createTradingDataManager
    }
})();

infChart.tradingDataManager = function (dataProvider) {
    this.tradeService = dataProvider;
    this.data = {};
};

infChart.tradingDataManager.prototype.cleanCache = function () {
    var today = infChart.util.getDateStringFromTime(new Date());
    infChart.util.removeData("DATA_", "DATA_" + today, false);
    this.data = {};
};

infChart.tradingDataManager.prototype.getChartSymbol = function (dataRow, colMap) {
    return (dataRow && colMap && dataRow[colMap.symbol]) ? dataRow[colMap.symbol] : (dataRow.symbol) ? dataRow.symbol : undefined;
};

/**
 * Update orderlist on realtime updates and returns the formatted update
 * @param properties
 * @param data
 * @returns {{columns, rows, colMap, categoryData, mapData}}
 */
infChart.tradingDataManager.prototype.updateOrderList = function (properties, data) {
    var oldData = this.data.orderList;
    if (oldData) {
        data.mapData.forEach(function (row) {
            var key = row.id;
            if (oldData.categoryData.map[key] && oldData.categoryData.map[key].length > 0) {
                data.columns.forEach(function (col) {
                    oldData.categoryData.map[key][0][col] = data.categoryData.map[key][0][col];
                });
            }
        });
    } else {
        this.data.orderList = data;
    }
    return { all: this.data.orderList, diff: data };
};

infChart.tradingDataManager.prototype.updatePositions = function (properties, data) {
    var oldData = this.data.positions;

    if (!oldData) {
        this.data.positions = data;
    }
    return { all: this.data.positions, diff: data };
};

infChart.tradingDataManager.prototype.updateTradeHistory = function (properties, data) {
    /*var _self = this, oldData = this.data.trades;
     var formattedData = this.convertData(data, function (row, colMap) {
     var chartSymbol = _self.getChartSymbol(row, colMap);
     var key = "";
     if (chartSymbol) {
     key = _self.getSymbol(chartSymbol);
     }

     if (oldData) {
     if (oldData.categoryData.map[key] && oldData.categoryData.map[key].length > 0) {
     oldData.categoryData.map.forEach(function(oldRow){
     if()
     });
     data.columns.forEach(function (col) {
     oldData.categoryData.map[key][0][col] = row[colMap[col]];
     });
     } else {

     }
     }
     return key;
     });


     if (!oldData) {
     this.data.positions = formattedData;
     }
     return {all: this.data.positions, diff: formattedData};*/
};

infChart.tradingDataManager.prototype.getOrderList = function (properties, callback, scope) {
    var _self = this;

    var success = function (responseData) {
        _self.data.orderList = responseData;
        callback.call(scope, responseData);
    };

    var error = function () {
        callback.call(scope, {});
    };

    this.tradeService.getOrderList(properties.chartId, properties.symbol, properties.filter, success, error);
};

infChart.tradingDataManager.prototype.getBreakevenPoint = function (properties, callback, scope) {
    var _self = this;

    var success = function (responseData) {
        _self.data.breakevenPoint = responseData;
        callback.call(scope, responseData);
    };

    var error = function () {
        callback.call(scope, {});
    };

    this.tradeService.getBreakevenPoint(properties.symbol, success, error);
};

infChart.tradingDataManager.prototype.getPositions = function (properties, callback, scope) {
    var self = this;

    var success = function (responseData) {
        self.data.positions = responseData;
        callback.call(scope, responseData);
    };

    var error = function () {
        callback.call(scope, {});
    };

    this.tradeService.getHoldings(properties.symbol, success, error);
};

infChart.tradingDataManager.prototype.getTradeHistory = function (properties, callback, scope) {
    var self = this;

    var success = function (responseData) {
        self.data.trades = responseData;
        callback.call(scope, responseData);
    };

    var error = function () {
        callback.call(scope, {});
    };

    this.tradeService.getTrades(properties.symbol, properties.filter, success, error);
};

infChart.tradingDataManager.prototype.getPortFolioSummary = function (symbol, callback, scope) {

    var success = function (responseData) {
        callback.call(scope, responseData);
    };

    var error = function () {
        callback.call(scope, {});
    };

    this.tradeService.getAccountSummary(symbol, success, error);
};

infChart.tradingDataManager.prototype.getHoldings = function (symbol, callback, scope) {
    var success = function (responseData) {
        callback.call(scope, responseData);
    };

    var error = function () {
        callback.call(scope, {});
    };

    this.tradeService.getHoldings(symbol, success, error);
};

infChart.tradingDataManager.prototype.createOrder = function (properties, callback, scope) {
    var success = function (responseData) {
        callback.call(scope, responseData);
    };

    this.tradeService.createOrder(properties.id, properties.order, success);
};

infChart.tradingDataManager.prototype.amendOrder = function (properties, callback, scope) {
    var success = function (responseData) {
        callback.call(scope, responseData);
    };

    this.tradeService.amendOrder(properties.id, properties.order, success);
};

infChart.tradingDataManager.prototype.cancelOrder = function (properties, callback, scope) {
    var success = function (responseData) {
        callback.call(scope, responseData);
    };

    this.tradeService.cancelOrder(properties.id, properties.order, success);
};

infChart.tradingDataManager.prototype.isTradingEnabled = function (symbol) {
    return this.tradeService.isTradingEnabled(symbol);
};

infChart.tradingDataManager.prototype.getLastDefinedQuantityForPair = function (symbol, price, callback, scope) {
    var success = function (responseData) {
        callback.call(scope, responseData);
    }

    this.tradeService.getLastDefinedQuantityForPair(symbol, price, success);
};

infChart.tradingDataManager.prototype.saveLastDefineQuantityForPair = function (symbol, quantity) {
    this.tradeService.saveLastDefineQuantityForPair(symbol, quantity);
};
infChart.tradeDataProvider = function(vendor, timezoneOffset){};

infChart.tradeDataProvider.prototype.getAccountSummary = function(symbol, onSuccess, onError){};

infChart.tradeDataProvider.prototype.getHoldings = function(symbol, onSuccess, onError){};

infChart.tradeDataProvider.prototype.getOrderList = function(chartId, symbol, filter, onSuccess, onError){};

infChart.tradeDataProvider.prototype.getTrades = function(symbol, filter, onSuccess, onError){};

infChart.tradeDataProvider.prototype.createOrder = function(id, order, onSuccess, onError){};

infChart.tradeDataProvider.prototype.amendOrder = function(id, order, onSuccess, onError){};

infChart.tradeDataProvider.prototype.cancelOrder = function(id, order, onSuccess, onError){};

infChart.tradeDataProvider.prototype.getBreakevenPoint = function (symbol, onSuccess, onError){};

infChart.tradeDataProvider.prototype.isTradingEnabled = function (symbol){};

infChart.tradeDataProvider.prototype.getLastDefinedQuantityForPair = function (symbol, price, onSuccess) {};

infChart.tradeDataProvider.prototype.saveLastDefineQuantityForPair = function (symbol, quantity){};

(function(infChart, $){

    infChart.mockTradeDataProvider = function () {
        infChart.tradeDataProvider.apply(this, arguments);
    };

    infChart.util.extend(infChart.tradeDataProvider, infChart.mockTradeDataProvider);

    infChart.mockTradeDataProvider.prototype.getAccountSummary = function(symbol, onSuccess){
        onSuccess({
            "accountDetails": {
                "realizedProfit": 55000.0,
                "utilizedMargin": 10000.0,
                "unrealizedProfit": -35000.0,
                "portfolioValuation": 0.0,
                "initialMargin": 1250000.0,
                "availableMargin": 1260000.0
            },
            "name": "demo2@gmail.com",
            "provider": "SFT",
            "errorMsg": null
        });
    };

    infChart.mockTradeDataProvider.prototype.getHoldings = function(symbol, onSuccess){
        var data = {
            "key": {"instrument": null, "filter": null, "limit": 0},
            "updateType": null,
            "timestamp": 1500034173939,
            "ttl": 86700000,
            "columns": ["netQty", "netValue", "bookedProfitOrLoss", "floatingProfitOrLoss", "totalProfitOrLoss", "breakEvenPrice",
                "ltp", "totalBuyQty", "totalSellQty", "buyAvgPrice", "sellAvgPrice", "tradedDate", "expiryDate", "optionType", "strikePrice", "productType", "symbol"],
            "rows": [
                [0, 0, 7500, 0, 7500, 0, 8938.45, 75, 75, 8845.15, 8845.15, "2017-07-14T04:23:52.138Z", "2017-07-14T04:23:52.138Z", 0, 0, 1, {"provider": "SFT", "type": "EQU", "exchange": "NSE", "name": "NIFTY17MAR8900CE-NSEFO", "currency": "INR"}],
                [350, 87850, 1000, 350, 1350, 250, 251, 1350, 1000, 250, 251, "2017-07-14T04:23:52.138Z", "2017-07-14T04:23:52.138Z", 0, 0, 1, {"provider": "SFT", "type": "EQU", "exchange": "NSE", "name": "SBIN-NSECM", "currency": "INR"}]
            ]
        };

        function _convertHoldings(data) {
            var colMap = {}, category = {keys: [], map: {}}, categoryVal, categorize = true;

            var dataMapArr = [];
            $.each(data.columns, function (k, val) {
                colMap[val] = k;
            });

            data.rows.forEach(function (row) {
                var dataMap = {};
                $.each(data.columns, function (k, val) {
                    if (val === 'symbol') {
                        dataMap[val] = symbol ? symbol : this._convertSymbol(row[colMap[val]]);
                    } else {
                        dataMap[val] = row[colMap[val]];
                    }
                });
                dataMapArr.push(dataMap);
                if (categorize) {
                    categoryVal = dataMap["symbol"].symbolId;
                    if (categoryVal) {
                        if (!category.map[categoryVal]) {
                            category.keys.push(categoryVal);
                            category.map[categoryVal] = [];
                        }
                        category.map[categoryVal].push(dataMap);
                    }
                }
            });

            return {
                columns: data.columns,
                colMap: colMap,
                categoryData: category,
                mapData: dataMapArr
            };
        }

        onSuccess(_convertHoldings(data));
    };

    infChart.mockTradeDataProvider.prototype.getOrderList = function(chartId, symbol, filter, onSuccess){
        var data = {
            "key": {"instrument": null, "filter": null, "limit": 0},
            "updateType": null,
            "timestamp": 1500034173939,
            "ttl": 86700000,
            "columns": ["id", "clientId", "side", "type", "price", "qty", "status", "fillQty", "remainingQty", "orderTime", "tradeTime", "tif", "avgPrice", "symbol"],
            "rows": [
                [1, "demo2@gmail.com", 1, 1, 140.0, 1880, 1, 1880, 0, "2017-07-14T04:23:52.138Z", "2017-07-14T04:24:19.988Z", 1, 122.0, {
                    "provider": "SFT",
                    "type": "EQU",
                    "exchange": "NSE",
                    "name": "RELIANCE",
                    "currency": "INR"
                }],
                [2, "demo2@gmail.com", 2, 1, 180.0, 1880, 1, 1880, 0, "2017-07-14T04:28:45.744Z", "2017-07-14T04:29:25.035Z", 1, 122.0, {
                    "provider": "SFT",
                    "type": "EQU",
                    "exchange": "NSE",
                    "name": "RELIANCE",
                    "currency": "INR"
                }],
                [3, "demo2@gmail.com", 2, 1, 226.0, 1800, 1, 1800, 0, "2017-07-14T10:38:57.399Z", "2017-07-14T10:39:30.836Z", 2, 126.0, {
                    "provider": "SFT",
                    "type": "EQU",
                    "exchange": "NSE",
                    "name": "HDFCBANK",
                    "currency": "INR"
                }],
                [4, "demo2@gmail.com", 1, 2, 200.0, 800, 1, 800, 0, "2017-07-14T10:39:21.629Z", "2017-07-14T10:39:50.840Z", 3, 125.0, {
                    "provider": "SFT",
                    "type": "EQU",
                    "exchange": "NSE",
                    "name": "ONGC",
                    "currency": "INR"
                }],
                [5, "demo2@gmail.com", 2, 3, 178.0, 8500, 2, 8500, 0, "2017-07-14T10:39:49.385Z", "2017-07-14T10:40:15.844Z", 4, 178.0, {
                    "provider": "SFT",
                    "type": "EQU",
                    "exchange": "NSE",
                    "name": "RCOM",
                    "currency": "INR"
                }],
                [6, "demo2@gmail.com", 1, 4, 58.0, 500, 2, 500, 0, "2017-07-14T10:40:21.137Z", "2017-07-14T10:41:15.856Z", 5, 58.0, {
                    "provider": "SFT",
                    "type": "EQU",
                    "exchange": "NSE",
                    "name": "TCS",
                    "currency": "INR"
                }],
                [7, "demo2@gmail.com", 7, 7, 38.0, 90, 2, 90, 0, "2017-07-14T10:40:55.338Z", "2017-07-14T10:41:15.856Z", 6, 38.0, {
                    "provider": "SFT",
                    "type": "EQU",
                    "exchange": "NSE",
                    "name": "SBIN",
                    "currency": "INR"
                }]
            ],
            "errorCode": 0
        };

        function _convertOrderList(data) {
            var colMap = {}, category = {keys: [], map: {}}, categoryVal, categorize = true;

            var dataMapArr = [];
            $.each(data.columns, function (k, val) {
                colMap[val] = k;
            });

            data.rows.forEach(function (row) {
                var dataMap = {};
                $.each(data.columns, function (k, val) {
                    if (val === 'symbol') {
                        dataMap[val] = symbol ? symbol : this._convertSymbol(row[colMap[val]]);
                    } else {
                        dataMap[val] = row[colMap[val]];
                    }
                });
                dataMapArr.push(dataMap);
                if (categorize) {
                    categoryVal = dataMap["id"];
                    if (categoryVal) {
                        if (!category.map[categoryVal]) {
                            category.keys.push(categoryVal);
                            category.map[categoryVal] = [];
                        }
                        category.map[categoryVal].push(dataMap);
                    }
                }
            });

            return {
                columns: data.columns,
                colMap: colMap,
                categoryData: category,
                mapData: dataMapArr
            };
        }

        onSuccess(_convertOrderList(data));
    };

    infChart.mockTradeDataProvider.prototype.getTrades = function(symbol, filter, onSuccess){
        var data = {
            "key": {"instrument": null, "filter": null, "limit": 0},
            "updateType": null,
            "timestamp": 1500034173939,
            "ttl": 86700000,
            "columns": ["id", "orderId", "clientId", "side", "type", "price", "qty", "orderQty", "triggerPrice", "tradeTime", "tif", "productType", "symbol"],
            "rows": [
                // [1, 3, 21, 1, 1, 158, 100, 100, 158, "2017-03-14T04:23:52.138Z", 1, 1, {"provider": "SFT", "type": "EQU", "exchange": "NSE", "name": "RELIANCE", "currency": "INR"}],
                // [2, 4, 22, 1, 2, 185, 200, 200, 185, "2017-02-14T04:23:52.138Z", 1, 1, {"provider": "SFT", "type": "EQU", "exchange": "NSE", "name": "RELIANCE", "currency": "INR"}]
            ]
        };

        function _convertTrades(data) {
            var colMap = {}, category = {keys: [], map: {}}, categoryVal, categorize = true;

            var dataMapArr = [];
            $.each(data.columns, function (k, val) {
                colMap[val] = k;
            });

            data.rows.forEach(function (row) {
                var dataMap = {};
                $.each(data.columns, function (k, val) {
                    if (val === 'symbol') {
                        dataMap[val] = symbol ? symbol : this._convertSymbol(row[colMap[val]]);
                    } else {
                        dataMap[val] = row[colMap[val]];
                    }
                });
                dataMapArr.push(dataMap);
                if (categorize) {
                    categoryVal = dataMap["symbol"].symbolId;
                    if (categoryVal) {
                        if (!category.map[categoryVal]) {
                            category.keys.push(categoryVal);
                            category.map[categoryVal] = [];
                        }
                        category.map[categoryVal].push(dataMap);
                    }
                }
            });

            return {
                columns: data.columns,
                colMap: colMap,
                categoryData: category,
                mapData: dataMapArr
            };
        }

        onSuccess(_convertTrades(data));
    };

    infChart.mockTradeDataProvider.prototype.createOrder = function(id, order, onSuccess){
        onSuccess({
            side: order.side,
            quantity: order.qty,
            price: order.price,
            ltp : order.ltp,
            type: order.type,
            tif: order.tif,
            targetPrice: order.targetPrice ? order.targetPrice : 0,
            stopLossPrice: order.stopLossPrice ? order.stopLossPrice : 0,
            symbol: order.symbol
        });
    };

    infChart.mockTradeDataProvider.prototype.amendOrder = function(id, order, onSuccess){
        onSuccess({
            quantity: order.qty,
            price: order.price
        });
    };

    infChart.mockTradeDataProvider.prototype.cancelOrder = function(id, order, onSuccess){
        onSuccess(order.orderId);
    };

    infChart.mockTradeDataProvider.prototype.getBreakevenPoint = function (symbol, onSuccess){
        onSuccess({});
    };

    infChart.mockTradeDataProvider.prototype.isTradingEnabled = function (symbol) {
        return true;
    };

    infChart.mockTradeDataProvider.prototype.getLastDefinedQuantityForPair = function (symbol, price, onSuccess) {
        onSuccess(10);
    };

    infChart.mockTradeDataProvider.prototype.saveLastDefineQuantityForPair = function (symbol, quantity){};

})(infChart, jQuery);
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
window.infChart = window.infChart || {};

infChart.breakEvenLineDrawing = function () {
    infChart.drawingObject.apply(this, arguments);
};

infChart.breakEvenLineDrawing.prototype = Object.create(infChart.drawingObject.prototype);

infChart.breakEvenLineDrawing.prototype.additionalDrawingsFunction = function () { };

infChart.breakEvenLineDrawing.prototype.bindSettingsEvents = function () { };

infChart.breakEvenLineDrawing.prototype.destroyDrawing = function () { };

infChart.breakEvenLineDrawing.prototype.getConfig = function () { };

infChart.breakEvenLineDrawing.prototype.getOptions = function (properties) {
    var options = {
        xValue: properties.xValue,
        x: properties.x,
        yValue: properties.yValue,
        drawingType: infChart.constants.drawingTypes.trading,
        allowDragX: false,
        allowDragY: false,
        behindSeries: true,
        shape: {
            type: 'symbol',
            params: {
                'stroke-width': 0,
                width: 0,
                height: 0,
                symbol: 'rectangle',
                fill: {
                    linearGradient: {
                        x1: 0,
                        y1: 0,
                        x2: 0,
                        y2: 1
                    },
                    stops: [
                        [0, 'rgba(49, 175, 76,0)'],
                        [1, 'rgba(49, 175, 76,0.4)']
                    ]
                }
            }
        }
    };

    if (properties.width) {
        options.shape.params.width = properties.width;
    }
    if (properties.clickCords) {
        options.clickCords = properties.clickCords;
    }
    if (properties.fillColor) {
        options.shape.params.fill = properties.fillColor;
    }
    if (properties.isRealTimeTranslation) {
        options.isRealTimeTranslation = properties.isRealTimeTranslation;
    }
    if (properties.parent) {
        options.parent = properties.parent;
    }
    if (properties.subType) {
        options.subType = properties.subType;
        if (options.subType == "down") {
            options.shape.params.fill.linearGradient = {
                x1: 0,
                y1: 1,
                x2: 0,
                y2: 0
            };
        } else {
            options.shape.params.fill.linearGradient = {
                x1: 0,
                y1: 0,
                x2: 0,
                y2: 1
            };
        }
    }
    if (properties.xValueEnd && properties.yValueEnd) {
        options.xValueEnd = properties.xValueEnd;
        options.yValueEnd = properties.yValueEnd;
    }
    options.adjustYAxisToViewAnnotation = true;

    /**
     * @important : yAxis extremes should not be adjusted to show break even line
     * https://xinfiit.atlassian.net/browse/CCA-2156
     */
    /*options.getExtremesFn = function () {
     var yValue = infChart.drawingUtils.common.getYValue.call(this, this.yValue),
     options = this.annotation.options,
     isDown = options.subType === "down",
     yAxis = this.annotation.chart.yAxis[options.yAxis],
     min,
     max,
     dataMax = yAxis.infActualDataMax || yAxis.dataMax,
     dataMin = yAxis.infActualDataMin || yAxis.dataMin,
     extremes;

     if (dataMin > yValue) {
     min = yValue;
     if (isDown) {
     min -= (dataMax - yValue) * .05;
     }
     extremes = {
     'min': min
     }
     }

     if (dataMax < yValue) {
     max = yValue;
     if (!isDown) {
     max += (yValue - dataMin) * .05;
     }
     if (!extremes) {
     extremes = {};
     }
     extremes.max = max;
     }

     return extremes;
     };*/
    return options;
};

infChart.breakEvenLineDrawing.prototype.getPlotHeight = function () { };

infChart.breakEvenLineDrawing.prototype.getSettingsPopup = function () {
    return $("<div></div>");
};

infChart.breakEvenLineDrawing.scale = function () {
    var ann = this.annotation,
        chart = ann.chart,
        options = ann.options,
        //xAxis = chart.xAxis[options.xAxis],
        yAxis = chart.yAxis[options.yAxis],
        dx = chart.plotWidth,
        dy = yAxis.toPixels(options.yValue),
        w = Math.round(dx) + 1 + chart.plotLeft,
        h = Math.round(dy) + 1,
        symbol = {
            symbol: options.shape.params.symbol,
            zIndex: chart.seriesGroup.zIndex - 1
        },
        xPx = 0,
        yPx = 0;

    if (options.subType == "down") {
        if (dy > yAxis.height) {
            h = 0;
        } else {
            yPx = dy;
            h = yAxis.height - h + 1 + chart.margin[2];
        }
    } else if (dy <= 1) {
        h = 0;
    }

    symbol.x = 0;
    symbol.y = 0;
    symbol.width = Math.abs(w);
    symbol.height = Math.abs(h);

    ann.update({
        xValue: null,
        yValue: null,
        xValueEnd: null,
        yValueEnd: null,
        x: xPx,
        y: yPx,
        shape: {
            params: symbol
        }
    });
};

infChart.breakEvenLineDrawing.prototype.selectAndBindResize = function () { };

infChart.breakEvenLineDrawing.prototype.step = function () { };

infChart.breakEvenLineDrawing.prototype.stop = function (e) { };

infChart.breakEvenLineDrawing.prototype.translate = function () { };

infChart.breakEvenLineDrawing.prototype.updateOptions = function (properties, redraw) {
    var drawing = this,
        ann = drawing.annotation;
    if (properties.yValue) {
        drawing.yValue = properties.yValue;
    }
    if (properties.subType) {
        ann.options.subType = properties.subType;
        if (ann.options.subType == "down") {
            ann.options.shape.params.fill.linearGradient = {
                x1: 0,
                y1: 1,
                x2: 0,
                y2: 0
            };
        } else {
            ann.options.shape.params.fill.linearGradient = {
                x1: 0,
                y1: 0,
                x2: 0,
                y2: 1
            };
        }
    }
    if (redraw) {
        this.scaleDrawing();
    }
};

infChart.breakEvenLineDrawing.prototype.updateSettings = function (properties) {
    //this
};
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
