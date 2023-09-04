window.infChart = window.infChart || {};


infChart.rayDrawing = function () {
    infChart.lineDrawing.apply(this, arguments);
};

infChart.rayDrawing.prototype = Object.create(infChart.lineDrawing.prototype);

infChart.rayDrawing.prototype.getOptions = function (properties, chart) {
    var options = infChart.lineDrawing.prototype.getOptions.call(this, properties, chart);

    if(properties && properties.settings && properties.settings.isExtendRight !== undefined){
        options.settings.isExtendRight = properties.settings.isExtendRight;
    } else {
        options.settings.isExtendRight = true;
    }
    
    return options;
};

infChart.rayDrawing.prototype.getConfig = function () {
    var properties = infChart.lineDrawing.prototype.getConfig.call(this);
    properties.shape = 'ray';
    return properties;
};

