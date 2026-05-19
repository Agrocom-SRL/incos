/**
 * Layout exclusivo de Matrícula v2 — replica el shell del mockup (sidebar + topbar + contenido).
 */
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { ConfigProvider, theme as antTheme } from 'antd';
import esES from 'antd/locale/es_ES';
import MatriculaV2Sidebar from '../components/MatriculaV2Sidebar';
import MatriculaV2TopBar from '../components/MatriculaV2TopBar';
import { MatriculaV2ThemeProvider, useTheme } from '../hooks/useTheme';
import '../theme/matricula-v2-theme-vars.css';
import '../theme/matricula-v2.css';

function MatriculaV2Shell() {
  const [collapsed, setCollapsed] = useState(false);
  const { theme } = useTheme();

  return (
    <ConfigProvider
      locale={esES}
      theme={{
        algorithm: theme === 'dark' ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
        token: {
          colorPrimary: '#0a6532',
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
        },
      }}
    >
      <div className="matricula-v2-app">
        <MatriculaV2Sidebar collapsed={collapsed} />
        <div className="matricula-v2-app__main">
          <MatriculaV2TopBar onMenuClick={() => setCollapsed((c) => !c)} />
          <div className="matricula-v2-app__content">
            <Outlet />
          </div>
        </div>
      </div>
    </ConfigProvider>
  );
}

const MatriculaV2Layout = () => (
  <MatriculaV2ThemeProvider>
    <MatriculaV2Shell />
  </MatriculaV2ThemeProvider>
);

export default MatriculaV2Layout;
