window.infChart = window.infChart || {};

infChart.alertLineDrawing = function () {
    infChart.drawingObject.apply(this, arguments);
};

infChart.alertLineDrawing.prototype = Object.create(infChart.drawingObject.prototype);

infChart.alertLineDrawing.prototype.additionalDrawingsFunction = function () {
    var drawingObject = this,
        ann = drawingObject.annotation,
        chart = ann.chart,
        options = ann.options,
        theme = Highcharts.theme && Highcharts.theme.alert || {},
        labelTheme = theme.label || {},
        height = theme.height || 14,
        padding = theme.padding || 3,
        top = -(height / 2 + padding),
        labelFill = labelTheme.fill || "rgb(255,255,255)",
        stroke = labelTheme.stroke || "#ffffff",
        opacity = theme.opacity || 1,
        labelFontColor = labelTheme.fontColor || "#ffffff",
        labelFontWeight = labelTheme.fontWeight || 500;

    var labelX = 0;

    /**
     * price label
     * @type {*|SVGElement}
     */
    var priceLabel = chart.renderer.label(infChart.alertManager.formatYValue(drawingObject.stockChartId, drawingObject.yValue), labelX, top).attr({
        'zIndex': 20,
        'padding': padding,
        'r': 1,
        'fill': labelFill,
        'opacity': opacity,
        'stroke': stroke,
        'stroke-width': 1,
        'stroke-linecap': 'butt',
        'stroke-linejoin': 'miter',
        'stroke-opacity': 1,
        'hAlign': 'center',
        'height': height,
        'class': 'price-lbl'
    }).add(ann.group);

    //textProps: ['direction', 'fontSize', 'fontWeight', 'fontFamily','fontStyle', 'color', 'lineHeight', 'width', 'textAlign','textDecoration', 'textOverflow', 'textOutline']
    priceLabel.css({ //to color text
        'fontWeight': labelFontWeight,
        'color': labelFontColor
    });

    labelX += priceLabel.width;

    drawingObject.additionalDrawings['priceLabel'] = priceLabel;

    var drawingLabel = chart.renderer.label("\uf017", labelX, top).attr({
        'zIndex': options.isDisplayOnly ? 1 : 20,
        'padding': padding,
        'r': 1,
        'fill': labelFill,
        'opacity': opacity,
        'stroke': stroke,
        'stroke-width': 1,
        'stroke-linecap': 'butt',
        'stroke-linejoin': 'miter',
        'stroke-opacity': 1,
        'hAlign': 'center',
        'height': height,
        'class': 'icon-label-fa',
        'cursor': 'pointer'
    }).add(ann.group);

    drawingLabel.css({ //to color text
        'fontWeight': labelFontWeight,
        'fill': labelFontColor
    });

    infChart.util.bindEvent(drawingLabel.element, 'mousedown', function (e) {
        e.stopPropagation();
        e.preventDefault();

        infChart.alertManager.onItemSelect(drawingObject.stockChartId, options.itemId);
    });

    drawingObject.additionalDrawings['ctrlLabel'] = drawingLabel;
};

infChart.alertLineDrawing.prototype.bindSettingsEvents = function () { };

infChart.alertLineDrawing.prototype.destroyDrawing = function () {
    this.additionalDrawings['priceLabel'].destroy();
    infChart.util.unbindEvent(this.additionalDrawings['ctrlLabel'].element, 'mousedown', function (e) {
        e.stopPropagation();
        e.preventDefault();

        infChart.alertManager.onItemSelect(drawingObject.stockChartId, options.id);
    });
    this.additionalDrawings['ctrlLabel'].destroy();
};

infChart.alertLineDrawing.prototype.getConfig = function () { };

