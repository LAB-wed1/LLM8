import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Image } from 'react-native';
import { logoutUser } from '../api/firebase';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProfileScreen = ({ navigation }) => {
  const { user, userData } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    address: '123 Main St, City, Country',
    phone: '+1 234 567 890',
    profilePicture: null,
  });

  // Load user data and profile picture
  useEffect(() => {
    if (user) {
      setProfileData({
        ...profileData,
        name: user.displayName || 'User',
        email: user.email || '',
      });
      
      // Load profile picture from AsyncStorage
      loadProfilePicture();
    }
  }, [user]);

  const loadProfilePicture = async () => {
    try {
      if (user) {
        const savedImageUri = await AsyncStorage.getItem(`@profile_picture_${user.uid}`);
        if (savedImageUri) {
          setProfileData(prev => ({
            ...prev,
            profilePicture: savedImageUri
          }));
        }
      }
    } catch (error) {
      console.error('Error loading profile picture:', error);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      const { success, error } = await logoutUser();
      
      if (error) {
        Alert.alert('Logout Error', error);
      }
      
      // No need to navigate manually - AuthContext will handle this
    } catch (error) {
      Alert.alert('Logout Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      // Request permission
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'You need to allow access to your photos to change profile picture');
        return;
      }
      
      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      
      if (result.canceled) {
        return;
      }
      
      // Set loading state
      setUploadingImage(true);
      
      const imageUri = result.assets[0].uri;
      
      // Save image URI to AsyncStorage
      if (user) {
        await AsyncStorage.setItem(`@profile_picture_${user.uid}`, imageUri);
      }
      
      // Update local state
      setProfileData({
        ...profileData,
        profilePicture: imageUri
      });
      
      Alert.alert('Success', 'Profile picture updated successfully');
      setUploadingImage(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile picture');
      console.error(error);
      setUploadingImage(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileHeader}>
        <TouchableOpacity 
          style={styles.profileImageContainer}
          onPress={pickImage}
          disabled={uploadingImage}
        >
          {uploadingImage ? (
            <ActivityIndicator size="large" color="#007BFF" />
          ) : profileData.profilePicture ? (
            <Image 
              source={{ uri: profileData.profilePicture }} 
              style={styles.profileImage} 
            />
          ) : (
            <Ionicons name="person-circle" size={100} color="#007BFF" />
          )}
          <View style={styles.editIconContainer}>
            <Ionicons name="camera" size={20} color="#fff" />
          </View>
        </TouchableOpacity>
        <Text style={styles.userName}>{profileData.name}</Text>
        <Text style={styles.userEmail}>{profileData.email}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Address</Text>
          <Text style={styles.infoValue}>{profileData.address}</Text>
        </View>
        
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Phone</Text>
          <Text style={styles.infoValue}>{profileData.phone}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuItemText}>My Orders</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuItemText}>Shipping Addresses</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuItemText}>Payment Methods</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuItemText}>Notifications</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={styles.logoutButton}
        onPress={handleLogout}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.logoutButtonText}>Logout</Text>
        )}
      </TouchableOpacity>
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
    paddingVertical: 24,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  profileImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    overflow: 'hidden',
    position: 'relative',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#007BFF',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    backgroundColor: 'white',
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  infoItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
  },
  menuItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemText: {
    fontSize: 16,
  },
  logoutButton: {
    backgroundColor: '#ff4757',
    marginHorizontal: 16,
    marginVertical: 24,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProfileScreen;
