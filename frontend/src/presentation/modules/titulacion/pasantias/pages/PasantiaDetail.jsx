/**
 * Ficha-hub de trámite de pasantía (Titulación · TIT · DETALLE) — cabecera de
 * perfil + tabs datos / informes / seguimientos, con la línea de tiempo del
 * trámite en la barra lateral (`PageTemplate` sidebar → `InfoSidebar`,
 * extensión 2026-08-11, mismo movimiento que `ProyectoGradoDetail`).
 *
 * Patrón ficha-hub de `ProyectoGradoDetail` (DetailPageShell +
 * DetailProfileCard + DetailTabsPanel). Acción de cabecera gated por permiso
 * (ActionButton fail-closed): informe de verificación/convalidación — primer
 * paso legal del trámite (emitir si no existe, descargar si ya fue emitido).
 * Página "dumb": la orquestación vive en `usePasantiaDetailPage`.
 *
 * NOTA (2026-08-09): se retiró el botón/modal de transición de estado manual
 * (P6, `TransicionPasantiaModal`) — la máquina de estados se gobernará de
 * otra forma (por definir); `PasantiaTimeline` (solo lectura) se mantiene,
 * ahora en el sidebar en vez de bajo la cabecera de la ficha.
 */

import { useState } from 'react';
import { Flex } from 'antd';
import {
  ArrowLeftOutlined,
  FileAddOutlined,
  FilePdfOutlined,
  ScheduleOutlined,
  ShopOutlined,
  SolutionOutlined,
} from '@ant-design/icons';
import { PageTemplate } from '@templates';
import { PageHeader, DetailTabLabel } from '@molecules';
import { ActionButton, BackButton } from '@atoms';
import { DetailPageShell, DetailTabsPanel } from '@organisms';
import { usePermiso } from '@application-auth';
import { allSpacing } from '@theme/tokens';
import { usePasantiaDetailPage } from '@application-titulacion/pasantias/hooks/state/usePasantiaDetailPage';
import { TITULACION_PERMISOS } from '@application-titulacion/utils/titulacionPermisos';
import PasantiaFichaHeader from '@titulacion/pasantias/components/organisms/PasantiaFichaHeader';
import PasantiaTimeline from '@titulacion/pasantias/components/organisms/PasantiaTimeline';
import PasantiaDatosSection from '@titulacion/pasantias/components/organisms/PasantiaDatosSection';
import PasantiaEmpresaSection from '@titulacion/pasantias/components/organisms/PasantiaEmpresaSection';
import PasantiaInformesSection from '@titulacion/pasantias/components/organisms/PasantiaInformesSection';
import PasantiaSeguimientosSection from '@titulacion/pasantias/components/organisms/PasantiaSeguimientosSection';
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
    informeVerificacion,
    informes,
    seguimientos,
  } = usePasantiaDetailPage();
  const puedeEditar = usePermiso(TITULACION_PERMISOS.pasantia, 'EDITAR');

  const [activeKey, setActiveKey] = useState('datos');

  const nombreInforme =
    pasantia?.tipo === 'CONVALIDACION' ? 'informe de convalidación' : 'informe de verificación';

  const headerActions = (
    <Flex gap="small" wrap>
      {informeVerificacion.informe ? (
        <ActionButton
          permiso={TITULACION_PERMISOS.pasantia}
          accion="EXPORTAR"
          variant="primary"
          icon={<FilePdfOutlined />}
          loading={informeVerificacion.descargando}
          onClick={informeVerificacion.onDescargar}
        >
          Descargar {nombreInforme}
        </ActionButton>
      ) : (
        <ActionButton
          permiso={TITULACION_PERMISOS.pasantiaInforme}
          accion="CREAR"
          variant="primary"
          icon={<FileAddOutlined />}
          onClick={informeVerificacion.onEmitir}
        >
          Emitir {nombreInforme}
        </ActionButton>
      )}
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
          key: 'empresa',
          label: <DetailTabLabel icon={<ShopOutlined />}>Empresa</DetailTabLabel>,
          children: <PasantiaEmpresaSection pasantia={pasantia} />,
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
      sidebar={pasantia ? <PasantiaTimeline pasantia={pasantia} /> : null}
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
          <Flex vertical gap={allSpacing.marginLG}>
            <PasantiaFichaHeader
              pasantia={pasantia}
              puedeEditar={puedeEditar}
              onEditar={handleEditar}
            />
            <DetailTabsPanel items={tabItems} activeKey={activeKey} onChange={setActiveKey} />
          </Flex>
        ) : null}
      </DetailPageShell>

      <InformePasantiaDrawer
        open={informes.drawer.open}
        informe={informes.drawer.informe}
        tipoPasantia={pasantia?.tipo ?? 'PASANTIA'}
        estudianteNombre={pasantia?.estudianteNombre}
        areaDepartamento={pasantia?.areaDepartamento}
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
