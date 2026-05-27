import { useState, useEffect, useCallback } from 'react';
import { supabase, Product, Category } from './lib/supabase';
import Header from './components/Header';
import Hero from './components/Hero';
import TrustBar from './components/TrustBar';
import ProductGrid from './components/ProductGrid';
import ProductDetail from './components/ProductDetail';
import Footer from './components/Footer';
import LandingLinks from './components/LandingLinks';

type View = 'home' | 'detail';

export default function App() {
  const [view, setView] = useState<View>('home');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCategories = useCallback(async () => {
    const { data } = await supabase.from('categories').select('*').order('sort_order');
    if (data) setCategories(data);
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('products')
      .select('*, categories(*)')
      .order('is_featured', { ascending: false })
      .order('sold_count', { ascending: false });

    if (activeCategory) {
      const { data: catData } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', activeCategory)
        .maybeSingle();

      if (catData) {
        query = query.eq('category_id', catData.id);
      }
    }

    const { data } = await query;
    if (data) setProducts(data as Product[]);
    setLoading(false);
  }, [activeCategory]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleCategoryChange = (slug: string | null) => {
    setActiveCategory(slug);
    if (view === 'detail') {
      setView('home');
      setSelectedProduct(null);
    }
  };

  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
    setView('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    setView('home');
    setSelectedProduct(null);
  };

  if (view === 'detail' && selectedProduct) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header
          categories={categories}
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
        />
        <ProductDetail product={selectedProduct} onBack={handleBack} />
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        categories={categories}
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
      />
      <Hero />
      <TrustBar />
      <section id="productos" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
              {activeCategory
                ? categories.find((c) => c.slug === activeCategory)?.name || 'Productos'
                : 'Ofertas destacadas'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {products.length} producto{products.length !== 1 ? 's' : ''} disponible
              {products.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <ProductGrid products={products} loading={loading} onViewProduct={handleViewProduct} />
      </section>
      <LandingLinks />
      <Footer />
    </div>
  );
}
