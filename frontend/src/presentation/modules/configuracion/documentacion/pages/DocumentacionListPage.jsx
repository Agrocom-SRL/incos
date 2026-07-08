/**
 * Listado unificado de documentación — página completa (patrón ABM clásico,
 * como Actividades): UNA sola pantalla para los 9 tipos de documento del ENUM,
 * permiso único `configuracion.documentacion`.
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
import { useDocumentacionContext } from '@application-configuracion/documentacion/hooks';
import {
  documentacionNuevaPath,
  documentacionListNavigationState,
} from '@application-configuracion/documentacion/config/paths';
import { createDocumentacionTableColumns } from '@configuracion/documentacion/config/documentacionTableColumns';
import { catalogoEstadoRowClassName } from '@presentation/utils/tableColumns/createSimpleCatalogTableColumns';
import { allSpacing } from '@theme/tokens';
import '@configuracion/academico/styles/academico-form-page.css';

const { Paragraph } = Typography;

const BREADCRUMB = [
  { title: 'Inicio', href: '/' },
  { title: 'Configuración', href: '/configuracion' },
  { title: 'Documentación' },
];

const DocumentacionListPage = () => {
  const navigate = useNavigate();
  const listNavState = useMemo(() => documentacionListNavigationState(), []);

  const {
    documentacion = [],
    loading = false,
    error = null,
    searchText = '',
    setSearchText,
    refetch,
    toggleEstado,
  } = useDocumentacionContext();

  const tableColumns = useMemo(
    () => createDocumentacionTableColumns({ navigate, listNavState, refetch, toggleEstado }),
    [navigate, listNavState, refetch, toggleEstado],
  );

  const nuevoDocumentoAction = (
    <ActionButton
      permiso="configuracion.documentacion"
      accion="CREAR"
      variant="primary"
      icon={<PlusOutlined />}
      onClick={() => navigate(documentacionNuevaPath, { state: listNavState })}
    >
      Nuevo documento
    </ActionButton>
  );

  return (
    <PageTemplate header={<PageHeader title="Documentación" breadcrumbItems={BREADCRUMB} />} sidebar={null}>
      <Flex vertical gap={allSpacing.marginLG} style={{ width: '100%', minWidth: 0 }}>
        <section className="cfg-academico-workspace">
          <header className="cfg-academico-workspace__header">
            <ListPanelHeader title="Lista de documentos" actions={nuevoDocumentoAction} />
            <Paragraph type="secondary" className="cfg-academico-workspace__desc">
              Catálogo de tipos de documentos del instituto para todos los trámites (inscripción,
              becas, pasantías, titulación…): tipo, si es obligatorio, si acepta fotocopia y qué
              documento base reemplaza.
            </Paragraph>
          </header>
          <div className="cfg-academico-tab-panel">
            <TableListView
              embedded
              data={documentacion}
              loading={loading}
              error={error}
              searchText={searchText}
              onSearchChange={(e) => setSearchText(e.target.value)}
              searchPlaceholder="Buscar por nombre, tipo o descripción..."
              columns={tableColumns}
              rowKey={(record) => record.id}
              rowClassName={catalogoEstadoRowClassName}
              searchColSpan={10}
              searchStyle={{ maxWidth: 520 }}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Total: ${total} documentos`,
                pageSizeOptions: ['10', '20', '50', '100'],
              }}
              loadingTip="Cargando documentación..."
            />
          </div>
        </section>
      </Flex>
    </PageTemplate>
  );
};

export default DocumentacionListPage;
