const config = {
    interval: [
        {
            key: "I_1",
            desc: "1 m"
        },
        {
            key: "I_2",
            desc: "2 m"
        },
        {
            key: "I_3",
            desc: "3 m"
        },
        {
            key: "I_5",
            desc: "5 m"
        },
        {
            key: "I_15",
            desc: "15 m"
        },
        {
            key: "I_30",
            desc: "30 m"
        },
        {
            key: "I_60",
            desc: "1 hr",
        },
        {
            key: "I_120",
            desc: "2 hrs"
        },
        {
            key: "I_240",
            desc: "4 hrs",
        },
        {
            key: "I_360",
            desc: "6 h"
        },
        {
            key: "D",
            desc: "Daily"
        },
        {
            key: "W",
            desc: "Weekly"
        },
        {
            key: "M",
            desc: "Monthly"
        }



    ],

    chartType: 
         [
            { key: "line", desc: "Line", label: "label.line", ico: "icon ico-chart-line" },
            { key: "candlestick", desc: "Candlestick", label: "label.candlestick", ico: "icon ico-chart-candlestick" },
            { key: "area", desc: "Area", label: "label.area", ico: "icon ico-chart-area" },
            { key: "ohlc", desc: "OHLC", label: "label.ohlc", ico: "icon ico-chart-ohlc" },
            { key: "heikinashi", desc: "Heikin Ashi", label: "label.heikinashi", ico: "icon ico-chart-candle-ha" }
        ]
    
};

export default config;