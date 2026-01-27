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
import { useMemo, useEffect, useState, useRef } from 'react';
import { Spin, Form, App } from 'antd';
import { ArrowLeftOutlined, GiftOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import { Button } from '@atoms';
import { useStudentDetailContext } from '@application-estudiantes/hooks';
import { usePagosRegistrarContext } from '../../../../application/modules/pagos/hooks';
import { downloadFile } from '@application/utils';
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

  // Obtener TODO del contexto de registro de pagos (incluye estado actual del aporte: saldo real, cuotas pagadas, tiene_descuento_aplicado)
  const {
    loading = false,
    error = null,
    estadoActualAporte = null,
    loadingEstadoAporte = false,
    metodosPago,
    configuracionAportes,
    cuentasPago,
    bancosAutorizados,
    form,
    registrarPago,
  } = pagosRegistrarContext || {};

  // Estado local para idempotencia: prevenir múltiples clics
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false); // Ref para evitar race conditions

  // Monto de esta cuota (lo que el usuario ingresa en Detalle del Aporte). Se muestra en "Saldo a Pagar" y se envía al registrar.
  const [montoCuota, setMontoCuota] = useState(null);

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

  // Saldo real a pagar: si hay estado actual del aporte, usar saldo_pendiente; si no, calcular desde config + beca
  const montoPagado = useMemo(() => {
    if (estadoActualAporte && typeof estadoActualAporte.saldo_pendiente === 'number') {
      return Number(estadoActualAporte.saldo_pendiente);
    }
    if (!configuracionAporteActiva) return 0;
    const montoBase = Number(configuracionAporteActiva.montoBase) || 0;
    const tieneBeca = becaActiva && (() => {
      const stateValue = becaActiva.state || becaActiva.estado;
      if (!stateValue) return false;
      const normalizedState = String(stateValue).toUpperCase();
      const tieneEstadoValido = normalizedState === 'ACTIVA' || normalizedState === 'ACTIVE' || normalizedState === 'PENDIENTE';
      const tienePorcentaje = becaActiva.scholarshipPercentage || becaActiva.porcentaje;
      return tieneEstadoValido && tienePorcentaje;
    })();
    const porcentajeDescuento = tieneBeca ? (becaActiva.scholarshipPercentage || becaActiva.porcentaje || (becaActiva.scholarshipType?.percentage) || 0) : 0;
    const descuentoBeca = tieneBeca ? (montoBase * porcentajeDescuento / 100) : 0;
    return Math.max(0, montoBase - descuentoBeca);
  }, [configuracionAporteActiva, becaActiva, estadoActualAporte]);

  // Si ya tiene descuento aplicado en la cabecera, ocultar botón "Asignar Beca"
  const ocultarBotonAsignarBeca = !!(estadoActualAporte && estadoActualAporte.tiene_descuento_aplicado);

  // Determinar si es pago gratuito (monto = 0)
  const esPagoGratuito = montoPagado === 0;

  // Inicializar o corregir montoCuota con el saldo real: si está vacío o si supera el saldo (ej. 400 cuando el saldo real es 140), usar saldo. Solo enteros.
  useEffect(() => {
    if (montoPagado <= 0) return;
    const saldoEntero = Math.floor(Number(montoPagado));
    const actual = montoCuota != null && montoCuota !== '' ? Math.floor(Number(montoCuota)) : null;
    if (actual == null || actual > saldoEntero) {
      setMontoCuota(saldoEntero);
    }
  }, [montoPagado, montoCuota]);

  // Handler para volver
  const handleVolver = () => {
    navigate(`/estudiantes/${studentId}`);
  };

  // Handler para ir a asignar beca (misma lógica que en detalle de estudiante)
  const handleAsignarBeca = () => {
    if (!studentId) {
      message.warning('ID de estudiante no disponible');
      return;
    }
    navigate('/estudiantes/becas/asignar', { state: { studentId } });
  };

  // Handler para finalizar el registro de pago
  const handleFinish = async (values) => {
    // IDEMPOTENCIA: Prevenir múltiples clics simultáneos
    if (isSubmittingRef.current || isSubmitting) {
      console.warn('[PagosRegistrar] Intento de pago duplicado bloqueado (idempotencia)');
      message.warning('El pago ya está siendo procesado. Por favor espere...');
      return;
    }

    // Marcar como procesando antes de cualquier validación
    setIsSubmitting(true);
    isSubmittingRef.current = true;

    try {
      // ============================================
      // VALIDACIONES SEGÚN EL VALIDADOR DEL BACKEND
      // ============================================
      
      // 1. Validar student_id (requerido, número entero > 0)
      if (!studentId || !Number.isInteger(Number(studentId)) || Number(studentId) < 1) {
        message.error('El ID del estudiante es requerido y debe ser un número válido');
        // Resetear estado si falla validación temprana
        setIsSubmitting(false);
        isSubmittingRef.current = false;
        return;
      }

      // 1.1. Validar monto de esta cuota (solo si NO es pago gratuito)
      if (!esPagoGratuito && (!montoCuota || Number(montoCuota) <= 0)) {
        message.error('Indique el monto de esta cuota en el detalle del aporte');
        setIsSubmitting(false);
        isSubmittingRef.current = false;
        return;
      }

      // 2. Validar payment_method_id (solo si NO es pago gratuito)
      // Si es pago gratuito (monto = 0), no se requiere método de pago
      let metodoPagoId = null;
      if (!esPagoGratuito) {
        // Solo validar método de pago si hay monto a pagar
        if (!metodosPago?.selectedMetodoPago) {
          message.error('Por favor seleccione un método de pago');
          setIsSubmitting(false);
          isSubmittingRef.current = false;
          return;
        }

        metodoPagoId = Number(metodosPago.selectedMetodoPago.id);
        if (![1, 2, 3, 4].includes(metodoPagoId)) {
          message.error('El método de pago debe ser: EFECTIVO (1), QR (2), TRANSFERENCIA (3) o DEPOSITO (4)');
          setIsSubmitting(false);
          isSubmittingRef.current = false;
          return;
        }
      }

      // 3. Validar payment_date (SIEMPRE requerido para todos los métodos)
      let paymentDate;
      if (esPagoGratuito) {
        // Para pagos gratuitos, usar fecha actual
        paymentDate = dayjs().format('YYYY-MM-DD');
      } else {
        // Para todos los métodos (incluyendo EFECTIVO), la fecha es REQUERIDA
        if (values.fechaPago) {
          paymentDate = dayjs(values.fechaPago).format('YYYY-MM-DD');
        } else {
          message.error('La fecha de pago es requerida');
          setIsSubmitting(false);
          isSubmittingRef.current = false;
          return;
        }

        // Validar formato de fecha
        if (!dayjs(paymentDate).isValid()) {
          message.error('La fecha de pago debe estar en formato válido (YYYY-MM-DD)');
          setIsSubmitting(false);
          isSubmittingRef.current = false;
          return;
        }
      }

      // 4. Validar descripcion (opcional, string máximo 500 caracteres si se proporciona)
      const descripcion = (values.descripcion || '').trim();
      if (descripcion && descripcion.length > 500) {
        message.error('La descripción no puede exceder 500 caracteres');
        setIsSubmitting(false);
        isSubmittingRef.current = false;
        return;
      }
      // Si está vacío, usar null o string vacío (según lo que acepte el backend)

      // 5. Validar payment_account_id (solo si NO es pago gratuito)
      let paymentAccountId = null;
      if (!esPagoGratuito && metodoPagoId) {
        const esEfectivo = metodoPagoId === 1;
        const esQR = metodoPagoId === 2;
        const esTransferencia = metodoPagoId === 3;
        const esDeposito = metodoPagoId === 4;

        if (esTransferencia || esDeposito) {
          // Para TRANSFERENCIA y DEPOSITO, la cuenta es REQUERIDA
          paymentAccountId = values.cuentaPagoId || cuentasPago?.selectedCuentaPago?.id;
          if (!paymentAccountId || !Number.isInteger(Number(paymentAccountId)) || Number(paymentAccountId) < 1) {
            const metodoNombre = esTransferencia ? 'TRANSFERENCIA' : 'DEPOSITO';
            message.error(`La cuenta de pago es requerida para método ${metodoNombre}`);
            setIsSubmitting(false);
            isSubmittingRef.current = false;
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
      }

      // 6. Validar código de comprobante (REQUERIDO para QR, TRANSFERENCIA, DEPOSITO)
      let codigoComprobante = null;
      if (!esPagoGratuito && metodoPagoId) {
        const esQR = metodoPagoId === 2;
        const esTransferencia = metodoPagoId === 3;
        const esDeposito = metodoPagoId === 4;

        if (esQR || esTransferencia || esDeposito) {
          // Para QR, TRANSFERENCIA y DEPOSITO, el código de comprobante es REQUERIDO
          codigoComprobante = (values.codigoComprobante || '').trim();
          if (!codigoComprobante || codigoComprobante.length === 0) {
            const metodoNombre = esQR ? 'QR' : esTransferencia ? 'TRANSFERENCIA' : 'DEPOSITO';
            message.error(`El código de comprobante es requerido para método ${metodoNombre}`);
            setIsSubmitting(false);
            isSubmittingRef.current = false;
            return;
          }
        }
      }

      // 7. Validar transaction_number (OPCIONAL para todos los métodos)
      let transactionNumber = null;
      if (!esPagoGratuito && metodoPagoId) {
        // El número de transacción es opcional, solo se guarda si se proporciona
        transactionNumber = (values.numeroTransaccion || '').trim() || null;
      }

      // 8. Obtener archivo de documento de respaldo (si existe)
      let documentoRespaldo = null;
      if (values.documentoRespaldo && values.documentoRespaldo.length > 0) {
        // Ant Design Upload devuelve un array, obtener el primer archivo
        const file = values.documentoRespaldo[0];
        console.log('[PagosRegistrar] Archivo del formulario:', {
          file,
          hasOriginFileObj: !!file.originFileObj,
          isFile: file instanceof File,
          tipo: typeof file,
          constructor: file?.constructor?.name,
        });
        // Si es un objeto de Ant Design Upload, obtener el archivo original
        documentoRespaldo = file.originFileObj || file;
        console.log('[PagosRegistrar] Archivo final extraído:', {
          documentoRespaldo,
          isFile: documentoRespaldo instanceof File,
          tipo: typeof documentoRespaldo,
          constructor: documentoRespaldo?.constructor?.name,
        });
      } else {
        console.log('[PagosRegistrar] No hay archivo en el formulario', {
          hasDocumentoRespaldo: !!values.documentoRespaldo,
          length: values.documentoRespaldo?.length,
        });
      }

      // ============================================
      // PREPARAR DATOS PARA EL BACKEND (snake_case)
      // ============================================
      const pagoData = {
        studentId: Number(studentId),
        amount: esPagoGratuito ? 0 : Number(montoCuota), // Monto de esta cuota (el que se muestra en "Saldo a Pagar")
        paymentMethodId: metodoPagoId || 1, // Si es gratuito, usar EFECTIVO (1) por defecto
        paymentAccountId: paymentAccountId,
        paymentDate: paymentDate,
        transactionNumber: transactionNumber, // Opcional, puede ser null
        codigoComprobante: codigoComprobante || null, // Requerido para QR/TRANSFERENCIA/DEPOSITO, null para otros
        descripcion: descripcion || null, // Opcional, puede ser null o string vacío
        documentoRespaldo: documentoRespaldo, // Archivo de documento de respaldo (opcional)
      };

      // Llamar a la función de registro del contexto
      if (!registrarPago) {
        message.error('Error: Función de registro no disponible');
        setIsSubmitting(false);
        isSubmittingRef.current = false;
        return;
      }

      // Realizar la petición de registro (ya estamos protegidos contra múltiples clics)
      const result = await registrarPago(pagoData);

      // Debug: Log del resultado para ver qué está llegando
      console.log('[PagosRegistrar] Resultado del registro:', result);

      if (result && result.success) {
        message.success('Pago registrado exitosamente');
        
        // NUEVO: Descargar automáticamente el recibo PDF si está disponible
        if (result.data && result.data.reciboPDF) {
          try {
            // El backend ya retorna la ruta relativa lista para descargar
            const reciboPath = result.data.reciboPDF;
            
            // Asegurar que la ruta empiece con /
            const relativePath = reciboPath.startsWith('/') 
              ? reciboPath 
              : '/' + reciboPath;
            
            // Obtener el nombre del archivo del path
            const fileName = relativePath.split('/').pop() || 'recibo_pago.pdf';
            
            // Descargar el recibo PDF
            downloadFile(relativePath, fileName);
            
            message.success('Recibo de pago generado y descargado correctamente', 3);
          } catch (pdfError) {
            console.error('Error al descargar el recibo PDF:', pdfError);
            // No mostrar error al usuario si solo falla la descarga
            // El pago ya fue registrado exitosamente
            message.warning('Pago registrado exitosamente. El recibo PDF se generó pero no se pudo descargar automáticamente.');
          }
        }
        
        // Redirigir al detalle del estudiante después de un breve delay
        // NOTA: No reseteamos isSubmitting aquí porque vamos a navegar fuera
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
        
        // Resetear estado en caso de error para permitir reintento
        setIsSubmitting(false);
        isSubmittingRef.current = false;
      }
    } catch (error) {
      console.error('Error al registrar pago:', error);
      message.error('Error inesperado al registrar el pago');
      
      // Resetear estado en caso de error para permitir reintento
      setIsSubmitting(false);
      isSubmittingRef.current = false;
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

  // Si el saldo es 0 y existe cabecera, ir al detalle del pago (no mostrar formulario de registro)
  // Pasamos studentId en state para que "Volver" en PagosDetail vaya al detalle del estudiante
  useEffect(() => {
    if (estadoActualAporte && !loadingEstadoAporte && Number(estadoActualAporte.saldo_pendiente) === 0 && estadoActualAporte.cabecera?.id && studentId) {
      navigate(`/pagos/${estadoActualAporte.cabecera.id}`, { replace: true, state: { studentId } });
    }
  }, [estadoActualAporte, loadingEstadoAporte, navigate, studentId]);

  // Si no hay studentId, no renderizar nada (se redirige automáticamente)
  if (!studentId) {
    return null;
  }

  // Si saldo es 0 y hay cabecera, no mostrar formulario (se redirige al detalle)
  const redirigirADetalle = estadoActualAporte && !loadingEstadoAporte && Number(estadoActualAporte.saldo_pendiente) === 0 && estadoActualAporte.cabecera?.id;
  if (redirigirADetalle) {
    return (
      <PageTemplate header={<PageHeader title="Registrar Pago" breadcrumbItems={breadcrumbItems} />}>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large">
            <div style={{ minHeight: '120px' }}>
              <p>El aporte ya está cubierto. Redirigiendo al detalle del pago...</p>
            </div>
          </Spin>
        </div>
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
            <>
              {!ocultarBotonAsignarBeca && (
                <Button
                  variant="success"
                  icon={<GiftOutlined />}
                  onClick={handleAsignarBeca}
                  style={{ marginRight: 8 }}
                >
                  Asignar Beca
                </Button>
              )}
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={handleVolver}
                variant="default"
              >
                Volver
              </Button>
            </>
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

            {/* Sección 2: Detalle del Aporte (Resumen tipo recibo; usa estado actual si existe para saldo real y cuotas pagadas) */}
            <ContributionDetailSummary
              configuracionAporte={configuracionAporteActiva}
              becaActiva={becaActiva}
              estadoActualAporte={estadoActualAporte}
              loading={configuracionAportes.loading || loadingScholarships || loadingEstadoAporte}
              error={configuracionAportes.error}
              montoCuota={montoCuota}
              onMontoCuotaChange={setMontoCuota}
              montoObligatorioMax={montoPagado}
            />

            {/* Sección 3: Selección de Método de Pago (solo si NO es pago gratuito) */}
            {!esPagoGratuito && (
              <PaymentMethodSelectionSection
                metodosPagoData={metodosPago}
                onSelectMetodoPago={metodosPago.onSelectMetodoPago}
                form={formInstance}
                onFinish={handleFinish}
              />
            )}

            {/* Sección 4: Detalles del Pago y Formulario Completo */}
            <SelectedPaymentSection
              selectedConfiguracion={configuracionAporteActiva}
              selectedMetodoPago={esPagoGratuito ? null : metodosPago.selectedMetodoPago}
              selectedCuentaPago={cuentasPago.selectedCuentaPago}
              cuentasPagoData={cuentasPago}
              bancosAutorizadosData={bancosAutorizados}
              becaActiva={becaActiva}
              montoCuota={montoCuota}
              form={formInstance}
              onFinish={handleFinish}
              onCancel={handleVolver}
              disabled={
                !configuracionAporteActiva || 
                (!esPagoGratuito && (!montoCuota || Number(montoCuota) <= 0)) ||
                (!esPagoGratuito && !metodosPago.selectedMetodoPago) || 
                loadingStudent || 
                loading || 
                isSubmitting
              }
            />
          </>
        )}
      </div>
    </PageTemplate>
  );
};

export default PagosRegistrar;
