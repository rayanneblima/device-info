import React, {useState, useEffect, useCallback} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  PermissionsAndroid,
  DeviceEventEmitter
} from 'react-native';

// device-info lib
import { getPowerState, isBatteryCharging, getSerialNumber } from 'react-native-device-info';

// auto-start lib
import AutoStart from 'react-native-autostart';

// serial-port lib
import { RNSerialport, definitions, actions } from "react-native-serialport";

// heart-beat tutorial
import { connect } from 'react-redux';
import Unstoppable from './Unstoppable';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  view: {
    flex: 0.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    backgroundColor: 'gray',
    padding: 10,
    margin: 10,
  }
});

const App = () => {
  // device info
  const [isRunning, setIsRunning] = useState(false);
  const [isCharging, setIsCharging] = useState(false);
  const [powerState, setPowerState] = useState("");
  const [batterylvl, setBatteryLvl] = useState("");
  const [serial, setSerial] = useState("");
  // serial port
  const [serviceStarted, setServiceStarted] = useState(false);
  const [usbAttached, setUsbAttached] = useState(false);
  const [connected, setConnected] = useState(false);
  const [returnedDataType, setReturnedDataType] = useState(definitions.RETURNED_DATA_TYPES.HEXSTRING);
  const [output, setOutput] = useState("");
  const [baudRate, setBaudRate] = useState("115200");
  
  const getPermissions = async () => {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE, {
        title: 'Permissão para obter informações sobre o dispositivo',
        message: 'Para uso total do aplicativo é necessário permitir a leitura das informações sobre o dispositivo.',
        buttonNeutral: "Pergunte-me depois",
        buttonNegative: "Cancelar",
        buttonPositive: "OK"
        },
      );
      granted === PermissionsAndroid.RESULTS.GRANTED ? alert('Permissão concedida.') : alert('Permissão negada.');
  }

  function onServiceStarted(response) {
    setServiceStarted(true);
    if (response.deviceAttached) {
      onDeviceAttached();
    }
  }
  function onServiceStopped() {
    setServiceStarted(false);
  }
  function onDeviceAttached() {
    setUsbAttached(true);
  }
  function onDeviceDetached() {
    setUsbAttached(false);
  }
  function onConnected() {
    setConnected(true);
  }
  function onDisconnected() {
    setConnected(false);
  }
  function onReadData(data) {
    if (
      returnedDataType === definitions.RETURNED_DATA_TYPES.INTARRAY
    ) {
      const payload = RNSerialport.intArrayToUtf16(data.payload);
      setOutput("Output: " + output + payload);
    } else if (
      returnedDataType === definitions.RETURNED_DATA_TYPES.HEXSTRING
    ) {
      const payload = RNSerialport.hexToUtf16(data.payload);
      setOutput("Output: " + output + payload);
    }
  }
  function onError(error) {
    console.error(error);
  }

  // a cada 2s verifica se o dispositivo está ou não carregando
  // e atualiza a % da bateria
  setInterval(() => {
    isBatteryCharging().then((charging) => setIsCharging(charging));
    getPowerState().then((state) => {
      setBatteryLvl(state.batteryLevel);
      setPowerState(state.batteryState);
    });
  }, 2000);
  // device info

  useEffect(() => {
    if(AutoStart.isCustomAndroid()) {
      AutoStart.startAutostartSettings();
    }
    Unstoppable.startService(); // TODO: impedir que ative mais de uma vez
    setIsRunning(true);
    getSerialNumber().then((serialNumber) => setSerial(serialNumber));
  }, []);

  const sendData = useCallback(() => {
    DeviceEventEmitter.addListener(
      actions.ON_SERVICE_STARTED,
      onServiceStarted
    );
    DeviceEventEmitter.addListener(
      actions.ON_SERVICE_STOPPED,
      onServiceStopped
    );
    DeviceEventEmitter.addListener(
      actions.ON_DEVICE_ATTACHED,
      onDeviceAttached
    );
    DeviceEventEmitter.addListener(
      actions.ON_DEVICE_DETACHED,
      onDeviceDetached
    );
    DeviceEventEmitter.addListener(actions.ON_ERROR, onError, this);
    DeviceEventEmitter.addListener(
      actions.ON_CONNECTED,
      onConnected
    );
    DeviceEventEmitter.addListener(
      actions.ON_DISCONNECTED,
      onDisconnected
    );
    DeviceEventEmitter.addListener(actions.ON_READ_DATA, onReadData, this);
    RNSerialport.setReturnedDataType(returnedDataType);
    RNSerialport.setAutoConnectBaudRate(parseInt(baudRate, 10));
    //RNSerialport.setInterface(parseInt(interface, 10));
    RNSerialport.setAutoConnect(true);
    RNSerialport.startUsbService();
  });

  stopUsbListener = async () => {
    DeviceEventEmitter.removeAllListeners();
    const isOpen = await RNSerialport.isOpen();
    if (isOpen) {
      Alert.alert("isOpen", isOpen);
      RNSerialport.disconnect();
    }
    RNSerialport.stopUsbService();
  };

  
  return (
    <View style={styles.container}>
      <View style={styles.view}>
        {!isRunning ?
          <Text>Serviço não iniciado.</Text>
          :
          isRunning && isCharging ?
            <>
              <Text>Estado de carregamento: {powerState}</Text>
              <Text>Bateria: {(batterylvl*100).toFixed(0)}%</Text>
              <Text>Carregando? {isCharging ? "Sim" : "Não"}</Text>
              <Text>Serial Number: {serial}</Text>
              <Text>----------------</Text>
            </>
            :
            <Text>Dispositivo não conectado.</Text>
        }
        <TouchableOpacity style={styles.button} onPress={() => {Unstoppable.stopService(); setIsRunning(false); console.log("O serviço foi parado.")}}>
          <Text style={styles.instructions}>Stop</Text>
        </TouchableOpacity>  
        <TouchableOpacity style={styles.button} onPress={getPermissions}>
          <Text>Permissions to getSerial</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={sendData}>
          <Text>Send Data to USB Server</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const mapStateToProps = store => ({
  unstoppable: store.App.unstoppable,
});

export default connect(mapStateToProps)(App);


/* TODO:
- serviço iniciando sempre que abre o app, ou seja, deve ser limitado a startar
apenas 1 única vez;
- só pode puxar as informações quando o dispositivo estiver plugado no usb, ou seja,
carregando;
- trocar o setInterval para o reconhecimento do usb quando plugado;
*/