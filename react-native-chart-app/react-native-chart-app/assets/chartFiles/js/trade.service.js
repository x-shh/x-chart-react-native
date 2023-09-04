var trade = window.trade || (function ($) {

        var getService = function (url, vendor) {
            return new trade.service($, url, vendor);
        };

        return {
            getService: getService
        }
    })(jQuery);

trade.service = function ($, url, vendor) {

    var self = this;

    self.baseUrl = url;

    self.vendor = vendor;

    var getRequestUrl = function(symbolUID, requestUrl){
        var url = self.baseUrl;
        if(symbolUID) {
            url += 'request-by-instrument' + requestUrl.replace('${instrument}', JSON.stringify(getTradeSymbol(symbolUID)));
        }else {
            url += 'request/' + self.vendor + requestUrl;
        }
        return url;
    };

    var getTradeSymbol = function(symbolUID) {
        return {
            name: symbolUID.name,
            vendor: symbolUID.provider,
            type: symbolUID.type,
            exchange: symbolUID.exchange,
            currency: symbolUID.currency
        }
    };

    self.sendRequest = function (requestObj) {
        return $.ajax({
            url: getRequestUrl(requestObj.symbol, requestObj.url),
            contentType: requestObj.contentType ? requestObj.contentType : 'application/json',
            data: requestObj.data,
            dataType: requestObj.dataType ? requestObj.dataType : 'json',
            method: requestObj.method ? requestObj.method : 'GET'
        });
    };

    return self;
};

trade.service.prototype.getAccountSummary = function () {
    var requestObj = {url: '/ACS/summary'};
    return this.sendRequest(requestObj);
};

trade.service.prototype.getHoldings = function (symbolUID, filter) {
    var requestObj = {};
    if (typeof filter === 'undefined') {
        filter = {};
    }

    if (symbolUID) {
        requestObj.symbol = symbolUID;
        requestObj.url = '/HLD/${instrument}/' + JSON.stringify(filter);
    }else{
        requestObj.url = '/HLD/list/' + JSON.stringify(filter);
    }
    return this.sendRequest(requestObj);
};

trade.service.prototype.getTrades = function (symbolUID, filter) {
    var requestObj = {};
    if (typeof filter === 'undefined') {
        filter = {};
    }

    if (symbolUID) {
        requestObj.symbol = symbolUID;
        requestObj.url = '/TRD/${instrument}/' + JSON.stringify(filter);
    }else{
        requestObj.url = '/TRD/list/' + JSON.stringify(filter);
    }
    return this.sendRequest(requestObj);
};

trade.service.prototype.getBreakevenPoint = function (symbolUID, filter) {
    var requestObj = {};
    if (typeof filter === 'undefined') {
        filter = {};
    }

    if (symbolUID) {
        requestObj.symbol = symbolUID;
        requestObj.url = '/TRD/${instrument}/' + JSON.stringify(filter);
    }else{
        requestObj.url = '/TRD/list/' + JSON.stringify(filter);
    }
    return this.sendRequest(requestObj);
};

trade.service.prototype.getOrderList = function (symbolUID, filter) {
    var requestObj = {};
    if (typeof filter === 'undefined') {
        filter = {};
    }

    if (symbolUID) {
        requestObj.symbol = symbolUID;
        requestObj.url = '/OLT/${instrument}/' + JSON.stringify(filter);
    }else{
        requestObj.url = '/OLT/list/' + JSON.stringify(filter);
    }
    return this.sendRequest(requestObj);
};

trade.service.prototype.getOrderList = function (symbolUID, filter) {
    var requestObj = {};
    if (typeof filter === 'undefined') {
        filter = {};
    }

    if (symbolUID) {
        requestObj.symbol = symbolUID;
        requestObj.url = '/OLT/${instrument}/' + JSON.stringify(filter);
    }else{
        requestObj.url = '/OLT/list/' + JSON.stringify(filter);
    }
    return this.sendRequest(requestObj);
};

trade.service.prototype.createOrder = function (order) {
    var orderPostData = {
        side: order.side,
        quantity: order.qty,
        price: order.price,
        ltp : order.ltp,
        type: order.type,
        tif: order.tif,
        targetPrice: order.targetPrice ? order.targetPrice : 0,
        stopLossPrice: order.stopLossPrice ? order.stopLossPrice : 0
    };
    var requestObj = {
        url: '/ORD/${instrument}/create',
        symbol : order.symbol,
        method: 'POST',
        data: orderPostData,
        contentType: 'application/x-www-form-urlencoded'
    };
    return this.sendRequest(requestObj);
};

trade.service.prototype.amendOrder = function (orderId, amendments) {
    var orderPutData = {
        quantity: amendments.qty,
        price: amendments.price
    };
    var requestObj = {
        url: '/OLT/amend/' + orderId,
        method: 'PUT',
        data: orderPutData,
        contentType: 'application/x-www-form-urlencoded'
    };
    return this.sendRequest(requestObj);
};

trade.service.prototype.cancelOrder = function (orderId) {
    var requestObj = {url: '/OLT/cancel/' + orderId, method: 'DELETE'};
    return this.sendRequest(requestObj);
};

