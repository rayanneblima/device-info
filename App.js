import React, {useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';

// device-info lib
import DeviceInfo from 'react-native-device-info';
import { getDevice, getPowerState, isBatteryCharging } from 'react-native-device-info';

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
  const [isActive, setIsActive] = useState(false);
  const [device, setDevice] = useState("");
  const [isCharging, setIsCharging] = useState(false);
  const [powerState, setPowerState] = useState("");
  const [batterylvl, setBatteryLvl] = useState("");

  const deviceBrand = DeviceInfo.getBrand();
  const model = DeviceInfo.getModel();
  const type = DeviceInfo.getDeviceType();
  const deviceId = DeviceInfo.getDeviceId();

  isBatteryCharging().then((charging) => setIsCharging(charging));
  getDevice().then((dvc) => setDevice(dvc));

  getPowerState().then((state) => {
    setBatteryLvl(state.batteryLevel);
    setPowerState(state.batteryState);
  });
  // device info

  return (
    <View style={styles.container}>
      <View style={styles.view}>
        {!isActive ?
          <Text>Serviço não iniciado.</Text>
          :
          isActive && isCharging ?
            <>
              <Text>Estado de carregamento: {powerState}</Text>
              <Text>Bateria: {(batterylvl*100).toFixed(0)}%</Text>
              <Text>Carregando? {isCharging ? "Sim" : "Não"}</Text>
              <Text>----------------</Text>
              <Text>Marca do Dispositivo: {deviceBrand}</Text>
              <Text>Modelo: {model}</Text>
              <Text>Dispositivo: {device}</Text>
              <Text>Tipo: {type}</Text>
              <Text>ID: {deviceId}</Text>
              <Text>----------------</Text>
            </>
            :
            <Text>Dispositivo não conectado.</Text>
        }
        <TouchableOpacity style={styles.button} onPress={() => {Unstoppable.startService(); setIsActive(true);}}>
          <Text style={styles.instructions}>Start</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => {Unstoppable.stopService(); setIsActive(false); console.log("O serviço foi parado.")}}>
          <Text style={styles.instructions}>Stop</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const mapStateToProps = store => ({
  unstoppable: store.App.unstoppable,
});

export default connect(mapStateToProps)(App);
