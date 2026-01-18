/**
 * PagosRegistrar - Página para registrar un pago
 * 
 * Single Responsibility: Mostrar el formulario para registrar un pago de un estudiante
 * 
 * Atomic Design: Page
 * - Orquesta datos + componentes
 * - Pasa HEADER al Template (estructura)
 * - Muestra formulario de registro de pago
 * 
 * Arquitectura:
 * Page → Template (header) + Contenido (formulario de registro)
 * - Template maneja: estructura/layout (header, content)
 * - Contenido muestra: formulario para registrar pago
 */

import { useLocation, useNavigate } from 'react-router-dom';
import { useMemo } from 'react';
import { Alert, Spin, Form } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import { Button } from '@atoms';
import { useStudentDetailContext } from '@application-estudiantes/hooks';
import { usePagosRegistrarContext } from '../../../../application/modules/pagos/hooks';
import { StudentInfoSection } from '@estudiantes/components/organisms';
import {
  PaymentMethodSelectionSection,
  ConfigurationSelectionSection,
  SelectedPaymentSection,
} from '../components/organisms';
import { PaymentMethodCardContent, ConfigurationCardContent } from '../components/molecules';

const PagosRegistrar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Obtener studentId del estado de navegación
  const studentId = location.state?.studentId || null;

  // Obtener datos del estudiante
  const studentDetailContext = useStudentDetailContext();
  const student = studentDetailContext?.student?.student || null;
  const loadingStudent = studentDetailContext?.loading || false;

  // Obtener TODO del contexto de registro de pagos
  const pagosRegistrarContext = usePagosRegistrarContext();
  const {
    loading = false,
    error = null,
    metodosPago,
    configuracionAportes,
    cuentasPago,
    form,
  } = pagosRegistrarContext;

  // Formulario para registro de pago
  const [formPago] = Form.useForm();
  const formInstance = formPago || form;

  // Función para renderizar cada card de método de pago
  const renderMetodoPagoCard = (metodoPago) => {
    return <PaymentMethodCardContent metodoPago={metodoPago} />;
  };

  // Función para renderizar cada card de configuración
  const renderConfiguracionCard = (configuracion) => {
    return <ConfigurationCardContent configuracion={configuracion} />;
  };

  // Handler para volver
  const handleVolver = () => {
    navigate(`/estudiantes/${studentId}`);
  };

  // Handler para finalizar (por ahora solo muestra mensaje)
  const handleFinish = (values) => {
    console.log('Valores del formulario de pago:', values);
    // TODO: Implementar lógica de registro de pago
    // Aquí se llamará al hook useRegisterAporteVoluntario o similar
  };

  // Configurar breadcrumb items
  const breadcrumbItems = useMemo(() => [
    { title: 'Inicio' },
    { title: 'Pagos' },
    { title: 'Registrar Pago' },
  ], []);

  // Si no hay studentId, mostrar error
  if (!studentId) {
    return (
      <PageTemplate
        header={
          <PageHeader
            title="Registrar Pago"
            breadcrumbItems={breadcrumbItems}
            actions={
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={handleVolver || (() => { window.location.href = '/estudiantes'; })}
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
              onClick={() => window.location.href = '/estudiantes'}
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
          title={`Registrar Pago${student ? ` - ${student.nombreCompleto || student.codigoEstudiante || ''}` : ''}`}
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
            {/* Sección 1: Información del Estudiante */}
            {student && <StudentInfoSection student={student} />}

            {/* Sección 2: Selección de Configuración de Aporte */}
            <ConfigurationSelectionSection
              configuracionAportesData={configuracionAportes}
              onSelectConfiguracion={configuracionAportes.onSelectConfiguracion}
              renderConfiguracionCard={renderConfiguracionCard}
              form={formInstance}
              onFinish={handleFinish}
            />

            {/* Sección 3: Selección de Método de Pago */}
            <PaymentMethodSelectionSection
              metodosPagoData={metodosPago}
              onSelectMetodoPago={metodosPago.onSelectMetodoPago}
              renderMetodoPagoCard={renderMetodoPagoCard}
              form={formInstance}
              onFinish={handleFinish}
            />

            {/* Sección 4: Detalles del Pago y Formulario Completo */}
            <SelectedPaymentSection
              selectedConfiguracion={configuracionAportes.selectedConfiguracion}
              selectedMetodoPago={metodosPago.selectedMetodoPago}
              selectedCuentaPago={cuentasPago.selectedCuentaPago}
              cuentasPagoData={cuentasPago}
              form={formInstance}
              onFinish={handleFinish}
              onCancel={handleVolver}
              disabled={!configuracionAportes.selectedConfiguracion || !metodosPago.selectedMetodoPago || loadingStudent || loading}
            />
          </>
        )}
      </div>
    </PageTemplate>
  );
};

export default PagosRegistrar;
