/**
 * data provider manager
 * based on provider type
 * Created by hasarinda on 11/2/15.
 */
var infChart = window.infChart || {};

infChart.dataProviderManager = (function () {

    var _managers = {};

    var _createDataManager = function (providerObj) {
        var dataManager;
        var type = providerObj.type,
            source = providerObj.source,
            timeZoneOffset = providerObj.timeZoneOffset;

        if (_managers[type] && _managers[type]) {
            dataManager = _managers[type];
        } else {
            switch (type) {
                case 'WEBFG' :
                    dataManager = new infChart.dataManager(new infChart.webfgDataProvider(source, timeZoneOffset), timeZoneOffset);
                    break;
                case 'infinit':
                    dataManager = new infChart.dataManager(new infChart.xinDataProvider(source, timeZoneOffset, providerObj.webSocketEvents, providerObj.ignoreTimeConversionIntervals), timeZoneOffset, providerObj.ignoreTimeConversionIntervals);
                    break;
                default :
                    dataManager = new infChart.dataManager(new infChart.mockDataProvider(source, timeZoneOffset, providerObj.ignoreTimeConversionIntervals), timeZoneOffset, providerObj.ignoreTimeConversionIntervals);
                    break;
            }

            _managers[type] = dataManager;
            dataManager.cleanCache();
        }

        return dataManager;
    };

    return {
        createDataManager: _createDataManager
    }
})();

infChart.dataManager = function (dataProvider, timeZoneOffset, ignoreTimeConversionIntervals) {
    this.ticks = {};
    this.tickData = {};
    this.customData = {};
    this.data = {};
    this.news = {};
    this.flags = {};
    this.flagServices = {};
    this.delayedObjects = {};
    this.latestCacheKeys = {};
    this.cacheReferences = {};
    this.timeZoneOffset = timeZoneOffset;
    this.requestInprogress = {};
    this.ignoreTimeConversionIntervals = ignoreTimeConversionIntervals;

    this.dataProvider = dataProvider;

    var self = this;
    setTimeout(function () {
        self._setCacheCleaner();
    }, 600000);
};

infChart.dataManager.prototype._setCacheCleaner = function () {

    var self = this;
    self.cleanCache(undefined, undefined, undefined, true); // TODO :: FIX this issue in the dev

    setTimeout(function () {
        self._setCacheCleaner();
    }, 600000);
};

infChart.dataManager.prototype._getKey = function (symbol, interval, regularIntervalsOnUpdate) {
    var prefix = regularIntervalsOnUpdate ? "reg|" : "|";
    return (prefix + symbol.symbolId + "|" + interval + "|" + this.dataProvider._vendor);
};

infChart.dataManager.prototype.getKeyToGetData = function(symbol, interval, regularIntervalsOnUpdate){
    var key = this._getKey(symbol, interval, regularIntervalsOnUpdate);
    return this._getCacheKey(key, interval);
}; 

