// Product List App with Search Functionality
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, StyleSheet, TouchableOpacity } from 'react-native';

// Sample product data - in a real app, you would import this from a JSON file
const productData = [
  { id: 1, name: 'Smartphone', price: 599, description: 'Latest model with high-resolution camera' },
  { id: 2, name: 'Laptop', price: 999, description: 'Powerful laptop for work and gaming' },
  { id: 3, name: 'Headphones', price: 199, description: 'Noise-cancelling wireless headphones' },
  { id: 4, name: 'Smartwatch', price: 299, description: 'Fitness tracking and notifications' },
  { id: 5, name: 'Tablet', price: 499, description: 'Lightweight tablet with long battery life' }
];

export default function App() {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    setProducts(productData);
  }, []);

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderProduct = ({ item }) => (
    <TouchableOpacity 
      style={styles.productItem}
      onPress={() => setSelectedProduct(item)}
    >
      <Text style={styles.productName}>{item.name}</Text>
      <Text style={styles.productPrice}>${item.price}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchBar}
        placeholder="Search products..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      
      {selectedProduct ? (
        <View style={styles.detailContainer}>
          <Text style={styles.detailTitle}>{selectedProduct.name}</Text>
          <Text style={styles.detailPrice}>${selectedProduct.price}</Text>
          <Text style={styles.detailDescription}>{selectedProduct.description}</Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => setSelectedProduct(null)}
          >
            <Text style={styles.backButtonText}>Back to List</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={item => item.id.toString()}
          renderItem={renderProduct}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    marginTop: 40,
  },
  searchBar: {
    height: 40,
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  productItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  productPrice: {
    fontSize: 14,
    color: '#666',
  },
  detailContainer: {
    flex: 1,
    padding: 20,
  },
  detailTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  detailPrice: {
    fontSize: 18,
    color: '#666',
    marginBottom: 15,
  },
  detailDescription: {
    fontSize: 16,
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  backButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
}); 