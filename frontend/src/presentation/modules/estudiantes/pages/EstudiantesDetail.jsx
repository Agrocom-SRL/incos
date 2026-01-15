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

import { useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import { useStudentDetailContext } from '@application-estudiantes/hooks';
import { Descriptions, Card, Divider, Spin, Alert, Empty, Button } from 'antd';
import { GiftOutlined } from '@ant-design/icons';
import { createDetailBreadcrumbItems } from '@estudiantes/config';

const EstudiantesDetail = () => {
  const navigate = useNavigate();
  const { id: studentId } = useParams();

  // Obtener datos del contexto
  const {
    student,
    loading = false,
    error = null,
  } = useStudentDetailContext();

  // Configurar breadcrumb items
  const breadcrumbItems = useMemo(() => createDetailBreadcrumbItems(), []);

  // Handler para navegar a la asignación de becas
  const handleAsignarBeca = useCallback(() => {
    navigate('/estudiantes/becas/asignar', {
      state: { studentId: studentId }
    });
  }, [navigate, studentId]);

  // Acciones del header (botón de asignar beca) - debe estar antes de los returns tempranos
  const headerActions = useMemo(() => (
    <Button
      type="primary"
      icon={<GiftOutlined />}
      onClick={handleAsignarBeca}
    >
      Asignar Beca
    </Button>
  ), [handleAsignarBeca]);

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
          <Spin size="large">
            <div style={{ minHeight: '200px' }}>
              <p>Cargando datos del estudiante...</p>
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
          actions={headerActions}
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
              {studentData.estadoCivilName || studentData.estadoCivilId || 'N/A'}
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
            <Descriptions.Item label="Zona" span={2}>
              {studentData.zona || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Residencia Completa" span={2}>
              {studentData.residenceAddressComplete || 
               (studentData.municipioResidenciaName ? 
                 `${studentData.municipioResidenciaName}${studentData.provinciaResidenciaName ? `, ${studentData.provinciaResidenciaName}` : ''}${studentData.departamentoResidenciaName ? `, ${studentData.departamentoResidenciaName}` : ''}` 
                 : 'N/A')}
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
              <div key={guardian.id || index} style={{ marginBottom: '16px' }}>
                <Descriptions column={2} bordered size="small">
                  <Descriptions.Item label="Tipo de Parentesco">
                    {guardian.relationshipTypeName || guardian.relationshipTypeId || 'N/A'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Nombres">
                    {guardian.firstName || guardian.nombres || 'N/A'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Apellidos">
                    {guardian.lastName || guardian.apellidos || 'N/A'}
                  </Descriptions.Item>
                  <Descriptions.Item label="CI">
                    {guardian.ci || 'N/A'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Teléfono">
                    {guardian.phone || guardian.telefono || 'N/A'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Email">
                    {guardian.email || 'N/A'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Ocupación">
                    {guardian.occupation || guardian.ocupacion || 'N/A'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Lugar de Trabajo">
                    {guardian.workplace || guardian.lugarTrabajo || 'N/A'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Dirección" span={2}>
                    {guardian.address || guardian.direccion || 'N/A'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Contacto de Emergencia">
                    {guardian.isEmergencyContact ? 'Sí' : 'No'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Vive con Estudiante">
                    {guardian.livesWithStudent ? 'Sí' : 'No'}
                  </Descriptions.Item>
                  {guardian.observations && (
                    <Descriptions.Item label="Observaciones" span={2}>
                      {guardian.observations}
                    </Descriptions.Item>
                  )}
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
              <div key={disability.id || index} style={{ marginBottom: '16px' }}>
                <Descriptions column={2} bordered size="small">
                  <Descriptions.Item label="Tipo de Discapacidad">
                    {disability.disabilityTypeName || disability.disabilityTypeId || 'N/A'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Grado">
                    {disability.disabilityDegree || disability.gradoDiscapacidad || 'N/A'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Descripción" span={2}>
                    {disability.description || disability.descripcion || 'N/A'}
                  </Descriptions.Item>
                  {disability.causa && (
                    <Descriptions.Item label="Causa" span={2}>
                      {disability.causa}
                    </Descriptions.Item>
                  )}
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
              <div key={origin.id || index} style={{ marginBottom: '16px' }}>
                <Descriptions column={2} bordered size="small">
                  <Descriptions.Item label="Tipo de Origen">
                    {origin.originType || origin.tipoOrigen || 'N/A'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Principal">
                    {origin.isPrincipal ? 'Sí' : 'No'}
                  </Descriptions.Item>
                  <Descriptions.Item label="País">
                    {origin.countryName || origin.countryId || 'N/A'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Lugar de Nacimiento" span={2}>
                    {origin.originAddressComplete || origin.birthCity || 'N/A'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Idioma Materno">
                    {origin.motherTongueName || origin.motherTongueId || 'N/A'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Idioma Secundario">
                    {origin.secondaryLanguageName || origin.secondaryLanguageId || 'N/A'}
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
              <div key={doc.id || index} style={{ marginBottom: '16px' }}>
                <Descriptions column={2} bordered size="small">
                  <Descriptions.Item label="Documento">
                    {doc.documentacionName || doc.documentacionId || 'N/A'}
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
                  <Descriptions.Item label="Fecha Vencimiento Trámite">
                    {doc.fechaVencimientoTramite || 'N/A'}
                  </Descriptions.Item>
                  {doc.observaciones && (
                    <Descriptions.Item label="Observaciones" span={2}>
                      {doc.observaciones}
                    </Descriptions.Item>
                  )}
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

