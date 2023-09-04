window.infChart = window.infChart || {};

infChart.arrowHeadDrawing = function () {
    infChart.drawingObject.apply(this, arguments);
};

infChart.arrowHeadDrawing.prototype = Object.create(infChart.drawingObject.prototype);


infChart.arrowHeadDrawing.prototype.additionalDrawingsFunction = function () {
    let self = this,
        ann = self.annotation,
        chart = ann.chart,
        arrowHead = self.arrowHeadDimensions(self.shape);

    self.additionalDrawings.arrowHead = chart.renderer.path(arrowHead).attr({
        fill: ann.options.shape.params.fill,
        x : ann.options.xValue,
        y : ann.options.yValue
    }).add(ann.group);
};

infChart.arrowHeadDrawing.prototype.arrowHeadDimensions = function (shape) {
    if (shape === 'upArrowHead') {
        return this.upArrowHeadDimensions(0, 0, 15, 15);
    } else if (shape === 'downArrowHead') {
        return this.downArrowHeadDimensions(0, 0, 15, 15);
    }
}

infChart.arrowHeadDrawing.prototype.upArrowHeadDimensions = function (x, y, w, h) {
    return ['M', x, y, 'L', x + w / 2, y + h, 'L', x - w / 2, y + h, 'L', x, y];
};

infChart.arrowHeadDrawing.prototype.downArrowHeadDimensions = function (x, y, w, h) {
    return ['M', x, y, 'L', x - w / 2 , y - h , 'L', x + w / 2, y - h, 'L', x, y];
};

infChart.arrowHeadDrawing.prototype.scale = function (isCalculateNewValueForScale) {
    let self = this,
        ann = self.annotation,
        chart = ann.chart,
        options = ann.options,
        nearestDataPointForXValue = infChart.math.findNearestDataPoint(chart, options.xValue, undefined, true, true);

    if (isCalculateNewValueForScale) {
        ann.update({
            xValue: nearestDataPointForXValue.xData
        });
    } else {
        ann.update();
    }
};

infChart.arrowHeadDrawing.prototype.getConfig = function () {
    let annotation = this.annotation;
    return {
        fillColor: annotation.options.fill,
        xValue: annotation.options.xValue,
        yValue: annotation.options.yValue
    };
};

infChart.arrowHeadDrawing.prototype.getOptions = function (properties) {
    let options = {
        xValue: properties.xValue,
        yValue: properties.yValue,
        shape: {
            type: 'arrowHead',
            params: {
                fill: properties.fillColor
            }
        }
    };

    if (properties.drawingType !== undefined) {
        options.drawingType = properties.drawingType;
    }

    return options;
};

infChart.arrowHeadDrawing.prototype.translateEnd = function () {
    let self = this,
        ann = self.annotation,
        chart = ann.chart,
        options = ann.options,
        nearestDataPointForXValue = infChart.math.findNearestDataPoint(chart, options.xValue, undefined, true, true);
    ann.update({
        xValue: nearestDataPointForXValue.xData
    });
    infChart.drawingUtils.common.onPropertyChange.call(this);
};

