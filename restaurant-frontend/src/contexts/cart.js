import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext({
  cart: [],
  addToCart: () => {},
  removeFromCart: () => {},
  clearCart: () => {},
  getCart: () => {},
  updateQuantity: () => {},
});

const CartProvider = ({ children }) => {
  // Lấy giỏ hàng từ localStorage khi khởi tạo
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  
  // Lưu giỏ hàng vào localStorage mỗi khi thay đổi
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item) => {
    const existingItem = cart.find((cartItem) => cartItem._id === item._id);
    if (existingItem) {
      setCart(
        cart.map((cartItem) =>
          cartItem._id === item._id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem
        )
      );
    } else {
      // Nếu món ăn chưa có trong giỏ hàng, thêm mới
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const removeFromCart = (id) => {
    setCart(cart.filter((item) => item._id !== id));
  };

  const updateQuantity = (id, quantity) => {
    const item = cart.find(item => item._id === id);
    
    if (item.quantity + quantity < 1) {
      // Nếu số lượng sẽ trở thành 0, xóa sản phẩm khỏi giỏ hàng
      removeFromCart(id);
      return;
    }
    
    setCart(
      cart.map((item) =>
        item._id === id ? { ...item, quantity: Math.max(1, item.quantity + quantity) } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const getCart = () => {
    return cart;
  };

  // Tính tổng số tiền trong giỏ hàng
  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  return (
    <CartContext.Provider value={{ 
      cart, 
      addToCart, 
      removeFromCart, 
      clearCart, 
      getCart, 
      updateQuantity,
      getTotalPrice
    }}>
      {children}
    </CartContext.Provider>
  );
}

const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

export { CartProvider, useCart };