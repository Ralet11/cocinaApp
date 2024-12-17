import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';

// Importa tus componentes de pantalla
import Login from './views/Login';
import Signup from './views/SignUp';
import Orders from './views/Orders';
import UserSettings from './views/UserSettings';
import Dashboard from './views/Dashboard';
import ProductDetail from './views/ProductDetail';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const customTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#4C1D95',
    background: '#FFFFFF',
  },
};

function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tab.Screen name="Home" component={Dashboard} />
      <Tab.Screen name="Orders" component={Orders} />
      <Tab.Screen name="Profile" component={UserSettings} />
    </Tab.Navigator>
  );
}

export default function AppNavigation() {
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
      </Stack.Navigator>
    </NavigationContainer>
  );
}
