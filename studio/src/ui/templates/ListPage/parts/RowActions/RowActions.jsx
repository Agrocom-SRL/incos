/**
 * RowActions — presentación HOMOGÉNEA de acciones de fila/tarjeta, data-driven.
 *
 * Componente GENÉRICO del template: recibe las acciones declaradas como DATA y
 * decide, según la densidad publicada por `ListDataView` (`useListDensity`),
 * cuáles se muestran como botón y cuáles se repliegan al menú `⋮`. El feature solo
 * declara descriptores; la regla de promoción vive aquí, igual para todo listado.
 *
 * CONTRATO — descriptor de acción:
 *   {
 *     key: string,            // id estable de la acción
 *     icon: React.ReactNode,  // icono (lo importa el feature, no este genérico)
 *     labelKey: string,       // clave i18n del rótulo
 *     tone?: string,          // tono del IconButton visible (info|warning|...)
 *     primary?: number,       // orden de promoción a botón (1 = primero, 2 = segundo);
 *                             //   sin `primary` → siempre en ⋮
 *     danger?: boolean,       // marca el item del menú como destructivo
 *     divider?: boolean,      // inserta un separador ANTES de este item en el menú
 *     onClick: (row) => void, // handler (recibe la fila)
 *   }
 *
 * Reglas por densidad:
 *   - 'full':    botones = primary 1 y 2; el resto en ⋮.
 *   - 'medium':  botón = solo primary 1; las demás (incl. primary 2) en ⋮.
 *   - 'compact': solo ⋮ con TODAS las acciones.
 *
 * @param {{
 *   actions: Array<object>,        // descriptores (ver contrato)
 *   row: object,                   // fila a la que aplican
 *   className?: string,            // clase del contenedor (la card pasa la suya)
 *   primaryClassName?: string,     // clase del 1.er botón (estilo de la card)
 * }} props
 */
import { MoreOutlined } from '@ant-design/icons';
import { Dropdown } from 'antd';
import { IconButton } from '@ui/atoms/IconButton/IconButton';
import { useTranslation } from '@lib/i18n/useTranslation';
import { useListDensity } from '../../ListDensityContext';
import './RowActions.css';

/** Cuántos botones visibles admite cada densidad (por orden de `primary`). */
const VISIBLE_BY_DENSITY = { full: 2, medium: 1, compact: 0 };

export function RowActions({ actions = [], row, className = 'ds-row-actions', primaryClassName }) {
  const { t } = useTranslation();
  const density = useListDensity();
  const maxVisible = VISIBLE_BY_DENSITY[density] ?? 2;

  // Promovibles: tienen `primary` y entran dentro del cupo de la densidad,
  // ordenadas por su número de promoción.
  const promotable = actions
    .filter((a) => typeof a.primary === 'number')
    .sort((a, b) => a.primary - b.primary);

  const visible = promotable.filter((a) => a.primary <= maxVisible);
  const visibleKeys = new Set(visible.map((a) => a.key));

  // Menú ⋮: todo lo que no se mostró como botón, en el orden original.
  const overflow = actions.filter((a) => !visibleKeys.has(a.key));

  const stop = (e) => e.stopPropagation();

  const menuItems = overflow.flatMap((a) => {
    const item = {
      key: a.key,
      icon: a.icon,
      label: t(a.labelKey),
      danger: a.danger,
      onClick: ({ domEvent }) => {
        domEvent?.stopPropagation();
        a.onClick?.(row);
      },
    };
    return a.divider ? [{ type: 'divider', key: `${a.key}-div` }, item] : [item];
  });

  return (
    <div className={className} onClick={stop} onKeyDown={stop}>
      {visible.map((a, i) => (
        <IconButton
          key={a.key}
          tone={a.tone}
          icon={a.icon}
          label={t(a.labelKey)}
          className={i === 0 ? primaryClassName : undefined}
          onClick={() => a.onClick?.(row)}
        />
      ))}
      {menuItems.length > 0 ? (
        <Dropdown menu={{ items: menuItems }} trigger={['click']} placement="bottomRight">
          <span>
            <IconButton tone="muted" icon={<MoreOutlined />} label={t('common.moreActions')} />
          </span>
        </Dropdown>
      ) : null}
    </div>
  );
}

export default RowActions;
