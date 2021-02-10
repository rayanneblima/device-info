import { AppRegistry } from 'react-native';
import React from 'react';
import { Provider } from 'react-redux';
import App from './App';
import { name as appName } from './app.json';
import { setUnstoppable, store } from './store';

const MyHeadlessTask = async () => {
  console.log('O aplicativo está rodando.');
  store.dispatch(setUnstoppable(true));
};

const RNRedux = () => (
  <Provider store={store}>
    <App />
  </Provider>
);


AppRegistry.registerHeadlessTask('Unstoppable', () => MyHeadlessTask);
AppRegistry.registerComponent(appName, () => RNRedux);
