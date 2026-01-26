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
import { usePagosContextOptional } from '@application-pagos/hooks';
import { downloadFile } from '@application/utils';
import { Spin, Alert, Empty, Card, Descriptions, Tag, App } from 'antd';
import { GiftOutlined, FileTextOutlined, DollarOutlined, DownloadOutlined, BookOutlined, EyeOutlined, ArrowLeftOutlined, PlusCircleOutlined } from '@ant-design/icons';
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
  const { message } = App.useApp(); // Hook de message para consumir el contexto del tema

  // Obtener datos del contexto
  const {
    student,
    loading = false,
    error = null,
  } = useStudentDetailContext();

  // Hook para generar acta de compromiso
  const { generateActaCompromiso, loading: loadingActa } = useGenerateActaCompromiso();

  // Obtener contexto de pagos para verificar si el estudiante ya tiene un pago
  // Usar hook opcional que no lanza error si el provider no está disponible
  const pagosContext = usePagosContextOptional();

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

  // Handler para navegar al registro de pagos o al detalle si ya existe un pago
  const handleRegistrarPago = useCallback(() => {
    if (!studentId) {
      message.warning('ID de estudiante no disponible');
      return;
    }

    // Verificar si el estudiante ya tiene un pago
    if (pagosContext?.pagos && Array.isArray(pagosContext.pagos)) {
      // Filtrar pagos del estudiante
      const pagosEstudiante = pagosContext.pagos.filter((pago) => {
        const pagoStudentId = pago.estudiante?.id || 
                             pago.student?.id || 
                             pago.estudianteId || 
                             pago.studentId || 
                             pago.estudiante_id || 
                             pago.student_id;
        return Number(pagoStudentId) === Number(studentId);
      });

      // Si hay pagos, obtener el más reciente (por ID o fecha de creación)
      if (pagosEstudiante.length > 0) {
        // Ordenar por ID descendente (el más reciente primero) o por fecha
        const pagoMasReciente = pagosEstudiante.sort((a, b) => {
          // Intentar ordenar por ID primero
          const idA = a.id || 0;
          const idB = b.id || 0;
          if (idA !== idB) return idB - idA;
          
          // Si no hay ID, ordenar por fecha de creación
          const fechaA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const fechaB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return fechaB - fechaA;
        })[0];

        // Navegar al detalle del pago más reciente
        const pagoId = pagoMasReciente.id;
        if (pagoId) {
          navigate(`/pagos/${pagoId}`);
          return;
        }
      }
    }

    // Si no hay pagos, navegar al registro
    navigate('/pagos/registrar', {
      state: { studentId: studentId }
    });
  }, [navigate, studentId, pagosContext, message]);

  // Handler para generar y descargar acta de compromiso
  const handleGenerateActaCompromiso = useCallback(async () => {
    if (!studentId) {
      message.error('ID de estudiante no disponible');
      return;
    }

    const result = await generateActaCompromiso(studentId);

    if (!result.success) {
      // Extraer el mensaje de error (puede ser string u objeto con code/message)
      let errorMessage = 'Error al generar el acta de compromiso';

      if (result.error) {
        if (typeof result.error === 'string') {
          errorMessage = result.error;
        } else if (result.error.message) {
          errorMessage = result.error.message;
        } else if (result.error.code) {
          errorMessage = `${result.error.code}: ${result.error.message || 'Error desconocido'}`;
        }
      } else if (result.message) {
        errorMessage = result.message;
      }

      message.error(errorMessage);
    } else {
      // Mostrar mensaje de éxito si success: true (el archivo ya se descargó automáticamente)
      message.success('Acta de compromiso generada y descargada correctamente');
    }
  }, [studentId, generateActaCompromiso]);

  // Handler para descargar acta de compromiso existente
  const handleDownloadActaCompromiso = useCallback(() => {
    const actaCompromisoData = student?.actaCompromiso;
    if (actaCompromisoData) {
      try {
        downloadFile(actaCompromisoData.filePath, actaCompromisoData.fileName);
      } catch (err) {
        console.error('Error al descargar el acta de compromiso:', err);
        message.error('Error al descargar el acta de compromiso');
      }
    }
  }, [student]);

  // Handler para ver detalle de inscripción
  const handleVerInscripcion = useCallback(() => {
    if (student?.inscripcion?.enrollment?.id) {
      navigate(`/inscripciones/${student.inscripcion.enrollment.id}`, {
        state: { studentId: studentId }
      });
    }
  }, [navigate, student, studentId]);

  // Handler para registrar nueva inscripción
  const handleNuevaInscripcion = useCallback(() => {
    navigate('/inscripciones/nueva', {
      state: { studentId: studentId }
    });
  }, [navigate, studentId]);

  // Handler para volver a la lista de estudiantes
  const handleVolverALista = useCallback(() => {
    navigate('/estudiantes');
  }, [navigate]);

  // Acciones del header (botones) - debe estar antes de los returns tempranos
  // Solo mostrar botón de acta si faltan documentos
  // El campo tieneDocumentosFaltantes viene al nivel raíz del objeto student
  const tieneDocumentosFaltantesFlag = student?.tieneDocumentosFaltantes === true;
  const actaCompromisoData = student?.actaCompromiso;
  const headerActions = useMemo(() => (
    <>
      <Button
        variant="default"
        icon={<ArrowLeftOutlined />}
        onClick={handleVolverALista}
        style={{ marginRight: 8 }}
      >
        Volver a la Lista
      </Button>
      {/* 1. Acta de Compromiso */}
      {actaCompromisoData ? (
        <Button
          variant="warning"
          buttonStyle="filled"
          icon={<DownloadOutlined />}
          onClick={handleDownloadActaCompromiso}
          style={{ marginRight: 8 }}
        >
          Descargar Acta de Compromiso
        </Button>
      ) : tieneDocumentosFaltantesFlag ? (
        <Button
          variant="warning"
          buttonStyle="filled"
          icon={<FileTextOutlined />}
          onClick={handleGenerateActaCompromiso}
          loading={loadingActa}
          style={{ marginRight: 8 }}
        >
          Generar Acta de Compromiso
        </Button>
      ) : null}
      {/* 2. Asignar Beca */}
      <Button
        variant="success"
        icon={<GiftOutlined />}
        onClick={handleAsignarBeca}
        style={{ marginRight: 8 }}
      >
        Asignar Beca
      </Button>
      {/* 3. Registrar Pago */}
      <div style={{ marginRight: 8, display: 'inline-block' }}>
        <Button
          variant="error"
          icon={<DollarOutlined />}
          onClick={handleRegistrarPago}
        >
          Registrar Pago
        </Button>
      </div>
      {/* 4. Nueva Inscripción */}
      <Button
        variant="primary"
        icon={<PlusCircleOutlined />}
        onClick={handleNuevaInscripcion}
      >
        Nueva Inscripción
      </Button>
    </>
  ), [handleAsignarBeca, handleGenerateActaCompromiso, handleRegistrarPago, handleDownloadActaCompromiso, handleVolverALista, handleNuevaInscripcion, loadingActa, tieneDocumentosFaltantesFlag, actaCompromisoData]);

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

  const { student: studentData, guardians, disabilities, origins, documentDeliveries, scholarships, tieneDocumentosFaltantes, actaCompromiso, inscripcion } = student;

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

        {/* Inscripción Actual */}
        {inscripcion && inscripcion.enrollment && (
          <Card
            title={
              <span>
                <BookOutlined style={{ marginRight: 8 }} />
                Inscripción Actual
              </span>
            }
            style={{ marginTop: '24px' }}
            extra={
              <Button
                variant="primary"
                icon={<EyeOutlined />}
                onClick={handleVerInscripcion}
              >
                Ver Detalle
              </Button>
            }
          >
            <Descriptions column={2} bordered>
              <Descriptions.Item label="ID de Inscripción">
                {inscripcion.enrollment.id || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Tipo de Inscripción">
                {inscripcion.enrollment.enrollmentType ? (
                  <Tag color="blue">{inscripcion.enrollment.enrollmentType}</Tag>
                ) : 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Gestión">
                {inscripcion.management?.name ? (
                  <span>{inscripcion.management.name} ({inscripcion.management.year})</span>
                ) : inscripcion.enrollment.managementId ? `ID: ${inscripcion.enrollment.managementId}` : 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Carrera">
                {inscripcion.career?.name ? (
                  <span>{inscripcion.career.code} - {inscripcion.career.name}</span>
                ) : inscripcion.studentAcademicData?.careerId ? `ID: ${inscripcion.studentAcademicData.careerId}` : 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Estado de Registro">
                {inscripcion.studentAcademicData?.registrationStatus ? (
                  <Tag color={inscripcion.studentAcademicData.registrationStatus === 'ADMITIDO' ? 'success' : 'warning'}>
                    {inscripcion.studentAcademicData.registrationStatus}
                  </Tag>
                ) : 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Materias Inscritas">
                {inscripcion.enrollmentSubjects && inscripcion.enrollmentSubjects.length > 0 ? (
                  <Tag color="blue">{inscripcion.enrollmentSubjects.length} materia(s)</Tag>
                ) : 'N/A'}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        )}
      </div>
    </PageTemplate>
  );
};

export default EstudiantesDetail;

