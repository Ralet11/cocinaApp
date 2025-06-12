// frontend/src/views/Dashboard.jsx
"use client"

import { useEffect, useState, useRef, useMemo } from "react"
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  TextInput,
  ActivityIndicator,
  Dimensions,
  Image,
  FlatList,
} from "react-native"
import Icon from "react-native-vector-icons/MaterialCommunityIcons"
import { useNavigation } from "@react-navigation/native"
import { useSelector, useDispatch } from "react-redux"
import axios from "react-native-axios"
import { useTranslation } from "react-i18next"           // ← importamos hook

// ── Redux actions ───────────────────────────────────────────────────────────
import { setAddresses, setCurrentAddress } from "../redux/slices/user.slice"
import { setPartnerId }                     from "../redux/slices/partner.slice"
import { setHistoricOrders }                from "../redux/slices/order.slice"
import { addItem, removeItem, updateItemQuantity } from "../redux/slices/cart.slice"
import { API_URL }                          from "@env"

const { width }   = Dimensions.get("window")
const cardWidth   = width * 0.85  // Tarjetas más anchas

export default function Dashboard() {
  const navigation     = useNavigation()
  const dispatch       = useDispatch()
  const { t, i18n }    = useTranslation()               // ← destructuramos t() e i18n

  // ── Redux selectors ───────────────────────────────────────────────────────
  const cart           = useSelector(s => s.cart.items)
  const token          = useSelector(s => s.user.userInfo.token)
  const user_id        = useSelector(s => s.user.userInfo?.id)
  const addresses      = useSelector(s => s.user.addresses)
  const currentAddress = useSelector(s => s.user.currentAddress)
  const currentLang    = useSelector(s => s.user.language)

  // ── Cuando cambie el idioma en Redux, actualizamos i18n ───────────────────
  useEffect(() => {
    if (currentLang) {
      i18n.changeLanguage(currentLang)
    }
  }, [currentLang])

  // ── Local state ───────────────────────────────────────────────────────────
  const [groupedProducts, setGroupedProducts]   = useState({})
  const [activeCategory, setActiveCategory]     = useState("")
  const [searchTerm, setSearchTerm]             = useState("")
  const [isScreenLoading, setIsScreenLoading]         = useState(true)
  const [isFetchingAddresses, setIsFetchingAddresses] = useState(false)

  // Scroll refs
  const scrollViewRef   = useRef(null)
  const categoryRefs    = useRef({})
  const categoryListRef = useRef(null)

  // ── 1) Cargar direcciones ─────────────────────────────────────────────────
  useEffect(() => {
    if (!token || !user_id) return

    const getAddresses = async () => {
      setIsFetchingAddresses(true)
      try {
        const { data } = await axios.get(
          `${API_URL}/user/getAllAddress/${user_id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        if (!data.length) {
          navigation.navigate("FirstAddressScreen")
        } else {
          dispatch(setAddresses(data))
          if (!currentAddress) dispatch(setCurrentAddress(data[0]))
        }
      } catch (err) {
        console.error("Error fetching addresses:", err.response || err)
      } finally {
        setIsFetchingAddresses(false)
      }
    }

    if (addresses?.length) {
      if (!currentAddress) dispatch(setCurrentAddress(addresses[0]))
      setIsFetchingAddresses(false)
    } else {
      getAddresses()
    }
  }, [token, user_id])

  // ── 2) Cargar órdenes históricas ──────────────────────────────────────────
  useEffect(() => {
    if (!token || !user_id) return
    const fetchHistoric = async () => {
      try {
        const { data } = await axios.get(
          `${API_URL}/order/getAllByUser/${user_id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        dispatch(setHistoricOrders(data))
      } catch (err) {
        console.error("Error fetching historic orders:", err.response || err)
      }
    }
    fetchHistoric()
  }, [token, user_id])

  // ── 3) Partner + productos cuando cambia dirección ─────────────────────────
  useEffect(() => {
    if (!token || !currentAddress || isFetchingAddresses) return

    const fetchPartnerAndProducts = async () => {
      setIsScreenLoading(true)
      try {
        const p = await axios.post(
          `${API_URL}/partner/closest`,
          { address: { latitude: currentAddress.lat, longitude: currentAddress.lng } },
          { headers: { Authorization: `Bearer ${token}` } }
        )
        const partner = p.data.closestPartner
        dispatch(setPartnerId(partner.id))

        const prod = await axios.get(
          `${API_URL}/partner/${partner.id}/products`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        const grouped = prod.data.cat || {}
        setGroupedProducts(grouped)
        if (Object.keys(grouped).length) {
          setActiveCategory(Object.keys(grouped)[0])
        }
      } catch (err) {
        console.error("Error fetching partner/products:", err.response || err)
      } finally {
        setIsScreenLoading(false)
      }
    }

    fetchPartnerAndProducts()
  }, [token, currentAddress, isFetchingAddresses])

  // ── 4) Filtrado por searchTerm ─────────────────────────────────────────────
  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return groupedProducts
    const term = searchTerm.trim().toLowerCase()
    const res = {}
    Object.entries(groupedProducts).forEach(([cat, products]) => {
      const matches = products.filter(p =>
        p.name.toLowerCase().includes(term)
      )
      if (matches.length) res[cat] = matches
    })
    return res
  }, [searchTerm, groupedProducts])

  useEffect(() => {
    if (!filteredProducts[activeCategory]) {
      setActiveCategory(Object.keys(filteredProducts)[0] || "")
    }
  }, [filteredProducts])

  // ── Scroll a categoría ─────────────────────────────────────────────────────
  const scrollToCategory = (cat) => {
    setActiveCategory(cat)
    const idx = Object.keys(filteredProducts).indexOf(cat)
    if (idx !== -1) {
      categoryListRef.current?.scrollToIndex({
        index: idx,
        animated: true,
        viewPosition: 0.5,
      })
    }
    categoryRefs.current[cat]?.measureLayout(
      scrollViewRef.current,
      (_x, y) => scrollViewRef.current.scrollTo({ y, animated: true }),
      () => {}
    )
  }

  // ── Helpers de carrito ─────────────────────────────────────────────────────
  const handleAddPress = (item, isHamburger) => {
    if (isHamburger) {
      navigation.getParent().navigate("ProductDetail", { product: item, isHamburger: true })
    } else {
      const existing = cart.find(i => i.productId === item.id)
      if (existing) {
        dispatch(updateItemQuantity({ id: existing.id, quantity: existing.quantity + 1 }))
      } else {
        dispatch(addItem({
          id: item.id,
          productId: item.id,
          name: item.name,
          quantity: 1,
          pricePerUnit: parseFloat(item.price),
          totalPrice: parseFloat(item.price),
          image: item.img,
        }))
      }
    }
  }

  const handleRemovePress = (item) => {
    const existing = cart.find(i => i.productId === item.id)
    if (!existing) return
    if (existing.quantity > 1) {
      dispatch(updateItemQuantity({ id: existing.id, quantity: existing.quantity - 1 }))
    } else {
      dispatch(removeItem(existing.id))
    }
  }

  const getQuantity = (productId) => {
    const i = cart.find(x => x.productId === productId)
    return i ? i.quantity : 0
  }

  // ── Render ────────────────────────────────────────────────────────────────
  if (isScreenLoading) {
    return (
      <SafeAreaView style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#D32F2F" />
        <Text style={styles.loaderText}>{t("dashboard.loading")}</Text>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Icon name="map-marker" size={24} color="#FFF"/>
        <TouchableOpacity
          onPress={() => navigation.navigate("Addresses")}
          style={styles.addressContainer}
        >
          <View style={styles.streetLine}>
            <Text style={styles.locationText} numberOfLines={1} ellipsizeMode="tail">
              {currentAddress?.street || t("dashboard.selectAddress")}
            </Text>
            <Icon name="chevron-down" size={24} color="#FFF"/>
          </View>
          <Text style={styles.addressType}>{currentAddress?.type || ""}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cartIconButton}
          onPress={() => navigation.navigate("CartScreen")}
        >
          <Icon name="cart-outline" size={24} color="#FFF"/>
          {cart.length > 0 && (
            <View style={styles.badgeContainer}>
              <Text style={styles.badgeText}>{cart.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Mostrar idioma actual */}
      

      {/* Search */}
      <View style={styles.searchContainer}>
        <Icon name="magnify" size={24} color="#9CA3AF" style={styles.searchIcon}/>
        <TextInput
          style={styles.searchInput}
          placeholder={t("dashboard.searchPlaceholder")}
          placeholderTextColor="#9CA3AF"
          value={searchTerm}
          onChangeText={setSearchTerm}
          returnKeyType="search"
        />
      </View>

      {/* Categories */}
      {!!Object.keys(filteredProducts).length && (
        <View style={styles.categoriesContainer}>
          <FlatList
            ref={categoryListRef}
            data={Object.keys(filteredProducts)}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={item => item}
            contentContainerStyle={styles.categoriesList}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.categoryButton,
                  activeCategory === item && styles.activeCategoryButton,
                ]}
                onPress={() => scrollToCategory(item)}
              >
                <Text
                  style={[
                    styles.categoryButtonText,
                    activeCategory === item && styles.activeCategoryButtonText,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            )}
            onScrollToIndexFailed={info =>
              setTimeout(
                () => categoryListRef.current?.scrollToIndex({ index: info.index }),
                500
              )
            }
          />
        </View>
      )}

      {/* Products */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.productsContainer}
        showsVerticalScrollIndicator={false}
      >
        {Object.entries(filteredProducts).map(([categoryName, products]) => {
          const isHamburger = categoryName === "Burgers"
          return (
            <View
              key={categoryName}
              style={styles.sectionContainer}
              ref={el => (categoryRefs.current[categoryName] = el)}
            >
              <Text style={styles.sectionTitle}>{categoryName}</Text>
              <View style={styles.productsGrid}>
                {products.map(item => {
                  const qty = getQuantity(item.id)
                  return (
                    <View key={item.id} style={styles.productCard}>
                      <TouchableOpacity
                        style={styles.productImageContainer}
                        onPress={() =>
                          navigation
                            .getParent()
                            .navigate("ProductDetail", { product: item, isHamburger })
                        }
                      >
                        <Image source={{ uri: item.img }} style={styles.productImage}/>
                      </TouchableOpacity>
                      <View style={styles.productInfo}>
                        <Text style={styles.productName} numberOfLines={1}>
                          {item.name}
                        </Text>
                        <Text style={styles.productPrice}>${item.price}</Text>
                        <View style={styles.cartControls}>
                          {qty > 0 ? (
                            <>
                              <TouchableOpacity
                                style={styles.cartQuantityButton}
                                onPress={() => handleRemovePress(item)}
                              >
                                <Icon name="minus" size={16} color="#FFF"/>
                              </TouchableOpacity>
                              <Text style={styles.quantityText}>{qty}</Text>
                              <TouchableOpacity
                                style={styles.cartQuantityButton}
                                onPress={() => handleAddPress(item, isHamburger)}
                              >
                                <Icon name="plus" size={16} color="#FFF"/>
                              </TouchableOpacity>
                            </>
                          ) : (
                            <TouchableOpacity
                              style={styles.addToCartButton}
                              onPress={() => handleAddPress(item, isHamburger)}
                            >
                              <Icon name="plus" size={16} color="#FFF"/>
                              <Text style={styles.addToCartText}>
                                {t("dashboard.addToCart")}
                              </Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>
                    </View>
                  )
                })}
              </View>
            </View>
          )
        })}
        {!Object.keys(filteredProducts).length && (
          <View style={styles.noResultsContainer}>
            <Icon name="emoticon-sad-outline" size={64} color="#D32F2F"/>
            <Text style={styles.noResultsText}>
              {t("dashboard.noProducts")}
            </Text>
          </View>
        )}
        <View style={{ height: 20 }}/>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  loaderContainer:     { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F5F5F5" },
  loaderText:          { marginTop: 10, fontSize: 16, color: "#D32F2F" },
  container:           { flex: 1, backgroundColor: "#F5F5F5" },
  header:              {
                         flexDirection: "row",
                         alignItems: "center",
                         justifyContent: "space-between",
                         paddingHorizontal: 20,
                         paddingVertical: 16,
                         backgroundColor: "#D32F2F",
                         borderBottomLeftRadius: 24,
                         borderBottomRightRadius: 24,
                       },
  addressContainer:    { flex: 1, marginHorizontal: 8, maxWidth: "70%" },
  streetLine:          { flexDirection: "row", alignItems: "center" },
  locationText:        { flex: 1, fontSize: 16, fontWeight: "600", color: "#FFF" },
  addressType:         { fontSize: 12, color: "#FFF", marginTop: 2 },
  cartIconButton:      {
                         position: "relative",
                         width: 32,
                         height: 32,
                         borderRadius: 16,
                         backgroundColor: "#D32F2F",
                         justifyContent: "center",
                         alignItems: "center",
                       },
  badgeContainer:      {
                         position: "absolute",
                         top: -5,
                         right: -5,
                         backgroundColor: "#000",
                         borderRadius: 10,
                         width: 20,
                         height: 20,
                         justifyContent: "center",
                         alignItems: "center",
                       },
  badgeText:           { color: "#FFF", fontSize: 12, fontWeight: "bold" },
  languageContainer:   { padding: 12, backgroundColor: "#FFF", margin: 12, borderRadius: 8 },
  languageText:        { fontSize: 14, fontWeight: "600", color: "#333" },
  searchContainer:     {
                         flexDirection: "row",
                         alignItems: "center",
                         paddingHorizontal: 20,
                         marginVertical: 16,
                       },
  searchIcon:          { position: "absolute", left: 36, zIndex: 1 },
  searchInput:         {
                         flex: 1,
                         height: 50,
                         backgroundColor: "#FFF",
                         borderRadius: 25,
                         paddingLeft: 48,
                         paddingRight: 16,
                         fontSize: 16,
                         color: "#4B5563",
                         elevation: 3,
                       },
  categoriesContainer: { backgroundColor: "#FFF", paddingVertical: 12, marginBottom: 16, elevation: 3 },
  categoriesList:      { paddingHorizontal: 16 },
  categoryButton:      {
                         paddingHorizontal: 16,
                         paddingVertical: 8,
                         marginRight: 8,
                         backgroundColor: "#F3F4F6",
                         borderRadius: 20,
                       },
  activeCategoryButton:{ backgroundColor: "#D32F2F" },
  categoryButtonText:  { fontSize: 14, fontWeight: "500", color: "#4B5563" },
  activeCategoryButtonText:{ color: "#FFF" },
  productsContainer:   { flex: 1 },
  sectionContainer:    { paddingHorizontal: 20, marginBottom: 24 },
  sectionTitle:        { fontSize: 22, fontWeight: "bold", marginBottom: 16 },
  productsGrid:        { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  productCard:         {
                         width: "48%",
                         backgroundColor: "#FFF",
                         borderRadius: 16,
                         marginBottom: 16,
                         elevation: 3,
                         overflow: "hidden",
                       },
  productImageContainer:{ width: "100%", height: 120 },
  productImage:        { width: "100%", height: "100%", resizeMode: "cover" },
  productInfo:         { padding: 12 },
  productName:         { fontSize: 16, fontWeight: "bold", marginBottom: 4 },
  productPrice:        { fontSize: 14, fontWeight: "bold", color: "#D32F2F", marginBottom: 8 },
  cartControls:        { flexDirection: "row", alignItems: "center", justifyContent: "center" },
  cartQuantityButton:  { backgroundColor: "#D32F2F", borderRadius: 16, padding: 6 },
  quantityText:        { fontSize: 16, fontWeight: "bold", marginHorizontal: 12 },
  addToCartButton:     {
                         flexDirection: "row",
                         alignItems: "center",
                         justifyContent: "center",
                         backgroundColor: "#D32F2F",
                         borderRadius: 20,
                         paddingVertical: 6,
                         paddingHorizontal: 12,
                         width: "100%",
                       },
  addToCartText:       { color: "#FFF", fontSize: 14, fontWeight: "bold", marginLeft: 4 },
  noResultsContainer:  { alignItems: "center", marginTop: 60 },
  noResultsText:       { marginTop: 12, fontSize: 16, color: "#4B5563" },
})
