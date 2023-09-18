import { StyleSheet } from 'react-native';
export const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 8,
    // backgroundColor: 'yellow',
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
    backgroundColor: 'gainsboro',
    alignSelf: 'flex-start',
    marginHorizontal: '1%',
    marginBottom: 6,
    minWidth: '28%',
    textAlign: 'center',
    // flex: 1,
    flexDirection: 'row'
  },
  indicatorButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 4,
    backgroundColor: 'gainsboro',
    alignSelf: 'flex-start',
    marginBottom: 6,
    minWidth: '100%',
    textAlign: 'center',
    // flex: 1,
    flexDirection: 'row'
  },
  buttonBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 1,
    justifyContent: 'space-around',
    padding: 8,
    
    borderTopColor: 'gray',
    borderTopWidth: StyleSheet.hairlineWidth,
    backgroundColor: 'white',

    columnGap: 50
  },
  buttonBarButtons: {
    // paddingHorizontal: 8,
    // paddingVertical: 6,
    borderRadius: 4,
    
    // backgroundColor: 'lightblue',
    // alignSelf: 'flex-start',
    // marginHorizontal: '1%',
    // marginBottom: 6,
    // minWidth: '28%',
    // textAlign: 'center',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    color: 'black',
    textAlign: 'center',
    marginLeft: '10'
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
    // justifyContent: 'center',
    // alignItems: 'center',
    // marginTop: 22,
    
    
  },
  modalView: {
    position: 'absolute',
    // flex: 1,
    // flexDirection: 'column',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    paddingLeft: 15,
    paddingRight: 15,
    paddingBottom: 35, // Adjust as needed
    // alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2, // Adjust for the desired shadow direction
    },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 5,
    // backgroundColor: 'red',
    // height: '100%',
  },
  modalText: {
    marginBottom: 15,
  },
  buttonClose: {
    textAlign: 'center',
    justifyContent: 'center'
  },
  dragHandle: {
    // backgroundColor: 'blue',
    alignItems: 'center',

  },
  intervalButtons: {
    paddingVertical: 6,
    borderRadius: 4,
    height: 40,
    backgroundColor: 'whitesmoke',
    justifyContent: 'center',
    // marginHorizontal: '3%',
    marginRight: 20,
    marginTop: 20,
    minWidth: '15%',

  },
  intervalButtonText :{
    fontSize: 15,
    fontWeight: '500',
    color: 'black',
    textAlign: 'center',
    // backgroundColor: 'pink',
    marginLeft: '10'
  },
  textHeaders: {
    // backgroundColor: 'yellow',
    // paddingBottom: 5,
    fontWeight: 'Medium',
    fontSize: 20
  },

  candleTypeButton: {
    paddingVertical: 8,
    borderRadius: 4,
    backgroundColor: 'gainsboro',
    justifyContent: 'center',
    // marginHorizontal: '3%',
    marginRight: 20,
    marginTop: 24,
    minWidth: '23%',
    alignItems: 'center',
    flexDirection: 'column',
    backgroundColor: 'whitesmoke',
  },
  selected: {
    backgroundColor: 'lightblue',
  },

});

export const settingsStyles = StyleSheet.create({
  settingHeader: {
    fontWeight: 'bold',
    fontSize: 20,
    marginBottom: 30,
    borderBottomColor: 'gray',
    borderBottomWidth: StyleSheet.hairlineWidth,
    backgroundColor: 'white',
  },
  checkbox: {
    alignSelf: 'center',
  },
  row: {
    alignSelf: 'center',
  },
  container: {
    flexDirection: 'column',
    paddingLeft:0
  },
  modalView: {
    flex: 1,
    // margin: 20,
    width: '100%',
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 10,
    // padding: 35,
    paddingBottom: 35,
    paddingLeft:15,
    paddingRight: 35,
    // alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 10,
    // backgroundColor: 'lightblue'
  },
  button: {
    width: 30,
    height: 30,
    borderRadius: 4,
    backgroundColor: 'whitesmoke',
    marginHorizontal: '1%',
    marginBottom: 6,
    // minWidth: '28%',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row'
  },
  inputButtonSection: {
    flexDirection: 'row',
    marginVertical: 10
  },
});