import { Tag } from 'antd';
import { UserOutlined, EnvironmentOutlined } from '@ant-design/icons';
import DetailField from '@docentes/components/atoms/DetailField';
import DetailInfoCard from '@docentes/components/molecules/DetailInfoCard';
import { getEnrollmentTypeColor } from '@application-inscripciones/utils/inscripcionDetailHelpers';

const InscripcionResumenTab = ({
  student,
  nombreCompleto,
  enrollment,
  studentAcademicData,
  management,
  career,
  subjectEnrollments,
  requiereHistorialPrevio,
  historialEstadoInfo,
  cantidadHistorialPrevio,
  priorEnrollmentHistories,
}) => (
  <div className="sd-tab-body">
    <DetailInfoCard title="Estudiante" icon={<UserOutlined />} cols={3} headVariant="resumen">
      <DetailField label="Código">{student?.codigoEstudiante}</DetailField>
      <DetailField label="CI">
        {student?.ci ? `${student.ci}${student.expedicion ? ` ${student.expedicion}` : ''}` : '—'}
      </DetailField>
      <DetailField label="Género">{student?.genero}</DetailField>
      <DetailField label="Nombre completo" span={2}>
        {nombreCompleto || '—'}
      </DetailField>
      <DetailField label="Celular">{student?.celular}</DetailField>
    </DetailInfoCard>

    <DetailInfoCard title="Inscripción y carrera" icon={<EnvironmentOutlined />} cols={3}>
      <DetailField label="Tipo de inscripción">
        {enrollment?.tipoInscripcion ? (
          <Tag color={getEnrollmentTypeColor(enrollment.tipoInscripcion)} style={{ margin: 0 }}>
            {enrollment.tipoInscripcion}
          </Tag>
        ) : (
          '—'
        )}
      </DetailField>
      <DetailField label="Estado de registro">
        {studentAcademicData?.estadoRegistro ? (
          <Tag
            color={studentAcademicData.estadoRegistro === 'ADMITIDO' ? 'success' : 'warning'}
            style={{ margin: 0 }}
          >
            {studentAcademicData.estadoRegistro}
          </Tag>
        ) : (
          '—'
        )}
      </DetailField>
      <DetailField label="Tipo de gestión">{management?.tipo || '—'}</DetailField>
      <DetailField label="Gestión">
        {management?.nombre
          ? `${management.nombre}${management.anio ? ` (${management.anio})` : ''}`
          : '—'}
      </DetailField>
      <DetailField label="Carrera código">{career?.codigo || '—'}</DetailField>
      <DetailField label="Carrera">{career?.nombre || '—'}</DetailField>
      <DetailField label="Título otorgado" span={3}>
        {career?.tituloOtorgado || '—'}
      </DetailField>
      <DetailField label="Materias inscritas" span={3}>
        {subjectEnrollments?.length > 0 ? (
          <span className="sd-badge sd-badge--blue">{subjectEnrollments.length} materia(s)</span>
        ) : (
          '—'
        )}
      </DetailField>
      {requiereHistorialPrevio !== false ? (
        <DetailField label="Historial previo" span={3}>
          <Tag color={historialEstadoInfo.color}>{historialEstadoInfo.text}</Tag>
          {(cantidadHistorialPrevio ?? priorEnrollmentHistories?.length ?? 0) > 0 ? (
            <span style={{ marginLeft: 8, color: 'var(--color-text-secondary)' }}>
              {cantidadHistorialPrevio ?? priorEnrollmentHistories.length} materia(s) registrada(s)
            </span>
          ) : null}
        </DetailField>
      ) : null}
    </DetailInfoCard>
  </div>
);

export default InscripcionResumenTab;
