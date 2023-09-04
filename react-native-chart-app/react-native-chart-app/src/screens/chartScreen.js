
import React, { useRef, useState } from 'react';
import { Text, View, SafeAreaView, useWindowDimensions, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import config from '../../config';
import { IntervlModal, ChartTypeModal, DrawingTypeModal } from './../modalComponents';
import styles from '../styles';
import { EvilIcons } from '@expo/vector-icons';
import { AntDesign } from '@expo/vector-icons';

const chartHtml = require('../../chartFiles/html/chart.html');

export function ChartScreen() {

    const webViewRef = useRef(null);
  
    const [activeInterval, setActiveInterval] = useState('1m');
    const [activeCharttype, setActiveChartType] = useState('barschart');
    const [intervalModalVisibility, setIntervalModalVisble] = useState(false);
    const [drawingsModalVisibility, setDrawingModalVisble] = useState(false);
    const [chartTypeModalVisibility, setchartTypeModalVisble] = useState(false);
  
    const changeInterval = (interval) => {
      const injectingCode = `  
        var chart = infChart.manager.getChart("mainchart");
        if (chart) {      
          chart.setIntervalManually("`+ interval + `", undefined, true);
        }
          true; 
        `;
      console.log("injectcode", injectingCode);
      if (webViewRef.current) {
        webViewRef.current.injectJavaScript(injectingCode);
      }
    }
  
    const changeChartType = (type) => {
      console.log("changeChartType");
      const changeChartType = `  
          infChart.manager.setChartStyle("mainchart", "`+ type + `", undefined, true);
          true; 
    `;
  
      if (webViewRef.current) {
        webViewRef.current.injectJavaScript(changeChartType);
      }
    };
  
    
  
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ flex: 18 }}>
          <WebView
            ref={webViewRef}
            style={{ flex: 1 }}
            source={chartHtml}
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
            onPress={() => setDrawingModalVisble(true)}
            style={[styles.buttonBarButtons]}>
            {/* <Text
              style={[
                styles.buttonLabel
              ]}>
              Drawings
            </Text> */}
            <EvilIcons name="pencil" size={26} color="black" />
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
          values={config.interval}
          setDrawingModalVisble={setDrawingModalVisble}
          changeInterval={changeInterval}
          setActiveInterval={setActiveInterval}
        >
  
        </DrawingTypeModal>
  
      </SafeAreaView>
    );
  }