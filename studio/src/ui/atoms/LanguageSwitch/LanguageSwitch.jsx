/**
 * LanguageSwitch — cambia el idioma activo. Compone IconButton + Dropdown.
 * SRP: traduce la lista de locales a un menú; la lógica vive en useTranslation.
 */
import { GlobalOutlined } from '@ant-design/icons';
import { Dropdown } from 'antd';
import { useTranslation } from '@lib/i18n/useTranslation';
import { availableLocales } from '@lib/i18n/locales';
import { activeBrand } from '@config/brand';
import { IconButton } from '../IconButton/IconButton';

const LOCALE_LABELS = { es: 'Español', en: 'English' };

export function LanguageSwitch() {
  const { locale, setLocale, t } = useTranslation();

  if (!activeBrand.features.languageSwitch) return null;

  const items = availableLocales.map((code) => ({
    key: code,
    label: LOCALE_LABELS[code] ?? code.toUpperCase(),
  }));

  return (
    <Dropdown
      trigger={['click']}
      menu={{
        items,
        selectable: true,
        selectedKeys: [locale],
        onClick: ({ key }) => setLocale(key),
      }}
    >
      <span>
        <IconButton icon={<GlobalOutlined />} label={t('topbar.language')} />
      </span>
    </Dropdown>
  );
}

export default LanguageSwitch;
