// Multi-screen Navigation App
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, Button, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Create navigation objects
const Tab = createBottomTabNavigator();
const HomeStack = createStackNavigator();
const ProfileStack = createStackNavigator();

// Mock data for HomeScreen
const ITEMS = [
  { id: '1', title: 'Item 1', description: 'This is the first item' },
  { id: '2', title: 'Item 2', description: 'This is the second item' },
  { id: '3', title: 'Item 3', description: 'This is the third item' },
  { id: '4', title: 'Item 4', description: 'This is the fourth item' },
  { id: '5', title: 'Item 5', description: 'This is the fifth item' },
];

// Home Screen Component
function HomeScreen({ navigation }) {
  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.item}
      onPress={() => navigation.navigate('Details', { 
        id: item.id,
        title: item.title,
        description: item.description 
      })}
    >
      <Text style={styles.itemTitle}>{item.title}</Text>
      <Text>{item.description}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Select an item:</Text>
      <FlatList
        data={ITEMS}
        renderItem={renderItem}
        keyExtractor={item => item.id}
      />
    </View>
  );
}

// Details Screen Component
function DetailsScreen({ route, navigation }) {
  const { id, title, description } = route.params;

  return (
    <View style={styles.centeredContainer}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardDescription}>{description}</Text>
        <Text style={styles.cardId}>ID: {id}</Text>
      </View>
      
      <Button
        title="Go Back"
        onPress={() => navigation.goBack()}
      />
    </View>
  );
}

// Profile Screen Component
function ProfileScreen() {
  return (
    <View style={styles.centeredContainer}>
      <View style={styles.profileContainer}>
        <Ionicons name="person-circle" size={100} color="#007BFF" />
        <Text style={styles.profileName}>John Doe</Text>
        <Text style={styles.profileEmail}>john.doe@example.com</Text>
        <Text style={styles.profileBio}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
          Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </Text>
      </View>
    </View>
  );
}

// Settings Screen Component
function SettingsScreen() {
  const settings = [
    { id: '1', name: 'Notifications', enabled: true },
    { id: '2', name: 'Dark Mode', enabled: false },
    { id: '3', name: 'Auto-Update', enabled: true },
    { id: '4', name: 'Location Services', enabled: false },
  ];

  const renderSetting = ({ item }) => (
    <View style={styles.settingItem}>
      <Text style={styles.settingName}>{item.name}</Text>
      <Text style={[
        styles.settingStatus,
        { color: item.enabled ? '#4CAF50' : '#F44336' }
      ]}>
        {item.enabled ? 'ON' : 'OFF'}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Settings</Text>
      <FlatList
        data={settings}
        renderItem={renderSetting}
        keyExtractor={item => item.id}
      />
    </View>
  );
}

// Home Stack Navigator
function HomeStackNavigator() {
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen 
        name="HomeScreen" 
        component={HomeScreen} 
        options={{ 
          title: 'Home',
          headerStyle: {
            backgroundColor: '#007BFF',
          },
          headerTintColor: '#fff',
        }}
      />
      <HomeStack.Screen 
        name="Details" 
        component={DetailsScreen}
        options={({ route }) => ({ 
          title: route.params.title,
          headerStyle: {
            backgroundColor: '#007BFF',
          },
          headerTintColor: '#fff',
        })}
      />
    </HomeStack.Navigator>
  );
}

// Main App Component
export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            
            if (route.name === 'Home') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Profile') {
              iconName = focused ? 'person' : 'person-outline';
            } else if (route.name === 'Settings') {
              iconName = focused ? 'settings' : 'settings-outline';
            }
            
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#007BFF',
          tabBarInactiveTintColor: 'gray',
        })}
      >
        <Tab.Screen 
          name="Home" 
          component={HomeStackNavigator} 
          options={{ headerShown: false }}
        />
        <Tab.Screen name="Profile" component={ProfileScreen} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  item: {
    backgroundColor: '#f9f9f9',
    padding: 20,
    marginVertical: 8,
    borderRadius: 5,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  cardDescription: {
    fontSize: 16,
    marginBottom: 15,
  },
  cardId: {
    color: '#666',
  },
  profileContainer: {
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
  },
  profileEmail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
  },
  profileBio: {
    textAlign: 'center',
    color: '#444',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'white',
    marginVertical: 5,
    borderRadius: 5,
  },
  settingName: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingStatus: {
    fontWeight: 'bold',
  },
}); 