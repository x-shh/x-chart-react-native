(function (infChart, $, angular) {

    infChart.xinDrawingDataProvider = function () {
        infChart.drawingDataProvider.apply(this, arguments);

        var injector = angular.element('body > [ng-controller]:first').injector();

        this.chartUtilService = injector.get("chartUtilService");
    };

    infChart.util.extend(infChart.drawingDataProvider, infChart.xinDrawingDataProvider);

    infChart.xinDrawingDataProvider.prototype.saveDrawingTemplates = function (data) {
        this.chartUtilService.saveDrawingTemplates(data, "custom");
    };

    infChart.xinDrawingDataProvider.prototype.getSavedDrawingTemplates = function(onSuccess) {
        this.chartUtilService.getSavedDrawingTemplates("custom").then(function(data){
            onSuccess(data);
        });
    };

    infChart.xinDrawingDataProvider.prototype.saveDefaultDrawingTemplates = function (data) {
        this.chartUtilService.saveDrawingTemplates(data, "default");
    };

    infChart.xinDrawingDataProvider.prototype.getDefaultSavedDrawingTemplates = function(onSuccess) {
        this.chartUtilService.getSavedDrawingTemplates("default").then(function(data){
            onSuccess(data);
        });
    };
})(infChart, jQuery, angular);