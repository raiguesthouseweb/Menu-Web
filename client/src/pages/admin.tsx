import { useEffect, useState } from "react";
import { useMenuItems, useOrders } from "@/hooks/use-google-sheets";
import { ADMIN_PASSWORD } from "@/config/constants";
import { useToast } from "@/hooks/use-toast";
import { formatPrice, formatDate } from "@/lib/utils";

import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import { 
  Input 
} from "@/components/ui/input";
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
  Shield, 
  Search, 
  Edit, 
  Trash, 
  Plus,
  Loader2,
  LogOut,
  Save
} from "lucide-react";

export default function Admin() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [spreadsheetId, setSpreadsheetId] = useState("");
  const [sheetId, setSheetId] = useState("");
  const { menuItems, loading: loadingMenu, setMenuItems } = useMenuItems();
  const { 
    orders, 
    loading: loadingOrders, 
    fetchOrders, 
    updateOrderStatus 
  } = useOrders();
  const { toast } = useToast();
  
  // Update page title
  useEffect(() => {
    document.title = "Admin Panel | Rai Guest House";
    
    // Check if already logged in
    const adminLoggedIn = localStorage.getItem("adminLoggedIn") === "true";
    if (adminLoggedIn) {
      setIsLoggedIn(true);
      fetchOrders();
    }
  }, [fetchOrders]);
  
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
      await updateOrderStatus(orderId, newStatus);
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
  
  const saveSheetSettings = () => {
    toast({
      title: "Settings updated",
      description: "Google Sheet configuration has been updated",
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

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold">SUPERMAN Admin Panel</h2>
        <Button variant="outline" onClick={handleLogout}>
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
      
      <Tabs defaultValue="dashboard" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="menu">Menu Manager</TabsTrigger>
        </TabsList>
        
        {/* Dashboard Tab */}
        <TabsContent value="dashboard">
          <Card>
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
                                  <SelectItem value="Pending">Pending</SelectItem>
                                  <SelectItem value="Preparing">Preparing</SelectItem>
                                  <SelectItem value="Delivered">Delivered</SelectItem>
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
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                <h3 className="text-xl font-semibold">Menu Items</h3>
                <div className="mt-3 sm:mt-0">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Item
                  </Button>
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
                            <Button variant="ghost" size="sm" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300">
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
              
              <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-md">
                <h4 className="font-medium mb-3">Google Sheet Configuration</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Spreadsheet ID</label>
                    <Input 
                      type="text" 
                      value={spreadsheetId}
                      onChange={(e) => setSpreadsheetId(e.target.value)}
                      placeholder="Enter Google Spreadsheet ID"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Sheet ID</label>
                    <Input 
                      type="text" 
                      value={sheetId}
                      onChange={(e) => setSheetId(e.target.value)}
                      placeholder="Enter Sheet ID"
                    />
                  </div>
                </div>
                <Button onClick={saveSheetSettings} className="mt-4">
                  <Save className="h-4 w-4 mr-2" />
                  Update Sheet Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
