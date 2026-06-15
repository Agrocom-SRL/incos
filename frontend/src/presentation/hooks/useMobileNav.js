import { useCallback, useEffect, useState } from 'react';

const QUERY = '(max-width: 767px)';

/**
 * Navegación móvil del shell global: sidebar oculto por defecto, overlay (drawer)
 * al abrir el menú. Bloquea el scroll del body mientras el drawer está abierto.
 * Réplica del comportamiento de matricula-v2 (useMobileNav) a capa compartida.
 *
 * @returns {{ isMobile: boolean, navOpen: boolean, openNav: () => void, closeNav: () => void, toggleNav: () => void }}
 */
export function useMobileNav() {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(QUERY).matches : false,
  );
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    // El valor inicial ya lo fija el inicializador de useState; aquí solo
    // suscribimos cambios (evita set-state directo en el efecto).
    const mq = window.matchMedia(QUERY);
    const onChange = (e) => {
      setIsMobile(e.matches);
      if (!e.matches) setNavOpen(false);
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    if (!isMobile || !navOpen) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isMobile, navOpen]);

  const openNav = useCallback(() => setNavOpen(true), []);
  const closeNav = useCallback(() => setNavOpen(false), []);
  const toggleNav = useCallback(() => setNavOpen((o) => !o), []);

  return { isMobile, navOpen, openNav, closeNav, toggleNav };
}

export default useMobileNav;
