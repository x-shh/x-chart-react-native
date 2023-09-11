import React, { useRef, useState } from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, PanResponder, ScrollView } from 'react-native';
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
                        <View style={{ paddingTop: 20 }}>
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
                        <View style={{ paddingTop: 20 }}>
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
export const BasicModal = ({
    values,
    basicModalVisibility,
    setBasicModalVisble,
    changeDrawing,
    setActiveInterval,
    setDrawingModalVisble,
    setCompareModalVisble,
    setIndicatorModalVisble
}) => {
    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderMove: () => { },
            onPanResponderRelease: (_, gestureState) => {
                if (gestureState.dy > 50) {
                    setBasicModalVisble(false);
                }
            },
        })
    ).current;
    const mapMethod = function (configMethodName) {
        switch (configMethodName) {
            case 'setDrawingModalVisble':
                console.log("setDrawingModalVisbler")
                return setDrawingModalVisble;
            case 'setCompareModalVisble':
                return setCompareModalVisble
            case 'setIndicatorModalVisble':
                console.log("setIndicatorModalVisble")
                return setIndicatorModalVisble;
            default:
                return setDrawingModalVisble;

        }

    }
    return (<View>
        <Modal
            animationType="slide"
            transparent={true}
            visible={basicModalVisibility}
            onRequestClose={() => {
                // setIntervalModalVisble(!intervalModalVisibility);
            }}>
            <View style={styles.centeredView}
                {...panResponder.panHandlers}>
                <View style={styles.modalView}>
                    <MaterialIcons name="drag-handle" size={24} color="black" />
                    <View style={{ paddingTop: 20 }}>
                        <Text style={styles.modalText}>Add</Text>
                        <View style={styles.row}>
                            {values.map(value => (
                                <TouchableOpacity
                                    key={value.key}
                                    onPress={() => {
                                        setBasicModalVisble(false);
                                        mapMethod(value.ModalVisibleMethodName)(true)
                                    }}
                                    style={[styles.button]}>
                                    {/* <Entypo name="flow-line" size={24} color="black" /> */}
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
                    <View style={{ paddingTop: 20 }}>
                        <Text style={styles.modalText}>Add</Text>
                        <View style={styles.row}>
                            {values.map(value => (
                                <><Text>{}</Text>
                                <TouchableOpacity
                                    key={value.shape}
                                    onPress={() => {
                                        changeDrawing(value.shape);
                                        setDrawingModalVisble(false);
                                    } }
                                    style={[styles.button]}>
                                    <Entypo name="flow-line" size={24} color="black" />
                                    <Text
                                        style={[
                                            styles.buttonLabel
                                        ]}>
                                        {value.shape}
                                    </Text>
                                </TouchableOpacity></>
                            ))}
                        </View>
                    </View>
                </View>
            </View>
        </Modal>
    </View>
    )
};

export const IndicatorModal = ({
    values,
    indicatorModalVisibility,
    setIndicatorModalVisble,
    addIndicator,
    setSearchTerm
}) => {
    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderMove: () => { },
            onPanResponderRelease: (_, gestureState) => {
                if (gestureState.dy > 50) {
                    setIndicatorModalVisble(false);
                }
            },
        })
    ).current;

    const [indicators, setIndicators] = useState(values);

    const filterIndicators = function(searchTerm) {
        
        if(searchTerm) {
            const regex = new RegExp(searchTerm, 'i');
            const filteredIndicators = values.filter(item => regex.test(item.desc));
            setIndicators(filteredIndicators);
        } else {
            setIndicators(values);
        }    
    }

    return (<View>
        <Modal
            animationType="slide"
            transparent={true}
            visible={indicatorModalVisibility}
            onRequestClose={() => {
                // setIntervalModalVisble(!intervalModalVisibility);
            }}>
            <View style={styles.centeredView}
                {...panResponder.panHandlers}>
                <View style={styles.modalView}>
                    <MaterialIcons name="drag-handle" size={24} color="black" />
                    <View style={{ paddingTop: 20 }}>
                        <Text style={styles.modalText}>Add Indicator</Text>
                        <TextInput
                            style={{ height: 40 }}
                            placeholder="Search Indicator"
                            onChangeText={newText => {
                                setSearchTerm(newText)
                                filterIndicators(newText)}
                            }
                            // defaultValue={text}
                        />
                        <ScrollView>
                            <View style={styles.row}>
                                {indicators.map(value => (
                                    <TouchableOpacity
                                        key={value.key}
                                        onPress={() => {
                                            addIndicator(value.key);
                                            setIndicatorModalVisble(false);
                                        }}
                                        style={[styles.indicatorButton]}>
                                        {/* <Entypo name="flow-line" size={24} color="black" /> */}
                                        <Text
                                            style={[
                                                styles.buttonLabel
                                            ]}>
                                            {value.desc}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </View>
        </Modal>
    </View>
    )
};