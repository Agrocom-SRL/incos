/**
 * Organismo: historial de pagos de la ficha de inscripción (CAP), con concepto y comprobante.
 * Gemelo de `PagoCuotasSection` (Finanzas): DetailInfoCard + tabla. Estados vacíos cubiertos.
 * Recibe props ya mapeadas; no llama hooks.
 */

import { Empty, Table } from 'antd';
import { FileTextOutlined } from '@ant-design/icons';
import { DetailInfoCard } from '@molecules';
import { createPagosCapacitacionTableColumns } from '@capacitacion/inscripciones/config/pagosCapacitacionTableColumns';

const InscripcionPagosSection = ({ inscripcion, comprobante }) => {
  const columns = createPagosCapacitacionTableColumns(comprobante);
  const pagos = inscripcion.pagos ?? [];

  return (
    <DetailInfoCard
      title={`Historial de pagos (${pagos.length})`}
      icon={<FileTextOutlined />}
      cols={1}
    >
      {pagos.length > 0 ? (
        <Table
          dataSource={pagos}
          columns={columns}
          rowKey={(record) => record.id ?? record.numeroRecibo}
          size="small"
          pagination={false}
        />
      ) : (
        <Empty description="La inscripción aún no tiene pagos registrados." />
      )}
    </DetailInfoCard>
  );
};

export default InscripcionPagosSection;
