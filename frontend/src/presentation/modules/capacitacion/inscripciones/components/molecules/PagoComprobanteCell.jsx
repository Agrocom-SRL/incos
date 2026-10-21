/**
 * Molécula: celda «Comprobante» del historial de pagos (CAP).
 *
 * Comprobante OPCIONAL: si el pago lo tiene se puede descargar; si el rol lo
 * permite, se puede adjuntar (o reemplazar) después con un `Upload` que no
 * sube automáticamente (`beforeUpload` delega en `onAdjuntar(file)`).
 * Presentacional: los permisos llegan resueltos por props.
 */

import { Flex, Tooltip, Typography, Upload } from 'antd';
import { DownloadOutlined, UploadOutlined } from '@ant-design/icons';
import { Button } from '@atoms';
import { allSpacing } from '@theme/tokens';
import { COMPROBANTE_ACCEPT } from '@finanzas/pagos/config/registrarFormConfig';

const PagoComprobanteCell = ({
  pago,
  puedeDescargar = false,
  puedeAdjuntar = false,
  subiendo = false,
  onDescargar,
  onAdjuntar,
}) => (
  <Flex align="center" gap={allSpacing.marginXS} wrap>
    {pago.tieneComprobante ? (
      <Tooltip title={pago.comprobanteNombre || 'Descargar comprobante'}>
        <Button
          variant="view"
          size="small"
          icon={<DownloadOutlined />}
          disabled={!puedeDescargar}
          onClick={() => onDescargar?.(pago.id)}
        >
          Descargar
        </Button>
      </Tooltip>
    ) : (
      <Typography.Text type="secondary">Sin comprobante</Typography.Text>
    )}
    {puedeAdjuntar ? (
      <Upload
        accept={COMPROBANTE_ACCEPT}
        showUploadList={false}
        maxCount={1}
        beforeUpload={(file) => {
          onAdjuntar?.(pago.id, file);
          return false;
        }}
      >
        <Button variant="back" size="small" icon={<UploadOutlined />} loading={subiendo}>
          {pago.tieneComprobante ? 'Reemplazar' : 'Adjuntar'}
        </Button>
      </Upload>
    ) : null}
  </Flex>
);

export default PagoComprobanteCell;
