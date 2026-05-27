const LANDINGS = [
  {
    href: 'https://lovienteopromos.com/star-nutrition-whey-protein/',
    img: '/star-nutrition-whey-protein/images/magnific_eliminar-de-la-imagen-img_3008900825.png',
    name: 'Whey Protein Star Nutrition',
    badge: '6 cuotas sin interés',
  },
  {
    href: 'https://lovienteopromos.com/creatinastar/',
    img: '/creatinastar/images/creatina-transparente.png',
    name: 'Creatina Star Nutrition',
    badge: '35% OFF · 200 porciones',
  },
  {
    href: 'https://lovienteopromos.com/aspiradora-voltra-3en1/',
    img: '/aspiradora-voltra-3en1/images/imagen-transparente.png',
    name: 'Aspiradora Voltra 3 en 1',
    badge: '48% OFF · Black Edition',
  },
  {
    href: 'https://lovienteopromos.com/mini-heladera-suono/',
    img: '/mini-heladera-suono/images/suono_(1).png',
    name: 'Mini Heladera Suono',
    badge: 'Alto Diseño · 2 en 1',
  },
  {
    href: 'https://lovienteopromos.com/inflador-neumaticos/',
    img: '/inflador-neumaticos/images/inflador-transparente.png',
    name: 'Inflador Neumáticos Digital',
    badge: '5000 mAh · Pantalla LCD',
  },
  {
    href: 'https://lovienteopromos.com/joystick-ps5-cosmic-red/',
    img: '/joystick-ps5-cosmic-red/images/dualsense.png',
    name: 'Joystick PS5 Cosmic Red',
    badge: 'DualSense · Edición Especial',
  },
  {
    href: 'https://lovienteopromos.com/ninja-blast-portable-blender/',
    img: '/ninja-blast-portable-blender/images/ninja.png',
    name: 'Ninja Blast Portable Blender',
    badge: 'Inalámbrico · 530 ml',
  },
  {
    href: 'https://lovienteopromos.com/fine-beauty-colageno/',
    img: '/fine-beauty-colageno/images/colageno.png',
    name: 'Fine Beauty Colágeno',
    badge: 'Hidrolizado · Piel & Articulaciones',
  },
  {
    href: 'https://lovienteopromos.com/starlink-estandar/',
    img: '/starlink-estandar/images/magnific_crea-una-imagen-igual-a-e_XtyDNT5Bfo.png',
    name: 'Starlink Estándar',
    badge: 'Internet satelital · Sin cable',
  },
  {
    href: 'https://lovienteopromos.com/starlink-mini/',
    img: '/antenaproducto.png',
    name: 'Starlink Mini',
    badge: 'Compacto · Portátil',
  },
];

const SOCIALS = [
  {
    href: 'https://www.instagram.com/lovienteo/',
    label: 'Instagram',
    icon: (
      <svg viewBox="0 0 100 100" width="44" height="44">
        <defs>
          <linearGradient id="ig-grad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#fd5" />
            <stop offset="30%" stopColor="#f75010" />
            <stop offset="60%" stopColor="#d1006e" />
            <stop offset="100%" stopColor="#a600af" />
          </linearGradient>
        </defs>
        <rect width="100" height="100" rx="22" fill="url(#ig-grad)" />
        <circle cx="50" cy="50" r="25" stroke="white" strokeWidth="6" fill="none" />
        <circle cx="72" cy="28" r="5" fill="white" />
      </svg>
    ),
  },
  {
    href: 'https://www.facebook.com/tiendaborela/',
    label: 'Facebook',
    icon: (
      <svg viewBox="0 0 100 100" width="44" height="44">
        <rect width="100" height="100" rx="22" fill="#1877F2" />
        <text x="50" y="72" textAnchor="middle" fontSize="65" fontFamily="Arial" fontWeight="bold" fill="white">f</text>
      </svg>
    ),
  },
  {
    href: 'https://www.tiktok.com/@lovienteo',
    label: 'TikTok',
    icon: (
      <svg viewBox="0 0 100 100" width="44" height="44">
        <rect width="100" height="100" rx="22" fill="#010101" />
        <path d="M65 20c1 8 5 13 15 14v10c-5 0-10-2-15-5v22c0 12-9 21-21 21s-21-9-21-21 9-21 21-21c1 0 2 0 3 .1V50c-1-.1-2-.1-3-.1-6 0-11 5-11 11s5 11 11 11 11-5 11-11V20h10z" fill="white" />
      </svg>
    ),
  },
];

export default function LandingLinks() {
  return (
    <section className="py-16 bg-gray-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">

        {/* Social */}
        <div className="text-center mb-12">
          <p className="text-xs font-bold tracking-widest uppercase text-gray-500 mb-5">Seguinos en redes</p>
          <div className="flex items-center justify-center gap-8">
            {SOCIALS.map(({ href, label, icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-2 group"
              >
                <div className="rounded-2xl overflow-hidden shadow-lg transition-transform duration-200 group-hover:-translate-y-1">
                  {icon}
                </div>
                <span className="text-xs font-bold tracking-widest uppercase text-gray-500 group-hover:text-amber-400 transition-colors">
                  {label}
                </span>
              </a>
            ))}
          </div>
        </div>

        {/* Product grid */}
        <div>
          <p className="text-xs font-bold tracking-widest uppercase text-gray-500 mb-5 text-center">Nuestros productos</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {LANDINGS.map(({ href, img, name, badge }) => (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-amber-500/40 hover:bg-gray-800 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-500/10"
              >
                <div className="aspect-[4/3] bg-gray-800 overflow-hidden">
                  <img
                    src={img}
                    alt={name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <div className="p-3">
                  <p className="text-xs font-bold text-white leading-snug mb-1 group-hover:text-amber-400 transition-colors">{name}</p>
                  <p className="text-xs text-amber-500 font-semibold">{badge}</p>
                </div>
              </a>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
