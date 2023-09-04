/**
 * data provider - webfg
 * extends infChart.dataManager
 * get data calling webfg data service
 * Created by hasarinda on 11/2/15.
 */

infChart.webfgDataMgr = function (url) {
    infChart.dataManager.apply(this, arguments);
};

infChart.util.extend(infChart.dataManager, infChart.webfgDataMgr);

infChart.webfgDataMgr.prototype.getDuration = function (interval, scope, fromDate, toDate) {
    var minDate,
        now = toDate == undefined ? new Date() : new Date(this.getChartTime(toDate, this.timeZoneOffset)),
        year = now.getFullYear(),
        month = now.getMonth() + 1,
        date = now.getDate(),
        from,
        to = [year, month < 10 ? '0' + month : month, date < 10 ? '0' + date : date];

    if (fromDate == undefined) {
        var intervalOpt = scope.getCurrentIntervalOptions(interval),
            maxPeriod = (intervalOpt) ? intervalOpt.maxPeriod : undefined;

        if (!maxPeriod) {
            switch (interval) {
                case 'T':
                    maxPeriod = 'D_1';
                    break;
                case 'I_1':
                case 'I_3':
                case 'I_5':
                case 'I_15':
                case 'I_30':
                case 'I_60':
                    maxPeriod = 'M_3';
                    break;
                default :
                    maxPeriod = 'Y_10';
                    break;
            }
        }
        minDate = this.getMinDate(maxPeriod, now);

    } else {
        minDate = new Date(this.getChartTime(fromDate, this.timeZoneOffset));
    }

    year = minDate.getFullYear();
    month = minDate.getMonth() + 1;
    date = minDate.getDate();
    var from = [year, month < 10 ? '0' + month : month, date < 10 ? '0' + date : date];
    return '&from=' + from.join('') + '&to=' + to.join('');
};

infChart.webfgDataMgr.prototype.getUnit = function (interval) {
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
};

infChart.webfgDataMgr.prototype.getUnitForCacheKey = function (interval) {
    switch (interval) {
        case 'T':
            return 'TICKS';
        case 'I_1':
            return '1m';
        case 'I_3':
            return '3m';
        case 'I_5':
            return '5m';
        case 'I_15':
            return '15m';
        case 'I_30':
            return 'm30';
        case 'I_60':
            return '1h';
        case 'I_120':
            return '2h';
        case 'I_240':
            return '4h';
        case 'W':
            return '7d';
        case 'M':
            return '30d';
        case 'Y':
            return '365d';
        default :
            return '1d';
    }
};

infChart.webfgDataMgr.prototype.getKey = function (symbol, unit, interval, regularIntervalsOnUpdate) {

    var prefix = regularIntervalsOnUpdate ? "reg|" : "";
    return prefix + symbol + '|' + unit;
};

infChart.webfgDataMgr.prototype.getSymbol = function (symbol, provider) {
    return symbol.symbolId;
};

