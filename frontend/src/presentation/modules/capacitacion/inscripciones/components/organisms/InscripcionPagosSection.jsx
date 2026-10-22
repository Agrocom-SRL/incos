/**
 * Organismo: historial de pagos de la ficha de inscripción (CAP): datos principales en
 * columnas, detalle (cuenta, observaciones, comprobante) en la fila expandible y las
 * acciones recibo PDF / editar / anular.
 * Gemelo de «Cuotas registradas» de `PagoCuotasSection` (Finanzas): DetailInfoCard + tabla.
 * Estados vacíos cubiertos.
 * Los pagos eliminados no se listan (no cuentan en el total que se muestra al pie).
 * Recibe props ya mapeadas; no llama hooks.
 */

import { Empty, Table, Typography } from 'antd';
import { FileTextOutlined } from '@ant-design/icons';
import { DetailInfoCard } from '@molecules';
import { formatBs } from '@application/utils/formatters';
import PagoDetalleFila from '@capacitacion/inscripciones/components/molecules/PagoDetalleFila';
import {
  createPagosCapacitacionTableColumns,
} from '@capacitacion/inscripciones/config/pagosCapacitacionTableColumns';

const { Text } = Typography;

const InscripcionPagosSection = ({ inscripcion, comprobante, acciones = null }) => {
  const columns = createPagosCapacitacionTableColumns(comprobante, acciones);
  // Un pago eliminado (anulado con motivo) se conserva en BD como auditoría pero no se muestra.
  const pagos = (inscripcion.pagos ?? []).filter((pago) => !pago.anulado);
  const titulo = `Historial de pagos (${pagos.length})`;

  return (
    <DetailInfoCard title={titulo} icon={<FileTextOutlined />} cols={1}>
      {pagos.length > 0 ? (
        <Table
          dataSource={pagos}
          columns={columns}
          rowKey={(record) => record.id ?? record.numeroRecibo}
          expandable={{
            expandedRowRender: (pago) => <PagoDetalleFila pago={pago} comprobante={comprobante} />,
          }}
          size="small"
          pagination={false}
          scroll={{ x: 'max-content' }}
          summary={() => (
            <Table.Summary.Row>
              <Table.Summary.Cell index={0} colSpan={4} align="right">
                <Text strong>Total pagado</Text>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={1} align="right">
                <Text strong>Bs {formatBs(inscripcion.totalPagado)}</Text>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={2} colSpan={columns.length - 4} />
            </Table.Summary.Row>
          )}
        />
      ) : (
        <Empty description="La inscripción aún no tiene pagos registrados." />
      )}
    </DetailInfoCard>
  );
};

export default InscripcionPagosSection;
