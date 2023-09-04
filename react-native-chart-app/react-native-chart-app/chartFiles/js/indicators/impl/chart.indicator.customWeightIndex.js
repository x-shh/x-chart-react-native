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
