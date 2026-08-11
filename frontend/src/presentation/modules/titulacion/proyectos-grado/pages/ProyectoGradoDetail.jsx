/**
 * Ficha-hub de proyecto de grado (Titulación · TIT · DETALLE) — cabecera de
 * perfil + tabs datos / integrantes / bitácora / avances / dictámenes / acta
 * de defensa, con las etapas del proyecto y su acción principal en la barra
 * lateral (`PageTemplate` sidebar → `InfoSidebar`, extensión 2026-08-11,
 * mismo lado derecho que `GestionHorariosPage` para mantener consistencia).
 *
 * Patrón ficha-hub de `UsuarioDetailPage` (DetailPageShell + DetailProfileCard
 * + DetailTabsPanel). Acciones de cabecera gated por permiso (ActionButton
 * fail-closed): asignar tutor y exportar FMDG-1. La acción de avanzar de
 * etapa (aprobar etapa / registrar acta) vive junto a la tarjeta "Etapas del
 * proyecto" en el sidebar, no en la cabecera — agrupa el CTA con el contexto
 * que lo gobierna. Página "dumb": la orquestación vive en
 * `useProyectoGradoDetailPage`.
 *
 * Acta de defensa (extensión 2026-08-01, D3): tab de carga LAZY (se dispara
 * recién al abrirla, no al montar la ficha) y, con el proyecto en `DEFENSA`,
 * el CTA principal del sidebar cambia de "Continuar etapa" a "Registrar acta
 * de defensa" — es ese registro el que delega en el backend la transición
 * DEFENSA→APROBADO|REPROBADO, no el modal genérico de transición. Un acta
 * `EMITIDA` admite anulación (P8, extensión 2026-08-02, `AnularActaDefensaModal`,
 * mismo permiso APROBAR) sin revertir esa transición.
 */

import { useState } from 'react';
import { Flex } from 'antd';
import { allSpacing } from '@theme/tokens';
import {
  ArrowLeftOutlined,
  AuditOutlined,
  BookOutlined,
  CheckCircleOutlined,
  CloudUploadOutlined,
  FileDoneOutlined,
  FilePdfOutlined,
  FileTextOutlined,
  TeamOutlined,
  UploadOutlined,
  UserSwitchOutlined,
} from '@ant-design/icons';
import { PageTemplate } from '@templates';

import { PageHeader, DetailTabLabel } from '@molecules';
import { ActionButton, BackButton } from '@atoms';
import { DetailPageShell, DetailTabsPanel } from '@organisms';
import { usePermiso } from '@application-auth';
import { useProyectoGradoDetailPage } from '@application-titulacion/proyectos-grado/hooks/state/useProyectoGradoDetailPage';
import { TITULACION_PERMISOS } from '@application-titulacion/utils/titulacionPermisos';
import ProyectoGradoFichaHeader from '@titulacion/proyectos-grado/components/organisms/ProyectoGradoFichaHeader';
import ProyectoGradoTimeline from '@titulacion/proyectos-grado/components/organisms/ProyectoGradoTimeline';
import ProyectoDatosSection from '@titulacion/proyectos-grado/components/organisms/ProyectoDatosSection';
import ProyectoIntegrantesSection from '@titulacion/proyectos-grado/components/organisms/ProyectoIntegrantesSection';
import ProyectoBitacoraSection from '@titulacion/proyectos-grado/components/organisms/ProyectoBitacoraSection';
import ProyectoAvancesSection from '@titulacion/proyectos-grado/components/organisms/ProyectoAvancesSection';
import ProyectoDictamenesSection from '@titulacion/proyectos-grado/components/organisms/ProyectoDictamenesSection';
import ProyectoActaDefensaSection from '@titulacion/proyectos-grado/components/organisms/ProyectoActaDefensaSection';
import AsignarTutorModal from '@titulacion/proyectos-grado/components/modals/AsignarTutorModal';
import AprobarEtapaModal from '@titulacion/proyectos-grado/components/modals/AprobarEtapaModal';
import CancelarProyectoModal from '@titulacion/proyectos-grado/components/modals/CancelarProyectoModal';
import AgregarIntegranteModal from '@titulacion/proyectos-grado/components/modals/AgregarIntegranteModal';
import BitacoraEntradaDrawer from '@titulacion/proyectos-grado/components/modals/BitacoraEntradaDrawer';
import SubirAvanceModal from '@titulacion/proyectos-grado/components/modals/SubirAvanceModal';
import RegistrarActaDefensaModal from '@titulacion/proyectos-grado/components/modals/RegistrarActaDefensaModal';
import AnularActaDefensaModal from '@titulacion/proyectos-grado/components/modals/AnularActaDefensaModal';
import '@presentation/styles/pages/detail-page.css';

