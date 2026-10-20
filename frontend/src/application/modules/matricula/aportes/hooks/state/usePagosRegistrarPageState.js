/**
 * Hook: usePagosRegistrarPageState
 *
 * Single Responsibility: Orquestar el FLUJO de la pantalla "Registrar pago"
 * (wizard de matrícula/aportes y ruta legacy de finanzas).
 *
 * Clean Architecture:
 * - Application Layer: hooks/state por PANTALLA (patrón useAsignarBecaData de becas).
 * - La página solo compone UI; aquí viven las validaciones espejo del backend,
 *   el armado del payload, la idempotencia del submit, el compromiso de pago,
 *   la descarga del recibo y las redirecciones.
 *
 * Este hook consume los contextos ya montados por PagosRegistrarConnector
 * (StudentDetailProvider + PagosRegistrarProvider); no hace fetch propio.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { App, Form } from 'antd';
import dayjs from 'dayjs';
import { useStudentDetailContext } from '@application-matricula/admision/hooks';
import { downloadFile } from '@application/utils';
import { usePagosRegistrarContext } from '../context/usePagosRegistrarContext';

/**
 * Plazos del compromiso de pago que el operador puede elegir al registrar la
 * PRIMERA cuota (debe coincidir con DIAS_COMPROMISO_PERMITIDOS del backend).
 */
export const OPCIONES_COMPROMISO = [
  { value: 15, label: '15 días', sub: '2 semanas' },
  { value: 30, label: '30 días', sub: '1 mes' },
  { value: 45, label: '45 días', sub: '1 mes y medio' },
  { value: 60, label: '60 días', sub: '2 meses' },
  { value: 90, label: '90 días', sub: '3 meses' },
];

/** Plazo por defecto del compromiso (alineado con el backend). */
export const DIAS_COMPROMISO_DEFAULT = 90;

