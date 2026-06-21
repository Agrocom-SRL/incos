/**
 * buildColumns — define las columnas de la tabla de inscripciones.
 * Recibe `t` (i18n) y handlers; devuelve la config de AntD Table. Sin estado.
 * Compone átomos compartidos (StatusPill) y moléculas locales (StudentCell,
 * AdmissionTypeTag, EnrollmentActions).
 */
import { StatusPill } from '@ui/atoms/StatusPill/StatusPill';
import { RowActions } from '@ui/templates/ListPage/parts/RowActions/RowActions';
import { StudentCell } from '../components/StudentCell/StudentCell';
import { AdmissionTypeTag } from '../components/AdmissionTypeTag/AdmissionTypeTag';
import { buildEnrollmentActions } from '../config/enrollmentActions';
import { pagoStatusOf } from '../config/pagoStatus';
import { historyStateOf, HISTORY_ICONS } from '../config/historyStates';

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
  // Descriptores de acción construidos UNA vez por tabla (no por celda): el render
  // de cada fila solo recibe la referencia ya armada.
  const enrollmentActions = buildEnrollmentActions(t, handlers);
  const actionsCell = (_, row) => (
    <RowActions actions={enrollmentActions} row={row} className="mat-row-actions" />
  );

  return [
    {
      title: t('enrollments.table.student'),
      key: 'student',
      minWidth: 220, // ancho mínimo de columna (layout), no breakpoint
      render: (_, row) => <StudentCell row={row} />,
    },
    {
      title: t('enrollments.table.program'),
      key: 'program',
      minWidth: 200, // ancho mínimo de columna (layout), no breakpoint
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
      minWidth: 150, // ancho mínimo de columna (layout), no breakpoint
      render: (_, row) => (
        <div className="mat-term">
          <div className="mat-term__year">{row.gestionYear}</div>
          <div className="mat-term__date">{row.fecha}</div>
        </div>
      ),
      // En la fila collapse (ficha): la celda de tabla apila año GRANDE + fecha,
      // tipografía que rompe la escala del residual. Aquí se presenta inline a la
      // escala de ficha — el año y la fecha en una sola línea legible.
      renderResidual: (row) => (
        <span className="mat-term--residual">
          {row.gestionYear}
          <span className="mat-term__date"> · {row.fecha}</span>
        </span>
      ),
    },
    {
      title: t('enrollments.table.type'),
      key: 'type',
      minWidth: 130, // ancho mínimo de columna (layout), no breakpoint
      render: (_, row) => <AdmissionTypeTag typeKey={row.typeKey} t={t} />,
    },
    {
      title: t('enrollments.table.record'),
      key: 'record',
      minWidth: 150, // ancho mínimo de columna (layout), no breakpoint
      render: (_, row) => renderHistoryPill(row, t),
    },
    {
      title: t('enrollments.table.payment'),
      key: 'payment',
      minWidth: 130, // ancho mínimo de columna (layout), no breakpoint
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
      minWidth: 90, // ancho mínimo de columna (layout), no breakpoint
      render: (_, row) => <span className="mat-subjects">{row.materias}</span>,
    },
    {
      title: t('enrollments.table.actions'),
      key: 'actions',
      align: 'right',
      width: 140,
      // Columna FIJA (nunca se oculta): reserva su ancho de layout en
      // useResponsiveColumns igual que `width`. Espejo de ACTIONS_W.full (140).
      minWidth: 140, // ancho mínimo de columna (layout), no breakpoint
      // Anclada a la DERECHA: el ⋮ queda siempre pegado al borde y visible por
      // encima de las columnas de datos aunque la suma de anchos roce el wrapper;
      // nunca se recorta al borde derecho (era el síntoma del header "A" cortado).
      fixed: 'right',
      render: actionsCell,
    },
  ];
}

export default buildColumns;
