/**
 * Listado paginado en servidor: una página en memoria + búsqueda con debounce.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DEFAULT_LIST_LIMIT, DEFAULT_LIST_PAGE } from '@application/constants/listPagination';

const SEARCH_DEBOUNCE_MS = 400;

/** Límite para el modo `loadAll`: trae todas las filas y pagina/ordena en cliente. */
const LOAD_ALL_LIMIT = 10000;

function normalizePagination(result, page, pageSize) {
  const p = result?.pagination;
  return {
    current: Number(p?.page ?? page) || 1,
    pageSize: Number(p?.limit ?? pageSize) || DEFAULT_LIST_LIMIT,
    total: Number(p?.total ?? 0) || 0,
  };
}

/**
 * Convierte el estado de orden ({ field, order: 'ASC'|'DESC' }) al formato de
 * query que consume el backend ("campo:ASC"). Devuelve undefined si no hay orden.
 */
function buildSortParam(sort) {
  if (!sort?.field || !sort?.order) return undefined;
  return `${sort.field}:${sort.order}`;
}

/**
 * @param {Object} config
 * @param {Function} config.fetch - async (options) => result del createApiHook / repositorio
 * @param {Function} [config.buildRequest] - ({ page, limit, search, sort, extra }) => argumento para fetch
 *   `sort` llega ya serializado como "campo:ASC"/"campo:DESC" (o undefined).
 * @param {Function} [config.mapResponse] - normaliza { data: array, pagination } (p. ej. becas anidadas)
 * @param {Object} [config.extra] - filtros estables (carrera_id, etc.)
 * @param {number} [config.initialPageSize]
 * @param {boolean} [config.enabled=true]
 */
export function useServerPaginatedList({
  fetch,
  buildRequest = ({ page, limit, search }) => ({ params: { page, limit, search: search || undefined } }),
  mapResponse,
  extra = null,
  initialPageSize = DEFAULT_LIST_LIMIT,
  enabled = true,
  // Cuando es true, trae TODAS las filas (limit alto) y expone paginación de CLIENTE, de
  // modo que el orden/paginado se hace en el navegador sobre el dataset completo (no solo
  // la página visible). Búsqueda sigue siendo server-side (re-fetch con debounce).
  loadAll = false,
}) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [pagination, setPagination] = useState({
    current: DEFAULT_LIST_PAGE,
    pageSize: initialPageSize,
    total: 0,
  });
  // Orden server-side: { field, order: 'ASC'|'DESC' } | null. Retrocompatible:
  // si nadie cambia el orden, queda null y el request sale igual que antes.
  const [sort, setSort] = useState(null);

  const fetchSeq = useRef(0);
  const pageSizeRef = useRef(initialPageSize);
  // Espejo del orden vigente para que `load` lo lea sin recrear su identidad.
  const sortRef = useRef(null);
  const extraKey = extra == null ? '' : JSON.stringify(extra);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchText.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchText]);

  const load = useCallback(
    async (page, pageSize, search) => {
      if (!enabled || typeof fetch !== 'function') return;
      const seq = ++fetchSeq.current;
      setLoading(true);
      setError(null);
      try {
        const request = buildRequest({
          page: loadAll ? DEFAULT_LIST_PAGE : page,
          limit: loadAll ? LOAD_ALL_LIMIT : pageSize,
          search,
          sort: loadAll ? undefined : buildSortParam(sortRef.current),
          extra: extra ?? undefined,
        });
        const raw = await fetch(request);
        if (seq !== fetchSeq.current) return;
        const result = mapResponse ? mapResponse(raw) : raw;
        if (!result?.success) {
          setRows([]);
          setError(result?.error || 'Error al cargar el listado');
          setPagination((prev) => ({ ...prev, total: 0 }));
          return;
        }
        const data = Array.isArray(result.data) ? result.data : [];
        setRows(data);
        pageSizeRef.current = pageSize;
        setPagination(normalizePagination(result, page, pageSize));
      } catch (err) {
        if (seq !== fetchSeq.current) return;
        setRows([]);
        setError(err?.message || 'Error al cargar el listado');
      } finally {
        if (seq === fetchSeq.current) setLoading(false);
      }
    },
    [enabled, fetch, buildRequest, extraKey, loadAll],
  );

  /**
   * Cambia el orden server-side y recarga desde la página 1. `next` es
   * { field, order: 'ASC'|'DESC' } o null para quitar el orden. Idempotente:
   * si el orden no cambia, no dispara recarga.
   */
  const handleSortChange = useCallback(
    (next) => {
      const normalized = next?.field && next?.order ? { field: next.field, order: next.order } : null;
      const current = sortRef.current;
      const same =
        (current == null && normalized == null) ||
        (current != null &&
          normalized != null &&
          current.field === normalized.field &&
          current.order === normalized.order);
      if (same) return;
      sortRef.current = normalized;
      setSort(normalized);
      load(DEFAULT_LIST_PAGE, pageSizeRef.current, debouncedSearch);
    },
    [load, debouncedSearch],
  );

  useEffect(() => {
    if (!enabled) {
      setRows([]);
      setLoading(false);
      return;
    }
    load(DEFAULT_LIST_PAGE, pageSizeRef.current, debouncedSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- recarga al cambiar búsqueda/filtros
  }, [enabled, debouncedSearch, extraKey]);

  const tablePagination = useMemo(
    () =>
      loadAll
        ? {
            // Paginación de CLIENTE sobre todas las filas cargadas: el orden y el paginado
            // los resuelve la tabla (useClientTableSort) sobre el dataset completo.
            pageSize: DEFAULT_LIST_LIMIT >= 50 ? 10 : DEFAULT_LIST_LIMIT,
            showSizeChanger: true,
            showTotal: (total) => `Total: ${total} registros`,
            pageSizeOptions: ['10', '20', '50', '100'],
          }
        : {
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            serverPagination: true,
            showSizeChanger: true,
            showTotal: (total) => `Total: ${total} registros`,
            pageSizeOptions: ['10', '20', '50', '100'],
            onChange: (page, pageSize) => {
              load(page, pageSize, debouncedSearch);
            },
            // Orden server-side: estado vigente + callback para que la tabla notifique
            // el cambio de sorter (en vez de ordenar la página visible en cliente).
            sort,
            onSortChange: handleSortChange,
          },
    [loadAll, pagination.current, pagination.pageSize, pagination.total, load, debouncedSearch, sort, handleSortChange],
  );

  const refetch = useCallback(() => {
    load(pagination.current, pagination.pageSize, debouncedSearch);
  }, [load, pagination.current, pagination.pageSize, debouncedSearch]);

  return {
    rows,
    loading,
    error,
    searchText,
    setSearchText,
    tablePagination,
    refetch,
    pagination,
    sort,
    onSortChange: handleSortChange,
  };
}
