/**
 * Ficha-hub de proyecto de grado (Tutorías · TUT · DETALLE) — cabecera de
 * perfil + tabs datos / integrantes / bitácora / avances / dictámenes.
 *
 * Patrón ficha-hub de `UsuarioDetailPage` (DetailPageShell + DetailProfileCard
 * + DetailTabsPanel). Acciones de cabecera gated por permiso (ActionButton
 * fail-closed): asignar tutor y aprobar etapa (proyecto·APROBAR). Página
 * "dumb": la orquestación vive en `useProyectoGradoDetailPage`.
 */

import { useState } from 'react';
import { Flex } from 'antd';
import {
  ArrowLeftOutlined,
  AuditOutlined,
  BookOutlined,
  CheckCircleOutlined,
  CloudUploadOutlined,
  FileTextOutlined,
  TeamOutlined,
  UserSwitchOutlined,
} from '@ant-design/icons';
import { PageTemplate } from '@templates';
import { PageHeader, DetailTabLabel } from '@molecules';
import { ActionButton, BackButton } from '@atoms';
import { DetailPageShell, DetailTabsPanel } from '@organisms';
import { usePermiso } from '@application-auth';
import { useProyectoGradoDetailPage } from '@application-tutorias/titulacion/hooks/state/useProyectoGradoDetailPage';
import { TUTORIAS_PERMISOS } from '@application-tutorias/utils/tutoriasPermisos';
import ProyectoGradoFichaHeader from '@tutorias/titulacion/components/organisms/ProyectoGradoFichaHeader';
import ProyectoDatosSection from '@tutorias/titulacion/components/organisms/ProyectoDatosSection';
import ProyectoIntegrantesSection from '@tutorias/titulacion/components/organisms/ProyectoIntegrantesSection';
import ProyectoBitacoraSection from '@tutorias/titulacion/components/organisms/ProyectoBitacoraSection';
import ProyectoAvancesSection from '@tutorias/titulacion/components/organisms/ProyectoAvancesSection';
import ProyectoDictamenesSection from '@tutorias/titulacion/components/organisms/ProyectoDictamenesSection';
import AsignarTutorModal from '@tutorias/titulacion/components/modals/AsignarTutorModal';
import AprobarEtapaModal from '@tutorias/titulacion/components/modals/AprobarEtapaModal';
import AgregarIntegranteModal from '@tutorias/titulacion/components/modals/AgregarIntegranteModal';
import BitacoraEntradaDrawer from '@tutorias/titulacion/components/modals/BitacoraEntradaDrawer';
import '@presentation/styles/pages/detail-page.css';

