/**
 * Ficha de una licencia estudiantil (ACA-ASI-LIC-DET · DETALLE).
 *
 * Replica el patrón visual de DocentesDetail: PageTemplate → PageHeader (Volver) →
 * Spin/Alert → cabecera .sd-profile + .sd-tabs-shell con secciones DetailInfoCard/DetailField.
 *
 * La decisión (aprobar/rechazar) vive aquí como acciones de la cabecera: botones gated por
 * permiso licencia.aprobar · APROBAR y visibles solo si la licencia está PENDIENTE; abren un
 * Modal de confirmación (LicenciaDecisionModal) con motivo de rechazo obligatorio al rechazar.
 */

import { useMemo } from 'react';
import { Spin, Alert, Tabs, Tag } from 'antd';
import {
  ArrowLeftOutlined,
  CalendarOutlined,
  CheckOutlined,
  CloseOutlined,
  FileTextOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import { DetailInfoCard } from '@molecules';
import { DetailField, Button } from '@atoms';
import { useAuthContext } from '@application-auth';
import { useLicenciaDetalleContext } from '@application-academico/asistencia/hooks/context/useLicenciaDetalleContext.js';
import { ASISTENCIA_PERMISOS } from '@application-academico/asistencia/utils/asistenciaPermisos.js';
import {
  formatEstadoLicencia,
  tagColorEstadoLicencia,
} from '@application-academico/asistencia/utils/licenciasEstados.js';
import { formatMotivoLicencia } from '@application-academico/asistencia/utils/licenciasMotivos.js';
import {
  etiquetaRangoFechas,
  etiquetaDiaMesAnio,
} from '@application-academico/asistencia/utils/asistenciaFechas.js';
import LicenciaDecisionModal from '@academico/asistencia/components/LicenciaDecisionModal.jsx';
import '@presentation/styles/pages/detail-page.css';

const inicialesDe = (nombre) => {
  const parts = String(nombre || '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? '').join('') || 'E';
};

const LicenciaDetailPage = () => {
  const { hasPermiso } = useAuthContext();
  const {
    licencia,
    loading,
    error,
    esPendiente,
    breadcrumbItems,
    handleVolver,
    decisionContext,
    abrirDecision,
    cerrarDecision,
    confirmarDecision,
    decidiendo,
  } = useLicenciaDetalleContext();

  const puedeDecidir = hasPermiso(ASISTENCIA_PERMISOS.licenciaAprobar, 'APROBAR');
  const estudianteNombre = licencia?.estudianteNombre || 'Licencia';
  const tieneDecision = Boolean(licencia?.motivoRechazo || licencia?.observacionesDecision);

  const headerActions = (
    <button type="button" className="sd-btn sd-btn--outline" onClick={handleVolver}>
      <ArrowLeftOutlined /> Volver
    </button>
  );

  const tabItems = useMemo(() => {
    if (!licencia) return [];
    return [
      {
        key: 'resumen',
        label: (
          <span className="sd-tab-label">
            <CalendarOutlined /> Solicitud
          </span>
        ),
        children: (
          <div className="sd-tab-body">
            <DetailInfoCard title="Periodo solicitado" icon={<CalendarOutlined />} cols={3}>
              <DetailField label="Rango de fechas" span={2}>
                {etiquetaRangoFechas(licencia.fechaInicio, licencia.fechaFin)}
              </DetailField>
              <DetailField label="Total de días">{licencia.totalDias ?? '—'}</DetailField>
              <DetailField label="Fecha de solicitud">
                {etiquetaDiaMesAnio(licencia.fechaSolicitud)}
              </DetailField>
              <DetailField label="Motivo">{formatMotivoLicencia(licencia.motivo)}</DetailField>
              <DetailField label="Estado">
                <Tag color={tagColorEstadoLicencia(licencia.estado)}>
                  {formatEstadoLicencia(licencia.estado)}
                </Tag>
              </DetailField>
              <DetailField label="Detalle del motivo" span={3}>
                {licencia.detalleMotivo}
              </DetailField>
            </DetailInfoCard>
          </div>
        ),
      },
      {
        key: 'decision',
        label: (
          <span className="sd-tab-label">
            <FileTextOutlined /> Decisión
          </span>
        ),
        children: (
          <div className="sd-tab-body">
            <DetailInfoCard title="Decisión" icon={<FileTextOutlined />} cols={1} headVariant="labor">
              {tieneDecision ? (
                <>
                  <DetailField label="Motivo del rechazo">{licencia.motivoRechazo}</DetailField>
                  <DetailField label="Observaciones">{licencia.observacionesDecision}</DetailField>
                </>
              ) : (
                <DetailField label="Estado de la decisión">
                  {esPendiente
                    ? 'La solicitud está pendiente de aprobación.'
                    : 'Sin observaciones registradas.'}
                </DetailField>
              )}
            </DetailInfoCard>
          </div>
        ),
      },
    ];
  }, [licencia, esPendiente, tieneDecision]);

  return (
    <PageTemplate
      header={
        <PageHeader
          title="Detalle de la licencia"
          breadcrumbItems={breadcrumbItems}
          actions={headerActions}
        />
      }
      sidebar={null}
    >
      <Spin spinning={loading} size="large" tip="Cargando licencia…">
        <div className="sd sd-spin-body">
          {!loading && error && (
            <Alert
              type="error"
              title="No se pudo cargar la licencia"
              description={error}
              showIcon
            />
          )}
          {!loading && !error && licencia && (
            <>
              <section className="sd-profile">
                <div className="sd-profile__identity">
                  <div className="sd-profile__avatar-wrap">
                    <div className="sd-profile__avatar">{inicialesDe(estudianteNombre)}</div>
                    <span
                      className={`sd-profile__status-dot${
                        esPendiente ? '' : ' sd-profile__status-dot--inactive'
                      }`}
                    />
                  </div>
                  <div className="sd-profile__name-block">
                    <h2 className="sd-profile__name">{estudianteNombre}</h2>
                    <span className="sd-profile__sub">
                      <UserOutlined />
                      {etiquetaRangoFechas(licencia.fechaInicio, licencia.fechaFin)}
                    </span>
                    <div className="sd-profile__meta">
                      <Tag color={tagColorEstadoLicencia(licencia.estado)}>
                        {formatEstadoLicencia(licencia.estado)}
                      </Tag>
                    </div>
                  </div>
                </div>

                <div className="sd-profile__divider" />

                <div className="sd-profile__stats">
                  <div className="sd-stat">
                    <span className="sd-stat__label">Total de días</span>
                    <span className="sd-stat__value sd-stat__value--primary">
                      {licencia.totalDias ?? '—'}
                    </span>
                  </div>
                  <div className="sd-stat">
                    <span className="sd-stat__label">Motivo</span>
                    <span className="sd-stat__value">{formatMotivoLicencia(licencia.motivo)}</span>
                  </div>
                  <div className="sd-stat">
                    <span className="sd-stat__label">Solicitada</span>
                    <span className="sd-stat__value">
                      {etiquetaDiaMesAnio(licencia.fechaSolicitud)}
                    </span>
                  </div>
                </div>

                {esPendiente && puedeDecidir ? (
                  <div className="sd-profile__actions">
                    <Button
                      variant="success"
                      icon={<CheckOutlined />}
                      onClick={() => abrirDecision('APROBAR')}
                    >
                      Aprobar
                    </Button>
                    <Button
                      variant="error"
                      icon={<CloseOutlined />}
                      onClick={() => abrirDecision('RECHAZAR')}
                    >
                      Rechazar
                    </Button>
                  </div>
                ) : null}
              </section>

              <div className="sd-tabs-shell">
                <Tabs defaultActiveKey="resumen" items={tabItems} className="sd-tabs" />
              </div>
            </>
          )}
        </div>
      </Spin>

      <LicenciaDecisionModal
        open={Boolean(decisionContext)}
        licencia={licencia}
        decision={decisionContext?.decision ?? 'APROBAR'}
        guardando={decidiendo}
        onCerrar={cerrarDecision}
        onConfirmar={confirmarDecision}
      />
    </PageTemplate>
  );
};

export default LicenciaDetailPage;
