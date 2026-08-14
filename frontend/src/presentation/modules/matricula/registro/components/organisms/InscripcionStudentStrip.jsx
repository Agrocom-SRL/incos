/**
 * InscripcionStudentStrip — franja compacta del estudiante en el wizard de matrícula.
 *
 * Reemplaza a los Alerts históricos «Estudiante seleccionado» / «Estudiante a
 * inscribir» / «Estudiante nuevo» (plan matricula-wizard-rediseno §B2): avatar
 * con iniciales, nombre en orden APELLIDOS NOMBRES (buildFullName), código +
 * C.I. y pills del design system (tipo de admisión, carrera, plan, gestión
 * vigente, «Nuevo en el sistema»).
 *
 * Organismo del módulo (recibe props ya mapeadas, no llama hooks de fetch).
 * Estilos: styles/components/organisms/inscripcion-student-strip.css (tokens).
 *
 * @param {Object|null} student  - Estudiante seleccionado (nombreCompleto, codigoEstudiante, ciCompleto, tipoAdmision)
 * @param {string|null} carreraNombre - Carrera fija o elegida (pill solo cuando se conoce)
 * @param {Object|null} plan     - Plan resuelto del contexto ({ id, nombre, vigente })
 * @param {Object|null} gestion  - Gestión vigente del contexto ({ id, anio, nombre })
 * @param {boolean|null} esNuevoSistema - true = sin ninguna inscripción en el sistema
 */

import { Flex } from 'antd';
import { StatusPill } from '@atoms';
import { buildFullName, buildInitials } from '@application/utils/formatters';

/** Etiqueta legible del tipo de admisión (misma voz que el resto del módulo). */
const TIPO_ADMISION_LABELS = {
  NUEVO: 'Nuevo',
  ANTIGUO: 'Antiguo',
  TRASPASO: 'Traspaso',
  TRANSITABILIDAD: 'Transitabilidad',
};

const InscripcionStudentStrip = ({
  student = null,
  carreraNombre = null,
  plan = null,
  gestion = null,
  esNuevoSistema = null,
}) => {
  if (!student?.id) return null;

  const displayName =
    student.nombreCompleto ||
    buildFullName(student.nombres, student.apellidoPaterno, student.apellidoMaterno);
  const initials = buildInitials(displayName);

  const meta = [
    student.codigoEstudiante ? `Código: ${student.codigoEstudiante}` : null,
    student.ciCompleto ? `C.I.: ${student.ciCompleto}` : null,
  ].filter(Boolean);

  const tipo = String(student.tipoAdmision ?? '').toUpperCase();
  const tipoLabel = TIPO_ADMISION_LABELS[tipo] ?? null;
  const gestionLabel = gestion ? gestion.nombre || (gestion.anio ? `Gestión ${gestion.anio}` : null) : null;

  return (
    <section className="insc-student-strip" aria-label="Estudiante a inscribir">
      <span className="insc-student-strip__avatar" aria-hidden>
        {initials}
      </span>
      <div className="insc-student-strip__identity">
        <span className="insc-student-strip__name">{displayName}</span>
        {meta.length > 0 ? (
          <span className="insc-student-strip__meta">{meta.join(' · ')}</span>
        ) : null}
      </div>
      <Flex className="insc-student-strip__pills" align="center" gap="small" wrap>
        {tipoLabel ? (
          <StatusPill label={tipoLabel} className="cfg-materia-pill cfg-materia-pill--accent" />
        ) : null}
        {carreraNombre ? (
          <StatusPill label={carreraNombre} className="cfg-materia-pill cfg-materia-pill--primary" />
        ) : null}
        {plan?.nombre ? (
          <StatusPill
            label={plan.nombre}
            className={`cfg-materia-pill ${plan.vigente ? 'cfg-materia-pill--success' : 'cfg-materia-pill--default'}`}
          />
        ) : null}
        {gestionLabel ? (
          <StatusPill label={gestionLabel} className="cfg-materia-pill cfg-materia-pill--default" />
        ) : null}
        {esNuevoSistema === true ? (
          <StatusPill label="Nuevo en el sistema" className="cfg-materia-pill cfg-materia-pill--info" />
        ) : null}
      </Flex>
    </section>
  );
};

export default InscripcionStudentStrip;
