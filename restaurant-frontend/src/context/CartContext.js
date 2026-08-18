import React, { createContext, useReducer, useEffect, useContext } from 'react';

const CartContext = createContext();

const initialState = {
  cart: [],
  discount: null
};

// Load cart from localStorage
const loadCartFromStorage = () => {
  try {
    const storedCart = localStorage.getItem('cart');
    const storedDiscount = localStorage.getItem('discount');

    return {
      cart: storedCart ? JSON.parse(storedCart) : [],
      discount: storedDiscount ? JSON.parse(storedDiscount) : null
    };
  } catch (error) {
    console.error('Lỗi khi đọc giỏ hàng từ localStorage:', error);
    return initialState;
  }
};

const reducer = (state, action) => {
  let newState;

  switch (action.type) {
    case 'ADD_TO_CART':
      const existingItemIndex = state.cart.findIndex(item => item.id === action.payload.id);
      let newCart;

      if (existingItemIndex >= 0) {
        // Item already exists, update quantity
        newCart = [...state.cart];
        newCart[existingItemIndex] = {
          ...newCart[existingItemIndex],
          quantity: newCart[existingItemIndex].quantity + (action.payload.quantity || 1)
        };
      } else {
        // Add new item
        newCart = [...state.cart, { ...action.payload, quantity: action.payload.quantity || 1 }];
      }

      newState = { ...state, cart: newCart };
      break;

    case 'REMOVE_FROM_CART':
      newState = {
        ...state,
        cart: state.cart.filter(item => item.id !== action.payload)
      };
      break;

    case 'UPDATE_QUANTITY':
      newState = {
        ...state,
        cart: state.cart.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        )
      };
      break;

    case 'CLEAR_CART':
      newState = {
        ...state,
        cart: [],
        discount: null
      };
      break;

    case 'SET_DISCOUNT':
      newState = {
        ...state,
        discount: action.payload
      };
      break;

    case 'CLEAR_DISCOUNT':
      newState = {
        ...state,
        discount: null
      };
      break;

    default:
      return state;
  }

  // Save to localStorage after every change
  localStorage.setItem('cart', JSON.stringify(newState.cart));
  if (newState.discount) {
    localStorage.setItem('discount', JSON.stringify(newState.discount));
  } else {
    localStorage.removeItem('discount');
  }

  return newState;
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState, loadCartFromStorage);

  return (
    <CartContext.Provider value={{ ...state, dispatch }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
