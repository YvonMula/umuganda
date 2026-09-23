import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { db, storage } from '../../../firebase';
import { useAuth } from '../../context/AuthContext';
import colors from '../../theme/colors';

export default function ProfileScreen({ navigation }) {
  const { user, userProfile, userRole, logout } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [editModal, setEditModal] = useState(false);
  const [uploadingPic, setUploadingPic] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: userProfile?.fullName || '',
    phone: userProfile?.phone || '',
    sector: userProfile?.sector || '',
  });

  // Listen for notifications from Firestore
  useEffect(() => {
    if (!user) return;

    // Subscribe to notifications collection for this user
    const notificationsRef = doc(db, 'notifications', user.uid);
    
    const unsubscribe = onSnapshot(notificationsRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        // You can handle real-time notifications here
        console.log('Notification update:', data);
        // Could show an alert or update a badge count
      }
    }, (error) => {
      console.error('Notification listener error:', error);
    });

    return () => unsubscribe();
  }, [user]);

  const handlePickImage = async () => {
    console.log('handlePickImage called');
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      console.log('Permission status:', status);
      if (!status.granted) {
        return Alert.alert('Permission Denied', 'Please allow access to your photos.');
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      console.log('Image picker result:', result);
      if (!result.canceled && result.assets[0]) {
        await uploadProfilePicture(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image.');
    }
  };

  const uploadProfilePicture = async (uri) => {
    setUploadingPic(true);
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const filename = `profile_${user.uid}_${Date.now()}.jpg`;
      const storageRef = ref(storage, `profile-pictures/${filename}`);
      
      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);

      // Update user profile in Firestore
      await updateDoc(doc(db, 'users', user.uid), {
        profilePicture: downloadURL,
      });

      Alert.alert('Success', 'Profile picture updated!');
    } catch (error) {
      console.error('Error uploading picture:', error);
      Alert.alert('Error', 'Failed to upload profile picture.');
    } finally {
      setUploadingPic(false);
    }
  };

  const handleEditProfile = () => {
    setEditForm({
      fullName: userProfile?.fullName || '',
      phone: userProfile?.phone || '',
      sector: userProfile?.sector || '',
    });
    setEditModal(true);
  };

  const handleSaveProfile = async () => {
    if (!editForm.fullName.trim()) {
      return Alert.alert('Error', 'Name cannot be empty.');
    }

    try {
      await updateDoc(doc(db, 'users', user.uid), {
        fullName: editForm.fullName.trim(),
        phone: editForm.phone.trim(),
        sector: editForm.sector.trim(),
      });

      Alert.alert('Success', 'Profile updated!');
      setEditModal(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile.');
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive', 
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          } 
        },
      ]
    );
  };

  const getRoleColor = () => {
    if (userRole === 'admin') return colors.danger;
    if (userRole === 'leader') return '#6C63FF';
    return colors.primary;
  };

  const getRoleIcon = () => {
    if (userRole === 'admin') return 'shield-checkmark';
    if (userRole === 'leader') return 'ribbon';
    return 'person';
  };

  const menuItems = [
    {
      section: 'Account',
      items: [
        { icon: 'create', label: 'Edit Profile', color: colors.primary, action: handleEditProfile },
        { icon: 'person', label: 'Full Name', value: userProfile?.fullName, color: colors.primary },
        { icon: 'mail', label: 'Email', value: user?.email, color: colors.primary },
        { icon: 'call', label: 'Phone', value: userProfile?.phone, color: colors.primary },
        { icon: 'location', label: 'Sector', value: userProfile?.sector, color: colors.primary },
      ]
    },
    {
      section: 'Preferences',
      items: [
        {
          icon: 'notifications', label: 'Notifications',
          color: colors.warning, toggle: true,
          value: notifications, onToggle: setNotifications,
        },
      ]
    },
    {
      section: 'Support',
      items: [
        { icon: 'information-circle', label: 'About Umuganda App', color: '#6C63FF', action: () => navigation.navigate('About') },
        { icon: 'shield-checkmark', label: 'Privacy Policy', color: '#6C63FF', action: () => navigation.navigate('PrivacyPolicy') },
        { icon: 'help-circle', label: 'Help & Support', color: '#6C63FF', action: () => navigation.navigate('Help') },
      ]
    }
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.avatarContainer} 
          onPress={() => {
            console.log('Avatar pressed');
            handlePickImage();
          }} 
          disabled={uploadingPic}
          activeOpacity={0.7}
        >
          {userProfile?.profilePicture ? (
            <Image source={{ uri: userProfile.profilePicture }} style={styles.avatarImage} />
          ) : (
            <View style={[styles.avatar, { backgroundColor: getRoleColor() }]}>
              <Text style={styles.avatarText}>
                {userProfile?.fullName?.charAt(0)?.toUpperCase() || 'U'}
              </Text>
            </View>
          )}
          {uploadingPic ? (
            <View style={styles.uploadingOverlay}>
              <ActivityIndicator size="small" color={colors.white} />
            </View>
          ) : (
            <View style={styles.cameraBadge}>
              <Ionicons name="camera" size={14} color={colors.white} />
            </View>
          )}
        </TouchableOpacity>
        <Text style={styles.userName}>{userProfile?.fullName}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
        <View style={[styles.rolePill, { backgroundColor: getRoleColor() + '25' }]}>
          <Ionicons name={getRoleIcon()} size={14} color={getRoleColor()} />
          <Text style={[styles.roleText, { color: getRoleColor() }]}>
            {userRole?.charAt(0).toUpperCase() + userRole?.slice(1)}
          </Text>
        </View>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        {[
          { label: 'Sector', value: userProfile?.sector || 'N/A', icon: 'location' },
          { label: 'Role', value: userRole || 'N/A', icon: 'ribbon' },
          { label: 'Status', value: 'Active', icon: 'checkmark-circle' },
        ].map((s, i) => (
          <View key={i} style={styles.statCard}>
            <View style={styles.statIconBg}>
              <Ionicons name={s.icon} size={20} color={colors.primary} />
            </View>
            <Text style={styles.statValue} numberOfLines={1}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Menu Sections */}
      {menuItems.map((section, si) => (
        <View key={si} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.section}</Text>
          <View style={styles.sectionCard}>
            {section.items.map((item, ii) => (
              <TouchableOpacity
                key={ii}
                style={[styles.menuItem, ii < section.items.length - 1 && styles.menuItemBorder]}
                onPress={item.action}
                disabled={item.loading}
                activeOpacity={item.action ? 0.7 : 1}
              >
                <View style={[styles.menuIcon, { backgroundColor: item.color + '15' }]}>
                  {item.loading ? (
                    <ActivityIndicator size="small" color={item.color} />
                  ) : (
                    <Ionicons name={item.icon} size={18} color={item.color} />
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                  {item.value && !item.toggle && (
                    <Text style={styles.menuValue}>{item.value}</Text>
                  )}
                </View>
                {item.toggle ? (
                  <Switch
                    value={item.value}
                    onValueChange={item.onToggle}
                    trackColor={{ false: colors.lightGray, true: colors.primary }}
                    thumbColor={colors.white}
                  />
                ) : (
                  <Ionicons name="chevron-forward" size={16} color={colors.mediumGray} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}

      {/* Sign Out */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Ionicons name="log-out" size={20} color={colors.danger} />
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>

      <Text style={styles.version}>Umuganda App v1.0.0 — ym</Text>
      <View style={{ height: 40 }} />

      {/* Edit Profile Modal */}
      <Modal visible={editModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setEditModal(false)}>
                <Ionicons name="close-circle" size={30} color={colors.mediumGray} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <View style={styles.inputBox}>
                <TextInput
                  style={styles.input}
                  value={editForm.fullName}
                  onChangeText={(text) => setEditForm({ ...editForm, fullName: text })}
                  placeholder="Enter your full name"
                />
              </View>

              <Text style={styles.inputLabel}>Phone</Text>
              <View style={styles.inputBox}>
                <TextInput
                  style={styles.input}
                  value={editForm.phone}
                  onChangeText={(text) => setEditForm({ ...editForm, phone: text })}
                  placeholder="Enter phone number"
                  keyboardType="phone-pad"
                />
              </View>

              <Text style={styles.inputLabel}>Sector</Text>
              <View style={styles.inputBox}>
                <TextInput
                  style={styles.input}
                  value={editForm.sector}
                  onChangeText={(text) => setEditForm({ ...editForm, sector: text })}
                  placeholder="Enter your sector"
                />
              </View>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} onPress={() => setEditModal(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.saveBtn]} onPress={handleSaveProfile}>
                <Text style={styles.saveBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    backgroundColor: colors.primary, paddingTop: 54,
    paddingBottom: 36, alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  avatarContainer: { position: 'relative', marginBottom: 12 },
  avatar: {
    width: 88, height: 88, borderRadius: 44,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.5)',
  },
  avatarImage: {
    width: 88, height: 88, borderRadius: 44,
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.5)',
  },
  uploadingOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    borderRadius: 44, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center', alignItems: 'center',
  },
  cameraBadge: {
    position: 'absolute', bottom: 0, right: 0,
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: colors.primary,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: colors.white,
  },
  avatarText: { fontSize: 36, fontWeight: 'bold', color: colors.white },
  roleIconBadge: {
    position: 'absolute', bottom: 0, right: 0,
    width: 26, height: 26, borderRadius: 13,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: colors.white,
  },
  userName: { fontSize: 22, fontWeight: 'bold', color: colors.white },
  userEmail: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  rolePill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderRadius: 20, paddingVertical: 5, paddingHorizontal: 14, marginTop: 10,
  },
  roleText: { fontSize: 13, fontWeight: 'bold' },
  statsRow: {
    flexDirection: 'row', margin: 16, gap: 10,
  },
  statCard: {
    flex: 1, backgroundColor: colors.white, borderRadius: 12,
    padding: 12, alignItems: 'center', gap: 6,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  statIconBg: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center', alignItems: 'center',
  },
  statValue: { fontSize: 13, fontWeight: 'bold', color: colors.text, textAlign: 'center' },
  statLabel: { fontSize: 10, color: colors.textLight },
  section: { paddingHorizontal: 16, marginBottom: 8 },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: colors.mediumGray, marginBottom: 8, marginLeft: 4, letterSpacing: 0.5 },
  sectionCard: {
    backgroundColor: colors.white, borderRadius: 14, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center',
    padding: 14, gap: 12,
  },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  menuIcon: {
    width: 36, height: 36, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center',
  },
  menuLabel: { fontSize: 14, fontWeight: '600', color: colors.text },
  menuValue: { fontSize: 12, color: colors.textLight, marginTop: 1 },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: colors.danger + '15', borderRadius: 14,
    marginHorizontal: 16, marginTop: 8, padding: 16,
    borderWidth: 1.5, borderColor: colors.danger + '30',
  },
  logoutText: { fontSize: 15, fontWeight: 'bold', color: colors.danger },
  version: { textAlign: 'center', fontSize: 12, color: colors.textLight, marginTop: 16 },
  
  // Modal styles
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', padding: 20,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: colors.text },
  modalBody: { padding: 20 },
  inputLabel: {
    fontSize: 13, fontWeight: '600',
    color: colors.darkGray, marginBottom: 8, marginTop: 12,
  },
  inputBox: {
    borderWidth: 1.5, borderColor: colors.border,
    borderRadius: 10, paddingHorizontal: 12,
    backgroundColor: colors.background,
  },
  input: { fontSize: 15, color: colors.text, height: 48 },
  modalFooter: {
    flexDirection: 'row', padding: 20, gap: 12,
  },
  modalBtn: {
    flex: 1, padding: 14, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  cancelBtn: { backgroundColor: colors.lightGray },
  cancelBtnText: { fontSize: 16, fontWeight: '600', color: colors.darkGray },
  saveBtn: { backgroundColor: colors.primary },
  saveBtnText: { fontSize: 16, fontWeight: '600', color: colors.white },
});
