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
  ConfigurationDetailSection,
  ContributionDetailSummary,
  SelectedPaymentSection,
} from '../components/organisms';
import { PaymentMethodCardContent } from '../components/molecules';

const PagosRegistrar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Obtener studentId del estado de navegación
  const studentId = location.state?.studentId || null;

  // Obtener datos del estudiante desde el contexto de detalle (para StudentInfoSection)
  const studentDetailContext = useStudentDetailContext();
  const student = studentDetailContext?.student?.student || null;
  const loadingStudent = studentDetailContext?.loading || false;
  
  // Obtener datos de becas desde el contexto de registro de pagos
  const pagosRegistrarContext = usePagosRegistrarContext();
  const {
    becaActiva,
    loadingScholarships,
  } = pagosRegistrarContext || {};

  // Obtener TODO del contexto de registro de pagos
  const {
    loading = false,
    error = null,
    metodosPago,
    configuracionAportes,
    cuentasPago,
    form,
  } = pagosRegistrarContext || {};

  // Formulario para registro de pago
  const [formPago] = Form.useForm();
  const formInstance = formPago || form;

  // Obtener configuración de aporte activa (la primera activa/vigente)
  const configuracionAporteActiva = useMemo(() => {
    if (!configuracionAportes?.configuracionAportes || !Array.isArray(configuracionAportes.configuracionAportes)) {
      return null;
    }
    // Buscar configuración activa (aporte_activo === true)
    return configuracionAportes.configuracionAportes.find(
      (config) => config.aporteActivo === true || config.aporte_activo === true
    ) || configuracionAportes.configuracionAportes[0] || null; // Si no hay activa, usar la primera
  }, [configuracionAportes]);

  // Función para renderizar cada card de método de pago
  const renderMetodoPagoCard = (metodoPago) => {
    return <PaymentMethodCardContent metodoPago={metodoPago} />;
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
    { title: 'Inicio', href: '/' },
    { title: 'Pagos', href: '/pagos' },
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
        {loadingStudent || loadingScholarships ? (
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

            {/* Sección 2: Detalle del Aporte (Resumen tipo recibo) */}
            <ContributionDetailSummary
              configuracionAporte={configuracionAporteActiva}
              becaActiva={becaActiva}
              loading={configuracionAportes.loading || loadingScholarships}
              error={configuracionAportes.error}
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
              selectedConfiguracion={configuracionAporteActiva}
              selectedMetodoPago={metodosPago.selectedMetodoPago}
              selectedCuentaPago={cuentasPago.selectedCuentaPago}
              cuentasPagoData={cuentasPago}
              becaActiva={becaActiva}
              form={formInstance}
              onFinish={handleFinish}
              onCancel={handleVolver}
              disabled={!configuracionAporteActiva || !metodosPago.selectedMetodoPago || loadingStudent || loading}
            />
          </>
        )}
      </div>
    </PageTemplate>
  );
};

export default PagosRegistrar;
