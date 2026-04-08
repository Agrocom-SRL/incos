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
import { Spin, Alert, Empty, Tabs, Tag, Button, Table } from 'antd';
import { DollarOutlined, UserOutlined, FileTextOutlined, DownloadOutlined, ArrowLeftOutlined, DeleteOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { downloadFile } from '@application/utils';
import { useCasesFactory } from '@container';
import { showDeleteConfirm } from '@molecules/DeleteConfirmModal';
import { useAuthContext } from '@application-auth';

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
  const { hasPermiso } = useAuthContext();

  const studentIdFromState = location.state?.studentId ?? null;
  const menuSidebarKeyFromState = location.state?.menuSidebarKey;
  const fromBeca100 = location.state?.fromBeca100 === true;
  const volverALista = !studentIdFromState;
  const puedeExportarPago = hasPermiso('finanzas.pago.ver', 'EXPORTAR')
    || hasPermiso('matricula.pago.aporte.ver', 'EXPORTAR');
  const puedeRegistrarPago = hasPermiso('finanzas.pago.registrar', 'CREAR');
  const puedeEliminarPagoPermiso = hasPermiso('finanzas.pago.editar', 'ELIMINAR')
    || hasPermiso('matricula.pago.aporte.ver', 'ELIMINAR');

  const {
    pago,
    loading = false,
    error = null,
    refetch,
  } = usePagosDetailContext();

  const { deletePagoAporte, loading: deletingPago } = useDeletePagoAporte();

  const studentIdForEstado = pago?.estudiante?.id ?? pago?.student_id ?? null;
  const gestionIdForEstado = pago?.gestion?.id ?? pago?.management_id ?? null;
  const { estadoAporte, loading: loadingEstado } = useEstadoAporteRegistro(studentIdForEstado, gestionIdForEstado);

  const [downloadingCuotaId, setDownloadingCuotaId] = useState(null);

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
        { label: 'Recibo', value: pago.receipt_number || pago.numeroRecibo || pago.id },
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
  }, [modal, pago, deletePagoAporte, message, studentIdFromState, navigate]);

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
            <Spin tip="Cargando detalle del aporte..." />
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
                    {
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
                    },
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
  }, [pago, estadoAporte, loadingEstado, handleDownloadReciboCuota, downloadingCuotaId, studentIdForRegistrar, handleRegistrarSiguienteCuota]);

  if (loading) {
    return (
      <PageTemplate header={<PageHeader title="Detalle del Pago" breadcrumbItems={breadcrumbItems} />}>
        <div className="sd-loading"><Spin size="large" /><p>Cargando datos del pago…</p></div>
      </PageTemplate>
    );
  }

  if (error) {
    return (
      <PageTemplate header={<PageHeader title="Detalle del Pago" breadcrumbItems={breadcrumbItems} />}>
        <Alert message="Error al cargar el pago" description={error} type="error" showIcon />
      </PageTemplate>
    );
  }

  if (!pago || !pago.id) {
    return (
      <PageTemplate header={<PageHeader title="Detalle del Pago" breadcrumbItems={breadcrumbItems} />}>
        <Empty description="No se encontró información del pago" />
      </PageTemplate>
    );
  }

  const puedeEliminarPago = !pago.inscripcion;
  const numeroRecibo = pago.receipt_number || pago.numeroRecibo || pago.id;
  const estadoPago = pago.estado ?? pago.state;
  const montoObligatorio = pago.monto_obligatorio ?? pago.mandatoryAmount ?? pago.montoObligatorio ?? 0;
  const profileSubtitle = [
    pago.estudiante?.nombreCompleto || pago.estudiante?.codigoEstudiante,
    pago.gestion?.nombre || pago.gestion?.codigo,
  ].filter(Boolean).join(' · ') || 'Pago de aporte';
  const headerActions = (
    <button type="button" className="sd-btn sd-btn--outline" onClick={handleBack}>
      <ArrowLeftOutlined /> Volver
    </button>
  );

  return (
    <PageTemplate header={<PageHeader title="Detalle del Pago" breadcrumbItems={breadcrumbItems} actions={headerActions} />}>
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
              <h1 className="sd-profile__name">Pago #{numeroRecibo}</h1>
              <div className="sd-profile__meta">
                <p className="sd-profile__sub">{profileSubtitle}</p>
              </div>
            </div>
          </div>

          <div className="sd-profile__divider" />

          <div className="sd-profile__stats">
            <div className="sd-stat">
              <span className="sd-stat__label">Recibo</span>
              <span className="sd-stat__value sd-stat__value--primary">{numeroRecibo}</span>
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
          <Tabs defaultActiveKey="resumen" items={tabItems} className="sd-tabs" />
        </div>

      </div>
    </PageTemplate>
  );
};

export default PagosDetail;
