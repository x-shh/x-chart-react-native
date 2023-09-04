var infChart = window.infChart || {};

infChart.langManager = infChart.langManager || (function () {

        var data = {}, pendingRequests = {}, defaultFileExtension = '.json', cachedLabels = {};

        var _getData = function (pathPrefix, file, callback) {
            var url = pathPrefix + '/' + file;
            $.getJSON(url, undefined, callback);
        };

        var _localizeElements = function (data, container) {
            container.find('[data-localize]').each(function (i, element) {
                var $el = $(element), key = $el.attr('data-localize'), value = _getLabelFromData(data, key);
                if ($el.prev().is("input")) {
                    $el.val(value);
                } else {
                    $el.html(value);
                }
            });
        };

        var _getLabelFromData = function (data, key) {
            var label = cachedLabels[key];
            if(!label) {
                var keyArr = key.split('.');

                function getInnerObj(obj, arr) {
                    if(!obj) {
                        return
                    }
                    if (arr.length === 1) {
                        return obj[arr[0]];
                    }
                    else {
                        var keyTemp = arr.splice(0, 1);
                        if (obj && keyTemp[0] && obj[keyTemp[0]]) {
                            return getInnerObj(obj[keyTemp[0]], arr);
                        }
                    }
                }

                label = getInnerObj(data, keyArr);

                if(label) {
                    cachedLabels[key] = label;
                } else {
                    label = (label) ? label : key;
                }


            }

            return label;
        };

        var _getLabel = function (lang, key) {
            return _getLabelFromData(data[lang], key);
        };

        var _invokeCallback = function (callback, lang, element, referenceId) {
            if (typeof callback === 'undefined') {
                _localizeElements(data[lang], element);
            } else {
                callback(data[lang], element, _localizeElements, referenceId);
            }
        };

        var _localize = function (options) {
            if (options.language) {
                if (data.hasOwnProperty(options.language)) {
                    _invokeCallback(options.callback, options.language, options.element, options.referenceId);
                } else {
                    if(pendingRequests.hasOwnProperty(options.language)){
                        infChart.util.console.info('waiting to resolve lang : ' + options.language);
                        pendingRequests[options.language].push(options);
                    }else{
                        pendingRequests[options.language] = [options];

                        var file = (options.file ? options.file : ('lang-' + options.language + defaultFileExtension));

                        var defaultCallback = function (langData) {
                            data[options.language] = langData;
                            pendingRequests[options.language].forEach(function(opt){
                                _invokeCallback(opt.callback, options.language, opt.element, opt.referenceId);
                            });
                            delete pendingRequests[options.language];
                        };

                        _getData(options.pathPrefix, file, defaultCallback);
                    }
                }
            } else {
                infChart.util.console.error('language not defined');
            }
        };

        return {
            localize: _localize,
            getLabel: _getLabel
        }
    })();


