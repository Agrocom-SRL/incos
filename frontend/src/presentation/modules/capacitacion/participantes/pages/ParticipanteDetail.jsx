/**
 * Ficha de participante de capacitación (Capacitación · CAP · DETALLE) — cabecera con
 * resumen + tabs "Información" y "Capacitaciones" (historial de cursos).
 *
 * Página "dumb": compone template + organismos y consume el hook de pantalla
 * (espejo de `CursoCapacitacionDetail`). Shell de detalle `sd-*` compartido.
 */

import { Alert, Empty, Flex, Spin, Tabs } from 'antd';
import { ArrowLeftOutlined, DeleteOutlined } from '@ant-design/icons';
import { allSpacing } from '@theme/tokens';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import { ActionButton, BackButton } from '@atoms';
import { usePermiso } from '@application-auth';
import { useParticipanteDetailPage } from '@application-capacitacion/participantes/hooks/state/useParticipanteDetailPage';
import { CAPACITACION_PERMISOS } from '@application-capacitacion/utils/capacitacionPermisos';
import ParticipanteFichaHeader from '@capacitacion/participantes/components/organisms/ParticipanteFichaHeader';
import ParticipanteInformacionSection from '@capacitacion/participantes/components/organisms/ParticipanteInformacionSection';
import ParticipanteHistorialSection from '@capacitacion/participantes/components/organisms/ParticipanteHistorialSection';
import '@presentation/styles/pages/detail-page.css';

const ParticipanteDetail = () => {
  const {
    participante,
    loading,
    error,
    breadcrumbItems,
    handleVolver,
    handleEditar,
    handleEliminar,
    handleVerInscripcion,
    eliminando,
  } = useParticipanteDetailPage();
  const puedeEditar = usePermiso(CAPACITACION_PERMISOS.participante, 'EDITAR');

  const headerActions = (
    <Flex gap="small" wrap>
      {participante && (
        <ActionButton
          permiso={CAPACITACION_PERMISOS.participante}
          accion="ELIMINAR"
          variant="danger"
          icon={<DeleteOutlined />}
          loading={eliminando}
          onClick={handleEliminar}
        >
          Eliminar
        </ActionButton>
      )}
      <BackButton icon={<ArrowLeftOutlined />} onClick={handleVolver}>
        Volver
      </BackButton>
    </Flex>
  );

  const tabItems = participante
    ? [
        {
          key: 'informacion',
          label: 'Información',
          children: <ParticipanteInformacionSection participante={participante} />,
        },
        {
          key: 'capacitaciones',
          label: `Capacitaciones (${participante.inscripciones.length})`,
          children: (
            <ParticipanteHistorialSection
              inscripciones={participante.inscripciones}
              onVerInscripcion={handleVerInscripcion}
            />
          ),
        },
      ]
    : [];

  return (
    <PageTemplate
      header={
        <PageHeader
          title="Detalle de participante"
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
          {!loading && !error && !participante && (
            <Empty
              description="No se encontró el participante solicitado."
              style={{ marginTop: allSpacing.marginXL }}
            />
          )}
          {!loading && !error && participante && (
            <>
              <ParticipanteFichaHeader
                participante={participante}
                puedeEditar={puedeEditar}
                onEditar={handleEditar}
              />
              <div className="sd-tabs-shell">
                <Tabs defaultActiveKey="informacion" items={tabItems} className="sd-tabs" />
              </div>
            </>
          )}
        </div>
      </Spin>
    </PageTemplate>
  );
};

export default ParticipanteDetail;
