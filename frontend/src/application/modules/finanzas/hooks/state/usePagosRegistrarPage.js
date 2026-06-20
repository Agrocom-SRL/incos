/**
 * Hook de pantalla: registrar abono/pago de aporte (Finanzas).
 *
 * Orquesta el flujo INLINE completo: buscar/seleccionar estudiante → cargar su
 * estado de aporte → formulario de abono (campos condicionales por método de pago)
 * → submit → feedback de éxito → navegar a la ficha del pago o al listado.
 *
 * Espejo de `usePagosDetailPage`: la página es "dumb", aquí vive toda la lógica.
 * Las reglas por método replican FUNCIONALMENTE el validator del backend
 * (`registerPagoAporteValidator`), sin importar código legacy:
 *   - EFECTIVO (1):      sin cuenta, sin comprobante.
 *   - QR (2):            comprobante requerido; cuenta opcional.
 *   - TRANSFERENCIA (3): cuenta requerida; comprobante requerido.
 *   - DEPOSITO (4):      cuenta requerida; comprobante requerido.
 * El monto del abono no puede superar el saldo pendiente del aporte.
 *
 * Si el abono deja SALDO PENDIENTE y el usuario indicó una "fecha de compromiso de
 * pago", tras registrar la cuota se persiste esa fecha en el compromiso del aporte
 * (POST sobre la cabecera/`pago_aporte_id`). Ese guardado es INDEPENDIENTE: si falla
 * (p. ej. el usuario no tiene `finanzas.compromiso.gestionar` → 403), el pago ya
 * registrado NO se pierde; solo se avisa que el compromiso no quedó guardado.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { App, Form } from 'antd';
import dayjs from 'dayjs';
import { usePagosRegistrarContext } from '@application-finanzas/hooks/context/usePagosRegistrarContext';
import {
  buildReglasMetodo,
  findMetodoCodigo,
} from '@finanzas/pagos/config/registrarFormConfig';
import { PAGOS_LIST_PATH, pagoDetallePath } from '@application-finanzas/config/paths';

const FIN_PAG_MENU_KEY = 'FIN-PAG';
const DURACION_MENSAJE_ERROR = 8;

export const usePagosRegistrarPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { message } = App.useApp();
  const [form] = Form.useForm();

  const {
    estudiantes,
    loadingBusqueda,
    errorBusqueda,
    buscarEstudiantes,
    cargarEstudiantesPreliminar,
    estado,
    loadingEstado,
    errorEstado,
    cargarEstado,
    limpiarEstado,
    metodosPago,
    cuentasPago,
    loadingCatalogos,
    errorCatalogos,
    registrarPago,
    registrando,
    guardarCompromiso,
  } = usePagosRegistrarContext();

  /** Estudiante seleccionado (DTO de búsqueda) o null mientras se elige. */
  const [estudianteSeleccionado, setEstudianteSeleccionado] = useState(null);
  /** Id de método de pago elegido (controla los campos condicionales). */
  const [metodoPagoId, setMetodoPagoId] = useState(null);

  const returnListPath = location.state?.returnListPath || PAGOS_LIST_PATH;
  const menuSidebarKey = location.state?.menuSidebarKey ?? FIN_PAG_MENU_KEY;

  // Carga preliminar de estudiantes con saldo pendiente al montar (mejor UX que lista vacía).
  useEffect(() => {
    cargarEstudiantesPreliminar();
  }, [cargarEstudiantesPreliminar]);

  const breadcrumbItems = useMemo(
    () => [
      { title: 'Inicio', href: '/' },
      { title: 'Finanzas' },
      { title: 'Pagos', href: returnListPath },
      { title: 'Registrar pago' },
    ],
    [returnListPath],
  );

  const handleVolver = useCallback(() => {
    navigate(returnListPath, { state: { menuSidebarKey } });
  }, [navigate, returnListPath, menuSidebarKey]);

  /** Selecciona un estudiante y carga su estado de aporte (gestión vigente). */
  const handleSeleccionarEstudiante = useCallback(
    (estudiante) => {
      if (!estudiante?.id) return;
      setEstudianteSeleccionado(estudiante);
      setMetodoPagoId(null);
      form.resetFields();
      cargarEstado(estudiante.id);
    },
    [cargarEstado, form],
  );

  /** Vuelve al paso de selección (limpia estado/formulario). */
  const handleCambiarEstudiante = useCallback(() => {
    setEstudianteSeleccionado(null);
    setMetodoPagoId(null);
    form.resetFields();
    limpiarEstado();
  }, [form, limpiarEstado]);

  /** Al cambiar de método, limpia campos que dejan de aplicar. */
  const handleMetodoPagoChange = useCallback(
    (value) => {
      setMetodoPagoId(value);
      form.setFieldsValue({
        cuentaPagoId: undefined,
        codigoComprobante: undefined,
        numeroTransaccion: undefined,
        documentoRespaldo: undefined,
      });
    },
    [form],
  );

  // Reglas derivadas del método seleccionado (espejan el validator del backend).
  const metodoCodigo = useMemo(
    () => findMetodoCodigo(metodosPago, metodoPagoId),
    [metodosPago, metodoPagoId],
  );
  const reglasMetodo = useMemo(() => buildReglasMetodo(metodoCodigo), [metodoCodigo]);

  const saldoPendiente = estado?.saldoPendiente ?? 0;

  /**
   * Submit: arma el payload con los nombres EXACTOS del backend y registra la cuota.
   * El repositorio de infraestructura decide JSON vs multipart según `documentoRespaldo`.
   */
  const handleFinish = useCallback(
    async (values) => {
      if (!estudianteSeleccionado?.id) {
        message.error('Seleccione un estudiante antes de registrar el pago');
        return;
      }

      const monto = Number(values.monto);
      if (!Number.isFinite(monto) || monto < 0) {
        message.error('Indique un monto válido para el abono');
        return;
      }
      if (saldoPendiente > 0 && monto > saldoPendiente) {
        message.error(`El monto no puede superar el saldo pendiente (Bs ${saldoPendiente})`);
        return;
      }

      // Extraer archivo de comprobante (AntD Upload entrega un array de fileList).
      let documentoRespaldo = null;
      if (Array.isArray(values.documentoRespaldo) && values.documentoRespaldo.length > 0) {
        const file = values.documentoRespaldo[0];
        documentoRespaldo = file?.originFileObj || file;
      }

      const payload = {
        student_id: Number(estudianteSeleccionado.id),
        amount: monto,
        payment_method_id: Number(metodoPagoId),
        payment_account_id: reglasMetodo.cuentaVisible && values.cuentaPagoId ? Number(values.cuentaPagoId) : null,
        payment_date: values.fechaPago ? dayjs(values.fechaPago).format('YYYY-MM-DD') : null,
        transaction_number: (values.numeroTransaccion || '').trim() || null,
        codigo_comprobante: (values.codigoComprobante || '').trim() || null,
        descripcion: (values.descripcion || '').trim() || null,
        documentoRespaldo,
      };

      const result = await registrarPago(payload);

      if (!result?.success) {
        message.error(result?.error || 'No se pudo registrar el pago', DURACION_MENSAJE_ERROR);
        return;
      }

      const cabeceraId = estado?.cabeceraId ?? result?.data?.id ?? null;

      // Saldo que queda tras el abono; con saldo > 0 y fecha indicada, se compromete.
      const saldoResultante = saldoPendiente > 0 ? Math.max(saldoPendiente - monto, 0) : 0;
      const fechaCompromiso = values.fechaCompromiso
        ? dayjs(values.fechaCompromiso).format('YYYY-MM-DD')
        : null;
      const debeComprometer = saldoResultante > 0 && fechaCompromiso && cabeceraId;

      // El compromiso es INDEPENDIENTE del pago: si falla, el abono ya quedó registrado.
      if (debeComprometer) {
        const compromisoResult = await guardarCompromiso({
          pagoAporteId: cabeceraId,
          values: { fechaCompromiso },
        });

        if (compromisoResult?.success) {
          message.success('Pago registrado y compromiso de pago guardado');
        } else {
          message.success('Pago registrado correctamente');
          message.warning(
            compromisoResult?.error
              ? `El pago se registró, pero no se pudo guardar el compromiso: ${compromisoResult.error}`
              : 'El pago se registró, pero no se pudo guardar el compromiso de pago',
            DURACION_MENSAJE_ERROR,
          );
        }
      } else {
        message.success('Pago registrado correctamente');
      }

      if (cabeceraId) {
        navigate(pagoDetallePath(cabeceraId), {
          state: { returnListPath, menuSidebarKey },
        });
      } else {
        navigate(returnListPath, { state: { menuSidebarKey } });
      }
    },
    [
      estudianteSeleccionado,
      saldoPendiente,
      metodoPagoId,
      reglasMetodo,
      registrarPago,
      guardarCompromiso,
      message,
      estado,
      navigate,
      returnListPath,
      menuSidebarKey,
    ],
  );

  return {
    // Layout
    breadcrumbItems,
    returnListPath,
    handleVolver,
    // Búsqueda / selección
    estudiantes,
    loadingBusqueda,
    errorBusqueda,
    buscarEstudiantes,
    estudianteSeleccionado,
    handleSeleccionarEstudiante,
    handleCambiarEstudiante,
    // Estado del aporte
    estado,
    loadingEstado,
    errorEstado,
    saldoPendiente,
    // Catálogos
    metodosPago,
    cuentasPago,
    loadingCatalogos,
    errorCatalogos,
    // Formulario
    form,
    metodoPagoId,
    reglasMetodo,
    handleMetodoPagoChange,
    handleFinish,
    registrando,
  };
};
