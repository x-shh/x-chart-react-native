var infChart = window.infChart || {};

infChart.themeManager = (function (Highcharts) {

    var _themes = {
        light: "light",
        dark: "dark"
    };
    
    /**
     * set highchart theme
     * @param {string} theme - chart theme dark/light
     */
    var _setTheme = function (theme) {
        Highcharts.theme = (theme === _themes.light) ? _getLightTheme() : _getDarkTheme();
        Highcharts.setOptions(Highcharts.theme);
    };
    
    /**
     * get light theme
     * @returns {object} light theme
     */
    var _getLightTheme = function () {
        return infChart.lightTheme;
    };
    
    /**
     * get dark theme
     * @returns {object} dark theme
     */
    var _getDarkTheme = function () {
        return infChart.darkTheme;
    };

    /**
     * get theme 
     * @returns {object} Highcharts.theme
     */
    var _getTheme = function () {
        return Highcharts.theme;
    };
    
    /**
     * get themes
     * @returns {object} themes 
     */
    var _getThemes = function () {
        return _themes;
    };

    /**
     * reset main series colors
     * @param {object} seriesOption 
     * @returns {object} reset object
     */
    var _resetMainSeriesColors = function (seriesOption) {
        for (var option in seriesOption) {
            switch(option) {
                case "color":
                case "lineColor":
                case "upColor":
                case "upLineColor":
                case "fillColor":
                    seriesOption[option] = undefined;
                    break;
                default: 
                    break;
            }
        }
        return seriesOption;
    };

    /**
     * get changed series theme colors. set undefined if theme color equals to series colors
     * @param {object} seriesOption - series options
     * @param {string} type - chart type
     * @returns 
     */
    var _getChangedSeriesThemeColors = function (seriesOption, type) {
        var themeOptions = _getTheme().plotOptions[type];
        for (var option in seriesOption) {
            switch(option) {
                case "color":
                case "lineColor":
                case "upColor":
                case "upLineColor":
                    if((themeOptions[option] === seriesOption[option])){
                        delete seriesOption[option];
                    }
                    break;
                case "fillColor":
                    var fill = _getChangedFillColor(themeOptions[option], seriesOption[option]);
                    if(typeof fill === 'undefined'){
                        delete seriesOption[option];
                    }
                    break;
                default: 
                    break;
            }
        }
        return seriesOption;
    };

    /**
     * get changed fill color
     * @param {Array<object>} themeColor - theme color
     * @param {Array<object>} seriesColor - series color
     * @returns {Array<object>} if has custom colors then undefined
     */
    var _getChangedFillColor = function (themeColor, seriesColor) {
        var isColorChanged = false;
        seriesColor.stops.forEach(function (colorItem) {
            var color = themeColor.stops[colorItem[0]][1]
            if(color !== colorItem[1]) {
                isColorChanged = true;
                return;
            } 
        });
        return (isColorChanged) ? seriesColor : undefined;
    };

    /**
     * get drawings fill color. 
     * @param {string} fillColor - drawing fill color
     * @param {string} shape - drawing shape
     * @returns {string} set undefined if fill color same as theme color
     */
    var _getDrawingsFillColor = function (fillColor, shape) {
        var theme = _getTheme();
        var themeColor = theme.drawing[shape] && theme.drawing[shape].fillColor ? theme.drawing[shape].fillColor : theme.drawing.base.fillColor;
        return (themeColor !== fillColor) ? fillColor : undefined;
    };

    /**
     * get drawing border color
     * @param {*} borderColor 
     * @param {*} shape 
     * @returns set undefined if fill color same as theme color
     */
    var _getDrawingsBorderColor = function (borderColor, shape) {
        var theme = _getTheme();
        var themeColor = theme.drawing[shape] && theme.drawing[shape].borderColor ? theme.drawing[shape].borderColor : theme.drawing.base.borderColor;
        return (themeColor !== borderColor) ? borderColor : undefined;
    };

    return {
        setTheme: _setTheme,
        getTheme: _getTheme,
        getThemes: _getThemes,
        getLightTheme: _getLightTheme,
        getDarkTheme: _getDarkTheme,
        getChangedSeriesThemeColors: _getChangedSeriesThemeColors,
        getDrawingsFillColor: _getDrawingsFillColor,
        getDrawingsBorderColor: _getDrawingsBorderColor,
        resetMainSeriesColors: _resetMainSeriesColors
    }
})(Highcharts);
