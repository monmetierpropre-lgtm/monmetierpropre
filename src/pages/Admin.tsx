import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Check, X, Trash2, Edit, Settings, RefreshCw, Lock,
  FileText, Type,
} from 'lucide-react';
import Logo from '@/components/Logo';
import {
  getAdminSettings,
  saveAdminSettings,
  generateExpertCode,
} from '@/lib/storage';
import {
  fetchAllPricing,
  upsertPricing,
  fetchSetting,
  upsertSetting,
  supabase,
  fetchDemandes,
  updateDemandeStatus,
  deleteDemande,
  insertExpert,
  updateExpert,
  deleteExpert,
  fetchExperts,
  type FilePricing,
  type ExpertDemandeRow,
  type ExpertRow,
} from '@/lib/supabase';
import { showToast } from '@/lib/toast';
import type { AdminSettings } from '@/types';

type Tab = 'demandes' | 'approuves' | 'parametres' | 'textes' | 'fichiers' | 'mises';

interface FilePricingState {
  is_paid: boolean;
  price: string;
  payment_code: string;
  btn_label: string;
  btn_color: string;
}

const ALL_FILES = [
  { id: 'cv-simple-gratuit', title: 'CV Simple Gratuit', type: 'cv' },
  { id: 'cv-pro-gratuit', title: 'CV Pro Gratuit', type: 'cv' },
  { id: 'cv-premium-2024', title: 'CV Premium 2024', type: 'cv' },
  { id: 'cv-canva-style', title: 'CV Canva Style', type: 'cv' },
  { id: 'cv-moderne-bleu', title: 'CV Moderne Bleu', type: 'cv' },
  { id: 'cv-moderne-orange', title: 'CV Moderne Orange', type: 'cv' },
  { id: 'cv-elegance', title: 'CV Élégance', type: 'cv' },
  { id: 'cv-creatif', title: 'CV Créatif', type: 'cv' },
  { id: 'cv-minimaliste', title: 'CV Minimaliste', type: 'cv' },
  { id: 'cv-classique', title: 'CV Classique', type: 'cv' },
  { id: 'cv-technique', title: 'CV Technique', type: 'cv' },
  { id: 'cv-executive', title: 'CV Executive', type: 'cv' },
  { id: 'lettre-classique', title: 'Lettre Classique', type: 'lettre' },
  { id: 'lettre-moderne', title: 'Lettre Moderne', type: 'lettre' },
  { id: 'lettre-simple', title: 'Lettre Simple', type: 'lettre' },
  { id: 'lettre-elegante', title: 'Lettre Élégante', type: 'lettre' },
  { id: 'lettre-colorée', title: 'Lettre Colorée', type: 'lettre' },
  { id: 'carte-plombier', title: 'Carte Plombier', type: 'carte' },
  { id: 'carte-electricien', title: 'Carte Électricien', type: 'carte' },
  { id: 'carte-carreleur', title: 'Carte Carreleur', type: 'carte' },
  { id: 'carte-plafonneur', title: 'Carte Plafonneur', type: 'carte' },
  { id: 'carte-macon', title: 'Carte Maçon', type: 'carte' },
  { id: 'carte-peintre', title: 'Carte Peintre', type: 'carte' },
  { id: 'affiche-croisade', title: 'Affiche Croisade', type: 'affiche' },
  { id: 'affiche-culte', title: 'Affiche Culte', type: 'affiche' },
  { id: 'affiche-jeunesse', title: 'Affiche Jeunesse', type: 'affiche' },
  { id: 'affiche-conference', title: 'Affiche Conférence', type: 'affiche' },
  { id: 'affiche-reveil', title: 'Affiche Réveil', type: 'affiche' },
  { id: 'affiche-bapteme', title: 'Affiche Baptême', type: 'affiche' },
  { id: 'affiche-mariage', title: 'Affiche Mariage', type: 'affiche' },
  { id: 'affiche-special', title: 'Affiche Spéciale', type: 'affiche' },
  { id: 'plan-2ch', title: 'Plan Maison 2 Chambres', type: 'plan' },
  { id: 'plan-3ch', title: 'Plan Maison 3 Chambres', type: 'plan' },
  { id: 'plan-4ch', title: 'Plan Maison 4 Chambres', type: 'plan' },
  { id: 'plan-5ch', title: 'Plan Maison 5 Chambres', type: 'plan' },
  { id: 'outil-plombier', title: 'Guide Plombier', type: 'outil' },
  { id: 'outil-electricien', title: 'Guide Électricien', type: 'outil' },
  { id: 'outil-carreleur', title: 'Guide Carreleur', type: 'outil' },
  { id: 'outil-macon', title: 'Guide Maçon', type: 'outil' },
];

