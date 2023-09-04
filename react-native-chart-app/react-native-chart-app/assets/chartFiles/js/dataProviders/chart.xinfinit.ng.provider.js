(function(infChart, $, angular) {

    infChart.xinDataProvider = function (vendor, timezoneOffset) {
        infChart.dataProvider.apply(this, arguments);

        this._vendor = vendor;
        this.injector = angular.element('body > [ng-controller]:first').injector();

        var _getIntervalDate = function (time, interval, regularIntervalsOnUpdate) {

            switch (interval) {
                case 'Y':
                    time = _getTimeZoneConvertedChartTime(infChart.util.getFirstDayOfYear(time));
                    break;
                case 'M':
                    time = _getTimeZoneConvertedChartTime(infChart.util.getFirstDayOfMonth(time));
                    break;
                case 'W':
                    time = _getTimeZoneConvertedChartTime(infChart.util.getFirstDayOfWeek(time));
                    break;
                default:
                    break;
            }
            return time;
        };

        var _getTimeZoneConvertedChartTime = function(time){
            var chartTime = +(time) + +(timezoneOffset) * 60 * 60000;
            return chartTime;
        };

        this._convertHistoryData = function(columns, values, interval, regularIntervalsOnUpdate) {
            var result = [],
                resultMap = {},
                mapCurrentTimes = {},
                hasOpenHighLow = false;

            if (typeof columns !== 'undefined' && typeof values !== 'undefined') {
                var openIndex = $.inArray('prcOpen', columns), closeIndex = $.inArray('prcLast', columns),
                    highIndex = $.inArray('prcHigh', columns), lowIndex = $.inArray('prcLow', columns), volumeIndex = $.inArray('volAcc', columns),
                    bidIndex = $.inArray('bidLast', columns), askIndex = $.inArray('askLast', columns),
                    askHighIndex = $.inArray('askHigh', columns), bidLowIndex = $.inArray('bidLow', columns),
                    count = 0, prevClose;

                for (var time in values) {
                    if (values.hasOwnProperty(time)) {
                        var chartTime = _getTimeZoneConvertedChartTime(time),
                            valArray = values[time], intervalDate = _getIntervalDate(chartTime, interval, regularIntervalsOnUpdate),
                            dataRow = undefined;

                        if ((valArray[closeIndex] != null && !isNaN(valArray[closeIndex])) ||
                            (valArray[bidIndex] != null && !isNaN(valArray[bidIndex])) ||
                            (valArray[askIndex] != null && !isNaN(valArray[askIndex]))) {

                            var close;
                            if(valArray[closeIndex] == null || isNaN(valArray[closeIndex])){
                                if(prevClose){
                                    close = prevClose;
                                }else{
                                    close = null;
                                }
                            }else{
                                close = valArray[closeIndex];
                                prevClose = close;
                            }

                            var open = isNaN(valArray[openIndex]) ? null : valArray[openIndex],
                                low = isNaN(valArray[lowIndex]) ? null : valArray[lowIndex],
                                high = isNaN(valArray[highIndex]) ? null : valArray[highIndex];

                            if(!hasOpenHighLow){
                                hasOpenHighLow = (open != null || low != null || high != null );
                            }

                            if (high == null && (open != null || low != null)) {
                                high = Math.max(open, low, close);
                            }

                            if (low == null && (open != null || high != null)) {
                                low = Math.min((high == null && Number.MAX_VALUE) || high, (open == null && Number.MAX_VALUE) || open, close);
                            }
                            // if volume is null set null to the data row as well, instead of zero to avoid drawing volume chart for zero values
                            dataRow = [
                                intervalDate,
                                open != null ? open : close,
                                high != null ? high : close,
                                low != null ? low : close,
                                close, valArray[volumeIndex] /*|| 0*/, valArray[bidIndex], valArray[askIndex], valArray[askHighIndex], valArray[bidLowIndex]];
                        }
                        if (dataRow) {
                            if (resultMap[intervalDate]) {
                                var row = resultMap[intervalDate];
                                var currentTimeObj = mapCurrentTimes[intervalDate];

                                if (currentTimeObj.open > time) {
                                    row[1] = dataRow[1];
                                    currentTimeObj.open = time;
                                }
                                row[2] = row[2] < dataRow[2] ? dataRow[2] : row[2];
                                row[3] = row[3] > dataRow[3] ? dataRow[3] : row[3];
                                if (currentTimeObj.close < time) {
                                    row[4] = dataRow[4];
                                    currentTimeObj.close = time;
                                }
                                row[5] += dataRow[5];
                            } else {
                                result[count] = dataRow;
                                resultMap[intervalDate] = dataRow;
                                mapCurrentTimes[intervalDate] = {'open': time, 'close': time};
                                count++;
                            }
                        }
                    }
                }
            }

            return {data: result, dataMap: resultMap, hasOpenHighLow : hasOpenHighLow};
        };

        this._getAngularService = function (service) {
            //var injector = angular.element('body > [ng-controller]:first').injector();

            return this.injector.get(service);
        };
    };

    infChart.util.extend(infChart.dataProvider, infChart.xinDataProvider);

    infChart.xinDataProvider.prototype.getHistoryData = function (symbol, interval, fromDate, toDate, onSuccess, onError, regularIntervalsOnUpdate, requestColums) {
        var promise, chartUtilService = this._getAngularService("chartUtilService"), cryptoUtilService = this._getAngularService("cryptoUtilService");
        var symbolForData = chartUtilService.getInfinitSymbolFromChartSymbol(symbol);
        if(cryptoUtilService.isHoldingsSymbol(symbolForData)){
            var portfolioService = this._getAngularService("portfolioService");
            promise = portfolioService.getChartHistoryData(symbolForData, chartUtilService.getIntervalForChartDataService(interval),
                chartUtilService.formatRequestDatesForChartDataService(fromDate, false, true), chartUtilService.formatRequestDatesForChartDataService(toDate, false, false));
        }else{
            promise = chartUtilService.getChartHistoryData(symbolForData, interval, fromDate, toDate, requestColums);
        }

        var dataManager = this;

        promise.then(function(responseData){
            setTimeout(function() {
                onSuccess(dataManager._convertHistoryData(responseData.columns, responseData.values, interval, regularIntervalsOnUpdate));
            }, 0);
        }).catch(function(reason){
            console.error('chartDataService => readHistoryData error');
            console.error(reason);
            onError(dataManager._convertHistoryData([], {}, interval, regularIntervalsOnUpdate));
        });
    };

    infChart.xinDataProvider.prototype.getMarketOpenTimes = function(symbol) {
        var chartUtilService = this._getAngularService("chartUtilService"),
            symbolForData = chartUtilService.getInfinitSymbolFromChartSymbol(symbol);
        var marketOpenTimes  = {
            is24Hours : true,
            isOpenNow: true,
            lastOpenTime : null,
            lastCloseTime: null,
            openHours:12.5
        };

        if(symbol.symbolType === "EQU") {
            var date = new Date();
            marketOpenTimes.is24Hours = false;
            marketOpenTimes.lastOpenTime = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(),0, 0, 0);
            marketOpenTimes.openHours = 12.5;
            marketOpenTimes.isOpenNow = true;
        }

        return marketOpenTimes; // return
    };

    infChart.xinDataProvider.prototype.getSymbols = function (searchText, onSuccess, onError) {
        var self = this, promise, 
            symbolsService = this._getAngularService("symbolsService"),
            chartUtilService = this._getAngularService("chartUtilService"),
            instrumentMapper = this._getAngularService("instrumentMapper"),
            searchParam = {'pattern': encodeURIComponent(searchText), 'vendor': self._vendor, 'limit': 10};

        promise = symbolsService.searchInstruments(searchParam);
        promise.then(function(data) {
            var symbols = [];
            infChart.util.forEach(data, function (i, item) {
                var symbolIns = instrumentMapper.convertInstrumentToSymbol(item.id);
                var symbol = chartUtilService.getChartSymbol(symbolIns);
                symbols.push({
                    label: symbol.symbol + ' ' + symbol.exchange,
                    value: symbol.symbol + ' ' + symbol.exchange,
                    symbolItem: symbol
                });
            });
            onSuccess(symbols);
        }, function(error) {
            onError(error);
        });
    };

    /**
     * Check the linearity of given instrument
     * @param {object} symbol chart symbol
     * @returns {boolean} linearity
     */
    infChart.dataProvider.prototype.isLinearData = function (symbol) {
        return symbol.symbolType === "CUR" || symbol.symbolType == "AGG";
    };

    /**
     * Send the ajax request with the given options in the requestObj
     * @param {object} requestObj request options
     * @returns {*}
     * @private
     */
    infChart.dataProvider.prototype._sendRequest = function (requestObj) {
        return $.ajax({
            url: requestObj.useDirectURL ? requestObj.url : '/frontend' + requestObj.url,
            contentType: requestObj.contentType ? requestObj.contentType : 'application/json',
            data: requestObj.data,
            dataType: requestObj.dataType ? requestObj.dataType : 'json',
            method: requestObj.method ? requestObj.method : 'GET'
        });
    };

    /**
     * Scan patterns for the given data set
     * @param {string} data in csv format
     * @param {function} onSuccess success function
     * @param {function} onError error function
     */
    infChart.xinDataProvider.prototype.scanPattern = function (data, onSuccess, onError) {
        var requestObj = {
            //useDirectURL: true,
            method: "POST",
            url: '/request/XC/HMPATT?token=bvkadm16jeia8dbc4js0',
            data: JSON.stringify({data: data})
        };

        this._sendRequest(requestObj).done(function (responseData) {
            onSuccess(responseData.data);
        }).fail(function (error) {
            onError(error);
        });
    };

    infChart.xinDataProvider.prototype.getFavouriteColors = function (onSuccess) {
        var self = this, promise,
        chartFavoritesService = this._getAngularService("chartFavoritesService");

        promise = chartFavoritesService.getFavoriteColors();
        promise.then(function(data) {
            onSuccess(data);
        }, function(error) {
            // onError(error);
        });
    };

    infChart.xinDataProvider.prototype.setFavouriteColors = function (favouriteColors) {
        var self = this, promise,
        chartFavoritesService = this._getAngularService("chartFavoritesService");

        promise = chartFavoritesService.setFavoriteColors(favouriteColors);
        promise.then(function(data) {
            onSuccess(data);
        }, function(error) {
            // onError(error);
        });
    };

    infChart.xinDataProvider.prototype.getFavouriteCandleCount = function (onSuccess, onError) {
        var self = this, promise,
        chartFavoritesService = this._getAngularService("chartFavoritesService");

        promise = chartFavoritesService.getFavouriteCandleCount();
        promise.then(function(data) {
            onSuccess(data);
        }, function(error) {
            onError(error);
        });
    };

    infChart.xinDataProvider.prototype.setFavouriteCandleCount = function (candleCount, onSuccess, onError) {
        var self = this, promise,
        chartFavoritesService = this._getAngularService("chartFavoritesService");

        promise = chartFavoritesService.setFavouriteCandleCount(candleCount);
        promise.then(function(data) {
            onSuccess(data);
        }, function(error) {
            onError(error);
        });
    };

})(infChart, jQuery, angular);