/**
 * TopBar — barra superior del shell (organismo).
 * Compone: trigger de menú + buscador + utilidades + chip de usuario.
 * El logo NO va aquí (vive en el sidebar). Datos por hooks (DIP).
 */
import { MenuOutlined, SearchOutlined } from '@ant-design/icons';
import { Input } from 'antd';
import { useTranslation } from '@lib/i18n/useTranslation';
import { useSession } from '@lib/session/useSession';
import { IconButton } from '@ui/atoms/IconButton/IconButton';
import { HeaderUtilities } from '@ui/molecules/HeaderUtilities/HeaderUtilities';
import { UserChip } from '@ui/molecules/UserChip/UserChip';
import './TopBar.css';

export function TopBar({ onMenuClick }) {
  const { t } = useTranslation();
  const { user, term } = useSession();

  return (
    <header className="ds-topbar">
      <IconButton icon={<MenuOutlined />} label="Menu" onClick={onMenuClick} className="ds-topbar__trigger" />
      <Input
        className="ds-topbar__search"
        prefix={<SearchOutlined />}
        placeholder={t('topbar.searchPlaceholder')}
        allowClear
      />
      <div className="ds-topbar__spacer" />
      <div className="ds-topbar__end">
        <HeaderUtilities notificationCount={3} />
        <span className="ds-topbar__divider" aria-hidden />
        <UserChip name={user.name} meta={t('topbar.term', { year: term.year })} />
      </div>
    </header>
  );
}

export default TopBar;
