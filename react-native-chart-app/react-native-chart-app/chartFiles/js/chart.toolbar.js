/**
 * Created by dushani on 9/2/15.
 * This section includes the implementation related to the chart tool bar
 */
var infChart = window.infChart || {};

infChart.toolbar = (function () {
    var _instance;
    var _chartManager;

    var selectedCSSClass = 'selected';

    /**
     * @typedef {object} toolbarConfig
     * @property {Array<object>} options
     * @property {boolean} [categorized=false] categorized
     * @property {string} [categoryLabelPrefix=undefined] categoryLabelPrefix - category header label prefix
     * @property {string} [display=undefined] display - comma separated keys to filter the options for display
     * @property {boolean} [shortLabel=false] shortLabel - display short description or long description
     * @property {string} [baseClass=undefined] baseClass - class for li
     * @property {string} [menuClass=undefined] menuClass - class for ul
     */

    //region toolbar

    /**
     * Base method
     * @param container container
     * @param {string} uniqueId unique id
     * @param {object} config
     * @private
     */
    var _createToolbar = function (container, uniqueId, config) {

        _chartManager = (_chartManager) ? _chartManager : infChart.manager;

        var toolbarParent;

        container.attr("inf-toolbar-type", "l");

        if (config.top && config.topTb) {
            toolbarParent = container.find('[inf-pnl="tb-top"]');
            _bindElements(container, uniqueId, toolbarParent, config.topTb, config.config);
        }
        if (config.upper && config.upperTb) {
            toolbarParent = container.find('[inf-pnl="tb-upper"]');
            _bindElements(container, uniqueId, toolbarParent, config.upperTb, config.config);
        }
        if (config.right && config.rightTb) {
            toolbarParent = container.find('[inf-pnl="tb-right"]');
            _bindElements(container, uniqueId, toolbarParent, config.rightTb, config.config);
            // binding the close button of the right panel
            _setSingleOptionControl(toolbarParent, "pnlClose", function () {
                var chart = _getChartInstance(uniqueId);
                chart.hideRightPanel(container, true, true);
            });
        }
        if (config.mobile && config.mobileTb) {
            toolbarParent = container.find('[inf-pnl="tb-mobile"]');
            _bindElements(container, uniqueId, toolbarParent, config.mobileTb, config.config);
        }
    };

    var _getChartInstance = function (uniqueId) {
        return _chartManager.getChart(uniqueId);
    };


    /**
     * bind elements
     * @param container
     * @param {string} uniqueId
     * @param toolbarParent
     * @param {Array<string>} buttons
     * @param {object} config
     * @private
     */
    var _bindElements = function (container, uniqueId, toolbarParent, buttons, config) {
        buttons.forEach(function (controlType) {
            var buttonConfig = config[controlType];
            switch (controlType) {
                case "comparison":
                    _setComparison(container, uniqueId, toolbarParent, config[controlType]);
                    break;
                case "period":
                    if (config[controlType].categorized) {
                        var categories = {};
                        infChart.util.forEach(config[controlType].options, function (i, option) {
                            if (!categories[option.category]) {
                                categories[option.category] = option;
                                _setSelectedValueInMultiOptionControlWithText(_getControlElement(toolbarParent, controlType), option.key, false);
                            }
                        });
                    }
                    _setMultiOptionControlWithText(toolbarParent, controlType, function (value) {
                        _getChartInstance(uniqueId).setPeriod(value, true, false, undefined, true);
                    });
                    break;
                case "indicator"://indicator dropdown in top toolbar
                    _setIndicatorControl(container, uniqueId, toolbarParent, config[controlType]);
                    break;
                case "rightPanel":
                    _setSingleOptionControl(toolbarParent, controlType, function () {
                        var chart = _getChartInstance(uniqueId);
                        var isVisible = chart.toggleRightPanel(container, true);
                        if (isVisible) {
                            var panel = _getSettingsContainer(uniqueId, 'indicatorPanelView');//show indicator panel by default

                            if (!panel.find('[inf-ctrl="indicator"]').find('div.panel-collapse').is(":visible")) {
                                panel.find('[inf-ctrl="indicator"]').find('div.panel-collapse').addClass('in');
                            }
                        }
                        return isVisible;
                    });
                    break;
                case "indicatorPanelView"://indicator panel
                    var panel = _getSettingsContainer(uniqueId, 'indicatorPanelView'), indicatorDropdownPanel = panel.find('[inf-ctrl="indicator"]');
                    var id = uniqueId + '-indicator-panel';
                    panel.attr('rel', id);
                    infChart.structureManager.indicator.bindIndicatorSearchPanel(indicatorDropdownPanel);
                    _setIndicatorControl(container, uniqueId, panel);
                    break;
                case "drawingToolPanelView":
                    var drawingPanel = _getSettingsContainer(uniqueId, 'drawingToolPanelView'),
                        drawingPanelId = uniqueId + '-drawing-panel';
                    drawingPanel.attr('rel', drawingPanelId);
                    break;
                case "symbolSettingsPanelView":
                    var symbolPanel = _getSettingsContainer(uniqueId, 'symbolSettingsPanelView'),
                        symbolPanelId = uniqueId + '-symbol-settings-panel';
                    symbolPanel.attr('rel', symbolPanelId);
                    break;
                case "adv" :
                    _setAdvanceChartControl(container, uniqueId, toolbarParent, config[controlType]);
                    break;
                case "flags" :
                    _setMultiOptionControlWithMultipleSelect(toolbarParent, controlType, function (value) {
                        return _getChartInstance(uniqueId).toggleFlags(value);
                    });
                    break;
                case "file" :
                    _setMultiOptionControlWithType(toolbarParent, controlType, function (value, type) {
                        if (value == "saveAsDefault") {
                            try {
                                infChart.manager.saveTemplate(uniqueId, "default", type);
                                infChart.util.showMessage(uniqueId, "Successfully Saved!");
                            }
                            catch (e) {
                                infChart.util.showMessage(uniqueId, "Error in Saving!");
                            }
                        } else if (value == "removeDefault") {
                            try {
                                infChart.manager.deleteTemplate(uniqueId, "default", type);
                                infChart.util.showMessage(uniqueId, "Successfully Removed!");
                            }
                            catch (e) {
                                infChart.util.showMessage(uniqueId, "Error in Removing!");
                            }
                        } else if(value == "loadDefault"){
                            try {
                                infChart.manager.loadTemplate(uniqueId, "default", type);
                                infChart.util.showMessage(uniqueId, "Successfully Load To Default!!");
                            } catch (error) {
                                infChart.util.showMessage(uniqueId, "Error in Load To Default!");
                            }
                        }
                         else {
                            _loadTemplatePopup(container, uniqueId, value, type);
                        }
                    });
                    break;
                case "interval" :
                    _setMultiOptionControlWithText(toolbarParent, controlType, function (value) {
                        container.find("[inf-ctrl=period] [inf-ctrl-type=interval].selected").removeClass('selected');//what is this??
                        _getChartInstance(uniqueId).setIntervalManually(value, undefined, true, undefined, true);
                    });
                    break;
                case "periodD":
                    buttonConfig && buttonConfig.compactShowOnly && _getControlElement(toolbarParent, 'period').addClass('compact-show');
                    _setMultiOptionControlWithText(toolbarParent, 'period', function (value) {
                        _getChartInstance(uniqueId).setPeriod(value, true, false, undefined, true);
                    });
                    break;
                case "intervalD":

                    buttonConfig && buttonConfig.compactShowOnly && _getControlElement(toolbarParent, 'interval').addClass('compact-show');
                    //_getControlElement(toolbarParent, 'interval').addClass('compact-show');
                    _setMultiOptionControlWithText(toolbarParent, 'interval', function (value) {
                        _getChartInstance(uniqueId).setIntervalManually(value, undefined, true, undefined, true);
                    });
                    break;
                case "chartType" :
                    _setMultiOptionControlWithIcon(toolbarParent, controlType, true, function (value) {
                        infChart.manager.setChartStyle(uniqueId, value);
                    });
                    break;
                case "grid" :
                    _setMultiOptionControlWithIcon(toolbarParent, controlType, true, function (value) {
                        _getChartInstance(uniqueId).setGridType(value, true, true);
                    });
                    break;
                case "crosshair" :
                    _setMultiOptionControl(toolbarParent, controlType, function (value) {
                        return _getChartInstance(uniqueId).toggleCrosshair(value, true);
                    });
                    break;
                case "depth" :
                    _setMultiOptionControl(toolbarParent, controlType, function (value) {
                        return _getChartInstance(uniqueId).changeDepthSide(value, true);
                    });
                    break;
                case "print" :
                    _setSelectedValueInMultiOption(_getControlElement(toolbarParent, controlType), 'print', false);
                    _setMultiOptionControlWithIcon(toolbarParent, controlType, false, function (value) {
                        var afterPrint = (config) ? config.afterPrint : undefined;
                        infChart.manager.exportChart(uniqueId, value, afterPrint);
                    });
                    break;
                case "zoom" :
                    infChart.structureManager.common.setSingleOptionControlWithoutStatus(toolbarParent, controlType, function (value) {
                        infChart.manager.zoom(uniqueId, value);
                    });
                    break;
                case "full-screen" :
                    infChart.structureManager.common.setSingleOptionControlWithoutStatus(toolbarParent, controlType, function () {
                        infChart.manager.handleFullscreen(container);
                    });
                    break;
                //case "reset":
                //    infChart.structureManager.common.setSingleOptionControlWithoutStatus(toolbarParent, controlType, function () {
                //        if (config[controlType] && typeof config[controlType].onClick === 'function') {
                //            config[controlType].onClick(uniqueId);
                //        }
                //    });
                //    break;
                case "volume":
                    _setSingleOptionControl(toolbarParent, controlType, function () {
                        var indicatorType = buttonConfig && buttonConfig.type ? buttonConfig.type : "VOLUME";
                        return _getChartInstance(uniqueId).toggleSingletonIndicatorByType(indicatorType, true);
                    });
                    break;
                case "spread":
                    _setSingleOptionControl(toolbarParent, controlType, function () {
                        var indicatorType = buttonConfig && buttonConfig.type ? buttonConfig.type : "SPREAD";
                        return _getChartInstance(uniqueId).toggleSingletonIndicatorByType(indicatorType, true);
                    });
                    break;
                case "bidAskHistory":
                    _setSingleOptionControl(toolbarParent, controlType, function () {
                        var indicatorType = buttonConfig && buttonConfig.type ? buttonConfig.type : "BAH";
                        return _getChartInstance(uniqueId).toggleSingletonIndicatorByType(indicatorType, true);
                    });
                    break;
                case "value" :
                    _setSingleOptionControl(toolbarParent, 'percent', function () {
                        return _getChartInstance(uniqueId).toggleChartDataMode('percent', true);
                    });
                    _setSingleOptionControl(toolbarParent, 'log', function () {
                        return _getChartInstance(uniqueId).toggleChartDataMode('log', true);
                    });
                    break;
                case "navigator" :
                    _setSingleOptionControl(toolbarParent, controlType, function () {
                        return _getChartInstance(uniqueId).toggleHistory(true);
                    });
                    break;
                case "tooltip" :
                    _setSingleOptionControl(toolbarParent, controlType, function () {
                        return _getChartInstance(uniqueId).toggleToolTip(true);
                    });
                    break;
                //case "tradingPanel" : NOW REMOVED
                //    _setSingleOptionControl(toolbarParent, controlType, function () {
                //        var chart = _getChartInstance(uniqueId);
                //        var isVisible = chart.showRightPanelWithTab(container, true);
                //        if (isVisible) {
                //            if (chart.trader) {
                //                chart.trader.showTradingView(isVisible, chart.settings.toolbar.trading);
                //            }
                //        }
                //        return isVisible;
                //    });
                //    break;
                case "news" :
                    _setSingleOptionControl(toolbarParent, controlType, function () {
                        return _getChartInstance(uniqueId).toggleNews(true);
                    });
                    break;
                case "last" :
                    _setSingleOptionControl(toolbarParent, controlType, function () {
                        return _getChartInstance(uniqueId).toggleLastLine(true);
                    });
                    break;
                case "preclose" :
                    _setSingleOptionControl(toolbarParent, controlType, function () {
                        return _getChartInstance(uniqueId).togglePreviousCloseLine(true);
                    });
                    break;
                case "minMax" :
                    _setSingleOptionControl(toolbarParent, controlType, function () {
                        return _getChartInstance(uniqueId).toggleShowMinMax(true);
                    });
                    break;
                case "orderBookHistory":
                    _setSingleOptionControl(toolbarParent, controlType, function () {
                        return _getChartInstance(uniqueId).toggleOrderBookHistory(true);
                    });
                    break;
                //case "buy":
                //case "sell":
                //    infChart.structureManager.common.setSingleOptionControlWithoutStatus(toolbarParent, controlType, function (value) {
                //        return infChart.tradingManager.onTradeControlUpdates(uniqueId, value);
                //    });
                //    break;
                case "tradeControlCompact":
                    _setDefaultMultiOptionControl(toolbarParent, controlType, function (value) {
                        return infChart.tradingManager.onTradeControlUpdates(uniqueId, value);
                    });
                    break;
                case "pinInterval" :
                    _setSingleOptionControl(toolbarParent, controlType, function () {
                        return _getChartInstance(uniqueId).togglePinInterval(true);
                    });
                    break;
                case "buy":
                case "sell":
                    buttonConfig && buttonConfig.compactShowOnly && _getControlElement(toolbarParent, controlType).addClass('compact-show');
                    infChart.structureManager.common.setSingleOptionControlWithoutStatus(toolbarParent, controlType, function (value) {
                        return infChart.tradingManager.onTradeControlUpdates(uniqueId, value);
                    });
                    break;
                case "undo":
                case "redo":
                    _setSingleOptionControl(toolbarParent, controlType, function () {
                        return infChart.commandsManager.executeCommand(uniqueId, controlType);
                    });
                    break;
                default :
                    if (config[controlType] && typeof config[controlType].onClick === 'function') {
                        infChart.structureManager.common.setSingleOptionControlWithoutStatus(toolbarParent, controlType, function () {
                            config[controlType].onClick(uniqueId);
                        });
                    }
                    break;
            }
        });
    };

    /**
     * This section applies the bootstrap tooltip and a workaround to deal with the issues encountered with dropdowns.
     * @private
     */
    var _initializeTooltips = function (contaner) {

        contaner.find("[x-tt-class]").each(function (i, el) {
            $(el).addClass($(el).attr('x-tt-class'));
        });

       /* var tooltips = $('[data-toggle="tooltip"]').tooltip();

        var onTooltipMouseMove,
            prevTT,
            currentTT;

        var onMouseMove = function (event) {

            /!*if (!$(event.target).is(tt) && tt.closest(".dropdown").is($(event.target).closest(".dropdown")) && $(event.target).attr('data-toggle') != "tooltip") {
             //tt.closest(".dropdown").removeClass("manual-hover");


             if(!$(event.target).closest('[data-toggle="tooltip"]').data('bs.tooltip').$tip.is(':visible')){
             $(event.target).closest('[data-toggle="tooltip"]').tooltip('show');
             }
             }*!/
            /!*if($(event.target).attr('data-toggle') != "tooltip"){
             alert('ok');
             }*!/
            //console.error("onMouseMove :: " +  currentTT.attr("data-original-title"));
            if (!currentTT.parents(".dropdown").has($(event.target)).length && !$(event.target).closest('[role="tooltip"]').length) {
                currentTT.parents(".dropdown").removeClass("manual-hover");

                console.error("onMouseMove removed :: " + currentTT.attr("data-original-title"));
            }
            $(document).off('mousemove', onMouseMove);
        };

        tooltips.on("shown.bs.tooltip", function () {
            var tt = $(this);
            if (!tt.is(currentTT)) {
                prevTT = currentTT;
            }
            currentTT = $(this);


            if (!currentTT.data('bs.tooltip').$tip.is(':visible')) {
                currentTT.tooltip('show');
                console.error('shown.bs.tooltip :: show :: ' + currentTT.attr("data-original-title"));
            }


            //$(document).off('mousemove', onMouseMove);
            $('[role="tooltip"]').off('mousemove').on('mousemove', function (event) {
                $(this).off('mousemove');
                // console.error('mousemove [role="tooltip"] :: ' + currentTT.attr("data-original-title"));
                event.stopPropagation();
                //tt.tooltip('hide');
                currentTT.parents(".dropdown").addClass("manual-hover"); // manually show the dropdown since it gets hide when mouse is moved to the tooltip area

                // However "manual-hover" class should be removed once mouse is moved again. other wise dropdown may not work naturally
                // So, that class is removed on the very first mouse move capture and unregistered from the event

                $(document).off('mousemove', onMouseMove);
                $(document).on('mousemove', onMouseMove);
                /!*var hoverFun = function(){
                 if(!$(this).data('bs.tooltip') || !$(this).data('bs.tooltip').$tip || !$(this).data('bs.tooltip').$tip.is(':visible')){
                 $(this).tooltip('show');
                 }
                 tt.closest(".dropdown").find("li").off('mousemove', hoverFun);
                 };
                 tt.closest(".dropdown").find("li").on('mousemove',hoverFun);
                 if($(document.elementFromPoint(event.clientX,event.clientY)))*!/
                var currentPointTT = $(document.elementFromPoint(event.clientX, event.clientY)).closest('[data-toggle="tooltip"]');
                currentPointTT.tooltip('show');
                if (currentPointTT) {
                    var ccData = currentPointTT.data('bs.tooltip');
                    (!ccData || !ccData.$tip || !ccData.$tip.is(':visible')) && currentPointTT.tooltip('show');
                }
            });
        });

        tooltips.on("hidden.bs.tooltip", function () {
            $(this).parents(".dropdown").removeClass("manual-hover"); // TODO : fix this issue check $('[role="tooltip"]') before remove
        });*/
    };

    //region multi

    /**
     * multi option - control
     * used for tradeControl
     * @param parent
     * @param {string} controlType
     * @param {function} fn
     * @private
     */
    var _setDefaultMultiOptionControl = function (parent, controlType, fn) {
        var control = _getControlElement(parent, controlType);
        _getOptionElementsForMultiOptions(control).click(function (event) {
            fn(_getValueFromAttribute(this));
            event.preventDefault();
        });
    };

    /**
     * multi option - control where selected icon is shown
     * used in chart types and grid types
     * @param parent
     * @param {string} controlType
     * @param {function} fn
     * @private
     */
    var _setMultiOptionControlWithIcon = function (parent, controlType, isControlHighlight, fn) {
        var control = _getControlElement(parent, controlType);
        _getOptionElementsForMultiOptions(control).click(function (event) {
            var value = _getValueFromAttribute(this);
            _setSelectedValueInMultiOptionControlWithIcon(control, value, isControlHighlight);
            fn(value);
            event.preventDefault();
        });
    };

    /**
     * multi option - control where selected text is shown
     * used for interval
     * @param parent
     * @param {string} controlType
     * @param {function} fn
     * @private
     */
    var _setMultiOptionControlWithText = function (parent, controlType, fn) {
        var control = _getControlElement(parent, controlType);
        _getOptionElementsForMultiOptions(control).click(function (event) {
            var value = _getValueFromAttribute(this);
            _setSelectedValueInMultiOptionControlWithText(control, value);
            fn(value);
            event.preventDefault();
        });
    };

    /**
     * multi option - control where selected icon is shown with status
     * used in depth, cross-hair
     * @param parent
     * @param controlType
     * @param fn
     * @private
     */
    var _setMultiOptionControl = function (parent, controlType, fn) {
        var control = _getControlElement(parent, controlType);
        _getOptionElementsForMultiOptions(control).click(function (event) {
            var value = _getValueFromAttribute(this);
            var enabled = fn(value);

            if (typeof enabled == "object") {
                value = enabled.value || value;
                enabled = enabled.enabled;
            }
            _setSelectedValueInMultiOption(control, value, enabled);
            event.preventDefault();
        });
    };

    /**
     * multi option - control where multiple items can be selected
     * used for flags
     * @param parent
     * @param {string} controlType
     * @param {function} fn
     * @private
     */
    var _setMultiOptionControlWithMultipleSelect = function (parent, controlType, fn) {
        var control = _getControlElement(parent, controlType);
        _getOptionElementsForMultiOptions(control).click(function (event) {
            var flagType = _getValueFromAttribute(this);
            var enabledFlags = fn(flagType);
            _setSelectedValuesInMultiOptionControlWithMultipleSelect(control, enabledFlags);
            event.preventDefault();
        });
    };

    /**
     * multi option with static text
     * used for file
     * @param parent
     * @param {string} controlType
     * @param {function} fn
     * @private
     */
    var _setMultiOptionControlWithType = function (parent, controlType, fn) {
        _getOptionElementsForMultiOptions(_getControlElement(parent, controlType)).click(function (event) {
            var action = _getValueFromAttribute(this);
            var templateType = $(this).attr('inf-temp-type');
            fn(action, templateType);
            event.preventDefault();
        });
    };

    /**
     * get bind element
     * @param control
     * @returns {*}
     * @private
     */
    var _getOptionElementsForMultiOptions = function (control) {
        return control.find('[inf-ctrl-value]');
    };

    //endregion

    //region single

    /**
     * single option with status
     * @param parent
     * @param {string} controlType
     * @param {function} fn
     * @private
     */
    var _setSingleOptionControl = function (parent, controlType, fn) {
        var control = _getControlElement(parent, controlType);
        control.click(function (event) {
            var attrValue = _getValueFromAttribute(this);
            var status = fn(attrValue);
            _setButtonStatus(control, status);
            event.preventDefault();
        });
    };

    /**
     * single option without status
     * used in zoom, reset, fullscreen
     * @param parent
     * @param {string} controlType
     * @param {function} fn
     * @private
     */
    // var _setSingleOptionControlWithoutStatus = function (parent, controlType, fn) {
    //     var control = _getControlElement(parent, controlType);
    //     control.click(function (event) {
    //         fn(_getValueFromAttribute(this));
    //         event.preventDefault();
    //     });
    // };

    //endregion

    /**
     * get control element
     * @param container
     * @param {string} controlType
     * @returns {*}
     * @private
     */
    var _getControlElement = function (container, controlType) {
        return container.find('[inf-ctrl="' + controlType + '"]');
    };

    /**
     * get selected element
     * @param control
     * @param {string} value
     * @returns {*}
     * @private
     */
    var _getSelectedElementFromValue = function (control, value) {
        return control.find('[inf-ctrl-value="' + value + '"]');
    };

    /**
     * get selected element icon
     * @param control
     * @param {string} value
     * @returns {string} - icon class
     * @private
     */
    var _getSelectedElementIconFromValue = function (control, value) {
        return _getSelectedElementFromValue(control, value).attr('inf-ico');
    };

    /**
     * get elements from item tag
     * @param control
     * @param {string} type
     * @returns {*}
     * @private
     */
    var _getElementsFromItem = function (control, type, cls) {
        return control.find('[inf-ctrl-item=' + type + ']' + ((cls && ("." + cls)) || ''));
    };

    /**
     * get value from element
     * @param element
     * @returns {string}
     * @private
     */
    var _getValueFromAttribute = function (element) {
        return $(element).attr('inf-ctrl-value');
    };

    /**
     * get top tt type html - ???
     * @param {string} type
     * @returns {string}
     * @private
     */
    var _getTopttItemHtml = function (type) {
        return ' top-tt-item="' + (type || "l") + '"';
    };

    /**
     * get inf-ctrl html
     * @param {string} type
     * @returns {string}
     * @private
     */
    // var _getCtrlTypeHtml = function (type) {
    //     return ' inf-ctrl="' + type + '"';
    // };

    /**
     * get inf-ctrl-value html
     * @param {string} value
     * @returns {string}
     * @private
     */
    // var _getCtrlValueHtml = function (value) {
    //     return ' inf-ctrl-value="' + value + '"';
    // };

    /**
     * get inf-ctrl-item html
     * @param {string} type
     * @returns {string}
     * @private
     */
    var _getCtrlItemHTML = function (type) {
        return ' inf-ctrl-item="' + type + '"';
    };

    /**
     * get inf-ico html
     * @param {string} icon
     * @returns {string}
     * @private
     */
    var _getCtrlIconHtml = function (icon) {
        return ' inf-ico="' + icon + '"';
    };

    /**
     * get inf-status html
     * @param {string} status
     * @returns {string}
     * @private
     */
    var _getCtrlStatusHtml = function (status) {
        return ' inf-status="' + (status ? 'on' : 'off') + '"';
    };

    var _getToolTipAttributes = function (title, direction) {
        return infChart.structureManager.toolbar.getToolTipAttributes(title, direction);
    };

    var _getCtrlTooltipHtml = function (label, shortLabel, isShortLabel, direction) {
        var text = isShortLabel && shortLabel ? shortLabel : label;
        return _getToolTipAttributes(text, direction);
    };

    var _getCtrlTextHtml = function (label, shortLabel, isShortLabel) {
        var text = isShortLabel && shortLabel ? shortLabel : label;
        return ' data-localize="' + text + '"';
    };

    /**
     * initialize chart comparison control
     * @param container
     * @param {string} uniqueId
     * @param parent
     * @param {object} config config options for comparison
     * @private
     */
    var _setComparison = function (container, uniqueId, parent, config) {
        var control = parent.find("li[inf-ctrl='comparison']");

        if (config) {
            if (config.symbolSearch) {
                var symbolSearchEle = control.find('input[data-inf-ctrl-rel="symbolSearch"]');
                symbolSearchEle.autocomplete(config.symbolSearch.options);
                if (config.symbolSearch.extensions) {
                    var extensionPoints = config.symbolSearch.extensions;
                    var instance = symbolSearchEle.autocomplete("instance");
                    if (extensionPoints._resizeMenu) {
                        instance._resizeMenu = extensionPoints._resizeMenu;
                    }
                    if (extensionPoints._renderMenu) {
                        instance._renderMenu = extensionPoints._renderMenu;
                    }
                    if (extensionPoints._renderItem) {
                        instance._renderItem = extensionPoints._renderItem;
                    }
                }
            } else {
                if (config.options && config.options.length > 0) {
                    control.find("li").click(function (event) {
                        infChart.manager.addCompareSymbol(uniqueId, JSON.parse(decodeURI($(this).attr('inf-ctrl-value'))));
                        event.preventDefault();
                    });
                }
            }
        }
    };

    var _setMobileSelectedPeriod = function (container, selectedPeriod) {
        var txt = container.find("[inf-pnl=tb-mobile] [inf-ctrl=period] [inf-ctrl-value=" + selectedPeriod + "]").text();
        container.find("[inf-pnl=tb-mobile] [inf-period-text=selected]").html(txt);
    };

    /**
     * initialize chart period change controls
     * @param container
     * @param uniqueId
     * @param parent
     * @private
     */
    var _setPeriod = function (container, uniqueId, parent) {

        var control = parent.find("[inf-ctrl=period]");

        var periods = control.find("[inf-ctrl-type=period]");
        var periodCategories = control.find("[inf-ctrl-type=period-cat]");

        periods.click(function (event) {
            var chart = _chartManager.getChart(uniqueId),
                selectedPeriod = _getValueFromAttribute($(this));

            chart.setPeriod(selectedPeriod, true, true, undefined, true);
            _setMobileSelectedPeriod(container, selectedPeriod);
            event.preventDefault();
        });

        if (periodCategories && periodCategories.length > 0) {
            periodCategories.click(function (event) {
                var chart = _chartManager.getChart(uniqueId),
                    selectedPeriod = _getValueFromAttribute($(this));
                chart.setPeriod(selectedPeriod, true, true, undefined, true);
                _setMobileSelectedPeriod(container, selectedPeriod);
                _setSelectedControlsGivenContainer(container, "period", selectedPeriod);
                $(this).parent().find("[inf-ctrl-type=period][inf-ctrl-value=" + selectedPeriod + "]").addClass("selected");
                event.preventDefault();
            });
        }
        var chart = _chartManager.getChart(uniqueId);

        periods.each(function (i, element) {
            var control = $(element).find("[inf-ctrl=interval]");

            if (control && control.length > 0) {
                var intervals = control.find("li");
                intervals.click(function (event) {
                    var chart = _chartManager.getChart(uniqueId);
                    var interval = _getValueFromAttribute($(this));
                    var period = $(this).attr('inf-period');
                    chart.setInterval(interval, undefined, true, true, period, undefined, true);
                    periods.find("[inf-ctrl-type=interval].selected").removeClass('selected');
                    $(this).addClass('selected');
                    event.stopPropagation();
                    event.preventDefault();
                });

                /*Validating user defined intervals for the period*/
                var today = (new Date()).getTime();
                var period = _getValueFromAttribute($(element));
                period = chart.isShortPeriod(period) ? 'D_3' : period;
                var minDate = chart.dataManager.getMinDate(period, today);

                $.each(intervals, function () {
                    var intervalOpt = chart.getIntervalOption(_getValueFromAttribute($(this)));
                    if (intervalOpt && intervalOpt.maxPeriod) {
                        var minIntervalDate = chart.dataManager.getMinDate(intervalOpt.maxPeriod, today);
                        if (minDate.getTime() < minIntervalDate.getTime()) {
                            $(this).remove();
                        }
                    }
                });
            }
        });
    };

    /**
     * initialize chart period change controls
     * @param container
     * @param uniqueId
     * @param parent
     * @private
     */
    var _setPeriodDropDown = function (container, uniqueId, parent) {

        var control = parent.find("ul[inf-ctrl=period]");

        var chart = _chartManager.getChart(uniqueId), periods = parent.find('li[inf-ctrl-type="period"]');

        if (control.length > 0) {
            /**
             * this is for periods with intervals
             * https://stackoverflow.com/questions/9758587/twitter-bootstrap-multilevel-dropdown-menu - [Twitter Bootstrap v3]
             */
            control.find("a[inf-ctrl-type='trigger']").on('click', function (event) {
                var current = $(this).next();
                var grandparent = $(this).parent().parent();
                if ($(this).hasClass('left-caret') || $(this).hasClass('right-caret'))
                    $(this).toggleClass('right-caret left-caret');
                grandparent.find('.left-caret').not(this).toggleClass('right-caret left-caret');
                grandparent.find(".sub-menu:visible").not(current).hide();
                current.toggle();
                event.stopPropagation();
                event.preventDefault();
            });

            control.find("a:not([inf-ctrl-type='trigger'])").on('click', function (event) {
                var chart = _chartManager.getChart(uniqueId),
                    dataElement = $(this).parent('li'),
                    type = dataElement.attr('inf-ctrl-type'),
                    value = _getValueFromAttribute(dataElement);
                if (type === 'interval') {
                    var period = dataElement.attr('inf-period');
                    dataElement.parent('ul').siblings('a').find('span[cntrl-role="text"]').text('-' + dataElement.find('a').text());
                    chart.setInterval(value, undefined, true, true, period, undefined, true);
                } else {
                    chart.setPeriod(value, true, true, undefined, true);
                }

                var root = $(this).closest('.dropdown');
                root.find('.left-caret').toggleClass('right-caret left-caret');
                root.find('.sub-menu:visible').hide();
                event.stopPropagation();
                event.preventDefault();
            });
        } else {
            periods.find("li[inf-ctrl-type=interval]").on('click', function (event) {
                var dataElement = $(this), value = _getValueFromAttribute(dataElement);
                var period = dataElement.attr('inf-period');
                dataElement.parent('ul').siblings('a').find('span[cntrl-role="text"]').text('-' + dataElement.find('a').text());
                chart.setInterval(value, undefined, true, true, period, undefined, true);
                event.stopPropagation();
                event.preventDefault();
            });
        }

        periods.each(function (i, element) {
            /*Validating user defined intervals for the period*/
            var today = (new Date()).getTime();
            var period = _getValueFromAttribute($(element));
            period = chart.isShortPeriod(period) ? 'D_3' : period;
            var minDate = chart.dataManager.getMinDate(period, today);

            var intervals = $(element).find("li[inf-ctrl-type=interval]");

            $.each(intervals, function () {
                var intervalOpt = chart.getIntervalOption(_getValueFromAttribute($(this)));
                if (intervalOpt && intervalOpt.maxPeriod) {
                    var minIntervalDate = chart.dataManager.getMinDate(intervalOpt.maxPeriod, today);
                    if (minDate.getTime() < minIntervalDate.getTime()) {
                        $(this).remove();
                    }
                }
            });
        });
    };

    var _setIndicatorControl = function (container, uniqueId, parent) {
        var control = parent.find("[inf-ctrl=indicator]");

        control.find("[inf-ctrl-value]").click(function (event) {
            var chart = _chartManager.getChart(uniqueId);
            chart.addIndicator(_getValueFromAttribute($(this)), undefined, true, true);
            //control.find(".dropdown-menu").dropdown("toggle");
            event.preventDefault();
        });

        /** Simple delay function that can wrap around an existing function and provides a callback. */
        var delay = (function () {
            var timer = 0;
            return function (callback, ms) {
                clearTimeout(timer);
                timer = setTimeout(callback, ms);
            };
        })();

        control.find("[inf-ctrl-ind=search]").bind('change keyup', function () {

            var search = $.trim($(this).val());
            var regex = new RegExp("\\b" + search.toUpperCase(), "gi");

            delay(function () {
                control.find("[inf-ctrl-value] a").each(function () {
                    if ($(this).text().toUpperCase().match(regex) === null) {
                        $(this.parentNode).hide();
                    } else {
                        $(this.parentNode).show();
                    }
                });

            }, 100);
        });


    };

    /**
     * change chart from basic to advance & vice versa
     * @param container top level container
     * @param uniqueId
     * @param parent control's parent element
     * @private
     */
    var _setAdvanceChartControl = function (container, uniqueId, parent) {
        var control = parent.find("li[inf-ctrl=adv]");

        if (container.find('div[inf-pnl=tb-left]').is(':visible') || container.find('div[inf-pnl=tb-top]').is(':visible')) {
            control.attr('inf-status', 'on');
            control.find('a:first-child').addClass("icon ico-indent-less");
            control.find('a:first-child').removeClass("icon ico-indent-more");
            container.addClass('chart-more');
        } else {
            control.attr('inf-status', 'off');
            control.find('a:first-child').addClass("icon ico-indent-more");
            control.find('a:first-child').removeClass("icon ico-indent-less");
            container.addClass('chart-less');
        }

        control.click(function (event) {
            var status = $(this).attr("inf-status");
            var chart = _chartManager.getChart(uniqueId);
            var chartContainerDiv = $('div#' + chart.chartId);
            var tradingPanelWidth = 0;

            if (status === "off") {
                $(this).attr('inf-status', 'on');
                $(this).find('a:first-child').addClass("icon ico-indent-less");
                $(this).find('a:first-child').removeClass("icon ico-indent-more");
                chartContainerDiv.addClass('mainchart_chart');
                container.find('div[inf-pnl=tb-left]').show();
                container.find('nav[inf-pnl=tb-top]').show();
                container.addClass('chart-more');
                container.removeClass('chart-less');

                if (container.find('nav[inf-pnl=tb-top]').find("li[inf-ctrl=tradingPanel]").attr('inf-status') == "on") {
                    tradingPanelWidth = container.find('div[inf-pnl=tb-right]').show().outerWidth();
                }
            } else {
                $(this).attr('inf-status', 'off');
                $(this).find('a:first-child').addClass("icon ico-indent-more");
                $(this).find('a:first-child').removeClass("icon ico-indent-less");
                chartContainerDiv.removeClass('mainchart_chart');
                container.find('div[inf-pnl=tb-left]').hide();
                container.find('div[inf-pnl=tb-right]').hide();
                container.find('nav[inf-pnl=tb-top]').hide();
                container.addClass('chart-less');
                container.removeClass('chart-more');
            }
            chart.setSize(chartContainerDiv.width() - tradingPanelWidth, chartContainerDiv.height(), false);
            event.preventDefault();
        });
    };

    //region file

    var _loadTemplatePopup = function (container, uniqueId, action, templateType) {
        infChart.structureManager.templateSettings.loadPopup(container, uniqueId, action, templateType, infChart.manager.getTemplateNames(templateType, uniqueId),
            function (fileActionPopup, clickAction, clickTemplateType, textName) {
                if (textName.trim() != '') {
                    switch (clickAction) {
                        case 'saveTemplate' :
                        case 'save' :
                            if (textName.length > 30) {
                                infChart.util.showMessage(uniqueId, "Maximum Character Length Exceeded!");
                            } else {
                                infChart.manager.saveTemplate(uniqueId, textName, clickTemplateType);
                                fileActionPopup.hide();
                            }
                            break;
                        case 'loadTemplate' :
                        case 'load' :
                            infChart.manager.loadTemplate(uniqueId, textName, clickTemplateType);
                            fileActionPopup.hide();
                            break;
                        case 'delete':
                            infChart.manager.deleteTemplate(uniqueId, textName, clickTemplateType);
                            _loadTemplateNames(fileActionPopup, templateType, uniqueId);
                            break;
                        default :
                            break;
                    }
                }
            });

    };

    var _loadTemplateNames = function (fileActionPopup, templateType, uniqueId) {
        var lis = '';

        var templates = infChart.manager.getTemplateNames(templateType, uniqueId);
        $.each(templates, function (i, val) {
            lis += '<li class="ui-widget-content">' + val + '</li>';
        });

        fileActionPopup.find("ol[inf-file-sel]").html(lis);
    };

    //endregion

    //endregion

    //endregion

    //endregion

    //region set selected values

    var _clearSelectedControls = function (containerId, type, applyFading) {
        var container = $('#' + containerId), control;
        switch (type) {
            case "period":
                control = _getControlElement(container, type);
                var periods = _getElementsFromItem(control, "period"),
                    activeItem = applyFading && _getElementsFromItem(control, "period", "active");

                periods.removeClass('active');

                if (activeItem && activeItem.length) {
                    periods.removeClass('active-dim');
                    activeItem.addClass('active-dim');
                }
                // TODO :: implement for period-cat when used
                // control.find("li[inf-ctrl=period-cat]").removeClass('active');


                break;
            default :
                break;
        }
    };

    /**
     * set selected values to control
     * @param {string} containerId
     * @param {string} type
     * @param {string} value
     * @param {string} subType
     * @param {string} params
     * @private
     */
    var _setSelectedControls = function (containerId, type, value, subType, params) {
        var container = $('#' + containerId);
        _setSelectedControlsGivenContainer(container, type, value, subType, params);
    };

    /**
     * set selected values to control
     * @param container
     * @param {string} type
     * @param {string} value
     * @param {string} subType
     * @param {string} params
     * @private
     */
    var _setSelectedControlsGivenContainer = function (container, type, value, subType, params) {
        var control, text = '';
        switch (type) {
            //case "period":
            //    control = container.find("[inf-ctrl=" + type + "]").filter(":visible");
            //    var periods = control.find("[inf-ctrl-type=period]");
            //    control.find("li[inf-ctrl=period-cat]").each(function(){
            //            var El = $(this);
            //            El.removeClass('active');
            //            var key = El.find("[inf-ctrl-type=period-cat]").attr("inf-default-label");
            //            El.find("[inf-ctrl-lbl=period-cat]").attr("data-localize", key).html(infChart.manager.getLabel(key));
            //
            //        }
            //    );
            //    periods.removeClass('active');
            //    var periodEl = control.find("[inf-ctrl-type=period][inf-ctrl-value=" + value + "]"),
            //        labelKey = periodEl.attr("inf-default-label"),
            //        catEl = periodEl.closest("li[inf-ctrl=period-cat]").addClass('active');
            //
            //    var selectedPrdEl = control.find("[inf-ctrl-type=period][inf-ctrl-value=" + value + "]");
            //    selectedPrdEl.addClass('active');
            //    labelKey = selectedPrdEl.attr("inf-default-label");
            //    if(labelKey && catEl) {
            //        catEl.find("[inf-ctrl-lbl=period-cat]").attr("data-localize", labelKey).html(infChart.manager.getLabel(labelKey))
            //    }
            //    periods.find("[inf-ctrl-type=period][inf-ctrl-type=interval].selected").removeClass('selected');
            //    control.find("[inf-ctrl-type=period][inf-ctrl-value=" + value + "] [inf-ctrl-type=interval][inf-ctrl-type=interval][inf-ctrl-value=" + params + "]").addClass('selected');
            //    _setMobileSelectedPeriod(container, value);
            //    if (subType && params) {
            //        _setSelectedControlsGivenContainer(container, subType, params);
            //    }
            //    break;
            case "period":
                control = _getControlElement(container, type);
                var i = 0, len = control.length;
                for (i; i < len; i++) {
                    var p = $(control[i]);
                    _setSelectedValueInMultiOptionControlWithText(p, value);
                }
                if (subType && params) {
                    _setSelectedControlsGivenContainer(container, subType, params);
                }
                break;
            case 'interval':
                control = _getControlElement(container, type);
                var j = 0, lenj = control.length;
                for (j; j < lenj; j++) {
                    var c = $(control[j]);
                    _setSelectedValueInMultiOptionControlWithText(c, value);
                }
                break;
            case "full-screen":
                if (value) {
                    _setSelectedIconInMultiOptionControlWithIcon(_getControlElement(container, type), 'icon ico-screen-normal');
                } else {
                    _setSelectedIconInMultiOptionControlWithIcon(_getControlElement(container, type), 'icon ico-screen-full');
                }
                break;
            case "flags" :
                _setSelectedValuesInMultiOptionControlWithMultipleSelect(_getControlElement(container, type), value);
                break;
            case 'crosshair':
                _setSelectedValueInMultiOption(_getControlElement(container, type), value, value !== 'none');
                break;
            case "depth":
                _setSelectedValueInMultiOption(_getControlElement(container, type), value.side, value.show);
                break;
            case 'chartType':
            case 'grid':
                _setSelectedValueInMultiOptionControlWithIcon(_getControlElement(container, type), value, true);
                break;
            case "value":
                _setButtonStatus(_getControlElement(container, subType), value);
                break;
            case "comparison":
            case "indicator": 
                control = _getControlElement(container, type);
                value ? control.addClass('active') : control.removeClass('active');
                break;
            case 'tradingPanel':
            case 'rightPanel':
            case 'news':
            case "tooltip":
            case "navigator":
            case "last":
            case "preclose":
            case "minMax":
            case "orderBookHistory":
            case "volume":
            case "bidAskHistory":
            case "spread":
            case "undo":
            case "redo":
                _setButtonStatus(_getControlElement(container, type), value);
                break;
            default :
                break;
        }
    };

    /**
     * set default values to controllers
     * @param container
     * @param {object} properties
     * @private
     */
    var _setDefaultValues = function (container, properties) {
        _setSelectedControlsGivenContainer(container, "period", properties.period, "interval", properties.interval);
        _setSelectedControlsGivenContainer(container, "interval", properties.interval);
        _setSelectedControlsGivenContainer(container, "chartType", properties.type);
        _setSelectedControlsGivenContainer(container, "last", properties.last);
        _setSelectedControlsGivenContainer(container, "preclose", properties.preClose);
        _setSelectedControlsGivenContainer(container, "minMax", properties.minMax);
        _setSelectedControlsGivenContainer(container, "tooltip", properties.tooltip);
        _setSelectedControlsGivenContainer(container, "value", properties.isLog, "log");
        _setSelectedControlsGivenContainer(container, "value", properties.isPercent, "percent");
        _setSelectedControlsGivenContainer(container, "crosshair", properties.crosshair);
        _setSelectedControlsGivenContainer(container, "navigator", properties.navigator);
        _setSelectedControlsGivenContainer(container, "flags", properties.flags ? properties.flags : []);
        _setSelectedControlsGivenContainer(container, "grid", properties.grid);
        _setSelectedControlsGivenContainer(container, "orderBookHistory", properties.orderBookHistory);
        if (properties.depth) {
            _setSelectedControlsGivenContainer(container, "depth", properties.depth);
        }
    };

    var _setVisibility = function (containerId, type, value, subType, params) {
        var container = $('#' + containerId),
            width, el,
            isRemove = false,
            prevVisible;
        switch (type) {
            case 'tradingPanel':
            case 'rightPanel':
            case 'news':
            case "tooltip":
            case "navigator":
            case "last":
            case "preclose":
            case "minMax":
            case "orderBookHistory":
            case "volume":
            case "bidAskHistory":
            case "spread":
                el = _getControlElement(container, type);
                prevVisible = el.is(":visible");
                if (value) {
                    el.show();
                    if (!prevVisible) {
                        width = el.outerWidth(true);
                    }
                } else {
                    if (prevVisible) {
                        width = el.outerWidth(true);
                    }
                    el.hide();
                    isRemove = true;
                }
                break;
            default :
                break;
        }

        if (width) {
            var tb = el.closest("[inf-pnl]");
            infChart.structureManager.adjustFullWidth(tb[0], width, isRemove);
            infChart.structureManager.rearrangeUpperLayerToolbar(containerId, container[0]);
        }
    };

    //region multi

    /**
     * set selected icon to multi select using the selected value
     * used in chart types and grid types
     * @param control
     * @param {string} value
     * @param {boolean} isControlHighlight - contorol highligh or not 
     * @private
     */
    var _setSelectedValueInMultiOptionControlWithIcon = function (control, value, isControlHighlight) {
        _setSelectedIconInMultiOptionControlWithIcon(control, _getSelectedElementIconFromValue(control, value), isControlHighlight);
    };

    /**
     * set selected icon to multi select
     * @param control
     * @param {string} iconClass
     * @param {boolean} isControlHighlight - contorol highligh or not 
     * @private
     */
    var _setSelectedIconInMultiOptionControlWithIcon = function (control, iconClass, isControlHighlight) {
        if (!iconClass) {
            iconClass = control.find('> ul > li:first').attr('inf-ico');
        }
        control.find('i[rel="icon"]').removeClass().addClass(iconClass);
        if (isControlHighlight) {
            control.addClass('active');
        }
    };

    /**
     * set selected text to multi select
     * used in interval, period
     * can handle categorized option
     * @param control
     * @param {string} value
     * @param {boolean} enabled
     * @private
     */
    var _setSelectedValueInMultiOptionControlWithText = function (control, value, enabled) {
        var selectedElement = _getSelectedElementFromValue(control, value);
        if (selectedElement && selectedElement.length > 0) {
            var parent = selectedElement.parent('ul').parent('li');
            if (parent && parent.length > 0) {
                parent.find('a span[ctrl-role="text"]').html(selectedElement.text());
                if (typeof enabled === 'undefined' || enabled === true) {
                    parent.addClass('active');
                }
            } else {
                if (typeof enabled === 'undefined' || enabled === true) {
                    _getOptionElementsForMultiOptions(control).removeClass('active active-dim');
                    selectedElement.addClass('active');//for single
                }
            }
        } else {
            $.each(control.find('li.active'), function (i, v) {
                var e = $(v);
                e.removeClass('active active-dim');
                _setSelectedValueInMultiOptionControlWithText(control, _getValueFromAttribute(e.find('> ul > li:first')), false);//categorized
            });

        }
    };

    /**
     * set selected icon to multi select with status
     * @param control
     * @param {string} value
     * @param {boolean} enabled
     * @private
     */
    var _setSelectedValueInMultiOption = function (control, value, enabled) {
        _setSelectedValueInMultiOptionControlWithIcon(control, value);
        if (enabled) {
            control.addClass(selectedCSSClass);
            _getOptionElementsForMultiOptions(control).removeClass(selectedCSSClass);
            _getSelectedElementFromValue(control, value).addClass(selectedCSSClass);
        } else {
            control.removeClass(selectedCSSClass);
        }
    };

    /**
     * set multiple values to multi select
     * used in flags
     * @param control
     * @param {string} values
     * @private
     */
    var _setSelectedValuesInMultiOptionControlWithMultipleSelect = function (control, values) {
        _getOptionElementsForMultiOptions(control).removeClass(selectedCSSClass);
        $.each(values, function (key, val) {
            _getSelectedElementFromValue(control, val).addClass(selectedCSSClass);
        });
    };

    //endregion

    /**
     * set button status
     * @param control
     * @param {boolean} status
     * @private
     */
    var _setButtonStatus = function (control, status) {
        if (status) {
            control.attr("inf-status", "on");
            control.addClass(selectedCSSClass);
        } else {
            control.attr("inf-status", "off");
            control.removeClass(selectedCSSClass);
        }
    };

    //endregion

    //region HTML

    //var _setTradingToolbarHTML = function (element, settings) {
    //    var container = element.find('div[inf-pnl="tb-trading"]');
    //    if (settings.tradingTb && settings.tradingTb.length > 0) {
    //        var html = '';
    //        infChart.util.forEach(settings.tradingTb, function (i, key) {
    //            html += _getOptionHtml(key, settings.config[key], settings, false);
    //        });
    //        container.addClass('chart-buy-sell-button clearfix');
    //        container.html(html);
    //    }
    //    if (!settings.trading) {
    //        container.hide();
    //    }
    //};

    var _setMobileToolbarHtml = function (element, settings) {
        if (settings.mobile && settings && settings.mobileTb && settings.mobileTb.length > 0) {
            var html = '', container = element.find('div[inf-pnl="tb-mobile"]');
            infChart.util.forEach(settings.mobileTb, function (i, key) {
                html += _getMobileOptionHtml(key, settings.config[key], settings);
            });
            container.addClass('chart-controllers-mobile clearfix');
            container.html(html);
        }
    };

    var _setUpperToolbarHtml = function (element, settings) {
        var container = element.find('div[inf-pnl="tb-upper"]');
        if (settings && settings.upper && settings.upperTb && settings.upperTb.length > 0) {
            var html = '';
            infChart.util.forEach(settings.upperTb, function (i, key) {
                html += _getOptionHtml(key, settings.config[key], settings, true);
            });
            container.addClass('navbar-header ad-chart-navbar-header');
            container.html(html);
        }
        if (!settings.upper) {
            container.hide();
        }
    };

    var _setTopToolbarHtml = function (element, settings) {
        var container = element.find('div[inf-pnl="tb-top"]');
        if (settings && settings.top && settings.topTb && settings.topTb.length > 0) {
            var html = '<ul class="nav navbar-nav chart-settings">';
            infChart.util.forEach(settings.topTb, function (i, key) {
                html += _getOptionHtml(key, settings.config[key], settings, false);
            });
            html += '</ul>';
            container.html(html);
        }
        if (!settings.top) {
            container.hide();
        }
    };

    var _setDrawingToolbarHtml = function (element, settings) {
        var container = element.find('div[inf-pnl="tb-left"]');
        if (settings && settings.leftTb && settings.leftTb.length > 0) {
            var html = '<div inf-container="drawing_settings"></div>';
            html += '<ul class="nav navbar-nav2 chart-drawing">';
            infChart.util.forEach(settings.leftTb, function (i, key) {
                html += _getDrawing(settings.config[key]);
            });
            html += '</ul>';
            container.addClass('chart-left-toolbar');
            container.html(html);
        }
        if (!settings.left) {
            container.hide();
        }
    };

    var _setRightToolbarHtml = function (element, settings, uniqueId, isDisableDrawingSettingsPanel) {
        var container = element.find('div[inf-pnl="tb-right"]');
        if (settings && settings.right && settings.rightTb && settings.rightTb.length > 0) {
            var rightTab = settings.rightTb;
            var html = '';

            var tabsPanel = '<span class="right-panel-close" inf-ctrl="pnlClose"><i class="fa fa-times"></i></span><ul class="nav nav-tabs">',
                tabPanes = '<div class="tab-content" color-picker-container>',
                tabId, tabCount = 0;
            if (isDisableDrawingSettingsPanel && rightTab.indexOf("drawingToolPanelView") > -1) {
                rightTab.splice(rightTab.indexOf("drawingToolPanelView"), 1);
            }
            infChart.util.forEach(rightTab, function (i, key) {
                tabId = uniqueId + '_' + key;
                tabsPanel += '<li role="presentation" tab-id="' + tabId + '"' + (tabCount === 0 ? 'class="active"' : '') + '>' +
                    '<a data-toggle="tab" data-target="div[rel=' + tabId + ']">' +
                    '<i class="' + settings.config[key].icon + '"></i>' +
                    '<span class="rp-tab-name" data-localize="' + settings.config[key].label + '">' + infChart.manager.getLabel(settings.config[key].label) + '</span>' +
                    '</a>' +
                    '</li>';
                tabPanes += '<div class="tab-pane' + (tabCount === 0 ? ' active' : '') + '" rel="' + tabId + '">' + _getOptionHtml(key, settings.config[key], settings, false, null) + '</div>';
                tabCount++;
            });

            tabsPanel += '</ul>';
            tabPanes += '</div>';
            html += tabsPanel + tabPanes;

            container.addClass('chart-right-panel');
            container.html(html);
        }
        container.hide();//hidden by default
    };

    //endregion

    // var _getDrawing = function (setting) {
    //     var span, visibleSpan, visibleShape, visibleSubType, category, options, link, linkClass, label = '';
    //     if (setting.options && setting.options.length > 0) {
    //         options = '<ul class="dropdown-menu" role="menu">';
    //         linkClass = 'dropdown-option';
    //         infChart.util.forEach(setting.options, function (i, obj) {
    //             span = '<span class="' + obj.cls + '"' + (obj.style ? 'style="' + obj.style + '"' : '' ) + '></span>';
    //             label = obj.label ? obj.label : "";
    //             if (obj.active === true) {
    //                 visibleSpan = span;
    //                 visibleShape = obj.shape;
    //                 visibleSubType = obj.subType;
    //                 options += '<li><a target="_self"  class="active" inf-ctrl="' + setting.role + '" inf-ctrl-shape="' + obj.shape + '" inf-ctrl-subType="' + obj.subType + '" drawing-cat="' + setting.cat + '" title="' + label + '">' + span + '</a></li>';
    //             } else {
    //                 options += '<li><a target="_self"  inf-ctrl="' + setting.role + '" inf-ctrl-shape="' + obj.shape + '" inf-ctrl-subType="' + obj.subType + '" drawing-cat="' + setting.cat + '" title="' + label + '"><span class="' + obj.cls + '"></span></a></li>';
    //             }
    //         });
    //         options += '</ul>';
    //     } else {
    //         options = '';
    //         if (setting.role === 'drawing' && setting.shape) {
    //             visibleShape = setting.shape;
    //         }
    //         if (setting.role === 'drawing' && setting.subType) {
    //             visibleSubType = setting.subType;
    //         }
    //         visibleSpan = '<span class="' + setting.cls + '"' + (setting.style ? 'style="' + setting.style + '"' : '' ) + '></span>';
    //     }
    //     if (setting.active === true) {
    //         linkClass = linkClass ? linkClass + ' active' : 'active';
    //     }
    //     label = setting.label ? setting.label : "";
    //     if (setting.role === 'drawing') {

    //         link = '<a  target="_self"  inf-ctrl="drawCat" inf-ctrl-role="' + setting.role + '" ' + ' draw-cat="' + setting.cat + '" inf-ctrl-shape="' + visibleShape + '"' +
    //             (visibleSubType ? ' inf-ctrl-subType="' + visibleSubType + '"' : '') + '  role="button" ' +
    //             (linkClass ? ' class="' + linkClass + '"' : '') + '   title="' + label + '" >' + visibleSpan + '</a>';
    //     } else {
    //         link = '<a target="_self"  inf-ctrl="drawCat" inf-ctrl-role="' + setting.role + '" ' + '" role="button" ' +
    //             (linkClass ? ' class="' + linkClass + '"' : '') + '  title="' + label + '" >' + visibleSpan + '</a>';
    //     }
    //     return '<li class="dropdown">' + link + options + '</li>';
    // };

    /**
     * set toolbar HTML
     * @param element chart container
     * @param {object} properties toolbarProperties
     * @param {string} uniqueId container id
     * @param {object} config - chart config
     * @returns {string}
     * @private
     */
    var _setHTML = function (element, properties, uniqueId, config) {
        var isDisableDrawingSettingsPanel = config && config.disableDrawingSettingsPanel ? config.disableDrawingSettingsPanel : false;
        // _setTradingToolbarHTML(element, settings);
        properties.mobile && _setMobileToolbarHtml(element, properties);
        properties.upper && _setUpperToolbarHtml(element, properties);
        properties.top && _setTopToolbarHtml(element, properties);
        // _setDrawingToolbarHtml(element, settings);
        properties.right && _setRightToolbarHtml(element, properties, uniqueId, isDisableDrawingSettingsPanel);
    };

    //region mobile

    var _getMobileOptionHtml = function (key, config, allSettings) {
        var html, label;
        switch (key) {
            case 'period':
                html = _getMobilePeriodHTML(config, allSettings);
                break;
            case "interval":
                html = _getMobileIntervalHTML(config);
                break;
            case "chartType" :
                html = _getMobileChartTypeHTML(config);
                break;
            case "indicator":
                html = _getMobileIndicatorsHTML(config);
                break;
            default :
                html = '';
                break;
        }
        return html;
    };

    /**
     * interval sub menu
     * @param config options to add
     * @returns {*}
     * @private
     */
    var _getMobileIntervalHTML = function (config) {
        var html;
        if (config && config.options && config.options.length > 0) {
            if (config.options.length === 1) {
                var obj = config.options[0];
                html = '<li inf-ctrl-value="' + obj.key + '" inf-ctrl-type="interval" ><a class="selected-el" target="_self"  data-localize="' + obj.shortDesc + '" >' + obj.shortDesc + '</a></li>';
            } else {
                var label = "label.periodType";
                html = '<ul class="control-item intervals">' +
                    '<li class="dropdown" inf-ctrl="interval">' +
                    '<a target="_self"  class="dropdown-toggle btn"  role="button" aria-expanded="false" title="' + label + '"><span cntrl-role="text" data-localize="label.interval">Interval</span><span class="caret"></span></a>' +
                    '<ul class="dropdown-menu" role="menu">';

                infChart.util.forEach(config.options, function (i, obj) {
                    html += '<li inf-ctrl-value="' + obj.key + '><a target="_self"  data-localize="' + obj.shortLabel + '" >' + obj.shortDesc + '</a></li>';
                });
                html += '</ul>' +
                    '</li>' +
                    '</ul>';
            }
        } else {
            html = '';
        }
        return html;
    };

    var _getMobileIndicatorsHTML = function (config) {
        var html;
        if (config && config.options && config.options.length > 0) {

            var label = "label.addIndicator";
            html = '<ul class="control-item indicators">' +
                '<li class="dropdown" inf-ctrl="indicator">' +
                '<a target="_self"  class="dropdown-toggle btn"  role="button" aria-expanded="false" title="' + label + '"><span ><i class="icon ico-graph-trend"></i></span> <span class="caret"></span></a>' +
                '<ul class="dropdown-menu" role="menu">';
            html += '<li ><div class="input-wrap"><input type="text" inf-ctrl-ind="search" /><div></li>';

            infChart.util.forEach(config.options, function (i, obj) {
                html += '<li inf-ctrl-value="' + obj.key + '"><a target="_self"  data-localize="' + obj.label + '" >' + obj.desc + '</a></li>';
            });
            html += '</ul>' +
                '</li>' +
                '</ul>';
        } else {
            html = '';
        }
        return html;
    };

    var _getMobileChartTypeHTML = function (config) {
        var html;
        if (config && config.options && config.options.length > 0) {
            var label = "label.chartType";
            html = '<ul class="control-item chart-types">' +
                '<li class="dropdown" inf-ctrl="chartType" >' +
                '<a target="_self"  class="dropdown-toggle btn"  role="button" aria-expanded="false" title="' + label + '">' +
                '<span cntrl-role="text" class="icon"  ></span><span class="caret"></span></a>' +
                '<ul class="ch_ul charttype dropdown-menu" role="menu">';

            infChart.util.forEach(config.options, function (i, obj) {
                label = obj.label;
                var cls = obj.ico ? obj.ico : 'ico-chart-' + obj.key;
                html += '<li inf-ctrl-value="' + obj.key + '"  inf-ctrl-type="charttype" class="icon ' + cls + '" title="' + label + '" inf-ico="' + cls + '" ></li>';
            });
            html += '</ul>' +
                '</li>' +
                '</ul>';
        } else {
            html = '';
        }
        return html;
    };

    var _getMobilePeriodHTML = function (config, setting) {
        var periodHtml;
        if (config && config.options && config.options.length > 0) {
            var intervalOpt = {};
            if (setting && setting.config && setting.config.interval && setting.config.interval.options && setting.config.interval.options.length > 0) {
                infChart.util.forEach(setting.config.interval.options, function (i, val) {
                    intervalOpt[val.key] = val;
                });
            }
            periodHtml = '<div class="control-item dropdown period" inf-ctrl="period">' +
                '<button class="btn  dropdown-toggle" type="button" aria-haspopup="true" aria-expanded="true">' +
                '<span inf-period-text="selected" >1Y</span>' +
                '<span class="caret"></span>' +
                '</button>' +
                '<ul class="dropdown-menu" >';

            var displyArr = (config.display) ? config.display.split(",") : undefined;
            infChart.util.forEach(config.options, function (i, obj) {
                if (!displyArr || displyArr.indexOf(obj.key) >= 0) {
                    periodHtml += '<li inf-ctrl-value="' + obj.key + '" ' + _getCtrlItemHTML("period") + ' inf-ctrl-type="period" >' +

                        '<a target="_self" >';
                    periodHtml += '<span data-localize="' + obj.shortLabel + '" class="lbl-short">' + obj.shortDesc + '</span>';

                    periodHtml += '</a>';
                    periodHtml += '</li>';
                }
            });
            periodHtml += '</ul></div>';
        } else {
            periodHtml = ''
        }
        return periodHtml;
    };

    //endregion

    // var _getButtonHtml = function (ctrlType, label, desc, value, btnClass, iconClass) {
    //     return '<button class="' + btnClass + '"' + _getCtrlTypeHtml(ctrlType) + _getCtrlValueHtml(value) + '>' +
    //         '<div class="bs-value" inf-ref="' + ctrlType + '"></div>' +
    //         '<div class="bs-text"><i class="' + iconClass + '"></i data-localize="' + label + '">' + desc + '</div>' +//
    //         '</button>';
    // };

    /**
     *
     * @param key
     * @param config
     * @param allSettings
     * @param displayHorizontal
     * @param type TODO :: remove type is not necessary
     * @returns {*}
     * @private
     */
    var _getOptionHtml = function (key, config, allSettings, displayHorizontal, type, isOptionMenu) {
        var html, label;
        switch (key) {
            case 'adv':
                html = '<ul class="nav navbar-nav FL"><li top-tt-item="' + (type || "l") + '" inf-ctrl="adv" inf-status="off" aria-hidden="true" role="button" aria-expanded="false"><a class="advance_chart_b" target="_self" ></a></li></ul>';
                break;
            case "zeroPoint":
                html = '<li class="icon ico-chart7 just_ico" aria-hidden="true" role="button" aria-expanded="false">   </li>';
                break;
            case 'settings':
                html = '<li class="dropdown"><a target="_self" class="dropdown-toggle ico-gear singleicon" role="button" aria-expanded="false"></a></li>';
                break;
            case "comparison" :
                html = _getCompareSymbolsHTML(key, 'label.comparison', 'Comparison', config, type);
                break;
            case "indicator"://indicator dropdown in top toolbar
                html = _getIndicatorsHTML(key, 'label.addIndicator', 'Indicators', config.options, type);
                break;
            case "rightPanel"://show/hide indicator panel view
                html = _getSingleOptionHTMLWithStatus(key, 'label.toggleRightPanel', 'fa fa-wrench', false, displayHorizontal, type, isOptionMenu? "top" : "bottom-left");
                break;
            case "indicatorPanelView"://indicator panel view
                html = _getIndicatorPanelHTML(key, allSettings.config['indicator']);
                break;
            case "symbolSettingsPanelView"://symbol settings panel view
                html = '<div inf-container="symbol_settings_panel" class="panel-group"></div>';
                break;
            case "drawingToolPanelView"://drawing tool settings panel view
                html = '<div inf-container="drawing_tools_panel" class="panel-group"></div>';
                break;
            case "period":
                html = _getMultiOptionWithCategoryWithHorizontalDropdownHTML(key, 'label.periodType', config, type);
                break;
            case "crosshair":
                html = _getMultiOptionHTML(key, 'label.crosshair', 'Crosshair', config.options, 'crosshair-type ch_ul', displayHorizontal, type);
                break;
            case "print":
                html = _getMultiOptionHTML(key, 'label.print', 'Print', config.options, 'print-type ch_ul', displayHorizontal, type);
                break;
            case 'depth':
                html = _getMultiOptionHTML(key, 'label.bookVolume', 'Book Volume', config.options, isOptionMenu ? 'ch_ul book-vol-options' : 'book-vol ch_ul', displayHorizontal, type, "bottom");
                break;
            case 'flags':
                html = _getMultiOptionDropdownHTMLWithFixedTitle(key, 'label.flagsDesc', "Flags", config.options, type);
                break;
            case 'file':
                html = _getMultiOptionDropdownHTMLWithFixedTitle(key, 'label.file', "File", config.options, type);
                break;
            case 'periodD':
                html = _getMultiOptionWithHorizontalDropdownHTML('period', 'label.periodType', allSettings.config['period'], type);
                break;
            case 'intervalD':
                html = _getMultiOptionWithHorizontalDropdownHTML('interval', 'label.interval', allSettings.config['interval'], type);
                break;
            case "interval":
                if (config.layout === "button") {
                    html = _getMultiOptionWithCategoryWithHorizontalDropdownHTML(key, 'label.interval', config, type);
                } else {
                    html = _getMultiOptionWithHorizontalDropdownHTML(key, 'label.interval', config, type);
                }
                break;
            case "chartType":
                html = _getMultiOptionWithDropdownHTML(key, 'label.chartType', 'Chart Type', config.options, 'charttype ch_ul', displayHorizontal, type, allSettings.verticalDropDown, isOptionMenu);
                break;
            case 'grid':
                html = _getMultiOptionWithDropdownHTML(key, 'label.gridType', 'Grid Type', config.options, 'gridtype ch_ul', displayHorizontal, type, allSettings.verticalDropDown);
                break;
            case "volume":
                html = _getSingleOptionHTMLWithStatusNText(key, 'label.indicatorDesc.VOLUME', 'label.showHideVolume', 'icon ico-chart-bar', 'VOLUME', false, displayHorizontal, type);
                break;
            case "spread":
                html = _getSingleOptionHTMLWithStatusNTextNCompactMode(key, 'label.indicatorDesc.SPREAD', 'label.showHideSpread', 'icon ico-chart-spread', 'SPREAD', false, displayHorizontal, type, true, "bottom-left");
                break;
            case "bidAskHistory":
                html = '<li class="just_ico show-bid-ask" inf-ctrl="bidAskHistory" ' + _getToolTipAttributes("Show/Hide Bid Ask History", "bottom-left") + ' inf-ctrl-value="BAH" role="button"><span class="bid-text">Bid </span><span class="ask-text" >Ask</span></li>';
                if (config && config.layout === 'button') {
                    html = '<ul class="show-bid-ask-wrapper">' + html + '</ul>';
                }
                break;
            case "value":
                html = _getSingleOptionHTMLWithStatus('percent', "label.relYaxis", 'icon ico-prec', false, displayHorizontal, type);
                html += _getSingleOptionHTMLWithStatus('log', "label.logYaxis", 'icon ico-log', false, displayHorizontal, type);
                break;
            case "zoom" :
                html = _getSingleOptionHTMLWithValue('zoom', "label.zoomIn", 'icon ico-zoom-in-1', 'in', displayHorizontal, type);
                html += _getSingleOptionHTMLWithValue('zoom', "label.zoomOut", 'icon ico-zoom-out-1', 'out', displayHorizontal, type);
                break;
            case 'reset':
                html = _getSingleOptionHTML(key, config.title, config.icon, (config.displayHorizontal) ? config.displayHorizontal : displayHorizontal, type, isOptionMenu? "top" : "bottom-left");
                break;
            case "full-screen":
                html = _getSingleOptionHTML(key, "label.fullScreen", 'icon ico-screen-full', displayHorizontal, type, isOptionMenu ? "top" : "bottom");
                break;
            case "navigator":
                html = _getSingleOptionHTMLWithStatus(key, 'label.showHistory', 'icon ico-nav-off', true, displayHorizontal, type);
                break;
            case "tooltip":
                html = _getSingleOptionHTMLWithStatus(key, 'label.showDataInfo', 'icon ico-data', true, displayHorizontal, type);
                break;
            case "trading":
                html = '<div inf-container="trading_panel"></div>';
                break;
            case "tradingPanel":
                html = _getSingleOptionHTMLWithStatus(key, 'label.showTrading', 'fa fa-wrench', false, displayHorizontal, type);
                break;
            case "news":
                html = _getSingleOptionHTMLWithStatus(key, 'label.showNews', 'icon ico-xnews', false, displayHorizontal, type);
                break;
            case "last":
                html = _getSingleOptionHTMLWithStatus(key, 'label.showLast', 'icon ico-chart8', false, displayHorizontal, type);
                break;
            case "preclose":
                html = _getSingleOptionHTMLWithStatus(key, 'label.showPrevClose', 'icon ico-prev', false, displayHorizontal, type);
                break;
            case "minMax":
                html = _getSingleOptionHTMLWithStatus(key, 'label.showMinMax', 'icon ico-min-max', false, displayHorizontal, type);
                break;
            case 'orderBookHistory':
                html = _getSingleOptionHTMLWithStatus(key, 'label.toggleOrderBookHistory', 'icon ico-orderbook-history', true, displayHorizontal, type);
                break;
            case 'optionsDropDown':
                html = _getOptionsHTML(config, key, allSettings, type);
                break;
            case 'buy':
            case 'sell':
                html = infChart.structureManager.trading.getTradingButtonHTML(config.ctrl, config.locLabel, config.btnText, config.key, config.btnClass, config.iconClass, true);
                break;
            case 'tradeControlCompact':
                html = _getMultiOptionDropdownHTMLWithCustomInnerHTML(key, 'label.trades', 'Trades', config, type);
                break;
            case "pinInterval":
                html = _getSingleOptionHTMLWithStatus(key, 'label.pinInterval', 'icon ico-data', true, displayHorizontal, type);
                break;
            default :
                if (config.title && config.icon) {
                    var ttDirOnInOptionMenu = config.optionMenuTooltipDir;
                    var ttDirDefault = config.tooltipDir;
                    html = _getSingleOptionHTML(key, config.title, config.icon, (config.displayHorizontal) ? config.displayHorizontal : displayHorizontal, type, isOptionMenu ? ttDirOnInOptionMenu : ttDirDefault, config.showIconOnly);
                } else {
                    html = '';
                }
                break;
        }
        return html;
    };

    /**
     * html for indicator panel
     * @param ctrlType
     * @param config
     * @returns {string}
     * @private
     */
    var _getIndicatorPanelHTML = function (ctrlType, config) {
        //todo : panels should move to structure
        return '<div inf-container="indicator_panel" class="panel-group">' +
            '<div class="panel panel-default" inf-ctrl="indicator">' +
            '<div class="panel-heading">' +
            '<h4 class="panel-title">' +
            '<a role="button" data-toggle="collapse" aria-expanded="true">' +
            '<span class="title-contents">Add Indicators</span><i class="fa fa-caret-down" aria-hidden="true"></i>' +
            '</a>' +
            '</h4>' +
            '</div>' +
            '<div class="panel-collapse collapse">' +
            '<div class="panel-body indicators-dropdown-wrapper">' +
            '<ul class="dropdown-menu indicators-dropdown" role="menu">' +
            '<li><input type="text" inf-ctrl-ind="search" class="symbol-search-input"></li>' +
            _getHorizontalDropdownOptionsHTML(config.options) +
            '</ul>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '<div class="panel panel-default">' +
            '<div class="panel-heading panel-main-heading">' +
            '<h4 class="panel-title">' +
            'Added Indicators' +
            '</h4>' +
            '</div>' +
            '</div>' +
            '</div>';
    };

    /**
     * indicator sub menu
     * @param {string} ctrlType
     * @param {string} label
     * @param {string} desc
     * @param {Array} options
     * @param type ???
     * @returns {string}
     * @private
     */
    var _getIndicatorsHTML = function (ctrlType, label, desc, options, type) {
        var html;
        if (options && options.length > 0) {
            var ctrlTypeHtml = infChart.structureManager.common.getCtrlTypeHtml(ctrlType);
            html =
                '<li class="dropdown"' + _getTopttItemHtml(type) + ctrlTypeHtml + '>' +
                '<a target="_self" class="dropdown-toggle" role="button" aria-expanded="false" ' + _getToolTipAttributes(label) + '>' +
                '<span data-localize="' + label + '" >' + desc + '</span>' +
                '<span class="caret"></span>' +
                '</a>' +
                '<ul class="dropdown-menu indicators-dropdown" role="menu" inf-ctrl="dropdownMenu">';
            html += '<li class="indicator-search-box"><div class="input-wrap"><input type="text" inf-ctrl-ind="search" /></div></li>';
            html += '<li class="indicator-list" inf-ctrl="indicatorList"><ul>';
            html += _getHorizontalDropdownOptionsHTML(options);
            html += '</ul></li></ul></li>';
        } else {
            html = '';
        }
        return html;
    };

    /**
     * comparison sub menu
     * @param {string} ctrlType
     * @param {string} label
     * @param {string} desc
     * @param config symbols to add
     * @param type ??
     * @returns {string}
     * @private
     */
    var _getCompareSymbolsHTML = function (ctrlType, label, desc, config, type) {
        var html;
        var ctrlTypeHtml = infChart.structureManager.common.getCtrlTypeHtml(ctrlType);
        if (config) {
            html = '<li class="dropdown"' + _getTopttItemHtml(type) + ctrlTypeHtml + '>' +
                '<a target="_self" class="dropdown-toggle" role="button" aria-expanded="false" ' + _getToolTipAttributes("label.addComparisons") + '>' +
                '<span data-localize="' + label + '">' + desc + '</span><span class="caret"></span>' +
                '</a>' +
                '<ul class="dropdown-menu" role="menu">';
            if (config.symbolSearch) {
                html += '<li><input type="text" data-inf-ctrl-rel="symbolSearch"></li>';
                if (config.symbolSearch.options.appendTo) {
                    html += '<li class="symbol-search-dropdown-wrapper" id="' + config.symbolSearch.options.appendTo.substring(1) + '"></li>'
                }
            } else {
                var options = [],
                    count = 0;
                infChart.util.forEach(config.options, function (i, symbol) {
                    options[count] = {
                        key: encodeURI(JSON.stringify(symbol)),
                        desc: symbol.symbolDesc || symbol.name,
                        label: symbol.symbolDesc || symbol.name
                    };
                    count++;
                });
                html += _getHorizontalDropdownOptionsHTML(options);
            }
            html += '</ul></li>';
        }

        return html;
    };

    var _getOptionsHTML = function (config, key, allSettings, type) {
        var html =
            '<li class="dropdown inf-options" top-tt-item="' + (type || "l") + '">' +
            '<a class="dropdown-toggle">Options<b class="caret"></b></a>' +
            '<ul class="dropdown-menu">';

        infChart.util.forEach(config.options, function (i, option) {
            html += _getOptionHtml(option, allSettings.config[option], allSettings, true, type, true);
        });
        html += '</ul></li>';
        return html;
    };

    /**
     *
     * @param {string} ctrlType
     * @param {string} label
     * @param {toolbarConfig} config
     * @param {string} type
     * @returns {string}
     * @private
     */
    var _getMultiOptionWithCategoryWithHorizontalDropdownHTML = function (ctrlType, label, config, type) {
        var ctrlTypeHtml = infChart.structureManager.common.getCtrlTypeHtml(ctrlType);
        var html = '<ul class="nav navbar-nav ' + ctrlType + '"' + ctrlTypeHtml + '>';
        if (config.categorized) {
            var categories = {};
            infChart.util.forEach(config.options, function (i, option) {
                if (!categories[option.category]) {
                    categories[option.category] = [];
                }
                categories[option.category].xPush(option);
            });
            for (var category in categories) {
                if (categories.hasOwnProperty(category)) {
                    var categoryOptions = {
                        'options': categories[category],
                        'shortLabel': config.shortLabel,
                        'display': config.display
                    };
                    html += _getMultiOptionWithHorizontalDropdownHTML(category, config.categoryLabelPrefix + category, categoryOptions, type);
                }
            }
        } else {
            var displayOptions, itemCount = 0;
            if (config.display) {
                displayOptions = config.display.split(',');
            }
            infChart.util.forEach(config.options, function (i, option) {
                if (!displayOptions || displayOptions.indexOf(option.key) > -1) {
                    var lbl = config.shortLabel && option.shortLabel ? option.shortLabel : option.label;
                    html +=
                        '<li class="just_ico"' +
                        _getTopttItemHtml(type) +
                        _getCtrlItemHTML(ctrlType) +
                        infChart.structureManager.common.getCtrlValueHtml(option.key) +
                        '>' +
                        '<a target="_self" role="button" ' + _getToolTipAttributes(option.desc, itemCount ? "bottom" : "bottom-right") + ' data-localize="' + lbl + '"></a>' +
                        '</li>';
                    itemCount++;
                }
            });
        }
        html += '</ul>';
        return html;
    };

    //region single option

    /**
     * single element with on/off status
     * used for navigator, last, previous close, min max, tooltip, news, orderBookHistory, tradingPanel
     * @param {string} ctrlType
     * @param {string} label
     * @param {string} iconClass
     * @param {boolean} selected
     * @param {boolean} displayHorizontal
     * @param {string} type - ??
     * @returns {string}
     * @private
     */
    var _getSingleOptionHTMLWithStatus = function (ctrlType, label, iconClass, selected, displayHorizontal, type, tooltipDir) {
        return '<li class="just_ico ' + (selected ? selectedCSSClass : '') + (!displayHorizontal ? ' compact-hide' : '') + '" ' +
            _getTopttItemHtml(type) +
            infChart.structureManager.common.getCtrlTypeHtml(ctrlType) +
            _getCtrlStatusHtml(selected) +
            _getToolTipAttributes(label, tooltipDir) +
            'role="button">' + _getInnerHtmlForLI(label, iconClass, displayHorizontal) + '</li>';
    };

    /**
     * single element with on/off status and custom class
     * used for navigator, last, previous close, min max, tooltip, news, orderBookHistory, tradingPanel
     * @param {string} ctrlType
     * @param {string} label
     * @param {string} iconClass
     * @param {boolean} selected
     * @param {boolean} displayHorizontal
     * @param {string} type - ??
     * @param {string} customClasses
     * @returns {string}
     * @private
     */
    var _getSingleOptionHTMLWithStatusAndCustomClasses = function (ctrlType, label, iconClass, selected, displayHorizontal, type, customClasses) {
        return '<li class="just_ico ' + (selected ? selectedCSSClass : '') + (' ' + customClasses) + '" ' +
            _getTopttItemHtml(type) +
            infChart.structureManager.common.getCtrlTypeHtml(ctrlType) +
            _getCtrlStatusHtml(selected) +
            'title="' + label + '" ' +
            'role="button">' + _getInnerHtmlForLI(label, iconClass, displayHorizontal) + '</li>';
    };

    /**
     * single element with value
     * used zoom in, zoom out
     * @param {string} ctrlType
     * @param {string} label
     * @param {string} iconClass
     * @param {string} value
     * @param {boolean} displayHorizontal
     * @param {string} type - ??
     * @returns {string}
     * @private
     */
    var _getSingleOptionHTMLWithValue = function (ctrlType, label, iconClass, value, displayHorizontal, type) {
        return '<li class="just_ico' + (!displayHorizontal ? ' compact-hide' : '') + '" ' +
            _getTopttItemHtml(type) +
            infChart.structureManager.common.getCtrlTypeHtml(ctrlType) +
            infChart.structureManager.common.getCtrlValueHtml(value) +
            _getToolTipAttributes(label) +
            'role="button">' + _getInnerHtmlForLI(label, iconClass, displayHorizontal) + '</li>';
    };

    /**
     * single element
     * @param {string} ctrlType - key
     * @param {string} label - button label
     * @param {string} iconClass - button icon class
     * @param {boolean} displayHorizontal - if false then hide in compact mode
     * @param {string} type - ??
     * @param {tooltipDir} tooltipDir - tooltip direction
     * @param {boolean} showIconOnly - true if show icon only
     * @returns {string} option HTML
     * @private
     */
    var _getSingleOptionHTML = function (ctrlType, label, iconClass, displayHorizontal, type, tooltipDir, showIconOnly) {
        return '<li class="just_ico' + (!displayHorizontal ? ' compact-hide' : '') + '"' +
            _getTopttItemHtml(type) +
            infChart.structureManager.common.getCtrlTypeHtml(ctrlType) +
            _getToolTipAttributes(label, tooltipDir) +
            'role="button">' + _getInnerHtmlForLI(label, iconClass, displayHorizontal, showIconOnly) + '</li>';
    };

    /**
     * single element without icon
     * used for volume
     * @param {string} ctrlType
     * @param {string} label
     * @param {string} title
     * @param {string} iconClass
     * @param {string} value
     * @param {boolean} selected
     * @param {boolean} displayHorizontal
     * @param {string} type - ??
     * @returns {string}
     * @private
     */
    var _getSingleOptionHTMLWithStatusNText = function (ctrlType, label, title, iconClass, value, selected, displayHorizontal, type) {
        return '<li class="just_ico ' + (selected ? selectedCSSClass : '') + (!displayHorizontal ? ' compact-hide' : '') + '"' +
            _getTopttItemHtml(type) +
            infChart.structureManager.common.getCtrlTypeHtml(ctrlType) +
            infChart.structureManager.common.getCtrlValueHtml(value) +
            _getCtrlStatusHtml(selected) +
            _getToolTipAttributes(title) +
            '><a target="_self" role="button">' + ( displayHorizontal ? '<i class="' + iconClass + '"></i>' : '' ) + '<span data-localize="' + label + '"></span></a>' +
            '</li>';
    };

    /**
     * single element without icon and not hide in compact mode
     * used for spread
     * @param {string} ctrlType
     * @param {string} label
     * @param {string} title
     * @param {string} iconClass
     * @param {string} value
     * @param {boolean} selected
     * @param {boolean} displayHorizontal
     * @param {string} type - ??
     * @param {string} hideInitially
     * @param {string} tooltipDir
     * @param {string} hideInitially
     * @returns {string}
     * @private
     */
    var _getSingleOptionHTMLWithStatusNTextNCompactMode = function (ctrlType, label, title, iconClass, value, selected, displayHorizontal, type, hideInitially, tooltipDir) {
        var display = hideInitially ? ' style="display:none" ' : '';
        return '<li class="just_ico ' + (selected ? selectedCSSClass : '') + '"' + display +
            _getTopttItemHtml(type) +
            infChart.structureManager.common.getCtrlTypeHtml(ctrlType) +
            infChart.structureManager.common.getCtrlValueHtml(value) +
            _getCtrlStatusHtml(selected) +
            '><a target="_self" role="button">' + (displayHorizontal ? '<i class="' + iconClass + '"></i>' : '') + '<span ' + _getToolTipAttributes(title, tooltipDir) + ' data-localize="' + label + '"></span></a>' +
            '</li>';
    };

    /**
     * get inner html for li element in toolbar
     * @param {string} label - button label
     * @param {string} iconClass - icon class
     * @param {boolean} displayHorizontal - if true then show the button label
     * @param {boolean} showIconOnly - true if show icon only
     * @returns 
     */
    var _getInnerHtmlForLI = function (label, iconClass, displayHorizontal, showIconOnly) {
        var innerHtml, iconHtml = '';
        if (iconClass) {
            iconHtml = '<i rel="icon" class="' + iconClass + '"></i>';
        }
        if (displayHorizontal) {
            innerHtml = showIconOnly ? iconHtml : '<a>' + iconHtml + '<span data-localize="' + label + '"></span></a>';
        } else {
            innerHtml = iconHtml;
        }
        return innerHtml;
    };

    //endregion

    //region multi options

    /**
     * multi option element without caret
     * used by cross-hair, print, depth
     * @param {string} ctrlType
     * @param {string} label
     * @param {string} desc
     * @param {Array<object>} options
     * @param {string} optionsUlClass
     * @param {boolean} displayHorizontal
     * @param {string} type - ??
     * @returns {string}
     * @private
     */
    var _getMultiOptionHTML = function (ctrlType, label, desc, options, optionsUlClass, displayHorizontal, type, ttDir) {
        var html = '';
        if (options && options.length > 0) {
            var innerHtml;
            if (displayHorizontal) {
                innerHtml = '<a target="_self" class="dropdown-option" role="button" ' +  _getCtrlTooltipHtml(label) + '><i rel="icon"></i><span data-localize="' + label + '">' + desc + '</span></a>';
            } else {
                innerHtml = '<span ' +  _getCtrlTooltipHtml(label) + '><i rel="icon" ></i></span>';
            }
            html = '<li class="dropdown just_ico' + (!displayHorizontal ? ' compact-hide' : '') + '"' +

                _getTopttItemHtml(type) +
                infChart.structureManager.common.getCtrlTypeHtml(ctrlType) +
                '>' +
                innerHtml +
                '<ul class="dropdown-menu ' + optionsUlClass + '" role="menu">';
            infChart.util.forEach(options, function (i, obj) {
                var cls = obj.ico ? obj.ico : 'icon ico-' + obj.key;
                html += '<li' + _getCtrlItemHTML(ctrlType) +
                    infChart.structureManager.common.getCtrlValueHtml(obj.key) +
                    _getCtrlTooltipHtml(obj.label, undefined, undefined, ttDir) +
                    _getCtrlIconHtml(cls) +
                    '><i class="' + cls + '"></i></li>';
            });
            html += '</ul></li>';
        }
        return html;
    };

    /**
     * multi option element with caret
     * used for chart types and grid types
     * @param {string} ctrlType
     * @param {string} label
     * @param {string} desc
     * @param {Array<object>} options
     * @param {string} optionsUlClass
     * @param {boolean} displayHorizontal
     * @param {string} type - ??
     * @returns {string}
     * @private
     */
    var _getMultiOptionWithDropdownHTML = function (ctrlType, label, desc, options, optionsUlClass, displayHorizontal, type, verticalDropDown, adjustTooltipOnSides) {
        var html = '';
        if (options && options.length > 0) {
            html =
                '<li class="dropdown' + (!displayHorizontal ? ' compact-hide' : '') + '"' +
                _getTopttItemHtml(type) +
                infChart.structureManager.common.getCtrlTypeHtml(ctrlType) +
                '>' +
                '<a class="dropdown-toggle" role="button" aria-expanded="false" ' + _getCtrlTooltipHtml(label) + '>' +
                '<i rel="icon"></i>' +
                '<span cntrl-role="text"' + (displayHorizontal ? (' data-localize="' + label + '" ') : '') + '>' + (displayHorizontal ? desc : '') + '</span><span class="caret"></span>' +
                '</a>' +
                '<ul inf-ctrl="dropdown-menu-chart" class="dropdown-menu ' + optionsUlClass + '' + (verticalDropDown ? (' vertical-dropdown') : '') + '" role="menu">';

            infChart.util.forEach(options, function (i, obj) {
                var cls = obj.ico ? obj.ico : 'ico-' + obj.key,
                    ttDir = adjustTooltipOnSides ? i === 0 ? "bottom-right" : i === (options.length - 1) ? " bottom-left" : "bottom" : "bottom";
                var verticalDropDownSpan = '<span rel="additional-span" class="dropdown-text" data-localize="' + obj.label + '">' + infChart.manager.getLabel(obj.label) + '</span>';
                html += '<li ' +
                    _getCtrlItemHTML(ctrlType) +
                    infChart.structureManager.common.getCtrlValueHtml(obj.key) +
                    _getCtrlTooltipHtml(obj.label, undefined, undefined, ttDir) +
                    _getCtrlIconHtml(cls) +
                    '><i class="' + cls + '" '/*+_getCtrlTooltipHtml(obj.label, undefined, undefined, "bottom")*/ + '></i>' + (verticalDropDown ? (verticalDropDownSpan) : '') + '</li>';
            });
            html += '</ul></li>';
        }
        return html;
    };

    /**
     * multi option element with caret with fixed title and custom html
     * used for trade controls
     * @param {string} ctrlType
     * @param {string} label
     * @param {string} desc
     * @param {toolbarConfig} config
     * @param {string} type - ??
     * @returns {string}
     * @private
     */
    var _getMultiOptionDropdownHTMLWithCustomInnerHTML = function (ctrlType, label, desc, config, type) {
        var html = '';
        if (config.options && config.options.length > 0) {
            html = '<li class="dropdown ' + (config.baseClass ? config.baseClass : '') + '"' +
                _getTopttItemHtml(type) +
                infChart.structureManager.common.getCtrlTypeHtml(ctrlType) +
                '>' +
                '<a class="dropdown-toggle" role="button" aria-expanded="false">' +
                '<span cntrl-role="text" data-localize="' + label + '"></span><span class="caret"></span></a>' +
                '<ul class="dropdown-menu ' + (config.menuClass ? config.menuClass : '') + '" role="menu">';
            infChart.util.forEach(config.options, function (i, obj) {
                html += '<li' + (obj.cssClass ? (' class="' + obj.cssClass + '"') : '') +
                    _getCtrlItemHTML(ctrlType) +
                    infChart.structureManager.common.getCtrlValueHtml(obj.key) +
                    '>' + obj.html + '</li>';
            });
            html += '</ul></li>';
        }
        return html;
    };

    /**
     * multi option element with caret with fixed title
     * used for file
     * @param {string} ctrlType
     * @param {string} label
     * @param {string} desc
     * @param {Array<object>} options
     * @param {string} type - ??
     * @returns {string}
     * @private
     */
    var _getMultiOptionDropdownHTMLWithFixedTitle = function (ctrlType, label, desc, options, type) {
        var html = '';
        if (options && options.length > 0) {
            html = '<li class="dropdown"' +
                _getTopttItemHtml(type) +
                infChart.structureManager.common.getCtrlTypeHtml(ctrlType) +
                '>' +
                '<a target="_self" class="dropdown-toggle" role="button" aria-expanded="false">' +
                '<span cntrl-role="text" data-localize="' + label + '">' + desc + '</span><span class="caret"></span></a>' +
                '<ul class="dropdown-menu" role="menu">';
            infChart.util.forEach(options, function (i, obj) {
                html += '<li' + _getCtrlItemHTML(ctrlType) +
                    infChart.structureManager.common.getCtrlValueHtml(obj.key) +
                    ' inf-temp-type="' + obj.type + '"><a data-localize="' + obj.label + '" >' + obj.desc + '</a></li>';
            });
            html += '</ul></li>';
        }
        return html;
    };

    /**
     * multi option element with caret with each option in a new line
     * used for interval
     * @param {string} ctrlType
     * @param {string} label
     * @param {object} config
     * @param {string} type - ??
     * @returns {string}
     * @private
     */
    var _getMultiOptionWithHorizontalDropdownHTML = function (ctrlType, label, config, type) {
        var html = '';
        if (config.options && config.options.length > 0) {
            var ctrlTypeHtml = infChart.structureManager.common.getCtrlTypeHtml(ctrlType);
            if (config.options.length === 1) {
                var obj = config.options[0];
                html =
                    '<li' + infChart.structureManager.common.getCtrlValueHtml(obj.key) +
                    _getTopttItemHtml(type) +
                    ctrlTypeHtml + ' class="' + ( config.cls || "") + '" >' +
                    '<a class="selected-el" target="_self"' + _getCtrlTextHtml(obj.label, obj.shortLabel, config.shortLabel) + '>' + obj.desc + '</a>' +
                    '</li>';
            } else {
                html =
                    '<li class="dropdown ' + ( config.cls || "") + '"' + _getTopttItemHtml(type) + ctrlTypeHtml + '>' +
                    '<a target="_self" class="dropdown-toggle" role="button" aria-expanded="false" ' + _getCtrlTooltipHtml(label, undefined, undefined, "bottom") + '>' +
                    '<span ctrl-role="text"></span>' +
                    '<span class="caret"></span>' +
                    '</a>' +
                    '<ul class="dropdown-menu" role="menu">';
                html += _getHorizontalDropdownOptionsHTML(config.options, (config.display ? config.display.split(',') : undefined), config.shortLabel, ctrlType);
                html += '</ul></li>';
            }
        }
        return html;
    };

    var _getHorizontalDropdownOptionsHTML = function (options, displayOptions, showShortLabel, ctrlType) {
        var optionsHtml = '';
        infChart.util.forEach(options, function (i, obj) {
            if (!displayOptions || displayOptions.indexOf(obj.key) > -1) {
                optionsHtml +=
                    '<li' + _getCtrlItemHTML(ctrlType) +
                    infChart.structureManager.common.getCtrlValueHtml(obj.key) +
                    '>' +
                    '<a target="_self" ' + _getCtrlTextHtml(obj.label, obj.shortLabel, showShortLabel) + '>' + (showShortLabel && obj.shortDesc ? obj.shortDesc : obj.desc) + '</a>' +
                    '</li>';
            }
        });
        return optionsHtml;
    };

    //endregion

    //endregion

    var _getSettingsContainer = function (containerId, type) {
        var container, mainContainer = $("#" + containerId);
        switch (type) {
            case "indicator" :
                container = mainContainer.find('div[inf-container="indicator_settings"]');
                break;
            case "symbol" :
                container = mainContainer.find('div[inf-container="symbol_settings"]');
                break;
            case "file":
                container = mainContainer.find('div[inf-container="file_settings"]');
                break;
            case "trade":
                container = mainContainer.find('div[inf-container="trade_settings"]');
                break;
            case "indicatorPanelView":
                container = mainContainer.find('div[inf-container="indicator_panel"]');
                break;
            case "drawingToolPanelView":
                container = mainContainer.find('div[inf-container="drawing_tools_panel"]');
                break;
            case "symbolSettingsPanelView":
                container = mainContainer.find('div[inf-container="symbol_settings_panel"]');
                break;
            case "tradingPanelView"://todo : chart trader must use this
                container = mainContainer.find('div[inf-container="trading_panel"]');
                break;
            default:
                break;
        }
        return container;
    };

    var _createInstance = function () {
        return {
            createToolbar: _createToolbar,
            setHTML: _setHTML,
            setSelectedControls: _setSelectedControls,
            clearSelectedControls: _clearSelectedControls,
            getSettingsContainer: _getSettingsContainer,
            setDefaultValues: _setDefaultValues,
            setVisibility: _setVisibility,
            initializeTooltips: _initializeTooltips,
            getChartInstance: _getChartInstance
        }
    };

    var _getInstance = function () {
        if (!_instance) {
            return _createInstance();
        }
        return _instance;
    };

    return _getInstance();
})();