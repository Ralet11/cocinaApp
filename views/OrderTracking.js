// views/OrderTrackingScreen.jsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from "react-native";
import { useSelector } from "react-redux";
import { useRoute, useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import axios from "react-native-axios";
import { API_URL } from "@env";
import { OrderStatusTracker } from "../components/OrderTracker";
import { useTranslation } from "react-i18next";

export default function OrderTrackingScreen() {
  const { t, i18n } = useTranslation();
  const currentLang = useSelector((s) => s.user.language);
  const { params } = useRoute();
  const navigation = useNavigation();
  const { orderId } = params;

  useEffect(() => {
    if (currentLang) i18n.changeLanguage(currentLang);
  }, [currentLang]);

  const { activeOrders, historicOrders } = useSelector((s) => s.order);
  const currentOrder =
    [...activeOrders, ...historicOrders].find((o) => o.id === orderId) || null;

  const [items, setItems] = useState(currentOrder?.items || []);
  const [loading, setLoad] = useState(false);

  useEffect(() => {
    const fetchItems = async () => {
      if (items.length || !orderId) return;
      setLoad(true);
      try {
        const { data } = await axios.get(
          `${API_URL}/order-products/getByOrder/${orderId}`
        );
        setItems(
          data.map((op) => ({
            id: op.id,
            image: op.product?.img,
            name: op.product?.name,
            quantity: op.quantity,
            totalPrice: parseFloat(op.price),
          }))
        );
      } catch (err) {
        console.error("order-products error:", err);
      } finally {
        setLoad(false);
      }
    };
    fetchItems();
  }, [orderId]);

  if (!currentOrder) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorTxt}>{t("orderTracking.errorNotFound")}</Text>
      </SafeAreaView>
    );
  }
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#D32F2F" style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  const renderItems = () =>
    items.length ? (
      items.map((it) => (
        <View key={it.id} style={styles.itemBox}>
          <Image
            source={{ uri: it.image || "https://via.placeholder.com/50" }}
            style={styles.itemImg}
          />
          <View style={styles.itemInfo}>
            <Text style={styles.itemName}>
              {it.quantity}× {it.name}
            </Text>
            <Text style={styles.itemPrice}>
              ${it.totalPrice.toFixed(2)}
            </Text>
          </View>
        </View>
      ))
    ) : (
      <Text style={styles.emptyTxt}>{t("orderTracking.emptyItems")}</Text>
    );

  return (
    <SafeAreaView style={styles.container}>
      {/* Encabezado */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate("HomeTabs")}>
          <Icon name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {t("orderTracking.headerTitle")}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* Tracker de estado */}
        <View style={styles.card}>
          <OrderStatusTracker
            currentStatus={currentOrder.status || "pendiente"}
          />
        </View>

        {/* Detalles de la orden */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            {t("orderTracking.detailsTitle")}
          </Text>
          {[
            [
              "orderTracking.label.orderCode",
              currentOrder.code,
            ],
            [
              "orderTracking.label.subtotal",
              `$${parseFloat(currentOrder.price).toFixed(2)}`,
            ],
            [
              "orderTracking.label.delivery",
              `$${parseFloat(currentOrder.deliveryFee).toFixed(2)}`,
            ],
            [
              "orderTracking.label.total",
              `$${parseFloat(currentOrder.finalPrice).toFixed(2)}`,
              true,
            ],
          ].map(([key, val, bold], idx, arr) => (
            <View
              key={key}
              style={[styles.row, idx === arr.length - 1 && styles.rowLast]}
            >
              <Text style={[styles.label, bold && styles.bold]}>
                {t(key)}:
              </Text>
              <Text style={[styles.value, bold && styles.bold]}>{val}</Text>
            </View>
          ))}
        </View>

        {/* Lista de ítems */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            {t("orderTracking.itemsTitle")}
          </Text>
          {renderItems()}
        </View>
      </ScrollView>

      {/* Pie de página */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.btn}
          onPress={() => navigation.navigate("HomeTabs")}
        >
          <Text style={styles.btnTxt}>{t("orderTracking.button.backHome")}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },
  header: {
    backgroundColor: "#D32F2F",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: { fontSize: 18, fontWeight: "600", color: "#FFF" },
  scroll: { paddingHorizontal: 16, paddingBottom: 80 },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 10,
    padding: 14,
    marginTop: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: { fontSize: 16, fontWeight: "600", marginBottom: 6 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  rowLast: { borderBottomWidth: 0 },
  label: { fontSize: 14, color: "#6B7280" },
  value: { fontSize: 14, color: "#111827", fontWeight: "500" },
  bold: { fontWeight: "700" },
  itemBox: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  itemImg: { width: 46, height: 46, borderRadius: 23, marginRight: 10 },
  itemInfo: { flex: 1 },
  itemName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1F2937",
    marginBottom: 3,
  },
  itemPrice: { fontSize: 13, color: "#6B7280" },
  emptyTxt: { fontSize: 14, color: "#6B7280", paddingVertical: 8 },
  errorTxt: {
    marginTop: 40,
    textAlign: "center",
    color: "#D32F2F",
    fontSize: 16,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "#FFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    padding: 12,
  },
  btn: {
    backgroundColor: "#D32F2F",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  btnTxt: { color: "#FFF", fontSize: 15, fontWeight: "600" },
});
