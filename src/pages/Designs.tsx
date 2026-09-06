import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Download, FileText, Edit3, Lock, Image as ImageIcon,
  X, Upload, FileImage, Home, Wrench, Mail, CreditCard, Church,
  User, CheckCircle, Crown, Sparkles,
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
  | 'all' | 'cv-gratuit' | 'cv-pro' | 'lettres' | 'cartes' | 'affiches' | 'plans' | 'outils';

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
  fields: { key: string; label: string; type: 'text' | 'textarea' | 'image'; placeholder?: string }[];
  layout: 'cv' | 'letter' | 'card' | 'poster';
  defaults: Record<string, string>;
  theme?: { bg: string; accent: string; text: string; sidebar?: string };
}

/* ============================================================
   CV TEMPLATES (12)
   ============================================================ */
const cvTemplates: Template[] = [
  {
    id: 'cv-simple-gratuit',
    title: 'CV Simple Gratuit',
    category: 'cv-gratuit',
    editable: true,
    isFree: true,
    badgeColor: 'bg-green-500',
    badgeText: 'GRATUIT',
    preview: <CvPreview variant="simple" />,
    content: {
      layout: 'cv',
      fields: [
        { key: 'nom', label: 'Nom complet', type: 'text', placeholder: 'Jean Mukendi' },
        { key: 'fonction', label: 'Fonction', type: 'text', placeholder: 'Plombier' },
        { key: 'phone', label: 'Téléphone', type: 'text', placeholder: '+243 813 971 187' },
        { key: 'email', label: 'Email', type: 'text', placeholder: 'jean@email.com' },
        { key: 'adresse', label: 'Adresse', type: 'text', placeholder: 'Lubumbashi, RDC' },
        { key: 'photo', label: 'Photo', type: 'image' },
        { key: 'experience', label: 'Expérience', type: 'textarea', placeholder: '2020-2024: Plombier chez...\n2018-2020: Assistant plombier...' },
        { key: 'formation', label: 'Formation', type: 'textarea', placeholder: '2018: Diplôme en plomberie...' },
        { key: 'competences', label: 'Compétences', type: 'textarea', placeholder: 'Soudure, installation sanitaire...' },
      ],
      defaults: { nom: 'Votre Nom', fonction: 'Votre Fonction', phone: '+243...', email: 'email@exemple.com', adresse: 'Ville, Pays' },
      theme: { bg: '#ffffff', accent: '#0B2E8C', text: '#1a1a1a' },
    },
  },
  {
    id: 'cv-pro-gratuit',
    title: 'CV Pro Gratuit',
    category: 'cv-gratuit',
    editable: true,
    isFree: true,
    badgeColor: 'bg-blue-500',
    badgeText: 'GRATUIT',
    preview: <CvPreview variant="pro" />,
    content: {
      layout: 'cv',
      fields: [
        { key: 'nom', label: 'Nom complet', type: 'text', placeholder: 'Grace Kalala' },
        { key: 'fonction', label: 'Fonction', type: 'text', placeholder: 'Électricienne' },
        { key: 'phone', label: 'Téléphone', type: 'text', placeholder: '+243 813 971 187' },
        { key: 'email', label: 'Email', type: 'text', placeholder: 'grace@email.com' },
        { key: 'adresse', label: 'Adresse', type: 'text', placeholder: 'Lubumbashi, RDC' },
        { key: 'photo', label: 'Photo', type: 'image' },
        { key: 'experience', label: 'Expérience', type: 'textarea', placeholder: '2021-2024: Électricienne chez...\n2019-2021: Stage chez...' },
        { key: 'formation', label: 'Formation', type: 'textarea', placeholder: '2021: Licence en électrotechnique...' },
        { key: 'competences', label: 'Compétences', type: 'textarea', placeholder: 'Installation électrique, dépannage...' },
      ],
      defaults: { nom: 'Votre Nom', fonction: 'Votre Fonction', phone: '+243...', email: 'email@exemple.com', adresse: 'Ville, Pays' },
      theme: { bg: '#ffffff', accent: '#F97316', text: '#1a1a1a', sidebar: '#0B2E8C' },
    },
  },
  {
    id: 'cv-premium-2024',
    title: 'CV Premium 2024',
    category: 'cv-pro',
    editable: true,
    isPro: true,
    badgeColor: 'bg-orange-500',
    badgeText: 'PRO',
    preview: <CvPreview variant="premium" />,
    content: {
      layout: 'cv',
      fields: [
        { key: 'nom', label: 'Nom complet', type: 'text', placeholder: 'David Kasongo' },
        { key: 'fonction', label: 'Fonction', type: 'text', placeholder: 'Carreleur' },
        { key: 'phone', label: 'Téléphone', type: 'text', placeholder: '+243 813 971 187' },
        { key: 'email', label: 'Email', type: 'text', placeholder: 'david@email.com' },
        { key: 'adresse', label: 'Adresse', type: 'text', placeholder: 'Likasi, RDC' },
        { key: 'photo', label: 'Photo', type: 'image' },
        { key: 'experience', label: 'Expérience', type: 'textarea' },
        { key: 'formation', label: 'Formation', type: 'textarea' },
        { key: 'competences', label: 'Compétences', type: 'textarea' },
        { key: 'langues', label: 'Langues', type: 'text', placeholder: 'Français, Swahili, Anglais' },
      ],
      defaults: { nom: 'Votre Nom', fonction: 'Votre Fonction', phone: '+243...', email: 'email@exemple.com', adresse: 'Ville, Pays' },
      theme: { bg: '#ffffff', accent: '#D4A574', text: '#1a1a1a', sidebar: '#1E345D' },
    },
  },
  {
    id: 'cv-canva-style',
    title: 'CV Canva Style',
    category: 'cv-pro',
    editable: true,
    isPro: true,
    badgeColor: 'bg-purple-500',
    badgeText: 'PRO',
    preview: <CvPreview variant="canva" />,
    content: {
      layout: 'cv',
      fields: [
        { key: 'nom', label: 'Nom complet', type: 'text' },
        { key: 'fonction', label: 'Fonction', type: 'text' },
        { key: 'phone', label: 'Téléphone', type: 'text' },
        { key: 'email', label: 'Email', type: 'text' },
        { key: 'adresse', label: 'Adresse', type: 'text' },
        { key: 'photo', label: 'Photo', type: 'image' },
        { key: 'experience', label: 'Expérience', type: 'textarea' },
        { key: 'formation', label: 'Formation', type: 'textarea' },
        { key: 'competences', label: 'Compétences', type: 'textarea' },
      ],
      defaults: { nom: 'Votre Nom', fonction: 'Votre Fonction', phone: '+243...', email: 'email@exemple.com', adresse: 'Ville, Pays' },
      theme: { bg: '#ffffff', accent: '#6366F1', text: '#1a1a1a', sidebar: '#E0E7FF' },
    },
  },
  {
    id: 'cv-moderne-bleu',
    title: 'CV Moderne Bleu',
    category: 'cv-pro',
    editable: true,
    isPro: true,
    badgeColor: 'bg-blue-600',
    badgeText: 'PRO',
    preview: <CvPreview variant="moderne-bleu" />,
    content: {
      layout: 'cv',
      fields: [
        { key: 'nom', label: 'Nom complet', type: 'text' },
        { key: 'fonction', label: 'Fonction', type: 'text' },
        { key: 'phone', label: 'Téléphone', type: 'text' },
        { key: 'email', label: 'Email', type: 'text' },
        { key: 'adresse', label: 'Adresse', type: 'text' },
        { key: 'photo', label: 'Photo', type: 'image' },
        { key: 'experience', label: 'Expérience', type: 'textarea' },
        { key: 'formation', label: 'Formation', type: 'textarea' },
        { key: 'competences', label: 'Compétences', type: 'textarea' },
      ],
      defaults: { nom: 'Votre Nom', fonction: 'Votre Fonction', phone: '+243...', email: 'email@exemple.com', adresse: 'Ville, Pays' },
      theme: { bg: '#ffffff', accent: '#0B2E8C', text: '#1a1a1a', sidebar: '#0B2E8C' },
    },
  },
  {
    id: 'cv-moderne-orange',
    title: 'CV Moderne Orange',
    category: 'cv-pro',
    editable: true,
    isPro: true,
    badgeColor: 'bg-orange-500',
    badgeText: 'PRO',
    preview: <CvPreview variant="moderne-orange" />,
    content: {
      layout: 'cv',
      fields: [
        { key: 'nom', label: 'Nom complet', type: 'text' },
        { key: 'fonction', label: 'Fonction', type: 'text' },
        { key: 'phone', label: 'Téléphone', type: 'text' },
        { key: 'email', label: 'Email', type: 'text' },
        { key: 'adresse', label: 'Adresse', type: 'text' },
        { key: 'photo', label: 'Photo', type: 'image' },
        { key: 'experience', label: 'Expérience', type: 'textarea' },
        { key: 'formation', label: 'Formation', type: 'textarea' },
        { key: 'competences', label: 'Compétences', type: 'textarea' },
      ],
      defaults: { nom: 'Votre Nom', fonction: 'Votre Fonction', phone: '+243...', email: 'email@exemple.com', adresse: 'Ville, Pays' },
      theme: { bg: '#ffffff', accent: '#F97316', text: '#1a1a1a', sidebar: '#FFF7ED' },
    },
  },
  {
    id: 'cv-elegance',
    title: 'CV Élégance',
    category: 'cv-pro',
    editable: true,
    isPro: true,
    badgeColor: 'bg-gray-700',
    badgeText: 'PRO',
    preview: <CvPreview variant="elegance" />,
    content: {
      layout: 'cv',
      fields: [
        { key: 'nom', label: 'Nom complet', type: 'text' },
        { key: 'fonction', label: 'Fonction', type: 'text' },
        { key: 'phone', label: 'Téléphone', type: 'text' },
        { key: 'email', label: 'Email', type: 'text' },
        { key: 'adresse', label: 'Adresse', type: 'text' },
        { key: 'photo', label: 'Photo', type: 'image' },
        { key: 'experience', label: 'Expérience', type: 'textarea' },
        { key: 'formation', label: 'Formation', type: 'textarea' },
        { key: 'competences', label: 'Compétences', type: 'textarea' },
      ],
      defaults: { nom: 'Votre Nom', fonction: 'Votre Fonction', phone: '+243...', email: 'email@exemple.com', adresse: 'Ville, Pays' },
      theme: { bg: '#ffffff', accent: '#1a1a1a', text: '#1a1a1a', sidebar: '#F3F4F6' },
    },
  },
  {
    id: 'cv-creatif',
    title: 'CV Créatif',
    category: 'cv-pro',
    editable: true,
    isPro: true,
    badgeColor: 'bg-pink-500',
    badgeText: 'PRO',
    preview: <CvPreview variant="creatif" />,
    content: {
      layout: 'cv',
      fields: [
        { key: 'nom', label: 'Nom complet', type: 'text' },
        { key: 'fonction', label: 'Fonction', type: 'text' },
        { key: 'phone', label: 'Téléphone', type: 'text' },
        { key: 'email', label: 'Email', type: 'text' },
        { key: 'adresse', label: 'Adresse', type: 'text' },
        { key: 'photo', label: 'Photo', type: 'image' },
        { key: 'experience', label: 'Expérience', type: 'textarea' },
        { key: 'formation', label: 'Formation', type: 'textarea' },
        { key: 'competences', label: 'Compétences', type: 'textarea' },
      ],
      defaults: { nom: 'Votre Nom', fonction: 'Votre Fonction', phone: '+243...', email: 'email@exemple.com', adresse: 'Ville, Pays' },
      theme: { bg: '#ffffff', accent: '#EC4899', text: '#1a1a1a', sidebar: '#FDF2F8' },
    },
  },
  {
    id: 'cv-minimaliste',
    title: 'CV Minimaliste',
    category: 'cv-pro',
    editable: true,
    isPro: true,
    badgeColor: 'bg-teal-600',
    badgeText: 'PRO',
    preview: <CvPreview variant="minimaliste" />,
    content: {
      layout: 'cv',
      fields: [
        { key: 'nom', label: 'Nom complet', type: 'text' },
        { key: 'fonction', label: 'Fonction', type: 'text' },
        { key: 'phone', label: 'Téléphone', type: 'text' },
        { key: 'email', label: 'Email', type: 'text' },
        { key: 'adresse', label: 'Adresse', type: 'text' },
        { key: 'photo', label: 'Photo', type: 'image' },
        { key: 'experience', label: 'Expérience', type: 'textarea' },
        { key: 'formation', label: 'Formation', type: 'textarea' },
        { key: 'competences', label: 'Compétences', type: 'textarea' },
      ],
      defaults: { nom: 'Votre Nom', fonction: 'Votre Fonction', phone: '+243...', email: 'email@exemple.com', adresse: 'Ville, Pays' },
      theme: { bg: '#ffffff', accent: '#0D9488', text: '#1a1a1a' },
    },
  },
  {
    id: 'cv-classique',
    title: 'CV Classique',
    category: 'cv-pro',
    editable: true,
    isPro: true,
    badgeColor: 'bg-indigo-600',
    badgeText: 'PRO',
    preview: <CvPreview variant="classique" />,
    content: {
      layout: 'cv',
      fields: [
        { key: 'nom', label: 'Nom complet', type: 'text' },
        { key: 'fonction', label: 'Fonction', type: 'text' },
        { key: 'phone', label: 'Téléphone', type: 'text' },
        { key: 'email', label: 'Email', type: 'text' },
        { key: 'adresse', label: 'Adresse', type: 'text' },
        { key: 'photo', label: 'Photo', type: 'image' },
        { key: 'experience', label: 'Expérience', type: 'textarea' },
        { key: 'formation', label: 'Formation', type: 'textarea' },
        { key: 'competences', label: 'Compétences', type: 'textarea' },
      ],
      defaults: { nom: 'Votre Nom', fonction: 'Votre Fonction', phone: '+243...', email: 'email@exemple.com', adresse: 'Ville, Pays' },
      theme: { bg: '#ffffff', accent: '#4338CA', text: '#1a1a1a' },
    },
  },
  {
    id: 'cv-technique',
    title: 'CV Technique',
    category: 'cv-pro',
    editable: true,
    isPro: true,
    badgeColor: 'bg-cyan-600',
    badgeText: 'PRO',
    preview: <CvPreview variant="technique" />,
    content: {
      layout: 'cv',
      fields: [
        { key: 'nom', label: 'Nom complet', type: 'text' },
        { key: 'fonction', label: 'Fonction', type: 'text' },
        { key: 'phone', label: 'Téléphone', type: 'text' },
        { key: 'email', label: 'Email', type: 'text' },
        { key: 'adresse', label: 'Adresse', type: 'text' },
        { key: 'photo', label: 'Photo', type: 'image' },
        { key: 'experience', label: 'Expérience', type: 'textarea' },
        { key: 'formation', label: 'Formation', type: 'textarea' },
        { key: 'competences', label: 'Compétences', type: 'textarea' },
        { key: 'certifications', label: 'Certifications', type: 'textarea' },
      ],
      defaults: { nom: 'Votre Nom', fonction: 'Votre Fonction', phone: '+243...', email: 'email@exemple.com', adresse: 'Ville, Pays' },
      theme: { bg: '#ffffff', accent: '#0891B2', text: '#1a1a1a', sidebar: '#ECFEFF' },
    },
  },
  {
    id: 'cv-executive',
    title: 'CV Executive',
    category: 'cv-pro',
    editable: true,
    isPro: true,
    badgeColor: 'bg-gray-800',
    badgeText: 'PRO',
    preview: <CvPreview variant="executive" />,
    content: {
      layout: 'cv',
      fields: [
        { key: 'nom', label: 'Nom complet', type: 'text' },
        { key: 'fonction', label: 'Fonction', type: 'text' },
        { key: 'phone', label: 'Téléphone', type: 'text' },
        { key: 'email', label: 'Email', type: 'text' },
        { key: 'adresse', label: 'Adresse', type: 'text' },
        { key: 'photo', label: 'Photo', type: 'image' },
        { key: 'experience', label: 'Expérience', type: 'textarea' },
        { key: 'formation', label: 'Formation', type: 'textarea' },
        { key: 'competences', label: 'Compétences', type: 'textarea' },
        { key: 'references', label: 'Références', type: 'textarea' },
      ],
      defaults: { nom: 'Votre Nom', fonction: 'Votre Fonction', phone: '+243...', email: 'email@exemple.com', adresse: 'Ville, Pays' },
      theme: { bg: '#ffffff', accent: '#111827', text: '#1a1a1a', sidebar: '#1F2937' },
    },
  },
];

