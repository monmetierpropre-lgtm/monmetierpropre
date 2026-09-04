export interface Expert {
  id: string;
  nom: string;
  pays: string;
  whatsapp: string;
  ville: string;
  fonction: string;
  adresse: string;
  bio: string;
  photo?: string;
  status: 'pending' | 'approved' | 'rejected';
  travaux: string[];
  prixJour?: string;
  code?: string;
  isDefault?: boolean;
  createdAt: number;
}

export interface DemandeExpert {
  id: string;
  nom: string;
  pays: string;
  whatsapp: string;
  ville: string;
  fonction: string;
  adresse: string;
  bio: string;
  cvName?: string;
  cvData?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: number;
}

export interface AgendaEvent {
  id: string;
  date: string;
  titre: string;
  description: string;
  createdAt: number;
}

export interface AdminSettings {
  annonce: string;
  themeColor: string;
  pin: string;
}
