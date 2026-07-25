/**
 * MisAlumnosEnRiesgoPage — rama DOCENTE del ítem "Alumnos en riesgo"
 * (TUT · A2). Página GEMELA del listado institucional, con los alumnos en
 * riesgo de SUS cursos (identidad resuelta en servidor) y la acción propia
 * del rol: programar una sesión de reforzamiento con el alumno preseleccionado.
 *
 * Rama self SIN provider admin (patrón `MisEstudiantesDocentePage`): el hook
 * de pantalla consume A2 directamente. Página "dumb".
 */

import { Alert, Button, Flex, Select, Typography } from 'antd';
import { MainContent, PageHeaderArea } from '@templates';
import { PageHeader } from '@molecules';
import ListPanelHeader from '@molecules/ListPanelHeader';
import { TableListView } from '@organisms';
import { Text } from '@atoms';
import DashboardPageShell from '@presentation/modules/dashboard/components/organisms/DashboardPageShell';
import { useMisAlumnosEnRiesgoPage } from '@application-tutorias/acompanamiento/alertas/hooks/state/useMisAlumnosEnRiesgoPage';
import { allSpacing } from '@theme/tokens';
import '@presentation/styles/pages/detail-page.css';
import '@configuracion/academico/styles/academico-form-page.css';

const { Paragraph } = Typography;

const MisAlumnosEnRiesgoPage = () => {
  const {
    alertas,
    loading,
    error,
    refetch,
    searchText,
    handleSearchChange,
    materiaId,
    setMateriaId,
    materiaOptions,
    tableColumns,
    breadcrumbItems,
  } = useMisAlumnosEnRiesgoPage();

  const filtroMateria = (
    <Flex gap={allSpacing.marginXS} align="center">
      <Text type="secondary">Materia</Text>
      <Select
        value={materiaId}
        onChange={(value) => setMateriaId(value ?? null)}
        options={materiaOptions}
        allowClear
        showSearch
        optionFilterProp="label"
        placeholder="Todas"
        style={{ minWidth: 200 }}
      />
    </Flex>
  );

  return (
    <Flex vertical gap="large" className="page-container" style={{ width: '100%' }}>
      <PageHeaderArea>
        <PageHeader title="Mis alumnos en riesgo" breadcrumbItems={breadcrumbItems} />
      </PageHeaderArea>

      <DashboardPageShell>
        <MainContent>
          <Flex vertical gap={allSpacing.marginLG} style={{ width: '100%', minWidth: 0 }}>
            <section className="cfg-academico-workspace">
              <header className="cfg-academico-workspace__header">
                <ListPanelHeader title="Alumnos en riesgo de sus cursos" actions={filtroMateria} />
                <Paragraph type="secondary" className="cfg-academico-workspace__desc">
                  Estudiantes de sus cursos con nota por debajo del umbral de riesgo en el último
                  bimestre o en el promedio de la gestión. Desde cada fila puede programar una
                  sesión de reforzamiento con el alumno ya convocado.
                </Paragraph>
              </header>
              {error ? (
                <Alert
                  type="warning"
                  showIcon
                  title="No se pudo cargar su lista de alumnos en riesgo"
                  description={error}
                  action={
                    <Button size="small" onClick={refetch}>
                      Reintentar
                    </Button>
                  }
                />
              ) : (
                <div className="cfg-academico-tab-panel">
                  <TableListView
                    embedded
                    data={alertas}
                    loading={loading}
                    searchText={searchText}
                    onSearchChange={handleSearchChange}
                    searchPlaceholder="Buscar por estudiante…"
                    columns={tableColumns}
                    rowKey={(record) =>
                      record.matriculaMateriaId ?? `${record.estudianteId}-${record.materiaId}`
                    }
                    searchColSpan={10}
                    searchStyle={{ maxWidth: 520 }}
                    pagination={{
                      pageSize: 10,
                      showSizeChanger: true,
                      showTotal: (total) => `Total: ${total} alumnos en riesgo`,
                      pageSizeOptions: ['10', '20', '50', '100'],
                    }}
                    loadingTip="Cargando alumnos en riesgo…"
                    emptyText="No tiene alumnos en riesgo en sus cursos de la gestión vigente."
                  />
                </div>
              )}
            </section>
          </Flex>
        </MainContent>
      </DashboardPageShell>
    </Flex>
  );
};

export default MisAlumnosEnRiesgoPage;
