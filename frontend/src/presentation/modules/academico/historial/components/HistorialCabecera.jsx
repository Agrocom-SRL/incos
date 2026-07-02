/**
 * Cabecera del documento de Historial académico (FORM-SIE-ITT-04).
 *
 * Replica la cabecera del transcript oficial: banda del instituto + título del
 * documento + código de formulario, y una rejilla de datos del estudiante
 * (CARRERA, NIVEL DE FORMACIÓN, RÉGIMEN, FECHA DE ADMISIÓN/CONCLUSIÓN, MATRÍCULA,
 * ESTUDIANTE, CÉDULA DE IDENTIDAD).
 *
 * Recibe el estudiante ya mapeado (nombre en orden canónico desde el backend). No
 * llama hooks de fetch. Solo composición + tokens (sin hex/px inline).
 */

import { DetailInfoCard } from '@molecules';
import { DetailField } from '@atoms';

/** Muestra un valor o "—" cuando está vacío. */
const dash = (value) => (value == null || value === '' ? '—' : value);

/** C.I. con expedición opcional: "4741310 CB". */
const formatCedula = (ci, expedicion) =>
  [ci, expedicion].filter(Boolean).join(' ') || '—';

/** Carrera con su código: "SISTEMAS INFORMATICOS · SIS-INF". */
const formatCarrera = (nombre, codigo) =>
  [nombre, codigo].filter(Boolean).join(' · ') || '—';

const HistorialCabecera = ({ estudiante }) => (
  <section className="historial-doc" aria-label="Cabecera del historial académico">
    <header className="historial-doc__band">
      <span className="historial-doc__eyebrow">INCOS</span>
      <h2 className="historial-doc__title">Historial académico</h2>
      <span className="historial-doc__form-code">FORM-SIE-ITT-04</span>
    </header>

    <DetailInfoCard title="Datos del estudiante" cols={3}>
      <DetailField label="Estudiante" span={3}>
        <span className="historial-doc__student-name">{dash(estudiante?.nombreCompleto)}</span>
      </DetailField>
      <DetailField label="Cédula de identidad">
        {formatCedula(estudiante?.ci, estudiante?.expedicion)}
      </DetailField>
      <DetailField label="Matrícula">{dash(estudiante?.matricula)}</DetailField>
      <DetailField label="Régimen">{dash(estudiante?.regimen)}</DetailField>
      <DetailField label="Carrera" span={2}>
        {formatCarrera(estudiante?.carreraNombre, estudiante?.carreraCodigo)}
      </DetailField>
      <DetailField label="Nivel de formación">{dash(estudiante?.nivelFormacion)}</DetailField>
      <DetailField label="Fecha de admisión">{dash(estudiante?.fechaAdmision)}</DetailField>
      <DetailField label="Fecha de conclusión">{dash(estudiante?.fechaConclusion)}</DetailField>
    </DetailInfoCard>
  </section>
);

export default HistorialCabecera;
