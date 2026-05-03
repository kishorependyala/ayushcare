import { useState, useEffect } from 'react';
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
  const [profile, setProfile] = useState({name: '', email: '', dob: ''});
  const [records, setRecords] = useState([]);
  const [newRecord, setNewRecord] = useState({title: '', description: '', date: ''});

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

  const handleDemoLogin = () => {
    setPhone('+7327184414');
    setToken('demo-token');
    setStep('profile');
    setMessage('Demo login successful!');
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
      setStep('profile');
      setMessage('Logged in successfully! Please update your profile.');
    } catch (error) {
      setMessage('Unable to reach backend. Start the API server on localhost:7071.');
    }
  };

  useEffect(() => {
    if (step === 'profile' && token) {
      fetchProfile();
    } else if (step === 'records' && token) {
      fetchRecords();
    }
  }, [step, token]);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`${API_BASE}/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchRecords = async () => {
    try {
      const response = await fetch(`${API_BASE}/records`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setRecords(data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const addRecord = async () => {
    try {
      const response = await fetch(`${API_BASE}/records`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(newRecord)
      });
      if (response.ok) {
        setNewRecord({title: '', description: '', date: ''});
        fetchRecords(); // refresh
        setMessage('Record added successfully!');
      } else {
        setMessage('Failed to add record.');
      }
    } catch (error) {
      setMessage('Unable to add record.');
    }
  };

  const saveProfile = async () => {
    try {
      const response = await fetch(`${API_BASE}/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(profile)
      });
      if (response.ok) {
        setMessage('Profile updated successfully!');
      } else {
        setMessage('Failed to update profile.');
      }
    } catch (error) {
      setMessage('Unable to save profile.');
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
          <Button title="Demo Login" onPress={handleDemoLogin} />
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

      {step === 'profile' && (
        <View style={styles.form}>
          <Text style={styles.sectionTitle}>Patient Profile</Text>
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            value={profile.name}
            onChangeText={(text) => setProfile({...profile, name: text})}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            keyboardType="email-address"
            value={profile.email}
            onChangeText={(text) => setProfile({...profile, email: text})}
          />
          <TextInput
            style={styles.input}
            placeholder="Date of Birth (YYYY-MM-DD)"
            value={profile.dob}
            onChangeText={(text) => setProfile({...profile, dob: text})}
          />
          <Button title="Save Profile" onPress={saveProfile} />
          <Button title="View Medical Records" onPress={() => setStep('records')} />
        </View>
      )}

      {step === 'records' && (
        <View style={styles.form}>
          <Text style={styles.sectionTitle}>Medical Records</Text>
          <Button title="Back to Profile" onPress={() => setStep('profile')} />
          {records.map((record) => (
            <View key={record.id} style={styles.record}>
              <Text>{record.title}</Text>
              <Text>{record.description}</Text>
              <Text>{record.date}</Text>
            </View>
          ))}
          <TextInput
            style={styles.input}
            placeholder="Title"
            value={newRecord.title}
            onChangeText={(text) => setNewRecord({...newRecord, title: text})}
          />
          <TextInput
            style={styles.input}
            placeholder="Description"
            value={newRecord.description}
            onChangeText={(text) => setNewRecord({...newRecord, description: text})}
          />
          <TextInput
            style={styles.input}
            placeholder="Date (YYYY-MM-DD)"
            value={newRecord.date}
            onChangeText={(text) => setNewRecord({...newRecord, date: text})}
          />
          <Button title="Add Record" onPress={addRecord} disabled={!newRecord.title.trim()} />
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
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 16,
    color: '#1f3c88',
  },
  record: {
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderColor: '#b0c4de',
    borderWidth: 1,
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
