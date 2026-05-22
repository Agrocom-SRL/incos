/**
 * Ficha de contexto del cuaderno (gestión, carrera, materia, docente, paralelo, turno, bimestre).
 */

const Celda = ({ label, value, wide = false }) => (
  <div className={`cal-cuaderno-contexto__celda${wide ? ' cal-cuaderno-contexto__celda--wide' : ''}`}>
    <span className="cal-cuaderno-contexto__label">{label}</span>
    <span className="cal-cuaderno-contexto__value">{value ?? '—'}</span>
  </div>
);

const CuadernoContextoPanel = ({ curso, docente, bimestreTitulo, esVistaCoordinacion, docenteNombre }) => (
  <div className="cal-cuaderno-contexto" role="region" aria-label="Datos del curso y bimestre">
    <div className="cal-cuaderno-contexto__grid">
      <Celda label="Gestión" value={docente?.gestionVigente} />
      <Celda label="Carrera" value={curso?.carrera} />
      <Celda label="Periodo" value={curso?.periodo ?? docente?.periodoLectivoEnCurso} />
      <Celda label="Asignatura" value={curso?.materia} wide />
      <Celda label="Código" value={curso?.materiaSigla} />
      <Celda label="Bimestre" value={bimestreTitulo} />
    </div>
    <div className="cal-cuaderno-contexto__barra">
      <Celda
        label="Docente"
        value={
          esVistaCoordinacion && docenteNombre
            ? `${docenteNombre} (vista coordinación)`
            : docente?.nombre
        }
        wide
      />
      <Celda label="Paralelo" value={curso?.paralelo} />
      <Celda label="Turno" value={curso?.turno} />
      <Celda label="Estudiantes" value={String(curso?.estudiantes ?? '—')} />
    </div>
  </div>
);

export default CuadernoContextoPanel;
