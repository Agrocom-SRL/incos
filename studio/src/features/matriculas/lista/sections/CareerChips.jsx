/**
 * CareerChips — fila de filtros por carrera (organismo local).
 * Compone el átomo Chip; el chip "Todas" resetea el filtro. Datos por props.
 */
import { Chip } from '@ui/atoms/Chip/Chip';
import { useTranslation } from '@lib/i18n/useTranslation';
import './CareerChips.css';

export function CareerChips({ careers, total, value, onChange }) {
  const { t } = useTranslation();
  return (
    <div className="mat-chips">
      <Chip
        label={t('enrollments.chips.all')}
        count={total}
        active={!value}
        showDot={false}
        onClick={() => onChange(null)}
      />
      {careers.map((c) => (
        <Chip
          key={c.id}
          label={c.name}
          count={c.count}
          color={c.color}
          active={value === c.id}
          onClick={() => onChange(value === c.id ? null : c.id)}
        />
      ))}
    </div>
  );
}

export default CareerChips;
