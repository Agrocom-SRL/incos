import { BookOutlined, CalendarOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { Card, Flex, Typography } from 'antd';
import { allColors, allSpacing, componentConfig, gradients, shadows, typography } from '@theme/tokens';

const { Text, Title } = Typography;

const sidebarCard = (gradient, { etiqueta, icon, titulo, valor, detalle }) => (
  <Card
    className="oferta-sidebar-resumen-stat"
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
      <Title
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
      </Title>
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
      <Text style={{ color: allColors.colorTextTertiaryOnDark, fontSize: typography.fontSizeSM }}>{detalle}</Text>
    </Flex>
  </Card>
);

const OfertaSidebarResumen = ({
  gestionSeleccionada,
  planSeleccionado,
  kpis,
  step,
  variant = 'flow',
  dashboardStats,
}) => {
  const gestionTitulo =
    gestionSeleccionada?.codigo ??
    gestionSeleccionada?.nombre ??
    gestionSeleccionada?.name ??
    (gestionSeleccionada ? `Gestión ${gestionSeleccionada.id}` : '—');

  const planLabel = planSeleccionado
    ? planSeleccionado.carreraNombre
      ? `${planSeleccionado.carreraNombre} — ${planSeleccionado.nombre ?? `Plan #${planSeleccionado.planEstudioId}`}`
      : planSeleccionado.nombre ?? `Plan #${planSeleccionado.planEstudioId}`
    : 'Sin plan seleccionado';

  const isDashboard = variant === 'dashboard';
  const stats = dashboardStats ?? {};

  return (
    <Flex vertical gap={allSpacing.marginMD} style={{ width: '100%', minWidth: 0 }}>
      {sidebarCard(gradients.gradientPrimary, {
        etiqueta: 'Gestión',
        icon: <CalendarOutlined />,
        titulo: gestionTitulo,
        valor: gestionSeleccionada?.anio ?? '—',
        detalle: gestionSeleccionada?.vigente ? 'Vigente' : 'No vigente',
      })}

      {isDashboard
        ? sidebarCard(gradients.gradientInfo, {
            etiqueta: 'Oferta',
            icon: <BookOutlined />,
            titulo: `${stats.planesCount ?? 0} planes`,
            valor: stats.paralelosTotal ?? 0,
            detalle: `${stats.ofertados ?? 0} OFERTADO · ${stats.publicados ?? 0} PUBLICADO`,
          })
        : null}

      {!isDashboard && step >= 1
        ? sidebarCard(gradients.gradientInfo, {
            etiqueta: 'Plan habilitado',
            icon: <BookOutlined />,
            titulo: planLabel,
            valor: kpis.planesHabilitados ?? kpis.total ?? 0,
            detalle:
              step >= 2
                ? `${kpis.ofertados ?? 0} OFERTADO · ${kpis.publicados ?? 0} PUBLICADO`
                : `${kpis.planesHabilitados ?? 0} plan(es) en la gestión`,
          })
        : null}

      {!isDashboard &&
      step >= 2 &&
      (kpis.listosOfertado > 0 || kpis.ofertados > 0 || kpis.publicados > 0)
        ? sidebarCard(gradients.gradientSuccess, {
            etiqueta: 'Avance oferta',
            icon: <CheckCircleOutlined />,
            titulo: 'Paralelos listos',
            valor: kpis.listosOfertado + kpis.ofertados + (kpis.publicados ?? 0),
            detalle:
              (kpis.publicados ?? 0) > 0
                ? `${kpis.publicados} PUBLICADO — armado en lectura`
                : `${kpis.ofertados} OFERTADO — siga en horarios`,
          })
        : null}

      {isDashboard && (stats.borrador > 0 || stats.ofertados > 0) ? (
        sidebarCard(gradients.gradientSuccess, {
          etiqueta: 'Pendientes',
          icon: <CheckCircleOutlined />,
          titulo: `${stats.borrador ?? 0} en borrador`,
          valor: stats.ofertados ?? 0,
          detalle: 'Listos para pasar a OFERTADO',
        })
      ) : null}
    </Flex>
  );
};

export default OfertaSidebarResumen;

// ✅ Bugs corregidos: (ninguno)
// ✅ Mejoras aplicadas: titulo como Text; valor con fontSizeHeading3 (30px)