infChart.webfgDataMgr.prototype.readHistoryData = function (properties, callback, scope) {
    var self = this,
        symbol = properties.symbol.symbolId,
        unit = this.getUnit(properties.interval),
        key = this.getKey(symbol, unit, properties.interval, properties.regularIntervalsOnUpdate), that = this,
        cacheKey = this.getCacheKey(key, properties.interval),
        data = this.getFromCache(cacheKey, properties.interval);

    if (properties.data) {
        var timeZoneOffset = properties.data.timeZoneOffset || this.timeZoneOffset,
            obj = this.convertData(properties.data, timeZoneOffset);
        var dataObj = {
            data: obj.data,
            dataMap: obj.dataMap,
            symbol: symbol,
            interval: properties.interval,
            timeZoneOffset: timeZoneOffset,
            cacheKey: cacheKey
        };

        if (properties.interval != 'T') {
            that.customData[cacheKey] = dataObj;

            //that.addToCache(key, dataObj);
            that.addToCache(key, cacheKey, dataObj, properties.interval, properties.fromDate || properties.toDate, scope.id);
        } else {
            that.tickData[cacheKey] = dataObj;
        }
        callback.call(scope, dataObj, properties);
    } else if (!properties.reload && data && (!properties.fromDate && !properties.toDate)) {
        callback.call(scope, data, properties);
        if (properties.interval == 'T') {
            this.tickData[cacheKey] = data;
            delete this.data[cacheKey];
        }
    } else {
        var dataUrl = "symbol=" + symbol + "&unit=" + this.getUnit(properties.interval) + this.getDuration(properties.interval, scope, properties.fromDate, properties.toDate);
        //var dataUrl = 'request=HISTORY ' + properties.symbol.symbolId + ' ' + this.getUnit(properties.interval) + ' 1000 ' + this.getDuration(properties.interval);

        var onSuccess = function (data) {
            var timeZoneOffset = data.timeZoneOffset || self.timeZoneOffset,
                obj = this.convertData(data, timeZoneOffset);
            var dataObj = {
                data: obj.data,
                dataMap: obj.dataMap,
                symbol: symbol,
                interval: properties.interval,
                timeZoneOffset: timeZoneOffset,
                cacheKey: cacheKey
            };
            if (properties.interval != 'T') {
                if (properties.fromDate || properties.toDate) {
                    that.customData[cacheKey] = dataObj;
                } else {
                    that.data[cacheKey] = dataObj;
                }

                //that.addToCache(key, dataObj);
                that.addToCache(key, cacheKey, dataObj, properties.interval, properties.fromDate || properties.toDate, scope.id);
            } else {
                that.tickData[cacheKey] = dataObj;
            }
            callback.call(scope, dataObj, properties);
        };

        var onError = function () {
            callback.call(scope, [], properties);
        };

        if (infChart.staticMode) {
            if (unit.indexOf("TICKS") >= 0) {
                this.url = "../data/ticks_data_" + symbol + "?";
            }
            else if (unit.indexOf("Intraday") >= 0) {
                this.url = "../data/intraday_data_" + symbol + "?";
            }
            else {
                this.url = "../data/history_data_" + symbol + "?";
            }
        }
        infChart.util.sendAjax(this.url + dataUrl, 'text', onSuccess, onError, this);
    }
};

/*infChart.webfgDataMgr.prototype.addToCache = function (key, cacheKey, cacheObj, interval) {

    if (interval == 'T') {
        this.tickData[cacheKey] = cacheObj;
    } else {
        this.data[cacheKey] = cacheObj;
    }
};*/


infChart.webfgDataMgr.prototype.cleanCache = function (interval, key) {

    if (key) {
        delete this.data[key];
        //  infChart.util.removeData( "DATA_" + key  , undefined , false);

    } else {
        var patterns = [],
            ignorePatterns = [];
        if (interval) {

            var currentDate = new Date(),
                millis = currentDate.getTime() + (currentDate.getTimezoneOffset() * 60000),
                tickTime = this.getNextTickTime(millis, interval),
                unit = this.getUnitForCacheKey(interval),
                unitArr = unit.split(parseInt(unit)),
                today = infChart.util.getDateStringFromTime(tickTime, unitArr && unitArr[1]);

            patterns = ["DATA_", "|" + interval];
            ignorePatterns = "DATA_" + today;
            //infChart.util.removeData(["DATA_", "|" + interval], ["DATA_" + today], false);

        } else {

            patterns = "DATA_";
            //infChart.util.removeData("DATA_", undefined, false);
        }

        var localCache = this.data;

        for (var i in localCache) {
            if (localCache.hasOwnProperty(i)) {
                if (infChart.util.hasAllPatterns(i, patterns) && (!ignorePatterns || (ignorePatterns && !infChart.util.hasPattern(i, ignorePatterns) ))) {
                    if (localCache[i]) {
                        delete localCache[i];
                    }
                }

            }
        }
    }
};


