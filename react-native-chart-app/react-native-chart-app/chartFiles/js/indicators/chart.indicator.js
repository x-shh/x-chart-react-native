/**
 * Created by dushani on 9/16/15.
 */

var infChart = window.infChart || {};

infChart.indicatorDefaults = {

    ARITHMETICMOVINGAVERAGE: 'ARITHMETICMOVINGAVERAGE',
    MOVINGMEANDEVIATION: 'MOVINGMEANDEVIATION',
    EXPONENTIALMOVINGAVERAGE: 'EXPONENTIALMOVINGAVERAGE',
    WEIGHTEDMOVINGAVERAGE: 'WEIGHTEDMOVINGAVERAGE',
    ROLLINGMOVINGAVERAGE: 'ROLLINGMOVINGAVERAGE',
    ULCLOSEPRICE: 'ULCLOSEPRICE',
    ULOPENPRICE: 'ULOPENPRICE',
    ULHIGHPRICE: 'ULHIGHPRICE',
    ULLOWPRICE: 'ULLOWPRICE',
    ADL_COEFF_WITH_OPEN_PRICES: 'ADL_COEFF_WITH_OPEN_PRICES',
    ADL_COEFF_WITH_CLOSE_PRICES: 'ADL_COEFF_WITH_CLOSE_PRICES',
    ADL_MOVING_AVERAGE: 'ADL_MOVING_AVERAGE',
    MOVINGSTANDARDDEVIATION: 'MOVINGSTANDARDDEVIATION',
    NA: 'NA',
    ULTYPICALPRICE: 'ULTYPICALPRICE'
};

infChart.indicatorConst = {
    _EPSDENOM_: 0.000000000000001,
    ONEOSEVEN: 0.14285714285714285714
};

//region ************************************Indicator Base************************************************************
/**
 * Base class for indicators
 * Most of the common functions for indicator calculations will provide from the base class
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
infChart.Indicator = function (id, chartId, type, chartInstance) {
    this.id = id;
    this.chartId = chartId;
    this.type = type;
    this.chart = chartInstance;
    this.series = [];
    this.axisId = undefined;
    this.params = {};
    this.style = {
        "default": ["line", "dash", "column", "area"]
    };
    this.titleParams = ["period"];
    this.icons = {};
    this.isReady = false;
};

infChart.Indicator.prototype.setIndicatorReady = function (isReady) {
    this.isReady = typeof isReady == "undefined" ? true : isReady;
};

/**
 * Should implement from the Children classes
 */
infChart.Indicator.prototype.setTitle = function (axis, x, y, h, isUpdate) {
    var _self = this;
    var chart = _self.chart;
    if(chart.axisTitles){
        chart.axisTitles[axis] = (!chart.axisTitles[axis]) ? {} : chart.axisTitles[axis];
    } else {
        chart.axisTitles = [];
        chart.axisTitles[axis] = {};
    }
    var dataLabelWidth = 0;
    var theme = Highcharts.theme.indicator;
    var onTitleClick,
        text;

    infChart.util.forEach(this.series, function (i, series) {
        if (series.options && _self.isLegendEnabled(series)) {
            var seriesId = series.options.id,
                textWidth = 0,
                colorBoxWidth = 0,
                backgroundStyle = "",
                closeWidth = 0,
                hideWidth = 0,
                searchWidth = 0,
                legendPadding = theme.title.legendPadding !== undefined ? theme.title.legendPadding : 5,
                legendItemPadding = theme.title.legendItemPadding !== undefined ? theme.title.legendItemPadding : 5,
                colorBoxHeight = theme.title.colorBoxHeight !== undefined ? theme.title.colorBoxHeight : 6,
                colorBoxThemeWidth = theme.title.colorBoxWidth !== undefined ? theme.title.colorBoxWidth : 6,
                bgBoxHeight = theme.title.background && theme.title.background.height !== undefined ? theme.title.background.height : 20;
            //var axis = this.getAxisId();
            if (!chart.axisTitles[axis][seriesId]) {
                chart.axisTitles[axis][seriesId] = {};

                backgroundStyle = theme.title.background && theme.title.background.stroke ? "stroke:" + theme.title.background.stroke : "";
                chart.axisTitles[axis][seriesId]["t_bg"] = chart.renderer.rect(x /*+ 5*/, y + h - 14, textWidth + colorBoxWidth + legendPadding * 3 + 5, bgBoxHeight, 0).attr($.extend({
                    //    x: x,
                    //    y: y - 14,
                    opacity: 0.7,
                    zIndex: 9,
                    style: backgroundStyle
                }, theme.title.background)).add();

                chart.axisTitles[axis][seriesId]["l"] = chart.renderer.rect(x + legendPadding, y + h - 8, colorBoxThemeWidth, colorBoxHeight, 0).attr({zIndex: 10}).add(); // add legend color box

                colorBoxWidth = chart.axisTitles[axis][seriesId]["l"].element.getBBox().width;
                text = _self.getTitle(seriesId);

                chart.axisTitles[axis][seriesId]["t"] = chart.renderer.text('<span style="color:' + theme.title.textColor + '; font-weight:lighter; padding-left:5px; ">' + text + '</span>', x + legendPadding * 2 + colorBoxWidth, y + h).
                    attr({
                        cursor: "pointer", zIndex: 10,
                        "class": 'indicator-title'
                    }).add(); // add title


                textWidth = chart.axisTitles[axis][seriesId]["t"].element.getBBox().width + dataLabelWidth + 5;


                // set background of series title (a rectagle with background color)
                onTitleClick = function () {
                    _self.loadSettingWindow(false);
                };

                // bind click event for textbox
                chart.axisTitles[axis][seriesId]["t"].on('click', onTitleClick);

                // add close button
                if (infChart.indicatorMgr.isCloseBtnEnabled(_self.chartId) && !series.options.hideClose) {
                    let style = {
                        width: 5,
                        height: 1,
                        zIndex: 10,
                        fill: theme.title.buttonColor,
                        r: theme.title.buttonRadius || 0,
                        stroke: theme.title.buttonStroke,
                        opacity: 0.5,
                        style: {color: theme.title.buttonTextColor, cursor: "pointer"}
                    };
                    let xPosition = x + legendPadding * 3 + textWidth + colorBoxWidth;
                    let eyeIcon = series.visible ? '&#xe960;' : '&#xe961;';
                    let xPos = 2;

                    if (series.options.showSymbolSearch) {
                        let searchIcon = '&#x1F50D;';
                        chart.axisTitles[axis][seriesId]["search"] = chart.renderer.button('<i rel="ss-icon" >' + searchIcon + '</i>', xPosition, y + h - 14,
                            function (event) {
                                chartInstance = infChart.manager.getChart(_self.chartId);
                                var callBackFunction = function (symbol, symbol2) {
                                    _self.loadIndicatorHistoryData(symbol);
                                }
                                chartInstance.openSymbolSearch(true, callBackFunction);
                            },style, style, style, undefined,undefined,false).add();
                        $(chart.axisTitles[axis][seriesId]["search"].element.childNodes[1]).attr("x", xPos);
                        $(chart.axisTitles[axis][seriesId]["search"].element.childNodes[1]).attr("y", 14);
                        searchWidth = chart.axisTitles[axis][seriesId]["search"].element.getBBox().width;
                        xPosition = xPosition + searchWidth;
                        xPos = xPos + 3;
                    }

                    chart.axisTitles[axis][seriesId]["eye"] = chart.renderer.button('<i rel="eye-icon" class="icom-toggle-eye-o">' + eyeIcon + '</i>', xPosition, y + h - 14,
                        function () {
                            let containerId = infChart.manager.getContainerIdFromChart(chart.renderTo.id);
                            let eyeElement = chart.axisTitles[axis][seriesId]["eye"];
                            if (series.visible) {
                                eyeElement.attr({text: '<i class="icom-toggle-eye-o">&#xe961;</i>'});
                                infChart.indicatorMgr.showHideIndicator(containerId, seriesId, false);
                            } else {
                                eyeElement.attr({text: '<i class="icom-toggle-eye-o">&#xe960;</i>'});
                                infChart.indicatorMgr.showHideIndicator(containerId, seriesId, true);
                            }
                        }, style, style, style, undefined,undefined,false).add();

                    $(chart.axisTitles[axis][seriesId]["eye"].element.childNodes[1]).attr("x", xPos);
                    $(chart.axisTitles[axis][seriesId]["eye"].element.childNodes[1]).attr("y", 14);

                    hideWidth = chart.axisTitles[axis][seriesId]["eye"].element.getBBox().width;
                    xPosition = xPosition + hideWidth;
                    xPos = xPos + 3;
                    style.class = "indicator-close-btn fa fa-times";

                    chart.axisTitles[axis][seriesId]["b"] = chart.renderer.button('X', xPosition, y + h - 14,
                        function (event) {
                            // remove series
                            infChart.manager.removeSeries(chart.renderTo.id, seriesId, 'indicator', event);
                        }, style, style, style).add();

                    $(chart.axisTitles[axis][seriesId]["b"].element.childNodes[1]).attr("x", xPos);
                    $(chart.axisTitles[axis][seriesId]["b"].element.childNodes[1]).attr("y", 14);
                    closeWidth = chart.axisTitles[axis][seriesId]["b"].element.getBBox().width;
                }

            } else {

                if (isUpdate) {
                    var element = $(chart.axisTitles[axis][seriesId]["t"].element).find('tspan')[0];
                    var updatedText = _self.getTitle(seriesId);
                    $(element).html(_self.getTitle(updatedText));
                }
                colorBoxWidth = chart.axisTitles[axis][seriesId]["l"].element.getBBox().width;

                chart.axisTitles[axis][seriesId]["t"].attr({
                    x: x + legendPadding * 2 + colorBoxWidth,
                    y: y + h
                });

                textWidth = chart.axisTitles[axis][seriesId]["t"].element.getBBox().width + dataLabelWidth + 5;

                if (chart.axisTitles[axis][seriesId]["search"]) {
                    chart.axisTitles[axis][seriesId]["search"].attr({
                        x: x + legendPadding * 3 + textWidth + colorBoxWidth,
                        y: y + h - 14
                    });
                    searchWidth = chart.axisTitles[axis][seriesId]["search"].element.getBBox().width;
                }

                if (chart.axisTitles[axis][seriesId]["eye"]) {
                    chart.axisTitles[axis][seriesId]["eye"].attr({
                        x: x + legendPadding * 3 + textWidth + colorBoxWidth + searchWidth,
                        y: y + h - 14
                    });
                    hideWidth = chart.axisTitles[axis][seriesId]["eye"].element.getBBox().width;
                }

                if (chart.axisTitles[axis][seriesId]["b"]) {
                    chart.axisTitles[axis][seriesId]["b"].attr({
                        x: x + legendPadding * 3 + textWidth + colorBoxWidth + searchWidth + hideWidth,
                        y: y + h - 14
                    });
                    closeWidth = chart.axisTitles[axis][seriesId]["b"].element.getBBox().width;
                }
            }
            
            var t_bg = chart.axisTitles[axis][seriesId]["t_bg"].element.getBBox(),
                lBx = chart.axisTitles[axis][seriesId]["l"].getBBox();

            lBx = chart.axisTitles[axis][seriesId]["l"].attr({
                x: x + legendPadding,
                y: y + h - (t_bg.height - lBx.height) / 2,
                fill: series.color
            }).getBBox();

            t_bg = chart.axisTitles[axis][seriesId]["t_bg"].attr({
                x: x,
                y: y + h - 14,
                width: textWidth + colorBoxWidth + legendPadding * 3 + closeWidth + searchWidth + hideWidth 
            }).element.getBBox();

            if (chart.axisTitles[axis][seriesId]["b"]) {
                x = chart.axisTitles[axis][seriesId]["b"].x + chart.axisTitles[axis][seriesId]["b"].element.getBBox().width + legendItemPadding;
            } else {

                x = t_bg.x + t_bg.width + legendItemPadding;
            }
        }
    });
};

