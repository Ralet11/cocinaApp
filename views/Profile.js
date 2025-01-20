import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { logout } from '../redux/slices/user.slice';

const ProfileView = () => {
  const userName = useSelector((state) => state?.user?.userInfo?.name);
  const navigation = useNavigation();
  const dispatch = useDispatch()

  const sections = [
    { title: 'Personal Information', icon: 'account-outline', route: 'PersonalInfo' },
    { title: 'Addresses', icon: 'map-marker-outline', route: 'Addresses' },
    { title: 'Coupons', icon: 'ticket-percent-outline', route: 'Coupons' },
    { title: 'Terms and Conditions', icon: 'file-document-outline', route: 'Terms' },
    { title: 'Help and Support', icon: 'help-circle-outline', route: 'HelpSupport' },
  ];

  const handleLogout = () => {
    dispatch(logout());
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Welcome back,</Text>
            <Text style={styles.userName}>{userName}</Text>
          </View>
        </View>

        {sections.map((section, index) => (
          <TouchableOpacity 
            key={index} 
            style={styles.section} 
            onPress={() => navigation.navigate(section.route)}
          >
            <Icon name={section.icon} size={24} color="#6D28D9" style={styles.sectionIcon} />
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Icon name="chevron-right" size={24} color="#9CA3AF" />
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Icon name="logout" size={24} color="#FFFFFF" style={styles.logoutIcon} />
          <Text style={styles.logoutButtonText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#6D28D9',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    color: '#E5E7EB',
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  section: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
    marginTop: 12,
    marginHorizontal: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionIcon: {
    marginRight: 16,
  },
  sectionTitle: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 20,
    padding: 16,
    backgroundColor: '#6D28D9',
    borderRadius: 12,
  },
  logoutIcon: {
    marginRight: 8,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProfileView;