/* ============================================================
   LETTRES (5)
   ============================================================ */
const lettreTemplates: Template[] = [
  { id: 'lettre-classique', title: 'Lettre Classique', category: 'lettres', editable: true, isFree: true, badgeColor: 'bg-green-500', badgeText: 'GRATUIT', preview: <LettrePreview variant="classique" />, content: { layout: 'letter', fields: [
    { key: 'expediteur', label: 'Votre nom', type: 'text', placeholder: 'Jean Mukendi' },
    { key: 'adresseExp', label: 'Votre adresse', type: 'text', placeholder: 'Lubumbashi, RDC' },
    { key: 'destinataire', label: 'Destinataire', type: 'text', placeholder: 'Direction RH' },
    { key: 'objet', label: 'Objet', type: 'text', placeholder: 'Candidature au poste de...' },
    { key: 'corps', label: 'Corps de la lettre', type: 'textarea', placeholder: 'Madame, Monsieur,\n\nJe vous adresse ma candidature...' },
  ], defaults: {}, theme: { bg: '#ffffff', accent: '#0B2E8C', text: '#1a1a1a' } } },
  { id: 'lettre-moderne', title: 'Lettre Moderne', category: 'lettres', editable: true, isPro: true, badgeColor: 'bg-orange-500', badgeText: 'PRO', preview: <LettrePreview variant="moderne" />, content: { layout: 'letter', fields: [
    { key: 'expediteur', label: 'Votre nom', type: 'text' },
    { key: 'adresseExp', label: 'Votre adresse', type: 'text' },
    { key: 'destinataire', label: 'Destinataire', type: 'text' },
    { key: 'objet', label: 'Objet', type: 'text' },
    { key: 'corps', label: 'Corps de la lettre', type: 'textarea' },
  ], defaults: {}, theme: { bg: '#ffffff', accent: '#F97316', text: '#1a1a1a' } } },
  { id: 'lettre-simple', title: 'Lettre Simple', category: 'lettres', editable: true, isPro: true, badgeColor: 'bg-blue-500', badgeText: 'PRO', preview: <LettrePreview variant="simple" />, content: { layout: 'letter', fields: [
    { key: 'expediteur', label: 'Votre nom', type: 'text' },
    { key: 'adresseExp', label: 'Votre adresse', type: 'text' },
    { key: 'destinataire', label: 'Destinataire', type: 'text' },
    { key: 'objet', label: 'Objet', type: 'text' },
    { key: 'corps', label: 'Corps de la lettre', type: 'textarea' },
  ], defaults: {}, theme: { bg: '#ffffff', accent: '#3B82F6', text: '#1a1a1a' } } },
  { id: 'lettre-elegante', title: 'Lettre Élégante', category: 'lettres', editable: true, isPro: true, badgeColor: 'bg-gray-700', badgeText: 'PRO', preview: <LettrePreview variant="elegante" />, content: { layout: 'letter', fields: [
    { key: 'expediteur', label: 'Votre nom', type: 'text' },
    { key: 'adresseExp', label: 'Votre adresse', type: 'text' },
    { key: 'destinataire', label: 'Destinataire', type: 'text' },
    { key: 'objet', label: 'Objet', type: 'text' },
    { key: 'corps', label: 'Corps de la lettre', type: 'textarea' },
  ], defaults: {}, theme: { bg: '#ffffff', accent: '#374151', text: '#1a1a1a' } } },
  { id: 'lettre-colorée', title: 'Lettre Colorée', category: 'lettres', editable: true, isPro: true, badgeColor: 'bg-pink-500', badgeText: 'PRO', preview: <LettrePreview variant="colorée" />, content: { layout: 'letter', fields: [
    { key: 'expediteur', label: 'Votre nom', type: 'text' },
    { key: 'adresseExp', label: 'Votre adresse', type: 'text' },
    { key: 'destinataire', label: 'Destinataire', type: 'text' },
    { key: 'objet', label: 'Objet', type: 'text' },
    { key: 'corps', label: 'Corps de la lettre', type: 'textarea' },
  ], defaults: {}, theme: { bg: '#ffffff', accent: '#EC4899', text: '#1a1a1a' } } },
];

