infChart.structureManager.drawingTools = (function ($, infChart) {

    /**
     * text input
     * @returns {{title, body, isLabel}|rowItem}
     * @private
     */
    var _getTextRowItem = function (maxLength) {
        var maxLengthStr = maxLength ? ' maxlength="' + maxLength + '" ' : '';
        var html = '<textarea class = "form-control is-label" inf-ctrl="text" rows="3" type="text" placeholder="Add text"' + maxLengthStr + '></textarea>';
        return infChart.structureManager.settings.getRowItem(html, 'label.text');
    };

    var _getLineTextRowItem = function (maxLength) {
        var maxLengthStr = maxLength ? ' maxlength="' + maxLength + '" ' : '';
        var titleHtml = '<input inf-ctrl="textToggle" type="checkbox"  id="' + '" > <span>Text</span>' ;
        bodyHtml = '<div class="fib-options-wrapper"><textArea class = "form-control is-label" inf-ctrl="line-text" wrap="off" type="text" placeholder="Add text"' + maxLengthStr + '></textArea></div>';
        return infChart.structureManager.settings.getRowItem(bodyHtml,titleHtml, false, undefined, 'w--100');
    };

    var _getTextAreaRowItem = function (textToggleRef , textRef) {
        var titleHtml = '<input inf-ctrl= '+ textToggleRef +' type="checkbox"  id="' + '" > <span>Text</span>' ;
        bodyHtml = '<div class="fib-options-wrapper"><textarea class = "form-control is-label" inf-ctrl='+ textRef+'  type="text" placeholder="Add text"></textarea></div>';
        return infChart.structureManager.settings.getRowItem(bodyHtml,titleHtml, false, undefined, 'w--100');
    };

    var _getDropDownList =  function (dropDownTypes, alignType) {   
        bodyHtml = '<div class="fib-options-wrapper open-from-top"><div class="dropdown has-vertical-list " inf-ctrl="'+ alignType + '">' +
        '<button class="btn btn-default dropdown-toggle" type="button" data-toggle="dropdown" rel="dropDownButton" aria-haspopup="true" aria-expanded="true">' +
        '<span rel="selectItem">'+ dropDownTypes[0] +'</span> <span class="caret"></span> ' +
        '</button>' +
        '<ul inf-ctrl="dropDown" class="dropdown-menu w--100">';

        Object.keys(dropDownTypes).forEach(function (dropDownType) {
            bodyHtml += '<li rel="'+ alignType + '"  inf-data="' + dropDownTypes[dropDownType] + '"><a>' + dropDownTypes[dropDownType] + '</a></li>';
        })
        bodyHtml += '</ul></div></div>';

        return infChart.structureManager.settings.getRowItem(bodyHtml, undefined, false, undefined, undefined);
    }

    /**
     * line settings
     * @param color
     * @param labelDataItems
     * @returns {string}
     * @private
     */
    var _getLineSettings = function (color, labelDataItems, isLineText, fontSize, textFontColor, opacity, isExtendAvailable, isArrowAvaialable) {
        var sectionRows = [];
        var rowItems = [];
        var maxLength = 200;
        row2Items = [];

        sectionRows.push(infChart.structureManager.settings.getSectionRow([
            infChart.structureManager.settings.getLineStyleRowItem(),
            infChart.structureManager.settings.getLineWeightRowItem(),
            infChart.structureManager.settings.getColorPickerRowItem('lineColorPicker', color, opacity, 'color', 'top left', 'label.lineColor')
        ]));

        if(isArrowAvaialable){
            row2Items.push(infChart.structureManager.settings.getArrowHeadRowItem(undefined, 'start', 'label.startarrowtype'));
            row2Items.push(infChart.structureManager.settings.getArrowHeadRowItem(undefined, 'end', 'label.endarrowtype'));
            sectionRows.push(infChart.structureManager.settings.getSectionRow(row2Items, 'two-col-row'));
        }

        if(isExtendAvailable){
            sectionRows.push(infChart.structureManager.settings.getSectionRow([
                infChart.structureManager.settings.getRowItem("", _getApplyOptionCheckbox('extendToLeft', 'label.extendToLeft'), false),
                infChart.structureManager.settings.getRowItem("", _getApplyOptionCheckbox('extendToRight', 'label.extendToRight'), false)
            ], 'section-row--add-extra-padding-top'));
        }

        if(labelDataItems && labelDataItems.length > 0) {
            labelDataItems.forEach(function (labelDataItem, index) {
                var uniqueId = labelDataItem.id + new Date().getTime();
                var labelDataItemHTML = '<span class="c-checkbox-secondary c-checkbox-secondary--15">'+
                                            '<input class="c-checkbox-secondary__checkbox" inf-ctrl="labelDataItem" type="checkbox" checked="checked" id="' + uniqueId + '" data-value="' + labelDataItem.id + '">'+
                                            '<span class="c-checkbox-secondary__alias">' +
                                                '<i class="icom"></i>' +
                                            '</span>'+
                                            '<label class="c-checkbox-secondary__label" for="' + uniqueId + '">'+ labelDataItem.displayName +'</label>'
                                        '</span>';

                rowItems.push(infChart.structureManager.settings.getRowItem( "", labelDataItemHTML, false));
            });

            sectionRows.push(infChart.structureManager.settings.getSectionRow(rowItems , 'section-row--separator-to-top'));
        }
        
        if(isLineText) {
            sectionRows.push(infChart.structureManager.settings.getSectionRow([
                _getLineTextRowItem(maxLength)
            ], 'section-row--separator-to-top section-row--textfield'));

            sectionRows.push(infChart.structureManager.settings.getSectionRow([
                infChart.structureManager.settings.getFontSizeRowItem(fontSize, 'dropup'),
            ]));

            sectionRows.push(infChart.structureManager.settings.getSectionRow([
                infChart.structureManager.settings.getColorPickerRowItem('textColorPicker', textFontColor, opacity, 'color', 'top left', 'label.textColor')])
            );

            sectionRows.push(infChart.structureManager.settings.getSectionRow([
            infChart.structureManager.settings.getFontWeightRowItem()
            ]));
        }

        return  infChart.structureManager.settings.getPanelBodyHTML([infChart.structureManager.settings.getSection(sectionRows)]) +
                _getResetToDefaultHTML();

    };

    var _getLineQuickSettings = function (color, opacity) {
        var html = "";
        html += infChart.structureManager.settings.getQuicksettingListItemHTML(
            infChart.structureManager.settings.getLineStyleHTML(), "has-list items--2", infChart.manager.getLabel("label.lineStyle"), "right");
        html += infChart.structureManager.settings.getQuicksettingListItemHTML(
            infChart.structureManager.settings.getColorPaletteHTML('lineColorPicker', 'color', color, opacity, 'top left'), "has-color-picker", infChart.manager.getLabel("label.lineColor"), "right");
        return html;
    };

    var _getPriceLineQuickSettings = function () {
        return "";
    };

    var _getPriceLineSettings = function (takeProfitLevels, stopLossLevels, yValue) {
        
        var sectionRows = [],
            rowItems = [];

        var entryPriceTitle = '<label>' + infChart.manager.getLabel("label.entryPrice") + '</label>';
        var entryPriceRow = '<input inf-ctrl="entryValue" class="fib-levels-input c-form-control text--right" maxlength="20" type="text" value="' + parseFloat(yValue).toFixed(3) + '" >';
        rowItems.push({body: entryPriceRow, isLabel: false, id: undefined, title: entryPriceTitle});

        rowItems.push({
            title: '<label class="text--positive">' + infChart.manager.getLabel("label.takeProfit") + '</label>', 
            isLabel: false, 
            id: undefined, 
            body: "" 
        });

        takeProfitLevels.forEach(function (priceLineLevel, index) {
            var title = '<input inf-ctrl="applyPriceLine" inf-value="' + priceLineLevel.id + '" type="checkbox" checked="checked" data-value="' + priceLineLevel.id + '"><span>' + infChart.manager.getLabel("label." + priceLineLevel.id + "") + '</span>';
            
            rowItems.push(_getPriceLevelSettingsRowItem('priceLineLevel', priceLineLevel.lineWidth, priceLineLevel.lineStyle, priceLineLevel.id, priceLineLevel.yValue, title, false, priceLineLevel.lineColor, 'top left'));
        });

        rowItems.push({
            title: '<label class="text--negative">' + infChart.manager.getLabel("label.stopLoss") + '</label>',
            isLabel: false,
            id: undefined,
            body: ""
        });

        stopLossLevels.forEach(function (priceLineLevel, index) {

            var title = '<input inf-ctrl="applyPriceLine" inf-value="' + priceLineLevel.id + '" type="checkbox" checked="checked" data-value="' + priceLineLevel.id + '"><span>' + infChart.manager.getLabel("label." + priceLineLevel.id + "") + '</span>';

            rowItems.push(_getPriceLevelSettingsRowItem('priceLineLevel', priceLineLevel.lineWidth, priceLineLevel.lineStyle, priceLineLevel.id, priceLineLevel.yValue, title, false, priceLineLevel.lineColor, 'top left'));
        });

        sectionRows.push(infChart.structureManager.settings.getSectionRow(rowItems, 'setting-section'));

        return '<div class="long-short-settings">' + infChart.structureManager.settings.getPanelBodyHTML([infChart.structureManager.settings.getSection(sectionRows)]) +
            _getResetToDefaultHTML() + '</div>';

    };

    /**
     * common setting to rectangle, ellipse, regression line and andrew's pitchfork
     * @param title
     * @param lineColor
     * @param fillColor
     * @param fillOpacity
     * @returns {string}
     * @private
     */
    var _getBasicDrawingSettings = function (title, lineColor, fillColor, fillOpacity, shape, fontSize, textFontColor) {
        var rowItems = [], sectionRows = [],  textRef = 'rect-text';
        var verticalPositions = {0 :"Top", 1: "Inside", 2: "Bottom"};
        var horizontalPositions = {0 :"Left", 1: "Center", 2: "Right"};
        
        sectionRows.push(infChart.structureManager.settings.getSectionRow([infChart.structureManager.settings.getLineWeightRowItem()]));

        rowItems.push(infChart.structureManager.settings.getColorPickerRowItem('lineColorPicker', lineColor, false, 'lineColor', 'top left', 'label.lineColor'));
        if (fillColor) {
            rowItems.push(infChart.structureManager.settings.getColorPickerRowItem('fillColorPicker', fillColor, fillOpacity, 'fillColor', 'top right', 'label.fillColor'));
        }
        sectionRows.push(infChart.structureManager.settings.getSectionRow(rowItems, 'two-col-row'));


        if (shape === 'ellipse' || shape === 'rectangle') {
            var textRef = shape === 'rectangle' ? 'rect-text' : 'ellipse-text';
            sectionRows.push(infChart.structureManager.settings.getSectionRow([
                _getTextAreaRowItem('textToggle', textRef)
            ], ''));

            sectionRows.push(infChart.structureManager.settings.getSectionRow([
                infChart.structureManager.settings.getColorPickerRowItem('textColorPicker', textFontColor, false, 'textColor', 'top left', 'label.textColor')])
            );

            sectionRows.push(infChart.structureManager.settings.getSectionRow([
                infChart.structureManager.settings.getFontSizeRowItem(fontSize,(shape === 'ellipse' ? 'dropup' : '')),
            ]));
        }
        
        if (shape === 'rectangle') {
            sectionRows.push(infChart.structureManager.settings.getSectionRow([
                infChart.structureManager.settings.getRowItem("","Text Alignment", false, undefined, 'w--100')
            ], ''));
            rowItems = [];
            rowItems.push(_getDropDownList(verticalPositions, "verticalType"));
            rowItems.push(_getDropDownList(horizontalPositions, "horizontalType"));
            sectionRows.push(infChart.structureManager.settings.getSectionRow(rowItems, 'two-col-row'));

            sectionRows.push(infChart.structureManager.settings.getSectionRow([
                infChart.structureManager.settings.getRowItem("", _getApplyOptionCheckbox('extendToLeft', 'label.extendToLeft'), false)
            ],'two-col-row'));

            sectionRows.push(infChart.structureManager.settings.getSectionRow([
                infChart.structureManager.settings.getRowItem("", _getApplyOptionCheckbox('extendToRight', 'label.extendToRight'), false)
            ],'two-col-row'));
        }
        return infChart.structureManager.settings.getPanelBodyHTML([infChart.structureManager.settings.getSection(sectionRows)]) +
               _getResetToDefaultHTML();
    };

    var _getApplyOptionCheckbox = function (infCtrl, label) {
        return '<input inf-ctrl="' + infCtrl + '" type="checkbox"><label data-localize="' + label + '">' + infChart.manager.getLabel(label) + '</label>'
    };

    var _getRectangleQuickSettings = function (lineColor, fillColor, fillOpacity) {
        var html = "";
        html += infChart.structureManager.settings.getQuicksettingListItemHTML(
            infChart.structureManager.settings.getColorPaletteHTML('lineColorPicker', 'lineColor', lineColor, false, 'top left'), "has-color-picker", infChart.manager.getLabel("label.lineColor"), "right");
        if (fillColor) {
            html += infChart.structureManager.settings.getQuicksettingListItemHTML(
                infChart.structureManager.settings.getColorPaletteHTML('fillColorPicker', 'fillColor', fillColor, fillOpacity, 'top left'), "has-color-picker", infChart.manager.getLabel("label.fillColor"), "right");
        }
        return html;
    };

    /**
     * get andrews pitchfork settings
     * rectangle + fib settings 
     * @param {settingOptions} options 
     * @returns {string} HTML
     */
    var _getAndrewsPitchForkSettings = function (options) {
        let rowItems = [];
        let sectionRows = [];
        let fibSettingsHTML = "", html = "";

        rowItems.push(infChart.structureManager.settings.getLineWeightRowItem(undefined, 'andrewsPitchfork'));
        rowItems.push(infChart.structureManager.settings.getColorPickerRowItem('lineColorPicker', options.medianLineColor, false, 'lineColor', 'top left', 'label.lineColor'));
        sectionRows.push(infChart.structureManager.settings.getSectionRow(rowItems, 'two-col-row'));

        html = infChart.structureManager.settings.getPanelBodyHTML([infChart.structureManager.settings.getSection(sectionRows, 'label.andrewsPitchforkMedian')])
        var properties = {
            fillColor: options.fillColor,
            fillOpacity: options.fillOpacity,
            lineColor: options.lineColor,
            lineWidth: options.lineWidth,
            fontColor: options.fontColor,
            fontSize: options.fontSize,
            fontWeight: options.fontWeight,
            fibLevels: options.fibLevels,
            title: 'label.levels'
        }
        fibSettingsHTML = _getFibSettings(properties);
        html += fibSettingsHTML;
        html += _getResetToDefaultHTML();

        return html;
    };

    /**
     * arrow settings
     * @param color
     * @returns {string}
     * @private
     */
    var _getArrowSettings = function (color, textMaxContent, textFontColor, textFontSize) {
        var sectionRows = [];
        sectionRows.push(infChart.structureManager.settings.getSectionRow([
            infChart.structureManager.settings.getColorPickerRowItem('colorPicker', color, false, 'color', 'top left', 'label.color')
        ], 'two-col-row'));
        
        sectionRows.push(infChart.structureManager.settings.getSectionRow([
            _getTextRowItem(textMaxContent), 
            infChart.structureManager.settings.getFontSizeRowItem(textFontSize)
        ]));

        sectionRows.push(infChart.structureManager.settings.getSectionRow([
            infChart.structureManager.settings.getColorPickerRowItem('textColorPicker', textFontColor, false, 'textColor', 'top left', 'label.textColor')])
        );

        return infChart.structureManager.settings.getPanelBodyHTML([infChart.structureManager.settings.getSection(sectionRows)]) +
               _getResetToDefaultHTML();
    };

    var _getArrowQuickSettings = function(color) {
        return infChart.structureManager.settings.getQuicksettingListItemHTML(
            infChart.structureManager.settings.getColorPaletteHTML('colorPicker', 'color', color, false, 'top left'), "has-color-picker", infChart.manager.getLabel("label.fillColor"), "right");
    };

    /**
     * fibonacci settings
     * @param color
     * @param fibLevels
     * @returns {string}
     * @private
     */
    var _getFibSettings = function (properties) {
        var fillColor = properties.fillColor,
            fillOpacity = properties.fillOpacity,
            lineColor = properties.lineColor,
            lineWidth = properties.lineWidth,
            fontColor = properties.fontColor,
            fontSize = properties.fontSize,
            fontWeight = properties.fontWeight,
            fibLevels = properties.fibLevels,
            showFibModeToggle = properties.showFibModeToggle,
            fibModeLabel = properties.fibModeLabel,
            templates = properties.templates,
            title = properties.title,
            userDefaultSettings = properties.userDefaultSettings,
            showSnapToHighLowToggle = properties.showSnapToHighLowToggle,
            showTrendLineAlwaysToggle = properties.showTrendLineAlwaysToggle,
            trendLineColor = properties.trendLineColor,
            trendLineOpacity = properties.trendLineOpacity,
            trendLineWidth = properties.trendLineWidth,
            trendLineStyle = properties.trendLineStyle;

        var sections = [], sectionRows = [];
        var rowItems = [];
        var footerHtml = "";
        var fibLevels = infChart.drawingUtils.common.sortFibLevelsByValue(fibLevels);
        fibLevels.forEach(function (fibLevel, index) {
            var fillOpacity = fibLevel.hasOwnProperty('fillOpacity') ? fibLevel.fillOpacity : infChart.drawingUtils.common.baseFillOpacity;
            // var fontWeight = fibLevel.fontWeight || 'normal';

            var title = '<input inf-ctrl="fibLevel" type="checkbox" checked="checked" data-value="' + fibLevel.id + '">' +
            '<input inf-ctrl="fibLevelValue" class="fib-levels-input" maxlength="8" type="text" data-value="' + fibLevel.id + '" value="' + infChart.drawingUtils.common.formatValue((fibLevel.value/100), 3) + '" >';

            var position = index % 2 === 1 ? 'top right' : 'top left';
            rowItems.push(_getFibLevelSettingsRowItem('fibLevel', fibLevel.fillColor, fillOpacity, fibLevel.lineColor, fibLevel.lineWidth, fibLevel.fontColor, fibLevel.fontSize, fibLevel.fontWeight, fibLevel.id, position, title, false, false));
        });

        var modeOptions = [];

        if(showFibModeToggle) {
            var modeToggleCheckBox = '<input inf-ctrl="modeToggle" type="checkbox" data-value="P_all">' + fibModeLabel;
            modeOptions.push(infChart.structureManager.settings.getRowItem('', modeToggleCheckBox, false));
        }
        
        if(showSnapToHighLowToggle) {
            modeOptions.push(infChart.structureManager.settings.getRowItem('', _getSnapToHighLowToggleHTML(), false));
        }
        
        sections.push(infChart.structureManager.settings.getSection([infChart.structureManager.settings.getSectionRow(modeOptions, 'two-col-row')], 'Modes'));
        
        if (showTrendLineAlwaysToggle) {
            sections.push(infChart.structureManager.settings.getSection([infChart.structureManager.settings.getSectionRow([
            infChart.structureManager.settings.getRowItem("", _getApplyOptionCheckbox('showTrendLineAlways', 'label.ShowTrendLinesAlways'), false), ],'one-col-row'), infChart.structureManager.settings.getSectionRow([
                infChart.structureManager.settings.getRowItem(infChart.structureManager.settings.getColorPaletteHTML('trendLineColorPicker', 'P_all', trendLineColor, trendLineOpacity, 'bottom left'), 'Line Color'),
                infChart.structureManager.settings.getLineWeightRowItem(undefined, 'trendLine'),
                infChart.structureManager.settings.getLineStyleRowItem(undefined, 'trendLine')
            ],'three-col-row')], 'Trend Line'));
        }

        //one color setting
        var checkBoxTitle = '<input inf-ctrl="singleFillColorControl" type="checkbox" data-value="P_all">' +
            '<span><label data-localize="label.applyOneColor">' + infChart.manager.getLabel('label.applyOneColor') + '</label></span>';
        var singleColorSettings = infChart.structureManager.settings.getSectionRow([_getFibLevelSettingsRowItem('single', fillColor, fillOpacity,
            lineColor, lineWidth, fontColor, fontSize, fontWeight, 'P_all', 'bottom left', checkBoxTitle, false, true)], 'fib-section');
        var itemsWithSingleColor = [singleColorSettings, infChart.structureManager.settings.getSectionRow(rowItems, 'two-col-row fib-section')];
        sections.push(infChart.structureManager.settings.getSection(itemsWithSingleColor, (title ? title : 'label.fibLevels')));
        if (templates) {
            footerHtml +=  ("<div class='footer-section'>" + _getTemplateSelectionDropDownHTML(templates, userDefaultSettings) + "</div>");
        }
        
        return  infChart.structureManager.settings.getPanelBodyHTML(sections) + footerHtml;
                
    };

    /**
     * fibonacci settings
     * @param color
     * @param fibLevels
     * @returns {string}
     * @private
     */
    var _getGenericFibSettings = function (properties) {
        var extentionFillColor = properties.extentionFillColor,
            extentionFillOpacity = properties.extentionFillOpacity,
            extentionLineColor = properties.extentionLineColor,
            extentionLineWidth = properties.extentionLineWidth,
            extentionFontColor = properties.extentionFontColor,
            extentionFontSize = properties.extentionFontSize,
            extentionFontWeight = properties.extentionFontWeight,
            retrancementFillColor = properties.retrancementFillColor,
            retrancementFillOpacity = properties.retrancementFillOpacity,
            retrancementLineColor = properties.retrancementLineColor,
            retrancementLineWidth =  properties.retrancementLineWidth,
            retrancementFontColor = properties.retrancementFontColor,
            retrancementFontSize = properties.retrancementFontSize,
            retrancementFontWeight = properties.retrancementFontWeight,
            fibExtentionLevels = properties.fibExtentionLevels,
            fibRetrancementLevels = properties.fibRetrancementLevels,
            templates = properties.templates,
            showFibModeToggle = properties.showFibModeToggle,
            showSnapToHighLowToggle = properties.showSnapToHighLowToggle,
            userDefaultSettings = properties.userDefaultSettings,
            showTrendLineAlwaysToggle = properties.showTrendLineAlwaysToggle;
            trendLineColor = properties.trendLineColor,
            trendLineOpacity = properties.trendLineOpacity,
            trendLineWidth = properties.trendLineWidth,
            trendLineStyle = properties.trendLineStyle;

        var sections = [], sectionRows = [], sectionNew = [];

        var rowItemsExtention = [],
            rowItemsRetrancement = [],
        fibExtentionLevels = infChart.drawingUtils.common.sortFibLevelsByValue(fibExtentionLevels);
        fibExtentionLevels.forEach(function (fibLevel, index) {
            var fillOpacity = fibLevel.hasOwnProperty('fillOpacity') ? fibLevel.fillOpacity : infChart.drawingUtils.common.baseFillOpacity;
            var fontWeight = fibLevel.fontWeight || 'normal';

            var title = '<input inf-ctrl="fibLevel" sub-type="fibExtention" type="checkbox" checked="checked" data-value="' + fibLevel.id + '">' +
                '<input inf-ctrl="fibLevelValue" sub-type="fibExtention" class="fib-levels-input" maxlength="8" type="text" data-value="' + fibLevel.id + '" value="' + infChart.drawingUtils.common.formatValue((fibLevel.value / 100), 3) + '" >';

            var position = index % 2 === 1 ? 'top right' : 'top left';
            rowItemsExtention.push(_getFibLevelSettingsRowItem('fibLevel', fibLevel.fillColor, fillOpacity, fibLevel.lineColor, fibLevel.lineWidth, fibLevel.fontColor, fibLevel.fontSize, fontWeight, fibLevel.id, position, title, false, false, 'fibExtention'));
        });

        fibRetrancementLevels = infChart.drawingUtils.common.sortFibLevelsByValue(fibRetrancementLevels);
        fibRetrancementLevels.forEach(function (fibLevel, index) {
            var fillOpacity = fibLevel.hasOwnProperty('fillOpacity') ? fibLevel.fillOpacity : infChart.drawingUtils.common.baseFillOpacity;
            var fontWeight = fibLevel.fontWeight || 'normal';

            var title = '<input inf-ctrl="fibLevel" sub-type="fibRetracement" type="checkbox" checked="checked" data-value="' + fibLevel.id + '">' +
                '<input inf-ctrl="fibLevelValue" sub-type="fibRetracement" class="fib-levels-input" maxlength="8" type="text" data-value="' + fibLevel.id + '" value="' + infChart.drawingUtils.common.formatValue((fibLevel.value / 100), 3) + '" >';

            var position = index % 2 === 1 ? 'top right' : 'top left';
            rowItemsRetrancement.push(_getFibLevelSettingsRowItem('fibLevel', fibLevel.fillColor, fillOpacity, fibLevel.lineColor, fibLevel.lineWidth, fibLevel.fontColor, fibLevel.fontSize, fontWeight, fibLevel.id, position, title, false, false, 'fibRetracement'));
        });

        var modeOptions = [];

        if(showFibModeToggle) {
            var modeToggleCheckBox = '<input inf-ctrl="modeToggle" type="checkbox" data-value="P_all">' + fibModeLabel;
            modeOptions.push(infChart.structureManager.settings.getRowItem('', modeToggleCheckBox, false));
        }
        
        if(showSnapToHighLowToggle) {
            modeOptions.push(infChart.structureManager.settings.getRowItem('', _getSnapToHighLowToggleHTML(), false));
        }
        
        sections.push(infChart.structureManager.settings.getSection([infChart.structureManager.settings.getSectionRow(modeOptions, 'two-col-row')], 'Modes'));
        

        if(showTrendLineAlwaysToggle) {
            sections.push(infChart.structureManager.settings.getSection([infChart.structureManager.settings.getSectionRow([
            infChart.structureManager.settings.getRowItem("", _getApplyOptionCheckbox('showTrendLineAlways', 'label.ShowTrendLinesAlways'), false),], 'one-col-row'), infChart.structureManager.settings.getSectionRow([
                infChart.structureManager.settings.getRowItem(infChart.structureManager.settings.getColorPaletteHTML('trendLineColorPicker', 'P_all', trendLineColor, trendLineOpacity, 'bottom left'), 'Line Color'),
                infChart.structureManager.settings.getLineWeightRowItem(undefined, 'trendLine'),
                infChart.structureManager.settings.getLineStyleRowItem(undefined, 'trendLine')
            ],'three-col-row')], 'Trend Line'));
        }

        //one color setting
        var checkBoxTitleExtention = '<input inf-ctrl="singleExtentionFillColorControl" type="checkbox" data-value="P_all">' +
            '<span><label data-localize="label.applyOneColor">' + infChart.manager.getLabel('label.applyOneColor') + '</label></span>';
        var checkBoxTitleRetrancement = '<input inf-ctrl="singleRetrancementFillColorControl" type="checkbox" data-value="P_all">' +
            '<span><label data-localize="label.applyOneColor">' + infChart.manager.getLabel('label.applyOneColor') + '</label></span>';

        
        var extentionSingleColorSettings = infChart.structureManager.settings.getSectionRow([_getFibLevelSettingsRowItem('single', extentionFillColor, extentionFillOpacity,
        extentionLineColor, extentionLineWidth, extentionFontColor, extentionFontSize, extentionFontWeight, 'P_all', 'bottom left', checkBoxTitleExtention, false, true, 'fibExtention', 'apply-to-all')], 'fib-section has-one-color');
        var extentionAlignSettings = infChart.structureManager.settings.getSectionRow([infChart.structureManager.settings.getTextAlignRowItem("fibExtentionAlign")],'fib-section text-align');
        var retrancementSingleColorSettings = infChart.structureManager.settings.getSectionRow([_getFibLevelSettingsRowItem('single', retrancementFillColor, retrancementFillOpacity,
        retrancementLineColor, retrancementLineWidth, retrancementFontColor, retrancementFontSize, retrancementFontWeight, 'P_all', 'bottom left', checkBoxTitleRetrancement, false, true, 'fibRetracement', 'apply-to-all')], 'fib-section has-one-color');
        var retracementAlignSettings = infChart.structureManager.settings.getSectionRow([infChart.structureManager.settings.getTextAlignRowItem("fibRetracementAlign")],'fib-section text-align');
        
        var itemsExtentionWithSingleColor = [extentionAlignSettings, extentionSingleColorSettings, infChart.structureManager.settings.getSectionRow(rowItemsExtention, 'fib-section')];
        var itemsRetrancementWithSingleColor = [retracementAlignSettings, retrancementSingleColorSettings, infChart.structureManager.settings.getSectionRow(rowItemsRetrancement, 'fib-section')];
        sectionNew.push(infChart.structureManager.settings.getSection(itemsExtentionWithSingleColor, 'label.fibExtentionLevels'));
        sectionNew.push(infChart.structureManager.settings.getSection(itemsRetrancementWithSingleColor, 'label.fibRetrancementLevels'));
        return "<div class ='gen-tool-settings'>" +
            infChart.structureManager.settings.getPanelBodyHTML(sections) +
            infChart.structureManager.settings.getSectionBodyHTML(sectionNew) +
            "<div class='footer-section'>" +
            _getTemplateSelectionDropDownHTML(templates, userDefaultSettings) +
            "</div>" +
            "</div>";
    };

    var _getGenericQuickFibSettings = function () {
        return "";
    };

    var _getFibQuickSettings = function (ctrlType, fillColor, fillOpacity, lineColor, fontColor, fontSize) {
        var html = "";
        var singleFillColor = '<input inf-ctrl="singleFillColorControl" type="checkbox" data-value="P_all">';
        var fontSizeDropDown = '<div class="dropdown font-size">' +
                '<button class="dropdown-toggle" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">' +
                    '<span inf-ctrl="' + ctrlType + 'SelectedFontSize" inf-ctrl-val="P_all" inf-size="' + fontSize + '">' + fontSize + '</span>' +
                    '<span class="caret"></span>' +
                '</button>' +
                _getFibFontSizeHTML('dropdown-menu', ctrlType) +
            '</div>';
        html += infChart.structureManager.settings.getQuicksettingListItemHTML(singleFillColor, "d--none");
        html += infChart.structureManager.settings.getQuicksettingListItemHTML(
            infChart.structureManager.settings.getColorPaletteHTML(ctrlType + 'FillColorPicker', 'P_all', fillColor, fillOpacity, 'top left'), "has-color-picker", infChart.manager.getLabel("label.fillColor"), "right");
        html += infChart.structureManager.settings.getQuicksettingListItemHTML(
            infChart.structureManager.settings.getColorPaletteHTML(ctrlType + 'LineColorPicker', 'P_all', lineColor, false, 'top left'), "has-color-picker", infChart.manager.getLabel("label.lineColor"), "right");
        html += infChart.structureManager.settings.getQuicksettingListItemHTML(fontSizeDropDown, "has-dropdown" , infChart.manager.getLabel("label.fontSize"), "right");
        html += infChart.structureManager.settings.getQuicksettingListItemHTML(
            infChart.structureManager.settings.getColorPaletteHTML(ctrlType + 'FontColorPicker', 'P_all', fontColor, false, 'top left'), "has-color-picker", infChart.manager.getLabel("label.fontColor"), "right");
        return html;
    };

    /**
     * label settings
     * @returns {string}
     * @private
     */
    var _getLabelSettings = function (fontSize) {
        var sectionRows = [];
        var maxCharacterLength = 200;

        sectionRows.push(infChart.structureManager.settings.getSectionRow([
            _getTextRowItem(maxCharacterLength),
            infChart.structureManager.settings.getFontSizeRowItem(fontSize),
            infChart.structureManager.settings.getFontWeightRowItem()
        ]));

        sectionRows.push(infChart.structureManager.settings.getSectionRow([
                infChart.structureManager.settings.getColorPickerRowItem('colorPicker', infChart.labelDrawing.borderColor, false, 'color', 'top left', 'label.color')])
        );

        sectionRows.push(infChart.structureManager.settings.getSectionRow([
            infChart.structureManager.settings.getRowItem("", _getColorPickerWithCheckbox('borderColorPicker', 'color', infChart.labelDrawing.borderColor, false, 'top left', 'borderColorEnabled', 'label.borderColor'), false),
            infChart.structureManager.settings.getRowItem("", _getColorPickerWithCheckbox('backgroundColorPicker', 'color', infChart.labelDrawing.backgroundColor, false, 'top left', 'backgroundColorEnabled', 'label.backgroundColor'), false)
        ],'two-col-row'));

        return infChart.structureManager.settings.getPanelBodyHTML([infChart.structureManager.settings.getSection(sectionRows)]) +
                _getResetToDefaultHTML();
    };

    var _getColorPickerWithCheckbox = function (ctrlType, ctrlValue, color, opacity, position, infCtrl, label) {
        var html = "";
        html += '<input inf-ctrl="' + infCtrl + '" type="checkbox"><label data-localize="' + label + '">' + infChart.manager.getLabel(label) + '</label>' + infChart.structureManager.settings.getColorPaletteHTML(ctrlType, ctrlValue, color, opacity, position)

        return html;
    };

    var _getLabelQuickSettings = function (fontSize) {
        var html = "";
        html += infChart.structureManager.settings.getQuicksettingListItemHTML(
            infChart.structureManager.settings.getFontSizeHTML(fontSize), "has-dropdown", infChart.manager.getLabel("label.fontSize"), "right" );
        html += infChart.structureManager.settings.getQuicksettingListItemHTML(
            infChart.structureManager.settings.getColorPaletteHTML('colorPicker', 'color', infChart.labelDrawing.borderColor, false, 'top left'), "has-color-picker", infChart.manager.getLabel("label.fontColor"), "right");
        return html;
    };

    /**
     * high/low labels settings
     * @returns {string}
     * @private
     */
    var _getHighLowLabelsSettings = function (labelDataItems) {
        var sectionRows = [];

        var rowItems = [];

        labelDataItems.forEach(function (labelDataItem, index) {
            var uniqueId = labelDataItem.id + new Date().getTime();
            var labelDataItemHTML = '<input inf-ctrl="labelDataItem" type="checkbox" checked="checked" id="' + uniqueId + '" data-value="' + labelDataItem.id + '">' +
                '<label for="' + uniqueId + '">'+ labelDataItem.displayName +'</label>';

            rowItems.push(infChart.structureManager.settings.getRowItem( "", labelDataItemHTML, false));
        });

        sectionRows.push(infChart.structureManager.settings.getSectionRow(rowItems , 'setting-section'));

        sectionRows.push(infChart.structureManager.settings.getSectionRow([
            infChart.structureManager.settings.getColorPickerRowItem('colorPicker', infChart.labelDrawing.borderColor, false, 'color', 'top left', 'label.color')], 'two-col-row')
        );

        return  infChart.structureManager.settings.getPanelBodyHTML([infChart.structureManager.settings.getSection(sectionRows)]) +
                _getResetToDefaultHTML();
    };

    var _getHighLowLabelsQuickSettings = function () {
        return infChart.structureManager.settings.getQuicksettingListItemHTML(
            infChart.structureManager.settings.getColorPaletteHTML('colorPicker', 'color', infChart.labelDrawing.borderColor, false, 'top left'), "has-color-picker", infChart.manager.getLabel("label.fontColor"), "right");
    };

    /**
     * regression channel settings
     * @param levels
     * @returns {string}
     * @private
     */
    var _getRegressionChannelSettings = function (levels, lineColor, lineWidth) {
        var rowItems = [];
        rowItems.push(infChart.structureManager.settings.getColorPickerRowItem('lineColorPicker', lineColor || infChart.drawingUtils.common.baseBorderColor, false, 'lineColor', 'top left', 'label.lineColor'));
        var i = 1;
        $.each(levels, function (id, level) {
            var fillOpacity = level.fillOpacity ? level.fillOpacity : infChart.drawingUtils.common.baseFillOpacity;
            var fillColor = level.fillColor ? level.fillColor : infChart.drawingUtils.common.baseFillColor;
            var position = i % 2 === 1 ? 'top right' : 'top left';
            i++;
            rowItems.push(infChart.structureManager.settings.getColorPickerRowItem('fillColorPicker', fillColor, fillOpacity, level.id, position, level.label));
        });

        var sectionRows = [];
        sectionRows.push(infChart.structureManager.settings.getSectionRow([infChart.structureManager.settings.getLineWeightRowItem()]));
        sectionRows.push(infChart.structureManager.settings.getSectionRow(rowItems, 'two-col-row'));

        return infChart.structureManager.settings.getPanelBodyHTML([infChart.structureManager.settings.getSection(sectionRows)]) +
               _getResetToDefaultHTML();
    };

    var _getRegressionChannelQuickSettings = function (levels, lineColor) {
        var html = '';
        html += infChart.structureManager.settings.getQuicksettingListItemHTML(
            infChart.structureManager.settings.getColorPaletteHTML('lineColorPicker', 'color', lineColor || infChart.drawingUtils.common.baseBorderColor, false, 'top left'), "has-color-picker", infChart.manager.getLabel("label.lineColor"), "right");
        $.each(levels, function (id, level) {
            var fillOpacity = level.fillOpacity ? level.fillOpacity : infChart.drawingUtils.common.baseFillOpacity;
            var fillColor = level.fillColor ? level.fillColor : infChart.drawingUtils.common.baseFillColor;
            html += infChart.structureManager.settings.getQuicksettingListItemHTML(infChart.structureManager.settings.getColorPaletteHTML('fillColorPicker', level.id, fillColor, fillOpacity, 'top left'), "has-color-picker", infChart.manager.getLabel("label.fillColor"), "right");
        });
        return html;
    };

    var _getDrawing = function (setting, isFavorite) {
        var span, visibleSpan, visibleShape, visibleSubType, category, options, link, linkClass, label = '', extraSpan, toolTip, favoriteIcon = '', favoriteListAttribute = '';
        var listStyle = "dropdown"
        if (setting.options && setting.options.length > 0) {
            options = '<ul class="dropdown-menu" role="menu">';
            linkClass = 'dropdown-option';
            infChart.util.forEach(setting.options, function (i, obj) {
                span = '<span rel="icon-span" class="' + obj.cls + '"' + (obj.style ? 'style="' + obj.style + '"' : '' ) + '></span>';
                label = obj.label ? obj.label : "";
                extraSpan = '<span class="drawing-line-text"  data-localize="' + label +'">' + infChart.manager.getLabel(label) + '</span>';
                if (obj.isFavorite != undefined) {
                    favoriteIcon = '<span rel="icon-span" class="favourite-option" inf-ctrl=drawing-fav drawing-cat="' + setting.cat + '" inf-ctrl-shape="' + obj.shape + '"'
                    + infChart.structureManager.toolbar.getToolTipAttributes(_getFavoriteTooltip(obj.isFavorite), "top") + '><i rel="icon-i" class="icom ' + _getStarIcon(obj.isFavorite) + '"></i></span>';
                } 
                if (obj.active === true) {
                    visibleSpan = span;
                    visibleShape = obj.shape;
                    visibleSubType = obj.subType;
                    options += '<li><a target="_self" ' + toolTip + 'class="active" inf-ctrl="' + setting.role + '" inf-ctrl-shape="' + obj.shape + '" inf-ctrl-subType="' 
                    + obj.subType + '" drawing-cat="' + setting.cat + '" ' + '>' + span + extraSpan + favoriteIcon +'</a></li>';
                } else {
                    options += '<li><a target="_self" ' + toolTip + ' inf-ctrl="' + setting.role + '" inf-ctrl-shape="' + obj.shape + '" inf-ctrl-subType="' + obj.subType + '" drawing-cat="' 
                    + setting.cat + '" ' + '><span rel="icon-span" class="' + obj.cls + '"' + (obj.style ? 'style="' + obj.style + '"' : '' ) + '"></span>' + extraSpan + favoriteIcon +'</a></li>';
                }
            });
            options += '</ul>';
        } else {
            options = '';
            if (setting.role === 'drawing' && setting.shape) {
                visibleShape = setting.shape;
            }
            if (setting.role === 'drawing' && setting.subType) {
                visibleSubType = setting.subType;
            }
            visibleSpan = '<span class="' + setting.cls + '"' + (setting.style ? 'style="' + setting.style + '"' : '' ) + '></span>';
        }
        if (setting.active === true && !_isAllowedToAddFavorite(setting)) {
            linkClass = linkClass ? linkClass + ' active' : 'active';
        }
        label = setting.label ? setting.label : "";
        if (setting.role === 'drawing') {

            link = '<a  target="_self"  inf-ctrl="drawCat" inf-ctrl-role="' + setting.role + '" ' + ' draw-cat="' + setting.cat + '" inf-ctrl-shape="' + visibleShape + '"' +
                (visibleSubType ? ' inf-ctrl-subType="' + visibleSubType + '"' : '') + '  role="button" ' +
                (linkClass ? ' class="' + linkClass + '"' : '') + '   ' + infChart.structureManager.toolbar.getToolTipAttributes(label, "right") + ' >' + visibleSpan + '</a>';
        } else {
            link = '<a target="_self"  inf-ctrl="drawCat" inf-ctrl-role="' + setting.role + '" ' + ' draw-cat="' + setting.cat + '" role="button" ' +
                (linkClass ? ' class="' + linkClass + '"' : '') + '  ' + infChart.structureManager.toolbar.getToolTipAttributes(label, "right") + ' >' + visibleSpan + '</a>';
        }
        if(isFavorite){
            listStyle = "flt-tlbar__item";
            favoriteListAttribute = ' inf-fav-list="' + setting.shape + '" ' + " " + 'rel="fav-toolbar-item"'
        }
        return '<li class=' + listStyle + favoriteListAttribute + '>' + link + options + '</li>';
    };

    var _getStarIcon = function(isFavorite) {
        if (isFavorite) {
            return 'icom-star';
        } else {
            return 'icom-star-o';
        }
    };

    var _getFavoriteTooltip = function(isFavorite) {
        if (isFavorite) {
            return 'label.removeFromFavorite';
        } else {
            return 'label.addToFavorite';
        }
    };

    var _isAllowedToAddFavorite = function(setting) {
        return setting && setting.isFavorite;
    };

    /**
     * get drawing toolbar HTML
     * @param {object} container - main container - tb-left
     * @param {object} leftTb - left toolbar settings
     * @param {object} config - toolbar config
     */
    var _getDrawingToolBarHTML = function (container, leftTb, config) {
        if (leftTb.length > 0){
            var html = '';
            html += _getDrawingToolBarToggleButtonHTML(config.leftTBToggleButton);
            html += '<div inf-pnl="tb-drawing-nav-container" class="toolbar-container">' + _getDrawingToolBarScrollButtonsHTML(config.leftTBScrollButtons);
            html += '<ul inf-pnl="tb-drawing-nav" class="nav navbar-nav2 chart-drawing">';
            infChart.util.forEach(leftTb, function (i, key) {
                html += _getDrawing(config[key], false);
            });
            html += '</ul></div>';
            container.addClass('chart-left-toolbar');
            container.html(html);
        }
    };

    /**
     * get favorite toolbar HTML
     * @param {object} container - main container - tb-left
     * @param {object} leftTb - left toolbar settings
     * @param {object} config - toolbar config
     */
    var _getfavoriteToolBarHTML = function (container, leftTb, config) {
        var html = '';
        var drgHandleeToolTip = infChart.structureManager.toolbar.getToolTipAttributes(infChart.manager.getLabel("label.dragToolbar"), "right");
        html += '<div class="flt-tlbar" inf-container="favorite-menu">';
        html += '<div class="flt-tlbar__item flt-tlbar__handler flt-tlbar__drag" ' + drgHandleeToolTip + '> <i class="icon ico-braille"></i></div>';
        html += '<ul rel="fav-panel-drawing-list" class="flt-tlbar__tools">';
        const favoriteDrawings = [];
        infChart.util.forEach(leftTb, function (i, key) {
            if (config[key].options) {
                config[key].options.forEach(option => {
                    if (option.isFavorite) {
                        option.role = config[key].role;
                        option.cat = config[key].cat;
                        favoriteDrawings.push(option);
                    }
                });
            } else {
                if (config[key].isFavorite) {
                    favoriteDrawings.push(config[key]);
                }
            }
        });

        favoriteDrawings.forEach(fav => {
            html += _getDrawing(fav,true);
        });
        html += '</ul>';
       // html += '<div class="flt-tlbar__item flt-tlbar__handler flt-tlbar__close" inf-ctrl="closeFavorite"> <i class="icom icom-close"></i></div>';
        html += '</div>';
        container.html(html);
    };

    /**
     * get drawing toolbar toggle button HTML
     * @param {object} config
     * @returns {string} toolbar toggle btn html
     */
    var _getDrawingToolBarToggleButtonHTML = function (config) {
        return '<button class="panel-toggle" inf-ctrl="tb-drawing-toggle"' + infChart.structureManager.toolbar.getToolTipAttributes(config.label, "right") +
            '><i class="' + config.showCls + '"></i></button>';
    };

    /**
     * get left tool bar scroll buttons
     * @param {object} config
     * @returns {string} toolbar scroll btns html
     */
    var _getDrawingToolBarScrollButtonsHTML = function (config) {
        return '<button inf-ctrl="tb-drawing-scroll-top" class="btn-scroll top"><i class="' + config.top.cls + '"></i></button>' +
            '<button inf-ctrl="tb-drawing-scroll-bottom" class="btn-scroll bottom"><i class="' + config.bottom.cls + '"></i></button>';
    };

    /**
     * bind line settings
     * @param {object} $container - main container
     * @param {function} onColorChange - color change function
     * @param {function} onLineWidthChange - line width change function
     * @param {function} onLineStyleChange - line style change function
     * @param {function} onLabelItemsChange - On Label change function
     */
    var _bindLineSettings = function ($container, callBackFnLineSettingsEvents) {
        infChart.util.bindColorPicker($container.find("input[inf-ctrl=lineColorPicker]"), undefined, function (rgba, value, opacity) {
            callBackFnLineSettingsEvents.onLineColorChange(rgba, value, opacity);
        });
        infChart.util.bindColorPicker($container.find("input[inf-ctrl=textColorPicker]"), undefined, callBackFnLineSettingsEvents.onTextColorChange);
        _bindSeriesLineWidthEvents($container, callBackFnLineSettingsEvents.onLineWidthChange);
        $container.find("li[inf-ctrl=lineStyle]").on('click', function (e) {
            var dashStyle = $(this).attr("inf-style");
            $container.find("li[inf-ctrl=lineStyle]").removeClass('active');
            $(this).addClass('active');
            callBackFnLineSettingsEvents.onLineStyleChange(dashStyle);
            e.stopPropagation();
        });

        $container.find("input[inf-ctrl=labelDataItem]").on('click', function (e) {
            callBackFnLineSettingsEvents.onLabelItemsChange($(this).attr("data-value"), $(this).is(":checked"));
            e.stopPropagation();
        });

        $container.find("input[inf-ctrl=extendToLeft]").on('click', function (e) {
            callBackFnLineSettingsEvents.onLineExtendToLeft($(this).is(":checked"));
            e.stopPropagation();
        });

        $container.find("input[inf-ctrl=extendToRight]").on('click', function (e) {
            callBackFnLineSettingsEvents.onLineExtendToRight($(this).is(":checked"));
            e.stopPropagation();
        });

        $container.find('li[inf-ctrl=startArrowHeadType]').on('click', function (e) {
            var arrowHeadType = $(this).attr("inf-type");
            $container.find('li[inf-ctrl=startArrowHeadType]').removeClass('active');
            $(this).addClass('active');
            var type = arrowHeadType === 'arrowHead';
            callBackFnLineSettingsEvents.onStartArrowHeadTypeChange(type);
            e.stopPropagation();
        });

        $container.find('li[inf-ctrl=endArrowHeadType]').on('click', function (e) {
            var arrowHeadType = $(this).attr("inf-type");
            $container.find('li[inf-ctrl=endArrowHeadType]').removeClass('active');
            $(this).addClass('active');
            var type = arrowHeadType === 'arrowHead';
            callBackFnLineSettingsEvents.onEndArrowHeadTypeChange(type);
            e.stopPropagation();
        });

        $container.find("li[inf-ctrl=fontSize]").on('click', function (e) {
            var fontSize = $(this).attr('inf-size');
            callBackFnLineSettingsEvents.onTextSizeChange(fontSize);
            var ctrlType = $(this).parent().attr('inf-ctrl');
            $(this).parent().parent().find("span[inf-ctrl="+ ctrlType +"SelectedFontSize]").text($(this).text()).attr('inf-size', fontSize);
        });

        $container.find("textarea[inf-ctrl=line-text]").on('keyup', function (event) {
            callBackFnLineSettingsEvents.onLineTextChange($(this).val());
        });

        $container.find("textarea[inf-ctrl=line-text]").on('input', function (event) {
            if (event.originalEvent.inputType === "insertFromDrop") {
            callBackFnLineSettingsEvents.onLineTextChange($(this).val());
            }
        });

        $container.find("li[inf-ctrl=fontStyle]").on('click', function (e) {
            var style = $(this).attr('inf-style'), checked = $(this).hasClass('active');
            if(style === 'italic'){
                callBackFnLineSettingsEvents.onTextFontStyleChange(style, !checked);
            }
            if(style === 'bold') {
                callBackFnLineSettingsEvents.onTextFontWeightChange(style, !checked);
            }
            if(style === 'underline'){
                callBackFnLineSettingsEvents.onTextFontDecorationChange(style, !checked);
            }
            if (checked) {
                $(this).removeClass('active');
            } else {
                $(this).addClass('active');
            }
            e.stopPropagation();
        });


        $container.find("input[inf-ctrl=textToggle]").on('click', function (e) {
            callBackFnLineSettingsEvents.onToggleLineText($(this).is(":checked"));
                $container.find("input[inf-ctrl=line-text]").focus()
            e.stopPropagation();
        });

        _bindResetToDefaultEvent($container , callBackFnLineSettingsEvents.onResetToDefault);
    };

    var _updateLineSettings = function ($container, settings, labelDataItems, styles, lineText) {
        $container.find('li[inf-ctrl="lineWidth"]').removeClass('active');
        $container.find('li[inf-ctrl="lineStyle"]').removeClass('active');
        $container.find('li[inf-ctrl="lineWidth"][inf-size="' + settings.lineWidth + '"]').addClass('active');
        $container.find('li[inf-ctrl="lineStyle"][inf-style="' + settings.lineStyle + '"]').addClass('active');
        
        let lineColorEle = $container.find('input[inf-ctrl="lineColorPicker"]');
        lineColorEle.data('minicolors-initialized', false);
        lineColorEle.mainColorPanel('value', settings.lineColor);
        lineColorEle.mainColorPanel('opacity', settings.lineOpacity);
        lineColorEle.data('minicolors-initialized', true);

        $container.find('li[inf-ctrl="startArrowHeadType"]').removeClass('active');
        $container.find('li[inf-ctrl="endArrowHeadType"]').removeClass('active');
        var startArrowHeadType = settings.isStartPoint ? 'arrowHead' : 'normalHead';
        var endArrowHeadType = settings.isEndPoint ? 'arrowHead' : 'normalHead';
        $container.find('li[inf-ctrl="startArrowHeadType"][inf-type="' + startArrowHeadType + '"]').addClass('active');
        $container.find('li[inf-ctrl="endArrowHeadType"][inf-type="' + endArrowHeadType + '"]').addClass('active');

        
        let textColorEle = $container.find('input[inf-ctrl="textColorPicker"]');
        textColorEle.data('minicolors-initialized', false);
        textColorEle.mainColorPanel('value', settings.textColor);
        textColorEle.mainColorPanel('opacity', settings.textOpacity);
        textColorEle.data('minicolors-initialized', true);

        if(labelDataItems && labelDataItems.length > 0){
            $.each(labelDataItems, function (key, labelDataItem) {
                $container.find('input[inf-ctrl="labelDataItem"][data-value="' + labelDataItem.id + '"]').prop('checked', labelDataItem.enabled);
            });
        }
        if(lineText !== undefined) {
            $container.find("textarea[inf-ctrl=line-text]").val(lineText);
        }
        if(settings.lineTextChecked) {
            $container.find('input[inf-ctrl="textToggle"]').prop('checked', settings.lineTextChecked);
            $container.find("input[inf-ctrl=line-text]").removeAttr("disabled");
            $container.find("input[inf-ctrl=textColorPicker]").removeAttr("disabled");
            $($container.find("span[inf-ctrl=singleSelectedFontSize]")[0]).parent().removeAttr("disabled");
            setTimeout(() => {
                $container.find("textarea[inf-ctrl=line-text]").focus();
            }, 0);
        } else if (settings.lineTextChecked === false){
            $container.find("textarea[inf-ctrl=line-text]").attr("disabled","disabled");
            $container.find("input[inf-ctrl=textColorPicker]").attr("disabled","disabled");
            $($container.find("span[inf-ctrl=singleSelectedFontSize]")[0]).parent().attr("disabled","disabled");
        }
        $container.find('span[inf-ctrl="singleSelectedFontSize"][inf-ctrl-val="P_all"]').text(settings.textFontSize);
        $container.find('span[inf-ctrl="singleSelectedFontSize"][inf-ctrl-val="P_all"]').attr('inf-size', settings.textFontSize);
        $container.find('input[inf-ctrl="extendToRight"]').prop('checked', settings.isExtendRight);
        $container.find('input[inf-ctrl="extendToLeft"]').prop('checked', settings.isExtendLeft);

        $container.find('li[inf-ctrl=fontStyle]').removeClass('active');
        infChart.util.forEach(styles, function (i, style) {
            $container.find('li[inf-ctrl=fontStyle][inf-style="' + style + '"]').addClass('active');
        });
    };

    /**
     * bind line settings
     * @param {object} $container - main container
     * @param {function} onColorChange - color change function
     * @param {function} onLineWidthChange - line width change function
     * @param {function} onLineStyleChange - line style change function
     * @param {function} onLabelItemsChange - On Label change function
     */
    var _bindPriceLineSettings = function ($container, onEntryValueChange, onLineApply, onPriceValueChange, onPriceLineWidthChange, onPriceLineStyleChange, onResetToDefault, onSubLineColorChange, priceLines) {

        $container.find("input[inf-ctrl=entryValue]").on('keypress', function (e) {
            if (e.which == 13) {
                e.preventDefault();
                $(this).trigger("blur");
            }
        });

        $container.find("input[inf-ctrl=entryValue]").on('blur', function (e) {
            var entryValue = $(this).val();
            if (entryValue !== "" && !isNaN(entryValue)) {
                onEntryValueChange($(this), entryValue);
            } else {
                $(this).parent().addClass('has-error');
            }
            e.stopPropagation();
        });

        $container.find("input[inf-ctrl=entryValue]").on('click', function (e) {
            $(this).parent().removeClass('has-error');
            e.stopPropagation();
        });

        $container.find("input[inf-ctrl=applyPriceLine]").on('click', function (e) {
            onLineApply($(this).is(":checked"), $(this).attr("inf-value"));
            e.stopPropagation();
        });

        $container.find("input[inf-ctrl=labelDataItem]").on('click', function (e) {
            onLabelItemsChange($(this).attr("data-value"), $(this).is(":checked"));
            e.stopPropagation();
        });

        $container.find("input[inf-ctrl=priceLevelValue]").on('keypress', function (e) {
            if (e.which == 13) {
                e.preventDefault();
                $(this).trigger("blur");
            }
        });

        $container.find("input[inf-ctrl=priceLevelValue]").on('blur', function (e) {
            var priceValue = $(this).val();
            var type = $(this).attr('inf-value');
            if (priceValue !== "" && !isNaN(priceValue)) {
                onPriceValueChange($(this), priceValue, type);
            } else {
                $(this).parent().addClass('has-error');
            }
            e.stopPropagation();
        });

        $container.find("input[inf-ctrl=priceLevelValue]").on('click', function (e) {
            $(this).parent().removeClass('has-error');
            e.stopPropagation();
        });

        $container.find('li[inf-ctrl=lineWidth]').on('click', function (e) {
            var strokeWidth = $(this).attr("inf-size");
            var ctrlType = $(this).parent().attr('inf-ctrl');
            var id = $(this).parent().parent().find("span[inf-ctrl="+ ctrlType +"SelectedLineWidth]").attr('inf-ctrl-val');
            $(this).parent().parent().find("span[inf-ctrl="+ ctrlType +"SelectedLineWidth]").text($(this).text());
            $(this).parent().parent().find("span[inf-ctrl="+ ctrlType +"SelectedLineWidth]").attr('inf-size', strokeWidth);
            onPriceLineWidthChange(id, strokeWidth);
        });

        $container.find('li[inf-ctrl=lineStyle]').on('click', function (e) {
            var lineStyle = $(this).attr("inf-style");
            var ctrlType = $(this).parent().attr('inf-ctrl');
            var id = $(this).parent().parent().find("span[inf-ctrl="+ ctrlType +"SelectedLineStyle]").attr('inf-ctrl-val');
            var childEle = ($(this).children().children()).clone();
            $(this).parent().parent().find("span[inf-ctrl="+ ctrlType +"SelectedLineStyle]").html(childEle);
            $(this).parent().parent().find("span[inf-ctrl="+ ctrlType +"SelectedLineStyle]").attr('inf-style', lineStyle);
            onPriceLineStyleChange(id, lineStyle);
        });

        priceLines.takeProfits.forEach(function(priceLineLevel){
            infChart.util.bindColorPicker($container.find("input[inf-ctrl=lineColorPicker][inf-ctrl-val=" + priceLineLevel.id + "]"), undefined, function(rgb, value){
                onSubLineColorChange(rgb, value, $(this).attr("inf-ctrl-val"))
            });
        });

        priceLines.stopLoss.forEach(function(priceLineLevel){
            infChart.util.bindColorPicker($container.find("input[inf-ctrl=lineColorPicker][inf-ctrl-val=" + priceLineLevel.id + "]"), undefined,function(rgb, value){
                onSubLineColorChange(rgb, value, $(this).attr("inf-ctrl-val"))
            });
        });        

        _bindResetToDefaultEvent($container, onResetToDefault);
    };

    /**
     * bind rectangle settings
     * @param {object} $container - main container
     * @param {function} onColorChange - color change function
     * @param {function} onLineWidthChange - line width change function
     * @param {function} onFillColorChange - fill color change function
     */
    var _bindBasicDrawingSettings = function ($container, callBackFn, shape) {
        var textRef = shape === 'rectangle' ? 'rect-text': 'ellipse-text';
        infChart.util.bindColorPicker($container.find("input[inf-ctrl=lineColorPicker]"), undefined, callBackFn.onColorChange);
        infChart.util.bindColorPicker($container.find("input[inf-ctrl=textColorPicker]"), undefined, callBackFn.onTextColorChange);
        if (callBackFn.onFillColorChange) {
            infChart.util.bindColorPicker($container.find("input[inf-ctrl=fillColorPicker]"), undefined, callBackFn.onFillColorChange);
        }

        $container.find("textarea[inf-ctrl=" + textRef + " ]").on('keyup', function (event) {
            var text = $(this).val();
            if(event.which == 27 || event.keyCode === 13){
                text = text + '<br/>';
            }
            callBackFn.onBasicDrawingTextChange(text);
        });

        $container.find("li[inf-ctrl=fontSize]").on('click', function (e) {
            var fontSize = $(this).attr('inf-size');
            callBackFn.onTextSizeChange(fontSize);
            var ctrlType = $(this).parent().attr('inf-ctrl');
            $(this).parent().parent().find("span[inf-ctrl="+ ctrlType +"SelectedFontSize]").text($(this).text()).attr('inf-size', fontSize);
        });

        $container.find("input[inf-ctrl=textToggle]").on('click', function (e) {
            callBackFn.onToggleBasicDrawingText($(this).is(":checked"));
            $container.find("textarea[inf-ctrl=" + textRef + " ]").focus();
            e.stopPropagation();
        });

        $container.find("ul[inf-ctrl=dropDown]").find("li[rel=verticalType]").on('click', function (event) {
            $container.find("div[inf-ctrl=verticalType]").find("span[rel=selectItem]").text($(this).find('a').text());
            callBackFn.onVerticalPositionSelect($(this).find('a').text());
            $container.find("div[inf-ctrl=verticalType]").find('[rel=dropDownButton]').click();
            event.stopPropagation();      
        });

        $container.find("ul[inf-ctrl=dropDown]").find("li[rel=horizontalType]").on('click', function (event) {
            $container.find("div[inf-ctrl=horizontalType]").find("span[rel=selectItem]").text($(this).find('a').text());
            callBackFn.onHorizontalPositionSelect($(this).find('a').text());
            $container.find("div[inf-ctrl=horizontalType]").find('[rel=dropDownButton]').click()
            event.stopPropagation();       
        });

        $container.find("input[inf-ctrl=extendToLeft]").on('click', function (e) {
            callBackFn.onExtendToLeft($(this).is(":checked"));
            e.stopPropagation();
        });

        $container.find("input[inf-ctrl=extendToRight]").on('click', function (e) {
            callBackFn.onExtendToRight($(this).is(":checked"));
            e.stopPropagation();
        });

        _bindSeriesLineWidthEvents($container, callBackFn.onLineWidthChange);
        _bindResetToDefaultEvent($container , callBackFn.onResetToDefault);
    };

    var _bindAndrewsPitchForkSettings = function ($container, bindOptions) {
        _bindSeriesLineWidthEvents($container.find('ul[inf-ctrl=andrewsPitchfork]'), bindOptions.onLineWidthChange);
        infChart.util.bindColorPicker($container.find("input[inf-ctrl=lineColorPicker]"), undefined, bindOptions.onColorChange);
        _bindFibSettings($container, bindOptions);
        _bindResetToDefaultEvent($container, bindOptions.onResetToDefault);
    };

    /**
     * bind arrow settings
     * @param {object} $container - main container
     * @param {function} onColorChange - color change function
     */
    var _bindArrowSettings = function ($container, arrowDrawingEvents) {
        infChart.util.bindColorPicker($container.find("input[inf-ctrl=colorPicker]"), undefined, arrowDrawingEvents.onColorChange);
        _bindFontTextSetting($container, arrowDrawingEvents.onTextChange);
        _bindFontSizeSetting($container, arrowDrawingEvents.onFontSizeChange);
        _bindResetToDefaultEvent($container , arrowDrawingEvents.onResetToDefault);
        infChart.util.bindColorPicker($container.find("input[inf-ctrl=textColorPicker]"), undefined, arrowDrawingEvents.onFontColorChange);
    };

    var _bindFontSizeSetting = function($container, onFontSizeChange) {
        $container.find("li[inf-ctrl=fontSize]").on('click', function (e) {
            var fontSize = $(this).attr('inf-size');
            onFontSizeChange(fontSize);
            var ctrlType = $(this).parent().attr('inf-ctrl');
            $(this).parent().parent().find("span[inf-ctrl="+ ctrlType +"SelectedFontSize]").text($(this).text()).attr('inf-size', fontSize);
        });
    }

    var _bindFontTextSetting = function($container, onTextChange) {
        $container.find("textarea[inf-ctrl=text]").on('keyup', function () {
            onTextChange($(this).val());
        }).on('blur', function () {
            var text = $(this).val();

            if (text === "") {
                $(this).val("");
                onTextChange("");
            }
        });
    }

    /**
     * get fib level input field values
     * @param {Object} $container - main container
     * @returns {Object} previous fib options
     */
    var _getFibLevelInputValues = function ($container) {
        var prevOptions = {};
        var fillColorPickers = $container.find("input[inf-ctrl=fibLevelFillColorPicker]");
        var lineColorPickers = $container.find("input[inf-ctrl=fibLevelLineColorPicker]");
        var lineWidthSelectors = $container.find("span[inf-ctrl=fibLevelSelectedLineWidth]");
        var fontColorPickers = $container.find("input[inf-ctrl=fibLevelFontColorPicker]");
        var fontSizeSelectors = $container.find("span[inf-ctrl=fibLevelSelectedFontSize]");
        var fontWeightSelectors = $container.find("button[inf-ctrl=fibLevelToggleFontWeight]");
        for (var i = 0; i < fillColorPickers.length; i++) {
            var fibLevelId = $(fillColorPickers[i]).attr('inf-ctrl-val');
            prevOptions[fibLevelId] = {
                fillColor: $(fillColorPickers[i]).val(),
                fillOpacity: $(fillColorPickers[i]).attr('data-opacity'),
                lineColor: $(lineColorPickers[i]).val(),
                lineWidth: $(lineWidthSelectors[i]).attr('inf-size'),
                fontColor: $(fontColorPickers[i]).val(),
                fontSize: $(fontSizeSelectors[i]).attr('inf-size'),
                fontWeight : $(fontWeightSelectors[i]).attr('inf-font-weight')
            };
        }
        return prevOptions;
    };

    /**
     * get fib level input field values
     * @param {Object} $container - main container
     * @returns {Object} previous fib options
     */
    var _getFibGenericLevelInputValues = function ($container, subType) {
        var prevOptions = {};
        var fillColorPickers = $container.find("input[inf-ctrl=fibLevelFillColorPicker][sub-type=" + subType + "]");
        var lineColorPickers = $container.find("input[inf-ctrl=fibLevelLineColorPicker][sub-type=" + subType + "]");
        var lineWidthSelectors = $container.find("span[inf-ctrl=fibLevelSelectedLineWidth][sub-type=" + subType + "]");
        var fontColorPickers = $container.find("input[inf-ctrl=fibLevelFontColorPicker][sub-type=" + subType + "]");
        var fontSizeSelectors = $container.find("span[inf-ctrl=fibLevelSelectedFontSize][sub-type=" + subType + "]");
        var fontWeightSelectors = $container.find("button[inf-ctrl=fibLevelToggleFontWeight][sub-type=" + subType + "]");
        for (var i = 0; i < fillColorPickers.length; i++) {
            var fibLevelId = $(fillColorPickers[i]).attr('inf-ctrl-val');
            prevOptions[fibLevelId] = {
                fillColor: $(fillColorPickers[i]).val(),
                fillOpacity: $(fillColorPickers[i]).attr('data-opacity'),
                lineColor: $(lineColorPickers[i]).val(),
                lineWidth: $(lineWidthSelectors[i]).attr('inf-size'),
                fontColor: $(fontColorPickers[i]).val(),
                fontSize: $(fontSizeSelectors[i]).attr('inf-size'),
                fontWeight : $(fontWeightSelectors[i]).attr('inf-font-weight')
            };
        }
        return prevOptions;
    };

    var _enableResetButtons = function ($container, enalbeResetBtn){
        var setAsUserDefaultButtonElement = $container.find("button[inf-ctrl=set-as-my-default-selector]");
        setAsUserDefaultButtonElement.removeClass("disabled");
        setAsUserDefaultButtonElement.removeAttr('disabled');

        if (enalbeResetBtn) {
            var resetToMyDefaultElement = $container.find("a[inf-ctrl=reset-to-my-default-selector]");
            resetToMyDefaultElement.removeClass("disabled");
            resetToMyDefaultElement.removeAttr('disabled');
        }
    }

    var _disableResetButtons = function ($container, disableResetBtn){
        var setAsUserDefaultButtonElement = $container.find("button[inf-ctrl=set-as-my-default-selector]");
        setAsUserDefaultButtonElement.addClass("disabled");
        setAsUserDefaultButtonElement.attr('disabled', 'disabled');
     
        if (disableResetBtn) {
            var resetToMyDefaultElement = $container.find("a[inf-ctrl=reset-to-my-default-selector]");
            resetToMyDefaultElement.addClass("disabled");
            resetToMyDefaultElement.attr('disabled', 'disabled');
        }
    }
    /**
     * bind fib drawing settings
     * @param {object} $container - main container
     * @param {function} onSingleLineColorChange - single line color change function
     * @param {function} onSingleFillColorChange - single fill color change function
     * @param {function} onSingleLineWidthChange - single line width change function
     * @param {function} onSingleOptionChange - single option change function
     * @param {function} onFibLevelFillColorChange - fib level fill color change function
     * @param {function} onFibLevelLineColorChange - fib level line color change function
     * @param {function} onFibLevelLineWidthChange - fib level line width change function
     * @param {function} onFibLevelChange - fib level change function
     * @param {function} onFibLevelValueChange - fib level value change function
     * @param {function} onFibModeChange - fib mode change function
     */
    var _bindFibSettings = function ($container, callBackFnFibSettings) {
        var onSingleLineColorChange = callBackFnFibSettings.onSingleLineColorChange,
            onSingleFillColorChange = callBackFnFibSettings.onSingleFillColorChange,
            onSingleLineWidthChange =  callBackFnFibSettings.onSingleLineWidthChange,
            onSingleOptionChange = callBackFnFibSettings.onSingleOptionChange,
            onFibLevelFillColorChange = callBackFnFibSettings.onFibLevelFillColorChange,
            onFibLevelLineColorChange = callBackFnFibSettings.onFibLevelLineColorChange,
            onFibLevelLineWidthChange = callBackFnFibSettings.onFibLevelLineWidthChange,
            onFibLevelChange = callBackFnFibSettings.onToggleFibLevel,
            onFibLevelValueChange = callBackFnFibSettings.onFibLvlValueChange,
            onFibModeChange = callBackFnFibSettings.onToggleFibMode,
            onSingleFontColorChange = callBackFnFibSettings.onSingleFontColorChange,
            onFibLevelFontColorChange = callBackFnFibSettings.onFibLevelFontColorChange,
            onSingleFontSizeChange = callBackFnFibSettings.onSingleFontSizeChange,
            onFibLevelFontSizeChange =  callBackFnFibSettings.onFibLevelFontSizeChange,
            onFibLevelFontWeightChange = callBackFnFibSettings.onFibLevelFontWeightChange,
            onSingleFontWeightChange = callBackFnFibSettings.onFibSingleFontWeightChange,
            onToggleSnapToHighLow = callBackFnFibSettings.onToggleSnapToHighLow,
            onSaveTemplate = callBackFnFibSettings.onSaveTemplate,
            onApplyTemplate = callBackFnFibSettings.onApplyTemplate,
            onDeleteTemplate = callBackFnFibSettings.onDeleteTemplate,
            onFibApplyAllButtonClick = callBackFnFibSettings.onFibApplyAllButtonClick,
            onSetAsMyDefaultSettings = callBackFnFibSettings.onSetAsMyDefaultSettings,
            onResetToAppDefaultSettings = callBackFnFibSettings.onResetToAppDefaultSettings,
            onResetToMyDefaultSettings = callBackFnFibSettings.onResetToMyDefaultSettings,
            onTrendLineToggleShow = callBackFnFibSettings.onTrendLineToggleShow,
            enabledMyDefaultButton = callBackFnFibSettings.enabledMyDefaultButton,
            onTrendLineColorChange = callBackFnFibSettings.onTrendLineColorChange,
            onTrendLineWidthChange = callBackFnFibSettings.onTrendLineWidthChange,
            onTrendLineStyleChange = callBackFnFibSettings.onTrendLineStyleChange;

        var parentContainer = $container.parent();
        var chartContainer = $container.parents().closest('[inf-container="chart_container"]');
        var popupMask;
        var setAsUserDefaultButtonElement = $container.find("button[inf-ctrl=set-as-my-default-selector]");
        var enableMyDefault;
        if (enabledMyDefaultButton && typeof enabledMyDefaultButton.getEnabledMyDefaultButton === 'function') {
           enableMyDefault = enabledMyDefaultButton.getEnabledMyDefaultButton(); 
        }
        if (enableMyDefault) {
            _enableResetButtons($container,false);
        } else {
            _disableResetButtons($container,false);
        }

        infChart.util.bindColorPicker($container.find("input[inf-ctrl=trendLineColorPicker]"), undefined, function (rgb, color, opacity) {
            onTrendLineColorChange(rgb, color, opacity);
            _enableResetButtons($container,false);
        });

        $container.find('li[inf-ctrl=lineWidth]').on('click', function (e) {
            var strokeWidth = $(this).attr("inf-size");
            var ctrlType = $(this).parent().attr('inf-ctrl');
            if (ctrlType === 'trendLine'){
                $container.find('li[inf-ctrl=lineWidth]').removeClass('active');
                $(this).addClass('active');
                onTrendLineWidthChange(strokeWidth);
                _enableResetButtons($container,false);
                e.stopPropagation();
            }
        });

        $container.find("li[inf-ctrl=lineStyle]").on('click', function (e) {
            var dashStyle = $(this).attr("inf-style");
            var ctrlType = $(this).parent().attr('inf-ctrl');
            if (ctrlType === 'trendLine'){
                $container.find("li[inf-ctrl=lineStyle]").removeClass('active');
                $(this).addClass('active');
                onTrendLineStyleChange(dashStyle);
                _enableResetButtons($container,false);
                e.stopPropagation();
            }
        });

        infChart.util.bindColorPicker($container.find("input[inf-ctrl=singleLineColorPicker]"), undefined, function (rgb, value) {
            var sfcCtrl = $container.find("input[inf-ctrl=singleFillColorControl]");
            if(!$(sfcCtrl).is(":checked")) {
                $(sfcCtrl).trigger('click');
            } else {
                onSingleLineColorChange(rgb, value, true);
                _enableResetButtons($container,false);
            }
        });

        infChart.util.bindColorPicker($container.find("input[inf-ctrl=singleFillColorPicker]"), undefined, function (rgb, value, opacity) {
            var sfcCtrl = $container.find("input[inf-ctrl=singleFillColorControl]");
            if(!$(sfcCtrl).is(":checked")) {
                $(sfcCtrl).trigger('click');
            } else {
                onSingleFillColorChange(rgb, value, opacity, true);
                _enableResetButtons($container,false);
            }
        });

        infChart.util.bindColorPicker($container.find("input[inf-ctrl=singleFontColorPicker]"), undefined, function (rgb, value) {
            var sfcCtrl = $container.find("input[inf-ctrl=singleFillColorControl]");
            if(!$(sfcCtrl).is(":checked")) {
                $(sfcCtrl).trigger('click');
            } else {
                onSingleFontColorChange(rgb, value, true);
                _enableResetButtons($container, false);
            }
        });

        infChart.util.bindColorPicker($container.find("input[inf-ctrl=fibLevelFillColorPicker]"), undefined, function (rgb, value, opacity) {
            var sfcCtrl = $container.find("input[inf-ctrl=singleFillColorControl]");
            if($(sfcCtrl).is(":checked")) {
                $(sfcCtrl).trigger('click');
            } else {
                onFibLevelFillColorChange(rgb, value, opacity, $(this).attr("inf-ctrl-val"));
                _enableResetButtons($container, false);
            }
        });

        infChart.util.bindColorPicker($container.find("input[inf-ctrl=fibLevelLineColorPicker]"), undefined, function (rgb, value) {
            var sfcCtrl = $container.find("input[inf-ctrl=singleFillColorControl]");
            if($(sfcCtrl).is(":checked")) {
                $(sfcCtrl).trigger('click');
            } else {
                onFibLevelLineColorChange(rgb, value, $(this).attr("inf-ctrl-val"));
                _enableResetButtons($container, false);
            }
        });

        infChart.util.bindColorPicker($container.find("input[inf-ctrl=fibLevelFontColorPicker]"), undefined, function (rgb, value) {
            var sfcCtrl = $container.find("input[inf-ctrl=singleFillColorControl]");
            if($(sfcCtrl).is(":checked")) {
                $(sfcCtrl).trigger('click');
            } else {
                onFibLevelFontColorChange(rgb, value, $(this).attr("inf-ctrl-val"));
                _enableResetButtons($container, false);
            }
        });

        $container.find('li[inf-ctrl=lineWidth]').on('click', function (e) {
            var strokeWidth = $(this).attr("inf-size");
            var ctrlType = $(this).parent().attr('inf-ctrl');
            var sfcCtrl = $container.find("input[inf-ctrl=singleFillColorControl]");
            var id = $(this).parent().parent().find("span[inf-ctrl="+ ctrlType +"SelectedLineWidth]").attr('inf-ctrl-val');
            if (id) {
                $(this).parent().parent().find("span[inf-ctrl="+ ctrlType +"SelectedLineWidth]").text($(this).text());
                $(this).parent().parent().find("span[inf-ctrl="+ ctrlType +"SelectedLineWidth]").attr('inf-size', strokeWidth);
                if (ctrlType === "single") {
                    if (!$(sfcCtrl).is(":checked")) {
                        $(sfcCtrl).trigger('click');
                    } else {
                        onSingleLineWidthChange(strokeWidth, true);
                        _enableResetButtons($container, false);
                    }
                } else {
                    if ($(sfcCtrl).is(":checked")) {
                        $(sfcCtrl).trigger('click');
                    } else {
                        onFibLevelLineWidthChange(strokeWidth, id);
                        _enableResetButtons($container, false);
                    }
                }
            }
        });

        $container.find('li[inf-ctrl=fontSize]').on('click', function (e) {
            var fontSize = $(this).attr("inf-size");
            var ctrlType = $(this).parent().attr('inf-ctrl');
            var sfcCtrl = $container.find("input[inf-ctrl=singleFillColorControl]");
            var id = $(this).parent().parent().find("span[inf-ctrl="+ ctrlType +"SelectedFontSize]").attr('inf-ctrl-val');
            $(this).parent().parent().find("span[inf-ctrl="+ ctrlType +"SelectedFontSize]").text($(this).text());
            $(this).parent().parent().find("span[inf-ctrl="+ ctrlType +"SelectedFontSize]").attr('inf-size', fontSize);
            if (ctrlType === "single") {
                if (!$(sfcCtrl).is(":checked")) {
                    $(sfcCtrl).trigger('click');
                } else {
                    onSingleFontSizeChange(fontSize, true);
                    _enableResetButtons($container, false);
                }
            } else {
                if ($(sfcCtrl).is(":checked")) {
                    $(sfcCtrl).trigger('click');
                } else {
                    onFibLevelFontSizeChange(fontSize, id);
                    _enableResetButtons($container, false);
                }
            }
        });

        $container.find("input[inf-ctrl=fibLevel]").on('click', function (e) {
            onFibLevelChange($(this).is(":checked"), $(this).attr("data-value"));
            _enableResetButtons($container, false);
            e.stopPropagation();
        });

        $container.find("input[inf-ctrl=fibLevelValue]").on('keypress', function (e) {
            if (e.which == 13) {
                e.preventDefault();
                $(this).trigger("blur");
            } else {
                _enableResetButtons($container, false);
            }
        });

        $container.find("input[inf-ctrl=fibLevelValue]").on('click', function (e) {
            $(this).parent().removeClass('has-error');
            e.stopPropagation();
        });

        $container.find("input[inf-ctrl=fibLevelValue]").on('blur', function (e) {
            var fibLevelValue = $(this).val();
            if (fibLevelValue !== "" && !isNaN(fibLevelValue)) {
                onFibLevelValueChange($(this).attr("data-value"), fibLevelValue * 100);
            } else {
                $(this).parent().addClass('has-error');
            }
            e.stopPropagation();
        });

        $container.find("input[inf-ctrl=singleFillColorControl]").on('click', function (e) {
            var color = $container.find("input[inf-ctrl=singleFillColorPicker]").val();
            var opacity = $container.find("input[inf-ctrl=singleFillColorPicker]").attr('data-opacity');
            var lineColor = $container.find("input[inf-ctrl=singleLineColorPicker]").val();
            var lineWidth = $container.find("span[inf-ctrl=singleSelectedLineWidth]").attr('inf-size');
            lineWidth = lineWidth ? lineWidth : 1;
            var fontColor = $container.find("input[inf-ctrl=singleFontColorPicker]").val();
            var fontSize = $container.find("span[inf-ctrl=singleSelectedFontSize]").attr('inf-size');
            var isSingleColor = $(this).is(":checked");
            var fontWeight = $container.find("button[inf-ctrl=singleToggleFontWeight]").attr('inf-font-weight');
            $container.find("button[inf-ctrl=singleApplyAll]").toggleClass('disabled', !isSingleColor).prop('disabled', !isSingleColor);

            var prevOptions = {};
            if(!isSingleColor) {
                prevOptions = _getFibLevelInputValues($container);
            }
            onSingleOptionChange(color, opacity, lineColor, lineWidth, fontColor, fontSize, fontWeight, prevOptions, isSingleColor);
            _enableResetButtons($container, false);
            e.stopPropagation();
        });

        $container.find("input[inf-ctrl=modeToggle]").on('click', function (e) {
            onFibModeChange($(this).is(":checked"));
            _enableResetButtons($container, false);
            e.stopPropagation();
        });

        $container.find("input[inf-ctrl=snapToHighLowToggle]").on('click', function (e) {
            onToggleSnapToHighLow($(this).is(":checked"));
            _enableResetButtons($container, false);
            e.stopPropagation();
        });

        $container.find("input[inf-ctrl=showTrendLineAlways]").on('click', function (e) {
            onTrendLineToggleShow($(this).is(":checked"));
            _enableResetButtons($container, false);
            e.stopPropagation();
        });

        $container.find("button[inf-ctrl=fibLevelToggleFontWeight]").on('click', function (e) {
            var sfcCtrl = $container.find("input[inf-ctrl=singleFillColorControl]");
            $(this).toggleClass( "active" );
            var newFontWeight = $(this).hasClass( "active" ) ? "bold" : "normal";
            $(this).attr("inf-font-weight", newFontWeight);
            if ($(sfcCtrl).is(":checked")) {
                $(sfcCtrl).trigger('click');
            } else {
                onFibLevelFontWeightChange($(this).attr('inf-ctrl-val'), newFontWeight, true);
                _enableResetButtons($container, false);
            }
            e.stopPropagation();
        });

        $container.find("button[inf-ctrl=singleToggleFontWeight]").on('click', function (e) {
            var sfcCtrl = $container.find("input[inf-ctrl=singleFillColorControl]");
            $(this).toggleClass( "active" );
            var newFontWeight = $(this).hasClass( "active" ) ? "bold" : "normal";
            $(this).attr("inf-font-weight", newFontWeight);
            if ($(sfcCtrl).is(":checked")) {
                onSingleFontWeightChange(newFontWeight, true, {}, true);
                _enableResetButtons($container, false);
            } else {
                $(sfcCtrl).trigger('click');
            }
            e.stopPropagation();
        });

        $container.find("button[inf-ctrl=singleApplyAll]").on('click', function (e) {
            removePopups();
            var sfcCtrl = $container.find("input[inf-ctrl=singleFillColorControl]");
            if ($(sfcCtrl).is(":checked")) {
                var color = $container.find("input[inf-ctrl=singleFillColorPicker]").val();
                var opacity = $container.find("input[inf-ctrl=singleFillColorPicker]").attr('data-opacity');
                var lineColor = $container.find("input[inf-ctrl=singleLineColorPicker]").val();
                var lineWidth = $container.find("span[inf-ctrl=singleSelectedLineWidth]").attr('inf-size');
                lineWidth = lineWidth ? lineWidth : 1;
                var fontColor = $container.find("input[inf-ctrl=singleFontColorPicker]").val();
                var fontSize = $container.find("span[inf-ctrl=singleSelectedFontSize]").attr('inf-size');
                var fontWeight = $container.find("button[inf-ctrl=singleToggleFontWeight]").attr('inf-font-weight');
                prevOptions = _getFibLevelInputValues($container);
                var confirmationMessage = "Are you sure want to apply one format for all levels? Formats set on individual levels will be overwritten.";
                _loadConfirmationPopup($container, confirmationMessage, function(){
                    onFibApplyAllButtonClick(color, opacity, lineColor, lineWidth, fontColor, fontSize, fontWeight, prevOptions);
                    _enableResetButtons($container, false);
                }, onClosePopups, getPosition(360), 360);
                onOpenPopups();
            }
            e.stopPropagation();
        });

        setAsUserDefaultButtonElement.on('click', function (e) {
            if(enabledMyDefaultButton && enabledMyDefaultButton.getEnabledMyDefaultButton){
                var enableMyDefault = enabledMyDefaultButton.getEnabledMyDefaultButton();
                if(enableMyDefault === undefined || enableMyDefault){
                    onSetAsMyDefaultSettings();
                    enabledMyDefaultButton.resetEnabledMyDefaultButton(enabledMyDefaultButton.chartId, enabledMyDefaultButton.shape, enabledMyDefaultButton.drawingId, true);
                    _disableResetButtons($container, true);
                    $container.find("a[inf-ctrl=reset-to-my-default-selector]").removeClass('disabled');
                    $container.find("a[inf-ctrl=reset-to-my-default-selector]").removeAttr('disabled');
                    e.stopPropagation();
                }
            }
        });

        $container.find("a[inf-ctrl=reset-to-app-default-selector]").on('click', function (e) {
            var confirmationMessage = "Do you want to erase your saved settings?";
            _loadConfirmationPopup($container, confirmationMessage, function(){
                onResetToAppDefaultSettings();
            }, onClosePopups, getPosition(360), 360);
            e.stopPropagation();
        });

        $container.find("a[inf-ctrl=reset-to-my-default-selector]").on('click', function (e) {
            if($(this).hasClass("disabled")){
                return;
            }
            if(enabledMyDefaultButton && enabledMyDefaultButton.getEnabledMyDefaultButton){
                var enableMyDefault = enabledMyDefaultButton.getEnabledMyDefaultButton();
                if(enableMyDefault === undefined || enableMyDefault){
                    onResetToMyDefaultSettings();
                    _disableResetButtons($container, true);
                    e.stopPropagation();
                }
            }
        });

        function removePopups () {
            parentContainer.find('[inf-container="confirmation"]').remove();
            onClosePopups();
        }

        function onOpenPopups () {
            popupMask = $(_getCustomMaskHTML());
            chartContainer.append(popupMask);
            infChart.util.bindEvent(popupMask, 'mousedown', function(){
                removePopups();
            });
        }

        function onClosePopups () {
            if (popupMask && popupMask.length > 0) {
                popupMask.remove();
            }
        }

        function getPosition(width) {
            return {
                top: $($container).position().top + $($container).height() / 4,
                left: $($container).position().left + ($($container).width() - width)/2
            };
        }

        _bindTemplateSelectionEvents($container, onSaveTemplate, onApplyTemplate, onDeleteTemplate);
    };

        /**
     * bind fib drawing settings
     * @param {object} $container - main container
     * @param {function} onSingleLineColorChange - single line color change function
     * @param {function} onSingleFillColorChange - single fill color change function
     * @param {function} onSingleLineWidthChange - single line width change function
     * @param {function} onSingleOptionChange - single option change function
     * @param {function} onFibLevelFillColorChange - fib level fill color change function
     * @param {function} onFibLevelLineColorChange - fib level line color change function
     * @param {function} onFibLevelLineWidthChange - fib level line width change function
     * @param {function} onFibLevelChange - fib level change function
     * @param {function} onFibLevelValueChange - fib level value change function
     * @param {function} onFibModeChange - fib mode change function
     */
    var _bindFibGenericSettings = function ($container, callBackFnFibGenSettings) {
        var onSingleLineColorChange = callBackFnFibGenSettings.onSingleLineColorChange,
            onSingleFillColorChange = callBackFnFibGenSettings.onSingleFillColorChange,
            onSingleLineWidthChange = callBackFnFibGenSettings.onSingleLineWidthChange,
            onSingleOptionChange = callBackFnFibGenSettings.onSingleOptionChange,
            onFibLevelFillColorChange = callBackFnFibGenSettings.onFibLevelFillColorChange,
            onFibLevelLineColorChange = callBackFnFibGenSettings.onFibLevelLineColorChange,
            onFibLevelLineWidthChange = callBackFnFibGenSettings.onFibLevelLineWidthChange,
            onFibLevelChange = callBackFnFibGenSettings.onToggleFibLevel,
            onFibLevelValueChange = callBackFnFibGenSettings.onFibLvlValueChange,
            onFibModeChange = callBackFnFibGenSettings.onToggleFibMode,
            onSingleFontColorChange = callBackFnFibGenSettings.onSingleFontColorChange,
            onFibLevelFontColorChange = callBackFnFibGenSettings.onFibLevelFontColorChange,
            onSingleFontSizeChange = callBackFnFibGenSettings.onSingleFontSizeChange,
            onFibLevelFontSizeChange = callBackFnFibGenSettings.onFibLevelFontSizeChange,
            onFibLevelFontWeightChange = callBackFnFibGenSettings.onFibLevelFontWeightChange,
            onSingleFontWeightChange = callBackFnFibGenSettings.onFibSingleFontWeightChange,
            onAlignStyleChange = callBackFnFibGenSettings.onAlignStyleChange,
            onToggleSnapToHighLow = callBackFnFibGenSettings.onToggleSnapToHighLow,
            onSaveTemplate = callBackFnFibGenSettings.onSaveTemplate,
            onApplyTemplate = callBackFnFibGenSettings.onApplyTemplate,
            onDeleteTemplate = callBackFnFibGenSettings.onDeleteTemplate,
            onFibApplyAllButtonClick = callBackFnFibGenSettings.onFibApplyAllButtonClick,
            onSetAsMyDefaultSettings = callBackFnFibGenSettings.onSetAsMyDefaultSettings,
            onResetToAppDefaultSettings = callBackFnFibGenSettings.onResetToAppDefaultSettings,
            onResetToMyDefaultSettings = callBackFnFibGenSettings.onResetToMyDefaultSettings,
            onTrendLineToggleShow = callBackFnFibGenSettings.onTrendLineToggleShow,
            enabledMyDefaultButton = callBackFnFibGenSettings.enabledMyDefaultButton,
            onTrendLineColorChange = callBackFnFibGenSettings.onTrendLineColorChange,
            onTrendLineWidthChange = callBackFnFibGenSettings.onTrendLineWidthChange,
            onTrendLineStyleChange = callBackFnFibGenSettings.onTrendLineStyleChange;

        
        var parentContainer = $container.parent();
        var chartContainer = $container.parents().closest('[inf-container="chart_container"]');
        var popupMask;
        var setAsUserDefaultButtonElement = $container.find("button[inf-ctrl=set-as-my-default-selector]");
        
        if(enabledMyDefaultButton && enabledMyDefaultButton.getEnabledMyDefaultButton){
            var enableMyDefault = enabledMyDefaultButton.getEnabledMyDefaultButton();
            if (enableMyDefault) {
                _enableResetButtons($container,false);
            } else {
                _disableResetButtons($container,false);
            }
        }

        infChart.util.bindColorPicker($container.find("input[inf-ctrl=trendLineColorPicker]"), undefined, function (rgb, color, opacity) {
            onTrendLineColorChange(rgb, color, opacity);
            _enableResetButtons($container,false);
        });

        $container.find('li[inf-ctrl=lineWidth]').on('click', function (e) {
            var strokeWidth = $(this).attr("inf-size");
            var ctrlType = $(this).parent().attr('inf-ctrl');
            if (ctrlType === 'trendLine'){
                $container.find('li[inf-ctrl=lineWidth]').removeClass('active');
                $(this).addClass('active');
                onTrendLineWidthChange(strokeWidth);
                _enableResetButtons($container,false);
                e.stopPropagation();
            }
        });

        $container.find("li[inf-ctrl=lineStyle]").on('click', function (e) {
            var dashStyle = $(this).attr("inf-style");
            var ctrlType = $(this).parent().attr('inf-ctrl');
            if (ctrlType === 'trendLine') {
                $container.find("li[inf-ctrl=lineStyle]").removeClass('active');
                $(this).addClass('active');
                onTrendLineStyleChange(dashStyle);
                _enableResetButtons($container,false);
                e.stopPropagation();
            }
        });

        $container.find("li[inf-ctrl=alignStyle]").on('click', function (e) {
            var linePosition = $(this).attr('inf-style');
            var type = $(this).parent().attr('inf-ctrl');
            if(type == "fibExtentionAlign"){
                $container.find('ul[inf-ctrl="fibExtentionAlign"]').find('li[inf-ctrl="alignStyle"]').removeClass('active');
                var subType = "fibExtention";
            }
            if(type == "fibRetracementAlign"){
                $container.find('ul[inf-ctrl="fibRetracementAlign"]').find('li[inf-ctrl="alignStyle"]').removeClass('active');
                var subType = "fibRetracement";
            }
            $(this).addClass('active');
            onAlignStyleChange(linePosition, subType);
            _enableResetButtons($container,false);
            e.stopPropagation();
        });

        infChart.util.bindColorPicker($container.find("input[inf-ctrl=singleLineColorPicker]"), undefined, function (rgb, value) {
            if($(this).attr('sub-type') == "fibExtention"){
                var sfcCtrl = $container.find("input[inf-ctrl=singleExtentionFillColorControl]");
            }
            if($(this).attr('sub-type') == "fibRetracement"){
                var sfcCtrl = $container.find("input[inf-ctrl=singleRetrancementFillColorControl]");
            }
            if(!$(sfcCtrl).is(":checked")) {
                $(sfcCtrl).trigger('click');
            } else {
                onSingleLineColorChange(rgb, value, true, undefined, $(this).attr('sub-type'));
                _enableResetButtons($container,false);
            }
        });

        infChart.util.bindColorPicker($container.find("input[inf-ctrl=singleFillColorPicker]"), undefined, function (rgb, value, opacity) {
            if($(this).attr('sub-type') == "fibExtention"){
                var sfcCtrl = $container.find("input[inf-ctrl=singleExtentionFillColorControl]");
            }
            if($(this).attr('sub-type') == "fibRetracement"){
                var sfcCtrl = $container.find("input[inf-ctrl=singleRetrancementFillColorControl]");
            }
            if(!$(sfcCtrl).is(":checked")) {
                $(sfcCtrl).trigger('click');
            } else {
                onSingleFillColorChange(rgb, value, opacity, true, undefined, $(this).attr('sub-type'));
                _enableResetButtons($container,false);
            }
        });

        infChart.util.bindColorPicker($container.find("input[inf-ctrl=singleFontColorPicker]"), undefined, function (rgb, value) {
            if($(this).attr('sub-type') == "fibExtention"){
                var sfcCtrl = $container.find("input[inf-ctrl=singleExtentionFillColorControl]");
            }
            if($(this).attr('sub-type') == "fibRetracement"){
                var sfcCtrl = $container.find("input[inf-ctrl=singleRetrancementFillColorControl]");
            }
            if(!$(sfcCtrl).is(":checked")) {
                $(sfcCtrl).trigger('click');
            } else {
                onSingleFontColorChange(rgb, value, true, undefined, $(this).attr('sub-type'));
                _enableResetButtons($container, false);
            }
        });

        infChart.util.bindColorPicker($container.find("input[inf-ctrl=fibLevelFillColorPicker]"), undefined, function (rgb, value, opacity) {
            if($(this).attr('sub-type') == "fibExtention"){
                var sfcCtrl = $container.find("input[inf-ctrl=singleExtentionFillColorControl]");
            }
            if($(this).attr('sub-type') == "fibRetracement"){
                var sfcCtrl = $container.find("input[inf-ctrl=singleRetrancementFillColorControl]");
            }
            if($(sfcCtrl).is(":checked")) {
                $(sfcCtrl).trigger('click');
            } else {
                onFibLevelFillColorChange(rgb, value, opacity, $(this).attr("inf-ctrl-val"), $(this).attr('sub-type'));
                _enableResetButtons($container, false);
            }
        });

        infChart.util.bindColorPicker($container.find("input[inf-ctrl=fibLevelLineColorPicker]"), undefined, function (rgb, value) {
            if($(this).attr('sub-type') == "fibExtention"){
                var sfcCtrl = $container.find("input[inf-ctrl=singleExtentionFillColorControl]");
            }
            if($(this).attr('sub-type') == "fibRetracement"){
                var sfcCtrl = $container.find("input[inf-ctrl=singleRetrancementFillColorControl]");
            }
            if($(sfcCtrl).is(":checked")) {
                $(sfcCtrl).trigger('click');
            } else {
                onFibLevelLineColorChange(rgb, value, $(this).attr("inf-ctrl-val"), $(this).attr('sub-type'));
                _enableResetButtons($container, false);
            }
        });

        infChart.util.bindColorPicker($container.find("input[inf-ctrl=fibLevelFontColorPicker]"), undefined, function (rgb, value) {
            if($(this).attr('sub-type') == "fibExtention"){
                var sfcCtrl = $container.find("input[inf-ctrl=singleExtentionFillColorControl]");
            }
            if($(this).attr('sub-type') == "fibRetracement"){
                var sfcCtrl = $container.find("input[inf-ctrl=singleRetrancementFillColorControl]");
            }
            if($(sfcCtrl).is(":checked")) {
                $(sfcCtrl).trigger('click');
            } else {
                onFibLevelFontColorChange(rgb, value, $(this).attr("inf-ctrl-val"), $(this).attr('sub-type'));
                _enableResetButtons($container, false);
            }
        });

        $container.find('li[inf-ctrl=lineWidth]').on('click', function (e) {
            var strokeWidth = $(this).attr("inf-size");
            var ctrlType = $(this).parent().attr('inf-ctrl');
            var subType = $(this).parent().parent().find("span[inf-ctrl="+ ctrlType +"SelectedLineWidth]").attr('sub-type');
            if(subType == "fibExtention"){
                var sfcCtrl = $container.find("input[inf-ctrl=singleExtentionFillColorControl]");
            }
            if(subType == "fibRetracement"){
                var sfcCtrl = $container.find("input[inf-ctrl=singleRetrancementFillColorControl]");
            }
            var id = $(this).parent().parent().find("span[inf-ctrl="+ ctrlType +"SelectedLineWidth]").attr('inf-ctrl-val');
            if(id) {
                $(this).parent().parent().find("span[inf-ctrl="+ ctrlType +"SelectedLineWidth]").text($(this).text());
                $(this).parent().parent().find("span[inf-ctrl="+ ctrlType +"SelectedLineWidth]").attr('inf-size', strokeWidth);
                
                if (ctrlType === "single") {
                    if (!$(sfcCtrl).is(":checked")) {
                        $(sfcCtrl).trigger('click');
                    } else {
                        onSingleLineWidthChange(strokeWidth, true, undefined, subType);
                        _enableResetButtons($container, false);
                    }
                } else {
                    if ($(sfcCtrl).is(":checked")) {
                        $(sfcCtrl).trigger('click');
                    } else {
                        onFibLevelLineWidthChange(strokeWidth, id, subType);
                        _enableResetButtons($container, false);
                    }
                }
            }   
        });

        $container.find('li[inf-ctrl=fontSize]').on('click', function (e) {
            var fontSize = $(this).attr("inf-size");
            var ctrlType = $(this).parent().attr('inf-ctrl');
            var subType = $(this).parent().parent().find("span[inf-ctrl="+ ctrlType +"SelectedFontSize]").attr('sub-type');
            if(subType == "fibExtention"){
                var sfcCtrl = $container.find("input[inf-ctrl=singleExtentionFillColorControl]");
            }
            if(subType == "fibRetracement"){
                var sfcCtrl = $container.find("input[inf-ctrl=singleRetrancementFillColorControl]");
            }
            var id = $(this).parent().parent().find("span[inf-ctrl="+ ctrlType +"SelectedFontSize]").attr('inf-ctrl-val');
            $(this).parent().parent().find("span[inf-ctrl="+ ctrlType +"SelectedFontSize]").text($(this).text());
            $(this).parent().parent().find("span[inf-ctrl="+ ctrlType +"SelectedFontSize]").attr('inf-size', fontSize);
            if (ctrlType === "single") {
                if (!$(sfcCtrl).is(":checked")) {
                    $(sfcCtrl).trigger('click');
                } else {
                    onSingleFontSizeChange(fontSize, true, undefined, subType);
                    _enableResetButtons($container, false);
                }
            } else {
                if ($(sfcCtrl).is(":checked")) {
                    $(sfcCtrl).trigger('click');
                } else {
                    onFibLevelFontSizeChange(fontSize, id, subType);
                    _enableResetButtons($container, false);
                }
            }
        });

        $container.find("input[inf-ctrl=fibLevel]").on('click', function (e) {
            onFibLevelChange($(this).is(":checked"), $(this).attr("data-value"), $(this).attr("sub-type"));
            _enableResetButtons($container, false);
            e.stopPropagation();
        });

        $container.find("input[inf-ctrl=showTrendLineAlways]").on('click', function (e) {
            onTrendLineToggleShow($(this).is(":checked"));
            _enableResetButtons($container, false);
            e.stopPropagation();
        });

        $container.find("input[inf-ctrl=fibLevelValue]").on('keypress', function (e) {
            if (e.which == 13) {
                e.preventDefault();
                $(this).trigger("blur");
            }
            _enableResetButtons($container, false);
        });

        $container.find("input[inf-ctrl=fibLevelValue]").on('click', function (e) {
            $(this).parent().removeClass('has-error');
            e.stopPropagation();
        });

        $container.find("input[inf-ctrl=fibLevelValue]").on('blur', function (e) {
            var fibLevelValue = $(this).val();
            if (fibLevelValue !== "" && !isNaN(fibLevelValue)) {
                onFibLevelValueChange($(this).attr("data-value"), fibLevelValue * 100, $(this).attr("sub-type"));
            } else {
                $(this).parent().addClass('has-error');
            }
            e.stopPropagation();
        });

        $container.find("input[inf-ctrl=singleExtentionFillColorControl]").on('click', function (e) {
            var color = $container.find("input[inf-ctrl=singleFillColorPicker][sub-type=fibExtention]").val();
            var opacity = $container.find("input[inf-ctrl=singleFillColorPicker][sub-type=fibExtention]").attr('data-opacity');
            var lineColor = $container.find("input[inf-ctrl=singleLineColorPicker][sub-type=fibExtention]").val();
            var lineWidth = $container.find("span[inf-ctrl=singleSelectedLineWidth][sub-type=fibExtention]").attr('inf-size');
            lineWidth = lineWidth ? lineWidth : 1;
            var fontColor = $container.find("input[inf-ctrl=singleFontColorPicker][sub-type=fibExtention]").val();
            var fontSize = $container.find("span[inf-ctrl=singleSelectedFontSize][sub-type=fibExtention]").attr('inf-size');
            var isSingleColor = $(this).is(":checked");
            var fontWeight = $container.find("button[inf-ctrl=singleToggleFontWeight][sub-type=fibExtention]").attr('inf-font-weight');

            $container.find("button[inf-ctrl=singleApplyAll][sub-type=fibExtention]").toggleClass('disabled', !isSingleColor).prop('disabled', !isSingleColor);

            var prevOptions = {};
            if(!isSingleColor) {
                prevOptions = _getFibGenericLevelInputValues($container, "fibExtention");
            }
            onSingleOptionChange(color, opacity, lineColor, lineWidth, fontColor, fontSize, fontWeight, prevOptions, isSingleColor, "fibExtention");
            _enableResetButtons($container, false);
            e.stopPropagation();
        });

        $container.find("input[inf-ctrl=singleRetrancementFillColorControl]").on('click', function (e) {
            var color = $container.find("input[inf-ctrl=singleFillColorPicker][sub-type=fibRetracement]").val();
            var opacity = $container.find("input[inf-ctrl=singleFillColorPicker][sub-type=fibRetracement]").attr('data-opacity');
            var lineColor = $container.find("input[inf-ctrl=singleLineColorPicker][sub-type=fibRetracement]").val();
            var lineWidth = $container.find("span[inf-ctrl=singleSelectedLineWidth][sub-type=fibRetracement]").attr('inf-size');
            lineWidth = lineWidth ? lineWidth : 1;
            var fontColor = $container.find("input[inf-ctrl=singleFontColorPicker][sub-type=fibRetracement]").val();
            var fontSize = $container.find("span[inf-ctrl=singleSelectedFontSize][sub-type=fibRetracement]").attr('inf-size');
            var isSingleColor = $(this).is(":checked");
            var fontWeight = $container.find("button[inf-ctrl=singleToggleFontWeight][sub-type=fibRetracement]").attr('inf-font-weight');
            $container.find("button[inf-ctrl=singleApplyAll][sub-type=fibRetracement]").toggleClass('disabled', !isSingleColor).prop('disabled', !isSingleColor);

            var prevOptions = {};
            if(!isSingleColor) {
                prevOptions = _getFibGenericLevelInputValues($container, "fibRetracement");
            }
            onSingleOptionChange(color, opacity, lineColor, lineWidth, fontColor, fontSize, fontWeight, prevOptions, isSingleColor, "fibRetracement");
            _enableResetButtons($container, false);
            e.stopPropagation();
        });

        $container.find("input[inf-ctrl=snapToHighLowToggle]").on('click', function (e) {
            onToggleSnapToHighLow($(this).is(":checked"));
            _enableResetButtons($container, false);
            e.stopPropagation();
        });

        $container.find("button[inf-ctrl=fibLevelToggleFontWeight]").on('click', function (e) {
            if($(this).attr('sub-type') == "fibExtention"){
                var sfcCtrl = $container.find("input[inf-ctrl=singleExtentionFillColorControl]");
            }
            if($(this).attr('sub-type') == "fibRetracement"){
                var sfcCtrl = $container.find("input[inf-ctrl=singleRetrancementFillColorControl]");
            }
            $(this).toggleClass( "active" );
            var newFontWeight = $(this).hasClass( "active" ) ? "bold" : "normal";
            $(this).attr("inf-font-weight", newFontWeight);
            if ($(sfcCtrl).is(":checked")) {
                $(sfcCtrl).trigger('click');
            } else {
                onFibLevelFontWeightChange($(this).attr('inf-ctrl-val'), newFontWeight, $(this).attr('sub-type'), true);
                _enableResetButtons($container, false);
            }
            e.stopPropagation();
        });

        $container.find("button[inf-ctrl=singleToggleFontWeight]").on('click', function (e) {
            if($(this).attr('sub-type') == "fibExtention"){
                var sfcCtrl = $container.find("input[inf-ctrl=singleExtentionFillColorControl]");
            }
            if($(this).attr('sub-type') == "fibRetracement"){
                var sfcCtrl = $container.find("input[inf-ctrl=singleRetrancementFillColorControl]");
            }
            $(this).toggleClass( "active" );
            var newFontWeight = $(this).hasClass( "active" ) ? "bold" : "normal";
            $(this).attr("inf-font-weight", newFontWeight);
            if ($(sfcCtrl).is(":checked")) {
                onSingleFontWeightChange(newFontWeight, true, {}, $(this).attr('sub-type'), true);
                _enableResetButtons($container, false);
            } else {
                $(sfcCtrl).trigger('click');
            }
            e.stopPropagation();
        });

        $container.find("button[inf-ctrl=singleApplyAll]").on('click', function (e) {
            removePopups();
            var subType = $(this).attr('sub-type');
            if(subType == "fibExtention"){
                var sfcCtrl = $container.find("input[inf-ctrl=singleExtentionFillColorControl]");
            }
            if(subType == "fibRetracement"){
                var sfcCtrl = $container.find("input[inf-ctrl=singleRetrancementFillColorControl]");
            }
            if ($(sfcCtrl).is(":checked")) {
                var color = $container.find("input[inf-ctrl=singleFillColorPicker][sub-type=" + subType + "]").val();
                var opacity = $container.find("input[inf-ctrl=singleFillColorPicker][sub-type=" + subType + "]").attr('data-opacity');
                var lineColor = $container.find("input[inf-ctrl=singleLineColorPicker][sub-type=" + subType + "]").val();
                var lineWidth = $container.find("span[inf-ctrl=singleSelectedLineWidth][sub-type=" + subType + "]").attr('inf-size');
                lineWidth = lineWidth ? lineWidth : 1;
                var fontColor = $container.find("input[inf-ctrl=singleFontColorPicker][sub-type=" + subType + "]").val();
                var fontSize = $container.find("span[inf-ctrl=singleSelectedFontSize][sub-type=" + subType + "]").attr('inf-size');
                var fontWeight = $container.find("button[inf-ctrl=singleToggleFontWeight][sub-type=" + subType + "]").attr('inf-font-weight');
                prevOptions = _getFibGenericLevelInputValues($container, subType);
                var confirmationMessage = "Are you sure want to apply one format for all levels? Formats set on individual levels will be overwritten.";
                _loadConfirmationPopup($container, confirmationMessage, function(){
                    onFibApplyAllButtonClick(color, opacity, lineColor, lineWidth, fontColor, fontSize, fontWeight, prevOptions, subType);
                }, onClosePopups, getPosition(360), 360);
                onOpenPopups();
                _enableResetButtons($container, false);
            }
            e.stopPropagation();
        });

        setAsUserDefaultButtonElement.on('click', function (e) {
            if(enabledMyDefaultButton && enabledMyDefaultButton.getEnabledMyDefaultButton){
                var enableMyDefault = enabledMyDefaultButton.getEnabledMyDefaultButton();
                if(enableMyDefault === undefined || enableMyDefault){
                    onSetAsMyDefaultSettings();
                    enabledMyDefaultButton.resetEnabledMyDefaultButton(enabledMyDefaultButton.chartId, enabledMyDefaultButton.shape, enabledMyDefaultButton.drawingId, true);
                    _disableResetButtons($container, true);
                    $container.find("a[inf-ctrl=reset-to-my-default-selector]").removeClass('disabled');
                    $container.find("a[inf-ctrl=reset-to-my-default-selector]").removeAttr('disabled');
                    e.stopPropagation();
                }
            }
        });

        $container.find("a[inf-ctrl=reset-to-app-default-selector]").on('click', function (e) {
            var confirmationMessage = "Do you want to erase your saved settings?";
            _loadConfirmationPopup($container, confirmationMessage, function(){
                onResetToAppDefaultSettings();
            }, onClosePopups, getPosition(360), 360);
            e.stopPropagation();
        });

        $container.find("a[inf-ctrl=reset-to-my-default-selector]").on('click', function (e) {
            if($(this).hasClass("disabled")){
                return;
            }
            if(enabledMyDefaultButton && enabledMyDefaultButton.getEnabledMyDefaultButton){
                var enableMyDefault = enabledMyDefaultButton.getEnabledMyDefaultButton();
                if(enableMyDefault === undefined || enableMyDefault){
                    onResetToMyDefaultSettings();
                    _disableResetButtons($container, true);
                    e.stopPropagation();
                }
            }
        });

        function removePopups () {
            parentContainer.find('[inf-container="confirmation"]').remove();
            onClosePopups();
        }

        function onOpenPopups () {
            popupMask = $(_getCustomMaskHTML());
            chartContainer.append(popupMask);
            infChart.util.bindEvent(popupMask, 'mousedown', function(){
                removePopups();
            });
        }

        function onClosePopups () {
            if (popupMask && popupMask.length > 0) {
                popupMask.remove();
            }
        }

        function getPosition(width) {
            return {
                top: $($container).position().top + $($container).height() / 4,
                left: $($container).position().left + ($($container).width() - width)/2
            };
        }

        _bindTemplateSelectionEvents($container, onSaveTemplate, onApplyTemplate, onDeleteTemplate);
    };

    /**
     * bind label settings
     * @param {object} $container - main container
     * @param {function} onColorChange - color change function
     * @param {function} onFontSizeChange - font size change function
     * @param {function} onFontStyleChange - font style change function
     * @param {function} onTextChange - text change function
     */
    var _bindLabelSettings = function ($container, onColorChange, onFontSizeChange, onFontStyleChange, onTextChange, onBorderColorChange, onBackgroundColorChange, onApplyBorderColor, onApplyBackgroundColor, onResetToDefault) {
        infChart.util.bindColorPicker($container.find("input[inf-ctrl=colorPicker]"), undefined, onColorChange);
        $container.find("li[inf-ctrl=fontSize]").on('click', function (e) {
            var fontSize = $(this).attr('inf-size');
            onFontSizeChange(fontSize);
            var ctrlType = $(this).parent().attr('inf-ctrl');
            $(this).parent().parent().find("span[inf-ctrl="+ ctrlType +"SelectedFontSize]").text($(this).text()).attr('inf-size', fontSize);
            //e.stopPropagation();
        });

        $container.find("input[inf-ctrl=backgroundColorEnabled]").on('click', function (e) {
            var color = $container.find("input[inf-ctrl=backgroundColorPicker]").attr('value');
            onApplyBackgroundColor($(this).is(":checked"), color);
            e.stopPropagation();
        });

        $container.find("input[inf-ctrl=borderColorEnabled]").on('click', function (e) {
            var color = $container.find("input[inf-ctrl=borderColorPicker]").attr('value');
            onApplyBorderColor($(this).is(":checked"), color);
            e.stopPropagation();
        });

        infChart.util.bindColorPicker($container.find("input[inf-ctrl=borderColorPicker]"), undefined, function (rgb, value, opacity) {
            var sfcCtrl = $container.find("input[inf-ctrl=borderColorEnabled]");
            if(!$(sfcCtrl).is(":checked")) {
                onBorderColorChange(rgb, value, opacity, false, true);
            } else {
                onBorderColorChange(rgb, value, opacity, true, true);
            }
        });

        infChart.util.bindColorPicker($container.find("input[inf-ctrl=backgroundColorPicker]"), undefined, function (rgb, value, opacity) {
            var sfcCtrl = $container.find("input[inf-ctrl=backgroundColorEnabled]");
            if(!$(sfcCtrl).is(":checked")) {
                onBackgroundColorChange(rgb, value, opacity, false, true);
            } else {
                onBackgroundColorChange(rgb, value, opacity, true, true);
            }
        });

        $container.find("li[inf-ctrl=fontStyle]").on('click', function (e) {
            var style = $(this).attr('inf-style'), checked = $(this).hasClass('active');
            onFontStyleChange(style, checked);
            if (checked) {
                $(this).removeClass('active');
            } else {
                $(this).addClass('active');
            }
            e.stopPropagation();
        });

        $container.find("textarea[inf-ctrl=text]").on('keyup', function () {
            onTextChange($(this).val());
        }).on('blur', function () {
            var text = $(this).val();

            if (text === "") {
                $(this).val("");
                onTextChange("");
            }
        });

        _bindResetToDefaultEvent($container , onResetToDefault);
    };

    /**
     * bind high / low labels settings
     * @param {object} $container - main container
     * @param {function} onColorChange - color change function
     * @param {function} onLabelItemsChange - label item change function
     */
    var _bindHighLowLabelsSettings = function ($container, onColorChange, onLabelItemsChange, onResetToDefault) {
        infChart.util.bindColorPicker($container.find("input[inf-ctrl=colorPicker]"), undefined, onColorChange);

        $container.find("input[inf-ctrl=labelDataItem]").on('click', function (e) {
            onLabelItemsChange($(this).attr("data-value"), $(this).is(":checked"));
            e.stopPropagation();
        });

        _bindResetToDefaultEvent($container , onResetToDefault);
    };

    /**
     * bind regression channel settings
     * @param {object} $container - main container
     * @param {function} onColorChange - color change function
     * @param {function} onFillColorChange - fill color change function
     * @param {function} onLineWidthChange - line width change function
     */
    var _bindRegressionChannelSettings = function ($container, onColorChange, onFillColorChange, onLineWidthChange, onResetToDefault) {
        infChart.util.bindColorPicker($container.find("input[inf-ctrl=lineColorPicker]"), undefined, onColorChange);

        infChart.util.bindColorPicker($container.find("input[inf-ctrl=fillColorPicker]"), undefined, function (rgb, value, opacity) {
            onFillColorChange(rgb, value, opacity, $(this).attr("inf-ctrl-val"));
        });

        _bindSeriesLineWidthEvents($container, onLineWidthChange);

        _bindResetToDefaultEvent($container , onResetToDefault);
    };

    var _bindSeriesLineWidthEvents = function ($container, callbackFn, enableMyDefault) {
        // set line styles
        $container.find('li[inf-ctrl=lineWidth]').on('click', function (e) {
            var strokeWidth = parseInt($(this).attr("inf-size"));
            $container.find('li[inf-ctrl=lineWidth]').removeClass('active');
            $(this).addClass('active');
            callbackFn(strokeWidth);
            if (enableMyDefault){
                enableMyDefault($container, false);
            }
            e.stopPropagation();
        });
    };

    var _updatePriceLineSettings = function ($container, takeProfit, stopLoss, yValue) {
        $container.find('input[inf-ctrl="entryValue"]').val(parseFloat(yValue).toFixed(3));
        var combinedAdditionalDrawingArr = takeProfit.concat(stopLoss);
        $.each(combinedAdditionalDrawingArr, function(key, value){
            $container.find('input[inf-ctrl=priceLevelValue][inf-value=' + value.id + ']').val(parseFloat(value.yValue).toFixed(3));
            $container.find('input[inf-ctrl=applyPriceLine][inf-value=' + value.id + ']').prop('checked', value.enable);
            $container.find('input[inf-ctrl="lineColorPicker"][inf-ctrl-val=' + value.id + ']').data('minicolors-initialized', false);
            $container.find('input[inf-ctrl="lineColorPicker"][inf-ctrl-val=' + value.id + ']').minicolors('value', value.lineColor);
            $container.find('input[inf-ctrl="lineColorPicker"][inf-ctrl-val=' + value.id + ']').data('minicolors-initialized', true);

            var element = $container.find('span[inf-ctrl="priceLineLevelSelectedLineWidth"][inf-ctrl-val=' + value.id + ']').parent().parent();
            var widthText = $(element.find('li[inf-ctrl="lineWidth"][inf-size="' + value.lineWidth + '"]')).find('span').text();
            $(element.find('span[inf-ctrl="priceLineLevelSelectedLineWidth"]')).text(widthText);
            $(element.find('span[inf-ctrl="priceLineLevelSelectedLineWidth"]')).attr('inf-size', value.lineWidth);

            var element = $container.find('span[inf-ctrl="priceLineLevelSelectedLineStyle"][inf-ctrl-val=' + value.id + ']').parent().parent();
            var lineStyleEle = $(element.find('li[inf-ctrl="lineStyle"][inf-style="' + value.lineStyle + '"]')).children().children().clone();
            $(element.find("span[inf-ctrl=priceLineLevelSelectedLineStyle]")).html(lineStyleEle);
            $(element.find("span[inf-ctrl=priceLineLevelSelectedLineStyle]")).attr('inf-style', value.lineStyle);
        });
    };

    //common function to update settings of rectangle, ellipse, regression line, andrew's pitchfork
    var _updateBasicDrawingSettings = function ($container, color, lineWidth, fillColor, fillOpacity, text, checked, verticalPosition, horizontalPosition, shape, selectFirstdropDown, isExtendToRight, isExtendToLeft, fontColor, fontSize) {
        textRef = shape === "rectangle" ? "rect-text": "ellipse-text";
        $container.find('li[inf-ctrl="lineWidth"]').removeClass('active');
        $container.find('input[inf-ctrl="textColorPicker"]').mainColorPanel('value', fontColor);

        if(selectFirstdropDown){
            $($container.find('li[inf-ctrl="lineWidth"][inf-size="' + lineWidth + '"]')[0]).addClass('active');
        } else {
            $container.find('li[inf-ctrl="lineWidth"][inf-size="' + lineWidth + '"]').addClass('active');
        }
        $container.find('input[inf-ctrl="lineColorPicker"]').mainColorPanel('value', color);
        if (fillColor) {
            $container.find('input[inf-ctrl="fillColorPicker"]').mainColorPanel('value', fillColor);
            $container.find('input[inf-ctrl="fillColorPicker"]').mainColorPanel('opacity', fillOpacity);
        }

        if(text !== undefined) {
            $container.find("textarea[inf-ctrl= "+ textRef+"]").val(text);
        }

        if (shape === "rectangle") {
            $container.find("div[inf-ctrl=verticalType]").find("span[rel=selectItem]").text(verticalPosition);
            $container.find("div[inf-ctrl=horizontalType]").find("span[rel=selectItem]").text(horizontalPosition);
            $container.find('input[inf-ctrl="extendToRight"]').prop('checked', isExtendToRight);
            $container.find('input[inf-ctrl="extendToLeft"]').prop('checked', isExtendToLeft);
        }
        
        if(checked) {
            $container.find('input[inf-ctrl="textToggle"]').prop('checked', checked);    
            $container.find("textarea[inf-ctrl=" + textRef + "]").removeAttr("disabled");
            $container.find("input[inf-ctrl=textColorPicker]").removeAttr("disabled");
            $($container.find("span[inf-ctrl=singleSelectedFontSize]")[0]).parent().removeAttr("disabled");
            setTimeout(() => {
                $container.find("textarea[inf-ctrl=" + textRef + " ]").focus();
            }, 0);
            if(shape === "rectangle") {
                $container.find("div[inf-ctrl=verticalType]").find('button').prop('disabled', false);
                $container.find("div[inf-ctrl=horizontalType]").find('button').prop('disabled', false);
            }
            
        } else if (checked === false){
            $container.find("textarea[inf-ctrl=" + textRef +"]").attr("disabled","disabled");
            if ( shape === "rectangle") {
                $container.find("div[inf-ctrl=verticalType]").find('button').prop('disabled', true);
            $container.find("div[inf-ctrl=horizontalType]").find('button').prop('disabled', true);
            }
            $container.find("input[inf-ctrl=textColorPicker]").attr("disabled","disabled");
            $($container.find("span[inf-ctrl=singleSelectedFontSize]")[0]).parent().attr("disabled","disabled");
        }

        $container.find('span[inf-ctrl="singleSelectedFontSize"][inf-ctrl-val="P_all"]').text(fontSize);
        $container.find('span[inf-ctrl="singleSelectedFontSize"][inf-ctrl-val="P_all"]').attr('inf-size', fontSize);

    };

    var _updateAndrewsPitchForkSettings = function ($container, options) {
        _updateBasicDrawingSettings($container, options.medianLineColor, options.medianLineWidth, undefined, undefined, undefined, undefined, undefined, undefined, undefined, true);
        var updateProperties = {
            fillColor: options.fillColor,
            fillOpacity: options.fillOpacity,
            lineColor: options.borderColor,
            lineWidth: options.strokeWidth,
            isSingleColor: options.isSingleColor,
            fibLevels: options.fibLevels,
        }
        _updateFibSettings($container, updateProperties);
    };

    var _updateArrowSettings = function ($container, color, labelText) {
        if (color) {
            $container.find('input[inf-ctrl="colorPicker"]').mainColorPanel('value', color);
        }
        if (labelText) {
            $container.find('textArea[inf-ctrl="text"]').val(labelText);
        }
    };

    /**
     * update fib settings panel elements with drowing properties
     * @param {object} $container - setting panel html object
     * @param {string} fillColor - hex fill color (single color)
     * @param {number} fillOpacity - fill opacity
     * @param {string} lineColor - hex line color (single color)
     * @param {number} lineWidth - line width
     * @param {boolean} isSingleColor - is single color enable - apply one color enable
     * @param {Array} fibLevels - fib levels
     */
    var _updateFibSettings = function ($container, updateProperties) {
        var fillColor = updateProperties.fillColor,
            fillOpacity = updateProperties.fillOpacity,
            lineColor = updateProperties.lineColor,
            lineWidth = updateProperties.lineWidth,
            fontSize = updateProperties.fontSize,
            fontColor = updateProperties.fontColor,
            isSingleColor = updateProperties.isSingleColor,
            fibLevels = updateProperties.fibLevels,
            isFibModeEnabled = updateProperties.isFibModeEnabled,
            isSnapTopHighLowEnabled = updateProperties.isSnapTopHighLowEnabled,
            isTrendLineAlwaysEnabled = updateProperties.isTrendLineAlwaysEnabled
            trendLineColor = updateProperties.trendLineColor,
            trendLineOpacity = updateProperties.trendLineOpacity,
            trendLineWidth = updateProperties.trendLineWidth,
            trendLineStyle = updateProperties.trendLineStyle;

        $container.find('input[inf-ctrl="trendLineColorPicker"]').data('minicolors-initialized', false);
        $container.find('input[inf-ctrl="trendLineColorPicker"]').mainColorPanel('value', trendLineColor);

        $container.find('li[inf-ctrl="lineWidth"]').removeClass('active');
        $container.find('li[inf-ctrl="lineWidth"][inf-size="' + trendLineWidth + '"]').addClass('active');

        $container.find('li[inf-ctrl="lineStyle"]').removeClass('active');
        $container.find('li[inf-ctrl="lineStyle"][inf-style="' + trendLineStyle + '"]').addClass('active');

        
        $container.find('input[inf-ctrl="singleFillColorPicker"]').data('minicolors-initialized', false);
        $container.find('input[inf-ctrl="singleLineColorPicker"]').data('minicolors-initialized', false);
        $container.find('input[inf-ctrl="singleFontColorPicker"]').data('minicolors-initialized', false);

        $container.find('input[inf-ctrl="singleFillColorControl"]').prop('checked', !!isSingleColor);
        $container.find("button[inf-ctrl=singleApplyAll]").toggleClass('disabled', !isSingleColor).prop('disabled', !isSingleColor);

        $container.find('input[inf-ctrl="singleFillColorPicker"]').mainColorPanel('value', fillColor);
        $container.find('input[inf-ctrl="singleFillColorPicker"]').mainColorPanel('opacity', fillOpacity);
        $container.find('input[inf-ctrl="singleLineColorPicker"]').mainColorPanel('value', lineColor);
        $container.find('input[inf-ctrl="singleFontColorPicker"]').mainColorPanel('value', fontColor);

        var widthText = $($container.find('li[inf-ctrl="lineWidth"][inf-size="' + lineWidth + '"]')[0]).find('span').text();
        $container.find('span[inf-ctrl="singleSelectedLineWidth"]').text(widthText);
        $container.find('span[inf-ctrl="singleSelectedLineWidth"]').attr('inf-size', lineWidth);

        $container.find('input[inf-ctrl="modeToggle"]').prop('checked', isFibModeEnabled);
        $container.find('input[inf-ctrl="snapToHighLowToggle"]').prop('checked', isSnapTopHighLowEnabled);
        $container.find('input[inf-ctrl="showTrendLineAlways"]').prop('checked', isTrendLineAlwaysEnabled);
        $container.find('input[inf-ctrl="fibLevel"]').prop('checked', false);

        $container.find('span[inf-ctrl="singleSelectedFontSize"][inf-ctrl-val="P_all"]').text(fontSize);
        $container.find('span[inf-ctrl="singleSelectedFontSize"][inf-ctrl-val="P_all"]').attr('inf-size', fontSize);

        $.each(fibLevels, function (key, fibLevel) {
            $container.find('input[inf-ctrl="fibLevelFillColorPicker"][inf-ctrl-val="' + fibLevel.id + '"]').data('minicolors-initialized', false);
            $container.find('input[inf-ctrl="fibLevelLineColorPicker"][inf-ctrl-val="' + fibLevel.id + '"]').data('minicolors-initialized', false);
            $container.find('input[inf-ctrl="fibLevelFontColorPicker"][inf-ctrl-val="' + fibLevel.id + '"]').data('minicolors-initialized', false);

            $container.find('input[inf-ctrl="fibLevel"][data-value="' + fibLevel.id + '"]').prop('checked', fibLevel.enable);
            $container.find('input[inf-ctrl="fibLevelValue"][data-value="' + fibLevel.id + '"]').val(infChart.drawingUtils.common.formatValue((fibLevel.value/100), 3));

            $container.find('input[inf-ctrl="fibLevelFillColorPicker"][inf-ctrl-val="' + fibLevel.id + '"]').mainColorPanel('value', fibLevel.fillColor);
            $container.find('input[inf-ctrl="fibLevelFillColorPicker"][inf-ctrl-val="' + fibLevel.id + '"]').mainColorPanel('opacity', fibLevel.fillOpacity);
            $container.find('input[inf-ctrl="fibLevelLineColorPicker"][inf-ctrl-val="' + fibLevel.id + '"]').mainColorPanel('value', fibLevel.lineColor);
            $container.find('input[inf-ctrl="fibLevelFontColorPicker"][inf-ctrl-val="' + fibLevel.id + '"]').mainColorPanel('value', fibLevel.fontColor);

            var lineWeightText = $($container.find('li[inf-ctrl="lineWidth"][inf-size="' + fibLevel.lineWidth + '"]')[0]).find('span').text();
            $container.find('span[inf-ctrl="fibLevelSelectedLineWidth"][inf-ctrl-val="' + fibLevel.id + '"]').text(lineWeightText);
            $container.find('span[inf-ctrl="fibLevelSelectedLineWidth"][inf-ctrl-val="' + fibLevel.id + '"]').attr('inf-size', fibLevel.lineWidth);

            $container.find('span[inf-ctrl="fibLevelSelectedFontSize"][inf-ctrl-val="' + fibLevel.id + '"]').text(fibLevel.fontSize);
            $container.find('span[inf-ctrl="fibLevelSelectedFontSize"][inf-ctrl-val="' + fibLevel.id + '"]').attr('inf-size', fibLevel.fontSize);

            $container.find('button[inf-ctrl="fibLevelToggleFontWeight"][inf-ctrl-val="' + fibLevel.id + '"]').toggleClass("active", fibLevel.fontWeight === "bold").attr("inf-font-weight", fibLevel.fontWeight);
        });

        $.each(fibLevels, function (key, fibLevel) {
            $container.find('input[inf-ctrl="fibLevelFillColorPicker"][inf-ctrl-val="' + fibLevel.id + '"]').data('minicolors-initialized', true);
            $container.find('input[inf-ctrl="fibLevelLineColorPicker"][inf-ctrl-val="' + fibLevel.id + '"]').data('minicolors-initialized', true);
            $container.find('input[inf-ctrl="fibLevelFontColorPicker"][inf-ctrl-val="' + fibLevel.id + '"]').data('minicolors-initialized', true);
        });

        $container.find('input[inf-ctrl="singleFillColorPicker"]').data('minicolors-initialized', true);
        $container.find('input[inf-ctrl="singleLineColorPicker"]').data('minicolors-initialized', true);
        $container.find('input[inf-ctrl="singleFontColorPicker"]').data('minicolors-initialized', true);
        $container.find('input[inf-ctrl="trendLineColorPicker"]').data('minicolors-initialized', true);
    };

        /**
     * update fib settings panel elements with drowing properties
     * @param {object} $container - setting panel html object
     * @param {string} fillColor - hex fill color (single color)
     * @param {number} fillOpacity - fill opacity
     * @param {string} lineColor - hex line color (single color)
     * @param {number} lineWidth - line width
     * @param {boolean} isSingleColor - is single color enable - apply one color enable
     * @param {Array} fibLevels - fib levels
     */
    var _updateGenericFibSettings = function ($container, updateProperties) {
        var extentionFillColor = updateProperties.extentionFillColor,
            extentionFillOpacity = updateProperties.extentionFillOpacity,
            extentionLineColor = updateProperties.extentionLineColor,
            extentionLineWidth = updateProperties.extentionLineWidth,
            extentionFontSize = updateProperties.extentionFontSize,
            extentionFontColor = updateProperties.extentionFontColor,
            extentionFontWeight = updateProperties.extentionFontWeight,
            extentionLabelPosition = updateProperties.extentionLabelPosition,
            retrancementFillColor = updateProperties.retrancementFillColor,
            retrancementFillOpacity = updateProperties.retrancementFillOpacity,
            retrancementLineColor = updateProperties.retrancementLineColor,
            retrancementLineWidth = updateProperties.retrancementLineWidth,
            retrancementFontSize = updateProperties.retrancementFontSize,
            retrancementFontColor = updateProperties.retrancementFontColor,
            retrancementFontWeight = updateProperties.retrancementFontWeight,
            retracementLabelPosition = updateProperties.retracementLabelPosition,
            isSingleColorExtention = updateProperties.isSingleColorExtention,
            isSingleColorRetracement = updateProperties.isSingleColorRetracement,
            fibExtentionLevels = updateProperties.fibExtentionLevels,
            fibRetrancementLevels = updateProperties.fibRetrancementLevels,
            isFibModeEnabled = updateProperties.isFibModeEnabled,
            isSnapTopHighLowEnabled = updateProperties.isSnapTopHighLowEnabled,
            isTrendLineAlwaysEnabled = updateProperties.isTrendLineAlwaysEnabled,
            trendLineColor = updateProperties.trendLineColor,
            trendLineWidth = updateProperties.trendLineWidth,
            trendLineStyle = updateProperties.trendLineStyle;

        $container.find('input[inf-ctrl="trendLineColorPicker"]').data('minicolors-initialized', false);
        $container.find('input[inf-ctrl="trendLineColorPicker"]').mainColorPanel('value', trendLineColor);
        

        $container.find('li[inf-ctrl="lineWidth"]').removeClass('active');
        $container.find('li[inf-ctrl="lineWidth"][inf-size="' + trendLineWidth + '"]').addClass('active');


        $container.find('li[inf-ctrl="lineStyle"]').removeClass('active');
        $container.find('li[inf-ctrl="lineStyle"][inf-style="' + trendLineStyle + '"]').addClass('active');

        //fibExtention Levels
        $container.find('input[inf-ctrl="singleFillColorPicker"][sub-type="fibExtention"]').data('minicolors-initialized', false);
        $container.find('input[inf-ctrl="singleLineColorPicker"][sub-type="fibExtention"]').data('minicolors-initialized', false);
        $container.find('input[inf-ctrl="singleFontColorPicker"][sub-type="fibExtention"]').data('minicolors-initialized', false);

        $container.find('input[inf-ctrl="singleExtentionFillColorControl"]').prop('checked', !!isSingleColorExtention);
        $container.find('button[inf-ctrl=singleApplyAll][sub-type="fibExtention"]').toggleClass('disabled', !isSingleColorExtention).prop('disabled', !isSingleColorExtention);

        $container.find('input[inf-ctrl="singleFillColorPicker"][sub-type="fibExtention"]').mainColorPanel('value', extentionFillColor);
        $container.find('input[inf-ctrl="singleFillColorPicker"][sub-type="fibExtention"]').mainColorPanel('opacity', extentionFillOpacity);
        $container.find('input[inf-ctrl="singleLineColorPicker"][sub-type="fibExtention"]').mainColorPanel('value', extentionLineColor);
        $container.find('input[inf-ctrl="singleFontColorPicker"][sub-type="fibExtention"]').mainColorPanel('value', extentionFontColor);

        var widthText = $($container.find('li[inf-ctrl="lineWidth"][inf-size="' + extentionLineWidth + '"]')[0]).find('span').text();
        $container.find('span[inf-ctrl="singleSelectedLineWidth"][sub-type="fibExtention"]').text(widthText);
        $container.find('span[inf-ctrl="singleSelectedLineWidth"][sub-type="fibExtention"]').attr('inf-size', extentionLineWidth);

        $container.find('ul[inf-ctrl="fibExtentionAlign"]').find('li[inf-ctrl="alignStyle"]').removeClass('active');
        $container.find('ul[inf-ctrl="fibExtentionAlign"]').find('li[inf-ctrl="alignStyle"][inf-style="' + extentionLabelPosition + '"]').addClass('active');

        $container.find('input[inf-ctrl="snapToHighLowToggle"]').prop('checked', isSnapTopHighLowEnabled);
        $container.find('input[inf-ctrl="showTrendLineAlways"]').prop('checked', isTrendLineAlwaysEnabled);
        $container.find('input[inf-ctrl="fibLevel"][sub-type="fibExtention"]').prop('checked', false);

        $container.find('span[inf-ctrl="singleSelectedFontSize"][inf-ctrl-val="P_all"][sub-type="fibExtention"]').text(extentionFontSize);
        $container.find('span[inf-ctrl="singleSelectedFontSize"][inf-ctrl-val="P_all"][sub-type="fibExtention"]').attr('inf-size', extentionFontSize);

        $.each(fibExtentionLevels, function (key, fibLevel) {
            $container.find('input[inf-ctrl="fibLevelFillColorPicker"][inf-ctrl-val="' + fibLevel.id + '"][sub-type="fibExtention"]').data('minicolors-initialized', false);
            $container.find('input[inf-ctrl="fibLevelLineColorPicker"][inf-ctrl-val="' + fibLevel.id + '"][sub-type="fibExtention"]').data('minicolors-initialized', false);
            $container.find('input[inf-ctrl="fibLevelFontColorPicker"][inf-ctrl-val="' + fibLevel.id + '"][sub-type="fibExtention"]').data('minicolors-initialized', false);

            $container.find('input[inf-ctrl="fibLevel"][data-value="' + fibLevel.id + '"][sub-type="fibExtention"]').prop('checked', fibLevel.enable);
            $container.find('input[inf-ctrl="fibLevelValue"][sub-type="fibExtention"][data-value="' + fibLevel.id + '"]').val(infChart.drawingUtils.common.formatValue((fibLevel.value/100), 3));

            $container.find('input[inf-ctrl="fibLevelFillColorPicker"][inf-ctrl-val="' + fibLevel.id + '"][sub-type="fibExtention"]').mainColorPanel('value', fibLevel.fillColor);
            $container.find('input[inf-ctrl="fibLevelFillColorPicker"][inf-ctrl-val="' + fibLevel.id + '"][sub-type="fibExtention"]').mainColorPanel('opacity', fibLevel.fillOpacity);
            $container.find('input[inf-ctrl="fibLevelLineColorPicker"][inf-ctrl-val="' + fibLevel.id + '"][sub-type="fibExtention"]').mainColorPanel('value', fibLevel.lineColor);
            $container.find('input[inf-ctrl="fibLevelFontColorPicker"][inf-ctrl-val="' + fibLevel.id + '"][sub-type="fibExtention"]').mainColorPanel('value', fibLevel.fontColor);

            var lineWeightText = $($container.find('li[inf-ctrl="lineWidth"][inf-size="' + fibLevel.lineWidth + '"]')[0]).find('span').text();
            $container.find('span[inf-ctrl="fibLevelSelectedLineWidth"][inf-ctrl-val="' + fibLevel.id + '"][sub-type="fibExtention"]').text(lineWeightText);
            $container.find('span[inf-ctrl="fibLevelSelectedLineWidth"][inf-ctrl-val="' + fibLevel.id + '"][sub-type="fibExtention"]').attr('inf-size', fibLevel.lineWidth);

            $container.find('span[inf-ctrl="fibLevelSelectedFontSize"][inf-ctrl-val="' + fibLevel.id + '"][sub-type="fibExtention"]').text(fibLevel.fontSize);
            $container.find('span[inf-ctrl="fibLevelSelectedFontSize"][inf-ctrl-val="' + fibLevel.id + '"][sub-type="fibExtention"]').attr('inf-size', fibLevel.fontSize);

            $container.find('button[inf-ctrl="fibLevelToggleFontWeight"][inf-ctrl-val="' + fibLevel.id + '"][sub-type="fibExtention"]').toggleClass("active", fibLevel.fontWeight === "bold").attr("inf-font-weight", fibLevel.fontWeight);
        });

        $.each(fibExtentionLevels, function (key, fibLevel) {
            $container.find('input[inf-ctrl="fibLevelFillColorPicker"][inf-ctrl-val="' + fibLevel.id + '"][sub-type="fibExtention"]').data('minicolors-initialized', true);
            $container.find('input[inf-ctrl="fibLevelLineColorPicker"][inf-ctrl-val="' + fibLevel.id + '"][sub-type="fibExtention"]').data('minicolors-initialized', true);
            $container.find('input[inf-ctrl="fibLevelFontColorPicker"][inf-ctrl-val="' + fibLevel.id + '"][sub-type="fibExtention"]').data('minicolors-initialized', true);
        });

        $container.find('input[inf-ctrl="singleFillColorPicker"][sub-type="fibExtention"]').data('minicolors-initialized', true);
        $container.find('input[inf-ctrl="singleLineColorPicker"][sub-type="fibExtention"]').data('minicolors-initialized', true);
        $container.find('input[inf-ctrl="singleFontColorPicker"][sub-type="fibExtention"]').data('minicolors-initialized', true);

        //fibRetrancement Levels
        $container.find('input[inf-ctrl="singleFillColorPicker"][sub-type="fibRetracement"]').data('minicolors-initialized', false);
        $container.find('input[inf-ctrl="singleLineColorPicker"][sub-type="fibRetracement"]').data('minicolors-initialized', false);
        $container.find('input[inf-ctrl="singleFontColorPicker"][sub-type="fibRetracement"]').data('minicolors-initialized', false);

        $container.find('input[inf-ctrl="singleRetrancementFillColorControl"]').prop('checked', !!isSingleColorRetracement);
        $container.find('button[inf-ctrl=singleApplyAll][sub-type="fibRetracement"]').toggleClass('disabled', !isSingleColorRetracement).prop('disabled', !isSingleColorRetracement);

        $container.find('input[inf-ctrl="singleFillColorPicker"][sub-type="fibRetracement"]').mainColorPanel('value', retrancementFillColor);
        $container.find('input[inf-ctrl="singleFillColorPicker"][sub-type="fibRetracement"]').mainColorPanel('opacity', retrancementFillOpacity);
        $container.find('input[inf-ctrl="singleLineColorPicker"][sub-type="fibRetracement"]').mainColorPanel('value', retrancementLineColor);
        $container.find('input[inf-ctrl="singleFontColorPicker"][sub-type="fibRetracement"]').mainColorPanel('value', retrancementFontColor);

        var widthText = $($container.find('li[inf-ctrl="lineWidth"][inf-size="' + retrancementLineWidth + '"]')[0]).find('span').text();
        $container.find('span[inf-ctrl="singleSelectedLineWidth"][sub-type="fibRetracement"]').text(widthText);
        $container.find('span[inf-ctrl="singleSelectedLineWidth"][sub-type="fibRetracement"]').attr('inf-size', retrancementLineWidth);

        $container.find('ul[inf-ctrl="fibRetracementAlign"]').find('li[inf-ctrl="alignStyle"]').removeClass('active');
        $container.find('ul[inf-ctrl="fibRetracementAlign"]').find('li[inf-ctrl="alignStyle"][inf-style="' + retracementLabelPosition + '"]').addClass('active');

        $container.find('input[inf-ctrl="fibLevel"][sub-type="fibRetracement"]').prop('checked', false);

        $container.find('span[inf-ctrl="singleSelectedFontSize"][inf-ctrl-val="P_all"][sub-type="fibRetracement"]').text(retrancementFontSize);
        $container.find('span[inf-ctrl="singleSelectedFontSize"][inf-ctrl-val="P_all"][sub-type="fibRetracement"]').attr('inf-size', retrancementFontSize);

        $.each(fibRetrancementLevels, function (key, fibLevel) {
            $container.find('input[inf-ctrl="fibLevelFillColorPicker"][inf-ctrl-val="' + fibLevel.id + '"][sub-type="fibRetracement"]').data('minicolors-initialized', false);
            $container.find('input[inf-ctrl="fibLevelLineColorPicker"][inf-ctrl-val="' + fibLevel.id + '"][sub-type="fibRetracement"]').data('minicolors-initialized', false);
            $container.find('input[inf-ctrl="fibLevelFontColorPicker"][inf-ctrl-val="' + fibLevel.id + '"][sub-type="fibRetracement"]').data('minicolors-initialized', false);

            $container.find('input[inf-ctrl="fibLevel"][data-value="' + fibLevel.id + '"][sub-type="fibRetracement"]').prop('checked', fibLevel.enable);
            $container.find('input[inf-ctrl="fibLevelValue"][sub-type="fibRetracement"][data-value="' + fibLevel.id + '"]').val(infChart.drawingUtils.common.formatValue((fibLevel.value/100), 3));

            $container.find('input[inf-ctrl="fibLevelFillColorPicker"][inf-ctrl-val="' + fibLevel.id + '"][sub-type="fibRetracement"]').mainColorPanel('value', fibLevel.fillColor);
            $container.find('input[inf-ctrl="fibLevelFillColorPicker"][inf-ctrl-val="' + fibLevel.id + '"][sub-type="fibRetracement"]').mainColorPanel('opacity', fibLevel.fillOpacity);
            $container.find('input[inf-ctrl="fibLevelLineColorPicker"][inf-ctrl-val="' + fibLevel.id + '"][sub-type="fibRetracement"]').mainColorPanel('value', fibLevel.lineColor);
            $container.find('input[inf-ctrl="fibLevelFontColorPicker"][inf-ctrl-val="' + fibLevel.id + '"][sub-type="fibRetracement"]').mainColorPanel('value', fibLevel.fontColor);

            var lineWeightText = $($container.find('li[inf-ctrl="lineWidth"][inf-size="' + fibLevel.lineWidth + '"]')[0]).find('span').text();
            $container.find('span[inf-ctrl="fibLevelSelectedLineWidth"][inf-ctrl-val="' + fibLevel.id + '"][sub-type="fibRetracement"]').text(lineWeightText);
            $container.find('span[inf-ctrl="fibLevelSelectedLineWidth"][inf-ctrl-val="' + fibLevel.id + '"][sub-type="fibRetracement"]').attr('inf-size', fibLevel.lineWidth);

            $container.find('span[inf-ctrl="fibLevelSelectedFontSize"][inf-ctrl-val="' + fibLevel.id + '"][sub-type="fibRetracement"]').text(fibLevel.fontSize);
            $container.find('span[inf-ctrl="fibLevelSelectedFontSize"][inf-ctrl-val="' + fibLevel.id + '"][sub-type="fibRetracement"]').attr('inf-size', fibLevel.fontSize);

            $container.find('button[inf-ctrl="fibLevelToggleFontWeight"][inf-ctrl-val="' + fibLevel.id + '"][sub-type="fibRetracement"]').toggleClass("active", fibLevel.fontWeight === "bold").attr("inf-font-weight", fibLevel.fontWeight);
        });

        $.each(fibRetrancementLevels, function (key, fibLevel) {
            $container.find('input[inf-ctrl="fibLevelFillColorPicker"][inf-ctrl-val="' + fibLevel.id + '"][sub-type="fibRetracement"]').data('minicolors-initialized', true);
            $container.find('input[inf-ctrl="fibLevelLineColorPicker"][inf-ctrl-val="' + fibLevel.id + '"][sub-type="fibRetracement"]').data('minicolors-initialized', true);
            $container.find('input[inf-ctrl="fibLevelFontColorPicker"][inf-ctrl-val="' + fibLevel.id + '"][sub-type="fibRetracement"]').data('minicolors-initialized', true);
        });

        $container.find('input[inf-ctrl="singleFillColorPicker"][sub-type="fibRetracement"]').data('minicolors-initialized', true);
        $container.find('input[inf-ctrl="singleLineColorPicker"][sub-type="fibRetracement"]').data('minicolors-initialized', true);
        $container.find('input[inf-ctrl="singleFontColorPicker"][sub-type="fibRetracement"]').data('minicolors-initialized', true);
        $container.find('input[inf-ctrl="trendLineColorPicker"]').data('minicolors-initialized', true);
    };

    var _updateLabelSettings = function ($container, color, text, backgroundColor, stroke, isBorderEnabled, isBackgroundEnabled, selectedFontStyles, textOnly) {
        $container.find("textarea[inf-ctrl=text]").val(text);
        if (!textOnly) {
            $container.find('li[inf-ctrl=fontStyle]').removeClass('active');
            infChart.util.forEach(selectedFontStyles, function (i, style) {
                $container.find('li[inf-ctrl=fontStyle][inf-style="' + style + '"]').addClass('active');
            });
            $container.find('input[inf-ctrl="colorPicker"]').mainColorPanel('value', color);
            $container.find('input[inf-ctrl="backgroundColorPicker"]').mainColorPanel('value', backgroundColor);
            $container.find('input[inf-ctrl="borderColorPicker"]').mainColorPanel('value', stroke);
            $container.find('input[inf-ctrl="borderColorEnabled"]').prop('checked',isBorderEnabled);
            $container.find('input[inf-ctrl="backgroundColorEnabled"]').prop('checked',isBackgroundEnabled);
            $container.find("input[inf-ctrl=text]").focus();
        }
    };

    var _updateHighLowLabelsSettings = function ($container, color, labelDataItems) {
        $container.find('input[inf-ctrl="colorPicker"]').mainColorPanel('value', color);

        $.each(labelDataItems, function (key, labelDataItem) {
            $container.find('input[inf-ctrl="labelDataItem"][data-value="' + labelDataItem.id + '"]').prop('checked', labelDataItem.enabled);
        });
    };

    var _updateRegressionChannelSettings = function ($container, color, lineWidth, levels) {
        $container.find('li[inf-ctrl="lineWidth"]').removeClass('active');
        $container.find('li[inf-ctrl="lineWidth"][inf-size="' + lineWidth + '"]').addClass('active');
        $container.find('input[inf-ctrl="lineColorPicker"]').mainColorPanel('value', color);

        for (var id in levels) {
            if (levels.hasOwnProperty(id)) {
                $container.find('input[inf-ctrl="fillColorPicker"][inf-ctrl-val="' + id + '"]').mainColorPanel('value', levels[id].fillColor);
                $container.find('input[inf-ctrl="fillColorPicker"][inf-ctrl-val="' + id + '"]').mainColorPanel('opacity', levels[id].fillOpacity);
            }
        }
    };

    /**
     * brush settings
     * @param color
     * @returns {string}
     * @private
     */
    var _getBrushSettings = function (color, opacity) {
        var sectionRows = [];
        sectionRows.push(infChart.structureManager.settings.getSectionRow([
            infChart.structureManager.settings.getLineWeightRowItem()
        ]));

        sectionRows.push(infChart.structureManager.settings.getSectionRow([
            infChart.structureManager.settings.getColorPickerRowItem('lineColorPicker', color, opacity, 'color', 'top left', 'label.lineColor')
        ], 'two-col-row'));

        return infChart.structureManager.settings.getPanelBodyHTML([infChart.structureManager.settings.getSection(sectionRows)]) +
               _getResetToDefaultHTML();
    };

    var _getBrushQuickSettings = function (color, opacity) {
        var html = "";
        html += infChart.structureManager.settings.getQuicksettingListItemHTML(
            infChart.structureManager.settings.getColorPaletteHTML('lineColorPicker', 'color', color, opacity, 'top left'), "has-color-picker line-color", infChart.manager.getLabel("label.lineColor"), "right");
        return html;
    };

    /**
     * Update brush settings
     * @param $container
     * @param color
     * @param lineWidth
     * @param lineStyle
     * @private
     */
    var _updateBrushSettings = function ($container, settings) {
        $container.find('li[inf-ctrl="lineWidth"]').removeClass('active');
        $container.find('li[inf-ctrl="lineWidth"][inf-size="' + settings.lineWidth + '"]').addClass('active');
        $container.find('input[inf-ctrl="lineColorPicker"]').mainColorPanel('value', settings.lineColor);
        $container.find('input[inf-ctrl="lineColorPicker"]').mainColorPanel('opacity', settings.lineOpacity);
    };

    /**
     * XABCD settings
     * @param color
     * @returns {string}
     * @private
     */
     var _getXabcdSettings = function (lineColor, fillColor, fillOpacity, fontColor, fontSize) {
        var rowItems = [], sectionRows = [];
        sectionRows.push(infChart.structureManager.settings.getSectionRow([infChart.structureManager.settings.getLineWeightRowItem()]));

        rowItems.push(infChart.structureManager.settings.getColorPickerRowItem('lineColorPicker', lineColor, false, 'lineColor', 'top left', 'label.lineColor'));
        if (fillColor) {
            rowItems.push(infChart.structureManager.settings.getColorPickerRowItem('fillColorPicker', fillColor, fillOpacity, 'fillColor', 'top right', 'label.fillColor'));
        }
        sectionRows.push(infChart.structureManager.settings.getSectionRow(rowItems, 'two-col-row'));

        rowItems.push(infChart.structureManager.settings.getColorPickerRowItem('textColorPicker', fontColor, false, 'textColor', 'top left', 'label.labelColor'));

        sectionRows.push(infChart.structureManager.settings.getSectionRow([
            infChart.structureManager.settings.getFontSizeRowItem(fontSize, 'dropup', 8, 24, 'label.labelSize'),
        ]));

        return  infChart.structureManager.settings.getPanelBodyHTML([infChart.structureManager.settings.getSection(sectionRows)]) +
                _getResetToDefaultHTML();
    };

    var _getXabcdQuickSettings = function (lineColor, fillColor, fillOpacity) {
        var html = "";
        html += infChart.structureManager.settings.getQuicksettingListItemHTML(
            infChart.structureManager.settings.getColorPaletteHTML('lineColorPicker', 'lineColor', lineColor, false, 'bottom left'), "has-color-picker line-color", infChart.manager.getLabel("label.lineColor"), "right");
        html += infChart.structureManager.settings.getQuicksettingListItemHTML(
            infChart.structureManager.settings.getColorPaletteHTML('fillColorPicker', 'fillColor', fillColor, fillOpacity, 'top left'), "has-color-picker fill-color", infChart.manager.getLabel("label.fillColor"), "right");
        return html;
    };

    /**
     * Update XABCD settings
     * @param $container
     * @param color
     * @param lineWidth
     * @param lineStyle
     * @private
     */
    var _updateXabcdSettings = function ($container, color, lineWidth, fillColor, fillOpacity, fontColor, fontSize) {

            $container.find('input[inf-ctrl="lineColorPicker"]').data('minicolors-initialized', false);

            $container.find('li[inf-ctrl="lineWidth"]').removeClass('active');
            $container.find('li[inf-ctrl="lineWidth"][inf-size="' + lineWidth + '"]').addClass('active');
            $container.find('input[inf-ctrl="lineColorPicker"]').mainColorPanel('value', color);
            if (fillColor) {
                $container.find('input[inf-ctrl="fillColorPicker"]').mainColorPanel('value', fillColor);
                $container.find('input[inf-ctrl="fillColorPicker"]').mainColorPanel('opacity', fillOpacity);
            }
            $container.find('input[inf-ctrl="textColorPicker"]').mainColorPanel('value', fontColor);

            $container.find('span[inf-ctrl="singleSelectedFontSize"][inf-ctrl-val="P_all"]').text(fontSize).attr('inf-size', fontSize);

            $container.find('input[inf-ctrl="lineColorPicker"]').data('minicolors-initialized', true)
    };


    var _bindXabcdSettings = function ($container, callBackFnXabcdSettings) {
        infChart.util.bindColorPicker($container.find("input[inf-ctrl=lineColorPicker]"), undefined, callBackFnXabcdSettings.onColorChange);

        infChart.util.bindColorPicker($container.find("input[inf-ctrl=fillColorPicker]"), undefined, callBackFnXabcdSettings.onFillColorChange);

        _bindSeriesLineWidthEvents($container, callBackFnXabcdSettings.onLineWidthChange);

        infChart.structureManager.settings.bindPanel($container, callBackFnXabcdSettings.onClose);

        _bindResetToDefaultEvent($container , callBackFnXabcdSettings.onResetToDefault);

        infChart.util.bindColorPicker($container.find("input[inf-ctrl=textColorPicker]"), undefined, callBackFnXabcdSettings.onLabelTextColorChange);

        $container.find("li[inf-ctrl=fontSize]").on('click', function (e) {
            var fontSize = $(this).attr('inf-size');
            callBackFnXabcdSettings.onLabelTextSizeChange(fontSize);
            var ctrlType = $(this).parent().attr('inf-ctrl');
            $(this).parent().parent().find("span[inf-ctrl="+ ctrlType +"SelectedFontSize]").text($(this).text()).attr('inf-size', fontSize);
        });

    };

    /**
     * ABCD settings
     * @param color
     * @returns {string}
     * @private
     */
    var _getAbcdSettings = function (lineColor, fontColor, fontSize) {
        var rowItems = [], sectionRows = [];
        sectionRows.push(infChart.structureManager.settings.getSectionRow([infChart.structureManager.settings.getLineWeightRowItem()]));
        rowItems.push(infChart.structureManager.settings.getColorPickerRowItem('lineColorPicker', lineColor, false, 'lineColor', 'top left', 'label.lineColor'));
        sectionRows.push(infChart.structureManager.settings.getSectionRow(rowItems, 'two-col-row'));
        rowItems.push(infChart.structureManager.settings.getColorPickerRowItem('textColorPicker', fontColor, false, 'textColor', 'top right', 'label.labelColor'));

        sectionRows.push(infChart.structureManager.settings.getSectionRow([
            infChart.structureManager.settings.getFontSizeRowItem(fontSize, 'dropup', 8, 24, 'label.labelSize'),
        ]));

        return infChart.structureManager.settings.getPanelBodyHTML([infChart.structureManager.settings.getSection(sectionRows)]) +
            _getResetToDefaultHTML();
    };

    var _getAbcdQuickSettings = function (lineColor) {
        var html = "";
        html += infChart.structureManager.settings.getQuicksettingListItemHTML(
            infChart.structureManager.settings.getColorPaletteHTML('lineColorPicker', 'lineColor', lineColor, false, 'top left'), "has-color-picker line-color", infChart.manager.getLabel("label.lineColor"), "right");
        return html;
    };

    /**
     * Update ABCD settings
     * @param $container
     * @param color
     * @param lineWidth
     * @param lineStyle
     * @private
     */
    var _updateAbcdSettings = function ($container, color, lineWidth, fontColor, fontSize) {

        $container.find('input[inf-ctrl="lineColorPicker"]').data('minicolors-initialized', false);

        $container.find('li[inf-ctrl="lineWidth"]').removeClass('active');
        $container.find('li[inf-ctrl="lineWidth"][inf-size="' + lineWidth + '"]').addClass('active');
        $container.find('input[inf-ctrl="lineColorPicker"]').mainColorPanel('value', color);
        $container.find('input[inf-ctrl="textColorPicker"]').mainColorPanel('value', fontColor);

        $container.find('span[inf-ctrl="singleSelectedFontSize"][inf-ctrl-val="P_all"]').text(fontSize).attr('inf-size', fontSize);

        $container.find('input[inf-ctrl="lineColorPicker"]').data('minicolors-initialized', true)
    };

    /**
     * Polyline settings
     * @param color
     * @returns {string}
     * @private
     */
    var _getPolylineSettings = function (lineColor, fillColor, fillOpacity) {
        var rowItems = [], sectionRows = [];
        sectionRows.push(infChart.structureManager.settings.getSectionRow([infChart.structureManager.settings.getLineWeightRowItem()]));
        sectionRows.push(infChart.structureManager.settings.getSectionRow([infChart.structureManager.settings.getLineStyleRowItem()]));
        rowItems.push(infChart.structureManager.settings.getColorPickerRowItem('lineColorPicker', lineColor, false, 'lineColor', 'top left', 'label.lineColor'));
        rowItems.push(infChart.structureManager.settings.getColorPickerRowItem('fillColorPicker', fillColor, fillOpacity, 'fillColor', 'top right', 'label.fillColor'));
        sectionRows.push(infChart.structureManager.settings.getSectionRow(rowItems, 'two-col-row'));
        return infChart.structureManager.settings.getPanelBodyHTML([infChart.structureManager.settings.getSection(sectionRows)]) +
            _getResetToDefaultHTML();
    };

    var _getPolylineQuickSettings = function (lineColor, fillColor, fillOpacity) {
        var html = "";
        html += infChart.structureManager.settings.getQuicksettingListItemHTML(
            infChart.structureManager.settings.getColorPaletteHTML('lineColorPicker', 'lineColor', lineColor, false, 'top left'), "has-color-picker line-color", infChart.manager.getLabel("label.lineColor"), "right");
        if (fillColor) {
            html += infChart.structureManager.settings.getQuicksettingListItemHTML(
                infChart.structureManager.settings.getColorPaletteHTML('fillColorPicker', 'fillColor', fillColor, fillOpacity, 'top left'), "has-color-picker", infChart.manager.getLabel("label.fillColor"), "right");
        }
        return html;
    };

    /**
     * Update Polyline settings
     * @param $container
     * @param color
     * @param lineWidth
     * @private
     */
    var _updatePolylineSettings = function ($container, color, lineWidth, fillColor, fillOpacity, lineStyle) {
        $container.find('li[inf-ctrl="lineWidth"]').removeClass('active');
        $container.find('li[inf-ctrl="lineWidth"][inf-size="' + lineWidth + '"]').addClass('active');
        $container.find('input[inf-ctrl="lineColorPicker"]').mainColorPanel('value', color);
        $container.find('input[inf-ctrl="fillColorPicker"]').mainColorPanel('value', fillColor);
        $container.find('input[inf-ctrl="fillColorPicker"]').mainColorPanel('opacity', fillOpacity);
        $container.find('li[inf-ctrl="lineStyle"][inf-style="' + lineStyle + '"]').addClass('active');
    };

    /**
     * Elliot Wave settings
     * @param color
     * @returns {string}
     * @private
     */
    var _getElliotWaveSettings = function (lineColor, baseBorderColor, waveDegree, waveDegreesList, fontSize) {
        var rowItems = [], sectionRows = [];
        sectionRows.push(infChart.structureManager.settings.getSectionRow([infChart.structureManager.settings.getRowItem('<p class="item-label">' + _getSnapToHighLowToggleHTML() + '</p>', '')]));
        sectionRows.push(infChart.structureManager.settings.getSectionRow([infChart.structureManager.settings.getLineWeightRowItem()]));

        sectionRows.push(infChart.structureManager.settings.getSectionRow([
            infChart.structureManager.settings.getFontSizeRowItem(fontSize, 'dropdown', 8, 24),
        ]));

        rowItems.push(infChart.structureManager.settings.getColorPickerRowItem('lineColorPicker', lineColor, false, 'lineColor', 'top left', 'label.lineColor'));
        sectionRows.push(infChart.structureManager.settings.getSectionRow(rowItems, 'two-col-row'));
        sectionRows.push(infChart.structureManager.settings.getSectionRow([
            infChart.structureManager.settings.getWaveDegreeRowItem(waveDegree, waveDegreesList),
        ]));
        return infChart.structureManager.settings.getPanelBodyHTML([infChart.structureManager.settings.getSection(sectionRows)]) +
            _getResetToDefaultHTML();
    };
    
    var _getElliotWaveQuickSettings = function (lineColor) {
        var html = "";
        html += infChart.structureManager.settings.getQuicksettingListItemHTML(
            infChart.structureManager.settings.getColorPaletteHTML('lineColorPicker', 'lineColor', lineColor, false, 'top left'), "has-color-picker line-color", infChart.manager.getLabel("label.lineColor"), "right");
        return html;
    };
    
    /**
     * Update Elliot Wave settings
     * @param $container
     * @param color
     * @param lineWidth
     * @param lineStyle
     * @private
     */
    var _updateElliotWaveSettings = function ($container, color, lineWidth,currentWaveDegree, isSnapTopHighLowEnabled, fontSize) {
        $container.find('li[inf-ctrl="lineWidth"]').removeClass('active');
        $container.find('li[inf-ctrl="lineWidth"][inf-size="' + lineWidth + '"]').addClass('active');
        $container.find('input[inf-ctrl="lineColorPicker"]').mainColorPanel('value', color);
        $container.find('input[inf-ctrl="snapToHighLowToggle"]').prop('checked', isSnapTopHighLowEnabled);
        $container.find('span[inf-ctrl="singleSelectedFontSize"][inf-ctrl-val="P_all"]').text(fontSize).attr('inf-size', fontSize);
    };

    var _bindElliotWaveSettings = function ($container, callBackFnElliotWaveSettingsEvents) {
        infChart.util.bindColorPicker($container.find("input[inf-ctrl=lineColorPicker]"), undefined, callBackFnElliotWaveSettingsEvents.onColorChange);
        _bindSeriesLineWidthEvents($container, callBackFnElliotWaveSettingsEvents.onLineWidthChange);
        $container.find("li[inf-ctrl=waveDegree]").on('click', function (e) {
            $(this).addClass("active");
            var waveDegree = $(this).attr('inf-type');
            callBackFnElliotWaveSettingsEvents.onWaveDegreeChange(waveDegree, $(this).parent());
            var ctrlType = $(this).parent().attr('inf-ctrl');
            $(this).parent().parent().find("span[inf-ctrl="+ ctrlType +"SelectedWaveDegree]").text($(this).text()).attr('inf-type', waveDegree);
        });
        infChart.structureManager.settings.bindPanel($container, callBackFnElliotWaveSettingsEvents.onClose);
        _bindResetToDefaultEvent($container , callBackFnElliotWaveSettingsEvents.onResetToDefault);

        $container.find("input[inf-ctrl=snapToHighLowToggle]").on('click', function (e) {
            callBackFnElliotWaveSettingsEvents.onToggleSnapToHighLow($(this).is(":checked"));
            e.stopPropagation();
        });

        $container.find("li[inf-ctrl=fontSize]").on('click', function (e) {
            var fontSize = $(this).attr('inf-size');
            callBackFnElliotWaveSettingsEvents.onLabelTextSizeChange(fontSize);
            var ctrlType = $(this).parent().attr('inf-ctrl');
            $(this).parent().parent().find("span[inf-ctrl="+ ctrlType +"SelectedFontSize]").text($(this).text()).attr('inf-size', fontSize);
        });
    };

    var _bindAbcdSettings = function ($container, callBackFnAbcdSettings) {
        infChart.util.bindColorPicker($container.find("input[inf-ctrl=lineColorPicker]"), undefined, callBackFnAbcdSettings.onColorChange);
        _bindSeriesLineWidthEvents($container, callBackFnAbcdSettings.onLineWidthChange);
        infChart.structureManager.settings.bindPanel($container, callBackFnAbcdSettings.onClose);
        _bindResetToDefaultEvent($container , callBackFnAbcdSettings.onResetToDefault);
        infChart.util.bindColorPicker($container.find("input[inf-ctrl=textColorPicker]"), undefined, callBackFnAbcdSettings.onLabelTextColorChange);

        $container.find("li[inf-ctrl=fontSize]").on('click', function (e) {
            var fontSize = $(this).attr('inf-size');
            callBackFnAbcdSettings.onLabelTextSizeChange(fontSize);
            var ctrlType = $(this).parent().attr('inf-ctrl');
            $(this).parent().parent().find("span[inf-ctrl="+ ctrlType +"SelectedFontSize]").text($(this).text()).attr('inf-size', fontSize);
        });

    };

    var _bindPolylineSettings = function ($container, onClose, onPolylineColorChange, onPolylineWidthChange, onPolylineFillColorChange, onPolyLineStyleChange, onResetToDefault) {
        infChart.util.bindColorPicker($container.find("input[inf-ctrl=lineColorPicker]"), undefined, onPolylineColorChange);
        infChart.util.bindColorPicker($container.find("input[inf-ctrl=fillColorPicker]"), undefined, onPolylineFillColorChange);
        _bindSeriesLineWidthEvents($container, onPolylineWidthChange);
        $container.find("li[inf-ctrl=lineStyle]").on('click', function (e) {
            var dashStyle = $(this).attr("inf-style");
            $container.find("li[inf-ctrl=lineStyle]").removeClass('active');
            $(this).addClass('active');
            onPolyLineStyleChange(dashStyle);
            e.stopPropagation();
        });
        infChart.structureManager.settings.bindPanel($container, onClose);
        _bindResetToDefaultEvent($container , onResetToDefault);
    };

    var _getFibFontSizeHTML = function (typeClass, ctrlType) {
        return '<ul class="' + (typeClass ? typeClass : 'selection-types') + '"' + (ctrlType ? 'inf-ctrl="' + ctrlType + '"' : '') + '>' +
            '<li inf-ctrl="fontSize" inf-size="8"><a><span class="line-weight-space">8</span></a></li>' +
            '<li inf-ctrl="fontSize" inf-size="9"><a><span class="line-weight-space">9</span></a></li>' +
            '<li inf-ctrl="fontSize" inf-size="10"><a><span class="line-weight-space">10</span></a></li>' +
            '<li inf-ctrl="fontSize" inf-size="11"><a><span class="line-weight-space">11</span></a></li>' +
            '<li inf-ctrl="fontSize" inf-size="12"><a><span class="line-weight-space">12</span></a></li>' +
            '</ul>';
    };

    /**
       * get fib level rettinf row HTML
       * @param {stirng} ctrlType - tag used to identify the control
       * @param {string} fillColor - fill color hex
       * @param {number} opacity - opacity 0-1
       * @param {string} lineColor - line color hex
       * @param {number} lineWidth - line width 1,2,3
       * @param {string} ctrlValue - fib level id - P_all for all control
       * @param {string} position - used to show the minicolor palette
       * @returns
       */
    var _getFibLevelSettingRowHTML = function (ctrlType, fillColor, opacity, lineColor, lineWidth, fontColor, fontSize, fontWeight, ctrlValue, position, isApplyAllButton, subType, applyToAllClass) {
        let settingHTML = '<div class="fib-options-wrapper">';
        settingHTML += infChart.structureManager.settings.getMiniColorPaletteHTML(ctrlType + 'FillColorPicker', ctrlValue, fillColor, position, opacity, 'fa fa-tint', undefined, subType);
        if (lineColor) {
            settingHTML += infChart.structureManager.settings.getMiniColorPaletteHTML(ctrlType + 'LineColorPicker', ctrlValue, lineColor, position, undefined, 'icon ico-ang-dash', 'line-color', subType);
        }
        if (lineWidth) {
            let lineWidthHTML = '<div class="dropdown line-weights">' +
                    '<button class="dropdown-toggle" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">' +
                        '<span inf-ctrl="' + ctrlType + 'SelectedLineWidth" sub-type="' + (subType ? subType : '') + '"  class="weight-line" inf-ctrl-val="' + ctrlValue + '" inf-size="' + lineWidth + '">&#x2F;</span>' +
                        '<span class="caret"></span>' +
                    '</button>' +
                    infChart.structureManager.settings.getLineWeightHTML('dropdown-menu', ctrlType) +
                '</div>';
            settingHTML += lineWidthHTML;
        }
        if (fontSize) {
            let fontSizeHTML = '<div class="dropdown font-size">' +
                    '<button class="dropdown-toggle" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">' +
                        '<span inf-ctrl="' + ctrlType + 'SelectedFontSize" sub-type="' + (subType ? subType : '') + '" inf-ctrl-val="' + ctrlValue + '" inf-size="' + fontSize + '">' + fontSize + '</span>' +
                        '<span class="caret"></span>' +
                    '</button>' +
                    _getFibFontSizeHTML('dropdown-menu', ctrlType) +
                '</div>';
            settingHTML += fontSizeHTML;
        }
        if (fontColor) {
            settingHTML += infChart.structureManager.settings.getMiniColorPaletteHTML(ctrlType + 'FontColorPicker', ctrlValue, fontColor, position, undefined, 'fa fa-tint', 'font-color', subType);
        }
        if (fontWeight) {
            let fontWeightHTML = '<div  class="has-btn">' +
                        '<button inf-ctrl-val="' + ctrlValue + '" inf-ctrl="' + ctrlType + 'ToggleFontWeight" sub-type="' + (subType ? subType : '') + '" inf-font-weight="' + fontWeight + '" class="btn btn-default '+ (fontWeight === 'bold' ? 'active' : '' ) + '">' +
                            '<i class="icon ico-bold-2"></i>' +
                        '</button>' +
                '</div>';
            settingHTML += fontWeightHTML;
        }
        settingHTML += (isApplyAllButton ? '<div class="has-btn ' + (applyToAllClass ? applyToAllClass : '') + '"><button class="btn btn-default disabled" disabled="true" type="button" sub-type="' + (subType ? subType : '') + '" inf-ctrl="' + ctrlType + 'ApplyAll" >Apply now to all Levels</button></div>' : '');
        settingHTML += '</div>';
        return settingHTML;
    };

    var _getPriceLevelSettingRowHTML = function (ctrlType, lineWidth, lineStyle, ctrlValue, yValue, lineColor, position) {
        return '<div class="fib-options-wrapper">' +
            '<input inf-ctrl="priceLevelValue" inf-value="' + ctrlValue + '"  class="fib-levels-input c-form-control text--right" maxlength="20" type="text" data-value="' + ctrlValue + '" value="' + (parseFloat(yValue)).toFixed(3) + '" >' +
            '<div class="c-dropdown dropdown line-weights">' +
                '<button class="c-dropdown__toggle c-btn c-btn--default dropdown-toggle h--100" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">' +
                    '<span inf-ctrl="' + ctrlType + 'SelectedLineWidth" class="weight-line" inf-ctrl-val="' + ctrlValue + '" inf-size="' + lineWidth + '">&#x2F;</span>' +
                    '<span class="caret"></span>' +
                '</button>' +
                infChart.structureManager.settings.getLineWeightHTML('dropdown-menu c-dropdown__menu', ctrlType) +
            '</div>' +
            '<div class="c-dropdown dropdown line-styles">' +
                '<button class="c-dropdown__toggle c-btn c-btn--default dropdown-toggle h--100" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">' +
                '<span inf-ctrl="' + ctrlType + 'SelectedLineStyle" inf-ctrl-val="' + ctrlValue + '" inf-size="' + lineStyle + '"><i class="icon ico-minus-1"></i></span>' +
                    '<span class="caret"></span>' +
                '</button>' +
                infChart.structureManager.settings.getLineStyleHTML('dropdown-menu c-dropdown__menu', ctrlType) +
            '</div>' +
            infChart.structureManager.settings.getMiniColorPaletteHTML('lineColorPicker', ctrlValue, lineColor, position, undefined, 'fa fa-tint') +
            '</div>';
    };

    /**
       * get fib level setting row item
       * @param {string} ctrlType - tag used to identify the control
       * @param {string} fillColor - fill color hex
       * @param {number} opacity - fill opacity 0-1
       * @param {string} lineColor - line color hex
       * @param {number} lineWidth - line width 1,2,3
       * @param {string} ctrlValue - fib level id - P_all - all settings
       * @param {string} position - position for mini color palette
       * @param {string} title - title string / html
       * @param {boolean} isLabel - is a label or not (html)
       * @returns
       */
    var _getFibLevelSettingsRowItem = function (ctrlType, fillColor, opacity, lineColor, lineWidth, fontColor, fontSize, fontWeight, ctrlValue, position, title, isLabel, isApplyAllButton, subType, applyToAllClass) {
        return infChart.structureManager.settings.getRowItem(_getFibLevelSettingRowHTML(ctrlType, fillColor, opacity, lineColor, lineWidth, fontColor, fontSize, fontWeight, ctrlValue, position, isApplyAllButton, subType, applyToAllClass), title, isLabel);
    };

    var _getPriceLevelSettingsRowItem = function (ctrlType, lineWidth, lineStyle, ctrlValue, yValue, title, isLabel, lineColor, position) {
        return infChart.structureManager.settings.getRowItem(_getPriceLevelSettingRowHTML(ctrlType, lineWidth, lineStyle, ctrlValue, yValue, lineColor, position), title, isLabel);
    };

    var _getQuickSettingsPopupHTML = function (content, isLocked) {
        var config = infChart.settings.toolbar.config && infChart.settings.toolbar.config.quickDrawingSettings;
        var drgHandleeToolTip = infChart.structureManager.toolbar.getToolTipAttributes(infChart.manager.getLabel("label.dragToolbar"), "right");
        var html = ''
        html += '<div class="flt-tlbar" data-inf-quick-drawing-settings-pop-up="">';
        html += '<div inf-pnl="quick-panel-drag-handle" class="flt-tlbar__item flt-tlbar__handler flt-tlbar__drag" ' + drgHandleeToolTip + ' > <i class="icon ico-braille"></i></div>';
        html += '<ul class="flt-tlbar__tools">'+ content;
        if (config) {
            for (var key in config) {
                if (config.hasOwnProperty(key)) {
                    let icon = config[key].cls;
                    let tooltip = infChart.manager.getLabel(config[key].label);

                    if (key === "lock" && isLocked) {
                        icon = config[key].secondaryCls;
                        tooltip = infChart.manager.getLabel(config[key].secondaryLabel);
                    }

                    html += infChart.structureManager.settings.getQuicksettingListItemHTML(
                        _getQuickSettingButtonHTML("quick-setting-" + config[key].ctrl, icon ),
                        config[key].btnClass, tooltip, "left");
                }
            }
        }
        html += '</ul></div>';
        return html;
    };

    var _bindQuickSettingsPopup = function (containerId, quickSettingPopup, onDelete, onShowSettings, toggleLock) {
        var chart = infChart.manager.getChart(containerId);
        var containment = $($(chart.container)).find('div[inf-container=chart]');

        function startFix(event, ui) {
            ui.position.left = 0;
            ui.position.top = 0;
        }

        function dragFix(event, ui) {
            infChart.util.dragFix(chart, event, ui)
        }

        $(quickSettingPopup).find("a[inf-ctrl=quick-setting-delete]").on('click', function (e) {
            onDelete();
            e.stopPropagation();
        });
        $(quickSettingPopup).find("a[inf-ctrl=quick-setting-settings]").on('click', function (e) {
            onShowSettings();
            e.stopPropagation();
        });
        $(quickSettingPopup).find("a[inf-ctrl=quick-setting-lock]").on('click', function (e) {
            toggleLock($(this));
            e.stopPropagation();
        });
        quickSettingPopup.draggable({
            handle: "div[inf-pnl=quick-panel-drag-handle]",
            containment: containment,
            drag: dragFix,
            start: startFix
        });
        _positionQuickMenu(containerId, quickSettingPopup);
    };

    var _positionQuickMenu = function (containerId, quickSettingPopup) {
        var chart = infChart.manager.getChart(containerId);
        var $container = $(chart.container);
        var chartElement = $container.find('[inf-container="chart_container"]');
        var quickSettingsElement = $(quickSettingPopup);

        if(chartElement){
            quickSettingsElement.css("left", quickSettingsElement.outerWidth(true));
            quickSettingsElement.css("top", quickSettingsElement.height());
        }
    };

    var _getQuickSettingButtonHTML = function (ctrlType, icon) {
        return '<a inf-ctrl="' + ctrlType + '"><span class="' + icon + '"></span></a>';
    };

    /**
     * fibonacci settings
     * @param color
     * @param fibLevels
     * @returns {string}
     * @private
     */
    var _getPositionsSettings = function (currency, style) {
        var sections = [],
            mainSectionRowItems = [],
            takeProfitSectionRowItems = [],
            stopLossSectionRowItems = [],
            styleSectionRows = [],
            riskDropDownHTML = '<div class="dropdown has-vertical-list risk-currency" inf-ctrl="riskTypes">' +
            '<button class="btn btn-default dropdown-toggle" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">' +
            '<span rel="selectItem">%</span> <span class="caret"></span> ' +
            '</button>' +
            '<ul inf-ctrl="riskDropDown" class="dropdown-menu">' +
            '<li rel="riskType" inf-ctrl="percentage" inf-data="%"><a>%</a></li>' +
            '<li rel="riskType" inf-ctrl="size" inf-data="' + currency + '"><a>' + currency + '</a></li>' +
            '</ul>' +
            '</div>',
            currencyLabel = '<label>' + currency + '</label>', //for="' + accountSizeUniqueId + '"
            controls = [
                {ctrl: "accountSize", label: "Account Size", appendHTML: currencyLabel, rowItems: mainSectionRowItems},
                {ctrl: "lotSize", label: "Lot Size", appendHTML: "", rowItems: mainSectionRowItems},
                {ctrl: "risk", label: "Risk", appendHTML: riskDropDownHTML, rowItems: mainSectionRowItems},
                {ctrl: "entryPrice", label: "Entry Price", appendHTML: "", rowItems: mainSectionRowItems},
                {ctrl: "takeProfitTicks", label: "Ticks", appendHTML: "", rowItems: takeProfitSectionRowItems},
                {ctrl: "takeProfitPrice", label: "Price", appendHTML: "", rowItems: takeProfitSectionRowItems},
                {ctrl: "stopLossTicks", label: "Ticks", appendHTML: "", rowItems: stopLossSectionRowItems},
                {ctrl: "stopLossPrice", label: "Price", appendHTML: "", rowItems: stopLossSectionRowItems},
            ],
            controlUniqueId, controlHTML;

        controls.forEach(function (control) {
            controlUniqueId = new Date().getTime();
            controlLabelHTML = '<label for="' + controlUniqueId + '">'+ control.label +'</label>';
            controlBobyHTML = '<div class="fib-options-wrapper"><input inf-ctrl="'+ control.ctrl +'" type="text"  id="' + controlUniqueId + '">' + control.appendHTML + '</div>';
            control.rowItems.push(infChart.structureManager.settings.getRowItem(controlBobyHTML,controlLabelHTML, false));
        });

        sections.push(infChart.structureManager.settings.getSection([infChart.structureManager.settings.getSectionRow(mainSectionRowItems , 'two-col-row fib-section')]));
        sections.push(infChart.structureManager.settings.getSection([infChart.structureManager.settings.getSectionRow(takeProfitSectionRowItems , 'two-col-row fib-section')], "Profit Level"));
        sections.push(infChart.structureManager.settings.getSection([infChart.structureManager.settings.getSectionRow(stopLossSectionRowItems , 'two-col-row fib-section')], "Stop Level"));

        var lineStyleHTML = '<div class="fib-options-wrapper">' +
            infChart.structureManager.settings.getMiniColorPaletteHTML('lineColorPicker', "", style.lineColor, undefined, style.lineOpacity, 'fa fa-tint') +
            '<div class="dropdown line-weights">' +
            '<button class="dropdown-toggle" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">' +
            '<span inf-ctrl="selectedLineWidth" class="weight-line" inf-size="'+ style.lineWidth +'">&#x2F;</span>' +
            '<span class="caret"></span>' +
            '</button>' +
            infChart.structureManager.settings.getLineWeightHTML('dropdown-menu') +
            '</div>' +
            '</div>';
        styleSectionRows.push(infChart.structureManager.settings.getRowItem(lineStyleHTML, "Lines", false));
        styleSectionRows.push(infChart.structureManager.settings.getRowItem(
            '<div class="fib-options-wrapper">' + infChart.structureManager.settings.getMiniColorPaletteHTML('stopLossColorPicker', "", style.stopLossColor, undefined, style.stopLossFillOpacity, 'fa fa-tint') + '</div>', infChart.manager.getLabel("label.stopColor"), false));
        styleSectionRows.push(infChart.structureManager.settings.getRowItem(
            '<div class="fib-options-wrapper">' + infChart.structureManager.settings.getMiniColorPaletteHTML('takeProfitColorPicker', "", style.takeProfitColor, undefined, style.stopLossFillOpacity, 'fa fa-tint') + '</div>', infChart.manager.getLabel("label.targetColor"), false));
        
        var fontStyleHTML = '<div class="fib-options-wrapper">' +
            infChart.structureManager.settings.getMiniColorPaletteHTML('textColorPicker', "", style.textColor, undefined, style.textOpacity, 'fa fa-tint') +
            infChart.structureManager.settings.getFontSizeHTML(style.textFontSize, 'dropdown', 8, 24, 'dropdown-menu--list')             +
            '</div>';
        styleSectionRows.push(infChart.structureManager.settings.getRowItem(fontStyleHTML, "Text", false));

        var uniqueId = new Date().getTime();
        var compactStatsItemHTML = '<input inf-ctrl="compactStats" type="checkbox" checked="checked" id="' + uniqueId + '">' +
            '<label for="' + uniqueId + '">Compact stats mode</label>';

        styleSectionRows.push(infChart.structureManager.settings.getRowItem( "", compactStatsItemHTML, false));

        sections.push(infChart.structureManager.settings.getSection([infChart.structureManager.settings.getSectionRow(styleSectionRows , 'two-col-row fib-section')], "Style"));

        return '<div class="sl-tp-settings">' + infChart.structureManager.settings.getPanelBodyHTML(sections) + '</div>' +
                _getResetToDefaultHTML();
    };

    var _getPositionsQuickSettings = function (currency, style) {
        var html = "";

        html += infChart.structureManager.settings.getQuicksettingListItemHTML(
            infChart.structureManager.settings.getColorPaletteHTML('lineColorPicker', 'lineColor', style.lineColor, false, 'top left'), "has-color-picker", infChart.manager.getLabel("label.lineColor"), "right");
        html += infChart.structureManager.settings.getQuicksettingListItemHTML(
            infChart.structureManager.settings.getColorPaletteHTML('stopLossColorPicker', 'fillColor', style.stopLossColor, style.stopLossFillOpacity, 'top left'), "has-color-picker", infChart.manager.getLabel("label.stopColor"), "right");
        html += infChart.structureManager.settings.getQuicksettingListItemHTML(
            infChart.structureManager.settings.getColorPaletteHTML('takeProfitColorPicker', 'fillColor', style.takeProfitColor, style.stopLossFillOpacity, 'top left'), "has-color-picker", infChart.manager.getLabel("label.targetColor"), "right");
        html += infChart.structureManager.settings.getQuicksettingListItemHTML(
            infChart.structureManager.settings.getColorPaletteHTML('textColorPicker', 'fillColor', style.textColor, style.stopLossFillOpacity, 'top left'), "has-color-picker", infChart.manager.getLabel("label.fontColor"), "right");

        return html;
    };

    var _bindPositionsSettings = function ($container, annotation, priceDifferenceFactor, CallBackFnPositionSettings) {
        var options = annotation.options;

        $container.find("li[inf-ctrl=fontSize]").on('click', function (e) {
            var fontSize = $(this).attr('inf-size');
            CallBackFnPositionSettings.onLabelTextSizeChange(fontSize);
            var ctrlType = $(this).parent().attr('inf-ctrl');
            $(this).parent().parent().find("span[inf-ctrl="+ ctrlType +"SelectedFontSize]").text($(this).text()).attr('inf-size', fontSize);
        });

        var controls = [
            {ctrl: "accountSize", eventHandler: CallBackFnPositionSettings.onAccountSizeChange},
            {ctrl: "lotSize", eventHandler: CallBackFnPositionSettings.onLotSizeChange},
            {ctrl: "risk", eventHandler: CallBackFnPositionSettings.onRiskChange},
            {ctrl: "entryPrice", eventHandler: CallBackFnPositionSettings.onEntryPriceChange, checkPrices: {min: options.isLongPositions ? "stopLossPrice": "takeProfitPrice", max: options.isLongPositions? "takeProfitPrice": "stopLossPrice"}},
            {ctrl: "takeProfitTicks", eventHandler: CallBackFnPositionSettings.onTakeProfitTicksChange},
            {ctrl: "takeProfitPrice", eventHandler: CallBackFnPositionSettings.onTakeProfitPriceChange, checkPrices: {min: options.isLongPositions ? "entryPrice": null, max: options.isLongPositions? null: "entryPrice"}},
            {ctrl: "stopLossTicks", eventHandler: CallBackFnPositionSettings.onStopLossTicksChange},
            {ctrl: "stopLossPrice", eventHandler: CallBackFnPositionSettings.onStopLossPriceChange, checkPrices: {min: options.isLongPositions ? null: "entryPrice", max: options.isLongPositions? "entryPrice": null}},
        ];
        var colorControls = [
            {ctrl: "lineColorPicker", eventHandler: CallBackFnPositionSettings.onLineColorChange},
            {ctrl: "stopLossColorPicker", eventHandler: CallBackFnPositionSettings.onStopLossColorChange},
            {ctrl: "takeProfitColorPicker", eventHandler: CallBackFnPositionSettings.onTakeProfitColorChange},
            {ctrl: "textColorPicker", eventHandler: CallBackFnPositionSettings.onTextColorChange}
        ];

        controls.forEach(function (control){
            $container.find("input[inf-ctrl=" + control.ctrl + "]").on('blur', function (e) {
                var options = annotation.options;
                var settings = options.settings,
                    minPrice, maxPrice;

                var value = $(this).val();

                if (value !== "" && !isNaN(value)) {
                    var newValue = parseFloat(value);

                    if(control.checkPrices) {
                        minPrice = control.checkPrices.min === "stopLossPrice"? settings.stopLoss.price: control.checkPrices.min === "takeProfitPrice"? settings.takeProfit.price : settings.entryPrice;
                        maxPrice = control.checkPrices.max === "stopLossPrice"? settings.stopLoss.price: control.checkPrices.max === "takeProfitPrice"? settings.takeProfit.price : settings.entryPrice;

                        if(control.checkPrices.min && newValue <= minPrice) {
                            newValue = minPrice + priceDifferenceFactor;
                            $(this).val(newValue);
                        } else if(control.checkPrices.max && newValue >= maxPrice) {
                            newValue = maxPrice - priceDifferenceFactor;
                            $(this).val(newValue);
                        }
                    }

                    control.eventHandler(newValue);
                } else {
                    $(this).parent().addClass('has-error');
                }
                e.stopPropagation();
            });
        });

        $container.find("ul[inf-ctrl=riskDropDown]").find("li[rel=riskType]").on('click', function (){
            $container.find("div[inf-ctrl=riskTypes]").find("span[rel=selectItem]").text($(this).attr("inf-data"));
            annotation.options.settings.risk.selectedItem = $(this).attr("inf-ctrl");
            $container.find("input[inf-ctrl=risk]").val(annotation.options.settings.risk[annotation.options.settings.risk.selectedItem]);
        });

        colorControls.forEach(function (control) {
            infChart.util.bindColorPicker($container.find("input[inf-ctrl=" + control.ctrl + "]"), undefined, function (rgb, value, opacity) {
                control.eventHandler(rgb, value, opacity);
            });
        });

        $container.find('li[inf-ctrl=lineWidth]').on('click', function (e) {
            var strokeWidth = $(this).attr("inf-size");
            $(this).parent().parent().find("span[inf-ctrl=selectedLineWidth]").text($(this).text());
            CallBackFnPositionSettings.onLineWidthChange(strokeWidth);
        });

        $container.find("input[inf-ctrl=compactStats]").on('click', function (e) {
            CallBackFnPositionSettings.onCompactStatsModeChange($(this).is(":checked"));
            e.stopPropagation();
        });

        _bindResetToDefaultEvent($container , CallBackFnPositionSettings.onResetToDefault);
    };

    var _updatePositionsSettings = function ($container, settings, styles, decimalPoints) {
        var colorControls = [
            {ctrl: "lineColorPicker", color: styles.lineColor, opacity: styles.lineOpacity},
            {ctrl: "stopLossColorPicker", color: styles.stopLossColor, opacity: styles.stopLossFillOpacity},
            {ctrl: "takeProfitColorPicker", color: styles.takeProfitColor, opacity: styles.stopLossFillOpacity},
            {ctrl: "textColorPicker", color: styles.textColor, opacity: styles.textOpacity}
        ];

        $container.find('span[inf-ctrl="singleSelectedFontSize"][inf-ctrl-val="P_all"]').text(styles.textFontSize).attr('inf-size', styles.textFontSize);

        $container.find("input[inf-ctrl=accountSize]").val(settings.accountSize);
        $container.find("input[inf-ctrl=lotSize]").val(settings.lotSize);
        $container.find("input[inf-ctrl=entryPrice]").val(settings.entryPrice.toFixed(decimalPoints));

        var riskText = settings.risk.selectedItem === "percentage"? settings.risk.percentage: settings.risk.size;
        $container.find("input[inf-ctrl=risk]").val(riskText);
        $container.find("div[inf-ctrl=riskTypes]").find("span[rel=selectItem]").text($container.find("ul[inf-ctrl=riskDropDown]").find("li[inf-ctrl="+ settings.risk.selectedItem +"]").attr("inf-data"));

        $container.find("input[inf-ctrl=takeProfitTicks]").val(settings.takeProfit.tickSize);
        $container.find("input[inf-ctrl=takeProfitPrice]").val(settings.takeProfit.price.toFixed(decimalPoints));
        $container.find("input[inf-ctrl=stopLossTicks]").val(settings.stopLoss.tickSize);
        $container.find("input[inf-ctrl=stopLossPrice]").val(settings.stopLoss.price.toFixed(decimalPoints));

        colorControls.forEach(function (control) {
            $container.find('input[inf-ctrl="'+ control.ctrl +'"]').mainColorPanel('value', control.color);
            $container.find('input[inf-ctrl="'+ control.ctrl +'"]').mainColorPanel('opacity', control.opacity);
        });

        var lineWeightText = $($container.find('li[inf-ctrl="lineWidth"][inf-size="' + styles.lineWidth + '"]')[0]).find('span').text();
        $container.find('span[inf-ctrl="selectedLineWidth"]').text(lineWeightText);
        $container.find('span[inf-ctrl="selectedLineWidth"]').attr('inf-size', styles.lineWidth);
        $container.find('input[inf-ctrl="compactStats"]').prop('checked', styles.isCompactStats);
    };

    /**
     * TrendChannel settings
     * @param title
     * @param lineColor
     * @param fillColor
     * @param fillOpacity
     * @returns {string}
     * @private
     */
    var _getTrendChannelSettings = function (lineColor, middleLineColor, fillColor, fillOpacity) {
        var sections = [],
            channelStyleSectionRows = [],
            middleLineSectionRows = [];

        channelStyleSectionRows.push(infChart.structureManager.settings.getRowItem(
            '<div class="fib-options-wrapper">' + infChart.structureManager.settings.getLineStyleHTML() + '</div>', "Line Style", false));
        channelStyleSectionRows.push(infChart.structureManager.settings.getRowItem(
            '<div class="fib-options-wrapper">' + infChart.structureManager.settings.getLineWeightHTML() + '</div>', "Line Width", false));
        channelStyleSectionRows.push(infChart.structureManager.settings.getRowItem(
            '<div class="fib-options-wrapper">' + infChart.structureManager.settings.getMiniColorPaletteHTML("channelColorPicker", "", lineColor, undefined, false, "fa fa-tint") + '</div>', "Line Color", false));
        channelStyleSectionRows.push(infChart.structureManager.settings.getRowItem(
            '<div class="fib-options-wrapper">' + infChart.structureManager.settings.getMiniColorPaletteHTML("fillColorPicker", "", fillColor, undefined, fillOpacity, "fa fa-tint") + '</div>', "Fill Color", false));
        sections.push(infChart.structureManager.settings.getSection([infChart.structureManager.settings.getSectionRow(channelStyleSectionRows , 'two-col-row fib-section channel-styles')], "Channel Styles"));

        middleLineSectionRows.push(infChart.structureManager.settings.getRowItem(
            '<div class="fib-options-wrapper">' + infChart.structureManager.settings.getLineStyleHTML() + '</div>', "Line Style", false));
        middleLineSectionRows.push(infChart.structureManager.settings.getRowItem(
            '<div class="fib-options-wrapper">' + infChart.structureManager.settings.getLineWeightHTML() + '</div>', "Line Width", false));
        middleLineSectionRows.push(infChart.structureManager.settings.getRowItem(
            '<div class="fib-options-wrapper">' + infChart.structureManager.settings.getMiniColorPaletteHTML("middleLineColorPicker", "", middleLineColor, undefined, false, "fa fa-tint") + '</div>', "Line Color", false));


        sections.push(infChart.structureManager.settings.getSection([infChart.structureManager.settings.getSectionRow(middleLineSectionRows , 'two-col-row fib-section middle-line-styles')], "Middle Line Styles"));

        return '<div class="sl-tp-settings">' + infChart.structureManager.settings.getPanelBodyHTML(sections) + '</div>' + _getResetToDefaultHTML();
    };

    var _getTrendChannelQuickSettings = function (lineColor, fillColor, fillOpacity) {
        var html = "";
        html += infChart.structureManager.settings.getQuicksettingListItemHTML(
            infChart.structureManager.settings.getColorPaletteHTML('channelColorPicker', '', lineColor, false, 'top left'), "has-color-picker", infChart.manager.getLabel("label.lineColor"), "right");
        // if (fillColor) {
            html += infChart.structureManager.settings.getQuicksettingListItemHTML(
                infChart.structureManager.settings.getColorPaletteHTML('fillColorPicker', 'fillColor', fillColor, fillOpacity, 'top left'), "has-color-picker", infChart.manager.getLabel("label.fillColor"), "right");
        // }
        return html;
    };

    /**
     * bind TrendChannel settings
     * @param {object} $container - main container
     * @param {function} onChannelLineColorChange - color change function
     * @param {function} onChannelLineWidthChange - line width change function
     * @param {function} onChannelLineStyleChange - line style change function
     * @param {function} onFillColorChange - fill color change function
     * @param {function} onMiddleLineColorChange - middle line color change function
     * @param {function} onMiddleLineWidthChange - middle line width change function
     * @param {function} onMiddleLineStyleChange - middle line style change function
     * @param {function} onResetToDefault
     */
    var _bindTrendChannelSettings = function ($container, onChannelLineColorChange, onChannelLineWidthChange, onChannelLineStyleChange, onFillColorChange, onMiddleLineColorChange, onMiddleLineWidthChange, onMiddleLineStyleChange, onResetToDefault) {
        infChart.util.bindColorPicker($container.find("input[inf-ctrl=channelColorPicker]"), undefined, onChannelLineColorChange);
        infChart.util.bindColorPicker($container.find("input[inf-ctrl=middleLineColorPicker]"), undefined, onMiddleLineColorChange);

        if (onFillColorChange) {
            infChart.util.bindColorPicker($container.find("input[inf-ctrl=fillColorPicker]"), undefined, onFillColorChange);
        }

        _bindSeriesLineWidthEvents($container.find(".channel-styles"), onChannelLineWidthChange);
        _bindSeriesLineWidthEvents($container.find(".middle-line-styles"), onMiddleLineWidthChange);

        $container.find(".channel-styles").find("li[inf-ctrl=lineStyle]").on('click', function (e) {
            var dashStyle = $(this).attr("inf-style");
            $container.find(".channel-styles").find("li[inf-ctrl=lineStyle]").removeClass('active');
            $(this).addClass('active');
            onChannelLineStyleChange(dashStyle);
            e.stopPropagation();
        });

        $container.find(".middle-line-styles").find("li[inf-ctrl=lineStyle]").on('click', function (e) {
            var dashStyle = $(this).attr("inf-style");
            $container.find(".middle-line-styles").find("li[inf-ctrl=lineStyle]").removeClass('active');
            $(this).addClass('active');
            onMiddleLineStyleChange(dashStyle);
            e.stopPropagation();
        });

        _bindResetToDefaultEvent($container , onResetToDefault);
    };

    var _updateTrendChannelSettings = function ($container, channelLineColor, channelLineWidth, channelLineStyle, fillColor, fillOpacity, middleLineColor, middleLineWidth, middleLineStyle) {
        var channelStylesContainer = $container.find(".channel-styles"),
            middleLineStylesContainer = $container.find(".middle-line-styles");

        channelStylesContainer.find('li[inf-ctrl="lineWidth"]').removeClass('active');
        channelStylesContainer.find('li[inf-ctrl="lineStyle"]').removeClass('active');
        channelStylesContainer.find('li[inf-ctrl="lineWidth"][inf-size="' + channelLineWidth + '"]').addClass('active');
        channelStylesContainer.find('li[inf-ctrl="lineStyle"][inf-style="' + channelLineStyle + '"]').addClass('active');

        middleLineStylesContainer.find('li[inf-ctrl="lineWidth"]').removeClass('active');
        middleLineStylesContainer.find('li[inf-ctrl="lineStyle"]').removeClass('active');
        middleLineStylesContainer.find('li[inf-ctrl="lineWidth"][inf-size="' + middleLineWidth + '"]').addClass('active');
        middleLineStylesContainer.find('li[inf-ctrl="lineStyle"][inf-style="' + middleLineStyle + '"]').addClass('active');

        $container.find('input[inf-ctrl="channelColorPicker"]').mainColorPanel('value', channelLineColor);
        $container.find('input[inf-ctrl="middleLineColorPicker"]').mainColorPanel('value', middleLineColor);
        if (fillColor) {
            $container.find('input[inf-ctrl="fillColorPicker"]').mainColorPanel('value', fillColor);
            $container.find('input[inf-ctrl="fillColorPicker"]').mainColorPanel('opacity', fillOpacity);
        }
    };

    var _getVolumeProfileSettings = function (volumeTypes, settings) {
        var sections = [],
            inputSectionRowItems = [],
            settingAndStyleSectionRowItems = [],
            volumeDropDownHTML = '<div class="fib-options-wrapper"><div class="dropdown has-vertical-list volume" inf-ctrl="volumeTypes">' +
                '<button class="btn btn-default dropdown-toggle" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">' +
                '<span rel="selectItem">'+ volumeTypes.total.displayName +'</span> <span class="caret"></span> ' +
                '</button>' +
                '<ul inf-ctrl="volumeTypesDropDown" class="dropdown-menu w--100">';

        Object.keys(volumeTypes).forEach(function (volumeType) {
            volumeDropDownHTML += '<li rel="volumeType"  inf-data="' + volumeType + '"><a>' + volumeTypes[volumeType].displayName + '</a></li>';
        })
        volumeDropDownHTML += '</ul></div></div>';

        inputSectionRowItems.push(infChart.structureManager.settings.getRowItem(volumeDropDownHTML, '<label>Volume</label>', false));
        _setVolumeProfileSettingsTextBoxRow("valueAreaVolume", "Value Area Volume", "<span>%</span>", inputSectionRowItems);
        _setVolumeProfileSettingsTextBoxRow("barCount", "Bar Count", "", inputSectionRowItems);

        sections.push(infChart.structureManager.settings.getSection([infChart.structureManager.settings.getSectionRow(inputSectionRowItems, 'two-col-row fib-section')], "Inputs"));

        settingAndStyleSectionRowItems.push(infChart.structureManager.settings.getRowItem("", _getVolumeProfileCheckBox("showVolumeProfile", "Show Volume Profile"), false));
        settingAndStyleSectionRowItems.push(infChart.structureManager.settings.getRowItem("", "", false));
        _setVolumeProfileSettingsTextBoxRow("profileWidth", "Profile Width", "<span>%</span>", settingAndStyleSectionRowItems);
        // settingAndStyleSectionRowItems.push(infChart.structureManager.settings.getRowItem("", _getVolumeProfileCheckBox("flipChart", "Flip chart"), false));
        settingAndStyleSectionRowItems.push(infChart.structureManager.settings.getRowItem(
            '<div class="fib-options-wrapper">' + infChart.structureManager.settings.getMiniColorPaletteHTML('histogramBoxColor', "", settings.histogramBox.color, undefined, settings.histogramBox.opacity, 'fa fa-tint') + '</div>', "Histograms Area", false));


        settingAndStyleSectionRowItems.push(infChart.structureManager.settings.getRowItem(
            '<div class="fib-options-wrapper">' + infChart.structureManager.settings.getMiniColorPaletteHTML('upVolumeColor', "", settings.volumeProfile.upVolumeColor, undefined, settings.volumeProfile.upVolumeOpacity, 'fa fa-tint') + '</div>', "Up Volume", false));
        settingAndStyleSectionRowItems.push(infChart.structureManager.settings.getRowItem(
            '<div class="fib-options-wrapper">' + infChart.structureManager.settings.getMiniColorPaletteHTML('downVolumeColor', "", settings.volumeProfile.downVolumeColor, undefined, settings.volumeProfile.downVolumeOpacity, 'fa fa-tint') + '</div>', "Down Volume", false));
        settingAndStyleSectionRowItems.push(infChart.structureManager.settings.getRowItem(
            '<div class="fib-options-wrapper">' + infChart.structureManager.settings.getMiniColorPaletteHTML('volumeAreaUpColor', "", settings.volumeProfile.volumeAreaUpColor, undefined, settings.volumeProfile.volumeAreaUpOpacity, 'fa fa-tint') + '</div>', "Value Area Up", false));
        settingAndStyleSectionRowItems.push(infChart.structureManager.settings.getRowItem(
            '<div class="fib-options-wrapper">' + infChart.structureManager.settings.getMiniColorPaletteHTML('volumeAreaDownColor', "", settings.volumeProfile.volumeAreaDownColor, undefined, settings.volumeProfile.volumeAreaDownOpacity, 'fa fa-tint') + '</div>', "Value Area Down", false));

        _setVolumeProfileStyleRowWithCheckBox('vAH', 'VAH', settings.valueAreaHigh, true, settingAndStyleSectionRowItems);
        _setVolumeProfileStyleRowWithCheckBox('vAL', 'VAL', settings.valueAreaLow, true, settingAndStyleSectionRowItems);
        _setVolumeProfileStyleRowWithCheckBox('pOC', 'POC', settings.pointOfControl, true, settingAndStyleSectionRowItems);
        // _setVolumeProfileStyleRowWithCheckBox('values', 'Values', settings.values, false, settingAndStyleSectionRowItems);

        sections.push(infChart.structureManager.settings.getSection([infChart.structureManager.settings.getSectionRow(settingAndStyleSectionRowItems, 'two-col-row fib-section')], "Settings & Styles"));

        return '<div class="vol-profile">' + infChart.structureManager.settings.getPanelBodyHTML(sections) + '</div>' + _getResetToDefaultHTML();
    };

    var _setVolumeProfileSettingsTextBoxRow = function (ctrl, label, appendHTML, rowItems) {
        var controlUniqueId = new Date().getTime();
        var controlLabelHTML = '<label for="' + controlUniqueId + '">' + label + '</label>';
        var controlBobyHTML = '<div class="fib-options-wrapper"><input inf-ctrl="' + ctrl + '" type="text"  id="' + controlUniqueId + '">' + appendHTML + '</div>';
        rowItems.push(infChart.structureManager.settings.getRowItem(controlBobyHTML, controlLabelHTML, false));
    }

    var _getVolumeProfileCheckBox = function (ctrl, label) {
        var uniqueId = new Date().getTime();
        return  '<input inf-ctrl="'+ ctrl +'" type="checkbox" checked="checked" id="' + uniqueId + '"><label for="' + uniqueId + '">'+ label +'</label>';
    }

    var _setVolumeProfileStyleRowWithCheckBox = function (ctrl , label, settings, addLineControls, rowItems) {
        var labelHTML = _getVolumeProfileCheckBox("check_" + ctrl, label);

        var lineStyleHTML = '<div class="fib-options-wrapper">' +
            infChart.structureManager.settings.getMiniColorPaletteHTML('color_' + ctrl, "", settings.color, undefined, settings.opacity, 'fa fa-tint');

        if(addLineControls) {
            lineStyleHTML += ('<div inf-ctrl="lineWidth_' + ctrl + '" class="dropdown line-weights">' +
            '<button class="dropdown-toggle" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">' +
            '<span inf-ctrl="selectedLineWidth" class="weight-line" inf-size="1">&#x2F;</span>' +
            '<span class="caret"></span>' +
            '</button>' +
            infChart.structureManager.settings.getLineWeightHTML('dropdown-menu') +
            '</div>' +
            '<div inf-ctrl="lineStyle_' + ctrl + '" class="dropdown line-style">' +
            '<button class="dropdown-toggle" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">' +
            '<span inf-ctrl="selectedLineStyle" class="weight-line" inf-style="solid"><i class="icon ico-minus-1"></i></span>' +
            '<span class="caret"></span>' +
            '</button>' +
            infChart.structureManager.settings.getLineStyleHTML('dropdown-menu') +
            '</div>');
        }

        lineStyleHTML += '</div>';
        rowItems.push(infChart.structureManager.settings.getRowItem(lineStyleHTML, labelHTML, false));
    }

    var _bindVolumeProfileSettings = function ($container, eventHandlers) {
        var controls = [
            {ctrl: "valueAreaVolume", eventHandler: eventHandlers.onValueAreaVolumeChange, range: {min: 0, max: 100}},
            {ctrl: "barCount", eventHandler: eventHandlers.onBarCountChange, range: {min: 1, max: 1000}},
            {ctrl: "profileWidth", eventHandler: eventHandlers.onProfileWidthChange, range: {min: 0, max: 100}},
        ];
        var colorControls = [
            {ctrl: "upVolumeColor", eventHandler: eventHandlers.onUpVolumeColorChange},
            {ctrl: "downVolumeColor", eventHandler: eventHandlers.onDownVolumeColorChange},
            {ctrl: "volumeAreaUpColor", eventHandler: eventHandlers.onVolumeAreaUpColorChange},
            {ctrl: "volumeAreaDownColor", eventHandler: eventHandlers.onVolumeAreaDownColorChange},
            {ctrl: "color_vAH", eventHandler: eventHandlers.onValueAreaHighColorChange},
            {ctrl: "color_vAL", eventHandler: eventHandlers.onValueAreaLowColorChange},
            {ctrl: "color_pOC", eventHandler: eventHandlers.onPointOfControlColorChange},
            {ctrl: "color_values", eventHandler: eventHandlers.onValuesColorChange},
            {ctrl: "histogramBoxColor", eventHandler: eventHandlers.onHistogramBoxColorChange}
        ];
        var lineWithAndStyleControls = [
            {ctrl: "vAH", lineWidthEventHandler: eventHandlers.onValueAreaHighLineWidthChange, lineStyleEventHandler: eventHandlers.onValueAreaHighLineStyleChange},
            {ctrl: "vAL", lineWidthEventHandler: eventHandlers.onValueAreaLowLineWidthChange, lineStyleEventHandler: eventHandlers.onValueAreaLowLineStyleChange},
            {ctrl: "pOC", lineWidthEventHandler: eventHandlers.onPointOfControlLineWidthChange, lineStyleEventHandler: eventHandlers.onPointOfControlLineStyleChange}
        ];
        var checkBoxControls = [
            {ctrl: "showVolumeProfile", eventHandler: eventHandlers.onToggleVolumeProfile},
            // {ctrl: "flipChart", eventHandler: eventHandlers.onToggleFlipChart},
            {ctrl: "check_vAH", eventHandler: eventHandlers.onToggleValueAreaHigh},
            {ctrl: "check_vAL", eventHandler: eventHandlers.onToggleValueAreaLow},
            {ctrl: "check_pOC", eventHandler: eventHandlers.onTogglePointOfControl}
            // ,
            // {ctrl: "check_values", eventHandler: eventHandlers.onToggleValues}
        ];

        controls.forEach(function (control){
            $container.find("input[inf-ctrl=" + control.ctrl + "]").on('blur', function (e) {
                var value = $(this).val();

                if (value !== "" && !isNaN(value)) {
                    var newValue = parseFloat(value);

                    if(newValue < control.range.min) {
                        newValue = control.range.min;
                        $(this).val(newValue);
                    } else if(newValue > control.range.max) {
                        newValue = control.range.max;
                        $(this).val(newValue);
                    }

                    control.eventHandler(newValue);
                } else {
                    $(this).parent().addClass('has-error');
                }
                e.stopPropagation();
            });
        });

        $container.find("ul[inf-ctrl=volumeTypesDropDown]").find("li[rel=volumeType]").on('click', function (){
            $container.find("div[inf-ctrl=volumeTypes]").find("span[rel=selectItem]").text($(this).find('a').text());
            eventHandlers.onVolumeTypeChange($(this).attr("inf-data"));
        });

        colorControls.forEach(function (control) {
            infChart.util.bindColorPicker($container.find("input[inf-ctrl=" + control.ctrl + "]"), undefined, function (rgb, value, opacity) {
                control.eventHandler(rgb, value, opacity);
            });
        });

        lineWithAndStyleControls.forEach(function (control) {
            $container.find('div[inf-ctrl=lineWidth_'+ control.ctrl +']').find("li[inf-ctrl=lineWidth]").on('click', function (e) {
                var strokeWidth = $(this).attr("inf-size");
                $(this).parent().parent().find("span[inf-ctrl=selectedLineWidth]").text($(this).text()).attr("inf-size", strokeWidth);
                control.lineWidthEventHandler(strokeWidth);
            });

            $container.find('div[inf-ctrl=lineStyle_'+ control.ctrl +']').find("li[inf-ctrl=lineStyle]").on('click', function (e) {
                var lineStyle = $(this).attr("inf-style");
                $(this).parent().parent().find("span[inf-ctrl=selectedLineStyle]").html($(this).html()).attr("inf-style", lineStyle);
                control.lineStyleEventHandler(lineStyle);
            });
        });

        checkBoxControls.forEach(function (control) {
            $container.find("input[inf-ctrl="+ control.ctrl +"]").on('click', function (e) {
                control.eventHandler($(this).is(":checked"));
                e.stopPropagation();
            });
        });

        _bindResetToDefaultEvent($container , eventHandlers.onResetToDefault);
    };

    var _updateVolumeProfileSettings = function ($container, volumeTypes, settings) {
        var colorControls = [
            {ctrl: "upVolumeColor", color: settings.volumeProfile.upVolumeColor, opacity: settings.volumeProfile.upVolumeOpacity},
            {ctrl: "downVolumeColor", color: settings.volumeProfile.downVolumeColor, opacity: settings.volumeProfile.downVolumeOpacity},
            {ctrl: "volumeAreaUpColor", color: settings.volumeProfile.volumeAreaUpColor, opacity: settings.volumeProfile.volumeAreaUpOpacity},
            {ctrl: "volumeAreaDownColor", color: settings.volumeProfile.volumeAreaDownColor, opacity: settings.volumeProfile.volumeAreaDownOpacity},
            {ctrl: "color_vAH", color: settings.valueAreaHigh.color, opacity: settings.valueAreaHigh.opacity},
            {ctrl: "color_vAL", color: settings.valueAreaLow.color, opacity: settings.valueAreaLow.opacity},
            {ctrl: "color_pOC", color: settings.pointOfControl.color, opacity: settings.pointOfControl.opacity},
            {ctrl: "color_values", color: settings.values.color, opacity: settings.values.opacity},
            {ctrl: "histogramBoxColor", color: settings.histogramBox.color, opacity: settings.histogramBox.opacity}
        ];
        var lineWithAndStyleControls = [
            {ctrl: "vAH", lineWidth: settings.valueAreaHigh.lineWidth, lineStyle: settings.valueAreaHigh.lineStyle},
            {ctrl: "vAL", lineWidth: settings.valueAreaLow.lineWidth, lineStyle: settings.valueAreaLow.lineStyle},
            {ctrl: "pOC", lineWidth: settings.pointOfControl.lineWidth, lineStyle: settings.pointOfControl.lineStyle}
        ];
        var checkBoxControls = [
            {ctrl: "showVolumeProfile", isChecked: settings.volumeProfile.enabled},
            // {ctrl: "flipChart", isChecked: settings.volumeProfile.flipChart},
            {ctrl: "check_vAH", isChecked: settings.valueAreaHigh.enabled},
            {ctrl: "check_vAL", isChecked: settings.valueAreaLow.enabled},
            {ctrl: "check_pOC", isChecked: settings.pointOfControl.enabled}
            // ,
            // {ctrl: "check_values", isChecked: settings.values.enabled}
        ];

        $container.find("input[inf-ctrl=valueAreaVolume]").val(settings.valueAreaVolume);
        $container.find("input[inf-ctrl=barCount]").val(settings.barCount);
        $container.find("input[inf-ctrl=profileWidth]").val(settings.volumeProfile.profileWidth);
        $container.find("div[inf-ctrl=volumeTypes]").find("span[rel=selectItem]").text(volumeTypes[settings.volume].displayName);

        colorControls.forEach(function (control) {
            $container.find('input[inf-ctrl="'+ control.ctrl +'"]').mainColorPanel('value', control.color);
            $container.find('input[inf-ctrl="'+ control.ctrl +'"]').mainColorPanel('opacity', control.opacity);
        });

        lineWithAndStyleControls.forEach(function (control) {
            var lineWidthText = $container.find('div[inf-ctrl=lineWidth_'+ control.ctrl +']').find('li[inf-ctrl="lineWidth"][inf-size="' + control.lineWidth + '"]').find('span').text();
            $container.find('div[inf-ctrl=lineWidth_'+ control.ctrl +']').find('span[inf-ctrl="selectedLineWidth"]').text(lineWidthText);
            $container.find('div[inf-ctrl=lineWidth_'+ control.ctrl +']').find('span[inf-ctrl="selectedLineWidth"]').attr('inf-size', control.lineWidth);

            var lineStyle = $container.find('div[inf-ctrl=lineStyle_'+ control.ctrl +']').find('li[inf-ctrl=lineStyle][inf-size="' + control.lineStyle + '"]').find('a').html();
            $container.find('div[inf-ctrl=lineStyle_'+ control.ctrl +']').find('span[inf-ctrl="selectedLineStyle"]').html(lineStyle);
            $container.find('div[inf-ctrl=lineStyle_'+ control.ctrl +']').find('span[inf-ctrl="selectedLineStyle"]').attr('inf-style', control.lineStyle);
        });

        checkBoxControls.forEach(function (control) {
            $container.find('input[inf-ctrl="' + control.ctrl + '"]').prop('checked', control.isChecked);
        });
    };

    /**
     * get html of template selection dropdown
     * @returns {string}
     * @private
     */
    var _getTemplateSelectionDropDownHTML = function (templates, userDefaultSettings) {
        var html = '<div inf-ctrl="drawing-template-selector" class="dropup save-custom-template footer-def-btn">' +
                    '<button class="c-btn c-btn--default" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">' +
                    'Drawing Template'+
                    '<i class="icom icom-caret-down"></i>' +
                    '</button>' +
                    '<ul class="dropdown-menu">';
        if (templates && templates.length > 0) {
            html += '<li class="custom-template"><ul>';
            templates.forEach(function (template) {
                html += '<li inf-ctrl="custom-template"  inf-value="'+template+'">' +
                            '<a><span>' + template + '</span><i inf-ctrl="delete-template" class="icom icom-cross"></i></a>' +
                        '</li>';
            });
            html += '</ul></li>';
        }
        html += '<li inf-ctrl="save-template" class="save-template"><a>Save As</a></li>';
        html += '</ul>';
        html += '</div>'
        html += _getDefaultSettingsHTML(userDefaultSettings);
        return html;
    };

    var _getDefaultSettingsHTML = function(userDefaultSettings) {
        return '<button rel="tooltip" tool-tip adv-chart-tooltip= "Save settings to be applied in next drawings" inf-ctrl="set-as-my-default-selector" class="c-btn c-btn--default footer-def-btn save-user-default adv-chart-tooltip top" type="button">Set as My Default Settings</button>' + 
        '<div class="dropup footer-def-btn reset-options">' + 
            '<button class="c-btn c-btn--default" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">Reset<i class="icom icom-caret-down"></i></button>' +
            '<ul class="dropdown-menu dropup-menu-right">' + 
                '<li class="reset-template">' + 
                    '<a inf-ctrl="reset-to-my-default-selector" class="' + (userDefaultSettings === undefined ? 'disabled' :'') + '">Reset to My Default</a>' +
                '</li>' +
                '<li class="reset-template">' +
                    '<a inf-ctrl="reset-to-app-default-selector">Reset to App Default</a>' +
                '</li>' +
            '</ul>' +
        '</div> ';
    }

    /**
     * bind template selection events
     * @param $container
     * @param saveTemplateFn
     * @param applyTemplateFn
     * @param deleteTemplateFn
     * @private
     */
    var _bindTemplateSelectionEvents = function ($container, saveTemplateFn, applyTemplateFn, deleteTemplateFn) {
        var parentContainer = $container.parent();
        var chartContainer = $container.parents().closest('[inf-container="chart_container"]');
        var availableTemplates = [];
        var popupMask;

        $container.find("li[inf-ctrl=custom-template]").each(function (key, element) {
            availableTemplates.push($(element).attr("inf-value"));
        });

        $container.find("li[inf-ctrl=save-template]").on('click', function (event) {
            removePopups();
            _loadSaveTemplatePopup($container, availableTemplates, saveTemplateFn, onClosePopups, getPopupPosition());
            onOpenPopups();
        });

        $container.find("li[inf-ctrl=custom-template]").on('click', function () {
            var templateId = $(this).attr("inf-value");
            applyTemplateFn(templateId);
        });

        $container.find("i[inf-ctrl=delete-template]").on('click', function (event) {
            removePopups();
            var templateId = $(this).parent().parent().attr("inf-value");
            var confirmationMessage = "Do you really want to delete drawing template '" + templateId + "'?";
            _loadConfirmationPopup($container, confirmationMessage, function () {
                deleteTemplateFn(templateId);
            }, onClosePopups, getPopupPosition());
            onOpenPopups();
            event.stopPropagation();
        });

        function getPopupPosition () {
            var templateSelectorElm = $container.find('[inf-ctrl="drawing-template-selector"]')
            var templateSelectorPosition = templateSelectorElm.position();
            var containerPosition = $container.position();
            return {
                top : containerPosition.top + templateSelectorPosition.top - 120,
                left : containerPosition.left + templateSelectorPosition.left +
                       (templateSelectorElm.outerWidth(true) - templateSelectorElm.width())
            };
        }

        function removePopups () {
            parentContainer.find('[inf-container="save-template"]').remove();
            parentContainer.find('[inf-container="confirmation"]').remove();
            onClosePopups();
        }

        function onOpenPopups () {
            popupMask = $(_getCustomMaskHTML());
            chartContainer.append(popupMask);
            infChart.util.bindEvent(popupMask, 'mousedown', function(){
                removePopups();
            });
        }

        function onClosePopups () {
            if (popupMask && popupMask.length > 0) {
                popupMask.remove();
            }
        }
    };

    /**
     * load pop-up to save template
     * @param $container
     * @param callbackOnBtnClick
     * @param availableTemplates
     * @param onClosePopup
     * @param position
     * @private
     */
    var _loadSaveTemplatePopup = function ($container, availableTemplates, callbackOnBtnClick, onClosePopup, position) {
        var html =  '<div inf-container="save-template" class="save-template-popup drawing_popup settings-modal">' +
                    '<div inf-pnl="popup-header" class="drawing_popup_header"> Drawing Template' +
                    '<ul><li class="header_ctrl" inf-ctrl="closeSettings"><span class="icon ico-close"></span> </li></ul></div>' +
                    '<div inf-pnl="popup-body" class="drawing_popup_body">' +
                    '<div class="drawing_popup_row form-group">' +
                    '<span class="form-label">Drawing Template Name</span> ' +
                    '<input class="form-control" type="text" value="" name="templateName" />' +
                    '</div>' +
                    '<div class="drawing_popup_row">' +
                    '<input inf-ctrl="action" disabled type="button" class="btn btn-default" value="Save Now"/>' +
                    '</div>' +
                    '</div>' +
                    '</div>';
        var popup = $(html).appendTo($container.parents().closest('[inf-container="drawing_settings"]'));
        var inputElm = popup.find('input[name=templateName]');
        var btnElm = popup.find("input[inf-ctrl=action]");

        popup.find("li[inf-ctrl=closeSettings]").click(function (event) {
            popup.remove();
            onClosePopup();
            event.preventDefault();
        });

        btnElm.click(function (event) {
            var templateName = inputElm.val().trim();
            if (availableTemplates.indexOf(templateName) === -1) {
                callbackOnBtnClick(templateName);
                popup.remove();
                onClosePopup();
            } else {
                var confirmationMessage = "Drawing Template '" + templateName + "' already exists. Do you really want to replace it ?";
                _loadConfirmationPopup($container, confirmationMessage, function () {
                    callbackOnBtnClick(templateName);
                    popup.remove();
                }, function () {}, position);
            }
            event.preventDefault();
        });

        inputElm.on('input change', function() {
            if($(this).val().trim() !== '') {
                btnElm.prop('disabled', false);
            } else {
                btnElm.prop('disabled', true);
            }
        });

        popup.css(position).show();

        inputElm.focus();
    };

    /***
     * load confirmation popup
     * @param $container
     * @param message
     * @param callbackOnSuccsess
     * @param onClosePopup
     * @param position
     * @private
     */
    var _loadConfirmationPopup  = function ($container, message, callbackOnSuccsess, onClosePopup, position, width) {
        var html = '<div inf-container="confirmation" class="drawing_popup confirmation-popup settings-modal">' +
            '<div inf-pnl="popup-header" class="drawing_popup_header">Confirmation' +
            '<ul>' +
            '<li class="header_ctrl" inf-ctrl="closeSettings">' +
            '<span class="icon ico-close"></span> ' +
            '</li>' +
            '</ul>' +
            '</div>' +
            '<div class="drawing_popup_row">' +
            '<span>'+ message +'</span> ' +
            '</div>' +
            '<div class="drawing_popup_row">' +
            '<input inf-ctrl="action-yes" type="button" class="btn btn-default" value="Yes"/>' +
            '<input inf-ctrl="action-no" type="button" class="btn btn-default" value="No" />' +
            '</div>' +
            '</div>';
        var confirmationPopup = $(html).appendTo($container.parents().closest('[inf-container="drawing_settings"]'));

        confirmationPopup.find('[inf-pnl="popup-header"]').css("cursor", "default");

        confirmationPopup.find("input[inf-ctrl=\"action-yes\"]").click(function (event) {
            callbackOnSuccsess();
            confirmationPopup.remove();
            if (onClosePopup) {
               onClosePopup()
            }
            event.preventDefault();
        });

        confirmationPopup.find("input[inf-ctrl=\"action-no\"]").click(function (event) {
            confirmationPopup.remove();
            if (onClosePopup) {
               onClosePopup()
            }
            event.preventDefault();
        });

        confirmationPopup.find("li[inf-ctrl=\"closeSettings\"]").click(function (event) {
            confirmationPopup.remove();
            if (onClosePopup) {
               onClosePopup()
            }
            event.preventDefault();
        });

        if (width) {
           confirmationPopup.css({'width': width + 'px'});
        }

        confirmationPopup.css(position).show();
    };

    /**
     * get apply as default html
     * @returns {string} - html
     * @private
     */
    var _getResetToDefaultHTML = function () {
        return '<button inf-ctrl="apply-as-default" class="c-btn c-btn--default reset-default-btn">Reset To Default</button>';
    };

    /**
     * bind apply as default options
     * @param {Object} $container - setting container
     * @param {Function} callback - call back function
     * @private
     */
    var _bindResetToDefaultEvent = function ($container, callback) {
        $container.find('button[inf-ctrl="apply-as-default"]').on('click', function () {
            callback();
        });
    };

    /**
     * get html structure for custom mask
     * @returns {string}
     * @private
     */
    var _getCustomMaskHTML = function () {
        return '<div class="chart-custom-popup-mask"></div>';
    };

    var _getSnapToHighLowToggleHTML = function(){
        return '<input inf-ctrl="snapToHighLowToggle" type="checkbox" data-value="P_all"> <label>Snap to High/Low</label>';
    }

    var _getFavoriteToggleElement = function(containerElem, drawingCat, shape) {
        var parentToolbar = $(infChart.structureManager.getContainer(containerElem[0], "drawingToolbar"));
        var drawingTool = parentToolbar.find("span[inf-ctrl=drawing-fav][drawing-cat='" + drawingCat + "'][inf-ctrl-shape='" + shape + "']");
        return drawingTool.find("i[rel=icon-i]");

    }
    return {
        getLineSettings: _getLineSettings,
        getPriceLineQuickSettings: _getPriceLineQuickSettings,
        getPriceLineSettings: _getPriceLineSettings,
        getBasicDrawingSettings: _getBasicDrawingSettings,
        getArrowSettings: _getArrowSettings,
        getArrowQuickSettings: _getArrowQuickSettings,
        getFibSettings: _getFibSettings,
        getGenericFibSettings: _getGenericFibSettings,
        getGenericQuickFibSettings: _getGenericQuickFibSettings,
        getFibQuickSettings: _getFibQuickSettings,
        getLabelSettings: _getLabelSettings,
        getHighLowLabelsSettings: _getHighLowLabelsSettings,
        getHighLowLabelsQuickSettings: _getHighLowLabelsQuickSettings,
        getRegressionChannelSettings: _getRegressionChannelSettings,
        getRegressionChannelQuickSettings: _getRegressionChannelQuickSettings,
        getLabelQuickSettings: _getLabelQuickSettings,
        getRectangleQuickSettings: _getRectangleQuickSettings,
        bindLineSettings: _bindLineSettings,
        bindPriceLineSettings: _bindPriceLineSettings,
        bindBasicDrawingSettings: _bindBasicDrawingSettings,
        bindArrowSettings: _bindArrowSettings,
        bindFibSettings: _bindFibSettings,
        bindFibGenericSettings: _bindFibGenericSettings,
        bindLabelSettings: _bindLabelSettings,
        bindHighLowLabelsSettings: _bindHighLowLabelsSettings,
        bindRegressionChannelSettings: _bindRegressionChannelSettings,
        updateLineSettings: _updateLineSettings,
        updateBasicDrawingSettings: _updateBasicDrawingSettings,
        updateArrowSettings: _updateArrowSettings,
        updateFibSettings: _updateFibSettings,
        updateLabelSettings: _updateLabelSettings,
        updateHighLowLabelsSettings: _updateHighLowLabelsSettings,
        updateRegressionChannelSettings: _updateRegressionChannelSettings,
        getDrawingToolBarHTML: _getDrawingToolBarHTML,
        getfavoriteToolBarHTML: _getfavoriteToolBarHTML,
        getDrawing: _getDrawing,
        getBrushSettings: _getBrushSettings,
        getBrushQuickSettings: _getBrushQuickSettings,
        updateBrushSettings: _updateBrushSettings,
        getXabcdSettings: _getXabcdSettings,
        getXabcdQuickSettings: _getXabcdQuickSettings,
        updateXabcdSettings: _updateXabcdSettings,
        bindXabcdSettings :_bindXabcdSettings,
        updateAbcdSettings:  _updateAbcdSettings,
        getAbcdSettings: _getAbcdSettings,
        getAbcdQuickSettings: _getAbcdQuickSettings,
        updatePolylineSettings:  _updatePolylineSettings,
        getPolylineSettings: _getPolylineSettings,
        getPolylineQuickSettings: _getPolylineQuickSettings,
        updateElliotWaveSettings:  _updateElliotWaveSettings,
        getElliotWaveSettings: _getElliotWaveSettings,
        getElliotWaveQuickSettings: _getElliotWaveQuickSettings,
        bindElliotWaveSettings: _bindElliotWaveSettings,
        bindAbcdSettings: _bindAbcdSettings,
        getQuickSettingsPopupHTML: _getQuickSettingsPopupHTML,
        getLineQuickSettings: _getLineQuickSettings,
        bindQuickSettingsPopup: _bindQuickSettingsPopup,
        getPositionsSettings: _getPositionsSettings,
        getPositionsQuickSettings: _getPositionsQuickSettings,
        bindPositionsSettings: _bindPositionsSettings,
        updatePositionsSettings: _updatePositionsSettings,
        bindPolylineSettings: _bindPolylineSettings,
        updatePriceLineSettings: _updatePriceLineSettings,
        getTrendChannelSettings: _getTrendChannelSettings,
        getTrendChannelQuickSettings: _getTrendChannelQuickSettings,
        bindTrendChannelSettings: _bindTrendChannelSettings,
        updateTrendChannelSettings: _updateTrendChannelSettings,
        updateGenericFibSettings: _updateGenericFibSettings,
        getVolumeProfileSettings: _getVolumeProfileSettings,
        bindVolumeProfileSettings: _bindVolumeProfileSettings,
        updateVolumeProfileSettings: _updateVolumeProfileSettings,
        getAndrewsPitchForkSettings: _getAndrewsPitchForkSettings,
        bindAndrewsPitchForkSettings: _bindAndrewsPitchForkSettings,
        updateAndrewsPitchForkSettings: _updateAndrewsPitchForkSettings,
        getFavoriteToggleElement: _getFavoriteToggleElement
    }
})(jQuery, infChart);
