import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Product = {
  id: string;
  category_id: string | null;
  name: string;
  slug: string;
  description: string;
  original_price: number;
  current_price: number;
  discount_percentage: number;
  image_url: string;
  gallery_urls: string[];
  mercadolibre_url: string;
  rating: number;
  review_count: number;
  sold_count: number;
  is_best_seller: boolean;
  is_featured: boolean;
  stock_remaining: number;
  features: string[];
  created_at: string;
  updated_at: string;
  categories?: Category;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  icon: string;
  sort_order: number;
  created_at: string;
};
