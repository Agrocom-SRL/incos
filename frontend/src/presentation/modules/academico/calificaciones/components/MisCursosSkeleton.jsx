/**
 * Skeleton de cards en Mis cursos.
 */

import { Skeleton } from 'antd';

const MisCursosSkeleton = ({ count = 4 }) => (
  <div className="cal-mis-cursos__grid">
    {Array.from({ length: count }).map((_, i) => (
      <article key={i} className="cal-curso-card cal-curso-card--skeleton">
        <Skeleton active paragraph={{ rows: 3 }} title={{ width: '70%' }} />
        <Skeleton.Button active block style={{ marginTop: 12, height: 36 }} />
      </article>
    ))}
  </div>
);

export default MisCursosSkeleton;
