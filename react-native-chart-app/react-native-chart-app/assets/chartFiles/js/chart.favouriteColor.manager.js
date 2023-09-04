var infChart = window.infChart || {};

infChart.favouriteColorManager = (function (infChart) {
    var dataProvider;
    
    var _initialize = function(providerObj) {
        dataProvider = _getDataProvider(providerObj);
        if (dataProvider) {
            _fetchFavouriteColors();
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
        infChart.favouriteColorManager.favouriteColors = data;
    }

    var _initalizeData = function (favouriteColours) {
        let defaultFavouriteColors = infChart.settings.favourtieColors;
        favouriteColours = favouriteColours === undefined ? defaultFavouriteColors : favouriteColours;
        infChart.favouriteColorManager.favouriteColors = favouriteColours;
    }

    var _getFavouriteColors = function () {
        return infChart.favouriteColorManager.favouriteColors;
    }

    //fetch favourite colours from API
    var _fetchFavouriteColors = function () {
        dataProvider.getFavouriteColors(_initalizeData);
    }

    var _setFavoriteColors = function (favouriteColors) {
        dataProvider.setFavouriteColors(favouriteColors, _assignData);
    }

    return {
        initialize: _initialize,
        setFavoriteColors: _setFavoriteColors,
        getFavouriteColors: _getFavouriteColors
    }
})(infChart);