(function (infChart, $) {

    infChart.xinDataProvider = function (vendor, timezoneOffset, webSocketEvents) {
        infChart.dataProvider.apply(this, arguments);

        var webSocketURL = "wss://dev.xinfinit.com/frontend/streaming-socket/?dataformat=json";

        this._vendor = vendor;

        /**
         * Open a new WebSocket connection using the given parameters
         */
        var _openWSConnection = function (webSocketURL) {
            var self = this;
            console.log("openWSConnection::Connecting to: " + webSocketURL);
            try {
                webSocket = new WebSocket(webSocketURL);
                webSocket.binaryType = 'arraybuffer';
                webSocket.onopen = function (openEvent) {
                    console.log("WebSocket OPEN: " + JSON.stringify(openEvent, null, 4));
                    webSocketEvents.initialize.call(self);
                };
                webSocket.onclose = function (closeEvent) {
                    console.log("WebSocket CLOSE: " + JSON.stringify(closeEvent, null, 4));
                };
                webSocket.onerror = function (errorEvent) {
                    console.log("WebSocket ERROR: " + JSON.stringify(errorEvent, null, 4));
                };
                webSocket.onmessage = function (messageEvent) {
                    var wsMsg;
                    if (typeof messageEvent.data === 'string') {
                        wsMsg = JSON.parse(messageEvent.data); // simple text messages must always be json
                    } else {
                        if ('TextDecoder' in window) {
                            wsMsg = JSON.parse(new TextDecoder('utf8').decode(new DataView(messageEvent.data))); // decode as utf-8
                        } else {
                            wsMsg = JSON.parse(String.fromCharCode.apply(null, new Uint8Array(messageEvent.data))); // fallback decode as ascii
                        }
                    }
                    if (wsMsg && wsMsg.dataSource) {
                        switch (wsMsg.dataSource) {
                            case 'QUO':
                                _handleQuoteUpdates(wsMsg, self, webSocketEvents.realTimeCallback);
                                break;
                            case 'OBK':
                                _handleOrderBookUpdates(wsMsg, self, webSocketEvents.depthCallback);
                                break;
                            default:
                                break;
                        }

                    }
                };
                return webSocket;
            } catch (exception) {
                console.error(exception);
            }
        };

        var _handleQuoteUpdates = function (wsMsg, providerInstance, callback) {
            if (wsMsg.itemUpdates) {
                wsMsg.itemUpdates.sort(function (update1, update2) {
                    return update1.timestamp > update2.timestamp;
                });
                wsMsg.itemUpdates.forEach(function (update) {
                    if (update.fields.trdTime && (update.fields.trdPrc || update.fields.trdVol)) {
                        var symbol = providerInstance._getChartSymbolFromInstrument(update.id.instrument);
                        if (typeof callback === 'function') {
                            callback({
                                symbol: symbol.symbol,
                                symbolId: symbol.symbolId,
                                currency: symbol.currency,
                                symbolType: symbol.symbolType,
                                provider: symbol.provider,
                                close: update.fields.trdPrc,
                                dateTime: update.fields.trdTime,
                                volume: update.fields.trdVol,
                                timeZoneOffset: timezoneOffset
                            });
                        }
                    }
                });
            }
        };

        var _handleOrderBookUpdates = function (wsMsg, providerInstance, callback) {
            if (wsMsg.tableUpdates) {
                wsMsg.tableUpdates.sort(function (update1, update2) {
                    return update1.timestamp > update2.timestamp;
                });
                wsMsg.tableUpdates.forEach(function (update) {
                    var symbol = providerInstance._getChartSymbolFromInstrument(update.id.instrument);
                    if (typeof callback === 'function') {
                        var snapshot = _handleOrderBookUpdate({
                            symbol: symbol.symbol,
                            symbolId: symbol.symbolId,
                            currency: symbol.currency,
                            symbolType: symbol.symbolType,
                            provider: symbol.provider,
                            columns: update.columns,
                            rows: update.rows,
                            updateType: update.updateType,
                            timestamp: update.timestamp,
                            errorCode: update.errorCode
                        });
                        callback(_getChartData(snapshot, {}));
                    }
                });
            }
        };

        var _getIntervalDate = function (time, interval, regularIntervalsOnUpdate) {

            switch (interval) {
                case 'Y':
                    time = _getTimeZoneConvertedChartTime(infChart.util.getLastDayOfYear(time, !regularIntervalsOnUpdate));
                    break;
                case 'M':
                    time = _getTimeZoneConvertedChartTime(infChart.util.getLastDayOfMonth(time, !regularIntervalsOnUpdate));
                    break;
                case 'W':
                    time = _getTimeZoneConvertedChartTime(infChart.util.getLastDayOfWeek(time, !regularIntervalsOnUpdate));
                    break;
                default:
                    break;
            }
            return time;
        };

        var _getTimeZoneConvertedChartTime = function (time) {
            var chartTime = +(time) + +(timezoneOffset) * 60 * 60000;
            return chartTime;
        };

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
                // url: requestObj.useDirectURL ? requestObj.url : '/frontend' + requestObj.url,
                url: requestObj.useDirectURL ? requestObj.url : '/frontend' + requestObj.url,
                contentType: requestObj.contentType ? requestObj.contentType : 'application/json',
                data: requestObj.data,
                dataType: requestObj.dataType ? requestObj.dataType : 'json',
                method: requestObj.method ? requestObj.method : 'GET'
            });
        };

        this._convertHistoryData = function (columns, values, interval, regularIntervalsOnUpdate) {
            var result = [],
                resultMap = {},
                mapCurrentTimes = {},
                hasOpenHighLow = false;

            if (typeof columns !== 'undefined' && typeof values !== 'undefined') {
                var openIndex = $.inArray('prcOpen', columns), closeIndex = $.inArray('prcLast', columns),
                    highIndex = $.inArray('prcHigh', columns), lowIndex = $.inArray('prcLow', columns), volumeIndex = $.inArray('volAcc', columns),
                    bidIndex = $.inArray('bidLast', columns), askIndex = $.inArray('askLast', columns),
                    askHighIndex = $.inArray('askHigh', columns), bidLowIndex = $.inArray('bidLow', columns),
                    count = 0;

                for (var time in values) {
                    if (values.hasOwnProperty(time)) {
                        var chartTime = _getTimeZoneConvertedChartTime(time),
                            valArray = values[time], intervalDate = _getIntervalDate(chartTime, interval, regularIntervalsOnUpdate),
                            dataRow = undefined;

                        if ((valArray[closeIndex] != null && !isNaN(valArray[closeIndex])) ||
                            (valArray[bidIndex] != null && !isNaN(valArray[bidIndex])) ||
                            (valArray[askIndex] != null && !isNaN(valArray[askIndex]))) {

                            var close = valArray[closeIndex],
                                open = isNaN(valArray[openIndex]) ? null : valArray[openIndex],
                                low = isNaN(valArray[lowIndex]) ? null : valArray[lowIndex],
                                high = isNaN(valArray[highIndex]) ? null : valArray[highIndex];

                            hasOpenHighLow = (open != null || low != null || high != null);

                            if (high == null && (open != null || low != null)) {
                                high = Math.max(open, low, close);
                            }

                            if (low == null && (open != null || high != null)) {
                                low = Math.min((high == null && Number.MAX_VALUE) || high, (open == null && Number.MAX_VALUE) || open, close);
                            }
                            // if volume is null set null to the data row as well, instead of zero to avoid drawing volume chart for zero values
                            // if (_validateData(open, high, low, close)) {
                                dataRow = [
                                    intervalDate,
                                    open != null ? open : close,
                                    high != null ? high : close,
                                    low != null ? low : close,
                                    close, valArray[volumeIndex] /*|| 0*/, valArray[bidIndex], valArray[askIndex], valArray[askHighIndex], valArray[bidLowIndex]];
                            // } else{
                            //     console.log("Data Validation Failed")
                            //     console.log("timestamp:" + chartTime + " Open:"+ open + " Close:" + close + " High:" + high + " Low:" + low);
                            // }
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

            return {data: result, dataMap: resultMap, hasOpenHighLow: hasOpenHighLow};
        };

        //tempory fix for chart data handling 
        function _validateData(open, high, low, close){
            if((high >= low) && (high >= open && high >= close) && (low <= open && low <= close)){
                return true;
            }
            return false;
        }

        if (typeof webSocketEvents !== 'undefined') {
            this._websocket = _openWSConnection.call(this, webSocketURL);
        }

        //region order book update processing

        function _processUpdate(update, fullData) {
            var idIdx = update.columns.indexOf('id'),
                priceIdx = update.columns.indexOf('prc'),
                volumeIdx = update.columns.indexOf('sz');

            //TODO: remove this after Matthias/Gabrial fixed the server field ids
            idIdx = (idIdx != -1) ? idIdx : update.columns.indexOf('id');
            priceIdx = (priceIdx != -1) ? priceIdx : update.columns.indexOf('prc');
            volumeIdx = (volumeIdx != -1) ? volumeIdx : update.columns.indexOf('sz');

            var rawBidMap = {}, rawAskMap = {};
            update.rows.forEach(function (row) {
                var id = row[idIdx], volume = row[volumeIdx], price = row[priceIdx];//, type = row[typeIdx];
                if (id > 0) {
                    rawBidMap[id] = {'price': price, 'volume': volume};
                    if (volume > 0) {
                        fullData.rawBidMap[id] = rawBidMap[id];
                    } else {
                        delete fullData.rawBidMap[id];//ideally volume should always be 0
                    }
                } else {
                    rawAskMap[id] = {'price': price, 'volume': volume};
                    if (volume > 0) {
                        fullData.rawAskMap[id] = rawAskMap[id];
                    } else {
                        delete fullData.rawAskMap[id];//ideally volume should always be 0
                    }
                }
            });
            return {'rawBidMap': rawBidMap, 'rawAskMap': rawAskMap};
        }

        function _getSnapshotDataByType(entries, limit, isBid) {
            var toArray = [];
            for (var id in entries) {
                if (entries.hasOwnProperty(id)) {
                    toArray.push({
                        price: entries[id].price,
                        volume: entries[id].volume,
                        type: isBid ? 'Buy' : 'Sell'
                    });
                }
            }

            toArray.sort(function (a, b) {
                return a['price'] - b['price'];
            });

            var i, len, rArr = [];
            if (isBid) {
                i = toArray.length;
                len = toArray.length > limit ? toArray.length - limit : 0;
                for (i; i > len; i--) {
                    rArr.push(toArray[i - 1]);
                    //rMap[toArray[i - 1].price] = toArray[i - 1].volume;
                }
            } else {
                i = 0;
                len = toArray.length > limit ? limit : toArray.length;
                for (i; i < len; i++) {
                    rArr.push(toArray[i]);
                    //rMap[toArray[i].price] = toArray[i].volume;
                }
            }
            return rArr;
        }

        function _saveToLocalStorage(symbolId, data) {
            localStorage.setItem(symbolId, JSON.stringify(data));
        }

        function _getFromLocalStorage(symbolId) {
            return localStorage.getItem(symbolId) ? JSON.parse(localStorage.getItem(symbolId)) : undefined;
        }

        function _handleOrderBookUpdate(update) {
            var storedData = _getFromLocalStorage(update.symbolId);
            if (typeof storedData === 'undefined') {
                storedData = {
                    rawBidMap: {},
                    rawAskMap: {}
                };
            }
            var snapshot = {
                symbolId: update.symbolId
            };
            switch (update.updateType) {
                case 'SNP':
                    _processUpdate(update, storedData);
                    _saveToLocalStorage(update.symbolId, storedData);
                    snapshot.bids = _getSnapshotDataByType(storedData.rawBidMap, 1000, true);
                    snapshot.asks = _getSnapshotDataByType(storedData.rawAskMap, 1000, false);
                    break;
                case 'UPD':
                    _processUpdate(update, storedData);
                    _saveToLocalStorage(update.symbolId, storedData);
                    snapshot.bids = _getSnapshotDataByType(storedData.rawBidMap, 1000, true);
                    snapshot.asks = _getSnapshotDataByType(storedData.rawAskMap, 1000, false);
                    break;
                case 'INF':
                case 'INB':
                case 'DEL':
                    break;
                case 'ERR':
                    snapshot.errorCode = update.errorCode;
                    break;
            }
            return snapshot;
        }

        //endregion

        //region depth data processing

        /**
         * check is bid valid
         * @param {number} bid
         * @param {number} bestBid
         * @param {number} bestAsk
         * @param {object} extremes
         * @returns {{consider: boolean, inverseExceeded: boolean}}
         * @private
         */
        function _considerBid(bid, bestBid, bestAsk, extremes) {
            var consider = false, inverseExceeded = false;
            if (extremes) {
                if (extremes.min) {
                    consider = bid > extremes.min;
                } else if (extremes.minZoom) {
                    consider = bid > bestBid * (1 - extremes.minZoom);
                } else {
                    consider = bid > bestBid * 0.5;
                }
            } else {
                consider = bid > bestBid * 0.5;
            }

            if (consider && extremes) {
                if (extremes.max) {
                    inverseExceeded = bid > extremes.max;
                } else if (extremes.maxZoom && bestAsk) {
                    inverseExceeded = bid > bestAsk * (1 + extremes.maxZoom);
                }
            }
            return {'consider': consider, 'inverseExceeded': inverseExceeded};
        }

        /**
         * check is ask valid
         * @param {number} ask
         * @param {number} bestAsk
         * @param {number} bestBid
         * @param {object} extremes
         * @returns {{consider: boolean, inverseExceeded: boolean}}
         * @private
         */
        function _considerAsk(ask, bestAsk, bestBid, extremes) {
            var consider = false, inverseExceeded = false;
            if (extremes) {
                if (extremes.max) {
                    consider = ask < extremes.max;
                } else if (extremes.maxZoom) {
                    consider = ask < bestAsk * (1 + extremes.maxZoom);
                } else {
                    consider = ask < bestAsk * 1.5;
                }
            } else {
                consider = ask < bestAsk * 1.5;
            }

            if (consider && extremes) {
                if (extremes.min) {
                    inverseExceeded = ask < extremes.min;
                } else if (extremes.maxZoom && bestAsk) {
                    inverseExceeded = ask < bestBid * (1 - extremes.minZoom);
                }
            }
            return {'consider': consider, 'inverseExceeded': inverseExceeded};
        }

        /**
         * get chart data
         * @param {Symbol} symbol
         * @param {Object} rawData
         * @param {object} extremes min and max zoom
         * @returns {{data: {bid: Array.<ChartDataPoint>, ask: Array.<ChartDataPoint>}, min: number, max: number, mid: number}}
         * @private
         */
        function _getChartData(rawData, extremes) {
            var chartBidArray = [], chartAskArray = [], max = null, mid = 0, count = 0, priceMin, priceMax, cumulativeVolume = 0, cumulativeValue = 0;

            if (rawData) {
                var bids = rawData.bids, asks = rawData.asks, bestBid, bestAsk;
                if (bids && bids.length > 0) {
                    bestBid = bids[0].price;
                }

                if (asks && asks.length > 0) {
                    bestAsk = asks[0].price;
                }

                bids && bids.some(function (record) {
                    var status = _considerBid(record.price, bestBid, bestAsk, extremes);
                    if (status.consider && !status.inverseExceeded) {
                        cumulativeVolume += record.volume;
                        cumulativeValue += (record.price * record.volume);
                        chartBidArray.push(_getChartDataPoint(record.price, record.volume, cumulativeValue, cumulativeVolume, true));
                        priceMin = record.price;
                    }
                    return chartBidArray.length === 1500 || !status.consider;
                });

                max = cumulativeVolume;

                chartBidArray.sort(function (a, b) {
                    return a.x - b.x;
                });

                if (bestBid) {
                    mid += bestBid;
                    count++;
                }

                cumulativeVolume = 0;
                cumulativeValue = 0;
                asks && asks.some(function (record) {
                    var status = _considerAsk(record.price, bestAsk, bestBid, extremes);
                    if (status.consider && !status.inverseExceeded) {
                        cumulativeVolume += record.volume;
                        cumulativeValue += (record.price * record.volume);
                        chartAskArray.push(_getChartDataPoint(record.price, record.volume, cumulativeValue, cumulativeVolume, false));
                    }
                    return chartAskArray.length === 1500 || !status.consider;
                });

                if (max) {
                    max = Math.max(max, cumulativeVolume);
                } else {
                    max = cumulativeVolume;
                }

                if (bestAsk) {
                    mid += bestAsk;
                    count++;
                }
            }

            if (chartBidArray.length > 0) {
                priceMin = chartBidArray[0].x;
            }

            if (chartAskArray.length > 0) {
                priceMax = chartAskArray[chartAskArray.length - 1].x;
            }

            if (count > 0) {
                mid = mid / count;
            }

            return {
                'data': {'bid': chartBidArray, 'ask': chartAskArray},
                'min': 0,
                'priceMin': priceMin,
                'max': max,
                'priceMax': priceMax,
                'mid': mid
            }
        }

        /**
         * represents series point
         * @param {number} price
         * @param {number} volume
         * @param {number} cumulativeValue
         * @param {number} cumulativeVolume
         * @param {boolean} isBid
         * @returns {ChartDataPoint}
         * @private
         */
        function _getChartDataPoint(price, volume, cumulativeValue, cumulativeVolume, isBid) {
            return {
                'x': price,
                'y': cumulativeVolume,
                'bid': isBid,
                'volume': volume,
                'cumulativeValue': cumulativeValue
            };
        }

        //endregion
    };

    infChart.util.extend(infChart.dataProvider, infChart.xinDataProvider);

    infChart.xinDataProvider.prototype.getHistoryData = function (symbol, interval, fromDate, toDate, onSuccess, onError, regularIntervalsOnUpdate, requestColums, requestWithMinutes) {
        function _getIntervalForService(interval) {
            switch (interval) {
                case 'T':
                case 'I_1':
                    return '1m';
                case 'I_2':
                    return '2m';
                case 'I_3':
                    return '3m';
                case 'I_5':
                    return '5m';
                case 'I_10':
                    return '10m';
                case 'I_15':
                    return '15m';
                case 'I_30':
                    return '30m';
                case 'I_60':
                    return '1h';
                case 'I_120':
                    return '2h';
                case 'I_240':
                    return '4h';
                case 'I_360':
                    return '6h';
                case 'W':
                    return 'week';  
                case 'M':
                    return 'month';   
                default:
                    return '1d';
            }
        }

        function _addLeadingZeros(number, places) {
            var numString = number.toString(),
                zero = places - numString.length + 1;
            return Array(+(zero > 0 && zero)).join("0") + numString;
        };

        var _formatDate = function (date, addMinutes, isFrom) {
            if (date !== undefined) {
                var year = date.getFullYear(),
                    month = date.getMonth() + 1,
                    day = date.getDate();

                var dateArray = [year, _addLeadingZeros(month, 2), _addLeadingZeros(day, 2)];

                var timeComponent;
                if (addMinutes) {
                    timeComponent = 'T' + _addLeadingZeros(date.getHours(), 2) + ':' + _addLeadingZeros(date.getMinutes(), 2) + '+00:00';
                } else {
                    timeComponent = isFrom ? 'T00:00+00:00' : 'T23:59+00:00';
                }

                return dateArray.join('-') + timeComponent;
            } else {
                return date;
            }

        };

        // function _formatDate(date, requestWithMinutes) {
        //         var year = date.getFullYear(),
        //             month = date.getMonth() + 1,
        //             day = date.getDate();
        //
        //         var dateArray = [year, month < 10 ? '0' + month : month, day < 10 ? '0' + day : day];
        //
        //         return dateArray.join('-');
        // }

        var self = this, instrument = JSON.stringify(self._getInstrumentForService(symbol));
        var columns = requestColums ? requestColums : "askLast,bidLast,askHigh,bidLow,prcOpen,prcHigh,prcLow,prcLast,volAcc";

        if (toDate) {
            var dataUrl = encodeURIComponent(instrument) + "/interval/" + _getIntervalForService(interval) + "/columns/" + columns + "/from/" + _formatDate(fromDate, requestWithMinutes, true) + "/to/" + _formatDate(toDate, requestWithMinutes, false);
        } else {
            var dataUrl = encodeURIComponent(instrument) + "/interval/" + _getIntervalForService(interval) + "/columns/" + columns + "/from/" + _formatDate(fromDate, requestWithMinutes, true);
        }   

        this._sendRequest({
            url: '/request-by-instrument/HST/' + dataUrl,
            data: {}
        }).done(function (responseData) {
            onSuccess(self._convertHistoryData(responseData.columns, responseData.values, interval, regularIntervalsOnUpdate));
        }).fail(function () {
            onError(self._convertHistoryData([], {}, interval, regularIntervalsOnUpdate));

        });
    };

    infChart.xinDataProvider.prototype.getRealTimeData = function (symbol, subscribe) {

        if (typeof this._websocket === 'undefined') {
            console.error("webSocket is not defined ");
            return;
        } else if (this._websocket.readyState != WebSocket.OPEN) {
            console.error("webSocket is not open: " + this._websocket.readyState);
            return;
        }

        var msg;
        if (subscribe) {
            msg = {
                "dataSource": 'QUO',
                "subscribeItems": [{"instrument": this._getInstrumentForService(symbol), "params": {}}]
            }
        } else {
            msg = {
                "dataSource": 'QUO',
                "unsubscribeItems": [{"instrument": this._getInstrumentForService(symbol), "params": {}}]
            }
        }
        this._websocket.send(JSON.stringify(msg));
    };

    infChart.xinDataProvider.prototype.getDepthData = function (symbol, subscribe) {

        if (typeof this._websocket === 'undefined') {
            console.error("webSocket is not defined ");
            return;
        } else if (this._websocket.readyState != WebSocket.OPEN) {
            console.error("webSocket is not open: " + this._websocket.readyState);
            return;
        }

        var msg;
        if (subscribe) {
            msg = {
                "dataSource": 'OBK',
                "subscribeTables": [{"instrument": this._getInstrumentForService(symbol), "filter": {}, "limit": 0}]
            }
        } else {
            msg = {
                "dataSource": 'OBK',
                "unsubscribeTables": [{"instrument": this._getInstrumentForService(symbol), "filter": {}, "limit": 0}]
            }
        }
        this._websocket.send(JSON.stringify(msg));
    };

    infChart.xinDataProvider.prototype.getMarketOpenTimes = function (symbol) {
        var marketOpenTimes = {
            is24Hours: true,
            isOpenNow: true,
            lastOpenTime: null,
            lastCloseTime: null,
            openHours: 12.5
        };

        if (symbol.symbolType === "EQU") {
            var date = new Date();
            marketOpenTimes.is24Hours = false;
            marketOpenTimes.lastOpenTime = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0);
            marketOpenTimes.openHours = 12.5;
            marketOpenTimes.isOpenNow = true;
        }
        return marketOpenTimes;
    };

    infChart.xinDataProvider.prototype.getSymbols = function (searchText, onSuccess, onError) {
        var self = this;

        var requestObj = {
            url: '/search/instruments?',
            data: {'pattern': encodeURIComponent(searchText), 'vendor': self._vendor, 'limit': 10}
        };

        this._sendRequest(requestObj).done(function (responseData) {
            var symbols = [];
            infChart.util.forEach(responseData, function (i, item) {
                var symbol = self._getChartSymbolFromInstrument(item);
                symbols.push({
                    label: symbol.symbol + ' ' + symbol.exchange,
                    value: symbol.symbol + ' ' + symbol.exchange,
                    symbolItem: symbol
                });
            });
            onSuccess(symbols);
        }).fail(function (error) {
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
     * Scan patterns for the given data set
     * @param {string} data in csv format
     * @param {function} onSuccess success function
     * @param {function} onError error function
     */
    infChart.xinDataProvider.prototype.scanPattern = function (data, onSuccess, onError) {
        var requestObj = {
            useDirectURL: true,
            method: "POST",
            url: '/harmonicpattern?token=bvkadm16jeia8dbc4js0',
            data: JSON.stringify({data: data})
        };

        this._sendRequest(requestObj).done(function (responseData) {
            onSuccess(responseData.data);
        }).fail(function (error) {
            onError(error);
        });
    };

})(infChart, jQuery);