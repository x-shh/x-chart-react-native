/**
 * Created by dushani on 11/12/18.
 *
 * Code and HTMLs related to structural stuff such as layout legend tooltip and etc, goes here.
 */

window.infChart = window.infChart || {};

infChart.structureManager = (function ($, infChart) {

    var _getStructure = function (toolbarEnabled, toolbarProperties) {
        var html = '';
        if (toolbarEnabled) {
            html =
                '<div inf-container="indicator_settings"></div>' +
                '<div inf-container="symbol_settings"></div>' +
                '<div inf-container="file_settings"></div>';

            if (toolbarProperties.top || toolbarProperties.upper || toolbarProperties.mobile) {
                html += '<header inf-container="header">' +
                '<nav class="navbar navbar-default">' +
                '<div>' +
                '<div inf-pnl="tb-trading"></div>' +
                '<div inf-pnl="tb-mobile"></div>' +
                '<div inf-pnl="tb-upper"></div>' +
                '</div>' +
                '</nav>' +
                '</header>';

            }
            if (toolbarProperties && toolbarProperties.top) {
                html += '<nav class="navbar navbar-default nav2" inf-container="top">' +
                '<div>' +
                '<div class="navbar-header ad-chart-navbar-header">' +
                '<div class="collapse navbar-collapse defaultNavbar2"  style="display: block !important;">' +
                '<div inf-pnl="tb-top"></div>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '</nav>';
            }

            html += '<div class="clearfix"></div>' +
                '<div inf-container="chart_container" class="chart_container">' +
                '<div inf-ref="chart_row" class="chart-section">' +
                '<div inf-pnl="tb-left"></div>' +
                '<div inf-pnl="favorite-menu-panel"></div>' +
                '<div inf-container="chartwrapper" class="chartwrapper">' +
                '<div inf-container="chart_holder" class="chart_holder clearfix">' +
                '<div inf-container="chart_top" class="chart-option-y-axis-reset-wrapper"></div>' +
                '<div inf-container="highchartContainer" class="chart-outer-wrapper">' +
                '<div inf-container="trade_settings" class="position-relative"></div>' +
                '<div inf-container="drawing_settings" class="position-relative"></div>' +
                '<div inf-container="quick_drawing_settings" class="position-relative"></div>' +
                '<div inf-container="intradaychart_container" class="position-relative"></div>' + 
                '<div inf-container="chart" style="height:100%"></div> ' +
                '<div inf-container="order-book-volume" style="height:100%"></div>' +
                '</div>' +
                '</div>' +
                '<div inf-pnl="tb-right"></div>' +
                '<div inf-pnl="context-menu-panel" class="context-menu-panel" style="display: none;"></div>'+
                '</div>' +
                '</div>' +
                '</div>' +
                '<div inf-container="msg_container"></div>';
        } else {
            html = '<div inf-container="chartwrapper" class="chartwrapper">' +
                '<div inf-container="chart_top" class="chart-option-y-axis-reset-wrapper"></div>' +
                '<div inf-container="highchartContainer" class="chart-outer-wrapper">' +
                '<div inf-container="trade_settings" class="position-relative"></div>' +
                '<div inf-container="chart" class="mainchart_chart clearfix" style="height:100%"></div>' +
                '<div inf-container="order-book-volume" style="height:100%"></div>' +
                '</div>' +
                '<div inf-pnl="context-menu-panel" class="context-menu-panel" style="display: none;"></div>'+
                '<div inf-container="msg_container"></div>' +
                '</div>';
        }
        return html;
    };

    var _getContainer = function (container, type) {
        var selector;
        switch (type) {
            case 'chartContainer':
                selector = 'div[inf-container="highchartContainer"]';
                break;
            case 'depthContainer':
                selector = 'div[inf-container="order-book-volume"]';
                break;
            case "indicator" :
                selector = 'div[inf-container="indicator_settings"]';
                break;
            case "symbol" :
                selector = 'div[inf-container="symbol_settings"]';
                break;
            case "file":
                selector = 'div[inf-container="file_settings"]';
                break;
            case "trade":
                selector = 'div[inf-container="trade_settings"]';
                break;
            case "drawing":
                selector = 'div[inf-container="drawing_settings"]';
                break;
            case "indicatorPanelView":
                selector = 'div[inf-container="indicator_panel"]';
                break;
            case "drawingToolPanelView":
                selector = 'div[inf-container="drawing_tools_panel"]';
                break;
            case "symbolSettingsPanelView":
                selector = 'div[inf-container="symbol_settings_panel"]';
                break;
            case "tradingPanelView":
                selector = 'div[inf-container="trading_panel"]';
                break;
            case "chart_top":
                selector = 'div[inf-container="chart_top"]';
                break;
            case "settingsPanel":
                selector = 'div[inf-pnl="tb-right"]';
                break;
            case "drawingToolbar":
                selector = 'div[inf-pnl="tb-left"]';
                break;
            case "tradingToolbar":
                selector = 'div[inf-pnl="tb-trading"]';
                break;
            case "contextMenuPanel":
                selector = 'div[inf-pnl="context-menu-panel"]';
                break;
            case "favoriteMenuPanel":
                selector = 'div[inf-pnl="favorite-menu-panel"]';
                break;
            case "quickDrawingSettingsPanel":
                selector = 'div[inf-container="quick_drawing_settings"]';
                break;
            case "intradayChartPanel":
                selector = 'div[inf-container="intradaychart_container"]';
                break;
            default:
                break;
        }

        return selector && container ? container.querySelector(selector) : container;
    };

     var _getChartWrapperDimensions = function (id, containerElem) {

         if (!containerElem) {
             return;
         }

         var height = containerElem.clientHeight,
             width = containerElem.clientWidth,
             header = containerElem.querySelector('[inf-container="header"]'),
             headerHeight = 0;

         //header height - period bar
         if (header && header.style.display != 'none') {
             headerHeight = $(header).outerHeight(true);
         }

         //top button line height
         var top = containerElem.querySelector('[inf-container="top"]'), topHeight = 0;
         if (top && top.style.display != 'none') {
             topHeight = $(top).outerHeight(true);
         }

         var left = containerElem.querySelector('[inf-pnl="tb-left"]'), leftWidth = 0;
         if (left && left.style.display != 'none') {
             leftWidth = $(left).outerWidth(true);
         }

         return {
             width: width - leftWidth,//left tool bar is outside the wrapper
             height: height - headerHeight - topHeight
         };
     };

     var _getChartHolderDimensions = function (id, containerElem, wrapperDimensions) {

         if (!wrapperDimensions) {
             wrapperDimensions = _getChartWrapperDimensions(id, containerElem);
         }
         //right panel is in the wrapper
         var right = containerElem.querySelector('[inf-pnl="tb-right"]'),
             rightWidth = 0,
             wrapperHeight = wrapperDimensions.height,
             wrapperWidth = wrapperDimensions.width;

         if (right && right.style.display != 'none') {
             if (!right.classList.contains('chart-rp-on-resize')) {
                 rightWidth = 240;//this is a hack
             } else {
                 rightWidth = right.clientWidth;
             }
         }

         var holderWidth = wrapperWidth - rightWidth,
             holderHeight = wrapperHeight;

         return {
             width: holderWidth,
             height: holderHeight
         };
     };

     /**
      * Returns the chart container's dimensions along with the legend's deimensions
      * @param {string} id - chart container id
      * @param {Element} containerElem - container element
      * @param {object} holderDimensions - holder dimensions {width:{number},height:{number}}
      * @param {boolean} skipDepth - whether to set depth sizes or not
      * @returns {{width: *, height: number, legendHeight: number, legendWidth: *}} chart container dimensions
      * @private
      */
     var _getHighChartContainerDimensions = function (id, containerElem, holderDimensions, skipDepth) {
         holderDimensions = holderDimensions ? holderDimensions : _getChartHolderDimensions(id, containerElem);

         //legend height
         var holderWidth = holderDimensions.width,
             holderHeight = holderDimensions.height,
             legend = containerElem.querySelector('[inf-container="chart_top"]'),
             legendHeight = 0,
             legendWidth = holderWidth;

         if (legend && legend.style.display != 'none') {
             legendHeight = $(legend).outerHeight(true);
         }

         var chartWidth = holderWidth;
         var chartHeight = holderHeight - legendHeight;

         if (infChart.depthManager && !skipDepth) {
             var depthSize = infChart.depthManager.setContainerSize(id, containerElem, chartWidth, chartHeight);
             chartWidth = chartWidth - depthSize.width;
             chartHeight = chartHeight - depthSize.height;
         }

         return {width: chartWidth, height: chartHeight, legendHeight: legendHeight, legendWidth: legendWidth};
     };

     /**
      * Re arrange the top tb, uper tb, and the trading tb of the given container (compact toolbars if needed)
      * @param id
      * @param containerEl
      * @private
      */
     var _rearrangeUpperLayerToolbar = function (id, containerEl) {

         var width = containerEl && containerEl.clientWidth,
             topTb = containerEl.querySelector('[inf-pnl="tb-top"]'),
             upperTb = containerEl.querySelector('[inf-pnl="tb-upper"]'),
             leftTb = containerEl.querySelector('[inf-pnl="tb-left"]'),
             topTbFullWidth = topTb && +topTb.getAttribute("x-full-width"),
             upperTbFullWidth,
             tradingTb,
             tradingTbFullWidth,
             tradingTbCompactWidth,
             isTopTbCompacted = false,
             tradingTbHideWidth;

         upperTbFullWidth = upperTb && +upperTb.getAttribute("x-full-width");

         var chart = infChart.manager.getChart(id);

         if (chart && (chart.settings.toolbar.alwaysCompactToolbar || ((!topTbFullWidth && topTb && topTb.clientWidth > width ) ||
             (topTbFullWidth && topTbFullWidth > width)))) {

             if (!topTbFullWidth && topTb) {
                 topTb.setAttribute("x-full-width", topTb.clientWidth);
             }
             containerEl.xAddClass('compact-toolbar'); // top bar
             isTopTbCompacted = true;

             if ((!upperTbFullWidth && upperTb && upperTb.clientWidth > width ) ||
                 (upperTbFullWidth && upperTbFullWidth > width) /*width < 580 */) {
                 if (!upperTbFullWidth && upperTb) {
                     upperTb.setAttribute("x-full-width", upperTb.clientWidth);
                 }
                 containerEl.xAddClass('compact-upper-bar'); // upper
             } else {
                 containerEl.xRemoveClass('compact-upper-bar');
                 upperTb && upperTb.removeAttribute("x-full-width");
             }
             if(infChart.manager.getChart(id).settings.toolbar.verticalDropDown && topTb) {
                 var allElements = topTb.querySelectorAll('[inf-ctrl="dropdown-menu-chart"]');

                 for (i = 0; i < allElements.length; i++) {
                     allElements[i].classList.remove('vertical-dropdown');
                 }
             }
         } else {
             containerEl.xRemoveClass('compact-toolbar');
             containerEl.xRemoveClass('compact-upper-bar');
             topTb && topTb.removeAttribute("x-full-width");

             if (chart?.settings.toolbar.verticalDropDown && topTb) {
                 var allElements = topTb.querySelectorAll('[inf-ctrl="dropdown-menu-chart"]');

                 for (i = 0; i < allElements.length; i++) {
                     allElements[i].xAddClass('vertical-dropdown');
                 }
             }
         }

         tradingTb = containerEl.querySelector('[inf-pnl="tb-trading"]');
         tradingTbFullWidth = tradingTb && +tradingTb.getAttribute("x-full-width");
         tradingTbCompactWidth = tradingTb && +tradingTb.getAttribute("x-compact-width");
         tradingTbHideWidth = tradingTb && +tradingTb.getAttribute("x-compact-more-width");
         var upperWidth = upperTbFullWidth || upperTb && upperTb.clientWidth;

         if (tradingTb && upperTb && ((tradingTbFullWidth && (tradingTbFullWidth + upperWidth > width)) || (!tradingTbFullWidth && (tradingTb.clientWidth + upperWidth) > width))) {
             if (!tradingTbFullWidth && tradingTb) {
                 tradingTb.setAttribute("x-full-width", tradingTb.clientWidth);
             }
             containerEl.xAddClass('show-hide-trade-buttons');
             tradingTb = containerEl.querySelector('[inf-pnl="tb-trading"]');
             if (tradingTbCompactWidth && (tradingTbCompactWidth + upperWidth > width) || (tradingTb.clientWidth + upperWidth) > width) {
                 if (!tradingTbCompactWidth) {
                     tradingTb.setAttribute("x-compact-width", tradingTb.clientWidth);
                 }
                 containerEl.xAddClass('compact-trade-buttons');
                 tradingTb = containerEl.querySelector('[inf-pnl="tb-trading"]');
                 if (isTopTbCompacted && tradingTbHideWidth && (tradingTbHideWidth + upperWidth > width) || (tradingTb.clientWidth + upperWidth) > width) {
                     if (!tradingTbHideWidth) {
                         tradingTb.setAttribute("x-compact-more-width", tradingTb.clientWidth);
                     }
                     containerEl.xAddClass('compact-more-trade-buttons');

                 } else {
                     containerEl.xRemoveClass('compact-more-trade-buttons');
                     tradingTb && tradingTb.removeAttribute("x-compact-more-width");
                 }

             } else {
                 containerEl.xRemoveClass('compact-trade-buttons');
                 containerEl.xRemoveClass('compact-more-trade-buttons');
                 tradingTb && tradingTb.removeAttribute("x-compact-width");
                 tradingTb && tradingTb.removeAttribute("x-compact-more-width");
             }
         } else {
             containerEl.xRemoveClass('show-hide-trade-buttons');
             containerEl.xRemoveClass('compact-trade-buttons');
             containerEl.xRemoveClass('compact-more-trade-buttons');
             tradingTb && tradingTb.removeAttribute("x-full-width");
             tradingTb && tradingTb.removeAttribute("x-compact-width");
             tradingTb && tradingTb.removeAttribute("x-compact-more-width");

         }

     };

     /**
      * Apply classes suits fot the new dimensions and change the axis dimensions according to the size
      * @param id
      * @param containerEl
      * @returns {{height, width}|{height: number, width: number}|*}
      * @private
      */
     var _rearrangeStructure = function (id, containerEl) {
         if (containerEl) {
             var width = containerEl && containerEl.clientWidth,
                 topTb = containerEl.querySelector('[inf-pnl="tb-top"]'),
                 leftTb = containerEl.querySelector('[inf-pnl="tb-left"]'),
                 upperTb = containerEl.querySelector('[inf-pnl="tb-upper"]');

             _rearrangeUpperLayerToolbar(id, containerEl);

             var chartWrapperDimensions = _getChartWrapperDimensions(id, containerEl),
                 wrapperWidth = chartWrapperDimensions.width,
                 wrapperHeight = chartWrapperDimensions.height;
             //wrapperHeight = wrapperHeight < 100 ? 100 : wrapperHeight;

             var chartWrapperEl = containerEl.querySelector('[inf-container="chartwrapper"]');

             if (chartWrapperEl) {
                 $(chartWrapperEl).width(wrapperWidth);

                 if (leftTb && infChart.drawingsManager) {
                     $(leftTb).height(wrapperHeight);
                     infChart.drawingsManager.rearrangeDrawingToolbar(leftTb);
                 }

                 // dropdown's max height
                 var topTbH = 0, dropDowns;
                 if (topTb) {
                     dropDowns = containerEl.querySelectorAll("[inf-pnl=tb-top] > ul > .dropdown");
                     if (dropDowns && dropDowns.length > 0) {
                         var i = 0, len = dropDowns.length;
                         for (i; i < len; i++) {
                             $(dropDowns[i].querySelector("ul.dropdown-menu")).css({"max-height": wrapperHeight});
                         }
                     }
                     // dropDowns && dropDowns.length && infChart.util.forEach(dropDowns, function (i, dropDown) {
                     // $(dropDown.querySelector("ul.dropdown-menu")).css({"max-height" : wrapperHeight});
                     // });
                     if (infChart.indicatorMgr) {
                         infChart.structureManager.indicator.rearrangeIndicatorDropDownStructure(topTb, wrapperHeight);
                     }
                     var top = containerEl.querySelector('[inf-container="top"]');
                     if (top && top.style.display != 'none') {
                         topTbH = $(top).outerHeight(true);
                     }
                 }

                 if (upperTb) {
                     dropDowns = containerEl.querySelectorAll("[inf-pnl=tb-upper] > ul > .dropdown");
                     if (dropDowns && dropDowns.length > 0) {
                         var i = 0, len = dropDowns.length;
                         for (i; i < len; i++) {
                             $(dropDowns[i].querySelector("ul.dropdown-menu")).css({"max-height": wrapperHeight + topTbH});
                         }
                     }
                     // dropDowns && dropDowns.length && infChart.util.forEach(dropDowns, function (i, dropDown) {
                     //     $(dropDown.querySelector("ul.dropdown-menu")).css({"max-height" : wrapperHeight + topTbH});
                     // });
                 }
             }

             //right panel is in the wrapper
             var right = containerEl.querySelector('[inf-pnl="tb-right"]'), rightWidth = 0;
             if (right && right.style.display != "none") {
                 if (width > 680) {
                     right.xRemoveClass('chart-rp-on-resize');
                     rightWidth = 240;//this is a hack
                 } else {
                     right.xAddClass('chart-rp-on-resize');
                 }
                 $(right).height(wrapperHeight);
             }

             var holderDimensions = _getChartHolderDimensions(id, containerEl, chartWrapperDimensions),
                 holderWidth = holderDimensions.width,
                 holderHeight = holderDimensions.height,
                 holderEl = containerEl.querySelector('[inf-container="chart_holder"]');

             if (holderEl) {
                 $(holderEl).width(holderWidth);
             }

             //legend height
             var hChartContainerDimensions = _getHighChartContainerDimensions(id, containerEl, holderDimensions),
                 chartWidth = hChartContainerDimensions.width,
                 chartHeight = hChartContainerDimensions.height,
                 legendWidth = hChartContainerDimensions.legendWidth,
                 legendHeight = hChartContainerDimensions.legendHeight,
                 legendEl = containerEl.querySelector('[inf-container="chart_top"]'),
                 $hChartContainerEl = $(containerEl.querySelector('[inf-container="chart"]'));

             $hChartContainerEl.width(chartWidth);
             $hChartContainerEl.height(chartHeight);

             if (legendEl && legendEl.style.display != "none") {
                 infChart.structureManager.legend.rearrangeLegendStructure($(legendEl), legendWidth, legendHeight);
             }

             return {'height': chartHeight, 'width': chartWidth, 'legendWidth': legendWidth};
         }

     };

     var _isResizeRequired = function (id, containerEl) {
         var chartWrapperDimensions = containerEl && _getChartWrapperDimensions(id, containerEl),
             chartWrapperEl = containerEl && containerEl.querySelector('[inf-container="chartwrapper"]'),
             resizeRequired = false;

         resizeRequired = chartWrapperEl && (chartWrapperEl.clientHeight != chartWrapperDimensions.height || chartWrapperEl.clientWidth != chartWrapperDimensions.width);

         if (!resizeRequired && containerEl) {
             var holderDimensions = _getChartHolderDimensions(id, containerEl, chartWrapperDimensions),
                 chartHolderEl = containerEl.querySelector('[inf-container="chart_holder"]');
             resizeRequired = chartHolderEl && (chartHolderEl.clientHeight != holderDimensions.height || chartHolderEl.clientWidth != holderDimensions.width);

             if (!resizeRequired) {
                 var hChartContainerDimensions = _getHighChartContainerDimensions(id, containerEl, holderDimensions),
                     hChartContainerEl = containerEl.querySelector('[inf-container="chart"]');
                 resizeRequired = hChartContainerEl && (hChartContainerEl.clientHeight != hChartContainerDimensions.height || hChartContainerEl.clientWidth != hChartContainerDimensions.width);

             }

         }

         return resizeRequired;
     };

     var _adjustFullWidth = function (el, width, isRemove) {
         var currentWidth = el && +el.getAttribute("x-full-width");
         if (currentWidth) {
             currentWidth = isRemove ? currentWidth - width : currentWidth + width;
             el.setAttribute("x-full-width", currentWidth);
         }
     };

     return {
         getStructure: _getStructure,
         rearrangeStructure: _rearrangeStructure,
         getContainer: _getContainer,
         isResizeRequired: _isResizeRequired,
         rearrangeUpperLayerToolbar: _rearrangeUpperLayerToolbar,
         adjustFullWidth: _adjustFullWidth,
         getHighChartContainerDimensions: _getHighChartContainerDimensions
     };

 })(jQuery, infChart);

