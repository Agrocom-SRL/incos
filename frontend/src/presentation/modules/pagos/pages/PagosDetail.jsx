/**
 * PagosDetail - Vista de detalle de un pago
 *
 * Misma estructura que EstudiantesDetail: perfil compacto arriba + tabs con cards abajo.
 * Estilos compartidos: page.css (.sd-*). Volver solo en cabecera de página.
 */

import { useMemo, useEffect, useCallback, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { App } from 'antd';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import { usePagosDetailContext, useEstadoAporteRegistro, useDeletePagoAporte } from '@application-pagos/hooks';
import dayjs from 'dayjs';
import { Spin, Alert, Empty, Tabs, Tag, Button, Table, Modal, Form, Input, InputNumber, Select, DatePicker } from 'antd';
import { DollarOutlined, UserOutlined, FileTextOutlined, DownloadOutlined, ArrowLeftOutlined, DeleteOutlined, DeleteFilled, PlusCircleOutlined, EditOutlined, CalendarOutlined } from '@ant-design/icons';
import { downloadFile } from '@application/utils';
import { useCasesFactory } from '@container';
import { showDeleteConfirm } from '@molecules/DeleteConfirmModal';
import { useAuthContext, esEstudiante } from '@application-auth';
import { CompromisoAlertTag, formatFechaCompromiso } from '@atoms';
import { useGuardarCompromiso } from '@application-finanzas/hooks/api/useGuardarCompromiso';

const DURACION_MENSAJE_ERROR = 8;

const formatMonto = (monto) => {
  if (monto === null || monto === undefined) return '0.00';
  return Number(monto).toFixed(2);
};

const formatFecha = (fecha) => {
  if (!fecha) return 'N/A';
  try {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-BO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return fecha;
  }
};

/* ─────────────────────────────────────────
   Átomo: Field — label arriba, valor abajo
───────────────────────────────────────── */
const Field = ({ label, children, span = 1 }) => (
  <div className={`sd-field sd-field--span-${span}`}>
    <span className="sd-field__label">{label}</span>
    <span className="sd-field__value">{children ?? '—'}</span>
  </div>
);

/* ─────────────────────────────────────────
   Átomo: InfoCard — card de sección
   headVariant: 'resumen' = resumen del aporte (sistema, la base). Sin variant = color primary (detalle pago/cuota).
───────────────────────────────────────── */
const InfoCard = ({ title, icon, extra, children, cols = 2, headVariant }) => (
  <div className="sd-card">
    <div className={`sd-card__head${headVariant ? ` sd-card__head--${headVariant}` : ''}`}>
      <span className="sd-card__title">
        {icon && <span className="sd-card__title-icon">{icon}</span>}
        {title}
      </span>
      {extra && <div className="sd-card__extra">{extra}</div>}
    </div>
    <div className={`sd-card__body sd-card__body--cols-${cols}`}>
      {children}
    </div>
  </div>
);

const PagosDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { message, modal } = App.useApp();
  const { hasPermiso, usuario } = useAuthContext();
  /** Vista propia del estudiante (reusa esta pantalla como "Mis aportes"). */
  const esVistaPropiaEstudiante = esEstudiante(usuario);
  const pageTitle = esVistaPropiaEstudiante ? 'Mis aportes' : 'Detalle del Pago';

  const studentIdFromState = location.state?.studentId ?? null;
  const menuSidebarKeyFromState = location.state?.menuSidebarKey;
  const fromBeca100 = location.state?.fromBeca100 === true;
  const volverALista = !studentIdFromState;
  const puedeExportarPago = hasPermiso('finanzas.pago.ver', 'EXPORTAR')
    || hasPermiso('matricula.pago.aporte.ver', 'EXPORTAR');
  const puedeRegistrarPago = hasPermiso('finanzas.pago.registrar', 'CREAR');
  const puedeEliminarPagoPermiso = hasPermiso('finanzas.pago.editar', 'ELIMINAR')
    || hasPermiso('matricula.pago.aporte.ver', 'ELIMINAR');
  const puedeEditarCuota = hasPermiso('finanzas.pago.editar', 'EDITAR')
    || hasPermiso('matricula.pago.aporte.ver', 'EDITAR');
  // Compromiso de pago: permiso propio (alta = CREAR, edición = EDITAR).
  const puedeCrearCompromiso = hasPermiso('finanzas.compromiso.gestionar', 'CREAR');
  const puedeEditarCompromiso = hasPermiso('finanzas.compromiso.gestionar', 'EDITAR');

  const {
    pago,
    loading = false,
    error = null,
    refetch,
  } = usePagosDetailContext();

  const { deletePagoAporte, loading: deletingPago } = useDeletePagoAporte();

  const studentIdForEstado = pago?.estudiante?.id ?? pago?.student_id ?? null;
  const gestionIdForEstado = pago?.gestion?.id ?? pago?.management_id ?? null;
  const { estadoAporte, loading: loadingEstado, refetch: refetchEstadoAporte } = useEstadoAporteRegistro(studentIdForEstado, gestionIdForEstado);

  const [downloadingCuotaId, setDownloadingCuotaId] = useState(null);
  const [deletingCuotaId, setDeletingCuotaId] = useState(null);
  const [editCuotaModalOpen, setEditCuotaModalOpen] = useState(false);
  const [editCuotaRecord, setEditCuotaRecord] = useState(null);
  const [editCuotaForm] = Form.useForm();
  const [catalogosPagoLoaded, setCatalogosPagoLoaded] = useState(false);
  const [loadingCatalogosPago, setLoadingCatalogosPago] = useState(false);
  const [savingCuotaEdit, setSavingCuotaEdit] = useState(false);
  const [metodosPagoOptions, setMetodosPagoOptions] = useState([]);
  const [cuentasPagoOptions, setCuentasPagoOptions] = useState([]);

  const paymentMethodIdWatch = Form.useWatch('payment_method_id', editCuotaForm);

  // ── Compromiso de pago ────────────────────────────────────────────────
  // Viene embebido en el detalle (contrato camelCase): { id, fechaCompromiso,
  // observacion, estado, diasAtraso, alerta } | null.
  const compromiso = pago?.compromiso ?? null;
  const [compromisoModalOpen, setCompromisoModalOpen] = useState(false);
  const [compromisoForm] = Form.useForm();
  const { guardar: guardarCompromiso, loading: savingCompromiso } = useGuardarCompromiso();

  const handleOpenCompromisoModal = useCallback(() => {
    compromisoForm.setFieldsValue({
      fechaCompromiso: compromiso?.fechaCompromiso ? dayjs(compromiso.fechaCompromiso) : null,
      observacion: compromiso?.observacion ?? null,
    });
    setCompromisoModalOpen(true);
  }, [compromiso, compromisoForm]);

  const handleCloseCompromisoModal = useCallback(() => {
    setCompromisoModalOpen(false);
    compromisoForm.resetFields();
  }, [compromisoForm]);

  const handleSubmitCompromiso = useCallback(async () => {
    if (!pago?.id) return;
    try {
      const values = await compromisoForm.validateFields();
      const result = await guardarCompromiso({
        pagoAporteId: pago.id,
        compromisoId: compromiso?.id ?? null,
        values: {
          fechaCompromiso: values.fechaCompromiso
            ? dayjs(values.fechaCompromiso).format('YYYY-MM-DD')
            : null,
          observacion: (values.observacion || '').trim() || null,
        },
      });
      if (!result?.success) {
        message.error(result?.error || 'No se pudo guardar el compromiso de pago', DURACION_MENSAJE_ERROR);
        return;
      }
      message.success(compromiso?.id ? 'Compromiso actualizado' : 'Compromiso registrado');
      handleCloseCompromisoModal();
      if (typeof refetch === 'function') {
        await refetch();
      }
    } catch (err) {
      if (err?.errorFields) return;
      message.error(err?.message || 'Error al guardar el compromiso de pago', DURACION_MENSAJE_ERROR);
    }
  }, [pago?.id, compromiso?.id, compromisoForm, guardarCompromiso, message, refetch, handleCloseCompromisoModal]);

  const textoRecibosCuotas = useMemo(() => {
    const cuotas = estadoAporte?.cuotas;
    if (!cuotas?.length) return null;
    const nums = [...new Set(cuotas.map((c) => c.numero_recibo).filter(Boolean))];
    nums.sort((a, b) => String(a).localeCompare(String(b), undefined, { numeric: true }));
    if (!nums.length) return null;
    return nums.join(', ');
  }, [estadoAporte?.cuotas]);

  const defaultTabPagos = location.state?.pagosTab === 'cuotas' ? 'cuotas' : 'resumen';

  const handleDownloadReciboCuota = useCallback(async (cuotaIdOrNumeroRecibo) => {
    try {
      if (cuotaIdOrNumeroRecibo == null || cuotaIdOrNumeroRecibo === '') {
        message.error('ID o número de recibo no disponible');
        return;
      }
      setDownloadingCuotaId(cuotaIdOrNumeroRecibo);
      message.loading({ content: 'Generando recibo de la cuota...', key: 'download-cuota' });
      const useCase = useCasesFactory.generarReciboPago();
      if (!useCase) {
        message.error({ content: 'No se pudo inicializar el caso de uso', key: 'download-cuota', duration: 5 });
        return;
      }
      const result = await useCase.ejecutar(cuotaIdOrNumeroRecibo);
      if (!result || !result.success) {
        message.error({ content: result?.error || result?.message || 'Error al generar el recibo', key: 'download-cuota', duration: 5 });
        return;
      }
      const reciboData = result.data;
      if (!reciboData?.filePath) {
        message.error({ content: 'No se pudo obtener el recibo', key: 'download-cuota', duration: 5 });
        return;
      }
      await downloadFile(reciboData.filePath, reciboData.fileName || 'recibo_cuota.pdf');
      message.success({ content: 'Recibo descargado', key: 'download-cuota' });
    } catch (err) {
      message.error({ content: 'Error al descargar recibo: ' + (err?.message || ''), key: 'download-cuota', duration: 5 });
    } finally {
      setDownloadingCuotaId(null);
    }
  }, [message]);

  const handleCloseEditCuotaModal = useCallback(() => {
    setEditCuotaModalOpen(false);
    setEditCuotaRecord(null);
    editCuotaForm.resetFields();
  }, [editCuotaForm]);

  const handleOpenEditCuota = useCallback((record) => {
    if (!record?.id || !pago?.id) return;
    navigate(`/pagos/${pago.id}/editar`, {
      state: {
        ...(menuSidebarKeyFromState ? { menuSidebarKey: menuSidebarKeyFromState } : {}),
        returnListPath: `/pagos/${pago.id}`,
        selectedCuotaId: record.id,
      },
    });
  }, [navigate, pago?.id, menuSidebarKeyFromState]);

  const handleSubmitEditCuota = useCallback(async () => {
    const cuotaId = editCuotaRecord?.id;
    if (!cuotaId) return;
    try {
      const values = await editCuotaForm.validateFields();
      setSavingCuotaEdit(true);
      const methodId = values.payment_method_id;
      const payload = {
        amount: Number(values.amount),
        payment_method_id: methodId,
        payment_account_id: (methodId === 3 || methodId === 4) ? (values.payment_account_id ?? null) : null,
        payment_date: dayjs(values.payment_date).format('YYYY-MM-DD'),
        transaction_number: (methodId === 3 || methodId === 4) ? (values.transaction_number?.trim() || null) : null,
        codigo_comprobante: (methodId === 2 || methodId === 3 || methodId === 4)
          ? (values.codigo_comprobante?.trim() || null)
          : null,
        descripcion: values.descripcion?.trim() || null,
      };
      const uc = useCasesFactory.actualizarCuotaPagoAporte();
      const result = await uc.ejecutar(cuotaId, payload);
      if (!result?.success) {
        message.error(result?.error || result?.message || 'No se pudo actualizar la cuota', DURACION_MENSAJE_ERROR);
        return;
      }
      message.success('Cuota actualizada');
      handleCloseEditCuotaModal();
      await refetchEstadoAporte();
      if (typeof refetch === 'function') {
        await refetch();
      }
    } catch (err) {
      if (err?.errorFields) return;
      message.error(err?.message || 'Error al guardar la cuota', DURACION_MENSAJE_ERROR);
    } finally {
      setSavingCuotaEdit(false);
    }
  }, [editCuotaForm, editCuotaRecord, handleCloseEditCuotaModal, message, refetch, refetchEstadoAporte]);

  useEffect(() => {
    if (!loading && error) {
      navigate('/pagos', { replace: true });
    }
  }, [loading, error, navigate]);

  const breadcrumbItems = useMemo(() => [
    { title: 'Inicio', href: '/' },
    { title: 'Pagos', href: '/pagos' },
    { title: 'Detalle del Pago' },
  ], []);

  const handleBack = useCallback(() => {
    if (volverALista) {
      navigate('/pagos');
    } else {
      navigate(`/estudiantes/${studentIdFromState}`);
    }
  }, [volverALista, studentIdFromState, navigate]);

  const studentIdForRegistrar = pago?.estudiante?.id ?? pago?.student_id ?? studentIdFromState ?? null;
  const handleRegistrarSiguienteCuota = useCallback(() => {
    if (!studentIdForRegistrar) {
      message.warning('No se puede registrar cuota: falta ID del estudiante');
      return;
    }
    navigate('/pagos/registrar', {
      state: {
        studentId: studentIdForRegistrar,
        ...(menuSidebarKeyFromState ? { menuSidebarKey: menuSidebarKeyFromState } : {}),
      },
    });
  }, [navigate, studentIdForRegistrar, message, menuSidebarKeyFromState]);

  const handleEliminarPago = useCallback(async () => {
    if (!pago?.id) return;
    await showDeleteConfirm({
      modal,
      itemName: 'este pago de aporte',
      itemDetails: [
        { label: 'Recibo(s)', value: textoRecibosCuotas || '—' },
        { label: 'Estudiante', value: pago.estudiante?.nombreCompleto || pago.estudiante?.codigoEstudiante || '—' },
        { label: 'Gestión', value: pago.gestion?.nombre || pago.gestion?.codigo || '—' },
      ],
      onConfirm: async () => {
        const result = await deletePagoAporte(pago.id);
        if (result?.success) {
          message.success('Pago eliminado correctamente');
          if (studentIdFromState) {
            navigate(`/estudiantes/${studentIdFromState}`, { replace: true });
          } else {
            navigate('/pagos', { replace: true });
          }
        } else {
          message.error(result?.error || 'Error al eliminar el pago', DURACION_MENSAJE_ERROR);
        }
      },
    });
  }, [modal, pago, deletePagoAporte, message, studentIdFromState, navigate, textoRecibosCuotas]);

  const handleEliminarCuota = useCallback(
    (record) => {
      const cuotaId = record?.id;
      if (!cuotaId) return;
      showDeleteConfirm({
        modal,
        itemName: 'esta cuota de pago',
        itemDetails: [
          { label: 'Recibo', value: record.numero_recibo != null ? String(record.numero_recibo) : '—' },
          { label: 'Fecha', value: formatFecha(record.fecha_pago) },
          {
            label: 'Monto',
            value: `Bs. ${Number(record.monto ?? 0).toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          },
        ],
        onConfirm: async () => {
          setDeletingCuotaId(cuotaId);
          try {
            const uc = useCasesFactory.eliminarCuotaPagoAporte();
            const result = await uc.ejecutar(cuotaId);
            if (!result?.success) {
              message.error(result?.error || result?.message || 'No se pudo eliminar la cuota', DURACION_MENSAJE_ERROR);
              return;
            }
            message.success('Cuota eliminada correctamente');
            await refetchEstadoAporte();
            if (typeof refetch === 'function') {
              await refetch();
            }
          } finally {
            setDeletingCuotaId(null);
          }
        },
      });
    },
    [modal, message, refetch, refetchEstadoAporte]
  );

  const tabItems = useMemo(() => {
    if (!pago?.id) {
      return [{ key: 'resumen', label: <span className="sd-tab-label"><DollarOutlined /> Resumen</span>, children: <div className="sd-tab-body" /> }];
    }
    const estadoPagoVal = pago.estado ?? pago.state;
    const montoObligatorioVal = pago.monto_obligatorio ?? pago.mandatoryAmount ?? pago.montoObligatorio ?? 0;
    const resumenChildren = (
      <div className="sd-tab-body">
        {(pago.estudiante || pago.gestion) && (
          <InfoCard title="Estudiante y gestión académica" icon={<UserOutlined />} cols={3}>
            {pago.estudiante && (
              <>
                <Field label="Código estudiante">{pago.estudiante.codigoEstudiante}</Field>
                <Field label="Nombre">{pago.estudiante.nombreCompleto}</Field>
                <Field label="CI">
                  {pago.estudiante.ci
                    ? `${pago.estudiante.ci} ${(pago.estudiante.expedicion || '').toString().toUpperCase()}`.trim()
                    : '—'}
                </Field>
              </>
            )}
            {pago.gestion && (
              <>
                <Field label="Código gestión">{pago.gestion.codigo}</Field>
                <Field label="Gestión">{pago.gestion.nombre}</Field>
                <Field label="Año">{pago.gestion.anio}</Field>
              </>
            )}
          </InfoCard>
        )}
        {/* Resumen del aporte = estado del sistema (estado-registro). Color distinto = "la base". */}
        {estadoAporte && (
          <InfoCard title="Resumen del aporte" icon={<DollarOutlined />} cols={2} headVariant="resumen">
            <Field label="Concepto">
              {estadoAporte.gestion
                ? `Aporte Académico - Gestión ${estadoAporte.gestion.nombre || ''}`.trim()
                : 'Aporte Académico'}
            </Field>
            <Field label="Monto base / obligatorio">
              Bs. {Number(estadoAporte.monto_base ?? estadoAporte.monto_obligatorio ?? 0).toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Field>
            <Field label="Total pagado">
              Bs. {Number(estadoAporte.total_pagado ?? 0).toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Field>
            <Field label="Saldo pendiente">
              {Number(estadoAporte.saldo_pendiente ?? 0) > 0 ? (
                <span className="sd-field__value--danger">
                  Bs. {Number(estadoAporte.saldo_pendiente ?? 0).toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              ) : (
                `Bs. ${Number(estadoAporte.saldo_pendiente ?? 0).toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
              )}
            </Field>
          </InfoCard>
        )}
        {/* Compromiso de pago: fecha comprometida, semáforo de alerta y observación.
            Aviso visible cuando ya venció. Editar/crear gateado por permiso propio. */}
        <InfoCard
          title="Compromiso de pago"
          icon={<CalendarOutlined />}
          cols={3}
          extra={
            compromiso
              ? (puedeEditarCompromiso && (
                  <Button
                    type="link"
                    size="small"
                    icon={<EditOutlined />}
                    onClick={handleOpenCompromisoModal}
                  >
                    Editar compromiso
                  </Button>
                ))
              : (puedeCrearCompromiso && (
                  <Button
                    type="link"
                    size="small"
                    icon={<PlusCircleOutlined />}
                    onClick={handleOpenCompromisoModal}
                  >
                    Registrar compromiso
                  </Button>
                ))
          }
        >
          {compromiso ? (
            <>
              <Field label="Fecha de compromiso">
                {formatFechaCompromiso(compromiso.fechaCompromiso)}
              </Field>
              <Field label="Estado">
                <CompromisoAlertTag compromiso={compromiso} />
              </Field>
              <Field label="Días">
                {compromiso.diasAtraso == null
                  ? '—'
                  : compromiso.diasAtraso > 0
                    ? `${compromiso.diasAtraso} de atraso`
                    : `Faltan ${Math.abs(compromiso.diasAtraso)}`}
              </Field>
              <Field label="Observación" span={3}>
                {compromiso.observacion || '—'}
              </Field>
              {compromiso.estado !== 'CUMPLIDO' && compromiso.alerta === 'VENCIDA' && (
                <div className="sd-field sd-field--span-3">
                  <Alert
                    type="error"
                    showIcon
                    title={<strong>Compromiso de pago vencido</strong>}
                    description={
                      compromiso.diasAtraso > 0
                        ? `El compromiso venció hace ${compromiso.diasAtraso} día(s) (${formatFechaCompromiso(compromiso.fechaCompromiso)}). Regularice el saldo pendiente.`
                        : `El compromiso (${formatFechaCompromiso(compromiso.fechaCompromiso)}) está vencido. Regularice el saldo pendiente.`
                    }
                  />
                </div>
              )}
              {compromiso.estado !== 'CUMPLIDO' && compromiso.alerta === 'PROXIMA' && (
                <div className="sd-field sd-field--span-3">
                  <Alert
                    type="warning"
                    showIcon
                    title={<strong>Compromiso próximo a vencer</strong>}
                    description={`Vence el ${formatFechaCompromiso(compromiso.fechaCompromiso)}${
                      compromiso.diasAtraso != null && compromiso.diasAtraso <= 0
                        ? ` · faltan ${Math.abs(compromiso.diasAtraso)} día(s)`
                        : ''
                    }.`}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="sd-field sd-field--span-3">
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Este aporte no tiene un compromiso de pago registrado."
              >
                {puedeCrearCompromiso && (
                  <Button type="primary" icon={<PlusCircleOutlined />} onClick={handleOpenCompromisoModal}>
                    Registrar compromiso
                  </Button>
                )}
              </Empty>
            </div>
          )}
        </InfoCard>
      </div>
    );
    const cuotasChildren = (
      <div className="sd-tab-body">
        {/* Datos del aporte = cabecera pago_aporte: estado, descuento, montos, total pagado, saldo. Botón lleva a registrar siguiente cuota. */}
        <InfoCard title="Datos del aporte" icon={<DollarOutlined />} cols={3}>
          <Field label="Estado">
            {estadoPagoVal ? (
              <Tag color={estadoPagoVal === 'CANCELADO' ? 'success' : estadoPagoVal === 'PARCIAL' ? 'processing' : 'default'}>
                {estadoPagoVal}
              </Tag>
            ) : '—'}
          </Field>
          <Field label="Monto base">Bs. {formatMonto(pago.monto_base ?? pago.baseAmount ?? pago.montoBase ?? 0)}</Field>
          <Field label="Descuento beca (monto descontado)">
            {pago.descuento_beca ?? pago.scholarship_discount ?? pago.descuentoBeca
              ? `Bs. ${formatMonto(pago.descuento_beca ?? pago.scholarship_discount ?? pago.descuentoBeca)}`
              : 'Bs. 0.00'}
          </Field>
          <Field label="Monto obligatorio">Bs. {formatMonto(montoObligatorioVal)}</Field>
          <Field label="Total pagado">
            Bs. {Number(estadoAporte?.total_pagado ?? 0).toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Field>
          <Field label="Saldo pendiente">
            {Number(estadoAporte?.saldo_pendiente ?? 0) > 0 ? (
              <span className="sd-field__value--danger">
                Bs. {Number(estadoAporte.saldo_pendiente ?? 0).toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            ) : (
              `Bs. ${Number(estadoAporte?.saldo_pendiente ?? 0).toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
            )}
          </Field>
        </InfoCard>
        {loadingEstado ? (
          <div className="sd-loading" style={{ padding: '40px' }}>
            <Spin size="large" />
            <p style={{ marginTop: 12 }}>Cargando detalle del aporte…</p>
          </div>
        ) : estadoAporte?.cuotas && estadoAporte.cuotas.length > 0 ? (
              <InfoCard title={`Cuotas registradas (${estadoAporte.cuotas.length})`} icon={<DownloadOutlined />} cols={1}>
                <Table
                  dataSource={estadoAporte.cuotas}
                  rowKey={(r) => r.id ?? r.numero_recibo}
                  pagination={false}
                  size="small"
                  expandable={{
                    expandedRowRender: (record) => {
                      const cp = record.cuenta_pago;
                      const hasObservacion = record.observacion && String(record.observacion).trim();
                      const hasTransaccion = record.numero_transaccion && String(record.numero_transaccion).trim();
                      const hasComprobante = record.codigo_comprobante && String(record.codigo_comprobante).trim();
                      const hasCuenta = cp && (cp.nombre_titular || cp.numero_cuenta || cp.numero_celular);
                      const hasExtra = hasObservacion || hasTransaccion || hasComprobante || hasCuenta;
                      if (!hasExtra) {
                        return <span className="sd-field__value" style={{ color: 'var(--text-500)', fontSize: '13px' }}>Sin datos adicionales</span>;
                      }
                      return (
                        <div className="sd-card__body" style={{ padding: '12px 16px', gap: '8px', display: 'flex', flexDirection: 'column', background: 'var(--border-soft, #f3f4f6)' }}>
                          {hasCuenta && (
                            <div>
                              <span className="sd-field__label" style={{ display: 'block', marginBottom: 2 }}>Cuenta / info</span>
                              <span className="sd-field__value">
                                {[cp.nombre_titular, cp.numero_cuenta && `Cuenta: ${cp.numero_cuenta}`, cp.numero_celular && `Cel: ${cp.numero_celular}`].filter(Boolean).join(' · ')}
                              </span>
                            </div>
                          )}
                          {hasObservacion && (
                            <div><span className="sd-field__label" style={{ display: 'block', marginBottom: 2 }}>Observación</span><span className="sd-field__value">{String(record.observacion).trim()}</span></div>
                          )}
                          {hasTransaccion && (
                            <div><span className="sd-field__label" style={{ display: 'block', marginBottom: 2 }}>Nº transacción</span><span className="sd-field__value">{record.numero_transaccion}</span></div>
                          )}
                          {hasComprobante && (
                            <div><span className="sd-field__label" style={{ display: 'block', marginBottom: 2 }}>Código comprobante</span><span className="sd-field__value">{record.codigo_comprobante}</span></div>
                          )}
                        </div>
                      );
                    },
                    rowExpandable: () => true,
                  }}
                  columns={[
                    { title: 'Recibo', dataIndex: 'numero_recibo', key: 'numero_recibo', render: (v) => v || '—' },
                    { title: 'Fecha', dataIndex: 'fecha_pago', key: 'fecha_pago', render: (v) => formatFecha(v) },
                    {
                      title: 'Monto',
                      dataIndex: 'monto',
                      key: 'monto',
                      render: (v) => `Bs. ${Number(v ?? 0).toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                    },
                    {
                      title: 'Método de pago',
                      key: 'metodo_pago',
                      render: (_, record) => {
                        const mp = record.metodo_pago;
                        if (!mp) return '—';
                        return mp.nombre || mp.codigo || '—';
                      },
                    },
                    ...(puedeEditarCuota
                      ? [
                          {
                            title: '',
                            key: 'editar',
                            width: 100,
                            render: (_, record) => (
                              <Button
                                type="link"
                                size="small"
                                icon={<EditOutlined />}
                                onClick={() => handleOpenEditCuota(record)}
                                style={{ color: 'var(--accent-600, #d48806)', fontWeight: 600 }}
                              >
                                Editar
                              </Button>
                            ),
                          },
                        ]
                      : []),
                    ...(puedeEliminarPagoPermiso
                      ? [
                          {
                            title: '',
                            key: 'eliminar_cuota',
                            width: 44,
                            align: 'center',
                            render: (_, record) => (
                              <Button
                                type="text"
                                size="small"
                                danger
                                icon={<DeleteFilled />}
                                aria-label="Eliminar cuota"
                                loading={deletingCuotaId === record.id}
                                onClick={() => handleEliminarCuota(record)}
                              />
                            ),
                          },
                        ]
                      : []),
                    // Descarga de recibo: solo con permiso EXPORTAR (oculto para el estudiante).
                    ...(puedeExportarPago
                      ? [{
                          title: '',
                          key: 'descargar',
                          width: 140,
                          render: (_, record) => (
                            <Button
                              type="link"
                              size="small"
                              icon={<DownloadOutlined />}
                              onClick={() => handleDownloadReciboCuota(record.id ?? record.numero_recibo)}
                              loading={downloadingCuotaId === (record.id ?? record.numero_recibo)}
                            >
                              Descargar recibo
                            </Button>
                          ),
                        }]
                      : []),
                  ]}
                />
              </InfoCard>
        ) : !estadoAporte ? (
          <div className="sd-empty">
            <DollarOutlined className="sd-empty__icon" />
            <p className="sd-empty__text">No hay estado de aporte disponible para esta gestión.</p>
          </div>
        ) : null}
      </div>
    );
    const becaChildren = pago.beca ? (
      <div className="sd-tab-body">
        <InfoCard title="Asignación de beca" icon={<DollarOutlined />} cols={3}>
          <Field label="Estado">
            {pago.beca.estado ? (
              <Tag color={pago.beca.estado === 'ACTIVA' ? 'success' : 'default'}>{pago.beca.estado}</Tag>
            ) : '—'}
          </Field>
          <Field label="Fecha de solicitud">{formatFecha(pago.beca.fechaSolicitud)}</Field>
          <Field label="Tipo">{pago.beca.tipoBeca?.nombre || '—'}</Field>
          {pago.beca.tipoBeca?.porcentaje != null && (
            <Field label="Descuento"><Tag color="green">{pago.beca.tipoBeca.porcentaje}%</Tag></Field>
          )}
          {pago.beca.tipoBeca?.descripcion && (
            <Field label="Descripción" span={3}>{pago.beca.tipoBeca.descripcion}</Field>
          )}
        </InfoCard>
      </div>
    ) : null;

    const inscripcionChildren = pago.inscripcion ? (
      <div className="sd-tab-body">
        <InfoCard title="Inscripción relacionada" icon={<FileTextOutlined />} cols={3}>
          <Field label="Código">{pago.inscripcion.codigo || '—'}</Field>
          <Field label="Fecha">{formatFecha(pago.inscripcion.fechaInscripcion)}</Field>
          <Field label="Estado">
            {pago.inscripcion.estado ? (
              <Tag color={pago.inscripcion.estado === 'ACTIVA' ? 'success' : 'default'}>{pago.inscripcion.estado}</Tag>
            ) : '—'}
          </Field>
        </InfoCard>
      </div>
    ) : null;

    const items = [
      { key: 'resumen', label: <span className="sd-tab-label"><DollarOutlined /> Resumen</span>, children: resumenChildren },
      { key: 'cuotas', label: <span className="sd-tab-label"><DownloadOutlined /> Cuotas</span>, children: cuotasChildren },
    ];
    if (becaChildren) {
      items.push({ key: 'beca', label: <span className="sd-tab-label"><DollarOutlined /> Beca</span>, children: becaChildren });
    }
    if (inscripcionChildren) {
      items.push({ key: 'inscripcion', label: <span className="sd-tab-label"><FileTextOutlined /> Inscripción</span>, children: inscripcionChildren });
    }
    return items;
  }, [
    pago,
    estadoAporte,
    loadingEstado,
    handleDownloadReciboCuota,
    puedeExportarPago,
    downloadingCuotaId,
    studentIdForRegistrar,
    handleRegistrarSiguienteCuota,
    puedeEditarCuota,
    handleOpenEditCuota,
    puedeEliminarPagoPermiso,
    handleEliminarCuota,
    deletingCuotaId,
    compromiso,
    puedeCrearCompromiso,
    puedeEditarCompromiso,
    handleOpenCompromisoModal,
  ]);

  if (loading) {
    return (
      <PageTemplate header={<PageHeader title={pageTitle} breadcrumbItems={breadcrumbItems} />}>
        <div className="sd-loading"><Spin size="large" /><p>Cargando datos del pago…</p></div>
      </PageTemplate>
    );
  }

  if (error) {
    return (
      <PageTemplate header={<PageHeader title={pageTitle} breadcrumbItems={breadcrumbItems} />}>
        <Alert title="Error al cargar el pago" description={error} type="error" showIcon />
      </PageTemplate>
    );
  }

  if (!pago || !pago.id) {
    return (
      <PageTemplate header={<PageHeader title={pageTitle} breadcrumbItems={breadcrumbItems} />}>
        <Empty description="No se encontró información del pago" />
      </PageTemplate>
    );
  }

  const puedeEliminarPago = !pago.inscripcion;
  const tituloRecibosPerfil = textoRecibosCuotas
    ? (String(textoRecibosCuotas).includes(',') ? `Recibos ${textoRecibosCuotas}` : `Recibo ${textoRecibosCuotas}`)
    : 'Aporte académico';
  const estadoPago = pago.estado ?? pago.state;
  const montoObligatorio = pago.monto_obligatorio ?? pago.mandatoryAmount ?? pago.montoObligatorio ?? 0;
  const profileSubtitle = [
    pago.estudiante?.nombreCompleto || pago.estudiante?.codigoEstudiante,
    pago.gestion?.nombre || pago.gestion?.codigo,
  ].filter(Boolean).join(' · ') || 'Pago de aporte';
  // En la vista propia del estudiante no hay "Volver" (no viene de un listado admin).
  const headerActions = esVistaPropiaEstudiante ? null : (
    <button type="button" className="sd-btn sd-btn--outline" onClick={handleBack}>
      <ArrowLeftOutlined /> Volver
    </button>
  );

  return (
    <PageTemplate header={<PageHeader title={pageTitle} breadcrumbItems={breadcrumbItems} actions={headerActions} />}>
      <div className="sd">

        {/* ═══ PROFILE CARD ═══ */}
        <div className="sd-profile">
          <div className="sd-profile__identity">
            <div className="sd-profile__avatar-wrap">
              <div className="sd-profile__avatar sd-profile__avatar--pago">
                <DollarOutlined />
              </div>
            </div>
            <div className="sd-profile__name-block">
              <h1 className="sd-profile__name">{tituloRecibosPerfil}</h1>
              <div className="sd-profile__meta">
                <p className="sd-profile__sub">{profileSubtitle}</p>
              </div>
            </div>
          </div>

          <div className="sd-profile__divider" />

          <div className="sd-profile__stats">
            <div className="sd-stat">
              <span className="sd-stat__label">Recibo(s)</span>
              <span className="sd-stat__value sd-stat__value--primary">{textoRecibosCuotas || '—'}</span>
            </div>
            <div className="sd-stat">
              <span className="sd-stat__label">Monto obligatorio</span>
              <span className="sd-stat__value">Bs. {formatMonto(montoObligatorio)}</span>
            </div>
            <div className="sd-stat">
              <span className="sd-stat__label">Estado</span>
              <span className="sd-stat__value">
                {estadoPago ? (
                  <Tag color={estadoPago === 'CANCELADO' ? 'success' : estadoPago === 'PARCIAL' ? 'processing' : 'default'} style={{ margin: 0 }}>
                    {estadoPago}
                  </Tag>
                ) : '—'}
              </span>
            </div>
          </div>

          <div className="sd-profile__divider" />

          <div className="sd-profile__actions">
            {fromBeca100 && puedeExportarPago && estadoAporte?.cuotas?.length > 0 && (() => {
              const cuotaBeca100 = estadoAporte.cuotas[0];
              const cuotaId = cuotaBeca100?.id ?? cuotaBeca100?.numero_recibo;
              return cuotaId ? (
                <button
                  type="button"
                  className="sd-btn sd-btn--primary"
                  onClick={() => handleDownloadReciboCuota(cuotaId)}
                  disabled={downloadingCuotaId === cuotaId}
                >
                  <DownloadOutlined /> Descargar recibo de beca 100%
                </button>
              ) : null;
            })()}
            {puedeRegistrarPago && studentIdForRegistrar && Number(estadoAporte?.saldo_pendiente ?? 0) > 0 && (
              <button type="button" className="sd-btn sd-btn--primary" onClick={handleRegistrarSiguienteCuota}>
                <PlusCircleOutlined /> Registrar siguiente pago
              </button>
            )}
            {puedeEliminarPagoPermiso && puedeEliminarPago && (
              <button
                type="button"
                className="sd-btn sd-btn--danger"
                onClick={handleEliminarPago}
                disabled={deletingPago}
              >
                <DeleteOutlined /> Eliminar pago
              </button>
            )}
          </div>
        </div>

        {/* ═══ TABS ═══ */}
        <div className="sd-tabs-shell">
          <Tabs
            key={`pagos-detail-tabs-${pago.id}-${defaultTabPagos}`}
            defaultActiveKey={defaultTabPagos}
            items={tabItems}
            className="sd-tabs"
          />
        </div>

        <Modal
          title={editCuotaRecord?.numero_recibo ? `Editar cuota · Recibo ${editCuotaRecord.numero_recibo}` : 'Editar cuota'}
          open={editCuotaModalOpen}
          onCancel={handleCloseEditCuotaModal}
          onOk={handleSubmitEditCuota}
          okText="Guardar"
          confirmLoading={savingCuotaEdit}
          destroyOnHidden
          width={560}
        >
          <Spin spinning={loadingCatalogosPago}>
            <Form
              form={editCuotaForm}
              layout="vertical"
              style={{ marginTop: 12 }}
              onValuesChange={(changed) => {
                if (Object.prototype.hasOwnProperty.call(changed, 'payment_method_id') && changed.payment_method_id === 1) {
                  editCuotaForm.setFieldValue('payment_account_id', undefined);
                }
              }}
            >
              <Form.Item
                name="amount"
                label="Monto (Bs.)"
                rules={[{ required: true, message: 'Ingrese el monto' }]}
              >
                <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item
                name="payment_method_id"
                label="Método de pago"
                rules={[{ required: true, message: 'Seleccione el método' }]}
              >
                <Select
                  options={metodosPagoOptions}
                  placeholder="Método"
                  loading={loadingCatalogosPago && !metodosPagoOptions.length}
                />
              </Form.Item>
              {(paymentMethodIdWatch === 3 || paymentMethodIdWatch === 4) && (
                <Form.Item
                  name="payment_account_id"
                  label="Cuenta de pago"
                  rules={[{ required: true, message: 'Seleccione la cuenta' }]}
                >
                  <Select
                    showSearch
                    optionFilterProp="label"
                    options={cuentasPagoOptions}
                    placeholder="Cuenta"
                    allowClear={false}
                  />
                </Form.Item>
              )}
              <Form.Item
                name="payment_date"
                label="Fecha de pago"
                rules={[{ required: true, message: 'Seleccione la fecha' }]}
              >
                <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
              </Form.Item>
              {(paymentMethodIdWatch === 2 || paymentMethodIdWatch === 3 || paymentMethodIdWatch === 4) && (
                <Form.Item
                  name="codigo_comprobante"
                  label="Código comprobante"
                  rules={[
                    {
                      required: true,
                      message: 'El código de comprobante es obligatorio para este método',
                    },
                  ]}
                >
                  <Input />
                </Form.Item>
              )}
              {(paymentMethodIdWatch === 3 || paymentMethodIdWatch === 4) && (
                <Form.Item name="transaction_number" label="Número de transacción (opcional)">
                  <Input />
                </Form.Item>
              )}
              <Form.Item name="descripcion" label="Observación (opcional)">
                <Input.TextArea rows={2} maxLength={500} showCount />
              </Form.Item>
            </Form>
          </Spin>
        </Modal>

        <Modal
          title={compromiso?.id ? 'Editar compromiso de pago' : 'Registrar compromiso de pago'}
          open={compromisoModalOpen}
          onCancel={handleCloseCompromisoModal}
          onOk={handleSubmitCompromiso}
          okText={compromiso?.id ? 'Actualizar' : 'Registrar'}
          confirmLoading={savingCompromiso}
          destroyOnHidden
          width={520}
        >
          <Form form={compromisoForm} layout="vertical" style={{ marginTop: 12 }}>
            <Form.Item
              name="fechaCompromiso"
              label="Fecha del compromiso"
              rules={[{ required: true, message: 'Seleccione la fecha del compromiso de pago' }]}
            >
              <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="observacion" label="Observación (opcional)">
              <Input.TextArea
                rows={3}
                maxLength={500}
                showCount
                placeholder="Detalle del acuerdo o condición del compromiso de pago"
              />
            </Form.Item>
          </Form>
        </Modal>

      </div>
    </PageTemplate>
  );
};

export default PagosDetail;
