import React, { FC, useState } from 'react';
import {
  Text,
  View,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Platform,
  Keyboard,
  ScrollView,
  KeyboardAvoidingView,
  Alert,
} from 'react-native';

import clsx from 'clsx';
import { useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';

import { theme } from '../../../tailwind.config';
import CustomTextInput from 'src/components/inputs/custom-textfield';
import CustomButton from 'src/components/buttons/custom-button';
import { ROUTES } from 'src/utils/constants';
import { LoginCredentials } from 'src/types/user';
import { loginUser } from 'src/services/auth/login.services';
import { loginStart, loginSuccess, loginFailure } from 'src/store/slices/auth/authSlice';
import { RootState } from 'src/store'; // Add your store type
import { API_URL } from 'src/services/api';

const LoginScreen: FC = ({ navigation }: any) => {
  const route = useRoute();
  const dispatch = useDispatch();

  // Get state from Redux
  const isLoading = useSelector((state: RootState) => state.auth.isLoading);
  const error = useSelector((state: RootState) => state.auth.error);

  const [userCredentials, setUserCredentials] = useState<LoginCredentials>({
    email: '',
    password: '',
  });
  const [isValid, setIsValid] = useState(false);

  const handleEmailChange = (text: string) => {
    setUserCredentials({ ...userCredentials, email: text });
    validateForm(text, userCredentials.password); // Fixed: correct parameter order
  };

  const handlePasswordChange = (text: string) => {
    setUserCredentials({ ...userCredentials, password: text });
    validateForm(userCredentials.email, text); // Fixed: correct parameter order
  };

  const validateForm = (email: string, password: string) => {
    const isEmailValid = email.trim() !== '' && email.includes('@');
    const isPasswordValid = password.trim().length >= 8;
    setIsValid(isEmailValid && isPasswordValid);
  };

  // LoginScreen.tsx - Add logging
  const handleLogin = async () => {
    if (!isValid) {
      Alert.alert('Invalid Input', 'Please check your email and password');
      return;
    }

    try {
      dispatch(loginStart());
      const response = await loginUser(userCredentials);

      // ✅ Log tokens for testing
      console.log('=== LOGIN SUCCESS ===');
      console.log('Access Token:', response.accessToken);
      console.log('Refresh Token:', response.refreshToken);
      console.log('Has Completed Profile:', response.hasCompletedProfile);
      // console.log('User:', response.);

      dispatch(loginSuccess(response));

      if (response.hasCompletedProfile) {
        navigation.navigate(ROUTES.DASHBOARD);
      } else {
        navigation.navigate(ROUTES.AUTH_STACK);
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Wrong credentials. Please try again.';
      dispatch(loginFailure(errorMessage));
      Alert.alert('Login Failed', errorMessage);
    }
  };
  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="position-absolute flex-1">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <TouchableWithoutFeedback onPress={dismissKeyboard}>
          <View className="bg-creamWhite flex w-full flex-1">
            <View className="flex h-[15%] w-full items-end justify-end">
              {/* <CustomHeader onPress={() => navigation.goBack()} /> */}
            </View>

            <View className="flex-1 px-4 py-8">
              <View className="h-64 w-full items-center justify-center">
                {/* <LogoMemora /> */}
              </View>

              <View className="w-full">
                <CustomTextInput
                  onChangeText={handleEmailChange}
                  label={'Email'}
                  value={userCredentials.email}
                  errorMessage={error} // Show error from Redux
                  currentLength={0}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <CustomTextInput
                  onChangeText={handlePasswordChange}
                  secureTextEntry={true}
                  label={'Password'}
                  value={userCredentials.password}
                  currentLength={0}
                  autoCapitalize="none"
                />
              </View>

              <View className="mb-6 mt-[-3%] w-full flex-row items-center justify-end">
                {/* <TouchableOpacity
                  className="mr-6 h-5 items-center justify-center"
                  onPress={() => navigation.navigate(ROUTES.F)}>
                  <Text className="font-medium text-black">Forgot Password?</Text>
                </TouchableOpacity> */}
              </View>
            </View>

            <View className="flex flex-1 items-center justify-end px-4 py-8">
              <View className="h-28 w-full items-center justify-center">
                <CustomButton
                  text={'Login'}
                  clicked={isValid} // Enable button only when form is valid
                  itemClickedBackgroundColor={'#d4b038'}
                  itemUnClickedBackgroundColor="#ffffff"
                  itemClickedTextColor="#ffffff"
                  itemUnClickedTextColor="#000000"
                  click={handleLogin} // Fixed: use handleLogin function
                  isLoading={isLoading} // Show loading from Redux
                />

                <View
                  className={clsx(
                    'mb-10 w-full items-center justify-center',
                    Platform.OS === 'ios' ? 'mt-[1%]' : 'mt-[-1%]'
                  )}>
                  <View className="w-full flex-row items-center justify-center">
                    <Text>Dont have an account yet? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate(ROUTES.REGISTER)}>
                      <Text className="font-medium text-black">Register</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;
