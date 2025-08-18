-- SQL Schema for PetConnect - Supabase Version
-- This file creates all necessary tables for the PetConnect platform

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE user_role AS ENUM ('customer', 'seller', 'dog_walker', 'admin');
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled', 'refunded');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
CREATE TYPE payment_method AS ENUM ('credit_card', 'paypal', 'bank_transfer', 'cash');
CREATE TYPE product_condition AS ENUM ('new', 'used_like_new', 'used_good', 'used_fair');
CREATE TYPE service_status AS ENUM ('available', 'unavailable', 'in_progress', 'completed', 'cancelled');
CREATE TYPE badge_type AS ENUM ('verified_seller', 'top_rated', 'fast_delivery', 'quality_products', 'trusted_walker', 'responsive');
CREATE TYPE verification_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE notification_type AS ENUM ('order_update', 'payment_received', 'product_available', 'promotion', 'system');
CREATE TYPE ticket_status AS ENUM ('open', 'in_progress', 'resolved', 'closed');
CREATE TYPE ticket_priority AS ENUM ('low', 'medium', 'high', 'urgent');

-- Create tables

-- Users table
CREATE TABLE "Users" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "username" VARCHAR(50) UNIQUE NOT NULL,
    "email" VARCHAR(255) UNIQUE NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "full_name" VARCHAR(100) NOT NULL,
    "phone" VARCHAR(20),
    "profile_image_url" VARCHAR(255),
    "role" user_role NOT NULL DEFAULT 'customer',
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "last_login" TIMESTAMP WITH TIME ZONE,
    "is_active" BOOLEAN DEFAULT TRUE,
    "email_verified" BOOLEAN DEFAULT FALSE
);

-- Customers table
CREATE TABLE "Customers" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "user_id" UUID NOT NULL REFERENCES "Users"("id") ON DELETE CASCADE,
    "address" TEXT,
    "city" VARCHAR(100),
    "state" VARCHAR(100),
    "postal_code" VARCHAR(20),
    "country" VARCHAR(100),
    "preferences" JSONB,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sellers table
CREATE TABLE "Sellers" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "user_id" UUID NOT NULL REFERENCES "Users"("id") ON DELETE CASCADE,
    "store_name" VARCHAR(100) NOT NULL,
    "store_description" TEXT,
    "store_logo_url" VARCHAR(255),
    "address" TEXT,
    "city" VARCHAR(100),
    "state" VARCHAR(100),
    "postal_code" VARCHAR(20),
    "country" VARCHAR(100),
    "phone" VARCHAR(20),
    "verification_status" verification_status DEFAULT 'pending',
    "verification_documents" JSONB,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- DogWalkers table
CREATE TABLE "DogWalkers" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "user_id" UUID NOT NULL REFERENCES "Users"("id") ON DELETE CASCADE,
    "experience_years" INTEGER,
    "description" TEXT,
    "profile_image_url" VARCHAR(255),
    "address" TEXT,
    "city" VARCHAR(100),
    "state" VARCHAR(100),
    "postal_code" VARCHAR(20),
    "country" VARCHAR(100),
    "phone" VARCHAR(20),
    "verification_status" verification_status DEFAULT 'pending',
    "verification_documents" JSONB,
    "hourly_rate" DECIMAL(10, 2),
    "availability" JSONB,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categories table
CREATE TABLE "Categories" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "parent_id" UUID REFERENCES "Categories"("id") ON DELETE SET NULL,
    "image_url" VARCHAR(255),
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products table
CREATE TABLE "Products" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "seller_id" UUID NOT NULL REFERENCES "Sellers"("id") ON DELETE CASCADE,
    "category_id" UUID NOT NULL REFERENCES "Categories"("id") ON DELETE RESTRICT,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "price" DECIMAL(10, 2) NOT NULL,
    "discount_price" DECIMAL(10, 2),
    "stock_quantity" INTEGER NOT NULL DEFAULT 0,
    "sku" VARCHAR(100) UNIQUE,
    "condition" product_condition DEFAULT 'new',
    "brand" VARCHAR(100),
    "weight" DECIMAL(10, 2),
    "dimensions" VARCHAR(100),
    "images" JSONB,
    "is_featured" BOOLEAN DEFAULT FALSE,
    "is_active" BOOLEAN DEFAULT TRUE,
    "view_count" INTEGER DEFAULT 0,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Services table
