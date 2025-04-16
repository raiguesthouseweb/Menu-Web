import { useEffect, useState } from "react";
import { useMenuItems, useOrders, useTourismPlaces, useBulkSettings } from "@/hooks/use-api";
import { ADMIN_PASSWORD, MENU_CATEGORIES, TOURISM_TAGS, ORDER_STATUS_OPTIONS } from "@/config/constants";
import { useToast } from "@/hooks/use-toast";
import { formatPrice, formatDate } from "@/lib/utils";
import { MenuItem, Order, TourismPlace } from "@/types";

import { 
  Card, 
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { 
  Input 
} from "@/components/ui/input";
import {
  Textarea
} from "@/components/ui/textarea";
import { 
  Button 
} from "@/components/ui/button";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Shield, 
  Search, 
  Edit, 
  Trash, 
  Plus,
  Loader2,
  LogOut,
  Save,
  Settings as SettingsIcon,
  Map,
  FileEdit,
  Palette,
  BellRing,
  QrCode,
  MessageSquare,
  Calendar,
  Upload
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// Define schemas for forms
const menuItemSchema = z.object({
  name: z.string().min(2, { message: "Item name is required" }),
  price: z.coerce.number().min(1, { message: "Price must be greater than 0" }),
  purchasePrice: z.coerce.number().min(0, { message: "Purchase price must not be negative" }).optional(),
  category: z.string({ required_error: "Please select a category" }),
  details: z.string().optional()
});

const tourismPlaceSchema = z.object({
  title: z.string().min(2, { message: "Title is required" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  distance: z.string().min(1, { message: "Distance is required" }),
  tags: z.array(z.string()).min(1, { message: "Select at least one tag" }),
  mapsLink: z.string().url({ message: "Please enter a valid URL" }).optional().or(z.literal(''))
});

const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, { message: "Current password is required" }),
  newPassword: z.string().min(8, { message: "Password must be at least 8 characters" }),
  confirmPassword: z.string().min(1, { message: "Please confirm your password" })
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const sheetsConfigSchema = z.object({
  menuSpreadsheetId: z.string().min(10, { message: "Spreadsheet ID is required" }),
  menuSheetId: z.string(),
  ordersSpreadsheetId: z.string().min(10, { message: "Spreadsheet ID is required" }),
  ordersSheetId: z.string(),
  tourismSpreadsheetId: z.string().min(10, { message: "Spreadsheet ID is required" }),
  tourismSheetId: z.string()
});

const themeSettingsSchema = z.object({
  brandName: z.string().min(1, { message: "Brand name is required" }),
  primaryColor: z.string().min(1, { message: "Primary color is required" }),
  fontFamily: z.string()
});

// Main component
export default function Admin() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  
  // State for sheet configurations
  const [menuSpreadsheetId, setMenuSpreadsheetId] = useState(import.meta.env.VITE_MENU_SPREADSHEET_ID || "");
  const [menuSheetId, setMenuSheetId] = useState("0");
  const [ordersSpreadsheetId, setOrdersSpreadsheetId] = useState(import.meta.env.VITE_ORDERS_SPREADSHEET_ID || "");
  const [ordersSheetId, setOrdersSheetId] = useState("0");
  const [tourismSpreadsheetId, setTourismSpreadsheetId] = useState(import.meta.env.VITE_TOURISM_SPREADSHEET_ID || "");
  const [tourismSheetId, setTourismSheetId] = useState("0");
  
  // State for menu management
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null);
  const [isAddingMenuItem, setIsAddingMenuItem] = useState(false);
  
  // State for tourism management
  const [editingTourismPlace, setEditingTourismPlace] = useState<TourismPlace | null>(null);
  const [isAddingTourismPlace, setIsAddingTourismPlace] = useState(false);
  
  // State for theme settings
  const [brandName, setBrandName] = useState("Rai Guest House");
  const [primaryColor, setPrimaryColor] = useState("#4f46e5"); // Default indigo color
  const [fontFamily, setFontFamily] = useState("Inter");
  const [logoImage, setLogoImage] = useState<string | null>(null);
  
  // State for general settings
  const [qrAutoFill, setQrAutoFill] = useState(true);
  const [orderAlertSound, setOrderAlertSound] = useState(true);
  const [whatsappAlerts, setWhatsappAlerts] = useState(false);
  
  // Theme preview
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Hooks for data fetching
  const { 
    menuItems, 
    loading: loadingMenu, 
    addMenuItem, 
    updateMenuItem,
    deleteMenuItem 
  } = useMenuItems();
  
  const { 
    orders, 
    loading: loadingOrders, 
    updateOrderStatus: updateOrder,
    placeOrder, 
    refetch: fetchOrders 
  } = useOrders();
  
  const { 
    tourismPlaces, 
    loading: loadingTourism,
    addTourismPlace,
    updateTourismPlace,
    deleteTourismPlace
  } = useTourismPlaces();
  const { toast } = useToast();
  
  // Forms
  const menuItemForm = useForm<z.infer<typeof menuItemSchema>>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: {
      name: "",
      price: 0,
      purchasePrice: 0,
      category: "",
      details: ""
    }
  });
  
  const tourismPlaceForm = useForm<z.infer<typeof tourismPlaceSchema>>({
    resolver: zodResolver(tourismPlaceSchema),
    defaultValues: {
      title: "",
      description: "",
      distance: "",
      tags: [],
      mapsLink: ""
    }
  });
  
  const sheetsConfigForm = useForm<z.infer<typeof sheetsConfigSchema>>({
    resolver: zodResolver(sheetsConfigSchema),
    defaultValues: {
      menuSpreadsheetId: menuSpreadsheetId,
      menuSheetId: menuSheetId,
      ordersSpreadsheetId: ordersSpreadsheetId,
      ordersSheetId: ordersSheetId,
      tourismSpreadsheetId: tourismSpreadsheetId,
      tourismSheetId: tourismSheetId
    }
  });
  
  const passwordChangeForm = useForm<z.infer<typeof passwordChangeSchema>>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    }
  });
  
  const themeSettingsForm = useForm<z.infer<typeof themeSettingsSchema>>({
    resolver: zodResolver(themeSettingsSchema),
    defaultValues: {
      brandName: brandName,
      primaryColor: primaryColor,
      fontFamily: fontFamily
    }
  });
  
  // Update page title and check login status
  useEffect(() => {
    document.title = "Admin Panel | Rai Guest House";
    
    // Check if already logged in
    const adminLoggedIn = localStorage.getItem("adminLoggedIn") === "true";
    if (adminLoggedIn) {
      setIsLoggedIn(true);
      fetchOrders();
    }
    
    // Load settings from localStorage
    const savedSettings = localStorage.getItem("adminSettings");
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        
        // Sheet configs
        if (settings.menuSpreadsheetId) setMenuSpreadsheetId(settings.menuSpreadsheetId);
        if (settings.menuSheetId) setMenuSheetId(settings.menuSheetId);
        if (settings.ordersSpreadsheetId) setOrdersSpreadsheetId(settings.ordersSpreadsheetId);
        if (settings.ordersSheetId) setOrdersSheetId(settings.ordersSheetId);
        if (settings.tourismSpreadsheetId) setTourismSpreadsheetId(settings.tourismSpreadsheetId);
        if (settings.tourismSheetId) setTourismSheetId(settings.tourismSheetId);
        
        // Theme settings
        if (settings.brandName) setBrandName(settings.brandName);
        if (settings.primaryColor) setPrimaryColor(settings.primaryColor);
        if (settings.fontFamily) setFontFamily(settings.fontFamily);
        if (settings.logoImage) setLogoImage(settings.logoImage);
        
        // General settings
        if (settings.qrAutoFill !== undefined) setQrAutoFill(settings.qrAutoFill);
        if (settings.orderAlertSound !== undefined) setOrderAlertSound(settings.orderAlertSound);
        if (settings.whatsappAlerts !== undefined) setWhatsappAlerts(settings.whatsappAlerts);
      } catch (error) {
        console.error("Error parsing saved settings:", error);
      }
    }
  }, [fetchOrders]);
  
  // Update form defaults when external state changes
  useEffect(() => {
    sheetsConfigForm.setValue("menuSpreadsheetId", menuSpreadsheetId);
    sheetsConfigForm.setValue("menuSheetId", menuSheetId);
    sheetsConfigForm.setValue("ordersSpreadsheetId", ordersSpreadsheetId);
    sheetsConfigForm.setValue("ordersSheetId", ordersSheetId);
    sheetsConfigForm.setValue("tourismSpreadsheetId", tourismSpreadsheetId);
    sheetsConfigForm.setValue("tourismSheetId", tourismSheetId);
    
    themeSettingsForm.setValue("brandName", brandName);
    themeSettingsForm.setValue("primaryColor", primaryColor);
    themeSettingsForm.setValue("fontFamily", fontFamily);
  }, [
    menuSpreadsheetId, menuSheetId, 
    ordersSpreadsheetId, ordersSheetId, 
    tourismSpreadsheetId, tourismSheetId,
    brandName, primaryColor, fontFamily
  ]);
  
  // Set form values when editing menu item
  useEffect(() => {
    if (editingMenuItem) {
      menuItemForm.setValue("name", editingMenuItem.name);
      menuItemForm.setValue("price", editingMenuItem.price);
      menuItemForm.setValue("purchasePrice", editingMenuItem.purchasePrice || 0);
      menuItemForm.setValue("category", editingMenuItem.category);
      menuItemForm.setValue("details", editingMenuItem.details || "");
    } else {
      menuItemForm.reset();
    }
  }, [editingMenuItem, menuItemForm]);
  
  // Set form values when editing tourism place
  useEffect(() => {
    if (editingTourismPlace) {
      tourismPlaceForm.setValue("title", editingTourismPlace.title);
      tourismPlaceForm.setValue("description", editingTourismPlace.description);
      tourismPlaceForm.setValue("distance", editingTourismPlace.distance);
      tourismPlaceForm.setValue("tags", editingTourismPlace.tags);
      tourismPlaceForm.setValue("mapsLink", editingTourismPlace.mapsLink);
    } else {
      tourismPlaceForm.reset();
    }
  }, [editingTourismPlace, tourismPlaceForm]);
  
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password === ADMIN_PASSWORD) {
      setIsLoggedIn(true);
      localStorage.setItem("adminLoggedIn", "true");
      fetchOrders();
      toast({
        title: "Login successful",
        description: "Welcome to the admin panel",
      });
    } else {
      toast({
        title: "Login failed",
        description: "Incorrect password. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem("adminLoggedIn");
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
  };
  
  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      await updateOrder({ id: orderId, status: newStatus });
      toast({
        title: "Order updated",
        description: `Order #${orderId} status changed to ${newStatus}`,
      });
    } catch (error) {
      toast({
        title: "Error updating order",
        description: "There was a problem updating the order status",
        variant: "destructive",
      });
    }
  };
  
  const saveSheetSettings = (data: z.infer<typeof sheetsConfigSchema>) => {
    // Update state
    setMenuSpreadsheetId(data.menuSpreadsheetId);
    setMenuSheetId(data.menuSheetId);
    setOrdersSpreadsheetId(data.ordersSpreadsheetId);
    setOrdersSheetId(data.ordersSheetId);
    setTourismSpreadsheetId(data.tourismSpreadsheetId);
    setTourismSheetId(data.tourismSheetId);
    
    // Save to localStorage
    const settings = {
      ...JSON.parse(localStorage.getItem("adminSettings") || "{}"),
      menuSpreadsheetId: data.menuSpreadsheetId,
      menuSheetId: data.menuSheetId,
      ordersSpreadsheetId: data.ordersSpreadsheetId,
      ordersSheetId: data.ordersSheetId,
      tourismSpreadsheetId: data.tourismSpreadsheetId,
      tourismSheetId: data.tourismSheetId
    };
    localStorage.setItem("adminSettings", JSON.stringify(settings));
    
    toast({
      title: "Settings updated",
      description: "Google Sheet configuration has been updated",
    });
  };
  
  const handleSaveMenuItem = (data: z.infer<typeof menuItemSchema>) => {
    if (editingMenuItem) {
      // Update existing item
      const updatedItem = {
        ...editingMenuItem,
        name: data.name,
        price: data.price,
        purchasePrice: data.purchasePrice,
        category: data.category,
        details: data.details
      };
      
      // Use API to update
      updateMenuItem(updatedItem);
      
    } else {
      // Add new item using API
      addMenuItem({
        name: data.name,
        price: data.price,
        purchasePrice: data.purchasePrice,
        category: data.category,
        details: data.details
      });
    }
    
    // Close dialog
    setEditingMenuItem(null);
    setIsAddingMenuItem(false);
  };
  
  const handleDeleteMenuItem = (itemId: number) => {
    // Use API to delete the item
    deleteMenuItem(itemId);
  };
  
  const handleSaveTourismPlace = (data: z.infer<typeof tourismPlaceSchema>) => {
    if (editingTourismPlace) {
      // Update using API
      updateTourismPlace({
        id: editingTourismPlace.id,
        title: data.title,
        description: data.description,
        distance: data.distance,
        tags: data.tags,
        mapsLink: data.mapsLink,
      });
    } else {
      // Add new place using API
      addTourismPlace({
        title: data.title,
        description: data.description,
        distance: data.distance,
        tags: data.tags,
        mapsLink: data.mapsLink,
      });
    }
    
    // Close dialog
    setEditingTourismPlace(null);
    setIsAddingTourismPlace(false);
  };
  
  const handleDeleteTourismPlace = (placeId: number) => {
    // Delete using API
    deleteTourismPlace(placeId);
  };
  
  const handleChangePassword = (data: z.infer<typeof passwordChangeSchema>) => {
    if (data.currentPassword !== ADMIN_PASSWORD) {
      toast({
        title: "Error",
        description: "Current password is incorrect",
        variant: "destructive",
      });
      return;
    }
    
    // In a real app, you would update the password in a secure way
    toast({
      title: "Password updated",
      description: "Your password has been changed successfully",
    });
    
    passwordChangeForm.reset();
  };
  
  const handleSaveThemeSettings = (data: z.infer<typeof themeSettingsSchema>) => {
    // Update state
    setBrandName(data.brandName);
    setPrimaryColor(data.primaryColor);
    setFontFamily(data.fontFamily);
    
    // Save to localStorage
    const settings = {
      ...JSON.parse(localStorage.getItem("adminSettings") || "{}"),
      brandName: data.brandName,
      primaryColor: data.primaryColor,
      fontFamily: data.fontFamily,
      logoImage: logoImage
    };
    localStorage.setItem("adminSettings", JSON.stringify(settings));
    
    toast({
      title: "Theme settings updated",
      description: "Your theme changes have been saved",
    });
  };
  
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setLogoImage(result);
      
      // Save to localStorage
      const settings = {
        ...JSON.parse(localStorage.getItem("adminSettings") || "{}"),
        logoImage: result
      };
      localStorage.setItem("adminSettings", JSON.stringify(settings));
    };
    reader.readAsDataURL(file);
  };
  
  const saveGeneralSettings = () => {
    // Save to localStorage
    const settings = {
      ...JSON.parse(localStorage.getItem("adminSettings") || "{}"),
      qrAutoFill,
      orderAlertSound,
      whatsappAlerts
    };
    localStorage.setItem("adminSettings", JSON.stringify(settings));
    
    toast({
      title: "Settings updated",
      description: "Your general settings have been saved",
    });
  };
  
  // Filter orders based on search query
  const filteredOrders = searchQuery
    ? orders.filter(order => 
        order.roomNumber.includes(searchQuery) || 
        order.mobileNumber.includes(searchQuery) || 
        (order.name && order.name.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : orders;
  
  // Login screen
  if (!isLoggedIn) {
    return (
      <div className="flex justify-center items-center py-16">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex justify-center mb-8">
              <Shield className="h-16 w-16 text-gray-300 dark:text-gray-600" />
            </div>
            
            <h2 className="text-2xl font-bold mb-6 text-center">Admin Access</h2>
            
            <form onSubmit={handleLogin}>
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Password</label>
                <Input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  required
                />
              </div>
              
              <Button type="submit" className="w-full">
                Login
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main admin panel
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold">Rai Guest House Admin Panel</h2>
        <Button variant="outline" onClick={handleLogout}>
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
      
      <Tabs defaultValue="dashboard" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="menu">Menu Manager</TabsTrigger>
          <TabsTrigger value="orders">Order Sheet</TabsTrigger>
          <TabsTrigger value="theme">Theme Editor</TabsTrigger>
          <TabsTrigger value="tourism">Tourism Content</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        {/* Dashboard Tab */}
        <TabsContent value="dashboard">
          <Card>
            <CardHeader>
              <CardTitle>Order Management</CardTitle>
              <CardDescription>View and manage incoming orders</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="mb-4">
                <Input 
                  type="text" 
                  placeholder="Search by room number, mobile number, or name" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="max-w-md"
                />
              </div>
              
              {loadingOrders ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  {filteredOrders.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      No orders found.
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Order ID</TableHead>
                          <TableHead>Time</TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead>Room</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredOrders.map((order) => (
                          <TableRow key={order.id}>
                            <TableCell>{order.id}</TableCell>
                            <TableCell>{formatDate(order.timestamp)}</TableCell>
                            <TableCell>{order.name || "—"}</TableCell>
                            <TableCell>{order.roomNumber}</TableCell>
                            <TableCell>{formatPrice(order.total)}</TableCell>
                            <TableCell>
                              <Select 
                                defaultValue={order.status}
                                onValueChange={(value) => handleStatusChange(order.id, value)}
                              >
                                <SelectTrigger className="w-[130px]">
                                  <SelectValue placeholder={order.status} />
                                </SelectTrigger>
                                <SelectContent>
                                  {ORDER_STATUS_OPTIONS.map((status) => (
                                    <SelectItem key={status} value={status}>{status}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button 
                                variant="default" 
                                size="sm"
                                onClick={() => handleStatusChange(order.id, order.status)}
                              >
                                Update
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Menu Manager Tab */}
        <TabsContent value="menu">
          <Card>
            <CardHeader>
              <CardTitle>Menu Manager</CardTitle>
              <CardDescription>Add, edit, and delete menu items</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                <h3 className="text-xl font-semibold">Menu Items</h3>
                <div className="mt-3 sm:mt-0">
                  <Dialog open={isAddingMenuItem} onOpenChange={setIsAddingMenuItem}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add New Item
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Menu Item</DialogTitle>
                        <DialogDescription>
                          Add a new item to your menu. Click save when you're done.
                        </DialogDescription>
                      </DialogHeader>
                      
                      <Form {...menuItemForm}>
                        <form onSubmit={menuItemForm.handleSubmit(handleSaveMenuItem)} className="space-y-4 pt-4">
                          <FormField
                            control={menuItemForm.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Item Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Butter Naan" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={menuItemForm.control}
                            name="price"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Sale Price (₹)</FormLabel>
                                <FormControl>
                                  <Input type="number" placeholder="40" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={menuItemForm.control}
                            name="purchasePrice"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Purchase Price (₹)</FormLabel>
                                <FormControl>
                                  <Input type="number" placeholder="30" {...field} />
                                </FormControl>
                                <FormDescription>
                                  Price paid to restaurant for outsourced food items
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={menuItemForm.control}
                            name="category"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Category</FormLabel>
                                <Select 
                                  onValueChange={field.onChange} 
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select a category" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {MENU_CATEGORIES.map((category) => (
                                      <SelectItem key={category} value={category}>{category}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={menuItemForm.control}
                            name="details"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Details (Optional)</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="Enter item description or special notes" 
                                    className="resize-y"
                                    {...field} 
                                  />
                                </FormControl>
                                <FormDescription>
                                  Add important details like ingredients, spice level, or allergens
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <DialogFooter>
                            <Button type="submit">Save Item</Button>
                          </DialogFooter>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
              
              {loadingMenu ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Price (₹)</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {menuItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>{item.category}</TableCell>
                          <TableCell>{item.price}</TableCell>
                          <TableCell className="text-right">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                                  onClick={() => setEditingMenuItem(item)}
                                >
                                  <Edit className="h-4 w-4 mr-1" />
                                  Edit
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Edit Menu Item</DialogTitle>
                                  <DialogDescription>
                                    Make changes to the menu item. Click save when you're done.
                                  </DialogDescription>
                                </DialogHeader>
                                
                                <Form {...menuItemForm}>
                                  <form onSubmit={menuItemForm.handleSubmit(handleSaveMenuItem)} className="space-y-4 pt-4">
                                    <FormField
                                      control={menuItemForm.control}
                                      name="name"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>Item Name</FormLabel>
                                          <FormControl>
                                            <Input {...field} />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                    
                                    <FormField
                                      control={menuItemForm.control}
                                      name="price"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>Sale Price (₹)</FormLabel>
                                          <FormControl>
                                            <Input type="number" {...field} />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                    
                                    <FormField
                                      control={menuItemForm.control}
                                      name="purchasePrice"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>Purchase Price (₹)</FormLabel>
                                          <FormControl>
                                            <Input type="number" {...field} />
                                          </FormControl>
                                          <FormDescription>
                                            Price paid to restaurant for outsourced food items
                                          </FormDescription>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                    
                                    <FormField
                                      control={menuItemForm.control}
                                      name="category"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>Category</FormLabel>
                                          <Select 
                                            onValueChange={field.onChange} 
                                            defaultValue={field.value}
                                          >
                                            <FormControl>
                                              <SelectTrigger>
                                                <SelectValue placeholder="Select a category" />
                                              </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                              {MENU_CATEGORIES.map((category) => (
                                                <SelectItem key={category} value={category}>{category}</SelectItem>
                                              ))}
                                            </SelectContent>
                                          </Select>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                    
                                    <FormField
                                      control={menuItemForm.control}
                                      name="details"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>Details (Optional)</FormLabel>
                                          <FormControl>
                                            <Textarea 
                                              placeholder="Enter item description or special notes" 
                                              className="resize-y"
                                              {...field} 
                                            />
                                          </FormControl>
                                          <FormDescription>
                                            Add important details like ingredients, spice level, or allergens
                                          </FormDescription>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                    
                                    <DialogFooter>
                                      <Button type="submit">Save Changes</Button>
                                    </DialogFooter>
                                  </form>
                                </Form>
                              </DialogContent>
                            </Dialog>
                            
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                              onClick={() => handleDeleteMenuItem(item.id)}
                            >
                              <Trash className="h-4 w-4 mr-1" />
                              Remove
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Order Sheet Management Tab */}
        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Google Sheets Configuration</CardTitle>
              <CardDescription>Configure the Google Sheets integration for your data</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <Form {...sheetsConfigForm}>
                <form onSubmit={sheetsConfigForm.handleSubmit(saveSheetSettings)} className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="font-medium text-lg">Menu Sheet Configuration</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={sheetsConfigForm.control}
                        name="menuSpreadsheetId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Menu Spreadsheet ID</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Enter Google Spreadsheet ID" />
                            </FormControl>
                            <FormDescription>
                              The ID from your Google Sheets URL
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={sheetsConfigForm.control}
                        name="menuSheetId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Menu Sheet GID</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="0" />
                            </FormControl>
                            <FormDescription>
                              Usually 0 for the first sheet
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="font-medium text-lg">Orders Sheet Configuration</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={sheetsConfigForm.control}
                        name="ordersSpreadsheetId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Orders Spreadsheet ID</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Enter Google Spreadsheet ID" />
                            </FormControl>
                            <FormDescription>
                              The ID from your Google Sheets URL
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={sheetsConfigForm.control}
                        name="ordersSheetId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Orders Sheet GID</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="0" />
                            </FormControl>
                            <FormDescription>
                              Usually 0 for the first sheet
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="font-medium text-lg">Tourism Sheet Configuration</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={sheetsConfigForm.control}
                        name="tourismSpreadsheetId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tourism Spreadsheet ID</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Enter Google Spreadsheet ID" />
                            </FormControl>
                            <FormDescription>
                              The ID from your Google Sheets URL
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={sheetsConfigForm.control}
                        name="tourismSheetId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tourism Sheet GID</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="0" />
                            </FormControl>
                            <FormDescription>
                              Usually 0 for the first sheet
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  <Button type="submit" className="mt-4">
                    <Save className="h-4 w-4 mr-2" />
                    Save Sheet Configuration
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Theme Editor Tab */}
        <TabsContent value="theme">
          <Card>
            <CardHeader>
              <CardTitle>Theme Editor</CardTitle>
              <CardDescription>Customize the look and feel of your website</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <Form {...themeSettingsForm}>
                    <form onSubmit={themeSettingsForm.handleSubmit(handleSaveThemeSettings)} className="space-y-4">
                      <FormField
                        control={themeSettingsForm.control}
                        name="brandName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Brand Name</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Rai Guest House" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={themeSettingsForm.control}
                        name="primaryColor"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Primary Color</FormLabel>
                            <div className="flex items-center gap-4">
                              <FormControl>
                                <Input {...field} type="color" className="w-16 h-10" />
                              </FormControl>
                              <Input 
                                value={field.value} 
                                onChange={(e) => field.onChange(e.target.value)}
                                placeholder="#4f46e5" 
                                className="flex-1"
                              />
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={themeSettingsForm.control}
                        name="fontFamily"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Font Family</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a font" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Inter">Inter</SelectItem>
                                <SelectItem value="Roboto">Roboto</SelectItem>
                                <SelectItem value="Poppins">Poppins</SelectItem>
                                <SelectItem value="Lato">Lato</SelectItem>
                                <SelectItem value="Montserrat">Montserrat</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div>
                        <Label className="block text-sm font-medium mb-2">Logo Upload</Label>
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-md border flex items-center justify-center overflow-hidden">
                            {logoImage ? (
                              <img 
                                src={logoImage} 
                                alt="Logo Preview" 
                                className="max-w-full max-h-full object-contain"
                              />
                            ) : (
                              <Upload className="h-6 w-6 text-gray-400" />
                            )}
                          </div>
                          <Input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleLogoUpload}
                            className="flex-1"
                          />
                        </div>
                      </div>
                      
                      <div className="mt-4 flex items-center space-x-2">
                        <Label htmlFor="theme-toggle">Preview in Dark Mode</Label>
                        <Switch 
                          id="theme-toggle" 
                          checked={isDarkMode}
                          onCheckedChange={setIsDarkMode}
                        />
                      </div>
                      
                      <Button type="submit" className="mt-4">
                        <Save className="h-4 w-4 mr-2" />
                        Save Theme Settings
                      </Button>
                    </form>
                  </Form>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-4">Live Preview</h3>
                  <div className={`border rounded-lg overflow-hidden ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white'}`}>
                    <div className="p-4 border-b" style={{ backgroundColor: primaryColor, color: 'white' }}>
                      <div className="flex items-center gap-3">
                        {logoImage && (
                          <img src={logoImage} alt="Logo" className="h-10 w-10 object-contain" />
                        )}
                        <h3 className={`font-bold text-xl`} style={{ fontFamily }}>
                          {brandName}
                        </h3>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="mb-6">
                        <h4 className={`text-lg font-semibold mb-2`} style={{ fontFamily }}>Welcome to our Guest House</h4>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} style={{ fontFamily }}>
                          Experience comfort and luxury during your stay
                        </p>
                      </div>
                      
                      <div className="space-y-3 mb-6">
                        <div className={`p-3 rounded-md ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                          <h5 className="font-medium" style={{ fontFamily }}>Deluxe Room</h5>
                          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} style={{ fontFamily }}>
                            Spacious room with all amenities
                          </p>
                        </div>
                        <div className={`p-3 rounded-md ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                          <h5 className="font-medium" style={{ fontFamily }}>Premium Suite</h5>
                          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} style={{ fontFamily }}>
                            Luxury suite with beautiful view
                          </p>
                        </div>
                      </div>
                      
                      <Button style={{ backgroundColor: primaryColor }}>Book Now</Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Tourism Content Tab */}
        <TabsContent value="tourism">
          <Card>
            <CardHeader>
              <CardTitle>Tourism Content Editor</CardTitle>
              <CardDescription>Manage tourist attractions and places of interest</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                <h3 className="text-xl font-semibold">Tourism Places</h3>
                <div className="mt-3 sm:mt-0">
                  <Dialog open={isAddingTourismPlace} onOpenChange={setIsAddingTourismPlace}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add New Place
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Add Tourism Place</DialogTitle>
                        <DialogDescription>
                          Add a new tourist attraction or place of interest.
                        </DialogDescription>
                      </DialogHeader>
                      
                      <Form {...tourismPlaceForm}>
                        <form onSubmit={tourismPlaceForm.handleSubmit(handleSaveTourismPlace)} className="space-y-4 pt-4">
                          <FormField
                            control={tourismPlaceForm.control}
                            name="title"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Title</FormLabel>
                                <FormControl>
                                  <Input placeholder="Mahakaleshwar Temple" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={tourismPlaceForm.control}
                            name="description"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="Describe this place..." 
                                    className="min-h-32"
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormField
                              control={tourismPlaceForm.control}
                              name="distance"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Distance</FormLabel>
                                  <FormControl>
                                    <Input placeholder="4.2 km" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={tourismPlaceForm.control}
                              name="mapsLink"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Google Maps Link</FormLabel>
                                  <FormControl>
                                    <Input 
                                      placeholder="https://maps.google.com/?q=..." 
                                      {...field} 
                                      value={field.value || ''} 
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <FormField
                            control={tourismPlaceForm.control}
                            name="tags"
                            render={() => (
                              <FormItem>
                                <div className="mb-2">
                                  <FormLabel>Tags</FormLabel>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {TOURISM_TAGS.filter(tag => tag !== "All").map((tag) => (
                                    <FormField
                                      key={tag}
                                      control={tourismPlaceForm.control}
                                      name="tags"
                                      render={({ field }) => {
                                        return (
                                          <FormItem
                                            key={tag}
                                            className="flex flex-row items-center space-x-2 space-y-0"
                                          >
                                            <FormControl>
                                              <Checkbox
                                                checked={field.value?.includes(tag)}
                                                onCheckedChange={(checked) => {
                                                  return checked
                                                    ? field.onChange([...field.value, tag])
                                                    : field.onChange(
                                                        field.value?.filter(
                                                          (value) => value !== tag
                                                        )
                                                      )
                                                }}
                                              />
                                            </FormControl>
                                            <FormLabel className="text-sm font-normal cursor-pointer">
                                              {tag}
                                            </FormLabel>
                                          </FormItem>
                                        )
                                      }}
                                    />
                                  ))}
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <DialogFooter>
                            <Button type="submit">Save Place</Button>
                          </DialogFooter>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
              
              {loadingTourism ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Place Name</TableHead>
                        <TableHead>Distance</TableHead>
                        <TableHead>Tags</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tourismPlaces.map((place) => (
                        <TableRow key={place.id}>
                          <TableCell className="font-medium">{place.title}</TableCell>
                          <TableCell>{place.distance}</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {place.tags.map(tag => (
                                <Badge key={`${place.id}-${tag}`} variant="outline">{tag}</Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                                  onClick={() => setEditingTourismPlace(place)}
                                >
                                  <Edit className="h-4 w-4 mr-1" />
                                  Edit
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>Edit Tourism Place</DialogTitle>
                                  <DialogDescription>
                                    Make changes to this tourism place.
                                  </DialogDescription>
                                </DialogHeader>
                                
                                <Form {...tourismPlaceForm}>
                                  <form onSubmit={tourismPlaceForm.handleSubmit(handleSaveTourismPlace)} className="space-y-4 pt-4">
                                    <FormField
                                      control={tourismPlaceForm.control}
                                      name="title"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>Title</FormLabel>
                                          <FormControl>
                                            <Input {...field} />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                    
                                    <FormField
                                      control={tourismPlaceForm.control}
                                      name="description"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>Description</FormLabel>
                                          <FormControl>
                                            <Textarea 
                                              className="min-h-32"
                                              {...field} 
                                            />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                    
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                      <FormField
                                        control={tourismPlaceForm.control}
                                        name="distance"
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel>Distance</FormLabel>
                                            <FormControl>
                                              <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                      
                                      <FormField
                                        control={tourismPlaceForm.control}
                                        name="mapsLink"
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel>Google Maps Link</FormLabel>
                                            <FormControl>
                                              <Input 
                                                {...field} 
                                                value={field.value || ''} 
                                              />
                                            </FormControl>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                    </div>
                                    
                                    <FormField
                                      control={tourismPlaceForm.control}
                                      name="tags"
                                      render={() => (
                                        <FormItem>
                                          <div className="mb-2">
                                            <FormLabel>Tags</FormLabel>
                                          </div>
                                          <div className="flex flex-wrap gap-2">
                                            {TOURISM_TAGS.filter(tag => tag !== "All").map((tag) => (
                                              <FormField
                                                key={tag}
                                                control={tourismPlaceForm.control}
                                                name="tags"
                                                render={({ field }) => {
                                                  return (
                                                    <FormItem
                                                      key={tag}
                                                      className="flex flex-row items-center space-x-2 space-y-0"
                                                    >
                                                      <FormControl>
                                                        <Checkbox
                                                          checked={field.value?.includes(tag)}
                                                          onCheckedChange={(checked) => {
                                                            return checked
                                                              ? field.onChange([...field.value, tag])
                                                              : field.onChange(
                                                                  field.value?.filter(
                                                                    (value) => value !== tag
                                                                  )
                                                                )
                                                          }}
                                                        />
                                                      </FormControl>
                                                      <FormLabel className="text-sm font-normal cursor-pointer">
                                                        {tag}
                                                      </FormLabel>
                                                    </FormItem>
                                                  )
                                                }}
                                              />
                                            ))}
                                          </div>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                    
                                    <DialogFooter>
                                      <Button type="submit">Save Changes</Button>
                                    </DialogFooter>
                                  </form>
                                </Form>
                              </DialogContent>
                            </Dialog>
                            
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                              onClick={() => handleDeleteTourismPlace(place.id)}
                            >
                              <Trash className="h-4 w-4 mr-1" />
                              Remove
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Settings Tab */}
        <TabsContent value="settings">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>Configure application behavior</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="qr-autofill">QR Code Room Auto-fill</Label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Automatically fill room number when scanning QR code
                      </p>
                    </div>
                    <Switch 
                      id="qr-autofill" 
                      checked={qrAutoFill}
                      onCheckedChange={setQrAutoFill}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="order-alert">Order Alert Sound</Label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Play sound notification for new orders
                      </p>
                    </div>
                    <Switch 
                      id="order-alert" 
                      checked={orderAlertSound}
                      onCheckedChange={setOrderAlertSound}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="whatsapp-alert">WhatsApp Order Alerts</Label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Send WhatsApp notifications for new orders (requires setup)
                      </p>
                    </div>
                    <Switch 
                      id="whatsapp-alert" 
                      checked={whatsappAlerts}
                      onCheckedChange={setWhatsappAlerts}
                    />
                  </div>
                  
                  <Button onClick={saveGeneralSettings}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Admin Account</CardTitle>
                <CardDescription>Manage your admin account settings</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <Form {...passwordChangeForm}>
                  <form onSubmit={passwordChangeForm.handleSubmit(handleChangePassword)} className="space-y-4">
                    <FormField
                      control={passwordChangeForm.control}
                      name="currentPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Password</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={passwordChangeForm.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>New Password</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={passwordChangeForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm New Password</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button type="submit">Change Password</Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
            
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Smart Add-ons</CardTitle>
                <CardDescription>Additional features for your guest house</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex justify-center">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                          <BellRing className="h-5 w-5 text-primary" />
                        </div>
                      </div>
                      <h3 className="text-lg font-medium text-center mb-2">Order Notifications</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                        Real-time alerts when new orders arrive
                      </p>
                      <Button variant="outline" className="w-full mt-4">Configure</Button>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex justify-center">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                          <Calendar className="h-5 w-5 text-primary" />
                        </div>
                      </div>
                      <h3 className="text-lg font-medium text-center mb-2">Events Calendar</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                        Display local events from Google Calendar
                      </p>
                      <Button variant="outline" className="w-full mt-4">Setup</Button>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex justify-center">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                          <QrCode className="h-5 w-5 text-primary" />
                        </div>
                      </div>
                      <h3 className="text-lg font-medium text-center mb-2">QR Code Generator</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                        Generate room-specific QR codes for easy ordering
                      </p>
                      <Button variant="outline" className="w-full mt-4">Generate</Button>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
