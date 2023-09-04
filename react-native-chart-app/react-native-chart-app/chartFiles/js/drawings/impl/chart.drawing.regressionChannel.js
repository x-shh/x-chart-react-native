window.infChart = window.infChart || {};

infChart.regressionChannelDrawing = function () {
    infChart.drawingObject.apply(this, arguments);
    this.levels = {
        upper: { id: "upper", fillColor: '#726a6f', fillOpacity: 0.5, label: "label.upperFillColor" },
        lower: { id: "lower", fillColor: '#835974', fillOpacity: 0.5, label: "label.lowerFillColor" }
    };
};

infChart.regressionChannelDrawing.prototype = Object.create(infChart.drawingObject.prototype);

infChart.regressionChannelDrawing.prototype.additionalDrawingsFunction = function () {
    var ann = this.annotation,
        chart = ann.chart,
        options = ann.options,
        additionalDrawingsArr = this.additionalDrawings,
        levels = this.levels,
        theme = infChart.drawingUtils.common.getTheme.call(this),
        drawingFillAttr;

    additionalDrawingsArr.lines = {};
    additionalDrawingsArr.fill = {};

    var regOptions, themeFillColor,
        common = infChart.drawingUtils.common;

    $.each(levels, function (indx, value) {
        regOptions = options.levels && options.levels[indx];
        themeFillColor = theme.regressionChannel && theme.regressionChannel.fillColors && theme.regressionChannel.fillColors[value.id];
        drawingFillAttr = {
            'stroke-width': 0,
            fill: regOptions && regOptions.fillColor ? regOptions.fillColor : themeFillColor ? themeFillColor : value && value.fillColor ? value.fillColor : common.baseFillColor,
            'fill-opacity': regOptions && regOptions.fillOpacity ? regOptions.fillOpacity : value.fillOpacity != undefined ? value.fillOpacity : common.baseFillOpacity,
            stroke: ann.options.shape.params.stroke,
            'z-index': 2,
            cursor: 'move'
        };
        additionalDrawingsArr.fill[value.id] = chart.renderer.path(['M', 0, 0, 'L', 0, 0, 'L', 0, 0, 'L', 0, 0]).attr(drawingFillAttr).add(ann.group);
    });


    ann.selectionMarker = [];
    infChart.drawingUtils.common.addSelectionMarker.call(this, ann, 0, 0);
};

infChart.regressionChannelDrawing.prototype.bindSettingsEvents = function () {
    var self = this;

    function onLineColorChange(rgb, color) {
        var isPropertyChange = true;
        if (self.settingsPopup) {
            isPropertyChange = self.isSettingsPropertyChange();
        }
        infChart.drawingUtils.common.settings.onLineColorChange.call(self, rgb, color, isPropertyChange);
    }

    function onFillColorChange(rgb, value, opacity, level) {
        var isPropertyChange = true;
        if (self.settingsPopup) {
            isPropertyChange = self.isSettingsPropertyChange();
        }
        self.onFillColorChange(rgb, value, opacity, level, isPropertyChange)
    }

    function onLineWidthChange(strokeWidth) {
        var isPropertyChange = true;
        if (self.settingsPopup) {
            isPropertyChange = self.isSettingsPropertyChange();
        }
        infChart.drawingUtils.common.settings.onLineWidthChange.call(self, strokeWidth, isPropertyChange);
    }

    function onResetToDefault () {
        self.updateSavedDrawingProperties(true);
    }

    infChart.structureManager.drawingTools.bindRegressionChannelSettings(self.settingsPopup, onLineColorChange, onFillColorChange, onLineWidthChange, onResetToDefault);
};