CREATE TABLE "Services" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "dog_walker_id" UUID NOT NULL REFERENCES "DogWalkers"("id") ON DELETE CASCADE,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "price" DECIMAL(10, 2) NOT NULL,
    "duration" INTEGER NOT NULL,
    "location" VARCHAR(255),
    "max_dogs" INTEGER DEFAULT 1,
    "requirements" JSONB,
    "images" JSONB,
    "is_active" BOOLEAN DEFAULT TRUE,
    "status" service_status DEFAULT 'available',
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table
CREATE TABLE "Orders" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "customer_id" UUID NOT NULL REFERENCES "Customers"("id") ON DELETE RESTRICT,
    "status" order_status NOT NULL DEFAULT 'pending',
    "total_amount" DECIMAL(10, 2) NOT NULL,
    "shipping_address" TEXT,
    "shipping_city" VARCHAR(100),
    "shipping_state" VARCHAR(100),
    "shipping_postal_code" VARCHAR(20),
    "shipping_country" VARCHAR(100),
    "notes" TEXT,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "shipped_at" TIMESTAMP WITH TIME ZONE,
    "delivered_at" TIMESTAMP WITH TIME ZONE
);

-- OrderItems table
CREATE TABLE "OrderItems" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "order_id" UUID NOT NULL REFERENCES "Orders"("id") ON DELETE CASCADE,
    "product_id" UUID REFERENCES "Products"("id") ON DELETE SET NULL,
    "service_id" UUID REFERENCES "Services"("id") ON DELETE SET NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "price" DECIMAL(10, 2) NOT NULL,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments table
CREATE TABLE "Payments" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "order_id" UUID NOT NULL REFERENCES "Orders"("id") ON DELETE CASCADE,
    "amount" DECIMAL(10, 2) NOT NULL,
    "payment_method" payment_method NOT NULL,
    "status" payment_status NOT NULL DEFAULT 'pending',
    "transaction_id" VARCHAR(255),
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "processed_at" TIMESTAMP WITH TIME ZONE
);

-- Reviews table
CREATE TABLE "Reviews" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "customer_id" UUID NOT NULL REFERENCES "Customers"("id") ON DELETE CASCADE,
    "product_id" UUID REFERENCES "Products"("id") ON DELETE CASCADE,
    "service_id" UUID REFERENCES "Services"("id") ON DELETE CASCADE,
    "seller_id" UUID REFERENCES "Sellers"("id") ON DELETE CASCADE,
    "dog_walker_id" UUID REFERENCES "DogWalkers"("id") ON DELETE CASCADE,
    "rating" INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    "comment" TEXT,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Badges table
CREATE TABLE "Badges" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "image_url" VARCHAR(255),
    "type" badge_type NOT NULL,
    "criteria" JSONB,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- UserBadges table
CREATE TABLE "UserBadges" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "user_id" UUID NOT NULL REFERENCES "Users"("id") ON DELETE CASCADE,
    "badge_id" UUID NOT NULL REFERENCES "Badges"("id") ON DELETE CASCADE,
    "earned_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "expires_at" TIMESTAMP WITH TIME ZONE
);

-- Notifications table
CREATE TABLE "Notifications" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "user_id" UUID NOT NULL REFERENCES "Users"("id") ON DELETE CASCADE,
    "type" notification_type NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "message" TEXT NOT NULL,
    "is_read" BOOLEAN DEFAULT FALSE,
    "data" JSONB,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SupportTickets table
CREATE TABLE "SupportTickets" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "user_id" UUID NOT NULL REFERENCES "Users"("id") ON DELETE CASCADE,
    "subject" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "status" ticket_status NOT NULL DEFAULT 'open',
    "priority" ticket_priority NOT NULL DEFAULT 'medium',
    "assigned_to" UUID REFERENCES "Users"("id"),
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "resolved_at" TIMESTAMP WITH TIME ZONE
);

-- TicketMessages table
CREATE TABLE "TicketMessages" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "ticket_id" UUID NOT NULL REFERENCES "SupportTickets"("id") ON DELETE CASCADE,
    "user_id" UUID NOT NULL REFERENCES "Users"("id") ON DELETE CASCADE,
    "message" TEXT NOT NULL,
    "is_internal" BOOLEAN DEFAULT FALSE,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Promotions table
