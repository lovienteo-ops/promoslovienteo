import { Star, ShoppingCart, Flame, Clock, Eye } from 'lucide-react';
import { Product } from '../lib/supabase';

type ProductCardProps = {
  product: Product;
  onView: (product: Product) => void;
};

export default function ProductCard({ product, onView }: ProductCardProps) {
  const formatPrice = (price: number) =>
    new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(price);

  const stockLevel =
    product.stock_remaining <= 5
      ? 'critical'
      : product.stock_remaining <= 15
        ? 'low'
        : 'normal';

  return (
    <div
      className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 hover:-translate-y-1 flex flex-col"
    >
      <div className="relative aspect-square bg-gray-50 overflow-hidden">
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {product.discount_percentage > 0 && (
          <div className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow-lg">
            -{product.discount_percentage}%
          </div>
        )}

        {product.is_best_seller && (
          <div className="absolute top-3 right-3 bg-gradient-to-r from-amber-400 to-yellow-400 text-gray-900 text-xs font-bold px-2.5 py-1 rounded-lg shadow-lg flex items-center gap-1">
            <Flame className="w-3 h-3" />
            Más vendido
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <button
          onClick={() => onView(product)}
          className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm text-gray-700 p-2.5 rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white hover:scale-110"
        >
          <Eye className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug mb-2 group-hover:text-amber-600 transition-colors">
          {product.name}
        </h3>

        <div className="flex items-center gap-1.5 mb-2">
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-3.5 h-3.5 ${
                  i < Math.round(product.rating)
                    ? 'text-amber-400 fill-amber-400'
                    : 'text-gray-200 fill-gray-200'
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-gray-500">({product.review_count})</span>
        </div>

        <div className="mt-auto">
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-xl font-extrabold text-gray-900">
              {formatPrice(product.current_price)}
            </span>
            {product.discount_percentage > 0 && (
              <span className="text-sm text-gray-400 line-through">
                {formatPrice(product.original_price)}
              </span>
            )}
          </div>

          {stockLevel !== 'normal' && (
            <div
              className={`flex items-center gap-1 text-xs font-medium mb-3 ${
                stockLevel === 'critical' ? 'text-red-600' : 'text-amber-600'
              }`}
            >
              <Clock className="w-3 h-3" />
              {stockLevel === 'critical'
                ? `Solo quedan ${product.stock_remaining}!`
                : `Quedan ${product.stock_remaining} unidades`}
            </div>
          )}

          <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>{product.sold_count.toLocaleString()} vendidos</span>
          </div>

          <a
            href={product.mercadolibre_url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-400 to-amber-400 text-gray-900 font-bold py-3 rounded-xl hover:from-yellow-500 hover:to-amber-500 transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 text-sm"
          >
            Comprar en Mercado Libre
          </a>
        </div>
      </div>
    </div>
  );
}
