import { useState, useEffect } from "react";
import { MenuItem, TourismPlace, Order } from "@/types";
import { useToast } from "@/hooks/use-toast";

// Configuration for Google Apps Script Web App
// Replace this URL with your deployed Apps Script Web App URL
const DEFAULT_APPS_SCRIPT_URL = "https://script.google.com/macros/s/YOUR_DEPLOYED_SCRIPT_ID/exec";

// Get the Apps Script URL from localStorage or environment variable
const getAppsScriptUrl = () => {
  return localStorage.getItem("adminSettings")
    ? JSON.parse(localStorage.getItem("adminSettings") || "{}")?.appsScriptUrl || DEFAULT_APPS_SCRIPT_URL
    : DEFAULT_APPS_SCRIPT_URL;
};

// Default data for fallback
const DEFAULT_MENU_ITEMS: MenuItem[] = [
  { id: 1, name: "Paneer Butter Masala", price: 220, category: "Main Course" },
  { id: 2, name: "Dal Tadka", price: 180, category: "Main Course" },
  { id: 3, name: "Jeera Rice", price: 120, category: "Rice" },
  { id: 4, name: "Butter Naan", price: 40, category: "Bread" },
  { id: 5, name: "Veg Biryani", price: 250, category: "Rice" },
  { id: 6, name: "Masala Chai", price: 30, category: "Beverages" },
  { id: 7, name: "Fresh Lime Soda", price: 60, category: "Beverages" },
  { id: 8, name: "Gulab Jamun", price: 80, category: "Dessert" }
];

const DEFAULT_TOURISM_PLACES: TourismPlace[] = [
  { 
    id: 1, 
    title: "Mahakaleshwar Temple", 
    description: "One of the twelve Jyotirlingas, the most sacred abodes of Lord Shiva.", 
    distance: "4.2 km",
    tags: ["Religious", "Heritage"],
    mapsLink: "https://maps.google.com/?q=Mahakaleshwar+Temple+Ujjain"
  },
  { 
    id: 2, 
    title: "Kal Bhairav Temple", 
    description: "Ancient temple dedicated to Bhairava, a fierce manifestation of Lord Shiva.", 
    distance: "3.5 km",
    tags: ["Religious"],
    mapsLink: "https://maps.google.com/?q=Kal+Bhairav+Temple+Ujjain"
  },
  { 
    id: 3, 
    title: "Ram Ghat", 
    description: "One of the most pristine ghats on the Shipra River, perfect for sunrise and sunset views.", 
    distance: "2.8 km",
    tags: ["Religious", "Romantic"],
    mapsLink: "https://maps.google.com/?q=Ram+Ghat+Ujjain"
  }
];

