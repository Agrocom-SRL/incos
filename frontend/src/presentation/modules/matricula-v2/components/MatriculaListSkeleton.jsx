/**
 * Skeleton de carga del listado (molécula). Imita la forma de la tabla o la
 * grilla para mejorar la percepción de velocidad y evitar el flash vacío→lleno.
 * @param {{ viewMode: 'table' | 'grid', rows?: number }} props
 */
const MatriculaListSkeleton = ({ viewMode, rows = 8 }) => {
  if (viewMode === 'grid') {
    return (
      <div className="matricula-v2-skeleton-grid" aria-hidden>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="matricula-v2-skeleton-card" />
        ))}
      </div>
    );
  }

  return (
    <div className="matricula-v2-skeleton-rows" aria-hidden>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="matricula-v2-skeleton-row" />
      ))}
    </div>
  );
};

export default MatriculaListSkeleton;
