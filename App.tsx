import { StatusBar } from 'expo-status-bar';
import { Text, View } from 'react-native';
import './global.css';
import AppNavigator from 'src/navigation/AppNavigator';

export default function App() {
  return (
    <>
      <AppNavigator />
    </>
  );
}
