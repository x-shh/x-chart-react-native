window.infChart = window.infChart || {};
infChart.structureManager = infChart.structureManager || {};

infChart.structureManager.trading = (function () {

    var getHTML = function () {
        return '<div>' +
            '<div inf-cont="trade-summary">' +
            '<ul inf-cont="action-btns">' + _getActionButtons() + '</ul>' +
            '<ul inf-cont="summary-data" class="stx-account">' + _getSummaryDataHTML() + '</ul>' +
            '</div>' +
            '<div inf-cont="trade-detail" class="trade-summary panel panel-default">' +
            '<div inf-cont="action-btns" class="panel-heading option-panel">' + _getActionButtons() + '</div>' +
            '<div class="panel-body">' +
            '<div inf-cont="account-summary" class="details-panel">' + _getAccountSummaryHTML() + '</div>' +
            '<div inf-cont="positions" class="ts-section">' + _getPositionsHTML() + '</div>' +
            '<div inf-cont="order-list" class="ts-section">' + _getOrderListHTML() + '</div>' +
            '</div>' +
            '</div>' +
            '</div>';
    };

    var getMarketOrderHTML = function () {
        return '<div class="order-window " inf-cont="market-order">' +
            '<span inf-action="close-popup" class="icon ico-close ow-close" data-dismiss="modal"></span>' +
            '<div class="sub-row">' +
            '<div class="form-group group1">' +
            '<label data-localize="label.shares">' + 'Quantity'/*infChart.manager.getLabel("label.shares")*/ + '</label>' +
            '<input class="form-control" inf-action="mkt-shares" value="">' +
            '</div>' +
            '<div class="form-group group2">' +
            '<label  data-localize="label.amount">' + 'Value'/* infChart.manager.getLabel("label.amount") */ + '</label>' +
            '<input class="form-control"  inf-action="mkt-value" value="">' +
            '</div>' +
            '</div>' +
            '<div class="sub-row">' +
            '<div class="form-group group1">' +
            '<label data-localize="label.stopLoss">' + infChart.manager.getLabel("label.stopLoss") + '</label>' +
            '<input class="form-control"  inf-ref="mkt-stp-loss" value="" disabled>' +
            '</div>' +
            '<div class="form-group group2">' +
            '<label data-localize="label.takeProfit">' + infChart.manager.getLabel("label.takeProfit") + '</label>' +
            '<input class="form-control"  inf-ref="mkt-take-profit" value="" disabled>' +
            '</div>' +
            '</div>' +
            '<div class="sub-row row3">' +
            '<div class="form-group group1">' +
            '<button class="btn btn-primary ow-buy-sell" type="submit" inf-action="order" inf-order-side="' + infChart.constants.chartTrading.orderSide.buy + '" data-localize="label.buy"><span>' + infChart.manager.getLabel("label.buy") + '</span><span inf-ref="last-val"></span></button>' +
            '</div>' +
            '<div class="form-group group2">' +
            '<button class="btn btn-warning ow-buy-sell" type="submit" inf-action="order" inf-order-side="' + infChart.constants.chartTrading.orderSide.sell + '" data-localize="label.sell"><span>' + infChart.manager.getLabel("label.sell") + '</span><span inf-ref="last-val"></span></button>' +
            '</div>' +
            '</div>' +

            '</div>';

    };

    var getOrderConfirmationHTML = function () {
        return '<div class="body">' +
            '<div class="body-raw">' +
            '<div>Description</div>' +
            '<div  inf-ref="orderDesc"></div>' +
            '</div>' +
            '<div class="body-raw">' +
            '<div>Price</div>' +
            '<div inf-ref="orderPrice"></div>' +
            '</div>' +
            '<div class="body-raw">' +
            '<div>Time-in-force</div>' +
            '<div inf-ref="tifType" ></div>' +
            '</div>' +
            '<div class="body-raw" style ="display:none">' +
            '<div>OTO</div>' +
            '<div inf-ref="oto" >Sell 156.29 / Sell 143.59 STP</div>' +
            '</div>' +
            '<div class="body-raw">' +
            '<label class="small"><input inf-ref="disable" type="checkbox"> Disable Confirmations For Session</label>' +
            '</div>' +
            '</div>';
    };

    var getOrderTicketLimitHTML = function(){
        return '<div class="order-window stopl-takep"> ' +
            '<span class="icon ico-close ow-close" data-inf-action="close"></span>' +
            '<div class="form-inline">' +
            '<div class="form-group"><label data-rel="type" class="label label-default"></label></div>' +
            '<div class="form-group">' +
            '<div><span data-rel="value"></span></div>' +
            '<div><span data-rel="pct"></span></div>' +
            '</div>' +
            '</div>' +
            '</div>';
    };

    var getOrderTicketHTML = function(){
            /*return '<div data-rel="limit-order" class="order-window trangle"> ' +
             '<span data-inf-action="close" class="icon ico-close ow-close"></span>' +
             '<div class="sub-row">' +
             '<div class="form-group group1">' +
             '<label data-rel="priceLabel">Price</label>' +
             '<input readonly="readonly" class="form-control" data-rel="price">' +
             '</div>' +
             '<div class="form-group group2">' +
             '<input data-rel="tif" value="6" readonly="readonly" type="hidden" class="form-control" >' +
             '<label data-rel="qtyLabel">Size</label>' +
             '<input class="form-control" data-rel="qty" value="100">' +
             '</div>' +
             '</div>' +
             '<div class="sub-row">' +
             '<div class="form-group group1">' +
             '<label data-rel="valueLabel">Value</label>' +
             '<input class="form-control" data-rel="value">' +
             '</div>' +
             '<div class="form-group group2" style="display:none;" data-rel="stopPriceCtrl">' +
             '<label data-rel="stopLabel">Stop</label>' +
             '<input class="form-control" data-rel="stopPrice">' +
             '</div>' +
             '</div>' +
             '<div class="sub-row row2 clearfix">' +
             '<div class="form-group group1 sl-bs-lr">' +
             '<label data-inf-action="stopLoss"><span><span class="icon ico-plus"></span>Stop &nbsp;Limit</span></label>' +
             '<label data-inf-action="cancelStopLoss" style="display: none;"><span><span class="icon ico-plus"></span>Limit</span></label>' +
             //'<label data-inf-action="takeProfit"><span><span class="icon ico-plus"></span>Take &nbsp;Profit</span></label>' +
             '<label style="display:none;">1 : <span data-inf="riskReward"></span>&nbsp;Rsk/Rwrd</label>' +
             '</div>' +
             '<div class="form-group group2 sl-bs-lr">' +
             '<button class="btn" type="submit" data-inf-action="placeOrder"></button>' +
             '<button class="btn trade-sm-btn" type="submit" data-inf-action="switchSide"><span class="icon ico-chevron-left"></span></button>' +
             '</div>' +
             '</div>' +
             '<div class="sub-row" style="margin-top:5px;"><button style="width:100%;" class="btn btn-default limit-order-btn-cancel" type="submit" data-inf-action="cancelOrder">Cancel</button></div>' +
             '</div>';*/

            return  '<div class="chart-order-window" data-rel="limit-order">' +
                        '<i class="fa fa-times close" data-inf-action="close"></i>' +
                        '<span rel="title" class="order-window-title d-none"></span>' +
                        '<div class="window-arrow" data-inf-ref="arrow"></div>' +
                        '<div class="row-item">' +
                            '<div class="item">' +
                                '<label class="item-label">Limit (<span class="currency" data-rel="secondaryCurrency" >usdt</span>)</label>' +
                                //'<span class="item-value" data-rel="price"></span>' +
                                '<input type="text" value="" data-rel="price">' +
                            '</div>' +
                            '<div class="item">' +
                                '<label class="item-label">Size (<span class="currency" data-rel="primaryCurrency">eth</span>)</label>' +
                                '<input type="text" value="" data-rel="qty">' +
                            '</div>' +
                            '<div class="item" data-rel="valueCtrl">' +
                                '<label class="item-label">Value (<span class="currency" data-rel="secondaryCurrency" >usdt</span>)</label>' +
                                '<input type="text" value="" data-rel="value">' +
                            '</div>' +
                            '<div class="item" style="display: none" data-rel="stopPriceCtrl">' +
                                '<label class="item-label">Stop (<span class="currency" data-rel="secondaryCurrency" >usdt</span>)</label>' +
                                '<input type="text" value="" data-rel="stopPrice">' +
                            '</div>' +
                            '<div class="item" style="display: none;">' +
                                '<button type="submit" class="btn btn-default" data-inf-action="stopLoss">+ Stop Limit</button>' +
                                '<button type="submit" class="btn btn-default" data-inf-action="cancelStopLoss">Limit</button>' +
                                '<button type="submit" class="btn btn-default" data-inf-action="cancelOrder">Cancel</button>' +
                                '<label>1 : <span data-inf="riskReward"></span>&nbsp;Rsk/Rwrd</label>'+
                            '</div>' +
                            '<div class="item item-wide" data-rel="warningMsg" style="display: none">' +
                                '<label data-rel="buy" class="item-label msg warning">Buying Power exceeded.</label>' +
                                '<label data-rel="sell" class="item-label msg warning">Available Quantity exceeded.</label>' +
                                '<label data-rel="qtyWarMsg" class="item-label msg warning"></label>' +
                            '</div>'+
                            '<div class="item">' +
                                '<button type="submit" class="btn v-cancel" data-inf-action="cancelOrder">Cancel</button>' +
                                '<button type="submit" class="btn" data-inf-action="placeOrder">Buy</button>' +
                            '</div>' +
                        '</div>' +
                    '</div>';
    };

    var _getActionButtons = function () {
        return '<div class="btn-group" role="group">' +
            '<button inf-action="mkt-order" type="button" class="btn btn-default">Market</button>' +
            '<button inf-action="buy-order" type="button" class="btn btn-default">Buy</button>' +
            '<button inf-action="cover-order" type="button" class="btn btn-default">Cover</button>' +
            '<button inf-action="sell-order" type="button" class="btn btn-default">Sell</button>' +
            '<button inf-action="short-order" type="button" class="btn btn-default">Short</button>' +
            '<button inf-action="brkt-order" type="button" class="btn btn-default">Bracket</button>' +
            '<button inf-action="strangle-order" type="button" class="btn btn-default">Strangle</button>' +
            '<button inf-action="straddle-order" type="button" class="btn btn-default">Straddle</button>' +
            '</div>';
    };

    var _getSummaryDataHTML = function () {
        return '<li>' +
            '<span><span original="Cash">Cash</span></span> ' +
            '<span class="tfc-current-cash">$100,000</span>' +
            '</li>' +
            '<li>' +
            '<span><span original="Funds Available">Funds Available</span></span> ' +
            '<span class="tfc-current-funds">$200,000</span>' +
            '</li>' +
            '<li>' +
            '<span><span original="Position">Position</span></span> ' +
            '<span class="tfc-current-position">0</span>' +
            '</li>';
    };

    var _getAccountSummaryHTML = function () {
        return '<div class="sub-panel">' +
            '<div class="" data-localize="label.netPortfolioVal">' + infChart.manager.getLabel("label.netPortfolioVal") + '</div>' +
            '<div inf-ref="netPortfolioVal"></div>' +
            '</div>' +
            '<div class="sub-panel">' +
            '<div class="" data-localize="label.availableMargin">' + infChart.manager.getLabel("label.availableMargin") + '</div>' +
            '<div inf-ref="availableMargin"></div>' +
            '</div>' +
            '<div class="sub-panel">' +
            '<div class="" data-localize="label.usedMargin">' + infChart.manager.getLabel("label.usedMargin") + '</div>' +
            '<div inf-ref="usedMargin"></div>' +
            '</div>';
    };

    var _getPositionsHTML = function () {
        return '<span class="table-heading" >Holdings</span>' +
            '<div class="holding-table"><table class="table table-striped table-hover" inf-ref="positions"></table></div>';
    };

    var _getOrderListHTML = function () {
        return '<span  class="table-heading" data-localize="label.openOrders">' + infChart.manager.getLabel("label.openOrders") + '</span>' +
            '<table class="orderlist-table table table-striped table-hover" inf-ref="orderList"></table>';
    };

    var _getTradingGridHTML = function(ctrlType, tradeControlOptions) {
        var html = '';
        if(ctrlType == "tradeControl") {
            var gridClass = 'chart-buy-sell-button-inner-content';
            switch (tradeControlOptions.length) {
                case 2:
                    gridClass += ' items-2';
                    break;
                case 3:
                    gridClass += ' items-3';
                    break;
                case 5:
                    gridClass += ' items-5';
                    break;
                default:
                    gridClass += ' items-3';
                    break;
            }
            html += '<div inf-pnl="tb-trading-grid"' + infChart.structureManager.common.getCtrlTypeHtml(ctrlType) +
                    ' class="' + gridClass + '" >';
            infChart.util.forEach(tradeControlOptions, function (i, key) {
                html += _getTradingOptionHTML(key);
            });
            html += '</div>'
        }
        return html;
    };

    var _getTradingOptionHTML = function (config) {
        var html;
        switch (config.ctrl) {
            case "buy":
            case "sell":
                html = _getTradingButtonHTML(config.ctrl, config.locLabel, config.btnText, config.key, config.btnClass, config.iconClass);
                break;
            case "algo-buy":
            case "algo-sell":
                html = _getAlgoTradingButtonHTML(config.ctrl, config.locLabel, config.btnText, config.key, config.btnClass, config.textClass, config.title);
                break;
            case "size":
                html = _getTradingSizeHTML(config.ctrl, config.btnText, config.key, config.divClass, config.titleCtrl);
                break;
            default:
                break;
        }
        return html;
    };

    var _getAlgoTradingButtonHTML = function (ctrlType, label, desc, value, btnClass, textClass, title) {
        return '<button class="' + btnClass + '"' + infChart.structureManager.common.getCtrlTypeHtml(ctrlType) + infChart.structureManager.common.getCtrlValueHtml(value) +
        'title="' + title + '" >' + label + '<span  class="' + textClass + '">'+ desc + '</span></button>';
    };

    var _getTradingButtonHTML = function (ctrlType, label, desc, value, btnClass, iconClass, hideValue) {
        return '<button class="' + btnClass + '"' + infChart.structureManager.common.getCtrlTypeHtml(ctrlType) + infChart.structureManager.common.getCtrlValueHtml(value) + '>' +
            (hideValue ? '' : '<div class="bs-value" inf-ref="' + ctrlType + '"></div>') +
            '<div class="bs-text"><i class="' + iconClass + '"></i data-localize="' + label + '">' + desc + '</div>' +
            '</button>';
    };

    var _getTradingSizeHTML = function (ctrlType, dec, value, divClass, titleCtrl) {
        return '<div class="' + divClass +'"' + infChart.structureManager.common.getCtrlTypeHtml(ctrlType) + infChart.structureManager.common.getCtrlValueHtml(value) + '>' +
            '<span class="title"' + infChart.structureManager.common.getCtrlTypeHtml(titleCtrl) +'>' + dec + '</span>' +
            '<input type="text" class="form-control"' + infChart.structureManager.common.getCtrlTypeHtml(ctrlType) + ' inf-ref="' + ctrlType + '">' +
            '</div>';
    };

    return {
        getHTML : getHTML,
        getMarketOrderHTML : getMarketOrderHTML,
        getOrderConfirmationHTML : getOrderConfirmationHTML,
        getOrderTicketLimitHTML : getOrderTicketLimitHTML,
        getOrderTicketHTML : getOrderTicketHTML,
        getTradingButtonHTML: _getTradingButtonHTML,
        // getTradingSizeHTML: _getTradingSizeHTML,
        // getAlgoTradingButtonHTML: _getAlgoTradingButtonHTML,
        getTradingGridHTML: _getTradingGridHTML
    }
})();
