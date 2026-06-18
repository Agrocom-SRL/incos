/**
 * Organismo: sección de cuotas de un pago de aporte (ficha — módulo Finanzas).
 *
 * Espejo de las secciones de ficha de Docentes: recibe props ya mapeadas y compone
 * `DetailInfoCard` (datos del aporte) + tabla de cuotas. Estados vacío/carga cubiertos.
 * No llama hooks de fetch.
 */

import { Empty, Table } from 'antd';
import { DollarOutlined, FileTextOutlined } from '@ant-design/icons';
import { DetailInfoCard } from '@molecules';
import { DetailField } from '@atoms';
import { createCuotasTableColumns } from '@finanzas/pagos/config/cuotasTableColumns';

/** Formatea un monto en bolivianos (Bs 1.234,50). */
const formatBolivianos = (value) => {
  const n = Number(value);
  const safe = Number.isFinite(n) ? n : 0;
  return `Bs ${safe.toLocaleString('es-BO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const PagoCuotasSection = ({
  montoBase,
  descuentoBeca,
  montoObligatorio,
  totalPagado,
  saldoPendiente,
  cuotas = [],
  puedeExportarRecibo,
  puedeEditarCuota,
  puedeEliminarCuota,
  onGenerarRecibo,
  onEditarCuota,
  onEliminarCuota,
  reciboCuotaId,
  descargandoRecibo,
}) => {
  const columns = createCuotasTableColumns({
    puedeExportarRecibo,
    puedeEditarCuota,
    puedeEliminarCuota,
    onGenerarRecibo: puedeExportarRecibo ? onGenerarRecibo : undefined,
    onEditarCuota: puedeEditarCuota ? onEditarCuota : undefined,
    onEliminarCuota: puedeEliminarCuota ? onEliminarCuota : undefined,
    reciboCuotaId,
    descargandoRecibo,
  });

  return (
    <div className="sd-tab-body">
      <DetailInfoCard title="Datos del aporte" icon={<DollarOutlined />} cols={3}>
        <DetailField label="Monto base">{formatBolivianos(montoBase)}</DetailField>
        <DetailField label="Descuento beca">{formatBolivianos(descuentoBeca)}</DetailField>
        <DetailField label="Monto a pagar">{formatBolivianos(montoObligatorio)}</DetailField>
        <DetailField label="Total pagado">{formatBolivianos(totalPagado)}</DetailField>
        <DetailField label="Saldo pendiente">{formatBolivianos(saldoPendiente)}</DetailField>
      </DetailInfoCard>

      <DetailInfoCard
        title={`Cuotas registradas (${cuotas.length})`}
        icon={<FileTextOutlined />}
        cols={1}
      >
        {cuotas.length > 0 ? (
          <Table
            dataSource={cuotas}
            columns={columns}
            rowKey={(record) => record.id ?? record.numeroRecibo}
            size="small"
            pagination={false}
          />
        ) : (
          <Empty description="No hay cuotas registradas para este pago." />
        )}
      </DetailInfoCard>
    </div>
  );
};

export default PagoCuotasSection;
