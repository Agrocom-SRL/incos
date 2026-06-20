/**
 * buildColumns — define las columnas de la tabla de inscripciones.
 * Recibe `t` (i18n) y handlers; devuelve la config de AntD Table. Sin estado.
 * Compone átomos compartidos (StatusPill) y moléculas locales (StudentCell,
 * AdmissionTypeTag, EnrollmentActions).
 */
import { StatusPill } from '@ui/atoms/StatusPill/StatusPill';
import { StudentCell } from './StudentCell';
import { AdmissionTypeTag } from './AdmissionTypeTag';
import { EnrollmentActions } from './EnrollmentActions';
import { pagoStatusOf } from './pagoStatus';
import { historyStateOf, HISTORY_ICONS } from './historyStates';

/** Render de la píldora de historial (helper, no es un componente exportado). */
function renderHistoryPill(row, t) {
  const state = historyStateOf(row.historialKey);
  const Icon = HISTORY_ICONS[state.iconKey];
  return (
    <StatusPill tone={state.tone} icon={Icon ? <Icon /> : null}>
      {t(`enrollments.history.${row.historialKey}`)}
    </StatusPill>
  );
}

export function buildColumns(t, handlers) {
  return [
    {
      title: t('enrollments.table.student'),
      key: 'student',
      render: (_, row) => <StudentCell row={row} />,
    },
    {
      title: t('enrollments.table.program'),
      key: 'program',
      render: (_, row) => (
        <div className="mat-career-cell">
          <span className="mat-career">
            <span className="mat-career__bar" style={{ background: row.career.color }} aria-hidden />
            {row.career.name}
          </span>
          <span className="mat-career__sub">
            {t('enrollments.table.careerSubtitle', { semestre: row.semestre, materias: row.materias })}
          </span>
        </div>
      ),
    },
    {
      title: t('enrollments.table.term'),
      key: 'term',
      render: (_, row) => (
        <div className="mat-term">
          <div className="mat-term__year">{row.gestionYear}</div>
          <div className="mat-term__date">{row.fecha}</div>
        </div>
      ),
    },
    {
      title: t('enrollments.table.type'),
      key: 'type',
      render: (_, row) => <AdmissionTypeTag typeKey={row.typeKey} t={t} />,
    },
    {
      title: t('enrollments.table.record'),
      key: 'record',
      render: (_, row) => renderHistoryPill(row, t),
    },
    {
      title: t('enrollments.table.payment'),
      key: 'payment',
      render: (_, row) => {
        if (!row.estadoPago) return <span className="mat-dash">—</span>;
        const { tone } = pagoStatusOf(row.estadoPago);
        const labelKey = tone === 'ok' ? 'enrollments.payment.upToDate' : 'enrollments.payment.pending';
        return <StatusPill tone={tone}>{t(labelKey)}</StatusPill>;
      },
    },
    {
      title: t('enrollments.table.subjects'),
      key: 'subjects',
      align: 'center',
      render: (_, row) => <span className="mat-subjects">{row.materias}</span>,
    },
    {
      title: t('enrollments.table.actions'),
      key: 'actions',
      align: 'right',
      width: 140,
      render: (_, row) => <EnrollmentActions row={row} className="mat-row-actions" {...handlers} />,
    },
  ];
}

export default buildColumns;
