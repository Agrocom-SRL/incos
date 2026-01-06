/**
 * EstudiantesDetail - Página para ver el detalle de un estudiante
 * 
 * Single Responsibility: Mostrar los datos completos del estudiante recuperados
 * 
 * Atomic Design: Page
 * - Orquesta datos + componentes
 * - Pasa HEADER al Template (estructura)
 * - Muestra los datos del estudiante en formato de "print"
 * 
 * Arquitectura:
 * Page → Template (header) + Contenido (datos del estudiante)
 * - Template maneja: estructura/layout (header, content)
 * - Contenido muestra: datos del estudiante y sus relaciones
 */

import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import { useStudentDetailContext } from '@application-estudiantes/hooks';
import { Descriptions, Card, Divider, Spin, Alert, Empty } from 'antd';
import { createDetailBreadcrumbItems } from '@estudiantes/config';

const EstudiantesDetail = () => {
  const navigate = useNavigate();

  // Obtener datos del contexto
  const {
    student,
    loading = false,
    error = null,
  } = useStudentDetailContext();

  // Configurar breadcrumb items
  const breadcrumbItems = useMemo(() => createDetailBreadcrumbItems(), []);

  // Si está cargando
  if (loading) {
    return (
      <PageTemplate
        header={
          <PageHeader
            title="Detalle del Estudiante"
            breadcrumbItems={breadcrumbItems}
          />
        }
      >
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" tip="Cargando datos del estudiante..." />
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
            title="Detalle del Estudiante"
            breadcrumbItems={breadcrumbItems}
          />
        }
      >
        <Alert
          message="Error al cargar el estudiante"
          description={error}
          type="error"
          showIcon
        />
      </PageTemplate>
    );
  }

  // Si no hay estudiante
  if (!student || !student.student) {
    return (
      <PageTemplate
        header={
          <PageHeader
            title="Detalle del Estudiante"
            breadcrumbItems={breadcrumbItems}
          />
        }
      >
        <Empty description="No se encontró información del estudiante" />
      </PageTemplate>
    );
  }

  const { student: studentData, guardians, disabilities, origins, documentDeliveries } = student;

  return (
    <PageTemplate
      header={
        <PageHeader
          title={`Detalle del Estudiante: ${studentData.nombreCompleto || 'N/A'}`}
          breadcrumbItems={breadcrumbItems}
        />
      }
    >
      <div style={{ padding: '24px' }}>
        {/* Datos Personales */}
        <Card title="Datos Personales" style={{ marginBottom: '24px' }}>
          <Descriptions column={2} bordered>
            <Descriptions.Item label="Código de Estudiante">
              {studentData.codigoEstudiante || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="CI Completo">
              {studentData.ciCompleto || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Nombres">
              {studentData.nombres || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Apellido Paterno">
              {studentData.apellidoPaterno || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Apellido Materno">
              {studentData.apellidoMaterno || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Nombre Completo">
              {studentData.nombreCompleto || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Fecha de Nacimiento">
              {studentData.fechaNacimiento || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Género">
              {studentData.genero || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Estado Civil">
              {studentData.estadoCivil || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Tipo de Sangre">
              {studentData.tipoSangre || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Tiene Discapacidad">
              {studentData.tieneDiscapacidad ? 'Sí' : 'No'}
            </Descriptions.Item>
            <Descriptions.Item label="Email Personal">
              {studentData.emailPersonal || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Celular">
              {studentData.celular || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Teléfono Fijo">
              {studentData.telefonoFijo || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Dirección" span={2}>
              {studentData.direccion || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Municipio de Residencia">
              {studentData.municipioResidencia || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Zona">
              {studentData.zona || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Observaciones" span={2}>
              {studentData.observaciones || 'N/A'}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* Apoderados/Contactos de Emergencia */}
        {guardians && guardians.length > 0 && (
          <Card title="Apoderados / Contactos de Emergencia" style={{ marginBottom: '24px' }}>
            {guardians.map((guardian, index) => (
              <div key={index} style={{ marginBottom: '16px' }}>
                <Descriptions column={2} bordered size="small">
                  <Descriptions.Item label="Nombres">
                    {guardian.nombres || guardian.firstName || 'N/A'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Apellidos">
                    {guardian.apellidos || guardian.lastName || 'N/A'}
                  </Descriptions.Item>
                  <Descriptions.Item label="CI">
                    {guardian.ci || 'N/A'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Teléfono">
                    {guardian.telefono || guardian.phone || 'N/A'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Celular">
                    {guardian.celular || guardian.mobilePhone || 'N/A'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Email">
                    {guardian.email || 'N/A'}
                  </Descriptions.Item>
                </Descriptions>
                {index < guardians.length - 1 && <Divider />}
              </div>
            ))}
          </Card>
        )}

        {/* Discapacidades */}
        {disabilities && disabilities.length > 0 && (
          <Card title="Discapacidades" style={{ marginBottom: '24px' }}>
            {disabilities.map((disability, index) => (
              <div key={index} style={{ marginBottom: '16px' }}>
                <Descriptions column={2} bordered size="small">
                  <Descriptions.Item label="Tipo de Discapacidad">
                    {disability.tipoDiscapacidad || disability.disabilityType || 'N/A'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Grado">
                    {disability.gradoDiscapacidad || disability.disabilityDegree || 'N/A'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Descripción" span={2}>
                    {disability.descripcion || disability.description || 'N/A'}
                  </Descriptions.Item>
                </Descriptions>
                {index < disabilities.length - 1 && <Divider />}
              </div>
            ))}
          </Card>
        )}

        {/* Orígenes */}
        {origins && origins.length > 0 && (
          <Card title="Orígenes" style={{ marginBottom: '24px' }}>
            {origins.map((origin, index) => (
              <div key={index} style={{ marginBottom: '16px' }}>
                <Descriptions column={2} bordered size="small">
                  <Descriptions.Item label="Tipo de Origen">
                    {origin.tipoOrigen || origin.originType || 'N/A'}
                  </Descriptions.Item>
                  <Descriptions.Item label="País">
                    {origin.pais || origin.country || 'N/A'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Ciudad de Nacimiento">
                    {origin.ciudadNacimiento || origin.birthCity || 'N/A'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Idioma Materno">
                    {origin.idiomaMaterno || origin.motherTongue || 'N/A'}
                  </Descriptions.Item>
                </Descriptions>
                {index < origins.length - 1 && <Divider />}
              </div>
            ))}
          </Card>
        )}

        {/* Documentos Entregados */}
        {documentDeliveries && documentDeliveries.length > 0 && (
          <Card title="Documentos Entregados">
            {documentDeliveries.map((doc, index) => (
              <div key={index} style={{ marginBottom: '16px' }}>
                <Descriptions column={2} bordered size="small">
                  <Descriptions.Item label="Documento">
                    {doc.documento || doc.document || 'N/A'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Entregado">
                    {doc.entregado ? 'Sí' : 'No'}
                  </Descriptions.Item>
                  <Descriptions.Item label="En Trámite">
                    {doc.enTramite ? 'Sí' : 'No'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Es Original">
                    {doc.esOriginal ? 'Sí' : 'No'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Fecha de Entrega">
                    {doc.fechaEntrega || 'N/A'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Observaciones" span={2}>
                    {doc.observaciones || 'N/A'}
                  </Descriptions.Item>
                </Descriptions>
                {index < documentDeliveries.length - 1 && <Divider />}
              </div>
            ))}
          </Card>
        )}
      </div>
    </PageTemplate>
  );
};

export default EstudiantesDetail;

