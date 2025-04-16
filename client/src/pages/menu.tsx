import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useMenuItems } from "@/hooks/use-google-sheets";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { MENU_CATEGORIES } from "@/config/constants";
import { formatPrice } from "@/lib/utils";

import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import { 
  Skeleton
} from "@/components/ui/skeleton";
import { 
  Button 
} from "@/components/ui/button";
import { 
  Plus, 
  Minus,
  ShoppingCart 
} from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  name: z.string().optional(),
  roomNumber: z.string().min(1, "Room number is required"),
  mobileNumber: z.string().min(10, "Mobile number must be 10 digits").max(10, "Mobile number must be 10 digits")
});

export default function Menu() {
  const { menuItems, loading, error } = useMenuItems();
  const { items, addItem, removeItem, updateQuantity, getTotalPrice, clearCart, orderDetails, setOrderDetails } = useCart();
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  
  // Form setup
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: orderDetails.name,
      roomNumber: orderDetails.roomNumber,
      mobileNumber: orderDetails.mobileNumber,
    },
  });

  // Update form values when orderDetails change
  useEffect(() => {
    form.reset({
      name: orderDetails.name,
      roomNumber: orderDetails.roomNumber,
      mobileNumber: orderDetails.mobileNumber,
    });
  }, [orderDetails, form]);
  
  // Update page title
  useEffect(() => {
    document.title = "Order Food | Rai Guest House";
  }, []);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (items.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Please add items to your cart before placing an order",
        variant: "destructive",
      });
      return;
    }
    
    // Update order details
    setOrderDetails({
      name: values.name || "",
      roomNumber: values.roomNumber,
      mobileNumber: values.mobileNumber,
    });
    
    // Save order to local storage
    const order = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      status: "Pending",
      name: values.name || "",
      roomNumber: values.roomNumber,
      mobileNumber: values.mobileNumber,
      items: [...items],
      total: getTotalPrice(),
    };
    
    // Retrieve existing orders from localStorage or initialize empty array
    const existingOrders = JSON.parse(localStorage.getItem("orders") || "[]");
    localStorage.setItem("orders", JSON.stringify([...existingOrders, order]));
    
    // Clear the cart and navigate to confirmation page
    clearCart();
    navigate("/order-confirmation");
  };

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Menu Section */}
      <div className="w-full md:w-2/3">
        <h2 className="text-2xl font-bold mb-6">Our Menu</h2>
        
        {/* Loading State */}
        {loading && (
          <div className="space-y-8">
            {Array.from({ length: 3 }).map((_, categoryIndex) => (
              <div key={categoryIndex}>
                <Skeleton className="h-8 w-48 mb-4" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Array.from({ length: 4 }).map((_, itemIndex) => (
                    <Skeleton key={itemIndex} className="h-24 w-full" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Error State */}
        {error && !loading && (
          <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
            <CardContent className="p-6">
              <h3 className="font-semibold text-red-800 dark:text-red-300 mb-2">
                Error Loading Menu
              </h3>
              <p className="text-red-700 dark:text-red-400">
                {error}
              </p>
            </CardContent>
          </Card>
        )}
        
        {/* Menu Categories */}
        {!loading && !error && (
          <div className="space-y-8">
            {MENU_CATEGORIES.map((category) => {
              const categoryItems = menuItems.filter(item => item.category === category);
              
              if (categoryItems.length === 0) return null;
              
              return (
                <div key={category}>
                  <h3 className="text-xl font-semibold mb-3 text-primary">{category}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {categoryItems.map((item) => (
                      <Card key={item.id} className="flex justify-between items-center">
                        <CardContent className="p-4 flex justify-between items-center w-full">
                          <div>
                            <h4 className="font-medium">{item.name}</h4>
                            {item.details && (
                              <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">
                                {item.details}
                              </p>
                            )}
                            <p className="text-gray-600 dark:text-gray-400 mt-1 font-semibold">
                              {formatPrice(item.price)}
                            </p>
                          </div>
                          <Button 
                            onClick={() => addItem(item)} 
                            variant="outline"
                            size="icon"
                            className="rounded-full"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      {/* Cart Section */}
      <div className="w-full md:w-1/3">
        <Card className="sticky top-20 max-h-[calc(100vh-5rem)] overflow-y-auto">
          <CardContent className="p-4 divide-y">
            <div className="pb-4">
              <h3 className="text-xl font-semibold mb-4">Your Order</h3>
              
              {items.length === 0 && (
                <div className="text-gray-500 dark:text-gray-400 text-center py-6">
                  Your cart is empty
                </div>
              )}
              
              {items.length > 0 && (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center pb-3">
                      <div>
                        <h4>{item.name}</h4>
                        {item.details && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5">
                            {item.details}
                          </p>
                        )}
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                          {formatPrice(item.price)}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <Button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 rounded-full p-0"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="mx-3 min-w-[20px] text-center">{item.quantity}</span>
                        <Button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 rounded-full p-0"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {items.length > 0 && (
              <div className="pt-4">
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>{formatPrice(getTotalPrice())}</span>
                </div>
                
                {/* Checkout Form */}
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Guest Name (optional)</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter your name" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="roomNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Room Number*</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter room number" 
                              {...field} 
                              required
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="mobileNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mobile Number*</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="10-digit mobile number" 
                              {...field} 
                              required
                              maxLength={10}
                              minLength={10}
                              pattern="[0-9]{10}"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button type="submit" className="w-full">
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Place Order
                    </Button>
                  </form>
                </Form>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
