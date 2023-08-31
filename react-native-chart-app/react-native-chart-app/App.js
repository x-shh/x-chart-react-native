// // import { StatusBar } from 'expo-status-bar';
// // import { StyleSheet, Text, View } from 'react-native';
// // import { WebView } from 'react-native-webview';

// // export default function App() {
// //   const htmlContent = require('./dist/html/chart.html');

// //   const runFirst = `
// //   setTimeout(function() { 
// //       window.alert("Click me!");
// //       document.getElementById("h1_element").innerHTML = 
// //       "What is your favourite language?";
// //       document.getElementById("h2_element").innerHTML =
// //       "We will see!";
// //     }, 1000);
// //   true; // note: this is required, or you'll sometimes get silent failures
// // `;

// // const runBeforeFirst = `
// //   window.isNativeApp = true;
// //   true; // note: this is required, or you'll sometimes get silent failures
// // `;

// // return (
// //       <View style={{ flex: 1 }}>
// //         <WebView
// //         style={{ flex: 1 }}
// //         source= {htmlContent}
// //         onMessage={(event) => {}}
// //           injectedJavaScript={runFirst}
// //           injectedJavaScriptBeforeContentLoaded={runBeforeFirst}
// //         />
// //       </View>
// //   );
// // }

// // const styles = StyleSheet.create({
// //   container: {
// //     flex: 1,
// //     backgroundColor: '#fff',
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //   },
// // });

// // import { StatusBar } from 'expo-status-bar';
// // import React, { useRef }  from 'react';
// // import { Button, ScrollView, StyleSheet, Text, View, SafeAreaView, useWindowDimensions } from 'react-native';
// // import { WebView } from 'react-native-webview';
// // import { removeElement, isTag } from 'domutils';
// // // import {server} from './server/index';
// // export default function App() {
// //   const webViewRef = useRef(null);
// //   const runFirst = `
// //     window.alert(infchart);
// //     document.getElementById("mainchart").remove()
// //     console.log("hello there", this);
// //       true; // note: this is required, or you'll sometimes get silent failures
// //     `;
// //   const runBeforeFirst = `
// //       window.isNativeApp = true;
// //       true; // note: this is required, or you'll sometimes get silent failures
// //   `;
// //   const triggerJSFunction = `
// //   // Trigger the JavaScript function in the WebView
// //   showMessage();
// // `;
// // const handleButtonPress = () => {
// //   if (webViewRef.current) {
// //     webViewRef.current.injectJavaScript(runFirst);
// //   }
// // }
// //   const chartHtml = require('./dist/html/chart.html');
// //   const { width } = useWindowDimensions();
// //   return (
// //     <View style={{ flex: 1 }}>
// //       <WebView
// //       ref={webViewRef}
// //         style={{ flex: 1 }}
// //         source= {chartHtml}
// //         // onMessage={(event) => {}}
// //         // injectedJavaScript={runFirst}
// //         // injectedJavaScriptBeforeContentLoaded={runBeforeFirst}
// //         />
// //         <Button title="Trigger Web Function" onPress={handleButtonPress} />
// //     </View>
// //   );
// // }
// // const SampleComponent = (prop) => {
// //   return (<View>
// //     <Text>this is the teset</Text>
// //   </View>);
// // }
// // const styles = StyleSheet.create({
// //   container: {
// //     flex: 1,
// //     backgroundColor: '#fff',
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //   },
// // });

// import { StatusBar } from 'expo-status-bar';
// import React, { useRef }  from 'react';
// import { Button, ScrollView, StyleSheet, Text, View, SafeAreaView, useWindowDimensions } from 'react-native';
// import { WebView } from 'react-native-webview';


// // import {server} from './server/index';

// export default function App() {
//   const webViewRef = useRef(null);
//   const runFirst = `  
//     var chart = infChart.manager.getChart("mainchart");
//     if (chart) {      
//       chart.setIntervalManually("I_15", undefined, true);
//   }
//       true; // note: this is required, or you'll sometimes get silent failures
//     `;

//     const runFirst1 = `  
//     var chart = infChart.manager.getChart("mainchart");
//     if (chart) {      
//       chart.setIntervalManually("I_5", undefined, true);
//   }
//       true; // note: this is required, or you'll sometimes get silent failures
//     `;


