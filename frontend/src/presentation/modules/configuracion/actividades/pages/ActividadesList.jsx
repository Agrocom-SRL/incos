/**
 * Listado de actividades — página completa (patrón ABM clásico, como Docentes;
 * Actividades es un único ítem de menú sin tabs).
 */

import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flex, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import ListPanelHeader from '@molecules/ListPanelHeader';
import { TableListView } from '@organisms';
import { ActionButton } from '@atoms';
import { useActividadContext } from '@application-configuracion/actividades/hooks';
import {
  actividadNuevaPath,
  actividadesListNavigationState,
} from '@application-configuracion/actividades/config/paths';
import { createActividadesTableColumns } from '@configuracion/actividades/config/actividadesTableColumns';
import { allSpacing } from '@theme/tokens';
import '@configuracion/academico/styles/academico-form-page.css';

const { Paragraph } = Typography;

const BREADCRUMB = [
  { title: 'Inicio', href: '/' },
  { title: 'Configuración', href: '/configuracion' },
  { title: 'Actividades' },
];

const ActividadesList = () => {
  const navigate = useNavigate();
  const listNavState = useMemo(() => actividadesListNavigationState(), []);

  const {
    actividades = [],
    loading = false,
    error = null,
    searchText = '',
    setSearchText,
    refetch,
  } = useActividadContext();

  const tableColumns = useMemo(
    () => createActividadesTableColumns({ navigate, listNavState, refetch }),
    [navigate, listNavState, refetch],
  );

  const nuevaActividadAction = (
    <ActionButton
      permiso="configuracion.actividad"
      accion="CREAR"
      variant="primary"
      icon={<PlusOutlined />}
      onClick={() => navigate(actividadNuevaPath, { state: listNavState })}
    >
      Nueva actividad
    </ActionButton>
  );

  return (
    <PageTemplate header={<PageHeader title="Actividades" breadcrumbItems={BREADCRUMB} />} sidebar={null}>
      <Flex vertical gap={allSpacing.marginLG} style={{ width: '100%', minWidth: 0 }}>
        <section className="cfg-academico-workspace">
          <header className="cfg-academico-workspace__header">
            <ListPanelHeader title="Lista de actividades" actions={nuevaActividadAction} />
            <Paragraph type="secondary" className="cfg-academico-workspace__desc">
              Catálogo maestro de actividades reutilizable en el cronograma académico de cada gestión.
            </Paragraph>
          </header>
          <div className="cfg-academico-tab-panel">
            <TableListView
              embedded
              data={actividades}
              loading={loading}
              error={error}
              searchText={searchText}
              onSearchChange={(e) => setSearchText(e.target.value)}
              searchPlaceholder="Buscar por nombre, descripción o icono..."
              columns={tableColumns}
              rowKey={(record) => record.id}
              searchColSpan={10}
              searchStyle={{ maxWidth: 520 }}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Total: ${total} actividades`,
                pageSizeOptions: ['10', '20', '50', '100'],
              }}
              loadingTip="Cargando actividades..."
            />
          </div>
        </section>
      </Flex>
    </PageTemplate>
  );
};

export default ActividadesList;
