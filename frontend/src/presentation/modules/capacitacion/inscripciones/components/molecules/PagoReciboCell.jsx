/**
 * Molécula: celda «Recibo» del historial de pagos (CAP).
 *
 * Muestra el número de recibo y un botón para descargar el recibo en PDF
 * (permiso capacitacion.inscripcion DETALLE, resuelto por props).
 * Un pago anulado no emite recibo (el backend responde 409): el botón queda
 * deshabilitado con tooltip. Presentacional: el loading por pago llega en `descargandoId`.
 */

import { Flex, Tooltip } from 'antd';
import { FilePdfOutlined } from '@ant-design/icons';
import { Button } from '@atoms';
import { allSpacing } from '@theme/tokens';

const PagoReciboCell = ({ pago, puedeDescargar = false, descargandoId = null, onDescargar }) => (
  <Flex align="center" gap={allSpacing.marginXS} wrap>
    <span>{pago.numeroRecibo || '—'}</span>
    <Tooltip title={pago.anulado ? 'Un pago anulado no emite recibo' : 'Descargar recibo de pago (PDF)'}>
      <Button
        variant="view"
        size="small"
        icon={<FilePdfOutlined />}
        disabled={!puedeDescargar}
        loading={descargandoId === pago.id}
        aria-label="Descargar recibo en PDF"
        onClick={() => onDescargar?.(pago.id)}
      >
        PDF
      </Button>
    </Tooltip>
  </Flex>
);

export default PagoReciboCell;
