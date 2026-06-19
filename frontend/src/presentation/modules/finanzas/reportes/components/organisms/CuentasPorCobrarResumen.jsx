/**
 * Organismo: resumen general de la planilla de cuentas por cobrar.
 *
 * Réplica del bloque "RESUMEN TOTAL POR CARRERA" de la planilla oficial con el
 * kit `fin-planilla`: un panel de KPIs (`fin-kpis`/`fin-kpi`) con total de
 * matriculados, monto total, total cancelado y % pendiente, y un bloque
 * DESTACADO grande (`fin-destacado`) con el "Monto total pendiente por cobrar",
 * que es el dato principal de la planilla.
 *
 * Recibe `resumen` ya mapeado; no hace fetch. Solo presentación (clases del kit).
 */

import {
  BankOutlined,
  CheckCircleOutlined,
  PercentageOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { formatBs, formatPorcentaje } from '@finanzas/reportes/config/cuentasPorCobrarColumns';

const CuentasPorCobrarResumen = ({ resumen }) => {
  const data = resumen || {};

  const kpis = [
    {
      key: 'matriculados',
      label: 'Total matriculados',
      valor: data.totalMatriculados || 0,
      icon: <TeamOutlined />,
      variant: '',
    },
    {
      key: 'maximo',
      label: 'Monto máximo total (Bs)',
      valor: formatBs(data.montoMaximoTotal),
      icon: <BankOutlined />,
      variant: '',
    },
    {
      key: 'cancelado',
      label: 'Total cancelado (Bs)',
      valor: formatBs(data.totalCancelado),
      icon: <CheckCircleOutlined />,
      variant: 'fin-kpi--success',
    },
    {
      key: 'porcentaje',
      label: '% pendiente',
      valor: formatPorcentaje(data.porcentajePendiente),
      icon: <PercentageOutlined />,
      variant: 'fin-kpi--warning',
    },
  ];

  return (
    <div className="cobranza-resumen">
      <div className="fin-kpis">
        {kpis.map((kpi) => (
          <div key={kpi.key} className={`fin-kpi ${kpi.variant}`.trim()}>
            <span className="fin-kpi__icon">{kpi.icon}</span>
            <span className="fin-kpi__body">
              <span className="fin-kpi__valor">{kpi.valor}</span>
              <span className="fin-kpi__label">{kpi.label}</span>
            </span>
          </div>
        ))}
      </div>

      <div className="fin-destacado">
        <span className="fin-destacado__label">Monto total pendiente por cobrar</span>
        <span className="fin-destacado__valor">{formatBs(data.totalPendientePorCobrar)} Bs</span>
        <span className="fin-destacado__sub">Todas las carreras de la gestión</span>
      </div>
    </div>
  );
};

export default CuentasPorCobrarResumen;
