import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { WifiOff, RefreshCw } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import ToastContainer from '@/components/ToastContainer';
import Accueil from '@/pages/Accueil';
import DevenirExpert from '@/pages/DevenirExpert';
import Experts from '@/pages/Experts';
import Designs from '@/pages/Designs';
import Outils from '@/pages/Outils';
import Regles from '@/pages/Regles';
import Notes from '@/pages/Notes';
import MonEspace from '@/pages/MonEspace';
import Admin from '@/pages/Admin';

function OfflineScreen() {
  const [retrying, setRetrying] = useState(false);

  const handleRetry = () => {
    setRetrying(true);
    setTimeout(() => {
      if (navigator.onLine) {
        window.location.reload();
      } else {
        setRetrying(false);
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#0B2E8C] flex flex-col items-center justify-center px-6 text-white">
      <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mb-6">
        <WifiOff size={40} className="text-[#F97316]" />
      </div>
      <h1 className="text-2xl font-black mb-3 text-center">Pas de connexion</h1>
      <p className="text-white/60 text-center text-sm mb-8 max-w-xs">
        Veuillez vous connecter à internet pour utiliser Mon Métier Propre.
      </p>
      <button
        onClick={handleRetry}
        disabled={retrying}
        className="bg-[#F97316] text-white font-bold rounded-2xl px-8 py-3.5 flex items-center gap-2 active:scale-95 transition-transform disabled:opacity-50"
      >
        {retrying ? (
          <RefreshCw size={20} className="animate-spin" />
        ) : (
          <RefreshCw size={20} />
        )}
        {retrying ? 'Vérification...' : 'Réessayer'}
      </button>
    </div>
  );
}

function App() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }

    const removeBoltBadge = () => {
      const selectors = [
        'a[href*="bolt"]',
        'a[href*="bolt.new"]',
        'div[class*="bolt"]',
        'div[id*="bolt"]',
        '#bolt-badge',
        '[data-bolt-badge]',
        'span[class*="bolt"]',
        'img[src*="bolt"]',
      ];
      selectors.forEach((sel) => {
        document.querySelectorAll(sel).forEach((el) => {
          const text = el.textContent || '';
          const html = (el as HTMLElement).innerHTML || '';
          if (
            text.includes('Made in Bolt') ||
            text.includes('bolt') ||
            html.includes('Made in Bolt') ||
            html.includes('bolt.new')
          ) {
            (el as HTMLElement).remove();
          }
        });
      });
      document.querySelectorAll('*').forEach((el) => {
        if (
          el.textContent === 'Made in Bolt' ||
          (el as HTMLElement).innerHTML?.includes('Made in Bolt')
        ) {
          const parent =
            (el as HTMLElement).closest('a') ||
            (el as HTMLElement).closest('div');
          if (parent && parent.innerHTML.includes('Made in Bolt')) {
            (parent as HTMLElement).style.display = 'none';
          }
        }
      });
    };

    removeBoltBadge();
    const interval = setInterval(removeBoltBadge, 500);
    return () => clearInterval(interval);
  }, []);

  if (!isOnline) {
    return <OfflineScreen />;
  }

  return (
    <BrowserRouter>
      <ToastContainer />
      <Routes>
        <Route path="/" element={<Accueil />} />
        <Route path="/devenir-expert" element={<DevenirExpert />} />
        <Route path="/experts" element={<Experts />} />
        <Route path="/designs" element={<Designs />} />
        <Route path="/outils" element={<Outils />} />
        <Route path="/regles" element={<Regles />} />
        <Route path="/notes" element={<Notes />} />
        <Route path="/mon-espace" element={<MonEspace />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
      <BottomNav />
    </BrowserRouter>
  );
}

export default App;
