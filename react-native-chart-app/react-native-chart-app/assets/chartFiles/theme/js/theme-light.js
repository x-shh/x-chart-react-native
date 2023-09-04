Highcharts.theme = {
    credits: {
        enabled: false
    },
    colors: ["#FFFFFF", "#90ee7e", "#f45b5b", "#7798BF", "#aaeeee", "#ff0066", "#eeaaee", "#55BF3B", "#DF5353", "#7798BF", "#ff4400", "#ff4400"],
    chart: {
        backgroundColor: {
            linearGradient: {
                x1: 0,
                y1: 0,
                x2: 1,
                y2: 1
            },
            stops: [[0, '#e7e7e7'], [1, '#e7e7e7']]
        },
        style: {
            fontFamily: "'Unica One', sans-serif"
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
    xAxis: {
        gridLineColor: '#CCCCCC',
        labels: {
            style: {
                color: '#5e5e5e'
            }
        },
        lineColor: '#999999',
        minorGridLineColor: '#616262',
        alternateGridColor: '#E7E7E7',
        gridLineWidth: 1,
        tickColor: '#777777',
        title: {
            style: {
                color: '#DDDDDD'
            }
        },
        crosshair: {
            color: "#333333",
            width: 0.5,
            label: {
                padding: 4,
                style: {
                    textAlign: 'center'
                },
                backgroundColor: 'rgba(80, 80, 80, 1.00)',
                color: "#fff"
            }
        }
    },


    yAxis: {
        gridLineColor: '#CCCCCC',
        labels: {
            style: {
                color: '#5e5e5e'
            }
        },

        lineColor: '#999999',
        tickColor: '#888888',
        title: {
            style: {
                color: '#AAAAAA'
            }
        },
        minorGridLineColor: '#CCCCCC',

        crosshair: {
            color: "#333333",
            width: 0.5,
            label: {
                padding: 4,
                style: {
                    textAlign: 'center'
                },
                backgroundColor: 'rgba(80, 80, 80, 1.00)',
                color: "#fff"
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
        borderColor: 'rgba(255, 132, 0,0)',

        style: {
            color: '#F0F0F0'
        }
    },
    plotOptions: {
        series: {
            dataLabels: {
                color: '#444444'
            },
            marker: {
                lineColor: '#888888'
            }
        },
        boxplot: {
            fillColor: '#505050'
        },
        candlestick: {
            color: '#ff4400',
            lineColor: '#f03300',
            upColor: '#24c930',
            upLineColor: '#20c02b'


        },
        engulfingCandles: {
            color: '#ff4400',
            lineColor: '#f03300',
            upColor: '#24c930',
            upLineColor: '#20c02b'
        },
        line: {
            lineColor: '#ff4400',
            color: '#ff4400'
        },
        ohlc: {
            color: '#ff4400',
            upColor: '#24c930',
            upLineColor: '#20c02b'
        },
        hlc: {
            color: '#ff4400',
            upColor: '#24c930',
            upLineColor: '#20c02b'
        },
        heikinashi: {
            color: '#ff4400',
            upColor: '#24c930',
            lineColor: '#ff4400',
            upLineColor: '#24c930'
        },
        point: {
            color: '#ff4400',
            upColor: '#24c930',
            lineColor: '#ff4400',
            upLineColor: '#24c930'
        },
        equivolume: {
            color: '#ff4400',
            upColor: '#24c930',
            lineColor: '#ff4400',
            upLineColor: '#24c930'
        },
        dash: {
            color: '#ff4400'
        },
        step: {
            color: '#ff4400'
        },
        volume: {
            color: '#ff4400',
            lineColor: '#ff4400',
            upColor: '#24c930',
            upLineColor: '#24c930',
            threshold: null
        },
        area: {
            color: '#ff4400',
            fillColor: {
                linearGradient: {x1: 0, y1: 0, x2: 0, y2: 1},
                stops: [
                    [0, 'rgba(255,93,49,0.9)'],
                    [1, 'rgba(177,55,11,0.2)']
                ]
            },
            threshold: null
        },
        column: {
            color: '#ff4400',
            threshold: null
        },
        errorbar: {
            color: '#555555'
        },
        plotrange: {
            color: 'rgba(255,93,49,0.5)'
        }
    },
    legend: {
        itemStyle: {
            color: '#0c0c0c'
        },
        itemHoverStyle: {
            color: '#bbbbbb'
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
            stroke: '#FFFFFF',
            style: {
                color: '#000CCC'
            },
            states: {
                hover: {
                    fill: '#707073',
                    stroke: '#FFFFFF',
                    style: {
                        color: 'white'
                    }
                },
                select: {
                    fill: '#FFFFFF',
                    stroke: '#FFFFFF',
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
                [0, 'rgba(255,93,49,0.3)'],
                [1, 'rgba(208,10,32,0.3)']
            ]
        },

        maskInside: true,
        handles: {
            backgroundColor: 'rgba(97,97,97,0.2)',
            borderColor: 'rgba(97,97,97,0.8)'
        },
        outlineColor: 'rgba(97,97,97,0)',
        series: {
            color: '#f50',
            lineColor: '#f80',
            fillColor : 'rgb(255, 85, 0)'
        },


        xAxis: {
            gridLineColor: '#e7e7e7',
            labels: {
                style: {
                    color: '#000111'

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
        rifleColor: '#aaaaaa',
        trackBackgroundColor: '#404042',
        trackBorderColor: '#404043'
    },
    loading: {
        style: {
            backgroundColor: '#e7e7e7'
        },
        labelStyle: {
            color: '#ff4400',
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
    seriesColorMap: ["#A44589", "#5A45AD", "#00CED1", "#EE4555"], // colors for comparison series
    red: ["#bf1212"],
    green: ["#52ac62"],
    indicator: {
        title: {
            backgroundColor: "#C2C2C1",
            textColor: "#484848",
            stroke: "rgba(255,255,255,0)",
            buttonColor: "#7B7B7B",
            buttonTextColor: "#fff",
            buttonStroke: "rgba(255,255,255,0)",
            buttonRadius : 0,
            legendPadding : 5,
            legendItemPadding : 5,
            colorBoxHeight : 6,
            colorBoxWidth : 6,
            background : {
                height: 20,
                fill: "#48484A",
                stroke: "#FFFFFF",
                strokeWidth: 2,
                rx: 4
            }
        },
        axisBackgroundColor: "#DCDCDC"
    },
    crosshair: {
        lineColor: "#333333",
        label: {
            color: "#fff",
            fill: "rgba(80, 80, 80, 1.00)"
        }
    },
    resizeHandler: {
        backgroundColor: '#cccccc',
        color: '#333',
        height: 8
    },
    lastLine: {
        color: "#7c7c7c",
        labelColor: "#7c7c7c",
        label: {
            fontSize : "11px",
            color: "#FFFFFF",
            fill: "#7c7c7c"
        }
    },
    preCloseLine: {
        color: "#9c9c9c",
        labelColor: "#9c9c9c",
        label: {
            fontSize : "11px",
            color: "#FFFFFF",
            fill: "#9c9c9c"
        }
    },
    colorGradients: [
        ["rgba(248,80,50,1)", "rgba(248,80,50,0.9)", "rgba(248,80,50,0.8)", "rgba(248,80,50,0.7)", "rgba(248,80,50,0.6)", "rgba(248,80,50,0.5)", "rgba(248,80,50,0.4)", "rgba(248,80,50,0.3)"],
        ["rgba(76,133,27,1)", "rgba(76,133,27,0.9)", "rgba(76,133,27,0.8)", "rgba(76,133,27,0.7)", "rgba(76,133,27,0.6)", "rgba(76,133,27,0.5)", "rgba(76,133,27,0.4)", "rgba(76,133,27,0.3)"]
    ]
};

// Apply the theme
Highcharts.setOptions(Highcharts.theme);