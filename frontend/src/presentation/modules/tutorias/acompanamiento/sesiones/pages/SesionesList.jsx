/**
 * Listado de sesiones de refuerzo (TUT · TUT-SESIONES · sesion·LISTAR).
 *
 * Lenguaje visual de CursosCapacitacionList / LicenciasListPage: shell
 * Flex.page-container → PageHeaderArea(PageHeader) → DashboardPageShell →
 * MainContent → section.cfg-academico-workspace (ListPanelHeader con filtro de
 * estado + botón programar + lede) → TableListView embedded.
 *
 * Página "dumb": solo compone template + organismos y consume el hook de
 * pantalla (`useSesionesListPage`).
 */

import { Flex, Select, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { MainContent, PageHeaderArea } from '@templates';
import { PageHeader } from '@molecules';
import ListPanelHeader from '@molecules/ListPanelHeader';
import { TableListView } from '@organisms';
import { ActionButton, Text } from '@atoms';
import DashboardPageShell from '@presentation/modules/dashboard/components/organisms/DashboardPageShell';
import { useSesionesListPage } from '@application-tutorias/acompanamiento/sesiones/hooks/state/useSesionesListPage';
import { TUTORIAS_PERMISOS } from '@application-tutorias/utils/tutoriasPermisos';
import { allSpacing } from '@theme/tokens';
import '@presentation/styles/pages/detail-page.css';
import '@configuracion/academico/styles/academico-form-page.css';

const { Paragraph } = Typography;

const SesionesList = () => {
  const {
    sesiones,
    loading,
    error,
    searchText,
    handleSearchChange,
    estado,
    setEstado,
    estadoOptions,
    tableColumns,
    breadcrumbItems,
    handleProgramar,
    tablePagination,
  } = useSesionesListPage();

  const headerActions = (
    <Flex gap={allSpacing.marginSM} align="center" wrap="wrap" justify="flex-end">
      <Flex gap={allSpacing.marginXS} align="center">
        <Text type="secondary">Estado</Text>
        <Select
          value={estado}
          onChange={(value) => setEstado(value ?? null)}
          options={estadoOptions}
          allowClear
          placeholder="Todos"
          style={{ minWidth: 160 }}
        />
      </Flex>
      <ActionButton
        permiso={TUTORIAS_PERMISOS.sesion}
        accion="CREAR"
        variant="primary"
        icon={<PlusOutlined />}
        onClick={handleProgramar}
      >
        Programar sesión
      </ActionButton>
    </Flex>
  );

  return (
    <Flex vertical gap="large" className="page-container" style={{ width: '100%' }}>
      <PageHeaderArea>
        <PageHeader title="Sesiones de refuerzo" breadcrumbItems={breadcrumbItems} />
      </PageHeaderArea>

      <DashboardPageShell>
        <MainContent>
          <Flex vertical gap={allSpacing.marginLG} style={{ width: '100%', minWidth: 0 }}>
            <section className="cfg-academico-workspace">
              <header className="cfg-academico-workspace__header">
                <ListPanelHeader title="Lista de sesiones" actions={headerActions} />
                <Paragraph type="secondary" className="cfg-academico-workspace__desc">
                  Sesiones complementarias programadas por curso para estudiantes con riesgo
                  pedagógico: fecha, horario, modalidad y estudiantes convocados. La asistencia
                  se registra en la ficha de cada sesión.
                </Paragraph>
              </header>
              <div className="cfg-academico-tab-panel">
                <TableListView
                  embedded
                  data={sesiones}
                  loading={loading}
                  error={error}
                  searchText={searchText}
                  onSearchChange={handleSearchChange}
                  searchPlaceholder="Buscar por tema, materia o docente…"
                  columns={tableColumns}
                  rowKey={(record) => record.id}
                  searchColSpan={10}
                  searchStyle={{ maxWidth: 520 }}
                  pagination={tablePagination}
                  loadingTip="Cargando sesiones…"
                  emptyText="Aún no hay sesiones de refuerzo programadas."
                />
              </div>
            </section>
          </Flex>
        </MainContent>
      </DashboardPageShell>
    </Flex>
  );
};

export default SesionesList;
