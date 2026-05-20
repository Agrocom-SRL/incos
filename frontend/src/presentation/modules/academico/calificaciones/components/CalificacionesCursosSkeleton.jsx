/**
 * Skeleton de cards en la pantalla de inicio de Calificaciones.
 */

import { Skeleton } from 'antd';

const CalificacionesCursosSkeleton = ({ count = 4 }) => (
  <div className="cal-calificaciones-inicio__grid">
    {Array.from({ length: count }).map((_, i) => (
      <article key={i} className="cal-curso-card cal-curso-card--skeleton">
        <Skeleton active paragraph={{ rows: 3 }} title={{ width: '70%' }} />
        <Skeleton.Button active block style={{ marginTop: 12, height: 36 }} />
      </article>
    ))}
  </div>
);

export default CalificacionesCursosSkeleton;
