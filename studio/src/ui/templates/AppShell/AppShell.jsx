/**
 * AppShell — plantilla del shell de la aplicación (sidebar + topbar + contenido).
 *
 * Responsabilidad ÚNICA: componer el chrome y exponer el área de contenido (Outlet).
 * Gobierna el colapso (desktop) y el drawer (móvil) delegando en useMobileNav.
 * No conoce features: cualquier página se renderiza dentro vía router.
 */
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '@ui/organisms/Sidebar/Sidebar';
import { TopBar } from '@ui/organisms/TopBar/TopBar';
import { useMobileNav } from '@lib/hooks/useMobileNav';
import './AppShell.css';

export function AppShell() {
  const [collapsed, setCollapsed] = useState(false);
  const { isMobile, navOpen, toggleNav, closeNav } = useMobileNav();

  const handleMenuClick = () => {
    if (isMobile) toggleNav();
    else setCollapsed((c) => !c);
  };

  return (
    <div className={`ds-shell${isMobile ? ' ds-shell--mobile' : ''}`}>
      {isMobile && navOpen ? (
        <button type="button" className="ds-shell__backdrop" onClick={closeNav} aria-label="Cerrar menú" />
      ) : null}

      <Sidebar
        collapsed={isMobile ? false : collapsed}
        isMobile={isMobile}
        mobileOpen={navOpen}
        onNavigate={closeNav}
      />

      <div className="ds-shell__main">
        <TopBar onMenuClick={handleMenuClick} />
        <main className="ds-shell__content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AppShell;
