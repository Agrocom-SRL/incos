/**
 * Organismo: cuerpo de página de detalle con carga, error y contenido.
 *
 * Estados consolidados en la capa compartida:
 *  - loading → Skeleton variant="detail"
 *  - error   → ErrorState (Alert title/description + reintento)
 *  - vacío   → Empty de AntD (registro no encontrado)
 *
 * Comportamiento por defecto idéntico al previo (mismos props, mismas ramas).
 */

import { Empty } from 'antd';
import { Skeleton } from '@atoms';
import { ErrorState } from '@molecules';

const DetailPageShell = ({
  loading = false,
  error,
  onRetry,
  emptyDescription = 'No se encontró el registro solicitado',
  showEmpty = false,
  children,
}) => {
  if (loading) {
    return (
      <div className="sd sd-spin-body">
        <Skeleton variant="detail" />
      </div>
    );
  }

  return (
    <div className="sd sd-spin-body">
      {error ? <ErrorState title="Error" description={error} onRetry={onRetry} /> : null}
      {!error && !showEmpty ? children : null}
      {!error && showEmpty ? <Empty description={emptyDescription} /> : null}
    </div>
  );
};

export default DetailPageShell;
