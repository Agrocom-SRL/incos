/**
 * Ficha de pago de aporte (Finanzas) — detalle con resumen del estudiante, montos,
 * estado y cuotas registradas (con recibo PDF y eliminación de cuota).
 *
 * Página "dumb": solo compone template + organismos y consume el hook de pantalla.
 * No hace fetch ni orquesta (eso vive en provider + hooks/state). Espejo de la ficha
 * de Docentes (`DocentesDetail`): shell de detalle `sd-*` + cabecera + secciones.
 */

import { Alert, Empty, Spin } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { allSpacing } from '@theme/tokens';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import { useAuthContext } from '@application-auth';
import { usePagosDetailPage } from '@application-finanzas/hooks/state/usePagosDetailPage';
import PagoFichaHeader from '@finanzas/pagos/components/organisms/PagoFichaHeader';
import PagoCuotasSection from '@finanzas/pagos/components/organisms/PagoCuotasSection';
import EditarCuotaModal from '@finanzas/pagos/components/organisms/EditarCuotaModal';

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
    cuotaEnEdicion,
    abrirEditarCuota,
    cerrarEditarCuota,
    guardarEditarCuota,
    actualizandoCuota,
    metodosPago,
    cuentasPago,
    loadingCatalogos,
  } = usePagosDetailPage();

  const puedeExportarRecibo = hasPermiso('finanzas.pago.ver', 'EXPORTAR');
  const puedeEditarCuota = hasPermiso('finanzas.pago.editar', 'EDITAR');
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
              style={{ marginBottom: allSpacing.margin }}
            />
          )}
          {!loading && !error && !pago && (
            <Empty description="No se encontró el pago solicitado." style={{ marginTop: allSpacing.marginXL }} />
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
                  puedeEditarCuota={puedeEditarCuota}
                  puedeEliminarCuota={puedeEliminarCuota}
                  onGenerarRecibo={handleGenerarRecibo}
                  onEditarCuota={abrirEditarCuota}
                  onEliminarCuota={handleEliminarCuota}
                  reciboCuotaId={reciboCuotaId}
                  descargandoRecibo={descargandoRecibo}
                />
              </div>
            </>
          )}
        </div>
      </Spin>

      {puedeEditarCuota && (
        <EditarCuotaModal
          open={Boolean(cuotaEnEdicion)}
          cuota={cuotaEnEdicion}
          metodosPago={metodosPago}
          cuentasPago={cuentasPago}
          loadingCatalogos={loadingCatalogos}
          guardando={actualizandoCuota}
          onGuardar={guardarEditarCuota}
          onCancelar={cerrarEditarCuota}
        />
      )}
    </PageTemplate>
  );
};

export default PagosDetail;