infChart.regressionChannelDrawing.prototype.getConfig = function () {
    var self = this,
        annotation = self.annotation,
        levels = {};

    $.each(self.additionalDrawings.fill, function (id, val) {
        levels[id] = {
            fillColor: val.attr('fill'),
            fillOpacity: val.attr('fill-opacity')
        }
    });
    return {
        shape: 'regressionChannel',
        levels: levels,
        borderColor: annotation.options.shape.params.stroke,
        fillColor: annotation.options.shape.params.fill,
        strokeWidth: annotation.options.shape.params['stroke-width'],
        xValue: annotation.options.xValue,
        yValue: annotation.options.yValue,
        xValueEnd: annotation.options.xValueEnd,
        yValueEnd: annotation.options.yValueEnd,
        isLocked : annotation.options.isLocked

    };
};

infChart.regressionChannelDrawing.prototype.getOptions = function (properties) {
    var options = {
        xValue: properties.xValue,
        yValue: properties.yValue,
        allowDragY: false,
        shape: {
            params: {
                d: ['M', 0, 0, 'L', 0, 0]
            }
        }
    };
    if (properties.fillColor) {
        options.shape.params.fill = properties.fillColor;
    }
    if (properties.borderColor) {
        options.shape.params.stroke = properties.borderColor;
    }
    if (properties.strokeWidth) {
        options.shape.params['stroke-width'] = properties.strokeWidth;
    }
    if (properties.xValueEnd && properties.yValueEnd) {
        options.xValueEnd = properties.xValueEnd;
        options.yValueEnd = properties.yValueEnd;
    }
    if (properties.levels) {
        options.levels = properties.levels;
    }
    options.validateTranslationFn = this.validateTranslation;

    options = infChart.Drawing.prototype.getOptions(properties,options);

    return options;
};

infChart.regressionChannelDrawing.prototype.validateTranslation = function (newXValue) {
    var self = this,
        ann = self.annotation,
        options = ann.options,
        chart = ann.chart,
        seriesData = chart.series[0].xData,
        dataMin = seriesData[0],
        xVal = options.xValue,
        xValEnd = options.xValueEnd,
        newXValueEnd = xValEnd - xVal + newXValue,
        dataMax = seriesData[seriesData.length - 1];

    return (newXValue >= dataMin && newXValue <= dataMax) && (newXValueEnd >= dataMin && newXValueEnd <= dataMax);
};

infChart.regressionChannelDrawing.prototype.getQuickSettingsPopup = function () {
    return infChart.structureManager.drawingTools.getRegressionChannelQuickSettings(this.levels);
};

