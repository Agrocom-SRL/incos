/**
 * Ficha de contexto del curso para la toma de asistencia (molécula).
 * Materia, carrera, paralelo, turno, bimestre y nº de estudiantes.
 */
const Celda = ({ label, value }) => (
  <div className="asi-contexto__celda">
    <span className="asi-contexto__label">{label}</span>
    <span className="asi-contexto__value">{value ?? '—'}</span>
  </div>
);

const CursoContextoAsistencia = ({ curso, bimestre, registroEstado }) => (
  <div className="asi-contexto" role="region" aria-label="Datos del curso">
    <div className="asi-contexto__fila">
      <Celda label="Asignatura" value={curso?.materia} />
      <Celda label="Código" value={curso?.materiaSigla} />
      <Celda label="Carrera" value={curso?.carrera} />
    </div>
    <div className="asi-contexto__fila">
      <Celda label="Paralelo" value={curso?.paralelo} />
      <Celda label="Turno" value={curso?.turno} />
      {bimestre != null ? <Celda label="Bimestre" value={`Bimestre ${bimestre}`} /> : null}
      {curso?.estudiantes != null ? (
        <Celda label="Estudiantes" value={String(curso.estudiantes)} />
      ) : null}
      {registroEstado ? <Celda label="Registro" value={registroEstado} /> : null}
    </div>
  </div>
);

export default CursoContextoAsistencia;
