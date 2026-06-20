/**
 * ListSkeleton — esqueleto de carga del listado, con lenguaje mv2 (shimmer).
 * Render puro: filas para la vista de tabla, tarjetas para la vista de grid.
 */
import './ListSkeleton.css';

export function ListSkeleton({ viewMode = 'table', count = 8 }) {
  if (viewMode === 'grid') {
    return (
      <div className="mat-skeleton-grid">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="mat-skeleton-card" data-anim="shimmer" />
        ))}
      </div>
    );
  }
  return (
    <div className="mat-skeleton-rows">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="mat-skeleton-row" data-anim="shimmer" />
      ))}
    </div>
  );
}

export default ListSkeleton;