infChart.Indicator.prototype.getTitleParams = function () {
    var that = this;
    var params = [],
        count = 0;
    infChart.util.forEach(this.titleParams, function (i, paramName) {
        if (that.params[paramName] !== undefined) {
            var dec = (that.titleParamsDec && that.titleParamsDec[i] != undefined ) ? that.titleParamsDec[i] : 0;
            params[count] = Highcharts.numberFormat(that.params[paramName], dec);
            count++;
        }
    });
    return params.join('|');
};

infChart.Indicator.prototype.getTitle = function (seriesId, isLegend) {
    var self = this;
    if (typeof self.getIndicatorTitle === "function") {
        return self.getIndicatorTitle();
    } else {
        var paramStr = '';
        if (infChart.indicatorMgr.isParamsInLegendEnabled(this.chartId) && this.series.length > 0 && this.series[0].options.id == seriesId) {
            var params = this.getTitleParams();
            paramStr = (params != '') ? "(" + params + ")" : "";
        }
        return this.getLabel(seriesId, "indicatorShortDesc", isLegend) + paramStr;
    }
};

infChart.Indicator.prototype.updateTitle = function () {
    var axis = this.getAxisId(), chart = this.chart;

    if (infChart.util.isSeriesInBaseAxis(axis) || infChart.util.isSeriesParallelToBaseAxis(chart.get(axis))) {
        this.series[0].update({}, true);
    } else {
        if (this.series.length > 0) {
            var seriesId = this.series[0].options.id;
            if (chart.axisTitles && chart.axisTitles[this.getAxisId()] && chart.axisTitles[this.getAxisId()][seriesId]) {
                var yAxis = this.series[0].yAxis, x, y;
                var element = $(chart.axisTitles[this.getAxisId()][seriesId]["t"].element).find('tspan')[0];
                $(element).html(this.getTitle(seriesId));
                x = yAxis.left;
                y = yAxis.top - 6;
                this.setTitle(this.getAxisId(), x, y, 20, true);
            }
        } else {
            //do nothing
        }

    }
};

/**
 * Remove given series and delete idicator if there are no series left
 * @param {string} seriesId series to be removed
 * @param {boolean} isPropertyChange isPropertyChange to be used in wrappers
 */
infChart.Indicator.prototype.removeSeries = function (seriesId, isPropertyChange) {

    var axis = this.getAxisId();
    var chart = this.chart;
    var indObj = this;

    var index = -1;
    var hideLegend = false;
    var hasSeriesWithLegend = false;

    if (chart) {
        if (this.series.length > 1) {
            infChart.util.forEach(this.series, function (i, serie) {
                if (seriesId === serie.options.id) {
                    index = i;
                    hideLegend = !indObj.isLegendEnabled(serie);
                    serie.remove(false);
                } else if (indObj.isLegendEnabled(serie)) {
                    hasSeriesWithLegend = true;
                }
            });
        }

        if (!hasSeriesWithLegend) {
            infChart.util.forEach(this.series, function (i, serie) {
                if (serie.options) { // not removed from the earlier step
                    serie.remove(false);
                }
            });
            this.series = [];
        } else {
            this.series.splice(index, 1);
            this.updateTitle();
        }

        if (!infChart.util.isSeriesInBaseAxis(axis) && !infChart.util.isSeriesParallelToBaseAxis(chart.get(axis))) {

            if (!hideLegend && chart.axisTitles && chart.axisTitles[axis] && chart.axisTitles[axis][seriesId]) {
                //var rectangle = chart.axisTitles[axis][seriesId]["b"];
                //var parent = rectangle.element.parentNode;

                // remove series title objects
                infChart.util.forEach(chart.axisTitles[axis][seriesId], function (key, renderedObj) {
                    renderedObj.destroy();
                });
                chart.axisTitles[axis][seriesId] = null;
                delete chart.axisTitles[axis][seriesId];
            }

            // remove whole axis title object and background if no more series available for the indicator
            if (this.series.length == 0 && chart.axisTitles) {

                //chart.axisTitles[axis + "_bg"].destroy();
                chart.axisTitles[axis + "_resize"].destroy();
                chart.axisTitles[axis + "_resizeH"].destroy();
                chart.axisTitles[axis] = null;
                delete chart.axisTitles[axis];
                //chart.axisTitles[axis + "_bg"] = null;
                //delete chart.axisTitles[axis + "_bg"];
                chart.axisTitles[axis + "_resize"] = null;
                delete chart.axisTitles[axis + "_resize"];
                chart.axisTitles[axis + "_resizeH"] = null;
                delete chart.axisTitles[axis + "_resizeH"];
            }
        }

        if (this.series.length === 0) {
            this.destroy();
        }
    }

};

/**
 * Add indicator series with the given options
 * @param {object} options series options
 */
infChart.Indicator.prototype.addSeries = function (options) {
    var chartInstance = this.chart;
    this.series.push(chartInstance.addSeries(options, true));

    if (this.panel) {
        this.removeSettingWindow();
        this.loadSettingWindow();
    }

    this.updateTitle();
};

infChart.Indicator.prototype.getAxisId = function () {
    var axisId = (this.axisId) ? this.axisId : (this.series.length > 0) ? this.series[0].yAxis.options.id : undefined;
    return axisId;
};

infChart.Indicator.prototype._isAxisParallelToBase = function () {
    return false;
};

infChart.Indicator.prototype._isAxisDissimilerToBase = function () {
    return !infChart.util.isSeriesInBaseAxis(this.getAxisId())
};

infChart.Indicator.prototype.getLabel = function (seriesId, labelType, isLegend) {
    var label = seriesId, labelKey = "";
    labelType = (labelType) ? labelType : "indicatorDesc";
    var ind = this;
    infChart.util.forEach(this.series, function (i, series) {
        if (series.options.id === seriesId) {
            var subType = (isLegend && (!ind.isLegendEnabled(series) || series.options.legendKey) ) ? (series.options.legendKey) ? series.options.legendKey : series.options.infIndType : series.options.infIndSubType;
            labelKey = "label." + labelType + "." + subType;
            label = infChart.manager.getLabel(labelKey);
            label = (label == labelKey) ? subType : label;
            return false;
        }
    });
    return (label) ? label : seriesId;
};

