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
            { key: "line", desc: "Line", label: "label.line", ico: "linechart" },
            { key: "candlestick", desc: "Candlestick", label: "label.candlestick", ico: "barschart" },
            { key: "area", desc: "Area", label: "label.area", ico: "areachart" },
            { key: "ohlc", desc: "OHLC", label: "label.ohlc", ico: "barchart" },
            { key: "heikinashi", desc: "Heikin Ashi", label: "label.heikinashi", ico: "dotchart" }
        ],
    drawings: [
        {
            role: 'drawing',
            cat: 'line',
            shape: 'line',
            options: [
                {
                    role: 'drawing',
                    cat: 'line',
                    shape: 'line',
                    subType: "shape",
                    cls: 'icon ico-ang-dash',
                    active: true,
                    label: 'label.line',
                    isFavorite: false
                }
            ]
        }
    ],
    indicator: {
        options: [
            {
                key: "ADOsci",
                label: "label.indicatorDesc.ADOsci",
                desc: "Acceleration Deceleration Oscillator (ADOsci)"
            },
            { key: "ADL", label: "label.indicatorDesc.ADL", desc: "Accumulation Distribution Line (ADL)" },
            { key: "AR", label: "label.indicatorDesc.AR", desc: "Aroon (AR)" },
            { key: "ARUD", label: "label.indicatorDesc.ARUD", desc: "Aroon Up/Down (ARUD)" },
            { key: "ADX", label: "label.indicatorDesc.ADX", desc: "Average Direction Index (ADX)" },
            { key: "ATR", label: "label.indicatorDesc.ATR", desc: "Average True Range (ATR)" },
            {
                key: "AwesomeOsci",
                label: "label.indicatorDesc.AwesomeOsci",
                desc: "Awesome Oscillator (AwesomeOsci)"
            },
            { key: "BB", label: "label.indicatorDesc.BB", desc: "Bollinger Bands" },
            /* {key : 'BA', label : 'label.indicatorDesc.BA', desc : 'Bid/Ask'},*/

            { key: "BBW", label: "label.indicatorDesc.BBW", desc: "Bollinger Band Width (BBW)" },
            { key: "BearEng", label: "label.indicatorDesc.BearEng", desc: "Bearish Engulfing (BearEng)" },
            {
                key: "BullishEng",
                label: "label.indicatorDesc.BullishEng",
                desc: "Bullish Engulfing (BullishEng)"
            },
            { key: "CMF", label: "label.indicatorDesc.CMF", desc: "Chaikin Money Flow (CMF)" },
            { key: "CHO", label: "label.indicatorDesc.CHO", desc: "Chaikin Oscillator (CHO)" },
            { key: "CCI", label: "label.indicatorDesc.CCI", desc: "Commodity Channel Index (CCI)" },
            {
                key: "CoppockCurve",
                label: "label.indicatorDesc.CoppockCurve",
                desc: "Coppock Curve (CoppockCurve)"
            },
            { key: "RSIC", label: "label.indicatorDesc.RSIC", desc: "Cutler RSI (RSIC)" },
            //{key: 'DarkC', label: 'label.indicatorDesc.DarkC', desc: 'Dark Cloud (DarkC) Indicator'},
            { key: "DMIP", label: "label.indicatorDesc.DMIP", desc: "Directional Movement Plus (DMI+)" },
            { key: "DMIM", label: "label.indicatorDesc.DMIM", desc: "Directional Movement Minus (DMI-)" },
            { key: "DMI", label: "label.indicatorDesc.DMI", desc: "Directional Movement Index (DMI)" },
            { key: "DMS", label: "label.indicatorDesc.DMS", desc: "Directional Movement System (DMS)" },
            { key: "EWO", label: "label.indicatorDesc.EWO", desc: "Elliot Wave Oscillator (EWO)" },
            { key: "ENV", label: "label.indicatorDesc.ENV", desc: "Envelopes (ENV)" },
            { key: "EMA", label: "label.indicatorDesc.EMA", desc: "Exponential Moving Average (EMA)" },
            { key: "STOF", label: "label.indicatorDesc.STOF", desc: "Fast Stochastic (STOF)" },
            { key: "FUSTO", label: "label.indicatorDesc.FUSTO", desc: "Full Stochastic Oscillator(FUSTO)" },
            { key: "GMMA", label: "label.indicatorDesc.GMMA", desc: "GMMA" },
            { key: "GMMAOsci", label: "label.indicatorDesc.GMMAOsci", desc: "GMMA Oscillator (GMMAOsci)" },
            { key: "HighestH", label: "label.indicatorDesc.HighestH", desc: "Highest High (HighestH)" },
            { key: "HV", label: "label.indicatorDesc.HV", desc: "Historical Volatility (HV)" },
            { key: "ICHI", label: "label.indicatorDesc.ICHI", desc: "Ichimoku Kinko Hyo (ICHI)" },
            { key: "KELT", label: "label.indicatorDesc.KELT", desc: "KELT" },
            { key: "KST", label: "label.indicatorDesc.KST", desc: "Know Sure Thing (KST)" },
            { key: "LowestL", label: "label.indicatorDesc.LowestL", desc: "Lowest Low (LowestL)" },
            { key: "MASS", label: "label.indicatorDesc.MASS", desc: "Mass Index (MASS)" },
            { key: "MED", label: "label.indicatorDesc.MED", desc: "Median Price (MED)" },
            { key: "MFI", label: "label.indicatorDesc.MFI", desc: "Money Flow Index (MFI)" },
            { key: "MOM", label: "label.indicatorDesc.MOM", desc: "Momentum (MOM)" },
            {
                key: "MACD",
                label: "label.indicatorDesc.MACD",
                desc: "Moving Average Convergence Divergence (MACD)"
            },
            { key: "MACDF", label: "label.indicatorDesc.MACDF", desc: "MACD Forest (MACDF)" },
            {
                key: "MACDCrossOverZeroSignal",
                label: "label.indicatorDesc.MACDCrossOverZeroSignal",
                desc: "MACD Cross and Over Zero Signal (MACDCrossOverZeroSignal)"
            },
            {
                key: "MACDCrossSignal",
                label: "label.indicatorDesc.MACDCrossSignal",
                desc: "MACD Cross Signal (MACDCrossSignal)"
            },
            { key: "CMA", label: "label.indicatorDesc.CMA", desc: "Moving Average Centered (CMA)" },
            { key: "MomMA", label: "label.indicatorDesc.MomMA", desc: "Moving Average Momentum (MomMA)" },
            { key: "TRIMA", label: "label.indicatorDesc.TRIMA", desc: "Moving Average Triangular (TRIMA)" },
            { key: "MovTrip", label: "label.indicatorDesc.MovTrip", desc: "Moving Average Triple (MovTrip)" },
            { key: "NVI", label: "label.indicatorDesc.NVI", desc: "Negative Volume Index (NVI)" },
            { key: "OBV", label: "label.indicatorDesc.OBV", desc: "On Balance Volume (OBV)" },
            { key: "PVI", label: "label.indicatorDesc.PVI", desc: "Positive Volume Index (PVI)" },
            { key: "RSI", label: "label.indicatorDesc.RSI", desc: "Relative Strength (RSI)" },
            { key: "RSL", label: "label.indicatorDesc.RSL", desc: "Relative Strength Levy (RSL)" },
            { key: "ROC", label: "label.indicatorDesc.ROC", desc: "Rate of Change (ROC)" },
            { key: "MOVR", label: "label.indicatorDesc.MOVR", desc: "Rolling Moving Average (MOVR)" },
            { key: "SMA", label: "label.indicatorDesc.SMA", desc: "Simple Moving Average (SMA)" },
            { key: "STOS", label: "label.indicatorDesc.STOS", desc: "Slow Stochastic (STOS)" },
            { key: "StdDev", label: "label.indicatorDesc.StdDev", desc: "Standard Deviation (StdDev)" },
            { key: "SM", label: "label.indicatorDesc.SM", desc: "Stochastic Momentum (SM)" },
            { key: "SRSI", label: "label.indicatorDesc.SRSI", desc: "Stochastic RSI (SRSI)" },
            { key: "TRIX", label: "label.indicatorDesc.TRIX", desc: "TRIX" },
            { key: "TrueR", label: "label.indicatorDesc.TrueR", desc: "True Range (TrueR)" },
            { key: "TSI", label: "label.indicatorDesc.TSI", desc: "True Strength Index (TSI) " },
            { key: "UO", label: "label.indicatorDesc.UO", desc: "Ultimate Oscillator (UO)" },
            { key: "VHF", label: "label.indicatorDesc.VHF", desc: "Vertical Horizontal Filter (VHF)" },
            { key: "VOLUME_PNL", label: "label.indicatorDesc.VOLUME_PNL", desc: "Volume" },
            { key: "VMA", label: "label.indicatorDesc.VMA", desc: "Volume Moving Average (VMA)" },
            { key: "VI", label: "label.indicatorDesc.VI", desc: "Vortex Indicator (VI)" },
            { key: "WMA", label: "label.indicatorDesc.WMA", desc: "Weighted Moving Average (WMA)" },
            { key: "WPR", label: "label.indicatorDesc.WPR", desc: "Williams&#39; %R (WPR)" },
            { key: "SAR", label: "label.indicatorDesc.SAR", desc: "Parabolic Stops and Reversals (SAR)" },
            { key: "HLRegChannel", label: "label.indicatorDesc.HLRegChannel", desc: " High Low Regression Channel" },
            { key: "CWI", label: "label.indicatorDesc.CWI", desc: "Custom Weight Index" },
            { key: "HarmonicPtn", label: "Harmonic Pattern", desc: "Harmonic Pattern" }
        ]
    },
    addTbOPtions: [
        { key: "Drawings", desc: "Drawings", ModalVisibleMethodName: "setDrawingModalVisble", ico: "linechart" },
        { key: "Indicators", desc: "Indicators", ModalVisibleMethodName: "setIndicatorModalVisble", ico: "barschart" },
        { key: "Compare", desc: "Compare", ModalVisibleMethodName: "setCompareModalVisble", ico: "barschart" },
        { key: "Alerts", desc: "Alerts", ModalVisibleMethodName: "setDrawingModalVisble", ico: "barschart" },
        { key: "AddToWatchlist", desc: "AddToWatchlist", ModalVisibleMethodName: "setDrawingModalVisble", ico: "barschart" },
    ],
    mockSettingPannel:
    {
        line: {
            title: "Line",
            drawingId: "line123",
            subCategories: [
                {
                    title: "Line Style",
                    input: "Button",
                    style: undefined,
                    values: ["dash", "dot"],
                    activeValue: "dash",
                    callBackMethod: "onLineStyleC8hange"
                },
                {
                    title: "Line Weight",
                    input: "Button",
                    style: undefined,
                    values: ["weight1", "weight2", "weight3"],
                    activeValue: "weight1",
                    callBackMethod: "onLineWidthChange"
                },
                {
                    title: "Line Color",
                    input: "Button",
                    style: undefined,
                    values: undefined,
                    activeValue: "red",
                    callBackMethod: "onLineColorChange"
                },
                {
                    title: "Price Range",
                    input: "checkBox",
                    style: undefined,
                    values: undefined,
                    activeValue: false,
                    callBackMethod: "onLineColorChange"
                },
                {
                    title: "Bars Range",
                    input: "checkBox",
                    style: undefined,
                    values: undefined,
                    activeValue: false,
                    callBackMethod: "onClickBarsRange"
                },
                {
                    title: "Angle",
                    input: "checkBox",
                    style: undefined,
                    values: undefined,
                    activeValue: false,
                    callBackMethod: "onClickPriceRange"
                },
                {
                    title: "Duration",
                    input: "checkBox",
                    style: undefined,
                    values: undefined,
                    activeValue: false,
                    callBackMethod: "onLineColorChange"
                },
            ]
        }
    }

};
export default config;