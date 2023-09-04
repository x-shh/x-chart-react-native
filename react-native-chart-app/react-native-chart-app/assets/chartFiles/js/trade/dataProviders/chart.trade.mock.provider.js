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