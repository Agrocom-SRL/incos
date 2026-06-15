/**
 * Ficha de contexto del cuaderno (gestión, carrera, materia, docente, paralelo, turno, bimestre).
 */

const Celda = ({ label, value, compact = false }) => (
  <div
    className={[
      'cal-cuaderno-contexto__celda',
      compact ? 'cal-cuaderno-contexto__celda--compact' : '',
    ]
      .filter(Boolean)
      .join(' ')}
  >
    <span className="cal-cuaderno-contexto__label">{label}</span>
    <span className="cal-cuaderno-contexto__value">{value ?? '—'}</span>
  </div>
);

const etiquetaEstadoBimestre = (bimestreActivo, bimestreVigente, modoEdicion) => {
  if (bimestreActivo == null) return '—';
  if (bimestreActivo > bimestreVigente) return 'Futuro · No disponible';
  if (bimestreActivo < bimestreVigente) return 'Histórico · Solo lectura';
  if (modoEdicion) return 'Vigente · En edición';
  return 'Vigente · Solo lectura';
};

const CuadernoContextoPanel = ({
  curso,
  docente,
  bimestreTitulo,
  bimestreActivo,
  bimestreVigente = 1,
  modoEdicion = false,
  esVistaCoordinacion,
  docenteNombre,
}) => {
  const docenteValor =
    esVistaCoordinacion && docenteNombre
      ? `${docenteNombre} (vista coordinación)`
      : docente?.nombre;

  const estadoBimestre = etiquetaEstadoBimestre(bimestreActivo, bimestreVigente, modoEdicion);

  return (
    <div className="cal-cuaderno-contexto" role="region" aria-label="Datos del curso y bimestre">
      <div className="cal-cuaderno-contexto__filas">
        <div className="cal-cuaderno-contexto__fila cal-cuaderno-contexto__fila--3">
          <Celda label="Gestión" value={docente?.gestionVigente} />
          <Celda label="Docente" value={docenteValor} />
          <Celda label="Estado bimestre" value={estadoBimestre} />
        </div>
        <div className="cal-cuaderno-contexto__fila cal-cuaderno-contexto__fila--3">
          <Celda label="Carrera" value={curso?.carrera} />
          <Celda label="Periodo" value={curso?.periodo ?? docente?.periodoLectivoEnCurso} />
          <Celda label="Estudiantes" value={String(curso?.estudiantes ?? '—')} compact />
        </div>
        <div className="cal-cuaderno-contexto__fila cal-cuaderno-contexto__fila--2">
          <Celda label="Asignatura" value={curso?.materia} />
          <Celda label="Código" value={curso?.materiaSigla} />
        </div>
        <div className="cal-cuaderno-contexto__fila cal-cuaderno-contexto__fila--3">
          <Celda label="Paralelo" value={curso?.paralelo} />
          <Celda label="Turno" value={curso?.turno} />
          <Celda label="Bimestre" value={bimestreTitulo} />
        </div>
      </div>
    </div>
  );
};

export default CuadernoContextoPanel;
