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
//region **************************************Volume******************************************

/***
 * Constructor for Volume
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
 infChart.VolumeIndicator = function (id, chartId, type, chartInstance) {

    infChart.Indicator.apply(this, arguments);

    if (chartInstance) {
        var upColor = infChart.util.getDefaultUpColor(), downColor = infChart.util.getDefaultDownColor(),
            chartOptions = chartInstance.options,
            plotOptions = chartOptions.plotOptions,
            typeOptions = plotOptions["volume"];

        this.axisId = "#VOLUME_" + id;
        this.addAxis({
            infType: "parallelToBase",
            id: this.axisId,
            startOnTick: false,
            endOnTick: false,
            infHeightPercent: 0.2,
            //maxPadding: 0.99,
            /*top:150,
             bottom:280,
             height:280-150,*/
            crosshair: false,
            softThreshold: false
        });

        this.series[0] = chartInstance.addSeries({
            id: id,
            name: "VOLUME",
            infIndType: "VOLUME",
            infIndSubType: "VOLUME",
            /* data: [],*/
            infType: "indicator",
            "type": "volume",
            upColor: upColor,
            color: downColor,
            hasColumnNegative: true,
            lineWidth: typeOptions.lineWidth, // this is done bcz line width specified for the series type is overiddedn by series line width in the high charts code
            "yAxis": this.axisId,
            showInLegend: false,
            dp: 0,
            hideToolTip: true
        }, false);
        this.style[this.series[0].options.id] = ["line", "volume", "area", "dash"];
        this.icons["volume"] = "icon ico-chart-column";
    }
};

infChart.util.extend(infChart.Indicator, infChart.VolumeIndicator);

infChart.VolumeIndicator.prototype.calculate = function (ohlc, data, redraw) {
    if (data && data.length > 0) {
        var volume = ohlc.v,
            open = ohlc.o,
            close = ohlc.c;

        var chart = this.chart;

        var v = this.getSeries(volume, open, close, data, ohlc);
        //var _v = this.mergeObject(data, v);

        chart.get(this.id).setData(v, redraw, false, false);
    }
};

infChart.VolumeIndicator.prototype.getSeries = function (vts, ots, cts, data, ohlc) {

    var k, retval = new Array(vts.length);

    if (data.length && data.length == vts.length) {
        for (k = 0; k < vts.length; k++) {
            //https://xinfiit.atlassian.net/browse/CCA-2763
            if (cts[k] === ots[k] && cts[k] === ohlc.h[k] && cts[k] === ohlc.l[k] && k > 0) {
                ots[k] = cts[k - 1];
            }
            retval[k] = [data[k][0], vts[k], ots[k], cts[k]];
        }
    } else {
        console.debug("Volume getSeries :: data inconsistency");
    }
    return retval;
    //return vts.slice(0)
};

infChart.VolumeIndicator.prototype.getLegendValue = function (x) {

    var decimalPoint = '.', sep = infChart.util.getThousandSeparator();
    return Highcharts.numberFormat(this.series[0].yData[x][0], 0);
};

infChart.VolumeIndicator.prototype._isAxisParallelToBase = function () {
    return true;
};

//endregion **************************************Volume Indicator******************************************
/***
 * Constructor for Volume
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
 infChart.VolumeInPanelIndicator = function (id, chartId, type, chartInstance) {

    infChart.Indicator.apply(this, arguments);

    var upColor = infChart.util.getDefaultUpColor(), downColor = infChart.util.getDefaultDownColor(),
        chartOptions = chartInstance.options,
        plotOptions = chartOptions.plotOptions,
        typeOptions = plotOptions["volume"],
        toolbarConfig = infChart.manager.getChart(chartId).settings.toolbar.config,
        hideClose = toolbarConfig && toolbarConfig.volume && toolbarConfig.volume.type && toolbarConfig.volume.type === "VOLUME_PNL";

    this.axisId = "#VOLUME_PNL_" + id;
    this.addAxis({
        id: this.axisId,
        startOnTick: false,
        endOnTick: false
    });

    this.series[0] = chartInstance.addSeries({
        id: id,
        name: "VOLUME",
        infIndType: "VOLUME_PNL",
        infIndSubType: "VOLUME_PNL",
        /* data: [],*/
        infType: "indicator",
        "type": "volume",
        upColor: upColor,
        color: downColor,
        hasColumnNegative: true,
        lineWidth: typeOptions.lineWidth,
        "yAxis": this.axisId,
        showInLegend: false,
        dp: 0,
        //hideToolTip: true,
        className: "volume_panel",
        hideClose: hideClose
    }, false);
    this.style[this.series[0].options.id] = ["line", "volume", "area", "dash"];
    this.icons["volume"] = "icon ico-chart-column";
};

infChart.util.extend(infChart.VolumeIndicator, infChart.VolumeInPanelIndicator);

infChart.VolumeInPanelIndicator.prototype._isAxisParallelToBase = function () {
    return false;
};
//region **************************************Bollinger Band Indicator******************************************

/***
 * constructor for Bolinger Band indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
 infChart.BolingerBandIndicator = function (id, chartId, type, chartInstance) {

    infChart.Indicator.apply(this, arguments);

    this.params.period = 20;
    this.params.deviation1 = 2;
    this.params.deviation2 = -2;
    this.params.base = infChart.indicatorDefaults.ULCLOSEPRICE;
    this.titleParams = ["period", "deviation1", "deviation2"];

    var theme = {
        color: "#BBBBBB",
        lineColor: "#BBBBBB",
        areaFillOpacity: 0.3,
        lineFillOpacity: 0.5
    };

    if (Highcharts.theme && Highcharts.theme.indicator && Highcharts.theme.indicator.BB) {
        theme = infChart.util.merge(theme, Highcharts.theme.indicator.BB);
    }

    this.series[0] = chartInstance.addSeries({
        id: id,
        name: "BB",
        infIndType: "BB",
        infIndSubType: "BB",
        type: "arearange",
        /*data: [],*/
        color: theme.color,
        lineColor: theme.lineColor,
        infType: "indicator",
        yAxis: "#0",
        zIndex: 3,
        fillOpacity: theme.areaFillOpacity,
        hideToolTip: true,
        showInNavigator: false,
        enableMouseTracking: true,
        states: {
            hover: {
                enabled: false
            }
        }
    }, false);

    this.series[1] = chartInstance.addSeries({
        id: id + '_BBU',
        infIndType: "BB",
        infIndSubType: "BBU",
        name: "Upper",
        type: "line",
        /*data: [],*/
        color: theme.color,
        lineColor: theme.lineColor,
        infType: "indicator",
        yAxis: "#0",
        zIndex: 3,
        fillOpacity: theme.lineFillOpacity,
        hideLegend: true,
        showInLegend: false,
        showInNavigator: false,
        enableMouseTracking: true,
        states: {
            hover: {
                enabled: false
            }
        }
    }, false);

    this.series[2] = chartInstance.addSeries({
        id: id + '_BBM',
        infIndType: "BB",
        infIndSubType: "BBM",
        name: "Mid",
        type: "line",
        /*data: [],*/
        color: theme.color,
        lineColor: theme.lineColor,
        infType: "indicator",
        yAxis: "#0",
        zIndex: 3,
        fillOpacity: theme.lineFillOpacity,
        hideLegend: true,
        showInLegend: false,
        showInNavigator: false,
        enableMouseTracking: true,
        states: {
            hover: {
                enabled: false
            }
        }
    }, false);

    this.series[3] = chartInstance.addSeries({
        id: id + '_BBL',
        infIndType: "BB",
        infIndSubType: "BBL",
        name: "Lower",
        type: "line",
        /*data: [],*/
        color: theme.color,
        lineColor: theme.lineColor,
        infType: "indicator",
        yAxis: "#0",
        zIndex: 3,
        fillOpacity: theme.lineFillOpacity,
        hideLegend: true,
        showInLegend: false,
        showInNavigator: false,
        enableMouseTracking: true,
        states: {
            hover: {
                enabled: false
            }
        }
    }, true);

    this.style[this.series[0].options.id] = ["arearange"];
};

infChart.util.extend(infChart.Indicator, infChart.BolingerBandIndicator);

infChart.BolingerBandIndicator.prototype.calculate = function (ohlc, data, redraw) {
    var high = ohlc.h,
        low = ohlc.l,
        close = ohlc.c,
        open = ohlc.o;

    if (data && data.length > 0) {
        var that = this;
        var bbh = this.getSeries(high, low, close, open, this.params.base, infChart.indicatorDefaults.ARITHMETICMOVINGAVERAGE,
            infChart.indicatorDefaults.EXPONENTIALMOVINGAVERAGE, this.params.period, this.params.deviation1);
        var bbm = this.getSeries(high, low, close, open, this.params.base, infChart.indicatorDefaults.ARITHMETICMOVINGAVERAGE,
            infChart.indicatorDefaults.EXPONENTIALMOVINGAVERAGE, this.params.period, 0);
        var bbl = this.getSeries(high, low, close, open, this.params.base, infChart.indicatorDefaults.ARITHMETICMOVINGAVERAGE,
            infChart.indicatorDefaults.EXPONENTIALMOVINGAVERAGE, this.params.period, this.params.deviation2);
        var _bb = this.merge(data, bbl, bbh);

        var _bbm = this.merge(data, bbm);
        var _bbh = this.merge(data, bbh);
        var _bbl = this.merge(data, bbl);


        infChart.util.forEach(this.series, function (i, series) {
            switch (series.options.infIndSubType) {
                case 'BB' :
                    series.setData(_bb, false, false, false);
                    break;
                case 'BBM' :
                    series.setData(_bbm, false, false, false);
                    break;
                case 'BBU' :
                    series.setData(_bbh, false, false, false);
                    break;
                case 'BBL' :
                    series.setData(_bbl, false, false, false);
                    break;
                default :
                    break;
            }

        });

        if (redraw) {
            var chart = this.chart;
            chart.redraw();
        }
    }

};

infChart.BolingerBandIndicator.prototype.getSeries = function (hts, lts, cts, ots, ul, ma, md, nocp, delta) {
    var ts, bb, dev, k;
    ts = this.movul(hts, lts, cts, ots, ul);
    bb = this.movmean(ts, ma, nocp);
    if (delta == 0)
        return bb;
    dev = this.movdev(ts, md, nocp);
    for (k = 0; k < bb.length; k++)
        bb[k] = bb[k] + delta * dev[k];
    return bb;
};

infChart.BolingerBandIndicator.prototype.getContextMenuOptions = function (chartId, series, options) {
    return {
        "removeIndicator": {
            icon : options.removeIndicator.icon,
            displayText :options.removeIndicator.displayText,
            action : function () {
                let indicator = infChart.indicatorMgr.getIndicatorBySeriesId(chartId, series.options.id);
                infChart.manager.removeSeries(series.chart.renderTo.id, indicator.id, series.options.infType);
            }
        }
    }
};

//endregion **************************************Bollinger Band Indicator******************************************

//region ************************************** Benchmark Chart Indicator ******************************************

/**
 * Constructor for Benchmark Chart Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
infChart.BenchmarkChartIndicator = function (id, chartId, type, chartInstance) {

    infChart.Indicator.apply(this, arguments);

    this.axisId = "#BC_" + id;
    this.blockUpdateForMainSymbol = true;
    this.includeSymbol = true;

    var colors = infChart.util.getSeriesColors();
    this.symbol = infChart.manager.getChart(this.chartId).symbol;

    this.addAxis({
        id: this.axisId,
        startOnTick: false,
        endOnTick: false
    });

    this.series[0] = chartInstance.addSeries({
        id: id,
        name: "BC",
        infIndType: "BC",
        infIndSubType: "BC",
        infType: "indicator",
        type: "line",
        yAxis: this.axisId,
        showInLegend: false,
        showSymbolSearch: true,
        color: colors[0],
        lineColor: colors[0]
    }, true);

    this.style[this.series[0].options.id] = ["line", "candlestick", "area", "column"];
};

infChart.util.extend(infChart.Indicator, infChart.BenchmarkChartIndicator);

infChart.BenchmarkChartIndicator.prototype.getLoader = function(){
    return  '<div rel="' + this.id + '" class="c-loading"><div class="c-loading__icon"></div></div>';
};

infChart.BenchmarkChartIndicator.prototype.showHideLoader = function (isShowLoader){
    chartInstance = infChart.manager.getChart(this.chartId);
    if (isShowLoader) {
        var loadingHTML = this.getLoader();

        let indicatorContainerHeight = this.series[0].yAxis.userOptions.height;
        let mainChartHeight= this.series[0].yAxis.top;
        
        $(chartInstance.getContainer()).mask(loadingHTML);
        let loadingComponent = $("div[rel=" + this.id + "]");
        let loaderHeight = $(loadingComponent[0]).height();
        let y = mainChartHeight + ((indicatorContainerHeight + loaderHeight)/2) ;
        
        $(loadingComponent[0]).parent().parent().css({top: y})
    } else {
        $(chartInstance.getContainer()).unmask();
    }
};

infChart.BenchmarkChartIndicator.prototype.calculate = function (ohlc, data, redraw) {
    this.showHideLoader(false);
    data = infChart.indicatorMgr.filterIndicatorData(data, this.chartId);
    if (data && data.length > 0) {
        this.series[0].setData(data, true);
    }
};

infChart.BenchmarkChartIndicator.prototype.loadIndicatorHistoryData = function (selectedSymbol, isPropertyChange){
    this.showHideLoader(true);
    let self = this; 
    self.series[0].setData([], true);
    let stockChart = infChart.manager.getChart(self.chartId);
    let properties = stockChart.getProperties();
    let yAxis = this.series[0].yAxis;

    let symProperties = {
        symbol: selectedSymbol,
        interval: properties.interval
    };
    self.symbol = selectedSymbol;
    
    let callback = function (data, properties) {
        self.calculate(undefined, data.data, true);
        self.setTitle(this.getAxisId(), yAxis.left, yAxis.top - 6, 20, true);
        infChart.manager.getChart(this.chartId)._onPropertyChange("indicators");
    }
    stockChart.dataManager.readHistoryData(symProperties, callback, self);

};

infChart.BenchmarkChartIndicator.prototype.getIndicatorTitle = function () {
    let self = this; 
    let symbol = self.symbol;
    let stockChart = infChart.manager.getChart(self.chartId);
    let symbolName = stockChart._getSymbolDisplayName(symbol);

    return symbolName;
};

//endregion ************************************** Benchmark Chart Indicator ******************************************



//region **************************************Bollinger Band Width (BBW)Indicator******************************************

/***
 * constructor for Bollinger Band Width (BBW) Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
 infChart.BollingerBandWidthIndicator = function (id, chartId, type, chartInstance) {

    infChart.Indicator.apply(this, arguments);

    this.params.period = 20;
    this.params.deviation1 = 2;
    this.params.deviation2 = -2;
    this.params.base = infChart.indicatorDefaults.ULCLOSEPRICE;
    this.titleParams = ["period", "deviation1", "deviation2"];

    this.axisId = "#BBW_" + id;

    this.addAxis({
        id: this.axisId,
        startOnTick: false,
        endOnTick: false
    });

    var colors = infChart.util.getSeriesColors();

    this.series[0] = chartInstance.addSeries({
        id: id,
        name: "BBW",
        infIndType: "BBW",
        infIndSubType: "BBW",
        /*data: [],*/
        infType: "indicator",
        yAxis: this.axisId,
        showInLegend: false,
        color: colors[0],
        lineColor: colors[0]
    }, true);


};

infChart.util.extend(infChart.Indicator, infChart.BollingerBandWidthIndicator);

infChart.BollingerBandWidthIndicator.prototype.calculate = function (ohlc, data, redraw) {
    var high = ohlc.h,
        low = ohlc.l,
        close = ohlc.c;
    if (data && data.length > 0) {
        var chart = this.chart;
        var bbw = this.getSeries(high, low, close, open, this.params.base, infChart.indicatorDefaults.ARITHMETICMOVINGAVERAGE,
            infChart.indicatorDefaults.EXPONENTIALMOVINGAVERAGE, this.params.period, this.params.deviation1, this.params.deviation2);
        var _bbw = this.merge(data, bbw);
        chart.get(this.id).setData(_bbw, redraw, false, false);
    }
};

infChart.BollingerBandWidthIndicator.prototype.getSeries = function (hts, lts, cts, ots, ul, ma, md, nocp, delta1, delta2) {
    var ts, bb, dev, k, ubb, lbb;
    ts = this.movul(hts, lts, cts, ots, ul);
    bb = this.movmean(ts, ma, nocp);
    var bbw = new Array(bb.length);

    dev = this.movdev(ts, md, nocp);
    for (k = 0; k < bb.length; k++) {
        ubb = bb[k] + delta1 * dev[k];
        lbb = bb[k] + delta2 * dev[k];
        bbw[k] = ((ubb - lbb) / bb[k]) * 100;
    }
    return bbw
};


//endregion **************************************Bollinger Band Width(BBW) Indicator******************************************

//region **************************************Commodity Channel Index Indicator******************************************

/***
 * Cunstructor for Commodity Channel Index Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
 infChart.CommodityChannelIndexIndicator = function (id, chartId, type, chartInstance) {

    infChart.Indicator.apply(this, arguments);

    this.params.period = 20;
    this.params.upperLevel = 100;
    this.params.lowerLevel = -100;
    this.titleParams = ["period", "upperLevel", "lowerLevel"];

    this.axisId = "#CCI_" + id;

    this.addAxis({
        id: this.axisId,

        /*"plotLines": [{
         "id": this.axisId + "upperLevel",
         "value": this.params.upperLevel,
         "color": "green",
         "dashStyle": "shortdash",
         "width": 1,
         "zIndex": 3
         }, {
         "id": this.axisId + "lowerLevel",
         "value": this.params.lowerLevel,
         "color": "red",
         "dashStyle": "shortdash",
         "width": 1,
         "zIndex": 3
         }],*/
        startOnTick: false,
        endOnTick: false
    });

    var colors = infChart.util.getSeriesColors();

    this.series[0] = chartInstance.addSeries({
        id: id,
        name: "CCI",
        infIndType: "CCI",
        infIndSubType: "CCI",
        /*data: [],*/
        infType: "indicator",
        yAxis: this.axisId,
        showInLegend: false,
        color: colors[0],
        lineColor: colors[0]
    }, true);


};

infChart.util.extend(infChart.Indicator, infChart.CommodityChannelIndexIndicator);

infChart.CommodityChannelIndexIndicator.prototype.calculate = function (ohlc, data, redraw) {
    var high = ohlc.h,
        low = ohlc.l,
        close = ohlc.c;
    if (data && data.length > 0) {
        var chart = this.chart;

        var cci = this.getSeries(high, low, close, infChart.indicatorDefaults.ARITHMETICMOVINGAVERAGE, infChart.indicatorDefaults.MOVINGSTANDARDDEVIATION, this.params.period, 0.015);
        var _cci = this.merge(data, cci);
        chart.get(this.id).setData(_cci, redraw, false, false);
        var axis = chart.get(this.axisId);
        var upColor = infChart.util.getDefaultUpColor();
        var downColor = infChart.util.getDefaultDownColor();

        if (!this.hasPlotline) {
            axis.update({
                plotLines: [{
                    "id": this.axisId + "upperLevel",
                    "value": this.params.upperLevel,
                    "color": upColor,
                    "dashStyle": "shortdash",
                    "width": 1,
                    "zIndex": 3
                }, {
                    "id": this.axisId + "lowerLevel",
                    "value": this.params.lowerLevel,
                    "color": downColor,
                    "dashStyle": "shortdash",
                    "width": 1,
                    "zIndex": 3
                }]
            }, true);
            this.hasPlotline = true;
        }
        var upperPlot = axis.plotLinesAndBands[0];
        upperPlot.options.value = this.params.upperLevel;
        upperPlot.render();

        var lowerPlot = axis.plotLinesAndBands[1];
        lowerPlot.options.value = this.params.lowerLevel;
        lowerPlot.render();
    }
};

infChart.CommodityChannelIndexIndicator.prototype.getSeries = function (hts, lts, cts, ma, md, nocp, delta) {
    var denom, tp, mean, dev, cci, k;
    tp = this.tp(hts, lts, cts);
    mean = this.movmean(cts, ma, nocp);
    dev = this.movdev(cts, md, nocp);
    cci = new Array(tp.length);
    if (nocp == 1) {
        for (k = 0; k < cci.length; k++)
            cci[k] = 0;
        return cci;
    }
    for (k = 0; k < cci.length; k++) {
        denom = delta * dev[k];
        if (denom < infChart.indicatorConst._EPSDENOM_) {
            cci[k] = 0;
        } else {
            cci[k] = (tp[k] - mean[k]) / denom;
        }
    }
    return cci;
};

infChart.CommodityChannelIndexIndicator.prototype.getConfig = function () {
    return {params: {period: this.period, upperLevel: this.upperLevel, lowerLevel: this.lowerLevel}};
};

//endregion **************************************Commodity Channel Index Indicator******************************************

//region ************************************** MACD Indicator******************************************

/***
 * Cunstructor for MACD Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
 infChart.MACDIndicator = function (id, chartId, type, chartInstance) {

    infChart.Indicator.apply(this, arguments);

    this.params.mov1 = 12;
    this.params.mov2 = 26;
    this.params.trigger = 9;
    this.params.base = infChart.indicatorDefaults.ULCLOSEPRICE;
    this.titleParams = ["mov1", "mov2", "trigger"];

    this.axisId = "#MACD_" + id;

    var colors = infChart.util.getSeriesColors(), upColor = infChart.util.getDefaultUpColor(), downColor = infChart.util.getDefaultDownColor();

    this.addAxis({
        id: this.axisId,
        labels: {enabled: true},
        startOnTick: true,
        endOnTick: false
    });

    this.series[0] = chartInstance.addSeries({
        id: id,
        infIndType: "MACD",
        infIndSubType: "MACD",
        name: "MACD",
        /*data: [],*/
        infType: "indicator",
        yAxis: this.axisId,
        showInLegend: false,
        "color": colors[4],
        "lineColor": colors[4]

    }, false);

    this.series[1] = chartInstance.addSeries({
        "id": id + "_MACD2",
        infIndType: "MACD",
        infIndSubType: "MACD2",
        "yAxis": this.axisId,
        showInLegend: false,
        "name": "MACD2",
        /*data: [],*/
        infType: "indicator",
        "color": colors[1],
        "lineColor": colors[1]
    }, false);

    this.series[2] = chartInstance.addSeries({
        "id": id + "_MACD3",
        infIndType: "MACD",
        infIndSubType: "MACD3",
        "type": "column",
        "yAxis": this.axisId,
        showInLegend: false,
        "name": "MACD3",
        /*data: [],*/
        infType: "indicator",
        negativeColor: downColor,
        hasColumnNegative: true,
        hasAreaNegative: true,
        color: upColor,
        threshold: 0,
        fillColor: upColor
    }, true);

};

infChart.util.extend(infChart.Indicator, infChart.MACDIndicator);

infChart.MACDIndicator.prototype.calculate = function (ohlc, data, redraw) {
    var high = ohlc.h,
        low = ohlc.l,
        close = ohlc.c,
        open = ohlc.o;
    var that = this;

    if (data && data.length > 0) {
        infChart.util.forEach(this.series, function (i, series) {
            switch (series.options.infIndSubType) {
                case 'MACD':
                    var macd = that.getSeries(high, low, close, open, 1, that.params.base, infChart.indicatorDefaults.EXPONENTIALMOVINGAVERAGE, that.params.mov1, that.params.mov2, that.params.trigger);
                    var _macd = that.merge(data, macd);
                    series.setData(_macd, false, false, false);
                    break;
                case 'MACD2':
                    var macd2 = that.getSeries(high, low, close, open, 2, that.params.base, infChart.indicatorDefaults.EXPONENTIALMOVINGAVERAGE, that.params.mov1, that.params.mov2, that.params.trigger);
                    var _macd2 = that.merge(data, macd2);
                    series.setData(_macd2, false, false, false);
                    break;
                case 'MACD3':
                    var macd3 = that.getSeries(high, low, close, open, 3, that.params.base, infChart.indicatorDefaults.EXPONENTIALMOVINGAVERAGE, that.params.mov1, that.params.mov2, that.params.trigger);
                    var _macd3 = that.merge(data, macd3);
                    series.setData(_macd3, false, false, false);
                    break;
                default :
                    break;
            }
        });

        if (redraw) {
            var chart = this.chart;
            chart.redraw();
        }
    }
};

infChart.MACDIndicator.prototype.getSeries = function (hts, lts, cts, ots, grn, ul, ma, nocp1, nocp2, nocp3) {
    var ts, result1, result2, k;
    ts = this.movul(hts, lts, cts, ots, ul);
    result1 = this.movmeanNew(ts, ma, nocp1);
    result2 = this.movmeanNew(ts, ma, nocp2);

    var maxnocp = Math.max(nocp1, nocp2), resultN1 = new Array(ts.length), resultN3 = new Array(ts.length);

    for (k = maxnocp - 1; k < result1.length; k++) {
        if (this.isNumber(result1[k]) && this.isNumber(result2[k])) {
            resultN1[k] = result1[k] - result2[k];
        }
    }
    if (grn == 1)
        return resultN1;

    result2 = this.movmeanNew(resultN1, ma, nocp3);

    if (grn == 2)
        return result2;

    for (k = maxnocp + nocp3 - 2; k < resultN1.length; k++) {
        if (this.isNumber(resultN1[k]) && this.isNumber(result2[k])) {
            resultN3[k] = resultN1[k] - result2[k];
        }
    }
    return resultN3;
};

//endregion **************************************MACD Indicator******************************************

//region ************************************** MACD Forest Indicator******************************************

/***
 * Cunstructor for MACDF Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
 infChart.MACDFIndicator = function (id, chartId, type, chartInstance) {

    infChart.Indicator.apply(this, arguments);

    this.params.mov1 = 12;
    this.params.mov2 = 26;
    this.params.trigger = 9;
    this.params.base = infChart.indicatorDefaults.ULCLOSEPRICE;
    this.titleParams = ["mov1", "mov2", "trigger"];

    this.axisId = "#MACDF_" + id;

    var upColor = infChart.util.getDefaultUpColor(), downColor = infChart.util.getDefaultDownColor();

    this.addAxis({
        id: this.axisId,
        startOnTick: false,
        endOnTick: false
    });


    this.series[0] = chartInstance.addSeries({
        "id": id,
        infIndType: "MACDF",
        infIndSubType: "MACDF",
        "type": "column",
        "yAxis": this.axisId,
        showInLegend: false,
        "name": "MACDF",
        /*data: [],*/
        infType: "indicator",
        negativeColor: downColor,
        hasColumnNegative: true,
        hasAreaNegative: true,
        color: upColor,
        threshold: 0
    }, true);

};

infChart.util.extend(infChart.Indicator, infChart.MACDFIndicator);

infChart.MACDFIndicator.prototype.calculate = function (ohlc, data, redraw) {
    var high = ohlc.h,
        low = ohlc.l,
        close = ohlc.c,
        open = ohlc.o;
    var that = this;

    if (data && data.length > 0) {

        var macd3 = that.getSeries(high, low, close, open, 3, that.params.base, infChart.indicatorDefaults.EXPONENTIALMOVINGAVERAGE, that.params.mov1, that.params.mov2, that.params.trigger);
        var _macd3 = that.merge(data, macd3);
        this.series[0].setData(_macd3, false, false, false);

        if (redraw) {
            var chart = this.chart;
            chart.redraw();
        }
    }
};

infChart.MACDFIndicator.prototype.getSeries = function (hts, lts, cts, ots, grn, ul, ma, nocp1, nocp2, nocp3) {

    var ts, result1, result2, k;
    ts = this.movul(hts, lts, cts, ots, ul);
    result1 = this.movmeanNew(ts, ma, nocp1);
    result2 = this.movmeanNew(ts, ma, nocp2);

    var maxnocp = Math.max(nocp1, nocp2), resultN1 = new Array(ts.length), resultN3 = new Array(ts.length);

    for (k = maxnocp - 1; k < result1.length; k++) {
        if (this.isNumber(result1[k]) && this.isNumber(result2[k])) {
            resultN1[k] = result1[k] - result2[k];
        }
    }

    result2 = this.movmeanNew(resultN1, ma, nocp3);

    if (grn == 2)
        return result2;

    for (k = maxnocp + nocp3 - 2; k < resultN1.length; k++) {
        if (this.isNumber(resultN1[k]) && this.isNumber(result2[k])) {
            resultN3[k] = resultN1[k] - result2[k];
        }
    }

    return resultN3;
};

//endregion **************************************MACD Forest Indicator******************************************


//region ************************************** Accumulation Distribution Line (ADL) Indicator******************************************

/***
 * Cunstructor for Accumulation Distribution Line (ADL) Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
 infChart.AccumulationDistLineIndicator = function (id, chartId, type, chartInstance) {

    infChart.Indicator.apply(this, arguments);

    this.params.period = 38;
    this.axisId = "#ADL_" + id;

    var colors = infChart.util.getSeriesColors();

    this.addAxis({
        id: this.axisId,
        labels: {enabled: true},
        startOnTick: false,
        endOnTick: false
    });

    this.series[0] = chartInstance.addSeries({
        id: id,
        infIndType: "ADL",
        infIndSubType: "ADL",
        name: "ADL",
        /*data: [],*/
        infType: "indicator",
        color: colors[0],
        lineColor: colors[0],
        yAxis: this.axisId,
        showInLegend: false
    }, false);

    this.series[1] = chartInstance.addSeries({
        "id": id + "_ADL2",
        infIndType: "ADL",
        infIndSubType: "ADL2",
        "yAxis": this.axisId,
        showInLegend: false,
        "name": "ADL2",
        "color": colors[1],
        /* data: [],*/
        infType: "indicator",
        "lineColor": colors[1]
    }, true);


};

infChart.util.extend(infChart.Indicator, infChart.AccumulationDistLineIndicator);

infChart.AccumulationDistLineIndicator.prototype.calculate = function (ohlc, data, redraw) {
    var high = ohlc.h,
        low = ohlc.l,
        close = ohlc.c,
        volume = ohlc.v,
        open = ohlc.o;
    var that = this;

    if (data && data.length > 0) {
        infChart.util.forEach(this.series, function (i, series) {
            switch (series.options.infIndSubType) {
                case 'ADL':
                    var adl = that.getSeries(open, high, low, close, volume, 1, infChart.indicatorDefaults.ADL_COEFF_WITH_CLOSE_PRICES, infChart.indicatorDefaults.EXPONENTIALMOVINGAVERAGE,
                        0);
                    var _adl = that.merge(data, adl);
                    series.setData(_adl, false, false, false);
                    break;
                case 'ADL2':
                    var adl2 = that.getSeries(open, high, low, close, volume, 0, infChart.indicatorDefaults.ADL_COEFF_WITH_CLOSE_PRICES, infChart.indicatorDefaults.EXPONENTIALMOVINGAVERAGE,
                        that.params.period);
                    var _adl2 = that.merge(data, adl2);
                    series.setData(_adl2, false, false, false);
                    break;
                default :
                    break;
            }
        });

        if (redraw) {
            var chart = this.chart;
            chart.redraw();
        }
    }


};

infChart.AccumulationDistLineIndicator.prototype.getSeries = function (ots, hts, lts, cts, vts, grn, coeff, ma, nocp) {
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

//endregion **************************************Accumulation Distribution Line (ADL) Indicator******************************************

//region ************************************** Momentum (MOM) Indicator******************************************

/***
 * Cunstructor for Momentum (MOM) Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
 infChart.MomentumIndicator = function (id, chartId, type, chartInstance) {

    infChart.Indicator.apply(this, arguments);

    this.params.period = 28;
    this.axisId = "#MOM_" + id;

    var colors = infChart.util.getSeriesColors();

    this.addAxis({
        id: this.axisId,
        startOnTick: false,
        endOnTick: false
    });


    this.series[0] = chartInstance.addSeries({
        id: id,
        name: "MOM",
        infIndType: "MOM",
        infIndSubType: "MOM",
        /* data: [],*/
        infType: "indicator",
        yAxis: this.axisId,
        showInLegend: false,
        color: colors[1],
        lineColor: colors[1]
    }, false);

    this.series[1] = chartInstance.addSeries({
        "id": id + "_MOM2",
        infIndType: "MOM",
        infIndSubType: "MOM2",
        "yAxis": this.axisId,
        showInLegend: false,
        /* data: [],*/
        infType: "indicator",
        "name": "MOM2",
        "color": colors[2],
        "lineColor": colors[2]
    }, true);


};

infChart.util.extend(infChart.Indicator, infChart.MomentumIndicator);

infChart.MomentumIndicator.prototype.calculate = function (ohlc, data, redraw) {
    var high = ohlc.h,
        low = ohlc.l,
        close = ohlc.c,
        open = ohlc.o;
    var that = this;

    if (data && data.length > 0) {
        infChart.util.forEach(this.series, function (i, series) {
            switch (series.options.infIndSubType) {
                case 'MOM':
                    var mom = that.getSeries(high, low, close, open, infChart.indicatorDefaults.ULCLOSEPRICE, infChart.indicatorDefaults.EXPONENTIALMOVINGAVERAGE, that.params.period, 1);
                    var _mom = that.merge(data, mom);
                    series.setData(_mom, false, false, false);
                    break;
                case 'MOM2':
                    var mom2 = that.getSeries(high, low, close, open, infChart.indicatorDefaults.ULCLOSEPRICE, infChart.indicatorDefaults.EXPONENTIALMOVINGAVERAGE, that.params.period, 28);
                    var _mom2 = that.merge(data, mom2);
                    series.setData(_mom2, redraw, false, false);
                    break;
                default :
                    break;
            }
        });

        if (redraw) {
            var chart = this.chart;
            chart.redraw();
        }
    }
};

infChart.MomentumIndicator.prototype.getSeries = function (hts, lts, cts, ots, ul, ma, nocp1, nocp2) {
    var ts, mom, k, nocp1mone;
    ts = this.movul(hts, lts, cts, ots, ul);
    nocp1mone = (0 | Math.min(nocp1 - 1, ts.length));
    mom = new Array(cts.length);
    for (k = 0; k < nocp1mone; k++)
        mom[k] = ts[k] - ts[0];
    for (k = nocp1mone; k < mom.length; k++)
        mom[k] = ts[k] - ts[k - nocp1mone];
    if (nocp2 == 1)
        return mom;
    return this.movmean(mom, ma, nocp2);
};

//endregion **************************************Momentum (MOM) Indicator******************************************

//region **************************************  Moving Average Triple (MovTrip) Indicator******************************************

/***
 * Cunstructor for Moving Average Triple (MovTrip) Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
 infChart.MovTripIndicator = function (id, chartId, type, chartInstance) {

    infChart.Indicator.apply(this, arguments);

    this.params.period1 = 15;
    this.params.period2 = 30;
    this.params.period3 = 50;
    this.params.base = infChart.indicatorDefaults.ULCLOSEPRICE;
    this.titleParams = ["period1", "period2", "period3"];

    var color = infChart.util.getNextSeriesColor(chartId);

    this.series[0] = chartInstance.addSeries({
        id: id,
        name: "MovS1",
        infIndType: "MovTrip",
        infIndSubType: "MovS1",
        /* data: [],*/
        infType: "indicator",
        yAxis: "#0",
        color: color,
        lineColor: color
    }, false);

    color = infChart.util.getNextSeriesColor(chartId);
    this.series[1] = chartInstance.addSeries({
        id: id + "_MovS2",
        name: "MovS2",
        infIndType: "MovTrip",
        infIndSubType: "MovS2",
        /* data: [],*/
        infType: "indicator",
        yAxis: "#0",
        color: color,
        lineColor: color,
        hideLegend: true,
        showInLegend: false
    }, false);

    color = infChart.util.getNextSeriesColor(chartId);
    this.series[2] = chartInstance.addSeries({
        id: id + "_MovS3",
        name: "MovS3",
        infIndType: "MovTrip",
        infIndSubType: "MovS3",
        /* data: [],*/
        infType: "indicator",
        yAxis: "#0",
        color: color,
        lineColor: color,
        hideLegend: true,
        showInLegend: false
    }, true);


};

infChart.util.extend(infChart.Indicator, infChart.MovTripIndicator);

infChart.MovTripIndicator.prototype.calculate = function (ohlc, data, redraw) {
    var high = ohlc.h,
        low = ohlc.l,
        close = ohlc.c,
        open = ohlc.o;

    if (data && data.length > 0) {
        var chart = this.chart;
        var movtrip = this.getSeries(high, low, close, open, this.params.base, infChart.indicatorDefaults.ARITHMETICMOVINGAVERAGE, this.params.period1);
        var _movtrip = this.merge(data, movtrip);
        chart.get(this.id).setData(_movtrip, false, false, false);

        var movtrip2 = this.getSeries(high, low, close, open, this.params.base, infChart.indicatorDefaults.ARITHMETICMOVINGAVERAGE, this.params.period2);
        var _movtrip2 = this.merge(data, movtrip2);
        chart.get(this.id + "_MovS2").setData(_movtrip2, false, false, false);

        var movtrip3 = this.getSeries(high, low, close, open, this.params.base, infChart.indicatorDefaults.ARITHMETICMOVINGAVERAGE, this.params.period3);
        var _movtrip3 = this.merge(data, movtrip3);
        chart.get(this.id + "_MovS3").setData(_movtrip3, redraw, false, false);
    }
};

infChart.MovTripIndicator.prototype.getSeries = function (hts, lts, cts, ots, ul, ma, m) {
    var ts = this.movul(hts, lts, cts, ots, ul);
    var retval = this.movmean(ts, ma, m);

    return retval;
};

infChart.MovTripIndicator.prototype.getContextMenuOptions = function (chartId, series, options) {
    return {
        "removeIndicator": {
            icon : options.removeIndicator.icon,
            displayText :options.removeIndicator.displayText,
            action : function () {
                let indicator = infChart.indicatorMgr.getIndicatorBySeriesId(chartId, series.options.id);
                infChart.manager.removeSeries(series.chart.renderTo.id, indicator.id, series.options.infType);
            }
        }
    }
};

//endregion **************************************Moving Average Triple (MovTrip)Indicator******************************************

//region ************************************** Exponential Moving Average (EMA) Indicator******************************************
/***
 * Constructor for Exponential Moving Average (EMA) Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
 infChart.EMAIndicator = function (id, chartId, type, chartInstance) {

    infChart.Indicator.apply(this, arguments);

    this.params.period = 21;
    this.params.shift = 0;
    this.titleParams = ["period", "shift"];

    var color = infChart.util.getNextSeriesColor(chartId);

    this.series[0] = chartInstance.addSeries({
        id: id,
        name: "EMA",
        infIndType: "EMA",
        infIndSubType: "EMA",
        /* data: [],*/
        infType: "indicator",
        yAxis: "#0",
        color: color,
        lineColor: color
    }, true);


};

infChart.util.extend(infChart.Indicator, infChart.EMAIndicator);

infChart.EMAIndicator.prototype.calculate = function (ohlc, data, redraw) {
    var close = ohlc.c;
    if (data && data.length > 0) {
        var chart = this.chart;
        var ema = this.getSeries(close, infChart.indicatorDefaults.EXPONENTIALMOVINGAVERAGE, this.params.period, this.params.shift);
        var _ema = this.merge(data, ema);
        chart.get(this.id).setData(_ema, redraw, false, false);
    }
};

infChart.EMAIndicator.prototype.getSeries = function (ts, ma, m, shift) {

    var retval = this.movmeanNew(ts, ma, m);

    if (shift > 0) {
        var k = 0;
        for (k = m - 1; k < retval.length; k++) {
            retval[k] = +shift + retval[k];
        }
    }
    return retval;
};

//endregion **************************************Exponential Moving Average (EMA) Indicator******************************************

//region ************************************** Rolling Moving Average (MOVR) Indicator******************************************
/***
 * Constructor for Rolling Moving Average (MOVR) Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
 infChart.MOVRIndicator = function (id, chartId, type, chartInstance) {

    infChart.Indicator.apply(this, arguments);

    this.params.period = 21;
    this.params.shift = 0;
    this.params.base = infChart.indicatorDefaults.ULCLOSEPRICE;
    this.titleParams = ["period", "shift"];

    var color = infChart.util.getNextSeriesColor(chartId);

    this.series[0] = chartInstance.addSeries({
        id: id,
        name: "MOVR",
        infIndType: "MOVR",
        infIndSubType: "MOVR",
        /* data: [],*/
        infType: "indicator",
        yAxis: "#0",
        color: color,
        lineColor: color
    }, true);


};

infChart.util.extend(infChart.Indicator, infChart.MOVRIndicator);

infChart.MOVRIndicator.prototype.calculate = function (ohlc, data, redraw) {
    var high = ohlc.h,
        low = ohlc.l,
        close = ohlc.c,
        open = ohlc.o;
    if (data && data.length > 0) {
        var chart = this.chart;
        var ema = this.getSeries(high, low, close, open, this.params.base, infChart.indicatorDefaults.ROLLINGMOVINGAVERAGE, this.params.period, this.params.shift);
        var _ema = this.merge(data, ema);
        chart.get(this.id).setData(_ema, redraw, false, false);
    }
};

infChart.MOVRIndicator.prototype.getSeries = function (hts, lts, cts, ots, ul, ma, m, shift) {

    var retval = this.movmean(this.movul(hts, lts, cts, ots, ul), ma, m);

    if (shift > 0) {
        var k = 0;
        for (k = 1; k < retval.length; k++) {
            retval[k] = +shift + retval[k];
        }
    }
    return retval;
};

//endregion **************************************Rolling Moving Average (MOVR) Indicator******************************************


//region ************************************** Moving Average Triangular (TRIMA) Indicator******************************************
/***
 * Constructor for Moving Average Triangular (TRIMA) Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
 infChart.TRIMAIndicator = function (id, chartId, type, chartInstance) {

    infChart.Indicator.apply(this, arguments);

    this.params.period = 21;
    this.params.base = infChart.indicatorDefaults.ULCLOSEPRICE;
    this.titleParams = ["period", "shift"];

    var color = infChart.util.getNextSeriesColor(chartId);

    this.series[0] = chartInstance.addSeries({
        id: id,
        name: "TRIMA",
        infIndType: "TRIMA",
        infIndSubType: "TRIMA",
        /* data: [],*/
        infType: "indicator",
        yAxis: "#0",
        color: color,
        lineColor: color
    }, true);


};

infChart.util.extend(infChart.Indicator, infChart.TRIMAIndicator);

infChart.TRIMAIndicator.prototype.calculate = function (ohlc, data, redraw) {
    var high = ohlc.h,
        low = ohlc.l,
        close = ohlc.c,
        open = ohlc.o;
    if (data && data.length > 0) {
        var chart = this.chart;
        var ema = this.getSeries(high, low, close, open, this.params.base, infChart.indicatorDefaults.ARITHMETICMOVINGAVERAGE, this.params.period, this.params.shift);
        var _ema = this.merge(data, ema);
        chart.get(this.id).setData(_ema, redraw, false, false);
    }
};

infChart.TRIMAIndicator.prototype.getSeries = function (hts, lts, cts, ots, ul, ma, m, shift) {

    var retval = this.movmean(this.movul(hts, lts, cts, ots, ul), ma, m);

    retval = this.movmean(retval, infChart.indicatorDefaults.WEIGHTEDMOVINGAVERAGE, m);
    return retval;
};

//endregion **************************************Moving Average Triangular (TRIMA) Indicator******************************************

//region ************************************** GMMA (GMMA) Indicator******************************************
/***
 * Constructor for GMMA Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
 infChart.GMMAIndicator = function (id, chartId, type, chartInstance) {

    infChart.Indicator.apply(this, arguments);

    this.params.period1 = 3;
    this.params.period2 = 5;
    this.params.period3 = 8;
    this.params.period4 = 10;
    this.params.period5 = 12;
    this.params.period6 = 15;
    this.params.period7 = 30;
    this.params.period8 = 35;
    this.params.period9 = 40;
    this.params.period10 = 45;
    this.params.period11 = 50;
    this.params.period12 = 60;
    this.params.base = infChart.indicatorDefaults.ULCLOSEPRICE;
    this.titleParams = ["period1", "period2", "period3", "period4", "period5", "period6", "period7", "period8", "period9", "period10", "period11", "period12"];

    var colorGradients = infChart.util.getColorGradients();

    this.series[0] = chartInstance.addSeries({
        id: id,
        name: "GMMA",
        infIndType: "GMMA",
        infIndSubType: "GMMA",
        /* data: [],*/
        infType: "indicator",
        yAxis: "#0",
        color: colorGradients[0][0],
        lineColor: colorGradients[0][0]
    }, false);

    this.series[1] = chartInstance.addSeries({
        id: id + "_GMMA2",
        name: "GMMA2",
        infIndType: "GMMA",
        infIndSubType: "GMMA2",
        /* data: [],*/
        infType: "indicator",
        yAxis: "#0",
        color: colorGradients[0][1],
        lineColor: colorGradients[0][1],
        hideLegend: true,
        showInLegend: false
    }, false);

    this.series[2] = chartInstance.addSeries({
        id: id + "_GMMA3",
        name: "GMMA3",
        infIndType: "GMMA",
        infIndSubType: "GMMA3",
        /* data: [],*/
        infType: "indicator",
        yAxis: "#0",
        color: colorGradients[0][2],
        lineColor: colorGradients[0][2],
        hideLegend: true,
        showInLegend: false
    }, false);
    this.series[3] = chartInstance.addSeries({
        id: id + "_GMMA4",
        name: "GMMA4",
        infIndType: "GMMA",
        infIndSubType: "GMMA4",
        /* data: [],*/
        infType: "indicator",
        yAxis: "#0",
        color: colorGradients[0][3],
        lineColor: colorGradients[0][3],
        hideLegend: true,
        showInLegend: false
    }, false);
    this.series[4] = chartInstance.addSeries({
        id: id + "_GMMA5",
        name: "GMMA5",
        infIndType: "GMMA",
        infIndSubType: "GMMA5",
        /* data: [],*/
        infType: "indicator",
        yAxis: "#0",
        color: colorGradients[0][4],
        lineColor: colorGradients[0][4],
        hideLegend: true,
        showInLegend: false
    }, false);
    this.series[5] = chartInstance.addSeries({
        id: id + "_GMMA6",
        name: "GMMA6",
        infIndType: "GMMA",
        infIndSubType: "GMMA6",
        /* data: [],*/
        infType: "indicator",
        yAxis: "#0",
        color: colorGradients[0][5],
        lineColor: colorGradients[0][5],
        hideLegend: true,
        showInLegend: false
    }, false);
    this.series[6] = chartInstance.addSeries({
        id: id + "_GMMA7",
        name: "GMMA7",
        infIndType: "GMMA",
        infIndSubType: "GMMA7",
        /* data: [],*/
        infType: "indicator",
        yAxis: "#0",
        color: colorGradients[1][0],
        lineColor: colorGradients[1][0],
        hideLegend: true,
        showInLegend: false
    }, false);
    this.series[7] = chartInstance.addSeries({
        id: id + "_GMMA8",
        name: "GMMA8",
        infIndType: "GMMA",
        infIndSubType: "GMMA8",
        /* data: [],*/
        infType: "indicator",
        yAxis: "#0",
        color: colorGradients[1][1],
        lineColor: colorGradients[1][1],
        hideLegend: true,
        showInLegend: false
    }, false);
    this.series[8] = chartInstance.addSeries({
        id: id + "_GMMA9",
        name: "GMMA9",
        infIndType: "GMMA",
        infIndSubType: "GMMA9",
        /* data: [],*/
        infType: "indicator",
        yAxis: "#0",
        color: colorGradients[1][2],
        lineColor: colorGradients[1][2],
        hideLegend: true,
        showInLegend: false
    }, false);
    this.series[9] = chartInstance.addSeries({
        id: id + "_GMMA10",
        name: "GMMA10",
        infIndType: "GMMA",
        infIndSubType: "GMMA10",
        /* data: [],*/
        infType: "indicator",
        yAxis: "#0",
        color: colorGradients[1][3],
        lineColor: colorGradients[1][3],
        hideLegend: true,
        showInLegend: false
    }, false);
    this.series[10] = chartInstance.addSeries({
        id: id + "_GMMA11",
        name: "GMMA11",
        infIndType: "GMMA",
        infIndSubType: "GMMA11",
        /* data: [],*/
        infType: "indicator",
        yAxis: "#0",
        color: colorGradients[1][4],
        lineColor: colorGradients[1][4],
        hideLegend: true,
        showInLegend: false
    }, false);
    this.series[11] = chartInstance.addSeries({
        id: id + "_GMMA12",
        name: "GMMA12",
        infIndType: "GMMA",
        infIndSubType: "GMMA12",
        /* data: [],*/
        infType: "indicator",
        yAxis: "#0",
        color: colorGradients[1][5],
        lineColor: colorGradients[1][5],
        hideLegend: true,
        showInLegend: false
    }, true);


};

infChart.util.extend(infChart.Indicator, infChart.GMMAIndicator);

infChart.GMMAIndicator.prototype.calculate = function (ohlc, data, redraw) {
    var high = ohlc.h,
        low = ohlc.l,
        close = ohlc.c,
        open = ohlc.o;
    if (data && data.length > 0) {
        var chart = this.chart;
        var ema1 = this.getSeries(high, low, close, open, this.params.base, infChart.indicatorDefaults.EXPONENTIALMOVINGAVERAGE, this.params.period1);
        var _ema1 = this.merge(data, ema1);
        chart.get(this.id).setData(_ema1, redraw, false, false);

        var ema2 = this.getSeries(high, low, close, open, this.params.base, infChart.indicatorDefaults.EXPONENTIALMOVINGAVERAGE, this.params.period2);
        var _ema2 = this.merge(data, ema2);
        chart.get(this.id + "_GMMA2").setData(_ema2, redraw, false, false);

        var ema3 = this.getSeries(high, low, close, open, this.params.base, infChart.indicatorDefaults.EXPONENTIALMOVINGAVERAGE, this.params.period3);
        var _ema3 = this.merge(data, ema3);
        chart.get(this.id + "_GMMA3").setData(_ema3, redraw, false, false);

        var ema4 = this.getSeries(high, low, close, open, this.params.base, infChart.indicatorDefaults.EXPONENTIALMOVINGAVERAGE, this.params.period4);
        var _ema4 = this.merge(data, ema4);
        chart.get(this.id + "_GMMA4").setData(_ema4, redraw, false, false);

        var ema5 = this.getSeries(high, low, close, open, this.params.base, infChart.indicatorDefaults.EXPONENTIALMOVINGAVERAGE, this.params.period5);
        var _ema5 = this.merge(data, ema5);
        chart.get(this.id + "_GMMA5").setData(_ema5, redraw, false, false);

        var ema6 = this.getSeries(high, low, close, open, this.params.base, infChart.indicatorDefaults.EXPONENTIALMOVINGAVERAGE, this.params.period6);
        var _ema6 = this.merge(data, ema6);
        chart.get(this.id + "_GMMA6").setData(_ema6, redraw, false, false);

        var ema7 = this.getSeries(high, low, close, open, this.params.base, infChart.indicatorDefaults.EXPONENTIALMOVINGAVERAGE, this.params.period7);
        var _ema7 = this.merge(data, ema7);
        chart.get(this.id + "_GMMA7").setData(_ema7, redraw, false, false);

        var ema8 = this.getSeries(high, low, close, open, this.params.base, infChart.indicatorDefaults.EXPONENTIALMOVINGAVERAGE, this.params.period8);
        var _ema8 = this.merge(data, ema8);
        chart.get(this.id + "_GMMA8").setData(_ema8, redraw, false, false);

        var ema9 = this.getSeries(high, low, close, open, this.params.base, infChart.indicatorDefaults.EXPONENTIALMOVINGAVERAGE, this.params.period9);
        var _ema9 = this.merge(data, ema9);
        chart.get(this.id + "_GMMA9").setData(_ema9, redraw, false, false);

        var ema10 = this.getSeries(high, low, close, open, this.params.base, infChart.indicatorDefaults.EXPONENTIALMOVINGAVERAGE, this.params.period10);
        var _ema10 = this.merge(data, ema10);
        chart.get(this.id + "_GMMA10").setData(_ema10, redraw, false, false);

        var ema11 = this.getSeries(high, low, close, open, this.params.base, infChart.indicatorDefaults.EXPONENTIALMOVINGAVERAGE, this.params.period11);
        var _ema11 = this.merge(data, ema11);
        chart.get(this.id + "_GMMA11").setData(_ema11, redraw, false, false);

        var ema12 = this.getSeries(high, low, close, open, this.params.base, infChart.indicatorDefaults.EXPONENTIALMOVINGAVERAGE, this.params.period12);
        var _ema12 = this.merge(data, ema12);
        chart.get(this.id + "_GMMA12").setData(_ema12, redraw, false, false);
    }
};

infChart.GMMAIndicator.prototype.getSeries = function (hts, lts, cts, ots, ul, ma, m) {
    var ts = this.movul(hts, lts, cts, ots, ul);
    return this.movmean(ts, ma, m);

};

infChart.GMMAIndicator.prototype.getContextMenuOptions = function (chartId, series, options) {
    return {
        "removeIndicator": {
            icon : options.removeIndicator.icon,
            displayText :options.removeIndicator.displayText,
            action : function () {
                let indicator = infChart.indicatorMgr.getIndicatorBySeriesId(chartId, series.options.id);
                infChart.manager.removeSeries(series.chart.renderTo.id, indicator.id, series.options.infType);
            }
        }
    }
};

//endregion **************************************GMMA (GMMA) Indicator******************************************

//region ************************************** GMMA Oscillator (GMMAOsci) Indicator******************************************

/***
 * Cunstructor for GMMA Oscillator (GMMAOsci) Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
infChart.GMMAOscillatorIndicator = function (id, chartId, type, chartInstance) {

    infChart.Indicator.apply(this, arguments);

    this.params.period1 = 3;
    this.params.period2 = 15;
    this.params.period3 = 30;
    this.params.period4 = 60;
    this.params.base = infChart.indicatorDefaults.ULCLOSEPRICE;
    this.titleParams = ["period1", "period2", "period3", "period4"];

    this.axisId = "#GMMAOsci_" + id;

    var colors = infChart.util.getSeriesColors(), upColor = infChart.util.getDefaultUpColor(), downColor = infChart.util.getDefaultDownColor();

    this.addAxis({
        id: this.axisId,
        startOnTick: false,
        endOnTick: false
    });

    this.series[0] = chartInstance.addSeries({
        id: id,
        infIndType: "GMMAOsci",
        infIndSubType: "GMMAOsci",
        name: "GMMAOsci",
        /* data: [],*/
        infType: "indicator",
        yAxis: this.axisId,
        showInLegend: false

    }, false);

    this.series[1] = chartInstance.addSeries({
        "id": id + "_GMMAOsci2",
        infIndType: "GMMAOsci",
        infIndSubType: "GMMAOsci2",
        "yAxis": this.axisId,
        showInLegend: false,
        "name": "GMMAOsci2",
        /* data: [],*/
        infType: "indicator",
        "color": colors[1],
        "lineColor": colors[1]
    }, false);

    this.series[2] = chartInstance.addSeries({
        "id": id + "_GMMAOsci3",
        infIndType: "GMMAOsci",
        infIndSubType: "GMMAOsci3",
        "type": "column",
        "yAxis": this.axisId,
        showInLegend: false,
        "name": "GMMAOsci3",
        /* data: [],*/
        infType: "indicator",
        negativeFillColor: downColor,
        negativeColor: downColor,
        hasColumnNegative: true,
        hasAreaNegative: true,
        color: upColor,
        threshold: 0,
        fillColor: upColor,
        fillOpacity: 0.5
    }, true);

};

infChart.util.extend(infChart.Indicator, infChart.GMMAOscillatorIndicator);

infChart.GMMAOscillatorIndicator.prototype.calculate = function (ohlc, data, redraw) {
    var high = ohlc.h,
        low = ohlc.l,
        close = ohlc.c,
        open = ohlc.o;
    var that = this;

    if (data && data.length > 0) {
        infChart.util.forEach(this.series, function (i, series) {
            switch (series.options.infIndSubType) {
                case 'GMMAOsci':
                    var macd = that.getSeries(high, low, close, open, that.params.base, infChart.indicatorDefaults.EXPONENTIALMOVINGAVERAGE, that.params.period1, that.params.period2);
                    var _macd = that.merge(data, macd);
                    series.setData(_macd, false, false, false);
                    break;
                case 'GMMAOsci2':
                    var macd2 = that.getSeries(high, low, close, open, that.params.base, infChart.indicatorDefaults.EXPONENTIALMOVINGAVERAGE, that.params.period3, that.params.period4);
                    var _macd2 = that.merge(data, macd2);
                    series.setData(_macd2, false, false, false);
                    break;
                case 'GMMAOsci3':
                    var macd3 = that.getSeries(high, low, close, open, that.params.base, infChart.indicatorDefaults.EXPONENTIALMOVINGAVERAGE, that.params.period2, that.params.period4);
                    var _macd3 = that.merge(data, macd3);
                    series.setData(_macd3, false, false, false);
                    break;
                default :
                    break;
            }
        });

        if (redraw) {
            var chart = this.chart;
            chart.redraw();
        }
    }
};

infChart.GMMAOscillatorIndicator.prototype.getSeries = function (hts, lts, cts, ots, ul, ma, nocp1, nocp2) {
    var ts, result1, result2, k;
    ts = this.movul(hts, lts, cts, ots, ul);
    result1 = this.movmean(ts, ma, nocp1);
    result2 = this.movmean(ts, ma, nocp2);

    for (k = 0; k < result1.length; k++)
        result1[k] = result1[k] - result2[k];

    return result1;
};

//endregion **************************************GMMA Oscillator (GMMAOsci)******************************************

//region ************************************** Relative Strength (RSI) Indicator******************************************

/***
 * Cunstructor for Relative Strength (RSI) Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
infChart.RSIIndicator = function (id, chartId, type, chartInstance) {

    infChart.Indicator.apply(this, arguments);

    this.params.period = 14;
    this.params.upperLevel = 0.8;
    this.params.lowerLevel = 0.2;
    this.params.n = 1.0;
    this.params.base = infChart.indicatorDefaults.ULCLOSEPRICE;
    this.titleParams = ["period", "upperLevel", "lowerLevel", "n"];
    this.titleParamsDec = [0, 1, 1, 1];

    this.axisId = "#RSI_" + id;

    var colors = infChart.util.getSeriesColors(),
        upColor = infChart.util.getDefaultUpColor(),
        downColor = infChart.util.getDefaultDownColor();

    var theme = {
        fillOpacity: 0.3
    };

    if (Highcharts.theme && Highcharts.theme.indicator && Highcharts.theme.indicator.RSI) {
        theme = infChart.util.merge(theme, Highcharts.theme.indicator.RSI);
    }

    this.addAxis({
        id: this.axisId,
        min: 0,
        max: 1,
        startOnTick: false,
        endOnTick: false
    });


    this.series[1] = chartInstance.addSeries({
        "id": id + "_RSI2",
        infIndType: "RSI",
        infIndSubType: "RSI2",
        /* data: [],*/
        infType: "indicator",
        "yAxis": this.axisId,
        "name": "Upper",
        "color": upColor,
        "lineColor": upColor,
        "type": "arearange",
        fillOpacity: theme.fillOpacity,
        hideLegend: true,
        hideToolTip: true,
        infRecal: true,
        showInLegend: false,
        enableMouseTracking: true,
        states: {
            hover: {
                enabled: false
            }
        }
    }, false);

    this.series[2] = chartInstance.addSeries({
        "id": id + "_RSI3",
        infIndType: "RSI",
        infIndSubType: "RSI3",
        /* data: [],*/
        infType: "indicator",
        "yAxis": this.axisId,
        "name": "Lower",
        "color": downColor,
        "lineColor": downColor,
        "type": "arearange",
        fillOpacity: theme.fillOpacity,
        hideLegend: true,
        hideToolTip: true,
        showInLegend: false,
        enableMouseTracking: true,
        states: {
            hover: {
                enabled: false
            }
        }
    }, false);


    this.series[0] = chartInstance.addSeries({
        id: id,
        infIndType: "RSI",
        infIndSubType: "RSI",
        name: "RSI",
        /* data: [],*/
        infType: "indicator",
        yAxis: this.axisId,
        showInLegend: false,
        color: colors[1],
        lineColor: colors[1],
        enableMouseTracking: true,
        states: {
            hover: {
                enabled: false
            }
        }
    }, true);

    this.style[this.series[1].options.id] = ["line", "arearange"];
    this.style[this.series[2].options.id] = ["line", "arearange"];
};

infChart.util.extend(infChart.Indicator, infChart.RSIIndicator);

infChart.RSIIndicator.prototype.calculate = function (ohlc, data, redraw, seriesId) {
    var high = ohlc.h,
        low = ohlc.l,
        close = ohlc.c,
        open = ohlc.o;

    if (data && data.length > 0) {
        var chart = this.chart;


        if (!seriesId) {
            var rsi = this.getSeries(high, low, close, open, this.params.base, infChart.indicatorDefaults.EXPONENTIALMOVINGAVERAGE, this.params.period, parseFloat(this.params.n));
            var _rsi = this.merge(data, rsi);
            chart.get(this.id).setData(_rsi, redraw);

        }
        if (!seriesId || seriesId == (this.id + '_RSI2')) {
            var series = chart.get(this.id + '_RSI2');
            if (series.options.type === "line") {
                series.setData(this.getBand(data, series.options.type, this.params.upperLevel, this.params.upperLevel), redraw, false, false);
            } else {
                series.setData(this.getBand(data, series.options.type, 1, this.params.upperLevel), redraw, false, false);
            }
        }
        if (!seriesId || seriesId == (this.id + '_RSI3')) {
            var series4 = chart.get(this.id + '_RSI3');
            if (series4.options.type === "line") {
                series4.setData(this.getBand(data, series4.options.type, this.params.lowerLevel, this.params.lowerLevel), redraw, false, false);
            } else {
                series4.setData(this.getBand(data, series4.options.type, this.params.lowerLevel, 0), redraw, false, false);
            }
        }
    }
};

infChart.RSIIndicator.prototype.getSeries = function (hts, lts, cts, ots, ul, ma, nocp, n) {
    var ts = this.movul(hts, lts, cts, ots, ul);
    return this.rsi(ts, ul, ma, nocp, n);
};

/**
 * hide indicator
 */
infChart.RSIIndicator.prototype.hideIndicator = function (seriesId) {
    infChart.Indicator.prototype.hideIndicator.apply(this, [seriesId, true]);
};

/**
 * show indicator
 */
infChart.RSIIndicator.prototype.showIndicator = function (seriesId) {
    infChart.Indicator.prototype.showIndicator.apply(this, [seriesId, true]);
};

//endregion **************************************Relative Strength (RSI) Indicator******************************************
//region ************************************** Cutler RSI (RSIC) Indicator******************************************

/***
 * Cunstructor for Cutler RSI (RSIC) Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
 infChart.RSICIndicator = function (id, chartId, type, chartInstance) {

    infChart.Indicator.apply(this, arguments);

    this.params.period = 10;
    this.params.upperLevel = 0.8;
    this.params.lowerLevel = 0.2;
    this.params.n = 1.0;
    this.params.base = infChart.indicatorDefaults.ULCLOSEPRICE;
    this.titleParams = ["period", "upperLevel", "lowerLevel", "n"];
    this.titleParamsDec = [0, 1, 1, 1];
    this.axisId = "#RSIC_" + id;

    var colors = infChart.util.getSeriesColors(), upColor = infChart.util.getDefaultUpColor(), downColor = infChart.util.getDefaultDownColor();

    this.addAxis({
        id: this.axisId,
        min: 0,
        max: 1,
        startOnTick: false,
        endOnTick: false
    });


    this.series[1] = chartInstance.addSeries({
        "id": id + "_RSIC2",
        infIndType: "RSIC",
        infIndSubType: "RSIC2",
        /* data: [],*/
        infType: "indicator",
        "yAxis": this.axisId,
        "name": "Upper",
        "color": upColor,
        "lineColor": upColor,
        "type": "arearange",
        hideLegend: true,
        hideToolTip: true,
        infRecal: true,
        showInLegend: false,
        enableMouseTracking: true,
        states: {
            hover: {
                enabled: false
            }
        }
    }, false);

    this.series[2] = chartInstance.addSeries({
        "id": id + "_RSIC3",
        infIndType: "RSIC",
        infIndSubType: "RSIC3",
        /* data: [],*/
        infType: "indicator",
        "yAxis": this.axisId,
        "name": "Lower",
        "color": downColor,
        "lineColor": downColor,
        "type": "arearange",
        hideLegend: true,
        hideToolTip: true,
        showInLegend: false,
        enableMouseTracking: true,
        states: {
            hover: {
                enabled: false
            }
        }
    }, false);

    this.series[0] = chartInstance.addSeries({
        id: id,
        infIndType: "RSIC",
        infIndSubType: "RSIC",
        name: "RSIC",
        /* data: [],*/
        infType: "indicator",
        yAxis: this.axisId,
        showInLegend: false,
        color: colors[1],
        lineColor: colors[1],
        enableMouseTracking: true,
        states: {
            hover: {
                enabled: false
            }
        }
    }, true);

    this.style[this.series[1].options.id] = ["line", "arearange"];
    this.style[this.series[2].options.id] = ["line", "arearange"];
};

infChart.util.extend(infChart.Indicator, infChart.RSICIndicator);

infChart.RSICIndicator.prototype.calculate = function (ohlc, data, redraw, seriesId) {
    var high = ohlc.h,
        low = ohlc.l,
        close = ohlc.c,
        open = ohlc.o;

    if (data && data.length > 0) {
        var chart = this.chart;


        if (!seriesId) {
            var rsi = this.getSeries(high, low, close, open, this.params.base, infChart.indicatorDefaults.EXPONENTIALMOVINGAVERAGE, this.params.period, parseFloat(this.params.n));
            var _rsi = this.merge(data, rsi);
            chart.get(this.id).setData(_rsi, redraw, false, false);

        }
        if (!seriesId || seriesId == (this.id + '_RSIC2')) {
            var series = chart.get(this.id + '_RSIC2');
            if (series.options.type === "line") {
                series.setData(this.getBand(data, series.options.type, this.params.upperLevel, this.params.upperLevel), redraw, false, false);
            } else {
                series.setData(this.getBand(data, series.options.type, 1, this.params.upperLevel), redraw, false, false);
            }
        }
        if (!seriesId || seriesId == (this.id + '_RSIC3')) {
            var series4 = chart.get(this.id + '_RSIC3');
            if (series4.options.type === "line") {
                series4.setData(this.getBand(data, series4.options.type, this.params.lowerLevel, this.params.lowerLevel), redraw, false, false);
            } else {
                series4.setData(this.getBand(data, series4.options.type, this.params.lowerLevel, 0), redraw, false, false);
            }
        }
    }
};

infChart.RSICIndicator.prototype.getSeries = function (hts, lts, cts, ots, ul, ma, nocp, n) {
    var ts = this.movul(hts, lts, cts, ots, ul);
    ts = this.movmean(ts, infChart.indicatorDefaults.ARITHMETICMOVINGAVERAGE, nocp);
    return this.rsi(ts, ul, ma, nocp, n);
};

infChart.RSICIndicator.prototype.getContextMenuOptions = function (chartId, series, options) {
    return {
        "removeIndicator": {
            icon : options.removeIndicator.icon,
            displayText :options.removeIndicator.displayText,
            action : function () {
                let indicator = infChart.indicatorMgr.getIndicatorBySeriesId(chartId, series.options.id);
                infChart.manager.removeSeries(series.chart.renderTo.id, indicator.id, series.options.infType);
            }
        }
    }
};

/**
 * hide indicator
 */
infChart.RSICIndicator.prototype.hideIndicator = function (seriesId) {
    infChart.Indicator.prototype.hideIndicator.apply(this, [seriesId, true]);
};

/**
 * show indicator
 */
infChart.RSICIndicator.prototype.showIndicator = function (seriesId) {
    infChart.Indicator.prototype.showIndicator.apply(this, [seriesId, true]);
};
//endregion **************************************Cutler RSI (RSIC) Indicator******************************************

//region ************************************** Stochastic RSI (SRSI) Indicator******************************************

/***
 * Cunstructor for Stochastic RSI (SRSI) Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
 infChart.SRSIIndicator = function (id, chartId, type, chartInstance) {

    infChart.Indicator.apply(this, arguments);

    this.params.period = 14;
    this.params.upperLevel = 0.8;
    this.params.lowerLevel = 0.2;
    this.params.n = 1.0;
    this.params.base = infChart.indicatorDefaults.ULCLOSEPRICE;
    this.titleParams = ["period", "upperLevel", "lowerLevel", "n"];
    this.titleParamsDec = [0, 1, 1, 1];
    this.axisId = "#SRSI_" + id;

    var upColor = infChart.util.getDefaultUpColor(), downColor = infChart.util.getDefaultDownColor();

    this.addAxis({
        id: this.axisId,
        min: 0,
        max: 1,
        startOnTick: false,
        endOnTick: false
    });


    this.series[1] = chartInstance.addSeries({
        "id": id + "_SRSI2",
        infIndType: "SRSI",
        infIndSubType: "SRSI2",
        /* data: [],*/
        infType: "indicator",
        "yAxis": this.axisId,
        "name": "Upper",
        "color": upColor,
        "lineColor": upColor,
        "type": "arearange",
        hideLegend: true,
        hideToolTip: true,
        infRecal: true,
        showInLegend: false,
        enableMouseTracking: true,
        states: {
            hover: {
                enabled: false
            }
        }
    }, false);

    this.series[2] = chartInstance.addSeries({
        "id": id + "_SRSI3",
        infIndType: "SRSI",
        infIndSubType: "SRSI3",
        /* data: [],*/
        infType: "indicator",
        "yAxis": this.axisId,
        "name": "Lower",
        "color": downColor,
        "lineColor": downColor,
        "type": "arearange",
        hideLegend: true,
        hideToolTip: true,
        showInLegend: false,
        enableMouseTracking: true,
        states: {
            hover: {
                enabled: false
            }
        }
    }, false);


    this.series[0] = chartInstance.addSeries({
        id: id,
        infIndType: "SRSI",
        infIndSubType: "SRSI",
        name: "SRSI",
        /* data: [],*/
        infType: "indicator",
        yAxis: this.axisId,
        showInLegend: false,
        enableMouseTracking: true,
        states: {
            hover: {
                enabled: false
            }
        }
    }, true);

    this.style[this.series[1].options.id] = ["line", "arearange"];
    this.style[this.series[2].options.id] = ["line", "arearange"];
};

infChart.util.extend(infChart.Indicator, infChart.SRSIIndicator);

infChart.SRSIIndicator.prototype.calculate = function (ohlc, data, redraw, seriesId) {
    var high = ohlc.h,
        low = ohlc.l,
        close = ohlc.c,
        open = ohlc.o;

    if (data && data.length > 0) {

        var chart = this.chart;
        if (!seriesId) {
            var rsi = this.getSeries(high, low, close, open, this.params.base, infChart.indicatorDefaults.EXPONENTIALMOVINGAVERAGE, this.params.period, parseFloat(this.params.n));
            var _rsi = this.merge(data, rsi);
            chart.get(this.id).setData(_rsi, redraw, false, false);

        }
        if (!seriesId || seriesId == (this.id + '_SRSI2')) {
            var series = chart.get(this.id + '_SRSI2');
            if (series.options.type === "line") {
                series.setData(this.getBand(data, series.options.type, this.params.upperLevel, this.params.upperLevel), redraw, false, false);
            } else {
                series.setData(this.getBand(data, series.options.type, 1, this.params.upperLevel), redraw, false, false);
            }
        }
        if (!seriesId || seriesId == (this.id + '_SRSI3')) {
            var series4 = chart.get(this.id + '_SRSI3');
            if (series4.options.type === "line") {
                series4.setData(this.getBand(data, series4.options.type, this.params.lowerLevel, this.params.lowerLevel), redraw, false, false);
            } else {
                series4.setData(this.getBand(data, series4.options.type, this.params.lowerLevel, 0), redraw, false, false);
            }
        }
    }
};

infChart.SRSIIndicator.prototype.getSeries = function (hts, lts, cts, ots, ul, ma, nocp, n) {

    var k, srsi,
        ts = this.movul(hts, lts, cts, ots, ul),
        rsi = this.rsi(ts, ul, ma, nocp, n),
        hrsi = this.movmax(rsi, nocp),
        lrsi = this.movmin(rsi, nocp);

    srsi = new Array(rsi.length);

    for (k = 0; k < srsi.length; k++) {
        if (hrsi[k] != lrsi[k])
            srsi[k] = (rsi[k] - lrsi[k]) / (hrsi[k] - lrsi[k]);
    }

    return srsi;
};

/**
 * hide indicator
 */
infChart.SRSIIndicator.prototype.hideIndicator = function (seriesId) {
    infChart.Indicator.prototype.hideIndicator.apply(this, [seriesId, true]);
};

/**
 * show indicator
 */
infChart.SRSIIndicator.prototype.showIndicator = function (seriesId) {
    infChart.Indicator.prototype.showIndicator.apply(this, [seriesId, true]);
};

//endregion **************************************Stochastic RSI (SRSI) Indicator******************************************

//region ************************************** Aroon (AR) Indicator******************************************

/***
 * Cunstructor for Aroon (AR) Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
 infChart.AroonIndicator = function (id, chartId, type, chartInstance) {

    infChart.Indicator.apply(this, arguments);
    this.params.period = 25;
    this.axisId = "#AR_" + id;

    var colors = infChart.util.getSeriesColors();

    this.addAxis({
        id: this.axisId,
        startOnTick: false,
        endOnTick: false
    });

    this.series[0] = chartInstance.addSeries({
        id: id,
        infIndType: "AR",
        infIndSubType: "AR",
        name: "AR",
        /* data: [],*/
        infType: "indicator",
        yAxis: this.axisId,
        showInLegend: false,
        color: colors[0],
        lineColor: colors[0]
    }, true);


};

infChart.util.extend(infChart.Indicator, infChart.AroonIndicator);

infChart.AroonIndicator.prototype.calculate = function (ohlc, data, redraw) {
    var high = ohlc.h,
        low = ohlc.l;
    if (data && data.length > 0) {
        var chart = this.chart;
        var ar = this.getSeries(high, low, this.params.period);
        var _ar = this.merge(data, ar);
        chart.get(this.id).setData(_ar, redraw, false, false);
    }
};

infChart.AroonIndicator.prototype.getSeries = function (hts, lts, nocp) {
    var ar, ard, k;
    ar = this.arud(hts, lts, 1, nocp);
    ard = this.arud(hts, lts, 2, nocp);
    for (k = 0; k < ar.length; k++)
        ar[k] = ar[k] - ard[k];
    return ar;
};

//endregion **************************************Aroon (AR) Indicator******************************************


//region ************************************** Average Direction Index (ADX) Indicator******************************************

/***
 * Constructor for Average Direction Index (ADX) Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
 infChart.AverageDirectionIndexIndicator = function (id, chartId, type, chartInstance) {

    infChart.Indicator.apply(this, arguments);

    this.params.period = 14;
    this.axisId = "#ADX_" + id;

    var colors = infChart.util.getSeriesColors();

    this.addAxis({
        id: this.axisId,
        startOnTick: false,
        endOnTick: false
    });

    this.series[0] = chartInstance.addSeries({
        id: id,
        infIndType: "ADX",
        infIndSubType: "ADX",
        name: "ADX",
        /* data: [],*/
        infType: "indicator",
        yAxis: this.axisId,
        showInLegend: false,
        color: colors[0],
        lineColor: colors[0]
    }, true);


};

infChart.util.extend(infChart.Indicator, infChart.AverageDirectionIndexIndicator);

infChart.AverageDirectionIndexIndicator.prototype.calculate = function (ohlc, data, redraw) {
    var high = ohlc.h,
        low = ohlc.l,
        close = ohlc.c;
    if (data && data.length > 0) {
        var chart = this.chart;
        var adx = this.getSeries(high, low, close, infChart.indicatorDefaults.EXPONENTIALMOVINGAVERAGE, this.params.period, this.params.period);
        var _adx = this.merge(data, adx);
        chart.get(this.id).setData(_adx, redraw, false, false);
    }
};

infChart.AverageDirectionIndexIndicator.prototype.getSeries = function (hts, lts, cts, ma, nocp1, nocp2) {
    return this.movmean(this.dmi(hts, lts, cts, 3, ma, nocp1), ma, nocp2);
};

//endregion **************************************Average Direction Index (ADX) Indicator******************************************
//region ************************************** True Range (TrueR) Indicator******************************************

/***
 * Constructor for True Range (TrueR) Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
 infChart.TrueRangeIndicator = function (id, chartId, type, chartInstance) {

    infChart.Indicator.apply(this, arguments);

    this.axisId = "#TrueR_" + id;

    var colors = infChart.util.getSeriesColors();

    this.addAxis({
        id: this.axisId,
        startOnTick: false,
        endOnTick: false
    });


    this.series[0] = chartInstance.addSeries({
        id: id,
        infIndType: "TrueR",
        infIndSubType: "TrueR",
        name: "TrueR",
        /* data: [],*/
        infType: "indicator",
        yAxis: this.axisId,
        showInLegend: false,
        color: colors[0],
        lineColor: colors[0]
    }, true);


};

infChart.util.extend(infChart.Indicator, infChart.TrueRangeIndicator);

infChart.TrueRangeIndicator.prototype.calculate = function (ohlc, data, redraw) {
    var high = ohlc.h,
        low = ohlc.l,
        close = ohlc.c;
    if (data && data.length > 0) {
        var chart = this.chart;
        var tr = this.getSeries(high, low, close);
        var _tr = this.merge(data, tr);
        chart.get(this.id).setData(_tr, redraw, false, false);
    }
};

infChart.TrueRangeIndicator.prototype.getSeries = function (hts, lts, cts) {
    return this.trNew(hts, lts, cts);
};

//endregion **************************************True Range (TrueR) Indicator******************************************
//region ************************************** Average True Range (ATR) Indicator******************************************

/***
 * Constructor for Average True Range (ATR) Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
 infChart.AverageTrueRangeIndicator = function (id, chartId, type, chartInstance) {

    infChart.Indicator.apply(this, arguments);

    this.params.period = 14;
    this.axisId = "#ATR_" + id;

    var colors = infChart.util.getSeriesColors();

    this.addAxis({
        id: this.axisId,
        startOnTick: false,
        endOnTick: false
    });


    this.series[0] = chartInstance.addSeries({
        id: id,
        infIndType: "ATR",
        infIndSubType: "ATR",
        name: "ATR",
        /* data: [],*/
        infType: "indicator",
        yAxis: this.axisId,
        showInLegend: false,
        color: colors[0],
        lineColor: colors[0]
    }, true);


};

infChart.util.extend(infChart.Indicator, infChart.AverageTrueRangeIndicator);

infChart.AverageTrueRangeIndicator.prototype.calculate = function (ohlc, data, redraw) {
    var high = ohlc.h,
        low = ohlc.l,
        close = ohlc.c;
    if (data && data.length > 0) {
        var chart = this.chart;
        var atr = this.getSeries(high, low, close, infChart.indicatorDefaults.ARITHMETICMOVINGAVERAGE, this.params.period);
        var _atr = this.merge(data, atr);
        chart.get(this.id).setData(_atr, redraw, false, false);
    }
};

infChart.AverageTrueRangeIndicator.prototype.getSeries = function (hts, lts, cts, ma, nocp) {
    return this.movmeanNew(this.trNew(hts, lts, cts), ma, nocp);
};

//endregion **************************************Average True Range (ATR) Indicator******************************************s
//region ************************************** Directional Movement System (DMS) Indicator******************************************

/***
 * Constructor for Directional Movement Indicator (DMS) Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
 infChart.DirectionalMovementIndicator = function (id, chartId, type, chartInstance) {

    infChart.Indicator.apply(this, arguments);

    this.params.period = 14;
    this.axisId = "#DMS_" + id;

    var colors = infChart.util.getSeriesColors();

    this.addAxis({
        id: this.axisId,
        startOnTick: false,
        endOnTick: false
    });


    this.series[0] = chartInstance.addSeries({
        id: id,
        infIndType: "DMS",
        infIndSubType: "DMS",
        name: "DMS",
        /*data: [],*/
        infType: "indicator",
        yAxis: this.axisId,
        showInLegend: false,
        color: colors[1],
        lineColor: colors[1]
    }, false);

    this.series[1] = chartInstance.addSeries({
        "id": id + "_DMS2",
        infIndType: "DMS",
        infIndSubType: "DMI2",
        /* data: [],*/
        infType: "indicator",
        "yAxis": this.axisId,
        showInLegend: false,
        "name": "DMI2",
        "color": "#00CC00",
        "lineColor": "#00CC00"
    }, false);

    this.series[2] = chartInstance.addSeries({
        "id": id + "_DMS3",
        infIndType: "DMS",
        infIndSubType: "DMI3",
        /* data: [],*/
        infType: "indicator",
        "yAxis": this.axisId,
        showInLegend: false,
        "name": "DMI3",
        "color": "#EE0000",
        "lineColor": "#EE0000"
    }, true);

};

infChart.util.extend(infChart.Indicator, infChart.DirectionalMovementIndicator);

infChart.DirectionalMovementIndicator.prototype.calculate = function (ohlc, data, redraw) {
    var high = ohlc.h,
        low = ohlc.l,
        close = ohlc.c;
    var that = this;

    if (data && data.length > 0) {
        infChart.util.forEach(this.series, function (i, series) {
            switch (series.options.infIndSubType) {
                case 'DMS':
                    var dmi = that.getSeries(high, low, close, 1, infChart.indicatorDefaults.EXPONENTIALMOVINGAVERAGE, that.params.period);
                    var _dmi = that.merge(data, dmi);
                    series.setData(_dmi, false, false, false);
                    break;
                case 'DMI2':
                    var dmi2 = that.getSeries(high, low, close, 2, infChart.indicatorDefaults.EXPONENTIALMOVINGAVERAGE, that.params.period);
                    var _dmi2 = that.merge(data, dmi2);
                    series.setData(_dmi2, false, false, false);
                    break;
                case 'DMI3':
                    var dmi3 = that.getSeries(high, low, close, 3, infChart.indicatorDefaults.EXPONENTIALMOVINGAVERAGE, that.params.period);
                    var _dmi3 = that.merge(data, dmi3);
                    series.setData(_dmi3, redraw, false, false);
                    break;
                default :
                    break;
            }
        });

        if (redraw) {
            var chart = this.chart;
            chart.redraw();
        }
    }
};

infChart.DirectionalMovementIndicator.prototype.getSeries = function (hts, lts, cts, grn, ma, nocp) {

    return this.dmi(hts, lts, cts, grn, ma, nocp);
};

//endregion **************************************Directional Movement Indicator (DMS) Indicator******************************************
//region ************************************** Directional Movement Index (DMI) Indicator******************************************

/***
 * Constructor for Directional Movement Indicator (DMI) Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
 infChart.DirectionalMovementIndexIndicator = function (id, chartId, type, chartInstance) {

    infChart.Indicator.apply(this, arguments);

    this.params.period = 14;
    this.axisId = "#DMI_" + id;

    var colors = infChart.util.getSeriesColors();

    this.addAxis({
        id: this.axisId,
        startOnTick: false,
        endOnTick: false
    });


    this.series[0] = chartInstance.addSeries({
        id: id,
        infIndType: "DMI",
        infIndSubType: "DMI",
        name: "DMI",
        data: [],
        infType: "indicator",
        yAxis: this.axisId,
        showInLegend: false,
        color: colors[1],
        lineColor: colors[1]
    }, true);

};

infChart.util.extend(infChart.Indicator, infChart.DirectionalMovementIndexIndicator);

infChart.DirectionalMovementIndexIndicator.prototype.calculate = function (ohlc, data, redraw) {
    var high = ohlc.h,
        low = ohlc.l,
        close = ohlc.c;
    var that = this;

    if (data && data.length > 0) {
        infChart.util.forEach(this.series, function (i, series) {
            switch (series.options.infIndSubType) {
                case 'DMI':
                    var dmi = that.getSeries(high, low, close, 1, infChart.indicatorDefaults.EXPONENTIALMOVINGAVERAGE, that.params.period);
                    var _dmi = that.merge(data, dmi);
                    series.setData(_dmi, false, false, false);
                    break;
                default :
                    break;
            }
        });

        if (redraw) {
            var chart = this.chart;
            chart.redraw();
        }
    }
};

infChart.DirectionalMovementIndexIndicator.prototype.getSeries = function (hts, lts, cts, grn, ma, nocp) {

    return this.dmi(hts, lts, cts, grn, ma, nocp);
};

//endregion **************************************Directional Movement Index Indicator (DMI) Indicator******************************************
//region ************************************** Directional Movement Plus Indicator (DMI+) Indicator******************************************

/***
 * Constructor for Directional Movement Plus Indicator (DMI+) Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
 infChart.DirectionalMovementPlusIndicator = function (id, chartId, type, chartInstance) {

    infChart.Indicator.apply(this, arguments);

    this.params.period = 14;
    this.axisId = "#DMIP_" + id;

    this.addAxis({
        id: this.axisId,
        startOnTick: false,
        endOnTick: false
    });


    this.series[0] = chartInstance.addSeries({
        "id": id,
        infIndType: "DMIP",
        infIndSubType: "DMIP",
        /* data: [],*/
        infType: "indicator",
        "yAxis": this.axisId,
        showInLegend: false,
        "name": "DMIP"
    }, true);


};

infChart.util.extend(infChart.Indicator, infChart.DirectionalMovementPlusIndicator);

infChart.DirectionalMovementPlusIndicator.prototype.calculate = function (ohlc, data, redraw) {
    var high = ohlc.h,
        low = ohlc.l,
        close = ohlc.c;
    var that = this;

    if (data && data.length > 0) {

        var dmi = that.getSeries(high, low, close, 1, infChart.indicatorDefaults.EXPONENTIALMOVINGAVERAGE, that.params.period);
        var _dmi = that.merge(data, dmi);
        this.series[0].setData(_dmi, false, false, false);

        if (redraw) {
            var chart = this.chart;
            chart.redraw();
        }
    }
};

infChart.DirectionalMovementPlusIndicator.prototype.getSeries = function (hts, lts, cts, grn, ma, nocp) {

    return this.dmi(hts, lts, cts, grn, ma, nocp);
};

//endregion **************************************Directional Movement Plus Indicator (DMI+) Indicator******************************************


//region ************************************** Directional Movement Minus Indicator (DMI-) Indicator******************************************

/***
 * Constructor for Directional Movement Minus Indicator (DMI-) Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
 infChart.DirectionalMovementMinusIndicator = function (id, chartId, type, chartInstance) {

    infChart.Indicator.apply(this, arguments);

    this.params.period = 14;
    this.axisId = "#DMIM_" + id;

    this.addAxis({
        id: this.axisId,
        startOnTick: false,
        endOnTick: false
    });


    this.series[0] = chartInstance.addSeries({
        "id": id,
        infIndType: "DMIM",
        infIndSubType: "DMIM",
        /* data: [],*/
        infType: "indicator",
        "yAxis": this.axisId,
        showInLegend: false,
        "name": "DMIM"
    }, true);

};

infChart.util.extend(infChart.Indicator, infChart.DirectionalMovementMinusIndicator);

infChart.DirectionalMovementMinusIndicator.prototype.calculate = function (ohlc, data, redraw) {
    var high = ohlc.h,
        low = ohlc.l,
        close = ohlc.c;
    var that = this;

    if (data && data.length > 0) {

        var dmi = that.getSeries(high, low, close, 2, infChart.indicatorDefaults.EXPONENTIALMOVINGAVERAGE, that.params.period);
        var _dmi = that.merge(data, dmi);
        this.series[0].setData(_dmi, false, false, false);

        if (redraw) {
            var chart = this.chart;
            chart.redraw();
        }
    }
};

infChart.DirectionalMovementMinusIndicator.prototype.getSeries = function (hts, lts, cts, grn, ma, nocp) {

    return this.dmi(hts, lts, cts, grn, ma, nocp);
};

//endregion **************************************Directional Movement Minus Indicator (DMI-) Indicator******************************************
//region ************************************** On Balance Volume (OBV) Indicator******************************************

/***
 * Constructor for On Balance Volume (OBV) Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
 infChart.OnBalanceVolumeIndicator = function (id, chartId, type, chartInstance) {

    infChart.Indicator.apply(this, arguments);

    this.axisId = "#OBV_" + id;

    var colors = infChart.util.getSeriesColors();

    this.addAxis({
        id: this.axisId,
        startOnTick: false,
        endOnTick: false
    });

    this.series[0] = chartInstance.addSeries({
        id: id,
        infIndType: "OBV",
        infIndSubType: "OBV",
        name: "OBV",
        /* data: [],*/
        infType: "indicator",
        yAxis: this.axisId,
        showInLegend: false,
        color: colors[0],
        lineColor: colors[0]
    }, false);

    this.series[1] = chartInstance.addSeries({
        "id": id + "_OBV2",
        infIndType: "OBV",
        infIndSubType: "OBV2",
        /* data: [],*/
        infType: "indicator",
        "yAxis": this.axisId,
        showInLegend: false,
        "name": "OBV2",
        color: colors[1],
        lineColor: colors[1]
    }, true);

};

infChart.util.extend(infChart.Indicator, infChart.OnBalanceVolumeIndicator);

infChart.OnBalanceVolumeIndicator.prototype.calculate = function (ohlc, data, redraw) {
    var high = ohlc.h,
        low = ohlc.l,
        close = ohlc.c,
        volume = ohlc.v;
    var that = this;

    if (data && data.length > 0) {
        infChart.util.forEach(this.series, function (i, series) {
            switch (series.options.infIndSubType) {
                case 'OBV':
                    var obv = that.getSeries(high, low, close, volume, 1, infChart.indicatorDefaults.ULCLOSEPRICE, infChart.indicatorDefaults.EXPONENTIALMOVINGAVERAGE, 14);
                    var _obv = that.merge(data, obv);
                    series.setData(_obv, false, false, false);
                    break;
                case 'OBV2':
                    var obv2 = that.getSeries(high, low, close, volume, 2, infChart.indicatorDefaults.ULCLOSEPRICE, infChart.indicatorDefaults.EXPONENTIALMOVINGAVERAGE, 14);
                    var _obv2 = that.merge(data, obv2);
                    series.setData(_obv2, redraw, false, false);
                    break;
                default :
                    break;
            }
        });

        if (redraw) {
            var chart = this.chart;
            chart.redraw();
        }
    }
};

infChart.OnBalanceVolumeIndicator.prototype.getSeries = function (hts, lts, cts, vts, grn, ul, ma, nocp) {
    var ts, obv, k;
    ts = this.movul(hts, lts, cts, undefined, ul);
    obv = new Array(ts.length);
    obv[0] = 0;
    for (k = 1; k < obv.length; k++) {
        if (ts[k - 1] < ts[k])
            obv[k] = obv[k - 1] + vts[k];
        else if (ts[k] < ts[k - 1])
            obv[k] = obv[k - 1] - vts[k];
        else
            obv[k] = obv[k - 1];
    }
    if (grn == 1)
        return obv;
    return this.movmean(obv, ma, nocp);
};

//endregion **************************************On Balance Volume (OBV) Indicator******************************************
//region ************************************** On Rate of Change (ROC) Indicator******************************************

/***
 * Constructor for Rate of Change (ROC) Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
 infChart.RateOfChangeIndicator = function (id, chartId, type, chartInstance) {

    infChart.Indicator.apply(this, arguments);

    this.params.period = 14;
    this.axisId = "#ROC_" + id;

    var colors = infChart.util.getSeriesColors();

    this.addAxis({
        id: this.axisId,
        startOnTick: false,
        endOnTick: false
    });


    this.series[0] = chartInstance.addSeries({
        id: id,
        name: "ROC",
        infIndType: "ROC",
        infIndSubType: "ROC",
        /* data: [],*/
        infType: "indicator",
        yAxis: this.axisId,
        showInLegend: false,
        color: colors[1],
        lineColor: colors[1]
    }, true);


};

infChart.util.extend(infChart.Indicator, infChart.RateOfChangeIndicator);

infChart.RateOfChangeIndicator.prototype.calculate = function (ohlc, data, redraw) {
    var high = ohlc.h,
        low = ohlc.l,
        close = ohlc.c,
        open = ohlc.o;
    if (data && data.length > 0) {
        var chart = this.chart;
        var roc = this.getSeries(high, low, close, open, infChart.indicatorDefaults.ULCLOSEPRICE, this.params.period);
        var _roc = this.merge(data, roc);
        chart.get(this.id).setData(_roc, redraw, false, false);
    }
};

infChart.RateOfChangeIndicator.prototype.getSeries = function (hts, lts, cts, ots, ul, nocp) {

    return this.roc(hts, lts, cts, ots, ul, nocp);
};

//endregion **************************************Rate of Change (ROC) Indicator******************************************


//region ************************************** Simple Moving Average (SMA) Indicator******************************************

/***
 * Constructor for Simple Moving Average (SMA)  Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
 infChart.SimpleMovingAverageIndicator = function (id, chartId, type, chartInstance) {

    infChart.Indicator.apply(this, arguments);

    this.params.period = 21;
    this.params.shift = 0;
    this.titleParams = ["period", "shift"];

    var color = infChart.util.getNextSeriesColor(chartId);

    this.series[0] = chartInstance.addSeries({
        id: id,
        infIndType: "SMA",
        infIndSubType: "SMA",
        name: "SMA",
        /* data: [],*/
        infType: "indicator",
        yAxis: "#0",
        color: color,
        lineColor: color,
        showInNavigator: false
    }, true);


};

infChart.util.extend(infChart.Indicator, infChart.SimpleMovingAverageIndicator);

infChart.SimpleMovingAverageIndicator.prototype.calculate = function (ohlc, data, redraw) {
    var close = ohlc.c;
    if (data && data.length > 0) {
        var chart = this.chart;
        var sma = this.getSeries(close, infChart.indicatorDefaults.ARITHMETICMOVINGAVERAGE, this.params.period, this.params.shift);
        var _sma = this.merge(data, sma);
        chart.get(this.id).setData(_sma, redraw, false, false);
    }
};

infChart.SimpleMovingAverageIndicator.prototype.getSeries = function (ts, ma, m, shift) {
    var retval = this.movmean(ts, ma, m);

    if (shift > 0) {
        var k = 0;
        for (k = 1; k < retval.length; k++) {
            retval[k] = +shift + retval[k];
        }
    }
    return retval;
};

//endregion **************************************Simple Moving Average (SMA) Indicator******************************************
//region ************************************** Envelopes (ENV) Indicator******************************************

/***
 * Constructor for Envelopes (ENV)  Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
 infChart.EnvelopesIndicator = function (id, chartId, type, chartInstance) {

    infChart.Indicator.apply(this, arguments);

    this.params.period = 21;
    this.params.shift1 = 2.5;
    this.params.shift2 = -2.5;
    this.titleParams = ["period", "shift1", "shift2"];
    this.titleParamsDec = [0, 1, 1];

    var color = infChart.util.getNextSeriesColor(chartId);


    this.series[1] = chartInstance.addSeries({
        id: id + '_ENVU',
        infIndType: "ENV",
        infIndSubType: "ENVU",
        name: "Upper",
        type: "line",
        /* data: [],*/
        color: color,
        lineColor: color,
        infType: "indicator",
        yAxis: "#0",
        zIndex: 3,
        fillOpacity: 0.5,
        hideLegend: true,
        showInLegend: false,
        enableMouseTracking: true,
        states: {
            hover: {
                enabled: false
            }
        }
    }, false);


    this.series[2] = chartInstance.addSeries({
        id: id + '_ENVL',
        infIndType: "ENV",
        infIndSubType: "ENVL",
        name: "Lower",
        type: "line",
        /* data: [],*/
        color: color,
        lineColor: color,
        infType: "indicator",
        yAxis: "#0",
        zIndex: 3,
        fillOpacity: 0.5,
        hideLegend: true,
        showInLegend: false,
        enableMouseTracking: true,
        states: {
            hover: {
                enabled: false
            }
        }
    }, false);

    this.series[0] = chartInstance.addSeries({
        id: id,
        infIndType: "ENV",
        infIndSubType: "ENV",
        name: "ENV",
        type: "arearange",
        /* data: [],*/
        infType: "indicator",
        yAxis: "#0",
        zIndex: 3,
        fillOpacity: 0.5,
        color: color,
        lineColor: color,
        hideToolTip: true,
        enableMouseTracking: true,
        states: {
            hover: {
                enabled: false
            }
        }
    }, true);
    this.style[this.series[0].options.id] = ["arearange"];

};

infChart.util.extend(infChart.Indicator, infChart.EnvelopesIndicator);

infChart.EnvelopesIndicator.prototype.calculate = function (ohlc, data, redraw) {
    var close = ohlc.c;
    if (data && data.length > 0) {
        var chart = this.chart;
        var env = this.getSeries(close, infChart.indicatorDefaults.ARITHMETICMOVINGAVERAGE, this.params.period, this.params.shift1, this.params.shift2);
        var _env = this.merge(data, env.upper, env.lower);
        chart.get(this.id).setData(_env, redraw, false, false);

        var _envU = this.merge(data, env.upper);
        chart.get(this.id + "_ENVU").setData(_envU, redraw, false, false);

        var _envL = this.merge(data, env.lower);
        chart.get(this.id + "_ENVL").setData(_envL, redraw, false, false);
    }
};

infChart.EnvelopesIndicator.prototype.getSeries = function (ts, ma, m, shift1, shift2) {
    var retval = this.movmean(ts, ma, m), upper = new Array(retval.length), lower = new Array(retval.length);

    var k = 0;
    for (k = 0; k < retval.length; k++) {
        upper[k] = retval[k] + (retval[k] * (+shift1) / 100);
        lower[k] = retval[k] + (retval[k] * (+shift2) / 100);
    }
    return {upper: upper, lower: lower};
};

//endregion **************************************Envelopes (ENV) Indicator******************************************
//region ************************************** Ultimate Oscillator (UO) Indicator******************************************

/***
 * Constructor for Ultimate Oscillator (UO)  Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
 infChart.UltimateOscillatorIndicator = function (id, chartId, type, chartInstance) {

    infChart.Indicator.apply(this, arguments);

    this.params.period1 = 7;
    this.params.period2 = 14;
    this.params.period3 = 28;
    this.titleParams = ["period1", "period2", "period3"];
    this.axisId = "#UO_" + id;

    var colors = infChart.util.getSeriesColors();

    this.addAxis({
        id: this.axisId,
        min: 0,
        max: 1,
        plotLines: [{
            "value": 1,
            "color": "#888888",
            "dashStyle": "shortdash",
            "width": 1,
            "zIndex": 3
        }, {
            "value": 0.5,
            "color": "#888888",
            "dashStyle": "shortdash",
            "width": 1,
            "zIndex": 3
        }, {
            "value": 0,
            "color": "#888888",
            "dashStyle": "shortdash",
            "width": 1,
            "zIndex": 3
        }],
        startOnTick: false,
        endOnTick: false
    });


    this.series[0] = chartInstance.addSeries({
        id: id,
        infIndType: "UO",
        infIndSubType: "UO",
        name: "UO",
        /* data: [],*/
        infType: "indicator",
        yAxis: this.axisId,
        showInLegend: false,
        color: colors[1],
        lineColor: colors[1]
    }, true);


};

infChart.util.extend(infChart.Indicator, infChart.UltimateOscillatorIndicator);

infChart.UltimateOscillatorIndicator.prototype.calculate = function (ohlc, data, redraw) {
    var high = ohlc.h,
        low = ohlc.l,
        close = ohlc.c;
    if (data && data.length > 0) {
        var chart = this.chart;
        var uo = this.getSeries(high, low, close, infChart.indicatorDefaults.ARITHMETICMOVINGAVERAGE, this.params.period1, this.params.period2, this.params.period3);
        var _uo = this.merge(data, uo);
        chart.get(this.id).setData(_uo, redraw, false, false);
    }
};

infChart.UltimateOscillatorIndicator.prototype.getSeries = function (hts, lts, cts, ma, nocp1, nocp2, nocp3) {
    var mbp, mtr, abp1, abp2, abp3, atr1, atr2, atr3, uo, k;
    mbp = this.bp(lts, cts);
    mtr = this.tr(hts, lts, cts);
    abp1 = this.movmean(mbp, ma, nocp1);
    abp2 = this.movmean(mbp, ma, nocp2);
    abp3 = this.movmean(mbp, ma, nocp3);
    atr1 = this.movmean(mtr, ma, nocp1);
    atr2 = this.movmean(mtr, ma, nocp2);
    atr3 = this.movmean(mtr, ma, nocp3);
    uo = new Array(mbp.length);
    for (k = 0; k < uo.length; k++)
        if (atr1[k] < infChart.indicatorConst._EPSDENOM_) {
            uo[k] = 1.0;
        } else {
            uo[k] = (4 * abp1[k] / atr1[k] + 2.0 * abp2[k] / atr2[k] + abp3[k] / atr3[k]) * infChart.indicatorConst.ONEOSEVEN;
        }
    return uo;
};

//endregion **************************************Ultimate Oscillator (UO) Indicator******************************************
//region ************************************** Williams´ %R (WPR) Indicator******************************************

/***
 * Constructor for Williams´ %R (WPR)  Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
 infChart.WilliamsPRIndicator = function (id, chartId, type, chartInstance) {

    infChart.Indicator.apply(this, arguments);

    this.axisId = "#WPR_" + id;
    this.params.lowerLevel = -0.8;
    this.params.upperLevel = -0.2;
    this.params.period = 14;
    this.titleParams = ["period", "lowerLevel", "upperLevel"];
    this.titleParamsDec = [0, 1, 1];

    var colors = infChart.util.getSeriesColors();
    var upColor = infChart.util.getDefaultUpColor();
    var downColor = infChart.util.getDefaultDownColor();

    this.addAxis({
        id: this.axisId,
        min: -1,
        max: 0,
        "plotLines": [
            {
                "value": -0.5,
                "color": "#888888",
                "dashStyle": "shortdash",
                "width": 1,
                "zIndex": 3
            }],
        startOnTick: false,
        endOnTick: false
    });


    this.series[1] = chartInstance.addSeries({
        "id": id + "_WPR3",
        infIndType: "WPR",
        infIndSubType: "WPR3",
        /* data: [],*/
        infType: "indicator",
        "yAxis": this.axisId,
        "name": "Upper",
        "color": upColor,
        "lineColor": upColor,
        "type": "arearange",
        hideLegend: true,
        hideToolTip: true,
        infRecal: true,
        showInLegend: false,
        enableMouseTracking: true,
        states: {
            hover: {
                enabled: false
            }
        }
    }, false);

    this.series[2] = chartInstance.addSeries({
        "id": id + "_WPR4",
        infIndType: "WPR4",
        infIndSubType: "WPR4",
        /* data: [],*/
        infType: "indicator",
        "yAxis": this.axisId,
        "name": "Lower",
        "color": downColor,
        "lineColor": downColor,
        "type": "arearange",
        hideLegend: true,
        hideToolTip: true,
        infRecal: true,
        showInLegend: false,
        enableMouseTracking: true,
        states: {
            hover: {
                enabled: false
            }
        }
    }, false);


    this.series[0] = chartInstance.addSeries({
        id: id,
        infIndType: "WPR",
        infIndSubType: "WPR",
        name: "WPR",
        /* data: [],*/
        infType: "indicator",
        yAxis: this.axisId,
        showInLegend: false,
        color: colors[1],
        lineColor: colors[1],
        enableMouseTracking: true,
        states: {
            hover: {
                enabled: false
            }
        }
    }, true);

    this.style[this.series[1].options.id] = ["line", "arearange"];
    this.style[this.series[2].options.id] = ["line", "arearange"];
};

infChart.util.extend(infChart.Indicator, infChart.WilliamsPRIndicator);

infChart.WilliamsPRIndicator.prototype.calculate = function (ohlc, data, redraw, seriesId) {
    var high = ohlc.h,
        low = ohlc.l,
        close = ohlc.c;

    if (data && data.length > 0) {
        var chart = this.chart;
        if (!seriesId) {
            var wpr = this.getSeries(high, low, close, infChart.indicatorDefaults.ULCLOSEPRICE, this.params.period);
            var _wpr = this.merge(data, wpr);
            chart.get(this.id).setData(_wpr, redraw, false, false);
        }
        if (!seriesId || seriesId == (this.id + '_WPR3')) {
            var series = chart.get(this.id + '_WPR3');
            if (series.options.type === "line") {
                series.setData(this.getBand(data, series.options.type, this.params.upperLevel, this.params.upperLevel), redraw, false, false);
            } else {
                series.setData(this.getBand(data, series.options.type, 0, this.params.upperLevel), redraw, false, false);
            }
        }
        if (!seriesId || seriesId == (this.id + '_WPR4')) {
            var series4 = chart.get(this.id + '_WPR4');
            if (series4.options.type === "line") {
                series4.setData(this.getBand(data, series4.options.type, this.params.lowerLevel, this.params.lowerLevel), redraw, false, false);
            } else {
                series4.setData(this.getBand(data, series4.options.type, this.params.lowerLevel, -1), redraw, false, false);
            }
        }
    }

};

infChart.WilliamsPRIndicator.prototype.getSeries = function (hts, lts, cts, ul, nocp) {
    var denom, wpr, mh, ml, k;
    wpr = this.movul(hts, lts, cts, undefined, ul).slice(0);
    mh = this.movmax(hts, nocp);
    ml = this.movmin(lts, nocp);
    for (k = 0; k < wpr.length; k++) {
        denom = mh[k] - ml[k];
        if (denom < infChart.indicatorConst._EPSDENOM_) {
            wpr[k] = -1.0;
        } else {
            wpr[k] = (wpr[k] - mh[k]) / denom;
        }
    }
    return wpr;
};

infChart.WilliamsPRIndicator.prototype.getContextMenuOptions = function (chartId, series, options) {
    return {
        "removeIndicator": {
            icon : options.removeIndicator.icon,
            displayText :options.removeIndicator.displayText,
            action : function () {
                let indicator = infChart.indicatorMgr.getIndicatorBySeriesId(chartId, series.options.id);
                infChart.manager.removeSeries(series.chart.renderTo.id, indicator.id, series.options.infType);
            }
        }
    }
};

/**
 * hide indicator
 */
infChart.WilliamsPRIndicator.prototype.hideIndicator = function (seriesId) {
    infChart.Indicator.prototype.hideIndicator.apply(this, [seriesId, true]);
};

/**
 * show indicator
 */
infChart.WilliamsPRIndicator.prototype.showIndicator = function (seriesId) {
    infChart.Indicator.prototype.showIndicator.apply(this, [seriesId, true]);
};

//endregion **************************************Williams´ %R (WPR) Indicator******************************************
//region ************************************** Money Flow Index (MFI) Indicator******************************************

/***
 * Constructor for Money Flow Index (MFI)  Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
 infChart.MoneyFlowIndexIndicator = function (id, chartId, type, chartInstance) {

    infChart.Indicator.apply(this, arguments);

    this.axisId = "#MFI_" + id;

    var colors = infChart.util.getSeriesColors();
    var downColor = infChart.util.getDefaultDownColor();

    this.addAxis({
        id: this.axisId,
        plotLines: [{
            "value": 0.8,
            "color": downColor,
            "dashStyle": "shortdash",
            "width": 1,
            "zIndex": 3
        }, {
            "value": 0.2,
            "color": downColor,
            "dashStyle": "shortdash",
            "width": 1,
            "zIndex": 3
        }],
        min: 0,
        max: 1,
        startOnTick: false,
        endOnTick: false
    });

    this.series[0] = chartInstance.addSeries({
        id: id,
        infIndType: "MFI",
        infIndSubType: "MFI",
        name: "MFI",
        /* data: [],*/
        infType: "indicator",
        yAxis: this.axisId,
        showInLegend: false,
        color: colors[1],
        lineColor: colors[1]
    }, true);


};

infChart.util.extend(infChart.Indicator, infChart.MoneyFlowIndexIndicator);

infChart.MoneyFlowIndexIndicator.prototype.calculate = function (ohlc, data, redraw) {
    var high = ohlc.h,
        low = ohlc.l,
        close = ohlc.c,
        volume = ohlc.v;
    if (data && data.length > 0) {
        var chart = this.chart;
        var mfi = this.getSeries(high, low, close, volume, infChart.indicatorDefaults.ULCLOSEPRICE, infChart.indicatorDefaults.EXPONENTIALMOVINGAVERAGE, 14);
        var _mfi = this.merge(data, mfi);
        // chart.get(this.id).setData(_mfi, redraw, false, false);
        this.series[0].setData(_mfi, redraw, false, false);
    }
};

infChart.MoneyFlowIndexIndicator.prototype.getSeries = function (hts, lts, cts, vts, ul, ma, nocp) {
    var ts, apmf, anmf, mfi, k;
    ts = this.movul(hts, lts, cts, undefined, ul);
    apmf = new Array(ts.length);
    anmf = new Array(ts.length);
    mfi = new Array(ts.length);
    apmf[0] = anmf[0] = 0;
    for (k = 1; k < apmf.length; k++) {
        if (ts[k - 1] < ts[k]) {
            apmf[k] = ts[k] * vts[k];
            anmf[k] = 0;
        } else if (ts[k - 1] == ts[k]) {
            apmf[k] = 0;
            anmf[k] = 0;
        } else {
            apmf[k] = 0;
            anmf[k] = ts[k] * vts[k];
        }
    }
    apmf = this.movmean(apmf, ma, nocp);
    anmf = this.movmean(anmf, ma, nocp);
    for (k = 0; k < mfi.length; k++)
        if (anmf[k] < infChart.indicatorConst._EPSDENOM_) {
            mfi[k] = 1.0;
        } else {
            mfi[k] = 1.0 - 1.0 / (1.0 + apmf[k] / anmf[k]);
        }
    return mfi;
};

//endregion **************************************Money Flow Index (MFI) Indicator******************************************s
//region ************************************** Chaikin Oscillator (CHO) Indicator******************************************

/***
 * Constructor for Chaikin Oscillator (CHO)  Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
 infChart.ChaikinOscillatorIndicator = function (id, chartId, type, chartInstance) {

    infChart.Indicator.apply(this, arguments);

    this.axisId = "#CHO_" + id;

    var colors = infChart.util.getSeriesColors();

    this.addAxis({
        id: this.axisId,
        startOnTick: false,
        endOnTick: false
    });


    this.series[0] = chartInstance.addSeries({
        id: id,
        infIndType: "CHO",
        infIndSubType: "CHO",
        name: "CHO",
        /* data: [],*/
        infType: "indicator",
        yAxis: this.axisId,
        showInLegend: false,
        color: colors[0],
        lineColor: colors[0]
    }, true);


};

infChart.util.extend(infChart.Indicator, infChart.ChaikinOscillatorIndicator);

infChart.ChaikinOscillatorIndicator.prototype.calculate = function (ohlc, data, redraw) {
    var open = ohlc.o,
        high = ohlc.h,
        low = ohlc.l,
        close = ohlc.c,
        volume = ohlc.v;
    if (data && data.length > 0) {
        var chart = this.chart;
        var cho = this.getSeries(open, high, low, close, volume, infChart.indicatorDefaults.ADL_COEFF_WITH_CLOSE_PRICES, infChart.indicatorDefaults.EXPONENTIALMOVINGAVERAGE, 10,
            3);
        var _cho = this.merge(data, cho);
        chart.get(this.id).setData(_cho, redraw, false, false);
    }
};

infChart.ChaikinOscillatorIndicator.prototype.getSeries = function (ots, hts, lts, cts, vts, coeff, ma, nocp1, nocp2) {
    var adl, cho, aadl2, k;
    adl = this.adl(ots, hts, lts, cts, vts, 1, coeff, infChart.indicatorDefaults.ARITHMETICMOVINGAVERAGE, 1);
    cho = this.movmean(adl, ma, nocp1);
    aadl2 = this.movmean(adl, ma, nocp2);
    for (k = 0; k < cho.length; k++)
        cho[k] = cho[k] - aadl2[k];
    return cho;
};

//endregion **************************************Chaikin Oscillator (CHO) Indicator******************************************

//region **************************************Fast Stochastic Oscillator(STOF) Indicator******************************************

/***
 * Constructor for Fast Stochastic (STOF) Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
 infChart.FastStochasticOscillatorIndicator = function (id, chartId, type, chartInstance) {

    infChart.Indicator.apply(this, arguments);

    this.axisId = "#STOF_" + id;
    this.params.lowerLevel = 0.3;
    this.params.upperLevel = 0.7;
    this.params.kperiod = 14;
    this.params.dperiod = 3;
    this.titleParams = ["kperiod", "dperiod", "upperLevel", "lowerLevel"];
    this.titleParamsDec = [0, 0, 1, 1];

    var colors = infChart.util.getSeriesColors();
    var upColor = infChart.util.getDefaultUpColor();
    var downColor = infChart.util.getDefaultDownColor();

    this.addAxis({
        id: this.axisId,
        min: 0,
        max: 1,
        floor: 0,
        ceiling: 1,
        startOnTick: false,
        endOnTick: false
    });


    this.series[2] = chartInstance.addSeries({
        "id": id + "_STOF3",
        infIndType: "STOF",
        infIndSubType: "STOF3",
        /* data: [],*/
        infType: "indicator",
        "yAxis": this.axisId,
        "name": "Upper",
        "color": upColor,
        "lineColor": upColor,
        "type": "arearange",
        hideLegend: true,
        infRecal: true,
        hideToolTip: true,
        showInLegend: false,
        enableMouseTracking: true,
        states: {
            hover: {
                enabled: false
            }
        }
    }, false);

    this.series[3] = chartInstance.addSeries({
        "id": id + "_STOF4",
        infIndType: "STOF",
        infIndSubType: "STOF4",
        /* data: [],*/
        infType: "indicator",
        "yAxis": this.axisId,
        "name": "Lower",
        "color": downColor,
        "lineColor": downColor,
        "type": "arearange",
        hideLegend: true,
        infRecal: true,
        hideToolTip: true,
        showInLegend: false,
        enableMouseTracking: true,
        states: {
            hover: {
                enabled: false
            }
        }
    }, false);


    this.series[0] = chartInstance.addSeries({
        id: id,
        infIndType: "STOF",
        infIndSubType: "STOF",
        name: "STOF",
        /* data: [],*/
        infType: "indicator",
        yAxis: this.axisId,
        showInLegend: false,
        color: colors[5],
        lineColor: colors[5],
        enableMouseTracking: true,
        states: {
            hover: {
                enabled: false
            }
        }
    }, false);

    this.series[1] = chartInstance.addSeries({
        "id": id + "_STOF2",
        infIndType: "STOF",
        infIndSubType: "STOF2",
        /* data: [],*/
        infType: "indicator",
        "yAxis": this.axisId,
        showInLegend: false,
        "name": "STOF2",
        "color": colors[1],
        "lineColor": colors[1],
        enableMouseTracking: true,
        states: {
            hover: {
                enabled: false
            }
        }
    }, true);

    this.style[this.series[2].options.id] = ["line", "arearange"];
    this.style[this.series[3].options.id] = ["line", "arearange"];
};

infChart.util.extend(infChart.Indicator, infChart.FastStochasticOscillatorIndicator);

infChart.FastStochasticOscillatorIndicator.prototype.calculate = function (ohlc, data, redraw, seriesId) {
    var high = ohlc.h,
        low = ohlc.l,
        close = ohlc.c;
    if (data && data.length > 0) {
        var chart = this.chart;
        if (!seriesId) {
            var stof = this.getSeries(high, low, close, 1, infChart.indicatorDefaults.ULCLOSEPRICE, infChart.indicatorDefaults.EXPONENTIALMOVINGAVERAGE, this.params.kperiod, this.params.dperiod);
            var stof2 = this.getSeries(high, low, close, 2, infChart.indicatorDefaults.ULCLOSEPRICE, infChart.indicatorDefaults.EXPONENTIALMOVINGAVERAGE, this.params.kperiod, this.params.dperiod);
            var _stof = this.merge(data, stof);
            var _stof2 = this.merge(data, stof2);
            var _stofSeries = chart.get(this.id);
            var _sto2fSeries = chart.get(this.id + '_STOF2');
            _stofSeries && _stofSeries.setData(_stof, false, false, false);
            _sto2fSeries && _sto2fSeries.setData(_stof2, false, false, false);
            //chart.get(this.id + '_STOF4').setData(this.getBand(data, this.params.lowerLevel, 0), false);
        }
        if (!seriesId || seriesId == (this.id + '_STOF3')) {
            var series = chart.get(this.id + '_STOF3');
            if (series.options.type === "line") {
                series.setData(this.getBand(data, series.options.type, this.params.upperLevel, this.params.upperLevel), redraw, false, false);
            } else {
                series.setData(this.getBand(data, series.options.type, 1, this.params.upperLevel), redraw, false, false);
            }
        }
        if (!seriesId || seriesId == (this.id + '_STOF4')) {
            var series4 = chart.get(this.id + '_STOF4');
            if (series4.options.type === "line") {
                series4.setData(this.getBand(data, series4.options.type, this.params.lowerLevel, this.params.lowerLevel), redraw, false, false);
            } else {
                series4.setData(this.getBand(data, series4.options.type, this.params.lowerLevel, 0), redraw, false, false);
            }
        }
    }


};

infChart.FastStochasticOscillatorIndicator.prototype.getSeries = function (hts, lts, cts, grn, ul, ma, nocp1, nocp2) {
    return this.pk(hts, lts, cts, undefined, grn, ul, ma, nocp1, nocp2)
};

infChart.FastStochasticOscillatorIndicator.prototype.removeSeries = function (seriesId, isPropertyChange) {
    this.hideIndicator(seriesId);
    infChart.Indicator.prototype.removeSeries.apply(this, arguments);
};

/**
 * hide indicator
 * @param {string} seriesId - series id
 */
infChart.FastStochasticOscillatorIndicator.prototype.hideIndicator = function (seriesId) {
    let seriesList = this._getRelevantSeries(seriesId);

    if (seriesList.remainingSeries && seriesList.remainingSeries.visible) {
        seriesList.selectedSeries.hide();
    } else {
        infChart.util.forEach(this.series, function (i, series) {
            series.hide();
        });
    }

    infChart.manager.getChart(this.chartId)._onPropertyChange("indicators");
};

/**
 * show indicator
 * @param {string} seriesId - series id
 */
infChart.FastStochasticOscillatorIndicator.prototype.showIndicator = function (seriesId) {
    let seriesList = this._getRelevantSeries(seriesId);

    if (seriesList.remainingSeries && seriesList.remainingSeries.visible) {
        seriesList.selectedSeries.show();
    } else {
        infChart.util.forEach(this.series, function (i, series) {
            if (!seriesList.remainingSeries || seriesList.remainingSeries.options.id !== series.options.id) {
                series.show();
            }
        });
    }

    infChart.manager.getChart(this.chartId)._onPropertyChange("indicators");
};

/**
 * get relevant series
 * @param seriesId
 * @private
 */
infChart.FastStochasticOscillatorIndicator.prototype._getRelevantSeries = function (seriesId) {
    let seriesList = {};

    let mainIndicator = this.series[0].name === "STOF" ? this.series[0] : undefined;
    let secondaryIndicator = this.series[1] && this.series[1].name === "STOF2" ? this.series[1] : this.series[0].name === "STOF2" ? this.series[0] : undefined;

    if (mainIndicator && mainIndicator.userOptions.id === seriesId) {
        seriesList = {
            selectedSeries: mainIndicator,
            remainingSeries: secondaryIndicator
        }
    } else {
        seriesList = {
            selectedSeries: secondaryIndicator,
            remainingSeries: mainIndicator
        }
    }

    return seriesList;
};

//endregion **************************************Fast Stochastic Oscillator(STOF) Indicator******************************************

//region ************************************** Slow Stochastic Oscillator(STOS) Indicator******************************************

/***
 * Constructor for Ultimate Oscillator (UO)  Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
 infChart.SlowStochasticOscillatorIndicator = function (id, chartId, type, chartInstance) {

    infChart.Indicator.apply(this, arguments);

    this.params.upperLevel = 0.8;
    this.params.lowerLevel = 0.2;

    this.params.kperiod = 14;
    this.params.dperiod = 3;
    this.titleParams = ["kperiod", "dperiod", "upperLevel", "lowerLevel"];
    this.titleParamsDec = [0, 0, 1, 1];
    this.axisId = "#STOS_" + id;

    var colors = infChart.util.getSeriesColors();
    var upColor = infChart.util.getDefaultUpColor();
    var downColor = infChart.util.getDefaultDownColor();

    this.addAxis({
        id: this.axisId,
        min: 0,
        max: 1,
        "plotLines": [{
            "value": 0.5,
            "color": "#888888",
            "dashStyle": "shortdash",
            "width": 1,
            "zIndex": 3
        }],
        startOnTick: false,
        endOnTick: false
    });


    this.series[2] = chartInstance.addSeries({
        "id": id + "_STOS3",
        infIndType: "STOS",
        infIndSubType: "STOS3",
        /* data: [],*/
        infType: "indicator",
        "yAxis": this.axisId,
        "name": "Upper",
        "color": upColor,
        "lineColor": upColor,
        "type": "arearange",
        hideLegend: true,
        hideToolTip: true,
        infRecal: true,
        showInLegend: false,
        enableMouseTracking: true,
        states: {
            hover: {
                enabled: false
            }
        }
    }, false);

    this.series[3] = chartInstance.addSeries({
        "id": id + "_STOS4",
        infIndType: "STOS",
        infIndSubType: "STOS4",
        /* data: [],*/
        infType: "indicator",
        "yAxis": this.axisId,
        "name": "Lower",
        "color": downColor,
        "lineColor": downColor,
        "type": "arearange",
        hideLegend: true,
        hideToolTip: true,
        showInLegend: false,
        enableMouseTracking: true,
        states: {
            hover: {
                enabled: false
            }
        }
    }, false);

    this.series[0] = chartInstance.addSeries({
        id: id,
        infIndType: "STOS",
        infIndSubType: "STOS",
        name: "STOS",
        /* data: [],*/
        infType: "indicator",
        yAxis: this.axisId,
        showInLegend: false,
        color: colors[1],
        lineColor: colors[1],
        enableMouseTracking: true,
        states: {
            hover: {
                enabled: false
            }
        }
    }, false);

    this.series[1] = chartInstance.addSeries({
        "id": id + "_STOS2",
        infIndType: "STOS",
        infIndSubType: "STOS2",
        /* data: [],*/
        infType: "indicator",
        "yAxis": this.axisId,
        showInLegend: false,
        "name": "STOS2",
        "color": colors[2],
        "lineColor": colors[2],
        enableMouseTracking: true,
        states: {
            hover: {
                enabled: false
            }
        }
    }, true);

    this.style[this.series[2].options.id] = ["line", "arearange"];
    this.style[this.series[3].options.id] = ["line", "arearange"];

};

infChart.util.extend(infChart.Indicator, infChart.SlowStochasticOscillatorIndicator);

infChart.SlowStochasticOscillatorIndicator.prototype.calculate = function (ohlc, data, redraw, seriesId) {
    var high = ohlc.h,
        low = ohlc.l,
        close = ohlc.c;
    if (data && data.length > 0) {
        var chart = this.chart;
        if (!seriesId) {
            var stos = this.getSeries(high, low, close, 0, infChart.indicatorDefaults.ULCLOSEPRICE, infChart.indicatorDefaults.EXPONENTIALMOVINGAVERAGE, this.params.kperiod, this.params.dperiod, 3);
            var stos2 = this.getSeries(high, low, close, 1, infChart.indicatorDefaults.ULCLOSEPRICE, infChart.indicatorDefaults.EXPONENTIALMOVINGAVERAGE, this.params.kperiod, this.params.dperiod, 3);
            var _stos = this.merge(data, stos);
            var _stos2 = this.merge(data, stos2);
            var _stosSeries = chart.get(this.id);
            var _stos2Series = chart.get(this.id + '_STOS2');

            _stosSeries && _stosSeries.setData(_stos, false, false, false);
            _stos2Series && _stos2Series.setData(_stos2, redraw, false, false);
        }
        if (!seriesId || seriesId == (this.id + '_STOS3')) {
            var series = chart.get(this.id + '_STOS3');
            if (series.options.type === "line") {
                series.setData(this.getBand(data, series.options.type, this.params.upperLevel, this.params.upperLevel), redraw, false, false);
            } else {
                series.setData(this.getBand(data, series.options.type, 1, this.params.upperLevel), redraw, false, false);
            }
        }
        if (!seriesId || seriesId == (this.id + '_STOS4')) {
            var series4 = chart.get(this.id + '_STOS4');
            if (series4.options.type === "line") {
                series4.setData(this.getBand(data, series4.options.type, this.params.lowerLevel, this.params.lowerLevel), redraw, false, false);
            } else {
                series4.setData(this.getBand(data, series4.options.type, this.params.lowerLevel, 0), redraw, false, false);
            }
        }
    }
};

infChart.SlowStochasticOscillatorIndicator.prototype.getSeries = function (hts, lts, cts, grn, ul, ma, nocp1, nocp2, nocp3) {
    var pd = this.pk(hts, lts, cts, undefined, 2, ul, ma, nocp1, nocp2);
    if (grn == 1)
        return pd;
    return this.movmean(pd, ma, nocp3);
};

infChart.SlowStochasticOscillatorIndicator.prototype.removeSeries = function (seriesId, isPropertyChange) {
    this.hideIndicator(seriesId);
    infChart.Indicator.prototype.removeSeries.apply(this, arguments);
};

/**
 * hide indicator
 * @param {string} seriesId - series id
 */
infChart.SlowStochasticOscillatorIndicator.prototype.hideIndicator = function (seriesId) {
    let seriesList = this._getRelevantSeries(seriesId);

    if (seriesList.remainingSeries && seriesList.remainingSeries.visible) {
        seriesList.selectedSeries.hide();
    } else {
        infChart.util.forEach(this.series, function (i, series) {
            series.hide();
        });
    }

    infChart.manager.getChart(this.chartId)._onPropertyChange("indicators");
};

/**
 * show indicator
 * @param {string} seriesId - series id
 */
infChart.SlowStochasticOscillatorIndicator.prototype.showIndicator = function (seriesId) {
    let seriesList = this._getRelevantSeries(seriesId);

    if (seriesList.remainingSeries && seriesList.remainingSeries.visible) {
        seriesList.selectedSeries.show();
    } else {
        infChart.util.forEach(this.series, function (i, series) {
            if (!seriesList.remainingSeries || seriesList.remainingSeries.options.id !== series.options.id) {
                series.show();
            }
        });
    }

    infChart.manager.getChart(this.chartId)._onPropertyChange("indicators");
};

/**
 * get relevant series
 * @param seriesId
 * @private
 */
infChart.SlowStochasticOscillatorIndicator.prototype._getRelevantSeries = function (seriesId) {
    let seriesList = {};

    let mainIndicator = this.series[0].name === "STOS" ? this.series[0] : undefined;
    let secondaryIndicator = this.series[1] && this.series[1].name === "STOS2" ? this.series[1] : this.series[0].name === "STOS2" ? this.series[0] : undefined;

    if (mainIndicator && mainIndicator.userOptions.id === seriesId) {
        seriesList = {
            selectedSeries: mainIndicator,
            remainingSeries: secondaryIndicator
        }
    } else {
        seriesList = {
            selectedSeries: secondaryIndicator,
            remainingSeries: mainIndicator
        }
    }

    return seriesList;
};


//endregion **************************************Slow Stochastic Oscillator(STOS) Indicator******************************************
//region ************************************** Full Stochastic Oscillator(FUSTO) Indicator******************************************

/***
 * Constructor for Full Stochastic Oscillator(FUSTO) Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
 infChart.FullStochasticOscillatorIndicator = function (id, chartId, type, chartInstance) {

    infChart.Indicator.apply(this, arguments);

    this.params.upperLevel = 0.8;
    this.params.lowerLevel = 0.2;

    this.params.kperiod = 3;
    this.params.dperiod = 3;
    this.params.speriod = 14;
    this.titleParams = ["kperiod", "dperiod", "speriod", "upperLevel", "lowerLevel"];
    this.titleParamsDec = [0, 0, 0, 1, 1];
    this.axisId = "#FUSTO_" + id;

    var colors = infChart.util.getSeriesColors();
    var upColor = infChart.util.getDefaultUpColor();
    var downColor = infChart.util.getDefaultDownColor();

    this.addAxis({
        id: this.axisId,
        min: 0,
        max: 1,
        "plotLines": [{
            "value": 0.5,
            "color": "#888888",
            "dashStyle": "shortdash",
            "width": 1,
            "zIndex": 3
        }],
        startOnTick: false,
        endOnTick: false
    });


    this.series[2] = chartInstance.addSeries({
        "id": id + "_FUSTO3",
        infIndType: "FUSTO",
        infIndSubType: "FUSTO3",
        /* data: [],*/
        infType: "indicator",
        "yAxis": this.axisId,
        "name": "Upper",
        "color": upColor,
        "lineColor": upColor,
        "type": "arearange",
        hideLegend: true,
        infRecal: true,
        hideToolTip: true,
        showInLegend: false,
        enableMouseTracking: true,
        states: {
            hover: {
                enabled: false
            }
        }
    }, false);

    this.series[3] = chartInstance.addSeries({
        "id": id + "_FUSTO4",
        infIndType: "FUSTO",
        infIndSubType: "FUSTO4",
        /* data: [],*/
        infType: "indicator",
        "yAxis": this.axisId,
        "name": "Lower",
        "color": downColor,
        "lineColor": downColor,
        "type": "arearange",
        hideLegend: true,
        hideToolTip: true,
        showInLegend: false,
        enableMouseTracking: true,
        states: {
            hover: {
                enabled: false
            }
        }
    }, false);


    this.series[0] = chartInstance.addSeries({
        id: id,
        infIndType: "FUSTO",
        infIndSubType: "FUSTO",
        name: "FUSTO",
        /* data: [],*/
        infType: "indicator",
        yAxis: this.axisId,
        showInLegend: false,
        color: colors[1],
        lineColor: colors[1],
        enableMouseTracking: true,
        states: {
            hover: {
                enabled: false
            }
        }
    }, false);

    this.series[1] = chartInstance.addSeries({
        "id": id + "_FUSTO2",
        infIndType: "FUSTO",
        infIndSubType: "FUSTO2",
        /* data: [],*/
        infType: "indicator",
        "yAxis": this.axisId,
        showInLegend: false,
        "name": "FUSTO2",
        "color": colors[2],
        "lineColor": colors[2],
        enableMouseTracking: true,
        states: {
            hover: {
                enabled: false
            }
        }
    }, true);

    this.style[this.series[2].options.id] = ["line", "arearange"];
    this.style[this.series[3].options.id] = ["line", "arearange"];

};

infChart.util.extend(infChart.Indicator, infChart.FullStochasticOscillatorIndicator);

infChart.FullStochasticOscillatorIndicator.prototype.calculate = function (ohlc, data, redraw, seriesId) {
    var high = ohlc.h,
        low = ohlc.l,
        close = ohlc.c;
    if (data && data.length > 0) {
        var chart = this.chart;
        if (!seriesId) {
            var stos = this.getSeries(high, low, close, 0, infChart.indicatorDefaults.ULCLOSEPRICE, infChart.indicatorDefaults.EXPONENTIALMOVINGAVERAGE, this.params.kperiod, this.params.dperiod, this.params.speriod);
            var stos2 = this.getSeries(high, low, close, 1, infChart.indicatorDefaults.ULCLOSEPRICE, infChart.indicatorDefaults.EXPONENTIALMOVINGAVERAGE, this.params.kperiod, this.params.dperiod, this.params.speriod);
            var _stos = this.merge(data, stos);
            var _stos2 = this.merge(data, stos2);
            var fustoSeries = chart.get(this.id);
            var fusto2Series = chart.get(this.id + '_FUSTO2');

            fustoSeries && fustoSeries.setData(_stos, false, false, false);
            fusto2Series && fusto2Series.setData(_stos2, redraw, false, false);
        }
        if (!seriesId || seriesId == (this.id + '_FUSTO3')) {
            var series = chart.get(this.id + '_FUSTO3');
            if (series.options.type === "line") {
                series.setData(this.getBand(data, series.options.type, this.params.upperLevel, this.params.upperLevel), redraw, false, false);
            } else {
                series.setData(this.getBand(data, series.options.type, 1, this.params.upperLevel), redraw, false, false);
            }
        }
        if (!seriesId || seriesId == (this.id + '_FUSTO4')) {
            var series4 = chart.get(this.id + '_FUSTO4');
            if (series4.options.type === "line") {
                series4.setData(this.getBand(data, series4.options.type, this.params.lowerLevel, this.params.lowerLevel), redraw, false, false);
            } else {
                series4.setData(this.getBand(data, series4.options.type, this.params.lowerLevel, 0), redraw, false, false);
            }
        }
    }
};

infChart.FullStochasticOscillatorIndicator.prototype.getSeries = function (hts, lts, cts, grn, ul, ma, nocp1, nocp2, nocp3) {
    var pd = this.pk(hts, lts, cts, undefined, 2, ul, ma, nocp1, nocp2);
    if (grn == 1)
        return pd;
    return this.movmean(pd, ma, nocp3);
};

infChart.FullStochasticOscillatorIndicator.prototype.removeSeries = function (seriesId, isPropertyChange) {
    this.hideIndicator(seriesId);
    infChart.Indicator.prototype.removeSeries.apply(this, arguments);
};

/**
 * hide indicator
 * @param {string} seriesId - series id
 */
infChart.FullStochasticOscillatorIndicator.prototype.hideIndicator = function (seriesId) {
    let seriesList = this._getRelevantSeries(seriesId);

    if (seriesList.remainingSeries && seriesList.remainingSeries.visible) {
        seriesList.selectedSeries.hide();
    } else {
        infChart.util.forEach(this.series, function (i, series) {
            series.hide();
        });
    }

    infChart.manager.getChart(this.chartId)._onPropertyChange("indicators");
};

/**
 * show indicator
 * @param {string} seriesId - series id
 */
infChart.FullStochasticOscillatorIndicator.prototype.showIndicator = function (seriesId) {
    let seriesList = this._getRelevantSeries(seriesId);

    if (seriesList.remainingSeries && seriesList.remainingSeries.visible) {
        seriesList.selectedSeries.show();
    } else {
        infChart.util.forEach(this.series, function (i, series) {
            if (!seriesList.remainingSeries || seriesList.remainingSeries.options.id !== series.options.id) {
                series.show();
            }
        });
    }

    infChart.manager.getChart(this.chartId)._onPropertyChange("indicators");
};

/**
 * get relevant series
 * @param seriesId
 * @private
 */
infChart.FullStochasticOscillatorIndicator.prototype._getRelevantSeries = function (seriesId) {
    let seriesList = {};

    let mainIndicator = this.series[0].name === "FUSTO" ? this.series[0] : undefined;
    let secondaryIndicator = this.series[1] && this.series[1].name === "FUSTO2" ? this.series[1] : this.series[0].name === "FUSTO2" ? this.series[0] : undefined;

    if (mainIndicator && mainIndicator.userOptions.id === seriesId) {
        seriesList = {
            selectedSeries: mainIndicator,
            remainingSeries: secondaryIndicator
        }
    } else {
        seriesList = {
            selectedSeries: secondaryIndicator,
            remainingSeries: mainIndicator
        }
    }

    return seriesList;
};


//endregion **************************************Full Stochastic Oscillator(FUSTO) Indicator******************************************
//region ************************************** AROON Up / Down(ARUD) Indicator******************************************

/***
 * Constructor for AROON Up (ARUD)  Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
 infChart.AROONUpDownIndicator = function (id, chartId, type, chartInstance) {

    infChart.Indicator.apply(this, arguments);

    this.params.period = 25;
    this.axisId = "#ARUD_" + id;

    var colors = infChart.util.getSeriesColors();

    this.addAxis({
        id: this.axisId,
        startOnTick: false,
        endOnTick: false
    });

    this.series[0] = chartInstance.addSeries({
        id: id,
        infIndType: "ARUD",
        infIndSubType: "ARUD",
        name: "ARUD",
        /* data: [],*/
        infType: "indicator",
        yAxis: this.axisId,
        showInLegend: false,
        color: colors[0],
        lineColor: colors[0]
    }, false);

    this.series[1] = chartInstance.addSeries({
        "id": id + "_ARUD2",
        infIndType: "ARUD",
        infIndSubType: "ARUD2",
        /* data: [],*/
        infType: "indicator",
        "yAxis": this.axisId,
        showInLegend: false,
        "name": "ARUD2",
        "color": colors[1],
        "lineColor": colors[1]
    }, true);
};

infChart.util.extend(infChart.Indicator, infChart.AROONUpDownIndicator);

infChart.AROONUpDownIndicator.prototype.calculate = function (ohlc, data, redraw) {
    var high = ohlc.h,
        low = ohlc.l;
    var that = this;

    if (data && data.length > 0) {
        infChart.util.forEach(this.series, function (i, series) {
            switch (series.options.infIndSubType) {
                case 'ARUD':
                    var arud = that.arud(high, low, 1, that.params.period);
                    var _arud = that.merge(data, arud);
                    series.setData(_arud, false, false, false);
                    break;
                case 'ARUD2':
                    var arud2 = that.arud(high, low, 0, that.params.period);
                    var _arud2 = that.merge(data, arud2);
                    series.setData(_arud2, redraw, false, false);
                    break;
                default :
                    break;
            }
        });

        if (redraw) {
            var chart = this.chart;
            chart.redraw();
        }
    }
};

infChart.AROONUpDownIndicator.prototype.getSeries = function (hts, lts, cts, grn, ul, ma, nocp1, nocp2, nocp3) {
    var pd = this.pk(hts, lts, cts, undefined, 2, ul, ma, nocp1, nocp2);
    if (grn == 1)
        return pd;
    return this.movmean(pd, ma, nocp3);
};

//endregion **************************************Slow AROON Up (ARUP) Indicator******************************************
//region ************************************** Weighted Moving Average (WMA) Indicator******************************************

/***
 * Constructor for Weighted Moving Average (WMA)  Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
 infChart.WeightedMovingAverageIndicator = function (id, chartId, type, chartInstance) {

    infChart.Indicator.apply(this, arguments);

    this.params.period = 21;
    this.params.shift = 0;
    this.titleParams = ["period", "shift"];

    var color = infChart.util.getNextSeriesColor(chartId);

    this.series[0] = chartInstance.addSeries({
        id: id,
        name: "WMA",
        infIndType: "WMA",
        infIndSubType: "WMA",
        /* data: [],*/
        infType: "indicator",
        yAxis: "#0",
        color: color,
        lineColor: color
    }, true);
};

infChart.util.extend(infChart.Indicator, infChart.WeightedMovingAverageIndicator);

infChart.WeightedMovingAverageIndicator.prototype.calculate = function (ohlc, data, redraw) {
    var close = ohlc.c;
    if (data && data.length > 0) {
        var chart = this.chart;
        var wma = this.getSeries(close, infChart.indicatorDefaults.WEIGHTEDMOVINGAVERAGE, this.params.period, this.params.shift);
        var _wma = this.merge(data, wma);
        chart.get(this.id).setData(_wma, redraw, false, false);
    }
};

infChart.WeightedMovingAverageIndicator.prototype.getSeries = function (ts, ma, m, shift) {
    var retval = this.movmean(ts, ma, m);

    if (shift > 0) {
        var k = 0;
        for (k = 1; k < retval.length; k++) {
            retval[k] = +shift + retval[k];
        }
    }
    return retval;
};

//endregion **************************************Weighted Moving Average (WMA) Indicator******************************************
//region ************************************** Parabolic Stops and Reversals (SAR) Indicator******************************************

/***
 * Constructor for Parabolic Stops and Reversals (SAR)  Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
 infChart.SARIndicator = function (id, chartId, type, chartInstance) {

    infChart.Indicator.apply(this, arguments);

    this.params.af = 0.02;
    this.params.maxaf = 0.2;
    this.titleParams = ["af", "maxaf"];
    this.titleParamsDec = [2, 1];

    var color = infChart.util.getNextSeriesColor(chartId);

    this.series[0] = chartInstance.addSeries({
        id: id,
        name: "SAR",
        infIndType: "SAR",
        infIndSubType: "SAR",
        /* data: [],*/
        infType: "indicator",
        yAxis: "#0",
        type: "dash",
        //dashStyle:"dot",
        //lineWidth : 0,
        //marker : {
        //    enabled : true,
        //    radius : 1
        //},
        color: color,
        lineColor: color
    }, true);
};

infChart.util.extend(infChart.Indicator, infChart.SARIndicator);

infChart.SARIndicator.prototype.calculate = function (ohlc, data, redraw) {
    var high = ohlc.h,
        low = ohlc.l,
        close = ohlc.c;

    if (data && data.length > 1) {
        var chart = this.chart;
        var sar = this.getSeries(high, low, close, +this.params.af, +this.params.maxaf);
        var _sar = this.merge(data, sar);
        chart.get(this.id).setData(_sar, redraw, false, false);
    }
};

infChart.SARIndicator.prototype.getSeries = function (hts, lts, cts, af, maxaf) {
    var retval, k, upTrend, prevAF = af, currentAF = af, prevSAR, initialPSAR, ep, prevTrendUp;

    upTrend = false;

    initialPSAR = new Array(hts.length);
    initialPSAR[0] = hts[0];

    ep = new Array(hts.length);
    ep[0] = lts[0];

    retval = new Array(hts.length);
    prevSAR = retval[0] = hts[0];

    prevTrendUp = upTrend;

    for (k = 1; k < retval.length; k++) {

        prevSAR = retval[k - 1];

        // set current extreme point and initial PSAR
        if (upTrend) {
            ep[k] = Math.max(ep[k - 1], hts[k]);
            initialPSAR[k] = Math.min(prevSAR - prevAF * (prevSAR - ep[k - 1] ), lts[k - 1]);

        } else {
            ep[k] = Math.min(ep[k - 1], lts[k]);
            initialPSAR[k] = Math.max(prevSAR - prevAF * (prevSAR - ep[k - 1]), hts[k - 1]);
        }

        // set current PSAR value
        if (!prevTrendUp && hts[k] < initialPSAR[k]) {
            retval[k] = initialPSAR[k];
        }
        else if (prevTrendUp && lts[k] > initialPSAR[k]) {
            retval[k] = initialPSAR[k];
        }
        else if (!prevTrendUp && hts[k] >= initialPSAR[k]) {
            retval[k] = ep[k - 1];
        }
        else if (prevTrendUp && lts[k] <= initialPSAR[k]) {
            retval[k] = ep[k - 1];
        }

        prevTrendUp = upTrend; // set previous Trend
        upTrend = !(retval[k] > cts[k]); // set current Trend

        // set current acceleration factor
        if (upTrend == prevTrendUp && ep[k] != ep[k - 1] && prevAF < maxaf) {
            currentAF = prevAF + af;
        }
        else if (upTrend == prevTrendUp && ep[k] == ep[k - 1]) {
            currentAF = prevAF;
        }
        else if (upTrend != prevTrendUp) {
            currentAF = af;
        }

        prevAF = currentAF;
    }
    return retval;
};

//endregion **************************************Parabolic Stops and Reversals (SAR) Indicator******************************************
//region ************************************** Historical Volatility Indicator******************************************

/***
 * Constructor for Historical Volatility  Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
 infChart.HistoricalVolatilityIndicator = function (id, chartId, type, chartInstance) {

    infChart.Indicator.apply(this, arguments);

    //this.params.period = 25; // TODO : check the logic again
    this.axisId = "#HV_" + id;

    var colors = infChart.util.getSeriesColors();

    this.addAxis({
        id: this.axisId,
        startOnTick: false,
        endOnTick: false
    });

    this.series[0] = chartInstance.addSeries({
        id: id,
        infIndType: "HV",
        infIndSubType: "HV",
        name: "HV",
        /* data: [],*/
        infType: "indicator",
        yAxis: this.axisId,
        showInLegend: false,
        color: colors[1],
        lineColor: colors[1]
    }, false);

    this.series[1] = chartInstance.addSeries({
        "id": id + "_HV2",
        infIndType: "HV",
        infIndSubType: "HV2",
        /* data: [],*/
        infType: "indicator",
        "yAxis": this.axisId,
        showInLegend: false,
        "name": "HV2",
        "color": colors[2],
        "lineColor": colors[2]
    }, true);
};

infChart.util.extend(infChart.Indicator, infChart.HistoricalVolatilityIndicator);

infChart.HistoricalVolatilityIndicator.prototype.calculate = function (ohlc, data, redraw) {
    var high = ohlc.h,
        low = ohlc.l,
        close = ohlc.c;
    var that = this;

    if (data && data.length > 0) {
        infChart.util.forEach(this.series, function (i, series) {
            switch (series.options.infIndSubType) {
                case 'HV':
                    var hv = that.getSeries(high, low, close, infChart.indicatorDefaults.ULCLOSEPRICE, 10, 200);
                    var _hv = that.merge(data, hv);
                    series.setData(_hv, false, false, false);
                    break;
                case 'HV2':
                    var hv2 = that.getSeries(high, low, close, infChart.indicatorDefaults.ULCLOSEPRICE, 100, 200);
                    var _hv2 = that.merge(data, hv2);
                    series.setData(_hv2, redraw, false, false);
                    break;
                default :
                    break;
            }
        });

        if (redraw) {
            var chart = this.chart;
            chart.redraw();
        }
    }
};

infChart.HistoricalVolatilityIndicator.prototype.getSeries = function (hts, lts, cts, ul, nocp1, nocpn) {
    var norm, k, hv;
    norm = Math.sqrt(nocpn);
    hv = this.movdev(this.lr(this.movul(hts, lts, cts, undefined, ul)), infChart.indicatorDefaults.MOVINGSTANDARDDEVIATION, nocp1);
    for (k = 0; k < hv.length; k++)
        hv[k] = norm * hv[k];
    return hv;
};

//endregion **************************************Historical Volatility Indicator******************************************
//region ************************************** Standard Deviation (StdDev)Indicator******************************************

/***
 * Cunstructor for Standard Deviation (StdDev) Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
 infChart.StandardDeviationIndicator = function (id, chartId, type, chartInstance) {

    infChart.Indicator.apply(this, arguments);

    this.params.period = 5;
    this.titleParams = ["period"];

    this.axisId = "#StdDev_" + id;

    this.addAxis({
        id: this.axisId,
        startOnTick: false,
        endOnTick: false
    });


    this.series[0] = chartInstance.addSeries({
        "id": id,
        infIndType: "StdDev",
        infIndSubType: "StdDev",
        "type": "line",
        "yAxis": this.axisId,
        showInLegend: false,
        "name": "StdDev",
        /* data: [],*/
        infType: "indicator"
    }, true);

};

infChart.util.extend(infChart.Indicator, infChart.StandardDeviationIndicator);

infChart.StandardDeviationIndicator.prototype.calculate = function (ohlc, data, redraw) {
    var
        close = ohlc.c;
    if (data && data.length > 0) {
        var chart = this.chart;

        var stdDev = this.getSeries(close, infChart.indicatorDefaults.MOVINGSTANDARDDEVIATION, this.params.period);
        var _stdDev = this.merge(data, stdDev);
        chart.get(this.id).setData(_stdDev, redraw, false, false);

    }
};

infChart.StandardDeviationIndicator.prototype.getSeries = function (cts, md, nocp) {
    var dev;
    dev = this.movdev(cts, md, nocp);
    return dev;
};

//endregion **************************************Standard Deviation Indicator******************************************
//region ************************************** Highest High (HighestH) Indicator******************************************

/***
 * Constructor for Highest High (HighestH) Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
 infChart.HighestHighIndicator = function (id, chartId, type, chartInstance) {

    infChart.Indicator.apply(this, arguments);

    this.params.period = 21;
    this.params.base = infChart.indicatorDefaults.ULHIGHPRICE;

    var color = infChart.util.getNextSeriesColor(chartId);

    this.series[0] = chartInstance.addSeries({
        id: id,
        name: "HighestH",
        infIndType: "HighestH",
        infIndSubType: "HighestH",
        /* data: [],*/
        infType: "indicator",
        yAxis: "#0",
        color: color,
        lineColor: color
    }, true);
};

infChart.util.extend(infChart.Indicator, infChart.HighestHighIndicator);

infChart.HighestHighIndicator.prototype.calculate = function (ohlc, data, redraw) {
    var close = ohlc.c,
        high = ohlc.h,
        low = ohlc.l,
        open = ohlc.o;

    if (data && data.length > 0) {
        var chart = this.chart;
        var hh = this.getSeries(high, low, close, open, this.params.base, this.params.period);
        var _hh = this.merge(data, hh);
        chart.get(this.id).setData(_hh, redraw, false, false);
    }
};

infChart.HighestHighIndicator.prototype.getSeries = function (hts, lts, cts, ots, ul, m) {
    var ts = this.movul(hts, lts, cts, ots, ul);

    return this.movmax(ts, m);
};

//endregion **************************************Highest High (HighestH) Indicator******************************************
//region ************************************** Lowest Low (LowestL) Indicator******************************************

/***
 * Constructor for Highest High (HighestH) Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
 infChart.LowestLowIndicator = function (id, chartId, type, chartInstance) {

    infChart.Indicator.apply(this, arguments);

    this.params.period = 21;
    this.params.base = infChart.indicatorDefaults.ULLOWPRICE;

    var color = infChart.util.getNextSeriesColor(chartId);

    this.series[0] = chartInstance.addSeries({
        id: id,
        name: "LowestL",
        infIndType: "LowestL",
        infIndSubType: "LowestL",
        /* data: [],*/
        infType: "indicator",
        yAxis: "#0",
        color: color,
        lineColor: color
    }, true);
};

infChart.util.extend(infChart.Indicator, infChart.LowestLowIndicator);

infChart.LowestLowIndicator.prototype.calculate = function (ohlc, data, redraw) {
    var close = ohlc.c,
        high = ohlc.h,
        low = ohlc.l,
        open = ohlc.o;

    if (data && data.length > 0) {
        var chart = this.chart;
        var ll = this.getSeries(high, low, close, open, this.params.base, this.params.period);
        var _ll = this.merge(data, ll);
        chart.get(this.id).setData(_ll, redraw, false, false);
    }
};

infChart.LowestLowIndicator.prototype.getSeries = function (hts, lts, cts, ots, ul, m) {
    var ts = this.movul(hts, lts, cts, ots, ul);

    return this.movmin(ts, m);
};

//endregion **************************************Lowest Low (LowestL) Indicator******************************************
//region ************************************** Ichimoku Kinko Hyo (ICHI) Indicator******************************************

/***
 * Constructor for Ichimoku Kinko Hyo (ICHI) Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
 infChart.IchimokuKinkoHyoIndicator = function (id, chartId, type, chartInstance) {

    infChart.Indicator.apply(this, arguments);

    this.params.period1 = 9;
    this.params.period2 = 26;
    this.params.period3 = 52;

    this.titleParams = ["period1", "period2", "period3"];

    var color = infChart.util.getNextSeriesColor(chartId), upColor = infChart.util.getDefaultUpColor(), downColor = infChart.util.getDefaultDownColor();

    this.series[0] = chartInstance.addSeries({
        id: id,
        name: "ICHI",
        infIndType: "ICHI",
        infIndSubType: "ICHI",
        /* data: [],*/
        infType: "indicator",
        yAxis: "#0",
        color: color,
        lineColor: color,
        enableMouseTracking: true,
        states: {
            hover: {
                enabled: false
            }
        }
    }, false);

    color = infChart.util.getNextSeriesColor(chartId);

    this.series[1] = chartInstance.addSeries({
        id: id + "_ICHI2",
        name: "Kijun",
        infIndType: "ICHI",
        infIndSubType: "ICHI2",
        /* data: [],*/
        infType: "indicator",
        yAxis: "#0",
        color: color,
        lineColor: color,
        hideLegend: true,
        showInLegend: false,
        enableMouseTracking: true,
        states: {
            hover: {
                enabled: false
            }
        }
    }, false);

    color = infChart.util.getNextSeriesColor(chartId);
    this.series[2] = chartInstance.addSeries({
        id: id + "_ICHI3",
        name: "Senkou-span A",
        infIndType: "ICHI",
        infIndSubType: "ICHI3",
        /* data: [],*/
        infType: "indicator",
        yAxis: "#0",
        color: color,
        lineColor: color,
        hideLegend: true,
        showInLegend: false,
        enableMouseTracking: true,
        states: {
            hover: {
                enabled: false
            }
        }
    }, false);

    color = infChart.util.getNextSeriesColor(chartId);
    this.series[3] = chartInstance.addSeries({
        id: id + "_ICHI4",
        name: "Senkou-span B",
        infIndType: "ICHI",
        infIndSubType: "ICHI4",
        /* data: [],*/
        infType: "indicator",
        yAxis: "#0",
        color: color,
        lineColor: color,
        hideLegend: true,
        showInLegend: false,
        enableMouseTracking: true,
        states: {
            hover: {
                enabled: false
            }
        }
    }, false);

    color = infChart.util.getNextSeriesColor(chartId);
    this.series[4] = chartInstance.addSeries({
        id: id + "_ICHI5",
        name: "Chikou",
        infIndType: "ICHI",
        infIndSubType: "ICHI5",
        /* data: [],*/
        infType: "indicator",
        yAxis: "#0",
        color: color,
        lineColor: color,
        hideLegend: true,
        showInLegend: false,
        enableMouseTracking: true,
        states: {
            hover: {
                enabled: false
            }
        }
    }, false);

    this.series[5] = chartInstance.addSeries({
        id: id + "_ICHI6",
        name: "Senkou-span up",
        infIndType: "ICHI",
        infIndSubType: "ICHI6",
        type: "arearange",
        /* data: [],*/
        color: upColor,
        lineWidth: 0,
        infType: "indicator",
        yAxis: "#0",
        zIndex: 3,
        fillOpacity: 0.5,
        hideLegend: true,
        showInLegend: false,
        enableMouseTracking: true,
        states: {
            hover: {
                enabled: false
            }
        }
    }, false);

    this.series[6] = chartInstance.addSeries({
        id: id + "_ICHI7",
        name: "Senkou-span down",
        infIndType: "ICHI",
        infIndSubType: "ICHI7",
        type: "arearange",
        /* data: [],*/
        color: downColor,
        lineWidth: 0,
        infType: "indicator",
        yAxis: "#0",
        zIndex: 3,
        fillOpacity: 0.5,
        hideLegend: true,
        showInLegend: false,
        enableMouseTracking: true,
        states: {
            hover: {
                enabled: false
            }
        }
    }, true);

    this.style[this.series[5].options.id] = ["arearange"];
    this.style[this.series[6].options.id] = ["arearange"];
};

infChart.util.extend(infChart.Indicator, infChart.IchimokuKinkoHyoIndicator);

infChart.IchimokuKinkoHyoIndicator.prototype.calculate = function (ohlc, data, redraw) {
    var close = ohlc.c,
        high = ohlc.h,
        low = ohlc.l,
        open = ohlc.o;

    if (data && data.length > 0) {
        var chart = this.chart;
        var seriesObj = this.getSeries(high, low, close, +this.params.period1, +this.params.period2, +this.params.period3);
        var _cl = this.merge(data, seriesObj.clts);
        var _bl = this.merge(data, seriesObj.blts);
        var _ssa = this.merge(data, seriesObj.ssats);
        var _ssb = this.merge(data, seriesObj.ssbts);
        var _clag = this.merge(data, seriesObj.clLagts);

        var spang = this.merge(data, seriesObj.spang1, seriesObj.spang2);
        var spanr = this.merge(data, seriesObj.spanr1, seriesObj.spanr2);

        chart.get(this.id).setData(_cl, false, false, false);
        chart.get(this.id + "_ICHI2").setData(_bl, false, false, false);
        chart.get(this.id + "_ICHI3").setData(_ssa, false, false, false);
        chart.get(this.id + "_ICHI4").setData(_ssb, false, false, false);
        chart.get(this.id + "_ICHI5").setData(_clag, false, false, false);
        chart.get(this.id + "_ICHI6").setData(spang, false, false, false);
        chart.get(this.id + "_ICHI7").setData(spanr, redraw, false, false);
    }
};

infChart.IchimokuKinkoHyoIndicator.prototype.getSeries = function (hts, lts, cts, period1, period2, period3) {
    var hh, ll, clts, blts, ssats, ssbts, csts, k;


    hh = this.movmax(hts, period1);
    ll = this.movmin(lts, period1);
    clts = new Array(hh.length);

    for (k = 0; k < clts.length; k++) {
        clts[k] = (hh[k] + ll[k]) / 2;
    }


    hh = this.movmax(hts, period2);
    ll = this.movmin(lts, period2);
    blts = new Array(hh.length);

    for (k = 0; k < blts.length; k++) {
        blts[k] = (hh[k] + ll[k]) / 2;
    }


    ssats = new Array(blts.length);
    for (k = 0; k < ssats.length; k++) {
        ssats[k] = (clts[k] + blts[k]) / 2;
    }

    hh = this.movmax(hts, period3);
    ll = this.movmin(lts, period3);
    ssbts = new Array(hh.length);

    for (k = 0; k < ssbts.length; k++) {
        ssbts[k] = (hh[k] + ll[k]) / 2;
    }

    var clLagts = this.movpos(cts, period2);

    var spang1, spang2, spanr1, spanr2;
    spang1 = new Array(ssats.length);
    spang2 = new Array(ssats.length);
    spanr1 = new Array(ssats.length);
    spanr2 = new Array(ssats.length);
    //spanr1 = spanr2 = new Array(ssats.length);
    var diff;

    for (k = 0; k < ssats.length; k++) {
        diff = ssats[k] - ssbts[k];
        if (diff > 0) {
            spang1[k] = ssats[k];
            spang2[k] = ssbts[k];
            spanr1[k] = ssats[k];
            spanr2[k] = ssats[k];
        }
        else {
            spang1[k] = ssats[k];
            spang2[k] = ssats[k];
            spanr1[k] = ssats[k];
            spanr2[k] = ssbts[k];
        }

    }

    return {
        clts: clts,
        blts: blts,
        ssats: ssats,
        ssbts: ssbts,
        clLagts: clLagts,
        spang1: spang1,
        spang2: spang2,
        spanr1: spanr1,
        spanr2: spanr2
    };

};

infChart.IchimokuKinkoHyoIndicator.prototype.movpos = function (ts, m) {
    var movmaxpos = new Array(ts.length), k, maxpos, max;

    for (k = 0; k < ts.length - m; k++) {
        movmaxpos[k] = ts[k + m];
    }

    return movmaxpos;
};

infChart.IchimokuKinkoHyoIndicator.prototype.getContextMenuOptions = function (chartId, series, options) {
    return {
        "removeIndicator": {
            icon : options.removeIndicator.icon,
            displayText :options.removeIndicator.displayText,
            action : function () {
                let indicator = infChart.indicatorMgr.getIndicatorBySeriesId(chartId, series.options.id);
                infChart.manager.removeSeries(series.chart.renderTo.id, indicator.id, series.options.infType);
            }
        }
    }
};
//endregion **************************************Ichimoku Kinko Hyo (ICHI) Indicator******************************************
//region ************************************** Volume Moving Average (VMA) Indicator******************************************

/***
 * Constructor for Volume Moving Average (VMA)  Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
 infChart.VolumeMovingAverageIndicator = function (id, chartId, type, chartInstance) {

    infChart.Indicator.apply(this, arguments);

    this.params.period = 21;
    this.params.shift = 0;
    this.titleParams = ["period", "shift"];

    this.axisId = "#VMA_" + id;

    this.addAxis({
        id: this.axisId,
        startOnTick: false,
        endOnTick: false
    });


    this.series[0] = chartInstance.addSeries({
        id: id,
        name: "VMA",
        infIndType: "VMA",
        infIndSubType: "VMA",
        /* data: [],*/
        infType: "indicator",
        yAxis: this.axisId,
        showInLegend: false
    }, true);
};

infChart.util.extend(infChart.Indicator, infChart.VolumeMovingAverageIndicator);

infChart.VolumeMovingAverageIndicator.prototype.calculate = function (ohlc, data, redraw) {
    var volume = ohlc.v;
    if (data && data.length > 0) {
        var chart = this.chart;
        var vma = this.getSeries(volume, infChart.indicatorDefaults.ARITHMETICMOVINGAVERAGE, this.params.period, this.params.shift);
        var _vma = this.merge(data, vma);
        chart.get(this.id).setData(_vma, redraw, false, false);
    }
};

infChart.VolumeMovingAverageIndicator.prototype.getSeries = function (ts, ma, m, shift) {
    var retval = this.movmean(ts, ma, m);

    if (shift > 0) {
        var k = 0;
        for (k = 1; k < retval.length; k++) {
            retval[k] = +shift + retval[k];
        }
    }
    return retval;
};

//endregion **************************************Volume Moving Average (VMA) Indicator******************************************
//region ************************************** TRIX Indicator******************************************

/***
 * Constructor for TRIX  Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
 infChart.TRIXIndicator = function (id, chartId, type, chartInstance) {

    infChart.Indicator.apply(this, arguments);

    this.params.period = 21;
    this.params.base = infChart.indicatorDefaults.ULCLOSEPRICE;
    this.titleParams = ["period"];

    this.axisId = "#TRIX_" + id;

    this.addAxis({
        id: this.axisId,
        startOnTick: false,
        endOnTick: false
    });


    this.series[0] = chartInstance.addSeries({
        id: id,
        name: "TRIX",
        infIndType: "TRIX",
        infIndSubType: "TRIX",
        /* data: [],*/
        infType: "indicator",
        yAxis: this.axisId,
        showInLegend: false
    }, false);

    var upColor = infChart.util.getDefaultUpColor(), downColor = infChart.util.getDefaultDownColor();

    this.series[1] = chartInstance.addSeries({
        id: id + "_TRIX2",
        name: "Area",
        infIndType: "TRIX",
        infIndSubType: "TRIX2",
        /* data: [],*/
        infType: "indicator",
        yAxis: this.axisId,
        type: "line",
        fillColor: upColor,
        negativeFillColor: downColor,
        lineWidth: 0,
        zIndex: 3,
        fillOpacity: 0.5,
        threshold: 0,
        hideLegend: true,
        visible: false,
        showInLegend: false
    }, true);

    this.onOff = [this.series[0].options.id, this.series[1].options.id];
};

infChart.util.extend(infChart.Indicator, infChart.TRIXIndicator);

infChart.TRIXIndicator.prototype.calculate = function (ohlc, data, redraw) {
    var high = ohlc.h,
        low = ohlc.l,
        close = ohlc.c,
        open = ohlc.o;
    if (data && data.length > 0) {
        var chart = this.chart;
        var trix = this.getSeries(high, low, close, open, this.params.base, infChart.indicatorDefaults.EXPONENTIALMOVINGAVERAGE, this.params.period);
        var _vma = this.merge(data, trix);
        chart.get(this.id).setData(_vma, redraw, false, false);
        var series2 = chart.get(this.id + "_TRIX2");
        series2.setData(_vma, redraw, false, false);
        if (series2.type != "area") {
            /* This is done for fixing an exepction thrown from highcharts when drawing area having negative colors without data */
            series2.update({type: "area"}, true);
        }
    }
};

infChart.TRIXIndicator.prototype.getSeries = function (hts, lts, cts, ots, ul, ma, m) {
    var k, retval, ts = this.movul(hts, lts, cts, ots, ul),
        ssema = this.movmean(ts, ma, m),
        dsema = this.movmean(ssema, ma, m),
        tsema = this.movmean(dsema, ma, m);

    retval = new Array(tsema.length);

    for (k = 1; k < tsema.length; k++) {
        retval[k] = (tsema[k] / tsema[k - 1] - 1) * 100;
    }

    return retval;
};

//endregion **************************************TRIX Indicator******************************************
//region **************************************  Chaikin Money Flow (CMF)******************************************

/***
 * Constructor for Chaikin Money Flow (CMF)  Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
 infChart.ChaikinMoneyFlowIndicator = function (id, chartId, type, chartInstance) {

    infChart.Indicator.apply(this, arguments);

    this.axisId = "#CMF_" + id;


    this.addAxis({
        id: this.axisId,
        startOnTick: false,
        endOnTick: false
    });

    this.series[0] = chartInstance.addSeries({
        id: id,
        name: "CMF",
        infIndType: "CMF",
        infIndSubType: "CMF",
        /* data: [],*/
        infType: "indicator",
        yAxis: this.axisId,
        showInLegend: false
    }, true);
};

infChart.util.extend(infChart.Indicator, infChart.ChaikinMoneyFlowIndicator);

infChart.ChaikinMoneyFlowIndicator.prototype.calculate = function (ohlc, data, redraw) {
    var high = ohlc.h,
        low = ohlc.l,
        close = ohlc.c,
        open = ohlc.o,
        volume = ohlc.v;
    if (data && data.length > 0) {
        var chart = this.chart;
        var trix = this.getSeries(high, low, close, open, volume, 20);
        var _vma = this.merge(data, trix);
        chart.get(this.id).setData(_vma, redraw, false, false);
    }
};

infChart.ChaikinMoneyFlowIndicator.prototype.getSeries = function (hts, lts, cts, ots, vts, m) {
    var k, retval, summfv, sumv, i, ts = new Array(hts.length);

    retval = new Array(ts.length);

    for (k = 0; k < ts.length; k++) {
        ts[k] = (((cts[k] - lts[k]) - (hts[k] - cts[k])) / (hts[k] - lts[k])) * vts[k];
    }

    m = Math.min(m, ts.length);

    for (k = 0; k < ts.length; k++) {
        summfv = 0;
        sumv = 0;
        for (i = 0; i < m; i++) {
            summfv += ts[k];
            sumv += vts[k];
        }
        retval[k] = summfv / sumv;
    }

    return retval;
};

//endregion **************************************Chaikin Money Flow (CMF) Indicator******************************************
//region **************************************  Negative Volume Index (NVI) Indicator******************************************

/***
 * Constructor for Negative Volume Index (NVI) Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
 infChart.NegativeVolumeIndexIndicator = function (id, chartId, type, chartInstance) {

    infChart.Indicator.apply(this, arguments);

    this.axisId = "#NVI_" + id;

    this.addAxis({
        id: this.axisId,
        startOnTick: false,
        endOnTick: false
    });

    this.series[0] = chartInstance.addSeries({
        id: id,
        name: "NVI",
        infIndType: "NVI",
        infIndSubType: "NVI",
        /* data: [],*/
        infType: "indicator",
        yAxis: this.axisId,
        showInLegend: false
    }, true);
};

infChart.util.extend(infChart.Indicator, infChart.NegativeVolumeIndexIndicator);

infChart.NegativeVolumeIndexIndicator.prototype.calculate = function (ohlc, data, redraw) {
    var close = ohlc.c,
        volume = ohlc.v;
    if (data && data.length > 0) {
        var chart = this.chart;
        var trix = this.getSeries(close, volume, 1000);
        var _vma = this.merge(data, trix);
        chart.get(this.id).setData(_vma, redraw, false, false);
    }
};

infChart.NegativeVolumeIndexIndicator.prototype.getSeries = function (cts, vts, volumeStartsAt) {
    var k, volumeDiff, pchg, retval;

    retval = new Array(cts.length);
    retval[0] = volumeStartsAt;

    if (retval.length == 1) {
        return retval;
    }

    for (k = 1; k < retval.length; k++) {
        volumeDiff = vts[k] - vts[k - 1];
        if (volumeDiff < 0) {
            pchg = (cts[k] / cts[k - 1] - 1.0) * 100.0;
            retval[k] = retval[k - 1] + pchg;
        }
        else {
            retval[k] = retval[k - 1];
        }
    }

    return retval;
};

//endregion **************************************Negative Volume Index (NVI) Indicator******************************************
//region **************************************  Positive Volume Index (PVI) Indicator******************************************

/***
 * Constructor for Positive Volume Index (NVI) Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
 infChart.PositiveVolumeIndexIndicator = function (id, chartId, type, chartInstance) {

    infChart.Indicator.apply(this, arguments);

    this.axisId = "#PVI_" + id;

    this.addAxis({
        id: this.axisId,
        startOnTick: false,
        endOnTick: false
    });


    this.series[0] = chartInstance.addSeries({
        id: id,
        name: "PVI",
        infIndType: "PVI",
        infIndSubType: "PVI",
        /* data: [],*/
        infType: "indicator",
        yAxis: this.axisId,
        showInLegend: false
    }, true);
};

infChart.util.extend(infChart.Indicator, infChart.PositiveVolumeIndexIndicator);

infChart.PositiveVolumeIndexIndicator.prototype.calculate = function (ohlc, data, redraw) {
    var close = ohlc.c,
        volume = ohlc.v;
    if (data && data.length > 0) {
        var chart = this.chart;
        var trix = this.getSeries(close, volume, 1000);
        var _vma = this.merge(data, trix);
        chart.get(this.id).setData(_vma, redraw, false, false);
    }
};

infChart.PositiveVolumeIndexIndicator.prototype.getSeries = function (cts, vts, volumeStartsAt) {
    var k, volumeDiff, pchg, retval;

    retval = new Array(cts.length);
    retval[0] = volumeStartsAt;

    if (retval.length == 1) {
        return retval;
    }

    for (k = 1; k < retval.length; k++) {
        volumeDiff = vts[k] - vts[k - 1];
        if (volumeDiff > 0) {
            pchg = (cts[k] / cts[k - 1] - 1.0) * 100.0;
            retval[k] = retval[k - 1] + pchg;
        }
        else {
            retval[k] = retval[k - 1];
        }
    }

    return retval;
};

//endregion **************************************Positive Volume Index (PVI) Indicator******************************************
//region **************************************  Vertical Horizontal Filter (VHF) Indicator******************************************

/***
 * Constructor for Vertical Horizontal Filter (VHF) Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
 infChart.VerticalHorizontalFilterIndicator = function (id, chartId, type, chartInstance) {

    infChart.Indicator.apply(this, arguments);

    this.params.period = 28;
    this.params.base = infChart.indicatorDefaults.ULCLOSEPRICE;
    this.titleParams = ["period"];

    this.axisId = "#VHF_" + id;

    this.addAxis({
        id: this.axisId,
        startOnTick: false,
        endOnTick: false
    });


    this.series[0] = chartInstance.addSeries({
        id: id,
        name: "VHF",
        infIndType: "VHF",
        infIndSubType: "VHF",
        /* data: [],*/
        infType: "indicator",
        yAxis: this.axisId,
        showInLegend: false
    }, true);
};

infChart.util.extend(infChart.Indicator, infChart.VerticalHorizontalFilterIndicator);

infChart.VerticalHorizontalFilterIndicator.prototype.calculate = function (ohlc, data, redraw) {
    var high = ohlc.h,
        low = ohlc.l,
        close = ohlc.c,
        open = ohlc.o;

    if (data && data.length > 0) {
        var chart = this.chart;
        var vhf = this.getSeries(high, low, close, open, this.params.base, +this.params.period);
        var _vhf = this.merge(data, vhf);
        chart.get(this.id).setData(_vhf, redraw, false, false);
    }
};

infChart.VerticalHorizontalFilterIndicator.prototype.getSeries = function (hts, lts, cts, ots, ul, m) {
    var k, retval, sumchg, mm = m,
        ts = this.movul(hts, lts, cts, ots, ul),
        hhts = this.movmax(hts, m),
        llts = this.movmin(lts, m);

    retval = new Array(cts.length);
    sumchg = new Array(retval.length);

    sumchg[0] = 0.0;
    for (k = 1; k < retval.length; k++) {
        sumchg[k] = Math.abs(ts[k] - ts[k - 1]);
    }

    sumchg = this.movsum(sumchg, m);

    for (k = m; k < retval.length; k++) {
        retval[k] = (hhts[k] - llts[k]) / sumchg[k];
    }

    return retval;
};

//endregion **************************************Vertical Horizontal Filter (VHF) Indicator******************************************s
//region **************************************  Stochastic Momentum (SM) Indicator******************************************

/***
 * Constructor for Stochastic Momentum (SM) Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
 infChart.StochasticMomentumIndicator = function (id, chartId, type, chartInstance) {

    infChart.Indicator.apply(this, arguments);

    this.params.period1 = 13;
    this.params.period2 = 25;
    this.params.period3 = 2;
    this.titleParams = ["period1", "period2", "period3"];

    this.axisId = "#SM_" + id;

    this.addAxis({
        id: this.axisId,
        startOnTick: false,
        endOnTick: false
    });


    this.series[0] = chartInstance.addSeries({
        id: id,
        name: "SM",
        infIndType: "SM",
        infIndSubType: "SM",
        /* data: [],*/
        infType: "indicator",
        yAxis: this.axisId,
        showInLegend: false
    }, true);
};

infChart.util.extend(infChart.Indicator, infChart.StochasticMomentumIndicator);

infChart.StochasticMomentumIndicator.prototype.calculate = function (ohlc, data, redraw) {
    var high = ohlc.h,
        low = ohlc.l,
        close = ohlc.c;

    if (data && data.length > 0) {
        var chart = this.chart;
        var vhf = this.getSeries(high, low, close, +this.params.period1, +this.params.period2, +this.params.period3);
        var _vhf = this.merge(data, vhf);
        chart.get(this.id).setData(_vhf, redraw, false, false);
    }
};

infChart.StochasticMomentumIndicator.prototype.getSeries = function (hts, lts, cts, nop1, nop2, nop3) {
    var k, retval, dis, ds, dhl, diff,
        hhts = this.movmax(hts, nop1),
        llts = this.movmin(lts, nop1);

    dis = new Array(hhts.length);

    for (k = 0; k < dis.length; k++) {
        dis[k] = cts[k] - (hhts[k] + llts[k]) / 2;
    }

    ds = this.movmean(dis, infChart.indicatorDefaults.EXPONENTIALMOVINGAVERAGE, nop2);
    ds = this.movmean(ds, infChart.indicatorDefaults.EXPONENTIALMOVINGAVERAGE, nop2);

    diff = new Array(hhts.length);
    for (k = 0; k < diff.length; k++) {
        diff[k] = hhts[k] - llts[k];
    }
    dhl = this.movmean(diff, infChart.indicatorDefaults.EXPONENTIALMOVINGAVERAGE, nop3);
    dhl = this.movmean(dhl, infChart.indicatorDefaults.EXPONENTIALMOVINGAVERAGE, nop3);

    retval = new Array(dhl.length);

    for (k = 0; k < retval.length; k++) {
        retval[k] = (ds[k] / dhl[k]) * 100;
    }

    return retval;
};

//endregion **************************************Stochastic Momentum (SM)  Indicator******************************************
//region **************************************  Moving Average Momentum (MomMA) Indicator******************************************

/***
 * Constructor for Moving Average Momentum (MomMA) Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
 infChart.MovingAverageMomentumIndicator = function (id, chartId, type, chartInstance) {

    infChart.Indicator.apply(this, arguments);

    this.params.period = 21;
    this.params.shift = 0;
    this.params.period_mom = 20;
    this.params.base = infChart.indicatorDefaults.ULCLOSEPRICE;

    this.titleParams = ["period", "shift", "period_mom"];

    this.axisId = "#MomMA_" + id;

    this.addAxis({
        id: this.axisId,
        startOnTick: false,
        endOnTick: false
    });


    this.series[0] = chartInstance.addSeries({
        id: id,
        name: "MomMA",
        infIndType: "MomMA",
        infIndSubType: "MomMA",
        /* data: [],*/
        infType: "indicator",
        yAxis: this.axisId,
        showInLegend: false
    }, true);
};

infChart.util.extend(infChart.Indicator, infChart.MovingAverageMomentumIndicator);

infChart.MovingAverageMomentumIndicator.prototype.calculate = function (ohlc, data, redraw) {
    var high = ohlc.h,
        low = ohlc.l,
        close = ohlc.c,
        open = ohlc.o;

    if (data && data.length > 0) {
        var chart = this.chart;
        var vhf = this.getSeries(high, low, close, open, this.params.base, +this.params.period, +this.params.shift, +this.params.period_mom);
        var _vhf = this.merge(data, vhf);
        chart.get(this.id).setData(_vhf, redraw, false, false);
    }
};

infChart.MovingAverageMomentumIndicator.prototype.getSeries = function (hts, lts, cts, ots, ul, nop1, shift, periodMom) {
    var k, retval1, retval2, ts, stdD;

    ts = this.movul(hts, lts, cts, ots, ul);

    retval1 = this.movmean(ts, infChart.indicatorDefaults.ARITHMETICMOVINGAVERAGE, nop1);

    stdD = this.movdev(ts, infChart.indicatorDefaults.MOVINGMEANDEVIATION, nop1);

    retval2 = new Array(retval1.length);
    for (k = periodMom; k < retval1.length; k++) {
        retval2[k] = (retval1[k] - retval1[k - periodMom]) + shift * stdD[k] / 100;
    }

    return retval2;
};

//endregion **************************************Moving Average Momentum (MomMA)  Indicator******************************************


//region **************************************  Awesome Oscillator (AwesomeOsci) Indicator******************************************

/***
 * Constructor for Awesome Oscillator (AwesomeOsci) Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
 infChart.AwesomeOscillatorIndicator = function (id, chartId, type, chartInstance) {

    infChart.Indicator.apply(this, arguments);

    this.axisId = "#AwesomeOsci_" + id;


    this.addAxis({
        id: this.axisId,
        startOnTick: false,
        endOnTick: false
    });

    var upColor = infChart.util.getDefaultUpColor(), downColor = infChart.util.getDefaultDownColor();

    this.series[0] = chartInstance.addSeries({
        id: id,
        name: "AwesomeOsci",
        infIndType: "AwesomeOsci",
        infIndSubType: "AwesomeOsci",
        /* data: [],*/
        infType: "indicator",
        type: "line",
        yAxis: this.axisId,
        showInLegend: false,
        negativeFillColor: downColor,
        negativeColor: downColor,
        hasColumnNegative: true,
        hasAreaNegative: true,
        color: upColor,
        threshold: 0,
        fillColor: upColor,
        fillOpacity: 0.5
    }, true);
};

infChart.util.extend(infChart.Indicator, infChart.AwesomeOscillatorIndicator);

infChart.AwesomeOscillatorIndicator.prototype.calculate = function (ohlc, data, redraw) {
    var high = ohlc.h,
        low = ohlc.l;

    if (data && data.length > 0) {
        var chart = this.chart;
        var vhf = this.getSeries(high, low, infChart.indicatorDefaults.ARITHMETICMOVINGAVERAGE, 5, 34);
        var _vhf = this.merge(data, vhf);
        var series = chart.get(this.id);
        series.setData(_vhf, redraw, false, false);
        /*if (series.type != "area") {
         /!* This is done for fixing an exepction thrown from highcharts when drawing area having negative colors without data *!/
            series.update({type: "area"});
         }*/
    }
};

infChart.AwesomeOscillatorIndicator.prototype.getSeries = function (hts, lts, ma, nop1, nop2) {

    return this.awesomeOsi(hts, lts, ma, nop1, nop2);
};

//endregion **************************************Awesome Oscillator (AwesomeOsci)  Indicator******************************************
//region **************************************  Acceleration Deceleration Oscillator (ADOsci) Indicator******************************************

/***
 * Constructor for Acceleration Deceleration Oscillator (ADOsci) Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
 infChart.AccelerationDecelerationOscillatorIndicator = function (id, chartId, type, chartInstance) {

    infChart.Indicator.apply(this, arguments);

    this.params.period = 5;

    this.titleParams = ["period"];

    this.axisId = "#ADOsci_" + id;

    this.addAxis({
        id: this.axisId,
        startOnTick: false,
        endOnTick: false
    });

    var upColor = infChart.util.getDefaultUpColor(), downColor = infChart.util.getDefaultDownColor();

    this.series[0] = chartInstance.addSeries({
        id: id,
        name: "ADOsci",
        infIndType: "ADOsci",
        infIndSubType: "ADOsci",
        infType: "indicator",
        type: "column",
        yAxis: this.axisId,
        showInLegend: false,
        negativeFillColor: downColor,
        negativeColor: downColor,
        hasColumnNegative: true,
        hasAreaNegative: true,
        color: upColor,
        threshold: 0,
        fillColor: upColor,
        fillOpacity: 0.5
    }, true);
};

infChart.util.extend(infChart.Indicator, infChart.AccelerationDecelerationOscillatorIndicator);

infChart.AccelerationDecelerationOscillatorIndicator.prototype.calculate = function (ohlc, data, redraw) {
    var high = ohlc.h,
        low = ohlc.l;

    if (data && data.length > 0) {
        var chart = this.chart;
        var vhf = this.getSeries(high, low, infChart.indicatorDefaults.ARITHMETICMOVINGAVERAGE, 5, 35, this.params.period);
        var _vhf = this.merge(data, vhf);
        chart.get(this.id).setData(_vhf, redraw, false, false);
    }
};

infChart.AccelerationDecelerationOscillatorIndicator.prototype.getSeries = function (hts, lts, ma, nop1, nop2, nop3) {
    var k, retval1, ao, ts;
    retval1 = new Array(hts.length);
    ao = this.awesomeOsi(hts, lts, ma, nop1, nop2);
    ts = this.movmean(ao, ma, nop3);

    for (k = 0; k < hts.length; k++) {
        if (ao[k] != undefined && ts[k] != undefined) {
            retval1[k] = ao[k] - ts[k];
        }
    }

    return retval1;
};

//endregion **************************************Acceleration Deceleration Oscillator (ADOsci)  Indicator******************************************



//region **************************************  Coppock Curve (CoppockCurve) Indicator******************************************

/***
 * Constructor for Coppock Curve (CoppockCurve) Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
 infChart.CoppockCurveIndicator = function (id, chartId, type, chartInstance) {

    infChart.Indicator.apply(this, arguments);
    this.params.roc_period1 = 11;
    this.params.roc_period2 = 10;
    this.params.wma_period = 14;
    this.params.base = infChart.indicatorDefaults.ULCLOSEPRICE;

    this.titleParams = ["roc_period1", "roc_period2", "wma_period"];
    this.axisId = "#CoppockCurve_" + id;

    this.addAxis({
        id: this.axisId,
        startOnTick: false,
        endOnTick: false
    });

    this.series[0] = chartInstance.addSeries({
        id: id,
        name: "CoppockCurve",
        infIndType: "CoppockCurve",
        infIndSubType: "CoppockCurve",
        /* data: [],*/
        infType: "indicator",
        yAxis: this.axisId,
        showInLegend: false,
        threshold: 0
    }, true);
};

infChart.util.extend(infChart.Indicator, infChart.CoppockCurveIndicator);

infChart.CoppockCurveIndicator.prototype.calculate = function (ohlc, data, redraw) {
    var high = ohlc.h,
        low = ohlc.l,
        close = ohlc.c,
        open = ohlc.o;

    if (data && data.length > 0) {
        var chart = this.chart;
        var cc = this.getSeries(high, low, close, open, this.params.base, this.params.roc_period1, this.params.roc_period2, this.params.wma_period);
        var _cc = this.merge(data, cc);
        chart.get(this.id).setData(_cc, redraw, false, false);
    }
};

infChart.CoppockCurveIndicator.prototype.getSeries = function (hts, lts, cts, ots, ul, nop1, nop2, nop3) {
    var k, retval1, retval2, retval, stdD;


    retval1 = this.roc(hts, lts, cts, ots, ul, nop1);
    retval2 = this.roc(hts, lts, cts, ots, ul, nop2);

    retval2 = this.movmean(retval2, infChart.indicatorDefaults.WEIGHTEDMOVINGAVERAGE, nop3);

    retval = new Array(retval1.length);
    for (k = 0; k < retval.length; k++) {
        retval[k] = (retval1[k] + retval2[k]);
    }

    return retval;
};

//endregion ************************************** Coppock Curve (CoppockCurve)  Indicator******************************************

//region **************************************  Know Sure Thing (KST) Indicator******************************************

/***
 * Constructor for Know Sure Thing (KST) Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
 infChart.KnowSureThingIndicator = function (id, chartId, type, chartInstance) {

    infChart.Indicator.apply(this, arguments);
    this.params.roc_period1 = 10;
    this.params.roc_period2 = 15;
    this.params.roc_period3 = 20;
    this.params.roc_period4 = 30;
    this.params.sma_period1 = 10;
    this.params.sma_period2 = 10;
    this.params.sma_period3 = 10;
    this.params.sma_period4 = 15;
    this.params.weight1 = 1;
    this.params.weight2 = 2;
    this.params.weight3 = 3;
    this.params.weight4 = 4;
    this.params.signal_period = 9;
    this.params.base = infChart.indicatorDefaults.ULCLOSEPRICE;

    this.titleParams = ["roc_period1", "roc_period2", "roc_period4", "roc_period4", "sma_period1", "sma_period2", "sma_period3", "sma_period4", "weight1", "weight2", "weight3", "weight4", "signal_period"];
    this.axisId = "#KST_" + id;

    this.addAxis({
        id: this.axisId,
        startOnTick: false,
        endOnTick: false
    });

    var upColor = infChart.util.getDefaultUpColor(), downColor = infChart.util.getDefaultDownColor();

    this.series[0] = chartInstance.addSeries({
        id: id,
        name: "KST",
        infIndType: "KST",
        infIndSubType: "KST",
        /* data: [],*/
        infType: "indicator",
        yAxis: this.axisId,
        showInLegend: false,
        color: upColor,
        lineColor: upColor
    }, false);

    this.series[1] = chartInstance.addSeries({
        id: id + "_KST2",
        name: "Sig",
        infIndType: "KST",
        infIndSubType: "KST2",
        /* data: [],*/
        infType: "indicator",
        yAxis: this.axisId,
        showInLegend: false,
        color: downColor,
        lineColor: downColor
    }, true);

    this.onOff = [this.series[0].options.id, this.series[1].options.id];
};

infChart.util.extend(infChart.Indicator, infChart.KnowSureThingIndicator);

infChart.KnowSureThingIndicator.prototype.calculate = function (ohlc, data, redraw) {
    var high = ohlc.h,
        low = ohlc.l,
        close = ohlc.c,
        open = ohlc.o;

    if (data && data.length > 0) {
        var chart = this.chart;
        var kst = this.getSeries(high, low, close, open, this.params.base, this.params.roc_period1, this.params.roc_period2, this.params.roc_period3, this.params.roc_period4,
            this.params.sma_period1, this.params.sma_period2, this.params.sma_period3, this.params.sma_period4,
            this.params.weight1, this.params.weight2, this.params.weight3, this.params.weight4, this.params.signal_period);
        var _kst = this.merge(data, kst.kst);
        var _kstSeries = chart.get(this.id);
        _kstSeries && _kstSeries.setData(_kst, redraw, false, false);

        var _sig = this.merge(data, kst.sig);
        var _sigSeries = chart.get(this.id + "_KST2");
        _sigSeries && _sigSeries.setData(_sig, redraw, false, false);
    }
};

infChart.KnowSureThingIndicator.prototype.getSeries = function (hts, lts, cts, ots, ul, roc_period1, roc_period2, roc_period3, roc_period4,
                                                                sma_period1, sma_period2, sma_period3, sma_period4, weight1, weight2, weight3, weight4, signal_period) {
    var k, rcma1, rcma2, rcma3, retval, rcma4, sig;

    rcma1 = this.movmean(this.roc(hts, lts, cts, ots, ul, roc_period1), infChart.indicatorDefaults.ARITHMETICMOVINGAVERAGE, sma_period1);
    rcma2 = this.movmean(this.roc(hts, lts, cts, ots, ul, roc_period2), infChart.indicatorDefaults.ARITHMETICMOVINGAVERAGE, sma_period2);
    rcma3 = this.movmean(this.roc(hts, lts, cts, ots, ul, roc_period3), infChart.indicatorDefaults.ARITHMETICMOVINGAVERAGE, sma_period3);
    rcma4 = this.movmean(this.roc(hts, lts, cts, ots, ul, roc_period4), infChart.indicatorDefaults.ARITHMETICMOVINGAVERAGE, sma_period4);

    retval = new Array(rcma1.length);
    for (k = 0; k < retval.length; k++) {
        retval[k] = (rcma1[k] * weight1 + rcma2[k] * weight2 + rcma3[k] * weight3 + rcma4[k] * weight4);
    }

    sig = this.movmean(retval, infChart.indicatorDefaults.ARITHMETICMOVINGAVERAGE, signal_period);
    return {kst: retval, sig: sig};
};

//endregion ************************************** Know Sure Thing (KST) Indicator******************************************
//region **************************************  True Strength Index (TSI) Indicator******************************************

/***
 * Constructor for True Strength Index (TSI) Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
 infChart.TrueStrengthIndexIndicator = function (id, chartId, type, chartInstance) {

    infChart.Indicator.apply(this, arguments);
    this.params.period1 = 11;
    this.params.period2 = 10;
    this.params.base = infChart.indicatorDefaults.ULCLOSEPRICE;

    this.titleParams = ["period1", "period2"];
    this.axisId = "#TSI_" + id;

    this.addAxis({
        id: this.axisId,
        startOnTick: false,
        endOnTick: false
    });

    this.series[0] = chartInstance.addSeries({
        id: id,
        name: "TSI",
        infIndType: "TSI",
        infIndSubType: "TSI",
        /* data: [],*/
        infType: "indicator",
        yAxis: this.axisId,
        showInLegend: false
    }, true);
};

infChart.util.extend(infChart.Indicator, infChart.TrueStrengthIndexIndicator);

infChart.TrueStrengthIndexIndicator.prototype.calculate = function (ohlc, data, redraw) {
    var high = ohlc.h,
        low = ohlc.l,
        close = ohlc.c,
        open = ohlc.o;

    if (data && data.length > 0) {
        var chart = this.chart;
        var cc = this.getSeries(high, low, close, open, this.params.base, this.params.period1, this.params.period2);
        var _cc = this.merge(data, cc);
        chart.get(this.id).setData(_cc, redraw, false, false);
    }
};

infChart.TrueStrengthIndexIndicator.prototype.getSeries = function (hts, lts, cts, ots, ul, nop1, nop2) {
    var k, retval1, retval2, retval, ts, ds, dsa;
    ts = this.movul(hts, lts, cts, ots, ul);

    retval1 = new Array(ts.length);
    retval2 = new Array(ts.length);
    retval1[0] = 0;
    retval2[0] = 0;
    for (k = 1; k < retval1.length; k++) {
        retval1[k] = (ts[k] - ts[k - 1]);
        retval2[k] = Math.abs(ts[k] - ts[k - 1]);
    }
    ds = this.movmean(retval1, infChart.indicatorDefaults.EXPONENTIALMOVINGAVERAGE, nop1);
    ds = this.movmean(ds, infChart.indicatorDefaults.EXPONENTIALMOVINGAVERAGE, nop2);

    dsa = this.movmean(retval2, infChart.indicatorDefaults.EXPONENTIALMOVINGAVERAGE, nop1);
    dsa = this.movmean(dsa, infChart.indicatorDefaults.EXPONENTIALMOVINGAVERAGE, nop2);

    retval = new Array(ts.length);
    for (k = 1; k < retval.length; k++) {
        retval[k] = (ds[k] / dsa[k]);
    }
    return retval;
};

//endregion ************************************** True Strength Index (TSI)  Indicator******************************************


//region **************************************  Vortex Indicator (VI) Indicator******************************************

/***
 * Constructor for Vortex Indicator (VI) Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
 infChart.VortexIndicator = function (id, chartId, type, chartInstance) {

    infChart.Indicator.apply(this, arguments);
    this.params.period = 14;

    this.titleParams = ["period"];
    this.axisId = "#VI_" + id;

    this.addAxis({
        id: this.axisId,
        startOnTick: false,
        endOnTick: false
    });

    var upColor = infChart.util.getDefaultUpColor(), downColor = infChart.util.getDefaultDownColor();

    this.series[0] = chartInstance.addSeries({
        id: id,
        name: "VI+",
        infIndType: "VI",
        infIndSubType: "VI",
        /* data: [],*/
        infType: "indicator",
        yAxis: this.axisId,
        showInLegend: false,
        lineColor: upColor,
        color: upColor
    }, false);

    this.series[1] = chartInstance.addSeries({
        id: id + "_VI2",
        name: "VI-",
        infIndType: "VI2",
        infIndSubType: "VI2",
        /* data: [],*/
        infType: "indicator",
        yAxis: this.axisId,
        showInLegend: false,
        lineColor: downColor,
        color: downColor
    }, true);
};

infChart.util.extend(infChart.Indicator, infChart.VortexIndicator);

infChart.VortexIndicator.prototype.calculate = function (ohlc, data, redraw) {
    var high = ohlc.h,
        low = ohlc.l,
        close = ohlc.c;

    if (data && data.length > 0) {
        var chart = this.chart;
        var vi = this.getSeries(high, low, close, this.params.period);

        var _vi = this.merge(data, vi.vip);
        var viSeries = chart.get(this.id);
        viSeries && viSeries.setData(_vi, redraw, false, false);

        var _vim = this.merge(data, vi.vim);
        var vimSeries = chart.get(this.id + "_VI2");
        vimSeries && vimSeries.setData(_vim, redraw, false, false);
    }
};

infChart.VortexIndicator.prototype.getSeries = function (hts, lts, cts, nop1) {
    var k, retval1, retval2, tr;

    retval1 = new Array(hts.length);
    retval2 = new Array(hts.length);
    retval1[0] = 0;
    retval2[0] = 0;
    for (k = 1; k < retval1.length; k++) {
        retval1[k] = Math.abs(hts[k] - lts[k - 1]);
        retval2[k] = Math.abs(lts[k] - hts[k - 1]);
    }

    retval1 = this.movsum(retval1, nop1);
    retval2 = this.movsum(retval2, nop1);

    tr = this.tr(hts, lts, cts);
    tr = this.movsum(tr, nop1);

    for (k = 1; k < retval1.length; k++) {
        if (tr[k]) {
            retval1[k] = retval1[k] / tr[k];
            retval2[k] = retval2[k] / tr[k];
        }
    }
    return {vip: retval1, vim: retval2};
};

//endregion ************************************** Vortex Indicator (VI)  Indicator******************************************
//region **************************************  Median Price (MED) Indicator******************************************

/***
 * Constructor for Median Price (MP) Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
 infChart.MedianPriceIndicator = function (id, chartId, type, chartInstance) {

    infChart.Indicator.apply(this, arguments);

    var color = infChart.util.getNextSeriesColor(chartId);

    this.series[0] = chartInstance.addSeries({
        id: id,
        name: "MED",
        infIndType: "MED",
        infIndSubType: "MED",
        /* data: [],*/
        infType: "indicator",
        yAxis: "#0",
        lineColor: color,
        color: color
    }, true);

};

infChart.util.extend(infChart.Indicator, infChart.MedianPriceIndicator);

infChart.MedianPriceIndicator.prototype.calculate = function (ohlc, data, redraw) {
    var high = ohlc.h,
        low = ohlc.l;

    if (data && data.length > 0) {
        var chart = this.chart;
        var mp = this.getSeries(high, low);

        var _mp = this.merge(data, mp);
        chart.get(this.id).setData(_mp, redraw, false, false);

    }
};

infChart.MedianPriceIndicator.prototype.getSeries = function (hts, lts) {
    var k, retval;

    retval = new Array(hts.length);
    for (k = 0; k < retval.length; k++) {
        retval[k] = (hts[k] + lts[k]) / 2;
    }

    return retval;
};

//endregion ************************************** Median Price (MED)  Indicator******************************************


//region **************************************  Mass Index (MASS) Indicator******************************************

/***
 * Constructor for Mass Index (MASS) Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
 infChart.MassIndexIndicator = function (id, chartId, type, chartInstance) {

    infChart.Indicator.apply(this, arguments);
    this.params.period = 25;
    this.params.setup = 27;
    this.params.trigg = 26.5;

    this.titleParams = ["period", "setup", "trigg"];
    this.titleParamsDec = [0, 0, 1];
    this.axisId = "#MASS_" + id;

    this.addAxis({
        id: this.axisId,
        startOnTick: false,
        endOnTick: false
    });

    this.series[0] = chartInstance.addSeries({
        id: id,
        name: "MASS",
        infIndType: "MASS",
        infIndSubType: "MASS",
        /* data: [],*/
        infType: "indicator",
        yAxis: this.axisId,
        showInLegend: false
    }, false);

    var color = infChart.util.getNextSeriesColor(chartId);
    this.series[1] = chartInstance.addSeries({
        "id": id + "_MASS_SET",
        infIndType: "MASS",
        infIndSubType: "MASS_SET",
        /* data: [],*/
        infType: "indicator",
        "yAxis": this.axisId,
        "name": "SET",
        "color": color,
        "lineColor": color,
        "type": "line",
        lineWidth: 1,
        hideLegend: true,
        infRecal: true,
        hideToolTip: true,
        showInLegend: false
    }, false);

    color = infChart.util.getNextSeriesColor(chartId);
    this.series[2] = chartInstance.addSeries({
        "id": id + "_MASS_TRIGG",
        infIndType: "MASS",
        infIndSubType: "MASS_TRIGG",
        /* data: [],*/
        infType: "indicator",
        "yAxis": this.axisId,
        "name": "TRIGG",
        "color": color,
        "lineColor": color,
        "type": "line",
        lineWidth: 1,
        hideLegend: true,
        hideToolTip: true,
        showInLegend: false
    }, true);

    this.style[this.series[1].options.id] = ["line", "dash"];
    this.style[this.series[2].options.id] = ["line", "dash"];
};

infChart.util.extend(infChart.Indicator, infChart.MassIndexIndicator);

infChart.MassIndexIndicator.prototype.calculate = function (ohlc, data, redraw, seriesId) {
    var high = ohlc.h,
        low = ohlc.l,
        close = ohlc.c;
    if (data && data.length > 0) {
        var chart = this.chart;
        if (!seriesId) {
            var mass = this.getSeries(high, low, infChart.indicatorDefaults.EXPONENTIALMOVINGAVERAGE, 9, this.params.period);
            var _mass = this.merge(data, mass);
            chart.get(this.id).setData(_mass, false, false, false);

        }
        if (!seriesId || seriesId == (this.id + '_MASS_SET')) {
            var series = chart.get(this.id + '_MASS_SET');
            if (series.options.type != "arearange") {
                series.setData(this.getBand(data, series.options.type, this.params.setup, this.params.setup), redraw, false, false);
            }
        }
        if (!seriesId || seriesId == (this.id + '_MASS_TRIGG')) {
            var series4 = chart.get(this.id + '_MASS_TRIGG');
            if (series4.options.type != "arearange") {
                series4.setData(this.getBand(data, series4.options.type, this.params.trigg, this.params.trigg), redraw, false, false);
            } else {
                series4.setData(this.getBand(data, series4.options.type, this.params.lowerLevel, 0), redraw, false, false);
            }
        }
    }
};

infChart.MassIndexIndicator.prototype.getSeries = function (hts, lts, ma, nop1, nop2) {
    var k, retval1, retval2, ts, tr;

    ts = new Array(hts.length);
    retval1 = new Array(hts.length);
    retval2 = new Array(hts.length);

    for (k = 0; k < ts.length; k++) {
        ts[k] = hts[k] - lts[k];
    }

    retval1 = this.movmean(ts, ma, nop1);
    retval2 = this.movmean(retval1, ma, nop1);


    for (k = 0; k < retval1.length; k++) {
        if (retval2[k]) {
            retval1[k] = retval1[k] / retval2[k];
        }
    }
    retval1 = this.movsum(retval1, nop2, true);

    return retval1;
};

/**
 * hide indicator
 */
infChart.MassIndexIndicator.prototype.hideIndicator = function (seriesId) {
    infChart.Indicator.prototype.hideIndicator.apply(this, [seriesId, true]);
};

/**
 * show indicator
 */
infChart.MassIndexIndicator.prototype.showIndicator = function (seriesId) {
    infChart.Indicator.prototype.showIndicator.apply(this, [seriesId, true]);
};

//endregion ************************************** Mass Index (MASS)  Indicator******************************************

//region **************************************  Moving Average Centered (CMA) Indicator******************************************

/***
 * Constructor for Moving Average Centered (CMA) Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
 infChart.MovingAverageCenteredIndicator = function (id, chartId, type, chartInstance) {

    infChart.Indicator.apply(this, arguments);
    this.params.period = 21;

    this.titleParams = ["period"];

    var color = infChart.util.getNextSeriesColor(chartId);

    this.series[0] = chartInstance.addSeries({
        id: id,
        name: "CMA",
        infIndType: "CMA",
        infIndSubType: "CMA",
        /* data: [],*/
        infType: "indicator",
        yAxis: "#0",
        color: color,
        lineColor: color
    }, true);

};

infChart.util.extend(infChart.Indicator, infChart.MovingAverageCenteredIndicator);

infChart.MovingAverageCenteredIndicator.prototype.calculate = function (ohlc, data, redraw, seriesId) {
    var close = ohlc.c;
    if (data && data.length > 0) {
        var chart = this.chart;
        var cma = this.getSeries(close, infChart.indicatorDefaults.ARITHMETICMOVINGAVERAGE, this.params.period);
        var _cma = this.merge(data, cma);
        chart.get(this.id).setData(_cma, redraw, false, false);
    }
};

infChart.MovingAverageCenteredIndicator.prototype.getSeries = function (cts, ma, nop1) {
    var k, retval1, retval2;

    retval1 = new Array(cts.length);
    retval2 = new Array(cts.length);

    retval1 = this.movmean(cts, ma, nop1);


    for (k = 1; k < retval1.length; k++) {
        if (retval1[k] != undefined && retval1[k - 1] != undefined) {
            retval2[k] = (retval1[k] + retval1[k - 1]) / 2;
        }
    }

    return retval2;
};

//endregion ************************************** Moving Average Centered (CMA)  Indicator******************************************s
//region **************************************  Bid/ Ask Indicator (BA) Indicator******************************************

/***
 * Constructor for Bid/ Ask Indicator (BA) Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
 infChart.BidAskIndicator = function (id, chartId, type, chartInstance) {

    infChart.Indicator.apply(this, arguments);

    var color = infChart.util.getNextSeriesColor(chartId);

    this.series[0] = chartInstance.addSeries({
        id: id,
        name: "BA",
        infIndType: "BA",
        infIndSubType: "BID",
        /* data: [],*/
        infType: "indicator",
        yAxis: "#0",
        color: color,
        lineColor: color
    }, false);

    color = infChart.util.getNextSeriesColor(chartId);
    this.series[1] = chartInstance.addSeries({
        id: id + "_BA2",
        name: "BA",
        infIndType: "BA",
        infIndSubType: "ASK",
        /* data: [],*/
        infType: "indicator",
        yAxis: "#0",
        color: color,
        lineColor: color
    }, true);


};

infChart.util.extend(infChart.Indicator, infChart.BidAskIndicator);

infChart.BidAskIndicator.prototype.calculate = function (ohlc, data, redraw, seriesId) {
    var bid = ohlc.b;
    var ask = ohlc.a;
    if (data && data.length > 0) {
        var chart = this.chart;
        var _bid = this.merge(data, bid);
        chart.get(this.id).setData(_bid, redraw, false, false);
        var _ask = this.merge(data, ask);
        chart.get(this.id + "_BA2").setData(_ask, redraw, false, false);
    }
};

//endregion ************************************** Moving Average Centered (CMA)  Indicator******************************************

//region **************************************  Elliot Wave Oscillator (EWO) Indicator******************************************

/***
 * Constructor for Elliot Wave Oscillator (EWO) Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
 infChart.ElliotWaveOscillator = function (id, chartId, type, chartInstance) {

    infChart.Indicator.apply(this, arguments);
    this.params.period1 = 5;
    this.params.period2 = 35;

    this.titleParams = ["period1", "period2"];
    this.axisId = "#EWO_" + id;

    this.addAxis({
        id: this.axisId,
        startOnTick: false,
        endOnTick: false
    });

    var color = infChart.util.getNextSeriesColor(chartId);

    this.series[0] = chartInstance.addSeries({
        id: id,
        name: "EWO",
        infIndType: "EWO",
        infIndSubType: "EWO",
        /* data: [],*/
        type: "column",
        infType: "indicator",
        yAxis: this.axisId,
        showInLegend: false,
        threshold: 0,
        lineColor: color,
        color: color
    }, true);

};

infChart.util.extend(infChart.Indicator, infChart.ElliotWaveOscillator);

infChart.ElliotWaveOscillator.prototype.calculate = function (ohlc, data, redraw) {
    var close = ohlc.c;

    if (data && data.length > 0) {
        var chart = this.chart;
        var ewo = this.getSeries(close, infChart.indicatorDefaults.ARITHMETICMOVINGAVERAGE, this.params.period1, this.params.period2);

        var _ewo = this.merge(data, ewo);
        chart.get(this.id).setData(_ewo, redraw, false, false);

    }
};

infChart.ElliotWaveOscillator.prototype.getSeries = function (cts, ma, nop1, nop2) {
    var retVal1, retVal2, k, len;
    retVal1 = this.movmean(cts, ma, nop1);
    retVal2 = this.movmean(cts, ma, nop2);

    for (k = 0, len = retVal1.length; k < len; k++) {
        if (retVal1[k] != undefined && retVal2[k] != undefined) {
            retVal1[k] = retVal1[k] - retVal2[k];
        }
    }
    return retVal1;
};

//endregion ************************************** Elliot Wave Oscillator (EWO) Indicator******************************************

//region ************************************** Relative Strength Levy (RSL) Indicator******************************************

/***
 * Constructor for Relative Strength Levy (RSL) Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
 infChart.RelativeStrengthLevy = function (id, chartId, type, chartInstance) {

    infChart.Indicator.apply(this, arguments);
    this.params.period = 14;
    this.params.base = infChart.indicatorDefaults.ULCLOSEPRICE;

    this.titleParams = ["period"];
    this.axisId = "#RSL_" + id;

    this.addAxis({
        id: this.axisId,
        startOnTick: false,
        endOnTick: false
    });

    var color = infChart.util.getNextSeriesColor(chartId);

    this.series[0] = chartInstance.addSeries({
        id: id,
        name: "RSL",
        infIndType: "RSL",
        infIndSubType: "RSL",
        /* data: [],*/
        type: "line",
        infType: "indicator",
        yAxis: this.axisId,
        showInLegend: false,
        lineColor: color,
        color: color
    }, true);

};

infChart.util.extend(infChart.Indicator, infChart.RelativeStrengthLevy);

infChart.RelativeStrengthLevy.prototype.calculate = function (ohlc, data, redraw) {
    var high = ohlc.h,
        low = ohlc.l,
        close = ohlc.c,
        open = ohlc.o;

    if (data && data.length > 0) {
        var chart = this.chart;
        var rsl = this.getSeries(high, low, close, open, this.params.base, infChart.indicatorDefaults.ARITHMETICMOVINGAVERAGE, this.params.period);

        var _rsl = this.merge(data, rsl);
        chart.get(this.id).setData(_rsl, redraw, false, false);

    }
};

infChart.RelativeStrengthLevy.prototype.getSeries = function (hts, lts, cts, ots, ul, ma, nop) {
    var ts, retVal1, retVal2 = new Array(hts.length), k, len;
    ts = this.movul(hts, lts, cts, ots, ul);
    retVal1 = this.movmeanNew(ts, ma, nop);

    for (k = nop - 1, len = retVal1.length; k < len; k++) {
        if (retVal1[k] && this.isNumber(ts[k])) {
            retVal2[k] = ts[k] / retVal1[k];
        }
    }
    return retVal2;
};

//endregion ************************************** Relative Strength Levy (RSL) Indicator******************************************
//region ************************************** Keltner (KELT) Indicator******************************************

/***
 * Constructor for Keltner (KELT) Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
 infChart.KeltnerIndicator = function (id, chartId, type, chartInstance) {

    infChart.Indicator.apply(this, arguments);
    this.params.period1 = 20;
    this.params.period2 = 10;
    this.params.multiplier = 1;
    this.params.base = infChart.indicatorDefaults.ULCLOSEPRICE;

    this.titleParams = ["period1", "period2", "multiplier"];

    var color = infChart.util.getNextSeriesColor(chartId);

    this.series[0] = chartInstance.addSeries({
        id: id,
        name: "KELTUpper",
        infIndType: "KELT",
        infIndSubType: "KELTUpper",
        data: [],
        type: "line",
        infType: "indicator",
        yAxis: "#0",
        legendKey: "KELT",
        showInLegend: true,
        lineColor: color,
        color: color
    }, false);

    this.series[1] = chartInstance.addSeries({
        id: id + "_KELTM",
        name: "KELTMiddle",
        infIndType: "KELT",
        infIndSubType: "KELTMiddle",
        data: [],
        type: "line",
        dashStyle: "dot",
        infType: "indicator",
        yAxis: "#0",
        showInLegend: false,
        hideLegend: true,
        lineColor: color,
        color: color
    }, false);

    this.series[2] = chartInstance.addSeries({
        id: id + "_KELTL",
        name: "KELTLower",
        infIndType: "KELT",
        infIndSubType: "KELTLower",
        data: [],
        type: "line",
        infType: "indicator",
        yAxis: "#0",
        showInLegend: false,
        hideLegend: true,
        lineColor: color,
        color: color
    }, true);

};

infChart.util.extend(infChart.Indicator, infChart.KeltnerIndicator);

infChart.KeltnerIndicator.prototype.calculate = function (ohlc, data, redraw) {
    var high = ohlc.h,
        low = ohlc.l,
        close = ohlc.c,
        open = ohlc.o;

    if (data && data.length > 0) {
        var that = this;
        var kelt = this.getSeries(high, low, close, open, this.params.base, infChart.indicatorDefaults.EXPONENTIALMOVINGAVERAGE, infChart.indicatorDefaults.ARITHMETICMOVINGAVERAGE, this.params.period1, this.params.period2, this.params.multiplier);

        var _keltm = this.merge(data, kelt.middle, undefined, true);
        var _kelth = this.merge(data, kelt.upper, undefined, true);
        var _keltl = this.merge(data, kelt.lower, undefined, true);


        infChart.util.forEach(this.series, function (i, series) {
            switch (series.options.infIndSubType) {
                case 'KELTMiddle' :
                    series.setData(_keltm, false, false, false);
                    break;
                case 'KELTUpper' :
                    series.setData(_kelth, false, false, false);
                    break;
                case 'KELTLower' :
                    series.setData(_keltl, false, false, false);
                    break;
                default :
                    break;
            }

        });

        if (redraw) {
            var chart = this.chart;
            chart.redraw();
        }

    }
};

infChart.KeltnerIndicator.prototype.getSeries = function (hts, lts, cts, ots, ul, ma1, ma2, nop1, nop2, multiplier) {
    var ts, upper = new Array(hts.length), lower = new Array(hts.length), ema, atr, k, len;
    ts = this.movul(hts, lts, cts, ots, ul);
    ema = this.movmeanNew(ts, ma1, nop1);
    atr = this.movmeanNew(this.trNew(hts, lts, cts), ma2, nop2);

    var maxnop = Math.max(nop1, nop2);

    for (k = maxnop - 1, len = ts.length; k < len; k++) {
        if (this.isNumber(ema[k]) && this.isNumber(atr[k])) {
            upper[k] = ema[k] + multiplier * atr[k];
            lower[k] = ema[k] - multiplier * atr[k];
        }
    }
    return {middle: ema, upper: upper, lower: lower};
};

//endregion ************************************** Keltner (KELT) Indicator******************************************
//region ************************************** MACD Cross Signal (MACDCrossSignal) Indicator******************************************

/***
 * Constructor forMACD Cross Signal (MACDCrossSignal) Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
 infChart.MACDCrossSignal = function (id, chartId, type, chartInstance) {

    infChart.Indicator.apply(this, arguments);
    this.params.mov1 = 12;
    this.params.mov2 = 26;
    this.params.trigger = 9;
    this.params.base = infChart.indicatorDefaults.ULCLOSEPRICE;
    this.titleParams = ["mov1", "mov2", "trigger"];
    this.icons["infUDSignal"] = "icon ico-arrow-up";

    var upColor = infChart.util.getDefaultUpColor(), downColor = infChart.util.getDefaultDownColor();

    this.series[0] = chartInstance.addSeries({
        id: id,
        name: "MACDCrossBuy",
        infIndType: "MACDCross",
        infIndSubType: "MACDCrossBuy",
        /* data: [],*/
        type: "infUDSignal",
        shape: "arr",
        infType: "indicator",
        infAvoidToolTipSel: true,
        yAxis: "#0",
        showInLegend: true,
        y: 12,
        onKey: "low",
        onSeries: "c0",
        lineColor: upColor,
        fillColor: upColor,
        /*textAlign : "top",*/
        style: {fontWeight: "bold", fontSize: "8px", color: "#fff"},
        title: "B",
        color: upColor
    }, true);

    this.series[1] = chartInstance.addSeries({
        id: id + '_MACDCrossSell',
        name: "MACDCrossSell",
        infIndType: "MACDCross",
        infIndSubType: "MACDCrossSell",
        /* data: [],*/
        type: "infUDSignal",
        shape: "arr",
        infType: "indicator",
        infAvoidToolTipSel: true,
        yAxis: "#0",
        onKey: "high",
        onSeries: "c0",
        hideLegend: true,
        showInLegend: false,
        style: {fontWeight: "bold", fontSize: "8px", color: "#fff"},
        lineColor: downColor,
        fillColor: downColor,
        title: "S",
        color: downColor
    }, true);

    this.style[this.series[0].options.id] = ["infUDSignal"];
    this.style[this.series[1].options.id] = ["infUDSignal"];
};

infChart.util.extend(infChart.Indicator, infChart.MACDCrossSignal);

infChart.MACDCrossSignal.prototype.calculate = function (ohlc, data, redraw) {
    var high = ohlc.h,
        low = ohlc.l,
        close = ohlc.c,
        open = ohlc.o,
        that = this;

    if (data && data.length > 0) {
        var macdCross = that.getSeries(high, low, close, open, that.params.base, infChart.indicatorDefaults.EXPONENTIALMOVINGAVERAGE, that.params.mov1, that.params.mov2, that.params.trigger);

        infChart.util.forEach(this.series, function (i, series) {
            switch (series.options.infIndSubType) {
                case 'MACDCrossBuy':
                    var _macd = that.merge(data, macdCross.buy);
                    series.setData(_macd, false, false, false);
                    break;
                case 'MACDCrossSell':
                    var _macd2 = that.merge(data, macdCross.sell);
                    series.setData(_macd2, false, false, false);
                    break;
            }
        });

        var type = infChart.manager.getChart(that.chartId).type;
        that.resetSeriesOptions(type);

        if (redraw) {
            var chart = this.chart;
            chart.redraw();
        }
    }
};

infChart.MACDCrossSignal.prototype.getSeries = function (hts, lts, cts, ots, ul, ma, nocp1, nocp2, nocp3) {
    var ts,
        result1,
        result2,
        k,
        result3,
        result12 = new Array(cts.length),
        resultb = new Array(cts.length),
        resultr = new Array(cts.length),
        maxnop;

    ts = this.movul(hts, lts, cts, ots, ul);
    result1 = this.movmeanNew(ts, ma, nocp1);
    result2 = this.movmeanNew(ts, ma, nocp2);

    maxnop = Math.max(nocp1, nocp2);

    for (k = maxnop - 1; k < result1.length; k++) {

        if (this.isNumber(result1[k]) && this.isNumber(result2[k]))
            result12[k] = result1[k] - result2[k];
    }

    result3 = this.movmeanNew(result12, ma, nocp3);

    for (k = maxnop + nocp3 - 2; k < result3.length; k++) {

        if (this.isNumber(result12[k - 1]) && this.isNumber(result3[k - 1]) && this.isNumber(result12[k]) && this.isNumber(result3[k])) {

            if (result12[k - 1] < result3[k - 1] && result12[k] > result3[k]) {
                resultb[k] = lts[k];
            } else if (result12[k - 1] > result3[k - 1] && result12[k] < result3[k]) {
                resultr[k] = hts[k];
            }
        }

    }

    return {buy: resultb, sell: resultr};
};

infChart.MACDCrossSignal.prototype.getTooltipValue = function (point) {
    var tooltipData;
    if (!point.series.hideToolTip) {
        var value = infChart.manager.getLabel("label.buy");
        if (point.series.options.infIndSubType == "MACDCrossSell") {
            value = infChart.manager.getLabel("label.sell");
        }

        tooltipData = {
            'raw': {'value': value, 'time': point.x},
            'formatted': {'value': value, 'time': infChart.manager.getChart(this.chartId).getTooltipTime(point.x)},
            'label': this.getLabel(point.series.options.id, "indicatorShortDesc"),
            'color': this.getTooltipColor(point.series)
        };
    }
    return tooltipData;
};

/**
 * Mathod To Reset the series options if required befor redraw the chart
 * @param type
 */
infChart.MACDCrossSignal.prototype.resetSeriesOptions = function (type) {
    if (type == "line" || type == "area" || type == "column") {
        this.series[0].update({onKey: 'y'}, false);
        this.series[1].update({onKey: 'y'}, false);
    } else {
        this.series[0].update({onKey: 'low'}, false);
        this.series[1].update({onKey: 'high'}, false);
    }
};
//endregion ************************************** MACD Cross Signal (MACD Cross) Indicator******************************************

//region ************************************** MACD Cross and Over Zero Signal (MACDCrossOverZeroSignal) Indicator******************************************

/***
 * Constructor forMACD Cross Signal (MACDCrossOverZeroSignal) Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
 infChart.MACDCrossOverZeroSignal = function (id, chartId, type, chartInstance) {

    infChart.Indicator.apply(this, arguments);
    this.params.mov1 = 12;
    this.params.mov2 = 26;
    this.params.trigger = 9;
    this.params.base = infChart.indicatorDefaults.ULCLOSEPRICE;
    this.titleParams = ["mov1", "mov2", "trigger"];
    this.icons["infUDSignal"] = "icon ico-arrow-up";

    var upColor = infChart.util.getDefaultUpColor(), downColor = infChart.util.getDefaultDownColor();

    this.series[0] = chartInstance.addSeries({
        id: id,
        name: "MACDCrossOverZeroSignal",
        infIndType: "MACDCrossOverZeroSignal",
        infIndSubType: "MACDCrossOverZeroSignalBuy",
        /* data: [],*/
        type: "infUDSignal",
        shape: "arr",
        infType: "indicator",
        yAxis: "#0",
        showInLegend: true,
        onKey: "low",
        onSeries: "c0",
        infAvoidToolTipSel: true,
        lineColor: upColor,
        fillColor: upColor,
        /*textAlign : "top",*/
        style: {fontWeight: "bold", fontSize: "8px", color: "#fff"},
        title: "B",
        y: 12,
        color: upColor
    }, true);

    this.series[1] = chartInstance.addSeries({
        id: id + '_MACDCrossOverZeroSignalSell',
        name: "MACDCrossOverZeroSignal",
        infIndType: "MACDCrossOverZeroSignal",
        infIndSubType: "MACDCrossOverZeroSignalSell",
        /* data: [],*/
        type: "infUDSignal",
        infAvoidToolTipSel: true,
        shape: "arr",
        infType: "indicator",
        yAxis: "#0",
        onKey: "high",
        onSeries: "c0",
        hideLegend: true,
        showInLegend: false,
        style: {fontWeight: "bold", fontSize: "8px", color: "#fff"},
        lineColor: downColor,
        fillColor: downColor,

        title: "S",
        color: downColor
    }, true);

    this.style[this.series[0].options.id] = ["infUDSignal"];
    this.style[this.series[1].options.id] = ["infUDSignal"];
};

infChart.util.extend(infChart.Indicator, infChart.MACDCrossOverZeroSignal);

infChart.MACDCrossOverZeroSignal.prototype.calculate = function (ohlc, data, redraw) {
    var high = ohlc.h,
        low = ohlc.l,
        close = ohlc.c,
        open = ohlc.o;
    var that = this;

    if (data && data.length > 0) {
        var macdCross = that.getSeries(high, low, close, open, that.params.base, infChart.indicatorDefaults.EXPONENTIALMOVINGAVERAGE, that.params.mov1, that.params.mov2, that.params.trigger);
        infChart.util.forEach(this.series, function (i, series) {
            switch (series.options.infIndSubType) {
                case 'MACDCrossOverZeroSignalBuy':
                    var _macd = that.merge(data, macdCross.buy);
                    series.setData(_macd, false, false, false);
                    break;
                case 'MACDCrossOverZeroSignalSell':
                    var _macd2 = that.merge(data, macdCross.sell);
                    series.setData(_macd2, false, false, false);
                    break;
            }
        });

        var type = infChart.manager.getChart(that.chartId).type;
        that.resetSeriesOptions(type);
        if (redraw) {
            var chart = this.chart;
            chart.redraw();
        }
    }
};

infChart.MACDCrossOverZeroSignal.prototype.getSeries = function (hts, lts, cts, ots, ul, ma, nocp1, nocp2, nocp3) {
    var ts,
        result1,
        result2,
        k,
        result3,
        result12 = new Array(cts.length),
        resultb = new Array(cts.length),
        resultr = new Array(cts.length),
        maxnop;

    ts = this.movul(hts, lts, cts, ots, ul);
    result1 = this.movmeanNew(ts, ma, nocp1);
    result2 = this.movmeanNew(ts, ma, nocp2);

    maxnop = Math.max(nocp1, nocp2);

    for (k = maxnop - 1; k < result1.length; k++) {
        if (this.isNumber(result1[k]) && this.isNumber(result2[k]))
            result12[k] = result1[k] - result2[k];
    }

    result3 = this.movmeanNew(result12, ma, nocp3);

    for (k = maxnop + nocp3 - 2; k < result3.length; k++) {

        if (this.isNumber(result12[k - 1]) && this.isNumber(result3[k - 1]) && this.isNumber(result12[k]) && this.isNumber(result3[k])) {

            if (result12[k - 1] < result3[k - 1] && result12[k] > result3[k] && result12[k] > 0) {
                resultb[k] = cts[k];
            } else if (result12[k - 1] > result3[k - 1] && result12[k] < result3[k]) {
                resultr[k] = cts[k];
            }
        }
    }

    return {buy: resultb, sell: resultr};
};

infChart.MACDCrossOverZeroSignal.prototype.getTooltipValue = function (point) {
    var tooltipData;
    if (!point.series.hideToolTip) {
        var value = infChart.manager.getLabel("label.buy");
        if (point.series.options.infIndSubType == "MACDCrossOverZeroSignalSell") {
            value = infChart.manager.getLabel("label.sell");
        }

        tooltipData = {
            'raw': {'value': value, 'time': point.x},
            'formatted': {'value': value, 'time': infChart.manager.getChart(this.chartId).getTooltipTime(point.x)},
            'label': this.getLabel(point.series.options.id, "indicatorShortDesc"),
            'color': this.getTooltipColor(point.series)
        };
    }
    return tooltipData;
};

/**
 * Mathod To Reset the series options if required befor redraw the chart
 * @param type
 */
infChart.MACDCrossOverZeroSignal.prototype.resetSeriesOptions = function (type) {
    if (type == "line" || type == "area" || type == "column") {
        this.series[0].update({onKey: 'y'}, false);
        this.series[1].update({onKey: 'y'}, false);
    } else {
        this.series[0].update({onKey: 'low'}, false);
        this.series[1].update({onKey: 'high'}, false);
    }
};
//endregion ************************************** end of MACD Cross Signal (MACD Cross) Indicator******************************************

//region ************************************** Bearish Engulfing (BearEng) Indicator******************************************

/***
 * Constructor for Bearish Engulfing (BearEng) Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
 infChart.BearishEngulfingIndicator = function (id, chartId, type, chartInstance) {

    infChart.Indicator.apply(this, arguments);

    this.params.period = 5;
    this.params.nBars = 1;
    this.titleParams = ["period", "nBars"];
    this.icons["infsignal"] = "icon ico-arrow-up";
    this.icons["plotrange"] = "icon ico-shape1";

    var downColor = infChart.util.getDefaultDownColor();

    /* this.series[0] = chart.chart.addSeries({
     id: id ,
     name: "BearEng",
     infIndType: "BearEng",
     infIndSubType: "BearEngBar",
     type: "plotarearange",
     infType: "indicator",
     yAxis: "#0",
     connectNulls : false,
     step : true,
     /!*data : [],*!/
     showInLegend : true,/!*
     style : {fontWeight : "bold" , fontSize :"8px", color : "#fff"},*!/
     grouping : false,
     groupPadding : 0,
     pointPadding : 0,
     borderWidth : 0,
     fillOpacity:0.5,
     //pointPlacement:'between',
     title : "S"
     }, false);*/
    this.series[0] = chartInstance.addSeries({
        id: id,
        name: "BearEng",
        infIndType: "BearEng",
        infIndSubType: "BearEngBar",
        type: "plotrange",
        infType: "indicator",
        yAxis: "#0",
        /*data : [],*/
        showInLegend: false,
        hideLegend: true, /*
         style : {fontWeight : "bold" , fontSize :"8px", color : "#fff"},*/
        groupPadding: 0,
        pointPadding: 0,
        onSeries: chartInstance.series[0].options.id,
        borderWidth: 0,
        fillOpacity: 0.5,
        pointPlacement: 'on',
        title: "S"
    }, false);
    this.series[1] = chartInstance.addSeries({
        id: id + '_BearEngSignal',
        name: "BearEngSignal",
        infIndType: "BearEng",
        infIndSubType: "BearEngSignal",
        /*data: [],*/
        type: "infsignal",
        shape: "downarw",
        infType: "indicator",
        yAxis: "#0",
        hideLegend: false,
        showInLegend: true,
        hideToolTip: true,
        infAvoidToolTipSel: true,
        onKey: "high",
        onSeries: this.series[0].options.id,
        lineColor: downColor,
        fillColor: downColor,
        color: downColor,
        /*textAlign : "top",*/
        textAlign: "top",
        style: {fontWeight: "bold", fontSize: "10px", color: downColor},
        title: "BearEng"
    }, true);


    this.style[this.series[0].options.id] = ["plotrange"];
    this.style[this.series[1].options.id] = ["infsignal"];
    this.onOff = [this.series[0].options.id, this.series[1].options.id];

};

infChart.util.extend(infChart.Indicator, infChart.BearishEngulfingIndicator);

infChart.BearishEngulfingIndicator.prototype.calculate = function (ohlc, data, redraw) {
    var high = ohlc.h,
        low = ohlc.l,
        close = ohlc.c,
        open = ohlc.o,
        that = this;

    if (data && data.length > 0) {
        var macdCross = that.getSeries(high, low, close, open, infChart.indicatorDefaults.EXPONENTIALMOVINGAVERAGE, parseInt(that.params.period), parseInt(this.params.nBars));
        infChart.util.forEach(this.series, function (i, series) {
            switch (series.options.infIndSubType) {
                case 'BearEngBar':
                    var _macd = that.merge(data, macdCross.barh, macdCross.barl, true);
                    series.setData(_macd, true, false, false); //  redraw since signal is depend on this series
                    break;
                case 'BearEngSignal':
                    var _macd2 = that.merge(data, macdCross.bar);
                    series.setData(_macd2, false, false, false);
                    break;
            }
        });
        if (redraw) {
            var chart = this.chart;
            chart.redraw();
        }
    }
};

infChart.BearishEngulfingIndicator.prototype.getSeries = function (hts, lts, cts, ots, ma, period, nBars) {
    var i,
        len = cts.length,
        k = Math.min(cts.length - 1, period - 1) + 4,
        resultb = new Array(cts.length),
        resultbh = new Array(cts.length),
        resultbl = new Array(cts.length),
        ema = this.movmeanNew(cts, ma, period),
        condition2,
        condition3,
        condition5,
        condition4,
        trend;


    if (cts.length >= k) {
        for (k; k < cts.length; k++) {

            trend = cts[k] < cts[k - 2] && cts[k - 2] > cts[k - 4] && cts[k - 1] > cts[k - 3];

            if (trend) {

                condition2 = (ema[k - 1] < cts[k - 1] && ema[k - 2] < cts[k - 2] && ema[k - 3] < cts[k - 3] && ema[k - 4] < cts[k - 4] );

                if (condition2) {

                    condition3 = cts[k - 1] > ots[k - 1] && cts[k] < ots[k];
                    condition4 = cts[k] < ots[k - 1] && cts[k - 1] < ots[k];

                    if (condition3 && condition4) {

                        condition5 = true;

                        for (i = k - 1; i < k - 1 + nBars && i < len; i++) {

                            if (!(ots[i] > ema[i] && cts[i] > ema[i])) {

                                condition5 = false;
                                break;
                            }
                        }

                        if (condition5) {

                            resultb[k] = hts[k];
                            resultbh[k - 1] = Math.max(hts[k], hts[k - 1]);
                            resultbh[k] = Math.max(hts[k], hts[k - 1]);
                            resultbl[k] = Math.min(lts[k], lts[k - 1]);
                            resultbl[k - 1] = Math.min(lts[k], lts[k - 1]);
                        }
                    }
                }
            }
        }
    }

    return {bar: resultb, barh: resultbh, barl: resultbl};
};

infChart.BearishEngulfingIndicator.prototype.getTooltipValue = function (point) {
    var tooltipData;
    if (!point.series.hideToolTip) {
        tooltipData = {
            'raw': {'value': '', 'time': point.x},
            'formatted': {'value': '', 'time': infChart.manager.getChart(this.chartId).getTooltipTime(point.x)},
            'label': this.getLabel(point.series.options.id, "indicatorShortDesc"),
            'color': this.getTooltipColor(point.series)
        };
    }
    return tooltipData;
};

infChart.BearishEngulfingIndicator.prototype.getTooltipValueByBaseRow = function (point, indRow, baseRowIdx) {
    return this.getTooltipValue(point);
};

infChart.BearishEngulfingIndicator.prototype.getTooltipColor = function (series) {
    return this.series[1].color;
};

infChart.BearishEngulfingIndicator.prototype.getContextMenuOptions = function (chartId, series, options) {
    return {
        "removeIndicator": {
            icon : options.removeIndicator.icon,
            displayText :options.removeIndicator.displayText,
            action : function () {
                infChart.indicatorMgr.removeIndicator(chartId, series.options.id);
            }
        }
    }
};

//endregion ************************************** end of Bearish Engulfing (BearEng) Indicator******************************************

//region ************************************** Bullish Engulfing (BullishEng) Indicator******************************************

/***
 * Constructor for Bullish Engulfing (BullishEng) Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
 infChart.BullishEngulfingIndicator = function (id, chartId, type, chartInstance) {

    infChart.Indicator.apply(this, arguments);
    this.params.period = 5;
    this.params.nBars = 1;
    this.titleParams = ["period", "nBars"];
    this.icons["infsignal"] = "icon ico-arrow-up";
    this.icons["plotrange"] = "icon ico-shape1";

    var upColor = infChart.util.getDefaultUpColor(), downColor = infChart.util.getDefaultDownColor();

    this.series[0] = chartInstance.addSeries({
        id: id,
        name: "BullishEng",
        infIndType: "BullishEng",
        infIndSubType: "BullishEngBar",
        type: "plotrange",
        infType: "indicator",
        yAxis: "#0",
        showInLegend: false,
        hideLegend: true,
        groupPadding: 0,
        pointPadding: 0,
        onSeries: chartInstance.series[0].options.id,
        borderWidth: 0,
        fillOpacity: 0.5,
        pointPlacement: 'on',
        title: "S"
    }, false);
    this.series[1] = chartInstance.addSeries({
        id: id + '_BullishEngSignal',
        name: "BullishEngSignal",
        infIndType: "BullishEng",
        infIndSubType: "BullishEngSignal",
        /* data: [],*/
        type: "infsignal",
        shape: "uparw",
        infType: "indicator",
        yAxis: "#0",
        showInLegend: true,
        hideLegend: false,
        hideToolTip: true,
        infAvoidToolTipSel: true,
        onKey: "low",
        onSeries: this.series[0].options.id,
        lineColor: upColor,
        fillColor: upColor,
        color: upColor,
        /*textAlign : "top",*/
        textAlign: "bottom",
        style: {fontWeight: "bold", fontSize: "10px", color: upColor},
        title: "BullEng"/*,
         y : 12*/
    }, true);


    this.style[this.series[0].options.id] = ["plotrange"];
    this.style[this.series[1].options.id] = ["infsignal"];
    this.onOff = [this.series[0].options.id, this.series[1].options.id];

};

infChart.util.extend(infChart.Indicator, infChart.BullishEngulfingIndicator);

infChart.BullishEngulfingIndicator.prototype.calculate = function (ohlc, data, redraw) {
    var high = ohlc.h,
        low = ohlc.l,
        close = ohlc.c,
        open = ohlc.o,
        that = this;

    if (data && data.length > 0) {
        var macdCross = that.getSeries(high, low, close, open, infChart.indicatorDefaults.EXPONENTIALMOVINGAVERAGE, parseInt(that.params.period), parseInt(this.params.nBars));
        infChart.util.forEach(this.series, function (i, series) {
            switch (series.options.infIndSubType) {
                case 'BullishEngBar':
                    var _macd = that.merge(data, macdCross.barh, macdCross.barl, true);
                    series.setData(_macd, true, false, false);
                    break;
                case 'BullishEngSignal':
                    var _macd2 = that.merge(data, macdCross.bar);
                    series.setData(_macd2, false, false, false);
                    break;
            }
        });

        if (redraw) {
            var chart = this.chart;
            chart.redraw();
        }
    }
};

infChart.BullishEngulfingIndicator.prototype.getSeries = function (hts, lts, cts, ots, ma, period, nBars) {
    var i,
        len = cts.length,
        k = Math.min(cts.length - 1, period - 1) + 4,
        resultb = new Array(cts.length),
        resultbh = new Array(cts.length),
        resultbl = new Array(cts.length),
        ema = this.movmeanNew(cts, ma, period),
        condition2,
        condition3,
        condition5,
        condition4,
        trend;

    if (cts.length >= k) {

        for (k; k < cts.length; k++) {

            trend = cts[k] > cts[k - 2] && cts[k - 2] < cts[k - 4] && cts[k - 1] < cts[k - 3];

            if (trend) {

                condition2 = (ema[k - 1] > cts[k - 1] && ema[k - 2] > cts[k - 2] && ema[k - 3] > cts[k - 3] && ema[k - 4] > cts[k - 4] );

                if (condition2) {

                    condition3 = cts[k - 1] < ots[k - 1] && cts[k] > ots[k];
                    condition4 = cts[k] > ots[k - 1] && cts[k - 1] > ots[k];

                    if (condition3 && condition4) {

                        condition5 = true;

                        for (i = k - 1; i < k - 1 + nBars && i < len; i++) {

                            if (!(ots[i] < ema[i] && cts[i] < ema[i])) {

                                condition5 = false;
                                break;
                            }
                        }

                        if (condition5) {

                            resultb[k] = hts[k];
                            resultbh[k - 1] = Math.max(hts[k], hts[k - 1]);
                            resultbh[k] = Math.max(hts[k], hts[k - 1]);
                            resultbl[k] = Math.min(lts[k], lts[k - 1]);
                            resultbl[k - 1] = Math.min(lts[k], lts[k - 1]);
                        }
                    }
                }
            }

        }
    }

    return {bar: resultb, barh: resultbh, barl: resultbl};
};

infChart.BullishEngulfingIndicator.prototype.getTooltipValue = function (point) {
    var tooltipData;
    if (!point.series.hideToolTip) {
        tooltipData = {
            'raw': {'value': '', 'time': point.x},
            'formatted': {'value': '', 'time': infChart.manager.getChart(this.chartId).getTooltipTime(point.x)},
            'label': this.getLabel(point.series.options.id, "indicatorShortDesc"),
            'color': this.getTooltipColor(point.series)
        };
    }
    return tooltipData;
};


infChart.BullishEngulfingIndicator.prototype.getTooltipValueByBaseRow = function (point, indRow, baseRowIdx) {
    return this.getTooltipValue(point);
};

infChart.BullishEngulfingIndicator.prototype.getTooltipColor = function (series) {
    return this.series[1].color;
};

infChart.BullishEngulfingIndicator.prototype.getContextMenuOptions = function (chartId, series, options) {
    return {
        "removeIndicator": {
            icon : options.removeIndicator.icon,
            displayText :options.removeIndicator.displayText,
            action : function () {
                infChart.indicatorMgr.removeIndicator(chartId, series.options.id);
            }
        }
    }
};



//endregion ************************************** end of Bullish Engulfing (BullishEng) Indicator******************************************

//region **************************************Bid/Ask History Indicator******************************************

/***
 * Cunstructor for Bid/Ask History indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
 infChart.BidAskHistoryIndicator = function (id, chartId, type, chartInstance) {
    infChart.Indicator.apply(this, arguments);
    this.disableSettings = true;

    var theme =
    {
        bid: {
            lineColor: '#0074db',
            fillColor: '#0074db',
            fillOpacity: 0.2
        },
        ask: {
            lineColor: '#ff771b',
            fillColor: '#ff771b',
            fillOpacity: 0.2
        }
    };

    if (Highcharts.theme && Highcharts.theme.indicator && Highcharts.theme.indicator.BAH) {
        theme = infChart.util.merge(theme, Highcharts.theme.indicator.BAH);
    }

    this.series[0] = chartInstance.addSeries({
        id: id,
        name: "AHL",
        infIndType: "BAH",
        infIndSubType: "AHL",
        type: "line",
        color: theme.ask.lineColor,
        lineColor: theme.ask.lineColor,
        infType: "indicator",
        yAxis: "#0",
        zIndex: 3,
        step: "center",
        hideLegend: true,
        hideToolTip: true,
        showInLegend: false,
        showInNavigator: false
    }, false);

    this.series[1] = chartInstance.addSeries({
        id: id + '_AHR',
        name: "Ask",
        infIndType: "BAH",
        infIndSubType: "AHR",
        type: "arearange",
        color: theme.ask.fillColor,
        lineColor: theme.ask.fillColor,
        infType: "indicator",
        lineWidth: 0,
        yAxis: "#0",
        zIndex: 3,
        step: "center",
        fillOpacity: theme.ask.fillOpacity,
        hideLegend: true,
        hideToolTip: true,
        showInLegend: false,
        showInNavigator: false,
        states: {
            hover: {
                lineWidth: 0,
                lineWidthPlus: 0
            }
        }
    }, false);

    this.series[2] = chartInstance.addSeries({
        id: id + '_BLL',
        infIndType: "BAH",
        infIndSubType: "BLL",
        name: "BLL",
        type: "line",
        color: theme.bid.lineColor,
        lineColor: theme.bid.lineColor,
        infType: "indicator",
        yAxis: "#0",
        zIndex: 3,
        step: "center",
        hideLegend: true,
        hideToolTip: true,
        showInLegend: false,
        showInNavigator: false
    }, false);

    this.series[3] = chartInstance.addSeries({
        id: id + '_BLR',
        infIndType: "BAH",
        infIndSubType: "BLR",
        name: "Bid",
        type: "arearange",
        color: theme.bid.fillColor,
        lineColor: theme.ask.fillColor,
        lineWidth: 0,
        infType: "indicator",
        yAxis: "#0",
        zIndex: 3,
        step: "center",
        fillOpacity: theme.ask.fillOpacity,
        hideLegend: true,
        hideToolTip: true,
        showInLegend: false,
        showInNavigator: false,
        states: {
            hover: {
                lineWidth: 0,
                lineWidthPlus: 0
            }
        }
    }, false);
};

infChart.util.extend(infChart.Indicator, infChart.BidAskHistoryIndicator);

infChart.BidAskHistoryIndicator.prototype.calculate = function (ohlc, data, redraw) {
    var askHigh = ohlc.ah,
        askLast = ohlc.a,
        bidLast = ohlc.b,
        bidLow = ohlc.bl;

    if (data && data.length > 0) {
        var i = 0, dataLen = data.length, ahl = [], ahr = [], bll = [], blr = [];
        for (i; i < dataLen; i++) {
            if (askLast[i] != undefined && askLast[i] !== 0) {
                ahl.push([data[i][0], askLast[i]]);
                if (askHigh[i] != undefined && askHigh[i] !== 0) {
                    ahr.push([data[i][0], askHigh[i], askLast[i]]);
                } else {
                    ahr.push([data[i][0], askHigh[i], askHigh[i]]);
                }
            }
            if (bidLast[i] != undefined && bidLast[i] !== 0) {
                bll.push([data[i][0], bidLast[i]]);
                if (bidLow[i] != undefined && bidLow[i] !== 0) {
                    blr.push([data[i][0], bidLast[i], bidLow[i]]);
                } else {
                    blr.push([data[i][0], bidLast[i], bidLast[i]]);
                }
            }
        }

        //var ignoreZerosAndMerge = function (d1, s1, s2) {
        //    var retval = [],
        //        i,
        //        count = 0;
        //    if (s2) {
        //        for (i = 0; i < d1.length; i++) {
        //            if (s1[i] != undefined && s2[i] != undefined && (s1[i] !== 0 && s2[i] !== 0)) {
        //                retval[count] = [d1[i][0], s1[i], s2[i]];
        //                count++;
        //            }
        //        }
        //    } else {
        //        for (i = 0; i < d1.length; i++) {
        //            if (s1[i] != undefined && s1[i] !== 0) {
        //                retval[count] = [d1[i][0], s1[i]];
        //                count++;
        //            }
        //        }
        //    }
        //    return retval;
        //};
        //var ahl = ignoreZerosAndMerge(data, askLast),
        //    ahr = ignoreZerosAndMerge(data, askHigh, askLast),
        //    bll = ignoreZerosAndMerge(data, bidLast),
        //    blr = ignoreZerosAndMerge(data, bidLast, bidLow);

        infChart.util.forEach(this.series, function (i, series) {
            switch (series.options.infIndSubType) {
                case 'AHL' :
                    series.setData(ahl, false, false, false);
                    break;
                case 'AHR' :
                    series.setData(ahr, false, false, false);
                    break;
                case 'BLL' :
                    series.setData(bll, false, false, false);
                    break;
                case 'BLR' :
                    series.setData(blr, false, false, false);
                    break;
                default :
                    break;
            }

        });

        if (redraw) {
            var chart = this.chart;
            chart.redraw();
        }
    }

};

infChart.BidAskHistoryIndicator.prototype.removeSeries = function (seriesId) {
    var index = -1;
    infChart.util.forEach(this.series, function (i, ind) {
        if (seriesId === ind.options.id) {
            index = i;
            ind.remove(false);
        }
    });

    this.series.splice(index, 1);

    if (this.series.length === 0) {
        this.destroy();
    }

};

//endregion **************************************Bid/Ask History Indicator******************************************

//region ************************************** Spread (SPREAD) Indicator******************************************

/***
 * Constructor for Spread (SPREAD)  Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
 infChart.SpreadIndicator = function (id, chartId, type, chartInstance) {

    var _self = this;
    infChart.Indicator.apply(this, arguments);

    this.axisId = "#SPREAD_" + id;
    this.heightPercent = 800;
    this.isDynamic = true;

    var chart = infChart.manager.getChart(chartId);

    this.addAxis({
        "id": this.axisId,
        "startOnTick": false,
        "endOnTick": false,
        "labels": {
            formatter: function (labelObj) {
                labelObj = labelObj || this;
                if (labelObj && labelObj.value != undefined) {
                    var value = labelObj.value;
                    return value + '%'
                }
            }
        }
    });

    this.seriesMap = {};

    this.removeEventIdx = chart.registerForEvents("onRemoveCompareSymbol", function (symbol) {
        // remove series
        var compareSeriesId = chart.getCompareSeriesId(symbol),
            indId = id + "_SPREAD" + compareSeriesId;
        if (_self.seriesMap[compareSeriesId]) {
            chart.removeSeries(indId, false);
            delete _self.seriesMap[compareSeriesId];
        }

    });

    this.addEventIdx = chart.registerForEvents("onAddCompareSymbol", function (symbol) {
        _self._addCompareSeries(symbol);
    });

    this.baseSetEventIdx = chart.registerForEvents("setSymbol", function (symbol) {
        if (JSON.stringify(this.seriesMap) != JSON.stringify({})) {
            _self.updateTitle();
        }
    });

};

infChart.util.extend(infChart.Indicator, infChart.SpreadIndicator);

infChart.SpreadIndicator.prototype.getRequiredDataTypes = function () {
    return ['base', 'compare'];
};

infChart.SpreadIndicator.prototype.calculate = function (ohlc, data, redraw, seriesId, allData, extremes) {
    var _self = this,
        chartObj = infChart.manager.getChart(this.chartId),
        doCalculate = true;

    if (extremes) {
        doCalculate = !_self.lastExtremes || !(_self.lastExtremes.interval == chartObj.interval && _self.lastExtremes.extremes.min == extremes.min);
    }

    if (doCalculate && data && data.length > 0 && allData && allData.compare) {
        _self.baseData = data;


        var chart = chartObj && chartObj.chart;
        var compareData = allData.compare && allData.compare.data,
            chartExtremes = chartObj.getRange(),
            seriesData;

        extremes = !extremes ? chartExtremes : extremes;

        if (extremes.min == null && (extremes.userMin || extremes.dataMin)) {
            extremes.min = extremes.userMin || extremes.dataMin;
        }

        _self.lastExtremes = {interval: chartObj.interval, extremes: extremes};
        seriesData = this.getSeries(data, compareData, extremes);

        for (var compSeriesId in seriesData) {
            if (seriesData.hasOwnProperty(compSeriesId)) {
                if (!_self.seriesMap[compSeriesId]) {
                    var symbolObj = chartObj.getCompareSymbolFromSeriesId(compSeriesId);
                    _self._addCompareSeries(symbolObj);
                }
                var series = _self.seriesMap[compSeriesId],
                    seriesDataTemp = seriesData[compSeriesId];
                series.setData(seriesDataTemp, false, false, false);
            }
        }
        // chart.get(this.id).setData(_rsl, redraw, false, false);

    }
    if (redraw) {
        chart.redraw();
    }
};

infChart.SpreadIndicator.prototype.getSeries = function (base, compareData, extremes) {
    var ts, retVal1 = {},
        startIdx = extremes && this.getDataExtremesIndices(extremes, base) || 0;
    ts = this.percentageChange(base, 4, startIdx);

    for (var compSeriesId in compareData) {
        if (compareData.hasOwnProperty(compSeriesId)) {
            var seriesData = compareData[compSeriesId],
                compStarIdx = extremes && this.getDataExtremesIndices(extremes, seriesData) || 0,
                seriesChange = this.percentageChange(seriesData, 4, compStarIdx);
            retVal1[compSeriesId] = this._mergeUnevenSeries(base, ts, seriesData, seriesChange, 'substract');

        }
    }
    return retVal1;
};

infChart.SpreadIndicator.prototype._getSeriesName = function (symbol) {

    var _self = this,
        chart = infChart.manager.getChart(_self.chartId),
        mainSymbol = chart.symbol;

    return chart._getSymbolDisplayName(symbol) + " - " + chart._getSymbolDisplayName(mainSymbol);
};

infChart.SpreadIndicator.prototype._addCompareSeries = function (symbol) {
    // add series
    var _self = this,
        chart = infChart.manager.getChart(_self.chartId),
        hChart = this.chart;
    var compareSeriesId = chart.getCompareSeriesId(symbol),
        indId = _self.id + "_SPREAD" + compareSeriesId,
        compSeries = hChart && hChart.get(compareSeriesId),
        color = (compSeries && compSeries.color) || infChart.util.getNextSeriesColor(chartId);

    if (!_self.seriesMap[compareSeriesId]) {
        _self.seriesMap[compareSeriesId] = chart.chart.addSeries({
            id: indId,
            name: "SPREAD - " + chart._getSymbolDisplayName(symbol),
            infIndType: "SPREAD",
            infIndSubType: "SPREAD",
            type: "line",
            infType: "indicator",
            yAxis: _self.axisId,
            showInLegend: false,
            lineColor: color,
            color: color,
            infCompSymbol: symbol,
            //compare : "infCustom",
            hideClose: true/*,
             customModifyValue : function(value, point) {
             var series = this,
             compareValue = this.compareValue,
             infCompareStart = series.infCompareStart;

             if (value !== undefined && compareValue !== undefined && point) { // #2601, #5814

             value = 100 * ((value / compareValue) - 1);

             // record for tooltip etc.
             if (point) {
             point.change = value;
             }

             return value;
             }
             }*/

        }, true);
        _self.series.push(_self.seriesMap[compareSeriesId]);
        chart._plotter(_self);
    }
};

infChart.SpreadIndicator.prototype._mergeUnevenSeries = function (data, s1, compareData, s2, operation) {
    var i = 0, iLen = data && data.length, k = 0, kLen = s2 && s2.length,
        retVal = [];

    for (; i < iLen; i++) {
        for (; k < kLen && compareData[k] && data[i][0] >= compareData[k][0]; k++) {
            if (operation == 'substract') {
                if (s1[i] != null && s2[k] != null && s1[i] != undefined && s2[k] != undefined) {
                    retVal[i] = [data[i][0], s2[k] - s1[i]];
                }
            }
            else {
                retVal[i] = [data[i][0], s2[k]];
            }
        }

        if (!retVal[i]) {
            retVal[i] = [data[i][0], undefined];
        }
    }

    return retVal;
};

infChart.SpreadIndicator.prototype.getTitle = function (seriesId, isLegend) {

    var chart = this.chart, series = chart.get(seriesId);

    if (series) {
        return this._getSeriesName(series.options.infCompSymbol);
    }
    return 'SPREAD';
};

infChart.SpreadIndicator.prototype.getDataExtremesIndices = function (extremes, base) {
    var startIndexOnRange = infChart.util.binaryIndexOf(base, 0, extremes.min);
    startIndexOnRange = startIndexOnRange < 0 ? startIndexOnRange * -1 : startIndexOnRange;
    return startIndexOnRange;
};

infChart.SpreadIndicator.prototype.getTooltipValue = function (point) {
    var tooltipData;
    if (!point.series.hideToolTip) {
        var axis = this.getAxisId();
        var value = point.y;
        var chart = infChart.manager.getChart(this.chartId);
        var dp = (point.series.options.dp != undefined) ? point.series.options.dp : 3;

        tooltipData = {
            'raw': {'value': value, 'time': point.x},
            'formatted': {'value': chart.formatValue(value, dp), 'time': chart.getTooltipTime(point.x)},
            'label': this.getLabel(point.series.options.id, "indicatorShortDesc") + " | " + this._getSeriesName(point.series.options.infCompSymbol),
            'color': this.getTooltipColor(point.series)
        };
    }
    return tooltipData;
};

infChart.SpreadIndicator.prototype.destroy = function () {
    var chart = infChart.manager.getChart(this.chartId);
    chart.removeRegisteredEvent("onRemoveCompareSymbol", this.removeEventIdx);
    chart.removeRegisteredEvent("onAddCompareSymbol", this.addEventIdx);
    chart.removeRegisteredEvent("setSymbol", this.baseSetEventIdx);
    infChart.Indicator.prototype.destroy.apply(this, arguments);

};

//endregion ************************************** Spread (SPREAD)  Indicator******************************************

//region ******************************* Custom Weight Indicator (CWI) Indicator **************************************

/***
 * constructor for Custom Weight Index indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
 infChart.CustomWeightIndexIndicator = function (id, chartId, type, chartInstance) {

    var _self = this;
    infChart.Indicator.apply(this, arguments);

    this.customObject = {
        equation: '',
        symbols: {}
    };
    this.params.base = infChart.indicatorDefaults.ULCLOSEPRICE;
    this.axisId = "#CWI_" + id;
    this.isDynamic = true;
    this.showSettingsPanelInitially = true;
    this.symbolData = {};

    var chart = infChart.manager.getChart(chartId);
    var color = infChart.util.getNextSeriesColor(chartId);

    this.addAxis({
        id: this.axisId,
        startOnTick: false,
        endOnTick: false
    });

    this.series[0] = chartInstance.addSeries({
        id: id,
        name: "CWI",
        infIndType: "CWI",
        infIndSubType: "CWI",
        type: "line",
        // data: [],
        color: color,
        lineColor: color,
        infType: "indicator",
        yAxis: this.axisId,
        zIndex: 3,
        fillOpacity: 0.3,
        hideToolTip: true,
        showInNavigator: false
    }, true);

    this.removeEventIdx = chart.registerForEvents("onRemoveCompareSymbol", function (symbol) {
        // remove series
        _self.symbolData = [];
        _self._loadSymbolData();
    });

    this.addEventIdx = chart.registerForEvents("onAddCompareSymbol", function (symbol) {
        _self.symbolData = [];
        _self._loadSymbolData();
    });

    this.baseSetEventIdx = chart.registerForEvents("setSymbol", function (symbol) {
        _self.symbolData = [];
        _self._loadSymbolData();
    });
};

infChart.util.extend(infChart.Indicator, infChart.CustomWeightIndexIndicator);

infChart.CustomWeightIndexIndicator.prototype.bindSettingsContainerEvents = function ($container) {
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
     * @param {object} colorObj colors of the type
     */
    function onChartTypeChange(seriesId, chartType, colorObj) {
        var isPropertyChange = true;
        if (self.panel) {
            isPropertyChange = self.isSettingsPropertyChange();
        }
        return self.onChartTypeChange(seriesId, chartType, colorObj, isPropertyChange);

    }

    infChart.structureManager.indicator.bindParameterElements($container, onBaseChange, onSelectionChange, onInputParamChange, onOnOffChange);
    self._bindCWIParameterElements($container);

    var seriesArray = [],
        count = 0;
    infChart.util.forEach(self.series, function (i, series) {
        seriesArray[count] = {'id': series.options.id, 'color': series.color};
        count++;
    });

    infChart.structureManager.indicator.bindStyleElements($container, seriesArray, onChartTypeChange, onColorChange, onLineWidthChange);

    infChart.structureManager.settings.bindPanel($container, function () {
        var chart = infChart.manager.getChart(self.chartId);
        infChart.util.forEach(self.series, function (i, s) {//remove additional series
            if (s && s.options.id !== self.id) {
                chart.removeSeries(s.options.id);
            }
        });
        chart.removeSeries(self.id, true);
    });
};

infChart.CustomWeightIndexIndicator.prototype.calculate = function (ohlc, data, redraw, seriesId, allData, extremes) {
    var _self = this,
        base = _self.params.base,
        chartObj = infChart.manager.getChart(_self.chartId),
        validationResult = _self._validateAndGetDataForCalculate(allData);

    if (validationResult.doCalculation) {
        var chart = chartObj && chartObj.chart,
            chartExtremes = chartObj.getRange(),
            symbolsData = validationResult.symbolsData,
            keyList = validationResult.keyList,
            equation = validationResult.equationStr, cd = {};

        extremes = !extremes ? chartExtremes : extremes;
        if (extremes.min == null && (extremes.userMin || extremes.dataMin)) {
            extremes.min = extremes.userMin || extremes.dataMin;
        }
        _self.lastExtremes = {interval: chartObj.interval, extremes: extremes};

        keyList.forEach(function (key) {
            var sd = symbolsData[key].ohlcv, ts, bb = [];
            ts = _self.movul(sd.h, sd.l, sd.c, sd.o, base);
            bb = _self._movcwi(ts);
            cd[key] = bb;
        });

        var cwid = _self._getSeries(cd, data, keyList, equation);
        _self.series[0].setData(cwid, false, false, false);
        if (redraw) {
            chart.redraw();
        }
    }
};

infChart.CustomWeightIndexIndicator.prototype.getSettingWindowHTML = function () {
    var self = this, config = self.getConfig();
    var baseParameter = {}, selectionParameters = [], inputParameters = [], onOffParameter = [];
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
    var paramSection = infChart.structureManager.indicator.getSeriesParameterSection(baseParameter);
    var customParamSection = this._getCustomUIElements();

    return infChart.structureManager.settings.getPanelHTML(this.chartId + '-indicator-panel', this.getUniqueId(),
        infChart.manager.getLabel('label.indicatorDesc.' + self.type),
        infChart.structureManager.settings.getPanelBodyHTML([paramSection, customParamSection, styleSection]));
};

infChart.CustomWeightIndexIndicator.prototype.getRequiredDataTypes = function () {
    return ['base', 'compare'];
};

infChart.CustomWeightIndexIndicator.prototype._bindCWIParameterElements = function ($container) {
    var self = this,
        selectedSymbol = null, //selected symbol by autocomplete
        tempKey = null, //key of the edit symbol
        tableRowId = null, //table row id of the editing symbol
        equationInput = $container.find('[inf-cwi-param="equation"]'),
        applyButton = $container.find('[inf-cwi-ctrl="equation"]'),
        variableNameInput = $container.find('input[inf-cwi-param="variableName"]'),
        symbolSearchInput = $container.find('[inf-cwi-param="symbol"]'),
        addUpdateButton = $container.find('button[inf-cwi-ctrl="addUpdate"]');

    function onEquationChange(value) {
        if (value.length > 0) {
            self.customObject.equation = value;
            // self.symbolData = [];
            self._loadSymbolData();
        }
    }

    function onSymbolSearchChange(value) {
        var stockChart = infChart.manager.getChart(self.chartId);
        // if (value != undefined && value != null && value.trim() != "") {
        stockChart.dataManager.dataProvider.getSymbols(value, function (data) {
            setAutoComplete(data);
        }, function (error) {
        });
        // }
    }

    function setAutoComplete(symbolList) {
        var symbolSource = symbolList;
        symbolSearchInput.autocomplete({
            delay: 300,
            minLength: 0,
            position: {my: "left top", at: "left bottom", collision: "flip"},
            source: function (request, response) {
                response($.ui.autocomplete.filter(symbolSource, ""));
            },
            select: function (event, item) {
                selectedSymbol = item.item.symbolItem;
            },
            close: function () {
                symbolSource = [];
            }
        }).on("focus", function () {
            $(this).autocomplete("search", "");
        });
    }

    function addRowToTable(variableName, symbol) {
        function onClickTableRowEdit(key, id) {
            var symbol = self.customObject.symbols[key],
                symbolsList = self.customObject.symbols;

            variableNameInput.val(key);
            symbolSearchInput.val(symbol.symbol + ' ' + symbol.exchange);

            selectedSymbol = symbol;
            tempKey = key;
            tableRowId = id;

            if (tempKey !== null && symbolsList.hasOwnProperty(tempKey)) {
                delete symbolsList[tempKey];
                tempKey = null;
            }
            addUpdateButton.html('Update');
            addUpdateButton.val('UPDATE');
        }

        function onClickTableRowRemove(key) {
            var symbolsList = self.customObject.symbols;
            if (symbolsList.hasOwnProperty(key)) {
                delete symbolsList[key];
            }
        }

        var tableObj = $container.find('tbody[inf-cwi-thead-param]');
        var elementNum = $container.find('tbody[inf-cwi-thead-param] tr').length;
        var tableRowHTML = '<tr inf-cwi-tr="' + 'variables_' + elementNum + '" >' +
            '<td inf-cwi-vname>' + variableName + '</td>' +
            '<td inf-cwi-symname>' + symbol.symbol + '</td>' +
            '<td><button type="button" class="btn btn-default icon-btn-controller" inf-cwi-tedit-ctrl="edit_' + elementNum + '">' +
            '<i class="fa fa-edit"></i>' + '</button>' +
            '<button type="button" class="btn btn-default icon-btn-controller" inf-cwi-tremove-ctrl="remove_' + elementNum + '">' +
            '<i class="fa fa-times"></i>' + '</button></td></tr>';
        tableObj.append(tableRowHTML);
        self.customObject.symbols[variableName] = symbol;

        $container.find('button[inf-cwi-tedit-ctrl]').on('click', function (e) {
            var row = $(this).closest("tr");
            var variableName = $(row).find('td[inf-cwi-vname]').text();
            onClickTableRowEdit(variableName, row.attr('inf-cwi-tr'));
        });

        $container.find('button[inf-cwi-tremove-ctrl]').on('click', function (e) {
            var row = $(this).closest("tr");
            var variableName = $(row).find('td[inf-cwi-vname]').text();
            onClickTableRowRemove(variableName);
            $(this).closest("tr").remove();
        });
    }

    function updateRowInTable(variableName, symbol) {
        self.customObject.symbols[variableName] = symbol;

        var tableRow = $container.find('tr[inf-cwi-tr="' + tableRowId + '"]');
        $(tableRow).find('td[inf-cwi-vname]').html(variableName);
        $(tableRow).find('td[inf-cwi-symname]').html(symbol.symbol);

        addUpdateButton.html('Add');
        addUpdateButton.val('ADD');
        selectedSymbol = null;
        tempKey = null;
        tableRowId = null;
    }

    applyButton.on('click', function (e) {
        var equation = equationInput.val();
        onEquationChange(equation);
    });

    symbolSearchInput.on('propertychange keyup paste', function (e) {
        var value = $(this).val();
        onSymbolSearchChange(value);
    });

    symbolSearchInput.on('click', function (e) {
        var value = $(this).val();
        onSymbolSearchChange(value);
    });

    //search add/update button click event 
    addUpdateButton.on('click', function (e) {
        var pattern = new RegExp(/[a-zA-Z]/g),
            keyList = self._getPropertiesFromJSONObj().keyList,
            vnValue = variableNameInput.val(),
            btnValue = $(this).val();

        if (pattern.test(vnValue) && !(keyList.length > 0 && keyList.indexOf(vnValue) > -1) && selectedSymbol !== null) {
            if (btnValue === "ADD") {
                addRowToTable(vnValue, selectedSymbol);
            } else {
                updateRowInTable(vnValue, selectedSymbol);
            }
            variableNameInput.val('');
            symbolSearchInput.val('');
            selectedSymbol = null;
        }
    });
};

infChart.CustomWeightIndexIndicator.prototype._getCustomUIElements = function () {
    var uiElements = [];
    var tableColumn = [{
        headerName: 'Variable',
        type: 'text'
    }, {
        headerName: 'Symbol',
        type: 'text'
    }, {
        headerName: 'Edit-Remove',
        type: 'button',
        text: 'Edit-Remove'
    }];

    function getEquationItem(key) {
        var equationHTML = '<input type="text" class="form-control" inf-cwi-param="' + key + '" value="">';
        var applyBtnHTML = '<button class="btn btn-default" type="button" inf-cwi-ctrl="' + key + '" >Apply</button>';
        var items = [];

        items.xPush({
            body: equationHTML,
            id: undefined,
            isLabel: false,
            title: infChart.manager.getLabel("label.indicatorParam." + key)
        });

        items.xPush({
            body: applyBtnHTML,
            id: undefined,
            isLabel: false,
            title: '&nbsp;'
        });

        return items;
    }

    function getSymbolSearchItem(key) {
        var variableNameHTML = '<input type="text" maxlength="1" class="form-control" inf-cwi-param="variableName" value="">';
        var searchHTML = '<input type="text" class="form-control" inf-cwi-param="' + key + '" >';
        var btnHTML = '<button class="btn btn-default" type="button" value="ADD" inf-cwi-ctrl="addUpdate">Add</button>';
        var items = []

        items.xPush({
            body: variableNameHTML,
            id: undefined,
            isLabel: false,
            title: infChart.manager.getLabel("label.indicatorParam.variableName")
        });

        items.xPush({
            body: searchHTML,
            id: undefined,
            isLabel: false,
            title: infChart.manager.getLabel("label.indicatorParam.symbolSearch")
        });

        items.xPush({
            body: btnHTML,
            id: undefined,
            isLabel: false,
            title: '&nbsp;'
        });

        return items;
    }

    function getSymbolListTableItem(key, columns) {
        var tableStr = '<table class="table table-zebra-striped"><thead><tr>';
        infChart.util.forEach(columns, function (i, col) {
            if (col.type === 'text') {
                tableStr += '<th>' + col.headerName + '</th>';
            } else {
                tableStr += '<th></th>';
            }
        });
        tableStr += '</tr></thead><tbody inf-cwi-thead-param="' + key + '" ></tbody></table>';
        return [{
            body: tableStr,
            id: undefined,
            isLabel: false,
            title: ''
        }];
    }

    function getSectionRow(items, cssClass) {
        return {
            'items': items,
            'cssClass': cssClass
        };
    }

    function getSection(items, title) {
        return {
            'title': title,
            'rows': items
        };
    }

    //get equation element item
    var equationItem = getEquationItem('equation');
    var equation = getSectionRow(equationItem, 'two-col-row');
    uiElements.xPush(equation);

    //get symbol search element
    var symbolSearchItems = getSymbolSearchItem('symbol');
    var symbolSearch = getSectionRow(symbolSearchItems, 'three-col-row');
    uiElements.xPush(symbolSearch);

    //get table
    var tableItem = getSymbolListTableItem('table', tableColumn);
    var table = getSectionRow(tableItem);
    uiElements.xPush(table);

    return getSection(uiElements, 'Variable');
};

infChart.CustomWeightIndexIndicator.prototype._getPropertiesFromJSONObj = function () {
    var jsonObj = this.customObject;
    var equationStr = '', equationElementCount = 0, symbolsWithKey = {}, keyList = [], returnVal = {};

    if (jsonObj.equation.length !== 0) {
        var eqels = jsonObj.equation.replace(/\s/g, "").split('');
        for (var i = 0; i < eqels.length - 1; i++) {
            if (!isNaN(eqels[i]) && (eqels[i + 1].match(/[a-zA-Z]/g))) {
                eqels[i] = eqels[i] + '*';
            }
        }
        equationStr = eqels.join('');
    }

    if (!(Object.keys(jsonObj.symbols).length === 0 && jsonObj.symbols.constructor === Object)) {
        keyList = Object.keys(jsonObj.symbols);

        keyList.forEach(function (key) {
            var symbol = jsonObj.symbols[key];
            symbolsWithKey[key] = symbol;
        });
    }

    returnVal = {
        equationStr: equationStr,
        equationElementCount: equationElementCount,
        symbolsWithKey: symbolsWithKey,
        keyList: keyList
    };

    return returnVal;
};

infChart.CustomWeightIndexIndicator.prototype._getSeries = function (dataObj, data, keyList, equation) {
    var bb = [], k, rv = [];
    keyList.forEach(function (k) {
        var dl = dataObj[k];
        for (var i = 0; i < dl.length; i++) {
            var v = (dl[i] !== undefined) ? dl[i] : 0;
            if (bb[i] == undefined) {
                bb[i] = equation.replace(k, v);
            } else {
                var eq = bb[i];
                eq = eq.replace(k, v);
                bb[i] = eq;
            }
        }
    });
    for (k = 0; k < data.length; k++) {
        var e = bb[k].replace(/[a-zA-Z]/g, 0);
        var ans = eval(e);
        rv[k] = [data[k][0], ans];
    }
    return rv;
};

infChart.CustomWeightIndexIndicator.prototype._loadSymbolData = function () {
    var _self = this, stockChart = infChart.manager.getChart(_self.chartId),
        properties = stockChart.getProperties(),
        jsonProps = _self._getPropertiesFromJSONObj(),
        keyList = jsonProps.keyList,
        indData = _self.getData(),
        baseData = indData.base && indData.base.ohlcv && indData.base,
        symbolList = [];

    keyList.forEach(function (key) {
        var symbol = jsonProps.symbolsWithKey[key],
            comSeriesId = stockChart.getCompareSeriesId(symbol),
            isInEquation = jsonProps.equationStr.indexOf(key) > -1;

        if (isInEquation) {
            if (symbol.symbol != properties.mainSymbol.symbol) {
                if (properties.compareSymbols.length > 0) {
                    if (!indData.compare.data.hasOwnProperty(comSeriesId)) {
                        symbolList.push(symbol);
                    }
                } else {
                    symbolList.push(symbol);
                }
            }
        }
    });

    if (symbolList.length > 0) {
        for (var i = 0; i < symbolList.length; i++) {
            var comSeriesId = stockChart.getCompareSeriesId(symbolList[i]);
            if (this.symbolData.hasOwnProperty(comSeriesId)) {
                _self.calculate(baseData.ohlcv, baseData.data, true, undefined, indData);
            } else {
                var symProperties = {
                    symbol: symbolList[i],
                    interval: properties.interval
                };
                stockChart.dataManager.readHistoryData(symProperties, _self._onLoadSymbolData, _self);
            }
        }
    } else {
        _self.calculate(baseData.ohlcv, baseData.data, true, undefined, indData);
    }
};

infChart.CustomWeightIndexIndicator.prototype._movcwi = function (ts) {
    var movcwi = new Array(ts.length);
    var divisor = ts[0], k;

    for (k = 1; k < ts.length; k++) {
        movcwi[k] = ts[k] / divisor;
    }

    return movcwi;
};

infChart.CustomWeightIndexIndicator.prototype._onLoadSymbolData = function (data, properties) {
    var dataList = data.data,
        stockChart = infChart.manager.getChart(this.chartId);

    if (dataList && dataList.length > 0) {
        var comSeriesId = stockChart.getCompareSeriesId(properties.symbol);
        var ohlcv = stockChart.dataManager.getOHLCV(dataList);
        this.symbolData[comSeriesId] = {
            symbol: properties.symbol,
            ohlcv: ohlcv,
            data: dataList
        };
        var indData = this.getData(),
            baseData = indData.base && indData.base.ohlcv && indData.base;

        if (baseData && baseData.ohlcv && baseData.data) {
            this.calculate(baseData.ohlcv, baseData.data, true, undefined, indData);
        }
    }
};

infChart.CustomWeightIndexIndicator.prototype._validateAndGetDataForCalculate = function (allData) {
    var _self = this,
        jsonProps = _self._getPropertiesFromJSONObj(),
        keyList = jsonProps.keyList,
        equation = jsonProps.equationStr,
        equationCharList = equation && equation.match(/[a-zA-Z]/g),
        calculateSymbols = jsonProps.symbolsWithKey,
        stockChart = infChart.manager.getChart(_self.chartId),
        properties = stockChart.getProperties(),
        mainSymbol = properties.mainSymbol,
        otherSymbolData = _self.symbolData,
        doCalculation = true,
        symbolDataObj = {};

    if (keyList.length > 0) {
        for (var i = 0; i < keyList.length; i++) {
            var key = keyList[i],
                symbol = calculateSymbols[key],
                comSeriesId = stockChart.getCompareSeriesId(symbol);
            if (symbol.symbol === mainSymbol.symbol) {
                symbolDataObj[key] = {
                    data: allData.base.data,
                    ohlcv: allData.base.ohlcv
                }
            } else if (allData.compare.data.hasOwnProperty(comSeriesId)) {
                var ohlcv = stockChart.dataManager.getOHLCV(allData.compare.data[comSeriesId]);
                symbolDataObj[key] = {
                    data: allData.compare.data[comSeriesId],
                    ohlcv: ohlcv
                }
            } else {
                if (otherSymbolData.hasOwnProperty(comSeriesId)) {
                    symbolDataObj[key] = otherSymbolData[comSeriesId];
                }
            }

            if (!symbolDataObj.hasOwnProperty(key)) {
                doCalculation = false;
                break;
            }
        }
    } else {
        doCalculation = false;
    }

    if (equationCharList && equationCharList.length > 0) {
        for (var k = 0; k < equationCharList.length; k++) {
            var ec = equationCharList[k];
            if (!($.inArray(ec, keyList) > -1)) {
                doCalculation = false;
                break;
            }
        }
    }

    var returnVal = {
        equationStr: jsonProps.equationStr,
        doCalculation: doCalculation,
        symbolsData: symbolDataObj,
        keyList: jsonProps.keyList
    };

    return returnVal;
};

infChart.CustomWeightIndexIndicator.prototype.destroy = function () {
    var chart = infChart.manager.getChart(this.chartId);
    chart.removeRegisteredEvent("onRemoveCompareSymbol", this.removeEventIdx);
    chart.removeRegisteredEvent("onAddCompareSymbol", this.addEventIdx);
    chart.removeRegisteredEvent("setSymbol", this.baseSetEventIdx);
    infChart.Indicator.prototype.destroy.apply(this, arguments);

};

//endregion ******************************* Custom Weight Indicator (CWI)  Indicator **********************************

/*
 //region ************************************** Dark Cloud (DarkC) Indicator******************************************

 /!***
 * Constructor for Dark Cloud (DarkC) Indicator Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 *!/
 infChart.DarkCloudIndicator = function (id, chartId, type, chartInstance) {

 infChart.Indicator.apply(this, arguments);
 this.params.period = 5;
 this.titleParams = ["period"];
 this.icons["infsignal"] = "ico-arrow-up";
 this.icons["plotrange"] = "ico-shape1";

 var upColor = infChart.util.getDefaultUpColor(), downColor = infChart.util.getDefaultDownColor();

 this.series[0] = chartInstance.addSeries({
 id: id,
 name: "DarkC",
 infIndType: "DarkC",
 infIndSubType: "DarkCBar",
 type: "plotrange",
 infType: "indicator",
 yAxis: "#0",
 data: [],
 showInLegend: true, /!*
 style : {fontWeight : "bold" , fontSize :"8px", color : "#fff"},*!/
 groupPadding: 0,
 pointPadding: 0,
 borderWidth: 0,
 fillOpacity: 0.5,
 pointPlacement: 'on',
 title: "S"
 }, false);
 this.series[1] = chartInstance.addSeries({
 id: id + '_DarkCSignal',
 name: "DarkCSignal",
 infIndType: "DarkC",
 infIndSubType: "DarkCSignal",
 /!*data: [],*!/
 type: "infsignal",
 shape: "downarw",
 infType: "indicator",
 yAxis: "#0",
 showInLegend: false,
 hideLegend: true,
 onKey: "high",
 onSeries: this.series[0].options.id,
 lineColor: upColor,
 fillColor: upColor,
 color: upColor,
 /!*textAlign : "top",*!/
 textAlign: "bottom",
 style: {fontWeight: "bold", fontSize: "10px", color: upColor},
 title: "BullEng"/!*,
 y : 12*!/
 }, true);


 this.style[this.series[0].options.id] = ["plotrange"];
 this.style[this.series[1].options.id] = ["infsignal"];
 this.onOff = [this.series[0].options.id, this.series[1].options.id];

 };

 infChart.util.extend(infChart.Indicator, infChart.DarkCloudIndicator);

 infChart.DarkCloudIndicator.prototype.calculate = function (ohlc, data, redraw) {
 var high = ohlc.h,
 low = ohlc.l,
 close = ohlc.c,
 open = ohlc.o;
 var that = this;

 if (data && data.length > 0) {
 var macdCross = that.getSeries(high, low, close, open, that.params.period);
 $.each(this.series, function (i, series) {
 switch (series.options.infIndSubType) {
 case 'DarkCBar':
 var _macd = that.merge(data, macdCross.barh, macdCross.barl);
 series.setData(_macd, false);
 break;
 case 'DarkCSignal':
 var _macd2 = that.merge(data, macdCross.bar);
 series.setData(_macd2, false);
 break;
 }
 });
 if (redraw) {
 var chart = this.chart;
 chart.redraw();
 }
 }
 };

 infChart.DarkCloudIndicator.prototype.getSeries = function (hts, lts, cts, ots, period) {
 var i, k = Math.min(cts.length - 1, period - 1), resultb = new Array(cts.length), resultbh = new Array(cts.length), resultbl = new Array(cts.length);


 if (cts.length >= period) {
 for (k; k < cts.length; k++) {
 var trend = true;
 for (i = k; i > k - period + 2; i--) {
 if (cts[i] < cts[i - 2]) {
 trend = false;
 break;
 }
 }
 if (trend && cts[k - 1] > ots[k - 1] && cts[k] < ots[k] &&
 ots[k] > hts[k - 1] && cts[k] < (ots[k - 1] + cts[k - 1]) / 2 && cts[k] > lts[k - 1]) {
 resultb[k] = hts[k];
 resultbh[k - 1] = Math.max(hts[k], hts[k - 1]);
 resultbh[k] = Math.max(hts[k], hts[k - 1]);
 resultbl[k] = Math.min(lts[k], lts[k - 1]);
 resultbl[k - 1] = Math.min(lts[k], lts[k - 1]);
 }
 }
 }

 return {bar: resultb, barh: resultbh, barl: resultbl};
 };

 infChart.DarkCloudIndicator.prototype.getTooltipValue = function (point) {

 if (point.series.hideToolTip) {
 return '';
 }
 var value = '';
 return infChart.util.getTooltipRowValue(this.getLabel(point.series.options.id, "indicatorShortDesc"), value, 0, point.series.color, true);
 };


 //endregion ************************************** end of Dark Cloud (Darkc) Indicator******************************************
 */

//region ************************************** Zig Zag Indicator ******************************************

/***
 * Constructor for Zig Zag  Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
infChart.ZigZagIndicator = function (id, chartId, type, chartInstance) {

    infChart.Indicator.apply(this, arguments);

    this.params.backstep = 3;
    this.params.depth = 12;
    this.params.deviation = 5;
    this.params.showReversal = true;
    this.params.showVolume = true;
    this.params.showReversalPriceChange = true;
    this.params.showReversalPrecentage = true;

    this.titleParams = ["backstep", "depth", "deviation"];
    this.checkOptions = ["showReversal", "showVolume", "showReversalPriceChange", "showReversalPrecentage"];
    this.candleCountUsedtoCalculateSwingPoint = 3;

    var color = infChart.util.getNextSeriesColor(chartId);

    this.series[0] = chartInstance.addSeries({
        id: id,
        name: "ZigZag",
        infIndType: "ZigZag",
        infIndSubType: "ZigZag",
        type: "line",
        infType: "indicator",
        yAxis: "#0",
        color: color,
        lineColor: color,
        dataLabels: {
            enabled: false,
        }
    }, false);
    this.series[1] = chartInstance.addSeries({
        id: id + '_zigZaglabel',
        name: "ZigZagLabel",
        infIndType: "ZZLabel",
        infIndSubType: "ZigZagLabel",
        lineWidth: 0,
        marker: {
            enabled: false
        },
        infType: "indicator",
        yAxis: "#0",
        hideLegend: true,
        showInLegend: false,
        hideToolTip: true,
        infAvoidToolTipSel: true,
        onSeries: this.series[0].options.id,
        color: color,
        states: {
            hover: false
        },
        dataLabels: {
            enabled: true,
            allowOverlap: true,
            style: {
                textOutline: 'none',
                fontWeight: '400'
            }
        }
    }, true);

    this.style[this.series[0].options.id] = ["line"];
};

infChart.util.extend(infChart.Indicator, infChart.ZigZagIndicator);

infChart.ZigZagIndicator.prototype.calculate = function (ohlc, data, redraw) {
    let high = ohlc.h;
    let low = ohlc.l;
    let zigzagSeries = {};
    if (data && data.length > 0) {
        let chart = this.chart;
        zigzagSeries = this.getSeries(high, low, data);
        infChart.util.forEach(this.series, function (i, series) {
            switch (series.options.infIndSubType) {
                case 'ZigZag':
                    series.setData(zigzagSeries.zzSeries, true, false, false); //  redraw since signal is depend on this series
                    break;
                case 'ZigZagLabel':
                    series.setData(zigzagSeries.labelSeries, false, false, false);
                    break;
            }
        });
        if (redraw) {
            this.chart.redraw();
        }
    }
};

infChart.ZigZagIndicator.prototype.getSeries = function (high, low, data) {
    if (this._validateUserInputs()) {
        return {
            zzSeries: [],
            labelSeries: []
        };
    }
    let d = this.params.deviation / 100;
    let lowDeviation = 1 - d;
    let highDeviation = 1 + d;
    let dataLength = data.length;
    let i;
    let isSwingHigh = true;
    let zzSeries = [];
    let tempZZSeries = [];
    let labelSeries = [];
    let swingPoint;
    let isFindSwingPoint = false;
    let isFirstPointSwingHigh = false;
    let isSwingPointChanged = false;
    let prevLastPoint;
    let firstHighPoint = high[dataLength - 1];
    let firstLowPoint = low[dataLength - 1];

    //get last swing high or swing low point
    for (i = dataLength - 2; i >= 0; i--) {
        if (high[i] >= firstHighPoint * highDeviation && this._isSwingHighPoint(high, i)) {
            swingPoint = [data[i][0], high[i], i, true];
            isSwingHigh = true;
            isFirstPointSwingHigh = true;
            break;
        } else if (low[i] <= firstLowPoint * lowDeviation && this._isSwingLowPoint(low, i)) {
            swingPoint = [data[i][0], low[i], i, false];
            isSwingHigh = false;
            break;
        }
    }

    tempZZSeries.push([data[dataLength - 1][0], isFirstPointSwingHigh ? low[dataLength - 1] : high[dataLength - 1], dataLength - 1, !isFirstPointSwingHigh]);
    tempZZSeries.push(swingPoint);

    //get other swing points
    for (i = i - 1; i >= 0; i--) {
        if (isSwingHigh) {
            if (low[i] <= swingPoint[1] * lowDeviation && this._isSwingLowPoint(low, i) && 
                this._isValidPointWithStepAndDepth(swingPoint, prevLastPoint, i)) {
                isFindSwingPoint = true;
                swingPoint = [data[i][0], low[i], i, !isSwingHigh];
                isSwingHigh = false;
            } else if (high[i] >= swingPoint[1] && this._isSwingHighPoint(high, i)) {
                swingPoint = [data[i][0], high[i], i, isSwingHigh];
                isSwingPointChanged = true;
            } else if (tempZZSeries.length > 4 && low[i] <= tempZZSeries[tempZZSeries.length - 2][1] && this._isSwingLowPoint(low, i)) {
                tempZZSeries = tempZZSeries.slice(0, -2);
                swingPoint = [data[i][0], low[i], i, !isSwingHigh];
                isSwingHigh = false;
                isFindSwingPoint = true;
            }
        } else {
            if (high[i] >= swingPoint[1] * highDeviation && this._isSwingHighPoint(high, i) && 
                this._isValidPointWithStepAndDepth(swingPoint, prevLastPoint, i)) {
                isFindSwingPoint = true;
                swingPoint = [data[i][0], high[i], i, !isSwingHigh];
                isSwingHigh = true;
            } else if (low[i] <= swingPoint[1] && this._isSwingLowPoint(low, i)) {
                swingPoint = [data[i][0], low[i], i, isSwingHigh];
                isSwingPointChanged = true;
            } else if (tempZZSeries.length > 4 && high[i] >= tempZZSeries[tempZZSeries.length - 2][1] && this._isSwingHighPoint(high, i)) {
                tempZZSeries = tempZZSeries.slice(0, -2);
                swingPoint = [data[i][0], high[i], i, !isSwingHigh];
                isSwingHigh = true;
                isFindSwingPoint = true;
            }
        }

        if (isFindSwingPoint) {
            prevLastPoint = tempZZSeries[tempZZSeries.length - 1];
            tempZZSeries.push(swingPoint);
            isFindSwingPoint = false;
        }

        //no need to change last 2 points - first zz point and main series last point
        if (isSwingPointChanged) { //&& tempZZSeries.length > 2
            tempZZSeries.pop();
            tempZZSeries.push(swingPoint);
            isSwingPointChanged = false;
        }
    }

    tempZZSeries = tempZZSeries.reverse();
    let series = this._getZZSeriesAndLabelSeries(tempZZSeries, data);
    zzSeries = series.zzSeries;
    labelSeries = series.labelSeries;
    return {
        zzSeries: zzSeries,
        labelSeries: labelSeries
    };
};

infChart.ZigZagIndicator.prototype._isSwingHighPoint = function (high, index, candleCount) {
    let candles = candleCount ? candleCount : this.candleCountUsedtoCalculateSwingPoint;
    let point = high[index];
    let point_1 = high[index + 1];
    let point_prv_1 = high[index - 1];
    let isSwingHighPoint = false;
    if (candles === 3) {
        isSwingHighPoint = point_1 && point_1 <= point && point_prv_1 && point_prv_1 <= point;
    } else {
        let point_2 = high[index + 2];
        let point_prv_2 = high[index - 2];
        isSwingHighPoint = point_1 && point_1 <= point && point_prv_1 && point_prv_1 <= point &&
            point_2 && point_2 <= point_1 && point_prv_2 && point_prv_2 <= point_prv_1;
    }
    return isSwingHighPoint;
};

infChart.ZigZagIndicator.prototype._isSwingLowPoint = function (low, index, candleCount) {
    let candles = candleCount ? candleCount : this.candleCountUsedtoCalculateSwingPoint;
    let point = low[index];
    let point_1 = low[index + 1];
    let point_prv_1 = low[index - 1];
    let isSwingLowPoint = false;
    if (candles === 3) {
        isSwingLowPoint = point_1 && point_1 >= point && point_prv_1 && point_prv_1 >= point;
    } else {
        let point_2 = low[index + 2];
        let point_prv_2 = low[index - 2];
        isSwingLowPoint = point_1 && point_1 >= point && point_prv_1 && point_prv_1 >= point &&
            point_2 && point_2 >= point_1 && point_prv_2 && point_prv_2 >= point_prv_1;
    }
    return isSwingLowPoint;
};

infChart.ZigZagIndicator.prototype._isValidPointWithStepAndDepth = function (lastPoint, prevlastPoint, index) {
    let isValid = false;
    if (prevlastPoint) {
        isValid = lastPoint[2] - index >= this.params.backstep && prevlastPoint[2] - index >= this.params.depth;
    } else {
        isValid = lastPoint[2] - index >= this.params.backstep;
    }
    return isValid;
};

infChart.ZigZagIndicator.prototype._validateUserInputs = function () {
    let isNotValid = false;
    let deviation = parseFloat(this.params.deviation);
    let backstep = parseFloat(this.params.backstep);
    let depth = parseFloat(this.params.depth);
    if (isNaN(deviation) || isNaN(backstep) || isNaN(depth)) {
        isNotValid = true;
    }
    if (!isNotValid && backstep > depth) {
        isNotValid = true;
    }
    return isNotValid;
};

infChart.ZigZagIndicator.prototype._getZZSeriesAndLabelSeries = function (zzSeries, data) {
    let fullZigzagSeries = [];
    let labelSeries = [];

    for (let i = 0; i < zzSeries.length; i++) { 
        let preX = i > 0 ? zzSeries[i - 1][0] : undefined;
        let preY = i > 0 ? zzSeries[i - 1][1] : undefined;
        labelSeries.push(this._getPointWithDataLabel(zzSeries[i][0], zzSeries[i][1], zzSeries[i][3], preX, preY));
        fullZigzagSeries.push([zzSeries[i][0], zzSeries[i][1]]);
        if (zzSeries[i + 1]) {
            let startIndex = zzSeries[i][2];
            let endIndex = zzSeries[i + 1][2];
            let k = endIndex - startIndex;
            let m = (zzSeries[i + 1][1] - zzSeries[i][1]) / k;
            let startY = zzSeries[i][1];
            for (let j = startIndex + 1; j < endIndex; j++) {
                let y = startY + m;
                fullZigzagSeries.push([data[j][0], y]);
                startY = y;
            }
        }
    }
    return {
        zzSeries: fullZigzagSeries,
        labelSeries: labelSeries
    };
};

infChart.ZigZagIndicator.prototype._getPointWithDataLabel = function (x, y, isHigh, preX, preY) {
    let point = {
        x: x,
        y: y,
        dataLabels: {
            x: 0,
            y: isHigh ? -5 : 50,
            format: this._labelFormatter(x, y, preX, preY)
        }
    }
    return point;
};

infChart.ZigZagIndicator.prototype._labelFormatter = function (x, y, preX, preY) {
    let stockChart = infChart.manager.getChart(this.chartId);

    let formattedPrevPointDiff = 0;
    let prevPointDiffPrecentage = 0;
    let formattedYvalue = 0;
    let formattedVolume = '--';
    let formattedLabel = '';
    let prevY = preY ? preY : y;

    // let actualIndex = chart.getMainSeries().xData.indexOf(x);
    // let actualPevIndex = preX ? chart.getMainSeries().xData.indexOf(preX) : 0;
    let actualIndex = this._getActualIndex(stockChart, x);
    let actualPevIndex = preX ? this._getActualIndex(stockChart, preX) : 0;

    let prevPointDiff = Math.abs(y - prevY);
    formattedPrevPointDiff = stockChart.formatValue(prevPointDiff, undefined, undefined, undefined, undefined, 2);
    formattedYvalue = stockChart.formatValue(y, undefined, undefined, undefined, undefined, 2);
    prevPointDiffPrecentage = ((y - prevY) / prevY * 100).toFixed(2);
    formattedVolume = stockChart.formatVolume(this._getCumulativeVolume(actualPevIndex, actualIndex));

    formattedLabel = (this.params.showReversal ? ('P ' + formattedYvalue + '<br>') : '') +
        (this.params.showVolume ? ('V ' + formattedVolume + '<br>') : '') +
        (this.params.showReversalPriceChange ? 'RPC ' + formattedPrevPointDiff + (this.params.showReversalPrecentage ? ' (' + prevPointDiffPrecentage + '%)' : '') : '');

    return formattedLabel;
};

infChart.ZigZagIndicator.prototype._getCumulativeVolume = function (startIndex, endIndex) {
    let chart = infChart.manager.getChart(this.chartId);
    let cumulativeVolume = 0;
    let i = startIndex === 0 ? 0 : startIndex;
    let volumeData = chart.processedData.ohlcv.v;
    for (i; i <= endIndex; i++) {
        cumulativeVolume += volumeData[i];
    }
    return cumulativeVolume;
};

infChart.ZigZagIndicator.prototype._getActualIndex = function (chart, xValue) {
    return chart.processedData.data.findIndex(function(element) {
        return element[0] === xValue;
    });
};

//endregion ************************************** Zig Zag Indicator ******************************************
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
//region **************************************  High Low Regression Channel (HLRegChannel) Indicator******************************************

/***
 * Constructor for High Low Regression Channel (HLRegChannel) Indicator
 * @param id
 * @param chartId
 * @constructor
 */
 infChart.HighLowRegressionChannelIndicator = function (id, chartId, type) {

    infChart.AdvancedIndicator.apply(this, arguments);

    var self = this;

    self.params.highPeriod = 3;
    self.params.lowPeriod = 3;
    self.params.emaDeviationH = 0;
    self.params.emaDeviationL = 0;
    self.params.avgPeriod = 3;
    self.params.regPeriod = 10;
    self.params.drawingUpdateType = "expandWithUpdate";

    self.titleParams = ["highPeriod", "lowPeriod", "avgPeriod", "emaDeviationH", "emaDeviationL"];

    self.selectionOptions = {drawingUpdateType: ["expandWithUpdate", "moveWithUpdate", "fixed"]};

    self.axisId = "#0";

    var chart = infChart.manager.getChart(chartId).chart;

    var drawingObject = infChart.drawingUtils.common.indicatorUtils.addRegressionChannel(chart, undefined,
        {
            'indicatorId': id,
            'drawingUpdateType': self.params.drawingUpdateType,
            'regPeriod': +self.params.regPeriod,
            'drawingId': id + '_regDrawing'
        });

    // drawingObject.openDrawingSettings = function () {
    //     self.loadSettingWindow.call(self, false, {'drawingId': drawingObject.drawingId});
    // };

    self.drawings[0] = drawingObject;

    self.series[0] = chart.addSeries({
        id: id,
        infIndType: "HLRegChannel",
        infIndSubType: "HLRegH",
        name: "Upper",
        type: "line",
        /*data: [],*/
        color: "#00aeff",
        lineColor: "#00aeff",
        infType: "indicator",
        yAxis: "#0",
        zIndex: 3,
        fillOpacity: 0.5,
        hideLegend: false,
        showInLegend: true,
        showInNavigator: false
    }, false);

    self.series[1] = chart.addSeries({
        id: id + '_HLRegA',
        infIndType: "HLRegChannel",
        infIndSubType: "HLRegA",
        name: "Mid",
        type: "line",
        /*data: [],*/
        color: "#ffffff",
        lineColor: "#ffffff",
        infType: "indicator",
        yAxis: "#0",
        zIndex: 3,
        fillOpacity: 0.5,
        hideLegend: true,
        showInLegend: false,
        showInNavigator: false
    }, false);

    self.series[2] = chart.addSeries({
        id: id + '_HLRegL',
        infIndType: "HLRegChannel",
        infIndSubType: "HLRegL",
        name: "Lower",
        type: "line",
        /*data: [],*/
        color: "#ff15af",
        lineColor: "#ff15af",
        infType: "indicator",
        yAxis: "#0",
        zIndex: 3,
        fillOpacity: 0.5,
        hideLegend: true,
        showInLegend: false,
        showInNavigator: false
    }, true);

};

infChart.util.extend(infChart.AdvancedIndicator, infChart.HighLowRegressionChannelIndicator);

infChart.HighLowRegressionChannelIndicator.prototype.calculate = function (ohlc, data, redraw) {
    var open = ohlc.o,
        high = ohlc.h,
        low = ohlc.l,
        close = ohlc.c;

    if (data && data.length > 0) {
        var calData = this.getSeries(open, high, low, close, infChart.indicatorDefaults.ARITHMETICMOVINGAVERAGE, infChart.indicatorDefaults.EXPONENTIALMOVINGAVERAGE,
            this.params.highPeriod, this.params.lowPeriod, this.params.avgPeriod, this.params.emaDeviationH, this.params.emaDeviationL);
        var _high = this.merge(data, calData.high),
            _low = this.merge(data, calData.low),
            _avg = this.merge(data, calData.avg);

        $.each(this.series, function (i, series) {
            switch (series.options.infIndSubType) {
                case 'HLRegH' :
                    series.setData(_high, false, false, false);
                    break;
                case 'HLRegA' :
                    series.setData(_avg, false, false, false);
                    break;
                case 'HLRegL' :
                    series.setData(_low, false, false, false);
                    break;
                default :
                    break;
            }
        });

        this.drawings[0].setOptions({
            calData: {high: _high, low: _low, avg: _avg},
            drawingUpdateType: this.params.drawingUpdateType,
            regPeriod: +this.params.regPeriod
        }, redraw);

        if (!this.series[0].visible && this.drawings[0]) {
            this.drawings[0].annotation.group.hide();
        }

        if (redraw) {
            var chart = infChart.manager.getChart(this.chartId).chart;
            chart.redraw();
        }
    }
};

infChart.HighLowRegressionChannelIndicator.prototype.getSeries = function (ots, hts, lts, cts, ma, md, highPeriod, lowPeriod, avgPeriod, delta1, delta2) {

    var avg = this.average(ots, hts, lts, cts),
        highRetval = this.movmean(hts, ma, highPeriod),
        lowRetVal = this.movmean(lts, ma, lowPeriod),
        avgRetVal = this.movmean(avg, ma, avgPeriod);


    if (delta1 || delta2) {

        delta1 = delta1 || 0;
        delta2 = delta2 || 0;

        var k,
            devHigh = this.movdev(highRetval, md, highPeriod),
            devLow = this.movdev(lowRetVal, md, lowPeriod);

        for (k = 0; k < highRetval.length; k++) {
            highRetval[k] = highRetval[k] + 2 * delta1 * devHigh[k];
            lowRetVal[k] = lowRetVal[k] - 2 * delta2 * devLow[k];
        }
    }

    return {high: highRetval, low: lowRetVal, avg: avgRetVal};
};

infChart.HighLowRegressionChannelIndicator.prototype.onPropertyChange = function (options) {

    this.drawings[0].setOptions({
        drawingUpdateType: this.params.drawingUpdateType,
        regPeriod: +this.params.regPeriod
    }, true);

    infChart.AdvancedIndicator.prototype.onPropertyChange.apply(this, arguments);
};

infChart.HighLowRegressionChannelIndicator.prototype.getContextMenuOptions = function (chartId, series, options) {
    return {
        "removeIndicator": {
            icon : options.removeIndicator.icon,
            displayText :options.removeIndicator.displayText,
            action : function () {
                let indicator = infChart.indicatorMgr.getIndicatorBySeriesId(chartId, series.options.id);
                infChart.manager.removeSeries(series.chart.renderTo.id, indicator.id, series.options.infType);
            }
        }
    }
};

/**
 * hide indicator
 */
infChart.HighLowRegressionChannelIndicator.prototype.hideIndicator = function (seriesId) {
    this.drawings[0].annotation.group.hide();
    infChart.Indicator.prototype.hideIndicator.apply(this, [seriesId, true]);
};

/**
 * show indicator
 */
infChart.HighLowRegressionChannelIndicator.prototype.showIndicator = function (seriesId) {
    this.drawings[0].annotation.group.show();
    infChart.Indicator.prototype.showIndicator.apply(this, [seriesId, true]);
};

//endregion ************************************** High Low Regression Channel (HLRegC)  Indicator******************************************


//region **************************************  Harmonic Pattern (HarmonicPtn) Indicator******************************************

/***
 * Constructor for  Harmonic Pattern (HarmonicPtn) Indicator
 * @param {string} id indicator id
 * @param {string} chartId chart id
 * @param {string} type indicator type
 * @constructor
 */
 infChart.HarmonicPatternIndicator = function (id, chartId, type) {

    infChart.AdvancedIndicator.apply(this, arguments);

    var self = this;
    var chart = infChart.manager.getChart(chartId).chart;

    self.axisId = "#0";
    self.series[0] = chart.addSeries({
        id: id,
        infIndType: "HarmonicPtn",
        infIndSubType: "HarmonicPtn",
        name: "Harmonic",
        type: "line",
        color: "#00aeff",
        lineColor: "#00aeff",
        infType: "indicator",
        yAxis: "#0",
        zIndex: 3,
        fillOpacity: 0.5,
        hideLegend: false,
        showInLegend: true,
        showInNavigator: false
    }, false);
};

infChart.util.extend(infChart.AdvancedIndicator, infChart.HarmonicPatternIndicator);

/**
 * Overwritting general calculate method of the indicator
 * @param {object} ohlc ohlcv data
 * @param {array} data data attay
 * @param {boolean) redraw whether to redraw chart or not
 */
infChart.HarmonicPatternIndicator.prototype.calculate = function (ohlc, data, redraw) {
    var self = this,
        open = ohlc.o,
        high = ohlc.h,
        low = ohlc.l,
        close = ohlc.c,
        xchart = infChart.manager.getChart(self.chartId),
        chart = xchart.chart;

    if (self.interval !== xchart.interval) {
        self._removeDrawings();
        self.patterns = {};
        self.selectedPattern = undefined;
    }

    if (data && data.length > 0 && self.drawings.length === 0 && !self.loading && !(self.interval === xchart.interval && xchart.checkEquivalentSymbols(xchart.symbol, self.lastRequestedSymbol))) {
        self.interval = xchart.interval;
        self.lastRequestedSymbol = xchart.symbol;
        self.loading = true;
        xchart.setLoading(true);

        self.getSeries(open, high, low, close, data, function (patternData) {
            var colors = ["#0781fb", "#90ee7e", "#f45b5b", "#7798BF", "#aaeeee", "#ff0066", "#eeaaee", "#55BF3B", "#DF5353", "#7798BF", "#ff4400", "#ff4400"];
            if (patternData && patternData.points && patternData.points.length > 0) {
                var patterns = patternData.points;
                var count = 0;
                infChart.util.forEach(patterns, function (index, value) {
                    if (value.atime && value.btime && value.ctime && value.dtime && value.xtime) {
                        //var color = colors[count % colors.length]; // TODO :: implement if needed
                        var color = colors[0];
                        count++;
                        if (!self.selectedPattern) {
                            self.selectedPattern = self.id + '_harmonicPattern_' + index;
                        }
                        self.patterns[self.id + '_harmonicPattern_' + index] = {
                            'indicatorId': self.id,
                            'drawingId': self.id + '_harmonicPattern_' + index,
                            'borderColor': color,
                            'name': value.patternname,
                            'data': {
                                "aprice": value.aprice,
                                "atime": value.atime * 1000,
                                "bprice": value.bprice,
                                "btime": value.btime * 1000,
                                "cprice": value.cprice,
                                "ctime": value.ctime * 1000,
                                "dprice": value.dprice,
                                "dtime": value.dtime * 1000,
                                "xprice": value.xprice,
                                "xtime": value.xtime * 1000,
                                "patternname": value.patternname
                            }
                        };
                    }
                });

                if (self.panel) {
                    self.removeSettingWindow();
                }

                if (xchart.isRightPanelOpen()) {
                    self.loadSettingWindow();
                } else {
                    self.patterns[self.selectedPattern] && self.drawings.push(infChart.drawingUtils.common.indicatorUtils.addHarmonicPattern(chart, undefined, self.patterns[self.selectedPattern]));
                    self._showHideDrawings();
                    self.loadSettingWindow(true);
                }
            }
            xchart.setLoading(false);
            self.loading = false
        });
    }
};

/**
 * Get series data from the service
 * @param {Array} ots open data
 * @param {Array} hts high data
 * @param {Array} lts low data
 * @param {Array} cts close data
 * @param {Array} data all data set
 * @param {function} callback callback function to be executed when data received
 */
infChart.HarmonicPatternIndicator.prototype.getSeries = function (ots, hts, lts, cts, data, callback) {
    var self = this,
        xchart = infChart.manager.getChart(self.chartId);
    var s = [];
    for (var i in data) {
        if (data.hasOwnProperty(i)) {
            s.push(data[i][0] / 1000 + "," + ots[i] + "," + hts[i] + "," + lts[i] + "," + cts[i]);
        }
    }
    xchart.dataManager.scanPattern(s.join('\n'), callback);
};
/**
 * Remove all drawings from the indicator
 * @private
 */
infChart.HarmonicPatternIndicator.prototype._removeDrawings = function () {
    var self = this;
    self.drawings.forEach(function (drawing) {
        infChart.drawingsManager.removeDrawing(self.chartId, drawing.drawingId, false);
    });
    self.drawings = [];
};

/**
 * Return the html for the settings window
 * @returns {*}
 */
infChart.HarmonicPatternIndicator.prototype.getSettingWindowHTML = function () {
    var dropdownOptionsArr = [];
    infChart.util.forEach(this.patterns, function (index, pattern) {
        dropdownOptionsArr.push({
            id: pattern.drawingId,
            name: pattern.name,
            rel: "patternItem",
            idAttr: 'inf-pattern',
            nameAttr: 'inf-pattern-name'
        })
    });
    var paramSection = infChart.structureManager.indicator.getSeriesParameterSection({}, [], [], [], [{
        options: dropdownOptionsArr,
        type: 'ind-pattern-sel',
        label: 'Pattern'
    }]);

    return infChart.structureManager.settings.getPanelHTML(this.chartId + '-indicator-panel', this.getUniqueId(),
        infChart.manager.getLabel('label.indicatorDesc.' + this.type),
        infChart.structureManager.settings.getPanelBodyHTML([paramSection]));
};

/**
 * Bind setting container's events
 * @param {Element} $container settings panel
 */
infChart.HarmonicPatternIndicator.prototype.bindSettingsContainerEvents = function ($container) {
    var self = this;
    $container.find('li[rel=patternItem] a').on('click', function (e) {
        var el = $(this).parents("div[inf-type='ind-pattern-sel']").find("span[rel=selectItem]")[0];
        var xchart = infChart.manager.getChart(self.chartId);
        var chart = xchart.chart;

        el && el.xHtml($(this).attr("inf-pattern-name"));
        self.selectedPattern = $(this).attr('inf-pattern');

        if (!self.drawings.length || (self.drawings[0].drawingId !== self.selectedPattern)) {
            self._removeDrawings();
            self.patterns[self.selectedPattern] && self.drawings.push(infChart.drawingUtils.common.indicatorUtils.addHarmonicPattern(chart, undefined, self.patterns[self.selectedPattern]));
            self._showHideDrawings();
        }
        e.stopPropagation();
    });
    infChart.structureManager.settings.bindPanel($container, function () {
        infChart.indicatorMgr.removeIndicatorFromSettings(self.chartId, self.id);
    });
};

/**
 * Initialize the settings panel
 * @param {Element} $container settings panel
 */
infChart.HarmonicPatternIndicator.prototype.initializeSettingsWindow = function ($container) {
    $container.find('li[rel=patternItem] a[inf-pattern="' + this.selectedPattern + '"]').trigger('click');
};
infChart.HarmonicPatternIndicator.prototype._removeDrawings = function () {
    var self = this;
    self.drawings.forEach(function (drawing) {
        infChart.drawingsManager.removeDrawing(self.chartId, drawing.drawingId, false);
    });
    self.drawings = [];
};
/**
 * Return the html for the settings window
 * @returns {*}
 */
infChart.HarmonicPatternIndicator.prototype.getSettingWindowHTML = function () {
    var dropdownOptionsArr = [];
    infChart.util.forEach(this.patterns, function (index, pattern) {
        dropdownOptionsArr.push({
            id: pattern.drawingId,
            name: pattern.name,
            rel: "patternItem",
            idAttr: 'inf-pattern',
            nameAttr: 'inf-pattern-name'
        })
    });
    var paramSection = infChart.structureManager.indicator.getSeriesParameterSection({}, [], [], [], [{
        options: dropdownOptionsArr,
        type: 'ind-pattern-sel',
        label: 'Pattern'
    }]);

    return infChart.structureManager.settings.getPanelHTML(this.chartId + '-indicator-panel', this.getUniqueId(),
        infChart.manager.getLabel('label.indicatorDesc.' + this.type),
        infChart.structureManager.settings.getPanelBodyHTML([paramSection]));
};

/**
 * Initialize the settings panel
 * @param {Element} $container settings panel
 */
infChart.HarmonicPatternIndicator.prototype.initializeSettingsWindow = function ($container) {
    $container.find('li[rel=patternItem] a[inf-pattern="' + this.selectedPattern + '"]').trigger('click');
};
infChart.HarmonicPatternIndicator.prototype._removeDrawings = function () {
    var self = this;
    self.drawings.forEach(function (drawing) {
        infChart.drawingsManager.removeDrawing(self.chartId, drawing.drawingId, false);
    });
    self.drawings = [];
};
/**
 * Return the html for the settings window
 * @returns {*}
 */
infChart.HarmonicPatternIndicator.prototype.getSettingWindowHTML = function () {
    var dropdownOptionsArr = [];
    infChart.util.forEach(this.patterns, function (index, pattern) {
        dropdownOptionsArr.push({
            id: pattern.drawingId,
            name: pattern.name,
            rel: "patternItem",
            idAttr: 'inf-pattern',
            nameAttr: 'inf-pattern-name'
        })
    });
    var paramSection = infChart.structureManager.indicator.getSeriesParameterSection({}, [], [], [], [{
        options: dropdownOptionsArr,
        type: 'ind-pattern-sel',
        label: 'Pattern'
    }]);

    return infChart.structureManager.settings.getPanelHTML(this.chartId + '-indicator-panel', this.getUniqueId(),
        infChart.manager.getLabel('label.indicatorDesc.' + this.type),
        infChart.structureManager.settings.getPanelBodyHTML([paramSection]));
};

/**
 * Initialize the settings panel
 * @param {Element} $container settings panel
 */
infChart.HarmonicPatternIndicator.prototype.initializeSettingsWindow = function ($container) {
    $container.find('li[rel=patternItem] a[inf-pattern="' + this.selectedPattern + '"]').trigger('click');
};

/**
 * hide indicator
 */
infChart.HarmonicPatternIndicator.prototype.hideIndicator = function (seriesId) {
    this.drawings[0].annotation.group.hide();
    infChart.Indicator.prototype.hideIndicator.apply(this, [seriesId, true]);
};

/**
 * show indicator
 */
infChart.HarmonicPatternIndicator.prototype.showIndicator = function (seriesId) {
    this.drawings[0].annotation.group.show();
    infChart.Indicator.prototype.showIndicator.apply(this, [seriesId, true]);
};

/**
 * show hide drawings
 */
infChart.HarmonicPatternIndicator.prototype._showHideDrawings = function () {
    if (!this.series[0].visible && this.drawings[0]) {
        this.drawings[0].annotation.group.hide();
    }
};

//endregion ************************************** Harmonic Pattern (HarmonicPtn)  Indicator******************************************

//region ************************************** Days Indicator******************************************

/***
 * Constructor for Days Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
infChart.DaysIndicator = function (id, chartId, type, chartInstance) {
    if (chartInstance) {
        var vm = this;
        infChart.AdvancedIndicator.apply(this, arguments);

        this.showFibLines = false;
        this.showHalfValueLines = true;
        this.params.showFibLines = this.showFibLines;
        this.params.showHalfValueLines = this.showHalfValueLines;
        this.checkOptions = ["showFibLines", "showHalfValueLines"];
        this.supportedIntervals = ["I_1", "I_2", "I_3", "I_5", "I_10", "I_15", "I_30", "I_60", "I_120", "I_240", "I_360", "I_480", "I_720", "D"];
        this.numberOfHalfValueLines = 4;
        this.fibDrawings = [];
        this.halfValueDrawings = [];
        this.lastHighlights = [];

        this.days.forEach(function (day) {
            vm.series.push(chartInstance.addSeries({
                id: id,
                name: day.name,
                infIndType: "DAY",
                infIndSubType: day.name,
                day: day.day,
                type: "plotrange",
                infType: "indicator",
                yAxis: "#0",
                legendKey: day.name,
                showInLegend: true,
                hideLegend: false,
                color: day.color,

            }, false));
        });
    }
};

infChart.util.extend(infChart.AdvancedIndicator, infChart.DaysIndicator);

/**
 * Overwrite calculate method for days indicator
 * @private
 */
infChart.DaysIndicator.prototype.calculate = function (ohlc, data, redraw) {
    var vm = this;
    if (data && data.length > 0) {
        var xChart = infChart.manager.getChart(this.chartId);
        var intervalOffset = xChart.getIntervalOption(xChart.interval).time / 2;

        if (this.interval !== xChart.interval) {
            vm.interval = xChart.interval;
            vm.removeDrawings();
            vm.fibDrawings = [];
            vm.halfValueDrawings = [];
            vm.lastHighlights = [];

            if (vm.supportedIntervals.indexOf(vm.interval) > -1) {
                vm.days.forEach(function (dayOptions) {
                    var dayHighlights = vm.getDays(data, dayOptions, intervalOffset);
                    dayHighlights.forEach(function (mondays) {
                        var dayDrawingObject = infChart.drawingUtils.common.indicatorUtils.addRectangle(vm.chart, undefined, {
                            indicatorId: vm.id,
                            drawingId: vm.id + '_MondaysDrawing_' + mondays.xValueEnd,
                            yValue: mondays.yValue,
                            xValue: mondays.xValue,
                            yValueEnd: mondays.yValueEnd,
                            xValueEnd: mondays.xValueEnd,
                            fillColor: dayOptions.color,
                            borderColor: dayOptions.color
                        });
                        dayDrawingObject.deselect.call(dayDrawingObject);
                        vm.drawings.push(dayDrawingObject);
                    });
                });
            }

            if (vm.showFibLines) {
                vm.addFibDrawings();
            }

            if (vm.showHalfValueLines) {
                vm.addHalfValueLines();
            }
        }

        if (this.params.showFibLines !== this.showFibLines) {
            this.showFibLines = this.params.showFibLines;
            this.removeDrawings(this.fibDrawings);
            this.fibDrawings = [];
            if (this.showFibLines) {
                this.addFibDrawings();
            } else {
                this.fibLineLabel = undefined;
                if (this.showHalfValueLines && this.lastHighlights.length > 0) {
                    this._addHalfValueLine(this.lastHighlights[this.lastHighlights.length - 1]);
                }
            }
        }

        if (this.params.showHalfValueLines !== this.showHalfValueLines) {
            this.showHalfValueLines = this.params.showHalfValueLines;
            this.removeDrawings(this.halfValueDrawings);
            this.halfValueDrawings = [];
            if (this.showHalfValueLines) {
                this.addHalfValueLines();
            } else if (this.fibLineLabel) {
                this.fibLineLabel.destroy();
                this.fibLineLabel = undefined;
            }
        }

        if (!this.series[0].visible) {
            this._hideDrawings();
        }

        if (redraw) {
            var chart = this.chart;
            chart.redraw();
        }
    }
};

/**
 * Overwrite the settings panel for days indicator
 * @private
 */
infChart.DaysIndicator.prototype.getSettingWindowHTML = function () {
    var self = this, config = self.getConfig(), chart = infChart.manager.getChart(self.chartId);
    var checkParameters = [];
    $.each(config.params, function (key) {
        checkParameters.xPush({'key': key, label: infChart.manager.getLabel("label.indicatorParam." + key),  value: self.params[key]});
    });

    var paramSection = infChart.structureManager.indicator.getSeriesParameterSection({}, [], [], {}, undefined, checkParameters);

    return infChart.structureManager.settings.getPanelHTML(this.chartId + '-indicator-panel', this.getUniqueId(),
        infChart.manager.getLabel('label.indicatorDesc.' + self.type),
        infChart.structureManager.settings.getPanelBodyHTML([paramSection]));
};

infChart.DaysIndicator.prototype.removeDrawings = function (drawings) {
    var vm = this;
    var drawingItems = drawings ? drawings : this.drawings;
    drawingItems.forEach(function (drawing) {
        infChart.drawingsManager.removeDrawing(vm.chartId, drawing.drawingId, true, true);

        var drawingIndex = vm.drawings.indexOf(drawing);
        if (drawings && drawingIndex > -1) {
            vm.drawings.splice(drawingIndex, 1);
        }
    });

    if (!drawings) {
        this.drawings = [];
    }
};

infChart.DaysIndicator.prototype.getDays = function (data, dayOptions, intervalOffset) {
    var pendingData = {};
    var vm = this;
    var beforeDay;

    data.forEach(function (point, index) {
        var date = new Date(point[0]);

        if (date.getUTCDay() === dayOptions.day) {
            var highlightDay = vm._getDay(date, dayOptions.day);

            if (!pendingData[highlightDay]) {
                pendingData[highlightDay] = [];

                if (index !== 0) {
                    beforeDay = data[index - 1][0];
                }
            }

            pendingData[highlightDay].push({
                beforeDay: beforeDay,
                afterDay: data[index + 1] ? data[index + 1][0] : undefined,
                index: index,
                high: point[2],
                low: point[3],
                xValue: point[0]
            })
        }
    });

    return this.updateDataWithHighlightDays(pendingData, intervalOffset);
};

infChart.DaysIndicator.prototype.updateDataWithHighlightDays = function (pendingData, intervalOffset) {
    let drawingsData = [];
    let lastHighlightedKeys = Object.keys(pendingData).slice(-this.numberOfHalfValueLines);

    for (let highlightDay in pendingData) {
        if (pendingData.hasOwnProperty(highlightDay)) {
            var groupData = pendingData[highlightDay];

            var highVal = undefined;
            var lowVal = undefined;
            groupData.forEach(function (pendData) {
                if (!highVal || pendData.high > highVal) {
                    highVal = pendData.high
                }

                if (!lowVal || pendData.low < lowVal) {
                    lowVal = pendData.low
                }
            });

            var xValDiff = groupData[0].beforeDay ? (groupData[0].xValue - groupData[0].beforeDay) / 2 : intervalOffset;
            var xVal = groupData[0].xValue - xValDiff;
            var xValEndDiff = groupData[groupData.length - 1].afterDay  ? (groupData[groupData.length - 1].afterDay - groupData[groupData.length - 1].xValue) / 2 : intervalOffset;
            var xValEnd = groupData[groupData.length - 1].xValue + xValEndDiff;

            drawingsData.push({
                xValue: xVal,
                yValue: highVal,
                xValueEnd: xValEnd,
                yValueEnd: lowVal
            });

            if (lastHighlightedKeys.indexOf(highlightDay) > -1) {
                this.lastHighlights.push({
                    index: groupData[0].index,
                    high: highVal,
                    low: lowVal,
                    xValue: xVal
                });
            }
        }
    }

    return drawingsData;
};

infChart.DaysIndicator.prototype.addFibDrawings = function () {
    let lastHighlightedDay = this.lastHighlights[this.lastHighlights.length - 1];

    if (this.showHalfValueLines && this.halfValueDrawings.length > 0) {
        let lastHalfValueDrawingIndex = this.halfValueDrawings.length - 1;
        this.removeDrawings([this.halfValueDrawings[lastHalfValueDrawingIndex]]);
        this.halfValueDrawings.splice(lastHalfValueDrawingIndex, 1);
    }

    if (lastHighlightedDay && lastHighlightedDay.high >= 0 && lastHighlightedDay.low >= 0) {
        var vm = this;
        vm.fibDrawings = [];

        var gap = (lastHighlightedDay.high - lastHighlightedDay.low)/4;
        var fibLines = [lastHighlightedDay.high, lastHighlightedDay.high - gap, lastHighlightedDay.low + gap * 2, lastHighlightedDay.low + gap, lastHighlightedDay.low];

        fibLines.forEach(function (yValue, index) {
            var drawingObject = infChart.drawingUtils.common.indicatorUtils.addHorizontalLine(vm.chart, undefined,
                {
                    indicatorId: vm.id,
                    drawingId: vm.id + "_HorLineDrawing_" + yValue,
                    yValue: yValue,
                    xValue: lastHighlightedDay.xValue,
                    dashStyle: "solid"
                });
            drawingObject.deselect.call(drawingObject);
            vm.fibDrawings.push(drawingObject);
            vm.drawings.push(drawingObject);

            if (index === 2 && vm.showHalfValueLines) {
                vm.fibLineLabel = vm._addLabel(drawingObject);
            }
        });
    }
};

infChart.DaysIndicator.prototype.addHalfValueLines = function () {
    let vm = this;
    vm.halfValueDrawings = [];
    this.lastHighlights.forEach(function (highlight, index) {
        if (!vm.showFibLines || index !== vm.lastHighlights.length - 1) {
            vm._addHalfValueLine(highlight);
        }
    });

    if (vm.showFibLines && !vm.fibLineLabel && vm.fibDrawings[2]) {
        vm.fibLineLabel = vm._addLabel(vm.fibDrawings[2]);
    }
};

infChart.DaysIndicator.prototype._addHalfValueLine = function (highlight) {
    let yValue = highlight.low + ((highlight.high - highlight.low) / 2);
    let drawingObject = infChart.drawingUtils.common.indicatorUtils.addHorizontalLine(this.chart, undefined,
        {
            indicatorId: this.id,
            drawingId: this.id + '_HorLineDrawing_' + yValue,
            yValue: yValue,
            xValue: highlight.xValue,
            dashStyle: "shortdash"
        });
    drawingObject.deselect.call(drawingObject);
    this.halfValueDrawings.push(drawingObject);
    this.drawings.push(drawingObject);
    this._addLabel(drawingObject);
};

infChart.DaysIndicator.prototype._addLabel = function (drawingObject) {
    let top = this.fiftyPercentLine.height + this.fiftyPercentLine.padding;
    let label = drawingObject.annotation.chart.renderer.label(this.fiftyPercentLine.label, 0, -top).attr({
        height: this.fiftyPercentLine.height,
        padding: this.fiftyPercentLine.padding,
        width: this.fiftyPercentLine.width,
        fill:"#000000"
    }).add(drawingObject.annotation.group);

    label.css({
        fontWeight: 150,
        opacity: 0.6,
        fontSize: "10px",
        color: this.fiftyPercentLine.color
    });

    return label;
};

infChart.DaysIndicator.prototype._getDay = function (date) {
    return [date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()].join("-");
};

/**
 * hide indicator
 */
infChart.DaysIndicator.prototype.hideIndicator = function (seriesId) {
    this._hideDrawings();
    infChart.Indicator.prototype.hideIndicator.apply(this, [seriesId, true]);
};

/**
 * show indicator
 */
infChart.DaysIndicator.prototype.showIndicator = function (seriesId) {
    this.drawings.forEach(function (drawing) {
        drawing.annotation.group.show();
    });

    this.fibDrawings.forEach(function (drawing) {
        drawing.annotation.group.show();
    });

    this.halfValueDrawings.forEach(function (drawing) {
        drawing.annotation.group.show();
    });

    infChart.Indicator.prototype.showIndicator.apply(this, [seriesId, true]);
};

/**
 * hide drawings
 */
infChart.DaysIndicator.prototype._hideDrawings = function () {
    this.drawings.forEach(function (drawing) {
        drawing.annotation.group.hide();
    });

    this.fibDrawings.forEach(function (drawing) {
        drawing.annotation.group.hide();
    });

    this.halfValueDrawings.forEach(function (drawing) {
        drawing.annotation.group.hide();
    });
};

//endregion ************************************** end of DaysIndicator Indicator******************************************

//region ************************************** Mondays Indicator******************************************

/**
 * Mondays Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
infChart.MondaysIndicator = function (id, chartId, type, chartInstance) {
    this.days = [
        {day: 1, name: "Mondays", color: "#9BDB49"}];
    this.fiftyPercentLine =  {label: "50% of Monday", color: "#ffffff", height: 14 , width: 79, padding: 2};

    infChart.DaysIndicator.apply(this, arguments);
};

infChart.util.extend(infChart.DaysIndicator, infChart.MondaysIndicator);

//endregion ************************************** end of Mondays Indicator******************************************
//region ************************************** Session / Time Breaks Indicator******************************************

/***
 * Constructor for Session Time Breaks Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
infChart.SessionTimeBreaksIndicator = function (id, chartId, type, chartInstance, config) {
    if (chartInstance) {
        var self = this;
        infChart.Indicator.apply(this, arguments);

        self.break = config.break;

        self.plotLines = [];
        self.plotLineValues = [];
        self.series.push(chartInstance.addSeries({
            id: id,
            name: "breaks",
            infIndType: type,
            infIndSubType: config.break,
            type: "plotrange",
            infType: "indicator",
            yAxis: "#0",
            showInLegend: false,
            hideLegend: false
        }, false));
    }
};

infChart.util.extend(infChart.Indicator, infChart.SessionTimeBreaksIndicator);

/**
 * Overwrite calculate method for days indicator
 * @private
 */
infChart.SessionTimeBreaksIndicator.prototype.calculate = function (ohlc, data, redraw) {
    var self = this;
    if (data && data.length > 0) {
        var xChart = infChart.manager.getChart(this.chartId);

        if (this.interval !== xChart.interval) {
            this.interval = xChart.interval;
            // Remove existing plot lines
            self.removePlotLines(true);
            self.plotLineValues = [];

            let startPoint = data[0][0];
            let endPoint = data[data.length - 1][0];

            if (self.break === "M" || self.break === "4M" || self.break === "Y") {
                let startDate = new Date(startPoint);
                startDate.setUTCMinutes(0);
                startDate.setUTCHours(0);
                startDate.setUTCDate(1);

                if (self.break === "Y" || self.break === "4M") {
                    startDate.setUTCMonth(0);
                }

                self._addIntervalDataForChangingValues(startDate, endPoint);
            } else {
                let mergedDataDurations = this._getMergedDataDurations(data, xChart.interval);
                let intervalData = self._getIntervalData(startPoint);
                startPoint = intervalData.startDate.getTime();

                let drawnBetweenMergedDuration = {};
                for (let i = startPoint; i < endPoint; i+= intervalData.plotInterval) {
                    if (self.break === "W" || !self._isPointBetweenMergedArea(i, mergedDataDurations, drawnBetweenMergedDuration)) {
                        self._createPlotLine(i);
                    }
                }
            }

            if (redraw) {
                var chart = self.chart;
                chart.redraw();
            }
        }
    }
};

/**
 * load settings
 * called in 2 instances
 * when indicator is created - this is for the panel - we do not want to show the popup
 * when indicator legend is clicked
 * @param {boolean} hide - we do not want to show the popup
 * @param {object} options - loading options
 */
infChart.SessionTimeBreaksIndicator.prototype.loadSettingWindow = function (hide, options) {

};

infChart.SessionTimeBreaksIndicator.prototype.removePlotLines = function () {
    var self = this;

    if (self.chart) {
        if (self.chart.xAxis[0].plotLinesAndBands.length === 0) {
             let plotLine = self.chart.xAxis[0].addPlotLine({
                value: 1,
                color: "#000000",
                width: 1,
                zIndex: 1,
                id: 'session-time-break-' + self.break + '-' + 0,
                dashStyle: "dash",
                acrossPanes: false
            });
        }

        let plotLines = self.chart.xAxis[0].plotLinesAndBands;
        let plotLineLength = plotLines.length;

        for (var i=0; i<plotLineLength; i++) {
            if (plotLines[0] && plotLines[0].id && plotLines[0].id.indexOf("session-time-break-") > -1) {
                self.chart.xAxis[0].removePlotLine(plotLines[0].id);
            }
        }

        self.chart.xAxis[0].plotLinesAndBands = [];
    }

    self.plotLines = [];
};

infChart.SessionTimeBreaksIndicator.prototype.updateColor = function (color) {
    let self = this;
    self.removePlotLines();

    self.plotLineValues.forEach(function (plotLineValue) {
        self._createPlotLine(plotLineValue.value);
    });

    self.color = color;
};

infChart.SessionTimeBreaksIndicator.prototype.updateLineType = function (type) {
    let self = this;
    self.removePlotLines();

    self.plotLineValues.forEach(function (plotLineValue) {
        self._createPlotLine(plotLineValue.value);
    });

    self.lineType = type;
};

infChart.SessionTimeBreaksIndicator.prototype.destroy = function () {
    this.removePlotLines();
    infChart.Indicator.prototype.destroy.apply(this, arguments);
};

infChart.SessionTimeBreaksIndicator.prototype._getMergedDataDurations = function (data, interval) {
    let mergedDataDurations = [];

    data.forEach(function (point, index) {
            let nextPoint = data[index + 1];
            if (nextPoint) {
                let diff = nextPoint[0] - point[0];
                let diffMins = Math.floor(diff/1000/60);
                let isDiffInMergedArea;

                switch (interval) {
                    case 'I_1':
                        isDiffInMergedArea = diffMins > 1;
                        break;
                    case 'I_2':
                        isDiffInMergedArea = diffMins > 2;
                        break;
                    case 'I_3':
                        isDiffInMergedArea = diffMins > 3;
                        break;
                    case 'I_5':
                        isDiffInMergedArea = diffMins > 5;
                        break;
                    case 'I_10':
                        isDiffInMergedArea = diffMins > 10;
                        break;
                    case 'I_15':
                        isDiffInMergedArea = diffMins > 15;
                        break;
                    case 'I_30':
                        isDiffInMergedArea = diffMins > 30;
                        break;
                    case 'I_60':
                        isDiffInMergedArea = diffMins > 60;
                        break;
                    case 'I_120':
                        isDiffInMergedArea = diffMins > 60*2;
                        break;
                    case 'I_240':
                        isDiffInMergedArea = diffMins > 60*4;
                        break;
                    case 'D':
                        isDiffInMergedArea = diffMins > 60*24;
                        break;
                    case 'W':
                        isDiffInMergedArea = diffMins > 60*24*7;
                        break;
                    case 'M':
                        isDiffInMergedArea = diffMins > 60*24*30;
                        break;
                    default:
                        break;
                }

                if (isDiffInMergedArea) {
                    mergedDataDurations.push([point[0], nextPoint[0]]);
                }
            }
        });

    return mergedDataDurations;
};

infChart.SessionTimeBreaksIndicator.prototype._isPointBetweenMergedArea = function (pointValue, mergedDataDurations, drawnBetweenMergedDuration) {
    for (let i = 0; i < mergedDataDurations.length; i++) {
        if (pointValue > mergedDataDurations[i][0] && pointValue < mergedDataDurations[i][1]) {
            let  key = mergedDataDurations[i][0] + "-" + mergedDataDurations[i][1];
            if (!drawnBetweenMergedDuration[key]) {
                drawnBetweenMergedDuration[key] = true;
                return false;
            } else {
                return true;
            }
        }
    }

    return false;
};

infChart.SessionTimeBreaksIndicator.prototype._createPlotLine = function (value) {
    let self = this;

    if (self.chart) {
        let xAxis = self.chart.xAxis[0];
        let plotLineSettings = infChart.manager.getChart(self.chartId).sessionTimeBreakSettings[self.break];
        let dashStyle = plotLineSettings.lineType === "dash" ? "12 9" : plotLineSettings.lineType;
        let plotLine = xAxis.addPlotLine({
            value: value,
            color: plotLineSettings.color,
            width: 1,
            zIndex: 3,
            id: 'session-time-break-' + self.break + '-' + value,
            dashStyle: dashStyle,
            acrossPanes: false
        });

        self.plotLineValues.push({
            value: value
        });
        self.plotLines.push(plotLine);
    }
};

infChart.SessionTimeBreaksIndicator.prototype._addIntervalDataForChangingValues = function (startDate, endPoint) {
    let time = startDate.getTime();
    if (time < endPoint) {
        this._createPlotLine(time);

        if (this.break === "M") {
            let month = startDate.getUTCMonth();
            startDate.setUTCMonth(month + 1);
        } else if (this.break === "4M") {
            let month = startDate.getUTCMonth();
            startDate.setUTCMonth(month + 3);
        } else if (this.break === "Y") {
            let year = startDate.getUTCFullYear();
            startDate.setUTCFullYear(year + 1);
        }

        this._addIntervalDataForChangingValues(startDate, endPoint);
    }
};

infChart.SessionTimeBreaksIndicator.prototype._getIntervalData = function (startPoint) {
    let startDate = new Date(startPoint);
    let plotInterval;

    switch (this.break) {
        case 'selectSession':
            // is point related to relevant session break
            break;
        case 'I_2':
            startDate.setUTCMinutes(0);
            plotInterval =  2 * 60 * 1000; // 2 mins in milliseconds
            break;
        case 'I_3':
            startDate.setUTCMinutes(0);
            plotInterval =  3 * 60 * 1000; // 3 mins in milliseconds
            break;
        case 'I_5':
            startDate.setUTCMinutes(0);
            plotInterval =  5 * 60 * 1000; // 5 mins in milliseconds
            break;
        case 'I_10':
            startDate.setUTCMinutes(0);
            plotInterval =  10 * 60 * 1000; // 10 mins in milliseconds
            break;
        case 'I_15':
            startDate.setUTCMinutes(0);
            plotInterval =  15 * 60 * 1000; // 15 mins in milliseconds
            break;
        case 'I_30':
            startDate.setUTCMinutes(0);
            plotInterval =  30 * 60 * 1000; // 30 mins in milliseconds
            break;
        case 'I_60':
            startDate.setUTCMinutes(0);
            plotInterval =  3600 * 1000; // 1 hour in milliseconds
            break;
        case 'I_120':
            startDate.setUTCMinutes(0);
            startDate.setUTCHours(0);
            plotInterval =  2 * 3600 * 1000; // 2 hour in milliseconds
            break;
        case 'I_240':
            startDate.setUTCMinutes(0);
            startDate.setUTCHours(0);
            plotInterval =  4 * 3600 * 1000; // 4 hour in milliseconds
            break;
        case 'D':
            startDate.setUTCMinutes(0);
            startDate.setUTCHours(0);
            plotInterval =  24 * 3600 * 1000;
            break;
        case 'W':
            startDate.setUTCMinutes(0);
            startDate.setUTCHours(0);
            startDate.setUTCDate(startDate.getUTCDate() - (startDate.getUTCDay() - 1));
            plotInterval =  7 * 24 * 3600 * 1000;
            break;
        default:
            break;
    }

    return {
        startDate: startDate,
        plotInterval: plotInterval
    };
};

//endregion ************************************** end of Session / Time Breaks Indicator******************************************

window.infChart = window.infChart || {};

infChart.harmonicPatternDrawing = function () {
    infChart.drawingObject.apply(this, arguments);
};

infChart.harmonicPatternDrawing.prototype = Object.create(infChart.drawingObject.prototype);

/**
* set additional drawings of the tool
*/
infChart.harmonicPatternDrawing.prototype.additionalDrawingsFunction = function () {
    var self = this,
        ann = self.annotation,
        chart = ann.chart,
        options = ann.options,
        yAxis = chart.yAxis[options.yAxis],
        lineShapes = self.getPatternShapes(),
        additionalDrawingsArr = self.additionalDrawings,
        theme = infChart.drawingUtils.common.getTheme(),
        shapeTheme = theme["harmonicPattern"],
        pointNamesArr = ["x", "a", "b", "c", "d"];

    additionalDrawingsArr.lines = {};
    additionalDrawingsArr.fill = {};
    additionalDrawingsArr.labels = {};
    additionalDrawingsArr.circles = {};
    additionalDrawingsArr.axisLabels = {};
    additionalDrawingsArr.rect = {};

    ann.selectionMarker = [];

    var drawingLineAttr = {
        'stroke-width': 1,
        'fill': 'none',
        'stroke': options.shape.params.stroke || shapeTheme && shapeTheme.stroke || infChart.drawingUtils.common.baseBorderColor,
        'stroke-dasharray': "2 2"
    };
    additionalDrawingsArr.lines["xbd"] = chart.renderer.path(lineShapes.xbd).attr(drawingLineAttr).add(ann.group);
    additionalDrawingsArr.lines["ac"] = chart.renderer.path(lineShapes.ac).attr(drawingLineAttr).add(ann.group);

    var drawingFillAttr = {
        'stroke-width': 0,
        'fill': options.fillColorValue || shapeTheme && shapeTheme.fillColor || infChart.drawingUtils.common.baseFillColor,
        'fill-opacity':  options.fillOpacityValue || shapeTheme && shapeTheme.fillOpacity || infChart.drawingUtils.common.baseFillOpacity,
        'stroke': ann.options.shape.params.stroke
    };

    additionalDrawingsArr.fill["xabFill"] = chart.renderer.path(lineShapes.xabFill).attr(drawingFillAttr).add(ann.group);
    additionalDrawingsArr.fill["bcdFill"] = chart.renderer.path(lineShapes.bcdFill).attr(drawingFillAttr).add(ann.group);

    // lineShapes.namePosition && (additionalDrawingsArr.labels["nameLabel"] = self.getLabel(options.name, lineShapes.namePosition.x, lineShapes.namePosition.y));

    /**
     * Create a circle and add to the group
     * @param {number} x x position
     * @param {number} y y position
     * @returns {SVGElement} The generated circle
     */
    function addCircle(x, y) {
        var padding = 10;
        var selectPointStyles = {
            'stroke-width': 2,
            stroke: options.shape.params.stroke,
            fill: '#141414',
            dashstyle: 'solid',
            'shape-rendering': 'crispEdges',
            'z-index': 10,
            cursor: 'crosshair'
        };
        return chart.renderer.circle(x, y, padding / 2).attr(selectPointStyles).add(ann.group);
    }

    var clipPosX = lineShapes.positions.axisClips.x;
    var clipPosY = lineShapes.positions.axisClips.y;

    self.setSelectionMarkers();
    infChart.util.forEach(pointNamesArr, function (index, value) {
        var values = lineShapes.values[value];

        // point Labels
        var labelPosition = lineShapes.positions["pointLabels"][value];
        labelPosition && (additionalDrawingsArr.labels[value + "Label"] = self.getLabel(labelPosition.label, labelPosition.x, labelPosition.y));

        var circlePosition = lineShapes.positions["circles"][value];
        var xlabelPosition = lineShapes.positions["xAxisLabels"][value];
        var ylabelPosition = lineShapes.positions["yAxisLabels"][value];
        if (options.isIndicator) {
            //TODO :: indicator specific things
            // circles
            circlePosition && (additionalDrawingsArr.circles[value] = addCircle(circlePosition.x, circlePosition.y));
            // x axis labels
            xlabelPosition && (additionalDrawingsArr.axisLabels["xLabel_" + value] = infChart.drawingUtils.common.getAxisLabel.call(self, xlabelPosition.x, xlabelPosition.y, values.xValue, values.optionXValue, true, shapeTheme && shapeTheme.label));
            // y axis labels
            ylabelPosition && (additionalDrawingsArr.axisLabels["yLabel_" + value] = infChart.drawingUtils.common.getAxisLabel.call(self, ylabelPosition.x, ylabelPosition.y, values.yValue, values.optionYValue, false, shapeTheme && shapeTheme.label));

            clipPosX && !additionalDrawingsArr.rect.x && (additionalDrawingsArr.rect.x = chart.renderer.rect(clipPosX.x, clipPosX.y, clipPosX.w, clipPosX.h).attr(drawingFillAttr).add(ann.group));
            clipPosY && !additionalDrawingsArr.rect.y && (additionalDrawingsArr.rect.y = chart.renderer.rect(clipPosY.x, clipPosY.y, clipPosY.w, clipPosY.h).attr(drawingFillAttr).add(ann.group));
        }
    });
    additionalDrawingsArr.labels["XBFib"] = self.getLabel("XBFib", 0, 0).hide();
    additionalDrawingsArr.labels["ACFib"] = self.getLabel("ACFib", 0, 0).hide();
    additionalDrawingsArr.labels["BDFib"] = self.getLabel("BDFib", 0, 0).hide();
    additionalDrawingsArr.labels["XDFib"] = self.getLabel("XDFib", 0, 0).hide();

    yAxis.isDirty = true; // need to change the axis offset in the chart
    self.chartRedrawRequired = false;

    if(options.intermediatePoints.length > 0) {
        this.scale();
    }
};

/**
* Get xAxis labels to front when there is an real-time update which is to redraw the chart without extrem changes
*/
infChart.harmonicPatternDrawing.prototype.afterRedrawXAxisWithoutSetExtremes = function () {
    var self = this;
    infChart.util.forEach(["x", "a", "b", "c", "d"], function (key, value) {
        var label = self.additionalDrawings.axisLabels["xLabel_" + value];
        label && infChart.drawingUtils.common.getAxisLabelToFront.call(self, label, true);
    });
};

infChart.harmonicPatternDrawing.prototype.bindSettingsEvents = function () {
    infChart.drawingUtils.common.bindXabcdSettingsEvents.call(this);
};

infChart.harmonicPatternDrawing.prototype.deselect = function () {
    this.annotation.selectionMarker = [];
    if(!this.annotation.options.isIndicator){
        this.additionalDrawings.axisLabels = {};
        this.additionalDrawings.rect = {};
        this.additionalDrawings.circles = {};
    }
};

/**
* Returns the maximum offset of the axis labels
* @param {Highstock.Axis} axis axis object
* @returns {number} max width
*/
infChart.harmonicPatternDrawing.prototype.getAxisOffset = function (axis) {
    var drawingObject = this,
        ann = drawingObject.annotation,
        options = ann.options,
        padding = infChart.util.isDefined(ann.options.xLabelPadding) || 3,
        maxWidth = 0,
        pointNamesArr = ["x", "a", "b", "c", "d"],
        lineShapes = this.getPatternShapes();

    if (!axis.isXAxis && options.yAxis === axis.options.index) {

        infChart.util.forEach(pointNamesArr, function (key, value) {
            var values = lineShapes.values[value];
            if (values) {
                var optionValue = values.optionYValue;
                var yValue = values.yValue;
                var label = drawingObject.additionalDrawings.axisLabels["yLabel_" + value];
                if (label) {
                    label.attr({
                        text: drawingObject.getLabelFormattedYValue(yValue, optionValue)
                    });
                    maxWidth = Math.max(maxWidth, label.width + padding);
                }
            }
        });
    }
    return maxWidth;
};

/**
* Returns the base line's path
* @returns Array path to draw base line
*/
infChart.harmonicPatternDrawing.prototype.getBasePatternLine = function () {
    var self = this,
        ann = self.annotation,
        options = ann.options,
        chart = ann.chart,
        xAxis = chart.xAxis[options.xAxis],
        yAxis = chart.yAxis[options.yAxis],
        x = xAxis.toPixels(options.xValue),
        y = yAxis.toPixels(options.yValue),
        line = ['M', 0, 0];

    infChart.util.forEach(options.intermediatePoints, function (index, value) {
        line.push('L');
        line.push(xAxis.toPixels(value.xValue) - x);
        line.push(yAxis.toPixels(value.yValue) - y);
    });

    if (options.xValueEnd) {
        line.push('L');
        line.push(xAxis.toPixels(options.xValueEnd) - x);
        line.push(yAxis.toPixels(options.yValueEnd) - y);
    }
    return line;
};

infChart.harmonicPatternDrawing.prototype.getClickValues = function (clickX, clickY) {
    var ann = this.annotation;
    var chart = ann.chart;
    var options = ann.options;
    var xAxis = chart.xAxis[options.xAxis];
    var yAxis = chart.yAxis[options.yAxis];
    var completedSteps = this.annotation.options.completedSteps;
    var coordinates = {
        xValue: options.xValue,
        yValue: options.yValue,
        intermediatePoints: options.intermediatePoints
    };
    switch (completedSteps) {
        case 1:

            coordinates.intermediatePoints[0].xValue = xAxis.toValue(clickX);
            coordinates.intermediatePoints[0].yValue = yAxis.toValue(clickY);
            break;
        case 2:
            coordinates.intermediatePoints[1].xValue = xAxis.toValue(clickX);
            coordinates.intermediatePoints[1].yValue = yAxis.toValue(clickY);
            break;
        case 3:
            coordinates.intermediatePoints[2].xValue = xAxis.toValue(clickX);
            coordinates.intermediatePoints[2].yValue = yAxis.toValue(clickY);
            break;
        case 4:
            coordinates.xValueEnd = xAxis.toValue(clickX);
            coordinates.yValueEnd = yAxis.toValue(clickY);
            break;

    }
    return coordinates;
};

/**
* Returns the config to save
* @returns {{shape: string, borderColor: *, strokeWidth: *, xValue: *, yValue: *, xValueEnd: *, yValueEnd: *, intermediatePoints: Array}} config object
*/
infChart.harmonicPatternDrawing.prototype.getConfig = function () {
    var annotation = this.annotation, levels = {};
    var intermediatePoints = [];
    for (var i = 0; i < annotation.options.intermediatePoints.length; i++) {
        intermediatePoints.push({
            xValue: annotation.options.intermediatePoints[i].xValue,
            yValue: annotation.options.intermediatePoints[i].yValue
        });
    }

    return {
        shape: 'harmonicPattern',
        borderColor: annotation.options.shape.params.stroke,
        strokeWidth: annotation.options.shape.params['stroke-width'],
        xValue: annotation.options.xValue,
        yValue: annotation.options.yValue,
        xValueEnd: annotation.options.xValueEnd,
        yValueEnd: annotation.options.yValueEnd,
        intermediatePoints: intermediatePoints,
        fillColor: annotation.options.shape.params.fill,
        fillOpacity: annotation.options.shape.params['fill-opacity'],
        fillColorValue: annotation.options.fillColorValue,
        fillOpacityValue: annotation.options.fillOpacityValue,
        textColor: annotation.options.textColor,
        textFontSize: annotation.options.textFontSize,
    };
};

/**
 * Create a label and add to the group
 * @param {String} name label text
 * @param {number} x x position
 * @param {number} y y position
 * @returns {SVGElement} the generated label
 */
infChart.harmonicPatternDrawing.prototype.getLabel = function (name, x, y) {
    var self = this,
        ann = self.annotation,
        options = ann.options,
        chart = ann.chart,
        theme = infChart.drawingUtils.common.getTheme(),
        shapeTheme = theme["harmonicPattern"];

    return chart.renderer.label(name, x, y).attr({
        'zIndex': 20,
        'r': 3,
        'fill': options.shape.params.stroke || shapeTheme && shapeTheme.label && shapeTheme.label.fill || "#2f2e33",
        'opacity': shapeTheme && shapeTheme.label && shapeTheme.label.opacity || 1,
        'stroke': shapeTheme && shapeTheme.label && shapeTheme.label.stroke || "#858587",
        'stroke-width': 0,
        'hAlign': 'center',
        'class': 'harmonic-lbl'
    }).add(ann.group).css(
        {
            color: options.textColor ||shapeTheme && shapeTheme.label && shapeTheme.label.stroke || "#000000",
            fontSize: options.textFontSize || shapeTheme.fontSize || '16px',
            cursor: 'move',
            fontWeight: '500',
            fontStyle: 'normal',
            textDecoration: 'inherit'
        });
};

infChart.harmonicPatternDrawing.prototype.getLabelFormattedXValue = function (value, axis) {
    var interval = infChart.manager.getChart(infChart.manager.getContainerIdFromChart(this.chart.renderTo.id)).interval;
    var format = axis.options.dateTimeLabelFormats.day + " " + axis.options.dateTimeLabelFormats.minute;
    if (interval === 'D' || interval === 'W' || interval === 'M' || interval === 'Y') {
        format = axis.options.dateTimeLabelFormats.day;
    }
    return infChart.util.formatDate(value, format);
};

/**
 * Returns the formatted label
 * @param {number} yValue actual value
 * @param {number} optionsyValue value in the options
 * @returns {string} formatted value to be set
 */
infChart.harmonicPatternDrawing.prototype.getLabelFormattedYValue = function (yValue, optionsyValue) {
    var stockChart = this.stockChart;
    var value;
    if (stockChart.isPercent) {
        value = stockChart.getYLabel(optionsyValue, true, false, false);
    } else {
        value = stockChart.formatValue(yValue, stockChart.getMainSeries().options.dp);
    }
    return value;
};

infChart.harmonicPatternDrawing.prototype.getNextPointOptions = function () {
    var ann = this.annotation;
    var intermediatePointCount = this.intermediatePoints.length;
    var completedSteps = ann.options.completedSteps;
    var pointOptions = { name: "x" };
    switch (completedSteps) {
        case 1:
            pointOptions.name = "a";
            break;
        case 2:
            pointOptions.name = "b";
            break;
        case 3:
            pointOptions.name = "c";
            break;
        case 4:
            pointOptions.name = "d";
            break;

    }
    return pointOptions;
};

/**
* Returns the the drawing options from saved|initial properties
* @param {object} properties drawing properties
* @returns {{name: *, indicatorId: *, utilizeAxes: string, xValue: *, yValue: *, xValueEnd: *, yValueEnd: *, intermediatePoints: Array, allowDragY: boolean, shape: {params: {fill: string, d: *[]}}, isIndicator: boolean, drawingType: string, allowDragX: boolean}} options to set
*/
infChart.harmonicPatternDrawing.prototype.getOptions = function (properties) {
    var theme = infChart.drawingUtils.common.getTheme();
    var shapeTheme = theme["harmonicPattern"];
    var options = {
        name: properties.name,
        xValue: properties.xValue,
        yValue: properties.yValue,
        xValueEnd: properties.xValueEnd,
        yValueEnd: properties.yValueEnd,
        intermediatePoints: [],
        shape: {
            params: {
                fill: "none",
                d: ['M', 0, 0, 'L', 0, 0],
                'stroke-width': 3
            }
        }
    };

    if (properties.isIndicator) {
        options.drawingType = infChart.constants.drawingTypes.indicator;
        options.isIndicator = true;
        options.indicatorId = properties.indicatorId;
        options.allowDragY = false;
        options.allowDragX = false;
    }

    if (properties.borderColor) {
        options.shape.params.stroke = properties.color || properties.borderColor;
    }
    if (properties.strokeWidth) {
        options.shape.params['stroke-width'] = properties.strokeWidth;
    }
    if (properties.levels) {
        options.levels = properties.levels;
    }
    if (properties.intermediatePoints) {
        for (var i = 0; i < properties.intermediatePoints.length; i++) {
            options.intermediatePoints.push({
                xValue: properties.intermediatePoints[i].xValue,
                yValue: properties.intermediatePoints[i].yValue
            });
        }
    }
    if (properties.completedSteps) {
        options.completedSteps = properties.completedSteps;
    }

    if (properties.fillColorValue) {
        options.fillColorValue = properties.fillColorValue;
    } else {
        options.fillColorValue = "none";
    }

    if (properties.fillOpacityValue) {
        options.fillOpacityValue = properties.fillOpacityValue;
    } else {
        options.fillOpacityValue = "0.5";
    }

    if(properties.textColor) {
        options.textColor = properties.textColor;
    } else {
        options.textColor = shapeTheme.label.fontColor || "#000000";
    }

    if(properties.textFontSize) {
        options.textFontSize = properties.textFontSize;
    } else {
        options.textFontSize = shapeTheme.label.fontSize || 16;
    }

    options.validateTranslationFn = this.validateTranslation;
    return options;
};

infChart.harmonicPatternDrawing.prototype.validateTranslation = function (newXValue) {
    var self = this,
        ann = self.annotation,
        options = ann.options,
        chart = ann.chart,
        seriesData = chart.series[0].xData,
        dataMin = seriesData[0],
        xVal = options.xValue,
        xValEnd = options.xValueEnd,
        intermediate = options.intermediatePoints,
        newXValueEnd = xValEnd - xVal + newXValue,
        newIntermediateStart = intermediate[0].xValue - xVal + newXValue,
        newIntermediateMiddle = intermediate[1].xValue - xVal + newXValue,
        newIntermediateEnd = intermediate[2].xValue - xVal + newXValue,
        totalPoints = infChart.drawingsManager.getTotalPoints(chart),
        dataMax = totalPoints[totalPoints.length - 1];

    return (newXValue >= dataMin && newXValue <= dataMax) && (newXValueEnd >= dataMin && newXValueEnd <= dataMax) && (newIntermediateStart >= dataMin && newIntermediateStart <= dataMax) && (newIntermediateMiddle >= dataMin && newIntermediateMiddle <= dataMax) && (newIntermediateEnd >= dataMin && newIntermediateEnd <= dataMax);
};

/**
* Returns the paths, values and positions of the shapes under this drawing
* @returns {object} pattern shapes
*/
infChart.harmonicPatternDrawing.prototype.getPatternShapes = function () {
    var ann = this.annotation,
        chart = ann.chart,
        options = ann.options,
        intermediatePoints = options.intermediatePoints,
        intermediatePointsRaw = this.intermediatePoints,
        xAxis = chart.xAxis[options.xAxis],
        yAxis = chart.yAxis[options.yAxis],
        x = xAxis.toPixels(options.xValue),
        y = yAxis.toPixels(options.yValue),
        ax = intermediatePoints && intermediatePoints[0] && (xAxis.toPixels(intermediatePoints[0].xValue) - x),
        ay = intermediatePoints && intermediatePoints[0] && (yAxis.toPixels(intermediatePoints[0].yValue) - y),
        bx = intermediatePoints && intermediatePoints[1] && (xAxis.toPixels(intermediatePoints[1].xValue) - x),
        by = intermediatePoints && intermediatePoints[1] && (yAxis.toPixels(intermediatePoints[1].yValue) - y),
        cx = intermediatePoints && intermediatePoints[2] && (xAxis.toPixels(intermediatePoints[2].xValue) - x),
        cy = intermediatePoints && intermediatePoints[2] && (yAxis.toPixels(intermediatePoints[2].yValue) - y),
        dx = options.xValueEnd && (xAxis.toPixels(options.xValueEnd) - x),
        dy = options.yValueEnd && (yAxis.toPixels(options.yValueEnd) - y),
        patternPaths = {};

    patternPaths.xbd = dx !== undefined ? ['M', 0, 0, 'L', bx, by, 'L', dx, dy, 'L', 0, 0] : bx !== undefined ? ['M', 0, 0, 'L', bx, by] : ['M', 0, 0];
    patternPaths.ac = cx !== undefined ? ['M', ax, ay, 'L', cx, cy] : ax !== undefined ? ['M', ax, ay] : [];
    patternPaths.xabFill = bx !== undefined ? ['M', 0, 0, 'L', ax, ay, 'L', bx, by] : ax !== undefined ? ['M', 0, 0, 'L', ax, ay, 'L', 0, 0] : ['M', 0, 0, 'L', 0, 0, 'L', 0, 0];
    patternPaths.bcdFill = dx !== undefined ? ['M', bx, by, 'L', cx, cy, 'L', dx, dy] : bx !== undefined ? ['M', bx, by, 'L', cx, cy, 'L', bx, by] : cx !== undefined ? ['M', cx, cy, 'L', cx, cy, 'L', cx, cy] : [];

    var nameAdditionalY = 25;
    if (dx !== undefined) {
        if (ay < 0) {
            patternPaths.namePosition = { x: (dx) / 2, y: (dy) / 2 + nameAdditionalY };
        } else {
            patternPaths.namePosition = { x: (ax + cx) / 2, y: (ay + cy) / 2 + nameAdditionalY };
        }
    }

    patternPaths.xCirclePosition = { x: 0, y: 0 };

    patternPaths.positions = {
        pointLabels: {
            x: { x: -5, y: ay < 0 ? 5 : -25, label: "X" }
        },
        xAxisLabels: {
            x: { x: 0, y: chart.plotHeight - y },
            a: { x: ax, y: chart.plotHeight - y },
            b: { x: bx, y: chart.plotHeight - y },
            c: { x: cx, y: chart.plotHeight - y },
            d: { x: dx, y: chart.plotHeight - y }
        },
        yAxisLabels: {
            x: { x: xAxis.width - x, y: 0 },
            a: { x: xAxis.width - x, y: ay },
            b: { x: xAxis.width - x, y: by },
            c: { x: xAxis.width - x, y: cy },
            d: { x: xAxis.width - x, y: dy }
        },
        circles: {
            x: { x: 0, y: 0 },
            a: { x: ax, y: ay },
            b: { x: bx, y: by },
            c: { x: cx, y: cy },
            d: { x: dx, y: dy }
        }
    };

    if (ax !== undefined) {
        var rectMax = Math.min(0, ay, by || 0, cy || 0, dy || 0);
        var rectMin = Math.max(0, ay, by || 0, cy || 0, dy || 0);

        patternPaths.positions.axisClips = {
            x: {
                x: 0,
                y: patternPaths.positions["xAxisLabels"].x.y,
                w: dx || cx || bx || ax,
                h: chart.axisOffset[2]
            },
            // y: {
            //     x: patternPaths.positions.yAxisLabels.x.x,
            //     y: rectMax,
            //     w: chart.axisOffset[1],
            //     h: rectMin - rectMax
            // }
        };
    } else {
        patternPaths.positions.axisClips = {};
    }
    patternPaths.values = {
        x: {
            xValue: options.xValue,
            yValue: this.yValue,
            optionXValue: options.xValue,
            optionYValue: options.yValue
        }
    };

    if (ax !== undefined) {
        patternPaths.aCirclePosition = { x: ax, y: ay };
        patternPaths.positions.pointLabels.a = { x: ax - 5, y: ay < 0 ? ay - 25 : ay + 5, label: "A" };
        patternPaths.values.a = {
            xValue: intermediatePoints[0].xValue,
            yValue: intermediatePointsRaw[0] ? intermediatePointsRaw[0].yValue : infChart.drawingUtils.common.getBaseYValue.call(this, intermediatePoints[0].yValue),
            optionXValue: intermediatePoints[0].xValue,
            optionYValue: intermediatePoints[0].yValue
        };

    }
    if (bx !== undefined) {
        patternPaths.bCirclePosition = { x: bx, y: by };
        patternPaths.positions.pointLabels.b = { x: bx - 5, y: ay < by ? by + 5 : by - 25, label: "B" };
        patternPaths.values.b = {
            xValue: intermediatePoints[1].xValue,
            yValue: intermediatePointsRaw[1] ? intermediatePointsRaw[1].yValue : infChart.drawingUtils.common.getBaseYValue.call(this, intermediatePoints[1].yValue),
            optionXValue: intermediatePoints[1].xValue,
            optionYValue: intermediatePoints[1].yValue
        };

    }
    if (cx !== undefined) {
        patternPaths.cCirclePosition = { x: cx, y: cy };
        patternPaths.positions.pointLabels.c = { x: cx - 5, y: cy < dy ? cy - 25 : cy + 5, label: "C" };
        patternPaths.values.c = {
            xValue: intermediatePoints[2].xValue,
            yValue: intermediatePointsRaw[2] ? intermediatePointsRaw[2].yValue : infChart.drawingUtils.common.getBaseYValue.call(this, intermediatePoints[2].yValue),
            optionXValue: intermediatePoints[2].xValue,
            optionYValue: intermediatePoints[2].yValue
        };

    }
    if (dx !== undefined) {
        patternPaths.dCirclePosition = { x: dx, y: dy };
        patternPaths.positions.pointLabels.d = { x: dx - 5, y: cy < dy ? dy + 5 : dy - 25, label: "D" };
        patternPaths.values.d = {
            xValue: options.xValueEnd,
            yValue: this.yValueEnd !== undefined ? this.yValueEnd : infChart.drawingUtils.common.getBaseYValue.call(this, options.yValueEnd),
            optionXValue: options.xValueEnd,
            optionYValue: options.yValueEnd
        };

    }
    return patternPaths;
};

infChart.harmonicPatternDrawing.prototype.getQuickSettingsPopup = function () {
    var common = infChart.drawingUtils.common;
    var shapeTheme = infChart.drawingUtils.common.getTheme()["harmonicPattern"];
    var opacity = shapeTheme && shapeTheme.fillOpacity || infChart.drawingUtils.common.baseFillOpacity;
    var fill = shapeTheme && shapeTheme.fillColor || common.baseFillColor;
    return infChart.structureManager.drawingTools.getXabcdQuickSettings(common.baseBorderColor, fill, opacity);
};

infChart.harmonicPatternDrawing.prototype.getSettingsPopup = function () {
    var common = infChart.drawingUtils.common;
    var shapeTheme = infChart.drawingUtils.common.getTheme()["harmonicPattern"];
    var opacity = shapeTheme && shapeTheme.fillOpacity || infChart.drawingUtils.common.baseFillOpacity;
    var fill = shapeTheme && shapeTheme.fillColor || common.baseFillColor;
    return infChart.structureManager.drawingTools.getXabcdSettings(common.baseBorderColor, fill, opacity, this.fontColor, this.fontSize);
};

infChart.harmonicPatternDrawing.prototype.hasMoreIntermediateSteps = function () {
    return !(this.annotation.options.completedSteps === 4);
};

infChart.harmonicPatternDrawing.prototype.onclick = function () {
    infChart.drawingUtils.common.getAxisLabelToFront.call(this, this.additionalDrawings.axisLabels["xLabel_x"]);
}

/**
 * Change the fill and opacity of the annotation from the given params
 * IMPORTANT :: this method is uesd in commands.wrappers to set undo/redo actions
 * @param {object} rgb rgb value of the color
 * @param {string} value hash value of the color
 * @param {float} opacity opacity to be set
 * @param {string} level level that change should be applied
 * @param {boolean|undefined} isPropertyChange property change
 * @param {string} colorPickerRef filter to search for the specific color picker that change occured (used in wrappers)
*/
infChart.harmonicPatternDrawing.prototype.onFillColorChange = function (rgb, value, opacity, level, isPropertyChange, colorPickerRef) {
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
    if (self.settingsPopup) {
        self.settingsPopup.data("infUndoRedo", false);
    }
};

/**
* Scale function of the tool
*/
infChart.harmonicPatternDrawing.prototype.scale = function (isCalculateNewValueForScale) {
    var self = this,
        ann = self.annotation,
        line,
        additionalDrawingsArr = self.additionalDrawings,
        pointNamesArr = ["x", "a", "b", "c", "d"];

    line = self.getBasePatternLine();

    ann.update({
        shape: {
            params: {
                d: line
            }
        }
    });

    var lineShapes = self.getPatternShapes();
    additionalDrawingsArr.lines["xbd"].attr({ d: lineShapes.xbd });
    additionalDrawingsArr.lines["ac"].attr({ d: lineShapes.ac });
    additionalDrawingsArr.fill["xabFill"].attr({ d: lineShapes.xabFill });
    additionalDrawingsArr.fill["bcdFill"].attr({ d: lineShapes.bcdFill });
    lineShapes.namePosition && additionalDrawingsArr.labels["nameLabel"] && additionalDrawingsArr.labels["nameLabel"].attr({
        x: lineShapes.namePosition.x,
        y: lineShapes.namePosition.y
    });

    infChart.util.forEach(pointNamesArr, function (index, value) {
        // x axis labels
        if (additionalDrawingsArr.axisLabels["xLabel_" + value]) {
            var labelPosition = lineShapes.positions["xAxisLabels"][value];
            var label = additionalDrawingsArr.axisLabels["xLabel_" + value];
            label.attr({ x: labelPosition.x - label.width / 2, y: labelPosition.y });
        }

        // point labels
        labelPosition = lineShapes.positions["pointLabels"][value];
        label = additionalDrawingsArr.labels[value + "Label"];
        label && label.attr({ x: labelPosition.x, y: labelPosition.y });

        //y labels
        if (additionalDrawingsArr.axisLabels["yLabel_" + value]) {
            labelPosition = lineShapes.positions["yAxisLabels"][value];
            label = additionalDrawingsArr.axisLabels["yLabel_" + value];
            label.attr({ x: labelPosition.x, y: labelPosition.y });
        }

        // circles
        if (additionalDrawingsArr.circles[value]) {
            var circlePositions = lineShapes.positions["circles"][value];
            additionalDrawingsArr.circles[value].attr({ x: circlePositions.x, y: circlePositions.y });
        }
    });
    var clipPosX = lineShapes.positions.axisClips.x;
    var clipPosY = lineShapes.positions.axisClips.y;
    additionalDrawingsArr.rect.x && additionalDrawingsArr.rect.x.attr({
        x: clipPosX.x,
        y: clipPosX.y,
        width: clipPosX.w,
        height: clipPosX.h
    });
    additionalDrawingsArr.rect.y && additionalDrawingsArr.rect.y.attr({
        x: clipPosY.x,
        y: clipPosY.y,
        width: clipPosY.w,
        height: clipPosY.h
    });


    var xPoint, aPoint, bPoint, cPoint, dPoint;

    var XAVal, ABVal, BCVal, CDVal, ADVal;

    xPoint = [ann.options.xValue, ann.options.yValue];

    if (ann.options.intermediatePoints[0]) {
        aPoint = [ann.options.intermediatePoints[0].xValue, ann.options.intermediatePoints[0].yValue];
        XAVal = Math.abs(xPoint[1] - aPoint[1]);
    }
    if (ann.options.intermediatePoints[1]) {
        bPoint = [ann.options.intermediatePoints[1].xValue, ann.options.intermediatePoints[1].yValue];
        ABVal = Math.abs(bPoint[1] - aPoint[1]);
    }
    if (ann.options.intermediatePoints[2]) {
        cPoint = [ann.options.intermediatePoints[2].xValue, ann.options.intermediatePoints[2].yValue];
        BCVal = Math.abs(bPoint[1] - cPoint[1]);
    }
    if (ann.options.xValueEnd) {
        dPoint = [ann.options.xValueEnd, ann.options.yValueEnd];
        ADVal = Math.abs(dPoint[1] - aPoint[1]);
        CDVal = Math.abs(dPoint[1] - cPoint[1]);
    }

    var XBFib, ACFib, BDFib, XDFib = 0;

    if (ABVal > 0 && XAVal > 0) {
        XBFib = infChart.drawingUtils.common.formatValue(ABVal / XAVal, 3);
        var XBFibLabl = additionalDrawingsArr.labels["XBFib"];
        var XBFibLablX = (lineShapes.positions["pointLabels"]["b"].x - lineShapes.positions["pointLabels"]["x"].x) / 2 + lineShapes.positions["pointLabels"]["x"].x;
        var XBFibLablY = (lineShapes.positions["pointLabels"]["b"].y - lineShapes.positions["pointLabels"]["x"].y) / 2 + lineShapes.positions["pointLabels"]["x"].y;
        XBFibLabl.attr({
            x: XBFibLablX,
            y: XBFibLablY,
            text: XBFib
        }).show();

    }

    if (BCVal > 0 && ABVal > 0) {
        ACFib = infChart.drawingUtils.common.formatValue(BCVal / ABVal, 3);
        additionalDrawingsArr.labels["ACFib"].attr({
            x: (lineShapes.positions["pointLabels"]["c"].x - lineShapes.positions["pointLabels"]["a"].x) / 2 + lineShapes.positions["pointLabels"]["a"].x,
            y: (lineShapes.positions["pointLabels"]["c"].y - lineShapes.positions["pointLabels"]["a"].y) / 2 + lineShapes.positions["pointLabels"]["a"].y,
            text: ACFib
        }).show();
    }

    if (CDVal > 0 && BCVal > 0) {
        BDFib = infChart.drawingUtils.common.formatValue(CDVal / BCVal, 3);

        additionalDrawingsArr.labels["BDFib"].attr({
            x: (lineShapes.positions["pointLabels"]["d"].x - lineShapes.positions["pointLabels"]["b"].x) / 2 + lineShapes.positions["pointLabels"]["b"].x,
            y: (lineShapes.positions["pointLabels"]["d"].y - lineShapes.positions["pointLabels"]["b"].y) / 2 + lineShapes.positions["pointLabels"]["b"].y,
            text: BDFib
        }).show();
    }

    if (ADVal > 0 && XAVal > 0) {
        XDFib = infChart.drawingUtils.common.formatValue(ADVal / XAVal, 3);
        additionalDrawingsArr.labels["XDFib"].attr({
            x: (lineShapes.positions["pointLabels"]["d"].x - lineShapes.positions["pointLabels"]["x"].x) / 2 + lineShapes.positions["pointLabels"]["x"].x,
            y: (lineShapes.positions["pointLabels"]["d"].y - lineShapes.positions["pointLabels"]["x"].y) / 2 + lineShapes.positions["pointLabels"]["x"].y,
            text: XDFib
        }).show();
    }
};

infChart.harmonicPatternDrawing.prototype.finalizeEachPoint = function () {
    var self = this,
        ann = self.annotation,
        line,
        additionalDrawingsArr = self.additionalDrawings,
        pointNamesArr = ["x", "a", "b", "c", "d"];

    line = self.getBasePatternLine();

    ann.update({
        shape: {
            params: {
                d: line
            }
        }
    });

    var lineShapes = self.getPatternShapes();
    additionalDrawingsArr.lines["xbd"].attr({ d: lineShapes.xbd });
    additionalDrawingsArr.lines["ac"].attr({ d: lineShapes.ac });
    additionalDrawingsArr.fill["xabFill"].attr({ d: lineShapes.xabFill });
    additionalDrawingsArr.fill["bcdFill"].attr({ d: lineShapes.bcdFill });
    lineShapes.namePosition && additionalDrawingsArr.labels["nameLabel"] && additionalDrawingsArr.labels["nameLabel"].attr({
        x: lineShapes.namePosition.x,
        y: lineShapes.namePosition.y
    });

    infChart.util.forEach(pointNamesArr, function (index, value) {
        // x axis labels
        if (additionalDrawingsArr.axisLabels["xLabel_" + value]) {
            var labelPosition = lineShapes.positions["xAxisLabels"][value];
            var label = additionalDrawingsArr.axisLabels["xLabel_" + value];
            label.attr({ x: labelPosition.x - label.width / 2, y: labelPosition.y });
        }

        // point labels
        labelPosition = lineShapes.positions["pointLabels"][value];
        label = additionalDrawingsArr.labels[value + "Label"];
        label && label.attr({ x: labelPosition.x, y: labelPosition.y });

        //y labels
        if (additionalDrawingsArr.axisLabels["yLabel_" + value]) {
            labelPosition = lineShapes.positions["yAxisLabels"][value];
            label = additionalDrawingsArr.axisLabels["yLabel_" + value];
            label.attr({ x: labelPosition.x, y: labelPosition.y });
        }

        // circles
        if (additionalDrawingsArr.circles[value]) {
            var circlePositions = lineShapes.positions["circles"][value];
            additionalDrawingsArr.circles[value].attr({ x: circlePositions.x, y: circlePositions.y });
        }
    });
    var clipPosX = lineShapes.positions.axisClips.x;
    var clipPosY = lineShapes.positions.axisClips.y;
    additionalDrawingsArr.rect.x && additionalDrawingsArr.rect.x.attr({
        x: clipPosX.x,
        y: clipPosX.y,
        width: clipPosX.w,
        height: clipPosX.h
    });
    additionalDrawingsArr.rect.y && additionalDrawingsArr.rect.y.attr({
        x: clipPosY.x,
        y: clipPosY.y,
        width: clipPosY.w,
        height: clipPosY.h
    });


    var xPoint, aPoint, bPoint, cPoint, dPoint;

    var XAVal, ABVal, BCVal, CDVal, ADVal;

    xPoint = [ann.options.xValue, ann.options.yValue];

    if (ann.options.intermediatePoints[0]) {
        aPoint = [ann.options.intermediatePoints[0].xValue, ann.options.intermediatePoints[0].yValue];
        XAVal = Math.abs(xPoint[1] - aPoint[1]);
    }
    if (ann.options.intermediatePoints[1]) {
        bPoint = [ann.options.intermediatePoints[1].xValue, ann.options.intermediatePoints[1].yValue];
        ABVal = Math.abs(bPoint[1] - aPoint[1]);
    }
    if (ann.options.intermediatePoints[2]) {
        cPoint = [ann.options.intermediatePoints[2].xValue, ann.options.intermediatePoints[2].yValue];
        BCVal = Math.abs(bPoint[1] - cPoint[1]);
    }
    if (ann.options.xValueEnd) {
        dPoint = [ann.options.xValueEnd, ann.options.yValueEnd];
        ADVal = Math.abs(dPoint[1] - aPoint[1]);
        CDVal = Math.abs(dPoint[1] - cPoint[1]);
    }

    var XBFib, ACFib, BDFib, XDFib = 0;

    if (ABVal > 0 && XAVal > 0) {
        XBFib = infChart.drawingUtils.common.formatValue(ABVal / XAVal, 3);
        var XBFibLabl = additionalDrawingsArr.labels["XBFib"];
        var XBFibLablX = (lineShapes.positions["pointLabels"]["b"].x - lineShapes.positions["pointLabels"]["x"].x) / 2 + lineShapes.positions["pointLabels"]["x"].x;
        var XBFibLablY = (lineShapes.positions["pointLabels"]["b"].y - lineShapes.positions["pointLabels"]["x"].y) / 2 + lineShapes.positions["pointLabels"]["x"].y;
        XBFibLabl.attr({
            x: XBFibLablX,
            y: XBFibLablY,
            text: XBFib
        }).show();

    }

    if (BCVal > 0 && ABVal > 0) {
        ACFib = infChart.drawingUtils.common.formatValue(BCVal / ABVal, 3);
        additionalDrawingsArr.labels["ACFib"].attr({
            x: (lineShapes.positions["pointLabels"]["c"].x - lineShapes.positions["pointLabels"]["a"].x) / 2 + lineShapes.positions["pointLabels"]["a"].x,
            y: (lineShapes.positions["pointLabels"]["c"].y - lineShapes.positions["pointLabels"]["a"].y) / 2 + lineShapes.positions["pointLabels"]["a"].y,
            text: ACFib
        }).show();
    }

    if (CDVal > 0 && BCVal > 0) {
        BDFib = infChart.drawingUtils.common.formatValue(CDVal / BCVal, 3);

        additionalDrawingsArr.labels["BDFib"].attr({
            x: (lineShapes.positions["pointLabels"]["d"].x - lineShapes.positions["pointLabels"]["b"].x) / 2 + lineShapes.positions["pointLabels"]["b"].x,
            y: (lineShapes.positions["pointLabels"]["d"].y - lineShapes.positions["pointLabels"]["b"].y) / 2 + lineShapes.positions["pointLabels"]["b"].y,
            text: BDFib
        }).show();
    }

    if (ADVal > 0 && XAVal > 0) {
        XDFib = infChart.drawingUtils.common.formatValue(ADVal / XAVal, 3);
        additionalDrawingsArr.labels["XDFib"].attr({
            x: (lineShapes.positions["pointLabels"]["d"].x - lineShapes.positions["pointLabels"]["x"].x) / 2 + lineShapes.positions["pointLabels"]["x"].x,
            y: (lineShapes.positions["pointLabels"]["d"].y - lineShapes.positions["pointLabels"]["x"].y) / 2 + lineShapes.positions["pointLabels"]["x"].y,
            text: XDFib
        }).show();
    }
    infChart.drawingUtils.common.saveBaseYValues.call(self, ann.options.yValue, ann.options.yValueEnd, undefined, ann.options.intermediatePoints);
};

infChart.harmonicPatternDrawing.prototype.scaleSelectionMarkers = function (lineShapes) {
    var self = this,
        ann = self.annotation,
        options = ann.options,
        line,
        additionalDrawingsArr = self.additionalDrawings,
        pointNamesArr = ["x", "a", "b", "c", "d"];

    infChart.util.forEach(pointNamesArr, function (index, value) {
        var values = lineShapes.values[value];

        // x axis labels
        if (additionalDrawingsArr.axisLabels["xLabel_" + value]) {
            var labelPosition = lineShapes.positions["xAxisLabels"][value];
            var label = additionalDrawingsArr.axisLabels["xLabel_" + value];
            label.attr({
                x: labelPosition.x - label.width / 2,
                y: labelPosition.y,
                text: self.stockChart.getXAxisCrosshairLabel(values.optionXValue, self.stockChart.chart.xAxis[options.xAxis])
            });
        }

        //y labels
        if (additionalDrawingsArr.axisLabels["yLabel_" + value]) {
            labelPosition = lineShapes.positions["yAxisLabels"][value];
            label = additionalDrawingsArr.axisLabels["yLabel_" + value];
            label.attr({
                x: labelPosition.x,
                y: labelPosition.y,
                text: self.getLabelFormattedYValue(values.yValue, values.optionYValue)
            });
        }
    });
    var clipPosX = lineShapes.positions.axisClips.x;
    var clipPosY = lineShapes.positions.axisClips.y;
    additionalDrawingsArr.rect.x && additionalDrawingsArr.rect.x.attr({
        x: clipPosX.x,
        y: clipPosX.y,
        width: clipPosX.w,
        height: clipPosX.h
    });
    additionalDrawingsArr.rect.y && additionalDrawingsArr.rect.y.attr({
        x: clipPosY.x,
        y: clipPosY.y,
        width: clipPosY.w,
        height: clipPosY.h
    });
};

infChart.harmonicPatternDrawing.prototype.select = function () { };

infChart.harmonicPatternDrawing.prototype.selectAndBindResize = function () {
    var self = this,
        ann = self.annotation;
    ann.events.deselect.call(ann);
    ann.selectionMarker = [];
    self.setSelectionMarkers();
};

infChart.harmonicPatternDrawing.prototype.setSelectionMarkers = function () {
    var self = this,
        ann = self.annotation,
        chart = ann.chart,
        options = ann.options,
        xAxis = chart.xAxis[options.xAxis],
        lineShapes = self.getPatternShapes(),
        theme = infChart.drawingUtils.common.getTheme(),
        shapeTheme = theme["harmonicPattern"],
        startX = xAxis.toPixels(options.xValue),
        additionalDrawingsArr = self.additionalDrawings;

    if (!options.isIndicator && !ann.selectionMarker.length) {
        if(startX > 0 ){
            infChart.util.forEach(["x", "a", "b", "c", "d"], function (index, value) {
                var circlePosition = lineShapes.positions["circles"][value];
                circlePosition && circlePosition.x != undefined && circlePosition.y != undefined &&
                    (additionalDrawingsArr.circles[value] = infChart.drawingUtils.common.addAndBindSelectionMarker.call(self, ann, circlePosition.x, circlePosition.y, self.stepFunction, self.stop, true, undefined, { name: value }));
            });
        } else {
            var selectionMarkerPoints = self.getSelectionMarkerPositionFromDrawing();
            infChart.util.forEach(["x", "a", "b", "c", "d"], function (index, value) {
                var circlePosition = lineShapes.positions["circles"][value];
                var selectionMarkerPosition = selectionMarkerPoints[value];
                circlePosition && selectionMarkerPosition && circlePosition.y != undefined &&
                    (additionalDrawingsArr.circles[value] = infChart.drawingUtils.common.addAndBindSelectionMarker.call(self, ann, selectionMarkerPosition, circlePosition.y, self.stepFunction, self.stop, true, undefined, { name: value }));
            });
        }

        infChart.util.forEach(["x", "a", "b", "c", "d"], function (index, value) {
            var values = lineShapes.values[value];
            var labelPosition = lineShapes.positions["xAxisLabels"][value];
            var ylabelPosition = lineShapes.positions["yAxisLabels"][value];
            labelPosition && labelPosition.x != undefined && labelPosition.y != undefined &&
                (additionalDrawingsArr.axisLabels["xLabel_" + value] = infChart.drawingUtils.common.addSelectionMarkerLabel.call(self, labelPosition.x, labelPosition.y, values.xValue, values.optionXValue, true, shapeTheme && shapeTheme.label));
            labelPosition && labelPosition.x != undefined && labelPosition.y != undefined &&
                (additionalDrawingsArr.axisLabels["yLabel_" + value] = infChart.drawingUtils.common.addSelectionMarkerLabel.call(self, ylabelPosition.x, ylabelPosition.y, values.yValue, values.optionYValue, false, shapeTheme && shapeTheme.label));
        });

        var drawingFillAttr = {
            'stroke-width': 0,
            'fill': options.shape.params.stroke || shapeTheme && shapeTheme.fillColor || infChart.drawingUtils.common.baseFillColor,
            'fill-opacity': shapeTheme && shapeTheme.fillOpacity || infChart.drawingUtils.common.baseFillOpacity,
            'stroke': ann.options.shape.params.stroke
        };

        var clipPosX = lineShapes.positions.axisClips.x;
        var clipPosY = lineShapes.positions.axisClips.y;
        if (clipPosY && !additionalDrawingsArr.rect.y && clipPosX && !additionalDrawingsArr.rect.x) {
            additionalDrawingsArr.rect.x = chart.renderer.rect(clipPosX.x, clipPosX.y, clipPosX.w, clipPosX.h).attr(drawingFillAttr).add(ann.group);
            additionalDrawingsArr.rect.y = chart.renderer.rect(clipPosY.x, clipPosY.y, clipPosY.w, clipPosY.h).attr(drawingFillAttr).add(ann.group);
            ann.selectionMarker.push(additionalDrawingsArr.rect.x);
            ann.selectionMarker.push(additionalDrawingsArr.rect.y);
        }

    }
};

infChart.harmonicPatternDrawing.prototype.getSelectionMarkerPositionFromDrawing = function () {
    var self = this,
        ann = self.annotation,
        shape = ann.shape.d.split(' ');

    return {
        x: shape[1],
        a: shape[4],
        b: shape[7],
        c: shape[10],
        d: shape[13]
    }
};

/**
* Step function
* @param {Event} e event
* @param {boolean} isStartPoint indicate whether the start or not
*/
infChart.harmonicPatternDrawing.prototype.step = function (e, isStartPoint, itemProperties) {
    var ann = this.annotation,
        options = ann.options,
        chart = ann.chart,
        xAxis = chart.xAxis[options.xAxis],
        yAxis = chart.yAxis[options.yAxis],
        pathDefinition = ann.shape.d.split(' '),
        x = xAxis.toPixels(options.xValue),
        y = yAxis.toPixels(options.yValue),
        pointx = xAxis.toValue(e.chartX),
        pointy = yAxis.toValue(e.chartY),
        intermediatePoints = options.intermediatePoints,
        completedSteps = options.completedSteps,
        newOtions = {};
    switch (itemProperties.name) {
        case 'a':
            if (!intermediatePoints[0]) {
                intermediatePoints[0] = {};
            }
            intermediatePoints[0].xValue = pointx;
            intermediatePoints[0].yValue = pointy;

            break;
        case 'b':
            if (!intermediatePoints[1]) {
                intermediatePoints[1] = {};
            }
            intermediatePoints[1].xValue = pointx;
            intermediatePoints[1].yValue = pointy;
            break;
        case 'c':
            if (!intermediatePoints[2]) {
                intermediatePoints[2] = {};
            }
            intermediatePoints[2].xValue = pointx;
            intermediatePoints[2].yValue = pointy;
            break;
        case 'd':
            newOtions.xValueEnd = pointx;
            newOtions.yValueEnd = pointy;
            break;
        case 'x':
            newOtions.xValue = pointx;
            newOtions.yValue = pointy;
            break;
        default:
            break;
    }
    newOtions.intermediatePoints = intermediatePoints;

    ann.update(newOtions);
    this.finalizeEachPoint();
};

/**
 * Stop function
 * @param {Event} e event
 * @param {boolean} isStartPoint indicate whether the start or not
 */
infChart.harmonicPatternDrawing.prototype.stop = function (e, isStartPoint) {
    var self = this,
        ann = self.annotation,
        lineShapes = self.getPatternShapes(),
        additionalDrawingsArr = self.additionalDrawings;

    // point Labels
    if (!additionalDrawingsArr.labels["dLabel"]) {
        var labelPosition = lineShapes.positions["pointLabels"]["d"];
        labelPosition && (additionalDrawingsArr.labels["dLabel"] = self.getLabel(labelPosition.label, labelPosition.x, labelPosition.y));
    }

    infChart.drawingUtils.common.saveBaseYValues.call(self, ann.options.yValue, ann.options.yValueEnd, undefined, ann.options.intermediatePoints);
    infChart.drawingUtils.common.fixSelectionMarker.call(self, ann);
};

infChart.harmonicPatternDrawing.prototype.translateEnd = function () {
    var self = this,
        ann = self.annotation,
        options = ann.options,
        chart = ann.chart,
        xAxis = chart.xAxis[options.xAxis];

    var futureValue = chart.series[0].xData[chart.series[0].xData.length - 1];
    if(futureValue < options.xValue || futureValue < options.xValueEnd || futureValue < options.intermediatePoints[0].xValue || futureValue < options.intermediatePoints[1].xValue || futureValue < options.intermediatePoints[2].xValue || futureValue < options.intermediatePointsStore[0].xValue || futureValue < options.intermediatePointsStore[1].xValue || futureValue < options.intermediatePointsStore[2].xValue){
        var shape = self.annotation.shape.d.split(' ');
        var firstIntermediate = shape[4];
        var secondIntermediate = shape[7];
        var thirdIntermediate = shape[10];
        var xEnd = shape[13];
        var firstIntermediateXValue = xAxis.toValue(parseFloat(firstIntermediate) + xAxis.toPixels(options.xValue));
        var secondIntermediateXValue = xAxis.toValue(parseFloat(secondIntermediate) + xAxis.toPixels(options.xValue));
        var thirdIntermediateXValue = xAxis.toValue(parseFloat(thirdIntermediate) + xAxis.toPixels(options.xValue));
        var xValueEnd = xAxis.toValue(parseFloat(xEnd) + xAxis.toPixels(options.xValue));
        options.intermediatePoints[0].xValue = firstIntermediateXValue;
        options.intermediatePoints[1].xValue = secondIntermediateXValue;
        options.intermediatePoints[2].xValue = thirdIntermediateXValue;
        ann.update({
            intermediatePoints: options.intermediatePoints,
            xValueEnd: xValueEnd
        });
    }
    self.selectAndBindResize();
    self.scale();
};

infChart.harmonicPatternDrawing.prototype.updateSettings = function (properties) {
    infChart.structureManager.drawingTools.updateXabcdSettings(this.settingsPopup, properties.borderColor, properties.strokeWidth, properties.fillColorValue, properties.fillOpacityValue, properties.textColor, properties.textFontSize);
};
window.infChart = window.infChart || {};

infChart.highLowRegressionChannelDrawing = function () {
    infChart.drawingObject.apply(this, arguments);
    this.levels = {
        upper: { id: "upper", fillColor: '#726a6f', fillOpacity: 0.5, label: "label.upperFillColor" },
        lower: { id: "lower", fillColor: '#835974', fillOpacity: 0.5, label: "label.lowerFillColor" }
    };
};

infChart.highLowRegressionChannelDrawing.prototype = Object.create(infChart.drawingObject.prototype);

infChart.highLowRegressionChannelDrawing.prototype.additionalDrawingsFunction = function () {
    var ann = this.annotation,
        chart = ann.chart,
        options = ann.options,
        padding = 8,
        additionalDrawingsArr = this.additionalDrawings,
        levels = this.levels,
        drawingFillAttr;

    additionalDrawingsArr.lines = {};
    additionalDrawingsArr.fill = {};

    var regOptions,
        common = infChart.drawingUtils.common;

    $.each(levels, function (indx, value) {
        regOptions = options.levels && options.levels[indx];
        drawingFillAttr = {
            'stroke-width': 0,
            fill: regOptions && regOptions.fillColor ? regOptions.fillColor : value && value.fillColor ? value.fillColor : common.baseFillColor,
            'fill-opacity': regOptions && regOptions.fillOpacity ? regOptions.fillOpacity : value.fillOpacity != undefined ? value.fillOpacity : common.baseFillOpacity,
            stroke: ann.options.shape.params.stroke,
            'z-index': 2,
            cursor: 'move'
        };
        additionalDrawingsArr.fill[value.id] = chart.renderer.path(['M', 0, 0, 'L', 0, 0, 'L', 0, 0, 'L', 0, 0]).attr(drawingFillAttr).add(ann.group);
    });


    ann.selectionMarker = [];
    // ann.selectionMarker.push(chart.renderer.rect(-padding / 2, -padding / 2, padding, padding).attr(infChart.drawingUtils.common.selectPointStyles).add(ann.group));
};

infChart.highLowRegressionChannelDrawing.prototype.afterDrag = function () {
    var ann = this.annotation,
        options = ann.options,
        data = options && options.data && options.data.avg,
        xVal = options && options.xValue,
        periodEndXValue = options && options.xValueEnd < xVal ? xVal : options.xValueEnd,
        periodStartXValue = options && options.xValueEnd > xVal ? xVal : options.xValueEnd;


    if (data && periodEndXValue < data[data.length - 1][0]) {
        if (options.drawingUpdateType == "expandWithUpdate") {
            options.drawingUpdateType = "fixed";
            infChart.drawingUtils.common.indicatorUtils.updateIndicatorOptions(this, ["drawingUpdateType"]);
        } else if (options.drawingUpdateType == "moveWithUpdate") {
            options.timeLag = data[data.length - 1][0] - periodEndXValue;
            options.timeDiff = periodEndXValue - periodStartXValue;
        }
    }

    this.calculatePeriodInRange(periodStartXValue, periodEndXValue);
};

infChart.highLowRegressionChannelDrawing.prototype.bindSettingsEvents = function () {
    var self = this;

    function onColorChange(rgb, value) {
        var isPropertyChange = true;
        if (self.settingsPopup) {
            isPropertyChange = self.isSettingsPropertyChange();
        }
        infChart.drawingUtils.common.settings.onLineColorChange.call(self, rgb, value, isPropertyChange, "[inf-ctrl='lineColorPicker']");
    }

    function onFillColorChange(rgb, value, opacity, level) {
        var isPropertyChange = true;
        if (self.settingsPopup) {
            isPropertyChange = self.isSettingsPropertyChange();
        }
        self.onFillColorChange(rgb, value, opacity, level, isPropertyChange);
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

    infChart.structureManager.drawingTools.bindRegressionChannelSettings(self.settingsPopup, onColorChange, onFillColorChange, onLineWidthChange, onResetToDefault);
};

infChart.highLowRegressionChannelDrawing.prototype.calculatePeriodInRange = function (startVal, endVal) {
    var self = this,
        ann = self.annotation,
        chart = ann.chart,
        mainSeries = chart && chart.series[0],
        data = mainSeries && mainSeries.options.data,
        length = data && data.length,
        count = 0;

    for (var i = length; i >= 0; i--) {
        if (data[i] && data[i][0] <= endVal) {
            if (data[i] && data[i][0] >= startVal) {
                if (count == 0) {
                    // This index is used to find out end value when drawing tool is not aligned with the last value.
                    self.periodEndIdx = i;
                }
                count++;
            } else {
                break;
            }
        }
    }
    return count;
};

infChart.highLowRegressionChannelDrawing.prototype.calculateRegressionChannel = function (periodStartXValue, periodEndXValue) {
    var self = this,
        ann = self.annotation,
        options = ann && ann.options,
        chart = ann.chart,
        compareValue = chart && chart.series[0] && chart.series[0].userOptions.compare && chart.series[0].compareValue || 0,
        n = 0,
        data = options && options.data,
        length = data && data.avg && data.avg.length,
        dataLength = 0,
        xAxis = chart.xAxis[ann.options.xAxis],
        yAxis = chart.yAxis[ann.options.yAxis],
        point, x, y,
        refX = xAxis.toPixels(ann.options.xValue),
        refY = yAxis.toPixels(ann.options.yValue),
        periodDataPoints = {},
        regPoints = {},
        sigmaX = {},
        sigmaY = {},
        sigmaXX = {},
        sigmaXY = {},
        sigmaYY = {},
        calPoints;

    for (; n < length; n++) {
        for (var key in data) {
            if (data.hasOwnProperty(key) && data[key][n]) {
                point = data[key][n];

                if (point[0] && !isNaN(point[1]) && point[0] >= periodStartXValue && point[0] <= periodEndXValue) {
                    x = xAxis.toPixels(point[0]) - refX;
                    y = yAxis.toPixels(point[1] - compareValue) - refY;
                    sigmaX[key] = (sigmaX[key] || 0) + x; //Σ(X)
                    sigmaY[key] = (sigmaY[key] || 0) + y; //Σ(Y)
                    sigmaXX[key] = (sigmaXX[key] || 0) + x * x; //Σ(X^2)
                    sigmaXY[key] = (sigmaXY[key] || 0) + x * y; //Σ(XY)
                    sigmaYY[key] = (sigmaYY[key] || 0) + y * y; //Σ(Y^2)

                    if (!periodDataPoints[key]) {
                        periodDataPoints[key] = [];
                    }

                    periodDataPoints[key].push(point);
                }
            }
        }

    }


    for (key in periodDataPoints) {
        if (periodDataPoints.hasOwnProperty(key)) {

            calPoints = periodDataPoints[key];
            dataLength = calPoints.length;

            var intercept = (sigmaY[key] * sigmaXX[key] - sigmaX[key] * sigmaXY[key]) / ((dataLength) * sigmaXX[key] - sigmaX[key] * sigmaX[key]); ///(dataLength * sum[3] - sum[0] * sum[1]) / (dataLength * sum[2] - sum[0] * sum[0]);
            var gradient = ((dataLength) * sigmaXY[key] - sigmaX[key] * sigmaY[key]) / (((dataLength) * sigmaXX[key] - sigmaX[key] * sigmaX[key]));//(sum[1] / dataLength) - (gradient * sum[0]) / dataLength;

            //TODO :: There is an issue with the move with update after dragging it backwards
            //gradient = sigmaX[key] <0 ? (-1) * gradient : gradient;
            //intercept = sigmaX[key] <0 ? intercept - refY : intercept;
            regPoints[key] = [];

            for (n = 0; n < dataLength; n++) {
                point = calPoints[n];
                x = xAxis.toPixels(point[0]) - refX;
                //y = yAxis.toPixels(point[1]) - refY;
                regPoints[key][n] = (intercept + (gradient * x));//- compareValue;// - refY;
            }
        }
    }
    return {
        calcData: { periodData: periodDataPoints },
        regPoints: regPoints
    };
};

infChart.highLowRegressionChannelDrawing.prototype.getConfig = function () {
    var annotation = this.annotation, levels = {};

    $.each(this.additionalDrawings.fill, function (id, val) {
        levels[id] = {
            fillColor: val.attr('fill'),
            fillOpacity: val.attr('fill-opacity')
        }
    });
    return {
        shape: 'highLowRegressionChannel',
        levels: levels,
        borderColor: annotation.options.shape.params.stroke,
        fillColor: annotation.options.shape.params.fill,
        strokeWidth: annotation.options.shape.params['stroke-width'],
        xValue: annotation.options.xValue,
        yValue: annotation.options.yValue,
        xValueEnd: annotation.options.xValueEnd,
        yValueEnd: annotation.options.yValueEnd,
        //indicatorId : annotation.options.indicatorId,
        drawingUpdateType: annotation.options.drawingUpdateType,
        regPeriod: annotation.options.regPeriod
    };
};

infChart.highLowRegressionChannelDrawing.prototype.getOptions = function (properties) {
    var options = {
        name: "Regression Channel",
        indicatorId: properties.indicatorId,
        xValue: properties.xValue,
        yValue: properties.yValue,
        xValueEnd: properties.xValueEnd,
        yValueEnd: properties.yValueEnd,
        allowDragY: false,
        shape: {
            params: {
                d: ['M', 0, 0, 'L', 0, 0]
            }
        },
        isIndicator: true,
        drawingUpdateType: properties.drawingUpdateType,
        drawingType: infChart.constants.drawingTypes.indicator,
        regPeriod: properties.regPeriod,
        allowDragX: this.isAllowDragX(properties.drawingUpdateType)
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
    if (properties.levels) {
        options.levels = properties.levels;
    }
    return options;
};

infChart.highLowRegressionChannelDrawing.prototype.getPeriodRange = function (periodStartXValue, periodEndXValue) {
    var ann = this.annotation,
        options = ann.options,
        chart = ann.chart,
        data = chart.series[0] && chart.series[0].options.data;

    if (data && data.length > 0 && !options.mouseDownOnAnn) {
        switch (options.drawingUpdateType) {
            case "expandWithUpdate":
                periodEndXValue = data[data.length - 1][0];
                break;
            case "moveWithUpdate":
                periodEndXValue = data[data.length - 1][0] - (options.timeLag || 0);
                periodStartXValue = ((data.length > options.regPeriod && data[data.length - options.regPeriod][0]) || data[0][0]) - (options.timeLag || 0);
                break;
            case "fixed":
                if (!this.periodEndIdx) {
                    this.periodEndIdx = data.length - 1;
                }
                periodStartXValue = data[this.periodEndIdx - options.regPeriod][0];
                break;
            default:
                break;
        }
    }
    return { periodStartXValue: periodStartXValue, periodEndXValue: periodEndXValue };
};

infChart.highLowRegressionChannelDrawing.prototype.getSettingsPopup = function () {
    var currentConfig = this.getConfig();
    var levels = infChart.util.merge({}, this.levels, currentConfig.levels);
    return infChart.structureManager.drawingTools.getRegressionChannelSettings(levels, currentConfig.borderColor, currentConfig.strokeWidth);
};

infChart.highLowRegressionChannelDrawing.prototype.isAllowDragX = function (drawingUpdateType) {
    return drawingUpdateType.toLowerCase() == "fixed";
};

/**
 * Change the fill and opacity of the annotation from the given params
 * IMPORTANT :: this method is uesd in commands.wrappers to set undo/redo actions
 * @param {object} rgb rgb value of the color
 * @param {string} value hash value of the color
 * @param {float} opacity opacity to be set
 * @param {string} level level that change should be applied
 * @param {boolean|undefined} isPropertyChange property change
 * @param {string} colorPickerRef filter to search for the specific color picker that change occured (used in wrappers)
 */
infChart.highLowRegressionChannelDrawing.prototype.onFillColorChange = function (rgb, value, opacity, level, isPropertyChange, colorPickerRef) {
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
    if (self.settingsPopup) {
        self.settingsPopup.data("infUndoRedo", false);
    }
};

infChart.highLowRegressionChannelDrawing.prototype.setOptions = function (properties, redraw) {
    var self = this,
        ann = self.annotation,
        options = ann.options,
        hasTypeChange,
        hasPeriodChange;

    if (properties.calData) {
        options.data = properties.calData;
    }

    if (properties.drawingUpdateType && properties.drawingUpdateType != options.drawingUpdateType) {
        options.drawingUpdateType = properties.drawingUpdateType;
        hasTypeChange = true;
    }

    if (properties.regPeriod && properties.regPeriod != options.regPeriod) {
        options.regPeriod = properties.regPeriod;
        hasPeriodChange = true;
    }

    if (properties.calData || hasTypeChange) {
        var data = options.data.avg;

        options.allowDragX = this.isAllowDragX(properties.drawingUpdateType);

        switch (options.drawingUpdateType) {
            case "expandWithUpdate":
                options.xValueEnd = data[data.length - 1][0];
                if (hasPeriodChange) {
                    //when period is changed from out side change the start value also
                    options.xValue = (data.length > options.regPeriod && data[data.length - options.regPeriod][0]) || data[0][0];
                }
                break;
            case "moveWithUpdate":
                // always change the end and start values since drawing tool is moving
                options.xValueEnd = data[data.length - 1][0] - (options.timeLag || 0);
                options.xValue = (data.length > options.regPeriod && data[data.length - options.regPeriod][0]) || data[0][0] - (options.timeLag || 0);
                break;
            case 'fixed':
                var endIdx = data.length - 1;
                if (hasPeriodChange) {
                    if (!hasTypeChange) {
                        // When period is changed from the outside(with the same update type), keep end value fixed and change the start value according to the regPeriod.
                        self.calculatePeriodInRange(options.xValue, options.xValueEnd);
                        endIdx = this.periodEndIdx;
                    } else {
                        // When period both period and type are changed, set end value as last value and change the start value according to the regPeriod.
                        options.xValueEnd = data[data.length - 1][0];
                    }

                    options.xValue = (data.length > options.regPeriod && data[endIdx - options.regPeriod][0]) || data[0][0];
                }
                break;
            default:
                break;

        }
    }

    if (hasTypeChange && this.annotation) {
        // When type is changed drag feature also gets changed. So removing all the events which needs to be re-bind.
        ann.removeXEvents();
    }

    if (properties.levels) {
        $.each(properties.levels, function (id, val) {
            self.additionalDrawings.fill[id].attr({
                'fill': val.fillColor,
                'fill-opacity': val.fillOpacity
            });
        });
    }
    if (properties.shape && properties.shape.params) {
        ann.update(properties);
    }

    if (redraw) {
        self.scaleDrawing.call(self);
    }
};

infChart.highLowRegressionChannelDrawing.prototype.scale = function () {
    var self = this,
        ann = this.annotation,
        chart = ann.chart,
        options = ann.options,
        xAxis = chart.xAxis[options.xAxis],
        xVal = options.xValue,
        periodStartXValue = options.xValueEnd > xVal ? xVal : options.xValueEnd,
        periodEndXValue = options.xValueEnd < xVal ? xVal : options.xValueEnd,
        periodRange = self.getPeriodRange(periodStartXValue, periodEndXValue),
        refX = xAxis.toPixels(xVal),
        regressionChannelPoints = self.calculateRegressionChannel(periodRange.periodStartXValue, periodRange.periodEndXValue),
        regPoints = regressionChannelPoints.regPoints,

        periodPoints = regressionChannelPoints.calcData.periodData,
        regLevels = self.levels,
        //regLevels = infChart.drawingUtils.regressionChannel.levels,
        fillDrawings = self.additionalDrawings.fill,
        fill,
        currentLine,
        endRefX,
        levelPoints;

    options.timeDiff = periodRange.periodEndXValue - periodRange.periodStartXValue;

    var line = [],
        order = ["avg", "high", "low"];

    order.forEach(function (level) {
        if (regPoints.hasOwnProperty(level)) {
            levelPoints = regPoints[level];
            endRefX = xAxis.toPixels(periodPoints[level][periodPoints[level].length - 1][0]) - refX;
            line.push("M", 0, levelPoints[0], 'L', endRefX, levelPoints[levelPoints.length - 1])
        }
    });

    if (line.length != 0) {
        ann.update({
            shape: {
                params: {
                    d: line
                }
            }
        });
    }

    $.each(regLevels, (function (index, value, arr) {
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

infChart.highLowRegressionChannelDrawing.prototype.selectAndBindResize = function () {
    var ann = this.annotation,
        options = ann.options,
        width, height, endPoint, pathDefinition, startX, startY;

    ann.events.deselect.call(ann);
    ann.selectionMarker = [];
    pathDefinition = ann.shape.d.split(' ');
    startX = parseFloat(pathDefinition[1]);
    startY = parseFloat(pathDefinition[2]);
    width = parseFloat(pathDefinition[4]);
    height = parseFloat(pathDefinition[5]);
    infChart.drawingUtils.common.addAndBindSelectionMarker.call(this, ann, startX, startY, this.stepFunction, this.stop, true);
    endPoint = infChart.drawingUtils.common.addSelectionMarker.call(this, ann, width, height);
    if (options.drawingUpdateType == "fixed") {
        // other types should not be allowed to drag forward
        this.selectPointEvents(endPoint, this.stepFunction, this.stop, false);
    }
};

infChart.highLowRegressionChannelDrawing.prototype.step = function (e, isStartPoint) {
    var self = this,
        ann = self.annotation,
        options = ann.options,
        chart = ann.chart,
        points = infChart.drawingUtils.common.calculateInitialPoints(e, ann, isStartPoint, 0, 0),
        xAxis = chart.xAxis[options.xAxis],
        xVal = options.xValue,
        refX = xAxis.toPixels(xVal),
        xValueEnd = isStartPoint ? ann.options.xValueEnd : xAxis.toValue(points.x),
        periodStartXValue = xValueEnd > ann.options.xValue ? ann.options.xValue : xValueEnd,
        periodEndXValue = xValueEnd < ann.options.xValue ? ann.options.xValue : xValueEnd;

    if (!isStartPoint) {
        var timeDx = (periodEndXValue - periodStartXValue) - options.timeDiff; //xAxis.toValue(refX + points.dx) - xVal;
        options.timeLag = options.timeLag ? options.timeLag - timeDx : 0;
    }

    var periodCount = self.calculatePeriodInRange(periodStartXValue, periodEndXValue);

    ann.options.regPeriod = periodCount || options.regPeriod;
    infChart.drawingUtils.common.indicatorUtils.updateIndicatorOptions(self, ["regPeriod"]);

    //var periodRange = self.getPeriodRange(periodStartXValue, periodEndXValue),
    var regressionChannelPoints = self.calculateRegressionChannel(periodStartXValue, periodEndXValue),
        regPoints = regressionChannelPoints.regPoints,
        periodPoints = regressionChannelPoints.calcData.periodData,
        regLevels = self.levels,
        fillDrawings = self.additionalDrawings.fill,
        fill,
        levelPoints,
        endRefX;

    var line = [],
        order = ["avg", "high", "low"];


    options.timeDiff = periodEndXValue - periodStartXValue;

    order.forEach(function (level) {
        if (regPoints.hasOwnProperty(level)) {
            levelPoints = regPoints[level];
            endRefX = xAxis.toPixels(periodPoints[level][periodPoints[level].length - 1][0]) - refX;
            line.push("M", 0, levelPoints[0], 'L', endRefX, levelPoints[levelPoints.length - 1])
        }
    });

    ann.shape.attr({
        d: line
    });
    $.each(regLevels, (function (index, value, arr) {
        fill = fillDrawings && fillDrawings[index];

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

infChart.highLowRegressionChannelDrawing.prototype.stop = function (e, isStartPoint) {
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
};

infChart.highLowRegressionChannelDrawing.prototype.translate = function () {
    var self = this,
        ann = this.annotation,
        chart = ann.chart,
        options = ann.options,
        xAxis = chart.xAxis[options.xAxis],
        xVal = options.xValue,
        refX = xAxis.toPixels(xVal),
        periodStartXValue = options.xValueEnd > xVal ? xVal : options.xValueEnd,
        periodEndXValue = options.xValueEnd < xVal ? xVal : options.xValueEnd,
        periodRange = self.getPeriodRange(self, periodStartXValue, periodEndXValue),
        dx = xAxis.toPixels(options.xValueEnd) - xAxis.toPixels(xVal),
        regressionChannelPoints = self.calculateRegressionChannel(periodRange.periodStartXValue, periodRange.periodEndXValue),
        regPoints = regressionChannelPoints.regPoints,
        periodPoints = regressionChannelPoints.calcData.periodData,
        regLevels = this.levels,
        fillDrawings = this.additionalDrawings.fill,
        fill,
        currentLine,
        endRefX,
        levelPoints;

    ann.events.deselect.call(ann);

    var line = [],
        order = ["avg", "high", "low"];

    order.forEach(function (level) {
        if (regPoints.hasOwnProperty(level)) {
            levelPoints = regPoints[level];
            endRefX = xAxis.toPixels(periodPoints[level][periodPoints[level].length - 1][0]) - refX;
            line.push("M", 0, levelPoints[0], 'L', endRefX, levelPoints[levelPoints.length - 1])
        }
    });

    ann.update({
        shape: {
            params: {
                d: line
            }
        }
    });

    $.each(regLevels, (function (index, value, arr) {
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

infChart.highLowRegressionChannelDrawing.prototype.updateSettings = function (properties) {
    infChart.structureManager.drawingTools.updateRegressionChannelSettings(this.settingsPopup, properties.borderColor, properties.strokeWidth, properties.levels);
};
window.infChart = window.infChart || {};
infChart.drawingUtils = infChart.drawingUtils || {};
infChart.drawingUtils.common = infChart.drawingUtils.common || {};

infChart.drawingUtils.common.indicatorUtils = {
    addRegressionChannel: function (chart, settingsContainer, options) {
        infChart.util.console.log("chart.drawingUtils => Regression Channel => ");
        var xAxis = chart.xAxis[0],
            yAxis = chart.yAxis[0],
            rangeOptions = infChart.drawingUtils.common.indicatorUtils.getRange(chart, xAxis.max, options.regPeriod);

        var regDrawing = {
            "name": options.name,
            "shape": "highLowRegressionChannel",
            "xValue": rangeOptions && rangeOptions.startVal,
            "yValue": yAxis.toValue(yAxis.top + yAxis.height),
            xValueEnd: rangeOptions && rangeOptions.endVal,
            yValueEnd: yAxis.toValue(yAxis.top),
            //"width": chart.plotWidth,
            "strokeWidth": 2,
            "dashStyle": "solid",
            "isDisplayOnly": false,
            "isIndicator": true,
            "drawingUpdateType": options.drawingUpdateType,
            "regPeriod": options.regPeriod,
            "indicatorId": options.indicatorId,
            "allowDragX": infChart.highLowRegressionChannelDrawing.prototype.getOptions(options),
            "drawingId": options.drawingId
        };
        return infChart.indicatorMgr.createIndicatorDrawing(chart, settingsContainer, regDrawing);
    },
    addHorizontalLine: function (chart, settingsContainer, options) {
        return infChart.indicatorMgr.createIndicatorDrawing(chart, settingsContainer, {
            "name": options.name,
            "shape": "horizontalRay",
            "xValue": options.xValue,
            "yValue": options.yValue,
            "strokeWidth": 1,
            "dashStyle": options.dashStyle,
            "isDisplayOnly": false,
            "isIndicator": true,
            "drawingUpdateType": options.drawingUpdateType,
            "drawingType": infChart.constants.drawingTypes.indicator,
            "indicatorId": options.indicatorId,
            "drawingId": options.drawingId,
            "subType": "shape",
            allowDragX: false,
            allowDragY: false
        });
    },
    addRectangle: function (chart, settingsContainer, options) {
        return infChart.indicatorMgr.createIndicatorDrawing(chart, settingsContainer, {
            "name": options.name,
            "shape": "rectangle",
            "xValue": options.xValue,
            "yValue": options.yValue,
            "xValueEnd": options.xValueEnd,
            "yValueEnd": options.yValueEnd,
            "strokeWidth": 0,
            // "dashStyle": "solid",
            "isDisplayOnly": true,
            "isIndicator": true,
            "drawingUpdateType": options.drawingUpdateType,
            "drawingType": infChart.constants.drawingTypes.indicator,
            "indicatorId": options.indicatorId,
            "drawingId": options.drawingId,
            "subType": "shape",
            allowDragX: false,
            allowDragY: false,
            fillColor: options.fillColor,
            borderColor: options.borderColor
        });
    },
    /**
     * Add a Harmonic pattern drawing tool for the given configuration
     * @param {infChart.StockChart} chart associated chart
     * @param {Element} settingsContainer settings container element
     * @param {object} options options to draw the tool
     * @returns {infChart.Drawing} new drawing
     */
    addHarmonicPattern: function (chart, settingsContainer, options) {
        infChart.util.console.debug("chart.indicator.drawingUtils => Harmonic Pattern");
        var xAxis = chart.xAxis[0],
            yAxis = chart.yAxis[0],
            data = options.data;
        var intermediatePoints = [];
        intermediatePoints.push({xValue: data.atime, yValue: data.aprice});
        intermediatePoints.push({xValue: data.btime, yValue: data.bprice});
        intermediatePoints.push({xValue: data.ctime, yValue: data.cprice});

        var regDrawing = {
            "name": options.name,
            "shape": "harmonicPattern",
            "xValue": data.xtime,
            "yValue": data.xprice,
            "xValueEnd": data.dtime,
            "yValueEnd": data.dprice,
            //"width": chart.plotWidth,
            "strokeWidth": 2,
            "dashStyle": "solid",
            "isDisplayOnly": false,
            "isIndicator": true,
            "indicatorId": options.indicatorId,
            "allowDragX": false,
            "drawingId": options.drawingId,
            "intermediatePoints": intermediatePoints,
            "borderColor": options.borderColor
        };

        return infChart.indicatorMgr.createIndicatorDrawing(chart, settingsContainer, regDrawing);
    },
    updateIndicatorOptions: function (drawingObject, optionKeys) {
        var ann = drawingObject.annotation,
            annOptions = ann && ann.options,
            ind = annOptions && infChart.indicatorMgr.getIndicatorById(drawingObject.stockChartId, annOptions.indicatorId),
            options = {};

        optionKeys = optionKeys || ["drawingUpdateType", "regPeriod"];

        optionKeys.forEach(function (val) {
            options[val] = annOptions[val];
        });

        ind && ind.updateOptions(options, false);
    },
    getRange: function (chart, endVal, regPeriod) {
        var mainSeries = chart && chart.series[0],
            data = mainSeries && mainSeries.options.data,
            length = data && data.length,
            count = 0,
            periodEndIdx;

        for (var i = length; i >= 0; i--) {
            if (data[i] && data[i][0] <= endVal) {
                periodEndIdx = i;
                break;
            }
        }
        if (periodEndIdx != undefined) {
            return {
                startVal: (data[periodEndIdx - regPeriod] && data[periodEndIdx - regPeriod][0]) || data[0][0],
                endVal: endVal,
                periodEndIdx: periodEndIdx
            }
        }

    }
};
var infChart = window.infChart || {};

infChart.indicatorMgr = (function (infChart, H) {

    var _indicators = {},
        _frameHeights = {},
        _listeners = {},
        _parallelToBaseAxes = {},//axes which are parallel to base axis from indicators
        _indicatorsDissimilerToBaseAxes = {},//axes which are not parallel to base axis;
        _sessionTimeBreakIndicators = {};

    /**
     * Create an indicator for the given params of the given chart
     * @param {string} chartId - chart id which indicator is included
     * @param {string} type - indicator type
     * @param {object} config - indicator options if nedded
     * @param (string} indicatorId - specific id to set if needed
     * @param {number|undefined} index - specific place to position the indicator if needed (used in _indicatorsDissimilerToBaseAxes)
     * @returns {infChart.Indicator} indicator object
     * @private
     */
    var _createIndicator = function (chartId, type, config, indicatorId, index) {
        var id = indicatorId || "IND" + infChart.util.generateUUID(), chart = infChart.manager.getChart(chartId).chart;
        var indicator;

        if (_isSingletonIndicator(type)) {
            indicator = _getSingletonIndicator(chartId, type);
        }

        if (!indicator) {
            switch (type) {
                case 'BB':
                    indicator = new infChart.BolingerBandIndicator(id, chartId, type, chart);
                    break;
                case 'BC':
                    indicator = new infChart.BenchmarkChartIndicator(id, chartId, type, chart);
                    break;
                case 'CCI':
                    indicator = new infChart.CommodityChannelIndexIndicator(id, chartId, type, chart);
                    break;
                case 'MACD':
                    indicator = new infChart.MACDIndicator(id, chartId, type, chart);
                    break;
                case 'ADL':
                    indicator = new infChart.AccumulationDistLineIndicator(id, chartId, type, chart);
                    break;
                case 'MOM':
                    indicator = new infChart.MomentumIndicator(id, chartId, type, chart);
                    break;
                case 'EMA':
                    indicator = new infChart.EMAIndicator(id, chartId, type, chart);
                    break;
                case 'RSI':
                    indicator = new infChart.RSIIndicator(id, chartId, type, chart);
                    break;
                case 'AR':
                    indicator = new infChart.AroonIndicator(id, chartId, type, chart);
                    break;
                case 'ADX':
                    indicator = new infChart.AverageDirectionIndexIndicator(id, chartId, type, chart);
                    break;
                case 'ATR':
                    indicator = new infChart.AverageTrueRangeIndicator(id, chartId, type, chart);
                    break;
                case 'DMS':
                    indicator = new infChart.DirectionalMovementIndicator(id, chartId, type, chart);
                    break;
                case 'DMI':
                    indicator = new infChart.DirectionalMovementIndexIndicator(id, chartId, type, chart);
                    break;
                case 'OBV':
                    indicator = new infChart.OnBalanceVolumeIndicator(id, chartId, type, chart);
                    break;
                case 'ROC':
                    indicator = new infChart.RateOfChangeIndicator(id, chartId, type, chart);
                    break;
                case 'SMA':
                    indicator = new infChart.SimpleMovingAverageIndicator(id, chartId, type, chart);
                    break;
                case 'UO':
                    indicator = new infChart.UltimateOscillatorIndicator(id, chartId, type, chart);
                    break;
                case 'WPR':
                    indicator = new infChart.WilliamsPRIndicator(id, chartId, type, chart);
                    break;
                case 'MFI':
                    indicator = new infChart.MoneyFlowIndexIndicator(id, chartId, type, chart);
                    break;
                case 'CHO':
                    indicator = new infChart.ChaikinOscillatorIndicator(id, chartId, type, chart);
                    break;
                case 'STOF':
                    indicator = new infChart.FastStochasticOscillatorIndicator(id, chartId, type, chart);
                    break;
                case 'STOS':
                    indicator = new infChart.SlowStochasticOscillatorIndicator(id, chartId, type, chart);
                    break;
                case 'ARUD':
                    indicator = new infChart.AROONUpDownIndicator(id, chartId, type, chart);
                    break;
                case 'HV':
                    indicator = new infChart.HistoricalVolatilityIndicator(id, chartId, type, chart);
                    break;
                case 'VOLUME':
                    indicator = new infChart.VolumeIndicator(id, chartId, type, chart);
                    break;
                case 'VOLUME_PNL':
                    indicator = new infChart.VolumeInPanelIndicator(id, chartId, type, chart);
                    break;
                case 'WMA':
                    indicator = new infChart.WeightedMovingAverageIndicator(id, chartId, type, chart);
                    break;
                case 'SAR':
                    indicator = new infChart.SARIndicator(id, chartId, type, chart);
                    break;
                case 'MACDF':
                    indicator = new infChart.MACDFIndicator(id, chartId, type, chart);
                    break;
                case 'StdDev':
                    indicator = new infChart.StandardDeviationIndicator(id, chartId, type, chart);
                    break;
                case 'DMIP':
                    indicator = new infChart.DirectionalMovementPlusIndicator(id, chartId, type, chart);
                    break;
                case 'DMIM':
                    indicator = new infChart.DirectionalMovementMinusIndicator(id, chartId, type, chart);
                    break;
                case 'BBW':
                    indicator = new infChart.BollingerBandWidthIndicator(id, chartId, type, chart);
                    break;
                case 'TrueR':
                    indicator = new infChart.TrueRangeIndicator(id, chartId, type, chart);
                    break;
                case 'HighestH':
                    indicator = new infChart.HighestHighIndicator(id, chartId, type, chart);
                    break;
                case 'LowestL':
                    indicator = new infChart.LowestLowIndicator(id, chartId, type, chart);
                    break;
                case 'VMA':
                    indicator = new infChart.VolumeMovingAverageIndicator(id, chartId, type, chart);
                    break;
                case 'SRSI':
                    indicator = new infChart.SRSIIndicator(id, chartId, type, chart);
                    break;
                case 'ICHI':
                    indicator = new infChart.IchimokuKinkoHyoIndicator(id, chartId, type, chart);
                    break;
                case 'TRIX':
                    indicator = new infChart.TRIXIndicator(id, chartId, type, chart);
                    break;
                case 'MovTrip':
                    indicator = new infChart.MovTripIndicator(id, chartId, type, chart);
                    break;
                case 'MOVR':
                    indicator = new infChart.MOVRIndicator(id, chartId, type, chart);
                    break;
                case 'TRIMA':
                    indicator = new infChart.TRIMAIndicator(id, chartId, type, chart);
                    break;
                case 'FUSTO':
                    indicator = new infChart.FullStochasticOscillatorIndicator(id, chartId, type, chart);
                    break;
                case 'RSIC':
                    indicator = new infChart.RSICIndicator(id, chartId, type, chart);
                    break;
                case 'CMF':
                    indicator = new infChart.ChaikinMoneyFlowIndicator(id, chartId, type, chart);
                    break;
                case 'NVI':
                    indicator = new infChart.NegativeVolumeIndexIndicator(id, chartId, type, chart);
                    break;
                case 'PVI':
                    indicator = new infChart.PositiveVolumeIndexIndicator(id, chartId, type, chart);
                    break;
                case 'VHF':
                    indicator = new infChart.VerticalHorizontalFilterIndicator(id, chartId, type, chart);
                    break;
                case 'ENV':
                    indicator = new infChart.EnvelopesIndicator(id, chartId, type, chart);
                    break;
                case 'SM':
                    indicator = new infChart.StochasticMomentumIndicator(id, chartId, type, chart);
                    break;
                case 'GMMA':
                    indicator = new infChart.GMMAIndicator(id, chartId, type, chart);
                    break;
                case 'GMMAOsci':
                    indicator = new infChart.GMMAOscillatorIndicator(id, chartId, type, chart);
                    break;
                case 'MomMA':
                    indicator = new infChart.MovingAverageMomentumIndicator(id, chartId, type, chart);
                    break;
                case 'AwesomeOsci':
                    indicator = new infChart.AwesomeOscillatorIndicator(id, chartId, type, chart);
                    break;
                case 'CoppockCurve':
                    indicator = new infChart.CoppockCurveIndicator(id, chartId, type, chart);
                    break;
                case 'KST':
                    indicator = new infChart.KnowSureThingIndicator(id, chartId, type, chart);
                    break;
                case 'TSI':
                    indicator = new infChart.TrueStrengthIndexIndicator(id, chartId, type, chart);
                    break;
                case 'VI':
                    indicator = new infChart.VortexIndicator(id, chartId, type, chart);
                    break;
                case 'MED':
                    indicator = new infChart.MedianPriceIndicator(id, chartId, type, chart);
                    break;
                case 'MASS':
                    indicator = new infChart.MassIndexIndicator(id, chartId, type, chart);
                    break;
                case 'CMA':
                    indicator = new infChart.MovingAverageCenteredIndicator(id, chartId, type, chart);
                    break;
                case 'ADOsci':
                    indicator = new infChart.AccelerationDecelerationOscillatorIndicator(id, chartId, type, chart);
                    break;
                case 'EWO':
                    indicator = new infChart.ElliotWaveOscillator(id, chartId, type, chart);
                    break;
                case 'BA':
                    indicator = new infChart.BidAskIndicator(id, chartId, type, chart);
                    break;
                case 'RSL':
                    indicator = new infChart.RelativeStrengthLevy(id, chartId, type, chart);
                    break;
                case 'MACDCrossSignal':
                    indicator = new infChart.MACDCrossSignal(id, chartId, type, chart);
                    break;
                case 'MACDCrossOverZeroSignal':
                    indicator = new infChart.MACDCrossOverZeroSignal(id, chartId, type, chart);
                    break;
                case 'KELT':
                    indicator = new infChart.KeltnerIndicator(id, chartId, type, chart);
                    break;
                case 'BearEng':
                    indicator = new infChart.BearishEngulfingIndicator(id, chartId, type, chart);
                    break;
                case 'BullishEng':
                    indicator = new infChart.BullishEngulfingIndicator(id, chartId, type, chart);
                    break;
                //case 'DarkC' :
                //    indicator = new infChart.DarkCloudIndicator(id, chartId, type, config);
                //    break;
                case 'HLRegChannel':
                    indicator = new infChart.HighLowRegressionChannelIndicator(id, chartId, type, chart);
                    break;
                case 'BAH':
                    indicator = new infChart.BidAskHistoryIndicator(id, chartId, type, chart);
                    break;
                case 'SPREAD':
                    indicator = new infChart.SpreadIndicator(id, chartId, type, chart);
                    break;
                case 'CWI':
                    indicator = new infChart.CustomWeightIndexIndicator(id, chartId, type, chart);
                    break;
                case 'HarmonicPtn':
                    indicator = new infChart.HarmonicPatternIndicator(id, chartId, type, chart);
                    break;
                case 'Mondays':
                    indicator = new infChart.MondaysIndicator(id, chartId, type, chart);
                    break;
                case 'ZigZag':
                    indicator = new infChart.ZigZagIndicator(id, chartId, type, chart);
                    break;
                case 'SessionTimeBreaks':
                    var breakType = config.break || config.series[0].infIndSubType;
                    indicator = new infChart.SessionTimeBreaksIndicator(id, chartId, type, chart, {break: breakType});

                    if (!_sessionTimeBreakIndicators[chartId]) {
                        _sessionTimeBreakIndicators[chartId] = {};
                    }

                    _sessionTimeBreakIndicators[chartId][breakType] = indicator;

                    break;
                case 'BREAKOUT':
                    indicator = new infChart.BreakoutFinder(id, chartId, type, chart);
                    break;
                default:
                    break;

            }

            _indicators[chartId].lastIndex++;
            _indicators[chartId].count++;
            _indicators[chartId].items[id] = indicator;

            if (config) {
                if (config.series) {
                    indicator.series.forEach(function(series){
                        var configSeries = config.series.find(function(s){
                            if(series.options){
                                return series.options.infIndSubType == s.infIndSubType;
                            }
                        })
                        if(configSeries && series.color && !("color" in configSeries)){
                            configSeries.color = series.color;
                        }
                        if(configSeries && series.options.negativeColor && !("negativeColor" in configSeries)){
                            configSeries.negativeColor = series.options.negativeColor;
                        }
                        if(configSeries && series.lineColor && !("lineColor" in configSeries)){
                            configSeries.lineColor = series.lineColor;
                        }
                        if(configSeries && series.fillColor && !("fillColor" in configSeries)){
                            configSeries.fillColor = series.fillColor;
                        }
                    });
                }
                indicator.setProperties(config, false);
            }

            if (indicator._isAxisParallelToBase()) {
                _parallelToBaseAxes[chartId].xPush(indicator.getAxisId());
            } else if (indicator._isAxisDissimilerToBase()) {
                var currentIndicators = _indicatorsDissimilerToBaseAxes[chartId];
                if (index != undefined && currentIndicators.length > index) {
                    _indicatorsDissimilerToBaseAxes[chartId].splice(index, 0, id);
                } else {
                    _indicatorsDissimilerToBaseAxes[chartId].xPush(id);
                }
            }
        }
        return indicator;
    };

    /**
     * @param {string} drawingId
     * @param {object} chartObj
     * @param {string} shapeId
     * @param {object} drawingSettingsContainer - chart container
     * @returns drawing object
     */
    var _createIndicatorDrawing = function (chartObj, drawingSettingsContainer, drawingProperties) {

        var drawing;
        if (drawingProperties) {
            var drawingId = drawingProperties.drawingId;
            var shapeId = drawingProperties.shape;
        }
        if (!drawingId) {
            drawingId = infChart.util.generateUUID();
        }

        switch (shapeId) {
            case 'highLowRegressionChannel':
                drawing = new infChart.highLowRegressionChannelDrawing(drawingId, chartObj, shapeId, drawingSettingsContainer);
                break;
            case 'harmonicPattern':
                drawing = new infChart.harmonicPatternDrawing(drawingId, chartObj, shapeId, drawingSettingsContainer);
                break;
            case 'horizontalRay':
                drawing = new infChart.horizontalRayDrawing(drawingId, chartObj, shapeId, drawingSettingsContainer);
                break;
            case 'rectangle':
                drawing = new infChart.rectangleDrawing(drawingId, chartObj, shapeId, drawingSettingsContainer);
                break;
            case 'upArrowHead':
            case 'downArrowHead':
                drawing = new infChart.arrowHeadDrawing(drawingId, chartObj, shapeId, drawingSettingsContainer);
                break;
        }
        return infChart.drawingsManager.drawDrawingFromProperties(drawing, chartObj, drawingSettingsContainer, drawingProperties, drawing.drawingId);
    };

    var _addEventListeners = function (chartId) {
        _listeners[chartId] = [];

        var chartInstance = infChart.manager.getChart(chartId);

        _listeners[chartId].push({
            method: 'setSymbol',
            id: chartInstance.registerForEvents('setSymbol', function (newSymbol, previousSymbol, config) {
                if (config.setProperties) {
                    _removeAllIndicators(chartId);
                } else {
                    _resetIndicators(chartId);
                }
            })
        });

        _listeners[chartId].push({
            method: 'onReadHistoryDataLoad',
            id: chartInstance.registerForEvents('onReadHistoryDataLoad', function (data) {
                //todo : wtf
            })
        });

        //_listeners[chartId].push({
        //    method: 'destroy',
        //    id: chartInstance.registerForEvents('destroy', function () {
        //        _destroy(chartId);
        //    })
        //});

        _listeners[chartId].push({
            method: 'resize',
            id: chartInstance.registerForEvents('resize', function () {
                var indicatorsDissimilarToBaseAxes = _getIndicatorsDissimilarToBaseAxes(chartId);
                if (indicatorsDissimilarToBaseAxes.length > 0) {
                    _setIndicatorFrames(chartId, chartInstance.chart);
                }
            })
        });

        _listeners[chartId].push({
            method: 'afterXSetExtremes',
            id: chartInstance.registerForEvents('afterXSetExtremes', function (extremes) {
                chartInstance._recalculateDynamicIndicators(false, undefined, ["compare", "base"], extremes);
            })
        });

        _listeners[chartId].push({
            method: 'onBeforePropertyChange',
            id: chartInstance.registerForEvents('onBeforePropertyChange', function (property) {
                switch (property) {
                    case 'period':
                        _resetIndicators(chartId);
                        break;
                    default :
                        break;
                }
            })
        });
    };

    var _removeEventListeners = function (chartId) {
        var chartInstance = infChart.manager.getChart(chartId);

        _listeners[chartId].forEach(function (val) {
            chartInstance.removeRegisteredEvent(val.method, val.id);
        });

        delete _listeners[chartId];
    };

    var _removeIndicator = function (chartId, indicatorId) {
        var indicator = _getIndicatorById(chartId, indicatorId);
        var si = indicator.series.length - 1;
        for (si; si > 0; si--) {//doing this backwards as we splice the series array - https://stackoverflow.com/questions/9882284/looping-through-array-and-removing-items-without-breaking-for-loop
            var s = indicator.series[si];
            if (s && s.options.id !== indicator.id) {
                _removeIndicatorSeries(chartId, s.options.id, false, s);
            }
        }
        if (indicator.series.length > 0) {
            _removeIndicatorSeries(chartId, indicator.id, false, indicator.series[0]);
        }
    };

    /**
     * to removing an idicator series
     * @param {string} chartId chartId
     * @param {string} seriesId seriesId to be removed
     * @param {boolean} isPropertyChange isPropertyChange
     * @param {object} series series
     * @returns {infChart.Indicator} indicator
     * @private
     */
    var _removeIndicatorSeries = function (chartId, seriesId, isPropertyChange, series) {

        var mainIndicatorId = seriesId.split("_")[0],
            ind = _indicators[chartId].items[mainIndicatorId],
            isParallelToBase = ind._isAxisParallelToBase(),
            isDissimilerToBase = ind._isAxisDissimilerToBase();

        if (series && series.options && infChart.util.isLegendAvailable(series.options)) {
           infChart.structureManager.legend.removeLegendItem(chartId, seriesId, 'indicator');
        }

        ind.removeSeries(seriesId, isPropertyChange)

        if (ind.series.length === 0) {

            _indicators[chartId].count--;
            delete _indicators[chartId].items[mainIndicatorId];

            if (isParallelToBase) {

                var pIndex = _parallelToBaseAxes[chartId].indexOf(ind.getAxisId());
                if (pIndex >= 0) {
                    _parallelToBaseAxes[chartId].splice(pIndex, 1);
                }

            } else if (isDissimilerToBase) {

                var index = _indicatorsDissimilerToBaseAxes[chartId].indexOf(mainIndicatorId);
                if (index >= 0) {
                    _indicatorsDissimilerToBaseAxes[chartId].splice(index, 1);
                    //_setIndicatorFrames(chartId, ind.chart);
                }
            }
        }

        return ind;
    };

    var _getIndicatorCount = function (chartId) {
        return _indicators[chartId] ? _indicators[chartId].count : 0;
    };

    /**
     * get not singleton indicator count
     * @param {string} chartId - chart id
     * @returns {number} - not singleton indicator count
     */
    var _getNotSingletonIndicatorCount = function (chartId) {
        var indicatorCount = 0;
        if (_indicators[chartId]) {
            infChart.util.forEach(_indicators[chartId].items, function (i, ind) {
                if (!_isSingletonIndicator(ind.type)) {
                    indicatorCount++;
                }
            });
        }
        return indicatorCount;
    };

    var _getIndicators = function (chartId) {
        var indicators = [];
        if (_indicators[chartId]) {
            infChart.util.forEach(_indicators[chartId].items, function (i, ind) {
                indicators.xPush(ind);
            });
        }
        return indicators;
    };

    var _getIndicatorBySeriesId = function (chartId, seriesId) {
        var indicator;
        if (chartId && seriesId) {
            var mainIndicatorId = seriesId.split("_")[0];
            indicator = _getIndicatorById(chartId, mainIndicatorId);
        }
        return indicator;
    };

    var _isBlockFromMainSeriesUpdateIndicator = function(indicator){
        return indicator && indicator.blockUpdateForMainSymbol;
    };

    var _getIndicatorById = function (chartId, indicatorId) {
        var indicator;
        if (chartId && indicatorId) {
            indicator = _indicators[chartId].items[indicatorId];
        }
        return indicator;
    };

    var _resetIndicators = function (chartId) {
        var hasInd = false;
        if (_indicators[chartId]) {
            infChart.util.forEach(_indicators[chartId].items, function (key, indicator) {
                if (indicator.series.length > 0) {
                    hasInd = true;
                    infChart.util.forEach(indicator.series, function (i, series) {
                        series.setData([], false, false, false);
                    });
                }
            });
        }
        return hasInd;
    };

    var _getSettingsContainer = function (chartId, containerName) {
        return infChart.structureManager.getContainer(infChart.manager.getChart(chartId).getContainer(), containerName ? containerName : "indicator");
    };

    var _destroy = function (chartId) {
        var settingsContainer = $(_getSettingsContainer(chartId));
        settingsContainer.html('');
        _removeAllIndicators(chartId);
        //_removeEventListeners(chartId);
        delete _parallelToBaseAxes[chartId];
        delete _indicatorsDissimilerToBaseAxes[chartId];
        delete _frameHeights[chartId];
        delete _indicators[chartId];
    };

    var _initialize = function (chartId, options) {
        if (!_indicators[chartId]) {
            _indicators[chartId] = {
                'count': 0,
                'lastIndex': 0,
                'items': {},
                'options': options
            };
            _parallelToBaseAxes[chartId] = [];
            _indicatorsDissimilerToBaseAxes[chartId] = [];
            _frameHeights[chartId] = 0;
            //_addEventListeners(chartId);
        } else {
            infChart.util.console.error('indicator manager already initialized for chart => ' + chartId);
        }
    };

    var _isLegendEnabled = function (series) {
        return (series.options.showInLegend == undefined || series.options.showInLegend || !series.options.hideLegend);
    };

    var _getLabel = function (series, isLegend) {
        var subtype = (isLegend && series.options.legendKey) ? series.options.legendKey : series.options.infIndSubType;
        return infChart.manager.getLabel("label.indicatorDesc." + subtype);
    };

    var _getParallelToBaseAxes = function (chartId) {
        return _parallelToBaseAxes[chartId];
    };

    var _isParallelToBaseAxes = function (chartId, indicator) {
        return indicator && _parallelToBaseAxes[chartId].indexOf(indicator.getAxisId()) > -1;
    };

    var _getIndicatorsDissimilarToBaseAxes = function (chartId) {
        return _indicatorsDissimilerToBaseAxes.hasOwnProperty(chartId) ? _indicatorsDissimilerToBaseAxes[chartId] : [];
    };

    var _indicatorLegendClick = function (chartId, seriesId) {
        var indicator = _getIndicatorBySeriesId(chartId, seriesId);
        if (indicator) {
            indicator.loadSettingWindow(false);
        }
    };

    var _isSeriesInBidAskHistory = function (series) {
        return series.options.infType === 'indicator' && series.options.infIndType === 'BAH';
    };

    var _getAllIndicatorProperties = function (chartId) {
        var indicators = [];
        if (_indicators[chartId]) {
            for (var indicatorId in _indicators[chartId].items) {
                if (_indicators[chartId].items.hasOwnProperty(indicatorId)) {
                    var indicator = _indicators[chartId].items[indicatorId];
                    if (!_isSingletonIndicator(indicator.type)) {
                        indicators.push(indicator.getProperties());
                    }
                }
            }
        }
        return indicators;
    };

    var _onNewIndicators = function (chartId, indicatorProperties, isVolume, isBidAsk, isSpread) {
        _removeAllIndicators(chartId);
        if (indicatorProperties && indicatorProperties.length > 0) {
            indicatorProperties.forEach(function (indicator) {
                _createIndicator(chartId, indicator.type, indicator);
            });
        }
        if (isVolume) {
            _createIndicator(chartId, 'VOLUME');
        }
        if (isBidAsk) {
            _createIndicator(chartId, 'BAH');
        }
        if (isSpread) {
            _createIndicator(chartId, 'SPREAD');
        }
    };

    var _removeAllIndicators = function (chartId, ignoreIndicatorTypes) {
        if (_indicators[chartId]) {
            for (var indicatorId in _indicators[chartId].items) {
                if (_indicators[chartId].items.hasOwnProperty(indicatorId) && !_hasIgnoreIndicatorTypes(_indicators[chartId].items[indicatorId].type, ignoreIndicatorTypes)) {
                    _removeIndicator(chartId, indicatorId);
                }
            }
        }
    };

    var _hasIgnoreIndicatorTypes = function (indicatorType, ignoreIndicatorTypes) {
        return ignoreIndicatorTypes && ignoreIndicatorTypes.indexOf(indicatorType) > -1;
    };

    var _getIndicatorTooltipValue = function (chartId, point, grpVolIdx) {
        var tooltipData, indicator = _getIndicatorBySeriesId(chartId, point.series.options.id);
        if (indicator) {
            if (grpVolIdx) {
                tooltipData = indicator.getTooltipValueByBaseRow(point, point.series.options.data[grpVolIdx], grpVolIdx);
            } else {
                tooltipData = indicator.getTooltipValue(point);
            }
        }

        return tooltipData;
    };

    var _updateSeriesTooltip = function (chartId, seriesId, x) {
        _getIndicatorBySeriesId(chartId, seriesId).updateToolTip(seriesId, x);
    };

    var _getLegendTitle = function (chartId, series) {
        var title, indicator = _getIndicatorBySeriesId(chartId, series.options.id);
        if (indicator)
            title = indicator.getTitle(series.options.id, true);
        else {
            title = _getLabel(series, true);
        }
        return title;
    };

    var _dragIndicatorFrameToResize = function (chartId, indicator, event) {
        var xChart = infChart.manager.getChart(chartId);
        //todo : check why this is done
        xChart.crosshairType = (!xChart.resizing) ? xChart.crosshair.enabled : xChart.crosshairType;
        xChart.crosshairType = xChart.crosshair.enabled;
        xChart.crosshair.enabled = false;
        var chart = indicator.chart,
            axis = indicator.getAxisId(),
            yAxis = chart.get(axis),
            resizeHandlerHeight = H.theme.resizeHandler ? H.theme.resizeHandler.height : 4;

        if (event.offsetY > 20) {
            var currentY = yAxis.top - resizeHandlerHeight;
            var targetY = event.offsetY;

            var prevInd = _getPreviousIndicator(chartId, indicator.id), prevIndAxis;
            if (prevInd) {
                prevIndAxis = chart.get(prevInd.getAxisId());
            } else {
                prevIndAxis = chart.get('#0');//todo : need to use chart core method
            }

            if (currentY > targetY) {
                var maxY = prevIndAxis.top + 10;
                if ((maxY) > targetY) {
                    targetY = maxY;
                }
            } else {
                var minY = yAxis.top + yAxis.height - resizeHandlerHeight - 10;
                if (minY < targetY) {
                    targetY = minY
                }
            }

            var newHeight = yAxis.height + resizeHandlerHeight + (currentY - targetY);

            indicator.heightPercent = (newHeight / _frameHeights[chartId].indicatorFrameHeight) * 100;

            var prevIndNewHeight = prevIndAxis.height - (currentY - targetY);
            var newAxisHeight = yAxis.height + (currentY - targetY);

            if (newHeight > 0 && prevIndNewHeight > 0 && newAxisHeight > 0) {

                var yAxisTop = yAxis.top - (currentY - targetY);
                yAxis.update({
                    top: yAxisTop, // 20 - indicator title height, 4- indicator resize handler
                    height: newAxisHeight
                }, false);

                if (prevInd) {
                    prevIndAxis.update({
                        height: prevIndNewHeight
                    }, true);
                    var prevInHeight = prevIndAxis.height + resizeHandlerHeight - (currentY - targetY);
                    prevInd.heightPercent = (prevInHeight / _frameHeights[chartId].indicatorFrameHeight) * 100;
                } else {
                    var parallelToBaseAxes = _getParallelToBaseAxes(chartId);
                    for (var i = 0, iLen = parallelToBaseAxes.length; i < iLen; i++) {
                        var parallelAxis = chart.get(parallelToBaseAxes[i]),
                            parallelAxisHeight = prevIndNewHeight * (parallelAxis.options.infHeightPercent || 0.3),
                            topCorr = 1,
                            parallelAxisTop = (chart.yAxis[0].top || 0) + prevIndNewHeight - parallelAxisHeight - topCorr;
                        //todo :: get yAxis from stockChart
                        chart.get(parallelToBaseAxes[i]).update({
                            top: parallelAxisTop,
                            //bottom: mainHeight,
                            height: parallelAxisHeight
                        }, false);
                    }
                    infChart.manager.resizeMainYAxis(chartId, prevIndNewHeight);
                }

                _updateResizeHandlers(chartId, indicator);
                indicator.setTitle(axis, yAxis.left, yAxisTop, 20, true);
            } else {
                infChart.util.console.log("newHeight:" + newHeight + " prevIndNewHeight:" + prevIndNewHeight + " newAxisHeight:" + newAxisHeight);
            }
        }
    };

    var _dragStopIndicatorFrameOnResize = function (chartId, indicator) {
        var xChart = infChart.manager.getChart(chartId);
        //todo : check why this is done
        xChart.crosshair.enabled = this.crosshairType;
        //todo : check why this is done
        setTimeout(function () {
            var prevInd = _getPreviousIndicator(chartId, indicator.id), i, len;
            //isBaseResized = false;
            if (prevInd) {
                for (i = 0, len = prevInd.series.length; i < len; i++) {
                    prevInd.series[i].update({}, false);
                }
                //} else {
                //    isBaseResized = true;
            }

            for (i = 0, len = indicator.series.length - 1; i < len; i++) {
                indicator.series[i].update({}, false);
            }

            indicator.series[len].update({}, true);

            //if (isBaseResized) {
            //    xChart.onBaseAxisResize();
            //}
        }, 1);
    };

    var _updateResizeHandlers = function (chartId, indicator) {
        var chart = indicator.chart,
            axis = indicator.getAxisId(),
            yAxis = chart.get(axis),
            x = yAxis.left,
            y = yAxis.top;
        var resizeHandlerHeight = H.theme.resizeHandler ? H.theme.resizeHandler.height : 4;

        chart.axisTitles[axis + '_resize'].attr({
            x: x,
            y: y - resizeHandlerHeight,
            width: chart.plotWidth,
            zIndex: 20
        });

        var resizeHandleY = y - resizeHandlerHeight / 2 + 2;

        chart.axisTitles[axis + '_resizeH'].attr({
            x: chart.plotWidth / 2,
            y: (resizeHandleY == y) ? y + 2 : resizeHandleY,
            width: chart.plotWidth,
            zIndex: 21
        });
    };

    var _addResizeHandlers = function (chartId, indicator) {
        var chart = indicator.chart,
            axis = indicator.getAxisId(),
            yAxis = chart.get(axis),
            x = yAxis.left,
            y = yAxis.top;

        var resizeHandlerTheme = H.theme.resizeHandler ? H.theme.resizeHandler : {
            backgroundColor: '#383E4C',
            color: '#9C9C9C',
            height: 4
        };

        if (!chart.axisTitles) {
            chart.axisTitles = {};
        }

        chart.axisTitles[axis + '_resize'] = chart.renderer.rect(x, y - resizeHandlerTheme.height, chart.plotWidth, resizeHandlerTheme.height, 0).attr({
            fill: resizeHandlerTheme.backgroundColor,
            cursor: "row-resize"
        }).add();

        chart.axisTitles[axis + '_resizeH'] = chart.renderer.text('=', chart.plotWidth / 2, y - resizeHandlerTheme.height).attr({
            fill: resizeHandlerTheme.color,
            cursor: "row-resize"
        }).add();

        // bind events for both handler and bar
        infChart.util.bindDragEvents(chart.axisTitles[axis + '_resize'], function (event) {
            _dragIndicatorFrameToResize(chartId, indicator, event);
        }, function () {
            _dragStopIndicatorFrameOnResize(chartId, indicator);
        });

        infChart.util.bindDragEvents(chart.axisTitles[axis + '_resizeH'], function (event) {
            _dragIndicatorFrameToResize(chartId, indicator, event);
        }, function () {
            _dragStopIndicatorFrameOnResize(chartId, indicator);
        });
    };

    var _setIndicatorFrames = function (chartId, chart, currentIndicatorId) {
        var height = chart.plotHeight,
            indicatorHeight,
            mainHeight,
            defaultIndHPercent = 15,
            maxIndicatorPercent = 70,
            resizeHandlerHeight = H.theme && H.theme.resizeHandler.height || 4;

        var indicatorsDissimilarToBaseAxes = _getIndicatorsDissimilarToBaseAxes(chartId),
            indicatorsCount = indicatorsDissimilarToBaseAxes.length, heightPercent = 0;

        if (indicatorsCount > 0) {
            infChart.util.forEach(indicatorsDissimilarToBaseAxes, function (i, indicatorId) {
                var indicator = _getIndicatorById(chartId, indicatorId);
                if (indicator.heightPercent) {
                    heightPercent += (indicator.heightPercent - 100);
                }
            });

            var tempHeightPercent = (heightPercent > defaultIndHPercent / 2) ? defaultIndHPercent / 2 : defaultIndHPercent - indicatorsCount;
            tempHeightPercent = (tempHeightPercent * indicatorsCount > maxIndicatorPercent) ? maxIndicatorPercent / indicatorsCount : tempHeightPercent;

            indicatorHeight = tempHeightPercent * height / 100;

            _frameHeights[chartId] = indicatorHeight;
            mainHeight = height - indicatorHeight * (indicatorsCount - heightPercent / 100);// - (indicatorsCount > 0 ? 20 : 0);
            var heightTotal = 0;

            infChart.util.forEach(indicatorsDissimilarToBaseAxes, function (i, indicatorId) {
                var indicator = _getIndicatorById(chartId, indicatorId), indicatorYAxis = chart.get(indicator.getAxisId());
                var actualIndHeight = (indicator.heightPercent) ? indicatorHeight * indicator.heightPercent / 100 : indicatorHeight;
                if (indicatorYAxis) {
                    indicatorYAxis.update({
                        top: mainHeight + resizeHandlerHeight + heightTotal + chart.margin[0], // 20 - indicator title height, 4- indicator resize handler
                        height: actualIndHeight - resizeHandlerHeight
                    }, false);
                    heightTotal += actualIndHeight;
                }
            });

            var parallelToBaseAxes = _getParallelToBaseAxes(chartId);
            for (var i = 0, iLen = parallelToBaseAxes.length; i < iLen; i++) {
                var parallelAxis = chart.get(parallelToBaseAxes[i]),
                    parallelAxisHeight = mainHeight * (parallelAxis.options.infHeightPercent || 0.3),
                    topCorr = 1,
                    parallelAxisTop = (chart.yAxis[0].top || 0) + mainHeight - parallelAxisHeight - topCorr;
                //todo :: get yAxis from stockChart
                chart.get(parallelToBaseAxes[i]).update({
                    top: parallelAxisTop,
                    //bottom: mainHeight,
                    height: parallelAxisHeight
                }, false);
            }
        } else {
            mainHeight = height;
        }

        infChart.manager.resizeMainYAxis(chartId, mainHeight);

        indicatorsDissimilarToBaseAxes.forEach(function (indicatorId) {
            var indicator = _getIndicatorById(chartId, indicatorId),
                axis = indicator.getAxisId(),
                yAxis = chart.get(axis),
                x = yAxis.left,
                y = yAxis.top;
            if (currentIndicatorId && currentIndicatorId === indicatorId) {
                _addResizeHandlers(chartId, indicator);
                indicator.setTitle(axis, x, y, 20, false);
            } else {
                _updateResizeHandlers(chartId, indicator);
                indicator.setTitle(axis, x, y, 20, true);
            }
        });

    };

    var _getPreviousIndicator = function (chartId, indicatorId) {
        var indicatorsDissimilarToBaseAxes = _getIndicatorsDissimilarToBaseAxes(chartId);
        var idx = indicatorsDissimilarToBaseAxes.indexOf(indicatorId);
        var previousInd;
        if (idx > 0) {
            previousInd = _getIndicatorById(chartId, indicatorsDissimilarToBaseAxes[idx - 1]);
        }
        return previousInd;
    };

    var _isSingletonIndicator = function (type) {
        var singleton = false;
        switch (type) {
            case 'VOLUME':
            case 'VOLUME_PNL':
            case 'BAH':
            case 'SPREAD':
                singleton = true;
                break;
            default:
                break;
        }
        return singleton;
    };

    var _getSingletonIndicator = function (chartId, type) {
        var indicator = undefined;
        if (_indicators[chartId]) {
            for (var indicatorId in _indicators[chartId].items) {
                if (_indicators[chartId].items.hasOwnProperty(indicatorId)) {
                    if (_indicators[chartId].items[indicatorId].type === type) {
                        indicator = _indicators[chartId].items[indicatorId];
                    }
                }
            }
        }
        return indicator;
    };

    var _isBidAskEnabled = function (chartId) {
        return typeof _getSingletonIndicator(chartId, 'BAH') !== 'undefined';
    };

    var _isVolumeEnabled = function (chartId) {
        return typeof _getSingletonIndicator(chartId, 'VOLUME') !== 'undefined';
    };

    var _isSpreadEnabled = function (chartId) {
        return typeof _getSingletonIndicator(chartId, 'SPREAD') !== 'undefined';
    };

    /**
     * check max indicator count reached
     * @param {string} chartId - chart id
     * @param {number} maxCount - max indicator count 
     * @param {string} type - new indicator type
     * @returns {boolean} - is max count reached
     */
    var _hasMaxIndicatorCountReached = function (chartId, maxCount, type) {
        var indicatorCount, maxReached = false;
        if (!_isSingletonIndicator(type)) {
            indicatorCount = _getNotSingletonIndicatorCount(chartId);
            maxReached = indicatorCount >= maxCount;
        }
        return maxReached;
    };

    /**
     * Returns true if close btn is enabled for the indicators in the chart
     * (To be used in mobile chart in dxOne)
     * @param chartId
     * @returns {*|boolean}
     * @private
     */
    var _isCloseBtnEnabled = function (chartId) {
        var indicatorObj = _indicators[chartId];
        return indicatorObj && (!indicatorObj.options || (indicatorObj.options && indicatorObj.options.showCloseBtn != false ));
    };

    /**
     * Returns true if params of the indicator enabled in the legend
     * (To be used in mobile chart in dxOne)
     * @param chartId
     * @returns {*|boolean}
     * @private
     */
    var _isParamsInLegendEnabled = function (chartId) {
        var indicatorObj = _indicators[chartId];
        return indicatorObj && (!indicatorObj.options || (indicatorObj.options && indicatorObj.options.showParamsInLegend != false ));
    };

    /**
     * Returns the calculated gap between two ticks
     * @param {StockChart.id} chartId - stock chart id
     * @param {Highcharts.Axis} axis - the axis seeking for gaps
     * @returns {{avgGaps: number, calculatedGap: number}} details of the gaps
     * @private
     */
    var _getYGap = function (chartId, axis) {
        var yMin = axis.min || axis.dataMin,
            yMax = axis.max || axis.dataMax;

        if (!isNaN(yMin) && !isNaN(yMax) && yMin != null && yMax != null) {
            var plotHeight = axis.height,
                avgGaps = 2,
                calculatedGap = 0,
                maxGap = 80,
                initialAvgGapsCount = 5,
                initialAvgGap = Math.round(plotHeight / initialAvgGapsCount),
                minGap = Math.min(maxGap, Math.max(20, Math.ceil(plotHeight / initialAvgGapsCount))),
                minGapsCount = Math.floor(plotHeight / minGap);

            //calculate avgGaps
            if (yMax > 10000) {
                avgGaps = Math.floor(plotHeight / ((maxGap + minGap) / 2));
            }

            //calculate calculatedGap
            if (avgGaps < 10) {
                if (initialAvgGap > minGap) {
                    calculatedGap = Math.min(maxGap, initialAvgGap);
                    avgGaps = initialAvgGapsCount;
                } else {
                    calculatedGap = minGap;
                    avgGaps = minGapsCount
                }
            } else if (plotHeight >= (avgGaps * maxGap)) {
                calculatedGap = maxGap;
                avgGaps = Math.floor(plotHeight / maxGap);
            } else if (plotHeight >= (avgGaps * minGap)) {
                calculatedGap = Math.floor(plotHeight / avgGaps);
            } else {
                calculatedGap = minGap;
                avgGaps = minGapsCount;
            }

            return {avgGaps: avgGaps, calculatedGap: calculatedGap};
        }
    };

    /**
     * Remove singleton indicators and set buttons
     * @param chartId
     * @param type
     * @param isPropertyChange
     * @param indicatorId
     * @private
     */
    var _removeSingletonIndicator = function (chartId, type, isPropertyChange) {

        var xChart = infChart.manager.getChart(chartId),
            indicator;

        switch (type) {

            case 'VOLUME':
                xChart.setVolume(false, isPropertyChange, true);
                break;
            case 'SPREAD':
                xChart.setSpread(false, isPropertyChange, true);
                break;
            //NOTE :: BAH does not have settings
            //TODO :: do this for other types as well
            default :
                indicator = _getSingletonIndicator(chartId, type);
                xChart.removeIndicator(indicator, isPropertyChange);
                break;
        }
    };

    /**
     * Remove given indicator id from the chart and update necessary flags
     * @param chartId
     * @param indicatorId
     * @private
     */
    var _removeIndicatorFromSettings = function (chartId, indicatorId) {

        var xChart,
            indicator = _getIndicatorById(chartId, indicatorId);

        if (_isSingletonIndicator(indicator.type)) {
            _removeSingletonIndicator(chartId, indicator.type, true);
        } else {
            xChart = infChart.manager.getChart(chartId);
            xChart.removeIndicator(indicator, true);
        }
    };

    /**
     * Returns the order which indicator is placed in _parallelToBaseAxes or _indicatorsDissimilerToBaseAxes
     * @param {StockChart.id} chartId - stock chart id
     * @param {Indicator.id} indicatorId - indicator id
     * @returns {number|undefined} order
     */
    var getIndicatorOrder = function (chartId, indicatorId) {
        var ind = _indicators[chartId].items[indicatorId],
            isParallelToBase = ind._isAxisParallelToBase(),
            isDissimilerToBase = ind._isAxisDissimilerToBase(),
            index;
        if (isParallelToBase) {
            index = _parallelToBaseAxes[chartId].indexOf(ind.getAxisId());
        } else if (isDissimilerToBase) {
            index = _indicatorsDissimilerToBaseAxes[chartId].indexOf(indicatorId);
        }
        if (index >= 0) {
            return index;
        }
    };

    var _openContextMenu = function (id, event, series) {
        let chartId = infChart.manager.getContainerIdFromChart(id);
        let data = series ? series : event.seriesPoint.series;
        if (infChart.contextMenuManager.isContextMenuEnabled(chartId)) {
            infChart.contextMenuManager.openContextMenu(chartId, {
                top: event.clientY,
                left: event.clientX
            }, infChart.constants.contextMenuTypes.indicator, data, event);
        }

        event.stopPropagation();
        event.preventDefault();
    };

    /**
     * get context menu options
     * @param {string} chartId - chart id
     * @param {string} series - selected series
     * @param {object} event - event
     * @returns {object} - context menu options
     * @private
     */
    var _getContextMenuOptions = function (chartId, series, event) {
        let chart = infChart.manager.getChart(chartId);
        let options = chart.settings.contextMenu.indicator.options;
        let containerId = infChart.manager.getContainerIdFromChart(chartId);
        let indicator = _getIndicatorBySeriesId(chartId, series.options.id);
        let indicatorSpecificOptions = indicator && indicator.getContextMenuOptions(chartId, series, options, event);

        if (series.options && series.options.infIndType === "VOLUME") {
            return;
        }

        let indicatorDefaultOptions =  {
            "showIndicatorSettings" : {
                icon : options.settings.icon,
                displayText :options.settings.displayText,
                action : function () {
                    infChart.indicatorMgr.indicatorLegendClick(containerId, series.options.id);
                    if (infChart.toolbar) {
                        infChart.toolbar.setSelectedControls(containerId, "rightPanel", true);
                    }
                }
            },
            "resetX": {
                icon : options.resetX.icon,
                displayText :options.resetX.displayText,
                disabled: infChart.manager.isDefaultXAxisExtremes(chartId),
                action : function () {
                    infChart.manager.resetUserDefinedXAxisExtremes(chartId);
                }
            },
            "resetY": {
                icon : options.resetY.icon,
                displayText :options.resetY.displayText,
                disabled: infChart.manager.isDefaultYAxisExtremes(chartId),
                action : function () {
                    infChart.manager.resetUserDefinedYAxisExtremes(chartId);
                }
            },
            "removeIndicator": {
                icon : options.removeIndicator.icon,
                displayText :options.removeIndicator.displayText,
                action : function () {
                    infChart.manager.removeSeries(series.chart.renderTo.id, series.options.id, series.options.infType);
                }
            }
        };

        H.extend(indicatorDefaultOptions, indicatorSpecificOptions);

        return indicatorDefaultOptions;
    };

    /**
     * whether added indicator available
     * @param {string} chartId - chart id
     * @param {[]} ignoreTypes - ignore indicator types
     * @retruns {boolean} whether added indicators available
     * @private
     */
    var _isAddedIndicatorsAvailable = function (chartId, ignoreTypes) {
        let indicators = _indicators[chartId];

        for (let indicatorId in indicators.items) {
            if (indicators.items.hasOwnProperty(indicatorId)) {
                if (ignoreTypes.indexOf(indicators.items[indicatorId].type) === -1) {
                    return true;
                }
            }
        }

        return false;
    };

    var _resetIndicatorsColors = function (indicators, defaultIndicatorOptions) {
        indicators.forEach(function (indicator) {
            var series = indicator.series;

            series.forEach(function (indicatorSeries) {
                if (indicatorSeries.color) {
                    delete indicatorSeries.color;
                }
                if (indicatorSeries.negativeColor) {
                    delete indicatorSeries.negativeColor;
                }
                if (indicatorSeries.fillColor) {
                    delete indicatorSeries.fillColor;
                }
                if (indicatorSeries.lineColor) {
                    delete indicatorSeries.lineColor;
                }
            })
        });
    };

    /**
     * show hide indicator
     * @param {string} chartId - chart id
     * @param {string} seriesId - series id
     * @param {string} isShow - whether to show indicator
     * @private
     */
    var _showHideIndicator = function (chartId, seriesId, isShow, isHideAll) {
        let mainIndicatorId = seriesId.split("_")[0];
        let indicator = _indicators[chartId].items[mainIndicatorId];

        if (isShow) {
            indicator.showIndicator(seriesId, isHideAll);
        } else {
            indicator.hideIndicator(seriesId, isHideAll);
        }
    };

    var _filterIndicatorData = function(data, chartId){
        var iChart = infChart.manager.getChart(chartId);
        var chart = iChart.chart;
        var xData = chart.series[0].xData;
        var newData = {};
        var newDataArray = [];
        var newDataMap = {};
        var mainSeriesDataMap = {};
        var indicatorSymbolData = data;

        xData.forEach(function (val) {
            mainSeriesDataMap[val] = val;
        });

        indicatorSymbolData.forEach(function (dataValue) {
            if (mainSeriesDataMap[dataValue[0]]) {
                newDataArray.push(dataValue);
            }
        });

        return newDataArray;
    };

    var _createSessionTimeBreakIndicator = function (selectedType, chartId) {
        let containerId = infChart.manager.getContainerIdFromChart(chartId);
        let chart = infChart.manager.getChart(containerId);

        _removeSessionTimeBreakIndicator(chartId);

        chart.sessionTimeBreakSettings[selectedType].show = true;
        chart.addIndicator("SessionTimeBreaks", {break: selectedType}, true, true);
    };

    var _removeSessionTimeBreakIndicator = function (chartId) {
        let containerId = infChart.manager.getContainerIdFromChart(chartId);
        let chart = infChart.manager.getChart(containerId);
        let breakIndicators = _sessionTimeBreakIndicators[containerId];

        for (var type in breakIndicators) {
            if (Object.prototype.hasOwnProperty.call(breakIndicators, type)) {
                let indicator = breakIndicators[type];

                if (indicator && indicator.series[0]) {
                    let seriesId = indicator.series[0].userOptions.id

                    indicator.removePlotLines();
                    _removeIndicatorSeries(containerId, seriesId, undefined, indicator.series[0]);
                    delete breakIndicators[type];
                }

                chart.sessionTimeBreakSettings[type].show = false;
            }
        }

        infChart.manager.getChart(containerId)._onPropertyChange();
    };

    var _updateSessionTimeBreakIndicator = function (type, styleType, value, chartId) {
        let indicator = _sessionTimeBreakIndicators[chartId] ? _sessionTimeBreakIndicators[chartId][type] : undefined;

        if (indicator) {
            if (styleType === "color") {
                indicator.updateColor(value);
            } else if (styleType === "lineType") {
                indicator.updateLineType(value);
            }
        }

        infChart.manager.getChart(chartId)._onPropertyChange();
    };

    return {
        createIndicator: _createIndicator,
        removeIndicator: _removeIndicator,
        removeIndicatorSeries: _removeIndicatorSeries,
        getIndicatorCount: _getIndicatorCount,
        getNotSingletonIndicatorCount: _getNotSingletonIndicatorCount,
        getIndicators: _getIndicators,
        getIndicatorBySeriesId: _getIndicatorBySeriesId,
        getIndicatorById: _getIndicatorById,
        resetIndicators: _resetIndicators,
        getParallelToBaseAxes: _getParallelToBaseAxes,
        getIndicatorsDissimilarToBaseAxes: _getIndicatorsDissimilarToBaseAxes,
        isParallelToBaseAxes: _isParallelToBaseAxes,
        getSettingsContainer: _getSettingsContainer,
        initialize: _initialize,
        destroy: _destroy,
        getLabel: _getLabel,
        indicatorLegendClick: _indicatorLegendClick,
        getAllIndicatorProperties: _getAllIndicatorProperties,
        getIndicatorTooltipValue: _getIndicatorTooltipValue,
        updateSeriesTooltip: _updateSeriesTooltip,
        getLegendTitle: _getLegendTitle,
        isSeriesInBidAskHistory: _isSeriesInBidAskHistory,
        removeAllIndicators: _removeAllIndicators,
        applyNewIndicators: _onNewIndicators,
        isSingletonIndicator: _isSingletonIndicator,
        getSingletonIndicator: _getSingletonIndicator,
        isBidAskEnabled: _isBidAskEnabled,
        isVolumeEnabled: _isVolumeEnabled,
        isSpreadEnabled: _isSpreadEnabled,
        hasMaxIndicatorCountReached: _hasMaxIndicatorCountReached,
        isCloseBtnEnabled: _isCloseBtnEnabled,
        isParamsInLegendEnabled: _isParamsInLegendEnabled,
        getYGap: _getYGap,
        removeSingletonIndicator: _removeSingletonIndicator,
        removeIndicatorFromSettings: _removeIndicatorFromSettings,
        getIndicatorOrder: getIndicatorOrder,
        createIndicatorDrawing: _createIndicatorDrawing,
        openContextMenu: _openContextMenu,
        getContextMenuOptions: _getContextMenuOptions,
        isAddedIndicatorsAvailable: _isAddedIndicatorsAvailable,
        resetIndicatorsColors: _resetIndicatorsColors,
        showHideIndicator: _showHideIndicator,
        filterIndicatorData: _filterIndicatorData,
        isBlockFromMainSeriesUpdateIndicator: _isBlockFromMainSeriesUpdateIndicator,
        createSessionTimeBreakIndicator: _createSessionTimeBreakIndicator,
        removeSessionTimeBreakIndicator: _removeSessionTimeBreakIndicator,
        updateSessionTimeBreakIndicator: _updateSessionTimeBreakIndicator
    }

})(infChart, Highcharts);
infChart.structureManager.indicator = (function ($, infChart) {

    var _getInputParameterRowItem = function (key, value, label, inputType, min, max) {
        return infChart.structureManager.settings.getRowItem('<input type="' + _getInputType(inputType) + '" class="form-control" inf-ind-param="' + key + '" value="' + value + '"'+ _getRange(inputType, min, max) + '>', label, false);
    };

    var _getRange = function(inputType, min, max) {
        return inputType === 'number'? 'min=' + min + ' max=' + max: '';
    }

    var _getInputType = function(type) {
        return type && type != null? type: 'text';
    };

    // var _getTextAreaInputParameterRowItem = function (key, value, label) {
    //     var textArea = '<textarea type="text" cols=25 rows=10 class="form-control" inf-ind-param="' + key + '" >' + value + '</textarea>';
    //     return infChart.structureManager.settings.getRowItem(textArea, label, false);
    // };

    var _getSelectionParameterRowItem = function (key, value, options) {
        var html = '<div class="selection-btn">';
        infChart.util.forEach(options, function (i, option) {
            var checked = value == option.value ? 'checked="checked"' : '';
            html +=
                '<div class="radio-button-wrapper">' +


                '<div class="radio-button-holder">' +
                '<input inf-ind-sel="' + key + '" type="radio" name="' + key + '" value="' + option.value + '" ' + checked + '" >' +
                '<div class="radio-custom-holder">' +
                '<div><i class="fa fa-dot-circle-o" aria-hidden="true"></i></div>' +
                '<div class="radio-label">' + option.label + '</div>' +
                '</div>' +
                '</div>' +


                '</div>';
        });
        html += '</div>';
        return infChart.structureManager.settings.getRowItem(html);
    };

    var _getBaseParameterRowItem = function (key, value, options, label) {
        var optionHtml = '<ul class="selection-types base-types">';
        infChart.util.forEach(options, function (i, option) {
            optionHtml += '<li' + (value === option.key ? ' class="active"' : '') + ' inf-type-base="' + option.key + '"><a>' + option.label + '</a></li>';
        });
        optionHtml += '</ul>';
        return infChart.structureManager.settings.getRowItem(optionHtml, label, false);
    };

    var _getOnOffParameterRowItem = function (key, value, label) {
        return infChart.structureManager.settings.getRowItem('<div class="toggle-on-off ' + (value ? 'on' : 'off') + '" inf-ind-series="' + key + '"><div class="on-off-slider"></div><p>ON</p><p>OFF</p></div>', label, false);
    };

    var _setIndicatorLegendColor = function (chart, series){
        var chartId = infChart.manager.getContainerIdFromChart(chart.renderTo.id);
        $("#" + chartId).find("[inf-legend]").find("[inf-series=" + series.userOptions.id + "]").find("div[class='item-color']").css("background-color", + series.options.lineColor ? series.options.lineColor : series.color);
    };

    //todo : generify this
    var _getDropDownRowItem = function (dataArray, type, label) {
        var optionsHtml = '';
        infChart.util.forEach(dataArray, function (i, dataItem) {
            optionsHtml += '<li rel="' + (dataItem.rel || 'seriesItem') + '">' +
                           '<a ' + (dataItem.idAttr || 'inf-series') + '="' + dataItem.id + '" ' + (dataItem.nameAttr || 'inf-series-name') + '="' + dataItem.name + '">' + dataItem.name + '</a>' +
                '</li>';
        });

        var html = '<div class="selection-dropdown">' +
                   '<div class="dropdown" inf-type="' + (type || 'series-style-sel') + '">' +
            '<button class="btn btn-default dropdown-toggle" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">' +
                   '<span rel="selectItem"></span> <span' +
                   ' class="caret"></span> ' +
            '</button>' +
            '<ul class="dropdown-menu">' + optionsHtml + '</ul>' +
            '</div>' +
            '</div>';

        return infChart.structureManager.settings.getRowItem(html, label);
    };

    var _getCheckBoxRowItems = function (key, label, value) {
        var checkBoxItemHtml = '<div>' + 
            '<label class="item-label" data-localize="' + key + '">'+ 
            '<input inf-ind-checkbox=' + key + ' type="checkbox" ' + (value ? 'checked' : '') + '>' + label +'</label>' + '</div>';
        return infChart.structureManager.settings.getRowItem(checkBoxItemHtml);
    };

    var _getSeriesStyleSection = function (seriesArray) {
        var rowItems = [];
        infChart.util.forEach(seriesArray, function (i, series) {
            rowItems.xPush(infChart.structureManager.settings.getSeriesContentRowItem(series.id, series.chartTypes));
        });
        return infChart.structureManager.settings.getSection([
            infChart.structureManager.settings.getSectionRow([_getDropDownRowItem(seriesArray)]),
            infChart.structureManager.settings.getSectionRow(rowItems)
        ], 'label.style');
    };

    var _getSeriesParameterSection = function (baseParameter, selectionParameters, inputParameters, onOffParameters, dropDownParameters, checkBoxParameters) {
        var rowItems = [], sectionRows = [];
        infChart.util.forEach(inputParameters, function (i, inputParameter) {
            // if(inputParameter.type == "textArea") {
            //     rowItems.xPush(_getTextAreaInputParameterRowItem(inputParameter.key, inputParameter.value, inputParameter.label));
            // } else if(inputParameter.type == "text") {
            //     sectionRows.xPush(infChart.structureManager.settings.getSectionRow([_getInputParameterRowItem(inputParameter.key, inputParameter.value, inputParameter.label)]));
            // } else if(inputParameter.type == "table") {
            //     sectionRows.xPush(infChart.structureManager.settings.getSectionRow([_getTableRowItem(inputParameter.key, inputParameter.columns, inputParameter.label)]));
            // } else if(inputParameter.type == "symbolSearch") {
            //     sectionRows.xPush(infChart.structureManager.settings.getSectionRow([_getSymbolSearchAddRowItem(inputParameter.key, inputParameter.columns, inputParameter.label)]));
            // } else {
            rowItems.xPush(_getInputParameterRowItem(inputParameter.key, inputParameter.value, inputParameter.label, inputParameter.type, inputParameter.min, inputParameter.max));
            // }
        });
        if (onOffParameters && onOffParameters.length) {
            infChart.util.forEach(onOffParameters, function (i, onOffParameter) {
                rowItems.xPush(_getOnOffParameterRowItem(onOffParameter.key, onOffParameter.value, onOffParameter.label));
            });
        }
        sectionRows.xPush(infChart.structureManager.settings.getSectionRow(rowItems, rowItems.length > 6 ? 'three-col-row' : 'two-col-row'));

        infChart.util.forEach(selectionParameters, function (i, selectionParameter) {
            sectionRows.xPush(infChart.structureManager.settings.getSectionRow([_getSelectionParameterRowItem(selectionParameter.key, selectionParameter.value, selectionParameter.options)]));
        });
        if (baseParameter.key) {
            sectionRows.xPush(infChart.structureManager.settings.getSectionRow([_getBaseParameterRowItem(baseParameter.key, baseParameter.value, baseParameter.options, baseParameter.label)]));
        }

        if (dropDownParameters && dropDownParameters.length) {
            var rowItems = [];
            infChart.util.forEach(dropDownParameters, function (i, ddItem) {
                rowItems.xPush(_getDropDownRowItem(ddItem.options, ddItem.type, ddItem.label));
            });
            sectionRows.xPush(infChart.structureManager.settings.getSectionRow(rowItems));
        }

        if (checkBoxParameters && checkBoxParameters.length > 0) {
            var checkboxItems = [];
            infChart.util.forEach(checkBoxParameters, function (i, cbItem) {
                checkboxItems.xPush(_getCheckBoxRowItems(cbItem.key, cbItem.label, cbItem.value));
            });
            sectionRows.xPush(infChart.structureManager.settings.getSectionRow(checkboxItems));
        }

        return infChart.structureManager.settings.getSection(sectionRows, 'label.parameters');
    };

    var _getDrawingToolsSection = function (tools) {
        var rowItems = [];
        infChart.util.forEach(tools, function (i, tool) {
            rowItems.xPush(infChart.structureManager.settings.getRowItem(tool.content, undefined, undefined, tool.id));
        });
        return infChart.structureManager.settings.getSection([
            infChart.structureManager.settings.getSectionRow([_getDropDownRowItem(tools)]),
            infChart.structureManager.settings.getSectionRow(rowItems)
        ], 'label.tools');
    };

    var _bindParameterElements = function ($container, onBaseChange, onSelectionChange, onInputChange, onOnOffChange, onCheckItemChange) {

        $container.find('[inf-ind-param]').keyup(function (e) {
            if (e.keyCode == 13) {
                var param = $(this).attr('inf-ind-param'), value = $(this).val();
                onInputChange(param, value);
            }
        });

        $container.find('[inf-ind-param]').focusout(function () {
            var param = $(this).attr('inf-ind-param'), value = $(this).val();
            onInputChange(param, value);
        });

        $container.find('input[inf-ind-sel]').on('click', function (e) {
            var param = $(this).attr('inf-ind-sel'), value = $(this).val();
            onSelectionChange(param, value);
            e.stopPropagation();
        });

        $container.find('li[inf-type-base]').on('click', function (e) {
            var base = $(this).attr('inf-type-base');
            onBaseChange(base);
            $container.find('li[inf-type-base]').removeClass('active');
            $(this).addClass('active');
            e.stopPropagation();
        });

        $container.find('div[inf-ind-series]').on('click', function (e) {
            var param = $(this).attr('inf-ind-series'), isOn = $(this).hasClass('on');
            var newValue = onOnOffChange(param, isOn);
            if (newValue) {
                $(this).removeClass('off').addClass('on');
            } else {
                $(this).removeClass('on').addClass('off');
            }
            e.stopPropagation();
        });

        $container.find('[inf-ind-checkbox]').on('click', function (e) {
            var param = $(this).attr('inf-ind-checkbox'); value = $(this).prop('checked');
            onCheckItemChange(param, value);
            e.stopPropagation();
        })
    };

    var _bindStyleElements = function ($container, seriesArray, onSeriesChartTypeChange, onColorPickerChange, onLineWidthChange) {
        infChart.util.forEach(seriesArray, function (i, seriesObj) {
            infChart.structureManager.settings.bindStyleElements($container, seriesObj.id, seriesObj.color, onSeriesChartTypeChange, onColorPickerChange, onLineWidthChange);
        });

        $container.find('li[rel=seriesItem] a').on('click', function (e) {
            var el = $(this).parents("div[inf-type='series-style-sel']").find("span[rel=selectItem]")[0];
            el && el.xHtml($(this).attr("inf-series-name"));

            var contentEl = $container.find('div[inf-row-item-rel="' + $(this).attr("inf-series") + '"]');
            contentEl.show();
            contentEl.siblings().hide();
            e.stopPropagation();
        });
    };

    var _updateParameterElements = function ($container, param, value, paramType) {
        switch (paramType) {
            case 'base':
                $container.find('li[inf-type-base]').removeClass('active');
                $container.find('li[inf-type-base=' + value + "]").addClass('active');
                break;
            case 'selection':
                $container.find('[inf-ind-sel="' + param + '"]').val(value);
                break;
            case 'onOff':
                break;
            default:
                $container.find('[inf-ind-param="' + param + '"]').val(value);
                break;
        }
    };

    var _initializeStylePanel = function ($container, seriesArray) {
        //todo : check a better way
        $.each($container.find("div[inf-type='series-style-sel']"), function (i, dropDown) {//this is a hack - see high/low regression channel indicator
            $(dropDown).find('li:first a').trigger('click');
        });

        infChart.util.forEach(seriesArray, function (i, series) {
            infChart.structureManager.settings.initializeStylePanel($container, series.id, series.type, series.lineWidth);
        });
    };

    var _triggerStylePanel = function ($container, seriesId) {
        $container.find("div[inf-type='series-style-sel'] li a[inf-series=" + seriesId + "]").tab('show');
    };

    var _getIndicatorSearchPanelHTML = function (parentPanelId, panelId, content) {
        return '<div inf-container="indicator_panel" class="panel-group">' +
            infChart.settings.getPanelHTML(parentPanelId, panelId, 'Add Indicators', content) +
            '<div class="panel panel-default">' +
            '<div class="panel-heading panel-main-heading">' +
            '<h4 class="panel-title">Added Indicators</h4>' +
            '</div>' +
            '</div>' +
            '</div>';
    };

    var _bindIndicatorSearchPanel = function ($container, panelId) {
        $container.find('div.panel-heading a').attr('data-parent', 'div[rel=' + panelId + ']');
        $container.find('div.panel-heading a').attr('data-target', 'div[rel=' + panelId + '-search]');
        $container.find('div.panel-collapse').attr('rel', panelId + '-search');
        infChart.structureManager.settings.bindPanel($container);
    };

    /**
     * set max-height to indicator list to fix search input.
     * use this because [position: sticky] and [position: -webkit-sticky] not working on safari.
     * @param {Element} topTbElement - top bar element
     * @param {number} wrapperHeight - height of the dropdown
     */
    var _rearrangeIndicatorDropDownStructure = function (topTbElement, wrapperHeight) {
        var indItem = topTbElement.querySelector('[inf-ctrl="indicator"]');
        if(indItem) {
            var indDropDown = indItem.querySelector('[inf-ctrl="dropdownMenu"]');
            var indSearchInputHeight = $(indDropDown.querySelector('[inf-ctrl-ind="search"]')).outerHeight(true);
            $(indDropDown.querySelector('[inf-ctrl="indicatorList"]')).css({"max-height": wrapperHeight - indSearchInputHeight});
        }
    };

    return {
        getSeriesParameterSection: _getSeriesParameterSection,
        getSeriesStyleSection: _getSeriesStyleSection,
        getDrawingToolsSection: _getDrawingToolsSection,
        bindParameterElements: _bindParameterElements,
        bindStyleElements: _bindStyleElements,
        updateParameterElements: _updateParameterElements,
        getIndicatorSearchPanelHTML: _getIndicatorSearchPanelHTML,
        bindIndicatorSearchPanel: _bindIndicatorSearchPanel,
        initializeStylePanel: _initializeStylePanel,
        triggerStylePanel: _triggerStylePanel,
        rearrangeIndicatorDropDownStructure: _rearrangeIndicatorDropDownStructure,
        setIndicatorLegendColor: _setIndicatorLegendColor
    };
})(jQuery, infChart);