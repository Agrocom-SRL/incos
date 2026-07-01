/**
 * Ordenamiento y paginación controlados sobre el dataset completo (antes de paginar en UI).
 */

import { useMemo, useState } from 'react';
import { getSorterFn, resolveColumnKey } from './tableSortUtils';
import {
  DATA_TABLE_PAGINATION_BASE,
  resolvePaginationSizeChanger,
} from '../paginationDefaults';

const defaultPaginationConfig = {
  defaultPageSize: 10,
  ...DATA_TABLE_PAGINATION_BASE,
};

/**
 * @param {Object} params
 * @param {Array} params.dataSource
 * @param {Array} params.columns
 * @param {Object|false} [params.pagination]
 * @param {Object} [params.defaultSort] - { field|columnKey, order: 'ascend'|'descend' }
 */
export const useClientTableSort = ({
  dataSource = [],
  columns = [],
  pagination = defaultPaginationConfig,
  defaultSort,
}) => {
  const initialSortKey = defaultSort?.field ?? defaultSort?.columnKey ?? null;
  const initialSortOrder = defaultSort?.order ?? null;

  const [sortState, setSortState] = useState(() =>
    initialSortKey && initialSortOrder
      ? { columnKey: initialSortKey, order: initialSortOrder }
      : null,
  );

  const [pagState, setPagState] = useState(() => ({
    current: 1,
    pageSize: pagination?.defaultPageSize ?? pagination?.pageSize ?? 10,
  }));

  const sortedData = useMemo(() => {
    const source = [...dataSource];
    if (!sortState?.columnKey || !sortState?.order) return source;

    const col = columns.find((c) => resolveColumnKey(c) === sortState.columnKey);
    const compare = col ? getSorterFn(col) : null;
    if (!compare) return source;

    source.sort((a, b) => {
      const result = compare(a, b);
      return sortState.order === 'descend' ? -result : result;
    });
    return source;
  }, [dataSource, sortState, columns]);

  const serverSide = pagination?.serverPagination === true;

  // En modo server-side `pagState` NUNCA se actualiza (el branch server de
  // `onChange` no hace `setPagState`), así que la numeración (#) debe derivar de
  // los valores del servidor (`pagination.current`/`pagination.pageSize`). En
  // client-side se mantiene el `pagState` interno como hasta ahora.
  const rowOffset = serverSide
    ? ((Number(pagination?.current) || 1) - 1) * (Number(pagination?.pageSize) || pagState.pageSize)
    : (pagState.current - 1) * pagState.pageSize;

  // Orden vigente en server-side ({ field, order: 'ASC'|'DESC' }) para reflejar
  // la flecha de orden de forma controlada (la fuente de verdad es el provider).
  const serverSort = serverSide ? pagination?.sort ?? null : null;

  const tableColumns = useMemo(
    () =>
      columns.map((col) => {
        const colKey = resolveColumnKey(col);
        let sortOrder = null;
        // Columnas con orden server-side (declaran `sortField`): la flecha la
        // controla el estado del provider (`serverSort`).
        if (serverSide && col.sortField != null) {
          if (serverSort?.field && col.sortField === serverSort.field) {
            sortOrder = serverSort.order === 'ASC' ? 'ascend' : 'descend';
          }
        } else if (sortState?.columnKey === colKey) {
          // Orden client-side (también server-side sin `sortField`).
          sortOrder = sortState.order;
        }
        const next = { ...col, sortOrder };
        if (colKey === 'nro' && typeof col.render === 'function') {
          next.render = (value, record, index) =>
            col.render(value, record, index, rowOffset);
        }
        return next;
      }),
    [columns, sortState, rowOffset, serverSide, serverSort],
  );

  const mergedPagination =
    pagination === false
      ? false
      : serverSide
        ? {
            ...defaultPaginationConfig,
            ...pagination,
            showSizeChanger: resolvePaginationSizeChanger(
              pagination?.showSizeChanger ?? defaultPaginationConfig.showSizeChanger,
            ),
            onChange: (page, pageSize) => {
              pagination?.onChange?.(page, pageSize);
            },
          }
        : {
            ...defaultPaginationConfig,
            ...pagination,
            showSizeChanger: resolvePaginationSizeChanger(
              pagination?.showSizeChanger ?? defaultPaginationConfig.showSizeChanger,
            ),
            current: pagState.current,
            pageSize: pagState.pageSize,
            onChange: (page, pageSize) => {
              setPagState({ current: page, pageSize });
              pagination?.onChange?.(page, pageSize);
            },
          };

  const handleTableChange = (pag, _filters, sorter, onChange) => {
    const s = Array.isArray(sorter) ? sorter[0] : sorter;

    // ── Orden SERVER-SIDE (opt-in por columna) ────────────────────────────
    // Solo se delega el orden al servidor cuando la columna declara `sortField`
    // (campo de vista) y el provider expone `onSortChange`. Así NO se ordena la
    // página visible en cliente, sino que el provider recarga el dataset completo
    // ordenado. Las tablas server-side que NO declaran `sortField` (docentes,
    // estudiantes, pagos legacy) conservan el orden client-side de siempre.
    const sortedColumnKey = s?.columnKey ?? s?.field ?? null;
    const sortedCol =
      sortedColumnKey != null
        ? columns.find((c) => resolveColumnKey(c) === sortedColumnKey)
        : null;
    const onSortChange = pagination?.onSortChange;
    const useServerSort =
      serverSide && typeof onSortChange === 'function' && sortedCol?.sortField != null;

    if (useServerSort) {
      const order = s.order === 'ascend' ? 'ASC' : s.order === 'descend' ? 'DESC' : null;
      onSortChange(order ? { field: sortedCol.sortField, order } : null);
      onChange?.(pag, _filters, sorter);
      return;
    }

    // ── Modo client-side (comportamiento original; también server sin sortField) ──
    if (pag?.current != null || pag?.pageSize != null) {
      setPagState({
        current: pag.current ?? pagState.current,
        pageSize: pag.pageSize ?? pagState.pageSize,
      });
    }

    if (s?.order) {
      // Clic con dirección explícita (asc/desc).
      const columnKey = s.columnKey ?? s.field;
      setSortState({ columnKey, order: s.order });
      if (pag?.current == null) {
        setPagState((prev) => ({ ...prev, current: 1 }));
      }
    } else if (s) {
      // AntD "cancela" el orden en el 3er clic (order nulo y, a veces, sin columnKey):
      // en vez de limpiarlo, alternamos asc↔desc sobre la columna que ya estaba
      // ordenada (estado previo) para que el orden NUNCA se pierda al hacer clic.
      setSortState((prev) =>
        prev
          ? { columnKey: prev.columnKey, order: prev.order === 'ascend' ? 'descend' : 'ascend' }
          : prev,
      );
    }

    onChange?.(pag, _filters, sorter);
  };

  return {
    sortedData,
    tableColumns,
    mergedPagination,
    handleTableChange,
    pagState,
    sortState,
  };
};
