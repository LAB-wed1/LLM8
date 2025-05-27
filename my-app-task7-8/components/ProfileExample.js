import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, TextInput, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';
import { 
  saveUserData, 
  getUserData, 
  uploadFile,
  getFileURL
} from '../api/firebase';

const ProfileExample = () => {
  const { user, userData } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    bio: '',
    phoneNumber: '',
    location: '',
    profilePicture: null
  });
  
  // โหลดข้อมูลผู้ใช้เมื่อเริ่มต้น component
  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);
  
  // โหลดข้อมูลเริ่มต้นจาก userData ถ้ามี
  useEffect(() => {
    if (userData) {
      setProfileData({
        name: userData.name || '',
        bio: userData.bio || '',
        phoneNumber: userData.phoneNumber || '',
        location: userData.location || '',
        profilePicture: userData.profilePicture || null
      });
    }
  }, [userData]);
  
  // ฟังก์ชันโหลดข้อมูลผู้ใช้จาก Firestore
  const loadUserData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await getUserData(user.uid);
      
      if (error) {
        Alert.alert('Error', 'ไม่สามารถโหลดข้อมูลผู้ใช้ได้');
        setLoading(false);
        return;
      }
      
      if (data) {
        setProfileData({
          name: data.name || '',
          bio: data.bio || '',
          phoneNumber: data.phoneNumber || '',
          location: data.location || '',
          profilePicture: data.profilePicture || null
        });
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };
  
  // ฟังก์ชันอัปเดตข้อมูลผู้ใช้
  const updateProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await saveUserData(user.uid, {
        name: profileData.name,
        bio: profileData.bio,
        phoneNumber: profileData.phoneNumber,
        location: profileData.location,
        updatedAt: new Date()
      });
      
      if (error) {
        Alert.alert('Error', 'ไม่สามารถบันทึกข้อมูลได้');
        setLoading(false);
        return;
      }
      
      Alert.alert('Success', 'บันทึกข้อมูลสำเร็จ');
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };
  
  // ฟังก์ชันเลือกรูปภาพและอัปโหลด
  const pickImage = async () => {
    if (!user) return;
    
    // ขออนุญาตเข้าถึงแกลเลอรี่
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'ต้องการสิทธิ์ในการเข้าถึงแกลเลอรี่');
      return;
    }
    
    // เปิดแกลเลอรี่ให้ผู้ใช้เลือกรูปภาพ
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    
    if (result.canceled) return;
    
    // ทำการอัปโหลดรูปภาพ
    uploadProfileImage(result.assets[0].uri);
  };
  
  // ฟังก์ชันอัปโหลดรูปภาพไปยัง Firebase Storage
  const uploadProfileImage = async (uri) => {
    if (!user) return;
    
    setUploadingImage(true);
    try {
      // สร้างชื่อไฟล์ที่ไม่ซ้ำกัน
      const filename = `profile_${user.uid}_${new Date().getTime()}.jpg`;
      
      // อัปโหลดไฟล์
      const { success, url, error } = await uploadFile(uri, `users/${user.uid}/profile`, filename);
      
      if (error) {
        Alert.alert('Error', 'ไม่สามารถอัปโหลดรูปภาพได้');
        setUploadingImage(false);
        return;
      }
      
      // อัปเดตข้อมูล URL รูปภาพใน Firestore
      await saveUserData(user.uid, {
        profilePicture: url,
        updatedAt: new Date()
      });
      
      // อัปเดต state
      setProfileData({
        ...profileData,
        profilePicture: url
      });
      
      Alert.alert('Success', 'อัปโหลดรูปภาพสำเร็จ');
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setUploadingImage(false);
    }
  };
  
  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>กรุณาเข้าสู่ระบบก่อนใช้งาน</Text>
      </View>
    );
  }
  
  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007BFF" />
        <Text style={styles.message}>กำลังโหลดข้อมูล...</Text>
      </View>
    );
  }
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileHeader}>
        <TouchableOpacity style={styles.imageContainer} onPress={pickImage} disabled={uploadingImage}>
          {uploadingImage ? (
            <View style={styles.uploadingContainer}>
              <ActivityIndicator size="small" color="#fff" />
              <Text style={styles.uploadingText}>กำลังอัปโหลด...</Text>
            </View>
          ) : (
            <>
              {profileData.profilePicture ? (
                <Image source={{ uri: profileData.profilePicture }} style={styles.profileImage} />
              ) : (
                <View style={styles.placeholderImage}>
                  <Text style={styles.placeholderText}>{profileData.name ? profileData.name[0].toUpperCase() : 'U'}</Text>
                </View>
              )}
              <View style={styles.editIconContainer}>
                <Text style={styles.editIcon}>✎</Text>
              </View>
            </>
          )}
        </TouchableOpacity>
        
        <Text style={styles.email}>{user.email}</Text>
      </View>
      
      <View style={styles.formContainer}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>ชื่อ</Text>
          <TextInput
            style={styles.input}
            value={profileData.name}
            onChangeText={(text) => setProfileData({ ...profileData, name: text })}
            placeholder="กรอกชื่อของคุณ"
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>เบอร์โทรศัพท์</Text>
          <TextInput
            style={styles.input}
            value={profileData.phoneNumber}
            onChangeText={(text) => setProfileData({ ...profileData, phoneNumber: text })}
            placeholder="กรอกเบอร์โทรศัพท์"
            keyboardType="phone-pad"
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>ที่อยู่</Text>
          <TextInput
            style={styles.input}
            value={profileData.location}
            onChangeText={(text) => setProfileData({ ...profileData, location: text })}
            placeholder="กรอกที่อยู่ของคุณ"
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>เกี่ยวกับฉัน</Text>
          <TextInput
            style={[styles.input, styles.bioInput]}
            value={profileData.bio}
            onChangeText={(text) => setProfileData({ ...profileData, bio: text })}
            placeholder="เขียนข้อมูลเกี่ยวกับตัวคุณ"
            multiline
            numberOfLines={4}
          />
        </View>
        
        <TouchableOpacity
          style={styles.saveButton}
          onPress={updateProfile}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>บันทึกข้อมูล</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  profileHeader: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  imageContainer: {
    position: 'relative',
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 15,
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
    backgroundColor: '#007BFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 40,
    color: '#fff',
    fontWeight: 'bold',
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#007BFF',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  editIcon: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  uploadingContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadingText: {
    color: '#fff',
    marginTop: 5,
    fontSize: 12,
  },
  email: {
    fontSize: 16,
    color: '#666',
  },
  formContainer: {
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
  },
  bioInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
  },
});

export default ProfileExample; 