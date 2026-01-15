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

import { useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Form, Card, Button, Space, Alert, Spin } from 'antd';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import { useStudentDetailContext } from '@application-estudiantes/hooks';
import { createAsignarBecaBreadcrumbItems } from '@estudiantes/config';

const EstudiantesAsignarBeca = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [form] = Form.useForm();

  // Obtener studentId del estado de navegación o de los parámetros
  const studentId = location.state?.studentId || null;

  // Obtener datos del estudiante
  // El conector siempre proporciona el provider, pero solo carga datos si hay studentId
  const studentDetailContext = useStudentDetailContext();
  const student = studentDetailContext?.student?.student || null;
  const loadingStudent = studentDetailContext?.loading || false;

  // Configurar breadcrumb items
  const breadcrumbItems = useMemo(() => createAsignarBecaBreadcrumbItems(), []);

  // Si no hay studentId, mostrar error (después de usar el hook)
  if (!studentId) {
    return (
      <PageTemplate
        header={
          <PageHeader
            title="Asignar Beca"
            breadcrumbItems={breadcrumbItems}
            actions={
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate('/estudiantes')}
              >
                Volver
              </Button>
            }
          />
        }
      >
        <Alert
          message="Error"
          description="No se proporcionó el ID del estudiante. Por favor, seleccione un estudiante desde la lista."
          type="error"
          showIcon
          action={
            <Button size="small" onClick={() => navigate('/estudiantes')}>
              Ir a Lista de Estudiantes
            </Button>
          }
        />
      </PageTemplate>
    );
  }

  // Handler para volver
  const handleVolver = () => {
    if (studentId) {
      navigate(`/estudiantes/${studentId}`);
    } else {
      navigate('/estudiantes');
    }
  };

  // Handler para guardar la asignación de beca
  const handleFinish = async (values) => {
    try {
      // TODO: Implementar la lógica de asignación de beca
      console.log('Asignar beca:', { studentId, values });
      
      // Por ahora, solo mostramos un mensaje
      // En el futuro, aquí se llamará al use case correspondiente
      
      // Después de guardar exitosamente, redirigir al detalle del estudiante
      // navigate(`/estudiantes/${studentId}`);
    } catch (error) {
      console.error('Error al asignar beca:', error);
    }
  };

  return (
    <PageTemplate
      header={
        <PageHeader
          title={`Asignar Beca${student ? ` - ${student.nombreCompleto || student.codigoEstudiante || ''}` : ''}`}
          breadcrumbItems={breadcrumbItems}
          actions={
            <Space>
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={handleVolver}
              >
                Volver
              </Button>
            </Space>
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
          <Card title="Formulario de Asignación de Beca">
            <Alert
              message="Formulario en construcción"
              description="Esta funcionalidad está en desarrollo. Próximamente podrá asignar becas a los estudiantes."
              type="info"
              showIcon
              style={{ marginBottom: '24px' }}
            />

            <Form
              form={form}
              layout="vertical"
              onFinish={handleFinish}
              initialValues={{
                studentId: studentId,
              }}
            >
              {/* Información del estudiante (solo lectura) */}
              {student && (
                <Card
                  type="inner"
                  title="Información del Estudiante"
                  style={{ marginBottom: '24px' }}
                >
                  <Form.Item label="Código de Estudiante">
                    <span>{student.codigoEstudiante || 'N/A'}</span>
                  </Form.Item>
                  <Form.Item label="Nombre Completo">
                    <span>{student.nombreCompleto || 'N/A'}</span>
                  </Form.Item>
                  <Form.Item label="CI">
                    <span>{student.ciCompleto || 'N/A'}</span>
                  </Form.Item>
                </Card>
              )}

              {/* TODO: Agregar campos del formulario de asignación de beca */}
              {/* Por ejemplo:
                - Tipo de beca (select)
                - Porcentaje de beca (input number)
                - Fecha de inicio (date picker)
                - Fecha de fin (date picker)
                - Observaciones (textarea)
                - Estado (select)
              */}

              <Form.Item>
                <Space>
                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={<SaveOutlined />}
                    disabled={true} // Deshabilitado hasta implementar la funcionalidad
                  >
                    Asignar Beca
                  </Button>
                  <Button onClick={handleVolver}>
                    Cancelar
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        )}
      </div>
    </PageTemplate>
  );
};

export default EstudiantesAsignarBeca;
