/**
 * Management of templates of the chart goes here
 * @type {*|{}}
 */
var infChart = window.infChart || {};

infChart.templatesManager = (function ($, infChart) {
    var _savedTemplates = {};
    var _instances = {};
    var _providerInstances = {};

    /**
     * initialize template manager
     * @private
     */
    var _initialize = function (chartId, providerObj) {
        _setDataProvider(chartId, providerObj);
    };

    /**
     * save all chart templates for given type
     * @param {string} chartId - chart id
     * @param {string} type - template type
     * @param {object} template - template objects
     * @private
     */
    var _saveChartTemplates = function (chartId, type, template) {
        var providerType = _getProviderType(chartId);
        _savedTemplates[providerType][type] = template;
        _providerInstances[providerType].saveChartTemplates(type, { ...template });
    };

    /**
     * get saved chart templates
     * @param {string} chartId - chart id
     * @param {string} type - template type
     * @returns {object}
     * @private
     */
    var _getChartTemplates = function (chartId, type) {
        var providerType = _getProviderType(chartId);
        var template;
        if (_savedTemplates[providerType]?.[type]) {
            template = { ..._savedTemplates[providerType][type] };
        }
        return template;
    };

    /**
     * load saved chart templates for all template types
     * @param {string} chartId - chartId
     * @param {string} providerType - provider type
     * @private
     */
    var _loadAllSavedTemplates = function (chartId, providerType) {
        _savedTemplates[providerType] = {};
        for (let key in infChart.constants.fileTemplateTypes) {
            let templateType = infChart.constants.fileTemplateTypes[key];
            _providerInstances[providerType].getChartTemplates(templateType, function (template) {
                _savedTemplates[providerType][templateType] = { ...template };
            });
        }
    };

    /**
     * set data provider
     * @param {string} chartId - chart id
     * @param {string} providerObj - chart id
     * @private
     */
    var _setDataProvider = function(chartId, providerObj) {
        if (providerObj) {
            if (!_providerInstances[providerObj.type]) {
                var dataProvider;
                switch (providerObj.type) {
                    case 'infinit':
                        dataProvider = new infChart.xinTemplatesDataProvider();
                        break;
                    default:
                        dataProvider = new infChart.mockTemplatesDataProvider();
                        break;
                }
                _providerInstances[providerObj.type] = dataProvider;
                _loadAllSavedTemplates(chartId, providerObj.type);
            }
            _instances[chartId] = providerObj.type;
        }
    };

    /**
     * get provider type for given chart
     * @param {string} chartId - chart id
     * @returns {string} - provider type
     * @private
     */
    var _getProviderType = function (chartId) {
        return _instances[chartId];
    };

    return {
        initialize : _initialize,
        saveChartTemplates : _saveChartTemplates,
        getChartTemplates : _getChartTemplates
    };

})(jQuery, infChart);