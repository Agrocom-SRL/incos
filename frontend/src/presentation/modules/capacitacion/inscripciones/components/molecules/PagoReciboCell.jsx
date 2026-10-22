/**
 * Molécula: celda «Recibo» del historial de pagos (CAP).
 *
 * Muestra el número de recibo y un botón para descargar el recibo en PDF
 * (permiso capacitacion.inscripcion DETALLE, resuelto por props).
 * Presentacional: el loading por pago llega en `descargandoId`.
 */

import { Flex, Tooltip } from 'antd';
import { FilePdfOutlined } from '@ant-design/icons';
import { Button } from '@atoms';
import { allSpacing } from '@theme/tokens';

const PagoReciboCell = ({ pago, puedeDescargar = false, descargandoId = null, onDescargar }) => (
  <Flex align="center" gap={allSpacing.marginXS} wrap>
    <span>{pago.numeroRecibo || '—'}</span>
    <Tooltip title="Descargar recibo de pago (PDF)">
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
