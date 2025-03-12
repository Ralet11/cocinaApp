import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

// Importa tus componentes de pantalla
import Login from './views/Login';
import Signup from './views/SignUp';
import Orders from './views/Orders';
import UserSettings from './views/UserSettings';
import Dashboard from './views/Dashboard';
import ProductDetail from './views/ProductDetail';
import CartScreen from './views/CartScreen';
import OrderSummaryScreen from './views/Confirmation';
import ProfileView from './views/Profile';
import AddressesView from './views/Addresses';
import SelectNewAddress from './views/SelectNewAddress';
import FirstAddressScreen from './views/FirstAddressScreen';
import OrderTrackingScreen from './views/OrderTracking';
import Coupons from './views/Coupons';
import Terms from './views/TermsAndConditions';
import PersonalInfo from './views/PersonalInfo';
import useSocket from './config/socket';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const customTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#D32F2F',    // Rojo
    background: '#FFFFFF', // Blanco
    card: '#FFFFFF',       // Tarjetas y barras con fondo blanco
    text: '#000000',       // Texto en negro
    border: '#000000',     // Bordes en negro
    notification: '#D32F2F', // Rojo
  },
};

function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          backgroundColor: customTheme.colors.card,
          borderTopWidth: 0,
          elevation: 0,
          height: 60,
          paddingBottom: 10,
        },
        tabBarActiveTintColor: customTheme.colors.primary,
        tabBarInactiveTintColor: customTheme.colors.text,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Orders') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={Dashboard} />
      <Tab.Screen name="Orders" component={Orders} />
      <Tab.Screen name="Profile" component={ProfileView} />
    </Tab.Navigator>
  );
}

export default function AppNavigation() {
  useSocket();

  return (
    <NavigationContainer theme={customTheme}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'fade_from_bottom',
          contentStyle: { backgroundColor: customTheme.colors.background },
        }}
        initialRouteName="Login"
      >
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Signup" component={Signup} />
        <Stack.Screen name="HomeTabs" component={HomeTabs} />
        <Stack.Screen name="ProductDetail" component={ProductDetail} />
        <Stack.Screen name="CartScreen" component={CartScreen} />
        <Stack.Screen name="ConfirmationScreen" component={OrderSummaryScreen} />
        <Stack.Screen name="Profile" component={ProfileView} />
        <Stack.Screen name="Addresses" component={AddressesView} />
        <Stack.Screen name="SelectNewAddress" component={SelectNewAddress} />
        <Stack.Screen name="FirstAddressScreen" component={FirstAddressScreen} />
        <Stack.Screen name="OrderTracking" component={OrderTrackingScreen} />
        <Stack.Screen name="PersonalInfo" component={PersonalInfo} />
        <Stack.Screen name="Coupons" component={Coupons} />
        <Stack.Screen name="Terms" component={Terms} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
