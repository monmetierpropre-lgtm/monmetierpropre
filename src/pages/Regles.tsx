import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Logo from '@/components/Logo';

export default function Regles() {
  const navigate = useNavigate();

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

        <div className="bg-white/10 rounded-2xl p-6 space-y-4">
          <h3 className="font-bold text-lg text-[#F97316]">Règles de la plateforme</h3>

          <div className="space-y-3 text-sm text-white/80">
            <div>
              <p className="font-bold text-white">1. Inscription des experts</p>
              <p>Tout technicien peut s'inscrire en remplissant le formulaire "Devenir Expert". Chaque demande est examinée par l'administrateur avant approbation.</p>
            </div>

            <div>
              <p className="font-bold text-white">2. Code Mon Métier</p>
              <p>Chaque expert approuvé reçoit un code unique (format MM-XXXX). Ce code identifie l'expert sur la plateforme.</p>
            </div>

            <div>
              <p className="font-bold text-white">3. Contact entre clients et experts</p>
              <p>Les clients peuvent contacter directement les experts via WhatsApp. Les échanges se font en dehors de la plateforme.</p>
            </div>

            <div>
              <p className="font-bold text-white">4. Mon Espace</p>
              <p>Chaque expert peut gérer son profil depuis "Mon Espace" en utilisant son numéro WhatsApp. Il peut modifier sa photo, ses informations et ses travaux.</p>
            </div>

            <div>
              <p className="font-bold text-white">5. Administration</p>
              <p>L'administrateur gère les demandes, les experts approuvés, les paramètres et les mises à jour de l'application.</p>
            </div>

            <div>
              <p className="font-bold text-white">6. Utilisation des outils</p>
              <p>Les outils (calculatrice, jeux, agenda, coffre secret) sont disponibles gratuitement pour tous les utilisateurs.</p>
            </div>

            <div>
              <p className="font-bold text-white">7. Modèles et designs</p>
              <p>Tous les modèles sont gratuits. Vous pouvez les modifier et les exporter en PDF.</p>
            </div>

            <div>
              <p className="font-bold text-white">8. Respect et professionnalisme</p>
              <p>Tout utilisateur s'engage à utiliser la plateforme de manière professionnelle et respectueuse.</p>
            </div>
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
          <p className="mt-1">Version 1.0.0</p>
        </div>
      </div>
    </div>
  );
}