infChart.regressionChannelDrawing.prototype.getSettingsPopup = function () {
    return infChart.structureManager.drawingTools.getRegressionChannelSettings(this.levels);
    //var title = infChart.manager.getLabel('label.regressionChannel'),
    //    lineColor = infChart.drawingUtils.common.baseBorderColor,
    //    levels = this.levels,
    //    fillColor,
    //    baseOpacity = infChart.drawingUtils.common.baseFillOpacity,
    //    baseFillColor = infChart.drawingUtils.common.baseFillColor,
    //    fillOpacity,
    //    label;
    //
    //var regSettings =
    //    //'<div class="drawing_popup">' +
    //    //'<div class="drawing_popup_header"><div class="text-ellipsis"> <span inf-container="popupHeader">' + title + '</span></div><ul><li class="header_ctrl" inf-ctrl="closeSettings"> <span class="icon ico-close"></span> </li><li class="icon ico-trashcan header_ctrl" inf-ctrl="deleteDrawing"> </li></ul></div>' +
    //    '<div class="drawing_popup_row">' +
    //    '<table width="100%" border="0" cellspacing="0" cellpadding="0">' +
    //    '<tr>' +
    //    '<td width="30%"> <input type="hidden" inf-ctrl="lineColorPicker" value="' + lineColor + '">' +
    //    '<br>' +
    //    '<div class="label_colorPicker" data-localize="label.lineColor">' + infChart.manager.getLabel("label.lineColor") + '</div>' + '</td>';
    //
    //$.each(levels, function (id, value) {
    //
    //    fillColor = value.fillColor ? value.fillColor : baseFillColor;
    //    fillOpacity = value.fillOpacity ? value.fillOpacity : baseOpacity;
    //    label = levels[id].label;
    //
    //    regSettings += '<td width="30%"> <input type="hidden" inf-ctrl="fillColorPicker" value="' + fillColor + '" data-opacity="' + fillOpacity + '" inf-ctrl-val="' + value.id + '">' +
    //        '<div class="label_colorPicker"  data-localize="' + label + '">' + infChart.manager.getLabel(label) + '</div>' + '</td>';
    //
    //});
    //
    //regSettings +=
    //    '</tr> ' +
    //    '</table> ' +
    //    '</div>' +
    //    '<div class="drawing_popup_row">' +
    //    '<table width="100%" border="0" cellspacing="0" cellpadding="0">' +
    //    '<tr>' +
    //    '<td width="30%">' + '<div type="text" class="settings_btn selected" inf-ctrl="lineWidth" inf-size="1"><span style="font-weight: 100;">/</span></div>' + '</td>' +
    //    '<td  width="66%" colspan="2"> ' + '<div type="text" class="settings_btn" inf-ctrl="lineWidth" inf-size="2"><span style="font-weight: 400;">/</span></div>' +
    //    '<div type="text" class="settings_btn" inf-ctrl="lineWidth" inf-size="3"><span style="font-weight: 900;">/</span></div>' + '</td>' +
    //    '</tr>' +
    //    '<tr>' +
    //    '<td colspan="3" align="center">' + '<div class="label_colorPicker" data-localize="label.lineWeight">' + infChart.manager.getLabel("label.lineWeight") + '</div>' + '</td>' +
    //    '</tr>' +
    //    '</table> ' +
    //    '</div>' ;// +
    //    //'</div>';
    //
    //return regSettings;
};

/**
 * Change the fill, opacity and level of the annotation from the given params
 * IMPORTANT :: this method is uesed in commands.wrappers to set undo/redo actions
 * @param {object} rgb rgb value of the color
 * @param {string} value hash value of the color
 * @param {float} opacity opacity to be set
 * @param {number} level fib level
 * @param {boolean|undefined} isPropertyChange property change
 */
infChart.regressionChannelDrawing.prototype.onFillColorChange = function (rgb, value, opacity, level, isPropertyChange) {
    var self = this;
    self.annotation.update({
        shape: {
            params: {
                fill: value,
                'fill-opacity': opacity
            }
        }
    });

    var drawingsFill = self.additionalDrawings.fill[level];
    drawingsFill.attr({
        'fill': value,
        'fill-opacity': opacity
    });
    isPropertyChange && self.onPropertyChange();
    if (this.settingsPopup) {
        this.settingsPopup.data("infUndoRedo", false);
    }
    infChart.drawingUtils.common.saveDrawingProperties.call(self);
};

infChart.regressionChannelDrawing.prototype.scale = function () {
    var self = this,
        ann = this.annotation,
        chart = ann.chart,
        options = ann.options,
        xAxis = chart.xAxis[options.xAxis],
        xVal = options.xValue,
        periodStartXValue = options.xValueEnd > xVal ? xVal : options.xValueEnd,
        periodEndXValue = options.xValueEnd < xVal ? xVal : options.xValueEnd,
        dx = xAxis.toPixels(options.xValueEnd) - xAxis.toPixels(xVal),
        regressionLinePoints = infChart.math.calculateLinearRegression(chart, ann.options.yValue, periodStartXValue, periodEndXValue),
        regressionChannelPoints = infChart.math.calculateRegressionChannel(regressionLinePoints.calcData.points, regressionLinePoints.startPointY, regressionLinePoints.endPointY),
        regLevels = this.levels,
        fillDrawings = self.additionalDrawings.fill,
        fill,
        currentLine;

    var line = [
        "M", 0, regressionLinePoints.startPointY, 'L', parseInt(dx, 10), regressionLinePoints.endPointY,
        "M", 0, regressionChannelPoints.upper.startPointY, 'L', parseInt(dx, 10), regressionChannelPoints.upper.endPointY,
        "M", 0, regressionChannelPoints.lower.startPointY, 'L', parseInt(dx, 10), regressionChannelPoints.lower.endPointY
    ];

    ann.update({
        shape: {
            params: {
                d: line
            }
        }
    });

    $.each(regLevels, (function (index) {
        fill = fillDrawings && fillDrawings[index];
        currentLine = regressionChannelPoints[index];

        if (index == "upper") {
            fill.attr({
                d: ['M', line[1], line[2], 'L', line[4], line[5], 'L', line[10], line[11], 'L', line[7], line[8], 'L', line[1], line[2]]
            });
        } else {
            fill.attr({
                d: ['M', line[1], line[2], 'L', line[4], line[5], 'L', line[16], line[17], 'L', line[13], line[14], 'L', line[1], line[2]]
            });
        }
    }));

    infChart.drawingUtils.common.removeDragSupporters.call(this, this.dragSupporters);
    infChart.drawingUtils.common.addDragSupporters.call(this, ann, chart, line, this.dragSupporters);
};

