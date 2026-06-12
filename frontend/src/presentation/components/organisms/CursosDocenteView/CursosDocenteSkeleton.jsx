/**
 * Skeleton de cards de cursos del docente (mientras carga).
 */

import { Card, Skeleton } from 'antd';
import { sectionCardProps } from '@presentation-utils/cards/sectionCardProps.js';
import '@presentation/styles/components/curso-card.css';

const CursosDocenteSkeleton = ({ count = 4 }) => (
  <div className="cursos-docente__grid">
    {Array.from({ length: count }).map((_, i) => (
      <Card
        key={i}
        className="curso-card curso-card--skeleton"
        {...sectionCardProps}
      >
        <Skeleton active paragraph={{ rows: 4 }} title={{ width: '70%' }} />
        <Skeleton.Button active block style={{ marginTop: 16, height: 36 }} />
      </Card>
    ))}
  </div>
);

export default CursosDocenteSkeleton;
