import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MessageCircle, X, MapPin, Briefcase, User, Star } from 'lucide-react';
import Logo from '@/components/Logo';
import { getExperts } from '@/lib/storage';
import type { Expert } from '@/types';

const statusConfig: Record<string, { label: string; bg: string; dot: string }> = {
  approved: { label: 'Disponible', bg: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
  pending: { label: 'En attente', bg: 'bg-orange-100 text-orange-700', dot: 'bg-orange-500' },
  rejected: { label: 'Indisponible', bg: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
};

export default function Experts() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Expert | null>(null);
  const experts = useMemo(() => getExperts(), []);

  const filtered = experts.filter(
    (e) =>
      e.nom.toLowerCase().includes(search.toLowerCase()) ||
      e.fonction.toLowerCase().includes(search.toLowerCase()) ||
      e.ville.toLowerCase().includes(search.toLowerCase())
  );

  const getWhatsAppLink = (expert: Expert) => {
    if (expert.isDefault) return 'https://wa.me/243813971187';
    return `https://wa.me/${expert.whatsapp}`;
  };

  return (
    <div className="min-h-screen bg-[#0B2E8C] text-white pb-24">
      <header className="sticky top-0 z-40 bg-[#0B2E8C] border-b border-white/10">
        <div className="flex items-center gap-3 px-4 py-3">
          <Logo size={36} />
          <h1 className="text-xl font-black">Nos Experts Inscrits</h1>
        </div>
        <div className="px-4 pb-3">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              placeholder="Rechercher par nom, fonction, ville..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-2xl pl-10 pr-4 py-2.5 text-white placeholder-white/40 focus:outline-none focus:border-[#F97316] transition-colors text-sm"
            />
          </div>
        </div>
      </header>

      <div className="px-4 py-4 max-w-md mx-auto space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-white/50">
            <p>Aucun expert trouvé</p>
          </div>
        ) : (
          filtered.map((expert) => {
            const status = statusConfig[expert.status] || statusConfig.approved;
            return (
              <div key={expert.id} className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
                <div className="flex items-start gap-3">
                  <img
                    src={expert.photo || `https://i.pravatar.cc/150?img=${(parseInt(expert.id.slice(-2)) || 1) % 70}`}
                    alt={expert.nom}
                    className="w-16 h-16 rounded-2xl object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-bold text-white truncate">{expert.nom}</h3>
                      <span className={`${status.bg} text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1 flex-shrink-0`}>
                        <span className={`w-1.5 h-1.5 ${status.dot} rounded-full`} />
                        {status.label}
                      </span>
                    </div>
                    <p className="text-sm text-[#F97316] font-semibold mt-0.5">{expert.fonction}</p>
                    <div className="flex items-center gap-1 mt-1 text-xs text-white/60">
                      <MapPin size={12} />
                      <span>{expert.ville}, {expert.pays}</span>
                    </div>
                    {expert.prixJour && (
                      <p className="text-xs text-white/50 mt-1">{expert.prixJour} / jour</p>
                    )}
                  </div>
                </div>

                {expert.travaux && expert.travaux.length > 0 && (
                  <div className="flex gap-2 mt-3 overflow-x-auto no-scrollbar">
                    {expert.travaux.slice(0, 4).map((travail, i) => (
                      <img key={i} src={travail} alt={`Travail ${i + 1}`} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                    ))}
                  </div>
                )}

                <div className="flex gap-2 mt-3">
                  <a
                    href={getWhatsAppLink(expert)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-green-600 text-white font-bold text-sm rounded-xl py-2.5 flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
                  >
                    <MessageCircle size={16} />
                    WhatsApp
                  </a>
                  <button
                    onClick={() => setSelected(expert)}
                    className="flex-1 bg-white/15 text-white font-bold text-sm rounded-xl py-2.5 flex items-center justify-center gap-1.5 active:scale-95 transition-transform hover:bg-white/25"
                  >
                    <User size={16} />
                    Discuter
                  </button>
                </div>
              </div>
            );
          })
        )}

        <button
          onClick={() => navigate('/mon-espace')}
          className="w-full bg-[#F97316] text-white font-bold rounded-2xl py-3.5 shadow-lg active:scale-[0.98] transition-transform mt-4"
        >
          C'est moi
        </button>
      </div>

      {/* Modal détail */}
      {selected && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/60 animate-[fadeIn_0.2s_ease-out]" onClick={() => setSelected(null)}>
          <div
            className="bg-[#0B2E8C] w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 max-h-[85vh] overflow-y-auto animate-[scaleIn_0.3s_ease-out] border border-white/20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-black">Profil de l'expert</h2>
              <button onClick={() => setSelected(null)} className="p-1 rounded-lg hover:bg-white/10">
                <X size={22} />
              </button>
            </div>
            <div className="flex flex-col items-center mb-4">
              <img
                src={selected.photo || `https://i.pravatar.cc/150?img=${(parseInt(selected.id.slice(-2)) || 1) % 70}`}
                alt={selected.nom}
                className="w-24 h-24 rounded-full object-cover border-4 border-white/20"
              />
              <h3 className="text-lg font-bold mt-2">{selected.nom}</h3>
              <p className="text-[#F97316] font-semibold text-sm">{selected.fonction}</p>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-white/80">
                <MapPin size={16} className="text-[#F97316]" />
                <span>{selected.adresse}, {selected.ville}, {selected.pays}</span>
              </div>
              <div className="flex items-center gap-2 text-white/80">
                <Briefcase size={16} className="text-[#F97316]" />
                <span>{selected.prixJour || 'Prix non défini'} / jour</span>
              </div>
              {selected.bio && (
                <div className="pt-2">
                  <p className="text-xs text-white/50 mb-1">Bio</p>
                  <p className="text-white/80">{selected.bio}</p>
                </div>
              )}
              {selected.travaux && selected.travaux.length > 0 && (
                <div className="pt-2">
                  <p className="text-xs text-white/50 mb-1">Travaux réalisés</p>
                  <div className="grid grid-cols-3 gap-2">
                    {selected.travaux.map((travail, i) => (
                      <img key={i} src={travail} alt={`Travail ${i + 1}`} className="w-full aspect-square rounded-xl object-cover" />
                    ))}
                  </div>
                </div>
              )}
            </div>
            <a
              href={getWhatsAppLink(selected)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-green-600 text-white font-bold rounded-2xl py-3.5 flex items-center justify-center gap-2 mt-4 active:scale-[0.98] transition-transform"
            >
              <MessageCircle size={20} />
              Contacter sur WhatsApp
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
