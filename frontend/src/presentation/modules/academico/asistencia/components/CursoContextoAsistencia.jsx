/**
 * Cabecera del curso para la toma de asistencia (organismo).
 *
 * Mismo lenguaje visual que CursoHeaderCard / CursoProfileHeader (Calificaciones):
 * cabecera tipo ficha a TODO el ancho (avatar con sigla + materia + carrera +
 * pill del bimestre con su color de negocio + grilla de stats). El color del
 * bimestre llega del backend (sanitizado) y tiñe avatar y pill.
 */

import { BookOutlined, CalendarOutlined } from '@ant-design/icons';
import { sanitizeDocenteColorHex } from '@docentes/components/atoms/DocenteColorBar';

const CursoContextoAsistencia = ({
  curso,
  bimestre,
  bimestreNombre,
  bimestreColor,
  gestion,
  registroEstado,
}) => {
  const color = sanitizeDocenteColorHex(bimestreColor) ?? curso?.carreraColor ?? '#196b45';
  const tituloBimestre =
    bimestreNombre ?? (bimestre != null ? `Bimestre ${bimestre}` : 'Bimestre');
  const sigla = (curso?.materiaSigla ?? '').trim().toUpperCase() || null;

  const stats = [
    { label: 'Código', value: curso?.materiaSigla },
    { label: 'Paralelo', value: curso?.paralelo },
    { label: 'Docente', value: curso?.docente },
    { label: 'Gestión', value: gestion },
    { label: 'Turno', value: curso?.turno },
    ...(curso?.estudiantes != null
      ? [{ label: 'Estudiantes', value: String(curso.estudiantes) }]
      : []),
  ];

  const pillStyle = {
    background: `color-mix(in srgb, ${color} 14%, var(--color-bg-container))`,
    color,
    borderColor: `color-mix(in srgb, ${color} 38%, transparent)`,
  };

  return (
    <div className="sd-profile asi-profile" role="region" aria-label="Datos del curso y bimestre">
      {registroEstado ? (
        <div className="asi-profile__toolbar">
          <span className="asi-profile__estado">{registroEstado}</span>
        </div>
      ) : null}

      <div className="sd-profile__identity">
        <div className="sd-profile__avatar-wrap">
          <div
            className={`sd-profile__avatar sd-profile__avatar--default asi-profile__avatar${
              sigla ? ' asi-profile__avatar--sigla' : ''
            }`}
            style={{ background: color }}
          >
            {sigla ?? <BookOutlined aria-hidden />}
          </div>
          <span className="sd-profile__status-dot" aria-hidden />
        </div>
        <div className="sd-profile__name-block">
          <h1 className="sd-profile__name">{curso?.materia ?? '—'}</h1>
          <div className="sd-profile__meta">
            {curso?.carrera ? (
              <p className="sd-profile__sub">
                <BookOutlined aria-hidden />
                {curso.carrera}
              </p>
            ) : null}
            <span
              className="sd-profile__admission-pill asi-profile__bimestre-pill"
              style={pillStyle}
            >
              <CalendarOutlined aria-hidden />
              {tituloBimestre}
            </span>
          </div>
        </div>
      </div>

      <div className="sd-profile__divider" />
      <div className="sd-profile__stats">
        {stats.map(({ label, value }) => (
          <div key={label} className="sd-stat">
            <span className="sd-stat__label">{label}</span>
            <span className="sd-stat__value sd-stat__value--primary">{value ?? '—'}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CursoContextoAsistencia;
