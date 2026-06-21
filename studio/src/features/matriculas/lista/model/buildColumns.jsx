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
import { historyStateOf, HISTORY_ICONS } from '../config/historyStates';

/**
 * Segundo dato (académico) bajo la píldora de historial, según el tipo de
 * inscripción. Devuelve null cuando no hay contexto que mostrar. Función PURA.
 */
function historySubtitle(row, t) {
  if (row.typeKey === 'new') return t('enrollments.history.firstEntry');
  if (row.origen) {
    const key =
      row.typeKey === 'transfer'
        ? 'enrollments.history.transferOrigin'
        : 'enrollments.history.mobilityOrigin';
    return t(key, { carrera: row.origen.carreraOrigen, anio: row.origen.anioLabel });
  }
  if (row.historialPreviasCount > 0) {
    return t('enrollments.history.previousSubjects', { count: row.historialPreviasCount });
  }
  return null;
}

/** Paralelo · turno del estudiante (helper). null si no hay paralelo asignado. */
function paraleloLabel(row, t) {
  if (!row.paralelo || row.paralelo === '—') return null;
  return row.turnoKey ? `${row.paralelo} · ${t(`enrollments.shift.${row.turnoKey}`)}` : row.paralelo;
}

/** Celda de historial (helper): píldora de estado + subtítulo de contexto. */
function renderHistoryCell(row, t) {
  const state = historyStateOf(row.historialKey);
  const Icon = HISTORY_ICONS[state.iconKey];
  const sub = historySubtitle(row, t);
  return (
    <div className="mat-history">
      <AdmissionTypeTag typeKey={row.typeKey} t={t} />
      <StatusPill tone={state.tone} icon={Icon ? <Icon /> : null}>
        {t(`enrollments.history.${row.historialKey}`)}
      </StatusPill>
      {sub ? <span className="mat-history__sub">{sub}</span> : null}
    </div>
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
      // Gestión + tipo unificados en una sola columna: año/fecha arriba, el tipo
      // como píldora de color debajo (antes era una columna `type` aparte).
      title: t('enrollments.table.term'),
      key: 'term',
      minWidth: 160, // ancho mínimo de columna (layout), no breakpoint
      render: (_, row) => {
        const paralelo = paraleloLabel(row, t);
        return (
          <div className="mat-term">
            <div className="mat-term__year">{row.gestionYear}</div>
            <div className="mat-term__date">{row.fecha}</div>
            {paralelo ? <div className="mat-term__paralelo">{paralelo}</div> : null}
          </div>
        );
      },
      // En la fila collapse (ficha): la celda de tabla apila año GRANDE + fecha,
      // tipografía que rompe la escala del residual. Aquí se presenta inline a la
      // escala de ficha — año + fecha en una línea, el tipo y el paralelo debajo.
      renderResidual: (row) => {
        const paralelo = paraleloLabel(row, t);
        return (
          <div className="mat-term--residual">
            <span className="mat-term--residual-line">
              {row.gestionYear}
              <span className="mat-term__date"> · {row.fecha}</span>
            </span>
            <AdmissionTypeTag typeKey={row.typeKey} t={t} />
            {paralelo ? <span className="mat-term__paralelo">{paralelo}</span> : null}
          </div>
        );
      },
    },
    {
      title: t('enrollments.table.record'),
      key: 'record',
      minWidth: 160, // ancho mínimo de columna (layout), no breakpoint
      render: (_, row) => renderHistoryCell(row, t),
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
