infChart.drawingDataProvider = function(vendor){};

infChart.drawingDataProvider.prototype.saveDrawingTemplates = function(data){};

infChart.drawingDataProvider.prototype.getSavedDrawingTemplates = function(onSuccess){};

(function(infChart, $){

    infChart.mockDrawingDataProvider = function () {
        infChart.drawingDataProvider.apply(this, arguments);
    };

    infChart.util.extend(infChart.drawingDataProvider, infChart.mockDrawingDataProvider);

    infChart.mockDrawingDataProvider.prototype.saveDrawingTemplates = function(data){
        infChart.util.saveData(infChart.util.getUserName() + "_" + "custom-drawing-templates", data);
    };

    infChart.mockDrawingDataProvider.prototype.getSavedDrawingTemplates = function(onSuccess){
        var drawingTemplates = infChart.util.getData(infChart.util.getUserName() + "_" + "custom-drawing-templates");
        onSuccess(drawingTemplates);
    };

    infChart.mockDrawingDataProvider.prototype.saveDefaultDrawingTemplates = function(data){
        infChart.util.saveData(infChart.util.getUserName() + "_" + "default-drawing-templates", data);
    };

    infChart.mockDrawingDataProvider.prototype.getDefaultSavedDrawingTemplates = function(onSuccess){
        var drawingTemplates = infChart.util.getData(infChart.util.getUserName() + "_" + "default-drawing-templates");
        onSuccess(drawingTemplates);
    };

})(infChart, jQuery);