infChart.Indicator.prototype.addAxis = function (options) {
    var stockChart = infChart.manager.getChart(this.chartId),
        chart = this.chart,
        mainYaxis = stockChart.getMainYAxis(),
        theme = infChart.themeManager.getTheme(),
        labelColor = theme && theme.yAxis && theme.yAxis.labels.style.color,

        config = $.extend(true, {
            infAxisType: "indicator",
            infIndId: this.id,
            startOnTick: false,
            endOnTick: false,
            opposite: mainYaxis.options.opposite,
            "title": {
                "text": ""
            },
            "maxPadding": 0,
            "minPadding": 0,
            offset: 0,
            gridLineWidth: options.infType != "parallelToBase" ? 1 : 0,
            labels: {
                align: mainYaxis.options.labels.align,
                enabled: options.infType != "parallelToBase",
                x: mainYaxis.options.labels.x,
                y: mainYaxis.options.labels.y,
                style: {textOverflow: 'unset'},
                formatter: function () {
                    var value = infChart.util.formatWithNumericSymbols(this.value);
                    return infChart.structureManager.common.getAxisLabelHtml(labelColor, value);
                }
            },
            crosshair: false
        }, options);

    chart.addAxis(config, false, false, false);
};

infChart.Indicator.prototype.destroy = function () {

    var axis = this.getAxisId(), chart = this.chart;

    if (axis && this.series.length == 0 && !infChart.util.isSeriesInBaseAxis(axis)) {
        var axisObj = chart.get(axis);
        axisObj.remove();
    }
    if(this.showHideLoader){
        this.showHideLoader(false);
    }
    this.chart = undefined;
    this.removeSettingWindow();
};

//region loadSettingWindow

/**
 * load settings
 * called in 2 instances
 * when indicator is created - this is for the panel - we do not want to show the popup
 * when indicator legend is clicked
 * @param {boolean} hide - we do not want to show the popup
 * @param {object} options - loading options
 */
infChart.Indicator.prototype.loadSettingWindow = function (hide, options) {
    var self = this;

    if (!this.disableSettings) {
        var container = infChart.indicatorMgr.getSettingsContainer(self.chartId, 'indicatorPanelView');
        var showPanel = false;
        if (container) {
            if (!hide || self.showSettingsPanelInitially) {
                var iChart = infChart.manager.getChart(self.chartId);
                iChart.showRightPanelWithTab(self.chartId + "_" + "indicatorPanelView");
                showPanel = true;
            }
            self._showSettingWindowInPanel(options, false);//we have to create the panel
        }
    }
};

infChart.Indicator.prototype.getUniqueId = function () {
    return (this.chartId + "-" + this.id);
};

infChart.Indicator.prototype.removeSettingWindow = function () {
    var self = this;
    if (self.panel) {
        self.panel.remove();
        self.panel = undefined;
    }
};

infChart.Indicator.prototype.triggerSettingsOptions = function (container, options) {
    if (options.seriesId) {
        infChart.structureManager.indicator.triggerStylePanel(container, options.seriesId);
    }
};

infChart.Indicator.prototype.getSettingWindowHTML = function () {
    var self = this, config = self.getConfig();
    var baseParameter = {}, selectionParameters = [], inputParameters = [], onOffParameter = [], checkParameters = [];
    infChart.util.forEach(config.params, function (key) {
        if (key === "base") {
            var baseOptions = [];
            baseOptions.xPush({'key': infChart.indicatorDefaults.ULOPENPRICE, 'label': 'O'});
            baseOptions.xPush({'key': infChart.indicatorDefaults.ULHIGHPRICE, 'label': 'H'});
            baseOptions.xPush({'key': infChart.indicatorDefaults.ULLOWPRICE, 'label': 'L'});
            baseOptions.xPush({'key': infChart.indicatorDefaults.ULCLOSEPRICE, 'label': 'C'});

            baseParameter.key = key;
            baseParameter.label = infChart.manager.getLabel("label.indicatorParam.base");
            baseParameter.options = baseOptions;
            baseParameter.value = self.params[key];
        } else if (self.selectionOptions && self.selectionOptions[key]) {
            var selectionOptions = [];
            infChart.util.forEach(self.selectionOptions[key], function (key, val) {
                selectionOptions.xPush({
                    'label': infChart.manager.getLabel("label.indicatorParam." + val),
                    'value': val
                });
            });
            selectionParameters.xPush({'key': key, 'options': selectionOptions, 'value': self.params[key]});
        } else if (self.checkOptions && self.checkOptions.indexOf(key) !== -1) {
            checkParameters.xPush({'key': key, label: infChart.manager.getLabel("label.indicatorParam." + key),  value: self.params[key]});
        } else {
            var idx = self.titleParams.indexOf(key);
            var dec = (self.titleParamsDec && self.titleParamsDec[idx] != undefined ) ? self.titleParamsDec[idx] : 0;
            inputParameters.xPush({
                'key': key,
                'type': 'input',
                'value': Highcharts.numberFormat(self.params[key], dec),
                'label': infChart.manager.getLabel("label.indicatorParam." + key)
            });
        }
    });

    var seriesArray = [];
    infChart.util.forEach(self.series, function (k, seriesTemp) {

        var seriesOptsionstemp = self._getSeriesSettingsOptions(seriesTemp);

        seriesArray.xPush(seriesOptsionstemp.styleOptions);
        if (seriesOptsionstemp.onOffParameter) {
            // series on off in param tab
            onOffParameter.xPush(seriesOptsionstemp.onOffParameter);//TODO :: seems like a refactoring issue , on off parameters should be set to each series
        }
    });

    var styleSection = infChart.structureManager.indicator.getSeriesStyleSection(seriesArray);
    var paramSection = infChart.structureManager.indicator.getSeriesParameterSection(baseParameter, selectionParameters, inputParameters, onOffParameter, undefined, checkParameters);

    return infChart.structureManager.settings.getPanelHTML(this.chartId + '-indicator-panel', this.getUniqueId(),
        infChart.manager.getLabel('label.indicatorDesc.' + self.type),
        infChart.structureManager.settings.getPanelBodyHTML([paramSection, styleSection]));
};

infChart.Indicator.prototype._getSeriesSettingsOptions = function (seriesTemp) {
    var self = this,
        chart = infChart.manager.getChart(self.chartId),
        seriesId = seriesTemp.options.id,
        styleTypes = (self.style[seriesId]) ? self.style[seriesId] : self.style["default"],
        chartTypes = [],
        styleOptions,
        onOffParameter;

    infChart.util.forEach(styleTypes, function (i, chartType) {
        var icon = self.icons[chartType] ? self.icons[chartType] : 'ico-chart-' + chartType;
        chartTypes.xPush({
            'type': chartType,
            'icon': icon,
            'colors': chart.getColorsForChartType(seriesTemp, chartType)
        });
    });

    styleOptions = {'id': seriesId, 'name': seriesTemp.options.name, 'chartTypes': chartTypes};

    // series on off in param tab
    if (self.onOff && self.onOff.indexOf(seriesId) >= 0) {
        onOffParameter = {};
        onOffParameter.key = seriesId;
        onOffParameter.value = seriesTemp.visible;
        onOffParameter.label = self.getLabel(seriesId, "indicatorShortDesc");
    }

    return {styleOptions: styleOptions, onOffParameter: onOffParameter};
};

/**
 * Initialize the settings panel and display if needed
 * @param {object} loadOptions  default options to load popup { seriesId - sub type to load in the style drop down }
 * @param {boolean} show
 * @private
 */
infChart.Indicator.prototype._showSettingWindowInPanel = function (loadOptions, show) {
    var self = this;

    var container = infChart.indicatorMgr.getSettingsContainer(self.chartId, 'indicatorPanelView');
    if (container) {
        var panel = self.panel;
        if (panel && panel.length > 0) {
            if (!panel.find('div.panel-collapse').is(":visible")) {
                panel.find('div.panel-heading a').trigger('click');
            }
        } else {
            panel = $(self.getSettingWindowHTML()).appendTo(container);

            self.bindSettingsContainerEvents(panel, false);
            self.initializeSettingsWindow(panel, false);
            self.panel = panel;
            if (self.showSettingsPanelInitially || show) {
                if (!panel.find('div.panel-collapse').is(":visible")) {
                    panel.find('div.panel-heading a').trigger('click');
                }
            }
        }
        if (loadOptions) {
            self.triggerSettingsOptions(panel, loadOptions);
        }
    }
};

/**
 * bind settings events
 * @param $container - if indicator panel then this is a panel otherwise it is a popup window
 * @private
 */
