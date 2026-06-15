/**
 * Layout exclusivo de Matrícula v2 — replica el shell del mockup (sidebar + topbar + contenido).
 */
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { ConfigProvider, theme as antTheme } from 'antd';
import { MotionConfig } from 'motion/react';
import esES from 'antd/locale/es_ES';
import MatriculaV2Sidebar from '../components/MatriculaV2Sidebar';
import MatriculaV2TopBar from '../components/MatriculaV2TopBar';
import { useMobileNav } from '../hooks/useMobileNav';
import { MatriculaV2ThemeProvider, useTheme } from '../hooks/useTheme';
import { buildIncosAntdTheme } from '../theme/incosTheme';
import '../theme/matricula-v2-theme-vars.css';
import '../theme/matricula-v2.css';

function MatriculaV2Shell() {
  const [collapsed, setCollapsed] = useState(false);
  const { theme } = useTheme();
  const { isMobile, navOpen, closeNav, toggleNav } = useMobileNav();

  const handleMenuClick = () => {
    if (isMobile) toggleNav();
    else setCollapsed((c) => !c);
  };

  // Tokens AntD derivados del tema canónico (incosTheme.js), no hex en JSX.
  const antdTheme = buildIncosAntdTheme(theme);

  return (
    <ConfigProvider
      locale={esES}
      theme={{
        algorithm: theme === 'dark' ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
        ...antdTheme,
      }}
    >
      <MotionConfig reducedMotion="user">
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
      </MotionConfig>
    </ConfigProvider>
  );
};

const MatriculaV2Layout = () => (
  <MatriculaV2ThemeProvider>
    <MatriculaV2Shell />
  </MatriculaV2ThemeProvider>
);

export default MatriculaV2Layout;
