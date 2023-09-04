/**
 * Created by lasantha on 9/17/15.
 */


$(function () {
    $('#txtBaseSymbol').autocomplete({
        source: function (request, response) {
            $.ajax({
                url: "http://dev-xinfinit.rhcloud.com/rest/symbol/search",
                beforeSend: function (xhr) {
                    xhr.setRequestHeader('Authorization', 'Bearer ' + window.keycloak.token);
                },
                data: {
                    alias: request.term,
                    provider: $('#provider').val()
                },
                success: function (data) {
                    if (data && data.length === 0) {
                        response([{noData: true, label: 'No results found'}]);
                    } else {
                        response($.map(data, function (item) {
                            var dataItem = item.symbol;
                            return {
                                label: dataItem.description,
                                value: dataItem.symbol,
                                symbol: dataItem.symbol,
                                exchange: dataItem.exchange,
                                country: dataItem.country,
                                provider: dataItem.provider,
                                type: dataItem.type
                            }
                        }));
                    }
                }

            });
        },
        select: function (event, ui) {
            $('#txtBaseSymbol').val(ui.item.symbol);
            $('#txtBaseSymbolDesc').val(ui.item.label);
            $('#txtBaseSymbolType').val(ui.item.type);
            $('#txtBaseSymbolDp').val(2);
            $('#reloadChart').trigger('click');
        }
    }).autocomplete("instance")._renderItem = function (ul, item) {

        if (item && item.noData) {
            return $("<li>")
                .append('<a class="item"><span class="description">' + item.label + '</span></a>')
                .appendTo(ul);

        } else {
            return $("<li>")
                .append('<a class="item"><span class="description">' + item.label + ' - ' + item.symbol + '/' + item.exchange + '</span><br><span class="level2">' + 'Exchange: ' + item.exchange + ' Country: ' + item.country + ' Provider: ' + item.provider + ' Type: ' + item.type + '</span></a>')
                .appendTo(ul);
        }
    };


});