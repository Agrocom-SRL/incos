/**
 * getBecaIcon - Icono representativo de una beca/descuento.
 *
 * El catálogo no tiene campo de categoría, así que el icono se decide por
 * palabras clave sobre código + nombre (primer match gana; el orden importa:
 * "Promoción Institucional" debe caer en promoción, no en institucional).
 * Fallback: GiftOutlined.
 */

import {
  FileProtectOutlined,
  GiftOutlined,
  ReadOutlined,
  SoundOutlined,
  StarOutlined,
  TeamOutlined,
  TrophyOutlined,
} from '@ant-design/icons';

const KEYWORD_ICONS = [
  { keywords: ['rendimiento', 'excelencia', 'mejor promedio'], Icon: TrophyOutlined },
  { keywords: ['feria', '1er lugar', 'primer lugar'], Icon: StarOutlined },
  { keywords: ['promoción', 'promocion', 'difusión', 'difusion'], Icon: SoundOutlined },
  { keywords: ['razón social', 'razon social', 'social', 'vulnerable'], Icon: TeamOutlined },
  { keywords: ['convenio', 'institucional'], Icon: FileProtectOutlined },
  { keywords: ['académic', 'academic', 'estudio'], Icon: ReadOutlined },
];

export const getBecaIcon = (beca) => {
  const texto = `${beca?.codigo || ''} ${beca?.nombre || ''}`.toLowerCase();
  const match = KEYWORD_ICONS.find(({ keywords }) => keywords.some((k) => texto.includes(k)));
  const Icon = match?.Icon || GiftOutlined;
  return <Icon />;
};
