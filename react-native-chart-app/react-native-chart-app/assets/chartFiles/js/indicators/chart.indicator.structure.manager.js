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