export default function Admin() {
  const navigate = useNavigate();
  const [pinInput, setPinInput] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('demandes');
  const [demandes, setDemandes] = useState<ExpertDemandeRow[]>([]);
  const [experts, setExperts] = useState<ExpertRow[]>([]);
  const [settings, setSettings] = useState<AdminSettings>(getAdminSettings());
  const [editingExpert, setEditingExpert] = useState<ExpertRow | null>(null);

  const [accueilBtns, setAccueilBtns] = useState({
    plombier: { nom: 'Plombier', url: 'https://wa.me/243849561334' },
    plafonneur: { nom: 'Plafonneur', url: 'https://wa.me/243849561334' },
    carreleur: { nom: 'Carreleur', url: 'https://wa.me/243813971187' },
    autres: { nom: 'Autres services', url: 'https://wa.me/243813971187' },
  });
  const [reglesText, setReglesText] = useState('');

  const [pricingMap, setPricingMap] = useState<Record<string, FilePricing>>({});
  const [pricingEdits, setPricingEdits] = useState<Record<string, FilePricingState>>({});
  const [savingAll, setSavingAll] = useState(false);

  useEffect(() => {
    if (unlocked) {
      loadDemandes();
      loadExpertsData();
      loadRemoteData();
    }
  }, [unlocked]);

  useEffect(() => {
    if (!unlocked) return;
    const channel = supabase
      .channel('admin_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'file_pricing' },
        () => loadPricing()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'app_settings' },
        () => loadSettings()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'expert_demandes' },
        () => loadDemandes()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'experts' },
        () => loadExpertsData()
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [unlocked]);

  const loadDemandes = async () => {
    const data = await fetchDemandes();
    setDemandes(data);
  };

  const loadExpertsData = async () => {
    const data = await fetchExperts();
    setExperts(data);
  };

  const loadRemoteData = async () => {
    await loadPricing();
    await loadSettings();
  };

  const loadPricing = async () => {
    const map = await fetchAllPricing();
    setPricingMap(map);
    const edits: Record<string, FilePricingState> = {};
    ALL_FILES.forEach((f) => {
      const p = map[f.id];
      edits[f.id] = {
        is_paid: p?.is_paid ?? false,
        price: p?.price ?? '',
        payment_code: p?.payment_code ?? '',
        btn_label: p?.btn_label ?? 'Télécharger',
        btn_color: p?.btn_color ?? '#F97316',
      };
    });
    setPricingEdits(edits);
  };

  const loadSettings = async () => {
    const btnsData = await fetchSetting('accueil_buttons');
    if (btnsData) setAccueilBtns(btnsData as typeof accueilBtns);
    const reglesData = await fetchSetting('regles_text');
    if (reglesData) setReglesText((reglesData as { text: string }).text);
  };

  const storedPin = getAdminSettings().pin;

  const tryPin = () => {
    if (pinInput === storedPin) {
      setUnlocked(true);
      showToast('Accès admin accordé', 'success');
    } else {
      showToast('PIN incorrect', 'error');
    }
  };

  const approuverDemande = async (demande: ExpertDemandeRow) => {
    const code = generateExpertCode();
    const newId = await insertExpert({
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
      prix_jour: null,
      code,
      is_default: false,
    });
    if (newId) {
      await updateDemandeStatus(demande.id, 'approved');
      showToast(`Expert approuvé! Code: ${code}`, 'success');
    } else {
      showToast('Erreur lors de l\'approbation', 'error');
    }
  };

  const refuserDemande = async (id: string) => {
    const ok = await updateDemandeStatus(id, 'rejected');
    if (ok) {
      showToast('Demande refusée', 'info');
    } else {
      showToast('Erreur lors du refus', 'error');
    }
  };

  const supprimerExpert = async (id: string) => {
    const ok = await deleteExpert(id);
    if (ok) {
      showToast('Expert supprimé', 'info');
    } else {
      showToast('Erreur lors de la suppression', 'error');
    }
  };

  const sauverExpert = async () => {
    if (!editingExpert) return;
    const { id, created_at, ...updates } = editingExpert;
    void created_at;
    const ok = await updateExpert(id, updates);
    if (ok) {
      setEditingExpert(null);
      showToast('Expert modifié', 'success');
    } else {
      showToast('Erreur lors de la modification', 'error');
    }
  };

  const sauverSettings = () => {
    saveAdminSettings(settings);
    localStorage.setItem('annonce_admin', settings.annonce);
    showToast('Paramètres sauvegardés', 'success');
  };

  const saveTexts = async () => {
    try {
      await upsertSetting('accueil_buttons', accueilBtns as unknown as Record<string, unknown>);
      await upsertSetting('regles_text', { text: reglesText });
      showToast('Textes sauvegardés et appliqués instantanément', 'success');
    } catch {
      showToast('Erreur lors de la sauvegarde', 'error');
    }
  };

  const savePricing = async (fileId: string) => {
    const edit = pricingEdits[fileId];
    if (!edit) return;
    const file = ALL_FILES.find((f) => f.id === fileId);
    if (!file) return;
    try {
      await upsertPricing(fileId, file.type, edit.is_paid, edit.price, edit.payment_code, edit.btn_label, edit.btn_color);
      showToast(`Sauvegardé pour ${file.title}`, 'success');
    } catch {
      showToast('Erreur sauvegarde', 'error');
    }
  };

  const saveAllPricing = async () => {
    for (const file of ALL_FILES) {
      const edit = pricingEdits[file.id];
      if (!edit) continue;
      try {
        await upsertPricing(file.id, file.type, edit.is_paid, edit.price, edit.payment_code, edit.btn_label, edit.btn_color);
      } catch { /* continue */ }
    }
  };

  const forcerMiseAJour = async () => {
    setSavingAll(true);
    try {
      await upsertSetting('accueil_buttons', accueilBtns as unknown as Record<string, unknown>);
      await upsertSetting('regles_text', { text: reglesText });
      await saveAllPricing();
      saveAdminSettings(settings);
      localStorage.setItem('annonce_admin', settings.annonce);
      const newVersion = Date.now().toString();
      localStorage.setItem('app_version', newVersion);
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({ type: 'FORCE_UPDATE' });
      }
      caches.keys().then((keys) => {
        Promise.all(keys.map((key) => caches.delete(key))).then(() => {
          setSavingAll(false);
          showToast('Mise à jour forcée! Tous les utilisateurs seront mis à jour', 'success');
          setTimeout(() => window.location.reload(), 1500);
        });
      });
    } catch {
      setSavingAll(false);
      showToast('Erreur lors de la mise à jour', 'error');
    }
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
    { id: 'textes', label: 'Textes', icon: Type },
    { id: 'fichiers', label: 'Fichiers', icon: FileText },
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
                      {demande.cv_name && <p className="text-xs text-white/40 mt-1">CV: {demande.cv_name}</p>}
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

        {activeTab === 'textes' && (
          <div className="space-y-4">
            <h2 className="font-bold text-lg mb-2 flex items-center gap-2">
              <Type size={18} className="text-[#F97316]" />
              Gestion des textes
            </h2>

            <div className="bg-white/10 rounded-2xl p-4 space-y-3">
              <h3 className="font-bold text-sm text-[#F97316]">Boutons Accueil (Techniciens)</h3>
              {(['plombier', 'plafonneur', 'carreleur', 'autres'] as const).map((key) => (
                <div key={key} className="space-y-2">
                  <label className="block text-xs font-semibold text-white/70 capitalize">{key}</label>
                  <input
                    type="text"
                    value={accueilBtns[key].nom}
                    onChange={(e) => setAccueilBtns({ ...accueilBtns, [key]: { ...accueilBtns[key], nom: e.target.value } })}
                    className={inputClass}
                    placeholder="Nom du bouton"
                  />
                  <input
                    type="text"
                    value={accueilBtns[key].url}
                    onChange={(e) => setAccueilBtns({ ...accueilBtns, [key]: { ...accueilBtns[key], url: e.target.value } })}
                    className={inputClass}
                    placeholder="Lien WhatsApp"
                  />
                </div>
              ))}
            </div>

            <div className="bg-white/10 rounded-2xl p-4 space-y-3">
              <h3 className="font-bold text-sm text-[#F97316]">Texte de la page Règles</h3>
              <p className="text-xs text-white/50">Collez le texte des règles. Laissez vide pour garder les règles par défaut.</p>
              <textarea
                value={reglesText}
                onChange={(e) => setReglesText(e.target.value)}
                rows={8}
                className={inputClass + ' resize-none'}
                placeholder="Texte des règles de la plateforme..."
              />
            </div>

            <button
              onClick={saveTexts}
              className="w-full bg-green-600 rounded-2xl py-3 font-bold active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
            >
              <Check size={18} />
              Sauvegarder les textes
            </button>
          </div>
        )}

        {activeTab === 'fichiers' && (
          <div className="space-y-3">
            <h2 className="font-bold text-lg mb-2 flex items-center gap-2">
              <FileText size={18} className="text-[#F97316]" />
              Gérer boutons télécharger - Page Design
            </h2>
            <p className="text-xs text-white/50 mb-2">
              Par défaut, tous les fichiers sont gratuits. Activez "Payant" pour exiger un paiement avant téléchargement.
            </p>
            {ALL_FILES.map((file) => {
              const edit = pricingEdits[file.id] || { is_paid: false, price: '', payment_code: '', btn_label: 'Télécharger', btn_color: '#F97316' };
              return (
                <div key={file.id} className="bg-white/10 rounded-2xl p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-sm">{file.title}</h3>
                      <span className="text-[10px] text-white/40 uppercase">{file.type}</span>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <span className="text-xs font-bold">{edit.is_paid ? 'Payant' : 'Gratuit'}</span>
                      <button
                        onClick={() => setPricingEdits({
                          ...pricingEdits,
                          [file.id]: { ...edit, is_paid: !edit.is_paid },
                        })}
                        className={`relative w-11 h-6 rounded-full transition-colors ${edit.is_paid ? 'bg-[#F97316]' : 'bg-white/20'}`}
                      >
                        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${edit.is_paid ? 'translate-x-5' : ''}`} />
                      </button>
                    </label>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-[10px] text-white/50 mb-0.5">Texte du bouton</label>
                      <input
                        type="text"
                        value={edit.btn_label}
                        onChange={(e) => setPricingEdits({ ...pricingEdits, [file.id]: { ...edit, btn_label: e.target.value } })}
                        className={inputClass}
                        placeholder="Télécharger"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-white/50 mb-0.5">Couleur du bouton</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={edit.btn_color}
                          onChange={(e) => setPricingEdits({ ...pricingEdits, [file.id]: { ...edit, btn_color: e.target.value } })}
                          className="w-10 h-10 rounded-xl border border-white/20 bg-transparent cursor-pointer"
                        />
                        <input
                          type="text"
                          value={edit.btn_color}
                          onChange={(e) => setPricingEdits({ ...pricingEdits, [file.id]: { ...edit, btn_color: e.target.value } })}
                          className={inputClass}
                          placeholder="#F97316"
                        />
                      </div>
                    </div>
                  </div>
                  {edit.is_paid && (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={edit.price}
                        onChange={(e) => setPricingEdits({ ...pricingEdits, [file.id]: { ...edit, price: e.target.value } })}
                        className={inputClass}
                        placeholder="Prix (ex: 5$ ou 1000 CDF)"
                      />
                      <textarea
                        value={edit.payment_code}
                        onChange={(e) => setPricingEdits({ ...pricingEdits, [file.id]: { ...edit, payment_code: e.target.value } })}
                        rows={3}
                        className={inputClass + ' resize-none'}
                        placeholder="Collez le code de paiement (Stripe, Airtel Money, M-Pesa, FlexPay)..."
                      />
                    </div>
                  )}
                  <button
                    onClick={() => savePricing(file.id)}
                    className="w-full bg-white/15 rounded-xl py-2 font-bold text-xs active:scale-95 transition-transform"
                  >
                    Sauvegarder ce fichier
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'mises' && (
          <div className="space-y-4">
            <h2 className="font-bold text-lg mb-2">Mises à jour</h2>
            <div className="bg-white/10 rounded-2xl p-6 text-center space-y-4">
              <RefreshCw size={48} className={`mx-auto text-[#F97316] ${savingAll ? 'animate-spin' : ''}`} />
              <p className="text-sm text-white/70">
                Forcer une mise à jour sauvegarde tous les textes, tous les prix de fichiers, vide le cache et recharge l'application pour tous les utilisateurs.
                Version actuelle: {localStorage.getItem('app_version') || '1.0.0'}
              </p>
              <button
                onClick={forcerMiseAJour}
                disabled={savingAll}
                className="w-full bg-[#F97316] rounded-2xl py-3.5 font-bold active:scale-[0.98] transition-transform flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <RefreshCw size={20} className={savingAll ? 'animate-spin' : ''} />
                {savingAll ? 'Sauvegarde en cours...' : 'Forcer la mise à jour'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
