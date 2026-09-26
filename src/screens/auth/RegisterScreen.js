import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView, Platform,
  ScrollView,
  StyleSheet,
  Text, TextInput, TouchableOpacity,
  View
} from 'react-native';
import { KIGALI_SECTORS } from '../../constants/kigaliLocations';
import { useAuth } from '../../context/AuthContext';
import colors from '../../theme/colors';

export default function RegisterScreen({ navigation }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [sector, setSector] = useState('');
  const [cell, setCell] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleRegister = async () => {
    if (!fullName || !email || !phone || !sector || !password || !confirmPassword)
      return Alert.alert('Error', 'Please fill in all fields');
    
    if (password !== confirmPassword)
      return Alert.alert('Error', 'Passwords do not match');
    
    if (password.length < 6)
      return Alert.alert('Error', 'Password must be at least 6 characters');

    setLoading(true);
    try {
      await register(email.trim(), password, fullName, phone, sector, cell.trim());
      Alert.alert('Success', 'Registration successful!');
    } catch (err) {
      Alert.alert('Registration Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>U</Text>
          </View>
          <Text style={styles.appName}>UMUGANDA</Text>
          <Text style={styles.tagline}>Join Our Community</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Sign up to get started</Text>

          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={20} color={colors.mediumGray} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              placeholderTextColor={colors.mediumGray}
              value={fullName}
              onChangeText={setFullName}
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color={colors.mediumGray} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email address"
              placeholderTextColor={colors.mediumGray}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="call-outline" size={20} color={colors.mediumGray} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              placeholderTextColor={colors.mediumGray}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="location-outline" size={20} color={colors.mediumGray} style={styles.inputIcon} />
            <TouchableOpacity
              style={styles.dropdownTrigger}
              onPress={() => setShowDropdown(!showDropdown)}
            >
              <Text style={[styles.input, !sector && { color: colors.mediumGray }]}>
                {sector || 'Select Sector'}
              </Text>
              <Ionicons name="chevron-down-outline" size={20} color={colors.mediumGray} />
            </TouchableOpacity>
          </View>

          {showDropdown && (
            <View style={styles.dropdown}>
              {KIGALI_SECTORS.map((s) => (
                <TouchableOpacity
                  key={s}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setSector(s);
                    setShowDropdown(false);
                  }}
                >
                  <Text style={styles.dropdownText}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View style={styles.inputContainer}>
            <Ionicons name="pin-outline" size={20} color={colors.mediumGray} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Cell / Akagari (optional)"
              placeholderTextColor={colors.mediumGray}
              value={cell}
              onChangeText={setCell}
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color={colors.mediumGray} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={colors.mediumGray}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.mediumGray} />
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color={colors.mediumGray} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              placeholderTextColor={colors.mediumGray}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showPassword}
            />
          </View>

          <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
            {loading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.buttonText}>Create Account</Text>
            )}
          </TouchableOpacity>

          <View style={styles.row}>
            <Text style={styles.mutedText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.linkText}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.primary },
  content: { flexGrow: 1, paddingBottom: 40 },
  header: { alignItems: 'center', paddingTop: 70, paddingBottom: 40 },
  logoCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: colors.white, justifyContent: 'center',
    alignItems: 'center', marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 6, elevation: 6,
  },
  logoText: { fontSize: 40, fontWeight: 'bold', color: colors.primary },
  appName: { fontSize: 26, fontWeight: 'bold', color: colors.white, letterSpacing: 5 },
  tagline: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 4, letterSpacing: 1.5 },
  card: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 30, borderTopRightRadius: 30,
    flex: 1, paddingHorizontal: 24, paddingTop: 36,
  },
  title: { fontSize: 26, fontWeight: 'bold', color: colors.text, marginBottom: 4 },
  subtitle: { fontSize: 14, color: colors.textLight, marginBottom: 32 },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: colors.border,
    borderRadius: 12, paddingHorizontal: 14,
    marginBottom: 16, height: 54, backgroundColor: colors.background,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: colors.text },
  dropdownTrigger: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdown: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    marginBottom: 16,
    maxHeight: 200,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  dropdownText: { fontSize: 15, color: colors.text },
  button: {
    backgroundColor: colors.primary, borderRadius: 12,
    height: 54, justifyContent: 'center', alignItems: 'center',
    marginTop: 8, marginBottom: 24,
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  buttonText: { color: colors.white, fontSize: 16, fontWeight: 'bold', letterSpacing: 1 },
  row: { flexDirection: 'row', justifyContent: 'center' },
  mutedText: { color: colors.textLight, fontSize: 14 },
  linkText: { color: colors.primary, fontSize: 14, fontWeight: 'bold' },
});