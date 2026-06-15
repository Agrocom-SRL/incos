/**
 * AppTopBar — organismo del topbar global (shell principal y matricula-v2).
 *
 * Orden del contrato (REVAMP-SHELL-CONTRACT.md):
 *   trigger → search → spacer → [utilities | compactMenu] + perfil
 *
 * Replica EXACTAMENTE MatriculaV2TopBar con clases app-topbar__* (neutras).
 * MatriculaV2TopBar pasa a ser un wrapper delgado de este componente.
 *
 * Dependencias:
 *   - useMediaQuery (presentation/hooks) para variante compacta < 900px
 *   - HeaderUtilities (3 iconos + ThemeToggle)
 *   - HeaderCompactMenu (Dropdown MoreOutlined)
 *   - UserProfileChip (nombre + gestión + avatar + logout)
 *
 * @module presentation/components/organisms/Header/AppTopBar
 * @level organismo
 *
 * @param {{ onMenuClick: () => void, collapsed?: boolean }} props
 */

import { Button, Input } from 'antd';
import { MenuOutlined, SearchOutlined } from '@ant-design/icons';
import { useMediaQuery } from '@presentation/hooks/useMediaQuery';
import HeaderUtilities from '@molecules/HeaderUtilities';
import HeaderCompactMenu from '@molecules/HeaderCompactMenu';
import UserProfileChip from '@molecules/UserProfileChip';

const AppTopBar = ({ onMenuClick, collapsed }) => {
  // Variante compacta: colapsar utilities en MoreOutlined < 900px (igual que mv2)
  const compactUtilities = useMediaQuery('(max-width: 900px)');

  return (
    <header className="app-topbar">
      {/* Trigger hamburguesa — alterna el colapso del sidebar */}
      <Button
        type="text"
        icon={<MenuOutlined />}
        onClick={onMenuClick}
        className="app-topbar__menu"
        aria-label="Alternar menú"
        aria-expanded={!collapsed}
      />

      {/* Buscador global — igual que .matricula-v2-topbar__search */}
      <Input
        prefix={<SearchOutlined style={{ color: 'var(--text-soft)' }} />}
        placeholder="Buscar estudiantes, códigos, carreras..."
        className="app-topbar__search"
        allowClear
      />

      {/* Spacer flexible */}
      <div className="app-topbar__spacer" />

      {/* Zona derecha — utilities + perfil */}
      <div className="app-topbar__end">
        {compactUtilities ? (
          <HeaderCompactMenu />
        ) : (
          <HeaderUtilities />
        )}

        {/* Perfil del usuario — nombre + gestión + avatar iniciales + logout */}
        <UserProfileChip />
      </div>
    </header>
  );
};

export default AppTopBar;
