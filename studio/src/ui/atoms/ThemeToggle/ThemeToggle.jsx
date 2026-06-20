/**
 * ThemeToggle — alterna light/dark. Compone IconButton + useTheme.
 * SRP: solo traduce el estado de tema a un control; la lógica vive en useTheme.
 */
import { BulbOutlined, BulbFilled } from '@ant-design/icons';
import { useTheme } from '@ds/theme/useTheme';
import { useTranslation } from '@lib/i18n/useTranslation';
import { activeBrand } from '@config/brand';
import { IconButton } from '../IconButton/IconButton';

export function ThemeToggle() {
  const { mode, toggle } = useTheme();
  const { t } = useTranslation();

  if (!activeBrand.features.darkMode) return null;

  const isDark = mode === 'dark';
  return (
    <IconButton
      icon={isDark ? <BulbFilled /> : <BulbOutlined />}
      label={isDark ? t('topbar.themeLight') : t('topbar.themeDark')}
      onClick={toggle}
    />
  );
}

export default ThemeToggle;
