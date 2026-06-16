/**
 * Ficha de contexto del curso para la toma de asistencia (molécula).
 *
 * Cabecera tipo ficha: título del bimestre con swatch de su color (dato del backend,
 * sanitizado) + datos del curso (carrera, paralelo, asignatura, gestión, docente,
 * estudiantes, turno). Mismo lenguaje visual que CuadernoContextoPanel.
 */

import { sanitizeDocenteColorHex } from '@docentes/components/atoms/DocenteColorBar';

const Celda = ({ label, value }) => (
  <div className="asi-contexto__celda">
    <span className="asi-contexto__label">{label}</span>
    <span className="asi-contexto__value">{value ?? '—'}</span>
  </div>
);

const CursoContextoAsistencia = ({
  curso,
  bimestre,
  bimestreNombre,
  bimestreColor,
  gestion,
  registroEstado,
}) => {
  const color = sanitizeDocenteColorHex(bimestreColor);
  const tituloBimestre = bimestreNombre ?? (bimestre != null ? `Bimestre ${bimestre}` : 'Bimestre');
  const swatchStyle = color
    ? {
        color,
        backgroundColor: `color-mix(in srgb, ${color} 14%, var(--color-bg-container))`,
        borderColor: `color-mix(in srgb, ${color} 38%, transparent)`,
      }
    : undefined;

  return (
    <div className="asi-contexto" role="region" aria-label="Datos del curso y bimestre">
      <div className="asi-contexto__titulo">
        <span className="asi-contexto__pill" style={swatchStyle}>
          <span
            className="asi-contexto__swatch"
            style={color ? { backgroundColor: color } : undefined}
            aria-hidden
          />
          {tituloBimestre}
        </span>
        {registroEstado ? (
          <span className="asi-contexto__estado">{registroEstado}</span>
        ) : null}
      </div>

      <div className="asi-contexto__fila">
        <Celda label="Carrera" value={curso?.carrera} />
        <Celda label="Paralelo" value={curso?.paralelo} />
        <Celda label="Asignatura" value={curso?.materia} />
        <Celda label="Código" value={curso?.materiaSigla} />
      </div>
      <div className="asi-contexto__fila">
        <Celda label="Gestión" value={gestion} />
        <Celda label="Docente" value={curso?.docente} />
        <Celda label="Turno" value={curso?.turno} />
        {curso?.estudiantes != null ? (
          <Celda label="Estudiantes" value={String(curso.estudiantes)} />
        ) : null}
      </div>
    </div>
  );
};

export default CursoContextoAsistencia;
