/**
 * Ficha de inscripción de capacitación (CAP · DETALLE) — participante + curso
 * + historial de pagos + acceso a "Registrar pago" (≈ PagosDetail de Finanzas).
 *
 * Página "dumb": compone template + organismos y consume el hook de pantalla.
 * El botón "Registrar pago" navega a su propia página y valida
 * `capacitacion.pago CREAR` (fail-closed). No se muestra si el curso no tiene
 * costo asociado (gratuito): no hay nada que cobrar.
 */

import { Alert, Empty, Flex, Spin } from 'antd';
import { ArrowLeftOutlined, DollarOutlined } from '@ant-design/icons';
import { allSpacing } from '@theme/tokens';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import { ActionButton, BackButton } from '@atoms';
import { useInscripcionCapacitacionDetailPage } from '@application-capacitacion/inscripciones/hooks/state/useInscripcionCapacitacionDetailPage';
import { CAPACITACION_PERMISOS } from '@application-capacitacion/utils/capacitacionPermisos';
import { esCursoGratuito } from '@application-capacitacion/utils/capacitacionPills';
import InscripcionFichaHeader from '@capacitacion/inscripciones/components/organisms/InscripcionFichaHeader';
import InscripcionPagosSection from '@capacitacion/inscripciones/components/organisms/InscripcionPagosSection';
import '@presentation/styles/pages/detail-page.css';

const InscripcionCapacitacionDetail = () => {
  const { inscripcion, loading, error, breadcrumbItems, handleVolver, handleIrARegistrarPago } =
    useInscripcionCapacitacionDetailPage();

  const headerActions = (
    <Flex gap="small" wrap>
      {!esCursoGratuito(inscripcion?.costo) ? (
        <ActionButton
          permiso={CAPACITACION_PERMISOS.pago}
          accion="CREAR"
          variant="primary"
          icon={<DollarOutlined />}
          onClick={handleIrARegistrarPago}
          disabled={!inscripcion}
        >
          Registrar pago
        </ActionButton>
      ) : null}
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
    </PageTemplate>
  );
};

export default InscripcionCapacitacionDetail;
