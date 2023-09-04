(function(infChart, $) {

    infChart.webfgDataProvider = function () {
        infChart.dataProvider.apply(this, arguments);
    };

    infChart.util.extend(infChart.dataProvider, infChart.webfgDataProvider);

    infChart.webfgDataProvider.prototype.getHistoryData = function (symbol, interval, fromDate, toDate, onSuccess, onError) {

        /**
         * convert data
         * @param {string} response
         * @returns {{data: Array, dataMap: {}}}
         * @private
         */
        function _convertData(response) {
            var result = [], resultCount = 0, resultMap = {}, NO_OF_POINTS = 1000, conflateUnits = 1,
                conflateType = "minute", currentConflateTime, dataTimeToConflate, doConflate = false;

            if (response && response.indexOf('BEGINDATA') === 0) {
                var arr = response.split('\n');
                var headerArr = arr[0].split(' ');
                var interval = headerArr[2];
                var isOHLCVT = true;
                var isSecondsAvailable = false;
                var isMonthAvailable = true;
                var isDayAvailable = true;
                var startIndex = 0;

                var dataCount = arr.length;//parseInt(headerArr[headerArr.length - 1], 10),
                var close, volume;
                if (interval === 'TICKS') {
                    isOHLCVT = false;
                    isSecondsAvailable = true;
                    //startIndex =  Math.max(0,dataCount-1000);
                    resultCount = dataCount;// Math.min(dataCount, NO_OF_POINTS);
                    conflateType = "seconds";
                    conflateUnits = 10;
                    doConflate = true;
                } else {
                    if (interval === 'Intraday') {
                        isSecondsAvailable = true;
                        resultCount = dataCount; //Math.min(dataCount, NO_OF_POINTS);
                        doConflate = true;
                    } else if (interval == "MONTHLY") {
                        isDayAvailable = false;
                        resultCount = dataCount;
                    } else if (interval === "YEARLY") {
                        isDayAvailable = false;
                        isMonthAvailable = false;
                        resultCount = dataCount;
                    } else {
                        resultCount = dataCount;
                    }
                }
                result = new Array(resultCount);

                var dataMap = {}, currentIdx = resultCount - 1;
                for (var i = dataCount; i > startIndex; i--) {
                    var dataItem = arr[i];

                    if (dataItem) {
                        var val = dataItem.split(';');

                        try {
                            var dt = val[0].split('-'), time, dataRow;

                            if (isSecondsAvailable) {
                                if (conflateType == "seconds") {
                                    dataTimeToConflate = Date.UTC(parseInt(dt[0], 10), parseInt(dt[1], 10) - 1, parseInt(dt[2], 10), parseInt(dt[3], 10), parseInt(dt[4], 10), parseInt(dt[5], 10), 0);
                                    if (currentConflateTime) {
                                        var ct = new Date(currentConflateTime);
                                        ct.setUTCSeconds(Math.ceil(ct.getUTCSeconds() / conflateUnits) * conflateUnits);

                                        var dtc = new Date(dataTimeToConflate);
                                        dtc.setUTCSeconds(Math.ceil(dtc.getUTCSeconds() / conflateUnits) * conflateUnits);

                                        var timeDiff = ct.getTime() - dtc.getTime();
                                        dataTimeToConflate = (timeDiff) ? dataTimeToConflate : currentConflateTime;
                                    }
                                } else {
                                    dataTimeToConflate = Date.UTC(parseInt(dt[0], 10), parseInt(dt[1], 10) - 1, parseInt(dt[2], 10), parseInt(dt[3], 10), parseInt(dt[4], 10), 0, 0);
                                }
                                time = Date.UTC(parseInt(dt[0], 10), parseInt(dt[1], 10) - 1, parseInt(dt[2], 10), parseInt(dt[3], 10), parseInt(dt[4], 10), parseInt(dt[5], 10), 0);
                            } else if (isDayAvailable) {
                                time = Date.UTC(parseInt(dt[0], 10), parseInt(dt[1], 10) - 1, parseInt(dt[2], 10), parseInt(dt[3], 10), parseInt(dt[4], 10), 0, 0);
                            } else if (isMonthAvailable) {
                                time = Date.UTC(parseInt(dt[0], 10), parseInt(dt[1], 10) - 1, 1, 0, 0, 0, 0);
                            } else {
                                time = Date.UTC(parseInt(dt[0], 10), 1, 1, 0, 0, 0, 0);
                            }

                            //time = this.getChartTime(time, timeZoneOffset);
                            //dataTimeToConflate = this.getChartTime(dataTimeToConflate, timeZoneOffset);

                            if (!isNaN(time)) {
                                if (isOHLCVT) {
                                    var open = val[1] !== '' ? parseFloat(val[1]) : 0;
                                    var high = val[2] !== '' ? parseFloat(val[2]) : 0;
                                    var low = val[3] !== '' ? parseFloat(val[3]) : 0;
                                    close = val[4] !== '' ? parseFloat(val[4]) : 0;
                                    volume = val[5] !== '' ? parseInt(val[5], 10) : 0;
                                    dataRow = [time, open, high, low, close, volume];
                                } else {
                                    close = val[1] !== '' ? parseFloat(val[1]) : 0;
                                    volume = val[2] !== '' ? parseInt(val[2], 10) : 0;
                                    dataRow = [time, close, close, close, close, volume];
                                }

                                if (doConflate) {
                                    if (!dataMap[dataTimeToConflate]) {
                                        currentConflateTime = dataTimeToConflate;
                                        result[currentIdx] = dataRow;
                                        resultMap[currentConflateTime] = dataRow;
                                        dataMap[time] = {/*index : currentIdx,*/ count: 0};
                                        currentIdx--;
                                    }
                                } else {
                                    if (dataMap[time] == undefined || interval != 'TICKS') {
                                        result[currentIdx] = dataRow;
                                        resultMap[time] = dataRow;
                                        dataMap[time] = {/*index: currentIdx,*/ count: 1000};
                                        currentIdx--;
                                    } else {
                                        dataMap[time].count--;
                                        time = time + dataMap[time].count;
                                        if (dataMap[time].count >= 0) {
                                            dataRow[0] = time;
                                            result[currentIdx] = dataRow;
                                            resultMap[time] = dataRow;
                                            currentIdx--;
                                        }
                                    }
                                }
                            }
                        } catch (e) {
                            infChart.util.console.error(e);
                        }
                    }
                }

                if (currentIdx >= 0) {
                    result.splice(0, currentIdx + 1);
                }
            }

            return {data: result, dataMap: resultMap};
        }

        function _success(responseData) {
            onSuccess(_convertData(responseData));
        }

        function _error() {
            onError(_convertData([], {}, interval));
        }

        function _getInstrumentForService(symbol) {
            return symbol.symbolId;
        }

        function _getIntervalForService(interval) {
            switch (interval) {
                case 'T':
                    return 'TICKS';
                case 'I_1':
                    return 'Intraday 1';
                case 'I_3':
                    return 'Intraday 3';
                case 'I_5':
                    return 'Intraday 5';
                case 'I_15':
                    return 'Intraday 15';
                case 'I_30':
                    return 'Intraday 30';
                case 'I_60':
                    return 'Intraday 60';
                case 'I_120':
                    return 'Intraday 120';
                case 'I_240':
                    return 'Intraday 240';
                case 'I_360':
                    return 'Intraday 360';
                case 'W':
                    return 'WEEKLY';
                case 'M':
                    return 'MONTHLY';
                case 'Y':
                    return 'YEARLY';
                default :
                    return 'DAILY';
            }
        }

        function _formatDate(date) {
            var year = date.getFullYear(),
                month = date.getMonth() + 1,
                day = date.getDate();

            var dateArray = [year, month < 10 ? '0' + month : month, day < 10 ? '0' + day : day];

            return dateArray.join('');
        }

        var dataUrl = "symbol=" + _getInstrumentForService(symbol) + "&unit=" + _getIntervalForService(interval) + "&from=" + _formatDate(fromDate) + "&to=" + _formatDate(toDate);

        $.ajax({
            url: '/x-one-webfg/dataService/dataRequest?' + dataUrl,
            dataType: 'text',
            success: function (dataObj) {
                _success(dataObj);
            },
            error: function (xhr, ajaxOptions, thrownError) {
                _error(xhr, ajaxOptions, thrownError);
            }
        });
    };

    /**
     * Check the linearity of given instrument
     * @param {object} symbol chart symbol
     * @returns {boolean} linearity
     */
    infChart.dataProvider.prototype.isLinearData = function (symbol) {
        return false;
    };
})(infChart, jQuery);