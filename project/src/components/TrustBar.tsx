import { Shield, Truck, Award, Headphones } from 'lucide-react';

export default function TrustBar() {
  return (
    <section className="bg-white border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[
            {
              icon: Shield,
              title: 'Compra Protegida',
              desc: 'Dinero devuelto si no recibes tu producto',
            },
            {
              icon: Truck,
              title: 'Envío Gratis',
              desc: 'En miles de productos a todo México',
            },
            {
              icon: Award,
              title: 'Vendedores Verificados',
              desc: 'Solo productos de vendedores confiables',
            },
            {
              icon: Headphones,
              title: 'Soporte Mercado Libre',
              desc: 'Atención 24/7 para tu compra',
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">{title}</h3>
                <p className="text-xs text-gray-500 hidden sm:block">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
