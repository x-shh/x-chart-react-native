import React, { useRef, useState } from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, PanResponder, ScrollView, Pressable } from 'react-native';
import { styles, settingsStyles } from './styles';
import { AntDesign } from '@expo/vector-icons';
import { MaterialIcons, Entypo, Ionicons, Octicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { CheckBox } from '@rneui/themed';
import { data } from 'jquery';
import { iconTagGenerator } from './iconsComponents';

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
                        <CloseModal
                            setModalVisible={setIntervalModalVisble}
                        ></CloseModal>
                        <View style={[{}]}>
                            <Text style={styles.textHeaders}>Interval</Text>
                            <View style={[styles.row, { width: '100%', }]}>
                                {values.map(intervals => (
                                    <View style={[styles.row, {}]}>
                                        {intervals.map(value => (
                                            <TouchableOpacity
                                                // key={value.key}
                                                onPress={() => {
                                                    changeInterval(value.key);
                                                    setIntervalModalVisble(false);
                                                    setActiveInterval(value.desc);
                                                }}
                                                style={[styles.intervalButtons]}>
                                                <Text
                                                    style={[
                                                        styles.intervalButtonText
                                                    ]}>
                                                    {value.desc}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
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
                        <CloseModal
                            setModalVisible={setchartTypeModalVisble}
                        ></CloseModal>
                        <View style={{}}>
                            <Text style={styles.textHeaders}>Chart Type</Text>
                            <View style={[styles.row, {}]}>
                                {values.map(value => (
                                    <>
                                        <TouchableOpacity
                                            key={value.key}
                                            onPress={() => {
                                                changeChartType(value.key);
                                                setchartTypeModalVisble(false);
                                                setActiveChartType(value.ico)
                                            }}
                                            style={[styles.candleTypeButton]}>
                                            <AntDesign name={value.ico} size={24} color="black" />
                                            <Text
                                                style={[
                                                    styles.buttonLabel
                                                ]}>
                                                {value.desc}
                                            </Text>
                                        </TouchableOpacity>
                                    </>
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
                    <CloseModal
                        setModalVisible={setBasicModalVisble}
                    ></CloseModal>
                    <View style={{ }}>
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
                    <CloseModal
                        setModalVisible={setDrawingModalVisble}
                    ></CloseModal>
                    <View style={{}}>
                        <Text style={styles.modalText}>Add</Text>
                        <View style={styles.row}>
                            {values.map(value => (
                                <><Text>{ }</Text>
                                    <TouchableOpacity
                                        key={value.shape}
                                        onPress={() => {
                                            changeDrawing(value.shape);
                                            setDrawingModalVisble(false);
                                        }}
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

    const filterIndicators = function (searchTerm) {

        if (searchTerm) {
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
                <View style={settingsStyles.modalView}>
                    <CloseModal
                        setModalVisible={setIndicatorModalVisble}
                    ></CloseModal>
                    <View style={{}}>
                        <Text style={styles.modalText}>Add Indicator</Text>
                        <TextInput
                            style={{ height: 40 }}
                            placeholder="Search Indicator"
                            onChangeText={newText => {
                                setSearchTerm(newText)
                                filterIndicators(newText)
                            }
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

export const SettingPanelModal = ({
    values,
    settingPanelModalVisibility,
    setSettingPanelModalVisble,
    onPress,

}) => {
    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderMove: () => { },
            onPanResponderRelease: (_, gestureState) => {
                if (gestureState.dy > 50) {
                    setSettingPanelModalVisble(false);
                }
            },
        })
    ).current;

    const checkBoxes = [];
    values.options.forEach((option, index) => {
        if(option.input == 'checkbox') {
            checkBoxes[index] = option.currentValue
        } else {
            checkBoxes[index] = undefined;
        }
    });

    console.log("checkBoxes", checkBoxes)

    const [checkedItems, setCheckedItems] = useState(checkBoxes);

 

    const toggleCheckbox = (subcategories, index) => {
        const newCheckedItems = [...checkedItems];
        newCheckedItems[index] = !newCheckedItems[index];
        console.log("newCheckedItems", newCheckedItems)
        setCheckedItems(newCheckedItems);

        let data = {}
        data[subcategories.name] = newCheckedItems[index]
        data = JSON.stringify(data)

        onPress(subcategories.callBackMethod, data);
        // setSettingPanelModalVisble(false);

    };


    return (<View>
        <Modal
            animationType="slide"
            transparent={true}
            visible={settingPanelModalVisibility}
            onRequestClose={() => {
                // setIntervalModalVisble(!intervalModalVisibility);
            }}>
            <View style={styles.centeredView}
                {...panResponder.panHandlers}>
                <View style={settingsStyles.modalView}>
                    <CloseModal
                        setModalVisible={setSettingPanelModalVisble}
                    ></CloseModal>
                    <View style={{}}>

                        <Text style={settingsStyles.settingHeader}>{values.title}</Text>

                        <>
                            <ScrollView>
                                <View style={settingsStyles.container}>
                                    {values.options && values.options.map((subcategories, index) => (
                                        <>
                                            {subcategories.input === "checkbox" && (< View style={[{}]}>
                                                
                                                <CheckBox
                                                    checked={checkedItems[index]}
                                                    onPress={() => { toggleCheckbox(subcategories, index) }
                                                    }
                                                    title={subcategories.title}
                                                    iconType="material-community"
                                                    checkedIcon="checkbox-outline"
                                                    uncheckedIcon={'checkbox-blank-outline'}
                                                    size={18}
                                                    textStyle={{ color: 'black', fontWeight: '400' }}
                                                    wrapperStyle={{ paddingLeft: 0 }}
                                                    containerStyle={{ paddingLeft: 0 }}
                                                />
                                            </View>)}
                                            {subcategories.input === "Button" && (< View style={[settingsStyles.inputButtonSection]}>
                                                <Text style={{ minWidth: '30%', }}>{subcategories.title}</Text>
                                                {subcategories.values && subcategories.values.map(value => (
                                                    <TouchableOpacity
                                                        // key={subcategories.title}
                                                        onPress={() => {
                                                            let data = {}
                                                            data[subcategories.name] = value;
                                                            data = JSON.stringify(data);
                                                            console.log("data", data);
                                                            onPress(subcategories.callBackMethod, data);
                                                            subcategories.currentValue = value;
                                                            // setSettingPanelModalVisble(false);
                                                        }}
                                                        style={[settingsStyles.button,
                                                            value == subcategories.currentValue ? styles.selected : null]}>
                                                        {iconTagGenerator(value, subcategories.name)}
                                                    </TouchableOpacity>
                                                ))}

                                            </View>)}
                                            {/* {subcategories.input === "input" && (< View style={[settingsStyles.inputButtonSection, ]}>
                                                <Text style={{ minWidth: '30%' , }}>{subcategories.title}</Text>
                                                {subcategories.values && subcategories.values.map(value => (
                                                    <>
                                                        <TextInput
                                                            style={{height: 40,
                                                                margin: 12,
                                                                borderWidth: 1,
                                                                padding: 10,
                                                            }}
                                                            onChangeText={onChangeNumber}
                                                            value={number}
                                                            placeholder="useless placeholder"
                                                            keyboardType="numeric"
                                                        />
                                                    </>
                                                ))}

                                            </View>)} */}
                                        </>
                                    ))}
                                </View>
                            </ScrollView>
                        </>

                    </View>
                </View>
            </View>
        </Modal>
    </View>
    )
};

export const CloseModal = ({
    setModalVisible
}) => {

    return (
        <>
            <View style={styles.dragHandle}>
                {/* <MaterialIcons name="drag-handle" size={24} color="black" /> */}
                <Octicons name="dash" size={35} color="gray" />
            </View>
            <View style={{ alignItems: 'flex-end' }}>
                <TouchableOpacity
                    // key={value.key}
                    onPress={() => {
                        setModalVisible(false)
                    }}
                    style={{ justifyContent: 'flex-end', }}>
                    <AntDesign name="closecircleo" size={18} color="black" />
                </TouchableOpacity>
            </View>
        </>
    )
}