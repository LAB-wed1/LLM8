import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from '@expo/vector-icons/Ionicons';
import { ActivityIndicator, View, Text } from 'react-native';
import { useAuth } from '../context/AuthContext';

// Import screens
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ForgotScreen from '../screens/ForgotScreen';
import HomeScreen from '../screens/HomeScreen';
import CartScreen from '../screens/CartScreen';
import ProfileScreen from '../screens/ProfileScreen';
import CartDebugScreen from '../screens/CartDebugScreen';

// Create navigators
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const AuthStack = createNativeStackNavigator();

// Tab Navigator Component
const MainTabNavigator = () => {
  const { isAuthenticated } = useAuth();

  // ตรวจสอบการเข้าสู่ระบบ
  if (!isAuthenticated) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>กรุณาเข้าสู่ระบบ</Text>
      </View>
    );
  }

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
        tabBarActiveTintColor: '#007BFF',
        tabBarInactiveTintColor: 'gray',
        headerShown: true,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ title: 'หน้าหลัก' }}
      />
      <Tab.Screen 
        name="Cart" 
        component={CartScreen} 
        options={{ title: 'ตะกร้าสินค้า' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ title: 'โปรไฟล์' }}
      />
    </Tab.Navigator>
  );
};

// Auth Navigator
const AuthNavigator = () => {
  return (
    <AuthStack.Navigator initialRouteName="Login">
      <AuthStack.Screen 
        name="Login" 
        component={LoginScreen} 
        options={{ headerShown: false }}
      />
      <AuthStack.Screen 
        name="Register" 
        component={RegisterScreen} 
        options={{ headerShown: false }}
      />
      <AuthStack.Screen 
        name="Forgot" 
        component={ForgotScreen} 
        options={{ headerShown: false }}
      />
    </AuthStack.Navigator>
  );
};

// Main Stack Navigator
const AppNavigator = () => {
  const { user, loading } = useAuth();

  // Show loading indicator while checking auth state
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <>
            <Stack.Screen name="Main" component={MainTabNavigator} />
            <Stack.Screen 
              name="CartDebug" 
              component={CartDebugScreen} 
              options={{ 
                headerShown: true,
                title: "แก้ไขปัญหาตะกร้าสินค้า"
              }} 
            />
          </>
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
