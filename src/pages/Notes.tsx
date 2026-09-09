import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, ChevronDown } from 'lucide-react';

type Chapitre = { t: string; c: string };
type Metier = { id: string; titre: string; image: string; chapitres: Chapitre[] };

const METIERS: Metier[] = [
  { id: 'plombier', titre: '1. PLOMBIER', image: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=600', chapitres: [{ t: 'Bases', c: 'Diametres 12/17 lavabo. Purger air.' },{ t: 'Astuces', c: 'Photo avant/apres, filtre anti-calcaire.' }] },
  { id: 'carreleur', titre: '2. CARRELEUR', image: 'https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?w=600', chapitres: [{ t: 'Bases', c: 'Partir du centre, niveau laser.' }] },
  { id: 'plafonneur', titre: '3. PLAFONNEUR', image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600', chapitres: [{ t: 'Bases', c: 'Enduit 2 passes 3mm.' }] },
  { id: 'macon', titre: '4. MACON', image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600', chapitres: [{ t: 'Bases', c: 'Fondation 80cm, beton 350kg.' }] },
  { id: 'electricien', titre: '5. ELECTRICIEN', image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600', chapitres: [{ t: 'Bases', c: 'Couper general + VAT.' }] },
  { id: 'peintre', titre: '6. PEINTRE', image: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=600', chapitres: [{ t: 'Bases', c: '80% preparation.' }] },
  { id: 'menuisier', titre: '7. MENUISIER', image: 'https://images.unsplash.com/photo-1416339442236-8ceb164046f8?w=600', chapitres: [{ t: 'Bases', c: 'Precision 1mm.' }] },
  { id: 'securite', titre: '8. SECURITE', image: 'https://images.unsplash.com/photo-1504328345606-18bbc504a893?w=600', chapitres: [{ t: 'Regle Or', c: 'Salue, ne crie jamais, partage outils.' }] },
];

export default function Notes() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Metier | null>(null);

  const filtered = useMemo(() => {
    if (!search) return METIERS;
    return METIERS.filter(m => m.titre.toLowerCase().includes(search.toLowerCase()));
  }, [search]);

  if (selected) {
    return (
      <div className="min-h-screen bg-[#0B2E8C] text-white pb-24">
        <div className="flex items-center gap-3 p-4 border-b border-white/10">
          <button onClick={() => setSelected(null)} className="p-2 bg-white/10 rounded-full"><ArrowLeft size={20} /></button>
          <h1 className="font-black text-sm">{selected.titre} - 1.0.26</h1>
        </div>
        <div className="p-4 max-w-md mx-auto space-y-3">
          <img src={selected.image} className="w-full h-40 object-cover rounded-2xl" alt="" />
          {selected.chapitres.map((ch, i) => (
            <div key={i} className="bg-white text-gray-900 rounded-2xl p-4 text-sm">{ch.t}: {ch.c}</div>
          ))}
          <button onClick={() => setSelected(null)} className="w-full bg-white/10 py-3 rounded-xl">Retour</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B2E8C] text-white pb-24">
      <div className="flex items-center gap-3 p-4 border-b border-white/10">
        <button onClick={() => navigate('/regles')} className="p-2 bg-white/10 rounded-full"><ArrowLeft size={20} /></button>
        <h1 className="font-black">Notes - 1.0.26</h1>
      </div>
      <div className="p-4 max-w-md mx-auto">
        <div className="relative mb-4">
          <Search size={16} className="absolute left-3 top-3 text-white/40" />
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Cherche metier..." className="w-full bg-white/10 rounded-xl pl-9 py-2 text-sm" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          {filtered.map(m => (
            <button key={m.id} onClick={()=>setSelected(m)} className="bg-white rounded-2xl overflow-hidden text-left">
              <img src={m.image} alt="" className="w-full h-24 object-cover" />
              <p className="font-black text-xs p-2 text-gray-900">{m.titre}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
        }
