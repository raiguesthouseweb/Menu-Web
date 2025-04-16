import { useState, useEffect } from "react";
import { MenuItem, TourismPlace, Order } from "@/types";
import { useToast } from "@/hooks/use-toast";

// Configuration for Google Apps Script Web App
// Replace this URL with your deployed Apps Script Web App URL
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/YOUR_DEPLOYED_SCRIPT_ID/exec";

// Fallback to direct Google Sheets API if Apps Script deployment is not yet set up
const getScriptUrl = () => {
  return localStorage.getItem("adminSettings")
    ? JSON.parse(localStorage.getItem("adminSettings") || "{}")?.appsScriptUrl || APPS_SCRIPT_URL
    : APPS_SCRIPT_URL;
};

// Default data for fallback
const DEFAULT_MENU_ITEMS: MenuItem[] = [
  { id: 1, name: "Paneer Butter Masala", price: 220, category: "Main Course", details: "Rich and creamy paneer curry with tomato gravy" },
  { id: 2, name: "Dal Tadka", price: 180, category: "Main Course", details: "Yellow lentils tempered with cumin, garlic and spices" },
  { id: 3, name: "Jeera Rice", price: 120, category: "Rice", details: "Fragrant basmati rice cooked with cumin seeds" },
  { id: 4, name: "Butter Naan", price: 40, category: "Bread", details: "Soft leavened bread from tandoor, brushed with butter" },
  { id: 5, name: "Veg Biryani", price: 250, category: "Rice", details: "Aromatic rice dish with mixed vegetables and spices" },
  { id: 6, name: "Masala Chai", price: 30, category: "Beverages", details: "Spiced Indian tea with cardamom, ginger and cinnamon" },
  { id: 7, name: "Fresh Lime Soda", price: 60, category: "Beverages", details: "Refreshing drink with fresh lime juice and soda water" },
  { id: 8, name: "Gulab Jamun", price: 80, category: "Dessert", details: "Deep-fried milk solids soaked in sugar syrup" }
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

// Helper to validate if spreadsheet ID exists and is valid format
const isValidSpreadsheetId = (id: string | undefined | null): boolean => {
  return !!id && id.length > 10 && id !== "default_menu_sheet_id" && 
    id !== "default_orders_sheet_id" && id !== "default_tourism_sheet_id";
};

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
        
        const spreadsheetId = getMenuSpreadsheetId();
        const sheetId = getSheetId("menu");
        
        // Validate spreadsheet ID and API key
        if (!isValidSpreadsheetId(spreadsheetId) || !API_KEY) {
          console.warn("Invalid spreadsheet ID or missing API key. Using default menu data.");
          setMenuItems(DEFAULT_MENU_ITEMS);
          return;
        }
        
        const url = `${SHEETS_API_BASE_URL}/${spreadsheetId}/values/Sheet${sheetId}?key=${API_KEY}`;
        console.log("Fetching menu from:", url);
        
        // Attempt to fetch from Google Sheets
        const response = await fetch(url);
        
        if (!response.ok) {
          console.error("Sheet API error:", await response.text());
          throw new Error(`Failed to fetch menu items (Status ${response.status})`);
        }
        
        const data = await response.json();
        
        if (data && data.values && data.values.length > 1) {
          // First row should be headers
          const headers = data.values[0];
          const nameIdx = headers.indexOf("name");
          const priceIdx = headers.indexOf("price");
          const categoryIdx = headers.indexOf("category");
          const detailsIdx = headers.indexOf("details");
          
          // Check if we have the required columns
          if (nameIdx === -1 || priceIdx === -1 || categoryIdx === -1) {
            console.warn("Required columns missing in sheet. Looking for: name, price, category");
            setMenuItems(DEFAULT_MENU_ITEMS);
            return;
          }
          
          // Map the rest of the rows to MenuItem objects
          const items = data.values.slice(1).map((row: any[], index: number) => {
            const item: MenuItem = {
              id: index + 1,
              name: row[nameIdx] || `Item ${index + 1}`,
              price: parseInt(row[priceIdx]) || 0,
              category: row[categoryIdx] || "Uncategorized",
              details: detailsIdx !== -1 ? row[detailsIdx] || "" : undefined
            };
            return item;
          });
          
          setMenuItems(items);
          console.log("Successfully loaded menu items:", items.length);
        } else {
          console.warn("Unexpected data format from sheet:", data);
          setMenuItems(DEFAULT_MENU_ITEMS);
        }
      } catch (err) {
        console.error("Error fetching menu items:", err);
        setError("Failed to load menu items. Using default data.");
        toast({
          title: "Using default menu data",
          description: "Could not load menu from Google Sheets. Check your API key and spreadsheet settings.",
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
        
        const spreadsheetId = getTourismSpreadsheetId();
        const sheetId = getSheetId("tourism");
        
        // Validate spreadsheet ID and API key
        if (!isValidSpreadsheetId(spreadsheetId) || !API_KEY) {
          console.warn("Invalid tourism spreadsheet ID or missing API key. Using default tourism data.");
          setTourismPlaces(DEFAULT_TOURISM_PLACES);
          return;
        }
        
        const url = `${SHEETS_API_BASE_URL}/${spreadsheetId}/values/Sheet${sheetId}?key=${API_KEY}`;
        console.log("Fetching tourism from:", url);
        
        // Attempt to fetch from Google Sheets
        const response = await fetch(url);
        
        if (!response.ok) {
          console.error("Sheet API error:", await response.text());
          throw new Error(`Failed to fetch tourism places (Status ${response.status})`);
        }
        
        const data = await response.json();
        
        if (data && data.values && data.values.length > 1) {
          // First row should be headers
          const headers = data.values[0];
          const titleIdx = headers.indexOf("title");
          const descriptionIdx = headers.indexOf("description");
          const distanceIdx = headers.indexOf("distance");
          const tagsIdx = headers.indexOf("tags");
          const mapsLinkIdx = headers.indexOf("mapsLink");
          
          // Check if we have the required columns
          if (titleIdx === -1 || descriptionIdx === -1) {
            console.warn("Required columns missing in tourism sheet. Looking for: title, description");
            setTourismPlaces(DEFAULT_TOURISM_PLACES);
            return;
          }
          
          // Map the rest of the rows to TourismPlace objects
          const places = data.values.slice(1).map((row: any[], index: number) => {
            const place: TourismPlace = {
              id: index + 1,
              title: row[titleIdx] || `Place ${index + 1}`,
              description: row[descriptionIdx] || "",
              distance: distanceIdx !== -1 ? (row[distanceIdx] || "Unknown") : "Unknown",
              tags: tagsIdx !== -1 ? (row[tagsIdx] || "").split(",").map((tag: string) => tag.trim()) : [],
              mapsLink: mapsLinkIdx !== -1 ? (row[mapsLinkIdx] || "") : ""
            };
            return place;
          });
          
          setTourismPlaces(places);
          console.log("Successfully loaded tourism places:", places.length);
        } else {
          console.warn("Unexpected data format from tourism sheet:", data);
          setTourismPlaces(DEFAULT_TOURISM_PLACES);
        }
      } catch (err) {
        console.error("Error fetching tourism places:", err);
        setError("Failed to load tourism places. Using default data.");
        toast({
          title: "Using default tourism data",
          description: "Could not load tourism data from Google Sheets. Check your API key and spreadsheet settings.",
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
      
      const spreadsheetId = getOrdersSpreadsheetId();
      const sheetId = getSheetId("orders");
      
      // Validate spreadsheet ID and API key
      if (!isValidSpreadsheetId(spreadsheetId) || !API_KEY) {
        console.warn("Invalid orders spreadsheet ID or missing API key. Using locally stored orders.");
        
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
      
      const url = `${SHEETS_API_BASE_URL}/${spreadsheetId}/values/Sheet${sheetId}?key=${API_KEY}`;
      console.log("Fetching orders from:", url);
      
      // Attempt to fetch from Google Sheets
      const response = await fetch(url);
      
      if (!response.ok) {
        console.error("Sheet API error:", await response.text());
        throw new Error(`Failed to fetch orders (Status ${response.status})`);
      }
      
      const data = await response.json();
      
      if (data && data.values && data.values.length > 1) {
        // First row should be headers
        const headers = data.values[0];
        const idIdx = headers.indexOf("id");
        const timestampIdx = headers.indexOf("timestamp");
        const statusIdx = headers.indexOf("status");
        const nameIdx = headers.indexOf("name");
        const roomNumberIdx = headers.indexOf("roomNumber");
        const mobileNumberIdx = headers.indexOf("mobileNumber");
        const itemsIdx = headers.indexOf("items");
        const totalIdx = headers.indexOf("total");
        
        // Check if we have the required columns
        if (roomNumberIdx === -1 || mobileNumberIdx === -1) {
          console.warn("Required columns missing in orders sheet. Minimum required: roomNumber, mobileNumber");
          
          // Fall back to local storage
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
        
        // Map the rest of the rows to Order objects
        let fetchedOrders = data.values.slice(1).map((row: any[], index: number) => {
          // Parse items safely
          let items = [];
          if (itemsIdx !== -1 && row[itemsIdx]) {
            try {
              items = JSON.parse(row[itemsIdx]);
            } catch (e) {
              console.warn("Failed to parse items JSON for order", index);
            }
          }
          
          const order: Order = {
            id: idIdx !== -1 && row[idIdx] ? parseInt(row[idIdx]) : index + 1000,
            timestamp: timestampIdx !== -1 ? (row[timestampIdx] || new Date().toISOString()) : new Date().toISOString(),
            status: statusIdx !== -1 ? (row[statusIdx] || "Pending") : "Pending",
            name: nameIdx !== -1 ? (row[nameIdx] || "") : "",
            roomNumber: row[roomNumberIdx] || "",
            mobileNumber: row[mobileNumberIdx] || "",
            items: items,
            total: totalIdx !== -1 && row[totalIdx] ? parseInt(row[totalIdx]) : 0
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
        console.log("Successfully loaded orders:", fetchedOrders.length);
        
        // Also store orders locally for offline access
        localStorage.setItem("orders", JSON.stringify(fetchedOrders));
      } else {
        console.warn("Unexpected data format from orders sheet or empty sheet:", data);
        
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
        description: "Could not load orders from Google Sheets. Check your API key and spreadsheet settings.",
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
      // In a production app with proper authentication, we would post to a backend
      // that would use the Google Sheets API to append the row
      
      // Update local state
      setOrders(prev => [...prev, newOrder]);
      
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
      
      return newOrder;
    } catch (error) {
      console.error("Error adding order:", error);
      toast({
        title: "Order saved locally only",
        description: "Could not submit to Google Sheets. Order has been saved locally.",
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
      // In a production app with proper authentication, we would send a request 
      // to a backend that would update the corresponding row in the sheet
      
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
        title: "Status updated locally only",
        description: "Could not update status in Google Sheets. Status has been updated locally.",
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
