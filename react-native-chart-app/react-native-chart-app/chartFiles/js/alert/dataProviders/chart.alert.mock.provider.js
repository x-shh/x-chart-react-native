infChart.alertDataProvider = function(vendor){};

infChart.alertDataProvider.prototype.getItems = function(chartId, symbol, onSuccess){};

infChart.alertDataProvider.prototype.addItem = function(chartId, symbol, price){};

infChart.alertDataProvider.prototype.updateItem = function(chartId, id, price, originalPrice){};

infChart.alertDataProvider.prototype.deleteItem = function(chartId, id){};

(function(infChart, $){

    infChart.mockAlertDataProvider = function () {
        infChart.alertDataProvider.apply(this, arguments);
    };

    infChart.util.extend(infChart.alertDataProvider, infChart.mockAlertDataProvider);

    infChart.mockAlertDataProvider.prototype.getItems = function(chartId, symbol, onSuccess){
        var data = infChart.manager.getChart(chartId).rangeData.data;
        onSuccess([
            {
                id : Math.floor(Math.random() * 10000),
                symbol: symbol,
                price: data[data.length - 1] * 1.0001,
                active: true
            },
            {
                id : Math.floor(Math.random() * 10000),
                symbol: symbol,
                price: data[data.length - 1] * 0.9999,
                active: true
            }
        ]);
    };

    infChart.mockAlertDataProvider.prototype.addItem = function(chartId, symbol, price){
        infChart.alertManager.onUpdates(chartId, {
            id : Math.floor(Math.random() * 10000),
            symbol: symbol,
            price: price,
            active: true
        });
    };

    infChart.mockAlertDataProvider.prototype.updateItem = function(chartId, id, price, originalPrice){
        infChart.alertManager.onUpdates(chartId, {
            id : id,
            symbol: infChart.manager.getChart(chartId).symbol,
            price: price,
            active: true
        });
    };

    infChart.mockAlertDataProvider.prototype.deleteItem = function(chartId, id){
        infChart.alertManager.onUpdates(chartId, {
            id : id,
            price: price,
            active: false
        });
    };

})(infChart, jQuery);