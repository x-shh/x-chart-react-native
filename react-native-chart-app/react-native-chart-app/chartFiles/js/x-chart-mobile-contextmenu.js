/**
 * Management of context menu of the chart goes here
 * @type {*|{}}
 */
var infChart = window.infChart || {};

infChart.contextMenuManager = (function ($, infChart) {
    /**
     * display context menu panel
     * @param {string} chartId - chart id
     * @param {object} position  - context menu position
     * @param {string} type  - context menu type
     * @param {object} data  - context menu data
     */
    var _openContextMenu = function (chartId, position, type, data, event, isCustomContainer) {
        var contextMenuOptions = _getContextMenuOptions(chartId, type, data, event);
        let callback, container;
        if (contextMenuOptions) {
            if (!isCustomContainer) {
                let chartInstance = infChart.manager.getChart(chartId);
                container = chartInstance.getContainer();
                chartInstance.chart.isContextMenuOpen = true;
                callback = function () { _closeContextMenu(chartId) };
                chartInstance.hideContextMenuHandler = callback;
            } else {
                container = document;
                callback = function() {
                    infChart.structureManager.contextMenu.hideContextMenu(container, callback);
                }  
            }
            infChart.structureManager.contextMenu.setContextMenuItems(container, type, contextMenuOptions);
            infChart.structureManager.contextMenu.bindContextMenuItems(container, contextMenuOptions, callback);
            infChart.structureManager.contextMenu.showContextMenu(container, position, callback, isCustomContainer);
        }
    };

    /**
     * get context menu options
     * @param {string} chartId - chart id
     * @param {string} type  - context menu type
     * @param {object} data  - context menu data
     * @returns {object} - options
     * @private
     */
    var _getContextMenuOptions = function (chartId, type, data, event) {
        let options = {};
        switch (type) {
            case infChart.constants.contextMenuTypes.drawing:
                if (typeof infChart.drawingsManager !== 'undefined') {
                    options = infChart.drawingsManager.getContextMenuOptions(chartId, data.drawingId, event);
                }
                // if (infChart.drawingsManager.getDrawingObject(chartId, data.drawingId).getContextMenuOptions) {
                //         options = infChart.drawingsManager.getDrawingObject(chartId, data.drawingId).getContextMenuOptions(chartId,
                //             data.drawingId,
                //             infChart.manager.getChart(chartId).settings.contextMenu.drawing.options,
                //             event
                //         );
                //     } 
                // else {
                //     options = infChart.drawingUtils.common.getContextMenuOptions(chartId,
                //         data.drawingId,
                //         infChart.manager.getChart(chartId).settings.contextMenu.drawing.options,
                //         event
                //     );
                // }
                break;
            case infChart.constants.contextMenuTypes.indicator:
                if (typeof infChart.indicatorMgr !== 'undefined') {
                    options = infChart.indicatorMgr.getContextMenuOptions(chartId, data, event);
                }
                break;
            case infChart.constants.contextMenuTypes.favoriteDrawing:
                if (typeof infChart.drawingsManager !== 'undefined') {
                    options = infChart.drawingsManager.getFavoriteDrawingContextMenuOptions(chartId, data);
                }
                break;
            case infChart.constants.contextMenuTypes.colorPalette :
                options = infChart.manager.getCustomContextMenuOptions(event);
                break;
            case infChart.constants.contextMenuTypes.xAxis :
                options = infChart.manager.getXAxisContextMenuOptions(chartId, event);
                break;
            case infChart.constants.contextMenuTypes.yAxis :
                options = infChart.manager.getYAxisContextMenuOptions(chartId, event);
                break;
            default:
                options = infChart.manager.getDefaultContextMenuOptions(chartId, event);
                break;
        }

        return options;
    };

    /**
     * check if context menu is enabled for particular chart
     * @param {string} chartId - chart id
     * @returns {string|window.infChart.settings.contextMenu|{enabled, drawing}|Highcharts.Chart.contextMenu|Function|*}
     * @private
     */
    var _isContextMenuEnabled = function (chartId) {
        var chartInstance = infChart.manager.getChart(chartId);
        return chartInstance.settings.contextMenu && chartInstance.settings.contextMenu.enabled && chartInstance.settings.contextMenu.drawing && chartInstance.settings.contextMenu.drawing.enabled
    };

    /**
     * hide context menu panel
     * @param {string} chartId - chart id
     */
    var _closeContextMenu = function (chartId) {
        var chartInstance = infChart.manager.getChart(chartId);
        var chartContainer = chartInstance.getContainer();

        setTimeout(function (){
            chartInstance.chart.isContextMenuOpen = false;
        }, 500);// added to avoid reopening the quick settings panel when clicked on open advanced setting item from context menu

        infChart.structureManager.contextMenu.hideContextMenu(chartContainer, chartInstance.hideContextMenuHandler);
    };

    return {
        openContextMenu : _openContextMenu,
        isContextMenuEnabled : _isContextMenuEnabled
    };
})(jQuery, infChart);

