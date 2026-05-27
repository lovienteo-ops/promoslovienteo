import { Flame, Clock, ArrowDown } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative pt-24 sm:pt-32 pb-16 sm:pb-20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-amber-50/30" />
      <div className="absolute top-20 right-0 w-96 h-96 bg-yellow-200/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-100/20 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-red-500 to-orange-500 text-white px-4 py-1.5 rounded-full text-sm font-semibold mb-6 shadow-lg shadow-red-500/20 animate-pulse">
            <Flame className="w-4 h-4" />
            Ofertas por tiempo limitado
            <Clock className="w-4 h-4" />
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight leading-[1.1]">
            Los productos más{' '}
            <span className="bg-gradient-to-r from-yellow-500 to-amber-500 bg-clip-text text-transparent">
              vendidos
            </span>{' '}
            en Mercado Libre
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Descubre las mejores ofertas con descuentos exclusivos. Productos verificados con
            envío gratis y la protección de compra de Mercado Libre.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#productos"
              className="inline-flex items-center gap-2 bg-gray-900 text-white px-8 py-4 rounded-2xl text-base font-semibold hover:bg-gray-800 transition-all duration-200 shadow-xl shadow-gray-900/20 hover:shadow-gray-900/30 hover:-translate-y-0.5"
            >
              Ver ofertas
              <ArrowDown className="w-4 h-4" />
            </a>
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <div className="flex -space-x-2">
                {['bg-blue-400', 'bg-emerald-400', 'bg-amber-400', 'bg-rose-400'].map(
                  (color, i) => (
                    <div
                      key={i}
                      className={`w-8 h-8 ${color} rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold`}
                    >
                      {String.fromCharCode(65 + i)}
                    </div>
                  )
                )}
              </div>
              <span>
                <strong className="text-gray-900">+5,000</strong> compradores satisfechos
              </span>
            </div>
          </div>

          <div className="mt-12 grid grid-cols-3 gap-6 max-w-lg mx-auto">
            {[
              { value: '70%', label: 'Descuento máx.' },
              { value: '24h', label: 'Envío gratis' },
              { value: '100%', label: 'Compra segura' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm text-gray-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
