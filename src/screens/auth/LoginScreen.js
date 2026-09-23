import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text, TextInput, TouchableOpacity,
    View
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import colors from '../../theme/colors';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState('');
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) return Alert.alert('Missing Fields', 'Please fill in all fields.');
    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      const msg = err.code === 'auth/invalid-credential'
        ? 'Invalid email or password.'
        : err.message;
      Alert.alert('Login Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        {/* Top Green Section */}
        <View style={styles.topSection}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoLetter}>U</Text>
          </View>
          <Text style={styles.appName}>UMUGANDA</Text>
          <Text style={styles.tagline}>Community. Together. Rwanda.</Text>
        </View>

        {/* White Card */}
        <View style={styles.card}>
          <Text style={styles.welcomeText}>Welcome Back 👋</Text>
          <Text style={styles.subText}>Sign in to continue</Text>

          {/* Email */}
          <View style={[styles.inputWrap, focusedField === 'email' && styles.inputFocused]}>
            <Ionicons name="mail-outline" size={20} color={focusedField === 'email' ? colors.primary : colors.mediumGray} style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Email address"
              placeholderTextColor={colors.textLight}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField('')}
            />
          </View>

          {/* Password */}
          <View style={[styles.inputWrap, focusedField === 'password' && styles.inputFocused]}>
            <Ionicons name="lock-closed-outline" size={20} color={focusedField === 'password' ? colors.primary : colors.mediumGray} style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={colors.textLight}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField('')}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.mediumGray} />
            </TouchableOpacity>
          </View>

          {/* Sign In Button */}
          <TouchableOpacity style={[styles.btn, loading && { opacity: 0.8 }]} onPress={handleLogin} disabled={loading}>
            {loading
              ? <ActivityIndicator color={colors.white} />
              : <Text style={styles.btnText}>Sign In</Text>
            }
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>Don't have an account?</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity style={styles.registerBtn} onPress={() => navigation.navigate('Register')}>
            <Text style={styles.registerBtnText}>Create Account</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>🇷🇼 Umuganda — Building Rwanda Together</Text>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.primary },
  content: { flexGrow: 1 },
  topSection: {
    alignItems: 'center',
    paddingTop: 70, paddingBottom: 40,
  },
  logoCircle: {
    width: 86, height: 86, borderRadius: 43,
    backgroundColor: colors.white,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2, shadowRadius: 16, elevation: 10,
  },
  logoLetter: { fontSize: 44, fontWeight: 'bold', color: colors.primary },
  appName: { fontSize: 28, fontWeight: 'bold', color: colors.white, letterSpacing: 6 },
  tagline: { fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 6, letterSpacing: 1.5 },
  card: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 32, borderTopRightRadius: 32,
    flex: 1, paddingHorizontal: 28, paddingTop: 36, paddingBottom: 20,
  },
  welcomeText: { fontSize: 26, fontWeight: 'bold', color: colors.text },
  subText: { fontSize: 14, color: colors.textLight, marginBottom: 28, marginTop: 4 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: colors.border,
    borderRadius: 14, paddingHorizontal: 14,
    height: 56, backgroundColor: colors.background,
    marginBottom: 14,
  },
  inputFocused: { borderColor: colors.primary, backgroundColor: colors.white },
  icon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: colors.text },
  btn: {
    backgroundColor: colors.primary, borderRadius: 14,
    height: 56, justifyContent: 'center', alignItems: 'center',
    marginTop: 6, marginBottom: 24,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35, shadowRadius: 12, elevation: 8,
  },
  btnText: { color: colors.white, fontSize: 16, fontWeight: 'bold', letterSpacing: 0.5 },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: { fontSize: 13, color: colors.textLight },
  registerBtn: {
    borderWidth: 1.5, borderColor: colors.primary,
    borderRadius: 14, height: 54,
    justifyContent: 'center', alignItems: 'center',
  },
  registerBtnText: { color: colors.primary, fontSize: 15, fontWeight: 'bold' },
  footer: { textAlign: 'center', color: 'rgba(255,255,255,0.7)', fontSize: 12, padding: 20 },
});