/** Estado del proyecto en el que el CTA principal apunta a registrar el acta (D3). */
const ESTADO_PROYECTO_DEFENSA = 'DEFENSA';

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
    cancelarModal,
    integrantes,
    bitacora,
    avances,
    dictamenes,
    formularioModalidad,
    actaDefensa,
  } = useProyectoGradoDetailPage();
  const puedeEditar = usePermiso(TITULACION_PERMISOS.proyecto, 'EDITAR');

  const [activeKey, setActiveKey] = useState('datos');

  const handleTabChange = (key) => {
    setActiveKey(key);
    if (key === 'acta-defensa') {
      actaDefensa.abrirTab();
    }
  };

  /** En DEFENSA, el CTA principal guía a registrar el acta en vez de la transición genérica (D3). */
  const enDefensa = proyecto?.estado === ESTADO_PROYECTO_DEFENSA;

  const headerActions = (
    <Flex gap="small" wrap>
      <ActionButton
        permiso={TITULACION_PERMISOS.proyecto}
        accion="APROBAR"
        variant="success"
        icon={<UserSwitchOutlined />}
        onClick={tutorModal.abrir}
      >
        {proyecto?.tutorId ? 'Cambiar tutor' : 'Asignar tutor'}
      </ActionButton>
      <ActionButton
        permiso={TITULACION_PERMISOS.proyecto}
        accion="EXPORTAR"
        variant="info"
        icon={<FilePdfOutlined />}
        loading={formularioModalidad.descargando}
        onClick={formularioModalidad.exportar}
      >
        Exportar formulario FMDG-1
      </ActionButton>
      <BackButton icon={<ArrowLeftOutlined />} onClick={handleVolver}>
        Volver
      </BackButton>
    </Flex>
  );

  /**
   * Acciones de la tarjeta "Etapas del proyecto" (sidebar): CTA principal de
   * avance + "Cancelar proyecto" como acción secundaria, SEPARADA del avance
   * de etapa (extensión 2026-08-11, pedido explícito del usuario — cancelar
   * es posible desde cualquier etapa vigente, no una opción a elegir junto a
   * la siguiente etapa).
   */
  const etapaAction = enDefensa ? (
    <ActionButton
      permiso={TITULACION_PERMISOS.proyecto}
      accion="APROBAR"
      variant="success"
      icon={<FileDoneOutlined />}
      block
      onClick={actaDefensa.modal.abrir}
    >
      Registrar acta de defensa
    </ActionButton>
  ) : (
    <ActionButton
      permiso={TITULACION_PERMISOS.proyecto}
      accion="APROBAR"
      variant="success"
      icon={<CheckCircleOutlined />}
      block
      disabled={etapaModal.transiciones.length === 0}
      onClick={etapaModal.abrir}
    >
      Continuar etapa
    </ActionButton>
  );

  const sidebarAction = (
    <Flex vertical gap={8} style={{ width: '100%' }}>
      {etapaAction}
      {cancelarModal.puedeCancelar ? (
        <ActionButton
          permiso={TITULACION_PERMISOS.proyecto}
          accion="APROBAR"
          variant="error"
          block
          onClick={cancelarModal.abrir}
        >
          Cancelar proyecto
        </ActionButton>
      ) : null}
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
              extra={
                <ActionButton
                  permiso={TITULACION_PERMISOS.avance}
                  accion="CREAR"
                  variant="primary"
                  icon={<UploadOutlined />}
                  onClick={avances.subirModal.abrir}
                >
                  Subir avance
                </ActionButton>
              }
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
        {
          key: 'acta-defensa',
          label: (
            <DetailTabLabel icon={<FileDoneOutlined />}>
              Acta de defensa ({actaDefensa.items.length})
            </DetailTabLabel>
          ),
          children: (
            <ProyectoActaDefensaSection
              proyecto={proyecto}
              actas={actaDefensa.items}
              loading={actaDefensa.loading}
              error={actaDefensa.error}
              puedeRegistrar={actaDefensa.puedeRegistrar}
              descargandoId={actaDefensa.descargandoId}
              onRegistrar={actaDefensa.modal.abrir}
              onExportarPdf={actaDefensa.exportarPdf}
              onAnular={actaDefensa.anular}
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
      sidebar={proyecto ? <ProyectoGradoTimeline proyecto={proyecto} action={sidebarAction} /> : null}
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
          <Flex vertical gap={allSpacing.marginLG}>
            <ProyectoGradoFichaHeader
              proyecto={proyecto}
              puedeEditar={puedeEditar}
              onEditar={handleEditar}
            />
            <DetailTabsPanel items={tabItems} activeKey={activeKey} onChange={handleTabChange} />
          </Flex>
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
        proyecto={etapaModal.proyecto}
        bitacoraCount={etapaModal.bitacoraCount}
      />
      <CancelarProyectoModal
        open={cancelarModal.open}
        onCancel={cancelarModal.cerrar}
        onSubmit={cancelarModal.submit}
        saving={cancelarModal.saving}
      />
      <SubirAvanceModal
        open={avances.subirModal.open}
        onCancel={avances.subirModal.cerrar}
        onSubmit={avances.subirModal.submit}
        subiendo={avances.subirModal.subiendo}
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
      <RegistrarActaDefensaModal
        open={actaDefensa.modal.open}
        onCancel={actaDefensa.modal.cerrar}
        onSubmit={actaDefensa.modal.submit}
        saving={actaDefensa.modal.saving}
        integrantes={proyecto?.integrantes ?? []}
        docentes={actaDefensa.modal.docentes}
        loadingDocentes={actaDefensa.modal.loadingDocentes}
        docentesDisponible={actaDefensa.modal.docentesDisponible}
      />
      <AnularActaDefensaModal
        open={actaDefensa.anularModal.open}
        acta={actaDefensa.anularModal.acta}
        anulando={actaDefensa.anularModal.anulando}
        onAnular={actaDefensa.anularModal.submit}
        onCancelar={actaDefensa.anularModal.cerrar}
      />
    </PageTemplate>
  );
};

export default ProyectoGradoDetail;