// Function to fetch menu items from Apps Script
export function useMenuItems() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    async function fetchMenuItems() {
      try {
        setLoading(true);
        
        const scriptUrl = getAppsScriptUrl();
        if (!scriptUrl || scriptUrl.includes("YOUR_DEPLOYED_SCRIPT_ID")) {
          console.warn("Apps Script URL not configured. Using default menu data.");
          setMenuItems(DEFAULT_MENU_ITEMS);
          return;
        }
        
        const url = `${scriptUrl}?action=getMenu`;
        console.log("Fetching menu from Apps Script:", url);
        
        const response = await fetch(url);
        if (!response.ok) {
          console.error("Apps Script API error:", await response.text());
          throw new Error(`Failed to fetch menu items (Status ${response.status})`);
        }
        
        const data = await response.json();
        
        if (data && data.items && Array.isArray(data.items)) {
          setMenuItems(data.items);
          console.log("Successfully loaded menu items:", data.items.length);
        } else if (data && data.error) {
          throw new Error(data.error);
        } else {
          console.warn("Unexpected data format from Apps Script:", data);
          setMenuItems(DEFAULT_MENU_ITEMS);
        }
      } catch (err) {
        console.error("Error fetching menu items:", err);
        setError("Failed to load menu items. Using default data.");
        toast({
          title: "Using default menu data",
          description: "Could not load menu from Google Sheets. Check your Apps Script settings.",
          variant: "destructive",
        });
        
        // Use default data when API request fails
        setMenuItems(DEFAULT_MENU_ITEMS);
      } finally {
        setLoading(false);
      }
    }
    
    fetchMenuItems();
    
    // Set up interval to refresh data periodically
    const intervalId = setInterval(fetchMenuItems, 60000); // Refresh every minute
    
    // Clean up interval
    return () => clearInterval(intervalId);
  }, [toast]);
  
  // Function to create a new menu item
  const createMenuItem = async (item: Omit<MenuItem, "id">) => {
    try {
      const scriptUrl = getAppsScriptUrl();
      if (!scriptUrl || scriptUrl.includes("YOUR_DEPLOYED_SCRIPT_ID")) {
        throw new Error("Apps Script URL not configured");
      }
      
      const response = await fetch(scriptUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'createMenuItem',
          ...item
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create menu item (Status ${response.status})`);
      }
      
      const data = await response.json();
      
      if (data && data.success && data.item) {
        // Update local state
        setMenuItems(prev => [...prev, data.item]);
        return data.item;
      } else if (data && data.error) {
        throw new Error(data.error);
      } else {
        throw new Error("Unexpected response from server");
      }
    } catch (error) {
      console.error("Error creating menu item:", error);
      toast({
        title: "Error creating menu item",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
      throw error;
    }
  };
  
  // Function to update a menu item
  const updateMenuItem = async (id: number, item: Partial<MenuItem>) => {
    try {
      const scriptUrl = getAppsScriptUrl();
      if (!scriptUrl || scriptUrl.includes("YOUR_DEPLOYED_SCRIPT_ID")) {
        // Update locally if Apps Script is not configured
        setMenuItems(prev => prev.map(menuItem => 
          menuItem.id === id ? { ...menuItem, ...item } : menuItem
        ));
        
        return { id, ...item };
      }
      
      const response = await fetch(scriptUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'updateMenuItem',
          id,
          ...item
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update menu item (Status ${response.status})`);
      }
      
      const data = await response.json();
      
      if (data && data.success && data.item) {
        // Update local state
        setMenuItems(prev => prev.map(menuItem => 
          menuItem.id === id ? { ...menuItem, ...data.item } : menuItem
        ));
        return data.item;
      } else if (data && data.error) {
        throw new Error(data.error);
      } else {
        throw new Error("Unexpected response from server");
      }
    } catch (error) {
      console.error("Error updating menu item:", error);
      
      // Still update locally even if the API call fails
      setMenuItems(prev => prev.map(menuItem => 
        menuItem.id === id ? { ...menuItem, ...item } : menuItem
      ));
      
      toast({
        title: "Warning: Local changes only",
        description: "Changes saved locally only. Server update failed.",
        variant: "destructive",
      });
      
      return { id, ...item };
    }
  };
  
  // Function to delete a menu item
  const deleteMenuItem = async (id: number) => {
    try {
      const scriptUrl = getAppsScriptUrl();
      if (!scriptUrl || scriptUrl.includes("YOUR_DEPLOYED_SCRIPT_ID")) {
        // Delete locally if Apps Script is not configured
        setMenuItems(prev => prev.filter(item => item.id !== id));
        return true;
      }
      
      const response = await fetch(scriptUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'deleteMenuItem',
          id
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete menu item (Status ${response.status})`);
      }
      
      const data = await response.json();
      
      if (data && data.success) {
        // Update local state
        setMenuItems(prev => prev.filter(item => item.id !== id));
        return true;
      } else if (data && data.error) {
        throw new Error(data.error);
      } else {
        throw new Error("Unexpected response from server");
      }
    } catch (error) {
      console.error("Error deleting menu item:", error);
      
      // Still delete locally even if the API call fails
      setMenuItems(prev => prev.filter(item => item.id !== id));
      
      toast({
        title: "Warning: Local deletion only",
        description: "Item removed locally only. Server update failed.",
        variant: "destructive",
      });
      
      return true;
    }
  };
  
  return { menuItems, loading, error, setMenuItems, createMenuItem, updateMenuItem, deleteMenuItem };
}

// Function to fetch tourism places
export function useTourismPlaces() {
  const [tourismPlaces, setTourismPlaces] = useState<TourismPlace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    async function fetchTourismPlaces() {
      try {
        setLoading(true);
        
        const scriptUrl = getAppsScriptUrl();
        if (!scriptUrl || scriptUrl.includes("YOUR_DEPLOYED_SCRIPT_ID")) {
          console.warn("Apps Script URL not configured. Using default tourism data.");
          setTourismPlaces(DEFAULT_TOURISM_PLACES);
          return;
        }
        
        const url = `${scriptUrl}?action=getTourism`;
        console.log("Fetching tourism data from Apps Script:", url);
        
        const response = await fetch(url);
        if (!response.ok) {
          console.error("Apps Script API error:", await response.text());
          throw new Error(`Failed to fetch tourism places (Status ${response.status})`);
        }
        
        const data = await response.json();
        
        if (data && data.places && Array.isArray(data.places)) {
          setTourismPlaces(data.places);
          console.log("Successfully loaded tourism places:", data.places.length);
        } else if (data && data.error) {
          throw new Error(data.error);
        } else {
          console.warn("Unexpected data format from Apps Script:", data);
          setTourismPlaces(DEFAULT_TOURISM_PLACES);
        }
      } catch (err) {
        console.error("Error fetching tourism places:", err);
        setError("Failed to load tourism places. Using default data.");
        toast({
          title: "Using default tourism data",
          description: "Could not load tourism data from Google Sheets. Check your Apps Script settings.",
          variant: "destructive",
        });
        
        // Use default data when API request fails
        setTourismPlaces(DEFAULT_TOURISM_PLACES);
      } finally {
        setLoading(false);
      }
    }
    
    fetchTourismPlaces();
    
    // Set up interval to refresh data periodically
    const intervalId = setInterval(fetchTourismPlaces, 300000); // Refresh every 5 minutes
    
    // Clean up interval
    return () => clearInterval(intervalId);
  }, [toast]);
  
  // Function to create a new tourism place
  const createTourismPlace = async (place: Omit<TourismPlace, "id">) => {
    try {
      const scriptUrl = getAppsScriptUrl();
      if (!scriptUrl || scriptUrl.includes("YOUR_DEPLOYED_SCRIPT_ID")) {
        throw new Error("Apps Script URL not configured");
      }
      
      const response = await fetch(scriptUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'createTourismPlace',
          ...place
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create tourism place (Status ${response.status})`);
      }
      
      const data = await response.json();
      
      if (data && data.success && data.place) {
        // Update local state
        setTourismPlaces(prev => [...prev, data.place]);
        return data.place;
      } else if (data && data.error) {
        throw new Error(data.error);
      } else {
        throw new Error("Unexpected response from server");
      }
    } catch (error) {
      console.error("Error creating tourism place:", error);
      toast({
        title: "Error creating tourism place",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
      throw error;
    }
  };
  
  // Function to update a tourism place
  const updateTourismPlace = async (id: number, place: Partial<TourismPlace>) => {
    try {
      const scriptUrl = getAppsScriptUrl();
      if (!scriptUrl || scriptUrl.includes("YOUR_DEPLOYED_SCRIPT_ID")) {
        // Update locally if Apps Script is not configured
        setTourismPlaces(prev => prev.map(tourismPlace => 
          tourismPlace.id === id ? { ...tourismPlace, ...place } : tourismPlace
        ));
        
        return { id, ...place };
      }
      
      const response = await fetch(scriptUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'updateTourismPlace',
          id,
          ...place
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update tourism place (Status ${response.status})`);
      }
      
      const data = await response.json();
      
      if (data && data.success && data.place) {
        // Update local state
        setTourismPlaces(prev => prev.map(tourismPlace => 
          tourismPlace.id === id ? { ...tourismPlace, ...data.place } : tourismPlace
        ));
        return data.place;
      } else if (data && data.error) {
        throw new Error(data.error);
      } else {
        throw new Error("Unexpected response from server");
      }
    } catch (error) {
      console.error("Error updating tourism place:", error);
      
      // Still update locally even if the API call fails
      setTourismPlaces(prev => prev.map(tourismPlace => 
        tourismPlace.id === id ? { ...tourismPlace, ...place } : tourismPlace
      ));
      
      toast({
        title: "Warning: Local changes only",
        description: "Changes saved locally only. Server update failed.",
        variant: "destructive",
      });
      
      return { id, ...place };
    }
  };
  
  // Function to delete a tourism place
  const deleteTourismPlace = async (id: number) => {
    try {
      const scriptUrl = getAppsScriptUrl();
      if (!scriptUrl || scriptUrl.includes("YOUR_DEPLOYED_SCRIPT_ID")) {
        // Delete locally if Apps Script is not configured
        setTourismPlaces(prev => prev.filter(place => place.id !== id));
        return true;
      }
      
      const response = await fetch(scriptUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'deleteTourismPlace',
          id
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete tourism place (Status ${response.status})`);
      }
      
      const data = await response.json();
      
      if (data && data.success) {
        // Update local state
        setTourismPlaces(prev => prev.filter(place => place.id !== id));
        return true;
      } else if (data && data.error) {
        throw new Error(data.error);
      } else {
        throw new Error("Unexpected response from server");
      }
    } catch (error) {
      console.error("Error deleting tourism place:", error);
      
      // Still delete locally even if the API call fails
      setTourismPlaces(prev => prev.filter(place => place.id !== id));
      
      toast({
        title: "Warning: Local deletion only",
        description: "Item removed locally only. Server update failed.",
        variant: "destructive",
      });
      
      return true;
    }
  };
  
  return { tourismPlaces, loading, error, createTourismPlace, updateTourismPlace, deleteTourismPlace };
}

