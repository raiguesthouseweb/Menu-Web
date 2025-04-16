import { 
  User, InsertUser, 
  MenuItem, InsertMenuItem,
  Order, InsertOrder,
  TourismPlace, InsertTourismPlace,
  AdminSetting, InsertAdminSetting
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Menu methods
  getMenuItems(): Promise<MenuItem[]>;
  getMenuItem(id: number): Promise<MenuItem | undefined>;
  createMenuItem(item: InsertMenuItem): Promise<MenuItem>;
  updateMenuItem(id: number, item: Partial<InsertMenuItem>): Promise<MenuItem | undefined>;
  deleteMenuItem(id: number): Promise<boolean>;
  
  // Order methods
  getOrders(): Promise<Order[]>;
  getOrdersByRoomOrMobile(query: string): Promise<Order[]>;
  getOrder(id: number): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;
  
  // Tourism methods
  getTourismPlaces(): Promise<TourismPlace[]>;
  getTourismPlace(id: number): Promise<TourismPlace | undefined>;
  createTourismPlace(place: InsertTourismPlace): Promise<TourismPlace>;
  updateTourismPlace(id: number, place: Partial<InsertTourismPlace>): Promise<TourismPlace | undefined>;
  deleteTourismPlace(id: number): Promise<boolean>;
  
  // Admin settings methods
  getAdminSetting(key: string): Promise<AdminSetting | undefined>;
  setAdminSetting(setting: InsertAdminSetting): Promise<AdminSetting>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private menuItems: Map<number, MenuItem>;
  private orders: Map<number, Order>;
  private tourismPlaces: Map<number, TourismPlace>;
  private adminSettings: Map<string, AdminSetting>;
  
  private userCurrentId: number;
  private menuItemCurrentId: number;
  private orderCurrentId: number;
  private tourismPlaceCurrentId: number;
  private adminSettingCurrentId: number;

  constructor() {
    this.users = new Map();
    this.menuItems = new Map();
    this.orders = new Map();
    this.tourismPlaces = new Map();
    this.adminSettings = new Map();
    
    this.userCurrentId = 1;
    this.menuItemCurrentId = 1;
    this.orderCurrentId = 1;
    this.tourismPlaceCurrentId = 1;
    this.adminSettingCurrentId = 1;
    
    // Initialize with some sample data
    this.initializeData();
  }
  
  private initializeData() {
    // Sample menu items with purchase prices and details
    const menuItems: InsertMenuItem[] = [
      { 
        name: "Paneer Butter Masala", 
        price: 220, 
        purchasePrice: 180, 
        category: "Main Course",
        details: "Rich and creamy paneer curry cooked in a tomato-based gravy with butter and spices."
      },
      { 
        name: "Dal Tadka", 
        price: 180, 
        purchasePrice: 150, 
        category: "Main Course",
        details: "Yellow lentils tempered with cumin, garlic and spices."
      },
      { 
        name: "Jeera Rice", 
        price: 120, 
        purchasePrice: 100, 
        category: "Rice",
        details: "Basmati rice cooked with cumin seeds."
      },
      { 
        name: "Butter Naan", 
        price: 40, 
        purchasePrice: 30, 
        category: "Bread",
        details: "Soft leavened bread brushed with butter."
      },
      { 
        name: "Veg Biryani", 
        price: 250, 
        purchasePrice: 210, 
        category: "Rice",
        details: "Fragrant basmati rice cooked with mixed vegetables and aromatic spices."
      },
      { 
        name: "Masala Chai", 
        price: 30, 
        purchasePrice: 20, 
        category: "Beverages",
        details: "Traditional Indian tea brewed with milk and spices."
      },
      { 
        name: "Fresh Lime Soda", 
        price: 60, 
        purchasePrice: 40, 
        category: "Beverages",
        details: "Refreshing drink made with fresh lime juice, water, and soda."
      },
      { 
        name: "Gulab Jamun", 
        price: 80, 
        purchasePrice: 60, 
        category: "Dessert",
        details: "Sweet milk solid dumplings soaked in rose-flavored sugar syrup."
      },
    ];
    
    menuItems.forEach(item => this.createMenuItem(item));
    
    // Sample tourism places
    const tourismPlaces: InsertTourismPlace[] = [
      { 
        title: "Mahakaleshwar Temple", 
        description: "One of the twelve Jyotirlingas, the most sacred abodes of Lord Shiva.", 
        distance: "4.2 km",
        tags: ["Religious", "Heritage"],
        mapsLink: "https://maps.google.com/?q=Mahakaleshwar+Temple+Ujjain"
      },
      { 
        title: "Kal Bhairav Temple", 
        description: "Ancient temple dedicated to Bhairava, a fierce manifestation of Lord Shiva.", 
        distance: "3.5 km",
        tags: ["Religious"],
        mapsLink: "https://maps.google.com/?q=Kal+Bhairav+Temple+Ujjain"
      },
      { 
        title: "Ram Ghat", 
        description: "One of the most pristine ghats on the Shipra River, perfect for sunrise and sunset views.", 
        distance: "2.8 km",
        tags: ["Religious", "Romantic"],
        mapsLink: "https://maps.google.com/?q=Ram+Ghat+Ujjain"
      },
    ];
    
    tourismPlaces.forEach(place => this.createTourismPlace(place));
    
    // Admin settings
    const settings: InsertAdminSetting[] = [
      { key: "menuSpreadsheetId", value: "your-google-sheet-id-here" },
      { key: "menuSheetId", value: "0" },
      { key: "ordersSpreadsheetId", value: "your-google-sheet-id-here" },
      { key: "ordersSheetId", value: "0" },
      { key: "tourismSpreadsheetId", value: "your-google-sheet-id-here" },
      { key: "tourismSheetId", value: "0" },
    ];
    
    settings.forEach(setting => this.setAdminSetting(setting));
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Menu methods
  async getMenuItems(): Promise<MenuItem[]> {
    return Array.from(this.menuItems.values());
  }
  
  async getMenuItem(id: number): Promise<MenuItem | undefined> {
    return this.menuItems.get(id);
  }
  
  async createMenuItem(item: InsertMenuItem): Promise<MenuItem> {
    const id = this.menuItemCurrentId++;
    const menuItem: MenuItem = { ...item, id };
    this.menuItems.set(id, menuItem);
    return menuItem;
  }
  
  async updateMenuItem(id: number, item: Partial<InsertMenuItem>): Promise<MenuItem | undefined> {
    const existingItem = this.menuItems.get(id);
    if (!existingItem) return undefined;
    
    const updatedItem = { ...existingItem, ...item };
    this.menuItems.set(id, updatedItem);
    return updatedItem;
  }
  
  async deleteMenuItem(id: number): Promise<boolean> {
    return this.menuItems.delete(id);
  }
  
  // Order methods
  async getOrders(): Promise<Order[]> {
    return Array.from(this.orders.values());
  }
  
  async getOrdersByRoomOrMobile(query: string): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(
      order => order.roomNumber === query || order.mobileNumber === query
    );
  }
  
  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }
  
  async createOrder(order: InsertOrder): Promise<Order> {
    const id = this.orderCurrentId++;
    const timestamp = new Date().toISOString();
    const newOrder: Order = { ...order, id, timestamp };
    this.orders.set(id, newOrder);
    return newOrder;
  }
  
  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const existingOrder = this.orders.get(id);
    if (!existingOrder) return undefined;
    
    const updatedOrder = { ...existingOrder, status };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }
  
  // Tourism methods
  async getTourismPlaces(): Promise<TourismPlace[]> {
    return Array.from(this.tourismPlaces.values());
  }
  
  async getTourismPlace(id: number): Promise<TourismPlace | undefined> {
    return this.tourismPlaces.get(id);
  }
  
  async createTourismPlace(place: InsertTourismPlace): Promise<TourismPlace> {
    const id = this.tourismPlaceCurrentId++;
    const tourismPlace: TourismPlace = { ...place, id };
    this.tourismPlaces.set(id, tourismPlace);
    return tourismPlace;
  }
  
  async updateTourismPlace(id: number, place: Partial<InsertTourismPlace>): Promise<TourismPlace | undefined> {
    const existingPlace = this.tourismPlaces.get(id);
    if (!existingPlace) return undefined;
    
    const updatedPlace = { ...existingPlace, ...place };
    this.tourismPlaces.set(id, updatedPlace);
    return updatedPlace;
  }
  
  async deleteTourismPlace(id: number): Promise<boolean> {
    return this.tourismPlaces.delete(id);
  }
  
  // Admin settings methods
  async getAdminSetting(key: string): Promise<AdminSetting | undefined> {
    return this.adminSettings.get(key);
  }
  
  async setAdminSetting(setting: InsertAdminSetting): Promise<AdminSetting> {
    const id = this.adminSettingCurrentId++;
    const adminSetting: AdminSetting = { ...setting, id };
    this.adminSettings.set(setting.key, adminSetting);
    return adminSetting;
  }
}

export const storage = new MemStorage();
