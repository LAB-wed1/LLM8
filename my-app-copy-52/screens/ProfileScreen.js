import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ScrollView,
  TextInput,
  ActivityIndicator
} from 'react-native';
import { signOut, updateProfile, updatePassword, deleteUser, getAuth } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { performLogout } from '../utils/authHelpers';
import LogoutButton from '../components/LogoutButton';
import DirectLogoutButton from '../components/DirectLogoutButton';
import EmergencyLogoutButton from '../components/EmergencyLogoutButton';
import ClearAndRefreshButton from '../components/ClearAndRefreshButton';

const ProfileScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (auth.currentUser) {
      setUser(auth.currentUser);
      setNewDisplayName(auth.currentUser.displayName || '');
    }
  }, []);  const handleSignOut = async () => {
    // ทดสอบการเข้าถึง Firebase auth
    try {
      console.log("Current user:", auth?.currentUser?.email);
    } catch(e) {
      console.error("Error checking current user:", e);
    }
    
    Alert.alert(
      'ออกจากระบบ',
      'คุณต้องการออกจากระบบหรือไม่?',
      [
        { text: 'ยกเลิก', style: 'cancel' },
        { 
          text: 'ออกจากระบบ', 
          style: 'destructive',
          onPress: () => {
            setLoading(true);
            // ใช้ทั้ง Firebase auth และ navigation ในการจัดการการออกจากระบบ
            signOut(auth)
              .then(() => {
                console.log('Firebase sign out successful');
                // ล้าง AsyncStorage
                return AsyncStorage.multiRemove([
                  '@selected_products',
                  '@user_data',
                  '@cart_items',
                  '@user_preferences'
                ]);
              })
              .then(() => {
                console.log('AsyncStorage cleared successfully');
                // นำทางผู้ใช้ไปยังหน้าล็อกอินด้วยตนเองเพื่อให้แน่ใจว่าการนำทางเกิดขึ้น
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Auth' }]
                });
              })
              .catch(error => {
                console.error('Logout error:', error);
                Alert.alert(
                  'ข้อผิดพลาด', 
                  'ไม่สามารถออกจากระบบได้: ' + (error.message || 'กรุณาลองใหม่อีกครั้ง')
                );
              })
              .finally(() => {
                setLoading(false);
              });
          }
        }
      ]
    );
  };

  const handleUpdateProfile = async () => {
    if (!newDisplayName.trim()) {
      Alert.alert('ข้อผิดพลาด', 'กรุณากรอกชื่อผู้ใช้');
      return;
    }

    setLoading(true);
    try {
      await updateProfile(auth.currentUser, {
        displayName: newDisplayName.trim()
      });
      
      setUser(auth.currentUser);
      setEditing(false);
      Alert.alert('สำเร็จ', 'อัพเดทข้อมูลโปรไฟล์แล้ว');
    } catch (error) {
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถอัพเดทข้อมูลได้');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert('ข้อผิดพลาด', 'กรุณากรอกรหัสผ่านให้ครบถ้วน');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('ข้อผิดพลาด', 'รหัสผ่านไม่ตรงกัน');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('ข้อผิดพลาด', 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
      return;
    }

    setLoading(true);
    try {
      await updatePassword(auth.currentUser, newPassword);
      setNewPassword('');
      setConfirmPassword('');
      Alert.alert('สำเร็จ', 'เปลี่ยนรหัสผ่านแล้ว');
    } catch (error) {
      let errorMessage = 'ไม่สามารถเปลี่ยนรหัสผ่านได้';
      
      if (error.code === 'auth/requires-recent-login') {
        errorMessage = 'กรุณาเข้าสู่ระบบใหม่ก่อนเปลี่ยนรหัสผ่าน';
      }
      
      Alert.alert('ข้อผิดพลาด', errorMessage);
    } finally {
      setLoading(false);
    }
  };
  const handleDeleteAccount = async () => {
    Alert.alert(
      'ลบบัญชี',
      'คุณต้องการลบบัญชีถาวรหรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้',
      [
        { text: 'ยกเลิก', style: 'cancel' },
        { 
          text: 'ลบบัญชี', 
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              // ล้างข้อมูลทั้งหมดใน AsyncStorage
              await AsyncStorage.clear();
              // ลบบัญชีผู้ใช้
              await deleteUser(auth.currentUser);
              // Firebase authentication จะทำการ trigger onAuthStateChanged ซึ่งจะนำผู้ใช้กลับไปยังหน้า Login โดยอัตโนมัติ
              console.log('Account deleted successfully');
            } catch (error) {
              console.error('Delete account error:', error);
              let errorMessage = 'ไม่สามารถลบบัญชีได้';
              
              if (error.code === 'auth/requires-recent-login') {
                errorMessage = 'กรุณาเข้าสู่ระบบใหม่ก่อนลบบัญชี';
                
                // ถ้าต้องการเข้าสู่ระบบใหม่ ให้ออกจากระบบแล้วนำผู้ใช้ไปยังหน้า Login
                try {
                  await signOut(auth);
                } catch (signOutError) {
                  console.error('Sign out error after delete attempt:', signOutError);
                }
              }
              
              Alert.alert('ข้อผิดพลาด', errorMessage);
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>กำลังโหลดข้อมูลผู้ใช้...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person-circle" size={100} color="#007AFF" />
          </View>
          <Text style={styles.userEmail}>{user.email}</Text>
          <Text style={styles.memberSince}>
            สมาชิกตั้งแต่: {new Date(user.metadata.creationTime).toLocaleDateString('th-TH')}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ข้อมูลโปรไฟล์</Text>
          
          <View style={styles.profileItem}>
            <Text style={styles.label}>ชื่อผู้ใช้:</Text>
            {editing ? (
              <View style={styles.editContainer}>
                <TextInput
                  style={styles.editInput}
                  value={newDisplayName}
                  onChangeText={setNewDisplayName}
                  placeholder="กรอกชื่อผู้ใช้"
                />
                <View style={styles.editButtons}>
                  <TouchableOpacity
                    style={[styles.editButton, styles.cancelButton]}
                    onPress={() => {
                      setEditing(false);
                      setNewDisplayName(user.displayName || '');
                    }}
                  >
                    <Text style={styles.cancelButtonText}>ยกเลิก</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.editButton, styles.saveButton]}
                    onPress={handleUpdateProfile}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={styles.saveButtonText}>บันทึก</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.displayContainer}>
                <Text style={styles.value}>{user.displayName || 'ไม่ได้ระบุ'}</Text>
                <TouchableOpacity
                  style={styles.editIconButton}
                  onPress={() => setEditing(true)}
                >
                  <Ionicons name="pencil" size={16} color="#007AFF" />
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View style={styles.profileItem}>
            <Text style={styles.label}>อีเมล:</Text>
            <Text style={styles.value}>{user.email}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>เปลี่ยนรหัสผ่าน</Text>
          
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="รหัสผ่านใหม่"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="ยืนยันรหัสผ่านใหม่"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={[styles.actionButton, styles.changePasswordButton]}
            onPress={handleChangePassword}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="key-outline" size={20} color="#fff" style={styles.buttonIcon} />
                <Text style={styles.actionButtonText}>เปลี่ยนรหัสผ่าน</Text>
              </>
            )}
          </TouchableOpacity>
        </View>        <View style={styles.section}>
          <Text style={styles.sectionTitle}>การกระทำ</Text>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.signOutButton]}
            onPress={handleSignOut}
            activeOpacity={0.7}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <View style={styles.buttonContent}>
                <Ionicons name="log-out-outline" size={24} color="#fff" style={styles.buttonIcon} />
                <Text style={styles.logoutButtonText}>ออกจากระบบ</Text>
              </View>
            )}
          </TouchableOpacity>
          
          {/* เพิ่มปุ่มออกจากระบบสำรอง ในกรณีที่ปุ่มเดิมมีปัญหา */}
          <LogoutButton />          {/* ใช้ปุ่มออกจากระบบโดยตรงที่สร้างใหม่ */}
          <DirectLogoutButton />
            {/* ปุ่มออกจากระบบฉุกเฉิน ใช้หากปุ่มอื่นไม่ทำงาน */}
          <EmergencyLogoutButton />
          
          {/* ปุ่มล้างข้อมูลทั้งหมดและรีเฟรชแอป */}
          <ClearAndRefreshButton />

          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={handleDeleteAccount}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="trash-outline" size={20} color="#fff" style={styles.buttonIcon} />
                <Text style={styles.actionButtonText}>ลบบัญชี</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    paddingVertical: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  userEmail: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  memberSince: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  profileItem: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  value: {
    fontSize: 16,
    color: '#333',
  },
  displayContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  editIconButton: {
    padding: 4,
  },
  editContainer: {
    marginTop: 8,
  },
  editInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  editButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginLeft: 8,
  },
  cancelButton: {
    backgroundColor: '#6c757d',
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 44,
    fontSize: 16,
  },
  actionButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  buttonIcon: {
    marginRight: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  changePasswordButton: {
    backgroundColor: '#28a745',
  },  signOutButton: {
    backgroundColor: '#ff6b35',
    marginVertical: 10,
    paddingVertical: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 0.5,
    borderColor: '#ff5722',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  deleteButton: {
    backgroundColor: '#dc3545',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ProfileScreen;
