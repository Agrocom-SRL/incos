/**
 * ListPage — molde único de pantalla de listado homogéneo (config + slots).
 *
 * Responsabilidad ÚNICA: orquestar useListPage(config) y COMPONER las secciones en
 * el orden canónico. Toda la mecánica (fetch/adapt/KPIs/facetas/search/filtros/
 * paginación/selección/viewMode) vive en useListPage; la presentación específica de
 * cada feature entra por SLOTS (headerActions/cardRender/rowActions/bulkActions/...).
 *
 * Orden de secciones (NO negociable):
 *   PageHeader → ListKpiRow → ListFacets → ErrorState(cond.) → .mat-toolbar(ListFilterBar) → ListDataView
 *
 * NO importa nada de @features/* (acoplamiento prohibido): lo específico llega por slots.
 *
 * @typedef {Object} ListKpiDef
 * @property {string} key                          Identificador estable del KPI.
 * @property {string} labelKey                     Clave i18n del rótulo.
 * @property {React.ReactNode} icon                Icono del KPI.
 * @property {string} accent                       Color de acento (token/var CSS).
 * @property {(rows: object[]) => number} select   Selector del valor desde las filas.
 * @property {string} [subKey]                     Clave i18n del subtítulo (opcional).
 * @property {(rows: object[], value: number) => object} [subParams]  Params del subtítulo.
 *
 * @typedef {Object} ListFacetsDef
 * @property {(row: object) => object} accessor          Devuelve el objeto faceta de una fila.
 * @property {(facet: object) => (string|number)} [idAccessor]   Id de la faceta (def: f.id).
 * @property {(facet: object) => string} [labelAccessor]         Etiqueta (def: f.name).
 * @property {(facet: object) => string} [colorAccessor]         Color (def: f.color).
 * @property {string} allLabelKey                                Clave i18n del chip "Todas".
 *
 * @typedef {Object} ListSearchDef
 * @property {Array<(row: object) => string>} fields   Campos sobre los que se busca.
 * @property {string} placeholderKey                   Clave i18n del placeholder.
 *
 * @typedef {Object} ListFilterDef
 * @property {string} key                              Identificador del filtro.
 * @property {'segmented'|'select'} type               Control de UI.
 * @property {*} [defaultValue]                        Valor por defecto (def: null).
 * @property {string} [placeholderKey]                 Placeholder (select).
 * @property {boolean} [allowClear]                    allowClear del select (def: true).
 * @property {Array<{value:*, labelKey:string}>} options
 * @property {(row: object, value: *) => boolean} predicate
 *
 * @typedef {Object} ListPageConfig
 * @property {((t: Function) => object[])|object[]} breadcrumbs  Items de breadcrumb (o factory con t).
 * @property {string} titleKey
 * @property {string} subtitleKey
 * @property {(t: Function) => object} [headerI18nParams]        Params del subtítulo.
 * @property {() => Promise<{data:object[]}>|Promise<object[]>} fetch
 * @property {(raw: object[]) => object[]} adapt
 * @property {(row: object) => (string|number)} [getRowKey]     Def: r => r.id.
 * @property {ListKpiDef[]} [kpis]
 * @property {ListFacetsDef} [facets]
 * @property {ListSearchDef} search
 * @property {ListFilterDef[]} [filters]
 * @property {Array<'table'|'card'>} [views]                    Def: ['table'].
 * @property {(t: Function, rowActions: object) => object[]} columns   Factory de columnas AntD.
 * @property {number} [pageSize]
 * @property {string[]} [pageSizeOptions]
 * @property {string} [resultsLabelKey]                         Def: 'common.results'.
 * @property {string} [emptyTitleKey]                           Def: 'enrollments.states.emptyTitle'.
 * @property {string} [emptyHintKey]
 * @property {string} [clearFiltersLabelKey]
 * @property {string} [errorTitleKey]
 * @property {string} [newLabelKey]
 */
import { PageHeader } from '@ui/molecules/PageHeader/PageHeader';
import { ErrorState } from '@ui/molecules/ErrorState/ErrorState';
import { useTranslation } from '@lib/i18n/useTranslation';
import { useListPage } from './useListPage';
import { ListKpiRow } from './parts/ListKpiRow/ListKpiRow';
import { ListFacets } from './parts/ListFacets/ListFacets';
import { ListFilterBar } from './parts/ListFilterBar/ListFilterBar';
import { ListDataView } from './parts/ListDataView/ListDataView';
import './ListPage.css';

