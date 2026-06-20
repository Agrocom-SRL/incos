/**
 * ListDensityContext — canal por el que el template PUBLICA la densidad de la
 * tabla y los componentes de acción la LEEN (DIP/OCP).
 *
 * `ListDataView` envuelve la tabla con `<ListDensityProvider value={density}>`
 * usando la densidad calculada por `useResponsiveColumns`. Cualquier `RowActions`
 * dentro de la tabla se adapta sin que el feature pase la densidad a mano. Fuera
 * de la tabla (p. ej. la card) no hay provider → `useListDensity()` devuelve el
 * default 'full', así la card conserva su presentación completa.
 *
 * @typedef {'full'|'medium'|'compact'} ListDensity
 */
import { createContext, createElement, useContext } from 'react';

const ListDensityContext = createContext('full');

/**
 * Provider de densidad de la lista.
 * @param {{ value: ListDensity, children: React.ReactNode }} props
 */
export function ListDensityProvider({ value, children }) {
  return createElement(ListDensityContext.Provider, { value }, children);
}

/**
 * Lee la densidad publicada por el template.
 * @returns {ListDensity} 'full' si no hay provider.
 */
export function useListDensity() {
  return useContext(ListDensityContext);
}

export default ListDensityContext;
