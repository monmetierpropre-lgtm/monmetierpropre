import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Send, AlertTriangle, ArrowLeft, Loader2 } from 'lucide-react';
import Logo from '@/components/Logo';
import { insertDemande } from '@/lib/supabase';
import { showToast } from '@/lib/toast';

export default function DevenirExpert() {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    nom: '',
    pays: '',
    whatsapp: '',
    ville: '',
    fonction: '',
    adresse: '',
    bio: '',
  });
  const [cvName, setCvName] = useState('');
  const [cvData, setCvData] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      showToast('Le fichier ne doit pas dépasser 2 Mo', 'error');
      return;
    }
    setCvName(file.name);
    const reader = new FileReader();
    reader.onload = () => setCvData(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    const ok = await insertDemande({
      nom: form.nom,
      pays: form.pays,
      whatsapp: form.whatsapp,
      ville: form.ville,
      fonction: form.fonction,
      adresse: form.adresse,
      bio: form.bio,
      cv_name: cvName || null,
      cv_data: cvData || null,
    });
    setSubmitting(false);
    if (ok) {
      showToast('Demande envoyée avec succès! Vous serez contacté bientôt.', 'success');
      setForm({ nom: '', pays: '', whatsapp: '', ville: '', fonction: '', adresse: '', bio: '' });
      setCvName('');
      setCvData('');
      if (fileRef.current) fileRef.current.value = '';
    } else {
      showToast('Erreur lors de l\'envoi. Vérifiez votre connexion internet.', 'error');
    }
  };

  const inputClass = 'w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-[#F97316] transition-colors';

  return (
    <div className="min-h-screen bg-[#0B2E8C] text-white pb-24">
      <header className="sticky top-0 z-40 bg-[#0B2E8C] border-b border-white/10">
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={() => navigate('/')} className="p-2 rounded-xl hover:bg-white/10 transition-colors">
            <ArrowLeft size={22} />
          </button>
          <Logo size={36} />
          <h1 className="text-xl font-black">Devenir Expert</h1>
        </div>
      </header>

      <div className="px-4 py-4 max-w-md mx-auto">
        <p className="text-sm text-white/70 mb-4">
          Remplissez ce formulaire pour rejoindre notre réseau d'experts. Votre demande sera examinée par notre équipe.
        </p>

        {/* Alerte */}
        <div className="bg-red-50 text-red-800 rounded-2xl p-4 mb-4 flex items-start gap-3 border border-red-200">
          <AlertTriangle size={22} className="flex-shrink-0 text-red-600 mt-0.5" />
          <div>
            <p className="font-bold text-sm">⚠️ Pour être en ordre, commandez votre CV avec code Mon Métier</p>
            <p className="text-xs mt-1 text-red-600">Un CV professionnel est requis pour valider votre inscription.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1.5">Nom complet *</label>
            <input type="text" name="nom" required value={form.nom} onChange={handleChange} className={inputClass} placeholder="Votre nom" />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1.5">Pays *</label>
            <input type="text" name="pays" required value={form.pays} onChange={handleChange} className={inputClass} placeholder="Ex: RD Congo" />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1.5">WhatsApp *</label>
            <input type="tel" name="whatsapp" required value={form.whatsapp} onChange={handleChange} className={inputClass} placeholder="Ex: 243813971187" />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1.5">Ville *</label>
            <input type="text" name="ville" required value={form.ville} onChange={handleChange} className={inputClass} placeholder="Ex: Lubumbashi" />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1.5">Fonction *</label>
            <input type="text" name="fonction" required value={form.fonction} onChange={handleChange} className={inputClass} placeholder="Ex: Plombier, Électricien..." />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1.5">Adresse *</label>
            <input type="text" name="adresse" required value={form.adresse} onChange={handleChange} className={inputClass} placeholder="Votre adresse" />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1.5">Bio *</label>
            <textarea name="bio" required value={form.bio} onChange={handleChange} rows={3} className={inputClass} placeholder="Décrivez votre expérience..." />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1.5">CV (fichier requis) *</label>
            <input
              ref={fileRef}
              type="file"
              required
              onChange={handleFile}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-full border-2 border-dashed border-white/30 rounded-2xl p-4 flex items-center justify-center gap-2 text-white/70 hover:border-[#F97316] transition-colors"
            >
              <Upload size={20} />
              {cvName || 'Choisir un fichier'}
            </button>
          </div>

          {/* Bouton commander CV */}
          <a
            href="https://wa.me/243813971187"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-[#F97316] text-white font-bold rounded-2xl py-3.5 flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition-transform"
          >
            Commandez votre CV chez Mon Métier
          </a>

          {/* Bouton envoyer */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-green-600 text-white font-bold rounded-2xl py-3.5 flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition-transform hover:bg-green-700 disabled:opacity-50"
          >
            {submitting ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
            {submitting ? 'Envoi en cours...' : 'Envoyer'}
          </button>
        </form>
      </div>
    </div>
  );
}