infChart.webfgDataMgr.prototype.getChartTime = function (tickTime, timeZoneOffset) {
    var dt;
    if (timeZoneOffset) {
        if (!isNaN(tickTime)) {
            var localDt = new Date(+(tickTime) + +(timeZoneOffset) * 60 * 60000);
            return Date.UTC(localDt.getUTCFullYear(), localDt.getUTCMonth(), localDt.getUTCDate(), localDt.getUTCHours(), localDt.getUTCMinutes(), localDt.getUTCSeconds(), localDt.getUTCMilliseconds(), 0);

        } else if (typeof tickTime == "string" && tickTime.split('-').length >= 6) {
            dt = tickTime.split('-');
            return Date.UTC(parseInt(dt[0], 10), parseInt(dt[1], 10) - 1, parseInt(dt[2], 10), parseInt(dt[3], 10), parseInt(dt[4], 10), parseInt(dt[5], 10), 0) + (+(timeZoneOffset) * 60 * 60000);
        }
    } else if (!isNaN(tickTime)) {
        return +(tickTime);
    } else if (typeof tickTime == "string" && tickTime.split('-').length >= 6) {
        dt = tickTime.split('-');
        return Date.UTC(parseInt(dt[0], 10), parseInt(dt[1], 10) - 1, parseInt(dt[2], 10), parseInt(dt[3], 10), parseInt(dt[4], 10), parseInt(dt[5], 10), 0);
    }
};

infChart.webfgDataMgr.prototype.convertData = function (input, timeZoneOffset) {
    var result, resultCount = 0, resultMap = {}, name = '', NO_OF_POINTS = 1000, conflateUnits = 1,
        conflateType = "minute", currentConflateTime, dataTimeToConflate, doConflate = false;

    if (!input) {
        result = [];
        return result;
    }

    if (input.indexOf('BEGINDATA') === 0) {
        var arr = input.split('\n');
        var headerArr = arr[0].split(' ');
        name = headerArr[1].substring(0, headerArr[1].lastIndexOf('_'));
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
            }
            else if (interval == "MONTHLY") {
                isDayAvailable = false;
                resultCount = dataCount;
            } else if (interval === "YEARLY") {
                isDayAvailable = false;
                isMonthAvailable = false;
                resultCount = dataCount;
            }
            else {
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
                        }
                        else {
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

                    time = this.getChartTime(time, timeZoneOffset);
                    dataTimeToConflate = this.getChartTime(dataTimeToConflate, timeZoneOffset);

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
                            }
                            else {
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
                }
                catch (e) {
                    infChart.util.console.error(e);
                }
            }
        }

        if (currentIdx >= 0) {
            result.splice(0, currentIdx + 1);
        }
    }

    return {data: result, dataMap: resultMap, symbol: name};
};

infChart.webfgDataMgr.prototype.getSymbolForFlags = function (symbol, provider, flagType) {
    // return symbol.symbolId + '@' + provider;
    return 'GOOG' + '@' + 'SIX';
};


infChart.webfgDataMgr.prototype.getFlagKey = function (symbol, interval, flagType) {
    return flagType + '|' + symbol + '|' + interval;
};


infChart.webfgDataMgr.prototype.addFlagsToCache = function (properties, data, flagType) {
    var symbol = this.getSymbolForFlags(properties.symbol, properties.provider, flagType),
        key = this.getFlagKey(symbol, properties.interval, properties.flagType);
    var dataObj = {data: data, symbol: properties.symbol.symbolId};

    this.flags[key] = dataObj;
};


