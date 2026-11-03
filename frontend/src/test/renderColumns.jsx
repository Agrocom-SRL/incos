/**
 * Helpers de prueba para las fábricas `create…Columns` de las tablas de presentación.
 *
 * Una columna de AntD es `{ title, dataIndex?, key, render?(valor, registro, índice, offset) }`;
 * `renderCells` ejecuta el `render` de cada columna hoja contra un registro y devuelve el texto
 * resultante por `key`, de modo que las pruebas afirman lo visible (sin red ni snapshots).
 */
import { renderWithProviders } from './renderWithProviders';

/** Aplana columnas agrupadas (`children`) a sus hojas. */
export const flattenColumns = (columns) =>
  columns.flatMap((c) => (Array.isArray(c.children) ? flattenColumns(c.children) : [c]));

/** Busca una columna hoja por `key` (o `dataIndex`). */
export const findColumn = (columns, key) =>
  flattenColumns(columns).find((c) => c.key === key || c.dataIndex === key);

/**
 * Renderiza el contenido de una celda y devuelve `{ text, container, ...utilidades de render }`.
 * Si la columna no tiene `render`, usa el valor crudo del registro.
 */
export function renderCell(column, record, { index = 0, rowOffset = 0, ...options } = {}) {
  const value = column.dataIndex ? record?.[column.dataIndex] : undefined;
  const node = column.render ? column.render(value, record, index, rowOffset) : value;
  const view = renderWithProviders(<>{node ?? null}</>, options);
  return { ...view, text: view.container.textContent };
}

/**
 * Renderiza todas las celdas hoja de un registro. Devuelve `{ [key]: texto }`.
 * Cada celda se desmonta antes de la siguiente para no mezclar el DOM.
 */
export function renderCells(columns, record, options = {}) {
  const out = {};
  flattenColumns(columns).forEach((column, i) => {
    const { text, unmount } = renderCell(column, record, options);
    out[column.key ?? column.dataIndex ?? i] = text;
    unmount();
  });
  return out;
}
