import AsyncStorage from '@react-native-async-storage/async-storage';

interface MyData {
  key: string;
  value: string;
}

// Store data in AsyncStorage
const storeData = async (data: MyData) => {
  try {
    if (!data.value || data.value === null || data.value === undefined || data.value === '') {
      console.warn(` Attempted to store empty value for key: ${data.key}`);
      return; // Don't throw, just skip storing
    }

    await AsyncStorage.setItem(data.key, data.value); // Don't JSON.stringify strings
    console.log('Data stored successfully for key:', data.key);
  } catch (error) {
    console.error('Error storing data:', error);
  }
};

// Retrieve data from AsyncStorage
const getData = async (key: string) => {
  try {
    const value = await AsyncStorage.getItem(key);
    if (value !== null) {
      console.log(' Retrieved data for key:', key);
      return value; // Return as string, don't JSON.parse
    } else {
      console.log('No data found for key:', key);
      return null;
    }
  } catch (error) {
    console.error('Error retrieving data for key:', key, error);
    return null;
  }
};

// Remove data from AsyncStorage
const removeData = async (key: string) => {
  try {
    await AsyncStorage.removeItem(key);
    console.log(' Data removed successfully for key:', key);
  } catch (error) {
    console.error(' Error removing data for key:', key, error);
  }
};

export { removeData, storeData, getData };
