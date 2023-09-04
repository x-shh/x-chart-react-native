window.infChart = window.infChart || {};


infChart.lineArrowDrawing = function () {
    infChart.lineDrawing.apply(this, arguments);
};

infChart.lineArrowDrawing.prototype = Object.create(infChart.lineDrawing.prototype);

infChart.lineArrowDrawing.prototype.getOptions = function (properties, chart) {
    var options = infChart.lineDrawing.prototype.getOptions.call(this, properties, chart);

    if(properties && properties.settings && properties.settings.isEndPoint !== undefined){
        options.settings.isEndPoint = properties.settings.isEndPoint;
    } else {
        options.settings.isEndPoint = true;
    }

    return options;
};

infChart.lineArrowDrawing.prototype.getConfig = function () {
    var properties = infChart.lineDrawing.prototype.getConfig.call(this);
    properties.shape = 'lineArrow';
    return properties;
};

