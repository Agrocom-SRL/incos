/**
 * Skeleton de cards en la pantalla de inicio de Calificaciones.
 */

import { Card, Skeleton } from 'antd';
import { calificacionesSectionCardProps } from '../utils/calificacionesSectionCard.js';

const CalificacionesCursosSkeleton = ({ count = 4 }) => (
  <div className="cal-calificaciones-inicio__grid">
    {Array.from({ length: count }).map((_, i) => (
      <Card key={i} className="cal-curso-card cal-curso-card--skeleton" {...calificacionesSectionCardProps}>
        <Skeleton active paragraph={{ rows: 4 }} title={{ width: '70%' }} />
        <Skeleton.Button active block style={{ marginTop: 16, height: 36 }} />
      </Card>
    ))}
  </div>
);

export default CalificacionesCursosSkeleton;
