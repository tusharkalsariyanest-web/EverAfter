import { pgTable, serial, text, timestamp, varchar, boolean, integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// =========================================================================
// 1. USER AUTHENTICATION & PROFILES (Firebase Google Auth Sync)
// =========================================================================

export const users = pgTable("users", {
  // Use varchar instead of serial so we can store the unique Firebase 'uid' directly
  id: varchar("id", { length: 255 }).primaryKey(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).unique().notNull(),
  phone: varchar("phone", { length: 15 }), // Optional initially, captured during checkout
  image: text("image"), // Stores their Google profile picture URL
  createdAt: timestamp("created_at").defaultNow(),
});

// =========================================================================
// 2. PRODUCTS: GOWNS & REELS
// =========================================================================

export const gowns = pgTable("gowns", {
  id: serial("id").primaryKey(),
  
  // Basic Info
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  price: varchar("price", { length: 50 }), 
  itemCode: varchar("item_code", { length: 50 }), // SKU
  
  // Specifications
  fabric: varchar("fabric", { length: 50 }).default('Premium Net'), 
  color: varchar("color", { length: 50 }), 
  sizeOptions: varchar("size_options", { length: 100 }).default('Free Size / Adjustable'), 
  
  // Images
  imageUrls: text("image_urls"), 

  // Filters
  category: varchar("category", { length: 100 }).notNull(), // "Prewedding" or "Maternity"
  style: varchar("style", { length: 100 }), 
  targetAudience: varchar("target_audience", { length: 100 }).default('Women'),
  occasion: varchar("occasion", { length: 100 }), 

  inStock: boolean("in_stock").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const reels = pgTable("reels", {
  id: serial("id").primaryKey(),
  gownId: integer("gown_id").references(() => gowns.id), 
  videoUrl: text("video_url").notNull(), 
  thumbnailUrl: text("thumbnail_url"), 
  caption: text("caption"), 
  category: varchar("category", { length: 100 }).notNull().default('Prewedding'),
  isFeaturedOnHome: boolean("is_featured_on_home").default(false),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// =========================================================================
// 3. E-COMMERCE: ORDERS & ITEMS (Supports Logged-In & Guest)
// =========================================================================

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  
  // CRITICAL LINK: Connects to users table. 
  // Left NULLABLE so guest users can purchase without an account.
  userId: varchar("user_id", { length: 255 }).references(() => users.id),
  
  // Snapshot of customer details filled during checkout (Mandatory for all)
  phone: varchar("phone", { length: 15 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  
  // Shipping Details
  address: text("address").notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  pincode: varchar("pincode", { length: 10 }).notNull(),
  
  // Financials
  totalAmount: integer("total_amount").notNull(),
  
  // Payment Tracking
  status: varchar("status", { length: 20 }).notNull().default("PENDING"), // PENDING, PAID, SHIPPED, DELIVERED
  razorpayOrderId: varchar("razorpay_order_id", { length: 255 }),
  razorpayPaymentId: varchar("razorpay_payment_id", { length: 255 }),
  
  // Fulfillment & Logistics Tracking (Delhivery Integrations)
  trackingId: varchar("tracking_id", { length: 255 }), // Delhivery AWB Number
  courierPartner: varchar("courier_partner", { length: 100 }).default("Delhivery"), 
  shippingSpeed: varchar("shipping_speed", { length: 50 }).default("Standard"), 
  adminNotes: text("admin_notes"), 
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  gownId: integer("gown_id").references(() => gowns.id).notNull(), 
  name: varchar("name", { length: 255 }).notNull(),
  quantity: integer("quantity").notNull(),
  price: integer("price").notNull(), // Snapshot of price at moment of purchase
});

// =========================================================================
// 4. DRIZZLE RELATIONSHIPS
// =========================================================================

// Users Relations (One user can have many orders)
export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
}));

// Orders Relations (An order belongs to one user optional, and has many items)
export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  items: many(orderItems),
}));

// Order Items Relations
export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  gown: one(gowns, {
    fields: [orderItems.gownId],
    references: [gowns.id],
  }),
}));

// Gowns Relations (To cleanly query which reels showcase this gown)
export const gownsRelations = relations(gowns, ({ many }) => ({
  reels: many(reels),
}));

export const reelsRelations = relations(reels, ({ one }) => ({
  gown: one(gowns, {
    fields: [reels.gownId],
    references: [gowns.id],
  }),
}));