const defaultRowKey = (r) => r.id;
const noop = () => {};

/**
 * @param {{
 *   config: ListPageConfig,
 *   headerActions?: (api: object, t: Function) => React.ReactNode,
 *   cardRender?: (row: object, rowActions: object, t: Function) => React.ReactNode,
 *   rowActions?: object,
 *   bulkActions?: (selectedRowKeys: (string|number)[], api: object, t: Function) => React.ReactNode,
 *   facetsRender?: (api: object, t: Function) => React.ReactNode,
 *   skeleton?: (viewMode: 'table'|'card') => React.ReactNode,
 * }} props
 */
export function ListPage({
  config,
  headerActions,
  cardRender,
  rowActions,
  bulkActions,
  facetsRender,
  skeleton,
}) {
  const { t } = useTranslation();
  const api = useListPage(config);

  const getRowKey = config.getRowKey || defaultRowKey;
  const views = config.views || ['table'];
  const showViewToggle = views.length > 1;

  // rowActions se resuelve UNA vez (default noop) y se comparte por columnas y tarjeta.
  const resolvedRowActions = rowActions || {};
  const columns = config.columns(t, resolvedRowActions);

  // Breadcrumb: factory(t) o array literal.
  const breadcrumb =
    typeof config.breadcrumbs === 'function' ? config.breadcrumbs(t) : config.breadcrumbs;
  const headerParams = config.headerI18nParams ? config.headerI18nParams(t) : undefined;

  const bulkSlot = bulkActions ? bulkActions(api.selectedRowKeys, api, t) : null;

  return (
    <div className="mat-page">
      <PageHeader
        breadcrumb={breadcrumb}
        title={t(config.titleKey)}
        subtitle={config.subtitleKey ? t(config.subtitleKey, headerParams) : undefined}
        actions={headerActions ? headerActions(api, t) : undefined}
      />

      {config.kpis?.length ? <ListKpiRow kpiValues={api.kpiValues} /> : null}

      {config.facets
        ? facetsRender
          ? facetsRender(api, t)
          : (
            <ListFacets
              facets={api.facets}
              value={api.facetValue}
              onChange={api.setFacetValue}
              allLabelKey={config.facets.allLabelKey}
            />
          )
        : null}

      {api.error ? (
        <ErrorState title={t(config.errorTitleKey || 'enrollments.states.errorTitle')} description={api.error} />
      ) : null}

      <div className="mat-toolbar">
        <ListFilterBar
          search={api.search}
          onSearchChange={api.setSearch}
          searchPlaceholderKey={config.search?.placeholderKey}
          filters={config.filters}
          filterValues={api.filterValues}
          onFilterChange={api.setFilterValue}
          selectedCount={api.selectedRowKeys.length}
          bulkSlot={bulkSlot}
          showViewToggle={showViewToggle}
          viewMode={api.viewMode}
          onViewModeChange={api.setViewMode}
          filteredCount={api.filtered.length}
          resultsLabelKey={config.resultsLabelKey}
        />
      </div>

      <ListDataView
        loading={api.loading}
        columns={columns}
        paged={api.paged}
        filtered={api.filtered}
        viewMode={api.viewMode}
        getRowKey={getRowKey}
        renderCard={(row) => (cardRender ? cardRender(row, resolvedRowActions, t) : null)}
        selectedRowKeys={api.selectedRowKeys}
        setSelectedRowKeys={api.setSelectedRowKeys}
        onRowOpen={resolvedRowActions.onOpen || noop}
        hasFilters={api.hasFilters}
        onClearFilters={api.clearFilters}
        onNew={resolvedRowActions.onNew}
        newLabelKey={config.newLabelKey || 'enrollments.actions.newEnrollment'}
        emptyTitleKey={config.emptyTitleKey || 'enrollments.states.emptyTitle'}
        emptyHintKey={config.emptyHintKey || 'enrollments.states.emptyHint'}
        clearFiltersLabelKey={config.clearFiltersLabelKey || 'enrollments.states.clearFilters'}
        page={api.page}
        pageSize={api.pageSize}
        setPage={api.setPage}
        setPageSize={api.setPageSize}
        pageSizeOptions={config.pageSizeOptions}
        renderSkeleton={skeleton}
      />
    </div>
  );
}

export default ListPage;