infChart.Indicator.prototype.bindSettingsContainerEvents = function ($container, seriesArray) {
    var self = this;

    /**
     * Get Executes when base is changed from the settings panel
     * @param {string} value base
     */
    function onBaseChange(value) {
        var isPropertyChange = true;
        if (self.panel) {
            isPropertyChange = self.isSettingsPropertyChange();
        }
        self.onBaseChange(value, isPropertyChange);
    }

    /**
     * Get executed on selection params changed by settings panel
     * @param {string} param param name
     * @param {string} value selected value
     */
    function onSelectionChange(param, value) {
        var isPropertyChange = true;
        if (self.panel) {
            isPropertyChange = self.isSettingsPropertyChange();
        }
        self.onSelectionChange(param, value, isPropertyChange);
    }

    /**
     * Get executed on input params changed by settings panel
     * @param {string} param param name
     * @param {string} paramValue selected value
     */
    function onInputParamChange(param, paramValue) {
        var isPropertyChange = true;
        if (self.panel) {
            isPropertyChange = self.isSettingsPropertyChange();
        }
        self.onInputParamChange(param, paramValue, isPropertyChange);
    }

    /**
     * Get executed when series on/off is changed by settings panel
     * @param {string} seriesId param name
     * @param {string} isOn selected value
     */
    function onOnOffChange(seriesId, isOn) {
        var isPropertyChange = true;
        if (self.panel) {
            isPropertyChange = self.isSettingsPropertyChange();
        }
        return self.onOnOffChange(seriesId, isOn, isPropertyChange);
    }

    /**
     * Get executed when series color is changed by settings panel
     * @param {string} seriesId param name
     * @param {object} colorObj selected color
     */
    function onColorChange(seriesId, colorObj) {
        var colorPicker = $(this).attr("inf-ctrl");
        var colorPickerContainer = $(this).closest("[inf-col-pick-container]");
        var isPropertyChange = true;
        if (self.panel) {
            isPropertyChange = self.isSettingsPropertyChange();
        }
        return self.onColorChange(seriesId, colorObj, isPropertyChange, "[rel='" + colorPickerContainer.attr("rel") + "'] [inf-ctrl='" + colorPicker + "']");
    }

    /**
     * Get executed when series line width is changed by settings panel
     * @param {string} seriesId param name
     * @param {number} strokeWidth selected width
     */
    function onLineWidthChange(seriesId, strokeWidth) {
        var colorPickerContainer = $(this).closest("[inf-col-pick-container]");
        var isPropertyChange = true;
        if (self.panel) {
            isPropertyChange = self.isSettingsPropertyChange();
        }
        return self.onLineWidthChange(seriesId, strokeWidth, isPropertyChange, "[rel='" + colorPickerContainer.attr("rel") + "']");
    }

    /***
     * Get executed when series type is changed by settings panel
     * @param {string} seriesId param name
     * @param {string} chartType type
     * @param {object} styleObj colors of the type
     */
    function onChartTypeChange(seriesId, chartType, styleObj) {
        var isPropertyChange = true;
        if (self.panel) {
            isPropertyChange = self.isSettingsPropertyChange();
        }
        return self.onChartTypeChange(seriesId, chartType, styleObj, isPropertyChange);

    }

    function onCheckItemChange(param, value) {
        var isPropertyChange = true;
        if (self.panel) {
            isPropertyChange = self.isSettingsPropertyChange();
        }
        self.onCheckItemChange(param, value, isPropertyChange);
    }

    infChart.structureManager.indicator.bindParameterElements($container, onBaseChange, onSelectionChange, onInputParamChange, onOnOffChange, onCheckItemChange);

    if (!seriesArray) {
        seriesArray = [];
        var count = 0;
        infChart.util.forEach(self.series, function (i, series) {
            seriesArray[count] = {'id': series.options.id, 'color': series.color};
            count++;
        });

    }
    infChart.structureManager.indicator.bindStyleElements($container, seriesArray, onChartTypeChange, onColorChange, onLineWidthChange);

    infChart.structureManager.settings.bindPanel($container, function () {
        infChart.indicatorMgr.removeIndicatorFromSettings(self.chartId, self.id);
    });
};

infChart.Indicator.prototype.initializeSettingsWindow = function ($container) {

    var self = this;
    var seriesArray = [],
        count = 0;
    infChart.util.forEach(self.series, function (i, series) {
        seriesArray[count] = {'id': series.options.id, 'type': series.type, 'lineWidth': series.options.lineWidth};
        count++;
    });

    infChart.structureManager.indicator.initializeStylePanel($container, seriesArray);
};

infChart.Indicator.prototype.updateParamInSettingsWindow = function ($container, param) {
    var self = this;
    var value, paramType;
    if (param == "base") {
        value = self.params[param];
        paramType = 'base';
    } else if (self.selectionOptions && self.selectionOptions[param]) {
        value = self.params[param];
        paramType = 'selection';
    } else {
        var idx = self.titleParams.indexOf(param);
        var dec = (self.titleParamsDec && self.titleParamsDec[idx] != undefined ) ? self.titleParamsDec[idx] : 0;
        value = Highcharts.numberFormat(self.params[param], dec);
        paramType = 'input';
    }
    infChart.structureManager.indicator.updateParameterElements($container, param, value, paramType);
};

infChart.Indicator.prototype.updateSettingsWindow = function (param) {
    var self = this;

    function updateParam($container) {
        if (param) {
            self.updateParamInSettingsWindow($container, param);
        } else {
            infChart.util.forEach(self.params, function (i, val) {
                self.updateParamInSettingsWindow($container, val);
            });
        }
    }

    if (self.panel) {
        updateParam(self.panel);
    }
    // TODO :: update series options
};

/**
 * Executes on base of the data changed by settings panel
 * @param {string} value base
 * @param {boolean} isPropertyChange property change
 */
infChart.Indicator.prototype.onBaseChange = function (value, isPropertyChange) {
    var self = this,
        indData = self.getData(),
        baseData = indData.base && indData.base.ohlcv && indData.base;

    self.params.base = value;
    if (baseData && baseData.ohlcv && baseData.data) {
        self.calculate(baseData.ohlcv, baseData.data, true, undefined, indData);
    }

    isPropertyChange && self.onPropertyChange();
    if (self.panel) {
        self.panel.data("infUndoRedo", false);
    }
};

/**
 * Get executed on selection params changed by settings panel
 * @param {string} param param name
 * @param {string} value selected value
 * @param {boolean} isPropertyChange property change
 */
infChart.Indicator.prototype.onSelectionChange = function (param, value, isPropertyChange) {
    var self = this,
        indData = self.getData(),
        baseData = indData.base && indData.base.ohlcv && indData.base;

    self.params[param] = value;
    self.calculate(baseData.ohlcv, baseData.data, true, undefined, indData);
    isPropertyChange && self.onPropertyChange();
    if (self.panel) {
        self.panel.data("infUndoRedo", false);
    }
};

/**
 * Get executed on input params changed by settings panel
 * @param {string} param param name
 * @param {string} paramValue selected value
 * @param {boolean} isPropertyChange property change
 */
infChart.Indicator.prototype.onInputParamChange = function (param, paramValue, isPropertyChange) {
    var self = this;
    var langOpt = Highcharts.getOptions().lang;
    var decimalSep = langOpt && langOpt.decimalPoint ? langOpt.decimalPoint : ".";
    var thousandsSep = langOpt && langOpt.thousandsSep ? langOpt.thousandsSep : ",";
    var values = (decimalSep != "") ? paramValue.toString().split(decimalSep) : [paramValue];
    var idx = self.titleParams.indexOf(param);

    if (values.length > 0) {
        infChart.util.forEach(values, function (i, v) {
            values[i] = (thousandsSep != "") ? v.split(thousandsSep).join("") : v;
        });
    }
    var value = values.join(".");
    if (!isNaN(value)) {
        self.params[param] = value;
        var indData = self.getData(),
            baseData = indData.base && indData.base.ohlcv && indData.base;

        if (baseData && baseData.ohlcv && baseData.data) {
            self.calculate(baseData.ohlcv, baseData.data, true, undefined, indData);
        }
        self.updateTitle();
    }

    isPropertyChange && self.onPropertyChange();
    if (self.panel) {
        self.panel.data("infUndoRedo", false);
    }
};

infChart.Indicator.prototype.onCheckItemChange = function (param, value, isPropertyChange) {
    var self = this;
    self.params[param] = value;
    var indData = self.getData();
    var baseData = indData.base && indData.base.ohlcv && indData.base;
    if (baseData && baseData.ohlcv && baseData.data) {
        self.calculate(baseData.ohlcv, baseData.data, true, undefined, indData);
    }
    self.updateTitle();
    isPropertyChange && self.onPropertyChange();
    if (self.panel) {
        self.panel.data("infUndoRedo", false);
    }
};

/**
 * Get executed when series on/off is changed by settings panel
 * @param {string} seriesId param name
 * @param {string} isOn selected value
 * @param {boolean} isPropertyChange property change
 */
infChart.Indicator.prototype.onOnOffChange = function (seriesId, isOn, isPropertyChange) {
    var self = this;
    var status = false;
    infChart.util.forEach(self.series, function (i, s) {
        if (s.options.id == seriesId) {
            if (isOn) {
                s.hide();
            } else {
                s.show();
                status = true;
            }
        }
    });

    isPropertyChange && self.onPropertyChange();
    if (self.panel) {
        self.panel.data("infUndoRedo", false);
    }

    return status;
};

/**
 * Get executed when series color is changed by settings panel
 * @param {string} seriesId param name
 * @param {object} colorObj selected color
 * @param {boolean} isPropertyChange property change
 */
infChart.Indicator.prototype.onColorChange = function (seriesId, colorObj, isPropertyChange) {
    var self = this;
    var series = self.getHighchartsSeries(seriesId);
    if (series) {
        if (colorObj.color) {
            self.setColor(series, colorObj.hexColor, colorObj.color, undefined, isPropertyChange);
        } else {
            self.setColor(series, colorObj.hexColor, colorObj.upColor, colorObj.downColor, isPropertyChange);
        }
        isPropertyChange && self.onPropertyChange();
    }
    if (self.panel) {
        self.panel.data("infUndoRedo", false);
    }
};

/**
 * Get executed when series line width is changed by settings panel
 * @param {string} seriesId param name
 * @param {number} strokeWidth selected width
 * @param {boolean} isPropertyChange property change
 */
infChart.Indicator.prototype.onLineWidthChange = function (seriesId, strokeWidth, isPropertyChange) {
    var self = this;
    var series = self.getHighchartsSeries(seriesId);
    if (series) {
        self.setLineWidth(series, strokeWidth, true);
        isPropertyChange && self.onPropertyChange();
    }
    if (self.panel) {
        self.panel.data("infUndoRedo", false);
    }
};

