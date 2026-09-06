import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen } from 'lucide-react';
import Logo from '@/components/Logo';
import { useReglesText } from '@/lib/hooks';

const defaultRules = [
  { title: '1. Inscription des experts', text: 'Tout technicien peut s\'inscrire en remplissant le formulaire "Devenir Expert". Chaque demande est examinée par l\'administrateur avant approbation.' },
  { title: '2. Code Mon Métier', text: 'Chaque expert approuvé reçoit un code unique (format MM-XXXX). Ce code identifie l\'expert sur la plateforme.' },
  { title: '3. Contact entre clients et experts', text: 'Les clients peuvent contacter directement les experts via WhatsApp. Les échanges se font en dehors de la plateforme.' },
  { title: '4. Mon Espace', text: 'Chaque expert peut gérer son profil depuis "Mon Espace" en utilisant son numéro WhatsApp. Il peut modifier sa photo, ses informations et ses travaux.' },
  { title: '5. Administration', text: 'L\'administrateur gère les demandes, les experts approuvés, les paramètres et les mises à jour de l\'application.' },
  { title: '6. Utilisation des outils', text: 'Les outils (calculatrice, jeux, agenda, coffre secret) sont disponibles gratuitement pour tous les utilisateurs.' },
  { title: '7. Modèles et designs', text: 'Tous les modèles sont gratuits. Vous pouvez les modifier : Cliquez sur "Modifier", insérez vos informations, cliquez sur "Télécharger", une page va s\'ouvrir, appuyez longuement sur l\'image et "Enregistrer l\'image" dans votre galerie.' },
  { title: '8. Respect et professionnalisme', text: 'Tout utilisateur s\'engage à utiliser la plateforme de manière professionnelle et respectueuse.' },
];

export default function Regles() {
  const navigate = useNavigate();
  const remoteText = useReglesText();

  let rules = defaultRules;
  if (remoteText) {
    try {
      const parsed = JSON.parse(remoteText);
      if (Array.isArray(parsed) && parsed.length > 0) {
        rules = parsed;
      }
    } catch {
      if (remoteText.trim()) {
        rules = [{ title: 'Règles de la plateforme', text: remoteText }];
      }
    }
  }

  return (
    <div className="min-h-screen bg-[#0B2E8C] text-white pb-24">
      <header className="sticky top-0 z-40 bg-[#0B2E8C] border-b border-white/10">
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={() => navigate('/')} className="p-2 rounded-xl hover:bg-white/10 transition-colors">
            <ArrowLeft size={22} />
          </button>
          <h1 className="text-xl font-black">Règles</h1>
        </div>
      </header>

      <div className="px-4 py-6 max-w-md mx-auto space-y-6">
        <div className="flex flex-col items-center gap-3 mb-4">
          <Logo size={80} />
          <h2 className="text-2xl font-black">Mon Métier</h2>
        </div>

        <button
          onClick={() => navigate('/notes')}
          className="w-full bg-gradient-to-r from-[#F97316] to-amber-500 text-white font-bold text-[15px] py-4 px-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition-transform"
        >
          <BookOpen size={20} />
          Notes / Formations Techniciens
        </button>

        <div className="bg-white/10 rounded-2xl p-6 space-y-4">
          <h3 className="font-bold text-lg text-[#F97316]">Règles de la plateforme</h3>

          <div className="space-y-3 text-sm text-white/80">
            {rules.map((rule, i) => (
              <div key={i}>
                <p className="font-bold text-white">{rule.title}</p>
                <p>{rule.text}</p>
              </div>
            ))}
          </div>
        </div>

        <a
          href="https://wa.me/243813971187"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full bg-orange-500 text-white font-bold text-[15px] leading-tight py-4 px-4 rounded-2xl whitespace-normal text-center line-clamp-2 shadow-lg active:scale-[0.98] transition-transform"
        >
          Besoin d'une application pour gérer votre activité? Cliquez ici pour commander maintenant
        </a>

        <div className="text-center text-xs text-white/40 pt-4">
          <p>Mon Métier - Connecter Clients et techniciens ou Experts</p>
          <p className="mt-1">Version 1.0.26</p>
        </div>
      </div>
    </div>
  );
}
