/**
 * Created by dushani on 8/26/15.
 * This section contains the utility methods which are used by chart
 */

window.infChart = window.infChart || {};

infChart.util = (function ($, Highcharts, infChart) {

    Array.prototype.infMin = function (key) {
        var hasKey = key != undefined;
        var i, min = hasKey ? this[0][key] : this[0];
        for (i = 0; i < this.length; i++) {
            var value = hasKey ? this[i][key] : this[i];
            min = ( min < value ) ? min : value;
        }
        return min;
    };

    Array.prototype.infMax = function (key) {
        var hasKey = key != undefined;
        var i, max = hasKey ? this[0][key] : this[0];
        for (i = 0; i < this.length; i++) {

            var value = hasKey ? this[i][key] : this[i];
            max = ( max > value ) ? max : value;
        }
        return max;
    };

    // Removes an element from an array.
    // String value: the value to search and remove.
    // return: an array with the removed element; false otherwise.
    Array.prototype.infRemove = function (value) {
        var idx = this.indexOf(value);
        if (idx != -1) {
            return this.splice(idx, 1); // The second parameter is the number of elements to remove.
        }
        return false;
    };

    // Check whether given search values contains the elements of the array
    // String value: the value to search.
    // return:
    Array.prototype.infContainsItemsIn = function (value) {
        var i;
        for (i = 0; i < this.length; i++) {
            if( (typeof this[i] == "string") && value.indexOf(this[i])>=0){
                return true;
            }
        }
        return false
    };

    /**
     * Define isArray on array object if not defined
     */
    if (!Array.isArray) {
        Array.isArray = function (arg) {
            return Object.prototype.toString.call(arg) === '[object Array]';
        };
    }

    if (!String.replaceAll) {
        String.prototype.replaceAll = function (search, replacement) {
            var target = this;
            return target.replace(new RegExp(search, 'g'), replacement);
        };
    }

    if (!Array.xPush) {
        Array.prototype.xPush = function (element) {
            this[this.length] = element;
        };
    }

    //region extending Element.prototype

    if (!Element.xAppend) {
        Element.prototype.xAppend = function (html) {
            this.innerHTML += html;
        }
    }

    if (!Element.xRemoveChild) {
        Element.prototype.xRemoveChild = function (element) {
            element && this.removeChild(element);
        }
    }

    if (!Element.xHtml) {
        Element.prototype.xHtml = function (html) {
            this.innerHTML = html;
        }
    }
    if (!Element.xAddClass) {
        Element.prototype.xAddClass = function (cls) {
            var clsArr = this.className.split(" "),
                newClsArr = cls && cls.split(" ");

            if(newClsArr.length) {
                for(var i= 0, iLen = newClsArr.length; i < iLen; i++) {
                    if(clsArr.indexOf(newClsArr[i]) === -1 ) {
                        this.className += " " + newClsArr[i];
                    }
                }
            }
        }
    }
    if (!Element.xRemoveClass) {
        Element.prototype.xRemoveClass = function (cls) {
            var clsArr = this.className.split(" ");
            clsArr.infRemove(cls);
            this.className = clsArr.join(" ");
        }
    }

    if (!Element.xIsTextField) {
        /**
         * Determine whether the element is a text input
         * @returns {boolean} text input or not
         */
        Element.prototype.xIsTextField = function () {
            return (this.tagName === 'INPUT' && this.type === 'text');
        };
    }

    if (!Element.xGetSelectedText) {
        /**
         * Returns the selected text of a text input
         * @returns {string} selected text
         */
        Element.prototype.xGetSelectedText = function () {
            if (this.xIsTextField() && this.selectionStart != this.selectionEnd) {
                return this.value.substr(this.selectionStart, this.selectionEnd - this.selectionStart);
            }
        };
    }


    //endregion

    // region common utility methods

    /**
     * Check whether givin object is empty
     * @param str
     * @returns {boolean}
     * @private
     */
    var _isEmpty = function (str) {
        var empty = false;
        if(typeof str === 'undefined' || str === null){
            empty = true;
        }else{
            if(typeof str === 'object' && Object.keys(str).length === 0){
                empty = true;
            }else if(typeof str === 'array' && str.length === 0){
                empty = true;
            }else if(typeof str === 'string' && str.length === 0){
                empty = true;
            }
        }
        return empty;
    };

    /**
     * Log Exceptions
     * @param exception
     * @private
     */
    var _handleException = function (exception) {
        _console.error(exception);
    };

    var _extend = function (parent, child) {
        child.prototype = new parent();
        child.constructor = child;
    };

    /**
     * Iterate over an array or object using a for loop but it behaves like a foreEach
     * @param array
     * @param callback
     * @private
     */
    var _forEach = function (array, callback, startIdx) {
        var i,
            iLen;

        startIdx = startIdx || 0;

        if (Array.isArray(array)) {
            for (i = startIdx, iLen = array.length; i < iLen; i++) {
                if(callback.call(array, i, array[i])){
                    break;
                }
            }
        } else if (typeof array === 'object') {
            var keys = Object.keys(array),
                kLen = keys.length;
            for (i = 0; i < kLen; i++) {
                if(callback.call(array, keys[i], array[keys[i]])){
                    break;
                }
            }
        }
    };

    /**
     * check whether series should be displayed in legend
     * @param options series options
     * @returns {boolean|*}
     * @private
     */
    var _isLegendAvailable = function (options) {
        return !options.hideLegend && (
                options.id === 'c0' || options.infType === 'compare' || (options.infType === 'indicator' && _isSeriesInBaseAxis(options.yAxis))
            );
    };

    /**
     * check whether indicator is drawn in the same axis as base symbol
     * @param yAxisId y axis name
     * @returns {boolean}
     * @private
     */
    var _isSeriesInBaseAxis = function (yAxisId) {
        return ( yAxisId === '#0' || yAxisId === '#1');
    };

    /**
     * check whether indicator is drawn in the parallel axis as base symbol
     * @param yAxis y axis
     * @returns {boolean}
     * @private
     */
    var _isSeriesParallelToBaseAxis = function (yAxis) {
        return (yAxis && yAxis.options.infType == "parallelToBase");
    };

    ///**
    // * get description to show in legend
    // * @param options series options
    // * @returns {*}
    // * @private
    // */
    //var _getLegendTitle = function (options) {
    //    var title;
    //    if (options.infType === 'indicator') {
    //        title = infChart.util.getIndicatorDescLabel(options.name);
    //    } else {
    //        title = options.title;
    //    }
    //    return title;
    //};

    /**
     * calculates change pct with regard to 1st point
     * @param dataArray
     * @returns {Array}
     * @private
     */
    var _calculateChange = function (dataArray) {
        var chgArray = [], prev;
        _forEach(dataArray, function (index, val) {
            if (prev) {
                chgArray.xPush((val / prev - 1) * 100);
                //prev = val;
            } else {
                prev = val;
                chgArray.xPush(0);
            }
        });
        return chgArray;
    };

    // Converts an RGB string to a hex string
    var _rgbString2hex = function (rgb, opacity) {
        var colorString = rgb,
            colorsOnly = colorString && colorString.substring(colorString.indexOf('(') + 1, colorString.lastIndexOf(')')).split(/,\s*/),
            components = {};
        if (colorsOnly && colorsOnly.length >= 2) {
            components.red = colorsOnly[0];
            components.green = colorsOnly[1];
            components.blue = colorsOnly[2];
            components.opacity = colorsOnly[3] ? colorsOnly[3] : opacity ? opacity : 1;
            components.hex = '#' +
                ('0' + parseInt(components.red, 10).toString(16)).slice(-2) +
                ('0' + parseInt(components.green, 10).toString(16)).slice(-2) +
                ('0' + parseInt(components.blue, 10).toString(16)).slice(-2);
        } else {
            components.hex = rgb;
            components.opacity = opacity ? opacity : 1;
        }
        return components;
    };

    /**
     * bind color picker
     * @param targetEls
     * @param {string} color default color
     * @param {function} onSubmit
     * @param {HTMLDOMElement} container element of color palette witch is using for view port calculations
     * @private
     */
    var _bindColorPicker = function (targetEls, color, onSubmit, container) {
        var defaultColor = color;
        $.each(targetEls, function (i, el) {
            var _slef = this;
            var colorPickEl = $(el);
            defaultColor = (colorPickEl.val().trim() != "") ? colorPickEl.val() : defaultColor;
            var opacityEnabled = colorPickEl.attr("opacity") != "false";
            defaultColor = _rgbString2hex(defaultColor, colorPickEl.attr("data-opacity"));
            colorPickEl.val(defaultColor.hex);

            if (defaultColor.opacity) {
                colorPickEl.attr("data-opacity", defaultColor.opacity);
            }

            var position = colorPickEl.data('position');

            if(!position) {
                position = 'bottom left';
                colorPickEl.data('position', position);
            }

            if (colorPickEl) {
                colorPickEl.mainColorPanel({
                    position: position,
                    opacityEnabled: opacityEnabled,
                    show: function () {

                        container = container ? container : $(this).closest("[color-picker-container]");
                        var colorPaletteWrapper = $(this).closest("div.minicolors");
                        var colorPanel = colorPaletteWrapper.find('[rel="colorPanel"]');
                        var currentPosition = $(this).data("position");
                        var currentVerticalPosition = currentPosition.split(" ")[0];
                        var currentHorizontalPosition = currentPosition.split(" ")[1];
                        var isDisableDrawingSettingsPanel = $(this).closest("div[data-inf-drawing-settings-pop-up]").length > 0;
                        var isQuickSettingsPanel = $(this).closest("div[data-inf-quick-drawing-settings-pop-up]").length > 0;
                        var isChartSettingsPanel = $(this).closest('div[inf-pnl=tb-right]').length > 0;

                        if (!isDisableDrawingSettingsPanel && container.length > 0 && !_isWithinElement(container, colorPanel)) {
                            var newVerticalPosition = currentVerticalPosition === "top" ? "bottom" : "top";

                            if (!(newVerticalPosition === "top" && container.offset().top > (colorPaletteWrapper.offset().top - colorPanel.height()))) { // check whether new top is greater than container top
                                colorPaletteWrapper.removeClass("minicolors-position-" + currentVerticalPosition).addClass("minicolors-position-" + newVerticalPosition);
                                $(this).data("position", currentPosition.replace(currentVerticalPosition, newVerticalPosition));
                            }
                        }

                        colorPaletteWrapper.removeClass("minicolors-position-" + currentHorizontalPosition).addClass("minicolors-position-" + "left");
                        $(this).data("position", currentPosition.replace(currentHorizontalPosition, 'left'));
                        currentHorizontalPosition = "left";

                        if (isChartSettingsPanel) {
                            colorPanel[0].style.position = 'fixed';
                        }
                        _positionPresetColorPanel.call(this, isDisableDrawingSettingsPanel, isQuickSettingsPanel, currentVerticalPosition, currentHorizontalPosition, colorPanel, isChartSettingsPanel);
                    },
                    change: function (value, opacity) {
                        if ($(this).data('minicolors-initialized')) {
                            onSubmit.call(this, $(this).mainColorPanel('rgbaString'), value, opacity);
                        }
                    }
                });
            }            
        });
    };


    let _positionPresetColorPanel = function (isDisableDrawingSettingsPanel, isQuickSettingsPanel, currentVerticalPosition, currentHorizontalPosition, colorPanel, isChartSettingsPanel) {
        if (isDisableDrawingSettingsPanel || isQuickSettingsPanel || isChartSettingsPanel) {
                        var elementOffset = isQuickSettingsPanel ? $(this).parent().closest('li').offset() : $(this).parent().offset();
                        var elementWidth = isQuickSettingsPanel ? $(this).parent().closest('li').outerWidth(true) : $(this).parent().outerWidth(true);
                        var elementHeight = isQuickSettingsPanel ? $(this).parent().closest('li').outerHeight(true) : $(this).parent().outerHeight(true);
                        var uiSwatchPanelInner = colorPanel.find('.ui-swatch-panel__inner');
                        var chartContainer, chartHolder;
                        
                        if (isChartSettingsPanel) {
                            chartContainer = $(this).closest('div[inf-pnl=tb-right]').parent().find('div[inf-container=highchartContainer]');
                            chartHolder = $(this).closest('div[inf-pnl=tb-right]').parent().find('div[inf-container="chart_holder"]');
                        } else {
                            chartContainer = $(this).closest('div[inf-container=highchartContainer]');
                            chartHolder = $(this).closest('div[inf-container="chart_holder"]');
                        }
                        
                        
                        if (isChartSettingsPanel) {
                            colorPanel[0].style.position = 'fixed';
                        }
                        
                        if (currentVerticalPosition === "top" && !isChartSettingsPanel) {
                            elementOffset.top = isQuickSettingsPanel ? elementOffset.top + elementHeight : elementOffset.top + elementHeight;
                        } else {
                            elementOffset.top = elementOffset.top + elementHeight;

                        }

                        if (currentHorizontalPosition === "right" && !isChartSettingsPanel) {
                            elementOffset.left = elementOffset.left - $(colorPanel).outerWidth();
                        } else if (isChartSettingsPanel) {
                            elementOffset.left = elementOffset.left - $(colorPanel).outerWidth() + elementWidth;
                        } else {
                            elementOffset.left = isQuickSettingsPanel ? elementOffset.left : elementOffset.left + elementWidth;
                        }

                        if (!isChartSettingsPanel && elementOffset.left + $(colorPanel).outerWidth(true)  > chartContainer.offset().left + chartContainer.outerWidth(true) ) {
                            elementOffset.left = $(this).parent().offset().left - $(colorPanel).outerWidth(true);
                        }

                        if (elementOffset.top + $(colorPanel).outerHeight(true)  > chartContainer.offset().top + chartContainer.outerHeight(true)) { 
                            elementOffset.top = elementOffset.top - $(colorPanel).outerHeight(true) - elementHeight;
                        }
                        
                        if (elementOffset.top < chartHolder.offset().top) {
                            elementOffset.top = chartHolder.offset().top;
                        } 
                        
                         if(!isChartSettingsPanel && (colorPanel).outerHeight(true) > chartContainer.outerHeight(true)) {
                            elementOffset.top = chartHolder.offset().top;
                            colorPanel.css('height', chartContainer.outerHeight(true) );
                            uiSwatchPanelInner.css('height', '100%');
                        } else {
                            colorPanel.css('height', '');
                            uiSwatchPanelInner.css('height', '');
                        }

                        $(this).parent().find('[rel="colorPanel"]').css({position: "fixed"}).offset(elementOffset);
                    }
    }

    var _isSafari = function () {
        const userAgent = navigator.userAgent.toLowerCase();
        return userAgent.includes('safari') && !userAgent.includes('chrome');
      }



    /**
     * hide open color pickers
     * @param {object} container - popup container
     */
    var _hideColorPicker = function (container) {
        var openMiniColors = $(container).find("div.minicolors-focus");
        if(openMiniColors.length > 0) {
            $.each(openMiniColors, function (k, colorPanel) {
                $(colorPanel).find('input.minicolors-input').minicolors("hide");
            });
        }
    };

    /**
     * Checks whether the subject element is within the container element
     * @param containerElement the element that contains subject
     * @param subjectElement the element that need to show inside container
     * @returns {boolean} is subject element within container element
     * @private
     */
    var _isWithinElement = function (containerElement, subjectElement) {
        var elementTop = subjectElement.offset().top;
        var elementBottom = elementTop + subjectElement.outerHeight();

        var viewportTop = containerElement.offset().top;
        var viewportBottom = viewportTop + containerElement.height();

        return elementTop > viewportTop && elementBottom < viewportBottom;
    };

    var _binaryIndexOf = function (arr, searchValueKey, searchValue) {

        var minIndex = 0;
        var maxIndex = arr.length - 1;
        var currentIndex;
        var currentElement;
        var resultIndex,
            searchValTemp;

        while (minIndex <= maxIndex) {
            resultIndex = currentIndex = (minIndex + maxIndex) / 2 | 0;
            currentElement = arr[currentIndex];
            searchValTemp = searchValueKey != undefined && searchValueKey != null? currentElement[searchValueKey] : currentElement;

            if (searchValTemp < searchValue) {
                minIndex = currentIndex + 1;
            } else if (searchValTemp > searchValue) {
                maxIndex = currentIndex - 1;
            } else {
                return currentIndex;
            }
        }

        return ~maxIndex;
    };

    //
    //var _binarySearch = function (arr, searchValueKey, searchValue) {
    //
    //    var minIndex = 0;
    //    var maxIndex = arr.length - 1;
    //    var currentIndex;
    //    var currentElement;
    //    var resultIndex;
    //
    //    while (minIndex <= maxIndex) {
    //        resultIndex = currentIndex = (minIndex + maxIndex) / 2 | 0;
    //        currentElement = arr[currentIndex];
    //
    //        if (currentElement[searchValueKey] < searchValue) {
    //            minIndex = currentIndex + 1;
    //        }
    //        else if (currentElement[searchValueKey] > searchValue) {
    //            maxIndex = currentIndex - 1;
    //        }
    //        else {
    //            return currentIndex;
    //        }
    //    }
    //
    //    return ~maxIndex;
    //};

    var _getDateStringFromTime = function (utcTime, lastUnit) {
        var date = new Date(utcTime),
            month = date.getUTCMonth() + 1,
            day = date.getUTCDate(),
            hour = date.getUTCHours(),
            min = date.getUTCMinutes();

        switch (lastUnit) {
            case 'h' :
                return (date.getFullYear() + "-" + ((month < 10) ? "0" + month : month) + "-" + ((day < 10) ? "0" + day : day)) + "-" +
                    ((hour < 10) ? "0" + hour : hour) + "-00-00";

            case 'm':
                return (date.getFullYear() + "-" + ((month < 10) ? "0" + month : month) + "-" + ((day < 10) ? "0" + day : day)) + "-" +
                    ((hour < 10) ? "0" + hour : hour) + "-" + ((min < 10) ? "0" + min : min) + "-00";

            case 'd':
            default :
                return (date.getFullYear() + "-" + ((month < 10) ? "0" + month : month) + "-" + ((day < 10) ? "0" + day : day)) + "-" +
                    "00-00-00";

        }
    };

    var _getDateAndTimeStringFromTime = function (utcTime) {
        var date = new Date(utcTime);
        var month = date.getUTCMonth() + 1;
        var day = date.getUTCDate();
        var hour = date.getUTCHours();
        var min = date.getUTCMinutes();
        var sec = date.getUTCSeconds();

        return (date.getFullYear() + "-" + ((month < 10) ? "0" + month : month) + "-" + ((day < 10) ? "0" + day : day)) +
            ((hour < 10) ? "0" + hour : hour) + ((min < 10) ? "0" + min : min) + ((sec < 10) ? "0" + sec : sec);
    };

    var _bindDragEvents = function (chart, dragItem, stepFunction, stop, dragFunction) {
        var self = this;

        function drag(e) {
            if (e.button !== 2) {   // ignore right click - cannot use an event since mousedown event is fired first
                e.preventDefault();
                e.stopPropagation();

                // $(document).bind({
                //     'mousemove.dragItem touchmove.dragItem': step,
                //     'mouseup.dragItem touchend.dragItem': drop
                // });

                if(dragFunction){
                    chart.pointer.normalize(e);
                    dragFunction(e);
                }

                _bindEvent(chart.container, 'mousemove', step);
                _bindEvent(chart.container, 'mouseup', drop);
                _bindEvent(chart.container, 'mouseleave', drop);
            }
        }

        function step(e) {
            if (stepFunction) {
                chart.pointer.normalize(e);
                stepFunction(e);
            }
        }

        function drop(e) {
            if (stop) {
                chart.pointer.normalize(e);
                stop(e);
            }
            _unbindEvent(chart.container, 'mousemove', step);
            _unbindEvent(chart.container, 'mouseup', drop);
            _unbindEvent(chart.container, 'mouseleave', drop);
            // $(document).unbind('.dragItem');
        }
        _bindEvent(dragItem.element, 'mousedown', drag);
        // dragItem.on('touchstart', drag);
    };

    var _dragFix = function (chart, event, ui) {
        var zoomScale = chart.settings.registeredMethods.afterCssScaling ? chart.settings.registeredMethods.afterCssScaling().scaleX: 1;
        var changeLeft = ui.position.left - ui.originalPosition.left; // find change in left
        var newLeft = ui.originalPosition.left + changeLeft / zoomScale; // adjust new left by our zoomScale
        var changeTop = ui.position.top - ui.originalPosition.top; // find change in top
        var newTop = ui.originalPosition.top + changeTop / zoomScale; // adjust new top by our zoomScale
        ui.position.left = newLeft;
        ui.position.top = newTop;
    };

    // endregion

    //region authentication

    /**
     * Athenticate User
     * @param user
     * @param password
     * @returns {string}
     * @private
     */
    var _authenticate = function (user, password) {
        // TODO :: should do a proper authentication and return the token
        var tok = user + ':' + password;
        return btoa(tok);
    };

    var _generateUUID = function () {
        var d = new Date().getTime();
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
    };

    var _getUserName = function () {
        return 'USER';
    };

    // endregion

    // region language

    ///**
    // * get indicator description using indicator type
    // * todo :: use _getLabel
    // * @param type
    // * @returns {*}
    // * @private
    // */
    //var _getIndicatorDescLabel = function (type) {
    //    return "label.indicatorDesc." + type;
    //};

    var _getThousandSeparator = function () {
        var langOpt = Highcharts.getOptions().lang;
        return langOpt && langOpt.thousandsSep ? langOpt.thousandsSep : ",";
    };

    /**
     * Returns the reference name for the legend value element
     * @param series
     * @returns {string}
     * @private
     */
    var _legendReference = function (series) {
        if (series && series.options && series.options.id) {
            return 'lg-val-' + series.options.id;
        }
    };

    //endregion

    //region storage

    var cachedData = {};

    var _saveData = function (key, value) {
        cachedData[key] = value;
        console.log("#### chart save local storage data");
        try {
            localStorage.setItem(key, JSON.stringify(value));
        }
        catch (ex) {
            console.warn(ex);
        }
    };

    var _getData = function (key) {
        var value = cachedData[key];
        try {
            if (!value) {
                console.log("#### chart get local storage data");
                value = JSON.parse(localStorage.getItem(key));
                cachedData[key] = value;
            }
        }
        catch (ex) {
            console.warn(ex);
        }
        return value;
    };

    var _hasAllPatterns = function (key, ptn) {
        var foundPattern = false;
        if (Array.isArray(ptn)) {
            for (var k = 0; k < ptn.length; k++) {
                if (key.indexOf(ptn) < 0) {
                    foundPattern = false;
                    break;
                } else {
                    foundPattern = true;
                }
            }
        } else {
            foundPattern = key.indexOf(ptn) >= 0;
        }
        return foundPattern;
    };

    var _hasPattern = function (key, ptn) {
        var foundPattern = false;
        if (Array.isArray(ptn)) {
            for (var k = 0; k < ptn.length; k++) {
                if (key.indexOf(ptn) >= 0) {
                    foundPattern = true;
                    break;
                }
            }
        } else {
            foundPattern = key.indexOf(ptn) >= 0;
        }
        return foundPattern;
    };

    var _removeData = function (pattern, patternToIgnore) {

        for (var i = localStorage.length - 1; i >= 0; i--) {
            var key = localStorage.key(i);
            if (_hasAllPatterns(key, pattern) && (!patternToIgnore || (patternToIgnore && !_hasPattern(key, patternToIgnore) ))) {
                if (cachedData[key]) {
                    delete cachedData[key];
                }
                localStorage.removeItem(key);
            }

        }
    };

    var _removeDataByKey = function (key) {

        if (cachedData[key]) {
            delete cachedData[key];
        }

        localStorage.removeItem(key);
    };

    //endregion

    var colorIndexMap = {};

    var _getColorGradients = function(){
        return Highcharts.theme && Highcharts.theme.colorGradients;
    };

    var _getDefaultDownColor = function(){
        return Highcharts.theme && Highcharts.theme.red && Highcharts.theme.red[0] || '#f00';
    };

    var _getDefaultUpColor = function(){
        return Highcharts.theme && Highcharts.theme.green && Highcharts.theme.green[0] || '#0f0';
    };

    var _getSeriesColors = function(){
        return Highcharts.theme && Highcharts.theme.seriesColorMap || ["#fbf201", "#00aeff", "#ff15af", "#8aff00", "#9f37ff", "#FFA519"];
    };

    var _getNextSeriesColor = function(chartId){
        if(!colorIndexMap.hasOwnProperty(chartId)){
            colorIndexMap[chartId] = 0;
        }
        var colors = _getSeriesColors();

        var colorMapLength = colors.length;
        var indexOfColorMap = colorIndexMap[chartId] % colorMapLength;
        colorIndexMap[chartId]++;
        return colors[indexOfColorMap];
    };

    var _sendAjax = function (url, dataType, onSuccess, onError, scope) {
        $.ajax({
            url: url,
            dataType: dataType,
            context: scope,
            beforeSend: function (xhr) {
                if (window.keycloak) {
                    xhr.setRequestHeader('Authorization', 'Bearer ' + window.keycloak.token);
                }
            },
            success: function (dataObj) {
                onSuccess.call(scope, dataObj);
            },
            error: function (xhr, ajaxOptions, thrownError) {
                _console.log('error : ' + thrownError);
                onError.call(scope, []);
            }
        });
    };

    var _num2Log = function (num) {
        if (num !== 0) {
            return Math.log(num) / Math.LN10;
        }
        return 0;
    };

    var _log2Num = function (num) {
        return Math.pow(10, num);
    };

    var _isDOMNode = function (v) {
        if (v === null) return false;
        if (typeof v !== 'object') return false;
        if (!('nodeName' in v)) return false;
        var nn = v.nodeName;
        try {
            v.nodeName = 'is readonly?';
        }
        catch (e) {
            return true;
        }
        if (v.nodeName === nn) return true;
        v.nodeName = nn;
        return false;
    };
    /* TODO :: find out a proper way of implementing a common method to do merge and $.extend in one method
     var _mergeWrapping = function( dst, propetry, dstFunction, mergeListener){
     dst[propetry] = function() {
     var result = dstFunction.call(this, arguments);
     return mergeListener.call(this, arguments, result);
     }
     };

     var _merge = function () {
     // _mergeRecursive does the actual job with two arguments.
     var _mergeRecursive = function (dst, src) {
     if (_isDOMNode(src) || typeof src !== 'object' || src === null) {
     return dst;
     }

     for (var p in src) {

     ////my added bit here - [SB]
     //        if ($.isArray(src[p])){
     //            $.merge(dst[p],src[p]);
     //            var dupes = {},
     //                singles = [];
     //            $.each(  dst[p], function(i, el) {
     //                if ((dupes[el.name] > -1) &&  (el.name)) {
     //                    $.extend(singles[dupes[el.name]],el);
     //                }else{
     //                    if (el.name ){
     //                        dupes[el.name] = i;
     //                    }
     //                    singles.push(el);
     //                }
     //            });
     //            dst[p] = singles;
     //            continue;
     //        }


     //the rest is original - [SB]

     if (!src.hasOwnProperty(p)) continue;
     if (src[p] === undefined) continue;
     if (p == "infmerge") continue;

     if ( typeof src[p] !== 'object' || src[p] === null || src[p].constructor === Array ) {
     if ( ( !dst.infmerge || !dst.infmerge.avoidReplace || dst.infmerge.avoidReplace.indexOf(p) < 0) /!*&& src.skipWrap && src.skipWrap.indexOf(p)>=0*!/){
     dst[p] = src[p]
     } else if(typeof dst[p] == 'function'){
     if( typeof src[p] == "function"){
     if(!dst.infmerge){
     dst["result"] = { };
     }

     if(!dst.infmerge.listeners) {
     dst.infmerge.listeners = src[p];
     _mergeWrapping(dst, p, dst[p], src[p]);
     } else {
     dst.infmerge.listeners = src[p];
     }

     } else {
     dst[p] = src[p];
     }

     }
     }
     else if (typeof dst[p] !== 'object' || dst[p] === null) {
     dst[p] = _mergeRecursive(src[p].constructor === Array ? [] : {}, src[p]);
     } else {
     _mergeRecursive(dst[p], src[p]);
     }
     };
     return dst;
     };

     // Loop through arguments and merge them into the first argument.
     var out = arguments[0];
     if (typeof out !== 'object' || out === null) return out;
     for (var i = 1, il = arguments.length; i < il; i++) {
     _mergeRecursive(out, arguments[i]);
     }
     return out;
     };*/

    var _merge = function () {
        // _mergeRecursive does the actual job with two arguments.
        var _mergeRecursive = function (dst, src) {
            if (_isDOMNode(src) || typeof src !== 'object' || src === null) {
                return dst;
            }

            for (var p in src) {

                ////my added bit here - [SB]
                //        if ($.isArray(src[p])){
                //            $.merge(dst[p],src[p]);
                //            var dupes = {},
                //                singles = [];
                //            $.each(  dst[p], function(i, el) {
                //                if ((dupes[el.name] > -1) &&  (el.name)) {
                //                    $.extend(singles[dupes[el.name]],el);
                //                }else{
                //                    if (el.name ){
                //                        dupes[el.name] = i;
                //                    }
                //                    singles.push(el);
                //                }
                //            });
                //            dst[p] = singles;
                //            continue;
                //        }


                //the rest is original - [SB]


                if (!src.hasOwnProperty(p)) continue;
                if (src[p] === undefined) continue;
                if (typeof src[p] !== 'object' || src[p] === null || src[p].constructor === Array) {
                    dst[p] = src[p];
                }
                else if (typeof dst[p] !== 'object' || dst[p] === null) {
                    dst[p] = _mergeRecursive(src[p].constructor === Array ? [] : {}, src[p]);
                } else if (dst[p].constructor === Array && src[p].constructor !== Array) {
                    dst[p] = src[p];
                } else {
                    _mergeRecursive(dst[p], src[p]);
                }
            }

            return dst;
        };

        // Loop through arguments and merge them into the first argument.
        var out = arguments[0];
        if (typeof out !== 'object' || out === null) return out;
        for (var i = 1, il = arguments.length; i < il; i++) {
            _mergeRecursive(out, arguments[i]);
        }
        return out;
    };

    var _isToday = function (dateTime) {
        var today = new Date();
        return (dateTime && dateTime.getFullYear() == today.getFullYear() && dateTime.getMonth() == today.getMonth() && dateTime.getDate() == today.getDate());
    };

    var _getLastDayOfWeek = function (time, onlyPastOrCurrentTime) {
        var date = new Date(time);
        var first = date.getDate() - date.getDay();
        /* First day is the day of the month - the day of the week */
        var last = first + 6;
        /* last day is the first day + 6 */

        date.setDate(last);
        var currentDate = new Date();
        if (onlyPastOrCurrentTime && date.getTime() > currentDate.getTime()) {
            date = currentDate;
        }
        return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
    };

    var _getFirstDayOfWeek = function (time) {
        var date = new Date(time);
        var first = date.getDate() - date.getDay() + 1;
        date.setDate(first);
        return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
    };

    var _getLastDayOfMonth = function (time, onlyPastOrCurrentTime) {
        var date = new Date(time);
        date.setDate(1);
        date.setMonth(date.getMonth() + 1);
        date.setDate(date.getDate() - 1);
        var currentDate = new Date();
        if (onlyPastOrCurrentTime && date.getTime() > currentDate.getTime()) {
            date = currentDate;
        }
        return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
    };

    var _getFirstDayOfMonth = function (time) {
        var date = new Date(time);
        date.setDate(1);
        date.setMonth(date.getMonth());
        return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
    };

    var _getLastDayOfYear = function (time, onlyPastOrCurrentTime) {
        var date = new Date(time);
        date.setMonth(11);
        date.setDate(31);
        var currentDate = new Date();
        if ( onlyPastOrCurrentTime && date.getTime() > currentDate.getTime()) {
            date = currentDate;
        }
        return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
    };

    var _getFirstDayOfYear = function (time) {
        var date = new Date(time);
        date.setMonth(0);
        date.setDate(1);
        return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
    };

    var _setPopupLocation = function (popup, position) {

        var left = position.left;
        var top = position.top;
        popup.attr('top', top);
        popup.attr('left', left);

    };

    var _getPopupLocation = function (chartContainerId, popup) {
        var top = popup.attr('top');
        var left = popup.attr('left');
        var container = $("#" + chartContainerId);
        if ((top == undefined || left == undefined) && container) {
            var popupWidth = popup.width();
            var popupHeight = popup.width();
            var containerWidth = container.width();
            var containerHeight = container.height();
            left = (left == undefined) ? (containerWidth - popupWidth) > 200 ? 200 : (containerWidth - popupWidth) / 2 : left;
            top = (top == undefined) ? (containerHeight - popupHeight) > 200 ? 200 : (containerHeight - popupHeight) / 2 : top;

        } else {
            top = (top == undefined ) ? 200 : parseInt(top);
            left = (left == undefined ) ? 200 : parseInt(left);
        }

        return {
            'top': top,
            'left': left
        }
    };

    var _console = {

        log: function (msg) {
            if (typeof console != "undefined" && (typeof window.logMode === 'undefined' || window.logMode == "debug")) {
                console.log(msg);
            }
        },
        error: function (msg, ex) {
            if (typeof console != "undefined" && (typeof window.logMode === 'undefined' || window.logMode == "debug")) {
                console.error(msg);
                if (ex) {
                    console.error(ex);
                }
            }
        },
        info: function (msg) {
            if (typeof console != "undefined" && (typeof window.logMode === 'undefined' || window.logMode == "debug")) {
                console.info(msg);
            }
        },
        debug: function (proto, msg) {
            console.debug(((proto.name && proto.name()) || "") + ">" + msg);
        }
    };

    var _getNavigatorHeight = function (chartHeight, config) {
        var navH = config.navigator.height,
            scrollH = (navH && navH > config.navigator.infMinHeight && navH < config.navigator.infMaxHeight) ? navH : chartHeight * 0.1;
        scrollH = Math.min(scrollH, config.navigator.infMaxHeight);
        scrollH = Math.max(scrollH, config.navigator.infMinHeight);
        return scrollH;
    };

    var _getColorFromColorObj = function (colorObj, type) {
        return (colorObj && colorObj.stops && colorObj.stops.length > 1) ? colorObj.stops[type == "up" ? 0 : 1][1] : colorObj;
    };

    /**
     * @ngdoc function
     * @name isIEBelow10
     * @description Checks whether current browser is IE and of version below 10
     */
    var _isIEBelow10 = function () {
        var myNav = navigator.userAgent.toLowerCase();
        return (myNav.indexOf('msie') != -1) ? parseInt(myNav.split('msie')[1]) < 10 : false;
    };

    /**
     * @ngdoc function
     * @name isIEBelow10
     * @description Checks whether current browser is IE and of version below 10
     */
    var _isIE = function () {
        var myNav = navigator.userAgent.toLowerCase();
        return (myNav.indexOf('msie') != -1 || (navigator.appName == "Netscape" && (!!navigator.userAgent.match(/Trident.*rv\:11\./) || (!!navigator.userAgent.match(/Edge/)))));
    };

    /**
     * @ngdoc function
     * @name isSafari
     * @description Checks whether current browser is Safari
     */
    var _isSafari = function () {
        var myNav = navigator.userAgent.toLowerCase();
        return (myNav.indexOf('safari') != -1 && myNav.indexOf('chrome') == -1);
    };

    /**
     * @ngdoc function
     * @name getIEVersion
     * @description Returns the version of IE browser
     * @returns {number}
     */
    var _getIEVersion = function () {
        var rv = -1; // Return value assumes failure.
        var myNav = navigator.userAgent.toLowerCase();
        if (myNav.indexOf('msie') != -1) {

            var ua = navigator.userAgent,
                re = new RegExp("msie ([0-9]{1,}[\\.0-9]{0,})");

            if (re.exec(ua) !== null) {
                rv = parseFloat(RegExp.$1);
            }
        }
        else if (navigator.appName == "Netscape" && !!navigator.userAgent.match(/Trident.*rv\:11\./)) {
            /// in IE 11 the navigator.appVersion says 'trident'
            /// in Edge the navigator.appVersion does not say trident
            if (navigator.appVersion.indexOf('Trident') === -1) rv = 12;
            else rv = 11;
        }

        return rv;
    };

    /**
     * Save given canvas as a blob
     * @param canvas
     * @param type
     * @private
     */
    var _saveCanvasAsBlob = function (canvas, type) {
        window.BlobBuilder = window.BlobBuilder || window.MSBlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder;
        canvas.toBlob = canvas.toBlob || canvas.msToBlob;
        window.navigator.saveBlob = window.navigator.saveBlob || window.navigator.msSaveBlob;

        if (window.BlobBuilder && canvas.toBlob && window.navigator.saveBlob) {
            var extensionlessFilename = "chart";
            var filename = extensionlessFilename + "." + type;
            var blobBuilderObject = new BlobBuilder(); // Create a blob builder object so that we can append content to it.

            blobBuilderObject.append(canvas.toBlob()); // Append the user's drawing in PNG format to the builder object.
            window.navigator.saveBlob(blobBuilderObject.getBlob(), filename); // Move the builder object content to a blob and save it to a file.
        }
    };

    ///**
    // * Check whether chart is in fullscreen mode or not
    // * @returns {*}
    // * @private
    // */
    //var _isFullscreenMode = function () {
    //    return window.fullScrn;//todo : remove this global variable
    //};

    /**
     * todo : refactor & move to structure
     * Display given message
     * @param chartId
     * @param msg
     * @param timeout
     * @private
     */
    var _showMessage = function (chartId, msg, timeout, title, width) {
        /*   var container = $('#' + chart.id).find("div[inf-container=msg_container]");
         var html = '<div id="myModal" class="modal fade" role="dialog">' +
         '<div class="modal-dialog">' +
         '<div class="modal-content chart-message-pop-up">' +
         '<div class="modal-header">' +
         '<button type="button" class="close" data-dismiss="modal">&times;</button>' +
         '<h4 class="modal-title">Message</h4>' +
         '</div>' +
         '<div class="drawing_popup_row">' +
         '<ol class="o_list ui-selectable">'+'</ol>' +
         '</div>' +
         '<div class="modal-body">' +
         '<p>'+msg+'</p>' +
         '</div>' +
         '<div class="modal-footer">' +
         '<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>' +
         '</div>' +
         '</div>' +
         '</div>' +
         '</div>';
         var fileActionPopup = $(html).appendTo(container);
         fileActionPopup.modal({'show': true, 'backdrop' : true});*/
        _createDialog(chartId + "_msg", '<p>' + msg + '</p>', true, true, title ? title : 'Message', true, true, true,
            ['<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>'], timeout, "", width);
    };

    /**
     * Create a dialog with given options
     * todo : refactor & move to structure
     * @param id
     * @param body
     * @param header
     * @param footer
     * @param title
     * @param close
     * @param backdrop
     * @param show
     * @param btns
     * @param timeout
     * @param wrapperCls
     * @param width
     * @param bodyCls
     * @private
     */
    var _createDialog = function (id, body, header, footer, title, close, backdrop, show, btns, timeout, wrapperCls, width, bodyCls) {
        var container = $(document.body);// $('#' + chart.id).find("div[inf-container=msg_container]");
        var popup = $('#' + id);
        if (popup && popup.length > 0) {
            popup.remove();
        }

        wrapperCls = wrapperCls ? wrapperCls : '';
        width = width ? 'width:' + width + 'px;' : '';
        bodyCls = bodyCls ? bodyCls : '';
        var html = '<div id="' + id + '" class="modal mobile-popup fade in solid-modal" role="dialog">' +
            '<div class="modal-dialog modal-sm"  style="' + width + '"> <div class="modal-content chart-message-pop-up' + wrapperCls + '">';
        if (header && typeof header != "string") {
            html += '<div class="modal-header">' +
                (close ? '<button type="button" class="close" data-dismiss="modal"><i class="icon ico-close"></i></button>' : '') +
                '<h4 class="modal-title">' + title + '</h4>' +
                '</div>';
        } else if (header) {
            html += '<div class="modal-header">' +
                header +
                '</div>';
        }
        html += '<div class="modal-body ' + bodyCls + '">' +
            body +
            '</div>';
        if (footer && typeof footer != "string") {
            html += '<div class="modal-footer">';
            if (btns && btns.length > 0) {
                btns.forEach(function (val) {
                    html += val;
                });
            }
            html += '</div>';
        } else if (footer) {
            html += '<div class="modal-footer">' +
                footer + '</div>';
        }

        html += '</div>' + '</div>' +
            '</div>';

        var fileActionPopup = $(html).appendTo(container);

        if (timeout && !isNaN(timeout)) {
            fileActionPopup.on('shown.bs.modal', function () {
                window.setTimeout(function () {
                    fileActionPopup.modal("hide");
                }, timeout);
            });
        }
        fileActionPopup.modal({'show': !!show, 'backdrop': !!backdrop});

        return fileActionPopup;
    };

    var _setCursor = function (container, cursorType) {
        $(container).removeClass(function (index, className) {
            if (className) {
                return (className.match(/(^|\s)cursor-\S+/g) || []).join(' ');
            } else {
                return ' ';
            }
        });
        var cls = 'cursor-default';
        switch (cursorType) {
            case 'block' :
                cls = 'cursor-block';
                break;
            case 'move' :
                cls = 'cursor-move';
                break;
            case 'del' :
                cls = 'cursor-del';
                break;
            default :
                break;
        }
        $(container).addClass(cls);
    };

    var _escapeSpecialCharacters = function (text) {
        return text.replace(/[!"#$%&'()*+,.\/:;<=>?@[\\\]^`{|}~]/g, "\\$&")
    };

    var _getRawValue = function (value) {
        value = value + "";
        if (value.indexOf('M') > 0) {
            returnVal = parseFloat(value.replaceAll(',', '')) * 1000000;
        } else {
            returnVal = value.replaceAll(',', '');
        }
        return returnVal = parseFloat(returnVal);
    };

    /**
     * search array of objects/arrays for given search value using binary search algorithm
     * @param arr
     * @param searchValue
     * @param objectKey
     * @returns {*}
     * @private
     */
    var _binarySearch = function (arr, searchValue, objectKey) {
        var mid = Math.floor(arr.length / 2);

        if (arr.length == 1) {
            return {
                val: arr[0],
                direction: arr[mid][objectKey] === searchValue ? 0 : arr[mid][objectKey] < searchValue ? +1 : -1
            };
        } else if (arr[mid][objectKey] === searchValue) {
            return {
                val: arr[mid],
                direction: arr[mid][objectKey] === searchValue ? 0 : arr[mid][objectKey] < searchValue ? +1 : -1
            };
        } else if (arr[mid][objectKey] < searchValue && arr.length > 1) {
            return _binarySearch(arr.slice(mid, Number.MAX_VALUE), searchValue, objectKey);
        } else if (arr[mid][objectKey] > searchValue && arr.length > 1) {
            return _binarySearch(arr.slice(0, mid), searchValue, objectKey);
        } else {
            return {direction: -1};
        }

    };

    var _getSeriesPointByTime = function (series, time) {
        return _binarySearch(series.points, time, "x").val;
    };

    var _getEventPositions = function (e) {
        // iOS (#2757)
        return e.touches ? (e.touches.length ? e.touches.item(0) : e.changedTouches[0]) : e;
    };

    //removed as this is overridden by the method below
    //var _bindEvent = function (eventType, element, callback, touchAndMouse) {
    //    var H = Highcharts,
    //        removeEvents = [],
    //        addDefault = false;
    //
    //    if (Highcharts.hasTouch) {
    //        switch (eventType) {
    //            case 'click':
    //                removeEvents.push(H.addEvent(element, 'touchstart', callback));
    //                break;
    //            case 'mousedown' :
    //                removeEvents.push(H.addEvent(element, 'touchstart', callback));
    //                break;
    //            case 'mouseup' :
    //                removeEvents.push(H.addEvent(element, 'touchend', callback));
    //                break;
    //            case 'mousemove' :
    //                removeEvents.push(H.addEvent(element, 'touchmove', callback));
    //                break;
    //            default :
    //                addDefault = true;
    //                break;
    //        }
    //
    //    }
    //
    //    if (addDefault || touchAndMouse) {
    //        removeEvents.push(H.addEvent(eventType, callback));
    //    }
    //    if (!element.infRemoveEvents) {
    //        element.infRemoveEvents = [];
    //    }
    //    element.infRemoveEvents = element.infRemoveEvents.concat(removeEvents);
    //    return removeEvents;
    //};

    var _getTouchEvent = function (eventType) {

        var touchEvent;

        switch (eventType) {
            case 'click':
                touchEvent = 'touchstart';
                break;
            case 'mousedown' :
                touchEvent = 'touchstart';
                break;
            case 'mouseup' :
                touchEvent = 'touchend';
                break;
            case 'mousemove' :
                touchEvent = 'touchmove';
                break;
            default :
                break;
        }
        return touchEvent;
    };

    var _bindEvent = function (element, eventType, callback, touchAndMouse, unbindPrevious) {
        var H = Highcharts,
            removeEvents = [],
            touchEvent;

        if (!infChart.settings.config.isMobile) {
            H.hasTouch = false;
        }
        if (H.hasTouch) {
            touchEvent = _getTouchEvent(eventType);
            if (touchEvent) {
                if (!element.length) {
                    if (unbindPrevious) {
                        H.removeEvent(element, touchEvent);
                    }
                    removeEvents.xPush(H.addEvent(element, touchEvent, callback));
                } else {
                    element.off(touchEvent);
                    element.on(touchEvent, callback);
                }
            }
        }

        if (!touchEvent || touchAndMouse) {
            if (!element.length) {
                if (unbindPrevious) {
                    H.removeEvent(element, eventType);
                }
                removeEvents.xPush(H.addEvent(element, eventType, callback));
            } else {
                element.off(eventType);
                element.on(eventType, callback);
            }
        }
        return removeEvents;
    };

    var _unbindEvent = function (element, eventType, callback) {
        var H = Highcharts;

        if (H.hasTouch) {
            switch (eventType) {
                case 'click':
                    H.removeEvent(element, 'touchstart', callback);
                    break;
                case 'mousedown' :
                    H.removeEvent(element, 'touchstart', callback);
                    break;
                case 'mouseup' :
                    H.removeEvent(element, 'touchend', callback);
                    break;
                case 'mousemove' :
                    H.removeEvent(element, 'touchmove', callback);
                    break;
                default :
                    break;
            }

        }

        H.removeEvent(element, eventType, callback);
    };

    var _precisionRound = function (number, precision) {
        var factor;
        if (precision > 0) {
            //factor = Math.pow(10, Math.abs(Math.log10(precision)));
            var power = Math.floor(Math.log(precision) / Math.LN10);


            factor = Math.pow(10, Math.floor(Math.log(precision) / Math.LN10));
            var val = Math.round(number / factor) * factor;
            if (power < 0) {
                val = parseFloat(val).toFixed(Math.abs(power));
            } else {
                val = parseFloat(val).toFixed(0);
            }
            return +val;

        } else {
            factor = Math.pow(10, Math.floor(Math.log(precision) / Math.LN10));
            return Math.round(number * factor) / factor;

        }
    };

    var _getDerivedDate = function (time) {
        var dt = Highcharts.dateFormat('%Y-%m-%d-%H-%M-%S-%L', time).split('-');
        return {
            year: +dt[0],
            month: +dt[1] - 1,
            day: +dt[2],
            hour: +dt[3],
            minute: +dt[4],
            second: +dt[5],
            milliSecond: +dt[6]
        };
    };

    var _getDummySeriesConfig = function (type) {
        switch (type) {
            case infChart.constants.dummySeries.forwardId:
            case infChart.constants.dummySeries.backwardId:
                return {
                    data: [],
                    'id': type,
                    'type': 'line',
                    'name': type,
                    'infType': "dummy",
                    'showInNavigator': false,
                    'showInLegend': true
                };
            default :
                return {
                    'data': [],
                    'id': type,
                    'type': 'line',
                    'name': "Empty",
                    'infType': "dummy",
                    'showInNavigator': false,
                    'showInLegend': true
                };
        }
    };

    var _getOpacityFromRGBA = function (rgba) {
        var obj = rgba && rgba.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+(\.\d{1,2})?|\.\d{1,2})[\s+]?/i);
        return obj && obj[4];
    };

    var _getLoadingMessage = function(){
        var fn =  infChart.settings && infChart.settings.registeredMethods && infChart.settings.registeredMethods.loadingMessage || function(){
                return "<div class='loading-icon'><div class='loader'></div></div>";
            };
        return fn.call(this);
    };

    var _formatNumber = function(val, dp){
        return Highcharts.numberFormat(val, dp);
    };

    var _formatDate = function(val, pattern){
        return Highcharts.dateFormat(pattern, val);
    };

    var _getBaseURL = function(){
        var H = Highcharts,
            newUrl = (H.isFirefox || H.isWebKit) && H.doc.getElementsByTagName('base').length ?
            H.win.location.href
                .replace(/#.*?$/, '') // remove the hash
                .replace(/<[^>]*>/g, '') // wing cut HTML
                .replace(/([\('\)])/g, '\\$1') // escape parantheses and quotes
                .replace(/ /g, '%20') : // replace spaces (needed for Safari only)
            '';
        return newUrl;
    };

    /**
     * Return the list of class classes and its contents which contains one or more given values
     * @param classNames [Array]
     * @returns {{}}
     * @private
     */
     var _getStylesWithCls = function(classNames) {
        var styleSheets = document.styleSheets,
            classes,
            clsMap = {};

        if(Array.isArray(classNames)) {
            for (var i = 0; i < styleSheets.length; i++) {
                if(!styleSheets[i].href || styleSheets[i].href.startsWith(window.location.origin)) {
                    classes = styleSheets[i].rules || styleSheets[i].cssRules;

                    for (var x = 0; x < classes.length; x++) {
                        if (classes[x].selectorText && classNames.infContainsItemsIn(classes[x].selectorText)) {
                            clsMap[classes[x].selectorText] = classes[x].cssText || classes[x].style.cssText;
                        }
                    }
                }
            }
        }
        return clsMap;
    };

    /**
     * Apply numeric symbols if applicable
     * @param retVal
     * @param dp
     * @returns {*}
     * @private
     */
    var _formatWithNumericSymbols = function(retVal, dp){
        var numericSymbols = ['k', 'M', 'G', 'T', 'P', 'E'],
            hasNumeric = false;
        // Decide whether we should add a numeric symbol like k (thousands) or M (millions).
        // If we are to enable this in tooltip or other places as well, we can move this
        // logic to the numberFormatter and enable it by a parameter.
        var i = numericSymbols.length, ret, multi;
        while (i-- && ret === undefined) {
            multi = Math.pow(1000, i + 1);
            if ( (retVal) / multi > 1 && numericSymbols[i] !== null) {
                ret = retVal / multi;
                ret = infChart.util.formatNumber(ret, 1);
                ret = ret + numericSymbols[i];
                hasNumeric = true;
            }
        }

        if (!hasNumeric) {
            ret = infChart.util.formatNumber(retVal, dp);
        }
        return ret;
    };

    var _isDefined = function(value) {
        return !isNaN(value) && value != null;
    };

    /**
    * copy the text to clipboard from fib levels
    * @param {String} label - The selected levels value to be copied.
    */
    var _copyToClipBoard = function (label) {
        navigator.clipboard.writeText(label);
    };
    
    /**
     * Wrap a method with extended functionality, preserving the original function.
     *
     * @function #wrap
     * @param {Object} obj - The context object that the method belongs to. In real
     *        cases, this is often a prototype.
     * @param {String} method - The name of the method to extend.
     * @param {Function} func - A wrapper function callback. This function is called
     *        with the same arguments as the original function, except that the
     *        original function is unshifted and passed as the first argument.
     *
     */
    var wrap = function (obj, method, func) {
        var proceed = obj[method];
        obj[method] = function () {
            var args = Array.prototype.slice.call(arguments),
                outerArgs = arguments,
                ctx = this,
                ret;
            ctx.proceed = function () {
                proceed.apply(ctx, arguments.length ? arguments : outerArgs);
            };
            args.unshift(proceed);
            ret = func.apply(this, args);
            ctx.proceed = null;
            return ret;
        };
    };

    /**
     * get symbol display name
     * @param {Object} symbol
     * @returns {string} symbol display name
     */
    var _getSymbolDisplayName = function (symbol) {
        return symbol.legendLabel ? symbol.legendLabel : symbol.symbolDesc ? symbol.symbolDesc : (symbol.symbol + (symbol.exchange ? ("." + symbol.exchange) : ""))
    };

    /**
     * Get candle data for given point index
     * @param chart
     * @param index
     * @returns {[*, *, *, *]}
     * @private
     */
    var _getCandleData = function (chart, index) {
        var chartObj = infChart.manager.getChart(infChart.manager.getContainerIdFromChart(chart.renderTo.id));
        var rangeData = chartObj.rangeData.ohlcv;
        var openDataPoint, highDataPoint, lowDataPoint, closeDataPoint;
        if (rangeData['o']) {
            openDataPoint = rangeData['o'][index]
        }
        if (rangeData['h']) {
            highDataPoint = rangeData['h'][index]
        }
        if (rangeData['l']) {
            lowDataPoint = rangeData['l'][index]
        }
        if (rangeData['c']) {
            closeDataPoint = rangeData['c'][index]
        }
        return [openDataPoint, highDataPoint, lowDataPoint, closeDataPoint]
    };

    var _convertIntervalToTimePeriod = function(interval) {
        switch (interval) {
            case 'I_1':
                return '1m';
            case 'I_2':
                return '2m';
            case 'I_3':
                return '3m';
            case 'I_5':
                return '5m';
            case 'I_10':
                return '10m';
            case 'I_15':
                return '15m';
            case 'I_30':
                return '30m';
            case 'I_60':
                return '1h';
            case 'I_120':
                return '2h';
            case 'I_240':
                return '4h';
            case 'I_360':
                return '6h';
            case 'D':
                return '1d';
            case 'W':
                return '1w';
            case 'Y':
                return '1y';
            default:
                break;
        }
    };

    var _postMessageToReactNative = function(data){
        const jsonString = JSON.stringify(data);
        if(window.ReactNativeWebView){
            window.ReactNativeWebView.postMessage(jsonString);
        }
    };

    var _printInReactNative = function(data){
        const obj = {data: data, type:'console'}
        _postMessageToReactNative(obj);
    };

    return {
        wrap: wrap,
        isEmpty: _isEmpty,
        handleException: _handleException,
        //authenticate: _authenticate,
        extend: _extend,
        generateUUID: _generateUUID,
        //getIndicatorDescLabel: _getIndicatorDescLabel,
        getThousandSeparator: _getThousandSeparator,
        isLegendAvailable: _isLegendAvailable,
        //getLegendTitle: _getLegendTitle,
        //getTooltipSymbolRowValue: _getTooltipSymbolRowValue,
        //getTooltipRowValue: _getTooltipRowValue,
        //getTooltipBaseValue: _getTooltipBaseValue,
        //getTooltipDateValue: _getTooltipDateValue,
        calculateChange: _calculateChange,
        isSeriesInBaseAxis: _isSeriesInBaseAxis,
        isSeriesParallelToBaseAxis: _isSeriesParallelToBaseAxis,
        bindColorPicker: _bindColorPicker,
        binaryIndexOf: _binaryIndexOf,
        getDateStringFromTime: _getDateStringFromTime,
        getUserName: _getUserName,
        saveData: _saveData,
        getData: _getData,
        removeData: _removeData,
        bindDragEvents: _bindDragEvents,
        sendAjax: _sendAjax,
        num2Log: _num2Log,
        //log2Num: _log2Num,
        merge: _merge,
        isToday: _isToday,
        getLastDayOfWeek: _getLastDayOfWeek,
        getLastDayOfMonth: _getLastDayOfMonth,
        getLastDayOfYear: _getLastDayOfYear,
        getFirstDayOfWeek: _getFirstDayOfWeek,
        getFirstDayOfMonth: _getFirstDayOfMonth,
        getFirstDayOfYear: _getFirstDayOfYear,
        //getTooltipNews: _getTooltipNews,
        //getTooltipFlags: _getTooltipFlags,
        //setPopupPosition: _setPopupLocation,
        //getPopupPosition: _getPopupLocation,
        getNavigatorHeight: _getNavigatorHeight,
        //legendReference: _legendReference,
        console: _console,
        getColorFromColorObj: _getColorFromColorObj,
        rgbString2hex: _rgbString2hex,
        isIEBelow10: _isIEBelow10,
        isIE: _isIE,
        saveCanvasAsBlob: _saveCanvasAsBlob,
        getIEVersion: _getIEVersion,
        isSafari: _isSafari,
        //isFullscreenMode: _isFullscreenMode,
        showMessage: _showMessage,
        setCursor: _setCursor,
        escapeSpecialCharacters: _escapeSpecialCharacters,
        getRawValue: _getRawValue,
        getSeriesPointByTime: _getSeriesPointByTime,
        //createDialog: _createDialog,
        //getEventPositions: _getEventPositions,
        bindEvent: _bindEvent,
        unbindEvent: _unbindEvent,
        precisionRound: _precisionRound,
        getDerivedDate: _getDerivedDate,
        getDummySeriesConfig: _getDummySeriesConfig,
        getDateAndTimeStringFromTime: _getDateAndTimeStringFromTime,
        hasAllPatterns: _hasAllPatterns,
        hasPattern: _hasPattern,
        removeDataByKey: _removeDataByKey,
        forEach: _forEach,
        getOpacityFromRGBA: _getOpacityFromRGBA,
        getLoadingMessage : _getLoadingMessage,
        formatNumber : _formatNumber,
        formatDate : _formatDate,
        getColorGradients: _getColorGradients,
        getDefaultUpColor: _getDefaultUpColor,
        getDefaultDownColor: _getDefaultDownColor,
        getSeriesColors : _getSeriesColors,
        getNextSeriesColor : _getNextSeriesColor,
        getBaseURL : _getBaseURL,
        getStylesWithCls : _getStylesWithCls,
        formatWithNumericSymbols : _formatWithNumericSymbols,
        isDefined : _isDefined,
        getSymbolDisplayName: _getSymbolDisplayName,
        hideColorPicker: _hideColorPicker,
        dragFix: _dragFix,
        getCandleData: _getCandleData,
        copyToClipBoard: _copyToClipBoard,
        convertIntervalToTimePeriod: _convertIntervalToTimePeriod,
        postMessageToReactNative: _postMessageToReactNative,
        consoleReact: _printInReactNative
    }

})(jQuery, Highcharts, infChart);

infChart.math = (function(){

    /**
     * calculate linear regression
     * we use startYValue and startXValue as the reference i.e. to normalize the chart for the given x range(startYValue and startXValue will be 0,0)
     * @param {Highchart} chart
     * @param {*} startYValue
     * @param {*} startXValue
     * @param {*} endXValue
     * @param {number} [seriesIndex = 0] the series index to which regression is calculated
     */
    var calculateLinearRegression = function(chart, startYValue, startXValue, endXValue, seriesIndex){
        var series = chart.series[seriesIndex ? seriesIndex : 0];
        var sum = [0, 0, 0, 0, 0],
            n = 0,
            data = series.currentDataGrouping ? series.groupedData : series.data,
            chartId = infChart.drawingsManager.getChartIdFromHighchartInstance(chart),
            chartInstance = infChart.manager.getChart(chartId),
            compareValue = chartInstance.getSeriesCompareValue(series),
            length = data.length,
            dataLength = 0,
            xAxis = series.xAxis,
            yAxis = series.yAxis,
            refX = xAxis.toPixels(startXValue),
            refY = yAxis.toPixels(startYValue),
            xDiffInPixels = xAxis.toPixels(endXValue) - xAxis.toPixels(startXValue),
            periodDataPoints = [];

        for (; n < length; n++) {
            var point = data[n];
            if (point && point.x >= startXValue && point.x <= endXValue) {
                var x = xAxis.toPixels(point.x) - refX;
                var y = (compareValue ? yAxis.toPixels((point.y / compareValue - 1) * 100) : yAxis.toPixels(point.y)) - refY ;
                sum[0] += x; //Σ(X)
                sum[1] += y; //Σ(Y)
                sum[2] += x * x; //Σ(X^2)
                sum[3] += x * y; //Σ(XY)
                sum[4] += y * y; //Σ(Y^2)
                periodDataPoints.push({'x' : x, 'y' : y});
                dataLength++;
            }
        }

        var gradient, intercept, startPointY, endPointY;
        if(dataLength > 0) {
            gradient = (dataLength * sum[3] - sum[0] * sum[1]) / (dataLength * sum[2] - sum[0] * sum[0]);
            intercept = (sum[1] / dataLength) - (gradient * sum[0]) / dataLength;

            startPointY = intercept;
            endPointY = xDiffInPixels * gradient + intercept;
        }

        return {
            'calcData': {
                'points': periodDataPoints,
                'gradient': gradient,
                'intercept': intercept
            },
            'startPointY': startPointY,
            'endPointY': endPointY
        };
    };

    var calculateRegressionChannel = function(regressionPoints, startPointY, endPointY){
        var dataLength = regressionPoints.length,
            i = 0,
            j = 0,
            total = 0,
            diffSquaredSum = 0,
            relativePriceData = [];

        for (i; i < dataLength; i++) {
            relativePriceData.push(regressionPoints[i].y);
            total += (regressionPoints[i].y);
        }

        var mean = total / dataLength;

        for (j; j < relativePriceData.length; j++) {
            diffSquaredSum += Math.pow((relativePriceData[j] - mean), 2);
        }

        var standardDeviation = Math.sqrt(diffSquaredSum / dataLength);

        return {
            'upper': {
                startPointY: startPointY - standardDeviation,
                endPointY: endPointY - standardDeviation

            },
            'lower': {
                startPointY: startPointY + standardDeviation,
                endPointY: endPointY + standardDeviation
            }
        };
    };

    /**
     * Find the nearest x data index for given x value
     * @param seriesData chart series
     * @param xValue of given point on the chart
     * @returns {number|*}
     */
    var findNearestXDataPointIndex = function (seriesData, xValue) {
        var indexOfNearestXValueIndex = infChart.util.binaryIndexOf(seriesData, undefined, xValue);

        if(indexOfNearestXValueIndex < 0) {
            var absIndex = Math.abs(indexOfNearestXValueIndex);

            if(absIndex >= seriesData.length) {
                absIndex = seriesData.length - 1;
            }

            var rangeMaxValue = seriesData[absIndex];
            var rangeMinValue = seriesData[absIndex - 1];

            if(xValue >  (((rangeMaxValue - rangeMinValue) / 2) + rangeMinValue)) {
                indexOfNearestXValueIndex = absIndex;
            } else {
                indexOfNearestXValueIndex = absIndex - 1;
            }
        }

        return indexOfNearestXValueIndex;
    }

    /**
     * Find the nearest x data value for given x value
     * @param chart object
     * @param xValue of given point on the chart
     * @param seriesIndex of relevant data series
     * @param useAllXDataToFindNearestPoint use full series data to search the nearest x date point
     * @param useFutureDate use future date to calculate nearest point
     * @return {*}
     */
    var findNearestXDataPoint = function (chart, xValue, seriesIndex, useAllXDataToFindNearestPoint, useFutureDate) {
        return findNearestDataPoint(chart, xValue, seriesIndex, useAllXDataToFindNearestPoint, useFutureDate).xData;
    }



    /**
     * Find the nearest data point for given x value
     * @param chart object
     * @param xValue of given point on the chart
     * @param seriesIndex of relevant data series
     * @param useAllXDataToFindNearestPoint use full series data to search the nearest x date point
     * @param useFutureDate use future date to calculate nearest point
     * @return {*}
     */
    var findNearestDataPoint = function (chart, xValue, seriesIndex, useAllXDataToFindNearestPoint, useFutureDate) {
        var indexOfNearestXValueIndex;
        var yData;
        var nearestYData;
        var nearestXValue;
        var nearestYValue;
        var series = chart.series[seriesIndex ? seriesIndex : 0];
        var seriesXData = useAllXDataToFindNearestPoint ? series.xData : series.processedXData;
        var seriesYData = useAllXDataToFindNearestPoint ? series.yData : series.processedYData;
        var xDataMaxIndex = seriesXData.length - 1;
        var xDataMax = seriesXData[xDataMaxIndex];
        var totalPoints = infChart.manager.getTotalPoints(chart);

        if (useFutureDate && xValue > xDataMax && seriesXData.length >= 2) {
            indexOfNearestXValueIndex = findNearestXDataPointIndex(totalPoints, xValue);
            yData = infChart.util.getCandleData(chart, indexOfNearestXValueIndex);
            nearestYData = yData;
            nearestXValue = totalPoints[indexOfNearestXValueIndex];
            nearestYValue = totalPoints[indexOfNearestXValueIndex];
        } else {
            indexOfNearestXValueIndex = findNearestXDataPointIndex(seriesXData, xValue);
            yData = infChart.util.getCandleData(chart, indexOfNearestXValueIndex);
            nearestYData = yData;
            nearestXValue = seriesXData[indexOfNearestXValueIndex];
            nearestYValue = seriesYData[indexOfNearestXValueIndex];
        }
        return { xData: nearestXValue, yData: yData, dataIndex: indexOfNearestXValueIndex, nearestYData: nearestYData};
    };

    /**
     * Get future x value for given future index
     * @param chart
     * @param futureIndex
     * @param seriesIndex
     */
    var getFutureXValueForGivenIndex = function (chart, futureIndex, seriesIndex) {
        var series = chart.series[seriesIndex ? seriesIndex : 0];
        var seriesXData = series.xData;
        var xDataMaxIndex = seriesXData.length - 1;
        var xDataMax = seriesXData[xDataMaxIndex];
        var valueDiff = xDataMax - seriesXData[xDataMaxIndex - 1];
        var xAxis = chart.xAxis[seriesIndex ? seriesIndex : 0];
        var xDataMaxPixelValue = xAxis.toPixels(xDataMax);
        var pixelDifference = xDataMaxPixelValue - xAxis.toPixels(seriesXData[xDataMaxIndex - 1]);

        return xAxis.toValue(xDataMaxPixelValue + (futureIndex - xDataMaxIndex) * pixelDifference);
    }

    var getPixelDistanceBetweenCandles = function (chart, seriesIndex, fromCandleIndex, toCandleIndex) {
        var xAxis = chart.xAxis[seriesIndex ? seriesIndex : 0];
        var series = chart.series[seriesIndex ? seriesIndex : 0];
        var seriesXData = series.xData;
        var averageCandleDistance = xAxis.toPixels(series.processedXData[1]) - xAxis.toPixels(series.processedXData[0]);

        return (toCandleIndex - fromCandleIndex) * averageCandleDistance;
    }

    return{
        calculateLinearRegression : calculateLinearRegression,
        calculateRegressionChannel : calculateRegressionChannel,
        findNearestXDataPoint: findNearestXDataPoint,
        findNearestDataPoint: findNearestDataPoint,
        findNearestXDataPointIndex: findNearestXDataPointIndex,
        getFutureXValueForGivenIndex: getFutureXValueForGivenIndex,
        getPixelDistanceBetweenCandles: getPixelDistanceBetweenCandles,
        findNearestXDataPointIndex: findNearestXDataPointIndex
    }
})();

(function($){
    $.fn.xOutside = function(ename, cb){
        return this.each(function(){
            var self = this;
            $(document.body).bind(ename, function tempo(e){
                if(e.target !== self && !$.contains(self, e.target)){
                    var removeCallback = self.parentNode ? cb.apply(self, [e]) : true;
                    if( removeCallback) {
                        $(document.body).unbind(ename, tempo);
                    }
                }
            });
        });
    };

    $.fn.xIsInside = function(child, selector){
        if(selector) {
            var selfEl = this[0],
                parents = $(child).parents(selector),
                inside = false;
            for(var i= 0, iLen = parents.length; i<iLen; i++){
                if(parents[i] == selfEl) {
                    inside = true;
                    break
                }
            }
             return inside;
        }
    }
}(jQuery));
