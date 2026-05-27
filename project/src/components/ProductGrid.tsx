import { Loader2, PackageOpen } from 'lucide-react';
import { Product } from '../lib/supabase';
import ProductCard from './ProductCard';

type ProductGridProps = {
  products: Product[];
  loading: boolean;
  onViewProduct: (product: Product) => void;
};

export default function ProductGrid({ products, loading, onViewProduct }: ProductGridProps) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin mb-4" />
        <p className="text-gray-500 text-sm font-medium">Cargando ofertas...</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <PackageOpen className="w-12 h-12 text-gray-300 mb-4" />
        <p className="text-gray-500 text-sm font-medium">
          No hay productos disponibles en esta categoría
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} onView={onViewProduct} />
      ))}
    </div>
  );
}
