window.infChart = window.infChart || {};
infChart.darkTheme = (function (infChart) {
    return {
        credits: {
            enabled: false
        },
        colors: ["#FFCC99", "#99FF66", "#FFFF66", "#00FFFF", "#00FFFF", "#FF99CC", "#FFCCFF", "#FFCC33", "#CCCCCC", "#66CCCC", "#FFFF33", "#99CCFF"],
        chart: {
            backgroundColor: "transparent",
            chartBgTopGradientColor: "transparent",
            chartBgBottomGradientColor: "transparent",
            plotBackgroundColor: "transparent",
            backgroundColorOpacity: 1,
            /* plotBackgroundColor: {
             linearGradient: [0, 0, 0, 500],
             stops: [
             [0, 'rgba(02, 09, 09, 0.5)', ],
             [1, 'rgba(31, 50, 71, 0.5)']
             ]
             },*/
            style: {
                fontFamily: "Montserrat, Roboto, 'Unica One', sans-serif",
            },
            plotBorderColor: '#444444',
            resetZoomButton : {
                position : {
                    y : 1,
                    x : 5
                },
                theme : {
                    padding : 3
                }
            }
        },
        title: {
            style: {
                color: '#E0E0E3',
                textTransform: 'uppercase',
                fontSize: '20px'
            }
        },
        subtitle: {
            style: {
                color: '#E0E0E3',
                textTransform: 'uppercase'
            }
        },
        xAxis: {
            gridLineColor: '#ffffff10',
            gridLineOpacity: 0.1,
            labels: {
                style: {
                    fontFamily: "Montserrat",
                    color: '#000000;',
                    fontSize:'10px;',
                    fontWeight:'500;'
                }
            },
            lineColor: 'rgba(255, 255, 255, 0.1)',
            minorGridLineColor: '#2B3038',
            alternateGridColor: null, //'#09283700',
            gridLineWidth: 0,
            lineWidth:1,
            tickColor: '#2B3038',
            tickLength : 0,
            title: {
                style: {
                    color: '#BBBBBB'
    
                }
            },
            crosshair: {
                color: "#506c89",
                // IMPORTANT :: don't make the width half pixel since it leads to a thicker croshair line for the volume axis
                width: 1,
                label: {
                    padding: 4,
                    style: {
                        textAlign: 'center'
                    },
                    backgroundColor: 'rgba(80, 108, 137, 1.00)',
                    color: "#fff"
                }
            }
        },
        yAxis: {
            lineColor: '#999999',
            gridLineColor: '#ffffff10',
            gridLineOpacity: 0.1,
            gridColor: '#111111',
            minorGridLineColor: '#222222',
            gridLineWidth: 0,
            tickColor: '#333333',
            labels: {
                style: {
                    fontFamily: "Montserrat",
                    color: '#000000;',
                    fontSize:'10px;',
                    fontWeight:'500;'
                }
            },
            title: {
                style: {
                    color: '#AAAAAA'
                }
            },
            crosshair: {
                color: "#506c89",
                // width: 0.5,
                // padding: 4,
                label: {
                    enabled: true,
                    padding: 4,
                    // style: "textAlign:center",
                    backgroundColor: 'rgba(80, 108, 137, 1.0)',
                    color: "#fff",
                    style: {
                        textAlign: 'center',
                        // fontSize: '0.8em'
                        // whiteSpace: 'nowrap',
                        // overflow: 'hidden',
                        // textOverflow: 'ellipsis'
                    }
                }
            }
        },
        tooltip: {
            backgroundColor: {
                linearGradient: {x1: 0, y1: 0, x2: 0, y2: 1},
                stops: [
                    [0, 'rgba(255,132,0,0)'],
                    [1, 'rgba(208,10,32,0)']
                ]
            },
            borderColor: 'rgba(0, 0, 0,0)',
            style: {
                color: 'rgba(0, 0, 0,0)'
            }
        },
        plotOptions: {
            series: {
                lineWidth : 1,
                dataLabels: {
                    color: '#EEEEEE'
                },
                marker: {
                    lineColor: '#888888'
                }
            },
            boxplot: {
                fillColor: '#505050'
            },
            candlestick: {
                lineWidth : 1,
                color: '#FB1044',
                lineColor: '#FB1044',
                upColor: '#1F7A99',
                upLineColor: '#1F7A99',
                shadow : true,
                states: {
                    hover: {
                        color: '#FF9933',
                        lineColor: '#FF9933'
                    },
                    select: {
                        color: '#FF9933',
                        lineColor: '#FF9933'
                    }
                }
            },
            line: {
                lineWidth : 1,
                lineColor: 'rgba(0, 153, 255, 1)',
                color: 'rgba(0, 153, 255, 1)' 
            },
            ohlc: {
                lineWidth : 2,
                color: '#FB1044',
                lineColor: '#FB1044',
                upColor: '#1F7A99',
                upLineColor: '#1F7A99',
                states: {
                    hover: {
                        color: '#FF9933',
                        lineColor: '#FF9933'
                    },
                    select: {
                        color: '#FF9933',
                        lineColor: '#FF9933'
                    }
                }
            },
            hlc: {
                lineWidth : 1,
                color: '#FB1044',
                lineColor: '#FB1044',
                upColor: '#1F7A99',
                upLineColor: '#1F7A99',
            },
            heikinashi: {
                lineWidth : 1,
                color: '#FB1044',
                lineColor: '#FB1044',
                upColor: '#1F7A99',
                upLineColor: '#1F7A99',
                shadow : {
                    offsetX: 1,
                    offsetY: 5,
                    width: 4,
                    opacity: 0.3,
                    color: '#000000'
                },
                states: {
                    hover: {
                        color: '#FF9933',
                        lineColor: '#FF9933'
                    },
                    select: {
                        color: '#FF9933',
                        lineColor: '#FF9933'
                    }
                }
            },
            customCandle: {
                lineWidth : 1,
                color: '#BF3404',
                lineColor: '#BF3404',
                upColor: '#5ABF0D',
                upLineColor: '#5ABF0D',
                shadow : true,
                states: {
                    hover: {
                        color: '#52ECF5',
                        lineColor: '#52ECF5'
                    },
                    select: {
                        color: '#52ECF5',
                        lineColor: '#52ECF5'
                    }
                }
            },
            engulfingCandles: {
                lineWidth : 1,
                color: '#d31d1d',
                lineColor: '#d31d1d',
                upColor: '#56c33f',
                upLineColor: '#56c33f',
                shadow : true,
                states: {
                    hover: {
                        color: '#52ECF5',
                        lineColor: '#52ECF5'
                    },
                    select: {
                        color: '#52ECF5',
                        lineColor: '#52ECF5'
                    }
                },
                bullish:'#CCCC33',
                bearish: '#666666'
            },
            point: {
                lineWidth : 1,
                color: '#BF3404',
                lineColor: '#BF3404',
                upColor: '#5ABF0D',
                upLineColor: '#5ABF0D'
            },
            equivolume: {
                lineWidth : 1,
                color: '#BF3404',
                lineColor: '#BF3404',
                upColor: '#5ABF0D',
                upLineColor: '#5ABF0D'
            },
            dash: {
                lineWidth : 1,
                color: 'rgba(255, 0, 0, 1)'
            },
            step: {
                lineWidth : 1,
                color: '#ffffff',//'#F45B5B' https://xinfiit.atlassian.net/browse/CCA-3230
                lineColor: '#ffffff'
            },
            volume: {
                lineWidth: 0,
                color: '#BF3404',
                lineColor: '#BF3404',
                upColor: '#5ABF0D',
                upLineColor: '#5ABF0D',
                threshold: null
            },
            column: {
                lineWidth : 1,
                color: 'rgba(106, 186, 94, 1)',
                threshold: null
            },
            area: {
                lineWidth : 1,
                color: 'rgba(0, 153, 255, 1)',
                lineColor: 'rgba(0, 153, 255, 1)',
                fillColor: {
                    linearGradient: {x1: 0, y1: 0, x2: 0, y2: 1},
                    stops: [
                        [0, 'rgba(0, 153, 255, 0.6)'],
                        [1, 'rgba(0, 153, 255, 0)']
                    ]
                },
                threshold: null
            },
            errorbar: {
                color: 'ccc'
            }
            // ,
            // plotrange: {
            //     color: 'rgba(255,93,49,0.5)'
            // }
        },
        legend: {
            itemStyle: {
                color: '#3a3a3a'
            },
            itemHoverStyle: {
                color: '#aaa'
            },
            itemHiddenStyle: {
                color: '#606063'
            }
        },
        labels: {
            style: {
                color: '#707073'
            }
        },
        drilldown: {
            activeAxisLabelStyle: {
                color: '#F0F0F3'
            },
            activeDataLabelStyle: {
                color: '#F0F0F3'
            }
        },
        navigation: {
            buttonOptions: {
                symbolStroke: '#DDDDDD',
                theme: {
                    fill: '#505053'
                }
            }
        },
        // scroll charts
        rangeSelector: {
            buttonTheme: {
                fill: '#505053',
                stroke: '#000000',
                style: {
                    color: '#CCC'
                },
                states: {
                    hover: {
                        fill: '#707073',
                        stroke: '#000000',
                        style: {
                            color: 'white'
                        }
                    },
                    select: {
                        fill: '#000000',
                        stroke: '#000000',
                        style: {
                            color: 'white'
                        }
                    }
                }
            },
            inputBoxBorderColor: '#505050',
            inputStyle: {
                backgroundColor: '#888888',
                color: 'silver'
            },
            labelStyle: {
                color: 'silver'
            }
        },
        navigator: {
            height: 55,
            color: '#fff',
            backgroundColor: 'rgba(97,97,97,0.2)',
            maskFill: {
                linearGradient: {x1: 0, y1: 0, x2: 0, y2: 1},
                stops: [
                    [0, 'rgba(50, 54, 61, 0.5)'],
                    [1, 'rgba(27, 29, 33, 0.25)']
                ]
            },
    
            maskInside: true,
            handles: {
                backgroundColor: 'rgba(27, 29, 33, 0.2)',
                borderColor: 'rgba(255, 255, 255, 0.8)'
            },
            outlineColor: 'rgba(97,97,97,0)',
            series: {
                color: '#0099FF',
                lineColor: '#0099FF',
                fillColor: {
                    linearGradient: {x1: 0, y1: 0, x2: 0, y2: 1},
                    stops: [
                        [0, 'rgba(0, 153, 255, 0.6)'],
                        [1, 'rgba(0, 153, 255, 0)']
                    ]
                }
            },
    
    
            xAxis: {
                gridLineColor: '#222222',
                labels: {
                    style: {
                        color: '#fffffe'
    
                    }
                }
            }
    
    
        },
        scrollbar: {
            barBackgroundColor: '#808083',
            barBorderColor: '#808083',
            buttonArrowColor: '#CCCCCC',
            buttonBackgroundColor: '#606063',
            buttonBorderColor: '#606063',
            rifleColor: '#AAAAAA',
            trackBackgroundColor: '#404043',
            trackBorderColor: '#404043'
        },
        loading: {
            style: {
                backgroundColor: '#8c8c8e'
            },
            labelStyle: {
                color: '#a10000',
                fontSize: "20px"
    
            }
        },
        // special colors for some of the
        legendBackgroundColor: 'rgba(0, 0, 0, 0.5)',
        background2: '#505053',
        dataLabelsColor: '#B0B0B3',
        textColor: '#C0C0C0',
        contrastTextColor: '#F0F0F3',
        maskColor: 'rgba(255,255,255,0.3)',
        seriesColorMap: ["#FFCC00", "#0099FF", "#FF3333", "#00CC99", "#6600FF", "#FF9900"], // colors for comparison series
        red: ["#FF3333"],
        green: ["#336699"], 
        indicator: {
            // title: {
            //     backgroundColor: "#48484A",
            //     textColor: "#9C9C9C",
            //     stroke: "rgba(255,255,255,0)",
            //     buttonColor: "#7B7B7B",
            //     buttonTextColor: "#fff",
            //     buttonStroke: "rgba(255,255,255,0)"
            // },
            title: {
                backgroundColor: "#48484A",
                textColor: "#858587",
                stroke: "rgba(255,255,255,0)",
                buttonColor: "rgba(133, 133, 135, 0.5)",
                buttonTextColor: "#ffffff",
                buttonStroke: "rgba(133, 133, 135, 0.25)",
                buttonRadius : 2,
                legendPadding : 5,
                legendItemPadding : 5,
                colorBoxHeight : 6,
                colorBoxWidth : 6,
                background : {
                    height : 20,
                    fill : "rgba(47,46,51,.95)",
                    stroke : "#858587",
                    strokeWidth : 1,
                    rx:3
                }
            },
            axisBackgroundColor: "#171A23",
                
            /*Bid Ask History Indicator*/
            'BAH' : {
                bid:  {
                    lineColor : '#009f34',
                    fillColor : '#6aba5e',
                    fillOpacity : 0.2
                },
                ask :  {
                    lineColor : '#9f0400',
                    fillColor : '#eb6a5a',
                    fillOpacity : 0.2
                }
            },
            'BB' : {
                color: "#1999ff",
                lineColor: "#1999FF",
                areaFillOpacity: 0.1,
                lineFillOpacity: 0.5
            },
            'RSI': {
                fillOpacity : 0.2
            }
        },
        drawing : {
            base: {
                borderColor: '#959595',
                fillColor: '#959595',
                fillOpacity: 0.5,
                lineWidth: 2,
                dashstyle: 'solid',
                fontColor: '#959595',
                fontSize: '12'
            },
            label : {
                style: {
                    color: '#000000',
                    fontSize: '12px',
                    cursor: 'move',
                    fontWeight: '500',
                    fontStyle: 'normal',
                    textDecoration: 'inherit'
                },
                borderAttributes: {
                    stroke: '#FFFFFF',
                    'stroke-width': 1,
                    padding: 4,
                    r: 0,
                    fill: '#FFFFFF'
                }
            },
            trendLine: {
                label: {
                    fill: "#858587",
                    stroke: "#FFFFFF",
                    opacity: 1,
                    fontColor: "#ffffff",
                    fontSize: "12",
                    fontOpacity: 1
                }
            },
            selectPointStyles : {
                'stroke-width': 2,
                stroke: '#959595',
                fill: '#121212',
                dashstyle: 'solid',
                'shape-rendering': 'crispEdges',
                'z-index': 10,
                cursor: 'crosshair'
            },
            axisLabel: {
               fill: "#07A7FB",
               stroke: "#07A7FB",
               opacity: 1,
               fontColor: "#ffffff"
            },
            shortLineAxisLabel: {
                fill: "#FF4D4D",
                stroke: "#FF4D4D",
                fontColor: "#FFFFFF",
                opacity: 1,
                stoploss: {
                    lineLabel: {
                        color: '#FFFFFF',
                        fill: '#191B1E',
                        stroke: '#292E33',
                        'stroke-width': 1
                    },
                    lineTagLabel : {
                        color: '#FFFFFF',
                        fill : '#FF4D4D',
                        stroke: '#292E33',
                        'stroke-width': 1
                    }
                },
                takeProfit: {
                    lineLabel: {
                        color: '#FFFFFF',
                        fill: '#191B1E',
                        stroke: '#292E33',
                        'stroke-width': 1
                    },
                    lineTagLabel : {
                        color: '#FFFFFF',
                        fill : '#336699',
                        stroke: '#292E33',
                        'stroke-width': 1
                    }
                },
                mainTypeLabel: {
                    foreignObject: {
                        color: '#EB6A5A',
                        'background-color': '#191B1E',
                        'text-align': 'center',
                        'font-size': '12px',
                    },
                    insideIcon: {
                        stroke: '#FF4D4D',
                        'stroke-width': '1px',
                        'border-style': 'solid'
                    }
                }
            },
            longLineAxisLabel: {
                fill: "#336699",
                stroke: "#336699",
                fontColor: "#FFFFFF",
                opacity: 1,
                stoploss: {
                    lineLabel: {
                        color: '#FFFFFF',
                        fill: '#191B1E',
                        stroke: '#292E33',
                        'stroke-width': 1
                    },
                    lineTagLabel : {
                        color: '#FFFFFF',
                        fill : '#FF4D4D',
                        stroke: '#292E33',
                        'stroke-width': 1
                    }
                },
                takeProfit: {
                    lineLabel: {
                        color: '#FFFFFF',
                        fill: '#191B1E',
                        stroke: '#292E33',
                        'stroke-width': 1
                    },
                    lineTagLabel : {
                        color: '#FFFFFF',
                        fill : '#336699',
                        stroke: '#292E33',
                        'stroke-width': 1
                    }
                },
                mainTypeLabel: {
                    foreignObject:{
                        color: '#6ABA5E',
                        'background-color': '#191B1E',
                        'text-align': 'center',
                        'font-size': '12px'
                    },
                    insideIcon: {
                        stroke: '#336699',
                        'stroke-width': '1px',
                        'border-style': 'solid'
                    }
                }
            },
            horizontalRay: {
               fill: "#07A7FB",
               stroke: "#07A7FB",
               opacity: 1,
               fontColor: "#ffffff"
            },
            lineText: {
                fontSize: '12px'
            },
            andrewsPitchfork : {
                singleFillColor: "#959595",
                fillOpacity: 0.5,
                fibLevelFillColors: {
                    "level_0": "#726a6f",
                    "level_1": "#835974",
                    "level_2": "#7b6171",
                    "level_3": "#f8bce2",
                    "level_4": "#f075c3",
                    "level_5": "#eb40ab",
                    "level_6": "#c71585",
                    "level_7": "#800e56",
                }
            },
            fibonacci : {
                fontSize: 10,
                singleFillColor: '#3A8DC9'
            },
            fibVerRetracements: {
                fillOpacity: 0,
                fontSize: 10,
                opacity: 1,
                dashstyle: 'solid',
                stroke: "#959595",
                fibLevelFillColors: {
                    "level_0": "#726a6f",
                    "level_1": "#835974",
                    "level_2": "#7b6171",
                    "level_3": "#f8bce2",
                    "level_4": "#f075c3",
                    "level_5": "#eb40ab",
                    "level_6": "#c71585",
                    "level_7": "#800e56",
                    "level_8": "#4b0832",
                    "level_9": "#726a6f",
                    "level_10": "#835974",
                    "level_11": "#7b6171",
                    "level_12": "#f8bce2",
                    "level_13": "#f075c3"
                }
            },
            fibArcs : {
                fontSize: 10,
                fillOpacity: 0.5,
                // fibLevelFillColors: {
                //     "P_38.2": "#4b0832",
                //     "P_50": "#f075c3",
                //     "P_61.8": "#f6aada"
                // }
                fibLevelFillColors: {
                    "level_0": "#4b0832",
                    "level_1": "#f075c3",
                    "level_2": "#f6aada"
                }
            },
            fibRetracements: {
                singleFillColor: "#959595",
                fillOpacity: 0,
                stroke: "#959595",
                opacity: 1,
                dashstyle: 'solid',
                fontSize: 10,
                fibLevelFillColors: {
                    "level_0": "#726a6f",
                    "level_1": "#835974",
                    "level_2": "#7b6171",
                    "level_3": "#f8bce2",
                    "level_4": "#f075c3",
                    "level_5": "#eb40ab",
                    "level_6": "#c71585",
                    "level_7": "#800e56",
                    "level_8": "#4b0832",
                    "level_9": "#726a6f",
                    "level_10": "#835974",
                    "level_11": "#7b6171",
                    "level_12": "#f8bce2",
                    "level_13": "#f075c3"
                }
            },
            fib3PointPriceProjection: {
                fillOpacity: 0,
                stroke: "#959595",
                opacity: 1,
                dashstyle: 'solid',
                fontSize: 10,
                fibLevelFillColors: {
                    "level_0": "#726a6f",
                    "level_1": "#835974",
                    "level_2": "#7b6171",
                    "level_3": "#f8bce2",
                    "level_4": "#f075c3",
                    "level_5": "#eb40ab",
                    "level_6": "#c71585",
                    "level_7": "#800e56",
                    "level_8": "#4b0832",
                    "level_9": "#726a6f",
                    "level_10": "#835974",
                    "level_11": "#7b6171",
                    "level_12": "#f8bce2",
                    "level_13": "#f075c3"
                }
            },
            fib3PointPriceProjectionGeneric: {
                fillOpacity: 0,
                stroke: "#959595",
                opacity: 1,
                dashstyle: 'solid',
                fontSize: 10,
                fibRetrancement: {
                    fillOpacity: 0,
                    fontSize: 10,
                    fontColor: "#FF9933",
                    fontWeight: 'normal'
                },
                fibRetrancementLevelFillColors: {
                    "level_0": "#726a6f",
                    "level_1": "#835974",
                    "level_2": "#7b6171",
                    "level_3": "#f8bce2",
                    "level_4": "#f075c3",
                    "level_5": "#eb40ab",
                    "level_6": "#c71585",
                    "level_7": "#800e56",
                    "level_8": "#4b0832",
                    "level_9": "#726a6f",
                    "level_10": "#835974",
                    "level_11": "#7b6171",
                    "level_12": "#f8bce2",
                    "level_13": "#f075c3",
                    "level_14": "#eb40ab",
                    "level_15": "#c71585"
                },
                fibExtention: {
                    fillOpacity: 0,
                    fontSize: 10,
                    fontColor: "#0099FF",
                    fontWeight: 'normal'
                },
                fibExtentionLevelFillColors: {
                    "level_0": "#726a6f",
                    "level_1": "#835974",
                    "level_2": "#7b6171",
                    "level_3": "#f8bce2",
                    "level_4": "#f075c3",
                    "level_5": "#eb40ab",
                    "level_6": "#c71585",
                    "level_7": "#800e56",
                    "level_8": "#4b0832",
                    "level_9": "#726a6f",
                    "level_10": "#835974",
                    "level_11": "#7b6171",
                    "level_12": "#f8bce2",
                    "level_13": "#f075c3",
                    "level_14": "#eb40ab",
                    "level_15": "#c71585"
                }
            },
            fib3PointTimeProjection: {
                fontSize: 10,
                stroke: "#959595"
            },
            fib2PointTimeProjection: {
                fontSize: 10,
                stroke: "#959595"
            },
            fibFans : {
                fontSize: 10,
                fillOpacity: 0.5,
                // fibLevelFillColors: {
                //     "P_38.2": "#FFB6C1",
                //     "P_50": "#ADD8E6",
                //     "P_61.8": "#D3D3D3"
                // }
                fibLevelFillColors: {
                    "level_0": "#FFB6C1",
                    "level_1": "#ADD8E6",
                    "level_2": "#D3D3D3"
                }
            },
            regressionChannel : {
                fillColors: {
                    "upper": "#726a6f",
                    "lower": "#835974"
                }
            },
            abcdPattern: {
                fillOpacity:0.3,
                label: {
                    fill: "#2f2e33",
                    stroke: "#000000",
                    opacity: 1,
                    fontColor: "#000000"
                }
            },
            elliotTriangleWave: {
                fillOpacity:0.3,
                label: {
                    fill: "#858587",
                    stroke: "#FFFFFF",
                    opacity: 1,
                    fontColor: "#ffffff"
                }
            },
            elliotImpulseWave: {
                fillOpacity:0.3,
                label: {
                    fill: "#858587",
                    stroke: "#FFFFFF",
                    opacity: 1,
                    fontColor: "#ffffff"
                }
            },
            elliotCorrectiveTripleWave: {
                fillOpacity:0.3,
                label: {
                    fill: "#858587",
                    stroke: "#FFFFFF",
                    opacity: 1,
                    fontColor: "#ffffff"
                }
            },
            elliotCorrectiveWave: {
                fillOpacity:0.3,
                label: {
                    fill: "#858587",
                    stroke: "#FFFFFF",
                    opacity: 1,
                    fontColor: "#ffffff"
                }
            },
            elliotCorrectiveDoubleWave: {
                fillOpacity:0.3,
                label: {
                    fill: "#858587",
                    stroke: "#FFFFFF",
                    opacity: 1,
                    fontColor: "#ffffff"
                }
            },
            timestampMarker : {
                borderColor: '#0000FF',
                fillColor: '#0000FF',
                fillOpacity: 0.5,
                fontColor: '#0000FF',
                fontSize: '20px'
            },
            longPositions: {
                stopLossColor: '#FF4D4D',
                stopLossFillOpacity: 0.25,
                takeProfitColor: '#336699',
                takeProfitFillOpacity: 0.25,
            },
            shortPositions: {
                stopLossColor: '#FF4D4D',
                stopLossFillOpacity: 0.25,
                takeProfitColor: '#336699',
                takeProfitFillOpacity: 0.25,
            },
            harmonicPattern: {
                fillOpacity:0.3,
                label: {
                    fill: "#2f2e33",
                    stroke: "#000000",
                    opacity: 1,
                    fontColor: "#000000"
                }
            },
            downArrow: {
                fillColor: '#FF4D4D',
                fontColor: '#999999'
            },
            upArrow: {
                fillColor: '#336699',
                fontColor: '#999999'
            }
        },
        crosshair: {
            lineColor: "#ffffff",
            label: {
                color: "#ffffff",
                fill: "rgba(80, 80, 80, 1.00)"
            }
        },
        resizeHandler: {
            backgroundColor: '#383E4C',
            color: '#9C9C9C',
            height: 4
        },
        lastLine: {
            color: "#E04500",
            labelColor: "#E04500",
            label: {
                fontSize: "13px",
                color: "#FFFFFF",
                fill: "#4e83da"
            }
        },
        preCloseLine: {
            color: "#9c9c9c",
            labelColor: "#9c9c9c",
            label: {
                fontSize: "11px",
                color: "#FFFFFF",
                fill: "#9c9c9c"
            }
        },
        colorGradients: [
            ["rgba(248,80,50,1)", "rgba(248,80,50,0.9)", "rgba(248,80,50,0.8)", "rgba(248,80,50,0.7)", "rgba(248,80,50,0.6)", "rgba(248,80,50,0.5)", "rgba(248,80,50,0.4)", "rgba(248,80,50,0.3)"],
            ["rgba(76,133,27,1)", "rgba(76,133,27,0.9)", "rgba(76,133,27,0.8)", "rgba(76,133,27,0.7)", "rgba(76,133,27,0.6)", "rgba(76,133,27,0.5)", "rgba(76,133,27,0.4)", "rgba(76,133,27,0.3)"]
        ],
        eido: {
            plotOptions: {
                arearange: {
                    lineColor: "#36b3d6",
                    color: "#36b3d6"
                },
                series: {
                    color: "#2d81a1"
                },
                line: {
                    lineColor: "#2d81a1",
                    color: "#2d81a1"
                }
            },
            xAxis: {
                plotBands: {
                    color: 'rgba(255, 255, 255, 0.03)'
                }
            }
        },
        watermark: {
            color: '#32363d',
            opacity: 0.1
    
        },
        chartTrading : {
            buyColor: "#6aba5e",
            sellColor: "#eb6a5a",
            tradingLine: {
                buyColor: "#336699",
                sellColor: "#FF4D4D",
                color : '#218aab',
                opacity : 1,
                padding: 6,
                label: {
                    fill: "#1b1d21",
                    fontColor: "#ffffff",
                    stroke: "#32363d",
                    fontWeight: 500,
                    slFillColor: "#FF4d4d", // stop loss order label fill color
                    tpFillColor: "#336699" // take profit order label fill color
                },
                subLabel: {
                    fontColor: "#ffffff"
                },
                cancelColor: "#eb6a5a",
                cancelFontColor: "#ffffff",
                cancelFontWeight: 500,
                transmitColor: "#4e83da",
                transmitFontColor: "#ffffff",
                transmitFontWeight: 500,
                revertColor: "#838799",
                revertFontColor: "#ffffff",
                revertFontWeight: 500
            }
        },
        depth :{
            stackedOptions : [
                {
                    'color': "#FF6600",
                    'lineColor': "#FF6600",
                    'fillColor': {
                        'linearGradient': {'x1': 0, 'y1': 0, 'x2': 0, 'y2': 1},
                        'stops': [
                            [0, 'rgb(255, 102, 0)'],
                            [1, 'rgba(255, 102, 0, 0.3)']
                        ]
                    }
                }, {
                    'color': "#6600CC",
                    'lineColor': "#6600CC",
                    'fillColor': {
                        'linearGradient': {'x1': 0, 'y1': 0, 'x2': 0, 'y2': 1},
                        'stops': [
                            [0, 'rgb(115, 0, 230)'],
                            [1, 'rgba(115, 0, 230, 0.3)']
                        ]
                    }
                }, {
                    'color': "#0033CC",
                    'lineColor': "#0033CC",
                    'fillColor': {
                        'linearGradient': {'x1': 0, 'y1': 0, 'x2': 0, 'y2': 1},
                        'stops': [
                            [0, 'rgb(26, 83, 255)'],
                            [1, 'rgba(26, 83, 255, 0.3)']
                        ]
                    }
                }, {
                    'color': "#10FFDF",
                    'lineColor': "#10FFDF",
                    'fillColor': {
                        'linearGradient': {'x1': 0, 'y1': 0, 'x2': 0, 'y2': 1},
                        'stops': [
                            [0, 'rgb(0, 221, 182)'],
                            [1, 'rgba(0, 151, 124, 0.3)']
                        ]
                    }
                }, {
                    'color': "#FF9933",
                    'lineColor': "#FF9933",
                    'fillColor': {
                        'linearGradient': {'x1': 0, 'y1': 0, 'x2': 0, 'y2': 1},
                        'stops': [
                            [0, 'rgb(255, 204, 26)'],
                            [1, 'rgba(255, 204, 26, 0.3)']
                        ]
                    }
                }, {
                    'color': "#99FF33",
                    'lineColor': "#99FF33",
                    'fillColor': {
                        'linearGradient': {'x1': 0, 'y1': 0, 'x2': 0, 'y2': 1},
                        'stops': [
                            [0, 'rgb(134, 228, 0)'],
                            [1, 'rgba(105, 179, 0, 0.3)']
                        ]
                    }
                }, {
                    'color': "#94a3ff",
                    'lineColor': "#94a3ff",
                    'fillColor': {
                        'linearGradient': {'x1': 0, 'y1': 0, 'x2': 0, 'y2': 1},
                        'stops': [
                            [0, 'rgb(119, 138, 255)'],
                            [1, 'rgba(0, 32, 226, 0.3)']
                        ]
                    }
                }, {
                    'color': "#e7a8ff",
                    'lineColor': "#e7a8ff",
                    'fillColor': {
                        'linearGradient': {'x1': 0, 'y1': 0, 'x2': 0, 'y2': 1},
                        'stops': [
                            [0, 'rgb(215, 108, 255)'],
                            [1, 'rgba(156, 74, 186, 0.3)']
                        ]
                    }
                }, {
                    'color': "#ff7cd2",
                    'lineColor': "#ff7cd2",
                    'fillColor': {
                        'linearGradient': {'x1': 0, 'y1': 0, 'x2': 0, 'y2': 1},
                        'stops': [
                            [0, 'rgb(255, 74, 193)'],
                            [1, 'rgba(198, 32, 141, 0.3)']
                        ]
                    }
                }
    
    
            ],
            'bid': {
                'color': "#0099FF",
                'lineColor': "#0099FF",
                'fillColor': {
                    'linearGradient': {'x1': 0, 'y1': 0, 'x2': 0, 'y2': 1},
                    'stops': [
                        [0, 'rgb(0, 153, 255)'],
                        [1, 'rgba(0, 153, 255, 0.1)']
                    ]
                }
            },
            'ask': {
                'color': "#FF5252",
                'lineColor': "#FF5252",
                'fillColor': {
                    'linearGradient': {'x1': 0, 'y1': 0, 'x2': 0, 'y2': 1},
                    'stops': [
                        [0, 'rgb(235, 102, 102)'],
                        [1, 'rgba(235, 102, 102, 0.1)']
                    ]
                }
            }
        },
        noData : {//'11px'
            color: '#ffffff', fontWeight: '500', fontSize: 10, backgroundColor: '#121212'
        },
        alert: {
            height: 14,
            padding: 4,
            opacity : 1,
            color: "#52CEF5",
            label: {
                fill: "#1b1d21",
                fontColor: "#ffffff",
                stroke: "#32363d",
                fontWeight: 500
            }
        },
        intradayChart: {
            pointIndicator : {
                'fillColor': '#07A7FB',
                'borderColor': '#07A7FB'
            }
        }
    };
})(infChart);