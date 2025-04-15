import { useState, useEffect } from "react";
import { MenuItem, TourismPlace, Order } from "@/types";
import { useToast } from "@/hooks/use-toast";

// Google Sheets API configuration
const MENU_SPREADSHEET_ID = import.meta.env.VITE_MENU_SPREADSHEET_ID || "default_menu_sheet_id";
const ORDERS_SPREADSHEET_ID = import.meta.env.VITE_ORDERS_SPREADSHEET_ID || "default_orders_sheet_id";
const TOURISM_SPREADSHEET_ID = import.meta.env.VITE_TOURISM_SPREADSHEET_ID || "default_tourism_sheet_id";
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || "default_api_key";

// Base URL for Google Sheets API
const SHEETS_API_BASE_URL = "https://sheets.googleapis.com/v4/spreadsheets";

// Mock data for offline development/fallback
const MOCK_MENU_ITEMS: MenuItem[] = [
  { id: 1, name: "Paneer Butter Masala", price: 220, category: "Main Course" },
  { id: 2, name: "Dal Tadka", price: 180, category: "Main Course" },
  { id: 3, name: "Jeera Rice", price: 120, category: "Rice" },
  { id: 4, name: "Butter Naan", price: 40, category: "Bread" },
  { id: 5, name: "Veg Biryani", price: 250, category: "Rice" },
  { id: 6, name: "Masala Chai", price: 30, category: "Beverages" },
  { id: 7, name: "Fresh Lime Soda", price: 60, category: "Beverages" },
  { id: 8, name: "Gulab Jamun", price: 80, category: "Dessert" },
  { id: 9, name: "Malai Kofta", price: 240, category: "Main Course" },
  { id: 10, name: "Aloo Paratha", price: 70, category: "Breakfast" },
  { id: 11, name: "Poha", price: 60, category: "Breakfast" },
  { id: 12, name: "Idli Sambar", price: 100, category: "Breakfast" }
];

const MOCK_TOURISM_PLACES: TourismPlace[] = [
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
  },
  { 
    id: 4, 
    title: "Kaliyadeh Palace", 
    description: "Historic palace on an island in the Shipra River with beautiful architecture.", 
    distance: "8.1 km",
    tags: ["Heritage", "Romantic"],
    mapsLink: "https://maps.google.com/?q=Kaliyadeh+Palace+Ujjain"
  },
  { 
    id: 5, 
    title: "Vedha Shala (Observatory)", 
    description: "Ancient observatory built by Raja Jai Singh II with astronomical instruments.", 
    distance: "5.2 km",
    tags: ["Heritage", "Educational"],
    mapsLink: "https://maps.google.com/?q=Vedha+Shala+Observatory+Ujjain"
  }
];

// Function to fetch menu items from Google Sheets
export function useMenuItems() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    async function fetchMenuItems() {
      try {
        setLoading(true);
        
        // Attempt to fetch from Google Sheets
        const response = await fetch(
          `${SHEETS_API_BASE_URL}/${MENU_SPREADSHEET_ID}/values/menu?key=${API_KEY}`
        );
        
        if (!response.ok) {
          throw new Error("Failed to fetch menu items from Google Sheets");
        }
        
        const data = await response.json();
        
        if (data && data.values && data.values.length > 1) {
          // First row should be headers
          const headers = data.values[0];
          
          // Map the rest of the rows to MenuItem objects
          const items = data.values.slice(1).map((row: any[], index: number) => {
            const item: MenuItem = {
              id: index + 1,
              name: row[headers.indexOf("name")] || `Item ${index + 1}`,
              price: parseInt(row[headers.indexOf("price")]) || 0,
              category: row[headers.indexOf("category")] || "Uncategorized"
            };
            return item;
          });
          
          setMenuItems(items);
        } else {
          // If the data structure isn't as expected, use mock data
          console.warn("Using mock menu data due to unexpected data format");
          setMenuItems(MOCK_MENU_ITEMS);
        }
      } catch (err) {
        console.error("Error fetching menu items:", err);
        setError("Failed to load menu items. Using offline data.");
        toast({
          title: "Using offline menu data",
          description: "Could not connect to the server. Using saved menu data instead.",
          variant: "destructive",
        });
        
        // Use mock data when API request fails
        setMenuItems(MOCK_MENU_ITEMS);
      } finally {
        setLoading(false);
      }
    }
    
    fetchMenuItems();
  }, [toast]);
  
  return { menuItems, loading, error, setMenuItems };
}

