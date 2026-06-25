/**
 * Cabecera de contexto del Centralizador (paralelo + carrera + gestión).
 *
 * Mismo lenguaje visual que CursoContextoAsistencia / CursoProfileHeader:
 * ficha a TODO el ancho (avatar grande + carrera + pill + grilla de stats).
 * El avatar (dot circular grande) muestra el código del paralelo (seeder
 * 25-seed-paralelos.sql) y se tiñe según la pantalla:
 *   - P2 (vista global del paralelo, todos los bimestres) → color primario.
 *   - P3 (matriz de un bimestre) → color del bimestre, espejo del seeder
 *     18-seed-periodos_academicos.sql.
 */

import { BookOutlined, CalendarOutlined, TeamOutlined } from '@ant-design/icons';
import {
  CENTRALIZADOR_DOC,
  colorBimestre,
  nombreBimestre,
} from '@application-academico/centralizador/utils/centralizadorDoc.js';

/** Color institucional primario (vía token, respeta tema claro/oscuro). */
const COLOR_PRIMARIO = 'var(--color-primary)';

/**
 * @param {Object} props
 * @param {Object} props.paralelo paralelo normalizado (carreraNombre, carreraColorHex,
 *   periodoNombre, paraleloNombre, turno, cursosCreados, cantidadEstudiantes)
 * @param {number|null} [props.gestionAnio] año de la gestión (ej. 2026)
 * @param {string|null} [props.gestionNombre] nombre largo (fallback si no hay año)
 * @param {number|null} [props.bimestre] bimestre activo 1..4 (P3); null en P2
 */
const CentralizadorContextoHeader = ({
  paralelo,
  gestionAnio = null,
  gestionNombre = null,
  bimestre = null,
}) => {
  const p = paralelo ?? {};

  // El dot circular grande: color del bimestre en P3; color primario en la vista
  // global del paralelo (P2, sin bimestre único).
  const color = bimestre != null ? (colorBimestre(bimestre) ?? COLOR_PRIMARIO) : COLOR_PRIMARIO;

  // Identidad del avatar = código del paralelo (seeder 25, p. ej. "PRIMERO A").
  const paraleloCodigo = (p.paraleloNombre ?? '').trim().toUpperCase() || null;

  const gestionLabel = gestionAnio != null ? String(gestionAnio) : (gestionNombre ?? null);
  const cursoParalelo = [p.periodoNombre, p.paraleloNombre]
    .filter(Boolean)
    .join(' · Paralelo ');

  // Pill: el bimestre activo (P3, teñido por su color) o el régimen anual (P2).
  const pillTexto = bimestre != null ? nombreBimestre(bimestre) : CENTRALIZADOR_DOC.regimen;
  const pillStyle = {
    background: `color-mix(in srgb, ${color} 14%, var(--color-bg-container))`,
    color,
    borderColor: `color-mix(in srgb, ${color} 38%, transparent)`,
  };

  const stats = [
    { label: 'Gestión', value: gestionLabel },
    { label: 'Nivel', value: CENTRALIZADOR_DOC.nivel },
    { label: 'Curso', value: p.periodoNombre },
    { label: 'Paralelo', value: p.paraleloNombre },
    { label: 'Turno', value: p.turno },
    ...(p.cursosCreados != null
      ? [{ label: 'Asignaturas', value: String(p.cursosCreados) }]
      : []),
    ...(p.cantidadEstudiantes != null
      ? [{ label: 'Estudiantes', value: String(p.cantidadEstudiantes) }]
      : []),
    { label: 'R.M.', value: CENTRALIZADOR_DOC.resolucionMinisterial },
  ];

  return (
    <div
      className="sd-profile cal-centralizador-profile"
      role="region"
      aria-label="Datos del paralelo y la gestión"
    >
      <div className="sd-profile__identity">
        <div className="sd-profile__avatar-wrap">
          <div
            className={`sd-profile__avatar sd-profile__avatar--default cal-centralizador-profile__avatar${
              paraleloCodigo ? ' cal-centralizador-profile__avatar--codigo' : ''
            }`}
            style={{ background: color }}
          >
            {paraleloCodigo ?? <TeamOutlined aria-hidden />}
          </div>
          <span className="sd-profile__status-dot" aria-hidden />
        </div>
        <div className="sd-profile__name-block">
          <h1 className="sd-profile__name">{p.carreraNombre ?? 'Centralizador de calificaciones'}</h1>
          <div className="sd-profile__meta">
            <p className="sd-profile__sub">
              <BookOutlined aria-hidden />
              {cursoParalelo || CENTRALIZADOR_DOC.institucion}
            </p>
            <span
              className="sd-profile__admission-pill cal-centralizador-profile__bimestre-pill"
              style={pillStyle}
            >
              <CalendarOutlined aria-hidden />
              {pillTexto}
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

export default CentralizadorContextoHeader;
