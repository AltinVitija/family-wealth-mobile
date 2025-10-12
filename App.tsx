import React, { FC } from 'react';
import { Provider } from 'react-redux';
import AppNavigator from 'src/navigation/AppNavigator';
import { persistor, store } from 'src/store/index';
import { PersistGate } from 'redux-persist/integration/react';
import './global.css';

const App = () => (
  <>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AppNavigator />
      </PersistGate>
    </Provider>
  </>
);

export default App;
