import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MenuItem, TourismPlace, Order, OrderItem } from "@/types";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Menu Items API
export function useMenuItems() {
  const { toast } = useToast();
  
  const { 
    data: menuItems = [], 
    isLoading: loading, 
    error 
  } = useQuery({
    queryKey: ['/api/menu'],
    onError: (err: Error) => {
      toast({
        title: "Error loading menu items",
        description: err.message || "Unknown error occurred",
        variant: "destructive",
      });
    }
  });

  const queryClient = useQueryClient();

  const { mutate: addMenuItem } = useMutation({
    mutationFn: async (item: Omit<MenuItem, "id">) => {
      const res = await apiRequest("POST", "/api/menu", item);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/menu'] });
      toast({
        title: "Menu item added",
        description: "Item has been added to the menu",
      });
    },
    onError: (err) => {
      toast({
        title: "Failed to add menu item",
        description: err instanceof Error ? err.message : "An error occurred",
        variant: "destructive",
      });
    }
  });

  const { mutate: updateMenuItem } = useMutation({
    mutationFn: async ({ id, ...item }: MenuItem) => {
      const res = await apiRequest("PATCH", `/api/menu/${id}`, item);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/menu'] });
      toast({
        title: "Menu item updated",
        description: "Changes have been saved",
      });
    },
    onError: (err) => {
      toast({
        title: "Failed to update menu item",
        description: err instanceof Error ? err.message : "An error occurred",
        variant: "destructive",
      });
    }
  });

  const { mutate: deleteMenuItem } = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/menu/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/menu'] });
      toast({
        title: "Menu item deleted",
        description: "Item has been removed from the menu",
      });
    },
    onError: (err) => {
      toast({
        title: "Failed to delete menu item",
        description: err instanceof Error ? err.message : "An error occurred",
        variant: "destructive",
      });
    }
  });

  return { 
    menuItems, 
    loading, 
    error, 
    addMenuItem, 
    updateMenuItem, 
    deleteMenuItem 
  };
}

// Tourism Places API
export function useTourismPlaces() {
  const { toast } = useToast();
  
  const { 
    data: tourismPlaces = [], 
    isLoading: loading, 
    error 
  } = useQuery({
    queryKey: ['/api/tourism'],
    onError: (err) => {
      toast({
        title: "Error loading tourism places",
        description: err instanceof Error ? err.message : "Unknown error occurred",
        variant: "destructive",
      });
    }
  });

  const queryClient = useQueryClient();

  const { mutate: addTourismPlace } = useMutation({
    mutationFn: async (place: Omit<TourismPlace, "id">) => {
      const res = await apiRequest("POST", "/api/tourism", place);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tourism'] });
      toast({
        title: "Tourism place added",
        description: "Place has been added successfully",
      });
    },
    onError: (err) => {
      toast({
        title: "Failed to add tourism place",
        description: err instanceof Error ? err.message : "An error occurred",
        variant: "destructive",
      });
    }
  });

  const { mutate: updateTourismPlace } = useMutation({
    mutationFn: async ({ id, ...place }: TourismPlace) => {
      const res = await apiRequest("PATCH", `/api/tourism/${id}`, place);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tourism'] });
      toast({
        title: "Tourism place updated",
        description: "Changes have been saved",
      });
    },
    onError: (err) => {
      toast({
        title: "Failed to update tourism place",
        description: err instanceof Error ? err.message : "An error occurred",
        variant: "destructive",
      });
    }
  });

  const { mutate: deleteTourismPlace } = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/tourism/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tourism'] });
      toast({
        title: "Tourism place deleted",
        description: "Place has been removed successfully",
      });
    },
    onError: (err) => {
      toast({
        title: "Failed to delete tourism place",
        description: err instanceof Error ? err.message : "An error occurred",
        variant: "destructive",
      });
    }
  });

  return { 
    tourismPlaces, 
    loading, 
    error, 
    addTourismPlace, 
    updateTourismPlace, 
    deleteTourismPlace 
  };
}

