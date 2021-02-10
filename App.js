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
    
      // Calling the permission function
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE,
        {
          title: 'Example App PHONE STATE Permission',
          message: 'Example App needs access to your PHONE STATE',
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK"
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        // Permission Granted
        alert('PHONE STATE Permission granted');
      } else {
        // Permission Denied
        alert('PHONE STATE Permission Denied');
      }
  };

  // device info
  const [isActive, setIsActive] = useState(false);
  const [isCharging, setIsCharging] = useState(false);
  const [powerState, setPowerState] = useState("");
  const [batterylvl, setBatteryLvl] = useState("");
  const [serial, setSerial] = useState("");
  
  isBatteryCharging().then((charging) => setIsCharging(charging));
  getPowerState().then((state) => {
    setBatteryLvl(state.batteryLevel);
    setPowerState(state.batteryState);
  });
  
  // device info

  useEffect(() => {
    if(AutoStart.isCustomAndroid()) {
      AutoStart.startAutostartSettings();
    }
    Unstoppable.startService(); // impedir que ative mais de uma vez
    setIsActive(true);
    getSerialNumber().then((serialNumber) => setSerial(serialNumber));
  }, []);
  
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
              <Text>Serial Number: {serial}</Text>
              <Text>----------------</Text>
            </>
            :
            <Text>Dispositivo não conectado.</Text>
        }
        {/* <TouchableOpacity style={styles.button} onPress={() => {Unstoppable.startService(); setIsActive(true);}}>
          <Text style={styles.instructions}>Start</Text>
        </TouchableOpacity> */}
        <TouchableOpacity style={styles.button} onPress={() => {Unstoppable.stopService(); setIsActive(false); console.log("O serviço foi parado.")}}>
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
*/