infChart.dataProvider = function (vendor, timezoneOffset) {
};

/**
 * Asynchronous method to get History data
 * @param {object} symbol chart symbol
 * @param {string} interval interval of the requesting data
 * @param {Date} fromDate from date
 * @param {Date} toDate to date
 * @param {function} onSuccess success callback
 * @param {function} onError error callback
 */
infChart.dataProvider.prototype.getHistoryData = function (symbol, interval, fromDate, toDate, onSuccess, onError) {
};

/**
 * Asynchronous method to get News data
 * @param {object} symbol chart symbol
 * @param {Date} fromDate from date
 * @param {Date} toDate to date
 * @param {function} onSuccess success callback
 * @param {function} onError error callback
 */
infChart.dataProvider.prototype.getNewsData = function (symbol, fromDate, toDate, onSuccess, onError) {
};

/**
 * Asynchronous method to get flag data
 * @param {object} symbol chart symbol
 * @param {Date} fromDate from date
 * @param {Date} toDate to date
 * @param {Date} flagType requesting data type
 * @param {function} onSuccess success callback
 * @param {function} onError error callback
 */
infChart.dataProvider.prototype.getFlagsData = function (symbol, fromDate, toDate, flagType, onSuccess, onError) {
};

/**
 * Method to get market status data :: No backend services yet
 * @param {object} symbol chart symbol
 */
infChart.dataProvider.prototype.getMarketOpenTimes = function (symbol) {
};

/**
 * Asynchronous method to get instruments on search
 * @param {string} searchText search text
 * @param {function} onSuccess success callback
 * @param {function} onError error callback
 */
infChart.dataProvider.prototype.getSymbols = function (searchText, onSuccess, onError) {
};

/**
 * Check the linearity of given instrument
 * @param {object} symbol chart symbol
 * @returns {boolean} linearity
 */
infChart.dataProvider.prototype.isLinearData = function (symbol) {
    return true;
};