/**
 * Get executed when series type  is changed by settings panel
 * @param {string} seriesId param name
 * @param {string} chartType selected chart type
 * @param {object} styleObj colors for the new type
 * @param {boolean} isPropertyChange property change
 */
infChart.Indicator.prototype.onChartTypeChange = function (seriesId, chartType, styleObj, isPropertyChange) {
    var self = this;
    var series = self.getHighchartsSeries(seriesId);

    if (series) {
        var iChart = infChart.manager.getChart(self.chartId),
            colorCfg = iChart.getSeriesOptionsOnChartTypeChange(series, chartType),
            tempConfig = $.extend({}, colorCfg, {
                type: chartType
            });

        if (series.options.infRecal) {

            series.update(tempConfig, false);
            var indData = self.getData(),
                baseData = indData.base && indData.base.ohlcv && indData.base;

            if (baseData && baseData.ohlcv && baseData.data) {
                self.calculate(baseData.ohlcv, baseData.data, self.isReady, seriesId, indData);
            }
        } else {
            series.update(tempConfig, self.isReady);
        }

        self.onColorChange(seriesId, styleObj, false);
        if (styleObj.lineWeight) {
            self.onLineWidthChange(seriesId, styleObj.lineWeight, false);
        }
    }
    if (self.panel) {
        self.panel.data("infUndoRedo", false);
    }
};

infChart.Indicator.prototype.getHighchartsSeries = function (seriesId) {
    var series = undefined;
    infChart.util.forEach(this.series, function (i, seriesTemp) {
        if (seriesTemp.options.id == seriesId) {
            series = seriesTemp;
        }
    });
    return series;
};

/**
 * whether the current action is done by a user interation or not
 * @returns {null|*|boolean}
 */
infChart.Indicator.prototype.isSettingsPropertyChange = function () {
    return this.panel && !this.panel.data("infUndoRedo");
};

//endregion

infChart.Indicator.prototype.onPropertyChange = function () {
    if (this.settingsLoaded) {
        var stockChart = infChart.manager.getChart(this.chartId);
        stockChart._onPropertyChange("indicators");

    }
};

infChart.Indicator.prototype.setColor = function (series, hexColor, upColor, downColor, isPropertyChange) {
    var type = series.type;
    var chart = infChart.manager.getChart(this.chartId);
    chart.setColor(series, hexColor, upColor, downColor, this.isReady, isPropertyChange);
    this.updateLegendColor();
    chart._onPropertyChange("indicators");
};

/**
 * update series line width
 * @param  width
 * @param  redraw
 */
infChart.Indicator.prototype.setLineWidth = function (series, width, redraw) {
    var chart = infChart.manager.getChart(this.chartId);
    chart.setLineWidth(series, width, redraw);
    chart._onPropertyChange("indicators");
};

infChart.Indicator.prototype.getConfig = function () {
    return {params: this.params, checkParams: this.checkParams};
};

infChart.Indicator.prototype.getData = function () {

    var chart = infChart.manager.getChart(this.chartId);
    return chart.getDataForIndicators(this);
};

infChart.Indicator.prototype.updateLegendColor = function () {
    var that = this;
    var chart = that.chart;
    var axisId = that.getAxisId(),
        axis = chart.get(axisId);
    infChart.util.forEach(this.series, function (i, series) {
        if(!infChart.util.isSeriesParallelToBaseAxis(axis) && that.isLegendEnabled(series)){
            if (!infChart.util.isSeriesInBaseAxis(axisId)) {
                if (chart.axisTitles && chart.axisTitles[axisId] && chart.axisTitles[axisId][series.options.id] && chart.axisTitles[axisId][series.options.id]["l"]) {
                    chart.axisTitles[axisId][series.options.id]["l"].attr({
                        fill: (series.options.type == "column") ? series.color : series.options.lineColor ? series.options.lineColor : series.color
                    });
                } else {
                    //todo : why??
                }
            } else {
                infChart.structureManager.indicator.setIndicatorLegendColor(chart, series);
            }
        }
    });
};

/**
 * Update Tooltip of a series which added into a separate panel
 * @param seriesId
 * @param x
 */
infChart.Indicator.prototype.updateToolTip = function (seriesId, x) {

    var axis = this.getAxisId();
    var chart = this.chart;
    var textBox;
    var series, ind = this;

    infChart.util.forEach(this.series, function (i, val) {
        if (val.options.id == seriesId) {
            series = val;
            if (ind.isLegendEnabled(series)) {
                textBox = chart.axisTitles[axis][seriesId]["t"];
            }
            return;
        }
    });

    if (series && textBox) {
        var element = $(textBox.element).find('tspan')[1];
        $(element).html(": " + Highcharts.numberFormat(series.yData[x], 2));
    }
};

infChart.Indicator.prototype.isLegendEnabled = function (series) {
    return (series.options.showInLegend == undefined || series.options.showInLegend || !series.options.hideLegend);
};

infChart.Indicator.prototype.getLegendValue = function (x) {
    if (this.series[0].yData[x]) {
        return this.series[0].yData[x][0];
    } else {
        return '';
    }
};

infChart.Indicator.prototype.getProperties = function () {
    var series = [], fillColor;
    infChart.util.forEach(this.series, function (i, s) {

        var chartType = s.type;

        if (chartType == 'area') {
            var areaUpColor = (s.options.fillColor && s.options.fillColor.stops && s.options.fillColor.stops.length > 0) ? s.options.fillColor.stops[0][1] : s.color;
            var areaDownColor = (s.options.fillColor && s.options.fillColor.stops && s.options.fillColor.stops.length > 1) ? s.options.fillColor.stops[1][1] : s.color;
            fillColor = {
                linearGradient: {x1: 0, y1: 0, x2: 0, y2: 1},
                stops: [[0, areaUpColor], [1, areaDownColor]]
            };
        }

        series.xPush({
            infIndSubType: s.options.infIndSubType,
            type: chartType,
            color: s.color,
            fillColor: fillColor,
            lineWidth: s.options.lineWidth,
            negativeColor: s.options.negativeColor,
            visible: s.visible
        });
    });

    return {
        type: this.type,
        params: this.params,
        series: series,
        heightPercent: this.heightPercent,
        symbol: this.symbol
    }
};

infChart.Indicator.prototype.setProperties = function (config, redraw) {

    this.params = (config.params) ? config.params : this.params;
    this.heightPercent = config.heightPercent;
    if(config.symbol){
        this.symbol = config.symbol;
    }

    var that = this;
    var seriesToDisplay = [];

    if (config.series) {
        infChart.util.forEach(config.series, function (i, s) {

            var series = that.getSeriesBySubType(s.infIndSubType);
            if (series) {
                var chartType = s.type;

                series.update({
                    type: chartType,
                    color: s.color,
                    lineColor: s.color,
                    fillColor: s.fillColor,
                    lineWidth: s.lineWidth,
                    negativeColor: s.negativeColor,
                    visible: s.visible
                }, redraw);

                seriesToDisplay.xPush(s.infIndSubType);
            }
        });

        if (this.series.length > seriesToDisplay.length) {
            var seriesIdsToRemove = [];
            infChart.util.forEach(this.series, function (i, s) {
                if (s && seriesToDisplay.indexOf(s.options.infIndSubType) < 0) {
                    /* that.removeSeries(s.options.id);*/
                    seriesIdsToRemove.xPush(s.options.id);
                }
            });
            infChart.util.forEach(seriesIdsToRemove, function (i, seriesId) {
                that.removeSeries(seriesId);
            });
        }
    }
};

infChart.Indicator.prototype.getSeriesBySubType = function (subType) {
    var retSeries;
    infChart.util.forEach(this.series, function (i, series) {
        if (series.options.infIndSubType == subType) {
            retSeries = series;
            return;
        }
    });
    return retSeries;
};

infChart.Indicator.prototype.getBand = function (data, type, upper, lower) {
    var retVal = [], k;
    if (type != 'arearange') {
        for (k = 0; k < data.length; k++) {
            retVal[k] = [data[k][0], +upper];
        }
    }
    else {
        for (k = 0; k < data.length; k++) {
            retVal[k] = [data[k][0], +upper, +lower];
        }
    }
    return retVal;
};

/**
 * reset series options when main series chart type changes
 * @param {string} type main series type
 * @returns {boolean}
 */
infChart.Indicator.prototype.resetSeriesOptions = function (type) {
};

infChart.Indicator.prototype.getRequiredDataTypes = function () {
    return ['base'];
};


//region =================================indicator calculations==============================================

infChart.Indicator.prototype.isNumber = function (val) {
    return val != null && !isNaN(val);
};

infChart.Indicator.prototype.movul = function (hts, lts, cts, ots, ul) {
    switch (ul) {
        case infChart.indicatorDefaults.ULCLOSEPRICE:
            return cts;
        case infChart.indicatorDefaults.ULHIGHPRICE:
            return hts;
        case infChart.indicatorDefaults.ULLOWPRICE:
            return lts;
        case infChart.indicatorDefaults.ULOPENPRICE:
            return ots;
        default :
            return this.tp(hts, lts, cts);
    }
};