// Orders API
export function useOrders(filterBy?: string) {
  const { toast } = useToast();
  
  const queryKey = filterBy 
    ? [`/api/orders?q=${encodeURIComponent(filterBy)}`]
    : ['/api/orders'];
  
  const { 
    data: orders = [], 
    isLoading: loading, 
    error,
    refetch 
  } = useQuery({
    queryKey,
    onError: (err) => {
      toast({
        title: "Error loading orders",
        description: err instanceof Error ? err.message : "Unknown error occurred",
        variant: "destructive",
      });
    }
  });

  const queryClient = useQueryClient();

  const { mutate: placeOrder } = useMutation({
    mutationFn: async (orderData: {
      name: string;
      roomNumber: string;
      mobileNumber: string;
      items: OrderItem[];
      total: number;
    }) => {
      const res = await apiRequest("POST", "/api/orders", orderData);
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      toast({
        title: "Order placed successfully",
        description: `Order #${data.id} has been received`,
      });
    },
    onError: (err) => {
      toast({
        title: "Failed to place order",
        description: err instanceof Error ? err.message : "An error occurred",
        variant: "destructive",
      });
    }
  });

  const { mutate: updateOrderStatus } = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest("PATCH", `/api/orders/${id}/status`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      toast({
        title: "Order status updated",
        description: "The order status has been updated",
      });
    },
    onError: (err) => {
      toast({
        title: "Failed to update order status",
        description: err instanceof Error ? err.message : "An error occurred",
        variant: "destructive",
      });
    }
  });

  // Optional timer for auto-refresh of orders in admin panel
  useEffect(() => {
    let intervalId: number;
    
    // If this is the admin view (no filterBy), auto-refresh orders every 30 seconds
    if (!filterBy) {
      intervalId = window.setInterval(() => {
        refetch();
      }, 30000);
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [filterBy, refetch]);

  return { 
    orders, 
    loading, 
    error, 
    placeOrder, 
    updateOrderStatus,
    refetch 
  };
}

// Admin Settings API
export function useAdminSettings(key: string) {
  const { toast } = useToast();
  
  const { 
    data: setting, 
    isLoading: loading, 
    error 
  } = useQuery({
    queryKey: [`/api/settings/${key}`],
    onError: (err) => {
      // Don't show toast on 404 - it's normal for settings not to exist yet
      if (err instanceof Error && !err.message.includes("404")) {
        toast({
          title: "Error loading setting",
          description: err.message,
          variant: "destructive",
        });
      }
    }
  });

  const queryClient = useQueryClient();

  const { mutate: saveSetting } = useMutation({
    mutationFn: async (value: string) => {
      const res = await apiRequest("POST", "/api/settings", { key, value });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/settings/${key}`] });
      toast({
        title: "Setting saved",
        description: "Your changes have been saved",
      });
    },
    onError: (err) => {
      toast({
        title: "Failed to save setting",
        description: err instanceof Error ? err.message : "An error occurred",
        variant: "destructive",
      });
    }
  });

  return { 
    setting, 
    loading, 
    error, 
    saveSetting 
  };
}

// Bulk Settings API
export function useBulkSettings() {
  const { toast } = useToast();
  
  const queryClient = useQueryClient();

  const saveMultipleSettings = async (settings: Record<string, string>) => {
    try {
      const promises = Object.entries(settings).map(([key, value]) => 
        apiRequest("POST", "/api/settings", { key, value })
      );
      
      await Promise.all(promises);
      
      // Invalidate all settings
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
      
      toast({
        title: "Settings saved",
        description: "All settings have been updated",
      });
      
      return true;
    } catch (err) {
      toast({
        title: "Failed to save settings",
        description: err instanceof Error ? err.message : "An error occurred",
        variant: "destructive",
      });
      
      return false;
    }
  };

  return { saveMultipleSettings };
}