/* ============================================================
   CARTES DE VISITE (6)
   ============================================================ */
const carteTemplates: Template[] = [
  { id: 'carte-plombier', title: 'Carte Plombier', category: 'cartes', editable: true, isFree: true, badgeColor: 'bg-blue-500', badgeText: 'GRATUIT', preview: <CartePreview variant="plombier" />, content: { layout: 'card', fields: [
    { key: 'nom', label: 'Nom', type: 'text', placeholder: 'Jean Mukendi' },
    { key: 'fonction', label: 'Fonction', type: 'text', placeholder: 'Plombier Professionnel' },
    { key: 'phone', label: 'Téléphone', type: 'text', placeholder: '+243 813 971 187' },
    { key: 'email', label: 'Email', type: 'text', placeholder: 'jean@email.com' },
    { key: 'adresse', label: 'Adresse', type: 'text', placeholder: 'Lubumbashi, RDC' },
  ], defaults: { fonction: 'Plombier Professionnel' }, theme: { bg: '#0B2E8C', accent: '#60A5FA', text: '#ffffff' } } },
  { id: 'carte-electricien', title: 'Carte Électricien', category: 'cartes', editable: true, isPro: true, badgeColor: 'bg-orange-500', badgeText: 'PRO', preview: <CartePreview variant="electricien" />, content: { layout: 'card', fields: [
    { key: 'nom', label: 'Nom', type: 'text' },
    { key: 'fonction', label: 'Fonction', type: 'text' },
    { key: 'phone', label: 'Téléphone', type: 'text' },
    { key: 'email', label: 'Email', type: 'text' },
    { key: 'adresse', label: 'Adresse', type: 'text' },
  ], defaults: { fonction: 'Électricien Professionnel' }, theme: { bg: '#F97316', accent: '#FED7AA', text: '#ffffff' } } },
  { id: 'carte-carreleur', title: 'Carte Carreleur', category: 'cartes', editable: true, isPro: true, badgeColor: 'bg-green-600', badgeText: 'PRO', preview: <CartePreview variant="carreleur" />, content: { layout: 'card', fields: [
    { key: 'nom', label: 'Nom', type: 'text' },
    { key: 'fonction', label: 'Fonction', type: 'text' },
    { key: 'phone', label: 'Téléphone', type: 'text' },
    { key: 'email', label: 'Email', type: 'text' },
    { key: 'adresse', label: 'Adresse', type: 'text' },
  ], defaults: { fonction: 'Carreleur Professionnel' }, theme: { bg: '#16A34A', accent: '#BBF7D0', text: '#ffffff' } } },
  { id: 'carte-plafonneur', title: 'Carte Plafonneur', category: 'cartes', editable: true, isPro: true, badgeColor: 'bg-yellow-500', badgeText: 'PRO', preview: <CartePreview variant="plafonneur" />, content: { layout: 'card', fields: [
    { key: 'nom', label: 'Nom', type: 'text' },
    { key: 'fonction', label: 'Fonction', type: 'text' },
    { key: 'phone', label: 'Téléphone', type: 'text' },
    { key: 'email', label: 'Email', type: 'text' },
    { key: 'adresse', label: 'Adresse', type: 'text' },
  ], defaults: { fonction: 'Plafonneur Professionnel' }, theme: { bg: '#EAB308', accent: '#FEF3C7', text: '#1a1a1a' } } },
  { id: 'carte-macon', title: 'Carte Maçon', category: 'cartes', editable: true, isPro: true, badgeColor: 'bg-gray-700', badgeText: 'PRO', preview: <CartePreview variant="macon" />, content: { layout: 'card', fields: [
    { key: 'nom', label: 'Nom', type: 'text' },
    { key: 'fonction', label: 'Fonction', type: 'text' },
    { key: 'phone', label: 'Téléphone', type: 'text' },
    { key: 'email', label: 'Email', type: 'text' },
    { key: 'adresse', label: 'Adresse', type: 'text' },
  ], defaults: { fonction: 'Maçon Professionnel' }, theme: { bg: '#374151', accent: '#D1D5DB', text: '#ffffff' } } },
  { id: 'carte-peintre', title: 'Carte Peintre', category: 'cartes', editable: true, isPro: true, badgeColor: 'bg-purple-500', badgeText: 'PRO', preview: <CartePreview variant="peintre" />, content: { layout: 'card', fields: [
    { key: 'nom', label: 'Nom', type: 'text' },
    { key: 'fonction', label: 'Fonction', type: 'text' },
    { key: 'phone', label: 'Téléphone', type: 'text' },
    { key: 'email', label: 'Email', type: 'text' },
    { key: 'adresse', label: 'Adresse', type: 'text' },
  ], defaults: { fonction: 'Peintre Professionnel' }, theme: { bg: '#7C3AED', accent: '#DDD6FE', text: '#ffffff' } } },
];

