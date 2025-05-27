import React, { createContext, useState, useContext } from 'react';

// Create cart context
const CartContext = createContext();

// Custom hook to use the cart context
export const useCart = () => useContext(CartContext);

// Cart provider component
export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([
    { id: '1', name: 'Smartphone', price: 799, quantity: 1, pic: 'https://via.placeholder.com/150' },
    { id: '2', name: 'Headphones', price: 199, quantity: 5, pic: 'https://via.placeholder.com/150' },
  ]);

  // Add item to cart
  const addToCart = (product) => {
    setCartItems(prevItems => {
      // Check if the item already exists in the cart
      const existingItem = prevItems.find(item => item.id === product.id);
      
      if (existingItem) {
        // If it exists, increase quantity
        return prevItems.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      } else {
        // If it doesn't exist, add new item with quantity 1
        return [...prevItems, { ...product, quantity: 1 }];
      }
    });
  };

  // Update item quantity
  const updateQuantity = (id, change) => {
    setCartItems(prevItems => 
      prevItems.map(item => {
        if (item.id === id) {
          const newQuantity = item.quantity + change;
          if (newQuantity <= 0) {
            return null; // Will be filtered out below
          }
          return { ...item, quantity: newQuantity };
        }
        return item;
      }).filter(Boolean) // Remove null items
    );
  };

  // Set direct quantity
  const setDirectQuantity = (id, quantity) => {
    const parsedQuantity = parseInt(quantity);
    if (isNaN(parsedQuantity) || parsedQuantity <= 0) return;
    
    setCartItems(prevItems =>
      prevItems.map(item => {
        if (item.id === id) {
          return { ...item, quantity: parsedQuantity };
        }
        return item;
      })
    );
  };

  // Remove item from cart
  const removeFromCart = (id) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  // Calculate total price
  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const value = {
    cartItems,
    addToCart,
    updateQuantity,
    setDirectQuantity,
    removeFromCart,
    calculateTotal
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export default CartContext; 