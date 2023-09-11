import React, { useRef, useState } from 'react';
import { Text, View, SafeAreaView, useWindowDimensions, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import config from '../../config';
import { IntervlModal, ChartTypeModal, DrawingTypeModal, BasicModal, IndicatorModal } from './../modalComponents';
import styles from '../styles';
import { EvilIcons, AntDesign, Ionicons } from '@expo/vector-icons';

const chartHtml = require('../../chartFiles/html/chart.html');

export function ChartScreen() {

  const webViewRef = useRef(null);

  const [activeInterval, setActiveInterval] = useState('1m');
  const [activeCharttype, setActiveChartType] = useState('barschart');
  const [intervalModalVisibility, setIntervalModalVisble] = useState(false);
  const [drawingsModalVisibility, setDrawingModalVisble] = useState(false);
  const [indicatorModalVisibility, setIndicatorModalVisble] = useState(false);
  const [CompareModalVisibility, setCompareModalVisble] = useState(false);
  const [chartTypeModalVisibility, setchartTypeModalVisble] = useState(false);
  const [basicModalVisibility, setbasicModalVisibile] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");


  const changeInterval = (interval) => {
    const injectingCode = `  
        var chart = infChart.manager.getChart("mainchart");
        if (chart) {      
          chart.setIntervalManually("`+ interval + `", undefined, true);
        }
          true; 
        `;
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript(injectingCode);
    }
  }

  const changeChartType = (type) => {
    const changeChartType = `  
          infChart.manager.setChartStyle("mainchart", "`+ type + `", undefined, true);
          true; 
    `;

    if (webViewRef.current) {
      webViewRef.current.injectJavaScript(changeChartType);
    }
  };

  const changeDrawing = (value) => {
    console.log("changeDrawing",value);
    const changeChartType = `  
        var chart = infChart.manager.getChart("mainchart");
        if(chart){
          infChart.drawingsManager.initializeDrawing(chart.chart, "` + value + `", undefined, undefined, "shape", true)
        }
        true; 
      `;

    if (webViewRef.current) {
      webViewRef.current.injectJavaScript(changeChartType);
    }
  };

  const addIndicator = function (type) {
    console.log("addindicators", type)
    const injectingCode = `  
        var chart = infChart.manager.getChart("mainchart");
        if (chart) {      
          chart.removeAllIndicators();
          if ("`+ type + `") {
            chart.addIndicator("`+ type + `");
          }
        }
          true; 
        `;
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript(injectingCode);
    }
  }

  const removeIndicator = function (indicatorId) {

    const injectingCode = `  
        var chart = infChart.manager.getChart("mainchart");
        if (indicatorId) {      
          var indicator = infChart.indicatorMgr.getIndicatorById("mainchart", "`+ indicatorId + `")
          if (chart && "`+ indicatorId + `") {
            chart.removeIndicator("`+ indicatorId + `", true);
        }
        }
          true; 
        `;
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript(injectingCode);
    }

  };

  const onMessageFromWebView = (message) => {
    console.log('Message from WebView:', message);
    // Perform any desired actions in response to the message
  };


  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 18 }}>
        <WebView
          ref={webViewRef}
          style={{ flex: 1 }}
          //source={chartHtml}
          source={{ uri: 'http://localhost:8081/' }}
          onMessage={(event) => {
            console.log('Message from WebView:');
            onMessageFromWebView(event.nativeEvent.data);
          }}
        />
      </View>
      <View style={[styles.buttonBar]}>

        <TouchableOpacity
          key={activeInterval}
          onPress={() => {
            setDrawingModalVisble(false);
            setIntervalModalVisble(true)
            setchartTypeModalVisble(false);
          }}
          style={[styles.buttonBarButtons]}>
          <Text
            style={[
              styles.buttonLabel,
            ]}>
            {activeInterval}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          key={"3"}
          onPress={() => {
            setDrawingModalVisble(false);
            setIntervalModalVisble(false);
            setchartTypeModalVisble(true);

          }}
          style={[styles.buttonBarButtons]}>
          {/* <Text
              style={[
                styles.buttonLabel
              ]}>
              {activeCharttype}
            </Text> */}
          <AntDesign name={activeCharttype} size={20} color="black" />
        </TouchableOpacity>

        <TouchableOpacity
          key={"4"}
          onPress={() => setbasicModalVisibile(true)}
          style={[styles.buttonBarButtons]}>
     
          {/* <EvilIcons name="pencil" size={26} color="black" /> */}
          <Ionicons name="add" size={26} color="black" />
        </TouchableOpacity>

      </View>

      <IntervlModal
        intervalModalVisibility={intervalModalVisibility}
        values={config.interval}
        setIntervalModalVisble={setIntervalModalVisble}
        changeInterval={changeInterval}
        setActiveInterval={setActiveInterval}
      > </IntervlModal>

      <ChartTypeModal
        values={config.chartType}
        chartTypeModalVisibility={chartTypeModalVisibility}
        changeChartType={changeChartType}
        setActiveChartType={setActiveChartType}
        setchartTypeModalVisble={setchartTypeModalVisble}
      ></ChartTypeModal>

      <DrawingTypeModal
          drawingsModalVisibility={drawingsModalVisibility}
          values={config.drawings[0].options}
          setDrawingModalVisble={setDrawingModalVisble}
          changeDrawing={changeDrawing}
        >
        </DrawingTypeModal>

      <BasicModal
        basicModalVisibility={basicModalVisibility}
        values={config.addTbOPtions}
        setBasicModalVisble={setbasicModalVisibile}
        setDrawingModalVisble={setDrawingModalVisble}
        setCompareModalVisble={setCompareModalVisble}
        setIndicatorModalVisble={setIndicatorModalVisble}
        // changeDrawing={changeDrawing}
      >
      </BasicModal>

      <IndicatorModal
        indicatorModalVisibility= {indicatorModalVisibility}
        values={config.indicator.options}
        setIndicatorModalVisble={setIndicatorModalVisble}
        addIndicator={addIndicator}
        setSearchTerm={setSearchTerm}
      ></IndicatorModal>

    </SafeAreaView>
  );
}