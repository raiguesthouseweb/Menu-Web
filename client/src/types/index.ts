// Menu related types
export interface MenuItem {
  id: number;
  name: string;
  price: number;
  category: string;
  details?: string; // Optional details field
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
}

// Admin related types
export interface SheetConfig {
  spreadsheetId: string;
  sheetId: string;
}

export interface AdminSettings {
  menuSheet: SheetConfig;
  ordersSheet: SheetConfig;
  tourismSheet: SheetConfig;
}
