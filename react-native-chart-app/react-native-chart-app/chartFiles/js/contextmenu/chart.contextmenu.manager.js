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
