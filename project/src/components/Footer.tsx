import { Shield, Truck, RefreshCw, ShoppingBag } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {[
            {
              icon: Shield,
              title: 'Compra Segura',
              desc: 'Todas las transacciones se realizan a través de Mercado Libre con protección al comprador.',
            },
            {
              icon: Truck,
              title: 'Envío Gratis',
              desc: 'Productos con envío gratuito a todo el país en compras elegibles.',
            },
            {
              icon: RefreshCw,
              title: 'Devoluciones',
              desc: 'Política de devolución de Mercado Libre. Compra sin preocupaciones.',
            },
            {
              icon: ShoppingBag,
              title: 'Productos Verificados',
              desc: 'Solo promovemos productos de vendedores confiables con buenas calificaciones.',
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex gap-3">
              <div className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white mb-1">{title}</h4>
                <p className="text-xs leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Product links */}
        <div className="border-t border-gray-800 pt-8 pb-6">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Nuestros productos destacados</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              {
                href: 'https://lovienteopromos.com/star-nutrition-whey-protein/',
                label: 'Whey Protein Star Nutrition Banana Cream 908g',
                sub: '+13762 reseñas · 6 cuotas sin interés',
              },
              {
                href: 'https://lovienteopromos.com/creatinastar/',
                label: 'Creatina Star Nutrition Monohidratada 1 kg',
                sub: '+2931 reseñas · 35% OFF · 200 porciones',
              },
              {
                href: 'https://lovienteopromos.com/aspiradora-voltra-3en1/',
                label: 'Aspiradora Voltra 3 en 1 Black Edition',
                sub: '48% OFF · Aspira, sopla y limpia rincones',
              },
              {
                href: 'https://lovienteopromos.com/inflador-neumaticos/',
                label: 'Inflador Neumáticos Digital Inalámbrico',
                sub: 'Auto, moto, bici · 5000 mAh · Pantalla LCD',
              },
              {
                href: 'https://lovienteopromos.com/joystick-ps5-cosmic-red/',
                label: 'Joystick PS5 DualSense Cosmic Red',
                sub: 'Edición Especial · Vibración háptica',
              },
              {
                href: 'https://lovienteopromos.com/ninja-blast-portable-blender/',
                label: 'Ninja Blast Portable Blender',
                sub: 'Inalámbrico · 530 ml · USB-C',
              },
              {
                href: 'https://lovienteopromos.com/fine-beauty-colageno/',
                label: 'Fine Beauty Colágeno Hidrolizado',
                sub: 'Piel, pelo y articulaciones · Sin azúcar',
              },
              {
                href: 'https://lovienteopromos.com/starlink-estandar/',
                label: 'Starlink Estándar',
                sub: 'Internet satelital · Sin límite de datos',
              },
              {
                href: 'https://lovienteopromos.com/starlink-mini/',
                label: 'Starlink Mini',
                sub: 'Compacto y portátil · Ideal para viajes',
              },
              {
                href: 'https://lovienteopromos.com/mini-heladera-suono/',
                label: 'Mini Heladera Suono 2 en 1',
                sub: 'Enfría y calienta · Alto diseño',
              },
            ].map(({ href, label, sub }) => (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noopener"
                className="block bg-gray-800 rounded-xl p-3 hover:bg-gray-700 transition-colors group"
              >
                <span className="block text-xs font-semibold text-white group-hover:text-amber-400 transition-colors leading-snug mb-1">{label}</span>
                <span className="block text-xs text-gray-500">{sub}</span>
              </a>
            ))}
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-lg flex items-center justify-content-center flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 text-gray-900" />
              </div>
              <span className="text-sm font-bold text-white">Lo Vi En Teo</span>
            </div>
            <div className="flex flex-wrap gap-3">
              <a href="https://www.instagram.com/lovienteo/" target="_blank" rel="noopener" className="text-xs text-gray-500 hover:text-amber-400 transition-colors">Instagram @lovienteo</a>
              <a href="https://www.facebook.com/tiendaborela/" target="_blank" rel="noopener" className="text-xs text-gray-500 hover:text-amber-400 transition-colors">Facebook</a>
              <a href="https://www.tiktok.com/@lovienteo" target="_blank" rel="noopener" className="text-xs text-gray-500 hover:text-amber-400 transition-colors">TikTok @lovienteo</a>
              <a href="https://wa.me/541131412827" target="_blank" rel="noopener" className="text-xs text-gray-500 hover:text-amber-400 transition-colors">WhatsApp</a>
            </div>
          </div>

          <p className="text-xs text-gray-500 mb-4">
            Este sitio participa en el programa de afiliados de Mercado Libre. Las compras se
            realizan directamente en Mercado Libre. Precios sujetos a cambios.
          </p>

          {/* SEO keywords */}
          <div className="flex flex-wrap gap-x-3 gap-y-1">
            {[
              'ofertas Argentina',
              'descuentos online Argentina',
              'productos virales Argentina',
              'suplementos deportivos argentina',
              'whey protein argentina',
              'creatina monohidratada argentina',
              'creatina star nutrition',
              'whey protein star nutrition',
              'aspiradora inalámbrica argentina',
              'inflador neumáticos digital',
              'compras online argentina',
              'envio gratis argentina',
              'mercado libre ofertas',
              '6 cuotas sin interés',
              '12 cuotas sin interés',
              'lovienteo',
              'lo vi en teo',
              'lovienteopromos',
              'suplementos mercado libre',
              'gadgets hogar argentina',
            ].map(kw => (
              <a
                key={kw}
                href="https://lovienteopromos.com/"
                className="text-xs"
                style={{ color: 'rgba(255,255,255,0.06)', fontSize: '0.55rem' }}
              >
                {kw}
              </a>
            ))}
          </div>

          <p className="text-xs text-gray-600 mt-4 text-center">
            Lo Vi En Teo &copy; 2025 &middot; Buenos Aires, Argentina &middot; lovienteopromos.com
          </p>
        </div>
      </div>
    </footer>
  );
}
