import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User Schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

// Menu Items Schema
export const menuItems = pgTable("menu_items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  price: integer("price").notNull(),
  purchasePrice: integer("purchase_price"),
  category: text("category").notNull(),
  details: text("details"),
  disabled: boolean("disabled").default(false),
});

// Orders Schema
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  status: text("status").notNull().default("Pending"),
  name: text("name"),
  roomNumber: text("room_number").notNull(),
  mobileNumber: text("mobile_number").notNull(),
  items: jsonb("items").notNull(),
  total: integer("total").notNull(),
});

// Tourism Places Schema
export const tourismPlaces = pgTable("tourism_places", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  distance: text("distance").notNull(),
  tags: text("tags").array().notNull(),
  mapsLink: text("maps_link").notNull(),
});

// Admin Settings Schema
export const adminSettings = pgTable("admin_settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
});

// Zod Schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertMenuItemSchema = createInsertSchema(menuItems).pick({
  name: true,
  price: true,
  purchasePrice: true,
  category: true,
  details: true,
  disabled: true,
});

export const insertOrderSchema = createInsertSchema(orders)
  .omit({ id: true, timestamp: true })
  .extend({
    items: z.array(z.object({
      id: z.number(),
      name: z.string(),
      price: z.number(),
      purchasePrice: z.number().optional(),
      category: z.string(),
      details: z.string().optional(),
      quantity: z.number(),
    })),
  });

export const insertTourismPlaceSchema = createInsertSchema(tourismPlaces).pick({
  title: true,
  description: true,
  distance: true,
  tags: true,
  mapsLink: true,
});

export const insertAdminSettingSchema = createInsertSchema(adminSettings).pick({
  key: true,
  value: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertMenuItem = z.infer<typeof insertMenuItemSchema>;
export type MenuItem = typeof menuItems.$inferSelect;

export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;

export type InsertTourismPlace = z.infer<typeof insertTourismPlaceSchema>;
export type TourismPlace = typeof tourismPlaces.$inferSelect;

export type InsertAdminSetting = z.infer<typeof insertAdminSettingSchema>;
export type AdminSetting = typeof adminSettings.$inferSelect;
