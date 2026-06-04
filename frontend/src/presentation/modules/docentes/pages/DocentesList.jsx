/**
 * Listado de docentes — patrón CFG carreras/materias (hook de página + workspace).
 */

import { Flex, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import ListPanelHeader from '@molecules/ListPanelHeader';
import { TableListView } from '@organisms';
import { ActionButton } from '@atoms';
import { useDocentesListPage } from '@application-docentes/hooks';
import { allSpacing } from '@theme/tokens';
import '@configuracion/academico/styles/academico-form-page.css';
import '@docentes/styles/docentes-list-page.css';

const { Paragraph } = Typography;

const DocentesList = () => {
  const {
    docentes,
    loading,
    error,
    searchText,
    tableColumns,
    breadcrumbItems,
    handleNuevoDocente,
    handleSearchChange,
    tablePagination,
  } = useDocentesListPage();

  const registrarAction = (
    <ActionButton
      permiso="docentes.crear"
      accion="CREAR"
      variant="primary"
      icon={<PlusOutlined />}
      onClick={handleNuevoDocente}
    >
      Registrar docente
    </ActionButton>
  );

  return (
    <PageTemplate
      header={<PageHeader breadcrumbItems={breadcrumbItems} />}
      sidebar={null}
    >
      <Flex vertical gap={allSpacing.marginLG} style={{ width: '100%', minWidth: 0 }}>
        <section className="cfg-academico-workspace">
          <header className="cfg-academico-workspace__header">
            <ListPanelHeader title="Listado de docentes" actions={registrarAction} />
            <Paragraph type="secondary" className="cfg-academico-workspace__desc">
              Docentes del instituto: contacto de referencia, límites de carga horaria y materias asignadas por gestión.
            </Paragraph>
          </header>
          <div className="cfg-academico-tab-panel">
            <TableListView
              embedded
              data={docentes}
              loading={loading}
              error={error}
              searchText={searchText}
              onSearchChange={handleSearchChange}
              searchPlaceholder="Buscar por nombre, CI, correo, celular o contacto..."
              columns={tableColumns}
              rowKey={(record) => record.id || record.ciCompleto}
              searchColSpan={10}
              searchStyle={{ maxWidth: 520 }}
              tableClassName="data-table--docentes"
              pagination={tablePagination}
              loadingTip="Cargando docentes..."
            />
          </div>
        </section>
      </Flex>
    </PageTemplate>
  );
};

export default DocentesList;
