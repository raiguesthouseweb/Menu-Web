import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertMenuItemSchema, insertOrderSchema, insertTourismPlaceSchema, insertAdminSettingSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes for menu items
  app.get("/api/menu", async (req, res) => {
    const menuItems = await storage.getMenuItems();
    res.json(menuItems);
  });
  
  app.get("/api/menu/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    
    const menuItem = await storage.getMenuItem(id);
    if (!menuItem) {
      return res.status(404).json({ message: "Menu item not found" });
    }
    
    res.json(menuItem);
  });
  
  app.post("/api/menu", async (req, res) => {
    try {
      const menuItemData = insertMenuItemSchema.parse(req.body);
      const newMenuItem = await storage.createMenuItem(menuItemData);
      res.status(201).json(newMenuItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid menu item data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create menu item" });
    }
  });
  
  app.patch("/api/menu/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    
    try {
      const menuItemData = insertMenuItemSchema.partial().parse(req.body);
      const updatedMenuItem = await storage.updateMenuItem(id, menuItemData);
      
      if (!updatedMenuItem) {
        return res.status(404).json({ message: "Menu item not found" });
      }
      
      res.json(updatedMenuItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid menu item data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update menu item" });
    }
  });
  
  app.delete("/api/menu/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    
    const success = await storage.deleteMenuItem(id);
    if (!success) {
      return res.status(404).json({ message: "Menu item not found" });
    }
    
    res.status(204).end();
  });
  
  // API routes for orders
  app.get("/api/orders", async (req, res) => {
    const query = req.query.q as string;
    
    if (query) {
      const orders = await storage.getOrdersByRoomOrMobile(query);
      return res.json(orders);
    }
    
    const orders = await storage.getOrders();
    res.json(orders);
  });
  
  app.get("/api/orders/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    
    const order = await storage.getOrder(id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    
    res.json(order);
  });
  
  app.post("/api/orders", async (req, res) => {
    try {
      const orderData = insertOrderSchema.parse(req.body);
      const newOrder = await storage.createOrder(orderData);
      res.status(201).json(newOrder);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid order data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create order" });
    }
  });
  
  app.patch("/api/orders/:id/status", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    
    const updateSchema = z.object({
      status: z.string().refine(s => ["Pending", "Preparing", "Delivered"].includes(s), {
        message: "Status must be one of: Pending, Preparing, Delivered"
      }).optional(),
      settled: z.boolean().optional(),
      restaurantPaid: z.boolean().optional()
    }).refine(data => Object.keys(data).length > 0, {
      message: "At least one field (status, settled, or restaurantPaid) must be provided"
    });
    
    try {
      const updates = updateSchema.parse(req.body);
      const updatedOrder = await storage.updateOrderStatus(id, updates);
      
      if (!updatedOrder) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      res.json(updatedOrder);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid status", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update order status" });
    }
  });
  
  // API routes for tourism places
  app.get("/api/tourism", async (req, res) => {
    const tourismPlaces = await storage.getTourismPlaces();
    res.json(tourismPlaces);
  });
  
  app.get("/api/tourism/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    
    const tourismPlace = await storage.getTourismPlace(id);
    if (!tourismPlace) {
      return res.status(404).json({ message: "Tourism place not found" });
    }
    
    res.json(tourismPlace);
  });
  
  app.post("/api/tourism", async (req, res) => {
    try {
      const tourismPlaceData = insertTourismPlaceSchema.parse(req.body);
      const newTourismPlace = await storage.createTourismPlace(tourismPlaceData);
      res.status(201).json(newTourismPlace);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid tourism place data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create tourism place" });
    }
  });
  
  app.patch("/api/tourism/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    
    try {
      const tourismPlaceData = insertTourismPlaceSchema.partial().parse(req.body);
      const updatedTourismPlace = await storage.updateTourismPlace(id, tourismPlaceData);
      
      if (!updatedTourismPlace) {
        return res.status(404).json({ message: "Tourism place not found" });
      }
      
      res.json(updatedTourismPlace);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid tourism place data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update tourism place" });
    }
  });
  
  app.delete("/api/tourism/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    
    const success = await storage.deleteTourismPlace(id);
    if (!success) {
      return res.status(404).json({ message: "Tourism place not found" });
    }
    
    res.status(204).end();
  });
  
  // API routes for admin settings
  app.get("/api/settings/:key", async (req, res) => {
    const key = req.params.key;
    const setting = await storage.getAdminSetting(key);
    
    if (!setting) {
      return res.status(404).json({ message: "Setting not found" });
    }
    
    res.json(setting);
  });
  
  app.post("/api/settings", async (req, res) => {
    try {
      const settingData = insertAdminSettingSchema.parse(req.body);
      const newSetting = await storage.setAdminSetting(settingData);
      res.status(201).json(newSetting);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid setting data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create setting" });
    }
  });
  
  // Create the HTTP server
  const httpServer = createServer(app);
  
  // Set up WebSocket server for real-time notifications
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // Store connected clients
  const clients = new Set<WebSocket>();
  
  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');
    
    // Add client to the set
    clients.add(ws);
    
    // Send initial message
    ws.send(JSON.stringify({ type: 'connection', message: 'Connected to Rai Guest House WebSocket server' }));
    
    // Handle messages from clients
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log('Received message:', data);
        
        // Echo back to sender for testing
        ws.send(JSON.stringify({ type: 'echo', data }));
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    });
    
    // Handle disconnection
    ws.on('close', () => {
      console.log('WebSocket client disconnected');
      clients.delete(ws);
    });
  });
  
  // Intercept order creation to send WebSocket notifications
  const originalCreateOrder = storage.createOrder.bind(storage);
  storage.createOrder = async (orderData) => {
    const newOrder = await originalCreateOrder(orderData);
    
    // Broadcast to all connected clients
    const notification = JSON.stringify({
      type: 'new-order',
      order: newOrder
    });
    
    clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(notification);
      }
    });
    
    return newOrder;
  };
  
  // Intercept order status updates to send WebSocket notifications
  const originalUpdateOrderStatus = storage.updateOrderStatus.bind(storage);
  storage.updateOrderStatus = async (id, updates) => {
    const updatedOrder = await originalUpdateOrderStatus(id, updates);
    
    if (updatedOrder) {
      // Broadcast to all connected clients
      const notification = JSON.stringify({
        type: 'order-status-update',
        order: updatedOrder
      });
      
      clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(notification);
        }
      });
    }
    
    return updatedOrder;
  };
  
  return httpServer;
}
