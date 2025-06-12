import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { logout, setLanguage } from '../redux/slices/user.slice';
import { useTranslation } from 'react-i18next';

const ProfileView = () => {
  const dispatch    = useDispatch();
  const navigation  = useNavigation();
  const userName    = useSelector((state) => state.user.userInfo?.name);
  const currentLang = useSelector((state) => state.user.language);

  const { t, i18n } = useTranslation();

  // sincronizar i18n con Redux
  useEffect(() => {
    if (currentLang) i18n.changeLanguage(currentLang);
  }, [currentLang]);

  const sections = [
    { title: t('profile.sections.personalInfo'),   icon: 'account-outline',       route: 'PersonalInfo' },
    { title: t('profile.sections.addresses'),      icon: 'map-marker-outline',     route: 'Addresses' },
    { title: t('profile.sections.terms'),          icon: 'file-document-outline',  route: 'Terms' },
    { title: t('profile.sections.support'),        icon: 'help-circle-outline',    route: 'Contact' },
  ];

  const handleLogout = () => {
    dispatch(logout());
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  const handleToggleLanguage = () => {
    const next = currentLang === 'es' ? 'en' : 'es';
    i18n.changeLanguage(next);
    dispatch(setLanguage(next));
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>{t('profile.greeting')}</Text>
            <Text style={styles.userName}>{userName}</Text>
          </View>
        </View>

        {/* Secciones */}
        {sections.map((section, idx) => (
          <TouchableOpacity
            key={idx}
            style={styles.section}
            onPress={() => navigation.navigate(section.route)}
          >
            <Icon name={section.icon} size={24} color="#D32F2F" style={styles.sectionIcon} />
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Icon name="chevron-right" size={24} color="#9CA3AF" />
          </TouchableOpacity>
        ))}

        {/* Cambiar idioma */}
        <TouchableOpacity style={styles.section} onPress={handleToggleLanguage}>
          <Icon name="translate" size={24} color="#D32F2F" style={styles.sectionIcon} />
          <Text style={styles.sectionTitle}>
            {currentLang === 'es' ? t('profile.toggleLanguage') : t('profile.toggleLanguage')}
          </Text>
          <Icon name="chevron-right" size={24} color="#9CA3AF" />
        </TouchableOpacity>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Icon name="logout" size={24} color="#FFFFFF" style={styles.logoutIcon} />
          <Text style={styles.logoutButtonText}>{t('profile.logout')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container:             { flex: 1, backgroundColor: '#FFFFFF' },
  header:                {
                           flexDirection: 'row',
                           alignItems: 'center',
                           padding: 20,
                           backgroundColor: '#D32F2F',
                           borderBottomLeftRadius: 30,
                           borderBottomRightRadius: 30,
                         },
  headerTextContainer:   { flex: 1 },
  headerTitle:           { fontSize: 16, color: '#FFFFFF', marginBottom: 4 },
  userName:              { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF' },
  section:               {
                           flexDirection: 'row',
                           alignItems: 'center',
                           padding: 20,
                           backgroundColor: '#FFFFFF',
                           marginTop: 12,
                           marginHorizontal: 12,
                           borderRadius: 12,
                           shadowColor: '#000000',
                           shadowOffset: { width: 0, height: 2 },
                           shadowOpacity: 0.1,
                           shadowRadius: 4,
                           elevation: 3,
                         },
  sectionIcon:           { marginRight: 16 },
  sectionTitle:          { flex: 1, fontSize: 16, color: '#000000' },
  logoutButton:          {
                           flexDirection: 'row',
                           alignItems: 'center',
                           justifyContent: 'center',
                           margin: 20,
                           padding: 16,
                           backgroundColor: '#D32F2F',
                           borderRadius: 12,
                         },
  logoutIcon:            { marginRight: 8 },
  logoutButtonText:      { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});

export default ProfileView;