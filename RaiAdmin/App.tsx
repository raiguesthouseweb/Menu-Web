import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import Constants from 'expo-constants';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import screens
import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import OrderDetailScreen from './src/screens/OrderDetailScreen';
import SoundSettingsScreen from './src/screens/SoundSettingsScreen';

// Import context
import { AuthProvider } from './src/context/AuthContext';

// Define navigation
const Stack = createStackNavigator();

// Background task name
const BACKGROUND_FETCH_TASK = 'background-order-fetch';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Define the background task
TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
  try {
    // Get server URL and auth token from storage
    const serverUrl = await AsyncStorage.getItem('serverUrl');
    const authToken = await AsyncStorage.getItem('authToken');
    
    if (!serverUrl || !authToken) {
      console.log('Missing server URL or auth token');
      return BackgroundFetch.BackgroundFetchResult.Failed;
    }
    
    // Fetch latest orders
    const response = await fetch(`${serverUrl}/api/orders`, {
      headers: {
        'X-User-ID': authToken
      }
    });
    
    const orders = await response.json();
    
    // Get last checked timestamp
    const lastCheckedStr = await AsyncStorage.getItem('lastChecked');
    const lastChecked = lastCheckedStr ? new Date(lastCheckedStr) : new Date(0);
    
    // Look for new orders since last check
    const newOrders = orders.filter(order => {
      const orderDate = new Date(order.timestamp);
      return orderDate > lastChecked;
    });
    
    // If there are new orders, show notifications
    if (newOrders.length > 0) {
      // Play custom notification sound
      const soundUri = await AsyncStorage.getItem('notificationSound') || undefined;
      
      // Show notification for each new order
      for (const order of newOrders) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'New Order Received!',
            body: `Order #${order.id} from ${order.name || 'Room ' + order.roomNumber}`,
            data: { order },
            sound: soundUri,
          },
          trigger: null, // Send immediately
        });
      }
      
      // Update last checked timestamp
      await AsyncStorage.setItem('lastChecked', new Date().toISOString());
    }
    
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    console.error('Background task error:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

// Register background fetch task
async function registerBackgroundFetchAsync() {
  return BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
    minimumInterval: 60, // 1 minute - minimum possible value
    stopOnTerminate: false,
    startOnBoot: true,
  });
}

export default function App() {
  const [isRegistered, setIsRegistered] = useState(false);
  const [notification, setNotification] = useState(false);

  useEffect(() => {
    // Register notification handler
    const subscription = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });
    
    // Register background task
    checkStatusAsync();
    
    return () => {
      subscription.remove();
    };
  }, []);

  const checkStatusAsync = async () => {
    const status = await BackgroundFetch.getStatusAsync();
    const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_FETCH_TASK);
    setIsRegistered(isRegistered);
    
    if (!isRegistered) {
      await registerBackgroundFetchAsync();
    }
  };

  return (
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen 
            name="Login" 
            component={LoginScreen} 
            options={{ headerShown: false }} 
          />
          <Stack.Screen 
            name="Dashboard" 
            component={DashboardScreen} 
            options={{ 
              title: 'Rai Admin Dashboard',
              headerLeft: null, // Prevent going back to login
            }} 
          />
          <Stack.Screen 
            name="OrderDetail" 
            component={OrderDetailScreen} 
            options={{ title: 'Order Details' }} 
          />
          <Stack.Screen 
            name="Settings" 
            component={SettingsScreen} 
            options={{ title: 'Settings' }} 
          />
          <Stack.Screen 
            name="SoundSettings" 
            component={SoundSettingsScreen} 
            options={{ title: 'Notification Sounds' }} 
          />
        </Stack.Navigator>
        <StatusBar style="auto" />
      </NavigationContainer>
    </AuthProvider>
  );
}