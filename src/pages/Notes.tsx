import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, BookOpen, ChevronRight, Wrench } from 'lucide-react';

type Metier = {
  id: string;
  nom: string;
  icone: string;
  cours: string;
  securite: string;
  image: string;
};

const metiers: Metier[] = [
  {
    id: 'plombier',
    nom: '1. Plombier',
    icone: '🚿',
    cours: 'Comment bien travailler en plomberie : 1. Toujours couper l\u2019eau avant intervention. 2. Vérifier les fuites avec pression. 3. Utiliser joint téflon pour étanchéité. 4. Porter gants et lunettes. 5. Nettoyer chantier après travail. Astuce pro : propose entretien annuel au client pour fidéliser.',
    securite: 'Sécurité: Gants, lunettes, chaussures antidérapantes. Ne jamais souder près de produits inflammables.',
    image: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=400',
  },
  {
    id: 'plafonneur',
    nom: '2. Plafonneur',
    icone: '🏠',
    cours: 'Techniques plafonnage pro : 1. Préparer support propre et humide. 2. Mélanger enduit sans grumeaux. 3. Appliquer en 2 couches fines. 4. Lisser avec taloche. 5. Poncer après 24h. Qualité : 3mm d\u2019épaisseur max par couche.',
    securite: 'Sécurité: Masque anti-poussière obligatoire, échafaudage stable, gants.',
    image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400',
  },
  {
    id: 'carreleur',
    nom: '3. Carreleur',
    icone: '🧱',
    cours: 'Pose carrelage parfaite : 1. Vérifier planéité sol (<3mm). 2. Tracer axes. 3. Coller avec peigne 8mm. 4. Croisillons 2mm. 5. Joint après 24h. Astuce : commencer par le centre de la pièce.',
    securite: 'Sécurité: Genouillères, lunettes lors découpe, masque.',
    image: 'https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?w=400',
  },
  {
    id: 'electricien',
    nom: '4. Électricien',
    icone: '⚡',
    cours: 'Travail électricien sécurisé : 1. Couper disjoncteur général. 2. Tester absence tension. 3. Câbles 1.5mm² éclairage, 2.5mm² prises. 4. Terre obligatoire. 5. Boite étanche en extérieur.',
    securite: 'Sécurité: Habilitation électrique, gants isolants, ne jamais travailler sous tension.',
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400',
  },
  {
    id: 'peintre',
    nom: '5. Peintre',
    icone: '🎨',
    cours: 'Peinture pro : 1. Poncer et dépoussiérer. 2. Sous-couche. 3. 2 couches croisées. 4. Ruban de masquage. 5. Nettoyage outils à l\u2019eau. Rendement : 10m²/L.',
    securite: 'Sécurité: Masque si spray, aération, lunettes.',
    image: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=400',
  },
];

const metierColors = [
  'from-blue-500 to-blue-600',
  'from-amber-500 to-orange-500',
  'from-rose-500 to-red-500',
  'from-yellow-400 to-amber-500',
  'from-teal-500 to-cyan-600',
];

const conseilsGeneraux = [
  'Toujours porter les équipements de protection individuelle (EPI) adaptés au métier.',
  'Vérifier les outils et matériels avant chaque intervention.',
  'Informer le client des travaux à réaliser et des délais.',
  'Nettoyer et ranger le chantier après chaque journée de travail.',
  'Respecter les normes électriques, de plomberie et de construction en vigueur.',
  'Ne jamais travailler en hauteur sans harnais ou échafaudage sécurisé.',
  'Garder une trousse de premiers secours accessible sur le chantier.',
  'Établir un devis écrit avant tout début de travaux.',
];