infChart.structureManager.common = (function () {

    var _getAxisLabelHtml = function (labelColor, labelValue) {
        return '<span style="color: ' + labelColor + '">' + labelValue + '</span>';
    };

    /**
     * Returns the css class to display positive or negative price values
     * @param isPositive
     * @returns {string}
     * @private
     */
    var _getPriceChangeClass = function (isPositive) {
        return isPositive ? "positive-text-change" : "negative-text-change";
    };

    /**
     * get inf-ctrl html
     * @param {string} type
     * @returns {string}
     * @private
     */
    var _getCtrlTypeHtml = function (type) {
        return ' inf-ctrl="' + type + '"';
    };

    /**
     * get inf-ctrl-value html
     * @param {string} value
     * @returns {string}
     * @private
     */
    var _getCtrlValueHtml = function (value) {
        return ' inf-ctrl-value="' + value + '"';
    };

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
     * get value from element
     * @param element
     * @returns {string}
     * @private
     */
    var _getValueFromAttribute = function (element) {
        return $(element).attr('inf-ctrl-value');
    };

    /**
     * single option without status
     * used in zoom, reset, fullscreen
     * @param parent
     * @param {string} controlType
     * @param {function} fn
     * @private
     */
    var _setSingleOptionControlWithoutStatus = function (parent, controlType, fn) {
        var control = _getControlElement(parent, controlType);
        control.click(function (event) {
            fn(_getValueFromAttribute(this));
            event.preventDefault();
        });
    };

    var _setOptionControlsToChildWithoutStatus = function (parent, controlType, clickFn, blurFn, KeyUpFn) {
        var control = _getControlElement(parent, controlType);
        var child = _getControlElement(control, controlType);
        control.click(function (event) {
            clickFn(event, control);
            event.preventDefault();
        });
        child.blur(function (event) {
            blurFn(event, control);
            event.preventDefault();
        });
        child.keyup(function (event) {
            KeyUpFn(event, control);
            event.preventDefault();
        });
    };

    var _closeAllPopups = function (container) {
        var fileActionPopups = $('#' + container).find("[data-inf-file-pop-up]");
        if (fileActionPopups.length > 0) {
            $.each(fileActionPopups, function (k, popup) {
                $(popup).hide();
            });
        }
    };

    /**
     * wrap and get the no data message
     * @param message
     * @returns {string}
     * @private
     */
    var _getNoDataMsg = function (message) {
        return '<div id="noDataContainer" >' + message + '</div>';
    };

    /**
     * resize and set colour to noData container
     * @param containerEl
     * @param {string} backgroundColor
     * @private
     */
    var _resizeAndSetColour = function(containerEl, backgroundColor){
        var chartWrapper = containerEl.querySelector('[inf-container="chartwrapper"]');
        $(containerEl.querySelector('#noDataContainer')).css({"background-color": backgroundColor, "height": chartWrapper.clientHeight, "width": chartWrapper.clientWidth});
    };

    return {
        getAxisLabelHtml: _getAxisLabelHtml,
        closeAllPopups: _closeAllPopups,
        getPriceChangeClass: _getPriceChangeClass,
        getCtrlTypeHtml: _getCtrlTypeHtml,
        getCtrlValueHtml: _getCtrlValueHtml,
        setSingleOptionControlWithoutStatus: _setSingleOptionControlWithoutStatus,
        setOptionControlsToChildWithoutStatus: _setOptionControlsToChildWithoutStatus,
        resizeAndSetColour: _resizeAndSetColour,
        getNoDataMsg: _getNoDataMsg
    };

})();

 infChart.structureManager.scalableAxis = (function ($) {

     var _getButtonHTML = function () {
        var xAxisResetToolTip = infChart.structureManager.toolbar.getToolTipAttributes(infChart.manager.getLabel("label.resetXAxis"), "left");
        var yAxisResetToolTip = infChart.structureManager.toolbar.getToolTipAttributes(infChart.manager.getLabel("label.resetYAxis"), "left");
        var resetToLastToolTip = infChart.structureManager.toolbar.getToolTipAttributes(infChart.manager.getLabel("label.resetToLast"), "left");
        var html = '<div class="axis-reset-container" inf-container="axis-reset-container">';
         //html += '<i rel="xResetZoomBtn" class="ico-re-set-x-axis"></i>';
        html += '<div rel="resetToLastBtn" class="axis-reset-icon"' + resetToLastToolTip + '><img src="data:image/png;base64,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"></div>';
        html += '<div rel="xResetZoomBtn" class="axis-reset-icon"' + xAxisResetToolTip + '><img src="data:image/svg+xml;base64, PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDIzLjAuMiwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4PSIwcHgiIHk9IjBweCIKCSB3aWR0aD0iMTIwMHB4IiBoZWlnaHQ9IjEyMDBweCIgdmlld0JveD0iMCAwIDEyMDAgMTIwMCIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgMTIwMCAxMjAwOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+CjxwYXRoIGQ9Ik0xMDU0LjUsNzMwLjdjLTM0LDE5Mi42LTIxNi4yLDMyMS44LTQwOC42LDI5MWwzMy4zLDEwMy4zTDQzNy41LDkxMC4zbDMwNi45LTEwMS45bC03NS43LDg4CgljMTIyLjksMTguMiwyMzguNi02NC43LDI2MC4zLTE4Ny44YzIyLjEtMTI1LjItNjEuNS0yNDQuNi0xODYuNy0yNjYuN2wyMi4xLTEyNS41Qzk1OSwzNTAuNywxMDg4LjgsNTM2LjIsMTA1NC41LDczMC43egoJIE02NTAuMSw3ODAuNUw0ODIuMiw0MjAuOUw2NDIuNiw3Ni41SDQ5MC4xbC05Ni41LDIyNC4yTDI5OCw3Ni41SDE0NS42bDE1OC42LDM0NC40bC0xNjcsMzU5LjVoMTUyLjVsMTA0LTI0MS4ybDEwMy41LDI0MS4ySDY1MC4xegoJIi8+Cjwvc3ZnPgo="></div>';
         //html += '<i rel="xResetZoomBtn" class="ico-re-set-y-axis"></i>';
        html += '<div rel="yResetZoomBtn" class="axis-reset-icon"' + yAxisResetToolTip + '><img src="data:image/svg+xml;base64, PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDIzLjAuMiwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4PSIwcHgiIHk9IjBweCIKCSB3aWR0aD0iMTIwMHB4IiBoZWlnaHQ9IjEyMDBweCIgdmlld0JveD0iMCAwIDEyMDAgMTIwMCIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgMTIwMCAxMjAwOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+CjxwYXRoIGQ9Ik0xMDU0LjUsNzMwLjdjLTM0LDE5Mi42LTIxNi4yLDMyMS44LTQwOC42LDI5MWwzMy4zLDEwMy4zTDQzNy41LDkxMC4zbDMwNi45LTEwMS45bC03NS43LDg4CgljMTIyLjksMTguMiwyMzguNi02NC43LDI2MC4zLTE4Ny44YzIyLjEtMTI1LjItNjEuNS0yNDQuNi0xODYuNy0yNjYuN2wyMi4xLTEyNS41Qzk1OSwzNTAuNywxMDg4LjgsNTM2LjIsMTA1NC41LDczMC43egoJIE02NDkuMiw3Ni4zSDUwNi4ybC05MC41LDI3NC45Yy05LjMsMjYuNS0xNS42LDU0LjgtMTguOCw4NC44aC0yLjZjLTIuOS0zMi42LTguMy02MC45LTE2LjItODQuOEwyODYsNzYuM0gxNDBsMTk0LDQ4NS4xbC03LjksMjQKCWMtOS45LDI5LjEtMjMuNyw1MC45LTQxLjMsNjUuM2MtMTcuNiwxNC40LTM4LjIsMjEuNi02MS44LDIxLjZjLTE4LjksMC0zNi40LTEuOS01Mi40LTUuN3YxMDUuOGMyMi4xLDUsNDQuNyw3LjQsNjcuNyw3LjQKCWM0Ni45LDAsODcuOS0xMi43LDEyMy0zOGMzNS4xLTI1LjMsNjIuMS02My41LDgxLjEtMTE0LjVMNjQ5LjIsNzYuM3oiLz4KPC9zdmc+Cg=="></div>';
        html += '</div>';
        return html;
     };

     var _getButton = function (containerId, isXAxis) {
         return $('#' + containerId).find((isXAxis ? '[rel="xResetZoomBtn"]' : '[rel="yResetZoomBtn"]'));
     };

     var _getResetToLastButton = function (containerId) {
        return $('#' + containerId).find(('[rel="resetToLastBtn"]'));
    };

     var _bindButtons = function (containerId, xBtnClickFn, yBtnClickFn, resetToLastBtnFn) {
         _getButton(containerId, true).bind('click', xBtnClickFn);
         _getButton(containerId, false).bind('click', yBtnClickFn);
         _getResetToLastButton(containerId).bind('click', resetToLastBtnFn);
     };

     var _setButtons = function (containerId, xBtnClickFn, yBtnClickFn, resetToLastBtnFn) {
         $('#' + containerId).find('div[inf-container="chart_top"]').append(_getButtonHTML());
         _bindButtons(containerId, xBtnClickFn, yBtnClickFn, resetToLastBtnFn);
     };

     var _updateButtonView = function (containerId, isXAxis, show) {
         var btn = _getButton(containerId, isXAxis), isChange = false;
         if (show) {
             if (btn) {
                 btn.show();
                 isChange = true && !_getButton(containerId, !isXAxis).is(':visible');
             }
         } else {
             if (btn) {
                 btn.hide();
                 isChange = true && !_getButton(containerId, !isXAxis).is(':visible');
             }
         }
         return isChange;
     };

     var _updateResetButtonView = function (containerId, show) {
        var btn = _getResetToLastButton(containerId), isChange = false;
        if (show) {
            if (btn) {
                btn.show();
                isChange = true && !_getResetToLastButton(containerId).is(':visible');
            }
        } else {
            if (btn) {
                btn.hide();
                isChange = true && !_getResetToLastButton(containerId).is(':visible');
            }
        }
        return isChange;
    };

     var _removeButtonHTML = function (containerId) {
         $('#' + containerId).find('div[inf-container="axis-reset-container"]').remove();
     };

     return {
         setButtons: _setButtons,
         updateButtonView: _updateButtonView,
         updateResetButtonView: _updateResetButtonView,
         removeButtonHTML: _removeButtonHTML
     }
 })(jQuery);

 infChart.structureManager.legend = (function ($, infChart) {

     /**
      * Returns the basic structure of the legend
      * @returns {string}
      * @private
      */
     var _getLegendStructureHTML = function () {
         return '<div inf-legend class="chart-option-wrapper hide-tooltip">' +
             '<div class="box-main-comparison-legends-wrapper">' +
             '<div legend-section inf-legend-base-symbol class="box-main legend-base-symbol"></div>' +
             '<div legend-section inf-legend-comp-symbol class="comparison-indicator-legends comparison-legends" style="display: none;"></div>' +
             '</div>' +
             '<div legend-section inf-legend-ind class="comparison-indicator-legends indicators-legends" style="display: none;"></div>' +
             '</div>';
     };

     /**
      * Returns the html of the legend of given comparison series
      * @param seriesId
      * @param title
      * @param color
      * @param {boolean} settingsEnabled
      * @param {boolean} refreshEnabled
      * @param {boolean} closeEnabled
      * @param {boolean} tooltipEnabled
      * @returns {string}
      * @private
      */
     var _getComparisonLegendItemHTML = function (seriesId, title, color, settingsEnabled, refreshEnabled, closeEnabled, tooltipEnabled, hideEnabled) {
         var colorInName = tooltipEnabled ? '' : 'style="color:' + color + ';"';
         return '<div inf-legend-item inf-series="' + seriesId + '"  class="box legend-item-wrapper clearfix" inf-legend-color="' + color + '">' +
             '<div rel="legend-item" class="legend-items" inf-legend-items ' + colorInName + '>' +
                 //'<div class="item-color" inf-legend-color style="background-color:' + color + ';"></div>' +
             '<div class="item-name">' + title + '</div>' +
             '<div inf-tooltip-items-container class="tooltip-items-container" style="color:' + color + ';"></div>' +
             '</div>' +
             _getLegendButtonsPopupHTML(settingsEnabled, refreshEnabled, closeEnabled, hideEnabled) +
             '</div>';

     };

     /**
      * Returns the html of the legend of base series
      * @param seriesId
      * @param title
      * @param color
      * @param {boolean} settingsEnabled
      * @param {boolean} refreshEnabled
      * @param {boolean} closeEnabled
      * @returns {string}
      * @private
      */
     var _getBaseSymbolLegendItemHTML = function (seriesId, title, color, settingsEnabled, refreshEnabled, closeEnabled) {
         return '<div inf-legend-base-symbol-basic-data class="legend-base-symbol-basic-data">' +
             '<div class="legend-item-wrapper" inf-legend-item inf-series="' + seriesId + '">' +
             '<div class="legend-items" inf-legend-items>' +
             '<div class="box symbol-content">' +
             '<div class="item-color" inf-legend-color style="background-color:' + color + ';"></div>' +
             '<div legend-sym-with-tt>' +
             '<h3 class="main-symbol-name" inf-legend-title >' + title + '</h3>' +
             '</div>' +
             '</div>' +
             '</div>' +
             _getLegendButtonsPopupHTML(settingsEnabled, refreshEnabled, closeEnabled) +
             '</div>' +
             '</div>' +
             '<div legend-bid-ask-history></div>';
     };

     /**
      * Returns the html of the legend of given indicator series
      * @param seriesId
      * @param title
      * @param color
      * @param {boolean} settingsEnabled
      * @param {boolean} refreshEnabled
      * @param {boolean} closeEnabled
      * @private
      */
     var _getIndicatorLegendItemHTML = function (seriesId, title, color, settingsEnabled, refreshEnabled, closeEnabled, hideEnabled) {
         return '<div inf-legend-item inf-series="' + seriesId + '" class="box legend-item-wrapper clearfix">' +
             '<div rel="legend-item" class="legend-items">' +
             '<div class="item-color" style="background-color:' + color + ';"></div>' +
             '<div class="item-name">' + title + '</div>' +
             '</div>' +
             _getLegendButtonsPopupHTML(settingsEnabled, refreshEnabled, closeEnabled, hideEnabled) +
             '</div>';
     };

     /**
      * Returns the html of settings button of the legend
      * @returns {string}
      * @private
      */
     var _getLegendSettingsButtonHTML = function () {
         return '<li class="btn-group" rel="settings"><a class="btn btn-default opg-settings"><i class="fa fa-wrench"></i></a></li>';
     };

     /**
      * Returns the html of close button of the legend
      * @returns {string}
      * @private
      */
     var _getLegendCloseButtonHTML = function () {
         return '<li class="btn-group" rel="close"><a class="btn btn-default opg-delete"><i class="fa fa-trash-o"></i></a></li>';
     };

     /**
      * Returns the html of hide button of the legend
      * @returns {string}
      * @private
      */
     var _getLegendHideButtonHTML = function () {
         return '<li class="btn-group" rel="hide"><a class="btn btn-default opg-show-hide"><i rel="hide-icon" class="fa fa-eye"></i></a></li>';
     };

     /**
      * Returns the html of refresh button of the legend
      * @returns {string}
      * @private
      */
     var _getLegendRefreshButtonHTML = function () {
         return '<li class="btn-group" rel="refresh"><a class="btn btn-default opg-refresh"><i class="fa fa-refresh"></i></a></li>';
     };

     /**
      * Returns the popup of buttons for the given series of the given chart
      * @param {boolean} settingsEnabled
      * @param {boolean} refreshEnabled
      * @param {boolean} closeEnabled
      * @returns {string}
      * @private
      */
     var _getLegendButtonsPopupHTML = function (settingsEnabled, refreshEnabled, closeEnabled, hideEnabled) {
         var htmlStr = '<div class="popup-options option-btn-group-colors"><ul class="btn-group">';
         if (settingsEnabled) {
             htmlStr += _getLegendSettingsButtonHTML();
         }
         if (refreshEnabled) {
             htmlStr += _getLegendRefreshButtonHTML();
         }
         if (closeEnabled) {
             htmlStr += _getLegendCloseButtonHTML();
         }
         if (hideEnabled) {
             htmlStr += _getLegendHideButtonHTML();
         }
         htmlStr += '</ul></div>';
         return htmlStr;
     };

     /**
      * Update the html of the legend of the base series
      * @param title
      * @param color
      * @param seriesType
      * @param legendItemEl
      * @private
      */
     var _updateBaseSymbolLegendItemHTML = function (legendItemEl, color, title, seriesType) {
         // show / hide legend color according to the series type
         switch (seriesType) {
             case 'candlestick':
             case 'ohlc':
             case 'hlc':
             case 'equivolume':
             case 'heikinashi':
             case 'pint':
             case 'engulfingCandles':
                 legendItemEl.find("[inf-legend-color]").hide();
                 break;
             default:
                 legendItemEl.find("[inf-legend-color]").css({"background-color": color + ""});
                 legendItemEl.find("[inf-legend-color]").show();
                 break;
         }
         var titleEl = legendItemEl.find("[inf-legend-title]")[0];
         titleEl.innerHTML = title;
     };

     /**
      * Update the html of the legend of given comparison series
      * @param color
      * @param legendItemEl
      * @private
      */
     var _updateComparisonLegendItemHTML = function (legendItemEl, color, hideEnabled, isVisible) {
         legendItemEl.find("[inf-legend-color]").css({"background-color": color + ""});
         _updateComparisonLegendItemShowHide(legendItemEl, color, hideEnabled, isVisible);
     };

     var _updateComparisonLegendItemShowHide = function(legendItemEl, color, hideEnabled, isVisible){
        if (hideEnabled) {
            let eyeIcon = legendItemEl.find("i[rel=hide-icon]");
            let legendItem = legendItemEl.find("div[rel=legend-item]");

            if (isVisible) {
                eyeIcon.removeClass("fa-eye-slash");
                eyeIcon.addClass("fa-eye");
                legendItem.removeClass("legend-items--hide");
            } else {
                eyeIcon.removeClass("fa-eye");
                eyeIcon.addClass("fa-eye-slash");
                legendItem.addClass("legend-items--hide");
            }
        }
     }

     /**
      * Update the html of the legend of given indicator series
      * @param color
      * @param legendItemEl
      * @private
      */
     var _updateIndicatorLegendItemHTML = function (legendItemEl, color, hideEnabled, isVisible) {
         legendItemEl.find("[inf-legend-color]").css({"background-color": color + ""});

         if (hideEnabled) {
             let eyeIcon = legendItemEl.find("i[rel=hide-icon]");
             let legendItem = legendItemEl.find("div[rel=legend-item]");

             if (isVisible) {
                 eyeIcon.removeClass("fa-eye-slash");
                 eyeIcon.addClass("fa-eye");
                 legendItem.removeClass("legend-items--hide");
             } else {
                 eyeIcon.removeClass("fa-eye");
                 eyeIcon.addClass("fa-eye-slash");
                 legendItem.addClass("legend-items--hide");
             }
         }
     };

     var _bindLegendEvents = function (legendParentEl, seriesId, settingsFn, refreshFn, closeFn, onSymbolTitleLegendClicked, hideFn) {
         var legendItemEl = legendParentEl.find("[inf-legend-item][inf-series=" + seriesId + "]");
         if (typeof settingsFn === 'function') {
             legendItemEl.find('li[rel="settings"]').bind('click', settingsFn);
         }

         if (typeof refreshFn === 'function') {
             legendItemEl.find('li[rel="refresh"]').bind('click', refreshFn);
         }

         if (typeof closeFn === 'function') {
             legendItemEl.find('li[rel="close"]').bind('click', closeFn);
         }

         if (typeof hideFn === 'function') {
             legendItemEl.find('li[rel="hide"]').bind('click', {legend: legendItemEl.find("div[rel=legend-item]")} , hideFn);
         }

         if (typeof onSymbolTitleLegendClicked === 'function') {
            legendItemEl.bind('click', onSymbolTitleLegendClicked);
         }
     };

     /**
      * Returns the box wrapper to add next compare symbol
      * Since compare symbols are shown in two-by-two array, two of each legends wrapped together inside a box wrapper
      * @param $legendComp
      * @returns {*}
      * @private
      */
     var _getCurrentCompBoxWrapper = function ($legendComp) {
         var lastBoxEl = $legendComp.find("[inf-comp-box]:last-child"),
             addBox, legendCompEl;

         if (lastBoxEl.length == 0) {
             addBox = true;
         } else {
             var itemCount = lastBoxEl.find("[inf-legend-item]").length;
             if (itemCount == 2) {
                 addBox = true;
             }
         }

         if (addBox) {
             legendCompEl = $legendComp[0];
             if (legendCompEl) {
                 legendCompEl.insertAdjacentHTML('beforeend', '<div class="box" inf-comp-box></div>');
                 lastBoxEl = legendCompEl.lastElementChild;
             }
         } else {
             lastBoxEl = lastBoxEl[0];
         }
         /* var boxEls = $legendComp.find("[inf-comp-box]"),
          addBox, legendCompEl, lastBoxEl;

          if (boxEls.length <= 1 ) {
          addBox = true;
          }

          if (addBox) {
          legendCompEl = $legendComp[0];
          if (legendCompEl) {
          legendCompEl.insertAdjacentHTML('beforeend', '<div class="tooltip-row-container" inf-comp-box></div>');
          lastBoxEl = legendCompEl.lastElementChild;
          }
          } else {
          var minCount = 0, minBox;
          for(var i=0, iLen = boxEls.length;  i< iLen; i++) {
          var itemCount = $(boxEls[i]).find("[inf-legend-item]").length;
          if (itemCount < minCount || !minBox ) {
          minBox = boxEls[i];
          minCount = itemCount;
          }
          }
          lastBoxEl = minBox;
          }

          //https://xinfiit.atlassian.net/browse/CCA-3660*/

         return lastBoxEl;
     };

     /**
      * set legend for series
      * @param containerId
      * @param seriesId
      * @param seriesInfType
      * @param title
      * @param color
      * @param seriesType
      * @param settingsFn
      * @param refreshFn
      * @param closeFn
      * @private
      */
     var _setLegendForSeries = function (containerId, seriesId, seriesInfType, title, color, seriesType, settingsFn, refreshFn, closeFn, tooltipEnabled, onSymbolTitleLegendClicked, hideFn, isVisible) {
         var legendEl = $("#" + containerId).find("[inf-legend]"), legendItemEl,
             settingsEnabled = typeof settingsFn === 'function',
             refreshEnabled = typeof refreshFn === 'function',
             closeEnabled = typeof closeFn === 'function',
             hideEnabled = typeof hideFn === 'function';

         switch (seriesInfType) {
             case 'base':
                 var legendBaseEl = legendEl.find("[inf-legend-base-symbol]");
                 legendItemEl = legendBaseEl.find("[inf-legend-item][inf-series=" + seriesId + "]");
                 if (!legendItemEl || legendItemEl.length == 0) {
                     legendBaseEl[0].innerHTML = _getBaseSymbolLegendItemHTML(seriesId, title, color, settingsEnabled, refreshEnabled, closeEnabled);
                     _bindLegendEvents(legendBaseEl, seriesId, settingsFn, refreshFn, closeFn, onSymbolTitleLegendClicked);
                 } else {
                     _updateBaseSymbolLegendItemHTML(legendItemEl, color, title, seriesType);
                 }
                 break;
             case 'compare':
                 var legendComp = legendEl.find("[inf-legend-comp-symbol]");
                 legendItemEl = legendComp.find("[inf-legend-item][inf-series=" + seriesId + "]");
                 if (!legendItemEl || legendItemEl.length == 0) {
                     if (!legendComp.is(':visible')) {
                         legendComp.show();
                     }
                     var lastBoxEl = _getCurrentCompBoxWrapper(legendComp);
                     lastBoxEl.insertAdjacentHTML('beforeend', _getComparisonLegendItemHTML(seriesId, title, color, settingsEnabled, refreshEnabled, closeEnabled, tooltipEnabled, hideEnabled));
                     _bindLegendEvents($(lastBoxEl), seriesId, settingsFn, refreshFn, closeFn, undefined, hideFn);
                     var legendElement = $(lastBoxEl).find('div[inf-series = "' + seriesId + '"]');
                     _updateComparisonLegendItemShowHide(legendElement, color, hideEnabled, isVisible);
                 } else {
                     _updateComparisonLegendItemHTML(legendItemEl, color, hideEnabled, isVisible);
                 }
                 break;
             case 'indicator':
                 var legendInd = legendEl.find("[inf-legend-ind]");
                 legendItemEl = legendInd.find("[inf-legend-item][inf-series=" + seriesId + "]");
                 if (!legendItemEl || legendItemEl.length == 0) {
                     if (!legendInd.is(':visible')) {
                         legendInd.show();
                     }
                     legendInd[0].insertAdjacentHTML('beforeend', _getIndicatorLegendItemHTML(seriesId, title, color, settingsEnabled, refreshEnabled, closeEnabled, hideEnabled));
                     _bindLegendEvents(legendInd, seriesId, settingsFn, refreshFn, closeFn, undefined, hideFn);
                 } else {
                     _updateIndicatorLegendItemHTML(legendItemEl, color, hideEnabled, isVisible);
                 }
                 break;
             default:
                 break;
         }
     };

     /**
      * Apply classes suits for the given chart dimensions to arrange the structure od the legend
      * @param element
      * @param chartWidth
      * @private
      */
     var _rearrangeLegendStructure = function (element, chartWidth) {
         var legendContainerEl = element.find("[inf-legend]");
         if (chartWidth > 1040) {
             legendContainerEl.removeClass('compact-legend');
         } else {
             legendContainerEl.addClass('compact-legend');
         }
     };

     /**
      * Reposition legend items to avoid spaces between boxes
      * @param containerId
      * @param currentBox
      * @private
      */
     var _repositionComparisonLegends = function (containerId, currentBox) {
         var boxes = document.querySelectorAll("#" + containerId + ' [inf-legend] [inf-legend-comp-symbol] div[inf-comp-box]');
         var i = 0, len = boxes.length, currentBoxFound = false;
         for (i; i < len; i++) {
             if (!currentBoxFound) {
                 currentBoxFound = boxes[i] === currentBox;
             }
             if (currentBoxFound) {
                 if (i + 1 < len) {
                     var node = boxes[i + 1].removeChild(boxes[i + 1].firstElementChild);
                     boxes[i].appendChild(node);
                 } else {
                     if (boxes[i].children.length === 0) {
                         boxes[i].parentNode.removeChild(boxes[i]);
                     }
                 }
             }
         }
     };

     /**
      * Removing legend of the given series id and reposition legends if required.
      * @param containerId
      * @param seriesId
      * @param infType
      * @private
      */
     var _removeLegendItem = function (containerId, seriesId, infType) {
         var legItem = $("#" + containerId).find("[inf-legend] [inf-legend-item][inf-series=" + seriesId + "]");

         if (legItem && legItem[0]) {//todo : unbind click events???
             var parent = legItem[0].parentNode;
             parent.removeChild(legItem[0]);
             if (infType == 'compare') {
                 if (parent.children.length > 0) {//if box is empty no need to reposition
                     if (parent.nextSibling != null && parent.nextSibling.children.length > 0) {
                         // since boxed of two items shown in the comparison legend it need to be reposition to avoid spaces between boxes.
                         _repositionComparisonLegends(containerId, parent);
                     }
                 } else {
                     parent.parentNode.removeChild(parent);
                 }
             }
         }
     };

     /**
      * clean legend content
      * @param containerId
      * @private
      */
     var _cleanLegendContainer = function (containerId) {
         $("#" + containerId).find("[inf-legend] [legend-section]").html('');
     };

     /**
      * Update tooltip data for symbols
      * @param legendContainer
      * @param baseHTML
      * @param compareSymHTML
      * @private
      */
     var _updateSymbolDataInLegend = function (legendContainer, baseHTML, compareSymHTML) {
         var legendEl = legendContainer.find("[inf-legend]"),
             baseEl = legendEl.find("[inf-legend-base-symbol]"),
             baseSymbolBasicDataEL = legendEl.find("[inf-legend-base-symbol-basic-data] [inf-legend-items]"),
             baseTime,
             baseTimeParent;

         baseEl.find("[inf-tooltip-items]").remove();

         // updating base symbol
         if (baseHTML && baseEl[0]) {
             var htmlArray = [],
                 baseElTTHTMLArr = [];
             for (var key in baseHTML) {
                 if (baseHTML.hasOwnProperty(key)) {
                     if (key === 'time') {
                         var symWithTimeEl = baseEl.find("[legend-sym-with-tt]");
                         if (symWithTimeEl && symWithTimeEl[0]) {
                             symWithTimeEl[0].xRemoveChild(symWithTimeEl.find("[legend-tt]")[0]);
                             symWithTimeEl[0].xAppend(baseHTML[key]);
                             symWithTimeEl[0].lastChild.setAttribute("legend-tt", "");
                             baseTime = symWithTimeEl[0].lastChild.innerHTML;
                             baseTimeParent = baseHTML[key];
                         }
                     } else if (key === 'bidAskHistory') {
                         var bidAskHistoryEl = baseEl.find("[legend-bid-ask-history]");
                         if (bidAskHistoryEl && bidAskHistoryEl[0]) {
                             bidAskHistoryEl.html(baseHTML[key]);
                         }
                     } else {
                         if (htmlArray.length === 2) {
                             baseElTTHTMLArr.xPush(['<div class="box" inf-tooltip-items>', htmlArray.join(''), '</div>'].join(''));
                             htmlArray = [baseHTML[key]];
                         } else {
                             htmlArray.xPush(baseHTML[key]);
                         }
                     }
                 }
             }

             if (htmlArray.length > 0) {
                 baseElTTHTMLArr.xPush(['<div class="box" inf-tooltip-items>', htmlArray.join(''), '</div>'].join(''));
             }

             baseSymbolBasicDataEL[0].xAppend(baseElTTHTMLArr.join(''));
         }

         // compare symbols

         var compEl = legendEl.find("[inf-legend-comp-symbol]");
         if (compEl.find("[inf-legend-item]").length > 0) {

             // update empty values first
             var legendItemContainers = compEl.find("[inf-tooltip-items-container]");

             for (var i = 0, iLen = legendItemContainers.length; i < iLen; i++) {

                 var contTemp = legendItemContainers[i],
                     $contTemp = $(contTemp),
                     ttItems = $contTemp.find("[inf-tooltip-items]");
                 if (ttItems.length) {

                     // updating compare symbols when having previous values
                     ttItems.find("[tt-val]").text('--');

                     if (baseTime) {
                         $contTemp.find("[inf-tooltip-items][legend-tt]").html(baseTime);
                     } else {
                         ttItems.find("[tt-date]").text('--');
                         ttItems.find("[tt-time]").text('--');
                     }
                 } else {

                     // compare symbols those have no previous data
                     contTemp.xAppend(infChart.structureManager.tooltip.getTooltipValueItemHtml("close", '--', undefined, true, false));
                     contTemp.lastChild.setAttribute("inf-tooltip-items", "");

                     contTemp.xAppend(infChart.structureManager.tooltip.getTooltipValueItemHtml("volume", '--', undefined, false, true));
                     contTemp.lastChild.setAttribute("inf-tooltip-items", "");

                     /*if(baseTimeParent) {
                      contTemp.xAppend(baseTimeParent);
                      contTemp.lastChild.setAttribute("inf-tooltip-items", "");
                      contTemp.lastChild.setAttribute("legend-tt", "");
                      }*/
                 }

             }

             if (compareSymHTML) {
                 for (var sym in compareSymHTML) {
                     if (compareSymHTML.hasOwnProperty(sym)) {
                         var compLegendContainer = compEl.find("[inf-series=" + sym + "] [inf-tooltip-items-container]");
                         compLegendContainer.find("[inf-tooltip-items]").remove();
                         for (var compKey in compareSymHTML[sym]) {
                             if (compareSymHTML[sym].hasOwnProperty(compKey) && compLegendContainer[0]) {
                                 compLegendContainer[0].xAppend(compareSymHTML[sym][compKey]);
                                 compLegendContainer[0].lastChild.setAttribute("inf-tooltip-items", "");
                                 if (compKey == "time") {
                                     compLegendContainer[0].lastChild.setAttribute("legend-tt", "");
                                 }
                             }
                         }
                     }
                 }
             }
         }
     };

     /**
      * Executes on mouse hover of the series and highlights the series in the legend
      * @param containerId
      * @param seriesId
      * @param infType
      * @param tooltipEnabled
      * @private
      */
     var _onSeriesMouseOver = function (containerId, seriesId, infType, tooltipEnabled) {

         if (infType == "compare") {
             var $container = $("#" + containerId),
                 $legend = $container.find("[inf-legend]"),
                 $legItems = $legend.find("[inf-legend-item]"),
                 $item = $legend.find("[inf-series=" + seriesId + "]"),
                 color = $item.attr("inf-legend-color"),
                 $ttItems = $item.find("[inf-legend-items]");
             //colorObject = infChart.util.rgbString2hex(color),
             //colorStr = colorObject.red ? "rgba("+colorObject.red+","+colorObject.green + "," + colorObject.blue + ",0.3)" :
             //colorObject.hex + "" + "4d";

             $legItems.removeClass("active");
             $item.addClass("active");
             $ttItems.css('color', color);

             // set the color of the series as background color with a low opacity
             //$item.find("[inf-legend-items]").css('background-color' , colorStr);

         }
     };

     /**
      * Executes when mouse is leaving from a series and de-highlights the legend of the series
      * @param containerId
      * @param seriesId
      * @param infType
      * @param tooltipEnabled
      * @private
      */
     var _onSeriesMouseOut = function (containerId, seriesId, infType, tooltipEnabled) {
         var $container = $("#" + containerId),
             $item = $container.find("[inf-legend] [inf-legend-item][inf-series=" + seriesId + "]"),
             $ttItems;

         if (infType == "compare") {

             $item.removeClass("active");
             if (tooltipEnabled) {
                 $ttItems = $item.find("[inf-legend-items]");
                 $ttItems.css({'color': ''});
             }
         }
     };

     /**
      * Clean tooltip data from the series
      * @param containerId
      * @param seriesId
      * @param infType
      * @private
      */
     var _cleanSeriesData = function (containerId, seriesId, infType) {
         var $legend = $("#" + containerId).find("[inf-legend]");
         if (infType == "base") {
             var baseEl = $legend.find("[inf-legend-base-symbol]");

             baseEl.find("[inf-tooltip-items]").remove();
             baseEl.find("[legend-tt]").remove();
         } else {
             //other symbols goes here
             if (infType == "compare") {
                 var $item = $legend.find("[inf-series=" + seriesId + "]");
                 $item.find("[inf-tooltip-items]").remove();
             }
         }
     };

     var _setCompareSymbolColor = function (containerId, tooltipEnabled) {
         var $legendComp = $("#" + containerId).find("[inf-legend-comp-symbol]"),
             $legendItems = $legendComp.find("[inf-legend-item]"),
             $compItem, i, iLen;

         if (tooltipEnabled) {
             for (i = 0, iLen = $legendItems.length; i < iLen; i++) {
                 $compItem = $($legendItems[i]);
                 $compItem.find("[inf-legend-items]").css('color', '');
                 $compItem.find("[inf-tooltip-items-container]").css('color', $compItem.attr("inf-legend-color"));
             }
         } else {
             for (i = 0, iLen = $legendItems.length; i < iLen; i++) {
                 $compItem = $($legendItems[i]);
                 $compItem.find("[inf-legend-items]").css('color', $compItem.attr("inf-legend-color"));
             }
         }

     };

     /**
      * Show/hide data in the legend when toggling the tooltip
      * @param containerId
      * @param enabled
      * @private
      */
     var _toggleLegendTooltip = function (containerId, enabled) {
         if (enabled) {
             $("#" + containerId).find("[inf-legend]").removeClass("hide-tooltip");
         } else {
             $("#" + containerId).find("[inf-legend]").addClass("hide-tooltip");
         }
         _setCompareSymbolColor(containerId, enabled);
     };

     return {
         getStructureHTML: _getLegendStructureHTML,
         setLegendForSeries: _setLegendForSeries,
         rearrangeLegendStructure: _rearrangeLegendStructure,
         // repositionComparisonLegends: _repositionComparisonLegends,
         removeLegendItem: _removeLegendItem,
         updateSymbolDataInLegend: _updateSymbolDataInLegend,
         cleanLegendContainer: _cleanLegendContainer,
         onSeriesMouseOver: _onSeriesMouseOver,
         onSeriesMouseOut: _onSeriesMouseOut,
         toggleTooltip: _toggleLegendTooltip,
         cleanSeriesData: _cleanSeriesData
     };
 })(jQuery, infChart);

 infChart.structureManager.tooltip = (function ($) {

     /**
      * Returns the html string of the key value pair
      * @param key
      * @param value
      * @param isPositive
      * @param hideLabel to hide the price label
      * @param showParentheses to cover value by parentheses
      * @returns {string}
      * @private
      */
     var _getTooltipValueItemHtml = function (key, value, isPositive, hideLabel, showParentheses) {
         if (key === 'time') {
             var v = value.split(' ');
             return '<div class="value">' +
                 '<span class="lbl-time">' +
                 '<span tt-date class="date">' + v[0] + '</span>&nbsp;' +
                 '<span tt-time >' + (v[1] || '') + '</span>' +
                 '</span>' +
                 '</div>';
         } else if (key === 'bidAskHistory') {
             return value ? '<div class="bid-last-L-ask-last-H">' +
             '<div class="bid-last-L-ask-last-H-item-wrapper bid-last-L"><span class="box"></span><p>Bid</p>' +
             '<p class="value"> <span>Last</span><span>' + value.bidLast + '</span> <span>L</span><span>' + value.bidLow + '</span></p>' +
             '</div>' +
             '<div class="bid-last-L-ask-last-H-item-wrapper ask-last-H"><span class="box"></span><p>Ask</p>' +
             '<p class="value"> <span>Last</span><span>' + value.askLast + '</span> <span>H</span><span>' + value.askHigh + '</span> </p>' +
             '</div> </div>' : '';

         } else {
             var valueToShow =
                 (!hideLabel ? '<span class="lbl">' + infChart.manager.getLabel('label.tooltip.' + key) + '</span>' : '') +
                 '<span tt-val class="' + (showParentheses ? '' : ' val ') + (typeof isPositive === 'undefined' ? '' : infChart.structureManager.common.getPriceChangeClass(isPositive)) + '">' + (value != null ? value : '--') + '</span>';
             return '<div class="value">' + (showParentheses ? "(" + valueToShow + ")" : valueToShow) + '</div>';
         }
     };

     var _getIndicatorTooltipHtml = function (valueHtmlItems) {
         var html = '';
         if (typeof valueHtmlItems !== 'undefined') {
             html = '<span class="tooltip1"><span class="tooltip1_table">';
             for (var key in valueHtmlItems) {
                 if (valueHtmlItems.hasOwnProperty(key)) {
                     html += valueHtmlItems[key];
                 }
             }
             html += '</span></span>';
         }
         return html;
     };

     var _getIndicatorTooltipValueItemHtml = function (key, value, color) {
         if (key === 'time') {
             return '<span class="tooltip1_tr">' +
                 '<span class="tooltip1_td">&nbsp;</span>' +
                 '<span class="tooltip1_td">&nbsp;</span>' +
                 '<span class="tooltip1_td">' + value + '</span>' +
                 '</span>';
         } else {
             return '<span class="tooltip1_tr">' +
                 '<span class="tooltip1_td" style="background-color:' + color + '" >&nbsp;</span>' +
                 '<span class="tooltip1_td">' + key + '</span>' +
                 '<span class="tooltip1_td" style="text-align: right">' + value + '</span>' +
                 '</span>'
         }
     };

     var _getNewsTooltipValueItemHtml = function (headline) {
         return '<span class="tooltip1_tr news"><span class="tooltip1_td title">' + headline + '</span></span>';
     };

     var _getFlagsTooltipValueItemHtml = function (flag, color) {
         return '<span class="tooltip1_tr flags">' +
             '<span class="tooltip1_td" style="background-color:' + color + '" >&nbsp;</span>' +
             '<span class="tooltip1_td ">' + flag + '</span>' +
             '</span>';
     };

     /**
      * Doing structural changes when toggling the tooltip
      * @param containerId
      * @param enabled
      * @private
      */
     var _toggleToolTip = function (containerId, enabled) {
         infChart.structureManager.legend.toggleTooltip(containerId, enabled);
     };

     return {
         getTooltipValueItemHtml: _getTooltipValueItemHtml,
         getIndicatorTooltipValueItemHtml: _getIndicatorTooltipValueItemHtml,
         getNewsTooltipValueItemHtml: _getNewsTooltipValueItemHtml,
         getFlagsTooltipValueItemHtml: _getFlagsTooltipValueItemHtml,
         getIndicatorTooltipHtml: _getIndicatorTooltipHtml,
         toggleTooltip: _toggleToolTip
     }
 })(jQuery);

 infChart.structureManager.settings = (function ($, infChart) {

     /**
      * @typedef {object} rowItem
      * @property {string} [id] - unique id
      * @property {string} body - html content
      * @property {string} [title] - optional
      * @property {boolean} [isLabel=true] - is the title a label
      */

     /**
      * @typedef {object} sectionRow
      * @property {Array<rowItem>} items - section rows
      * @property {string} [cssClass] - optional
      */

     /**
      * @typedef {object} section
      * @property {Array<sectionRow>} rows - section rows
      * @property {string} [title] - optional
      */

     /**
      * get row item object
      * @param {string} [id]
      * @param {string} body
      * @param {string} title
      * @param {boolean} [isLabel]
      * @returns {rowItem}
      * @private
      */
     var _getRowItem = function (body, title, isLabel, id, cssClass) {
        return {
            'id': id,
            'title': title,
            'body': body,
            'isLabel': typeof isLabel === 'undefined' ? true : isLabel,
            'cssClass' : cssClass
        };
    };

     /**
      * get section object
      * @param {Array<rowItem>} items
      * @param {string} [cssClass]
      * @returns {sectionRow}
      * @private
      */
     var _getSectionRow = function (items, cssClass) {
         return {
             'items': items,
             'cssClass': cssClass
         };
     };

     /**
      * get section object
      * @param {Array<sectionRow>} items
      * @param {string} [title]
      * @returns {section}
      * @private
      */
     var _getSection = function (items, title) {
         return {
             'title': title,
             'rows': items
         };
     };

     //region control html

     /**
      * get mini color palette html
      * @param {string} ctrlType - tag used to identify the control
      * @param {string} ctrlValue - fib level id - P_all for all control
      * @param {string} color - hex color
      * @param {string} position - position of the palette
      * @param {number} opacity - color opacity
      * @param {string} iconClass - icon uesed in fib color palete
      * @returns {string} mini color html
      */
    var _getMiniColorPaletteHTML = function (ctrlType, ctrlValue, color, position, opacity, iconClass, mainClass, subType) {
        var opacityValue = parseFloat(opacity);
        return '<div class="change-color ' + (mainClass ? mainClass : '') + '">' +
            '<input type="hidden" inf-ctrl="' + ctrlType + '"sub-type="' + (subType ? subType : '') + '" inf-ctrl-val="' + ctrlValue + '" value="' + color + '"' +
            (typeof position === 'undefined' ? ' data-position="bottom-left"' : ' data-position="' + position + '"') +
            ((isNaN(opacityValue)) ? ' opacity="false"' : ' data-opacity="' + opacityValue + '"') + '>' +
            (iconClass ? '<div class="color-inner-box"><span class="'+ iconClass +'"></span></div>' : '') +
            '</div>';
     }

     /**
      * common class to get color pallet html
      * @param {string} ctrlType - tag used to identify the control
      * @param {string} ctrlValue - fib level id - P_all for all control
      * @param {string} color - hex color
      * @param {number} opacity - color opacity
      * @param {string} position - position of the palette
      * @returns {string} color palette html
      */
     var _getColorPaletteHTML = function (ctrlType, ctrlValue, color, opacity, position) {
         return '<div class="color-palette">' +
             '<div class="single-color-box">' +
             _getMiniColorPaletteHTML(ctrlType, ctrlValue, color, position, opacity) +
             '</div>' +
             '</div>';
     };

     /**
      * get line weight html - common method used as buttons and dropdown
      * @param {string} typeClass - class used for buttons and dropdown - default as buttons
      * @param {string} ctrlType - tag used to identify the control - default no type, used in fibs
      * @returns {string} get list elements html
      */
     var _getLineWeightHTML = function (typeClass, ctrlType) {
         return '<ul class="' + (typeClass ? typeClass : 'selection-types') + '"' + (ctrlType ? 'inf-ctrl="' + ctrlType + '"' : '') + '>' +
             '<li inf-ctrl="lineWidth" inf-size="1"><a><span class="line-weight-space">&#x2F;</span></a></li>' +
             '<li inf-ctrl="lineWidth" inf-size="2"><a><span class="line-weight-space">&#x2F;&#x2F;</span></a></li>' +
             '<li inf-ctrl="lineWidth" inf-size="3"><a><span class="line-weight-space">&#x2F;&#x2F;&#x2F;</span></a></li>' +
             '</ul>';
     };


    var _getArrowHeadTypeHTML = function (typeClass, ctrlType) {
        return '<ul class="' + (typeClass ? typeClass : 'selection-types') + '"' + (ctrlType ? 'inf-ctrl="' + ctrlType + '"' : '') + '>' +
            '<li inf-ctrl="' + ctrlType + 'ArrowHeadType" inf-ctrl-val=true inf-type="arrowHead"><a><span class="icom icom-line-arrow-left"></span></a></li>' +
            '<li inf-ctrl="' + ctrlType + 'ArrowHeadType" inf-ctrl-val=false inf-type="normalHead"><a><span class="icon ico-dash-1"></span></a></li>' +
            '</ul>';
    };

    var _getGridLineWeightHTML = function (typeClass, ctrlType) {
        return '<ul class="' + (typeClass ? typeClass : 'selection-types') + '"' + (ctrlType ? 'inf-ctrl="' + ctrlType + '"' : '') + '>' +
            '<li inf-ctrl="gridLineWidth" inf-size="1"><a><span class="line-weight-space">&#x2F;</span></a></li>' +
            '<li inf-ctrl="gridLineWidth" inf-size="2"><a><span class="line-weight-space">&#x2F;&#x2F;</span></a></li>' +
            '<li inf-ctrl="gridLineWidth" inf-size="3"><a><span class="line-weight-space">&#x2F;&#x2F;&#x2F;</span></a></li>' +
            '<li inf-ctrl="gridLineWidth" inf-size="4"><a><span class="line-weight-space">&#x2F;&#x2F;&#x2F;&#x2F;</span></a></li>' +
            '</ul>';
    };

    var _getCustomCandleCount = function (ctrlType, ctrlValue) {
        return '<input min="0" max="1000" inf-ctrl="' + ctrlType + '" inf-value="' + ctrlValue + '"  class="fib-levels-input c-form-control text--right" maxlength="4" type="text" data-value="' + ctrlValue + '" value="' + ctrlValue + '" ><p rel="candle-count-error" class="error"></p>';
    };

    var _getChartBackgroundOptionHTML = function () {
        return '<p class="item-label"><input id="solid" checked="checked" name="bgOptions" inf-ctrl="backgroundType" type="radio" inf-type="solid">Solid</p>' +
               '<p class="item-label"><input id="gradient" name="bgOptions" inf-ctrl="backgroundType" type="radio" inf-type="gradient">Gradient</p>';
    };

    var _getChartSessionOrTimeBreakOptionHTML = function (chartId) {
        let sessionTimeBreaks = infChart.settings.config.sessionTimeBreakSettings;
        sessionTimeBreaks = Object.values(sessionTimeBreaks);
        let breakSettings = infChart.manager.getChart(chartId).sessionTimeBreakSettings;

        let html = '<div inf-ctrl="sessionTimeBreaks" class="item-label session-time-breaks"><input setCheckedProp name="breakOptions-' + chartId + '" inf-ctrl="sessionTimeBreaks" type="radio" inf-type="none" id="breaks-none"> <label for="breaks-none">None</label> </div>';
        let isBreakSelected = false;

        if (breakSettings) {
            sessionTimeBreaks.forEach(function (sTBreak) {
                let setting = breakSettings[sTBreak.key];

                if (!isBreakSelected) {
                    isBreakSelected = setting.show;
                }

                html += '<div inf-ctrl="sessionTimeBreaks" class="item-label session-time-breaks"><input ' + (setting.show ? "checked" : "") + ' name="breakOptions-' + chartId + '" inf-ctrl="sessionTimeBreaks" type="radio" inf-type="' + sTBreak.key + '" id="breaks-' + sTBreak.key + '">' +
                    '<label for="breaks-' + sTBreak.key + '">' + sTBreak.label + '</label>' +
                    _getMiniColorPaletteHTML(sTBreak.key + "-color", "color", setting.color, "bottom right", undefined, undefined, "session-break" ) +
                    '<div inf-ctrl="lineStyle_' + sTBreak.key + '" class="dropdown line-style">' +
                    '<button class="dropdown-toggle" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">' +
                    '<span inf-ctrl="selectedLineStyle" class="weight-line" inf-style="' + setting.lineStyle + '" inf-type="'+sTBreak.key+'"><i inf-ctrl="selectedStyleIcon" class="icon ico-ellipsis-2" class="icon ' + (setting.lineType === "dash" ? "ico-ellipsis-2" : "ico-minus-1") + '"></i></span>' +
                    '<span class="caret"></span>' +
                    '</button>' +
                    _getLineStyleHTML('dropdown-menu', sTBreak.key + "-line-style") +
                    '</div>' +
                    '</div>';
            });

            html = html.replace("setCheckedProp", !isBreakSelected ? "checked" : "");
        }

        return html;
    };

     var _getLineStyleHTML = function (typeClass, ctrlType) {
         return '<ul class="' + (typeClass ? typeClass : 'selection-types') + '"' + (ctrlType ? 'inf-ctrl="' + ctrlType + '"' : '') + '>' +
             '<li inf-ctrl="lineStyle" inf-style="solid"><a><i class="icon ico-minus-1"></i></a></li>' +
             '<li inf-ctrl="lineStyle" inf-style="dash"><a><i class="icon ico-ellipsis-2"></i></a></li>' +
             '</ul>';
     };

     var _getFontWeightHTML = function () {
         return '<ul class="selection-types">' +
             '<li inf-ctrl="fontStyle" inf-style="bold"><a><i class="icon ico-bold-2"></i></a></li>' +
             '<li inf-ctrl="fontStyle" inf-style="italic"><a><i class="icon ico-italic-2"></i></a></li>' +
             '<li inf-ctrl="fontStyle" inf-style="underline"><a><i class="icon ico-underline-1"></i></a></li>' +
             '</ul>';
     };

     var _getAlighStyleHTML = function (subType) {
        return '<ul class="selection-types" ' + (subType ? 'inf-ctrl="' + subType + '"' : '') + '>' +
            '<li inf-ctrl="alignStyle" inf-style="bottomLeft"><a><i class="icom icom-align-bottom-left"></i></a></li>' +
            '<li inf-ctrl="alignStyle" inf-style="topLeft"><a><i class="icom icom-align-top-left"></i></a></li>' +
            '<li inf-ctrl="alignStyle" inf-style="bottomCenter"><a><i class="icom icom-align-bottom-center"></i></a></li>' +
            '<li inf-ctrl="alignStyle" inf-style="topCenter"><a><i class="icom icom-align-top-center"></i></a></li>' +
            '<li inf-ctrl="alignStyle" inf-style="bottomRight"><a><i class="icom icom-align-bottom-right"></i></a></li>' +
            '<li inf-ctrl="alignStyle" inf-style="topRight"><a><i class="icom icom-align-top-right"></i></a></li>' +
            '</ul>';
     }

    var _getFontSizeHTML = function (fontSize, classDropup, start, end, additionalClass) {
        var ctrlType = "single";
        var dropDownClass = additionalClass ? 'dropdown-menu ' + additionalClass : 'dropdown-menu';
        return '<div class="dropdown ' + (classDropup ? classDropup : '') + ' font-size">' +
                '<button class="c-btn c-btn--default dropdown-toggle" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">' +
                    '<span inf-ctrl="' + ctrlType + 'SelectedFontSize" inf-ctrl-val="P_all" inf-size="' + fontSize + '">' + fontSize + '</span>' +
                    '<span class="caret"></span>' +
                '</button>' +
                _getLabelFontSizeListHTML(dropDownClass, ctrlType, start, end) +
            '</div>';
    };

    var _getWaveDegreeHTML = function (waveDegree, waveDegreesList) {
        var ctrlType = "single";
        var waveDegreeSelected;
        infChart.util.forEach(waveDegreesList, function(index , value){
            if(value.name == waveDegree){
                waveDegreeSelected = value;
            }
        });
        return '<div class="w--100 opened-list">' +
                _getWaveDegreeListHTML('dropdown-menu', ctrlType, waveDegreesList, waveDegree) +
            '</div>';
    };

     //This method returns wave degree from all levels
     var _getWaveDegreeListHTML = function (typeClass, ctrlType, waveDegreesList, waveDegree) {
         var list = "";
         infChart.util.forEach(waveDegreesList, function(index , value){
            var item = '<li class="' + ( value.name == waveDegree ? 'active' : '' ) + '"inf-ctrl="waveDegree" inf-type=' + value.name + '><a><span>' + infChart.manager.getLabel(value.label) + '</span></a></li>';
            list = list + item;
        });

         return '<ul class="w--100"' + (ctrlType ? 'inf-ctrl="' + ctrlType + '"' : '') + '>' +
             list + '</ul>';
     };

    //This method returns font size list items from 7 to 40
    var _getLabelFontSizeListHTML = function (typeClass, ctrlType, start, end) {
        var list = "";
        var start = start || 7;
        var end = end || 40; 
        for (var i = start; i <= end; i++){
            var item = '<li inf-ctrl="fontSize" inf-size=' + i +'><a><span class="line-weight-space">' + i + '</span></a></li>';
            list = list + item;
        }
        return '<ul class="' + (typeClass ? typeClass : 'selection-types') + '"' + (ctrlType ? 'inf-ctrl="' + ctrlType + '"' : '') + '>' +
            list + '</ul>';
    };

     //endregion

     //region row items

     /**
      * line weight
      * @returns {{title, body, isLabel}|rowItem}
      * @private
      */
     var _getLineWeightRowItem = function (typeClass, ctrlType) {
         return _getRowItem(_getLineWeightHTML(typeClass, ctrlType), 'label.lineWeight');
     };

    var _getArrowHeadRowItem = function (typeClass, ctrlType, label) {
        return _getRowItem(_getArrowHeadTypeHTML(typeClass, ctrlType), label);
    };

    var _getGridLineWeightRowItem = function (typeClass, ctrlType) {
        return _getRowItem(_getGridLineWeightHTML(typeClass, ctrlType), 'label.gridLineWeight');
    };

    var _getCandleCountRowItem = function (ctrlType, ctrlValue) {
        return _getRowItem(_getCustomCandleCount(ctrlType, ctrlValue), 'label.customCandleCount');
    };

    var _getChartBackgroundOptionRowItem = function () {
        return _getRowItem(_getChartBackgroundOptionHTML(), 'label.backgroundType');
    };

    var _getChartSessionOrDayBreakRowItem = function (chartId) {
        return [_getRowItem(_getChartSessionOrTimeBreakOptionHTML(chartId), 'label.sessionOrTimeBreaks')];
    };

     /**
      * line style
      * @returns {{title, body, isLabel}|rowItem}
      * @private
      */
     var _getLineStyleRowItem = function (typeClass, ctrlType) {
         return _getRowItem(_getLineStyleHTML(typeClass, ctrlType), 'label.lineStyle');
     };

     /**
      * font weight
      * @returns {{title, body, isLabel}|rowItem}
      * @private
      */
     var _getFontWeightRowItem = function () {
         return _getRowItem(_getFontWeightHTML(), 'label.fontStyle');
     };

    /**
     * font weight
     * @returns {{title, body, isLabel}|rowItem}
     * @private
     */
    var _getTextAlignRowItem = function (subType) {
        return _getRowItem(_getAlighStyleHTML(subType), 'label.textAlign');
    };

     /**
      * font size
      * @returns {{title, body, isLabel}|rowItem}
      * @private
      */
     var _getFontSizeRowItem = function (fontSize, classDropup, start, end, additionalLabel) {
        var labelName = additionalLabel || 'label.fontSize'
         return _getRowItem(_getFontSizeHTML(fontSize, classDropup, start, end), labelName );
     };


     /**
      * wave degree
      * @returns {{title, body, isLabel}|rowItem}
      * @private
      */
      var _getWaveDegreeRowItem = function (waveDegree, waveDegreesList) {
        return _getRowItem(_getWaveDegreeHTML(waveDegree, waveDegreesList), 'label.waveDegree');
    };

     /**
      * color picker
      * @param title
      * @param ctrlType
      * @param color
      * @param [position]
      * @param [opacity]
      * @param [ctrlValue]
      * @param [isLabel]
      * @returns {{title, body, isLabel}|rowItem}
      * @private
      */
     var _getColorPickerRowItem = function (ctrlType, color, opacity, ctrlValue, position, title, isLabel) {
         return _getRowItem(_getColorPaletteHTML(ctrlType, ctrlValue, color, opacity, position), title, isLabel);
     };

     /**
      * create the color picker control with given body and other specifications
      * @param uniqueId
      * @param upColorPick
      * @param downColorPick
      * @param body
      * @returns {string} colorpicker html
      * @private
      */
     var _getColorPickerCtrlHTML = function (uniqueId, upColorPick, downColorPick, body) {
         var pickref = "color-ref-" + uniqueId,
             colorPickRel = !( upColorPick || upColorPick) ? 'inf-col-pick="colorPicker"' : '';

         if (upColorPick) {
             colorPickRel += 'inf-col-pick-up="' + upColorPick + '"';
         }
         if (downColorPick) {
             colorPickRel += 'inf-col-pick-down="' + downColorPick + '"';
         }

         return '<div inf-col-pick-container ' + colorPickRel + ' rel="' + uniqueId + '" inf-ref="' + pickref + '" class="tab-pane fade" >' + body + '</div>'
     };

     var _getChartSettingsPanel = function(chart) {

        var backgroundType = chart.chart.options.chart.backgroundColor && typeof chart.chart.options.chart.backgroundColor !== 'string' ? "gradient" : "solid";
        var chartSettingHTML = '<div inf-container="chart-setting-panel" class="chart-settings">';
        var gridSettingHTML = '<div inf-ref="grid-settings">';
        if(chart){
            var xgridColorSettingsHTML = _getSubBodySectionHTML(_getSection([_getSectionRow([
                _getColorPickerRowItem('colorPickerXGridLine', chart.chart.xAxis[0].options.gridLineColor, Highcharts.theme.xAxis.gridLineOpacity, 'xgridLine', 'top left', 'label.xGridLineColor')
            ], 'two-col-row')]));

            var ygridColorSettingsHTML = _getSubBodySectionHTML(_getSection([_getSectionRow([
                _getColorPickerRowItem('colorPickerYGridLine', chart.chart.yAxis[0].options.gridLineColor, Highcharts.theme.yAxis.gridLineOpacity, 'ygridLine', 'top left', 'label.yGridLineColor')
            ], 'two-col-row')]));

            var gridLineWeightSettingsHTML = _getSubBodySectionHTML(_getSection([
                _getSectionRow([_getGridLineWeightRowItem()])
            ]));

            var bgOptionHTML = _getSubBodySectionHTML(_getSection([
                _getSectionRow([_getChartBackgroundOptionRowItem()])
            ]));

            var breaksHTML = _getSubBodySectionHTML(_getSection([
                _getSectionRow(_getChartSessionOrDayBreakRowItem(infChart.manager.getContainerIdFromChart(chart.chartId)))
            ]));

            var backgroundColorHTML = _getSubBodySectionHTML(_getSection([
                _getSectionRow([_getColorPickerRowItem('colorPickerBackground', chart.chart.options.chart.backgroundColor, Highcharts.theme.chart.backgroundColorOpacity, 'background', 'top left', 'label.chartBackgroundColor')], 'two-col-row')
            ]));

            var gradientColorHTML = _getSubBodySectionHTML(_getSection([
                _getSectionRow([_getColorPickerRowItem('colorPickerGradientTop', backgroundType == "gradient" ? chart.chart.options.chart.backgroundColor.stops[0][1] : "transparent", Highcharts.theme.chart.backgroundColorOpacity, 'gradientTop', 'top left', 'label.chartBgGradientTopColor'),
                _getColorPickerRowItem('colorPickerGradientBottom', backgroundType == "gradient" ? chart.chart.options.chart.backgroundColor.stops[1][1] : "transparent", Highcharts.theme.chart.backgroundColorOpacity, 'gradientBottom', 'top right', 'label.chartBgGradientBottomColor')], 'two-col-row')
            ]));

            var candleCountSettingsHTML = _getSubBodySectionHTML(_getSection([
                _getSectionRow([_getCandleCountRowItem('customCandleCount', chart.customCandleCount)], 'sub-section-row--candle-count')
            ]));

            gridSettingHTML += gridLineWeightSettingsHTML;
            gridSettingHTML += _getColorPickerCtrlHTML(chart.chartId, false, false, xgridColorSettingsHTML);
            gridSettingHTML += _getColorPickerCtrlHTML(chart.chartId, false, false, ygridColorSettingsHTML);
            gridSettingHTML += '</div>';

            chartSettingHTML +=  gridSettingHTML;
            chartSettingHTML +=  bgOptionHTML;
            chartSettingHTML += _getColorPickerCtrlHTML(chart.chartId, false, false, backgroundColorHTML);
            chartSettingHTML += _getColorPickerCtrlHTML(chart.chartId, false, false, gradientColorHTML);
            chartSettingHTML +=  candleCountSettingsHTML;
            chartSettingHTML +=  breaksHTML;
        }

        chartSettingHTML += '</div>';
        return _getRowItem(chartSettingHTML, '', true, chart.chartId);

     }

     var _getSeriesContentRowItem = function (seriesId, chartTypes) {

         var chartTypeTabHeaderHTML = '<ul class="selection-types chart-type">', chartTypeTabContentHTML = '<div class="tab-content">';

         infChart.util.forEach(chartTypes, function (i, chartTypeConfig) {
             chartTypeTabHeaderHTML += _getChartTypeOptionHTML(chartTypeConfig.type, seriesId, chartTypeConfig.icon);
             var id = _getIdWithChartTypeAndSeries(chartTypeConfig.type, seriesId), pickref = "color-ref-" + id, html;
             if (chartTypeConfig.colors.color) {
                 if (chartTypeConfig.type === 'line') {
                     html = _getSubBodySectionHTML(_getSection([
                         _getSectionRow([_getLineWeightRowItem()]),
                         _getSectionRow([_getColorPickerRowItem('colorPicker', chartTypeConfig.colors.color, chartTypeConfig.colors.opacity, 'color', 'top left', 'label.lineColor')], 'two-col-row')
                     ]));
                     chartTypeTabContentHTML += _getColorPickerCtrlHTML(id, false, false, html);
                 } else {
                     html = _getSubBodySectionHTML(_getSection([
                         _getSectionRow([_getColorPickerRowItem('colorPicker', chartTypeConfig.colors.color, chartTypeConfig.colors.opacity, 'color', 'top left', 'label.color')], 'two-col-row')
                     ]));
                     chartTypeTabContentHTML += _getColorPickerCtrlHTML(id, false, false, html);
                 }
             } else {
                 if (chartTypeConfig.colors.colUp) {
                     html = _getSubBodySectionHTML(_getSection([_getSectionRow([
                         _getColorPickerRowItem('colorPickerColUp', chartTypeConfig.colors.colUp, chartTypeConfig.colors.opacity, 'up', 'top left', 'label.up'),
                         _getColorPickerRowItem('colorPickerColDown', chartTypeConfig.colors.colDown, chartTypeConfig.colors.opacity, 'down', 'top right', 'label.down')
                     ], 'two-col-row')]));
                     chartTypeTabContentHTML += _getColorPickerCtrlHTML(id, 'colorPickerColUp', 'colorPickerColDown', html);
                 } else {
                     html = _getSubBodySectionHTML(_getSection([_getSectionRow([
                         _getColorPickerRowItem('colorPickerUp', chartTypeConfig.colors.up, chartTypeConfig.colors.opacity, 'up', 'top left', 'label.up'),
                         _getColorPickerRowItem('colorPickerDown', chartTypeConfig.colors.down, chartTypeConfig.colors.opacity, 'down', 'top right', 'label.down')
                     ], 'two-col-row')]));
                     chartTypeTabContentHTML += _getColorPickerCtrlHTML(id, 'colorPickerUp', 'colorPickerDown', html);
                 }
             }
         });

         chartTypeTabHeaderHTML += '</ul>';
         chartTypeTabContentHTML += '</div>';

         return _getRowItem(chartTypeTabHeaderHTML + chartTypeTabContentHTML, 'label.chartType', true, seriesId);
     };

     //endregion

     //region panel html

     var _getPanelHTML = function (parentPanelId, panelId, title, content, disableClose, localizeTitle) {
        var titleHtml = '<span rel="panelTitle" class="title-contents" >' + title + '</span>';
        if (localizeTitle) {
            titleHtml = '<span rel="panelTitle" class="title-contents" data-localize="' + localizeTitle + '">' + infChart.manager.getLabel(localizeTitle) + '</span>';
        }
        return '<div class="panel panel-default" rel="panel_' + panelId + '">' +
            '<div class="panel-heading">' +
            '<h4 class="panel-title">' +
            '<a class="collapsed" role="button" data-toggle="collapse" data-parent="div[rel=' + parentPanelId + ']" data-target="div[rel=' + panelId + ']" aria-expanded="false" aria-controls="' + panelId + '">' +
            titleHtml +
            '<span class="panel-item-controllers">' + (!disableClose ? '<i class="fa fa-trash remove" rel="close"></i>' : '') + '<i class="fa fa-caret-down" aria-hidden="true"></i></span>' +
            '</a>' +
            '</h4>' +
            '</div>' +
            '<div rel="' + panelId + '" class="panel-collapse collapse">' +
            '<div class="panel-body panel-body-content">' + content + '</div>' +
            '</div>' +
            '</div>';
    };

     var _getPanelBodyHTML = function (sectionArray) {
         var html = '';
         infChart.util.forEach(sectionArray, function (i, section) {
             html += _getBodySectionHTML(section);
         });
         return html;
     };

     var _getSectionBodyHTML = function(columnArray){
        var html = '<div class="body-section-outer">';
        infChart.util.forEach(columnArray, function (i, column) {
            html += _getBodySectionHTML(column);
        });
        html += '</div>';
        return html;
     };

     var _getBodySectionHTML = function (section) {
         var html = '<div class="body-section">', isContentAvailable = false;
         if (section.title) {
             html += '<p class="section-heading" data-localize="' + section.title + '">' + infChart.manager.getLabel(section.title) + '</p>';
         }
         infChart.util.forEach(section.rows, function (i, sectionRow) {
             html += '<div class="section-row' + (sectionRow.cssClass ? ' ' + sectionRow.cssClass : '') + '">';
             infChart.util.forEach(sectionRow.items, function (ii, rowItem) {
                 if (!isContentAvailable) {
                     isContentAvailable = true;
                 }
                 html += '<div class="row-item"' + (rowItem.id ? ' inf-row-item-rel="' + rowItem.id + '"' : '') + '>';
                 if (rowItem.title) {
                     if (rowItem.isLabel) {
                         html += '<p class="item-label" data-localize="' + rowItem.title + '">' + infChart.manager.getLabel(rowItem.title) + '</p>';
                     } else {
                         html += '<p class="item-label">' + rowItem.title + '</p>';
                     }
                 }
                 html += '<div class="item-body' + (rowItem.cssClass ? ' ' + rowItem.cssClass : '') + '  ">' + rowItem.body + '</div>';
                 html += '</div>';
             });
             html += '</div>';
         });
         html += '</div>';
         return isContentAvailable ? html : '';
     };

     var _getSubBodySectionHTML = function (section) {
         var html = '<div class="sub-body-section">';
         if (section.title) {
             html += '<p class="section-heading" data-localize="' + section.title + '">' + infChart.manager.getLabel(section.title) + '</p>';
         }
         infChart.util.forEach(section.rows, function (i, sectionRow) {
             html += '<div class="sub-section-row' + (sectionRow.cssClass ? ' ' + sectionRow.cssClass : '') + '">';
             infChart.util.forEach(sectionRow.items, function (ii, rowItem) {
                 html += '<div class="sub-item-row">';
                 if (rowItem.title) {
                     if (rowItem.isLabel) {
                         html += '<p class="sub-item-label" data-localize="' + rowItem.title + '">' + infChart.manager.getLabel(rowItem.title) + '</p>';
                     } else {
                         html += '<p class="sub-item-label">' + rowItem.title + '</p>';
                     }
                 }
                 html += '<div class="sub-item-body">' + rowItem.body + '</div>';
                 html += '</div>';
             });
             html += '</div>';
         });
         html += '</div>';
         return html;
     };

     /**
      * get drawing setting popup html
      * @param {string} title - popup title
      * @param {string} content - settings content
      * @returns {string} - popup html
      */
     var _getPopupHTML = function (title, content) {
         return '<div inf-ctrl = "setting-popup" class="drawing_popup o_list_holder settings-modal" data-inf-drawing-settings-pop-up="">' +
             '<div inf-pnl="popup-header" class="drawing_popup_header">' + title + '<ul><li class="header_ctrl" inf-ctrl="closeSettings"><span class="icon ico-close"></span> </li></ul></div>' +
             '<div inf-pnl="popup-body" class="drawing_popup_body">' + content +
             '</div>' +
             '</div>';
     };
     //endregion

     var _getChartTypeOptionHTML = function (chartType, seriesId, icon) {
         var id = _getIdWithChartTypeAndSeries(chartType, seriesId);
         return '<li>' +
             '<a data-toggle="tab" inf-series="' + seriesId + '" target="_self"  data-target="div[rel=' + id + ']" ind-ind-type="' + chartType + '">' +
             '<span class="' + icon + '"></span>' +
             '</a>' +
             '</li>';
     };

     var _getIdWithChartTypeAndSeries = function (chartType, seriesId) {
         return chartType + '_cfg_' + seriesId;
     };

     var _getChartStyleSection = function (chart) {
        return _getSection([_getSectionRow([_getChartSettingsPanel(chart)])]);
    };
     var _getSeriesStyleSection = function (seriesId, chartTypes) {
         return _getSection([_getSectionRow([_getSeriesContentRowItem(seriesId, chartTypes)])]);
     };

     //region bind events

     var _getColorPickerElement = function (id, container, selector) {
         return container.find('[inf-row-item-rel="' + id + '"] [inf-col-pick-container] input[inf-ctrl="' + selector + '"]');
     };

     /**
      * Returns the specified color picker input which is in the same group of given color picker
      * @param $miniColor
      * @param selector
      * @returns {*}
      * @private
      */
     var _getOtherColorPickerElement = function ($miniColor, selector) {
         return $miniColor.closest('[inf-col-pick-container]').find('input[inf-ctrl="' + selector + '"]');
     };

     var _bindChartColorPickerEvents = function (chartSettingPanel, chartId, callbacks) {

        var backgroundColorPicker = chartSettingPanel.find('[inf-row-item-rel="' + chartId + '"]').find('[inf-col-pick-container]').find('input[inf-ctrl="' + "colorPickerBackground" + '"]');
        var gridLineXColorPicker = chartSettingPanel.find('[inf-row-item-rel="' + chartId + '"]').find('[inf-col-pick-container]').find('input[inf-ctrl="' + "colorPickerXGridLine" + '"]');
        var gridLineYColorPicker = chartSettingPanel.find('[inf-row-item-rel="' + chartId + '"]').find('[inf-col-pick-container]').find('input[inf-ctrl="' + "colorPickerYGridLine" + '"]');
        var gradientTopColorPicker = chartSettingPanel.find('[inf-row-item-rel="' + chartId + '"]').find('[inf-col-pick-container]').find('input[inf-ctrl="' + "colorPickerGradientTop" + '"]');
        var gradientBottomColorPicker = chartSettingPanel.find('[inf-row-item-rel="' + chartId + '"]').find('[inf-col-pick-container]').find('input[inf-ctrl="' + "colorPickerGradientBottom" + '"]')

        chartSettingPanel.find('input[inf-ctrl=backgroundType]').on('click', function (e) {
            var bgType = $(this).attr("inf-type");
            setChartBackgroundOptions(chartSettingPanel, bgType, chartId);

        });

        infChart.util.bindColorPicker(gridLineXColorPicker, Highcharts.theme.yAxis.gridLineColor, function (rgb) {
            callbacks.onGridLineColorChange.call(this, rgb, undefined);
        });

        infChart.util.bindColorPicker(gridLineYColorPicker, Highcharts.theme.yAxis.gridLineColor, function (rgb) {
            callbacks.onGridLineColorChange.call(this, undefined, rgb);
        });

        infChart.util.bindColorPicker(backgroundColorPicker, undefined, function (rgb, hex, opacity) {
            callbacks.onBackgroundColorChange.call(this, hex, opacity, rgb);
        });

        infChart.util.bindColorPicker(gradientTopColorPicker, undefined, function (rgb, hex, opacity) {
            callbacks.onGradientBackgroundColorChange.call(this, hex, undefined, opacity, undefined, rgb);
        });

        infChart.util.bindColorPicker(gradientBottomColorPicker, undefined, function (rgb, hex, opacity) {
            callbacks.onGradientBackgroundColorChange.call(this, undefined, hex, undefined, opacity, rgb);
        });
     }

     var _bindChartBreaksEvents = function (chartSettingPanel, chartId, callbacks) {
         chartSettingPanel.find("input[inf-ctrl=sessionTimeBreaks]").on("click", function (e, isDynamicallyFired) {
            if (!isDynamicallyFired) {
                var selectedType = $(this).attr("inf-type");
                _setSessionOrTimeBreaks(chartSettingPanel, selectedType, chartId, this.checked);
            }
         });

         let supportedSessionTimeBreaks = infChart.settings.config.sessionTimeBreakSettings;
         supportedSessionTimeBreaks = Object.values(supportedSessionTimeBreaks);
         let sessionTimeBreakElement = chartSettingPanel.find("div[inf-ctrl=sessionTimeBreaks]");
         let containerId = infChart.manager.getContainerIdFromChart(chartId);
         let sessionTimeBreakSettings = infChart.manager.getChart(containerId).sessionTimeBreakSettings;

         sessionTimeBreakElement.find("li[inf-ctrl=lineStyle]").on("click", function () {
             let selectedElement = $(this);
             let selectedClass = selectedElement.find("i")[0].className;
             let selectedLineStyle = selectedElement.attr("inf-style");
             let selectedParent = $(selectedElement.parents()[1]);
             let selectedLineStyleElement = selectedParent.find("span[inf-ctrl=selectedLineStyle]");
             let selectedBreakType = selectedLineStyleElement.attr("inf-type");

             selectedLineStyleElement.attr("inf-style", selectedLineStyle);
             selectedParent.find("i[inf-ctrl=selectedStyleIcon]")[0].className = selectedClass;

             sessionTimeBreakSettings[selectedBreakType].lineType = selectedLineStyle;
             infChart.indicatorMgr.updateSessionTimeBreakIndicator(selectedBreakType, "lineType", selectedLineStyle, containerId);
         });

         supportedSessionTimeBreaks.forEach(function(sTBreak) {
             let pickerElement = chartSettingPanel.find("input[inf-ctrl=" + sTBreak.key + "-color]");
             let colorUpdateTimeout;
             infChart.util.bindColorPicker(pickerElement, undefined,
                 function (rgb, hex) {
                     if (colorUpdateTimeout) {
                         clearTimeout(colorUpdateTimeout);
                         colorUpdateTimeout = undefined;
                     }

                     colorUpdateTimeout = setTimeout(function () {
                         sessionTimeBreakSettings[sTBreak.key].color = hex;
                         infChart.indicatorMgr.updateSessionTimeBreakIndicator(sTBreak.key, "color", hex, containerId);
                     }, 300);
                 }
             );
         });

         _updateTimeBreakIntervalElements(chartSettingPanel, infChart.manager.getChart(containerId).interval, chartId);
         _updateSessionTimeBreakSettingsWhenOpen(containerId);
     };

    var _bindCustomCandleCountEvent = function(chartSettingPanel, chartId, callbacks){
        chartSettingPanel.find("input[inf-ctrl=customCandleCount]").on('keydown', function (e) {
            $(this).parent().removeClass('has-error');
            $(this).parent().find('p[rel="candle-count-error"]')[0].innerText = '';
            if (e.which == 13) {
                e.preventDefault();
                $(this).trigger("blur");
            }
        });

        chartSettingPanel.find("input[inf-ctrl=customCandleCount]").on('blur', function (e) {
            var value = $(this).val();
            if (value !== "" && !isNaN(value) && value > 4 && value <= 1000) {
                callbacks.onCustomCandleCountChange($(this), parseInt(value), true);
            } else if (value < 5 || value > 1000){
                $(this).parent().find('p[rel="candle-count-error"]')[0].innerText = 'Enter a value between 5-1000';
                $(this).parent().addClass('has-error');
            }else {
                $(this).parent().addClass('has-error');
            }
            e.stopPropagation();
        });
    };

     var _bindSeriesColorPickerEvents = function ($container, seriesId, defaultColor, callbackFn) {

         infChart.util.bindColorPicker(_getColorPickerElement(seriesId, $container, 'colorPicker'), defaultColor,
             function (rgb, hex) {
                 var colors = {'color': rgb, 'hexColor': hex},
                     currentSeriesId = $(this).closest("[inf-row-item-rel]").attr('inf-row-item-rel');
                 callbackFn.call(this, currentSeriesId, colors);
             }
         );

         infChart.util.bindColorPicker(_getColorPickerElement(seriesId, $container, 'colorPickerUp'), defaultColor,
             function (rgb, hex) {
                 var colors = {'upColor': rgb, 'hexColor': hex},
                     $minicolorEl = $(this),
                     currentSeriesId = $minicolorEl.closest("[inf-row-item-rel]").attr('inf-row-item-rel'),
                     type = $minicolorEl.closest("[int-type]").attr("int-type");
                 colors.downColor = _getOtherColorPickerElement($minicolorEl, 'colorPickerDown').mainColorPanel('rgbaString');
                 callbackFn.call(this, currentSeriesId, colors);
             }
         );

         infChart.util.bindColorPicker(_getColorPickerElement(seriesId, $container, 'colorPickerDown'), defaultColor,
             function (rgb, hex) {
                 var colors = {'downColor': rgb, 'hexColor': hex},
                     $miniColorEl = $(this),
                     currentSeriesId = $(this).closest("[inf-row-item-rel]").attr('inf-row-item-rel');
                 colors.upColor = _getOtherColorPickerElement($miniColorEl, 'colorPickerUp').mainColorPanel('rgbaString');
                 callbackFn.call(this, currentSeriesId, colors);
             }
         );

         infChart.util.bindColorPicker(_getColorPickerElement(seriesId, $container, 'colorPickerColUp'), defaultColor,
             function (rgb, hex) {
                 var colors = {'upColor': rgb, 'hexColor': hex},
                     $miniColorEl = $(this),
                     currentSeriesId = $(this).closest("[inf-row-item-rel]").attr('inf-row-item-rel');
                 colors.downColor = _getOtherColorPickerElement($miniColorEl, 'colorPickerColDown').mainColorPanel('rgbaString');
                 callbackFn.call(this, currentSeriesId, colors);
             }
         );

         infChart.util.bindColorPicker(_getColorPickerElement(seriesId, $container, 'colorPickerColDown'), defaultColor,
             function (rgb, hex) {
                 var colors = {'downColor': rgb, 'hexColor': hex},
                     $miniColorEl = $(this),
                     currentSeriesId = $(this).closest("[inf-row-item-rel]").attr('inf-row-item-rel');
                 colors.upColor = _getOtherColorPickerElement($miniColorEl, 'colorPickerColUp').mainColorPanel('rgbaString');
                 callbackFn.call(this, currentSeriesId, colors);
             }
         );
     };

     /** set active line width of the given series in the settings panel
      *
      * @param $container
      * @param seriesId
      * @param lineWidth
      * @private
      */
     var _setActiveSeriesLineWidth = function ($container, seriesId, lineWidth) {
         var ctrlEl = $container.find('[inf-row-item-rel="' + seriesId + '"] ');
         ctrlEl.find("[inf-ctrl=lineWidth]").removeClass('active');
         ctrlEl.find("[inf-ctrl=lineWidth][inf-size=" + lineWidth + "]").addClass('active');
     };

     var _setActiveGridLineWidth = function (container, chartId, lineWidth) {
        var ctrlEl = container.find('[inf-row-item-rel="' + chartId + '"] ');
        ctrlEl.find("[inf-ctrl=gridLineWidth]").removeClass('active');
        ctrlEl.find("[inf-ctrl=gridLineWidth][inf-size=" + lineWidth + "]").addClass('active');
    };

     var _bindSeriesLineWidthEvents = function ($container, seriesId, callbackFn) {
         // set line styles
         $container.find('[inf-row-item-rel="' + seriesId + '"] [inf-ctrl=lineWidth]').on('click', function (e) {
             var strokeWidth = parseInt($(this).attr("inf-size"));
             _setActiveSeriesLineWidth($container, seriesId, strokeWidth);
             callbackFn.call(this, seriesId, strokeWidth);
             e.stopPropagation();
         });
     };

     var _bindGridLineWidthEvents = function (chartSettingPanel, callbackFn, chartId) {
        chartSettingPanel.find('[inf-row-item-rel="' + chartId + '"] [inf-ctrl=gridLineWidth]').on('click', function (e) {
            var strokeWidth = parseInt($(this).attr("inf-size"));
            _setActiveGridLineWidth(chartSettingPanel, chartId, strokeWidth);
            callbackFn.call(this, strokeWidth);
            e.stopPropagation();
        });
    };

    var _onSeriesChartTypeChangeEvent = function ($container, seriesId, callbackFn) {
        $container.find('[inf-row-item-rel="' + seriesId + '"] a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
            if (e.relatedTarget) {//to prevent being called by trigger -> @see _initializeStylePanel
                var chartType = $(this).attr("ind-ind-type"), seriesStyle; // activated tab
                seriesStyle = getSeriesColorsForChartType($container, seriesId, chartType);
                seriesStyle['lineWeight'] = getSeriesLineWidth($container, seriesId, chartType);
                callbackFn(seriesId, chartType, seriesStyle);
            }
        });
    };

    var getSeriesLineWidth = function ($container, seriesId, chartType) {
        var lineWeight;
        var pickref = infChart.util.escapeSpecialCharacters("color-ref-" + chartType + '_cfg_' + seriesId);
        var container = $container.find("[inf-ref=" + pickref + "]"); 
        switch (chartType) {
            case 'line':
                lineWeight = parseInt(container.find("li[inf-ctrl=lineWidth].active").attr('inf-size'));
                break;
            case 'area':
                lineWeight = 1;
            default:
                break;
        }
        return lineWeight;
    };

     /**
      * Returns the colors object which colors are picked from color pickers
      * @param {jQueryElement} $container chart container
      * @param {string} seriesId indicator series id
      * @param {string} chartType chart type
      * @returns {object} colors object
      * @private
      */
     var getSeriesColorsForChartType = function ($container, seriesId, chartType) {
        var colors;
        var pickref = infChart.util.escapeSpecialCharacters("color-ref-" + chartType + '_cfg_' + seriesId);
        var container = $container.find("[inf-ref=" + pickref + "]");
        switch (chartType) {
            case 'area':
            case 'column':
            case 'candlestick':
            case 'ohlc':
            case 'hlc':
            case 'equivolume':
            case 'heikinashi':
            case 'point':
            case 'volume':
            case 'customCandle':
            case 'engulfingCandles':
                var areaUpEl = container.find("input[inf-ctrl=" + container.attr("inf-col-pick-up") + "]");
                var areaDownEl = container.find("input[inf-ctrl=" + container.attr("inf-col-pick-down") + "]");
                if (areaUpEl.length > 0 && areaDownEl.length > 0) {
                    colors = {
                        'upColor': areaUpEl.mainColorPanel('rgbaString'),
                        'downColor': areaDownEl.mainColorPanel('rgbaString'),
                        'hexColor': areaDownEl.mainColorPanel('value')
                    };
                } else {
                    var colorPeckEl = container.find("input[inf-ctrl=" + container.attr("inf-col-pick") + "]");
                    if (colorPeckEl.length > 0) {
                        colors = {
                            'upColor': colorPeckEl.mainColorPanel('rgbaString'),
                            'downColor': colorPeckEl.mainColorPanel('rgbaString'),
                            'hexColor': colorPeckEl.mainColorPanel('value')
                        };
                    }
                }
                break;
            default:
                var colorEl = container.find('input[inf-ctrl=colorPicker]');
                if (colorEl.length) {
                    colors = {
                        'color': colorEl.mainColorPanel('rgbaString'),
                        'hexColor': colorEl.mainColorPanel('value')
                    };
                }
                break;
        }
        return colors;
     };

     var setChartBackgroundOptions = function(settingPanel, type, chartId) {

        var containerId = infChart.manager.getContainerIdFromChart(chartId),
        chart = infChart.manager.getChart(containerId),
        currentBackgroundType = chart.chart.options.chart.backgroundColor && typeof chart.chart.options.chart.backgroundColor !== 'string' ? "gradient" : "solid",
        bgOptionItem = settingPanel.find('input[inf-ctrl=backgroundType]input[inf-type="'+type+'"]');
        bgOptionItem.attr('checked', 'checked');

        if(type == "solid") {
            settingPanel.find("[inf-ctrl-val='background']").closest("[inf-col-pick-container]").show();
            settingPanel.find("[inf-ctrl-val='gradientTop']").closest("[inf-col-pick-container]").hide();
            settingPanel.find("[inf-ctrl-val='gradientBottom']").closest("[inf-col-pick-container]").hide();
        }
        else if(type == "gradient") {
            settingPanel.find("[inf-ctrl-val='background']").closest("[inf-col-pick-container]").hide();
            settingPanel.find("[inf-ctrl-val='gradientTop']").closest("[inf-col-pick-container]").show();
            settingPanel.find("[inf-ctrl-val='gradientBottom']").closest("[inf-col-pick-container]").show();
        }

        if(currentBackgroundType !== type) {
            if(type === "solid") {
                settingPanel.find('input[inf-ctrl="colorPickerBackground"]').mainColorPanel("value", {
                            color: chart.chartBackgroundColor,
                            opacity: chart.backgroundColorOpacity
                        });
                chart.setChartBackgroundColor(chart.chartBackgroundColor, chart.backgroundColorOpacity);

            }
            else if(type === "gradient") {
                settingPanel.find('input[inf-ctrl="colorPickerGradientTop"]').mainColorPanel("value", {
                            color: chart.chartBgTopGradientColor,
                            opacity: chart.chartBgTopGradientColorOpacity
                        });
                settingPanel.find('input[inf-ctrl="colorPickerGradientBottom"]').mainColorPanel("value", {
                            color: chart.chartBgBottomGradientColor,
                            opacity: chart.chartBgBottomGradientColorOpacity
                        });
                chart.setGradientChartBackgroundColor(chart.chartBgTopGradientColor, chart.chartBgBottomGradientColor, chart.chartBgTopGradientColorOpacity, chart.chartBgBottomGradientColorOpacity);
            }
        }

     }

     var _setSessionOrTimeBreaks = function (chartSettingPanel, selectedType, chartId, isChecked) {
         if (isChecked && selectedType !== "none") {
             infChart.indicatorMgr.createSessionTimeBreakIndicator(selectedType, chartId);
         } else {
             infChart.indicatorMgr.removeSessionTimeBreakIndicator(chartId);
         }
     };

     var _bindStyleElements = function ($container, seriesId, seriesColor, onSeriesChartTypeChange, onColorPickerChange, onLineWidthChange) {

         _onSeriesChartTypeChangeEvent($container, seriesId, onSeriesChartTypeChange);

         _bindSeriesColorPickerEvents($container, seriesId, seriesColor, onColorPickerChange);

         _bindSeriesLineWidthEvents($container, seriesId, onLineWidthChange);

     };

     var _bindChartStyleElements = function (chartId, chartSettingPanel, callbacks) {

        _bindChartColorPickerEvents(chartSettingPanel, chartId, callbacks);

        _bindGridLineWidthEvents(chartSettingPanel, callbacks.onGridLineWidthChange, chartId);
        _bindChartBreaksEvents(chartSettingPanel, chartId, callbacks);
        _bindCustomCandleCountEvent(chartSettingPanel, chartId, callbacks);
    };

    var _initializeStylePanel = function ($container, seriesId, seriesType, lineWidth) {
         $container.find('[inf-row-item-rel="' + seriesId + '"] a[data-toggle="tab"][ind-ind-type="' + seriesType + '"]').tab("show");
         $container.find('[inf-row-item-rel="' + seriesId + '"] li[inf-ctrl=lineWidth][inf-size="' + lineWidth + '"]').addClass("active");
    };

    var _initializeChartStylePanel = function (gridLineWidth, chartSettingPanel, chartId, backgroundType) {
        chartSettingPanel.find('[inf-row-item-rel="' + chartId + '"] li[inf-ctrl=gridLineWidth][inf-size="' + gridLineWidth + '"]').addClass("active");
        setChartBackgroundOptions(chartSettingPanel, backgroundType, chartId);
   };

     var _bindPanel = function ($container, onPanelClose) {

         $container.find('div.panel-collapse').on('show.bs.collapse', function () {
             $(this).parents('div.panel').addClass('active');
         }).on('hide.bs.collapse', function () {
             $(this).parents('div.panel').removeClass('active');
         });

         if (typeof onPanelClose !== 'undefined') {
             $container.find('i[rel="close"]').on('click', function (e) {
                 var rel = $(this).parents('div.panel').attr('rel');
                 onPanelClose(rel.substr('panel_'.length));
                 e.stopPropagation();
             });
         }
     };

     /**
      * bind drawing settings event popup
      * @param {object} $container - main container
      * @param {object} settingPopup - drawing object setting popup
      */
     var _bindPopup = function ($container, settingPopup, onToggleSettings) {
         settingPopup.find("li[inf-ctrl=closeSettings]").click(function (event) {
             onToggleSettings();
             event.preventDefault();
         });
         var containment = $($container).find('div[inf-container=chart]');
         settingPopup.draggable({
             handle: "div.drawing_popup_header",
             containment: containment
         });
     };

    /**
    * @param {boolean} isDisableDrawingSettingsPanel
    * hide other settngs popups
    */
    var _hideAllSettingsPopups = function (isDisableDrawingSettingsPanel) {
        if (isDisableDrawingSettingsPanel) {
            var drawingSettingsPopups = $(document.body).find("[data-inf-drawing-settings-pop-up]");
            if (drawingSettingsPopups.length > 0) {
                $.each(drawingSettingsPopups, function (k, popup) {
                    infChart.util.hideColorPicker(popup);
                    $(popup).hide();
                });
            }
        }
        var drawingQuickSettingsPopup = $(document.body).find("[data-inf-quick-drawing-settings-pop-up]");
        if (drawingQuickSettingsPopup.length > 0) {
            $.each(drawingQuickSettingsPopup, function (k, popup) {
                infChart.util.hideColorPicker(popup);
                $(popup).hide();
            });
        }
    };

     /**
      * get popup positions
      * @param {object} settingPopup - drawing object setting popup
      */
     var _getPopupPosition = function (settingPopup) {
         return {
             top: settingPopup[0].offsetTop,
             left: settingPopup[0].offsetLeft
         };
     };

     /**
      * set popup positions and max ehight
      * @param {object} container - main container
      * @param {object} settingPopup - drawing object setting popup
      * @param {object} position - custom popup position
      */
     var _setPopupPositionAndHeight = function (container, settingPopup, position) {
         var maxHeight = $(container).height() - $(settingPopup).find("div[inf-pnl=popup-header]").outerHeight(true) - 30;
         $(settingPopup).find("div[inf-pnl=popup-body]").css({
             "maxHeight": maxHeight < 0 ? 50 : maxHeight
         });
         var popupPosition = position ? position :  {top: 0, left: 200};
         $(settingPopup).css(popupPosition);
     };

     var _getQuicksettingListItemHTML = function (content, customClass, label, toolTipPosition) {
        var html = '<li class="flt-tlbar__item ' + (customClass ? customClass: '') + '" ' + 
            infChart.structureManager.toolbar.getToolTipAttributes(label, toolTipPosition) + '>' + content + '</li>';
        return html ;
     };

     var _getChartSettingPanel = function(chartId){

        var containerId = infChart.manager.getContainerIdFromChart(chartId);
        var chart = infChart.manager.getChart(containerId);
        var $container = $(chart.container);
        return $container.find('div[rel="panel_'+ chartId +'"]')
     }

     var _updateTimeBreakIntervalElements = function (chartSettingsPanel, interval, chartId) {
         let intervals = ["I_1", "I_2", "I_3", "I_5", "I_10", "I_15", "I_30", "I_60", "I_120", "I_240", "I_360", "D", "W", "M", "4M", "Y"];
         let selectedInterval = intervals.indexOf(interval);

         chartSettingsPanel.find('input[inf-ctrl=sessionTimeBreaks]').each(function( index ) {
             let elementType = $(this).attr("inf-type");
             let elementIndex = intervals.indexOf(elementType);

             if (elementIndex > -1) {
                 if (selectedInterval + 1 < elementIndex) {
                     $ (this).parent().css("display", "flex");
                 } else {
                     $(this).parent().css("display", "none");

                     if (this.checked) {
                         infChart.indicatorMgr.removeSessionTimeBreakIndicator(chartId);
                         this.checked = false;
                         chartSettingsPanel.find("input[inf-ctrl=sessionTimeBreaks][inf-type=none]").trigger("click",[true]);
                     }
                 }
             }
         });
     }

     var _updateSessionTimeBreakSettingsWhenOpen = function (chartId) {
         let sessionTimeBreakSettings = infChart.manager.getChart(chartId).sessionTimeBreakSettings;
         let chartInstance = infChart.manager.getChart(chartId);
         let container = chartInstance.getContainer();
         let settingsContainer = $(infChart.structureManager.getContainer(container, "symbolSettingsPanelView"));
         let isSelected = false;

         for (let type in sessionTimeBreakSettings) {
             if (Object.prototype.hasOwnProperty.call(sessionTimeBreakSettings, type)) {
                 let settings = sessionTimeBreakSettings[type];
                 _updateSessionTimeBreakSettings(type, settings, settingsContainer, chartId);

                 if (settings.show) {
                     isSelected = true;
                 }
             }
         }

         if (!isSelected) {
             settingsContainer.find("input[inf-ctrl=sessionTimeBreaks][inf-type=none]").trigger("click",[true]);
         }
     }

     var _updateSessionTimeBreakSettings = function (type, settings, settingsContainer, chartId) {
         // Change selected break
         settingsContainer.find("input[inf-ctrl=sessionTimeBreaks][inf-type=" + type + "]").attr("checked", settings.show);

         if (settings.show) {
             settingsContainer.find("input[inf-ctrl=sessionTimeBreaks][inf-type=" + type + "]").trigger("click",[true]);
         }

         // Line type change
         let sessionTimeBreakElement = settingsContainer.find("div[inf-ctrl=sessionTimeBreaks]");
         $(sessionTimeBreakElement).find("li[inf-ctrl=lineStyle][inf-style=" + settings.lineType + "]");

         let selectedLineTypeClass = sessionTimeBreakElement.find("li[inf-ctrl=lineStyle][inf-style=" + settings.lineType + "]").find("i")[0].className;
         let selectedLineTypeElement = sessionTimeBreakElement.find("span[inf-ctrl=selectedLineStyle][inf-type=" + type + "]");

         selectedLineTypeElement.find("i")[0].className = selectedLineTypeClass;
         selectedLineTypeElement.attr("inf-style", settings.lineType);

         // Line color change
         sessionTimeBreakElement.find("input[inf-ctrl=" + type + "-color]").attr("value", settings.color);
         sessionTimeBreakElement.find("input[inf-ctrl=" + type + "-color]").data('minicolors-initialized', false);
         sessionTimeBreakElement.find("input[inf-ctrl=" + type + "-color]").minicolors("value", settings.color);
         sessionTimeBreakElement.find("input[inf-ctrl=" + type + "-color]").data('minicolors-initialized', true);
     }

     var _onIntervalChanged = function (chartSettingsPanel, interval, chartId) {
         _updateTimeBreakIntervalElements(chartSettingsPanel, interval, chartId);
     }

     //endregion

     return {
         getSection: _getSection,
         getSectionRow: _getSectionRow,
         getRowItem: _getRowItem,
         getColorPickerRowItem: _getColorPickerRowItem,
         getLineStyleRowItem: _getLineStyleRowItem,
         getLineWeightRowItem: _getLineWeightRowItem,
         getArrowHeadRowItem : _getArrowHeadRowItem,
         getFontSizeRowItem: _getFontSizeRowItem,
         getTextAlignRowItem: _getTextAlignRowItem,
         getFontWeightRowItem: _getFontWeightRowItem,
         getSeriesContentRowItem: _getSeriesContentRowItem,
         getChartStyleSection: _getChartStyleSection,
         getSeriesStyleSection: _getSeriesStyleSection,
         getPanelBodyHTML: _getPanelBodyHTML,
         getSectionBodyHTML: _getSectionBodyHTML,
         getPanelHTML: _getPanelHTML,
         getPopupHTML: _getPopupHTML,
         bindPopup: _bindPopup,
         bindStyleElements: _bindStyleElements,
         bindChartStyleElements: _bindChartStyleElements,
         initializeStylePanel: _initializeStylePanel,
         initializeChartStylePanel: _initializeChartStylePanel,
         bindPanel: _bindPanel,
         setActiveSeriesLineWidth: _setActiveSeriesLineWidth,
         setActiveGridLineWidth: _setActiveGridLineWidth,
         getSeriesColorsForChartType: getSeriesColorsForChartType,
         getPopupPosition : _getPopupPosition,
         setPopupPositionAndHeight: _setPopupPositionAndHeight,
         hideAllSettingsPopups: _hideAllSettingsPopups,
         getMiniColorPaletteHTML: _getMiniColorPaletteHTML,
         getLineWeightHTML: _getLineWeightHTML,
         getLineStyleHTML: _getLineStyleHTML,
         getColorPaletteHTML: _getColorPaletteHTML,
         getFontSizeHTML: _getFontSizeHTML,
         getQuicksettingListItemHTML: _getQuicksettingListItemHTML,
         getWaveDegreeRowItem: _getWaveDegreeRowItem,
         getChartSettingPanel: _getChartSettingPanel,
         onIntervalChanged: _onIntervalChanged,
         updateSessionTimeBreakSettingsWhenOpen: _updateSessionTimeBreakSettingsWhenOpen
     };
 })(jQuery, infChart);

 infChart.structureManager.templateSettings = (function ($, infChart) {

     var _loadPopup = function ($container, uniqueId, action, templateType, templates, callbackOnBtnClick) {
         var popupRef = "file-pop-up-" + uniqueId + "-" + action,
             fileActionPopup = $container.find("[data-inf-file-pop-up='" + popupRef + "']");

         if (!(fileActionPopup && fileActionPopup.length)) {
             var title = infChart.manager.getLabel('label.' + action);
             var actionButtonLabel = (action == 'saveTemplate' || action == 'save') ? infChart.manager.getLabel('label.save') : infChart.manager.getLabel('label.load');
             var html = '<div class="drawing_popup o_list_holder" data-inf-file-pop-up="">' +
                 '<div class="drawing_popup_header">' + title + '<ul><li class="header_ctrl" inf-ctrl="closeSettings"> <span class="icon ico-close"></span> </li></ul></div>' +
                 '<div class="drawing_popup_row">' +
                 '<ol class="o_list" inf-file-sel="' + action + '"  inf-temp-type="' + templateType + '">' +
                 '</ol>' +
                 '</div>' +
                 '<div class="drawing_popup_row">' +
                 '<span class="o_list_label">' + infChart.manager.getLabel('label.name') + '</span> <input type="text" value="" name="fileName" />' +
                 '</div>' +
                 '<div class="drawing_popup_row">' +
                 '<input type="button" value="' + infChart.manager.getLabel('label.delete') + '" inf-file-action="delete" inf-temp-type="' + templateType + '" />' +
                 '<input type="button" value="' + actionButtonLabel + '" inf-file-action="' + action + '" inf-temp-type="' + templateType + '"  />' +
                 '</div>' +
                 '</div>';

             fileActionPopup = $(html).appendTo($container.find("div[inf-container=file_settings]"));

             fileActionPopup.find("input[inf-file-action]").click(function (event) {

                 var clickAction = $(this).attr('inf-file-action'),
                     clickTemplateType = $(this).attr('inf-temp-type'),
                     textName = fileActionPopup.find('input[name=fileName]').val();

                 callbackOnBtnClick(fileActionPopup, clickAction, clickTemplateType, textName);
                 event.preventDefault();
             });

             fileActionPopup.find("li[inf-ctrl=closeSettings]").click(function (event) {
                 fileActionPopup.hide();
                 event.preventDefault();
             });

             fileActionPopup.draggable({handle: "div.drawing_popup_header", containment: $container});

             fileActionPopup.find("ol[inf-file-sel]").selectable({
                 selected: function (e, object) {
                     fileActionPopup.find('input[name=fileName]').val($(object.selected).html());
                 }
             });
         }

         _loadTemplateNames(fileActionPopup, templates);

         // Hiding all the opened popups in the document since there is no way to update popups when doing changes from another popup.
         var fileActionPopups = $(document.body).find("[data-inf-file-pop-up]");
         $.each(fileActionPopups, function (k, popup) {
             $(popup).hide();
         });

         fileActionPopup.css({top: 50, left: 200}).show();

     };

     /**
      * Append geiven templates to the list in the popup
      * @param fileActionPopup
      * @param templates
      * @private
      */
     var _loadTemplateNames = function (fileActionPopup, templates) {
         var lis = '';
         $.each(templates, function (i, val) {
             lis += '<li class="ui-widget-content">' + val + '</li>';
         });

         fileActionPopup.find("ol[inf-file-sel]").html(lis);
     };

     return {
         loadPopup: _loadPopup
     }
 })(jQuery, infChart);

 infChart.structureManager.toolbar = (function () {

     /**
      * @typedef {object} toolbarSubItemConfig
      * @property {string} key
      * @property {string} label
      * @property {string} shortLabel
      * @property {string} desc
      * @property {string} baseClass - class for li
      * @property {string} icon - icon class
      * @property {string} html - inner html content
      */

     /**
      * @typedef {object} toolbarItemConfig
      * @property {string} label
      * @property {string} value
      * @property {boolean} status
      * @property {string} [baseClass=undefined] baseClass - class for li
      * @property {string} icon - icon class
      * @property {string} html - inner html content
      * @property {Array<toolbarSubItemConfig>} options
      * @property {Array<string>} displayOptions
      * @property {boolean} isTextBased
      * @property {boolean} isIconBased
      * @property {boolean} isDropdown
      * @property {string} [menuClass=undefined] menuClass - class for ul
      */

     /**
      * get inf-ctrl html
      * @param {string} type
      * @returns {string}
      * @private
      */
     var _getCtrlTypeHtml = function (type) {
         return ' inf-ctrl="' + type + '"';
     };

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
      * get inf-ctrl-value html
      * @param {string} value
      * @returns {string}
      * @private
      */
     var _getCtrlValueHtml = function (value) {
         return ' inf-ctrl-value="' + value + '"';
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

     /**
      * get top tt type html - ???
      * @param {string} type
      * @returns {string}
      * @private
      */
     var _getTopttItemHtml = function (type) {
         return ' top-tt-item="' + (type || 'l') + '"';
     };

     var _getToolTipAttributes = function (title, direction, tooltipAdditionalCls) {
         if(title && title.trim() !== "") {
             return ' x-tt-class="adv-chart-tooltip ' + (direction || "bottom" ) + (tooltipAdditionalCls ? ' ' + tooltipAdditionalCls : '') + '" adv-chart-tooltip="' + title + '"';
         } else {
             return '';
         }
         //return 'data-container="body" data-toggle="tooltip" data-placement="' + (direction || "top" ) + '" title="' + title + '"';
     };

     /**
      * Return the attribute/value pairs related to tooltip
      * @param label
      * @param shortLabel
      * @param isShortLabel
      * @private
      */
     var _getCtrlTooltipHtml = function (label, shortLabel, isShortLabel) {
         var text = isShortLabel && shortLabel ? shortLabel : label;
         return _getToolTipAttributes(text);
     };

     /**
      * get inf-ico html
      * @param {string} icon
      * @returns {string}
      * @private
      */
     var _getCtrlIconAttrHtml = function (icon) {
         return ' inf-ico="' + icon + '"';
     };

     var _getCtrlTextHtml = function (label, desc, shortLabel) {
         var text = shortLabel ? shortLabel : label;
         return '<span data-localize="' + text + '">' + desc + '</span>';
     };

     var _getCtrlIconHtml = function (iconClass) {
         return '<i class="' + iconClass + '"></i>';
     };

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
      * get value from element
      * @param element
      * @returns {string}
      * @private
      */
     var _getValueFromAttribute = function (element) {
         return $(element).attr('inf-ctrl-value');
     };

     var _getInnerHtmlForLI = function (label, desc, customHtml, iconClass, showText) {
         var html;
         if (customHtml) {
             html = customHtml;
         } else {
             if (iconClass) {
                 if (showText) {
                     html = '<a>' + _getCtrlIconHtml(iconClass) + _getCtrlTextHtml(label, desc) + '</a>';
                 } else {
                     html = _getCtrlIconHtml(iconClass);
                 }
             } else {
                 html = _getCtrlTextHtml(label, desc);
             }
         }
         return html;
     };

     /**
      * single element
      * @param {string} ctrlType
      * @param {string} label
      * @param {string} desc
      * @param {string} baseClass
      * @param {string} iconClass
      * @param {string} value
      * @param {boolean} status
      * @param {string} html
      * @param {boolean} showText
      * @param {string} type - ??
      * @returns {string}
      * @private
      */
     var _getSingleOptionHTML = function (ctrlType, label, desc, baseClass, iconClass, value, status, html, showText, type) {
         var htmlArray = [], classes = [];
         htmlArray.push('<li role="button"');
         if (baseClass) {
             classes.push(baseClass);
         }
         if (status === true) {
             classes.push('selected');
         }
         if (classes.length > 0) {
             htmlArray.push(' class="' + classes.join(' ') + '"');
         }
         htmlArray.push(_getTopttItemHtml(type));
         htmlArray.push(_getCtrlTypeHtml(ctrlType));
         if (typeof status !== 'undefined') {
             htmlArray.push(_getCtrlStatusHtml(status));
         }
         if (value) {
             htmlArray.push(_getCtrlValueHtml(value));
         }
         htmlArray.push(' title="' + label, '">');
         htmlArray.push(_getInnerHtmlForLI(label, desc, html, iconClass, showText));
         htmlArray.push('</li>');
         return htmlArray.join('');
     };

     /**
      * multi option element
      * @param {string} ctrlType
      * @param {string} label
      * @param {string} desc
      * @param {string} baseClass
      * @param {Array<object>} options
      * @param {Array<string>} displayOptions
      * @param {string} optionsUlClass
      * @param {boolean} isDropdown
      * @param {boolean} isTextBased
      * @param {boolean} isIconBased
      * @param {boolean} showText
      * @param {string} type - ??
      * @returns {string}
      * @private
      */
     var _getMultiOptionHTML = function (ctrlType, label, desc, baseClass, options, displayOptions, optionsUlClass, isDropdown, isTextBased, isIconBased, showText, type) {
         var htmlArray = [];
         htmlArray.push('<li class="dropdown');
         if (baseClass) {
             htmlArray.push(' ' + baseClass);
         }
         htmlArray.push('"');
         htmlArray.push(_getTopttItemHtml(type));
         htmlArray.push(_getCtrlTypeHtml(ctrlType));
         htmlArray.push('>');

         if (isDropdown) {
             htmlArray.push('<a class="dropdown-toggle" role="button" aria-expanded="false" title="' + label + '">');
         }

         if (isTextBased) {
             htmlArray.push('<span ctrl-role="text"></span>');
         } else if (isIconBased) {
             if (showText) {
                 if (!isDropdown) {
                     htmlArray.push('<a class="dropdown-option" role="button">');
                 }
                 htmlArray.push('<i rel="icon"></i>');
                 htmlArray.push(_getCtrlTextHtml(label, desc));
                 if (!isDropdown) {
                     htmlArray.push('</a>');
                 }
             } else {
                 htmlArray.push('<i rel="icon"></i>');
             }
         } else {
             htmlArray.push(_getCtrlTextHtml(label, desc));
         }

         if (isDropdown) {
             htmlArray.push('<span class="caret"></span></a>');
         }

         htmlArray.push('<ul role="menu" class="dropdown-menu');
         if (optionsUlClass) {
             htmlArray.push(' ' + optionsUlClass);
         }
         htmlArray.push('">');
         htmlArray.push(_getSubOptionsHTML(ctrlType, options, displayOptions));
         htmlArray.push('</ul></li>');
         return htmlArray.join('');
     };

     var _getSubOptionsHTML = function (ctrlType, options, displayOptions) {
         var htmlArray = [];
         infChart.util.forEach(options, function (i, obj) {
             if (!displayOptions || displayOptions.indexOf(obj.key) > -1) {
                 htmlArray.push('<li');
                 htmlArray.push(_getCtrlItemHTML(ctrlType));
                 htmlArray.push(_getCtrlValueHtml(obj.key));
                 if (obj.cssClass) {
                     htmlArray.push(' class="' + obj.baseClass + '"');
                 }
                 if (obj.icon) {
                     htmlArray.push(_getCtrlTooltipHtml(obj.label));
                     htmlArray.push(_getCtrlIconAttrHtml(obj.icon));
                 }
                 htmlArray.push('>');
                 if (obj.html) {
                     htmlArray.push(obj.html);
                 } else if (obj.icon) {
                     htmlArray.push(_getCtrlIconHtml(obj.icon));
                 } else {
                     htmlArray.push(_getCtrlTextHtml(obj.label, obj.desc, obj.shortLabel));
                 }
                 htmlArray.push('</li>');
             }
         });
         return htmlArray.join('');
     };

     /**
      *
      * @param {string} key
      * @param {toolbarItemConfig} config
      * @param {boolean} showText
      * @param {string} type
      * @returns {string}
      * @private
      */
     var _getItemHTML = function (key, config, showText, type) {
         var html = '';
         if (config.options && config.options.length > 0) {
             html = _getMultiOptionHTML(key, config.label, config.desc, config.baseClass, config.options, config.displayOptions,
                 config.menuClass, config.isDropdown, config.isTextBased, config.isIconBased, showText, type);
         } else {
             html = _getSingleOptionHTML(key, config.label, config.desc, config.baseClass, config.icon, config.value, config.status, config.html, showText, type);
         }
         return html;
     };

     var _bindItem = function (parent, key, config, fn) {
         if (config.options && config.options.length > 0) {
             if (config.isIconBased) {
                 _setMultiOptionControlWithIcon(parent, key, fn);
             } else if (config.isTextBased) {
                 _setMultiOptionControlWithText(parent, key, fn);
             } else {
                 _setMultiOptionControl(parent, key, fn);
             }
         } else {
             if (typeof config.status !== 'undefined') {
                 _setSingleOptionControlWithStatus(parent, key, fn);
             } else {
                 _setSingleOptionControl(parent, key, fn);
             }
         }
     };

     /**
      * multi option - control where selected icon is shown
      * used in chart types and grid types
      * @param parent
      * @param {string} controlType
      * @param {function} fn
      * @private
      */
     var _setMultiOptionControlWithIcon = function (parent, controlType, fn) {
         var control = _getControlElement(parent, controlType);
         _getOptionElementsForMultiOptions(control).click(function (event) {
             var value = _getValueFromAttribute(this);
             fn(value);
             _setSelectedValueInMultiOptionControlWithIcon(control, value);
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
             fn(value);
             _setSelectedValueInMultiOptionControlWithText(control, value);
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
     var _setMultiOptionControl = function (parent, controlType, fn) {
         var control = _getControlElement(parent, controlType);
         _getOptionElementsForMultiOptions(control).click(function (event) {
             var action = _getValueFromAttribute(this);
             fn(action);
             event.preventDefault();
         });
     };

     /**
      * set selected icon to multi select using the selected value
      * used in chart types and grid types
      * @param control
      * @param {string} value
      * @private
      */
     var _setSelectedValueInMultiOptionControlWithIcon = function (control, value) {
         _setSelectedIconInMultiOptionControlWithIcon(control, _getSelectedElementIconFromValue(control, value));
     };

     /**
      * set selected icon to multi select
      * @param control
      * @param {string} iconClass
      * @private
      */
     var _setSelectedIconInMultiOptionControlWithIcon = function (control, iconClass) {
         control.find('i[rel="icon"]').removeClass().addClass(iconClass);
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
             }
         }
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

     var _setSingleOptionControl = function (parent, controlType, fn) {
         var control = _getControlElement(parent, controlType);
         control.click(function (event) {
             fn(_getValueFromAttribute(this));
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
     var _setSingleOptionControlWithStatus = function (parent, controlType, fn) {
         var control = _getControlElement(parent, controlType);
         control.click(function (event) {
             var attrValue = _getValueFromAttribute(this);
             var status = fn(attrValue);
             _setButtonStatus(control, status);
             event.preventDefault();
         });
     };

     /**
      * set button status
      * @param control
      * @param {boolean} status
      * @private
      */
     var _setButtonStatus = function (control, status) {
         if (status) {
             control.attr("inf-status", "on");
             control.addClass('selected');
         } else {
             control.attr("inf-status", "off");
             control.removeClass('selected');
         }
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
      * Bind favorite menu item events and aff dragable
      * @param {string} $container 
      * @param {string} favoriteMenu 
      */
       var _bindFavoriteMenuEvents = function($container, favoriteMenu, containerId) {
        var chart = infChart.manager.getChart(containerId);
        favoriteMenu.find("div[inf-ctrl=closeFavorite]").click(function (event) {
            infChart.drawingsManager.toggleFavorite(favoriteMenu, containerId);
            event.preventDefault();
        });
         
        function startFix(event, ui) {
            ui.position.left = 0;
            ui.position.top = 0;
        }

        function dragFix(event, ui) {
            infChart.util.dragFix(chart, event, ui)
        }

        var containment = $($container).find('div[inf-container=chart_container]');
        var favoriteMenuElement = favoriteMenu.find('[inf-container="favorite-menu"]'); 
        favoriteMenuElement.draggable({
            handle: "div.flt-tlbar__drag",
            containment: containment,
            drag: dragFix,
            start: startFix
        });
        _positionFavoriteMenu(containerId)
     };

     /**
      * Position/re-Position Favorite Menu
      * @param {*} containerId 
      */
     var _positionFavoriteMenu = function(containerId){
        var chart = infChart.manager.getChart(containerId);
        var $container = $(chart.container);
        var chartElement = $container.find('[inf-container="chart_container"]');
        var favoriteMenuElement = $container.find('[inf-container="favorite-menu"]'); 
        var chartTop = $container.find('[inf-container="chart_top"]');

        if(chartElement){
            favoriteMenuElement.css("left",chartElement.width()/2  - favoriteMenuElement.width()/2)
            favoriteMenuElement.css("top",chartTop.height()/2 - favoriteMenuElement.height()/2)
        }

     }

     var _setChartTypeTabActive = function(settingPanel, seriesType){
        settingPanel.find("[ind-ind-type=" + seriesType + "]").parent('li').addClass('active').siblings().removeClass('active');
     }

     return {
         getItemHTML: _getItemHTML,
         getSubOptionsHTML: _getSubOptionsHTML,
         bindItem: _bindItem,
         getControlElement: _getControlElement,
         getToolTipAttributes: _getToolTipAttributes,
         bindFavoriteMenuEvents:_bindFavoriteMenuEvents,
         positionFavoriteMenu: _positionFavoriteMenu,
         setChartTypeTabActive: _setChartTypeTabActive
     };

 })();