/**
 * Management of context menu structure goes here
 * @type {*|{}}
 */

window.infChart = window.infChart || {};
infChart.structureManager = infChart.structureManager || {};

infChart.structureManager.contextMenu = (function () {
    let _subMenuTimer;

    /**
     * set the position of context menu
     * @param {object} position - left and top position
     * @param {object} container - chart container
     */
     var _setContextMenuPosition = function (container, position) {
        var chartElement = $(container).find('[inf-container="chart"]');
        var chartOffset = chartElement.offset();
        var chartOffsetWidth = chartElement.width() + chartOffset.left;
        var chartOffsetHeight = chartElement.height() + chartOffset.top;
        var contextMenuElement = $(infChart.structureManager.getContainer(container, 'contextMenuPanel'));
        var contextMenuWidth = contextMenuElement.width();
        var contextMenuHeight = contextMenuElement.height();
        var contextMenuPositionOffset = 10;

        let left = position.left;
        let top = position.top;

        if (left + contextMenuWidth > chartOffsetWidth) {
            left = left - (contextMenuWidth - contextMenuPositionOffset);
        } else {
            left = left - contextMenuPositionOffset;
        }

        if (top + contextMenuHeight > chartOffsetHeight) {
            top = top - (contextMenuHeight - contextMenuPositionOffset);
        } else {
            top = top - contextMenuPositionOffset;
        }

        _getContextMenuPanel(container).offset({
            top: top,
            left: left
        });

        let subMenus = contextMenuElement.find("div[rel=sub-menu]");

        if (subMenus.length > 0) {
            subMenus.each(function () {
                let subMenu = $(this);
                let subMenuWidth = subMenu.outerWidth(true);
                let positionToBottom = subMenu.parent().offset().top + subMenu.outerHeight(true) > chartOffsetHeight;

                subMenu.removeClass("right left right-bottom left-bottom");

                if (left + contextMenuWidth + subMenuWidth > chartOffsetWidth) {
                    subMenu.addClass(positionToBottom ? "left-bottom" : "left");
                } else {
                    subMenu.addClass(positionToBottom ? "right-bottom" : "right");
                }
            });
        }
    };

    /**
     * get the container of the context menu panel
     * @param {object} container - chart container
     */
    var _getContextMenuPanel = function (container) {
        return $(infChart.structureManager.getContainer(container, 'contextMenuPanel'));
    };

    /**
     * check if context menu is open
     * @param {object} container - chart container
     * @returns {Boolean} - true, if context menu open
     */
    var _isContextMenuOpen = function (container) {
        return _getContextMenuPanel(container).is(":visible");
    };

    /**
     * set context menu html depending on provided type and options
     * @param {object} container - chart container
     * @param {string} type - context menu type
     * @param {object} menuItemOptions - context menu item options
     * @returns {string} - content
     * @private
     */
    var _setContextMenuItems = function (container, type, menuItemOptions) {
        var html = "";
        switch (type) {
            case infChart.constants.contextMenuTypes.default :
            case infChart.constants.contextMenuTypes.drawing :
            case infChart.constants.contextMenuTypes.indicator :
            case infChart.constants.contextMenuTypes.favoriteDrawing :
            case infChart.constants.contextMenuTypes.colorPalette :
            case infChart.constants.contextMenuTypes.xAxis :
            case infChart.constants.contextMenuTypes.yAxis :
                html = '<div class="drawing-rc-options">' +
                    '<div class="drawing-rc-sub">';
                for (var option in menuItemOptions) {
                    if (menuItemOptions.hasOwnProperty(option)) {
                        let item = menuItemOptions[option];
                        let itemClass = item.disabled ? 'disabled' : '';

                        html += '<div inf-ctrl="' + option + '" class="drawing-rc-item ' + itemClass + '">' +
                            '<i class = "drawing-rc-icon '+ item.icon + '"></i>' +
                            '<span class="drawing-rc-text">' + item.displayText + '</span>' +
                            _getSubMenu(item) +
                            '</div>';
                    }
                }
                html += '</div></div>';
                break;
            default:
                break;
        }
        _getContextMenuPanel(container).append(html);
    };

    /**
     * get sub menu structure
     * @param {object} item - context menu item
     * @returns {string} - sub menu structure
     * @private
     */
    var _getSubMenu = function (item) {
        let subMenuHtml = "";
        if (item.subMenus && item.subMenus.length > 0) {
            subMenuHtml = `<div rel="sub-menu" class="drawing-rc-options drawing-rc-options--submenu">`

            item.subMenus.forEach(function (subMenu) {
                let itemClass = subMenu.disabled ? "disabled" : "";

                subMenuHtml += '<div inf-ctrl="' + subMenu.type + '" class="drawing-rc-item ' + itemClass + '">' +
                    '<i class = "drawing-rc-icon '+ subMenu.icon + '"></i>' +
                    '<span class="drawing-rc-text">' + subMenu.displayText + '</span>' +
                    '</div>';
            })

            subMenuHtml += `</div>`;
        }

        return subMenuHtml;
    };

    /**
     * bind event for context menu items
     * @param {object} container - chart container
     * @param {object} menuItemOptions - context menu item options
     * @param {function} hideContextMenuHandler - hide context menu handler
     * @private
     */
    var _bindContextMenuItems = function (container, menuItemOptions, hideContextMenuHandler) {
        let contextMenuPanel = _getContextMenuPanel(container);

        for (var option in menuItemOptions) {
            if (menuItemOptions.hasOwnProperty(option)) {
                let menuOptions =  menuItemOptions[option];
                if (!menuOptions.disabled) {
                    let menuItemElement = contextMenuPanel.find('div[inf-ctrl='+ option +']');

                    let subMenuElement = menuItemElement.find("div[rel=sub-menu]");
                    if (subMenuElement.length > 0) {
                        menuItemElement.on('mouseover', function () {
                            _openSubMenu($(this));
                        });
                        menuItemElement.on('mouseout', function () {
                            _closeSubMenu($(this));
                        });
                        menuOptions.subMenus.forEach(function (subMenu) {
                            let subMenuItem = subMenuElement.find('div[inf-ctrl='+ subMenu.type +']');
                            subMenuItem.on('click', function (event) {
                                subMenu.action(event, subMenu.type);
                                hideContextMenuHandler();
                            });
                        });
                    } else {
                        menuItemElement.on('mousedown', function (event) { //to stop color picker from closing when click context menu from propagating
                            event.preventDefault();
                            event.stopPropagation();
                            menuOptions.action(event);
                            hideContextMenuHandler();
                        });
                    }
                }
            }
        }
    };

    /**
     * display context menu panel
     * @param {object} container - chart container
     * @param {object} position  - context menu position
     * @param {Function} hideContextMenuHandler - function reference to hide context menu
     * @private
     */
    var _showContextMenu = function (container, position, hideContextMenuHandler, iscustomContainer) {
        let contextMenuPanel = _getContextMenuPanel(container);
        contextMenuPanel.show();
        _setContextMenuPosition(container, position);
        if(!iscustomContainer) {
            $(container).append($('<div class="chart-context-menu-mask"></div>'));
            infChart.util.bindEvent($(container).find(".chart-context-menu-mask"), 'click', hideContextMenuHandler);
        } else {
            contextMenuPanel[0].style.zIndex = '100000';
        }    
        document.addEventListener('click', hideContextMenuHandler);
        contextMenuPanel[0].addEventListener("contextmenu", function (e) {
            e.stopPropagation();
            e.preventDefault();
        });
    };

    /**
     * hide context menu panel
     * @param {object} container - chart container
     * @param {Function} hideContextMenuHandler - function reference to hide context menu
     * @private
     */
    var _hideContextMenu = function (container, hideContextMenuHandler) {
        if (_isContextMenuOpen(container)) {
            var contextMenuPanel = _getContextMenuPanel(container);
            contextMenuPanel.hide();
            contextMenuPanel.html("");
            $(container).find(".chart-context-menu-mask").remove();
            $(container).find("path[class*='line-hover']").attr({class:''});
            $(container).find("g[class*='label-hover']").attr({class:'highcharts-label'});
            document.removeEventListener('click', hideContextMenuHandler);
        }
    };

    var _openSubMenu = function (mainMenuElement) {
        clearTimeout(_subMenuTimer);
        mainMenuElement.addClass('active');
    };

    var _closeSubMenu = function (mainMenuElement) {
        _subMenuTimer = setTimeout(function () {
            mainMenuElement.removeClass('active');
        }, 200);
    };

    return {
        setContextMenuItems: _setContextMenuItems,
        bindContextMenuItems : _bindContextMenuItems,
        showContextMenu : _showContextMenu,
        hideContextMenu : _hideContextMenu
    };

})();
