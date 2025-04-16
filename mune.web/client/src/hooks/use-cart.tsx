import { createContext, useContext, useEffect, useState } from "react";
import { MenuItem, OrderItem } from "@/types";

type OrderDetails = {
  name: string;
  roomNumber: string;
  mobileNumber: string;
};

type CartContextProps = {
  items: OrderItem[];
  addItem: (item: MenuItem) => void;
  removeItem: (itemId: number) => void;
  updateQuantity: (itemId: number, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalQuantity: () => number;
  orderDetails: OrderDetails;
  setOrderDetails: (details: OrderDetails) => void;
};

const CartContext = createContext<CartContextProps | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<OrderItem[]>(() => {
    const savedCart = localStorage.getItem("cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });
  
  const [orderDetails, setOrderDetails] = useState<OrderDetails>(() => {
    const savedDetails = localStorage.getItem("orderDetails");
    return savedDetails ? JSON.parse(savedDetails) : {
      name: "",
      roomNumber: "",
      mobileNumber: ""
    };
  });

  // Check URL for room parameter (for QR code scanning)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const roomNumber = urlParams.get("room");
    if (roomNumber) {
      setOrderDetails(prev => ({ ...prev, roomNumber }));
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items));
  }, [items]);

  // Save order details to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("orderDetails", JSON.stringify(orderDetails));
  }, [orderDetails]);

  const addItem = (item: MenuItem) => {
    setItems(prevItems => {
      const existingItem = prevItems.find(i => i.menuItemId === item.id);
      if (existingItem) {
        return prevItems.map(i => 
          i.menuItemId === item.id 
            ? { ...i, quantity: i.quantity + 1 } 
            : i
        );
      } else {
        // Create a new OrderItem with the required structure
        const orderItem: OrderItem = {
          id: Math.floor(Math.random() * 1000000), // Generate a unique ID for this order item
          menuItemId: item.id,
          name: item.name,
          price: item.price,
          purchasePrice: item.purchasePrice,
          category: item.category,
          details: item.details,
          quantity: 1
        };
        return [...prevItems, orderItem];
      }
    });
  };

  const removeItem = (itemId: number) => {
    setItems(prevItems => prevItems.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }
    
    setItems(prevItems => 
      prevItems.map(item => 
        item.id === itemId 
          ? { ...item, quantity } 
          : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalQuantity = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      getTotalPrice,
      getTotalQuantity,
      orderDetails,
      setOrderDetails
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
};