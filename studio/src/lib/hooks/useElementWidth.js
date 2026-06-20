/**
 * useElementWidth() — mide el ancho (px) de un elemento y se actualiza cuando ese
 * elemento cambia de tamaño. Devuelve `[ref, width]`: una **callback-ref** que se
 * pasa al elemento a medir y el ancho actual.
 *
 * SRP: SOLO mide. Es genérico (no sabe nada de tablas ni del dominio) y
 * reutilizable por cualquier componente que necesite reaccionar al ancho de su
 * propio contenedor —no del viewport— a diferencia de `useMediaQuery`.
 *
 * Por qué callback-ref (no `useRef` + `useEffect([ref])`):
 *   Cuando el nodo a medir vive dentro de `<AnimatePresence>` (u otra rama que
 *   aparece DESPUÉS del primer render), un `useEffect([ref])` con `ref` = objeto
 *   `useRef` (identidad estable) corre UNA sola vez al montar, cuando aún no hay
 *   nodo (`ref.current = null`), y NO vuelve a correr al asignarse el nodo → el
 *   `ResizeObserver` nunca se adjunta. Una callback-ref se invoca con el nodo REAL
 *   en cuanto React lo monta o lo desmonta, así que la medición se engancha
 *   exactamente cuando el nodo existe, aunque aparezca tras el primer render.
 *
 * Por qué `ResizeObserver` + `requestAnimationFrame`:
 *   El observer puede disparar varias notificaciones en el mismo frame; escribir
 *   estado directamente en su callback provoca el aviso
 *   "ResizeObserver loop completed with undelivered notifications". Gateamos la
 *   actualización en un rAF para coalescer las mediciones a una por frame.
 *
 * Limpieza: cancela el rAF pendiente y desconecta el observer cuando el nodo se
 * desmonta o cambia (la callback-ref se invoca con `null`).
 *
 * @returns {[(node: HTMLElement|null) => void, number]} `[ref, width]` — la
 *   callback-ref para el elemento a medir y su ancho en px (0 antes de medir).
 */
import { useCallback, useRef, useState } from 'react';

export function useElementWidth() {
  const [width, setWidth] = useState(0);
  // Guardamos el observer + el rAF pendiente para poder limpiarlos al cambiar el
  // nodo sin re-renderizar (no entran en el render → ref, no state).
  const observerRef = useRef(null);
  const frameRef = useRef(0);

  const ref = useCallback((node) => {
    // Desengancha la observación anterior (nodo previo o desmontaje).
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = 0;
    }
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }

    if (!node || typeof ResizeObserver === 'undefined') return;

    const observer = new ResizeObserver((entries) => {
      // Coalescer todas las notificaciones del frame en una sola escritura.
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      frameRef.current = requestAnimationFrame(() => {
        const entry = entries[entries.length - 1];
        if (entry) setWidth(entry.contentRect.width);
      });
    });

    observer.observe(node);
    observerRef.current = observer;
    // Medición inicial síncrona (el observer ya emite una al observar, pero esto
    // evita un primer frame con 0 si el layout ya está listo).
    setWidth(node.getBoundingClientRect().width);
  }, []);

  return [ref, width];
}

export default useElementWidth;
