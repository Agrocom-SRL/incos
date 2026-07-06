/**
 * Listado de documentación de UN tipo (inscripción/becas/pasantías/traslado).
 * Página completa (patrón `DocentesList`/CFG académico), no un tab: cada tipo
 * tiene su propia URL y permiso. Recibe `tipoConfig` (constante, no
 * seleccionable por el usuario) desde el conector.
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
import { allSpacing } from '@theme/tokens';
import '@configuracion/academico/styles/academico-form-page.css';

const { Paragraph } = Typography;

const DocumentacionListPage = ({ tipoConfig }) => {
  const navigate = useNavigate();
  const { tipoKey, permisoCodigo, label, entidadLabel } = tipoConfig;
  const listNavState = useMemo(() => documentacionListNavigationState(tipoKey), [tipoKey]);

  const {
    documentacion = [],
    loading = false,
    error = null,
    searchText = '',
    setSearchText,
    refetch,
  } = useDocumentacionContext();

  const tableColumns = useMemo(
    () =>
      createDocumentacionTableColumns({
        navigate,
        listNavState,
        refetch,
        tipoKey,
        entidad: entidadLabel,
      }),
    [navigate, listNavState, refetch, tipoKey, entidadLabel],
  );

  const breadcrumbItems = useMemo(
    () => [
      { title: 'Inicio', href: '/' },
      { title: 'Configuración', href: '/configuracion' },
      { title: 'Documentación' },
      { title: label },
    ],
    [label],
  );

  const nuevoDocumentoAction = (
    <ActionButton
      permiso={permisoCodigo}
      accion="CREAR"
      variant="primary"
      icon={<PlusOutlined />}
      onClick={() => navigate(documentacionNuevaPath(tipoKey), { state: listNavState })}
    >
      Nuevo documento
    </ActionButton>
  );

  return (
    <PageTemplate
      header={<PageHeader title={`Documentación · ${label}`} breadcrumbItems={breadcrumbItems} />}
      sidebar={null}
    >
      <Flex vertical gap={allSpacing.marginLG} style={{ width: '100%', minWidth: 0 }}>
        <section className="cfg-academico-workspace">
          <header className="cfg-academico-workspace__header">
            <ListPanelHeader title={`Lista de documentos · ${label}`} actions={nuevoDocumentoAction} />
            <Paragraph type="secondary" className="cfg-academico-workspace__desc">
              Documentos requeridos en el trámite de {label.toLowerCase()}: orden, si es obligatorio y si
              acepta fotocopia.
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
              searchPlaceholder="Buscar por nombre o descripción..."
              columns={tableColumns}
              rowKey={(record) => record.id}
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
