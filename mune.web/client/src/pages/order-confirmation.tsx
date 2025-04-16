import { useEffect } from "react";
import { useLocation } from "wouter";
import { useCart } from "@/hooks/use-cart";
import { formatPrice } from "@/lib/utils";

import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import { 
  Button 
} from "@/components/ui/button";
import { 
  CheckCircle2, 
  ArrowLeft, 
  Clock 
} from "lucide-react";

export default function OrderConfirmation() {
  const [_, navigate] = useLocation();
  const { orderDetails } = useCart();
  
  // Update page title
  useEffect(() => {
    document.title = "Order Confirmation | Rai Guest House";
  }, []);
  
  // Redirect to home if no order details are available
  useEffect(() => {
    const localOrders = localStorage.getItem('orders');
    if (!localOrders || !orderDetails.roomNumber) {
      navigate('/');
    }
  }, [orderDetails, navigate]);

  // Get the latest order from local storage
  const getLatestOrder = () => {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    if (orders.length === 0) return null;
    
    // Sort by timestamp and get the latest one
    return orders.sort((a: any, b: any) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )[0];
  };
  
  const latestOrder = getLatestOrder();

  return (
    <div className="flex flex-col items-center justify-center py-10">
      <Card className="max-w-md w-full">
        <CardContent className="p-8 text-center">
          <div className="text-green-500 text-6xl mb-4">
            <CheckCircle2 className="h-16 w-16 mx-auto" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Order Placed Successfully!</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Your order has been received and is being prepared.
          </p>
          
          {latestOrder && (
            <div className="text-left border-t dark:border-gray-700 pt-4 mt-4">
              <p className="font-medium mb-2">Order Details:</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Order ID: #{latestOrder.id}
              </p>
              {orderDetails.name && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Guest Name: {orderDetails.name}
                </p>
              )}
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Room Number: {orderDetails.roomNumber}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Mobile Number: {orderDetails.mobileNumber}
              </p>
              {latestOrder.total && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 font-medium">
                  Total Amount: {formatPrice(latestOrder.total)}
                </p>
              )}
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row justify-between gap-3 mt-8">
            <Button 
              variant="outline"
              onClick={() => navigate('/restaurant')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Order More
            </Button>
            <Button 
              onClick={() => navigate('/order-status')}
            >
              <Clock className="h-4 w-4 mr-2" />
              Track Order
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