infChart.Indicator.prototype.tp = function (hts, lts, cts) {
    var tp, k;
    tp = new Array(cts.length);
    for (k = 0; k < tp.length; k++)
        tp[k] = (hts[k] + lts[k] + cts[k]) / 3;
    return tp;
};

infChart.Indicator.prototype.average = function (ots, hts, lts, cts) {
    var tp, k;
    tp = new Array(cts.length);
    for (k = 0; k < tp.length; k++)
        tp[k] = (hts[k] + lts[k] + cts[k] + ots[k]) / 4;
    return tp;
};

infChart.Indicator.prototype.merge = function (d1, s1, s2, isSameDataSize) {
    var retval = [],
        i,
        count = 0;
    if (s2) {
        for (i = 0; i < d1.length; i++) {
            if (s1[i] != undefined && s2[i] != undefined) {
                retval[count] = [d1[i][0], s1[i], s2[i]];
                count++;
            } else if (isSameDataSize) {
                retval[count] = [d1[i][0], null, null];
                count++;
            }
        }
    } else {
        for (i = 0; i < d1.length; i++) {
            if (s1[i] != undefined) {
                retval[count] = [d1[i][0], s1[i]];
                count++;
            } else if (isSameDataSize) {
                retval[count] = [d1[i][0], null];
                count++;
            }
        }
    }
    return retval;
};

/**
 * TODO :: to be renamed as movmean once all the indicators are converted to correct movmean calculations
 * @param ts
 * @param ma
 * @param m
 * @returns {Array|*}
 */
infChart.Indicator.prototype.movmeanNew = function (ts, ma, m) {
    var retval, k, sum, oneom, onemoneom, twoompone, onemtwoompone, k2, weightedVal, totalPeriod, mtemp, tsBeginIdx;

    m = Math.min(m, ts.length);
    retval = new Array(ts.length);

    //retval[0] = ts[0];
    if (ma == infChart.indicatorDefaults.ARITHMETICMOVINGAVERAGE) {
        sum = 0;
        mtemp = retval.length;
        for (k = 0; k <= mtemp; k++) {
            if (ts[k] != null && !isNaN(ts[k])) {
                if (isNaN(tsBeginIdx)) {
                    mtemp = k + m - 1;
                    tsBeginIdx = k;
                }
                sum += ts[k];
            }

            if (k == mtemp)
                retval[k] = sum / (m + 0.0);
        }
        oneom = 1.0 / m;
        for (k = mtemp + 1; k < retval.length; k++)
            retval[k] = retval[k - 1] + (ts[k] - ts[k - m]) * oneom;
        return retval;
    }
    if (ma == infChart.indicatorDefaults.EXPONENTIALMOVINGAVERAGE) {
        sum = 0;
        mtemp = retval.length;
        for (k = 0; k <= mtemp; k++) {
            if (ts[k] != null && !isNaN(ts[k])) {
                if (isNaN(tsBeginIdx)) {
                    mtemp = k + m - 1;
                    tsBeginIdx = k;
                }
                sum += ts[k];
            }
            if (k == mtemp)
                retval[k] = sum / (m + 0.0);
        }
        twoompone = 2.0 / (m + 1.0);
        onemtwoompone = 1.0 - twoompone;
        for (k = mtemp + 1; k < retval.length; k++)
            retval[k] = retval[k - 1] * onemtwoompone + ts[k] * twoompone;
        return retval;
    }
    if (ma == infChart.indicatorDefaults.WEIGHTEDMOVINGAVERAGE) {
        //retval[0] = ts[0];
        mtemp = retval.length;
        for (k = 0; k <= mtemp; k++) {
            if (ts[k] != null && !isNaN(ts[k])) {
                if (isNaN(tsBeginIdx)) {
                    mtemp = k + m - 1;
                    tsBeginIdx = k;
                }
            }
        }

        mtemp = Math.min(m, ts.length);
        for (k = tsBeginIdx + m - 1; k < retval.length; k++) {

            weightedVal = 0.0;
            totalPeriod = 0;
            for (k2 = 0; k2 < mtemp; k2++) {
                weightedVal += ts[k - k2] * (mtemp - k2);
                totalPeriod += (mtemp - k2);
            }
            retval[k] = weightedVal / totalPeriod;
        }
        return retval;
    }
    if (ma == infChart.indicatorDefaults.ROLLINGMOVINGAVERAGE) {
        // RMA = ((RMA(t-1) * (n-1)) + Xt) / n
        sum = 0;
        mtemp = retval.length;
        for (k = 0; k <= mtemp; k++) {
            if (ts[k] != null && !isNaN(ts[k])) {
                if (isNaN(tsBeginIdx)) {
                    mtemp = k + m - 1;
                    tsBeginIdx = k;
                }
                sum += ts[k];
            }
            if (k == mtemp)
                retval[k] = sum / (m + 0.0);
        }
        for (k = mtemp + 1; k < retval.length; k++) {
            retval[k] = (retval[k - 1] * (m - 1) + ts[k]) / m;
        }
        return retval;
    }

    for (k = 1; k < m; k++)
        retval[k] = retval[k - 1] + (ts[k] - retval[k - 1]) / (k + 1.0);
    oneom = 1.0 / m;
    onemoneom = 1.0 - oneom;
    for (k = m; k < retval.length; k++)
        retval[k] = retval[k - 1] * onemoneom + ts[k] * oneom;

    return retval;
};

infChart.Indicator.prototype.movmean = function (ts, ma, m) {
    var retval, k, sum, oneom, onemoneom, twoompone, onemtwoompone, k2, weightedVal, totalPeriod, mtemp;

    m = Math.min(m, ts.length);
    retval = new Array(ts.length);

    retval[0] = ts[0];
    if (ma == infChart.indicatorDefaults.ARITHMETICMOVINGAVERAGE) {
        sum = retval[0];
        for (k = 1; k < m; k++) {
            sum += ts[k];
            retval[k] = sum / (k + 1.0);
        }
        oneom = 1.0 / m;
        for (k = m; k < retval.length; k++)
            retval[k] = retval[k - 1] + (ts[k] - ts[k - m]) * oneom;
        return retval;
    }
    if (ma == infChart.indicatorDefaults.EXPONENTIALMOVINGAVERAGE) {
        for (k = 1; k < m; k++)
            retval[k] = retval[k - 1] + 2.0 * (ts[k] - retval[k - 1]) / (k + 2.0);
        twoompone = 2.0 / (m + 1.0);
        onemtwoompone = 1.0 - twoompone;
        for (k = m; k < retval.length; k++)
            retval[k] = retval[k - 1] * onemtwoompone + ts[k] * twoompone;
        return retval;
    }
    if (ma == infChart.indicatorDefaults.WEIGHTEDMOVINGAVERAGE) {
        retval[0] = ts[0];
        for (k = 1; k < retval.length; k++) {
            mtemp = Math.min(m, k);
            weightedVal = 0.0;
            totalPeriod = 0;
            for (k2 = 0; k2 < mtemp; k2++) {
                weightedVal += ts[k - k2] * (mtemp - k2);
                totalPeriod += (mtemp - k2);
            }
            retval[k] = weightedVal / totalPeriod;
        }
        return retval;
    }
    if (ma == infChart.indicatorDefaults.ROLLINGMOVINGAVERAGE) {
        // RMA = ((RMA(t-1) * (n-1)) + Xt) / n
        retval[0] = ts[0];
        for (k = 1; k < retval.length; k++) {
            retval[k] = (retval[k - 1] * (m - 1) + ts[k]) / m;
        }
        return retval;
    }

    for (k = 1; k < m; k++)
        retval[k] = retval[k - 1] + (ts[k] - retval[k - 1]) / (k + 1.0);
    oneom = 1.0 / m;
    onemoneom = 1.0 - oneom;
    for (k = m; k < retval.length; k++)
        retval[k] = retval[k - 1] * onemoneom + ts[k] * oneom;

    return retval;
};

infChart.Indicator.prototype.movdev = function (ts, md, m) {
    var movarmean, movdev, j, k, sum, oneom;
    m = (0 | Math.min(m, ts.length));
    movarmean = this.movmean(ts, infChart.indicatorDefaults.ARITHMETICMOVINGAVERAGE, m);
    movdev = new Array(ts.length);
    if (md == infChart.indicatorDefaults.MOVINGMEANDEVIATION) {
        oneom = 1.0 / m;
        movdev[0] = 0;
        for (k = 1; k < m; k++) {
            sum = 0;
            for (j = 0; j < k; j++)
                sum += Math.abs(movarmean[k] - ts[j]);
            movdev[k] = sum / (k + 1.0);
        }
        for (k = m; k < movdev.length; k++) {
            sum = 0;
            for (j = 0; j < m; j++)
                sum += Math.abs(movarmean[k] - ts[k - j]);
            movdev[k] = sum * oneom;
        }
        return movdev;
    }
    for (k = 0; k < movdev.length; k++) {
        movdev[k] = ts[k] * ts[k];
    }
    movdev = this.movmean(movdev, infChart.indicatorDefaults.ARITHMETICMOVINGAVERAGE, m);
    for (k = 0; k < movdev.length; k++) {
        movdev[k] = Math.sqrt(movdev[k] - movarmean[k] * movarmean[k]);
    }
    return movdev;
};

