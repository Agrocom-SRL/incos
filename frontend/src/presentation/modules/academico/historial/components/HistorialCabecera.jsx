/**
 * Cabecera de contexto del Historial académico (FORM-SIE-ITT-04).
 *
 * Mismo lenguaje visual que CentralizadorContextoHeader / CursoContextoAsistencia:
 * ficha a TODO el ancho (sd-profile vía DetailProfileCard) con avatar de iniciales
 * del estudiante, carrera como subtítulo, pill del régimen y la rejilla de stats
 * del documento (C.I., matrícula, nivel, admisión/conclusión, formulario).
 *
 * Recibe el estudiante ya mapeado (nombre en orden canónico desde el backend). No
 * llama hooks de fetch. Solo composición + tokens (sin hex/px inline).
 */

import { BookOutlined, CalendarOutlined } from '@ant-design/icons';
import { DetailProfileCard } from '@organisms';
import { buildCompleteCI, buildInitials } from '@application/utils/formatters';

/** Identidad del documento oficial (transcript). */
const HISTORIAL_DOC = {
  formulario: 'FORM-SIE-ITT-04',
  regimenFallback: 'ANUAL',
};

/** Muestra un valor o "—" cuando está vacío. */
const dash = (value) => (value == null || value === '' ? '—' : value);

/** Carrera con su código: "SISTEMAS INFORMATICOS · SIS-INF". */
const formatCarrera = (nombre, codigo) =>
  [nombre, codigo].filter(Boolean).join(' · ') || null;

const HistorialCabecera = ({ estudiante }) => {
  const est = estudiante ?? {};
  const carrera = formatCarrera(est.carreraNombre, est.carreraCodigo);
  const regimen = est.regimen || HISTORIAL_DOC.regimenFallback;

  const stats = [
    { label: 'Cédula de identidad', value: buildCompleteCI(est.ci, est.expedicion) || '—' },
    { label: 'Matrícula', value: dash(est.matricula) },
    { label: 'Nivel', value: dash(est.nivelFormacion) },
    { label: 'Admisión', value: dash(est.fechaAdmision) },
    { label: 'Conclusión', value: dash(est.fechaConclusion) },
    { label: 'Formulario', value: HISTORIAL_DOC.formulario },
  ].map((stat) => ({ ...stat, primary: true }));

  return (
    <DetailProfileCard
      avatarInitials={buildInitials(est.nombreCompleto)}
      avatarClassName="sd-profile__avatar historial-profile__avatar"
      title={dash(est.nombreCompleto)}
      subtitle={
        <>
          <BookOutlined aria-hidden />
          {carrera || 'Historial académico'}
        </>
      }
      metaExtra={
        <span className="sd-profile__admission-pill historial-profile__pill">
          <CalendarOutlined aria-hidden />
          {regimen}
        </span>
      }
      stats={stats}
    />
  );
};

export default HistorialCabecera;