export default function Notes() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<Metier | null>(null);
  const [showConseils, setShowConseils] = useState(false);

  if (selected) {
    return (
      <div className="min-h-screen bg-[#0B2E8C] text-white pb-24">
        <header className="sticky top-0 z-40 bg-[#0B2E8C] border-b border-white/10">
          <div className="flex items-center gap-3 px-4 py-3">
            <button
              onClick={() => setSelected(null)}
              className="p-2 rounded-xl hover:bg-white/10 transition-colors"
            >
              <ArrowLeft size={22} />
            </button>
            <h1 className="text-xl font-black flex items-center gap-2">
              <span className="text-2xl">{selected.icone}</span>
              {selected.nom}
            </h1>
          </div>
        </header>

        <div className="px-4 py-6 max-w-md mx-auto space-y-5">
          <div className="bg-white rounded-2xl overflow-hidden shadow-xl">
            <img
              src={selected.image}
              alt={selected.nom}
              className="w-full h-44 object-cover"
              loading="lazy"
            />
            <div className="p-5 text-gray-800 space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen size={18} className="text-[#0B2E8C]" />
                  <h3 className="font-bold text-[#0B2E8C]">Cours & techniques</h3>
                </div>
                <p className="text-sm leading-relaxed text-gray-700">{selected.cours}</p>
              </div>

              <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield size={18} className="text-red-600" />
                  <h4 className="font-bold text-red-700">Sécurité</h4>
                </div>
                <p className="text-sm leading-relaxed text-red-800">{selected.securite}</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setSelected(null)}
            className="w-full bg-white/10 text-white font-bold py-3.5 rounded-xl active:scale-[0.98] transition-transform"
          >
            Retour aux métiers
          </button>
        </div>
      </div>
    );
  }

  if (showConseils) {
    return (
      <div className="min-h-screen bg-[#0B2E8C] text-white pb-24">
        <header className="sticky top-0 z-40 bg-[#0B2E8C] border-b border-white/10">
          <div className="flex items-center gap-3 px-4 py-3">
            <button
              onClick={() => setShowConseils(false)}
              className="p-2 rounded-xl hover:bg-white/10 transition-colors"
            >
              <ArrowLeft size={22} />
            </button>
            <h1 className="text-xl font-black flex items-center gap-2">
              <Wrench size={20} className="text-[#F97316]" />
              Autres services
            </h1>
          </div>
        </header>

        <div className="px-4 py-6 max-w-md mx-auto space-y-4">
          <div className="bg-white rounded-2xl p-5 shadow-xl text-gray-800">
            <div className="flex items-center gap-2 mb-4">
              <Shield size={20} className="text-[#0B2E8C]" />
              <h3 className="font-bold text-[#0B2E8C] text-lg">Conseils généraux de sécurité</h3>
            </div>
            <div className="space-y-3">
              {conseilsGeneraux.map((conseil, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#0B2E8C] text-white text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <p className="text-sm leading-relaxed text-gray-700">{conseil}</p>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setShowConseils(false)}
            className="w-full bg-white/10 text-white font-bold py-3.5 rounded-xl active:scale-[0.98] transition-transform"
          >
            Retour aux métiers
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B2E8C] text-white pb-24">
      <header className="sticky top-0 z-40 bg-[#0B2E8C] border-b border-white/10">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => navigate('/regles')}
            className="p-2 rounded-xl hover:bg-white/10 transition-colors"
          >
            <ArrowLeft size={22} />
          </button>
          <h1 className="text-xl font-black">Notes / Formations Techniciens</h1>
        </div>
      </header>

      <div className="px-4 py-6 max-w-md mx-auto space-y-5">
        <p className="text-sm text-white/70 text-center mb-2">
          Choisissez votre métier pour accéder aux cours et consignes de sécurité.
        </p>

        <div className="grid grid-cols-1 gap-3">
          {metiers.map((metier, i) => (
            <button
              key={metier.id}
              onClick={() => setSelected(metier)}
              className={`bg-gradient-to-r ${metierColors[i]} rounded-2xl p-4 flex items-center gap-4 shadow-lg active:scale-[0.98] transition-transform text-left`}
            >
              <span className="text-4xl flex-shrink-0">{metier.icone}</span>
              <div className="flex-1">
                <h3 className="font-black text-lg text-white">{metier.nom}</h3>
                <p className="text-xs text-white/80">Voir le cours et la sécurité</p>
              </div>
              <ChevronRight size={22} className="text-white/70 flex-shrink-0" />
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowConseils(true)}
          className="w-full bg-white/10 border-2 border-white/20 rounded-2xl p-4 flex items-center gap-3 active:scale-[0.98] transition-transform text-left"
        >
          <Wrench size={26} className="text-[#F97316] flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-bold text-white">Autres services</h3>
            <p className="text-xs text-white/60">Conseils généraux de sécurité pour tous techniciens</p>
          </div>
          <ChevronRight size={22} className="text-white/50 flex-shrink-0" />
        </button>
      </div>
    </div>
  );
}
