(function(infChart, $) {

    infChart.xinTradeDataProvider = function (vendor, timezoneOffset, webSocketEvents) {
        infChart.tradeDataProvider.apply(this, arguments);

        this._vendor = vendor;

        this._getInstrumentForService = function (symbol) {
            return {
                "vendor": symbol.provider,
                "type": symbol.symbolType,
                "exchange": symbol.exchange,
                "name": symbol.symbol,
                "currency": symbol.currency
            }
        };

        this._getChartSymbolFromInstrument = function (instrument) {
            return {
                symbol: instrument.name,
                symbolId: instrument.name + '.' + instrument.exchange + '#' + instrument.type + '$' + instrument.currency + '@' + instrument.vendor,
                symbolDesc: instrument.name,
                symbolType: instrument.type,
                currency: instrument.currency,
                exchange: instrument.exchange,
                dp: instrument.dp ? instrument.dp : 2,
                provider: instrument.vendor
            };
        };

        this._sendRequest = function (requestObj) {
            return $.ajax({
                url: '/frontend' + requestObj.url,
                contentType: requestObj.contentType ? requestObj.contentType : 'application/json',
                data: requestObj.data,
                dataType: requestObj.dataType ? requestObj.dataType : 'json',
                method: requestObj.method ? requestObj.method : 'GET'
            });
        };

        this._convertTradeData = function (data, categoryField) {
            var columns = [], colMap = {}, category = {keys: [], map: {}}, dataMapArr = [];
            if (data && data.columns && data.rows && data.rows.length > 0) {
                var categoryVal, categorize = ( categoryField && typeof categoryField == "function" );

                $.each(data.columns, function (k, val) {
                    colMap[val] = k;
                    columns.push(val);
                });

                data.rows.forEach(function (row) {
                    var dataMap = {};
                    $.each(data.columns, function (k, val) {
                        dataMap[val] = row[colMap[val]];
                    });
                    dataMapArr.push(dataMap);
                    if (categorize) {
                        categoryVal = categoryField.call(this, dataMap);
                        if (categoryVal) {
                            if (!category.map[categoryVal]) {
                                category.keys.push(categoryVal);
                                category.map[categoryVal] = [];
                            }
                            category.map[categoryVal].push(dataMap);
                        }
                    }
                });


            }
            return {
                columns: columns,
                colMap: colMap,
                categoryData: category,
                mapData: dataMapArr
            };
        };
    };

    infChart.util.extend(infChart.tradeDataProvider, infChart.xinTradeDataProvider);

    infChart.xinTradeDataProvider.prototype.getAccountSummary = function (symbol, onSuccess, onError) {
        return this._sendRequest({url: '/request/ACS/summary'}).done(function (responseData) {
            onSuccess(responseData);
        }).fail(function () {
            onError && onError();
        });
    };

    infChart.xinTradeDataProvider.prototype.getHoldings = function (symbol, onSuccess, onError) {
        var requestObj = {}, filter = {}, self = this;

        if (symbol) {
            requestObj.url = '/request-by-instrument/HLD/' + JSON.stringify(this._getInstrumentForService(symbol)) + '/' + JSON.stringify(filter);
        } else {
            requestObj.url = '/request/' + this._vendor + '/HLD/list/' + JSON.stringify(filter);
        }
        return this._sendRequest(requestObj).done(function (responseData) {
            onSuccess(self._convertTradeData(responseData, function (dataMap) {
                return dataMap['symbol'].symbolId;
            }));
        }).fail(function () {
            onError();
        });
    };

    infChart.xinTradeDataProvider.prototype.getOrderList = function (chartId, symbol, filter, onSuccess, onError) {
        var requestObj = {}, self = this;
        if (typeof filter === 'undefined') {
            filter = {};
        }

        if (symbol) {
            requestObj.url = '/request-by-instrument/OLT/' + JSON.stringify(this._getInstrumentForService(symbol)) + '/' + JSON.stringify(filter);
        } else {
            requestObj.url = '/request/' + this._vendor + 'OLT/list/' + JSON.stringify(filter);
        }
        return this._sendRequest(requestObj).done(function (responseData) {
            onSuccess(self._convertTradeData(responseData, function (dataMap) {
                return dataMap['id'];
            }));
        }).fail(function () {
            onError();
        });
    };

    infChart.xinTradeDataProvider.prototype.getTrades = function (symbol, filter, onSuccess, onError) {
        var requestObj = {}, self = this;
        if (typeof filter === 'undefined') {
            filter = {};
        }

        if (symbol) {
            requestObj.url = '/request-by-instrument/TRD/' + JSON.stringify(this._getInstrumentForService(symbol)) + '/' + JSON.stringify(filter);
        } else {
            requestObj.url = '/request/' + this._vendor + '/TRD/list/' + JSON.stringify(filter);
        }
        return this._sendRequest(requestObj).done(function (responseData) {
            onSuccess(self._convertTradeData(responseData, function (dataMap) {
                return dataMap['symbol'].symbolId;
            }));
        }).fail(function () {
            onError();
        });
    };

    infChart.xinTradeDataProvider.prototype.createOrder = function (id, order, onSuccess, onError) {
        var orderPostData = {
            side: order.side,
            quantity: order.qty,
            price: order.price,
            ltp: order.ltp,
            type: order.type,
            tif: order.tif,
            targetPrice: order.targetPrice ? order.targetPrice : 0,
            stopLossPrice: order.stopLossPrice ? order.stopLossPrice : 0
        };
        var requestObj = {
            url: '/request-by-instrument/ORD/' + JSON.stringify(this._getInstrumentForService(order.symbol)) + '/create',
            method: 'POST',
            data: orderPostData,
            contentType: 'application/x-www-form-urlencoded'
        };
        return this._sendRequest(requestObj).done(function (responseData) {
            onSuccess(responseData);
        }).fail(function () {
            onError();
        });
    };

    infChart.xinTradeDataProvider.prototype.amendOrder = function (id, amendments, onSuccess, onError) {
        var orderPutData = {
            quantity: amendments.qty,
            price: amendments.price
        };
        var requestObj = {
            url: '/request/' + this._vendor + '/OLT/amend/' + amendments.orderId,
            method: 'PUT',
            data: orderPutData,
            contentType: 'application/x-www-form-urlencoded'
        };
        return this._sendRequest(requestObj).done(function (responseData) {
            onSuccess(responseData);
        }).fail(function () {
            onError();
        });
    };

    infChart.xinTradeDataProvider.prototype.cancelOrder = function (id, order, onSuccess, onError) {
        var requestObj = {url: '/request/' + this._vendor + '/OLT/cancel/' + order.orderId, method: 'DELETE'};
        return this._sendRequest(requestObj).done(function (responseData) {
            onSuccess(responseData);
        }).fail(function () {
            onError();
        });
    };

    infChart.xinTradeDataProvider.prototype.getBreakevenPoint = function (symbol, onSuccess, onError) {
        onError();
    };

    infChart.xinTradeDataProvider.prototype.isTradingEnabled = function (symbol) {
        return true;
    };

    infChart.xinTradeDataProvider.prototype.getLastDefinedQuantityForPair = function (symbol, price, onSuccess) {
        onSuccess(10);
    };

    infChart.xinTradeDataProvider.prototype.saveLastDefineQuantityForPair = function (symbol, quantity){};

})(infChart, jQuery);