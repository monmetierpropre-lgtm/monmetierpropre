import type { Expert, DemandeExpert, AdminSettings } from '@/types';

export const DEFAULT_EXPERTS: Expert[] = [
  {
    id: 'default-1',
    nom: 'Jean',
    pays: 'RD Congo',
    whatsapp: '243813971187',
    ville: 'Lubumbashi',
    fonction: 'Plombier',
    adresse: 'Quartier Gecamines, Lubumbashi',
    bio: 'Plombier expérimenté avec plus de 10 ans d\'expérience en réparation et installation sanitaire.',
    photo: 'https://i.pravatar.cc/150?img=1',
    status: 'approved',
    travaux: [],
    prixJour: '25$',
    isDefault: true,
    createdAt: Date.now(),
  },
  {
    id: 'default-2',
    nom: 'Musa',
    pays: 'RD Congo',
    whatsapp: '243849561334',
    ville: 'Kolwezi',
    fonction: 'Plafonneur',
    adresse: 'Centre-ville, Kolwezi',
    bio: 'Plafonneur professionnel spécialisé en faux plafonds et décoration intérieure.',
    photo: 'https://i.pravatar.cc/150?img=12',
    status: 'approved',
    travaux: [],
    prixJour: '20$',
    isDefault: true,
    createdAt: Date.now(),
  },
  {
    id: 'default-3',
    nom: 'David',
    pays: 'RD Congo',
    whatsapp: '243813971187',
    ville: 'Likasi',
    fonction: 'Carreleur',
    adresse: 'Quartier SNCC, Likasi',
    bio: 'Carreleur qualifié pour tous vos travaux de carrelage et faïence.',
    photo: 'https://i.pravatar.cc/150?img=33',
    status: 'approved',
    travaux: [],
    prixJour: '22$',
    isDefault: true,
    createdAt: Date.now(),
  },
  {
    id: 'default-4',
    nom: 'Grace',
    pays: 'RD Congo',
    whatsapp: '243813971187',
    ville: 'Lubumbashi',
    fonction: 'Electricienne',
    adresse: 'Quartier Bel Air, Lubumbashi',
    bio: 'Électricienne certifiée pour installations domestiques et industrielles.',
    photo: 'https://i.pravatar.cc/150?img=45',
    status: 'approved',
    travaux: [],
    prixJour: '30$',
    isDefault: true,
    createdAt: Date.now(),
  },
];

export const DEFAULT_ADMIN_SETTINGS: AdminSettings = {
  annonce: 'Bienvenue sur Mon Métier - Connectez-vous avec les meilleurs techniciens de votre ville!',
  themeColor: '#0B2E8C',
  pin: 'Azer2323',
};

export function getExperts(): Expert[] {
  const stored = localStorage.getItem('experts_approuves');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return DEFAULT_EXPERTS;
    }
  }
  localStorage.setItem('experts_approuves', JSON.stringify(DEFAULT_EXPERTS));
  return DEFAULT_EXPERTS;
}

export function saveExperts(experts: Expert[]) {
  localStorage.setItem('experts_approuves', JSON.stringify(experts));
}

export function getDemandes(): DemandeExpert[] {
  const stored = localStorage.getItem('demandes_experts');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }
  return [];
}

export function saveDemandes(demandes: DemandeExpert[]) {
  localStorage.setItem('demandes_experts', JSON.stringify(demandes));
}

export function getAdminSettings(): AdminSettings {
  const stored = localStorage.getItem('admin_settings');
  if (stored) {
    try {
      return { ...DEFAULT_ADMIN_SETTINGS, ...JSON.parse(stored) };
    } catch {
      return DEFAULT_ADMIN_SETTINGS;
    }
  }
  return DEFAULT_ADMIN_SETTINGS;
}

export function saveAdminSettings(settings: AdminSettings) {
  localStorage.setItem('admin_settings', JSON.stringify(settings));
}

export function getAnnonce(): string {
  return localStorage.getItem('annonce_admin') || getAdminSettings().annonce;
}

export function getAppVersion(): string {
  return localStorage.getItem('app_version') || '1.0.0';
}

export function generateExpertCode(): string {
  const timestamp = Date.now().toString().slice(-4);
  return `MM-${timestamp}`;
}
