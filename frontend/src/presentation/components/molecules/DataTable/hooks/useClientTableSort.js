/**
 * Ordenamiento y paginación controlados sobre el dataset completo (antes de paginar en UI).
 */

import { useMemo, useState } from 'react';
import { getSorterFn, resolveColumnKey } from './tableSortUtils';

const defaultPaginationConfig = {
  defaultPageSize: 10,
  showSizeChanger: true,
  showQuickJumper: false,
  showTotal: (total, range) => `Mostrando ${range[0]}-${range[1]} de ${total} registros`,
  pageSizeOptions: ['10', '20', '50', '100'],
  locale: { items_per_page: 'registros / página' },
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

  const rowOffset = (pagState.current - 1) * pagState.pageSize;

  const tableColumns = useMemo(
    () =>
      columns.map((col) => {
        const colKey = resolveColumnKey(col);
        const isSorted = sortState?.columnKey === colKey;
        const next = {
          ...col,
          sortOrder: isSorted ? sortState.order : null,
        };
        if (colKey === 'nro' && typeof col.render === 'function') {
          next.render = (value, record, index) =>
            col.render(value, record, index, rowOffset);
        }
        return next;
      }),
    [columns, sortState, rowOffset],
  );

  const mergedPagination =
    pagination === false
      ? false
      : {
          ...defaultPaginationConfig,
          ...pagination,
          current: pagState.current,
          pageSize: pagState.pageSize,
          onChange: (page, pageSize) => {
            setPagState({ current: page, pageSize });
            pagination?.onChange?.(page, pageSize);
          },
        };

  const handleTableChange = (pag, _filters, sorter, onChange) => {
    if (pag?.current != null || pag?.pageSize != null) {
      setPagState({
        current: pag.current ?? pagState.current,
        pageSize: pag.pageSize ?? pagState.pageSize,
      });
    }

    const s = Array.isArray(sorter) ? sorter[0] : sorter;
    if (s && (s.columnKey != null || s.field != null)) {
      const columnKey = s.columnKey ?? s.field;
      if (s.order) {
        setSortState({ columnKey, order: s.order });
        if (pag?.current == null) {
          setPagState((prev) => ({ ...prev, current: 1 }));
        }
      } else {
        setSortState(null);
      }
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
