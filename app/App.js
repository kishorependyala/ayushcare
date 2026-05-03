import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Button, StyleSheet, Text, TextInput, View } from 'react-native';
import config from './config';

const API_BASE = config.apiBaseUrl;

export default function App() {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState('phone');
  const [message, setMessage] = useState('Enter your mobile number to receive a mock OTP.');
  const [token, setToken] = useState('');

  const handleSendOtp = async () => {
    setMessage('Sending OTP...');
    try {
      const response = await fetch(`${API_BASE}/sendOtp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const data = await response.json();
      if (!response.ok) {
        setMessage(data.error || 'Failed to send OTP.');
        return;
      }
      setStep('code');
      setMessage(`OTP sent (mock). Enter the code now. ${data.otp ? `Mock OTP: ${data.otp}` : ''}`);
    } catch (error) {
      setMessage('Unable to reach backend. Start the API server on localhost:7071.');
    }
  };

  const handleVerifyOtp = async () => {
    setMessage('Verifying OTP...');
    try {
      const response = await fetch(`${API_BASE}/verifyOtp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code }),
      });
      const data = await response.json();
      if (!response.ok) {
        setMessage(data.error || 'OTP verification failed.');
        return;
      }
      setToken(data.token);
      setStep('authenticated');
      setMessage('Logged in successfully! You can now access patient data later.');
    } catch (error) {
      setMessage('Unable to reach backend. Start the API server on localhost:7071.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>AyushCare</Text>
      <Text style={styles.subtitle}>Mobile login with mock OTP</Text>

      {step === 'phone' && (
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Mobile number"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />
          <Button title="Send OTP" onPress={handleSendOtp} disabled={!phone.trim()} />
        </View>
      )}

      {step === 'code' && (
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Enter OTP code"
            keyboardType="numeric"
            value={code}
            onChangeText={setCode}
          />
          <Button title="Verify OTP" onPress={handleVerifyOtp} disabled={!code.trim()} />
          <Button title="Resend OTP" onPress={handleSendOtp} />
        </View>
      )}

      {step === 'authenticated' && (
        <View style={styles.authenticated}>
          <Text style={styles.success}>Authenticated</Text>
          <Text>Phone: {phone}</Text>
          <Text>Session token: {token}</Text>
        </View>
      )}

      <Text style={styles.message}>{message}</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#f2f5fb',
    justifyContent: 'center',
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    marginBottom: 8,
    color: '#1f3c88',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
    color: '#2b3a67',
  },
  form: {
    marginBottom: 24,
  },
  input: {
    height: 48,
    borderColor: '#b0c4de',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#ffffff',
    marginBottom: 12,
  },
  message: {
    marginTop: 24,
    color: '#3c4a80',
  },
  authenticated: {
    marginTop: 12,
    padding: 16,
    borderRadius: 10,
    backgroundColor: '#e2f4e9',
  },
  success: {
    fontWeight: '700',
    color: '#117a48',
    marginBottom: 8,
  },
});