infChart.regressionChannelDrawing.prototype.selectAndBindResize = function () {
    var ann = this.annotation,
        width, height, pathDefinition, startX, startY;

    ann.events.deselect.call(ann);
    ann.selectionMarker = [];
    pathDefinition = ann.shape.d.split(' ');
    startX = parseFloat(pathDefinition[1]);
    startY = parseFloat(pathDefinition[2]);
    width = parseFloat(pathDefinition[4]);
    height = parseFloat(pathDefinition[5]);
    infChart.drawingUtils.common.addAndBindSelectionMarker.call(this, ann, startX, startY, this.stepFunction, this.stop, true);
    infChart.drawingUtils.common.addAndBindSelectionMarker.call(this, ann, width, height, this.stepFunction, this.stop, false);
};

infChart.regressionChannelDrawing.prototype.step = function (e, isStartPoint) {
    var self = this,
        ann = this.annotation,
        chart = ann.chart,
        points = infChart.drawingUtils.common.calculateInitialPoints(e, ann, isStartPoint, 0, 0),
        xValueEnd = isStartPoint ? ann.options.xValueEnd : points.xAxis.toValue(points.x),
        periodStartXValue = xValueEnd > ann.options.xValue ? ann.options.xValue : xValueEnd,
        periodEndXValue = xValueEnd < ann.options.xValue ? ann.options.xValue : xValueEnd,
        regressionLinePoints = infChart.math.calculateLinearRegression(chart, ann.options.yValue, periodStartXValue, periodEndXValue),
        regressionChannelPoints = infChart.math.calculateRegressionChannel(regressionLinePoints.calcData.points, regressionLinePoints.startPointY, regressionLinePoints.endPointY),
        regLevels = this.levels,
        fillDrawings = self.additionalDrawings.fill,
        fill,
        currentLine;

    var line = [
        "M", 0, regressionLinePoints.startPointY, 'L', parseInt(points.dx, 10), regressionLinePoints.endPointY,
        "M", 0, regressionChannelPoints.upper.startPointY, 'L', parseInt(points.dx, 10), regressionChannelPoints.upper.endPointY,
        "M", 0, regressionChannelPoints.lower.startPointY, 'L', parseInt(points.dx, 10), regressionChannelPoints.lower.endPointY
    ];
    ann.shape.attr({
        d: line
    });
    $.each(regLevels, (function (index) {
        fill = fillDrawings && fillDrawings[index];
        currentLine = regressionChannelPoints[index];

        if (index == "upper") {
            fill.attr({
                d: ['M', line[1], line[2], 'L', line[4], line[5], 'L', line[10], line[11], 'L', line[7], line[8], 'L', line[1], line[2]]
            });
        } else {
            fill.attr({
                d: ['M', line[1], line[2], 'L', line[4], line[5], 'L', line[16], line[17], 'L', line[13], line[14], 'L', line[1], line[2]]
            });
        }
    }));
    return line;
};

