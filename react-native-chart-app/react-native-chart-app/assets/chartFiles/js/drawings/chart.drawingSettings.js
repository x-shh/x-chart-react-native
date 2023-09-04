window.infChart = window.infChart || {};

(function (infChart, $) {
    infChart.drawingSettings = infChart.drawingSettings || {
        eventTypes: {
            lineColor: "onLineColorChange",
            lineWidth: "onLineWidthChange",
            lineStyle: "onLineStyleChange",
            fillColor: "onFillColorChange",
            fontColor: "onFontColorChange",
            fontSize: "onFontSizeChange",
            fontStyle: "onFontStyleChange",
            checkBox: "onCheckBoxValueChange",
            value: "onValueChange",
            text: "onTextChange"
        },
        getEventHandler: function (drawingInstance, eventType, settingsParams) {
            return function () {
                let isPropertyChange = true;
                if (drawingInstance.settingsPopup) {
                    isPropertyChange = drawingInstance.isSettingsPropertyChange();
                }
                infChart.drawingSettings.eventHandlers[eventType](drawingInstance, settingsParams, isPropertyChange, ...arguments);
            }
        },
        postEventHandler: function (drawingInstance, isPropertyChange) {
            isPropertyChange && drawingInstance.onPropertyChange();

            if (drawingInstance.settingsPopup) {
                drawingInstance.settingsPopup.data("infUndoRedo", false);
            }

            infChart.drawingUtils.common.saveDrawingProperties.call(drawingInstance);
        }
    };

    infChart.drawingSettings.eventHandlers = {
        onLineColorChange: function (drawingInstance, settingsParams, isPropertyChange, rgb, value, opacity) {
            let annotationParams = {};

            if (settingsParams.isUpdateAnnotationStyles) {
                annotationParams = {
                    shape: {
                        params: {
                            stroke: value,
                            'stroke-opacity': opacity
                        }
                    }
                }
            }

            if (settingsParams.settingsItem) {
                annotationParams.settings = {};
                annotationParams.settings[settingsParams.settingsItem + 'Color'] = value;
                annotationParams.settings[settingsParams.settingsItem + 'Opacity'] = opacity;
            }

            drawingInstance.annotation.update(annotationParams);

            if (settingsParams.otherLineElements) {
                settingsParams.otherLineElements.forEach(function (element) {
                    element.attr({
                        stroke: value,
                        'stroke-opacity': opacity
                    });
                });
            }

            if (settingsParams.otherTextElements) {
                settingsParams.otherTextElements.forEach(function (element) {
                    element.css({
                        color: value,
                        opacity: opacity
                    })
                });
            }

            if (settingsParams.callBackFunction) {
                settingsParams.callBackFunction.call(drawingInstance, settingsParams, isPropertyChange, rgb, value, opacity);
            }

            infChart.drawingSettings.postEventHandler(drawingInstance, isPropertyChange);
        },
        onLineWidthChange: function (drawingInstance, settingsParams, isPropertyChange, strokeWidth) {
            let annotationParams = {};

            if (settingsParams.isUpdateAnnotationStyles) {
                annotationParams = {
                    shape: {
                        params: {
                            'stroke-width': strokeWidth
                        }
                    }
                }
            }

            if (settingsParams.settingsItem) {
                annotationParams.settings = {};
                annotationParams.settings[settingsParams.settingsItem] = strokeWidth;
            }

            drawingInstance.annotation.update(annotationParams);

            if (settingsParams.otherLineElements) {
                settingsParams.otherLineElements.forEach(function (element) {
                    element.attr({
                        'stroke-width': strokeWidth
                    });
                });
            }

            if (settingsParams.callBackFunction) {
                settingsParams.callBackFunction.call(drawingInstance, settingsParams, isPropertyChange, strokeWidth);
            }

            infChart.drawingSettings.postEventHandler(drawingInstance, isPropertyChange);
        },
        onLineStyleChange: function (drawingInstance, settingsParams, isPropertyChange, dashStyle) {
            let annotationParams = {};

            if (settingsParams.isUpdateAnnotationStyles) {
                annotationParams = {
                    shape: {
                        params: {
                            dashstyle: dashStyle
                        }
                    }
                }
            }

            if (settingsParams.settingsItem) {
                annotationParams.settings = {};
                annotationParams.settings[settingsParams.settingsItem] = dashStyle;
            }

            drawingInstance.annotation.update(annotationParams);

            if (settingsParams.otherLineElements) {
                settingsParams.otherLineElements.forEach(function (element) {
                    element.attr({
                        dashstyle: dashStyle
                    });
                });
            }

            if (settingsParams.callBackFunction) {
                settingsParams.callBackFunction.call(drawingInstance, settingsParams, isPropertyChange, dashStyle);
            }

            infChart.drawingSettings.postEventHandler(drawingInstance, isPropertyChange);
        },
        onFillColorChange: function (drawingInstance, settingsParams, isPropertyChange, rgb, value, opacity) {
            let annotationParams = {};

            if (settingsParams.isUpdateAnnotationStyles) {
                annotationParams = {
                    shape: {
                        params: {
                            fill: value,
                            'fill-opacity': opacity
                        }
                    }
                }
            }

            if (settingsParams.settingsItem) {
                annotationParams.settings = {};
                annotationParams.settings[settingsParams.settingsItem + 'Color'] = value;
                annotationParams.settings[settingsParams.settingsItem + 'Opacity'] = opacity;
            }

            drawingInstance.annotation.update(annotationParams);

            if (settingsParams.otherLineElements) {
                settingsParams.otherLineElements.forEach(function (element) {
                    element.attr({
                        fill: value,
                        'fill-opacity': opacity
                    });
                });
            }

            if (settingsParams.otherTextElements) {
                settingsParams.otherTextElements.forEach(function (element) {
                    element.css({
                        color: value,
                        opacity: opacity
                    })
                });
            }

            if (settingsParams.callBackFunction) {
                settingsParams.callBackFunction.call(drawingInstance, settingsParams, isPropertyChange, rgb, value, opacity);
            }

            infChart.drawingSettings.postEventHandler(drawingInstance, isPropertyChange);
        },
        onFontColorChange: function (drawingInstance, settingsParams, isPropertyChange, rgb, value, opacity) {
            let annotationParams = {};

            if (settingsParams.isUpdateAnnotationStyles) {
                annotationParams = {
                    title: {
                        style: {
                            color: value,
                            opacity: opacity
                        }
                    }
                }
            }

            if (settingsParams.settingsItem) {
                annotationParams.settings = {};
                annotationParams.settings[settingsParams.settingsItem + 'Color'] = value;
                annotationParams.settings[settingsParams.settingsItem + 'Opacity'] = opacity;
            }

            drawingInstance.annotation.update(annotationParams);

            if (settingsParams.otherTextElements) {
                settingsParams.otherTextElements.forEach(function (element) {
                    element.css({
                        color: value,
                        opacity: opacity
                    })
                });
            }

            if (settingsParams.callBackFunction) {
                settingsParams.callBackFunction.call(drawingInstance, settingsParams, isPropertyChange, rgb, value, opacity);
            }

            infChart.drawingSettings.postEventHandler(drawingInstance, isPropertyChange);
        },
        onFontSizeChange: function (drawingInstance, settingsParams, isPropertyChange, fontSize) {
            let annotationParams = {};

            if (settingsParams.isUpdateAnnotationStyles) {
                annotationParams = {
                    title: {
                        style: {
                            fontSize: fontSize + 'px'
                        }
                    }
                }
            }

            if (settingsParams.settingsItem) {
                annotationParams.settings = {};
                annotationParams.settings[settingsParams.settingsItem] = fontSize;
            }

            drawingInstance.annotation.update(annotationParams);

            if (settingsParams.otherTextElements) {
                settingsParams.otherTextElements.forEach(function (element) {
                    element.css({
                        fontSize: fontSize + 'px'
                    })
                });
            }

            if (settingsParams.callBackFunction) {
                settingsParams.callBackFunction.call(drawingInstance, settingsParams, isPropertyChange, fontSize);
            }

            infChart.drawingSettings.postEventHandler(drawingInstance, isPropertyChange);
        },
        onFontStyleChange: function (drawingInstance, settingsParams, isPropertyChange, style, isSelected) {
            let annotationParams = { title: { style: {} } };
            let textParams = {};
            const styleTypes = {
                'bold': { style: 'fontWeight', selectedValue: 'bold', deSelectedValue: 'normal' },
                'italic': { style: 'fontStyle', selectedValue: 'italic', deSelectedValue: 'normal' },
                'underline': { style: 'textDecoration', selectedValue: 'underline', deSelectedValue: 'inherit' }
            };
            const currentStyleObject = styleTypes[style];

            if (settingsParams.isUpdateAnnotationStyles) {
                annotationParams.title.style[currentStyleObject.style] = isSelected ? currentStyleObject.selectedValue : currentStyleObject.deSelectedValue;
            }

            if (settingsParams.settingsItem) {
                annotationParams.settings = {};
                annotationParams.settings[settingsParams.settingsItem] = isSelected ? currentStyleObject.selectedValue : currentStyleObject.deSelectedValue;
            }

            drawingInstance.annotation.update(annotationParams);
            textParams[currentStyleObject.style] = isSelected ? currentStyleObject.selectedValue : currentStyleObject.deSelectedValue;

            if (settingsParams.otherTextElements) {
                settingsParams.otherTextElements.forEach(function (element) {
                    element.css(textParams)
                });
            }

            if (settingsParams.callBackFunction) {
                settingsParams.callBackFunction.call(drawingInstance, settingsParams, isPropertyChange, style, isSelected);
            }

            infChart.drawingSettings.postEventHandler(drawingInstance, isPropertyChange);
        },
        onCheckBoxValueChange: function (drawingInstance, settingsParams, isPropertyChange, isChecked) {
            let annotationParams = {};

            if (settingsParams.settingsItem) {
                annotationParams.settings = {};
                annotationParams.settings[settingsParams.settingsItem] = isChecked;
            }
            drawingInstance.annotation.update(annotationParams);

            if (settingsParams.callBackFunction) {
                settingsParams.callBackFunction.call(drawingInstance, settingsParams, isPropertyChange, isChecked);
            }

            infChart.drawingSettings.postEventHandler(drawingInstance, isPropertyChange);
        },
        onTextChange: function (drawingInstance, settingsParams, isPropertyChange, text) {
            let annotationParams = {};

            if (settingsParams.settingsItem) {
                annotationParams[settingsParams.settingsItem] = text;
            }
            drawingInstance.annotation.update(annotationParams);

            if (settingsParams.callBackFunction) {
                settingsParams.callBackFunction.call(drawingInstance, settingsParams, isPropertyChange, text);
            }

            infChart.drawingSettings.postEventHandler(drawingInstance, isPropertyChange);
        },
        onValueChange: function (drawingInstance, settingsParams, isPropertyChange, value) {
            let annotationParams = {};

            if (settingsParams.settingsItem) {
                annotationParams.settings = {};
                annotationParams.settings[settingsParams.settingsItem] = value;
            }
            drawingInstance.annotation.update(annotationParams);

            if (settingsParams.callBackFunction) {
                settingsParams.callBackFunction.call(drawingInstance, settingsParams, isPropertyChange, value);
            }

            infChart.drawingSettings.postEventHandler(drawingInstance, isPropertyChange);
        }
    };
})(infChart, jQuery);