/**
 * useMobileNav — gobierna el drawer del sidebar en móvil.
 * SRP: estado de apertura + detección de viewport; cierra al pasar a desktop.
 */
import { useCallback, useEffect, useState } from 'react';
import { useMediaQuery } from './useMediaQuery';

export function useMobileNav() {
  const isMobile = useMediaQuery('(max-width: 767px)');
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    if (!isMobile) setNavOpen(false);
  }, [isMobile]);

  const toggleNav = useCallback(() => setNavOpen((o) => !o), []);
  const closeNav = useCallback(() => setNavOpen(false), []);

  return { isMobile, navOpen, toggleNav, closeNav };
}

export default useMobileNav;
