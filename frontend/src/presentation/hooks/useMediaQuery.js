import { useEffect, useState } from 'react';

/**
 * Hook compartido para evaluar media queries CSS en React.
 * Promovido desde modules/matricula-v2/hooks/ para uso global.
 *
 * @param {string} query Media query CSS (ej. '(max-width: 900px)')
 * @returns {boolean} true cuando la query coincide
 */
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(query).matches : false,
  );

  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = (e) => setMatches(e.matches);
    setMatches(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}

export default useMediaQuery;