//     const runFirst30 = `  
//     var chart = infChart.manager.getChart("mainchart");
//     if (chart) {      
//       chart.setIntervalManually("I_30", undefined, true);
//   }
//       true; // note: this is required, or you'll sometimes get silent failures
//     `;
//     const runFirst6h = `  
//     var chart = infChart.manager.getChart("mainchart");
//     if (chart) {      
//       chart.setIntervalManually("I_360", undefined, true);
//   }
//       true; // note: this is required, or you'll sometimes get silent failures
//     `;
//     const runFirstDaily = `  
//     var chart = infChart.manager.getChart("mainchart");
//     if (chart) {      
//       chart.setIntervalManually("D", undefined, true);
//   }
//       true; // note: this is required, or you'll sometimes get silent failures
//     `;


// const handleButtonPress = () => {
//   if (webViewRef.current) {
//     webViewRef.current.injectJavaScript(runFirst);
//   }
// }
// const handleButtonPress1 = () => {
//   if (webViewRef.current) {
//     webViewRef.current.injectJavaScript(runFirst1);
//   }
// }
// const handleButtonPress30 = () => {
//   if (webViewRef.current) {
//     webViewRef.current.injectJavaScript(runFirst30);
//   }
// }
// const handleButtonPress6h = () => {
//   if (webViewRef.current) {
//     webViewRef.current.injectJavaScript(runFirst6h);
//   }
// }
// const handleButtonPressDaily = () => {
//   if (webViewRef.current) {
//     webViewRef.current.injectJavaScript(runFirstDaily);
//   }
// }


//   const chartHtml = require('./dist/html/chart.html');
//   const { width } = useWindowDimensions();

//   return (
//     <SafeAreaView style={{ flex: 1 }}>
      
//       <WebView 
//       ref={webViewRef}
//         style={{ flex: 1 }}
//         source= {chartHtml} 
//         // onMessage={(event) => {}}
//         // injectedJavaScript={runFirst}
//         // injectedJavaScriptBeforeContentLoaded={runBeforeFirst}
//         />
//         <View style={styles.row}>
//         <Button  title="5m" onPress={handleButtonPress1} />
//         <Button  title="15m" onPress={handleButtonPress} />
//         <Button   title="30m" onPress={handleButtonPress30} />
//         <Button  title="6h" onPress={handleButtonPress6h} />
//         <Button  title="Daily" onPress={handleButtonPressDaily} />
        
//         </View>
        

//     </SafeAreaView>

//   );
// }

// const SampleComponent = (prop) => {

//   return (<View>
//     <Text>this is the teset</Text>
//   </View>);
// }

// // const styles = StyleSheet.create({
// //   container: {
// //     flex: 1,
// //     backgroundColor: '#fff',
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //   },
// // });

// const PreviewLayout = ({
//   label,
//   children,
//   values,
//   selectedValue,
//   setSelectedValue,
// }) => (
//   <View style={{padding: 10, flex: 1}}>
//     <Text style={styles.label}>{label}</Text>
//     <View style={styles.row}>
//       {values.map(value => (
//         <TouchableOpacity
//           key={value}
//           onPress={() => setSelectedValue(value)}
//           style={[styles.button, selectedValue === value && styles.selected]}>
//           <Text
//             style={[
//               styles.buttonLabel,
//               selectedValue === value && styles.selectedLabel,
//             ]}>
//             {value}
//           </Text>
//         </TouchableOpacity>
//       ))}
//     </View>
//     <View style={[styles.container, {[label]: selectedValue}]}>{children}</View>
//   </View>
// );

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     marginTop: 8,
//     backgroundColor: 'aliceblue',
//   },
//   testButton: {

//   },
//   box: {
//     width: 50,
//     height: 50,
//   },
//   row: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     justifyContent: 'center',
//     backgroundColor: 'blue',
    
//   },
//   button: {
//     paddingHorizontal: 8,
//     paddingVertical: 6,
//     borderRadius: 4,
//     backgroundColor: 'oldlace',
//     alignSelf: 'flex-start',
//     marginHorizontal: '1%',
//     marginBottom: 6,
//     minWidth: '48%',
//     textAlign: 'center',
//   },
//   selected: {
//     backgroundColor: 'coral',
//     borderWidth: 0,
//   },
//   buttonLabel: {
//     fontSize: 12,
//     fontWeight: '500',
//     color: 'coral',
//   },
//   selectedLabel: {
//     color: 'white',
//   },
//   label: {
//     textAlign: 'center',
//     marginBottom: 10,
//     fontSize: 24,
//   },
// });

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