const ProyectoGradoDetail = () => {
  const {
    proyecto,
    loading,
    error,
    refetch,
    breadcrumbItems,
    handleVolver,
    handleEditar,
    tutorModal,
    etapaModal,
    integrantes,
    bitacora,
    avances,
    dictamenes,
  } = useProyectoGradoDetailPage();
  const puedeEditar = usePermiso(TUTORIAS_PERMISOS.proyecto, 'EDITAR');

  const [activeKey, setActiveKey] = useState('datos');

  const headerActions = (
    <Flex gap="small" wrap>
      <ActionButton
        permiso={TUTORIAS_PERMISOS.proyecto}
        accion="APROBAR"
        variant="info"
        icon={<UserSwitchOutlined />}
        onClick={tutorModal.abrir}
      >
        {proyecto?.tutorId ? 'Cambiar tutor' : 'Asignar tutor'}
      </ActionButton>
      <ActionButton
        permiso={TUTORIAS_PERMISOS.proyecto}
        accion="APROBAR"
        variant="success"
        icon={<CheckCircleOutlined />}
        disabled={etapaModal.transiciones.length === 0}
        onClick={etapaModal.abrir}
      >
        Aprobar etapa
      </ActionButton>
      <BackButton icon={<ArrowLeftOutlined />} onClick={handleVolver}>
        Volver
      </BackButton>
    </Flex>
  );

  const tabItems = proyecto
    ? [
        {
          key: 'datos',
          label: <DetailTabLabel icon={<BookOutlined />}>Datos</DetailTabLabel>,
          children: <ProyectoDatosSection proyecto={proyecto} />,
        },
        {
          key: 'integrantes',
          label: (
            <DetailTabLabel icon={<TeamOutlined />}>
              Integrantes ({proyecto.integrantes?.length ?? 0})
            </DetailTabLabel>
          ),
          children: (
            <ProyectoIntegrantesSection
              proyecto={proyecto}
              onAgregar={integrantes.abrirModal}
              onToggleEstado={integrantes.toggleEstado}
            />
          ),
        },
        {
          key: 'bitacora',
          label: (
            <DetailTabLabel icon={<FileTextOutlined />}>
              Bitácora ({bitacora.entradas.length})
            </DetailTabLabel>
          ),
          children: (
            <ProyectoBitacoraSection
              entradas={bitacora.entradas}
              loading={bitacora.loading}
              error={bitacora.error}
              onNuevaEntrada={bitacora.abrirNuevaEntrada}
              onEditarEntrada={bitacora.abrirEditarEntrada}
            />
          ),
        },
        {
          key: 'avances',
          label: (
            <DetailTabLabel icon={<CloudUploadOutlined />}>
              Avances ({avances.items.length})
            </DetailTabLabel>
          ),
          children: (
            <ProyectoAvancesSection
              avances={avances.items}
              loading={avances.loading}
              error={avances.error}
              descargandoId={avances.descargandoId}
              onDescargar={avances.descargar}
              onRevisar={avances.revisar}
            />
          ),
        },
        {
          key: 'dictamenes',
          label: (
            <DetailTabLabel icon={<AuditOutlined />}>
              Dictámenes ({dictamenes.items.length})
            </DetailTabLabel>
          ),
          children: (
            <ProyectoDictamenesSection
              dictamenes={dictamenes.items}
              loading={dictamenes.loading}
              error={dictamenes.error}
              descargandoId={dictamenes.descargandoId}
              onDescargar={dictamenes.descargar}
            />
          ),
        },
      ]
    : [];

  return (
    <PageTemplate
      header={
        <PageHeader
          title="Detalle de proyecto"
          breadcrumbItems={breadcrumbItems}
          actions={headerActions}
        />
      }
    >
      <DetailPageShell
        loading={loading}
        loadingTip="Cargando ficha del proyecto…"
        error={error}
        onRetry={refetch}
        showEmpty={!loading && !error && !proyecto}
        emptyDescription="No se encontró el proyecto solicitado."
      >
        {proyecto ? (
          <>
            <ProyectoGradoFichaHeader
              proyecto={proyecto}
              puedeEditar={puedeEditar}
              onEditar={handleEditar}
            />
            <DetailTabsPanel items={tabItems} activeKey={activeKey} onChange={setActiveKey} />
          </>
        ) : null}
      </DetailPageShell>

      <AsignarTutorModal
        open={tutorModal.open}
        onCancel={tutorModal.cerrar}
        onSubmit={tutorModal.submit}
        saving={tutorModal.saving}
        docentes={tutorModal.docentes}
        loadingDocentes={tutorModal.loadingDocentes}
        docentesDisponible={tutorModal.docentesDisponible}
        tutorActualId={proyecto?.tutorId ?? null}
      />
      <AprobarEtapaModal
        open={etapaModal.open}
        onCancel={etapaModal.cerrar}
        onSubmit={etapaModal.submit}
        saving={etapaModal.saving}
        transiciones={etapaModal.transiciones}
        estadoActual={proyecto?.estado ?? null}
      />
      <AgregarIntegranteModal
        open={integrantes.modalOpen}
        onCancel={integrantes.cerrarModal}
        onSubmit={integrantes.agregar}
        saving={integrantes.guardando}
        integrantes={proyecto?.integrantes ?? []}
      />
      <BitacoraEntradaDrawer
        open={bitacora.drawer.open}
        entrada={bitacora.drawer.entrada}
        avance={bitacora.drawer.avance}
        proyectoTitulo={proyecto?.titulo}
        onClose={bitacora.cerrarDrawer}
        onSubmit={bitacora.guardar}
        saving={bitacora.guardando}
      />
    </PageTemplate>
  );
};

export default ProyectoGradoDetail;