export const usePagosRegistrarPageState = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { message } = App.useApp();

  // ── Origen de la navegación ─────────────────────────────────────────────
  const studentId = location.state?.studentId || null;
  const menuSidebarKey = location.state?.menuSidebarKey;
  /** Lista desde la que se llegó (matrícula/aportes o finanzas legacy). */
  const returnListPathFromState = location.state?.returnListPath || '/pagos/listar';
  const returnListPath = location.state?.returnListPath;

  // ── Contextos (datos ya orquestados por los providers) ──────────────────
  const studentDetailContext = useStudentDetailContext();
  const student = studentDetailContext?.student?.student || null;
  const loadingStudent = studentDetailContext?.loading || false;

  const pagosRegistrarContext = usePagosRegistrarContext();
  const {
    becaActiva,
    loadingScholarships,
    estadoActualAporte = null,
    loadingEstadoAporte = false,
    metodosPago,
    configuracionAportes,
    cuentasPago,
    bancosAutorizados,
    registrarPago,
    loading: loadingContext = false,
  } = pagosRegistrarContext || {};

  // Selecciones vigentes (locales para dependencias estables de los callbacks)
  const selectedMetodoPago = metodosPago?.selectedMetodoPago ?? null;
  const selectedCuentaPago = cuentasPago?.selectedCuentaPago ?? null;

  // Formulario único de la pantalla (los valores persisten entre pasos del wizard)
  const [form] = Form.useForm();

  // ── Estado local del flujo ──────────────────────────────────────────────
  // Monto de esta cuota: vive en el Form (campo `montoCuota` declarado por config,
  // inicia en 0 vía initialValues del wizard; preserve al desmontar el paso).
  // El valor efectivo (montoCuota) se deriva acotado al saldo en cada render.
  const montoCuotaRaw = Form.useWatch('montoCuota', { form, preserve: true });
  const [compromisoDias, setCompromisoDias] = useState(DIAS_COMPROMISO_DEFAULT);
  // Idempotencia: prevenir doble submit (estado para UI + ref contra race conditions)
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);
  // Error del último intento de registro (se muestra junto al footer del wizard)
  const [submitError, setSubmitError] = useState('');
  // Bloquear la redirección automática (saldo 0 → detalle) hasta descargar el recibo
  // (estado, no ref: se lee durante el render para decidir la redirección)
  const [pendienteDescargaRecibo, setPendienteDescargaRecibo] = useState(false);

  // ── Derivados del aporte ────────────────────────────────────────────────
  // Configuración de aporte activa (la primera activa/vigente)
  const configuracionAporteActiva = useMemo(() => {
    const lista = configuracionAportes?.configuracionAportes;
    if (!Array.isArray(lista) || lista.length === 0) return null;
    return (
      lista.find((config) => config.aporteActivo === true || config.aporte_activo === true) ||
      lista[0] ||
      null
    );
  }, [configuracionAportes]);

  // Saldo real a pagar: si hay estado actual del aporte, usar saldo_pendiente;
  // si no, calcular desde configuración + beca activa.
  const saldoPendiente = useMemo(() => {
    if (estadoActualAporte && typeof estadoActualAporte.saldo_pendiente === 'number') {
      return Number(estadoActualAporte.saldo_pendiente);
    }
    if (!configuracionAporteActiva) return 0;
    const montoBase = Number(configuracionAporteActiva.montoBase) || 0;
    const tieneBeca = becaActiva && (() => {
      const stateValue = becaActiva.state || becaActiva.estado;
      if (!stateValue) return false;
      const normalizedState = String(stateValue).toUpperCase();
      const tieneEstadoValido =
        normalizedState === 'ACTIVA' || normalizedState === 'ACTIVE' || normalizedState === 'PENDIENTE';
      const tienePorcentaje = becaActiva.scholarshipPercentage || becaActiva.porcentaje;
      return tieneEstadoValido && tienePorcentaje;
    })();
    const porcentajeDescuento = tieneBeca
      ? becaActiva.scholarshipPercentage || becaActiva.porcentaje || becaActiva.scholarshipType?.percentage || 0
      : 0;
    const descuentoBeca = tieneBeca ? (montoBase * porcentajeDescuento) / 100 : 0;
    return Math.max(0, montoBase - descuentoBeca);
  }, [configuracionAporteActiva, becaActiva, estadoActualAporte]);

  // Pago gratuito real: el saldo obligatorio del aporte es 0 (beca/condonación total)
  const esPagoGratuito = saldoPendiente === 0;

  // Descuento por beca (para el resumen de confirmación): monto real de la
  // cabecera si existe; si no, el calculado desde configuración + beca vigente.
  const porcentajeBeca = becaActiva
    ? Number(
        becaActiva.scholarshipPercentage ||
          becaActiva.porcentaje ||
          becaActiva.scholarshipType?.percentage ||
          0
      )
    : 0;
  const descuentoBeca = useMemo(() => {
    if (estadoActualAporte) return Number(estadoActualAporte.descuento_beca) || 0;
    if (!configuracionAporteActiva || porcentajeBeca <= 0) return 0;
    const montoBase = Number(configuracionAporteActiva.montoBase) || 0;
    return (montoBase * porcentajeBeca) / 100;
  }, [estadoActualAporte, configuracionAporteActiva, porcentajeBeca]);

  // Monto efectivo de esta cuota: acotado al saldo pendiente en render (derivado,
  // sin efectos que disparen renders en cascada). Sin deuda: siempre 0.
  const montoCuota = useMemo(() => {
    if (saldoPendiente <= 0) return 0;
    if (montoCuotaRaw == null || montoCuotaRaw === '') return montoCuotaRaw;
    const n = Math.floor(Number(montoCuotaRaw));
    if (Number.isNaN(n)) return montoCuotaRaw;
    return Math.min(Math.max(n, 0), Math.floor(Number(saldoPendiente)));
  }, [montoCuotaRaw, saldoPendiente]);

  // Ocultar el botón "Asignar beca" cuando el pago YA tiene una beca: descuento
  // aplicado en la cabecera o beca vigente del estudiante (ACTIVA/PENDIENTE con
  // porcentaje, que es la que descuenta el saldo en este flujo).
  const ocultarBotonAsignarBeca =
    !!(estadoActualAporte && estadoActualAporte.tiene_descuento_aplicado) || !!becaActiva;

  // ¿Es la primera cuota del aporte? (gobierna el compromiso de pago)
  const esPrimeraCuota = useMemo(() => {
    if (!estadoActualAporte) return false;
    const cantidad = Number(estadoActualAporte.cantidad_pagos ?? 0);
    const cuotas = Array.isArray(estadoActualAporte.cuotas) ? estadoActualAporte.cuotas.length : 0;
    return cantidad === 0 && cuotas === 0;
  }, [estadoActualAporte]);

  // ¿La cuota actual cancela todo el saldo? (comparación en enteros, como el resto del flujo)
  const cancelaTodo = useMemo(() => {
    const saldo = Math.floor(Number(saldoPendiente) || 0);
    const cuota = Math.floor(Number(montoCuota) || 0);
    return saldo > 0 && cuota >= saldo;
  }, [saldoPendiente, montoCuota]);

  // El compromiso solo aplica en la 1ra cuota, con saldo a financiar y sin pago gratuito.
  const mostrarSelectorCompromiso = esPrimeraCuota && !esPagoGratuito && !cancelaTodo;

  // Saldo que quedará pendiente tras esta cuota (lo que el estudiante se compromete a cancelar)
  const saldoRestanteCompromiso = useMemo(() => {
    const saldo = Math.floor(Number(saldoPendiente) || 0);
    const cuota = Math.floor(Number(montoCuota) || 0);
    return Math.max(0, saldo - cuota);
  }, [saldoPendiente, montoCuota]);

  // Fecha de vencimiento proyectada del compromiso (fecha de pago + N días, sin
  // formatear). preserve:true — en el paso Confirmación el campo fechaPago está
  // desmontado, pero su valor sigue en el store del Form.
  const fechaPagoWatch = Form.useWatch('fechaPago', { form, preserve: true });
  const fechaCompromisoProyectada = useMemo(() => {
    const baseFecha = fechaPagoWatch && dayjs(fechaPagoWatch).isValid() ? dayjs(fechaPagoWatch) : dayjs();
    return baseFecha.add(compromisoDias, 'day').format('YYYY-MM-DD');
  }, [fechaPagoWatch, compromisoDias]);

  // ── Navegación ──────────────────────────────────────────────────────────
  const handleVolver = useCallback(() => {
    if (returnListPath) {
      navigate(returnListPath, {
        state: menuSidebarKey ? { menuSidebarKey } : undefined,
      });
      return;
    }
    navigate(`/estudiantes/${studentId}`);
  }, [navigate, returnListPath, menuSidebarKey, studentId]);

  const handleAsignarBeca = useCallback(() => {
    if (!studentId) {
      message.warning('El identificador del estudiante no está disponible.');
      return;
    }
    // Propagar el ORIGEN: al confirmar (o cancelar) la asignación, becas vuelve a
    // este formulario con su contexto intacto (ruta matrícula o legacy, lista de
    // retorno, ítem de menú). Si el descuento deja el saldo en 0, este formulario
    // redirige solo al detalle del pago.
    navigate('/estudiantes/becas/asignar', {
      state: {
        studentId,
        returnTo: location.pathname,
        returnState: {
          studentId,
          ...(returnListPath ? { returnListPath } : {}),
          ...(menuSidebarKey ? { menuSidebarKey } : {}),
        },
      },
    });
  }, [navigate, studentId, message, location.pathname, returnListPath, menuSidebarKey]);

  // Breadcrumb con jerarquía de dominio; el retorno respeta la lista de origen.
  const breadcrumbItems = useMemo(
    () => [
      { title: 'Inicio', href: '/' },
      { title: 'Matrícula' },
      { title: 'Aportes de matrícula', href: returnListPathFromState },
      { title: 'Registrar pago' },
    ],
    [returnListPathFromState]
  );

  const pageTitle = `Registrar pago${student ? ` - ${student.nombreCompleto || student.codigoEstudiante || ''}` : ''}`;

  // Sin estudiante no hay formulario: volver a la lista que originó el flujo
  useEffect(() => {
    if (!studentId) {
      navigate(returnListPathFromState, { replace: true });
    }
  }, [studentId, navigate, returnListPathFromState]);

  // Aporte ya cubierto (saldo 0 con cabecera): ir al detalle del pago, salvo que
  // estemos esperando la descarga del recibo de un pago recién registrado.
  const aporteCubierto = !!(
    estadoActualAporte &&
    !loadingEstadoAporte &&
    Number(estadoActualAporte.saldo_pendiente) === 0 &&
    estadoActualAporte.cabecera?.id
  );
  const redirigiendoADetalle = aporteCubierto && !pendienteDescargaRecibo;

  useEffect(() => {
    if (pendienteDescargaRecibo) return;
    if (aporteCubierto && studentId) {
      navigate(`/pagos/${estadoActualAporte.cabecera.id}`, {
        replace: true,
        state: {
          studentId,
          ...(menuSidebarKey ? { menuSidebarKey } : {}),
        },
      });
    }
  }, [pendienteDescargaRecibo, aporteCubierto, estadoActualAporte, navigate, studentId, menuSidebarKey]);

  // Datos base de la página aún en carga: no montar el wizard (los pasos dependen
  // de si el pago es gratuito, que se conoce recién con becas + configuración + estado)
  const cargandoDatosBase =
    loadingStudent || loadingScholarships || loadingEstadoAporte || !!configuracionAportes?.loading;

  // ── Validación del paso "Datos del pago" (compuerta del wizard) ─────────
  const validarPasoDatosPago = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (!configuracionAporteActiva && !estadoActualAporte) {
        message.error('No hay una configuración de aporte activa para registrar el pago.');
        reject(new Error('Sin configuración de aporte'));
        return;
      }
      if (!esPagoGratuito) {
        if (
          montoCuota == null ||
          montoCuota === '' ||
          Number.isNaN(Number(montoCuota)) ||
          Number(montoCuota) < 0
        ) {
          message.error('Indique un monto válido (mayor o igual a 0) para esta cuota.');
          reject(new Error('Monto de cuota inválido'));
          return;
        }
        const saldoMax = Math.floor(Number(saldoPendiente));
        if (Math.floor(Number(montoCuota)) > saldoMax) {
          message.error(`El monto no puede superar el saldo pendiente (${saldoMax}).`);
          reject(new Error('Monto mayor al saldo'));
          return;
        }
        if (!selectedMetodoPago) {
          message.error('Seleccione un método de pago antes de continuar.');
          reject(new Error('Método de pago no seleccionado'));
          return;
        }
      }
      // Campos montados del paso (fecha, cuenta, comprobante… según método)
      form.validateFields().then(resolve).catch(reject);
    });
  }, [
    configuracionAporteActiva,
    estadoActualAporte,
    esPagoGratuito,
    montoCuota,
    saldoPendiente,
    selectedMetodoPago,
    form,
    message,
  ]);

  // Ejecuta el registro contra el backend y maneja el resultado (éxito/errores/recibo)
  const ejecutarRegistro = useCallback(
    async (pagoData) => {
      if (!registrarPago) {
        message.error('El servicio de registro de pagos no está disponible.');
        setIsSubmitting(false);
        isSubmittingRef.current = false;
        return;
      }

      try {
        const result = await registrarPago(pagoData);

        if (result && result.success) {
          setIsSubmitting(false);
          isSubmittingRef.current = false;
          // Bloquear la redirección automática hasta descargar el recibo y navegar nosotros
          setPendienteDescargaRecibo(true);
          message.success('El pago se registró correctamente.');

          const irAlEstudiante = () => {
            navigate(`/estudiantes/${studentId}`);
            setPendienteDescargaRecibo(false);
          };

          if (result.data && result.data.reciboPDF) {
            try {
              const reciboPath = result.data.reciboPDF;
              const relativePath = reciboPath.startsWith('/') ? reciboPath : '/' + reciboPath;
              const fileName = relativePath.split('/').pop() || 'recibo_pago.pdf';
              downloadFile(relativePath, fileName);
              message.success('Recibo descargado. Redirigiendo a la ficha del estudiante…', 2);
              // Dar tiempo a ver y guardar el recibo antes de saltar de página
              setTimeout(irAlEstudiante, 2500);
            } catch {
              message.warning(
                'El pago se registró, pero el recibo no se pudo descargar; estará disponible en los documentos del estudiante.'
              );
              setTimeout(irAlEstudiante, 2000);
            }
          } else {
            setTimeout(irAlEstudiante, 1500);
          }
          return;
        }

        // Extraer el mensaje de error (objeto { code, message, details } o string)
        let errorMessage = 'Error al registrar el pago';
        if (result && result.error) {
          if (typeof result.error === 'object' && result.error !== null) {
            if (typeof result.error.message === 'string') {
              errorMessage = result.error.message;
            } else {
              errorMessage = JSON.stringify(result.error);
            }
          } else if (typeof result.error === 'string') {
            errorMessage = result.error;
          }
        }
        message.error(errorMessage);
        setSubmitError(errorMessage);
        setIsSubmitting(false);
        isSubmittingRef.current = false;
      } catch {
        message.error('Ocurrió un error inesperado al registrar el pago.');
        setIsSubmitting(false);
        isSubmittingRef.current = false;
      }
    },
    [registrarPago, navigate, studentId, message]
  );

  // ── Registro del pago ───────────────────────────────────────────────────
  // Validaciones espejo del backend + armado del payload. El plazo del compromiso
  // ya fue elegido en el paso de confirmación (no hay modal intermedio).
  const handleFinish = useCallback(
    async (values) => {
      if (isSubmittingRef.current || isSubmitting) {
        message.warning('El pago ya se está procesando. Espere un momento, por favor.');
        return;
      }
      setIsSubmitting(true);
      isSubmittingRef.current = true;
      setSubmitError('');

      const fallar = (texto) => {
        message.error(texto);
        setIsSubmitting(false);
        isSubmittingRef.current = false;
      };

      try {
        // 1. Estudiante (requerido, entero > 0)
        if (!studentId || !Number.isInteger(Number(studentId)) || Number(studentId) < 1) {
          fallar('El identificador del estudiante es obligatorio y debe ser un número válido.');
          return;
        }

        // 2. Monto de esta cuota (solo si NO es pago gratuito; >= 0 permitido)
        if (
          !esPagoGratuito &&
          (montoCuota == null ||
            montoCuota === '' ||
            Number.isNaN(Number(montoCuota)) ||
            Number(montoCuota) < 0)
        ) {
          fallar('Indique un monto válido (mayor o igual a 0) para esta cuota.');
          return;
        }
        if (!esPagoGratuito) {
          const saldoMax = Math.floor(Number(saldoPendiente));
          if (Math.floor(Number(montoCuota)) > saldoMax) {
            fallar(`El monto no puede superar el saldo pendiente (${saldoMax}).`);
            return;
          }
        }

        // 3. Método de pago (solo si NO es pago gratuito)
        let metodoPagoId = null;
        if (!esPagoGratuito) {
          if (!selectedMetodoPago) {
            fallar('Seleccione un método de pago.');
            return;
          }
          metodoPagoId = Number(selectedMetodoPago.id);
          if (![1, 2, 3, 4].includes(metodoPagoId)) {
            fallar('Método de pago no válido. Seleccione efectivo, QR, transferencia o depósito.');
            return;
          }
        }

        // 4. Fecha de pago (requerida salvo pago gratuito, que usa la fecha actual)
        let paymentDate;
        if (esPagoGratuito) {
          paymentDate = dayjs().format('YYYY-MM-DD');
        } else {
          if (!values.fechaPago) {
            fallar('La fecha de pago es obligatoria.');
            return;
          }
          paymentDate = dayjs(values.fechaPago).format('YYYY-MM-DD');
          if (!dayjs(paymentDate).isValid()) {
            fallar('La fecha de pago debe tener un formato válido.');
            return;
          }
        }

        // 5. Observación (opcional, máx. 500 caracteres)
        const descripcion = (values.descripcion || '').trim();
        if (descripcion && descripcion.length > 500) {
          fallar('La observación no puede exceder 500 caracteres.');
          return;
        }

        // 6. Cuenta de pago (requerida para transferencia/depósito, opcional para QR)
        let paymentAccountId = null;
        if (!esPagoGratuito && metodoPagoId) {
          const esEfectivo = metodoPagoId === 1;
          const esQR = metodoPagoId === 2;
          const esTransferencia = metodoPagoId === 3;
          const esDeposito = metodoPagoId === 4;

          if (esTransferencia || esDeposito) {
            paymentAccountId = values.cuentaPagoId || selectedCuentaPago?.id;
            if (!paymentAccountId || !Number.isInteger(Number(paymentAccountId)) || Number(paymentAccountId) < 1) {
              const metodoNombre = esTransferencia ? 'Transferencia' : 'Depósito';
              fallar(`La cuenta de pago es obligatoria para el método ${metodoNombre}.`);
              return;
            }
            paymentAccountId = Number(paymentAccountId);
          } else if (esQR) {
            paymentAccountId = values.cuentaPagoId || selectedCuentaPago?.id || null;
            if (paymentAccountId) paymentAccountId = Number(paymentAccountId);
          } else if (esEfectivo) {
            paymentAccountId = null;
          }
        }

        // 7. Código de comprobante (requerido para QR/transferencia/depósito)
        let codigoComprobante = null;
        if (!esPagoGratuito && metodoPagoId && [2, 3, 4].includes(metodoPagoId)) {
          codigoComprobante = (values.codigoComprobante || '').trim();
          if (!codigoComprobante) {
            const metodoNombre = metodoPagoId === 2 ? 'QR' : metodoPagoId === 3 ? 'Transferencia' : 'Depósito';
            fallar(`El código de comprobante es obligatorio para el método ${metodoNombre}.`);
            return;
          }
        }

        // 8. Número de transacción (opcional)
        const transactionNumber = !esPagoGratuito && metodoPagoId
          ? (values.numeroTransaccion || '').trim() || null
          : null;

        // 9. Documento de respaldo (opcional; AntD Upload entrega fileList)
        let documentoRespaldo = null;
        if (values.documentoRespaldo && values.documentoRespaldo.length > 0) {
          const file = values.documentoRespaldo[0];
          documentoRespaldo = file.originFileObj || file;
        }

        const pagoData = {
          studentId: Number(studentId),
          amount: esPagoGratuito ? 0 : Number(montoCuota),
          paymentMethodId: metodoPagoId || 1, // Pago gratuito: EFECTIVO (1) por defecto
          paymentAccountId,
          paymentDate,
          transactionNumber,
          codigoComprobante: codigoComprobante || null,
          descripcion: descripcion || null,
          documentoRespaldo,
          // Plazo elegido en el paso de confirmación; si no aplica, el backend lo ignora.
          compromisoDias: mostrarSelectorCompromiso ? compromisoDias : undefined,
        };

        await ejecutarRegistro(pagoData);
      } catch {
        message.error('Ocurrió un error inesperado al registrar el pago.');
        setIsSubmitting(false);
        isSubmittingRef.current = false;
      }
    },
    [
      isSubmitting,
      studentId,
      esPagoGratuito,
      montoCuota,
      saldoPendiente,
      selectedMetodoPago,
      selectedCuentaPago,
      mostrarSelectorCompromiso,
      compromisoDias,
      ejecutarRegistro,
      message,
    ]
  );

  // Deshabilitar "Registrar pago" con datos incompletos (espejo del criterio anterior)
  const registrarDisabled =
    (!configuracionAporteActiva && !estadoActualAporte) ||
    (!esPagoGratuito &&
      (montoCuota == null ||
        montoCuota === '' ||
        Number.isNaN(Number(montoCuota)) ||
        Number(montoCuota) < 0)) ||
    (!esPagoGratuito && !selectedMetodoPago) ||
    loadingStudent ||
    loadingContext;

  return {
    // Identidad y navegación
    studentId,
    student,
    loadingStudent,
    pageTitle,
    breadcrumbItems,
    handleVolver,
    handleAsignarBeca,
    ocultarBotonAsignarBeca,
    sinEstudiante: !studentId,
    redirigiendoADetalle,
    cargandoDatosBase,

    // Datos del aporte y catálogos (pass-through del contexto)
    becaActiva,
    porcentajeBeca,
    descuentoBeca,
    estadoActualAporte,
    configuracionAporteActiva,
    configuracionAportes,
    metodosPago,
    cuentasPago,
    bancosAutorizados,

    // Monto y compromiso
    montoCuota,
    saldoPendiente,
    esPagoGratuito,
    cancelaTodo,
    esPrimeraCuota,
    mostrarSelectorCompromiso,
    saldoRestanteCompromiso,
    compromisoDias,
    setCompromisoDias,
    fechaCompromisoProyectada,
    opcionesCompromiso: OPCIONES_COMPROMISO,

    // Formulario y submit
    form,
    validarPasoDatosPago,
    handleFinish,
    isSubmitting,
    registrarDisabled,
    submitError,
  };
};
