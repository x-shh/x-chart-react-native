(function (infChart, $, angular) {

    infChart.xinAlertDataProvider = function () {
        infChart.alertDataProvider.apply(this, arguments);

        var injector = angular.element('body > [ng-controller]:first').injector();

        this.alertService = injector.get("chartAlertService");
    };

    infChart.util.extend(infChart.alertDataProvider, infChart.xinAlertDataProvider);

    infChart.xinAlertDataProvider.prototype.getItems = function (chartId, symbol, onSuccess) {
        this.alertService.getAlerts(chartId, symbol).then(onSuccess);
    };

    infChart.xinAlertDataProvider.prototype.addItem = function(chartId, symbol, price) {
        this.alertService.createAlert(chartId, symbol, price);
    };

    infChart.xinAlertDataProvider.prototype.updateItem = function(chartId, id, price, originalPrice, symbol) {
        this.alertService.amendAlert(chartId, id, price, originalPrice, symbol);
    };

    infChart.xinAlertDataProvider.prototype.deleteItem = function(chartId, id) {
        this.alertService.cancelAlert(chartId, id);
    };

})(infChart, jQuery, angular);