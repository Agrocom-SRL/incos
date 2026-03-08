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
import { DollarOutlined, UserOutlined, FileTextOutlined, DownloadOutlined, ArrowLeftOutlined, DeleteOutlined } from '@ant-design/icons';
import { downloadFile } from '@application/utils';
import { useCasesFactory } from '@container';
import { showDeleteConfirm } from '@molecules/DeleteConfirmModal';

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
───────────────────────────────────────── */
const InfoCard = ({ title, icon, extra, children, cols = 2 }) => (
  <div className="sd-card">
    <div className="sd-card__head">
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

  const studentIdFromState = location.state?.studentId ?? null;
  const volverALista = !studentIdFromState;

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
        <InfoCard title="Datos del aporte" icon={<DollarOutlined />} cols={3}>
          <Field label="Monto base">Bs. {formatMonto(pago.monto_base ?? pago.baseAmount ?? pago.montoBase ?? 0)}</Field>
          <Field label="Descuento beca">
            {pago.descuento_beca ?? pago.scholarship_discount ?? pago.descuentoBeca
              ? `Bs. ${formatMonto(pago.descuento_beca ?? pago.scholarship_discount ?? pago.descuentoBeca)}`
              : 'Sin descuento'}
          </Field>
          <Field label="Monto obligatorio">Bs. {formatMonto(montoObligatorioVal)}</Field>
          <Field label="Estado" span={3}>
            {estadoPagoVal ? (
              <Tag color={estadoPagoVal === 'CANCELADO' ? 'success' : estadoPagoVal === 'PARCIAL' ? 'processing' : 'default'}>
                {estadoPagoVal}
              </Tag>
            ) : '—'}
          </Field>
        </InfoCard>
      </div>
    );
    const cuotasChildren = (
      <div className="sd-tab-body">
        {loadingEstado ? (
          <div className="sd-loading" style={{ padding: '40px' }}>
            <Spin tip="Cargando detalle del aporte..." />
          </div>
        ) : estadoAporte ? (
          <>
            <InfoCard title="Resumen del aporte" icon={<DollarOutlined />} cols={2}>
              <Field label="Concepto">
                {estadoAporte.gestion
                  ? `Aporte Académico - Gestión ${estadoAporte.gestion.nombre || ''} ${estadoAporte.gestion.anio || ''}`.trim()
                  : 'Aporte Académico'}
              </Field>
              <Field label="Monto base / obligatorio">
                Bs. {Number(estadoAporte.monto_base ?? estadoAporte.monto_obligatorio ?? 0).toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Field>
              <Field label="Total pagado">
                Bs. {Number(estadoAporte.total_pagado ?? 0).toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Field>
              <Field label="Saldo pendiente">
                Bs. {Number(estadoAporte.saldo_pendiente ?? 0).toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Field>
            </InfoCard>
            {estadoAporte.cuotas && estadoAporte.cuotas.length > 0 && (
              <InfoCard title={`Cuotas registradas (${estadoAporte.cuotas.length})`} icon={<DownloadOutlined />} cols={1}>
                <Table
                  dataSource={estadoAporte.cuotas}
                  rowKey={(r) => r.id ?? r.numero_recibo}
                  pagination={false}
                  size="small"
                  columns={[
                    { title: 'Recibo', dataIndex: 'numero_recibo', key: 'numero_recibo', width: 100, render: (v) => v || '—' },
                    { title: 'Fecha', dataIndex: 'fecha_pago', key: 'fecha_pago', width: 100, render: (v) => formatFecha(v) },
                    {
                      title: 'Monto',
                      dataIndex: 'monto',
                      key: 'monto',
                      width: 110,
                      render: (v) => `Bs. ${Number(v ?? 0).toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                    },
                    {
                      title: 'Método de pago',
                      key: 'metodo_pago',
                      width: 140,
                      render: (_, record) => {
                        const mp = record.metodo_pago;
                        if (!mp) return '—';
                        return mp.nombre || mp.codigo || '—';
                      },
                    },
                    {
                      title: 'Cuenta / info',
                      key: 'cuenta_pago',
                      render: (_, record) => {
                        const cp = record.cuenta_pago;
                        if (!cp) return '—';
                        const parts = [cp.nombre_titular].filter(Boolean);
                        if (cp.numero_cuenta) parts.push(`Cuenta: ${cp.numero_cuenta}`);
                        if (cp.numero_celular) parts.push(`Cel: ${cp.numero_celular}`);
                        return parts.length ? parts.join(' · ') : '—';
                      },
                    },
                    {
                      title: 'Observación',
                      dataIndex: 'observacion',
                      key: 'observacion',
                      ellipsis: true,
                      render: (v) => (v && String(v).trim() ? String(v).trim() : '—'),
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
            )}
          </>
        ) : (
          <div className="sd-empty">
            <DollarOutlined className="sd-empty__icon" />
            <p className="sd-empty__text">No hay estado de aporte disponible para esta gestión.</p>
          </div>
        )}
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
  }, [pago, estadoAporte, loadingEstado, handleDownloadReciboCuota, downloadingCuotaId]);

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
            {puedeEliminarPago && (
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
