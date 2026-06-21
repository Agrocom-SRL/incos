/**
 * useResidualExpandable — construye el objeto `expandable` de la `<Table>` que
 * expone, en una fila collapse (`ResidualRow`), las columnas que NO caben en el
 * ancho medido (las que `useResponsiveTable` movió a `hiddenColumns`).
 *
 * SRP: este hook resuelve SOLO la API de expansión (fila residual + icono toggle
 * con su a11y/i18n). Decidir qué columnas se ocultan es de `useResponsiveTable`;
 * componer la `<Table>` es de `ListDataView`.
 *
 * Devuelve `undefined` (no `{}`) cuando no hay columnas ocultas, para que la
 * `<Table>` reciba `expandable={undefined}` y no pinte la columna de toggle.
 *
 * @param {{ hiddenColumns: object[], getRowKey: (row: object) => React.Key }} args
 * @returns {object|undefined} objeto `expandable` de AntD, o `undefined`.
 */
import { RightOutlined } from '@ant-design/icons';
import { useTranslation } from '@lib/i18n/useTranslation';
import { ResidualRow } from '../parts/ResidualRow/ResidualRow';

export function useResidualExpandable({ hiddenColumns, getRowKey }) {
  const { t } = useTranslation();

  const hiddenCount = hiddenColumns.length;
  if (hiddenCount === 0) return undefined;

  return {
    expandedRowRender: (row) => (
      <div id={`residual-${getRowKey(row)}`}>
        <ResidualRow hiddenColumns={hiddenColumns} row={row} />
      </div>
    ),
    rowExpandable: () => true,
    columnWidth: 48, // ancho de la columna de toggle (layout), no breakpoint
    // El toggle es el ÚNICO acceso a las columnas plegadas en ancho estrecho:
    // touch target ≥44px (CSS), tinte de marca SUTIL cuando hay campos ocultos
    // (descubribilidad sin caja ni badge), y aria-expanded/-controls para lectores;
    // el conteo se comunica al lector por aria-label, no con un badge visual que
    // ensucie la fila. Icono PROPIO (chevron que rota), NO el glifo +/- nativo de
    // AntD (roto): `mat-expand` no reusa `.ant-table-row-expand-icon` para no
    // heredar sus pseudo-elementos; el chevron va explícito dentro del button.
    expandIcon: ({ expanded, onExpand, record }) => (
      <button
        type="button"
        className={`mat-expand mat-expand--has-hidden ${expanded ? 'mat-expand--open' : ''}`}
        aria-label={t(expanded ? 'common.hiddenFieldsExpanded' : 'common.hiddenFields', {
          count: hiddenCount,
        })}
        aria-expanded={expanded}
        aria-controls={`residual-${getRowKey(record)}`}
        onClick={(e) => {
          e.stopPropagation();
          onExpand(record, e);
        }}
      >
        <RightOutlined className="mat-expand__chevron" aria-hidden />
      </button>
    ),
  };
}

export default useResidualExpandable;
