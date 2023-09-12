/**
 * Management of context menu of the chart goes here
 * @type {*|{}}
 */
var infChart = window.infChart || {};

infChart.mobileDrawingSettingsManager = (function ($, infChart) {

    var _getConfigForDrawing = function (chartId, type, data) {
        let options = {};
        switch (type) {
            case infChart.constants.contextMenuTypes.drawing:
                if (typeof infChart.mobileDrawingSettingsManager !== 'undefined') {
                    options = infChart.mobileDrawingSettingsManager.getDrawingSettingsOptions(chartId, data.drawingId);
                }
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

    var _getDrawingSettingsOptions = function(chartId, drawingId){
        var drawingObj = infChart.drawingsManager.getDrawingObject(chartId, drawingId);
        var config = infChart.settings.drawingSettingsPanel[drawingObj.shape];
        var shape = drawingObj.shape;
        var updatedSettings = drawingObj.updateConfigFromSettings(drawingObj, config);

        return updatedSettings;
    };

    var _setDrawingProperties = function(chartId, drawingId, methodName, value){
        var drawingObj = infChart.drawingsManager.getDrawingObject(chartId, drawingId);
        drawingObj[methodName](value);
    };

    return {
        getConfigForDrawing: _getConfigForDrawing,
        getDrawingSettingsOptions: _getDrawingSettingsOptions,
        setDrawingProperties: _setDrawingProperties
    };
})(jQuery, infChart);
