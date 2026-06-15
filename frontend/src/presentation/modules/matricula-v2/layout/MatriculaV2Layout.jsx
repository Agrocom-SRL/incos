/**
 * Layout exclusivo de Matrícula v2 — replica el shell del mockup (sidebar + topbar + contenido).
 *
 * WS-A: el ConfigProvider local se elimina — el tema global ya viene de App.jsx
 * (ThemeProvider + AppConfigProvider con buildAntdTheme). El layout solo provee
 * el MotionConfig y la estructura visual del módulo.
 * Los tokens brand-tokens.css ya están en :root (global) y se conmutan con
 * data-theme desde el ThemeProvider global.
 */
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import MatriculaV2Sidebar from '../components/MatriculaV2Sidebar';
import MatriculaV2TopBar from '../components/MatriculaV2TopBar';
import { useMobileNav } from '../hooks/useMobileNav';
import '../theme/matricula-v2.css';

// MotionConfig reducedMotion="user" vive en MainLayout (capa global).
// MatriculaV2Layout no necesita su propio wrapper — heredado del árbol.
function MatriculaV2Shell() {
  const [collapsed, setCollapsed] = useState(false);
  const { isMobile, navOpen, closeNav, toggleNav } = useMobileNav();

  const handleMenuClick = () => {
    if (isMobile) toggleNav();
    else setCollapsed((c) => !c);
  };

  return (
    <div className={`matricula-v2-app${isMobile ? ' matricula-v2-app--mobile' : ''}`}>
      {isMobile && navOpen ? (
        <button
          type="button"
          className="matricula-v2-sidebar-backdrop"
          onClick={closeNav}
          aria-label="Cerrar menú"
        />
      ) : null}
      <MatriculaV2Sidebar
        collapsed={isMobile ? false : collapsed}
        isMobile={isMobile}
        mobileOpen={navOpen}
        onNavigate={closeNav}
      />
      <div className="matricula-v2-app__main">
        <MatriculaV2TopBar onMenuClick={handleMenuClick} />
        <div className="matricula-v2-app__content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

const MatriculaV2Layout = () => <MatriculaV2Shell />;

export default MatriculaV2Layout;
