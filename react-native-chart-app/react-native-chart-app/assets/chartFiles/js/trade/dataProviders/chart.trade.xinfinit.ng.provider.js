(function (infChart, $, angular) {

    infChart.xinTradeDataProvider = function () {
        infChart.tradeDataProvider.apply(this, arguments);

        this.injector = angular.element('body > [ng-controller]:first').injector();

        this._convertTradeData = function (data, categoryField) {
            var self = this, columns = [], colMap = {}, category = {keys: [], map: {}}, dataMapArr = [];
            if (data && data.columns && data.rows && data.rows.length > 0) {
                var categoryVal, categorize = ( categoryField && typeof categoryField == "function" );

                $.each(data.columns, function (k, val) {
                    colMap[val] = k;
                    columns.push(val);
                });

                data.rows.forEach(function (row) {
                    var dataMap = {};
                    $.each(data.columns, function (k, val) {
                        switch (val) {
                            case 'symbol':
                                dataMap[val] = self._getAngularService("chartUtilService").getChartSymbol(row[colMap[val]]);
                                break;
                            default:
                                dataMap[val] = row[colMap[val]];
                                break;
                        }
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

        /**
         * order list is a map
         * @param orderList orderList map
         * @param categoryFn categorize fn
         */
        this._convertOrderList = function (orderList, categoryFn) {
            var self = this, convertedOrderList = {
                columns: [],
                colMap: {},
                mapData: []
            }, category;

            var categorize = (categoryFn && typeof categoryFn === "function");

            if (categorize) {
                category = {keys: [], map: {}};
            }

            var _subOrderMap = {}, _mainOrderMap = {};

            var _mapOrder = function(key, orderObj){
                var dataMap = {}, parentOrderId = false;
                for (var column in orderObj) {
                    if (orderObj.hasOwnProperty(column)) {
                        switch (column) {
                            case 'symbol':
                                dataMap[column] = self._getAngularService("chartUtilService").getChartSymbol(orderObj[column]);
                                break;
                            case 'stopLossPrice':
                            case 'takeProfitPrice':
                                dataMap[column] = 0;
                                break;
                            case 'parentId':
                                parentOrderId = orderObj[column];
                                dataMap[column] = orderObj[column];
                                break;
                            default:
                                dataMap[column] = orderObj[column];
                                break;
                        }
                    }
                }
                if(parentOrderId){
                    if(!_subOrderMap.hasOwnProperty(parentOrderId)){
                        _subOrderMap[parentOrderId] = [];
                    }
                    _subOrderMap[parentOrderId].push(dataMap);
                } else{
                    _mainOrderMap[key] = dataMap;
                }
            };

            var columnsAdded = false;
            for (var key in orderList) {
                if (orderList.hasOwnProperty(key)) {
                    var orderObj = orderList[key];
                    _mapOrder(key, orderObj);
                    if (!self._getAngularService("tradeService").isSubOrder(key)) {
                        if(!columnsAdded){
                            for (var column in orderObj) {
                                if (orderObj.hasOwnProperty(column)) {
                                    var index = convertedOrderList.columns.indexOf(column);
                                    if (index < 0) {
                                        convertedOrderList.columns.push(column);
                                        index = convertedOrderList.columns.length - 1;
                                        convertedOrderList.colMap[column] = index;
                                    }
                                }
                            }
                            columnsAdded = true;
                        }
                    }
                }
            }

            for (var key in _mainOrderMap) {
                if(_mainOrderMap.hasOwnProperty(key)){
                    var dataMap = _mainOrderMap[key];
                    if(_subOrderMap.hasOwnProperty(key)){
                        dataMap.subOrders = _subOrderMap[key];
                        delete _subOrderMap[key];
                    }else {
                        dataMap.subOrders = [];
                    }
                    convertedOrderList.mapData.push(dataMap);
                    if (categorize) {
                        var categoryVal = categoryFn.call(self, dataMap);
                        if (categoryVal) {
                            if (!category.map[categoryVal]) {
                                category.keys.push(categoryVal);
                                category.map[categoryVal] = [];
                            }
                            category.map[categoryVal].push(dataMap);
                        }
                    }
                }
            }
            for (var parentOrderId in _subOrderMap) {
                if(_subOrderMap.hasOwnProperty(parentOrderId)){
                    _subOrderMap[parentOrderId].forEach(function(subOrderDataMap){
                        convertedOrderList.mapData.push(subOrderDataMap);
                        if (categorize) {
                            var categoryVal = categoryFn.call(self, subOrderDataMap);
                            if (categoryVal) {
                                if (!category.map[categoryVal]) {
                                    category.keys.push(categoryVal);
                                    category.map[categoryVal] = [];
                                }
                                category.map[categoryVal].push(subOrderDataMap);
                            }
                        }
                    });
                }
            }

            if (categorize) {
                convertedOrderList.categoryData = category;
            }
            return convertedOrderList;
        };

        this._getAngularService = function (service) {
            //  var injector = angular.element('body > [ng-controller]:first').injector();

            return this.injector.get(service);
        };
    };

    infChart.util.extend(infChart.tradeDataProvider, infChart.xinTradeDataProvider);

    infChart.xinTradeDataProvider.prototype.getAccountSummary = function (symbol, onSuccess, onError) {
        var tradeService = this._getAngularService("chartTradeService");

        tradeService.getAccountSummary(symbol, onSuccess, onError);
    };

    infChart.xinTradeDataProvider.prototype.getHoldings = function (symbol, onSuccess, onError) {
        var tradeService = this._getAngularService("chartTradeService");

        tradeService.getHoldings(symbol, onSuccess, onError);
    };

    infChart.xinTradeDataProvider.prototype.getOrderList = function (chartId, symbol, filter, onSuccess, onError) {
        var self = this, tradeService = self._getAngularService("chartTradeService");

        tradeService.getOrderList(chartId, symbol, filter, function (responseData) {
            onSuccess(self._convertOrderList(responseData, function (dataMap) {
                return dataMap['id'];
            }));
        }, function (error) {
            onError(error);
        });
    };

    infChart.xinTradeDataProvider.prototype.getTrades = function (symbol, filter, onSuccess, onError) {
        var self = this, tradeService = this._getAngularService("chartTradeService");

        tradeService.getTradeList(symbol, filter, function (responseData) {
            onSuccess(self._convertTradeData(responseData, function (dataMap) {
                return dataMap['symbol'].symbolId;
            }));
        }, function (error) {
            onError(error);
        });
    };

    infChart.xinTradeDataProvider.prototype.createOrder = function (id, order, onSuccess) {
        var tradeService = this._getAngularService("chartTradeService");

        tradeService.createOrder(id, order, function (responseData) {
            onSuccess(responseData);
        });
    };

    infChart.xinTradeDataProvider.prototype.amendOrder = function (id, order, onSuccess) {
        var tradeService = this._getAngularService("chartTradeService");

        tradeService.amendOrder(id, order, function (responseData) {
            onSuccess(responseData);
        });
    };

    infChart.xinTradeDataProvider.prototype.cancelOrder = function (id, order, onSuccess) {
        var tradeService = this._getAngularService("chartTradeService"), chartUtilService = this._getAngularService("chartUtilService");

        tradeService.cancelOrder(id, order, function (responseData) {
            onSuccess(responseData);
        });
    };

    infChart.xinTradeDataProvider.prototype.getBreakevenPoint = function (symbol, onSuccess, onError) {
        var tradeService = this._getAngularService("chartTradeService");

        tradeService.getBreakevenPoint(symbol, onSuccess, onError);
    };

    infChart.xinTradeDataProvider.prototype.isTradingEnabled = function (symbol) {
        var tradeService = this._getAngularService("chartTradeService");

        return tradeService.isTradingEnabled(symbol);
    };
    
    infChart.xinTradeDataProvider.prototype.getLastDefinedQuantityForPair = function (symbol, price, onSuccess) {
        var tradeService = this._getAngularService("chartTradeService");

        tradeService.getLastDefinedQuantityForPair(symbol, price, function (responseData) {
            onSuccess(responseData);
        });
    };

    infChart.xinTradeDataProvider.prototype.saveLastDefineQuantityForPair = function (symbol, quantity) {
        var tradeService = this._getAngularService("chartTradeService");

        tradeService.saveLastDefineQuantityForPair(symbol, quantity);
    };
    

})(infChart, jQuery, angular);