import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  PermissionsAndroid
} from 'react-native';

// device-info lib
import { getPowerState, isBatteryCharging, getSerialNumber } from 'react-native-device-info';

// auto-start lib
import AutoStart from 'react-native-autostart';

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
  const getPermissions = async () => {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE,
      {
        title: 'Permissão para obter informações sobre o dispositivo',
        message: 'Para uso total do aplicativo é necessário permitir a leitura das informações sobre o dispositivo.',
        buttonNeutral: "Pergunte-me depois",
        buttonNegative: "Cancelar",
        buttonPositive: "OK"
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        // Permission Granted
        alert('Permissão concedida.');
      } else {
        // Permission Denied
        alert('Permissão negada.');
      }
  };

  // device info
  const [isRunning, setIsRunning] = useState(false);
  const [isCharging, setIsCharging] = useState(false);
  const [powerState, setPowerState] = useState("");
  const [batterylvl, setBatteryLvl] = useState("");
  const [serial, setSerial] = useState("");

  // a cada 2s verifica se o dispositivo está ou não carregando
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