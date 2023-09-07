import React, { useRef } from 'react';
import { View, Text, Modal, Pressable, TouchableOpacity, PanResponder } from 'react-native';
import styles from './styles';
import { AntDesign } from '@expo/vector-icons';
import { MaterialIcons, Entypo } from '@expo/vector-icons';
export const IntervlModal = ({
    values,
    intervalModalVisibility,
    setIntervalModalVisble,
    changeInterval,
    setActiveInterval
}) => {
    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderMove: () => { },
            onPanResponderRelease: (_, gestureState) => {
                if (gestureState.dy > 50) {
                    setIntervalModalVisble(false);
                }
            },
        })
    ).current;
    return (
        <View>
            <Modal
                animationType="slide"
                transparent={true}
                visible={intervalModalVisibility}
                onRequestClose={() => {
                    // setIntervalModalVisble(!intervalModalVisibility);
                }}>
                <View style={styles.centeredView}
                    {...panResponder.panHandlers}>
                    <View style={styles.modalView}>
                        <MaterialIcons name="drag-handle" size={24} color="black" />
                        {/* <Pressable
                  style={[styles.button, styles.buttonClose]}
                  onPress={() => setIntervalModalVisble(false)}>
                  <Text style={styles.textStyle}>Close</Text>
                </Pressable> */}
                    <View style={{paddingTop: 20}}>
                        <Text style={styles.modalText}>Interval</Text>
                        <View style={styles.row}>
                            {values.map(value => (
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
                </View>
            </Modal>
        </View>
    )
};
export const ChartTypeModal = ({
    values,
    chartTypeModalVisibility,
    setchartTypeModalVisble,
    changeChartType,
    setActiveChartType
}) => {
    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderMove: () => { },
            onPanResponderRelease: (_, gestureState) => {
                if (gestureState.dy > 50) {
                    setchartTypeModalVisble(false);
                }
            },
        })
    ).current;
    return (
        <View>
            <Modal
                animationType="slide"
                transparent={true}
                visible={chartTypeModalVisibility}
                onRequestClose={() => {
                    // setIntervalModalVisble(!intervalModalVisibility);
                }}>
                <View style={styles.centeredView}
                    {...panResponder.panHandlers}>
                    <View style={styles.modalView}>
                    <MaterialIcons name="drag-handle" size={24} color="black" />
                    <View style={{paddingTop: 20}}>
                        <Text style={styles.modalText}>Candle Type</Text>
                        {/* <Pressable
                  style={[styles.button, styles.buttonClose]}
                  onPress={() => setchartTypeModalVisble(false)}>
                  <Text style={styles.textStyle}>Close</Text>
                </Pressable> */}
                        <View style={styles.row}>
                            {values.map(value => (
                                <TouchableOpacity
                                    key={value.key}
                                    onPress={() => {
                                        changeChartType(value.key);
                                        setchartTypeModalVisble(false);
                                        setActiveChartType(value.ico)
                                    }}
                                    style={[styles.button]}>
                                    <AntDesign name={value.ico} size={24} color="black" />
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
                </View>
            </Modal>
        </View>
    )
};
export const DrawingTypeModal = ({
    values,
    drawingsModalVisibility,
    setDrawingModalVisble,
    changeDrawing,
    setActiveInterval
}) => {
    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderMove: () => { },
            onPanResponderRelease: (_, gestureState) => {
                if (gestureState.dy > 50) {
                    setDrawingModalVisble(false);
                }
            },
        })
    ).current;
    return (<View>
        <Modal
            animationType="slide"
            transparent={true}
            visible={drawingsModalVisibility}
            onRequestClose={() => {
                // setIntervalModalVisble(!intervalModalVisibility);
            }}>
            <View style={styles.centeredView}
                {...panResponder.panHandlers}>
                <View style={styles.modalView}>
                <MaterialIcons name="drag-handle" size={24} color="black" />
                <View style={{paddingTop: 20}}>
                    <Text style={styles.modalText}>Drawings</Text>
                    {/* <Pressable
                  style={[styles.button, styles.buttonClose]}
                  onPress={() => setDrawingModalVisble(false)}>
                  <Text style={styles.textStyle}>Close</Text>
                </Pressable> */}
                    <View style={styles.row}>
                        {values.map(value => (
                            <TouchableOpacity
                                key={value.key}
                                onPress={() => {
                                    changeDrawing(value);
                                    setDrawingModalVisble(false);
                                }}
                                style={[styles.button]}>
                                <Entypo name="flow-line" size={24} color="black" />
                                    <Text
                                        style={[
                                            styles.buttonLabel
                                        ]}>
                                        {value.options[0].shape}
                                    </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    </View>
                </View>
            </View>
        </Modal>
    </View>
    )
};