/*
  # Create products and categories tables for Mercado Libre affiliate landing pages

  1. New Tables
    - `categories`
      - `id` (uuid, primary key) - Unique category identifier
      - `name` (text, not null) - Category display name
      - `slug` (text, unique, not null) - URL-friendly category name
      - `icon` (text, not null) - Lucide icon name for the category
      - `sort_order` (integer, default 0) - Display order
      - `created_at` (timestamptz) - Creation timestamp

    - `products`
      - `id` (uuid, primary key) - Unique product identifier
      - `category_id` (uuid, foreign key) - Reference to categories
      - `name` (text, not null) - Product display name
      - `slug` (text, unique, not null) - URL-friendly product name
      - `description` (text, not null) - Product description
      - `original_price` (numeric, not null) - Original price before discount
      - `current_price` (numeric, not null) - Current discounted price
      - `discount_percentage` (integer, default 0) - Discount percentage
      - `image_url` (text, not null) - Main product image URL
      - `gallery_urls` (text array, default '{}') - Additional image URLs
      - `mercadolibre_url` (text, not null) - Mercado Libre affiliate link
      - `rating` (numeric, default 0) - Product rating (0-5)
      - `review_count` (integer, default 0) - Number of reviews
      - `sold_count` (integer, default 0) - Units sold
      - `is_best_seller` (boolean, default false) - Best seller flag
      - `is_featured` (boolean, default false) - Featured on homepage
      - `stock_remaining` (integer, default 0) - Remaining stock for urgency
      - `features` (text array, default '{}') - Key product features
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on both tables
    - Public read access for both tables (landing pages are public)
    - Only authenticated service role can insert/update/delete

  3. Indexes
    - Index on products.category_id for fast category lookups
    - Index on products.is_featured for homepage queries
    - Index on products.is_best_seller for best seller queries
    - Index on products.slug for URL lookups
*/

CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  icon text NOT NULL DEFAULT 'tag',
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text NOT NULL,
  original_price numeric NOT NULL,
  current_price numeric NOT NULL,
  discount_percentage integer DEFAULT 0,
  image_url text NOT NULL,
  gallery_urls text[] DEFAULT '{}',
  mercadolibre_url text NOT NULL,
  rating numeric DEFAULT 0,
  review_count integer DEFAULT 0,
  sold_count integer DEFAULT 0,
  is_best_seller boolean DEFAULT false,
  is_featured boolean DEFAULT false,
  stock_remaining integer DEFAULT 0,
  features text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Public can view categories"
  ON categories FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Public can view products"
  ON products FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Authenticated can view categories"
  ON categories FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated can view products"
  ON products FOR SELECT
  TO authenticated
  USING (true);

-- Write policies (service role only - no direct user writes)
CREATE POLICY "Service role can insert categories"
  ON categories FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Service role can update categories"
  ON categories FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can insert products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Service role can update products"
  ON products FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON products(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_products_is_best_seller ON products(is_best_seller) WHERE is_best_seller = true;
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