/* ============================================================
   AFFICHES ÉGLISES (8)
   ============================================================ */
const afficheTemplates: Template[] = [
  { id: 'affiche-croisade', title: 'Affiche Croisade', category: 'affiches', editable: true, isFree: true, badgeColor: 'bg-green-500', badgeText: 'GRATUIT', preview: <AffichePreview variant="croisade" />, content: { layout: 'poster', fields: [
    { key: 'titre', label: 'Titre', type: 'text', placeholder: 'CROISADE DE PRIÈRE' },
    { key: 'date', label: 'Date', type: 'text', placeholder: '15 Septembre 2024' },
    { key: 'heure', label: 'Heure', type: 'text', placeholder: '19h00' },
    { key: 'lieu', label: 'Lieu', type: 'text', placeholder: 'Temple Central, Lubumbashi' },
    { key: 'theme', label: 'Thème', type: 'text', placeholder: 'La Puissance de la Foi' },
  ], defaults: { titre: 'CROISADE DE PRIÈRE' }, theme: { bg: '#1E345D', accent: '#F97316', text: '#ffffff' } } },
  { id: 'affiche-culte', title: 'Affiche Culte', category: 'affiches', editable: true, isPro: true, badgeColor: 'bg-blue-500', badgeText: 'PRO', preview: <AffichePreview variant="culte" />, content: { layout: 'poster', fields: [
    { key: 'titre', label: 'Titre', type: 'text', placeholder: 'CULTE D\'ACTION DE GRÂCE' },
    { key: 'date', label: 'Date', type: 'text' },
    { key: 'heure', label: 'Heure', type: 'text' },
    { key: 'lieu', label: 'Lieu', type: 'text' },
    { key: 'theme', label: 'Thème', type: 'text' },
  ], defaults: { titre: 'CULTE D\'ACTION DE GRÂCE' }, theme: { bg: '#0B2E8C', accent: '#60A5FA', text: '#ffffff' } } },
  { id: 'affiche-jeunesse', title: 'Affiche Jeunesse', category: 'affiches', editable: true, isPro: true, badgeColor: 'bg-orange-500', badgeText: 'PRO', preview: <AffichePreview variant="jeunesse" />, content: { layout: 'poster', fields: [
    { key: 'titre', label: 'Titre', type: 'text', placeholder: 'CONGRÈS DE LA JEUNESSE' },
    { key: 'date', label: 'Date', type: 'text' },
    { key: 'heure', label: 'Heure', type: 'text' },
    { key: 'lieu', label: 'Lieu', type: 'text' },
    { key: 'theme', label: 'Thème', type: 'text' },
  ], defaults: { titre: 'CONGRÈS DE LA JEUNESSE' }, theme: { bg: '#F97316', accent: '#FED7AA', text: '#ffffff' } } },
  { id: 'affiche-conference', title: 'Affiche Conférence', category: 'affiches', editable: true, isPro: true, badgeColor: 'bg-purple-500', badgeText: 'PRO', preview: <AffichePreview variant="conference" />, content: { layout: 'poster', fields: [
    { key: 'titre', label: 'Titre', type: 'text' },
    { key: 'date', label: 'Date', type: 'text' },
    { key: 'heure', label: 'Heure', type: 'text' },
    { key: 'lieu', label: 'Lieu', type: 'text' },
    { key: 'theme', label: 'Thème', type: 'text' },
  ], defaults: { titre: 'CONFÉRENCE BIBLIQUE' }, theme: { bg: '#7C3AED', accent: '#DDD6FE', text: '#ffffff' } } },
  { id: 'affiche-reveil', title: 'Affiche Réveil', category: 'affiches', editable: true, isPro: true, badgeColor: 'bg-green-600', badgeText: 'PRO', preview: <AffichePreview variant="reveil" />, content: { layout: 'poster', fields: [
    { key: 'titre', label: 'Titre', type: 'text' },
    { key: 'date', label: 'Date', type: 'text' },
    { key: 'heure', label: 'Heure', type: 'text' },
    { key: 'lieu', label: 'Lieu', type: 'text' },
    { key: 'theme', label: 'Thème', type: 'text' },
  ], defaults: { titre: 'SEMAINE DE RÉVEIL SPIRITUEL' }, theme: { bg: '#16A34A', accent: '#BBF7D0', text: '#ffffff' } } },
  { id: 'affiche-bapteme', title: 'Affiche Baptême', category: 'affiches', editable: true, isPro: true, badgeColor: 'bg-cyan-600', badgeText: 'PRO', preview: <AffichePreview variant="bapteme" />, content: { layout: 'poster', fields: [
    { key: 'titre', label: 'Titre', type: 'text' },
    { key: 'date', label: 'Date', type: 'text' },
    { key: 'heure', label: 'Heure', type: 'text' },
    { key: 'lieu', label: 'Lieu', type: 'text' },
    { key: 'theme', label: 'Thème', type: 'text' },
  ], defaults: { titre: 'CÉRÉMONIE DE BAPTÊME' }, theme: { bg: '#0891B2', accent: '#CFFAFE', text: '#ffffff' } } },
  { id: 'affiche-mariage', title: 'Affiche Mariage', category: 'affiches', editable: true, isPro: true, badgeColor: 'bg-pink-500', badgeText: 'PRO', preview: <AffichePreview variant="mariage" />, content: { layout: 'poster', fields: [
    { key: 'titre', label: 'Titre', type: 'text' },
    { key: 'date', label: 'Date', type: 'text' },
    { key: 'heure', label: 'Heure', type: 'text' },
    { key: 'lieu', label: 'Lieu', type: 'text' },
    { key: 'theme', label: 'Thème', type: 'text' },
  ], defaults: { titre: 'CÉLÉBRATION DE MARIAGE' }, theme: { bg: '#EC4899', accent: '#FCE7F3', text: '#ffffff' } } },
  { id: 'affiche-special', title: 'Affiche Spéciale', category: 'affiches', editable: true, isPro: true, badgeColor: 'bg-red-600', badgeText: 'PRO', preview: <AffichePreview variant="special" />, content: { layout: 'poster', fields: [
    { key: 'titre', label: 'Titre', type: 'text' },
    { key: 'date', label: 'Date', type: 'text' },
    { key: 'heure', label: 'Heure', type: 'text' },
    { key: 'lieu', label: 'Lieu', type: 'text' },
    { key: 'theme', label: 'Thème', type: 'text' },
  ], defaults: { titre: 'PROGRAMME SPÉCIAL' }, theme: { bg: '#DC2626', accent: '#FECACA', text: '#ffffff' } } },
];

