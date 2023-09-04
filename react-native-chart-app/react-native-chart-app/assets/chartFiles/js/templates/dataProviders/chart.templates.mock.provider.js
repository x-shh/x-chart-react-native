infChart.templatesDataProvider = function(vendor){};

infChart.templatesDataProvider.prototype.saveChartTemplates = function(type, templates){};

infChart.templatesDataProvider.prototype.getChartTemplates = function(type, onSuccess){};

(function(infChart, $){

    infChart.mockTemplatesDataProvider = function () {
        infChart.templatesDataProvider.apply(this, arguments);
    };

    infChart.util.extend(infChart.templatesDataProvider, infChart.mockTemplatesDataProvider);

    infChart.mockTemplatesDataProvider.prototype.saveChartTemplates = function(type, templates){
        infChart.util.saveData(infChart.util.getUserName() + "_" + type, templates);
    };

    infChart.mockTemplatesDataProvider.prototype.getChartTemplates = function(type, onSuccess){
        var templates = infChart.util.getData(infChart.util.getUserName() + "_" + type);
        onSuccess(templates);
    };
})(infChart, jQuery);