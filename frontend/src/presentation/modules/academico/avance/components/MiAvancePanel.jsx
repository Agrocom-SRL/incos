/**
 * Vista «Mi avance» de ACA-AVANCE — degradación para el rol ESTUDIANTE.
 *
 * El backend responde `alcance: 'PROPIO'` con la ÚNICA fila del estudiante
 * autenticado (anti-IDOR, resuelto en servidor); aquí se presenta como ficha:
 * anillo de progreso + detalle en `DetailInfoCard`/`DetailField` (patrón
 * sd-card de las fichas del sistema). Componente presentacional puro.
 */

import { Card, Empty, Flex, Progress, Typography } from 'antd';
import { LineChartOutlined } from '@ant-design/icons';
import { DetailField, CarreraDotCell } from '@atoms';
import { DetailInfoCard } from '@molecules';
import { sectionCardProps } from '@presentation-utils/cards/sectionCardProps.js';
import { allSpacing } from '@theme/tokens';
import '@presentation/styles/pages/detail-page.css';

const { Text, Title } = Typography;

/** % con 1 decimal (es-BO) o guion sin denominador de plan. */
const formatPct = (value) => {
  const n = Number(value);
  if (value == null || !Number.isFinite(n)) return '—';
  return `${n.toLocaleString('es-BO', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;
};

const MiAvancePanel = ({ fila = null }) => {
  if (!fila) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description="Aún no tiene historial académico registrado. Consulte con la dirección académica si considera que se trata de un error."
      />
    );
  }

  const gestiones =
    fila.primeraGestionAnio != null
      ? fila.ultimaGestionAnio != null && fila.ultimaGestionAnio !== fila.primeraGestionAnio
        ? `${fila.primeraGestionAnio} – ${fila.ultimaGestionAnio}`
        : String(fila.primeraGestionAnio)
      : null;

  return (
    <div className="sd">
      <Flex vertical gap={allSpacing.marginLG} style={{ width: '100%', minWidth: 0 }}>
        <Card {...sectionCardProps}>
          <Flex align="center" gap={allSpacing.marginLG} wrap="wrap">
            <Progress
              type="dashboard"
              percent={fila.pctAvance ?? 0}
              format={() => formatPct(fila.pctAvance)}
              aria-label={`Avance del plan de estudios: ${formatPct(fila.pctAvance)}`}
            />
            <Flex vertical gap={allSpacing.marginXS} style={{ minWidth: 0 }}>
              <Title level={4} style={{ margin: 0 }}>
                <CarreraDotCell nombre={fila.carreraNombre} colorHex={fila.carreraColorHex} />
              </Title>
              <Text type="secondary">
                {fila.planNombre || 'Plan de estudios'}
                {fila.planDuracionAnios ? ` · ${fila.planDuracionAnios} años` : ''}
              </Text>
              <Text>
                Ha avanzado {fila.materiasAvanzadas ?? 0} de {fila.totalAsignaturasPlan ?? 0}{' '}
                materias del plan.
              </Text>
            </Flex>
          </Flex>
        </Card>

        <DetailInfoCard title="Detalle del avance" icon={<LineChartOutlined />} cols={3}>
          <DetailField label="Materias aprobadas">{fila.materiasAprobadas ?? 0}</DetailField>
          <DetailField label="Materias convalidadas">{fila.materiasConvalidadas ?? 0}</DetailField>
          <DetailField label="Materias registradas">{fila.materiasRegistradas ?? 0}</DetailField>
          <DetailField label="Promedio del historial">
            {fila.promedioHistorial != null
              ? Number(fila.promedioHistorial).toLocaleString('es-BO', {
                  maximumFractionDigits: 2,
                })
              : null}
          </DetailField>
          <DetailField label="Gestiones cursadas">{gestiones}</DetailField>
          <DetailField label="Código de estudiante">{fila.codigo}</DetailField>
        </DetailInfoCard>
      </Flex>
    </div>
  );
};

export default MiAvancePanel;
