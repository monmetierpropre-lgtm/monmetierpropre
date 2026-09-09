import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, ChevronDown } from 'lucide-react';

type Chapitre = { t: string; c: string };
type Metier = { id: string; titre: string; image: string; chapitres: Chapitre[] };

const METIERS: Metier[] = [
  { id: 'plombier', titre: '1. PLOMBIER', image: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=600', chapitres: [{ t: 'Bases', c: 'Diametres 12/17 lavabo. Purger air.' }] },
  { id: 'carreleur', titre: '2. CARRELEUR', image: 'https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?w=600', chapitres: [{ t: 'Bases', c: 'Partir du centre.' }] },
  { id: 'plafonneur', titre: '3. PLAFONNEUR', image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600', chapitres: [{ t: 'Bases', c: 'Enduit 2 passes.' }] },
  { id: 'macon', titre: '4. MACON', image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600', chapitres: [{ t: 'Bases', c: 'Fondation 80cm.' }] },
  { id: 'electricien', titre: '5. ELECTRICIEN', image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600', chapitres: [{ t: 'Bases', c: 'Couper general.' }] },
  { id: 'peintre', titre: '6. PEINTRE', image: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=600', chapitres: [{ t: 'Bases', c: '80% preparation.' }] },
  { id: 'menuisier', titre: '7. MENUISIER', image: 'https://images.unsplash.com/photo-1416339442236-8ceb164046f8?w=600', chapitres: [{ t: 'Bases', c: 'Precision 1mm.' }] },
  { id: 'securite', titre: '8. SECURITE', image: 'https://images.unsplash.com/photo-1504328345606-18bbc504a893?w=600', chapitres: [{ t: 'Regle Or', c: 'Salue, ne crie jamais.' }] },
];

export default function Notes() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Metier | null>(null);
  return (
    <div className="min-h-screen bg-[#0B2E8C] text-white pb-24">
      <div className="flex items-center gap-3 p-4 border-b border-white/10">
        <button onClick={() => navigate('/regles')} className="p-2 bg-white/10 rounded-full"><ArrowLeft size={20} /></button>
        <h1 className="font-black">Notes - 1.0.26</h1>
      </div>
      <div className="p-4 max-w-md mx-auto">
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Cherche..." className="w-full bg-white/10 rounded-xl p-2 text-sm mb-4" />
        <div className="grid grid-cols-2 gap-3">
          {METIERS.filter(m=>m.titre.toLowerCase().includes(search.toLowerCase())).map(m=>(
            <button key={m.id} onClick={()=>setSelected(m)} className="bg-white rounded-2xl overflow-hidden text-left">
              <img src={m.image} alt="" className="w-full h-24 object-cover" />
              <p className="font-black text-xs p-2 text-gray-900">{m.titre}</p>
            </button>
          ))}
        </div>
        {selected && (
          <div className="mt-4 bg-white text-gray-900 rounded-2xl p-4">
            <p className="font-black">{selected.titre}</p>
            <p className="text-xs mt-2">{selected.chapitres[0].c}</p>
            <button onClick={()=>setSelected(null)} className="mt-3 bg-[#0B2E8C] text-white px-4 py-2 rounded-xl text-xs">Fermer</button>
          </div>
        )}
      </div>
    </div>
  );
      }