infChart.webfgDataMgr.prototype.getFlagsData = function (properties, callback, scope) {

    var symbol = this.getSymbolForFlags(properties.symbol, properties.provider),
        key = this.getFlagKey(symbol, properties.interval, properties.flagType), that = this,
        flagService = this.flagSerives[properties.flagType];


    if (this.flags[key] && !properties.reload) {
        callback.call(scope, this.flags[key].data, properties);
        if (properties.interval == 'T') {
            delete this.data[key];
        }
    } else {
        var onSuccess = function (responseData) {
            if (that.flagSerives[properties.flagType].editResponse) {
                responseData = that.flagSerives[properties.flagType].editResponse(responseData);
            }
            var dataObj = that.convertFlagsData(responseData, properties.interval);
            that.addFlagsToCache(properties, dataObj);
            callback.call(scope, dataObj, properties);
        };
        var dates = this.getDuration(properties.interval, scope).split('&');
        var fromDate = (dates.length >= 3) ? dates[1].split('=')[1] : undefined;
        var toDate = (dates.length >= 3) ? dates[2].split('=')[1] : undefined;

        if ((!flagService.url || flagService.url.trim() == '') && flagService.setData) {
            flagService.setData(properties.symbol, fromDate, toDate, onSuccess);

        }
        else {
            var dataUrl = flagService.setRequestParams ? flagService.setRequestParams(properties.symbol, fromDate, toDate) :
            "symbol=" + symbol + dates.join('&');
            var responseType = flagService.responseType ? flagService.responseType : "json";


            var onError = function () {
                callback.call(scope, [], properties);
            };

            infChart.util.sendAjax(that.flagSerives[properties.flagType].url + dataUrl, responseType, onSuccess, onError, this);

        }
    }


    /*  var dataobj = {"dataSource":"NEWS","symbol":{"name":"NEWS_HEADLINES","provider":"SIX"},"header":{"columns":[{"field":"id","title":"Time"},{"field":"topic","title":"Topic"},{"field":"headline","title":"Headline"},{"field":"symbolNames","title":"Symbols"},{"field":"companyName","title":"Company"},{"field":"agency","title":"Agency"},{"field":"storyId","title":"Story ID"}]},"rows":{"2016/06/09 13:26:00":{"fields":{"id":"2016/06/09 13:26:00","agency":"BOL","topic":"NAT","headline":"Larry Page, co-fundador de Google, invierteÂ cientos de millones para desarrollar coches voladores - El empresario ha financiado una startup llamada Zee.Aero con mÃ¡s de 100 millones de dÃ³lares","storyId":"225:160609747625","symbolNames":"GOOGL","companyName":"Alphabet Inc"}},"2016/06/01 17:55:00":{"fields":{"id":"2016/06/01 17:55:00","agency":"BOL","topic":"NAT","headline":"Sundar Pichai, CEO de Google: Hay grandes oportunidades en inteligencia artificial - En su opiniÃ³n, puede ser uno de los grandes objetivos para el gigante tecnolÃ³gico","storyId":"225:160601746879","symbolNames":"GOOGL","companyName":"Alphabet Inc"}},"2016/05/10 17:29:00":{"fields":{"id":"2016/05/10 17:29:00","agency":"BOL","topic":"NAT","headline":"Google sale en defensa de Android y afirma que impulsa la competencia en Europa - La ComisiÃ³n Europea ha acusado a Google de aprovechar su posiciÃ³n dominante","storyId":"225:160510744822","symbolNames":"GOOGL","companyName":"Alphabet Inc"}},"2016/04/21 20:10:00":{"fields":{"id":"2016/04/21 20:10:00","agency":"BOL","topic":"NAT","headline":"Alphabet, matriz de Google, se desploma en Wall Street tras publicar resultados - El beneficio por acciÃ³n, BPA, ha sido de 7,50 dÃ³lares","storyId":"225:160421743131","symbolNames":"GOOGL","companyName":"Alphabet Inc"}}}}

     callback.call(scope, this.convertNews(dataobj.rows), properties);*/

};

infChart.webfgDataMgr.prototype.convertFlagsData = function (responseData, interval) {
    var flagsData = [];
    var headers = responseData.HED ? responseData.HED : ["T", "D"];
    var timeIndex = headers.indexOf("T");
    var dataIndex = headers.indexOf("D");
    var data = responseData.DATA ? responseData.DATA : [];
    var conflateType = "minute", isSecondsAvailable = false, conflateUnits = 1, doConflate = false, dataTimeToConflate,
        currentConflateTime;

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
    $.each(data, function (key, val) {
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
            flagsData.push({
                x: time,
                title: '',
                infItem: val
            });
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
};