// views/Pedidos.jsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  SafeAreaView,
  Image,
  Modal,
  FlatList,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";

/* Helpers de color según estado */
const getCardStyleByStatus = (status) => {
  const s = status?.toLowerCase();
  switch (s) {
    case "pendiente":
      return { backgroundColor: "#FFF9DB", borderLeftColor: "#FFC107" };
    case "aceptada":
      return { backgroundColor: "#E6F7EC", borderLeftColor: "#10B981" };
    case "envio":
      return { backgroundColor: "#E1F0FF", borderLeftColor: "#3B82F6" };
    case "finalizada":
      return { backgroundColor: "#F9FAFB", borderLeftColor: "#6B7280" };
    case "rechazada":
    case "cancelada":
      return { backgroundColor: "#FEF2F2", borderLeftColor: "#EF4444" };
    default:
      return { backgroundColor: "#FFFFFF", borderLeftColor: "#E5E7EB" };
  }
};
const getStatusBadgeStyle = (status) => {
  const s = status?.toLowerCase();
  switch (s) {
    case "pendiente":
      return { backgroundColor: "#FFF9DB", color: "#B45309" };
    case "aceptada":
      return { backgroundColor: "#E6F7EC", color: "#047857" };
    case "envio":
      return { backgroundColor: "#E1F0FF", color: "#1D4ED8" };
    case "finalizada":
      return { backgroundColor: "#F9FAFB", color: "#4B5563" };
    case "rechazada":
    case "cancelada":
      return { backgroundColor: "#FEF2F2", color: "#B91C1C" };
    default:
      return { backgroundColor: "#F3F4F6", color: "#374151" };
  }
};

/* Helpers varios */
const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : "");
const safeDate = (value) => {
  const d = new Date(value);
  return isNaN(d) ? "—" : d.toISOString().split("T")[0];
};

