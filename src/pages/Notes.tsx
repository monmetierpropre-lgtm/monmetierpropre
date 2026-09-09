import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, ChevronDown, ChevronRight, Check, Share2, BookOpen } from 'lucide-react';

type Chapitre = { t: string; c: string };
type Metier = { id: string; titre: string; image: string; chapitres: Chapitre[] };

const METIERS_COMPLETS: Metier[] = [
  {
    id: 'plombier',
    titre: "1. PLOMBIER",
    image: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=600',
    chapitres: [
      { t: "Bases du Metier", c: "Un bon plombier ne bouche pas seulement les fuites, il protege la maison. Diametres : 12/17 lavabo, 15/21 evier, 20/27 arrivee generale. Toujours purger l air apres intervention." },
      { t: "Astuces Pro", c: "1. Photo avant/apres = confiance. 2. Propose un filtre anti-calcaire = 50$ bonus. 3. Laisse ton autocollant avec ton numero derriere le chauffe-eau." },
      { t: "3 Erreurs", c: "Ne jamais dire c est rien. Ne jamais laisser de l eau sale chez le client. Ne jamais facturer sans expliquer." },
      { t: "Securite", c: "Gants latex, lunettes, coupe l eau generale, verifie avec manometre. Jamais de soudure a cote d une bouteille de gaz." },
      { t: "Respect & Amour", c: "Si tu travailles avec un apprenti, explique, ne crie pas. Dis on va faire ensemble. Le respect attire les gros chantiers." },
      { t: "Conseil Devis", c: "Donne toujours 2 prix : reparation rapide et reparation durable. Le client choisit et te respecte." },
      { t: "Esprit equipe", c: "Avant de commencer, fais 1 minute de concentration avec ton equipe. Ca cree l amour du travail bien fait." },
    ],
  },
  {
    id: 'carreleur',
    titre: "2. CARRELEUR",
    image: 'https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?w=600',
    chapitres: [
      { t: "Bases", c: "Toujours partir du centre, pas du mur. Utilise niveau laser, croisillons 2mm. Laisse 48h avant de marcher." },
      { t: "Astuces Pro", c: "Mouille les carreaux 10 min avant. Melange colle 3 min. Propose plinthes assorties = +20% facture." },
      { t: "Erreurs", c: "Ne carrele jamais sur sol poussiereux. Ne marche pas sur colle fraiche." },
      { t: "Securite", c: "Genouilleres obligatoires, masque pour coupe, gants." },
      { t: "Respect Client", c: "Couvre les meubles du client avec bache. Dis Merci de votre confiance. Le client parlera de toi a 3 voisins." },
      { t: "Conseil", c: "Montre 3 modeles de carrelage au client, pas 20. Compte 10% de perte en plus." },
      { t: "Equipe avec Amour", c: "Un qui colle, un qui coupe. Encourage ton collegue : Belle coupe! L amour du detail fait la beaute." },
    ],
  },
  {
    id: 'plafonneur',
    titre: "3. PLAFONNEUR",
    image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600',
    chapitres: [
      { t: "Bases", c: "Enduit en 2 passes de 3mm. Taloche inox, mouvements circulaires. Temperature ideale 15-25C." },
      { t: "Astuces", c: "Humidifie le mur avant. Lave tes outils toutes les 30 min. Pour un plafond sans vague, eclaire avec lampe rasante." },
      { t: "Erreurs", c: "Trop d eau = fissures. Pas assez = ca ne colle pas. Ne pas plafonner sous 5C." },
      { t: "Respect & Amour", c: "Ne critique jamais le travail du macon devant le client. Dis on va rendre ca magnifique." },
      { t: "Securite", c: "Masque FFP2, lunettes, echafaudage stable avec garde-corps." },
    ],
  },
  {
    id: 'macon',
    titre: "4. MACON",
    image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600',
    chapitres: [
      { t: "Bases", c: "Fondation 80cm minimum, beton 350kg/m3. Respecte le fil a plomb. 1cm d erreur en bas = 10cm en haut." },
      { t: "Astuces", c: "Arrose tes briques avant pose. Beton : 1 ciment, 2 sables, 3 graviers. Coffrage huile s enleve facile." },
      { t: "Respect & Amour", c: "Le macon doit aimer son manoeuvre. Partage l eau, partage le repas. Quand tu aimes ton equipe, le mur monte droit et vite." },
      { t: "Securite", c: "Casque, chaussures coquees, harnais en hauteur. Jamais de maconnerie sous orage." },
    ],
  },
  {
    id: 'electricien',
    titre: "5. ELECTRICIEN",
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600',
    chapitres: [
      { t: "Bases", c: "Toujours couper general + tester avec VAT. Norme : 6 prises max par circuit 2.5mm2." },
      { t: "Respect", c: "Explique au client pourquoi tu coupes le courant. Aime ton apprenti : montre lui une fois, laisse faire, corrige avec douceur." },
    ],
  },
  {
    id: 'peintre',
    titre: "6. PEINTRE",
    image: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=600',
    chapitres: [
      { t: "Bases", c: "Peinture c est 80% preparation, 20% application. Poncage grain 120, sous-couche, 2 couches croisees." },
      { t: "Amour du Travail", c: "Chante ou mets musique douce pendant que tu peins. Une equipe qui rit peint mieux." },
    ],
  },
  {
    id: 'menuisier',
    titre: "7. MENUISIER",
    image: 'https://images.unsplash.com/photo-1416339442236-8ceb164046f8?w=600',
    chapitres: [
      { t: "Bases", c: "Bois aime precision 1mm. Mesure 2 fois, coupe 1 fois. Vernis 3 couches." },
      { t: "Esprit Equipe", c: "Menuisier + peintre + vitrier = une famille. Si l un retarde, aide-le. L amour fait finir le chantier a l heure." },
    ],
  },
  {
    id: 'securite',
    titre: "8. SECURITE POUR TOUS",
    image: 'https://images.unsplash.com/photo-1504328345606-18bbc504a893?w=600',
    chapitres: [
      { t: "Regle d Or", c: "1. Salue chaque matin ton equipe par son prenom. 2. Ne crie jamais, explique. 3. Partage les outils. 4. Si quelqu un est fatigue, fais pause." },
      { t: "Travailler en Equipe", c: "Avant chantier : 2 min reunion Qu est-ce qu on fait aujourd hui? Apres chantier : Qu est-ce qu on a bien fait? Ca soude l equipe." },
      { t: "5 Commandements du Pro", c: "1. Ponctualite = respect. 2. Proprete = professionnalisme. 3. Honnetete sur prix = confiance. 4. Photo avant/apres = preuve. 5. Dire merci = client fidele." },
    ],
  },
];

