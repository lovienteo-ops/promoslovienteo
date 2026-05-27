import { useState } from 'react';
import {
  Star,
  ShoppingCart,
  Clock,
  Shield,
  Truck,
  ArrowLeft,
  Check,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import { Product } from '../lib/supabase';

type ProductDetailProps = {
  product: Product;
  onBack: () => void;
};

export default function ProductDetail({ product, onBack }: ProductDetailProps) {
  const [currentImage, setCurrentImage] = useState(0);
  const allImages = [product.image_url, ...product.gallery_urls].filter(Boolean);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(price);

  const stockLevel =
    product.stock_remaining <= 5
      ? 'critical'
      : product.stock_remaining <= 15
        ? 'low'
        : 'normal';

  const nextImage = () => setCurrentImage((i) => (i + 1) % allImages.length);
  const prevImage = () => setCurrentImage((i) => (i - 1 + allImages.length) % allImages.length);

  return (
    <div className="min-h-screen bg-gray-50 pt-20 sm:pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Volver a ofertas</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          <div className="space-y-4">
            <div className="relative aspect-square bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
              <img
                src={allImages[currentImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />

              {product.discount_percentage > 0 && (
                <div className="absolute top-4 left-4 bg-gradient-to-r from-red-500 to-orange-500 text-white text-sm font-bold px-3 py-1.5 rounded-lg shadow-lg">
                  -{product.discount_percentage}% OFF
                </div>
              )}

              {allImages.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white transition-all"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-700" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white transition-all"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-700" />
                  </button>
                </>
              )}
            </div>

            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentImage(i)}
                    className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 transition-all ${
                      i === currentImage
                        ? 'border-amber-400 shadow-md'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              {product.is_best_seller && (
                <div className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 text-xs font-bold px-3 py-1.5 rounded-full mb-3 border border-amber-200">
                  <Star className="w-3.5 h-3.5 fill-amber-500" />
                  Producto más vendido
                </div>
              )}
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight">
                {product.name}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.round(product.rating)
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-gray-200 fill-gray-200'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600 font-medium">
                {product.rating} ({product.review_count} reseñas)
              </span>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl sm:text-4xl font-extrabold text-gray-900">
                  {formatPrice(product.current_price)}
                </span>
                {product.discount_percentage > 0 && (
                  <span className="text-lg text-gray-400 line-through">
                    {formatPrice(product.original_price)}
                  </span>
                )}
              </div>
              {product.discount_percentage > 0 && (
                <div className="mt-2 inline-flex items-center gap-1 bg-red-50 text-red-600 text-sm font-bold px-3 py-1 rounded-lg">
                  Ahorras {formatPrice(product.original_price - product.current_price)} (
                  {product.discount_percentage}% OFF)
                </div>
              )}
            </div>

            {stockLevel !== 'normal' && (
              <div
                className={`flex items-center gap-2 px-4 py-3 rounded-xl border ${
                  stockLevel === 'critical'
                    ? 'bg-red-50 border-red-200 text-red-700'
                    : 'bg-amber-50 border-amber-200 text-amber-700'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span className="text-sm font-semibold">
                  {stockLevel === 'critical'
                    ? `Solo quedan ${product.stock_remaining} unidades - Se agota pronto!`
                    : `Quedan ${product.stock_remaining} unidades disponibles`}
                </span>
              </div>
            )}

            <div className="space-y-3">
              <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
            </div>

            {product.features.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                  Características
                </h3>
                <ul className="space-y-2">
                  {product.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                      <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Truck, label: 'Envío gratis', sublabel: 'A todo el país' },
                { icon: Shield, label: 'Compra protegida', sublabel: 'Mercado Libre' },
                { icon: ShoppingCart, label: `${product.sold_count.toLocaleString()}+`, sublabel: 'Vendidos' },
              ].map(({ icon: Icon, label, sublabel }) => (
                <div
                  key={label}
                  className="flex flex-col items-center text-center p-3 bg-gray-50 rounded-xl"
                >
                  <Icon className="w-5 h-5 text-gray-600 mb-1.5" />
                  <span className="text-xs font-bold text-gray-900">{label}</span>
                  <span className="text-[10px] text-gray-500">{sublabel}</span>
                </div>
              ))}
            </div>

            <a
              href={product.mercadolibre_url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-400 to-amber-400 text-gray-900 font-extrabold py-4 rounded-2xl hover:from-yellow-500 hover:to-amber-500 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 text-base"
            >
              Comprar ahora en Mercado Libre
              <ExternalLink className="w-4 h-4" />
            </a>

            <p className="text-center text-xs text-gray-400">
              Al hacer clic, serás redirigido a Mercado Libre para completar tu compra de forma segura
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
