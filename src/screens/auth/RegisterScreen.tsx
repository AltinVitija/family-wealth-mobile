// screens/auth/RegisterScreen.tsx
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
import { useDispatch, useSelector } from 'react-redux';

import CustomTextInput from 'src/components/inputs/custom-textfield';
import CustomButton from 'src/components/buttons/custom-button';
import { ROUTES } from 'src/utils/constants';
import { RegisterCredentials } from 'src/types/user';
import { registerUser } from 'src/services/auth/register.services';
import { registerStart, registerSuccess, registerFailure } from 'src/store/slices/auth/authSlice';
import { RootState } from 'src/store';

const RegisterScreen: FC = ({ navigation }: any) => {
  const dispatch = useDispatch();

  // Get state from Redux
  const isLoading = useSelector((state: RootState) => state.auth.isLoading);
  const error = useSelector((state: RootState) => state.auth.error);

  const [credentials, setCredentials] = useState<RegisterCredentials>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    agreeToTerms: false,
  });
  const [isValid, setIsValid] = useState(false);

  const handleNameChange = (text: string) => {
    setCredentials({ ...credentials, name: text });
    validateForm({ ...credentials, name: text });
  };

  const handleEmailChange = (text: string) => {
    setCredentials({ ...credentials, email: text });
    validateForm({ ...credentials, email: text });
  };

  const handlePasswordChange = (text: string) => {
    setCredentials({ ...credentials, password: text });
    validateForm({ ...credentials, password: text });
  };

  const handleConfirmPasswordChange = (text: string) => {
    setCredentials({ ...credentials, confirmPassword: text });
    validateForm({ ...credentials, confirmPassword: text });
  };

  const handlePhoneChange = (text: string) => {
    setCredentials({ ...credentials, phoneNumber: text });
    validateForm({ ...credentials, phoneNumber: text });
  };

  const validateForm = (creds: RegisterCredentials) => {
    const isNameValid = creds.name.trim().length >= 2;
    const isEmailValid = creds.email.trim() !== '' && creds.email.includes('@');
    const isPasswordValid = creds.password.trim().length >= 8;
    const doPasswordsMatch = creds.password === creds.confirmPassword && creds.password !== '';

    setIsValid(isNameValid && isEmailValid && isPasswordValid && doPasswordsMatch);
  };

  const handleRegister = async () => {
    if (!isValid) {
      Alert.alert('Invalid Input', 'Please check all fields');
      return;
    }

    if (credentials.password !== credentials.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    try {
      dispatch(registerStart());

      console.log('=== REGISTER START ===');
      console.log('Credentials:', {
        name: credentials.name,
        email: credentials.email,
        phone: credentials.phoneNumber,
      });

      const response = await registerUser(credentials);

      console.log('=== REGISTER SUCCESS ===');
      console.log('Access Token:', response.accessToken);
      console.log('Refresh Token:', response.refreshToken);
      console.log('User:', response.user);

      dispatch(registerSuccess(response));

      // Navigate to dashboard or profile completion
      if (response.hasCompletedProfile) {
        navigation.navigate(ROUTES.DASHBOARD);
      } else {
        navigation.navigate(ROUTES.AUTH_STACK);
      }
    } catch (error: any) {
      console.error('=== REGISTER ERROR ===');
      console.error('Error:', error.message);

      const errorMessage = error.message || 'Registration failed. Please try again.';
      dispatch(registerFailure(errorMessage));
      Alert.alert('Registration Failed', errorMessage);
    }
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <TouchableWithoutFeedback onPress={dismissKeyboard}>
          <View className="bg-creamWhite flex w-full flex-1">
            <View className="flex h-[15%] w-full items-end justify-end">{/* Header */}</View>

            <View className="flex-1 px-4 py-8">
              <View className="h-32 w-full items-center justify-center">
                <Text className="text-3xl font-bold">Create Account</Text>
                <Text className="mt-2 text-gray-600">Sign up to get started</Text>
              </View>

              <View className="w-full">
                {/* Name Input */}
                <CustomTextInput
                  onChangeText={handleNameChange}
                  label={'Full Name'}
                  value={credentials.name}
                  currentLength={0}
                  autoCapitalize="words"
                  autoCorrect={false}
                />

                {/* Email Input */}
                <CustomTextInput
                  onChangeText={handleEmailChange}
                  label={'Email'}
                  value={credentials.email}
                  errorMessage={error}
                  currentLength={0}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />

                {/* Phone Input (Optional) */}
                <CustomTextInput
                  onChangeText={handlePhoneChange}
                  label={'Phone Number (Optional)'}
                  value={credentials.phoneNumber}
                  currentLength={0}
                  keyboardType="phone-pad"
                />

                {/* Password Input */}
                <CustomTextInput
                  onChangeText={handlePasswordChange}
                  secureTextEntry={true}
                  label={'Password'}
                  value={credentials.password}
                  currentLength={0}
                  autoCapitalize="none"
                />

                {/* Confirm Password Input */}
                <CustomTextInput
                  onChangeText={handleConfirmPasswordChange}
                  secureTextEntry={true}
                  label={'Confirm Password'}
                  value={credentials.confirmPassword}
                  currentLength={0}
                  autoCapitalize="none"
                />
              </View>

              {/* Password Match Indicator */}
              {credentials.password !== '' && credentials.confirmPassword !== '' && (
                <View className="px-4 py-2">
                  {credentials.password === credentials.confirmPassword ? (
                    <Text className="text-sm text-green-600">✓ Passwords match</Text>
                  ) : (
                    <Text className="text-sm text-red-600">✗ Passwords do not match</Text>
                  )}
                </View>
              )}
            </View>

            <View className="flex items-center justify-end px-4 py-8">
              <View className="h-28 w-full items-center justify-center">
                <CustomButton
                  text={'Create Account'}
                  clicked={isValid}
                  itemClickedBackgroundColor={'#d4b038'}
                  itemUnClickedBackgroundColor="#ffffff"
                  itemClickedTextColor="#ffffff"
                  itemUnClickedTextColor="#000000"
                  click={handleRegister}
                  isLoading={isLoading}
                />

                <View
                  className={clsx(
                    'mb-10 w-full items-center justify-center',
                    Platform.OS === 'ios' ? 'mt-[1%]' : 'mt-[-1%]'
                  )}>
                  <View className="w-full flex-row items-center justify-center">
                    <Text>Already have an account? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate(ROUTES.LOGIN)}>
                      <Text className="font-medium text-black">Login</Text>
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

export default RegisterScreen;
