/**
 * EstudiantesAsignarBeca - Página para asignar una beca a un estudiante
 * 
 * Single Responsibility: Mostrar el formulario para asignar una beca a un estudiante
 * 
 * Atomic Design: Page
 * - Orquesta datos + componentes
 * - Pasa HEADER al Template (estructura)
 * - Muestra formulario de asignación de beca
 * 
 * Arquitectura:
 * Page → Template (header) + Contenido (formulario de asignación)
 * - Template maneja: estructura/layout (header, content)
 * - Contenido muestra: formulario para asignar beca
 */

import { useLocation } from 'react-router-dom';
import { Alert, Form, Spin } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import { Button } from '@atoms';
import { useStudentDetailContext, useAsignarBecaContext } from '@application-estudiantes/hooks';
import { 
  StudentInfoSection, 
  BecaSelectionSection, 
  SelectedBecaSection 
} from '@estudiantes/components/organisms';
import { BecaCardContent } from '@estudiantes/components/molecules';

const EstudiantesAsignarBeca = () => {
  const location = useLocation();

  // Obtener studentId del estado de navegación
  const studentId = location.state?.studentId || null;
  const editBecaAsignada = location.state?.editBecaAsignada || null;

  // Obtener datos del estudiante
  const studentDetailContext = useStudentDetailContext();
  const student = studentDetailContext?.student?.student || null;
  const loadingStudent = studentDetailContext?.loading || false;

  // Obtener TODO del contexto de asignar beca (toda la lógica está aquí)
  const asignarBecaContext = useAsignarBecaContext();
  const {
    pageTitle,
    breadcrumbItems,
    handleVolver,
    form,
    handleFinish,
    loading: loadingAsignar,
    becasDescuentosData,
  } = asignarBecaContext;

  // Función para renderizar cada card de beca
  const renderBecaCard = (beca) => {
    return <BecaCardContent beca={beca} />;
  };

  // Si no hay studentId, mostrar error
  if (!studentId) {
    return (
      <PageTemplate
        header={
          <PageHeader
            title={pageTitle || "Asignar Beca"}
            breadcrumbItems={breadcrumbItems || []}
            actions={
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={handleVolver || (() => { window.location.href = '/estudiantes/listar'; })}
                variant="primary"
              >
                Volver
              </Button>
            }
          />
        }
      >
        <Alert
          title="Error"
          description="No se proporcionó el ID del estudiante. Por favor, seleccione un estudiante desde la lista."
          type="error"
          showIcon
          action={
            <Button 
              size="small" 
              onClick={() => window.location.href = '/estudiantes/listar'}
              variant="default"
            >
              Ir a Lista de Estudiantes
            </Button>
          }
        />
      </PageTemplate>
    );
  }

  return (
    <PageTemplate
      header={
        <PageHeader
          title={pageTitle || `Asignar Beca${student ? ` - ${student.nombreCompleto || student.codigoEstudiante || ''}` : ''}`}
          breadcrumbItems={breadcrumbItems || []}
          actions={
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={handleVolver}
              variant="default"
            >
              Volver
            </Button>
          }
        />
      }
    >
      <div style={{ padding: '24px' }}>
        {loadingStudent ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <Spin size="large">
              <div style={{ minHeight: '200px' }}>
                <p>Cargando datos del estudiante...</p>
              </div>
            </Spin>
          </div>
        ) : (
          <Form
            form={form}
            onFinish={(values) => handleFinish(values, becasDescuentosData.selectedBecaDescuento)}
            layout="vertical"
          >
            {/* Sección 1: Información del Estudiante */}
            <StudentInfoSection student={student} />

            {/* Sección 2: Selección de Beca/Descuento */}
            <BecaSelectionSection
              becasDescuentosData={becasDescuentosData}
              onSelectBeca={becasDescuentosData.handleSelectBeca}
              renderBecaCard={renderBecaCard}
              form={form}
              onFinish={handleFinish}
              studentId={studentId}
            />

            {/* Sección 3: Beca/Descuento Seleccionada */}
            <SelectedBecaSection
              selectedBecaDescuento={becasDescuentosData.selectedBecaDescuento}
              form={form}
              onFinish={handleFinish}
              onCancel={handleVolver}
              disabled={!becasDescuentosData.selectedBecaDescuento || loadingStudent || loadingAsignar}
              isEditMode={Boolean(editBecaAsignada?.id)}
            />
          </Form>
        )}
      </div>
    </PageTemplate>
  );
};

export default EstudiantesAsignarBeca;
