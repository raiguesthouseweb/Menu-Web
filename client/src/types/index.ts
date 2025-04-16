// Menu related types
export interface MenuItem {
  id: number;
  name: string;
  price: number;
  purchasePrice?: number; // Restaurant purchase price
  category: string;
  details?: string; // Optional details field
  disabled?: boolean; // Whether the item is disabled/unavailable
}

export interface OrderItem extends MenuItem {
  quantity: number;
}

// Order related types
export interface Order {
  id: number;
  timestamp: string;
  status: string;
  name: string;
  roomNumber: string;
  mobileNumber: string;
  items: OrderItem[];
  total: number;
}

// Tourism related types
export interface TourismPlace {
  id: number;
  title: string;
  description: string;
  distance: string;
  tags: string[];
  mapsLink: string;
  photos?: string[]; // Array of Google Drive photo URLs
}

// Admin related types
export interface SheetConfig {
  spreadsheetId: string;
  sheetId: string;
}

export interface AdminSettings {
  // Export sheet configurations
  menuSheet: SheetConfig;
  ordersSheet: SheetConfig;
  tourismSheet: SheetConfig;
  
  // App settings
  orderAlertSound: boolean;
  darkMode: boolean;
  language: string;
  
  // Export settings
  exportEnabled: boolean;
  exportSpreadsheetId: string;
  exportSheetId: string;
}
