/**
 * HeaderUtilities — grupo de utilidades del topbar (ayuda, idioma, notificaciones, tema).
 * Molécula: compone átomos; sin lógica propia más allá de etiquetas i18n.
 */
import { QuestionCircleOutlined, BellOutlined } from '@ant-design/icons';
import { IconButton } from '@ui/atoms/IconButton/IconButton';
import { LanguageSwitch } from '@ui/atoms/LanguageSwitch/LanguageSwitch';
import { ThemeToggle } from '@ui/atoms/ThemeToggle/ThemeToggle';
import { useTranslation } from '@lib/i18n/useTranslation';

export function HeaderUtilities({ notificationCount = 0 }) {
  const { t } = useTranslation();
  return (
    <div className="ds-topbar__utilities">
      <IconButton icon={<QuestionCircleOutlined />} label={t('topbar.help')} />
      <LanguageSwitch />
      <IconButton
        icon={<BellOutlined />}
        label={t('topbar.notifications')}
        badge={notificationCount > 0 ? notificationCount : undefined}
      />
      <ThemeToggle />
    </div>
  );
}

export default HeaderUtilities;