CREATE TABLE "Promotions" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "code" VARCHAR(50) UNIQUE NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "discount_type" VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    "discount_value" DECIMAL(10, 2) NOT NULL,
    "min_purchase_amount" DECIMAL(10, 2) DEFAULT 0,
    "max_uses" INTEGER,
    "used_count" INTEGER DEFAULT 0,
    "start_date" TIMESTAMP WITH TIME ZONE NOT NULL,
    "end_date" TIMESTAMP WITH TIME ZONE NOT NULL,
    "is_active" BOOLEAN DEFAULT TRUE,
    "applicable_to" VARCHAR(20) NOT NULL CHECK (applicable_to IN ('all', 'products', 'services')),
    "category_ids" UUID[],
    "product_ids" UUID[],
    "service_ids" UUID[],
    "user_ids" UUID[],
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- UserPromotions table
CREATE TABLE "UserPromotions" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "user_id" UUID NOT NULL REFERENCES "Users"("id") ON DELETE CASCADE,
    "promotion_id" UUID NOT NULL REFERENCES "Promotions"("id") ON DELETE CASCADE,
    "order_id" UUID REFERENCES "Orders"("id") ON DELETE SET NULL,
    "used_at" TIMESTAMP WITH TIME ZONE,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Wishlists table
CREATE TABLE "Wishlists" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "customer_id" UUID NOT NULL REFERENCES "Customers"("id") ON DELETE CASCADE,
    "product_id" UUID REFERENCES "Products"("id") ON DELETE CASCADE,
    "service_id" UUID REFERENCES "Services"("id") ON DELETE CASCADE,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ShoppingCarts table
CREATE TABLE "ShoppingCarts" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "customer_id" UUID NOT NULL REFERENCES "Customers"("id") ON DELETE CASCADE,
    "product_id" UUID REFERENCES "Products"("id") ON DELETE CASCADE,
    "service_id" UUID REFERENCES "Services"("id") ON DELETE CASCADE,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AuditLogs table
CREATE TABLE "AuditLogs" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "user_id" UUID REFERENCES "Users"("id") ON DELETE SET NULL,
    "action" VARCHAR(100) NOT NULL,
    "entity_type" VARCHAR(50) NOT NULL,
    "entity_id" UUID NOT NULL,
    "old_values" JSONB,
    "new_values" JSONB,
    "ip_address" INET,
    "user_agent" TEXT,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics table
CREATE TABLE "Analytics" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "event_type" VARCHAR(50) NOT NULL,
    "event_data" JSONB,
    "user_id" UUID REFERENCES "Users"("id") ON DELETE SET NULL,
    "session_id" UUID,
    "ip_address" INET,
    "user_agent" TEXT,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SystemConfig table
CREATE TABLE "SystemConfig" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "key" VARCHAR(100) UNIQUE NOT NULL,
    "value" JSONB NOT NULL,
    "description" TEXT,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON "Users"("email");
CREATE INDEX idx_users_username ON "Users"("username");
CREATE INDEX idx_sellers_user_id ON "Sellers"("user_id");
CREATE INDEX idx_dog_walkers_user_id ON "DogWalkers"("user_id");
CREATE INDEX idx_customers_user_id ON "Customers"("user_id");
CREATE INDEX idx_products_seller_id ON "Products"("seller_id");
CREATE INDEX idx_products_category_id ON "Products"("category_id");
CREATE INDEX idx_services_dog_walker_id ON "Services"("dog_walker_id");
CREATE INDEX idx_orders_customer_id ON "Orders"("customer_id");
CREATE INDEX idx_order_items_order_id ON "OrderItems"("order_id");
CREATE INDEX idx_payments_order_id ON "Payments"("order_id");
CREATE INDEX idx_reviews_customer_id ON "Reviews"("customer_id");
CREATE INDEX idx_reviews_product_id ON "Reviews"("product_id");
CREATE INDEX idx_reviews_service_id ON "Reviews"("service_id");
CREATE INDEX idx_reviews_seller_id ON "Reviews"("seller_id");
CREATE INDEX idx_reviews_dog_walker_id ON "Reviews"("dog_walker_id");
CREATE INDEX idx_user_badges_user_id ON "UserBadges"("user_id");
CREATE INDEX idx_user_badges_badge_id ON "UserBadges"("badge_id");
CREATE INDEX idx_notifications_user_id ON "Notifications"("user_id");
CREATE INDEX idx_support_tickets_user_id ON "SupportTickets"("user_id");
CREATE INDEX idx_ticket_messages_ticket_id ON "TicketMessages"("ticket_id");
CREATE INDEX idx_promotions_code ON "Promotions"("code");
CREATE INDEX idx_user_promotions_user_id ON "UserPromotions"("user_id");
CREATE INDEX idx_user_promotions_promotion_id ON "UserPromotions"("promotion_id");
CREATE INDEX idx_wishlists_customer_id ON "Wishlists"("customer_id");
CREATE INDEX idx_shopping_carts_customer_id ON "ShoppingCarts"("customer_id");
CREATE INDEX idx_audit_logs_user_id ON "AuditLogs"("user_id");
CREATE INDEX idx_analytics_user_id ON "Analytics"("user_id");
CREATE INDEX idx_analytics_event_type ON "Analytics"("event_type");
CREATE INDEX idx_system_config_key ON "SystemConfig"("key");

