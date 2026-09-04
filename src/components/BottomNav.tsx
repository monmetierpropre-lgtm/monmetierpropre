import { NavLink, useNavigate } from 'react-router-dom';
import { Home, UserPlus, Users, Layout, Wrench, BookOpen, User } from 'lucide-react';

const navItems = [
  { to: '/', label: 'Accueil', icon: Home },
  { to: '/devenir-expert', label: 'Expert', icon: UserPlus },
  { to: '/experts', label: 'Experts', icon: Users },
  { to: '/designs', label: 'Designs', icon: Layout },
  { to: '/outils', label: 'Outils', icon: Wrench },
  { to: '/regles', label: 'Règles', icon: BookOpen },
];

export default function BottomNav() {
  const navigate = useNavigate();

  return (
    <nav className="bottom-nav-fixed shadow-2xl border-t border-white/10">
      <div className="flex justify-around items-center h-full max-w-md mx-auto px-0.5 overflow-x-auto no-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center flex-shrink-0 py-1.5 px-1 min-w-[44px] transition-all ${
                  isActive ? 'text-[#F97316]' : 'text-white/70'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={20}
                    strokeWidth={isActive ? 2.5 : 2}
                    className="mb-0.5"
                  />
                  <span className="text-[9px] font-bold leading-tight text-center whitespace-nowrap">
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
        <button
          onClick={() => navigate('/mon-espace')}
          className="flex flex-col items-center justify-center flex-shrink-0 py-1.5 px-1 min-w-[44px] text-white/70 hover:text-[#F97316] transition-colors"
        >
          <User size={20} strokeWidth={2} className="mb-0.5" />
          <span className="text-[9px] font-bold leading-tight whitespace-nowrap">Mon Espace</span>
        </button>
      </div>
    </nav>
  );
}
