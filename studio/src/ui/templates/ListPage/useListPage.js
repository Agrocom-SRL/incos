/**
 * useListPage — lógica genérica de cualquier pantalla de listado homogéneo.
 *
 * Responsabilidad ÚNICA: orquestar datos (fetch+adapt desde config), derivar KPIs
 * (por selectores de config), facetas/chips (por accessor), aplicar search + filtros
 * declarativos, paginar y manejar selección. NO renderiza. Generaliza 1:1 la lógica
 * de useEnrollmentsList: la page consume este hook (DIP) y compone con ListPage.
 *
 * @see ./ListPage.jsx para el shape completo de `config`.
 */
import { useEffect, useMemo, useState } from 'react';

const noop = () => {};

/**
 * @param {import('./ListPage').ListPageConfig} config
 */
export function useListPage(config) {
  const {
    fetch,
    adapt,
    kpis: kpiDefs = [],
    facets: facetsDef = null,
    search: searchDef = null,
    filters: filterDefs = [],
    pageSize: initialPageSize = 10,
  } = config;

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearchState] = useState('');
  const [facetValue, setFacetValueState] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [viewMode, setViewMode] = useState('table');
  const [selectedFacetForExport, setSelectedFacetForExport] = useState(null);

  // Estado de cada filtro declarativo, inicializado a su defaultValue (o null).
  const [filterValues, setFilterValues] = useState(() =>
    Object.fromEntries(filterDefs.map((f) => [f.key, f.defaultValue ?? null])),
  );

  // --- Carga de datos (fetch + adapt desde config) ---
  useEffect(() => {
    let alive = true;
    setLoading(true);
    Promise.resolve(fetch())
      .then((res) => {
        if (!alive) return;
        setRows(adapt(res?.data ?? res));
        setError(null);
      })
      .catch((e) => {
        if (alive) setError(e?.message || 'Error');
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
    // fetch/adapt provienen de la config (estable durante la vida de la pantalla).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- KPIs por selectores de config ---
  const kpiValues = useMemo(
    () =>
      kpiDefs.map((k) => ({
        key: k.key,
        labelKey: k.labelKey,
        icon: k.icon,
        accent: k.accent,
        value: k.select(rows),
        sub: k.subKey
          ? { key: k.subKey, params: k.subParams ? k.subParams(rows, k.select(rows)) : undefined }
          : undefined,
      })),
    [kpiDefs, rows],
  );

  // --- Facetas/chips por accessor ---
  const facets = useMemo(() => {
    if (!facetsDef) return [];
    const idOf = facetsDef.idAccessor || ((v) => v.id);
    const labelOf = facetsDef.labelAccessor || ((v) => v.name);
    const colorOf = facetsDef.colorAccessor || ((v) => v.color);
    const map = new Map();
    rows.forEach((r) => {
      const facet = facetsDef.accessor(r);
      if (facet == null) return;
      const id = idOf(facet);
      const prev = map.get(id);
      if (prev) prev.count += 1;
      else map.set(id, { id, label: labelOf(facet), color: colorOf(facet), count: 1 });
    });
    return Array.from(map.values());
  }, [facetsDef, rows]);

  // --- Filtrado (faceta + filtros declarativos + search) ---
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const idOf = facetsDef?.idAccessor || ((v) => v.id);
    return rows.filter((r) => {
      if (facetsDef && facetValue != null) {
        const facet = facetsDef.accessor(r);
        if (!facet || idOf(facet) !== facetValue) return false;
      }
      for (const f of filterDefs) {
        if (!f.predicate(r, filterValues[f.key])) return false;
      }
      if (!q) return true;
      return searchDef
        ? searchDef.fields.some((field) => String(field(r) ?? '').toLowerCase().includes(q))
        : true;
    });
  }, [rows, search, facetValue, facetsDef, filterDefs, filterValues, searchDef]);

  const paged = useMemo(
    () => filtered.slice((page - 1) * pageSize, page * pageSize),
    [filtered, page, pageSize],
  );

  // --- Estado de filtros (¿hay alguno activo?) + limpieza total ---
  const hasFilters =
    Boolean(search) ||
    facetValue != null ||
    filterDefs.some((f) => filterValues[f.key] !== (f.defaultValue ?? null));

  const clearFilters = () => {
    setSearchState('');
    setFacetValueState(null);
    setFilterValues(Object.fromEntries(filterDefs.map((f) => [f.key, f.defaultValue ?? null])));
    setPage(1);
  };

  // Setters con reset de página (mismo comportamiento que useEnrollmentsList).
  const setSearch = (v) => {
    setSearchState(v);
    setPage(1);
  };
  const setFacetValue = (v) => {
    setFacetValueState(v);
    setPage(1);
  };
  const setFilterValue = (key, v) => {
    setFilterValues((prev) => ({ ...prev, [key]: v }));
    setPage(1);
  };

  // --- Acciones masivas / export (mock: no-op / console hasta integrar backend) ---
  const onBulkNotify = () => console.info('[bulk] notify', selectedRowKeys);
  const onBulkExport = () => console.info('[bulk] export', selectedRowKeys);
  const onBulkDelete = () => console.info('[bulk] delete', selectedRowKeys);

  const facetSelectOptions = useMemo(
    () => facets.map((f) => ({ value: f.id, label: f.label, color: f.color })),
    [facets],
  );
  const onExport = () => console.info('[export] facet', selectedFacetForExport);

  return {
    loading,
    error,
    kpiValues,
    facets,
    filtered,
    paged,
    search,
    setSearch,
    facetValue,
    setFacetValue,
    filterValues,
    setFilterValue,
    page,
    setPage,
    pageSize,
    setPageSize,
    hasFilters,
    clearFilters,
    selectedRowKeys,
    setSelectedRowKeys,
    viewMode,
    setViewMode,
    facetSelectOptions,
    selectedFacetForExport,
    setSelectedFacetForExport,
    onExport,
    onBulkNotify,
    onBulkExport,
    onBulkDelete,
  };
}

export { noop };
export default useListPage;
