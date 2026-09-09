import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, ChevronDown, Check, Share2, BookOpen } from 'lucide-react';

type Chapitre = { t: string; c: string };
type Metier = { id: string; titre: string; image: string; chapitres: Chapitre[] };

const METIERS: Metier[] = [
  { id: 'plombier', titre: '1. PLOMBIER', image: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=600', chapitres: [
    { t: 'Bases', c: 'Diametres : 12/17 lavabo, 15/21 evier, 20/27 generale. Toujours purger air.' },
    { t: 'Astuces Pro', c: 'Photo avant apres = confiance. Propose filtre anti-calcaire.' },
    { t: 'Securite', c: 'Gants, lunettes, couper eau, verifier manometre.' },
  ]},
  { id: 'carreleur', titre: '2. CARRELEUR', image: 'https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?w=600', chapitres: [
    { t: 'Bases', c: 'Partir du centre, niveau laser, croisillons 2mm, 48h avant marcher.' },
    { t: 'Astuces', c: 'Mouiller carreaux 10 min avant.' },
  ]},
  { id: 'plafonneur', titre: '3. PLAFONNEUR', image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600', chapitres: [{ t: 'Bases', c: 'Enduit 2 passes 3mm, taloche inox.' }]},
  { id: 'macon', titre: '4. MACON', image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600', chapitres: [{ t: 'Bases', c: 'Fondation 80cm, beton 350kg/m3, fil a plomb.' }]},
  { id: 'electricien', titre: '5. ELECTRICIEN', image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600', chapitres: [{ t: 'Bases', c: 'Couper general + tester VAT, 6 prises max par circuit 2.5mm2.' }]},
  { id: 'peintre', titre: '6. PEINTRE', image: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=600', chapitres: [{ t: 'Bases', c: '80% preparation, 20% application, poncage 120.' }]},
  { id: 'menuisier', titre: '7. MENUISIER', image: 'https://images.unsplash.com/photo-1416339442236-8ceb164046f8?w=600', chapitres: [{ t: 'Bases', c: 'Precision 1mm, mesure 2 fois coupe 1 fois.' }]},
  { id: 'securite', titre: '8. SECURITE', image: 'https://images.unsplash.com/photo-1504328345606-18bbc504a893?w=600', chapitres: [{ t: 'Regle Or', c: 'Salue equipe, ne crie jamais, partage outils.' }]},
];

export default function Notes() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Metier | null>(null);
  const [open, setOpen] = useState<Set<number>>(new Set());
  const [read, setRead] = useState<Set<number>>(new Set());

  const filtered = useMemo(() => {
    if (!search.trim()) return METIERS;
    const q = search.toLowerCase();
    return METIERS.filter(m => m.titre.toLowerCase().includes(q));
  }, [search]);

  if (selected) {
    return (
      <div className="min-h-screen bg-[#0B2E8C] text-white pb-24">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
          <button onClick={() => setSelected(null)} className="p-2"><ArrowLeft size={22} /></button>
          <h1 className="font-black">{selected.titre}</h1>
        </div>
        <div className="p-4 max-w-md mx-auto space-y-3">
          <img src={selected.image} alt="" className="w-full h-48 object-cover rounded-2xl" />
          {selected.chapitres.map((ch, i) => (
            <div key={i} className="bg-white rounded-2xl text-gray-800">
              <button onClick={() => setOpen(prev => { const n = new Set(prev); n.has(i)? n.delete(i) : n.add(i); return n; })} className="w-full flex justify-between p-4 font-bold text-sm">
                {ch.t} {read.has(i) && <Check size={16} className="text-green-500" />} <ChevronDown size={18} className={open.has(i)? 'rotate-180' : ''} />
              </button>
              {open.has(i) && <div className="px-4 pb-4"><p className="text-sm mb-2">{ch.c}</p><button onClick={() => setRead(prev => new Set(prev).add(i))} className="w-full bg-[#0B2E8C] text-white py-2 rounded-xl text-sm">{read.has(i)? 'Compris!' : "J'ai compris"}</button></div>}
            </div>
          ))}
          <button onClick={() => setSelected(null)} className="w-full bg-white/10 py-3 rounded-xl font-bold">Retour</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B2E8C] text-white pb-24">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
        <button onClick={() => navigate('/regles')} className="p-2"><ArrowLeft size={22} /></button>
        <h1 className="font-black">Notes</h1>
      </div>
      <div className="px-4 py-3">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cherche..." className="w-full bg-white/10 border border-white/20 rounded-xl pl-10 pr-4 py-2.5 text-sm" />
        </div>
      </div>
      <div className="px-4 grid grid-cols-2 gap-3 max-w-md mx-auto">
        {filtered.map(m => (
          <button key={m.id} onClick={() => setSelected(m)} className="rounded-2xl overflow-hidden relative aspect-[3/4]">
            <img src={m.image} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            <div className="absolute bottom-2 left-2 right-2 text-left"><p className="font-black text-sm">{m.titre}</p><p className="text-[10px] text-white/60">{m.chapitres.length} chapitres</p></div>
          </button>
        ))}
      </div>
    </div>
  );
  }
