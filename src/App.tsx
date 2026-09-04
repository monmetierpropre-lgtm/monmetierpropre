import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import BottomNav from '@/components/BottomNav';
import ToastContainer from '@/components/ToastContainer';
import Accueil from '@/pages/Accueil';
import DevenirExpert from '@/pages/DevenirExpert';
import Experts from '@/pages/Experts';
import Designs from '@/pages/Designs';
import Outils from '@/pages/Outils';
import Regles from '@/pages/Regles';
import MonEspace from '@/pages/MonEspace';
import Admin from '@/pages/Admin';

function App() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // PWA SW registration handled by vite-plugin-pwa; fallback silent
      });
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
        <Route path="/mon-espace" element={<MonEspace />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
      <BottomNav />
    </BrowserRouter>
  );
}

export default App;
