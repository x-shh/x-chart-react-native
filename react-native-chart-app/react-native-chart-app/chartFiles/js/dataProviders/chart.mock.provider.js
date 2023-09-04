(function(infChart, $){

    infChart.mockDataProvider = function () {
        infChart.dataProvider.apply(this, arguments);

        this._convertSymbol = function(symbol){
            return {
                symbol: symbol.name,
                symbolId: symbol.name + '.' + symbol.exchange,//todo ???
                symbolDesc: symbol.name,
                symbolType: symbol.type,
                currency: symbol.currency,
                exchange: symbol.exchange,
                dp: symbol.dp ? symbol.dp : 2,
                provider: symbol.provider
            }
        }
    };

    infChart.util.extend(infChart.dataProvider, infChart.mockDataProvider);

    infChart.mockDataProvider.prototype.getHistoryData = function (symbol, interval, fromDate, toDate, onSuccess, onError) {

        function _getInstrumentForService(symbol) {
            return symbol.symbol + '.' + symbol.exchange;
        }

        function _getIntervalForService(interval) {
            switch (interval) {
                case 'T':
                case 'I_1':
                case 'I_3':
                case 'I_5':
                case 'I_15':
                case 'I_30':
                case 'I_60':
                case 'I_120':
                case 'I_240':
                case 'I_360':
                    return 'ticks_data_';
                default :
                    return 'history_data_';
            }
        }

        /**
         * convert data
         * @param {Array<string>} columns
         * @param {object} values
         * @param {string} interval
         * @returns {{data: Array, dataMap: {}}}
         * @private
         */
        function _convertData(columns, values, interval) {
            var result = [],
                resultMap = {},
                mapCurrentTimes = {};

            if (typeof columns !== 'undefined' && typeof values !== 'undefined') {
                var openIndex = $.inArray('prcOpen', columns), closeIndex = $.inArray('prcLast', columns),
                    highIndex = $.inArray('prcHigh', columns), lowIndex = $.inArray('prcLow', columns), volumeIndex = $.inArray('volAcc', columns),
                    bidIndex = $.inArray('bidLast', columns), askIndex = $.inArray('askLast', columns),
                    count = 0;

                for (var time in values) {
                    if (values.hasOwnProperty(time)) {
                        time = parseInt(time);
                        var valArray = values[time], intervalDate = _getIntervalDate(time, interval), dataRow;
                        if (valArray[closeIndex] != null && !isNaN(valArray[closeIndex])) {

                            var close = valArray[closeIndex],
                                open = isNaN(valArray[openIndex]) ? null : valArray[openIndex],
                                low = isNaN(valArray[lowIndex]) ? null : valArray[lowIndex],
                                high = isNaN(valArray[highIndex]) ? null : valArray[highIndex];

                            if (high == null && (open != null || low != null)) {
                                high = Math.max(open, low, close);
                            }

                            if (low == null && (open != null || high != null)) {
                                low = Math.min((high == null && Number.MAX_VALUE) || high, (open == null && Number.MAX_VALUE) || open, close);
                            }
                            // if volume is null set null to the data row as well, instead of zero to avoid drawing volume chart for zero values
                            dataRow = [intervalDate, open, high, low, close, valArray[volumeIndex] /*|| 0*/, valArray[bidIndex], valArray[askIndex]];
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

            return {data: result, dataMap: resultMap};
        }

        function _getIntervalDate(time, interval) {
            switch (interval) {
                case 'Y':
                    time = _getLastDayOfYear(time);
                    break;
                case 'M':
                    time = _getLastDayOfMonth(time);
                    break;
                case 'W' :
                    time = _getLastDayOfWeek(time);
                    break;
                default :
                    break;
            }
            return time;
        }

        function _getLastDayOfWeek(time) {
            var date = new Date(time);
            var first = date.getDate() - date.getDay();
            /* First day is the day of the month - the day of the week */
            var last = first + 6;
            /* last day is the first day + 6 */

            date.setDate(last);
            var currentDate = new Date();
            if (date.getTime() > currentDate.getTime()) {
                date = currentDate;
            }
            return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
        }

        function _getLastDayOfMonth(time) {
            var date = new Date(time);
            date.setMonth(date.getMonth() + 1);
            date.setDate(1);
            date.setDate(date.getDate() - 1);
            var currentDate = new Date();
            if (date.getTime() > currentDate.getTime()) {
                date = currentDate;
            }
            return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);

        }

        function _getLastDayOfYear(time) {
            var date = new Date(time);
            date.setMonth(11);
            date.setDate(31);
            var currentDate = new Date();
            if (date.getTime() > currentDate.getTime()) {
                date = currentDate;
            }
            return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);

        }

        function _success(responseData) {
            onSuccess(_convertData(responseData.columns, responseData.values, interval));
        }

        function _error() {
            onError(_convertData([], {}, interval));
        }

        var dataUrl = _getIntervalForService(interval) + _getInstrumentForService(symbol);

        $.ajax({
            url: '../data/' + dataUrl,
            dataType: 'json',
            success: function (dataObj) {
                _success(dataObj);
            },
            error: function (xhr, ajaxOptions, thrownError) {
                _error(xhr, ajaxOptions, thrownError);
            }
        });
    };

    infChart.mockDataProvider.prototype.getNewsData = function(symbol, interval, fromDate, toDate, onSuccess, onError){
        var data = {
            "dataSource":"NEWS",
            "symbol":{"name":"NEWS_HEADLINES","provider":"SIX"},
            "header":{
                "columns":[
                    {"field":"id","title":"Time"},
                    {"field":"topic","title":"Topic"},
                    {"field":"headline","title":"Headline"},
                    {"field":"symbolNames","title":"Symbols"},
                    {"field":"companyName","title":"Company"},
                    {"field":"agency","title":"Agency"},
                    {"field":"storyId","title":"Story ID"}]
            },
            "rows":{
                "2016/06/09 13:26:00":{"fields":{"id":"2016/06/09 13:26:00","agency":"BOL","topic":"NAT","headline":"Larry Page, co-fundador de Google, invierteÂ cientos de millones para desarrollar coches voladores - El empresario ha financiado una startup llamada Zee.Aero con mÃ¡s de 100 millones de dÃ³lares","storyId":"225:160609747625","symbolNames":"GOOGL","companyName":"Alphabet Inc"}},
                "2016/06/01 17:55:00":{"fields":{"id":"2016/06/01 17:55:00","agency":"BOL","topic":"NAT","headline":"Sundar Pichai, CEO de Google: Hay grandes oportunidades en inteligencia artificial - En su opiniÃ³n, puede ser uno de los grandes objetivos para el gigante tecnolÃ³gico","storyId":"225:160601746879","symbolNames":"GOOGL","companyName":"Alphabet Inc"}},
                "2016/05/10 17:29:00":{"fields":{"id":"2016/05/10 17:29:00","agency":"BOL","topic":"NAT","headline":"Google sale en defensa de Android y afirma que impulsa la competencia en Europa - La ComisiÃ³n Europea ha acusado a Google de aprovechar su posiciÃ³n dominante","storyId":"225:160510744822","symbolNames":"GOOGL","companyName":"Alphabet Inc"}},
                "2016/04/21 20:10:00":{"fields":{"id":"2016/04/21 20:10:00","agency":"BOL","topic":"NAT","headline":"Alphabet, matriz de Google, se desploma en Wall Street tras publicar resultados - El beneficio por acciÃ³n, BPA, ha sido de 7,50 dÃ³lares","storyId":"225:160421743131","symbolNames":"GOOGL","companyName":"Alphabet Inc"}}
            }
        };

        function _convertNewsData(data) {
            var newsData = [];
            infChart.util.forEach(data.rows, function (key, val) {
                var time = new Date(key);
                if (!isNaN(time) && val && val.fields) {
                    newsData[newsData.length] = {
                        x: time.getTime(),
                        title: '',
                        text: 'Shape: "squarepin"',
                        infItem: val.fields
                    };
                }
            });

            function compare(a, b) {
                if (a.x < b.x)
                    return -1;
                if (a.x > b.x)
                    return 1;
                return 0;
            }

            newsData.sort(compare);
        }

        onSuccess(_convertNewsData(data));
    };

    infChart.mockDataProvider.prototype.getFlagsData = function(symbol, interval, flagType, fromDate, toDate, onSuccess, onError){

        function _convertFlagsData(responseData, interval) {
            var flagsData = [];
            var headers = responseData.HED ? responseData.HED : ["T", "D"];
            var timeIndex = headers.indexOf("T");
            var data = responseData.DATA ? responseData.DATA : [];
            var conflateType = "minute", isSecondsAvailable = false, conflateUnits = 1, doConflate = false, dataTimeToConflate,
                currentConflateTime;

            //todo : conflation should not be handled here - should be independent from the service
            if (interval === 'T') {
                isSecondsAvailable = true;
                conflateType = "seconds";
                conflateUnits = 10;
                doConflate = true;
            } else {
                if (!(interval == 'D' || interval == 'W' || interval == 'M' || interval == 'Y')) {
                    isSecondsAvailable = true;
                    doConflate = true;
                }
            }

            infChart.util.forEach(data, function (key, val) {
                var dt = val[timeIndex].split('-'), time;

                if (isSecondsAvailable) {
                    if (conflateType == "seconds") {
                        dataTimeToConflate = Date.UTC(parseInt(dt[0], 10), parseInt(dt[1], 10) - 1, parseInt(dt[2], 10), parseInt(dt[3], 10), parseInt(dt[4], 10), parseInt(dt[5], 10), 0);
                        if (currentConflateTime) {
                            var t = new Date(currentConflateTime);
                            t.setSeconds(t.getSeconds() - conflateUnits);
                            dataTimeToConflate = (t.getTime() < dataTimeToConflate) ? currentConflateTime : dataTimeToConflate;
                        }
                    }
                    else {
                        dataTimeToConflate = Date.UTC(parseInt(dt[0], 10), parseInt(dt[1], 10) - 1, parseInt(dt[2], 10), parseInt(dt[3], 10), parseInt(dt[4], 10), 0, 0);
                    }
                    time = Date.UTC(parseInt(dt[0], 10), parseInt(dt[1], 10) - 1, parseInt(dt[2], 10), parseInt(dt[3], 10), parseInt(dt[4], 10), parseInt(dt[5], 10), 0);
                } else {
                    time = Date.UTC(parseInt(dt[0], 10), parseInt(dt[1], 10) - 1, parseInt(dt[2], 10), parseInt(dt[3], 10), parseInt(dt[4], 10), 0, 0);
                }

                if (!isNaN(time)) {
                    time = (doConflate) ? dataTimeToConflate : time;
                    flagsData[flagsData.length] = {
                        x: time,
                        title: '',
                        infItem: val
                    };
                }
            });

            function compare(a, b) {
                if (a.x < b.x)
                    return -1;
                if (a.x > b.x)
                    return 1;
                return 0;
            }

            flagsData.sort(compare);
            return flagsData;
        }

        var dataUrl;
        switch (flagType){
            case 'flag2':
                dataUrl = 'flag2';
                break;
            default :
                dataUrl = 'flag1';
                break;
        }

        $.ajax({
            url: '../data/' + dataUrl,
            dataType: 'json',
            success: function (dataObj) {
                onSuccess(_convertFlagsData(dataObj, interval));
            },
            error: function (xhr, ajaxOptions, thrownError) {
                onError([]);
            }
        });
    };

    infChart.mockDataProvider.prototype.getMarketOpenTimes = function(symbol) {
        return {
            is24Hours : true,
            isOpenNow: false,
            lastOpenTime : null,
            lastCloseTime: null
        };
    };

    infChart.mockDataProvider.prototype.getSymbols = function (searchText, onSuccess, onError) {
        var self = this,
            searchParams = {
                'pattern': searchText,
                'vendor': self._vendor,
                'limit': 10
            };
        $.ajax({
            method: 'GET',
            url: 'https://xonecloud.dev.xinfinit.com/frontend/search/instruments?',
            data: searchParams,
            dataType: 'json',
            success: function (dataObj) {
                // console.log(dataObj);
                onSuccess.call(dataObj);
            },
            error: function (error) {
                // console.log('error : ' + thrownError);
                onError.call(error);
            }
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

    infChart.mockDataProvider.prototype.getFavouriteColors = function(onSuccess){
        let data = [];
        return onSuccess(data);
    };
    infChart.mockDataProvider.prototype.setFavouriteColors = function(colors, onSuccess){
        return onSuccess(colors);
    };

    infChart.mockDataProvider.prototype.getFavouriteCandleCount = function(onSuccess, onError){
        let data = [];
        return onSuccess(data);
    };
    infChart.mockDataProvider.prototype.setFavouriteCandleCount = function(value, onSuccess, onError){
        return onSuccess(value);
    };
})(infChart, jQuery);