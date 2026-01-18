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
import { useGenerateActaCompromiso } from '@application-estudiantes/hooks';
import { Spin, Alert, Empty, message } from 'antd';
import { GiftOutlined, FileTextOutlined, DollarOutlined } from '@ant-design/icons';
import { Button } from '@atoms';
import {
  DatosPersonalesSection,
  GuardiansSection,
  DisabilitiesSection,
  OriginsSection,
  DocumentDeliveriesSection,
  ScholarshipsSection
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

  // Hook para generar acta de compromiso
  const { generateActaCompromiso, loading: loadingActa } = useGenerateActaCompromiso();

  // Configurar breadcrumb items
  const breadcrumbItems = useMemo(() => [
    { title: 'Inicio', href: '/' },
    { title: 'Estudiantes', href: '/estudiantes' },
    { title: 'Detalle del Estudiante' },
  ], []);

  // Handler para navegar a la asignación de becas
  const handleAsignarBeca = useCallback(() => {
    navigate('/estudiantes/becas/asignar', {
      state: { studentId: studentId }
    });
  }, [navigate, studentId]);

  // Handler para navegar al registro de pagos
  const handleRegistrarPago = useCallback(() => {
    navigate('/pagos/registrar', {
      state: { studentId: studentId }
    });
  }, [navigate, studentId]);

  // Handler para generar y descargar acta de compromiso
  const handleGenerateActaCompromiso = useCallback(async () => {
    if (!studentId) {
      message.error('ID de estudiante no disponible');
      return;
    }

    const result = await generateActaCompromiso(studentId);

    if (!result.success) {
      // Mostrar mensaje de error si success: false
      const errorMessage = result.error || result.message || 'Error al generar el acta de compromiso';
      message.error(errorMessage);
    } else {
      // Mostrar mensaje de éxito si success: true (el archivo ya se descargó automáticamente)
      message.success('Acta de compromiso generada y descargada correctamente');
    }
  }, [studentId, generateActaCompromiso]);

  // Acciones del header (botones) - debe estar antes de los returns tempranos
  // Solo mostrar botón de acta si faltan documentos
  // El campo tieneDocumentosFaltantes viene al nivel raíz del objeto student
  const tieneDocumentosFaltantesFlag = student?.tieneDocumentosFaltantes === true;
  const headerActions = useMemo(() => (
    <>
      {tieneDocumentosFaltantesFlag && (
        <Button
          variant="default"
          icon={<FileTextOutlined />}
          onClick={handleGenerateActaCompromiso}
          loading={loadingActa}
          style={{ marginRight: 8 }}
        >
          Generar Acta de Compromiso
        </Button>
      )}
      <div style={{ marginRight: 8, display: 'inline-block' }}>
        <Button
          variant="warning"
          style="outlined"
          icon={<DollarOutlined />}
          onClick={handleRegistrarPago}
        >
          Registrar Pago
        </Button>
      </div>
      <Button
        variant="primary"
        icon={<GiftOutlined />}
        onClick={handleAsignarBeca}
      >
        Asignar Beca
      </Button>
    </>
  ), [handleAsignarBeca, handleGenerateActaCompromiso, handleRegistrarPago, loadingActa, tieneDocumentosFaltantesFlag]);

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

  const { student: studentData, guardians, disabilities, origins, documentDeliveries, scholarships, tieneDocumentosFaltantes } = student;

  // Debug: Log para verificar la estructura del objeto student
  console.log('[EstudiantesDetail] Estructura del objeto student:', {
    tieneStudent: !!student?.student,
    tieneTieneDocumentosFaltantes: 'tieneDocumentosFaltantes' in (student || {}),
    tieneDocumentosFaltantesValue: student?.tieneDocumentosFaltantes,
    studentKeys: student ? Object.keys(student) : [],
  });

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

        {/* Becas Asignadas */}
        <ScholarshipsSection scholarships={scholarships} />
      </div>
    </PageTemplate>
  );
};

export default EstudiantesDetail;

