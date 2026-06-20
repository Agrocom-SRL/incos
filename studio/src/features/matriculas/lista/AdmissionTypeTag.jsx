/**
 * AdmissionTypeTag — etiqueta de tipo de inscripción con color de marca del studio.
 *
 * Organismo LOCAL del feature matrícula. Mapea typeKey → un acento de marca
 * (tokens del studio, NO config legacy ni @theme legacy). El texto se traduce vía
 * t('enrollments.type.*'). El color se inyecta como CSS var (sin literales).
 */
import { Tag } from 'antd';
import './AdmissionTypeTag.css';

/** typeKey → CSS var del acento de marca. */
const TYPE_ACCENT = {
  new: 'var(--info)',
  returning: 'var(--warning)',
  transfer: 'var(--accent-sky)',
  mobility: 'var(--accent-gold)',
};

export function AdmissionTypeTag({ typeKey = 'returning', t }) {
  const accent = TYPE_ACCENT[typeKey] || 'var(--brand-600)';
  return (
    <Tag className="mat-type-tag" style={{ '--type-accent': accent }}>
      {t(`enrollments.type.${typeKey}`)}
    </Tag>
  );
}

export default AdmissionTypeTag;