export default function Notes() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Metier | null>(null);
  const [openChapters, setOpenChapters] = useState<Set<number>>(new Set());
  const [readChapters, setReadChapters] = useState<Set<number>>(new Set());

  const filteredMetiers = useMemo(() => {
    if (!search.trim()) return METIERS_COMPLETS;
    const q = search.toLowerCase();
    return METIERS_COMPLETS.filter((m) => m.titre.toLowerCase().includes(q) || m.chapitres.some((ch) => ch.t.toLowerCase().includes(q) || ch.c.toLowerCase().includes(q)));
  }, [search]);

  const handleSelect = (metier: Metier) => { setSelected(metier); setOpenChapters(new Set()); setReadChapters(new Set()); };
  const toggleChapter = (idx: number) => { setOpenChapters((prev) => { const next = new Set(prev); if (next.has(idx)) next.delete(idx); else next.add(idx); return next; }); };
  const markRead = (idx: number) => { setReadChapters((prev) => new Set(prev).add(idx)); };
  const handleShare = (metier: Metier) => {
    const text = `${metier.titre}\n\n${metier.chapitres.map((ch) => `${ch.t}\n${ch.c}`).join('\n\n')}`;
    if (navigator.share) { navigator.share({ title: metier.titre, text }).catch(() => {}); } else { navigator.clipboard?.writeText(text).then(() => { alert('Conseils copies!'); }); }
  };

  const totalChapters = selected?.chapitres.length?? 0;
  const readCount = readChapters.size;
  const progress = totalChapters > 0? Math.round((readCount / totalChapters) * 100) : 0;

  if (selected) {
    return (
      <div className="min-h-screen bg-[#0B2E8C] text-white pb-24">
        <header className="sticky top-0 z-40 bg-[#0B2E8C] border-b border-white/10">
          <div className="flex items-center gap-3 px-4 py-3">
            <button onClick={() => setSelected(null)} className="p-2 rounded-xl hover:bg-white/10"><ArrowLeft size={22} /></button>
            <h1 className="text-lg font-black truncate flex-1">{selected.titre}</h1>
          </div>
          <div className="px-4 pb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-white/60">{readCount === totalChapters? 'Tous les chapitres lus - Bravo!' : `Tu as lu ${readCount}/${totalChapters} - Continue!`}</span>
              <span className="text-xs font-bold text-[#F97316]">{progress}%</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-[#F97316] to-amber-400 rounded-full" style={{ width: `${progress}%` }} /></div>
          </div>
        </header>
        <div className="px-4 py-5 max-w-md mx-auto space-y-4">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl">
            <img src={selected.image} alt={selected.titre} className="w-full h-48 object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B2E8C]/80 to-transparent" />
            <div className="absolute bottom-3 left-4 right-4">
              <p className="text-white font-black text-lg">{selected.titre}</p>
              <p className="text-white/70 text-xs">{totalChapters} chapitres</p>
            </div>
          </div>
          {selected.chapitres.map((chap, idx) => {
            const isOpen = openChapters.has(idx);
            const isRead = readChapters.has(idx);
            return (
              <div key={idx} className={`bg-white rounded-2xl shadow-lg overflow-hidden ${isRead? 'ring-2 ring-green-400' : ''}`}>
                <button onClick={() => toggleChapter(idx)} className="w-full flex items-center gap-3 p-4 text-left">
                  <span className="flex-1 font-bold text-gray-800 text-sm">{chap.t}</span>
                  {isRead && <Check size={18} className="text-green-500" />}
                  <ChevronDown size={20} className={`text-gray-400 ${isOpen? 'rotate-180' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4">
                    <p className="text-sm text-gray-700 leading-relaxed mb-3">{chap.c}</p>
                    <button onClick={() => markRead(idx)} disabled={isRead} className={`w-full py-2.5 rounded-xl text-sm font-bold ${isRead? 'bg-green-100 text-green-600' : 'bg-[#0B2E8C] text-white'}`}>
                      {isRead? 'Compris!' : "J ai compris"}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
          <button onClick={() => handleShare(selected)} className="w-full bg-gradient-to-r from-[#F97316] to-amber-500 text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2"><Share2 size={20} />Partager ce conseil</button>
          <button onClick={() => setSelected(null)} className="w-full bg-white/10 text-white font-bold py-3.5 rounded-xl">Retour aux metiers</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B2E8C] text-white pb-24">
      <header className="sticky top-0 z-40 bg-[#0B2E8C] border-b border-white/10">
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={() => navigate('/regles')} className="p-2 rounded-xl hover:bg-white/10"><ArrowLeft size={22} /></button>
          <h1 className="text-lg font-black">Notes / Formations</h1>
        </div>
        <div className="px-4 pb-3">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cherche ton metier..." className="w-full bg-white/10 border border-white/20 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm placeholder-white/40 focus:outline-none focus:border-[#F97316]" />
          </div>
        </div>
      </header>
      <div className="px-4 py-5 max-w-md mx-auto">
        <p className="text-sm text-white/60 text-center mb-4 flex items-center justify-center gap-2"><BookOpen size={16} className="text-[#F97316]" />Choisis ton metier et apprends</p>
        <div className="grid grid-cols-2 gap-3">
          {filteredMetiers.map((metier) => (
            <button key={metier.id} onClick={() => handleSelect(metier)} className="relative rounded-2xl overflow-hidden shadow-lg text-left">
              <div className="aspect-[3/4] relative">
                <img src={metier.image} alt={metier.titre} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="text-white font-black text-sm">{metier.titre}</p>
                  <p className="text-white/60 text-[10px] mt-1">{metier.chapitres.length} chapitres</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
       }  }, [search]);

  const handleSelect = (metier: Metier) => {
    setSelected(metier);
    setOpenChapters(new Set());
    setReadChapters(new Set());
  };

  const toggleChapter = (idx: number) => {
    setOpenChapters((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const markRead = (idx: number) => {
    setReadChapters((prev) => new Set(prev).add(idx));
  };

  const handleShare = (metier: Metier) => {
    const text = `${metier.titre}\n\n${metier.chapitres.map((ch) => `${ch.t}\n${ch.c}`).join('\n\n')}`;
    if (navigator.share) {
      navigator.share({ title: metier.titre, text }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(text).then(() => {
        alert('Conseils copiés ! Tu peux les coller à un collègue.');
      });
    }
  };

  const totalChapters = selected?.chapitres.length ?? 0;
  const readCount = readChapters.size;
  const progress = totalChapters > 0 ? Math.round((readCount / totalChapters) * 100) : 0;

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
            <h1 className="text-lg font-black truncate flex-1">{selected.titre}</h1>
          </div>
          <div className="px-4 pb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-white/60">
                {readCount === totalChapters
                  ? '✅ Tous les chapitres lus - Bravo !'
                  : `Tu as lu ${readCount}/${totalChapters} chapitres - Continue !`}
              </span>
              <span className="text-xs font-bold text-[#F97316]">{progress}%</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#F97316] to-amber-400 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </header>

        <div className="px-4 py-5 max-w-md mx-auto space-y-4">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl">
            <img
              src={selected.image}
              alt={selected.titre}
              className="w-full h-48 object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B2E8C]/80 to-transparent" />
            <div className="absolute bottom-3 left-4 right-4">
              <p className="text-white font-black text-lg drop-shadow-lg">{selected.titre}</p>
              <p className="text-white/70 text-xs">{totalChapters} chapitres à découvrir</p>
            </div>
          </div>

          {selected.chapitres.map((chap, idx) => {
            const isOpen = openChapters.has(idx);
            const isRead = readChapters.has(idx);
            return (
              <div
                key={idx}
                className={`bg-white rounded-2xl shadow-lg overflow-hidden transition-all ${
                  isRead ? 'ring-2 ring-green-400' : ''
                }`}
              >
                <button
                  onClick={() => toggleChapter(idx)}
                  className="w-full flex items-center gap-3 p-4 text-left active:bg-gray-50 transition-colors"
                >
                  <span className="text-2xl flex-shrink-0">{chap.t.split(' ')[0]}</span>
                  <span className="flex-1 font-bold text-gray-800 text-sm leading-tight">
                    {chap.t.substring(chap.t.indexOf(' ') + 1)}
                  </span>
                  {isRead && <Check size={18} className="text-green-500 flex-shrink-0" />}
                  <ChevronDown
                    size={20}
                    className={`text-gray-400 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 animate-[fadeIn_0.2s_ease-out]">
                    <p className="text-sm text-gray-700 leading-relaxed mb-3">{chap.c}</p>
                    <button
                      onClick={() => markRead(idx)}
                      disabled={isRead}
                      className={`w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                        isRead
                          ? 'bg-green-100 text-green-600'
                          : 'bg-[#0B2E8C] text-white active:scale-95'
                      }`}
                    >
                      {isRead ? (
                        <>
                          <Check size={16} /> Compris !
                        </>
                      ) : (
                        '✅ J\u2019ai compris'
                      )}
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          <button
            onClick={() => handleShare(selected)}
            className="w-full bg-gradient-to-r from-[#F97316] to-amber-500 text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition-transform"
          >
            <Share2 size={20} />
            Partager ce conseil à un collègue
          </button>

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
          <h1 className="text-lg font-black">Notes / Formations</h1>
        </div>
        <div className="px-4 pb-3">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cherche ton métier..."
              className="w-full bg-white/10 border border-white/20 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm placeholder-white/40 focus:outline-none focus:border-[#F97316] transition-colors"
            />
          </div>
        </div>
      </header>

      <div className="px-4 py-5 max-w-md mx-auto">
        <p className="text-sm text-white/60 text-center mb-4 flex items-center justify-center gap-2">
          <BookOpen size={16} className="text-[#F97316]" />
          Choisis ton métier et apprends les techniques pro
        </p>

        {filteredMetiers.length === 0 ? (
          <div className="text-center text-white/50 py-12">
            <p className="text-sm">Aucun métier trouvé pour "{search}"</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredMetiers.map((metier) => (
              <button
                key={metier.id}
                onClick={() => handleSelect(metier)}
                className="relative rounded-2xl overflow-hidden shadow-lg active:scale-[0.97] transition-transform text-left group"
              >
                <div className="aspect-[3/4] relative">
                  <img
                    src={metier.image}
                    alt={metier.titre}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-white font-black text-sm leading-tight drop-shadow-lg">
                      {metier.titre}
                    </p>
                    <p className="text-white/60 text-[10px] mt-1">
                      {metier.chapitres.length} chapitres
                    </p>
                  </div>
                  <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-[#F97316] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChevronRight size={16} className="text-white" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
