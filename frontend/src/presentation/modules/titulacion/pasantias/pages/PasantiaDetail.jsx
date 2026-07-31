/**
 * Ficha-hub de trámite de pasantía (Titulación · TIT · DETALLE) — cabecera de
 * perfil + tabs datos / informes / seguimientos.
 *
 * Patrón ficha-hub de `ProyectoGradoDetail` (DetailPageShell +
 * DetailProfileCard + DetailTabsPanel). Acción de cabecera gated por permiso
 * (ActionButton fail-closed): transición de estado (pasantia·APROBAR, P6).
 * Página "dumb": la orquestación vive en `usePasantiaDetailPage`.
 */

import { useState } from 'react';
import { Flex } from 'antd';
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  FilePdfOutlined,
  ScheduleOutlined,
  SolutionOutlined,
} from '@ant-design/icons';
import { PageTemplate } from '@templates';
import { PageHeader, DetailTabLabel } from '@molecules';
import { ActionButton, BackButton } from '@atoms';
import { DetailPageShell, DetailTabsPanel } from '@organisms';
import { usePermiso } from '@application-auth';
import { usePasantiaDetailPage } from '@application-titulacion/pasantias/hooks/state/usePasantiaDetailPage';
import { TITULACION_PERMISOS } from '@application-titulacion/utils/titulacionPermisos';
import PasantiaFichaHeader from '@titulacion/pasantias/components/organisms/PasantiaFichaHeader';
import PasantiaDatosSection from '@titulacion/pasantias/components/organisms/PasantiaDatosSection';
import PasantiaInformesSection from '@titulacion/pasantias/components/organisms/PasantiaInformesSection';
import PasantiaSeguimientosSection from '@titulacion/pasantias/components/organisms/PasantiaSeguimientosSection';
import TransicionPasantiaModal from '@titulacion/pasantias/components/modals/TransicionPasantiaModal';
import InformePasantiaDrawer from '@titulacion/pasantias/components/modals/InformePasantiaDrawer';
import SeguimientoPasantiaDrawer from '@titulacion/pasantias/components/modals/SeguimientoPasantiaDrawer';
import '@presentation/styles/pages/detail-page.css';

const PasantiaDetail = () => {
  const {
    pasantia,
    loading,
    error,
    refetch,
    breadcrumbItems,
    handleVolver,
    handleEditar,
    transicionModal,
    informes,
    seguimientos,
  } = usePasantiaDetailPage();
  const puedeEditar = usePermiso(TITULACION_PERMISOS.pasantia, 'EDITAR');

  const [activeKey, setActiveKey] = useState('datos');

  const headerActions = (
    <Flex gap="small" wrap>
      <ActionButton
        permiso={TITULACION_PERMISOS.pasantia}
        accion="APROBAR"
        variant="success"
        icon={<CheckCircleOutlined />}
        disabled={transicionModal.transiciones.length === 0}
        onClick={transicionModal.abrir}
      >
        Transición de estado
      </ActionButton>
      <BackButton icon={<ArrowLeftOutlined />} onClick={handleVolver}>
        Volver
      </BackButton>
    </Flex>
  );

  const tabItems = pasantia
    ? [
        {
          key: 'datos',
          label: <DetailTabLabel icon={<SolutionOutlined />}>Datos</DetailTabLabel>,
          children: <PasantiaDatosSection pasantia={pasantia} />,
        },
        {
          key: 'informes',
          label: (
            <DetailTabLabel icon={<FilePdfOutlined />}>
              Informes ({informes.items.length})
            </DetailTabLabel>
          ),
          children: (
            <PasantiaInformesSection
              informes={informes.items}
              loading={informes.loading}
              error={informes.error}
              descargandoId={informes.descargandoId}
              onNuevoInforme={informes.abrirNuevo}
              onEditarInforme={informes.abrirEditar}
              onDescargar={informes.descargar}
            />
          ),
        },
        {
          key: 'seguimientos',
          label: (
            <DetailTabLabel icon={<ScheduleOutlined />}>
              Seguimientos ({seguimientos.items.length})
            </DetailTabLabel>
          ),
          children: (
            <PasantiaSeguimientosSection
              seguimientos={seguimientos.items}
              loading={seguimientos.loading}
              error={seguimientos.error}
              onNuevoSeguimiento={seguimientos.abrirNuevo}
              onEditarSeguimiento={seguimientos.abrirEditar}
            />
          ),
        },
      ]
    : [];

  return (
    <PageTemplate
      header={
        <PageHeader
          title="Detalle del trámite"
          breadcrumbItems={breadcrumbItems}
          actions={headerActions}
        />
      }
    >
      <DetailPageShell
        loading={loading}
        loadingTip="Cargando ficha del trámite…"
        error={error}
        onRetry={refetch}
        showEmpty={!loading && !error && !pasantia}
        emptyDescription="No se encontró el trámite solicitado."
      >
        {pasantia ? (
          <>
            <PasantiaFichaHeader
              pasantia={pasantia}
              puedeEditar={puedeEditar}
              onEditar={handleEditar}
            />
            <DetailTabsPanel items={tabItems} activeKey={activeKey} onChange={setActiveKey} />
          </>
        ) : null}
      </DetailPageShell>

      <TransicionPasantiaModal
        open={transicionModal.open}
        onCancel={transicionModal.cerrar}
        onSubmit={transicionModal.submit}
        saving={transicionModal.saving}
        transiciones={transicionModal.transiciones}
        estadoActual={pasantia?.estado ?? null}
      />
      <InformePasantiaDrawer
        open={informes.drawer.open}
        informe={informes.drawer.informe}
        tipoPasantia={pasantia?.tipo ?? 'PASANTIA'}
        estudianteNombre={pasantia?.estudianteNombre}
        onClose={informes.cerrarDrawer}
        onSubmit={informes.guardar}
        saving={informes.guardando}
      />
      <SeguimientoPasantiaDrawer
        open={seguimientos.drawer.open}
        seguimiento={seguimientos.drawer.seguimiento}
        estudianteNombre={pasantia?.estudianteNombre}
        onClose={seguimientos.cerrarDrawer}
        onSubmit={seguimientos.guardar}
        saving={seguimientos.guardando}
      />
    </PageTemplate>
  );
};

export default PasantiaDetail;
