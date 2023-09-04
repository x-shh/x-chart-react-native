(function (infChart, $, angular) {

    infChart.xinTemplatesDataProvider = function () {
        infChart.templatesDataProvider.apply(this, arguments);

        var injector = angular.element('body > [ng-controller]:first').injector();

        this.chartUtilService = injector.get("chartUtilService");
    };

    infChart.util.extend(infChart.templatesDataProvider, infChart.xinTemplatesDataProvider);

    infChart.xinTemplatesDataProvider.prototype.saveChartTemplates = function (type, templates) {
        this.chartUtilService.saveChartTemplates(type, templates);
    };

    infChart.xinTemplatesDataProvider.prototype.getChartTemplates = function(type, onSuccess) {
        this.chartUtilService.getChartTemplates(type).then(function(type){
            onSuccess(data);
        });
    };
})(infChart, jQuery, angular);