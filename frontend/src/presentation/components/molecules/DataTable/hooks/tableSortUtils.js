/**
 * Utilidades de ordenamiento para DataTable (cliente, dataset completo).
 */

export const resolveColumnKey = (col) => col.key ?? col.dataIndex;

export const getSorterFn = (col) => {
  if (typeof col.sortCompare === 'function') return col.sortCompare;
  if (typeof col.sorter === 'function') return col.sorter;
  if (col.sorter === true && col.dataIndex) {
    return (a, b) =>
      String(a[col.dataIndex] ?? '').localeCompare(String(b[col.dataIndex] ?? ''), 'es', {
        sensitivity: 'base',
        numeric: true,
      });
  }
  return null;
};
