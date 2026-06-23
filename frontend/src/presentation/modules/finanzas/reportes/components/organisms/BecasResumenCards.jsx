/**
 * Organismo: RESUMEN GENERAL de la planilla de becas (KPIs).
 *
 * Recibe el `resumen` ya mapeado (total matriculados, total con beca, % con beca,
 * % sin beca) y lo pinta con el panel de KPIs del KIT de planilla de Finanzas
 * (`fin-kpis` / `fin-kpi`, cabecera/acento en verde primario). No hace fetch ni
 * orquesta: solo presenta props ya mapeadas. Sin literales de color/espaciado:
 * todo viene de las clases del kit.
 */

import {
  BankOutlined,
  PercentageOutlined,
  TeamOutlined,
  TrophyOutlined,
} from '@ant-design/icons';

const formatPorcentaje = (value) => {
  const n = Number(value);
  const safe = Number.isFinite(n) ? n : 0;
  return Math.round(safe).toLocaleString('es-BO', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
};

const BecasResumenCards = ({ resumen }) => {
  const data = resumen || {};

  const items = [
    {
      key: 'matriculados',
      label: 'Total matriculados',
      value: String(data.totalMatriculados || 0),
      icon: <TeamOutlined />,
      variant: '',
    },
    {
      key: 'conBeca',
      label: 'Total con beca',
      value: String(data.totalConBeca || 0),
      icon: <TrophyOutlined />,
      variant: 'fin-kpi--success',
    },
    {
      key: 'porcentajeConBeca',
      label: '% con beca',
      value: `${formatPorcentaje(data.porcentajeConBeca)}%`,
      icon: <PercentageOutlined />,
      variant: 'fin-kpi--success',
    },
    {
      key: 'porcentajeSinBeca',
      label: '% sin beca',
      value: `${formatPorcentaje(data.porcentajeSinBeca)}%`,
      icon: <BankOutlined />,
      variant: 'fin-kpi--warning',
    },
  ];

  return (
    <div className="fin-kpis">
      {items.map((item) => (
        <div key={item.key} className={`fin-kpi ${item.variant}`.trim()}>
          <span className="fin-kpi__icon">{item.icon}</span>
          <span className="fin-kpi__body">
            <span className="fin-kpi__valor">{item.value}</span>
            <span className="fin-kpi__label">{item.label}</span>
          </span>
        </div>
      ))}
    </div>
  );
};

export default BecasResumenCards;
