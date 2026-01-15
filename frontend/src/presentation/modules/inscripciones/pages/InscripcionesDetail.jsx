/**
 * InscripcionesDetail - Página para ver el detalle de una inscripción
 * 
 * Single Responsibility: Mostrar los datos completos de la inscripción recuperados
 * 
 * Atomic Design: Page
 * - Orquesta datos + componentes
 * - Pasa HEADER al Template (estructura)
 * - Muestra los datos de la inscripción en formato de "print"
 * 
 * Arquitectura:
 * Page → Template (header) + Contenido (datos de la inscripción)
 * - Template maneja: estructura/layout (header, content)
 * - Contenido muestra: datos de la inscripción y sus relaciones
 */

import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import { useInscripcionDetailContext } from '@application-inscripciones/hooks';
import { Descriptions, Card, Divider, Spin, Alert, Empty, Tag } from 'antd';
import { createDetailBreadcrumbItems } from '@inscripciones/config';

const InscripcionesDetail = () => {
  const navigate = useNavigate();

  // Obtener datos del contexto
  const {
    inscripcion,
    loading = false,
    error = null,
  } = useInscripcionDetailContext();

  // Configurar breadcrumb items
  const breadcrumbItems = useMemo(() => createDetailBreadcrumbItems(), []);

  // Si está cargando
  if (loading) {
    return (
      <PageTemplate
        header={
          <PageHeader
            title="Detalle de la Inscripción"
            breadcrumbItems={breadcrumbItems}
          />
        }
      >
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large">
            <div style={{ minHeight: '200px' }}>
              <p>Cargando datos de la inscripción...</p>
            </div>
          </Spin>
        </div>
      </PageTemplate>
    );
  }

  // Si hay error
  if (error) {
    return (
      <PageTemplate
        header={
          <PageHeader
            title="Detalle de la Inscripción"
            breadcrumbItems={breadcrumbItems}
          />
        }
      >
        <Alert
          message="Error al cargar la inscripción"
          description={error}
          type="error"
          showIcon
        />
      </PageTemplate>
    );
  }

  // Si no hay inscripción o datos básicos
  if (!inscripcion || !inscripcion.enrollment) {
    return (
      <PageTemplate
        header={
          <PageHeader
            title="Detalle de la Inscripción"
            breadcrumbItems={breadcrumbItems}
          />
        }
      >
        <Empty description="No se encontró información de la inscripción" />
      </PageTemplate>
    );
  }

  // Extraer todas las entidades del contexto
  const { 
    enrollment, 
    studentAcademicData, 
    management, 
    student, 
    career,
    enrollmentSubjects = [] // Por ahora vacío, se implementará después
  } = inscripcion;

  // Función para obtener el color del tag según el estado
  const getStatusColor = (status) => {
    const statusColors = {
      'INSCRITO': 'blue',
      'EN_CURSO': 'processing',
      'APROBADO': 'success',
      'REPROBADO': 'error',
      'ANULADO': 'default',
    };
    return statusColors[status] || 'default';
  };

  // Función para obtener el color del tag según el tipo de inscripción
  const getEnrollmentTypeColor = (type) => {
    const typeColors = {
      'NUEVO': 'green',
      'REINGRESO': 'orange',
      'CONTINUIDAD': 'blue',
      'TRANSFERENCIA_ENTRADA': 'purple',
      'TRASPASO_ENTRADA': 'cyan',
    };
    return typeColors[type] || 'default';
  };

  return (
      <PageTemplate
        header={
          <PageHeader
            title={`Detalle de la Inscripción #${enrollment?.id || 'N/A'}`}
            breadcrumbItems={breadcrumbItems}
          />
        }
      >
      <div style={{ padding: '24px' }}>
        {/* Datos de la Inscripción */}
        <Card title="Datos de la Inscripción" style={{ marginBottom: '24px' }}>
          <Descriptions column={2} bordered>
            <Descriptions.Item label="ID de Inscripción">
              {enrollment?.id || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Tipo de Inscripción">
              {enrollment?.tipoInscripcion ? (
                <Tag color={getEnrollmentTypeColor(enrollment.tipoInscripcion)}>
                  {enrollment.tipoInscripcion}
                </Tag>
              ) : 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Fecha de Inscripción">
              {enrollment?.fechaInscripcion || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Gestión">
              {management?.nombre ? (
                <span>{management.nombre} ({management.anio})</span>
              ) : enrollment?.gestionId || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Estado de Registro">
              {studentAcademicData?.estadoRegistro ? (
                <Tag color={studentAcademicData.estadoRegistro === 'ADMITIDO' ? 'success' : 'warning'}>
                  {studentAcademicData.estadoRegistro}
                </Tag>
              ) : 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Estado">
              {enrollment?.activo !== undefined ? (enrollment.activo ? 'Activo' : 'Inactivo') : 'N/A'}
            </Descriptions.Item>
            {enrollment?.observaciones && (
              <Descriptions.Item label="Observaciones" span={2}>
                {enrollment.observaciones}
              </Descriptions.Item>
            )}
            <Descriptions.Item label="Fecha de Creación">
              {enrollment?.createdAt || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Última Actualización">
              {enrollment?.updatedAt || 'N/A'}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* Datos del Estudiante */}
        {student && (
          <Card title="Datos del Estudiante" style={{ marginBottom: '24px' }}>
            <Descriptions column={2} bordered>
              <Descriptions.Item label="Código de Estudiante">
                {student.codigoEstudiante || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="CI">
                {student.ci ? `${student.ci} ${student.expedicion || ''}` : 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Nombres Completos">
                {student.nombres || 'N/A'} {student.apellidoPaterno || ''} {student.apellidoMaterno || ''}
              </Descriptions.Item>
              <Descriptions.Item label="Género">
                {student.genero || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Celular">
                {student.celular || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Tiene Discapacidad">
                {student.tieneDiscapacidad !== undefined ? (student.tieneDiscapacidad ? 'Sí' : 'No') : 'N/A'}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        )}

        {/* Datos de la Carrera */}
        {career && (
          <Card title="Datos de la Carrera" style={{ marginBottom: '24px' }}>
            <Descriptions column={2} bordered>
              <Descriptions.Item label="Código">
                {career.codigo || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Nombre">
                {career.nombre || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Título Otorgado" span={2}>
                {career.tituloOtorgado || 'N/A'}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        )}

        {/* Datos Académicos del Estudiante */}
        {studentAcademicData && (
          <Card title="Datos Académicos del Estudiante" style={{ marginBottom: '24px' }}>
            <Descriptions column={2} bordered>
              <Descriptions.Item label="ID Datos Académicos">
                {studentAcademicData.id || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Estado de Registro">
                {studentAcademicData.estadoRegistro ? (
                  <Tag color={studentAcademicData.estadoRegistro === 'ADMITIDO' ? 'success' : 'warning'}>
                    {studentAcademicData.estadoRegistro}
                  </Tag>
                ) : 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="ID Estudiante">
                {studentAcademicData.estudianteId || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="ID Carrera">
                {studentAcademicData.carreraId || 'N/A'}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        )}

        {/* Materias Inscritas */}
        {enrollmentSubjects && enrollmentSubjects.length > 0 && (
          <Card title={`Materias Inscritas (${enrollmentSubjects.length})`}>
            {enrollmentSubjects.map((subject, index) => (
              <div key={subject.id || index} style={{ marginBottom: '16px' }}>
                <Descriptions column={2} bordered size="small">
                  <Descriptions.Item label="ID Materia Inscrita">
                    {subject.id || 'N/A'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Estado">
                    {subject.status ? (
                      <Tag color={getStatusColor(subject.status)}>
                        {subject.status}
                      </Tag>
                    ) : 'N/A'}
                  </Descriptions.Item>
                  <Descriptions.Item label="ID Asignación Docente">
                    {subject.teacherAssignmentId || 'N/A'}
                  </Descriptions.Item>
                  <Descriptions.Item label="ID Inscripción">
                    {subject.enrollmentId || 'N/A'}
                  </Descriptions.Item>
                  {subject.observations && (
                    <Descriptions.Item label="Observaciones" span={2}>
                      {subject.observations}
                    </Descriptions.Item>
                  )}
                  {subject.teacherObservations && (
                    <Descriptions.Item label="Observaciones del Docente" span={2}>
                      {subject.teacherObservations}
                    </Descriptions.Item>
                  )}
                  <Descriptions.Item label="Fecha de Creación">
                    {subject.createdAt || 'N/A'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Última Actualización">
                    {subject.updatedAt || 'N/A'}
                  </Descriptions.Item>
                </Descriptions>
                {index < enrollmentSubjects.length - 1 && <Divider />}
              </div>
            ))}
          </Card>
        )}

        {/* Mensaje si no hay materias inscritas */}
        {(!enrollmentSubjects || enrollmentSubjects.length === 0) && (
          <Card title="Materias Inscritas">
            <Empty description="No hay materias inscritas para esta inscripción" />
          </Card>
        )}
      </div>
    </PageTemplate>
  );
};

export default InscripcionesDetail;