-- Insert initial data

-- Categories
INSERT INTO "Categories" ("id", "name", "description") VALUES
(uuid_generate_v4(), 'Dog Food', 'Food and nutrition for dogs'),
(uuid_generate_v4(), 'Dog Toys', 'Toys and entertainment for dogs'),
(uuid_generate_v4(), 'Dog Accessories', 'Collars, leashes, and other accessories'),
(uuid_generate_v4(), 'Dog Health', 'Healthcare products for dogs'),
(uuid_generate_v4(), 'Dog Walking', 'Professional dog walking services'),
(uuid_generate_v4(), 'Dog Training', 'Training services for dogs'),
(uuid_generate_v4(), 'Dog Grooming', 'Grooming services for dogs'),
(uuid_generate_v4(), 'Dog Sitting', 'Pet sitting services');

-- Badges
INSERT INTO "Badges" ("id", "name", "description", "type", "criteria") VALUES
(uuid_generate_v4(), 'Verified Seller', 'This seller has verified their identity and business', 'verified_seller', '{"document_verification": true, "business_verification": true}'),
(uuid_generate_v4(), 'Top Rated', 'This seller has consistently high ratings', 'top_rated', '{"min_rating": 4.5, "min_reviews": 10}'),
(uuid_generate_v4(), 'Fast Delivery', 'This seller ships orders quickly', 'fast_delivery', '{"avg_delivery_time": 3}'),
(uuid_generate_v4(), 'Quality Products', 'This seller offers high-quality products', 'quality_products', '{"min_rating": 4.0, "return_rate": 0.05}'),
(uuid_generate_v4(), 'Trusted Walker', 'This dog walker is trusted by the community', 'trusted_walker', '{"background_check": true, "min_rating": 4.5}'),
(uuid_generate_v4(), 'Responsive', 'This user responds quickly to messages', 'responsive', '{"avg_response_time": 2}');

-- System Configuration
INSERT INTO "SystemConfig" ("id", "key", "value", "description") VALUES
(uuid_generate_v4(), 'site_name', '{"value": "PetConnect"}', 'Name of the website'),
(uuid_generate_v4(), 'site_description', '{"value": "Connecting pet owners with products and services"}', 'Description of the website'),
(uuid_generate_v4(), 'contact_email', '{"value": "support@petconnect.com"}', 'Contact email for support'),
(uuid_generate_v4(), 'contact_phone', '{"value": "+1 (555) 123-4567"}', 'Contact phone number'),
(uuid_generate_v4(), 'max_file_upload_size', '{"value": 10485760}', 'Maximum file upload size in bytes (10MB)'),
(uuid_generate_v4(), 'allowed_file_types', '{"value": ["image/jpeg", "image/png", "image/gif", "image/webp"]}', 'Allowed file types for uploads'),
(uuid_generate_v4(), 'default_pagination_limit', '{"value": 20}', 'Default number of items per page'),
(uuid_generate_v4(), 'max_pagination_limit', '{"value": 100}', 'Maximum number of items per page');

-- Create trigger function for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updated_at" = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updating updated_at timestamp
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON "Users" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON "Customers" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sellers_updated_at BEFORE UPDATE ON "Sellers" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_dog_walkers_updated_at BEFORE UPDATE ON "DogWalkers" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON "Categories" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON "Products" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON "Services" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON "Orders" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON "Payments" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON "Reviews" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_badges_updated_at BEFORE UPDATE ON "Badges" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_support_tickets_updated_at BEFORE UPDATE ON "SupportTickets" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_promotions_updated_at BEFORE UPDATE ON "Promotions" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_shopping_carts_updated_at BEFORE UPDATE ON "ShoppingCarts" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_system_config_updated_at BEFORE UPDATE ON "SystemConfig" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();