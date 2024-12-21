import { StyleSheet } from 'react-native';
import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { API_URL } from '@env';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#6D28D9',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  content: {
    padding: 16,
  },
  productImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#4B5563',
    marginBottom: 16,
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  optionButton: {
    flex: 1,
    marginHorizontal: 8,
    borderWidth: 2,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  optionText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  optionPrice: {
    fontSize: 14,
    color: '#6B7280',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#1F2937',
  },
  ingredientGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  ingredientButton: {
    flex: 1,
    minWidth: '45%',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ingredientInfo: {
    flex: 1,
  },
  ingredientName: {
    fontSize: 16,
    color: '#1F2937',
  },
  ingredientMeta: {
    fontSize: 12,
    color: '#6B7280',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
  },
  quantityButton: {
    backgroundColor: '#6D28D9',
    borderRadius: 20,
    width: 40,
    height: 40,
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
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    alignSelf: 'center',
    marginBottom: 20
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default function ProductDetail({ route, navigation }) {
  const [ingredients, setIngredients] = useState([]);
  const [selectedIncluded, setSelectedIncluded] = useState([]);
  const [selectedExtras, setSelectedExtras] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [selectedOption, setSelectedOption] = useState('Simple');
  const { product } = route.params;

  console.log(product,"prod")

  useEffect(() => {
    const fetchIngredients = async () => {
      try {
        const response = await fetch(`${API_URL}/ingredient/getByProduct/${product.id}`);
        const data = await response.json();
        setIngredients(data);
        setSelectedIncluded(data.filter((ing) => ing.included).map((ing) => ing.id)); // Por defecto seleccionados
      } catch (error) {
        console.error('Error al obtener ingredientes:', error);
      }
    };

    fetchIngredients();
  }, [product.id]);

  const includedIngredients = ingredients.filter((ing) => ing.included);
  const extraIngredients = ingredients.filter((ing) => !ing.included);

  const toggleIncludedIngredient = (id) => {
    setSelectedIncluded((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleExtraIngredient = (id) => {
    setSelectedExtras((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const adjustQuantity = (amount) => {
    const newQuantity = quantity + amount;
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };

  const price = selectedOption === 'Simple' ? product.price : (product.price * 1.5).toFixed(2);
  const calories = selectedOption === 'Simple' ? 500 : 760; // Valores estimados

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{product.name}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <Image source={{ uri: product.img }} style={styles.productImage} />
        <Text style={styles.description}>{product.description}</Text>

        <View style={styles.optionsContainer}>
          {['Simple', 'Doble'].map((option) => (
            <TouchableOpacity
              key={option}
              onPress={() => setSelectedOption(option)}
              style={[
                styles.optionButton,
                {
                  backgroundColor: selectedOption === option ? '#EDE9FE' : '#FFFFFF',
                  borderColor: selectedOption === option ? '#6D28D9' : '#E5E7EB',
                },
              ]}
            >
              <Text
                style={[
                  styles.optionText,
                  { color: selectedOption === option ? '#6D28D9' : '#1F2937' },
                ]}
              >
                {option}
              </Text>
              <Text style={styles.optionPrice}>
                ${option === 'Simple' ? product.price : (product.price * 1.5).toFixed(2)} - {option === 'Simple' ? '500' : '760'} cal
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ marginBottom: 24 }}>
          <Text style={styles.sectionTitle}>Ingredientes incluidos</Text>
          <View style={styles.ingredientGrid}>
            {includedIngredients.map((ing) => (
              <TouchableOpacity
                key={ing.id}
                onPress={() => toggleIncludedIngredient(ing.id)}
                style={[
                  styles.ingredientButton,
                  {
                    backgroundColor: selectedIncluded.includes(ing.id) ? '#EDE9FE' : '#FFFFFF',
                    borderColor: selectedIncluded.includes(ing.id) ? '#6D28D9' : '#E5E7EB',
                  },
                ]}
              >
                <View style={styles.ingredientInfo}>
                  <Text style={styles.ingredientName}>{ing.name}</Text>
                  <Text style={styles.ingredientMeta}>{ing.calories} cal</Text>
                </View>
                <MaterialCommunityIcons
                  name={selectedIncluded.includes(ing.id) ? 'check-circle' : 'plus-circle'}
                  size={24}
                  color={selectedIncluded.includes(ing.id) ? '#6D28D9' : '#9CA3AF'}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ marginBottom: 24 }}>
          <Text style={styles.sectionTitle}>Agregar ingredientes extras</Text>
          <View style={styles.ingredientGrid}>
            {extraIngredients.map((ing) => (
              <TouchableOpacity
                key={ing.id}
                onPress={() => toggleExtraIngredient(ing.id)}
                style={[
                  styles.ingredientButton,
                  {
                    backgroundColor: selectedExtras.includes(ing.id) ? '#EDE9FE' : '#FFFFFF',
                    borderColor: selectedExtras.includes(ing.id) ? '#6D28D9' : '#E5E7EB',
                  },
                ]}
              >
                <View style={styles.ingredientInfo}>
                  <Text style={styles.ingredientName}>{ing.name}</Text>
                  <Text style={styles.ingredientMeta}>${ing.price} - {ing.calories} cal</Text>
                </View>
                <MaterialCommunityIcons
                  name={selectedExtras.includes(ing.id) ? 'check-circle' : 'plus-circle'}
                  size={24}
                  color={selectedExtras.includes(ing.id) ? '#6D28D9' : '#9CA3AF'}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.quantityContainer}>
          <TouchableOpacity onPress={() => adjustQuantity(-1)} style={styles.quantityButton}>
            <MaterialCommunityIcons name="minus" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.quantityText}>{quantity}</Text>
          <TouchableOpacity onPress={() => adjustQuantity(1)} style={styles.quantityButton}>
            <MaterialCommunityIcons name="plus" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>
            Agregar por ${(price * quantity).toFixed(2)}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

