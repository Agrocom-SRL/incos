/**
 * Skeleton del cuaderno (carga inicial).
 */

import { Skeleton } from 'antd';

const CuadernoSkeleton = () => (
  <div className="cal-cuaderno-skeleton" aria-busy="true" aria-label="Cargando cuaderno">
    <div className="cal-cuaderno-skeleton__header">
      <Skeleton.Input active size="large" style={{ width: 320, height: 32 }} />
      <Skeleton.Input active size="small" style={{ width: 420, marginTop: 8 }} />
    </div>
    <div className="cal-cuaderno-skeleton__tabs">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton.Button key={i} active size="small" style={{ width: 120, height: 36 }} />
      ))}
    </div>
    <div className="cal-cuaderno-hoja cal-cuaderno-skeleton__hoja">
      <Skeleton active paragraph={{ rows: 6 }} title={false} />
    </div>
  </div>
);

export default CuadernoSkeleton;
