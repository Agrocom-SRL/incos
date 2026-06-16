/**
 * Sidebar de resumen del bimestre (organismo) — look del aside de Gestión de horarios.
 *
 * Cuatro KPIs de asistencia (presentes / atrasados / faltantes / con licencia) sobre el
 * total, más una tarjeta de contexto con turno, rango del bimestre y la fecha actual
 * resaltada. Recibe props ya mapeadas; no hace fetch.
 */

import { Card, Flex, Typography } from 'antd';
import { CalendarOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { KpiCard } from '@institucional/horarios/components/atoms';
import { etiquetaFechaCompleta, etiquetaDiaMes } from '@application-academico/asistencia/utils/asistenciaFechas.js';
import { asistenciaSectionCardProps } from '../utils/asistenciaSectionCard.js';

const { Text } = Typography;

const porcentaje = (valor, total) => {
  const t = Number(total) || 0;
  if (t <= 0) return 0;
  return (Number(valor) || 0) / t * 100;
};

const KPI_DEFS = [
  { key: 'presentes', label: 'Presentes', intent: 'success' },
  { key: 'atrasados', label: 'Atrasados', intent: 'warning' },
  { key: 'faltantes', label: 'Faltantes', intent: 'danger' },
  { key: 'conLicencia', label: 'Con licencia', intent: 'info' },
];

const ResumenAsistenciaSidebar = ({ resumen = null, turno = null, rango = null, hoy = null }) => {
  const total = resumen?.total ?? 0;
  const rangoLabel =
    rango?.desde && rango?.hasta
      ? `${etiquetaDiaMes(rango.desde)} – ${etiquetaDiaMes(rango.hasta)}`
      : '—';

  return (
    <Flex vertical gap="middle" style={{ width: '100%' }}>
      {resumen ? (
        <Flex vertical gap="small">
          {KPI_DEFS.map(({ key, label, intent }) => {
            const valor = resumen[key] ?? 0;
            return (
              <KpiCard
                key={key}
                label={label}
                value={valor}
                sub={`de ${total} marcas`}
                badgeText={`${Math.round(porcentaje(valor, total))}%`}
                intent={intent}
                percent={porcentaje(valor, total)}
              />
            );
          })}
        </Flex>
      ) : null}

      <Card {...asistenciaSectionCardProps} size="small">
        <Flex vertical gap="middle" className="asi-resumen-ctx">
          <Flex vertical gap="small">
            <Text type="secondary" className="asi-resumen-ctx__label">
              Turno
            </Text>
            <Flex align="center" gap="small">
              <ClockCircleOutlined aria-hidden />
              <Text strong>{turno ?? '—'}</Text>
            </Flex>
          </Flex>

          <Flex vertical gap="small">
            <Text type="secondary" className="asi-resumen-ctx__label">
              Rango del bimestre
            </Text>
            <Flex align="center" gap="small">
              <CalendarOutlined aria-hidden />
              <Text strong>{rangoLabel}</Text>
            </Flex>
          </Flex>

          <div className="asi-resumen-ctx__hoy">
            <Text type="secondary" className="asi-resumen-ctx__label">
              Fecha actual
            </Text>
            <span className="asi-resumen-ctx__hoy-valor">
              {hoy ? etiquetaFechaCompleta(hoy) : '—'}
            </span>
          </div>
        </Flex>
      </Card>
    </Flex>
  );
};

export default ResumenAsistenciaSidebar;