/* ============================================================
   PLANS MAISONS (4) - Non modifiables
   ============================================================ */
const planTemplates: Template[] = [
  { id: 'plan-2ch', title: 'Plan Maison 2 Chambres', category: 'plans', editable: false, isFree: true, badgeColor: 'bg-green-500', badgeText: 'GRATUIT', preview: <PlanPreview chambres={2} /> },
  { id: 'plan-3ch', title: 'Plan Maison 3 Chambres', category: 'plans', editable: false, isPro: true, badgeColor: 'bg-orange-500', badgeText: 'PRO', preview: <PlanPreview chambres={3} /> },
  { id: 'plan-4ch', title: 'Plan Maison 4 Chambres', category: 'plans', editable: false, isPro: true, badgeColor: 'bg-orange-500', badgeText: 'PRO', preview: <PlanPreview chambres={4} /> },
  { id: 'plan-5ch', title: 'Plan Maison 5 Chambres', category: 'plans', editable: false, isPro: true, badgeColor: 'bg-orange-500', badgeText: 'PRO', preview: <PlanPreview chambres={5} /> },
];

/* ============================================================
   OUTILS MÉTIERS (4) - Non modifiables
   ============================================================ */
const outilTemplates: Template[] = [
  { id: 'outil-plombier', title: 'Guide Plombier', category: 'outils', editable: false, isFree: true, badgeColor: 'bg-green-500', badgeText: 'GRATUIT', preview: <OutilPreview variant="plombier" /> },
  { id: 'outil-electricien', title: 'Guide Électricien', category: 'outils', editable: false, isPro: true, badgeColor: 'bg-orange-500', badgeText: 'PRO', preview: <OutilPreview variant="electricien" /> },
  { id: 'outil-carreleur', title: 'Guide Carreleur', category: 'outils', editable: false, isPro: true, badgeColor: 'bg-orange-500', badgeText: 'PRO', preview: <OutilPreview variant="carreleur" /> },
  { id: 'outil-macon', title: 'Guide Maçon', category: 'outils', editable: false, isPro: true, badgeColor: 'bg-orange-500', badgeText: 'PRO', preview: <OutilPreview variant="macon" /> },
];

