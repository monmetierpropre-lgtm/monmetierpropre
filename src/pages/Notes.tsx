import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, ChevronDown, ChevronRight, Check, Share2, BookOpen } from 'lucide-react';

type Chapitre = { t: string; c: string };
type Metier = { id: string; titre: string; image: string; chapitres: Chapitre[] };

const METIERS_COMPLETS: Metier[] = [
  { id: 'plombier', titre: '1. PLOMBIER', image: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=600', chapitres: [
    { t: 'Bases du Metier', c: 'Un bon plombier ne bouche pas seulement les fuites. Diametres: 12/17 lavabo, 15/21 evier, 20/27 generale. Toujours purger air.' },
    { t: 'Astuces Pro', c: '1. Photo avant/apres = confiance. 2. Propose filtre anti-calcaire = 50$ bonus. 3. Laisse autocollant avec ton numero.' },
    { t: 'Erreurs a eviter', c: 'Ne jamais dire c est rien. Ne laisser eau sale. Ne facturer sans expliquer panne simplement.' },
    { t: 'Securite', c: 'Gants latex, lunettes, coupe eau generale, verifie manometre.' },
    { t: 'Respect Equipe', c: 'Si tu travailles avec apprenti, explique, ne crie pas. Dis on va faire ensemble.' },
    { t: 'Conseil Devis', c: 'Donne 2 prix: rapide et durable. Client choisit et te respecte.' },
    { t: 'Esprit equipe', c: 'Avant chantier: 1 minute concentration. Demande: Tout le monde va bien ?' },
  ]},
  { id: 'carreleur', titre: '2. CARRELEUR', image: 'https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?w=600', chapitres: [
    { t: 'Bases', c: 'Toujours partir du centre, pas du mur. Niveau laser, croisillons 2mm. 48h avant marcher.' },
    { t: 'Astuces Pro', c: 'Mouille carreaux 10 min avant. Melange colle 3 min. Propose plinthes = +20% facture.' },
    { t: 'Erreurs', c: 'Ne carrele jamais sur sol poussiereux. Ne marche pas sur colle fraiche.' },
    { t: 'Securite', c: 'Genouilleres obligatoires, masque coupe, gants. Protege tes genoux.' },
    { t: 'Respect Client', c: 'Couvre meubles avec bache. Enleve chaussures. Dis Merci de votre confiance.' },
  ]},
  { id: 'plafonneur', titre: '3. PLAFONNEUR', image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600', chapitres: [
    { t: 'Bases', c: 'Enduit 2 passes de 3mm. Taloche inox, mouvements circulaires. Temperature 15-25C.' },
    { t: 'Astuces', c: 'Humidifie mur avant. Lave outils toutes les 30 min. Lampe rasante pour voir vagues.' },
    { t: 'Respect', c: 'Ne critique jamais travail macon devant client. Dis on va rendre ca magnifique.' },
  ]},
  { id: 'macon', titre: '4. MACON', image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600', chapitres: [
    { t: 'Bases', c: 'Fondation 80cm minimum, beton 350kg/m3. Respecte fil a plomb. 1cm en bas = 10cm en haut.' },
    { t: 'Astuces', c: 'Arrose briques avant pose. Beton: 1 ciment, 2 sables, 3 graviers. Coffrage huile.' },
    { t: 'Respect Equipe', c: 'Aime ton manoeuvre. Partage eau, partage repas. Merci chaque soir.' },
  ]},
  { id: 'electricien', titre: '5. ELECTRICIEN', image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600', chapitres: [
    { t: 'Bases', c: 'Toujours couper general + tester avec VAT. Norme: 6 prises max par circuit 2.5mm2.' },
    { t: 'Respect', c: 'Explique pourquoi tu coupes courant. Montre une fois, laisse faire, corrige avec douceur.' },
  ]},
  { id: 'peintre', titre: '6. PEINTRE', image: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=600', chapitres: [
    { t: 'Bases', c: 'Peinture 80% preparation, 20% application. Poncage grain 120, sous-couche, 2 couches croisees.' },
    { t: 'Amour du Travail', c: 'Musique douce pendant peinture. Equipe qui rit peint mieux. Bache partout.' },
  ]},
  { id: 'menuisier', titre: '7. MENUISIER', image: 'https://images.unsplash.com/photo-1416339442236-8ceb164046f8?w=600', chapitres: [
    { t: 'Bases', c: 'Precision 1mm. Mesure 2 fois, coupe 1 fois. Vernis 3 couches. Sens du bois important.' },
  ]},
  { id: 'securite', titre: '8. SECURITE', image: 'https://images.unsplash.com/photo-1504328345606-18bbc504a893?w=600', chapitres: [
    { t: 'Regle d Or', c: '1. Salue chaque matin. 2. Ne crie jamais. 3. Partage outils. 4. Si fatigue, pause.' },
    { t: 'Equipe avec Amour', c: 'Avant chantier: 2 min reunion. Apres chantier: Qu est-ce qu on a bien fait ? Chef qui aime = equipe 10 ans.' },
  ]},
];

export default function Notes()
