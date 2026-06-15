import { useEffect } from 'react';

const esCampoEditable = (target) => {
  if (!target || typeof target !== 'object') return false;
  const el = target;
  const tag = el.tagName?.toLowerCase();
  if (tag === 'input' || tag === 'textarea' || tag === 'select') return true;
  if (el.isContentEditable) return true;
  return Boolean(el.closest?.('[contenteditable="true"]'));
};

/**
 * Flechas ← → para cambiar de bimestre (misma lógica que los botones del pager).
 */
export function useBimestrePagerTeclado({
  habilitado = true,
  puedeAnterior,
  puedeSiguiente,
  onAnterior,
  onSiguiente,
}) {
  useEffect(() => {
    if (!habilitado) return undefined;

    const onKeyDown = (event) => {
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
      if (esCampoEditable(event.target)) return;

      if (event.key === 'ArrowLeft') {
        if (!puedeAnterior) return;
        event.preventDefault();
        onAnterior?.();
        return;
      }
      if (event.key === 'ArrowRight') {
        if (!puedeSiguiente) return;
        event.preventDefault();
        onSiguiente?.();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [habilitado, puedeAnterior, puedeSiguiente, onAnterior, onSiguiente]);
}
