import { useState, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Download, FileText, Edit3, Lock, Image as ImageIcon,
  X, Upload, FileImage, Home, Wrench, Mail, CreditCard, Church,
  User, CheckCircle, Crown, Sparkles, Phone, MapPin, Briefcase, GraduationCap, Award,
  Plus, Trash2, Globe, Linkedin, Palette, Type, Eye, Loader2,
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { usePricing } from '@/lib/hooks';
import type { FilePricing } from '@/lib/supabase';
import { showToast } from '@/lib/toast';

/* ============================================================
   TYPES
   ============================================================ */
type Category =
  | 'all' | 'cv-standard' | 'cv-pro' | 'lettres' | 'cartes' | 'affiches';

type LayoutType = 'cv-standard' | 'cv-pro' | 'cv-docx' | 'letter' | 'card' | 'poster';

interface FieldDef {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'image' | 'tags';
  placeholder?: string;
  section?: string;
}

interface Template {
  id: string;
  title: string;
  category: Exclude<Category, 'all'>;
  editable: boolean;
  isPro?: boolean;
  isFree?: boolean;
  badgeColor?: string;
  badgeText?: string;
  preview: React.ReactNode;
  content?: TemplateContent;
}

interface TemplateContent {
  fields: FieldDef[];
  layout: LayoutType;
  defaults: Record<string, string>;
  theme?: { bg: string; accent: string; text: string; sidebar?: string };
}

/* ============================================================
   FIELD DEFINITIONS
   ============================================================ */
const cvStandardFields: FieldDef[] = [
  { key: 'nom', label: 'Nom complet', type: 'text', placeholder: 'Jean Mukendi', section: 'Identité' },
  { key: 'fonction', label: 'Fonction', type: 'text', placeholder: 'Plombier Professionnel', section: 'Identité' },
  { key: 'phone', label: 'Téléphone', type: 'text', placeholder: '+243 813 971 187', section: 'Contact' },
  { key: 'email', label: 'Email', type: 'text', placeholder: 'jean@email.com', section: 'Contact' },
  { key: 'adresse', label: 'Adresse', type: 'text', placeholder: 'Lubumbashi, RDC', section: 'Contact' },
  { key: 'photo', label: 'Photo', type: 'image', section: 'Contact' },
  { key: 'profil', label: 'Profil professionnel', type: 'textarea', placeholder: 'Professionnel avec 5 ans d\'expérience...', section: 'Profil' },
  { key: 'experience', label: 'Expériences', type: 'textarea', placeholder: '2022-2024: Chef de Chantier chez BTP Congo\n2020-2022: Assistant chez Construction Plus', section: 'Parcours' },
  { key: 'formation', label: 'Formation & Diplômes', type: 'textarea', placeholder: '2020: Licence en Génie Civil, UNILU\n2017: Baccalauréat Scientifique', section: 'Parcours' },
  { key: 'competences', label: 'Compétences', type: 'tags', placeholder: 'AutoCAD, MS Project, Management', section: 'Parcours' },
  { key: 'langues', label: 'Langues', type: 'text', placeholder: 'Français, Swahili, Anglais', section: 'Parcours' },
];

const cvProFields: FieldDef[] = [
  { key: 'nom', label: 'Nom complet', type: 'text', placeholder: 'Grace Kalala', section: 'Identité' },
  { key: 'fonction', label: 'Fonction', type: 'text', placeholder: 'Électricienne Professionnelle', section: 'Identité' },
  { key: 'phone', label: 'Téléphone', type: 'text', placeholder: '+243 813 971 187', section: 'Contact' },
  { key: 'email', label: 'Email', type: 'text', placeholder: 'grace@email.com', section: 'Contact' },
  { key: 'adresse', label: 'Adresse', type: 'text', placeholder: 'Lubumbashi, RDC', section: 'Contact' },
  { key: 'linkedin', label: 'LinkedIn', type: 'text', placeholder: 'linkedin.com/in/grace', section: 'Contact' },
  { key: 'photo', label: 'Photo', type: 'image', section: 'Contact' },
  { key: 'profil', label: 'Profil professionnel', type: 'textarea', placeholder: 'Professionnelle certifiée...', section: 'Profil' },
  { key: 'experience', label: 'Expériences', type: 'textarea', placeholder: '2021-2024: Électricienne chez...\n2019-2021: Stage chez...', section: 'Parcours' },
  { key: 'formation', label: 'Formation & Diplômes', type: 'textarea', placeholder: '2021: Licence en électrotechnique...', section: 'Parcours' },
  { key: 'competences', label: 'Compétences', type: 'tags', placeholder: 'Installation, Dépannage, Diagnostic', section: 'Parcours' },
  { key: 'langues', label: 'Langues', type: 'text', placeholder: 'Français, Swahili, Anglais', section: 'Parcours' },
  { key: 'certifications', label: 'Certifications', type: 'textarea', placeholder: 'Certificat en sécurité électrique...', section: 'Parcours' },
];

const cvDocxFields: FieldDef[] = [
  { key: 'prenom', label: 'Prénom', type: 'text', placeholder: 'Augustin', section: 'Identité' },
  { key: 'nom', label: 'NOM', type: 'text', placeholder: 'MULENDA', section: 'Identité' },
  { key: 'titrePro', label: 'Titre Professionnel', type: 'text', placeholder: 'Technicien en Génie Civil', section: 'Identité' },
  { key: 'phone', label: 'Téléphone', type: 'text', placeholder: '+243 813 971 187', section: 'Contact' },
  { key: 'adresse', label: 'Adresse (Ville, Pays)', type: 'text', placeholder: 'Lubumbashi, RDC', section: 'Contact' },
  { key: 'email', label: 'Email', type: 'text', placeholder: 'augustin@email.com', section: 'Contact' },
  { key: 'linkedin', label: 'LinkedIn', type: 'text', placeholder: 'linkedin.com/in/augustin', section: 'Contact' },
  { key: 'profil', label: 'Profil Professionnel', type: 'textarea', placeholder: 'Professionnel avec 5 ans d\'expérience...', section: 'Profil' },
  { key: 'exp1Poste', label: 'Exp.1 - Poste', type: 'text', placeholder: 'Chef de Chantier', section: 'Expérience 1' },
  { key: 'exp1Entreprise', label: 'Exp.1 - Entreprise', type: 'text', placeholder: 'BTP Congo SARL', section: 'Expérience 1' },
  { key: 'exp1Ville', label: 'Exp.1 - Ville', type: 'text', placeholder: 'Lubumbashi', section: 'Expérience 1' },
  { key: 'exp1Dates', label: 'Exp.1 - Dates', type: 'text', placeholder: '2022-2024', section: 'Expérience 1' },
  { key: 'exp1Missions', label: 'Exp.1 - Missions', type: 'textarea', placeholder: 'Gestion d\'équipe de 15 ouvriers\nSuivi des délais et budget', section: 'Expérience 1' },
  { key: 'exp2Poste', label: 'Exp.2 - Poste', type: 'text', placeholder: 'Assistant Chef de Chantier', section: 'Expérience 2' },
  { key: 'exp2Entreprise', label: 'Exp.2 - Entreprise', type: 'text', placeholder: 'Construction Plus', section: 'Expérience 2' },
  { key: 'exp2Ville', label: 'Exp.2 - Ville', type: 'text', placeholder: 'Likasi', section: 'Expérience 2' },
  { key: 'exp2Dates', label: 'Exp.2 - Dates', type: 'text', placeholder: '2020-2022', section: 'Expérience 2' },
  { key: 'exp2Missions', label: 'Exp.2 - Missions', type: 'textarea', placeholder: 'Assistant à la planification\nContrôle qualité des matériaux', section: 'Expérience 2' },
  { key: 'dip1', label: 'Diplôme 1', type: 'text', placeholder: 'Licence en Génie Civil, UNILU, 2020', section: 'Formation' },
  { key: 'dip2', label: 'Diplôme 2', type: 'text', placeholder: 'Baccalauréat Scientifique, 2017', section: 'Formation' },
  { key: 'competences', label: 'Compétences (séparées par virgules)', type: 'tags', placeholder: 'AutoCAD, MS Project, Management', section: 'Compétences' },
  { key: 'langues', label: 'Langues', type: 'text', placeholder: 'Français (Courant), Swahili (Bilingue), Anglais (Intermédiaire)', section: 'Compétences' },
];

const letterFields: FieldDef[] = [
  { key: 'expediteur', label: 'Votre nom', type: 'text', placeholder: 'Jean Mukendi', section: 'Expéditeur' },
  { key: 'adresseExp', label: 'Votre adresse', type: 'text', placeholder: 'Lubumbashi, RDC', section: 'Expéditeur' },
  { key: 'phone', label: 'Téléphone', type: 'text', placeholder: '+243 813 971 187', section: 'Expéditeur' },
  { key: 'email', label: 'Email', type: 'text', placeholder: 'jean@email.com', section: 'Expéditeur' },
  { key: 'destinataire', label: 'Destinataire', type: 'text', placeholder: 'Direction RH, Entreprise X', section: 'Destinataire' },
  { key: 'adresseDest', label: 'Adresse destinataire', type: 'text', placeholder: 'Kinshasa, RDC', section: 'Destinataire' },
  { key: 'objet', label: 'Objet', type: 'text', placeholder: 'Candidature au poste de...', section: 'Contenu' },
  { key: 'corps', label: 'Corps de la lettre', type: 'textarea', placeholder: 'Madame, Monsieur,\n\nJe vous adresse ma candidature...', section: 'Contenu' },
];

const cardFields: FieldDef[] = [
  { key: 'nom', label: 'Nom', type: 'text', placeholder: 'Jean Mukendi', section: 'Identité' },
  { key: 'fonction', label: 'Fonction', type: 'text', placeholder: 'Plombier Professionnel', section: 'Identité' },
  { key: 'phone', label: 'Téléphone', type: 'text', placeholder: '+243 813 971 187', section: 'Contact' },
  { key: 'email', label: 'Email', type: 'text', placeholder: 'jean@email.com', section: 'Contact' },
  { key: 'adresse', label: 'Adresse', type: 'text', placeholder: 'Lubumbashi, RDC', section: 'Contact' },
  { key: 'logo', label: 'Logo / Photo', type: 'image', section: 'Contact' },
];

const posterFields: FieldDef[] = [
  { key: 'titre', label: 'Titre', type: 'text', placeholder: 'CROISADE DE PRIÈRE', section: 'Contenu' },
  { key: 'soustitre', label: 'Sous-titre', type: 'text', placeholder: 'Thème: La Puissance de la Foi', section: 'Contenu' },
  { key: 'date', label: 'Date', type: 'text', placeholder: '15 Septembre 2024', section: 'Détails' },
  { key: 'heure', label: 'Heure', type: 'text', placeholder: '19h00', section: 'Détails' },
  { key: 'lieu', label: 'Lieu', type: 'text', placeholder: 'Temple Central, Lubumbashi', section: 'Détails' },
  { key: 'contact', label: 'Contact', type: 'text', placeholder: '+243 813 971 187', section: 'Détails' },
];

/* ============================================================
   TEMPLATES
   ============================================================ */
const cvTemplates: Template[] = [
  {
    id: 'cv-simple-docx',
    title: 'CV Simple Docx - Modèle Officiel',
    category: 'cv-standard',
    editable: true,
    isFree: true,
    badgeColor: 'bg-green-500',
    badgeText: 'GRATUIT',
    preview: <CvDocxPreview />,
    content: {
      layout: 'cv-docx',
      fields: cvDocxFields,
      defaults: { prenom: 'Prénom', nom: 'NOM', titrePro: 'Titre Professionnel', phone: '+243...', email: 'email@exemple.com', adresse: 'Ville, Pays' },
      theme: { bg: '#ffffff', accent: '#0B2E8C', text: '#1a1a1a' },
    },
  },
  {
    id: 'cv-standard-gratuit',
    title: 'CV Standard',
    category: 'cv-standard',
    editable: true,
    isFree: true,
    badgeColor: 'bg-green-500',
    badgeText: 'GRATUIT',
    preview: <CvPreview variant="standard" />,
    content: {
      layout: 'cv-standard',
      fields: cvStandardFields,
      defaults: { nom: 'Votre Nom', fonction: 'Votre Fonction', phone: '+243...', email: 'email@exemple.com', adresse: 'Ville, Pays' },
      theme: { bg: '#ffffff', accent: '#0B2E8C', text: '#1a1a1a' },
    },
  },
  {
    id: 'cv-pro-bleu',
    title: 'CV Pro Bleu',
    category: 'cv-pro',
    editable: true,
    isPro: true,
    badgeColor: 'bg-blue-600',
    badgeText: 'PRO',
    preview: <CvPreview variant="pro-bleu" />,
    content: {
      layout: 'cv-pro',
      fields: cvProFields,
      defaults: { nom: 'Votre Nom', fonction: 'Votre Fonction', phone: '+243...', email: 'email@exemple.com', adresse: 'Ville, Pays' },
      theme: { bg: '#ffffff', accent: '#0B2E8C', text: '#1a1a1a', sidebar: '#0B2E8C' },
    },
  },
  {
    id: 'cv-pro-orange',
    title: 'CV Pro Orange',
    category: 'cv-pro',
    editable: true,
    isPro: true,
    badgeColor: 'bg-orange-500',
    badgeText: 'PRO',
    preview: <CvPreview variant="pro-orange" />,
    content: {
      layout: 'cv-pro',
      fields: cvProFields,
      defaults: { nom: 'Votre Nom', fonction: 'Votre Fonction', phone: '+243...', email: 'email@exemple.com', adresse: 'Ville, Pays' },
      theme: { bg: '#ffffff', accent: '#F97316', text: '#1a1a1a', sidebar: '#1E345D' },
    },
  },
  {
    id: 'cv-pro-elegance',
    title: 'CV Pro Élégance',
    category: 'cv-pro',
    editable: true,
    isPro: true,
    badgeColor: 'bg-gray-700',
    badgeText: 'PRO',
    preview: <CvPreview variant="pro-elegance" />,
    content: {
      layout: 'cv-pro',
      fields: cvProFields,
      defaults: { nom: 'Votre Nom', fonction: 'Votre Fonction', phone: '+243...', email: 'email@exemple.com', adresse: 'Ville, Pays' },
      theme: { bg: '#ffffff', accent: '#D4A574', text: '#1a1a1a', sidebar: '#1E345D' },
    },
  },
  {
    id: 'cv-pro-minimaliste',
    title: 'CV Pro Minimaliste',
    category: 'cv-pro',
    editable: true,
    isPro: true,
    badgeColor: 'bg-teal-600',
    badgeText: 'PRO',
    preview: <CvPreview variant="pro-minimaliste" />,
    content: {
      layout: 'cv-pro',
      fields: cvProFields,
      defaults: { nom: 'Votre Nom', fonction: 'Votre Fonction', phone: '+243...', email: 'email@exemple.com', adresse: 'Ville, Pays' },
      theme: { bg: '#ffffff', accent: '#0D9488', text: '#1a1a1a' },
    },
  },
];

const lettreTemplates: Template[] = [
  {
    id: 'lettre-classique', title: 'Lettre Classique', category: 'lettres', editable: true, isFree: true,
    badgeColor: 'bg-green-500', badgeText: 'GRATUIT',
    preview: <LettrePreview variant="classique" />,
    content: { layout: 'letter', fields: letterFields, defaults: {}, theme: { bg: '#ffffff', accent: '#0B2E8C', text: '#1a1a1a' } },
  },
  {
    id: 'lettre-moderne', title: 'Lettre Moderne', category: 'lettres', editable: true, isPro: true,
    badgeColor: 'bg-orange-500', badgeText: 'PRO',
    preview: <LettrePreview variant="moderne" />,
    content: { layout: 'letter', fields: letterFields, defaults: {}, theme: { bg: '#ffffff', accent: '#F97316', text: '#1a1a1a' } },
  },
  {
    id: 'lettre-elegante', title: 'Lettre Élégante', category: 'lettres', editable: true, isPro: true,
    badgeColor: 'bg-gray-700', badgeText: 'PRO',
    preview: <LettrePreview variant="elegante" />,
    content: { layout: 'letter', fields: letterFields, defaults: {}, theme: { bg: '#ffffff', accent: '#374151', text: '#1a1a1a' } },
  },
];

const carteTemplates: Template[] = [
  {
    id: 'carte-plombier', title: 'Carte Plombier', category: 'cartes', editable: true, isFree: true,
    badgeColor: 'bg-green-500', badgeText: 'GRATUIT',
    preview: <CartePreview variant="plombier" />,
    content: { layout: 'card', fields: cardFields, defaults: { fonction: 'Plombier Professionnel' }, theme: { bg: '#0B2E8C', accent: '#60A5FA', text: '#ffffff' } },
  },
  {
    id: 'carte-electricien', title: 'Carte Électricien', category: 'cartes', editable: true, isPro: true,
    badgeColor: 'bg-orange-500', badgeText: 'PRO',
    preview: <CartePreview variant="electricien" />,
    content: { layout: 'card', fields: cardFields, defaults: { fonction: 'Électricien Professionnel' }, theme: { bg: '#F97316', accent: '#FED7AA', text: '#ffffff' } },
  },
  {
    id: 'carte-carreleur', title: 'Carte Carreleur', category: 'cartes', editable: true, isPro: true,
    badgeColor: 'bg-green-600', badgeText: 'PRO',
    preview: <CartePreview variant="carreleur" />,
    content: { layout: 'card', fields: cardFields, defaults: { fonction: 'Carreleur Professionnel' }, theme: { bg: '#16A34A', accent: '#BBF7D0', text: '#ffffff' } },
  },
  {
    id: 'carte-macon', title: 'Carte Maçon', category: 'cartes', editable: true, isPro: true,
    badgeColor: 'bg-gray-700', badgeText: 'PRO',
    preview: <CartePreview variant="macon" />,
    content: { layout: 'card', fields: cardFields, defaults: { fonction: 'Maçon Professionnel' }, theme: { bg: '#374151', accent: '#D1D5DB', text: '#ffffff' } },
  },
];

const afficheTemplates: Template[] = [
  {
    id: 'affiche-croisade', title: 'Affiche Croisade', category: 'affiches', editable: true, isFree: true,
    badgeColor: 'bg-green-500', badgeText: 'GRATUIT',
    preview: <AffichePreview variant="croisade" />,
    content: { layout: 'poster', fields: posterFields, defaults: { titre: 'CROISADE DE PRIÈRE' }, theme: { bg: '#1E345D', accent: '#F97316', text: '#ffffff' } },
  },
  {
    id: 'affiche-culte', title: 'Affiche Culte', category: 'affiches', editable: true, isPro: true,
    badgeColor: 'bg-blue-500', badgeText: 'PRO',
    preview: <AffichePreview variant="culte" />,
    content: { layout: 'poster', fields: posterFields, defaults: { titre: 'CULTE D\'ACTION DE GRÂCE' }, theme: { bg: '#0B2E8C', accent: '#60A5FA', text: '#ffffff' } },
  },
  {
    id: 'affiche-jeunesse', title: 'Affiche Jeunesse', category: 'affiches', editable: true, isPro: true,
    badgeColor: 'bg-orange-500', badgeText: 'PRO',
    preview: <AffichePreview variant="jeunesse" />,
    content: { layout: 'poster', fields: posterFields, defaults: { titre: 'CONGRÈS DE LA JEUNESSE' }, theme: { bg: '#F97316', accent: '#FED7AA', text: '#ffffff' } },
  },
  {
    id: 'affiche-mariage', title: 'Affiche Mariage', category: 'affiches', editable: true, isPro: true,
    badgeColor: 'bg-pink-500', badgeText: 'PRO',
    preview: <AffichePreview variant="mariage" />,
    content: { layout: 'poster', fields: posterFields, defaults: { titre: 'CÉLÉBRATION DE MARIAGE' }, theme: { bg: '#EC4899', accent: '#FCE7F3', text: '#ffffff' } },
  },
];

const allTemplates: Template[] = [
  ...cvTemplates, ...lettreTemplates, ...carteTemplates, ...afficheTemplates,
];

/* ============================================================
   PREVIEW COMPONENTS (Mini thumbnails for grid)
   ============================================================ */
function CvPreview({ variant }: { variant: string }) {
  const themes: Record<string, { accent: string; sidebar?: string; bg: string }> = {
    standard: { accent: '#0B2E8C', bg: '#fff' },
    'pro-bleu': { accent: '#0B2E8C', sidebar: '#0B2E8C', bg: '#fff' },
    'pro-orange': { accent: '#F97316', sidebar: '#1E345D', bg: '#fff' },
    'pro-elegance': { accent: '#D4A574', sidebar: '#1E345D', bg: '#fff' },
    'pro-minimaliste': { accent: '#0D9488', bg: '#fff' },
  };
  const t = themes[variant] || themes.standard;
  const hasSidebar = !!t.sidebar;

  return (
    <div className="w-full aspect-[210/297] bg-white rounded-lg overflow-hidden flex shadow-sm">
      {hasSidebar && (
        <div className="w-1/3 h-full" style={{ background: t.sidebar }}>
          <div className="p-2 flex flex-col items-center gap-1.5">
            <div className="w-10 h-10 rounded-full bg-white/30 mt-2" />
            <div className="h-1 w-10 bg-white/40 rounded mt-1" />
            <div className="h-1 w-8 bg-white/30 rounded" />
            <div className="h-1 w-9 bg-white/30 rounded" />
          </div>
        </div>
      )}
      <div className="flex-1 p-2.5 flex flex-col gap-1">
        <div className="h-2.5 w-20 rounded" style={{ background: t.accent }} />
        <div className="h-1.5 w-16 bg-gray-300 rounded" />
        <div className="h-px w-full bg-gray-200 my-1" />
        <div className="h-1 w-14 rounded" style={{ background: t.accent }} />
        <div className="h-1 w-full bg-gray-200 rounded" />
        <div className="h-1 w-4/5 bg-gray-200 rounded" />
        <div className="h-1 w-3/5 bg-gray-200 rounded" />
        <div className="h-1 w-14 rounded mt-1" style={{ background: t.accent }} />
        <div className="h-1 w-full bg-gray-200 rounded" />
        <div className="h-1 w-4/5 bg-gray-200 rounded" />
        <div className="h-1 w-3/5 bg-gray-200 rounded" />
        <div className="h-1 w-14 rounded mt-1" style={{ background: t.accent }} />
        <div className="h-1 w-full bg-gray-200 rounded" />
        <div className="h-1 w-2/3 bg-gray-200 rounded" />
      </div>
    </div>
  );
}

function CvDocxPreview() {
  return (
    <div className="w-full aspect-[210/297] bg-white rounded-lg overflow-hidden shadow-sm p-3 flex flex-col gap-1">
      <div className="text-center">
        <div className="h-2 w-24 bg-gray-800 rounded mx-auto" />
        <div className="h-2 w-32 bg-gray-700 rounded mx-auto mt-1" />
        <div className="h-px w-full bg-gray-300 mt-1.5" />
        <div className="flex justify-center gap-2 mt-1">
          <div className="h-1 w-10 bg-gray-300 rounded" />
          <div className="h-1 w-12 bg-gray-300 rounded" />
          <div className="h-1 w-10 bg-gray-300 rounded" />
        </div>
      </div>
      <div className="h-1.5 w-16 rounded mt-2" style={{ background: '#0B2E8C' }} />
      <div className="h-1 w-full bg-gray-200 rounded" />
      <div className="h-1 w-4/5 bg-gray-200 rounded" />
      <div className="h-1 w-3/5 bg-gray-200 rounded" />
      <div className="h-1.5 w-14 rounded mt-1" style={{ background: '#0B2E8C' }} />
      <div className="h-1 w-full bg-gray-200 rounded" />
      <div className="h-1 w-2/3 bg-gray-200 rounded" />
      <div className="h-1.5 w-14 rounded mt-1" style={{ background: '#0B2E8C' }} />
      <div className="h-1 w-full bg-gray-200 rounded" />
      <div className="h-1 w-3/4 bg-gray-200 rounded" />
    </div>
  );
}

function LettrePreview({ variant }: { variant: string }) {
  const accents: Record<string, string> = {
    classique: '#0B2E8C', moderne: '#F97316', elegante: '#374151',
  };
  const accent = accents[variant] || '#0B2E8C';
  return (
    <div className="w-full aspect-[210/297] bg-white rounded-lg overflow-hidden p-3 shadow-sm flex flex-col gap-1">
      <div className="h-1.5 w-16 rounded" style={{ background: accent }} />
      <div className="h-1 w-20 bg-gray-300 rounded mt-1" />
      <div className="h-1 w-14 bg-gray-300 rounded" />
      <div className="h-px w-full bg-gray-200 my-1" />
      <div className="h-1 w-12 rounded" style={{ background: accent }} />
      <div className="h-1 w-20 bg-gray-200 rounded" />
      <div className="h-1 w-full bg-gray-200 rounded" />
      <div className="h-1 w-full bg-gray-200 rounded" />
      <div className="h-1 w-4/5 bg-gray-200 rounded" />
      <div className="h-1 w-full bg-gray-200 rounded" />
      <div className="h-1 w-3/5 bg-gray-200 rounded" />
      <div className="h-1 w-full bg-gray-200 rounded" />
      <div className="h-1 w-4/5 bg-gray-200 rounded" />
    </div>
  );
}

function CartePreview({ variant }: { variant: string }) {
  const themes: Record<string, { bg: string; accent: string; text: string }> = {
    plombier: { bg: '#0B2E8C', accent: '#60A5FA', text: '#fff' },
    electricien: { bg: '#F97316', accent: '#FED7AA', text: '#fff' },
    carreleur: { bg: '#16A34A', accent: '#BBF7D0', text: '#fff' },
    macon: { bg: '#374151', accent: '#D1D5DB', text: '#fff' },
  };
  const t = themes[variant] || themes.plombier;
  return (
    <div className="w-full aspect-[85/55] rounded-lg overflow-hidden shadow-sm flex" style={{ background: t.bg, color: t.text }}>
      <div className="w-2/3 p-2 flex flex-col justify-center gap-0.5">
        <div className="h-1.5 w-12 rounded" style={{ background: t.accent }} />
        <div className="h-1 w-16 bg-white/40 rounded mt-0.5" />
        <div className="h-1 w-14 bg-white/30 rounded" />
        <div className="h-1 w-10 bg-white/30 rounded" />
      </div>
      <div className="w-1/3 p-1.5 flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2" style={{ borderColor: t.accent }} />
      </div>
    </div>
  );
}

function AffichePreview({ variant }: { variant: string }) {
  const themes: Record<string, { bg: string; accent: string }> = {
    croisade: { bg: '#1E345D', accent: '#F97316' },
    culte: { bg: '#0B2E8C', accent: '#60A5FA' },
    jeunesse: { bg: '#F97316', accent: '#FED7AA' },
    mariage: { bg: '#EC4899', accent: '#FCE7F3' },
  };
  const t = themes[variant] || themes.croisade;
  return (
    <div className="w-full aspect-[210/297] rounded-lg overflow-hidden shadow-sm flex flex-col items-center justify-center p-3" style={{ background: t.bg }}>
      <div className="h-2 w-16 rounded mb-2" style={{ background: t.accent }} />
      <div className="h-2.5 w-20 bg-white/60 rounded mb-1" />
      <div className="h-2.5 w-14 bg-white/40 rounded" />
      <div className="h-px w-12 my-2" style={{ background: t.accent }} />
      <div className="h-1.5 w-16 bg-white/30 rounded mb-1" />
      <div className="h-1.5 w-12 bg-white/30 rounded" />
      <div className="h-1.5 w-14 bg-white/30 rounded mt-2" />
    </div>
  );
}

/* ============================================================
   FILTERS
   ============================================================ */
const filters: { id: Category; label: string; icon: typeof FileText }[] = [
  { id: 'all', label: 'Tous', icon: Sparkles },
  { id: 'cv-standard', label: 'CV Standard', icon: User },
  { id: 'cv-pro', label: 'CV Pro', icon: Crown },
  { id: 'lettres', label: 'Lettres', icon: Mail },
  { id: 'cartes', label: 'Cartes Visite', icon: CreditCard },
  { id: 'affiches', label: 'Affiches', icon: Church },
];

/* ============================================================
   MAIN COMPONENT
   ============================================================ */
export default function Designs() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<Category>('all');
  const [editing, setEditing] = useState<Template | null>(null);
  const [payingFor, setPayingFor] = useState<Template | null>(null);
  const { pricing } = usePricing();

  const filtered = activeFilter === 'all'
    ? allTemplates
    : allTemplates.filter((t) => t.category === activeFilter);

  const getPricing = (template: Template): FilePricing | undefined => pricing[template.id];

  const handleEdit = (template: Template) => {
    const p = getPricing(template);
    if (p?.is_paid) {
      setPayingFor(template);
      return;
    }
    setEditing(template);
  };

  const handlePaidSuccess = () => {
    if (!payingFor) return;
    const template = payingFor;
    setPayingFor(null);
    if (template.editable) {
      setEditing(template);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B2E8C] text-white pb-24">
      <header className="sticky top-0 z-40 bg-[#0B2E8C] border-b border-white/10">
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={() => navigate('/')} className="p-2 rounded-xl hover:bg-white/10 transition-colors">
            <ArrowLeft size={22} />
          </button>
          <h1 className="text-xl font-black">Designs</h1>
        </div>
      </header>

      <div className="px-4 py-4 max-w-md mx-auto">
        {/* Bandeau */}
        <div className="bg-gradient-to-r from-[#F97316] to-orange-600 rounded-2xl p-4 mb-4 text-center shadow-lg">
          <p className="text-lg font-black">Générateur de Documents</p>
          <p className="text-sm text-white/90 mt-1">Modifiez et exportez en PDF ou PNG</p>
        </div>

        {/* Filtres */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 mb-4 -mx-4 px-4">
          {filters.map((filter) => {
            const Icon = filter.icon;
            return (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                  activeFilter === filter.id
                    ? 'bg-[#F97316] text-white shadow-lg scale-105'
                    : 'bg-white/10 text-white/70 hover:bg-white/15'
                }`}
              >
                <Icon size={15} />
                {filter.label}
              </button>
            );
          })}
        </div>

        {/* Templates grid */}
        <div className="grid grid-cols-2 gap-3">
          {filtered.map((template) => (
            <div key={template.id} className="bg-white/10 rounded-2xl overflow-hidden shadow-lg group transition-all hover:bg-white/15">
              <div className="relative p-2.5 bg-white/5">
                {template.preview}
                <span className={`absolute top-3 right-3 ${template.badgeColor || 'bg-gray-500'} text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-md`}>
                  {template.badgeText || ''}
                </span>
              </div>
              <div className="p-3">
                <h3 className="font-bold text-sm text-white truncate">{template.title}</h3>
                <div className="flex items-center gap-1 mt-0.5">
                  {template.isFree && (
                    <span className="text-[10px] text-green-400 font-semibold flex items-center gap-0.5">
                      <CheckCircle size={11} /> Gratuit
                    </span>
                  )}
                  {template.isPro && (
                    <span className="text-[10px] text-orange-400 font-semibold flex items-center gap-0.5">
                      <Lock size={10} /> Pro
                    </span>
                  )}
                </div>
                <div className="mt-2.5">
                  {template.editable && (
                    <button
                      onClick={() => handleEdit(template)}
                      style={getPricing(template)?.btn_color ? { backgroundColor: getPricing(template)!.btn_color! } : undefined}
                      className="w-full text-white text-xs font-bold rounded-xl py-2 flex items-center justify-center gap-1 active:scale-95 transition-transform bg-[#F97316]"
                    >
                      <Edit3 size={13} />
                      {getPricing(template)?.is_paid ? 'Débloquer & Modifier' : (getPricing(template)?.btn_label || 'Modifier')}
                    </button>
                  )}
                </div>
                {getPricing(template)?.is_paid && (
                  <div className="mt-1 text-center">
                    <span className="text-[10px] text-orange-400 font-bold">
                      Payant: {getPricing(template)?.price}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {editing && editing.content && (
        <EditorModal template={editing} onClose={() => setEditing(null)} />
      )}

      {payingFor && (
        <PaymentModal
          template={payingFor}
          pricing={getPricing(payingFor)}
          onClose={() => setPayingFor(null)}
          onSuccess={handlePaidSuccess}
        />
      )}
    </div>
  );
}

/* ============================================================
   PAYMENT MODAL
   ============================================================ */
function PaymentModal({
  template, pricing, onClose, onSuccess,
}: {
  template: Template;
  pricing: FilePricing | undefined;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [paid, setPaid] = useState(false);
  const [showCode, setShowCode] = useState(false);

  const handlePay = () => {
    setShowCode(true);
    if (pricing?.payment_code) {
      try {
        const w = window.open('', '_blank');
        if (w) {
          w.document.write(pricing.payment_code);
          w.document.close();
        }
      } catch { /* ignore */ }
    }
  };

  const confirmPaid = () => {
    setPaid(true);
    setTimeout(onSuccess, 800);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/70 flex items-end sm:items-center justify-center animate-[fadeIn_0.2s_ease-out]" onClick={onClose}>
      <div className="bg-[#0B2E8C] w-full max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden border border-white/20 animate-[scaleIn_0.3s_ease-out]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <h2 className="font-black text-lg flex items-center gap-2">
            <CreditCard size={18} className="text-[#F97316]" />
            Débloquer le fichier
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10">
            <X size={20} />
          </button>
        </div>
        <div className="px-4 py-6 space-y-4">
          {paid ? (
            <div className="text-center space-y-3">
              <CheckCircle size={48} className="mx-auto text-green-500" />
              <p className="font-bold text-lg text-green-400">Paiement réussi!</p>
              <p className="text-sm text-white/70">Ouverture de l'éditeur...</p>
            </div>
          ) : (
            <>
              <div className="bg-white/10 rounded-2xl p-4 text-center">
                <p className="text-sm text-white/70">Fichier</p>
                <p className="font-bold text-lg">{template.title}</p>
                <p className="text-2xl font-black text-[#F97316] mt-2">{pricing?.price || 'Payant'}</p>
              </div>
              {!showCode ? (
                <button onClick={handlePay} className="w-full bg-[#F97316] text-white font-bold rounded-2xl py-3.5 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform">
                  <CreditCard size={20} />
                  Payer {pricing?.price || ''}
                </button>
              ) : (
                <>
                  <div className="bg-white/5 rounded-2xl p-3 text-center">
                    <p className="text-xs text-white/60 mb-1">Page de paiement ouverte</p>
                    <p className="text-xs text-white/50">Effectuez le paiement, puis confirmez ci-dessous</p>
                  </div>
                  <button onClick={confirmPaid} className="w-full bg-green-600 text-white font-bold rounded-2xl py-3.5 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform">
                    <CheckCircle size={20} />
                    J'ai payé - Continuer
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   EDITOR MODAL - Split screen with form + live preview
   ============================================================ */
function EditorModal({ template, onClose }: { template: Template; onClose: () => void }) {
  const [values, setValues] = useState<Record<string, string>>(() => {
    const defaults: Record<string, string> = {};
    template.content?.fields.forEach((f) => {
      defaults[f.key] = template.content?.defaults[f.key] || '';
    });
    return defaults;
  });
  const previewRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [downloading, setDownloading] = useState(false);

  const updateValue = (key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      showToast('Image trop volumineuse (max 2MB)', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => updateValue(fileRef.current?.dataset.field || 'photo', reader.result as string);
    reader.readAsDataURL(file);
  };

  const triggerImageUpload = (fieldKey: string) => {
    if (fileRef.current) {
      fileRef.current.dataset.field = fieldKey;
      fileRef.current?.click();
    }
  };

  const getFileName = () => {
    const raw = values.prenom
      ? `${values.prenom}_${values.nom}`
      : (values.nom || values.titre || values.expediteur || 'MonDocument');
    const nom = raw.trim().replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
    const today = new Date();
    const dateStr = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${today.getFullYear()}`;
    return `${nom}_${dateStr}`;
  };

  const getFilePrefix = () => {
    const layout = template.content?.layout;
    if (layout === 'card') return 'Carte_Visite';
    if (layout === 'letter') return 'Lettre';
    if (layout === 'poster') return 'Affiche';
    return 'CV';
  };

  const triggerBlobDownload = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.rel = 'noopener';
    a.style.display = 'block';
    a.style.position = 'fixed';
    a.style.left = '0';
    a.style.top = '0';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    showToast(`${filename} telecharge`, 'success');
  };

  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  const generateUniqueName = (ext: string) => {
    const t = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const raw = values.prenom
      ? `${values.prenom}_${values.nom}`
      : (values.nom || values.titre || values.expediteur || 'MonDocument');
    const n = raw.trim().replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
    return `${getFilePrefix()}_${n}_${t}.${ext}`;
  };

  const capturePreview = async (): Promise<HTMLCanvasElement> => {
    const el = previewRef.current;
    if (!el) throw new Error('Aperçu introuvable');

    // Clean up orphaned html2canvas canvases from previous captures
    document.querySelectorAll('canvas').forEach((c) => {
      if (c.style.position === 'absolute' && c.style.left === '-9999px') c.remove();
    });

    const scaledParent = el.parentElement;
    const overflowParent = scaledParent?.parentElement;

    let savedTransform = '';
    let savedWidth = '';
    let savedOverflow = '';

    if (scaledParent) {
      savedTransform = scaledParent.style.transform;
      savedWidth = scaledParent.style.width;
      scaledParent.style.transform = 'none';
      scaledParent.style.width = 'auto';
    }
    if (overflowParent) {
      savedOverflow = overflowParent.style.overflow;
      overflowParent.style.overflow = 'visible';
    }

    await new Promise((r) => setTimeout(r, 200));

    const layout = template.content?.layout;
    const isCard = layout === 'card';

    try {
      const canvas = await html2canvas(el, {
        scale: isCard ? 3 : 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        logging: false,
        width: el.scrollWidth,
        height: el.scrollHeight,
        windowWidth: el.scrollWidth,
        windowHeight: el.scrollHeight,
      });
      if (canvas.width === 0 || canvas.height === 0) {
        throw new Error('Canvas vide - l\'aperçu n\'a pas pu etre capture');
      }
      return canvas;
    } finally {
      if (scaledParent) {
        scaledParent.style.transform = savedTransform;
        scaledParent.style.width = savedWidth;
      }
      if (overflowParent) {
        overflowParent.style.overflow = savedOverflow;
      }
    }
  };

  const handleDownloadPDF = useCallback(async () => {
    if (downloading) return;
    setDownloading(true);
    try {
      const canvas = await capturePreview();
      const imgData = canvas.toDataURL('image/jpeg', 0.92);
      const layout = template.content?.layout;
      const isCard = layout === 'card';

      const pdf = new jsPDF({
        orientation: isCard ? 'landscape' : 'portrait',
        unit: 'mm',
        format: isCard ? [90, 55] : 'a4',
      });
      const pdfW = pdf.internal.pageSize.getWidth();
      const pdfH = pdf.internal.pageSize.getHeight();
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfW, pdfH, undefined, 'FAST');

      const nomFichier = generateUniqueName('pdf');
      const pdfBlob = pdf.output('blob');
      const pdfFile = new File([pdfBlob], nomFichier, { type: 'application/pdf' });

      if (navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
        try {
          await navigator.share({ files: [pdfFile], title: nomFichier, text: `Mon document ${nomFichier}` });
          showToast(`${nomFichier} pret a etre partage`, 'success');
        } catch (shareErr) {
          if ((shareErr as Error).name === 'AbortError') {
            triggerBlobDownload(pdfBlob, nomFichier);
          } else {
            throw shareErr;
          }
        }
      } else {
        triggerBlobDownload(pdfBlob, nomFichier);
      }
    } catch (e) {
      const err = e as Error;
      console.error('Erreur PDF:', e);
      if (err.name !== 'AbortError') {
        showToast('Erreur PDF: ' + (err.message || String(e)), 'error');
        alert('Erreur lors de la generation du PDF : ' + (err.message || String(e)));
      }
    } finally {
      setDownloading(false);
    }
  }, [template, downloading, values]);

  const handleDownloadPNG = useCallback(async () => {
    if (downloading) return;
    setDownloading(true);
    try {
      const canvas = await capturePreview();
      const nomFichier = generateUniqueName('png');

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, 'image/png', 1.0)
      );
      if (!blob) throw new Error('Impossible de generer l\'image PNG');
      const pngFile = new File([blob], nomFichier, { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [pngFile] })) {
        try {
          await navigator.share({ files: [pngFile], title: nomFichier, text: `Mon image ${nomFichier}` });
          showToast(`${nomFichier} pret a etre partage`, 'success');
        } catch (shareErr) {
          if ((shareErr as Error).name === 'AbortError') {
            triggerBlobDownload(blob, nomFichier);
          } else {
            throw shareErr;
          }
        }
      } else {
        const dataUrl = canvas.toDataURL('image/png');
        setImagePreviewUrl(dataUrl);
        showToast('Image generee - maintenez appuye pour enregistrer', 'success');
      }
    } catch (e) {
      const err = e as Error;
      console.error('Erreur PNG:', e);
      if (err.name !== 'AbortError') {
        showToast('Erreur PNG: ' + (err.message || String(e)), 'error');
        alert('Erreur lors de la generation du PNG : ' + (err.message || String(e)));
      }
    } finally {
      setDownloading(false);
    }
  }, [template, downloading, values]);

  const inputClass = 'w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-white text-sm placeholder-white/40 focus:outline-none focus:border-[#F97316] transition-colors';

  // Group fields by section
  const groupedFields = useMemo(() => {
    const groups: { section: string; fields: FieldDef[] }[] = [];
    const sectionMap: Record<string, FieldDef[]> = {};
    template.content?.fields.forEach((f) => {
      const sec = f.section || 'Général';
      if (!sectionMap[sec]) sectionMap[sec] = [];
      sectionMap[sec].push(f);
    });
    Object.entries(sectionMap).forEach(([section, fields]) => {
      groups.push({ section, fields });
    });
    return groups;
  }, [template]);

  const renderPreview = () => {
    const theme = template.content?.theme;
    const accent = theme?.accent || '#0B2E8C';
    const bg = theme?.bg || '#ffffff';
    const sidebar = theme?.sidebar;
    const textColor = theme?.text || '#1a1a1a';

    /* --- CV STANDARD --- */
    if (template.content?.layout === 'cv-standard') {
      const competencesList = (values.competences || '').split(',').map(s => s.trim()).filter(Boolean);
      return (
        <div ref={previewRef} className="bg-white mx-auto overflow-hidden shadow-lg" style={{ width: '794px', minHeight: '1123px', color: textColor, fontFamily: 'Inter, sans-serif' }}>
          <div className="p-10">
            <div className="flex items-start gap-6 pb-6 border-b-2" style={{ borderColor: accent }}>
              {values.photo && (
                <img src={values.photo} alt="Photo" className="rounded-full object-cover border-4" style={{ width: '110px', height: '110px', borderColor: accent }} />
              )}
              <div className="flex-1">
                <h1 className="font-black" style={{ fontSize: '30px', color: accent, lineHeight: '1.2' }}>{values.nom || 'Votre Nom'}</h1>
                <p className="font-semibold text-gray-500 mt-1" style={{ fontSize: '15px' }}>{values.fonction || 'Votre Fonction'}</p>
                <div className="flex flex-wrap gap-3 mt-3">
                  {values.phone && (<div className="flex items-center gap-1.5"><Phone size={12} style={{ color: accent }} /><p className="text-[11px] text-gray-600">{values.phone}</p></div>)}
                  {values.email && (<div className="flex items-center gap-1.5"><Mail size={12} style={{ color: accent }} /><p className="text-[11px] text-gray-600">{values.email}</p></div>)}
                  {values.adresse && (<div className="flex items-center gap-1.5"><MapPin size={12} style={{ color: accent }} /><p className="text-[11px] text-gray-600">{values.adresse}</p></div>)}
                </div>
              </div>
            </div>

            {values.profil && (
              <Section title="Profil Professionnel" accent={accent}>
                <p className="text-gray-700" style={{ fontSize: '12px', lineHeight: '1.7' }}>{values.profil}</p>
              </Section>
            )}
            {values.experience && (
              <Section title="Expériences Professionnelles" accent={accent} icon={<Briefcase size={14} />}>
                <p className="text-gray-700 whitespace-pre-wrap" style={{ fontSize: '12px', lineHeight: '1.7' }}>{values.experience}</p>
              </Section>
            )}
            {values.formation && (
              <Section title="Formation & Diplômes" accent={accent} icon={<GraduationCap size={14} />}>
                <p className="text-gray-700 whitespace-pre-wrap" style={{ fontSize: '12px', lineHeight: '1.7' }}>{values.formation}</p>
              </Section>
            )}
            {competencesList.length > 0 && (
              <Section title="Compétences" accent={accent} icon={<Award size={14} />}>
                <div className="flex flex-wrap gap-2">
                  {competencesList.map((c, i) => (
                    <span key={i} className="px-3 py-1 rounded-lg text-[11px] font-semibold" style={{ background: accent + '15', color: accent }}>{c}</span>
                  ))}
                </div>
              </Section>
            )}
            {values.langues && (
              <Section title="Langues" accent={accent} icon={<Globe size={14} />}>
                <p className="text-gray-700" style={{ fontSize: '12px' }}>{values.langues}</p>
              </Section>
            )}
          </div>
        </div>
      );
    }

    /* --- CV PRO (sidebar layout) --- */
    if (template.content?.layout === 'cv-pro') {
      const competencesList = (values.competences || '').split(',').map(s => s.trim()).filter(Boolean);
      return (
        <div ref={previewRef} className="bg-white mx-auto overflow-hidden flex shadow-lg" style={{ width: '794px', minHeight: '1123px', color: textColor, fontFamily: 'Inter, sans-serif' }}>
          <div className="flex flex-col items-center gap-4 p-6" style={{ width: '270px', background: sidebar, color: '#fff' }}>
            {values.photo ? (
              <img src={values.photo} alt="Photo" className="rounded-full object-cover border-4 border-white/20" style={{ width: '130px', height: '130px' }} />
            ) : (
              <div className="rounded-full bg-white/20 flex items-center justify-center border-4 border-white/20" style={{ width: '130px', height: '130px' }}>
                <User size={45} className="text-white/50" />
              </div>
            )}
            <div className="w-full space-y-4">
              <div>
                <p className="text-[11px] font-black tracking-wider mb-2 border-b border-white/20 pb-1">CONTACT</p>
                <div className="space-y-2">
                  {values.phone && (<div className="flex items-center gap-1.5"><Phone size={10} className="opacity-70" /><p className="text-[10px] opacity-80">{values.phone}</p></div>)}
                  {values.email && (<div className="flex items-center gap-1.5"><Mail size={10} className="opacity-70" /><p className="text-[10px] opacity-80">{values.email}</p></div>)}
                  {values.adresse && (<div className="flex items-center gap-1.5"><MapPin size={10} className="opacity-70" /><p className="text-[10px] opacity-80">{values.adresse}</p></div>)}
                  {values.linkedin && (<div className="flex items-center gap-1.5"><Linkedin size={10} className="opacity-70" /><p className="text-[10px] opacity-80">{values.linkedin}</p></div>)}
                </div>
              </div>
              {competencesList.length > 0 && (
                <div>
                  <p className="text-[11px] font-black tracking-wider mb-2 border-b border-white/20 pb-1">COMPÉTENCES</p>
                  <div className="flex flex-wrap gap-1.5">
                    {competencesList.map((c, i) => (
                      <span key={i} className="px-2 py-0.5 rounded text-[9px] font-semibold bg-white/15">{c}</span>
                    ))}
                  </div>
                </div>
              )}
              {values.langues && (
                <div>
                  <p className="text-[11px] font-black tracking-wider mb-2 border-b border-white/20 pb-1">LANGUES</p>
                  <p className="text-[10px] opacity-80">{values.langues}</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 p-8">
            <div className="mb-5 pb-3 border-b-2" style={{ borderColor: accent }}>
              <h1 className="font-black" style={{ fontSize: '28px', color: accent, lineHeight: '1.2' }}>{values.nom || 'Votre Nom'}</h1>
              <p className="font-semibold text-gray-500 mt-0.5" style={{ fontSize: '14px' }}>{values.fonction || 'Votre Fonction'}</p>
            </div>
            {values.profil && (
              <Section title="Profil" accent={accent}>
                <p className="text-gray-700" style={{ fontSize: '11px', lineHeight: '1.7' }}>{values.profil}</p>
              </Section>
            )}
            {values.experience && (
              <Section title="Expériences" accent={accent} icon={<Briefcase size={14} />}>
                <p className="text-gray-700 whitespace-pre-wrap" style={{ fontSize: '11px', lineHeight: '1.7' }}>{values.experience}</p>
              </Section>
            )}
            {values.formation && (
              <Section title="Formation" accent={accent} icon={<GraduationCap size={14} />}>
                <p className="text-gray-700 whitespace-pre-wrap" style={{ fontSize: '11px', lineHeight: '1.7' }}>{values.formation}</p>
              </Section>
            )}
            {values.certifications && (
              <Section title="Certifications" accent={accent} icon={<Award size={14} />}>
                <p className="text-gray-700 whitespace-pre-wrap" style={{ fontSize: '11px', lineHeight: '1.7' }}>{values.certifications}</p>
              </Section>
            )}
          </div>
        </div>
      );
    }

    /* --- CV DOCX (official template) --- */
    if (template.content?.layout === 'cv-docx') {
      const competencesList = (values.competences || '').split(',').map(s => s.trim()).filter(Boolean);
      return (
        <div ref={previewRef} className="bg-white mx-auto overflow-hidden shadow-lg" style={{ width: '794px', minHeight: '1123px', color: '#1a1a1a', fontFamily: 'Inter, sans-serif' }}>
          <div className="p-12">
            <h1 className="font-black text-center" style={{ fontSize: '22px', letterSpacing: '2px', color: '#000' }}>CURRICULUM VITAE</h1>
            <div className="h-0.5 w-full mt-2" style={{ background: '#000' }} />
            <div className="text-center mt-4">
              <p className="font-black" style={{ fontSize: '26px', lineHeight: '1.2' }}>
                {values.prenom || 'Prénom'} <span style={{ textTransform: 'uppercase' }}>{values.nom || 'NOM'}</span>
              </p>
              <p className="text-gray-600 font-semibold mt-1" style={{ fontSize: '13px' }}>{values.titrePro || 'Titre Professionnel'}</p>
            </div>
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-3" style={{ fontSize: '11px', color: '#555' }}>
              {values.phone && <span>{values.phone}</span>}
              {values.adresse && <span>{values.adresse}</span>}
              {values.email && <span>{values.email}</span>}
              {values.linkedin && <span>{values.linkedin}</span>}
            </div>
            <div className="h-px w-full mt-4" style={{ background: '#ddd' }} />

            {values.profil && (
              <div className="mt-5">
                <p className="font-black tracking-wide" style={{ fontSize: '12px', color: '#000', textTransform: 'uppercase' as const }}>Profil Professionnel</p>
                <div className="h-0.5 w-full mt-1" style={{ background: '#000' }} />
                <p className="text-gray-700 mt-2" style={{ fontSize: '11px', lineHeight: '1.7' }}>{values.profil}</p>
              </div>
            )}
            {(values.exp1Poste || values.exp2Poste) && (
              <div className="mt-5">
                <p className="font-black tracking-wide" style={{ fontSize: '12px', color: '#000', textTransform: 'uppercase' as const }}>Expériences</p>
                <div className="h-0.5 w-full mt-1" style={{ background: '#000' }} />
                {values.exp1Poste && (
                  <div className="mt-2">
                    <p className="font-bold" style={{ fontSize: '11px' }}>{values.exp1Poste} | {values.exp1Entreprise} {values.exp1Ville ? `— ${values.exp1Ville}` : ''}</p>
                    <p className="text-gray-500" style={{ fontSize: '10px' }}>{values.exp1Dates}</p>
                    {values.exp1Missions && <p className="text-gray-700 whitespace-pre-wrap mt-1" style={{ fontSize: '11px', lineHeight: '1.6' }}>{values.exp1Missions}</p>}
                  </div>
                )}
                {values.exp2Poste && (
                  <div className="mt-3">
                    <p className="font-bold" style={{ fontSize: '11px' }}>{values.exp2Poste} | {values.exp2Entreprise} {values.exp2Ville ? `— ${values.exp2Ville}` : ''}</p>
                    <p className="text-gray-500" style={{ fontSize: '10px' }}>{values.exp2Dates}</p>
                    {values.exp2Missions && <p className="text-gray-700 whitespace-pre-wrap mt-1" style={{ fontSize: '11px', lineHeight: '1.6' }}>{values.exp2Missions}</p>}
                  </div>
                )}
              </div>
            )}
            {(values.dip1 || values.dip2) && (
              <div className="mt-5">
                <p className="font-black tracking-wide" style={{ fontSize: '12px', color: '#000', textTransform: 'uppercase' as const }}>Formation & Diplômes</p>
                <div className="h-0.5 w-full mt-1" style={{ background: '#000' }} />
                {values.dip1 && <p className="mt-2" style={{ fontSize: '11px', lineHeight: '1.6' }}>• {values.dip1}</p>}
                {values.dip2 && <p style={{ fontSize: '11px', lineHeight: '1.6' }}>• {values.dip2}</p>}
              </div>
            )}
            {(competencesList.length > 0 || values.langues) && (
              <div className="mt-5">
                <p className="font-black tracking-wide" style={{ fontSize: '12px', color: '#000', textTransform: 'uppercase' as const }}>Compétences & Langues</p>
                <div className="h-0.5 w-full mt-1" style={{ background: '#000' }} />
                {competencesList.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {competencesList.map((c, i) => (
                      <span key={i} className="px-2.5 py-1 rounded text-[10px] font-semibold" style={{ background: '#F0F4FF', color: '#0B2E8C', border: '1px solid #D6E0F5' }}>{c}</span>
                    ))}
                  </div>
                )}
                {values.langues && <p className="text-gray-700 mt-2" style={{ fontSize: '11px', lineHeight: '1.6' }}>{values.langues}</p>}
              </div>
            )}
          </div>
        </div>
      );
    }

    /* --- LETTER --- */
    if (template.content?.layout === 'letter') {
      return (
        <div ref={previewRef} className="bg-white mx-auto overflow-hidden shadow-lg" style={{ width: '794px', minHeight: '1123px', color: textColor, fontFamily: 'Inter, sans-serif' }}>
          <div className="h-2 w-full" style={{ background: accent }} />
          <div className="p-10">
            <div className="mb-6">
              {values.expediteur && <p className="font-bold" style={{ fontSize: '13px' }}>{values.expediteur}</p>}
              {values.adresseExp && <p className="text-gray-500" style={{ fontSize: '12px' }}>{values.adresseExp}</p>}
              {values.phone && <p className="text-gray-500" style={{ fontSize: '12px' }}>{values.phone}</p>}
              {values.email && <p className="text-gray-500" style={{ fontSize: '12px' }}>{values.email}</p>}
            </div>
            {values.destinataire && (
              <div className="mb-6">
                <p className="text-gray-600" style={{ fontSize: '12px' }}>{values.destinataire}</p>
                {values.adresseDest && <p className="text-gray-500" style={{ fontSize: '12px' }}>{values.adresseDest}</p>}
              </div>
            )}
            {values.objet && (
              <p className="font-bold mb-5" style={{ fontSize: '13px', color: accent }}>Objet: {values.objet}</p>
            )}
            <p className="text-gray-700 whitespace-pre-wrap" style={{ fontSize: '12px', lineHeight: '1.8' }}>{values.corps || 'Corps de la lettre...'}</p>
            <div className="mt-8">
              <p className="text-gray-600" style={{ fontSize: '12px' }}>Veuillez agréer, Madame, Monsieur, l'expression de mes salutations distinguées.</p>
            </div>
          </div>
        </div>
      );
    }

    /* --- CARD --- */
    if (template.content?.layout === 'card') {
      return (
        <div ref={previewRef} className="mx-auto overflow-hidden shadow-lg flex" style={{ width: '794px', minHeight: '1123px', background: bg, color: theme?.text || '#fff', fontFamily: 'Inter, sans-serif' }}>
          <div className="flex-1 p-12 flex flex-col justify-center gap-2">
            <div className="h-1 w-16 rounded mb-3" style={{ background: theme?.accent }} />
            <h3 className="font-black" style={{ fontSize: '36px', color: theme?.accent }}>{values.nom || 'Votre Nom'}</h3>
            <p className="font-semibold" style={{ fontSize: '18px', opacity: 0.8 }}>{values.fonction || 'Fonction'}</p>
            <div className="mt-5 space-y-2">
              {values.phone && (<div className="flex items-center gap-2"><Phone size={16} style={{ color: theme?.accent }} /><p style={{ fontSize: '14px', opacity: 0.7 }}>{values.phone}</p></div>)}
              {values.email && (<div className="flex items-center gap-2"><Mail size={16} style={{ color: theme?.accent }} /><p style={{ fontSize: '14px', opacity: 0.7 }}>{values.email}</p></div>)}
              {values.adresse && (<div className="flex items-center gap-2"><MapPin size={16} style={{ color: theme?.accent }} /><p style={{ fontSize: '14px', opacity: 0.7 }}>{values.adresse}</p></div>)}
            </div>
          </div>
          <div className="flex items-center justify-center p-10" style={{ width: '320px' }}>
            {values.logo ? (
              <img src={values.logo} alt="Logo" className="rounded-full object-cover border-4" style={{ width: '160px', height: '160px', borderColor: theme?.accent }} />
            ) : (
              <div className="rounded-full border-4 flex items-center justify-center" style={{ width: '160px', height: '160px', borderColor: theme?.accent }}>
                <User size={55} />
              </div>
            )}
          </div>
        </div>
      );
    }

    /* --- POSTER / FLYER --- */
    if (template.content?.layout === 'poster') {
      return (
        <div ref={previewRef} className="mx-auto overflow-hidden shadow-lg flex flex-col items-center justify-center" style={{ width: '794px', minHeight: '1123px', background: bg, color: theme?.text || '#fff', fontFamily: 'Inter, sans-serif', padding: '60px' }}>
          <div className="h-1.5 w-24 rounded mb-6" style={{ background: theme?.accent }} />
          <h2 className="font-black text-center" style={{ fontSize: '48px', lineHeight: '1.1' }}>{values.titre || 'TITRE'}</h2>
          {values.soustitre && <p className="mt-4 text-center font-semibold" style={{ fontSize: '20px', opacity: 0.85 }}>{values.soustitre}</p>}
          <div className="h-px w-24 my-8" style={{ background: theme?.accent }} />
          <div className="text-center space-y-3">
            {values.date && (
              <div className="flex items-center justify-center gap-2">
                <p style={{ fontSize: '18px', opacity: 0.8 }}>{values.date}</p>
              </div>
            )}
            {values.heure && <p style={{ fontSize: '18px', opacity: 0.8 }}>{values.heure}</p>}
            {values.lieu && (
              <div className="flex items-center justify-center gap-2 mt-2">
                <MapPin size={20} style={{ opacity: 0.7 }} />
                <p style={{ fontSize: '18px', opacity: 0.8 }}>{values.lieu}</p>
              </div>
            )}
          </div>
          {values.contact && (
            <div className="mt-8 px-6 py-3 rounded-full" style={{ background: theme?.accent, color: '#fff' }}>
              <p className="font-bold" style={{ fontSize: '16px' }}>{values.contact}</p>
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="fixed inset-0 z-[10000] bg-black/80 flex flex-col animate-[fadeIn_0.2s_ease-out]">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#0B2E8C] border-b border-white/10 flex-shrink-0">
        <div className="flex items-center gap-2">
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <h2 className="font-black text-base flex items-center gap-2">
            <Edit3 size={16} className="text-[#F97316]" />
            {template.title}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-white/50 hidden sm:flex items-center gap-1">
            <Eye size={12} /> Aperçu temps réel
          </span>
        </div>
      </div>

      {/* Split content: form (left) + preview (right) */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Form panel */}
        <div className="md:w-[400px] md:flex-shrink-0 bg-[#0B2E8C] overflow-y-auto px-4 py-4 space-y-5 md:border-r border-white/10">
          <input ref={fileRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />

          {groupedFields.map((group) => (
            <div key={group.section}>
              <p className="text-[11px] font-black uppercase tracking-wider text-[#F97316] mb-2 flex items-center gap-1.5">
                <Type size={11} />
                {group.section}
              </p>
              <div className="space-y-2.5">
                {group.fields.map((field) => {
                  if (field.type === 'image') {
                    return (
                      <div key={field.key}>
                        <label className="block text-sm font-semibold mb-1.5">{field.label}</label>
                        <button
                          onClick={() => triggerImageUpload(field.key)}
                          className="w-full border-2 border-dashed border-white/30 rounded-xl py-3 flex items-center justify-center gap-2 text-white/70 hover:border-[#F97316] transition-colors text-sm"
                        >
                          <Upload size={16} />
                          {values[field.key] ? 'Image ajoutée - Changer' : 'Ajouter une image'}
                        </button>
                      </div>
                    );
                  }
                  if (field.type === 'tags') {
                    return (
                      <div key={field.key}>
                        <label className="block text-sm font-semibold mb-1.5">{field.label}</label>
                        <input
                          type="text"
                          value={values[field.key] || ''}
                          onChange={(e) => updateValue(field.key, e.target.value)}
                          placeholder={field.placeholder}
                          className={inputClass}
                        />
                        <p className="text-[10px] text-white/40 mt-1">Séparez par des virgules</p>
                      </div>
                    );
                  }
                  return (
                    <div key={field.key}>
                      <label className="block text-sm font-semibold mb-1.5">{field.label}</label>
                      {field.type === 'textarea' ? (
                        <textarea
                          value={values[field.key] || ''}
                          onChange={(e) => updateValue(field.key, e.target.value)}
                          placeholder={field.placeholder}
                          rows={3}
                          className={inputClass + ' resize-none'}
                        />
                      ) : (
                        <input
                          type="text"
                          value={values[field.key] || ''}
                          onChange={(e) => updateValue(field.key, e.target.value)}
                          placeholder={field.placeholder}
                          className={inputClass}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Preview panel */}
        <div className="flex-1 overflow-auto bg-gray-200/10 flex items-start justify-center p-4">
          <div className="flex flex-col items-center gap-3">
            <div className="bg-white/5 rounded-2xl p-2 overflow-hidden shadow-2xl">
              <div style={{ width: '100%', overflow: 'hidden' }}>
                <div style={{ transform: 'scale(0.42)', transformOrigin: 'top left', width: '238%' }}>
                  {renderPreview()}
                </div>
              </div>
            </div>
            <p className="text-[10px] text-white/40">Format A4 - 794 x 1123 px</p>
          </div>
        </div>
      </div>

      {/* Fixed action buttons */}
      <div className="flex gap-2 bg-[#0B2E8C] p-3 border-t border-white/10 flex-shrink-0 pb-[calc(12px+env(safe-area-inset-bottom))]">
        <button
          type="button"
          onClick={handleDownloadPDF}
          disabled={downloading}
          className="flex-1 h-[46px] text-sm font-bold bg-[#F97316] text-white rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95 transition-transform"
        >
          {downloading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
          {downloading ? 'Génération...' : 'Télécharger PDF'}
        </button>
        <button
          type="button"
          onClick={handleDownloadPNG}
          disabled={downloading}
          className="flex-1 h-[46px] text-sm font-bold bg-blue-600 text-white rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95 transition-transform"
        >
          {downloading ? <Loader2 size={18} className="animate-spin" /> : <ImageIcon size={18} />}
          {downloading ? 'Génération...' : 'Télécharger PNG'}
        </button>
      </div>

      {/* Image preview overlay for long-press save */}
      {imagePreviewUrl && (
        <div className="fixed inset-0 z-[10001] bg-black/90 flex flex-col items-center justify-center animate-[fadeIn_0.2s_ease-out] p-4">
          <div className="flex items-center justify-between w-full max-w-md mb-3">
            <p className="text-white text-sm font-semibold flex items-center gap-2">
              <ImageIcon size={16} className="text-[#F97316]" />
              Maintenez appuyé sur l'image pour enregistrer
            </p>
            <button
              onClick={() => setImagePreviewUrl(null)}
              className="p-2 rounded-xl hover:bg-white/10 transition-colors"
            >
              <X size={20} className="text-white" />
            </button>
          </div>
          <img
            src={imagePreviewUrl}
            alt="Document"
            className="max-w-full max-h-[70vh] rounded-xl shadow-2xl"
          />
          <a
            href={imagePreviewUrl}
            download={`${getFilePrefix()}_${getFileName()}.png`}
            className="mt-4 px-6 py-3 bg-[#F97316] text-white text-sm font-bold rounded-xl flex items-center gap-2 active:scale-95 transition-transform"
          >
            <Download size={18} />
            Télécharger l'image
          </a>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   Section helper component for CV layouts
   ============================================================ */
function Section({ title, accent, icon, children }: { title: string; accent: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="mt-5">
      <div className="flex items-center gap-2 mb-2">
        {icon && <span style={{ color: accent }}>{icon}</span>}
        <p className="font-black tracking-wide" style={{ fontSize: '12px', color: accent, textTransform: 'uppercase' as const }}>{title}</p>
      </div>
      <div className="h-px w-full mb-2" style={{ background: accent, opacity: 0.2 }} />
      {children}
    </div>
  );
}