// Function to fetch tourism places from Google Sheets
export function useTourismPlaces() {
  const [tourismPlaces, setTourismPlaces] = useState<TourismPlace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    async function fetchTourismPlaces() {
      try {
        setLoading(true);
        
        // Attempt to fetch from Google Sheets
        const response = await fetch(
          `${SHEETS_API_BASE_URL}/${TOURISM_SPREADSHEET_ID}/values/tourism?key=${API_KEY}`
        );
        
        if (!response.ok) {
          throw new Error("Failed to fetch tourism places from Google Sheets");
        }
        
        const data = await response.json();
        
        if (data && data.values && data.values.length > 1) {
          // First row should be headers
          const headers = data.values[0];
          
          // Map the rest of the rows to TourismPlace objects
          const places = data.values.slice(1).map((row: any[], index: number) => {
            const place: TourismPlace = {
              id: index + 1,
              title: row[headers.indexOf("title")] || `Place ${index + 1}`,
              description: row[headers.indexOf("description")] || "",
              distance: row[headers.indexOf("distance")] || "Unknown",
              tags: (row[headers.indexOf("tags")] || "").split(",").map((tag: string) => tag.trim()),
              mapsLink: row[headers.indexOf("mapsLink")] || ""
            };
            return place;
          });
          
          setTourismPlaces(places);
        } else {
          // If the data structure isn't as expected, use mock data
          console.warn("Using mock tourism data due to unexpected data format");
          setTourismPlaces(MOCK_TOURISM_PLACES);
        }
      } catch (err) {
        console.error("Error fetching tourism places:", err);
        setError("Failed to load tourism places. Using offline data.");
        toast({
          title: "Using offline tourism data",
          description: "Could not connect to the server. Using saved tourism data instead.",
          variant: "destructive",
        });
        
        // Use mock data when API request fails
        setTourismPlaces(MOCK_TOURISM_PLACES);
      } finally {
        setLoading(false);
      }
    }
    
    fetchTourismPlaces();
  }, [toast]);
  
  return { tourismPlaces, loading, error };
}

// Function to fetch orders from Google Sheets
export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  const fetchOrders = async (filterBy?: string) => {
    try {
      setLoading(true);
      
      // Attempt to fetch from Google Sheets
      const response = await fetch(
        `${SHEETS_API_BASE_URL}/${ORDERS_SPREADSHEET_ID}/values/orders?key=${API_KEY}`
      );
      
      if (!response.ok) {
        throw new Error("Failed to fetch orders from Google Sheets");
      }
      
      const data = await response.json();
      
      if (data && data.values && data.values.length > 1) {
        // First row should be headers
        const headers = data.values[0];
        
        // Map the rest of the rows to Order objects
        let fetchedOrders = data.values.slice(1).map((row: any[], index: number) => {
          const itemsString = row[headers.indexOf("items")] || "[]";
          let items;
          try {
            items = JSON.parse(itemsString);
          } catch (e) {
            items = [];
          }
          
          const order: Order = {
            id: parseInt(row[headers.indexOf("id")]) || index + 1000,
            timestamp: row[headers.indexOf("timestamp")] || new Date().toISOString(),
            status: row[headers.indexOf("status")] || "Pending",
            name: row[headers.indexOf("name")] || "",
            roomNumber: row[headers.indexOf("roomNumber")] || "",
            mobileNumber: row[headers.indexOf("mobileNumber")] || "",
            items: items,
            total: parseInt(row[headers.indexOf("total")]) || 0
          };
          return order;
        });
        
        // Apply filter if provided
        if (filterBy) {
          fetchedOrders = fetchedOrders.filter(
            order => order.roomNumber === filterBy || order.mobileNumber === filterBy
          );
        }
        
        setOrders(fetchedOrders);
      } else {
        // If no data or unexpected format, use empty array or local storage
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
        title: "Using offline order data",
        description: "Could not connect to the server. Using locally saved orders instead.",
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
  
  // Function to add a new order to the sheet
  const addOrder = async (order: Omit<Order, "id" | "timestamp" | "status">) => {
    try {
      // Generate a unique ID
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
      
      // Try to push to Google Sheets
      // Note: In a production app, this would typically be done through a POST request to a backend
      // that has proper Google API credentials
      
      // Update local state
      setOrders(prev => [...prev, newOrder]);
      
      return newOrder;
    } catch (error) {
      console.error("Error adding order:", error);
      toast({
        title: "Order saved locally",
        description: "Could not submit to server. Order has been saved locally.",
        variant: "destructive",
      });
      throw error;
    }
  };
  
  // Function to update an order's status
  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      // Update local storage first
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
      
      // Try to update Google Sheets
      // Note: In a production app, this would typically be done through a PUT/PATCH request to a backend
      
      // Update local state
      setOrders(prev => 
        prev.map(order => 
          order.id === orderId 
            ? { ...order, status: newStatus } 
            : order
        )
      );
      
      return true;
    } catch (error) {
      console.error("Error updating order status:", error);
      toast({
        title: "Status updated locally",
        description: "Could not update on server. Status has been updated locally.",
        variant: "destructive",
      });
      throw error;
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
