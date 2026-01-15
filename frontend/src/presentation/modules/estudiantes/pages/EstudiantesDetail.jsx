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
import { Spin, Alert, Empty, Button } from 'antd';
import { GiftOutlined } from '@ant-design/icons';
import { createDetailBreadcrumbItems } from '@estudiantes/config';
import {
  DatosPersonalesSection,
  GuardiansSection,
  DisabilitiesSection,
  OriginsSection,
  DocumentDeliveriesSection
} from '@estudiantes/components/organisms';

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
        <DatosPersonalesSection studentData={studentData} />

        {/* Apoderados/Contactos de Emergencia */}
        <GuardiansSection guardians={guardians} />

        {/* Discapacidades */}
        <DisabilitiesSection disabilities={disabilities} />

        {/* Orígenes */}
        <OriginsSection origins={origins} />

        {/* Documentos Entregados */}
        <DocumentDeliveriesSection documentDeliveries={documentDeliveries} />
      </div>
    </PageTemplate>
  );
};

export default EstudiantesDetail;

