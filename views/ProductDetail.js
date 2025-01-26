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

const { width, height } = Dimensions.get('window');

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

export default function ProductDetail({ route }) {
  const [ingredients, setIngredients] = useState([]);
  const [selectedIncluded, setSelectedIncluded] = useState([]);
  const [selectedExtras, setSelectedExtras] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [selectedOption, setSelectedOption] = useState('Single');
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [scrollY] = useState(new Animated.Value(0));

  // Redux: get cart items
  const cart = useSelector((state) => state.cart.items);

  // We receive `product` and `isHamburger` from route params
  const { product, isHamburger } = route.params;
  const dispatch = useDispatch();
  const navigation = useNavigation();

  /**
   * Fetch ingredients only if it's a burger.
   */
  const fetchIngredients = useCallback(async () => {
    try {
      if (isHamburger) {
        const response = await fetch(`${API_URL}/ingredient/getByProduct/${product.id}`);
        const data = await response.json();
        setIngredients(data);
        setSelectedIncluded(
          data.filter((ing) => ing.included).map((ing) => ing.id)
        );
      }
    } catch (error) {
      console.error('Error retrieving ingredients:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load ingredients. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [product.id, isHamburger]);

  useEffect(() => {
    // If it's not a burger, we have nothing to fetch
    if (!isHamburger) {
      setIsLoading(false);
      return;
    }
    fetchIngredients();
  }, [fetchIngredients, isHamburger]);

  // Separate included/extra ingredients
  const includedIngredients = ingredients.filter((ing) => ing.included);
  const extraIngredients = ingredients.filter((ing) => !ing.included);

  // Toggle included/extra
  const toggleIngredient = (id, isIncluded) => {
    const setterFunction = isIncluded ? setSelectedIncluded : setSelectedExtras;
    setterFunction((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Adjust quantity (min 1)
  const adjustQuantity = (amount) => {
    setQuantity((prev) => Math.max(1, prev + amount));
  };

  /**
   * Calculates base price (and extras) for *1 unit* (not multiplied by quantity yet).
   */
  const calculateBasePrice = () => {
    const productPrice = parseFloat(product.price) || 0;

    // If not a burger, return the product price as-is
    if (!isHamburger) return productPrice;

    // Single/Double
    const base = selectedOption === 'Single'
      ? productPrice
      : productPrice * 1.5;

    // Sum of extra ingredients
    const extraPrice = selectedExtras.reduce((acc, id) => {
      const ingredient = extraIngredients.find((ing) => ing.id === id);
      return acc + (ingredient ? parseFloat(ingredient.price) || 0 : 0);
    }, 0);

    return base + extraPrice;
  };

  /**
   * Add item to cart
   */
  const handleAddToCart = () => {
    const basePrice = calculateBasePrice();
    const totalPrice = basePrice * quantity;
    
    // Determinar los ingredientes eliminados como objetos completos
    const removedIngredients = isHamburger
      ? includedIngredients.filter((ing) => !selectedIncluded.includes(ing.id))
      : [];
    
    // Ingredientes finales seleccionados
    const finalIncludedIngredients = isHamburger
      ? includedIngredients.filter((ing) => selectedIncluded.includes(ing.id))
      : [];
    const finalExtraIngredients = isHamburger
      ? extraIngredients.filter((ing) => selectedExtras.includes(ing.id))
      : [];
    
    // Crear un ID único para el carrito
    const uniqueId = [
      product.id,
      isHamburger ? selectedOption : '',
      isHamburger ? selectedIncluded.sort().join(',') : '',
      isHamburger ? selectedExtras.sort().join(',') : '',
      removedIngredients.map((ing) => ing.id).sort().join(','), // Solo IDs para el ID único
    ].join('-');
    
    // Crear el objeto del carrito
    const cartItem = {
      id: uniqueId,
      productId: product.id,
      name: product.name,
      option: isHamburger ? selectedOption : null,
      includedIngredients: finalIncludedIngredients,
      extraIngredients: finalExtraIngredients,
      removedIngredients: removedIngredients, // Guardar objetos completos
      quantity,
      pricePerUnit: parseFloat(basePrice.toFixed(2)),
      totalPrice: parseFloat(totalPrice.toFixed(2)),
      image: product.img,
    };
    
    // Agregar al carrito en Redux
    dispatch(addItem(cartItem));
    
    // Mostrar mensaje de éxito
    Toast.show({
      type: 'success',
      text1: 'Product added',
      text2: `${product.name} was added to the cart`,
      position: 'bottom',
      visibilityTime: 2000,
      bottomOffset: 100,
    });
    
    setIsAdding(true);
    setTimeout(() => setIsAdding(false), 2000);
  };

  // For the blurred header animation
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  // Renders each ingredient button
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
        {/* Show price only for extra ingredients */}
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
            opacity: (isIncluded ? selectedIncluded : selectedExtras).includes(ing.id)
              ? 1
              : 0,
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

  // If still loading (only relevant if it's a burger)
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6D28D9" />
        <Text style={styles.loadingText}>Loading product details...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with blur background */}
      <AnimatedBlurView
        intensity={100}
        tint="light"
        style={[styles.header, { opacity: headerOpacity }]}
      >
        <Text style={styles.headerTitle}>{product.name}</Text>

        {/* Cart button on the right side of the header */}
        <TouchableOpacity
          style={styles.cartButton}
          onPress={() => {
            navigation.navigate('CartScreen');
          }}
        >
          <MaterialCommunityIcons name="cart-outline" size={26} color="#1F2937" />
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
        {/* Back button (top-left) */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 15, left: 15, bottom: 15, right: 15 }}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Product image */}
        <Image source={{ uri: product.img }} style={styles.productImage} />

        {/* Product info */}
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.description}>{product.description}</Text>
        </View>

        {/* Show Single/Double options only if isHamburger */}
        {isHamburger && (
          <View style={styles.optionsContainer}>
            {['Single', 'Double'].map((option) => {
              const priceForOption =
                option === 'Single'
                  ? (parseFloat(product.price) || 0).toFixed(2)
                  : ((parseFloat(product.price) || 0) * 1.5).toFixed(2);

              return (
                <TouchableOpacity
                  key={option}
                  onPress={() => setSelectedOption(option)}
                  style={[
                    styles.optionButton,
                    selectedOption === option && styles.selectedOption,
                  ]}
                >
                  <Text
                    style={[
                      styles.optionText,
                      selectedOption === option && styles.selectedOptionText,
                    ]}
                  >
                    {option}
                  </Text>
                  <Text style={styles.optionPrice}>${priceForOption}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Included ingredients */}
        {isHamburger && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Included Ingredients</Text>
            <View style={styles.ingredientGrid}>
              {includedIngredients.map((ing) =>
                renderIngredientButton(ing, true)
              )}
            </View>
          </View>
        )}

        {/* Extra ingredients */}
        {isHamburger && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Extra Ingredients</Text>
            <View style={styles.ingredientGrid}>
              {extraIngredients.map((ing) =>
                renderIngredientButton(ing, false)
              )}
            </View>
          </View>
        )}

        {/* Spacing at the bottom so content isn't hidden by the footer */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Footer with quantity & Add button */}
      <BlurView intensity={100} tint="light" style={styles.footer}>
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            onPress={() => adjustQuantity(-1)}
            style={styles.quantityButton}
          >
            <MaterialCommunityIcons name="minus" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.quantityText}>{quantity}</Text>
          <TouchableOpacity
            onPress={() => adjustQuantity(1)}
            style={styles.quantityButton}
          >
            <MaterialCommunityIcons name="plus" size={20} color="#FFFFFF" />
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
            color="#FFFFFF"
          />
          {/* Show total with 2 decimals */}
          <Text style={styles.addButtonText}>
            {isAdding
              ? 'Added!'
              : `Add - $${(calculateBasePrice() * quantity).toFixed(2)}`}
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
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#4B5563',
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
    color: '#1F2937',
  },
  cartButton: {
    position: 'absolute',
    right: 16,
  },
  badgeContainer: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EF4444',
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
    color: '#1F2937',
  },
  description: {
    fontSize: 16,
    color: '#4B5563',
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
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedOption: {
    backgroundColor: '#F3F4F6',
    borderColor: '#6D28D9',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  selectedOptionText: {
    color: '#6D28D9',
  },
  optionPrice: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
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
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedIngredient: {
    backgroundColor: '#F3F4F6',
    borderColor: '#22C55E',
  },
  ingredientInfo: {
    flex: 1,
  },
  ingredientName: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
  ingredientMeta: {
    fontSize: 14,
    color: '#6B7280',
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
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 4,
  },
  quantityButton: {
    backgroundColor: '#6D28D9',
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
  },
  addButton: {
    backgroundColor: '#6D28D9',
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
    backgroundColor: '#22C55E',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