infChart.Indicator.prototype.arud = function (hts, lts, grn, nocp) {
    var arud, oneonocpmone, minpos, maxpos, k;
    oneonocpmone = 1.0 / (nocp - 1.0);
    arud = new Array(hts.length);
    if (nocp == 1) {
        for (k = 0; k < arud.length; k++)
            arud[k] = 1.0;
        return arud;
    }
    if (grn == 1) {
        maxpos = this.movmaxpos(hts, nocp);
        for (k = 0; k < arud.length; k++)
            arud[k] = 1.0 - (k - maxpos[k]) * oneonocpmone;
        return arud;
    }
    minpos = this.movminpos(lts, nocp);
    for (k = 0; k < arud.length; k++)
        arud[k] = 1.0 - (k - minpos[k]) * oneonocpmone;
    return arud;
};

infChart.Indicator.prototype.movminpos = function (ts, m) {
    var movminpos, j, k, minpos, min;
    m = Math.min(m, ts.length);
    movminpos = new Array(ts.length);
    if (m == 1) {
        for (k = 0; k < movminpos.length; k++)
            movminpos[k] = k;
        return movminpos;
    }
    min = ts[0];
    minpos = 0;
    movminpos[0] = minpos;
    for (k = 1; k < m; k++) {
        if (ts[k] <= min) {
            min = ts[k];
            minpos = k;
        }
        movminpos[k] = minpos;
    }
    for (k = m; k < movminpos.length; k++) {
        if (minpos == k - m) {
            min = ts[minpos + 1];
            minpos += 1;
            for (j = k - m + 2; j < k + 1; j++)
                if (ts[j] <= min) {
                    min = ts[j];
                    minpos = j;
                }
        }
        if (ts[k] <= min) {
            min = ts[k];
            minpos = k;
        }
        movminpos[k] = minpos;
    }
    return movminpos;
};

infChart.Indicator.prototype.movmaxpos = function (ts, m) {
    var movmaxpos, j, k, maxpos, max;
    m = Math.min(m, ts.length);
    movmaxpos = new Array(ts.length);
    if (m == 1) {
        for (k = 0; k < movmaxpos.length; k++)
            movmaxpos[k] = k;
        return movmaxpos;
    }
    max = ts[0];
    maxpos = 0;
    movmaxpos[0] = maxpos;
    for (k = 1; k < m; k++) {
        if (max <= ts[k]) {
            max = ts[k];
            maxpos = k;
        }
        movmaxpos[k] = maxpos;
    }
    for (k = m; k < movmaxpos.length; k++) {
        if (maxpos == k - m) {
            max = ts[maxpos + 1];
            maxpos += 1;
            for (j = k - m + 2; j < k + 1; j++)
                if (max <= ts[j]) {
                    max = ts[j];
                    maxpos = j;
                }
        }
        if (max <= ts[k]) {
            max = ts[k];
            maxpos = k;
        }
        movmaxpos[k] = maxpos;
    }
    return movmaxpos;
};

infChart.Indicator.prototype.movpos = function (ts, m) {
    var movmaxpos = new Array(ts.length), k, maxpos, max;
    if (ts.length < m)
        return;


    for (k = 0; k < ts.length - m; k++) {
        movmaxpos[k] = ts[k + m];
    }

    return movmaxpos;
};

/**
 * Directional Moment Index
 * @param hts
 * @param lts
 * @param cts
 * @param grn
 * @param ma
 * @param nocp
 * @returns {*}
 */
infChart.Indicator.prototype.dmi = function (hts, lts, cts, grn, ma, nocp) {
    var h, l, denom, atr, pdi, mdi, dmi, k;
    atr = this.movmean(this.tr(hts, lts, cts), infChart.indicatorDefaults.ARITHMETICMOVINGAVERAGE, nocp);
    pdi = new Array(cts.length);
    mdi = new Array(cts.length);
    dmi = new Array(cts.length);
    pdi[0] = 0;
    mdi[0] = 0;
    for (k = 1; k < pdi.length; k++) {
        h = hts[k] - hts[k - 1];
        l = lts[k - 1] - lts[k];
        if (0 < h && l < h) {
            pdi[k] = h;
            mdi[k] = 0;
        } else if (0 < l && h < l) {
            pdi[k] = 0;
            mdi[k] = l;
        } /*else if(0 < h && 0 < l){
         if (l < h) {
         pdi[k] = h;
         mdi[k] = 0;
         } else if (h < l) {
         pdi[k] = 0;
         mdi[k] = l;
         }
         }*/
        else {
            pdi[k] = 0;
            mdi[k] = 0;
        }
    }
    pdi = this.movmean(pdi, ma, nocp);
    for (k = 0; k < pdi.length; k++)
        if (atr[k] < infChart.indicatorConst._EPSDENOM_) {
            pdi[k] = 0.5;
        } else {
            pdi[k] = pdi[k] / atr[k];
        }
    if (grn == 1)
        return pdi;
    mdi = this.movmean(mdi, ma, nocp);
    for (k = 0; k < mdi.length; k++)
        if (atr[k] < infChart.indicatorConst._EPSDENOM_) {
            mdi[k] = 0.5;
        } else {
            mdi[k] = mdi[k] / atr[k];
        }
    if (grn == 2)
        return mdi;
    for (k = 0; k < dmi.length; k++) {
        denom = pdi[k] + mdi[k];
        if (denom < infChart.indicatorConst._EPSDENOM_) {
            dmi[k] = 1.0;
        } else {
            dmi[k] = Math.abs(pdi[k] - mdi[k]) / denom;
        }
    }
    return dmi;
};

/**
 * True Range
 * @param hts
 * @param lts
 * @param cts
 * @returns {Array|*}
 */
infChart.Indicator.prototype.tr = function (hts, lts, cts) {
    var tr, k;
    tr = new Array(cts.length);
    tr[0] = hts[0] - lts[0];
    for (k = 1; k < tr.length; k++)
        if (cts[k - 1] < lts[k])
            tr[k] = hts[k] - cts[k - 1];
        else if (hts[k] < cts[k - 1])
            tr[k] = cts[k - 1] - lts[k];
        else
            tr[k] = hts[k] - lts[k];
    return tr;
};

/**
 * True Range TODO :: to be removed once new logics implemented
 * @param hts
 * @param lts
 * @param cts
 * @returns {Array|*}
 */
infChart.Indicator.prototype.trNew = function (hts, lts, cts) {
    var tr, k;
    tr = new Array(cts.length);
    // tr[0] = hts[0] - lts[0];
    for (k = 1; k < tr.length; k++)
        tr[k] = Math.max(hts[k] - lts[k], Math.abs(hts[k] - cts[k - 1]), Math.abs(lts[k] - cts[k - 1]));
    return tr;
};

infChart.Indicator.prototype.bp = function (lts, cts) {
    var bp, k;
    bp = new Array(cts.length);
    bp[0] = 0;
    for (k = 1; k < bp.length; k++)
        bp[k] = cts[k] - Math.min(lts[k], cts[k - 1]);
    return bp;
};

infChart.Indicator.prototype.movmax = function (ts, m) {
    var maxpos, max, movmax, j, k;
    m = Math.min(m, ts.length);
    if (m == 1)
        return ts;
    movmax = new Array(ts.length);
    max = ts[0];
    maxpos = 0;
    movmax[0] = max;
    for (k = 1; k < m; k++) {
        if (max <= ts[k]) {
            max = ts[k];
            maxpos = k;
        }
        movmax[k] = max;
    }
    for (k = m; k < movmax.length; k++) {
        if (maxpos == k - m) {
            max = ts[maxpos + 1];
            maxpos += 1;
            for (j = k - m + 2; j < k + 1; j++)
                if (max <= ts[j]) {
                    max = ts[j];
                    maxpos = j;
                }
        }
        if (max <= ts[k]) {
            max = ts[k];
            maxpos = k;
        }
        movmax[k] = max;
    }
    return movmax;
};

infChart.Indicator.prototype.movmin = function (ts, m) {
    var minpos, min, movmin, j, k;
    m = Math.min(m, ts.length);
    if (m == 1)
        return ts;
    movmin = new Array(ts.length);
    min = ts[0];
    minpos = 0;
    movmin[0] = min;
    for (k = 1; k < m; k++) {
        if (ts[k] <= min) {
            min = ts[k];
            minpos = k;
        }
        movmin[k] = min;
    }
    for (k = m; k < movmin.length; k++) {
        if (minpos == k - m) {
            min = ts[minpos + 1];
            minpos += 1;
            for (j = k - m + 2; j < k + 1; j++)
                if (ts[j] <= min) {
                    min = ts[j];
                    minpos = j;
                }
        }
        if (ts[k] <= min) {
            min = ts[k];
            minpos = k;
        }
        movmin[k] = min;
    }
    return movmin;
};

infChart.Indicator.prototype.adl = function (ots, hts, lts, cts, vts, grn, coeff, ma, nocp) {
    var retval, denom, k;
    retval = new Array(cts.length);
    retval[0] = 0;
    if (coeff == infChart.indicatorDefaults.ADL_COEFF_WITH_OPEN_PRICES) {
        for (k = 1; k < retval.length; k++) {
            denom = hts[k] - lts[k];
            if (denom < infChart.indicatorConst._EPSDENOM_) {
                retval[k] = retval[k - 1];
            } else {
                retval[k] = retval[k - 1] + (cts[k] - ots[k]) * vts[k] / denom;
            }
        }
    } else {
        for (k = 1; k < retval.length; k++) {
            denom = hts[k] - lts[k];
            if (denom < infChart.indicatorConst._EPSDENOM_) {
                retval[k] = retval[k - 1];
            } else {
                retval[k] = retval[k - 1] + (2.0 * cts[k] - hts[k] - lts[k]) * vts[k] / denom;
            }
        }
    }
    if (grn == 1) {
        // console.log(retval);
        return retval;
    }
    return this.movmean(retval, ma, nocp);
};

