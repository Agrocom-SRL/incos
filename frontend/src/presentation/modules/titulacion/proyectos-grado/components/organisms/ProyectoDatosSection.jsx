/**
 * Organismo: tab "Datos" de la ficha-hub del proyecto de grado (TIT).
 *
 * DetailInfoCard + DetailField (patrón UsuarioDetailPage / InscripcionPagosSection).
 * Recibe el proyecto ya mapeado; no llama hooks.
 */

import { BookOutlined, FileTextOutlined, UserOutlined } from '@ant-design/icons';
import { DetailInfoCard } from '@molecules';
import { DetailField, StatusPill } from '@atoms';
import {
  formatEstadoProyecto,
  getEstadoProyectoPillClass,
} from '@application-titulacion/utils/titulacionPills';

const ProyectoDatosSection = ({ proyecto }) => (
  <div className="sd-tab-body">
    <DetailInfoCard title="Datos del proyecto" icon={<BookOutlined />} cols={3}>
      <DetailField label="Título" span={3}>
        {proyecto.titulo}
      </DetailField>
      <DetailField label="Modalidad">
        {proyecto.modalidadNombre || proyecto.modalidadCodigo || '—'}
      </DetailField>
      <DetailField label="Carrera">{proyecto.carreraNombre || '—'}</DetailField>
      <DetailField label="Gestión">{proyecto.gestionLabel || '—'}</DetailField>
      <DetailField label="Estado">
        <StatusPill
          label={formatEstadoProyecto(proyecto.estado)}
          className={getEstadoProyectoPillClass(proyecto.estado)}
        />
      </DetailField>
      <DetailField label="Nota final">{proyecto.notaFinal ?? '—'}</DetailField>
      <DetailField label="Fecha de aprobación">
        {proyecto.fechaAprobacionLabel || '—'}
      </DetailField>
    </DetailInfoCard>

    <DetailInfoCard title="Objetivos" icon={<FileTextOutlined />} cols={1}>
      <DetailField label="Objetivos">{proyecto.objetivos || '—'}</DetailField>
      {proyecto.metodologia ? (
        <DetailField label="Metodología">{proyecto.metodologia}</DetailField>
      ) : null}
      {proyecto.alcance ? <DetailField label="Alcance">{proyecto.alcance}</DetailField> : null}
    </DetailInfoCard>

    {proyecto.tutorId ? (
      <DetailInfoCard title="Tutoría" icon={<UserOutlined />} cols={3}>
        <DetailField label="Tutor">{proyecto.tutorNombre || '—'}</DetailField>
        <DetailField label="Correo del tutor">{proyecto.tutorEmail || '—'}</DetailField>
        <DetailField label="Teléfono del tutor">{proyecto.tutorTelefono || '—'}</DetailField>
        <DetailField label="Última tutoría">{proyecto.ultimaTutoriaLabel || 'Sin registros'}</DetailField>
        <DetailField label="Entradas de bitácora">{proyecto.bitacoraTotal}</DetailField>
        <DetailField label="Observaciones pendientes">
          {proyecto.observacionesPendientes}
        </DetailField>
        {proyecto.observacionesTutor ? (
          <DetailField label="Observaciones del tutor" span={3}>
            {proyecto.observacionesTutor}
          </DetailField>
        ) : null}
        {proyecto.observacionesComite ? (
          <DetailField label="Observaciones del comité" span={3}>
            {proyecto.observacionesComite}
          </DetailField>
        ) : null}
      </DetailInfoCard>
    ) : null}
  </div>
);

export default ProyectoDatosSection;
