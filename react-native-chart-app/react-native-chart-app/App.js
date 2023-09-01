import { StatusBar } from 'expo-status-bar';
import React, { useRef, useState } from 'react';
import { Button, ScrollView, StyleSheet, Text, View, SafeAreaView, useWindowDimensions, TouchableOpacity, Modal, Pressable } from 'react-native';
import { WebView } from 'react-native-webview';
import config from './config';


// import {server} from './server/index';

export default function App() {
  const webViewRef = useRef(null);

  const [activeInterval, setActiveInterval] = useState('1m');
  const [activeCharttype, setChartType] = useState('candleStick');
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

  const changeChartType =  ( type) => {
    console.log("changeChartType");
    const changeChartType = `  
        infChart.manager.setChartStyle("mainchart", "`+ type + `", undefined, true);
        true; 
  `;
  
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript(changeChartType);
    }
};



  const chartHtml = require('./dist/html/chart.html');


  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 12 }}>
        <WebView
          ref={webViewRef}
          style={{ flex: 1 }}
          source={chartHtml}
        />
      </View>
      <View style={[styles.row, { flex: 1 }, styles.shadedBorder]}>

        <TouchableOpacity
          key={activeInterval}
          onPress={() => {
            setDrawingModalVisble(false);
            setIntervalModalVisble(true)
            setchartTypeModalVisble(false);
          }}
          style={[styles.button]}>
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
          style={[styles.button]}>
          <Text
            style={[
              styles.buttonLabel
            ]}>
            candleStick
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setDrawingModalVisble(true)}
          style={[styles.button]}>
          <Text
            style={[
              styles.buttonLabel
            ]}>
            drawings
          </Text>
        </TouchableOpacity>
      </View>

      <View>
        <Modal
          animationType="slide"
          transparent={true}
          visible={intervalModalVisibility}
          onRequestClose={() => {
            // setIntervalModalVisble(!intervalModalVisibility);
          }}>

          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <Text style={styles.modalText}>Interval</Text>
              <Pressable
                style={[styles.button, styles.buttonClose]}
                onPress={() => setIntervalModalVisble(false)}>
                <Text style={styles.textStyle}>Close</Text>
              </Pressable>

              <View style={styles.row}>
                {config.interval.map(value => (
                  <TouchableOpacity
                    key={value.key}
                    onPress={() => {
                      changeInterval(value.key);
                      setIntervalModalVisble(false);
                      setActiveInterval(value.desc);
                    }}
                    style={[styles.button]}>
                    <Text
                      style={[
                        styles.buttonLabel
                      ]}>
                      {value.desc}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </Modal>
      </View>

      <View>
        <Modal
          animationType="slide"
          transparent={true}
          visible={chartTypeModalVisibility}
          onRequestClose={() => {
            // setIntervalModalVisble(!intervalModalVisibility);
          }}>

          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <Text style={styles.modalText}>Candle Type</Text>
              <Pressable
                style={[styles.button, styles.buttonClose]}
                onPress={() => setchartTypeModalVisble(false)}>
                <Text style={styles.textStyle}>Close</Text>
              </Pressable>

              <View style={styles.row}>
                {config.chartType.map(value => (
                  <TouchableOpacity
                    key={value.key}
                    onPress={() => {
                      changeChartType(value.key);
                      setchartTypeModalVisble(false);
                    }}
                    style={[styles.button]}>
                    <Text
                      style={[
                        styles.buttonLabel
                      ]}>
                      {value.desc}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </Modal>
      </View>

      <View>
        <Modal
          animationType="slide"
          transparent={true}
          visible={drawingsModalVisibility}
          onRequestClose={() => {
            // setIntervalModalVisble(!intervalModalVisibility);
          }}>

          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <Text style={styles.modalText}>Drawings</Text>
              <Pressable
                style={[styles.button, styles.buttonClose]}
                onPress={() => setDrawingModalVisble(false)}>
                <Text style={styles.textStyle}>Close</Text>
              </Pressable>

              <View style={styles.row}>
                {config.interval.map(value => (
                  <TouchableOpacity
                    key={value.key}
                    onPress={() => {
                      changeInterval(value.key);
                      setDrawingModalVisble(false);
                    }}
                    style={[styles.button]}>
                    <Text
                      style={[
                        styles.buttonLabel
                      ]}>
                      {value.desc}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </Modal>
      </View>

    </SafeAreaView>

  );
}



const PreviewLayout = ({
  label,
  children,
  values,
  selectedValue,
  setSelectedValue,
}) => (
  <View style={{ padding: 10, flex: 1 }}>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.row}>
      {values.map(value => (
        <TouchableOpacity
          key={value}
          onPress={() => setSelectedValue(value)}
          style={[styles.button, selectedValue === value && styles.selected]}>
          <Text
            style={[
              styles.buttonLabel,
              selectedValue === value && styles.selectedLabel,
            ]}>
            {value}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
    <View style={[styles.container, { [label]: selectedValue }]}>{children}</View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 8,
    backgroundColor: 'aliceblue',
  },
  box: {
    width: 50,
    height: 50,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',


  },
  button: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 4,
    backgroundColor: 'oldlace',
    alignSelf: 'flex-start',
    marginHorizontal: '1%',
    marginBottom: 6,
    minWidth: '28%',
    textAlign: 'center',
  },
  shadedBorder: {
    height: 10, // Adjust the height of the shaded border
    borderTopWidth: 1, // Add a top border
    borderColor: 'transparent', // Set the border color to transparent
    backgroundColor: 'linear-gradient(to right, lightgray, transparent)', // Use a linear gradient for shading
  },
  selected: {
    backgroundColor: 'coral',
    borderWidth: 0,
  },
  buttonLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: 'coral',
  },
  selectedLabel: {
    color: 'white',
  },
  label: {
    textAlign: 'center',
    marginBottom: 10,
    fontSize: 24,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    // width: '100%',
    // height: '100%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    // backgroundColor: 'lightblue'
  },
  modalText: {
    marginBottom: 15,
  },
  buttonClose: {
    textAlign: 'center'
  }
});