const allTemplates: Template[] = [
  ...cvTemplates, ...lettreTemplates, ...carteTemplates,
  ...afficheTemplates, ...planTemplates, ...outilTemplates,
];

/* ============================================================
   PREVIEW COMPONENTS
   ============================================================ */
function CvPreview({ variant }: { variant: string }) {
  const themes: Record<string, { accent: string; sidebar?: string; bg: string }> = {
    simple: { accent: '#0B2E8C', bg: '#fff' },
    pro: { accent: '#F97316', sidebar: '#0B2E8C', bg: '#fff' },
    premium: { accent: '#D4A574', sidebar: '#1E345D', bg: '#fff' },
    canva: { accent: '#6366F1', sidebar: '#E0E7FF', bg: '#fff' },
    'moderne-bleu': { accent: '#0B2E8C', sidebar: '#0B2E8C', bg: '#fff' },
    'moderne-orange': { accent: '#F97316', sidebar: '#FFF7ED', bg: '#fff' },
    elegance: { accent: '#1a1a1a', sidebar: '#F3F4F6', bg: '#fff' },
    creatif: { accent: '#EC4899', sidebar: '#FDF2F8', bg: '#fff' },
    minimaliste: { accent: '#0D9488', bg: '#fff' },
    classique: { accent: '#4338CA', bg: '#fff' },
    technique: { accent: '#0891B2', sidebar: '#ECFEFF', bg: '#fff' },
    executive: { accent: '#111827', sidebar: '#1F2937', bg: '#fff' },
  };
  const t = themes[variant] || themes.simple;
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

function LettrePreview({ variant }: { variant: string }) {
  const accents: Record<string, string> = {
    classique: '#0B2E8C', moderne: '#F97316', simple: '#3B82F6',
    elegante: '#374151', 'colorée': '#EC4899',
  };
  const accent = accents[variant] || '#0B2E8C';
  return (
    <div className="w-full aspect-[210/297] bg-white rounded-lg overflow-hidden p-3 shadow-sm flex flex-col gap-1">
      <div className="h-1.5 w-16 rounded" style={{ background: accent }} />
      <div className="h-1 w-20 bg-gray-300 rounded mt-1" />
      <div className="h-1 w-14 bg-gray-200 rounded" />
      <div className="h-1 w-18 bg-gray-200 rounded" />
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
    plafonneur: { bg: '#EAB308', accent: '#FEF3C7', text: '#1a1a1a' },
    macon: { bg: '#374151', accent: '#D1D5DB', text: '#fff' },
    peintre: { bg: '#7C3AED', accent: '#DDD6FE', text: '#fff' },
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
    conference: { bg: '#7C3AED', accent: '#DDD6FE' },
    reveil: { bg: '#16A34A', accent: '#BBF7D0' },
    bapteme: { bg: '#0891B2', accent: '#CFFAFE' },
    mariage: { bg: '#EC4899', accent: '#FCE7F3' },
    special: { bg: '#DC2626', accent: '#FECACA' },
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

function PlanPreview({ chambres }: { chambres: number }) {
  const roomColors = ['#DBEAFE', '#FEF3C7', '#D1FAE5', '#FCE7F3', '#E0E7FF'];
  return (
    <div className="w-full aspect-[210/297] bg-white rounded-lg overflow-hidden p-2 shadow-sm">
      <div className="w-full h-full border-2 border-gray-800 rounded flex flex-col">
        <div className="flex-1 flex">
          <div className="w-1/2 border-r-2 border-gray-800 p-1 flex flex-col gap-1">
            {Array.from({ length: Math.ceil(chambres / 2) }).map((_, i) => (
              <div key={i} className="flex-1 rounded-sm flex items-center justify-center text-[8px] font-bold text-gray-600" style={{ background: roomColors[i % roomColors.length] }}>
                CH.{i + 1}
              </div>
            ))}
          </div>
          <div className="w-1/2 flex flex-col">
            <div className="flex-1 border-b-2 border-gray-800 p-1 flex flex-col gap-1">
              {Array.from({ length: Math.floor(chambres / 2) }).map((_, i) => (
                <div key={i} className="flex-1 rounded-sm flex items-center justify-center text-[8px] font-bold text-gray-600" style={{ background: roomColors[(i + 2) % roomColors.length] }}>
                  CH.{i + Math.ceil(chambres / 2) + 1}
                </div>
              ))}
            </div>
            <div className="h-1/3 border-b-2 border-gray-800 bg-gray-100 flex items-center justify-center text-[8px] font-bold text-gray-600">
              SALON
            </div>
            <div className="h-1/4 bg-yellow-100 flex items-center justify-center text-[8px] font-bold text-gray-600">
              CUISINE
            </div>
          </div>
        </div>
        <div className="h-1/6 border-t-2 border-gray-800 bg-blue-50 flex items-center justify-around text-[8px] font-bold text-gray-600">
          <span>SDB</span>
          <span>WC</span>
          <span>HALL</span>
        </div>
      </div>
    </div>
  );
}

function OutilPreview({ variant }: { variant: string }) {
  const themes: Record<string, { bg: string; icon: string; label: string }> = {
    plombier: { bg: '#0B2E8C', icon: '🔧', label: 'Guide Plombier' },
    electricien: { bg: '#F97316', icon: '⚡', label: 'Guide Électricien' },
    carreleur: { bg: '#16A34A', icon: '🧱', label: 'Guide Carreleur' },
    macon: { bg: '#374151', icon: '🏗️', label: 'Guide Maçon' },
  };
  const t = themes[variant] || themes.plombier;
  return (
    <div className="w-full aspect-[210/297] rounded-lg overflow-hidden shadow-sm flex flex-col items-center justify-center gap-3" style={{ background: t.bg }}>
      <div className="text-4xl">{t.icon}</div>
      <div className="text-white font-bold text-sm">{t.label}</div>
      <div className="space-y-1.5 mt-2">
        <div className="h-1.5 w-24 bg-white/30 rounded" />
        <div className="h-1.5 w-20 bg-white/30 rounded" />
        <div className="h-1.5 w-22 bg-white/30 rounded" />
        <div className="h-1.5 w-18 bg-white/30 rounded" />
      </div>
    </div>
  );
}

/* ============================================================
   FILTERS
   ============================================================ */
const filters: { id: Category; label: string; icon: typeof FileText }[] = [
  { id: 'all', label: 'Tous', icon: Sparkles },
  { id: 'cv-gratuit', label: 'CV Gratuit', icon: User },
  { id: 'cv-pro', label: 'CV Pro', icon: Crown },
  { id: 'lettres', label: 'Lettres', icon: Mail },
  { id: 'cartes', label: 'Cartes Visite', icon: CreditCard },
  { id: 'affiches', label: 'Affiches Églises', icon: Church },
  { id: 'plans', label: 'Plans Maisons', icon: Home },
  { id: 'outils', label: 'Outils Métiers', icon: Wrench },
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

  const handleDownload = (template: Template) => {
    const p = getPricing(template);
    if (p?.is_paid) {
      setPayingFor(template);
      return;
    }
    downloadTemplateImage(template.id, template.title);
  };

  const handleUnlock = (template: Template) => {
    const p = getPricing(template);
    if (p?.is_paid) {
      setPayingFor(template);
      return;
    }
    window.open(
      `https://wa.me/243813971187?text=Je%20veux%20debloquer%20CV%20Pro%20${encodeURIComponent(template.title)}`,
      '_blank'
    );
  };

  const handlePaidSuccess = () => {
    if (!payingFor) return;
    const template = payingFor;
    setPayingFor(null);
    if (template.editable) {
      setEditing(template);
    } else {
      downloadTemplateImage(template.id, template.title);
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
          <p className="text-lg font-black">🎉 TOUS LES MODÈLES GRATUITS</p>
          <p className="text-sm text-white/90 mt-1">Modifiez et exportez en PDF ou PNG</p>
        </div>

        {/* Bouton WhatsApp chaîne */}
        <a
          href="https://whatsapp.com/channel/0029VbD48n84tRrs24Hf0Y0A"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full bg-[#25D366] text-white font-bold rounded-2xl py-3 flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition-transform mb-4"
        >
          Rejoindre la chaîne WhatsApp
        </a>

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
            <div key={template.id} className="bg-white/10 rounded-2xl overflow-hidden shadow-lg">
              {/* Preview */}
              <div className="relative p-2.5 bg-white/5">
                {template.preview}
                {/* Badge */}
                <span className={`absolute top-3 right-3 ${template.badgeColor || 'bg-gray-500'} text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-md`}>
                  {template.badgeText || ''}
                </span>
              </div>

              {/* Info */}
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

                {/* Actions */}
                <div className="mt-2.5 space-y-1.5">
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
                  {!template.editable && (
                    <button
                      onClick={() => handleDownload(template)}
                      style={getPricing(template)?.btn_color ? { backgroundColor: getPricing(template)!.btn_color! } : undefined}
                      className="w-full text-white text-xs font-bold rounded-xl py-2 flex items-center justify-center gap-1 active:scale-95 transition-transform bg-blue-600"
                    >
                      <Download size={13} />
                      {getPricing(template)?.is_paid ? 'Débloquer & Télécharger' : (getPricing(template)?.btn_label || 'Télécharger')}
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

      {/* Editor Modal */}
      {editing && editing.content && (
        <EditorModal template={editing} onClose={() => setEditing(null)} />
      )}

      {/* Payment Modal */}
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
  template,
  pricing,
  onClose,
  onSuccess,
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
      } catch {
        /* ignore */
      }
    }
  };

  const confirmPaid = () => {
    setPaid(true);
    setTimeout(() => {
      onSuccess();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/70 flex items-end sm:items-center justify-center animate-[fadeIn_0.2s_ease-out]" onClick={onClose}>
      <div
        className="bg-[#0B2E8C] w-full max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden border border-white/20 animate-[scaleIn_0.3s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
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
              <p className="text-sm text-white/70">Téléchargement en cours...</p>
            </div>
          ) : (
            <>
              <div className="bg-white/10 rounded-2xl p-4 text-center">
                <p className="text-sm text-white/70">Fichier</p>
                <p className="font-bold text-lg">{template.title}</p>
                <p className="text-2xl font-black text-[#F97316] mt-2">{pricing?.price || 'Payant'}</p>
              </div>

              {!showCode ? (
                <button
                  onClick={handlePay}
                  className="w-full bg-[#F97316] text-white font-bold rounded-2xl py-3.5 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
                >
                  <CreditCard size={20} />
                  Payer {pricing?.price || ''}
                </button>
              ) : (
                <>
                  <div className="bg-white/5 rounded-2xl p-3 text-center">
                    <p className="text-xs text-white/60 mb-1">Page de paiement ouverte</p>
                    <p className="text-xs text-white/50">Effectuez le paiement, puis confirmez ci-dessous</p>
                  </div>
                  <button
                    onClick={confirmPaid}
                    className="w-full bg-green-600 text-white font-bold rounded-2xl py-3.5 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
                  >
                    <CheckCircle size={20} />
                    J'ai payé - Télécharger
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
   EDITOR MODAL
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

  const updateValue = (key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return;
    const reader = new FileReader();
    reader.onload = () => updateValue('photo', reader.result as string);
    reader.readAsDataURL(file);
  };

  const [downloading, setDownloading] = useState(false);

  const handleDownloadPDF = useCallback(async () => {
    const el = previewRef.current;
    if (!el || downloading) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`${template.title}-${Date.now()}.pdf`);
    } catch {
      showToast('Erreur lors de l\'export PDF', 'error');
    } finally {
      setDownloading(false);
    }
  }, [template, downloading]);

  const handleDownloadPNG = useCallback(async () => {
    const el = previewRef.current;
    if (!el || downloading) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
      const link = document.createElement('a');
      link.download = `${template.title}-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch {
      showToast('Erreur lors de l\'export PNG', 'error');
    } finally {
      setDownloading(false);
    }
  }, [template, downloading]);

  const inputClass = 'w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-white text-sm placeholder-white/40 focus:outline-none focus:border-[#F97316] transition-colors';

  const renderPreview = () => {
    const theme = template.content?.theme;
    const accent = theme?.accent || '#0B2E8C';
    const bg = theme?.bg || '#ffffff';
    const sidebar = theme?.sidebar;
    const textColor = theme?.text || '#1a1a1a';

    if (template.content?.layout === 'cv') {
      return (
        <div ref={previewRef} className="w-full bg-white rounded-xl overflow-hidden flex shadow-lg" style={{ color: textColor }}>
          {sidebar && (
            <div className="w-1/3 p-3 flex flex-col items-center gap-2" style={{ background: sidebar, color: '#fff' }}>
              {values.photo ? (
                <img src={values.photo} alt="Photo" className="w-16 h-16 rounded-full object-cover border-2 border-white/30" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                  <Upload size={20} className="text-white/50" />
                </div>
              )}
              <div className="w-full space-y-1">
                <div className="h-px w-full bg-white/20" />
                <p className="text-[10px] font-bold text-white/80">CONTACT</p>
                {values.phone && <p className="text-[9px] text-white/70">{values.phone}</p>}
                {values.email && <p className="text-[9px] text-white/70">{values.email}</p>}
                {values.adresse && <p className="text-[9px] text-white/70">{values.adresse}</p>}
              </div>
            </div>
          )}
          <div className="flex-1 p-4 space-y-2">
            <h2 className="text-lg font-black" style={{ color: accent }}>{values.nom || 'Votre Nom'}</h2>
            <p className="text-sm font-semibold text-gray-600">{values.fonction || 'Votre Fonction'}</p>
            {!sidebar && (
              <div className="text-[10px] text-gray-500 space-y-0.5">
                {values.phone && <p>{values.phone}</p>}
                {values.email && <p>{values.email}</p>}
                {values.adresse && <p>{values.adresse}</p>}
              </div>
            )}
            {values.experience && (
              <div>
                <p className="text-xs font-bold mb-1" style={{ color: accent }}>EXPÉRIENCE</p>
                <p className="text-[10px] text-gray-600 whitespace-pre-wrap">{values.experience}</p>
              </div>
            )}
            {values.formation && (
              <div>
                <p className="text-xs font-bold mb-1" style={{ color: accent }}>FORMATION</p>
                <p className="text-[10px] text-gray-600 whitespace-pre-wrap">{values.formation}</p>
              </div>
            )}
            {values.competences && (
              <div>
                <p className="text-xs font-bold mb-1" style={{ color: accent }}>COMPÉTENCES</p>
                <p className="text-[10px] text-gray-600 whitespace-pre-wrap">{values.competences}</p>
              </div>
            )}
          </div>
        </div>
      );
    }

    if (template.content?.layout === 'letter') {
      return (
        <div ref={previewRef} className="w-full bg-white rounded-xl overflow-hidden p-5 shadow-lg" style={{ color: textColor }}>
          <div className="h-1 w-16 rounded mb-3" style={{ background: accent }} />
          {values.expediteur && <p className="text-xs font-bold">{values.expediteur}</p>}
          {values.adresseExp && <p className="text-xs text-gray-500">{values.adresseExp}</p>}
          <div className="mt-3 mb-2" />
          {values.destinataire && <p className="text-xs text-gray-600">{values.destinataire}</p>}
          <div className="mt-4" />
          {values.objet && <p className="text-xs font-bold" style={{ color: accent }}>Objet: {values.objet}</p>}
          <div className="mt-3" />
          {values.corps && <p className="text-xs text-gray-700 whitespace-pre-wrap">{values.corps}</p>}
        </div>
      );
    }

    if (template.content?.layout === 'card') {
      return (
        <div ref={previewRef} className="w-full rounded-xl overflow-hidden shadow-lg flex" style={{ background: bg, color: theme?.text || '#fff' }}>
          <div className="w-2/3 p-4 flex flex-col justify-center gap-1">
            <h3 className="font-black text-base" style={{ color: theme?.accent }}>{values.nom || 'Votre Nom'}</h3>
            <p className="text-xs font-semibold opacity-80">{values.fonction || 'Fonction'}</p>
            <div className="mt-2 space-y-0.5">
              {values.phone && <p className="text-[10px] opacity-70">{values.phone}</p>}
              {values.email && <p className="text-[10px] opacity-70">{values.email}</p>}
              {values.adresse && <p className="text-[10px] opacity-70">{values.adresse}</p>}
            </div>
          </div>
          <div className="w-1/3 p-3 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full border-2 flex items-center justify-center" style={{ borderColor: theme?.accent }}>
              {values.photo ? <img src={values.photo} alt="" className="w-full h-full rounded-full object-cover" /> : <User size={20} />}
            </div>
          </div>
        </div>
      );
    }

    if (template.content?.layout === 'poster') {
      return (
        <div ref={previewRef} className="w-full rounded-xl overflow-hidden shadow-lg flex flex-col items-center justify-center p-6" style={{ background: bg, color: theme?.text || '#fff', minHeight: '300px' }}>
          <div className="h-1 w-20 rounded mb-4" style={{ background: theme?.accent }} />
          <h2 className="text-xl font-black text-center">{values.titre || 'TITRE'}</h2>
          {values.theme && <p className="text-sm mt-2 opacity-80 text-center">{values.theme}</p>}
          <div className="h-px w-16 my-3" style={{ background: theme?.accent }} />
          {values.date && <p className="text-xs opacity-70">{values.date}</p>}
          {values.heure && <p className="text-xs opacity-70">{values.heure}</p>}
          {values.lieu && <p className="text-xs opacity-70 mt-1">{values.lieu}</p>}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="fixed inset-0 z-[90] bg-black/70 flex items-end sm:items-center justify-center animate-[fadeIn_0.2s_ease-out]" onClick={onClose}>
      <div
        className="bg-[#0B2E8C] w-full max-w-md max-h-[92vh] rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col animate-[scaleIn_0.3s_ease-out] border border-white/20"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 flex-shrink-0">
          <h2 className="font-black text-lg flex items-center gap-2">
            <Edit3 size={18} className="text-[#F97316]" />
            {template.title}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1 px-4 py-4 space-y-4 pb-[180px]">
          {/* Live preview */}
          <div className="bg-white/5 rounded-2xl p-3">
            {renderPreview()}
          </div>

          {/* Form fields */}
          <div className="space-y-3">
            {template.content?.fields.map((field) => {
              if (field.type === 'image') {
                return (
                  <div key={field.key}>
                    <label className="block text-sm font-semibold mb-1.5">{field.label}</label>
                    <input ref={fileRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    <button
                      onClick={() => fileRef.current?.click()}
                      className="w-full border-2 border-dashed border-white/30 rounded-xl py-3 flex items-center justify-center gap-2 text-white/70 hover:border-[#F97316] transition-colors text-sm"
                    >
                      <Upload size={16} />
                      {values.photo ? 'Photo ajoutée - Changer' : 'Ajouter une photo'}
                    </button>
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

      </div>

      {/* Fixed action buttons - always visible, above bottom nav */}
      <div className="fixed bottom-[85px] left-3 right-3 z-[9999] flex gap-2 bg-white/95 p-2 rounded-xl shadow-xl backdrop-blur">
        <button
          onClick={handleDownloadPDF}
          disabled={downloading}
          className="flex-1 h-[42px] text-[13px] font-bold bg-orange-500 text-white rounded-lg disabled:opacity-50"
        >
          {downloading ? '...' : '\uD83D\uDCE5 PDF'}
        </button>
        <button
          onClick={handleDownloadPNG}
          disabled={downloading}
          className="flex-1 h-[42px] text-[13px] font-bold bg-blue-600 text-white rounded-lg disabled:opacity-50"
        >
          {downloading ? '...' : '\uD83D\uDDBC\uFE0F PNG'}
        </button>
      </div>
    </div>
  );
}

/* ============================================================
   HELPER: Download non-editable template as image
   ============================================================ */
function downloadTemplateImage(id: string, title: string) {
  const svg = document.querySelector(`[data-template-id="${id}"] svg`) as SVGElement | null;
  if (!svg) return;
  const svgData = new XMLSerializer().serializeToString(svg);
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 1131;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const img = new Image();
  img.onload = () => {
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const link = document.createElement('a');
    link.download = `${title}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };
  img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
}
