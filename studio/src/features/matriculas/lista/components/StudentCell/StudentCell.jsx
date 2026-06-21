/**
 * StudentCell — celda de identidad del estudiante (avatar + nombre + meta).
 * Molécula LOCAL del feature matrícula (no se reutiliza fuera todavía).
 */
import { Avatar } from '@ui/atoms/Avatar/Avatar';
import { useTranslation } from '@lib/i18n/useTranslation';
import './StudentCell.css';

export function StudentCell({ row }) {
  const { t } = useTranslation();
  return (
    <div className="mat-student">
      <Avatar name={row.fullName} size={38} tone={row.career.color} />
      <div className="mat-student__main">
        <div className="mat-student__name">{row.fullName}</div>
        <div className="mat-student__meta">
          <span>{row.codigo}</span>
          <span>{t('enrollments.card.ci')}: {row.ci}</span>
        </div>
      </div>
    </div>
  );
}

export default StudentCell;
