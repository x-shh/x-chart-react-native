/**
 * Indicators with advanced features(like indicators with drawing tools) goes here.
 *
 * Created by dushani on 10/25/18.
 */

var infChart = window.infChart || {};

/**
 * Advanced indicator class inherited by Indicator class
 * @constructor
 */
infChart.AdvancedIndicator = function () {
    infChart.Indicator.apply(this, arguments);
    this.drawings = [];
};

infChart.util.extend(infChart.Indicator, infChart.AdvancedIndicator);

/**
 * Override the destroy to delete drawing tool when necessary
 */
infChart.AdvancedIndicator.prototype.destroy = function () {
    infChart.Indicator.prototype.destroy.apply(this, arguments);
    var chartId = this.chartId;
    if (!this.series.length && this.drawings.length) {
        this.drawings.forEach(function (drawing) {
            infChart.drawingsManager.removeDrawing(chartId, drawing.drawingId, false);
        });
    }
};

/**
 * Update parameters from out side
 * @param options
 */
infChart.AdvancedIndicator.prototype.updateOptions = function (options) {
    for (var key in options) {
        if (options.hasOwnProperty(key)) {
            this.params[key] = options[key];
            this.updateSettingsWindow(key);
        }
    }
};

/**
 * Overwrite the settings panel for advance features like drawing tools
 * @param loadOptions
 * @private
 */
infChart.AdvancedIndicator.prototype.getSettingWindowHTML = function () {
    var self = this, config = self.getConfig(), chart = infChart.manager.getChart(self.chartId);
    var baseParameter = {}, selectionParameters = [], inputParameters = [], onOffParameter = {}, checkParameters = [];
    $.each(config.params, function (key) {
        if (key === "base") {
            var baseOptions = [];
            baseOptions.push({'key': infChart.indicatorDefaults.ULOPENPRICE, 'label': 'O'});
            baseOptions.push({'key': infChart.indicatorDefaults.ULHIGHPRICE, 'label': 'H'});
            baseOptions.push({'key': infChart.indicatorDefaults.ULLOWPRICE, 'label': 'L'});
            baseOptions.push({'key': infChart.indicatorDefaults.ULCLOSEPRICE, 'label': 'C'});

            baseParameter.key = key;
            baseParameter.label = infChart.manager.getLabel("label.indicatorParam.base");
            baseParameter.options = baseOptions;
            baseParameter.value = self.params[key];
        } else if (self.selectionOptions && self.selectionOptions[key]) {
            var selectionOptions = [];
            $.each(self.selectionOptions[key], function (key, val) {
                selectionOptions.push({
                    'label': infChart.manager.getLabel("label.indicatorParam." + val),
                    'value': val
                });
            });
            selectionParameters.push({'key': key, 'options': selectionOptions, 'value': self.params[key]});
        } else if(self.checkOptions && self.checkOptions.indexOf(key) !== -1) {
            checkParameters.xPush({'key': key, label: infChart.manager.getLabel("label.indicatorParam." + key),  value: self.params[key]});
        } else {
            var idx = self.titleParams.indexOf(key);
            var dec = (self.titleParamsDec && self.titleParamsDec[idx] != undefined ) ? self.titleParamsDec[idx] : 0;
            inputParameters.push({
                'key': key,
                'type': 'input',
                'value': Highcharts.numberFormat(self.params[key], dec),
                'label': infChart.manager.getLabel("label.indicatorParam." + key)
            });
        }
    });

    var seriesArray = [];
    $.each(self.series, function (k, seriesTemp) {
        var seriesId = seriesTemp.options.id;

        var styleTypes = (self.style[seriesId]) ? self.style[seriesId] : self.style["default"];

        var chartTypes = [];
        $.each(styleTypes, function (i, chartType) {
            var icon = self.icons[chartType] ? self.icons[chartType] : 'ico-chart-' + chartType;
            chartTypes.push({
                'type': chartType,
                'icon': icon,
                'colors': chart.getColorsForChartType(seriesTemp, chartType)
            });
        });

        seriesArray.push({'id': seriesId, 'name': seriesTemp.options.name, 'chartTypes': chartTypes});

        // series on off in param tab
        if (self.onOff && self.onOff.indexOf(seriesId) >= 0) {
            onOffParameter.key = seriesId;
            onOffParameter.value = seriesTemp.visible;
            onOffParameter.label = self.getLabel(seriesId, "indicatorShortDesc");
        }

    });

    var styleSection = infChart.structureManager.indicator.getSeriesStyleSection(seriesArray);

    var paramSection = infChart.structureManager.indicator.getSeriesParameterSection(baseParameter, selectionParameters, inputParameters, onOffParameter, undefined, checkParameters);

    var tools = [];
    self.drawings.forEach(function (drawingObj) {
        tools.push({
            'id': drawingObj.drawingId,
            'name': drawingObj.getTitle(),
            'content': drawingObj.getSettingsPopup()
        });
    });
    var toolsSection = infChart.structureManager.indicator.getDrawingToolsSection(tools);

    return infChart.structureManager.settings.getPanelHTML(this.chartId + '-indicator-panel', this.getUniqueId(),
        infChart.manager.getLabel('label.indicatorDesc.' + self.type),
        infChart.structureManager.settings.getPanelBodyHTML([paramSection, styleSection, toolsSection]));
};

infChart.AdvancedIndicator.prototype.bindSettingsContainerEvents = function ($container) {
    infChart.Indicator.prototype.bindSettingsContainerEvents.apply(this, arguments);
    this.drawings.forEach(function (drawingObj) {
        drawingObj.settingsPopup = $container.find('[inf-row-item-rel="' + drawingObj.drawingId + '"]');
        drawingObj.bindSettingsEvents();
    });
};

infChart.AdvancedIndicator.prototype.initializeSettingsWindow = function ($container) {
    infChart.Indicator.prototype.initializeSettingsWindow.apply(this, arguments);
};

infChart.AdvancedIndicator.prototype.triggerSettingsOptions = function (container, options) {
    infChart.Indicator.prototype.triggerSettingsOptions.apply(this, arguments);
    if (options.drawingId) {
        infChart.structureManager.indicator.triggerStylePanel(container, options.drawingId);
    }
};

infChart.AdvancedIndicator.prototype.getProperties = function () {
    var properties = infChart.Indicator.prototype.getProperties.apply(this, arguments);
    properties.tools = [];
    this.drawings.forEach(function (drawingObj) {
        if (drawingObj.annotation.options) {
            properties.tools.push(drawingObj.getConfig());
        }
    });
    return properties;
};

infChart.AdvancedIndicator.prototype.setProperties = function (config, redraw) {
    if (config.tools) {
        var self = this;
        for (var i = 0; i < config.tools.length; i++) {
            var drawingObj = self.drawings[i];
            config.tools[i].indicatorId = self.id;
            //NOTE : xValue,yValue are incorrect - but they will be updated by calculate
            //config.tools[i].drawingUpdateType = self.params.drawingUpdateType;
            //config.tools[i].regPeriod = +self.params.regPeriod;
            if (drawingObj) {
                drawingObj.setOptions(drawingObj.getOptions(config.tools[i]));
            }
        }
    }
    infChart.Indicator.prototype.setProperties.apply(this, arguments);
};