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