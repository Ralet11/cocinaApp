import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { NavigationContainer, DefaultTheme, useTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Importa tus componentes de pantalla (definidos en otros archivos)
import Login from './views/Login';
import Signup from './views/SignUp';
import Orders from './views/Orders';
import UserSettings from './views/UserSettings';
import Dashboard from './views/Dashboard';
import ProductDetail from './views/ProductDetail';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const { width } = Dimensions.get('window');

// Tema personalizado
const customTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#4C1D95', // Color principal violeta oscuro
    background: '#FFFFFF',
    text: '#1A1A1A',
    border: 'rgba(0,0,0,0.1)',
  },
};

// Icono personalizado con animación
const TabIcon = ({ name, color, size, isFocused }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: isFocused ? 1.2 : 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isFocused]);

  return (
    <Animated.View style={[styles.iconWrapper, { transform: [{ scale: scaleAnim }] }]}>
      <MaterialCommunityIcons name={name} size={size} color={color} />
    </Animated.View>
  );
};

// Barra de navegación personalizada
const CustomTabBar = ({ state, descriptors, navigation }) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const totalWidth = width - 40;
  const tabWidth = totalWidth / state.routes.length;
  const translateX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(translateX, {
      toValue: state.index * tabWidth,
      useNativeDriver: true,
      friction: 4,
      tension: 40,
    }).start();
  }, [state.index, tabWidth]);

  return (
    <View style={[styles.tabBar, { paddingBottom: insets.bottom + 10 }]}>
      <BlurView intensity={30} tint="light" style={styles.blurContainer}>
        <Animated.View
          style={[
            styles.slider,
            {
              transform: [{ translateX }],
              width: tabWidth,
              backgroundColor: '#4C1D95', // Violeta oscuro
            },
          ]}
        />
        <View style={styles.tabsContainer}>
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const label = options.tabBarLabel ?? route.name;
            const isFocused = state.index === index;
            const iconName = options.tabBarIcon;

            const onPress = () => {
              navigation.navigate(route.name);
            };

            return (
              <TouchableOpacity
                key={route.key}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel={options.tabBarAccessibilityLabel}
                onPress={onPress}
                style={styles.tab}
              >
                <TabIcon
                  name={iconName}
                  color={isFocused ? '#4C1D95' : '#6B7280'} 
                  size={28}
                  isFocused={isFocused}
                />
                <Text
                  style={[
                    styles.label,
                    {
                      color: isFocused ? '#4C1D95' : '#6B7280',
                      opacity: isFocused ? 1 : 0.7,
                    },
                  ]}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </BlurView>
    </View>
  );
};

function HomeTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tab.Screen
        name="Home"
        component={DashboardWithNavigateFix} // Aquí usamos la versión modificada de Dashboard
        options={{
          tabBarIcon: 'home',
          tabBarLabel: 'Home',
        }}
      />
      <Tab.Screen
        name="Orders"
        component={Orders}
        options={{
          tabBarIcon: 'clipboard-list',
          tabBarLabel: 'Orders',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={UserSettings}
        options={{
          tabBarIcon: 'account',
          tabBarLabel: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
}

// Componente Dashboard modificado para navegar con getParent()
function DashboardWithNavigateFix(props) {
  // Extraemos las props y luego en el componente Dashboard real, 
  // modificamos el handleProductClick para usar navigation.getParent().
  return <Dashboard {...props} />;
}

// Ejemplo de modificación dentro de Dashboard.js
// Asegúrate que tu Dashboard.js tenga algo así:

/*
  const handleProductClick = (item) => {
    // En vez de navigation.navigate('ProductDetail', { product: item });
    // usamos getParent():
    const parentNavigation = navigation.getParent();
    parentNavigation.navigate('ProductDetail', { product: item });
  };
*/

export default function Navigation() {
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

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 10,
    left: 20,
    right: 20,
    height: Platform.OS === 'ios' ? 120 : 70,
    borderRadius: 35,
    backgroundColor: '#F3F4F6',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  blurContainer: {
    flex: 1,
    borderRadius: 35,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    flex: 1,
  },
  slider: {
    height: 5,
    position: 'absolute',
    top: 0,
    borderRadius: 2.5,
    left: 5,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
    textAlign: 'center',
  },
});
