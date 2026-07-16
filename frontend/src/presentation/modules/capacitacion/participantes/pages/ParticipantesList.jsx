/**
 * Listado de participantes de capacitación (Capacitación · CAP-PARTICIPANTES · LISTAR).
 *
 * Mismo shell que CursosCapacitacionList / PagosList. Alta y edición se
 * resuelven en un MODAL (el recurso no tiene ficha propia; seed 65 solo da
 * LISTAR/DETALLE/CREAR/EDITAR). Página "dumb": consume el hook de pantalla.
 */

import { Flex, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { MainContent, PageHeaderArea } from '@templates';
import { PageHeader } from '@molecules';
import ListPanelHeader from '@molecules/ListPanelHeader';
import { TableListView } from '@organisms';
import { ActionButton } from '@atoms';
import DashboardPageShell from '@presentation/modules/dashboard/components/organisms/DashboardPageShell';
import { useParticipantesListPage } from '@application-capacitacion/participantes/hooks/state/useParticipantesListPage';
import { CAPACITACION_PERMISOS } from '@application-capacitacion/utils/capacitacionPermisos';
import ParticipanteFormModal from '@capacitacion/participantes/components/organisms/ParticipanteFormModal';
import { allSpacing } from '@theme/tokens';
import '@presentation/styles/pages/detail-page.css';
import '@configuracion/academico/styles/academico-form-page.css';

const { Paragraph } = Typography;

const ParticipantesList = () => {
  const {
    participantes,
    loading,
    error,
    searchText,
    tableColumns,
    breadcrumbItems,
    handleSearchChange,
    tablePagination,
    participanteEnEdicion,
    isEditando,
    abrirNuevo,
    cerrarModal,
    guardarDesdeModal,
    saving,
  } = useParticipantesListPage();

  const nuevoAction = (
    <ActionButton
      permiso={CAPACITACION_PERMISOS.participante}
      accion="CREAR"
      variant="primary"
      icon={<PlusOutlined />}
      onClick={abrirNuevo}
    >
      Nuevo participante
    </ActionButton>
  );

  return (
    <Flex vertical gap="large" className="page-container" style={{ width: '100%' }}>
      <PageHeaderArea>
        <PageHeader title="Participantes" breadcrumbItems={breadcrumbItems} />
      </PageHeaderArea>

      <DashboardPageShell>
        <MainContent>
          <Flex vertical gap={allSpacing.marginLG} style={{ width: '100%', minWidth: 0 }}>
            <section className="cfg-academico-workspace">
              <header className="cfg-academico-workspace__header">
                <ListPanelHeader title="Lista de participantes" actions={nuevoAction} />
                <Paragraph type="secondary" className="cfg-academico-workspace__desc">
                  Personas externas que se inscriben a los cursos de capacitación (sin usuario del
                  sistema). Los datos de contacto se reutilizan al inscribir a un curso.
                </Paragraph>
              </header>
              <div className="cfg-academico-tab-panel">
                <TableListView
                  embedded
                  data={participantes}
                  loading={loading}
                  error={error}
                  searchText={searchText}
                  onSearchChange={handleSearchChange}
                  searchPlaceholder="Buscar por CI, nombre o celular…"
                  columns={tableColumns}
                  rowKey={(record) => record.id}
                  searchColSpan={10}
                  searchStyle={{ maxWidth: 520 }}
                  pagination={tablePagination}
                  loadingTip="Cargando participantes…"
                  emptyText="Aún no hay participantes registrados."
                />
              </div>
            </section>
          </Flex>
        </MainContent>
      </DashboardPageShell>

      <ParticipanteFormModal
        open={participanteEnEdicion !== null}
        participante={isEditando ? participanteEnEdicion : null}
        saving={saving}
        onGuardar={guardarDesdeModal}
        onCancelar={cerrarModal}
      />
    </Flex>
  );
};

export default ParticipantesList;
