import { useCallback, useEffect, useState } from 'react';

const QUERY = '(max-width: 767px)';

/**
 * Navegación móvil: sidebar oculto por defecto, overlay al abrir menú.
 */
export function useMobileNav() {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(QUERY).matches : false,
  );
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(QUERY);
    const onChange = (e) => {
      setIsMobile(e.matches);
      if (!e.matches) setNavOpen(false);
    };
    setIsMobile(mq.matches);
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
