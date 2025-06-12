import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Modal,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useSelector, useDispatch } from "react-redux";
import axios from "react-native-axios";
import { API_URL } from "@env";
import { setUser } from "../redux/slices/user.slice";
import Toast from "react-native-toast-message";
import { useTranslation } from 'react-i18next';

export default function PersonalInfo({ navigation }) {
  const dispatch = useDispatch();
  const user     = useSelector((s) => s.user.userInfo);
  const token    = useSelector((s) => s.user.userInfo.token);
  const { t, i18n } = useTranslation();
  const currentLang = useSelector(s => s.user.language);

  // sincronizar idioma
  useEffect(() => {
    if (currentLang) i18n.changeLanguage(currentLang);
  }, [currentLang]);

  const [form, setForm] = useState({
    name:  user?.name  || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleChange = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    setLoading(true);
    try {
      const { data } = await axios.put(
        `${API_URL}/user/${user.id}`,
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      dispatch(setUser({ user: data.user }));
      setEditing(false);
      Toast.show({ type: "success", text1: t('personalInfo.toasts.updated') });
    } catch (err) {
      Toast.show({
        type: "error",
        text1: err?.response?.data?.error || t('personalInfo.toasts.errorUpdating'),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = () => setShowDeleteModal(true);
  const handleConfirmDelete = () => {
    setShowDeleteModal(false);
    Toast.show({ type: "info", text1: t('personalInfo.toasts.deleted') });
  };
  const handleCancelDelete = () => setShowDeleteModal(false);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('personalInfo.headerTitle')}</Text>
        {!editing && (
          <TouchableOpacity onPress={() => setEditing(true)} style={styles.editIcon}>
            <Icon name="pencil" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer}>
        {['name','email','phone'].map((field) => (
          <View key={field} style={styles.infoCard}>
            <Text style={styles.label}>{t(`personalInfo.labels.${field}`)}</Text>
            {editing ? (
              <TextInput
                style={styles.input}
                value={form[field]}
                onChangeText={(v) => handleChange(field, v)}
                placeholder={t(`personalInfo.placeholders.${field}`)}
                keyboardType={field==='email'?'email-address':'default'}
                autoCapitalize="none"
              />
            ) : (
              <Text style={styles.value}>
                {form[field] || t(`personalInfo.placeholders.${field}`)}
              </Text>
            )}
          </View>
        ))}

        {editing && (
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#FFFFFF" />
              : <Text style={styles.saveButtonText}>{t('personalInfo.save')}</Text>
            }
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
          <Icon name="trash-can-outline" size={18} color="#D32F2F" />
          <Text style={styles.deleteButtonText}>{t('personalInfo.deleteAccount')}</Text>
        </TouchableOpacity>

        <Modal
          visible={showDeleteModal}
          transparent
          animationType="fade"
          onRequestClose={handleCancelDelete}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>{t('personalInfo.modal.title')}</Text>
              <Text style={styles.modalText}>{t('personalInfo.modal.text')}</Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.modalCancel} onPress={handleCancelDelete}>
                  <Text style={styles.modalCancelText}>{t('personalInfo.modal.cancel')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalConfirm} onPress={handleConfirmDelete}>
                  <Text style={styles.modalConfirmText}>{t('personalInfo.modal.confirm')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F6" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#D32F2F",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  backButton: { padding: 8 },
  editIcon: { marginLeft: "auto", padding: 8 },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginLeft: 16,
  },
  contentContainer: { padding: 16, paddingBottom: 40 },
  infoCard: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 3,
  },
  label: { fontSize: 14, color: "#6B7280", marginBottom: 4 },
  value: { fontSize: 16, fontWeight: "500", color: "#111827" },
  input: {
    fontSize: 16,
    fontWeight: "500",
    color: "#111827",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingVertical: 4,
  },
  saveButton: {
    backgroundColor: "#D32F2F",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  saveButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },

  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 24,
    alignSelf: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#D32F2F",
    borderRadius: 8,
  },
  deleteButtonText: {
    fontSize: 14,
    color: "#D32F2F",
    fontWeight: "600",
    marginLeft: 6,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "80%",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
  },
  modalText: {
    fontSize: 14,
    color: "#4B5563",
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  modalCancel: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  modalCancelText: {
    fontSize: 14,
    color: "#6B7280",
  },
  modalConfirm: {
    backgroundColor: "#D32F2F",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  modalConfirmText: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "600",
  },
});