infChart.dataManager.prototype.getDurationDates = function(interval, maxPeriod, fromDate, toDate, scope, isIntradayChart) {
    var stockChart = infChart.manager.getChart(infChart.manager.getContainerIdFromChart(scope.chartId));
    var minDate, now; 
    if(isNaN(toDate)) {
        now = stockChart.getCurrentTime();
    } else {
        if (isIntradayChart) {
            now = new Date(this.getIntradayChartTime(toDate, this.getTimeZone(interval), interval))
        } else {
            now = new Date(this.getChartTime(toDate, this.getTimeZone(interval), interval));
        }
    }

    if (isNaN(fromDate)) {
        if (!maxPeriod) {
            switch (interval) {
                case 'T':
                    maxPeriod = 'D_3';
                    break;
                case 'I_1':
                case 'I_2':
                case 'I_3':
                case 'I_5':
                case 'I_10':
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
        minDate = this.getMinDate(maxPeriod, now, scope);
    } else {
        if (isIntradayChart) {
            minDate = new Date(this.getIntradayChartTime(fromDate, this.getTimeZone(interval), interval, isIntradayChart));
        } else {
            minDate = new Date(this.getChartTime(fromDate, this.getTimeZone(interval), interval, isIntradayChart));
        }
    }
    now = isNaN(toDate) ? undefined : now;
    return {from: minDate, to: now};
};

///**
// * @Deprecated - not used
// * @param data
// * @param index
// * @returns {Array}
// */
//infChart.dataManager.prototype._extract = function (data, index) {
//    //var data = this.data;
//    var retval = new Array(data.length), i;
//    for (i = 0; i < data.length; i++)
//        retval[i] = data[i][index];
//    return retval;
//};

/**
 * Returns list of arrays of ohlcv data. process from the start index if specified
 * @param data
 * @param startIdx
 * @returns {{o: Array, h: Array, l: Array, c: Array, v: Array, b: Array, a: Array}}
 */
infChart.dataManager.prototype.getOHLCV = function (data, startIdx) {
    var ohlcvData = {o: [], h: [], l: [], c: [], v: [], b: [], a: [], ah: [], bl: []},
        i,
        openArr = ohlcvData.o,
        highArr = ohlcvData.h,
        lowArr = ohlcvData.l,
        closeArr = ohlcvData.c,
        volumeArr = ohlcvData.v,
        bidArr = ohlcvData.b,
        askArr = ohlcvData.a,
        askHighArr = ohlcvData.ah,
        bidLowArr = ohlcvData.bl,
        currentIdx = 0;
    startIdx = startIdx || 0;

    for (i = startIdx; i < data.length; i++) {
        currentIdx = i - startIdx;
        openArr[currentIdx] = data[i][1];
        highArr[currentIdx] = data[i][2];
        lowArr[currentIdx] = data[i][3];
        closeArr[currentIdx] = data[i][4];
        volumeArr[currentIdx] = data[i][5];
        bidArr[currentIdx] = data[i][6];
        askArr[currentIdx] = data[i][7];
        askHighArr[currentIdx] = data[i][8];
        bidLowArr[currentIdx] = data[i][9];
    }

    return ohlcvData;
};

/**
 * merge given indices data series and returns
 * @param data
 * @param indices
 * @returns {Array}
 */
infChart.dataManager.prototype.merge = function (data, indices) {
    //var data = this.data;
    var retval = new Array(data.length), i;
    for (i = 0; i < data.length; i++) {
        //var index = indices.length;
        retval[i] = [];
        for (var index = 0, len = indices.length; index < len; index++) {
            retval[i][index] = data[i][indices[index]];
        }
    }
    return retval;
};

/**
 * Get history data from data provider
 * @param symbol
 * @param interval
 * @param fromTime
 * @param toTime
 * @param onSuccessFunction
 * @param onErrorFunction
 * @param regularIntervalsOnUpdate
 * @param requestColumns
 * @param requestWithMinutes
 */
infChart.dataManager.prototype.getHistoryData = function (symbol, interval, fromTime, toTime, onSuccessFunction, onErrorFunction, regularIntervalsOnUpdate, requestColumns, requestWithMinutes) {
    this.dataProvider.getHistoryData(symbol, interval, fromTime, toTime, onSuccessFunction, onErrorFunction, regularIntervalsOnUpdate, requestColumns, requestWithMinutes);
}

/**
 * get history data
 * @param {object} properties - properties to load data
 * @param {function} callback - invoke callback once data received
 * @param {object} scope - chart object - used when invoking callback to set context
 */
infChart.dataManager.prototype.readHistoryData = function (properties, callback, scope) {
    var key = this._getKey(properties.symbol, properties.interval, properties.regularIntervalsOnUpdate),
        cacheKey = this._getCacheKey(key, properties.interval, properties.fromDate, properties.toDate),
        that = this;

    var data = this._getFromCache(cacheKey, properties.interval);
    var self = properties.isIntradayChart ? scope.stockChart : scope;
    var chartId = self && self.id;

    that.requestInprogress[key + chartId] = {status : true, ticks:[]};

    if (properties.data) {

        var cacheObj = {
            data: properties.data.data,
            dataMap: properties.data.dataMap,
            symbol: properties.symbol.symbolId,
            interval: properties.interval,
            cacheKey: cacheKey,
            hasOpenHighLow : properties.data.hasOpenHighLow
        };

        if (properties.interval !== 'T') {
            if (cacheObj.data && cacheObj.data.length > 0) {
                that._addToCache(key, cacheKey, cacheObj, properties.interval, true, chartId);
            }
        } else {
            that.tickData[key] = cacheObj;
        }
        delete that.requestInprogress[key + chartId];
        callback.call(scope, cacheObj, properties);
    } else if (!properties.reload && properties.interval !== 'T' && data && (!properties.fromDate && !properties.toDate)) {
        delete that.requestInprogress[key + chartId];
        // TODO :: check convert timezone before sending
        callback.call(scope, data, properties);

        /*if (this.data[key]) {
         delete this.data[key];
         }*/
    } else {

        var onSuccess = function (dataObj, customProperties) {
            var cacheObj = {
                data: dataObj.data,
                dataMap: dataObj.dataMap,
                symbol: properties.symbol.symbolId,
                interval: properties.interval,
                cacheKey: cacheKey,
                hasOpenHighLow: dataObj.hasOpenHighLow
            };

            that.cleanCache(properties.interval, undefined, key);

            if (properties.interval !== 'T') {
                if (cacheObj.data && cacheObj.data.length > 0) {
                    that._addToCache(key, cacheKey, cacheObj, properties.interval, typeof properties.fromDate !== 'undefined' || typeof properties.toDate !== 'undefined', chartId);
                }
            } else {
                that.tickData[key] = cacheObj;
            }

            that._updateTicks(key, properties.interval, properties.regularIntervalsOnUpdate, properties.fromDate, properties.toDate, cacheObj, chartId);
            var latestCacheKey = that._getLatestKey(key, properties.interval),
                latestData = that._getFromCache(latestCacheKey, properties.interval),
                retVal;

            if(!latestData) {
                retVal = infChart.util.merge({}, cacheObj );
            } else {
                retVal = infChart.util.merge({}, latestData );
            }

            if(customProperties) {
                infChart.util.merge(properties, customProperties);
            }

            callback.call(scope, retVal, properties);
        };

        var onError = function () {
            var errorData = {
                data: [],
                dataMap: {},
                symbol: properties.symbol.symbolId,
                interval: properties.interval,
                cacheKey: cacheKey
            };

            if (properties.mockData) {
                errorData = properties.mockData;
            }

            that._updateTicks(key, properties.interval, properties.regularIntervalsOnUpdate, properties.fromDate, properties.toDate, {}, chartId);

            var latestCacheKey = that._getLatestKey(key, properties.interval),
                dataObj = that._getFromCache(latestCacheKey, properties.interval),
                hasData = (dataObj && dataObj.data && dataObj.data.length > 0);

            callback.call(scope, (hasData? dataObj : errorData), properties);
        };

        var periodDates = this.getDurationDates(properties.interval, properties.maxPeriod, properties.fromDate, properties.toDate, self, properties.isIntradayChart);
        this.getHistoryData(properties.symbol, properties.interval, periodDates.from, periodDates.to, onSuccess, onError, properties.regularIntervalsOnUpdate, properties.requestColums, properties.requestWithMinutes);
    }
};

/**
 * Merge real-time updates received while requesting history data
 * @param {string} key - key
 * @param {string} interval - chart data interval
 * @param {boolean} regularIntervalsOnUpdate
 * @param {string} fromDate - period is custom and period start date
 * @param {string} toDate - period is custom and period end date
 * @param {object} cacheObj - current data
 * @param {string} refId - reference(chart id)
 * @private
 */
infChart.dataManager.prototype._updateTicks = function (key, interval, regularIntervalsOnUpdate, fromDate, toDate, cacheObj, refId) {
    var requestInProgressKey = key + refId;
    var newTicks = this.requestInprogress[requestInProgressKey] && this.requestInprogress[requestInProgressKey].ticks;
    delete this.requestInprogress[requestInProgressKey];

    if(newTicks) {
        for (var i = 0, len = newTicks.length; i < len; i++) {
            this.addTick(newTicks[i], fromDate, toDate, interval, regularIntervalsOnUpdate, cacheObj, refId);
        }
    }

};

/**
 * get cache key
 * @param {string} key - key using symbol
 * @param {string} interval - data interval
 * @param {string} fromDate - custom period start date
 * @param {string} toDate - custom period end date
 * @return {string} - cache key
 * @private
 */
infChart.dataManager.prototype._getCacheKey = function (key, interval, fromDate, toDate) {
    var periodKey;

    if(typeof fromDate !== 'undefined' || typeof toDate !== 'undefined') {
        var dateArray = [];
        if (typeof fromDate !== 'undefined') {
            dateArray.push(fromDate);
        }
        if (typeof toDate !== 'undefined') {
            dateArray.push(toDate);
        }
        dateArray.push(key);
        periodKey = dateArray.join('_');
    }else{
        var currentDate = new Date(),
            millis = currentDate.getTime() + (currentDate.getTimezoneOffset() * 60000),
            tickTime = this.getNextTickTime(millis, interval);
        periodKey = infChart.util.getDateStringFromTime(tickTime, this._getLastUnitFromInterval(interval));
    }

    return "DATA_" + periodKey + "~" + key;
};

infChart.dataManager.prototype._removeFromCacheRef = function (referenceId, cacheKey) {
    if (cacheKey && referenceId) {
        if (this.cacheReferences[cacheKey]) {
            this.cacheReferences[cacheKey].ref.infRemove(referenceId);
            this.cacheReferences[cacheKey].count--;
        }
    } else if (referenceId) {
        for (var key in this.cacheReferences) {
            if (this.cacheReferences.hasOwnProperty(key) && this.cacheReferences[key].ref.indexOf(referenceId) >= 0) {
                this.cacheReferences[key].ref.infRemove(referenceId);
                this.cacheReferences[key].count--;
            }
        }
    }
};

//richard requested to stop caching data in local storage - server already caches data
//scenario - if user doesn't have permissions still we might serve him with cached data
//todo : set caching true or false using provider properties passed to data provider manager
/**
 * add data to cache
 * @param {string} key - key
 * @param {string} cacheKey - cache key
 * @param {object} cacheObj - current data
 * @param {string} interval - chart data interval
 * @param {boolean} isCustom - period is custom
 * @param {string} referenceId - reference(chart id)
 * @private
 */
infChart.dataManager.prototype._addToCache = function (key, cacheKey, cacheObj, interval, isCustom, referenceId) {

    //var cacheKey = this._getCacheKey(key, interval);

    this._removeFromCacheRef(referenceId);

    if (interval == 'T') {
        this.tickData[cacheKey] = cacheObj;
    }

    if (!this.latestCacheKeys[key]) {
        this.latestCacheKeys[key] = {};
    }

    this.latestCacheKeys[key][interval] = cacheKey;

    if (this.cacheReferences) {
        this.cacheReferences[cacheKey] = {count: 0, ref: []};
    }

    if (this.cacheReferences[cacheKey].ref.indexOf(referenceId) < 0) {
        this.cacheReferences[cacheKey].count++;
        this.cacheReferences[cacheKey].ref[this.cacheReferences[cacheKey].ref.length] = referenceId;
    }

    if (isCustom) {
        this.customData[cacheKey] = cacheObj;
    } else {
        this.data[cacheKey] = cacheObj;
        if (this.delaySaving) {
            this.delayedObjects[cacheKey] = cacheObj;
        } else {
            this.delaySaving = true;
            //infChart.util.saveData(cacheKey, cacheObj);
            var self = this;
            setTimeout(function () {
                for (var k in self.delayedObjects) {
                    if (self.delayedObjects.hasOwnProperty(k)) {
                        //infChart.util.saveData(k, self.delayedObjects[k]);
                        delete self.delayedObjects[k];
                    }
                }
                self.delaySaving = false;
            }, 5000);
        }
    }
};

infChart.dataManager.prototype._getLatestKey = function (key, interval) {
    return this.latestCacheKeys[key] && this.latestCacheKeys[key][interval];
    /*prevKeysInTheChain = prevKeysInTheChain ? prevKeysInTheChain : [];

     if (this.cacheReferences[cacheKey] && this.cacheReferences[cacheKey].newKey && prevKeysInTheChain.indexOf(cacheKey) >= 0) {

     prevKeysInTheChain = prevKeysInTheChain ? prevKeysInTheChain : [];
     prevKeysInTheChain.push(cacheKey);
     return this._getLatestKey(this.cacheReferences[cacheKey].newKey, prevKeysInTheChain);


     } else if (this.cacheReferences[cacheKey] && !this.cacheReferences[cacheKey].newKey) {
     return cacheKey;
     }*/
};

/**
 * Check whether matching data is available for the nearest interval and return if available delete data for the interval if not available
 * @param key
 * @param interval
 * @returns {*}
 */
infChart.dataManager.prototype._getFromCache = function (key, interval) {
    var data,
    //cacheKey = this._getCacheKey(key, interval);
        cacheKey = key;

    if (interval == 'T' && this.tickData[cacheKey]) {
        data = this.tickData[cacheKey];
    } else {
        data = this.customData[key];
        if (!data) {
            data = this.data[cacheKey];
            if (!data) {
                data = infChart.util.getData(cacheKey);
            }
        }
    }
    if (data) {
        data = infChart.util.merge({}, data);
    }
    //if (!data) {

    // clean only if there are no listeners
    //this.cleanCache(interval);
    //}
    return data;
};

infChart.dataManager.prototype.getData = function(key, interval){
    return this._getFromCache(key, interval);
};

infChart.dataManager.prototype._hasRefForCacheKey = function (cacheKey, deepClean) {

    var hasRef = this.cacheReferences[cacheKey] && this.cacheReferences[cacheKey].count &&
        this.cacheReferences[cacheKey].count > 0;

    if (hasRef && deepClean) {
        var refs = this.cacheReferences[cacheKey].ref;
        for (var i = 0; i < refs.length; i++) {
            var hasLink = false;
            if ($("#" + refs[i]).length < 0) {
                refs.infRemove(refs[i]);
                i--;
            } else {
                hasLink = true;
            }
            this.cacheReferences[cacheKey].count = refs.length;
        }
        return hasLink;
    } else {
        return hasRef;
    }
};

infChart.dataManager.prototype._isExpiredKey = function (cacheKey, deepClean) {

    if (cacheKey && cacheKey.indexOf("DATA_") >= 0 && !this._hasRefForCacheKey(cacheKey, deepClean)) {

        var cacheKeyArr = cacheKey.split('|'),
            interval = cacheKeyArr[cacheKeyArr.length - 1],
            currentDate = new Date(),
            millis = currentDate.getTime() + (currentDate.getTimezoneOffset() * 60000),
            tickTime = this.getNextTickTime(millis, interval),
            today = infChart.util.getDateStringFromTime(tickTime, this._getLastUnitFromInterval(interval));

        return cacheKey.indexOf("DATA_" + today) < 0;
    }
    return false;
};

infChart.dataManager.prototype.cleanCache = function (interval, cacheKey, key, deepClean) {
    var localCache = this.data,
        i;

    if (cacheKey) {

        delete this.data[cacheKey];
        delete this.cacheReferences[cacheKey];
        //infChart.util.removeData("DATA_" + cacheKey, undefined, false);
        infChart.util.removeDataByKey(cacheKey);


    } else {
        var patterns = [],
            ignorePatterns = [];
        if (interval) {


            var currentDate = new Date(),
                millis = currentDate.getTime() + (currentDate.getTimezoneOffset() * 60000),
                tickTime = this.getNextTickTime(millis, interval),
                today = infChart.util.getDateStringFromTime(tickTime, this._getLastUnitFromInterval(interval));

            patterns = ["DATA_", "|" + interval, key || ""];
            ignorePatterns = !key ? "DATA_" + today : undefined;
            //infChart.util.removeData(["DATA_", "|" + interval, key || ""], ["DATA_" + today], false);


            for (i = localStorage.length - 1; i >= 0; i--) {
                var keyTemp = localStorage.key(i);
                if (infChart.util.hasAllPatterns(keyTemp, patterns) && (!ignorePatterns || (ignorePatterns && !infChart.util.hasPattern(keyTemp, ignorePatterns) )) && (this._isExpiredKey(keyTemp, deepClean) /*|| newKey*/)) {
                    if (localCache[keyTemp]) {
                        delete localCache[keyTemp];
                    }

                    infChart.util.removeDataByKey(keyTemp);
                    if (this.cacheReferences[keyTemp] && this.cacheReferences[keyTemp].count > 0) {
                        //this.cacheReferences[keyTemp].newKey = newKey;
                    }
                }
            }

            for (i in localCache) {
                if (localCache.hasOwnProperty(i)) {
                    if (infChart.util.hasAllPatterns(i, patterns) && (!ignorePatterns || (ignorePatterns && !infChart.util.hasPattern(i, ignorePatterns) )) && (this._isExpiredKey(keyTemp, deepClean) /*|| newKey*/)) {

                        if (localCache[i]) {
                            delete localCache[i];
                        }

                        if (this.cacheReferences[keyTemp] && this.cacheReferences[keyTemp].count > 0) {
                            //this.cacheReferences[keyTemp].newKey = newKey;
                        }
                    }

                }
            }

        } else {

            // Remove the all expired cache objects from localstorage and local cache
            /* patterns = "DATA_";
             infChart.util.removeData("DATA_", undefined, false); */

            for (i = localStorage.length - 1; i >= 0; i--) {
                var keyTemp2 = localStorage.key(i);
                if (this._isExpiredKey(keyTemp2, deepClean)) {
                    if (localCache[keyTemp2]) {
                        delete localCache[keyTemp2];
                    }
                    infChart.util.removeDataByKey(keyTemp2);
                }
            }

            for (i in localCache) {
                if (localCache.hasOwnProperty(i)) {
                    if (this._isExpiredKey(i, deepClean)) {
                        if (localCache[i]) {
                            delete localCache[i];
                        }
                    }
                }
            }
        }


    }
};

infChart.dataManager.prototype.getMinDate = function (period, lastTime, scope) {

    var typeArr = (period) ? period.split('_') : undefined;
    var type = (typeArr) ? typeArr[0] : undefined;
    var units = typeArr.length >= 2 ? typeArr[1] : 1;
    var newdate = new Date(lastTime);
    switch (type) {
        case 'D' :
            newDate = this.getValidMinDate(newdate, units, scope);
            break;
        case 'M':
            newdate.setMonth(newdate.getMonth() - units);
            break;
        case 'Y':
            newdate.setYear(newdate.getFullYear() - units);
            break;
        case 'W':
            newDate = this.getValidMinDate(newdate, units *7, scope);
            
            break;

    }
    return newdate;
};
infChart.dataManager.prototype.getValidMinDate = function (newdate, periodUnit, scope) {
    var noOfDays = 0,
    tempDay = new Date(newdate.valueOf());
    if (!this.isLinearData(scope.symbol)) {
        tempDay.setDate(tempDay.getDate() - 1);
        do {
            if (!(tempDay.getDay() % 6 === 0)) {  
                if (scope._hasRegisteredMethod('getHolidaysList')) {
                    var holidaysList = scope.settings.registeredMethods.getHolidaysList.call(scope);
                    var month = (tempDay.getMonth() + 1 < 10 ? "0" : "") + (tempDay.getMonth() + 1);
                    var date = (tempDay.getDate() < 10 ? "0" : "") + tempDay.getDate();
                    var convertedTimeStamp = tempDay.getUTCFullYear() + month + date;
                    if (holidaysList.indexOf(convertedTimeStamp) === -1) { 
                        periodUnit -- ;
                    }
                } else {
                    periodUnit -- ;
                }
            }
            noOfDays++ ;
            tempDay.setDate(tempDay.getDate() - 1);
        } while (0 < periodUnit);
    } else {
        noOfDays = periodUnit;
    }
    return newdate.setDate(newdate.getDate() - noOfDays);
}

infChart.dataManager.prototype._getIntervalDate = function (time, interval) {
    if (time && !isNaN(new Date(time))) {
        switch (interval) {
            case 'Y':
                time = infChart.util.getFirstDayOfYear(time);
                break;
            case 'M':
                time = infChart.util.getFirstDayOfMonth(time);
                break;
            case 'W' :
                time = infChart.util.getFirstDayOfWeek(time);
                break;
            default :
                break;
        }
        return time;
    }
};

infChart.dataManager.prototype.getTimeZone = function (interval) {
    return (this.ignoreTimeConversionIntervals && this.ignoreTimeConversionIntervals.indexOf(interval) !== -1)? 0: this.timeZoneOffset;
};

infChart.dataManager.prototype.getNextTickTime = function (time, interval) {
    var gmtToGetFormattedTime = this.getGMTTime(time, this.getTimeZone(interval)),
        dt = Highcharts.dateFormat('%Y-%m-%d-%H-%M-%S', gmtToGetFormattedTime).split('-');
    var year = parseInt(dt[0]), month = parseInt(dt[1]) - 1, day = parseInt(dt[2]), hour = parseInt(dt[3]), minute = parseInt(dt[4]);
    var noOfUnits, mins, hrs, tickDt, tickTime, remainder;

    switch (interval) {
        case 'T':
            tickTime =  time;
            break;
        case 'I_1':
            tickTime =  Date.UTC(year, month, day, hour, minute, 0, 0);
            break;
        case 'I_3':
            noOfUnits = parseInt(minute / 3);
            remainder = minute % 3;
            mins = (remainder == 0 ) ? minute : (noOfUnits + 1) * 3;
            tickTime = Date.UTC(year, month, day, hour, mins, 0, 0);
            break;
        case 'I_5':
            noOfUnits = parseInt(minute / 5);
            remainder = minute % 5;
            mins = (remainder == 0 ) ? minute : (noOfUnits + 1) * 5;
            tickTime =  Date.UTC(year, month, day, hour, mins, 0, 0);
            break;
        case 'I_15':
            noOfUnits = parseInt(minute / 15);
            remainder = minute % 15;
            mins = (remainder == 0) ? minute : (noOfUnits + 1) * 15;
            tickTime =  Date.UTC(year, month, day, hour, mins, 0, 0);
            break;
        case 'I_30':
            noOfUnits = parseInt(minute / 30);
            remainder = minute % 30;
            mins = (remainder == 0) ? minute : (noOfUnits + 1) * 30;
            tickTime =  Date.UTC(year, month, day, hour, mins, 0, 0);
            break;
        case 'I_60':
            noOfUnits = hour;
            hrs = minute == 0 ? noOfUnits : (noOfUnits + 1) * 1;
            tickTime =  Date.UTC(year, month, day, hrs, 0, 0, 0);
            break;
        case 'I_120':
            noOfUnits = parseInt(hour / 2);
            remainder = hour % 2;
            hrs = (remainder == 0 && minute == 0 ) ? (noOfUnits) * 2 : (noOfUnits + 1) * 2;
            tickTime =  Date.UTC(year, month, day, hrs, 0, 0, 0);
            break;
        case 'I_240':
            noOfUnits = parseInt(hour / 4);
            remainder = hour % 4;
            hrs = (remainder == 0 && minute == 0 ) ? (noOfUnits) * 4 : (noOfUnits + 1) * 4;
            tickTime =  Date.UTC(year, month, day, hrs, 0, 0, 0);
            break;
        case 'I_360':
            noOfUnits = parseInt(hour / 6);
            remainder = hour % 6;
            hrs = (remainder == 0 && minute == 0 ) ? (noOfUnits) * 6 : (noOfUnits + 1) * 6;
            tickTime =  Date.UTC(year, month, day, hrs, 0, 0, 0);
            break;
        case 'D' :
            tickTime = Date.UTC(year, month, day, 0, 0, 0, 0);
            /*if(!isNaN(lastTickDt)){
             if(tickDt.getFullYear() == lastTickDt.getFullYear() && tickDt.getMonth() == lastTickDt.getMonth() && tickDt.getDate() == lastTickDt.getDate()){
             tickTime = lastTickDt.getTime();
             }
             }*/
            break;
        case 'W' :

            tickTime = this._getIntervalDate(time, interval);
            //tickDt = new Date(tickTime);
            /*if(!isNaN(lastTickDt)){
             if(tickDt.getFullYear() == lastTickDt.getFullYear() && tickDt.getMonth() == lastTickDt.getMonth() && tickDt.getDate() == lastTickDt.getDate()){
             tickTime = lastTickDt.getTime();
             }
             }*/
            break;
        case 'M' :
            tickTime = this._getIntervalDate(time, interval);
            //tickDt = new Date(tickTime);
            /*if(!isNaN(lastTickDt)){
             if(tickDt.getFullYear() == lastTickDt.getFullYear() && tickDt.getMonth() == lastTickDt.getMonth()){
             tickTime = lastTickDt.getTime();
             }
             }*/
            break;
        case 'Y' :
            tickTime = this._getIntervalDate(time, interval);
            //tickDt = new Date(tickTime);
            /*if(!isNaN(lastTickDt)){
             if(tickDt.getFullYear() == lastTickDt.getFullYear()){
             tickTime = lastTickDt.getTime();
             }
             }*/
            break;
    }
    if(tickTime){
        return this.getChartTime(tickTime, this.getTimeZone(interval), interval);
    }
    return tickTime;
};

infChart.dataManager.prototype._isIntraday = function (interval) {
    return (interval == 'T' || interval.indexOf('I') == 0)
};

infChart.dataManager.prototype._hasData = function (time, open, high, low, close) {
    return (!isNaN(time) && !isNaN(open) && !isNaN(high) && !isNaN(low) && !isNaN(close));
};

infChart.dataManager.prototype.getChartTime = function (tickTime, timeZoneOffset, interval) {
    if (timeZoneOffset && !(this.ignoreTimeConversionIntervals && this.ignoreTimeConversionIntervals.indexOf(interval) !== -1)) {
        if (!isNaN(tickTime)) {
            return +(tickTime) + +(timeZoneOffset) * 60 * 60000;
        }
    } else {
        return +(tickTime);
    }
};

infChart.dataManager.prototype.getIntradayChartTime = function (tickTime, timeZoneOffset, interval) {
    if (timeZoneOffset && !(this.ignoreTimeConversionIntervals && this.ignoreTimeConversionIntervals.indexOf(interval) !== -1)) {
        if (!isNaN(tickTime)) {
            return +(tickTime) + -(timeZoneOffset) * 60 * 60000;
        }
    } else {
        return +(tickTime);
    }
};

infChart.dataManager.prototype.getGMTTime = function (time, timeZoneOffset) {
    if (timeZoneOffset) {
        if (!isNaN(time)) {
            return +(time) - +(timeZoneOffset) * 60 * 60000;
        }
    } else {
        return +(time);
    }
};

/**
 * add new tick data to cache
 * @param {object} data - tick data
 * @param {string} fromDate - period is custom and period start date
 * @param {string} toDate - period is custom and period end date
 * @param {string} interval - chart data interval
 * @param {boolean} regularIntervalsOnUpdate
 * @param {object} currentData
 * @param {string} refId - reference(chart id)
 */
infChart.dataManager.prototype.addTick = function (data, fromDate, toDate, interval, regularIntervalsOnUpdate, currentData, refId) {
    var key = this._getKey(data, interval, regularIntervalsOnUpdate);
    if(this.isRequestInProgress(data,interval,regularIntervalsOnUpdate, refId)){
        this.requestInprogress[key + refId].ticks.xPush(data);
    } else if (this._isValidTick(data, interval)) {

        var currentCacheKey = currentData && currentData.cacheKey,
            cacheKey = this._getCacheKey(key, interval, fromDate, toDate),
            latestCacheKey = this._getLatestKey(key, interval), // This is to check for the latest data set
            dataObj;

        if (latestCacheKey != currentCacheKey) {
            // when there is a new data in the cache than the current key
            // remove reference to current key and set new key as the cache key of the reference chart
            this._removeFromCacheRef(refId, currentCacheKey);
        }
        if (latestCacheKey && latestCacheKey != cacheKey) {
            this._removeFromCacheRef(refId, cacheKey);
        }

        dataObj = this._getFromCache(latestCacheKey, interval);
        if (!dataObj && currentData) {
            dataObj = infChart.util.merge({ symbol : data.symbolId, interval : interval}, currentData);
        }

        var lastData = (dataObj && dataObj.data && dataObj.data.length > 0) ? dataObj.data[dataObj.data.length - 1] : undefined;
        var lastTime = lastData ? lastData[0] : undefined;
        var prevLastTime = (dataObj && dataObj.data && dataObj.data.length > 1) ? dataObj.data[dataObj.data.length - 2][0] : undefined;

        if (!this.ticks[cacheKey]) {
            this.ticks[cacheKey] = [];
        }

        var chartTime = this.getChartTime(data.dateTime, data.timeZoneOffset || this.getTimeZone(interval), interval);
        var lastTimeNextTick = lastTime && this.getNextTickTime(lastTime, interval, prevLastTime);
        var tickTime = this.getNextTickTime(+(chartTime), interval, lastTime),
            lastTick,
            chartTimeInData = regularIntervalsOnUpdate ? tickTime : chartTime;

        var open = data.open != undefined ? data.open : data.close;
        var high = data.high != undefined ? data.high : data.close;
        var low = data.low != undefined ? data.low : data.close;
        var close = data.close;
        var volume = !isNaN(data.volume) ? data.volume : null,
            bid = data.bid ? data.bid : lastData ? lastData[6] : undefined,
            ask = data.ask ? data.ask : lastData ? lastData[7] : undefined,
            dataAr, i;


        if (dataObj && this._hasData(chartTimeInData, open, high, low, close)) {
            if (!dataObj.tickTimeMap) {
                dataObj.tickTimeMap = {};
            }
            var realTickTime = dataObj.tickTimeMap[tickTime];
            dataAr = dataObj.data;
            if (realTickTime && dataObj.dataMap[realTickTime]) {
                for (i = dataAr.length - 1; i >= 0; i--) {
                    if (dataAr[i][0] == realTickTime) {
                        lastTick = dataAr[i];
                        dataAr[i][0] = +(chartTimeInData);
                        lastTick[1] = data.open !== undefined ? data.open : lastTick[1];
                        lastTick[2] = lastTick[2] < high ? high : lastTick[2];
                        lastTick[3] = lastTick[3] > low ? low : lastTick[3];
                        lastTick[4] = close;
                        lastTick[5] = volume ? lastTick[5] + volume : lastTick[5] || null;
                        lastTick[6] = bid;
                        lastTick[7] = ask;
                        lastTick[8] = lastTick[8] ? lastTick[8] < ask ? ask : lastTick[8] : ask;
                        lastTick[9] = lastTick[9] ? lastTick[9] > bid ? bid : lastTick[9] : bid;
                        delete dataObj.dataMap[realTickTime];
                        dataObj.dataMap[chartTimeInData] = lastTick;
                        dataObj.tickTimeMap[tickTime] = +(chartTimeInData);
                        break;
                    }
                }
            }
            if (!realTickTime && lastTimeNextTick == tickTime) {
                for (i = dataAr.length - 1; i >= 0; i--) {
                    if (dataAr[i][0] == lastTime) {
                        lastTick = dataAr[i];
                        dataAr[i][0] = +(chartTimeInData);
                        lastTick[1] = data.open !== undefined ? data.open : lastTick[1];
                        lastTick[2] = lastTick[2] < high ? high : lastTick[2];
                        lastTick[3] = lastTick[3] > low ? low : lastTick[3];
                        lastTick[4] = close;
                        lastTick[5] = volume ? lastTick[5] + volume : lastTick[5] || null;
                        lastTick[6] = bid;
                        lastTick[7] = ask;
                        lastTick[8] = lastTick[8] ? lastTick[8] < ask ? ask : lastTick[8] : ask;
                        lastTick[9] = lastTick[9] ? lastTick[9] > bid ? bid : lastTick[9] : bid;
                        delete dataObj.dataMap[lastTime];
                        dataObj.dataMap[chartTimeInData] = lastTick;
                        dataObj.tickTimeMap[tickTime] = +(chartTimeInData);
                        break;
                    }
                }
            } else if (!realTickTime && lastTimeNextTick < tickTime) {
                if (dataObj.tickTimeMap[lastTimeNextTick] && this._isIntraday(interval)) {
                    for (i = dataAr.length - 1; i >= 0; i--) {
                        if (dataAr[i][0] == lastTime) {
                            lastTick = dataAr[i];
                            dataAr[i][0] = lastTimeNextTick;
                            delete dataObj.dataMap[lastTime];
                            dataObj.dataMap[lastTimeNextTick] = lastTick;
                            dataObj.tickTimeMap[lastTimeNextTick] = lastTimeNextTick;
                            break;
                        }
                    }
                }
                var tempRow = [chartTimeInData, open, high, low, close, volume, bid, ask, ask, bid];
                dataObj.data[dataObj.data.length] = tempRow;
                dataObj.dataMap[chartTimeInData] = tempRow;
                dataObj.tickTimeMap[tickTime] = +(chartTimeInData);
            } else if(!realTickTime && !lastTimeNextTick){

                var tempRow = [chartTimeInData, open, high, low, close, volume, bid, ask, ask, bid];
                dataObj.data = [tempRow];
                dataObj.dataMap = {};
                dataObj.dataMap[chartTimeInData] = tempRow;
                dataObj.tickTimeMap[tickTime] = +(chartTimeInData);
                //dataObj.interval = interval;
            }
            //this.ticks[key].push({tickTime: chartTimeInData, period: period, interval: interval});
            if (dataObj.data && dataObj.data.length > 0) {

                dataObj.cacheKey = cacheKey;

                this._addToCache(key, cacheKey, dataObj, interval, typeof fromDate !== 'undefined' || typeof toDate !== 'undefined', refId);

                // clean previous cache keys from the cache since new data set is available
                if (currentCacheKey != cacheKey) {
                    this.cleanCache(interval, currentCacheKey, undefined);
                }

                if (latestCacheKey != cacheKey) {
                    this.cleanCache(interval, latestCacheKey, undefined);
                }

            }
        }
    }
};

infChart.dataManager.prototype.isRequestInProgress = function (symbol, interval, regularIntervalsOnUpdate, refId) {
    var key = this._getKey(symbol, interval, regularIntervalsOnUpdate);
    return this.requestInprogress[key + refId]? true : false;
};

infChart.dataManager.prototype._isValidTick = function (data, interval) {
    return ( !isNaN(data.close) && !isNaN(this.getChartTime(data.dateTime, data.timeZoneOffset || this.getTimeZone(interval), interval)));
};

infChart.dataManager.prototype.getPreviousClose = function (data) {
    var preClose;
    if (data && data.length > 0) {
        if (infChart.util.isToday(new Date(data[data.length - 1][0])) && data.length > 1) {
            preClose = {idx: data.length - 2, row: data[data.length - 2], value: data[data.length - 2][4]};
        }
        else {
            preClose = {idx: data.length - 1, row: data[data.length - 1], value: data[data.length - 1][4]};
        }
    }
    return preClose;
};

infChart.dataManager.prototype.getNewTicks = function (lastTime, interval, symbols, regularIntervalsOnUpdate) {

    lastTime = lastTime || 0;

    this.ticks = {};
    var i,
        count,
        oneBeforeLast,
        resultData = {};

    for (i in symbols) {

        if (symbols.hasOwnProperty(i)) {

            var key = this._getKey(symbols[i], interval, regularIntervalsOnUpdate),
                cacheKey = this._getLatestKey(key,interval) || key,
                data = this._getFromCache(cacheKey, interval),
                dataArr = data && data.data,
                newTickTimeArr = [],
                symLastTime = symbols[i].prevLastTime || lastTime,
                newCount = 0;

            if (data && dataArr && dataArr.length && data.interval == interval) {

                count = dataArr.length - 1;
                oneBeforeLast = false;

                while (count >= 0 && ( symLastTime <= dataArr[count][0] ) ) {
                    newTickTimeArr[newCount] = dataArr[count][0];
                    newCount++;
                    count--;
                }
                if (newTickTimeArr.length > 0) {
                    resultData[i] = {symbol: symbols[i], data: data, newTicks: newTickTimeArr.reverse()};
                }
            }
        }
    }

    return resultData;
};

infChart.dataManager.prototype._getNewsCacheKey = function (symbol) {
    return symbol.symbolId;
};

infChart.dataManager.prototype.getNews = function (properties, callback, scope) {

    var key = this._getNewsCacheKey(properties.symbol), that = this;

    if (this.news[key] && !properties.reload) {
        callback.call(scope, this.news[key], properties);
        if (properties.interval == 'T') {
            delete this.news[key];
        }
    } else {
        var dates = this.getDurationDates(properties.interval, properties.maxPeriod, properties.fromDate, properties.toDate);

        var onSuccess = function (dataObj) {
            that.news[key] = dataObj;
            callback.call(scope, dataObj, properties);
        };

        var onError = function () {
            callback.call(scope, [], properties);
        };

        this.dataProvider.getNewsData(properties.symbol, properties.interval, dates.from, dates.to, onSuccess, onError);
    }
};

infChart.dataManager.prototype.getFlagService = function (type) {
    return this.flagServices[type];
};

infChart.dataManager.prototype._getFlagCacheKey = function (symbol, interval, flagType) {
    return flagType + '|' + symbol.symbolId + '|' + interval;
};

infChart.dataManager.prototype.getFlagsData = function (properties, callback, scope) {

    var key = this._getFlagCacheKey(properties.symbol.symbolId, properties.interval, properties.flagType), that = this;

    if (this.flags[key] && !properties.reload) {
        callback.call(scope, this.flags[key].data, properties);
        if (properties.interval == 'T') {
            delete this.flags[key];
        }
    } else {
        var dates = this.getDurationDates(properties.interval, properties.maxPeriod, properties.fromDate, properties.toDate);

        var onSuccess = function (dataObj) {
            that.flags[key] = {data: dataObj, symbol: properties.symbol.symbolId};
            callback.call(scope, dataObj, properties);
        };

        var onError = function () {
            callback.call(scope, [], properties);
        };

        this.dataProvider.getFlagsData(properties.symbol, properties.interval, properties.flagType, dates.from, dates.to, onSuccess, onError);
    }
};

//endregion

infChart.dataManager.prototype._getLastUnitFromInterval = function(interval){
    switch (interval) {
        case 'T':
        case 'I_1':
        case 'I_3':
        case 'I_5':
        case 'I_15':
        case 'I_30':
            return "m";
        case 'I_60':
        case 'I_120':
        case 'I_240':
        case 'I_360':
            return 'h';
        default :
            return 'd';
    }
};

infChart.dataManager.prototype.getMarketOpenTimes = function (symbol) {
    return this.dataProvider.getMarketOpenTimes(symbol);
};

/**
 * Check whether the given symbol is linear or not
 * @param {object} symbol symbol to check the linearity
 * @returns {boolean} linearity
 */
infChart.dataManager.prototype.isLinearData = function (symbol) {
    return this.dataProvider.isLinearData(symbol);
};

/**
 * Scan patterns for the given data set
 * @param {string} data in csv format
 * @param {function} callback callback function to be executed when data is recived
 * @param {object} scope scope of the callback
 */
infChart.dataManager.prototype.scanPattern = function (data, callback, scope) {
    var onSuccess = function (dataObj) {
        callback.call(scope, dataObj);
    };

    var onError = function () {
        callback.call(scope, {});
    };

    return this.dataProvider.scanPattern(data, onSuccess, onError);
};

infChart.dataManager.prototype.loadBreakoutIndicatorData = function (data, callback, scope) {
    let onSuccess = function (dataObj) {
        callback.call(scope, dataObj);
    }

    let onError = function () {
        callback.call(scope, {});
    };

    return this.dataProvider.loadBreakoutIndicatorData(data, onSuccess, onError);
}

