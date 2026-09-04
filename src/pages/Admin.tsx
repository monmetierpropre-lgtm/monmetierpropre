import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, X, Trash2, Edit, Settings, RefreshCw, Lock } from 'lucide-react';
import Logo from '@/components/Logo';
import {
  getDemandes,
  saveDemandes,
  getExperts,
  saveExperts,
  getAdminSettings,
  saveAdminSettings,
  generateExpertCode,
} from '@/lib/storage';
import { showToast } from '@/lib/toast';
import type { DemandeExpert, Expert, AdminSettings } from '@/types';

type Tab = 'demandes' | 'approuves' | 'parametres' | 'mises';

export default function Admin() {
  const navigate = useNavigate();
  const [pinInput, setPinInput] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('demandes');
  const [demandes, setDemandes] = useState<DemandeExpert[]>([]);
  const [experts, setExperts] = useState<Expert[]>([]);
  const [settings, setSettings] = useState<AdminSettings>(getAdminSettings());
  const [editingExpert, setEditingExpert] = useState<Expert | null>(null);

  useEffect(() => {
    if (unlocked) {
      setDemandes(getDemandes());
      setExperts(getExperts());
    }
  }, [unlocked]);

  const storedPin = getAdminSettings().pin;

  const tryPin = () => {
    if (pinInput === storedPin) {
      setUnlocked(true);
      showToast('Accès admin accordé', 'success');
    } else {
      showToast('PIN incorrect', 'error');
    }
  };

  const refreshData = () => {
    setDemandes(getDemandes());
    setExperts(getExperts());
  };

  const approuverDemande = (demande: DemandeExpert) => {
    const code = generateExpertCode();
    const newExpert: Expert = {
      id: demande.id,
      nom: demande.nom,
      pays: demande.pays,
      whatsapp: demande.whatsapp,
      ville: demande.ville,
      fonction: demande.fonction,
      adresse: demande.adresse,
      bio: demande.bio,
      photo: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70) + 1}`,
      status: 'approved',
      travaux: [],
      prixJour: '',
      code,
      createdAt: demande.createdAt,
    };
    const updatedExperts = [...experts, newExpert];
    saveExperts(updatedExperts);
    setExperts(updatedExperts);

    const updatedDemandes = demandes.map((d) =>
      d.id === demande.id ? { ...d, status: 'approved' as const } : d
    );
    saveDemandes(updatedDemandes);
    setDemandes(updatedDemandes);
    showToast(`Expert approuvé! Code: ${code}`, 'success');
  };

  const refuserDemande = (id: string) => {
    const updated = demandes.map((d) => (d.id === id ? { ...d, status: 'rejected' as const } : d));
    saveDemandes(updated);
    setDemandes(updated);
    showToast('Demande refusée', 'info');
  };

  const supprimerExpert = (id: string) => {
    const updated = experts.filter((e) => e.id !== id);
    saveExperts(updated);
    setExperts(updated);
    showToast('Expert supprimé', 'info');
  };

  const sauverExpert = () => {
    if (!editingExpert) return;
    const updated = experts.map((e) => (e.id === editingExpert.id ? editingExpert : e));
    saveExperts(updated);
    setExperts(updated);
    setEditingExpert(null);
    showToast('Expert modifié', 'success');
  };

  const sauverSettings = () => {
    saveAdminSettings(settings);
    localStorage.setItem('annonce_admin', settings.annonce);
    showToast('Paramètres sauvegardés', 'success');
  };

  const forcerMiseAJour = () => {
    const newVersion = Date.now().toString();
    localStorage.setItem('app_version', newVersion);
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'FORCE_UPDATE' });
    }
    caches.keys().then((keys) => {
      Promise.all(keys.map((key) => caches.delete(key))).then(() => {
        showToast('Mise à jour forcée! Rechargement...', 'success');
        setTimeout(() => window.location.reload(), 1000);
      });
    });
  };

  if (!unlocked) {
    return (
      <div className="min-h-screen bg-[#0B2E8C] text-white flex flex-col items-center justify-center px-4">
        <Logo size={80} className="mb-6" />
        <div className="bg-white/10 rounded-2xl p-6 w-full max-w-sm space-y-4">
          <div className="flex items-center justify-center gap-2 text-[#F97316]">
            <Lock size={24} />
            <h1 className="text-xl font-black">Admin</h1>
          </div>
          <p className="text-sm text-white/60 text-center">Entrez le PIN administrateur</p>
          <input
            type="password"
            value={pinInput}
            onChange={(e) => setPinInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && tryPin()}
            placeholder="PIN"
            className="w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-3 text-white text-center text-lg tracking-widest focus:outline-none focus:border-[#F97316]"
          />
          <button
            onClick={tryPin}
            className="w-full bg-[#F97316] text-white font-bold rounded-2xl py-3 active:scale-[0.98] transition-transform"
          >
            Déverrouiller
          </button>
          <button
            onClick={() => navigate('/')}
            className="w-full text-sm text-white/50 hover:text-white transition-colors flex items-center justify-center gap-1"
          >
            <ArrowLeft size={16} />
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: typeof Settings }[] = [
    { id: 'demandes', label: 'Demandes', icon: Check },
    { id: 'approuves', label: 'Approuvés', icon: Edit },
    { id: 'parametres', label: 'Paramètres', icon: Settings },
    { id: 'mises', label: 'Mises à jour', icon: RefreshCw },
  ];

  const inputClass = 'w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-[#F97316] transition-colors';

  return (
    <div className="min-h-screen bg-[#0B2E8C] text-white pb-24">
      <header className="sticky top-0 z-40 bg-[#0B2E8C] border-b border-white/10">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/')} className="p-2 rounded-xl hover:bg-white/10 transition-colors">
              <ArrowLeft size={22} />
            </button>
            <h1 className="text-xl font-black">Admin</h1>
          </div>
          <Logo size={32} />
        </div>
        {/* Tabs */}
        <div className="flex overflow-x-auto no-scrollbar px-2 pb-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors ${
                  activeTab === tab.id ? 'bg-[#F97316] text-white' : 'text-white/60 hover:bg-white/10'
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </header>

      <div className="px-4 py-4 max-w-md mx-auto">
        {/* Tab: Demandes */}
        {activeTab === 'demandes' && (
          <div className="space-y-3">
            <h2 className="font-bold text-lg mb-2">Demandes d'experts</h2>
            {demandes.length === 0 ? (
              <p className="text-center text-white/50 py-8">Aucune demande</p>
            ) : (
              demandes.map((demande) => (
                <div key={demande.id} className="bg-white/10 rounded-2xl p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-bold">{demande.nom}</h3>
                      <p className="text-sm text-[#F97316]">{demande.fonction}</p>
                      <p className="text-xs text-white/60">{demande.ville}, {demande.pays}</p>
                      <p className="text-xs text-white/60">WhatsApp: {demande.whatsapp}</p>
                      {demande.bio && <p className="text-xs text-white/50 mt-1">{demande.bio}</p>}
                      {demande.cvName && <p className="text-xs text-white/40 mt-1">CV: {demande.cvName}</p>}
                    </div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      demande.status === 'pending' ? 'bg-orange-500/30 text-orange-300' :
                      demande.status === 'approved' ? 'bg-green-500/30 text-green-300' :
                      'bg-red-500/30 text-red-300'
                    }`}>
                      {demande.status === 'pending' ? 'En attente' : demande.status === 'approved' ? 'Approuvé' : 'Refusé'}
                    </span>
                  </div>
                  {demande.status === 'pending' && (
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => approuverDemande(demande)}
                        className="flex-1 bg-green-600 rounded-xl py-2 font-bold text-sm flex items-center justify-center gap-1 active:scale-95 transition-transform"
                      >
                        <Check size={16} />
                        Approuver
                      </button>
                      <button
                        onClick={() => refuserDemande(demande.id)}
                        className="flex-1 bg-red-600 rounded-xl py-2 font-bold text-sm flex items-center justify-center gap-1 active:scale-95 transition-transform"
                      >
                        <X size={16} />
                        Refuser
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab: Approuvés */}
        {activeTab === 'approuves' && (
          <div className="space-y-3">
            <h2 className="font-bold text-lg mb-2">Experts approuvés</h2>
            {experts.map((expert) => (
              <div key={expert.id} className="bg-white/10 rounded-2xl p-4">
                {editingExpert?.id === expert.id ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editingExpert.nom}
                      onChange={(e) => setEditingExpert({ ...editingExpert, nom: e.target.value })}
                      className={inputClass}
                      placeholder="Nom"
                    />
                    <input
                      type="text"
                      value={editingExpert.fonction}
                      onChange={(e) => setEditingExpert({ ...editingExpert, fonction: e.target.value })}
                      className={inputClass}
                      placeholder="Fonction"
                    />
                    <input
                      type="text"
                      value={editingExpert.ville}
                      onChange={(e) => setEditingExpert({ ...editingExpert, ville: e.target.value })}
                      className={inputClass}
                      placeholder="Ville"
                    />
                    <input
                      type="text"
                      value={editingExpert.whatsapp}
                      onChange={(e) => setEditingExpert({ ...editingExpert, whatsapp: e.target.value })}
                      className={inputClass}
                      placeholder="WhatsApp"
                    />
                    <textarea
                      value={editingExpert.bio}
                      onChange={(e) => setEditingExpert({ ...editingExpert, bio: e.target.value })}
                      className={inputClass}
                      rows={2}
                      placeholder="Bio"
                    />
                    <div className="flex gap-2">
                      <button onClick={sauverExpert} className="flex-1 bg-green-600 rounded-xl py-2 font-bold text-sm flex items-center justify-center gap-1">
                        <Check size={16} />
                        Enregistrer
                      </button>
                      <button onClick={() => setEditingExpert(null)} className="flex-1 bg-white/15 rounded-xl py-2 font-bold text-sm">
                        Annuler
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start gap-3">
                      <img src={expert.photo || `https://i.pravatar.cc/150?img=1`} alt={expert.nom} className="w-12 h-12 rounded-xl object-cover" />
                      <div className="flex-1">
                        <h3 className="font-bold">{expert.nom}</h3>
                        <p className="text-sm text-[#F97316]">{expert.fonction}</p>
                        <p className="text-xs text-white/60">{expert.ville}, {expert.pays}</p>
                        {expert.code && <p className="text-xs text-white/40">Code: {expert.code}</p>}
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => setEditingExpert({ ...expert })}
                        className="flex-1 bg-white/15 rounded-xl py-2 font-bold text-sm flex items-center justify-center gap-1 active:scale-95 transition-transform"
                      >
                        <Edit size={16} />
                        Modifier
                      </button>
                      <button
                        onClick={() => supprimerExpert(expert.id)}
                        className="flex-1 bg-red-600 rounded-xl py-2 font-bold text-sm flex items-center justify-center gap-1 active:scale-95 transition-transform"
                      >
                        <Trash2 size={16} />
                        Supprimer
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Tab: Paramètres */}
        {activeTab === 'parametres' && (
          <div className="space-y-4">
            <h2 className="font-bold text-lg mb-2">Paramètres</h2>
            <div className="bg-white/10 rounded-2xl p-4 space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1.5">Annonce admin</label>
                <textarea
                  value={settings.annonce}
                  onChange={(e) => setSettings({ ...settings, annonce: e.target.value })}
                  rows={3}
                  className={inputClass}
                  placeholder="Annonce affichée sur la page d'accueil"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5">Couleur du thème</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={settings.themeColor}
                    onChange={(e) => setSettings({ ...settings, themeColor: e.target.value })}
                    className="w-12 h-12 rounded-xl border border-white/20 bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    value={settings.themeColor}
                    onChange={(e) => setSettings({ ...settings, themeColor: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5">PIN admin</label>
                <input
                  type="text"
                  value={settings.pin}
                  onChange={(e) => setSettings({ ...settings, pin: e.target.value })}
                  className={inputClass}
                  placeholder="PIN"
                />
              </div>
              <button
                onClick={sauverSettings}
                className="w-full bg-green-600 rounded-2xl py-3 font-bold active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
              >
                <Check size={18} />
                Sauvegarder
              </button>
            </div>
          </div>
        )}

        {/* Tab: Mises à jour */}
        {activeTab === 'mises' && (
          <div className="space-y-4">
            <h2 className="font-bold text-lg mb-2">Mises à jour</h2>
            <div className="bg-white/10 rounded-2xl p-6 text-center space-y-4">
              <RefreshCw size={48} className="mx-auto text-[#F97316]" />
              <p className="text-sm text-white/70">
                Forcer une mise à jour vide le cache et recharge l'application pour tous les utilisateurs.
                Version actuelle: {localStorage.getItem('app_version') || '1.0.0'}
              </p>
              <button
                onClick={forcerMiseAJour}
                className="w-full bg-[#F97316] rounded-2xl py-3.5 font-bold active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
              >
                <RefreshCw size={20} />
                Forcer mise à jour
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
