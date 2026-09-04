import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Upload, Trash2, X, LogIn } from 'lucide-react';
import Logo from '@/components/Logo';
import { getExperts, saveExperts } from '@/lib/storage';
import { showToast } from '@/lib/toast';
import type { Expert } from '@/types';

export default function MonEspace() {
  const navigate = useNavigate();
  const [whatsappInput, setWhatsappInput] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [expert, setExpert] = useState<Expert | null>(null);
  const photoRef = useRef<HTMLInputElement>(null);
  const travauxRef = useRef<HTMLInputElement>(null);

  const handleLogin = () => {
    const experts = getExperts();
    const found = experts.find((e) => e.whatsapp === whatsappInput.trim());
    if (found) {
      setExpert({ ...found });
      setLoggedIn(true);
      showToast(`Bienvenue ${found.nom}!`, 'success');
    } else {
      showToast('Aucun expert trouvé avec ce numéro WhatsApp', 'error');
    }
  };

  const handleLogout = () => {
    setLoggedIn(false);
    setExpert(null);
    setWhatsappInput('');
  };

  const updateField = (field: keyof Expert, value: string) => {
    if (!expert) return;
    setExpert({ ...expert, [field]: value });
  };

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      showToast('L\'image ne doit pas dépasser 2 Mo', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      updateField('photo', reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleTravaux = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!expert) return;
    files.forEach((file) => {
      if (file.size > 2 * 1024 * 1024) {
        showToast(`${file.name} dépasse 2 Mo`, 'error');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setExpert((prev) => {
          if (!prev) return prev;
          return { ...prev, travaux: [...prev.travaux, reader.result as string] };
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const removeTravail = (idx: number) => {
    if (!expert) return;
    setExpert({ ...expert, travaux: expert.travaux.filter((_, i) => i !== idx) });
  };

  const handleSave = () => {
    if (!expert) return;
    const experts = getExperts();
    const updated = experts.map((e) => (e.id === expert.id ? expert : e));
    saveExperts(updated);
    showToast('Profil sauvegardé avec succès!', 'success');
  };

  const inputClass = 'w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-[#F97316] transition-colors';

  if (!loggedIn) {
    return (
      <div className="min-h-screen bg-[#0B2E8C] text-white pb-24">
        <header className="sticky top-0 z-40 bg-[#0B2E8C] border-b border-white/10">
          <div className="flex items-center gap-3 px-4 py-3">
            <button onClick={() => navigate('/')} className="p-2 rounded-xl hover:bg-white/10 transition-colors">
              <ArrowLeft size={22} />
            </button>
            <Logo size={36} />
            <h1 className="text-xl font-black">Mon Espace</h1>
          </div>
        </header>

        <div className="px-4 py-8 max-w-md mx-auto">
          <div className="bg-white/10 rounded-2xl p-6 space-y-4">
            <div className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center">
                <LogIn size={28} className="text-[#F97316]" />
              </div>
              <h2 className="text-lg font-bold">Connexion Expert</h2>
              <p className="text-sm text-white/60 text-center">Entrez votre numéro WhatsApp pour accéder à votre espace</p>
            </div>
            <input
              type="tel"
              value={whatsappInput}
              onChange={(e) => setWhatsappInput(e.target.value)}
              placeholder="Ex: 243813971187"
              className={inputClass}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            />
            <button
              onClick={handleLogin}
              className="w-full bg-[#F97316] text-white font-bold rounded-2xl py-3.5 flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition-transform"
            >
              <LogIn size={20} />
              Se connecter
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!expert) return null;

  return (
    <div className="min-h-screen bg-[#0B2E8C] text-white pb-24">
      <header className="sticky top-0 z-40 bg-[#0B2E8C] border-b border-white/10">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/')} className="p-2 rounded-xl hover:bg-white/10 transition-colors">
              <ArrowLeft size={22} />
            </button>
            <h1 className="text-xl font-black">Mon Espace</h1>
          </div>
          <button onClick={handleLogout} className="text-sm bg-white/10 rounded-xl px-3 py-1.5 font-bold">
            Déconnexion
          </button>
        </div>
      </header>

      <div className="px-4 py-4 max-w-md mx-auto space-y-4">
        {/* Photo */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <img
              src={expert.photo || `https://i.pravatar.cc/150?img=1`}
              alt={expert.nom}
              className="w-24 h-24 rounded-full object-cover border-4 border-white/20"
            />
            <button
              onClick={() => photoRef.current?.click()}
              className="absolute bottom-0 right-0 bg-[#F97316] rounded-full p-2 shadow-lg"
            >
              <Upload size={16} />
            </button>
            <input ref={photoRef} type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
          </div>
          {expert.code && (
            <span className="bg-white/10 rounded-full px-3 py-1 text-xs font-bold text-[#F97316]">
              Code: {expert.code}
            </span>
          )}
        </div>

        {/* Form */}
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-semibold mb-1.5">Nom</label>
            <input type="text" value={expert.nom} onChange={(e) => updateField('nom', e.target.value)} className={inputClass} />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1.5">Fonction</label>
            <input type="text" value={expert.fonction} onChange={(e) => updateField('fonction', e.target.value)} className={inputClass} />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1.5">Ville</label>
            <input type="text" value={expert.ville} onChange={(e) => updateField('ville', e.target.value)} className={inputClass} />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1.5">Pays</label>
            <input type="text" value={expert.pays} onChange={(e) => updateField('pays', e.target.value)} className={inputClass} />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1.5">Adresse</label>
            <input type="text" value={expert.adresse} onChange={(e) => updateField('adresse', e.target.value)} className={inputClass} />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1.5">Bio</label>
            <textarea value={expert.bio} onChange={(e) => updateField('bio', e.target.value)} rows={3} className={inputClass} />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1.5">WhatsApp</label>
            <input type="tel" value={expert.whatsapp} onChange={(e) => updateField('whatsapp', e.target.value)} className={inputClass} />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1.5">Statut</label>
            <select
              value={expert.status}
              onChange={(e) => updateField('status', e.target.value as Expert['status'])}
              className={inputClass}
            >
              <option value="approved" className="bg-[#0B2E8C]">Disponible</option>
              <option value="pending" className="bg-[#0B2E8C]">En attente</option>
              <option value="rejected" className="bg-[#0B2E8C]">Indisponible</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1.5">Prix par jour</label>
            <input type="text" value={expert.prixJour || ''} onChange={(e) => updateField('prixJour', e.target.value)} className={inputClass} placeholder="Ex: 25$" />
          </div>

          {/* Travaux */}
          <div>
            <label className="block text-sm font-semibold mb-1.5">Travaux (images)</label>
            <input ref={travauxRef} type="file" accept="image/*" multiple onChange={handleTravaux} className="hidden" />
            <button
              onClick={() => travauxRef.current?.click()}
              className="w-full border-2 border-dashed border-white/30 rounded-2xl p-4 flex items-center justify-center gap-2 text-white/70 hover:border-[#F97316] transition-colors"
            >
              <Upload size={20} />
              Ajouter des images
            </button>
            {expert.travaux.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-3">
                {expert.travaux.map((travail, i) => (
                  <div key={i} className="relative group">
                    <img src={travail} alt={`Travail ${i + 1}`} className="w-full aspect-square rounded-xl object-cover" />
                    <button
                      onClick={() => removeTravail(i)}
                      className="absolute top-1 right-1 bg-red-600 rounded-full p-1 shadow-lg"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <button
          onClick={handleSave}
          className="w-full bg-green-600 text-white font-bold rounded-2xl py-4 flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition-transform hover:bg-green-700"
        >
          <Save size={20} />
          Sauvegarder
        </button>
      </div>
    </div>
  );
}