infChart.alertLineDrawing.prototype.getOptions = function (properties) {
    var options = {
        xValue: properties.xValue,
        x: properties.x,
        yValue: properties.yValue,
        itemId: properties.itemId,
        isDisplayOnly: false,
        allowDragX: false,
        allowDragY: true,
        drawingType: infChart.constants.drawingTypes.alert,
        shape: {
            params: {
                d: ['M', 0, 0, 'L', 0, 0],
                dashstyle: 'solid',
                opacity: infChart.constants.chartTrading.theme.tradingLine.opacity,
                fill: infChart.constants.chartTrading.theme.tradingLine.buyColor,
                stroke: infChart.constants.chartTrading.theme.tradingLine.buyColor,
                'class': 'line',
                'stroke-width': 1
            }
        }
    };

    if (properties.width && !isNaN(properties.plotLeft)) {
        options.shape.params.d = ['M', properties.plotLeft, 0, 'L', properties.width + properties.plotLeft, 0];
    }

    if (properties.clickCords) {
        options.clickCords = properties.clickCords;
    }

    options.shape.params['z-index'] = 10;
    // options.adjustYAxisToViewAnnotation = true;
    // options.getExtremesFn = infChart.drawingUtils.common.tradingUtils.getLineExtremesFn;
    options.validateTranslationFn = this.validateTranslation;
    options.isRealTimeTranslation = true;

    return options;
};

infChart.alertLineDrawing.prototype.getPlotHeight = function () {
    return {
        height: this.additionalDrawings['priceLabel'] && this.additionalDrawings['priceLabel'].height
    };
};

infChart.alertLineDrawing.prototype.getSettingsPopup = function () {
    return $("<div></div>");
};

infChart.alertLineDrawing.prototype.scale = function () {
    var self = this,
        ann = self.annotation,
        chart = ann.chart,
        plotWidth = chart.plotWidth,
        plotx = chart.plotLeft;

    var label = self.additionalDrawings['priceLabel'];

    label.textSetter(infChart.alertManager.formatYValue(self.stockChartId, self.yValue));

    var ctrlLabel = self.additionalDrawings['ctrlLabel'];

    /* to fix hidden tab's label issues in flax layout, https://xinfiit.atlassian.net/browse/TTW-249 */
    ctrlLabel.textSetter(ctrlLabel.text.textStr);
    ctrlLabel.attr({
        x: label.x + label.width
    });

    var lastX = ctrlLabel.x + ctrlLabel.width;


    var line = ["M", lastX, 0, 'L', plotWidth, 0];

    ann.update({
        x: plotx, // since xValue is based on the actual time values on the series xAxis.min doesn't provide the exact coordinations of the plotLeft of the chart.
        xValue: null, // set xValue as null to position annotation to into x.
        shape: {
            params: {
                d: line
            }
        }
    });

    infChart.drawingUtils.common.removeDragSupporters.call(this, this.dragSupporters);
    infChart.drawingUtils.common.addDragSupporters.call(this, ann, chart, line, this.dragSupporters);
};

infChart.alertLineDrawing.prototype.selectAndBindResize = function () {
    infChart.drawingUtils.common.tradingUtils.selectAndBindResize.call(this, (this.annotation.chart.plotWidth * 0.9));
    var ann = this.annotation;

    if (ann.selectionMarker) {
    } else {
        var x = ann.chart.plotWidth * 0.9, y = 0, selectPointStyles = { stroke: ann.options.shape.params.stroke };
        ann.selectionMarker = [];
        infChart.drawingUtils.common.addSelectionMarker.call(this, ann, x, y, selectPointStyles);
    }
};

infChart.alertLineDrawing.prototype.step = function () { };

infChart.alertLineDrawing.prototype.stop = function (e) { };

infChart.alertLineDrawing.prototype.translate = function () {
    var self = this,
        ann = this.annotation,
        chart = ann.chart

    var priceLabel = this.additionalDrawings['priceLabel'];
    priceLabel.attr({
        text: infChart.alertManager.formatYValue(self.stockChartId, self.yValue)
    });

    this.selectAndBindResize();
    chart.selectedAnnotation = ann;
};

infChart.alertLineDrawing.prototype.updateSettings = function () { };

/**
 * validate moving orders below zero
 * called from annotations => translateAnnotation
 * should invoke with drawing object
 * @param x
 * @param y
 * @returns {boolean}
 */
infChart.alertLineDrawing.prototype.validateTranslation = function (x, y) {
    var annotation = this.annotation,
        yValue = annotation && annotation.options && infChart.drawingUtils.common.getBaseYValue.call(this, y);
    console.debug("validateTranslation : yValue : " + yValue);
    return (yValue && yValue >= 0);
};
