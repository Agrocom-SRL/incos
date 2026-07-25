/**
 * Ficha de sesión de reforzamiento (TUT · TUT-SESIONES-DETALLE · sesion·DETALLE)
 * — cabecera `sd-profile` + sección de asistencia/progreso en lote (A9) y
 * transiciones REALIZADA/CANCELADA (A7) con confirmación.
 *
 * Página "dumb": compone template + organismos y consume el hook de pantalla
 * (`useSesionReforzamientoDetailPage`); espejo de `CursoCapacitacionDetail`.
 */

import { Alert, Empty, Flex, Spin } from 'antd';
import { ArrowLeftOutlined, CheckCircleOutlined, StopOutlined } from '@ant-design/icons';
import { MainContent, PageHeaderArea } from '@templates';
import { PageHeader } from '@molecules';
import { ActionButton, BackButton } from '@atoms';
import DashboardPageShell from '@presentation/modules/dashboard/components/organisms/DashboardPageShell';
import { usePermiso } from '@application-auth';
import { useSesionReforzamientoDetailPage } from '@application-tutorias/acompanamiento/sesiones/hooks/state/useSesionReforzamientoDetailPage';
import { TUTORIAS_PERMISOS } from '@application-tutorias/utils/tutoriasPermisos';
import SesionFichaHeader from '@tutorias/acompanamiento/sesiones/components/organisms/SesionFichaHeader';
import SesionParticipantesSection from '@tutorias/acompanamiento/sesiones/components/organisms/SesionParticipantesSection';
import { allSpacing } from '@theme/tokens';
import '@presentation/styles/pages/detail-page.css';
import '@configuracion/academico/styles/academico-form-page.css';

const SesionReforzamientoDetail = () => {
  const {
    sesion,
    loading,
    error,
    breadcrumbItems,
    handleVolver,
    handleEditar,
    participantes,
    setParticipanteCampo,
    dirty,
    saving,
    handleGuardarAsistencia,
    puedeMarcarRealizada,
    puedeCancelar,
    procesandoEstado,
    cambiarEstadoSesion,
  } = useSesionReforzamientoDetailPage();

  const puedeEditar = usePermiso(TUTORIAS_PERMISOS.sesion, 'EDITAR');
  // El registro se bloquea en sesiones canceladas (o sin permiso de edición).
  const registroReadOnly = !puedeEditar || sesion?.estado === 'CANCELADA';

  const headerActions = (
    <Flex gap="small" wrap>
      {puedeMarcarRealizada && (
        <ActionButton
          permiso={TUTORIAS_PERMISOS.sesion}
          accion="EDITAR"
          variant="success"
          icon={<CheckCircleOutlined />}
          loading={procesandoEstado}
          onClick={() => cambiarEstadoSesion('REALIZADA')}
        >
          Marcar realizada
        </ActionButton>
      )}
      {puedeCancelar && (
        <ActionButton
          permiso={TUTORIAS_PERMISOS.sesion}
          accion="EDITAR"
          variant="danger"
          icon={<StopOutlined />}
          loading={procesandoEstado}
          onClick={() => cambiarEstadoSesion('CANCELADA')}
        >
          Cancelar sesión
        </ActionButton>
      )}
      <BackButton icon={<ArrowLeftOutlined />} onClick={handleVolver}>
        Volver
      </BackButton>
    </Flex>
  );

  return (
    <Flex vertical gap="large" className="page-container" style={{ width: '100%' }}>
      <PageHeaderArea>
        <PageHeader
          title="Detalle de sesión"
          breadcrumbItems={breadcrumbItems}
          actions={headerActions}
        />
      </PageHeaderArea>

      <DashboardPageShell>
        <MainContent>
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
              {!loading && !error && !sesion && (
                <Empty
                  description="No se encontró la sesión solicitada."
                  style={{ marginTop: allSpacing.marginXL }}
                />
              )}
              {!loading && !error && sesion && (
                <Flex vertical gap={allSpacing.marginLG}>
                  <SesionFichaHeader
                    sesion={sesion}
                    puedeEditar={puedeEditar && sesion.estado === 'PROGRAMADA'}
                    onEditar={handleEditar}
                  />
                  <SesionParticipantesSection
                    sesion={sesion}
                    participantes={participantes}
                    setParticipanteCampo={setParticipanteCampo}
                    dirty={dirty}
                    saving={saving}
                    onGuardar={handleGuardarAsistencia}
                    readOnly={registroReadOnly}
                  />
                </Flex>
              )}
            </div>
          </Spin>
        </MainContent>
      </DashboardPageShell>
    </Flex>
  );
};

export default SesionReforzamientoDetail;
