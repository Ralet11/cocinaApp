import React from 'react';
import * as Linking from 'expo-linking';
import Icon from 'react-native-vector-icons/Ionicons';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  NavigationContainer,
  DefaultTheme,
  createNavigationContainerRef,
} from '@react-navigation/native';

import Login              from './views/Login';
import Signup             from './views/SignUp';
import Orders             from './views/Orders';
import Dashboard          from './views/Dashboard';
import ProductDetail      from './views/ProductDetail';
import CartScreen         from './views/CartScreen';
import Confirmation       from './views/Confirmation';
import PaymentSuccess     from './views/PaymentSucces';
import PaymentFailure     from './views/PaymentFailure';
import PaymentPending     from './views/PaymentPending';
import ProfileView        from './views/Profile';
import AddressesView      from './views/Addresses';
import SelectNewAddress   from './views/SelectNewAddress';
import FirstAddressScreen from './views/FirstAddressScreen';
import OrderTrackingScreen from './views/OrderTracking';
import Coupons            from './views/Coupons';
import PersonalInfo       from './views/PersonalInfo';
import Terms              from './views/TermsAndConditions';
import DeepLinkHandler    from './components/DeepLinkHandler';
import useSocket          from './config/socket';
import Support            from './views/Contact';

export const navigationRef = createNavigationContainerRef();

const linking = {
  prefixes: [Linking.createURL('/'), 'premierburguer://'],
  config: {
    screens: {
      PaymentSuccess: 'payment-success',
      PaymentFailure: 'payment-failure',
      PaymentPending: 'payment-pending',
    },
  },
};

const customTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary:      '#D32F2F',
    background:   '#FFFFFF',
    card:         '#FFFFFF',
    text:         '#000000',
    border:       '#000000',
    notification: '#D32F2F',
  },
};

const Stack = createNativeStackNavigator();
const Tab   = createBottomTabNavigator();

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
        tabBarActiveTintColor:   customTheme.colors.primary,
        tabBarInactiveTintColor: customTheme.colors.text,
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
        tabBarIcon: ({ focused, color, size }) => {
          const icons = {
            Home:    focused ? 'home'   : 'home-outline',
            Orders:  focused ? 'list'   : 'list-outline',
            Profile: focused ? 'person' : 'person-outline',
          };
          return <Icon name={icons[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home"    component={Dashboard} />
      <Tab.Screen name="Orders"  component={Orders} />
      <Tab.Screen name="Profile" component={ProfileView} />
    </Tab.Navigator>
  );
}

export default function AppNavigation() {
  useSocket();

  return (
    <NavigationContainer
      ref={navigationRef}
      theme={customTheme}
      linking={linking}
    >
      <DeepLinkHandler />
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'fade_from_bottom',
          contentStyle: { backgroundColor: customTheme.colors.background },
        }}
        initialRouteName="Login"
      >
        <Stack.Screen name="Login"             component={Login} />
        <Stack.Screen name="Signup"            component={Signup} />
        <Stack.Screen name="HomeTabs"          component={HomeTabs} />
        <Stack.Screen name="ProductDetail"     component={ProductDetail} />
        <Stack.Screen name="CartScreen"        component={CartScreen} />
        <Stack.Screen name="ConfirmationScreen" component={Confirmation} />
        <Stack.Screen name="PaymentSuccess"    component={PaymentSuccess} />
        <Stack.Screen name="PaymentFailure"    component={PaymentFailure} />
        <Stack.Screen name="PaymentPending"    component={PaymentPending} />
        <Stack.Screen name="Profile"           component={ProfileView} />
        <Stack.Screen name="Addresses"         component={AddressesView} />
        <Stack.Screen name="SelectNewAddress"  component={SelectNewAddress} />
        <Stack.Screen name="FirstAddressScreen" component={FirstAddressScreen} />
        <Stack.Screen name="OrderTracking"     component={OrderTrackingScreen} />
        <Stack.Screen name="PersonalInfo"      component={PersonalInfo} />
        <Stack.Screen name="Coupons"           component={Coupons} />
        <Stack.Screen name="Terms"             component={Terms} />
        <Stack.Screen name="Contact"           component={Support} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