infChart.regressionChannelDrawing.prototype.stop = function (e, isStartPoint) {
    var ann = this.annotation,
        chart = ann.chart,
        line = this.stepFunction(e, isStartPoint),
        xAxis = chart.xAxis[ann.options.xAxis],
        yAxis = chart.yAxis[ann.options.yAxis],
        x = xAxis.toValue(line[4] + xAxis.toPixels(ann.options.xValue)),
        y = yAxis.toValue(line[5] + yAxis.toPixels(ann.options.yValue));

    ann.update({
        xValueEnd: x,
        yValueEnd: y,
        shape: {
            params: {
                d: line
            }
        }
    });

    infChart.drawingUtils.common.saveBaseYValues.call(this, ann.options.yValue, y);
    infChart.drawingUtils.common.removeDragSupporters.call(this, this.dragSupporters);
    infChart.drawingUtils.common.addDragSupporters.call(this, ann, chart, line, this.dragSupporters);
    infChart.drawingUtils.common.onPropertyChange.call(this);
};

infChart.regressionChannelDrawing.prototype.translate = function () {
    var ann = this.annotation,
        chart = ann.chart,
        options = ann.options,
        xAxis = chart.xAxis[options.xAxis],
        xVal = options.xValue,
        periodStartXValue = options.xValueEnd > xVal ? xVal : options.xValueEnd,
        periodEndXValue = options.xValueEnd < xVal ? xVal : options.xValueEnd,
        dx = xAxis.toPixels(options.xValueEnd) - xAxis.toPixels(xVal),
        regressionLinePoints = infChart.math.calculateLinearRegression(chart, ann.options.yValue, periodStartXValue, periodEndXValue),
        regressionChannelPoints = infChart.math.calculateRegressionChannel(regressionLinePoints.calcData.points, regressionLinePoints.startPointY, regressionLinePoints.endPointY),
        regLevels = this.levels,
        fillDrawings = this.additionalDrawings.fill,
        fill,
        currentLine;

    ann.events.deselect.call(ann);

    var line = [
        "M", 0, regressionLinePoints.startPointY, 'L', parseInt(dx, 10), regressionLinePoints.endPointY,
        "M", 0, regressionChannelPoints.upper.startPointY, 'L', parseInt(dx, 10), regressionChannelPoints.upper.endPointY,
        "M", 0, regressionChannelPoints.lower.startPointY, 'L', parseInt(dx, 10), regressionChannelPoints.lower.endPointY
    ];

    ann.update({
        shape: {
            params: {
                d: line
            }
        }
    });

    $.each(regLevels, (function (index) {
        fill = fillDrawings && fillDrawings[index];
        currentLine = regressionChannelPoints[index];

        if (index == "upper") {
            fill.attr({
                d: ['M', line[1], line[2], 'L', line[4], line[5], 'L', line[10], line[11], 'L', line[7], line[8], 'L', line[1], line[2]]
            });
        } else {
            fill.attr({
                d: ['M', line[1], line[2], 'L', line[4], line[5], 'L', line[16], line[17], 'L', line[13], line[14], 'L', line[1], line[2]]
            });
        }
    }));


    infChart.drawingUtils.common.removeDragSupporters.call(this, this.dragSupporters);
    infChart.drawingUtils.common.addDragSupporters.call(this, ann, chart, line, this.dragSupporters);
    // this.openDrawingSettings.call(this);
    this.selectAndBindResize();
    ann.chart.selectedAnnotation = ann;
};

infChart.regressionChannelDrawing.prototype.translateEnd = function () {
    infChart.drawingUtils.common.onPropertyChange.call(this);
};

infChart.regressionChannelDrawing.prototype.updateSettings = function (properties) {
    infChart.structureManager.drawingTools.updateRegressionChannelSettings(this.settingsPopup, properties.borderColor, properties.strokeWidth, properties.levels);
};