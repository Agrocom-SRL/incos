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
import { useMemo, useEffect } from 'react';
import { Spin, Form, App } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
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

const PagosRegistrar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { message } = App.useApp(); // Usar message del contexto de App

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
    bancosAutorizados,
    form,
    registrarPago,
  } = pagosRegistrarContext || {};

  // Formulario para registro de pago
  // Si el contexto no proporciona un form, crear uno nuevo
  const [formPago] = Form.useForm();
  const formInstance = form || formPago;

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


  // Handler para volver
  const handleVolver = () => {
    navigate(`/estudiantes/${studentId}`);
  };

  // Handler para finalizar el registro de pago
  const handleFinish = async (values) => {
    try {
      // ============================================
      // VALIDACIONES SEGÚN EL VALIDADOR DEL BACKEND
      // ============================================
      
      // 1. Validar student_id (requerido, número entero > 0)
      if (!studentId || !Number.isInteger(Number(studentId)) || Number(studentId) < 1) {
        message.error('El ID del estudiante es requerido y debe ser un número válido');
        return;
      }

      // 2. Validar payment_method_id (requerido, debe ser 1, 2 o 3)
      if (!metodosPago?.selectedMetodoPago) {
        message.error('Por favor seleccione un método de pago');
        return;
      }

      const metodoPagoId = Number(metodosPago.selectedMetodoPago.id);
      if (![1, 2, 3].includes(metodoPagoId)) {
        message.error('El método de pago debe ser: EFECTIVO (1), QR (2) o TRANSFERENCIA (3)');
        return;
      }

      // 3. Validar payment_date (requerido, formato YYYY-MM-DD)
      let paymentDate;
      if (values.fechaPago) {
        paymentDate = dayjs(values.fechaPago).format('YYYY-MM-DD');
      } else {
        // Si no hay fecha, usar hoy (EFECTIVO no requiere fecha en el formulario)
        paymentDate = dayjs().format('YYYY-MM-DD');
      }

      // Validar formato de fecha
      if (!dayjs(paymentDate).isValid()) {
        message.error('La fecha de pago debe estar en formato válido (YYYY-MM-DD)');
        return;
      }

      // 4. Validar concept (requerido, string 3-500 caracteres)
      const concept = (values.concepto || '').trim();
      if (!concept || concept.length < 3) {
        message.error('El concepto del pago es requerido y debe tener al menos 3 caracteres');
        return;
      }
      if (concept.length > 500) {
        message.error('El concepto del pago no puede exceder 500 caracteres');
        return;
      }

      // 5. Validar payment_account_id (condicional según método de pago)
      const esEfectivo = metodoPagoId === 1;
      const esQR = metodoPagoId === 2;
      const esTransferencia = metodoPagoId === 3;

      let paymentAccountId = null;
      if (esTransferencia) {
        // Para TRANSFERENCIA, la cuenta es REQUERIDA
        paymentAccountId = values.cuentaPagoId || cuentasPago?.selectedCuentaPago?.id;
        if (!paymentAccountId || !Number.isInteger(Number(paymentAccountId)) || Number(paymentAccountId) < 1) {
          message.error('La cuenta de pago es requerida para método TRANSFERENCIA');
          return;
        }
        paymentAccountId = Number(paymentAccountId);
      } else if (esQR) {
        // Para QR, la cuenta es OPCIONAL (la cuenta está en la imagen del QR)
        paymentAccountId = values.cuentaPagoId || cuentasPago?.selectedCuentaPago?.id || null;
        if (paymentAccountId) {
          paymentAccountId = Number(paymentAccountId);
        }
      } else if (esEfectivo) {
        // Para EFECTIVO, la cuenta debe ser NULL
        paymentAccountId = null;
      }

      // 6. Validar transaction_number (condicional según método de pago)
      let transactionNumber = null;
      if (esQR || esTransferencia) {
        // Para QR y TRANSFERENCIA, el número de transacción es REQUERIDO
        transactionNumber = (values.numeroTransaccion || values.codigoComprobante || '').trim();
        if (!transactionNumber || transactionNumber.length === 0) {
          message.error('El número de transacción es requerido para método QR o TRANSFERENCIA');
          return;
        }
      } else if (esEfectivo) {
        // Para EFECTIVO, el número de transacción es opcional
        transactionNumber = (values.numeroTransaccion || values.codigoComprobante || '').trim() || null;
      }

      // 7. Obtener archivo de documento de respaldo (si existe)
      let documentoRespaldo = null;
      if (values.documentoRespaldo && values.documentoRespaldo.length > 0) {
        // Ant Design Upload devuelve un array, obtener el primer archivo
        const file = values.documentoRespaldo[0];
        // Si es un objeto de Ant Design Upload, obtener el archivo original
        documentoRespaldo = file.originFileObj || file;
      }

      // ============================================
      // PREPARAR DATOS PARA EL BACKEND (snake_case)
      // ============================================
      const pagoData = {
        studentId: Number(studentId),
        paymentMethodId: metodoPagoId,
        paymentAccountId: paymentAccountId,
        paymentDate: paymentDate,
        transactionNumber: transactionNumber,
        concept: concept,
        documentoRespaldo: documentoRespaldo, // Archivo de documento de respaldo
      };

      // Llamar a la función de registro del contexto
      if (!registrarPago) {
        message.error('Error: Función de registro no disponible');
        return;
      }

      const result = await registrarPago(pagoData);

      // Debug: Log del resultado para ver qué está llegando
      console.log('[PagosRegistrar] Resultado del registro:', result);

      if (result && result.success) {
        message.success('Pago registrado exitosamente');
        // Redirigir al detalle del estudiante después de un breve delay
        setTimeout(() => {
          navigate(`/estudiantes/${studentId}`);
        }, 1500);
      } else {
        // Extraer el mensaje de error correctamente
        let errorMessage = 'Error al registrar el pago';
        if (result && result.error) {
          // Debug: Log del error para ver su estructura
          console.log('[PagosRegistrar] Error recibido:', result.error, 'Tipo:', typeof result.error);
          
          if (typeof result.error === 'object' && result.error !== null) {
            // Si el error es un objeto con estructura { code, message, details }
            if (result.error.message && typeof result.error.message === 'string') {
              errorMessage = result.error.message;
            } else {
              // Si no tiene message, intentar convertir el objeto a string
              errorMessage = JSON.stringify(result.error);
            }
          } else if (typeof result.error === 'string') {
            // Si el error es un string simple
            errorMessage = result.error;
          }
        }
        console.log('[PagosRegistrar] Mensaje de error final:', errorMessage);
        message.error(errorMessage);
      }
    } catch (error) {
      console.error('Error al registrar pago:', error);
      message.error('Error inesperado al registrar el pago');
    }
  };

  // Configurar breadcrumb items
  const breadcrumbItems = useMemo(() => [
    { title: 'Inicio', href: '/' },
    { title: 'Pagos', href: '/pagos' },
    { title: 'Registrar Pago' },
  ], []);

  // Redirigir a lista de pagos si no hay studentId
  useEffect(() => {
    if (!studentId) {
      navigate('/pagos/listar', { replace: true });
    }
  }, [studentId, navigate]);

  // Si no hay studentId, no renderizar nada (se redirige automáticamente)
  if (!studentId) {
    return null;
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
              form={formInstance}
              onFinish={handleFinish}
            />

            {/* Sección 4: Detalles del Pago y Formulario Completo */}
            <SelectedPaymentSection
              selectedConfiguracion={configuracionAporteActiva}
              selectedMetodoPago={metodosPago.selectedMetodoPago}
              selectedCuentaPago={cuentasPago.selectedCuentaPago}
              cuentasPagoData={cuentasPago}
              bancosAutorizadosData={bancosAutorizados}
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
