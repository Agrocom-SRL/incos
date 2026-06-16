/**
 * Sidebar de resumen del bimestre (organismo) — mismo lenguaje visual que el aside de
 * Oferta académica (OfertaSidebarResumen): tarjetas con gradiente de marca.
 *
 * Orden:
 *  1. Contexto del bimestre (turno · rango · fecha actual) — primera tarjeta.
 *  2. Cuatro KPIs de asistencia (presentes / atrasados / faltantes / con licencia)
 *     sobre el total, cada uno con su gradiente semántico.
 *
 * Recibe props ya mapeadas; no hace fetch.
 */

import { Card, Flex, Typography } from 'antd';
import {
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  FieldTimeOutlined,
  SolutionOutlined,
} from '@ant-design/icons';
import { allColors, allSpacing, componentConfig, gradients, shadows, typography } from '@theme/tokens';
import {
  etiquetaFechaCompleta,
  etiquetaDiaMes,
} from '@application-academico/asistencia/utils/asistenciaFechas.js';

const { Text } = Typography;

const porcentaje = (valor, total) => {
  const t = Number(total) || 0;
  if (t <= 0) return 0;
  return ((Number(valor) || 0) / t) * 100;
};

const KPI_DEFS = [
  { key: 'presentes', label: 'Presentes', icon: <CheckCircleOutlined />, gradient: gradients.gradientSuccess },
  { key: 'atrasados', label: 'Atrasados', icon: <FieldTimeOutlined />, gradient: gradients.gradientWarning },
  { key: 'faltantes', label: 'Faltantes', icon: <CloseCircleOutlined />, gradient: gradients.gradientError },
  { key: 'conLicencia', label: 'Con licencia', icon: <SolutionOutlined />, gradient: gradients.gradientInfo },
];

/** Tarjeta de KPI con gradiente — réplica del sidebarCard de OfertaSidebarResumen. */
const KpiGradientCard = ({ etiqueta, icon, valor, titulo, detalle, gradient }) => (
  <Card
    className="asi-kpi-card"
    style={{
      background: gradient,
      borderRadius: `${componentConfig.Card.borderRadiusLG}px`,
      boxShadow: shadows.shadowPrimary,
      border: 'none',
    }}
  >
    <Flex vertical style={{ minWidth: 0 }}>
      <Flex justify="space-between" align="flex-start" wrap="nowrap">
        <Text
          style={{
            color: allColors.colorTextSecondaryOnDark,
            fontSize: `${typography.fontSizeSM}px`,
            margin: 0,
            letterSpacing: '0.02em',
            textTransform: 'uppercase',
          }}
        >
          {etiqueta}
        </Text>
        <span style={{ color: allColors.colorTextOnDark, fontSize: 22, opacity: 0.95 }} aria-hidden>
          {icon}
        </span>
      </Flex>
      <Typography.Title
        level={3}
        style={{
          color: allColors.colorTextOnDark,
          fontSize: typography.fontSizeHeading3 ?? 30,
          fontWeight: typography.fontWeightStrong,
          margin: 0,
          lineHeight: 1.1,
        }}
      >
        {valor}
      </Typography.Title>
      <Text
        style={{
          color: allColors.colorTextOnDark,
          fontSize: typography.fontSizeLG,
          fontWeight: typography.fontWeightStrong,
          margin: '4px 0 2px',
          display: 'block',
          lineHeight: 1.35,
        }}
      >
        {titulo}
      </Text>
      <Text style={{ color: allColors.colorTextTertiaryOnDark, fontSize: typography.fontSizeSM }}>
        {detalle}
      </Text>
    </Flex>
  </Card>
);

const ResumenAsistenciaSidebar = ({ resumen = null, turno = null, rango = null, hoy = null }) => {
  const total = resumen?.total ?? 0;
  const rangoLabel =
    rango?.desde && rango?.hasta
      ? `${etiquetaDiaMes(rango.desde)} – ${etiquetaDiaMes(rango.hasta)}`
      : '—';

  return (
    <Flex vertical gap={allSpacing.marginMD} style={{ width: '100%', minWidth: 0 }}>
      <Card
        className="asi-ctx-card"
        style={{
          borderRadius: `${componentConfig.Card.borderRadiusLG}px`,
          boxShadow: shadows.shadowPrimary,
        }}
      >
        <Flex vertical gap="middle" className="asi-resumen-ctx">
          <Flex gap="middle" wrap="wrap">
            <div className="asi-resumen-ctx__bloque">
              <Text type="secondary" className="asi-resumen-ctx__label">
                Turno
              </Text>
              <Flex align="center" gap="small">
                <ClockCircleOutlined aria-hidden />
                <Text strong>{turno ?? '—'}</Text>
              </Flex>
            </div>

            <div className="asi-resumen-ctx__bloque">
              <Text type="secondary" className="asi-resumen-ctx__label">
                Rango del bimestre
              </Text>
              <Flex align="center" gap="small">
                <CalendarOutlined aria-hidden />
                <Text strong>{rangoLabel}</Text>
              </Flex>
            </div>
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

      {resumen
        ? KPI_DEFS.map(({ key, label, icon, gradient }) => {
            const valor = resumen[key] ?? 0;
            const pct = Math.round(porcentaje(valor, total));
            return (
              <KpiGradientCard
                key={key}
                etiqueta={label}
                icon={icon}
                valor={valor}
                titulo={`${pct}% del total`}
                detalle={`de ${total} marcas`}
                gradient={gradient}
              />
            );
          })
        : null}
    </Flex>
  );
};

export default ResumenAsistenciaSidebar;
