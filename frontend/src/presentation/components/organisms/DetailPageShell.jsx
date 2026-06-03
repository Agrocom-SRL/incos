/**
 * Organismo: cuerpo de página de detalle con carga, error y contenido.
 */

import { Alert, Empty, Spin } from 'antd';

const DetailPageShell = ({
  loading = false,
  loadingTip = 'Cargando…',
  error,
  onRetry,
  emptyDescription = 'No se encontró el registro solicitado',
  showEmpty = false,
  children,
}) => (
  <Spin spinning={loading} size="large" tip={loadingTip}>
    <div className="sd sd-spin-body">
      {!loading && error ? (
        <Alert
          type="error"
          showIcon
          title={error}
          action={
            onRetry ? (
              <button type="button" className="sd-btn sd-btn--outline" onClick={onRetry}>
                Reintentar
              </button>
            ) : null
          }
          style={{ marginBottom: 16 }}
        />
      ) : null}
      {!loading && !error && !showEmpty ? children : null}
      {!loading && !error && showEmpty ? <Empty description={emptyDescription} /> : null}
    </div>
  </Spin>
);

export default DetailPageShell;
