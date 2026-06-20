/**
 * ListFacets — fila de filtros por faceta (chips) genérica.
 * Compone el átomo Chip; el chip "Todas" resetea el filtro. Datos por props.
 * Generaliza sections/CareerChips: el accessor de la faceta vive en la config.
 */
import { Chip } from '@ui/atoms/Chip/Chip';
import { useTranslation } from '@lib/i18n/useTranslation';
import './ListFacets.css';

export function ListFacets({ facets, value, onChange, allLabelKey }) {
  const { t } = useTranslation();
  const total = facets.reduce((acc, f) => acc + f.count, 0);

  return (
    <div className="mat-chips">
      <Chip
        label={t(allLabelKey)}
        count={total}
        active={!value}
        showDot={false}
        onClick={() => onChange(null)}
      />
      {facets.map((f) => (
        <Chip
          key={f.id}
          label={f.label}
          count={f.count}
          color={f.color}
          active={value === f.id}
          onClick={() => onChange(value === f.id ? null : f.id)}
        />
      ))}
    </div>
  );
}

export default ListFacets;
