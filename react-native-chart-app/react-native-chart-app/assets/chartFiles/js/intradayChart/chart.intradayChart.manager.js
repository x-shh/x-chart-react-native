var infChart = window.infChart || {};

infChart.intradayChartManager = (function ($, infChart) {
    let _intradayChartInstances = {};
    let _intradayChartListeners = {};

    let _activateIntradayChart = function (chartId) {
        let chart = infChart.manager.getChart(chartId);
        if (Object.prototype.hasOwnProperty.call(_intradayChartInstances, chartId)) {
            _intradayChartInstances[chartId].isEnable = true;
            chart._onPropertyChange("candleInfo", { isEnable : true });
        }
    };

    let _bindDropdownSettings = function (chartId, container, settings) {
        let toolBarItems = settings.toolbar.items;
        toolBarItems.forEach(function (item) {
            switch (item) {
                case "intradayChartType":
                    $(container).find('li[inf-ctrl-item="' + item + '"]').on('click', function (event) {
                        let newType = $(this).attr('inf-ctrl-value');
                        _setChartType(chartId, newType);
                        _updateSettingOption(item, container, newType, this);
                    });
                    break;
                case "intradayInterval":
                    $(container).find('li[inf-ctrl-item="' + item + '"]').on('click', function (event) {
                        let newInterval = $(this).attr('inf-ctrl-value');
                        _setInterval(chartId, newInterval);
                        _updateSettingOption(item, container, newInterval, this);
                    });
                    break;
                default:
                    break;
            }
        });
    };

    let _bindSettings = function (chartId, container, settings) {
        let chart = infChart.manager.getChart(chartId);
        let containment = $($(chart.container)).find('div[inf-container=chart]');
        let intradayChartContainer = _getIntradayMainContainer(container);
        let left = ($(containment).outerWidth(true) - $(intradayChartContainer).outerWidth(true)) / 2;

        $(intradayChartContainer).find('i[inf-ctrl="close-intraday-chart"]').on('click', function (event) {
            _destroyIntradayChart(chartId);
        });

        _bindDropdownSettings(chartId, container, settings);

        function startFix(event, ui) {
            ui.position.left = left;
            ui.position.top = 0;
        }

        function dragFix(event, ui) {
            infChart.util.dragFix(chart, event, ui)
        }

        intradayChartContainer.draggable({
            handle: "div[inf-pnl=intradayChart-drag-handle]",
            containment: containment,
            drag: dragFix,
            start: startFix
        });
    };

    let _deactivateIntradayChart = function (chartId) {
        let chart = infChart.manager.getChart(chartId);
        if (Object.prototype.hasOwnProperty.call(_intradayChartInstances, chartId)) {
            _intradayChartInstances[chartId].isEnable = false;
            chart._onPropertyChange("candleInfo", { isEnable : false });
        }
    };

    let _destroyIntradayChart = function (chartId) {
        let intradayChartInstance = _intradayChartInstances[chartId];
        if (intradayChartInstance && intradayChartInstance.chart) {
            let intradayChart = intradayChartInstance.chart;
            let container = intradayChartInstance.container;
            intradayChart.destroyIntradayChart();
            _intradayChartInstances[chartId].chart = undefined;
            $(container).hide();
            $(container).html("");
        }
    };

    let _eligibleForIntradayChart = function (chartId) {
        let stockChart = infChart.manager.getChart(chartId);
        return stockChart.interval !== 'I_1';
    };

    let _generateContainers = function (chartId, uniqueId, container, point, settings) {
        $(container).html(_getChartContainerHtml(chartId, settings));
        $(container).show();
        _setContainerHeightWidth(chartId, container);
        _bindSettings(chartId, container, settings);
        _getContainerPosition(container, point);
    };

    let _getChartContainer = function (container) {
        return $(container).find('div[inf-container="intradayChart"]');
    };

    let _getChartContainerHtml = function (chartId, settings) {
        let html = '<div inf-container="intradayChart-popup" class="int-chart">' +
            '<div inf-pnl="intradayChart-header" class="int-chart__header">' +
            '<div inf-pnl="intradayChart-drag-handle" class="int-chart__title w--100"> ' +
            '<div class="int-chart__drag" x-tt-class="adv-chart-tooltip right" adv-chart-tooltip="Drag Intraday Chart"> <i class="icon ico-braille"></i></div>' +
            ' Candle Info </div>' +
            '<div class="int-chart__operators">' +
            _getSettingsHtml(chartId, settings) +
            '<i inf-ctrl="close-intraday-chart" class="int-chart__operators-close icon ico-close"></i>' +
            '</div></div>' +
            '<div inf-pnl="intradayChart-body" class="int-chart__body">' +
            '<div inf-container="intradayChart" id="' + chartId + '"></div>' +
            '</div>' +
            '</div>'
        return html;
    };

    let _getChartIntervalSettingHTML = function (ctrlType, mainChartInterval, config) {
        let chartIntervalHTML = '';
        let intervals = config.enableIntervals[mainChartInterval];
        if (intervals && intervals.length > 0) {
            chartIntervalHTML += '<div class="int-chart__operators-interval dropdown">';
            chartIntervalHTML += '<button inf-ctrl="' + ctrlType + '" class="btn btn-default dropdown-toggle" type="button" data-toggle="dropdown">';
            chartIntervalHTML += '<span ctrl-role="text">' + config.options[intervals[0]].shortDesc + '</span>';
            chartIntervalHTML += '<span class="caret"></span>';
            chartIntervalHTML += '</button><ul class="dropdown-menu dropdown-menu-right w--100">';
            intervals.forEach(function (interval) {
                let item = config.options[interval];
                let isActive = item.key  === config.options[intervals[0]].key;
                chartIntervalHTML += '<li ' + (isActive ? 'class="active"' : '') + ' inf-ctrl-item="' + ctrlType + '" inf-ctrl-value="' + item.key + '">'
                chartIntervalHTML += '<a><span ctrl-role="text">' + item.shortDesc + '</span></a></li>';
            });
            chartIntervalHTML += '</ul></div>';
        }
        return chartIntervalHTML;
    };

    let _getChartTypeSettingHTML = function (ctrlType, currentChartType, config) {
        let chartTypeHtml = '';
        if (config && config.length > 0) {
            chartTypeHtml += '<div class="int-chart__operators-type dropdown">';
            chartTypeHtml += '<button inf-ctrl="' + ctrlType + '" class="btn btn-default dropdown-toggle" type="button" data-toggle="dropdown">';
            chartTypeHtml += '<i rel="icon" class="icon ico-chart-' + currentChartType + '"></i>';
            chartTypeHtml += '<span class="caret"></span>';
            chartTypeHtml += '</button><ul class="dropdown-menu dropdown-menu-right w--100">';
            config.forEach(function (item) {
                let isActive = item.key  === currentChartType;
                chartTypeHtml += '<li ' + (isActive ? 'class="active"' : '') + ' inf-ctrl-item="' + ctrlType + '" inf-ctrl-value="' + item.key + '">'
                chartTypeHtml += '<a><i rel="icon" inf-ico="' + item.ico + '" class="' + item.ico + '"></i>' + infChart.manager.getLabel(item.label) + '</a></li>';
            });
            chartTypeHtml += '</ul></div>';
        }
        return chartTypeHtml;
    };

    let _getContainerPosition = function (settings) {

    };

    let _getCurrentChartType = function (chartId) {
        let config = _intradayChartInstances[chartId].config;
        return config.config.chart.type;
    };

    let _getIntradayChartContainer = function (container) {
        return infChart.structureManager.getContainer(container[0], "intradayChartPanel");
    };

    let _getIntradayMainContainer = function (container) {
        return $(container).find('div[inf-container="intradayChart-popup"]');
    };

    let _getIntradayChartPanel = function (container) {
        return $(container).find('div[inf-pnl="intradayChart-body"]');
    };

    let _getIntradayChartHeaderPanel = function (container) {
        return $(container).find('div[inf-pnl="intradayChart-header"]');
    };

    let _getIsActiveIntradayChart = function (chartId) {
        return _intradayChartInstances[chartId].isEnable;
    };

    let _getSettingsHtml = function (chartId, settings) {
        let stockChart = infChart.manager.getChart(chartId);
        let stockChartInterval = stockChart.interval;
        let toolBarItems = settings.toolbar.items;
        let toolBarConfig = settings.toolbar.config;
        let currentChartType = _getCurrentChartType(chartId);
        let settingsHtml = '';
        toolBarItems.forEach(function (item) {
            switch (item) {
                case "intradayChartType":
                    settingsHtml += _getChartTypeSettingHTML(item, currentChartType, toolBarConfig[item].options);
                    break;
                case "intradayInterval":
                    settingsHtml += _getChartIntervalSettingHTML(item, stockChartInterval, toolBarConfig[item]);
                    break;
                default:
                    break;
            }
        });
        return settingsHtml;
    };

    let _getUniqueId = function (chartId, point) {
        return chartId + '_' + point.x;
    };

    let _initialize = function (id, container, settings) {
        let intradayChartContainer = _getIntradayChartContainer(container);
        _intradayChartInstances[id] = {
            isEnable: false,
            container: intradayChartContainer,
        };
        _initializeListners(id);
    };

    let _initializeListners = function (chartId) {
        _intradayChartListeners[chartId] = [];
        let stockChart = infChart.manager.getChart(chartId);

        _intradayChartListeners[chartId].push({
            method: 'onDrawingOptionSelect',
            id: stockChart.registerForEvents('onDrawingOptionSelect', function () {
                _deactivateIntradayChart(chartId);
                _destroyIntradayChart(chartId);
            })
        });

        _intradayChartListeners[chartId].push({
            method: 'onBaseSymbolDataLoad',
            id: stockChart.registerForEvents('onBaseSymbolDataLoad', function () {
                _destroyIntradayChart(chartId);
            })
        });
    };

    let _isIntradaySeries = function (series) {
        return series && series.name === 'IntradaySeries';
    };

    let _onChartPointClick = function (series, event) {
        let hChart = series.chart;
        let chartId = infChart.manager.getContainerIdFromChart(hChart.renderTo.id);
        let stockChart = infChart.manager.getChart(chartId);
        if (!_getIsActiveIntradayChart(chartId) || !stockChart.isMainSeries(series)) {
            return;
        }
        let point = event.point;
        let uniqueId = _getUniqueId(chartId, point);
        let container = _intradayChartInstances[chartId].container;
        let config = {
            config: infChart.intradayChartConfig,
            settings: infChart.intradayChartSettings
        }
        _intradayChartInstances[chartId].config = config;
        _renderIntradayChart(chartId, uniqueId, container, point, stockChart, config);
    };

    let _renderIntradayChart = function (chartId, uniqueId, container, point, stockChart, options) {
        let intraChartObj;
        if (!_intradayChartInstances[chartId]['chart']) {
            intraChartObj = new infChart.IntradayChart(uniqueId, stockChart, point, options);
            _intradayChartInstances[chartId]['chart'] = intraChartObj;
            _generateContainers(chartId, uniqueId, container, point, options.settings);

            let chartContainer = _getChartContainer(container);
            intraChartObj.createHighchartInstance(uniqueId, chartContainer, options);
        } else {
            intraChartObj = _intradayChartInstances[chartId]['chart'];
        }
        intraChartObj.setLoading(true);
        intraChartObj.setPointIndicator(chartId, point);
        intraChartObj.getHistoryData();
    };

    let _setChartType = function (chartId, type) {
        let intradayChart = _intradayChartInstances[chartId].chart;
        intradayChart.setChartStyle(type);
    };

    let _setContainerHeightWidth = function (chartId, container) {
        let stockChart = infChart.manager.getChart(chartId);
        let mainChartContainer = infChart.structureManager.getContainer(stockChart.getContainer(), "chartContainer");
        let intradayMainContainer = _getIntradayMainContainer(container);
        let height = $(mainChartContainer).height() * 0.32;
        let width = $(mainChartContainer).width() * 0.48;
        $(intradayMainContainer).width(width);
        $(intradayMainContainer).height(height);

        let intradayChartHeader = _getIntradayChartHeaderPanel(container);
        let intradayChartContainer = _getIntradayChartPanel(container);
        let chartContainer = _getChartContainer(container);
        let headerHeight = $(intradayChartHeader).outerHeight(true);
        let marginPaddingH = $(intradayChartContainer).outerHeight(true) - $(intradayChartContainer).height()
        let marginPaddingW = $(intradayChartContainer).outerWidth(true) - $(intradayChartContainer).width()

        $(chartContainer).height(height - headerHeight - marginPaddingH);
        $(chartContainer).width(width - marginPaddingW);

        let left = ($(mainChartContainer).outerWidth(true) - $(intradayMainContainer).outerWidth(true)) / 2;
        $(intradayMainContainer).css({'left': left});
    };

    let _setInterval = function (chartId, interval) {
        let intradayChart = _intradayChartInstances[chartId].chart;
        intradayChart.setInterval(interval);
    };

    let _toggleIntradayChart = function (chartId) {
        let isEnable = _getIsActiveIntradayChart(chartId);
        if (isEnable) {
            _deactivateIntradayChart(chartId);
        } else {
            _activateIntradayChart(chartId);
        }
    };

    let _updateSettingOption = function (ctrlType, container, newValue, selectElm) {
        let element = $(container).find('button[inf-ctrl="' + ctrlType + '"]');
        $(selectElm).parent().find('li[inf-ctrl-item=' + ctrlType + ']').removeClass('active');
        $(selectElm).parent().find('li[inf-ctrl-item=' + ctrlType + '][inf-ctrl-value="' + newValue + '"]').addClass('active');
        switch (ctrlType) {
            case "intradayChartType":
                let iconClass = $(selectElm).find('i[rel="icon"]').attr('inf-ico');
                $(element).find('i[rel="icon"]').removeClass().addClass(iconClass);
                break;
            case "intradayInterval":
                let intervalText = $(selectElm).find('a span[ctrl-role="text"]').text();
                $(element).find('span[ctrl-role="text"]').html(intervalText); 
                break;
            default:
                break;
        }
    }

    return {
        initialize: _initialize,
        getIsActiveIntradayChart: _getIsActiveIntradayChart,
        activateIntradayChart: _activateIntradayChart,
        deactivateIntradayChart: _deactivateIntradayChart,
        onChartPointClick: _onChartPointClick,
        isIntradaySeries: _isIntradaySeries,
        eligibleForIntradayChart: _eligibleForIntradayChart,
        toggleIntradayChart: _toggleIntradayChart
    };

})(jQuery, infChart);
