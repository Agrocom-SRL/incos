/**
 * Ficha de inscripción de capacitación (CAP · DETALLE) — participante + curso
 * + historial de pagos + registrar pago (≈ PagosDetail de Finanzas).
 *
 * Página "dumb": compone template + organismos y consume el hook de pantalla.
 * El botón "Registrar pago" valida `capacitacion.pago CREAR` (fail-closed).
 */

import { Alert, Empty, Flex, Spin } from 'antd';
import { ArrowLeftOutlined, DollarOutlined } from '@ant-design/icons';
import { allSpacing } from '@theme/tokens';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import { ActionButton, BackButton } from '@atoms';
import { useAuthContext } from '@application-auth';
import { useInscripcionCapacitacionDetailPage } from '@application-capacitacion/inscripciones/hooks/state/useInscripcionCapacitacionDetailPage';
import { CAPACITACION_PERMISOS } from '@application-capacitacion/utils/capacitacionPermisos';
import InscripcionFichaHeader from '@capacitacion/inscripciones/components/organisms/InscripcionFichaHeader';
import InscripcionPagosSection from '@capacitacion/inscripciones/components/organisms/InscripcionPagosSection';
import RegistrarPagoCapacitacionModal from '@capacitacion/inscripciones/components/organisms/RegistrarPagoCapacitacionModal';
import '@presentation/styles/pages/detail-page.css';

const InscripcionCapacitacionDetail = () => {
  const { hasPermiso } = useAuthContext();
  const {
    inscripcion,
    loading,
    error,
    breadcrumbItems,
    handleVolver,
    pagoForm,
    pagoModalOpen,
    abrirRegistrarPago,
    cerrarRegistrarPago,
    metodoPagoId,
    reglasMetodo,
    handleMetodoPagoChange,
    handleRegistrarPago,
    registrandoPago,
    saldo,
    metodosPago,
    cuentasPago,
    loadingCatalogos,
    errorCatalogos,
  } = useInscripcionCapacitacionDetailPage();

  const puedeRegistrarPago = hasPermiso(CAPACITACION_PERMISOS.pago, 'CREAR');

  const headerActions = (
    <Flex gap="small" wrap>
      <ActionButton
        permiso={CAPACITACION_PERMISOS.pago}
        accion="CREAR"
        variant="primary"
        icon={<DollarOutlined />}
        onClick={abrirRegistrarPago}
        disabled={!inscripcion}
      >
        Registrar pago
      </ActionButton>
      <BackButton icon={<ArrowLeftOutlined />} onClick={handleVolver}>
        Volver
      </BackButton>
    </Flex>
  );

  return (
    <PageTemplate
      header={
        <PageHeader
          title="Detalle de inscripción"
          breadcrumbItems={breadcrumbItems}
          actions={headerActions}
        />
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
          {!loading && !error && !inscripcion && (
            <Empty
              description="No se encontró la inscripción solicitada."
              style={{ marginTop: allSpacing.marginXL }}
            />
          )}
          {!loading && !error && inscripcion && (
            <>
              <InscripcionFichaHeader inscripcion={inscripcion} />
              <div className="sd-tabs-shell">
                <InscripcionPagosSection inscripcion={inscripcion} />
              </div>
            </>
          )}
        </div>
      </Spin>

      {puedeRegistrarPago && (
        <RegistrarPagoCapacitacionModal
          open={pagoModalOpen}
          form={pagoForm}
          metodosPago={metodosPago}
          cuentasPago={cuentasPago}
          loadingCatalogos={loadingCatalogos}
          errorCatalogos={errorCatalogos}
          metodoPagoId={metodoPagoId}
          reglasMetodo={reglasMetodo}
          saldo={saldo}
          onMetodoPagoChange={handleMetodoPagoChange}
          guardando={registrandoPago}
          onGuardar={handleRegistrarPago}
          onCancelar={cerrarRegistrarPago}
        />
      )}
    </PageTemplate>
  );
};

export default InscripcionCapacitacionDetail;
