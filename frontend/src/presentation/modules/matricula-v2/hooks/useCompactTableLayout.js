import { useEffect, useState } from 'react';

const QUERY = '(max-width: 1199px)';

/**
 * En viewports estrechos la tabla usa columnas reducidas + filas expandibles.
 */
export function useCompactTableLayout() {
  const [compact, setCompact] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(QUERY).matches : false,
  );

  useEffect(() => {
    const mq = window.matchMedia(QUERY);
    const onChange = (e) => setCompact(e.matches);
    setCompact(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return compact;
}
