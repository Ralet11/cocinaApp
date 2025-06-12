// views/ProductDetail.js
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Image,
  StyleSheet,
  Dimensions,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import Toast from 'react-native-toast-message';
import { addItem } from '../redux/slices/cart.slice';
import { API_URL } from '@env';
import { BlurView } from 'expo-blur';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

const { width, height } = Dimensions.get('window');
const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

export default function ProductDetail({ route }) {
  const { t, i18n } = useTranslation();
  const currentLang = useSelector(s => s.user.language);

  // sincronizar idioma
  useEffect(() => {
    if (currentLang) i18n.changeLanguage(currentLang);
  }, [currentLang]);

  const [ingredients, setIngredients] = useState([]);
  const [selectedIncluded, setSelectedIncluded] = useState([]);
  const [selectedExtras, setSelectedExtras] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [selectedOption, setSelectedOption] = useState('Simple');
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [scrollY] = useState(new Animated.Value(0));

  const cart = useSelector(state => state.cart.items);
  const { product, isHamburger } = route.params;
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const fetchIngredients = useCallback(async () => {
    try {
      if (isHamburger) {
        const response = await fetch(`${API_URL}/ingredient/getByProduct/${product.id}`);
        const data = await response.json();
        setIngredients(data);
        setSelectedIncluded(data.filter(ing => ing.included).map(ing => ing.id));
      }
    } catch (error) {
      console.error(error);
      Toast.show({
        type: 'error',
        text1: t('productDetail.errorTitle'),
        text2: t('productDetail.errorLoadIngredients'),
      });
    } finally {
      setIsLoading(false);
    }
  }, [product.id, isHamburger, t]);

  useEffect(() => {
    if (!isHamburger) {
      setIsLoading(false);
    } else {
      fetchIngredients();
    }
  }, [fetchIngredients, isHamburger]);

  const includedIngredients = ingredients.filter(ing => ing.included);
  const extraIngredients    = ingredients.filter(ing => !ing.included);

  const toggleIngredient = (id, isIncluded) => {
    const setter = isIncluded ? setSelectedIncluded : setSelectedExtras;
    setter(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const adjustQuantity = amount => {
    setQuantity(prev => Math.max(1, prev + amount));
  };

  const calculateBasePrice = () => {
    const base = parseFloat(product.price) || 0;
    if (!isHamburger) return base;
    const optionPrice =
      selectedOption === 'Simple' ? base : base * 1.5;
    const extrasPrice = selectedExtras.reduce((acc, id) => {
      const ing = extraIngredients.find(e => e.id === id);
      return acc + (ing ? parseFloat(ing.price) || 0 : 0);
    }, 0);
    return optionPrice + extrasPrice;
  };

  const handleAddToCart = () => {
    const base  = calculateBasePrice();
    const total = base * quantity;

    const removed = isHamburger
      ? includedIngredients.filter(ing => !selectedIncluded.includes(ing.id))
      : [];
    const finalIncluded = isHamburger
      ? includedIngredients.filter(ing => selectedIncluded.includes(ing.id))
      : [];
    const finalExtras = isHamburger
      ? extraIngredients.filter(ing => selectedExtras.includes(ing.id))
      : [];

    const uniqueId = [
      product.id,
      isHamburger ? selectedOption : '',
      isHamburger ? selectedIncluded.sort().join(',') : '',
      isHamburger ? selectedExtras.sort().join(',') : '',
      removed.map(ing => ing.id).sort().join(','),
    ].join('-');

    const cartItem = {
      id: uniqueId,
      productId: product.id,
      name: product.name,
      option: isHamburger ? selectedOption : null,
      includedIngredients: finalIncluded,
      extraIngredients: finalExtras,
      removedIngredients: removed,
      quantity,
      pricePerUnit: parseFloat(base.toFixed(2)),
      totalPrice: parseFloat(total.toFixed(2)),
      image: product.img,
    };

    dispatch(addItem(cartItem));

    Toast.show({
      type: 'success',
      text1: t('productDetail.toastAddedTitle'),
      text2: t('productDetail.toastAddedMessage', { name: product.name }),
      position: 'bottom',
      visibilityTime: 2000,
      bottomOffset: 100,
    });

    setIsAdding(true);
    setTimeout(() => setIsAdding(false), 2000);
  };

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const renderIngredientButton = (ing, isIncluded) => (
    <TouchableOpacity
      key={ing.id}
      onPress={() => toggleIngredient(ing.id, isIncluded)}
      style={[
        styles.ingredientButton,
        (isIncluded ? selectedIncluded : selectedExtras).includes(ing.id) &&
          styles.selectedIngredient,
      ]}
    >
      <View style={styles.ingredientInfo}>
        <Text style={styles.ingredientName}>{ing.name}</Text>
        {!isIncluded && (
          <Text style={styles.ingredientMeta}>
            ${parseFloat(ing.price).toFixed(2)}
          </Text>
        )}
      </View>
      <Animated.View
        style={[
          styles.checkmarkContainer,
          {
            opacity: (isIncluded ? selectedIncluded : selectedExtras).includes(ing.id) ? 1 : 0,
            transform: [
              {
                scale: (isIncluded ? selectedIncluded : selectedExtras).includes(ing.id)
                  ? 1
                  : 0,
              },
            ],
          },
        ]}
      >
        <MaterialCommunityIcons name="check-circle" size={24} color="#22C55E" />
      </Animated.View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#D32F2F" />
        <Text style={styles.loadingText}>
          {t('productDetail.loading')}
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <AnimatedBlurView intensity={100} tint="light" style={[styles.header, { opacity: headerOpacity }]}>
        <Text style={styles.headerTitle}>{product.name}</Text>
        <TouchableOpacity style={styles.cartButton} onPress={() => navigation.navigate('CartScreen')}>
          <MaterialCommunityIcons name="cart-outline" size={26} color="#000" />
          {cart.length > 0 && (
            <View style={styles.badgeContainer}>
              <Text style={styles.badgeText}>{cart.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </AnimatedBlurView>

      <ScrollView
        style={styles.content}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} hitSlop={{ top:15,left:15,bottom:15,right:15 }}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>

        <Image source={{ uri: product.img }} style={styles.productImage} />

        <View style={styles.productInfo}>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.description}>{product.description}</Text>
        </View>

        {isHamburger && (
          <View style={styles.optionsContainer}>
            {['Simple', 'Doble'].map(option => {
              const price = option === 'Simple'
                ? parseFloat(product.price)
                : parseFloat(product.price) * 1.5;
              return (
                <TouchableOpacity
                  key={option}
                  onPress={() => setSelectedOption(option)}
                  style={[
                    styles.optionButton,
                    selectedOption === option && styles.selectedOption,
                  ]}
                >
                  <Text style={[
                    styles.optionText,
                    selectedOption === option && styles.selectedOptionText,
                  ]}>
                    {t(option === 'Simple' ? 'productDetail.optionSimple' : 'productDetail.optionDouble')}
                  </Text>
                  <Text style={styles.optionPrice}>${price.toFixed(2)}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {isHamburger && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('productDetail.sectionIncluded')}</Text>
            <View style={styles.ingredientGrid}>
              {includedIngredients.map(ing => renderIngredientButton(ing, true))}
            </View>
          </View>
        )}

        {isHamburger && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('productDetail.sectionExtras')}</Text>
            <View style={styles.ingredientGrid}>
              {extraIngredients.map(ing => renderIngredientButton(ing, false))}
            </View>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      <BlurView intensity={100} tint="light" style={styles.footer}>
        <View style={styles.quantityContainer}>
          <TouchableOpacity onPress={() => adjustQuantity(-1)} style={styles.quantityButton}>
            <MaterialCommunityIcons name="minus" size={20} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.quantityText}>{quantity}</Text>
          <TouchableOpacity onPress={() => adjustQuantity(1)} style={styles.quantityButton}>
            <MaterialCommunityIcons name="plus" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.addButton, isAdding && styles.addButtonSuccess]}
          onPress={handleAddToCart}
          disabled={isAdding}
        >
          <MaterialCommunityIcons
            name={isAdding ? 'check' : 'cart'}
            size={24}
            color="#FFF"
          />
          <Text style={styles.addButtonText}>
            {isAdding
              ? t('productDetail.buttonAdded')
              : t('productDetail.buttonAdd', { price: (calculateBasePrice() * quantity).toFixed(2) })}
          </Text>
        </TouchableOpacity>
      </BlurView>

      <Toast />
    </SafeAreaView>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#000000',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  cartButton: {
    position: 'absolute',
    right: 16,
  },
  badgeContainer: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#D32F2F',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 16,
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 12,
    elevation: 5,
  },
  productImage: {
    width: width,
    height: height * 0.4,
    resizeMode: 'cover',
  },
  productInfo: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
  },
  productName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
  },
  description: {
    fontSize: 16,
    color: '#000000',
    marginTop: 8,
    lineHeight: 24,
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginVertical: 24,
  },
  optionButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#000000',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedOption: {
    backgroundColor: '#D32F2F',
    borderColor: '#D32F2F',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  selectedOptionText: {
    color: '#FFFFFF',
  },
  optionPrice: {
    fontSize: 14,
    color: '#000000',
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
    marginHorizontal: 16,
  },
  ingredientGrid: {
    paddingHorizontal: 16,
  },
  ingredientButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#000000',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedIngredient: {
    backgroundColor: '#FFFFFF',
    borderColor: '#D32F2F',
  },
  ingredientInfo: {
    flex: 1,
  },
  ingredientName: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '500',
  },
  ingredientMeta: {
    fontSize: 14,
    color: '#000000',
    marginTop: 2,
  },
  checkmarkContainer: {
    position: 'absolute',
    right: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 4,
  },
  quantityButton: {
    backgroundColor: '#D32F2F',
    borderRadius: 6,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 18,
    fontWeight: '600',
    marginHorizontal: 16,
    color: '#000000',
  },
  addButton: {
    backgroundColor: '#D32F2F',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    flex: 1,
    marginLeft: 16,
  },
  addButtonSuccess: {
    backgroundColor: '#000000',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