// Function to fetch and manage orders
export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  const fetchOrders = async (filterBy?: string) => {
    try {
      setLoading(true);
      
      const scriptUrl = getAppsScriptUrl();
      if (!scriptUrl || scriptUrl.includes("YOUR_DEPLOYED_SCRIPT_ID")) {
        console.warn("Apps Script URL not configured. Using locally stored orders.");
        
        // Try to use locally stored orders
        const savedOrders = localStorage.getItem("orders");
        if (savedOrders) {
          let parsedOrders = JSON.parse(savedOrders);
          
          // Apply filter if provided
          if (filterBy) {
            parsedOrders = parsedOrders.filter(
              (order: Order) => order.roomNumber === filterBy || order.mobileNumber === filterBy
            );
          }
          
          setOrders(parsedOrders);
        } else {
          setOrders([]);
        }
        return;
      }
      
      const url = `${scriptUrl}?action=getOrders${filterBy ? `&filterBy=${encodeURIComponent(filterBy)}` : ''}`;
      console.log("Fetching orders from Apps Script:", url);
      
      const response = await fetch(url);
      if (!response.ok) {
        console.error("Apps Script API error:", await response.text());
        throw new Error(`Failed to fetch orders (Status ${response.status})`);
      }
      
      const data = await response.json();
      
      if (data && data.orders && Array.isArray(data.orders)) {
        setOrders(data.orders);
        console.log("Successfully loaded orders:", data.orders.length);
        
        // Also store orders locally for offline access
        localStorage.setItem("orders", JSON.stringify(data.orders));
      } else if (data && data.error) {
        throw new Error(data.error);
      } else {
        console.warn("Unexpected data format from Apps Script:", data);
        
        // If no data or unexpected format, use local storage
        const savedOrders = localStorage.getItem("orders");
        if (savedOrders) {
          let parsedOrders = JSON.parse(savedOrders);
          
          // Apply filter if provided
          if (filterBy) {
            parsedOrders = parsedOrders.filter(
              (order: Order) => order.roomNumber === filterBy || order.mobileNumber === filterBy
            );
          }
          
          setOrders(parsedOrders);
        } else {
          setOrders([]);
        }
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Failed to load orders. Using locally stored data.");
      toast({
        title: "Using locally stored orders",
        description: "Could not load orders from Google Sheets. Check your Apps Script settings.",
        variant: "destructive",
      });
      
      // Try to use locally stored orders as fallback
      const savedOrders = localStorage.getItem("orders");
      if (savedOrders) {
        let parsedOrders = JSON.parse(savedOrders);
        
        // Apply filter if provided
        if (filterBy) {
          parsedOrders = parsedOrders.filter(
            (order: Order) => order.roomNumber === filterBy || order.mobileNumber === filterBy
          );
        }
        
        setOrders(parsedOrders);
      } else {
        setOrders([]);
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Initial fetch
  useEffect(() => {
    fetchOrders();
    
    // Set up interval to refresh orders
    const intervalId = setInterval(() => fetchOrders(), 30000); // Refresh every 30 seconds
    
    // Clean up interval
    return () => clearInterval(intervalId);
  }, []);
  
  // Function to add a new order
  const addOrder = async (order: Omit<Order, "id" | "timestamp" | "status">) => {
    try {
      const scriptUrl = getAppsScriptUrl();
      if (!scriptUrl || scriptUrl.includes("YOUR_DEPLOYED_SCRIPT_ID")) {
        // Create order locally if Apps Script is not configured
        const id = Date.now();
        const timestamp = new Date().toISOString();
        
        const newOrder: Order = {
          ...order,
          id,
          timestamp,
          status: "Pending"
        };
        
        // Store locally for offline access
        const savedOrders = localStorage.getItem("orders");
        const parsedOrders = savedOrders ? JSON.parse(savedOrders) : [];
        localStorage.setItem("orders", JSON.stringify([...parsedOrders, newOrder]));
        
        // Update state
        setOrders(prev => [...prev, newOrder]);
        
        return newOrder;
      }
      
      const response = await fetch(scriptUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'createOrder',
          ...order
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create order (Status ${response.status})`);
      }
      
      const data = await response.json();
      
      if (data && data.success && data.order) {
        // Update local state
        setOrders(prev => [...prev, data.order]);
        
        // Also update local storage
        const savedOrders = localStorage.getItem("orders");
        const parsedOrders = savedOrders ? JSON.parse(savedOrders) : [];
        localStorage.setItem("orders", JSON.stringify([...parsedOrders, data.order]));
        
        // Play notification sound if enabled
        const settings = JSON.parse(localStorage.getItem("adminSettings") || "{}");
        if (settings.orderAlertSound) {
          try {
            const audio = new Audio('/notification.mp3');
            audio.play();
          } catch (e) {
            console.warn("Could not play notification sound", e);
          }
        }
        
        return data.order;
      } else if (data && data.error) {
        throw new Error(data.error);
      } else {
        throw new Error("Unexpected response from server");
      }
    } catch (error) {
      console.error("Error creating order:", error);
      
      // Still create order locally
      const id = Date.now();
      const timestamp = new Date().toISOString();
      
      const newOrder: Order = {
        ...order,
        id,
        timestamp,
        status: "Pending"
      };
      
      // Store locally for offline access
      const savedOrders = localStorage.getItem("orders");
      const parsedOrders = savedOrders ? JSON.parse(savedOrders) : [];
      localStorage.setItem("orders", JSON.stringify([...parsedOrders, newOrder]));
      
      // Update state
      setOrders(prev => [...prev, newOrder]);
      
      toast({
        title: "Order saved locally only",
        description: "Could not submit to server. Order has been saved locally.",
        variant: "destructive",
      });
      
      return newOrder;
    }
  };
  
  // Function to update an order's status
  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      const scriptUrl = getAppsScriptUrl();
      if (!scriptUrl || scriptUrl.includes("YOUR_DEPLOYED_SCRIPT_ID")) {
        // Update locally if Apps Script is not configured
        setOrders(prev => 
          prev.map(order => 
            order.id === orderId 
              ? { ...order, status: newStatus } 
              : order
          )
        );
        
        // Update local storage
        const savedOrders = localStorage.getItem("orders");
        if (savedOrders) {
          const parsedOrders = JSON.parse(savedOrders);
          const updatedOrders = parsedOrders.map((order: Order) => {
            if (order.id === orderId) {
              return { ...order, status: newStatus };
            }
            return order;
          });
          localStorage.setItem("orders", JSON.stringify(updatedOrders));
        }
        
        return true;
      }
      
      const response = await fetch(scriptUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'updateOrderStatus',
          orderId,
          status: newStatus
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update order status (Status ${response.status})`);
      }
      
      const data = await response.json();
      
      if (data && data.success) {
        // Update local state
        setOrders(prev => 
          prev.map(order => 
            order.id === orderId 
              ? { ...order, status: newStatus } 
              : order
          )
        );
        
        // Update local storage
        const savedOrders = localStorage.getItem("orders");
        if (savedOrders) {
          const parsedOrders = JSON.parse(savedOrders);
          const updatedOrders = parsedOrders.map((order: Order) => {
            if (order.id === orderId) {
              return { ...order, status: newStatus };
            }
            return order;
          });
          localStorage.setItem("orders", JSON.stringify(updatedOrders));
        }
        
        return true;
      } else if (data && data.error) {
        throw new Error(data.error);
      } else {
        throw new Error("Unexpected response from server");
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      
      // Still update locally
      setOrders(prev => 
        prev.map(order => 
          order.id === orderId 
            ? { ...order, status: newStatus } 
            : order
        )
      );
      
      // Update local storage
      const savedOrders = localStorage.getItem("orders");
      if (savedOrders) {
        const parsedOrders = JSON.parse(savedOrders);
        const updatedOrders = parsedOrders.map((order: Order) => {
          if (order.id === orderId) {
            return { ...order, status: newStatus };
          }
          return order;
        });
        localStorage.setItem("orders", JSON.stringify(updatedOrders));
      }
      
      toast({
        title: "Status updated locally only",
        description: "Could not update status on the server. Status has been updated locally.",
        variant: "destructive",
      });
      
      return true;
    }
  };
  
  return { 
    orders, 
    loading, 
    error, 
    fetchOrders, 
    addOrder, 
    updateOrderStatus 
  };
}