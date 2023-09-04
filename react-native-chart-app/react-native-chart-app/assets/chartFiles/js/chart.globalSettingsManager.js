var infChart = window.infChart || {};

infChart.globalSettingsManager = (function (infChart) {
    var dataProvider;
    
    var _initialize = function(providerObj) {
        dataProvider = _getDataProvider(providerObj);
        if (dataProvider) {
            _fetchGlobalSettings();
        }
    };

    var _getDataProvider = function(providerObj){
        switch (providerObj.type) {
            case 'infinit':
                dataProvider = new infChart.xinDataProvider(providerObj.source);
                break;
            default:
                dataProvider = new infChart.mockDataProvider(providerObj.source);
                break;
        }
        return dataProvider;
    };

    var _assignData = function (data) {
        infChart.globalSettingsManager.customCandleCount = data;
    }

    var _initalizeData = function (customCandleCount) {
        let defaultCandleCount = infChart.settings.config.customCandleCount;
        customCandleCount = customCandleCount === undefined ? defaultCandleCount : customCandleCount;
        infChart.globalSettingsManager.customCandleCount = customCandleCount;
    }

    var _getFavouriteCandleCount = function () {
        return infChart.globalSettingsManager.customCandleCount;
    }

    var _fetchGlobalSettings = function () {
        dataProvider.getFavouriteCandleCount(_initalizeData, _ErrorForGetCandleCount);
    }

    var _ErrorForGetCandleCount = function(error){
        console.error("Error in getting the favourite candle count", error);
    }

    var _ErrorForSetCandleCount = function(error){
        console.error("Error in setting the favourite candle count", error);
    }

    var _setFavouriteCandleCount = function(candleCount){
        dataProvider.setFavouriteCandleCount(candleCount, _assignData, _ErrorForSetCandleCount);
    }

    return {
        initialize: _initialize,
        setFavouriteCandleCount: _setFavouriteCandleCount,
        getFavouriteCandleCount: _getFavouriteCandleCount
    }
})(infChart);