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

import { useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Form, Descriptions, Space, Alert, Spin, Typography, Row, Col } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, UserOutlined, IdcardOutlined, BarcodeOutlined, GiftOutlined, PercentageOutlined, FileTextOutlined } from '@ant-design/icons';
import { PageTemplate } from '@templates';
import { PageHeader, DataCards } from '@molecules';
import { Button, Card } from '@atoms';
import { useStudentDetailContext, useAsignarBecaContext } from '@application-estudiantes/hooks';
import { createAsignarBecaBreadcrumbItems } from '@estudiantes/config';

const { Title, Text } = Typography;

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

  // Obtener datos del contexto de asignar beca
  const asignarBecaContext = useAsignarBecaContext();
  const {
    becasDescuentosData,
    onSelectBecaDescuento,
  } = asignarBecaContext;

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
                variant="primary"
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
            <Button 
              size="small" 
              onClick={() => navigate('/estudiantes')}
              variant="default"
            >
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

  // Handler para seleccionar una beca/descuento
  const handleSelectBeca = useCallback((beca) => {
    onSelectBecaDescuento(beca);
    // Actualizar el formulario con el ID de la beca seleccionada
    form.setFieldsValue({ becaDescuentoId: beca.id });
  }, [onSelectBecaDescuento, form]);

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

  // Función para renderizar cada card de beca/descuento
  const renderBecaCard = useCallback((beca) => {
    return (
      <>
        <div style={{ marginBottom: '12px', textAlign: 'center' }}>
          <Text strong type="primary" style={{ fontSize: '32px', fontWeight: 'bold', display: 'block' }}>
            {beca.porcentaje}%
          </Text>
        </div>
        <div style={{ marginBottom: '8px' }}>
          <Title level={5} style={{ margin: 0, textAlign: 'center' }}>
            {beca.nombre}
          </Title>
        </div>
        {beca.descripcion && (
          <div style={{ marginTop: '8px' }}>
            <Text type="secondary" style={{ fontSize: '12px', display: 'block', textAlign: 'center' }}>
              {beca.descripcion}
            </Text>
          </div>
        )}
      </>
    );
  }, []);

  return (
    <PageTemplate
      header={
        <PageHeader
          title={`Asignar Beca${student ? ` - ${student.nombreCompleto || student.codigoEstudiante || ''}` : ''}`}
          breadcrumbItems={breadcrumbItems}
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
          <>
            {/* Sección 1: Información del Estudiante (diseño moderno) */}
            {student && (
              <Card
                title="Información del Estudiante"
                style={{ marginBottom: '24px' }}
                headerColor="primary"
              >
                <Row gutter={[24, 16]}>
                  <Col xs={24} sm={12}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '12px',
                      padding: '16px',
                      backgroundColor: 'var(--color-fill-tertiary, #f5f5f5)',
                      borderRadius: '8px',
                      border: '1px solid var(--color-border-secondary, #e8e8e8)'
                    }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--color-primary, #1890ff)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <BarcodeOutlined style={{ fontSize: '24px', color: '#fff' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>
                          Código de Estudiante
                        </Text>
                        <Text strong style={{ fontSize: '16px', display: 'block' }}>
                          {student.codigoEstudiante || 'N/A'}
                        </Text>
                      </div>
                    </div>
                  </Col>
                  <Col xs={24} sm={12}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '12px',
                      padding: '16px',
                      backgroundColor: 'var(--color-fill-tertiary, #f5f5f5)',
                      borderRadius: '8px',
                      border: '1px solid var(--color-border-secondary, #e8e8e8)'
                    }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--color-primary, #1890ff)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <UserOutlined style={{ fontSize: '24px', color: '#fff' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>
                          Nombre Completo
                        </Text>
                        <Text strong style={{ fontSize: '16px', display: 'block' }}>
                          {student.nombreCompleto || 'N/A'}
                        </Text>
                      </div>
                    </div>
                  </Col>
                  <Col xs={24} sm={12}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '12px',
                      padding: '16px',
                      backgroundColor: 'var(--color-fill-tertiary, #f5f5f5)',
                      borderRadius: '8px',
                      border: '1px solid var(--color-border-secondary, #e8e8e8)'
                    }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--color-primary, #1890ff)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <IdcardOutlined style={{ fontSize: '24px', color: '#fff' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>
                          CI Completo
                        </Text>
                        <Text strong style={{ fontSize: '16px', display: 'block' }}>
                          {student.ciCompleto || 'N/A'}
                        </Text>
                      </div>
                    </div>
                  </Col>
                </Row>
              </Card>
            )}

            {/* Sección 2: Selección de Beca/Descuento */}
            <Card
              title="Seleccionar Beca o Descuento"
              style={{ marginTop: '24px', marginBottom: '24px' }}
              headerColor="primary"
              style={{ backgroundColor: 'var(--color-fill-tertiary, #f5f5f5)' }}
            >
              {becasDescuentosData.error && (
                <Alert
                  message="Error al cargar becas y descuentos"
                  description={becasDescuentosData.error}
                  type="error"
                  showIcon
                  style={{ marginBottom: '24px' }}
                />
              )}

              <Form
                form={form}
                layout="vertical"
                onFinish={handleFinish}
                initialValues={{
                  studentId: studentId,
                }}
              >
                <Form.Item
                  name="becaDescuentoId"
                  rules={[
                    { required: true, message: 'Por favor seleccione una beca o descuento' }
                  ]}
                >
                  <DataCards
                    data={becasDescuentosData.becasDescuentos || []}
                    loading={becasDescuentosData.loading}
                    emptyMessage="No hay becas o descuentos disponibles"
                    renderItem={renderBecaCard}
                    onSelect={handleSelectBeca}
                    selectedItem={becasDescuentosData.selectedBecaDescuento}
                    isSelected={(item) => {
                      return becasDescuentosData.selectedBecaDescuento?.id === item.id;
                    }}
                    loadingText="Cargando becas y descuentos..."
                  />
                </Form.Item>

                {/* TODO: Agregar más campos del formulario de asignación de beca */}
                {/* Por ejemplo:
                  - Fecha de inicio (date picker)
                  - Fecha de fin (date picker)
                  - Observaciones (textarea)
                  - Estado (select)
                */}
              </Form>
            </Card>

            {/* Sección 3: Beca/Descuento Seleccionada (diseño moderno) */}
            {becasDescuentosData.selectedBecaDescuento && (
              <Card
                title="Beca/Descuento Seleccionada"
                style={{ marginTop: '24px', marginBottom: '24px' }}
                headerColor="primary"
              >
                <Row gutter={[24, 16]}>
                  <Col xs={24} sm={12}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '12px',
                      padding: '16px',
                      backgroundColor: 'var(--color-fill-tertiary, #f5f5f5)',
                      borderRadius: '8px',
                      border: '1px solid var(--color-border-secondary, #e8e8e8)'
                    }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--color-info, #196b45)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <GiftOutlined style={{ fontSize: '24px', color: '#fff' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>
                          Nombre
                        </Text>
                        <Text strong style={{ fontSize: '16px', display: 'block' }}>
                          {becasDescuentosData.selectedBecaDescuento.nombre || 'N/A'}
                        </Text>
                      </div>
                    </div>
                  </Col>
                  <Col xs={24} sm={12}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '12px',
                      padding: '16px',
                      backgroundColor: 'var(--color-fill-tertiary, #f5f5f5)',
                      borderRadius: '8px',
                      border: '1px solid var(--color-border-secondary, #e8e8e8)'
                    }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--color-info, #196b45)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <PercentageOutlined style={{ fontSize: '24px', color: '#fff' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>
                          Porcentaje de Descuento
                        </Text>
                        <Text strong style={{ fontSize: '20px', display: 'block', color: 'var(--color-primary-hover, #196b45)' }}>
                          {becasDescuentosData.selectedBecaDescuento.porcentaje || 'N/A'}%
                        </Text>
                      </div>
                    </div>
                  </Col>
                  {becasDescuentosData.selectedBecaDescuento.descripcion && (
                    <Col xs={24}>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'flex-start', 
                        gap: '12px',
                        padding: '16px',
                        backgroundColor: 'var(--color-fill-tertiary, #f5f5f5)',
                        borderRadius: '8px',
                        border: '1px solid var(--color-border-secondary, #e8e8e8)'
                      }}>
                        <div style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--color-info, #196b45)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          <FileTextOutlined style={{ fontSize: '24px', color: '#fff' }} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>
                            Descripción
                          </Text>
                          <Text style={{ fontSize: '14px', display: 'block' }}>
                            {becasDescuentosData.selectedBecaDescuento.descripcion}
                          </Text>
                        </div>
                      </div>
                    </Col>
                  )}
                </Row>

                {/* Botones de acción - Solo se muestran cuando hay una beca seleccionada */}
                <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--color-border-secondary, #e8e8e8)' }}>
                  <Space size="large">
                    <Button
                      variant="primary"
                      onClick={() => form.submit()}
                      icon={<SaveOutlined />}
                      disabled={!becasDescuentosData.selectedBecaDescuento || loadingStudent}
                    >
                      Asignar Beca
                    </Button>
                    <Button
                      variant="default"
                      onClick={handleVolver}
                    >
                      Cancelar
                    </Button>
                  </Space>
                </div>
              </Card>
            )}
          </>
        )}
      </div>
    </PageTemplate>
  );
};

export default EstudiantesAsignarBeca;
