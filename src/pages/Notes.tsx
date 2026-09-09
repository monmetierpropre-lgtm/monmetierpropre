import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function Notes() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string | null>(null);

  const metiers = [
    { id: '1', title: '1. PLOMBIER', img: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=400', info: 'Base: diametre 12/17 lavabo. Astuce: photo avant apres. Securite: couper eau.' },
    { id: '2', title: '2. CARRELEUR', img: 'https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?w=400', info: 'Base: partir du centre. Astuce: mouiller carreaux 10min.' },
    { id: '3', title: '3. PLAFONNEUR', img: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400', info: 'Enduit 2 passes 3mm, taloche inox.' },
    { id: '4', title: '4. MACON', img: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400', info: 'Fondation 80cm, beton 350kg/m3, fil a plomb.' },
    { id: '5', title: '5. ELECTRICIEN', img: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400', info: 'Couper general + VAT, 6 prises max circuit 2.5mm2.' },
    { id: '6', title: '6. PEINTRE', img: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=400', info: '80% preparation, poncage grain 120.' },
    { id: '7', title: '7. MENUISIER', img: 'https://images.unsplash.com/photo-1416339442236-8ceb164046f8?w=400', info: 'Precision 1mm, mesure 2 fois coupe 1 fois.' },
    { id: '8', title: '8. SECURITE', img: 'https://images.unsplash.com/photo-1504328345606-18bbc504a893?w=400', info: 'Regle or: salue equipe, ne crie jamais, partage outils.' },
  ];

  return (
    <div className="min-h-screen bg-[#0B2E8C] text-white pb-24">
      <div className="flex items-center gap-3 px-4 py-3">
        <button onClick={() => navigate('/regles')} className="p-2 bg-white/10 rounded-full"><ArrowLeft size={20} /></button>
        <h1 className="font-black">Notes - 1.0.26</h1>
      </div>
      <div className="p-4 grid grid-cols-2 gap-3 max-w-md mx-auto">
        {metiers.map(m => (
          <div key={m.id} onClick={() => setSelected(selected === m.id? null : m.id)} className="bg-white rounded-2xl overflow-hidden text-gray-900 cursor-pointer">
            <img src={m.img} alt="" className="w-full h-24 object-cover" />
            <div className="p-3">
              <p className="font-black text-xs">{m.title}</p>
              {selected === m.id && <p className="text-[11px] mt-2">{m.info}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
