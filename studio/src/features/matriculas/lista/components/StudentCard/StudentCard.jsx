/**
 * StudentCard — tarjeta de estudiante (vista grid). Organismo LOCAL del feature.
 *
 * COMPONE (no reimplementa): Avatar, AdmissionTypeTag, StatusPill, Stat,
 * DescriptionRow, ProgressBar y EnrollmentActions. La card solo orquesta el layout
 * y deriva los datos de presentación; cada pieza es responsable de su render.
 */
import { Avatar } from '@ui/atoms/Avatar/Avatar';
import { StatusPill } from '@ui/atoms/StatusPill/StatusPill';
import { Stat } from '@ui/atoms/Stat/Stat';
import { ProgressBar } from '@ui/atoms/ProgressBar/ProgressBar';
import { DescriptionRow } from '@ui/molecules/DescriptionRow/DescriptionRow';
import { useTranslation } from '@lib/i18n/useTranslation';
import { AdmissionTypeTag } from '../AdmissionTypeTag/AdmissionTypeTag';
import { EnrollmentActions } from '../EnrollmentActions/EnrollmentActions';
import { historyStateOf, HISTORY_ICONS } from '../../model/historyStates';
import { pagoStatusOf } from '../../model/pagoStatus';
import './StudentCard.css';

export function StudentCard({ row, onOpen, ...actions }) {
  const { t } = useTranslation();

  const progress = Math.min(100, Math.round((Number(row.semestre) / 6) * 100));
  const histState = historyStateOf(row.historialKey);
  const HistIcon = HISTORY_ICONS[histState.iconKey];
  const periodoLabel = [row.periodoNombre, row.paralelo].filter(Boolean).join(' · ');
  const pagoLabel = row.estadoPago
    ? t(pagoStatusOf(row.estadoPago).tone === 'ok' ? 'enrollments.payment.upToDate' : 'enrollments.payment.pending')
    : null;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onOpen?.(row)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onOpen?.(row);
      }}
      className="mat-card"
      style={{ '--card-career-color': row.career.color }}
    >
      <div className="mat-card__accent" aria-hidden />

      <div className="mat-card__header">
        <Avatar name={row.fullName} size={52} tone={row.career.color} />
        <div className="mat-card__identity">
          <div className="mat-card__code">#{row.codigo}</div>
          <div className="mat-card__name">{row.fullName}</div>
        </div>
        <AdmissionTypeTag typeKey={row.typeKey} t={t} />
      </div>

      <div className="mat-card__body">
        <div className="mat-card__career" title={row.career.name}>
          <span className="mat-card__career-dot" aria-hidden />
          <span className="mat-card__career-label">{row.career.name}</span>
        </div>

        <div className="mat-card__enrollment">
          <DescriptionRow label={t('enrollments.card.ci')} value={row.ci} />
          <DescriptionRow label={t('enrollments.card.term')} value={row.gestion} />
          <DescriptionRow label={t('enrollments.card.enrolled')} value={row.fecha} />
          <DescriptionRow label={t('enrollments.card.period')} value={periodoLabel} />
          <DescriptionRow label={t('enrollments.card.payment')} value={pagoLabel} />
        </div>
      </div>

      <div className="mat-card__status">
        <StatusPill tone={histState.tone} icon={HistIcon ? <HistIcon /> : null}>
          {t(`enrollments.history.${row.historialKey}`)}
        </StatusPill>
      </div>

      <div className="mat-card__stats">
        <Stat label={t('enrollments.card.semester')} value={`${row.semestre}°`} />
        <Stat label={t('enrollments.card.subjects')} value={row.materias} />
        <Stat label={t('enrollments.card.average')} value={row.promedio ?? '—'} accent />
      </div>

      <div className="mat-card__progress">
        <div className="mat-card__progress-head">
          <span>{t('enrollments.card.progress')}</span>
          <span>{progress}%</span>
        </div>
        <ProgressBar value={progress} tone="var(--card-career-color)" />
      </div>

      <EnrollmentActions
        row={row}
        className="mat-card__footer"
        primaryClassName="mat-card__btn-primary"
        onView={actions.onView || onOpen}
        onEdit={actions.onEdit}
        onPrint={actions.onPrint}
        onEmail={actions.onEmail}
        onReport={actions.onReport}
        onDelete={actions.onDelete}
      />
    </div>
  );
}

export default StudentCard;
