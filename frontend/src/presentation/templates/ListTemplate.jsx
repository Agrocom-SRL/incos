// src/presentation/templates/ListTemplate.jsx
/**
 * ListTemplate — plantilla ABM de LISTADO.
 *
 * Atomic Design: TEMPLATE. COMPONE organismos/moléculas existentes; NO
 * reimplementa tabla, búsqueda ni paginación (eso vive en TableListView).
 *
 * Replica el shell de referencia del catálogo académico (CFG Académico):
 *   PageTemplate
 *     └─ PageHeader (breadcrumb + título + acciones)
 *     └─ section.cfg-academico-workspace
 *          ├─ header.cfg-academico-workspace__header → ListPanelHeader
 *          ├─ .cfg-academico-workspace__desc (descripción opcional)
 *          └─ .cfg-academico-tab-panel → TableListView embedded
 *
 * DIP: la page inyecta `tableProps` (datos, columnas, búsqueda) y construye
 * `primaryAction`/`emptyState` con permisos. La plantilla solo orquesta el layout.
 *
 * @module presentation/templates/ListTemplate
 * @param {{
 *   breadcrumbItems?: Array,        // items del breadcrumb de PageHeader
 *   pageTitle?: string,             // título de la página (PageHeader)
 *   pageActions?: React.ReactNode,  // acciones de cabecera de página (opcional)
 *   panelTitle?: string,            // título del panel de listado (ListPanelHeader)
 *   panelDescription?: React.ReactNode, // descripción bajo el título del panel
 *   primaryAction?: React.ReactNode,    // acción principal del panel (ya con permisos)
 *   tableProps?: object,            // props pasadas a TableListView (embedded)
 *   emptyState?: React.ReactNode,   // estado vacío (la page lo construye)
 *   sidebar?: React.ReactNode,      // sidebar opcional de PageTemplate
 * }} props
 */

import PageTemplate from './PageTemplate';
import { PageHeader, ListPanelHeader } from '@molecules';
import { TableListView } from '@organisms';
import '@configuracion/academico/styles/academico-form-page.css';

const ListTemplate = ({
  breadcrumbItems,
  pageTitle,
  pageActions,
  panelTitle,
  panelDescription,
  primaryAction,
  tableProps = {},
  emptyState,
  sidebar,
}) => (
  <PageTemplate
    header={
      <PageHeader
        title={pageTitle}
        breadcrumbItems={breadcrumbItems}
        actions={pageActions}
      />
    }
    sidebar={sidebar}
  >
    <section className="cfg-academico-workspace">
      <header className="cfg-academico-workspace__header">
        <ListPanelHeader title={panelTitle} actions={primaryAction} />
        {panelDescription ? (
          <p className="cfg-academico-workspace__desc">{panelDescription}</p>
        ) : null}
      </header>

      <div className="cfg-academico-tab-panel">
        <TableListView embedded emptyState={emptyState} {...tableProps} />
      </div>
    </section>
  </PageTemplate>
);

export default ListTemplate;
