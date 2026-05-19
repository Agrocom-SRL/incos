/**
 * Layout exclusivo de Matrícula v2 — replica el shell del mockup (sidebar + topbar + contenido).
 */
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { ConfigProvider, theme as antTheme } from 'antd';
import esES from 'antd/locale/es_ES';
import MatriculaV2Sidebar from '../components/MatriculaV2Sidebar';
import MatriculaV2TopBar from '../components/MatriculaV2TopBar';
import { useMobileNav } from '../hooks/useMobileNav';
import { MatriculaV2ThemeProvider, useTheme } from '../hooks/useTheme';
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

  const tooltipBg = theme === 'dark' ? '#1a5239' : '#0a5028';
  const tooltipFg = theme === 'dark' ? '#e8f0ea' : '#f0f5f2';

  return (
    <ConfigProvider
      locale={esES}
      theme={{
        algorithm: theme === 'dark' ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
        token: {
          colorPrimary: '#0a6532',
          colorInfo: theme === 'dark' ? '#60a5fa' : '#2f7fb8',
          colorWarning: theme === 'dark' ? '#fbbf24' : '#d97706',
          colorBgContainer: theme === 'dark' ? '#102019' : '#fafcfb',
          colorBgElevated: theme === 'dark' ? '#102019' : '#fafcfb',
          colorText: theme === 'dark' ? '#e8f0ea' : '#0a1f15',
          colorTextSecondary: theme === 'dark' ? '#8aa094' : '#5e6c64',
          colorBorder: theme === 'dark' ? '#1d3528' : '#c8d6cc',
          borderRadius: 8,
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
          fontSize: 14,
        },
        components: {
          Table: {
            headerBg: 'transparent',
            headerColor: 'inherit',
            headerSplitColor: 'transparent',
          },
          Select: {
            optionSelectedBg: theme === 'dark' ? '#133224' : '#e8f4ec',
          },
          Dropdown: {
            colorBgElevated: theme === 'dark' ? '#102019' : '#fafcfb',
          },
          Tooltip: {
            colorBgSpotlight: tooltipBg,
            colorTextLightSolid: tooltipFg,
            borderRadius: 8,
            fontSize: 12,
          },
        },
      }}
    >
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
    </ConfigProvider>
  );
};

const MatriculaV2Layout = () => (
  <MatriculaV2ThemeProvider>
    <MatriculaV2Shell />
  </MatriculaV2ThemeProvider>
);

export default MatriculaV2Layout;
