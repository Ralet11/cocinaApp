// views/PaymentSuccess.jsx
"use client"

import React, { useEffect, useState } from "react"
import { View, Text, StyleSheet, SafeAreaView, ActivityIndicator, TouchableOpacity } from "react-native"
import { useSelector, useDispatch } from "react-redux"
import axios from "react-native-axios"
import { API_URL } from "@env"
import Icon from "react-native-vector-icons/MaterialCommunityIcons"
import { updateOrderState, setCurrentOrderById } from "../redux/slices/order.slice"
import useSocket from "../config/socket"
import { useTranslation } from "react-i18next"

export default function PaymentSuccess({ navigation }) {
  const dispatch = useDispatch()
  const socket = useSocket()
  const { t, i18n } = useTranslation()
  const currentLang = useSelector(s => s.user.language)

  // sincronizar i18n con Redux
  useEffect(() => {
    if (currentLang) i18n.changeLanguage(currentLang)
  }, [currentLang])

  const currentOrder = useSelector(s => s.order.currentOrder)
  const orderId      = currentOrder?.id

  const [loading, setLoading] = useState(true)
  const [state, setState]     = useState(null)

  // 1️⃣ Consulta inicial al backend
  useEffect(() => {
    if (!orderId) {
      navigation.replace("HomeTabs")
      return
    }

    const fetchStatus = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/order/${orderId}`)
        setState(data.status)
        dispatch(updateOrderState({ orderId, newStatus: data.status }))
        dispatch(setCurrentOrderById(orderId))
        if (data.status === "aceptada") {
          navigation.replace("OrderTracking", { orderId })
        }
      } catch (err) {
        console.error("Fetch order status error:", err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchStatus()
  }, [orderId, dispatch, navigation])

  // 2️⃣ Escucha de socket para actualizaciones
  useEffect(() => {
    if (!socket || !orderId) return

    const handler = ({ orderId: id, status }) => {
      if (id !== orderId) return
      setState(status)
      dispatch(updateOrderState({ orderId: id, newStatus: status }))
      if (status === "aceptada") {
        navigation.replace("OrderTracking", { orderId: id })
      }
    }

    socket.on("order_state_changed", handler)
    return () => socket.off("order_state_changed", handler)
  }, [socket, orderId, dispatch, navigation])

  // Renderizado según estado
  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.statusContainer}>
          <ActivityIndicator size="large" color="#D32F2F" />
          <Text style={styles.statusTitle}>{t("payment.loadingTitle")}</Text>
          <Text style={styles.statusSubtitle}>{t("payment.loadingSubtitle")}</Text>
        </View>
      )
    }

    if (state === "pendiente") {
      return (
        <View style={styles.statusContainer}>
          <View style={styles.iconContainer}>
            <Icon name="clock-outline" size={80} color="#FFA000" />
          </View>
          <Text style={styles.statusTitle}>{t("payment.pendingTitle")}</Text>
          <Text style={styles.statusSubtitle}>{t("payment.pendingSubtitle")}</Text>
        </View>
      )
    }

    if (state === "rechazada") {
      return (
        <View style={styles.statusContainer}>
          <View style={styles.iconContainer}>
            <Icon name="close-circle" size={80} color="#D32F2F" />
          </View>
          <Text style={styles.statusTitle}>{t("payment.failedTitle")}</Text>
          <Text style={styles.statusSubtitle}>{t("payment.failedSubtitle")}</Text>
          <TouchableOpacity style={styles.actionButton} onPress={() => navigation.goBack()}>
            <Text style={styles.actionButtonText}>{t("payment.tryAgain")}</Text>
          </TouchableOpacity>
        </View>
      )
    }

    if (state === "aceptada") {
      return (
        <View style={styles.statusContainer}>
          <View style={styles.iconContainer}>
            <Icon name="check-circle" size={80} color="#4CAF50" />
          </View>
          <Text style={styles.statusTitle}>{t("payment.successTitle")}</Text>
          <Text style={styles.statusSubtitle}>{t("payment.successSubtitle")}</Text>
        </View>
      )
    }

    return null
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t("payment.header")}</Text>
      </View>

      <View style={styles.card}>{renderContent()}</View>

      {!loading && state !== "aceptada" && (
        <TouchableOpacity
          style={styles.homeButton}
          onPress={() => navigation.replace("HomeTabs")}
        >
          <Icon name="home" size={20} color="#FFF" style={styles.buttonIcon} />
          <Text style={styles.homeButtonText}>{t("payment.backHome")}</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    backgroundColor: "#D32F2F",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 20,
    elevation: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFF",
    textAlign: "center",
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    marginHorizontal: 20,
    paddingVertical: 30,
    paddingHorizontal: 20,
    elevation: 3,
    flex: 1,
    maxHeight: 400,
    justifyContent: "center",
  },
  statusContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(0,0,0,0.05)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  statusTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
    color: "#333",
  },
  statusSubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  actionButton: {
    backgroundColor: "#D32F2F",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    marginTop: 16,
    elevation: 2,
  },
  actionButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  homeButton: {
    flexDirection: "row",
    backgroundColor: "#D32F2F",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 25,
    marginHorizontal: 20,
    marginBottom: 20,
    marginTop: 16,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
  },
  homeButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  buttonIcon: {
    marginRight: 8,
  },
})
