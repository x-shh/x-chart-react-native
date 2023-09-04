window.infChart = window.infChart || {};


infChart.extendedLineDrawing = function () {
    infChart.lineDrawing.apply(this, arguments);
};

infChart.extendedLineDrawing.prototype = Object.create(infChart.lineDrawing.prototype);

infChart.extendedLineDrawing.prototype.getOptions = function (properties, chart) {
    var options = infChart.lineDrawing.prototype.getOptions.call(this, properties, chart);

    if(properties && properties.settings && properties.settings.isExtendRight !== undefined){
        options.settings.isExtendRight = properties.settings.isExtendRight;
    } else {
        options.settings.isExtendRight = true;
    }

    if(properties && properties.settings && properties.settings.isExtendLeft !== undefined){
        options.settings.isExtendLeft = properties.settings.isExtendLeft;
    } else {
        options.settings.isExtendLeft = true;
    }
    return options;
};

infChart.extendedLineDrawing.prototype.getConfig = function () {
    var properties = infChart.lineDrawing.prototype.getConfig.call(this);
    properties.shape = 'extendedLine';
    return properties;
};

