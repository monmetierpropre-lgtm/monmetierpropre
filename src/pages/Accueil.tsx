import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MoreVertical, Youtube, MessageCircle, Music, Search, Wrench, PaintBucket, Grid3x3, Zap, ChevronRight } from 'lucide-react';
import Logo from '@/components/Logo';
import { getAnnonce } from '@/lib/storage';

const techniciens = [
  { nom: 'Plombier', bg: 'bg-blue-600', url: 'https://wa.me/243849561334' },
  { nom: 'Plafonneur', bg: 'bg-orange-500', url: 'https://wa.me/243849561334' },
  { nom: 'Carreleur', bg: 'bg-green-600', url: 'https://wa.me/243813971187' },
  { nom: 'Autres services', bg: 'bg-blue-900', url: 'https://wa.me/243813971187' },
];

const exploreCards = [
  { icon: Wrench, label: 'Devenir Expert', desc: 'Inscrivez-vous comme technicien', to: '/devenir-expert', color: 'text-orange-500' },
  { icon: Search, label: 'Nos Experts', desc: 'Trouvez un technicien près de vous', to: '/experts', color: 'text-blue-400' },
  { icon: PaintBucket, label: 'Designs', desc: 'Modèles gratuits à exporter en PDF', to: '/designs', color: 'text-green-400' },
  { icon: Grid3x3, label: 'Outils', desc: 'Calculatrice, jeux, agenda et plus', to: '/outils', color: 'text-purple-400' },
];

export default function Accueil() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const clickCount = useRef(0);
  const clickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const annonce = getAnnonce();

  const handleLogoClick = () => {
    clickCount.current += 1;
    if (clickTimer.current) clearTimeout(clickTimer.current);
    clickTimer.current = setTimeout(() => {
      clickCount.current = 0;
    }, 600);
    if (clickCount.current >= 3) {
      clickCount.current = 0;
      navigate('/admin');
    }
  };

  return (
    <div className="min-h-screen bg-[#0B2E8C] text-white pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#0B2E8C] border-b border-white/10">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3 cursor-pointer select-none" onClick={handleLogoClick}>
            <Logo size={44} />
            <div>
              <h1 className="text-2xl font-black leading-none tracking-tight">Mon Métier</h1>
              <p className="text-xs text-white/60 mt-0.5">Connecter Clients et techniciens</p>
            </div>
          </div>
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-xl hover:bg-white/10 transition-colors"
            >
              <MoreVertical size={24} />
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-12 z-50 bg-white text-gray-800 rounded-2xl shadow-2xl py-2 min-w-[200px] animate-[scaleIn_0.2s_ease-out]">
                  <a
                    href="https://youtube.com/@apprendrelearn-w2m"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition-colors"
                  >
                    <Youtube size={20} className="text-red-600" />
                    <span className="font-semibold text-sm">YouTube</span>
                  </a>
                  <a
                    href="https://whatsapp.com/channel/0029VbD48n84tRrs24Hf0Y0A"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition-colors"
                  >
                    <MessageCircle size={20} className="text-green-600" />
                    <span className="font-semibold text-sm">WhatsApp</span>
                  </a>
                  <a
                    href="https://www.tiktok.com/@learnfrinchinglis"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition-colors"
                  >
                    <Music size={20} className="text-black" />
                    <span className="font-semibold text-sm">TikTok</span>
                  </a>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="px-4 py-4 space-y-6 max-w-md mx-auto">
        {/* Annonce admin */}
        {annonce && (
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-3 border border-white/20 animate-[fadeIn_0.5s_ease-out]">
            <p className="text-sm font-semibold text-center">{annonce}</p>
          </div>
        )}

        {/* Sous-titre */}
        <div className="text-center">
          <h2 className="text-xl font-bold mb-1">Bienvenue sur Mon Métier</h2>
          <p className="text-sm text-white/70">La plateforme qui connecte clients et techniciens qualifiés</p>
        </div>

        {/* Bouton principal */}
        <button
          onClick={() => navigate('/experts')}
          className="w-full bg-white text-[#0B2E8C] font-black text-lg rounded-2xl py-4 shadow-lg active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
        >
          <Search size={22} />
          Contacter un technicien ou expert
        </button>

        {/* Cartes techniciens */}
        <div>
          <h3 className="text-lg font-bold mb-3">Contactez un technicien</h3>
          <div className="grid grid-cols-2 gap-3">
            {techniciens.map((tech) => (
              <a
                key={tech.nom}
                href={tech.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`${tech.bg} rounded-2xl p-4 shadow-lg active:scale-95 transition-transform flex flex-col items-center gap-2`}
              >
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Wrench size={24} className="text-white" />
                </div>
                <span className="font-bold text-white">{tech.nom}</span>
                <span className="text-xs text-white/80">Contacter sur WhatsApp</span>
              </a>
            ))}
          </div>
        </div>

        {/* Cartes exploration */}
        <div>
          <h3 className="text-lg font-bold mb-3">Explorez l'app</h3>
          <div className="space-y-3">
            {exploreCards.map((card) => {
              const Icon = card.icon;
              return (
                <button
                  key={card.label}
                  onClick={() => navigate(card.to)}
                  className="w-full bg-white/10 hover:bg-white/15 rounded-2xl p-4 flex items-center gap-4 transition-colors active:scale-[0.98] text-left"
                >
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon size={24} className={card.color} />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-white">{card.label}</p>
                    <p className="text-xs text-white/60">{card.desc}</p>
                  </div>
                  <ChevronRight size={20} className="text-white/40" />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
