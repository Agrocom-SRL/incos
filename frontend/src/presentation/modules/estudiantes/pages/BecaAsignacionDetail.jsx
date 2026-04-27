/**
 * Detalle de una asignación de beca (fila del listado global).
 * UI alineada con EstudiantesDetail: perfil compacto + pestañas (sd-tabs) + cards (sd-*).
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { App } from 'antd';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import { Spin, Alert, Empty, Tag, Tooltip, Tabs } from 'antd';
import {
  ArrowLeftOutlined,
  EditOutlined,
  UserOutlined,
  PercentageOutlined,
  DollarOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { useCasesFactory } from '@container';
import { useAuthContext } from '@application-auth';
import { useDeleteBecaAsignada } from '@application-estudiantes/hooks';
import { useEstadoAporteRegistro } from '@application-pagos/hooks';
import { showDeleteConfirm } from '@molecules/DeleteConfirmModal';

const DURACION_MENSAJE_ERROR = 8;

const Field = ({ label, children, span = 1 }) => (
  <div className={`sd-field sd-field--span-${span}`}>
    <span className="sd-field__label">{label}</span>
    <span className="sd-field__value">{children ?? '—'}</span>
  </div>
);

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

const initialsFromName = (name) => {
  if (!name || typeof name !== 'string') return 'B';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'B';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] || ''}${parts[1][0] || ''}`.toUpperCase() || 'B';
};

const estadoTag = (estado) => {
  let color = 'default';
  const text = estado || 'N/A';
  if (estado === 'ACTIVA' || estado === 'CANCELADO') color = 'success';
  else if (estado === 'PENDIENTE') color = 'warning';
  else if (estado === 'PARCIAL') color = 'processing';
  else if (estado === 'RECHAZADA' || estado === 'ANULADA') color = 'error';
  return <Tag color={color}>{text}</Tag>;
};

const BecaAsignacionDetail = () => {
  const { id: routeId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { message, modal } = App.useApp();
  const { hasPermiso } = useAuthContext();
  const { deleteBecaAsignada, loading: deletingBeca } = useDeleteBecaAsignada();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const asignacionId = routeId != null ? Number(routeId) : NaN;
  const returnListPath = location.state?.returnListPath || '/estudiantes/becas/listar';

  const puedeEditarAsignacion =
    hasPermiso('matricula.beca.asignar', 'EDITAR') || hasPermiso('matricula.beca.asignar', 'CREAR');
  const puedeEliminar = hasPermiso('matricula.beca.asignar', 'ELIMINAR');
  const puedeVerEstudiante = hasPermiso('matricula.admision.ver', 'DETALLE');
  const puedeVerPago =
    hasPermiso('finanzas.pago.ver', 'DETALLE') || hasPermiso('matricula.pago.aporte.ver', 'DETALLE');
  const { estadoAporte, loading: loadingEstadoAporte } = useEstadoAporteRegistro(
    data?.studentId || null,
    data?.management?.id || null
  );

  const load = useCallback(async () => {
    if (!asignacionId || Number.isNaN(asignacionId)) {
      setError('Identificador de asignación no válido');
      setLoading(false);
      setData(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const uc = useCasesFactory.obtenerBecaAsignadaPorId();
      const result = await uc.ejecutar(asignacionId);
      if (!result.success) {
        const msg =
          typeof result.error === 'object' && result.error?.message
            ? result.error.message
            : result.error || 'No se pudo cargar la asignación';
        setError(msg);
        setData(null);
      } else {
        setData(result.data || null);
        setError(null);
      }
    } catch (e) {
      setError(e?.message || 'Error al cargar la asignación');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [asignacionId]);

  useEffect(() => {
    load();
  }, [load]);

  const breadcrumbItems = useMemo(
    () => [
      { title: 'Inicio', href: '/' },
      { title: 'Becas', href: '/estudiantes/becas/listar' },
      { title: 'Detalle asignación' },
    ],
    []
  );

  const handleVolver = () => {
    navigate(returnListPath);
  };

  const handleEditar = () => {
    if (!data?.studentId || !data?.id) return;
    navigate('/estudiantes/becas/asignar', {
      state: {
        studentId: Number(data.studentId),
        studentName: data.student?.nombreCompleto || null,
        returnListPath,
        editBecaAsignada: {
          id: Number(data.id),
          scholarshipId: data.scholarship?.id ? Number(data.scholarship.id) : null,
          observations: data.observations || '',
        },
      },
    });
  };

  const handleEliminar = useCallback(async () => {
    if (!data?.id) return;
    await showDeleteConfirm({
      modal,
      itemName: 'la asignación de beca',
      itemDetails: [
        { label: 'Tipo', value: data.scholarship?.nombre || '—' },
        { label: 'Estudiante', value: data.student?.nombreCompleto || '—' },
        { label: 'Estado', value: data.state ?? '—' },
      ],
      onConfirm: async () => {
        const result = await deleteBecaAsignada(data.id);
        if (result?.success) {
          message.success('Asignación de beca eliminada correctamente');
          navigate(returnListPath);
        } else {
          message.error(
            result?.error || 'No se pudo eliminar. Si está vinculada a un pago, elimine primero el pago.',
            DURACION_MENSAJE_ERROR
          );
        }
      },
    });
  }, [modal, deleteBecaAsignada, message, navigate, returnListPath, data]);

  const tabItems = useMemo(() => {
    if (!data?.id) return [];

    return [
      {
        key: 'informacion',
        label: (
          <span className="sd-tab-label">
            <PercentageOutlined /> Información
          </span>
        ),
        children: (
          <div className="sd-tab-body">
            <InfoCard title="Tipo de beca y estado" icon={<PercentageOutlined />} cols={2}>
              <Field label="Código">{data.scholarship?.codigo}</Field>
              <Field label="Estado asignación">{estadoTag(data.state)}</Field>
              <Field label="Descripción" span={2}>
                {data.scholarship?.descripcion || '—'}
              </Field>
              <Field label="Observaciones" span={2}>
                {data.observations || '—'}
              </Field>
            </InfoCard>
          </div>
        ),
      },
      {
        key: 'estudiante',
        label: (
          <span className="sd-tab-label">
            <UserOutlined /> Estudiante
          </span>
        ),
        children: (
          <div className="sd-tab-body">
            <InfoCard
              title="Datos del beneficiario"
              icon={<UserOutlined />}
              cols={2}
              extra={
                puedeVerEstudiante && data.studentId ? (
                  <button
                    type="button"
                    className="sd-btn sd-btn--primary"
                    onClick={() => navigate(`/estudiantes/${data.studentId}`)}
                  >
                    <EyeOutlined /> Ver ficha del estudiante
                  </button>
                ) : null
              }
            >
              <Field label="Nombre completo">{data.student?.nombreCompleto}</Field>
              <Field label="Código">{data.student?.codigoEstudiante}</Field>
              <Field label="CI">
                {data.student?.ci}
                {data.student?.expedicion ? ` (${data.student.expedicion})` : ''}
              </Field>
            </InfoCard>
          </div>
        ),
      },
      {
        key: 'pago',
        label: (
          <span className="sd-tab-label">
            <DollarOutlined /> Pago de aporte
          </span>
        ),
        children: (
          <div className="sd-tab-body">
            <InfoCard
              title="Cuotas del aporte relacionadas"
              icon={<DollarOutlined />}
              cols={2}
              headVariant="resumen"
              extra={
                data.payment?.id && puedeVerPago ? (
                  <button
                    type="button"
                    className="sd-btn sd-btn--primary"
                    onClick={() => navigate(`/pagos/${data.payment.id}`)}
                  >
                    <EyeOutlined /> Ver pago
                  </button>
                ) : null
              }
            >
              {loadingEstadoAporte ? (
                <Spin tip="Cargando cuotas…" spinning>
                  <div className="sd-spin-body" style={{ minHeight: 100 }} aria-hidden />
                </Spin>
              ) : estadoAporte?.cabecera?.id && Array.isArray(estadoAporte?.cuotas) && estadoAporte.cuotas.length > 0 ? (
                <>
                  <Field label="Descuento aplicado">
                    {Number(estadoAporte?.cabecera?.descuento_beca ?? 0) > 0
                      ? `Sí (Bs. ${Number(estadoAporte?.cabecera?.descuento_beca ?? 0).toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})`
                      : 'No'}
                  </Field>
                  <Field label="Estado del aporte">{estadoTag(estadoAporte?.cabecera?.estado)}</Field>
                  <div className="sd-field sd-field--span-2">
                    <span className="sd-field__label">Cuotas registradas</span>
                    <div className="sd-field__value">
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr>
                            <th style={{ textAlign: 'left', padding: '6px 0' }}>Recibo</th>
                            <th style={{ textAlign: 'left', padding: '6px 0' }}>Fecha</th>
                            <th style={{ textAlign: 'right', padding: '6px 0' }}>Monto</th>
                          </tr>
                        </thead>
                        <tbody>
                          {estadoAporte.cuotas.map((cuota) => (
                            <tr key={cuota.id ?? cuota.numero_recibo}>
                              <td style={{ padding: '6px 0' }}>{cuota.numero_recibo || '—'}</td>
                              <td style={{ padding: '6px 0' }}>
                                {cuota.fecha_pago
                                  ? new Date(cuota.fecha_pago).toLocaleDateString('es-BO', {
                                      day: '2-digit',
                                      month: '2-digit',
                                      year: 'numeric',
                                    })
                                  : '—'}
                              </td>
                              <td style={{ padding: '6px 0', textAlign: 'right' }}>
                                Bs. {Number(cuota.monto ?? 0).toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              ) : data.payment?.id ? (
                <>
                  <Field label="Descuento aplicado">
                    {Number(data?.payment?.scholarshipDiscount ?? 0) > 0 ? 'Sí' : 'No'}
                  </Field>
                  <Field label="Estado del aporte">{estadoTag(data.payment.state)}</Field>
                </>
              ) : (
                <div className="sd-empty">
                  <DollarOutlined className="sd-empty__icon" />
                  <p className="sd-empty__text">
                    Esta asignación aún no tiene cuotas registradas en pago de aporte.
                  </p>
                </div>
              )}
            </InfoCard>
          </div>
        ),
      },
    ];
  }, [data, navigate, puedeVerEstudiante, puedeVerPago, estadoAporte, loadingEstadoAporte]);

  const tituloPrincipal = data?.scholarship?.nombre || 'Asignación de beca';
  const subtitulo = data?.student?.nombreCompleto || null;
  const avatarText = initialsFromName(tituloPrincipal);

  if (loading) {
    return (
      <PageTemplate header={<PageHeader title="Asignación de beca" breadcrumbItems={breadcrumbItems} />}>
        <div className="sd-loading">
          <Spin size="large" />
          <p>Cargando asignación…</p>
        </div>
      </PageTemplate>
    );
  }

  if (error) {
    return (
      <PageTemplate header={<PageHeader title="Asignación de beca" breadcrumbItems={breadcrumbItems} />}>
        <Alert message="No se pudo cargar el detalle" description={error} type="error" showIcon />
      </PageTemplate>
    );
  }

  if (!data?.id) {
    return (
      <PageTemplate header={<PageHeader title="Asignación de beca" breadcrumbItems={breadcrumbItems} />}>
        <Empty description="Asignación no encontrada" />
      </PageTemplate>
    );
  }

  const requestFmt = data.requestDate
    ? new Date(data.requestDate).toLocaleDateString('es-BO', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : '—';

  const headerActions = (
    <button type="button" className="sd-btn sd-btn--outline" onClick={handleVolver}>
      <ArrowLeftOutlined /> Volver
    </button>
  );

  return (
    <PageTemplate
      header={<PageHeader title="Asignación de beca" breadcrumbItems={breadcrumbItems} actions={headerActions} />}
    >
      <div className="sd">
        <div className="sd-profile">
          {puedeEditarAsignacion ? (
            <Tooltip title="Editar asignación (reemplazar tipo de beca)">
              <button
                type="button"
                className="sd-profile__edit-btn"
                onClick={handleEditar}
                aria-label="Editar asignación de beca"
              >
                <EditOutlined />
              </button>
            </Tooltip>
          ) : null}

          <div className="sd-profile__identity">
            <div className="sd-profile__avatar-wrap">
              <div className="sd-profile__avatar sd-profile__avatar--default">{avatarText}</div>
              <span className="sd-profile__status-dot" />
            </div>
            <div className="sd-profile__name-block">
              <h1 className="sd-profile__name">{tituloPrincipal}</h1>
              <div className="sd-profile__meta">
                {subtitulo ? (
                  <p className="sd-profile__sub">
                    <UserOutlined /> {subtitulo}
                  </p>
                ) : null}
                {data.state ? (
                  <span className="sd-profile__admission-pill sd-profile__admission-pill--default">
                    {String(data.state)}
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          <div className="sd-profile__divider" />

          <div className="sd-profile__stats">
            <div className="sd-stat">
              <span className="sd-stat__label">Descuento</span>
              <span className="sd-stat__value sd-stat__value--primary">
                {data.scholarship?.porcentaje != null ? `${data.scholarship.porcentaje}%` : '—'}
              </span>
            </div>
            <div className="sd-stat">
              <span className="sd-stat__label">Gestión</span>
              <span className="sd-stat__value">
                {data.management?.codigo || data.management?.nombre || data.management?.anio || '—'}
              </span>
            </div>
            <div className="sd-stat">
              <span className="sd-stat__label">Solicitud</span>
              <span className="sd-stat__value">{requestFmt}</span>
            </div>
          </div>

          <div className="sd-profile__divider" />

          <div className="sd-profile__actions">
            {puedeEliminar ? (
              <button
                type="button"
                className="sd-btn sd-btn--danger"
                onClick={handleEliminar}
                disabled={deletingBeca}
              >
                Eliminar asignación
              </button>
            ) : null}
          </div>
        </div>

        <div className="sd-tabs-shell">
          <Tabs defaultActiveKey="informacion" items={tabItems} className="sd-tabs" />
        </div>
      </div>
    </PageTemplate>
  );
};

export default BecaAsignacionDetail;
