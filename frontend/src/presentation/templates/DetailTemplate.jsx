// src/presentation/templates/DetailTemplate.jsx
/**
 * DetailTemplate — plantilla ABM de FICHA / DETALLE.
 *
 * Atomic Design: TEMPLATE. COMPONE organismos existentes:
 *   PageTemplate
 *     └─ PageHeader (breadcrumb + título + acciones)
 *     └─ DetailPageShell (estados loading/error/vacío — NO se reimplementan aquí)
 *          ├─ DetailProfileCard (cabecera de ficha)
 *          └─ tabs ? DetailTabsPanel : children
 *
 * DIP: la page inyecta los datos ya mapeados (`profile`, `tabs`/`children`) y
 * las flags de estado. La plantilla solo orquesta el layout.
 *
 * @module presentation/templates/DetailTemplate
 * @param {{
 *   breadcrumbItems?: Array,
 *   title?: string,                 // título de PageHeader
 *   pageActions?: React.ReactNode,  // acciones de cabecera de página
 *   loading?: boolean,
 *   error?: React.ReactNode,
 *   onRetry?: () => void,
 *   showEmpty?: boolean,
 *   emptyDescription?: string,
 *   profile?: object,               // props para DetailProfileCard
 *   tabs?: Array,                   // items para DetailTabsPanel (si se usan tabs)
 *   activeKey?: string,
 *   onTabChange?: (key: string) => void,
 *   children?: React.ReactNode,     // contenido cuando no hay tabs
 *   sidebar?: React.ReactNode,
 * }} props
 */

import PageTemplate from './PageTemplate';
import { PageHeader } from '@molecules';
import { DetailPageShell, DetailProfileCard, DetailTabsPanel } from '@organisms';

const DetailTemplate = ({
  breadcrumbItems,
  title,
  pageActions,
  loading = false,
  error,
  onRetry,
  showEmpty = false,
  emptyDescription,
  profile,
  tabs,
  activeKey,
  onTabChange,
  children,
  sidebar,
}) => (
  <PageTemplate
    header={
      <PageHeader
        title={title}
        breadcrumbItems={breadcrumbItems}
        actions={pageActions}
      />
    }
    sidebar={sidebar}
  >
    <DetailPageShell
      loading={loading}
      error={error}
      onRetry={onRetry}
      showEmpty={showEmpty}
      emptyDescription={emptyDescription}
    >
      {profile ? <DetailProfileCard {...profile} /> : null}
      {tabs ? (
        <DetailTabsPanel items={tabs} activeKey={activeKey} onChange={onTabChange} />
      ) : (
        children
      )}
    </DetailPageShell>
  </PageTemplate>
);

export default DetailTemplate;
