/**
 * Ficha de pago de aporte (Finanzas) — detalle con resumen del estudiante, montos,
 * estado y cuotas registradas (con recibo PDF y eliminación de cuota).
 *
 * Página "dumb": solo compone template + organismos y consume el hook de pantalla.
 * No hace fetch ni orquesta (eso vive en provider + hooks/state). Espejo de la ficha
 * de Docentes (`DocentesDetail`): shell de detalle `sd-*` + cabecera + secciones.
 */

import { Alert, Spin } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import { useAuthContext } from '@application-auth';
import { usePagosDetailPage } from '@application-finanzas/hooks/state/usePagosDetailPage';
import PagoFichaHeader from '@finanzas/pagos/components/organisms/PagoFichaHeader';
import PagoCuotasSection from '@finanzas/pagos/components/organisms/PagoCuotasSection';

const buildGestionLabel = (gestion) => {
  if (!gestion) return null;
  return gestion.nombre || (gestion.anio != null ? `Gestión ${gestion.anio}` : null);
};

const PagosDetail = () => {
  const { hasPermiso } = useAuthContext();
  const {
    pago,
    loading,
    error,
    breadcrumbItems,
    reciboCuotaId,
    descargandoRecibo,
    handleVolver,
    handleGenerarRecibo,
    handleEliminarCuota,
  } = usePagosDetailPage();

  const puedeExportarRecibo = hasPermiso('finanzas.pago.ver', 'EXPORTAR');
  const puedeEliminarCuota = hasPermiso('finanzas.pago.editar', 'ELIMINAR');

  const headerActions = (
    <button type="button" className="sd-btn sd-btn--outline" onClick={handleVolver}>
      <ArrowLeftOutlined /> Volver
    </button>
  );

  const profile = pago?.profile ?? {};
  const gestionLabel = buildGestionLabel(pago?.gestion);

  return (
    <PageTemplate
      header={
        <PageHeader title="Detalle de pago" breadcrumbItems={breadcrumbItems} actions={headerActions} />
      }
      sidebar={null}
    >
      <Spin spinning={loading} size="large" tip="Cargando ficha…">
        <div className="sd sd-spin-body">
          {!loading && error && (
            <Alert
              type="error"
              title="No se pudo cargar la ficha"
              description={error}
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}
          {!loading && !error && pago && (
            <>
              <PagoFichaHeader
                nombreCompleto={profile.nombreCompleto}
                codigoEstudiante={profile.codigoEstudiante}
                gestionLabel={gestionLabel}
                montoObligatorio={pago.montoObligatorio}
                totalPagado={pago.totalPagado}
                saldoPendiente={pago.saldoPendiente}
                estado={pago.estado}
              />
              <div className="sd-tabs-shell">
                <PagoCuotasSection
                  montoBase={pago.montoBase}
                  descuentoBeca={pago.descuentoBeca}
                  montoObligatorio={pago.montoObligatorio}
                  totalPagado={pago.totalPagado}
                  saldoPendiente={pago.saldoPendiente}
                  cuotas={pago.cuotas}
                  puedeExportarRecibo={puedeExportarRecibo}
                  puedeEliminarCuota={puedeEliminarCuota}
                  onGenerarRecibo={handleGenerarRecibo}
                  onEliminarCuota={handleEliminarCuota}
                  reciboCuotaId={reciboCuotaId}
                  descargandoRecibo={descargandoRecibo}
                />
              </div>
            </>
          )}
        </div>
      </Spin>
    </PageTemplate>
  );
};

export default PagosDetail;
