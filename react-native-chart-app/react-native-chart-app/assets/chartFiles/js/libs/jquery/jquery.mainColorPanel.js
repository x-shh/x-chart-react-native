(function (factory) {
    
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery'], factory);
    } else if (typeof exports === 'object') {
        // Node/CommonJS
        module.exports = factory(require('jquery'));
    } else {
        // Browser globals
        factory(jQuery);
    }
    
}(function ($) {

    let presetColors = {
        'gray-scale-range': ["#FFFFFF", "#CACED6", "#A8ACB5", "#898D96", "#6C707A", "#52565F", "#3A3E47", "#252931", "#13171E", "#000000"],
        'primary-range': ["#F92A3E", "#FF8B25", "#FFE64C", "#3DA54F", "#008F77", "#00B5CC", "#005CF8", "#5736A9", "#9326A2", "#EE1557"],
        'secondry-range': {
            'pre-defined-range-1': ['#FFC3C6', '#FF969A', '#FD6F76', '#FE4556', '#AF202E', '#791620'],
            'pre-defined-range-2': ['#FFDAAD', '#FFC47C', '#FFAC50', '#FF9B35', '#FC6E1F', '#EB4417'],
            'pre-defined-range-3': ['#FFF7C1', '#FFF29A', '#FFED77', '#FFEA5F', '#FFB63C', '#FC7127'],
            'pre-defined-range-4': ['#C0E2C4', '#99D0A0', '#73BF7E', '#57B265', '#2C833B', '#155323'],
            'pre-defined-range-5': ['#9DE1D7', '#5BC6B5', '#27B59F', '#00A28A', '#005B4D', '#002D26'],
            'pre-defined-range-6': ['#A2E9EF', '#68DAE6', '#27CBDB', '#00C0D3', '#008D9C', '#005659'],
            'pre-defined-range-7': ['#ADD4F8', '#7BB8F4', '#3C94EF', '#0071ED', '#0043C0', '#002F8A'],
            'pre-defined-range-8': ['#CABDE3', '#A893D2', '#886BC2', '#6F4FB5', '#412B9A', '#221E83'],
            'pre-defined-range-9': ['#DDB6E1', '#C889CF', '#B35EBC', '#A340AF', '#6F2093', '#3D197D'],
            'pre-defined-range-10': ['#FBB2C9', '#F883A6', '#F55686', '#F1356D', '#C11250', '#810E44']
        }
    }
    
      $.mainColorPanel = {
        defaults: {
            change: null,
            changeDelay: 0,
            control: 'hue',
            dataUris: true,
            defaultValue: '',
            format: 'hex',
            hide: null,
            hideSpeed: 100,
            keywords: '',
            letterCase: 'lowercase',
            opacity: false,
            position: 'bottom left',
            show: null,
            theme: 'default'
        }
    };
    $.extend($.fn, {
        mainColorPanel : function (method, data){
        switch (method) {        
            case 'opacity':
                    // Getter
                    if( data === undefined ) {
                        // Getter
                        return $(this).attr('data-opacity');
                    } else {
                        // Setter
                        $(this).each( function() {
                            // $(this).attr('data-opacity', data);

                            _updateDrawingAndPanelColorScheme($(this).attr('data-opacity', data));
                        });
                    }
                    return $(this);
            // Get an RGB(A) string based on the current color/opacity
            case 'rgbString':
                case 'rgbaString':
                    return rgbString($(this), method === 'rgbaString');
            case 'value':
                if( data === undefined ) {
                    // Getter
                    return $(this).val();
                } else {
                    // Setter
                    $(this).each( function() {
                        if( typeof(data) === 'object' ) {
                            if( data.opacity ) {
                                $(this).attr('data-opacity', keepWithin(data.opacity, 0, 1));
                            }
                            if( data.color ) {
                                $(this).val(data.color);
                            }
                        } else {
                            $(this).val(data);
                            
                        }
                        _updateDrawingAndPanelColorScheme($(this),data);
                    });
                }
                return $(this);
            case 'onsubmit':
                return $(this).data('minicolors-settings')
        default:
            if( method !== 'create' ) data = method;
            $(this).each( function() {
                _initializeMainColorPanel($(this), data);
                _bindminiColorPicker($(this));
                let minicolorWrapper = $(this).parent().find('[rel="miniColorPickerTargetElement"]').parent();
                minicolorWrapper[0].style.display = 'none';
            });          
            break;
        }
    }
    });


    /**
     * update main color panel and drawings color, opacity attributes
     * @param input targetted input element
     * @param data color, opacity values
     * @private
     */
    let _updateDrawingAndPanelColorScheme = function (input) {
        let mainColorPanelWrapper = input.closest('[rel="mainColorPanel"]');
        input.parent().find('[rel="maincolors-swatch-color"]')[0].style.backgroundColor = input.val();
        input.parent().find('[rel="maincolors-swatch-color"]')[0].style.opacity = input.attr('data-opacity');
        let settings = input.data('minicolors-settings');

        if (settings.opacityEnabled) {
            mainColorPanelWrapper.find('[rel="opacityBarSlider"]').parent()[0].style.setProperty("--range-bar-color", input.val());
            mainColorPanelWrapper.find('[rel="opacityBarTextBox"]')[0].value = input.attr('data-opacity') * 100;
            mainColorPanelWrapper.find('[rel="opacityBarSlider"]')[0].value = input.attr('data-opacity') * 100;
        }
        if (settings.change) {
            settings.change.call(input.get(0), input.val(), input.attr('data-opacity'))
        }

    } 

    let _initializeMainColorPanel = function (input, settings) {
        var minicolors = $('<div rel="mainColorPanel" class="minicolors minicolors-theme-default" />'),
            defaults = $.minicolors.defaults;

        if( input.data('minicolors-initialized') ) return;
        
        settings = $.extend(true, {}, defaults, settings);

        input
            .attr('rel', 'mainColor-input')
            .data('minicolors-initialized', false)
            .data('minicolors-settings', settings)
            .wrap(minicolors)
            .after(_getMainColorPanelHtml());
            
        if (!settings.opacityEnabled) {
            input.parent().find('[rel="opacitySection"]')[0].style.display = 'none';
        }

        // The swatch
        input.after('<span rel="panel-swatch" class="minicolors-swatch minicolors-sprite"><span rel="maincolors-swatch-color" class="minicolors-swatch-color"></span></span>');
        input.next('[rel="panel-swatch"]').on('click', function (event) {
            event.preventDefault();
            input.focus();
        });

        _updateDrawingAndPanelColorScheme(input);
        _setMainColorPanelValues(input);        

        if (input.parent().find('[rel="colorPanel"]')[0]) {
            input.parent().find('[rel="colorPanel"]')[0].style.display = 'none'; //refactor - use a method to show hide this.
        }
        input.data('minicolors-initialized', true);                     
    }

    /**
     * set color and opacity values of main color panel buttons and slide bar
     * @param input targetted input element
     * @private
     */
    let _setMainColorPanelValues = function (input) {
        let grayScaleRangeElement = input.parent().find('[rel="gray-scale-range"]')[0];
        let primaryRangeElement = input.parent().find('[rel="primary-range" ]')[0];
        let secondryRangeElement = input.parent().find('[rel="secondry-range" ]')[0];
        let favColorPanelElement = input.parent().find('[rel="favColorPanel"]')[0];
        if (grayScaleRangeElement) {
            _createPresetColorPalettes(grayScaleRangeElement, presetColors['gray-scale-range']);
        }
        if (grayScaleRangeElement) {
            _createPresetColorPalettes(primaryRangeElement, presetColors['primary-range']);
        }
        
        if (secondryRangeElement) {
            _createPresetColorPalettes(secondryRangeElement, presetColors['secondry-range'], true);
        }

        if (favColorPanelElement) {
            _addElementsToFavouritePanel(favColorPanelElement);
        }
    }

    let _getMainColorPanelHtml = function () {
        
        var toolTip = infChart.structureManager.toolbar.getToolTipAttributes(infChart.manager.getLabel("label.addColor"), "left");
    
        return `<section rel="colorPanel" style="z-index: 10000;" class="ui-swatch-panel">
                    <section class="ui-swatch-panel__inner">
                        <section rel="mainColorPanelBody" class="ui-swatch-panel__body">
                            <p class="ui-swatch-panel__section-title">Preset Colors</p>
                            <section class="ui-swatch-panel__preset-colors">
                                <section class="preset-color-section">
                                    <color-group rel="gray-scale-range" class="color-group color-group--inline">
                                    </color-group>
                                    <color-group rel="primary-range" class="color-group color-group--inline">
                                    </color-group>
                                </section>
                                <section rel="secondry-range" class="preset-color-section preset-color-section--inline"></section>
                            </section>
                            <section class="ui-swatch-panel__fav-colors">
                                <p class="ui-swatch-panel__section-title">My Colors</p>
                                <section rel="favColorPanel" class="fav-colors">
                                    <button rel="add-button" class="c-btn c-btn--add-color adv-chart-tooltip top" ` + toolTip + `><i class="icom icom-plus"></i></button>
                                </section>
                            </section>
                            <section rel="opacitySection" class="ui-swatch-panel__opacity-ranger">
                                <p class="ui-swatch-panel__section-title">Opacity</p>
                                <div class="ui-range-bar" style="--range-bar-color:#f00;">
                                    <input rel="opacityBarSlider" type="range" min="1" max="100" value="50" class="slider" id="myRange">
                                    <section class="range-val">
                                        <input rel="opacityBarTextBox"  type= "number" min="0" max="100" class="c-form-control c-form-control--opacity-val"/>
                                        <label>%</label>
                                    </section>
                                </div>
                            </section>
                        </section>
                        <section rel="miniColorPickerBody" >
                            <div rel="miniColorPickerTargetElement"></div>
                        </section>
                    </section>
                </section>`
    }

    let _bindminiColorPicker = function (input) {
        var _slef = this;
        colorPickEl = input.parent().find('[rel="miniColorPickerTargetElement"]');
            
        colorPickEl.minicolors({
            width: 300,
            change: function (value) {
                $(this).parent().find(".minicolors-hex-input").val(value);                
                if ($(this).parent().find("div[rel=colorIndicator]").length > 0) {
                    $(this).parent().find("div[rel=colorIndicator]")[0].style.setProperty("--selected-color", value);
                }
            },
            show: function() {                
                $(this).attr('isMiniColorVisible',true);           
                let toolTip = infChart.structureManager.toolbar.getToolTipAttributes(infChart.manager.getLabel("label.addColor"), "left");
                let value = colorPickEl.val();

                let hexInput = '<div class="minicolors-hex-input-wrapper"> ' +
                                        '<input type="text" class="minicolors-hex-input"  value="' + value + '"/>' +
                                        '<div rel="colorIndicator" class="minicolors-hex-input-wrapper__selected-color" style="--selected-color:' + value +';"></div>'+
                                        '<button rel="selectedMincolorAddButton"  class="c-btn c-btn--add-button c-btn--default-alt adv-chart-tooltip bottom"' + toolTip + '>Add</button>' +
                                    '</div>';

                $(this).parent().find(".minicolors-panel").append(hexInput);
                let mainColorPanelWrapper = $(this).closest('[rel="mainColorPanel"]');
                let mainColorInputElement = mainColorPanelWrapper.find('[rel="mainColor-input"]'); 
                var hexInputElement = mainColorPanelWrapper.find(".minicolors-hex-input");
                var addButton = mainColorPanelWrapper.find('[rel="selectedMincolorAddButton"]');
                let favColorPanelElement = mainColorPanelWrapper.find('[rel="favColorPanel"]');
                let miniColorPickerBody = mainColorPanelWrapper.find('[rel="miniColorPickerBody"]');
                
                var settings = colorPickEl.data('minicolors-settings');
                var ctrlKey = 17;
                var cmdKey = 91;
                var enterKey = 13;
                var vKey = 86;8
                var ctrlDown = false;
                var onSubmit = mainColorInputElement.mainColorPanel('onsubmit');

                _addElementsToFavouritePanel(favColorPanelElement[0]);                  

                hexInputElement.val(value.startsWith("rgb") ? rgb2hex(value) : value);
                
                hexInputElement.on('keydown', event => {
                    var keyCode = event.which || event.keyCode;
                    if (keyCode == ctrlKey || keyCode == cmdKey) {
                        ctrlDown = true;
                    }
                    if ((ctrlDown && keyCode === vKey)) {
                        setTimeout(function () {
                            _changeMiniColor(hexInputElement, settings, colorPickEl, onSubmit, _slef);
                        }, 100);
                    } else if (keyCode === enterKey) {
                        _changeMiniColor(hexInputElement, settings, colorPickEl, onSubmit, _slef);
                    }
                });

                hexInputElement.on('click', event => {
                    ctrlDown = false;
                    hexInputElement.select();
                });

                hexInputElement.on('keyup', event => {
                    var keyCode = event.which || event.keyCode;
                    if (keyCode == ctrlKey || keyCode == cmdKey) {
                        ctrlDown = false;
                    }
                });

                addButton.on('click', event => {
                    let color = hexInputElement.val();                    
                    mainColorInputElement.val(color);
                    _updateDrawingAndPanelColorScheme(mainColorInputElement);                                        
                                        
                    miniColorPickerBody.find('.minicolors-panel')[0].style.display = 'none';
                    colorPickEl.minicolors('hide');
                                        
                    miniColorPickerBody[0].classList.remove('ui-swatch-panel__color-picker') ; //try to remove this using switch in mainColorPanel
                    let favouriteColours = infChart.favouriteColorManager.getFavouriteColors() || [];
                    if (!favouriteColours.includes(colorPickEl.val())) {
                        favouriteColours.push(colorPickEl.val());
                        infChart.favouriteColorManager.setFavoriteColors(favouriteColours);
                        _addElementsToFavouritePanel(favColorPanelElement[0]);
                        removeActiveClass();
                        _highlightAddedFavoriteColor(favColorPanelElement);
                        
                      }
                    
                });                                

            },
            hide: function () {
                $(this).parent()[0].style.display = 'none';
                $(this).attr('isMiniColorVisible',false);
                let mainColorPanelWrapper = $(this).closest('[rel="mainColorPanel"]');
                
                let miniColorPickerBody = mainColorPanelWrapper.find('[rel="miniColorPickerBody"]');
                miniColorPickerBody[0].classList. remove('ui-swatch-panel__color-picker')
                
                var hexInputElementWrapper = $(this).parent().find(".minicolors-hex-input-wrapper");
                var hexInputElement = $(this).parent().find(".minicolors-hex-input");
                var addButton = $(this).parent().find('[rel="selectedMincolorAddButton"]');

                hexInputElementWrapper.remove();
                hexInputElement.off('keydown');
                    hexInputElement.off('keyup');
                    hexInputElement.off('click');
            }
        });
    }

    let _highlightAddedFavoriteColor = function (favColorPanelElement) {
        let favButtonList = favColorPanelElement[0].querySelectorAll('[rel="color-buttons"]');
        favButtonList[favButtonList.length - 1].classList.add('active');
    }


    var _addElementsToFavouritePanel = function (favColorPanelElement) {
        let favouriteColours = infChart.favouriteColorManager.getFavouriteColors() || [];
        while (favColorPanelElement.firstChild && favColorPanelElement.childElementCount > 1) {
            favColorPanelElement.removeChild(favColorPanelElement.firstChild);
        }
        if (favouriteColours.length > 0) {
            _createButtons(favouriteColours, favColorPanelElement, '--picked-color');
            favColorPanelElement.scrollTop = favColorPanelElement.scrollHeight;
        }
    }

    let _createPresetColorPalettes = function (parentElement, colorClassRange, isSecondryRange) {
        if (isSecondryRange) {
            Object.values(colorClassRange).forEach(subRangeColors => {
                let colorGroupElement = document.createElement('color-group');
                colorGroupElement.classList.add('color-group');
                _createButtons(subRangeColors, colorGroupElement, '--color-type', 'color-group__item');
                parentElement.appendChild(colorGroupElement);
            });
        } else {  
            _createButtons(colorClassRange,parentElement, '--color-type', 'color-group__item');
        }
        
    }

    let _createButtons = function (colorClassRange, parentElement, cssVariableName, customCssClass) {
        let addButton = parentElement.parentNode && parentElement.parentNode.querySelector('[rel="add-button"]');
        colorClassRange.forEach(color => {
            const colorButtonElement = document.createElement('button');
            colorButtonElement.classList.add('c-btn', 'c-btn--transparent');
            colorButtonElement.setAttribute('rel', 'color-buttons')
            if (customCssClass) {
                colorButtonElement.classList.add(customCssClass)
            }
            colorButtonElement.style.setProperty(cssVariableName, color);
            colorButtonElement.dataset.colorValue = color;
            if(addButton) {
                parentElement.insertBefore(colorButtonElement, addButton);
            } else {
                parentElement.appendChild(colorButtonElement);
            }
        })
    }

    let _showMainColorPanel = function (input) {
        input.parent().find('[rel="colorPanel"]')[0].style.display ='block';
        let mainColorPanelWrapper = input.closest('[rel="mainColorPanel"]');
        let inputEl = mainColorPanelWrapper.find('[rel="mainColor-input"]');
        let settings = inputEl.data('minicolors-settings');

        if (settings && settings.show) {
            settings.show.call(inputEl.get(0));
        }
        _highlightSelectedColor(mainColorPanelWrapper, input)
    }

    let _highlightSelectedColor = function (mainColorPanelWrapper, input) {
        let colorPaletteButtonList = mainColorPanelWrapper[0].querySelectorAll('[rel="color-buttons"]');
        colorPaletteButtonList.forEach(function(btn) {
            if(btn.getAttribute('data-color-value') == input.val()) {
                btn.classList.add('active');
            }
          });
    }

    let _setOpacity = function (input) {
        let opacityValue = input[0].value/100;
        let mainColorPanelWrapper = input.closest('[rel="mainColorPanel"]');
        let inputEl = mainColorPanelWrapper.find('[rel="mainColor-input"]');
        let color = inputEl.val();    
        inputEl.mainColorPanel("value", {color: color, opacity : opacityValue});
    }

    function _setSelectedColor (input) {
        let value = input[0].dataset.colorValue;
        let mainColorPanelWrapper = input.closest('[rel="mainColorPanel"]');
        let panelSwatch = mainColorPanelWrapper.find('[rel="maincolors-swatch-color"]');
        let inputElement = mainColorPanelWrapper.find('[rel="mainColor-input"]');
        panelSwatch[0].style.backgroundColor = value;
        inputElement.mainColorPanel("value", {color: value})
    }

    function _addFavoriteColor (input) {
        let mainColorPanelWrapper = input.closest('[rel="mainColorPanel"]');
        let miniColorPickerWrapper = mainColorPanelWrapper.find('[rel="miniColorPickerTargetElement"]').parent();
        let miniColorPickerBody = mainColorPanelWrapper.find('[rel="miniColorPickerBody"]');
        let inputElement = mainColorPanelWrapper.find('[rel="mainColor-input"]');
        let opacity = inputElement.attr('data-opacity');
        
        let currentColor = inputElement.mainColorPanel('value');
        miniColorPickerWrapper[0].style.display = 'block';
        
        colorPickEl = miniColorPickerWrapper.find('[rel="miniColorPickerTargetElement"]');
        
        miniColorPickerWrapper.find('.minicolors-swatch')[0].style.display = 'none';
        
        miniColorPickerBody[0].classList.add('ui-swatch-panel__color-picker');
        
        colorPickEl.minicolors("value", {color: currentColor, opacity: opacity});
        colorPickEl.minicolors('show');
        
    }

    function _hideMainColorPanel() {
        $('[rel="colorPanel"]').each( function() {
            var presetColorPalette = $(this);
            presetColorPalette[0].style.display = 'none';
        });
    }
    
    let removeActiveClass = function () {
        let colorPaletteButtonList = document.querySelectorAll('[rel="color-buttons"]');
         colorPaletteButtonList.forEach(function(btn) {
              btn.classList.remove('active');
          });
    }     
    
      // Handle events
      $(document)// Hide on clicks outside of the control
      .on('mousedown touchstart', function(event) {
          if( !$(event.target).parents().add(event.target).is('[rel="mainColorPanel"]') ) { 
              _hideMainColorPanel();
          } else if (!$(event.target).parents().add(event.target).hasClass('minicolors-panel')){
              
            $('[rel="miniColorPickerTargetElement"]').each( function() {
            let miniColorPickerElement = $(this);
                if(miniColorPickerElement.attr('isMiniColorVisible') == "true") {
                    miniColorPickerElement.minicolors('hide');
                }
            });
          }
      })
      // Show panel when swatch is clicked
      .on('mousedown touchstart', '[rel="panel-swatch"]', function(event) {
          _hideMainColorPanel()
          var input = $(this).parent().find('[rel="mainColor-input"]');
          event.preventDefault();
          removeActiveClass();
          _showMainColorPanel(input);
      })
      // Handle on color click
      .on('mousedown', '[rel="color-buttons"]', function(event) {
          
          var input = $(this);
          removeActiveClass();
          input[0].classList.add('active')
          _setSelectedColor(input);    
      })
      // add favorutie colors
      .on('mousedown', '[rel="add-button"]', function(event) {
        //   _hideMainColorPanel()
          event.preventDefault();
          event.stopPropagation();
          _addFavoriteColor($(this)); 
          
      })
      
      .on('contextmenu', '[rel="favColorPanel"]' , function (event) {
                        event.preventDefault();
                        if (event.target.dataset.colorValue) {
                            event.data = {
                              addElementsToFavouritePanel: _addElementsToFavouritePanel
                            };
                            infChart.contextMenuManager.openContextMenu(undefined, {
                                top: event.clientY,
                                left: event.clientX
                            }, infChart.constants.contextMenuTypes.colorPalette, undefined, event, true);
                        }
                    })

      // change opacity
      .on('input', '[rel="opacityBarSlider"]', function(event) {
          _setOpacity($(this)); 
      })
      
      // change opacity
      .on('keyup', '[rel="opacityBarTextBox"]', function(event) {
          _setOpacity($(this)); 
      })
      

    //-------------------------------------------------------start - Functions from mini color picker library -------------------------------------------------------------------------------------

    // Generates an RGB(A) string based on the input's value
    function rgbString(input, alpha) {
        var hex = parseHex($(input).val(), true),
            rgb = hex2rgb(hex),
            opacity = $(input).attr('data-opacity');
        if( !rgb ) return null;
        if( opacity === undefined ) opacity = 1;
        if( alpha ) {
            return 'rgba(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ', ' + parseFloat(opacity) + ')';
        } else {
            return 'rgb(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ')';
        }
    }

    // Parses a string and returns a valid hex string when possible
    function parseHex(string, expand) {
        string = string.replace(/^#/g, '');
        if( !string.match(/^[A-F0-9]{3,6}/ig) ) return '';
        if( string.length !== 3 && string.length !== 6 ) return '';
        if( string.length === 3 && expand ) {
            string = string[0] + string[0] + string[1] + string[1] + string[2] + string[2];
        }
        return '#' + string;
    }

    // Converts a hex string to an RGB object
    function hex2rgb(hex) {
        hex = parseInt(((hex.indexOf('#') > -1) ? hex.substring(1) : hex), 16);
        return {
            /* jshint ignore:start */
            r: hex >> 16,
            g: (hex & 0x00FF00) >> 8,
            b: (hex & 0x0000FF)
            /* jshint ignore:end */
        };
    }

    // Keeps value within min and max
    function keepWithin(value, min, max) {
        if( value < min ) value = min;
        if( value > max ) value = max;
        return value;
    }

    var _changeMiniColor = function (hexInputElement, settings, colorPickEl, onSubmit, context) {
        let value = hexInputElement.val();
        value = value ? value : settings.defaultValue;
        colorPickEl.find('.minicolors-input').val(value);
        colorPickEl.minicolors('value', value);
    //    onSubmit.call(context, colorPickEl.minicolors('rgbaString'), value, colorPickEl.data('opacity'));
    }

//------------------------------------------------------- End - Functions from mini color picker library -------------------------------------------------------------------------------------
 




}));