infChart.Indicator.prototype.pk = function (hts, lts, cts, ots, grn, ul, ma, nocp1, nocp2) {
    var denom, mh, ml, pk, k;
    mh = this.movmax(hts, nocp1);
    ml = this.movmin(lts, nocp1);
    pk = this.movul(hts, lts, cts, ots, ul).slice(0);
    for (k = 0; k < pk.length; k++) {
        denom = mh[k] - ml[k];
        if (denom < infChart.indicatorConst._EPSDENOM_) {
            pk[k] = 0.5;
        } else {
            pk[k] = (pk[k] - ml[k]) / denom;
        }
    }
    if (grn == 1)
        return pk;
    return this.movmean(pk, ma, nocp2);
};

infChart.Indicator.prototype.lr = function (ts) {
    var lr, k;
    lr = new Array(ts.length);
    lr[0] = 0;
    for (k = 1; k < lr.length; k++)
        lr[k] = Math.log(ts[k] / ts[k - 1]);
    return lr;
};

infChart.Indicator.prototype.rsi = function (ts, ul, ma, nocp, n) {
    var mom2, au, ad, result, k;
    //ts = this.movul(hts, lts, cts, ots, ul);
    au = new Array(ts.length);
    ad = new Array(ts.length);
    result = new Array(ts.length);
    au[0] = 0;
    ad[0] = 0;
    for (k = 1; k < au.length; k++) {
        mom2 = ts[k] - ts[k - 1];
        if (0 < mom2) {
            au[k] = mom2;
            ad[k] = 0;
        } else if (0 == mom2) {
            au[k] = 0;
            ad[k] = 0;
        } else {
            au[k] = 0;
            ad[k] = -mom2;
        }
    }
    au = this.movmean(au, ma, nocp);
    ad = this.movmean(ad, ma, nocp);
    for (k = 0; k < result.length; k++)
        if (ad[k] < infChart.indicatorConst._EPSDENOM_) {
            result[k] = 1.0;
        } else {
            result[k] = 1.0 - 1.0 / (n + au[k] / ad[k]);
        }
    return result;
};

infChart.Indicator.prototype.movsum = function (ts, m, startfromM) {
    var retval = new Array(ts.length), k, iniSum = 0;
    if (!startfromM)
        retval[0] = ts[0];

    for (k = 1; k < m; k++) {
        if (ts[k])
            iniSum += ts[k];
        if (!startfromM)
            retval[k] = retval[k - 1] + ts[k];
    }

    retval[m - 1] = iniSum;
    for (k = m; k < retval.length; k++) {
        retval[k] = retval[k - 1] + (ts[k] - ts[k - m]);
    }
    return retval;
};

/**
 * Rate of change
 * @param hts
 * @param lts
 * @param cts
 * @param ots
 * @param ul
 * @param nocp
 * @returns {Array|*}
 */
infChart.Indicator.prototype.roc = function (hts, lts, cts, ots, ul, nocp) {
    var ts, nocpmone, roc, k;
    ts = this.movul(hts, lts, cts, ots, ul);
    nocpmone = (0 | Math.min(nocp - 1, ts.length));
    roc = new Array(ts.length);
    for (k = 0; k < nocpmone; k++)
        roc[k] = ts[k] / ts[0] - 1.0;
    for (k = nocpmone; k < roc.length; k++)
        roc[k] = ts[k] / ts[k - nocpmone] - 1.0;
    return roc;
};

infChart.Indicator.prototype.awesomeOsi = function (hts, lts, ma, nop1, nop2) {
    var k, retval1, retval2, ts;

    ts = new Array(hts.length);

    for (k = 0; k < ts.length; k++) {
        ts[k] = (hts[k] + lts[k]) / 2;
    }

    retval1 = this.movmean(ts, ma, nop1);
    retval2 = this.movmean(ts, ma, nop2);


    for (k = 0; k < retval1.length; k++) {
        retval1[k] = (retval1[k] - retval2[k]);
    }

    return retval1;
};

infChart.Indicator.prototype.percentageChange = function (data, clsIdx, startIdx) {

    startIdx = startIdx || 0;

    var firstPoint = data[startIdx] && data[startIdx][clsIdx],
        retval1 = []
        ;

    if (firstPoint) {
        retval1[startIdx] = 0;
    }
    for (var k = startIdx + 1, kLen = data.length; k < kLen; k++) {
        if (firstPoint && data[k - 1][clsIdx] != null && data[k][clsIdx] != null) {
            retval1[k] = (data[k][clsIdx] / firstPoint - 1) * 100;
        } else if (!firstPoint) {
            firstPoint = data[k] && data[k][clsIdx];
            retval1[k] = 0;
        }
    }
    return retval1;
};

//endregion=============================end of indicator calculation====================================================

//endregion ************************ end of Indicator Base**************************************************************

/**
 * get indicator tooltip values
 * @param point
 * @returns {* | tooltipData}
 */
infChart.Indicator.prototype.getTooltipValue = function (point) {
    var tooltipData;
    if (!point.series.hideToolTip) {
        var axis = this.getAxisId();
        var value = point.y;
        var chart = infChart.manager.getChart(this.chartId);
        if (infChart.util.isSeriesInBaseAxis(axis)) {
            value = chart.getYLabel(point.y, false, true, true);
        }

        var dp = (point.series.options.dp != undefined) ? point.series.options.dp : 3;

        tooltipData = {
            'raw': {'value': value, 'time': point.x},
            'formatted': {'value': chart.formatValue(value, dp), 'time': chart.getTooltipTime(point.x)},
            'label': this.getLabel(point.series.options.id, "indicatorShortDesc"),
            'color': this.getTooltipColor(point.series)
        };
    }
    return tooltipData;
};

infChart.Indicator.prototype.getTooltipColor = function (series) {
    return series.color;
};

infChart.Indicator.prototype.getTooltipValueByBaseRow = function (point, indRow, baseRowIdx) {
    var tooltipData;
    if (!point.series.hideToolTip) {
        var indData = point.series.options.data, i, iLen = indData.length, value;
        if (indRow && indRow.length > 1 && this.isNumber(indRow[1])) {
            var axis = this.getAxisId(),
                chart = infChart.manager.getChart(this.chartId);
            if (infChart.util.isSeriesInBaseAxis(axis)) {
                value = chart.getYLabel(indRow[1], false, true, true);
            } else {
                value = indRow[1];
            }

            var dp = (point.series.options.dp != undefined) ? point.series.options.dp : 3;

            tooltipData = {
                'raw': {'value': value, 'time': indRow[0]},
                'formatted': {'value': chart.formatValue(value, dp), 'time': chart.getTooltipTime(indRow[0])},
                'label': this.getLabel(point.series.options.id, "indicatorShortDesc"),
                'color': this.getTooltipColor(point.series)
            };
        }
    }
    return tooltipData;
    /*if(this.isNumber(baseRowIdx)){
     if(indData[baseRowIdx] && indData[baseRowIdx][0] == baseRow[0]) {
     indRow = indData[baseRowIdx];
     } else if(indData[baseRowIdx] && indData[baseRowIdx][0] < baseRow[0]){
     for(i=baseRowIdx+1; indData[i][0] <= baseRow[0] && i < iLen;i++){
     if(indData[i][0] == baseRow[0]){
     indRow = indData[i];
     break;
     }
     }
     } else {
     baseRowIdx = Math.min(baseRowIdx, indData.length);
     i=baseRowIdx-1;
     for(; i >=0 && indData[i][0] >= baseRow[0] ;i--){
     if(indData[i][0] == baseRow[0]){
     indRow = indData[i];
     break;
     }
     }
     }
     }*/
};

/**
 * calculate indicator series data
 * @param ohlc
 * @param data
 * @param redraw
 * @param seriesId
 * @param allData
 * @param extremes
 */
infChart.Indicator.prototype.calculate = function (ohlc, data, redraw, seriesId, allData, extremes, isTickUpdate) {

};

/**
 * get context menu options
 * @param {string} chartId - chart id
 * @param {object} series - series
 * @param {object} options - options
 */
infChart.Indicator.prototype.getContextMenuOptions = function (chartId, series, options) {

};

/**
 * hide indicator
 * @param {string} seriesId - series id
 * @param {boolean} isHideAll - whether to hide all series
 */
infChart.Indicator.prototype.hideIndicator = function (seriesId, isHideAll) {
    infChart.util.forEach(this.series, function (i, series) {
        if (isHideAll || series.options.id === seriesId) {
            series.hide();
        }
    });

    infChart.manager.getChart(this.chartId)._onPropertyChange("indicators");
};

/**
 * show indicator
 * @param {string} seriesId - series id
 * @param {boolean} isShowAll - whether to show all series
 */
infChart.Indicator.prototype.showIndicator = function (seriesId, isShowAll) {
    infChart.util.forEach(this.series, function (i, series) {
        if (isShowAll || series.options.id === seriesId) {
            series.show();
        }
    });

    infChart.manager.getChart(this.chartId)._onPropertyChange("indicators");
};