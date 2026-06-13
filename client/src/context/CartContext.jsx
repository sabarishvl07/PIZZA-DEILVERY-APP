import React, { createContext, useState, useEffect, useContext } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('pizza_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem('pizza_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item) => {
    setCart((prevCart) => {
      // For standard pizzas, check if already in cart to increment quantity
      if (!item.isCustom) {
        const existingIndex = prevCart.findIndex(
          (cartItem) => !cartItem.isCustom && cartItem.pizzaId === item.pizzaId
        );
        if (existingIndex > -1) {
          const newCart = [...prevCart];
          newCart[existingIndex].quantity += item.quantity || 1;
          return newCart;
        }
      } else {
        // For custom pizzas, check if exact same ingredients exist to group them
        const existingIndex = prevCart.findIndex((cartItem) => {
          if (!cartItem.isCustom) return false;
          const detailsMatch =
            cartItem.customDetails.base === item.customDetails.base &&
            cartItem.customDetails.sauce === item.customDetails.sauce &&
            cartItem.customDetails.cheese === item.customDetails.cheese &&
            JSON.stringify(cartItem.customDetails.veggies.sort()) === JSON.stringify(item.customDetails.veggies.sort()) &&
            JSON.stringify(cartItem.customDetails.meat.sort()) === JSON.stringify(item.customDetails.meat.sort());
          return detailsMatch;
        });

        if (existingIndex > -1) {
          const newCart = [...prevCart];
          newCart[existingIndex].quantity += item.quantity || 1;
          return newCart;
        }
      }

      // If new, generate custom unique cart ID
      const cartItemId = `${item.isCustom ? 'custom' : 'standard'}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      return [...prevCart, { ...item, cartItemId, quantity: item.quantity || 1 }];
    });
  };

  const removeFromCart = (cartItemId) => {
    setCart((prevCart) => prevCart.filter((item) => item.cartItemId !== cartItemId));
  };

  const updateQuantity = (cartItemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.cartItemId === cartItemId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartCount
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
