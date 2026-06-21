/**
 * useResponsiveTable — encapsula la MEDICIÓN + HISTÉRESIS + decisión de columnas
 * de la tabla responsive del template `ListPage`.
 *
 * SRP: este hook resuelve "qué columnas caben y con qué densidad en el ancho REAL
 * del contenedor". Componer la `<Table>` con el resultado es de `ListDataView`;
 * la regla pura de cabida vive en `useResponsiveColumns` (función pura, no hook).
 *
 * Mide el ancho REAL del contenedor de la tabla (encoge con el sidebar), no el
 * del viewport: la tabla muestra lo que cabe en su propio espacio. Usa una
 * callback-ref (`useElementWidth`) porque el nodo medido vive dentro de un
 * `<AnimatePresence>` y solo aparece cuando entran los datos (tras el 1.er render
 * con loading=true): la callback-ref se engancha exactamente cuando React monta
 * ese nodo; un `useRef`+`useEffect` no re-correría y no observaría nunca.
 *
 * @param {Array<object>} columns  Columnas AntD enriquecidas con `minWidth`.
 * @param {'table'|'card'} viewMode Modo de vista; en 'card' no se mide (width→0).
 * @returns {{
 *   tableRef: (node: HTMLElement|null) => void,
 *   visibleColumns: object[],
 *   hiddenColumns: object[],
 *   density: 'full'|'medium'|'compact',
 * }}
 */
import { useRef } from 'react';
import { useElementWidth } from '@lib/hooks/useElementWidth';
import { useResponsiveColumns } from '../useResponsiveColumns';

export function useResponsiveTable(columns, viewMode) {
  // Callback-ref + ancho medido del contenedor (ver JSDoc: el nodo entra al DOM
  // dentro de un AnimatePresence tras el 1.er render).
  const [tableRef, containerWidth] = useElementWidth();

  // Resultado anterior para la HISTÉRESIS: al arrastrar/colapsar el sidebar el
  // ancho cruza un umbral por valores intermedios; pasar { density, hiddenKeys }
  // previos a la función pura crea una banda muerta para que una columna o la
  // densidad NO oscilen encendido/apagado en el borde (anti-parpadeo).
  const prevDecisionRef = useRef(null);

  // Solo aplica a la vista tabla; en card no se mide (containerWidth → default).
  // useResponsiveColumns es una función PURA (no un hook): se invoca siempre para
  // respetar las reglas de hooks; con width 0 devuelve todo visible / 'full'.
  const { visibleColumns, hiddenColumns, density } = useResponsiveColumns(
    columns,
    viewMode === 'table' ? containerWidth : 0,
    prevDecisionRef.current,
  );

  // Memoriza la decisión para el siguiente render (input de la histéresis). Se
  // hace EN EL CUERPO del render (NO en un efecto) a propósito: así el render N+1
  // ve la decisión sin desfase de un tick, que es lo que evita el parpadeo en el
  // borde (un useEffect aplicaría la histéresis un render tarde y reintroduciría
  // el toggle). La función sigue siendo pura: el ref solo guarda su salida, no la
  // altera ni se lee dentro del mismo render que la escribe.
  prevDecisionRef.current = {
    density,
    hiddenKeys: hiddenColumns.map((c) => c.key),
  };

  return { tableRef, visibleColumns, hiddenColumns, density };
}

export default useResponsiveTable;
