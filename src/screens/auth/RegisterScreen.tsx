import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'src/store';
import { registerStart, registerSuccess, registerFailure } from 'src/store/slices/auth/authSlice';
import { registerUser } from 'src/services/auth/register.services';
import { ROUTES } from 'src/utils/constants';

const RegisterScreen = ({ navigation }: any) => {
  const dispatch = useDispatch();
  const isLoading = useSelector((state: RootState) => state.auth.isLoading);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isValid =
    firstName.trim().length >= 2 &&
    lastName.trim().length >= 2 &&
    validateEmail(email) &&
    password.length >= 6 &&
    password === confirmPassword;

  const handleRegister = async () => {
    if (!isValid) {
      Alert.alert('Error', 'Please fill in all fields correctly');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    try {
      dispatch(registerStart());

      // Create credentials object matching the backend expectations
      const credentials = {
        name: `${firstName} ${lastName}`,
        email,
        password,
        confirmPassword,
        phoneNumber: phone,
        agreeToTerms: true,
      };

      const response = await registerUser(credentials);
      dispatch(registerSuccess(response));

      Alert.alert('Success', 'Account created successfully! Please sign in.', [
        {
          text: 'OK',
          onPress: () => navigation.navigate(ROUTES.LOGIN),
        },
      ]);
    } catch (error: any) {
      const errorMessage = error.message || 'Registration failed';
      dispatch(registerFailure(errorMessage));
      Alert.alert('Registration Failed', errorMessage);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
            <Image
              source={require('src/assets/logo.png')}
              resizeMode="contain"
              style={styles.logo}
            />
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Start managing your wealth</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* First Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>First Name *</Text>
              <View style={styles.inputContainer}>
                <Image source={require('src/assets/icons/user.png')} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholder="Your first name"
                  placeholderTextColor="#94A3B8"
                  autoCapitalize="words"
                  editable={!isLoading}
                />
              </View>
              {firstName && firstName.trim().length < 2 && (
                <Text style={styles.errorText}>Minimum 2 characters</Text>
              )}
            </View>

            {/* Last Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Last Name *</Text>
              <View style={styles.inputContainer}>
                <Image source={require('src/assets/icons/user.png')} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={lastName}
                  onChangeText={setLastName}
                  placeholder="Your last name"
                  placeholderTextColor="#94A3B8"
                  autoCapitalize="words"
                  editable={!isLoading}
                />
              </View>
              {lastName && lastName.trim().length < 2 && (
                <Text style={styles.errorText}>Minimum 2 characters</Text>
              )}
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email *</Text>
              <View style={styles.inputContainer}>
                <Image source={require('src/assets/icons/mail.png')} style={styles.emailIcon} />
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="email@example.com"
                  placeholderTextColor="#94A3B8"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                />
              </View>
              {email && !validateEmail(email) && (
                <Text style={styles.errorText}>Invalid email</Text>
              )}
            </View>

            {/* Phone (Optional) */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone</Text>
              <View style={styles.inputContainer}>
                <Image source={require('src/assets/icons/phone.png')} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="+355 XX XXX XXX"
                  placeholderTextColor="#94A3B8"
                  keyboardType="phone-pad"
                  editable={!isLoading}
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password *</Text>
              <View style={styles.inputContainer}>
                <Image
                  source={require('src/assets/icons/password.png')}
                  style={styles.passwordIcon}
                />
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Minimum 6 characters"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  editable={!isLoading}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}>
                  <Image
                    style={styles.eyeIcon}
                    source={
                      showPassword
                        ? require('../../assets/icons/hide.png')
                        : require('../../assets/icons/view.png')
                    }
                  />
                </TouchableOpacity>
              </View>
              {password && password.length < 6 && (
                <Text style={styles.errorText}>Minimum 6 characters</Text>
              )}
            </View>

            {/* Confirm Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm Password *</Text>
              <View style={styles.inputContainer}>
                <Image
                  source={require('src/assets/icons/password.png')}
                  style={styles.passwordIcon}
                />
                <TextInput
                  style={styles.input}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Re-enter your password"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  editable={!isLoading}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeButton}>
                  <Image
                    style={styles.eyeIcon}
                    source={
                      showPassword
                        ? require('../../assets/icons/hide.png')
                        : require('../../assets/icons/view.png')
                    }
                  />
                </TouchableOpacity>
              </View>
              {confirmPassword && password !== confirmPassword && (
                <Text style={styles.errorText}>Passwords do not match</Text>
              )}
              {confirmPassword && password === confirmPassword && password.length >= 6 && (
                <Text style={styles.successText}>✓ Passwords match</Text>
              )}
            </View>

            {/* Register Button */}
            <TouchableOpacity
              style={[styles.registerButton, !isValid && styles.registerButtonDisabled]}
              onPress={handleRegister}
              disabled={!isValid || isLoading}>
              {isLoading ? (
                <ActivityIndicator color="#1E3A5F" />
              ) : (
                <Text style={styles.registerButtonText}>Create Account</Text>
              )}
            </TouchableOpacity>

            {/* Terms Notice */}
            <Text style={styles.termsText}>
              By registering, you agree to our{' '}
              <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>

            {/* Login Link */}
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate(ROUTES.LOGIN)}>
                <Text style={styles.loginLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    bottom: 0,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 24,
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: 20,
    padding: 8,
  },
  backIcon: {
    fontSize: 24,
    color: '#1E3A5F',
  },
  logo: {
    fontSize: 48,
    marginBottom: 12,
    height: 100,
    width: 150,
  },

  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E3A5F',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
  },
  form: {
    flex: 1,
    paddingBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E3A5F',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    width: 20,
    height: 20,
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1E3A5F',
  },
  eyeButton: {
    padding: 4,
  },

  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
    marginLeft: 4,
  },
  successText: {
    fontSize: 12,
    color: '#10B981',
    marginTop: 4,
    marginLeft: 4,
  },
  registerButton: {
    backgroundColor: '#D4AF37',
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  registerButtonDisabled: {
    backgroundColor: '#E2E8F0',
    opacity: 0.6,
  },
  registerButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E3A5F',
  },
  termsText: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 18,
  },
  termsLink: {
    color: '#082645',
    fontWeight: '600',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontSize: 14,
    color: '#64748B',
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '700',
    color: '#D4AF37',
  },
  emailIcon: { width: 20, height: 20, marginRight: 8 },
  passwordIcon: { width: 20, height: 20, marginRight: 8 },
  eyeIcon: { height: 20, width: 20 },
});

export default RegisterScreen;
