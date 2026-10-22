/**
 * Organismo: historial de pagos de la ficha de inscripción (CAP), con concepto, comprobante
 * y las acciones de corrección (editar / anular pago).
 * Gemelo de `PagoCuotasSection` (Finanzas): DetailInfoCard + tabla. Estados vacíos cubiertos.
 * Los pagos anulados se conservan marcados (no cuentan en el total que se muestra al pie).
 * Recibe props ya mapeadas; no llama hooks.
 */

import { Empty, Table, Typography } from 'antd';
import { FileTextOutlined } from '@ant-design/icons';
import { DetailInfoCard } from '@molecules';
import { formatBs } from '@application/utils/formatters';
import { contarPagosVigentes } from '@application-capacitacion/utils/pagosCapacitacion';
import {
  createPagosCapacitacionTableColumns,
  pagoRowClassName,
} from '@capacitacion/inscripciones/config/pagosCapacitacionTableColumns';

const { Text } = Typography;

const InscripcionPagosSection = ({ inscripcion, comprobante, acciones = null }) => {
  const columns = createPagosCapacitacionTableColumns(comprobante, acciones);
  const pagos = inscripcion.pagos ?? [];
  const anulados = pagos.length - contarPagosVigentes(pagos);
  const titulo = `Historial de pagos (${pagos.length})${anulados > 0 ? ` · ${anulados} anulado${anulados === 1 ? '' : 's'}` : ''}`;

  return (
    <DetailInfoCard title={titulo} icon={<FileTextOutlined />} cols={1}>
      {pagos.length > 0 ? (
        <Table
          dataSource={pagos}
          columns={columns}
          rowKey={(record) => record.id ?? record.numeroRecibo}
          rowClassName={pagoRowClassName}
          size="small"
          pagination={false}
          scroll={{ x: 'max-content' }}
          summary={() => (
            <Table.Summary.Row>
              <Table.Summary.Cell index={0} colSpan={4} align="right">
                <Text strong>Total pagado (sin pagos anulados)</Text>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={1} align="right">
                <Text strong>Bs {formatBs(inscripcion.totalPagado)}</Text>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={2} colSpan={columns.length - 5} />
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