export default function Pedidos() {
  const navigation = useNavigation();
  const { historicOrders, activeOrders } = useSelector((s) => s.order);
  const { t, i18n } = useTranslation();
  const currentLang = useSelector((s) => s.user.language);

  useEffect(() => {
    if (currentLang) i18n.changeLanguage(currentLang);
  }, [currentLang]);

  /* Estado búsqueda / filtros */
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");

  /* Opciones de filtros */
  const filterOptions = [
    { key: "all", labelKey: "orders.filter.all" },
    { key: "active", labelKey: "orders.filter.active" },
    { key: "finished", labelKey: "orders.filter.finished" },
  ];

  /* Estado modal */
  const [selected, setSelected] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  /* Mezcla listas sin duplicar */
  const allOrders = [
    ...historicOrders,
    ...activeOrders.filter((a) => !historicOrders.some((h) => h.id === a.id)),
  ];

  /* Aplicar filtros y búsqueda */
  const filtered = allOrders
    .filter((o) => {
      const st = o.status?.toLowerCase();
      if (filter === "active")
        return !["finalizada", "rechazada", "cancelada"].includes(st);
      if (filter === "finished")
        return ["finalizada", "rechazada", "cancelada"].includes(st);
      return true;
    })
    .filter((o) => {
      if (!query.trim()) return true;
      const q = query.toLowerCase();
      return (
        o.code?.toLowerCase().includes(q) ||
        o.deliveryAddress?.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  /* Pulsar tarjeta */
  const handlePress = (order) => {
    const st = order.status?.toLowerCase();
    if (["finalizada", "rechazada", "cancelada"].includes(st)) {
      setSelected(order);
      setModalVisible(true);
    } else {
      navigation.navigate("OrderTracking", { orderId: order.id });
    }
  };

  /* Renderiza una tarjeta de orden */
  const renderOrderCard = (order) => (
    <TouchableOpacity
      key={order.id}
      style={[styles.card, getCardStyleByStatus(order.status)]}
      onPress={() => handlePress(order)}
      activeOpacity={0.8}
    >
      <View style={styles.imgBox}>
        <Image
          source={{ uri: "/placeholder.svg?height=80&width=80" }}
          style={styles.img}
        />
      </View>
      <View style={styles.info}>
        <View style={styles.rowBetween}>
          <Text style={styles.title}>{order.code || t("orders.noCode")}</Text>
          <Text style={styles.date}>{safeDate(order.createdAt)}</Text>
        </View>
        <Text style={styles.address} numberOfLines={1}>
          <Icon name="map-marker" size={14} color="#6B7280" />{" "}
          {order.deliveryAddress}
        </Text>
        <View style={styles.rowBetween}>
          <View
            style={[
              styles.badge,
              {
                backgroundColor: getStatusBadgeStyle(order.status).backgroundColor,
              },
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                { color: getStatusBadgeStyle(order.status).color },
              ]}
            >
              {cap(order.status)}
            </Text>
          </View>
          <Text style={styles.total}>${order.finalPrice}</Text>
        </View>
      </View>
      <Icon name="chevron-right" size={20} color="#9CA3AF" style={styles.chevron} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* ENCABEZADO */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t("orders.headerTitle")}</Text>
        <TouchableOpacity style={styles.filterIcon}>
          <Icon name="tune-vertical" size={22} color="#E53935" />
        </TouchableOpacity>
      </View>

      {/* BÚSQUEDA */}
      <View style={styles.searchWrap}>
        <View style={styles.searchBox}>
          <Icon name="magnify" size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder={t("orders.searchPlaceholder")}
            placeholderTextColor="#9CA3AF"
            value={query}
            onChangeText={setQuery}
          />
          {!!query && (
            <TouchableOpacity onPress={() => setQuery("")}>
              <Icon name="close-circle" size={16} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* FILTROS */}
      <View style={styles.filters}>
        {filterOptions.map((opt) => (
          <TouchableOpacity
            key={opt.key}
            style={[
              styles.filterBtn,
              filter === opt.key && styles.filterBtnActive,
            ]}
            onPress={() => setFilter(opt.key)}
          >
            <Text
              style={[
                styles.filterText,
                filter === opt.key && styles.filterTextActive,
              ]}
            >
              {t(opt.labelKey)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* LISTA */}
      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {!filtered.length && (
          <View style={styles.empty}>
            <Icon name="package-variant" size={60} color="#E5E7EB" />
            <Text style={styles.emptyText}>{t("orders.empty.title")}</Text>
            <Text style={styles.emptySub}>{t("orders.empty.subtitle")}</Text>
          </View>
        )}
        {filtered.map(renderOrderCard)}
      </ScrollView>

      {/* MODAL Detalle */}
      {selected && (
        <Modal
          visible={modalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalBack}>
            <View style={styles.modalBox}>
              {/* Encabezado modal */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{t("orders.modal.title")}</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Icon name="close" size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>

              {/* Info principal */}
              <View style={styles.modalInfo}>
                {[
                  ["orders.details.orderCode", selected.code || t("orders.noCode")],
                  ["orders.details.address", selected.deliveryAddress],
                  ["orders.details.date", safeDate(selected.createdAt)],
                  ["orders.details.total", `$${selected.finalPrice}`],
                ].map(([key, val]) => (
                  <View key={key} style={styles.modalInfoRow}>
                    <Icon
                      name={
                        key === "orders.details.total"
                          ? "cash"
                          : key === "orders.details.date"
                          ? "calendar"
                          : key === "orders.details.address"
                          ? "map-marker"
                          : "barcode"
                      }
                      size={18}
                      color="#6B7280"
                    />
                    <Text style={styles.modalLabel}>{t(key)}:</Text>
                    <Text style={styles.modalValue}>{val}</Text>
                  </View>
                ))}

                {/* Estado */}
                <View style={styles.modalInfoRow}>
                  <Icon name="information-outline" size={18} color="#6B7280" />
                  <Text style={styles.modalLabel}>{t("orders.details.status")}:</Text>
                  <View
                    style={[
                      styles.badge,
                      {
                        backgroundColor: getStatusBadgeStyle(selected.status).backgroundColor,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.badgeText,
                        { color: getStatusBadgeStyle(selected.status).color },
                      ]}
                    >
                      {cap(selected.status)}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Productos */}
              <Text style={styles.productsHeader}>{t("orders.modal.productsTitle")}</Text>
              <FlatList
                data={selected.order_products}
                keyExtractor={(i) => i.id.toString()}
                renderItem={({ item }) => (
                  <View style={styles.productRow}>
                    <Image
                      source={{ uri: item.product.img }}
                      style={styles.productImg}
                    />
                    <View style={styles.productInfo}>
                      <Text style={styles.productName}>{item.product.name}</Text>
                      <Text style={styles.productDesc} numberOfLines={2}>
                        {item.product.description}
                      </Text>
                      <View style={styles.productPriceRow}>
                        <Text style={styles.productPrice}>${item.product.price}</Text>
                        <Text style={styles.productQty}>x {item.quantity}</Text>
                        <Text style={styles.productTotal}>
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </Text>
                      </View>
                    </View>
                  </View>
                )}
                style={styles.productsList}
              />

              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalCloseText}>{t("orders.modal.close")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  headerTitle: { fontSize: 22, fontWeight: "700", color: "#111827" },
  filterIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F9FAFB",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  searchWrap: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  searchInput: { flex: 1, height: 44, fontSize: 15, color: "#111827", marginLeft: 8 },
  filters: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  filterBtn: {
    flex: 1,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: "#F9FAFB",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  filterBtnActive: { backgroundColor: "#E53935", borderColor: "#E53935" },
  filterText: { fontSize: 14, fontWeight: "600", color: "#4B5563" },
  filterTextActive: { color: "#FFFFFF" },
  list: { flex: 1 },
  listContent: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24 },
  card: {
    flexDirection: "row",
    borderRadius: 12,
    marginBottom: 16,
    padding: 12,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2.5,
    elevation: 2,
    borderLeftWidth: 4,
  },
  imgBox: { marginRight: 12 },
  img: { width: 60, height: 60, borderRadius: 8 },
  info: { flex: 1 },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  title: { fontSize: 16, fontWeight: "700", color: "#111827", flex: 1 },
  date: { fontSize: 12, color: "#6B7280" },
  address: { fontSize: 14, color: "#4B5563", marginBottom: 8 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  badgeText: { fontSize: 12, fontWeight: "600" },
  total: { fontSize: 16, fontWeight: "700", color: "#E53935" },
  chevron: { alignSelf: "center", marginLeft: 8 },
  empty: { alignItems: "center", paddingVertical: 60 },
  emptyText: { fontSize: 18, fontWeight: "600", color: "#6B7280", marginTop: 16 },
  emptySub: { fontSize: 14, color: "#9CA3AF", marginTop: 4 },
  modalBack: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.5)" },
  modalBox: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "82%",
  },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  modalTitle: { fontSize: 20, fontWeight: "700", color: "#111827" },
  modalInfo: { backgroundColor: "#F9FAFB", borderRadius: 12, padding: 16, marginBottom: 20 },
  modalInfoRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  modalLabel: { fontSize: 14, fontWeight: "600", color: "#4B5563", marginLeft: 8, width: 90 },
  modalValue: { fontSize: 14, color: "#111827", flex: 1 },
  productsHeader: { fontSize: 18, fontWeight: "700", color: "#111827", marginBottom: 12 },
  productsList: { maxHeight: 300 },
  productRow: { flexDirection: "row", backgroundColor: "#F9FAFB", borderRadius: 12, padding: 12, marginBottom: 16 },
  productImg: { width: 70, height: 70, borderRadius: 8, marginRight: 12 },
  productInfo: { flex: 1 },
  productName: { fontSize: 16, fontWeight: "600", color: "#111827", marginBottom: 4 },
  productDesc: { fontSize: 14, color: "#4B5563", marginBottom: 8 },
  productPriceRow: { flexDirection: "row", alignItems: "center" },
  productPrice: { fontSize: 14, color: "#111827" },
  productQty: { fontSize: 14, color: "#6B7280", marginHorizontal: 8 },
  productTotal: { fontSize: 14, fontWeight: "600", color: "#E53935", marginLeft: "auto" },
  modalCloseBtn: { marginTop: 16, backgroundColor: "#E53935", padding: 14, borderRadius: 10, alignItems: "center" },
  modalCloseText: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
});
