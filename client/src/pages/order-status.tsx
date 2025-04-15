import { useEffect, useState } from "react";
import { useOrders } from "@/hooks/use-google-sheets";
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
  Badge
} from "@/components/ui/badge";
import { 
  Search, 
  Loader2 
} from "lucide-react";

export default function OrderStatus() {
  const [query, setQuery] = useState("");
  const { orders, loading, error, fetchOrders } = useOrders();
  
  // Update page title
  useEffect(() => {
    document.title = "Order Status | Rai Guest House";
    
    // Check for room number in URL (from QR code)
    const urlParams = new URLSearchParams(window.location.search);
    const roomParam = urlParams.get("room");
    
    if (roomParam) {
      setQuery(roomParam);
      fetchOrders(roomParam);
    } else {
      // Load all orders if no specific room is provided
      fetchOrders();
    }
  }, [fetchOrders]);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders(query);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "Preparing":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "Delivered":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const filteredOrders = query 
    ? orders.filter(order => 
        order.roomNumber.includes(query) || 
        order.mobileNumber.includes(query)
      )
    : orders;
  
  const sortedOrders = [...filteredOrders].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Track Your Order</h2>
      
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="max-w-md mx-auto">
            <form onSubmit={handleSearch} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Enter Your Details</label>
                <div className="flex space-x-2">
                  <Input 
                    type="text" 
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Room Number or Mobile Number"
                    className="flex-1"
                  />
                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                    <span className="ml-2 hidden sm:inline">Search</span>
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </CardContent>
      </Card>
      
      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
      
      {/* Error State */}
      {error && !loading && (
        <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <CardContent className="p-6">
            <h3 className="font-semibold text-red-800 dark:text-red-300 mb-2">
              Error Loading Orders
            </h3>
            <p className="text-red-700 dark:text-red-400">
              {error}
            </p>
          </CardContent>
        </Card>
      )}
      
      {/* Results */}
      {!loading && !error && (
        <div className="space-y-6">
          {sortedOrders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">
                {query ? "No orders found matching your search." : "No orders found."}
              </p>
            </div>
          ) : (
            sortedOrders.map((order) => (
              <Card key={order.id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">Order #{order.id}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {formatDate(order.timestamp)}
                      </p>
                    </div>
                    <Badge 
                      variant="outline"
                      className={getStatusColor(order.status)}
                    >
                      {order.status}
                    </Badge>
                  </div>
                  
                  <div className="mt-4 space-y-2">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>
                          {item.name} × {item.quantity}
                        </span>
                        <span>
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4 pt-3 border-t dark:border-gray-700 flex justify-between font-medium">
                    <span>Total</span>
                    <span>{formatPrice(order.total)}</span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
