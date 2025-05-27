import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { onAuthStateChanged, getAuth } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import { Alert } from 'react-native';

// Import screens
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import HomeScreen from '../screens/HomeScreen';
import CartScreen from '../screens/CartScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Tab Navigator สำหรับหน้าหลักของแอป
const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Cart') {
            iconName = focused ? 'cart' : 'cart-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ tabBarLabel: 'หน้าหลัก' }}
      />
      <Tab.Screen 
        name="Cart" 
        component={CartScreen}
        options={{ tabBarLabel: 'ตะกร้า' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ tabBarLabel: 'โปรไฟล์' }}
      />
    </Tab.Navigator>
  );
};

// Stack Navigator สำหรับการจัดการการเข้าสู่ระบบ
const AuthStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="Forgot" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
};

// Main Navigator ที่จัดการการนำทางหลัก
const AppNavigator = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log("Setting up auth state change listener");
    
    // สร้าง auth instance ใหม่เพื่อให้แน่ใจว่าใช้อันล่าสุด
    const currentAuth = getAuth();
    console.log("Initial auth state:", currentAuth.currentUser ? 
      `User logged in: ${currentAuth.currentUser.email}` : 
      "No user logged in");
    
    const unsubscribe = onAuthStateChanged(currentAuth, (user) => {
      console.log("Auth state changed:", user ? `User logged in: ${user.email}` : "User logged out");
      
      // เมื่อสถานะเปลี่ยนเป็นออกจากระบบ
      if (!user && !isLoading) {
        console.log("User logged out - navigating to login screen");
      }
      
      setUser(user);
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);
  if (isLoading) {
    return null; // หรือ Loading screen
  }

  console.log("AppNavigator render - User status:", user ? "Logged in" : "Not logged in");

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          // ผู้ใช้เข้าสู่ระบบแล้ว - แสดง Main Tab Navigator
          <Stack.Screen name="Main" component={MainTabNavigator} />
        ) : (
          // ผู้ใช้ยังไม่ได้เข้าสู่ระบบ - แสดง Auth Stack Navigator
          <Stack.Screen name="Auth" component={AuthStackNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
